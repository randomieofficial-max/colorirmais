// Original mandala generator. Every seed gives a different, symmetric design.
import { rng, f, svgDoc, radial, circle } from './util.mjs';

const C = 500;

// All motifs are drawn for one sector pointing up (towards -y) between radius r0 and r1.
// `half` is half the sector angle in radians.
const motifs = {
  petal(r0, r1, half, R) {
    const h = r1 - r0, w = Math.min(Math.tan(half) * (r0 + h * 0.5) * 0.95, h * 0.7);
    const y0 = C - r0, y1 = C - r1;
    let s = `<path d="M${C} ${f(y0)} C${f(C + w)} ${f(y0 - h * 0.25)} ${f(C + w * 0.9)} ${f(y1 + h * 0.25)} ${C} ${f(y1)} C${f(C - w * 0.9)} ${f(y1 + h * 0.25)} ${f(C - w)} ${f(y0 - h * 0.25)} ${C} ${f(y0)}Z"/>`;
    if (R.chance(0.6)) {
      const k = R.range(0.45, 0.62);
      s += `<path d="M${C} ${f(y0 - h * 0.12)} C${f(C + w * k)} ${f(y0 - h * 0.3)} ${f(C + w * k * 0.9)} ${f(y1 + h * 0.4)} ${C} ${f(y1 + h * 0.22)} C${f(C - w * k * 0.9)} ${f(y1 + h * 0.4)} ${f(C - w * k)} ${f(y0 - h * 0.3)} ${C} ${f(y0 - h * 0.12)}Z"/>`;
    } else if (R.chance(0.5)) {
      s += `<path d="M${C} ${f(y0 - h * 0.1)} L${C} ${f(y1 + h * 0.18)}" fill="none"/>`;
    }
    return s;
  },
  leaf(r0, r1, half, R) {
    const h = r1 - r0, w = Math.min(Math.tan(half) * (r0 + h * 0.4) * 0.95, h * 0.55);
    const y0 = C - r0, y1 = C - r1;
    let s = `<path d="M${C} ${f(y0)} Q${f(C + w * 1.6)} ${f(y0 - h * 0.45)} ${C} ${f(y1)} Q${f(C - w * 1.6)} ${f(y0 - h * 0.45)} ${C} ${f(y0)}Z"/>`;
    s += `<path d="M${C} ${f(y0 - h * 0.08)} L${C} ${f(y1 + h * 0.15)}" fill="none"/>`;
    if (R.chance(0.7)) {
      for (let i = 1; i <= 3; i++) {
        const yy = y0 - h * (0.18 + i * 0.16), dx = w * (0.55 - i * 0.1);
        s += `<path d="M${C} ${f(yy)} L${f(C + dx)} ${f(yy - h * 0.1)} M${C} ${f(yy)} L${f(C - dx)} ${f(yy - h * 0.1)}" fill="none"/>`;
      }
    }
    return s;
  },
  spike(r0, r1, half, R) {
    const w = Math.tan(half) * r0 * 0.98;
    const y0 = C - r0, y1 = C - r1;
    let s = `<path d="M${f(C - w)} ${f(y0 + 2)} L${C} ${f(y1)} L${f(C + w)} ${f(y0 + 2)}Z"/>`;
    if (R.chance(0.6)) s += `<path d="M${f(C - w * 0.5)} ${f(y0)} L${C} ${f(y1 + (r1 - r0) * 0.38)} L${f(C + w * 0.5)} ${f(y0)}Z"/>`;
    return s;
  },
  drop(r0, r1, half, R) {
    const h = r1 - r0, w = Math.min(Math.tan(half) * (r0 + h / 2) * 0.8, h * 0.42);
    const yb = C - r0 - h * 0.08, yt = C - r1 + h * 0.04;
    const cy = yb - w;
    let s = `<path d="M${C} ${f(yt)} C${f(C + w * 0.4)} ${f(cy - w)} ${f(C + w)} ${f(cy - w * 0.2)} ${f(C + w)} ${f(cy)} A${f(w)} ${f(w)} 0 0 1 ${f(C - w)} ${f(cy)} C${f(C - w)} ${f(cy - w * 0.2)} ${f(C - w * 0.4)} ${f(cy - w)} ${C} ${f(yt)}Z"/>`;
    if (R.chance(0.7)) s += circle(C, cy, w * 0.42);
    return s;
  },
  dots(r0, r1, half, R) {
    const h = r1 - r0, rm = (r0 + r1) / 2;
    const rad = Math.min(h * 0.38, Math.tan(half) * rm * 0.75);
    let s = circle(C, C - rm, rad);
    if (rad > 14 && R.chance(0.6)) s += circle(C, C - rm, rad * 0.45);
    return s;
  },
  heart(r0, r1, half, R) {
    const h = r1 - r0, rm = (r0 + r1) / 2;
    const sz = Math.min(h * 0.4, Math.tan(half) * rm * 0.7);
    const y = C - rm;
    // heart pointing to the center
    return `<path d="M${C} ${f(y + sz)} C${f(C - sz * 1.6)} ${f(y - sz * 0.1)} ${f(C - sz * 0.9)} ${f(y - sz * 1.3)} ${C} ${f(y - sz * 0.45)} C${f(C + sz * 0.9)} ${f(y - sz * 1.3)} ${f(C + sz * 1.6)} ${f(y - sz * 0.1)} ${C} ${f(y + sz)}Z"/>`;
  },
  lotus(r0, r1, half, R) {
    const h = r1 - r0, w = Math.tan(half) * (r0 + h * 0.4);
    const y0 = C - r0, y1 = C - r1;
    const side = (dir) => `<path d="M${C} ${f(y0)} C${f(C + dir * w * 1.2)} ${f(y0 - h * 0.15)} ${f(C + dir * w * 1.1)} ${f(y0 - h * 0.6)} ${f(C + dir * w * 0.95)} ${f(y0 - h * 0.78)} C${f(C + dir * w * 0.55)} ${f(y0 - h * 0.6)} ${f(C + dir * w * 0.2)} ${f(y0 - h * 0.35)} ${C} ${f(y0)}Z"/>`;
    return side(1) + side(-1) +
      `<path d="M${C} ${f(y0)} C${f(C + w * 0.62)} ${f(y0 - h * 0.3)} ${f(C + w * 0.4)} ${f(y1 + h * 0.2)} ${C} ${f(y1)} C${f(C - w * 0.4)} ${f(y1 + h * 0.2)} ${f(C - w * 0.62)} ${f(y0 - h * 0.3)} ${C} ${f(y0)}Z"/>`;
  },
  arch(r0, r1, half, R) {
    // pointed arch window between neighbouring rays
    const w = Math.tan(half) * r0 * 0.9, h = r1 - r0;
    const y0 = C - r0;
    let s = `<path d="M${f(C - w)} ${f(y0)} L${f(C - w)} ${f(y0 - h * 0.5)} Q${f(C - w)} ${f(y0 - h * 0.95)} ${C} ${f(y0 - h)} Q${f(C + w)} ${f(y0 - h * 0.95)} ${f(C + w)} ${f(y0 - h * 0.5)} L${f(C + w)} ${f(y0)}Z"/>`;
    s += `<path d="M${f(C - w * 0.55)} ${f(y0)} L${f(C - w * 0.55)} ${f(y0 - h * 0.45)} Q${f(C - w * 0.5)} ${f(y0 - h * 0.78)} ${C} ${f(y0 - h * 0.8)} Q${f(C + w * 0.5)} ${f(y0 - h * 0.78)} ${f(C + w * 0.55)} ${f(y0 - h * 0.45)} L${f(C + w * 0.55)} ${f(y0)}"/>`;
    return s;
  },
};

