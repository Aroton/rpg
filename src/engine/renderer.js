(function(){
  const ctx = ()=>Game.ctx;
  function rect(x,y,w,h,fill){
    const c = ctx();
    c.fillStyle = fill;
    c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));
  }
  function text(x,y,str,color){
    const c = ctx();
    c.fillStyle = color||'#fff';
    c.font = '10px monospace';
    c.textBaseline='top';
    c.fillText(str, Math.floor(x), Math.floor(y));
  }
  function windowBox(x,y,w,h){
    rect(x,y,w,h,'#001018');
    rect(x,y,w,1,'#7aa0b0');
    rect(x,y,1,h,'#7aa0b0');
    rect(x,y+h-1,w,1,'#7aa0b0');
    rect(x+w-1,y,1,h,'#7aa0b0');
  }
  function tilemap(map, cam){
    const ts = Game.Constants.TILE_SIZE;
    const rows = map.h, cols = map.w;
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const t = map.data[r*cols+c];
        let color = '#223';
        if(t===0) color = '#2d2d3a'; // walkable
        if(t===1) color = '#101015'; // solid
        if(t===2) color = '#2f3f2f'; // encounter zone
        rect(c*ts - cam.x, r*ts - cam.y, ts, ts, color);
      }
    }
  }
  function cursor(x,y){
    const c = ctx();
    c.fillStyle = '#fff';
    const px = Math.floor(x), py = Math.floor(y);
    c.fillRect(px,py,2,8);
    c.fillRect(px,py,6,2);
    c.fillRect(px,py+6,6,2);
  }
  window.Game = window.Game || {};
  Game.Renderer = { rect, text, windowBox, tilemap, cursor };
})();
