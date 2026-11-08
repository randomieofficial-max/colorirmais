// Original pixel-art "colorir por números" (color by number) pages.
import { svgDoc, f } from './util.mjs';

const PALETTE = {
  R: ['vermelho', '#e53935'], O: ['laranja', '#fb8c00'], Y: ['amarelo', '#fdd835'], G: ['verde', '#43a047'], L: ['verde-claro', '#9ccc65'],
  B: ['azul', '#1e88e5'], C: ['azul-claro', '#4fc3f7'], P: ['roxo', '#8e24aa'], K: ['rosa', '#f06292'], N: ['marrom', '#6d4c41'],
  W: ['branco', '#ffffff'], D: ['preto', '#212121'], S: ['cinza', '#9e9e9e'], T: ['bege', '#ffcc80'],
};

const DESIGNS = {
  'Coração': ['..RR...RR..', '.RRRR.RRRR.', 'RRWRRRRRRRR', 'RWRRRRRRRRR', 'RRRRRRRRRRR', '.RRRRRRRRR.', '..RRRRRRR..', '...RRRRR...', '....RRR....', '.....R.....'],
  'Estrela': ['.....Y.....', '....YYY....', '....YYY....', 'YYYYYYYYYYY', '.YYYDYDYYY.', '..YYYYYYY..', '..YYKDKYY..', '.YYYY.YYYY.', '.YYY...YYY.', 'YY.......YY'],
  'Maçã': ['.....N......', '.....NGG....', '....RNGGR...', '.RRRRRRRRRR.', 'RRWRRRRRRRRR', 'RWRRRRRRRRRR', 'RRRRRRRRRRRR', 'RRRRRRRRRRRR', '.RRRRRRRRRR.', '..RRRR.RRR..'],
  'Cogumelo': ['...RRRRRR...', '.RRWWRRRRRR.', 'RRRWWRRRWWRR', 'RRRRRRRRWWRR', 'RWWRRRRRRRRR', 'RWWRRRWWRRRR', '.RRRRRWWRRR.', '...TTTTTT...', '...TDTTDT...', '...TTTTTT...', '...TTTTTT...', '....TTTT....'],
  'Sorvete': ['....KKK....', '...KKKKK...', '..KKWKKKK..', '..KKKKKKK..', '.YYYYYYYYY.', '..OYOYOYO..', '...YOYOY...', '...OYOYO...', '....YOY....', '....OYO....', '.....Y.....'],
  'Gato': ['D.........D', 'DD.......DD', 'DOD.....DOD', 'DOODDDDDOOD', 'DOOOOOOOOOD', 'DOWDOOOWDOD', 'DOOOOKOOOOD', 'DOOODDDOOOD', '.DOOOOOOOD.', '..DDDDDDD..'],
  'Peixe': ['.....BB.....', '....BBBB...C', '..BBBBBBB.CC', '.BWDBBBBBCCC', 'BBBBBYBYBBCC', '.BBBBBBBB.CC', '..BBBBBB...C', '....BB......'],
  'Casa': ['.....RR.....', '....RRRR....', '...RRRRRR...', '..RRRRRRRR..', '.RRRRRRRRRR.', '..TTTTTTTT..', '..TCCTTCCT..', '..TCCTTCCT..', '..TTTNNTTT..', '..TTTNNTTT..', '..TTTNNTTT..', 'GGGGGGGGGGGG'],
  'Árvore': ['....GGGG....', '..GGGGGGGG..', '.GGRGGGGGGG.', 'GGGGGGGRGGGG', 'GGRGGGGGGGGG', '.GGGGGRGGGG.', '..GGGGGGGG..', '.....NN.....', '.....NN.....', '.....NN.....', '...NNNNNN...'],
  'Flor': ['...K.K.K...', '..KKKKKKK..', '.KKKYYYKKK.', '..KKYYYKK..', '.KKKYYYKKK.', '..KKKKKKK..', '...K.K.K...', '.....G.....', '.LL..G.....', '..LLGG.LL..', '.....GLL...', '.....G.....'],
  'Sol': ['Y....Y....Y', '.Y...Y...Y.', '..OOOOOOO..', '..OYYYYYO..', '..OYDYDYO..', 'YYOYYYYYOYY', '..OYDDDYO..', '..OYYYYYO..', '..OOOOOOO..', '.Y...Y...Y.', 'Y....Y....Y'],
  'Foguete': ['.....R.....', '....RRR....', '...SSSSS...', '...SCCCS...', '...SCCCS...', '...SSSSS...', '...SSSSS...', '..RSSSSSR..', '.RRSSSSSRR.', '.RR.OYO.RR.', '....OYO....', '.....O.....'],
  'Morango': ['...G.G.G...', '....GGG....', '..RRRRRRR..', '.RRYRRRYRR.', '.RRRRYRRRR.', '.RYRRRRRYR.', '..RRRYRRR..', '..RRRRRRR..', '...RYRRR...', '....RRR....', '.....R.....'],
  'Melancia': ['GGGGGGGGGGGGG', '.LLLLLLLLLLL.', '.RRRRRRRRRRR.', '..RRDRRRDRR..', '..RRRRRRRRR..', '...RRDRRDR...', '....RRRRR....', '.....RDR.....', '......R......'],
  'Pinguim': ['....DDDD....', '...DDDDDD...', '..DDWDDWDD..', '..DDDOODDD..', '.DDWWWWWWDD.', 'DDDWWWWWWDDD', 'DD.WWWWWW.DD', '...WWWWWW...', '...WWWWWW...', '....DDDD....', '...OO..OO...'],
  'Sapo': ['.WW......WW.', 'WDWG....GWDW', '.WWGGGGGGWW.', '.GGGGGGGGGG.', 'GGGGGGGGGGGG', 'GDGGGGGGGGDG', 'GGDDDDDDDDGG', '.GGGGGGGGGG.', '..LLLLLLLL..', '.GG......GG.'],
  'Arco-íris': ['...RRRRRRR...', '..RROOOOORR..', '.ROOYYYYYOOR.', 'ROYYGGGGGYYOR', 'ROYGGBBBGGYOR', 'ROYGBB.BBGYOR', 'ROYGB...BGYOR', 'WWWWB...BWWWW', 'WWWWW...WWWWW'],
  'Abacaxi': ['...G.G.G...', '....GGG....', '...G.G.G...', '.....G.....', '...YYYYY...', '..YOYYYOY..', '..YYYOYYY..', '..YOYYYOY..', '..YYYOYYY..', '..YOYYYOY..', '...YYYYY...'],
  'Joaninha': ['...D...D...', '....D.D.....', '...DDDDD...', '..RRRDRRR..', '.RRDRDRDRR.', '.RRRRDRRRR.', '.RDRRDRRDR.', '.RRRRDRRRR.', '..RRRDRRR..', '...RRDRR...'],
  'Pirulito': ['...KKKKK...', '..KWWKKKK..', '.KWKKKWWKK.', '.KKKWWKKWK.', '.KWWKKKWKK.', '..KKKWKKK..', '...KKKKK...', '.....T.....', '.....T.....', '.....T.....', '.....T.....'],
  'Coruja': ['.N.......N.', '.NN.....NN.', '.NNNNNNNNN.', 'NWWWNNNWWWN', 'NWDWNNNWDWN', 'NWWWNONWWWN', 'NNNNNONNNNN', 'NNTTTTTTTNN', '.NTNTNTNTN.', '.NTTTTTTTN.', '..NNNNNNN..', '...OO.OO...'],
  'Carro': ['....RRRRR.....', '...RCCRCCR....', '..RRCCRCCRR...', 'RRRRRRRRRRRRRR', 'RYRRRRRRRRRRRR', 'RRRRRRRRRRRRRO', '.RDDRRRRRDDRR.', '..DSD...DSD...', '...D.....D....'],
  'Abelha': ['..CC...CC..', '.CWWC.CWWC.', '..CC.D.CC..', '...YYYYY...', '..YDDDDDY..', '.YYYYYYYYY.', '.YDDDDDDDY.', '.YYYYYYYYY.', '..YDDDDDY..', '...YYYYY...', '.....D.....'],
  'Diamante': ['..CCCCCCC..', '.CWCCBCCWC.', 'CCCCBBBCCCC', 'BBBBBBBBBBB', '.BCCBBBCCB.', '..BCCBCCB..', '...BCCCB...', '....BCB....', '.....B.....'],
};

