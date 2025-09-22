(function(){
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  window.Game = window.Game || {};
  Game.canvas = canvas;
  Game.ctx = ctx;
  Game.state = null; // current scene module
  Game.now = 0;
  Game.dt = 0;
})();
