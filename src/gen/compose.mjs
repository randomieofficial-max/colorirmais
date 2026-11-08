// Turns the original drawings into finished coloring pages with titles and metadata.
import { rng, f, svgDoc, slugify, esc } from './util.mjs';
import { animals } from './art/animals.mjs';
import { objects } from './art/objects.mjs';
import { star, heart, circ, rect, line, p } from './art/kit.mjs';
import { textInBox, outlined, dotted } from './text.mjs';
import { types as patternFills } from './patterns.mjs';
import { mandala } from './mandala.mjs';
import { pattern, patternTypes } from './patterns.mjs';
import { pixelPages } from './pixel.mjs';

export const SUBJECTS = { ...animals, ...objects };

// Which site category each subject belongs to.
const SUBJECT_CAT = {
  capivara: 'animais-brasileiros', tucano: 'animais-brasileiros', preguica: 'animais-brasileiros', jacare: 'animais-brasileiros', 'pássaro': 'passaros',
  gato: 'gatos', cachorro: 'cachorros', peixe: 'fundo-do-mar', baleia: 'fundo-do-mar', polvo: 'fundo-do-mar', tartaruga: 'fundo-do-mar',
  borboleta: 'insetos', joaninha: 'insetos', abelha: 'insetos', caracol: 'insetos', coruja: 'passaros', pintinho: 'fazenda', porco: 'fazenda', vaca: 'fazenda', cavalo: 'fazenda', ovelha: 'fazenda',
  coelho: 'animais', elefante: 'animais-da-selva', leao: 'animais-da-selva', girafa: 'animais-da-selva', macaco: 'animais-da-selva', zebra: 'animais-da-selva', sapo: 'animais', urso: 'animais', panda: 'animais', pinguim: 'animais',
  dinossauro: 'dinossauros', unicornio: 'unicornios',
  casa: 'casas-e-castelos', castelo: 'casas-e-castelos', iglu: 'casas-e-castelos',
  sol: 'natureza', 'arco-iris': 'natureza', flor: 'flores', girassol: 'flores', arvore: 'natureza', lua: 'natureza', nuvem: 'natureza', estrela: 'natureza', 'guarda-chuva': 'objetos',
  maca: 'frutas', morango: 'frutas', melancia: 'frutas', abacaxi: 'frutas', kiwi: 'frutas', uva: 'frutas',
  sorvete: 'comidas-e-doces', cupcake: 'comidas-e-doces', bolo: 'aniversario', pizza: 'comidas-e-doces', queijo: 'comidas-e-doces', waffle: 'comidas-e-doces', xicara: 'objetos',
  carro: 'veiculos', onibus: 'veiculos', foguete: 'espaco', aviao: 'veiculos', barco: 'veiculos', balao: 'veiculos', trem: 'veiculos', trator: 'veiculos', helicoptero: 'veiculos',
  coracao: 'coracoes', presente: 'aniversario', pipa: 'brinquedos', bola: 'futebol', coroa: 'princesas-e-coroas', robo: 'brinquedos',
  'arvore-de-natal': 'natal', 'boneco-de-neve': 'natal', abobora: 'halloween', fantasma: 'halloween', 'ovo-de-pascoa': 'pascoa',
};

const place = (art, x, y, s, sw = 9) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" stroke-width="${f(sw / s)}">${art}</g>`;

