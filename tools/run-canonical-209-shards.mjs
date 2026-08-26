import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const root=process.cwd();
const SHARD_COUNT=8;
const PARALLEL=Math.max(1,Math.min(SHARD_COUNT,Number(process.env.SIM_SHARD_PARALLEL||4)));
const shardRoot=path.join(root,'audit','balance','canonical-v2-shards');
const finalDir=path.join(root,'audit','balance','canonical-v2-full');
const analysisDir=path.join(root,'audit','balance','analysis-v2','all');
const publishedDir=path.join(root,'audit','balance','published-v2');
const publishedSummaryPath=path.join(publishedDir,'SUMMARY.json');
const canonicalRosterPath=path.join(publishedDir,'CANONICAL-ROSTER-209x4.js');

function copyPath(src,dst){
  if(!fs.existsSync(src)) throw new Error(`Fonte ausente: ${src}`);
  fs.mkdirSync(path.dirname(dst),{recursive:true});
  fs.cpSync(src,dst,{recursive:true});
}
function runNode(args,{cwd=root,env={}}={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd,env:{...process.env,...env},stdio:'inherit'});
    child.on('error',reject);
    child.on('exit',(code,signal)=>code===0?resolve():reject(new Error(`node ${args.join(' ')} falhou: code=${code} signal=${signal||'none'}`)));
  });
}
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function assertNativeV2(summary,label){
  if(summary.v2NativeSkills!==836||summary.legacyFallbackSkills!==0){
    throw new Error(`${label}: fonte mecânica inválida v2NativeSkills=${summary.v2NativeSkills} legacyFallbackSkills=${summary.legacyFallbackSkills}`);
  }
}

await runNode(['tools/audit-published-techniques-v2.mjs']);
if(!fs.existsSync(publishedSummaryPath)||!fs.existsSync(canonicalRosterPath)) throw new Error('roster canônico publicado V2 não foi gerado');
const published=readJson(publishedSummaryPath);
if(published.gate!=='PASS'||published.canonicalPlayableCharacters!==209||published.canonicalLinks!==836){
  throw new Error(`gate do conteúdo publicado inválido: ${JSON.stringify({gate:published.gate,characters:published.canonicalPlayableCharacters,links:published.canonicalLinks})}`);
}
console.log('CANONICAL_PUBLISHED_V2_SOURCE=PASS',JSON.stringify({characters:published.canonicalPlayableCharacters,links:published.canonicalLinks,adapterVersion:published.adapterVersion,rulesVersion:published.rulesVersion}));

fs.rmSync(shardRoot,{recursive:true,force:true});
fs.rmSync(finalDir,{recursive:true,force:true});
fs.rmSync(analysisDir,{recursive:true,force:true});
fs.mkdirSync(shardRoot,{recursive:true});

async function runShard(index){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),`naruto-v2-shard-${index}-`));
  try{
    copyPath(canonicalRosterPath,path.join(tmp,'roster.js'));
    for(const rel of ['combat-rules-v2.js','jutsu-variants.js','tools','balance']){
      const src=path.join(root,rel);
      if(fs.existsSync(src)) copyPath(src,path.join(tmp,rel));
    }
    await runNode(['tools/run-balance-v2-with-overrides.mjs'],{cwd:tmp,env:{
      SIM_MODE:'standard',SIM_SCOPE:'all',SIM_SEEDS:'2',SIM_MAX_TURNS:'30',SIM_SHARD_COUNT:String(SHARD_COUNT),SIM_SHARD_INDEX:String(index)
    }});
    const result=path.join(tmp,'audit','balance','simulation-v2-overrides');
    for(const file of ['SUMMARY.json','CHARACTER-RATINGS.json','MATCHUPS.json','OVERRIDE-APPLICATION.json']){
      if(!fs.existsSync(path.join(result,file))) throw new Error(`shard ${index}: ${file} ausente`);
    }
    const summary=readJson(path.join(result,'SUMMARY.json'));
    const ratings=readJson(path.join(result,'CHARACTER-RATINGS.json'));
    const matchups=readJson(path.join(result,'MATCHUPS.json'));
    if(summary.totalRoster!==209||summary.eligibleRoster!==209||summary.roster!==209||summary.scope!=='all') throw new Error(`shard ${index}: cobertura inválida`);
    assertNativeV2(summary,`shard ${index}`);
    if(summary.shard?.count!==SHARD_COUNT||summary.shard?.index!==index||summary.shard?.globalPairs!==21736) throw new Error(`shard ${index}: metadados inválidos`);
    if(summary.expectedGamesPerPair!==8||summary.matchups!==matchups.length*8||matchups.some(x=>x.games!==8)) throw new Error(`shard ${index}: jogos/par inválidos`);
    if(!summary.initiative||ratings.some(r=>!r.byPolicy||!r.byInitiative||!r.policyScores||!r.initiativeScores||!r.skillUsage)||matchups.some(m=>!m.byPolicy||!m.byFirst)) throw new Error(`shard ${index}: diagnósticos de política/iniciativa/uso ausentes`);
    const out=path.join(shardRoot,`shard-${index}`);
    fs.cpSync(result,out,{recursive:true});
    console.log(`CANONICAL_209_SHARD_${index}=PASS pairs=${matchups.length} games=${summary.matchups} native=${summary.v2NativeSkills} fallback=${summary.legacyFallbackSkills}`);
  }finally{
    fs.rmSync(tmp,{recursive:true,force:true});
  }
}

