'use strict';
const assert=require('node:assert/strict');
const adapter=require('../combat-content-adapter-v2.js');
const rules=require('../combat-rules-v2.js');

function state(){
  return rules.createState([
    {id:'source',side:'A',hp:100,maxHp:100,chakra:{Blood:0,Gen:2,Nin:0,Tai:2,Rand:0}},
    {id:'target',side:'B',hp:100,maxHp:100,chakra:{Blood:0,Gen:0,Nin:0,Tai:0,Rand:0}}
  ],{seed:31});
}
function source(s){return rules.getFighter(s,'source')}
function target(s){return rules.getFighter(s,'target')}
function addReduction(s,amount=20){rules.applyEffect(s,target(s),target(s),{type:'reduction',target:'self',amount,classes:['all'],duration:'permanent'});}
function addDefense(s,amount=30){rules.applyEffect(s,target(s),target(s),{type:'defense',target:'self',amount,classes:['all'],duration:'permanent',destructible:true});}
function addWeaken(s,amount=10){rules.applyEffect(s,target(s),source(s),{type:'weaken',target:'self',amount,classes:['all'],duration:'permanent'});}
function addStrengthen(s,amount=10){rules.applyEffect(s,source(s),source(s),{type:'strengthen',target:'self',amount,classes:['all'],duration:'permanent'});}

// Piercing ignores damage reduction, but destructible defense still absorbs it.
{
  const s=state();addReduction(s,20);addDefense(s,30);
  const r=rules.applyDamage(s,source(s),target(s),{type:'damage',amount:50,damageClass:'piercing',classes:['physical'],variance:0});
  assert.equal(r.raw,50,'piercing não deve sofrer redução de dano');
  assert.equal(r.absorbed,30,'piercing deve atingir defesa destrutível antes do HP');
  assert.equal(r.dealt,20);
  assert.equal(target(s).hp,80);
}

// Affliction ignores target reduction, source weakening, and destructible defense.
{
  const s=state();addReduction(s,20);addDefense(s,30);addWeaken(s,10);
  const r=rules.applyDamage(s,source(s),target(s),{type:'damage',amount:50,damageClass:'affliction',classes:['bane'],variance:0});
  assert.equal(r.raw,50,'affliction não deve sofrer Weaken nem redução');
  assert.equal(r.absorbed,0,'affliction deve ignorar defesa destrutível');
  assert.equal(r.dealt,50);
  assert.equal(target(s).hp,50);
  assert.equal(target(s).defense[0].amount,30,'defesa não deve ser consumida por affliction');
}

// Strengthening still increases affliction damage.
{
  const s=state();addStrengthen(s,10);
  const r=rules.applyDamage(s,source(s),target(s),{type:'damage',amount:50,damageClass:'affliction',classes:['bane'],variance:0});
  assert.equal(r.raw,60);
  assert.equal(r.dealt,60);
  assert.equal(target(s).hp,40);
}

const reaper=adapter.adaptTechnique({
  id:'yondaime-minato__base_3',
  name:'Reaper Death Seal',
  description:"Minato unleashes the God of Death upon an enemy in exchange for a piece of his soul, sacrificing 15 health to deal 25 affliction damage and weaken the target's damage by 5.",
  classes:['Melee'],chakraCost:['Q','Q'],cooldown:0,target:'enemy',mechanics:[],
  effect:{engineEffects:[
    {type:'damage',target:'enemy',amount:25,damageClass:'affliction',variance:0},
    {type:'weaken',target:'enemy',amount:5,classes:['all'],duration:'permanent',durationUnit:'rounds'},
    {type:'sacrifice',target:'self',amount:15,minHp:1}
  ]}
});
assert.deepEqual(reaper.cost,['Rand','Rand']);
assert.equal(reaper.cooldown,0);
assert.deepEqual(reaper.mechanic.effects.map(x=>x.type),['damage','weaken','sacrifice']);

{
  const s=state();addReduction(s,20);addDefense(s,30);addWeaken(s,10);
  const used=rules.resolveSkill(s,'source',reaper,'target');
  assert.equal(used.ok,true,JSON.stringify(used));
  assert.equal(target(s).hp,75,'Reaper Death Seal deve causar 25 affliction apesar de redução/defesa/Weaken do usuário');
  assert.equal(source(s).hp,85,'Reaper Death Seal deve sacrificar 15 HP');
  assert.equal(rules.statusActive(target(s),'weaken').some(x=>x.duration==='permanent'&&x.amount===5),true,'Weaken 5 deve ser permanente');
  const remaining=Object.entries(source(s).chakra).filter(([k])=>k!=='Rand').reduce((n,[,v])=>n+Number(v||0),0);
  assert.equal(remaining,2,'custo Q+Q deve consumir dois chakras arbitrários');
}

console.log(JSON.stringify({ok:true,piercingIgnoresReduction:true,piercingUsesDefense:true,afflictionIgnoresReduction:true,afflictionIgnoresWeaken:true,afflictionBypassesDefense:true,reaperDeathSeal:true}));
