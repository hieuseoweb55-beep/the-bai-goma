#!/usr/bin/env python3
"""Kiểm giao diện bằng Playwright: chạy 10 màn Map 1 (chế độ debug), bấm 'Bỏ qua', so kết quả với engine không giao diện cùng seed.
Cần: pip install playwright && playwright install chromium.   Chạy: python test_ui.py"""
import asyncio, pathlib, json
from playwright.async_api import async_playwright
URL = (pathlib.Path(__file__).parent / "index.html").resolve().as_uri()
CHECK = """() => { const U=window.GomaUI, L=window.__goma.last; const level=U.D.levels.find(l=>U.levelKey(l)===L.levelKey);
 const placed=L.team.map(t=>U.E.heroDef(U.hero(t.code),t.tier,{row:t.row,slot:t.slot})); const h=U.runHeadless(level,placed,L.seed);
 return h.result===L.result && h.turns===L.turns && JSON.stringify(h.hp)===JSON.stringify(L.hp); }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1920, 'height': 1080}); errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL + "?debug=1&seed=4242"); await pg.wait_for_timeout(1000); ok = True
        for man in range(1, 11):
            if man > 1: await pg.click('#btn-map'); await pg.wait_for_timeout(300)
            await pg.click(f'[data-level="1-{man}"]'); await pg.click('#btn-auto'); await pg.click('#btn-fight')
            await pg.wait_for_timeout(1500); await pg.evaluate('window.__goma.doSkip()')
            await pg.wait_for_function("window.__goma.lastResultShown", timeout=60000)
            same = await pg.evaluate(CHECK); ok &= same; print(f"màn 1.{man}:", "khớp engine" if same else "LỆCH")
        print("lỗi console:", errs or "không"); print("KẾT QUẢ:", "ĐẠT" if ok and not errs else "CÓ LỖI"); await b.close()
asyncio.run(main())
