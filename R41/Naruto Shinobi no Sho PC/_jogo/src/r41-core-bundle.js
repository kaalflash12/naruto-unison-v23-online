(function(root){
  'use strict';
  const FALLBACK='assets/ui/media-pendente.svg';
  const state={manifest:null,byCanonical:new Map(),aliases:new Map(),fallbacks:[]};
  const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  async function getJson(url){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error(`${url}: ${r.status}`); return r.json(); }
  function indexManifest(manifest){
    state.manifest=manifest; state.byCanonical.clear();
    for(const a of manifest.assets||[]){
      const key=normalize(a.canonicalId); if(!state.byCanonical.has(key)) state.byCanonical.set(key,[]);
      state.byCanonical.get(key).push(a);
    }
  }
  async function init(){
    if(state.manifest) return api;
    const [manifest,chars,npcs,jutsu,items,locations]=await Promise.all([
      getJson('data/assets/asset-manifest.json'),getJson('data/aliases/characters.json'),getJson('data/aliases/npcs.json'),
      getJson('data/aliases/jutsu.json'),getJson('data/aliases/items.json'),getJson('data/aliases/locations.json')
    ]);
    indexManifest(manifest);
    for(const map of [chars,npcs,jutsu,items,locations]) for(const [alias,id] of Object.entries(map||{})) state.aliases.set(normalize(alias),normalize(id));
    root.dispatchEvent?.(new CustomEvent('sns:asset-resolver-ready',{detail:{count:manifest.count}}));
    return api;
  }
  function resolve(request){
    const canonicalInput=normalize(request?.canonicalId||request?.id||request?.name);
    const canonical=state.aliases.get(canonicalInput)||canonicalInput;
    const candidates=(state.byCanonical.get(canonical)||[]).filter(a=>a.approved!==false);
    const wantedType=normalize(request?.type);
    const wantedState=normalize(request?.state||'default');
    const wantedVariant=normalize(request?.variant);
    let hit=candidates.find(a=>normalize(a.type)===wantedType&&normalize(a.state)===wantedState&&(!wantedVariant||normalize(a.variant)===wantedVariant))
      ||candidates.find(a=>normalize(a.type)===wantedType&&normalize(a.state)===wantedState)
      ||candidates.find(a=>normalize(a.type)===wantedType)
      ||candidates[0];
    if(hit) return {...hit,resolvedBy:canonicalInput===canonical?'canonicalId':'alias',fallback:false};
    const event={at:new Date().toISOString(),entity:canonical||canonicalInput||'unknown',screen:String(request?.screen||'unknown'),requested:String(request?.type||'asset')};
    state.fallbacks.push(event); console.warn('[ASSET_FALLBACK]',event);
    root.dispatchEvent?.(new CustomEvent('sns:asset-fallback',{detail:event}));
    return {canonicalId:canonical||canonicalInput,file:request?.fallback||FALLBACK,type:request?.type||'unknown',state:request?.state||'default',fallback:true,resolvedBy:'fallback'};
  }
  function auditKnown(){return {manifestCount:state.manifest?.count||0,fallbackCount:state.fallbacks.length,fallbacks:[...state.fallbacks]};}
  const api={init,resolve,auditKnown,normalize,get ready(){return !!state.manifest;},get manifest(){return state.manifest;}};
  root.SNSAssetResolver=api;
})(window);

(function(root){
  'use strict';
  const BASE=new Set(['IDLE','MOVE','DASH','PREPARE','HAND_SEALS','ATTACK','CAST','BLOCK','DODGE','HIT','KNOCKBACK','DOWN','KO','TRANSFORM','RECOVER']);
  const OVERLAYS=new Set(['BURNING','POISON','LIGHTNING','CHAKRA_AURA','DOJUTSU','GENJUTSU','BLEEDING']);
  const normalize=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'');
  function fromCombatResult(result={}){
    const ev=[]; const action=normalize(result.actionType||result.action||result.techniqueType);
    if(result.handSeals) ev.push({state:'HAND_SEALS'}); else if(['JUTSU','NINJUTSU','GENJUTSU','CAST'].includes(action)) ev.push({state:'CAST'}); else ev.push({state:'ATTACK'});
    if(result.defense==='block'||result.blocked) ev.push({targetState:'BLOCK'});
    else if(result.defense==='dodge'||result.dodged) ev.push({targetState:'DODGE'});
    else if(result.hit!==false && Number(result.damage||0)>0){ ev.push({targetState:'HIT'}); if(Number(result.knockback||0)>0||result.knockback===true) ev.push({targetState:'KNOCKBACK'}); }
    const conditions=[...(result.conditions||[]),...(result.appliedConditions||[])].map(normalize);
    for(const c of conditions){ if(OVERLAYS.has(c)) ev.push({overlay:c}); else if(c.includes('QUEIM')) ev.push({overlay:'BURNING'}); else if(c.includes('VENEN')) ev.push({overlay:'POISON'}); else if(c.includes('SANG')) ev.push({overlay:'BLEEDING'}); }
    if(result.ko) ev.push({targetState:'KO'});
    return ev;
  }
  function validateEvent(e){
    const s=normalize(e?.state||e?.targetState||e?.overlay); return BASE.has(s)||OVERLAYS.has(s);
  }
  root.SNSVisualStateEngine={states:[...BASE],overlays:[...OVERLAYS],fromCombatResult,validateEvent};
})(window);

