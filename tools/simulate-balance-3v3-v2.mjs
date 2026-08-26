import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import * as semanticAI from './semantic-ai-v2.mjs';

const OUT=path.join(process.cwd(),'audit','balance','simulation-v2');
fs.mkdirSync(OUT,{recursive:true});
const MODE=String(process.env.SIM_MODE||'standard');
const SIM_SCOPE=String(process.env.SIM_SCOPE||'competitive');
const MAX_TURNS=Math.max(8,Number(process.env.SIM_MAX_TURNS||30));
const SEEDS=Math.max(1,Number(process.env.SIM_SEEDS||(MODE==='smoke'?1:2)));
const SHARD_COUNT=Number(process.env.SIM_SHARD_COUNT||1);
const SHARD_INDEX=Number(process.env.SIM_SHARD_INDEX||0);
if(!Number.isInteger(SHARD_COUNT)||SHARD_COUNT<1)throw new Error('SIM_SHARD_COUNT inválido');
if(!Number.isInteger(SHARD_INDEX)||SHARD_INDEX<0||SHARD_INDEX>=SHARD_COUNT)throw new Error(`SIM_SHARD_INDEX inválido: ${SHARD_INDEX}/${SHARD_COUNT}`);
const POLICIES=['balanced','aggressive'];
const TYPES=['Blood','Gen','Nin','Tai'];
const round=(x,n=4)=>Number(Number(x||0).toFixed(n));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const emptyOutcome=()=>({matches:0,wins:0,losses:0,draws:0});
const emptyPairOutcome=()=>({games:0,aWins:0,bWins:0,draws:0,turns:0,hpDiff:0});
const scoreOf=x=>round((Number(x.wins||0)+.5*Number(x.draws||0))/Math.max(1,Number(x.matches||0)));

const ctx={window:{},console};ctx.window.window=ctx.window;ctx.globalThis=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('roster.js','utf8'),ctx,{filename:'roster.js',timeout:30000});
vm.runInContext(fs.readFileSync('combat-rules-v2.js','utf8'),ctx,{filename:'combat-rules-v2.js',timeout:30000});
const roster=ctx.window.NARUTO_ROSTER,rules=ctx.NARUTO_COMBAT_RULES_V2;
if(!Array.isArray(roster)||!roster.length)throw new Error('NARUTO_ROSTER vazio');
if(!rules||rules.VERSION!==2)throw new Error('Combat Rules v2 indisponível');

function classification(c){if(c.eventOnly===true||/^bijuu-/.test(String(c.slug||'')))return'event';if(/chefe|boss|exclusiv/.test(norm(c.bio)))return'special-review';return'standard'}
const eligible=roster.filter(c=>Array.isArray(c.skills)&&c.skills.length===4);
const excludedCharacters=eligible.filter(c=>classification(c)!=='standard').map(c=>({slug:c.slug,name:c.name,classification:classification(c)}));
const chars=eligible.filter(c=>SIM_SCOPE==='all'||classification(c)==='standard');
const bySlug=new Map(chars.map(c=>[c.slug,c]));
const preferred=['naruto-uzumaki-kid','sakura-haruno-kid','sasuke-uchiha-kid','kakashi-hatake'];
const anchorPool=[...preferred.map(x=>bySlug.get(x)).filter(Boolean),...chars].filter((c,i,a)=>a.findIndex(x=>x.slug===c.slug)===i);
if(chars.length<190||anchorPool.length<4)throw new Error('Roster padrão/âncoras insuficientes');

