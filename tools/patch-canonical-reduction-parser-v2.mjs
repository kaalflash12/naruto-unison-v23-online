import fs from 'node:fs';

const file='tools/classify-canonical-upstream-v2.mjs';
let src=fs.readFileSync(file,'utf8');
const replaceOnce=(label,from,to)=>{
  const old=src.split(from).length-1,newCount=src.split(to).length-1;
  if(old===1){src=src.replace(from,to);return;}
  if(old===0&&newCount===1){console.log(`${label}=ALREADY_APPLIED`);return;}
  throw new Error(`${label}: old=${old} new=${newCount}`);
};

replaceOnce('DAMAGE_REDUCTION_NOT_DIRECT_DAMAGE',
`    ['damage', /\\bdamage\\b|\\bdamages\\b|\\bpierce\\b/i],`,
`    ['damage', /\\bdamage\\b(?!\\s+reduction)|\\bdamages\\b|\\bpierce\\b/i],`);

replaceOnce('REDUCE_FLAT_NUMERIC',
`    reduce: values(block, /\\bReduce[^\\]]*?Flat\\s+(\\d+)/g),`,
`    reduce: values(block, /\\bReduce\\s+\\[[^\\]]*\\]\\s+Flat\\s+(-?\\d+)/g),`);

const anchor=`  const defenseMismatch=classifyTechnique({published:{description:'defesa',chakraCost:[],cooldown:0,mechanics:[{op:'shield',amount:20,turns:2,target:'self'}]},upstream:{categories:['defense'],damage:[],pierce:[],afflict:[],heal:[],defend:[30],reduce:[],executeThresholds:[],targets:['self'],cost:[],cooldown:0,durations:[2]}});\n  if(!defenseMismatch.classifications.includes('EFEITO_ERRADO')||!defenseMismatch.evidence.effectNumeric?.defense)throw new Error('SELFTEST_DEFENSE_NUMERIC');`;
const insert=`  const defenseMismatch=classifyTechnique({published:{description:'defesa',chakraCost:[],cooldown:0,mechanics:[{op:'shield',amount:20,turns:2,target:'self'}]},upstream:{categories:['defense'],damage:[],pierce:[],afflict:[],heal:[],defend:[30],reduce:[],executeThresholds:[],targets:['self'],cost:[],cooldown:0,durations:[2]}});\n  if(!defenseMismatch.classifications.includes('EFEITO_ERRADO')||!defenseMismatch.evidence.effectNumeric?.defense)throw new Error('SELFTEST_DEFENSE_NUMERIC');\n  const reductionFacts=upstreamFacts('Skill.desc = "Naruto gains damage reduction."\\nSkill.effects = [ To Self $ apply 4 skillName [Reduce [All] Flat 15] ]');\n  if(reductionFacts.categories.includes('damage')||!reductionFacts.categories.includes('reduction')||JSON.stringify(reductionFacts.reduce)!==JSON.stringify([15])||!reductionFacts.durations.includes(4))throw new Error('SELFTEST_REDUCTION_PARSER');`;
if(!src.includes('SELFTEST_REDUCTION_PARSER'))replaceOnce('REDUCTION_SELFTEST',anchor,insert);

fs.writeFileSync(file,src);
console.log('CANONICAL_REDUCTION_PARSER_PATCH=PASS');
