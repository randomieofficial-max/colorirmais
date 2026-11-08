// Original repeating-pattern coloring pages ("padroes" / "arte relaxante").
import { rng, f, svgDoc, circle } from './util.mjs';

const W = 1000, M = 40; // margin

function star(cx, cy, r1, r2, n, rot = -Math.PI / 2) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (Math.PI * i) / n, r = i % 2 ? r2 : r1;
    d += `${i ? 'L' : 'M'}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  }
  return `<path d="${d}Z"/>`;
}
function heart(cx, cy, s) {
  return `<path d="M${f(cx)} ${f(cy + s)} C${f(cx - s * 1.6)} ${f(cy - s * 0.1)} ${f(cx - s * 0.9)} ${f(cy - s * 1.3)} ${f(cx)} ${f(cy - s * 0.45)} C${f(cx + s * 0.9)} ${f(cy - s * 1.3)} ${f(cx + s * 1.6)} ${f(cy - s * 0.1)} ${f(cx)} ${f(cy + s)}Z"/>`;
}
function flower(cx, cy, r, n, R) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const px = cx + r * 0.55 * Math.cos(a), py = cy + r * 0.55 * Math.sin(a);
    s += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(r * 0.45)}" ry="${f(r * 0.24)}" transform="rotate(${f((a * 180) / Math.PI)} ${f(px)} ${f(py)})"/>`;
  }
  return s + circle(cx, cy, r * 0.28);
}

