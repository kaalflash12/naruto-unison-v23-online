import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const INPUT=path.join(ROOT,'audit','balance','published-v2','CANONICAL-ROSTER-209x4.json');
const OUT=path.join(ROOT,'audit','balance','semantic-v2');
fs.mkdirSync(OUT,{recursive:true});
if(!fs.existsSync(INPUT))throw new Error('CANONICAL_ROSTER_INPUT_MISSING');

const roster=JSON.parse(fs.readFileSync(INPUT,'utf8'));
if(!Array.isArray(roster)||roster.length!==209)throw new Error(`CANONICAL_ROSTER_COUNT:${roster?.length}`);
const round=(x,n=3)=>Number(Number(x||0).toFixed(n));
const inc=(o,k,n=1)=>{o[k]=Number(o[k]||0)+n};
const effectTypes={},statusTypes={},zeroValued=[];

function statusValue(e,d,a){
  const s=String(e.status||'status').toLowerCase();
  if(s==='vulnerable')return Math.max(14,a)*d*.70;
  if(s==='evasion')return Math.max(16,a)*d*.75;
  if(s==='counter')return Math.max(16,a)*d*.80;
  if(s==='regen')return Math.max(8,a)*d*.90;
  if(['stun','bind','freeze','chakra-lock','silence','blind'].includes(s))return 20*d;
  if(['poison','burn','bleed','shock','wind-cut','parasite'].includes(s))return Math.max(7,a)*d*.70;
  if(s==='soaked')return 10*d;
  if(s==='invuln')return 24*d;
  if(s.startsWith('form:'))return 18*d;
  if(e.mark===true||s.includes('mark'))return 14*d;
  return Math.max(6,a)*d*.50;
}
function effectValue(e){
  const t=String(e.type||'noop'),raw=Number(e.amount??e.value??0),a=Math.abs(Number.isFinite(raw)?raw:0),d=e.duration==='permanent'?5:Math.max(1,Number(e.duration||1));
  if(t==='damage')return a;
  if(t==='dot')return a*d*.80;
  if(t==='heal')return a*.90;
  if(t==='leech')return a*1.40;
  if(t==='defense')return a*.75;
  if(t==='invulnerable')return 24*d;
  if(['stun','disable','silence','seal'].includes(t))return 22*d;
  if(t==='reduction')return Math.max(8,a)*d*.70;
  if(t==='expose')return Math.max(12,a)*d*.65;
  if(['weaken','strengthen'].includes(t))return Math.max(8,a)*d*.55;
  if(t==='cleanse')return 18*Math.max(1,Number(e.count||1));
  if(t==='dispel')return 20*Math.max(1,Number(e.count||1));
  if(t==='chakra')return Math.max(10,a*12);
  if(t==='cooldown')return Math.max(12,a*14);
  if(t==='status')return statusValue(e,d,a);
  return 0;
}
function targetMultiplier(target){
  const t=String(target||'enemy');
  if(t==='enemies'||t==='allies')return 3;
  if(t==='everyone')return 6;
  return 1;
}

const characters=[];
let skillCount=0,effectCount=0,totalValue=0;
for(const c of roster){
  if(!Array.isArray(c.skills)||c.skills.length!==4)throw new Error(`SKILL_COUNT:${c.slug}:${c.skills?.length}`);
  const skillValues=[];
  for(const skill of c.skills){
    skillCount++;
    const effects=skill?.mechanic?.effects||[];
    if(!effects.length)throw new Error(`NO_EFFECTS:${c.slug}:${skill.id||skill.name}`);
    let value=0;
    for(const e of effects){
      effectCount++;inc(effectTypes,String(e.type||'noop'));
      if(e.type==='status')inc(statusTypes,String(e.status||'status'));
      const v=effectValue(e)*targetMultiplier(e.target||skill?.mechanic?.target);
      if(v<=0)zeroValued.push({character:c.slug,skill:skill.id||skill.name,type:e.type,status:e.status||null,e});
      value+=v;
    }
    const cost=(skill.cost||[]).length,cooldown=Math.max(0,Number(skill.cooldown||0));
    const adjusted=Math.max(0,value-cost*2.7-cooldown*1.7);
    totalValue+=adjusted;
    skillValues.push({id:skill.id||skill.name,name:skill.name,value:round(value),adjustedValue:round(adjusted),cost,cooldown});
  }
  characters.push({slug:c.slug,name:c.name,totalAdjustedValue:round(skillValues.reduce((n,x)=>n+x.adjustedValue,0)),skills:skillValues});
}
const summary={generatedAt:new Date().toISOString(),characters:roster.length,skills:skillCount,effects:effectCount,effectTypes,statusTypes,zeroValuedEffects:zeroValued.length,avgAdjustedSkillValue:round(totalValue/Math.max(1,skillCount)),gate:roster.length===209&&skillCount===836&&zeroValued.length===0?'PASS':'FAIL'};
fs.writeFileSync(path.join(OUT,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(OUT,'CHARACTER-SEMANTIC-VALUES.json'),JSON.stringify(characters.sort((a,b)=>b.totalAdjustedValue-a.totalAdjustedValue),null,2)+'\n');
if(zeroValued.length)fs.writeFileSync(path.join(OUT,'ZERO-VALUED-EFFECTS.json'),JSON.stringify(zeroValued,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(summary.gate!=='PASS')process.exitCode=2;
