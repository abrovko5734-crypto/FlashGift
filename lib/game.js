const crypto = require('crypto');

const R = 140737488355328;
const rnd = () => crypto.randomInt(0, R) / R;
const int = (a, b) => crypto.randomInt(a, b);
const E = (m, s) => Object.assign(new Error(m), { status: s || 400 });
const K = 0.12;
const DAY = 86400000;

const TIERS = [
  { id: 'spark', label: 'Обычный', base: 20, w: 50, gifts: [['Искорка', '✨'], ['Капля дождя', '💧'], ['Перо облака', '🪶']] },
  { id: 'charge', label: 'Необычный', base: 60, w: 28, gifts: [['Батарея грома', '🔋'], ['Лунный амулет', '🌙'], ['Бронзовый жетон', '🪙']] },
  { id: 'bolt', label: 'Редкий', base: 100, w: 12, gifts: [['Разряд Олимпа', '⚡'], ['Громовой шлем', '🪖'], ['Эгида', '🛡️']] },
  { id: 'cube', label: 'Эпический', base: 250, w: 6, gifts: [['Грозовой куб', '🧊'], ['Кристалл бури', '🔮'], ['Амфора теней', '🏺']] },
  { id: 'gold', label: 'Легендарный', base: 800, w: 3.4, gifts: [['Золотая молния', '🏆'], ['Лавровый венец', '🌿'], ['Кубок богов', '🥇']] },
  { id: 'crown', label: 'Мифический', base: 3000, w: 0.4, gifts: [['Корона шторма', '👑'], ['Трон Олимпа', '🏛️'], ['Орёл Зевса', '🦅']] }
];

const CASES = [
  { id: 'spark', name: 'Искровой', mult: 1 },
  { id: 'storm', name: 'Штормовой', mult: 5 },
  { id: 'thunder', name: 'Громовой', mult: 20 },
  { id: 'zeus', name: 'Зевс', mult: 100 }
].map(c => ({ ...c, price: 100 * c.mult }));

const TW = TIERS.reduce((a, t) => a + t.w, 0);

const RAW = {
  low: [4, 2, 1.4, 1.1, 0.9, 0.7, 0.9, 1.1, 1.4, 2, 4],
  mid: [10, 3.5, 1.6, 1, 0.6, 0.4, 0.6, 1, 1.6, 3.5, 10],
  high: [40, 8, 2.4, 0.7, 0.3, 0.2, 0.3, 0.7, 2.4, 8, 40]
};
const BIN = [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1];
const PLINKO = {};
Object.keys(RAW).forEach(k => {
  const rtp = RAW[k].reduce((a, m, i) => a + m * BIN[i], 0) / 1024;
  PLINKO[k] = RAW[k].map(m => Math.round(m * (0.96 / rtp) * 100) / 100);
});

const WHEEL = [
  { v: 25, w: 30 },
  { v: 50, w: 28 },
  { v: 100, w: 20 },
  { v: 250, w: 12 },
  { v: 500, w: 6 },
  { v: 1500, w: 3.5 },
  { v: 5000, w: 0.5 }
];

const QUESTS = [
  { id: 'g10', t: 'Сыграть 10 раз', k: 'games', n: 10, r: 200 },
  { id: 'w5000', t: 'Поставить 5 000', k: 'wager', n: 5000, r: 300 },
  { id: 'c3', t: 'Открыть 3 кейса', k: 'cases', n: 3, r: 250 },
  { id: 'win5', t: 'Выиграть 5 раз', k: 'wins', n: 5, r: 300 }
];

const lvl = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
const xpAt = l => 40 * (l - 1) * (l - 1);

