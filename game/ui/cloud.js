/* GOMA UI – tài khoản + lưu game lên Google Sheet (Apps Script). Xem cloud/HUONG_DAN.md.
   Tắt khi: config.js cloud.url để trống, hoặc ?debug=1, hoặc ?cloud=off. Khi tắt game chạy như cũ (lưu trong trình duyệt). */
(function () {
  'use strict';
  const U = window.GomaUI, C = window.GOMA_CONFIG, el = U.el;
  const params = new URLSearchParams(location.search);
  const CL = Object.assign({ url: '', autosaveMinutes: 3 }, C.cloud || {});
  if (params.get('cloudurl')) CL.url = params.get('cloudurl');              // chỉ để thử nghiệm
  if (params.get('autosavesec')) CL.autosaveMinutes = (+params.get('autosavesec')) / 60;
  const cloud = U.cloud = { enabled: !!CL.url && !U.debug && params.get('cloud') !== 'off', user: null, token: null, dirty: false, offline: false, guest: false, lastSaved: 0, saving: false };
  if (!cloud.enabled) { U.cloudSettingsRow = () => null; U.cloudBoot = () => false; return; }

  // ---------- SHA-256 (thuần JS, chạy được cả khi mở file://) ----------
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function sha256(str) {
    const b = unescape(encodeURIComponent(str)), l = b.length, w = new Array(64), H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const m = []; for (let i = 0; i < l; i++) m[i >> 2] |= b.charCodeAt(i) << (24 - (i % 4) * 8);
    m[l >> 2] |= 0x80 << (24 - (l % 4) * 8); m[(((l + 8) >> 6) << 4) + 15] = l * 8;
    const rr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < m.length; o += 16) {
      let [a, b2, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        if (i < 16) w[i] = m[o + i] | 0; else { const s0 = rr(w[i-15],7) ^ rr(w[i-15],18) ^ (w[i-15] >>> 3), s1 = rr(w[i-2],17) ^ rr(w[i-2],19) ^ (w[i-2] >>> 10); w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0; }
        const t1 = (h + (rr(e,6) ^ rr(e,11) ^ rr(e,25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((rr(a,2) ^ rr(a,13) ^ rr(a,22)) + ((a & b2) ^ (a & c) ^ (b2 & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b2; b2 = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0]+a)|0; H[1] = (H[1]+b2)|0; H[2] = (H[2]+c)|0; H[3] = (H[3]+d)|0; H[4] = (H[4]+e)|0; H[5] = (H[5]+f)|0; H[6] = (H[6]+g)|0; H[7] = (H[7]+h)|0;
    }
    return H.map(x => ('00000000' + (x >>> 0).toString(16)).slice(-8)).join('');
  }
  U.sha256 = sha256;

  // ---------- gọi server ----------
  const SKEY = 'goma_cloud_session';
  const loadSession = () => { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { return null; } };
  const storeSession = s => { try { if (s) localStorage.setItem(SKEY, JSON.stringify(s)); else localStorage.removeItem(SKEY); } catch (e) { /* bỏ qua */ } };
  function api(action, data, keepalive) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 20000);
    return fetch(CL.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action }, data)), signal: ctl.signal, keepalive: !!keepalive })
      .then(r => r.json()).then(res => { if (res && res.now) U._nowOff = res.now - Date.now(); return res; })   // dùng giờ server cho thẻ đặc quyền / quà ngày / giới hạn thắng
      .finally(() => clearTimeout(tm));
  }

  // ---------- chỉ báo trạng thái ----------
  const ind = el('div', { id: 'cloud-ind', style: 'position:absolute;right:16px;bottom:6px;font-size:20px;opacity:.75;z-index:9000;pointer-events:none;text-shadow:0 2px 0 #000' });
  document.getElementById('stage').appendChild(ind);
  const hhmm = t => { const d = new Date(t || U.now()); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  function paint(msg) {
    ind.textContent = msg || (cloud.guest ? '☁ Chơi offline (không lưu lên server)' : !cloud.user ? '' : cloud.offline ? '☁ Mất mạng – lưu tạm trong máy' : cloud.dirty ? '☁ ' + cloud.user + ' · chưa lưu' : '☁ ' + cloud.user + ' · đã lưu ' + hhmm(cloud.lastSaved));
  }
  U.cloudPaint = paint;

  // ---------- đánh dấu có thay đổi ----------
  const p0 = U.persist; U.persist = function () { const r = p0.apply(this, arguments); cloud.dirty = true; paint(); return r; };
  const r0 = U.resetSave; U.resetSave = function () { const r = r0.apply(this, arguments); cloud.dirty = true; return r; };

  function setSave(obj) { U.save = Object.assign(U.defaultSave(), obj); p0.call(U); }   // ghi vào localStorage nhưng không đánh dấu dirty
  function sessionLost(msg) {
    cloud.token = null; cloud.user = null; storeSession(null); paint('☁ Hết phiên đăng nhập');
    const c = el('div', { style: 'font-size:30px;text-align:center;display:flex;flex-direction:column;gap:22px;align-items:center;max-width:760px' }, [
      el('div', { text: msg || 'Phiên đăng nhập đã hết hạn (tài khoản có thể vừa đăng nhập ở máy khác).' }),
      el('div', { style: 'font-size:24px;opacity:.85', text: 'Đăng nhập lại để tải save mới nhất từ server. Các thay đổi chưa lưu ở máy này sẽ không được ghi đè lên save mới.' }),
      el('button', { class: 'btn', id: 'btn-relogin', text: 'Đăng nhập lại', onclick: () => { m.close(); screenLogin(); } })]);
    const m = U.modal(c, { closable: false });
  }

  // ---------- lưu ----------
  function saveNow(why, keepalive) {
    if (!cloud.user || !cloud.token || cloud.saving) return Promise.resolve(false);
    cloud.saving = true; const snap = U.save;
    return api('save', { user: cloud.user, token: cloud.token, save: snap }, keepalive).then(res => {
      cloud.saving = false;
      if (res && res.ok) { cloud.dirty = false; cloud.offline = false; cloud.lastSaved = res.savedAt || U.now(); paint(); return true; }
      if (res && res.code === 'token') { sessionLost(); return false; }
      paint('☁ Lỗi lưu: ' + ((res && res.error) || '?')); return false;
    }).catch(() => { cloud.saving = false; cloud.offline = true; paint(); return false; });
  }
  U.cloudSaveNow = saveNow;
  setInterval(() => { if (cloud.dirty) saveNow('auto'); }, Math.max(0.05, CL.autosaveMinutes) * 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && cloud.dirty) saveNow('hide', true); });
  window.addEventListener('pagehide', () => { if (cloud.dirty) saveNow('hide', true); });

  // ---------- màn đăng nhập / đăng ký ----------
  let after = null;
  function screenLogin(note) {
    const root = el('div', { style: 'position:absolute;inset:0' });
    root.appendChild(U.bg('bg_phonghop', true));
    root.appendChild(el('div', { class: 'title', style: 'font-size:60px', text: 'GOMA – Đăng nhập' }));
    const inp = (id, type, ph) => el('input', { id, type, placeholder: ph, autocomplete: type === 'password' ? 'current-password' : 'username', style: 'width:100%;box-sizing:border-box;font-size:34px;padding:14px 18px;border-radius:12px;border:3px solid #4a4560;background:#14101f;color:#fff;margin:10px 0' });
    const u = inp('cl-user', 'text', 'Tên đăng nhập (a-z, 0-9, _)'), pw = inp('cl-pass', 'password', 'Mật khẩu (từ 4 ký tự)');
    const msg = el('div', { id: 'cl-msg', style: 'font-size:26px;min-height:34px;color:#ffb340;margin:8px 0', text: note || '' });
    const run = kind => {
      const user = u.value.toLowerCase().trim(), pass = pw.value;
      if (!/^[a-z0-9_]{3,20}$/.test(user)) { msg.textContent = 'Tên đăng nhập chỉ gồm a-z, 0-9, _ (3-20 ký tự)'; return; }
      if (pass.length < 4) { msg.textContent = 'Mật khẩu từ 4 ký tự trở lên'; return; }
      msg.textContent = 'Đang xử lý…'; bR.disabled = bL.disabled = true;
      const hasLocal = !!(U.save && U.save.sex);                                   // máy đang có tiến trình: đăng ký sẽ đưa lên tài khoản mới
      api(kind, { user, h: sha256(user + ':' + pass + ':goma'), save: kind === 'register' && hasLocal ? U.save : undefined }).then(res => {
        bR.disabled = bL.disabled = false;
        if (!res || !res.ok) { msg.textContent = (res && res.error) || 'Lỗi không rõ'; return; }
        cloud.user = user; cloud.token = res.token; cloud.guest = false; cloud.offline = false; storeSession({ user, token: res.token });
        if (res.save) setSave(res.save); else if (kind === 'login' && !hasLocal) U.resetSave();
        cloud.dirty = kind === 'login' && !res.save && hasLocal; cloud.lastSaved = res.savedAt || U.now(); paint();
        const nx = after; after = null; (nx || U.boot)();
      }).catch(() => { bR.disabled = bL.disabled = false; msg.textContent = 'Không kết nối được server. Kiểm tra mạng hoặc chơi offline.'; });
    };
    const bL = el('button', { class: 'btn', id: 'btn-login', text: 'Đăng nhập', onclick: () => run('login') });
    const bR = el('button', { class: 'btn sec', id: 'btn-register', text: 'Đăng ký', onclick: () => run('register') });
    const bG = el('button', { class: 'btn sec sm', id: 'btn-guest', text: 'Chơi offline (không lưu lên server)', onclick: () => { cloud.guest = true; cloud.user = null; paint(); const nx = after; after = null; (nx || U.boot)(); } });
    [u, pw].forEach(i => i.addEventListener('keydown', ev => { if (ev.key === 'Enter') run('login'); }));
    root.appendChild(el('div', { class: 'panel', style: 'left:560px;top:220px;width:800px' }, [u, pw, msg, el('div', { style: 'display:flex;gap:20px;margin:10px 0 20px' }, [bL, bR]), bG,
      el('div', { style: 'font-size:22px;opacity:.75;margin-top:18px', text: 'Chưa có tài khoản? Nhập tên + mật khẩu rồi bấm Đăng ký. Quên mật khẩu: nhờ quản trị viên đặt lại.' })]));
    U.show(root);
  }
  U.screenLogin = screenLogin;

  // ---------- khởi động ----------
  let booted = false;
  U.cloudBoot = function (next) {
    if (booted) return false; booted = true; after = next;
    const s = loadSession();
    if (!s) { screenLogin(); return true; }
    api('load', { user: s.user, token: s.token }).then(res => {
      if (res && res.ok) { cloud.user = s.user; cloud.token = s.token; if (res.save) setSave(res.save); cloud.dirty = !res.save; cloud.lastSaved = res.savedAt || U.now(); paint(); const nx = after; after = null; nx(); }
      else { storeSession(null); screenLogin(res && res.code === 'token' ? 'Phiên cũ đã hết hạn, vui lòng đăng nhập lại.' : (res && res.error)); }
    }).catch(() => { cloud.user = s.user; cloud.token = s.token; cloud.offline = true; cloud.dirty = true; paint(); const nx = after; after = null; nx(); });   // mất mạng: dùng bản lưu trong máy, lưu lại khi có mạng
    return true;
  };

  // ---------- dòng "Tài khoản" trong Cài đặt ----------
  U.cloudSettingsRow = function () {
    const row = el('div', { class: 'setrow' }, [el('span', { text: cloud.user ? 'Tài khoản: ' + cloud.user : 'Chơi offline' })]);
    if (cloud.user) {
      const st = el('span', { id: 'cloud-st', style: 'font-size:22px;opacity:.8' });
      const upd = () => { st.textContent = cloud.offline ? 'mất mạng' : cloud.dirty ? 'chưa lưu' : 'đã lưu ' + hhmm(cloud.lastSaved); };
      row.append(el('button', { class: 'btn sm sec', id: 'btn-cloud-save', text: 'Lưu ngay', onclick: () => { st.textContent = 'đang lưu…'; saveNow('manual').then(upd); } }),
        el('button', { class: 'btn sm sec', id: 'btn-logout', text: 'Đăng xuất', onclick: () => { saveNow('logout').then(() => { cloud.user = null; cloud.token = null; storeSession(null); U.resetSave(); cloud.dirty = false; paint(); booted = true; after = U.boot; screenLogin(); }); } }), st);
      upd();
    } else row.append(el('button', { class: 'btn sm sec', id: 'btn-to-login', text: 'Đăng nhập', onclick: () => { after = U.boot; screenLogin(); } }));
    return row;
  };
})();
