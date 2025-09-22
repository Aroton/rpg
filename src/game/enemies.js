(function(){
  const TEMPLATES = {
    // Lowered attack and a touch less speed to ease early fights
    slime: { name:'Slime', level:1, stats:{ hp:20, maxHp:20, atk:4, def:2, spd:7, acc:10, evd:6, wcrit:5 }, exp:8, ai:{attack:1.0, defend:0, run:0} },
    wolf:  { name:'Wolf',  level:1, stats:{ hp:18, maxHp:18, atk:5, def:2, spd:10, acc:11, evd:8, wcrit:6 }, exp:10, ai:{attack:0.9, defend:0.1, run:0} },
    bat:   { name:'Bat',   level:1, stats:{ hp:10, maxHp:10, atk:3, def:1, spd:9,  acc:8,  evd:7, wcrit:4 }, exp:6, ai:{attack:0.7, defend:0.1, run:0.2} }
  };
  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function create(id){ const t=TEMPLATES[id]; return t?clone(t):clone(TEMPLATES.slime); }
  function byId(id){ return TEMPLATES[id]; }
  function ids(){ return Object.keys(TEMPLATES); }
  window.Game = window.Game || {};
  Game.Enemies = { create, byId, ids };  
})();
