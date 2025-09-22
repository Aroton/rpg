(function(){
  const R = ()=>Game.Renderer; const M = Game.Math;
  function unitFromPlayer(p){
    const derive = Game.Progression.derivedStats(p);
    return { kind:'P', name:'Hero', level:p.level||1, defend:false,
      stats:{ hp:p.hp||30, maxHp:p.maxHp||30, atk:derive.atk, def:derive.def, spd:10, acc:12, evd:6, wcrit:5 } };
  }
  function unitFromEnemy(e){ return { kind:'E', name:e.name, level:e.level, defend:false, stats:JSON.parse(JSON.stringify(e.stats)), exp:e.exp, ai:e.ai||{attack:1} }; }
  function buildQueue(hero, enemies){
    const arr=[];
    if(hero.stats.hp>0) arr.push({u:hero, ini:hero.stats.spd + M.randInt(1,20)});
    for(const en of enemies){ if(en.stats.hp>0) arr.push({u:en, ini:en.stats.spd + M.randInt(1,20)}); }
    arr.sort((x,y)=>y.ini-x.ini);
    return arr.map(e=>e.u);
  }
  function hitChance(A,D){ const ar = 168 + A.stats.acc - D.stats.evd; return M.clamp(ar/200, 0.05, 0.95); }
  function critChance(A){ return (A.stats.wcrit + (A.level/4))/100; }
  function dmg(A,D){
    const base = (A.stats.atk*2) - D.stats.def + M.randInt(1, Math.max(1, Math.floor(A.stats.atk/4)));
    let n = Math.max(1, base);
    if(M.chance(critChance(A))) n *= 2;
    if(D.defend){ n = Math.ceil(n/2); D.defend=false; }
    return n;
  }
  function runChance(A, enemies){
    const target = enemies.find(e=>e.stats.hp>0) || enemies[0];
    const diff = A.stats.spd - (target?target.stats.spd:10);
    return M.clamp(0.5 + 0.05*diff, 0.10, 0.90);
  }
  function Battle(player, encounter, opts){
    this.heroRef = player; // to write back HP
    this.hero = unitFromPlayer(player);
    const list = (encounter&&encounter.enemies)?encounter.enemies:[(encounter||{})];
    this.enemies = list.map(unitFromEnemy);
    this.turnQ = []; this.active = null; this.phase='';
    this.menu = new Game.UI.Menu(['Attack','Defend','Items','Run']);
    this.itemMenu = null;
    this.targetIndex = 0; this.targeting=false;
    this.floaters=[]; this.result=null; this.onEnd = opts&&opts.onEnd; this.auto = opts&&opts.auto;
    this.pendingExp = 0;
    // pacing control
    this.pause = 0.5; // short intro delay
    this.nextPhase = 'prepare';
  }
  Battle.prototype.pushFloater=function(str,color,x,y){ this.floaters.push({x:x||200,y:y||110,t:1,str,color}); };
  Battle.prototype.startRound=function(){ this.turnQ = buildQueue(this.hero,this.enemies); };
  Battle.prototype.consume=function(){ if(!this.turnQ.length) this.startRound(); this.active=this.turnQ.shift(); this.phase = (this.active===this.hero && !this.auto)?'menu':'actAI'; };
  Battle.prototype.resolveAttack=function(att,def, defPos){
    if(Math.random()<hitChance(att,def)){
      const n = dmg(att,def); def.stats.hp = Math.max(0, def.stats.hp - n); this.pushFloater(String(n),'#ff6', defPos?defPos.x:200, defPos?defPos.y:110); Game.Audio&&Game.Audio.play('hit');
    } else { this.pushFloater('MISS','#aaa', defPos?defPos.x:200, defPos?defPos.y:110); Game.Audio&&Game.Audio.play('miss'); }
  };
  Battle.prototype.enemyPos=function(i){ const x = 80 + i*80; const y = 90; return {x,y}; };
  Battle.prototype.update=function(dt){
    if(this.result){ if(Game.Input.pressed('Enter')||Game.Input.pressed('Space')) this.onEnd&&this.onEnd(this.result,{exp:this.pendingExp}); return; }
    // floaters
    for(let i=this.floaters.length-1;i>=0;i--){ const f=this.floaters[i]; f.t-=dt; f.y-=20*dt; if(f.t<=0) this.floaters.splice(i,1); }
    // pacing gate
    if(this.pause>0){ this.pause -= dt; if(this.pause>0) return; if(this.nextPhase){ this.phase=this.nextPhase; this.nextPhase=''; } }
    // prepare phase ensures we don't chain consume immediately on enter
    if(this.phase==='' || this.phase==='prepare'){ this.consume(); return; }

    if(this.phase==='menu'){
      const choice = this.menu.update();
      if(choice){ Game.Audio&&Game.Audio.play('confirm');
        if(choice==='Attack'){ this.targeting=true; this.phase='selectTarget'; }
        else if(choice==='Defend'){ this.hero.defend=true; this.nextPhase='endTurn'; this.pause=0.4; return; }
        else if(choice==='Run'){ if(M.chance(runChance(this.hero,this.enemies))) { this.end('escape'); Game.Audio&&Game.Audio.play('escape'); } else { this.pushFloater('FAILED','#8cf'); } this.nextPhase='endTurn'; this.pause=0.4; return; }
        else if(choice==='Items'){
          const itemsList = []; const inv=Game.Inventory; const defs=inv.items();
          for(const id in defs){ const cnt=inv.getCount(id); if(cnt>0) itemsList.push({id, label:`${defs[id].name} x${cnt}`}); }
          if(itemsList.length===0){ this.pushFloater('No items','#aaa'); this.nextPhase='endTurn'; this.pause=0.3; return; }
          else { this.itemMenu = new Game.UI.Menu(itemsList.map(i=>i.label)); this._itemsRef = itemsList; this.phase='itemsMenu'; }
        }
      }
    } else if(this.phase==='selectTarget'){
      if(Game.Input.pressed('ArrowLeft')){ do{ this.targetIndex=(this.targetIndex+this.enemies.length-1)%this.enemies.length; } while(this.enemies[this.targetIndex].stats.hp<=0); Game.Audio&&Game.Audio.play('cursor'); }
      if(Game.Input.pressed('ArrowRight')){ do{ this.targetIndex=(this.targetIndex+1)%this.enemies.length; } while(this.enemies[this.targetIndex].stats.hp<=0); Game.Audio&&Game.Audio.play('cursor'); }
      if(Game.Input.pressed('Enter')||Game.Input.pressed('Space')){
        const tgt = this.enemies[this.targetIndex]; const pos=this.enemyPos(this.targetIndex);
        this.resolveAttack(this.hero, tgt, pos); this.nextPhase='endTurn'; this.pause=0.5; return;
      }
    } else if(this.phase==='itemsMenu'){
      const pick = this.itemMenu.update();
      if(pick){ const idx=this.itemMenu.index; const choice=this._itemsRef[idx];
        const ok = Game.Inventory.useItem(choice.id, this.hero.stats); if(!ok) this.pushFloater('No effect','#aaa'); this.nextPhase='endTurn'; this.pause=0.4; return;
      }
    } else if(this.phase==='actAI'){
      // enemy action
      if(this.active.kind==='E' && this.active.stats.hp>0){
        const ai=this.active.ai||{attack:1}; const r=Math.random();
        const i = this.enemies.indexOf(this.active); const pos=this.enemyPos(Math.max(0,i));
        if(r < (ai.run||0)){ if(i>=0){ this.pushFloater('FLEE','#8cf', pos.x, pos.y); this.enemies.splice(i,1); } }
        else if(r < (ai.run||0)+(ai.defend||0)){ this.active.defend = true; this.pushFloater('DEF', '#aaa', pos.x, pos.y); }
        else { this.resolveAttack(this.active, this.hero, {x:64,y:140}); }
      }
      this.nextPhase='endTurn'; this.pause=0.5; return;
    }

    if(this.phase==='endTurn'){
      for(let i=this.enemies.length-1;i>=0;i--){ if(this.enemies[i].stats.hp<=0){ this.pendingExp += (this.enemies[i].exp||0); this.enemies.splice(i,1); } }
      if(this.enemies.length===0) { this.end('victory'); Game.Audio&&Game.Audio.play('victory'); return; }
      else if(this.hero.stats.hp<=0) { this.end('defeat'); return; }
      this.active=null; this.phase='prepare'; // small gap before next actor
      this.pause=0.25;
      return;
    }
  };
  Battle.prototype.end=function(kind){ this.result=kind; if(kind==='victory') this.pushFloater('WIN','#6f6'); if(kind==='defeat') this.pushFloater('LOSE','#f66'); if(kind==='escape') this.pushFloater('ESCAPE','#6cf'); };
  Battle.prototype.render=function(c){
    const g = c.createLinearGradient(0,0,0,240); g.addColorStop(0,'#021'); g.addColorStop(1,'#033'); c.fillStyle=g; c.fillRect(0,0,320,240);
    const ren = R();
    // enemies window
    ren.windowBox(8,8,304,68);
    for(let i=0;i<this.enemies.length;i++){
      const e=this.enemies[i]; const pos=this.enemyPos(i);
      ren.rect(pos.x-16,pos.y-16,32,32,'#844');
      ren.text(pos.x-24, pos.y-28, `${e.name} ${e.stats.hp}/${e.stats.maxHp}`,'#fff');
      const w=40, x=pos.x-20, y=pos.y+20; const ratio = e.stats.hp/Math.max(1,e.stats.maxHp);
      ren.rect(x,y,w,4,'#222'); ren.rect(x,y,Math.floor(w*ratio),4,'#8f8');
      if(this.targeting && i===this.targetIndex) ren.cursor(pos.x-24, pos.y-16);
    }
    // player window bottom right
    ren.windowBox(208,168,96,64); ren.text(216,176,`Hero Lv${this.hero.level}`,'#fff'); ren.text(216,188,`HP ${this.hero.stats.hp}/${this.hero.stats.maxHp}`,'#8f8');
    // action menu bottom-left
    ren.windowBox(8,168,120,64); if(this.phase==='itemsMenu' && this.itemMenu){ this.itemMenu.draw(20,180); } else { this.menu.draw(20,180); }
    // turn order indicator
    const yy=80; ren.windowBox(8,yy,304,14); const tq = (this.turnQ.length?this.turnQ:[this.hero].concat(this.enemies)).slice(0,8);
    for(let i=0;i<tq.length;i++){ const u=tq[i]; ren.rect(16+i*18, yy+3, 14, 8, u===this.hero?'#48f':'#f84'); }
    // hero sprite
    ren.rect(64,140,16,16,'#8fd');
    // floaters
    for(const f of this.floaters){ ren.text(f.x,f.y,f.str,f.color||'#fff'); }
    if(this.result) { ren.windowBox(80,96,160,40); ren.text(120,112, this.result.toUpperCase(), '#fff'); ren.text(92,122,'Press Enter...', '#aaa'); }
  };
  function create(player, encounter, opts){ return new Battle(player, encounter, opts||{}); }
  window.Game = window.Game || {};
  Game.Combat = { create };
})();
