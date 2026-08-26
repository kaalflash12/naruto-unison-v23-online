import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const dir=path.join(root,'audit','balance','current');
const rows=JSON.parse(fs.readFileSync(path.join(dir,'CANONICAL-UPSTREAM-JUTSUS.json'),'utf8'));
if(!Array.isArray(rows)||rows.length!==836)throw new Error(`canonical rows=${rows?.length}`);

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const uniq=a=>[...new Set(a)];
const e=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');

function inferExpected(row){
  if(!row.canonical)return {kinds:[],confidence:'NONE',evidence:[]};
  const raw=String(row.canonical.raw||'');
  const text=norm(`${row.canonical.description||''} ${raw}`);
  const kinds=[];const evidence=[];
  const helper=/^[\s\[(]*invuln\b/i.test(raw.trim());
  if(helper){kinds.push('invuln');evidence.push('invuln-helper')}
  if(/\b(stun|stuns|stunned|atordo)/.test(text)){kinds.push('stun');evidence.push('stun-text')}
  if(/\b(invulnerable|invulnerability|invulneravel|invulnerabilidade)/.test(text)){kinds.push('invuln');evidence.push('invuln-text')}
  if(/\b(destructible defense|damage reduction|barrier|shield|defend|defense)/.test(text)){kinds.push('shield');evidence.push('defense-text')}
  if(/\b(heal|heals|healing|restore|restores|restoring|regain|regains|health from them|steals? \d+ health)/.test(text)){kinds.push('heal');evidence.push('heal-text')}
  if(/\b(affliction damage|poison|venom|bleed|burn|damage every turn|damage for \d+ turns|deals? \d+ damage[^.]{0,80}for \d+ turns)/.test(text)){kinds.push('dot');evidence.push('dot-text')}
  if(/\b(deal|deals|dealing|damage|piercing damage|pierce|afflict)\b/.test(text)){kinds.push('damage');evidence.push('damage-text')}
  const parsed=String(row.canonical.canonicalKind||'');
  if(parsed==='damage')kinds.push('damage');
  if(parsed==='stun')kinds.push('stun');
  if(parsed==='invuln')kinds.push('invuln');
  if(parsed==='shield')kinds.push('shield');
  if(parsed==='heal_or_leech')kinds.push('heal');
  if(parsed==='dot_or_affliction')kinds.push('dot');
  if(parsed.startsWith('compound:')){
    if(parsed.includes('damage'))kinds.push('damage');
    if(parsed.includes('stun'))kinds.push('stun');
    if(parsed.includes('invuln'))kinds.push('invuln');
    if(parsed.includes('shield'))kinds.push('shield');
    if(parsed.includes('heal_or_leech'))kinds.push('heal');
    if(parsed.includes('dot_or_affliction'))kinds.push('dot');
  }
  const out=uniq(kinds);
  const confidence=helper||evidence.length>=1?'HIGH':parsed&&parsed!=='utility'?'MEDIUM':'LOW';
  return {kinds:out,confidence,evidence:uniq(evidence)};
}
function currentCompatible(cur,expected){
  const c=String(cur||'unknown');
  if(!expected.length)return null;
  if(expected.includes(c))return true;
  // A stun skill in the current engine also deals its power as immediate damage.
  if(c==='stun'&&expected.includes('damage')&&expected.includes('stun'))return true;
  // DoT includes immediate damage in the current engine.
  if(c==='dot'&&expected.includes('dot'))return true;
  return false;
}
function refinedTarget(row){
  if(!row.canonical)return null;
  const raw=String(row.canonical.raw||'').trim();
  if(/^[\s\[(]*invuln\b/i.test(raw))return 'self';
  return row.canonical.canonicalTarget&&row.canonical.canonicalTarget!=='unknown'?row.canonical.canonicalTarget:null;
}

const refined=rows.map(row=>{
  const expected=inferExpected(row);
  const curKind=row.current?.mechanic?.kind??null;
  const curTarget=row.current?.mechanic?.target??null;
  const compat=currentCompatible(curKind,expected.kinds);
  const target=refinedTarget(row);
  const flags=(row.flags||[]).filter(f=>!['KIND_MISMATCH','TARGET_MISMATCH'].includes(f));
  if(compat===false&&expected.confidence==='HIGH')flags.push('KIND_MISMATCH_CONFIRMED');
  if(target&&['self','ally','enemy'].includes(target)&&curTarget!==target)flags.push('TARGET_MISMATCH_CONFIRMED');
  const advanced=(row.canonical?.advancedMechanics||[]).length>0;
  const unresolved=!row.canonical;
  let severity='OK';
  if(unresolved)severity='UNRESOLVED';
  else if(flags.includes('TARGET_MISMATCH_CONFIRMED')||flags.includes('KIND_MISMATCH_CONFIRMED'))severity='CRITICAL';
  else if(flags.includes('COMPOUND_MECHANIC')||flags.includes('DYNAMIC_MECHANIC')||advanced)severity='HIGH';
  else if(flags.length)severity='MEDIUM';
  return {...row,refined:{expectedKinds:expected.kinds,kindConfidence:expected.confidence,kindEvidence:expected.evidence,canonicalTarget:target,currentKindCompatible:compat},refinedFlags:uniq(flags),refinedSeverity:severity};
});

const severityCounts={};const flagCounts={};
for(const r of refined){severityCounts[r.refinedSeverity]=(severityCounts[r.refinedSeverity]||0)+1;for(const f of r.refinedFlags)flagCounts[f]=(flagCounts[f]||0)+1}
const linked=refined.filter(r=>r.canonical).length;
const critical=refined.filter(r=>r.refinedSeverity==='CRITICAL');
const high=refined.filter(r=>r.refinedSeverity==='HIGH');
const summary={generatedAt:new Date().toISOString(),rows:refined.length,linked,unresolved:refined.length-linked,severityCounts,flagCounts,criticalCount:critical.length,highCount:high.length,policy:'confirmed kind mismatch requires high-confidence description/helper evidence; target mismatch requires explicit To-target or invuln helper'};
fs.writeFileSync(path.join(dir,'CANONICAL-UPSTREAM-REFINED.json'),JSON.stringify(refined,null,2)+'\n');
fs.writeFileSync(path.join(dir,'CANONICAL-UPSTREAM-REFINED-SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
let md=`# Auditoria canônica refinada\n\nGerado em: ${summary.generatedAt}\n\nEsta camada reduz falsos positivos do parser Haskell. Um mismatch de tipo só é confirmado quando a descrição/helper canônico fornece evidência forte.\n\n## Cobertura\n\n- Jutsus atuais: **${summary.rows}**\n- Jutsus vinculados ao upstream: **${summary.linked}**\n- Não resolvidos: **${summary.unresolved}**\n\n## Severidade refinada\n\n${Object.entries(severityCounts).sort().map(([k,v])=>`- ${k}: **${v}**`).join('\n')}\n\n## Flags refinadas\n\n${Object.entries(flagCounts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`- ${k}: **${v}**`).join('\n')}\n\n## Casos críticos confirmados\n\n| Personagem | Jutsu | Atual | Esperado | Alvo atual | Alvo canônico | Flags |\n|---|---|---|---|---|---|---|\n`;
for(const r of critical.slice(0,200))md+=`| ${e(r.characterName)} | ${e(r.originalName)} | ${e(r.current?.mechanic?.kind)} | ${e(r.refined.expectedKinds.join('+')||'utility')} | ${e(r.current?.mechanic?.target)} | ${e(r.refined.canonicalTarget||'—')} | ${e(r.refinedFlags.join(', '))} |\n`;
md+=`\n## Regra\n\nCrítico confirmado ainda não significa patch automático. Técnicas compostas ou dinâmicas devem ser traduzidas para o motor V2 antes de alterar números.\n`;
fs.writeFileSync(path.join(dir,'CANONICAL-UPSTREAM-REFINED-REPORT.md'),md);
console.log(JSON.stringify(summary,null,2));
