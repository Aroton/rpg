(function(){
  const keysDown = {};
  const pressed = {};
  const released = {};
  const code = (e)=>e.code;

  function onDown(e){
    if(!keysDown[code(e)]) pressed[code(e)] = true;
    keysDown[code(e)] = true;
  }
  function onUp(e){
    released[code(e)] = true;
    delete keysDown[code(e)];
  }
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);

  window.Game = window.Game || {};
  Game.Input = {
    down: (c)=>!!keysDown[c],
    pressed: (c)=>!!pressed[c],
    released: (c)=>!!released[c],
    postUpdate(){
      for(const k in pressed) delete pressed[k];
      for(const k in released) delete released[k];
    }
  };
})();
