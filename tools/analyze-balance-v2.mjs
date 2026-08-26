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
if(!summary.initiative||!ratings.every(r=>r.policyScores&&r.initiativeScores&&r.skillUsage))throw new Error('diagnósticos separados de política/iniciativa/uso ausentes');

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
const THRESHOLDS={nearUnusedShare:.02,dominantShare:.60,policySensitivity:.08,initiativeSensitivity:.08};

const overrideLimitationsBySlug=new Map();
const overrideFile=path.join(root,'balance','canonical-v2-overrides.json');
if(fs.existsSync(overrideFile)){
  const ov=JSON.parse(fs.readFileSync(overrideFile,'utf8'));
  for(const [key,value] of Object.entries(ov.overrides||{})){
    const slug=key.replace(/:\d+$/,'');
    if(Array.isArray(value?.limitations)&&value.limitations.length){
      if(!overrideLimitationsBySlug.has(slug))overrideLimitationsBySlug.set(slug,[]);
      overrideLimitationsBySlug.get(slug).push(...value.limitations.map(String));
    }
  }
}

function rateFor(m,slug){
  if(m.a===slug)return(m.aWins+0.5*m.draws)/Math.max(1,m.games);
  if(m.b===slug)return(m.bWins+0.5*m.draws)/Math.max(1,m.games);
  return null;
}

function fitPairwiseElo(slugs,pairs){
  const elo=new Map(slugs.map(s=>[s,1500]));
  for(let iter=0;iter<120;iter++){
    const delta=new Map(slugs.map(s=>[s,0]));
    const weight=new Map(slugs.map(s=>[s,0]));
    for(const m of pairs){
      const games=Math.max(1,Number(m.games||0));
      const ra=elo.get(m.a)??1500,rb=elo.get(m.b)??1500;
      const expected=1/(1+10**((rb-ra)/400));
      const observed=(Number(m.aWins||0)+0.5*Number(m.draws||0))/games;
      const w=Math.sqrt(games);
      const residual=(observed-expected)*w;
      delta.set(m.a,(delta.get(m.a)||0)+residual);
      delta.set(m.b,(delta.get(m.b)||0)-residual);
      weight.set(m.a,(weight.get(m.a)||0)+w);
      weight.set(m.b,(weight.get(m.b)||0)+w);
    }
    let maxStep=0;
    for(const slug of slugs){
      const step=32*(delta.get(slug)||0)/Math.max(1,weight.get(slug)||0);
      elo.set(slug,(elo.get(slug)||1500)+step);
      maxStep=Math.max(maxStep,Math.abs(step));
    }
    const center=mean([...elo.values()]);
    for(const slug of slugs)elo.set(slug,(elo.get(slug)||1500)-center+1500);
    if(maxStep<1e-5)break;
  }
  return elo;
}

