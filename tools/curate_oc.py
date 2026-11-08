import json, re, sys
sys.path.insert(0,'tools')
from subjects import SUBJECTS, ADJ, BLOCK, PLANT_WORDS, EXCLUDE
d=json.load(open('data/oc_stats.json')); ids=json.load(open('data/oc_ids.json'))
def toks(slug):
    t=[x for x in re.split(r'[^a-z0-9]+',slug.lower()) if x]
    out=set(t)
    for x in t:
        if x.endswith('ies'): out.add(x[:-3]+'y')
        elif x.endswith('es') and len(x)>4: out.add(x[:-2])
        if x.endswith('s') and len(x)>3: out.add(x[:-1])
    return t,out
from PIL import Image
def dhash(fn):
    im=Image.open(fn).convert('L').resize((17,16))
    px=list(im.getdata()); v=0
    for r in range(16):
        for c in range(16): v=(v<<1)|(1 if px[r*17+c]>px[r*17+c+1] else 0)
    return v
hashes=[]
res=[];seen=set();rej={'stats':0,'block':0,'nosub':0,'dup':0}
for f,x in d.items():
    k=f[:-4]; slug=ids[k]['slug']
    strict=(x['col']<8 and 0.015<=x['ink']<=0.24 and x['inter']<0.28 and x['mid']<0.13 and x['nw']<0.5)
    loose=(x['col']<8 and 0.015<=x['ink']<=0.28 and x['inter']<0.42 and x['mid']<0.15 and x['nw']<0.55)
    if not (strict or loose): rej['stats']+=1; continue
    t,ts=toks(slug); joined=' '+' '.join(t)+' '
    if any(b in slug.lower() for b in BLOCK): rej['block']+=1; continue
    sub=None
    for en,cat,pt,g in SUBJECTS:
        if (' ' in en and (' '+en+' ') in joined) or (' ' not in en and en in ts) or (en=='jack-o' and 'jack-o' in slug): sub=(en,cat,pt,g); break
    if not sub: rej['nosub']+=1; continue
    if k in EXCLUDE: rej['block']+=1; continue
    if any(w in slug.lower() for w in PLANT_WORDS) and sub[1] not in ('flores','natureza','frutas','legumes-e-verduras'): sub=('plant','plantas-botanicas','Planta','f')
    key=re.sub(r'-?\d+$','',slug)
    adj=[pt for en,pt in ADJ if en in ts and pt not in sub[2].lower()][:1]
    h=dhash('cache/oc_png/'+f)
    if any(bin(h^o).count('1')<7 for o in hashes): rej['dup']+=1; continue
    hashes.append(h)
    res.append(dict(level=('facil' if x['ink']<0.08 and x['inter']<0.3 else 'medio' if x['ink']<0.16 else 'dificil'),id=k,slug=slug,cat=sub[1],subject=sub[2],g=sub[3],adj=adj[0] if adj else '',ink=x['ink'],stats=x))
print(len(res),rej)
import collections
print(collections.Counter(r['cat'] for r in res).most_common())
json.dump(res,open('data/oc_curated.json','w'),ensure_ascii=False)
