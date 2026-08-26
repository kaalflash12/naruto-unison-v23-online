import fs from 'node:fs';
import path from 'node:path';

const argv=process.argv.slice(2);
const arg=(name,def)=>{const i=argv.indexOf(`--${name}`);return i>=0&&argv[i+1]?argv[i+1]:def};
const root=path.resolve(arg('root',process.cwd()));
const sourceDir=path.resolve(arg('source',path.join(root,'audit','balance','canonical-v2')));
const outDir=path.resolve(arg('out',path.join(root,'audit','balance','canonical-v2-corrections')));
const selfTest=argv.includes('--self-test');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(name,data)=>fs.writeFileSync(path.join(outDir,name),JSON.stringify(data,null,2)+'\n');
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const uniq=a=>[...new Set(a)];

const COMPARABLE=new Set(['RESOLVIDO','RESOLVIDO_POR_NOME_ATUAL_EXATO']);
const STRUCTURAL=['CUSTO_ERRADO','COOLDOWN_ERRADO','DANO_ERRADO','ALVO_ERRADO','DURAÇÃO_ERRADA'];
const COMPLEX_BLOCKERS=new Set(['dynamic-change','alternate','channel','trap-counter','reflect','redirect','bomb','sacrifice','interrupt','stack','requirement','charges']);
const EVIDENCE_KEY={CUSTO_ERRADO:'cost',COOLDOWN_ERRADO:'cooldown',DANO_ERRADO:'damage',ALVO_ERRADO:'target',DURAÇÃO_ERRADA:'duration'};
const SUPPORTED_COST=new Set(['blood','gen','nin','tai','rand']);
const SUPPORTED_TARGET=new Set(['self','enemy','enemies','ally','allies']);

function representableDimension(row,classification){
  const ev=row.evidence?.[EVIDENCE_KEY[classification]];
  if(ev==null)return false;
  if(classification==='CUSTO_ERRADO')return arr(ev.upstream).length>0&&arr(ev.upstream).every(x=>SUPPORTED_COST.has(String(x).toLowerCase()));
  if(classification==='COOLDOWN_ERRADO')return Number.isInteger(Number(ev.upstream))&&Number(ev.upstream)>=0;
  if(classification==='DANO_ERRADO')return Number.isFinite(Number(ev.upstream))&&Number(ev.upstream)>=0;
  if(classification==='ALVO_ERRADO')return arr(ev.upstream).length>0&&arr(ev.upstream).every(x=>SUPPORTED_TARGET.has(String(x).toLowerCase()));
  if(classification==='DURAÇÃO_ERRADA')return arr(ev.upstream).length>0&&arr(ev.upstream).every(x=>Number.isInteger(Number(x))&&Number(x)>0);
  return false;
}

function analyze(row){
  const cls=arr(row.classifications);
  const upstreamCats=arr(row.upstream?.categories);
  const blockers=upstreamCats.filter(x=>COMPLEX_BLOCKERS.has(String(x)));
  const structural=STRUCTURAL.filter(x=>cls.includes(x));
  const missingEvidence=structural.filter(x=>row.evidence?.[EVIDENCE_KEY[x]]==null);
  const hasComplexEffect=cls.includes('EFEITO_ERRADO')||blockers.length>0;
  const hasUnsupported=cls.includes('MOTOR_INSUFICIENTE');
  const nonStructuralMechanic=cls.filter(x=>!STRUCTURAL.includes(x)&&!['DESCRIÇÃO_ERRADA','CORRETA'].includes(x));
  const dimensionSafeBase=!hasComplexEffect&&!hasUnsupported&&nonStructuralMechanic.length===0;
  const safeStructuralDimensions=dimensionSafeBase?structural.filter(x=>!missingEvidence.includes(x)&&representableDimension(row,x)):[];
  const heldStructuralDimensions=structural.filter(x=>!safeStructuralDimensions.includes(x));
  const safeStructural=safeStructuralDimensions.length>0;
  const tier=cls.includes('CORRETA')?'CORRETA':hasComplexEffect||hasUnsupported?'COMPLEX_EFFECT':safeStructural?'SAFE_STRUCTURAL':structural.length>0?'MANUAL_REVIEW':cls.includes('DESCRIÇÃO_ERRADA')?'DESCRIPTION_AFTER_MECHANICS':'MANUAL_REVIEW';
  return{tier,structuralDimensions:structural,safeStructuralDimensions,heldStructuralDimensions,blockers:uniq(blockers),missingEvidence,requiresManualSemantics:hasComplexEffect||hasUnsupported,descriptionAfterMechanics:cls.includes('DESCRIÇÃO_ERRADA')};
}

