/* GOMA – engine trận đấu theo lượt. Chạy trong trình duyệt và Node.
 * Luật lấy từ LUẬT_VÀ_QUYẾT_ĐỊNH (file Excel). Số liệu tướng lấy từ data.json (xuất từ Excel).
 * Mọi chỗ "GIẢ ĐỊNH" ghi rõ ở comment để dễ sửa. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GomaEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const K = {
    MAX_TURNS: 15, RAGE_START: 50, RAGE_HIT: 30, RAGE_GOT_HIT: 10, RAGE_SKILL: 100,
    DODGE_CAP: 60, CRIT_CAP: 75, SHIELD_TTL: 2,
    // Núm chỉnh toàn cục (mặc định = không đổi). Dùng để cân bằng nhanh khi chơi thử.
    KNOBS: { healMul: 1, enemyDmgMul: 1, heroDmgMul: 1, healCapPct: null /* trần hồi/lượt theo % máu tối đa, null = không trần */ },
  };

  // Trạng thái. 'extra' = phần giảm chỉ số/khiêu khích đếm thêm 1 lượt để phủ lượt kế (GIẢ ĐỊNH, xem README).
  const STATUS = {
    'Choáng':      { skip: true, rageLoss: 20 },
    'Đóng băng':   { skip: true, mods: { spd: 0.90 } },
    'Ru ngủ':      { skip: true, mods: { spd: 0.95, atk: 0.95 } },
    'Làm chậm':    { mods: { spd: 0.90 } },
    'Khiêu khích': { taunt: true },
    'Điên tiết':   { all: 1.02 },
  };

  function makeRng(seed) {           // mulberry32: cùng seed thì cùng kết quả
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  // Chuyển dữ liệu 1 tướng (data.json) + bậc phẩm chất thành định nghĩa đơn vị cho trận
  function heroDef(h, tierIdx, opts) {
    const s = h.tiers[tierIdx];
    return {
      code: h.code, name: h.name, role: h.role, row: (opts && opts.row) || h.row, slot: opts && opts.slot,
      tier: tierIdx, stats: { hp: s.hp, atk: s.atk, df: s.df, spd: s.spd, regen: s.regen, dodge: s.dodge, acc: s.acc, crit: s.crit, critDmg: s.critDmg, critRes: s.critRes },
      skill: h.skill, passive: h.passive,
    };
  }
  // Quái đơn giản: 1 skill sát thương
  function enemyDef(name, row, st, skillComps) {
    return {
      code: 'EN', name, role: 'Quái', row, tier: 0,
      stats: Object.assign({ regen: 0, dodge: 0.02, acc: 0, crit: 0.02, critDmg: 1.5, critRes: 0 }, st),
      skill: { name: 'Đòn mạnh', components: skillComps || [{ kind: 'Sát thương', target: '1 địch (hàng trước trước, random trong hàng)', frm: 0, n: [1, 1, 1], mag: [2, 2, 2], unit: '× Công của người xả', prob: [null, null, null] }] },
      passive: { components: [] },
    };
  }

  function createBattle(cfg) {
    const rng = cfg.rng || makeRng(cfg.seed || 1);
    const knobs = Object.assign({}, K.KNOBS, cfg.knobs || {});
    const units = []; const events = [];
    let turn = 0, over = false, result = null, failStreak = 0;
    const B = { units, events, rng, knobs };

    function mk(def, side, idx) {
      const u = {
        id: side + idx, side, name: def.name, code: def.code, role: def.role, row: def.row, slot: def.slot == null ? idx : def.slot,
        tier: def.tier || 0, base: Object.assign({}, def.stats), skill: def.skill || { components: [] }, passive: def.passive || { components: [] },
        rage: K.RAGE_START, shield: { v: 0, ttl: 0 }, statuses: [], alive: true, reviveUsed: false, acted: false, healedThisTurn: 0,
      };
      u.hp = u.base.hp; return u;
    }
    (cfg.heroes || []).forEach((d, i) => units.push(mk(d, 'hero', i)));
    (cfg.enemies || []).forEach((d, i) => units.push(mk(d, 'enemy', i)));

    const snaps = cfg.snapshots !== false;                       // mỗi sự kiện kèm ảnh chụp trạng thái để giao diện phát lại
    const snapOf = () => { const o = {}; units.forEach(u => { o[u.id] = { hp: u.hp, maxHp: maxHp(u), rage: u.rage, shield: u.shield.v, alive: u.alive, statuses: u.statuses.map(s => s.name) }; }); return o; };
    const ev = (type, o) => { const e = Object.assign({ t: turn, type }, o); if (snaps) e.snap = snapOf(); events.push(e); return e; };
    const aliveOf = side => units.filter(u => u.side === side && u.alive);
    const oppSide = u => (u.side === 'hero' ? 'enemy' : 'hero');
    const pick = arr => arr[Math.floor(rng() * arr.length)];
    const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

    // ---- chỉ số hiệu dụng (cộng trạng thái) ----
    function eff(u, key) {
      let m = 1;
      for (const s of u.statuses) {
        if (s.all) m *= s.all;
        if (s.mods && s.mods[key]) m *= s.mods[key];
        if (s.atkBuff && key === 'atk') m *= s.atkBuff;
        if (s.spdBuff && key === 'spd') m *= s.spdBuff;
      }
      return u.base[key] * m;
    }
    const maxHp = u => eff(u, 'hp');
    const hasTaunt = u => u.statuses.some(s => s.taunt);
    const skipping = u => u.statuses.some(s => s.skip);

    // thành phần đang hoạt động ở bậc t, trả về giá trị theo bậc
    function act(c, t) {
      if (t < (c.frm || 0)) return null;
      const p = c.prob ? c.prob[t] : null; if (p === 0) return null;
      const mag = c.mag ? c.mag[t] : null;
      if (c.kind === 'Sát thương' && mag == null && c.unit !== '% sát thương cộng thêm') return null;
      if (c.mag && c.mag.some(v => v != null) && mag == null && c.kind !== 'Gây trạng thái') return null;
      return { mag, prob: p == null ? 1 : p, n: (c.n && c.n[t]) || 1, dur: c.dur, status: c.status };
    }
    const comps = (list, t, trig) => (list.components || []).map(c => ({ c, a: act(c, t) })).filter(x => x.a && (!trig || x.c.trigger === trig));

    // ---- áp trạng thái ----
    function applyStatus(tgt, name, N, srcId) {
      const d = STATUS[name]; if (!d || !tgt.alive) return;
      const put = (key, o) => { tgt.statuses = tgt.statuses.filter(s => s.key !== key); tgt.statuses.push(Object.assign({ key, name }, o)); };
      if (d.skip) { put(name, { remaining: N, skip: true }); if (d.rageLoss) tgt.rage = Math.max(0, tgt.rage - d.rageLoss); }
      if (d.mods) put(name + '~mod', { remaining: N + 1, mods: d.mods });   // GIẢ ĐỊNH: giảm chỉ số phủ thêm lượt kế
      if (d.taunt) put(name, { remaining: N + 1, taunt: true });            // GIẢ ĐỊNH: khiêu khích phủ thêm lượt kế
      if (d.all) put(name, { remaining: N, all: d.all });
      ev('status', { target: tgt.id, status: name, n: N });
    }
    function applyAtkBuff(tgt, mag, N, srcId) {
      const key = 'ATK+' + srcId; tgt.statuses = tgt.statuses.filter(s => s.key !== key);
      tgt.statuses.push({ key, name: 'ATK+', remaining: N, atkBuff: 1 + mag }); ev('buff', { target: tgt.id, atk: mag, n: N });
    }

    // ---- hồi / khiên ----
    function heal(tgt, amount, srcName) {
      if (!tgt.alive) return 0; amount *= knobs.healMul;
      const cap = knobs.healCapPct == null ? Infinity : knobs.healCapPct * maxHp(tgt);
      amount = Math.min(amount, Math.max(0, cap - tgt.healedThisTurn));
      const h = Math.max(0, Math.min(maxHp(tgt) - tgt.hp, amount)); tgt.hp += h; tgt.healedThisTurn += h;
      if (h > 0) ev('heal', { target: tgt.id, amount: h, by: srcName }); return h;
    }

    // ---- chọn mục tiêu ----
    function pickEnemyTarget(u) {
      const foes = aliveOf(oppSide(u)); if (!foes.length) return null;
      const t = foes.filter(hasTaunt); if (t.length) return pick(t);
      const front = foes.filter(f => f.row === 'front'); return pick(front.length ? front : foes);
    }
    // MỚI (theo yêu cầu của anh): khiêu khích hút MỌI chiêu nhắm vào phe địch.
    //  - chiêu 1 mục tiêu: đổi thành người đang khiêu khích;
    //  - chiêu từ 2 mục tiêu trở lên: người khiêu khích nhận đòn ĐẦU TIÊN (nếu chưa có trong danh sách thì thế chỗ mục tiêu đầu), các mục tiêu còn lại giữ nguyên.
    const FOE_TARGETS = ['1 địch (hàng trước trước, random trong hàng)', '1 địch hàng sau ngẫu nhiên', 'Địch ngẫu nhiên (nhiều mục tiêu)', '1 địch hàng trước bất kỳ và 1 địch ngay sau (nếu có)', 'Cả hàng trước địch', 'Cả hàng sau địch', 'Toàn bộ địch', 'Địch % máu thấp nhất'];
    function selectTargets(u, c, a, first) {
      const r = selectTargetsRaw(u, c, a, first);
      if (!r.length || FOE_TARGETS.indexOf(c.target) < 0) return r;
      const tau = aliveOf(oppSide(u)).filter(hasTaunt); if (!tau.length) return r;
      const tg = r.find(x => tau.includes(x)) || tau[0];
      if (r.length === 1) return [tg];
      const rest = r.filter(x => x !== tg); if (r.includes(tg)) return [tg].concat(rest);
      return [tg].concat(r.slice(1));
    }
    function selectTargetsRaw(u, c, a, first) {
      const foes = aliveOf(oppSide(u)), allies = aliveOf(u.side), others = allies.filter(x => x !== u);
      switch (c.target) {
        case 'Bản thân': return [u];
        case 'Cả đội mình': return allies;
        case '1 đồng đội ngẫu nhiên': return [pick(others.length ? others : [u])];
        case 'Đồng đội % máu thấp nhất': return [allies.reduce((m, x) => (x.hp / maxHp(x) < m.hp / maxHp(m) ? x : m), allies[0])];
        case 'Đồng đội nộ thấp nhất': { const pool = others.length ? others : [u]; return [pool.reduce((m, x) => (x.rage < m.rage ? x : m), pool[0])]; }
        case '1 địch (hàng trước trước, random trong hàng)': { const t = pickEnemyTarget(u); return t ? [t] : []; }
        case '1 địch hàng sau ngẫu nhiên': {
          const tau = foes.filter(hasTaunt); if (tau.length) return [pick(tau)];
          const back = foes.filter(f => f.row === 'back'); const t = back.length ? pick(back) : (foes.length ? pick(foes) : null); return t ? [t] : [];
        }
        case 'Địch ngẫu nhiên (nhiều mục tiêu)': return shuffle(foes.slice()).slice(0, a.n);
        case '1 địch hàng trước bất kỳ và 1 địch ngay sau (nếu có)': {
          const tau = foes.filter(hasTaunt); const front = foes.filter(f => f.row === 'front');
          const p = tau.length ? pick(tau) : (front.length ? pick(front) : (foes.length ? pick(foes) : null)); if (!p) return [];
          const behind = p.row === 'front' ? foes.find(f => f.row === 'back' && f.slot === p.slot) : null;
          return behind ? [p, behind] : [p];
        }
        case 'Cả hàng trước địch': return foes.filter(f => f.row === 'front');
        case 'Cả hàng sau địch': return foes.filter(f => f.row === 'back');
        case 'Toàn bộ địch': return foes;
        case 'Địch % máu thấp nhất': return foes.length ? [foes.reduce((m, x) => (x.hp / maxHp(x) < m.hp / maxHp(m) ? x : m), foes[0])] : [];
        case '1 đồng đội đã gục (ngẫu nhiên)': { const dead = units.filter(x => x.side === u.side && !x.alive); return dead.length ? [pick(dead)] : []; }
        case 'Cùng mục tiêu với thành phần 1': return (first || []).filter(x => x.alive || c.kind === 'Hồi sinh');
        default: throw new Error('Mục tiêu chưa hỗ trợ: ' + c.target);
      }
    }

    // ---- một đòn (thường hoặc skill) ----
    function strike(att, tgt, mult, isSkill) {
      const dodgePct = clamp((eff(tgt, 'dodge') - eff(att, 'acc')) * 100, 0, K.DODGE_CAP);
      const dodged = rng() * 100 < dodgePct;
      tgt.rage += K.RAGE_GOT_HIT;                                // bị đánh +10, kể cả bị né, kể cả bị skill
      if (dodged) { ev('strike', { actor: att.id, target: tgt.id, dodged: true, skill: isSkill }); return { dodged: true, killed: false }; }
      if (!isSkill) att.rage += K.RAGE_HIT;                      // đánh trúng +30 (skill thì không)
      let dmg = eff(att, 'atk') * 100 / (100 + eff(tgt, 'df')) * mult * (att.side === 'hero' ? knobs.heroDmgMul : knobs.enemyDmgMul);
      let crit = false;
      if (!isSkill) {
        const cp = clamp((eff(att, 'crit') - eff(tgt, 'critRes')) * 100, 0, K.CRIT_CAP);
        if (rng() * 100 < cp) { crit = true; dmg *= eff(att, 'critDmg'); }
      }
      for (const { a } of comps(att.passive, att.tier, 'Khi đánh trúng mục tiêu máu dưới 30%')) {
        if (tgt.hp / maxHp(tgt) < 0.30) dmg *= 1 + a.mag;
      }
      const absorbed = Math.min(tgt.shield.v, dmg); tgt.shield.v -= absorbed;
      const loss = dmg - absorbed; tgt.hp -= loss;
      ev('strike', { actor: att.id, target: tgt.id, dmg, absorbed, crit, skill: isSkill });
      let killed = false;
      if (tgt.hp <= 0) { tgt.hp = 0; killed = true; die(tgt, att, isSkill); }
      else for (const { c, a } of comps(tgt.passive, tgt.tier, 'Khi bị đánh trúng (không né)')) {
        if (c.kind === 'Hồi máu') heal(tgt, a.mag * maxHp(tgt), tgt.passive.name);
        if (c.kind === 'Phản sát thương' && att.alive) {
          const r = dmg * a.mag; att.hp -= r; ev('reflect', { actor: tgt.id, target: att.id, dmg: r });
          if (att.hp <= 0) { att.hp = 0; die(att, tgt, false); }
        }
      }
      return { dodged: false, killed };
    }

    function die(v, killer, bySkill) {
      v.alive = false; v.shield = { v: 0, ttl: 0 }; v.statuses = []; ev('die', { target: v.id, by: killer && killer.id });
      if (killer && killer.alive) {
        for (const { c, a } of comps(killer.passive, killer.tier, 'Khi hạ gục địch')) if (c.kind === 'Hồi nộ') killer.rage += a.mag;
        if (bySkill) for (const { c, a } of comps(killer.passive, killer.tier, 'Khi skill nộ hạ gục địch')) if (c.kind === 'Hồi nộ') killer.rage += a.mag;
      }
      for (const al of aliveOf(v.side)) {
        for (const { c, a } of comps(al.passive, al.tier, 'Khi đồng đội gục')) {
          if (c.kind === 'Hồi nộ') for (const x of selectTargets(al, c, a, null)) x.rage += a.mag;
        }
      }
    }

    // ---- áp một thành phần lên danh sách mục tiêu ----
    function applyComp(u, c, a, targets, isPassive) {
      for (const tgt of targets) {
        if (c.kind === 'Sát thương') { if (tgt.alive) strike(u, tgt, a.mag, true); continue; }
        if (!tgt.alive && c.kind !== 'Hồi sinh') continue;
        if (a.prob < 1 && rng() >= a.prob) continue;
        switch (c.kind) {
          case 'Khiên': tgt.shield = { v: a.mag * maxHp(u), ttl: c.dur || K.SHIELD_TTL }; ev('shield', { target: tgt.id, v: tgt.shield.v }); break;
          case 'Hồi máu': heal(tgt, a.mag * maxHp(tgt), u.skill.name); break;
          case 'Buff chỉ số': applyAtkBuff(tgt, a.mag, c.dur || 2, u.id); break;
          case 'Gây trạng thái': applyStatus(tgt, c.status, c.dur || 1, u.id); break;
          case 'Hồi nộ': tgt.rage += a.mag; break;
          case 'Trừ nộ': tgt.rage = Math.max(0, tgt.rage - a.mag); break;
          case 'Hồi sinh':
            if (!tgt.alive && !u.reviveUsed) {
              u.reviveUsed = true; tgt.alive = true; tgt.hp = a.mag * maxHp(tgt); tgt.rage = 0; tgt.statuses = [];
              ev('revive', { actor: u.id, target: tgt.id, hp: tgt.hp });
            }
            break;
          default: throw new Error('Loại hiệu ứng chưa hỗ trợ: ' + c.kind);
        }
      }
    }
    function runPassives(u, trig) {
      for (const { c, a } of comps(u.passive, u.tier, trig)) {
        if (c.kind === 'Sát thương' || c.kind === 'Phản sát thương') continue;         // xử lý trong strike
        const targets = selectTargets(u, c, a, null);
        if (c.kind === 'Hồi sinh' && !targets.length) continue;                        // không có ai gục thì không tung xác suất
        applyComp(u, c, a, targets, true);
      }
    }

    function castSkill(u) {
      u.rage = 0; ev('skill', { actor: u.id, name: u.skill.name });
      let first = null;
      for (const { c, a } of comps(u.skill, u.tier)) {
        const targets = selectTargets(u, c, a, first);
        if (first === null) first = targets;
        applyComp(u, c, a, targets, false);
        if (over || !aliveOf(oppSide(u)).length) break;
      }
      runPassives(u, 'Khi xả skill');
    }
    function normalAttack(u) { const t = pickEnemyTarget(u); if (t) strike(u, t, 1, false); }

    function actUnit(u) {
      if (skipping(u)) { ev('skip', { actor: u.id }); return; }       // mất đòn: không hồi máu (theo chữ)
      if (u.rage >= K.RAGE_SKILL) castSkill(u); else normalAttack(u);
      if (u.alive) {
        const h = eff(u, 'regen'); if (h > 0) heal(u, h / knobs.healMul, 'hồi/lượt');
        runPassives(u, 'Cuối lượt (sau khi ra đòn)');
      }
    }

    function checkEnd() {
      if (!aliveOf('enemy').length) { over = true; result = 'win'; }
      else if (!aliveOf('hero').length) { over = true; result = 'lose'; }
      return over;
    }

    // ---- một lượt ----
    function playTurn() {
      if (over) return events;
      turn++; ev('turn', { n: turn });
      units.forEach(u => { u.healedThisTurn = 0; });
      for (const u of units.filter(x => x.alive)) runPassives(u, 'Đầu lượt');
      // thứ tự: tốc độ cao ra trước; bằng nhau chính xác thì gacha ẩn, quay lại mỗi lượt
      const groups = new Map();
      for (const u of units.filter(x => x.alive)) { const s = Math.round(eff(u, 'spd') * 1000); if (!groups.has(s)) groups.set(s, []); groups.get(s).push(u); }
      const order = [];
      [...groups.keys()].sort((x, y) => y - x).forEach(s => { const g = groups.get(s); if (g.length > 1) { shuffle(g); ev('tie', { units: g.map(x => x.id) }); } order.push(...g); });
      ev('order', { ids: order.map(x => x.id) });
      for (const u of order) {
        if (!u.alive) continue; actUnit(u);
        if (checkEnd()) return events;
      }
      // hết lượt: đếm thời lượng (lượt hiện tại tính là lượt thứ nhất)
      for (const u of units) {
        u.statuses.forEach(s => { s.remaining--; });
        u.statuses = u.statuses.filter(s => s.remaining > 0);
        if (u.shield.v > 0) { u.shield.ttl--; if (u.shield.ttl <= 0) u.shield = { v: 0, ttl: 0 }; }
        if (u.hp > maxHp(u)) u.hp = maxHp(u);
      }
      if (turn >= K.MAX_TURNS && !checkEnd()) { over = true; result = 'lose'; ev('timeout', {}); }
      return events;
    }

    // ---- buff của main (mini-game) – SỐ TẠM, bảng mini-game chưa thiết kế ----
    const MAIN = {
      'Căn lực': { type: 'atk', vals: [0.10, 0.20, 0.35] },     // +% công cả đội 2 lượt
      'Câu hỏi': { type: 'heal', vals: [0.06, 0.12, 0.20] },    // hồi % máu tối đa cả đội
      'Ghép chữ': { type: 'rage', vals: [10, 20, 35] },         // +nộ cả đội
      'Tập trung': { type: 'shield', vals: [0.05, 0.10, 0.18] },// khiên % máu tối đa
    };
    function applyMain(kind, level) {                           // level: 0 trượt, 1 đạt, 2 hay, 3 tuyệt vời
      const team = aliveOf('hero'); ev('main', { kind, level });
      if (level === 0) {                                        // trượt: debuff tốc độ cả đội theo chuỗi, trần 3 tầng; không buff
        failStreak = Math.min(3, failStreak + 1); const mul = 1 - [0.05, 0.075, 0.10][failStreak - 1];
        team.forEach(u => { u.statuses = u.statuses.filter(s => s.key !== 'MAINDEBUFF'); u.statuses.push({ key: 'MAINDEBUFF', name: 'Debuff main', remaining: 2, spdBuff: mul }); });
        return;
      }
      failStreak = 0;
      const m = MAIN[kind], v = m.vals[level - 1];
      team.forEach(u => {
        if (m.type === 'atk') applyAtkBuff(u, v, 2, 'main');
        if (m.type === 'heal') heal(u, v * maxHp(u), 'main');
        if (m.type === 'rage') u.rage += v;
        if (m.type === 'shield') u.shield = { v: v * maxHp(u), ttl: 2 };
      });
    }

    Object.assign(B, {
      playTurn, applyMain, eff, maxHp, aliveOf, MAIN,
      get turn() { return turn; }, get over() { return over; }, get result() { return result; },
      runAll(mainFn) {                                           // mainFn(turn) -> {kind, level} hoặc null, gọi ở lượt 1,4,7,10,13
        while (!over) {
          if (mainFn && [1, 4, 7, 10, 13].includes(turn + 1)) { const m = mainFn(turn + 1); if (m) applyMain(m.kind, m.level); }
          playTurn();
        }
        return { result, turns: turn };
      },
    });
    return B;
  }

  return { K, STATUS, makeRng, createBattle, heroDef, enemyDef };
});