function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function emptyCh(){return{Blood:0,Gen:0,Nin:0,Tai:0,Rand:0}}
function totalCh(ch){return TYPES.reduce((a,k)=>a+Number(ch[k]||0),0)}
function demand(team){const w={Blood:1,Gen:1,Nin:1,Tai:1};for(const f of team)if(f.hp>0)for(const sk of f.metadata.skills||[])for(const c of(sk.cost||[]))if(TYPES.includes(c))w[c]++;return w}
function gain(ch,count,team,R){for(let z=0;z<count&&totalCh(ch)<24;z++){const w=demand(team),avail=TYPES.filter(k=>ch[k]<8);if(!avail.length)break;let r=R()*avail.reduce((n,k)=>n+w[k],0),pick=avail.at(-1);for(const k of avail){r-=w[k];if(r<=0){pick=k;break}}ch[pick]++}return ch}
function payPlan(ch,cost=[]){const t={...ch};let wild=0;for(const c of cost){if(c==='Rand'){wild++;continue}if(!TYPES.includes(c)||t[c]<=0)return null;t[c]--}while(wild-->0){const a=TYPES.filter(k=>t[k]>0).sort((x,y)=>t[y]-t[x]||x.localeCompare(y));if(!a.length)return null;t[a[0]]--}return t}
function pay(ch,cost){const p=payPlan(ch,cost);if(!p)return false;for(const k of TYPES)ch[k]=p[k];return true}
function syncChakra(f,ch){f.chakra={Blood:ch.Blood||0,Gen:ch.Gen||0,Nin:ch.Nin||0,Tai:ch.Tai||0,Rand:0}}
function alive(t){return t.filter(f=>f.hp>0)}
function defenseTotal(f){return(f.defense||[]).reduce((n,x)=>n+Math.max(0,Number(x.amount||0)),0)}
function weakest(t){return alive(t).sort((a,b)=>(a.hp+defenseTotal(a))-(b.hp+defenseTotal(b))||a.id.localeCompare(b.id))[0]||null}
function strongest(t){return alive(t).sort((a,b)=>(b.hp+defenseTotal(b))-(a.hp+defenseTotal(a))||a.id.localeCompare(b.id))[0]||null}

function legacyTarget(m={}){const base=String(m.target||'enemy');if(m.aoe===true){if(base==='enemy')return'enemies';if(base==='ally'||base==='self')return'allies'}return base}
function asV2Skill(skill){
 if(Number(skill?.mechanic?.version)===2&&Array.isArray(skill.mechanic.effects))return skill;
 const m=skill?.mechanic||{},p=Math.max(0,Number(m.power||0)),d=Math.max(0,Number(m.duration||0)),kind=String(m.kind||'damage'),target=legacyTarget(m),effects=[];
 if(kind==='damage')effects.push({type:'damage',amount:p,damageClass:'normal',variance:.10});
 else if(kind==='stun'){if(p>0)effects.push({type:'damage',amount:p,damageClass:'normal',variance:.10});effects.push({type:'stun',duration:Math.max(1,d||1),durationUnit:'ownerPhases',classes:['all']})}
 else if(kind==='dot'){if(p>0)effects.push({type:'damage',amount:p,damageClass:'normal',variance:.10});effects.push({type:'dot',amount:7,duration:Math.max(1,d||1),damageClass:'normal'})}
 else if(kind==='heal')effects.push({type:'heal',amount:p});
 else if(kind==='shield')effects.push({type:'defense',amount:p,duration:d||'permanent',durationUnit:'opponentPhases',destructible:true,classes:['all']});
 else if(kind==='invuln')effects.push({type:'invulnerable',duration:Math.max(1,d||1),durationUnit:'opponentPhases',classes:['all']});
 else effects.push({type:'noop',legacyKind:kind});
 return{...skill,mechanic:{version:2,target,classes:skill.classes||m.classes||['all'],requirements:m.requirements||null,effects,legacy:true}};
}
function fighterInput(c,side,focal=false){return{id:c.slug,side,name:c.name,hp:100,maxHp:100,metadata:{slug:c.slug,focal,skills:c.skills.map(s=>asV2Skill(JSON.parse(JSON.stringify(s))))}}}
function teamFor(focal,other,side){const anchors=anchorPool.filter(c=>c.slug!==focal.slug&&c.slug!==other.slug).slice(0,2);return[fighterInput(focal,side,true),...anchors.map(c=>fighterInput(c,side,false))]}

