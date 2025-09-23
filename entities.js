(function () {
  window.Game = window.Game || {};
  window.Game.Entities = (function () {
    const E = {};
    E.config = { tile: 24, cols: 24, rows: 18, stepMs: 110 };
    const S = { running: true, over: false, score: 0, high: 0 };
    E.state = S;

    let canvas, ctx, width, height;
    let snake = [], dir = { x: 1, y: 0 }, pendingDir = null, grow = 0, food = { x: 0, y: 0 };

    // DOM HUD elements (external scoreboard)
    let elScore = null;
    let elBest = null;

    // Neon scheme & strobe
    const schemes = [
      { bg: '#07030b', grid: 'rgba(255,255,255,0.04)', base: [168, 296], headShift: 40 },
      { bg: '#0a0410', grid: 'rgba(255,255,255,0.05)', base: [296, 12], headShift: 55 },
      { bg: '#040f0c', grid: 'rgba(255,255,255,0.05)', base: [168, 200], headShift: 50 },
      { bg: '#0a0011', grid: 'rgba(255,255,255,0.05)', base: [260, 320], headShift: 35 }
    ];
    let schemeIndex = 0;
    let strobeTime = 0;

    function currentScheme() { return schemes[schemeIndex % schemes.length]; }
    function nextScheme() { schemeIndex = (schemeIndex + 1) % schemes.length; }

    function hsl(h, s, l, a = 1) { return `hsla(${h}, ${s}%, ${l}%, ${a})`; }
    function strobeHue(baseHue, speed, amp, t) {
      return (baseHue + Math.sin(t * speed) * amp + 360) % 360;
    }

    function spawnFood() {
      let x, y;
      do {
        x = Math.floor(Math.random() * E.config.cols);
        y = Math.floor(Math.random() * E.config.rows);
      } while (snake.some(s => s.x === x && s.y === y));
      food = { x, y };
    }

    function updateHUD() {
      if (!elScore || !elBest) return;
      elScore.textContent = String(S.score);
      elBest.textContent = String(S.high);
    }

    function reset() {
      S.over = false;
      S.running = true;
      S.score = 0;
      grow = 0;
      const cx = Math.floor(E.config.cols / 2);
      const cy = Math.floor(E.config.rows / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      dir = { x: 1, y: 0 };
      pendingDir = null;
      schemeIndex = 0; strobeTime = 0;
      spawnFood();
      updateHUD();
    }

    function setDir(nx, ny) {
      if (dir.x === -nx && dir.y === -ny) return;
      pendingDir = { x: nx, y: ny };
    }

    function gameOver() {
      S.over = true;
      S.running = false;
      if (S.score > S.high) {
        S.high = S.score;
        try { localStorage.setItem('snake_high', String(S.high)); } catch (e) {}
      }
      updateHUD();
    }

    E.init = function (c) {
      canvas = c;
      ctx = canvas.getContext('2d');
      width = E.config.cols * E.config.tile;
      height = E.config.rows * E.config.tile;
      canvas.width = width;
      canvas.height = height;

      // Cache external HUD elements
      elScore = document.getElementById('score');
      elBest = document.getElementById('best');

      try { S.high = parseInt(localStorage.getItem('snake_high')) || 0; } catch (e) {}
      reset();
    };

    E.onKey = function (e) {
      if (window.Game && Game.AudioSys) Game.AudioSys.ensureStart();
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': if (dir.y !== 1) setDir(0, -1); break;
        case 'ArrowDown': case 's': case 'S': if (dir.y !== -1) setDir(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': if (dir.x !== 1) setDir(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': if (dir.x !== -1) setDir(1, 0); break;
        case ' ': if (S.over) E.restart(); break;
      }
    };

    E.update = function () {
      if (pendingDir) { dir = pendingDir; pendingDir = null; }
      const head = snake[0];
      const next = Game.Physics.nextPos(head, dir);
      if (Game.Physics.outOfBounds(next.x, next.y, E.config.cols, E.config.rows)) return gameOver();
      if (Game.Physics.selfHit(snake, next.x, next.y)) return gameOver();
      snake.unshift(next);
      if (next.x === food.x && next.y === food.y) {
        S.score += 1; grow += 1;
        if (window.Game && Game.AudioSys) Game.AudioSys.playEat();
        nextScheme();
        spawnFood();
        updateHUD();
      }
      if (grow > 0) { grow--; } else { snake.pop(); }
      strobeTime += 0.016;
    };

    function drawGrid(sc, t) {
      ctx.save();
      ctx.strokeStyle = sc.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += t) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y <= height; y += t) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
      // subtle neon haze on grid
      ctx.shadowColor = 'hsla(296,100%,60%,0.15)';
      ctx.shadowBlur = 12;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      for (let x = 0; x <= width; x += t * 4) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      ctx.stroke();
      ctx.restore();
    }

    function drawFood(t, sc) {
      const baseHue = (sc.base[0] + sc.base[1]) / 2;
      const fh = strobeHue(baseHue, 8, 25, strobeTime + 0.7);
      const pad = 4;
      const fx = food.x * t + t / 2;
      const fy = food.y * t + t / 2;
      const r = t / 2 - pad;

      // Outer glow
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = hsl((fh + 40) % 360, 100, 60, 0.6);
      ctx.shadowBlur = 22;
      ctx.fillStyle = hsl(fh, 100, 60, 0.95);
      ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Core gradient
      const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, r);
      grad.addColorStop(0, hsl(fh, 100, 70));
      grad.addColorStop(1, hsl((fh + 40) % 360, 95, 45));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(fx, fy, r - 2, 0, Math.PI * 2); ctx.fill();

      // Spark ring
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = hsl((fh + 20) % 360, 100, 80, 0.9);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(fx, fy, r + 1.5, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    function drawSnake(t, sc) {
      // Motion trail behind recent segments
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const trailLen = Math.min(10, snake.length - 1);
      for (let i = 1; i <= trailLen; i++) {
        const seg = snake[i];
        if (!seg) break;
        const prog = i / trailLen;
        const hue = strobeHue(sc.base[0] + prog * (sc.base[1] - sc.base[0]), 10, 35, strobeTime + prog);
        const x = seg.x * t + t / 2;
        const y = seg.y * t + t / 2;
        ctx.fillStyle = hsl(hue, 100, 60, 0.10 + (1 - prog) * 0.18);
        ctx.beginPath(); ctx.arc(x, y, (t * 0.42) * (1 - prog * 0.6), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // Body with neon fill
      for (let i = snake.length - 1; i >= 0; i--) {
        const s = snake[i];
        const x = s.x * t, y = s.y * t;
        const prog = i / Math.max(1, snake.length - 1);
        const hue = strobeHue(sc.base[0] + prog * (sc.base[1] - sc.base[0]), 10, 35, strobeTime + prog);
        const light = 48 + Math.sin((strobeTime + prog) * 6) * 8;

        // Glow layer
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = hsl(hue, 100, 60, 0.5);
        ctx.shadowBlur = 18;
        ctx.fillStyle = hsl(hue, 100, light, 0.9);
        Game.Physics.roundRect(ctx, x + 2, y + 2, t - 4, t - 4, 7);
        ctx.fill();
        ctx.restore();

        // Bright core
        ctx.fillStyle = hsl(hue, 100, light + 6, 0.95);
        Game.Physics.roundRect(ctx, x + 4, y + 4, t - 8, t - 8, 6);
        ctx.fill();

        // Outline
        ctx.strokeStyle = hsl(hue, 100, 80, 0.9);
        ctx.lineWidth = 1.5;
        Game.Physics.roundRect(ctx, x + 3.5, y + 3.5, t - 7, t - 7, 6.5);
        ctx.stroke();
      }

      // Head highlight ring
      if (snake[0]) {
        const hx = snake[0].x * t + t / 2, hy = snake[0].y * t + t / 2;
        const hh = strobeHue((sc.base[0] + sc.base[1]) / 2 + sc.headShift, 14, 45, strobeTime);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = hsl(hh, 100, 75, 0.95);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hx, hy, t * 0.36, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }

    E.draw = function () {
      const sc = currentScheme();
      ctx.fillStyle = sc.bg;
      ctx.fillRect(0, 0, width, height);

      const t = E.config.tile;
      drawGrid(sc, t);
      drawFood(t, sc);
      drawSnake(t, sc);

      // Removed on-canvas HUD text to keep UI outside the game board
      if (S.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '24px system-ui, sans-serif';
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'hsla(170,100%,60%,0.5)';
        ctx.fillText('Game Over - Press Space to Restart', width / 2, height / 2);
      }
    };

    E.restart = function () { reset(); };
    E.pause = function () { S.running = false; };
    E.resume = function () { if (!S.over) S.running = true; };
    E.isRunning = function () { return S.running; };

    return E;
  })();
})();