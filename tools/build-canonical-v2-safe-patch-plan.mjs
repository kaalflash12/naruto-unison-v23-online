import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const argv=process.argv.slice(2);
const arg=(name,def)=>{const i=argv.indexOf(`--${name}`);return i>=0&&argv[i+1]?argv[i+1]:def};
const root=path.resolve(arg('root',process.cwd()));
const queueDir=path.resolve(arg('queue',path.join(root,'audit','balance','canonical-v2-corrections')));
const outDir=path.resolve(arg('out',path.join(root,'audit','balance','canonical-v2-patch-plan')));
const CONTENT_BASE=String(process.env.CONTENT_BASE||'https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/content').replace(/\/$/,'');
const selfTest=argv.includes('--self-test');
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
const uniq=a=>[...new Set(a)];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(name,data)=>fs.writeFileSync(path.join(outDir,name),JSON.stringify(data,null,2)+'\n');
const COST_TO_PUBLISHED=Object.freeze({blood:'KEK',gen:'GEN',nin:'NIN',tai:'TAI',rand:'Q'});
const COST_NORM=Object.freeze({KEK:'blood',GEN:'gen',NIN:'nin',TAI:'tai',Q:'rand',Blood:'blood',Gen:'gen',Nin:'nin',Tai:'tai',Rand:'rand'});
const STRUCTURAL=new Set(['CUSTO_ERRADO','COOLDOWN_ERRADO','DANO_ERRADO','ALVO_ERRADO','DURAÇÃO_ERRADA']);
const DAMAGE_OPS=new Set(['damage','multi-hit','drain']);
const HELPFUL_OPS=new Set(['buff','chakra-gain','cleanse','heal','shield']);

