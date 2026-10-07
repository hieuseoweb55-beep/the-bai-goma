/* GOMA UI – âm thanh & nhạc nền mặc định (tự tổng hợp bằng WebAudio, không cần file). Sẽ thay bằng nhạc/âm thanh thật sau. */
(function () {
  'use strict';
  const U = window.GomaUI, KEY = 'goma_audio_v1';
  let ctx = null, master = null, musicG = null, sfxG = null, cur = null, timer = null, step = 0, nextT = 0;
  let st = { music: true, sfx: true };
  try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* bỏ qua */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* bỏ qua */ } };
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    musicG = ctx.createGain(); musicG.gain.value = st.music ? 0.22 : 0; musicG.connect(master);
    sfxG = ctx.createGain(); sfxG.gain.value = st.sfx ? 0.6 : 0; sfxG.connect(master);
    if (cur) startMusic(cur); return true;
  }
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function tone(dst, t, f, d, type, vol, f2) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dst); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(dst, t, d, vol, hp) {
    const n = Math.floor(ctx.sampleRate * d), b = ctx.createBuffer(1, n, ctx.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
    s.buffer = b; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(dst); s.start(t);
  }
  const last = {};
  const SFX = {
    click: t => tone(sfxG, t, 660, 0.07, 'square', 0.18, 880),
    hit: t => { noise(sfxG, t, 0.12, 0.5, 600); tone(sfxG, t, 180, 0.12, 'triangle', 0.5, 70); },
    crit: t => { noise(sfxG, t, 0.2, 0.7, 500); tone(sfxG, t, 260, 0.2, 'sawtooth', 0.45, 60); tone(sfxG, t + 0.05, 880, 0.15, 'square', 0.2, 1320); },
    dodge: t => tone(sfxG, t, 900, 0.14, 'sine', 0.25, 400),
    skill: t => { [60, 64, 67, 72].forEach((n, i) => tone(sfxG, t + i * 0.06, hz(n + 12), 0.25, 'triangle', 0.3)); },
    heal: t => { [72, 76, 79].forEach((n, i) => tone(sfxG, t + i * 0.08, hz(n), 0.25, 'sine', 0.3)); },
    die: t => { tone(sfxG, t, 400, 0.5, 'sawtooth', 0.3, 60); noise(sfxG, t, 0.25, 0.3, 300); },
    win: t => { [60, 64, 67, 72, 67, 72, 76].forEach((n, i) => tone(sfxG, t + i * 0.14, hz(n + 12), 0.35, 'square', 0.22)); },
    lose: t => { [67, 64, 60, 55].forEach((n, i) => tone(sfxG, t + i * 0.22, hz(n), 0.45, 'triangle', 0.35)); },
    reveal: t => { for (let i = 0; i < 6; i++) tone(sfxG, t + i * 0.07, hz(72 + i * 2), 0.3, 'sine', 0.25); noise(sfxG, t + 0.4, 0.4, 0.15, 3000); },
    merge: t => { [64, 67, 71, 76].forEach((n, i) => tone(sfxG, t + i * 0.09, hz(n + 12), 0.4, 'square', 0.2)); }
  };
  function sfx(name) {
    if (!st.sfx || !init()) return; const now = ctx.currentTime; if (last[name] && now - last[name] < 0.04) return; last[name] = now;
    try { SFX[name] && SFX[name](now + 0.005); } catch (e) { /* bỏ qua */ }
  }
  // ---- nhạc nền: 2 bản đơn giản lặp vô hạn ----
  const TRACKS = {
    menu: { bpm: 84, bass: [48, 48, 43, 43, 45, 45, 41, 43], lead: [72, 0, 76, 0, 79, 76, 0, 74, 72, 0, 74, 0, 76, 0, 72, 0, 69, 0, 72, 0, 76, 72, 0, 71, 67, 0, 71, 0, 74, 0, 0, 0], lt: 'triangle', bt: 'sine' },
    battle: { bpm: 132, bass: [45, 45, 52, 45, 43, 43, 50, 43, 41, 41, 48, 41, 43, 43, 50, 55], lead: [81, 0, 84, 81, 0, 79, 81, 0, 76, 0, 79, 76, 0, 74, 76, 0, 77, 0, 81, 77, 0, 76, 77, 0, 74, 0, 76, 79, 0, 77, 74, 0], lt: 'square', bt: 'sawtooth' }
  };
  function sched() {
    const T = TRACKS[cur]; if (!T || !ctx) return; const dur = 60 / T.bpm / 2;
    while (nextT < ctx.currentTime + 0.4) {
      const b = T.bass[Math.floor(step / (cur === 'battle' ? 2 : 4)) % T.bass.length], l = T.lead[step % T.lead.length];
      if (step % 2 === 0) tone(musicG, nextT, hz(b), dur * 1.8, T.bt, cur === 'battle' ? 0.35 : 0.5);
      if (cur === 'battle' && step % 4 === 2) noise(musicG, nextT, 0.05, 0.25, 6000);
      if (cur === 'battle' && step % 8 === 0) tone(musicG, nextT, 110, 0.15, 'sine', 0.8, 45);
      if (l) tone(musicG, nextT, hz(l), dur * 1.6, T.lt, 0.28);
      nextT += dur; step++;
    }
  }
  function startMusic(name) { clearInterval(timer); if (!name) return; step = 0; nextT = ctx.currentTime + 0.05; timer = setInterval(sched, 120); sched(); }
  function bgm(name) {
    if (name === cur) return; cur = name; if (!ctx) return;
    clearInterval(timer); if (musicG) { musicG.gain.cancelScheduledValues(ctx.currentTime); musicG.gain.value = st.music ? 0.22 : 0; } startMusic(name);
  }
  function setMusic(v) { st.music = v; save(); if (musicG) musicG.gain.value = v ? 0.22 : 0; }
  function setSfx(v) { st.sfx = v; save(); if (sfxG) sfxG.gain.value = v ? 0.6 : 0; }
  window.GomaAudio = { sfx, bgm, init, state: () => st, setMusic, setSfx };

  // mở khóa âm thanh ở lần chạm đầu tiên (trình duyệt bắt buộc)
  const unlock = () => { init(); };
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { passive: true }));
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('button')) sfx('click'); }, true);
  // nút bật/tắt âm
  const b = document.createElement('button'); b.id = 'sndbtn'; b.title = 'Bật/tắt âm thanh';
  const draw = () => { b.textContent = (st.music || st.sfx) ? '🔊' : '🔇'; };
  b.addEventListener('click', e => { const on = !(st.music || st.sfx); setMusic(on); setSfx(on); draw(); e.stopPropagation(); });
  draw(); document.body.appendChild(b);
  // nhạc theo màn hình: mọi màn (trừ trận đánh) là nhạc menu; trận đánh gọi nhạc battle
  ['screenMainSelect', 'screenIntro', 'screenGacha', 'screenMap', 'screenTeam', 'screenCollection', 'screenSettings'].forEach(n => {
    const f = U[n]; if (typeof f === 'function') U[n] = function () { bgm('menu'); return f.apply(this, arguments); };
  });
  if (U.startBattle) { const f = U.startBattle; U.startBattle = function () { bgm('battle'); return f.apply(this, arguments); }; }
  if (U.reveal) { const f = U.reveal; U.reveal = function () { sfx('reveal'); return f.apply(this, arguments); }; }
  if (U.merge) { const f = U.merge; U.merge = function () { const r = f.apply(this, arguments); if (r) sfx('merge'); return r; }; }
})();