(function(root){'use strict';
  const clone=v=>JSON.parse(JSON.stringify(v||{}));
  function ensure(character={},equipment={}){character.appearanceState=character.appearanceState||{base:clone(character.appearanceChoices),equipment:{},overlays:[],transformation:null,dojutsu:null,damage:[]};const a=character.appearanceState;a.equipment={weapon:equipment.weapon||a.equipment?.weapon||null,armor:equipment.armor||a.equipment?.armor||null};return a;}
  function apply(character,equipment,patch={}){const a=ensure(character,equipment);Object.assign(a,clone(patch));return a;}
  function validate(character,equipment={}){const a=ensure(character,equipment),errors=[];if(equipment.weapon&&a.equipment.weapon!==equipment.weapon)errors.push('weapon_visual_mismatch');if(equipment.armor&&a.equipment.armor!==equipment.armor)errors.push('armor_visual_mismatch');return {ok:!errors.length,errors,state:clone(a)};}
  root.SNSCharacterAppearanceSystem={ensure,apply,validate};
})(window);

(function(root){'use strict';
  function fromResult(result={}){const events=[];if(result.handSeals)events.push({kind:'state',actor:'source',state:'HAND_SEALS'});events.push({kind:'state',actor:'source',state:result.actionType==='jutsu'?'CAST':'ATTACK'});if(result.defense==='block'||result.blocked)events.push({kind:'state',actor:'target',state:'BLOCK'});else if(result.defense==='dodge'||result.dodged)events.push({kind:'state',actor:'target',state:'DODGE'});else if(result.hit!==false){events.push({kind:'state',actor:'target',state:'HIT'});if(Number(result.damage||0)>0)events.push({kind:'damage',value:Number(result.damage||0)});}for(const c of result.conditions||[])events.push({kind:'condition',condition:c});if(result.ko)events.push({kind:'state',actor:'target',state:'KO'});return events;}
  function validate(result={},events=[]){const errors=[];if(result.hit===false&&events.some(e=>e.kind==='damage'&&e.value>0))errors.push('visual_damage_on_miss');if(Number(result.damage||0)>0&&!events.some(e=>e.kind==='damage'))errors.push('missing_damage_event');return {ok:!errors.length,errors};}
  root.SNSCombatPresentationEngine={fromResult,validate};
})(window);

(function(root){'use strict';
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
 function kindOf(action={}){const t=norm([action.id,action.name,action.description,action.group].join(' '));if(/kugangan|sharingan|byakugan|rinnegan|dojutsu/.test(t))return'dojutsu';if(/hachimon|portao|manto|modo|transform|senjutsu|chakra_mode|biju/.test(t))return'transformation';return null;}
 function apply(character,action={},mechanicalResult={}){if(!character)return null;const kind=kindOf(action);if(!kind)return null;character.appearanceState=character.appearanceState||{equipment:{},overlays:[],damage:[]};const active=mechanicalResult.active!==false&&mechanicalResult.success!==false;const name=action.name||action.id||kind;if(kind==='dojutsu'){character.appearanceState.dojutsu=active?name:null;character.appearanceState.overlays=[...(character.appearanceState.overlays||[]).filter(x=>x!=='DOJUTSU'),...(active?['DOJUTSU']:[])];}else character.appearanceState.transformation=active?name:null;return {kind,name,active,mechanicalState:mechanicalResult,visualState:{dojutsu:character.appearanceState.dojutsu||null,transformation:character.appearanceState.transformation||null,overlays:[...(character.appearanceState.overlays||[])]},narrativeFact:active?`${name} está ativo.`:`${name} foi encerrado.`};}
 function validate(state={}){return !!(state.mechanicalState&&state.visualState&&typeof state.narrativeFact==='string');}
 root.SNSTransformationStateEngine={kindOf,apply,validate};
})(window);

