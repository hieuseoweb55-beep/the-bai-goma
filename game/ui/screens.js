/* GOMA UI – các màn hình: chọn main, intro, gacha, bản đồ, chọn đội, bộ sưu tập, cài đặt. */
(function () {
  'use strict';
  const U = window.GomaUI, C = U.C, D = U.D, el = U.el;
  const S = () => U.save;
  const MAP_BG = { 1: 'bg_kho', 2: 'bg_phongkhach', 3: 'bg_congtykhach' };
  const NOTE = 'Đây chỉ là game vui';

  // ---------- chọn main ----------
  U.screenMainSelect = function () {
    let sex = S().sex || 'nam';
    const root = el('div', { class: 'mainsel' });
    root.appendChild(U.bg('bg_kho', true));
    const cards = {};
    const mk = (g, label) => {
      const name = 'main_' + g + '_card'; const src = U.has(name) ? U.src(name) : (U.has('main_' + g + '_idle') ? U.src('main_' + g + '_idle') : null);
      const art = el('div', { class: 'art' }, [src ? el('img', { src, draggable: 'false' }) : el('div', { text: 'Main ' + label, style: 'color:#333;font-size:40px;font-weight:800' })]);
      const c = el('div', { class: 'mcard' + (sex === g ? ' sel' : ''), 'data-sex': g, onclick: () => { sex = g; Object.keys(cards).forEach(k => cards[k].classList.toggle('sel', k === g)); } }, [art, el('div', { class: 'cap', text: label })]);
      cards[g] = c; return c;
    };
    const input = el('input', { class: 'namebox', type: 'text', maxlength: '20', placeholder: 'Nhân viên mới', value: S().name || '' });
    const wrap = el('div', { style: 'position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:26px' }, [
      el('div', { class: 'title', style: 'position:static', text: 'GOMA – Game thẻ bài' }),
      el('div', { style: 'font-size:34px;font-weight:700', text: 'Chọn nhân vật chính của bạn' }),
      el('div', { class: 'mcards', style: 'margin-top:10px' }, [mk('nam', 'Nam'), mk('nu', 'Nữ')]),
      input,
      el('button', { class: 'btn', id: 'btn-start', text: 'Bắt đầu', onclick: () => {
        S().sex = sex; S().name = input.value.trim() || 'Nhân viên mới'; U.persist(); U.screenIntro(true);
      } }),
    ]);
    root.appendChild(wrap);
    root.appendChild(el('div', { class: 'note', text: NOTE }));
    U.show(root);
  };

  // ---------- reveal gacha ----------
  U.reveal = function (results, onClose) {
    const wrap = el('div', { class: 'revealwrap' });
    const closeBtn = el('button', { class: 'btn', id: 'btn-reveal-ok', text: results.length > 1 ? 'Xong' : 'Tiếp tục', onclick: () => { wrap.remove(); if (onClose) onClose(); } });
    closeBtn.style.visibility = 'hidden';
    if (results.length === 1) {
      const r = results[0];
      const inner = el('div', { class: 'inner', style: 'width:300px;height:430px' }, [
        el('div', { class: 'face back' }, ['?']),
        el('div', { class: 'face front', style: 'position:absolute;inset:0' }, [U.heroCard(r.hero, r.tier)]),
      ]);
      const fl = el('div', { class: 'flip', style: 'width:300px;height:430px;transform:scale(1.5);margin:150px 0 150px' }, [inner]);
      const tag = el('div', { class: 'revealtag ' + r.kind });
      const q = el('div', { class: 'quote' });
      wrap.append(fl, tag, q, closeBtn);
      setTimeout(() => { fl.classList.add('show'); }, 350);
      setTimeout(() => { tag.textContent = r.kind === 'new' ? 'Tướng mới! ' : r.kind === 'upgrade' ? 'Nâng bậc! ' + U.shortName(r.hero.name) + ' ' + U.tierNames[r.prev] + ' → ' + U.tierNames[r.tier] + ' · bản cũ đổi thành +' + r.shards + ' mảnh' : 'Trùng · bằng/thấp hơn bản đang có → +' + r.shards + ' mảnh ' + U.shortName(r.hero.name); q.textContent = '“' + (r.hero.quote ? U.cap(r.hero.quote).replace(/^“|”$/g, '') : '') + '”'; closeBtn.style.visibility = 'visible'; }, 1250);
    } else {
      const grid = el('div', { class: 'grid10' });
      results.forEach((r, i) => {
        const fl = el('div', { class: 'flip small', style: 'width:200px;height:290px' }, [el('div', { class: 'inner', style: 'width:200px;height:290px' }, [
          el('div', { class: 'face back' }, ['?']), el('div', { class: 'face front', style: 'position:absolute;inset:0' }, [U.heroCard(r.hero, r.tier, { small: true })])])]);
        const tg = el('div', { class: 'tg ' + r.kind, text: '' });
        grid.appendChild(el('div', { class: 'cellw' }, [fl, tg]));
        setTimeout(() => { fl.classList.add('show'); tg.textContent = r.kind === 'new' ? 'Mới!' : r.kind === 'upgrade' ? 'Nâng bậc · +' + r.shards + ' mảnh' : 'Trùng · +' + r.shards + ' mảnh'; }, 300 + i * 220);
      });
      wrap.append(el('div', { style: 'font-size:48px;font-weight:900', text: 'Kết quả rút 10 lần' }), grid, closeBtn);
      setTimeout(() => { closeBtn.style.visibility = 'visible'; }, 300 + results.length * 220 + 500);
    }
    U.overlay().appendChild(wrap);
  };

  // ---------- intro ----------
  U.screenIntro = function (fresh) {
    const script = window.GOMA_INTRO.scenes;
    let si = 0, li = 0, newHero = null, busy = false;
    const root = el('div', { style: 'position:absolute;inset:0' });
    const bgBox = el('div', { style: 'position:absolute;inset:0' });
    const portraitBox = el('div', { class: 'portrait' });
    const dlg = el('div', { class: 'dlg', onclick: () => next() });
    const who = el('div', { class: 'who' }), txt = el('div', { class: 'txt' });
    dlg.append(who, txt, el('div', { class: 'hint', text: 'Bấm để tiếp ▶' }));
    root.append(bgBox, portraitBox, dlg, el('button', { class: 'btn sec sm skipintro', id: 'btn-skip-intro', text: 'Bỏ qua intro', onclick: e => { e.stopPropagation(); skipIntro(); } }));
    U.show(root);
    const fill = t => String(t).replace('{name}', U.playerName()).replace('{quote}', newHero && newHero.quote ? U.cap(newHero.quote) + '!' : '...');
    function setBg(name) { bgBox.innerHTML = ''; bgBox.appendChild(U.bg(name, true)); }
    function setPortrait(line) {
      portraitBox.innerHTML = '';
      let name = null, sprite = null;
      if (line.who === 'hieu') { const n = 'intro_hieu_' + (line.pose || 'chao'); name = U.has(n) ? n : 'nv01_idle'; }
      else if (line.who === 'main') name = 'main_' + (S().sex || 'nam') + '_idle';
      else if (line.who === 'hero' && newHero) name = newHero.code.toLowerCase() + '_idle';
      if (!name) return;
      const e = U.M[name];
      if (!e) { U.noteMissing(name); portraitBox.appendChild(el('div', { class: 'sp', style: 'width:200px;height:400px;margin-left:-100px;background:#6b3fa0;border-radius:14px;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center', text: name })); return; }
      const sc = 500 / e.body_h; const sp = el('div', { class: 'sp' }, [el('img', { src: 'assets/' + e.file, draggable: 'false', style: `position:absolute;width:${e.w * sc}px;height:${e.h * sc}px;left:${-e.cx * sc}px;bottom:${-(e.h - e.foot_y) * sc}px` })]);
      portraitBox.appendChild(sp);
    }
    function speaker(line) {
      if (line.who === 'hieu') return 'Hiếu (thủ kho)'; if (line.who === 'main') return U.playerName();
      if (line.who === 'hero' && newHero) return U.shortName(newHero.name); return '';
    }
    function showLine() {
      const sc = script[si]; const line = sc.lines[li];
      if (li === 0) setBg(sc.bg);
      if (line.action === 'firstPull') {
        busy = true; dlg.style.display = 'none'; portraitBox.innerHTML = '';
        const r = S().firstPullDone ? { hero: U.hero(Object.keys(S().owned).find(c => c !== 'NV01') || 'NV02'), tier: 0, kind: 'new' } : U.pull(true);
        newHero = r.hero;
        U.reveal([r], () => { busy = false; dlg.style.display = ''; li++; showLine(); });
        return;
      }
      who.textContent = speaker(line); txt.textContent = fill(line.text); setPortrait(line);
    }
    function next() {
      if (busy) return;
      li++;
      if (li >= script[si].lines.length) { si++; li = 0; if (si >= script.length) { finish(); return; } }
      showLine();
    }
    function finish() { U.startFirstBattle(); }
    function skipIntro() {
      if (busy) return;
      if (!S().firstPullDone) { const r = U.pull(true); busy = true; dlg.style.display = 'none'; U.reveal([r], () => { finish(); }); } else finish();
    }
    // nếu đã rút lần đầu (đóng game giữa chừng) thì tìm lại tướng mới để hiển thị đúng
    if (S().firstPullDone) { const c = Object.keys(S().owned).find(x => x !== 'NV01'); if (c) newHero = U.hero(c); }
    showLine();
  };

  U.startFirstBattle = function () {
    const lv = U.levelsOf(1)[0];
    const codes = Object.keys(S().owned);
    const placed = U.buildTeam(codes.slice(0, C.teamMax), c => S().owned[c], null);
    U.startBattle(lv, placed);
  };

  // ---------- gacha ----------
  U.screenGacha = function () {
    const root = el('div', { style: 'position:absolute;inset:0' });
    root.appendChild(U.bg('bg_phonghop', true));
    const pulls = el('div', { class: 'pulls', id: 'pulls-count' });
    const update = () => { pulls.textContent = 'Lượt quay: ' + S().pulls; b1.disabled = S().pulls < 1; b10.disabled = S().pulls < 10; };
    const doPull = n => {
      const res = n === 1 ? (S().pulls >= 1 ? (S().pulls -= 1, [U.pull(false)]) : null) : U.pullMany(n);
      if (!res) return; U.persist(); update(); U.reveal(res, update);
    };
    const b1 = el('button', { class: 'btn', id: 'btn-pull1', text: 'Rút 1 lần (1 lượt)', onclick: () => doPull(1) });
    const b10 = el('button', { class: 'btn', id: 'btn-pull10', text: 'Rút 10 lần (10 lượt)', onclick: () => doPull(10) });
    const mainName = 'main_' + (S().sex || 'nam') + '_joy';
    const fig = el('div', { style: 'position:absolute;left:220px;top:0;width:0;height:0' });
    const ms = U.Sprite('main_' + (S().sex || 'nam'), 520, 0, 'Main'); ms.setPose(U.has(mainName) ? 'joy' : 'idle'); fig.appendChild(ms.el); fig.style.top = '1000px';
    root.append(
      el('div', { class: 'topbar' }, [el('button', { class: 'btn sec sm', id: 'btn-back', text: '◀ Về bản đồ', onclick: () => U.screenMap() }), pulls]),
      el('div', { class: 'title', text: 'Phòng họp – Đề xuất nhân sự' }),
      fig,
      el('div', { style: 'position:absolute;left:760px;right:100px;top:240px;font-size:32px;line-height:1.6;background:rgba(18,14,30,.85);border:4px solid #4a4560;border-radius:20px;padding:30px 40px' }, [
        el('div', { style: 'font-weight:900;color:#ffb340;font-size:38px', text: 'Tỉ lệ phẩm chất' }),
        el('div', { text: `Trước khi thắng màn 2.6: Trắng ${C.gachaWeightsEarly[0]}% · Xanh lá ${C.gachaWeightsEarly[1]}% · Xanh dương ${C.gachaWeightsEarly[2]}%` }),
        el('div', { text: `Sau khi thắng màn 2.6: Trắng ${C.gachaWeightsLate[0]}% · Xanh lá ${C.gachaWeightsLate[1]}% · Xanh dương ${C.gachaWeightsLate[2]}%` }),
        el('div', { text: 'Tướng chọn đều trong 10 tướng (kể cả Hiếu).' }),
        el('div', { text: 'Rút bậc CAO hơn bản đang có: thay thẳng, bản cũ đổi thành mảnh.' }),
        el('div', { text: `Rút bằng/thấp hơn: đổi thành mảnh (Trắng ${C.shardsByTier[0]} · Xanh lá ${C.shardsByTier[1]} · Xanh dương ${C.shardsByTier[2]}).` }),
      ]),
      el('div', { class: 'bottombar', style: 'left:760px' }, [b1, b10]),
      el('div', { class: 'note', text: NOTE })
    );
    update(); U.show(root);
  };

  U.confirmReset = function () {   // xóa toàn bộ tiến trình để chơi lại từ đầu (hỏi xác nhận)
    const c = el('div', { style: 'font-size:32px;text-align:center;display:flex;flex-direction:column;gap:24px;align-items:center' }, [
      el('div', { text: 'Xóa tài khoản và chơi lại từ đầu?' }),
      el('div', { style: 'font-size:24px;opacity:.85', text: 'Mất hết tướng, mảnh, lượt quay và tiến trình các màn. Không hoàn tác được.' }),
      el('div', { style: 'display:flex;gap:20px' }, [el('button', { class: 'btn sec', id: 'btn-reset-cancel', text: 'Hủy', onclick: () => m.close() }), el('button', { class: 'btn', id: 'btn-reset-ok', text: 'Xóa hết', onclick: () => { U.resetSave(); m.close(); U.boot(); } })]),
    ]); const m = U.modal(c);
  };

  // ---------- bản đồ ----------
  let curMap = 1;
  U.screenMap = function (map) {
    if (map) curMap = map;
    const root = el('div', { style: 'position:absolute;inset:0' });
    root.appendChild(U.bg(MAP_BG[curMap], true));
    root.appendChild(el('div', { class: 'topbar' }, [el('div', { style: 'font-size:32px;font-weight:800', text: U.playerName() }), el('div', { class: 'pulls', id: 'pulls-count', text: 'Lượt quay: ' + S().pulls })]));
    const tabs = el('div', { class: 'tabs' });
    [1, 2, 3].forEach(m => tabs.appendChild(el('button', { class: 'tab' + (m === curMap ? ' act' : '') + (U.mapEnabled(m) ? '' : ' lock'), 'data-map': m, text: 'Map ' + m + (U.mapEnabled(m) ? '' : ' (khóa)'), onclick: () => U.screenMap(m) })));
    root.appendChild(tabs);
    if (!U.mapEnabled(curMap)) {
      root.appendChild(el('div', { class: 'soon', text: 'Sắp ra mắt' }));
    } else {
      const g = el('div', { class: 'levels' });
      U.levelsOf(curMap).forEach(l => {
        const un = U.isUnlocked(l), cl = U.isCleared(l);
        const comps = []; l.comp.forEach(c => { if (!comps.includes(c.code)) comps.push(c.code); });
        const mini = el('div', { class: 'mini' }, comps.slice(0, 4).map(c => { const n = c.toLowerCase() + '_idle'; return U.has(n) ? el('img', { src: U.src(n), draggable: 'false' }) : el('div', { text: c, style: 'font-size:20px' }); }));
        const card = el('div', { class: 'lv' + (un ? '' : ' locked') + (cl ? ' cleared' : ''), 'data-level': U.levelKey(l), onclick: () => { if (un) U.screenTeam(l); else U.toast('Phải thắng màn trước để mở màn này'); } }, [
          el('div', { class: 'num', text: l.map + '.' + l.man }), el('div', { class: 'nm', text: l.name }), el('div', { class: 'pl', text: l.place }), mini,
          el('div', { class: 'tm', text: 'Đề nghị: ' + l.team + ' tướng' }),
        ]);
        if (l.kind === 'Boss') card.appendChild(el('div', { class: 'badge', text: 'BOSS' }));
        else if (l.kind === 'Tinh anh') card.appendChild(el('div', { class: 'badge elite', text: 'TINH ANH' }));
        if (cl) card.appendChild(el('div', { class: 'ok', text: '✓' }));
        if (un) card.appendChild(el('div', { class: 'droptag' + (cl && U.dropChance(l) >= 0.2 ? ' hot' : ''), text: cl ? 'Rớt thẻ ' + Math.round(U.dropChance(l) * 100) + '%' : 'Thắng lần đầu +' + C.pullFirstClear + ' lượt' }));
        g.appendChild(card);
      });
      root.appendChild(g);
      const near = [1, 2, 3].filter(m => U.mapEnabled(m)).reduce((acc, m) => acc.concat(U.levelsOf(m)), []).filter(l => U.isCleared(l) && U.dropChance(l) >= C.dropRateNear).map(l => l.map + '.' + l.man);
      const tip = near.length ? `Mẹo cày lượt quay: đánh lại màn ${near.join(', ')} → ${Math.round(C.dropRateNear * 100)}% rớt 1 lượt. Các màn xa hơn chỉ ${Math.round(C.dropRateFar * 100)}%. Thắng màn mới lần đầu: +${C.pullFirstClear} lượt.` : `Mẹo: thắng màn mới lần đầu +${C.pullFirstClear} lượt quay. Đánh lại các màn gần tiền tuyến (${Math.round(C.dropRateNear * 100)}%) để cày thêm lượt, màn xa hơn ${Math.round(C.dropRateFar * 100)}%.`;
      root.appendChild(el('div', { class: 'droptip', id: 'droptip', text: tip }));
    }
    root.appendChild(el('div', { class: 'bottombar' }, [
      el('button', { class: 'btn', id: 'btn-gacha', text: 'Gacha', onclick: () => U.screenGacha() }),
      el('button', { class: 'btn sec', id: 'btn-collection', text: 'Bộ sưu tập', onclick: () => U.screenCollection() }),
      el('button', { class: 'btn sec', id: 'btn-settings', text: 'Cài đặt', onclick: () => U.screenSettings() }),
      el('button', { class: 'btn sec', id: 'btn-reset-map', text: 'Xóa tài khoản', onclick: () => U.confirmReset() }),
    ]));
    root.appendChild(el('div', { class: 'note', style: 'bottom:2px;font-size:20px', text: NOTE }));
    U.show(root);
  };

  // ---------- chọn đội ----------
  U.screenTeam = function (level, keep) {
    const tierOv = (keep && keep.tierOv) || {};
    const owned = D.heroes.filter(h => S().owned[h.code] !== undefined);
    const tierOf = c => (U.debug && tierOv[c] != null) ? tierOv[c] : S().owned[c];
    let pos = keep && keep.pos;                                   // mã tướng -> {row, slot}: vị trí do người chơi tự kéo thả
    if (!pos && S().lastTeam) {                                   // dùng lại đội hình lần trước (lưu trong save), bỏ tướng không còn / trùng ô
      const used = new Set(), lt = {};
      Object.keys(S().lastTeam).forEach(c => { const p = S().lastTeam[c]; const k = p && p.row + p.slot; if (owned.some(h => h.code === c) && p && !used.has(k) && Object.keys(lt).length < C.teamMax) { used.add(k); lt[c] = { row: p.row, slot: p.slot }; } });
      if (Object.keys(lt).length) pos = lt;
    }
    if (!pos) {
      const auto = U.autoTeam(owned, tierOf).slice(0, Math.min(C.teamMax, Math.max(1, level.team)));
      pos = {}; (auto.length ? U.buildTeam(auto, tierOf, null) : []).forEach(d => { pos[d.code] = { row: d.row, slot: d.slot }; });
    }
    const sel = () => Object.keys(pos);
    const at = (row, slot) => sel().find(c => pos[c].row === row && pos[c].slot === slot);
    const freeSlot = h => { const rows = [h.row, h.row === 'front' ? 'back' : 'front']; for (const r of rows) for (let i = 0; i < 3; i++) if (!at(r, i)) return { row: r, slot: i }; return null; };
    const root = el('div', { style: 'position:absolute;inset:0' });
    root.appendChild(U.bg(MAP_BG[level.map], true));
    root.appendChild(el('div', { class: 'title', style: 'font-size:48px;top:24px', text: `Màn ${level.map}.${level.man} · ${level.name}` }));
    root.appendChild(el('div', { style: 'position:absolute;left:0;right:0;top:100px;text-align:center;font-size:26px', text: `${level.place} · ${level.kind} · Đề nghị ${level.team} tướng · Chọn tối đa ${C.teamMax}` }));
    const list = el('div', { class: 'panel herolistpanel', style: 'left:30px;top:150px;width:1140px;height:800px' }, [el('div', { class: 'rowlabel', text: 'Tướng của bạn (kéo thả vào ô bên phải, hoặc bấm để thêm / bỏ)' })]);
    const grid = el('div', { class: 'herolist' }); list.appendChild(grid);
    const right = el('div', { class: 'panel slotarea', style: 'left:1190px;top:150px;width:700px;height:800px' });
    root.append(list, right);
    const saveTeam = () => { S().lastTeam = JSON.parse(JSON.stringify(pos)); U.persist(); };
    const rerender = () => { saveTeam(); U.screenTeam(level, { pos, tierOv }); };
    // ---- kéo thả bằng pointer (chuột + cảm ứng) ----
    function makeDraggable(node, code, from) {
      node.style.touchAction = 'none'; node.classList.add('draggable');
      node.addEventListener('pointerdown', ev => {
        if (ev.button !== undefined && ev.button !== 0) return;
        const sx = ev.clientX, sy = ev.clientY, r = node.getBoundingClientRect(); let ghost = null, over = null;
        const targetAt = (x, y) => { const e = document.elementFromPoint(x, y); return e ? { slot: e.closest('.slot'), list: e.closest('.herolistpanel') } : {}; };
        const mv = e => {
          if (!ghost) {
            if (Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return;
            ghost = node.cloneNode(true); ghost.classList.add('dragghost'); ghost.style.cssText += `;position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;pointer-events:none;z-index:99999;margin:0;opacity:.92;transform:scale(1.06) rotate(-3deg)`;
            document.body.appendChild(ghost); node.style.opacity = .35;
          }
          ghost.style.left = (r.left + e.clientX - sx) + 'px'; ghost.style.top = (r.top + e.clientY - sy) + 'px';
          const tg = targetAt(e.clientX, e.clientY); const s = tg.slot || null;
          if (over !== s) { if (over) over.classList.remove('over'); over = s; if (over) over.classList.add('over'); }
        };
        const up = e => {
          window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
          if (over) over.classList.remove('over');
          if (!ghost) return;                                       // không kéo -> để sự kiện click xử lý
          ghost.remove(); node.style.opacity = ''; node.__dragged = true; setTimeout(() => { node.__dragged = false; }, 0);
          const tg = targetAt(e.clientX, e.clientY);
          if (tg.slot) {
            const row = tg.slot.getAttribute('data-row'), slot = Number(tg.slot.getAttribute('data-slot')), occ = at(row, slot);
            if (occ === code) return;
            if (from) { const old = pos[code]; if (occ) pos[occ] = { row: old.row, slot: old.slot }; pos[code] = { row, slot }; }   // đổi chỗ
            else { if (!occ && sel().length >= C.teamMax) { U.toast('Đội tối đa ' + C.teamMax + ' tướng'); return; } if (occ) delete pos[occ]; pos[code] = { row, slot }; }
            rerender();
          } else if (from && tg.list) { delete pos[code]; rerender(); }   // kéo ra danh sách = bỏ khỏi đội
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      });
    }
    owned.forEach(h => {
      const c = h.code, t = tierOf(c);
      const card = U.heroCard(h, t, { small: true, pick: true, stats: true });
      card.setAttribute('data-hero', c);
      if (pos[c]) card.classList.add('picked');
      card.addEventListener('click', () => {
        if (card.__dragged) return;
        if (pos[c]) delete pos[c];
        else { if (sel().length >= C.teamMax) { U.toast('Đội tối đa ' + C.teamMax + ' tướng'); return; } pos[c] = freeSlot(h); }
        rerender();
      });
      makeDraggable(card, c, false);
      if (U.debug) card.appendChild(el('div', { class: 'tiersel', text: 'bậc ' + U.tierNames[t], onclick: ev => { ev.stopPropagation(); tierOv[c] = (t + 1) % 5; rerender(); } }));
      grid.appendChild(card);
    });
    ['front', 'back'].forEach(row => {
      const sl = el('div', { class: 'slots' });
      for (let i = 0; i < 3; i++) {
        const c = at(row, i);
        const box = el('div', { class: 'slot', 'data-row': row, 'data-slot': i }, [c ? null : '+']);
        if (c) {
          box.style.border = '4px solid transparent';
          const hc = U.heroCard(U.hero(c), tierOf(c), { small: true }); hc.setAttribute('data-hero-slot', c); box.appendChild(hc); makeDraggable(hc, c, true);
        }
        sl.appendChild(box);
      }
      right.appendChild(el('div', {}, [el('div', { class: 'rowlabel', text: row === 'front' ? 'Hàng trước (chịu đòn)' : 'Hàng sau' }), sl]));
    });
    right.appendChild(el('div', { style: 'font-size:22px;opacity:.85;margin-top:6px', text: 'Kéo tướng vào ô · kéo ô sang ô để đổi chỗ · kéo ra danh sách để bỏ' }));
    right.appendChild(el('div', { style: 'font-size:24px;opacity:.9', text: 'Quái: ' + level.comp.map(c => (D.monsters.find(m => m.code === c.code) || {}).name + ' ×' + c.count).join(', ') }));
    const go = () => { const codes = sel(); if (codes.length) saveTeam(); if (codes.length) U.startBattle(level, U.buildTeamPos(codes, tierOf, pos)); };
    root.appendChild(el('div', { class: 'bottombar' }, [
      el('button', { class: 'btn sec', id: 'btn-back', text: '◀ Quay lại', onclick: () => U.screenMap(level.map) }),
      el('button', { class: 'btn sec', id: 'btn-auto', text: 'Tự chọn đội mạnh nhất', onclick: () => { pos = null; const a = U.autoTeam(owned, tierOf); pos = {}; U.buildTeam(a, tierOf, null).forEach(d => { pos[d.code] = { row: d.row, slot: d.slot }; }); rerender(); } }),
      el('button', { class: 'btn', id: 'btn-fight', text: 'Vào trận ▶', disabled: sel().length ? null : 'disabled', onclick: go }),
    ]));
    U.show(root);
  };

  // ---------- bộ sưu tập ----------
  U.screenCollection = function () {
    const root = el('div', { style: 'position:absolute;inset:0' });
    root.appendChild(U.bg('bg_phonghop', true));
    root.appendChild(el('div', { class: 'topbar' }, [el('button', { class: 'btn sec sm', id: 'btn-back', text: '◀ Về bản đồ', onclick: () => U.screenMap() })]));
    root.appendChild(el('div', { class: 'title', style: 'font-size:50px', text: 'Bộ sưu tập' }));
    const grid = el('div', { class: 'colgrid' });
    D.heroes.forEach(h => {
      const t = S().owned[h.code], has = t !== undefined;
      const card = U.heroCard(h, has ? t : 0, { small: true, locked: !has, pick: true });
      card.setAttribute('data-hero', h.code);
      if (has) { const need = U.mergeNeed(h.code); card.appendChild(el('div', { class: 'shardbadge' + (U.canMerge(h.code) ? ' ready' : ''), text: need == null ? 'Bậc tối đa' : 'Mảnh ' + U.shardsOf(h.code) + '/' + need })); }
      card.addEventListener('click', () => { if (!has) { U.toast('Chưa có tướng này'); return; } detail(h, t); });
      grid.appendChild(card);
    });
    root.appendChild(grid); U.show(root);
    function mergeBox(h, t) {
      const need = U.mergeNeed(h.code), have = U.shardsOf(h.code);
      if (need == null) return el('div', { class: 'mergebox' }, ['Đã đạt bậc tối đa (Đỏ).']);
      const b = el('button', { class: 'btn sm', id: 'btn-merge', text: 'Ghép lên ' + U.tierNames[t + 1] + ' (' + need + ' mảnh)', onclick: () => { if (U.merge(h.code)) { U.toast(U.shortName(h.name) + ' lên ' + U.tierNames[t + 1] + '!'); mm.close(); U.screenCollection(); detail(h, U.save.owned[h.code]); } } });
      if (have < need) b.setAttribute('disabled', 'disabled');
      return el('div', { class: 'mergebox' }, [el('div', { text: `Mảnh tướng: ${have}/${need} · cần ${need} mảnh + tướng ${U.tierNames[t]} để lên ${U.tierNames[t + 1]}` }), el('div', { class: 'mbar' }, [el('div', { class: 'mf', style: `width:${Math.min(100, have / need * 100)}%` })]), b]);
    }
    let mm = null;
    function detail(h, t) {
      const st = h.tiers[t];
      const sk = h.skill, pa = h.passive;
      const c = el('div', { class: 'detail' }, [
        U.heroCard(h, t),
        el('div', { class: 'txtc' }, [
          el('h2', { text: U.shortName(h.name) }),
          el('div', { text: `${U.branch(h.name) ? U.branch(h.name) + ' · ' : ''}${h.role} · ${U.tierNames[t]}` }),
          el('div', { class: 'st' }, [`HP ${st.hp}`, `Công ${st.atk}`, `Thủ ${st.df}`, `Tốc ${st.spd}`].map(x => el('div', { text: x }))),
          el('div', { style: 'opacity:.9', text: U.cap(h.bio || '') }),
          el('div', { class: 'sk' }, [el('b', { text: 'Skill – ' + (sk.name || '') + ': ' }), (sk.desc && sk.desc[Math.min(t, 2)]) || '']),
          mergeBox(h, t),
          pa && pa.name ? el('div', { class: 'sk' }, [el('b', { text: 'Nội tại – ' + pa.name + ': ' }), t >= 2 ? ((pa.desc && pa.desc[2]) || '') : 'Mở từ phẩm chất Xanh dương.']) : null,
        ]),
      ]);
      mm = U.modal(c);
    }
  };

  // ---------- cài đặt ----------
  U.screenSettings = function () {
    const root = el('div', { style: 'position:absolute;inset:0' });
    root.appendChild(U.bg('bg_phonghop', true));
    root.appendChild(el('div', { class: 'topbar' }, [el('button', { class: 'btn sec sm', id: 'btn-back', text: '◀ Về bản đồ', onclick: () => U.screenMap() })]));
    root.appendChild(el('div', { class: 'title', style: 'font-size:50px', text: 'Cài đặt' }));
    const box = el('div', { class: 'panel', style: 'left:520px;top:220px;width:880px' });
    const sp = el('div', { class: 'setrow' }, [el('span', { text: 'Tốc độ trận mặc định:' })]);
    C.speeds.forEach(v => { const b = el('button', { class: 'btn sm' + (S().speed === v ? '' : ' sec'), 'data-speed': v, text: v + '×', onclick: () => { S().speed = v; U.persist(); U.screenSettings(); } }); sp.appendChild(b); });
    box.appendChild(sp);
    box.appendChild(el('div', { class: 'setrow' }, [el('span', { text: 'Tiến trình:' }), el('button', { class: 'btn sm sec', id: 'btn-reset', text: 'Xóa tiến trình', onclick: () => {
      const c = el('div', { style: 'font-size:32px;text-align:center;display:flex;flex-direction:column;gap:24px;align-items:center' }, [
        el('div', { text: 'Xóa toàn bộ tiến trình và chơi lại từ đầu?' }),
        el('div', { style: 'display:flex;gap:20px' }, [el('button', { class: 'btn sec', text: 'Hủy', onclick: () => m.close() }), el('button', { class: 'btn', id: 'btn-reset-ok', text: 'Xóa hết', onclick: () => { U.resetSave(); m.close(); U.boot(); } })]),
      ]); const m = U.modal(c);
    } })]));
    box.appendChild(el('div', { style: 'font-size:24px;opacity:.8;margin-top:10px', text: NOTE + '. Dữ liệu lưu trong trình duyệt của máy này.' }));
    root.appendChild(box); U.show(root);
  };
})();
