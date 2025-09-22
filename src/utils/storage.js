(function(){
  const KEY='ff1_save_v1';
  function saveSnapshot(snap){ try{ localStorage.setItem(KEY, JSON.stringify(snap)); return true; }catch(e){ return false; } }
  function loadSnapshot(){ try{ const s=localStorage.getItem(KEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
  function clear(){ try{ localStorage.removeItem(KEY); }catch(e){} }
  window.Game = window.Game || {};
  Game.Storage = { saveSnapshot, loadSnapshot, clear };
})();
