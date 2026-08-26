import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const adapter=require('../combat-content-adapter-v2.js');
const rules=require('../combat-rules-v2.js');

const CONTENT_BASE=String(process.env.CONTENT_BASE||'https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/content').replace(/\/$/,'');
const OUT=path.join(process.cwd(),'audit','balance','published-v2');
fs.mkdirSync(OUT,{recursive:true});
const EXPECTED_OPS=new Set(adapter.OPS);
const KNOWN_COSTS=new Set(['Blood','Gen','Nin','Tai','Rand']);
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const inc=(obj,key,n=1)=>{obj[key]=Number(obj[key]||0)+n};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function getJson(url){
  let last='content_unavailable';
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const r=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(30000)});
      const text=await r.text();let body=null;try{body=JSON.parse(text)}catch{}
      if(r.ok&&body?.ok)return body;
      last=`CONTENT_HTTP_${r.status}:${text.slice(0,300)}`;
    }catch(e){last=String(e?.message||e)}
    if(attempt<3)await sleep(attempt*750);
  }
  throw new Error(last);
}
function loadPlayableRoster(){
  const context={window:{}};context.window.window=context.window;vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(process.cwd(),'roster.js'),'utf8'),context,{filename:'roster.js',timeout:30000});
  const roster=context.window.NARUTO_ROSTER;
  if(!Array.isArray(roster)||!roster.length)throw new Error('PLAYABLE_ROSTER_MISSING');
  return roster;
}
function targetFor(skill){
  const t=String(skill?.mechanic?.target||'enemy');
  if(t==='self')return'a';
  if(t==='ally')return'ally';
  if(t==='enemy')return'b';
  return null;
}
function runtimeState(){
  const rich={Blood:20,Gen:20,Nin:20,Tai:20,Rand:20};
  return rules.createState([
    {id:'a',side:'A',hp:80,maxHp:100,chakra:rich,cooldowns:{probe:2}},
    {id:'ally',side:'A',hp:55,maxHp:100,chakra:rich,cooldowns:{probe:2}},
    {id:'b',side:'B',hp:20,maxHp:100,chakra:rich,cooldowns:{probe:2}}
  ],{seed:20260826});
}
function auditOne(t){
  const structural=adapter.auditTechnique(t),ops=arr(t.mechanics).map(x=>String(x?.op||'')),skill=structural.ok?adapter.adaptTechnique(t):null;
  const unknownCosts=(skill?.cost||[]).filter(x=>!KNOWN_COSTS.has(String(x)));
  let runtime={ok:false,reason:'STRUCTURAL'};
  if(skill&&unknownCosts.length===0){
    try{
      const s=runtimeState(),target=targetFor(skill),r=rules.resolveSkill(s,'a',skill,target,{payCost:false});
      runtime={ok:Boolean(r?.ok),reason:r?.reason||null,resultEffects:arr(r?.results).length};
    }catch(e){runtime={ok:false,reason:String(e?.message||e)}}
  }else if(unknownCosts.length)runtime={ok:false,reason:'UNKNOWN_COST:'+unknownCosts.join(',')};
  return{
    id:String(t.id??''),name:String(t.name??t.id??''),characterId:t.characterId??null,
    ops,targets:arr(t.mechanics).map(x=>x?.target??null),cost:skill?.cost||[],unknownCosts,
    effectTypes:skill?skill.mechanic.effects.map(x=>String(x.type||'noop')):[],
    unsupported:structural.unsupported||[],structuralOk:structural.ok,runtime
  };
}

const manifest=await getJson(`${CONTENT_BASE}/manifest`);
const [techniquePayload,characterPayload]=await Promise.all([
  getJson(`${CONTENT_BASE}?type=technique`),
  getJson(`${CONTENT_BASE}?type=character`)
]);
const items=arr(techniquePayload.items),publishedCharacters=arr(characterPayload.items),playable=loadPlayableRoster();
if(items.length<1200)throw new Error(`TECHNIQUE_COUNT_TOO_LOW:${items.length}`);
if(playable.length!==209)throw new Error(`PLAYABLE_ROSTER_COUNT:${playable.length}`);
if(publishedCharacters.length<209)throw new Error(`PUBLISHED_CHARACTER_COUNT_TOO_LOW:${publishedCharacters.length}`);

const techniqueById=new Map(items.map(t=>[String(t.id),t]));
const characterById=new Map(publishedCharacters.map(c=>[String(c.id),c]));
const playableIds=new Set(playable.map(c=>String(c.slug)));
const contentOnlyCharacters=publishedCharacters.filter(c=>!playableIds.has(String(c.id))).map(c=>({id:c.id,name:c.name,tags:c.tags||[],rank:c.rank||''}));
const rosterOnlyCharacters=playable.filter(c=>!characterById.has(String(c.slug))).map(c=>({id:c.slug,name:c.name}));
const characterLinkFailures=[];
const canonicalRoster=[];
for(const legacyChar of playable){
  const id=String(legacyChar.slug),published=characterById.get(id),ids=arr(published?.baseTechniqueIds).map(String);
  if(!published||ids.length!==4){characterLinkFailures.push({id,reason:!published?'CHARACTER_NOT_PUBLISHED':`BASE_TECHNIQUE_COUNT:${ids.length}`});continue}
  const techniques=[];
  for(const techniqueId of ids){
    const t=techniqueById.get(techniqueId);
    if(!t){characterLinkFailures.push({id,techniqueId,reason:'TECHNIQUE_NOT_PUBLISHED'});continue}
    techniques.push(adapter.adaptTechnique(t));
  }
  if(techniques.length!==4){characterLinkFailures.push({id,reason:`RESOLVED_TECHNIQUE_COUNT:${techniques.length}`});continue}
  canonicalRoster.push({
    slug:id,name:String(published.name||legacyChar.name||id),bio:String(legacyChar.bio||''),icon:String(published.image||legacyChar.icon||''),
    hp:Number(published.hp||100),stats:published.stats||{},tags:published.tags||[],rank:published.rank||'',skills:techniques
  });
}

