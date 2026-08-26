import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const overridePath=path.join(root,'balance','canonical-v2-overrides.json');
const simulationPath=path.join(root,'tools','simulate-balance-3v3-v2.mjs');
const baselineDir=path.join(root,'audit','balance','simulation-v2');
const resultDir=path.join(root,'audit','balance','simulation-v2-overrides');

if(!fs.existsSync(overridePath)) throw new Error('canonical-v2-overrides.json ausente');
if(!fs.existsSync(simulationPath)) throw new Error('simulate-balance-3v3-v2.mjs ausente');

const config=JSON.parse(fs.readFileSync(overridePath,'utf8'));
const overrides=config?.overrides||{};
const keys=Object.keys(overrides);
if(!keys.length) throw new Error('Nenhum override canônico configurado');

const backupDir=path.join('/tmp',`naruto-sim-v2-baseline-${process.pid}`);
if(fs.existsSync(backupDir)) fs.rmSync(backupDir,{recursive:true,force:true});
if(fs.existsSync(baselineDir)) fs.cpSync(baselineDir,backupDir,{recursive:true});

const originalRead=fs.readFileSync.bind(fs);
const rosterAbs=path.resolve(root,'roster.js');
const embedded=JSON.stringify(overrides);
const injection=`\n;(()=>{\n  const overrides=${embedded};\n  const roster=window.NARUTO_ROSTER;\n  if(!Array.isArray(roster)) throw new Error('NARUTO_ROSTER unavailable for canonical overrides');\n  let applied=0;\n  const misses=[];\n  for(const [key,ov] of Object.entries(overrides)){\n    const cut=key.lastIndexOf(':');\n    const slug=key.slice(0,cut);\n    const slot=Number(key.slice(cut+1));\n    const c=roster.find(x=>String(x.slug)===slug);\n    const s=c&&Array.isArray(c.skills)?c.skills[slot-1]:null;\n    if(!s){misses.push(key);continue;}\n    if(ov.cost!==undefined)s.cost=JSON.parse(JSON.stringify(ov.cost));\n    if(ov.cooldown!==undefined)s.cooldown=Number(ov.cooldown);\n    if(ov.classes!==undefined)s.classes=JSON.parse(JSON.stringify(ov.classes));\n    if(ov.mechanic!==undefined)s.mechanic=JSON.parse(JSON.stringify(ov.mechanic));\n    s.__canonicalOverride={key,batch:ov.batch||null,source:ov.source||null,limitations:ov.limitations||[]};\n    applied++;\n  }\n  window.NARUTO_CANONICAL_V2_OVERRIDE_STATE={applied,total:Object.keys(overrides).length,misses};\n  if(misses.length)throw new Error('Canonical override misses: '+misses.join(', '));\n})();\n`;

fs.readFileSync=function(file,...args){
  const value=originalRead(file,...args);
  if(path.resolve(String(file))!==rosterAbs) return value;
  if(Buffer.isBuffer(value)) return Buffer.concat([value,Buffer.from(injection)]);
  return String(value)+injection;
};

let failed=null;
try{
  await import(`./simulate-balance-3v3-v2.mjs?canonical=${Date.now()}`);
}catch(error){
  failed=error;
}finally{
  fs.readFileSync=originalRead;
}

if(failed) throw failed;
if(!fs.existsSync(baselineDir)) throw new Error('Simulador v2 não produziu diretório de saída');
fs.rmSync(resultDir,{recursive:true,force:true});
fs.cpSync(baselineDir,resultDir,{recursive:true});

const appliedState={
  generatedAt:new Date().toISOString(),
  schemaVersion:config.schemaVersion,
  upstream:config.upstream,
  overridesConfigured:keys.length,
  batches:Object.fromEntries([...new Set(keys.map(k=>String(overrides[k]?.batch||'unassigned')))].map(b=>[b,keys.filter(k=>String(overrides[k]?.batch||'unassigned')===b).length])),
  keys,
  publicRosterMutated:false,
  scope:'analysis-only',
  sourceRuntime:'combat-rules-v2.js + simulate-balance-3v3-v2.mjs'
};
fs.writeFileSync(path.join(resultDir,'OVERRIDE-APPLICATION.json'),JSON.stringify(appliedState,null,2)+'\n');

fs.rmSync(baselineDir,{recursive:true,force:true});
if(fs.existsSync(backupDir)){
  fs.cpSync(backupDir,baselineDir,{recursive:true});
  fs.rmSync(backupDir,{recursive:true,force:true});
}

console.log(JSON.stringify(appliedState,null,2));