const eloBySlug=fitPairwiseElo(ratings.map(r=>r.slug),matchups);
const matchupBySlug=new Map(ratings.map(r=>[r.slug,[]]));
for(const m of matchups){
  for(const slug of [m.a,m.b]){
    const rate=rateFor(m,slug);if(rate==null)continue;
    matchupBySlug.get(slug)?.push({opponentId:slug===m.a?m.b:m.a,opponentName:nameBySlug.get(slug===m.a?m.b:m.a)||slug,n:m.games,score:round(rate),avgTurns:Number(m.avgTurns||0),avgHpDiff:round(slug===m.a?Number(m.avgHpDiff||0):-Number(m.avgHpDiff||0),2)});
  }
}
function ci(r){return Array.isArray(r.winRate95)&&r.winRate95.length===2?r.winRate95:[Number(r.winRate||0),Number(r.winRate||0)]}
function analyze(r){
  const score=Number(r.score??r.winRate??0.5),interval=ci(r),width=interval[1]-interval[0];
  const ordered=[...(matchupBySlug.get(r.slug)||[])].sort((a,b)=>a.score-b.score||a.opponentId.localeCompare(b.opponentId));
  const worst=ordered[0]||null,best=ordered.at(-1)||null;
  const eloLikeRating=Number(eloBySlug.get(r.slug)||1500);
  const flags=[];
  if(interval[0]>.65)flags.push('OVERPOWERED_HIGH_CONFIDENCE');
  if(interval[1]<.35)flags.push('UNDERPOWERED_HIGH_CONFIDENCE');
  if(score>=.75)flags.push('SEVERE_HIGH');
  if(score<=.25)flags.push('SEVERE_LOW');
  if(worst&&worst.score<=.10)flags.push('EXPLOITABLE_MATCHUP');
  if(width>.10)flags.push('HIGH_UNCERTAINTY');
  const nearUnused=[...(r.skillUsage?.nearUnused||[])],dominant=[...(r.skillUsage?.dominant||[])];
  if(nearUnused.length)flags.push('SKILL_NEAR_UNUSED');
  if(dominant.length)flags.push('SKILL_DOMINANT');
  if((r.skillUseShare||[]).some(x=>Number(x)>=.80))flags.push('KIT_USAGE_CONCENTRATED');
  if(Number(r.policyDelta||0)>=THRESHOLDS.policySensitivity)flags.push('AI_POLICY_SENSITIVE');
  if(Math.abs(Number(r.initiativeDelta||0))>=THRESHOLDS.initiativeSensitivity)flags.push('INITIATIVE_SENSITIVE');
  const engineLimitations=overrideLimitationsBySlug.get(r.slug)||[];
  if(engineLimitations.length)flags.push('ENGINE_MECHANIC_REVIEW');
  if(eloLikeRating>=1700)flags.push('PAIRWISE_RATING_HIGH');
  if(eloLikeRating<=1300)flags.push('PAIRWISE_RATING_LOW');
  const strengthDistance=Math.abs(score-.5),exploit=worst?clamp(.5-worst.score,0,.5):0,usage=Math.max(0,...(r.skillUseShare||[]).map(Number))-.25;
  const priority=100*(.55*strengthDistance+.22*exploit+.10*clamp(Math.abs(Number(r.avgHpDiff||0))/300,0,1)+.08*clamp(width,0,.5)+.05*clamp(usage,0,.75));
  let action='HOLD';
  if(flags.includes('OVERPOWERED_HIGH_CONFIDENCE')||flags.includes('SEVERE_HIGH'))action='NERF_CANDIDATE';
  else if(flags.includes('UNDERPOWERED_HIGH_CONFIDENCE')||flags.includes('SEVERE_LOW'))action='BUFF_CANDIDATE';
  else if(flags.includes('EXPLOITABLE_MATCHUP'))action='MATCHUP_EXPLOITABILITY_REVIEW';
  else if(flags.includes('SKILL_DOMINANT')||flags.includes('SKILL_NEAR_UNUSED'))action='KIT_DISTRIBUTION_REVIEW';
  const suspectedDomains=[];
  if(flags.includes('ENGINE_MECHANIC_REVIEW'))suspectedDomains.push('ENGINE');
  if(flags.includes('AI_POLICY_SENSITIVE'))suspectedDomains.push('AI');
  if(flags.includes('SKILL_DOMINANT')||flags.includes('SKILL_NEAR_UNUSED')||flags.includes('KIT_USAGE_CONCENTRATED'))suspectedDomains.push('TECHNIQUE');
  if(flags.some(f=>['OVERPOWERED_HIGH_CONFIDENCE','UNDERPOWERED_HIGH_CONFIDENCE','SEVERE_HIGH','SEVERE_LOW','PAIRWISE_RATING_HIGH','PAIRWISE_RATING_LOW'].includes(f)))suspectedDomains.push('CHARACTER');
  if(!suspectedDomains.length)suspectedDomains.push('NONE_DETECTED');
  const policyScores=r.policyScores||{},initiativeScores=r.initiativeScores||{};
  return {characterId:r.slug,name:r.name,classification:classBySlug.get(r.slug)||'unknown',action,priorityScore:round(priority,2),score:round(score),winRate:Number(r.winRate||0),ci95:interval,ciWidth:round(width),eloLikeRating:round(eloLikeRating,2),eloDelta:round(eloLikeRating-1500,2),avgTurns:Number(r.avgTurns||0),avgHpDiff:Number(r.avgHpDiff||0),avgDamage:Number(r.avgDamage||0),avgHeal:Number(r.avgHeal||0),avgDefense:Number(r.avgDefense||0),avgControl:Number(r.avgControl||0),avgChakraSpent:Number(r.avgChakraSpent||0),avgActions:Number(r.avgActions||0),skillUseShare:r.skillUseShare||[],skillUsage:{nearUnused,dominant,minShare:Number(r.skillUsage?.minShare||0),maxShare:Number(r.skillUsage?.maxShare||0)},policyScores,policyDelta:Number(r.policyDelta||0),initiativeScores,initiativeDelta:Number(r.initiativeDelta||0),engineLimitations,suspectedDomains,worstMatchup:worst,bestMatchup:best,worstMatchups:ordered.slice(0,5),bestMatchups:ordered.slice(-5).reverse(),flags};
}
const rows=ratings.map(analyze).sort((a,b)=>b.priorityScore-a.priorityScore||b.score-a.score||a.name.localeCompare(b.name));

