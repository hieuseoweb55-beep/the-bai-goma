// Kiểm tra luật của engine. Chạy: node test_engine.js
const assert = require('assert'); const E = require('./engine.js'); const data = require('./data.json');
let pass = 0, fail = 0; const T = (name, fn) => { try { fn(); pass++; console.log('  ok  ', name); } catch (e) { fail++; console.log('  LỖI ', name, '->', e.message); } };
const H = (code, tier, o) => E.heroDef(data.heroes.find(h => h.code === code), tier, o);
const scripted = v => () => v;                       // rng cố định: 0.99 = không né, không chí mạng, không tung xác suất; 0.0 = luôn né/tung
const plain = (name, row, st, extra) => Object.assign({ code: 'T', name, role: 'x', row, tier: 0, stats: Object.assign({ hp: 1000, atk: 100, df: 0, spd: 100, regen: 0, dodge: 0, acc: 0, crit: 0, critDmg: 1.5, critRes: 0 }, st), skill: { name: 's', components: [] }, passive: { components: [] } }, extra || {});
const DMG = { kind: 'Sát thương', target: '1 địch (hàng trước trước, random trong hàng)', frm: 0, n: [1, 1, 1], mag: [2, 2, 2], unit: '× Công của người xả', prob: [null, null, null] };
const get = (b, id) => b.units.find(u => u.id === id);

console.log('Luật nộ và đòn đánh');
T('nộ khởi đầu 50; đánh trúng +30 cho người đánh, bị đánh +10', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [plain('A', 'front', { spd: 110 })], enemies: [plain('B', 'front', { spd: 100, hp: 5000 })] });
  assert.equal(get(b, 'hero0').rage, 50); b.playTurn();
  assert.equal(get(b, 'hero0').rage, 50 + 30 + 10);   // A đánh trúng +30, rồi B đánh lại A (+10)
  assert.equal(get(b, 'enemy0').rage, 50 + 10 + 30);
});
T('né thành công: người né +10, người đánh KHÔNG được +30, không mất máu', () => {
  const b = E.createBattle({ rng: scripted(0.0), heroes: [plain('A', 'front', { spd: 110 })], enemies: [plain('B', 'front', { spd: 50, dodge: 0.1, hp: 5000 })] });
  b.playTurn(); assert.ok(b.events.some(e => e.type === 'strike' && e.actor === 'hero0' && e.dodged)); assert.equal(get(b, 'hero0').rage, 50 + 10);   // không +30, chỉ +10 vì B đánh lại
  assert.equal(get(b, 'enemy0').rage, 50 + 10 + 30); assert.equal(get(b, 'enemy0').hp, 5000);
});
T('đủ 100 nộ thì xả skill, về 0, skill không +30; mục tiêu +10 kể cả bị skill', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [plain('A', 'front', { spd: 110 }, { skill: { name: 'sk', components: [DMG] } })], enemies: [plain('B', 'front', { spd: 50, hp: 5000 })] });
  get(b, 'hero0').rage = 100; b.playTurn();
  const a = get(b, 'hero0'); assert.equal(get(b, 'enemy0').hp, 5000 - 200);            // ×2 công 100
  assert.equal(a.rage, 0 + 10);                                                          // chỉ còn +10 do B đánh lại
});
T('skill bị né: người xả vẫn về 0, mục tiêu vẫn +10', () => {
  const b = E.createBattle({ rng: scripted(0.0), heroes: [plain('A', 'front', { spd: 110 }, { skill: { name: 'sk', components: [DMG] } })], enemies: [plain('B', 'front', { spd: 50, dodge: 0.1, hp: 5000 })] });
  get(b, 'hero0').rage = 100; b.playTurn(); assert.equal(get(b, 'hero0').rage, 0 + 10);   // về 0 dù bị né, +10 do B đánh lại
  assert.equal(get(b, 'enemy0').hp, 5000); assert.ok(get(b, 'enemy0').rage >= 60);
});
T('đòn thường vào hàng trước trước, hết hàng trước mới tới hàng sau', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [plain('A', 'front', { spd: 110, atk: 10 })], enemies: [plain('F', 'front', { spd: 50, hp: 50000 }), plain('R', 'back', { spd: 50, hp: 50000 })] });
  for (let i = 0; i < 3; i++) b.playTurn();
  assert.equal(get(b, 'enemy1').hp, 50000); assert.ok(get(b, 'enemy0').hp < 50000);
});

