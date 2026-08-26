import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const dir=path.join(root,'audit','balance','current');
const input=path.join(dir,'CANONICAL-UPSTREAM-REFINED.json');
const rows=JSON.parse(fs.readFileSync(input,'utf8'));
if(!Array.isArray(rows)||rows.length!==836)throw new Error(`refined rows=${rows?.length}`);

const SUPPORTED=new Set(['damage','stun','dot','heal','shield','invuln']);
const uniq=a=>[...new Set(a)];
const esc=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');

function inferAoe(row){
  const targets=row.canonical?.targets||[];
  if(!Array.isArray(targets)||!targets.length)return null;
  const plural=targets.some(x=>/Allies|Enemies|Everyone/.test(String(x)));
  const singular=targets.some(x=>/^(?:R?X?Enemy|X?Ally|Self)$/.test(String(x)));
  if(plural&&!singular)return true;
  if(singular&&!plural)return false;
  return null;
}
function coreDiff(row){
  const current=row.current||{},m=current.mechanic||{},ref=row.refined||{},canon=row.canonical||{};
  const expected=Array.isArray(ref.expectedKinds)?ref.expectedKinds:[];
  const suggested={};
  if(expected.length===1&&SUPPORTED.has(expected[0])&&m.kind!==expected[0])suggested.kind=expected[0];
  if(ref.canonicalTarget&&['self','ally','enemy'].includes(ref.canonicalTarget)&&m.target!==ref.canonicalTarget)suggested.target=ref.canonicalTarget;
  if(Array.isArray(canon.cost)&&JSON.stringify(current.cost||[])!==JSON.stringify(canon.cost))suggested.cost=canon.cost;
  if(canon.cooldown!==null&&canon.cooldown!==undefined&&Number(current.cooldown??0)!==Number(canon.cooldown))suggested.cooldown=Number(canon.cooldown);
  const aoe=inferAoe(row);if(aoe!==null&&Boolean(m.aoe)!==aoe)suggested.aoe=aoe;
  return suggested;
}
function reason(row){
  if(!row.canonical)return ['UPSTREAM_LINK_UNRESOLVED'];
  const flags=row.refinedFlags||[];
  const expected=row.refined?.expectedKinds||[];
  const advanced=row.canonical?.advancedMechanics||[];
  const out=[];
  if(flags.includes('COMPOUND_MECHANIC')||expected.length>1)out.push('COMPOUND_EFFECT');
  if(flags.includes('DYNAMIC_MECHANIC'))out.push('DYNAMIC_OR_CONDITIONAL');
  if(advanced.length)out.push(...advanced.map(x=>`ADVANCED:${x}`));
  if(expected.includes('dot'))out.push('DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW');
  if(expected.length===0)out.push('NO_SINGLE_SUPPORTED_KIND');
  if(expected.some(x=>!SUPPORTED.has(x)))out.push('UNSUPPORTED_KIND');
  return uniq(out);
}

const queue=rows.map(row=>{
  const reasons=reason(row),suggestedCorePatch=coreDiff(row),hasDiff=Object.keys(suggestedCorePatch).length>0;
  let lane='VERIFIED_NO_CORE_CHANGE';
  if(!row.canonical)lane='UNRESOLVED';
  else if(reasons.length)lane='ENGINE_EXPANSION';
  else if(hasDiff)lane='CORE_PATCHABLE';
  else if(row.refinedSeverity==='CRITICAL'||row.refinedSeverity==='HIGH')lane='MANUAL_CANONICAL_REVIEW';
  return {
    characterId:row.characterId,characterName:row.characterName,slot:row.slot,jutsu:row.originalName,
    severity:row.refinedSeverity,flags:row.refinedFlags||[],lane,reasons,
    current:{cost:row.current?.cost??[],cooldown:row.current?.cooldown??0,mechanic:row.current?.mechanic??null},
    canonical:{description:row.canonical?.description??null,cost:row.canonical?.cost??null,cooldown:row.canonical?.cooldown??null,target:row.refined?.canonicalTarget??null,expectedKinds:row.refined?.expectedKinds??[],targets:row.canonical?.targets??[],advancedMechanics:row.canonical?.advancedMechanics??[]},
    suggestedCorePatch
  };
});

