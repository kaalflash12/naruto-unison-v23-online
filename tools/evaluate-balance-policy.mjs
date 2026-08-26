import fs from 'node:fs';
import path from 'node:path';

const input=path.join(process.cwd(),'audit','balance','current','CHARACTER-SIMULATION.json');
const outDir=path.join(process.cwd(),'audit','balance','evaluation');
fs.mkdirSync(outDir,{recursive:true});
if(!fs.existsSync(input))throw new Error('CHARACTER-SIMULATION.json ausente');
const rows=JSON.parse(fs.readFileSync(input,'utf8'));
if(!Array.isArray(rows)||rows.length<190)throw new Error('simulação de personagens incompleta');

const round=(x,n=4)=>Number(Number(x||0).toFixed(n));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const policy={
  targetBand:[0.35,0.65],
  severeBand:[0.25,0.75],
  exploitabilityWinRate:0.10,
  orderSensitivity:0.15,
  policySensitivity:0.15,
  uncertaintyWidth:0.10,
  minWorstMatchupGames:8
};

function ci(x){const a=x?.winRate95;return Array.isArray(a)&&a.length===2?a:[Number(x?.winRate||0),Number(x?.winRate||0)]}
function policies(x){return Object.values(x?.policies||{}).map(v=>Number(v?.winRate)).filter(Number.isFinite)}
function evaluate(r){
  const duel=Number(r.duel?.winRate||0),team=Number(r.team3v3?.winRate||0),dci=ci(r.duel),tci=ci(r.team3v3);
  const worst=(r.worstMatchups||[]).filter(x=>Number(x.n||0)>=policy.minWorstMatchupGames).sort((a,b)=>Number(a.winRate)-Number(b.winRate))[0]||null;
  const orderGap=Math.abs(Number(r.duel?.firstActionWinRate||0)-Number(r.duel?.secondActionWinRate||0));
  const ps=policies(r.duel),policyGap=ps.length?Math.max(...ps)-Math.min(...ps):0;
  const flags=[];
  if(tci[0]>policy.targetBand[1]||dci[0]>policy.targetBand[1])flags.push('OVERPOWERED_HIGH_CONFIDENCE');
  if(tci[1]<policy.targetBand[0]||dci[1]<policy.targetBand[0])flags.push('UNDERPOWERED_HIGH_CONFIDENCE');
  if(team>=policy.severeBand[1]||duel>=policy.severeBand[1])flags.push('SEVERE_HIGH');
  if(team<=policy.severeBand[0]||duel<=policy.severeBand[0])flags.push('SEVERE_LOW');
  if(worst&&Number(worst.winRate)<=policy.exploitabilityWinRate)flags.push('EXPLOITABLE_MATCHUP');
  if(orderGap>=policy.orderSensitivity)flags.push('ORDER_SENSITIVE');
  if(policyGap>=policy.policySensitivity)flags.push('POLICY_SENSITIVE');
  if((dci[1]-dci[0])>policy.uncertaintyWidth||(tci[1]-tci[0])>policy.uncertaintyWidth)flags.push('HIGH_UNCERTAINTY');
  const exploitability=worst?clamp(0.5-Number(worst.winRate),0,0.5):0;
  const distance=Math.max(Math.abs(team-.5),Math.abs(duel-.5));
  const priority=100*(0.45*distance+0.25*exploitability+0.15*clamp(orderGap,0,.5)+0.10*clamp(policyGap,0,.5)+0.05*Math.max(dci[1]-dci[0],tci[1]-tci[0]));
  return {
    characterId:r.characterId,name:r.name,
    duel:{winRate:duel,ci95:dci,firstActionWinRate:r.duel?.firstActionWinRate,secondActionWinRate:r.duel?.secondActionWinRate,orderGap:round(orderGap),policyGap:round(policyGap)},
    team3v3:{winRate:team,ci95:tci},
    worstMatchup:worst?{opponentId:worst.opponentId,opponentName:worst.opponentName,n:worst.n,winRate:worst.winRate}:null,
    exploitabilityProxy:round(exploitability),balanceDistance:round(distance),priorityScore:round(priority,2),flags
  };
}
const evaluation=rows.map(evaluate).sort((a,b)=>b.priorityScore-a.priorityScore||a.name.localeCompare(b.name));
const count=f=>evaluation.filter(x=>x.flags.includes(f)).length;
const summary={
  generatedAt:new Date().toISOString(),characters:evaluation.length,policy,
  methodReferences:[
    {repository:'google-deepmind/open_spiel',applied:'worst-case matchup / exploitability-style robustness proxy; self-play policy robustness'},
    {repository:'sublee/trueskill',applied:'uncertainty-aware decisions: confidence intervals must support a buff/nerf instead of raw win-rate alone'},
    {repository:'EbTech/Elo-MMR',applied:'large-field rating principle retained alongside matchup outcomes; no single scalar rating is allowed to override matchup evidence'}
  ],
  counts:{
    overpoweredHighConfidence:count('OVERPOWERED_HIGH_CONFIDENCE'),
    underpoweredHighConfidence:count('UNDERPOWERED_HIGH_CONFIDENCE'),
    severeHigh:count('SEVERE_HIGH'),severeLow:count('SEVERE_LOW'),
    exploitable:count('EXPLOITABLE_MATCHUP'),orderSensitive:count('ORDER_SENSITIVE'),policySensitive:count('POLICY_SENSITIVE'),highUncertainty:count('HIGH_UNCERTAINTY')
  },
  decisionRule:'Mechanic/canonical correctness first. Numeric buff/nerf only after canonical mismatch is cleared and confidence-aware simulation still shows imbalance.'
};
fs.writeFileSync(path.join(outDir,'BALANCE-EVALUATION.json'),JSON.stringify(evaluation,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
let md='# Avaliação de balanceamento — incerteza e exploitability\n\n';
md+=`Gerado em: ${summary.generatedAt}\n\n`;
md+='## Métodos aplicados\n\n- **OpenSpiel:** pior confronto como proxy operacional de exploitability e robustez contra políticas distintas.\n- **TrueSkill:** princípio de incerteza; decisão usa intervalo de confiança, não win-rate pontual isolado.\n- **Elo-MMR:** rating global é evidência complementar; não substitui matriz de confrontos.\n\n';
md+='## Regra de decisão\n\n1. Corrigir primeiro divergência canônica/mecânica.\n2. Reexecutar simulação.\n3. Só recomendar número quando o intervalo de confiança sustenta força/fraqueza fora da faixa e o resultado não é explicado por ordem/política/matchup isolado.\n\n';
md+='## Maiores prioridades atuais\n\n| # | Personagem | 3×3 | Duelo | Pior matchup | Exploit. | Ordem | Política | Score | Flags |\n|---:|---|---:|---:|---:|---:|---:|---:|---:|---|\n';
evaluation.slice(0,60).forEach((x,i)=>{md+=`| ${i+1} | ${x.name.replace(/\|/g,'\\|')} | ${(100*x.team3v3.winRate).toFixed(1)}% | ${(100*x.duel.winRate).toFixed(1)}% | ${x.worstMatchup?(100*x.worstMatchup.winRate).toFixed(1)+'%':'—'} | ${(100*x.exploitabilityProxy).toFixed(1)} | ${(100*x.duel.orderGap).toFixed(1)} | ${(100*x.duel.policyGap).toFixed(1)} | ${x.priorityScore.toFixed(2)} | ${x.flags.join(', ')} |\n`});
fs.writeFileSync(path.join(outDir,'BALANCE-EVALUATION.md'),md);
console.log(JSON.stringify(summary,null,2));
