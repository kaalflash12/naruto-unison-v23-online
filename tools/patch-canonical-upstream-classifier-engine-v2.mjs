import fs from 'node:fs';

const file='tools/classify-canonical-upstream-v2.mjs';
let src=fs.readFileSync(file,'utf8');
const once=(label,from,to)=>{const n=src.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 match, got ${n}`);src=src.replace(from,to)};

once('engine support table',
`function engineInsufficient(upstream) {
  const insufficient = new Set(['reflect', 'redirect', 'sacrifice', 'bomb', 'dynamic-change', 'channel', 'interrupt']);
  return arr(upstream?.categories).some((x) => insufficient.has(x));
}
function effectEquivalent(localCats, upstreamCats) {
  const ignorableMeta = new Set(['requirement', 'charges']);
  const unsupported = new Set(['dynamic-change','channel','reflect','redirect','sacrifice','bomb','interrupt']);
  const U = new Set(uniq(upstreamCats.filter((x) => !ignorableMeta.has(x) && !unsupported.has(x))));`,
`const ENGINE_SUPPORTED_CANONICAL_CATEGORIES = new Set([
  'damage','heal','defense','reduction','stun','disable','silence','expose','weaken','strengthen','exhaust','focus',
  'cleanse','dispel','chakra','alternate','stack','trap-counter','leech','demolish','dot','execute','invulnerable',
  'requirement','charges','dynamic-change','channel','reflect','redirect','sacrifice','bomb','interrupt'
]);
function engineInsufficient(upstream) {
  return arr(upstream?.categories).some((x) => !ENGINE_SUPPORTED_CANONICAL_CATEGORIES.has(x));
}
function effectEquivalent(localCats, upstreamCats) {
  const ignorableMeta = new Set(['requirement', 'charges']);
  const U = new Set(uniq(upstreamCats.filter((x) => !ignorableMeta.has(x))));`);

once('motor evidence',
`    evidence.motor = arr(upstream.categories).filter((x) => ['reflect','redirect','sacrifice','bomb','dynamic-change','channel','interrupt'].includes(x));`,
`    evidence.motor = arr(upstream.categories).filter((x) => !ENGINE_SUPPORTED_CANONICAL_CATEGORIES.has(x));`);

once('selftest motor semantics',
`  const motor = classifyTechnique({ published: basePublished, upstream: { ...baseUpstream, categories: [...baseUpstream.categories, 'redirect'] } });
  if (!motor.classifications.includes('MOTOR_INSUFICIENTE')) throw new Error('SELFTEST_MOTOR');`,
`  const supportedGap = classifyTechnique({ published: basePublished, upstream: { ...baseUpstream, categories: [...baseUpstream.categories, 'redirect'] } });
  if (supportedGap.classifications.includes('MOTOR_INSUFICIENTE')) throw new Error('SELFTEST_SUPPORTED_GAP_MOTOR');
  if (!supportedGap.classifications.includes('EFEITO_ERRADO')) throw new Error('SELFTEST_SUPPORTED_GAP_EFFECT');
  const futureGap = classifyTechnique({ published: basePublished, upstream: { ...baseUpstream, categories: [...baseUpstream.categories, 'future-unimplemented'] } });
  if (!futureGap.classifications.includes('MOTOR_INSUFICIENTE')) throw new Error('SELFTEST_FUTURE_MOTOR');`);

fs.writeFileSync(file,src);
console.log('CANONICAL_UPSTREAM_CLASSIFIER_ENGINE_RECALIBRATION=APPLIED');