function record(row,a){
  return{
    characterId:row.characterId,characterName:row.characterName,slot:row.slot,
    techniqueId:row.techniqueId,techniqueName:row.techniqueName,originalName:row.originalName,
    resolution:row.resolution,matchSource:row.matchSource,
    upstreamCharacter:row.upstreamCharacter,upstreamTechnique:row.upstreamTechnique,upstreamSource:row.upstreamSource,
    classifications:row.classifications,evidence:row.evidence,
    upstreamCategories:arr(row.upstream?.categories),
    tier:a.tier,structuralDimensions:a.structuralDimensions,
    safeStructuralDimensions:a.safeStructuralDimensions,heldStructuralDimensions:a.heldStructuralDimensions,
    blockers:a.blockers,requiresManualSemantics:a.requiresManualSemantics,descriptionAfterMechanics:a.descriptionAfterMechanics
  };
}

function validateSource(rows,summary){
  if(rows.length!==836)throw new Error(`FINAL_ROWS=${rows.length}`);
  if(summary.totalTechniques!==836||summary.accounted!==836||summary.unaccounted!==0||summary.gate!=='PASS')throw new Error(`FINAL_ACCOUNTING_INVALID:${JSON.stringify(summary)}`);
  if((summary.classificationCounts?.MOTOR_INSUFICIENTE||0)!==0)throw new Error(`MOTOR_INSUFICIENTE=${summary.classificationCounts?.MOTOR_INSUFICIENTE}`);
  const comparable=rows.filter(r=>COMPARABLE.has(r.resolution));
  const justified=rows.filter(r=>String(r.resolution||'').startsWith('JUSTIFICADO_'));
  if(comparable.length!==719)throw new Error(`COMPARABLE=${comparable.length}`);
  if(justified.length!==117)throw new Error(`JUSTIFIED=${justified.length}`);
  if(comparable.length+justified.length!==836)throw new Error('ACCOUNTING_PARTITION_INVALID');
  return{comparable,justified};
}

function build(rows,summary){
  const{comparable,justified}=validateSource(rows,summary);
  const analyzed=comparable.map(r=>({row:r,a:analyze(r)}));
  const correct=analyzed.filter(x=>x.a.tier==='CORRETA');
  const actionable=analyzed.filter(x=>x.a.tier!=='CORRETA');
  const safe=actionable.filter(x=>x.a.tier==='SAFE_STRUCTURAL').map(x=>record(x.row,x.a));
  const complex=actionable.filter(x=>x.a.tier==='COMPLEX_EFFECT').map(x=>record(x.row,x.a));
  const description=actionable.filter(x=>x.a.descriptionAfterMechanics).map(x=>record(x.row,x.a));
  const manual=actionable.filter(x=>x.a.tier==='MANUAL_REVIEW').map(x=>record(x.row,x.a));
  const held=actionable.filter(x=>x.a.heldStructuralDimensions.length).map(x=>record(x.row,x.a));
  const missingEvidence=actionable.filter(x=>x.a.missingEvidence.length).map(x=>({characterId:x.row.characterId,slot:x.row.slot,techniqueId:x.row.techniqueId,missing:x.a.missingEvidence}));
  const leakedJustified=actionable.filter(x=>String(x.row.resolution||'').startsWith('JUSTIFICADO_'));
  const unsafeSafe=safe.filter(r=>r.requiresManualSemantics||r.blockers.length||r.classifications.includes('EFEITO_ERRADO')||r.classifications.includes('MOTOR_INSUFICIENTE')||!r.safeStructuralDimensions.length);
  if(leakedJustified.length)throw new Error(`JUSTIFIED_LEAK=${leakedJustified.length}`);
  if(unsafeSafe.length)throw new Error(`UNSAFE_SAFE_ROWS=${unsafeSafe.length}`);
  if(missingEvidence.length)throw new Error(`STRUCTURAL_EVIDENCE_MISSING=${missingEvidence.length}`);
  if(correct.some(x=>x.row.classifications.length!==1))throw new Error('CORRETA_NOT_EXCLUSIVE');
  const queuedIds=new Set([...safe,...complex,...manual].map(r=>`${r.characterId}::${r.slot}`));
  if(queuedIds.size!==actionable.length)throw new Error(`QUEUE_COVERAGE=${queuedIds.size}/${actionable.length}`);
  const counts={};for(const c of Object.keys(summary.classificationCounts||{}))counts[c]=summary.classificationCounts[c];
  const result={
    generatedAt:new Date().toISOString(),sourceUpstreamCommit:summary.upstreamCommit||null,
    totalTechniques:836,comparable:719,justifiedExcluded:117,correct:correct.length,actionable:actionable.length,
    safeStructural:safe.length,complexEffect:complex.length,manualReview:manual.length,descriptionAfterMechanics:description.length,
    heldStructuralRows:held.length,heldStructuralDimensions:held.reduce((n,r)=>n+r.heldStructuralDimensions.length,0),
    classificationCounts:counts,
    safeStructuralDimensions:Object.fromEntries(STRUCTURAL.map(k=>[k,safe.filter(r=>r.safeStructuralDimensions.includes(k)).length])),
    heldStructuralDimensionCounts:Object.fromEntries(STRUCTURAL.map(k=>[k,held.filter(r=>r.heldStructuralDimensions.includes(k)).length])),
    complexBlockerCounts:Object.fromEntries([...COMPLEX_BLOCKERS].sort().map(k=>[k,complex.filter(r=>r.blockers.includes(k)).length])),
    gate:'PASS'
  };
  return{result,safe,complex,description,manual,held,correct:correct.map(x=>record(x.row,x.a)),justified};
}