// Bands that are drawn as one closed shape around the whole circle.
function scallopBand(r0, r1, n) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (Math.PI * 2 * i) / n - Math.PI / 2, a1 = (Math.PI * 2 * (i + 1)) / n - Math.PI / 2;
    const x0 = C + r0 * Math.cos(a0), y0 = C + r0 * Math.sin(a0);
    const x1 = C + r0 * Math.cos(a1), y1 = C + r0 * Math.sin(a1);
    const am = (a0 + a1) / 2;
    const cx = C + r1 * 1.08 * Math.cos(am), cy = C + r1 * 1.08 * Math.sin(am);
    d += (i === 0 ? `M${f(x0)} ${f(y0)}` : '') + ` Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`;
  }
  return `<path d="${d}Z"/>`;
}

function zigzagBand(r0, r1, n) {
  const m = n * 2;
  let d = '';
  for (let i = 0; i <= m; i++) {
    const a = (Math.PI * 2 * i) / m - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r0;
    d += `${i === 0 ? 'M' : 'L'}${f(C + r * Math.cos(a))} ${f(C + r * Math.sin(a))}`;
  }
  return circle(C, C, r1) + `<path d="${d}Z" fill="none"/>` + circle(C, C, r0);
}

function beadBand(r0, r1, n) {
  const rm = (r0 + r1) / 2, k = Math.max(n * 2, Math.round((2 * Math.PI * rm) / (r1 - r0)));
  const br = Math.min((r1 - r0) / 2, Math.PI * rm / k) * 0.98;
  let s = '';
  for (let i = 0; i < k; i++) {
    const a = (Math.PI * 2 * i) / k;
    s += circle(C + rm * Math.cos(a), C + rm * Math.sin(a), br);
  }
  return s;
}

