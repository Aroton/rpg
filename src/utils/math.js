(function(){
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function chance(p){ return Math.random()<p; }
  window.Game = window.Game || {};
  Game.Math = { clamp, randInt, chance };
})();
