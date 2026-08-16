(()=>{'use strict';
const root=window.SNS=window.SNS||{};
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const dispatch=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}));
class AssetResolver{
 constructor(){this.assets=new Map();this.aliases=new Map();this.fallbacks=[]}
 registerAsset(asset){if(!asset?.id||!asset?.file)return false;this.assets.set(asset.id,{approved:false,...asset});return true}
 registerAlias(alias,canonicalId){const key=normalize(alias);if(key&&canonicalId)this.aliases.set(key,canonicalId)}
 canonical(value){const key=normalize(value);return this.aliases.get(key)||key}
 resolve(req={}){const canonicalId=this.canonical(req.canonicalId||req.name);const candidates=[...this.assets.values()].filter(a=>a.approved!==false&&(!canonicalId||a.canonicalId===canonicalId)&&(!req.type||a.type===req.type));
  const score=a=>(a.state===req.state?8:0)+(a.variant===req.variant?4:0)+(a.source==='local'?2:0)+(a.approved?1:0);
  candidates.sort((a,b)=>score(b)-score(a));if(candidates[0])return candidates[0];
  const miss={canonicalId,type:req.type||'unknown',screen:req.screen||'unknown',time:Date.now()};this.fallbacks.push(miss);dispatch('sns:asset-fallback',miss);return req.fallback?{id:'fallback',canonicalId,file:req.fallback,source:'fallback',approved:false}:null}
 audit(){return {assets:this.assets.size,aliases:this.aliases.size,fallbacks:[...this.fallbacks]}}
}
class NPCRegistry{
 constructor(){this.npcs=new Map();this.roles=new Map()}
 register(npc){if(!npc?.canonicalId)return false;this.npcs.set(npc.canonicalId,npc);for(const role of npc.roles||[]){if(!this.roles.has(role))this.roles.set(role,[]);this.roles.get(role).push(npc.canonicalId)}return true}
 resolveRole(role,ctx={}){const ids=this.roles.get(role)||[];const candidates=ids.map(id=>this.npcs.get(id)).filter(Boolean).filter(n=>!n.availableWhen||n.availableWhen(ctx));return candidates[0]||null}
 get(id){return this.npcs.get(id)||null}
}
class AnimationRegistry{constructor(){this.map=new Map()} register(id,def){if(id)this.map.set(id,{id,...def})} get(id){return this.map.get(id)||this.map.get('physical_melee')||null}}
class VisualStateEngine{
 constructor(){this.states=new Set(['IDLE','MOVE','DASH','PREPARE','HAND_SEALS','ATTACK','CAST','BLOCK','DODGE','HIT','KNOCKBACK','DOWN','KO','TRANSFORM','RECOVER']);this.overlays=new Set(['BURNING','POISON','LIGHTNING','CHAKRA_AURA','DOJUTSU','GENJUTSU','BLEEDING'])}
 apply(el,state,overlays=[]){if(!el)return;for(const s of this.states)el.classList.remove('sns-state-'+s.toLowerCase());if(this.states.has(state))el.classList.add('sns-state-'+state.toLowerCase());el.dataset.snsState=state;for(const o of this.overlays)el.classList.toggle('sns-overlay-'+o.toLowerCase(),overlays.includes(o));}
}
class CombatPresentationEngine{
 constructor(visual,animations){this.visual=visual;this.animations=animations}
 toEvents(result={}){const out=[];if(result.animation)out.push({type:'prepare',animation:result.animation});if(result.source)out.push({type:'source',state:result.handSeals?'HAND_SEALS':'CAST'});if(result.target){out.push({type:'target',state:result.defended?'BLOCK':result.hit?'HIT':'DODGE',overlays:(result.conditions||[]).map(x=>String(x).toUpperCase())});if(result.hit&&Number(result.damage)>0)out.push({type:'damage',amount:Number(result.damage)})}return out}
 present(result,refs={}){const events=this.toEvents(result);for(const e of events){if(e.type==='source')this.visual.apply(refs.source,e.state,[]);if(e.type==='target')this.visual.apply(refs.target,e.state,e.overlays||[])}dispatch('sns:combat-presented',{authoritativeResult:result,events});return events}
}
class SceneDirector{
 constructor(){this.renderers=new Map()}
 register(type,renderer){if(type&&typeof renderer==='function')this.renderers.set(type,renderer)}
 render(scene){const renderer=this.renderers.get(scene?.mode||scene?.type);if(!renderer)throw new Error('Cena não suportada: '+String(scene?.mode||scene?.type));return renderer(scene)}
}
root.normalizeName=normalize;root.assets=new AssetResolver();root.npcs=new NPCRegistry();root.animations=new AnimationRegistry();root.visual=new VisualStateEngine();root.combatPresentation=new CombatPresentationEngine(root.visual,root.animations);root.scenes=new SceneDirector();
root.animations.register('physical_melee',{prepare:'PREPARE',movement:'DASH',impact:'HIT'});root.animations.register('katon_projectile',{prepare:'HAND_SEALS',movement:'CAST',impact:'BURNING'});root.animations.register('raiton_melee',{prepare:'LIGHTNING',movement:'DASH',impact:'HIT'});
[['Iruka','iruka_umino'],['Iruka Umino','iruka_umino'],['Umino Iruka','iruka_umino']].forEach(([a,id])=>root.assets.registerAlias(a,id));
for(const ninja of window.NARUTO_ROSTER||[]){const canonicalId=normalize(ninja.slug||ninja.name);root.assets.registerAlias(ninja.name,canonicalId);root.assets.registerAlias(ninja.slug,canonicalId);if(ninja.icon)root.assets.registerAsset({id:'character_'+canonicalId+'_portrait',canonicalId,type:'portrait',state:'default',file:ninja.icon,source:'local',approved:true});for(const skill of ninja.skills||[]){if(!skill.image)continue;const sid=normalize(skill.originalName||skill.name);root.assets.registerAsset({id:'jutsu_'+canonicalId+'_'+sid,canonicalId:canonicalId+'::'+sid,type:'jutsu',state:'default',file:skill.image,source:'local',approved:true});}}
root.npcs.register({canonicalId:'iruka_umino',name:'Iruka Umino',roles:['academy_instructor'],portrait:root.assets.resolve({canonicalId:'iruka_umino',type:'portrait'})?.file||null});
root.version='SNS-V41-GAMEPLAY-VISUAL';dispatch('sns:core-ready',{version:root.version});
})();
