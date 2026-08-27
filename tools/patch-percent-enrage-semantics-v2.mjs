import fs from 'node:fs';

const file='combat-rules-v2.js';
let src=fs.readFileSync(file,'utf8');

const oldAttack=`function attackAdjustment(source,classes){return statusActive(source,'strengthen').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='attack')).reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0)-statusActive(source,'weaken').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='attack')).reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0)}`;
const newAttack=`function modifierMode(s){return String(s?.amountMode||s?.mode||'flat').trim().toLowerCase()}\nfunction attackAdjustment(source,classes){return statusActive(source,'strengthen').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='attack')&&modifierMode(s)!=='percent').reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0)-statusActive(source,'weaken').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='attack')&&modifierMode(s)!=='percent').reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0)}\nfunction attackMultiplier(source,classes){const strengthen=statusActive(source,'strengthen').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='attack')&&modifierMode(s)==='percent').reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0);const weaken=statusActive(source,'weaken').filter(s=>intersects(s.classes||['all'],classes)&&(!s.stat||s.stat==='attack')&&modifierMode(s)==='percent').reduce((n,s)=>n+Math.max(0,num(s.amount,s.value)),0);return Math.max(0,1+strengthen/100-weaken/100)}`;
if(!src.includes(oldAttack))throw new Error('PATCH_POINT_ATTACK_ADJUSTMENT_NOT_FOUND');
src=src.replace(oldAttack,newAttack);

const oldDamage=`raw=Math.max(0,raw+attackAdjustment(source,classes)+exposureAmount(target,classes)-reductionAmount(target,classes,effect));raw=Math.max(0,Math.round(raw*vulnerabilityMultiplier(target,classes)));`;
const newDamage=`raw=Math.max(0,raw*attackMultiplier(source,classes)+attackAdjustment(source,classes)+exposureAmount(target,classes)-reductionAmount(target,classes,effect));raw=Math.max(0,Math.round(raw*vulnerabilityMultiplier(target,classes)));`;
if(!src.includes(oldDamage))throw new Error('PATCH_POINT_DAMAGE_FORMULA_NOT_FOUND');
src=src.replace(oldDamage,newDamage);

const immunity=`function effectBlockedByImmunity(target,type,effect,ctx){\n  const key=type==='status'?String(effect.status||effect.name||'status'):type;if(!IMMUNITY_BLOCKABLE.has(key)&&!(type==='status'&&effect.negative===true))return false;\n  return isImmuneTo(target,key,normClasses(effect.classes||ctx.skill?.classes||['all']));\n}`;
const enrage=`${immunity}\nconst ENRAGE_BLOCKABLE=new Set(['stun','disable','silence','expose','exhaust','weaken','snare','throttle','taunt']);\nfunction effectBlockedByEnrage(target,type,effect){\n  if(!statusActive(target,'enrage').length)return false;\n  const key=type==='status'?String(effect.status||effect.name||'status'):type;\n  if(['damage','dot','alone','seal','reveal','share'].includes(key))return false;\n  if(type==='status')return effect.negative===true||NEGATIVE_STATUSES.has(key);\n  return ENRAGE_BLOCKABLE.has(key);\n}`;
if(!src.includes(immunity))throw new Error('PATCH_POINT_IMMUNITY_NOT_FOUND');
src=src.replace(immunity,enrage);

const oldApply=`function applyEffect(state,source,target,effect,ctx={},depth=0){\n  if(depth>12)throw new Error('V2_TRIGGER_DEPTH_EXCEEDED');const type=String(effect.type||'noop');\n  if(type!=='damage'&&effectBlockedByImmunity(target,type,effect,ctx))return{type,blocked:'immunity'};`;
const newApply=`function applyEffect(state,source,target,effect,ctx={},depth=0){\n  if(depth>12)throw new Error('V2_TRIGGER_DEPTH_EXCEEDED');const type=String(effect.type||'noop');\n  if(type!=='damage'&&effectBlockedByEnrage(target,type,effect))return{type,blocked:'enrage'};\n  if(type!=='damage'&&effectBlockedByImmunity(target,type,effect,ctx))return{type,blocked:'immunity'};`;
if(!src.includes(oldApply))throw new Error('PATCH_POINT_APPLY_EFFECT_NOT_FOUND');
src=src.replace(oldApply,newApply);

if(!src.includes('function attackMultiplier('))throw new Error('PATCH_VERIFY_ATTACK_MULTIPLIER');
if(!src.includes("blocked:'enrage'"))throw new Error('PATCH_VERIFY_ENRAGE');
fs.writeFileSync(file,src);
console.log(JSON.stringify({ok:true,file,percentStrengthen:true,enrage:true}));
