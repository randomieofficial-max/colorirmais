// Small drawing helpers shared by the illustration library.
import { f } from '../util.mjs';
export { f };

export const eye = (x, y, r = 22) =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#111" stroke="none"/><circle cx="${f(x + r * 0.35)}" cy="${f(y - r * 0.38)}" r="${f(r * 0.34)}" fill="#fff" stroke="none"/>`;
export const smile = (x, y, w = 40, d = 22) =>
  `<path d="M${f(x - w / 2)} ${f(y)} Q${f(x)} ${f(y + d)} ${f(x + w / 2)} ${f(y)}" fill="none"/>`;
export const cheek = (x, y, rx = 26, ry = 16) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${rx}" ry="${ry}"/>`;
export const ell = (cx, cy, rx, ry, extra = '') => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"${extra}/>`;
export const circ = (cx, cy, r, extra = '') => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"${extra}/>`;
export const p = (d, extra = '') => `<path d="${d}"${extra}/>`;
export const line = (d) => `<path d="${d}" fill="none"/>`;
export const rect = (x, y, w, h, rx = 0, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(rx)}"${extra}/>`;
export const g = (inner, t) => `<g transform="${t}">${inner}</g>`;
export function star(cx, cy, r1, r2 = r1 * 0.45, n = 5, rot = -Math.PI / 2, round = false) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (Math.PI * i) / n, r = i % 2 ? r2 : r1;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  if (!round) return `<path d="M${pts.map((q) => f(q[0]) + ' ' + f(q[1])).join('L')}Z"/>`;
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    d += (i === 0 ? `M${f(m[0])} ${f(m[1])}` : '') + `Q${f(b[0])} ${f(b[1])} ${f((b[0] + pts[(i + 2) % pts.length][0]) / 2)} ${f((b[1] + pts[(i + 2) % pts.length][1]) / 2)}`;
  }
  return `<path d="${d}Z"/>`;
}
export const heart = (cx, cy, s) =>
  `<path d="M${f(cx)} ${f(cy + s)} C${f(cx - s * 1.6)} ${f(cy - s * 0.1)} ${f(cx - s * 0.9)} ${f(cy - s * 1.3)} ${f(cx)} ${f(cy - s * 0.45)} C${f(cx + s * 0.9)} ${f(cy - s * 1.3)} ${f(cx + s * 1.6)} ${f(cy - s * 0.1)} ${f(cx)} ${f(cy + s)}Z"/>`;
export function cloud(cx, cy, s = 1) {
  return `<path d="M${f(cx - 120 * s)} ${f(cy + 40 * s)} C${f(cx - 175 * s)} ${f(cy + 40 * s)} ${f(cx - 175 * s)} ${f(cy - 35 * s)} ${f(cx - 115 * s)} ${f(cy - 30 * s)} C${f(cx - 110 * s)} ${f(cy - 90 * s)} ${f(cx - 30 * s)} ${f(cy - 100 * s)} ${f(cx - 5 * s)} ${f(cy - 55 * s)} C${f(cx + 25 * s)} ${f(cy - 110 * s)} ${f(cx + 120 * s)} ${f(cy - 90 * s)} ${f(cx + 115 * s)} ${f(cy - 25 * s)} C${f(cx + 175 * s)} ${f(cy - 25 * s)} ${f(cx + 175 * s)} ${f(cy + 40 * s)} ${f(cx + 120 * s)} ${f(cy + 40 * s)}Z"/>`;
}
export function petals(cx, cy, r, n, w, len) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (360 / n) * i;
    s += `<ellipse cx="${f(cx)}" cy="${f(cy - r - len / 2)}" rx="${f(w)}" ry="${f(len / 2)}" transform="rotate(${f(a)} ${f(cx)} ${f(cy)})"/>`;
  }
  return s;
}
export function grassTufts(y, from = 60, to = 940, step = 120) {
  let s = line(`M20 ${y} L980 ${y}`);
  for (let x = from; x <= to; x += step)
    s += line(`M${x - 18} ${y} Q${x - 14} ${y - 30} ${x - 24} ${y - 50} M${x} ${y} Q${x + 2} ${y - 40} ${x - 2} ${y - 62} M${x + 18} ${y} Q${x + 16} ${y - 28} ${x + 28} ${y - 46}`);
  return s;
}
