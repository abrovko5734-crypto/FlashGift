const db = require('../lib/db');
const { verify } = require('../lib/auth');
const { actions, newUser, view, settleCrash, E } = require('../lib/game');

const send = (res, code, body) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const tgCall = (method, body) =>
  fetch('https://api.telegram.org/bot' + process.env.BOT_TOKEN + '/' + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

const bot = async (req, res) => {
  if (req.method !== 'POST') return send(res, 200, { ok: true });
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) return send(res, 403, { ok: false });
  const m = req.body && req.body.message;
  if (m && m.text && m.text.startsWith('/start')) {
    await tgCall('sendMessage', {
      chat_id: m.chat.id,
      text: '⚡ FlashGift\n\nОткрывай кейсы, лови иксы и поднимайся в топ.',
      reply_markup: {
        inline_keyboard: [[{ text: '⚡ Играть', web_app: { url: process.env.WEBAPP_URL } }]]
      }
    });
  }
  send(res, 200, { ok: true });
};

const top = async (u, c) => {
  const ids = await db.ztop('lb', 20);
  const rows = (await db.mget(ids.map(i => 'u:' + i))).filter(Boolean);
  const feed = await db.lrange('feed', 15);
  return {
    top: rows.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      username: r.username,
      photo: r.photo,
      won: r.won,
      games: r.games,
      best: r.best
    })),
    feed,
    players: await db.zcard('lb')
  };
};

module.exports = async (req, res) => {
  const action = req.query.action;
  if (action === 'bot') return bot(req, res);
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });

  const tu = verify(req.headers['x-init-data'], process.env.BOT_TOKEN);
  if (!tu) return send(res, 401, { error: 'Откройте приложение в Telegram' });
  if (action !== 'top' && !actions[action]) return send(res, 404, { error: 'Не найдено' });

  if (!(await db.lock(tu.id))) return send(res, 429, { error: 'Подождите секунду' });
  try {
    const now = Date.now();
    const key = 'u:' + tu.id;
    let u = await db.get(key);
    const fresh = !u;
    if (fresh) u = newUser(tu);
    u.name = [tu.first_name, tu.last_name].filter(Boolean).join(' ') || tu.username || u.name;
    u.username = tu.username || '';
    u.photo = tu.photo_url || u.photo || '';

    const ev = [];
    const pre = settleCrash(u, ev, now);
    const ctx = { now, ev, pre };
    const out = action === 'top' ? await top(u, ctx) : actions[action](u, req.body || {}, ctx);

    await db.set(key, u);
    await db.zadd('lb', u.won, u.id);
    for (const e of ev) await db.lpush('feed', e, 30);

    send(res, 200, { ...out, me: view(u, Date.now()), now: Date.now() });
  } catch (e) {
    send(res, e.status || 500, { error: e.status ? e.message : 'Ошибка сервера' });
  } finally {
    await db.unlock(tu.id);
  }
};