const FRAMES = {
  estrelas(R) {
    let s = rect(30, 30, 940, 940, 40, ' fill="none"');
    for (let x = 90; x <= 910; x += 82) s += star(x, 30, 22, 10) + star(x, 970, 22, 10);
    for (let y = 112; y <= 888; y += 82) s += star(30, y, 22, 10) + star(970, y, 22, 10);
    return s;
  },
  coracoes() {
    let s = rect(40, 40, 920, 920, 40, ' fill="none"');
    for (let x = 100; x <= 900; x += 80) s += heart(x, 40, 18) + heart(x, 960, 18);
    for (let y = 120; y <= 880; y += 80) s += heart(40, y, 18) + heart(960, y, 18);
    return s;
  },
  ondas() {
    let d = 'M60 40';
    for (let x = 60; x < 940; x += 40) d += ` q20 -26 40 0`;
    let d2 = 'M60 960';
    for (let x = 60; x < 940; x += 40) d2 += ` q20 26 40 0`;
    let d3 = 'M40 60';
    for (let y = 60; y < 940; y += 40) d3 += ` q-26 20 0 40`;
    let d4 = 'M960 60';
    for (let y = 60; y < 940; y += 40) d4 += ` q26 20 0 40`;
    return rect(60, 60, 880, 880, 30, ' fill="none"') + line(d) + line(d2) + line(d3) + line(d4);
  },
  bolinhas() {
    let s = rect(55, 55, 890, 890, 50, ' fill="none"') + rect(30, 30, 940, 940, 70, ' fill="none"');
    for (let x = 110; x <= 890; x += 60) s += circ(x, 42, 8) + circ(x, 958, 8);
    for (let y = 110; y <= 890; y += 60) s += circ(42, y, 8) + circ(958, y, 8);
    return s;
  },
};

function artPages() {
  const out = [];
  for (const [key, sub] of Object.entries(SUBJECTS)) {
    const cat = SUBJECT_CAT[key] || 'animais';
    const art = sub.draw();
    const base = slugify(sub.name);
    const R = rng(key.length * 977 + key.charCodeAt(0));
    out.push({ id: `a-${base}`, slug: `${base}-fofo`, cat, level: 'facil', age: '3-6', kind: 'ilustracao', subject: sub.name, g: sub.g,
      title: `${sub.name} fofo${sub.g === 'f' ? 'a' : ''} para colorir`.replace('fofoa', 'fofa'),
      alt: `Desenho de ${sub.name.toLowerCase()} fofo${sub.g === 'f' ? 'a' : ''} para colorir, com traço grosso`.replace('fofoa', 'fofa'),
      svg: svgDoc(art, { sw: 9 }) });
    const name = textInBox(sub.name.toUpperCase(), 500, 815, 960, 900, 220);
    out.push({ id: `a-${base}-nome`, slug: `${base}-com-nome`, cat, level: 'facil', age: '4-7', kind: 'nome', subject: sub.name, g: sub.g,
      title: `${sub.name} com nome para colorir`, alt: `Desenho de ${sub.name.toLowerCase()} com a palavra ${sub.name.toUpperCase()} em letras vazadas para colorir`,
      svg: svgDoc(place(art, 140, 0, 0.74) + outlined(name.d, ' stroke-width="7"'), { sw: 9 }) });
    const fk = R.pick(Object.keys(FRAMES));
    out.push({ id: `a-${base}-moldura`, slug: `${base}-com-moldura`, cat, level: 'medio', age: '5-9', kind: 'moldura', subject: sub.name, g: sub.g,
      title: `${sub.name} com moldura de ${{ estrelas: 'estrelas', coracoes: 'corações', ondas: 'ondas', bolinhas: 'bolinhas' }[fk]} para colorir`,
      alt: `Desenho de ${sub.name.toLowerCase()} dentro de uma moldura decorada para colorir`,
      svg: svgDoc(FRAMES[fk](R) + place(art, 125, 125, 0.75), { sw: 7 }) });
    out.push({ id: `a-${base}-pontilhado`, slug: `${base}-pontilhado`, cat: 'pontilhados', parentCat: cat, level: 'facil', age: '3-6', kind: 'pontilhado', subject: sub.name, g: sub.g,
      title: `${sub.name} pontilhado para cobrir e colorir`, alt: `Desenho pontilhado de ${sub.name.toLowerCase()} para a criança cobrir os pontos e depois colorir`,
      svg: svgDoc(`<g stroke="#555" stroke-dasharray="0.5 20" stroke-width="11">${art.replace(/fill="#111"/g, 'fill="#fff"')}</g>`, { sw: 11 }) });
  }
  return out;
}

