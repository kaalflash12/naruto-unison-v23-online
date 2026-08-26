import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const outDir=path.join(root,'audit','balance','current');
const chars=JSON.parse(fs.readFileSync(path.join(outDir,'CHARACTER-SIMULATION.json'),'utf8'));
const simSummary=JSON.parse(fs.readFileSync(path.join(outDir,'SIMULATION-SUMMARY.json'),'utf8'));
if(!Array.isArray(chars)||chars.length<2) throw new Error('CHARACTER-SIMULATION.json inválido');

const round=(x,n=4)=>Number(Number(x||0).toFixed(n));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const pct=x=>`${round(x*100,1)}%`;
function eloEquivalent(p){
  const q=clamp(Number(p||0),0.01,0.99);
  return Math.round(1500+400*Math.log10(q/(1-q)));
}
function policyRates(c){return Object.values(c?.duel?.policies||{}).map(x=>Number(x?.winRate||0)).filter(Number.isFinite)}
function worstRate(c){const a=c?.worstMatchups||[];return a.length?Math.min(...a.map(x=>Number(x?.winRate??1))):1}
function classify(c){
  const team=Number(c?.team3v3?.winRate||0),duel=Number(c?.duel?.winRate||0);
  const first=Number(c?.duel?.firstActionWinRate||0),second=Number(c?.duel?.secondActionWinRate||0);
  const pr=policyRates(c),orderGap=Math.abs(first-second),policyRange=pr.length?Math.max(...pr)-Math.min(...pr):0;
  const roleGap=Math.abs(team-duel),worst=worstRate(c);
  let action='HOLD';
  if((team>=0.65&&duel>=0.60)||team>=0.72) action='NERF_CANDIDATE';
  else if((team<=0.35&&duel<=0.40)||team<=0.28) action='BUFF_CANDIDATE';
  else if(roleGap>=0.25) action='TEAM_ROLE_SYNERGY_REVIEW';
  else if(orderGap>=0.15) action='TURN_ORDER_REVIEW';
  else if(policyRange>=0.15) action='POLICY_ROBUSTNESS_REVIEW';
  else if(worst<=0.10) action='MATCHUP_EXPLOITABILITY_REVIEW';
  const priority=100*(2.2*Math.abs(team-.5)+1.25*Math.abs(duel-.5)+.8*orderGap+.55*policyRange+.35*roleGap+.2*(1-worst));
  return {action,priority:round(priority,2),teamWinRate:team,duelWinRate:duel,orderGap:round(orderGap),policyRange:round(policyRange),teamDuelGap:round(roleGap),worstMatchupWinRate:round(worst)};
}

const rows=chars.map(c=>{
  const x=classify(c);
  return {
    characterId:c.characterId,name:c.name,
    ...x,
    teamWinRate95:c?.team3v3?.winRate95||null,
    duelWinRate95:c?.duel?.winRate95||null,
    avgTeamTurns:Number(c?.team3v3?.avgTurns||0),
    avgDuelTurns:Number(c?.duel?.avgTurns||0),
    firstActionWinRate:Number(c?.duel?.firstActionWinRate||0),
    secondActionWinRate:Number(c?.duel?.secondActionWinRate||0),
    policyWinRates:Object.fromEntries(Object.entries(c?.duel?.policies||{}).map(([k,v])=>[k,Number(v?.winRate||0)])),
    worstMatchups:(c?.worstMatchups||[]).slice(0,5),
    bestMatchups:(c?.bestMatchups||[]).slice(0,5),
    duelEloEquivalent:eloEquivalent(x.duelWinRate),
    teamEloEquivalent:eloEquivalent(x.teamWinRate)
  };
}).sort((a,b)=>b.priority-a.priority||b.teamWinRate-a.teamWinRate);

