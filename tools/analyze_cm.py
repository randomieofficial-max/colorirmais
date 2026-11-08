import sys, os, json, numpy as np
from PIL import Image
def stats(fn):
    im=Image.open(fn).convert("RGB"); im.thumbnail((256,256))
    a=np.asarray(im).astype(np.float32)
    lum=a@[0.299,0.587,0.114]; sat=a.max(2)-a.min(2)
    hi=np.percentile(lum,92); lo=np.percentile(lum,1)
    n=np.clip((lum-lo)/max(hi-lo,1)*255,0,255)
    paper=n>200
    bgsat=float(np.median(sat[paper])) if paper.any() else 0
    dark=n<120
    colrel=float(np.percentile(sat[~paper],80)-bgsat) if (~paper).any() else 0
    inter=dark[1:-1,1:-1]&dark[:-2,1:-1]&dark[2:,1:-1]&dark[1:-1,:-2]&dark[1:-1,2:]
    return dict(ink=round(float(dark.mean()),4),inter=round(float(inter.sum()/max(dark.sum(),1)),3),mid=round(float(((n>=120)&(n<200)).mean()),4),colrel=round(colrel,1),paper=round(float(paper.mean()),3),contrast=round(float(hi-lo),1))
out={}
for f in sorted(os.listdir(sys.argv[1])):
    try: out[f]=stats(os.path.join(sys.argv[1],f))
    except Exception: pass
json.dump(out,open(sys.argv[2],"w")); print(len(out))