console.log('Trạng thái, khiên, khiêu khích');
const STAT = (status, dur) => ({ kind: 'Gây trạng thái', target: '1 địch (hàng trước trước, random trong hàng)', frm: 0, mag: [null, null, null], prob: [1, 1, 1], dur, status, n: [1, 1, 1] });
T('khiên: tạo khi xả skill, còn sau lượt 1, hết sau lượt 2 (lượt hiện tại tính là lượt đầu)', () => {
  const t = H('NV01', 2); t.stats.spd = 10;
  const b = E.createBattle({ rng: scripted(0.99), heroes: [t], enemies: [plain('B', 'front', { atk: 0, spd: 50, hp: 99999 })] });
  const u = get(b, 'hero0'); u.rage = 100; b.playTurn();
  assert.ok(Math.abs(u.shield.v - 0.15 * b.maxHp(u)) < 1e-6, 'khiên 15% máu tối đa'); assert.equal(u.shield.ttl, 1);
  b.playTurn(); assert.equal(u.shield.v, 0);
});
T('khiên hấp thụ trước, phần dư mới trừ máu', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [plain('A', 'front', { spd: 10 })], enemies: [plain('B', 'front', { spd: 100, atk: 100 })] });
  const a = get(b, 'hero0'); a.shield = { v: 60, ttl: 2 }; b.playTurn(); assert.equal(a.shield.v, 0); assert.equal(a.hp, 1000 - 40);
});
T('Choáng: nếu đối thủ chưa ra đòn thì mất đòn và bị trừ 20 nộ', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [plain('A', 'front', { spd: 110 }, { skill: { name: 'sk', components: [STAT('Choáng', 1)] } })], enemies: [plain('B', 'front', { spd: 50, hp: 5000 })] });
  get(b, 'hero0').rage = 100; b.playTurn();
  assert.ok(b.events.some(e => e.type === 'skip' && e.actor === 'enemy0')); assert.equal(get(b, 'enemy0').rage, 30); assert.equal(get(b, 'hero0').hp, 1000);
});
T('Choáng 1 lượt: nếu đối thủ đã ra đòn rồi thì KHÔNG mất đòn ở lượt sau', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [plain('A', 'front', { spd: 50 }, { skill: { name: 'sk', components: [STAT('Choáng', 1)] } })], enemies: [plain('B', 'front', { spd: 110, hp: 5000 })] });
  get(b, 'hero0').rage = 100; b.playTurn(); b.playTurn();
  assert.ok(!b.events.some(e => e.type === 'skip'));
});
T('thời lượng 2 lượt (Điên tiết): còn 1 sau lượt đầu, hết sau lượt hai', () => {
  const dt = { kind: 'Gây trạng thái', target: 'Bản thân', frm: 0, mag: [null, null, null], prob: [1, 1, 1], dur: 2, status: 'Điên tiết', n: [1, 1, 1] };
  const b = E.createBattle({ rng: scripted(0.99), heroes: [plain('A', 'front', { spd: 110 }, { skill: { name: 'sk', components: [dt] } })], enemies: [plain('B', 'front', { atk: 0, hp: 99999 })] });
  const a = get(b, 'hero0'); a.rage = 100; b.playTurn();
  assert.equal(a.statuses.find(s => s.name === 'Điên tiết').remaining, 1); assert.ok(Math.abs(b.eff(a, 'atk') - 102) < 1e-9);
  b.playTurn(); assert.ok(!a.statuses.some(s => s.name === 'Điên tiết'));
});
T('khiêu khích: đòn thường của địch buộc đánh người khiêu khích dù có người khác ở hàng trước', () => {
  const taunt = { kind: 'Gây trạng thái', target: 'Bản thân', frm: 0, mag: [null, null, null], prob: [1, 1, 1], dur: 1, status: 'Khiêu khích', n: [1, 1, 1] };
  for (let seed = 1; seed <= 30; seed++) {
    const b = E.createBattle({ seed, heroes: [plain('Tank', 'front', { spd: 120, hp: 99999, dodge: 0 }, { skill: { name: 'k', components: [taunt] } }), plain('Khác', 'front', { spd: 10, hp: 99999 })], enemies: [plain('E', 'front', { spd: 50, hp: 99999, atk: 10 })] });
    get(b, 'hero0').rage = 100; b.playTurn();
    const hit = b.events.filter(e => e.type === 'strike' && e.actor === 'enemy0'); assert.ok(hit.length && hit.every(e => e.target === 'hero0'), 'seed ' + seed);
  }
});

