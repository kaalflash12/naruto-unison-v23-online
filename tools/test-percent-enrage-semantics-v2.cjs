'use strict';
const assert=require('node:assert/strict');
const adapter=require('../combat-content-adapter-v2.js');
const rules=require('../combat-rules-v2.js');

function state(){
  return rules.createState([
    {id:'guy',side:'A',hp:100,maxHp:100,chakra:{Blood:0,Gen:0,Nin:0,Tai:2,Rand:0}},
    {id:'enemy',side:'B',hp:100,maxHp:100,chakra:{Blood:0,Gen:0,Nin:3,Tai:0,Rand:0}}
  ],{seed:29});
}

const battleStance=adapter.adaptTechnique({
  id:'eight-gates-guy-(s)__base_2',
  name:'Battle Stance',
  description:'Next turn, Guy deals double damage and ignores harmful non-damaging status effects. Guy loses 10 health down to a minimum of 1.',
  classes:['Physical','Unremovable'],
  chakraCost:['TAI'],
  cooldown:2,
  target:'self',
  mechanics:[],
  effect:{engineEffects:[
    {type:'enrage',target:'self',duration:2,durationUnit:'ownerPhases'},
    {type:'strengthen',target:'self',classes:['all'],amount:100,amountMode:'percent',duration:2,durationUnit:'ownerPhases'},
    {type:'sacrifice',target:'self',amount:10,minHp:1}
  ]}
});

assert.deepEqual(battleStance.cost,['Tai']);
assert.equal(battleStance.cooldown,2);
assert.equal(battleStance.mechanic.target,'self');
assert.deepEqual(battleStance.mechanic.effects.map(x=>x.type),['enrage','strengthen','sacrifice']);

const hit=adapter.adaptTechnique({
  id:'hit',name:'Hit',classes:['Physical'],chakraCost:[],cooldown:0,target:'enemy',mechanics:[],
  effect:{engineEffects:[{type:'damage',target:'enemy',amount:10,variance:0}]}
});
const stun=adapter.adaptTechnique({
  id:'stun',name:'Stun',classes:['Mental'],chakraCost:[],cooldown:0,target:'enemy',mechanics:[],
  effect:{engineEffects:[{type:'stun',target:'enemy',classes:['all'],duration:1,durationUnit:'ownerPhases'}]}
});
const seal=adapter.adaptTechnique({
  id:'seal',name:'Seal',classes:['Mental'],chakraCost:[],cooldown:0,target:'enemy',mechanics:[],
  effect:{engineEffects:[{type:'seal',target:'enemy',classes:['all'],duration:1,durationUnit:'ownerPhases'}]}
});

// Main Battle Stance behavior: sacrifice, anti-harm, damage bypass, next-turn double damage, expiry.
{
  const s=state();
  const used=rules.resolveSkill(s,'guy',battleStance,'guy');
  assert.equal(used.ok,true,JSON.stringify(used));
  assert.equal(rules.getFighter(s,'guy').hp,90,'Battle Stance deve sacrificar 10 HP');
  assert.equal(rules.getFighter(s,'guy').chakra.Tai,1,'Battle Stance deve consumir 1 Tai');
  assert.equal(rules.statusActive(rules.getFighter(s,'guy'),'enrage').length,1);
  assert.equal(rules.statusActive(rules.getFighter(s,'guy'),'strengthen').length,1);

  rules.endPhase(s,'A');
  assert.equal(rules.statusActive(rules.getFighter(s,'guy'),'enrage')[0].duration,1,'efeito deve sobreviver até o próximo turno de Guy');

  const blocked=rules.resolveSkill(s,'enemy',stun,'guy',{payCost:false});
  assert.equal(blocked.ok,true);
  assert.equal(rules.statusActive(rules.getFighter(s,'guy'),'stun').length,0,'Enrage deve ignorar Stun nocivo');
  assert.equal(blocked.results[0].effect.blocked,'enrage');

  const incoming=rules.resolveSkill(s,'enemy',hit,'guy',{payCost:false});
  assert.equal(incoming.ok,true);
  assert.equal(rules.getFighter(s,'guy').hp,80,'Enrage não deve bloquear dano');

  rules.endPhase(s,'B');
  const doubled=rules.resolveSkill(s,'guy',hit,'enemy',{payCost:false});
  assert.equal(doubled.ok,true,JSON.stringify(doubled));
  assert.equal(rules.getFighter(s,'enemy').hp,80,'Strengthen Percent 100 deve dobrar 10 para 20');

  rules.endPhase(s,'A');
  assert.equal(rules.statusActive(rules.getFighter(s,'guy'),'enrage').length,0);
  assert.equal(rules.statusActive(rules.getFighter(s,'guy'),'strengthen').length,0);
  const normal=rules.resolveSkill(s,'guy',hit,'enemy',{payCost:false});
  assert.equal(normal.ok,true);
  assert.equal(rules.getFighter(s,'enemy').hp,70,'depois da expiração, dano deve voltar a 10');
}

// Upstream Enrage explicitly allows Seal to pass. Keep this isolated because Seal itself suppresses helpful effects upstream.
{
  const s=state();
  const used=rules.resolveSkill(s,'guy',battleStance,'guy');
  assert.equal(used.ok,true);
  rules.endPhase(s,'A');
  const bypass=rules.resolveSkill(s,'enemy',seal,'guy',{payCost:false});
  assert.equal(bypass.ok,true);
  assert.equal(rules.statusActive(rules.getFighter(s,'guy'),'seal').length,1,'Seal deve atravessar Enrage como no upstream');
}

{
  const s=state();
  rules.getFighter(s,'guy').hp=5;
  const used=rules.resolveSkill(s,'guy',battleStance,'guy');
  assert.equal(used.ok,true);
  assert.equal(rules.getFighter(s,'guy').hp,1,'sacrifício deve respeitar mínimo de 1 HP');
}

console.log(JSON.stringify({ok:true,percentStrengthen:true,enrageBlocksHarmfulNonDamage:true,enrageBypass:['damage','seal'],battleStance:true}));
