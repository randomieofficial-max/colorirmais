import { originalPages } from '../src/gen/compose.mjs';
import fs from 'fs';
const D=process.argv[2];
const t0=Date.now(); const pages=originalPages(); console.log('pages',pages.length,'ms',Date.now()-t0);
const byKind={}; for (const p of pages) (byKind[p.kind]??=[]).push(p);
console.log(Object.fromEntries(Object.entries(byKind).map(([k,v])=>[k,v.length])));
const pick=['a-capivara','a-capivara-nome','a-gato-moldura','a-coruja-pontilhado','l-A-desenho','l-B-decorada','l-C-tracejado','l-M-gigante','n-3-contar','n-12-contar','n-5-cobrir','n-7-decorado','px-gato','px-arco-iris','px-sapo','a-zebra','a-xicara','a-helicoptero'];
for (const id of pick){const p=pages.find(x=>x.id===id); if(!p){console.log('missing',id);continue} fs.writeFileSync(`${D}/${id}.svg`, p.svg||p.lazySvg());}
