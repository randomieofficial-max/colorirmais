"""Select Wikimedia Commons images that work as coloring pages and give them Portuguese titles."""
import json, re, hashlib, os, collections
import numpy as np
from PIL import Image
from scipy import ndimage
from babel import Locale

meta = json.load(open('data/commons_meta.json'))
stats = json.load(open('data/cm_stats.json'))
EN = {v.lower(): k for k, v in Locale('en').territories.items()}
EN.update({'the comoros': 'KM', 'the bahamas': 'BS', 'the gambia': 'GM', 'the netherlands': 'NL', 'the philippines': 'PH', 'the united states': 'US', 'united states of america': 'US',
           'ivory coast': 'CI', "côte d'ivoire": 'CI', 'east timor': 'TL', 'czech republic': 'CZ', 'the czech republic': 'CZ', 'republic of the congo': 'CG', 'democratic republic of the congo': 'CD',
           'the democratic republic of the congo': 'CD', 'the republic of the congo': 'CG', 'the united kingdom': 'GB', 'united kingdom': 'GB', 'the united arab emirates': 'AE', 'north macedonia': 'MK',
           'eswatini': 'SZ', 'the central african republic': 'CF', 'the dominican republic': 'DO', 'the marshall islands': 'MH', 'the solomon islands': 'SB', 'the maldives': 'MV', 'the vatican city': 'VA',
           'vatican city': 'VA', 'the seychelles': 'SC', 'cape verde': 'CV', 'burma': 'MM', 'myanmar': 'MM', 'south korea': 'KR', 'north korea': 'KP', 'russia': 'RU', 'the federated states of micronesia': 'FM'})
PT = Locale('pt', 'BR').territories

DE = {'Angola','Cuba','Malta','Andorra','Israel','Portugal','Moçambique','Cabo Verde','São Tomé e Príncipe','Singapura','Taiwan','Mônaco','Madagascar','Timor-Leste','Porto Rico','Santa Lúcia','Granada','Barbados','Trinidad e Tobago','Fiji','Samoa','Tonga','Nauru','Tuvalu','Kiribati','Vanuatu','Palau','Belize','Djibuti','Omã','Mianmar','Hong Kong','San Marino','Uganda','Ruanda','Comores','Mauricio','Maurício','Brunei','Burkina Faso','Chipre','Jamaica','Cingapura','Aruba','Andorra','Dominica','São Vicente e Granadinas','Antígua e Barbuda','São Cristóvão e Névis','Montenegro','Kosovo','Liechtenstein','Luxemburgo','Bahrein','Catar'}
DO = {'Quênia','Gana','Canadá','Botsuana','Bahrein','Catar','Chipre','Luxemburgo','Vaticano','Sri Lanka'}
DA = {'Guiné','Guiné Equatorial','Guiné-Bissau','Costa do Marfim','Macedônia do Norte','Coreia do Norte','Coreia do Sul','Nova Zelândia','Papua-Nova Guiné','Bósnia e Herzegovina','República Tcheca','Tchéquia','República Dominicana','República Centro-Africana','Polinésia Francesa','Micronésia','Eslováquia','Estônia','Letônia','Lituânia','Islândia','Finlândia','Noruega','Suécia','Irlanda','Escócia','Bélgica','Áustria','Hungria','Bulgária','Romênia','Croácia','Sérvia','Eslovênia','Albânia','Grécia','Turquia','Síria','Jordânia','Arábia Saudita','Mongólia','Tailândia','Malásia','Indonésia','Austrália','Índia','China','Rússia','Ucrânia','Belarus','Moldávia','Geórgia','Armênia','Argélia','Tunísia','Líbia','Etiópia','Somália','Eritreia','Nigéria','Libéria','Serra Leoa','Zâmbia','Gâmbia','Tanzânia','Namíbia','Mauritânia','Suazilândia','Venezuela','Colômbia','Bolívia','Argentina','Guatemala','Costa Rica','Nicarágua','Guiana','Guiana Francesa','Alemanha','França','Itália','Espanha','Holanda','Suíça','Polônia','Dinamarca','Inglaterra','África do Sul','Macedônia','Bielorrússia'}
def prep(name):
    if name in DE: return 'de'
    if name in DO: return 'do'
    if name in DA: return 'da'
    if name.startswith(('Estados ','Emirados ','Países ')): return 'dos'
    if name.startswith(('Ilhas ',)) or name in ('Filipinas','Maldivas','Bahamas','Seicheles'): return 'das'
    return 'da' if name.endswith('a') else 'do'

