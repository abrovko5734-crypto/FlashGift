(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  var app = document.getElementById('app');

  var CUSTOM = false;
  function zeus(cls) {
    if (CUSTOM) return '<img class="zeus ' + (cls || '') + '" src="/mascot.png" alt="">';
    return '<svg class="zeus ' + (cls || '') + '" viewBox="0 0 120 120"><defs>' +
      '<linearGradient id="zf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b0"/><stop offset="1" stop-color="#ffb347"/></linearGradient>' +
      '<radialGradient id="zc" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d9e4f5"/></radialGradient>' +
      '<linearGradient id="zb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd21f"/><stop offset="1" stop-color="#ff8a00"/></linearGradient></defs>' +
      '<circle cx="60" cy="64" r="52" fill="#ff8a00" opacity=".2"/>' +
      '<g fill="url(#zc)"><circle cx="32" cy="40" r="14"/><circle cx="48" cy="28" r="16"/><circle cx="72" cy="28" r="16"/><circle cx="88" cy="40" r="14"/></g>' +
      '<ellipse cx="60" cy="58" rx="30" ry="28" fill="url(#zf)"/>' +
      '<g fill="url(#zc)"><circle cx="36" cy="82" r="13"/><circle cx="50" cy="92" r="15"/><circle cx="70" cy="92" r="15"/><circle cx="84" cy="82" r="13"/><circle cx="60" cy="82" r="13"/></g>' +
      '<path d="M44 78Q60 90 76 78Q60 83 44 78Z" fill="#7a2a05"/><path d="M46 77Q60 88 74 77" fill="none" stroke="#7a2a05" stroke-width="3" stroke-linecap="round"/>' +
      '<g fill="url(#zc)"><ellipse cx="50" cy="71" rx="11" ry="5.5"/><ellipse cx="70" cy="71" rx="11" ry="5.5"/></g>' +
      '<ellipse cx="60" cy="64" rx="5" ry="4" fill="#f09a4d"/>' +
      '<ellipse cx="47" cy="55" rx="7" ry="8.5" fill="#fff"/><ellipse cx="73" cy="55" rx="7" ry="8.5" fill="#fff"/>' +
      '<circle cx="49" cy="56" r="3.6" fill="#2a1700"/><circle cx="71" cy="56" r="3.6" fill="#2a1700"/><circle cx="50" cy="54.5" r="1.2" fill="#fff"/><circle cx="72" cy="54.5" r="1.2" fill="#fff"/>' +
      '<g fill="url(#zc)"><ellipse cx="45" cy="44" rx="10" ry="4.5" transform="rotate(-12 45 44)"/><ellipse cx="75" cy="44" rx="10" ry="4.5" transform="rotate(12 75 44)"/></g>' +
      '<path d="M32 38Q60 24 88 38" fill="none" stroke="#ffc21a" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M63 4 49 26h10l-5 15 19-23H62z" fill="url(#zb)" stroke="#c46500" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  }

  if (!tg || !tg.initData) {
    app.innerHTML = '<div class="stub">' + zeus() + '<h1>FlashGift</h1><p>Откройте приложение через Telegram</p></div>';
    return;
  }

  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#120d07');
    tg.setBackgroundColor('#120d07');
    tg.disableVerticalSwipes();
  } catch (e) {}

  var BD = [['#ff9a3c', '#ffd75e'], ['#ff5e62', '#ff9966'], ['#7f5af0', '#b794f6'], ['#0ea5e9', '#2563eb'], ['#11998e', '#38ef7d'], ['#f857a6', '#ff5858'], ['#f59e0b', '#b45309'], ['#64748b', '#1e293b'], ['#14b8a6', '#0f766e'], ['#e879f9', '#7c3aed']];
  var SY = ['⚡', '☁️', '✨', '🔥', '❄️', '🌟'];
  var TITLES = ['Новичок', 'Искра', 'Гроза', 'Шторм', 'Громовержец', 'Олимпиец', 'Титан', 'Бог грома'];

  var S = { me: null, cat: null, tab: 'home', page: 'home', off: null, caseId: null, cnt: 1, side: 'heads', color: 'red', up: null, upm: 2, mines: 3, bet: 100, chist: [], risk: 'mid', dir: 'under', target: 50, ct: [], by: 'won' };
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var fmt = function (n) { return Math.floor(n).toLocaleString('ru-RU'); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var rint = function (n) { return Math.floor(Math.random() * n); };

  function hap(t) { try { tg.HapticFeedback.impactOccurred(t || 'light'); } catch (e) {} }
  function note(t) { try { tg.HapticFeedback.notificationOccurred(t); } catch (e) {} }

  function toast(m) {
    var d = document.createElement('div');
    d.className = 'toast';
    d.textContent = m;
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 2300);
  }

  function confetti() {
    var c = document.createElement('canvas');
    c.className = 'cf';
    c.width = innerWidth;
    c.height = innerHeight;
    document.body.appendChild(c);
    var x = c.getContext('2d');
    var cols = ['#ff8a00', '#ffc21a', '#fff4e0', '#ff5a3c'];
    var ps = [];
    for (var i = 0; i < 100; i++) ps.push({ x: innerWidth / 2, y: innerHeight * 0.6, vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 15 - 4, s: 5 + Math.random() * 5, c: cols[rint(4)], r: Math.random() * 6 });
    var t = 0;
    (function f() {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.45; p.r += 0.2;
        x.fillStyle = p.c;
        x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); x.restore();
      });
      if (++t < 100) requestAnimationFrame(f); else c.remove();
    })();
  }

  function api(action, body) {
    return fetch('/api/' + action, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-init-data': tg.initData },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return { error: 'Ошибка' }; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || 'Ошибка');
        if (j.me) { S.me = j.me; paintBal(); }
        if (j.catalog) S.cat = j.catalog;
        if (j.bot) S.bot = j.bot;
        return j;
      });
    });
  }

  function act(action, body) {
    return api(action, body).catch(function (e) { toast(e.message); note('error'); throw e; });
  }

  function paintBal() {
    var b = $('#bal');
    if (b) b.textContent = fmt(S.me.balance);
  }

  function avatar(p) {
    var l = esc((p.name || '?').charAt(0).toUpperCase());
    return '<div class="av">' + (p.photo ? '<img src="' + esc(p.photo) + '" onerror="this.remove()">' : l) + '</div>';
  }

  function gift(i) {
    var b = BD[i.bd % BD.length] || BD[0];
    var s = SY[(i.sy || 0) % SY.length];
    var pat = new Array(60).join(s + ' ');
    return '<div class="cell gift t-' + i.tier + '" data-u="' + (i.uid || '') + '" style="background:linear-gradient(160deg,' + b[0] + ',' + b[1] + ')"><span class="pat">' + pat + '</span>' +
      (i.no ? '<span class="no">#' + i.no + '</span>' : '') + '<span class="ic">' + i.icon + '</span><small>' + fmt(i.value) + '</small></div>';
  }
  function sample(i) { return { tier: i.tier, icon: i.icon, value: i.value, bd: rint(10), sy: rint(6) }; }

  function modal(html) {
    var m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = '<div class="box">' + html + '</div>';
    document.body.appendChild(m);
    return m;
  }

  function shell() {
    app.innerHTML =
      '<div class="shell"><div class="hdr"><div class="brand"><span style="width:34px;height:34px;display:block">' + zeus() + '</span><span>FlashGift</span></div>' +
      '<div class="bal"><span style="width:18px;height:18px;display:block">⚡</span><span id="bal">' + fmt(S.me.balance) + '</span></div></div>' +
      '<main id="view"></main></div><div class="nav">' +
      [['home', '🎮', 'Игры'], ['inv', '🎒', 'Предметы'], ['quests', '📜', 'Задания'], ['top', '🏆', 'Топ'], ['me', '👤', 'Профиль']]
        .map(function (t) { return '<button data-t="' + t[0] + '"><i>' + t[1] + '</i>' + t[2] + '</button>'; }).join('') + '</div>';
    $$('.nav button').forEach(function (b) {
      b.onclick = function () { hap(); S.tab = b.dataset.t; go(S.tab); };
    });
  }

  function go(page) {
    if (S.off) { S.off(); S.off = null; }
    S.page = page;
    $$('.nav button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === S.tab); });
    ({ home: pHome, cases: pCases, crash: pCrash, roulette: pRoulette, mines: pMines, upgrade: pUpgrade, flip: pFlip, dice: pDice, plinko: pPlinko, wheel: pWheel, contract: pContract, inv: pInv, quests: pQuests, top: pTop, me: pMe })[page]();
    window.scrollTo(0, 0);
  }

  function backBtn() { return '<button class="back" id="back">← Назад</button>'; }
  function bindBack() { $('#back').onclick = function () { S.tab = 'home'; go('home'); }; }

  function betBox() {
    return '<div class="bet"><p class="lbl">Ставка</p><div class="betrow"><input id="bet" type="number" inputmode="numeric" min="10" value="' + S.bet +
      '"><button data-b="half">½</button><button data-b="dbl">×2</button><button data-b="max">MAX</button></div></div>';
  }
  function bindBet() {
    $$('[data-b]').forEach(function (b) {
      b.onclick = function () {
        var i = $('#bet'), v = Number(i.value) || 0;
        if (b.dataset.b === 'half') v = Math.floor(v / 2);
        if (b.dataset.b === 'dbl') v = v * 2;
        if (b.dataset.b === 'max') v = Math.min(S.me.balance, 100000);
        i.value = Math.max(10, v);
        hap();
      };
    });
  }
  function getBet() { var v = Math.floor(Number($('#bet').value) || 0); S.bet = v; return v; }
  function winFx(p, bet) { if (p >= bet * 3) { confetti(); note('success'); } else if (p > 0) note('success'); else note('error'); }
  function levelTitle(l) { return TITLES[Math.min(TITLES.length - 1, Math.floor((l - 1) / 3))]; }

  function pHome() {
    var m = S.me;
    var modes = [
      ['cases', '📦', 'Кейсы', 'Подарки с редкостью'],
      ['crash', '🚀', 'Краш', 'Лови икс'],
      ['plinko', '🔮', 'Плинко', 'Шарик и множители'],
      ['dice', '🎲', 'Дайс', 'Сам задай шанс'],
      ['mines', '💣', 'Мины', 'Открывай клетки'],
      ['roulette', '🎡', 'Рулетка', 'Красное или чёрное'],
      ['upgrade', '⬆️', 'Апгрейд', 'Умножай подарки'],
      ['contract', '📑', 'Контракт', 'Обмен 3–10 подарков'],
      ['flip', '🪙', 'Монетка', 'Орёл или решка'],
      ['wheel', '🎁', 'Колесо', 'Бесплатно раз в сутки']
    ];
    var pct = Math.min(100, Math.round(m.xpCur / m.xpNeed * 100));
    $('#view').innerHTML =
      '<div class="hero">' + zeus() + '<div class="grow"><b>' + esc(m.name) + '</b><span class="pill">' + levelTitle(m.level) + ' · ур. ' + m.level + '</span>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div><small class="mut">' + fmt(m.xpCur) + ' / ' + fmt(m.xpNeed) + ' XP</small></div></div>' +
      '<div class="quick"><button class="btn alt" id="qb">🎁 Бонус' + (m.bonusIn ? '' : '<i class="dot"></i>') + '</button><button class="btn alt" data-m="wheel">🎡 Колесо' + (m.wheelIn ? '' : '<i class="dot"></i>') + '</button></div>' +
      '<div class="grid">' + modes.map(function (x) {
        return '<button class="mode" data-m="' + x[0] + '"><i>' + x[1] + '</i><b>' + x[2] + '</b><small>' + x[3] + '</small></button>';
      }).join('') + '</div><h2 style="margin-top:20px">Последние выигрыши</h2><div class="card list" id="feed"><div class="skel"></div></div>';
    $$('[data-m]').forEach(function (b) { b.onclick = function () { hap(); go(b.dataset.m); }; });
    $('#qb').onclick = function () {
      act('bonus').then(function () { note('success'); toast('+500'); pHome(); }).catch(function () {});
    };
    api('top', { by: 'won' }).then(function (r) {
      var f = $('#feed');
      if (!f || S.page !== 'home') return;
      f.innerHTML = r.feed.length ? r.feed.map(function (e) {
        return '<div class="item"><div class="grow"><b>' + esc(e.n) + '</b><small class="mut">' + esc(e.mode) + ' · ставка ' + fmt(e.bet) + '</small></div><b class="ok">+' + fmt(e.payout) + '</b></div>';
      }).join('') : '<div class="empty">' + zeus() + 'Пока тихо. Стань первым, кого заметит Зевсик</div>';
    }).catch(function () {});
  }

  function pCases() {
    var cs = S.cat.cases;
    var c = cs.find(function (x) { return x.id === S.caseId; }) || cs[0];
    S.caseId = c.id;
    var total = c.price * S.cnt;
    $('#view').innerHTML = backBtn() + '<h2>Кейсы</h2>' +
      '<div class="cases">' + cs.map(function (x) {
        return '<button class="cs' + (x.id === c.id ? ' on' : '') + '" data-c="' + x.id + '"><i>📦</i><b>' + x.name + '</b><small>' + fmt(x.price) + '</small></button>';
      }).join('') + '</div>' +
      '<div class="win"><div class="strip" id="strip"></div></div>' +
      '<div class="chips">' + [1, 2, 3, 5].map(function (n) { return '<button class="chip' + (n === S.cnt ? ' on' : '') + '" data-n="' + n + '">×' + n + '</button>'; }).join('') + '</div>' +
      '<button class="btn" id="open">Открыть за ' + fmt(total) + '</button>' +
      '<h2 style="margin-top:20px">Что внутри</h2><div class="drops">' + c.items.map(function (i) {
        return gift(sample(i)).replace('</div>', '<small>' + i.chance.toFixed(1) + '%</small></div>');
      }).join('') + '</div>';
    bindBack();
    $$('.cs').forEach(function (b) { b.onclick = function () { hap(); S.caseId = b.dataset.c; pCases(); }; });
    $$('[data-n]').forEach(function (b) { b.onclick = function () { hap(); S.cnt = Number(b.dataset.n); pCases(); }; });
    idleStrip(c);
    $('#open').onclick = function () { openCase(c); };
  }

  function idleStrip(c) {
    var st = $('#strip');
    var h = '';
    for (var i = 0; i < 20; i++) h += gift(sample(c.items[rint(c.items.length)]));
    st.innerHTML = h;
    st.style.transition = 'none';
    st.style.transform = 'translateX(0)';
  }

  function openCase(c) {
    var btn = $('#open');
    btn.disabled = true;
    act('open', { id: c.id, count: S.cnt }).then(function (r) {
      var show = r.items[0];
      var st = $('#strip');
      var idx = 34, h = '';
      for (var i = 0; i < 44; i++) h += gift(i === idx ? show : sample(c.items[rint(c.items.length)]));
      st.innerHTML = h;
      st.style.transition = 'none';
      st.style.transform = 'translateX(0)';
      var w = $('.win').clientWidth;
      var target = idx * 96 + 44 - w / 2 + (Math.random() * 40 - 20);
      void st.offsetWidth;
      st.style.transition = 'transform 4s cubic-bezier(.12,.7,.1,1)';
      st.style.transform = 'translateX(' + (-target) + 'px)';
      var tick = setInterval(function () { hap('light'); }, 260);
      setTimeout(function () { clearInterval(tick); }, 3600);
      return wait(4300).then(function () { return r; });
    }).then(function (r) {
      var sum = r.items.reduce(function (a, i) { return a + i.value; }, 0);
      winFx(sum, c.price * S.cnt);
      var m = modal('<h2 class="center">Выпало</h2><div class="drops">' + r.items.map(gift).join('') + '</div><p class="center" style="margin:14px 0">Стоимость: <b>' + fmt(sum) + '</b></p>' +
        '<div class="row"><button class="btn alt" id="keep">Оставить</button><button class="btn" id="sellw">Продать</button></div>');
      $('#keep').onclick = function () { m.remove(); };
      $('#sellw').onclick = function () {
        act('sell', { uids: r.items.map(function (i) { return i.uid; }) }).then(function () { m.remove(); toast('+' + fmt(sum)); });
      };
      btn.disabled = false;
    }).catch(function () { btn.disabled = false; });
  }

  function pCrash() {
    var running = false, raf = 0, poll = 0, t0 = 0, busy = false;
    $('#view').innerHTML = backBtn() + '<h2>Краш</h2>' +
      '<div class="crashbox" id="cb"><div class="big" id="mult">1.00x</div><div class="mut" id="cst">Сделайте ставку</div></div>' +
      '<div class="hist" id="ch">' + S.chist.map(function (h) { return '<span class="' + (h.w ? 'w' : 'l') + '">' + h.m.toFixed(2) + 'x</span>'; }).join('') + '</div>' +
      betBox() + '<p class="lbl">Автовывод (необязательно)</p><div class="bet"><div class="betrow"><input id="auto" type="number" step="0.1" min="1.01" placeholder="например 2.00"></div></div>' +
      '<button class="btn" id="go">Играть</button>';
    bindBack();
    bindBet();
    var btn = $('#go');
    S.off = function () { running = false; clearInterval(poll); cancelAnimationFrame(raf); };
    function setBtn(m) {
      btn.disabled = false;
      btn.textContent = m === 'cash' ? 'Забрать' : 'Играть';
      btn.className = m === 'cash' ? 'btn red' : 'btn';
    }
    function loop() {
      if (!running) return;
      var m = Math.exp(0.12 * (performance.now() - t0) / 1000);
      $('#mult').textContent = m.toFixed(2) + 'x';
      raf = requestAnimationFrame(loop);
    }
    function begin(el) {
      t0 = performance.now() - el;
      running = true;
      $('#cb').className = 'crashbox';
      $('#cst').textContent = 'Ставка ' + fmt(S.me.crash ? S.me.crash.bet : 0);
      setBtn('cash');
      loop();
      poll = setInterval(function () {
        api('crash_state').then(function (r) { if (r.status !== 'running') end(r); }).catch(function () {});
      }, 400);
    }
    function end(r) {
      running = false;
      clearInterval(poll);
      cancelAnimationFrame(raf);
      var w = r.status === 'win';
      $('#mult').textContent = r.mult.toFixed(2) + 'x';
      $('#cb').className = 'crashbox ' + (w ? 'win' : 'lose');
      $('#cst').textContent = w ? 'Выигрыш +' + fmt(r.payout) : 'Краш на ' + r.cp.toFixed(2) + 'x';
      winFx(w ? r.payout : 0, w ? r.payout / r.mult : 1);
      S.chist.unshift({ m: r.mult, w: w });
      S.chist = S.chist.slice(0, 20);
      var h = $('#ch');
      if (h) h.innerHTML = S.chist.map(function (x) { return '<span class="' + (x.w ? 'w' : 'l') + '">' + x.m.toFixed(2) + 'x</span>'; }).join('');
      setBtn('start');
    }
    btn.onclick = function () {
      if (busy) return;
      busy = true;
      hap('medium');
      if (running) {
        act('crash_cash').then(end).catch(function () {}).then(function () { busy = false; });
      } else {
        btn.disabled = true;
        act('crash_start', { bet: getBet(), auto: $('#auto').value }).then(function () { begin(0); }).catch(function () { btn.disabled = false; }).then(function () { busy = false; });
      }
    };
    if (S.me.crash) begin(S.me.crash.elapsed);
  }

  function pRoulette() {
    var order = [];
    for (var i = 0; i < 15; i++) order.push(i);
    $('#view').innerHTML = backBtn() + '<h2>Рулетка</h2>' +
      '<div class="rl" id="rl">' + order.map(function (n) { return '<div class="' + (n === 0 ? 'green' : n <= 7 ? 'red' : 'black') + '">' + n + '</div>'; }).join('') + '</div>' +
      '<div class="cols">' + [['red', 'Красное', 'x2'], ['green', 'Зелёное', 'x14'], ['black', 'Чёрное', 'x2']].map(function (c) {
        return '<button class="col ' + c[0] + (S.color === c[0] ? ' on' : '') + '" data-c="' + c[0] + '">' + c[1] + '<small>' + c[2] + '</small></button>';
      }).join('') + '</div>' + betBox() + '<button class="btn" id="go">Крутить</button><p class="center mut" id="rs" style="margin-top:14px"></p>';
    bindBack();
    bindBet();
    $$('.col').forEach(function (b) { b.onclick = function () { hap(); S.color = b.dataset.c; $$('.col').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    $('#go').onclick = function () {
      var btn = $('#go');
      btn.disabled = true;
      var bet = getBet();
      act('roulette', { bet: bet, color: S.color }).then(function (r) {
        var cells = $$('#rl div');
        var steps = 24 + r.n;
        var p = Promise.resolve();
        for (var s = 0; s <= steps; s++) (function (s) {
          p = p.then(function () {
            cells.forEach(function (c) { c.classList.remove('hit'); });
            cells[s % 15].classList.add('hit');
            hap('light');
            return wait(40 + s * 6);
          });
        })(s);
        return p.then(function () {
          $('#rs').innerHTML = r.win ? '<b class="ok">Выигрыш +' + fmt(r.payout) + '</b>' : '<b class="bad">Не повезло</b>';
          winFx(r.payout, bet);
        });
      }).catch(function () {}).then(function () { btn.disabled = false; });
    };
  }

  function pFlip() {
    $('#view').innerHTML = backBtn() + '<h2>Монетка</h2><div class="coin" id="coin">⚡</div><p class="center mut" id="fs">Выберите сторону</p>' +
      '<div class="chips" style="justify-content:center">' +
      '<button class="chip' + (S.side === 'heads' ? ' on' : '') + '" data-s="heads">Орёл ⚡</button><button class="chip' + (S.side === 'tails' ? ' on' : '') + '" data-s="tails">Решка 🔥</button></div>' +
      betBox() + '<button class="btn" id="go">Бросить · x2</button>';
    bindBack();
    bindBet();
    $$('[data-s]').forEach(function (b) { b.onclick = function () { hap(); S.side = b.dataset.s; $$('[data-s]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    $('#go').onclick = function () {
      var btn = $('#go');
      btn.disabled = true;
      var bet = getBet();
      act('flip', { bet: bet, side: S.side }).then(function (r) {
        var c = $('#coin');
        c.classList.remove('spin');
        void c.offsetWidth;
        c.classList.add('spin');
        return wait(1000).then(function () {
          c.textContent = r.result === 'heads' ? '⚡' : '🔥';
          $('#fs').innerHTML = (r.result === 'heads' ? 'Орёл' : 'Решка') + ' — ' + (r.win ? '<b class="ok">+' + fmt(r.payout) + '</b>' : '<b class="bad">проигрыш</b>');
          winFx(r.payout, bet);
        });
      }).catch(function () {}).then(function () { btn.disabled = false; });
    };
  }

  function pDice() {
    $('#view').innerHTML = backBtn() + '<h2>Дайс</h2>' +
      '<div class="card center"><div class="big" id="dr">--.--</div><div class="track" id="tk"><i id="mk" style="left:50%"></i></div><div class="mut" id="di"></div></div>' +
      '<div class="chips" style="justify-content:center"><button class="chip" data-d="under">Меньше</button><button class="chip" data-d="over">Больше</button></div>' +
      '<input type="range" id="tg" min="2" max="98" value="' + S.target + '">' + betBox() + '<button class="btn" id="go">Бросить</button>';
    bindBack();
    bindBet();
    function upd() {
      var t = Number($('#tg').value);
      S.target = t;
      var ch = S.dir === 'under' ? t : 100 - t;
      var ml = 96 / ch;
      $$('[data-d]').forEach(function (b) { b.classList.toggle('on', b.dataset.d === S.dir); });
      $('#tk').style.setProperty('--p', (S.dir === 'under' ? t : 100 - t) + '%');
      $('#tk').style.background = S.dir === 'under' ? 'linear-gradient(90deg,#3ddc84 ' + t + '%,#ff4d4d ' + t + '%)' : 'linear-gradient(90deg,#ff4d4d ' + t + '%,#3ddc84 ' + t + '%)';
      $('#di').innerHTML = (S.dir === 'under' ? 'Выпадет меньше ' + t : 'Выпадет ' + t + ' или больше') + ' · шанс <b>' + ch + '%</b> · x<b>' + ml.toFixed(2) + '</b>';
    }
    $$('[data-d]').forEach(function (b) { b.onclick = function () { hap(); S.dir = b.dataset.d; upd(); }; });
    $('#tg').oninput = upd;
    upd();
    $('#go').onclick = function () {
      var btn = $('#go');
      btn.disabled = true;
      var bet = getBet();
      act('dice', { bet: bet, target: S.target, dir: S.dir }).then(function (r) {
        $('#mk').style.left = r.roll + '%';
        return wait(950).then(function () {
          $('#dr').textContent = r.roll.toFixed(2);
          $('#dr').style.color = r.win ? 'var(--g)' : 'var(--r)';
          winFx(r.payout, bet);
        });
      }).catch(function () {}).then(function () { btn.disabled = false; });
    };
  }

  function pPlinko() {
    var W = 320, H = 320, DX = 26, DY = 24, CX = 160;
    $('#view').innerHTML = backBtn() + '<h2>Плинко</h2><canvas id="pc" class="pc" width="' + W + '" height="' + H + '"></canvas>' +
      '<div class="chips" style="justify-content:center">' + [['low', 'Низкий'], ['mid', 'Средний'], ['high', 'Высокий']].map(function (r) { return '<button class="chip' + (S.risk === r[0] ? ' on' : '') + '" data-r="' + r[0] + '">' + r[1] + '</button>'; }).join('') + '</div>' +
      betBox() + '<button class="btn" id="go">Бросить шарик</button>';
    bindBack();
    bindBet();
    var cv = $('#pc'), ctx = cv.getContext('2d'), hit = -1;
    function draw(b) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#ffc21a';
      for (var i = 0; i < 10; i++) for (var j = 0; j <= i; j++) {
        ctx.beginPath();
        ctx.arc(CX + (j - i / 2) * DX, 30 + i * DY, 3, 0, 7);
        ctx.fill();
      }
      var tb = S.cat.plinko[S.risk];
      for (var k = 0; k < 11; k++) {
        var x = CX + (k - 5) * DX;
        var m = tb[k];
        ctx.fillStyle = k === hit ? '#fff' : m >= 2 ? '#ff6a1a' : m >= 1 ? '#e0a010' : '#5a4122';
        ctx.fillRect(x - 12, 276, 24, 24);
        ctx.fillStyle = k === hit ? '#2a1700' : '#fff4e0';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m >= 10 ? Math.round(m) : m, x, 292);
      }
      if (b) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 7, 0, 7);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#ff8a00';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    draw();
    $$('[data-r]').forEach(function (b) { b.onclick = function () { hap(); S.risk = b.dataset.r; hit = -1; $$('[data-r]').forEach(function (x) { x.classList.toggle('on', x === b); }); draw(); }; });
    $('#go').onclick = function () {
      var btn = $('#go');
      btn.disabled = true;
      hit = -1;
      var bet = getBet();
      act('plinko', { bet: bet, risk: S.risk }).then(function (r) {
        var pts = [{ x: CX, y: 18 }], ones = 0;
        for (var k = 1; k <= 10; k++) {
          ones += r.path[k - 1];
          pts.push({ x: CX + (ones - k / 2) * DX, y: 30 + k * DY - 10 });
        }
        var p = Promise.resolve();
        for (var s = 0; s < 10; s++) (function (s) {
          p = p.then(function () {
            return new Promise(function (res) {
              var t0 = performance.now();
              (function f(t) {
                var u = Math.min(1, (t - t0) / 130);
                draw({ x: pts[s].x + (pts[s + 1].x - pts[s].x) * u, y: pts[s].y + (pts[s + 1].y - pts[s].y) * u });
                if (u < 1) requestAnimationFrame(f); else { hap('light'); res(); }
              })(t0);
            });
          });
        })(s);
        return p.then(function () {
          hit = r.bucket;
          draw();
          toast(r.payout >= bet ? 'x' + r.mult + ' · +' + fmt(r.payout - bet) : 'x' + r.mult + ' · −' + fmt(bet - r.payout));
          winFx(r.payout, bet);
        });
      }).catch(function () {}).then(function () { btn.disabled = false; });
    };
  }

  function pWheel() {
    var pr = S.cat.wheel, n = pr.length, seg = 360 / n;
    var cols = ['#ff8a00', '#ffc21a'];
    var grad = pr.map(function (_, i) { return cols[i % 2] + ' ' + (i * seg) + 'deg ' + ((i + 1) * seg) + 'deg'; }).join(',');
    var ready = S.me.wheelIn === 0;
    $('#view').innerHTML = backBtn() + '<h2>Колесо Зевса</h2><div class="wheelw"><div class="wheel" id="wh" style="background:conic-gradient(' + grad + ')">' +
      pr.map(function (v, i) { return '<span style="transform:rotate(' + ((i + 0.5) * seg) + 'deg) translate(-50%,-108px)">' + fmt(v) + '</span>'; }).join('') +
      '</div><div class="hub">' + zeus() + '</div></div>' +
      '<button class="btn" id="go"' + (ready ? '' : ' disabled') + '>' + (ready ? 'Крутить бесплатно' : 'Следующая попытка через ' + Math.ceil(S.me.wheelIn / 3600000) + ' ч') + '</button>';
    bindBack();
    $('#go').onclick = function () {
      var btn = $('#go');
      btn.disabled = true;
      act('wheel').then(function (r) {
        var wh = $('#wh');
        wh.style.transform = 'rotate(' + (360 * 6 - (r.idx + 0.5) * seg) + 'deg)';
        var tick = setInterval(function () { hap('light'); }, 280);
        return wait(4800).then(function () {
          clearInterval(tick);
          confetti();
          note('success');
          toast('+' + fmt(r.prize));
          btn.textContent = 'Приходи завтра';
        });
      }).catch(function () { btn.disabled = false; });
    };
  }

  function pMines() {
    var g = S.me.mines;
    var html = backBtn() + '<h2>Мины</h2>';
    if (!g) {
      html += '<div class="mg">' + Array.apply(null, Array(25)).map(function () { return '<button disabled></button>'; }).join('') + '</div>' +
        betBox() + '<p class="lbl">Количество мин</p><div class="chips">' + [1, 3, 5, 10, 24].map(function (n) { return '<button class="chip' + (n === S.mines ? ' on' : '') + '" data-mn="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
        '<button class="btn" id="go">Начать</button>';
    } else {
      html += '<div class="mg" id="mg">' + Array.apply(null, Array(25)).map(function (_, i) {
        var o = g.picked.indexOf(i) >= 0;
        return '<button data-i="' + i + '"' + (o ? ' class="ok" disabled' : '') + '>' + (o ? '⚡' : '') + '</button>';
      }).join('') + '</div><div class="card row sp"><div><small class="mut">Сейчас</small><b style="display:block;font-size:20px">x' + g.mult.toFixed(2) + '</b></div><div><small class="mut">Следующий</small><b style="display:block;font-size:20px">x' + g.next.toFixed(2) + '</b></div></div>' +
        '<button class="btn" id="cash"' + (g.picked.length ? '' : ' disabled') + '>Забрать ' + fmt(g.bet * g.mult) + '</button>';
    }
    $('#view').innerHTML = html;
    bindBack();
    if (!g) {
      bindBet();
      $$('[data-mn]').forEach(function (b) { b.onclick = function () { hap(); S.mines = Number(b.dataset.mn); $$('[data-mn]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
      $('#go').onclick = function () { act('mines_start', { bet: getBet(), mines: S.mines }).then(function () { pMines(); }).catch(function () {}); };
      return;
    }
    var lock = false;
    function reveal(r) {
      $$('#mg button').forEach(function (b) {
        var i = Number(b.dataset.i);
        b.disabled = true;
        if (r.mines.indexOf(i) >= 0) { b.className = 'bm' + (r.cell === i ? '' : ' ghost'); b.textContent = '💣'; }
      });
      var c = $('#cash');
      c.textContent = 'Новая игра';
      c.disabled = false;
      c.onclick = function () { pMines(); };
    }
    $$('#mg button').forEach(function (b) {
      b.onclick = function () {
        if (lock) return;
        lock = true;
        hap();
        act('mines_pick', { cell: Number(b.dataset.i) }).then(function (r) {
          if (r.boom) { note('error'); reveal(r); toast('Мина!'); return; }
          if (r.done) { confetti(); note('success'); toast('+' + fmt(r.payout)); pMines(); return; }
          pMines();
        }).catch(function () {}).then(function () { lock = false; });
      };
    });
    $('#cash').onclick = function () {
      act('mines_cash').then(function (r) { note('success'); toast('+' + fmt(r.payout)); pMines(); }).catch(function () {});
    };
  }

  function pUpgrade() {
    var items = S.me.items.slice().sort(function (a, b) { return b.value - a.value; });
    if (!items.some(function (i) { return i.uid === S.up; })) S.up = items[0] ? items[0].uid : null;
    var it = items.find(function (i) { return i.uid === S.up; });
    var chance = it ? 0.92 / S.upm * 100 : 0;
    $('#view').innerHTML = backBtn() + '<h2>Апгрейд</h2>' +
      (items.length ? '<div class="inv" style="margin-bottom:14px">' + items.slice(0, 30).map(function (i) {
        return gift(i).replace('class="cell', 'class="cell' + (i.uid === S.up ? ' sel2' : ''));
      }).join('') + '</div>' : '<div class="card empty">' + zeus() + 'Нет подарков. Открой кейс</div>') +
      '<div class="chips">' + [1.5, 2, 3, 5, 10].map(function (m) { return '<button class="chip' + (m === S.upm ? ' on' : '') + '" data-m="' + m + '">x' + m + '</button>'; }).join('') + '</div>' +
      '<div class="card center"><div class="mut">Шанс успеха</div><div class="big" style="font-size:44px">' + chance.toFixed(1) + '%</div>' +
      (it ? '<div class="mut">Выигрыш: ' + fmt(it.value * S.upm) + '</div>' : '') + '</div>' +
      '<button class="btn" id="go"' + (it ? '' : ' disabled') + '>Улучшить</button>';
    bindBack();
    $$('[data-u]').forEach(function (b) { b.onclick = function () { hap(); S.up = b.dataset.u; pUpgrade(); }; });
    $$('[data-m]').forEach(function (b) { b.onclick = function () { hap(); S.upm = Number(b.dataset.m); pUpgrade(); }; });
    var go = $('#go');
    go.onclick = function () {
      go.disabled = true;
      act('upgrade', { uid: S.up, mult: S.upm }).then(function (r) {
        if (r.win) confetti();
        note(r.win ? 'success' : 'error');
        var m = modal('<div class="center"><div class="big">' + (r.win ? '✅' : '💥') + '</div><h2>' + (r.win ? 'Успех! +' + fmt(r.payout) : 'Подарок потерян') + '</h2><button class="btn" id="okb">Ок</button></div>');
        $('#okb').onclick = function () { m.remove(); pUpgrade(); };
      }).catch(function () { go.disabled = false; });
    };
  }

  function pContract() {
    var items = S.me.items.slice().sort(function (a, b) { return b.value - a.value; });
    S.ct = S.ct.filter(function (u) { return items.some(function (i) { return i.uid === u; }); });
    var sum = items.filter(function (i) { return S.ct.indexOf(i.uid) >= 0; }).reduce(function (a, i) { return a + i.value; }, 0);
    $('#view').innerHTML = backBtn() + '<h2>Контракт</h2><div class="card center"><div class="mut">Выбрано ' + S.ct.length + ' из 10 · стоимость ' + fmt(sum) + '</div>' +
      '<div class="mut" style="margin-top:4px">Шанс улучшить: 38% · при неудаче вернётся слабый подарок</div></div>' +
      (items.length ? '<div class="inv" style="margin-bottom:14px">' + items.map(function (i) {
        return gift(i).replace('class="cell', 'class="cell' + (S.ct.indexOf(i.uid) >= 0 ? ' sel2' : ''));
      }).join('') + '</div>' : '<div class="card empty">' + zeus() + 'Нужно минимум 3 подарка</div>') +
      '<button class="btn" id="go"' + (S.ct.length >= 3 ? '' : ' disabled') + '>Подписать контракт</button>';
    bindBack();
    $$('[data-u]').forEach(function (b) {
      b.onclick = function () {
        hap();
        var u = b.dataset.u, k = S.ct.indexOf(u);
        if (k >= 0) S.ct.splice(k, 1); else if (S.ct.length < 10) S.ct.push(u);
        pContract();
      };
    });
    $('#go').onclick = function () {
      $('#go').disabled = true;
      act('contract', { uids: S.ct }).then(function (r) {
        S.ct = [];
        if (r.win) confetti();
        note(r.win ? 'success' : 'error');
        var m = modal('<h2 class="center">' + (r.win ? 'Контракт удался' : 'Контракт не удался') + '</h2><div class="drops" style="grid-template-columns:1fr;max-width:120px;margin:0 auto">' + gift(r.item) + '</div><p class="center mut">' + esc(r.item.name) + ' · ' + esc(r.item.label) + '</p><button class="btn" id="okb">Ок</button>');
        $('#okb').onclick = function () { m.remove(); pContract(); };
      }).catch(function () { $('#go').disabled = false; });
    };
  }

  function pInv() {
    var items = S.me.items.slice().sort(function (a, b) { return b.value - a.value; });
    var sum = items.reduce(function (a, i) { return a + i.value; }, 0);
    $('#view').innerHTML = '<h2>Мои подарки · ' + items.length + '</h2>' + (items.length ?
      '<button class="btn" id="sa" style="margin-bottom:12px">Продать всё за ' + fmt(sum) + '</button><div class="inv">' + items.map(gift).join('') + '</div>' :
      '<div class="card empty">' + zeus() + 'Здесь пока пусто. Открой кейс, и подарки появятся тут</div>');
    if (!items.length) return;
    $('#sa').onclick = function () { act('sell', { all: true }).then(function (r) { toast('+' + fmt(r.sold)); pInv(); }).catch(function () {}); };
    $$('[data-u]').forEach(function (b) {
      b.onclick = function () {
        var i = items.find(function (x) { return x.uid === b.dataset.u; });
        var m = modal('<div class="drops" style="grid-template-columns:1fr;max-width:130px;margin:0 auto 12px">' + gift(i) + '</div><h2 class="center">' + esc(i.name) + '</h2><p class="mut center">' + esc(i.label) + ' · кейс «' + esc(i.c) + '» · ' + fmt(i.value) + '</p>' +
          '<div class="row"><button class="btn alt" id="cl">Закрыть</button><button class="btn" id="sl">Продать</button></div>');
        $('#cl').onclick = function () { m.remove(); };
        $('#sl').onclick = function () { act('sell', { uids: [i.uid] }).then(function () { m.remove(); pInv(); }).catch(function () {}); };
      };
    });
  }

  function pQuests() {
    var m = S.me;
    $('#view').innerHTML = '<h2>Задания на сегодня</h2><div class="card">' + m.q.map(function (q) {
      return '<div class="prog"><div class="grow"><b>' + q.t + '</b><div class="bar"><i style="width:' + Math.round(q.p / q.n * 100) + '%"></i></div><small class="mut">' + fmt(q.p) + ' / ' + fmt(q.n) + '</small></div>' +
        '<button class="btn sm" data-q="' + q.id + '"' + (q.done && !q.claimed ? '' : ' disabled') + '>' + (q.claimed ? '✓' : '+' + q.r) + '</button></div>';
    }).join('') + '</div><h2>Достижения</h2><div class="card">' + m.ach.map(function (a) {
      return '<div class="prog"><div class="grow"><b>' + a.t + '</b><small class="mut">награда ' + fmt(a.r) + '</small></div>' +
        '<button class="btn sm" data-a="' + a.id + '"' + (a.done && !a.claimed ? '' : ' disabled') + '>' + (a.claimed ? '✓' : a.done ? 'Забрать' : '🔒') + '</button></div>';
    }).join('') + '</div>';
    $$('[data-q]').forEach(function (b) { b.onclick = function () { act('quest_claim', { id: b.dataset.q }).then(function () { note('success'); pQuests(); }).catch(function () {}); }; });
    $$('[data-a]').forEach(function (b) { b.onclick = function () { act('ach_claim', { id: b.dataset.a }).then(function () { confetti(); note('success'); pQuests(); }).catch(function () {}); }; });
  }

  function pTop() {
    $('#view').innerHTML = '<h2>Топ игроков</h2><div class="tabs"><button data-by="won" class="' + (S.by === 'won' ? 'on' : '') + '">По выигрышу</button><button data-by="xp" class="' + (S.by === 'xp' ? 'on' : '') + '">По уровню</button></div><div class="card list" id="tl"><div class="skel"></div><div class="skel"></div></div>';
    $$('[data-by]').forEach(function (b) { b.onclick = function () { hap(); S.by = b.dataset.by; pTop(); }; });
    api('top', { by: S.by }).then(function (r) {
      var t = $('#tl');
      if (!t || S.page !== 'top') return;
      t.innerHTML = '<p class="mut" style="margin:0 0 6px">Игроков: ' + fmt(r.players) + '</p>' + (r.top.length ? r.top.map(function (p) {
        return '<div class="item"><div class="rk">' + (p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : p.rank) + '</div>' + avatar(p) +
          '<div class="grow"><b>' + esc(p.name) + '</b><small class="mut">ур. ' + p.level + ' · игр ' + fmt(p.games) + ' · рекорд +' + fmt(p.best) + '</small></div><b style="color:var(--y)">' + (S.by === 'xp' ? 'ур. ' + p.level : fmt(p.won)) + '</b></div>';
      }).join('') : '<div class="empty">' + zeus() + 'Пока никого нет</div>');
    }).catch(function () {});
  }

  function pMe() {
    var m = S.me;
    var wr = m.games ? Math.round(m.wins / m.games * 100) : 0;
    var hrs = Math.ceil(m.bonusIn / 3600000);
    var pct = Math.min(100, Math.round(m.xpCur / m.xpNeed * 100));
    var link = 'https://t.me/' + (S.bot || 'FlashGift_bot') + '?start=ref_' + m.id;
    $('#view').innerHTML = '<div class="hero">' + zeus() + '<div class="grow"><b>' + esc(m.name) + '</b><span class="pill">' + levelTitle(m.level) + ' · ур. ' + m.level + '</span><div class="bar"><i style="width:' + pct + '%"></i></div><small class="mut">' + (m.username ? '@' + esc(m.username) : 'ID ' + m.id) + '</small></div></div>' +
      '<div class="stats"><div><small>Баланс</small><b>' + fmt(m.balance) + '</b></div><div><small>Игр</small><b>' + fmt(m.games) + '</b></div>' +
      '<div><small>Винрейт</small><b>' + wr + '%</b></div><div><small>Лучший выигрыш</small><b>+' + fmt(m.best) + '</b></div>' +
      '<div><small>Поставлено</small><b>' + fmt(m.wagered) + '</b></div><div><small>Выиграно</small><b>' + fmt(m.won) + '</b></div></div>' +
      '<button class="btn" id="bn" style="margin:14px 0"' + (m.bonusIn ? ' disabled' : '') + '>' + (m.bonusIn ? 'Бонус через ' + hrs + ' ч' : 'Ежедневный бонус · 500') + '</button>' +
      '<div class="card"><b>Позови друзей</b><p class="mut" style="margin:6px 0 10px">+300 тебе и другу. Приглашено: ' + m.refs + '</p><div class="refbox"><input id="rl" readonly value="' + esc(link) + '"><button class="btn sm" id="sh">Поделиться</button></div></div>';
    $('#bn').onclick = function () { act('bonus').then(function () { note('success'); toast('+500'); pMe(); }).catch(function () {}); };
    $('#sh').onclick = function () {
      try { tg.openTelegramLink('https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent('Заходи в FlashGift: Зевсик раздаёт подарки')); } catch (e) { toast('Скопируй ссылку'); }
    };
  }

  function takeRef() {
    var code = new URLSearchParams(location.search).get('ref');
    var sp = tg.initDataUnsafe && tg.initDataUnsafe.start_param;
    if (!code && sp && /^ref_\d+$/.test(sp)) code = sp.slice(4);
    if (code && !S.me.hasRef) api('ref', { code: code }).then(function () { toast('+300 за приглашение'); paintBal(); }).catch(function () {});
  }

  var probe = new Image();
  var started = false;
  function start() {
    if (started) return;
    started = true;
    api('me').then(function () { shell(); takeRef(); go('home'); }).catch(fail);
  }
  function fail(e) {
    app.innerHTML = '<div class="stub">' + zeus() + '<h1>FlashGift</h1><p>' + esc(e.message) + '</p></div>';
  }
  probe.onload = function () { CUSTOM = true; start(); };
  probe.onerror = start;
  probe.src = '/mascot.png';
})();
