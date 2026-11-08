// Static site builder for Colorir Mais. Usage: node src/build.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { originalPages, SUBJECTS } from './gen/compose.mjs';
import { CATEGORIES, GROUPS } from './data/categories.mjs';
import { layout, crumbs, crumbsLd, card, icon, LEVEL, SITE, setFooterCats, LOGO } from './templates.mjs';
import { esc, slugify, rng } from './gen/util.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, 'node_modules', '.cache', 'colorirmais');
const PER_PAGE = 48;
const T0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s]`, ...a);

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'img', 'd'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'img', 't'), { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });

function write(rel, content) {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

// ---------- static assets ----------
copyDir(path.join(ROOT, 'public'), DIST);
const fontDir = path.join(DIST, 'assets', 'fonts');
fs.mkdirSync(fontDir, { recursive: true });
const NM = path.join(ROOT, 'node_modules', '@fontsource');
fs.copyFileSync(path.join(NM, 'fredoka/files/fredoka-latin-600-normal.woff2'), path.join(fontDir, 'fredoka-600.woff2'));
fs.copyFileSync(path.join(NM, 'fredoka/files/fredoka-latin-500-normal.woff2'), path.join(fontDir, 'fredoka-500.woff2'));
fs.copyFileSync(path.join(NM, 'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2'), path.join(fontDir, 'atkinson-400.woff2'));
fs.copyFileSync(path.join(NM, 'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2'), path.join(fontDir, 'atkinson-700.woff2'));
fs.copyFileSync(path.join(NM, 'fredoka/files/fredoka-latin-700-normal.woff'), path.join(fontDir, 'fredoka-700.woff'));
fs.copyFileSync(path.join(ROOT, 'node_modules/opentype.js/dist/opentype.min.js'), path.join(DIST, 'assets', 'opentype.min.js'));
const V = crypto.createHash('md5').update(['site.css', 'app.js', 'painter.js', 'nome.js'].map((f) => { try { return fs.readFileSync(path.join(ROOT, 'public/assets', f)); } catch { return ''; } }).join('')).digest('hex').slice(0, 8);
for (const f of ['app.js']) {
  const p = path.join(DIST, 'assets', f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('__V__', V));
}

// ---------- collect pages ----------
const catBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
let pages = originalPages();
const extFile = path.join(ROOT, 'data', 'external.json');
const external = fs.existsSync(extFile) ? JSON.parse(fs.readFileSync(extFile, 'utf8')) : [];
pages = pages.concat(external.filter((e) => fs.existsSync(path.join(ROOT, e.file))));
pages = pages.filter((p) => catBySlug[p.cat]);
// unique slugs
const seen = new Set();
for (const p of pages) {
  let s = p.slug, n = 2;
  while (seen.has(s)) s = `${p.slug}-${n++}`;
  seen.add(s); p.slug = s;
  p.url = `/${p.cat}-para-colorir/${p.slug}/`;
  p.ext = p.source === 'original' ? 'svg' : 'png';
  p.src = `/img/d/${p.slug}.${p.ext}`;
  p.thumb = `/img/t/${p.slug}.webp`;
}
log('pages', pages.length, 'original', pages.filter((p) => p.source === 'original').length, 'external', pages.filter((p) => p.source !== 'original').length);

// ---------- images ----------
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}
await pool(pages, 8, async (p) => {
  const thumbOut = path.join(DIST, 'img', 't', p.slug + '.webp');
  if (p.source === 'original') {
    const svg = p.svg || p.lazySvg();
    p.svg = undefined; p.lazySvg = undefined;
    fs.writeFileSync(path.join(DIST, 'img', 'd', p.slug + '.svg'), svg);
    const key = crypto.createHash('md5').update(svg).digest('hex');
    const cached = path.join(CACHE, key + '.webp');
    if (!fs.existsSync(cached)) await sharp(Buffer.from(svg), { density: 40 }).resize(360, 360, { fit: 'contain', background: '#fff' }).flatten({ background: '#fff' }).webp({ quality: 80 }).toFile(cached);
    fs.copyFileSync(cached, thumbOut);
    p.w = 1000; p.h = 1000;
  } else {
    const src = path.join(ROOT, p.file);
    fs.copyFileSync(src, path.join(DIST, 'img', 'd', p.slug + '.png'));
    const st = fs.statSync(src);
    const key = crypto.createHash('md5').update(p.file + st.size).digest('hex');
    const cached = path.join(CACHE, key + '.webp');
    if (!fs.existsSync(cached)) await sharp(src).resize(360, 360, { fit: 'contain', background: '#fff' }).flatten({ background: '#fff' }).webp({ quality: 80 }).toFile(cached);
    fs.copyFileSync(cached, thumbOut);
  }
});
log('images done');

// ---------- grouping ----------
const byCat = {};
for (const p of pages) (byCat[p.cat] ??= []).push(p);
// interleave levels inside categories so first page shows variety
const ORDER = { ilustracao: 0, nome: 1, moldura: 2, letra: 0, 'letra-decorada': 1, atividade: 2, numero: 0, 'numero-decorado': 1, pontilhado: 3 };
for (const [c, list] of Object.entries(byCat)) {
  if (c === 'mandalas' || c === 'padroes-e-arte-relaxante') {
    const R = rng(c.length * 99);
    byCat[c] = R.shuffle(list);
  } else if (c === 'letras-do-alfabeto') list.sort((a, b) => a.letter.localeCompare(b.letter) || (ORDER[a.kind] ?? 9) - (ORDER[b.kind] ?? 9));
  else if (c === 'numeros') list.sort((a, b) => a.number - b.number || (ORDER[a.kind] ?? 9) - (ORDER[b.kind] ?? 9));
  else list.sort((a, b) => (a.source === 'original' ? 0 : 1) - (b.source === 'original' ? 0 : 1) || (ORDER[a.kind] ?? 5) - (ORDER[b.kind] ?? 5));
}
const cats = CATEGORIES.filter((c) => byCat[c.slug]?.length);
cats.forEach((c) => { c.count = byCat[c.slug].length; c.url = `/${c.slug}-para-colorir/`; c.cover = byCat[c.slug].slice(0, 3); });
const POPULAR = ['animais-brasileiros', 'mandalas', 'letras-do-alfabeto', 'animais', 'natal', 'dinossauros', 'unicornios', 'numeros', 'flores', 'fundo-do-mar', 'veiculos', 'pixel-art'].map((s) => catBySlug[s]).filter((c) => c && c.count);
setFooterCats(POPULAR);

// ---------- text helpers ----------
const plural = (n, a, b) => `${n.toLocaleString('pt-BR')} ${n === 1 ? a : b}`;
const kindText = {
  ilustracao: (p) => `Este desenho de ${p.subject.toLowerCase()} tem traço grosso e áreas grandes, ideal para crianças pequenas que estão aprendendo a pintar sem sair da linha.`,
  nome: (p) => `Além do desenho, a palavra ${p.subject.toUpperCase()} aparece em letras vazadas. A criança pinta o desenho e as letras ao mesmo tempo e ainda treina a leitura do nome.`,
  moldura: (p) => `A moldura decorada transforma o desenho num quadrinho: depois de pintar, dá para recortar e pendurar na parede ou entregar de presente.`,
  pontilhado: (p) => `O desenho vem pontilhado: primeiro a criança cobre os pontinhos com o lápis, depois pinta. É um exercício de coordenação motora fina que prepara a mão para a escrita.`,
  letra: (p) => `A letra ${p.letter} aparece grande e vazada para colorir${p.slug.includes('-de-') ? `, junto com um desenho de uma palavra que começa com ${p.letter}` : ''}. Fale o som da letra em voz alta enquanto a criança pinta.`,
  'letra-decorada': (p) => `A letra ${p.letter} gigante vem preenchida com um padrão decorativo. É ótima para crianças maiores e para montar um varal do alfabeto na sala.`,
  atividade: (p) => p.letter ? `Folha de atividade da letra ${p.letter}: cubra a letra pontilhada em maiúscula e minúscula seguindo as linhas, depois pinte o desenho. Ideal para educação infantil e 1º ano.` : `Folha de atividade do número ${p.number}: cubra os números pontilhados seguindo as linhas e escreva o nome do número. Ideal para educação infantil.`,
  numero: (p) => p.number === 0 ? 'O zero representa nenhuma quantidade: a área tracejada mostra que não há nada para contar. Pinte o número e a palavra ZERO.' : `Conte os ${p.number} desenhos, pinte cada um com uma cor e escreva o número ${p.number} no quadradinho. Pinte também o número grande e a palavra escrita por extenso.`,
  'numero-decorado': (p) => `O número ${p.number} aparece gigante e decorado com padrão. Use para montar uma linha numérica na parede ou como capa de atividade.`,
  mandala: (p) => `Mandala original e simétrica, desenhada exclusivamente para o Colorir Mais. Pinte de dentro para fora, escolhendo poucas cores que combinem, e repita as cores em cada anel.`,
  padrao: (p) => `Padrão repetitivo para colorir com calma. Escolha uma paleta pequena, alterne cores claras e escuras e veja o desenho aparecer.`,
  pixel: (p) => `Cada quadradinho tem um número. Olhe a legenda, pinte cada número com a cor indicada (${p.colors.join(', ')}) e descubra o desenho no final.`,
  classico: (p) => `Ilustração clássica em domínio público, ótima para colorir com lápis bem apontado e com paciência. Pesquise as cores reais antes de começar, se quiser um resultado fiel.`,
  bandeira: (p) => `${p.title.replace(' para colorir', '')} em contorno, com as faixas e os símbolos separados para pintar. Antes de começar, pesquise as cores oficiais da bandeira com a criança e aproveite para localizar o país no mapa.`,
  livre: (p) => `Desenho de ${p.subject.toLowerCase()} em contorno preto, pronto para imprimir e colorir com lápis de cor, giz de cera ou canetinha.`,
};
function describe(p) {
  const c = catBySlug[p.cat];
  const first = (kindText[p.kind] || kindText.livre)(p);
  const age = p.age === 'adultos' ? 'jovens e adultos' : `crianças de ${p.age.replace('-', ' a ')} anos`;
  const R = rng(p.slug.length * 31 + p.slug.charCodeAt(1));
  return { first, age, tip: R.pick(c.tips) };
}

const ldOrg = { '@context': 'https://schema.org', '@type': 'Organization', name: SITE.name, url: SITE.url, logo: `${SITE.url}/apple-touch-icon.png` };

// ---------- detail pages ----------
for (const c of cats) {
  const list = byCat[c.slug];
  list.forEach((p, i) => {
    const prev = list[i - 1], next = list[i + 1];
    const d = describe(p);
    const related = [];
    for (let k = 1; related.length < 12 && k < list.length; k++) related.push(list[(i + k) % list.length]);
    const credit = p.credit;
    const trail = [['/', 'Início'], ['/categorias/', 'Categorias'], [c.url, c.label], [p.url, p.title]];
    const title = `${p.title} – imprimir grátis em PDF | Colorir Mais`;
    const desc = `${p.title}: imprima em A4, baixe o PDF grátis ou pinte online no celular. Desenho ${LEVEL[p.level].toLowerCase()} indicado para ${d.age}.`;
    const ld = [crumbsLd(trail), {
      '@context': 'https://schema.org', '@type': 'ImageObject', name: p.title, description: p.alt, contentUrl: SITE.url + p.src, thumbnailUrl: SITE.url + p.thumb,
      encodingFormat: p.ext === 'svg' ? 'image/svg+xml' : 'image/png', isFamilyFriendly: true, inLanguage: 'pt-BR',
      license: credit ? credit.licenseUrl || credit.sourceUrl : `${SITE.url}/termos/`, acquireLicensePage: credit ? credit.sourceUrl : `${SITE.url}/termos/`,
      creditText: credit ? credit.text : 'Colorir Mais', creator: { '@type': credit ? 'Person' : 'Organization', name: credit ? credit.author || credit.sourceName : 'Colorir Mais' },
      copyrightNotice: credit ? credit.license : 'Colorir Mais',
    }];
    const body = `${crumbs(trail)}
