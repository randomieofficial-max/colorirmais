import json, sys, time, urllib.parse, urllib.request, re, concurrent.futures as cf
API="https://commons.wikimedia.org/w/api.php"
UA="ColorirMaisBot/1.0 (coloring site)"
def q(params):
    data=urllib.parse.urlencode({**params,"format":"json","formatversion":"2"}).encode()
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(API,data=data,headers={"User-Agent":UA}),timeout=60) as r:
                return json.load(r)
        except Exception as e:
            time.sleep(2+i*4)
    return {}
raw=json.load(open("data/commons_raw.json"))
titles=list(raw["files"].keys())
def strip(s): return re.sub(r"<[^>]+>","",s or "").strip()
def batch(ts):
    d=q({"action":"query","titles":"|".join(ts),"prop":"imageinfo","iiprop":"url|size|mime|extmetadata","iiurlwidth":"200",
         "iiextmetadatafilter":"LicenseShortName|Artist|ImageDescription|ObjectName|DateTimeOriginal|LicenseUrl|Credit","iiextmetadatalanguage":"en"})
    res=[]
    for p in d.get("query",{}).get("pages",[]):
        ii=(p.get("imageinfo") or [None])[0]
        if not ii: continue
        em=ii.get("extmetadata",{})
        g=lambda k: strip(em.get(k,{}).get("value",""))
        res.append({"title":p["title"],"cat":raw["files"].get(p["title"]),"url":ii["url"],"thumb":ii.get("thumburl"),"w":ii["width"],"h":ii["height"],"mime":ii["mime"],
            "size":ii.get("size"),"license":g("LicenseShortName"),"licenseUrl":g("LicenseUrl"),"artist":g("Artist")[:200],"desc":g("ImageDescription")[:400],"name":g("ObjectName")[:200],"date":g("DateTimeOriginal")[:60],"page":ii.get("descriptionurl")})
    return res
out=[]
chunks=[titles[i:i+50] for i in range(0,len(titles),50)]
with cf.ThreadPoolExecutor(3) as ex:
    for i,r in enumerate(ex.map(batch,chunks)):
        out+=r
        if i%20==0: print(i,len(out),file=sys.stderr)
json.dump(out,open("data/commons_meta.json","w"),ensure_ascii=False)
print(len(out))
