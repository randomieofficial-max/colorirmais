import sys, asyncio
from playwright.async_api import async_playwright
async def main():
    out=sys.argv[1]; urls=sys.argv[2:]
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for i,u in enumerate(urls):
            w,url=u.split('@',1); w=int(w)
            pg=await b.new_page(viewport={'width':w,'height':900 if w>600 else 800})
            msgs=[]
            pg.on('console',lambda m: msgs.append(m.text) if m.type in ('error','warning') else None)
            pg.on('pageerror',lambda e: msgs.append(str(e)))
            await pg.goto('http://127.0.0.1:8765'+url,wait_until='networkidle')
            await pg.wait_for_timeout(4200)
            await pg.screenshot(path=f'{out}/s{i}.png',full_page=True)
            print(url,w,'errors:',msgs[:5])
            await pg.close()
        await b.close()
asyncio.run(main())
