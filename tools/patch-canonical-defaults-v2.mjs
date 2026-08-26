import fs from 'node:fs';

const file='tools/classify-canonical-upstream-v2.mjs';
let src=fs.readFileSync(file,'utf8');
const replaceOnce=(label,from,to)=>{
  const oldCount=src.split(from).length-1;
  const newCount=src.split(to).length-1;
  if(oldCount===1){src=src.replace(from,to);console.log(`${label}=PATCHED`);return;}
  if(oldCount===0&&newCount===1){console.log(`${label}=ALREADY_APPLIED`);return;}
  throw new Error(`${label}: old=${oldCount} new=${newCount}`);
};

replaceOnce('TARGET_PARITY',
`  return U.every((u) => L.some((l) => aliases(u).has(l) || aliases(l).has(u)));
};`,
`  const compatible=(a,b)=>aliases(a).has(b)||aliases(b).has(a);
  return U.every((u) => L.some((l) => compatible(u,l))) && L.every((l) => U.some((u) => compatible(u,l)));
};`);

replaceOnce('ZERO_COST_DEFAULT',
`  if (uc.length && JSON.stringify(lc) !== JSON.stringify(uc)) {
    flags.push('CUSTO_ERRADO');
    evidence.cost = { local: lc, upstream: uc };
  }`,
`  if (JSON.stringify(lc) !== JSON.stringify(uc)) {
    flags.push('CUSTO_ERRADO');
    evidence.cost = { local: lc, upstream: uc };
  }`);

replaceOnce('ZERO_COOLDOWN_DEFAULT',
`  const upCd = num(upstream.cooldown, null);
  if (upCd != null && localCd !== upCd) {
    flags.push('COOLDOWN_ERRADO');
    evidence.cooldown = { local: localCd, upstream: upCd };
  }`,
`  const upCd = num(upstream.cooldown, 0);
  if (localCd !== upCd) {
    flags.push('COOLDOWN_ERRADO');
    evidence.cooldown = { local: localCd, upstream: upCd };
  }`);

const testAnchor=`  const multi = classifyTechnique({ published: { ...basePublished, chakraCost: ['TAI'], cooldown: 2, mechanics: [{ op: 'damage', amount: 20, target: 'all-allies' }, { op: 'debuff', stat: 'defense', amount: 3, turns: 3, target: 'all-allies' }] }, upstream: baseUpstream });
  for (const expected of ['ALVO_ERRADO', 'CUSTO_ERRADO', 'COOLDOWN_ERRADO', 'DURAÇÃO_ERRADA']) if (!multi.classifications.includes(expected)) throw new Error(\`SELFTEST_${'${expected}'}\`);`;
const testReplacement=`  const multi = classifyTechnique({ published: { ...basePublished, chakraCost: ['TAI'], cooldown: 2, mechanics: [{ op: 'damage', amount: 20, target: 'all-allies' }, { op: 'debuff', stat: 'defense', amount: 3, turns: 3, target: 'all-allies' }] }, upstream: baseUpstream });
  for (const expected of ['ALVO_ERRADO', 'CUSTO_ERRADO', 'COOLDOWN_ERRADO', 'DURAÇÃO_ERRADA']) if (!multi.classifications.includes(expected)) throw new Error(\`SELFTEST_${'${expected}'}\`);
  const zeroDefaults = classifyTechnique({ published: { ...basePublished, chakraCost: ['NIN'], cooldown: 4 }, upstream: { ...baseUpstream, cost: [], cooldown: null } });
  if (!zeroDefaults.classifications.includes('CUSTO_ERRADO') || !zeroDefaults.classifications.includes('COOLDOWN_ERRADO')) throw new Error('SELFTEST_ZERO_DEFAULTS');
  const extraTarget = classifyTechnique({ published: { ...basePublished, mechanics: [...basePublished.mechanics, { op: 'heal', amount: 5, target: 'self' }] }, upstream: baseUpstream });
  if (!extraTarget.classifications.includes('ALVO_ERRADO')) throw new Error('SELFTEST_EXTRA_TARGET');`;
if(!src.includes('SELFTEST_ZERO_DEFAULTS'))replaceOnce('DEFAULT_SELFTESTS',testAnchor,testReplacement);
else console.log('DEFAULT_SELFTESTS=ALREADY_APPLIED');

fs.writeFileSync(file,src);
console.log('CANONICAL_DEFAULTS_PATCH=PASS');
