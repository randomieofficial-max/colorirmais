// Shared helpers for the original coloring-page generators.
export function rng(seed) {
  // mulberry32
  let a = seed >>> 0;
  const r = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.range = (lo, hi) => lo + r() * (hi - lo);
  r.chance = (p) => r() < p;
  r.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return r;
}

export const f = (n) => (Math.round(n * 10) / 10).toString();
export const pt = (x, y) => `${f(x)} ${f(y)}`;
export const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

export function svgDoc(inner, { w = 1000, h = 1000, sw = 6, title = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
    (title ? `<title>${esc(title)}</title>` : '') +
    `<rect width="${w}" height="${h}" fill="#fff"/>` +
    `<g fill="#fff" stroke="#111" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
}

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Rotate an SVG fragment n times around (cx, cy)
export function radial(fragment, n, cx = 500, cy = 500, offset = 0) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const deg = (360 / n) * i + offset;
    out += `<g transform="rotate(${f(deg)} ${cx} ${cy})">${fragment}</g>`;
  }
  return out;
}

export function circle(cx, cy, r, extra = '') {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"${extra}/>`;
}

export function slugify(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