export function mandala(seed, level = 'medio') {
  const R = rng(seed * 7919 + 13);
  const cfg = {
    facil: { bands: [3, 4], sym: [6, 8], sw: 7, minH: 75 },
    medio: { bands: [5, 6], sym: [8, 10, 12], sw: 5, minH: 50 },
    dificil: { bands: [7, 9], sym: [12, 16, 18, 20, 24], sw: 3.2, minH: 34 },
  }[level];
  const nb = R.int(cfg.bands[0], cfg.bands[1]);
  const baseSym = R.pick(cfg.sym);
  // radii from outside in
  const radii = [470];
  let rem = 470 - R.range(45, 70);
  const avg = rem / nb;
  for (let i = 0; i < nb; i++) {
    const h = Math.max(cfg.minH, avg * R.range(0.75, 1.3));
    radii.push(Math.max(radii[radii.length - 1] - h, 40));
  }
  const names = Object.keys(motifs);
  let out = '';
  let used = [];
  for (let i = 0; i < nb; i++) {
    const r1 = radii[i], r0 = radii[i + 1];
    if (r1 - r0 < 18) continue;
    const sym = i === 0 || R.chance(0.6) ? baseSym : baseSym * (R.chance(0.5) && baseSym <= 12 ? 2 : 1);
    const half = Math.PI / sym;
    const kind = i === 0
      ? R.pick(['petal', 'scallop', 'lotus', 'leaf', 'beads', 'drop'])
      : R() < 0.22 ? R.pick(['scallop', 'zigzag', 'beads', 'ring']) : R.pick(names.filter((n) => n !== used[used.length - 1]));
    used.push(kind);
    if (kind === 'scallop') out += scallopBand(r0, r1, sym) + circle(C, C, r0);
    else if (kind === 'zigzag') out += zigzagBand(r0, r1, sym);
    else if (kind === 'beads') out += circle(C, C, r1) + beadBand(r0, r1, sym) + circle(C, C, r0);
    else if (kind === 'ring') {
      out += circle(C, C, r1) + circle(C, C, r1 - (r1 - r0) * 0.45);
      out += radial(`<path d="M${C} ${f(C - r1)} L${C} ${f(C - r1 + (r1 - r0) * 0.45)}" fill="none"/>`, sym * 2);
      out += circle(C, C, r0);
    } else {
      const offset = R.chance(0.5) ? 180 / sym : 0;
      // optional background disc so motifs sit on a band
      if (R.chance(0.35)) out += circle(C, C, r1 * 0.98);
      out += radial(motifs[kind](r0, r1, half, R), sym, C, C, offset);
      if (R.chance(0.5)) out += circle(C, C, r0);
    }
  }
  // centre
  const rc = radii[radii.length - 1];
  out += circle(C, C, rc);
  if (rc > 35) out += radial(motifs.petal(rc * 0.25, rc * 0.92, Math.PI / baseSym, R), baseSym);
  out += circle(C, C, Math.max(rc * 0.25, 10));
  // outer frame for print
  let frame = '';
  if (R.chance(0.5)) frame = radial(motifs.dots(472, 500, Math.PI / (baseSym * 3), R), baseSym * 3);
  return svgDoc(frame + out, { sw: cfg.sw });
}
