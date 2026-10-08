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
    const vk = pose => (tier >= 3 && M[prefix + '_' + pose + '_t' + tier]) ? prefix + '_' + pose + '_t' + tier : prefix + '_' + pose;   // ảnh Tím/Đỏ riêng (idle, skill) nếu có, thiếu thì dùng ảnh gốc
    const baseIdle = M[prefix + '_idle'], idleE = M[vk('idle')] || baseIdle;
    const scaleOf = key => { const ref = key.endsWith('_t' + tier) && tier >= 3 ? idleE : baseIdle; return ref ? targetH / ref.body_h : 1; };
    const scale = idleE ? scaleOf(vk('idle')) : 1;
    const root = el('div', { class: 'sprite' + (tier ? ' t' + tier : '') });
    const imgs = {}; let ph = null;
    const s = { el: root, prefix, scale, pose: null, h: idleE ? idleE.body_h * scale : targetH, w: idleE ? idleE.body_w * scale : targetH * 0.5 };
    s.setPose = function (pose, quiet) {
      let key = vk(pose), e = M[key];
      if (!e) { if (!quiet && pose !== 'idle') U.noteMissing(prefix + '_' + pose); key = vk('idle'); e = idleE; pose = 'idle'; }
      s.pose = pose;
      Object.keys(imgs).forEach(k => { imgs[k].style.display = 'none'; });
      if (ph) ph.style.display = 'none';
      if (!e) {
        U.noteMissing(prefix + '_idle');
        if (!ph) { ph = el('div', { class: 'ph', text: label || prefix, style: `height:${targetH}px;top:${-targetH}px` }); root.appendChild(ph); }
        ph.style.display = 'flex'; return;
      }
      if (!imgs[pose]) {
        let sc = scaleOf(key);
        if (pose === 'dead' && e.body_w && e.body_h) sc = Math.min(targetH * 0.9 / e.body_w, targetH * 0.55 / e.body_h);   // xác: ảnh nằm vốn rất rộng → ép vào khung chung (Vòng 36)
        const im = new Image(); im.src = 'assets/' + e.file; im.draggable = false;
        im.style.cssText = `width:${e.w * sc}px;height:${e.h * sc}px;left:${-e.cx * sc}px;top:${-e.foot_y * sc}px`;
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
    const pick = pose => { const c = hero.code.toLowerCase(), vn = c + '_' + pose + '_t' + tier; return (tier >= 3 && U.has(vn)) ? U.src(vn) : (U.has(c + '_' + pose) ? U.src(c + '_' + pose) : null); };   // thẻ/idle Tím, Đỏ riêng nếu có
    const cardSrc = pick('card'), idleSrc = pick('idle');
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
  const defaults = () => ({ v: 1, sex: null, name: '', owned: { NV01: 0 }, shards: {}, pulls: 0, firstPullDone: false, cleared: {}, tickets: null, giftDay: '', dailyWins: { day: '', n: {} }, speed: C.defaultSpeed, honor: 0, shop: null, shopSeed: 0 });
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return Object.assign(defaults(), JSON.parse(s)); } catch (e) { /* bỏ qua */ }
    const d = defaults();
    if (U.debug) { d.sex = 'nam'; d.name = 'Debug'; d.pulls = 99; d.honor = 9999; d.shards = {}; d.firstPullDone = true; D.heroes.forEach(h => { d.owned[h.code] = C.maxTierDebug; d.shards[h.code] = 300; }); }
    return d;
  }
  U.save = load();
  U.persist = function () { try { localStorage.setItem(KEY, JSON.stringify(U.save)); } catch (e) { /* bỏ qua */ } };
  U.resetSave = function () { try { localStorage.removeItem(KEY); } catch (e) { /* bỏ qua */ } U.save = load(); };
  U.playerName = () => U.save.name || 'Nhân viên mới';

  // ---------- gacha ----------
  U.blueUnlocked = () => { const l = D.levels.find(x => x.map === C.blueUnlockLevel.map && x.man === C.blueUnlockLevel.man); return !!l && U.isCleared(l); };
  U.topUnlocked = () => { const l = D.levels.find(x => x.map === C.topUnlockLevel.map && x.man === C.topUnlockLevel.man); return !!l && U.isCleared(l); };   // đã thắng 3-10 (mở 4-1): Tím/Đỏ + VIP vào gacha
  U.gachaWeights = () => U.topUnlocked() ? C.gachaWeightsTop : (U.blueUnlocked() ? C.gachaWeightsLate : C.gachaWeightsEarly);
  U.nonVip = () => D.heroes.filter(h => !h.vip);
  U.vipHeroes = () => D.heroes.filter(h => h.vip);
  U.hasVip = () => U.vipHeroes().some(h => U.save.owned[h.code] !== undefined);
  U.grantCard = function (hero, tier) {                        // nhận 1 thẻ tướng ở phẩm chất `tier` (dùng chung cho gacha và shop)
    const S = U.save; const cur = S.owned[hero.code]; let kind, shards = 0;
    if (cur === undefined) { kind = 'new'; S.owned[hero.code] = tier; }
    else if (tier > cur) {                                      // bậc CAO hơn bản đang có -> thay thẳng, bản cũ quy đổi thành mảnh
      kind = 'upgrade'; shards = C.shardsByTier[cur]; S.owned[hero.code] = tier; S.shards = S.shards || {}; S.shards[hero.code] = (S.shards[hero.code] || 0) + shards;
    } else { kind = 'dup'; shards = C.shardsByTier[tier]; S.shards = S.shards || {}; S.shards[hero.code] = (S.shards[hero.code] || 0) + shards; }   // bằng/thấp hơn -> quy đổi mảnh theo bậc của lần rút
    return { hero, tier, kind, prev: cur, shards };
  };
  U.pull = function (first) {
    const S = U.save; let hero, tier = 0;
    if (first) { const pool = D.heroes.filter(h => h.code !== 'NV01' && !h.vip); hero = pool[Math.floor(U.rand() * pool.length)]; }
    else {
      const w = U.gachaWeights(), tot = w.reduce((a, b) => a + b, 0); let r = U.rand() * tot;
      for (let i = 0; i < w.length; i++) { if (r < w[i]) { tier = i; break; } r -= w[i]; tier = i; }
      if (tier >= 3 && U.rand() < C.vipShare) { const v = U.vipHeroes(); hero = v[Math.floor(U.rand() * v.length)]; tier -= 1; }   // ra Tím: 20% là VIP bản Xanh dương; ra Đỏ: 20% là VIP bản Tím
      else { const pool = U.nonVip(); hero = pool[Math.floor(U.rand() * pool.length)]; }
    }
    const res = U.grantCard(hero, tier);
    S.honor = (S.honor || 0) + C.honorPerPull; res.honor = C.honorPerPull;   // mỗi lượt quay trả về 1 thẻ bài danh dự (huân công)
    if (first) S.firstPullDone = true;
    U.persist();
    return res;
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

  // Độ khó theo công thức. F = sức mạnh quái tính theo "đội 5 Xanh lá hòa 50%" (F=1 -> đội 5 xanh lá thắng ~50%; 1,13 ~ 1 Xanh dương + 4 Xanh lá...).
  U.difficultyF = function (l) {
    const d = C.difficulty, ln = Math.log, k = l.map, man = l.man, A = window.GomaDifficultyAnchors || {};
    const anc = (kk, mm) => { const v = A[kk + '-' + mm]; return v ? ln(v) : ln(d.fallback[kk + '-' + mm] || 1); };   // F tại mốc neo (đo bằng calibrate_difficulty.py)
    const E = kk => anc(kk, 10);                                              // F màn 10: đội TỐI THIỂU của map đó thắng ~passRate
    const S = k === 2 ? ln(d.f0) : E(k - 1) + ln(d.startBump);                // F đầu map (màn 1) ~ màn 10 của map trước
    const L7 = k === 2 ? anc(2, 7) : S + d.earlyShare * (E(k) - S);           // màn 7: Map 2 = 5 Lá vừa đủ; map 3+ = 30% mức tăng
    const tot = Math.max(0.02, E(k) - L7); let lg;
    if (man <= 7) lg = S + (L7 - S) * (man - 1) / 6;
    else lg = L7 + tot * d.wallShare.slice(0, man - 7).reduce((a, b) => a + b, 0);   // 8, 9, 10: leo tường
    let F = Math.exp(lg);
    if (man === 5) F *= 1 + d.bossBump;
    const q = /[?&]diff=([\d.]+)/.exec(location.search);
    return F * d.mul * (q ? +q[1] : 1);
  };

  // Cân bằng Map 2, 3 (theo yêu cầu): luôn 5 quái từ màn 2.1 và chỉ số cao hơn Map 1. Không sửa Excel/data.js: áp lên D.levels lúc chạy.
  (function () {
    const MB = C.mapBalance || {};
    D.levels.forEach(l => {
      const b = MB[l.map]; if (!b || l._balanced) return; l._balanced = true;
      const minCount = b.monsters || 5; let total = l.comp.reduce((a, c) => a + c.count, 0);
      const filler = []; l.comp.forEach(c => { const m = D.monsters.find(x => x.code === c.code); if (m && m.kind === 'Thường' && !filler.includes(c.code)) filler.push(c.code); });   // ưu tiên quái Thường để độn cho đủ 5 (không độn thêm Tinh anh/Boss)
      if (!filler.length) l.comp.forEach(c => { const m = D.monsters.find(x => x.code === c.code); if (m && m.kind !== 'Boss' && !filler.includes(c.code)) filler.push(c.code); });
      if (!filler.length) filler.push(l.comp[l.comp.length - 1].code);
      for (let i = 0; total < minCount; i++, total++) { const code = filler[i % filler.length]; const e = l.comp.find(c => c.code === code); if (e) e.count++; else l.comp.push({ code, count: 1 }); }
      if (C.difficulty && l.map >= 2) {                        // công thức độ khó chung (Vòng 29): F(màn) x hệ số nền đo bằng mô phỏng
        const F = U.difficultyF(l), base = (window.GomaDifficultyBase || {})[l.map + '-' + l.man];
        const m = base ? F * base : 1, sp = C.difficulty.split;
        l.diffF = Math.round(F * 1000) / 1000; l.hpMul = Math.round(Math.pow(m, sp) * 1000) / 1000; l.atkMul = Math.round(Math.pow(m, 1 - sp) * 1000) / 1000;
        l.team = l.team || Math.min(C.teamMax, minCount); return;
      }
      if (b.hpByMan) {                                         // (cũ) bảng hệ số máu theo màn; công = 1 + 0,8 x (máu - 1)
        const m = b.hpByMan[l.man - 1]; l.hpMul = m; l.atkMul = b.atkFixed != null ? b.atkFixed : Math.round((1 + 0.8 * (m - 1)) * 1000) / 1000; l.team = l.team || Math.min(C.teamMax, minCount); return;
      }
      const f = (l.man - 1) / 9;                              // 0 ở màn đầu -> 1 ở màn 10 của map
      l.hpMul = Math.round((b.hp[0] + (b.hp[1] - b.hp[0]) * f) * 1000) / 1000;
      l.atkMul = Math.round((b.atk[0] + (b.atk[1] - b.atk[0]) * f) * 1000) / 1000;
      l.team = l.team || Math.min(C.teamMax, minCount);
    });
  })();

  // ---------- shop huân công + đổi mảnh (làm mới mỗi 5 giờ) ----------
  (function () { const q = /[?&]now=(\d+)/.exec(location.search); U._nowOff = q ? (+q[1] - Date.now()) : 0; })();
  U.now = () => Date.now() + (U._nowOff || 0);
  U.shopPeriodMs = () => C.shop.resetHours * 3600 * 1000;
  U.shopSlot = () => Math.floor(U.now() / U.shopPeriodMs());
  U.shopNextReset = () => (U.shopSlot() + 1) * U.shopPeriodMs();
  U.shopState = function () {                                   // sinh bảng đổi cho khung 5 giờ hiện tại (cố định theo khung + hạt giống của người chơi, tải lại trang không đổi được)
    const S = U.save, slot = U.shopSlot();
    if (S.shop && S.shop.slot === slot) { S.shop.offers.forEach(o => { o.price = C.shop.prices[o.slotTier]; }); return S.shop; }   // giá luôn lấy theo config (đổi giá có hiệu lực ngay cả khi bảng đã sinh)
    if (!S.shopSeed) S.shopSeed = 1 + Math.floor(Math.random() * 2147483000);
    const rng = E.makeRng((S.shopSeed + slot * 7919) >>> 0), pick = a => a[Math.floor(rng() * a.length)];
    const offers = [0, 1, 2, 3, 4].map(slotTier => {
      let tier = slotTier, hero;
      if (slotTier >= 3 && rng() < C.vipShare) { hero = pick(U.vipHeroes()); tier = slotTier - 1; }   // ô Tím: 20% VIP Xanh dương; ô Đỏ: 20% VIP Tím
      else hero = pick(U.nonVip());
      return { slotTier, code: hero.code, tier, price: C.shop.prices[slotTier], bought: false };
    });
    S.shop = { slot, offers, exch: { code: pick(U.nonVip()).code, used: false } };
    U.persist(); return S.shop;
  };
  U.shopBuy = function (i) {
    const S = U.save, st = U.shopState(), o = st.offers[i];
    if (!o || o.bought) return { error: 'Đã mua' };
    if ((S.honor || 0) < o.price) return { error: 'Thiếu huân công' };
    S.honor -= o.price; o.bought = true;
    const res = U.grantCard(U.hero(o.code), o.tier); U.persist(); return res;
  };
  U.exchangeInfo = function () {
    const st = U.shopState(), code = st.exch.code;
    return { code, used: false, have: U.shardsOf(code), normalCost: C.shop.exchangeNormal, vipCost: C.shop.exchangeVip, hasVip: U.hasVip() };
  };
  U.exchangeShards = function (kind, target, times) {                  // kind 'normal': 2 mảnh -> 1 mảnh tướng thường tự chọn; 'vip': 3 mảnh -> 1 mảnh tướng VIP tự chọn (phải có VIP rồi)
    const S = U.save, st = U.shopState(), info = U.exchangeInfo(), h = U.hero(target);
    if (!h) return { error: 'Chọn tướng' };
    if (kind === 'vip') { if (!info.hasVip) return { error: 'Cần có tướng VIP trước' }; if (!h.vip) return { error: 'Phải chọn tướng VIP' }; }
    else { if (h.vip) return { error: 'Tướng VIP phải đổi bằng gói VIP' }; if (h.code === info.code) return { error: 'Chọn tướng khác' }; }
    const unit = kind === 'vip' ? info.vipCost : info.normalCost, n = Math.max(1, Math.min(times || 1, Math.floor(info.have / unit)));   // đổi thoải mái, miễn còn mảnh
    if (info.have < unit) return { error: 'Thiếu mảnh' };
    S.shards[info.code] -= unit * n; S.shards[target] = (S.shards[target] || 0) + n; U.persist();
    return { ok: true, cost: unit * n, got: n, from: info.code, to: target };
  };

  // ---------- màn chơi ----------
  U.levelKey = l => l.map + '-' + l.man;
  U.levelsOf = map => D.levels.filter(l => l.map === map).sort((a, b) => a.man - b.man);
  U.isCleared = l => !!U.save.cleared[U.levelKey(l)];
  U.maxMap = (function () { const q = /[?&]maxmap=(\d+)/.exec(location.search); return q ? +q[1] : (C.maxMap != null ? C.maxMap : (C.enableMap23 ? 8 : (C.enableMap2 ? 2 : 1))); })();
  U.mapEnabled = map => map >= 1 && map <= U.maxMap;      // Map 1..maxMap (config.js hoặc ?maxmap=N để xem trước)
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
  U.dropChance = function (l) {                                // đánh lại màn đã qua (d = max - chỉ số màn): d<=2 30%, d<=12 10%, xa hơn 3,5%
    const d = U.maxUnlockedIndex() - U.levelIndex(l);
    return d <= C.dropNearRange ? C.dropRateNear : d <= C.dropMidRange ? C.dropRateMid : C.dropRateFar;
  };
  U.pct = x => { const v = Math.round(x * 1000) / 10; return String(v).replace('.', ','); };   // 0.035 -> '3,5'
  // ---- Giới hạn thắng mỗi màn tối đa C.dailyWinLimit lần / ngày (giờ máy, qua 0h tự reset) – chống cày thẻ gacha ----
  U.today = () => { const d = new Date(U.now()); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  U.dailyBox = function () { const s = U.save; if (!s.dailyWins || s.dailyWins.day !== U.today()) s.dailyWins = { day: U.today(), n: {} }; return s.dailyWins; };
  U.winsToday = l => U.dailyBox().n[U.levelKey(l)] || 0;
  U.dailyLeft = l => Math.max(0, C.dailyWinLimit - U.winsToday(l));
  U.addDailyWin = function (l) { const b = U.dailyBox(), k = U.levelKey(l); b.n[k] = (b.n[k] || 0) + 1; U.persist(); };
  U.canFight = function (l) { if (U.dailyLeft(l) > 0) return true; U.toast('Hôm nay đã thắng màn ' + U.levelKey(l) + ' đủ ' + C.dailyWinLimit + ' lần. Mai quay lại nhé!'); return false; };
  // ---- Thẻ đặc quyền: 10 phút +1 thẻ (tối đa 20). 1 thẻ = đánh nhanh 1 trận ở màn ĐÃ THẮNG (tính vào giới hạn thắng/ngày) ----
  U.tickets = function () {
    const s = U.save, per = C.ticketMinutes * 60000, now = U.now();
    if (!s.tickets || typeof s.tickets.n !== 'number') s.tickets = { n: 0, t: now };
    const t = s.tickets;
    if (t.n >= C.ticketMax) { t.n = C.ticketMax; t.t = now; }
    else { const k = Math.floor((now - t.t) / per); if (k > 0) { t.n = Math.min(C.ticketMax, t.n + k); t.t = t.n >= C.ticketMax ? now : t.t + k * per; } }
    return t;
  };
  U.ticketNextMs = function () { const t = U.tickets(); return t.n >= C.ticketMax ? 0 : Math.max(0, t.t + C.ticketMinutes * 60000 - U.now()); };
  U.quickMax = l => Math.min(U.tickets().n, U.dailyLeft(l));
  U.quickBattle = function (l, times) {
    if (!U.isCleared(l)) return { error: 'Chỉ đánh nhanh được màn đã thắng' };
    const n = Math.min(times, U.quickMax(l)); if (n < 1) return { error: U.tickets().n < 1 ? 'Hết thẻ đặc quyền' : 'Hết lượt thắng hôm nay' };
    let pulls = 0, drops = 0; for (let i = 0; i < n; i++) { const r = U.markCleared(l); pulls += r.pulls; if (r.pulls) drops++; }
    U.save.tickets.n -= n; U.persist(); return { ok: true, n, pulls, drops };
  };
  // ---- Quà hằng ngày: lần đăng nhập đầu tiên trong ngày +10 lượt quay ----
  U.claimDailyGift = function () {
    const s = U.save, d = U.today(); if (s.giftDay === d) return 0;
    s.giftDay = d; if (U.debug) { U.persist(); return 0; }
    s.pulls += C.dailyGiftPulls; U.persist(); return C.dailyGiftPulls;
  };
  U.fmtMs = ms => { const s = Math.ceil(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  U.markCleared = function (l) {                               // trả về { pulls, first, chance }: thắng lần đầu +1 lượt; đánh lại có tỉ lệ rớt huy hiệu (= 1 lượt quay)
    const k = U.levelKey(l); U.addDailyWin(l);
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