<div class="wrap"><div class="detail" data-page data-src="${p.src}" data-slug="${p.slug}" data-title="${esc(p.title)}">
<figure class="paper print-area" style="margin:0"><img src="${p.src}" alt="${esc(p.alt)}" width="${p.w || 1000}" height="${p.h || 1000}" fetchpriority="high"></figure>
<div class="panel">
<h1>${esc(p.title)}</h1>
<p>${esc(d.first)}</p>
<div class="actions">
<button class="btn btn-pink" type="button" data-act="paint">${icon('brush')}<span>Pintar online</span></button>
<div class="row"><button class="btn btn-blue" type="button" data-act="print">${icon('print')}<span>Imprimir</span></button><button class="btn btn-line" type="button" data-act="pdf">${icon('pdf')}<span>Baixar PDF</span></button></div>
<button class="btn btn-line" type="button" data-act="png">${icon('image')}<span>Baixar imagem PNG</span></button>
</div>
<dl class="facts"><dt>Nível</dt><dd>${LEVEL[p.level]}</dd><dt>Indicado para</dt><dd>${esc(d.age[0].toUpperCase() + d.age.slice(1))}</dd><dt>Categoria</dt><dd><a href="${c.url}">${esc(c.label)}</a></dd><dt>Formato</dt><dd>${p.ext === 'svg' ? 'Vetor (imprime nítido em qualquer tamanho)' : 'Imagem PNG em alta resolução'}</dd></dl>
<div class="note"><strong>Dica:</strong> ${esc(d.tip)}</div>
${credit ? `<p style="font-size:14px;color:var(--ink-3);margin-top:14px">Fonte: ${credit.author ? esc(credit.author) + ', ' : ''}<a href="${esc(credit.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(credit.sourceName)}</a>. Licença: ${credit.licenseUrl ? `<a href="${esc(credit.licenseUrl)}" rel="nofollow noopener license" target="_blank">${esc(credit.license)}</a>` : esc(credit.license)}.</p>` : `<p style="font-size:14px;color:var(--ink-3);margin-top:14px">Desenho original do Colorir Mais. Livre para uso pessoal e escolar.</p>`}
<nav class="pager" aria-label="Outros desenhos">${prev ? `<a class="btn btn-line" href="${prev.url}" rel="prev">${icon('left')}<span>Anterior</span></a>` : '<span></span>'}${next ? `<a class="btn btn-line" href="${next.url}" rel="next"><span>Próximo</span>${icon('right')}</a>` : ''}</nav>
</div></div>
<section class="sec" style="padding-top:10px"><div class="sec-head"><h2>Mais desenhos de ${esc(c.name)}</h2><a href="${c.url}">Ver todos (${c.count.toLocaleString('pt-BR')})</a></div>
<div class="grid">${related.map((r) => card(r)).join('')}</div></section>
<section class="prose" style="padding-bottom:20px"><h2>Como imprimir este desenho</h2><p>Toque em <strong>Imprimir</strong> para abrir a impressão do navegador, ou em <strong>Baixar PDF A4</strong> para salvar uma folha pronta, com margens, que você pode imprimir depois ou enviar pelo WhatsApp. Para pintar sem papel, toque em <strong>Pintar online</strong>: escolha um lápis e toque nas áreas do desenho para colorir.</p></section>
</div>`;
    write(p.url + 'index.html', layout({ title, description: desc, canonical: p.url, body, jsonld: ld, ogImage: SITE.url + p.thumb, v: V }));
  });
}
log('detail pages done');

// ---------- category pages ----------
for (const c of cats) {
  const list = byCat[c.slug];
  const nPages = Math.ceil(list.length / PER_PAGE);
  const levels = ['facil', 'medio', 'dificil'].filter((l) => list.some((p) => p.level === l));
  for (let pg = 1; pg <= nPages; pg++) {
    const slice = list.slice((pg - 1) * PER_PAGE, pg * PER_PAGE);
    const url = pg === 1 ? c.url : `${c.url}pagina/${pg}/`;
    const trail = [['/', 'Início'], ['/categorias/', 'Categorias'], [c.url, c.label]];
    if (pg > 1) trail.push([url, `Página ${pg}`]);
    const h1 = `Desenhos de ${c.name} para colorir`;
    const pagesNav = nPages > 1 ? `<nav class="pages" aria-label="Páginas">${Array.from({ length: nPages }, (_, i) => i + 1).map((n) => n === pg ? `<span aria-current="page">${n}</span>` : `<a href="${n === 1 ? c.url : `${c.url}pagina/${n}/`}">${n}</a>`).join('')}</nav>` : '';
    const others = cats.filter((x) => x.group === c.group && x.slug !== c.slug).concat(cats.filter((x) => x.group !== c.group)).slice(0, 8);
    const ld = [crumbsLd(trail), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: h1, url: SITE.url + url, inLanguage: 'pt-BR', isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url } }];
    if (pg === 1) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
    const body = `${crumbs(trail)}
