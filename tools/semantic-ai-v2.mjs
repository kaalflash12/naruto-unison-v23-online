const NEGATIVE=new Set(['stun','disable','silence','seal','expose','exhaust','weaken','snare','throttle','taunt','alone','bind','bleed','blind','burn','chakra-lock','freeze','parasite','poison','shock','soaked','vulnerable','wind-cut']);
const POSITIVE=new Set(['invulnerable','immunity','focus','reduction','strengthen','endure','enrage','counter','evasion','regen']);
const CONTROL=new Set(['stun','disable','silence','seal']);
const OFFENSE=new Set(['damage','dot','leech','stun','disable','silence','seal','expose','weaken']);
const SUPPORT=new Set(['heal','defense','invulnerable','reduction','strengthen','cleanse','cure','chakra']);
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const alive=f=>Boolean(f&&num(f.hp)>0);
const activeStatuses=f=>arr(f?.statuses).filter(s=>num(s?.duration,1)!==0);
const statusPresent=(f,s)=>activeStatuses(f).some(x=>String(x.type||x.status)===String(s));
const defenseTotal=f=>arr(f?.defense).reduce((n,x)=>n+Math.max(0,num(x?.amount)),0);
const missingHp=f=>Math.max(0,num(f?.maxHp,100)-num(f?.hp,0));
const chakraTotal=f=>Object.values(f?.chakra||{}).reduce((n,x)=>n+Math.max(0,num(x)),0);
const cooldownLoad=f=>Object.values(f?.cooldowns||{}).reduce((n,x)=>n+Math.max(0,num(x)),0);
const positiveCount=f=>activeStatuses(f).filter(s=>s.positive===true||POSITIVE.has(String(s.type||s.status))).length+arr(f?.defense).filter(x=>num(x?.amount)>0).length;
const negativeCount=f=>activeStatuses(f).filter(s=>s.negative===true||NEGATIVE.has(String(s.type||s.status))).length+arr(f?.dots).filter(x=>num(x?.duration,1)!==0).length;
const historyFor=(state,actorId)=>arr(state?.history).filter(h=>String(h?.actorId)===String(actorId));
function consecutiveUses(state,actorId,skillId){const h=historyFor(state,actorId);let n=0;for(let i=h.length-1;i>=0;i--){if(String(h[i]?.skillId)===String(skillId))n++;else break}return n}
function chargeCount(actor,skill){if(skill?.charges==null)return Infinity;const key=String(skill.id||skill.name||'');return actor?.skillCharges?.[key]==null?Math.max(0,num(skill.charges)):Math.max(0,num(actor.skillCharges[key]))}