function effectValue(e,ctx={}){return semanticAI.effectValue(e,ctx)}
function targetCount(spec,own,other){if(spec==='enemies')return alive(other).length;if(spec==='allies')return alive(own).length;if(spec==='everyone')return alive(own).length+alive(other).length;return 1}
function skillScore(actor,own,other,sk,policy,target=null,state=null){const n=rules.normalizeSkill(sk);return semanticAI.skillScore({state,actor,own,other,skill:n,policy,target})}
function chooseTarget(actor,own,other,sk,policy,state=null){const n=rules.normalizeSkill(sk);return semanticAI.chooseTarget({state,actor,own,other,skill:n,policy})}
function canUseShared(state,actor,sk,target,ch){syncChakra(actor,ch);return rules.canUseSkill(state,actor.id,sk,target?.id??null)}
function plan(state,side,enemySide,ch,policy){const own=alive(state.fighters.filter(f=>f.side===side)),other=alive(state.fighters.filter(f=>f.side===enemySide)),virtual={...ch},acts=[];for(const actor of own){const c=[];for(let si=0;si<actor.metadata.skills.length;si++){const sk=actor.metadata.skills[si],target=chooseTarget(actor,own,other,sk,policy,state),gate=canUseShared(state,actor,sk,target,virtual);if(!gate.ok)continue;const pp=payPlan(virtual,gate.cost);if(!pp)continue;c.push({actorId:actor.id,si,targetId:target?.id??null,score:skillScore(actor,own,other,sk,policy,target,state),cost:gate.cost,pp})}c.sort((a,b)=>b.score-a.score||a.si-b.si);if(c[0]){Object.assign(virtual,c[0].pp);acts.push(c[0])}}return acts}

function snapshot(state){const o={};for(const f of state.fighters)o[f.id]={hp:f.hp,def:defenseTotal(f),statuses:f.statuses.length,dots:f.dots.length,traps:f.traps.length};return o}
function delta(before,after,side,state){let damage=0,heal=0,defense=0,control=0;for(const f of state.fighters){const b=before[f.id],a=after[f.id];if(!b||!a)continue;if(f.side!==side)damage+=Math.max(0,b.hp-a.hp);else{heal+=Math.max(0,a.hp-b.hp);defense+=Math.max(0,a.def-b.def)}control+=Math.max(0,a.statuses-b.statuses)+Math.max(0,a.dots-b.dots)+Math.max(0,a.traps-b.traps)}return{damage,heal,defense,control}}
function executeActs(state,acts,side,ch,metrics){for(const a of acts){const actor=rules.getFighter(state,a.actorId);if(!actor||actor.hp<=0)continue;const sk=actor.metadata.skills[a.si],target=a.targetId?rules.getFighter(state,a.targetId):null;syncChakra(actor,ch);const gate=rules.canUseSkill(state,actor.id,sk,target?.id??null);if(!gate.ok||!pay(ch,gate.cost))continue;syncChakra(actor,ch);const before=snapshot(state),res=rules.resolveSkill(state,actor.id,sk,target?.id??null,{payCost:false});if(!res.ok)continue;const d=delta(before,snapshot(state),side,state),m=metrics.get(actor.id);m.actions++;m.damage+=d.damage;m.heal+=d.heal;m.defense+=d.defense;m.control+=d.control;m.chakra+=gate.cost.length;m.uses[a.si]++}}
function sideAlive(state,side){return state.fighters.some(f=>f.side===side&&f.hp>0)}
function sideHp(state,side){return state.fighters.filter(f=>f.side===side).reduce((n,f)=>n+Math.max(0,f.hp)+Math.min(50,defenseTotal(f)),0)}
function focalMetrics(state,side,metrics){const f=state.fighters.find(x=>x.side===side&&x.metadata.focal);return f?metrics.get(f.id):null}
function simulate(a,b,seed,policy,first){const R=rules.makeRng(seed),state=rules.createState([...teamFor(a,b,'A'),...teamFor(b,a,'B')],{seed});const chA=gain(emptyCh(),6,state.fighters.filter(f=>f.side==='A'),R),chB=gain(emptyCh(),6,state.fighters.filter(f=>f.side==='B'),R),metrics=new Map(state.fighters.map(f=>[f.id,{damage:0,heal:0,defense:0,control:0,chakra:0,actions:0,uses:[0,0,0,0]}]));let turn=1;for(;turn<=MAX_TURNS;turn++){const actsA=plan(state,'A','B',chA,policy),actsB=plan(state,'B','A',chB,policy),phases=first==='A'?[['A',actsA,chA],['B',actsB,chB]]:[['B',actsB,chB],['A',actsA,chA]];for(const [side,acts,ch] of phases){if(!sideAlive(state,'A')||!sideAlive(state,'B'))break;executeActs(state,acts,side,ch,metrics);rules.endPhase(state,side)}if(!sideAlive(state,'A')||!sideAlive(state,'B'))break;gain(chA,3,state.fighters.filter(f=>f.side==='A'),R);gain(chB,3,state.fighters.filter(f=>f.side==='B'),R)}const hpA=sideHp(state,'A'),hpB=sideHp(state,'B');let winner='draw';if(!sideAlive(state,'B')&&sideAlive(state,'A'))winner='A';else if(!sideAlive(state,'A')&&sideAlive(state,'B'))winner='B';else if(hpA!==hpB)winner=hpA>hpB?'A':'B';return{winner,turn:Math.min(turn,MAX_TURNS),hpA,hpB,metricsA:focalMetrics(state,'A',metrics),metricsB:focalMetrics(state,'B',metrics)}}
function wilson(w,n,z=1.96){if(!n)return[0,1];const p=w/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,m=z*Math.sqrt((p*(1-p)+z*z/(4*n))/n)/d;return[round(Math.max(0,c-m)),round(Math.min(1,c+m))]}
function updateOutcome(bucket,outcome){bucket.matches++;bucket[outcome==='win'?'wins':outcome==='loss'?'losses':'draws']++}
function finalizeOutcome(bucket){const decisive=bucket.wins+bucket.losses;return{...bucket,score:scoreOf(bucket),winRate:decisive?round(bucket.wins/decisive):.5,winRate95:wilson(bucket.wins,decisive)}}
function emptyStat(c){return{slug:c.slug,name:c.name,matches:0,wins:0,losses:0,draws:0,turns:0,hpDiff:0,damage:0,heal:0,defense:0,control:0,chakra:0,actions:0,uses:[0,0,0,0],byPolicy:Object.fromEntries(POLICIES.map(p=>[p,emptyOutcome()])),byInitiative:{first:emptyOutcome(),second:emptyOutcome()}}}