const LETTER_WORDS = { A: 'abelha', B: 'borboleta', C: 'capivara', D: 'dinossauro', E: 'elefante', F: 'flor', G: 'gato', H: 'helicoptero', I: 'iglu', J: 'joaninha', K: 'kiwi', L: 'leao', M: 'maca', N: 'nuvem', O: 'ovelha', P: 'pinguim', Q: 'queijo', R: 'robo', S: 'sol', T: 'tartaruga', U: 'urso', V: 'vaca', W: 'waffle', X: 'xicara', Y: 'cachorro', Z: 'zebra' };
const LETTER_LABEL = { Y: 'Yorkshire' };

function guideLines(y0, rows, gap = 120) {
  let s = '';
  for (let i = 0; i < rows; i++) {
    const y = y0 + i * gap;
    s += `<path d="M60 ${y} L940 ${y}" fill="none" stroke="#bbb" stroke-width="3"/><path d="M60 ${y - 80} L940 ${y - 80}" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="10 10"/>`;
  }
  return s;
}

function letterPages() {
  const out = [];
  for (const L of Object.keys(LETTER_WORDS)) {
    const sub = SUBJECTS[LETTER_WORDS[L]];
    const word = LETTER_LABEL[L] || sub.name;
    const art = sub.draw();
    const big = textInBox(L + L.toLowerCase(), 270, 120, 560, 470, 600);
    const w = textInBox(word.toUpperCase(), 500, 760, 920, 880, 200);
    out.push({ id: `l-${L}-desenho`, slug: `letra-${L.toLowerCase()}-de-${slugify(word)}`, cat: 'letras-do-alfabeto', level: 'facil', age: '3-6', kind: 'letra', letter: L,
      title: `Letra ${L} de ${word} para colorir`, alt: `Letra ${L} maiúscula e minúscula com desenho de ${word.toLowerCase()} para colorir`,
      svg: svgDoc(outlined(big.d) + place(art, 520, 150, 0.44) + outlined(w.d, ' stroke-width="7"') + rect(30, 30, 940, 940, 40, ' fill="none" stroke-width="6"'), { sw: 8 }) });
    // decorated letter filled with a pattern
    const R = rng(L.charCodeAt(0) * 31);
    const ptype = R.pick(['hexFlowers', 'scales', 'hearts', 'bubbles', 'quatrefoil', 'waves']);
    const huge = textInBox(L, 500, 110, 880, 780, 900);
    const fill = patternFills[ptype](R, 'facil');
    out.push({ id: `l-${L}-decorada`, slug: `letra-${L.toLowerCase()}-decorada`, cat: 'letras-do-alfabeto', level: 'medio', age: '6-12', kind: 'letra-decorada', letter: L,
      title: `Letra ${L} decorada para colorir`, alt: `Letra ${L} gigante decorada com padrão de ${patternTypes[ptype].toLowerCase()} para colorir`,
      svg: svgDoc(`<defs><clipPath id="L"><path d="${huge.d}"/></clipPath></defs>${outlined(huge.d)}<g clip-path="url(#L)" stroke-width="5">${fill}</g><path d="${huge.d}" fill="none" stroke-width="12"/>` +
        star(110, 120, 40, 17) + star(890, 140, 34, 15) + heart(120, 880, 30) + star(880, 880, 40, 17) + circ(860, 500, 16) + circ(130, 520, 12), { sw: 6 }) });
    // tracing worksheet
    const tr = textInBox(L + L.toLowerCase(), 300, 70, 380, 480, 380);
    const tw = textInBox(word, 500, 820, 930, 860, 160);
    let rows = '';
    for (let r = 0; r < 2; r++) {
      const y = 560 + r * 140;
      for (let i = 0; i < 6; i++) {
        const ch = r === 0 ? L : L.toLowerCase();
        const t = textInBox(ch, 120 + i * 152, y - 110, y, 140, 140);
        rows += i === 0 ? `<path d="${t.d}" fill="none" stroke-width="6"/>` : dotted(t.d, 8);
      }
    }
    out.push({ id: `l-${L}-tracejado`, slug: `letra-${L.toLowerCase()}-para-cobrir`, cat: 'letras-do-alfabeto', level: 'facil', age: '4-6', kind: 'atividade', letter: L,
      title: `Atividade da letra ${L} para cobrir o pontilhado`, alt: `Folha de atividade com a letra ${L} pontilhada para cobrir, treinar a escrita e colorir`,
      svg: svgDoc(outlined(tr.d) + place(art, 600, 60, 0.36) + guideLines(560, 2, 140) + rows + guideLines(930, 1) + dotted(tw.d, 8), { sw: 8 }) });
    // big bubble letter
    const bub = textInBox(L, 500, 90, 900, 820, 1000);
    out.push({ id: `l-${L}-gigante`, slug: `letra-${L.toLowerCase()}-gigante`, cat: 'letras-do-alfabeto', level: 'facil', age: '2-5', kind: 'letra', letter: L,
      title: `Letra ${L} gigante para colorir e imprimir`, alt: `Molde da letra ${L} gigante vazada para colorir, recortar ou decorar a sala`,
      svg: svgDoc(outlined(bub.d, ' stroke-width="12"'), { sw: 12 }) });
  }
  return out;
}