export function pixelPages() {
  const out = [];
  for (const [name, rows] of Object.entries(DESIGNS)) {
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
    const grid = rows.map((r) => r.padEnd(w, '.'));
    const used = [...new Set(grid.join('').replace(/\./g, ''))];
    const num = Object.fromEntries(used.map((c, i) => [c, i + 1]));
    const cell = Math.min(860 / w, 700 / h);
    const ox = (1000 - cell * w) / 2, oy = 40 + (720 - cell * h) / 2;
    let s = '';
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const c = grid[y][x];
        if (c === '.') continue;
        const X = ox + x * cell, Y = oy + y * cell;
        s += `<rect x="${f(X)}" y="${f(Y)}" width="${f(cell)}" height="${f(cell)}"/>`;
        s += `<text x="${f(X + cell / 2)}" y="${f(Y + cell * 0.68)}" font-size="${f(cell * 0.46)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" fill="#777" stroke="none">${num[c]}</text>`;
      }
    // legend
    let leg = '';
    const per = Math.min(used.length, 4), lw = 900 / per;
    used.forEach((c, i) => {
      const col = i % per, row = Math.floor(i / per);
      const X = 50 + col * lw, Y = 800 + row * 80;
      leg += `<rect x="${f(X)}" y="${f(Y)}" width="54" height="54" rx="10" fill="${PALETTE[c][1]}" stroke-width="4"/>` +
        `<text x="${f(X + 70)}" y="${f(Y + 38)}" font-size="27" font-family="Arial, Helvetica, sans-serif" fill="#222" stroke="none">${num[c]} = ${PALETTE[c][0]}</text>`;
    });
    const slug = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    out.push({ id: `px-${slug}`, slug: `${slug}-pixel-art-colorir-por-numeros`, cat: 'pixel-art', level: used.length > 5 ? 'medio' : 'facil', age: '5-10', kind: 'pixel',
      title: `${name} em pixel art para colorir por números`, alt: `Pixel art de ${name.toLowerCase()} para colorir por números, com legenda de ${used.length} cores`,
      colors: used.map((c) => PALETTE[c][0]),
      svg: svgDoc(`<g stroke-width="2.5" stroke="#555">${s}</g>${leg}`, { sw: 3 }) });
  }
  return out;
}
