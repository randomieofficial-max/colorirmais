import asyncio, sys
from playwright.async_api import async_playwright
Q=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1280,'height':860},accept_downloads=True)
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('http://127.0.0.1:8765/animais-brasileiros-para-colorir/capivara-fofo/',wait_until='networkidle')
        async with pg.expect_download() as d:
            await pg.click('[data-act=pdf]')
        dl=await d.value; path=Q+'/test.pdf'; await dl.save_as(path); print('pdf',dl.suggested_filename)
        await pg.click('[data-act=paint]')
        await pg.wait_for_selector('.painter.open canvas'); await pg.wait_for_timeout(800)
        box=await pg.locator('.painter canvas').bounding_box()
        # click body, head, orange with different colours
        for color,(fx,fy) in [('#E53935',(0.40,0.52)),('#FB8C00',(0.60,0.33)),('#43A047',(0.66,0.42)),('#4FC3F7',(0.1,0.1))]:
            await pg.click(f'.pt-colors [data-color="{color}"]')
            await pg.mouse.click(box['x']+box['width']*fx, box['y']+box['height']*fy)
        await pg.click('[data-tool=brush]'); await pg.click('.pt-colors [data-color="#8E24AA"]')
        await pg.mouse.move(box['x']+40,box['y']+box['height']-40); await pg.mouse.down(); await pg.mouse.move(box['x']+300,box['y']+box['height']-60,steps=10); await pg.mouse.up()
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=Q+'/paint.png')
        await pg.click('[data-act=undo]'); await pg.wait_for_timeout(200)
        print('errors',errs)
        await b.close()
asyncio.run(main())