<div class="wrap">
<header class="cat-head"><h1>${esc(h1)}${pg > 1 ? ` – página ${pg}` : ''}</h1><p class="intro">${esc(c.intro)} ${pg === 1 ? `São ${plural(c.count, 'desenho', 'desenhos')} para imprimir grátis em A4, baixar em PDF ou pintar online.` : ''}</p></header>
${levels.length > 1 ? `<div class="filters" role="group" aria-label="Filtrar por nível"><button type="button" data-lv="all" aria-pressed="true">Todos</button>${levels.map((l) => `<button type="button" data-lv="${l}" aria-pressed="false">${LEVEL[l]}</button>`).join('')}</div>` : ''}
<div class="grid">${slice.map((p, i) => card(p, i > 7)).join('')}</div>
${pagesNav}
${pg === 1 ? `<section class="sec prose"><h2>Dicas para colorir ${esc(c.name)}</h2><ul>${c.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<h2>Perguntas frequentes</h2><div class="faq">${c.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>` : ''}
<section class="sec" style="padding-top:0"><div class="sec-head"><h2>Outros temas</h2><a href="/categorias/">Todas as categorias</a></div><div class="tiles">${others.map(tile).join('')}</div></section>
</div>`;
    write(url + 'index.html', layout({ title: `${h1}${pg > 1 ? ` – página ${pg}` : ''} – ${plural(c.count, 'desenho grátis', 'desenhos grátis')} | Colorir Mais`, description: `${c.intro.slice(0, 120).replace(/\s+\S*$/, '')}… ${plural(c.count, 'desenho', 'desenhos')} para imprimir em A4, baixar em PDF ou pintar online.`, canonical: url, body, jsonld: ld, ogImage: SITE.url + c.cover[0].thumb, current: 'cat', v: V,
      head: `${pg > 1 ? `<link rel="prev" href="${pg === 2 ? c.url : `${c.url}pagina/${pg - 1}/`}">` : ''}${pg < nPages ? `<link rel="next" href="${c.url}pagina/${pg + 1}/">` : ''}` }));
  }
}
function tile(c) {
  return `<a class="tile" href="${c.url}"><span class="stack">${c.cover.slice(0, 3).reverse().map((p) => `<img src="${p.thumb}" alt="" width="360" height="360" loading="lazy" decoding="async">`).join('')}</span><span class="t">${esc(c.label)}</span><span class="n">${plural(c.count, 'desenho', 'desenhos')}</span></a>`;
}
log('category pages done');

// ---------- categories index ----------
{
  const trail = [['/', 'Início'], ['/categorias/', 'Categorias']];
  const body = `${crumbs(trail)}<div class="wrap"><header class="cat-head"><h1>Todas as categorias de desenhos para colorir</h1><p class="intro">${plural(pages.length, 'desenho', 'desenhos')} em ${cats.length} temas. Escolha um tema para ver os desenhos, imprimir ou pintar online.</p></header>