const NUM_WORDS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];
const COUNT_ITEMS = ['maca', 'estrela', 'peixe', 'coracao', 'joaninha', 'pintinho', 'morango', 'balao', 'sorvete', 'pipa', 'maca', 'estrela', 'peixe', 'morango', 'balao', 'coracao', 'maca', 'estrela', 'pipa', 'peixe', 'coracao'];

function numberPages() {
  const out = [];
  for (let n = 0; n <= 20; n++) {
    const item = SUBJECTS[COUNT_ITEMS[n]];
    const art = item.draw();
    const num = textInBox(String(n), 230, 90, 520, 380, 600);
    const word = textInBox(NUM_WORDS[n].toUpperCase(), 230, 560, 680, 400, 150);
    // grid of n items on the right side (440..960 x 60..940)
    let grid = '';
    if (n > 0) {
      const cols = n <= 4 ? 2 : n <= 9 ? 3 : n <= 16 ? 4 : 5;
      const rows = Math.ceil(n / cols);
      const cw = 520 / cols, ch = Math.min(880 / rows, cw * 1.05);
      const s = Math.min(cw, ch) / 1000 * 0.92;
      for (let i = 0; i < n; i++) {
        const c = i % cols, r = Math.floor(i / cols);
        grid += place(art, 440 + c * cw + (cw - 1000 * s) / 2, 60 + r * ch + (ch - 1000 * s) / 2, s, n >= 10 ? 3.5 : n >= 5 ? 4.5 : 6);
      }
    } else {
      grid = `<path d="M560 300 C560 220 860 220 860 300 L860 640 C860 720 560 720 560 640Z" fill="none" stroke-dasharray="20 18"/>`;
    }
    out.push({ id: `n-${n}-contar`, slug: `numero-${n}-para-contar-e-colorir`, cat: 'numeros', level: 'facil', age: '3-6', kind: 'numero', number: n,
      title: `Número ${n} (${NUM_WORDS[n]}) para contar e colorir`, alt: `Número ${n} escrito por extenso (${NUM_WORDS[n]}) com ${n} ${n === 1 ? item.name.toLowerCase() : item.plural} para contar e colorir`,
      svg: svgDoc(outlined(num.d) + outlined(word.d, ' stroke-width="6"') + `<path d="M410 60 L410 940" fill="none" stroke="#bbb" stroke-width="3" stroke-dasharray="10 12"/>` + grid +
        `<rect x="80" y="760" width="300" height="140" rx="20" fill="none" stroke-width="6"/>` + textBoxHint(), { sw: 8 }) });
    if (n <= 10) {
      const tr = textInBox(String(n), 500, 70, 470, 600, 500);
      let rows = '';
      for (let r = 0; r < 2; r++) {
        const y = 650 + r * 150;
        for (let i = 0; i < 6; i++) {
          const t = textInBox(String(n), 120 + i * 152, y - 110, y, 140, 140);
          rows += i === 0 ? `<path d="${t.d}" fill="none" stroke-width="6"/>` : dotted(t.d, 8);
        }
      }
      const ww = textInBox(NUM_WORDS[n], 500, 870, 960, 700, 120);
      out.push({ id: `n-${n}-cobrir`, slug: `numero-${n}-para-cobrir`, cat: 'numeros', level: 'facil', age: '4-6', kind: 'atividade', number: n,
        title: `Atividade do número ${n} para cobrir o pontilhado`, alt: `Folha de atividade com o número ${n} pontilhado para treinar a escrita`,
        svg: svgDoc(dotted(tr.d, 12) + guideLines(650, 2, 150) + rows + dotted(ww.d, 7), { sw: 8 }) });
      const R = rng(n * 131 + 7);
      const ptype = R.pick(['hexFlowers', 'hearts', 'bubbles', 'scales', 'quatrefoil']);
      const huge = textInBox(String(n), 500, 100, 900, n === 10 ? 860 : 620, 900);
      out.push({ id: `n-${n}-decorado`, slug: `numero-${n}-decorado`, cat: 'numeros', level: 'medio', age: '6-12', kind: 'numero-decorado', number: n,
        title: `Número ${n} decorado para colorir`, alt: `Número ${n} gigante decorado com padrão para colorir`,
        svg: svgDoc(`<defs><clipPath id="N"><path d="${huge.d}"/></clipPath></defs>${outlined(huge.d)}<g clip-path="url(#N)" stroke-width="5">${patternFills[ptype](R, 'facil')}</g><path d="${huge.d}" fill="none" stroke-width="12"/>` + star(120, 130, 40, 17) + star(880, 860, 40, 17), { sw: 6 }) });
    }
  }
  return out;
}
function textBoxHint() {
  const t = textInBox('ESCREVA', 230, 735, 752, 200, 24);
  return `<path d="${t.d}" fill="#888" stroke="none"/>`;
}