const laneCounts={},severityByLane={};
for(const q of queue){laneCounts[q.lane]=(laneCounts[q.lane]||0)+1;severityByLane[q.lane]??={};severityByLane[q.lane][q.severity]=(severityByLane[q.lane][q.severity]||0)+1}
const core=queue.filter(x=>x.lane==='CORE_PATCHABLE').sort((a,b)=>({CRITICAL:0,HIGH:1,MEDIUM:2,OK:3}[a.severity]??9)-({CRITICAL:0,HIGH:1,MEDIUM:2,OK:3}[b.severity]??9)||a.characterName.localeCompare(b.characterName)||a.slot-b.slot);
const expansion=queue.filter(x=>x.lane==='ENGINE_EXPANSION').sort((a,b)=>({CRITICAL:0,HIGH:1,MEDIUM:2,OK:3}[a.severity]??9)-({CRITICAL:0,HIGH:1,MEDIUM:2,OK:3}[b.severity]??9)||a.characterName.localeCompare(b.characterName)||a.slot-b.slot);
const summary={generatedAt:new Date().toISOString(),rows:queue.length,laneCounts,severityByLane,corePatchableCritical:core.filter(x=>x.severity==='CRITICAL').length,engineExpansionCritical:expansion.filter(x=>x.severity==='CRITICAL').length,policy:'CORE_PATCHABLE only means core fields are inferable from upstream without compound/dynamic semantics. It is NOT permission to deploy local-only: authoritative naruto-api parity remains mandatory.'};
fs.writeFileSync(path.join(dir,'CANONICAL-CORRECTION-QUEUE.json'),JSON.stringify(queue,null,2)+'\n');
fs.writeFileSync(path.join(dir,'CANONICAL-CORRECTION-QUEUE-SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');

let md=`# Fila canônica de correções\n\nGerado em: ${summary.generatedAt}\n\n## Política\n\n- **CORE_PATCHABLE:** tipo/alvo/custo/CD/AoE podem ser determinados sem mecânica composta/dinâmica. Ainda exige sincronização com o \`naruto-api\` antes de deploy.\n- **ENGINE_EXPANSION:** o efeito canônico exige ampliar o motor ou revisar semântica; não aproximar usando um tipo errado.\n- **UNRESOLVED:** personagem/jutsu ainda não ligado ao upstream.\n- **MANUAL_CANONICAL_REVIEW:** não há diff simples, mas a auditoria ainda exige revisão.\n\n## Contagem\n\n${Object.entries(laneCounts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`- ${k}: **${v}**`).join('\n')}\n\n- CORE_PATCHABLE críticos: **${summary.corePatchableCritical}**\n- ENGINE_EXPANSION críticos: **${summary.engineExpansionCritical}**\n\n## Primeiros CORE_PATCHABLE\n\n| Personagem | Jutsu | Sev. | Patch de núcleo | Flags |\n|---|---|---|---|---|\n`;
for(const q of core.slice(0,120))md+=`| ${esc(q.characterName)} | ${esc(q.jutsu)} | ${q.severity} | ${esc(JSON.stringify(q.suggestedCorePatch))} | ${esc(q.flags.join(', '))} |\n`;
md+=`\n## Primeiros ENGINE_EXPANSION\n\n| Personagem | Jutsu | Sev. | Motivos | Esperado |\n|---|---|---|---|---|\n`;
for(const q of expansion.slice(0,120))md+=`| ${esc(q.characterName)} | ${esc(q.jutsu)} | ${q.severity} | ${esc(q.reasons.join(', '))} | ${esc(q.canonical.expectedKinds.join('+'))} |\n`;
fs.writeFileSync(path.join(dir,'CANONICAL-CORRECTION-QUEUE.md'),md);
console.log(JSON.stringify(summary,null,2));
