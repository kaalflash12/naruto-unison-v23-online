(()=>{'use strict';const SNS=window.SNS=window.SNS||{};
class CharacterAppearanceSystem{
 constructor(){this.layers=['body','face','hair','eyes','clothes','vest','headband','weapon','accessories','aura','transformation','damageState']}
 render(host,appearance={}){if(!host)return;host.classList.add('sns-avatar-stack');for(const old of host.querySelectorAll(':scope > [data-sns-layer]'))old.remove();for(const layer of this.layers){const value=appearance[layer];for(const file of Array.isArray(value)?value:value?[value]:[]){const img=document.createElement('img');img.dataset.snsLayer=layer;img.className='sns-avatar-layer sns-layer-'+layer;img.src=file;img.alt='';host.appendChild(img)}}host.dataset.snsAppearance='1'}
}
class WorldState{
 constructor(){this.time={day:1,hour:8,minute:0};this.npcStates=new Map();this.relationships=new Map()}
 tick(minutes=1){const total=this.time.hour*60+this.time.minute+Number(minutes||0);this.time.day+=Math.floor(total/1440);const dayMinutes=((total%1440)+1440)%1440;this.time.hour=Math.floor(dayMinutes/60);this.time.minute=dayMinutes%60;window.dispatchEvent(new CustomEvent('sns:world-tick',{detail:{...this.time}}));return {...this.time}}
 setNpc(id,state){this.npcStates.set(id,{...(this.npcStates.get(id)||{}),...state})}
 npc(id){return this.npcStates.get(id)||{}}
}
class ProgressLedger{
 constructor(){this.key='sns.v41.progress';this.state=this.load()}
 load(){try{return JSON.parse(localStorage.getItem(this.key)||'null')||{training:[],missions:[],worldMinutes:0}}catch(_){return {training:[],missions:[],worldMinutes:0}}}
 save(){try{localStorage.setItem(this.key,JSON.stringify(this.state))}catch(_){};window.dispatchEvent(new CustomEvent('sns:sidecar-save',{detail:this.snapshot()}))}
 training(detail){this.state.training.push({at:Date.now(),type:detail.type,id:detail.id,score:detail.minigame.score,modifier:detail.terionModifier});this.state.worldMinutes+=60;this.save()}
 mission(detail){this.state.missions.push({at:Date.now(),type:detail.type,id:detail.id,score:detail.minigame.score,success:detail.minigame.success});this.save()}
 snapshot(){return JSON.parse(JSON.stringify(this.state))}
}
SNS.appearance=new CharacterAppearanceSystem();SNS.world=new WorldState();SNS.progressLedger=new ProgressLedger();
window.addEventListener('sns:training-result',e=>{SNS.progressLedger.training(e.detail);SNS.world.tick(Number(e.detail?.context?.minutes||60))});
window.addEventListener('sns:mission-minigame-result',e=>SNS.progressLedger.mission(e.detail));
SNS.scenes?.register('minigame',scene=>SNS.startMissionMinigame(scene.minigame||scene.activity,scene));
SNS.scenes?.register('combat',scene=>window.dispatchEvent(new CustomEvent('sns:scene-combat-request',{detail:scene})));
SNS.scenes?.register('narrative',scene=>window.dispatchEvent(new CustomEvent('sns:scene-narrative-request',{detail:scene})));
})();