// Proxy de concentração de força: não representa pick-rate real de jogadores.
// Converte win-rate 3x3 em peso competitivo suave; quanto menor a entropia normalizada,
// mais a força está concentrada em poucos personagens.
const temperature=0.08;
const rawWeights=rows.map(r=>Math.exp((r.teamWinRate-.5)/temperature));
const weightTotal=rawWeights.reduce((a,b)=>a+b,0)||1;
const shares=rawWeights.map(x=>x/weightTotal);
const entropyRaw=-shares.reduce((s,p)=>s+(p>0?p*Math.log(p):0),0);
const entropyNormalized=entropyRaw/Math.log(rows.length);
const hhi=shares.reduce((s,p)=>s+p*p,0);
const effectiveRoster=Math.exp(entropyRaw);
const sortedShares=[...shares].sort((a,b)=>b-a);
const topShare=n=>sortedShares.slice(0,n).reduce((a,b)=>a+b,0);

const counts={};
for(const r of rows)counts[r.action]=(counts[r.action]||0)+1;
const health={
  teamMeanAbsoluteDeviation:round(mean(rows.map(r=>Math.abs(r.teamWinRate-.5)))),
  duelMeanAbsoluteDeviation:round(mean(rows.map(r=>Math.abs(r.duelWinRate-.5)))),
  meanOrderGap:round(mean(rows.map(r=>r.orderGap))),
  meanPolicyRange:round(mean(rows.map(r=>r.policyRange))),
  teamExtremeCount:rows.filter(r=>r.teamWinRate>=.65||r.teamWinRate<=.35).length,
  duelExtremeCount:rows.filter(r=>r.duelWinRate>=.65||r.duelWinRate<=.35).length,
  orderSensitiveCount:rows.filter(r=>r.orderGap>=.15).length,
  policySensitiveCount:rows.filter(r=>r.policyRange>=.15).length,
  severelyExploitableCount:rows.filter(r=>r.worstMatchupWinRate<=.10).length
};
const meta={
  generatedAt:new Date().toISOString(),
  sourceSimulationGeneratedAt:simSummary.generatedAt,
  characters:rows.length,
  methodology:{
    monteCarlo:'usa a simulação reproduzível existente com seeds e IC95',
    rating:'Elo-equivalente via log-odds do win-rate; ferramenta comparativa, não rating de matchmaking',
    metaEntropy:'Shannon normalizada sobre pesos competitivos derivados do win-rate 3x3; proxy de concentração de força, não pick-rate real',
    hhi:'Herfindahl-Hirschman sobre os mesmos pesos competitivos',
    robustness:'gap de ordem de ação, faixa entre políticas e pior matchup',
    intervention:'prioridade combina desvio 3x3, duelo, ordem, política, papel e exploitability; nunca altera roster automaticamente'
  },
  externalPatternsApplied:[
    {source:'DevBawky/Kalivra',pattern:'Monte Carlo, intervalos, TTK e análise de distribuição',applied:'mantidos seeds, IC95 e turnos; prioridade deixa média isolada em segundo plano'},
    {source:'nianticlabs/metagame-balance',pattern:'diversidade/entropia do meta',applied:'entropia normalizada, HHI, roster efetivo e concentração top-N como proxy de concentração de força'},
    {source:'kuds/reinforce-tactics',pattern:'round-robin, múltiplos agentes/políticas e Elo',applied:'quatro políticas existentes + Elo-equivalente de duelo e 3x3'},
    {source:'google-deepmind/open_spiel',pattern:'matriz de resultados, políticas e exploitability',applied:'pior matchup, sensibilidade por política e prioridade de exploitability'},
    {source:'chocola-mint/Sorting-Battle',pattern:'paridade entre ambiente de simulação e game core',applied:'simulador continua alinhado à semântica do app-online.js e probes do naruto-api'}
  ],
  concentration:{
    temperature,
    normalizedEntropy:round(entropyNormalized),
    hhi:round(hhi,6),
    effectiveRoster:round(effectiveRoster,2),
    top5StrengthShare:round(topShare(5)),
    top10StrengthShare:round(topShare(10)),
    top25StrengthShare:round(topShare(25))
  },
  health,
  interventionCounts:counts,
  priorities:rows
};
fs.writeFileSync(path.join(outDir,'META-BALANCE.json'),JSON.stringify(meta,null,2)+'\n');

