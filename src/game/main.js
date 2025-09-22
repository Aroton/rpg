(function(){
  const R = Game.Renderer, TS = Game.Constants.TILE_SIZE, M = Game.Math;
  function Overworld(saved){
    this.mapId = (saved&&saved.mapId)||'field';
    this.map = Game.Levels[this.mapId];
    this.player = new Game.Player(this.map);
    // Stats and progression
    this.player.level = (saved&&saved.player&&saved.player.level)||1;
    this.player.exp = (saved&&saved.player&&saved.player.exp)||0;
    this.player.maxHp = (saved&&saved.player&&saved.player.maxHp)||30;
    this.player.hp = (saved&&saved.player&&saved.player.hp)||this.player.maxHp;
    this.player.baseAtk = (saved&&saved.player&&saved.player.baseAtk)||6;
    this.player.baseDef = (saved&&saved.player&&saved.player.baseDef)||2;
    // Equipment and inventory
    if(saved&&saved.inventory){
      Game.Inventory.setState(saved.inventory, this.player);
    } else {
      this.player.weapon=null; this.player.armor=null;
      // Give a small starter kit for survivability
      Game.Inventory.addItem('potion', 2);
      Game.Inventory.equip('cloth', this.player);
    }

    // Position
    if(saved&&saved.player){
      this.player.tileX=saved.player.x; this.player.tileY=saved.player.y; this.player.px=this.player.tileX*TS; this.player.py=this.player.tileY*TS;
    } else {
      // Drop at map center for immediate visibility
      this.player.tileX = Math.floor(this.map.w/2); this.player.tileY = Math.floor(this.map.h/2);
      this.player.px=this.player.tileX*TS; this.player.py=this.player.tileY*TS;
    }

    this.enc = Game.Encounters.create(this.map);
    if(saved&&saved.encounters) this.enc.setState(saved.encounters);

    this.fade=0; this.fadeDir=0; this.pendingEncounter=null; this.afterBattle=null; this.dialog=null; this.gaveGift=false;
    this.autoCount=0;
    const self=this;
    this.player.onStep = function(tile){
      const e = self.enc.onStep(tile);
      if(e) self.startEncounter(e,false);
      self.checkWarp();
    };
  }
  Overworld.prototype.startEncounter=function(enc, auto){
    // Clamp difficulty for Level 1: only 1 enemy at start
    if((this.player.level||1) < 2 && enc && Array.isArray(enc.enemies) && enc.enemies.length>1){ enc.enemies = [enc.enemies[0]]; }
    this.fadeDir=1; this.pendingEncounter = enc; this.autoPending = !!auto;
  };
  Overworld.prototype.beginBattle=function(){
    const self=this; const enc=this.pendingEncounter; this.pendingEncounter=null;
    const battle = Game.Combat.create(this.player, enc, { auto:this.autoPending, onEnd:function(res, data){
      if(res==='victory'){ const exp=(data&&data.exp)||0; Game.Progression.tryAddXP(self.player, exp); }
      if(res!=='defeat'){
        // write back HP from hero stats if available inside battle
        // ensure not to drop to 0 on victory
        self.player.hp = Math.max(1, Math.min(self.player.maxHp, (battle.hero&&battle.hero.stats&&battle.hero.stats.hp)||self.player.hp));
        self.fadeDir=-1; self.afterBattle=null; Game.state = self;
      } else { Game.state = new Game.Screens.GameOver(); }
    }});
    Game.state = battle;
  };
  Overworld.prototype.checkWarp=function(){
    const wx=this.player.tileX, wy=this.player.tileY; const warps=this.map.warps||[];
    for(const w of warps){ if(w.x===wx && w.y===wy){ this.warpTo(w.to, w.tx, w.ty); break; } }
  };
  Overworld.prototype.warpTo=function(mapId, tx, ty){
    this.mapId = mapId; this.map = Game.Levels[mapId];
    this.player.map=this.map; this.player.tileX=tx; this.player.tileY=ty; this.player.px=tx*TS; this.player.py=ty*TS;
    this.enc = Game.Encounters.create(this.map);
  };
  Overworld.prototype.openDialog=function(lines, onDone){ this.dialog = new Game.UI.DialogBox(lines); this.dialogDone = onDone||null; };
  Overworld.prototype.update=function(dt){
    if(this.fadeDir!==0){ this.fade += this.fadeDir * dt * 3; if(this.fade>=1){ this.fade=1; this.fadeDir=0; this.beginBattle(); } if(this.fade<=0){ this.fade=0; this.fadeDir=0; if(this.autoCount>0) this.queueNextAuto(); } return; }
    if(this.dialog){ this.dialog.update(dt); if(this.dialog.done){ const cb=this.dialogDone; this.dialog=null; if(cb) cb(); } return; }
    if(this.autoCount>0) return; // wait for queued auto battle

    // Interact with NPC
    if(Game.Input.pressed('Enter')){ const npc=this.findNpcAhead(); if(npc){
        const self=this; this.openDialog(npc.dialog, function(){ if(!self.gaveGift){ Game.Inventory.addItem('potion',2); Game.Inventory.equip('sword', self.player); Game.Inventory.equip('cloth', self.player); self.gaveGift=true; } });
      } }

    // Save/Load hotkeys
    if(Game.Input.pressed('KeyS')){ this.saveGame(); }
    if(Game.Input.pressed('KeyL')){ this.loadGame(); }

    this.player.update(dt);
    if(Game.Input.pressed('Digit9')){ this.autoCount=10; this.queueNextAuto(); }
  };
  Overworld.prototype.findNpcAhead=function(){ const dir=this.player.facing; let x=this.player.tileX, y=this.player.tileY; if(dir==='left') x--; else if(dir==='right') x++; else if(dir==='up') y--; else if(dir==='down') y++; const npcs=this.map.npcs||[]; for(const n of npcs){ if(n.x===x && n.y===y) return n; } return null; };
  Overworld.prototype.queueNextAuto=function(){ if(this.autoCount<=0) return; this.autoCount--; this.startEncounter({ enemies:[ Game.Enemies.create('slime') ] }, true); };
  Overworld.prototype.saveGame=function(){
    const snap = { mapId:this.mapId, player:{ x:this.player.tileX, y:this.player.tileY, level:this.player.level, exp:this.player.exp, hp:this.player.hp, maxHp:this.player.maxHp, baseAtk:this.player.baseAtk, baseDef:this.player.baseDef }, inventory: Game.Inventory.getState(this.player), encounters: this.enc.getState() };
    const ok = Game.Storage.saveSnapshot(snap); this.toast = ok?'Saved.':'Save failed.'; };
  Overworld.prototype.loadGame=function(){ const s = Game.Storage.loadSnapshot(); if(!s){ this.toast='No save.'; return; } Game.state = new Overworld(s); };
  Overworld.prototype.render=function(c){
    const cam=this.player.camera(); R.tilemap(this.map, cam);
    this.player.render();
    // HUD
    R.windowBox(8,8,172,48); R.text(16,16,`HP ${this.player.hp}/${this.player.maxHp}`,'#8f8'); R.text(16,28,`LV ${this.player.level}  XP ${this.player.exp}/${Game.Progression.nextLevelFor(this.player.level)}`,'#fff');
    R.windowBox(188,8,124,36); R.text(196,16,'Arrows: Move','#fff'); R.text(196,28,'9: 10 battles','#aaa');
    if(this.toast){ R.windowBox(100,28,120,20); R.text(108,34,this.toast,'#fff'); if(Game.now%1000<20) this.toast=null; }
    if(this.dialog) this.dialog.render();
    if(this.fade>0){ c.fillStyle = `rgba(0,0,0,${this.fade})`; c.fillRect(0,0,320,240); }
  };
  function GameOver(){ this.t=0; }
  GameOver.prototype.update=function(dt){ this.t+=dt; if(Game.Input.pressed('Enter')) Game.state = new Overworld(); };
  GameOver.prototype.render=function(c){ c.fillStyle='#000'; c.fillRect(0,0,320,240); R.windowBox(80,96,160,40); R.text(120,112,'GAME OVER','#f66'); R.text(104,124,'Enter to retry','#aaa'); };
  window.Game = window.Game || {};
  Game.Screens = { GameOver };
  window.addEventListener('load', function(){ Game.state = new Overworld(); });
})();
