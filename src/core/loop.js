(function(){
  let last = 0;
  function frame(ts){
    if(!last) last = ts;
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    Game.now = ts;
    Game.dt = dt;
    if(Game.state && Game.state.update) Game.state.update(dt);
    if(Game.state && Game.state.render) Game.state.render(Game.ctx);
    Game.Input.postUpdate();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