function runSelfTest(){
  const base={characterId:'c',characterName:'C',slot:1,techniqueId:'t',techniqueName:'T',resolution:'RESOLVIDO',matchSource:'X',upstreamCharacter:'C',upstreamTechnique:'T',upstreamSource:'x.hs',published:{},upstream:{categories:['damage']},evidence:{cost:{local:['nin'],upstream:['tai']}},classifications:['CUSTO_ERRADO']};
  const a=analyze(base);if(a.tier!=='SAFE_STRUCTURAL'||a.safeStructuralDimensions[0]!=='CUSTO_ERRADO')throw new Error(`SELFTEST_SAFE=${JSON.stringify(a)}`);
  const unsupportedCost=structuredClone(base);unsupportedCost.evidence.cost.upstream=['chakra'];const u=analyze(unsupportedCost);if(u.tier!=='MANUAL_REVIEW'||!u.heldStructuralDimensions.includes('CUSTO_ERRADO'))throw new Error(`SELFTEST_UNREPRESENTABLE_COST=${JSON.stringify(u)}`);
  const mixed=structuredClone(base);mixed.classifications=['CUSTO_ERRADO','COOLDOWN_ERRADO'];mixed.evidence.cooldown={local:4,upstream:0};mixed.evidence.cost.upstream=['chakra'];const m=analyze(mixed);if(m.tier!=='SAFE_STRUCTURAL'||!m.safeStructuralDimensions.includes('COOLDOWN_ERRADO')||!m.heldStructuralDimensions.includes('CUSTO_ERRADO'))throw new Error(`SELFTEST_MIXED=${JSON.stringify(m)}`);
  const complex=structuredClone(base);complex.upstream.categories=['damage','dynamic-change'];if(analyze(complex).tier!=='COMPLEX_EFFECT')throw new Error('SELFTEST_DYNAMIC_BLOCK');
  const effect=structuredClone(base);effect.classifications=['EFEITO_ERRADO'];if(analyze(effect).tier!=='COMPLEX_EFFECT')throw new Error('SELFTEST_EFFECT_BLOCK');
  const correct=structuredClone(base);correct.classifications=['CORRETA'];correct.evidence={};if(analyze(correct).tier!=='CORRETA')throw new Error('SELFTEST_CORRETA');
  console.log('CANONICAL_V2_CORRECTION_QUEUE_SELFTEST=PASS');
}

if(selfTest){runSelfTest();process.exit(0)}
fs.mkdirSync(outDir,{recursive:true});
const rows=read(path.join(sourceDir,'FINAL-CLASSIFICATION-836.json'));
const summary=read(path.join(sourceDir,'FINAL-SUMMARY.json'));
const built=build(rows,summary);
write('SUMMARY.json',built.result);
write('SAFE-STRUCTURAL.json',built.safe);
write('COMPLEX-EFFECT.json',built.complex);
write('DESCRIPTION-AFTER-MECHANICS.json',built.description);
write('MANUAL-REVIEW.json',built.manual);
write('HELD-STRUCTURAL-DIMENSIONS.json',built.held);
write('CORRECT.json',built.correct);
const report=[
  '# Fila de correções canônicas V2','',
  `- Técnicas totais contabilizadas: **${built.result.totalTechniques}**`,
  `- Comparáveis 1:1: **${built.result.comparable}**`,
  `- Justificadas sem referência 1:1 e excluídas da fila: **${built.result.justifiedExcluded}**`,
  `- CORRETA: **${built.result.correct}**`,
  `- Técnicas com correção pendente: **${built.result.actionable}**`,
  `- SAFE_STRUCTURAL: **${built.result.safeStructural}**`,
  `- COMPLEX_EFFECT: **${built.result.complexEffect}**`,
  `- MANUAL_REVIEW: **${built.result.manualReview}**`,
  `- Dimensões estruturais retidas: **${built.result.heldStructuralDimensions}**`,
  `- DESCRIPTION_AFTER_MECHANICS: **${built.result.descriptionAfterMechanics}**`,
  `- Gate: **${built.result.gate}**`,'',
  '## Regra','',
  '- Nenhuma das 117 técnicas justificadas entra na fila.',
  '- SAFE_STRUCTURAL é calculado por dimensão, exige evidência exata e valor representável pelo schema publicado.',
  '- O patch automático futuro só pode consumir safeStructuralDimensions; classifications não é autorização de escrita.',
  '- Dimensões não representáveis ficam em heldStructuralDimensions.',
  '- EFEITO_ERRADO e categorias dinâmicas nunca são auto-corrigidas por este estágio.',
  '- DESCRIÇÃO_ERRADA é corrigida somente depois da mecânica correspondente.',
  '- Este estágio é fidelidade canônica; não aplica buff/nerf de balanceamento.'
].join('\n')+'\n';
fs.writeFileSync(path.join(outDir,'REPORT.md'),report);
console.log(JSON.stringify(built.result,null,2));
