(function () {
  window.Game = window.Game || {};
  window.Game.AudioSys = (function () {
    const A = {
      ctx: null,
      master: null,
      started: false,
      enabled: true,
      bgTimer: null,
      noteIndex: 0,
      scale: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]
    };

    A.start = function () {
      if (!A.enabled || A.started) return;
      try {
        A.ctx = A.ctx || new (window.AudioContext || window.webkitAudioContext)();
        A.ctx.resume();
        A.master = A.master || A.ctx.createGain();
        A.master.gain.value = 0.05;
        A.master.connect(A.ctx.destination);
        A.started = true;
        A.startBG();
      } catch (e) {
        A.enabled = false;
      }
    };

    A.ensureStart = function () {
      if (!A.started) A.start();
    };

    A.startBG = function () {
      if (!A.started || A.bgTimer) return;
      const stepMs = 320;
      A.bgTimer = setInterval(() => {
        const freq = A.scale[A.noteIndex % A.scale.length];
        A.playTone(freq, 0.22, 0.02, 0.12, 0.08, 'triangle', 0.7);
        A.noteIndex++;
      }, stepMs);
    };

    A.stopBG = function () {
      if (A.bgTimer) {
        clearInterval(A.bgTimer);
        A.bgTimer = null;
      }
    };

    A.playTone = function (freq, dur, attack, decay, release, type, gainVal) {
      if (!A.started) return;
      const t0 = A.ctx.currentTime;
      const osc = A.ctx.createOscillator();
      const g = A.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gainVal || 0.2, t0 + attack);
      g.gain.exponentialRampToValueAtTime((gainVal || 0.2) * 0.5, t0 + attack + decay);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + release);
      osc.connect(g).connect(A.master);
      osc.start(t0);
      osc.stop(t0 + dur + release + 0.02);
    };

    A.playEat = function () {
      if (!A.started) return;
      const t0 = A.ctx.currentTime;
      const osc = A.ctx.createOscillator();
      const g = A.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(700, t0);
      osc.frequency.exponentialRampToValueAtTime(1200, t0 + 0.08);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
      osc.connect(g).connect(A.master);
      osc.start(t0);
      osc.stop(t0 + 0.18);
    };

    return A;
  })();
})();