def thumbfile(x): return 'cache/cm_thumb/' + hashlib.md5(x['title'].encode()).hexdigest() + '.jpg'

def components(fn):
    im = Image.open(fn).convert('L'); im.thumbnail((256, 256))
    a = np.asarray(im).astype(np.float32)
    lo, hi = np.percentile(a, 1), np.percentile(a, 92)
    n = (a - lo) / max(hi - lo, 1) * 255
    lab, k = ndimage.label(n < 120)
    if k == 0: return 0, 0, 0
    sizes = np.bincount(lab.ravel())[1:]
    ys, xs = np.where(n < 200)
    bbox = ((xs.max() - xs.min()) * (ys.max() - ys.min())) / a.size if len(xs) else 0
    return k, float(np.median(sizes)), float(bbox)

BOOK_SUBJECT = [
    (r'fish|ichthyolog|piscium|poisson', 'peixe', 'fundo-do-mar'), (r'bird|avibus|oiseaux|aves', 'ave', 'passaros'),
    (r'insect|entomolog|coleoptera|diptera|papillons|volatilium', 'inseto', 'insetos'), (r'cephalopod|cefalopodi', 'polvo e lula', 'fundo-do-mar'),
    (r'conchyl|mollusca|shell', 'concha', 'fundo-do-mar'), (r'reptil|serpent|draconum', 'réptil', 'animais'), (r'spider', 'aranha', 'insetos'),
    (r'animals of the past|extinct monsters', 'animal pré-histórico', 'dinossauros'), (r'flora|stirpium|plant|botan|orchid|garden|seed|fruits|najas|sylvatica|jardim', 'planta', 'plantas-botanicas'),
    (r'fossil|paléontologie|south downs', 'fóssil', 'ilustracoes-classicas'), (r'animal kingdom|naturalis|thiere|zoology|natural history|thesauri|naturaliste|reef', 'animal', 'ilustracoes-classicas'),
]

