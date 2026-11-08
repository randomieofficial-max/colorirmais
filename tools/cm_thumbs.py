import json, os, sys, time, hashlib, urllib.request, concurrent.futures as cf
UA={"User-Agent":"ColorirMaisBot/1.0 (coloring site)"}
d=json.load(open("data/commons_meta.json"))
ok={"image/jpeg","image/png","image/svg+xml","image/gif","image/tiff"}
lic=lambda l: l in ("Public domain","No restrictions","CC0") or l.startswith("CC BY")
todo=[x for x in d if x["mime"] in ok and lic(x["license"]) and x.get("thumb")]
print(len(todo),file=sys.stderr)
def work(x):
    fn="cache/cm_thumb/"+hashlib.md5(x["title"].encode()).hexdigest()+".jpg"
    if os.path.exists(fn): return
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(x["thumb"],headers=UA),timeout=40) as r: open(fn,"wb").write(r.read()); return
        except Exception as e:
            time.sleep(3+i*5)
n=0
with cf.ThreadPoolExecutor(4) as ex:
    for _ in ex.map(work,todo):
        n+=1
        if n%500==0: print(n,file=sys.stderr)
print("done",file=sys.stderr)
