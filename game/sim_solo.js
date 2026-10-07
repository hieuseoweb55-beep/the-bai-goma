// Kiểm đường vào game: chỉ có Thủ kho Hiếu (Trắng), rồi gacha thêm tướng Trắng. Chạy: node sim_solo.js
const E = require('./engine.js'), data = require('./data.json');
const H = (code, tier) => E.heroDef(data.heroes.find(h => h.code === code), tier);
const place = list => { const c = { front: 0, back: 0 }; return list.map(d => (d.slot = c[d.row]++, d)); };
const placeH = defs => { const c = { front: 0, back: 0 }; return defs.map(d => { d = Object.assign({}, d); let r = d.row; if (c[r] >= 3) r = r === 'front' ? 'back' : 'front'; d.row = r; d.slot = c[r]++; return d; }); };
const mouse = (row, k) => E.enemyDef('Chuột', row, { hp: 450 * k, atk: 65 * k, df: 10, spd: 100, dodge: 0.03 });
const cat = () => E.enemyDef('Mèo hoang', 'front', { hp: 1000, atk: 100, df: 40, spd: 105, dodge: 0.08 });
const rt = E.makeRng(4242), others = data.heroes.map(h => h.code).filter(c => c !== 'NV01');
const draw = n => { const a = others.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rt() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
function run(label, extra, mkEnemies, R) {
  let w = 0, t = 0, hpL = 0;
  for (let i = 0; i < R; i++) {
    const team = placeH([H('NV01', 0), ...draw(extra).map(c => H(c, 0))]);
    const b = E.createBattle({ snapshots: false, seed: 100 + i, heroes: team, enemies: place(mkEnemies()) }); const r = b.runAll();
    if (r.result === 'win') { w++; hpL += b.aliveOf('hero').reduce((s, u) => s + u.hp / b.maxHp(u), 0) / team.length; } t += r.turns;
  }
  console.log(`${label.padEnd(46)} thắng ${(w / R * 100).toFixed(0).padStart(3)}% | lượt TB ${(t / R).toFixed(1).padStart(4)}${w ? ' | máu còn TB ' + (hpL / w * 100).toFixed(0) + '%' : ''}`);
}
console.log('--- Chỉ Thủ kho Hiếu (Trắng), quái số gốc (chuột 450 máu/65 công) ---');
run('1 chuột', 0, () => [mouse('front', 1)], 1);
run('2 chuột', 0, () => [mouse('front', 1), mouse('back', 1)], 1);
run('3 chuột', 0, () => [mouse('front', 1), mouse('back', 1), mouse('back', 1)], 1);
run('1 mèo hoang', 0, () => [cat()], 1);
run('3 chuột đã hiệu chỉnh cho đội 5 (×2,5 máu ×2 công)', 0, () => [mouse('front', 1).constructor && E.enemyDef('Chuột', 'front', { hp: 1125, atk: 130, df: 10, spd: 100 }), E.enemyDef('Chuột', 'back', { hp: 1125, atk: 130, df: 10, spd: 100 }), E.enemyDef('Chuột', 'back', { hp: 1125, atk: 130, df: 10, spd: 100 })], 1);
console.log('\n--- Hiếu + tướng Trắng rút thêm (ngẫu nhiên, 300 lần) ---');
const W = (n) => () => Array.from({ length: n }, (_, i) => mouse(i === 0 ? 'front' : 'back', 1));
run('Hiếu + 1 tướng vs 2 chuột gốc', 1, W(2), 300);
run('Hiếu + 1 tướng vs 3 chuột gốc', 1, W(3), 300);
run('Hiếu + 2 tướng vs 3 chuột gốc', 2, W(3), 300);
run('Hiếu + 2 tướng vs mèo + 2 chuột gốc', 2, () => [cat(), mouse('back', 1), mouse('back', 1)], 300);
run('Hiếu + 2 tướng vs 3 chuột hiệu chỉnh (cho đội 5)', 2, () => [E.enemyDef('Chuột', 'front', { hp: 1125, atk: 130, df: 10, spd: 100 }), E.enemyDef('Chuột', 'back', { hp: 1125, atk: 130, df: 10, spd: 100 }), E.enemyDef('Chuột', 'back', { hp: 1125, atk: 130, df: 10, spd: 100 })], 300);
run('Hiếu + 4 tướng vs 3 chuột hiệu chỉnh (đội đủ 5)', 4, () => [E.enemyDef('Chuột', 'front', { hp: 1125, atk: 130, df: 10, spd: 100 }), E.enemyDef('Chuột', 'back', { hp: 1125, atk: 130, df: 10, spd: 100 }), E.enemyDef('Chuột', 'back', { hp: 1125, atk: 130, df: 10, spd: 100 })], 300);
