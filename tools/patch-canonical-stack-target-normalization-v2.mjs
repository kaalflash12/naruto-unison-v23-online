import fs from 'node:fs';

const classifierFile='tools/classify-canonical-upstream-v2.mjs';
const finalizerFile='tools/finalize-canonical-upstream-v2.mjs';
const selfTest=process.argv.includes('--self-test');
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const uniq=a=>[...new Set(a)];
const normTarget=t=>{t=String(t??'').trim().toLowerCase();if(t==='primary')return'enemy';if(t==='all-enemies'||t==='enemies')return'enemies';if(t==='all-allies'||t==='allies')return'allies';return t||'unknown'};
const sameSet=(a,b)=>JSON.stringify(uniq(a).sort())===JSON.stringify(uniq(b).sort());
function normalizeStackAuxiliarySelf(localTargets,upstreamTargets,upstreamCategories,effectsMatch){
  const L=uniq(arr(localTargets).map(normTarget)),U=uniq(arr(upstreamTargets).map(normTarget));
  if(!effectsMatch||!arr(upstreamCategories).includes('stack')||!U.includes('self'))return U;
  const withoutSelf=U.filter(t=>t!=='self');
  return sameSet(L,withoutSelf)?withoutSelf:U;
}
function assert(cond,msg){if(!cond)throw new Error(msg)}
function runSelfTest(){
  assert(JSON.stringify(normalizeStackAuxiliarySelf(['enemy'],['self','enemy'],['damage','stack'],true))==='["enemy"]','stack self bookkeeping must normalize');
  assert(JSON.stringify(normalizeStackAuxiliarySelf(['enemies'],['self','enemies'],['damage','stack'],true))==='["enemies"]','aoe stack self bookkeeping must normalize');
  assert(JSON.stringify(normalizeStackAuxiliarySelf(['enemy'],['enemy','enemies'],['damage','stack'],true))==='["enemy","enemies"]','Minato real target mismatch must remain');
  assert(JSON.stringify(normalizeStackAuxiliarySelf(['enemy'],['self','enemy','enemies'],['damage','stack','requirement'],true))==='["self","enemy","enemies"]','Yugito real target mismatch must remain');
  assert(JSON.stringify(normalizeStackAuxiliarySelf(['enemy'],['self','enemy'],['damage','stack'],false))==='["self","enemy"]','effect mismatch must disable target normalization');
  assert(JSON.stringify(normalizeStackAuxiliarySelf(['enemy'],['self','enemy'],['damage'],true))==='["self","enemy"]','non-stack self target must remain');
  console.log('CANONICAL_STACK_TARGET_NORMALIZATION_V2_SELFTEST=PASS');
}
if(selfTest){runSelfTest();process.exit(0)}

function replaceOnce(src,label,from,to){const n=src.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 match, got ${n}`);return src.replace(from,to)}

let classifier=fs.readFileSync(classifierFile,'utf8');
classifier=replaceOnce(classifier,'classifier helper insertion',
`function descriptionClaimsDimension(description, category) {`,
`function normalizeStackAuxiliarySelfTarget(localTargets, upstreamTargets, upstreamCategories, effectsMatch) {
  const L = uniq(arr(localTargets).map(normalizeTarget));
  const U = uniq(arr(upstreamTargets).map(normalizeTarget));
  if (!effectsMatch || !arr(upstreamCategories).includes('stack') || !U.includes('self')) return U;
  const withoutSelf = U.filter((t) => t !== 'self');
  return sameSet(L, withoutSelf) ? withoutSelf : U;
}
function descriptionClaimsDimension(description, category) {`);
classifier=replaceOnce(classifier,'classifier target comparison',
`  const localCats = publishedCategories(published);
  const upCats = arr(upstream.categories);
  if (!effectEquivalent(localCats, upCats)) {
    flags.push('EFEITO_ERRADO');
    evidence.effect = { local: localCats, upstream: upCats };
  }
  const localTargets = publishedTargets(published);
  const upTargets = arr(upstream.targets);
  if (!targetCompatible(localTargets, upTargets)) {
    flags.push('ALVO_ERRADO');
    evidence.target = { local: localTargets, upstream: upTargets };
  }`,
`  const localCats = publishedCategories(published);
  const upCats = arr(upstream.categories);
  const effectsMatch = effectEquivalent(localCats, upCats);
  if (!effectsMatch) {
    flags.push('EFEITO_ERRADO');
    evidence.effect = { local: localCats, upstream: upCats };
  }
  const localTargets = publishedTargets(published);
  const rawUpTargets = arr(upstream.targets);
  const upTargets = normalizeStackAuxiliarySelfTarget(localTargets, rawUpTargets, upCats, effectsMatch);
  if (!targetCompatible(localTargets, upTargets)) {
    flags.push('ALVO_ERRADO');
    evidence.target = { local: localTargets, upstream: rawUpTargets, normalizedUpstream: upTargets };
  }`);
fs.writeFileSync(classifierFile,classifier);

let finalizer=fs.readFileSync(finalizerFile,'utf8');
finalizer=replaceOnce(finalizer,'finalizer helper insertion',
`function claims(desc,flag){`,
`function normalizeStackAuxiliarySelfTarget(localTargets,upstreamTargets,upstreamCategories,effectsMatch){const L=uniq(arr(localTargets).map(targetNorm)),U=uniq(arr(upstreamTargets).map(targetNorm));if(!effectsMatch||!arr(upstreamCategories).includes('stack')||!U.includes('self'))return U;const withoutSelf=U.filter(t=>t!=='self');return sameSet(L,withoutSelf)?withoutSelf:U}\nfunction claims(desc,flag){`);
finalizer=replaceOnce(finalizer,'finalizer target comparison',
`const lc=localCats(pub);if(!effectEquivalent(lc,up.categories)){flags.push('EFEITO_ERRADO');evidence.effect={local:lc,upstream:up.categories}}const lt=localTargets(pub);if(!targetCompatible(lt,up.targets)){flags.push('ALVO_ERRADO');evidence.target={local:lt,upstream:up.targets}}`,
`const lc=localCats(pub);const effectOk=effectEquivalent(lc,up.categories);if(!effectOk){flags.push('EFEITO_ERRADO');evidence.effect={local:lc,upstream:up.categories}}const lt=localTargets(pub),rawUt=arr(up.targets),ut=normalizeStackAuxiliarySelfTarget(lt,rawUt,up.categories,effectOk);if(!targetCompatible(lt,ut)){flags.push('ALVO_ERRADO');evidence.target={local:lt,upstream:rawUt,normalizedUpstream:ut}}`);
fs.writeFileSync(finalizerFile,finalizer);

console.log('CANONICAL_STACK_TARGET_NORMALIZATION_V2_PATCHED=PASS');
