import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ROSTER_JSON=path.join(ROOT,'audit','balance','published-v2','CANONICAL-ROSTER-209x4.json');
const RULES=path.join(ROOT,'combat-rules-v2.js');
const SIM=path.join(ROOT,'tools','simulate-balance-3v3-v2.mjs');
const OUT=path.join(ROOT,'audit','balance','published-coverage-v2');
for(const p of [ROSTER_JSON,RULES,SIM])if(!fs.existsSync(p))throw new Error(`COVERAGE_INPUT_MISSING:${path.relative(ROOT,p)}`);
const roster=JSON.parse(fs.readFileSync(ROSTER_JSON,'utf8'));
if(!Array.isArray(roster)||roster.length!==209)throw new Error(`COVERAGE_ROSTER_COUNT:${roster?.length}`);
const expected=new Set(roster.map(c=>String(c.slug)));
const covered=new Set(),runs=[];
const offsets=[0,40,80,120,160,200];

for(const offset of offsets){
  const rotated=[...roster.slice(offset),...roster.slice(0,offset)];
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),`naruto-coverage-${offset}-`));
  try{
    fs.writeFileSync(path.join(tmp,'roster.js'),'window.NARUTO_ROSTER='+JSON.stringify(rotated)+';\n');
    fs.copyFileSync(RULES,path.join(tmp,'combat-rules-v2.js'));
    const env={...process.env,SIM_MODE:'smoke',SIM_SCOPE:'all',SIM_SEEDS:'1',SIM_MAX_TURNS:String(process.env.SIM_MAX_TURNS||'20')};
    const run=spawnSync(process.execPath,[SIM],{cwd:tmp,env,encoding:'utf8',maxBuffer:32*1024*1024});
    if(run.status!==0){process.stdout.write(run.stdout||'');process.stderr.write(run.stderr||'');throw new Error(`COVERAGE_SIM_FAILED:${offset}:${run.status}`)}
    const simOut=path.join(tmp,'audit','balance','simulation-v2');
    const summary=JSON.parse(fs.readFileSync(path.join(simOut,'SUMMARY.json'),'utf8'));
    const ratings=JSON.parse(fs.readFileSync(path.join(simOut,'CHARACTER-RATINGS.json'),'utf8'));
    if(summary.v2NativeSkills!==836||summary.legacyFallbackSkills!==0)throw new Error(`NON_CANONICAL_SKILLS:${offset}:${summary.v2NativeSkills}/${summary.legacyFallbackSkills}`);
    for(const r of ratings)covered.add(String(r.slug));
    runs.push({offset,charactersRated:ratings.length,pairs:summary.pairs,matches:summary.matchups,v2NativeSkills:summary.v2NativeSkills,legacyFallbackSkills:summary.legacyFallbackSkills,avgBattleTurns:summary.avgBattleTurns});
  }finally{fs.rmSync(tmp,{recursive:true,force:true})}
}

const missing=[...expected].filter(x=>!covered.has(x)).sort();
const summary={generatedAt:new Date().toISOString(),canonicalCharacters:roster.length,coveredCharacters:covered.size,missingCharacters:missing,runs,gate:covered.size===209&&missing.length===0?'PASS':'FAIL'};
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(OUT,'COVERED-CHARACTERS.json'),JSON.stringify([...covered].sort(),null,2)+'\n');
if(missing.length)fs.writeFileSync(path.join(OUT,'MISSING-CHARACTERS.json'),JSON.stringify(missing,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(summary.gate!=='PASS')process.exitCode=2;
