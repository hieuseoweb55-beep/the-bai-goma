/* Dựng đội quái cho một màn từ data.json (quái + hệ số máu/công). Dùng chung cho mô phỏng và giao diện. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./engine.js')); else root.GomaLevels = factory(root.GomaEngine); })(typeof self !== 'undefined' ? self : this, function (E) {
  function enemyFromMonster(m, hpMul, atkMul) {
    const s = Object.assign({}, m.stats); s.hp *= hpMul; s.atk *= atkMul;
    return { code: m.code, name: m.name, role: 'Quái', row: m.row, tier: 0, kind: m.kind, stats: s, skill: m.skill, passive: m.passive };
  }
  // xếp hàng theo hàng mặc định, tối đa 3 mỗi hàng, tràn sang hàng kia
  function buildEnemies(data, level, hpMul, atkMul) {
    const byCode = {}; data.monsters.forEach(m => { byCode[m.code] = m; });
    const defs = []; level.comp.forEach(c => { for (let i = 0; i < c.count; i++) defs.push(enemyFromMonster(byCode[c.code], hpMul == null ? (level.hpMul || 1) : hpMul, atkMul == null ? (level.atkMul || 1) : atkMul)); });
    const cnt = { front: 0, back: 0 };
    return defs.map(d => { let r = d.row; if (cnt[r] >= 3) r = r === 'front' ? 'back' : 'front'; d.row = r; d.slot = cnt[r]++; return d; });
  }
  function placeHeroes(defs) { const cnt = { front: 0, back: 0 }; return defs.map(d => { d = Object.assign({}, d); let r = d.row; if (cnt[r] >= 3) r = r === 'front' ? 'back' : 'front'; d.row = r; d.slot = cnt[r]++; return d; }); }
  return { buildEnemies, placeHeroes, enemyFromMonster };
});
