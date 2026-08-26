import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const shardRoot=path.join(root,process.env.SHARD_ROOT||'audit/balance/canonical-v2-shards');
const outDir=path.join(root,process.env.SIM_OUT_DIR||'audit/balance/canonical-v2-full');
const round=(x,n=4)=>Number(Number(x||0).toFixed(n));
const wilson=(w,n,z=1.96)=>{if(!n)return[0,1];const p=w/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,m=z*Math.sqrt((p*(1-p)+z*z/(4*n))/n)/d;return[round(Math.max(0,c-m)),round(Math.min(1,c+m))]};

function walk(dir){
  if(!fs.existsSync(dir))return[];
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...walk(p));
    else if(entry.isFile()&&entry.name==='SUMMARY.json')out.push(p);
  }
  return out;
}
function stable(value){return JSON.stringify(value)}
function assertSame(label,values){
  const uniq=[...new Set(values.map(stable))];
  if(uniq.length!==1)throw new Error(`${label} divergiu entre shards: ${uniq.join(' | ')}`);
  return values[0];
}
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function pairKey(m){return `${m.a}\u0000${m.b}`}
function emptyStat(slug,name){return{slug,name,matches:0,wins:0,losses:0,draws:0,turns:0,hpDiff:0,damage:0,heal:0,defense:0,control:0,chakra:0,actions:0,uses:[0,0,0,0]}}

const candidates=walk(shardRoot).map(summaryPath=>{
  const dir=path.dirname(summaryPath);
  const summary=readJson(summaryPath);
  if(!summary?.shard||Number(summary.shard.count)<=1)return null;
  const ratingsPath=path.join(dir,'CHARACTER-RATINGS.json');
  const matchupsPath=path.join(dir,'MATCHUPS.json');
  const overridePath=path.join(dir,'OVERRIDE-APPLICATION.json');
  if(!fs.existsSync(ratingsPath)||!fs.existsSync(matchupsPath)||!fs.existsSync(overridePath))throw new Error(`Shard incompleto em ${dir}`);
  return{dir,summary,ratings:readJson(ratingsPath),matchups:readJson(matchupsPath),overrides:readJson(overridePath)};
}).filter(Boolean);

if(!candidates.length)throw new Error(`Nenhum shard encontrado em ${shardRoot}`);
const shardCount=Number(assertSame('shard.count',candidates.map(x=>x.summary.shard.count)));
if(candidates.length!==shardCount)throw new Error(`shards encontrados=${candidates.length} esperados=${shardCount}`);
candidates.sort((a,b)=>Number(a.summary.shard.index)-Number(b.summary.shard.index));
for(let i=0;i<shardCount;i++)if(Number(candidates[i]?.summary?.shard?.index)!==i)throw new Error(`shard ausente/duplicado no índice ${i}`);

const fields=['engine','engineVersion','mode','scope','seeds','policies','totalRoster','eligibleRoster','roster','excludedCharacters','expectedGamesPerPair','v2NativeSkills','legacyFallbackSkills','effectTypes'];
for(const field of fields)assertSame(field,candidates.map(x=>x.summary[field]));
const canonicalOverrideState=assertSame('override configuration',candidates.map(x=>({schemaVersion:x.overrides.schemaVersion,upstream:x.overrides.upstream,overridesConfigured:x.overrides.overridesConfigured,batches:x.overrides.batches,keys:x.overrides.keys,publicRosterMutated:x.overrides.publicRosterMutated,scope:x.overrides.scope,sourceRuntime:x.overrides.sourceRuntime})));
if(Number(canonicalOverrideState.overridesConfigured)!==13)throw new Error(`overrides canônicos=${canonicalOverrideState.overridesConfigured} esperados=13`);
if(canonicalOverrideState.publicRosterMutated!==false)throw new Error('publicRosterMutated precisa permanecer false');
if(canonicalOverrideState.scope!=='analysis-only')throw new Error(`override scope inválido: ${canonicalOverrideState.scope}`);

const first=candidates[0].summary;
if(first.mode!=='standard')throw new Error(`merge canônico exige mode=standard, recebido ${first.mode}`);
const expectedPairs=Number(first.roster)*(Number(first.roster)-1)/2;
const expectedGamesPerPair=Number(first.expectedGamesPerPair||0);
if(expectedGamesPerPair<1)throw new Error('expectedGamesPerPair inválido');
for(const x of candidates){
  if(Number(x.summary.shard.globalPairs)!==expectedPairs)throw new Error(`shard ${x.summary.shard.index}: globalPairs=${x.summary.shard.globalPairs} expected=${expectedPairs}`);
  if(Number(x.summary.shard.localPairs)!==x.matchups.length||Number(x.summary.pairs)!==x.matchups.length)throw new Error(`shard ${x.summary.shard.index}: contagem local inconsistente`);
  const games=x.matchups.reduce((n,m)=>n+Number(m.games||0),0);
  if(Number(x.summary.matchups)!==games)throw new Error(`shard ${x.summary.shard.index}: jogos summary=${x.summary.matchups} calculado=${games}`);
}

