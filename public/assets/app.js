/* Colorir Mais — site interactions (menu, filters, print, A4 PDF, PNG, painter loader) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // mobile menu
  var mb = $('.menu-btn'), nav = $('.nav');
  if (mb && nav) mb.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // hero: colour the capybara once, on load
  var fm = $('.fillme');
  if (fm) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var parts = $$('[data-c]', fm);
    parts.forEach(function (el) { el.style.setProperty('--c', el.getAttribute('data-c')); });
    if (reduce) fm.classList.add('go');
    else {
      parts.forEach(function (el, i) { el.style.transitionDelay = (0.5 + i * 0.22) + 's'; });
      setTimeout(function () { fm.classList.add('go'); }, 150);
    }
  }

  // level filter on category pages
  var fb = $$('.filters button');
  if (fb.length) fb.forEach(function (b) {
    b.addEventListener('click', function () {
      fb.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var lv = b.getAttribute('data-lv');
      $$('.grid .card').forEach(function (c) { c.hidden = lv !== 'all' && c.getAttribute('data-lv') !== lv; });
    });
  });

  var page = $('[data-page]');
  if (!page) return;
  var src = page.getAttribute('data-src');
  var slug = page.getAttribute('data-slug');
  var title = page.getAttribute('data-title');

  function loadImg(url) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = rej;
      im.src = url;
    });
  }
  function saveBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function busy(btn, on, text) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.lastChild.textContent = text; }
    else { btn.disabled = false; btn.innerHTML = btn.dataset.label; }
  }

  // Draw the drawing on an A4 sheet (portrait) with title and site address.
  function a4Canvas(img, label) {
    var W = 1654, H = 2339, M = 90;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    var top = 170, bottom = H - 120;
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var s = Math.min((W - 2 * M) / iw, (bottom - top) / ih);
    var dw = iw * s, dh = ih * s;
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, (W - dw) / 2, top + (bottom - top - dh) / 2, dw, dh);
    x.fillStyle = '#1B2142';
    x.textAlign = 'center';
    x.font = '600 54px Fredoka, Arial, sans-serif';
    x.fillText(label, W / 2, 110, W - 2 * M);
    x.fillStyle = '#8A90AD';
    x.font = '500 30px Fredoka, Arial, sans-serif';
    x.fillText('colorirmais.vercel.app', W / 2, H - 50);
    return c;
  }

  // Minimal one-page PDF (A4) that embeds a JPEG.
  function pdfFromJpeg(bytes, w, h) {
    var enc = new TextEncoder();
    var parts = [], offs = [], len = 0;
    function push(x) { var b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; }
    function obj(n, body) { offs[n] = len; push(n + ' 0 obj\n' + body + '\nendobj\n'); }
    var PW = 595.28, PH = 841.89;
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, '<</Type/Catalog/Pages 2 0 R>>');
    obj(2, '<</Type/Pages/Kids[3 0 R]/Count 1>>');
    obj(3, '<</Type/Page/Parent 2 0 R/MediaBox[0 0 ' + PW + ' ' + PH + ']/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>');
    offs[4] = len;
    push('4 0 obj\n<</Type/XObject/Subtype/Image/Width ' + w + '/Height ' + h + '/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ' + bytes.length + '>>\nstream\n');
    push(bytes);
    push('\nendstream\nendobj\n');
    var content = 'q ' + PW + ' 0 0 ' + PH + ' 0 0 cm /Im0 Do Q';
    obj(5, '<</Length ' + content.length + '>>\nstream\n' + content + '\nendstream');
    var xref = len;
    var x = 'xref\n0 6\n0000000000 65535 f \n';
    for (var i = 1; i <= 5; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
    push(x + 'trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }

  function ready() { return document.fonts && document.fonts.load ? document.fonts.load('600 54px Fredoka').catch(function () {}) : Promise.resolve(); }

  var bPdf = $('[data-act=pdf]'), bPng = $('[data-act=png]'), bPrint = $('[data-act=print]'), bPaint = $('[data-act=paint]');
  if (bPdf) bPdf.addEventListener('click', function () {
    busy(bPdf, true, 'Gerando PDF…');
    Promise.all([loadImg(src), ready()]).then(function (r) {
      var c = a4Canvas(r[0], title);
      c.toBlob(function (blob) {
        blob.arrayBuffer().then(function (buf) {
          saveBlob(pdfFromJpeg(new Uint8Array(buf), c.width, c.height), 'colorirmais-' + slug + '.pdf');
          busy(bPdf, false);
        });
      }, 'image/jpeg', 0.92);
    }).catch(function () { busy(bPdf, false); alert('Não foi possível gerar o PDF. Tente imprimir pelo botão Imprimir.'); });
  });
  if (bPng) bPng.addEventListener('click', function () {
    busy(bPng, true, 'Preparando…');
    Promise.all([loadImg(src), ready()]).then(function (r) {
      a4Canvas(r[0], title).toBlob(function (blob) { saveBlob(blob, 'colorirmais-' + slug + '.png'); busy(bPng, false); }, 'image/png');
    }).catch(function () { busy(bPng, false); });
  });
  if (bPrint) bPrint.addEventListener('click', function () { window.print(); });
  if (bPaint) bPaint.addEventListener('click', function () {
    if (window.ColorirPainter) return window.ColorirPainter.open(src, title, slug);
    var s = document.createElement('script');
    s.src = '/assets/painter.js?v=__V__';
    s.onload = function () { window.ColorirPainter.open(src, title, slug); };
    document.body.appendChild(s);
  });
  if (location.hash === '#pintar' && bPaint) setTimeout(function () { bPaint.click(); }, 300);
})();
