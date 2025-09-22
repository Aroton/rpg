(function(){
  const pools = [
    { slots:['slime'], weight:3 },
    { slots:['slime','slime'], weight:3 },
    { slots:['slime','wolf'], weight:2 },
    { slots:['wolf'], weight:2 },
    { slots:['bat','bat'], weight:2 },
    { slots:['bat','slime','bat'], weight:1 },
    { slots:['slime','slime','slime'], weight:1 }
  ];
  function pick(){
    const total = pools.reduce((a,p)=>a+p.weight,0);
    let r = Math.random()*total;
    for(const p of pools){ if((r-=p.weight)<=0) return p.slots.slice(); }
    return pools[0].slots.slice();
  }
  function generate(){
    const ids = pick();
    const arr = ids.map(id=>Game.Enemies.create(id));
    return arr;
  }
  window.Game = window.Game || {};
  Game.Formations = { generate };
})();
