// Turns text into outlined SVG paths using a real font (Fredoka Bold, SIL OFL).
import opentype from 'opentype.js';
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
let font;
function getFont() {
  if (!font) {
    const file = require.resolve('@fontsource/fredoka/files/fredoka-latin-700-normal.woff');
    const buf = fs.readFileSync(file);
    font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  return font;
}

// Returns {d, width, bbox} for text centred at (cx, baselineY), scaled to fit maxWidth.
export function textPath(str, cx, baseY, size, maxWidth = Infinity) {
  const fnt = getFont();
  let s = size;
  let w = fnt.getAdvanceWidth(str, s, { kerning: true });
  if (w > maxWidth) { s = (s * maxWidth) / w; w = maxWidth; }
  const path = fnt.getPath(str, cx - w / 2, baseY, s, { kerning: true });
  return { d: path.toPathData(1), size: s, width: w, bbox: path.getBoundingBox() };
}

// Text centred inside a box (top..bottom) using the real glyph bounding box.
export function textInBox(str, cx, top, bottom, maxWidth, size = 400) {
  const probe = textPath(str, 0, 0, size, maxWidth);
  const h = probe.bbox.y2 - probe.bbox.y1;
  const scale = Math.min(1, (bottom - top) / h);
  const t = textPath(str, cx, 0, probe.size * scale, maxWidth);
  const hh = t.bbox.y2 - t.bbox.y1;
  const shift = top + ((bottom - top) - hh) / 2 - t.bbox.y1;
  return textPath(str, cx, shift, t.size, maxWidth);
}

export function outlined(d, extra = '') {
  return `<path d="${d}" fill="#fff" fill-rule="nonzero"${extra}/>`;
}
export function dotted(d, sw = 9) {
  return `<path d="${d}" fill="none" stroke="#888" stroke-dasharray="1 ${sw * 2.6}" stroke-width="${sw}"/>`;
}
