'use strict';
const assert=require('node:assert/strict');
const adapter=require('../combat-content-adapter-v2.js');
const rules=require('../combat-rules-v2.js');

const base={id:'legacy-compatible',name:'Legacy Compatible',chakraCost:['NIN'],cooldown:1,tags:['chakra'],target:'enemy',mechanics:[{op:'damage',amount:20,target:'primary'}],effect:{kind:'damage',power:20,duration:0,aoe:false}};
const baseAdapted=adapter.adaptTechnique(base);
assert.deepEqual(baseAdapted.mechanic.effects,[{type:'damage',target:'enemy',amount:20,damageClass:'normal',variance:0,bypassDefense:false}]);
assert.equal(baseAdapted.mechanic.changes,undefined,'técnica antiga não deve ganhar changes vazios');
assert.equal(baseAdapted.charges,null,'técnica antiga sem charges deve permanecer sem charges');
assert.equal(baseAdapted.mechanic.requirements,null,'técnica antiga sem requisitos deve permanecer sem requisitos');

const extendedSource={
  ...base,
  id:'extended',
  chakraCost:['NIN','Q'],
  effect:{
    kind:'damage',power:20,duration:0,aoe:false,
    engineCharges:2,
    engineRequirements:{type:'statusPresent',status:'setup'},
    engineChanges:[{type:'setCost',cost:['TAI'],requirements:{type:'statusPresent',status:'form:test'}}],
    engineEffects:[
      {type:'reflect',target:'self',ratio:.5,duration:2,durationUnit:'ownerPhases'},
      {type:'redirect',target:'ally',duration:1,durationUnit:'ownerPhases'},
      {type:'bomb',target:'enemy',duration:1,durationUnit:'ownerPhases',effects:[{type:'damage',amount:7,variance:0}]},
      {type:'channel',target:'enemy',duration:2,durationUnit:'ownerPhases',tickEffects:[{type:'damage',amount:3,variance:0}],endEffects:[{type:'damage',amount:5,variance:0}]},
      {type:'sacrifice',target:'self',amount:10,minHp:1},
      {type:'interrupt',target:'enemy',skillId:'channel-skill'}
    ]
  }
};
const extended=adapter.adaptTechnique(extendedSource);
assert.equal(extended.charges,2);
assert.deepEqual(extended.mechanic.requirements,{type:'statusPresent',status:'setup'});
assert.equal(extended.mechanic.changes.length,1);
assert.deepEqual(extended.mechanic.changes[0].cost,['Tai']);
assert.equal(extended.mechanic.effects.length,7,'1 efeito editorial + 6 engineEffects');
assert.deepEqual(extended.mechanic.effects.slice(1).map(x=>x.type),['reflect','redirect','bomb','channel','sacrifice','interrupt']);

const withBothRequirements=adapter.adaptTechnique({
  ...base,id:'both-req',requires:{selfHas:'shadow-clones'},
  effect:{...base.effect,engineRequirements:{type:'hpBelow',ratio:.5}}
});
assert.ok(Array.isArray(withBothRequirements.mechanic.requirements));
assert.equal(withBothRequirements.mechanic.requirements.length,2);

const changed=adapter.adaptTechnique({
  ...base,id:'changed',
  effect:{...base.effect,engineChanges:[
    {type:'addCost',cost:['KEK']},
    {type:'removeCost',token:'NIN',count:1},
    {type:'setTarget',target:'enemies'},
    {type:'targetAll'},
    {type:'setCooldown',cooldown:3},
    {type:'setCharges',charges:4}
  ]}
});
assert.deepEqual(changed.mechanic.changes[0].cost,['Blood']);
assert.equal(changed.mechanic.changes[1].token,'Nin');

