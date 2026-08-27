(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.NARUTO_COMBAT_RULES_V2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const VERSION=2;
const DAMAGE_CLASSES=new Set(['normal','piercing','affliction']);
const TARGETS=new Set(['self','ally','allies','enemy','enemies','everyone','randomEnemy']);
const DISABLING_STATUSES=new Set(['stun','disable','silence','seal']);
const NEGATIVE_STATUSES=new Set(['stun','disable','silence','seal','expose','exhaust','weaken','snare','throttle','taunt','alone','bind','bleed','blind','burn','chakra-lock','freeze','parasite','poison','shock','soaked','vulnerable','wind-cut']);
const POSITIVE_STATUSES=new Set(['invulnerable','immunity','focus','reduction','strengthen','endure','enrage','counter','evasion','regen','reflect','redirect','channel']);
const IMMUNITY_BLOCKABLE=new Set(['damage','dot','stun','disable','silence','seal','expose','exhaust','weaken','snare','throttle','taunt','alone','demolish','trap','counter']);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const uid=(prefix='e')=>`${prefix}-${Math.random().toString(36).slice(2,10)}-${Date.now().toString(36)}`;
const sideOf=x=>String(x?.side||'A');
const alive=x=>Boolean(x&&num(x.hp)>0);
const normClass=x=>String(x||'all').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-')||'all';
const normClasses=x=>{const a=arr(x).map(normClass).filter(Boolean);return a.length?[...new Set(a)]:['all']};
const skillClasses=skill=>normClasses(skill?.classes||skill?.mechanic?.classes||['all']);
const intersects=(a,b)=>{const x=normClasses(a),y=normClasses(b);return x.includes('all')||y.includes('all')||x.some(v=>y.includes(v))};

function makeRng(seed){
  let s=(Number(seed)||0x9e3779b9)>>>0;
  return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};
}
function randomOf(state){return typeof state?.rng==='function'?state.rng:Math.random}

function createFighter(input={}){
  const maxHp=Math.max(1,num(input.maxHp,input.hp??100));
  return {
    id:String(input.id??uid('fighter')),side:String(input.side??'A'),name:String(input.name??input.id??'Fighter'),
    hp:clamp(num(input.hp,maxHp),0,maxHp),maxHp,
    chakra:{Blood:0,Gen:0,Nin:0,Tai:0,Rand:0,...clone(input.chakra||{})},
    statuses:arr(input.statuses).map(clone),defense:arr(input.defense).map(clone),dots:arr(input.dots).map(clone),traps:arr(input.traps).map(clone),channels:arr(input.channels).map(clone),
    stacks:{...clone(input.stacks||{})},alternates:{...clone(input.alternates||{})},skillCharges:{...clone(input.skillCharges||{})},cooldowns:{...clone(input.cooldowns||{})},metadata:{...clone(input.metadata||{})}
  };
}
function createState(fighters=[],options={}){
  return {version:VERSION,fighters:arr(fighters).map(createFighter),round:Math.max(1,num(options.round,1)),phase:Math.max(0,num(options.phase,0)),history:arr(options.history).map(clone),log:arr(options.log).map(clone),rng:options.rng||makeRng(options.seed??1),metadata:{...clone(options.metadata||{})}};
}
function getFighter(state,id){return state.fighters.find(x=>String(x.id)===String(id))||null}
function team(state,side){return state.fighters.filter(x=>x.side===side)}
function enemySide(state,side){const sides=[...new Set(state.fighters.map(sideOf))];return sides.find(x=>x!==side)||null}

