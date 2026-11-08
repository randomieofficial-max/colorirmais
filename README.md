# Colorir Mais

Free coloring pages website for the Brazilian market (pt-BR): print in A4, download as PDF, or paint online on phone and computer.

Live site: https://colorirmais.vercel.app

## What is inside

| Folder / file | What it is |
|---|---|
| `src/gen/` | Generators for the original coloring pages: mandalas, patterns, letters, numbers, pixel art |
| `src/gen/art/` | Hand-drawn original illustrations (animals, food, vehicles, holidays…) as SVG code |
| `src/data/categories.mjs` | Category names and Portuguese SEO text (intro, tips, FAQ) |
| `src/build.mjs` | Builds the whole static site into `dist/` |
| `src/templates.mjs` | HTML layout, header, footer, cards |
| `public/assets/` | CSS, site JavaScript, the online painter (`painter.js`) and name generator (`nome.js`) |
| `ext/` + `data/external.json` | Public-domain / CC0 drawings from Openclipart and Wikimedia Commons, with author and license |
| `tools/` | Scripts used to collect, check and prepare the free-license images |

## How it deploys

Vercel is connected to this GitHub repository. Every push to `main` builds and publishes automatically:

- Install: `npm ci`
- Build: `node src/build.mjs`
- Output folder: `dist`

## Run it on your own computer (optional)

```
npm ci
node src/build.mjs
npx serve dist
```

## Licenses

- Original drawings (marked "Desenho original do Colorir Mais"): made for this site.
- Openclipart drawings: CC0 1.0 (public domain).
- Wikimedia Commons drawings: public domain or the Creative Commons license shown on each page, with author credit.
- Fonts: Fredoka and Atkinson Hyperlegible (SIL Open Font License).

No copyrighted cartoon characters, brands or images from other coloring sites are used.
