(function(){
  function nextLevelFor(level){ return 20 * level * level; }
  function tryAddXP(player, amount){
    player.exp = (player.exp||0) + Math.max(0,Math.floor(amount||0));
    let ding=false;
    while(player.exp >= nextLevelFor(player.level||1)){
      player.exp -= nextLevelFor(player.level||1);
      player.level = (player.level||1) + 1; ding=true;
      // simple gains
      player.baseAtk = (player.baseAtk||6) + 2;
      player.baseDef = (player.baseDef||2) + 1;
      player.maxHp = (player.maxHp||30) + 3; player.hp = player.maxHp;
    }
    if(ding && Game.Audio) Game.Audio.play('levelup');
    return ding;
  }
  function derivedStats(player){
    const atk = (player.baseAtk||6) + ((player.weapon&&player.weapon.atkBonus)||0);
    const def = (player.baseDef||2) + ((player.armor&&player.armor.defBonus)||0);
    return { atk, def };
  }
  window.Game = window.Game || {};
  Game.Progression = { nextLevelFor, tryAddXP, derivedStats };
})();