const stats=new Map(chars.map(c=>[c.slug,emptyStat(c)])),matchups=[];
const totalPossiblePairs=chars.length*(chars.length-1)/2;
const pairLimit=MODE==='smoke'?Math.min(40,totalPossiblePairs):totalPossiblePairs;
let pairIndex=0;
outer:for(let i=0;i<chars.length;i++)for(let j=i+1;j<chars.length;j++){
 if(pairIndex>=pairLimit)break outer;
 const currentPairIndex=pairIndex++;
 if(currentPairIndex%SHARD_COUNT!==SHARD_INDEX)continue;
 const A=chars[i],B=chars[j],m={a:A.slug,b:B.slug,games:0,aWins:0,bWins:0,draws:0,turns:0,hpDiff:0,byPolicy:Object.fromEntries(POLICIES.map(p=>[p,emptyPairOutcome()])),byFirst:{A:emptyPairOutcome(),B:emptyPairOutcome()}};
 for(const policy of POLICIES)for(let s=0;s<SEEDS;s++)for(const first of['A','B']){
  const r=simulate(A,B,hash(`${A.slug}|${B.slug}|v2|${policy}|${s}|${first}`),policy,first);
  m.games++;m.turns+=r.turn;m.hpDiff+=r.hpA-r.hpB;
  const p=m.byPolicy[policy],f=m.byFirst[first];p.games++;p.turns+=r.turn;p.hpDiff+=r.hpA-r.hpB;f.games++;f.turns+=r.turn;f.hpDiff+=r.hpA-r.hpB;
  if(r.winner==='A'){m.aWins++;p.aWins++;f.aWins++}else if(r.winner==='B'){m.bWins++;p.bWins++;f.bWins++}else{m.draws++;p.draws++;f.draws++}
  for(const [slug,outcome,met,hpd,isFirst]of[[A.slug,r.winner==='A'?'win':r.winner==='B'?'loss':'draw',r.metricsA,r.hpA-r.hpB,first==='A'],[B.slug,r.winner==='B'?'win':r.winner==='A'?'loss':'draw',r.metricsB,r.hpB-r.hpA,first==='B']]){
   const st=stats.get(slug);st.matches++;st[outcome==='win'?'wins':outcome==='loss'?'losses':'draws']++;st.turns+=r.turn;st.hpDiff+=hpd;st.damage+=met?.damage||0;st.heal+=met?.heal||0;st.defense+=met?.defense||0;st.control+=met?.control||0;st.chakra+=met?.chakra||0;st.actions+=met?.actions||0;for(let k=0;k<4;k++)st.uses[k]+=met?.uses?.[k]||0;updateOutcome(st.byPolicy[policy],outcome);updateOutcome(st.byInitiative[isFirst?'first':'second'],outcome)
  }
 }
 m.aScore=round((m.aWins+.5*m.draws)/m.games);m.avgTurns=round(m.turns/m.games,2);m.avgHpDiff=round(m.hpDiff/m.games,2);matchups.push(m)
}
const ratings=[...stats.values()].filter(x=>x.matches).map(st=>{const decisive=st.wins+st.losses,ci=wilson(st.wins,decisive),useTotal=st.uses.reduce((a,b)=>a+b,0),skillUseShare=st.uses.map(x=>round(x/Math.max(1,useTotal))),policyScores=Object.fromEntries(POLICIES.map(p=>[p,finalizeOutcome(st.byPolicy[p])])),initiativeScores={first:finalizeOutcome(st.byInitiative.first),second:finalizeOutcome(st.byInitiative.second)},policyVals=Object.values(policyScores).map(x=>x.score);return{...st,score:round((st.wins+.5*st.draws)/st.matches),winRate:decisive?round(st.wins/decisive):.5,winRate95:ci,avgTurns:round(st.turns/st.matches,2),avgHpDiff:round(st.hpDiff/st.matches,2),avgDamage:round(st.damage/st.matches,2),avgHeal:round(st.heal/st.matches,2),avgDefense:round(st.defense/st.matches,2),avgControl:round(st.control/st.matches,2),avgChakraSpent:round(st.chakra/st.matches,2),avgActions:round(st.actions/st.matches,2),skillUseShare,skillUsage:{nearUnused:skillUseShare.map((x,i)=>x<=.02?i:null).filter(x=>x!=null),dominant:skillUseShare.map((x,i)=>x>=.60?i:null).filter(x=>x!=null),minShare:round(Math.min(...skillUseShare)),maxShare:round(Math.max(...skillUseShare))},policyScores,initiativeScores,policyDelta:round(Math.max(...policyVals)-Math.min(...policyVals)),initiativeDelta:round(initiativeScores.first.score-initiativeScores.second.score)}}).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
const allSkills=chars.flatMap(c=>c.skills),native=allSkills.filter(s=>Number(s.mechanic?.version)===2&&Array.isArray(s.mechanic?.effects)).length,effectTypes={};for(const c of chars)for(const s of c.skills)for(const e of(asV2Skill(s).mechanic.effects||[]))effectTypes[e.type]=(effectTypes[e.type]||0)+1;
const expectedGamesPerPair=POLICIES.length*SEEDS*2;
const initiativeRaw={games:0,firstWins:0,secondWins:0,draws:0};for(const m of matchups)for(const first of['A','B']){const b=m.byFirst[first];initiativeRaw.games+=b.games;initiativeRaw.draws+=b.draws;if(first==='A'){initiativeRaw.firstWins+=b.aWins;initiativeRaw.secondWins+=b.bWins}else{initiativeRaw.firstWins+=b.bWins;initiativeRaw.secondWins+=b.aWins}}
const initiativeFirstScore=round((initiativeRaw.firstWins+.5*initiativeRaw.draws)/Math.max(1,initiativeRaw.games)),initiative={...initiativeRaw,firstScore:initiativeFirstScore,secondScore:round(1-initiativeFirstScore),firstScore95:wilson(initiativeRaw.firstWins+.5*initiativeRaw.draws,initiativeRaw.games),residualAdvantage:round(initiativeFirstScore-.5)};
const summary={generatedAt:new Date().toISOString(),engine:'combat-rules-v2',engineVersion:rules.VERSION,mode:MODE,scope:SIM_SCOPE,seeds:SEEDS,policies:POLICIES,totalRoster:roster.length,eligibleRoster:eligible.length,roster:chars.length,excludedCharacters:SIM_SCOPE==='all'?[]:excludedCharacters,pairs:matchups.length,matchups:matchups.reduce((n,x)=>n+x.games,0),expectedGamesPerPair,shard:{index:SHARD_INDEX,count:SHARD_COUNT,strategy:'pair-index-modulo',globalPairs:pairLimit,localPairs:matchups.length},avgBattleTurns:round(matchups.reduce((n,x)=>n+x.turns,0)/Math.max(1,matchups.reduce((n,x)=>n+x.games,0)),2),v2NativeSkills:native,legacyFallbackSkills:allSkills.length-native,initiative,effectTypes,top:ratings[0]||null,bottom:ratings.at(-1)||null,methodology:['combat-rules-v2 resolution','runtime-faithful legacy adapter while roster migrates','stun duration on target owner phase','shield/invulnerability on opponent phase','seeded pairwise focal 3v3','balanced + aggressive policies','policy-separated character diagnostics','both initiative orders','initiative-separated character diagnostics','shared team chakra','95% Wilson interval','deterministic pair-index sharding']};
fs.writeFileSync(path.join(OUT,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');fs.writeFileSync(path.join(OUT,'CHARACTER-RATINGS.json'),JSON.stringify(ratings,null,2)+'\n');fs.writeFileSync(path.join(OUT,'MATCHUPS.json'),JSON.stringify(matchups,null,2)+'\n');let md=`# Naruto Unison — Balance 3×3 / Combat Rules v2\n\n- Engine: **v${rules.VERSION}**\n- Modo: **${MODE}**\n- Personagens: **${summary.roster}**\n- Jogos: **${summary.matchups.toLocaleString('pt-BR')}**\n- Shard: **${SHARD_INDEX+1}/${SHARD_COUNT}**\n- Jutsus v2 nativos: **${summary.v2NativeSkills}**\n- Fallback legado: **${summary.legacyFallbackSkills}**\n- Turnos médios: **${summary.avgBattleTurns}**\n- Vantagem residual de iniciativa: **${(summary.initiative.residualAdvantage*100).toFixed(2)} p.p.**\n\n> Nenhum nerf/buff é aplicado automaticamente. Enquanto houver fallback legado, divergências canônicas podem distorcer extremos.\n\n| # | Personagem | Score | Win rate | IC95% | Partidas | Dano | Cura | Defesa | Controle | Chakra | Δ política | Δ iniciativa |\n|---:|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|\n`;ratings.forEach((x,i)=>md+=`| ${i+1} | ${x.name} | ${(x.score*100).toFixed(1)}% | ${(x.winRate*100).toFixed(1)}% | ${(x.winRate95[0]*100).toFixed(1)}–${(x.winRate95[1]*100).toFixed(1)}% | ${x.matches} | ${x.avgDamage} | ${x.avgHeal} | ${x.avgDefense} | ${x.avgControl} | ${x.avgChakraSpent} | ${(x.policyDelta*100).toFixed(1)} | ${(x.initiativeDelta*100).toFixed(1)} |\n`);fs.writeFileSync(path.join(OUT,'REPORT.md'),md);console.log(JSON.stringify(summary,null,2));if(summary.engineVersion!==2||summary.roster<190||summary.matchups<1)process.exitCode=2;