function legacyTarget(mechanic={}){
  const base=TARGETS.has(mechanic.target)?mechanic.target:'enemy';
  if(mechanic.aoe===true){if(base==='enemy')return'enemies';if(base==='ally'||base==='self')return'allies'}
  return base;
}
function legacyToV2(skill={}){
  const m=skill.mechanic||{};
  if(Number(m.version)===2&&Array.isArray(m.effects))return clone(m);
  const power=Math.max(0,num(m.power)),duration=Math.max(0,num(m.duration)),target=legacyTarget(m),kind=String(m.kind||'damage');
  const common={version:2,target,effects:[],classes:skillClasses(skill),legacy:true};
  if(kind==='damage')common.effects.push({type:'damage',amount:power,damageClass:'normal',variance:.10});
  else if(kind==='stun'){
    if(power>0)common.effects.push({type:'damage',amount:power,damageClass:'normal',variance:.10});
    common.effects.push({type:'stun',duration:Math.max(1,duration||1),durationUnit:'ownerPhases',classes:['all']});
  }else if(kind==='dot'){
    if(power>0)common.effects.push({type:'damage',amount:power,damageClass:'normal',variance:.10});
    common.effects.push({type:'dot',amount:7,duration:Math.max(1,duration||1),damageClass:'normal'});
  }else if(kind==='heal')common.effects.push({type:'heal',amount:power});
  else if(kind==='shield')common.effects.push({type:'defense',amount:power,duration:duration||'permanent',destructible:true,classes:['all'],durationUnit:'opponentPhases'});
  else if(kind==='invuln')common.effects.push({type:'invulnerable',duration:Math.max(1,duration||1),classes:['all'],durationUnit:'opponentPhases'});
  else common.effects.push({type:'noop',legacyKind:kind});
  return common;
}
function normalizeSkill(skill={}){
  const mechanic=legacyToV2(skill);
  return {id:String(skill.id??skill.originalName??skill.name??uid('skill')),name:String(skill.name??skill.originalName??'Skill'),originalName:String(skill.originalName??skill.name??'Skill'),classes:skillClasses(skill),cost:arr(skill.cost).map(String),cooldown:Math.max(0,num(skill.cooldown,skill.cd??0)),charges:skill.charges==null?null:Math.max(0,num(skill.charges)),mechanic};
}

