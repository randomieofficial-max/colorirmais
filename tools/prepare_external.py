"""Download/rasterize curated external images into ext/ and write data/external.json for the site build."""
import json, os, re, subprocess, time, urllib.request, concurrent.futures as cf, collections, io
import numpy as np
from PIL import Image

UA = {"User-Agent": "ColorirMaisBot/1.0 (coloring site)"}
os.makedirs('ext', exist_ok=True)
MAX = 1500

def clean_save(im, out, stretch=False):
    im = im.convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    g = bg.convert('L')
    g.thumbnail((MAX, MAX), Image.LANCZOS)
    a = np.asarray(g).astype(np.float32)
    if stretch:
        lo, hi = np.percentile(a, 1), np.percentile(a, 90)
        a = np.clip((a - lo) / max(hi - lo, 1) * 255, 0, 255)
    a[a > 235] = 255
    q = Image.fromarray(a.astype(np.uint8)).quantize(16)
    q.save(out, optimize=True)

def get(url, binary=True):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception:
            time.sleep(3 + i * 5)
    return None

# ---------- Openclipart ----------
oc = json.load(open('data/oc_curated.json'))
authors = json.load(open('data/oc_authors.json')) if os.path.exists('data/oc_authors.json') else {}
def oc_work(r):
    out = f"ext/oc-{r['id']}.png"
    if not os.path.exists(out):
        png = subprocess.run(['rsvg-convert', '-w', str(MAX), '-h', str(MAX), '-a', '-b', 'white', f"cache/oc_svg/{r['id']}.svg"], capture_output=True, timeout=60).stdout
        if not png: return None
        clean_save(Image.open(io.BytesIO(png)), out)
    if r['id'] not in authors:
        h = get(f"https://openclipart.org/detail/{r['id']}/{r['slug']}")
        a = ''
        if h:
            m = re.search(rb'"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"', h) or re.search(rb'href="/artist/([^"/]+)"', h)
            a = m.group(1).decode('utf-8', 'ignore') if m else ''
        authors[r['id']] = a
    return r['id']
with cf.ThreadPoolExecutor(6) as ex: list(ex.map(oc_work, oc))
json.dump(authors, open('data/oc_authors.json', 'w'))

FEM = lambda adj, g: (adj[:-1] + 'a') if g == 'f' and adj.endswith('o') else adj
seen = collections.Counter(); ext = []
for r in oc:
    out = f"ext/oc-{r['id']}.png"
    if not os.path.exists(out): continue
    base = r['subject'] + (' ' + FEM(r['adj'], r['g']) if r['adj'] else '')
    seen[base] += 1
    n = seen[base]
    title = f"{base} para colorir" + (f" nº {n}" if n > 1 else '')
    slug = re.sub(r'[^a-z0-9]+', '-', __import__('unicodedata').normalize('NFD', base).encode('ascii', 'ignore').decode().lower()).strip('-') + ('-para-colorir' if n == 1 else f'-para-colorir-{n}')
    a = authors.get(r['id'], '')
    ext.append(dict(id=f"oc-{r['id']}", slug=slug, cat=r['cat'], subject=r['subject'], title=title, level=r['level'],
                    age='3-8' if r['level'] == 'facil' else '6-12' if r['level'] == 'medio' else '10-14', kind='livre', source='openclipart',
                    alt=f"Desenho de {r['subject'].lower()} para colorir em contorno preto, pronto para imprimir", file=out,
                    credit=dict(author=a, license='CC0 1.0 (domínio público)', licenseUrl='https://creativecommons.org/publicdomain/zero/1.0/deed.pt_BR',
                                sourceUrl=f"https://openclipart.org/detail/{r['id']}/{r['slug']}", sourceName='Openclipart', text=f"{a + ', ' if a else ''}Openclipart, CC0")))
print('openclipart', len(ext))

# ---------- Wikimedia Commons ----------
cm = json.load(open('data/cm_curated.json'))
def cm_work(r):
    out = f"ext/{r['id']}.png"
    if os.path.exists(out): return r['id']
    url = r['url']
    if r['thumb'] and (r['w'] > 1280 or r['mime'] == 'image/svg+xml'):
        url = re.sub(r'/\d+px-', '/1280px-', r['thumb'])
    data = get(url)
    if not data: return None
    try:
        clean_save(Image.open(io.BytesIO(data)), out, stretch=r['mime'] == 'image/jpeg')
    except Exception:
        return None
    return r['id']
with cf.ThreadPoolExecutor(3) as ex: list(ex.map(cm_work, cm))
n_cm = 0
for r in cm:
    out = f"ext/{r['id']}.png"
    if not os.path.exists(out): continue
    slug = re.sub(r'[^a-z0-9]+', '-', __import__('unicodedata').normalize('NFD', r['title']).encode('ascii', 'ignore').decode().lower()).strip('-')
    ext.append(dict(id=r['id'], slug=slug, cat=r['cat'], subject=r['subject'], title=r['title'], level=r['level'], age=r['age'], kind=r['kind'], source='commons',
                    letter=r.get('letter'), number=r.get('number'),
                    alt=f"{r['title'][:-len(' para colorir')] if r['title'].endswith(' para colorir') else r['title']}, desenho em domínio público para colorir e imprimir", file=out, credit=r['credit']))
    n_cm += 1
print('commons', n_cm)
json.dump(ext, open('data/external.json', 'w'), ensure_ascii=False, indent=0)
print('total external', len(ext), 'size MB', round(sum(os.path.getsize(e['file']) for e in ext) / 1e6, 1))
