import fs from 'node:fs';
import path from 'node:path';

const argv=process.argv.slice(2);
const arg=(name,def)=>{const i=argv.indexOf(`--${name}`);return i>=0&&argv[i+1]?argv[i+1]:def};
const root=path.resolve(arg('root',process.cwd()));
const queueDir=path.resolve(arg('queue',path.join(root,'audit','balance','canonical-v2-corrections')));
const outDir=path.resolve(arg('out',path.join(root,'audit','balance','canonical-v2-complex-diagnostics')));
const selfTest=argv.includes('--self-test');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(name,data)=>fs.writeFileSync(path.join(outDir,name),JSON.stringify(data,null,2)+'\n');
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const uniq=a=>[...new Set(a)];
const STRUCTURAL=['CUSTO_ERRADO','COOLDOWN_ERRADO','DANO_ERRADO','ALVO_ERRADO','DURAÇÃO_ERRADA'];
const BLOCKERS=['alternate','bomb','channel','charges','dynamic-change','interrupt','redirect','reflect','requirement','sacrifice','stack','trap-counter'];
// These categories are now executable by Combat Rules V2. This does not imply
// that the published technique already represents the upstream behavior 1:1.
const ENGINE_SUPPORTED=new Set(BLOCKERS);
const key=r=>`${String(r.characterId)}::${String(r.slot).padStart(2,'0')}::${String(r.techniqueId)}`;
const countBy=(rows,pred)=>rows.reduce((n,r)=>n+(pred(r)?1:0),0);
const compactEvidence=r=>({
  cost:r.evidence?.cost??null,
  cooldown:r.evidence?.cooldown??null,
  damage:r.evidence?.damage??null,
  target:r.evidence?.target??null,
  duration:r.evidence?.duration??null,
  effect:r.evidence?.effect??null
});

function summarize(rows,queueSummary){
  if(queueSummary.gate!=='PASS')throw new Error(`QUEUE_GATE=${queueSummary.gate}`);
  if(queueSummary.complexEffect!==rows.length)throw new Error(`COMPLEX_COUNT=${rows.length}/${queueSummary.complexEffect}`);
  const sorted=[...rows].sort((a,b)=>key(a).localeCompare(key(b)));
  const byBlocker={};
  for(const blocker of BLOCKERS){
    const subset=sorted.filter(r=>arr(r.blockers).includes(blocker));
    byBlocker[blocker]={
      rows:subset.length,
      engineSupported:ENGINE_SUPPORTED.has(blocker),
      withEffectMismatch:countBy(subset,r=>arr(r.classifications).includes('EFEITO_ERRADO')),
      withoutEffectMismatch:countBy(subset,r=>!arr(r.classifications).includes('EFEITO_ERRADO')),
      exclusiveBlocker:countBy(subset,r=>arr(r.blockers).length===1),
      structuralDimensions:Object.fromEntries(STRUCTURAL.map(d=>[d,countBy(subset,r=>arr(r.structuralDimensions).includes(d))])),
      heldStructuralDimensions:Object.fromEntries(STRUCTURAL.map(d=>[d,countBy(subset,r=>arr(r.heldStructuralDimensions).includes(d))])),
      samples:subset.slice(0,8).map(r=>({
        characterId:r.characterId,characterName:r.characterName,slot:r.slot,
        techniqueId:r.techniqueId,techniqueName:r.techniqueName,originalName:r.originalName,
        classifications:r.classifications,blockers:r.blockers,
        structuralDimensions:r.structuralDimensions,heldStructuralDimensions:r.heldStructuralDimensions,
        dimensionBlockers:r.dimensionBlockers,evidence:compactEvidence(r),
        upstreamCategories:r.upstreamCategories,
        upstreamCharacter:r.upstreamCharacter,upstreamTechnique:r.upstreamTechnique,upstreamSource:r.upstreamSource
      }))
    };
  }
  const intersections={};
  for(const r of sorted){const b=uniq(arr(r.blockers)).sort();if(!b.length)continue;const k=b.join('+');intersections[k]=(intersections[k]||0)+1}
  const intersectionRows=Object.entries(intersections).map(([blockers,rows])=>({blockers:blockers.split('+'),rows})).sort((a,b)=>b.rows-a.rows||a.blockers.join('+').localeCompare(b.blockers.join('+')));
  const blockerFree=sorted.filter(r=>arr(r.blockers).length===0);
  const effectMismatch=sorted.filter(r=>arr(r.classifications).includes('EFEITO_ERRADO'));
  const noEffectMismatch=sorted.filter(r=>!arr(r.classifications).includes('EFEITO_ERRADO'));
  const supportedBlockerOnly=noEffectMismatch.filter(r=>arr(r.blockers).length>0&&arr(r.blockers).every(b=>ENGINE_SUPPORTED.has(String(b))));
  const summary={
    generatedAt:new Date().toISOString(),
    sourceUpstreamCommit:queueSummary.sourceUpstreamCommit||null,
    complexRows:sorted.length,
    withEffectMismatch:effectMismatch.length,
    withoutEffectMismatch:noEffectMismatch.length,
    blockerFreeComplexRows:blockerFree.length,
    allBlockersEngineSupported:BLOCKERS.every(b=>ENGINE_SUPPORTED.has(b)),
    supportedBlockerRowsWithoutEffectMismatch:supportedBlockerOnly.length,
    structuralDimensionCounts:Object.fromEntries(STRUCTURAL.map(d=>[d,countBy(sorted,r=>arr(r.structuralDimensions).includes(d))])),
    heldStructuralDimensionCounts:Object.fromEntries(STRUCTURAL.map(d=>[d,countBy(sorted,r=>arr(r.heldStructuralDimensions).includes(d))])),
    blockerCounts:Object.fromEntries(BLOCKERS.map(b=>[b,byBlocker[b].rows])),
    topIntersections:intersectionRows.slice(0,30),
    gate:sorted.length===710&&effectMismatch.length<=sorted.length&&BLOCKERS.every(b=>byBlocker[b].rows===Number(queueSummary.complexBlockerCounts?.[b]||0))?'PASS':'FAIL'
  };
  const candidates=supportedBlockerOnly.map(r=>({
    characterId:r.characterId,characterName:r.characterName,slot:r.slot,
    techniqueId:r.techniqueId,techniqueName:r.techniqueName,originalName:r.originalName,
    classifications:r.classifications,blockers:r.blockers,
    structuralDimensions:r.structuralDimensions,heldStructuralDimensions:r.heldStructuralDimensions,
    dimensionBlockers:r.dimensionBlockers,evidence:compactEvidence(r),upstreamCategories:r.upstreamCategories,
    upstreamCharacter:r.upstreamCharacter,upstreamTechnique:r.upstreamTechnique,upstreamSource:r.upstreamSource
  }));
  return{summary,byBlocker,intersections:intersectionRows,candidates};
}

