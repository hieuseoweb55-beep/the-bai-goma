/* GOMA UI – lõi: tiện ích, ảnh, lưu tiến trình, gacha, thẻ tướng. */
(function () {
  'use strict';
  const C = window.GOMA_CONFIG, D = window.GOMA_DATA, M = window.GOMA_MANIFEST || {}, E = window.GomaEngine, L = window.GomaLevels;
  const U = window.GomaUI = { C, D, E, L, M };
  const params = new URLSearchParams(location.search);
  U.debug = params.get('debug') === '1';
  U.fixedSeed = params.has('seed') ? Number(params.get('seed')) : null;
  U.missing = new Set();
  if (C.maxTurns) E.K.MAX_TURNS = C.maxTurns;   // 20 lượt/trận theo yêu cầu
  U.tierNames = ['Trắng', 'Xanh lá', 'Xanh dương', 'Tím', 'Đỏ'];
  U.tierColors = ['#e8e8e8', '#46dc5a', '#3c8cff', '#b45cff', '#ff4a4a'];
  U.rand = U.fixedSeed != null ? E.makeRng(U.fixedSeed + 777) : Math.random;

  U.el = function (tag, props, kids) {
    const e = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k]; if (v == null) continue;
      if (k === 'class') e.className = v; else if (k === 'style') e.style.cssText = v;
      else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
    }
    (kids || []).forEach(c => { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  };
  const el = U.el;

  // ---------- ảnh ----------
  U.noteMissing = function (name) { U.missing.add(name); };
  U.has = function (name) { return !!M[name]; };
  U.src = function (name) { const e = M[name]; if (!e) { U.noteMissing(name); return null; } return 'assets/' + e.file; };
  U.bgUrl = function (name) { const e = M[name]; return e ? 'assets/' + e.file : null; };
  U.bg = function (name, dim) {
    const u = U.bgUrl(name); if (!u) U.noteMissing(name);
    return el('div', { class: 'bgimg' + (dim ? ' dim' : '') + (u ? '' : ' ph-bg'), style: u ? `background-image:url("${u}")` : '' });
  };
  U.preload = function () { Object.keys(M).forEach(k => { const i = new Image(); i.src = 'assets/' + M[k].file; }); };

  // Sprite: các pose của cùng 1 đơn vị dùng chung hệ số phóng (tính từ body_h của idle), căn theo foot_y + cx.
  U.Sprite = function (prefix, targetH, tier, label) {
    const idleE = M[prefix + '_idle'];
    const scale = idleE ? targetH / idleE.body_h : 1;
    const root = el('div', { class: 'sprite' + (tier ? ' t' + tier : '') });
    const imgs = {}; let ph = null;
    const s = { el: root, prefix, scale, pose: null, h: idleE ? idleE.body_h * scale : targetH, w: idleE ? idleE.body_w * scale : targetH * 0.5 };
    s.setPose = function (pose, quiet) {
      let e = M[prefix + '_' + pose];
      if (!e) { if (!quiet && pose !== 'idle') U.noteMissing(prefix + '_' + pose); e = idleE; pose = 'idle'; }
      s.pose = pose;
      Object.keys(imgs).forEach(k => { imgs[k].style.display = 'none'; });
      if (ph) ph.style.display = 'none';
      if (!e) {
        U.noteMissing(prefix + '_idle');
        if (!ph) { ph = el('div', { class: 'ph', text: label || prefix, style: `height:${targetH}px;top:${-targetH}px` }); root.appendChild(ph); }
        ph.style.display = 'flex'; return;
      }
      if (!imgs[pose]) {
        const im = new Image(); im.src = 'assets/' + e.file; im.draggable = false;
        im.style.cssText = `width:${e.w * scale}px;height:${e.h * scale}px;left:${-e.cx * scale}px;top:${-e.foot_y * scale}px`;
        root.appendChild(im); imgs[pose] = im;
      }
      imgs[pose].style.display = 'block';
    };
    s.setPose('idle', true);
    return s;
  };

  // ---------- tướng ----------
  U.hero = code => D.heroes.find(h => h.code === code);
  U.shortName = n => String(n).replace(/^(HCM|HN)\s*-\s*/i, '').trim();
  U.branch = n => { const m = String(n).match(/^(HCM|HN)\s*-/i); return m ? m[1].toUpperCase() : ''; };
  U.cap = s => { s = String(s || '').toLowerCase().replace(/\s+([,.!?])/g, '$1').trim(); return s.replace(/(^|[.!?]\s+)(\S)/g, (m, g1, c) => g1 + c.toUpperCase()); };   // chữ HOA trong data -> câu thường

  U.heroCard = function (hero, tier, o) {
    o = o || {};
    const art = el('div', { class: 'art' });
    const cardSrc = U.has(hero.code.toLowerCase() + '_card') ? U.src(hero.code.toLowerCase() + '_card') : null;
    const idleSrc = U.has(hero.code.toLowerCase() + '_idle') ? U.src(hero.code.toLowerCase() + '_idle') : null;
    if (cardSrc && !o.locked) art.appendChild(el('img', { class: 'cardimg', src: cardSrc, draggable: 'false' }));
    else if (idleSrc) art.appendChild(el('img', { src: idleSrc, style: 'height:92%;width:auto;object-fit:contain', draggable: 'false' }));
    else art.appendChild(el('div', { text: U.shortName(hero.name), style: 'color:#333;font-weight:800;font-size:22px;text-align:center;padding:10px' }));
    const info = el('div', { class: 'info' });
    if (o.locked) { info.appendChild(el('div', { class: 'nm', text: '???' })); info.appendChild(el('div', { class: 'rl', text: 'Chưa có' })); }
    else {
      info.appendChild(el('div', { class: 'nm', text: U.shortName(hero.name) }));
      info.appendChild(el('div', { class: 'rl', text: (U.branch(hero.name) ? U.branch(hero.name) + ' · ' : '') + hero.role }));
      info.appendChild(el('div', { class: 'tr', text: U.tierNames[tier] }));
      if (o.stats) { const t = hero.tiers[tier]; info.appendChild(el('div', { class: 'rl', text: `HP ${t.hp} · Công ${t.atk}` })); }
    }
    return el('div', { class: `hcard t${tier}${o.small ? ' small' : ''}${o.locked ? ' locked' : ''}${o.pick ? ' pick' : ''}` }, [art, info]);
  };

  // ---------- lưu tiến trình ----------
  const KEY = U.debug ? 'goma_save_v1_debug' : 'goma_save_v1';
  const defaults = () => ({ v: 1, sex: null, name: '', owned: { NV01: 0 }, shards: {}, pulls: 0, firstPullDone: false, cleared: {}, speed: C.defaultSpeed });
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return Object.assign(defaults(), JSON.parse(s)); } catch (e) { /* bỏ qua */ }
    const d = defaults();
    if (U.debug) { d.sex = 'nam'; d.name = 'Debug'; d.pulls = 99; d.shards = {}; d.firstPullDone = true; D.heroes.forEach(h => { d.owned[h.code] = C.maxTierDebug; d.shards[h.code] = 300; }); }
    return d;
  }
  U.save = load();
  U.persist = function () { try { localStorage.setItem(KEY, JSON.stringify(U.save)); } catch (e) { /* bỏ qua */ } };
  U.resetSave = function () { try { localStorage.removeItem(KEY); } catch (e) { /* bỏ qua */ } U.save = load(); };
  U.playerName = () => U.save.name || 'Nhân viên mới';

  // ---------- gacha ----------
  U.blueUnlocked = () => { const l = D.levels.find(x => x.map === C.blueUnlockLevel.map && x.man === C.blueUnlockLevel.man); return !!l && U.isCleared(l); };
  U.pull = function (first) {
    const S = U.save; let hero, tier = 0;
    if (first) { const pool = D.heroes.filter(h => h.code !== 'NV01'); hero = pool[Math.floor(U.rand() * pool.length)]; }
    else {
      const w = U.blueUnlocked() ? C.gachaWeightsLate : C.gachaWeightsEarly, tot = w.reduce((a, b) => a + b, 0); let r = U.rand() * tot;
      for (let i = 0; i < w.length; i++) { if (r < w[i]) { tier = i; break; } r -= w[i]; tier = i; }
      hero = D.heroes[Math.floor(U.rand() * D.heroes.length)];
    }
    const cur = S.owned[hero.code]; let kind, shards = 0;
    if (cur === undefined) { kind = 'new'; S.owned[hero.code] = tier; }
    else if (tier > cur) {                                      // rút ra bậc CAO hơn bản đang có -> thay thẳng, bản cũ quy đổi thành mảnh
      kind = 'upgrade'; shards = C.shardsByTier[cur]; S.owned[hero.code] = tier; S.shards = S.shards || {}; S.shards[hero.code] = (S.shards[hero.code] || 0) + shards;
    } else { kind = 'dup'; shards = C.shardsByTier[tier]; S.shards = S.shards || {}; S.shards[hero.code] = (S.shards[hero.code] || 0) + shards; }   // bằng/thấp hơn -> quy đổi mảnh theo bậc của lần rút
    if (first) S.firstPullDone = true;
    U.persist();
    return { hero, tier, kind, prev: cur, shards };
  };
  U.pullMany = function (n) {
    const S = U.save; if (S.pulls < n) return null; const out = [];
    for (let i = 0; i < n; i++) { S.pulls -= 1; out.push(U.pull(false)); }
    U.persist(); return out;
  };
  U.kindText = { new: 'Tướng mới!', dup: 'Trùng, nhận mảnh', upgrade: 'Nâng bậc!' };
  U.shardsOf = code => (U.save.shards || {})[code] || 0;
  U.mergeNeed = code => { const t = U.save.owned[code]; return (t === undefined || t >= C.maxTier) ? null : C.mergeCost[t]; };
  U.canMerge = code => { const n = U.mergeNeed(code); return n != null && U.shardsOf(code) >= n; };
  U.merge = function (code) {                                 // ghép: tiêu mảnh, nâng 1 bậc
    if (!U.canMerge(code)) return false;
    U.save.shards[code] -= U.mergeNeed(code); U.save.owned[code] += 1; U.persist(); return true;
  };

  // Cân bằng Map 2, 3 (theo yêu cầu): luôn 5 quái từ màn 2.1 và chỉ số cao hơn Map 1. Không sửa Excel/data.js: áp lên D.levels lúc chạy.
  (function () {
    const MB = C.mapBalance || {};
    D.levels.forEach(l => {
      const b = MB[l.map]; if (!b || l._balanced) return; l._balanced = true;
      const minCount = b.monsters || 5; let total = l.comp.reduce((a, c) => a + c.count, 0);
      const filler = []; l.comp.forEach(c => { const m = D.monsters.find(x => x.code === c.code); if (m && m.kind !== 'Boss' && !filler.includes(c.code)) filler.push(c.code); });
      if (!filler.length) filler.push(l.comp[l.comp.length - 1].code);
      for (let i = 0; total < minCount; i++, total++) { const code = filler[i % filler.length]; const e = l.comp.find(c => c.code === code); if (e) e.count++; else l.comp.push({ code, count: 1 }); }
      if (b.hpByMan) {                                         // bảng hệ số máu theo màn (đã hiệu chỉnh bằng mô phỏng); công = 1 + 0,8 x (máu - 1)
        const m = b.hpByMan[l.man - 1]; l.hpMul = m; l.atkMul = Math.round((1 + 0.8 * (m - 1)) * 1000) / 1000; l.team = l.team || Math.min(C.teamMax, minCount); return;
      }
      const f = (l.man - 1) / 9;                              // 0 ở màn đầu -> 1 ở màn 10 của map
      l.hpMul = Math.round((b.hp[0] + (b.hp[1] - b.hp[0]) * f) * 1000) / 1000;
      l.atkMul = Math.round((b.atk[0] + (b.atk[1] - b.atk[0]) * f) * 1000) / 1000;
      l.team = l.team || Math.min(C.teamMax, minCount);
    });
  })();

  // ---------- màn chơi ----------
  U.levelKey = l => l.map + '-' + l.man;
  U.levelsOf = map => D.levels.filter(l => l.map === map).sort((a, b) => a.man - b.man);
  U.isCleared = l => !!U.save.cleared[U.levelKey(l)];
  U.mapEnabled = map => map === 1 || (map === 2 && C.enableMap2) || C.enableMap23;
  U.isUnlocked = function (l) {
    if (!U.mapEnabled(l.map)) return false;
    if (U.debug && l.map === 1) return true;
    if (l.man === 1) { if (l.map === 1) return true; const prev = U.levelsOf(l.map - 1); return U.isCleared(prev[prev.length - 1]); }
    const prev = D.levels.find(x => x.map === l.map && x.man === l.man - 1); return !!prev && U.isCleared(prev);
  };
  U.nextLevel = function (l) {
    const ls = U.levelsOf(l.map); const i = ls.findIndex(x => x.man === l.man);
    if (i + 1 < ls.length) return ls[i + 1];
    return U.levelsOf(l.map + 1)[0] || null;
  };
  U.levelIndex = l => D.levels.filter(x => U.mapEnabled(x.map)).sort((a, b) => a.map - b.map || a.man - b.man).findIndex(x => x.map === l.map && x.man === l.man);
  U.maxUnlockedIndex = function () {                           // màn xa nhất đã mở (tiền tuyến)
    const ls = D.levels.filter(x => U.mapEnabled(x.map)).sort((a, b) => a.map - b.map || a.man - b.man); let m = 0;
    ls.forEach((x, i) => { if (U.isUnlocked(x)) m = i; }); return m;
  };
  U.dropChance = function (l) {                                // đánh lại màn đã qua: gần tiền tuyến (max-2..max) 20%, xa hơn 5%
    return (U.maxUnlockedIndex() - U.levelIndex(l)) <= C.dropNearRange ? C.dropRateNear : C.dropRateFar;
  };
  U.markCleared = function (l) {                               // trả về { pulls, first, chance }: thắng lần đầu +1 lượt; đánh lại có tỉ lệ rớt huy hiệu (= 1 lượt quay)
    const k = U.levelKey(l);
    if (!U.save.cleared[k]) { U.save.cleared[k] = { rewarded: true }; U.save.pulls += C.pullFirstClear; U.persist(); return { pulls: C.pullFirstClear, first: true, chance: 0 }; }
    const chance = U.dropChance(l), got = U.rand() < chance ? 1 : 0;
    if (got) { U.save.pulls += got; U.persist(); }
    return { pulls: got, first: false, chance };
  };
  U.autoTeam = function (owned, tierOf) {                      // bậc cao trước, rồi đa dạng vai trò
    const cand = owned.map(h => ({ h, t: tierOf(h.code), p: h.tiers[tierOf(h.code)].hp * h.tiers[tierOf(h.code)].atk }))
      .sort((a, b) => b.t - a.t || b.p - a.p);
    const pick = [], roles = new Set();
    cand.forEach(c => { if (pick.length < C.teamMax && !roles.has(c.h.role)) { pick.push(c); roles.add(c.h.role); } });
    cand.forEach(c => { if (pick.length < C.teamMax && !pick.includes(c)) pick.push(c); });
    return pick.map(c => c.h.code);
  };
  // Bậc Tím/Đỏ không có trong Excel: GIẢ ĐỊNH ngoại suy tuyến tính từ chênh lệch Xanh lá -> Xanh dương (xem README)
  D.heroes.forEach(h => {
    if (h.tiers.length > 3) return;
    const g = h.tiers[1], b = h.tiers[2];
    [3, 4].forEach(n => { const t = { tier: U.tierNames[n] }; Object.keys(b).forEach(f => { if (f === 'tier') return; const v = b[f] + (n - 2) * (b[f] - g[f]); t[f] = (f === 'hp' || f === 'atk' || f === 'df' || f === 'spd') ? Math.round(v) : Math.round(v * 1000) / 1000; }); h.tiers.push(t); });
  });
  U.heroDef = function (h, tier, opts) {     // engine chỉ biết 3 bậc (mảng skill theo bậc) -> truyền bậc kẹp 2, ghi đè chỉ số theo bậc thật
    const d = E.heroDef(h, Math.min(tier, 2), opts); d.visTier = tier;
    if (tier > 2) { const s = h.tiers[tier]; d.stats = { hp: s.hp, atk: s.atk, df: s.df, spd: s.spd, regen: s.regen, dodge: s.dodge, acc: s.acc, crit: s.crit, critDmg: s.critDmg, critRes: s.critRes }; }
    return d;
  };
  U.buildTeamPos = function (codes, tierOf, pos) { return codes.map(c => U.heroDef(U.hero(c), tierOf(c), { row: pos[c].row, slot: pos[c].slot })); };
  U.buildTeam = function (codes, tierOf, rowOv) {
    const defs = codes.map(c => U.heroDef(U.hero(c), tierOf(c), { row: (rowOv && rowOv[c]) || U.hero(c).row }));
    return L.placeHeroes(defs);
  };

  // ---------- màn hình / lớp phủ ----------
  U.screen = () => document.getElementById('screen');
  U.overlay = () => document.getElementById('overlay');
  U.show = function (node) { const s = U.screen(); s.innerHTML = ''; s.appendChild(node); U.overlay().innerHTML = ''; return node; };
  U.toast = function (text, ms) { const t = el('div', { class: 'toast', text }); U.overlay().appendChild(t); setTimeout(() => t.remove(), ms || 1800); };
  U.modal = function (content, o) {
    o = o || {};
    const m = el('div', { class: 'modal' }, [el('div', { class: 'mbox' }, [content])]);
    const close = () => { m.remove(); if (o.onClose) o.onClose(); };
    if (o.closable !== false) { m.querySelector('.mbox').appendChild(el('button', { class: 'closex', text: '×', onclick: close })); m.addEventListener('click', ev => { if (ev.target === m) close(); }); }
    U.overlay().appendChild(m); return { el: m, close };
  };
})();
