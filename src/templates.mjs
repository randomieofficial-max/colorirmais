// HTML templates for Colorir Mais (pt-BR).
import { esc } from './gen/util.mjs';

export const SITE = {
  name: 'Colorir Mais',
  url: process.env.SITE_URL || 'https://colorirmais.vercel.app',
  locale: 'pt_BR',
};

const ICONS = {
  search: '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  print: '<path d="M7 9V3h10v6M7 18H4v-7a2 2 0 012-2h12a2 2 0 012 2v7h-3M7 14h10v7H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  pdf: '<path d="M6 2h9l5 5v15H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 2v6h6M12 11v7M9 15l3 3 3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  brush: '<path d="M14 4l6 6-8 8-6-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M6 12c-2 0-3 2-3 4s-1 3-1 4c3 0 6-1 7-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="2" fill="currentColor"/><path d="M4 18l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  left: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  right: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  pencil: '<path d="M4 20l1-5L16 4l4 4L9 19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13 7l4 4" stroke="currentColor" stroke-width="2"/>',
  tap: '<path d="M9 11V5a2 2 0 014 0v6l4 1a2 2 0 011.6 2.4L17 21H9l-4-6a1.8 1.8 0 012.8-2.2L9 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  school: '<path d="M12 3L2 8l10 5 10-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M6 10v5c0 2 3 4 6 4s6-2 6-4v-5" fill="none" stroke="currentColor" stroke-width="2"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1" fill="none" stroke="currentColor" stroke-width="2"/>',
};
export const icon = (k, cls = '') => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${ICONS[k]}</svg>`;

export const LOGO = `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="4" width="40" height="40" rx="12" fill="#3557E8"/><path d="M14 34l2-7 13-13 5 5-13 13z" fill="#FFC22E" stroke="#1B2142" stroke-width="2.2" stroke-linejoin="round"/><path d="M14 34l2-7 5 5z" fill="#F3D2A8" stroke="#1B2142" stroke-width="2.2" stroke-linejoin="round"/><path d="M14 34l1-3.5 2.5 2.5z" fill="#E2307C"/><path d="M29 14l5 5 2-2a2.5 2.5 0 000-3.5l-1.5-1.5a2.5 2.5 0 00-3.5 0z" fill="#E2307C" stroke="#1B2142" stroke-width="2.2" stroke-linejoin="round"/></svg>`;

export function layout({ title, description, canonical, body, jsonld = [], ogImage, noindex = false, current = '', head = '', v }) {
  const og = ogImage || `${SITE.url}/img/og.png`;
  const nav = [
    ['/categorias/', 'Categorias', 'cat'], ['/atividades/', 'Atividades', 'atv'], ['/pintar-online/', 'Pintar online', 'pin'], ['/gerador-de-nome-para-colorir/', 'Nome para colorir', 'gen'],
  ].map(([h, t, k]) => `<a href="${h}"${current === k ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE.url}${canonical}">
${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE.url}${canonical}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#3557E8">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/fredoka-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v=${v}">
${head}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<div class="pencils" aria-hidden="true"></div>
<header class="top"><div class="wrap">
<a class="logo" href="/" aria-label="Colorir Mais, página inicial">${LOGO}<span>Colorir <b>Mais</b></span></a>
<form class="search" action="/busca/" role="search"><label class="sr" for="q">Buscar desenhos</label><input id="q" name="q" type="search" placeholder="Buscar: capivara, mandala, letra A…" autocomplete="off"><button type="submit" aria-label="Buscar">${icon('search')}</button></form>
<button class="menu-btn" type="button" aria-label="Abrir menu" aria-expanded="false">${icon('menu')}</button>
<nav class="nav" aria-label="Principal">${nav}</nav>
</div></header>
<main id="conteudo">
${body}
</main>
${footer()}
<script src="/assets/app.js?v=${v}" defer></script>
</body>
</html>`;
}

let FOOT_CATS = [];
export function setFooterCats(list) { FOOT_CATS = list; }
function footer() {
  return `<footer class="foot"><div class="wrap">
<div class="cols">
<div><a class="logo" href="/">${LOGO}<span>Colorir <b>Mais</b></span></a><p style="margin-top:12px;max-width:38ch">Desenhos para colorir grátis, para imprimir em A4, baixar em PDF ou pintar online. Feito para famílias, professores e quem gosta de pintar.</p></div>
<div><h3>Mais procurados</h3><ul>${FOOT_CATS.slice(0, 6).map((c) => `<li><a href="/${c.slug}-para-colorir/">${esc(c.label)}</a></li>`).join('')}</ul></div>
<div><h3>Para a escola</h3><ul><li><a href="/letras-do-alfabeto-para-colorir/">Letras do alfabeto</a></li><li><a href="/numeros-para-colorir/">Números</a></li><li><a href="/pontilhados-para-colorir/">Pontilhados</a></li><li><a href="/pixel-art-para-colorir/">Colorir por números</a></li><li><a href="/gerador-de-nome-para-colorir/">Nome para colorir</a></li></ul></div>
<div><h3>Colorir Mais</h3><ul><li><a href="/sobre/">Sobre</a></li><li><a href="/creditos/">Créditos e licenças</a></li><li><a href="/privacidade/">Privacidade</a></li><li><a href="/termos/">Termos de uso</a></li><li><a href="/contato/">Contato</a></li></ul></div>
</div>
<p class="legal">© ${new Date().getFullYear()} Colorir Mais. Desenhos originais do Colorir Mais e obras de domínio público ou licença livre, com créditos em cada página. Gratuito para uso pessoal e escolar.</p>
</div></footer>`;
}

export function crumbs(list) {
  return `<nav class="crumbs wrap" aria-label="Você está em"><ol>${list.map(([href, t], i) => i === list.length - 1 ? `<li aria-current="page">${esc(t)}</li>` : `<li><a href="${href}">${esc(t)}</a></li>`).join('')}</ol></nav>`;
}
export function crumbsLd(list) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([href, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: SITE.url + href })) };
}

export const LEVEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
export function card(p, lazy = true) {
  return `<a class="card" href="${p.url}" data-lv="${p.level}"><span class="pic"><img src="${p.thumb}" alt="${esc(p.alt)}" width="360" height="360"${lazy ? ' loading="lazy" decoding="async"' : ''}></span><span class="t">${esc(p.short || p.title)}</span><span class="lv">${LEVEL[p.level]}</span></a>`;
}
