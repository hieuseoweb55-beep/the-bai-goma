/* GOMA UI – khởi động, co giãn khung 16:9, chế độ debug. */
(function () {
  'use strict';
  const U = window.GomaUI;
  const stage = document.getElementById('stage');
  function fit() { const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})`; }
  window.addEventListener('resize', fit); fit();

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
