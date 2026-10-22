
(function () {
  'use strict';
  var T = window.FOUR_I18N;
  var wrap = document.getElementById('calc');
  if (!T || !wrap) return;
  
  var LOAD = {
    62:265, 63:272, 64:280, 65:290, 66:300, 67:307, 68:315, 69:325, 70:335,
    71:345, 72:355, 73:365, 74:375, 75:387, 76:400, 77:412, 78:425, 79:437,
    80:450, 81:462, 82:475, 83:487, 84:500, 85:515, 86:530, 87:545, 88:560,
    89:580, 90:600, 91:615, 92:630, 93:650, 94:670, 95:690, 96:710, 97:730,
    98:750, 99:775, 100:800, 101:825, 102:850, 103:875, 104:900, 105:925,
    106:950, 107:975, 108:1000, 109:1030, 110:1060, 111:1090, 112:1120,
    113:1150, 114:1180, 115:1215, 116:1250, 117:1285, 118:1320, 119:1360,
    120:1400, 121:1450, 122:1500, 123:1550, 124:1600, 125:1650, 126:1700,
    127:1750, 128:1800, 129:1850, 130:1900
  };
  var SPEED = {
    L:120, M:130, N:140, P:150, Q:160, R:170, S:180, T:190,
    U:200, H:210, V:240, W:270, Y:300
  };
  var id = function (s) { return document.getElementById(s); };
  var nf = function (n, d) {
    return n.toLocaleString(T.locale, {
      minimumFractionDigits: d || 0, maximumFractionDigits: d || 0
    });
  };
  
  function fill(sel, values, def, blank) {
    var h = blank ? '<option value="">' + blank + '</option>' : '';
    for (var i = 0; i < values.length; i++) {
      h += '<option' + (values[i] === def ? ' selected' : '') + '>' + values[i] + '</option>';
    }
    sel.innerHTML = h;
  }
  var widths = [], ratios = [], rims = [], loads = [], speeds = [];
  for (var v = 135; v <= 345; v += 10) widths.push(v);
  for (v = 25; v <= 85; v += 5) ratios.push(v);
  for (v = 12; v <= 24; v++) rims.push(v);
  for (v = 62; v <= 130; v++) loads.push(v);
  for (var k in SPEED) speeds.push(k);
  var AX = ['f', 'r'];                      
  AX.forEach(function (ax) {
    fill(id(ax + 'W'), widths, 205);
    fill(id(ax + 'A'), ratios, 55);
    fill(id(ax + 'R'), rims, 16);
    fill(id(ax + 'L'), loads, 91, T.any);
    fill(id(ax + 'S'), speeds, 'V', T.any);
  });
  var stag = id('cStag'), elDot = id('cDot');
  var sizeText = '', dotText = '';
  function geom(ax) {
    var w = +id(ax + 'W').value, a = +id(ax + 'A').value, r = +id(ax + 'R').value;
    var li = id(ax + 'L').value ? +id(ax + 'L').value : null;
    var sp = id(ax + 'S').value || null;
    var side = w * a / 100;
    var rimMm = r * 25.4;
    var dia = rimMm + 2 * side;
    var circ = Math.PI * dia;
    return { w:w, a:a, r:r, li:li, sp:sp, side:side, rimMm:rimMm,
             dia:dia, circ:circ, revs:1000000 / circ };
  }
  function label(g) {
    return g.w + '/' + g.a + ' R' + g.r + (g.li ? ' ' + g.li : '') + (g.sp || '');
  }
  function parseDot(raw) {
    var m = (raw || '').replace(/\D/g, '');
    if (m.length !== 4) return null;
    var wk = +m.slice(0, 2), yy = +m.slice(2);
    if (wk < 1 || wk > 53) return null;
    var now = new Date(), year = 2000 + yy;
    if (year > now.getFullYear()) year -= 100;     
    var made = new Date(year, 0, 1 + (wk - 1) * 7);
    var months = (now.getFullYear() - made.getFullYear()) * 12 + (now.getMonth() - made.getMonth());
    if (months < 0) months = 0;
    return { wk:wk, year:year, years:Math.floor(months / 12), months:months % 12 };
  }
  function paintAxle(ax, g) {
    id(ax + 'Code').textContent = label(g);
    id(ax + 'Side').style.flexGrow  = String(g.side);
    id(ax + 'Rim').style.flexGrow   = String(g.rimMm);
    id(ax + 'Side2').style.flexGrow = String(g.side);
    id(ax + 'Spec').innerHTML = specs(g);
  }
  function row(k, v) { return '<li><span>' + k + '</span><b>' + v + '</b></li>'; }
  function specs(g) {
    var h = '';
    h += row(T.dia,      nf(g.dia, 0) + ' ' + T.mm + ' · ' + nf(g.dia / 25.4, 1) + '″');
    h += row(T.sidewall, nf(g.side, 0) + ' ' + T.mm);
    h += row(T.circ,     nf(g.circ, 0) + ' ' + T.mm);
    h += row(T.revs,     nf(g.revs, 0));
    if (g.li) h += row(T.load + ' ' + g.li, nf(LOAD[g.li]) + ' ' + T.kg + ' · ' + T.perSet.replace('{n}', nf(LOAD[g.li] * 4)));
    if (g.sp) h += row(T.speed + ' ' + g.sp, T.upTo.replace('{n}', nf(SPEED[g.sp])));
    return h;
  }
  function render() {
    var on = stag.checked;
    wrap.classList.toggle('stag', on);
    id('pRear').hidden = !on;
    id('pCmp').hidden = !on;
    id('cHeadF').textContent = on ? T.headFront : T.headYour;
    var gf = geom('f'), gr = geom('r');
    paintAxle('f', gf);
    if (on) paintAxle('r', gr);
    
    if (on) {
      var gap = gr.dia - gf.dia, pct = gap / gf.dia * 100;
      id('cCmp').innerHTML =
        '<div class="cc"><b>' + nf(gf.dia, 0) + ' ' + T.mm + '</b><span>' + T.fdia + '</span></div>' +
        '<div class="cc"><b>' + nf(gr.dia, 0) + ' ' + T.mm + '</b><span>' + T.rdia + '</span></div>' +
        '<div class="cc"><b>' + (gap >= 0 ? '+' : '−') + nf(Math.abs(gap), 0) + ' ' + T.mm + '</b><span>' + T.gap + '</span></div>';
      var note = id('cNote');
      note.textContent = Math.abs(pct) <= 1 ? T.matched : T.stagWarn;
      note.className = 'verdict ' + (Math.abs(pct) <= 1 ? 'ok' : 'warn');
    }
    
    var dot = parseDot(elDot.value);
    if (dot) {
      id('cAge').innerHTML = '<b>' + T.made.replace('{w}', dot.wk).replace('{y}', dot.year) + '</b> · ' + T.age(dot.years, dot.months);
    } else {
      id('cAge').textContent = elDot.value.trim() ? T.dotBad : '';
    }
    
    sizeText = on
      ? T.waFront.replace('{s}', label(gf)) + ' · ' + T.waRear.replace('{s}', label(gr))
      : label(gf);
    dotText = dot ? T.waDot.replace('{w}', dot.wk).replace('{y}', dot.year) : '';
  }
  
  id('cWa').addEventListener('click', function (e) {
    var size = document.getElementById('bSize');
    if (!size) return;                       
    e.preventDefault();
    size.value = sizeText;
    var note = document.getElementById('bNote');
    if (dotText && note && note.value.indexOf(dotText) === -1) {
      note.value = (note.value ? note.value.replace(/\s*$/, ' ') : '') + dotText;
    }
    var svc = document.getElementById('bSvc');
    if (svc) for (var i = 0; i < svc.options.length; i++) {
      if (svc.options[i].text === T.svcTyres) { svc.selectedIndex = i; break; }
    }
    document.getElementById('book').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { size.focus({ preventScroll: true }); }, 450);
  });
  AX.forEach(function (ax) {
    ['W', 'A', 'R', 'L', 'S'].forEach(function (f) {
      id(ax + f).addEventListener('change', render);
    });
  });
  stag.addEventListener('change', render);
  elDot.addEventListener('input', render);
  render();
})();
(function () {
  'use strict';
  var T = window.FOUR_I18N;
  var form = document.getElementById('bookForm');
  if (!T || !form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = function (i) { var el = document.getElementById(i); return el ? el.value.trim() : ''; };
    var parts = [T.bkHi];
    var svc = val('bSvc'); if (svc && svc !== T.svcAny) parts.push(T.bkSvc.replace('{v}', svc));
    var car = val('bCar');  if (car)  parts.push(T.bkCar.replace('{v}', car));
    var size = val('bSize');if (size) parts.push(T.bkSize.replace('{v}', size));
    var note = val('bNote');if (note) parts.push(note);
    window.open('https://wa.me/971558720712?text=' + encodeURIComponent(parts.join(' ')), '_blank', 'noopener');
  });
})();
