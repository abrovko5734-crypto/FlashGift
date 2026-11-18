const crypto = require('crypto');

const R = 140737488355328;
const rnd = () => crypto.randomInt(0, R) / R;
const E = (m, s) => Object.assign(new Error(m), { status: s || 400 });
const K = 0.12;

const TIERS = [
  { id: 'spark', name: 'Искра', icon: '✨', base: 20, w: 50 },
  { id: 'charge', name: 'Заряд', icon: '🔋', base: 60, w: 28 },
  { id: 'bolt', name: 'Разряд', icon: '⚡', base: 100, w: 12 },
  { id: 'cube', name: 'Грозовой куб', icon: '🧊', base: 250, w: 6 },
  { id: 'gold', name: 'Золотая молния', icon: '🏆', base: 800, w: 3.4 },
  { id: 'crown', name: 'Корона шторма', icon: '👑', base: 3000, w: 0.4 }
];

const CASES = [
  { id: 'spark', name: 'Искровой', mult: 1 },
  { id: 'storm', name: 'Штормовой', mult: 5 },
  { id: 'thunder', name: 'Громовой', mult: 20 },
  { id: 'zeus', name: 'Зевс', mult: 100 }
].map(c => ({ ...c, price: 100 * c.mult }));

const TW = TIERS.reduce((a, t) => a + t.w, 0);

const catalog = () => ({
  cases: CASES.map(c => ({
    id: c.id,
    name: c.name,
    price: c.price,
    items: TIERS.map(t => ({
      tier: t.id,
      name: t.name,
      icon: t.icon,
      value: t.base * c.mult,
      chance: (t.w / TW) * 100
    }))
  }))
});

const pickTier = () => {
  let r = rnd() * TW;
  for (const t of TIERS) if ((r -= t.w) < 0) return t;
  return TIERS[0];
};

const minesMult = (k, mc) => {
  let m = 0.92;
  for (let i = 0; i < k; i++) m *= (25 - i) / (25 - mc - i);
  return m;
};

const checkBet = (u, b) => {
  b = Math.floor(Number(b));
  if (!(b >= 10 && b <= 100000)) throw E('Ставка от 10 до 100 000');
  if (b > u.balance) throw E('Недостаточно средств');
  return b;
};

const record = (u, bet, payout, mode, ev) => {
  u.wagered += bet;
  u.won += payout;
  u.games++;
  if (payout > bet) u.wins++;
  const p = payout - bet;
  if (p > u.best) u.best = p;
  if (p >= 1000 && payout >= bet * 3) ev.push({ n: u.name, mode, bet, payout, t: Date.now() });
};

const newUser = t => ({
  id: t.id,
  name: [t.first_name, t.last_name].filter(Boolean).join(' ') || t.username || 'Игрок',
  username: t.username || '',
  photo: t.photo_url || '',
  balance: 1000,
  wagered: 0,
  won: 0,
  games: 0,
  wins: 0,
  best: 0,
  items: [],
  bonusAt: 0,
  created: Date.now(),
  crash: null,
  mines: null
});

const view = (u, now) => ({
  id: u.id,
  name: u.name,
  username: u.username,
  photo: u.photo,
  balance: u.balance,
  wagered: u.wagered,
  won: u.won,
  games: u.games,
  wins: u.wins,
  best: u.best,
  created: u.created,
  items: u.items,
  bonusIn: Math.max(0, u.bonusAt + 86400000 - now),
  crash: u.crash ? { bet: u.crash.bet, auto: u.crash.auto, elapsed: now - u.crash.start } : null,
  mines: u.mines
    ? {
        bet: u.mines.bet,
        mc: u.mines.mc,
        picked: u.mines.picked,
        mult: minesMult(u.mines.picked.length, u.mines.mc),
        next: minesMult(u.mines.picked.length + 1, u.mines.mc)
      }
    : null
});

const settleCrash = (u, ev, now) => {
  const s = u.crash;
  if (!s) return null;
  const m = Math.exp((K * (now - s.start)) / 1000);
  let out = null;
  if (s.auto >= 1.01 && s.auto < s.cp && m >= s.auto) out = { status: 'win', mult: s.auto };
  else if (m >= s.cp) out = { status: 'lose', mult: s.cp };
  if (!out) return null;
  const payout = out.status === 'win' ? Math.floor(s.bet * out.mult) : 0;
  u.balance += payout;
  record(u, s.bet, payout, 'Краш', ev);
  u.crash = null;
  return { status: out.status, mult: out.mult, cp: s.cp, payout };
};

