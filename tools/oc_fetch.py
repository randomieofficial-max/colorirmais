import json, re, os, sys, time, subprocess, urllib.request, concurrent.futures as cf
UA={"User-Agent":"ColorirMaisBot/1.0"}
ids=json.load(open("data/oc_ids.json"))
BAD=re.compile(r"(logo|icon|symbol|button|arrow|font|alphabet-letter|text|sign-|signs|qr|barcode|map-of|flag|emblem|badge|banner|label|tattoo|silhouette|shadow|glyph|keyboard|chart|diagram|graph|circuit|schematic|ui-|interface|cursor|pointer|bullet|separator|divider|ornament-line|line-?\d|stroke|brush|texture|grunge|seamless|wallpaper|background|pixel|nude|naked|sexy|gun|rifle|pistol|weapon|blood|skull|nazi|swastika|cigarette|beer|wine|drunk|devil|satan|bomb|knife|sword|tank|missile|grenade|ammo|bullet|war|soldier|zombie|corpse|dead|death|gore|horror|isometric|3d|outline-of-|outline-icon|line-icon|frame|border|clipart-set|collection|pack|set-of)", re.I)
todo=[(k,v) for k,v in ids.items() if not BAD.search(v["slug"])]
print("candidates",len(todo),file=sys.stderr)
def work(item):
    k,v=item
    svg=f"cache/oc_svg/{k}.svg"; png=f"cache/oc_png/{k}.png"
    if not os.path.exists(svg):
        for i in range(3):
            try:
                with urllib.request.urlopen(urllib.request.Request(f"https://openclipart.org/download/{k}",headers=UA),timeout=40) as r:
                    data=r.read()
                if len(data)>1_500_000: return None
                open(svg,"wb").write(data); break
            except Exception: time.sleep(2+i*3)
        else: return None
    if not os.path.exists(png):
        try: subprocess.run(["rsvg-convert","-w","256","-h","256","-a","-b","white",svg,"-o",png],timeout=30,check=True,capture_output=True)
        except Exception: return None
    return k
done=0
with cf.ThreadPoolExecutor(8) as ex:
    for r in ex.map(work,todo):
        done+=1
        if done%500==0: print(done,file=sys.stderr)
print("ok",file=sys.stderr)