const temperature=.08,scoreWeights=rows.map(r=>Math.exp((r.score-.5)/temperature)),scoreWt=scoreWeights.reduce((a,b)=>a+b,0)||1,scoreShares=scoreWeights.map(x=>x/scoreWt);
const eloWeights=rows.map(r=>10**((r.eloLikeRating-1500)/400)),eloWt=eloWeights.reduce((a,b)=>a+b,0)||1,eloShares=eloWeights.map(x=>x/eloWt);
function concentration(shares){
  const entropyRaw=-shares.reduce((s,p)=>s+(p>0?p*Math.log(p):0),0);
  const sorted=[...shares].sort((a,b)=>b-a);
  const topShare=n=>sorted.slice(0,n).reduce((a,b)=>a+b,0);
  return {normalizedEntropy:round(entropyRaw/Math.log(Math.max(2,shares.length))),hhi:round(shares.reduce((s,p)=>s+p*p,0),6),effectiveRoster:round(Math.exp(entropyRaw),2),top5StrengthShare:round(topShare(5)),top10StrengthShare:round(topShare(10)),top25StrengthShare:round(topShare(25))};
}
const scoreConcentration=concentration(scoreShares),eloConcentration=concentration(eloShares);
const actionCounts={},flagCounts={},classificationCounts={},suspectedDomainCounts={};
for(const r of rows){actionCounts[r.action]=(actionCounts[r.action]||0)+1;classificationCounts[r.classification]=(classificationCounts[r.classification]||0)+1;for(const f of r.flags)flagCounts[f]=(flagCounts[f]||0)+1;for(const d of r.suspectedDomains)suspectedDomainCounts[d]=(suspectedDomainCounts[d]||0)+1}
const initiative=summary.initiative;
const initiativeSignificant=Array.isArray(initiative.firstScore95)&&!(initiative.firstScore95[0]<=.5&&initiative.firstScore95[1]>=.5);
const health={meanAbsoluteScoreDeviation:round(mean(rows.map(r=>Math.abs(r.score-.5)))),extremeCount:rows.filter(r=>r.score>=.65||r.score<=.35).length,severeCount:rows.filter(r=>r.score>=.75||r.score<=.25).length,exploitableCount:rows.filter(r=>r.flags.includes('EXPLOITABLE_MATCHUP')).length,highUncertaintyCount:rows.filter(r=>r.flags.includes('HIGH_UNCERTAINTY')).length,kitConcentratedCount:rows.filter(r=>r.flags.includes('KIT_USAGE_CONCENTRATED')).length,nearUnusedSkillCharacterCount:rows.filter(r=>r.flags.includes('SKILL_NEAR_UNUSED')).length,dominantSkillCharacterCount:rows.filter(r=>r.flags.includes('SKILL_DOMINANT')).length,aiPolicySensitiveCount:rows.filter(r=>r.flags.includes('AI_POLICY_SENSITIVE')).length,initiativeSensitiveCount:rows.filter(r=>r.flags.includes('INITIATIVE_SENSITIVE')).length,engineMechanicReviewCount:rows.filter(r=>r.flags.includes('ENGINE_MECHANIC_REVIEW')).length,pairwiseRatingHighCount:rows.filter(r=>r.eloLikeRating>=1700).length,pairwiseRatingLowCount:rows.filter(r=>r.eloLikeRating<=1300).length,eloRange:[round(Math.min(...rows.map(r=>r.eloLikeRating)),2),round(Math.max(...rows.map(r=>r.eloLikeRating)),2)],initiative:{firstScore:initiative.firstScore,secondScore:initiative.secondScore,firstScore95:initiative.firstScore95,residualAdvantage:initiative.residualAdvantage,significant:initiativeSignificant}};
const outDir=path.join(root,'audit','balance','analysis-v2',summary.scope||'unknown');fs.mkdirSync(outDir,{recursive:true});
const outSummary={generatedAt:new Date().toISOString(),sourceGeneratedAt:summary.generatedAt,engineVersion:summary.engineVersion,scope:summary.scope,totalRoster:summary.totalRoster,eligibleRoster:summary.eligibleRoster,characters:rows.length,excludedCharacters:summary.excludedCharacters||[],pairs:summary.pairs,games:summary.matchups,seeds:summary.seeds,policies:summary.policies,thresholds:THRESHOLDS,classificationCounts,actionCounts,flagCounts,suspectedDomainCounts,health,initiative,concentration:scoreConcentration,pairwiseEloConcentration:eloConcentration,methodReferences:[{repository:'google-deepmind/open_spiel',applied:'matriz de confrontos e pior caso como proxy operacional de exploitability'},{repository:'sublee/trueskill',applied:'princípio de rating sensível à incerteza; decisões continuam condicionadas por IC95, sem importar o pacote'},{repository:'Elo/Bradley-Terry family',applied:'rating Elo-like ajustado simultaneamente sobre toda a matriz para evidência complementar e independente da ordem dos pares'},{repository:'nianticlabs/metagame-balance',applied:'entropia/HHI, effective roster e concentração de força para saúde do meta'}],limitations:['Triage IA/personagem/técnica/motor indica domínio suspeito, não prova causalidade isolada; divergência upstream ainda tem precedência.','O Elo-like é um rating diagnóstico offline sobre matchups simulados; não é o MMR dos jogadores e não substitui IC95 ou pior confronto.','Event/special são analisados no scope=all, mas não entram no ranking competitivo scope=competitive.'],decisionRule:'Corrigir primeiro divergência canônica/mecânica. Buff/nerf numérico somente quando simulação v2, IC95, rating par-a-par, política da IA, iniciativa e matriz de matchups sustentarem o desequilíbrio após a correção mecânica.'};
fs.writeFileSync(path.join(outDir,'SUMMARY.json'),JSON.stringify(outSummary,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'CHARACTER-ANALYSIS.json'),JSON.stringify(rows,null,2)+'\n');
let md=`# Análise de balanceamento v2 — ${summary.scope}\n\n- Cobertura: **${rows.length} personagens** de ${summary.totalRoster}.\n- Pares: **${summary.pairs}**; jogos: **${summary.matchups}**.\n- Vantagem residual de iniciativa: **${(Number(initiative.residualAdvantage||0)*100).toFixed(2)} p.p.**; IC95 do primeiro lado: **${pct(initiative.firstScore95?.[0]||0)}–${pct(initiative.firstScore95?.[1]||0)}**.\n- Personagens com técnica quase não usada: **${health.nearUnusedSkillCharacterCount}**.\n- Personagens com técnica dominante: **${health.dominantSkillCharacterCount}**.\n- Sensíveis à política da IA: **${health.aiPolicySensitiveCount}**.\n- Sensíveis à iniciativa: **${health.initiativeSensitiveCount}**.\n- Revisão de motor por limitação canônica explícita: **${health.engineMechanicReviewCount}**.\n- Entropia normalizada (score): **${scoreConcentration.normalizedEntropy}**; HHI: **${scoreConcentration.hhi}**; effective roster: **${scoreConcentration.effectiveRoster}**.\n- Entropia normalizada (Elo-like): **${eloConcentration.normalizedEntropy}**; HHI: **${eloConcentration.hhi}**; effective roster: **${eloConcentration.effectiveRoster}**.\n- Faixa Elo-like: **${health.eloRange[0]}–${health.eloRange[1]}**.\n- Candidatos a nerf: **${actionCounts.NERF_CANDIDATE||0}**; buff: **${actionCounts.BUFF_CANDIDATE||0}**.\n\n> Ação é triagem. Nenhum número é aplicado automaticamente. Divergência canônica/mecânica tem precedência.\n\n| # | Personagem | Domínios suspeitos | Ação | Score | IC95 | Elo-like | Δ IA | Δ iniciativa | Uso min–max | Pior confronto | Prioridade | Flags |\n|---:|---|---|---|---:|---|---:|---:|---:|---|---|---:|---|\n`;
rows.slice(0,209).forEach((r,i)=>{md+=`| ${i+1} | ${String(r.name).replace(/\|/g,'\\|')} | ${r.suspectedDomains.join('/')} | ${r.action} | ${pct(r.score)} | ${pct(r.ci95[0])}–${pct(r.ci95[1])} | ${r.eloLikeRating} | ${pct(r.policyDelta)} | ${pct(r.initiativeDelta)} | ${pct(r.skillUsage.minShare)}–${pct(r.skillUsage.maxShare)} | ${r.worstMatchup?`${String(r.worstMatchup.opponentName).replace(/\|/g,'\\|')} ${pct(r.worstMatchup.score)}`:'—'} | ${r.priorityScore} | ${r.flags.join(', ')} |\n`});
fs.writeFileSync(path.join(outDir,'REPORT.md'),md);
console.log(JSON.stringify(outSummary,null,2));
