// Đội khởi đầu: Hiếu (Trắng) + 1 tướng Trắng khác (lần rút đầu 100% ra tướng khác Hiếu). Chạy: node sim_start.js
const E = require('./engine.js'), data = require('./data.json');
const H = (code, t) => E.heroDef(data.heroes.find(h => h.code === code), t);
const place = l => { const c = { front: 0, back: 0 }; return l.map(d => (d.slot = c[d.row]++, d)); };
const placeH = defs => { const c = { front: 0, back: 0 }; return defs.map(d => { d = Object.assign({}, d); let r = d.row; if (c[r] >= 3) r = r === 'front' ? 'back' : 'front'; d.row = r; d.slot = c[r]++; return d; }); };
const mouse = (row, k) => E.enemyDef('Chuột', row, { hp: 450 * k, atk: 65 * k, df: 10, spd: 100, dodge: 0.03 });
const waves = { '1 chuột': () => [mouse('front', 1)], '2 chuột': () => [mouse('front', 1), mouse('back', 1)], '3 chuột': () => [mouse('front', 1), mouse('back', 1), mouse('back', 1)] };
const partners = data.heroes.filter(h => h.code !== 'NV01');
console.log('Đối tác'.padEnd(26), Object.keys(waves).map(k => k.padEnd(16)).join(''));
const worst = {};
for (const p of partners) {
  const cells = Object.entries(waves).map(([name, mk]) => {
    let w = 0, t = 0; const R = 200;
    for (let i = 0; i < R; i++) { const b = E.createBattle({ snapshots: false, seed: 300 + i, heroes: placeH([H('NV01', 0), H(p.code, 0)]), enemies: place(mk()) }); const r = b.runAll(); if (r.result === 'win') w++; t += r.turns; }
    worst[name] = Math.min(worst[name] ?? 1, w / R);
    return `${(w / R * 100).toFixed(0).padStart(3)}% ${(t / R).toFixed(1).padStart(4)}l`.padEnd(16);
  });
  console.log((p.code + ' ' + p.name.replace(/^HCM-|^HN-/, '')).padEnd(26), cells.join(''));
}
console.log('\nTệ nhất trong 9 đối tác:', Object.entries(worst).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(' | '));