let cursor=0;
async function worker(){
  while(true){
    const index=cursor++;
    if(index>=SHARD_COUNT)return;
    await runShard(index);
  }
}
await Promise.all(Array.from({length:PARALLEL},()=>worker()));

await runNode(['tools/merge-balance-v2-shards.mjs'],{env:{SHARD_ROOT:'audit/balance/canonical-v2-shards',SIM_OUT_DIR:'audit/balance/canonical-v2-full'}});
const merged=readJson(path.join(finalDir,'SUMMARY.json'));
const ratings=readJson(path.join(finalDir,'CHARACTER-RATINGS.json'));
const matchups=readJson(path.join(finalDir,'MATCHUPS.json'));
const overrides=readJson(path.join(finalDir,'OVERRIDE-APPLICATION.json'));
if(merged.engineVersion!==2||merged.mode!=='standard'||merged.scope!=='all') throw new Error('engine/mode/scope final inválido');
if(merged.totalRoster!==209||merged.eligibleRoster!==209||merged.roster!==209||ratings.length!==209) throw new Error('cobertura final 209 inválida');
assertNativeV2(merged,'merge final');
if(merged.pairs!==21736||matchups.length!==21736) throw new Error(`pares finais=${merged.pairs}/${matchups.length}`);
if(merged.matchups!==173888||merged.expectedGamesPerPair!==8||matchups.some(x=>x.games!==8)) throw new Error('matriz final de batalhas inválida');
if(new Set(matchups.map(x=>`${x.a}\u0000${x.b}`)).size!==21736) throw new Error('pares duplicados no merge final');
if(merged.shard?.merged!==true||merged.shard?.count!==8||merged.shard?.globalPairs!==21736) throw new Error('metadados de merge inválidos');
if(overrides.overridesConfigured!==13||overrides.publicRosterMutated!==false||overrides.scope!=='analysis-only') throw new Error('guardas de override inválidas');
const battleCounts=ratings.map(x=>Number(x.matches||0));
const minBattlesPerCharacter=Math.min(...battleCounts);
const maxBattlesPerCharacter=Math.max(...battleCounts);
if(minBattlesPerCharacter!==1664||maxBattlesPerCharacter!==1664) throw new Error(`batalhas/personagem inválidas min=${minBattlesPerCharacter} max=${maxBattlesPerCharacter}`);
if(!merged.initiative||Number(merged.initiative.games)!==173888||!Array.isArray(merged.initiative.firstScore95)) throw new Error('métrica global de iniciativa inválida');
if(ratings.some(r=>!r.policyScores?.balanced||!r.policyScores?.aggressive||!r.initiativeScores?.first||!r.initiativeScores?.second||!r.skillUsage)) throw new Error('diagnóstico individual política/iniciativa/uso inválido');
if(matchups.some(m=>!m.byPolicy?.balanced||!m.byPolicy?.aggressive||!m.byFirst?.A||!m.byFirst?.B)) throw new Error('diagnóstico por matchup política/iniciativa inválido');

await runNode(['tools/analyze-balance-v2.mjs'],{env:{SIM_DIR:'audit/balance/canonical-v2-full'}});
const analysis=readJson(path.join(analysisDir,'SUMMARY.json'));
const characters=readJson(path.join(analysisDir,'CHARACTER-ANALYSIS.json'));
if(analysis.scope!=='all'||analysis.characters!==209||characters.length!==209) throw new Error('análise 209 inválida');
if(analysis.pairs!==21736||analysis.games!==173888) throw new Error('matriz da análise inválida');
for(const key of ['nearUnusedSkillCharacterCount','dominantSkillCharacterCount','aiPolicySensitiveCount','initiativeSensitiveCount','engineMechanicReviewCount'])if(!Number.isFinite(Number(analysis.health?.[key]))) throw new Error(`health.${key} ausente`);
if(!analysis.initiative||!analysis.suspectedDomainCounts||characters.some(c=>!Array.isArray(c.suspectedDomains)||!c.suspectedDomains.length)) throw new Error('triagem IA/personagem/técnica/motor inválida');

console.log('BALANCE_DIAGNOSTICS_V2=PASS',JSON.stringify({
  initiative:analysis.health.initiative,nearUnused:analysis.health.nearUnusedSkillCharacterCount,dominant:analysis.health.dominantSkillCharacterCount,
  aiPolicySensitive:analysis.health.aiPolicySensitiveCount,initiativeSensitive:analysis.health.initiativeSensitiveCount,
  engineReview:analysis.health.engineMechanicReviewCount,suspectedDomains:analysis.suspectedDomainCounts
}));
console.log('CANONICAL_V2_FULL_209_MATRIX=PASS',JSON.stringify({
  characters:ratings.length,pairs:matchups.length,battles:merged.matchups,gamesPerPair:merged.expectedGamesPerPair,
  minBattlesPerCharacter,maxBattlesPerCharacter,nativeSkills:merged.v2NativeSkills,legacyFallbackSkills:merged.legacyFallbackSkills,
  shards:merged.shard.count,parallel:PARALLEL,overrides:overrides.overridesConfigured,actions:analysis.actionCounts,health:analysis.health
}));
