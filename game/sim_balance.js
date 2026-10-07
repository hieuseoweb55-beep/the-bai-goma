// Mô phỏng cân bằng nhanh. Chạy: node sim_balance.js [số_đội_ngẫu_nhiên]
const E = require('./engine.js'), W = require('./waves.js'), data = require('./data.json');
const H = (code, tier) => E.heroDef(data.heroes.find(h => h.code === code), tier);
const rngTeam = E.makeRng(12345); const N = +process.argv[2] || 300;
const sample = (arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rngTeam() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
const codes = data.heroes.map(h => h.code);
for (const tier of [0, 1, 2]) {
  console.log(`\n=== Đội 5 tướng ngẫu nhiên, TẤT CẢ bậc ${['Trắng', 'Xanh lá', 'Xanh dương'][tier]} (${N} đội × 3 chặng) ===`);
  W.WAVES.forEach((w, wi) => {
    let win = 0, turns = 0, wins = 0, n = 0;
    for (let i = 0; i < N; i++) {
      const team = W.placeHeroes(sample(codes, 5).map(c => H(c, tier)));
      const b = E.createBattle({ snapshots: false, seed: 1000 + i, heroes: team, enemies: w.make() });
      const r = b.runAll((t) => ({ kind: 'Căn lực', level: 1 })); n++; if (r.result === 'win') { wins++; } turns += r.turns;
    }
    console.log(`${w.name.padEnd(36)} thắng ${(wins / n * 100).toFixed(1)}% | lượt TB ${(turns / n).toFixed(1)}`);
  });
}
// Kịch bản "tank bất tử": Thủ kho Xanh dương + Phụ kho Hưng (khiêu khích) + Duyên (hồi) vs 5 địch công 100
console.log('\n=== Kịch bản chồng buff: tank + khiêu khích + hồi vs 5 địch tập trung ===');
const foes = atk => W.place(Array.from({ length: 5 }, (_, i) => E.enemyDef('Địch', i < 2 ? 'front' : 'back', { hp: 3000, atk, df: 30, spd: 95 + i })));
for (const atk of [100, 140, 180]) {
  let alive = 0, hpLeft = 0, deadHeroes = 0; const R = 200;
  for (let s = 0; s < R; s++) {
    const team = W.placeHeroes([H('NV01', 2), H('NV02', 2), H('NV06', 2), H('NV07', 2), H('NV05', 2)]);
    const b = E.createBattle({ snapshots: false, seed: 5000 + s, heroes: team, enemies: foes(atk) }); b.runAll();
    const t = b.units.find(u => u.id === 'hero0'); if (t.alive) { alive++; hpLeft += t.hp / b.maxHp(t); }
    deadHeroes += b.units.filter(u => u.side === 'hero' && !u.alive).length;
  }
  console.log(`địch công ${atk}: Thủ kho còn sống cuối trận ${(alive / R * 100).toFixed(0)}% (máu còn TB ${(alive ? hpLeft / alive * 100 : 0).toFixed(0)}%) | tướng gục TB ${(deadHeroes / R).toFixed(2)}/5`);
}
