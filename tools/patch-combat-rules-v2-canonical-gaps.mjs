import fs from 'node:fs';

const file='combat-rules-v2.js';
const testFile='tools/test-combat-rules-v2.mjs';
let src=fs.readFileSync(file,'utf8');
let tests=fs.readFileSync(testFile,'utf8');
const once=(label,from,to)=>{const n=src.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 match, got ${n}`);src=src.replace(from,to)};

once('positive statuses',
"const POSITIVE_STATUSES=new Set(['invulnerable','immunity','focus','reduction','strengthen','endure','enrage','counter','evasion','regen']);",
"const POSITIVE_STATUSES=new Set(['invulnerable','immunity','focus','reduction','strengthen','endure','enrage','counter','evasion','regen','reflect','redirect','channel']);");

once('fighter channels',
"    statuses:arr(input.statuses).map(clone),defense:arr(input.defense).map(clone),dots:arr(input.dots).map(clone),traps:arr(input.traps).map(clone),\n    stacks:{...clone(input.stacks||{})},alternates:{...clone(input.alternates||{})},skillCharges:{...clone(input.skillCharges||{})},cooldowns:{...clone(input.cooldowns||{})},metadata:{...clone(input.metadata||{})}",
"    statuses:arr(input.statuses).map(clone),defense:arr(input.defense).map(clone),dots:arr(input.dots).map(clone),traps:arr(input.traps).map(clone),channels:arr(input.channels).map(clone),\n    stacks:{...clone(input.stacks||{})},alternates:{...clone(input.alternates||{})},skillCharges:{...clone(input.skillCharges||{})},cooldowns:{...clone(input.cooldowns||{})},metadata:{...clone(input.metadata||{})}");

once('dynamic changes insert',
"function canUseSkill(state,actorId,skillInput,targetId=null){\n  const actor=getFighter(state,actorId),skill=normalizeSkill(skillInput);if(!actor||!alive(actor))return{ok:false,reason:'ACTOR_DEAD_OR_MISSING'};",
`function applySkillChanges(state,actor,skill,target=null){
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
  const actor=getFighter(state,actorId),baseSkill=normalizeSkill(skillInput),target=targetId==null?null:getFighter(state,targetId),skill=actor?applySkillChanges(state,actor,baseSkill,target):baseSkill;if(!actor||!alive(actor))return{ok:false,reason:'ACTOR_DEAD_OR_MISSING'};`);

once('resolve uses changed skill',
"function resolveSkill(state,actorId,skillInput,targetId=null,options={}){\n  const actor=getFighter(state,actorId),skill=normalizeSkill(skillInput),gate=canUseSkill(state,actorId,skill,targetId);if(!gate.ok)return{ok:false,reason:gate.reason};if(options.payCost!==false&&!pay(actor,gate.cost))return{ok:false,reason:'NO_CHAKRA'};",
"function resolveSkill(state,actorId,skillInput,targetId=null,options={}){\n  const actor=getFighter(state,actorId),baseSkill=normalizeSkill(skillInput),gate=canUseSkill(state,actorId,baseSkill,targetId);if(!gate.ok)return{ok:false,reason:gate.reason};const skill=gate.skill||baseSkill;if(options.payCost!==false&&!pay(actor,gate.cost))return{ok:false,reason:'NO_CHAKRA'};");

once('damage helpers',
"function counterRatio(target,classes){return clamp(statusActive(target,'counter').filter(s=>intersects(s.classes||['all'],classes)).reduce((n,s)=>Math.max(n,num(s.value,s.amount)),0),0,1)}\nfunction applyDamage(state,source,target,effect,ctx={}){\n  if(!alive(target))return{dealt:0,blocked:'dead'};const classes=normClasses(effect.classes||ctx.skill?.classes||['all']);",
`function counterRatio(target,classes){return clamp(statusActive(target,'counter').filter(s=>intersects(s.classes||['all'],classes)).reduce((n,s)=>Math.max(n,num(s.value,s.amount)),0),0,1)}
function reflectRatio(target,classes){return clamp(statusActive(target,'reflect').filter(s=>intersects(s.classes||['all'],classes)).reduce((n,s)=>Math.max(n,num(s.ratio,s.value??s.amount??1)),0),0,1)}
function redirectTarget(state,target,classes){for(const s of statusActive(target,'redirect')){if(!intersects(s.classes||['all'],classes))continue;const id=s.redirectToId||s.toId||s.sourceId,protector=getFighter(state,id);if(protector&&alive(protector)&&protector.id!==target.id)return protector}return null}
function applyDamage(state,source,target,effect,ctx={}){
  if(!alive(target))return{dealt:0,blocked:'dead'};const classes=normClasses(effect.classes||ctx.skill?.classes||['all']);
  if(!ctx.redirected&&!effect.bypassRedirect){const protector=redirectTarget(state,target,classes);if(protector){const r=applyDamage(state,source,protector,effect,{...ctx,redirected:true,originalTarget:target});return{...r,redirectedTo:protector.id,originalTarget:target.id}}}`);

once('reflect result',
"  const{remaining,absorbed}=absorbDefense(state,target,raw,classes,effect,{...ctx,source});const before=target.hp;target.hp=Math.max(0,num(target.hp)-remaining);const dealt=before-target.hp;let countered=0;\n  if(dealt>0){runTriggers(state,'onHarmed',{...ctx,source,target,amount:dealt,effect},1);runTriggers(state,'onDamage',{...ctx,source,target,amount:dealt,effect},1);if(!ctx.counter&&alive(source)){const ratio=counterRatio(target,classes);if(ratio>0){const reflected=Math.max(1,Math.round(dealt*ratio)),r=applyDamage(state,target,source,{type:'damage',amount:reflected,damageClass:'normal',variance:0},{counter:true});countered=r.dealt||0}}}\n  if(before>0&&target.hp<=0)runTriggers(state,'onDeath',{...ctx,source,target,effect},1);return{dealt,absorbed,raw,countered};",
`  const{remaining,absorbed}=absorbDefense(state,target,raw,classes,effect,{...ctx,source});const before=target.hp;target.hp=Math.max(0,num(target.hp)-remaining);const dealt=before-target.hp;let countered=0,reflected=0;
  if(dealt>0){runTriggers(state,'onHarmed',{...ctx,source,target,amount:dealt,effect},1);runTriggers(state,'onDamage',{...ctx,source,target,amount:dealt,effect},1);if(!ctx.counter&&alive(source)){const ratio=counterRatio(target,classes);if(ratio>0){const amount=Math.max(1,Math.round(dealt*ratio)),r=applyDamage(state,target,source,{type:'damage',amount,damageClass:'normal',variance:0},{counter:true});countered=r.dealt||0}}if(!ctx.reflect&&!ctx.counter&&alive(source)){const ratio=reflectRatio(target,classes);if(ratio>0){const amount=Math.max(1,Math.round(dealt*ratio)),r=applyDamage(state,target,source,{type:'damage',amount,damageClass:'normal',variance:0,bypassRedirect:true},{reflect:true});reflected=r.dealt||0}}}
  if(before>0&&target.hp<=0)runTriggers(state,'onDeath',{...ctx,source,target,effect},1);return{dealt,absorbed,raw,countered,reflected};`);

once('advanced effects',
"  if(type==='trap'||type==='counter'){const triggerTarget=String(effect.triggerTarget||effect.counterTarget||effect.trapTarget||(effect.target==='source'||effect.target==='target'?effect.target:'source'));const trap={id:effect.id||uid('trap'),trigger:String(effect.trigger||'onHarmed'),duration:effect.duration??1,durationUnit:effect.durationUnit||'rounds',effects:clone(effect.effects||[]),target:triggerTarget,classes:normClasses(effect.classes||['all']),excludeClasses:arr(effect.excludeClasses).map(normClass),once:Boolean(effect.once),sourceId:source.id,metadata:clone(effect.metadata||{})};target.traps.push(trap);return{type,id:trap.id}}\n  return{type:'noop'};",
`  if(type==='trap'||type==='counter'){const triggerTarget=String(effect.triggerTarget||effect.counterTarget||effect.trapTarget||(effect.target==='source'||effect.target==='target'?effect.target:'source'));const trap={id:effect.id||uid('trap'),trigger:String(effect.trigger||'onHarmed'),duration:effect.duration??1,durationUnit:effect.durationUnit||'rounds',effects:clone(effect.effects||[]),target:triggerTarget,classes:normClasses(effect.classes||['all']),excludeClasses:arr(effect.excludeClasses).map(normClass),once:Boolean(effect.once),sourceId:source.id,metadata:clone(effect.metadata||{})};target.traps.push(trap);return{type,id:trap.id}}
  if(type==='bomb'){const trap={id:effect.id||uid('bomb'),trigger:'onExpire',duration:Math.max(1,num(effect.duration,1)),durationUnit:effect.durationUnit||'ownerPhases',effects:clone(effect.effects||[]),target:String(effect.triggerTarget||'target'),classes:normClasses(effect.classes||['all']),excludeClasses:[],once:true,sourceId:source.id,metadata:{...clone(effect.metadata||{}),bomb:true}};target.traps.push(trap);return{type,id:trap.id,duration:trap.duration}}
  if(type==='sacrifice'){const amount=Math.max(0,num(effect.amount)),floor=effect.canKill?0:Math.max(0,num(effect.minHp,1)),before=target.hp;target.hp=Math.max(floor,num(target.hp)-amount);return{type,lost:before-target.hp,before,after:target.hp}}
  if(type==='reflect')return{type,status:addStatus(target,{...effect,type:'reflect',ratio:clamp(num(effect.ratio,effect.value??effect.amount??1),0,1),positive:true,sourceId:source.id})};
  if(type==='redirect')return{type,status:addStatus(target,{...effect,type:'redirect',redirectToId:String(effect.redirectToId||effect.toId||source.id),positive:true,sourceId:source.id})};
  if(type==='channel'){const channel={id:String(effect.id||uid('channel')),skillId:String(effect.skillId||ctx.skill?.id||''),duration:effect.duration==='permanent'?'permanent':Math.max(1,num(effect.duration,1)),durationUnit:effect.durationUnit||'ownerPhases',tickEffects:clone(effect.tickEffects||effect.effects||[]),endEffects:clone(effect.endEffects||[]),sourceId:source.id,targetId:target.id,classes:normClasses(effect.classes||ctx.skill?.classes||['all']),metadata:clone(effect.metadata||{})};target.channels.push(channel);return{type,id:channel.id,duration:channel.duration}}
  if(type==='interrupt'){const before=target.channels.length,skillId=effect.skillId==null?null:String(effect.skillId),channelId=effect.channelId==null?null:String(effect.channelId),classes=normClasses(effect.classes||['all']);target.channels=target.channels.filter(c=>{const match=(!skillId||c.skillId===skillId)&&(!channelId||c.id===channelId)&&intersects(c.classes||['all'],classes);return !match});return{type,interrupted:before-target.channels.length}}
  return{type:'noop'};`);

once('phase processors',
"function processRegens(state,fighter){const out=[];for(const s of statusActive(fighter,'regen')){const amount=Math.max(0,num(s.value,s.amount));if(amount<=0)continue;const before=fighter.hp;fighter.hp=Math.min(fighter.maxHp,fighter.hp+amount);out.push({type:'regen',statusId:s.id,healed:fighter.hp-before})}return out}\nfunction endPhase(state,actingSide){",
`function processRegens(state,fighter){const out=[];for(const s of statusActive(fighter,'regen')){const amount=Math.max(0,num(s.value,s.amount));if(amount<=0)continue;const before=fighter.hp;fighter.hp=Math.min(fighter.maxHp,fighter.hp+amount);out.push({type:'regen',statusId:s.id,healed:fighter.hp-before})}return out}
function tickTraps(state,fighter,shouldTick){const keep=[];for(const trap of fighter.traps){if(trap.duration==='permanent'||!shouldTick(trap)){keep.push(trap);continue}trap.duration=Math.max(0,num(trap.duration)-1);if(trap.duration>0){keep.push(trap);continue}if(String(trap.trigger)==='onExpire'){const source=getFighter(state,trap.sourceId)||fighter;for(const ef of arr(trap.effects))applyEffect(state,source,fighter,ef,{triggeredBy:trap,source,target:fighter},1)}}fighter.traps=keep}
function tickChannels(state,fighter,shouldTick){const keep=[];for(const channel of fighter.channels){const ticks=channel.duration==='permanent'?false:shouldTick(channel);if(ticks){const source=getFighter(state,channel.sourceId)||fighter;const target=getFighter(state,channel.targetId)||fighter;for(const ef of arr(channel.tickEffects))applyEffect(state,source,target,ef,{channel,source,target},1);channel.duration=Math.max(0,num(channel.duration)-1)}if(channel.duration==='permanent'||num(channel.duration)>0){keep.push(channel);continue}const source=getFighter(state,channel.sourceId)||fighter;const target=getFighter(state,channel.targetId)||fighter;for(const ef of arr(channel.endEffects))applyEffect(state,source,target,ef,{channelEnded:channel,source,target},1)}fighter.channels=keep}
function endPhase(state,actingSide){`);

once('phase tick use',
"for(const f of state.fighters){const isOpponent=f.side===opponent,isOwner=f.side===actingSide,shouldTick=s=>(s.durationUnit==='rounds'&&roundBoundary)||(s.durationUnit==='opponentPhases'&&isOpponent)||(s.durationUnit==='ownerPhases'&&isOwner);if(isOwner){processDots(state,f);processRegens(state,f)}f.statuses=decrementTimed(f.statuses,shouldTick);f.defense=decrementTimed(f.defense,shouldTick);f.traps=decrementTimed(f.traps,shouldTick);for(const k of Object.keys(f.cooldowns))if(isOwner&&num(f.cooldowns[k])>0)f.cooldowns[k]=Math.max(0,num(f.cooldowns[k])-1)}",
"for(const f of state.fighters){const isOpponent=f.side===opponent,isOwner=f.side===actingSide,shouldTick=s=>(s.durationUnit==='rounds'&&roundBoundary)||(s.durationUnit==='opponentPhases'&&isOpponent)||(s.durationUnit==='ownerPhases'&&isOwner);if(isOwner){processDots(state,f);processRegens(state,f)}tickChannels(state,f,shouldTick);f.statuses=decrementTimed(f.statuses,shouldTick);f.defense=decrementTimed(f.defense,shouldTick);tickTraps(state,f,shouldTick);for(const k of Object.keys(f.cooldowns))if(isOwner&&num(f.cooldowns[k])>0)f.cooldowns[k]=Math.max(0,num(f.cooldowns[k])-1)}");

const exportMatch=src.match(/return Object\.freeze\(\{([\s\S]*?)\}\);/);
if(!exportMatch)throw new Error('exports: Object.freeze block not found');
const exportNames=['applySkillChanges','reflectRatio','redirectTarget','tickChannels'];
let exportBody=exportMatch[1].replace(/\s+$/,'');
for(const name of exportNames){if(!new RegExp(`\\b${name}\\b`).test(exportBody))exportBody+=`,${name}`}
src=src.replace(exportMatch[0],`return Object.freeze({${exportBody}\n});`);

const marker="// CANONICAL_GAP_MECHANICS_V2_TESTS";
if(!tests.includes(marker))tests+=`\n\n${marker}\n// Sacrifice respects the default 1 HP floor.\n{\n  const s=state();B(s).hp=8;const r=R.applyEffect(s,A(s),B(s),{type:'sacrifice',amount:20});assert.equal(r.lost,7);assert.equal(B(s).hp,1);\n}\n\n// Bomb resolves delayed effects when its timer expires.\n{\n  const s=state();R.applyEffect(s,A(s),B(s),{type:'bomb',duration:1,durationUnit:'ownerPhases',effects:[{type:'damage',amount:17,variance:0}]});assert.equal(B(s).hp,100);R.endPhase(s,'B');assert.equal(B(s).hp,83);assert.equal(B(s).traps.length,0);\n}\n\n// Reflect returns a configured fraction of actual damage without recursion.\n{\n  const s=state();R.applyEffect(s,B(s),B(s),{type:'reflect',ratio:1,duration:2,classes:['all']});const r=R.applyDamage(s,A(s),B(s),{type:'damage',amount:20,variance:0,classes:['all']});assert.equal(r.dealt,20);assert.equal(r.reflected,20);assert.equal(A(s).hp,80);assert.equal(B(s).hp,80);\n}\n\n// Redirect transfers incoming damage to a living protector.\n{\n  const s=R.createState([fighter('A','A'),fighter('B','B'),fighter('C','B')],{seed:7});const a=R.getFighter(s,'A'),b=R.getFighter(s,'B'),c=R.getFighter(s,'C');R.applyEffect(s,c,b,{type:'redirect',redirectToId:'C',duration:2,classes:['all']});const r=R.applyDamage(s,a,b,{type:'damage',amount:25,variance:0,classes:['all']});assert.equal(r.redirectedTo,'C');assert.equal(b.hp,100);assert.equal(c.hp,75);\n}\n\n// Channel ticks on its configured phase and interrupt cancels it.\n{\n  const s=state();R.applyEffect(s,A(s),B(s),{type:'channel',duration:2,durationUnit:'ownerPhases',tickEffects:[{type:'damage',amount:6,variance:0}]});assert.equal(B(s).channels.length,1);R.endPhase(s,'B');assert.equal(B(s).hp,94);assert.equal(B(s).channels.length,1);const cut=R.applyEffect(s,A(s),B(s),{type:'interrupt'});assert.equal(cut.interrupted,1);R.endPhase(s,'B');assert.equal(B(s).hp,94);\n}\n\n// Dynamic changes are applied before cost validation.\n{\n  const s=R.createState([fighter('A','A',{chakra:{Blood:0,Gen:0,Nin:0,Tai:0,Rand:0},statuses:[{type:'form:test',duration:2}]}),fighter('B','B')],{seed:8});const skill={id:'dyn',name:'Dynamic',cost:['Nin'],classes:['nin'],mechanic:{version:2,target:'enemy',effects:[{type:'damage',amount:10}],changes:[{type:'setCost',cost:[],requirements:{type:'statusPresent',status:'form:test'}}]}};const gate=R.canUseSkill(s,'A',skill,'B');assert.equal(gate.ok,true);assert.equal(gate.cost.length,0);assert.equal(R.resolveSkill(s,'A',skill,'B').ok,true);\n}\n`;

fs.writeFileSync(file,src);fs.writeFileSync(testFile,tests);
console.log('PATCH_COMBAT_RULES_V2_CANONICAL_GAPS=APPLIED');
