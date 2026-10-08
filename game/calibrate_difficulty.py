#!/usr/bin/env python3
"""Sinh ui/difficulty_base.js: với mỗi màn Map 2..8, tìm hệ số m (nhân công suất quái) để đội 5 Xanh lá ngẫu nhiên thắng 50%.
Chạy lại mỗi khi đổi engine / chỉ số / quái / tướng:  python3 calibrate_difficulty.py [N=80] [seed]
Cần: pip install playwright + chromium. Dùng cùng cách chia máu/công (difficulty.split) như lúc chạy game."""
import asyncio, pathlib, json, sys
from playwright.async_api import async_playwright
HERE = pathlib.Path(__file__).resolve().parent
URL = (HERE / 'index.html').as_uri()
JS = """([N,SP,ANCH,PASS])=>{const U=GomaUI;const normals=U.D.heroes.filter(h=>!h.vip).map(h=>h.code);
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const R=rng(7);const teams=[];
for(let i=0;i<N;i++){const a=normals.slice();for(let k=a.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[a[k],a[j]]=[a[j],a[k]]}const cs=a.slice(0,5);teams.push(U.buildTeam(cs,c=>1,null))}
const out={};
U.D.levels.filter(l=>l.map>=2).forEach(l=>{
 const wr=m=>{l.hpMul=Math.pow(m,SP);l.atkMul=Math.pow(m,1-SP);let w=0;teams.forEach((d,i)=>{if(U.runHeadless(l,d,1000+i).result==='win')w++});return w/N*100};
 let lo=0.002,hi=60;for(let it=0;it<14;it++){const mid=Math.sqrt(lo*hi);if(wr(mid)>50)lo=mid;else hi=mid}
 out[l.map+'-'+l.man]=Math.round(Math.sqrt(lo*hi)*1000)/1000});

const TIERS={G:1,B:2,P:3,R:4};
function tiersOf(name){const r=[];const re=/([0-9])([GBPR])/g;let m;while((m=re.exec(name))){for(let i=0;i<+m[1];i++)r.push(TIERS[m[2]])}return r}
const anc={};
for(const [lv,team] of Object.entries(ANCH)){const [mp,mn]=lv.split('-').map(Number);const l=U.levelsOf(mp).find(x=>x.man===mn);const tiers=tiersOf(team);
 const R2=rng(7);const ts=[];for(let i=0;i<N;i++){const a=normals.slice();for(let k=a.length-1;k>0;k--){const j=Math.floor(R2()*(k+1));[a[k],a[j]]=[a[j],a[k]]}const cs=a.slice(0,5);const tm={};cs.forEach((c,k)=>tm[c]=tiers[k]);ts.push(U.buildTeam(cs,c=>tm[c],null))}
 const wr=m=>{l.hpMul=Math.pow(m,SP);l.atkMul=Math.pow(m,1-SP);let w=0;ts.forEach((d,i)=>{if(U.runHeadless(l,d,1000+i).result==='win')w++});return w/N*100};
 let lo=0.002,hi=60;for(let it=0;it<14;it++){const mid=Math.sqrt(lo*hi);if(wr(mid)>PASS)lo=mid;else hi=mid}
 anc[lv]=Math.round(Math.sqrt(lo*hi)/out[lv]*1000)/1000}
return {base:out,anchors:anc}}"""
async def main(N):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(URL + '?seed=1&maxmap=8&debug=1'); await pg.wait_for_timeout(600)
        sp = await pg.evaluate('GOMA_CONFIG.difficulty.split')
        cfg = await pg.evaluate('[GOMA_CONFIG.difficulty.anchors, GOMA_CONFIG.difficulty.passRate]')
        res = await pg.evaluate(JS, [N, sp, cfg[0], cfg[1]]); r = res['base']
        (HERE / 'ui' / 'difficulty_base.js').write_text(
            '/* TỰ SINH bởi calibrate_difficulty.py (N=%d, split=%s). Đừng sửa tay.\n   GomaDifficultyBase: hệ số nền từng màn (đội 5 Xanh lá thắng 50%%). GomaDifficultyAnchors: F tại mốc neo (đội tối thiểu thắng passRate%%). */\nwindow.GomaDifficultyBase = %s;\nwindow.GomaDifficultyAnchors = %s;\n' % (N, sp, json.dumps(r), json.dumps(res['anchors'])), encoding='utf8')
        print(len(r), 'màn'); await b.close()
asyncio.run(main(int(sys.argv[1]) if len(sys.argv) > 1 else 80))
