import re, sys, json, time, urllib.request, urllib.parse, concurrent.futures as cf
UA={"User-Agent":"ColorirMaisBot/1.0"}
def get(u):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=40) as r: return r.read().decode("utf-8","ignore")
        except Exception as e: time.sleep(2+i*3)
    return ""
ids={}
for tag in sys.argv[1:]:
    p=1;empty=0
    while p<=200:
        h=get(f"https://openclipart.org/tag/{urllib.parse.quote(tag)}?p={p}")
        found=re.findall(r'href="/detail/(\d+)/([^"]+)"',h)
        new=0
        for i,s in found:
            if i not in ids: ids[i]={"slug":s,"tags":set()};new+=1
            ids[i]["tags"].add(tag)
        print(tag,p,len(found),new,len(ids),file=sys.stderr)
        if not found: break
        p+=1
json.dump({k:{"slug":v["slug"],"tags":sorted(v["tags"])} for k,v in ids.items()},open("data/oc_ids.json","w"))
print(len(ids))