const actions = {
  me: () => ({ catalog: catalog() }),

  bonus: (u, b, c) => {
    if (c.now - u.bonusAt < 86400000) throw E('Бонус пока недоступен');
    u.bonusAt = c.now;
    u.balance += 500;
    return { added: 500 };
  },

  open: (u, b, c) => {
    const cs = CASES.find(x => x.id === b.id);
    if (!cs) throw E('Кейс не найден');
    const n = Math.min(5, Math.max(1, Math.floor(Number(b.count) || 1)));
    const cost = cs.price * n;
    if (u.balance < cost) throw E('Недостаточно средств');
    if (u.items.length + n > 300) throw E('Инвентарь переполнен');
    u.balance -= cost;
    const got = [];
    for (let i = 0; i < n; i++) {
      const t = pickTier();
      const it = {
        uid: crypto.randomBytes(6).toString('hex'),
        tier: t.id,
        name: t.name,
        icon: t.icon,
        value: t.base * cs.mult,
        c: cs.name
      };
      u.items.push(it);
      got.push(it);
    }
    record(u, cost, got.reduce((a, i) => a + i.value, 0), 'Кейсы', c.ev);
    return { items: got };
  },

  sell: (u, b) => {
    const set = b.all ? null : new Set(Array.isArray(b.uids) ? b.uids : []);
    let sum = 0;
    u.items = u.items.filter(i => {
      if (!set || set.has(i.uid)) {
        sum += i.value;
        return false;
      }
      return true;
    });
    u.balance += sum;
    return { sold: sum };
  },

  crash_start: (u, b, c) => {
    if (u.crash) throw E('Игра уже идёт');
    const bet = checkBet(u, b.bet);
    const a = Number(b.auto);
    const r = rnd();
    const cp = Math.min(500, Math.max(1, Math.floor(92 / (1 - r)) / 100));
    u.balance -= bet;
    u.crash = { bet, cp, start: c.now, auto: a >= 1.01 ? Math.floor(a * 100) / 100 : 0 };
    return { started: true };
  },

  crash_state: (u, b, c) => {
    if (c.pre) return c.pre;
    if (!u.crash) return { status: 'none' };
    return { status: 'running' };
  },

  crash_cash: (u, b, c) => {
    if (c.pre) return c.pre;
    const s = u.crash;
    if (!s) throw E('Нет активной игры');
    const m = Math.floor(Math.exp((K * (c.now - s.start)) / 1000) * 100) / 100;
    const payout = Math.floor(s.bet * m);
    u.balance += payout;
    record(u, s.bet, payout, 'Краш', c.ev);
    u.crash = null;
    return { status: 'win', mult: m, cp: s.cp, payout };
  },

  roulette: (u, b, c) => {
    if (!['red', 'black', 'green'].includes(b.color)) throw E('Неверный цвет');
    const bet = checkBet(u, b.bet);
    const n = crypto.randomInt(0, 15);
    const color = n === 0 ? 'green' : n <= 7 ? 'red' : 'black';
    const win = color === b.color;
    const payout = win ? bet * (color === 'green' ? 14 : 2) : 0;
    u.balance += payout - bet;
    record(u, bet, payout, 'Рулетка', c.ev);
    return { n, color, win, payout };
  },

  flip: (u, b, c) => {
    if (!['heads', 'tails'].includes(b.side)) throw E('Неверная сторона');
    const bet = checkBet(u, b.bet);
    const win = rnd() < 0.485;
    const result = win ? b.side : b.side === 'heads' ? 'tails' : 'heads';
    const payout = win ? bet * 2 : 0;
    u.balance += payout - bet;
    record(u, bet, payout, 'Монетка', c.ev);
    return { win, result, payout };
  },

  upgrade: (u, b, c) => {
    const mult = Number(b.mult);
    if (![1.5, 2, 3, 5, 10].includes(mult)) throw E('Неверный множитель');
    const i = u.items.findIndex(x => x.uid === b.uid);
    if (i < 0) throw E('Предмет не найден');
    const it = u.items[i];
    u.items.splice(i, 1);
    const chance = 0.92 / mult;
    const roll = rnd();
    const win = roll < chance;
    const payout = win ? Math.floor(it.value * mult) : 0;
    u.balance += payout;
    record(u, it.value, payout, 'Апгрейд', c.ev);
    return { win, chance, roll, payout, item: it };
  },

  mines_start: (u, b) => {
    if (u.mines) throw E('Игра уже идёт');
    const bet = checkBet(u, b.bet);
    const mc = Math.floor(Number(b.mines));
    if (!(mc >= 1 && mc <= 24)) throw E('Мин от 1 до 24');
    const cells = Array.from({ length: 25 }, (_, i) => i);
    for (let i = 24; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    u.balance -= bet;
    u.mines = { bet, mc, mines: cells.slice(0, mc), picked: [] };
    return { started: true };
  },

  mines_pick: (u, b, c) => {
    const g = u.mines;
    if (!g) throw E('Нет активной игры');
    const cell = Math.floor(Number(b.cell));
    if (!(cell >= 0 && cell < 25) || g.picked.includes(cell)) throw E('Неверная клетка');
    if (g.mines.includes(cell)) {
      record(u, g.bet, 0, 'Мины', c.ev);
      u.mines = null;
      return { boom: true, cell, mines: g.mines };
    }
    g.picked.push(cell);
    if (g.picked.length === 25 - g.mc) {
      const payout = Math.floor(g.bet * minesMult(g.picked.length, g.mc));
      u.balance += payout;
      record(u, g.bet, payout, 'Мины', c.ev);
      u.mines = null;
      return { done: true, payout, mines: g.mines, picked: g.picked };
    }
    return { safe: true, cell };
  },

  mines_cash: (u, b, c) => {
    const g = u.mines;
    if (!g) throw E('Нет активной игры');
    if (!g.picked.length) throw E('Откройте хотя бы одну клетку');
    const payout = Math.floor(g.bet * minesMult(g.picked.length, g.mc));
    u.balance += payout;
    record(u, g.bet, payout, 'Мины', c.ev);
    u.mines = null;
    return { done: true, payout, mines: g.mines, picked: g.picked };
  }
};

module.exports = { actions, newUser, view, settleCrash, catalog, E, TIERS, CASES };