out = []; per_book = collections.Counter(); seen_titles = collections.Counter()
for x in meta:
    fn = thumbfile(x)
    if not os.path.exists(fn) or os.path.basename(fn) not in stats: continue
    s = stats[os.path.basename(fn)]
    lic = x['license']
    if not (lic in ('Public domain', 'No restrictions', 'CC0') or lic.startswith('CC BY')): continue
    if x['mime'] not in ('image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'): continue
    cat = (x['cat'] or '')[9:]; t = x['title'][5:]
    rec = None
    m = re.match(r'Flag of (.+?) \(colou?ring page\)', t)
    if m:
        code = EN.get(m.group(1).lower()) or EN.get(m.group(1).lower().replace('the ', ''))
        if code and code in PT:
            rec = dict(cat='bandeiras', subject='Bandeira', title=f'Bandeira {prep(PT[code])} {PT[code]} para colorir', level='facil', age='5-12', kind='bandeira')
    elif cat.startswith('Classic alphabet'):
        m = re.search(r'Classic alphabet ([a-z0-9]) ', t, re.I)
        if m:
            ch = m.group(1).upper()
            rec = dict(cat='letras-do-alfabeto' if ch.isalpha() else 'numeros', subject='Letra', title=(f'Letra {ch} clássica para colorir' if ch.isalpha() else f'Número {ch} clássico para colorir'), level='facil', age='3-7', kind='classico', letter=ch if ch.isalpha() else 'Z', number=int(ch) if ch.isdigit() else 99)
    elif t.startswith('"') and ('National Park Service' in (x['artist'] + x['desc']) or 'NPS' in x['desc'] or 'extinct' in x['desc'] or 'lived during' in x['desc']):
        m = re.match(r'"([^"]+)"', t)
        if m and s['contrast'] > 80:
            rec = dict(cat='dinossauros', subject='Animal pré-histórico', title=f'{m.group(1)}: animal pré-histórico para colorir', level='medio', age='7-14', kind='classico')
    elif 'Agujaceratops' in t:
        rec = dict(cat='dinossauros', subject='Dinossauro', title='Agujaceratops: dinossauro para colorir', level='medio', age='6-14', kind='classico')
    elif 'Coloring Book BCT' in t:
        name = re.sub(r'^\d+\s+|, Coloring Book BCT, 2017\.jpg$', '', t)
        tr = {'Cornice tipografica sul frontespizio': 'Moldura tipográfica antiga', 'Cycnus adulatus cum iunco levi': 'Cisne entre juncos', 'Bello o cattivo tempo?': 'Tempo bom ou ruim', 'Faber': 'Artesão trabalhando',
              'Zucca': 'Abóbora antiga', 'Soleluna': 'Sol e lua', 'Marca tipografica di Thomas Bertheau': 'Marca tipográfica antiga', 'Ilex coccigera glandifera ex Cephalonia': 'Carvalho com bolotas',
              'Cavallo': 'Cavalo antigo', 'Quercia': 'Carvalho', 'Allegrezza': 'Alegoria da alegria', 'De capra sive hirco Bezaartico': 'Cabra antiga'}.get(name)
        if tr: rec = dict(cat='ilustracoes-classicas', subject=tr, title=f'{tr}: gravura antiga para colorir', level='dificil', age='adultos', kind='classico')
    else:
        book = cat.lower() + ' ' + t.lower()
        hit = next(((subj, c) for rx, subj, c in BOOK_SUBJECT if re.search(rx, book)), None)
        if hit and s['colrel'] < 15 and 0.04 <= s['ink'] <= 0.18 and s['inter'] < 0.38 and s['mid'] < 0.18 and s['paper'] > 0.62 and s['contrast'] > 140:
            k, med, bbox = components(fn)
            if k > 110 or med < 9 or bbox < 0.3: continue  # text pages and tiny specimens
            bk = cat or 'misc'
            if per_book[bk] >= 20 or per_book['subj:' + hit[0]] >= 45: continue
            per_book['subj:' + hit[0]] += 1
            per_book[bk] += 1
            year = re.search(r'(1[5-9]\d\d)', x['date'] + ' ' + cat)
            yr = f' ({year.group(1)})' if year else ''
            subj, c = hit
            nice = {'peixe': 'Peixe', 'ave': 'Ave', 'inseto': 'Insetos', 'polvo e lula': 'Polvo e lula', 'concha': 'Conchas', 'réptil': 'Réptil', 'aranha': 'Aranhas', 'animal pré-histórico': 'Animal pré-histórico',
                    'planta': 'Planta', 'fóssil': 'Fósseis', 'animal': 'Animal'}[subj]
            kind_title = 'Ilustração botânica' if subj == 'planta' else 'Gravura'
            rec = dict(cat=c if c not in ('passaros', 'insetos', 'fundo-do-mar', 'animais') else 'ilustracoes-classicas' if s['ink'] > 0.12 else c,
                       subject=nice, title=f'{kind_title} antiga de {nice.lower()}{yr} para colorir', level='dificil' if s['ink'] > 0.1 else 'medio', age='adultos' if s['ink'] > 0.1 else '9-14', kind='classico')
    if not rec: continue
    seen_titles[rec['title']] += 1
    if seen_titles[rec['title']] > 1: rec['title'] = rec['title'].replace(' para colorir', f' nº {seen_titles[rec["title"]]} para colorir')
    artist = re.sub(r'\s+', ' ', x['artist']).strip()[:90]
    rec.update(id='cm-' + hashlib.md5(x['title'].encode()).hexdigest()[:10], url=x['url'], mime=x['mime'], w=x['w'], h=x['h'], thumb=x['thumb'],
               credit=dict(author=artist, license=x['license'] if x['license'] not in ('No restrictions',) else 'Sem restrições conhecidas (domínio público)', licenseUrl=x['licenseUrl'], sourceUrl=x['page'], sourceName='Wikimedia Commons',
                           text=f"{artist + ', ' if artist else ''}Wikimedia Commons, {x['license']}"))
    out.append(rec)
print(len(out)); print(collections.Counter(r['cat'] for r in out).most_common())
json.dump(out, open('data/cm_curated.json', 'w'), ensure_ascii=False)