const matchupMap=new Map();
for(const x of candidates)for(const m of x.matchups){
  const key=pairKey(m);
  if(matchupMap.has(key))throw new Error(`par duplicado: ${m.a} x ${m.b}`);
  if(Number(m.games)!==expectedGamesPerPair)throw new Error(`jogos por par inválidos ${m.a} x ${m.b}: ${m.games}`);
  matchupMap.set(key,m);
}
if(matchupMap.size!==expectedPairs)throw new Error(`pares mesclados=${matchupMap.size} esperados=${expectedPairs}`);
const matchups=[...matchupMap.values()].sort((a,b)=>String(a.a).localeCompare(String(b.a))||String(a.b).localeCompare(String(b.b)));
const totalGames=matchups.reduce((n,m)=>n+Number(m.games||0),0);
if(totalGames!==expectedPairs*expectedGamesPerPair)throw new Error(`jogos mesclados=${totalGames} esperados=${expectedPairs*expectedGamesPerPair}`);

const stats=new Map();
for(const x of candidates)for(const r of x.ratings){
  if(!stats.has(r.slug))stats.set(r.slug,emptyStat(r.slug,r.name));
  const s=stats.get(r.slug);
  if(s.name!==r.name)throw new Error(`nome divergente para ${r.slug}`);
  for(const k of ['matches','wins','losses','draws','turns','hpDiff','damage','heal','defense','control','chakra','actions'])s[k]+=Number(r[k]||0);
  for(let i=0;i<4;i++)s.uses[i]+=Number(r.uses?.[i]||0);
}
if(stats.size!==Number(first.roster))throw new Error(`ratings mesclados=${stats.size} roster=${first.roster}`);

const ratings=[...stats.values()].map(st=>{
  const decisive=st.wins+st.losses,ci=wilson(st.wins,decisive),useTotal=st.uses.reduce((a,b)=>a+b,0);
  return{...st,score:round((st.wins+.5*st.draws)/st.matches),winRate:decisive?round(st.wins/decisive):.5,winRate95:ci,avgTurns:round(st.turns/st.matches,2),avgHpDiff:round(st.hpDiff/st.matches,2),avgDamage:round(st.damage/st.matches,2),avgHeal:round(st.heal/st.matches,2),avgDefense:round(st.defense/st.matches,2),avgControl:round(st.control/st.matches,2),avgChakraSpent:round(st.chakra/st.matches,2),avgActions:round(st.actions/st.matches,2),skillUseShare:st.uses.map(x=>round(x/Math.max(1,useTotal)))};
}).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));

const sourceGeneratedAt=candidates.map(x=>x.summary.generatedAt).filter(Boolean).sort();
const summary={
  generatedAt:sourceGeneratedAt.at(-1)||new Date(0).toISOString(),
  sourceGeneratedAt,
  engine:first.engine,
  engineVersion:first.engineVersion,
  mode:first.mode,
  scope:first.scope,
  seeds:first.seeds,
  policies:first.policies,
  totalRoster:first.totalRoster,
  eligibleRoster:first.eligibleRoster,
  roster:first.roster,
  excludedCharacters:first.excludedCharacters,
  pairs:matchups.length,
  matchups:totalGames,
  expectedGamesPerPair,
  shard:{merged:true,count:shardCount,strategy:'pair-index-modulo',globalPairs:expectedPairs,sourceShardIndices:candidates.map(x=>Number(x.summary.shard.index))},
  canonicalOverrides:{overridesConfigured:Number(canonicalOverrideState.overridesConfigured),batches:canonicalOverrideState.batches,keys:canonicalOverrideState.keys,publicRosterMutated:canonicalOverrideState.publicRosterMutated,scope:canonicalOverrideState.scope},
  avgBattleTurns:round(matchups.reduce((n,x)=>n+Number(x.turns||0),0)/Math.max(1,totalGames),2),
  v2NativeSkills:first.v2NativeSkills,
  legacyFallbackSkills:first.legacyFallbackSkills,
  effectTypes:first.effectTypes,
  top:ratings[0]||null,
  bottom:ratings.at(-1)||null,
  methodology:[...(first.methodology||[]),'strict deterministic shard merge','unique pair coverage gate','exact games-per-pair gate','canonical override integrity gate']
};

fs.rmSync(outDir,{recursive:true,force:true});
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'CHARACTER-RATINGS.json'),JSON.stringify(ratings,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'MATCHUPS.json'),JSON.stringify(matchups,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'OVERRIDE-APPLICATION.json'),JSON.stringify(candidates[0].overrides,null,2)+'\n');
let md=`# Naruto Unison — Matriz canônica V2 completa\n\n- Personagens: **${summary.roster}**\n- Pares únicos: **${summary.pairs.toLocaleString('pt-BR')}**\n- Batalhas: **${summary.matchups.toLocaleString('pt-BR')}**\n- Jogos por par: **${summary.expectedGamesPerPair}**\n- Shards: **${summary.shard.count}**\n- Overrides canônicos: **${summary.canonicalOverrides.overridesConfigured}**\n- Turnos médios: **${summary.avgBattleTurns}**\n\n> Merge validado: sem pares duplicados, sem lacunas e com contagem exata de jogos por par.\n\n| # | Personagem | Score | Win rate | IC95% | Partidas | Dano | Cura | Defesa | Controle | Chakra |\n|---:|---|---:|---:|---|---:|---:|---:|---:|---:|---:|\n`;
ratings.forEach((x,i)=>md+=`| ${i+1} | ${x.name} | ${(x.score*100).toFixed(1)}% | ${(x.winRate*100).toFixed(1)}% | ${(x.winRate95[0]*100).toFixed(1)}–${(x.winRate95[1]*100).toFixed(1)}% | ${x.matches} | ${x.avgDamage} | ${x.avgHeal} | ${x.avgDefense} | ${x.avgControl} | ${x.avgChakraSpent} |\n`);
fs.writeFileSync(path.join(outDir,'REPORT.md'),md);
console.log(JSON.stringify(summary,null,2));
