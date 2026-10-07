/* Quái và chặng demo (SỐ TẠM, chưa cân). Dùng chung cho test và giao diện. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./engine.js')); else root.GomaWaves = factory(root.GomaEngine); })(typeof self !== 'undefined' ? self : this, function (E) {
  const T1 = (t, mag) => ({ kind: 'Sát thương', target: t, frm: 0, n: [1, 1, 1], mag: [mag, mag, mag], unit: '× Công của người xả', prob: [null, null, null] });
  // Số đã hiệu chỉnh bằng mô phỏng (calibrate.js): trận 1-2 gồm quái ×2,5 máu ×2 công; trùm ×0,7 máu ×0,6 công ×0,7 thủ
  const chuot = () => E.enemyDef('Chuột', 'back', { hp: 1125, atk: 130, df: 10, spd: 100, dodge: 0.03 });
  const chuotTruoc = () => E.enemyDef('Chuột', 'front', { hp: 1125, atk: 130, df: 10, spd: 100, dodge: 0.03 });
  const meo = () => E.enemyDef('Mèo hoang', 'front', { hp: 2500, atk: 200, df: 40, spd: 105, dodge: 0.08 });
  const chuotBoss = () => E.enemyDef('Chuột', 'back', { hp: 315, atk: 39, df: 10, spd: 100, dodge: 0.03 });
  const thamMoc = () => E.enemyDef('Thảm mốc', 'front', { hp: 1050, atk: 42, df: 56, spd: 80, regen: 25 });
  const boss = () => E.enemyDef('Khách khó tính', 'front', { hp: 4200, atk: 72, df: 42, spd: 108, regen: 30, crit: 0.05 },
    [{ kind: 'Sát thương', target: 'Địch ngẫu nhiên (nhiều mục tiêu)', frm: 0, n: [2, 2, 2], mag: [1.6, 1.6, 1.6], unit: '× Công của người xả', prob: [null, null, null] }]);
  const place = list => { const cnt = { front: 0, back: 0 }; return list.map(d => { d = Object.assign({}, d); d.slot = cnt[d.row]++; return d; }); };
  const WAVES = [
    { name: 'Kho thảm – trận 1', make: () => place([chuotTruoc(), chuot(), chuot()]) },
    { name: 'Kho thảm – trận 2', make: () => place([meo(), chuot(), chuot()]) },
    { name: 'Kho thảm – trùm: Khách khó tính', make: () => place([boss(), thamMoc(), chuotBoss(), chuotBoss()]) },
  ];
  // xếp đội hình tướng: theo hàng ưa thích, tối đa 3 mỗi hàng, tràn sang hàng kia
  function placeHeroes(defs) {
    const cnt = { front: 0, back: 0 };
    return defs.map(d => { d = Object.assign({}, d); let r = d.row; if (cnt[r] >= 3) r = r === 'front' ? 'back' : 'front'; d.row = r; d.slot = cnt[r]++; return d; });
  }
  return { WAVES, placeHeroes, chuot, chuotTruoc, meo, thamMoc, boss, place };
});