function stable(v){
  if(Array.isArray(v))return v.map(stable);
  if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));
  return v;
}
function hash(v){return crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex')}
function normCost(cost){return arr(cost).map(x=>COST_NORM[String(x)]||String(x).toLowerCase()).sort()}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function helpful(op,m={}){
  if(HELPFUL_OPS.has(op))return true;
  if(op==='cooldown')return num(m.amount,0)<0;
  if(op==='status')return ['counter','evasion','regen','invuln'].includes(String(m.status||''))||String(m.status||'').startsWith('form:')||String(m.target||'')==='self';
  return false;
}
function effectiveTarget(m){
  const raw=String(m?.target||'primary'),op=String(m?.op||'');
  if(raw==='self')return'self';
  if(raw==='all-allies')return'allies';
  if(raw==='all-enemies'||raw==='enemies')return'enemies';
  if(raw==='everyone')return'everyone';
  if(raw==='primary')return helpful(op,m)?'ally':'enemy';
  return helpful(op,m)?'ally':'enemy';
}
function desiredRawTarget(desired,m){
  if(desired==='self')return'self';
  if(desired==='enemies')return'all-enemies';
  if(desired==='allies')return'all-allies';
  if(desired==='enemy'&&!helpful(String(m?.op||''),m))return'primary';
  if(desired==='ally'&&helpful(String(m?.op||''),m))return'primary';
  return null;
}
function topLevelTarget(desired){return({self:'self',enemy:'enemy',enemies:'all-enemies',ally:'ally',allies:'all-allies'}[desired]||null)}

function planCost(pub,row,after){
  const ev=row.evidence?.cost,up=arr(ev?.upstream).map(String),local=arr(ev?.local).map(String).sort();
  if(!ev||!up.length)return{ok:false,reason:'COST_EVIDENCE_MISSING'};
  if(!same(normCost(pub.chakraCost),local))return{ok:false,reason:'COST_PRECONDITION_MISMATCH',actual:normCost(pub.chakraCost),expected:local};
  if(up.some(x=>!COST_TO_PUBLISHED[x]))return{ok:false,reason:'COST_TOKEN_UNREPRESENTABLE',upstream:up};
  after.chakraCost=up.map(x=>COST_TO_PUBLISHED[x]);
  return{ok:true,field:'chakraCost',before:clone(pub.chakraCost),after:clone(after.chakraCost)};
}
function planCooldown(pub,row,after){
  const ev=row.evidence?.cooldown,local=num(ev?.local),up=num(ev?.upstream);
  if(local==null||up==null||!Number.isInteger(up)||up<0)return{ok:false,reason:'COOLDOWN_EVIDENCE_INVALID'};
  if(num(pub.cooldown,0)!==local)return{ok:false,reason:'COOLDOWN_PRECONDITION_MISMATCH',actual:num(pub.cooldown,0),expected:local};
  after.cooldown=up;
  return{ok:true,field:'cooldown',before:pub.cooldown,after:up};
}
function planDamage(pub,row,after){
  const ev=row.evidence?.damage,local=num(ev?.local),up=num(ev?.upstream);
  if(local==null||up==null||up<0)return{ok:false,reason:'DAMAGE_EVIDENCE_INVALID'};
  const mechanics=arr(pub.mechanics),carriers=mechanics.map((m,i)=>({m,i})).filter(x=>DAMAGE_OPS.has(String(x.m?.op||'')));
  if(carriers.length!==1)return{ok:false,reason:'DAMAGE_CARRIER_COUNT',count:carriers.length};
  const {m,i}=carriers[0];
  if(num(m.amount)!==local)return{ok:false,reason:'DAMAGE_PRECONDITION_MISMATCH',actual:num(m.amount),expected:local};
  after.mechanics=clone(mechanics);after.mechanics[i].amount=up;
  const secondary=[];
  if(num(pub.power)===local){after.power=up;secondary.push('power')}
  if(pub.effect&&num(pub.effect.power)===local){after.effect=clone(pub.effect);after.effect.power=up;secondary.push('effect.power')}
  return{ok:true,field:`mechanics[${i}].amount`,op:String(m.op),before:local,after:up,secondary};
}
function planTarget(pub,row,after){
  const ev=row.evidence?.target,local=uniq(arr(ev?.local).map(String)),up=uniq(arr(ev?.upstream).map(String));
  if(local.length!==1||up.length!==1)return{ok:false,reason:'TARGET_NOT_SINGLETON',local,upstream:up};
  if(arr(row.classifications).includes('EFEITO_ERRADO'))return{ok:false,reason:'TARGET_EFFECT_MISMATCH_HELD'};
  const mechanics=arr(pub.mechanics);
  if(!mechanics.length)return{ok:false,reason:'TARGET_MECHANICS_EMPTY'};
  const actual=uniq(mechanics.map(effectiveTarget));
  if(actual.length!==1||actual[0]!==local[0])return{ok:false,reason:'TARGET_PRECONDITION_MISMATCH',actual,expected:local};
  const desired=up[0],raws=mechanics.map(m=>desiredRawTarget(desired,m));
  if(raws.some(x=>x==null))return{ok:false,reason:'TARGET_UNREPRESENTABLE_FOR_OP',desired,ops:mechanics.map(m=>String(m?.op||''))};
  const top=topLevelTarget(desired);if(!top)return{ok:false,reason:'TARGET_TOPLEVEL_UNREPRESENTABLE',desired};
  after.mechanics=clone(mechanics);for(let i=0;i<after.mechanics.length;i++)after.mechanics[i].target=raws[i];after.target=top;
  return{ok:true,field:'target+mechanics[].target',before:{target:pub.target,mechanics:mechanics.map(m=>m?.target??null)},after:{target:top,mechanics:raws}};
}
function planDimension(pub,row,dim,after){
  if(dim==='CUSTO_ERRADO')return planCost(pub,row,after);
  if(dim==='COOLDOWN_ERRADO')return planCooldown(pub,row,after);
  if(dim==='DANO_ERRADO')return planDamage(pub,row,after);
  if(dim==='ALVO_ERRADO')return planTarget(pub,row,after);
  return{ok:false,reason:`DIMENSION_NOT_AUTOPATCHED:${dim}`};
}
function planRow(pub,row){
  const safe=arr(row.safeStructuralDimensions);
  if(!safe.length)return{patch:null,rejected:safe.map(d=>({dimension:d,reason:'EMPTY_SAFE_DIMENSIONS'}))};
  if(safe.some(x=>!STRUCTURAL.has(x)))throw new Error(`UNKNOWN_SAFE_DIMENSION:${row.techniqueId}:${safe.join(',')}`);
  const before=clone(pub),after=clone(pub),changes=[],rejected=[];
  for(const dim of safe){const r=planDimension(before,row,dim,after);if(r.ok)changes.push({dimension:dim,...r});else rejected.push({dimension:dim,...r})}
  const patch=changes.length?{
    entityId:String(row.techniqueId),characterId:String(row.characterId),slot:Number(row.slot),name:String(pub.name||row.techniqueName||row.techniqueId),
    beforeHash:hash(before),safeDimensions:safe,plannedDimensions:changes.map(x=>x.dimension),changes,before,after,afterHash:hash(after)
  }:null;
  return{patch,rejected};
}
async function getJson(url){
  let last='CONTENT_UNAVAILABLE';
  for(let attempt=1;attempt<=3;attempt++){
    try{const r=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(30000)}),text=await r.text();let body=null;try{body=JSON.parse(text)}catch{}if(r.ok&&body?.ok)return body;last=`HTTP_${r.status}:${text.slice(0,200)}`}catch(e){last=String(e?.message||e)}
    if(attempt<3)await new Promise(r=>setTimeout(r,attempt*500));
  }
  throw new Error(last);
}
function selfTestRun(){
  const mk=(dims,evidence,classes=[])=>({techniqueId:'t',characterId:'c',slot:1,safeStructuralDimensions:dims,evidence,classifications:classes});
  let pub={id:'t',name:'T',chakraCost:['NIN'],cooldown:2,power:39,effect:{power:39},target:'enemy',mechanics:[{op:'damage',amount:39,target:'primary'}]};
  let r=planRow(pub,mk(['CUSTO_ERRADO','COOLDOWN_ERRADO','DANO_ERRADO'],{cost:{local:['nin'],upstream:['tai']},cooldown:{local:2,upstream:1},damage:{local:39,upstream:50}}));
  if(!r.patch||r.rejected.length||r.patch.after.chakraCost[0]!=='TAI'||r.patch.after.cooldown!==1||r.patch.after.mechanics[0].amount!==50||r.patch.after.power!==50||r.patch.after.effect.power!==50)throw new Error(`SELFTEST_STRUCTURAL:${JSON.stringify(r)}`);
  pub={id:'t',name:'T',chakraCost:[],cooldown:0,target:'self',mechanics:[{op:'buff',stat:'attack',amount:5,target:'self'}]};
  r=planRow(pub,mk(['ALVO_ERRADO'],{target:{local:['self'],upstream:['enemy']}}));
  if(r.patch||r.rejected[0]?.reason!=='TARGET_UNREPRESENTABLE_FOR_OP')throw new Error(`SELFTEST_TARGET_REJECT:${JSON.stringify(r)}`);
  pub={id:'t',name:'T',chakraCost:[],cooldown:0,target:'enemy',mechanics:[{op:'damage',amount:10,target:'primary'}]};
  r=planRow(pub,mk(['ALVO_ERRADO'],{target:{local:['enemy'],upstream:['self']}}));
  if(!r.patch||r.patch.after.target!=='self'||r.patch.after.mechanics[0].target!=='self')throw new Error(`SELFTEST_TARGET:${JSON.stringify(r)}`);
  console.log('CANONICAL_V2_SAFE_PATCH_PLAN_SELFTEST=PASS');
}

