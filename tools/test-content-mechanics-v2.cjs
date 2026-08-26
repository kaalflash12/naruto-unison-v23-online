'use strict';
const assert=require('node:assert/strict');
const adapter=require('../combat-content-adapter-v2.js');
const rules=require('../combat-rules-v2.js');

const EXPECTED_OPS=['buff','chakra-drain','chakra-gain','cleanse','cooldown','damage','debuff','dispel','drain','execute','heal','mark','multi-hit','shield','status'];
assert.deepEqual(adapter.OPS,EXPECTED_OPS,'lista canônica de 15 ops mudou');
assert.deepEqual(adapter.costTokens(['GEN','NIN','TAI','KEK','Q']),['Gen','Nin','Tai','Blood','Rand'],'mapa de chakra divergente');
assert.deepEqual(adapter.splitTotal(34,3),[12,11,11],'multi-hit deve preservar dano total');
assert.equal(adapter.splitTotal(34,3).reduce((a,b)=>a+b,0),34);

const fixtures={
  buff:{op:'buff',stat:'attack',amount:5,turns:2,target:'self'},
  'chakra-drain':{op:'chakra-drain',amount:2,target:'primary'},
  'chakra-gain':{op:'chakra-gain',amount:2,target:'self'},
  cleanse:{op:'cleanse',count:1,target:'self'},
  cooldown:{op:'cooldown',amount:-1,target:'self'},
  damage:{op:'damage',amount:30,target:'primary'},
  debuff:{op:'debuff',stat:'defense',amount:4,turns:2,target:'primary'},
  dispel:{op:'dispel',count:1,target:'primary'},
  drain:{op:'drain',amount:20,ratio:.5,target:'primary'},
  execute:{op:'execute',amount:15,threshold:.22,target:'primary'},
  heal:{op:'heal',amount:20,target:'primary'},
  mark:{op:'mark',mark:'wind-cut',turns:2,target:'primary'},
  'multi-hit':{op:'multi-hit',amount:34,hits:3,target:'primary'},
  shield:{op:'shield',amount:20,turns:2,target:'self'},
  status:{op:'status',status:'stun',turns:1,target:'primary'}
};
for(const op of EXPECTED_OPS){
  const skill=adapter.adaptTechnique({id:'fx-'+op,name:op,chakraCost:[],cooldown:0,mechanics:[fixtures[op]]});
  assert.equal(skill.mechanic.version,2,op+' não virou V2');
  assert.ok(skill.mechanic.effects.length>0,op+' sem efeitos');
  assert.ok(skill.mechanic.effects.every(e=>e.type!=='noop'),op+' virou noop');
  assert.deepEqual(skill.mechanic.contentOps,[op]);
}

const conditional=adapter.adaptTechnique({id:'conditional',chakraCost:[],mechanics:[{op:'damage',amount:20,target:'primary',bonusIf:{targetHas:'wind-cut'},bonusMultiplier:1.5}]});
assert.equal(conditional.mechanic.effects.length,2);
assert.equal(conditional.mechanic.effects[1].amount,10);
assert.deepEqual(conditional.mechanic.effects[1].requirements,{type:'statusPresent',target:'target',status:'wind-cut'});

const execute=adapter.adaptTechnique({id:'execute',chakraCost:[],mechanics:[{op:'execute',amount:15,target:'primary',threshold:.22,ignoreShield:true}]});
assert.equal(execute.mechanic.effects[0].requirements.type,'hpBelow');
assert.equal(execute.mechanic.effects[0].requirements.ratio,.22);
assert.equal(execute.mechanic.effects[0].bypassDefense,true);

function state(hpB=100){return rules.createState([
  {id:'a',side:'A',hp:100,maxHp:100,chakra:{Blood:5,Gen:5,Nin:5,Tai:5,Rand:0}},
  {id:'ally',side:'A',hp:50,maxHp:100,chakra:{Blood:0,Gen:0,Nin:0,Tai:0,Rand:0}},
  {id:'b',side:'B',hp:hpB,maxHp:100,chakra:{Blood:2,Gen:2,Nin:2,Tai:2,Rand:0}}
],{seed:123});}
function use(s,skill,target='b'){const r=rules.resolveSkill(s,'a',skill,target,{payCost:false});assert.equal(r.ok,true,JSON.stringify(r));return r}

{
  const s=state();
  use(s,adapter.adaptTechnique({id:'dmg',chakraCost:[],mechanics:[{op:'damage',amount:30,target:'primary'}]}));
  assert.equal(rules.getFighter(s,'b').hp,70,'dano simples');
}
{
  const s=state();
  use(s,adapter.adaptTechnique({id:'mh',chakraCost:[],mechanics:[{op:'multi-hit',amount:34,hits:3,target:'primary'}]}));
  assert.equal(rules.getFighter(s,'b').hp,66,'multi-hit deve somar 34');
}
{
  const s=state();
  use(s,adapter.adaptTechnique({id:'shield',chakraCost:[],mechanics:[{op:'shield',amount:20,turns:2,target:'self'}]}),'a');
  assert.equal(rules.getFighter(s,'a').defense.reduce((n,x)=>n+x.amount,0),20,'escudo');
}
{
  const s=state();
  use(s,adapter.adaptTechnique({id:'heal',chakraCost:[],mechanics:[{op:'heal',amount:20,target:'primary'}]}),'ally');
  assert.equal(rules.getFighter(s,'ally').hp,70,'cura primária deve mirar aliado');
}
{
  const s=state();
  use(s,adapter.adaptTechnique({id:'mark',chakraCost:[],mechanics:[{op:'mark',mark:'wind-cut',turns:2,target:'primary'}]}));
  assert.ok(rules.getFighter(s,'b').statuses.some(x=>x.type==='wind-cut'),'mark não persistiu');
  use(s,conditional);
  assert.equal(rules.getFighter(s,'b').hp,70,'bonusIf targetHas deveria causar 20+10');
}
{
  const s=state(30);
  use(s,execute);
  assert.equal(rules.getFighter(s,'b').hp,30,'execute não deve ativar acima do limiar');
}
{
  const s=state(20);
  use(s,execute);
  assert.equal(rules.getFighter(s,'b').hp,5,'execute deve adicionar dano abaixo do limiar');
}
{
  const s=state();
  use(s,adapter.adaptTechnique({id:'gain',chakraCost:[],mechanics:[{op:'chakra-gain',amount:2,target:'self'}]}),'a');
  assert.equal(rules.getFighter(s,'a').chakra.Rand,2,'chakra gain');
  const before=Object.values(rules.getFighter(s,'b').chakra).reduce((a,b)=>a+b,0);
  use(s,adapter.adaptTechnique({id:'drain',chakraCost:[],mechanics:[{op:'chakra-drain',amount:2,target:'primary'}]}),'b');
  const after=Object.values(rules.getFighter(s,'b').chakra).reduce((a,b)=>a+b,0);
  assert.equal(before-after,2,'chakra drain');
}

assert.throws(()=>adapter.adaptTechnique({mechanics:[{op:'unknown-op'}]}),/UNSUPPORTED_CONTENT_OP/);
console.log(JSON.stringify({ok:true,adapterVersion:adapter.VERSION,rulesVersion:rules.VERSION,ops:adapter.OPS.length,runtimeCases:8}));
