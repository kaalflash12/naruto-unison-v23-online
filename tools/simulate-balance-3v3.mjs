import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const outDir=path.join(process.cwd(),'audit','balance','simulation');
fs.mkdirSync(outDir,{recursive:true});
const ctx={window:{},console};ctx.window.window=ctx.window;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('roster.js','utf8'),ctx,{filename:'roster.js',timeout:30000});
const roster=ctx.window.NARUTO_ROSTER;
if(!Array.isArray(roster)||!roster.length)throw new Error('NARUTO_ROSTER vazio');

const TYPES=['Blood','Gen','Nin','Tai'];
const MAX_TURNS=Math.max(8,Number(process.env.SIM_MAX_TURNS||30));
const SEEDS=Math.max(1,Number(process.env.SIM_SEEDS||2));
const POLICIES=['balanced','aggressive'];
const round=(x,n=4)=>Number(Number(x||0).toFixed(n));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function classification(c){if(c.eventOnly===true||/^bijuu-/.test(String(c.slug||'')))return'event';if(/chefe|boss|exclusiv/.test(norm(c.bio)))return'special-review';return'standard'}
const chars=roster.filter(c=>classification(c)==='standard'&&Array.isArray(c.skills)&&c.skills.length===4);
if(chars.length<2)throw new Error('Poucos personagens padrão para simulação');
const bySlug=new Map(chars.map(c=>[c.slug,c]));
const preferred=['naruto-uzumaki','sakura-haruno','sasuke-uchiha','kakashi-hatake'];
const anchorPool=[...preferred.map(x=>bySlug.get(x)).filter(Boolean),...chars].filter((c,i,a)=>a.findIndex(x=>x.slug===c.slug)===i);

