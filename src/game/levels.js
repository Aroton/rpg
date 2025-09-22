(function(){
  const TS = Game.Constants.TILE_SIZE;
  function makeMap(w,h,fill){ const data=new Array(w*h).fill(fill||0); return {w,h,data}; }
  function borderWalls(map){ const {w,h,data}=map; for(let r=0;r<h;r++){ for(let c=0;c<w;c++){ if(r===0||c===0||r===h-1||c===w-1) data[r*w+c]=1; } } }
  function sprinkleEncounters(map, step){ const {w,h,data}=map; for(let r=1;r<h-1;r++){ for(let c=1;c<w-1;c++){ if(((r+c)%step)===0 && data[r*w+c]===0) data[r*w+c]=2; } } }
  function get(map,r,c){ return map.data[r*map.w+c]; }

  // Field map 20x15
  const field = makeMap(20,15,0); borderWalls(field); sprinkleEncounters(field,3);
  field.terrainMod = { 0:1.0, 1:0.0, 2:1.2 };
  field.get = function(r,c){ return get(field,r,c); };
  field.warps = [ { x:10, y:1, to:'town', tx:5, ty:10 } ];
  field.npcs = [];

  // Town map 12x12
  const town = makeMap(12,12,0); borderWalls(town);
  // Town has fewer/no encounters: set terrainMod low and no 2 tiles
  town.terrainMod = { 0:0.2, 1:0.0, 2:0.2 };
  town.get = function(r,c){ return get(town,r,c); };
  town.warps = [ { x:5, y:12-2, to:'field', tx:10, ty:2 } ];
  town.npcs = [ { x:6, y:6, dialog:["Welcome to Pixel Town!", "Take these to aid your quest.", "Press S to save anytime."] } ];

  window.Game = window.Game || {};
  Game.Levels = { field, town };
})();