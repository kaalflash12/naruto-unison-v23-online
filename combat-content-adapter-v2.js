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
      const req=statusRequirement(m.bonusIf),mult=Math.max(1,num(m.bonusMultiplier,1));
      if(req&&mult>1){const bonus=Math.max(0,Math.round(amount*(mult-1)));if(bonus)effects.push({type:'damage',target,amount:bonus,damageClass:'normal',variance:0,bypassDefense:Boolean(m.ignoreShield),requirements:req,conditionalBonus:true})}
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
function adaptTechnique(technique={}){
  const mechanics=arr(technique.mechanics);
  const effects=mechanicsToEffects(mechanics);
  const primaryTarget=effects[0]?.target||targetSpec(technique.target,'damage',{});
  return {
    id:String(technique.id??technique.entityId??technique.name??'technique'),
    name:String(technique.name??technique.id??'Technique'),
    originalName:String(technique.originalName??technique.name??technique.id??'Technique'),
    classes:arr(technique.classes||technique.tags||['all']),
    cost:costTokens(technique.chakraCost??technique.cost),
    cooldown:Math.max(0,num(technique.cooldown,technique.cd??0)),
    charges:technique.charges==null?null:Math.max(0,num(technique.charges)),
    mechanic:{version:2,target:primaryTarget,effects,classes:arr(technique.classes||technique.tags||['all']),source:'content_entities.technique',contentOps:mechanics.map(x=>String(x?.op||''))}
  };
}
function auditTechnique(technique={}){
  const ops=arr(technique.mechanics).map(x=>String(x?.op||''));
  const unsupported=ops.filter(x=>!OP_SET.has(x));
  let skill=null,error=null;
  try{skill=adaptTechnique(technique)}catch(e){error=String(e?.message||e)}
  return{ok:unsupported.length===0&&!error,ops,unsupported,effectCount:skill?.mechanic?.effects?.length||0,cost:skill?.cost||[],error};
}

return Object.freeze({VERSION,OPS,COST_MAP,costToken,costTokens,targetSpec,splitTotal,statusRequirement,mechanicsToEffects,adaptTechnique,auditTechnique});
});
