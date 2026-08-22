export class AudioDirector{
 constructor({enabled=true,volume=.52}={}){this.enabled=enabled;this.volume=volume;this.ctx=null;}
 setEnabled(v){this.enabled=!!v;} setVolume(v){this.volume=Math.max(0,Math.min(1,Number(v)||0));}
 async play(key,volume=1){
  if(!this.enabled||typeof AudioContext==='undefined'&&typeof webkitAudioContext==='undefined')return;
  try{
   const Ctx=globalThis.AudioContext||globalThis.webkitAudioContext;this.ctx??=new Ctx();if(this.ctx.state==='suspended')await this.ctx.resume();
   const seed=hash(String(key)),now=this.ctx.currentTime,master=this.ctx.createGain(),osc=this.ctx.createOscillator(),osc2=this.ctx.createOscillator(),filter=this.ctx.createBiquadFilter();
   const impact=/impact|hit|item/.test(key),cast=/cast|signature/.test(key);master.gain.setValueAtTime(0.0001,now);master.gain.exponentialRampToValueAtTime(Math.max(.001,this.volume*Math.max(.1,volume)*(impact?.8:.45)),now+.012);master.gain.exponentialRampToValueAtTime(.0001,now+(impact?.18:.34));
   filter.type=impact?'lowpass':'bandpass';filter.frequency.setValueAtTime(impact?900+seed%700:500+seed%1300,now);filter.Q.value=cast?4:1.4;
   osc.type=impact?'sawtooth':'sine';osc.frequency.setValueAtTime(impact?90+seed%80:220+seed%340,now);osc.frequency.exponentialRampToValueAtTime(impact?48:120+seed%120,now+(impact?.16:.32));
   osc2.type='triangle';osc2.frequency.setValueAtTime(impact?180+seed%120:440+seed%420,now);osc2.detune.value=(seed%35)-17;
   osc.connect(filter);osc2.connect(filter);filter.connect(master);master.connect(this.ctx.destination);osc.start(now);osc2.start(now);osc.stop(now+(impact?.19:.35));osc2.stop(now+(impact?.19:.35));
  }catch{}
 }
}
function hash(s){let h=0;for(const c of s)h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return h;}