console.log('Nội tại và skill của từng tướng (dữ liệu thật)');
const run1 = (hero, enemies, setup, turns) => { const b = E.createBattle({ rng: scripted(0.99), heroes: hero, enemies }); setup && setup(b); for (let i = 0; i < (turns || 1); i++) b.playTurn(); return b; };
T('NV01 Xanh dương: bị đánh trúng thì hồi 1% máu tối đa', () => {
  const b = run1([H('NV01', 2)], [plain('E', 'front', { spd: 200, atk: 50, hp: 99999 })], b => { get(b, 'hero0').hp = 1000; });
  const u = get(b, 'hero0'); const dmg = b.events.find(e => e.type === 'strike' && e.target === 'hero0').dmg;
  assert.ok(u.hp > 1000 - dmg + 0.01 * b.maxHp(u) * 0.99, 'hp ' + u.hp);
});
T('NV02 Xanh dương: phản 20% sát thương nhận vào', () => {
  const b = run1([H('NV02', 2)], [plain('E', 'front', { spd: 200, atk: 80, hp: 99999 })]);
  const s = b.events.find(e => e.type === 'strike' && e.target === 'hero0'), r = b.events.find(e => e.type === 'reflect');
  assert.ok(r && Math.abs(r.dmg - 0.2 * s.dmg) < 1e-6);
});
T('NV03 Xanh dương: hạ gục địch thì +20 nộ', () => {
  const b = run1([H('NV03', 2)], [plain('E', 'front', { spd: 1, hp: 1 })]);
  assert.equal(get(b, 'hero0').rage, 50 + 30 + 20);
});
T('NV08 Xanh dương: +50 nộ CHỈ khi skill nộ hạ gục; đòn thường hạ gục thì không', () => {
  const b1 = run1([H('NV08', 2)], [plain('E', 'front', { spd: 1, hp: 1 })]);              // đòn thường kết liễu
  assert.equal(get(b1, 'hero0').rage, 50 + 30);
  const b2 = run1([H('NV08', 2)], [plain('E', 'back', { spd: 1, hp: 1 })], b => { get(b, 'hero0').rage = 100; });   // skill kết liễu
  assert.equal(get(b2, 'hero0').rage, 50);
});
T('NV08: +20% sát thương lên mục tiêu máu dưới 30%', () => {
  const mk = hp => run1([H('NV08', 2)], [plain('E', 'front', { spd: 1, hp, df: 0 })], null, 1).events.find(e => e.type === 'strike').dmg;
  const normal = mk(10000), low = (() => { const b = E.createBattle({ rng: scripted(0.99), heroes: [H('NV08', 2)], enemies: [plain('E', 'front', { spd: 1, hp: 1000 })] }); get(b, 'enemy0').hp = 200; b.playTurn(); return b.events.find(e => e.type === 'strike').dmg; })();
  assert.ok(Math.abs(low / normal - 1.2) < 1e-6, 'tỷ lệ ' + low / normal);
});
T('NV11 Xanh dương: hồi sinh đồng đội đã gục, còn 20% máu, chỉ 1 lần mỗi trận', () => {
  const b = E.createBattle({ rng: scripted(0.0), heroes: [H('NV11', 2), plain('X', 'front', { hp: 1000, spd: 5 }), plain('Y', 'front', { hp: 1000, spd: 4 })], enemies: [plain('E', 'front', { spd: 1, atk: 0, hp: 99999 })] });
  get(b, 'hero1').alive = false; get(b, 'hero1').hp = 0; get(b, 'hero2').alive = false; get(b, 'hero2').hp = 0;
  b.playTurn(); const x = get(b, 'hero1'), y = get(b, 'hero2');
  const revived = [x, y].filter(u => u.alive); assert.equal(revived.length, 1); assert.ok(Math.abs(revived[0].hp - 200) < 1e-6);
  b.playTurn(); b.playTurn(); assert.equal([x, y].filter(u => u.alive).length, 1);
});
T('NV07 Xanh dương: khi đồng đội gục, cả đội +10 nộ', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [H('NV07', 2), plain('X', 'front', { hp: 1, spd: 1 })], enemies: [plain('E', 'front', { spd: 200, atk: 999, hp: 99999 })] });
  const before = get(b, 'hero0').rage; b.playTurn(); assert.ok(!get(b, 'hero1').alive, 'đồng đội phải gục');
  assert.ok(get(b, 'hero0').rage >= before + 10);
});
T('NV09: skill đánh hàng trước và địch ngay sau cùng cột', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [H('NV09', 0)], enemies: [plain('F0', 'front', { spd: 1, hp: 9999, slot: 0 }, { slot: 0 }), plain('R0', 'back', { spd: 1, hp: 9999 }, { slot: 0 }), plain('R1', 'back', { spd: 1, hp: 9999 }, { slot: 1 })] });
  get(b, 'hero0').rage = 100; b.playTurn(); const hit = b.events.filter(e => e.type === 'strike' && e.actor === 'hero0').map(e => e.target).sort();
  assert.deepEqual(hit, ['enemy0', 'enemy1']);
});
T('NV05 Trắng đánh 2 địch; Xanh dương đánh 3 địch', () => {
  const mkb = tier => { const b = E.createBattle({ rng: scripted(0.99), heroes: [H('NV05', tier)], enemies: [0, 1, 2, 3].map(i => plain('E' + i, 'front', { spd: 1, hp: 99999 }, { slot: i })) }); get(b, 'hero0').rage = 100; b.playTurn(); return b.events.filter(e => e.type === 'strike' && e.actor === 'hero0').length; };
  assert.equal(mkb(0), 2); assert.equal(mkb(2), 3);
});