(function(root){
  'use strict';
  const registry=new Map();
  const norm=v=>String(v||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  function register(id,def){registry.set(norm(id),Object.freeze({...def,id:norm(id)})); return registry.get(norm(id));}
  function get(id){return registry.get(norm(id))||registry.get('generic_attack');}
  function infer(technique={}){
    const id=norm(technique.animationId||technique.id||technique.name);
    if(registry.has(id)) return registry.get(id);
    const text=norm([technique.name,technique.element,technique.category,technique.tags].flat().join(' '));
    if(/raiton|lightning|chidori|raikiri/.test(text)) return get('raiton_melee');
    if(/katon|fire|fogo/.test(text)) return get('katon_projectile');
    if(/taijutsu|kick|punch|soco|chute/.test(text)) return get('taijutsu_melee');
    return get('generic_attack');
  }
  register('generic_attack',{prepare:'prepare_neutral',movement:'step_forward',impact:'impact_neutral',targetReaction:'hit_light'});
  register('raiton_melee',{prepare:'lightning_charge',movement:'dash_forward',impact:'lightning_hit',targetReaction:'knockback_medium'});
  register('katon_projectile',{prepare:'hand_seals',movement:'projectile_forward',impact:'fire_burst',targetReaction:'hit_burning'});
  register('taijutsu_melee',{prepare:'stance',movement:'dash_short',impact:'melee_impact',targetReaction:'knockback_light'});
  root.SNSAnimationRegistry={register,get,infer,list:()=>[...registry.values()]};
})(window);

(function(root){
  'use strict';
  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}
  function normalizeResult(input={}){
    const score=clamp(input.score,0,1000), errors=Math.max(0,Number(input.errors)||0), time=Math.max(0,Number(input.time)||0);
    return {score,success:Boolean(input.success),errors,time,performanceTags:Array.isArray(input.performanceTags)?input.performanceTags.slice(0,12):[],meta:input.meta||{}};
  }
  function terionModifier(result){
    const r=normalizeResult(result);
    if(r.success && r.score>=850 && r.errors<=1) return {modifier:1,tier:'excelente',rule:'circunstancial'};
    if(!r.success && (r.score<300||r.errors>=6)) return {modifier:-1,tier:'ruim',rule:'complicacao'};
    return {modifier:0,tier:'normal',rule:'sem_modificador'};
  }
  function trainingResult(input={}){
    const minigame=normalizeResult(input.minigame); const bridge=terionModifier(minigame);
    return {minigame,terionCircumstantialModifier:bridge.modifier,tier:bridge.tier,timeSpentMinutes:Math.max(0,Number(input.timeSpentMinutes)||0),mentorId:input.mentorId||null,techniqueId:input.techniqueId||null,canChangePermanentStats:false,requiresTerionRoll:true,requiresWorldTick:true,requiresSavePoint:true};
  }
  root.SNSMinigameEngine={normalizeResult,terionModifier,trainingResult};
})(window);

(function(root){
  'use strict';
  const MODES=new Set(['narrative','dialogue','exploration','minigame','combat','training','investigation']);
  const RENDERERS={narrative:'SceneRenderer',dialogue:'DialogueRenderer',exploration:'SceneRenderer',minigame:'MinigameRenderer',combat:'CombatRenderer',training:'MinigameRenderer',investigation:'SceneRenderer'};
  function normalizeScene(input={}){
    const mode=MODES.has(String(input.mode||input.type).toLowerCase())?String(input.mode||input.type).toLowerCase():'narrative';
    return {id:String(input.id||input.scene||'scene'),mode,renderer:RENDERERS[mode],participants:Array.isArray(input.participants)?input.participants:[],environment:String(input.environment||''),payload:input.payload||{}};
  }
  function fromMissionStage(stage={}){return normalizeScene({id:stage.id||stage.title,type:stage.type||'narrative',participants:stage.participants,environment:stage.environment,payload:stage});}
  root.SNSSceneDirector={modes:[...MODES],normalizeScene,fromMissionStage};
})(window);

(function(root){
  'use strict';
  const IMPORTANT=new Set(['pv','hp','chakra','condition','mission','world','time','technique','position','trigger','death','inventory','equipment','appearance','relationship']);
  const log=[];
  function shouldSave(change={}){const keys=[change.type,...Object.keys(change)].map(x=>String(x||'').toLowerCase());return keys.some(k=>IMPORTANT.has(k));}
  function record(reason,payload={}){
    const point={id:`sp_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,at:new Date().toISOString(),reason:String(reason||'state_change'),payload}; log.push(point); if(log.length>100) log.shift();
    root.dispatchEvent?.(new CustomEvent('sns:save-point',{detail:point})); return point;
  }
  root.SNSSavePointManager={shouldSave,record,recent:()=>log.slice()};
})(window);

(function(root){
  'use strict';
  const VERSION='R40-CORE-ARCH-2026-08-17';
  async function boot(){
    const report={version:VERSION,startedAt:new Date().toISOString(),modules:{}};
    const mods=['SNSAssetResolver','SNSVisualStateEngine','SNSAnimationRegistry','SNSMinigameEngine','SNSSceneDirector','SNSSavePointManager'];
    for(const m of mods) report.modules[m]=Boolean(root[m]);
    try{ await root.SNSAssetResolver?.init?.(); report.assetResolver=root.SNSAssetResolver?.auditKnown?.(); }
    catch(error){ report.assetResolverError=String(error?.message||error); console.error('[R40_CORE_ASSET_INIT]',error); }
    root.SNS_CORE_ARCH=report;
    root.dispatchEvent?.(new CustomEvent('sns:core-ready',{detail:report}));
    console.info('[SNS_CORE_ARCH]',report);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})(window);