const rows=items.map(auditOne),opCounts={},effectTypeCounts={},targetCounts={},costCounts={},statusCounts={};
for(const t of items){
  for(const m of arr(t.mechanics)){
    inc(opCounts,String(m?.op||'<empty>'));
    inc(targetCounts,String(m?.target||'<empty>'));
    if(m?.op==='status')inc(statusCounts,String(m?.status||'<empty>'));
  }
}
for(const r of rows){for(const e of r.effectTypes)inc(effectTypeCounts,e);for(const c of r.cost)inc(costCounts,c)}
const unsupported=rows.filter(x=>!x.structuralOk||x.unsupported.length),runtimeFailures=rows.filter(x=>!x.runtime.ok),unknownCosts=rows.filter(x=>x.unknownCosts.length),noops=rows.filter(x=>x.effectTypes.includes('noop'));
const observedOps=Object.keys(opCounts).sort(),missingExpected=[...EXPECTED_OPS].filter(x=>!observedOps.includes(x)),unexpectedOps=observedOps.filter(x=>!EXPECTED_OPS.has(x));
const canonicalLinks=canonicalRoster.reduce((n,c)=>n+c.skills.length,0);
const summary={
  generatedAt:new Date().toISOString(),contentRevision:Number(manifest.revision||0),techniques:items.length,
  publishedCharacters:publishedCharacters.length,playableCharacters:playable.length,canonicalPlayableCharacters:canonicalRoster.length,canonicalLinks,
  contentOnlyCharacters:contentOnlyCharacters.length,contentOnlyCharacterIds:contentOnlyCharacters.map(x=>x.id),rosterOnlyCharacters:rosterOnlyCharacters.length,
  characterLinkFailures:characterLinkFailures.length,
  adapterVersion:adapter.VERSION,rulesVersion:rules.VERSION,expectedOps:adapter.OPS,observedOps,
  opCounts,effectTypeCounts,targetCounts,costCounts,statusCounts,
  unsupported:unsupported.length,runtimeFailures:runtimeFailures.length,unknownCosts:unknownCosts.length,noops:noops.length,
  missingExpected,unexpectedOps,
  gate:unsupported.length===0&&runtimeFailures.length===0&&unknownCosts.length===0&&noops.length===0&&missingExpected.length===0&&unexpectedOps.length===0&&rosterOnlyCharacters.length===0&&characterLinkFailures.length===0&&canonicalRoster.length===209&&canonicalLinks===836?'PASS':'FAIL'
};
const write=(name,data)=>fs.writeFileSync(path.join(OUT,name),JSON.stringify(data,null,2)+'\n');
write('SUMMARY.json',summary);write('TECHNIQUE-RUNTIME-AUDIT.json',rows);write('CONTENT-ONLY-CHARACTERS.json',contentOnlyCharacters);write('CANONICAL-ROSTER-209x4.json',canonicalRoster);
fs.writeFileSync(path.join(OUT,'CANONICAL-ROSTER-209x4.js'),'window.NARUTO_ROSTER='+JSON.stringify(canonicalRoster)+';\n');
if(runtimeFailures.length)write('RUNTIME-FAILURES.json',runtimeFailures);
if(unsupported.length)write('UNSUPPORTED.json',unsupported);
if(unknownCosts.length)write('UNKNOWN-COSTS.json',unknownCosts);
if(noops.length)write('NOOPS.json',noops);
if(characterLinkFailures.length)write('CHARACTER-LINK-FAILURES.json',characterLinkFailures);
if(rosterOnlyCharacters.length)write('ROSTER-ONLY-CHARACTERS.json',rosterOnlyCharacters);
fs.writeFileSync(path.join(OUT,'REPORT.md'),`# Published Techniques — Combat Rules V2\n\n- Revision: **${summary.contentRevision}**\n- Published characters: **${summary.publishedCharacters}**\n- Playable characters: **${summary.playableCharacters}**\n- Canonical playable roster: **${summary.canonicalPlayableCharacters} × 4 = ${summary.canonicalLinks}**\n- Content-only characters: **${summary.contentOnlyCharacters}**\n- Techniques: **${summary.techniques}**\n- Operators: **${summary.observedOps.length}/${summary.expectedOps.length}**\n- Unsupported: **${summary.unsupported}**\n- Runtime failures: **${summary.runtimeFailures}**\n- Unknown costs: **${summary.unknownCosts}**\n- No-op effects: **${summary.noops}**\n- Gate: **${summary.gate}**\n\n## Content-only characters\n\n${contentOnlyCharacters.map(x=>`- ${x.id}: ${x.name}`).join('\n')}\n\n## Operator counts\n\n${Object.entries(opCounts).sort().map(([k,v])=>`- ${k}: ${v}`).join('\n')}\n`);
console.log(JSON.stringify(summary,null,2));
if(summary.gate!=='PASS')process.exitCode=2;
