/* Colorir Mais — online painter: tap-to-fill bucket, brush, eraser, undo/redo, save */
(function () {
  'use strict';
  var COLORS = [
    ['Vermelho', '#E53935'], ['Rosa-choque', '#E2307C'], ['Rosa', '#F8A5C2'], ['Laranja', '#FB8C00'], ['Pêssego', '#FFCC9E'], ['Amarelo', '#FDD835'],
    ['Amarelo-claro', '#FFF59D'], ['Verde-limão', '#9CCC65'], ['Verde', '#43A047'], ['Verde-escuro', '#1B5E20'], ['Água', '#4DD0C4'], ['Azul-claro', '#4FC3F7'],
    ['Azul', '#1E88E5'], ['Azul-marinho', '#283593'], ['Lilás', '#B39DDB'], ['Roxo', '#8E24AA'], ['Marrom-claro', '#BC8F6F'], ['Marrom', '#6D4C41'],
    ['Pele clara', '#F9D7BE'], ['Pele média', '#D9A07B'], ['Pele escura', '#8D5A3B'], ['Cinza', '#9E9E9E'], ['Preto', '#212121'], ['Branco', '#FFFFFF'],
  ];
  var ICON = {
    bucket: '<path d="M5 11l7-7 7 7-7 7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 11h14" stroke="currentColor" stroke-width="2"/><path d="M20 15c0 2-1 3-1.5 3S17 17 17 15c0-1 1.5-3 1.5-3S20 14 20 15z" fill="currentColor"/>',
    brush: '<path d="M14 4l6 6-8 8-6-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M6 12c-2 0-3 2-3 4s-1 3-1 4c3 0 6-1 7-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    eraser: '<path d="M8 20h12M4 15l9-9 6 6-8 8H8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 10l6 6" stroke="currentColor" stroke-width="2"/>',
    undo: '<path d="M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -3)"/>',
    redo: '<path d="M15 7l5 5-5 5M20 12H9a5 5 0 000 10h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -3)"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    save: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  };
  var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg>'; };
  var pencil = function (c) {
    return '<svg viewBox="0 0 38 54" aria-hidden="true"><path d="M7 20 L19 2 L31 20Z" fill="#F3D2A8" stroke="#1B2142" stroke-width="1.5"/><path d="M15 8 L19 2 L23 8Z" fill="' + c + '"/><rect x="7" y="20" width="24" height="33" rx="3" fill="' + c + '" stroke="#1B2142" stroke-width="1.5"/><rect x="11" y="24" width="4" height="25" rx="2" fill="#fff" opacity=".35"/></svg>';
  };

  var root, cv, ctx, W, H, base, lum, wall, col, out, hist = [], fut = [], tool = 'bucket', color = COLORS[1][1], size = 14, cur = '', curSlug = '';

  function build() {
    root = document.createElement('div');
    root.className = 'painter';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Pintar online');
    var colors = COLORS.map(function (c, i) { return '<button type="button" data-color="' + c[1] + '" aria-label="' + c[0] + '" title="' + c[0] + '" aria-pressed="' + (i === 1) + '">' + pencil(c[1]) + '</button>'; }).join('');
    root.innerHTML =
      '<div class="pt-bar"><span class="title"></span>' +
      '<button class="tool" data-tool="bucket" aria-pressed="true" title="Balde: toque numa área para pintar">' + svg('bucket') + '<span class="sr">Balde de tinta</span></button>' +
      '<button class="tool" data-tool="brush" aria-pressed="false" title="Pincel">' + svg('brush') + '<span class="sr">Pincel</span></button>' +
      '<button class="tool" data-tool="eraser" aria-pressed="false" title="Borracha">' + svg('eraser') + '<span class="sr">Borracha</span></button>' +
      '<label class="pt-size" title="Tamanho do pincel"><span class="sr">Tamanho do pincel</span><input type="range" min="4" max="60" value="14"></label>' +
      '<input class="custom-color" type="color" value="#E2307C" title="Escolher outra cor" aria-label="Escolher outra cor">' +
      '<button class="tool" data-act="undo" title="Desfazer" disabled>' + svg('undo') + '<span class="sr">Desfazer</span></button>' +
      '<button class="tool" data-act="redo" title="Refazer" disabled>' + svg('redo') + '<span class="sr">Refazer</span></button>' +
      '<button class="tool" data-act="clear" title="Começar de novo">' + svg('trash') + '<span class="sr">Começar de novo</span></button>' +
      '<button class="btn btn-pink" data-act="save" style="min-height:46px">' + svg('save') + '<span>Salvar</span></button>' +
      '<button class="tool" data-act="close" title="Fechar">' + svg('close') + '<span class="sr">Fechar</span></button></div>' +
      '<div class="pt-stage"><canvas></canvas></div>' +
      '<div class="pt-colors" role="group" aria-label="Cores">' + colors + '</div>';
    document.body.appendChild(root);
    cv = root.querySelector('canvas');
    ctx = cv.getContext('2d', { willReadFrequently: true });

    root.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;
      if (t.dataset.tool) {
        tool = t.dataset.tool;
        root.querySelectorAll('[data-tool]').forEach(function (b) { b.setAttribute('aria-pressed', b === t ? 'true' : 'false'); });
      } else if (t.dataset.color) {
        color = t.dataset.color;
        if (tool === 'eraser') root.querySelector('[data-tool=brush]').click();
        root.querySelectorAll('[data-color]').forEach(function (b) { b.setAttribute('aria-pressed', b === t ? 'true' : 'false'); });
      } else if (t.dataset.act === 'undo') undo();
      else if (t.dataset.act === 'redo') redo();
      else if (t.dataset.act === 'clear') { if (confirm('Apagar todas as cores e começar de novo?')) { snap(); col.fill(0xffffffff); render(0, 0, W, H); } }
      else if (t.dataset.act === 'save') cv.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'colorirmais-' + curSlug + '-pintado.png'; document.body.appendChild(a); a.click(); a.remove(); }, 'image/png');
      else if (t.dataset.act === 'close') close();
    });
    root.querySelector('.custom-color').addEventListener('input', function (e) { color = e.target.value; root.querySelectorAll('[data-color]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); });
    root.querySelector('input[type=range]').addEventListener('input', function (e) { size = +e.target.value; });
    document.addEventListener('keydown', function (e) {
      if (!root.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    });

    var drawing = false, last = null;
    cv.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var p = pos(e);
      if (tool === 'bucket') { fill(p[0] | 0, p[1] | 0, hex(color)); return; }
      snap(); drawing = true; last = p; stamp(p, p);
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); stamp(last, p); last = p; });
    var stop = function () { drawing = false; };
    cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
  }

  function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
  function hex(h) { var n = parseInt(h.slice(1), 16); return (0xff << 24 | (n & 0xff) << 16 | (n & 0xff00) | (n >> 16 & 0xff)) >>> 0; }

  function open(src, title, slug) {
    if (!root) build();
    cur = src; curSlug = slug;
    root.querySelector('.title').textContent = title;
    root.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    var im = new Image();
    im.onload = function () { setup(im); };
    im.src = src;
  }
  function close() { root.classList.remove('open'); document.documentElement.style.overflow = ''; }

  function setup(im) {
    var iw = im.naturalWidth || 1000, ih = im.naturalHeight || 1000;
    var max = Math.min(1400, Math.max(window.innerWidth, window.innerHeight) * (window.devicePixelRatio > 1 ? 1.4 : 1.1));
    var s = max / Math.max(iw, ih);
    W = Math.round(iw * s); H = Math.round(ih * s);
    cv.width = W; cv.height = H;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(im, 0, 0, W, H);
    base = ctx.getImageData(0, 0, W, H);
    var d = base.data, n = W * H;
    lum = new Uint8ClampedArray(n); wall = new Uint8Array(n);
    for (var i = 0; i < n; i++) {
      var a = d[i * 4 + 3] / 255;
      var L = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) * a + 255 * (1 - a);
      lum[i] = L; wall[i] = L < 150 ? 1 : 0;
    }
    col = new Uint32Array(n).fill(0xffffffff);
    out = ctx.createImageData(W, H);
    hist = []; fut = []; buttons();
    render(0, 0, W, H);
    fit();
  }
  function fit() {
    var st = root.querySelector('.pt-stage');
    var r = st.getBoundingClientRect();
    var s = Math.min((r.width - 24) / W, (r.height - 24) / H);
    cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px';
  }
  window.addEventListener('resize', function () { if (root && root.classList.contains('open') && W) fit(); });

  // output = colour layer multiplied by line-art luminance (keeps anti-aliased lines smooth)
  function render(x0, y0, x1, y1) {
    x0 = Math.max(0, x0 | 0); y0 = Math.max(0, y0 | 0); x1 = Math.min(W, Math.ceil(x1)); y1 = Math.min(H, Math.ceil(y1));
    var o = out.data;
    for (var y = y0; y < y1; y++) for (var x = x0; x < x1; x++) {
      var i = y * W + x, c = col[i], l = lum[i] / 255, j = i * 4;
      o[j] = (c & 0xff) * l; o[j + 1] = (c >> 8 & 0xff) * l; o[j + 2] = (c >> 16 & 0xff) * l; o[j + 3] = 255;
    }
    ctx.putImageData(out, 0, 0, x0, y0, x1 - x0, y1 - y0);
  }

  function fill(x, y, c) {
    var i0 = y * W + x;
    if (x < 0 || y < 0 || x >= W || y >= H || wall[i0]) return;
    var target = col[i0];
    if (target === c) return;
    snap();
    var st = [x, y], minx = x, maxx = x, miny = y, maxy = y;
    while (st.length) {
      var py = st.pop(), px = st.pop();
      var i = py * W + px;
      while (px > 0 && !wall[i - 1] && col[i - 1] === target) { px--; i--; }
      var up = false, dn = false;
      while (px < W && !wall[i] && col[i] === target) {
        col[i] = c;
        if (px < minx) minx = px; if (px > maxx) maxx = px;
        if (py > 0) { var u = i - W; if (!wall[u] && col[u] === target) { if (!up) { st.push(px, py - 1); up = true; } } else up = false; }
        if (py < H - 1) { var dd = i + W; if (!wall[dd] && col[dd] === target) { if (!dn) { st.push(px, py + 1); dn = true; } } else dn = false; }
        px++; i++;
      }
      if (py < miny) miny = py; if (py > maxy) maxy = py;
    }
    // soften: also colour the light anti-aliased edge pixels touching the filled area
    for (var yy = Math.max(1, miny - 1); yy <= Math.min(H - 2, maxy + 1); yy++) for (var xx = Math.max(1, minx - 1); xx <= Math.min(W - 2, maxx + 1); xx++) {
      var k = yy * W + xx;
      if (wall[k] && col[k] === target && (col[k - 1] === c || col[k + 1] === c || col[k - W] === c || col[k + W] === c)) col[k] = c;
    }
    render(minx - 2, miny - 2, maxx + 3, maxy + 3);
  }

  function stamp(a, b) {
    var c = tool === 'eraser' ? 0xffffffff : hex(color);
    var r = size * W / 1000, dx = b[0] - a[0], dy = b[1] - a[1];
    var steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (r * 0.4)));
    var r2 = r * r;
    for (var s = 0; s <= steps; s++) {
      var cx = a[0] + dx * s / steps, cy = a[1] + dy * s / steps;
      for (var y = Math.max(0, cy - r | 0); y <= Math.min(H - 1, cy + r); y++)
        for (var x = Math.max(0, cx - r | 0); x <= Math.min(W - 1, cx + r); x++)
          if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2) col[y * W + x] = c;
    }
    render(Math.min(a[0], b[0]) - r - 1, Math.min(a[1], b[1]) - r - 1, Math.max(a[0], b[0]) + r + 2, Math.max(a[1], b[1]) + r + 2);
  }

  function snap() { hist.push(col.slice()); if (hist.length > 12) hist.shift(); fut = []; buttons(); }
  function undo() { if (!hist.length) return; fut.push(col); col = hist.pop(); render(0, 0, W, H); buttons(); }
  function redo() { if (!fut.length) return; hist.push(col); col = fut.pop(); render(0, 0, W, H); buttons(); }
  function buttons() { root.querySelector('[data-act=undo]').disabled = !hist.length; root.querySelector('[data-act=redo]').disabled = !fut.length; }

  window.ColorirPainter = { open: open };
})();
