import json, sys, time, urllib.parse, urllib.request
API="https://commons.wikimedia.org/w/api.php"
UA="ColorirMaisBot/1.0 (coloring site; contact via site)"
def q(params):
    params={**params,"format":"json","formatversion":"2"}
    url=API+"?"+urllib.parse.urlencode(params)
    for i in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=40) as r:
                return json.load(r)
        except Exception as e:
            time.sleep(2+i*3)
    return {}
def members(cat):
    out=[];cont={}
    while True:
        d=q({"action":"query","list":"categorymembers","cmtitle":cat,"cmlimit":"500","cmtype":"file|subcat",**cont})
        out+=d.get("query",{}).get("categorymembers",[])
        if "continue" in d: cont=d["continue"]
        else: break
    return out
roots=sys.argv[2:]; maxdepth=int(sys.argv[1])
seen=set();files={};
stack=[(r,0,r) for r in roots]
while stack:
    cat,dep,root=stack.pop()
    if cat in seen: continue
    seen.add(cat)
    for m in members(cat):
        t=m["title"]
        if t.startswith("Category:"):
            if dep<maxdepth: stack.append((t,dep+1,root))
        elif t.startswith("File:"):
            files.setdefault(t,cat)
    print(len(seen),len(files),cat[:80],file=sys.stderr)
json.dump({"cats":sorted(seen),"files":files},open(sys.stdout.fileno(),"w"),ensure_ascii=False)
