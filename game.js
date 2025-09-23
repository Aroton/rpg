(function () {
  window.Game = window.Game || {};
  const G = window.Game;

  let acc = 0, last = 0, canvas;

  G.init = function (c) {
    canvas = c || document.getElementById('game-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'game-canvas';
      document.body.appendChild(canvas);
    }
    Game.Entities.init(canvas);

    // Inputs
    window.addEventListener('keydown', Game.Entities.onKey);
    canvas.addEventListener('pointerdown', () => {
      if (Game.AudioSys && Game.AudioSys.ensureStart) Game.AudioSys.ensureStart();
    }, { passive: true });

    // UI buttons
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    if (btnStart) btnStart.addEventListener('click', () => Game.Entities.restart());
    if (btnPause) btnPause.addEventListener('click', () => {
      if (Game.Entities.isRunning()) { Game.Entities.pause(); btnPause.textContent = 'Resume'; }
      else { Game.Entities.resume(); btnPause.textContent = 'Pause'; }
    });

    requestAnimationFrame(frame);
  };

  function step() { Game.Entities.update(); }
  function render() { Game.Entities.draw(); }

  function frame(ts) {
    if (!last) last = ts;
    const dt = ts - last; last = ts;
    acc += dt;
    if (Game.Entities.isRunning()) {
      const stepMs = Game.Entities.config.stepMs;
      while (acc >= stepMs) { acc -= stepMs; step(); }
    }
    render();
    requestAnimationFrame(frame);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const c = document.getElementById('game-canvas');
    G.init(c);
  });
})();