function requirementMet(req,actor,target,ctx={}){
  if(!req)return true;
  if(Array.isArray(req))return req.every(x=>requirementMet(x,actor,target,ctx));
  if(req.any)return arr(req.any).some(x=>requirementMet(x,actor,target,ctx));
  if(req.not)return !requirementMet(req.not,actor,target,ctx);
  const who=req.target==='target'?target:actor,state=ctx.state||null,skill=ctx.skill||null;
  switch(String(req.type||'')){
    case'statusPresent':return statusPresent(who,req.status);
    case'statusAbsent':return Boolean(who&&!statusPresent(who,req.status));
    case'hpBelow':return Boolean(who&&num(who.hp)/Math.max(1,num(who.maxHp,100))<num(req.ratio,.5));
    case'hpAtMost':return Boolean(who&&num(who.hp)<=num(req.amount));
    case'stackAtLeast':return num(who?.stacks?.[req.key])>=num(req.amount,1);
    case'stackAtMost':return num(who?.stacks?.[req.key])<=num(req.amount,0);
    case'alternateActive':return String(actor?.alternates?.[req.key])===String(req.value);
    case'chargeAtLeast':return chargeCount(actor,skill)>=num(req.amount,1);
    case'consecutiveUses':return Boolean(state&&skill&&consecutiveUses(state,actor?.id,skill.id)>=Math.max(0,num(req.count,1)-1));
    case'previousSkill':{const h=historyFor(state,actor?.id);return Boolean(h.length&&String(h[h.length-1]?.skillId)===String(req.skillId||req.name));}
    default:return false;
  }
}
function statusValue(e,d,a,{actor,target}={}){
  const s=String(e.status||'status').toLowerCase();
  const setup=e.mark===true||s.includes('mark')||s.includes('setup')||s.includes('read');
  if(setup){
    const followups=arr(actor?.metadata?.skills).filter(sk=>arr(sk?.mechanic?.effects).some(x=>x?.requirements?.type==='statusPresent'&&String(x.requirements.status)===s)).length;
    let value=Math.max(6,a)*d*.50+14*d+followups*10;
    if(target&&statusPresent(target,s))value*=.35;
    return value;
  }
  if(s==='vulnerable')return Math.max(14,a*100)*d*.70;
  if(s==='evasion')return Math.max(16,a*100)*d*.75;
  if(s==='counter')return Math.max(16,a*100)*d*.80;
  if(s==='regen')return Math.max(8,a)*d*.90;
  if(['stun','bind','freeze','chakra-lock','silence','blind'].includes(s))return 20*d;
  if(['poison','burn','bleed','shock','wind-cut','parasite'].includes(s))return Math.max(7,a)*d*.70;
  if(s==='soaked')return 10*d;
  if(s==='invuln')return 24*d;
  if(s.startsWith('form:'))return 18*d;
  let value=Math.max(6,a)*d*.50;
  if(target&&statusPresent(target,s))value*=.35;
  return value;
}
function effectValue(e,ctx={}){
  const t=String(e?.type||'noop'),raw=num(e?.amount,e?.value??0),a=Math.abs(raw),d=e?.duration==='permanent'?5:Math.max(1,num(e?.duration,1));
  const target=ctx.target||null,actor=ctx.actor||null;
  if(!requirementMet(e?.requirements,actor,target,ctx))return 0;
  if(t==='damage'){
    let v=a;
    if(target){const effectiveHp=Math.max(1,num(target.hp)+defenseTotal(target));if(a>=effectiveHp)v+=18;if(statusPresent(target,'vulnerable'))v*=1.15;}
    return v;
  }
  if(t==='dot')return a*d*.80;
  if(t==='heal')return target?Math.min(a,missingHp(target))*.95:a*.90;
  if(t==='leech')return a*1.40;
  if(t==='defense')return a*.75*(target&&defenseTotal(target)>35?.75:1);
  if(t==='invulnerable')return 24*d;
  if(CONTROL.has(t))return 22*d*(target&&activeStatuses(target).some(s=>CONTROL.has(String(s.type)))?.45:1);
  if(t==='reduction')return Math.max(8,a)*d*.70;
  if(t==='expose')return Math.max(12,a)*d*.65;
  if(['weaken','strengthen'].includes(t))return Math.max(8,a)*d*.55;
  if(t==='cleanse'||t==='cure')return target?18*Math.min(Math.max(1,num(e.count,1)),negativeCount(target)):18*Math.max(1,num(e.count,1));
  if(t==='dispel')return target?20*Math.min(Math.max(1,num(e.count,1)),positiveCount(target)):20*Math.max(1,num(e.count,1));
  if(t==='chakra'){
    const amount=Math.max(1,a),op=String(e.op||'gain');
    if(op==='drain'&&target&&chakraTotal(target)<=0)return 1;
    return Math.max(10,amount*12);
  }
  if(t==='cooldown'){
    const amount=Math.abs(raw||1),load=target?cooldownLoad(target):0;
    if(raw<0)return load>0?Math.max(12,amount*14+Math.min(18,load*3)):2;
    return Math.max(12,amount*14+Math.min(12,load*2));
  }
  if(t==='status')return statusValue(e,d,a,ctx);
  if(['trap','counter'].includes(t))return 24*d;
  if(['stack','alternate'].includes(t))return 12*d;
  if(t==='demolish')return target&&defenseTotal(target)>0?22+Math.min(20,defenseTotal(target)*.4):4;
  if(t==='focus')return 18*d;
  if(t==='exhaust')return Math.max(12,a*10)*d;
  return 0;
}
function targetsFor(spec,actor,own,other,target){
  const allies=arr(own).filter(alive),enemies=arr(other).filter(alive);
  switch(String(spec||'enemy')){
    case'self':return actor?[actor]:[];
    case'ally':return target?[target]:allies;
    case'allies':return allies;
    case'enemy':return target?[target]:enemies;
    case'enemies':return enemies;
    case'everyone':return[...allies,...enemies];
    case'randomEnemy':return target?[target]:enemies;
    default:return target?[target]:enemies;
  }
}
function skillScore({state=null,actor,own,other,skill,policy='balanced',target=null}={}){
  const m=skill?.mechanic||{},effects=arr(m.effects);let score=0;
  for(const e of effects){
    const spec=String(e?.target||m.target||'enemy'),targets=targetsFor(spec,actor,own,other,target);
    if(!targets.length){score+=effectValue(e,{state,actor,target:null,own,other,skill,policy});continue;}
    if(['ally','enemy','self','randomEnemy'].includes(spec)){
      const chosen=target||targets[0];score+=effectValue(e,{state,actor,target:chosen,own,other,skill,policy});
    }else for(const x of targets)score+=effectValue(e,{state,actor,target:x,own,other,skill,policy});
  }
  const hasHeal=effects.some(e=>e.type==='heal'),hasSupport=effects.some(e=>SUPPORT.has(String(e.type))),hasAttack=effects.some(e=>OFFENSE.has(String(e.type)));
  if(hasHeal&&arr(own).every(x=>missingHp(x)<=0))score-=500;
  if(hasSupport&&policy==='balanced')score*=1.15;
  if(hasAttack&&policy==='aggressive')score*=1.18;
  score-=Math.max(0,num(skill?.cooldown))*1.7;
  score-=arr(skill?.cost).length*2.7;
  return score;
}
function candidateTargets(actor,own,other,skill){
  const spec=String(skill?.mechanic?.target||'enemy');
  if(spec==='self')return actor?[actor]:[];
  if(spec==='ally')return arr(own).filter(alive);
  if(spec==='enemy'||spec==='randomEnemy')return arr(other).filter(alive);
  return [];
}
function chooseTarget({state=null,actor,own,other,skill,policy='balanced'}={}){
  const spec=String(skill?.mechanic?.target||'enemy');
  if(spec==='self')return actor;
  if(['allies','enemies','everyone'].includes(spec))return null;
  const candidates=candidateTargets(actor,own,other,skill);if(!candidates.length)return null;
  const ranked=candidates.map(target=>({target,score:skillScore({state,actor,own,other,skill,policy,target})})).sort((a,b)=>b.score-a.score||((a.target.hp||0)-(b.target.hp||0))||String(a.target.id).localeCompare(String(b.target.id)));
  return ranked[0].target;
}
export{NEGATIVE,POSITIVE,requirementMet,statusValue,effectValue,skillScore,chooseTarget,negativeCount,positiveCount,cooldownLoad,missingHp,defenseTotal,historyFor,consecutiveUses,chargeCount};
