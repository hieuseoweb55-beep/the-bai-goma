// Dò số quái để đạt mục tiêu độ khó (số mục tiêu là đề xuất của Claude). Chạy: node calibrate.js
const E = require('./engine.js'), data = require('./data.json');
const H = (code, tier) => E.heroDef(data.heroes.find(h => h.code === code), tier);
const place = list => { const c = { front: 0, back: 0 }; return list.map(d => (d.slot = c[d.row]++, d)); };
const placeH = defs => { const c = { front: 0, back: 0 }; return defs.map(d => { d = Object.assign({}, d); let r = d.row; if (c[r] >= 3) r = r === 'front' ? 'back' : 'front'; d.row = r; d.slot = c[r]++; return d; }); };
const rt = E.makeRng(777); const codes = data.heroes.map(h => h.code);
const sample = n => { const a = codes.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rt() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
const TEAMS = Array.from({ length: 200 }, () => sample(5));
const mk = (name, row, hp, atk, df, spd, extra) => E.enemyDef(name, row, Object.assign({ hp, atk, df, spd }, extra || {}));
const boss = (hp, atk) => mk('Khách khó tính', 'front', hp, atk, 40, 108, { regen: 20, crit: 0.05 }).constructor === Object ? null : null;
function wave(k, p) {
  if (k === 0) return place([mk('Chuột', 'front', 450 * p.hp, 65 * p.atk, 10, 100), mk('Chuột', 'back', 450 * p.hp, 65 * p.atk, 10, 100), mk('Chuột', 'back', 450 * p.hp, 65 * p.atk, 10, 100)]);
  if (k === 1) return place([mk('Mèo hoang', 'front', 1000 * p.hp, 100 * p.atk, 40, 105, { dodge: 0.08 }), mk('Chuột', 'back', 450 * p.hp, 65 * p.atk, 10, 100), mk('Chuột', 'back', 450 * p.hp, 65 * p.atk, 10, 100)]);
  const b = E.enemyDef('Khách khó tính', 'front', { hp: 6000 * p.hp, atk: 120 * p.atk, df: 60 * p.df, spd: 108, regen: 30, crit: 0.05 },
    [{ kind: 'Sát thương', target: 'Địch ngẫu nhiên (nhiều mục tiêu)', frm: 0, n: [2, 2, 2], mag: [1.6, 1.6, 1.6], unit: '× Công của người xả', prob: [null, null, null] }]);
  return place([b, mk('Thảm mốc', 'front', 1500 * p.hp, 70 * p.atk, 80 * p.df, 80, { regen: 25 }), mk('Chuột', 'back', 450 * p.hp, 65 * p.atk, 10, 100), mk('Chuột', 'back', 450 * p.hp, 65 * p.atk, 10, 100)]);
}
function stat(k, p, tier) {
  let w = 0, t = 0;
  TEAMS.forEach((tm, i) => { const b = E.createBattle({ snapshots: false, seed: 9000 + i, heroes: placeH(tm.map(c => H(c, tier))), enemies: wave(k, p) }); const r = b.runAll(() => ({ kind: 'Căn lực', level: 1 })); if (r.result === 'win') w++; t += r.turns; });
  return { win: w / TEAMS.length, turns: t / TEAMS.length };
}

// Mục tiêu độ khó (đề xuất của Claude): đội 5 tướng ngẫu nhiên, mini-game auto 'đạt' mỗi lần
const grid = (xs, ys, zs, f) => { let best = null; for (const x of xs) for (const y of ys) for (const z of zs) { const r = f({ hp: x, atk: y, df: z }); if (!best || r.err < best.err) best = Object.assign({ hp: x, atk: y, df: z }, r); } return best; };
const w1 = grid([1, 2, 3, 4, 5, 6], [1, 1.5, 2, 2.5, 3], [1], p => { const s = stat(0, p, 0); return { err: Math.abs(s.win - 0.90) + 0.03 * Math.abs(s.turns - 6), ...s }; });
console.log(`trận 1 (Trắng): hp×${w1.hp} atk×${w1.atk} -> thắng ${(w1.win * 100).toFixed(0)}%, ${w1.turns.toFixed(1)} lượt`);
const w2 = grid([1, 2, 3, 4, 5, 6], [1, 1.5, 2, 2.5, 3], [1], p => { const s = stat(1, p, 0); return { err: Math.abs(s.win - 0.75) + 0.03 * Math.abs(s.turns - 9), ...s }; });
console.log(`trận 2 (Trắng): hp×${w2.hp} atk×${w2.atk} -> thắng ${(w2.win * 100).toFixed(0)}%, ${w2.turns.toFixed(1)} lượt`);
const bs = grid([0.4, 0.5, 0.6, 0.7, 0.8, 1], [0.6, 0.8, 1, 1.2, 1.5], [0.3, 0.4, 0.5, 0.7, 1], p => {
  const r = [stat(2, p, 0), stat(2, p, 1), stat(2, p, 2)]; const g = [0.25, 0.5, 0.75];
  return { err: r.reduce((a, x, i) => a + Math.abs(x.win - g[i]), 0), r };
});
console.log(`trùm: hp×${bs.hp} atk×${bs.atk} thủ×${bs.df} -> thắng Trắng ${(bs.r[0].win * 100).toFixed(0)}% (${bs.r[0].turns.toFixed(1)} lượt), Xanh lá ${(bs.r[1].win * 100).toFixed(0)}% (${bs.r[1].turns.toFixed(1)}), Xanh dương ${(bs.r[2].win * 100).toFixed(0)}% (${bs.r[2].turns.toFixed(1)})`);

console.log('\n-- thử vài tổ hợp cụ thể --');
const show = (k, p, label) => console.log(label, [0, 1, 2].map(t => { const s = stat(k, p, t); return `${['T', 'XL', 'XD'][t]} ${(s.win * 100).toFixed(0)}% ${s.turns.toFixed(1)}l`; }).join(' | '));
show(0, { hp: 2.5, atk: 2, df: 1 }, 'trận1 hp×2.5 atk×2 ');
show(0, { hp: 3, atk: 2, df: 1 }, 'trận1 hp×3 atk×2   ');
show(1, { hp: 2.5, atk: 2, df: 1 }, 'trận2 hp×2.5 atk×2 ');
show(1, { hp: 2, atk: 2.5, df: 1 }, 'trận2 hp×2 atk×2.5 ');
show(2, { hp: 0.7, atk: 0.6, df: 0.7 }, 'trùm hp×.7 atk×.6 df×.7');
show(2, { hp: 0.6, atk: 0.8, df: 0.7 }, 'trùm hp×.6 atk×.8 df×.7');
show(2, { hp: 0.7, atk: 0.8, df: 0.5 }, 'trùm hp×.7 atk×.8 df×.5');