${GROUPS.map(([g, label]) => { const cs = cats.filter((c) => c.group === g); return cs.length ? `<section class="sec" style="padding-top:10px"><h2>${esc(label)}</h2><div class="tiles">${cs.map(tile).join('')}</div></section>` : ''; }).join('')}</div>`;
  write('categorias/index.html', layout({ title: `Categorias de desenhos para colorir – ${cats.length} temas | Colorir Mais`, description: `Veja todos os temas de desenhos para colorir: animais, mandalas, letras, números, Natal, dinossauros e muito mais. ${plural(pages.length, 'desenho grátis', 'desenhos grátis')}.`, canonical: '/categorias/', body, jsonld: [crumbsLd(trail)], current: 'cat', v: V }));
}

// ---------- home ----------
function heroSvg() {
  // the capybara, tagged so each part fills with colour once on load
  const colors = ['#8A5A3B', '#8A5A3B', '#B07A4E', '#8A5A3B', '#8A5A3B', '#B07A4E', '#9C6A44', '#7A4A2E', null, null, null, null, null, '#FF8A1F', null, '#2FA35E'];
  let i = 0;
  const art = SUBJECTS.capivara.draw().replace(/<(path|rect|ellipse|circle)\b/g, (m) => { const c = colors[i++]; return c ? `${m} data-c="${c}"` : m; });
  const ground = `<path d="M40 820 C200 800 800 800 960 820 L960 900 L40 900Z" data-c="#7FCB72"/><path d="M90 820 q10-40 0-60 M110 820 q8-30 20-48 M880 818 q-6-36 6-58 M900 818 q12-28 24-40" fill="none"/>` +
    `<circle cx="150" cy="150" r="70" data-c="#FFC22E"/><path d="M150 50 L150 20 M150 250 L150 280 M50 150 L20 150 M250 150 L280 150 M80 80 L60 60 M220 80 L240 60 M80 220 L60 240 M220 220 L240 240" fill="none"/>`;
  return `<svg class="fillme" viewBox="0 0 1000 920" role="img" aria-label="Desenho de capivara sendo colorido"><g fill="#fff" stroke="#1B2142" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">${ground}${art}</g></svg>`;
}
{
  const fresh = [...byCat['animais-brasileiros'].slice(0, 2), ...byCat['natal'].slice(0, 2), ...byCat['mandalas'].slice(0, 2), ...byCat['dinossauros'].slice(0, 2), ...byCat['unicornios'].slice(0, 1), ...byCat['fundo-do-mar'].slice(0, 1), ...byCat['flores'].slice(0, 1), ...byCat['espaco'].slice(0, 1)].filter(Boolean);
  const school = ['l-A-desenho', 'n-3-contar', 'l-B-tracejado', 'a-coelho-pontilhado', 'px-coracao', 'n-5-cobrir'].map((id) => pages.find((p) => p.id === id)).filter(Boolean);
  const body = `<section class="hero"><div class="wrap">
<div><h1>Desenhos para colorir, imprimir e pintar online</h1>
<p class="lead">${pages.length.toLocaleString('pt-BR')} desenhos grátis para crianças, professores e adultos. Imprima em A4, baixe em PDF ou pinte no celular com um toque.</p>
<form class="search" action="/busca/" role="search"><label class="sr" for="q2">Buscar desenhos</label><input id="q2" name="q" type="search" placeholder="O que você quer colorir hoje?"><button type="submit" aria-label="Buscar">${icon('search')}</button></form>
<div class="chips">${POPULAR.slice(0, 7).map((c) => `<a class="chip" href="${c.url}">${esc(c.label)}</a>`).join('')}</div>
<div class="hero-stats"><span><strong>${cats.length}</strong>temas</span><span><strong>A4</strong>PDF pronto</span><span><strong>Grátis</strong>sem cadastro</span></div></div>
<div class="hero-art"><div class="sheet">${heroSvg()}</div>
<svg class="crayon" viewBox="0 0 40 160" aria-hidden="true"><path d="M8 40 L20 6 L32 40Z" fill="#F3D2A8" stroke="#1B2142" stroke-width="2"/><path d="M15 20 L20 6 L25 20Z" fill="#E2307C"/><rect x="8" y="40" width="24" height="112" rx="4" fill="#E2307C" stroke="#1B2142" stroke-width="2"/><rect x="12" y="46" width="5" height="100" rx="2.5" fill="#fff" opacity=".35"/></svg></div>
</div></section>
<section class="sec"><div class="wrap"><div class="sec-head"><div><h2>Temas mais procurados</h2></div><a href="/categorias/">Ver as ${cats.length} categorias</a></div><div class="tiles">${POPULAR.map(tile).join('')}</div></div></section>
<section class="sec tint"><div class="wrap"><div class="feats">
<div class="feat">${icon('print')}<h3>Imprima em A4</h3><p>Cada desenho vira uma folha A4 com margens certas. Imprima direto ou salve o PDF para depois.</p></div>
<div class="feat">${icon('tap')}<h3>Pinte com um toque</h3><p>No celular ou no computador: escolha um lápis e toque na área. Tem pincel, borracha e desfazer.</p></div>
<div class="feat">${icon('school')}<h3>Feito para a escola</h3><p>Letras de A a Z, números de 0 a 20, pontilhados e colorir por números para alfabetização.</p></div>
<div class="feat">${icon('gift')}<h3>Grátis e sem cadastro</h3><p>Use em casa, na escola, em festas e na catequese. Sem login, sem limite de downloads.</p></div>
</div></div></section>
<section class="sec"><div class="wrap"><div class="sec-head"><h2>Escolhidos para hoje</h2></div><div class="grid">${fresh.map((p) => card(p)).join('')}</div></div></section>
<section class="sec"><div class="wrap"><div class="band"><div><h2>Atividades prontas para a sala de aula</h2><p>Alfabeto com desenho, letras pontilhadas, números para contar e escrever, desenhos pontilhados e pixel art com legenda de cores. Imprima a turma inteira de uma vez.</p><a class="btn btn-yellow" href="/atividades/">Ver atividades</a></div>
<div class="mini">${school.map((p) => `<a href="${p.url}"><img src="${p.thumb}" alt="${esc(p.alt)}" width="360" height="360" loading="lazy"></a>`).join('')}</div></div></div></section>
<section class="sec"><div class="wrap prose"><h2>Desenhos para colorir grátis, do jeito brasileiro</h2>
<p>O Colorir Mais reúne desenhos para colorir pensados para quem vive no Brasil: capivara, tucano, bicho-preguiça e onça dividem espaço com mandalas, letras do alfabeto, números, Natal, Páscoa, Festa Junina e Halloween. Todos os desenhos podem ser impressos em folha A4, baixados em PDF ou pintados online, sem cadastro.</p>
<p>Os desenhos originais são feitos pela nossa equipe em traço grosso, fácil de pintar para crianças pequenas. Também selecionamos ilustrações de domínio público e de licença livre, como gravuras antigas de naturalistas e desenhos do Openclipart, sempre com o crédito do autor na página.</p>
<h2>Perguntas frequentes</h2><div class="faq">
<details><summary>Os desenhos são realmente grátis?</summary><p>Sim. Você pode imprimir quantos quiser para uso pessoal, em casa ou na escola, sem pagar e sem criar conta.</p></details>
<details><summary>Como imprimir em tamanho A4?</summary><p>Abra o desenho e toque em Baixar PDF A4. O arquivo já vem no tamanho de uma folha sulfite, com margens. Depois é só imprimir.</p></details>
<details><summary>Dá para pintar no celular?</summary><p>Dá. Toque em Pintar online, escolha uma cor e toque na área que quer pintar. Você pode salvar o desenho pintado na galeria.</p></details>
<details><summary>Vocês têm personagens de desenho animado?</summary><p>Não publicamos personagens protegidos por direitos autorais. Todos os desenhos aqui são originais ou de domínio público, para que você use sem preocupação.</p></details>
</div></div></section>`;
  const ld = [ldOrg, { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url, inLanguage: 'pt-BR', potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/busca/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }];
  write('index.html', layout({ title: `Desenhos para colorir grátis – imprimir em PDF A4 ou pintar online | Colorir Mais`, description: `${pages.length.toLocaleString('pt-BR')} desenhos para colorir grátis: animais, mandalas, letras, números, Natal e muito mais. Imprima em A4, baixe em PDF ou pinte online no celular.`, canonical: '/', body, jsonld: ld, v: V }));
}
log('home done');

