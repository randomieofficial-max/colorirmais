/* Colorir Mais — name-to-colour generator (letters are real font outlines) */
(function () {
  'use strict';
  var out = document.getElementById('gout'), inp = document.getElementById('gn'), deco = document.getElementById('gd');
  if (!out || !inp) return;
  var font = null, svgText = '';

  function star(cx, cy, r) {
    var d = '';
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + Math.PI * i / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); }
    return '<path d="' + d + 'Z"/>';
  }
  function heart(cx, cy, s) {
    return '<path d="M' + cx + ' ' + (cy + s) + ' C' + (cx - s * 1.6) + ' ' + (cy - s * 0.1) + ' ' + (cx - s * 0.9) + ' ' + (cy - s * 1.3) + ' ' + cx + ' ' + (cy - s * 0.45) + ' C' + (cx + s * 0.9) + ' ' + (cy - s * 1.3) + ' ' + (cx + s * 1.6) + ' ' + (cy - s * 0.1) + ' ' + cx + ' ' + (cy + s) + 'Z"/>';
  }
  function flower(cx, cy, r) {
    var s = '';
    for (var i = 0; i < 6; i++) { var a = i * 60; s += '<ellipse cx="' + cx + '" cy="' + (cy - r * 0.9) + '" rx="' + r * 0.45 + '" ry="' + r * 0.7 + '" transform="rotate(' + a + ' ' + cx + ' ' + cy + ')"/>'; }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r * 0.5 + '"/>';
  }
  function decorations(kind) {
    var spots = [[90, 90, 46], [910, 90, 40], [80, 620, 38], [920, 610, 46], [500, 60, 26], [500, 650, 26], [270, 70, 22], [730, 650, 22]];
    return spots.map(function (p) { return kind === 'estrelas' ? star(p[0], p[1], p[2]) : kind === 'coracoes' ? heart(p[0], p[1], p[2] * 0.8) : kind === 'flores' ? flower(p[0], p[1], p[2] * 0.7) : ''; }).join('');
  }
  function render() {
    if (!font) return;
    var name = (inp.value || '').trim().slice(0, 14) || 'Nome';
    var lines = name.length > 8 && name.indexOf(' ') > 0 ? [name.slice(0, name.indexOf(' ')), name.slice(name.indexOf(' ') + 1)] : [name];
    var W = 1000, H = 700, top = 120, bottom = 580, lh = (bottom - top) / lines.length;
    var paths = lines.map(function (ln, i) {
      var size = 300, w = font.getAdvanceWidth(ln, size);
      size = Math.min(size * 820 / w, lh * 1.25);
      var p = font.getPath(ln, 0, 0, size), bb = p.getBoundingBox();
      var dx = (W - (bb.x2 - bb.x1)) / 2 - bb.x1, dy = top + i * lh + (lh - (bb.y2 - bb.y1)) / 2 - bb.y1;
      p = font.getPath(ln, dx, dy, size);
      return '<path d="' + p.toPathData(1) + '"/>';
    }).join('');
    svgText = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><rect width="' + W + '" height="' + H + '" fill="#fff"/><g fill="#fff" stroke="#111" stroke-width="7" stroke-linejoin="round">' +
      '<rect x="20" y="20" width="960" height="660" rx="34" fill="none"/>' + decorations(deco.value) + paths + '</g></svg>';
    out.innerHTML = svgText.replace('<svg ', '<svg role="img" aria-label="' + name.replace(/"/g, '') + ' em letras para colorir" ');
  }
  fetch('/assets/fonts/fredoka-700.woff').then(function (r) { return r.arrayBuffer(); }).then(function (buf) { font = opentype.parse(buf); render(); });
  inp.addEventListener('input', render); deco.addEventListener('change', render);
  document.getElementById('gprint').addEventListener('click', function () { window.print(); });
  document.getElementById('gpng').addEventListener('click', function () {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'); c.width = 2000; c.height = 1400;
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'nome-para-colorir.png'; document.body.appendChild(a); a.click(); a.remove(); }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
  });
})();