function state(){
  return rules.createState([
    {id:'a',side:'A',hp:100,maxHp:100,chakra:{Blood:5,Gen:5,Nin:5,Tai:5,Rand:0}},
    {id:'ally',side:'A',hp:100,maxHp:100,chakra:{Blood:0,Gen:0,Nin:0,Tai:0,Rand:0}},
    {id:'b',side:'B',hp:100,maxHp:100,chakra:{Blood:5,Gen:5,Nin:5,Tai:5,Rand:0}}
  ],{seed:7});
}
function use(s,actor,skill,target){
  const r=rules.resolveSkill(s,actor,skill,target,{payCost:false});
  assert.equal(r.ok,true,JSON.stringify(r));
  return r;
}
{
  const s=state();
  const skill=adapter.adaptTechnique({...base,id:'reflect-skill',mechanics:[],effect:{...base.effect,engineEffects:[{type:'reflect',target:'self',ratio:.5,duration:2,durationUnit:'ownerPhases'}]}});
  use(s,'a',skill,'a');
  const hit=adapter.adaptTechnique({...base,id:'hit',mechanics:[{op:'damage',amount:20,target:'primary'}]});
  use(s,'b',hit,'a');
  assert.equal(rules.getFighter(s,'a').hp,80);
  assert.equal(rules.getFighter(s,'b').hp,90,'reflect 50% deve devolver 10');
}
{
  const s=state();
  const skill=adapter.adaptTechnique({...base,id:'redirect-skill',mechanics:[],effect:{...base.effect,engineEffects:[{type:'redirect',target:'ally',duration:2,durationUnit:'ownerPhases'}]}});
  use(s,'a',skill,'ally');
  const hit=adapter.adaptTechnique({...base,id:'hit2',mechanics:[{op:'damage',amount:20,target:'primary'}]});
  use(s,'b',hit,'ally');
  assert.equal(rules.getFighter(s,'ally').hp,100);
  assert.equal(rules.getFighter(s,'a').hp,80,'redirect deve transferir dano ao protetor/source');
}
{
  const s=state();
  const bomb=adapter.adaptTechnique({...base,id:'bomb-skill',mechanics:[],effect:{...base.effect,engineEffects:[{type:'bomb',target:'enemy',duration:1,durationUnit:'ownerPhases',effects:[{type:'damage',amount:7,variance:0}]}]}});
  use(s,'a',bomb,'b');
  rules.endPhase(s,'B');
  assert.equal(rules.getFighter(s,'b').hp,93,'bomb deve detonar ao expirar');
}
{
  const s=state();
  const channel=adapter.adaptTechnique({...base,id:'channel-skill',mechanics:[],effect:{...base.effect,engineEffects:[{type:'channel',target:'enemy',duration:2,durationUnit:'ownerPhases',tickEffects:[{type:'damage',amount:3,variance:0}],endEffects:[{type:'damage',amount:5,variance:0}]}]}});
  use(s,'a',channel,'b');
  rules.endPhase(s,'B');
  assert.equal(rules.getFighter(s,'b').hp,97);
  rules.endPhase(s,'B');
  assert.equal(rules.getFighter(s,'b').hp,89,'channel deve aplicar 2 ticks + efeito final');
}
{
  const s=state();
  const sacrifice=adapter.adaptTechnique({...base,id:'sacrifice-skill',mechanics:[],effect:{...base.effect,engineEffects:[{type:'sacrifice',target:'self',amount:10,minHp:1}]}});
  use(s,'a',sacrifice,'a');
  assert.equal(rules.getFighter(s,'a').hp,90);
}
{
  const s=state();
  const channel=adapter.adaptTechnique({...base,id:'channel-skill',mechanics:[],effect:{...base.effect,engineEffects:[{type:'channel',target:'enemy',skillId:'channel-skill',duration:3,durationUnit:'ownerPhases',tickEffects:[{type:'damage',amount:3,variance:0}]}]}});
  use(s,'a',channel,'b');
  assert.equal(rules.getFighter(s,'b').channels.length,1);
  const interrupt=adapter.adaptTechnique({...base,id:'interrupt-skill',mechanics:[],effect:{...base.effect,engineEffects:[{type:'interrupt',target:'enemy',skillId:'channel-skill'}]}});
  use(s,'a',interrupt,'b');
  assert.equal(rules.getFighter(s,'b').channels.length,0);
}
{
  const s=state();
  const req=adapter.adaptTechnique({...base,id:'req-skill',cooldown:0,mechanics:[],effect:{...base.effect,engineRequirements:{type:'statusPresent',status:'setup'},engineCharges:2,engineEffects:[{type:'damage',target:'enemy',amount:10,variance:0}]}});
  assert.equal(rules.canUseSkill(s,'a',req,'b').ok,false);
  rules.applyEffect(s,rules.getFighter(s,'a'),rules.getFighter(s,'a'),{type:'status',status:'setup',duration:2,durationUnit:'ownerPhases'});
  assert.equal(rules.canUseSkill(s,'a',req,'b').ok,true);
  use(s,'a',req,'b');
  use(s,'a',req,'b');
  assert.equal(rules.canUseSkill(s,'a',req,'b').reason,'NO_CHARGES');
}
{
  const s=state();
  rules.applyEffect(s,rules.getFighter(s,'a'),rules.getFighter(s,'a'),{type:'status',status:'form:test',duration:2,durationUnit:'ownerPhases'});
  const skill=adapter.adaptTechnique({...base,id:'change-skill',chakraCost:['NIN'],mechanics:[{op:'damage',amount:5,target:'primary'}],effect:{...base.effect,engineChanges:[{type:'setCost',cost:['TAI'],requirements:{type:'statusPresent',status:'form:test'}}]}});
  const gate=rules.canUseSkill(s,'a',skill,'b');
  assert.equal(gate.ok,true);
  assert.deepEqual(gate.cost,['Tai']);
}

assert.throws(()=>adapter.validateEngineEffects([{type:'noop'}]),/UNSUPPORTED_ENGINE_EFFECT/);
assert.throws(()=>adapter.validateEngineEffects([{type:'made-up'}]),/UNSUPPORTED_ENGINE_EFFECT/);
assert.throws(()=>adapter.validateEngineEffects([{type:'damage',target:'source',amount:1}]),/INVALID_ENGINE_TARGET/);
assert.throws(()=>adapter.validateEngineEffects([{type:'reflect',target:'self',ratio:2}]),/INVALID_ENGINE_REFLECT_RATIO/);
assert.throws(()=>adapter.validateEngineChanges([{type:'made-up'}]),/UNSUPPORTED_ENGINE_CHANGE/);
assert.throws(()=>adapter.validateEngineChanges([{type:'setTarget',target:'primary'}]),/INVALID_ENGINE_CHANGE_TARGET/);
assert.throws(()=>adapter.adaptTechnique({...base,effect:{...base.effect,engineCharges:-1}}),/INVALID_ENGINE_CHARGES/);

const audited=adapter.auditTechnique(extendedSource);
assert.equal(audited.ok,true);
assert.equal(audited.engineEffectCount,6);
assert.equal(audited.engineChangeCount,1);

console.log(JSON.stringify({
  ok:true,
  engineEffectTypes:adapter.ENGINE_EFFECT_TYPES.length,
  engineChangeTypes:adapter.ENGINE_CHANGE_TYPES.length,
  runtimeCases:7,
  compatibility:true
}));