// ---------- activities, paint, name, search, static ----------
const simplePage = (url, title, h1, intro, inner, opts = {}) => {
  const trail = [['/', 'Início'], [url, h1]];
  write(url + 'index.html', layout({ title, description: opts.description || intro, canonical: url, body: `${crumbs(trail)}<div class="wrap"><header class="cat-head"><h1>${esc(h1)}</h1>${intro ? `<p class="intro">${esc(intro)}</p>` : ''}</header>${inner}</div>`, jsonld: [crumbsLd(trail)], current: opts.current, noindex: opts.noindex, head: opts.head || '', v: V }));
};
{
  const acts = ['letras-do-alfabeto', 'numeros', 'pontilhados', 'pixel-art'].map((s) => catBySlug[s]).filter((c) => c?.count);
  simplePage('/atividades/', 'Atividades para imprimir: alfabeto, números e pontilhados | Colorir Mais', 'Atividades para imprimir', 'Folhas prontas para educação infantil e anos iniciais: letras de A a Z para colorir e cobrir, números de 0 a 20 para contar e escrever, desenhos pontilhados e colorir por números.',
    acts.map((c) => `<section class="sec" style="padding-top:10px"><div class="sec-head"><div><h2>${esc(c.label)}</h2><p>${esc(c.intro)}</p></div><a href="${c.url}">Ver todos (${c.count})</a></div><div class="grid">${byCat[c.slug].slice(0, 6).map((p) => card(p)).join('')}</div></section>`).join('') +
    `<section class="sec" style="padding-top:10px"><div class="band"><div><h2>Nome para colorir</h2><p>Escreva o nome da criança e imprima em letras vazadas para pintar. Ótimo para o primeiro dia de aula e para festas.</p><a class="btn btn-yellow" href="/gerador-de-nome-para-colorir/">Criar nome para colorir</a></div></div></section>`, { current: 'atv' });

  const picks = ['animais-brasileiros', 'animais', 'mandalas', 'unicornios', 'fundo-do-mar', 'veiculos'].flatMap((s) => (byCat[s] || []).slice(0, 2));
  simplePage('/pintar-online/', 'Pintar online: desenhos para colorir no celular e no computador | Colorir Mais', 'Pintar online', 'Escolha um desenho e pinte direto na tela: toque numa área com o balde de tinta, use o pincel para detalhes e salve o desenho pintado na galeria. Funciona no celular, tablet e computador, sem instalar nada.',
    `<div class="grid">${picks.map((p) => card({ ...p, url: p.url + '#pintar' })).join('')}</div>
<section class="sec prose"><h2>Como pintar online</h2><ol><li>Abra qualquer desenho do site e toque em <strong>Pintar online</strong>.</li><li>Escolha um lápis de cor na barra de baixo.</li><li>Com o <strong>balde</strong>, toque numa área para preencher. Com o <strong>pincel</strong>, pinte livremente.</li><li>Errou? Toque em <strong>Desfazer</strong>. Terminou? Toque em <strong>Salvar</strong> para guardar a imagem.</li></ol></section>`, { current: 'pin' });

  simplePage('/gerador-de-nome-para-colorir/', 'Gerador de nome para colorir: escreva o nome e imprima grátis | Colorir Mais', 'Nome para colorir', 'Digite um nome, escolha a decoração e imprima o nome em letras grandes e vazadas para colorir. Fica pronto em segundos.',
    `<div class="gen"><form id="gen" onsubmit="return false"><label for="gn">Nome</label><input id="gn" type="text" maxlength="14" value="Maria Clara" autocomplete="off">
<label for="gd">Decoração</label><select id="gd"><option value="estrelas">Estrelas</option><option value="coracoes">Corações</option><option value="flores">Flores</option><option value="nenhuma">Sem decoração</option></select>
<div class="actions"><button class="btn btn-blue" type="button" id="gprint">${icon('print')}<span>Imprimir</span></button><button class="btn btn-line" type="button" id="gpng">${icon('image')}<span>Baixar imagem</span></button></div></form>
<div class="paper print-area" id="gout" aria-live="polite"></div></div>
<section class="sec prose"><h2>Ideias para usar o nome para colorir</h2><ul><li>Primeiro dia de aula: cada criança pinta o próprio nome e cola na mesa ou no cabide.</li><li>Festas de aniversário: imprima o nome do aniversariante para a mesa de pintura.</li><li>Alfabetização: peça para a criança falar o som de cada letra enquanto pinta.</li></ul></section>`,
    { current: 'gen', head: `<script src="/assets/opentype.min.js" defer></script><script src="/assets/nome.js?v=${V}" defer></script>` });

  const index = pages.map((p) => [p.title, p.url, p.thumb, catBySlug[p.cat].label]);
  write('busca/index.json', JSON.stringify(index));
  simplePage('/busca/', 'Buscar desenhos para colorir | Colorir Mais', 'Buscar desenhos', '', `<p id="sr-info" class="intro" aria-live="polite">Digite o que você quer colorir na busca acima.</p><div class="grid" id="sr"></div>
<script>
(function(){var q=new URLSearchParams(location.search).get('q')||'';var inp=document.getElementById('q');if(inp)inp.value=q;var info=document.getElementById('sr-info'),box=document.getElementById('sr');if(!q.trim())return;
var norm=function(s){return s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase()};var terms=norm(q).split(/\\s+/).filter(Boolean);
fetch('/busca/index.json').then(function(r){return r.json()}).then(function(list){var res=list.filter(function(x){var t=norm(x[0]+' '+x[3]);return terms.every(function(w){return t.indexOf(w)>-1||t.indexOf(w.replace(/s$/,''))>-1})});
info.textContent=res.length?res.length+' desenho'+(res.length>1?'s':'')+' para \\u201c'+q+'\\u201d':'Nenhum desenho encontrado para \\u201c'+q+'\\u201d. Tente uma palavra mais simples, como gato, flor ou mandala.';
box.innerHTML=res.slice(0,120).map(function(x){var e=function(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};return '<a class="card" href="'+x[1]+'"><span class="pic"><img src="'+x[2]+'" alt="" loading="lazy" width="360" height="360"></span><span class="t">'+e(x[0])+'</span></a>'}).join('')})})();
</script>`, { noindex: true });

  const prose = (h) => `<div class="prose">${h}</div>`;
  simplePage('/sobre/', 'Sobre o Colorir Mais', 'Sobre o Colorir Mais', '', prose(`<p>O Colorir Mais é um site brasileiro de desenhos para colorir, gratuito e sem cadastro. Nosso objetivo é simples: ajudar famílias e professores a encontrar rápido um desenho bonito, imprimir sem complicação e, se quiserem, pintar direto na tela.</p><p>Desenhamos nossos próprios desenhos em traço grosso, pensados para as mãos das crianças pequenas, e criamos atividades de alfabetização e matemática para a educação infantil. Também selecionamos ilustrações de domínio público e de licença livre, sempre com crédito ao autor.</p><p>Não publicamos personagens de desenhos animados, filmes ou marcas protegidas. Assim, você pode usar tudo o que está aqui em casa ou na escola sem preocupação.</p>`));
  const extCount = pages.filter((p) => p.source !== 'original').length;
  simplePage('/creditos/', 'Créditos e licenças | Colorir Mais', 'Créditos e licenças', '', prose(`<p>O Colorir Mais tem ${plural(pages.length - extCount, 'desenho original', 'desenhos originais')} e ${plural(extCount, 'desenho', 'desenhos')} de domínio público ou licença livre.</p><h2>Desenhos originais</h2><p>Desenhos, mandalas, padrões, letras, números e pixel art marcados como "Desenho original do Colorir Mais" foram criados para este site e podem ser usados livremente para fins pessoais e educacionais.</p><h2>Openclipart</h2><p>Desenhos com fonte <a href="https://openclipart.org" rel="nofollow">Openclipart</a> estão em domínio público, sob a dedicação <a href="https://creativecommons.org/publicdomain/zero/1.0/deed.pt_BR" rel="nofollow">CC0 1.0</a>.</p><h2>Wikimedia Commons e Biodiversity Heritage Library</h2><p>Gravuras e ilustrações com fonte <a href="https://commons.wikimedia.org" rel="nofollow">Wikimedia Commons</a> estão em domínio público ou sob licenças Creative Commons, indicadas em cada página com o autor e o link para o arquivo original. Muitas vêm do projeto "Color Our Collections", da Biodiversity Heritage Library.</p><h2>Fontes</h2><p>Fredoka e Atkinson Hyperlegible, sob a SIL Open Font License.</p>`));
  simplePage('/privacidade/', 'Política de privacidade | Colorir Mais', 'Política de privacidade', '', prose(`<p>O Colorir Mais não pede cadastro e não coleta dados pessoais. A pintura online acontece inteiramente no seu navegador: o desenho pintado não é enviado para nenhum servidor.</p><p>Podemos usar estatísticas anônimas de visitas, sem cookies de rastreamento, para saber quais desenhos são mais procurados. Se no futuro exibirmos anúncios, esta página será atualizada com as informações exigidas pela LGPD.</p><p>Dúvidas: veja a página de <a href="/contato/">contato</a>.</p>`));
  simplePage('/termos/', 'Termos de uso | Colorir Mais', 'Termos de uso', '', prose(`<p>Você pode imprimir, baixar e pintar os desenhos do Colorir Mais gratuitamente para uso pessoal, familiar e educacional, incluindo uso em sala de aula, catequese e festas.</p><p>Não é permitido revender os desenhos originais do Colorir Mais como produto, nem republicá-los em outros sites como se fossem seus. Desenhos de domínio público ou de licença livre seguem a licença indicada em cada página.</p>`));
  simplePage('/contato/', 'Contato | Colorir Mais', 'Contato', '', prose(`<p>Tem uma sugestão de desenho, encontrou um erro ou quer pedir a remoção de algum conteúdo? Abra uma solicitação no repositório público do projeto ou escreva para nós pelo e-mail informado na página do projeto no GitHub.</p><p>Pedidos de remoção por direitos autorais são analisados com prioridade.</p>`));
  write('404.html', layout({ title: 'Página não encontrada | Colorir Mais', description: 'Página não encontrada.', canonical: '/404/', noindex: true, v: V,
    body: `<div class="wrap" style="padding:60px 16px"><h1>Este desenho não está aqui</h1><p class="intro">O endereço pode ter mudado. Use a busca ou escolha um tema.</p><div class="tiles" style="margin-top:24px">${POPULAR.slice(0, 6).map(tile).join('')}</div></div>` }));
}

