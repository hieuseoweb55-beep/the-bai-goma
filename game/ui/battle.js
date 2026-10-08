/* GOMA UI – màn trận: chạy engine một lần, rồi PHÁT LẠI battle.events (mỗi sự kiện kèm snap). */
(function () {
  'use strict';
  const U = window.GomaUI, C = U.C, D = U.D, E = U.E, L = U.L, M = U.M, el = U.el;
  const MAP_BG = { 1: 'bg_kho', 2: 'bg_phongkhach', 3: 'bg_congtykhach', 4: 'bg_xuongdet', 5: 'bg_cang', 6: 'bg_caotoc', 7: 'bg_hoicho', 8: 'bg_thamthan' };
  const STI = { 'Choáng': ['★', '#ffe14a'], 'Đóng băng': ['❄', '#8fe3ff'], 'Ngủ': ['Z', '#c9a8ff'], 'Ru ngủ': ['Z', '#c9a8ff'], 'Làm chậm': ['↓', '#7fb0ff'], 'Khiêu khích': ['!', '#ff6b6b'], 'Điên tiết': ['▲', '#ff8a3c'], 'ATK+': ['↑', '#7de07d'], 'Debuff main': ['↓', '#ff9aa8'] };

  // chạy trận KHÔNG giao diện (dùng để kiểm: cùng seed → cùng kết quả)
  U.runHeadless = function (level, placed, seed) {
    const enemies = L.buildEnemies(D, level, (level.hpMul || 1) * (C.enemyHpMul || 1));
    const b = E.createBattle({ heroes: placed.map(d => Object.assign({}, d)), enemies, seed, knobs: C.knobs, snapshots: false });
    const r = b.runAll();
    return { result: r.result, turns: r.turns, hp: b.units.map(u => Math.round(u.hp * 1000) / 1000) };
  };

  U.startBattle = function (level, placed, opts) {
    opts = opts || {};
    const seed = opts.seed != null ? opts.seed : (U.fixedSeed != null ? U.fixedSeed : (Date.now() % 1e9));
    const enemies = L.buildEnemies(D, level, (level.hpMul || 1) * (C.enemyHpMul || 1));
    const battle = E.createBattle({ heroes: placed.map(d => Object.assign({}, d)), enemies, seed, knobs: C.knobs });
    const initial = {}; battle.units.forEach(u => { initial[u.id] = { hp: u.hp, maxHp: battle.maxHp(u), rage: u.rage, shield: 0, alive: true, statuses: [] }; });
    const res = battle.runAll(); const events = battle.events;
    const sex = U.save.sex || 'nam';

    let speed = U.save.speed || 1, skipping = false, ended = false, gone = false;
    const pend = new Set(), running = new Set();
    const wait = ms => { if (skipping || ms <= 0) return Promise.resolve(); return new Promise(r => { const o = { r }; o.t = setTimeout(() => { pend.delete(o); r(); }, ms / speed); pend.add(o); }); };
    const anim = (node, kf, ms, o) => {
      if (skipping) return Promise.resolve();
      const a = node.animate(kf, Object.assign({ duration: Math.max(1, ms / speed), fill: 'forwards', easing: 'ease-out' }, o || {}));
      running.add(a); return a.finished.catch(() => {}).then(() => { running.delete(a); });
    };

    // ---------- khung ----------
    const root = el('div', { style: 'position:absolute;inset:0' });
    root.appendChild(U.bg(MAP_BG[level.map] || 'bg_kho', false));
    const turnEl = el('div', { class: 'turn', text: 'Lượt 0/' + E.K.MAX_TURNS });
    root.appendChild(el('div', { class: 'battlehead' }, [el('div', { class: 'lvn', text: `Màn ${level.map}.${level.man} · ${level.name}` }), el('div', { class: 'lvp', text: level.place }), turnEl]));
    const ctrl = el('div', { class: 'ctrl' });
    const spBtns = C.speeds.map(v => el('button', { class: 'btn sm sec' + (v === speed ? ' on' : ''), 'data-speed': v, text: v + '×', onclick: () => { speed = v; spBtns.forEach(b => b.classList.toggle('on', Number(b.getAttribute('data-speed')) === v)); } }));
    spBtns.forEach(b => b.classList.toggle('sec', false));
    ctrl.append(...spBtns);   // đã bỏ nút Bỏ qua theo yêu cầu (doSkip vẫn còn cho test qua window.__goma.doSkip)
    root.appendChild(ctrl);
    const world = el('div', { style: 'position:absolute;inset:0' }); root.appendChild(world);

    // ---------- đơn vị ----------
    const units = {};
    battle.units.forEach(u => {
      const isHero = u.side === 'hero';
      const x = (isHero ? C.heroX : C.enemyX)[u.row] + (u.slot % 2 === 1 ? (isHero ? -110 : 110) : 0), y = C.lanesY[u.slot];   // so le nhẹ làn giữa cho đỡ che nhau
      const mdef = isHero ? null : (D.monsters.find(m => m.code === u.code) || {});
      const midBoss = !isHero && level.kind === 'Boss' && mdef.kind === 'Tinh anh';   // boss giữa map = Tinh anh phóng to + đổi tông màu (dùng lại ảnh)
      const targetH = isHero ? C.heroBodyPx : C.heroBodyPx * (C.monsterScale[u.code] || 1) * (midBoss ? 1.3 : 1);
      const nm = isHero ? U.shortName(u.name) : u.name;
      const sp = U.Sprite(u.code.toLowerCase(), targetH, isHero ? ((placed.find(d => d.code === u.code) || {}).visTier ?? u.tier) : 0, nm);
      if (midBoss) sp.el.style.filter = 'hue-rotate(40deg) saturate(1.3)';
      const root_ = el('div', { class: 'unit', 'data-id': u.id, style: `left:${x}px;top:${y}px;z-index:${y}` });
      const ovl = el('div', { class: 'ovl' });
      // overlay trạng thái (vẽ bằng code nếu thiếu ảnh fx)
      const W = sp.w, H = sp.h; const o = {};
      const fxImg = (name, w) => { const s = U.has(name) ? U.src(name) : null; if (!s) { U.noteMissing(name); return null; } const e = M[name]; const k = w / e.w; return el('img', { src: s, style: `width:${e.w * k}px;height:${e.h * k}px;left:${-w / 2}px;top:${-H * 0.5 - e.h * k / 2}px;display:none` }); };
      o.aura = fxImg('fx_dientiet', W * 1.6) || el('div', { class: 'rageaura', style: `width:${W * 1.5}px;height:${H * 1.2}px;left:${-W * 0.75}px;top:${-H * 1.05}px;display:none` });
      o.ice = fxImg('fx_bang', W * 1.4) || el('div', { class: 'ice', style: `width:${W * 1.15}px;height:${H * 1.05}px;left:${-W * 0.575}px;top:${-H * 1.02}px;display:none` });
      o.taunt = fxImg('fx_khieukich', 110) || el('div', { class: 'taunt', text: '!', style: `left:${W * 0.25}px;top:${-H - 40}px;display:none` });
      if (o.taunt.tagName === 'IMG') { o.taunt.style.top = (-H - 30) + 'px'; o.taunt.style.left = (W * 0.2) + 'px'; }
      o.stun = el('div', { class: 'stars', text: '★ ★ ★', style: `left:${-45}px;top:${-H - 30}px;display:none` });
      o.sleep = el('div', { class: 'zzz', text: 'Zzz', style: `left:${W * 0.2}px;top:${-H - 20}px;display:none` });
      o.bubble = el('div', { class: 'bubble', style: `width:${W * 1.25}px;height:${H * 1.12}px;left:${-W * 0.625}px;top:${-H * 1.08}px;display:none` });
      ovl.append(o.aura);
      const mv = el('div', { class: 'mv' }); const breathe = el('div', { class: 'breathe', style: 'position:absolute;left:0;top:0;width:0;height:0' }); breathe.appendChild(sp.el); mv.appendChild(breathe);
      const ovl2 = el('div', { class: 'ovl' }); ovl2.append(o.ice, o.bubble, o.taunt, o.stun, o.sleep);
      mv.appendChild(ovl2);
      // thanh
      const hpF = el('div', { class: 'f' }), shF = el('div', { class: 'sh' }), rgF = el('div', { class: 'f' }), stics = el('div', { class: 'stics' });
      const bars = el('div', { class: 'bars', style: `top:${-(H + 38)}px` }, [el('div', { class: 'skilltag', text: 'SKILL' }), el('div', { class: 'bar' }, [hpF, shF]), el('div', { class: 'bar rg' }, [rgF]), stics]);
      const name = el('div', { class: 'nameplate', text: nm });
      root_.append(ovl, mv, bars, name); world.appendChild(root_);
      units[u.id] = { u, root: root_, mv, sp, o, hpF, shF, rgF, stics, bars, x, y, side: u.side, isHero, dead: false, hitTok: 0, maxHp: initial[u.id].maxHp, isBoss: !isHero && (mdef.kind === 'Boss' || midBoss), H, W, rgBar: bars.querySelector('.bar.rg') };
    });

    // main (cổ vũ)
    const mainSp = U.Sprite('main_' + sex, C.main.h, 0, 'Main');
    const mainBox = el('div', { class: 'mainfig', style: `left:${C.main.x}px;top:${C.main.footY}px;z-index:1000` }, [mainSp.el]); world.appendChild(mainBox);
    let mainTimer = null;
    function mainSet(pose, ms) {
      if (skipping || gone) return; clearTimeout(mainTimer); mainSp.setPose(pose);
      if (ms !== 0) mainTimer = setTimeout(() => { if (!ended) mainSp.setPose('idle'); }, ms || C.mainPoseMs);
    }
    let lowSet = {};

    // ---------- hiển thị snap ----------
    function applySnap(snap) {
      if (!snap) return;
      Object.keys(snap).forEach(id => {
        const s = snap[id], v = units[id]; if (!v) return;
        const pct = Math.max(0, Math.min(1, s.hp / s.maxHp));
        v.hpF.style.width = (pct * 100) + '%'; v.hpF.classList.toggle('low', pct < 0.3);
        v.shF.style.width = Math.min(100, (s.shield / s.maxHp) * 100) + '%';
        v.rgF.style.width = Math.min(100, s.rage) + '%';
        const full = s.alive && s.rage >= 100; v.rgBar.classList.toggle('full', full); v.bars.classList.toggle('full', full);
        const names = []; (s.statuses || []).forEach(n => { if (!names.includes(n)) names.push(n); });
        v.stics.innerHTML = ''; names.forEach(n => { const d = STI[n] || [n.charAt(0), '#ddd']; v.stics.appendChild(el('div', { class: 'sti', title: n, style: `background:${d[1]}`, text: d[0] })); });
        const has = n => names.includes(n), show = (node, b) => { node.style.display = b ? 'block' : 'none'; };
        show(v.o.ice, has('Đóng băng')); show(v.o.aura, has('Điên tiết')); show(v.o.taunt, has('Khiêu khích'));
        show(v.o.stun, has('Choáng')); show(v.o.sleep, has('Ngủ') || has('Ru ngủ')); show(v.o.bubble, s.shield > 0);
        v.bars.style.opacity = s.alive ? 1 : 0;
        if (!s.alive && !v.dead) { v.dead = true; if (skipping) corpse(v); }
        if (s.alive && v.dead) { v.dead = false; uncorpse(v); }
        if (v.isHero) {
          const low = s.alive && pct < 0.3;
          if (low && !lowSet[id]) mainSet('worry');
          lowSet[id] = low;
        }
      });
    }

    // ---------- hiệu ứng ----------
    function ctr(v) { return { x: v.x, y: v.y - v.H * 0.55 }; }
    function float(v, text, cls, dy) {
      if (skipping) return Promise.resolve();
      const p = ctr(v); const d = el('div', { class: 'fnum ' + (cls || ''), text });
      d.style.left = (p.x + (Math.random() * 50 - 25) - 30) + 'px'; d.style.top = (p.y - 30 + (dy || 0)) + 'px'; world.appendChild(d);
      return anim(d, [{ transform: 'translateY(0) scale(.6)', opacity: 0 }, { transform: 'translateY(-14px) scale(1.15)', opacity: 1, offset: .15 }, { transform: 'translateY(-90px) scale(1)', opacity: 0 }], 950, { easing: 'ease-out' }).then(() => d.remove());
    }
    function spark(v) { if (skipping) return; const p = ctr(v); const s = el('div', { class: 'spark', style: `left:${p.x}px;top:${p.y}px` }); world.appendChild(s); anim(s, [{ transform: 'scale(.3) rotate(0)', opacity: 1 }, { transform: 'scale(1.4) rotate(40deg)', opacity: 0 }], 300).then(() => s.remove()); }
    async function orb(a, t) {
      if (skipping) return; const pa = ctr(a), pt = ctr(t); const o = el('div', { class: 'orb', style: `left:${pa.x}px;top:${pa.y}px` }); world.appendChild(o);
      await anim(o, [{ transform: 'translate(0,0) scale(.6)' }, { transform: `translate(${pt.x - pa.x}px,${pt.y - pa.y}px) scale(1.2)` }], 300, { easing: 'ease-in' }); o.remove();
    }
    function shake(v) { return anim(v.mv, [{ transform: 'translate(0,0)' }, { transform: 'translate(-9px,0)' }, { transform: 'translate(8px,0)' }, { transform: 'translate(-5px,0)' }, { transform: 'translate(0,0)' }], 220).then(() => v.mv.getAnimations().forEach(a => a.cancel())); }
    function flash(v) { if (skipping) return; v.sp.el.classList.remove('flash'); void v.sp.el.offsetWidth; v.sp.el.classList.add('flash'); setTimeout(() => v.sp.el.classList.remove('flash'), 200); }
    function showBanner(text, sub) { if (skipping) return Promise.resolve(); window.GomaAudio && GomaAudio.sfx('skill'); const b = el('div', { class: 'banner' }, [text, sub ? el('small', { text: sub }) : null]); world.appendChild(b); return anim(b, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: .25 }, { transform: 'scale(1)', opacity: 1, offset: .75 }, { transform: 'scale(1.05)', opacity: 0 }], 900).then(() => b.remove()); }
    function setHeroPose(v, pose) { if (v.isHero && !v.dead) v.sp.setPose(pose); }
    function revertHit(v) {
      const tok = ++v.hitTok;
      wait(350).then(() => { if (v.hitTok === tok && !v.dead && v.sp.pose === 'hit') v.sp.setPose('idle'); });
    }

    let skillActor = null;
    function endSkillPose() { if (skillActor) { const v = skillActor; skillActor = null; if (!v.dead) v.sp.setPose('idle'); } }

    function impact(T, e, dir) {
      if (e.dodged) { window.GomaAudio && GomaAudio.sfx('dodge'); float(T, 'NÉ', 'dodge'); anim(T.mv, [{ transform: 'translate(0,0)' }, { transform: `translate(${dir * 36}px,0)` }, { transform: 'translate(0,0)' }], 320).then(() => T.mv.getAnimations().forEach(a => a.cancel())); applySnap(e.snap); return; }
      if (T.isHero) T.sp.setPose('hit', true); revertHit(T); flash(T); shake(T); spark(T);
      if (!skipping && window.GomaAudio) GomaAudio.sfx(e.crit ? 'crit' : 'hit');
      const ab = Math.round(e.absorbed || 0), dmg = Math.round((e.dmg || 0) - (e.absorbed || 0));   // e.dmg = tổng trước khi trừ khiên
      if (dmg > 0) float(T, e.crit ? dmg + '!' : String(dmg), e.crit ? 'crit' : '');
      if (ab > 0) float(T, String(ab), 'abs', dmg > 0 ? -50 : 0);
      if (dmg <= 0 && ab <= 0) float(T, '0', '');
      applySnap(e.snap);
    }

    async function doStrike(e) {
      const A = units[e.actor], T = units[e.target]; if (!A || !T) { applySnap(e.snap); return; }
      const dir = A.isHero ? 1 : -1;
      if (e.skill) {
        await orb(A, T); impact(T, e, -dir * 0 + (T.isHero ? -1 : 1)); await wait(160);
      } else {
        let dx = dir * 45, dy = 0;   // chỉ nhún tới trước 45px, KHÔNG lao sang vị trí mục tiêu (tránh nhìn như bị đổi chỗ / loạn đội hình)
        if (A.isHero && M[A.sp.prefix + '_windup']) A.sp.setPose('windup', true);
        await anim(A.mv, [{ transform: 'translate(0,0)' }, { transform: `translate(${-20 * dir}px,0)` }], 170);
        await anim(A.mv, [{ transform: `translate(${-20 * dir}px,0)` }, { transform: `translate(${dx}px,${dy}px)` }], 210, { easing: 'ease-in' });
        if (A.isHero) A.sp.setPose('attack', false);
        impact(T, e, T.isHero ? -1 : 1);
        await wait(90);
        await anim(A.mv, [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'translate(0,0)' }], 230);
        A.mv.getAnimations().forEach(a => a.cancel()); A.mv.style.transform = '';
        if (A.isHero && !A.dead && A !== skillActor) A.sp.setPose('idle');
      }
    }

    // Xác nằm lại tại chỗ: tướng giữ pose 'dead', quái nằm nghiêng; làm tối, ẩn hiệu ứng trạng thái
    function corpse(v) {
      if (!v.isHero) { v.root.style.opacity = 0; v.bars.style.opacity = 0; return; }
      v.root.style.opacity = 0.85;
      v.root.style.transform = v.isHero ? '' : 'rotate(75deg) translateY(30px)';
      v.mv.style.filter = 'grayscale(.7) brightness(.6)';
      v.bars.style.opacity = 0;
      const np = v.root.querySelector('.nameplate'); if (np) np.style.opacity = v.isHero ? 0.6 : 0;
      if (v.isHero) v.sp.setPose('dead');
      ['ice', 'aura', 'taunt', 'stun', 'sleep', 'bubble'].forEach(k => { if (v.o[k]) v.o[k].style.display = 'none'; });
    }
    function uncorpse(v) { v.root.style.opacity = 1; v.root.style.transform = ''; v.mv.style.filter = ''; const np = v.root.querySelector('.nameplate'); if (np) np.style.opacity = ''; }
    async function doDie(e) {
      const T = units[e.target]; if (!T) return;
      T.dead = true; T.hitTok++; applySnap(e.snap); T.bars.style.opacity = 0; if (!skipping && window.GomaAudio) GomaAudio.sfx('die');
      if (skipping) { corpse(T); return; }
      if (T.isHero) { T.sp.setPose('dead'); mainSet('cry', 900); setTimeout(() => { if (!ended) mainSet('worry'); }, 950 / speed); await wait(500); await anim(T.root, [{ opacity: 1, transform: 'rotate(0deg)' }, { opacity: 0.85, transform: 'rotate(0deg)' }], 300); }
      else await anim(T.root, [{ opacity: 1, transform: 'rotate(0deg)' }, { opacity: 0, transform: 'rotate(75deg) translateY(30px)' }], 650);
      T.root.getAnimations().forEach(a => a.cancel()); corpse(T);
    }

    async function doRevive(e) {
      const T = units[e.target]; if (!T) return;
      T.dead = false; T.root.getAnimations().forEach(a => a.cancel()); uncorpse(T); T.sp.setPose('idle'); applySnap(e.snap);
      if (!skipping) {
        const s = U.has('fx_hoisinh') ? el('img', { src: U.src('fx_hoisinh'), style: `position:absolute;mix-blend-mode:screen;width:${T.W * 1.3}px;left:${T.x - T.W * 0.65}px;top:${T.y - T.H * 1.2}px` }) : el('div', { style: `position:absolute;left:${T.x - T.W * 0.5}px;top:${T.y - T.H * 1.4}px;width:${T.W}px;height:${T.H * 1.4}px;background:linear-gradient(rgba(255,230,120,0),rgba(255,230,120,.8));border-radius:50% 50% 0 0` });
        world.appendChild(s); float(T, 'Hồi sinh', 'stat');
        await anim(s, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'translateY(0)', offset: .4 }, { opacity: 0, transform: 'translateY(-30px)' }], 800); s.remove();
      }
    }

    async function handle(e) {
      if (e.type === 'skill' || (e.type === 'strike' && !e.skill) || e.type === 'skip' || e.type === 'turn') endSkillPose();
      switch (e.type) {
        case 'turn': turnEl.textContent = `Lượt ${e.n}/${E.K.MAX_TURNS}`; applySnap(e.snap); await wait(220); break;
        case 'skill': {
          const A = units[e.actor]; applySnap(e.snap);
          if (A.isHero) { skillActor = A; A.sp.setPose('skill'); mainSet('cheer'); } else if (A.isBoss) mainSet('scared');
          if (!skipping) { anim(A.sp.el, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5) drop-shadow(0 0 28px #ffd65a)' }, { filter: 'brightness(1)' }], 800); }
          await showBanner(e.name || 'Skill', U.shortName(A.u.name));
          break;
        }
        case 'strike': await doStrike(e); break;
        case 'heal': { const T = units[e.target]; if (T) { window.GomaAudio && GomaAudio.sfx('heal'); float(T, '+' + Math.round(e.amount), 'heal'); } applySnap(e.snap); await wait(180); break; }
        case 'shield': { const T = units[e.target]; if (T) float(T, 'Khiên ' + Math.round(e.v), 'abs'); applySnap(e.snap); await wait(250); break; }
        case 'status': { const T = units[e.target]; if (T) float(T, e.status, 'stat'); applySnap(e.snap); await wait(260); break; }
        case 'buff': { const T = units[e.target]; if (T) float(T, 'Công +' + Math.round(e.atk * 100) + '%', 'stat'); applySnap(e.snap); await wait(200); break; }
        case 'reflect': { const T = units[e.target]; if (T) { if (T.isHero) T.sp.setPose('hit', true); revertHit(T); flash(T); float(T, 'Phản ' + Math.round(e.dmg), ''); } applySnap(e.snap); await wait(200); break; }
        case 'die': await doDie(e); break;
        case 'revive': await doRevive(e); break;
        case 'skip': { const A = units[e.actor]; if (A) float(A, 'Mất lượt', 'stat'); applySnap(e.snap); await wait(300); break; }
        case 'timeout': await showBanner('Hết ' + E.K.MAX_TURNS + ' lượt'); applySnap(e.snap); break;
        default: if (e.snap) applySnap(e.snap);
      }
    }

    function doSkip() {
      if (skipping || ended) return; skipping = true; clearTimeout(mainTimer);
      running.forEach(a => { try { a.finish(); } catch (x) { /* bỏ qua */ } });
      pend.forEach(o => { clearTimeout(o.t); o.r(); }); pend.clear();
    }

    function finalize() {
      const last = events.length ? events[events.length - 1].snap : initial;
      applySnap(last); world.querySelectorAll('.fnum,.spark,.orb,.banner').forEach(n => n.remove());
      Object.keys(units).forEach(id => {
        const v = units[id]; v.root.getAnimations().forEach(a => a.cancel()); v.mv.getAnimations().forEach(a => a.cancel());
        v.root.style.opacity = last[id].alive ? 1 : 0; v.mv.style.transform = '';
        if (last[id].alive) v.sp.setPose('idle', true);
      });
      turnEl.textContent = `Lượt ${res.turns}/${E.K.MAX_TURNS}`;
    }

    function showResult() {
      ended = true; clearTimeout(mainTimer);
      const win = res.result === 'win';
      if (window.GomaAudio) { GomaAudio.bgm(null); GomaAudio.sfx(win ? 'win' : 'lose'); }
      const cr = win ? U.markCleared(level) : null;
      mainSp.setPose(win ? 'win' : 'cry');
      const box = el('div', { class: 'result' }, [
        el('h1', { class: win ? 'win' : 'lose', id: 'result-title', text: win ? 'Chiến thắng' : 'Thất bại' }),
        win ? el('div', { class: 'rw', id: 'result-reward', text: cr.first ? `+${cr.pulls} lượt quay (lần đầu thắng màn này)` : (cr.pulls > 0 ? `Rớt huy hiệu! +${cr.pulls} lượt quay` : `Không rớt huy hiệu (tỉ lệ ${Math.round(cr.chance * 100)}% khi đánh lại màn này)`) }) : el('div', { class: 'hint', text: (res.turns >= E.K.MAX_TURNS ? 'Hết ' + E.K.MAX_TURNS + ' lượt mà chưa hạ hết quái. ' : '') + 'Gợi ý: Rút thêm tướng hoặc nâng đội.' }),
      ]);
      const btns = el('div', { style: 'display:flex;gap:22px;margin-top:20px' });
      const nl = win ? U.nextLevel(level) : null;
      if (win && nl && U.isUnlocked(nl)) btns.appendChild(el('button', { class: 'btn', id: 'btn-next', text: 'Màn kế ▶', onclick: () => U.screenTeam(nl) }));
      if (win) btns.appendChild(el('button', { class: 'btn sec', id: 'btn-replay', text: 'Đánh lại', onclick: () => U.startBattle(level, placed) }));
      if (!win) btns.appendChild(el('button', { class: 'btn', id: 'btn-retry', text: 'Thử lại', onclick: () => U.startBattle(level, placed) }));
      if (!win && U.save.pulls > 0) btns.appendChild(el('button', { class: 'btn sec', id: 'btn-to-gacha', text: 'Rút thêm tướng', onclick: () => U.screenGacha() }));
      btns.appendChild(el('button', { class: win && nl && U.isUnlocked(nl) ? 'btn sec' : 'btn', id: 'btn-map', text: 'Về bản đồ', onclick: () => U.screenMap(level.map) }));
      box.appendChild(btns); U.overlay().appendChild(box);
      window.__goma.lastResultShown = true;
    }

    async function replay() {
      applySnap(initial); mainSet('shout');
      await wait(900);
      for (const e of events) { if (gone) return; await handle(e); }
      if (gone) return;
      finalize(); await wait(600); showResult();
    }

    window.__goma = window.__goma || {};
    window.__goma.last = { seed, levelKey: U.levelKey(level), team: placed.map(d => ({ code: d.code, tier: d.tier, row: d.row, slot: d.slot })), result: res.result, turns: res.turns, hp: battle.units.map(u => Math.round(u.hp * 1000) / 1000), maxHp: battle.units.map(u => battle.maxHp(u)), events: events.length };
    window.__goma.lastResultShown = false; window.__goma.doSkip = doSkip; window.__goma.setSpeed = v => { speed = v; };
    U.show(root);
    // thả vào khi màn bị thay (người chơi bấm nút khác)
    const obs = new MutationObserver(() => { if (!document.body.contains(root)) { gone = true; clearTimeout(mainTimer); obs.disconnect(); } });
    obs.observe(document.getElementById('screen'), { childList: true });
    replay();
  };
})();