function rng(seed){let x=(seed>>>0)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function emptyCh(){return{Blood:0,Gen:0,Nin:0,Tai:0}}
function totalCh(ch){return TYPES.reduce((a,k)=>a+Number(ch[k]||0),0)}
function demand(team){const w={Blood:1,Gen:1,Nin:1,Tai:1};for(const f of team)if(f.hp>0)for(const sk of f.skills)for(const c of(sk.cost||[]))if(TYPES.includes(c))w[c]++;return w}
function gain(ch,count,team,R){for(let z=0;z<count&&totalCh(ch)<24;z++){const w=demand(team),avail=TYPES.filter(k=>ch[k]<8);if(!avail.length)break;let r=R()*avail.reduce((n,k)=>n+w[k],0),pick=avail.at(-1);for(const k of avail){r-=w[k];if(r<=0){pick=k;break}}ch[pick]++}return ch}
function payPlan(ch,cost=[]){const t={...ch};let wild=0;for(const c of cost){if(c==='Rand'){wild++;continue}if(!TYPES.includes(c)||t[c]<=0)return null;t[c]--}while(wild-->0){const candidates=TYPES.filter(k=>t[k]>0).sort((a,b)=>t[b]-t[a]||a.localeCompare(b));if(!candidates.length)return null;t[candidates[0]]--}return t}
function pay(ch,cost){const p=payPlan(ch,cost);if(!p)return false;for(const k of TYPES)ch[k]=p[k];return true}
function fighter(c,focal=false){return{slug:c.slug,name:c.name,focal,skills:c.skills.map(s=>({...s,cd:0})),hp:100,maxHp:100,shield:0,shieldTurns:0,stun:0,stunTurns:0,dot:0,dotTurns:0,inv:0,invTurns:0,metrics:{damage:0,heal:0,shield:0,control:0,blocked:0,chakra:0,uses:[0,0,0,0]}}}
function teamFor(focal,other){const anchors=anchorPool.filter(c=>c.slug!==focal.slug&&c.slug!==other.slug).slice(0,2);if(anchors.length<2)throw new Error('Âncoras insuficientes');return[fighter(focal,true),...anchors.map(c=>fighter(c,false))]}
function alive(t){return t.filter(f=>f.hp>0)}
function weakest(t){return alive(t).sort((a,b)=>a.hp-b.hp||a.slug.localeCompare(b.slug))[0]||null}
function strongest(t){return alive(t).sort((a,b)=>b.hp-a.hp||a.slug.localeCompare(b.slug))[0]||null}
function targetList(actor,own,other,sk){const m=sk.mechanic||{},side=String(m.target||'enemy');if(side==='self')return[actor];if(side==='ally')return m.aoe?alive(own):alive(own);return m.aoe?alive(other):alive(other)}
function skillScore(actor,own,other,sk,policy){const m=sk.mechanic||{},kind=String(m.kind||'damage'),p=Math.max(1,Number(m.power||25)),d=Math.max(0,Number(m.duration||0)),aoe=m.aoe===true?Math.max(1,targetList(actor,own,other,sk).length):1;const hpPct=actor.hp/actor.maxHp;let score=0;
 if(kind==='damage')score=p*aoe*(policy==='aggressive'?1.35:1);
 else if(kind==='stun')score=(p+18*Math.max(1,d))*aoe*(policy==='aggressive'?1.15:1.25);
 else if(kind==='dot')score=(p+7*Math.max(1,d))*aoe*(policy==='aggressive'?1.2:1.08);
 else if(kind==='heal'){const missing=alive(own).reduce((n,f)=>n+(f.maxHp-f.hp),0);score=Math.min(p,missing)*(policy==='balanced'?1.3:.65);if(!missing)score=-1000}
 else if(kind==='shield'){const exposed=alive(own).reduce((n,f)=>n+(f.shield<10?1:0),0);score=p*Math.max(1,m.aoe?exposed:1)*(policy==='balanced'?1.05:.5);if(!exposed)score*=.25}
 else if(kind==='invuln'){score=(hpPct<.45?48:18)*Math.max(1,d||1)*(policy==='balanced'?1.1:.55)}
 score-=Number(sk.cooldown||0)*1.5;score-=(sk.cost||[]).length*2.5;
 return score}
function chooseTarget(actor,own,other,sk,policy){const m=sk.mechanic||{},kind=String(m.kind||'damage'),side=String(m.target||'enemy');if(side==='self')return actor;const list=side==='ally'?alive(own):alive(other);if(!list.length)return null;if(m.aoe)return list[0];if(side==='ally'){if(kind==='heal')return weakest(list);if(kind==='shield'||kind==='invuln')return weakest(list);return weakest(list)}return policy==='aggressive'?weakest(list):kind==='dot'?strongest(list):weakest(list)}
function plan(team,enemy,ch,policy){const virtual={...ch},acts=[];for(let i=0;i<team.length;i++){const f=team[i];if(f.hp<=0)continue;if(f.stun){acts.push({i,stunned:true});continue}const candidates=f.skills.map((sk,si)=>({sk,si,score:sk.cd>0||!payPlan(virtual,sk.cost)?-Infinity:skillScore(f,team,enemy,sk,policy)})).filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score||a.si-b.si);const pick=candidates[0];if(!pick)continue;const target=chooseTarget(f,team,enemy,pick.sk,policy);if(!target)continue;pay(virtual,pick.sk.cost);acts.push({i,si:pick.si,targetSlug:target.slug})}return acts}
function hit(target,dmg,source){if(target.inv){source.metrics.blocked+=Math.max(0,dmg);return 0}let d=Math.max(0,Math.round(dmg));const absorbed=Math.min(target.shield,d);target.shield-=absorbed;source.metrics.blocked+=0;d-=absorbed;target.hp=Math.max(0,target.hp-d);source.metrics.damage+=d;return d}
function apply(actor,target,sk,R){const m=sk.mechanic||{kind:'damage',power:25,target:'enemy'},kind=String(m.kind||'damage'),p=Math.max(1,Math.round(Number(m.power||25))),dur=Math.max(0,Number(m.duration||0));if(kind==='heal'){const old=target.hp;target.hp=Math.min(target.maxHp,target.hp+p);actor.metrics.heal+=target.hp-old}
 else if(kind==='shield'){target.shield+=p;target.shieldTurns=Math.max(target.shieldTurns||0,dur||0);actor.metrics.shield+=p}
 else if(kind==='invuln'){target.inv=1;target.invTurns=Math.max(target.invTurns||0,dur||1);actor.metrics.control+=dur||1}
 else{hit(target,Math.round(p*(.9+R()*.2)),actor);if(kind==='stun'&&target.hp>0){target.stun=1;target.stunTurns=Math.max(target.stunTurns||0,dur||1);actor.metrics.control+=dur||1}if(kind==='dot'&&target.hp>0){target.dot=7;target.dotTurns=Math.max(target.dotTurns||0,dur||1);actor.metrics.control+=dur||1}}
 sk.cd=Math.max(sk.cd,Number(sk.cooldown||0))}
