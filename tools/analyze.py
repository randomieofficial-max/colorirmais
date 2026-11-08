import sys, os, json, numpy as np
from PIL import Image
def stats(fn):
    im=Image.open(fn).convert("RGB")
    im.thumbnail((256,256))
    a=np.asarray(im).astype(np.float32)
    lum=a@[0.299,0.587,0.114]
    sat=a.max(2)-a.min(2)
    # background level: 90th percentile luminance
    bg=np.percentile(lum,90)
    norm=np.clip(lum/ max(bg,1)*255,0,255)
    ink=norm<110
    nonwhite=norm<225
    inkf=ink.mean(); nwf=nonwhite.mean()
    # interior dark: dark pixels whose 4-neighbours are dark too
    d=ink
    inter=d[1:-1,1:-1]&d[:-2,1:-1]&d[2:,1:-1]&d[1:-1,:-2]&d[1:-1,2:]
    interf=inter.sum()/max(d.sum(),1)
    colorful=float(sat[nonwhite].mean()) if nonwhite.any() else 0
    bgsat=float(np.median(sat[norm>230])) if (norm>230).any() else 0
    ys,xs=np.where(nonwhite)
    bbox=((xs.max()-xs.min())*(ys.max()-ys.min()))/(a.shape[0]*a.shape[1]) if len(xs) else 0
    gray_mid=((norm>=110)&(norm<225)).mean()  # mid tones (shading)
    return dict(ink=round(float(inkf),4),nw=round(float(nwf),4),inter=round(float(interf),3),col=round(colorful,1),bgsat=round(bgsat,1),bbox=round(float(bbox),3),mid=round(float(gray_mid),4),w=im.size[0],h=im.size[1])
out={}
d=sys.argv[1]
for f in sorted(os.listdir(d)):
    try: out[f]=stats(os.path.join(d,f))
    except Exception as e: pass
json.dump(out,open(sys.argv[2],"w"))
print(len(out))