const ACH = [
  { id: 'g10', t: 'Первые шаги: 10 игр', r: 100, f: u => u.games >= 10 },
  { id: 'g100', t: 'Завсегдатай: 100 игр', r: 500, f: u => u.games >= 100 },
  { id: 'g1000', t: 'Легенда: 1000 игр', r: 5000, f: u => u.games >= 1000 },
  { id: 'b1000', t: 'Крупный куш: +1 000 за раз', r: 300, f: u => u.best >= 1000 },
  { id: 'b10000', t: 'Удар молнии: +10 000 за раз', r: 2000, f: u => u.best >= 10000 },
  { id: 'l5', t: 'Уровень 5', r: 500, f: u => lvl(u.xp) >= 5 },
  { id: 'l10', t: 'Уровень 10', r: 2000, f: u => lvl(u.xp) >= 10 },
  { id: 'inv10', t: 'Коллекционер: 10 подарков', r: 300, f: u => u.items.length >= 10 },
  { id: 'ref3', t: 'Позвать 3 друзей', r: 600, f: u => u.refs >= 3 },
  { id: 'w100k', t: 'Поставить 100 000', r: 1500, f: u => u.wagered >= 100000 }
];

const POOL = [];
CASES.forEach(c => TIERS.forEach(t => POOL.push({ t, c, v: t.base * c.mult })));
const nearest = v => POOL.reduce((a, b) => (Math.abs(b.v - v) < Math.abs(a.v - v) ? b : a));

const catalog = () => ({
  cases: CASES.map(c => ({
    id: c.id,
    name: c.name,
    price: c.price,
    items: TIERS.map(t => ({
      tier: t.id,
      label: t.label,
      name: t.gifts[0][0],
      icon: t.gifts[0][1],
      value: t.base * c.mult,
      chance: (t.w / TW) * 100
    }))
  })),
  plinko: PLINKO,
  wheel: WHEEL.map(x => x.v),
  tiers: TIERS.map(t => ({ id: t.id, label: t.label }))
});

const pickTier = () => {
  let r = rnd() * TW;
  for (const t of TIERS) if ((r -= t.w) < 0) return t;
  return TIERS[0];
};

const mkItem = (t, mult, cname) => {
  const g = t.gifts[int(0, t.gifts.length)];
  return {
    uid: crypto.randomBytes(6).toString('hex'),
    tier: t.id,
    label: t.label,
    name: g[0],
    icon: g[1],
    value: t.base * mult,
    c: cname,
    bd: int(0, 10),
    sy: int(0, 6),
    no: int(1, 100000)
  };
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

const day = () => Math.floor(Date.now() / DAY);

const norm = u => {
  u.xp = u.xp || 0;
  u.ach = u.ach || [];
  u.wheelAt = u.wheelAt || 0;
  u.refs = u.refs || 0;
  u.ref = u.ref || null;
  if (!u.q || u.q.day !== day()) u.q = { day: day(), p: { games: 0, wager: 0, cases: 0, wins: 0 }, c: [] };
};

const record = (u, bet, payout, mode, ev, n) => {
  norm(u);
  u.wagered += bet;
  u.won += payout;
  u.games++;
  if (payout > bet) u.wins++;
  const p = payout - bet;
  if (p > u.best) u.best = p;
  u.xp += Math.max(1, Math.floor(bet / 20));
  u.q.p.games++;
  u.q.p.wager += bet;
  if (payout > bet) u.q.p.wins++;
  if (mode === 'Кейсы') u.q.p.cases += n || 1;
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
  xp: 0,
  items: [],
  bonusAt: 0,
  wheelAt: 0,
  created: Date.now(),
  crash: null,
  mines: null,
  ach: [],
  refs: 0,
  ref: null
});

