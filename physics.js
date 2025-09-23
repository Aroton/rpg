(function () {
  window.Game = window.Game || {};
  window.Game.Physics = (function () {
    const P = {};

    P.nextPos = function (head, dir) {
      return { x: head.x + dir.x, y: head.y + dir.y };
    };

    P.outOfBounds = function (x, y, cols, rows) {
      return x < 0 || y < 0 || x >= cols || y >= rows;
    };

    P.selfHit = function (snake, x, y) {
      for (let i = 0; i < snake.length; i++) {
        const s = snake[i];
        if (s.x === x && s.y === y) return true;
      }
      return false;
    };

    P.roundRect = function (ctx, x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    return P;
  })();
})();