function executeActs(acts,team,enemy,ch,R){for(const a of acts){const actor=team[a.i];if(!actor||actor.hp<=0)continue;if(actor.stun){actor.stunTurns=Math.max(0,(actor.stunTurns||1)-1);actor.stun=actor.stunTurns>0?1:0;continue}const sk=actor.skills[a.si];if(!sk||sk.cd>0||!pay(ch,sk.cost))continue;actor.metrics.chakra+=(sk.cost||[]).length;actor.metrics.uses[a.si]++;const m=sk.mechanic||{},side=String(m.target||'enemy');let targets;if(m.aoe){targets=side==='self'?[actor]:side==='ally'?alive(team):alive(enemy)}else{const pool=side==='self'?[actor]:side==='ally'?team:enemy;targets=[pool.find(x=>x.slug===a.targetSlug&&x.hp>0)||weakest(pool)].filter(Boolean)}for(const target of targets){if(actor.hp<=0)break;apply(actor,target,sk,R)}}}
function tick(team){for(const f of team){if(f.hp>0&&f.dot&&f.dotTurns>0){hit(f,f.dot,{metrics:{damage:0,blocked:0}});f.dotTurns--;if(f.dotTurns<=0)f.dot=0}if(f.inv){f.invTurns=Math.max(0,(f.invTurns||1)-1);if(f.invTurns<=0)f.inv=0}if(f.shield&&f.shieldTurns>0){f.shieldTurns--;if(f.shieldTurns<=0)f.shield=0}for(const s of f.skills)if(s.cd)s.cd--}}
function metricsOf(team){const f=team.find(x=>x.focal);return f?JSON.parse(JSON.stringify(f.metrics)):null}
function simulate(a,b,seed,policy,first='A'){
 const R=rng(seed),A=teamFor(a,b),B=teamFor(b,a),chA=gain(emptyCh(),6,A,R),chB=gain(emptyCh(),6,B,R);let turn=1;
 for(;turn<=MAX_TURNS;turn++){
  const actsA=plan(A,B,chA,policy),actsB=plan(B,A,chB,policy);
  if(first==='A'){executeActs(actsA,A,B,chA,R);if(alive(B).length)executeActs(actsB,B,A,chB,R)}else{executeActs(actsB,B,A,chB,R);if(alive(A).length)executeActs(actsA,A,B,chA,R)}
  if(!alive(A).length||!alive(B).length)break;
  tick(A);tick(B);if(!alive(A).length||!alive(B).length)break;gain(chA,3,A,R);gain(chB,3,B,R)
 }
 const hpA=A.reduce((n,f)=>n+Math.max(0,f.hp),0),hpB=B.reduce((n,f)=>n+Math.max(0,f.hp),0);let winner='draw';if(!alive(B).length&&alive(A).length)winner='A';else if(!alive(A).length&&alive(B).length)winner='B';else if(turn>MAX_TURNS&&hpA!==hpB)winner=hpA>hpB?'A':'B';
 return{winner,turn:Math.min(turn,MAX_TURNS),hpA,hpB,metricsA:metricsOf(A),metricsB:metricsOf(B)}
}
function wilson(w,n,z=1.96){if(!n)return[0,1];const p=w/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,m=z*Math.sqrt((p*(1-p)+z*z/(4*n))/n)/d;return[round(Math.max(0,c-m)),round(Math.min(1,c+m))]}

const stats=new Map(chars.map(c=>[c.slug,{slug:c.slug,name:c.name,matches:0,wins:0,losses:0,draws:0,turns:0,hpDiff:0,damage:0,heal:0,shield:0,control:0,chakra:0,uses:[0,0,0,0]}]));
const matchups=[];
for(let i=0;i<chars.length;i++)for(let j=i+1;j<chars.length;j++){
 const A=chars[i],B=chars[j],m={a:A.slug,b:B.slug,games:0,aWins:0,bWins:0,draws:0,turns:0,hpDiff:0};
 for(const policy of POLICIES)for(let s=0;s<SEEDS;s++)for(const first of ['A','B']){
  const seed=hash(`${A.slug}|${B.slug}|${policy}|${s}|${first}`),r=simulate(A,B,seed,policy,first);m.games++;m.turns+=r.turn;m.hpDiff+=r.hpA-r.hpB;if(r.winner==='A')m.aWins++;else if(r.winner==='B')m.bWins++;else m.draws++;
  for(const [slug,outcome,met,hpd] of [[A.slug,r.winner==='A'?'win':r.winner==='B'?'loss':'draw',r.metricsA,r.hpA-r.hpB],[B.slug,r.winner==='B'?'win':r.winner==='A'?'loss':'draw',r.metricsB,r.hpB-r.hpA]]){const st=stats.get(slug);st.matches++;st[outcome==='win'?'wins':outcome==='loss'?'losses':'draws']++;st.turns+=r.turn;st.hpDiff+=hpd;st.damage+=met?.damage||0;st.heal+=met?.heal||0;st.shield+=met?.shield||0;st.control+=met?.control||0;st.chakra+=met?.chakra||0;for(let k=0;k<4;k++)st.uses[k]+=met?.uses?.[k]||0}
 }
 m.aScore=round((m.aWins+.5*m.draws)/m.games);m.avgTurns=round(m.turns/m.games,2);m.avgHpDiff=round(m.hpDiff/m.games,2);matchups.push(m)
}

