import fs from 'node:fs';

const file='combat-rules-v2.js';
let src=fs.readFileSync(file,'utf8');
const oldTrap="if(type==='trap'||type==='counter'){const trap={id:effect.id||uid('trap'),trigger:String(effect.trigger||'onHarmed'),duration:effect.duration??1,durationUnit:effect.durationUnit||'rounds',effects:clone(effect.effects||[]),target:effect.target||'source',classes:normClasses(effect.classes||['all']),once:Boolean(effect.once),sourceId:source.id,metadata:clone(effect.metadata||{})};target.traps.push(trap);return{type,id:trap.id}}";
const newTrap="if(type==='trap'||type==='counter'){const triggerTarget=String(effect.triggerTarget||effect.counterTarget||effect.trapTarget||(effect.target==='source'||effect.target==='target'?effect.target:'source'));const trap={id:effect.id||uid('trap'),trigger:String(effect.trigger||'onHarmed'),duration:effect.duration??1,durationUnit:effect.durationUnit||'rounds',effects:clone(effect.effects||[]),target:triggerTarget,classes:normClasses(effect.classes||['all']),excludeClasses:arr(effect.excludeClasses).map(normClass),once:Boolean(effect.once),sourceId:source.id,metadata:clone(effect.metadata||{})};target.traps.push(trap);return{type,id:trap.id}}";
if(!src.includes(oldTrap))throw new Error('trap construction marker not found');
src=src.replace(oldTrap,newTrap);
const oldRun="const incomingClasses=context.effect?.classes||context.skill?.classes||['all'];if(!intersects(trap.classes||['all'],incomingClasses))continue;const source=getFighter(state,trap.sourceId)||owner;";
const newRun="const incomingClasses=context.effect?.classes||context.skill?.classes||['all'];if(!intersects(trap.classes||['all'],incomingClasses))continue;if(arr(trap.excludeClasses).length&&intersects(trap.excludeClasses,incomingClasses))continue;const source=getFighter(state,trap.sourceId)||owner;";
if(!src.includes(oldRun))throw new Error('runTriggers class filter marker not found');
src=src.replace(oldRun,newRun);
fs.writeFileSync(file,src);
console.log(JSON.stringify({ok:true,file,features:['triggerTarget','excludeClasses']},null,2));
