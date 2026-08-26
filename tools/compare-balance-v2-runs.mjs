import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const baselineDir=path.join(root,'audit','balance','simulation-v2');
const overrideDir=path.join(root,'audit','balance','simulation-v2-overrides');
const overrideConfig=JSON.parse(fs.readFileSync(path.join(root,'balance','canonical-v2-overrides.json'),'utf8'));
const read=(dir,name)=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const baseSummary=read(baselineDir,'SUMMARY.json');
const newSummary=read(overrideDir,'SUMMARY.json');
const baseRatings=read(baselineDir,'CHARACTER-RATINGS.json');
const newRatings=read(overrideDir,'CHARACTER-RATINGS.json');
const by=(rows)=>new Map(rows.map(x=>[x.slug,x]));
const B=by(baseRatings),N=by(newRatings);
const round=(x,n=4)=>Number(Number(x||0).toFixed(n));
const pct=(x)=>round(100*Number(x||0),2);

const overrideSlugs=[...new Set(Object.keys(overrideConfig.overrides||{}).map(k=>k.slice(0,k.lastIndexOf(':'))))];
const affected=overrideSlugs.map(slug=>{
  const b=B.get(slug),n=N.get(slug);
  if(!b||!n) throw new Error(`rating missing for ${slug}`);
  return {
    slug,name:n.name,
    baseline:{score:round(b.score),winRate:round(b.winRate),ci95:b.winRate95,avgDamage:b.avgDamage,avgHeal:b.avgHeal,avgDefense:b.avgDefense,avgControl:b.avgControl,avgChakraSpent:b.avgChakraSpent},
    canonical:{score:round(n.score),winRate:round(n.winRate),ci95:n.winRate95,avgDamage:n.avgDamage,avgHeal:n.avgHeal,avgDefense:n.avgDefense,avgControl:n.avgControl,avgChakraSpent:n.avgChakraSpent},
    delta:{scorePp:round(100*(n.score-b.score),2),winRatePp:round(100*(n.winRate-b.winRate),2),damage:round(n.avgDamage-b.avgDamage,2),heal:round(n.avgHeal-b.avgHeal,2),defense:round(n.avgDefense-b.avgDefense,2),control:round(n.avgControl-b.avgControl,2),chakra:round(n.avgChakraSpent-b.avgChakraSpent,2)}
  };
});

function global(rows){
  const scores=rows.map(x=>Number(x.score));
  const weights=scores.map(x=>Math.max(0,x-.5));
  const total=weights.reduce((a,b)=>a+b,0)||1;
  const shares=weights.map(x=>x/total).sort((a,b)=>b-a);
  const hhi=shares.reduce((s,x)=>s+x*x,0);
  const entropy=-shares.reduce((s,x)=>x>0?s+x*Math.log(x):s,0)/Math.log(Math.max(2,rows.length));
  const top=(k)=>shares.slice(0,k).reduce((a,b)=>a+b,0);
  return {
    meanAbsoluteDeviationFrom50:round(scores.reduce((s,x)=>s+Math.abs(x-.5),0)/scores.length),
    outside35to65:scores.filter(x=>x<.35||x>.65).length,
    hhi:round(hhi,6),normalizedEntropy:round(entropy,6),
    top5Share:round(top(5)),top10Share:round(top(10)),top25Share:round(top(25)),
    effectiveCompetitiveRoster:round(1/Math.max(hhi,1e-9),2)
  };
}
const baselineGlobal=global(baseRatings),canonicalGlobal=global(newRatings);
const report={
  generatedAt:new Date().toISOString(),
  comparability:{
    sameEngine:baseSummary.engine===newSummary.engine,
    sameEngineVersion:baseSummary.engineVersion===newSummary.engineVersion,
    sameMode:baseSummary.mode===newSummary.mode,
    sameSeeds:baseSummary.seeds===newSummary.seeds,
    samePolicies:JSON.stringify(baseSummary.policies)===JSON.stringify(newSummary.policies),
    sameRoster:baseSummary.roster===newSummary.roster,
    baselinePairs:baseSummary.pairs,canonicalPairs:newSummary.pairs,
    baselineMatchups:baseSummary.matchups,canonicalMatchups:newSummary.matchups
  },
  overridesConfigured:Object.keys(overrideConfig.overrides||{}).length,
  affectedCharacters:affected.length,
  affected,
  global:{baseline:baselineGlobal,canonical:canonicalGlobal,delta:{
    meanAbsoluteDeviationFrom50:round(canonicalGlobal.meanAbsoluteDeviationFrom50-baselineGlobal.meanAbsoluteDeviationFrom50),
    outside35to65:canonicalGlobal.outside35to65-baselineGlobal.outside35to65,
    hhi:round(canonicalGlobal.hhi-baselineGlobal.hhi,6),
    normalizedEntropy:round(canonicalGlobal.normalizedEntropy-baselineGlobal.normalizedEntropy,6),
    top5Share:round(canonicalGlobal.top5Share-baselineGlobal.top5Share),
    top10Share:round(canonicalGlobal.top10Share-baselineGlobal.top10Share),
    top25Share:round(canonicalGlobal.top25Share-baselineGlobal.top25Share),
    effectiveCompetitiveRoster:round(canonicalGlobal.effectiveCompetitiveRoster-baselineGlobal.effectiveCompetitiveRoster,2)
  }}
};
if(!Object.values(report.comparability).slice(0,6).every(Boolean)) throw new Error('baseline and canonical runs are not comparable: '+JSON.stringify(report.comparability));
fs.writeFileSync(path.join(overrideDir,'BASELINE-COMPARISON.json'),JSON.stringify(report,null,2)+'\n');
let md='# Baseline × canonical v2 overrides\n\n';
md+=`Overrides: **${report.overridesConfigured}** em **${report.affectedCharacters}** personagens. Mesma engine/seeds/políticas: **sim**.\n\n`;
md+='| Personagem | Base score | Canônico score | Δ score (p.p.) | Base WR | Canônico WR | Δ WR (p.p.) | Δ dano | Δ cura | Δ defesa | Δ controle |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n';
for(const x of affected)md+=`| ${x.name.replace(/\|/g,'\\|')} | ${pct(x.baseline.score)}% | ${pct(x.canonical.score)}% | ${x.delta.scorePp} | ${pct(x.baseline.winRate)}% | ${pct(x.canonical.winRate)}% | ${x.delta.winRatePp} | ${x.delta.damage} | ${x.delta.heal} | ${x.delta.defense} | ${x.delta.control} |\n`;
md+='\n## Meta global\n\n| Métrica | Baseline | Canônico | Δ |\n|---|---:|---:|---:|\n';
for(const k of Object.keys(baselineGlobal))md+=`| ${k} | ${baselineGlobal[k]} | ${canonicalGlobal[k]} | ${report.global.delta[k]} |\n`;
fs.writeFileSync(path.join(overrideDir,'BASELINE-COMPARISON.md'),md);
console.log(JSON.stringify(report,null,2));
