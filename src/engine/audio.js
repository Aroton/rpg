(function(){
  let ctx=null; let masterGain=null; let muted=false; let volume=0.3;
  function ensureCtx(){
    if(ctx) return;
    const AC = window.AudioContext||window.webkitAudioContext;
    try{ ctx = new AC(); masterGain = ctx.createGain(); masterGain.gain.value = muted?0:volume; masterGain.connect(ctx.destination); }catch(e){ ctx=null; }
  }
  function beep(freq=440, dur=0.1, type='square', vol=1.0){
    if(!ctx) return; const now = ctx.currentTime;
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(Math.max(0.0001, vol), now+0.01);
    g.gain.linearRampToValueAtTime(0.0001, now+dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(now); osc.stop(now+dur+0.05);
  }
  const SFX = {
    cursor: ()=>{ beep(900,0.04,'square',0.3); },
    confirm: ()=>{ beep(600,0.06,'square',0.4); },
    hit: ()=>{ beep(200,0.05,'square',0.5); beep(160,0.06,'square',0.4); },
    miss: ()=>{ beep(300,0.04,'triangle',0.2); },
    victory: ()=>{ beep(500,0.08,'square',0.4); setTimeout(()=>beep(700,0.1,'square',0.5), 80); },
    escape: ()=>{ beep(400,0.06,'sawtooth',0.3); setTimeout(()=>beep(300,0.06,'sawtooth',0.25), 70); },
    levelup: ()=>{ beep(600,0.08,'square',0.4); setTimeout(()=>beep(800,0.08,'square',0.5), 90); setTimeout(()=>beep(1000,0.1,'square',0.6), 180); }
  };
  function play(name){ ensureCtx(); if(!ctx||muted) return; const fn=SFX[name]; if(fn) fn(); }
  function setMuted(m){ muted=!!m; if(masterGain) masterGain.gain.value = muted?0:volume; }
  function toggleMute(){ setMuted(!muted); }
  function setVolume(v){ volume = Math.max(0,Math.min(1,v)); if(masterGain&&!muted) masterGain.gain.value = volume; }
  window.Game = window.Game || {};
  Game.Audio = { play, setMuted, toggleMute, setVolume };
})();
