'use strict';
const assert=require('node:assert/strict');
const adapter=require('../combat-content-adapter-v2.js');
const rules=require('../combat-rules-v2.js');

function makeState(hp=100){
  return rules.createState([
    {id:'sasuke',side:'A',hp,maxHp:100,chakra:{Blood:2,Gen:0,Nin:0,Tai:0,Rand:0}},
    {id:'enemy',side:'B',hp:100,maxHp:100,chakra:{Blood:0,Gen:0,Nin:2,Tai:0,Rand:0}}
  ],{seed:27});
}

const curseMarkSource={
  id:'curse-mark-sasuke__base_3',
  name:'Curse Mark',
  description:'Sasuke sacrifices 20 health and becomes invulnerable for 1 turn.',
  tags:['Mental','Ranged'],
  chakraCost:['KEK'],
  cooldown:1,
  target:'self',
  mechanics:[],
  effect:{
    engineEffects:[
      {type:'sacrifice',target:'self',amount:20,minHp:1},
      {type:'invulnerable',target:'self',classes:['all'],duration:1,durationUnit:'opponentPhases'}
    ]
  }
};

const curseMark=adapter.adaptTechnique(curseMarkSource);
assert.deepEqual(curseMark.cost,['Blood']);
assert.equal(curseMark.cooldown,1);
assert.equal(curseMark.mechanic.target,'self');
assert.deepEqual(curseMark.mechanic.effects.map(x=>x.type),['sacrifice','invulnerable']);
assert.equal(curseMark.mechanic.effects.length,2,'Curse Mark não pode manter shield/buff/cleanse legado');

const hit=adapter.adaptTechnique({
  id:'test-hit',name:'Test Hit',tags:['Physical'],chakraCost:[],cooldown:0,target:'enemy',
  mechanics:[{op:'damage',amount:20,target:'primary'}],effect:{kind:'damage',power:20,duration:0,aoe:false}
});

{
  const s=makeState(100);
  const used=rules.resolveSkill(s,'sasuke',curseMark,'sasuke');
  assert.equal(used.ok,true,JSON.stringify(used));
  assert.equal(rules.getFighter(s,'sasuke').hp,80,'Curse Mark deve sacrificar 20 HP');
  assert.equal(rules.getFighter(s,'sasuke').chakra.Blood,1,'Curse Mark deve consumir 1 Blood');
  assert.equal(rules.getFighter(s,'sasuke').cooldowns[curseMark.id],1,'Curse Mark deve aplicar cooldown 1');
  assert.equal(rules.statusActive(rules.getFighter(s,'sasuke'),'invulnerable').length,1);

  rules.endPhase(s,'A');
  assert.equal(rules.statusActive(rules.getFighter(s,'sasuke'),'invulnerable').length,1,'invulnerabilidade não deve expirar no fim do turno do usuário');
  const blocked=rules.resolveSkill(s,'enemy',hit,'sasuke',{payCost:false});
  assert.equal(blocked.ok,true);
  assert.equal(rules.getFighter(s,'sasuke').hp,80,'invulnerabilidade deve bloquear dano durante o turno adversário');

  rules.endPhase(s,'B');
  assert.equal(rules.statusActive(rules.getFighter(s,'sasuke'),'invulnerable').length,0,'invulnerabilidade deve expirar após 1 turno adversário');
  const after=rules.resolveSkill(s,'enemy',hit,'sasuke',{payCost:false});
  assert.equal(after.ok,true);
  assert.equal(rules.getFighter(s,'sasuke').hp,60,'dano deve voltar a entrar após expiração');
}

{
  const s=makeState(10);
  const used=rules.resolveSkill(s,'sasuke',curseMark,'sasuke');
  assert.equal(used.ok,true,JSON.stringify(used));
  assert.equal(rules.getFighter(s,'sasuke').hp,1,'sacrifício deve respeitar mínimo canônico de 1 HP');
}

console.log(JSON.stringify({ok:true,target:'curse-mark-sasuke__base_3',cost:'Blood',sacrifice:20,minHp:1,invulnerableTurns:1,durationUnit:'opponentPhases',cooldown:1}));