function statusActive(f,status){return f.statuses.filter(s=>String(s.type)===status&&num(s.duration,1)!==0)}
function statusAmount(f,status,stat=null){return statusActive(f,status).filter(s=>!stat||!s.stat||String(s.stat)===String(stat)).reduce((n,s)=>n+num(s.amount,s.value??s.magnitude),0)}
function hasFocusFor(f,classes){return statusActive(f,'focus').some(s=>intersects(s.classes||['all'],classes||['all']))}
function isDisabledFor(f,classes){return f.statuses.some(s=>DISABLING_STATUSES.has(String(s.type))&&num(s.duration,1)!==0&&intersects(s.classes||['all'],classes||['all']))}
function immunityTypes(status){const v=arr(status.effects||status.effectTypes||status.types||status.blocks||['all']).map(x=>String(x).toLowerCase());return v.length?v:['all']}
function isImmuneTo(f,effectType,classes=['all']){
  const type=String(effectType||'').toLowerCase();
  return statusActive(f,'immunity').some(s=>intersects(s.classes||['all'],classes||['all'])&&(immunityTypes(s).includes('all')||immunityTypes(s).includes(type)));
}
function costWithStatuses(f,skill){
  const out=[...skill.cost];let extra=0;
  for(const s of statusActive(f,'exhaust'))if(intersects(s.classes||['all'],skill.classes))extra+=Math.max(0,num(s.amount,s.magnitude??1));
  for(let i=0;i<extra;i++)out.push('Rand');return out;
}
function canPay(f,cost){
  const pool={...f.chakra};let wildcard=0;
  for(const token of cost){const k=String(token);if(k==='Rand'){wildcard++;continue}if(num(pool[k])<=0)return false;pool[k]=num(pool[k])-1}
  return Object.values(pool).reduce((s,x)=>s+Math.max(0,num(x)),0)>=wildcard;
}
function pay(f,cost){
  if(!canPay(f,cost))return false;
  for(const token of cost){const k=String(token);if(k!=='Rand')f.chakra[k]=Math.max(0,num(f.chakra[k])-1)}
  let wild=cost.filter(x=>String(x)==='Rand').length;
  while(wild-->0){const key=Object.keys(f.chakra).filter(k=>k!=='Rand'&&num(f.chakra[k])>0).sort((a,b)=>num(f.chakra[b])-num(f.chakra[a]))[0];if(key)f.chakra[key]=Math.max(0,num(f.chakra[key])-1)}
  return true;
}
function chargeKey(skill){return String(skill.id||skill.name)}
function ensureCharges(f,skill){if(skill.charges==null)return Infinity;const k=chargeKey(skill);if(f.skillCharges[k]==null)f.skillCharges[k]=skill.charges;return num(f.skillCharges[k])}
function historyFor(state,actorId){return state.history.filter(h=>String(h.actorId)===String(actorId))}
function consecutiveUses(state,actorId,skillId){const h=historyFor(state,actorId);let n=0;for(let i=h.length-1;i>=0;i--){if(String(h[i].skillId)===String(skillId))n++;else break}return n}
function evaluateRequirement(state,actor,skill,req,target){
  if(!req)return true;if(Array.isArray(req))return req.every(x=>evaluateRequirement(state,actor,skill,x,target));if(req.any)return arr(req.any).some(x=>evaluateRequirement(state,actor,skill,x,target));if(req.not)return !evaluateRequirement(state,actor,skill,req.not,target);
  const who=req.target==='target'?target:actor;
  switch(req.type){
    case'stackAtLeast':return num(who?.stacks?.[req.key])>=num(req.amount,1);
    case'stackAtMost':return num(who?.stacks?.[req.key])<=num(req.amount,0);
    case'statusPresent':return Boolean(who&&statusActive(who,String(req.status)).length);
    case'statusAbsent':return Boolean(who&&!statusActive(who,String(req.status)).length);
    case'hpBelow':return Boolean(who&&num(who.hp)/Math.max(1,num(who.maxHp))<num(req.ratio,.5));
    case'hpAtMost':return Boolean(who&&num(who.hp)<=num(req.amount));
    case'consecutiveUses':return consecutiveUses(state,actor.id,skill.id)>=Math.max(0,num(req.count,1)-1);
    case'previousSkill':{const h=historyFor(state,actor.id);return Boolean(h.length&&String(h[h.length-1].skillId)===String(req.skillId||req.name))}
    case'chargeAtLeast':return ensureCharges(actor,skill)>=num(req.amount,1);
    case'alternateActive':return String(actor.alternates?.[req.key])===String(req.value);
    default:return false;
  }
}
function applySkillChanges(state,actor,skill,target=null){
  const out=clone(skill);out.mechanic=clone(out.mechanic||{});out.cost=arr(out.cost).map(String);
  for(const change of arr(out.mechanic.changes)){
    if(!evaluateRequirement(state,actor,out,change.requirements||change.requirement,target))continue;
    const type=String(change.type||change.op||'');
    if(type==='setCost')out.cost=arr(change.cost).map(String);
    else if(type==='addCost')out.cost.push(...arr(change.cost||change.token||'Rand').map(String));
    else if(type==='removeCost'){let n=Math.max(1,num(change.count,1));const token=change.token==null?null:String(change.token);for(let i=out.cost.length-1;i>=0&&n>0;i--){if(token==null||out.cost[i]===token){out.cost.splice(i,1);n--}}}
    else if(type==='setTarget'&&TARGETS.has(String(change.target)))out.mechanic.target=String(change.target);
    else if(type==='targetAll'){const t=String(out.mechanic.target||'enemy');out.mechanic.target=t==='enemy'?'enemies':t==='ally'||t==='self'?'allies':t}
    else if(type==='setCooldown')out.cooldown=Math.max(0,num(change.cooldown,change.amount));
    else if(type==='setCharges')out.charges=Math.max(0,num(change.charges,change.amount));
  }
  return out;
}
function canUseSkill(state,actorId,skillInput,targetId=null){
  const actor=getFighter(state,actorId),baseSkill=normalizeSkill(skillInput),target=targetId==null?null:getFighter(state,targetId),skill=actor?applySkillChanges(state,actor,baseSkill,target):baseSkill;if(!actor||!alive(actor))return{ok:false,reason:'ACTOR_DEAD_OR_MISSING'};
  if(isDisabledFor(actor,skill.classes))return{ok:false,reason:'DISABLED'};
  if(num(actor.cooldowns[skill.id])>0)return{ok:false,reason:'COOLDOWN'};
  if(ensureCharges(actor,skill)<=0)return{ok:false,reason:'NO_CHARGES'};
  const cost=costWithStatuses(actor,skill);if(!canPay(actor,cost))return{ok:false,reason:'NO_CHAKRA',cost};
  const t=targetId==null?null:getFighter(state,targetId);if(!evaluateRequirement(state,actor,skill,skill.mechanic.requirements,t))return{ok:false,reason:'REQUIREMENT'};
  return{ok:true,cost,skill};
}

