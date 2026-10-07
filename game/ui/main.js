/* GOMA UI – khởi động, co giãn khung 16:9, chế độ debug. */
(function () {
  'use strict';
  const U = window.GomaUI;
  const stage = document.getElementById('stage');
  function vw() { return (window.visualViewport && window.visualViewport.width) || window.innerWidth; }
  function vh() { return (window.visualViewport && window.visualViewport.height) || window.innerHeight; }
  function fit() {
    const w = vw(), h = vh();
    const port = h > w * 1.1;                    // điện thoại đang để dọc -> tự xoay game 90° cho nằm ngang
    document.body.classList.toggle('vport', port);
    if (port) { const s = Math.min(h / 1920, w / 1080); stage.style.transform = `translate(-50%,-50%) rotate(90deg) scale(${s})`; }
    else { const s = Math.min(w / 1920, h / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})`; }
  }
  window.addEventListener('resize', fit); window.addEventListener('orientationchange', () => setTimeout(fit, 250));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  fit();
  // toàn màn hình (Android/Chrome, máy tính); khóa xoay ngang nếu trình duyệt cho phép
  function goFullscreen() {
    const d = document.documentElement, rq = d.requestFullscreen || d.webkitRequestFullscreen;
    if (!rq) { U.toast && U.toast('Máy này không hỗ trợ toàn màn hình: hãy dùng "Thêm vào màn hình chính" trong menu trình duyệt'); return; }
    Promise.resolve(rq.call(d)).then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* bỏ qua */ } setTimeout(fit, 300); }).catch(() => {});
  }
  document.addEventListener('fullscreenchange', () => { document.body.classList.toggle('isfs', !!document.fullscreenElement); setTimeout(fit, 250); });
  document.getElementById('fsbtn').addEventListener('click', goFullscreen);
  document.getElementById('btn-fs').addEventListener('click', goFullscreen);

  U.boot = function () {
    const S = U.save;
    if (!S.sex) U.screenMainSelect();
    else if (!S.firstPullDone && !U.debug) U.screenIntro(false);
    else U.screenMap();
  };

  if (U.debug) {
    const panel = document.createElement('div'); panel.className = 'debugpanel'; panel.id = 'debugpanel'; stage.appendChild(panel);
    const tick = () => { panel.textContent = 'DEBUG – ảnh thiếu (' + U.missing.size + '):\n' + Array.from(U.missing).sort().join(', '); };
    setInterval(tick, 700); tick();
  }
  U.preload();
  window.__goma = window.__goma || {};
  window.__goma.U = U;
  window.addEventListener('error', e => { (window.__goma.errors = window.__goma.errors || []).push(String(e.message)); });
  U.boot();
})();
