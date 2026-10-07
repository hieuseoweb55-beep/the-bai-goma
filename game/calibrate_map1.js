// Hiệu chỉnh hệ số máu/công của 10 màn map 1 theo giả định tiến trình người chơi. Chạy: node calibrate_map1.js  (ghi map1_calib.json)
const fs = require('fs'), E = require('./engine.js'), L = require('./level_builder.js'), data = require('./data.json');
const H = (code, t) => E.heroDef(data.heroes.find(h => h.code === code), t);
const map1 = data.levels.filter(l => l.map === 1);
const GOAL = [0.97, 0.95, 0.92, 0.90, 0.88, 0.85, 0.85, 0.80, 0.80, 0.60];         // tỷ lệ thắng mong muốn (đề xuất của Claude)
const REWARD = 3, FIRST_PULLS = 1;                                                    // thắng 1 màn thưởng 3 lượt quay (số tạm)
const codes = data.heroes.map(h => h.code), W = data.gacha.weights;
function sampleTeam(manIdx, rng) {                                                    // giả lập: rút gacha, rồi xếp đội mạnh nhất có thể
  const pulls = FIRST_PULLS + REWARD * manIdx, best = {};
  const first = codes.filter(c => c !== 'NV01'); best[first[Math.floor(rng() * first.length)]] = 0;
  for (let i = 1; i < pulls; i++) { const c = codes[Math.floor(rng() * codes.length)]; const r = rng() * 100; const t = r < W[0] ? 0 : r < W[0] + W[1] ? 1 : 2; best[c] = Math.max(best[c] ?? -1, t); }
  const hieu = Math.max(0, best['NV01'] ?? 0); delete best['NV01'];
  const size = map1[manIdx].team;
  const others = Object.entries(best).map(([c, t]) => ({ c, t, k: t + rng() * 0.9 })).sort((a, b) => b.k - a.k).slice(0, size - 1);
  return L.placeHeroes([H('NV01', hieu), ...others.map(o => H(o.c, o.t))]);
}
const R = 400;
function evalLevel(manIdx, hpMul, atkMul, teams) {
  let w = 0, t = 0;
  teams.forEach((team, i) => { const b = E.createBattle({ snapshots: false, seed: 7000 + i, heroes: team.map(x => Object.assign({}, x)), enemies: L.buildEnemies(data, map1[manIdx], hpMul, atkMul) }); const r = b.runAll(); if (r.result === 'win') w++; t += r.turns; });
  return { win: w / teams.length, turns: t / teams.length };
}
const out = [];
map1.forEach((lv, i) => {
  const rng = E.makeRng(500 + i); const teams = Array.from({ length: R }, () => sampleTeam(i, rng));
  let lo = 0.1, hi = 12;
  for (let k = 0; k < 16; k++) { const s = (lo + hi) / 2; const r = evalLevel(i, s, Math.max(0.3, 1 + 0.6 * (s - 1)), teams); if (r.win > GOAL[i]) lo = s; else hi = s; }
  const s = Math.round(((lo + hi) / 2) * 100) / 100, atk = Math.round(Math.max(0.3, 1 + 0.6 * (s - 1)) * 100) / 100;
  const r = evalLevel(i, s, atk, teams);                                              // đánh giá lại bằng đúng giá trị đã làm tròn
  out.push({ man: lv.man, hpMul: s, atkMul: atk, win: r.win, turns: r.turns, team: lv.team });
  console.log(`1.${String(lv.man).padEnd(2)} ${lv.name.padEnd(20)} đội ${lv.team} | hệ số máu ×${s} công ×${atk} -> thắng ${(r.win * 100).toFixed(0)}% (mục tiêu ${(GOAL[i] * 100) | 0}%), ${r.turns.toFixed(1)} lượt`);
});
fs.writeFileSync('map1_calib.json', JSON.stringify(out, null, 1));