function runSelfTest(){
  const q={gate:'PASS',complexEffect:2,sourceUpstreamCommit:'x',complexBlockerCounts:Object.fromEntries(BLOCKERS.map(b=>[b,b==='channel'?1:b==='alternate'?1:0]))};
  const rows=[
    {characterId:'a',slot:1,techniqueId:'t1',classifications:['EFEITO_ERRADO','DANO_ERRADO'],blockers:['channel'],structuralDimensions:['DANO_ERRADO'],heldStructuralDimensions:['DANO_ERRADO'],evidence:{damage:{local:1,upstream:2}}},
    {characterId:'b',slot:2,techniqueId:'t2',classifications:['DURAÇÃO_ERRADA'],blockers:['alternate'],structuralDimensions:['DURAÇÃO_ERRADA'],heldStructuralDimensions:['DURAÇÃO_ERRADA'],evidence:{duration:{local:[1],upstream:[2]}}}
  ];
  const r=summarize(rows,q);if(r.summary.withEffectMismatch!==1||r.summary.supportedBlockerRowsWithoutEffectMismatch!==1||r.byBlocker.channel.rows!==1||r.summary.gate!=='FAIL'||r.candidates[0]?.evidence?.duration?.upstream?.[0]!==2)throw new Error(`SELFTEST=${JSON.stringify(r.summary)}`);
  // Production gate fixes the expected complex row count at 710, so a two-row fixture must fail it.
  console.log('CANONICAL_V2_COMPLEX_BLOCKER_DIAGNOSTICS_SELFTEST=PASS');
}

if(selfTest){runSelfTest();process.exit(0)}
fs.mkdirSync(outDir,{recursive:true});
const queueSummary=read(path.join(queueDir,'SUMMARY.json'));
const rows=read(path.join(queueDir,'COMPLEX-EFFECT.json'));
const out=summarize(rows,queueSummary);
write('SUMMARY.json',out.summary);
write('BY-BLOCKER.json',out.byBlocker);
write('INTERSECTIONS.json',out.intersections);
write('SUPPORTED-BLOCKER-NO-EFFECT-MISMATCH.json',out.candidates);
fs.writeFileSync(path.join(outDir,'REPORT.md'),[
  '# Diagnóstico dos bloqueadores canônicos V2','',
  `- Linhas complexas: **${out.summary.complexRows}**`,
  `- Com EFEITO_ERRADO: **${out.summary.withEffectMismatch}**`,
  `- Sem EFEITO_ERRADO: **${out.summary.withoutEffectMismatch}**`,
  `- Bloqueadores suportados pelo motor V2: **${out.summary.allBlockersEngineSupported?'SIM':'NÃO'}**`,
  `- Linhas sem EFEITO_ERRADO compostas somente por bloqueadores suportados: **${out.summary.supportedBlockerRowsWithoutEffectMismatch}**`,
  `- Gate: **${out.summary.gate}**`,'','## Bloqueadores','',
  ...BLOCKERS.map(b=>`- ${b}: ${out.byBlocker[b].rows} (efeito divergente ${out.byBlocker[b].withEffectMismatch}; sem efeito divergente ${out.byBlocker[b].withoutEffectMismatch}; exclusivo ${out.byBlocker[b].exclusiveBlocker})`)
].join('\n')+'\n');
console.log(JSON.stringify(out.summary,null,2));if(out.summary.gate!=='PASS')process.exitCode=2;