function resolveTargets(state,actor,targetSpec,targetId){
  const own=team(state,actor.side).filter(alive),other=team(state,enemySide(state,actor.side)).filter(alive),explicit=targetId==null?null:getFighter(state,targetId);
  switch(targetSpec){
    case'self':return[actor];case'ally':return explicit&&explicit.side===actor.side&&alive(explicit)?[explicit]:own.filter(x=>x.id!==actor.id).slice(0,1);case'allies':return own;
    case'enemy':return explicit&&explicit.side!==actor.side&&alive(explicit)?[explicit]:other.slice(0,1);case'enemies':return other;case'other-enemies':{const primary=explicit&&explicit.side!==actor.side&&alive(explicit)?explicit:other[0];return other.filter(x=>!primary||x.id!==primary.id)}case'everyone':return[...own,...other];case'randomEnemy':return other.length?[other[Math.floor(randomOf(state)()*other.length)]]:[];default:return explicit&&alive(explicit)?[explicit]:[];
  }
}
function effectTargets(state,actor,skill,effect,targetId){return resolveTargets(state,actor,effect.target||skill.mechanic.target||'enemy',targetId)}
function isInvulnerable(target,classes,effect){if(effect?.bypassInvulnerable)return false;if(statusActive(target,'expose').some(s=>s.blockInvulnerable===true&&intersects(s.classes||['all'],classes)))return false;return statusActive(target,'invulnerable').some(s=>intersects(s.classes||['all'],classes))}
function isEvaded(state,target,classes,effect){if(effect?.bypassEvasion)return false;const chance=clamp(statusActive(target,'evasion').filter(s=>intersects(s.classes||['all'],classes)).reduce((n,s)=>Math.max(n,num(s.value,s.amount)),0),0,.95);return chance>0&&randomOf(state)()<chance}
function reductionAmount(target,classes,effect){if(effect?.ignoreReduction)return 0;if(statusActive(target,'expose').some(s=>s.blockReduction===true&&intersects(s.classes||['all'],classes)))return 0;return statusActive(target,'reduction').filter(s=>intersects(s.classes||['all'],classes)).reduce((n,s)=>n+Math.max(0,num(s.amount,s.magnitude)),0)}
function attackAdjustment(source,classes){return statusActive(source,'strengthen').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='attack')).reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0)-statusActive(source,'weaken').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='attack')).reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0)}
function exposureAmount(target,classes){return statusActive(target,'expose').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='defense')).reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0)}
function vulnerabilityMultiplier(target,classes){const v=statusActive(target,'vulnerable').filter(s=>intersects(s.classes||['all'],classes)).reduce((n,s)=>n+Math.max(0,num(s.value,s.amount)),0);return 1+v}
function absorbDefense(state,target,amount,classes,effect,ctx){
  if(effect?.bypassDefense)return{remaining:amount,absorbed:0};let remaining=amount,absorbed=0;
  for(const layer of target.defense){if(remaining<=0)break;if(num(layer.amount)<=0||!intersects(layer.classes||['all'],classes))continue;const take=Math.min(remaining,num(layer.amount));layer.amount=num(layer.amount)-take;remaining-=take;absorbed+=take;if(layer.amount<=0)runTriggers(state,'onBreak',{...ctx,target,brokenLayer:layer},1)}
  target.defense=target.defense.filter(x=>num(x.amount)>0);return{remaining,absorbed};
}
function scaledAmount(effect,source,target){let base=Math.max(0,num(effect.amount));const scale=effect?.amountScale;if(scale&&scale.type==='stack'){const owner=scale.source==='target'?target:source;const stacks=Math.max(0,num(owner?.stacks?.[String(scale.key||'')]));base+=stacks*num(scale.per)}return Math.max(0,base)}
function rolledAmount(state,effect,source=null,target=null){const base=scaledAmount(effect,source,target),variance=Math.max(0,num(effect.variance));if(!variance)return Math.round(base);const r=randomOf(state)();return Math.max(0,Math.round(base*(1-variance+2*variance*r)))}
function counterRatio(target,classes){return clamp(statusActive(target,'counter').filter(s=>intersects(s.classes||['all'],classes)).reduce((n,s)=>Math.max(n,num(s.value,s.amount)),0),0,1)}
function reflectRatio(target,classes){return clamp(statusActive(target,'reflect').filter(s=>intersects(s.classes||['all'],classes)).reduce((n,s)=>Math.max(n,num(s.ratio,s.value??s.amount??1)),0),0,1)}
function redirectTarget(state,target,classes){for(const s of statusActive(target,'redirect')){if(!intersects(s.classes||['all'],classes))continue;const id=s.redirectToId||s.toId||s.sourceId,protector=getFighter(state,id);if(protector&&alive(protector)&&protector.id!==target.id)return protector}return null}
function applyDamage(state,source,target,effect,ctx={}){
  if(!alive(target))return{dealt:0,blocked:'dead'};const classes=normClasses(effect.classes||ctx.skill?.classes||['all']);
  if(!ctx.redirected&&!effect.bypassRedirect){const protector=redirectTarget(state,target,classes);if(protector){const r=applyDamage(state,source,protector,effect,{...ctx,redirected:true,originalTarget:target});return{...r,redirectedTo:protector.id,originalTarget:target.id}}}
  if(isImmuneTo(target,'damage',classes))return{dealt:0,blocked:'immunity'};
  if(isInvulnerable(target,classes,effect))return{dealt:0,blocked:'invulnerable'};
  if(isEvaded(state,target,classes,effect))return{dealt:0,blocked:'evasion'};
  let raw=rolledAmount(state,effect,source,target);const damageClass=DAMAGE_CLASSES.has(effect.damageClass)?effect.damageClass:'normal';if(damageClass==='piercing'||damageClass==='affliction')effect={...effect,bypassDefense:true};
  raw=Math.max(0,raw+attackAdjustment(source,classes)+exposureAmount(target,classes)-reductionAmount(target,classes,effect));raw=Math.max(0,Math.round(raw*vulnerabilityMultiplier(target,classes)));
  const{remaining,absorbed}=absorbDefense(state,target,raw,classes,effect,{...ctx,source});const before=target.hp;target.hp=Math.max(0,num(target.hp)-remaining);const dealt=before-target.hp;let countered=0,reflected=0;
  if(dealt>0){runTriggers(state,'onHarmed',{...ctx,source,target,amount:dealt,effect},1);runTriggers(state,'onDamage',{...ctx,source,target,amount:dealt,effect},1);if(!ctx.counter&&alive(source)){const ratio=counterRatio(target,classes);if(ratio>0){const amount=Math.max(1,Math.round(dealt*ratio)),r=applyDamage(state,target,source,{type:'damage',amount,damageClass:'normal',variance:0},{counter:true});countered=r.dealt||0}}if(!ctx.reflect&&!ctx.counter&&alive(source)){const ratio=reflectRatio(target,classes);if(ratio>0){const amount=Math.max(1,Math.round(dealt*ratio)),r=applyDamage(state,target,source,{type:'damage',amount,damageClass:'normal',variance:0,bypassRedirect:true},{reflect:true});reflected=r.dealt||0}}}
  if(before>0&&target.hp<=0)runTriggers(state,'onDeath',{...ctx,source,target,effect},1);return{dealt,absorbed,raw,countered,reflected};
}
function addStatus(target,status){
  const raw=clone(status||{});const s={...raw,id:raw.id||uid('status'),type:String(raw.type),duration:raw.duration==='permanent'?'permanent':Math.max(1,num(raw.duration,1)),durationUnit:raw.durationUnit||'rounds',classes:normClasses(raw.classes||['all']),amount:raw.amount??raw.magnitude??null,sourceId:raw.sourceId??null};target.statuses.push(s);return s;
}
function effectBlockedByImmunity(target,type,effect,ctx){
  const key=type==='status'?String(effect.status||effect.name||'status'):type;if(!IMMUNITY_BLOCKABLE.has(key)&&!(type==='status'&&effect.negative===true))return false;
  return isImmuneTo(target,key,normClasses(effect.classes||ctx.skill?.classes||['all']));
}
function removeStatuses(target,predicate,count=Infinity){let left=Math.max(0,num(count,Infinity)),removed=0;const removedTypes=[];target.statuses=target.statuses.filter(s=>{if(left>0&&predicate(s)){left--;removed++;removedTypes.push(String(s.type));return false}return true});return{removed,removedTypes,left}}
function applyEffect(state,source,target,effect,ctx={},depth=0){
  if(depth>12)throw new Error('V2_TRIGGER_DEPTH_EXCEEDED');const type=String(effect.type||'noop');
  if(type!=='damage'&&effectBlockedByImmunity(target,type,effect,ctx))return{type,blocked:'immunity'};
  if(type==='damage')return{type,...applyDamage(state,source,target,clone(effect),ctx)};
  if(type==='heal'){const amount=rolledAmount(state,effect),before=target.hp;target.hp=Math.min(target.maxHp,target.hp+amount);return{type,healed:target.hp-before}}
  if(type==='leech'){const hit=applyDamage(state,source,target,{...clone(effect),type:'damage'},ctx),heal=Math.max(0,hit.dealt*num(effect.ratio,1)),before=source.hp;source.hp=Math.min(source.maxHp,source.hp+heal);return{type,dealt:hit.dealt,healed:source.hp-before}}
  if(type==='defense'){const layer={id:effect.id||uid('def'),amount:Math.max(0,num(effect.amount)),duration:effect.duration??'permanent',durationUnit:effect.durationUnit||'rounds',classes:normClasses(effect.classes||['all']),destructible:effect.destructible!==false,onBreak:clone(effect.onBreak||[]),sourceId:source.id};target.defense.push(layer);return{type,amount:layer.amount,id:layer.id}}
  if(type==='invulnerable')return{type,status:addStatus(target,{...effect,type:'invulnerable',positive:true,sourceId:source.id})};
  if(type==='immunity')return{type,status:addStatus(target,{...effect,type:'immunity',positive:true,effects:immunityTypes(effect),sourceId:source.id})};
  if(type==='stun'||type==='disable'||type==='silence'||type==='seal'){const classes=normClasses(effect.classes||['all']);if(hasFocusFor(target,classes))return{type,blocked:'focus'};return{type,status:addStatus(target,{...effect,type,negative:true,classes,sourceId:source.id})}}
  if(type==='dot'){const dot={id:effect.id||uid('dot'),amount:Math.max(0,num(effect.amount)),duration:Math.max(1,num(effect.duration,1)),damageClass:effect.damageClass||'normal',classes:normClasses(effect.classes||ctx.skill?.classes||['all']),sourceId:source.id,bypassDefense:Boolean(effect.bypassDefense),bypassInvulnerable:Boolean(effect.bypassInvulnerable),variance:Math.max(0,num(effect.variance)),status:effect.status?String(effect.status):null};target.dots.push(dot);return{type,id:dot.id,duration:dot.duration}}
  if(type==='status')return{type,status:addStatus(target,{...effect,type:String(effect.status||effect.name||'status'),sourceId:source.id})};
  if(type==='reduction'||type==='focus'||type==='strengthen'||type==='endure'||type==='enrage')return{type,status:addStatus(target,{...effect,type,positive:true,sourceId:source.id})};
  if(type==='expose'||type==='exhaust'||type==='weaken'||type==='snare'||type==='throttle'||type==='taunt'||type==='alone')return{type,status:addStatus(target,{...effect,type,negative:true,sourceId:source.id})};
  if(type==='cleanse'||type==='cure'){
    const names=new Set(arr(effect.statuses||effect.names).map(String)),limit=effect.count==null?Infinity:Math.max(1,num(effect.count,1));
    const r=removeStatuses(target,s=>names.size?names.has(String(s.type)):(effect.negativeOnly?Boolean(s.negative)||NEGATIVE_STATUSES.has(String(s.type)):false),limit);
    if(r.removedTypes.length)target.dots=target.dots.filter(d=>!d.status||!r.removedTypes.includes(String(d.status)));
    return{type,removed:r.removed,removedTypes:r.removedTypes};
  }
  if(type==='dispel'){
    const limit=effect.count==null?Infinity:Math.max(1,num(effect.count,1));const r=removeStatuses(target,s=>Boolean(s.positive)||POSITIVE_STATUSES.has(String(s.type))||String(s.type).startsWith('form:'),limit);let removed=r.removed;
    while(removed<limit&&target.defense.length){target.defense.shift();removed++}
    return{type,removed,removedTypes:r.removedTypes};
  }
  if(type==='demolish'){const before=target.defense.reduce((n,x)=>n+Math.max(0,num(x.amount)),0);if(effect.all!==false)target.defense=[];else target.defense.shift();return{type,removed:before-target.defense.reduce((n,x)=>n+Math.max(0,num(x.amount)),0)}}
  if(type==='cooldown'){
    const amount=Math.trunc(num(effect.amount)),keys=Object.keys(target.cooldowns);let changed=0;
    for(const k of keys){const before=Math.max(0,num(target.cooldowns[k])),after=Math.max(0,before+amount);if(after!==before){target.cooldowns[k]=after;changed++}}
    return{type,amount,changed};
  }
  if(type==='chakra'){
    const op=effect.op||'gain',amount=Math.max(0,num(effect.amount,1)),key=effect.chakra||effect.kind||'Rand';if(op==='gain'){target.chakra[key]=num(target.chakra[key])+amount;return{type,op,amount}}
    const keys=key==='Rand'?Object.keys(target.chakra).filter(k=>k!=='Rand'&&num(target.chakra[k])>0):[key];let left=amount,changed=0;while(left>0&&keys.length){const k=keys[Math.floor(randomOf(state)()*keys.length)];if(num(target.chakra[k])>0){target.chakra[k]--;changed++;left--}else keys.splice(keys.indexOf(k),1)}if(op==='absorb'&&source!==target)source.chakra.Rand=num(source.chakra.Rand)+changed;return{type,op,amount:changed};
  }
  if(type==='stack'){const key=String(effect.key||'stack'),op=effect.op||'add',amount=Math.max(0,num(effect.amount,1)),before=num(target.stacks[key]);if(op==='remove')target.stacks[key]=Math.max(0,before-amount);else if(op==='set')target.stacks[key]=amount;else target.stacks[key]=before+amount;return{type,key,before,after:target.stacks[key]}}
  if(type==='alternate'){const key=String(effect.key||ctx.skill?.id||'skill'),value=String(effect.value||effect.to||'');if(effect.op==='clear')delete target.alternates[key];else target.alternates[key]=value;return{type,key,value:target.alternates[key]??null}}
  if(type==='trap'||type==='counter'){const triggerTarget=String(effect.triggerTarget||effect.counterTarget||effect.trapTarget||(effect.target==='source'||effect.target==='target'?effect.target:'source'));const trap={id:effect.id||uid('trap'),trigger:String(effect.trigger||'onHarmed'),duration:effect.duration??1,durationUnit:effect.durationUnit||'rounds',effects:clone(effect.effects||[]),target:triggerTarget,classes:normClasses(effect.classes||['all']),excludeClasses:arr(effect.excludeClasses).map(normClass),once:Boolean(effect.once),sourceId:source.id,metadata:clone(effect.metadata||{})};target.traps.push(trap);return{type,id:trap.id}}
  if(type==='bomb'){const trap={id:effect.id||uid('bomb'),trigger:'onExpire',duration:Math.max(1,num(effect.duration,1)),durationUnit:effect.durationUnit||'ownerPhases',effects:clone(effect.effects||[]),target:String(effect.triggerTarget||'target'),classes:normClasses(effect.classes||['all']),excludeClasses:[],once:true,sourceId:source.id,metadata:{...clone(effect.metadata||{}),bomb:true}};target.traps.push(trap);return{type,id:trap.id,duration:trap.duration}}
  if(type==='sacrifice'){const amount=Math.max(0,num(effect.amount)),floor=effect.canKill?0:Math.max(0,num(effect.minHp,1)),before=target.hp;target.hp=Math.max(floor,num(target.hp)-amount);return{type,lost:before-target.hp,before,after:target.hp}}
  if(type==='reflect')return{type,status:addStatus(target,{...effect,type:'reflect',ratio:clamp(num(effect.ratio,effect.value??effect.amount??1),0,1),positive:true,sourceId:source.id})};
  if(type==='redirect')return{type,status:addStatus(target,{...effect,type:'redirect',redirectToId:String(effect.redirectToId||effect.toId||source.id),positive:true,sourceId:source.id})};
  if(type==='channel'){const channel={id:String(effect.id||uid('channel')),skillId:String(effect.skillId||ctx.skill?.id||''),duration:effect.duration==='permanent'?'permanent':Math.max(1,num(effect.duration,1)),durationUnit:effect.durationUnit||'ownerPhases',tickEffects:clone(effect.tickEffects||effect.effects||[]),endEffects:clone(effect.endEffects||[]),sourceId:source.id,targetId:target.id,classes:normClasses(effect.classes||ctx.skill?.classes||['all']),metadata:clone(effect.metadata||{})};target.channels.push(channel);return{type,id:channel.id,duration:channel.duration}}
  if(type==='interrupt'){const before=target.channels.length,skillId=effect.skillId==null?null:String(effect.skillId),channelId=effect.channelId==null?null:String(effect.channelId),classes=normClasses(effect.classes||['all']);target.channels=target.channels.filter(c=>{const match=(!skillId||c.skillId===skillId)&&(!channelId||c.id===channelId)&&intersects(c.classes||['all'],classes);return !match});return{type,interrupted:before-target.channels.length}}
  return{type:'noop'};
}
function runTriggers(state,trigger,context={},depth=0){
  if(depth>12)return[];const out=[];
  for(const owner of state.fighters)for(const trap of[...owner.traps]){if(String(trap.trigger)!==String(trigger))continue;const incomingClasses=context.effect?.classes||context.skill?.classes||['all'];if(!intersects(trap.classes||['all'],incomingClasses))continue;if(arr(trap.excludeClasses).length&&intersects(trap.excludeClasses,incomingClasses))continue;const source=getFighter(state,trap.sourceId)||owner;let target=owner;if(trap.target==='source')target=context.source||owner;else if(trap.target==='target')target=context.target||owner;for(const ef of arr(trap.effects))out.push(applyEffect(state,source,target,ef,{...context,triggeredBy:trap},depth+1));if(trap.once)owner.traps=owner.traps.filter(x=>x.id!==trap.id)}
  return out;
}
function resolveSkill(state,actorId,skillInput,targetId=null,options={}){
  const actor=getFighter(state,actorId),baseSkill=normalizeSkill(skillInput),gate=canUseSkill(state,actorId,baseSkill,targetId);if(!gate.ok)return{ok:false,reason:gate.reason};const skill=gate.skill||baseSkill;if(options.payCost!==false&&!pay(actor,gate.cost))return{ok:false,reason:'NO_CHAKRA'};
  const targets=resolveTargets(state,actor,skill.mechanic.target||'enemy',targetId);if(!targets.length&&skill.mechanic.target!=='self')return{ok:false,reason:'NO_TARGET'};const results=[];
  for(const effect of arr(skill.mechanic.effects)){const eTargets=effectTargets(state,actor,skill,effect,targetId);for(const target of eTargets){if(!evaluateRequirement(state,actor,skill,effect.requirements,target))continue;results.push({targetId:target.id,effect:applyEffect(state,actor,target,effect,{skill,actor,target})})}}
  if(skill.cooldown>0)actor.cooldowns[skill.id]=skill.cooldown;if(skill.charges!=null){const k=chargeKey(skill);actor.skillCharges[k]=Math.max(0,ensureCharges(actor,skill)-1)}state.history.push({round:state.round,phase:state.phase,actorId:actor.id,skillId:skill.id,skillName:skill.name,targetIds:targets.map(x=>x.id)});state.log.push({type:'skill',actorId:actor.id,skillId:skill.id,results:clone(results)});runTriggers(state,'onAction',{source:actor,skill,targets},1);return{ok:true,skill,targets:targets.map(x=>x.id),results};
}