// ---------- sitemap, robots, manifest, icons ----------
{
  const urls = ['/', '/categorias/', '/atividades/', '/pintar-online/', '/gerador-de-nome-para-colorir/', '/sobre/', '/creditos/', ...cats.flatMap((c) => [c.url, ...Array.from({ length: Math.ceil(c.count / PER_PAGE) - 1 }, (_, i) => `${c.url}pagina/${i + 2}/`)])];
  const today = new Date().toISOString().slice(0, 10);
  const chunks = [urls.map((u) => ({ u }))];
  const pageEntries = pages.map((p) => ({ u: p.url, img: p.src, t: p.title }));
  for (let i = 0; i < pageEntries.length; i += 5000) chunks.push(pageEntries.slice(i, i + 5000));
  chunks.forEach((ch, i) => write(`sitemap-${i + 1}.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${ch.map((e) => `<url><loc>${SITE.url}${e.u}</loc><lastmod>${today}</lastmod>${e.img ? `<image:image><image:loc>${SITE.url}${e.img}</image:loc></image:image>` : ''}</url>`).join('\n')}\n</urlset>`));
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunks.map((_, i) => `<sitemap><loc>${SITE.url}/sitemap-${i + 1}.xml</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>`);
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /busca/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
  write('site.webmanifest', JSON.stringify({ name: 'Colorir Mais', short_name: 'Colorir Mais', start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#3557E8', icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }] }));
  write('favicon.svg', LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
  const logoBuf = Buffer.from(LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" '));
  await sharp(logoBuf).resize(180, 180).flatten({ background: '#fff' }).png().toFile(path.join(DIST, 'apple-touch-icon.png'));
  await sharp(logoBuf).resize(512, 512).png().toFile(path.join(DIST, 'icon-512.png'));
  // Open Graph image: a row of real pages under the brand name
  const ogPicks = POPULAR.slice(0, 4).map((c) => c.cover[0]);
  const comps = await Promise.all(ogPicks.map(async (p, i) => ({ input: await sharp(path.join(DIST, p.thumb)).resize(250, 250).toBuffer(), left: 60 + i * 275, top: 320 })));
  const ogBg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#F2F5FC"/><rect width="1200" height="14" fill="#3557E8"/><g transform="translate(60 70) scale(2.6)">${LOGO.replace(/<\/?svg[^>]*>/g, '')}</g><text x="200" y="135" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="700" font-size="76" fill="#1B2142">Colorir Mais</text><text x="62" y="250" font-family="Arial, sans-serif" font-size="40" fill="#4A5175">Desenhos para colorir grátis: imprimir, PDF A4 e pintar online</text>${ogPicks.map((_, i) => `<rect x="${50 + i * 275}" y="310" width="270" height="270" rx="18" fill="#fff" stroke="#DCE2F2" stroke-width="3"/>`).join('')}</svg>`);
  await sharp(ogBg).composite(comps).png().toFile(path.join(DIST, 'img', 'og.png'));
}
log('done.', pages.length, 'drawing pages,', cats.length, 'categories');
