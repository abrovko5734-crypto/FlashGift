(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  var app = document.getElementById('app');
  var BOLT = '<svg viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a00"/><stop offset="1" stop-color="#ffd21f"/></linearGradient></defs><path fill="url(#g)" d="M37 2 11 37h16l-4 25 30-39H36z"/></svg>';

  if (!tg || !tg.initData) {
    app.innerHTML = '<div class="stub">' + BOLT + '<h1>FlashGift</h1><p>Откройте приложение через Telegram</p></div>';
    return;
  }

  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#120d07');
    tg.setBackgroundColor('#120d07');
    tg.disableVerticalSwipes();
  } catch (e) {}

  var S = { me: null, cat: null, tab: 'home', page: 'home', off: null, caseId: null, cnt: 1, side: 'heads', color: 'red', up: null, upm: 2, mines: 3, bet: 100, chist: [] };
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var fmt = function (n) { return Math.floor(n).toLocaleString('ru-RU'); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function hap(t) { try { tg.HapticFeedback.impactOccurred(t || 'light'); } catch (e) {} }
  function note(t) { try { tg.HapticFeedback.notificationOccurred(t); } catch (e) {} }

  function toast(m) {
    var d = document.createElement('div');
    d.className = 'toast';
    d.textContent = m;
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 2200);
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

  function shell() {
    app.innerHTML =
      '<div class="shell"><div class="hdr"><div class="brand">' + BOLT + '<span>FlashGift</span></div>' +
      '<div class="bal">' + BOLT + '<span id="bal">' + fmt(S.me.balance) + '</span></div></div>' +
      '<main id="view"></main></div>' +
      '<div class="nav">' +
      [['home', '🎮', 'Игры'], ['inv', '🎒', 'Инвентарь'], ['top', '🏆', 'Топ'], ['me', '👤', 'Профиль']]
        .map(function (t) { return '<button data-t="' + t[0] + '"><i>' + t[1] + '</i>' + t[2] + '</button>'; }).join('') +
      '</div>';
    $$('.nav button').forEach(function (b) {
      b.onclick = function () { hap(); S.tab = b.dataset.t; go(S.tab); };
    });
  }

  function go(page) {
    if (S.off) { S.off(); S.off = null; }
    S.page = page;
    $$('.nav button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === S.tab); });
    ({ home: pHome, cases: pCases, crash: pCrash, roulette: pRoulette, mines: pMines, upgrade: pUpgrade, flip: pFlip, inv: pInv, top: pTop, me: pMe })[page]();
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

  function pHome() {
    var modes = [
      ['cases', '📦', 'Кейсы', 'Выбивай подарки'],
      ['crash', '🚀', 'Краш', 'Лови икс'],
      ['roulette', '🎡', 'Рулетка', 'Красное или чёрное'],
      ['mines', '💣', 'Мины', 'Открывай клетки'],
      ['upgrade', '⬆️', 'Апгрейд', 'Умножай предметы'],
      ['flip', '🪙', 'Монетка', 'Орёл или решка']
    ];
    $('#view').innerHTML =
      '<div class="grid">' + modes.map(function (m) {
        return '<button class="mode" data-m="' + m[0] + '"><i>' + m[1] + '</i><b>' + m[2] + '</b><small>' + m[3] + '</small></button>';
      }).join('') + '</div><h2 style="margin-top:20px">Последние выигрыши</h2><div class="card list" id="feed"><p class="mut center">Загрузка…</p></div>';
    $$('.mode').forEach(function (b) { b.onclick = function () { hap(); go(b.dataset.m); }; });
    api('top').then(function (r) {
      var f = $('#feed');
      if (!f || S.page !== 'home') return;
      f.innerHTML = r.feed.length ? r.feed.map(function (e) {
        return '<div class="item"><div class="grow"><b>' + esc(e.n) + '</b><small class="mut">' + esc(e.mode) + ' · ставка ' + fmt(e.bet) + '</small></div><b class="ok">+' + fmt(e.payout) + '</b></div>';
      }).join('') : '<p class="mut center">Пока пусто — стань первым</p>';
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
        return '<div class="cell t-' + i.tier + '">' + i.icon + '<small>' + fmt(i.value) + '</small><small>' + i.chance.toFixed(1) + '%</small></div>';
      }).join('') + '</div>';
    bindBack();
    $$('.cs').forEach(function (b) { b.onclick = function () { hap(); S.caseId = b.dataset.c; pCases(); }; });
    $$('[data-n]').forEach(function (b) { b.onclick = function () { hap(); S.cnt = Number(b.dataset.n); pCases(); }; });
    idleStrip(c);
    $('#open').onclick = function () { openCase(c); };
  }

  function cellHtml(i) { return '<div class="cell t-' + i.tier + '">' + i.icon + '<small>' + fmt(i.value) + '</small></div>'; }

  function idleStrip(c) {
    var st = $('#strip');
    var h = '';
    for (var i = 0; i < 20; i++) h += cellHtml(c.items[Math.floor(Math.random() * c.items.length)]);
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
      for (var i = 0; i < 44; i++) {
        var it = i === idx ? show : c.items[Math.floor(Math.random() * c.items.length)];
        h += cellHtml(it);
      }
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
      note('success');
      var sum = r.items.reduce(function (a, i) { return a + i.value; }, 0);
      var m = document.createElement('div');
      m.className = 'modal';
      m.innerHTML = '<div class="box"><h2 class="center">Выпало</h2><div class="drops">' + r.items.map(cellHtml).join('') +
        '</div><p class="center" style="margin:14px 0">Стоимость: <b>' + fmt(sum) + '</b></p>' +
        '<div class="row"><button class="btn alt" id="keep">Оставить</button><button class="btn" id="sellw">Продать</button></div></div>';
      document.body.appendChild(m);
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
      note(w ? 'success' : 'error');
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
      '<div class="rl" id="rl">' + order.map(function (n) { return '<div class="' + (n === 0 ? 'green' : n <= 7 ? 'red' : 'black') + '" data-n="' + n + '">' + n + '</div>'; }).join('') + '</div>' +
      '<div class="cols">' + [['red', 'Красное', 'x2'], ['green', 'Зелёное', 'x14'], ['black', 'Чёрное', 'x2']].map(function (c) {
        return '<button class="col ' + c[0] + (S.color === c[0] ? ' on' : '') + '" data-c="' + c[0] + '">' + c[1] + '<small>' + c[2] + '</small></button>';
      }).join('') + '</div>' + betBox() + '<button class="btn" id="go">Крутить</button><p class="center mut" id="rs" style="margin-top:14px"></p>';
    bindBack();
    bindBet();
    $$('.col').forEach(function (b) { b.onclick = function () { hap(); S.color = b.dataset.c; $$('.col').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    $('#go').onclick = function () {
      var btn = $('#go');
      btn.disabled = true;
      act('roulette', { bet: getBet(), color: S.color }).then(function (r) {
        var cells = $$('#rl div');
        var steps = 24 + r.n;
        var p = Promise.resolve();
        var cur = 0;
        for (var s = 0; s <= steps; s++) (function (s) {
          p = p.then(function () {
            cells.forEach(function (c) { c.classList.remove('hit'); });
            cur = s % 15;
            cells[cur].classList.add('hit');
            hap('light');
            return wait(40 + s * 6);
          });
        })(s);
        return p.then(function () {
          cells.forEach(function (c) { c.classList.remove('hit'); });
          cells[r.n].classList.add('hit');
          $('#rs').innerHTML = r.win ? '<b class="ok">Выигрыш +' + fmt(r.payout) + '</b>' : '<b class="bad">Не повезло</b>';
          note(r.win ? 'success' : 'error');
        });
      }).catch(function () {}).then(function () { btn.disabled = false; });
    };
  }

  function pFlip() {
    $('#view').innerHTML = backBtn() + '<h2>Монетка</h2><div class="coin" id="coin">⚡</div><p class="center mut" id="fs">Выберите сторону</p>' +
      '<div class="chips" style="justify-content:center">' +
      '<button class="chip' + (S.side === 'heads' ? ' on' : '') + '" data-s="heads">Орёл</button><button class="chip' + (S.side === 'tails' ? ' on' : '') + '" data-s="tails">Решка</button></div>' +
      betBox() + '<button class="btn" id="go">Бросить · x2</button>';
    bindBack();
    bindBet();
    $$('[data-s]').forEach(function (b) { b.onclick = function () { hap(); S.side = b.dataset.s; $$('[data-s]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    $('#go').onclick = function () {
      var btn = $('#go');
      btn.disabled = true;
      act('flip', { bet: getBet(), side: S.side }).then(function (r) {
        var c = $('#coin');
        c.classList.remove('spin');
        void c.offsetWidth;
        c.classList.add('spin');
        return wait(1000).then(function () {
          c.textContent = r.result === 'heads' ? '⚡' : '🔥';
          $('#fs').innerHTML = (r.result === 'heads' ? 'Орёл' : 'Решка') + ' — ' + (r.win ? '<b class="ok">+' + fmt(r.payout) + '</b>' : '<b class="bad">проигрыш</b>');
          note(r.win ? 'success' : 'error');
        });
      }).catch(function () {}).then(function () { btn.disabled = false; });
    };
  }

  function pMines() {
    var g = S.me.mines;
    var html = backBtn() + '<h2>Мины</h2>';
    if (!g) {
      html += '<div class="mg" id="mg">' + Array.apply(null, Array(25)).map(function () { return '<button disabled></button>'; }).join('') + '</div>' +
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
          if (r.done) { note('success'); toast('+' + fmt(r.payout)); pMines(); return; }
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
        return '<div class="cell t-' + i.tier + (i.uid === S.up ? ' sel' : '') + '" data-u="' + i.uid + '">' + i.icon + '<small>' + fmt(i.value) + '</small></div>';
      }).join('') + '</div>' : '<div class="card center mut">Нет предметов — откройте кейс</div>') +
      '<div class="chips">' + [1.5, 2, 3, 5, 10].map(function (m) { return '<button class="chip' + (m === S.upm ? ' on' : '') + '" data-m="' + m + '">x' + m + '</button>'; }).join('') + '</div>' +
      '<div class="card center" id="ur"><div class="mut">Шанс успеха</div><div class="big" style="font-size:44px">' + chance.toFixed(1) + '%</div>' +
      (it ? '<div class="mut">Выигрыш: ' + fmt(it.value * S.upm) + '</div>' : '') + '</div>' +
      '<button class="btn" id="go"' + (it ? '' : ' disabled') + '>Улучшить</button>';
    bindBack();
    $$('[data-u]').forEach(function (b) { b.onclick = function () { hap(); S.up = b.dataset.u; pUpgrade(); }; });
    $$('[data-m]').forEach(function (b) { b.onclick = function () { hap(); S.upm = Number(b.dataset.m); pUpgrade(); }; });
    var go = $('#go');
    go.onclick = function () {
      go.disabled = true;
      act('upgrade', { uid: S.up, mult: S.upm }).then(function (r) {
        note(r.win ? 'success' : 'error');
        var m = document.createElement('div');
        m.className = 'modal';
        m.innerHTML = '<div class="box center"><div class="big">' + (r.win ? '✅' : '💥') + '</div><h2>' + (r.win ? 'Успех! +' + fmt(r.payout) : 'Предмет потерян') + '</h2><button class="btn" id="okb">Ок</button></div>';
        document.body.appendChild(m);
        $('#okb').onclick = function () { m.remove(); pUpgrade(); };
      }).catch(function () { go.disabled = false; });
    };
  }

  function pInv() {
    var items = S.me.items.slice().sort(function (a, b) { return b.value - a.value; });
    var sum = items.reduce(function (a, i) { return a + i.value; }, 0);
    $('#view').innerHTML = '<h2>Инвентарь</h2>' + (items.length ?
      '<button class="btn" id="sa" style="margin-bottom:12px">Продать всё за ' + fmt(sum) + '</button><div class="inv">' + items.map(function (i) {
        return '<div class="cell t-' + i.tier + '" data-u="' + i.uid + '">' + i.icon + '<small>' + esc(i.name) + '</small><small>' + fmt(i.value) + '</small></div>';
      }).join('') + '</div>' : '<div class="card center mut">Здесь пока пусто</div>');
    if (!items.length) return;
    $('#sa').onclick = function () { act('sell', { all: true }).then(function (r) { toast('+' + fmt(r.sold)); pInv(); }).catch(function () {}); };
    $$('[data-u]').forEach(function (b) {
      b.onclick = function () {
        var i = items.find(function (x) { return x.uid === b.dataset.u; });
        var m = document.createElement('div');
        m.className = 'modal';
        m.innerHTML = '<div class="box center"><div class="big">' + i.icon + '</div><h2>' + esc(i.name) + '</h2><p class="mut">' + esc(i.c) + ' · ' + fmt(i.value) + '</p><div class="row"><button class="btn alt" id="cl">Закрыть</button><button class="btn" id="sl">Продать</button></div></div>';
        document.body.appendChild(m);
        $('#cl').onclick = function () { m.remove(); };
        $('#sl').onclick = function () { act('sell', { uids: [i.uid] }).then(function () { m.remove(); pInv(); }).catch(function () {}); };
      };
    });
  }

  function pTop() {
    $('#view').innerHTML = '<h2>Топ игроков</h2><div class="card list" id="tl"><p class="mut center">Загрузка…</p></div>';
    api('top').then(function (r) {
      var t = $('#tl');
      if (!t || S.page !== 'top') return;
      t.innerHTML = '<p class="mut" style="margin:0 0 6px">Игроков: ' + fmt(r.players) + '</p>' + (r.top.length ? r.top.map(function (p) {
        return '<div class="item"><div class="rk">' + (p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : p.rank) + '</div>' + avatar(p) +
          '<div class="grow"><b>' + esc(p.name) + '</b><small class="mut">игр: ' + fmt(p.games) + ' · рекорд +' + fmt(p.best) + '</small></div><b style="color:var(--y)">' + fmt(p.won) + '</b></div>';
      }).join('') : '<p class="mut center">Пока никого нет</p>');
    }).catch(function () {});
  }

  function pMe() {
    var m = S.me;
    var wr = m.games ? Math.round(m.wins / m.games * 100) : 0;
    var hrs = Math.ceil(m.bonusIn / 3600000);
    $('#view').innerHTML = '<div class="card row">' + avatar(m) + '<div class="grow"><b style="font-size:18px">' + esc(m.name) + '</b><div class="mut">' + (m.username ? '@' + esc(m.username) : 'ID ' + m.id) + '</div></div></div>' +
      '<div class="stats"><div><small>Баланс</small><b>' + fmt(m.balance) + '</b></div><div><small>Игр</small><b>' + fmt(m.games) + '</b></div>' +
      '<div><small>Винрейт</small><b>' + wr + '%</b></div><div><small>Лучший выигрыш</small><b>+' + fmt(m.best) + '</b></div>' +
      '<div><small>Поставлено</small><b>' + fmt(m.wagered) + '</b></div><div><small>Выиграно</small><b>' + fmt(m.won) + '</b></div></div>' +
      '<button class="btn" id="bn" style="margin-top:14px"' + (m.bonusIn ? ' disabled' : '') + '>' + (m.bonusIn ? 'Бонус через ' + hrs + ' ч' : 'Забрать ежедневный бонус · 500') + '</button>';
    $('#bn').onclick = function () { act('bonus').then(function () { note('success'); toast('+500'); pMe(); }).catch(function () {}); };
  }

  api('me').then(function () { shell(); go('home'); }).catch(function (e) {
    app.innerHTML = '<div class="stub">' + BOLT + '<h1>FlashGift</h1><p>' + esc(e.message) + '</p></div>';
  });
})();
