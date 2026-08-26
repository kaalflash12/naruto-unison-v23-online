import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const simDir=path.join(root,process.env.SIM_DIR||'audit/balance/simulation-v2');
const summary=JSON.parse(fs.readFileSync(path.join(simDir,'SUMMARY.json'),'utf8'));
const ratings=JSON.parse(fs.readFileSync(path.join(simDir,'CHARACTER-RATINGS.json'),'utf8'));
const matchups=JSON.parse(fs.readFileSync(path.join(simDir,'MATCHUPS.json'),'utf8'));
if(summary.engineVersion!==2)throw new Error('engineVersion != 2');
if(!Array.isArray(ratings)||ratings.length!==summary.roster)throw new Error(`ratings=${ratings.length} roster=${summary.roster}`);
if(!Array.isArray(matchups)||matchups.length!==summary.pairs)throw new Error(`matchups=${matchups.length} pairs=${summary.pairs}`);

const ctx={window:{},console};ctx.window.window=ctx.window;vm.createContext(ctx);vm.runInContext(fs.readFileSync('roster.js','utf8'),ctx,{filename:'roster.js'});
const roster=ctx.window.NARUTO_ROSTER||[];
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function classification(c){if(c?.eventOnly===true||/^bijuu-/.test(String(c?.slug||'')))return'event';if(/chefe|boss|exclusiv/.test(norm(c?.bio)))return'special-review';return'standard'}
const classBySlug=new Map(roster.map(c=>[c.slug,classification(c)]));
const nameBySlug=new Map(ratings.map(r=>[r.slug,r.name]));
const round=(x,n=4)=>Number(Number(x||0).toFixed(n));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const pct=x=>`${round(x*100,1)}%`;

