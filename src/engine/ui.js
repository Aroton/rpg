(function(){
  function Menu(items){
    this.items = items||[];
    this.index = 0;
    this.enabled = true;
  }
  Menu.prototype.update = function(){
    if(!this.enabled) return null;
    if(Game.Input.pressed('ArrowUp')) this.index = (this.index+this.items.length-1)%this.items.length;
    if(Game.Input.pressed('ArrowDown')) this.index = (this.index+1)%this.items.length;
    if(Game.Input.pressed('Enter')||Game.Input.pressed('Space')) return this.items[this.index];
    return null;
  };
  Menu.prototype.draw = function(x,y){
    const R = Game.Renderer;
    for(let i=0;i<this.items.length;i++){
      const yy = y + i*12;
      if(i===this.index) R.cursor(x-8, yy+1);
      R.text(x, yy, this.items[i], '#fff');
    }
  };
  window.Game = window.Game || {};
  Game.UI = { Menu };
})();