function decrementTimed(list,predicate){for(const item of list){if(item.duration==='permanent'||!predicate(item))continue;item.duration=Math.max(0,num(item.duration)-1)}return list.filter(x=>x.duration==='permanent'||num(x.duration)>0)}
function processDots(state,fighter){const out=[];for(const dot of[...fighter.dots]){const source=getFighter(state,dot.sourceId)||fighter;out.push(applyDamage(state,source,fighter,{type:'damage',amount:dot.amount,damageClass:dot.damageClass,classes:dot.classes,bypassDefense:dot.bypassDefense,bypassInvulnerable:dot.bypassInvulnerable,variance:dot.variance},{dot:true}));dot.duration=Math.max(0,num(dot.duration)-1)}fighter.dots=fighter.dots.filter(x=>num(x.duration)>0);return out}
function processRegens(state,fighter){const out=[];for(const s of statusActive(fighter,'regen')){const amount=Math.max(0,num(s.value,s.amount));if(amount<=0)continue;const before=fighter.hp;fighter.hp=Math.min(fighter.maxHp,fighter.hp+amount);out.push({type:'regen',statusId:s.id,healed:fighter.hp-before})}return out}
function tickTraps(state,fighter,shouldTick){const keep=[];for(const trap of fighter.traps){if(trap.duration==='permanent'||!shouldTick(trap)){keep.push(trap);continue}trap.duration=Math.max(0,num(trap.duration)-1);if(trap.duration>0){keep.push(trap);continue}if(String(trap.trigger)==='onExpire'){const source=getFighter(state,trap.sourceId)||fighter;for(const ef of arr(trap.effects))applyEffect(state,source,fighter,ef,{triggeredBy:trap,source,target:fighter},1)}}fighter.traps=keep}
function tickChannels(state,fighter,shouldTick){const keep=[];for(const channel of fighter.channels){const ticks=channel.duration==='permanent'?false:shouldTick(channel);if(ticks){const source=getFighter(state,channel.sourceId)||fighter;const target=getFighter(state,channel.targetId)||fighter;for(const ef of arr(channel.tickEffects))applyEffect(state,source,target,ef,{channel,source,target},1);channel.duration=Math.max(0,num(channel.duration)-1)}if(channel.duration==='permanent'||num(channel.duration)>0){keep.push(channel);continue}const source=getFighter(state,channel.sourceId)||fighter;const target=getFighter(state,channel.targetId)||fighter;for(const ef of arr(channel.endEffects))applyEffect(state,source,target,ef,{channelEnded:channel,source,target},1)}fighter.channels=keep}
function endPhase(state,actingSide){
  const opponent=enemySide(state,actingSide),roundBoundary=state.phase%2===1;
  for(const f of state.fighters){const isOpponent=f.side===opponent,isOwner=f.side===actingSide,shouldTick=s=>(s.durationUnit==='rounds'&&roundBoundary)||(s.durationUnit==='opponentPhases'&&isOpponent)||(s.durationUnit==='ownerPhases'&&isOwner);if(isOwner){processDots(state,f);processRegens(state,f)}tickChannels(state,f,shouldTick);f.statuses=decrementTimed(f.statuses,shouldTick);f.defense=decrementTimed(f.defense,shouldTick);tickTraps(state,f,shouldTick);for(const k of Object.keys(f.cooldowns))if(isOwner&&num(f.cooldowns[k])>0)f.cooldowns[k]=Math.max(0,num(f.cooldowns[k])-1)}
  state.phase++;if(state.phase%2===0)state.round++;
}

return Object.freeze({
  VERSION,createFighter,createState,getFighter,normalizeSkill,legacyToV2,resolveTargets,
  canUseSkill,resolveSkill,applyEffect,applyDamage,runTriggers,endPhase,processDots,processRegens,
  costWithStatuses,canPay,pay,evaluateRequirement,intersects,normClasses,makeRng,isImmuneTo,isDisabledFor,statusActive,statusAmount,applySkillChanges,reflectRatio,redirectTarget,tickChannels
});
});