function mandalaPages() {
  const out = [];
  const plan = { facil: 150, medio: 150, dificil: 150 };
  const label = { facil: 'fácil', medio: 'média', dificil: 'difícil' };
  for (const [lv, count] of Object.entries(plan))
    for (let i = 1; i <= count; i++)
      out.push({ id: `m-${lv}-${i}`, slug: `mandala-${lv}-${i}`, cat: 'mandalas', level: lv, age: lv === 'facil' ? '5-10' : lv === 'medio' ? '9-14' : 'adultos', kind: 'mandala',
        title: `Mandala ${label[lv]} para colorir nº ${i}`, alt: `Mandala ${label[lv]} número ${i} para colorir e imprimir, desenho simétrico original`,
        lazySvg: () => mandala(i * 17 + { facil: 1, medio: 5000, dificil: 9000 }[lv], lv) });
  return out;
}

function patternPages() {
  const out = [];
  const label = { facil: 'fácil', medio: 'médio', dificil: 'difícil' };
  for (const [t, name] of Object.entries(patternTypes))
    for (const lv of ['facil', 'medio', 'dificil'])
      for (let i = 1; i <= 10; i++)
        out.push({ id: `p-${t}-${lv}-${i}`, slug: `${slugify(name)}-${lv}-${i}`, cat: 'padroes-e-arte-relaxante', level: lv, age: lv === 'dificil' ? 'adultos' : '8-14', kind: 'padrao',
          title: `Padrão ${name.toLowerCase()} ${label[lv]} para colorir nº ${i}`, alt: `Página de padrão ${name.toLowerCase()} nível ${label[lv]} para colorir, arte relaxante`,
          lazySvg: () => pattern(t, i * 7 + lv.length, lv) });
  return out;
}


