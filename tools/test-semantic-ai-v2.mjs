import assert from 'node:assert/strict';
import * as ai from './semantic-ai-v2.mjs';

const fighter=(id,side,hp=100,extra={})=>({id,side,hp,maxHp:100,statuses:[],dots:[],defense:[],cooldowns:{},skillCharges:{},alternates:{},stacks:{},chakra:{Blood:2,Gen:2,Nin:2,Tai:2},metadata:{skills:[]},...extra});
const actor=fighter('a','A'),ally=fighter('ally','A',30),allyHealthy=fighter('healthy','A',95);
const enemyLow=fighter('low','B',20),enemyHigh=fighter('high','B',90),enemyBuffed=fighter('buffed','B',70,{statuses:[{type:'strengthen',duration:2,positive:true}],defense:[{amount:20}]});
const own=[actor,ally,allyHealthy],other=[enemyLow,enemyHigh,enemyBuffed];
const skill=(id,target,effects,cost=[],cooldown=0,extra={})=>({id,name:id,cost,cooldown,mechanic:{version:2,target,effects},...extra});
const state={history:[]};

assert.ok(ai.effectValue({type:'status',status:'vulnerable',value:.5,duration:2})>0,'vulnerable sem valor');
assert.ok(ai.effectValue({type:'status',status:'evasion',value:.4,duration:2})>0,'evasion sem valor');
assert.ok(ai.effectValue({type:'status',status:'counter',value:.4,duration:2})>0,'counter sem valor');
assert.ok(ai.effectValue({type:'status',status:'regen',value:8,duration:2})>0,'regen sem valor');

const damage=skill('damage','enemy',[{type:'damage',amount:30}]);
assert.equal(ai.chooseTarget({state,actor,own,other,skill:damage,policy:'aggressive'}).id,'low','dano deve preferir alvo finalizável');

const heal=skill('heal','ally',[{type:'heal',amount:35}]);
assert.equal(ai.chooseTarget({state,actor,own,other,skill:heal,policy:'balanced'}).id,'ally','cura deve escolher maior vida faltante');

const shield=skill('shield','ally',[{type:'defense',amount:25,duration:2}]);
assert.equal(ai.chooseTarget({state,actor,own,other,skill:shield,policy:'balanced'}).id,'ally','shield deve priorizar aliado vulnerável');

const cleanse=skill('cleanse','ally',[{type:'cleanse',count:2}]);
assert.ok(ai.skillScore({state,actor,own,other,skill:cleanse,target:ally})<5,'cleanse sem debuff não deve dominar');
ally.statuses.push({type:'poison',duration:2,negative:true});ally.dots.push({status:'poison',duration:2,amount:5});
assert.equal(ai.chooseTarget({state,actor,own,other,skill:cleanse,policy:'balanced'}).id,'ally','cleanse deve mirar debuff');
assert.ok(ai.skillScore({state,actor,own,other,skill:cleanse,target:ally})>20,'cleanse contextual subavaliado');

const dispel=skill('dispel','enemy',[{type:'dispel',count:2}]);
assert.equal(ai.chooseTarget({state,actor,own,other,skill:dispel,policy:'balanced'}).id,'buffed','dispel deve mirar benefícios');

actor.cooldowns={x:3,y:1};
const cd=skill('cooldown','self',[{type:'cooldown',amount:-1}]);
assert.ok(ai.skillScore({state,actor,own,other,skill:cd,target:actor})>10,'redução de cooldown ativa subavaliada');
actor.cooldowns={x:0,y:0};
assert.ok(ai.skillScore({state,actor,own,other,skill:cd,target:actor})<5,'redução de cooldown sem recarga deve ser baixa');

const markName='wind-cut';
const mark=skill('mark','enemy',[{type:'status',status:markName,duration:2,mark:true}]);
const conditional=skill('conditional','enemy',[{type:'damage',amount:20},{type:'damage',amount:15,conditionalBonus:true,requirements:{type:'statusPresent',target:'target',status:markName}}]);
actor.metadata.skills=[mark,conditional];
const before=ai.skillScore({state,actor,own,other,skill:conditional,target:enemyHigh});
enemyHigh.statuses.push({type:markName,duration:2,negative:true});
const after=ai.skillScore({state,actor,own,other,skill:conditional,target:enemyHigh});
assert.ok(after>before+10,'mark→bonusIf não alterou decisão');
assert.ok(ai.skillScore({state,actor,own,other,skill:mark,target:enemyLow})>10,'setup/mark sem valor de combo');

const execute=skill('execute','enemy',[{type:'damage',amount:30,execute:true,requirements:{type:'hpBelow',target:'target',ratio:.25}}]);
assert.equal(ai.effectValue(execute.mechanic.effects[0],{state,actor,target:enemyHigh,skill:execute}),0,'execute não deve valer acima do limiar');
assert.ok(ai.effectValue(execute.mechanic.effects[0],{state,actor,target:enemyLow,skill:execute})>=30,'execute deve valer abaixo do limiar');

const aoe=skill('aoe','enemies',[{type:'damage',amount:20}]);
const oneEnemy=[fighter('one','B',100)];
assert.ok(ai.skillScore({state,actor,own,other,skill:aoe})>ai.skillScore({state,actor,own,other:oneEnemy,skill:aoe})*2,'AoE deve valorar alvos vivos reais');

const form='form:sage-mode';
const formDependent=skill('sage-hit','enemy',[{type:'damage',amount:45,requirements:{type:'statusPresent',status:form}}]);
assert.equal(ai.skillScore({state,actor,own,other,skill:formDependent,target:enemyHigh}),0,'técnica dependente não deve valer sem transformação');
actor.statuses.push({type:form,duration:2,positive:true});
assert.ok(ai.skillScore({state,actor,own,other,skill:formDependent,target:enemyHigh})>=45,'transformação não habilitou técnica dependente');

const prevDependent=skill('followup','enemy',[{type:'damage',amount:25,requirements:{type:'previousSkill',skillId:'starter'}}]);
assert.equal(ai.skillScore({state,actor,own,other,skill:prevDependent,target:enemyHigh}),0,'previousSkill aceito sem histórico');
state.history.push({actorId:'a',skillId:'starter'});
assert.ok(ai.skillScore({state,actor,own,other,skill:prevDependent,target:enemyHigh})>=25,'previousSkill válido não reconhecido');

const combo=skill('combo','enemy',[{type:'damage',amount:25,requirements:{type:'consecutiveUses',count:2}}]);
assert.equal(ai.skillScore({state:{history:[]},actor,own,other,skill:combo,target:enemyHigh}),0,'consecutiveUses aceito sem uso prévio');
assert.ok(ai.skillScore({state:{history:[{actorId:'a',skillId:'combo'}]},actor,own,other,skill:combo,target:enemyHigh})>=25,'consecutiveUses válido não reconhecido');

const charged=skill('charged','enemy',[{type:'damage',amount:25,requirements:{type:'chargeAtLeast',amount:2}}],[],0,{charges:3});
actor.skillCharges.charged=1;
assert.equal(ai.skillScore({state,actor,own,other,skill:charged,target:enemyHigh}),0,'chargeAtLeast ignorou carga insuficiente');
actor.skillCharges.charged=2;
assert.ok(ai.skillScore({state,actor,own,other,skill:charged,target:enemyHigh})>=25,'chargeAtLeast válido não reconhecido');

console.log(JSON.stringify({ok:true,cases:22,semanticAI:'state-aware-context-v2'}));
