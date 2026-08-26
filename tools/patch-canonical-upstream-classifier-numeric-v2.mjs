import fs from 'node:fs';

const classifierFile='tools/classify-canonical-upstream-v2.mjs';
let src=fs.readFileSync(classifierFile,'utf8');
const once=(label,from,to)=>{const n=src.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 match, got ${n}`);src=src.replace(from,to)};

once('classifier upstream numeric fields',
`    heal: values(block, /\\bheal\\s+(-?\\d+)/g),
    defend: values(block, /\\bdefend(?:'|With)?(?:\\s+\\w+)?\\s+(-?\\d+)/g),
    reduce: values(block, /\\bReduce[^\\]]*?Flat\\s+(\\d+)/g),
    durations: uniq(values(block, /\\bapply(?:With\\s*\\[[^\\]]*\\])?\\s+(\\d+)\\b/g).concat(values(block, /\\bControl\\s+(\\d+)\\b/g))),`,
`    heal: values(block, /\\bheal\\s+(-?\\d+)/gi),
    defend: values(block, /\\bdefend(?:'|With)?(?:\\s+\\w+)?\\s+(-?\\d+)/g),
    reduce: values(block, /\\bReduce[^\\]]*?Flat\\s+(\\d+)/g),
    executeThresholds: values(block, /\\bexecuteAt\\s+(-?\\d+)/g),
    durations: uniq(values(block, /\\bapply(?:With\\s*\\[[^\\]]*\\])?\\s+(\\d+)\\b/g).concat(values(block, /\\bControl\\s+(\\d+)\\b/g))),`);

once('classifier numeric helpers',
`function canonicalDirectDamage(upstream) {
  return [...arr(upstream?.damage), ...arr(upstream?.pierce)].filter(Number.isFinite);
}
const ENGINE_SUPPORTED_CANONICAL_CATEGORIES = new Set([`,
`function canonicalDirectDamage(upstream) {
  return [...arr(upstream?.damage), ...arr(upstream?.pierce)].filter(Number.isFinite);
}
function publishedNumericEffects(published) {
  const out={heal:[],dot:[],defense:[],reduction:[],execute:[]};
  for(const m of arr(published?.mechanics)){
    const op=String(m?.op||'');
    if(op==='heal'){const n=num(m.amount,null);if(n!=null)out.heal.push(n)}
    if(op==='status'&&String(m.status||'')==='regen'){const n=num(m.value??m.amount,null);if(n!=null)out.heal.push(n)}
    if(op==='status'&&['bleed','burn','parasite','poison'].includes(String(m.status||''))){const n=num(m.damage??m.value??m.amount,null);if(n!=null)out.dot.push(n)}
    if(op==='shield'){const n=num(m.amount,null);if(n!=null)out.defense.push(n)}
    if(op==='buff'&&String(m.stat||'')==='defense'){const n=num(m.amount,null);if(n!=null)out.reduction.push(n)}
    if(op==='execute'){const n=num(m.threshold,null);if(n!=null)out.execute.push(n)}
  }
  for(const k of Object.keys(out))out[k].sort((a,b)=>a-b);
  return out;
}
function canonicalNumericEffects(upstream) {
  const out={
    heal:arr(upstream?.heal).filter(Number.isFinite),
    dot:arr(upstream?.afflict).filter(Number.isFinite),
    defense:arr(upstream?.defend).filter(Number.isFinite),
    reduction:arr(upstream?.reduce).filter(Number.isFinite),
    execute:arr(upstream?.executeThresholds).filter(Number.isFinite)
  };
  for(const k of Object.keys(out))out[k].sort((a,b)=>a-b);
  return out;
}
function numericEffectMismatches(published,upstream){
  const local=publishedNumericEffects(published),canonical=canonicalNumericEffects(upstream),mismatches={};
  for(const key of Object.keys(canonical)){
    const L=local[key],U=canonical[key];
    if(!L.length&&!U.length)continue;
    if(JSON.stringify(L)!==JSON.stringify(U))mismatches[key]={local:L,upstream:U};
  }
  return mismatches;
}
const ENGINE_SUPPORTED_CANONICAL_CATEGORIES = new Set([`);

once('classifier numeric classification',
`  if (localDamage.length === 1 && upDamage.length === 1 && localDamage[0] !== upDamage[0]) {
    flags.push('DANO_ERRADO');
    evidence.damage = { local: localDamage[0], upstream: upDamage[0] };
  }
  const structural = flags.filter((x) => ['DANO_ERRADO','EFEITO_ERRADO','ALVO_ERRADO','CUSTO_ERRADO','COOLDOWN_ERRADO','DURAÇÃO_ERRADA'].includes(x));`,
`  if (localDamage.length === 1 && upDamage.length === 1 && localDamage[0] !== upDamage[0]) {
    flags.push('DANO_ERRADO');
    evidence.damage = { local: localDamage[0], upstream: upDamage[0] };
  }
  const numericEffects=numericEffectMismatches(published,upstream);
  if(Object.keys(numericEffects).length){
    if(!flags.includes('EFEITO_ERRADO'))flags.push('EFEITO_ERRADO');
    evidence.effectNumeric=numericEffects;
  }
  const structural = flags.filter((x) => ['DANO_ERRADO','EFEITO_ERRADO','ALVO_ERRADO','CUSTO_ERRADO','COOLDOWN_ERRADO','DURAÇÃO_ERRADA'].includes(x));`);

once('classifier selftest numeric effects',
`  const extraEffect = classifyTechnique({ published: { ...basePublished, mechanics: [...basePublished.mechanics, { op: 'heal', amount: 5, target: 'self' }] }, upstream: baseUpstream });
  if (!extraEffect.classifications.includes('EFEITO_ERRADO')) throw new Error('SELFTEST_EXTRA_EFFECT');
  const supportedGap = classifyTechnique({ published: basePublished, upstream: { ...baseUpstream, categories: [...baseUpstream.categories, 'redirect'] } });`,
`  const extraEffect = classifyTechnique({ published: { ...basePublished, mechanics: [...basePublished.mechanics, { op: 'heal', amount: 5, target: 'self' }] }, upstream: baseUpstream });
  if (!extraEffect.classifications.includes('EFEITO_ERRADO')) throw new Error('SELFTEST_EXTRA_EFFECT');
  const healMismatch=classifyTechnique({published:{description:'cura',chakraCost:['NIN'],cooldown:5,mechanics:[{op:'heal',amount:47,target:'self'},{op:'status',status:'regen',value:5,turns:2,target:'self'}]},upstream:{categories:['heal'],damage:[],pierce:[],afflict:[],heal:[15],defend:[],reduce:[],executeThresholds:[],targets:['self'],cost:['Nin'],cooldown:5,durations:[5]}});
  if(!healMismatch.classifications.includes('EFEITO_ERRADO')||!healMismatch.evidence.effectNumeric?.heal)throw new Error('SELFTEST_HEAL_NUMERIC');
  const dotMismatch=classifyTechnique({published:{description:'queimadura',chakraCost:[],cooldown:0,mechanics:[{op:'status',status:'burn',damage:5,turns:2,target:'primary'}]},upstream:{categories:['dot'],damage:[],pierce:[],afflict:[7],heal:[],defend:[],reduce:[],executeThresholds:[],targets:['enemy'],cost:[],cooldown:0,durations:[2]}});
  if(!dotMismatch.classifications.includes('EFEITO_ERRADO')||!dotMismatch.evidence.effectNumeric?.dot)throw new Error('SELFTEST_DOT_NUMERIC');
  const defenseMismatch=classifyTechnique({published:{description:'defesa',chakraCost:[],cooldown:0,mechanics:[{op:'shield',amount:20,turns:2,target:'self'}]},upstream:{categories:['defense'],damage:[],pierce:[],afflict:[],heal:[],defend:[30],reduce:[],executeThresholds:[],targets:['self'],cost:[],cooldown:0,durations:[2]}});
  if(!defenseMismatch.classifications.includes('EFEITO_ERRADO')||!defenseMismatch.evidence.effectNumeric?.defense)throw new Error('SELFTEST_DEFENSE_NUMERIC');
  const executeMismatch=classifyTechnique({published:{description:'execute',chakraCost:[],cooldown:0,mechanics:[{op:'execute',threshold:20,target:'primary'}]},upstream:{categories:['damage','execute'],damage:[],pierce:[],afflict:[],heal:[],defend:[],reduce:[],executeThresholds:[25],targets:['enemy'],cost:[],cooldown:0,durations:[]}});
  if(!executeMismatch.classifications.includes('EFEITO_ERRADO')||!executeMismatch.evidence.effectNumeric?.execute)throw new Error('SELFTEST_EXECUTE_NUMERIC');
  const supportedGap = classifyTechnique({ published: basePublished, upstream: { ...baseUpstream, categories: [...baseUpstream.categories, 'redirect'] } });`);

fs.writeFileSync(classifierFile,src);

const finalFile='tools/finalize-canonical-upstream-v2.mjs';
let fin=fs.readFileSync(finalFile,'utf8');
const finalOnce=(label,from,to)=>{const n=fin.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 match, got ${n}`);fin=fin.replace(from,to)};

finalOnce('finalizer numeric facts',
`return{categories:uniq(cats),damage:vals(block,/\\bdamage\\s+(-?\\d+)/g),pierce:vals(block,/\\bpierce\\s+(-?\\d+)/g),cost:listField(block,'cost'),cooldown:numberField(block,'cooldown'),durations:uniq(vals(block,/\\bapply(?:With\\s*\\[[^\\]]*\\])?\\s+(\\d+)\\b/g).concat(vals(block,/\\bControl\\s+(\\d+)\\b/g))),targets:targetFacts(block),description:field(block,'desc')||''}}`,
`return{categories:uniq(cats),damage:vals(block,/\\bdamage\\s+(-?\\d+)/g),pierce:vals(block,/\\bpierce\\s+(-?\\d+)/g),afflict:vals(block,/\\bafflict\\s+(-?\\d+)/g),heal:vals(block,/\\bheal\\s+(-?\\d+)/gi),defend:vals(block,/\\bdefend(?:'|With)?(?:\\s+\\w+)?\\s+(-?\\d+)/g),reduce:vals(block,/\\bReduce[^\\]]*?Flat\\s+(\\d+)/g),executeThresholds:vals(block,/\\bexecuteAt\\s+(-?\\d+)/g),cost:listField(block,'cost'),cooldown:numberField(block,'cooldown'),durations:uniq(vals(block,/\\bapply(?:With\\s*\\[[^\\]]*\\])?\\s+(\\d+)\\b/g).concat(vals(block,/\\bControl\\s+(\\d+)\\b/g))),targets:targetFacts(block),description:field(block,'desc')||''}}`);

finalOnce('finalizer numeric helpers',
`function localDamage(pub){const v=[];for(const m of arr(pub.mechanics)){if(['damage','multi-hit','drain'].includes(String(m?.op))){const n=num(m.amount,null);if(n!=null)v.push(n)}}return v}
const ENGINE_SUPPORTED_CANONICAL_CATEGORIES=`,
`function localDamage(pub){const v=[];for(const m of arr(pub.mechanics)){if(['damage','multi-hit','drain'].includes(String(m?.op))){const n=num(m.amount,null);if(n!=null)v.push(n)}}return v}
function localNumeric(pub){const o={heal:[],dot:[],defense:[],reduction:[],execute:[]};for(const m of arr(pub.mechanics)){const op=String(m?.op||'');if(op==='heal'){const n=num(m.amount,null);if(n!=null)o.heal.push(n)}if(op==='status'&&String(m.status||'')==='regen'){const n=num(m.value??m.amount,null);if(n!=null)o.heal.push(n)}if(op==='status'&&['bleed','burn','parasite','poison'].includes(String(m.status||''))){const n=num(m.damage??m.value??m.amount,null);if(n!=null)o.dot.push(n)}if(op==='shield'){const n=num(m.amount,null);if(n!=null)o.defense.push(n)}if(op==='buff'&&String(m.stat||'')==='defense'){const n=num(m.amount,null);if(n!=null)o.reduction.push(n)}if(op==='execute'){const n=num(m.threshold,null);if(n!=null)o.execute.push(n)}}for(const k of Object.keys(o))o[k].sort((a,b)=>a-b);return o}
function upstreamNumeric(up){const o={heal:arr(up.heal).filter(Number.isFinite),dot:arr(up.afflict).filter(Number.isFinite),defense:arr(up.defend).filter(Number.isFinite),reduction:arr(up.reduce).filter(Number.isFinite),execute:arr(up.executeThresholds).filter(Number.isFinite)};for(const k of Object.keys(o))o[k].sort((a,b)=>a-b);return o}
function numericMismatches(pub,up){const L=localNumeric(pub),U=upstreamNumeric(up),bad={};for(const k of Object.keys(U)){if(!L[k].length&&!U[k].length)continue;if(JSON.stringify(L[k])!==JSON.stringify(U[k]))bad[k]={local:L[k],upstream:U[k]}}return bad}
const ENGINE_SUPPORTED_CANONICAL_CATEGORIES=`);

finalOnce('finalizer numeric classify',
`const d1=localDamage(pub),d2=[...up.damage,...up.pierce];if(d1.length===1&&d2.length===1&&d1[0]!==d2[0]){flags.push('DANO_ERRADO');evidence.damage={local:d1[0],upstream:d2[0]}}const structural=`,
`const d1=localDamage(pub),d2=[...up.damage,...up.pierce];if(d1.length===1&&d2.length===1&&d1[0]!==d2[0]){flags.push('DANO_ERRADO');evidence.damage={local:d1[0],upstream:d2[0]}}const numeric=numericMismatches(pub,up);if(Object.keys(numeric).length){if(!flags.includes('EFEITO_ERRADO'))flags.push('EFEITO_ERRADO');evidence.effectNumeric=numeric}const structural=`);

fs.writeFileSync(finalFile,fin);
console.log('CANONICAL_UPSTREAM_NUMERIC_SEMANTICS_PATCH=APPLIED');
