import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root=process.cwd();
const outDir=path.join(root,'audit','balance','current');
fs.mkdirSync(outDir,{recursive:true});
const context={window:{},console,setTimeout,clearTimeout};
context.window.window=context.window;
vm.createContext(context);
for(const file of ['roster.js','jutsu-variants.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file,timeout:30000});
}
const roster=context.window.NARUTO_ROSTER;
if(!Array.isArray(roster)||roster.length<2) throw new Error('window.NARUTO_ROSTER ausente ou insuficiente');

const DUEL_SEEDS=Math.max(1,Number(process.env.BALANCE_DUEL_SEEDS||2));
const TEAM_BATTLES=Math.max(1000,Number(process.env.BALANCE_TEAM_BATTLES||30000));
const MAX_TURNS=Math.max(10,Number(process.env.BALANCE_MAX_TURNS||35));
const POLICIES=['balanced','aggressive','control','support'];
const round=(x,n=4)=>Number(Number(x||0).toFixed(n));
const rate=(w,n)=>n?round(w/n):0;
function hash32(s){let h=2166136261>>>0;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rngFrom(seed){let a=hash32(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function wilson(w,n,z=1.96){if(!n)return[0,0];const p=w/n,z2=z*z,d=1+z2/n,c=(p+z2/(2*n))/d,m=z*Math.sqrt((p*(1-p)+z2/(4*n))/n)/d;return[round(Math.max(0,c-m)),round(Math.min(1,c+m))]}
function emptyCh(){return{Blood:0,Gen:0,Nin:0,Tai:0}}
function chakraTotal(ch){return ['Blood','Gen','Nin','Tai'].reduce((a,k)=>a+Number(ch[k]||0),0)}
function gain(ch,n,rng){let left=Math.max(0,Number(n||0));while(left-->0&&chakraTotal(ch)<24){const available=['Blood','Gen','Nin','Tai'].filter(k=>Number(ch[k]||0)<8);if(!available.length)break;const k=available[Math.floor(rng()*available.length)];ch[k]=Number(ch[k]||0)+1}return ch}
function canPay(ch,cost){const t={Blood:+ch.Blood||0,Gen:+ch.Gen||0,Nin:+ch.Nin||0,Tai:+ch.Tai||0};let q=0;for(const c of(cost||[])){if(c==='Rand'){q++;continue}if(!t[c])return false;t[c]--}return Object.values(t).reduce((a,b)=>a+b,0)>=q}
function pay(ch,cost){const t={Blood:+ch.Blood||0,Gen:+ch.Gen||0,Nin:+ch.Nin||0,Tai:+ch.Tai||0};let q=0;for(const c of(cost||[])){if(c==='Rand'){q++;continue}if(t[c]>0)t[c]--}while(q-->0){const k=['Blood','Gen','Nin','Tai'].sort((a,b)=>t[b]-t[a])[0];if(t[k]<=0)break;t[k]--}for(const k of ['Blood','Gen','Nin','Tai'])ch[k]=t[k]}
function charId(c){return String(c.slug??c.id??c.name)}
function cloneChar(c){return{slug:charId(c),name:c.name||charId(c),hp:100,maxHp:100,shield:0,shieldTurns:0,stun:0,stunTurns:0,dot:0,dotTurns:0,dotSource:null,inv:0,invTurns:0,skills:(c.skills||[]).map((s,i)=>({...structuredClone(s),cd:0,slot:i+1,jutsuId:`${charId(c)}:${i+1}`}))}}
const alive=a=>a.filter(x=>x.hp>0);
function hit(t,d){if(t.inv)return{hp:0,absorbed:0};d=Math.max(0,Math.round(Number(d||0)));const absorbed=Math.min(t.shield,d);t.shield-=absorbed;d-=absorbed;const before=t.hp;t.hp=Math.max(0,t.hp-d);return{hp:before-t.hp,absorbed}}
function targetArray(side,m){return m.target==='enemy'?side.enemy:side.own}
function candidateTargets(side,u,sk){const m=sk.mechanic||{};if(m.target==='self')return[u];return alive(targetArray(side,m))}
function skillScore(side,u,sk,target,policy,rng){if(policy==='random')return rng()*100;const m=sk.mechanic||{},kind=m.kind||'damage',power=Number(m.power||0),cost=(sk.cost||[]).length,enemyTarget=m.target==='enemy';let score=-cost*4;const tr=target?target.hp/Math.max(1,target.maxHp):1,missing=target?Math.max(0,target.maxHp-target.hp):0,effectiveHp=target?target.hp+Number(target.shield||0):9999;
 if(kind==='damage'){score+=power;if(enemyTarget&&power>=effectiveHp)score+=120;if(m.aoe)score+=Math.max(0,alive(side.enemy).length-1)*power*.45;if(target?.inv)score-=130}
 if(kind==='stun'){score+=power+46;if(target?.stun)score-=110;else score+=35;if(tr<.30)score-=12}
 if(kind==='dot'){score+=power+34;if(target?.dot)score-=85;else score+=28}
 if(kind==='heal'){score+=Math.min(power,missing)*2.4;if(missing<=0)score-=220;if(tr<.4)score+=65}
 if(kind==='shield'){score+=Math.max(0,1-tr)*90;if(target?.shield>20)score-=100;if(tr>.85)score-=60}
 if(kind==='invuln'){score+=tr<.4?105:25;if(target?.inv)score-=180;if(tr>.8)score-=55}
 if(policy==='aggressive')score+=['damage','dot','stun'].includes(kind)?35:-18;
 if(policy==='control')score+=kind==='stun'?62:kind==='dot'?48:0;
 if(policy==='support')score+=['heal','shield','invuln'].includes(kind)?55:0;
 return score+rng()*18
}
function planActions(own,enemy,ch,policy,rng){const acts=[];for(let ui=0;ui<own.length;ui++){const u=own[ui];if(!u?.hp)continue;const side={own,enemy};const candidates=[];u.skills.forEach((sk,si)=>{if(sk.cd>0||!canPay(ch,sk.cost))return;for(const target of candidateTargets(side,u,sk)){if(!target?.hp)continue;candidates.push({ui,si,target,score:skillScore(side,u,sk,target,policy,rng)})}});if(!candidates.length)continue;candidates.sort((a,b)=>b.score-a.score);const pick=candidates[0];pay(ch,u.skills[pick.si].cost);acts.push({ui:pick.ui,si:pick.si,targetIndex:(u.skills[pick.si].mechanic?.target==='enemy'?enemy:own).indexOf(pick.target)})}return acts}
function ensureSkillStat(map,u,sk){const id=sk.jutsuId||`${u.slug}:${sk.slot}`;if(!map.has(id))map.set(id,{jutsuId:id,characterId:u.slug,characterName:u.name,slot:sk.slot,name:sk.name||`Slot ${sk.slot}`,kind:sk.mechanic?.kind||'damage',costUnits:(sk.cost||[]).length,cooldown:Number(sk.cooldown||0),power:Number(sk.mechanic?.power||0),attempts:0,executions:0,damage:0,absorbed:0,heal:0,shield:0,stuns:0,dotApplications:0,dotDamage:0,kos:0});return map.get(id)}
function applySkill(u,t,sk,rng,stat){const m=sk.mechanic||{kind:'damage',power:25,target:'enemy'},kind=m.kind||'damage',duration=Math.max(0,Number(m.duration||0));let p=Math.max(1,Math.round(Number(m.power||25)));stat.executions++;
 if(kind==='heal'){const old=t.hp;t.hp=Math.min(t.maxHp,t.hp+p);stat.heal+=t.hp-old}
 else if(kind==='shield'){t.shield+=p;t.shieldTurns=Math.max(t.shieldTurns||0,duration||0);stat.shield+=p}
 else if(kind==='invuln'){t.inv=1;t.invTurns=Math.max(t.invTurns||0,duration||1)}
 else{const wasAlive=t.hp>0;const h=hit(t,Math.round(p*(.9+rng()*.2)));stat.damage+=h.hp;stat.absorbed+=h.absorbed;if(kind==='stun'&&t.hp){t.stun=1;t.stunTurns=Math.max(t.stunTurns||0,duration||1);stat.stuns++}if(kind==='dot'&&t.hp){t.dot=7;t.dotTurns=Math.max(t.dotTurns||0,duration||1);t.dotSource=stat.jutsuId;stat.dotApplications++}if(wasAlive&&!t.hp)stat.kos++}
 sk.cd=Math.max(sk.cd,Number(sk.cooldown||0))
}
function performActions(own,enemy,acts,rng,skillStats){for(const a of acts){const u=own[a.ui];if(!u||!u.hp)continue;const sk=u.skills[a.si],stat=ensureSkillStat(skillStats,u,sk);stat.attempts++;if(u.stun){u.stunTurns=Math.max(0,(u.stunTurns||1)-1);u.stun=u.stunTurns>0?1:0;continue}const m=sk.mechanic||{},arr=m.target==='enemy'?enemy:own;let t=arr[a.targetIndex];if(!t||!t.hp)t=alive(arr)[0];if(!t)continue;const targets=m.aoe?alive(arr):[t];for(const target of targets)applySkill(u,target,sk,rng,stat);if(!alive(enemy).length)break}}
function tick(teams,skillStats){for(const team of teams)for(const f of team){if(f.hp>0&&f.dot&&f.dotTurns>0){const h=hit(f,f.dot);if(f.dotSource&&skillStats.has(f.dotSource))skillStats.get(f.dotSource).dotDamage+=h.hp;f.dotTurns--;if(f.dotTurns<=0){f.dot=0;f.dotSource=null}}if(f.inv){f.invTurns=Math.max(0,(f.invTurns||1)-1);if(f.invTurns<=0)f.inv=0}if(f.shield&&f.shieldTurns>0){f.shieldTurns--;if(f.shieldTurns<=0)f.shield=0}for(const s of f.skills)if(s.cd)s.cd--}}
function simulate(charsA,charsB,{first='A',policyA='balanced',policyB='balanced',seed='0',skillStats}){const rng=rngFrom(seed),A=charsA.map(cloneChar),B=charsB.map(cloneChar),chA=gain(emptyCh(),6,rng),chB=gain(emptyCh(),6,rng);let turn=1;for(;turn<=MAX_TURNS;turn++){const step=(own,enemy,ch,policy)=>{const acts=planActions(own,enemy,ch,policy,rng);performActions(own,enemy,acts,rng,skillStats)};if(first==='A'){step(A,B,chA,policyA);if(!alive(B).length)return{winner:'A',turns:turn};step(B,A,chB,policyB)}else{step(B,A,chB,policyB);if(!alive(A).length)return{winner:'B',turns:turn};step(A,B,chA,policyA)}if(!alive(A).length)return{winner:'B',turns:turn};if(!alive(B).length)return{winner:'A',turns:turn};tick([A,B],skillStats);if(!alive(A).length&&!alive(B).length)return{winner:'draw',turns:turn};if(!alive(A).length)return{winner:'B',turns:turn};if(!alive(B).length)return{winner:'A',turns:turn};gain(chA,3,rng);gain(chB,3,rng)}return{winner:'draw',turns:MAX_TURNS}}

const stats=new Map(roster.map(c=>[charId(c),{characterId:charId(c),name:c.name||charId(c),duel:{w:0,l:0,d:0,turns:0,firstW:0,firstN:0,secondW:0,secondN:0,policies:Object.fromEntries(POLICIES.map(p=>[p,{w:0,l:0,d:0}]))},team:{w:0,l:0,d:0,n:0,turns:0},matchups:new Map()}]));
const skillStats=new Map();
for(const c of roster)(c.skills||[]).forEach((s,i)=>ensureSkillStat(skillStats,{slug:charId(c),name:c.name||charId(c)},{...s,slot:i+1,jutsuId:`${charId(c)}:${i+1}`}));
function recordDuel(a,b,res,first,policy){const A=stats.get(charId(a)),B=stats.get(charId(b));for(const [x,won] of [[A,res.winner==='A'],[B,res.winner==='B']]){const lost=res.winner!=='draw'&&!won;if(won)x.duel.w++;else if(lost)x.duel.l++;else x.duel.d++;x.duel.turns+=res.turns;const p=x.duel.policies[policy];if(won)p.w++;else if(lost)p.l++;else p.d++}if(first==='A'){A.duel.firstN++;B.duel.secondN++;if(res.winner==='A')A.duel.firstW++;if(res.winner==='B')B.duel.secondW++}else{B.duel.firstN++;A.duel.secondN++;if(res.winner==='B')B.duel.firstW++;if(res.winner==='A')A.duel.secondW++}for(const [self,opp,won] of [[A,B,res.winner==='A'],[B,A,res.winner==='B']]){const lost=res.winner!=='draw'&&!won;const key=opp.characterId;if(!self.matchups.has(key))self.matchups.set(key,{opponentId:key,opponentName:opp.name,w:0,l:0,d:0});const m=self.matchups.get(key);if(won)m.w++;else if(lost)m.l++;else m.d++}}

for(let i=0;i<roster.length;i++)for(let j=i+1;j<roster.length;j++)for(const policy of POLICIES)for(let r=0;r<DUEL_SEEDS;r++){
 const a=roster[i],b=roster[j];let res=simulate([a],[b],{first:'A',policyA:policy,policyB:policy,seed:`duel:${i}:${j}:${policy}:${r}:A`,skillStats});recordDuel(a,b,res,'A',policy);res=simulate([a],[b],{first:'B',policyA:policy,policyB:policy,seed:`duel:${i}:${j}:${policy}:${r}:B`,skillStats});recordDuel(a,b,res,'B',policy)
}

const teamRng=rngFrom('team-meta-v1');
for(let n=0;n<TEAM_BATTLES;n++){
 const idx=Array.from({length:roster.length},(_,i)=>i);for(let k=idx.length-1;k>0;k--){const q=Math.floor(teamRng()*(k+1));[idx[k],idx[q]]=[idx[q],idx[k]]}const A=idx.slice(0,3).map(i=>roster[i]),B=idx.slice(3,6).map(i=>roster[i]),policyA=POLICIES[Math.floor(teamRng()*POLICIES.length)],policyB=POLICIES[Math.floor(teamRng()*POLICIES.length)],first=teamRng()<.5?'A':'B';const res=simulate(A,B,{first,policyA,policyB,seed:`team:${n}:${teamRng()}`,skillStats});for(const [team,won] of [[A,res.winner==='A'],[B,res.winner==='B']])for(const c of team){const s=stats.get(charId(c)),lost=res.winner!=='draw'&&!won;s.team.n++;s.team.turns+=res.turns;if(won)s.team.w++;else if(lost)s.team.l++;else s.team.d++}
}

const characters=[];
for(const s of stats.values()){
 const dn=s.duel.w+s.duel.l+s.duel.d,tw=s.team.w,tn=s.team.n;const matchupRows=[...s.matchups.values()].map(m=>({...m,n:m.w+m.l+m.d,winRate:rate(m.w,m.w+m.l+m.d)})).sort((a,b)=>a.winRate-b.winRate);const policyRates=Object.fromEntries(POLICIES.map(p=>{const x=s.duel.policies[p],n=x.w+x.l+x.d;return[p,{...x,n,winRate:rate(x.w,n)}]}));const pvals=Object.values(policyRates).map(x=>x.winRate);const duelWR=rate(s.duel.w,dn),teamWR=rate(tw,tn),firstWR=rate(s.duel.firstW,s.duel.firstN),secondWR=rate(s.duel.secondW,s.duel.secondN);const flags=[];if(duelWR>.58)flags.push('duel_winrate_alto');if(duelWR<.42)flags.push('duel_winrate_baixo');if(teamWR>.56)flags.push('team_winrate_alto');if(teamWR<.44)flags.push('team_winrate_baixo');if(Math.abs(firstWR-secondWR)>.08)flags.push('sensivel_a_ordem_de_acao');if(Math.max(...pvals)-Math.min(...pvals)>.12)flags.push('sensivel_a_politica');if(matchupRows[0]?.winRate<.25)flags.push('matchup_muito_exploravel');characters.push({characterId:s.characterId,name:s.name,duel:{wins:s.duel.w,losses:s.duel.l,draws:s.duel.d,n:dn,winRate:duelWR,winRate95:wilson(s.duel.w,dn),avgTurns:round(s.duel.turns/Math.max(1,dn)),firstActionWinRate:firstWR,secondActionWinRate:secondWR,policies:policyRates},team3v3:{wins:s.team.w,losses:s.team.l,draws:s.team.d,n:tn,winRate:teamWR,winRate95:wilson(tw,tn),avgTurns:round(s.team.turns/Math.max(1,tn))},worstMatchups:matchupRows.slice(0,5),bestMatchups:matchupRows.slice(-5).reverse(),flags})
}
characters.sort((a,b)=>b.team3v3.winRate-a.team3v3.winRate||b.duel.winRate-a.duel.winRate);
const jutsus=[...skillStats.values()].map(s=>({...s,avgDamagePerExecution:round((s.damage+s.dotDamage)/Math.max(1,s.executions)),avgImmediateDamage:round(s.damage/Math.max(1,s.executions)),avgHeal:round(s.heal/Math.max(1,s.executions)),avgShield:round(s.shield/Math.max(1,s.executions)),executionRate:round(s.executions/Math.max(1,s.attempts))})).sort((a,b)=>(b.avgDamagePerExecution+b.avgHeal+b.avgShield)-(a.avgDamagePerExecution+a.avgHeal+a.avgShield));
const neverSelected=jutsus.filter(s=>s.attempts===0);
const flagCounts={};for(const c of characters)for(const f of c.flags)flagCounts[f]=(flagCounts[f]||0)+1;
const summary={generatedAt:new Date().toISOString(),characters:roster.length,jutsusObserved:jutsus.length,jutsusNeverSelected:neverSelected.length,duelSeedsPerOrderPolicy:DUEL_SEEDS,duelPolicies:POLICIES,teamBattles:TEAM_BATTLES,maxTurns:MAX_TURNS,runtimeModel:{baseHp:100,initialChakra:6,turnChakraGain:3,maxChakraPerType:8,maxChakraTotal:24,damageVariance:'±10%',dotDamagePerTick:7,cooldown:'decrementa no tick do mesmo turno em que a técnica é usada',shield:'pool único; duração só controla expiração',invulnerability:'bloqueia hit/DOT enquanto ativa',actionOrder:'lado definido como first resolve toda a fila antes do outro; duelos são espelhados para remover viés'},externalPatternsApplied:['Monte Carlo com seeds reproduzíveis','TTK/turnos e intervalos de confiança','self-play com múltiplas políticas','matriz de matchups e pior confronto como proxy de exploitability','separação entre inventário estático e resultado simulado'],flagCounts};
const write=(n,d)=>fs.writeFileSync(path.join(outDir,n),JSON.stringify(d,null,2)+'\n');
write('SIMULATION-SUMMARY.json',summary);write('CHARACTER-SIMULATION.json',characters);write('JUTSU-SIMULATION.json',jutsus);write('UNUSED-JUTSUS.json',neverSelected);
const esc=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');const hi=characters.slice(0,25),lo=[...characters].sort((a,b)=>a.team3v3.winRate-b.team3v3.winRate||a.duel.winRate-b.duel.winRate).slice(0,25);let md=`# Simulação de balanceamento — runtime atual\n\nGerado em: ${summary.generatedAt}\n\n## Modelo aplicado\n\n- ${roster.length} personagens, 4 jutsus por personagem.\n- Duelo 1x1 completo entre pares, espelhando a ordem de ação e repetindo as políticas ${POLICIES.join(', ')}.\n- ${TEAM_BATTLES} batalhas 3x3 com equipes aleatórias sem repetição e políticas variadas.\n- 100 PV base, 6 chakras iniciais, +3 por turno, dano ±10%, DOT 7/tick e cooldown/escudo/invulnerabilidade conforme app-online.js.\n- Sem equipamentos, itens, bônus de dificuldade, história ou boss: o objetivo é isolar o kit do personagem.\n- ${neverSelected.length} jutsus nunca foram selecionados pelas quatro políticas; eles permanecem no inventário com uso zero para auditoria.\n\n## Mais fortes no 3x3 simulado\n\n| Personagem | Win 3x3 | IC95 | Win duelo | 1º age | 2º age | Flags |\n|---|---:|---|---:|---:|---:|---|\n`;for(const c of hi)md+=`| ${esc(c.name)} | ${(100*c.team3v3.winRate).toFixed(1)}% | ${(100*c.team3v3.winRate95[0]).toFixed(1)}–${(100*c.team3v3.winRate95[1]).toFixed(1)}% | ${(100*c.duel.winRate).toFixed(1)}% | ${(100*c.duel.firstActionWinRate).toFixed(1)}% | ${(100*c.duel.secondActionWinRate).toFixed(1)}% | ${esc(c.flags.join(', '))} |\n`;md+=`\n## Mais fracos no 3x3 simulado\n\n| Personagem | Win 3x3 | IC95 | Win duelo | Flags |\n|---|---:|---|---:|---|\n`;for(const c of lo)md+=`| ${esc(c.name)} | ${(100*c.team3v3.winRate).toFixed(1)}% | ${(100*c.team3v3.winRate95[0]).toFixed(1)}–${(100*c.team3v3.winRate95[1]).toFixed(1)}% | ${(100*c.duel.winRate).toFixed(1)}% | ${esc(c.flags.join(', '))} |\n`;md+=`\n## Interpretação\n\n- **Win 3x3** é o sinal principal para o modo padrão; duelo serve para detectar one-shot, travas e matchups extremos.\n- **1º age / 2º age** mede a assimetria do runtime: escudo/invulnerabilidade de duração curta podem ter valor muito diferente conforme a ordem.\n- **Pior matchup** em CHARACTER-SIMULATION.json funciona como proxy de exploitability: um personagem pode ter média aceitável e ainda ser facilmente anulável por determinados kits.\n- JUTSU-SIMULATION.json registra uso e resultado efetivo por técnica, inclusive dano contínuo, cura, escudo, stun e KOs.\n- UNUSED-JUTSUS.json lista técnicas que as políticas simuladas nunca consideraram melhores do que as alternativas disponíveis.\n\n## Arquivos\n\n- SIMULATION-SUMMARY.json\n- CHARACTER-SIMULATION.json\n- JUTSU-SIMULATION.json\n- UNUSED-JUTSUS.json\n- SIMULATION-REPORT.md\n`;
fs.writeFileSync(path.join(outDir,'SIMULATION-REPORT.md'),md);
console.log(JSON.stringify(summary,null,2));
if(jutsus.length!==roster.length*4)throw new Error(`jutsusObserved=${jutsus.length} != ${roster.length*4}`);