const top=r=>rows.filter(x=>x.action===r).slice(0,30);
const esc=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
function table(list){
  let s='| Personagem | Ação | 3x3 | Duelo | Elo 3x3 | Ordem Δ | Política Δ | Pior matchup | Prioridade |\n|---|---|---:|---:|---:|---:|---:|---:|---:|\n';
  for(const r of list)s+=`| ${esc(r.name)} | ${r.action} | ${pct(r.teamWinRate)} | ${pct(r.duelWinRate)} | ${r.teamEloEquivalent} | ${pct(r.orderGap)} | ${pct(r.policyRange)} | ${pct(r.worstMatchupWinRate)} | ${r.priority} |\n`;
  return s;
}
let md=`# Meta-balance — prioridade de intervenção\n\nGerado em: ${meta.generatedAt}\n\n## O que esta camada acrescenta\n\nEla não muda dano nem efeito. Ela transforma a simulação existente em decisão auditável: força 3x3, força de duelo, sensibilidade à ordem, robustez entre políticas, pior matchup, rating comparável e concentração do meta.\n\n## Saúde global\n\n- Entropia normalizada de força: **${round(entropyNormalized,3)}** (1 = força perfeitamente distribuída).\n- HHI de força: **${round(hhi,5)}**.\n- Roster efetivo pela entropia: **${round(effectiveRoster,1)} / ${rows.length}**.\n- Top 5 concentram **${pct(topShare(5))}** do peso competitivo; Top 10 **${pct(topShare(10))}**; Top 25 **${pct(topShare(25))}**.\n- Desvio absoluto médio do 50%: 3x3 **${pct(health.teamMeanAbsoluteDeviation)}**, duelo **${pct(health.duelMeanAbsoluteDeviation)}**.\n- ${health.teamExtremeCount} personagens estão fora de 35–65% no 3x3.\n- ${health.orderSensitiveCount} têm diferença de pelo menos 15 p.p. entre agir primeiro e segundo.\n- ${health.policySensitiveCount} variam pelo menos 15 p.p. entre políticas.\n- ${health.severelyExploitableCount} têm ao menos um matchup simulado com win-rate ≤10%.\n\n## Candidatos a nerf\n\n${table(top('NERF_CANDIDATE'))}\n\n## Candidatos a buff\n\n${table(top('BUFF_CANDIDATE'))}\n\n## Revisões estruturais antes de mexer em números\n\n${table(rows.filter(r=>['TEAM_ROLE_SYNERGY_REVIEW','TURN_ORDER_REVIEW','POLICY_ROBUSTNESS_REVIEW','MATCHUP_EXPLOITABILITY_REVIEW'].includes(r.action)).slice(0,50))}\n\n## Regra de aplicação\n\n1. **NERF/BUFF_CANDIDATE não significa alteração automática.** Primeiro conferir os quatro jutsus, descrição, alvo, efeito, custo e cooldown contra o upstream/cânone.\n2. Corrigir divergência mecânica antes de balancear valor.\n3. Para ordem de ação, corrigir runtime/regra global antes de nerfar personagem individual.\n4. Para gap 1x1↔3x3, revisar AoE, suporte e sinergia de equipe; não compensar com dano bruto sem prova.\n5. Depois de cada lote, executar novamente 1x1 completo + 3x3 Monte Carlo e comparar IC95, entropia, HHI e prioridades.\n`;
fs.writeFileSync(path.join(outDir,'META-BALANCE-REPORT.md'),md);
console.log(JSON.stringify({characters:rows.length,concentration:meta.concentration,health,interventionCounts:counts,topPriorities:rows.slice(0,10).map(x=>({name:x.name,action:x.action,priority:x.priority,team:x.teamWinRate,duel:x.duelWinRate}))},null,2));
