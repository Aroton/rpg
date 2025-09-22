(function(){
  const ITEMS = {
    potion: { id:'potion', name:'Potion', type:'consumable', healHp:20, maxStack:9 },
  };
  const EQUIP = {
    sword: { id:'sword', name:'Sword', slot:'weapon', atkBonus:2 },
    cloth: { id:'cloth', name:'Cloth', slot:'armor', defBonus:1 },
  };
  const inv = {}; // id -> count
  function addItem(id, count){ const n=Math.max(1, count||1); inv[id]=(inv[id]||0)+n; return inv[id]; }
  function getCount(id){ return inv[id]||0; }
  function listUsable(){ const arr=[]; for(const id in inv){ if(ITEMS[id]&&inv[id]>0) arr.push(`${ITEMS[id].name} x${inv[id]}`); } return arr; }
  function useItem(id, playerStats){
    if(!ITEMS[id]||!inv[id]) return false; const it=ITEMS[id];
    if(it.healHp){ if(playerStats.hp>=playerStats.maxHp) return false; playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + it.healHp); inv[id]--; Game.Audio&&Game.Audio.play('confirm'); return true; }
    return false;
  }
  function equip(id, player){ const eq=EQUIP[id]; if(!eq) return false; if(eq.slot==='weapon'){ player.weapon = { id:eq.id, atkBonus:eq.atkBonus }; }
    else if(eq.slot==='armor'){ player.armor = { id:eq.id, defBonus:eq.defBonus }; }
    Game.Audio&&Game.Audio.play('confirm'); return true; }
  function items(){ return ITEMS; }
  function equipment(){ return EQUIP; }
  function getState(player){ return { inv: JSON.parse(JSON.stringify(inv)), weapon: player.weapon||null, armor: player.armor||null }; }
  function setState(state, player){ if(state&&state.inv){ for(const k in inv) delete inv[k]; Object.assign(inv, state.inv); }
    if(player){ player.weapon = state&&state.weapon||null; player.armor = state&&state.armor||null; } }
  window.Game = window.Game || {};
  Game.Inventory = { addItem, getCount, listUsable, useItem, equip, items, equipment, getState, setState };
})();