function brazilFlag() {
  // Proportions 20:14. Width 900 -> unit m = 45. Rhombus 1.7m from edges, circle radius 3.5m.
  const W = 900, H = 630, x0 = 50, y0 = 185, m = W / 20;
  const cx = x0 + W / 2, cy = y0 + H / 2, r = 3.5 * m;
  let s = rect(x0, y0, W, H, 0);
  s += p(`M${f(x0 + 1.7 * m)} ${f(cy)} L${f(cx)} ${f(y0 + 1.7 * m)} L${f(x0 + W - 1.7 * m)} ${f(cy)} L${f(cx)} ${f(y0 + H - 1.7 * m)}Z`);
  s += circ(cx, cy, r);
  // white band: arc from left to right across the circle
  const band = `M${f(cx - r * 0.985)} ${f(cy + r * 0.17)} Q${f(cx)} ${f(cy - r * 0.62)} ${f(cx + r * 0.94)} ${f(cy + r * 0.34)} L${f(cx + r * 0.9)} ${f(cy + r * 0.46)} Q${f(cx)} ${f(cy - r * 0.4)} ${f(cx - r * 0.995)} ${f(cy + r * 0.3)}Z`;
  s += p(band);
  // approximate star field (27 stars) below the band
  const stars = [[0.0, 0.62, 13], [0.0, 0.42, 9], [-0.08, 0.52, 8], [0.1, 0.5, 8], [0.05, 0.72, 7], [-0.42, 0.42, 9], [-0.55, 0.28, 8], [-0.62, 0.48, 9], [-0.5, 0.6, 7], [-0.34, 0.56, 7],
    [-0.72, 0.36, 7], [-0.25, 0.75, 9], [0.32, 0.38, 9], [0.45, 0.48, 8], [0.55, 0.36, 8], [0.62, 0.55, 7], [0.4, 0.66, 9], [0.28, 0.82, 8], [0.18, 0.62, 7], [-0.15, 0.32, 7],
    [0.22, 0.24, 7], [0.48, 0.2, 8], [0.68, 0.22, 7], [-0.2, 0.9, 7], [0.1, 0.88, 7], [-0.62, 0.66, 7], [0.0, 0.16, 10]];
  s += '<g stroke-width="2.6">';
  for (const [dx, dy, sz] of stars) s += star(cx + dx * r, cy + dy * r * 0.95, sz * 1.5, sz * 0.62);
  s += '</g>';
  const motto = textInBox('ORDEM E PROGRESSO', cx - 4, cy - r * 0.08, cy + r * 0.08, r * 1.3, 40);
  s += `<g transform="rotate(-13 ${f(cx)} ${f(cy + r * 0.02)})"><path d="${motto.d}" fill="#111" stroke="none"/></g>`;
  return s;
}
function brazilPages() {
  const flag = brazilFlag();
  const title = textInBox('BRASIL', 500, 40, 160, 600, 160);
  return [
    { id: 'bf-brasil', slug: 'bandeira-do-brasil-para-colorir', cat: 'bandeiras', level: 'facil', age: '4-10', kind: 'bandeira', subject: 'Bandeira do Brasil', title: 'Bandeira do Brasil para colorir',
      alt: 'Bandeira do Brasil para colorir com losango, círculo, estrelas e a faixa Ordem e Progresso', svg: svgDoc(outlined(title.d, ' stroke-width="7"') + flag, { sw: 7 }) },
    { id: 'bf-brasil-moldura', slug: 'bandeira-do-brasil-com-moldura-para-colorir', cat: 'bandeiras', level: 'medio', age: '6-12', kind: 'bandeira', subject: 'Bandeira do Brasil', title: 'Bandeira do Brasil com moldura de estrelas para colorir',
      alt: 'Bandeira do Brasil para colorir dentro de uma moldura de estrelas, ideal para o 7 de Setembro e a Copa', svg: svgDoc(FRAMES.estrelas() + `<g transform="translate(95 60) scale(0.81)">${flag}</g>` + outlined(textInBox('INDEPENDÊNCIA DO BRASIL', 500, 760, 860, 760, 90).d, ' stroke-width="5"'), { sw: 6 }) },
  ];
}

export function originalPages() {
  return [...artPages(), ...letterPages(), ...numberPages(), ...mandalaPages(), ...patternPages(), ...pixelPages(), ...brazilPages()]
    .map((pg) => ({ ...pg, source: 'original' }));
}