function rateFor(m,slug){
  if(m.a===slug)return(m.aWins+0.5*m.draws)/Math.max(1,m.games);
  if(m.b===slug)return(m.bWins+0.5*m.draws)/Math.max(1,m.games);
  return null;
}
const matchupBySlug=new Map(ratings.map(r=>[r.slug,[]]));
for(const m of matchups){
  for(const slug of [m.a,m.b]){
    const rate=rateFor(m,slug); if(rate==null)continue;
    matchupBySlug.get(slug)?.push({opponentId:slug===m.a?m.b:m.a,opponentName:nameBySlug.get(slug===m.a?m.b:m.a)||slug,n:m.games,score:round(rate),avgTurns:Number(m.avgTurns||0),avgHpDiff:round(slug===m.a?Number(m.avgHpDiff||0):-Number(m.avgHpDiff||0),2)});
  }
}
function ci(r){return Array.isArray(r.winRate95)&&r.winRate95.length===2?r.winRate95:[Number(r.winRate||0),Number(r.winRate||0)]}
function analyze(r){
  const score=Number(r.score??r.winRate??0.5),interval=ci(r),width=interval[1]-interval[0];
  const ordered=[...(matchupBySlug.get(r.slug)||[])].sort((a,b)=>a.score-b.score||a.opponentId.localeCompare(b.opponentId));
  const worst=ordered[0]||null,best=ordered.at(-1)||null;
  const flags=[];
  if(interval[0]>.65)flags.push('OVERPOWERED_HIGH_CONFIDENCE');
  if(interval[1]<.35)flags.push('UNDERPOWERED_HIGH_CONFIDENCE');
  if(score>=.75)flags.push('SEVERE_HIGH');
  if(score<=.25)flags.push('SEVERE_LOW');
  if(worst&&worst.score<=.10)flags.push('EXPLOITABLE_MATCHUP');
  if(width>.10)flags.push('HIGH_UNCERTAINTY');
  if((r.skillUseShare||[]).some(x=>Number(x)>=.80))flags.push('KIT_USAGE_CONCENTRATED');
  const strengthDistance=Math.abs(score-.5),exploit=worst?clamp(.5-worst.score,0,.5):0,usage=Math.max(0,...(r.skillUseShare||[]).map(Number))-.25;
  const priority=100*(.55*strengthDistance+.22*exploit+.10*clamp(Math.abs(Number(r.avgHpDiff||0))/300,0,1)+.08*clamp(width,0,.5)+.05*clamp(usage,0,.75));
  let action='HOLD';
  if(flags.includes('OVERPOWERED_HIGH_CONFIDENCE')||flags.includes('SEVERE_HIGH'))action='NERF_CANDIDATE';
  else if(flags.includes('UNDERPOWERED_HIGH_CONFIDENCE')||flags.includes('SEVERE_LOW'))action='BUFF_CANDIDATE';
  else if(flags.includes('EXPLOITABLE_MATCHUP'))action='MATCHUP_EXPLOITABILITY_REVIEW';
  else if(flags.includes('KIT_USAGE_CONCENTRATED'))action='KIT_DISTRIBUTION_REVIEW';
  return {characterId:r.slug,name:r.name,classification:classBySlug.get(r.slug)||'unknown',action,priorityScore:round(priority,2),score:round(score),winRate:Number(r.winRate||0),ci95:interval,ciWidth:round(width),avgTurns:Number(r.avgTurns||0),avgHpDiff:Number(r.avgHpDiff||0),avgDamage:Number(r.avgDamage||0),avgHeal:Number(r.avgHeal||0),avgDefense:Number(r.avgDefense||0),avgControl:Number(r.avgControl||0),avgChakraSpent:Number(r.avgChakraSpent||0),avgActions:Number(r.avgActions||0),skillUseShare:r.skillUseShare||[],worstMatchup:worst,bestMatchup:best,worstMatchups:ordered.slice(0,5),bestMatchups:ordered.slice(-5).reverse(),flags};
}
const rows=ratings.map(analyze).sort((a,b)=>b.priorityScore-a.priorityScore||b.score-a.score||a.name.localeCompare(b.name));
const temperature=.08,weights=rows.map(r=>Math.exp((r.score-.5)/temperature)),wt=weights.reduce((a,b)=>a+b,0)||1,shares=weights.map(x=>x/wt);
const entropyRaw=-shares.reduce((s,p)=>s+(p>0?p*Math.log(p):0),0),entropy=entropyRaw/Math.log(Math.max(2,rows.length)),hhi=shares.reduce((s,p)=>s+p*p,0),sorted=[...shares].sort((a,b)=>b-a),topShare=n=>sorted.slice(0,n).reduce((a,b)=>a+b,0);
const actionCounts={},flagCounts={},classificationCounts={};
for(const r of rows){actionCounts[r.action]=(actionCounts[r.action]||0)+1;classificationCounts[r.classification]=(classificationCounts[r.classification]||0)+1;for(const f of r.flags)flagCounts[f]=(flagCounts[f]||0)+1}
const health={meanAbsoluteScoreDeviation:round(mean(rows.map(r=>Math.abs(r.score-.5)))),extremeCount:rows.filter(r=>r.score>=.65||r.score<=.35).length,severeCount:rows.filter(r=>r.score>=.75||r.score<=.25).length,exploitableCount:rows.filter(r=>r.flags.includes('EXPLOITABLE_MATCHUP')).length,highUncertaintyCount:rows.filter(r=>r.flags.includes('HIGH_UNCERTAINTY')).length,kitConcentratedCount:rows.filter(r=>r.flags.includes('KIT_USAGE_CONCENTRATED')).length};
const outDir=path.join(root,'audit','balance','analysis-v2',summary.scope||'unknown');fs.mkdirSync(outDir,{recursive:true});
const outSummary={generatedAt:new Date().toISOString(),sourceGeneratedAt:summary.generatedAt,engineVersion:summary.engineVersion,scope:summary.scope,totalRoster:summary.totalRoster,eligibleRoster:summary.eligibleRoster,characters:rows.length,excludedCharacters:summary.excludedCharacters||[],pairs:summary.pairs,games:summary.matchups,seeds:summary.seeds,policies:summary.policies,classificationCounts,actionCounts,flagCounts,health,concentration:{normalizedEntropy:round(entropy),hhi:round(hhi,6),effectiveRoster:round(Math.exp(entropyRaw),2),top5StrengthShare:round(topShare(5)),top10StrengthShare:round(topShare(10)),top25StrengthShare:round(topShare(25))},methodReferences:[{repository:'google-deepmind/open_spiel',applied:'matriz de confrontos e pior caso como proxy operacional de exploitability'},{repository:'sublee/trueskill',applied:'decisões condicionadas por intervalo de confiança, não apenas estimativa pontual'},{repository:'EbTech/Elo-MMR',applied:'força global usada como evidência complementar à matriz, nunca como única decisão'},{repository:'nianticlabs/metagame-balance',applied:'entropia/HHI e concentração de força para saúde do meta'}],limitations:['O simulador v2 atual agrega balanced/aggressive e as duas ordens de iniciativa; esta camada não inventa métricas separadas de política/ordem.','Event/special são analisados no scope=all, mas não entram no ranking competitivo scope=competitive.'],decisionRule:'Corrigir primeiro divergência canônica/mecânica. Buff/nerf numérico somente quando a simulação v2 e o intervalo de confiança sustentarem o desequilíbrio após a correção mecânica.'};
fs.writeFileSync(path.join(outDir,'SUMMARY.json'),JSON.stringify(outSummary,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'CHARACTER-ANALYSIS.json'),JSON.stringify(rows,null,2)+'\n');
let md=`# Análise de balanceamento v2 — ${summary.scope}\n\n- Cobertura: **${rows.length} personagens** de ${summary.totalRoster}.\n- Pares: **${summary.pairs}**; jogos: **${summary.matchups}**.\n- Entropia normalizada: **${round(entropy,3)}**; HHI: **${round(hhi,5)}**.\n- Candidatos a nerf: **${actionCounts.NERF_CANDIDATE||0}**; buff: **${actionCounts.BUFF_CANDIDATE||0}**.\n\n> Ação é triagem. Nenhum número é aplicado automaticamente. Divergência canônica/mecânica tem precedência.\n\n| # | Personagem | Classe | Ação | Score | IC95 | Pior confronto | Dano | Defesa | Controle | Chakra | Prioridade | Flags |\n|---:|---|---|---|---:|---|---|---:|---:|---:|---:|---:|---|\n`;
rows.slice(0,100).forEach((r,i)=>{md+=`| ${i+1} | ${String(r.name).replace(/\|/g,'\\|')} | ${r.classification} | ${r.action} | ${pct(r.score)} | ${pct(r.ci95[0])}–${pct(r.ci95[1])} | ${r.worstMatchup?`${String(r.worstMatchup.opponentName).replace(/\|/g,'\\|')} ${pct(r.worstMatchup.score)}`:'—'} | ${r.avgDamage} | ${r.avgDefense} | ${r.avgControl} | ${r.avgChakraSpent} | ${r.priorityScore} | ${r.flags.join(', ')} |\n`});
fs.writeFileSync(path.join(outDir,'REPORT.md'),md);
console.log(JSON.stringify(outSummary,null,2));