const ratings=[...stats.values()].map(st=>{const decisive=st.wins+st.losses,ci=wilson(st.wins,decisive);return{...st,score:round((st.wins+.5*st.draws)/st.matches),winRate:decisive?round(st.wins/decisive):.5,winRate95:ci,avgTurns:round(st.turns/st.matches,2),avgHpDiff:round(st.hpDiff/st.matches,2),avgDamage:round(st.damage/st.matches,2),avgHeal:round(st.heal/st.matches,2),avgShield:round(st.shield/st.matches,2),avgControl:round(st.control/st.matches,2),avgChakraSpent:round(st.chakra/st.matches,2),skillUseShare:st.uses.map(x=>round(x/Math.max(1,st.uses.reduce((a,b)=>a+b,0))))}}).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
const medianScore=[...ratings].sort((a,b)=>a.score-b.score)[Math.floor(ratings.length/2)]?.score??.5;
const outliers=ratings.filter(r=>r.score<.45||r.score>.55||r.winRate95[1]<.48||r.winRate95[0]>.52).map(r=>({...r,distanceFromMedian:round(r.score-medianScore)}));
const summary={generatedAt:new Date().toISOString(),engine:'current-six-kind deterministic approximation',characters:chars.length,pairs:matchups.length,gamesPerPair:SEEDS*POLICIES.length*2,totalGames:matchups.reduce((n,m)=>n+m.games,0),seeds:SEEDS,policies:POLICIES,maxTurns:MAX_TURNS,teamMethod:'mesmos dois anchors em ambos os lados; apenas focal muda; ordem A/B espelhada',medianScore,outliers:outliers.length,top:ratings.slice(0,10).map(r=>({slug:r.slug,name:r.name,score:r.score,ci:r.winRate95})),bottom:ratings.slice(-10).map(r=>({slug:r.slug,name:r.name,score:r.score,ci:r.winRate95})),limitations:['motor composto/debuffs ainda não implementado; técnicas comprimidas podem distorcer resultado','sem equipamento/loadout/pergaminhos','focal medido com anchors iguais, não cobre todas as sinergias de trio','empates no limite de turnos são decididos por PV agregado quando diferentes']};
fs.writeFileSync(path.join(outDir,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'CHARACTER-RATINGS.json'),JSON.stringify(ratings,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'OUTLIERS.json'),JSON.stringify(outliers,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'MATCHUPS.json'),JSON.stringify(matchups,null,2)+'\n');
let md=`# Simulação determinística 3×3 — Naruto Unison\n\nGerada em ${summary.generatedAt}.\n\n## Escopo\n\n- **${summary.characters}** personagens padrão\n- **${summary.pairs}** pares focais\n- **${summary.gamesPerPair}** jogos por par\n- **${summary.totalGames}** partidas simuladas\n- Políticas: ${POLICIES.join(', ')}\n- Limite: ${MAX_TURNS} turnos\n\n## Método\n\nCada duelo usa os mesmos dois ninjas de apoio dos dois lados. Só o personagem focal muda. Cada seed roda com a ordem A→B e B→A, reduzindo viés de iniciativa. Chakra segue a demanda real do roster, limite 8 por tipo/24 total, 6 iniciais e +3 por rodada. Custos específicos e Rand seguem o algoritmo atual.\n\n## Resultado preliminar\n\n| Rank | Personagem | Score | Win rate* | IC95 | PV diff | Dano | Cura | Shield | Controle | Chakra |\n|---:|---|---:|---:|---|---:|---:|---:|---:|---:|---:|\n`;
ratings.forEach((r,i)=>{md+=`| ${i+1} | ${String(r.name).replace(/\|/g,'/')} | ${r.score} | ${r.winRate} | ${r.winRate95[0]}–${r.winRate95[1]} | ${r.avgHpDiff} | ${r.avgDamage} | ${r.avgHeal} | ${r.avgShield} | ${r.avgControl} | ${r.avgChakraSpent} |\n`});
md+=`\n*Win rate exclui empates; Score conta empate como 0,5.\n\n## Regra de uso\n\nEste relatório **não autoriza nerf/buff automático**. Primeiro cruzar outliers com a auditoria semântica e com o upstream canônico. Técnicas que hoje estão comprimidas em um kind incorreto devem ser corrigidas no motor antes de interpretar a força do personagem.\n`;
fs.writeFileSync(path.join(outDir,'SIMULATION-REPORT.md'),md);
console.log(JSON.stringify(summary,null,2));
if(summary.characters<2||summary.totalGames<summary.pairs*4)process.exitCode=2;
