// Chạy thử cả 30 màn để chắc skill của quái hợp lệ trong engine. Map 2, 3 CHƯA hiệu chỉnh nên tỷ lệ thắng chỉ để tham khảo.
const E = require('./engine.js'), L = require('./level_builder.js'), data = require('./data.json');
const H = (c, t) => E.heroDef(data.heroes.find(h => h.code === c), t);
const rt = E.makeRng(99); const codes = data.heroes.map(h => h.code);
const team = (t, n) => { const a = codes.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rt() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return L.placeHeroes(['NV01', ...a.filter(c => c !== 'NV01')].slice(0, n).map(c => H(c, t))); };
let err = 0;
for (const mp of [1, 2, 3]) {
  const rows = [];
  for (const lv of data.levels.filter(l => l.map === mp)) {
    try {
      let w = 0, tu = 0; const R = 150;
      for (let i = 0; i < R; i++) { const b = E.createBattle({ snapshots: false, seed: 20 + i, heroes: team(1, 5), enemies: L.buildEnemies(data, lv) }); const r = b.runAll(); if (r.result === 'win') w++; tu += r.turns; }
      rows.push(`${mp}.${lv.man} ${(w / R * 100).toFixed(0)}%/${(tu / R).toFixed(0)}l`);
    } catch (e) { err++; rows.push(`${mp}.${lv.man} LỖI ${e.message}`); }
  }
  console.log(`Map ${mp} (đội 5 tướng Xanh lá ngẫu nhiên): ` + rows.join(' | '));
}
console.log(err ? `${err} màn lỗi` : 'Cả 30 màn chạy được, không lỗi.');
