import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const GENERATED=path.join(ROOT,'audit','balance','published-v2','CANONICAL-ROSTER-209x4.js');
const SUMMARY=path.join(ROOT,'audit','balance','published-v2','SUMMARY.json');
const RULES=path.join(ROOT,'combat-rules-v2.js');
const SIM=path.join(ROOT,'tools','simulate-balance-3v3-v2.mjs');
const OUT=path.join(ROOT,'audit','balance','published-simulation-v2');

for(const p of [GENERATED,SUMMARY,RULES,SIM])if(!fs.existsSync(p))throw new Error(`CANONICAL_SIM_INPUT_MISSING:${path.relative(ROOT,p)}`);
const audit=JSON.parse(fs.readFileSync(SUMMARY,'utf8'));
if(audit.gate!=='PASS'||audit.canonicalPlayableCharacters!==209||audit.canonicalLinks!==836)throw new Error('CANONICAL_ROSTER_GATE_NOT_PASS');

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'naruto-published-v2-'));
try{
  fs.copyFileSync(GENERATED,path.join(tmp,'roster.js'));
  fs.copyFileSync(RULES,path.join(tmp,'combat-rules-v2.js'));
  const env={
    ...process.env,
    SIM_MODE:String(process.env.SIM_MODE||'smoke'),
    SIM_SCOPE:String(process.env.SIM_SCOPE||'all'),
    SIM_SEEDS:String(process.env.SIM_SEEDS||(process.env.SIM_MODE==='standard'?'2':'1')),
    SIM_MAX_TURNS:String(process.env.SIM_MAX_TURNS||'30')
  };
  const run=spawnSync(process.execPath,[SIM],{cwd:tmp,env,encoding:'utf8',maxBuffer:32*1024*1024});
  process.stdout.write(run.stdout||'');
  process.stderr.write(run.stderr||'');
  if(run.status!==0)throw new Error(`CANONICAL_SIM_FAILED:${run.status}`);
  const generatedOut=path.join(tmp,'audit','balance','simulation-v2');
  if(!fs.existsSync(generatedOut))throw new Error('CANONICAL_SIM_OUTPUT_MISSING');
  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.cpSync(generatedOut,OUT,{recursive:true});
  fs.writeFileSync(path.join(OUT,'CANONICAL-SOURCE.json'),JSON.stringify({
    generatedAt:new Date().toISOString(),
    contentRevision:audit.contentRevision,
    publishedTechniques:audit.techniques,
    playableCharacters:audit.canonicalPlayableCharacters,
    canonicalLinks:audit.canonicalLinks,
    adapterVersion:audit.adapterVersion,
    rulesVersion:audit.rulesVersion,
    simMode:env.SIM_MODE,
    simScope:env.SIM_SCOPE,
    simSeeds:Number(env.SIM_SEEDS),
    simMaxTurns:Number(env.SIM_MAX_TURNS)
  },null,2)+'\n');
  const files=fs.readdirSync(OUT).sort();
  console.log(JSON.stringify({ok:true,source:'published-v2',characters:209,links:836,files},null,2));
}finally{
  fs.rmSync(tmp,{recursive:true,force:true});
}
