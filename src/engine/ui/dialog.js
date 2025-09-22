(function(){
  function DialogBox(lines){
    this.lines = (Array.isArray(lines)?lines:[String(lines||'')]).slice();
    this.lineIndex = 0; this.charIndex = 0; this.done=false; this.hold=false;
  }
  DialogBox.prototype.update = function(dt){
    if(this.done) return;
    // typewriter speed ~ 60 chars/sec
    this.charIndex += dt*60; 
    const curr = this.lines[this.lineIndex]||'';
    if(this.charIndex >= curr.length){ this.charIndex = curr.length; this.hold=true; }
    if(Game.Input.pressed('Enter')||Game.Input.pressed('Space')){
      if(!this.hold){ this.charIndex = curr.length; this.hold=true; Game.Audio&&Game.Audio.play('confirm'); }
      else {
        this.lineIndex++;
        if(this.lineIndex>=this.lines.length){ this.done=true; Game.Audio&&Game.Audio.play('confirm'); }
        else { this.charIndex = 0; this.hold=false; Game.Audio&&Game.Audio.play('cursor'); }
      }
    }
  };
  DialogBox.prototype.render = function(){
    const R = Game.Renderer; const text = (this.lines[this.lineIndex]||'').slice(0, Math.floor(this.charIndex));
    const x=16,y=160,w=288,h=64; R.windowBox(x,y,w,h);
    const words = text.split(' ');
    let cx=x+8, cy=y+8; const maxW = w-16;
    for(const wstr of words){
      const piece = (wstr+' ');
      // naive wrap by char count (monospace approx)
      if((cx - (x+8)) + piece.length*6 > maxW){ cx=x+8; cy+=12; }
      R.text(cx, cy, piece, '#fff');
      cx += piece.length*6;
    }
    if(this.hold && !this.done) R.cursor(x+w-12, y+h-12);
  };
  window.Game = window.Game || {};
  Game.UI = Game.UI || {};
  Game.UI.DialogBox = DialogBox;
})();