console.log('Thứ tự, gacha ẩn, tái lập');
T('tốc độ bằng nhau chính xác: cả hai thứ tự đều xuất hiện, mỗi lượt quay lại', () => {
  const seen = new Set();
  for (let s = 1; s <= 40; s++) { const b = E.createBattle({ seed: s, heroes: [plain('A', 'front', { spd: 100, hp: 99999 }), plain('B', 'front', { spd: 100, hp: 99999 })], enemies: [plain('E', 'front', { spd: 50, hp: 99999 })] }); b.playTurn(); seen.add(b.events.find(e => e.type === 'order').ids.slice(0, 2).join('>')); }
  assert.equal(seen.size, 2);
});
T('cùng seed thì cùng kết quả', () => {
  const run = s => { const b = E.createBattle({ seed: s, heroes: [H('NV01', 1), H('NV05', 1), H('NV06', 1)], enemies: [plain('E', 'front', { spd: 100, hp: 3000, atk: 90 })] }); return JSON.stringify(b.runAll()); };
  assert.equal(run(7), run(7));
});
T('trận có tối đa 15 lượt, hết lượt chưa diệt hết quái thì thua', () => {
  const b = E.createBattle({ rng: scripted(0.99), heroes: [plain('A', 'front', { atk: 0 })], enemies: [plain('E', 'front', { atk: 0, hp: 999999 })] });
  const r = b.runAll(); assert.equal(r.turns, 15); assert.equal(r.result, 'lose');
});

console.log('Giao diện phát lại');
T('mỗi sự kiện có ảnh chụp trạng thái khớp với trạng thái thật sau sự kiện cuối', () => {
  const b = E.createBattle({ seed: 3, heroes: [H('NV01', 1), H('NV05', 1)], enemies: [plain('E', 'front', { spd: 100, hp: 3000, atk: 90 })] }); b.runAll();
  assert.ok(b.events.every(e => e.snap)); const last = b.events[b.events.length - 1];
  b.units.forEach(u => { assert.ok(Math.abs(last.snap[u.id].hp - u.hp) < 1e-9, 'hp ' + u.id); assert.equal(last.snap[u.id].alive, u.alive); });
});
T('snapshots=false thì không kèm ảnh chụp (nhanh hơn khi mô phỏng hàng loạt)', () => {
  const b = E.createBattle({ seed: 3, snapshots: false, heroes: [plain('A', 'front')], enemies: [plain('E', 'front')] }); b.playTurn(); assert.ok(!b.events[0].snap);
});

console.log(`\n${pass} đạt, ${fail} lỗi`); process.exit(fail ? 1 : 0);
