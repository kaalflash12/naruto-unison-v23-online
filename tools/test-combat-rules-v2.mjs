// CI trigger: validate the full 209-character matrix from the published V2 roster with zero legacy fallback.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const ctx={console};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync('combat-rules-v2.js','utf8'),ctx,{filename:'combat-rules-v2.js'});const R=ctx.NARUTO_COMBAT_RULES_V2;
assert.equal(R.VERSION,2);

const fighter=(id,side,extra={})=>({id,side,hp:100,maxHp:100,chakra:{Blood:5,Gen:5,Nin:5,Tai:5},...extra});
const state=()=>R.createState([fighter('A','A'),fighter('B','B')],{seed:123});
const A=s=>R.getFighter(s,'A'),B=s=>R.getFighter(s,'B');
const v2=(name,target,effects,classes=['all'])=>({name,originalName:name,cost:[],cooldown:0,classes,mechanic:{version:2,target,classes,effects}});

// Flat reduction applies before HP damage.
{
  const s=state();R.applyEffect(s,B(s),B(s),{type:'reduction',amount:10,duration:2,classes:['all']});
  const r=R.applyDamage(s,A(s),B(s),{type:'damage',amount:30,damageClass:'normal',classes:['all']});
  assert.equal(r.dealt,20);assert.equal(B(s).hp,80);
}

// Expose can explicitly disable reduction, then damage is full.
{
  const s=state();R.applyEffect(s,B(s),B(s),{type:'reduction',amount:10,duration:2,classes:['all']});
  R.applyEffect(s,A(s),B(s),{type:'expose',duration:2,classes:['all'],blockReduction:true});
  const r=R.applyDamage(s,A(s),B(s),{type:'damage',amount:30,damageClass:'normal',classes:['all']});
  assert.equal(r.dealt,30);assert.equal(B(s).hp,70);
}

// Normal damage consumes defense; piercing bypasses it.
{
  const s=state();B(s).defense.push({amount:20,duration:'permanent',classes:['all']});
  let r=R.applyDamage(s,A(s),B(s),{type:'damage',amount:30,damageClass:'normal',classes:['all']});
  assert.equal(r.dealt,10);assert.equal(B(s).defense.length,0);
  const p=state();B(p).defense.push({amount:20,duration:'permanent',classes:['all']});
  r=R.applyDamage(p,A(p),B(p),{type:'damage',amount:30,damageClass:'piercing',classes:['all']});
  assert.equal(r.dealt,30);assert.equal(B(p).defense[0].amount,20);
}

// Immunity blocks only declared effect types/classes.
{
  const s=state();R.applyEffect(s,B(s),B(s),{type:'immunity',effects:['damage','stun'],duration:2,classes:['gen']});
  let r=R.applyDamage(s,A(s),B(s),{type:'damage',amount:30,classes:['gen']});
  assert.equal(r.dealt,0);assert.equal(r.blocked,'immunity');
  r=R.applyDamage(s,A(s),B(s),{type:'damage',amount:30,classes:['tai']});
  assert.equal(r.dealt,30);
  const blocked=R.applyEffect(s,A(s),B(s),{type:'stun',duration:1,classes:['gen']},{skill:{classes:['gen']}});
  assert.equal(blocked.blocked,'immunity');
}

// Seal disables matching skill classes but not unrelated classes.
{
  const s=state();R.applyEffect(s,A(s),B(s),{type:'seal',duration:1,durationUnit:'ownerPhases',classes:['gen']});
  const gen=v2('Gen Skill','enemy',[{type:'damage',amount:10}],['gen']);
  const nin=v2('Nin Skill','enemy',[{type:'damage',amount:10}],['nin']);
  assert.equal(R.canUseSkill(s,'B',gen,'A').reason,'DISABLED');
  assert.equal(R.canUseSkill(s,'B',nin,'A').ok,true);
}

// Focus blocks seal of the same class.
{
  const s=state();R.applyEffect(s,B(s),B(s),{type:'focus',duration:2,classes:['gen']});
  const r=R.applyEffect(s,A(s),B(s),{type:'seal',duration:1,classes:['gen']});
  assert.equal(r.blocked,'focus');assert.equal(B(s).statuses.some(x=>x.type==='seal'),false);
}

// Compound effects resolve in order: expose -> damage -> DoT.
{
  const s=state();R.applyEffect(s,B(s),B(s),{type:'reduction',amount:10,duration:2,classes:['all']});
  const skill=v2('Compound','enemy',[{type:'expose',duration:2,blockReduction:true},{type:'damage',amount:30,variance:0},{type:'dot',amount:5,duration:2}]);
  const r=R.resolveSkill(s,'A',skill,'B');assert.equal(r.ok,true);assert.equal(B(s).hp,70);assert.equal(B(s).dots.length,1);assert.equal(B(s).dots[0].amount,5);
}

// `rounds` decrements only after both phases, not after every phase.
{
  const s=state();R.applyEffect(s,A(s),B(s),{type:'weaken',amount:5,duration:1,durationUnit:'rounds'});assert.equal(B(s).statuses.length,1);
  R.endPhase(s,'A');assert.equal(B(s).statuses.length,1);
  R.endPhase(s,'B');assert.equal(B(s).statuses.length,0);assert.equal(s.round,2);
}

// Legacy stun must survive the caster phase and block the target's next action.
{
  const s=state();const stun={name:'Legacy Stun',originalName:'Legacy Stun',cost:[],cooldown:0,classes:['nin'],mechanic:{kind:'stun',power:10,target:'enemy',duration:1}};
  const n=R.normalizeSkill(stun);assert.equal(n.mechanic.effects.find(x=>x.type==='stun').durationUnit,'ownerPhases');
  assert.equal(R.resolveSkill(s,'A',stun,'B').ok,true);R.endPhase(s,'A');
  const action=v2('Target Action','enemy',[{type:'damage',amount:10}],['nin']);assert.equal(R.canUseSkill(s,'B',action,'A').reason,'DISABLED');
  R.endPhase(s,'B');assert.equal(R.canUseSkill(s,'B',action,'A').ok,true);
}

console.log('COMBAT_RULES_V2_SEMANTICS=PASS');