export const types = {
  hexFlowers(R, lv) {
    const s = { facil: 150, medio: 105, dificil: 72 }[lv];
    const h = s * Math.sqrt(3) / 2;
    let out = '';
    for (let row = -1, y = M; y < W + s; row++, y += h)
      for (let x = M + (row % 2 ? s / 2 : 0) - s; x < W + s; x += s)
        out += flower(x, y, s * 0.46, R.pick([5, 6, 8]), R);
    return out;
  },
  scales(R, lv) {
    const s = { facil: 140, medio: 95, dificil: 64 }[lv];
    let out = '';
    for (let row = 0, y = W + s; y > -s; row++, y -= s * 0.5)
      for (let x = (row % 2 ? s / 2 : 0) - s; x < W + s; x += s) {
        out += `<path d="M${f(x - s / 2)} ${f(y)} A${f(s / 2)} ${f(s / 2)} 0 0 1 ${f(x + s / 2)} ${f(y)}Z"/>`;
        if (lv !== 'facil') out += `<path d="M${f(x - s / 4)} ${f(y)} A${f(s / 4)} ${f(s / 4)} 0 0 1 ${f(x + s / 4)} ${f(y)}" fill="none"/>`;
      }
    return out;
  },
  truchet(R, lv) {
    const s = { facil: 160, medio: 110, dificil: 70 }[lv];
    let out = '';
    for (let y = 0; y < W; y += s)
      for (let x = 0; x < W; x += s) {
        const r = s / 2;
        if (R.chance(0.5)) out += `<path d="M${x + r} ${y} A${r} ${r} 0 0 1 ${x} ${y + r} M${x + s} ${y + r} A${r} ${r} 0 0 0 ${x + r} ${y + s}" fill="none"/>`;
        else out += `<path d="M${x + r} ${y} A${r} ${r} 0 0 0 ${x + s} ${y + r} M${x} ${y + r} A${r} ${r} 0 0 1 ${x + r} ${y + s}" fill="none"/>`;
        if (lv === 'dificil') out += `<path d="M${x + r * 0.5} ${y} A${r * 0.5} ${r * 0.5} 0 0 1 ${x} ${y + r * 0.5}" fill="none"/>`;
      }
    return out;
  },
  waves(R, lv) {
    const s = { facil: 110, medio: 70, dificil: 46 }[lv];
    const amp = s * R.range(0.35, 0.6), wl = R.range(160, 260);
    let out = '';
    for (let y = -s; y < W + s; y += s) {
      let d = `M-20 ${f(y)}`;
      for (let x = -20; x <= W + 20; x += 10) d += `L${x} ${f(y + amp * Math.sin((x / wl) * Math.PI * 2 + y * 0.01))}`;
      out += `<path d="${d}" fill="none"/>`;
      if (lv !== 'facil') for (let x = (y / s) % 2 ? 40 : 100; x < W; x += wl * 0.5) out += circle(x, y + s / 2 + amp * Math.sin((x / wl) * Math.PI * 2 + y * 0.01), s * 0.13);
    }
    return out;
  },
  stars8(R, lv) {
    const s = { facil: 200, medio: 140, dificil: 100 }[lv];
    let out = '';
    for (let y = 0; y <= W; y += s)
      for (let x = 0; x <= W; x += s) {
        out += star(x, y, s * 0.48, s * 0.3, 8, 0);
        out += `<rect x="${f(x - s * 0.14)}" y="${f(y - s * 0.14)}" width="${f(s * 0.28)}" height="${f(s * 0.28)}" transform="rotate(45 ${f(x)} ${f(y)})"/>`;
        out += star(x + s / 2, y + s / 2, s * 0.2, s * 0.09, 4, Math.PI / 4);
      }
    return out;
  },
  quatrefoil(R, lv) {
    const s = { facil: 190, medio: 130, dificil: 90 }[lv], r = s * 0.27;
    let out = '';
    for (let y = 0; y <= W + s; y += s)
      for (let x = 0; x <= W + s; x += s) {
        const c = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dx, dy]) => circle(x + dx * r, y + dy * r, r)).join('');
        out += c + circle(x, y, r * 0.95, ' stroke="none"') + circle(x, y, r * 0.45);
        if (lv !== 'facil') out += star(x + s / 2, y + s / 2, s * 0.16, s * 0.07, 4);
      }
    return out;
  },
  hearts(R, lv) {
    const s = { facil: 170, medio: 120, dificil: 85 }[lv];
    let out = '';
    for (let row = 0, y = s / 2; y < W + s; row++, y += s * 0.8)
      for (let x = (row % 2 ? s / 2 : 0); x < W + s; x += s) {
        out += R.chance(0.5) ? heart(x, y, s * 0.3) : star(x, y, s * 0.36, s * 0.16, 5);
        if (lv !== 'facil') out += circle(x + s / 2, y, s * 0.06);
      }
    return out;
  },
  bubbles(R, lv) {
    const n = { facil: 26, medio: 60, dificil: 130 }[lv];
    const placed = [];
    let out = '';
    for (let tries = 0; tries < 4000 && placed.length < n; tries++) {
      const r = R.range(lv === 'dificil' ? 22 : 40, lv === 'facil' ? 150 : 110);
      const x = R.range(r, W - r), y = R.range(r, W - r);
      if (placed.some((p) => Math.hypot(p[0] - x, p[1] - y) < p[2] + r + 6)) continue;
      placed.push([x, y, r]);
      out += circle(x, y, r);
      const k = R.int(0, 3);
      if (k === 0) out += circle(x, y, r * 0.6) + circle(x, y, r * 0.25);
      else if (k === 1) out += flower(x, y, r * 0.9, R.pick([5, 6, 8]), R);
      else if (k === 2) out += star(x, y, r * 0.75, r * 0.35, R.pick([5, 6]));
      else out += heart(x, y, r * 0.5);
    }
    return out;
  },
};

export const patternTypes = {
  hexFlowers: 'Flores em colmeia',
  scales: 'Escamas',
  truchet: 'Labirinto de curvas',
  waves: 'Ondas',
  stars8: 'Estrelas geométricas',
  quatrefoil: 'Azulejo marroquino',
  hearts: 'Corações e estrelas',
  bubbles: 'Bolhas decoradas',
};

export function pattern(type, seed, level = 'medio') {
  const R = rng(seed * 104729 + type.length);
  const body = types[type](R, level);
  const sw = { facil: 6, medio: 4.5, dificil: 3 }[level];
  const clip = `<clipPath id="c"><rect x="${M}" y="${M}" width="${W - 2 * M}" height="${W - 2 * M}" rx="36"/></clipPath>`;
  return svgDoc(`<defs>${clip}</defs><g clip-path="url(#c)">${body}</g><rect x="${M}" y="${M}" width="${W - 2 * M}" height="${W - 2 * M}" rx="36" fill="none" stroke-width="${sw * 1.6}"/>`, { sw });
}
