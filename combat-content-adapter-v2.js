(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.NARUTO_CONTENT_ADAPTER_V2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const VERSION=2;
const OPS=Object.freeze(['buff','chakra-drain','chakra-gain','cleanse','cooldown','damage','debuff','dispel','drain','execute','heal','mark','multi-hit','shield','status']);
const OP_SET=new Set(OPS);
const COST_MAP=Object.freeze({GEN:'Gen',NIN:'Nin',TAI:'Tai',KEK:'Blood',Q:'Rand',Blood:'Blood',Gen:'Gen',Nin:'Nin',Tai:'Tai',Rand:'Rand'});
const POSITIVE_STATUS=new Set(['counter','evasion','regen','invuln']);
const NEGATIVE_STATUS=new Set(['bind','bleed','blind','burn','chakra-lock','freeze','parasite','poison','shock','silence','soaked','stun','vulnerable','wind-cut']);
const DOT_STATUS=new Set(['bleed','burn','parasite','poison']);
const ENGINE_EFFECT_TYPES=Object.freeze([
  'damage','heal','leech','defense','invulnerable','immunity','stun','disable','silence','seal','dot','status',
  'reduction','focus','strengthen','endure','enrage','expose','exhaust','weaken','snare','throttle','taunt','alone',
  'cleanse','cure','dispel','demolish','cooldown','chakra','stack','alternate','trap','counter',
  'bomb','sacrifice','reflect','redirect','channel','interrupt'
]);
const ENGINE_EFFECT_SET=new Set(ENGINE_EFFECT_TYPES);
const ENGINE_CHANGE_TYPES=Object.freeze(['setCost','addCost','removeCost','setTarget','targetAll','setCooldown','setCharges']);
const ENGINE_CHANGE_SET=new Set(ENGINE_CHANGE_TYPES);
const ENGINE_TARGETS=new Set(['self','ally','allies','enemy','enemies','everyone','randomEnemy']);
const ENGINE_REQUIREMENT_TYPES=new Set(['stackAtLeast','stackAtMost','statusPresent','statusAbsent','hpBelow','hpAtMost','consecutiveUses','previousSkill','chargeAtLeast','alternateActive']);
const MAX_ENGINE_DEPTH=6,MAX_ENGINE_EFFECTS=100,MAX_ENGINE_CHANGES=32,MAX_ENGINE_REQUIREMENTS=32,MAX_ENGINE_BYTES=65536;
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

function costToken(token){
  const raw=String(token??'').trim();
  return COST_MAP[raw]||raw;
}
function costTokens(cost){return arr(cost).map(costToken).filter(Boolean)}
function isHelpfulOp(op,m={}){
  if(['buff','chakra-gain','cleanse','heal','shield'].includes(op))return true;
  if(op==='cooldown')return num(m.amount)<0;
  if(op==='status')return POSITIVE_STATUS.has(String(m.status||''))||String(m.status||'').startsWith('form:')||String(m.target||'')==='self';
  return false;
}
function targetSpec(rawTarget,op,m={}){
  const raw=String(rawTarget||'primary');
  if(raw==='self')return'self';
  if(raw==='all-allies')return'allies';
  if(raw==='all-enemies'||raw==='enemies')return'enemies';
  if(raw==='everyone')return'everyone';
  if(raw==='primary')return isHelpfulOp(op,m)?'ally':'enemy';
  return isHelpfulOp(op,m)?'ally':'enemy';
}
function statusRequirement(bonusIf){
  if(!bonusIf||typeof bonusIf!=='object')return null;
  if(bonusIf.targetHas)return{type:'statusPresent',target:'target',status:String(bonusIf.targetHas)};
  if(bonusIf.selfHas)return{type:'statusPresent',status:String(bonusIf.selfHas)};
  return null;
}
function splitTotal(total,hits){
  const h=Math.max(1,Math.floor(num(hits,1))),t=Math.max(0,Math.round(num(total)));
  const base=Math.floor(t/h),extra=t%h;
  return Array.from({length:h},(_,i)=>base+(i<extra?1:0));
}
function timed(effect,m){
  if(m.turns!=null){effect.duration=Math.max(1,Math.floor(num(m.turns,1)));effect.durationUnit='ownerPhases'}
  return effect;
}
function statusEffects(m,target){
  const status=String(m.status||'status'),turns=Math.max(1,Math.floor(num(m.turns,1))),value=num(m.value),damage=Math.max(0,num(m.damage));
  const common={target,duration:turns,durationUnit:'ownerPhases'};
  if(status==='invuln')return[{type:'invulnerable',...common,classes:['all']}];
  if(status==='stun'||status==='freeze')return[{type:'stun',...common,classes:['all']}];
  if(status==='silence')return[{type:'silence',...common,classes:['all']}];
  if(status==='bind')return[{type:'disable',...common,classes:['all'],status:'bind'}];
  if(status==='chakra-lock')return[{type:'seal',...common,classes:['all'],status:'chakra-lock'}];
  const out=[];
  if(DOT_STATUS.has(status)&&damage>0)out.push({type:'dot',target,amount:damage,duration:turns,damageClass:'normal',variance:0,status});
  out.push({type:'status',target,status,duration:turns,durationUnit:'ownerPhases',value,amount:value,negative:NEGATIVE_STATUS.has(status)});
  return out;
}
function mechanicsToEffects(mechanics=[]){
  const effects=[];
  for(const raw of arr(mechanics)){
    const m=clone(raw||{}),op=String(m.op||'');
    if(!OP_SET.has(op))throw new Error(`UNSUPPORTED_CONTENT_OP:${op||'<empty>'}`);
    const target=targetSpec(m.target,op,m),amount=Math.max(0,num(m.amount));
    if(op==='damage'){
      effects.push({type:'damage',target,amount,damageClass:'normal',variance:0,bypassDefense:Boolean(m.ignoreShield)});
      const req=statusRequirement(m.bonusIf),mult=Math.max(1,num(m.bonusMultiplier,1)),fixed=m.bonusAmount==null?null:Math.max(0,num(m.bonusAmount));
      const bonus=fixed==null?Math.max(0,Math.round(amount*(mult-1))):fixed;
      if(req&&bonus>0)effects.push({type:'damage',target,amount:bonus,damageClass:'normal',variance:0,bypassDefense:Boolean(m.ignoreShield),requirements:req,conditionalBonus:true})
      continue;
    }
    if(op==='multi-hit'){
      for(const part of splitTotal(amount,m.hits))effects.push({type:'damage',target,amount:part,damageClass:'normal',variance:0,multiHit:true,hits:Math.max(1,Math.floor(num(m.hits,1)))});
      continue;
    }
    if(op==='execute'){
      effects.push({type:'damage',target,amount,damageClass:'normal',variance:0,bypassDefense:Boolean(m.ignoreShield),requirements:{type:'hpBelow',target:'target',ratio:clamp(num(m.threshold,.22),0,1)},execute:true});
      continue;
    }
    if(op==='drain'){effects.push({type:'leech',target,amount,ratio:Math.max(0,num(m.ratio,1)),damageClass:'normal',variance:0});continue}
    if(op==='heal'){effects.push({type:'heal',target,amount,variance:0});continue}
    if(op==='shield'){effects.push(timed({type:'defense',target,amount,destructible:true,classes:['all']},m));continue}
    if(op==='chakra-gain'){effects.push({type:'chakra',target,op:'gain',amount,chakra:'Rand'});continue}
    if(op==='chakra-drain'){effects.push({type:'chakra',target,op:'drain',amount,chakra:'Rand'});continue}
    if(op==='cooldown'){effects.push({type:'cooldown',target,amount:num(m.amount),scope:'all'});continue}
    if(op==='cleanse'){effects.push({type:'cleanse',target,count:Math.max(1,Math.floor(num(m.count,1))),negativeOnly:true});continue}
    if(op==='dispel'){effects.push({type:'dispel',target,count:Math.max(1,Math.floor(num(m.count,1))),positiveOnly:true});continue}
    if(op==='mark'){effects.push(timed({type:'status',target,status:String(m.mark||'mark'),negative:true,mark:true},m));continue}
    if(op==='buff'||op==='debuff'){
      const stat=String(m.stat||'attack'),positive=op==='buff',type=stat==='defense'?(positive?'reduction':'expose'):(positive?'strengthen':'weaken');
      effects.push(timed({type,target,amount,stat,contentOp:op},m));continue;
    }
    if(op==='status'){effects.push(...statusEffects(m,target));continue}
  }
  return effects;
}

function jsonSize(value){
  try{return JSON.stringify(value).length}catch{return Infinity}
}
function validateEngineRequirement(raw,depth=0,counter={count:0}){
  if(raw==null)return null;
  if(depth>MAX_ENGINE_DEPTH)throw new Error('ENGINE_REQUIREMENT_DEPTH_EXCEEDED');
  if(Array.isArray(raw)){
    if(raw.length>MAX_ENGINE_REQUIREMENTS)throw new Error('ENGINE_REQUIREMENT_COUNT_EXCEEDED');
    return raw.map(x=>validateEngineRequirement(x,depth+1,counter));
  }
  if(typeof raw!=='object')throw new Error('INVALID_ENGINE_REQUIREMENT');
  counter.count++;
  if(counter.count>MAX_ENGINE_REQUIREMENTS)throw new Error('ENGINE_REQUIREMENT_COUNT_EXCEEDED');
  const out=clone(raw);
  if(out.any!=null){
    if(!Array.isArray(out.any)||out.any.length===0)throw new Error('INVALID_ENGINE_REQUIREMENT_ANY');
    out.any=out.any.map(x=>validateEngineRequirement(x,depth+1,counter));
  }
  if(out.not!=null)out.not=validateEngineRequirement(out.not,depth+1,counter);
  if(out.any==null&&out.not==null){
    const type=String(out.type||'');
    if(!ENGINE_REQUIREMENT_TYPES.has(type))throw new Error(`UNSUPPORTED_ENGINE_REQUIREMENT:${type||'<empty>'}`);
  }
  if(out.target!=null&&!['target','self'].includes(String(out.target)))throw new Error(`INVALID_ENGINE_REQUIREMENT_TARGET:${out.target}`);
  return out;
}
function validateEngineEffect(raw,depth=0,counter={count:0}){
  if(depth>MAX_ENGINE_DEPTH)throw new Error('ENGINE_EFFECT_DEPTH_EXCEEDED');
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('INVALID_ENGINE_EFFECT');
  counter.count++;
  if(counter.count>MAX_ENGINE_EFFECTS)throw new Error('ENGINE_EFFECT_COUNT_EXCEEDED');
  const out=clone(raw),type=String(out.type||'');
  if(!ENGINE_EFFECT_SET.has(type))throw new Error(`UNSUPPORTED_ENGINE_EFFECT:${type||'<empty>'}`);
  if(out.target!=null&&!ENGINE_TARGETS.has(String(out.target)))throw new Error(`INVALID_ENGINE_TARGET:${out.target}`);
  if(out.duration!=null&&out.duration!=='permanent'&&(!Number.isFinite(Number(out.duration))||Number(out.duration)<0))throw new Error(`INVALID_ENGINE_DURATION:${out.duration}`);
  if(out.requirements!=null)out.requirements=validateEngineRequirement(out.requirements,depth+1,{count:0});
  if(out.requirement!=null)out.requirement=validateEngineRequirement(out.requirement,depth+1,{count:0});
  for(const key of ['effects','tickEffects','endEffects','onBreak']){
    if(out[key]==null)continue;
    if(!Array.isArray(out[key]))throw new Error(`INVALID_ENGINE_NESTED_EFFECTS:${key}`);
    out[key]=out[key].map(x=>validateEngineEffect(x,depth+1,counter));
  }
  if(type==='trap'||type==='counter'||type==='bomb'){
    if(out.triggerTarget!=null&&!['source','target'].includes(String(out.triggerTarget)))throw new Error(`INVALID_ENGINE_TRIGGER_TARGET:${out.triggerTarget}`);
  }
  if(type==='channel'&&out.duration!=='permanent'&&Math.max(0,num(out.duration))<1)throw new Error('INVALID_ENGINE_CHANNEL_DURATION');
  if(type==='bomb'&&Math.max(0,num(out.duration))<1)throw new Error('INVALID_ENGINE_BOMB_DURATION');
  if(type==='reflect'){
    const ratio=num(out.ratio,out.value??out.amount??1);
    if(ratio<0||ratio>1)throw new Error(`INVALID_ENGINE_REFLECT_RATIO:${ratio}`);
  }
  return out;
}
function validateEngineEffects(raw){
  if(raw==null)return[];
  if(!Array.isArray(raw))throw new Error('ENGINE_EFFECTS_MUST_BE_ARRAY');
  if(raw.length>MAX_ENGINE_EFFECTS)throw new Error('ENGINE_EFFECT_COUNT_EXCEEDED');
  if(jsonSize(raw)>MAX_ENGINE_BYTES)throw new Error('ENGINE_EFFECTS_TOO_LARGE');
  const counter={count:0};
  return raw.map(x=>validateEngineEffect(x,0,counter));
}
function validateEngineChanges(raw){
  if(raw==null)return[];
  if(!Array.isArray(raw))throw new Error('ENGINE_CHANGES_MUST_BE_ARRAY');
  if(raw.length>MAX_ENGINE_CHANGES)throw new Error('ENGINE_CHANGE_COUNT_EXCEEDED');
  if(jsonSize(raw)>MAX_ENGINE_BYTES)throw new Error('ENGINE_CHANGES_TOO_LARGE');
  return raw.map(rawChange=>{
    if(!rawChange||typeof rawChange!=='object'||Array.isArray(rawChange))throw new Error('INVALID_ENGINE_CHANGE');
    const out=clone(rawChange),type=String(out.type||out.op||'');
    if(!ENGINE_CHANGE_SET.has(type))throw new Error(`UNSUPPORTED_ENGINE_CHANGE:${type||'<empty>'}`);
    out.type=type;delete out.op;
    if(out.requirements!=null)out.requirements=validateEngineRequirement(out.requirements,0,{count:0});
    if(out.requirement!=null)out.requirement=validateEngineRequirement(out.requirement,0,{count:0});
    if(type==='setTarget'&&!ENGINE_TARGETS.has(String(out.target)))throw new Error(`INVALID_ENGINE_CHANGE_TARGET:${out.target}`);
    if(out.cost!=null)out.cost=costTokens(out.cost);
    if(out.token!=null)out.token=costToken(out.token);
    if(['setCooldown','setCharges'].includes(type)){
      const value=out[type==='setCooldown'?'cooldown':'charges']??out.amount;
      if(!Number.isFinite(Number(value))||Number(value)<0)throw new Error(`INVALID_ENGINE_CHANGE_VALUE:${type}`);
    }
    if(type==='removeCost'&&out.count!=null&&(!Number.isFinite(Number(out.count))||Number(out.count)<1))throw new Error('INVALID_ENGINE_REMOVE_COST_COUNT');
    return out;
  });
}
function engineExtension(technique={}){
  const effect=technique.effect&&typeof technique.effect==='object'&&!Array.isArray(technique.effect)?technique.effect:{};
  const effects=validateEngineEffects(effect.engineEffects);
  const changes=validateEngineChanges(effect.engineChanges);
  const explicitRequirement=effect.engineRequirements==null?null:validateEngineRequirement(effect.engineRequirements,0,{count:0});
  const legacyRequirement=statusRequirement(technique.requires);
  const requirements=legacyRequirement&&explicitRequirement?[legacyRequirement,explicitRequirement]:(explicitRequirement||legacyRequirement);
  let charges=technique.charges==null?null:Math.max(0,Math.floor(num(technique.charges)));
  if(effect.engineCharges!=null){
    const n=Number(effect.engineCharges);
    if(!Number.isSafeInteger(n)||n<0||n>999)throw new Error(`INVALID_ENGINE_CHARGES:${effect.engineCharges}`);
    charges=n;
  }
  return{effects,changes,requirements,charges};
}
function adaptTechnique(technique={}){
  const mechanics=arr(technique.mechanics);
  const generatedEffects=mechanicsToEffects(mechanics);
  const ext=engineExtension(technique);
  const effects=[...generatedEffects,...ext.effects];
  const primaryTarget=effects[0]?.target||targetSpec(technique.target,'damage',{});
  const mechanic={version:2,target:primaryTarget,effects,classes:arr(technique.classes||technique.tags||['all']),requirements:ext.requirements,source:'content_entities.technique',contentOps:mechanics.map(x=>String(x?.op||''))};
  if(ext.changes.length)mechanic.changes=ext.changes;
  return {
    id:String(technique.id??technique.entityId??technique.name??'technique'),
    name:String(technique.name??technique.id??'Technique'),
    originalName:String(technique.originalName??technique.name??technique.id??'Technique'),
    classes:arr(technique.classes||technique.tags||['all']),
    cost:costTokens(technique.chakraCost??technique.cost),
    cooldown:Math.max(0,num(technique.cooldown,technique.cd??0)),
    charges:ext.charges,
    mechanic
  };
}
function auditTechnique(technique={}){
  const ops=arr(technique.mechanics).map(x=>String(x?.op||''));
  const unsupported=ops.filter(x=>!OP_SET.has(x));
  let skill=null,error=null;
  try{skill=adaptTechnique(technique)}catch(e){error=String(e?.message||e)}
  const engine=technique.effect&&typeof technique.effect==='object'?technique.effect:{};
  const engineEffectCount=Array.isArray(engine.engineEffects)?engine.engineEffects.length:0;
  const engineChangeCount=Array.isArray(engine.engineChanges)?engine.engineChanges.length:0;
  return{ok:unsupported.length===0&&!error,ops,unsupported,effectCount:skill?.mechanic?.effects?.length||0,engineEffectCount,engineChangeCount,cost:skill?.cost||[],error};
}

return Object.freeze({
  VERSION,OPS,COST_MAP,ENGINE_EFFECT_TYPES,ENGINE_CHANGE_TYPES,
  costToken,costTokens,targetSpec,splitTotal,statusRequirement,mechanicsToEffects,
  validateEngineRequirement,validateEngineEffects,validateEngineChanges,engineExtension,
  adaptTechnique,auditTechnique
});
});
