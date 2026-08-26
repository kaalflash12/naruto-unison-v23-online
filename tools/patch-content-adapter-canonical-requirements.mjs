import fs from 'node:fs';

const adapterFile='combat-content-adapter-v2.js';
const testFile='tools/test-content-mechanics-v2.cjs';
let adapter=fs.readFileSync(adapterFile,'utf8');
let tests=fs.readFileSync(testFile,'utf8');

function replaceOnce(label,src,from,to){
  const oldCount=src.split(from).length-1;
  const newCount=src.split(to).length-1;
  if(oldCount===1)return src.replace(from,to);
  if(oldCount===0&&newCount===1){console.log(`${label}=ALREADY_APPLIED`);return src;}
  throw new Error(`${label}: old=${oldCount} new=${newCount}`);
}

adapter=replaceOnce('FLAT_CONDITIONAL_BONUS',adapter,
`      const req=statusRequirement(m.bonusIf),mult=Math.max(1,num(m.bonusMultiplier,1));
      if(req&&mult>1){const bonus=Math.max(0,Math.round(amount*(mult-1)));if(bonus)effects.push({type:'damage',target,amount:bonus,damageClass:'normal',variance:0,bypassDefense:Boolean(m.ignoreShield),requirements:req,conditionalBonus:true})}`,
`      const req=statusRequirement(m.bonusIf),mult=Math.max(1,num(m.bonusMultiplier,1)),fixed=m.bonusAmount==null?null:Math.max(0,num(m.bonusAmount));
      const bonus=fixed==null?Math.max(0,Math.round(amount*(mult-1))):fixed;
      if(req&&bonus>0)effects.push({type:'damage',target,amount:bonus,damageClass:'normal',variance:0,bypassDefense:Boolean(m.ignoreShield),requirements:req,conditionalBonus:true})`);

adapter=replaceOnce('TECHNIQUE_REQUIREMENT',adapter,
`    mechanic:{version:2,target:primaryTarget,effects,classes:arr(technique.classes||technique.tags||['all']),source:'content_entities.technique',contentOps:mechanics.map(x=>String(x?.op||''))}`,
`    mechanic:{version:2,target:primaryTarget,effects,classes:arr(technique.classes||technique.tags||['all']),requirements:statusRequirement(technique.requires),source:'content_entities.technique',contentOps:mechanics.map(x=>String(x?.op||''))}`);

const conditionalAnchor=`assert.deepEqual(conditional.mechanic.effects[1].requirements,{type:'statusPresent',target:'target',status:'wind-cut'});`;
const conditionalInsert=`assert.deepEqual(conditional.mechanic.effects[1].requirements,{type:'statusPresent',target:'target',status:'wind-cut'});
const fixedConditional=adapter.adaptTechnique({id:'fixed-conditional',chakraCost:[],mechanics:[{op:'damage',amount:20,target:'primary',bonusIf:{selfHas:'shadow-clones'},bonusAmount:10}]});
assert.equal(fixedConditional.mechanic.effects.length,2);
assert.equal(fixedConditional.mechanic.effects[1].amount,10,'bonusAmount deve preservar bônus fixo canônico');
assert.deepEqual(fixedConditional.mechanic.effects[1].requirements,{type:'statusPresent',status:'shadow-clones'});`;
if(!tests.includes("fixed-conditional"))tests=replaceOnce('FIXED_BONUS_TEST',tests,conditionalAnchor,conditionalInsert);

const helperAnchor=`function tech(id,mechanics,extra={}){return adapter.adaptTechnique({id,chakraCost:[],cooldown:0,mechanics,...extra})}`;
const helperInsert=`function tech(id,mechanics,extra={}){return adapter.adaptTechnique({id,chakraCost:[],cooldown:0,mechanics,...extra})}

{
  const s=state();
  const required=adapter.adaptTechnique({id:'required-shadow-clones',chakraCost:[],requires:{selfHas:'shadow-clones'},mechanics:[{op:'damage',amount:20,target:'primary'}]});
  assert.deepEqual(required.mechanic.requirements,{type:'statusPresent',status:'shadow-clones'});
  assert.equal(rules.canUseSkill(s,'a',required,'b').ok,false,'requisito canônico deve bloquear uso sem setup');
  rules.applyEffect(s,rules.getFighter(s,'a'),rules.getFighter(s,'a'),{type:'status',status:'shadow-clones',duration:4,durationUnit:'ownerPhases',positive:true});
  assert.equal(rules.canUseSkill(s,'a',required,'b').ok,true,'requisito canônico deve liberar uso após setup');
}`;
if(!tests.includes("required-shadow-clones"))tests=replaceOnce('REQUIREMENT_TEST',tests,helperAnchor,helperInsert);

tests=tests.replace('runtimeCases:19','runtimeCases:20');
fs.writeFileSync(adapterFile,adapter);
fs.writeFileSync(testFile,tests);
console.log('CONTENT_ADAPTER_CANONICAL_REQUIREMENTS_PATCH=PASS');
