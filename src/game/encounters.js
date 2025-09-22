(function(){
  const M = Game.Math;
  function create(map){
    const base = Game.Constants.ENCOUNTER_BASE_RATE;
    const tmin = Game.Constants.STEP_THRESHOLD_MIN;
    const tmax = Game.Constants.STEP_THRESHOLD_MAX;
    let threshold = M.randInt(tmin, tmax);
    let steps = 0;
    function reset(){ threshold = M.randInt(tmin, tmax); steps = 0; }
    function onStep(tile){
      steps++;
      if(steps < threshold) return null;
      const mod = map.terrainMod[tile] || 0;
      const rate = base * mod; // 0 on solid
      const roll = Math.random();
      reset();
      if(roll < rate){
        const enemies = Game.Formations.generate();
        return { enemies };
      } else {
        return null;
      }
    }
    
    function getState(){ return { threshold, steps }; }
    function setState(s){ if(!s) return; threshold = s.threshold||threshold; steps = s.steps||0; }
    return { onStep, getState, setState };
  }
  window.Game = window.Game || {};
  Game.Encounters = { create };
})();