(function(){
  const TS = Game.Constants.TILE_SIZE;
  function Player(map){
    this.map=map;
    this.tileX=1; this.tileY=1;
    this.px=this.tileX*TS; this.py=this.tileY*TS;
    this.tx=this.tileX; this.ty=this.tileY; // target tile
    this.moving=false;
    this.facing='down';
    this.steps=0; // completed tile steps
  }
  Player.prototype.tryMove = function(dx,dy){
    const nx=this.tileX+dx, ny=this.tileY+dy;
    if(nx<0||ny<0||nx>=this.map.w||ny>=this.map.h) return false;
    const t = this.map.get(ny,nx);
    if(t===1) return false;
    this.tx=nx; this.ty=ny;
    this.moving=true;
    return true;
  };
  Player.prototype.update = function(dt){
    // input only when not moving
    if(!this.moving){
      if(Game.Input.pressed('ArrowLeft')){ this.facing='left'; this.tryMove(-1,0); }
      else if(Game.Input.pressed('ArrowRight')){ this.facing='right'; this.tryMove(1,0); }
      else if(Game.Input.pressed('ArrowUp')){ this.facing='up'; this.tryMove(0,-1); }
      else if(Game.Input.pressed('ArrowDown')){ this.facing='down'; this.tryMove(0,1); }
    }
    const speed = Game.Constants.MOVE_SPEED_PPS;
    if(this.moving){
      const txp=this.tx*TS, typ=this.ty*TS;
      const dx = txp - this.px, dy = typ - this.py;
      const dist = Math.hypot(dx,dy);
      const step = speed*dt;
      if(dist<=step){
        this.px=txp; this.py=typ;
        this.tileX=this.tx; this.tileY=this.ty;
        this.moving=false;
        this.steps++;
        if(this.onStep) this.onStep(this.map.get(this.tileY,this.tileX));
      } else {
        this.px += step*(dx/dist);
        this.py += step*(dy/dist);
      }
    }
  };
  Player.prototype.camera = function(){
    const cw=Game.canvas.width, ch=Game.canvas.height;
    const mapw=this.map.w*TS, maph=this.map.h*TS;
    let cx = this.px - cw/2 + TS/2;
    let cy = this.py - ch/2 + TS/2;
    cx = Math.max(0, Math.min(mapw-cw, cx));
    cy = Math.max(0, Math.min(maph-ch, cy));
    return {x:cx,y:cy};
  };
  Player.prototype.render = function(){
    const R = Game.Renderer;
    const colors = { up:'#8fd', down:'#fd8', left:'#9f8', right:'#f9f' };
    const color = colors[this.facing] || '#fd8';
    const x=this.px - this.camera().x, y=this.py - this.camera().y;
    R.rect(x,y,TS,TS,color);
  };
  window.Game = window.Game || {};
  Game.Player = Player;
})();