const view = (u, now) => {
  norm(u);
  const l = lvl(u.xp);
  return {
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
    level: l,
    xpCur: u.xp - xpAt(l),
    xpNeed: xpAt(l + 1) - xpAt(l),
    refs: u.refs,
    hasRef: !!u.ref,
    bonusIn: Math.max(0, u.bonusAt + DAY - now),
    wheelIn: Math.max(0, u.wheelAt + DAY - now),
    q: QUESTS.map(q => ({
      id: q.id,
      t: q.t,
      n: q.n,
      r: q.r,
      p: Math.min(q.n, u.q.p[q.k]),
      done: u.q.p[q.k] >= q.n,
      claimed: u.q.c.includes(q.id)
    })),
    ach: ACH.map(a => ({ id: a.id, t: a.t, r: a.r, done: a.f(u), claimed: u.ach.includes(a.id) })),
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
  };
};

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
  me: () => ({ catalog: catalog(), bot: process.env.BOT_USERNAME || 'FlashGift_bot' }),

  bonus: (u, b, c) => {
    if (c.now - u.bonusAt < DAY) throw E('Бонус пока недоступен');
    u.bonusAt = c.now;
    u.balance += 500;
    return { added: 500 };
  },

  wheel: (u, b, c) => {
    if (c.now - u.wheelAt < DAY) throw E('Колесо пока недоступно');
    const tw = WHEEL.reduce((a, x) => a + x.w, 0);
    let r = rnd() * tw;
    let idx = 0;
    for (let i = 0; i < WHEEL.length; i++) {
      if ((r -= WHEEL[i].w) < 0) {
        idx = i;
        break;
      }
    }
    u.wheelAt = c.now;
    u.balance += WHEEL[idx].v;
    return { idx, prize: WHEEL[idx].v };
  },

  quest_claim: (u, b) => {
    const q = QUESTS.find(x => x.id === b.id);
    if (!q) throw E('Задание не найдено');
    if (u.q.c.includes(q.id)) throw E('Уже получено');
    if (u.q.p[q.k] < q.n) throw E('Задание не выполнено');
    u.q.c.push(q.id);
    u.balance += q.r;
    return { added: q.r };
  },

  ach_claim: (u, b) => {
    const a = ACH.find(x => x.id === b.id);
    if (!a) throw E('Достижение не найдено');
    if (u.ach.includes(a.id)) throw E('Уже получено');
    if (!a.f(u)) throw E('Достижение не выполнено');
    u.ach.push(a.id);
    u.balance += a.r;
    return { added: a.r };
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
      const it = mkItem(pickTier(), cs.mult, cs.name);
      u.items.push(it);
      got.push(it);
    }
    record(u, cost, got.reduce((a, i) => a + i.value, 0), 'Кейсы', c.ev, n);
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

  contract: (u, b) => {
    const ids = Array.isArray(b.uids) ? [...new Set(b.uids)] : [];
    if (ids.length < 3 || ids.length > 10) throw E('Нужно от 3 до 10 предметов');
    const picked = ids.map(id => u.items.find(i => i.uid === id));
    if (picked.some(x => !x)) throw E('Предмет не найден');
    const sum = picked.reduce((a, i) => a + i.value, 0);
    const set = new Set(ids);
    u.items = u.items.filter(i => !set.has(i.uid));
    const win = rnd() < 0.38;
    const p = nearest(sum * (win ? 2.2 : 0.18));
    const item = mkItem(p.t, p.c.mult, p.c.name);
    u.items.push(item);
    return { item, win, sum };
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
    const n = int(0, 15);
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

  dice: (u, b, c) => {
    const t = Math.floor(Number(b.target));
    if (!(t >= 2 && t <= 98)) throw E('Цель от 2 до 98');
    if (!['under', 'over'].includes(b.dir)) throw E('Неверное направление');
    const bet = checkBet(u, b.bet);
    const chance = b.dir === 'under' ? t : 100 - t;
    const roll = int(0, 10000) / 100;
    const win = b.dir === 'under' ? roll < t : roll >= t;
    const mult = 96 / chance;
    const payout = win ? Math.floor(bet * mult) : 0;
    u.balance += payout - bet;
    record(u, bet, payout, 'Дайс', c.ev);
    return { roll, win, payout, mult };
  },

  plinko: (u, b, c) => {
    if (!PLINKO[b.risk]) throw E('Неверный риск');
    const bet = checkBet(u, b.bet);
    const path = Array.from({ length: 10 }, () => int(0, 2));
    const bucket = path.reduce((a, x) => a + x, 0);
    const mult = PLINKO[b.risk][bucket];
    const payout = Math.floor(bet * mult);
    u.balance += payout - bet;
    record(u, bet, payout, 'Плинко', c.ev);
    return { path, bucket, mult, payout };
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
      const j = int(0, i + 1);
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

module.exports = { actions, newUser, view, norm, settleCrash, E, lvl, PLINKO, TIERS, CASES };