if(selfTest){selfTestRun();process.exit(0)}
fs.mkdirSync(outDir,{recursive:true});
const queueSummary=read(path.join(queueDir,'SUMMARY.json')),rows=read(path.join(queueDir,'SAFE-STRUCTURAL.json'));
if(queueSummary.gate!=='PASS'||queueSummary.safeStructural!==177||rows.length!==177)throw new Error(`SAFE_QUEUE_INVALID:${queueSummary.safeStructural}/${rows.length}`);
const [manifest,payload]=await Promise.all([getJson(`${CONTENT_BASE}/manifest`),getJson(`${CONTENT_BASE}?type=technique`)]);
const items=arr(payload.items),byId=new Map(items.map(x=>[String(x.id),x]));
const patches=[],rejected=[];let requestedDimensions=0,plannedDimensions=0,rejectedDimensions=0;
for(const row of rows){
  const pub=byId.get(String(row.techniqueId));requestedDimensions+=arr(row.safeStructuralDimensions).length;
  if(!pub){for(const dim of arr(row.safeStructuralDimensions)){rejected.push({entityId:row.techniqueId,characterId:row.characterId,slot:row.slot,dimension:dim,reason:'PUBLISHED_ENTITY_MISSING'});rejectedDimensions++}continue}
  const p=planRow(pub,row);if(p.patch){patches.push(p.patch);plannedDimensions+=p.patch.plannedDimensions.length}
  for(const x of p.rejected){rejected.push({entityId:row.techniqueId,characterId:row.characterId,slot:row.slot,...x});rejectedDimensions++}
}
const duplicatePatchIds=patches.map(x=>x.entityId).filter((x,i,a)=>a.indexOf(x)!==i);
const plannedByDimension={},rejectedByDimension={};for(const p of patches)for(const d of p.plannedDimensions)plannedByDimension[d]=(plannedByDimension[d]||0)+1;for(const r of rejected)rejectedByDimension[r.dimension]=(rejectedByDimension[r.dimension]||0)+1;
const summary={
  generatedAt:new Date().toISOString(),mode:'DRY_RUN_ONLY',contentRevision:Number(manifest.revision||0),publishedTechniques:items.length,
  queueSafeRows:rows.length,requestedDimensions,patchRows:patches.length,plannedDimensions,rejectedDimensions,
  plannedByDimension,rejectedByDimension,duplicatePatchIds:uniq(duplicatePatchIds),missingAccounting:requestedDimensions-plannedDimensions-rejectedDimensions,
  productionWrites:0,
  gate:items.length>=1200&&rows.length===177&&duplicatePatchIds.length===0&&requestedDimensions===plannedDimensions+rejectedDimensions?'PASS':'FAIL'
};
write('SUMMARY.json',summary);write('PATCH-PLAN.json',patches);write('REJECTED.json',rejected);
fs.writeFileSync(path.join(outDir,'REPORT.md'),`# Canonical V2 Safe Patch Plan — Dry Run\n\n- Mode: **${summary.mode}**\n- Content revision: **${summary.contentRevision}**\n- Safe queue rows: **${summary.queueSafeRows}**\n- Requested dimensions: **${summary.requestedDimensions}**\n- Planned dimensions: **${summary.plannedDimensions}**\n- Rejected dimensions: **${summary.rejectedDimensions}**\n- Patch rows: **${summary.patchRows}**\n- Production writes: **0**\n- Gate: **${summary.gate}**\n\n## Planned by dimension\n\n${Object.entries(plannedByDimension).map(([k,v])=>`- ${k}: ${v}`).join('\n')}\n\n## Rejected by dimension\n\n${Object.entries(rejectedByDimension).map(([k,v])=>`- ${k}: ${v}`).join('\n')}\n`);
console.log(JSON.stringify(summary,null,2));if(summary.gate!=='PASS')process.exitCode=2;
