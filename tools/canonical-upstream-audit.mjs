import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const argv=process.argv.slice(2);
const arg=(name,def)=>{const i=argv.indexOf(`--${name}`);return i>=0&&argv[i+1]?argv[i+1]:def};
const gameRoot=path.resolve(arg('root',process.cwd()));
const upstreamRoot=path.resolve(arg('upstream',path.join(gameRoot,'canonical-upstream')));
const outDir=path.join(gameRoot,'audit','balance','current');
fs.mkdirSync(outDir,{recursive:true});

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const compact=s=>String(s??'').replace(/\s+/g,' ').trim();
const escRe=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const uniq=a=>[...new Set(a)];
const arr=v=>Array.isArray(v)?v:[];
const round=(x,n=4)=>Number(Number(x||0).toFixed(n));

function walk(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())out.push(...walk(p));
    else if(ent.isFile()&&p.endsWith('.hs'))out.push(p);
  }
  return out;
}

const context={window:{},console,setTimeout,clearTimeout};context.window.window=context.window;vm.createContext(context);
for(const file of ['roster.js','jutsu-variants.js']){
  vm.runInContext(fs.readFileSync(path.join(gameRoot,file),'utf8'),context,{filename:file,timeout:30000});
}
const roster=context.window.NARUTO_ROSTER;
if(!Array.isArray(roster)||roster.length===0)throw new Error('NARUTO_ROSTER ausente');

const sourceDir=path.join(upstreamRoot,'src','Game','Characters');
if(!fs.existsSync(sourceDir))throw new Error(`Upstream ausente: ${sourceDir}`);
const files=walk(sourceDir);

function familyForFile(p){
  const x=p.replaceAll('\\','/');
  if(x.includes('/Reanimated/'))return 'Reanimated';
  if(x.includes('/Shippuden/'))return 'Shippuden';
  if(x.includes('/Original/'))return 'Original';
  if(x.includes('/Boruto/'))return 'Boruto';
  return 'Other';
}
function familyPreference(slug){
  const s=String(slug||'');
  if(/-\(r\)$/.test(s))return ['Reanimated','Shippuden','Original','Other'];
  if(/-\(s\)$/.test(s))return ['Shippuden','Original','Reanimated','Other'];
  return ['Original','Shippuden','Reanimated','Boruto','Other'];
}

const canonicalCharacters=[];
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  const re=/\bCharacter\s*\r?\n\s*"([^"]+)"[\s\S]*?(?=\r?\n\s*,\s*Character\b|\r?\n\s*\]\s*$)/g;
  let m;
  while((m=re.exec(text))){
    canonicalCharacters.push({
      name:m[1],normalizedName:norm(m[1]),family:familyForFile(file),
      file:path.relative(upstreamRoot,file).replaceAll('\\','/'),block:m[0]
    });
  }
}
if(canonicalCharacters.length<50)throw new Error(`Parser de personagens falhou: ${canonicalCharacters.length}`);

function chooseCharacter(current){
  const candidates=canonicalCharacters.filter(x=>x.normalizedName===norm(current.name));
  if(!candidates.length)return null;
  const pref=familyPreference(current.slug??current.id);
  return [...candidates].sort((a,b)=>pref.indexOf(a.family)-pref.indexOf(b.family))[0];
}

function skillRecord(block,name){
  const exact=new RegExp(`Skill\\.name\\s*=\\s*"${escRe(name)}"`,'i');
  const m=exact.exec(block);
  if(m){
    let start=block.lastIndexOf('{ Skill.name',m.index);
    if(start<0)start=Math.max(0,m.index-80);
    const tail=block.slice(start);
    const endMatch=/\r?\n\s{8}\}\s*(?:\r?\n|$)/.exec(tail);
    const end=endMatch?endMatch.index+endMatch[0].length:Math.min(tail.length,5000);
    return tail.slice(0,end);
  }
  const inv=new RegExp(`invuln\\s+"${escRe(name)}"`,'i').exec(block);
  if(inv){
    const lineStart=block.lastIndexOf('\n',inv.index)+1;
    let lineEnd=block.indexOf('\n',inv.index);if(lineEnd<0)lineEnd=block.length;
    return block.slice(lineStart,lineEnd);
  }
  return null;
}

function parseList(text,field){
  const m=new RegExp(`Skill\\.${field}\\s*=\\s*\\[([^\\]]*)\\]`,'i').exec(text);
  return m?m[1].split(',').map(x=>x.trim()).filter(Boolean):null;
}
function parseIntField(text,field){
  const m=new RegExp(`Skill\\.${field}\\s*=\\s*(-?\\d+)`,'i').exec(text);
  return m?Number(m[1]):null;
}
function parseDesc(text){return (/Skill\.desc\s*=\s*"([^"]*)"/i.exec(text)||[])[1]??null}
function detectTargets(text){
  const all=[];
  for(const m of text.matchAll(/\bTo\s+(X?Allies|X?Enemies|REnemy|RXEnemy|X?Ally|Enemy|Self|Everyone|Done|Expire)\b/g))all.push(m[1]);
  return uniq(all);
}
function targetClass(targets){
  if(targets.some(x=>/Enemy/.test(x)))return targets.some(x=>/Allies|Ally/.test(x))?'mixed':'enemy';
  if(targets.some(x=>/Allies|Ally/.test(x)))return 'ally';
  if(targets.includes('Self'))return 'self';
  if(targets.includes('Everyone'))return 'everyone';
  return 'unknown';
}
function extractNumbers(text,rx){return [...text.matchAll(rx)].map(m=>Number(m[1])).filter(Number.isFinite)}
function primitives(text){
  return {
    damage:extractNumbers(text,/\bdamage\s+(-?\d+)/g),
    pierce:extractNumbers(text,/\bpierce\s+(-?\d+)/g),
    afflict:extractNumbers(text,/\bafflict\s+(-?\d+)/g),
    heal:extractNumbers(text,/\bheal\s+(-?\d+)/g),
    defend:extractNumbers(text,/\bdefend(?:'|With)?(?:\s+\w+)?\s+(-?\d+)/g),
    stunDur:extractNumbers(text,/\bapply(?:With\s*\[[^\]]*\])?\s+(-?\d+)[\s\S]{0,180}?\bStun\b/g),
    invulnDur:extractNumbers(text,/\bapply(?:With\s*\[[^\]]*\])?\s+(-?\d+)[\s\S]{0,180}?\bInvulnerable\b/g),
    deplete:extractNumbers(text,/\bdeplete\s+(-?\d+)/g),
    absorb:extractNumbers(text,/\babsorb\s+(-?\d+)/g)
  };
}
const advancedTokens=[
  ['silence',/\bSilence\b/],['expose',/\bExpose\b/],['exhaust',/\bExhaust\b/],['focus',/\bFocus\b/],
  ['reduce',/\bReduce\b/],['alternate',/\bAlternate\b/],['trap',/\btrap(?:From|Per|With)?\b/],
  ['stack',/\b(?:addStack|addStacks|applyStacks|removeStack|amount)\b/],['leech',/\bleech\b/],
  ['deplete',/\bdeplete\b/],['absorb',/\babsorb\b/],['taunt',/\bTaunt\b/],['alone',/\bAlone\b/],
  ['counter',/\bCounter/],['reflect',/\bReflect\b/],['redirect',/\bRedirect\b/],['cure',/\bcure(?:All|Bane|Stun)?\b/],
  ['weaken',/\bWeaken\b/],['strengthen',/\bStrengthen\b/],['throttle',/\bThrottle\b/],['snare',/\bSnare\b/],
  ['endure',/\bEndure\b/],['enrage',/\bEnrage\b/],['execute',/\bexecuteAt\b/],['demolish',/\bdemolish(?:All)?\b/],
  ['purge',/\bpurge\b/],['interrupt',/\binterrupt\b/],['charges',/Skill\.charges|\brecharge\b/],['bomb',/\bbomb(?:With)?\b/],
  ['dynamic_change',/Skill\.changes|changeWith|changePer/],['requirement',/Skill\.require/],['channel',/Skill\.dur\s*=\s*(?:Action|Control|Ongoing|Passive)/]
];
function canonicalKind(raw,p){
  const hasDmg=p.damage.length||p.pierce.length;
  const hasAff=p.afflict.length;
  const hasHeal=p.heal.length||/\bleech\b/.test(raw);
  const hasDef=p.defend.length;
  const hasStun=/\bStun\b/.test(raw);
  const hasInv=/\bInvulnerable\b/.test(raw)||/^\s*[\[(]?invuln\b/.test(raw.trim());
  const kinds=[];
  if(hasDmg)kinds.push('damage');if(hasAff)kinds.push('dot_or_affliction');if(hasHeal)kinds.push('heal_or_leech');if(hasDef)kinds.push('shield');if(hasStun)kinds.push('stun');if(hasInv)kinds.push('invuln');
  if(kinds.length===0)return 'utility';
  if(kinds.length===1)return kinds[0];
  return `compound:${kinds.join('+')}`;
}
function currentKindCompatible(current,canonical){
  const c=String(current||'unknown');
  if(canonical.startsWith('compound:'))return canonical.includes(c)||canonical.includes(c==='dot'?'dot_or_affliction':c);
  if(c==='dot'&&canonical==='dot_or_affliction')return true;
  if(c==='heal'&&canonical==='heal_or_leech')return true;
  if(c==='damage'&&canonical==='damage')return true;
  return c===canonical;
}
function expectedTargetForCurrent(canonTarget){
  if(canonTarget==='enemy')return 'enemy';if(canonTarget==='ally')return 'ally';if(canonTarget==='self')return 'self';return null;
}
function costNorm(x){return String(x).replace(/\s+/g,'').toLowerCase()}

const characterRows=[];
const skillRows=[];
let totalSkills=0;
for(const c of roster){
  const cc=chooseCharacter(c);
  const charRow={characterId:String(c.slug??c.id??c.name),characterName:c.name,preferredFamilies:familyPreference(c.slug??c.id),canonicalFound:Boolean(cc),canonicalFamily:cc?.family??null,canonicalFile:cc?.file??null,skills:[]};
  const skills=arr(c.skills);totalSkills+=skills.length;
  for(let i=0;i<skills.length;i++){
    const s=skills[i]||{};const originalName=String(s.originalName??s.name??'');
    const raw=cc?skillRecord(cc.block,originalName):null;
    const flags=[];
    let parsed=null;
    if(!cc)flags.push('CHARACTER_NOT_FOUND');
    else if(!raw)flags.push('JUTSU_NOT_FOUND');
    else{
      const p=primitives(raw),targets=detectTargets(raw),canonTarget=targetClass(targets),cost=parseList(raw,'cost'),cooldown=parseIntField(raw,'cooldown');
      const adv=advancedTokens.filter(([,rx])=>rx.test(raw)).map(([name])=>name);
      const canonKind=canonicalKind(raw,p);
      const curM=s.mechanic||{};
      const curCost=arr(s.cost).map(String);
      if(cost&&JSON.stringify(cost.map(costNorm))!==JSON.stringify(curCost.map(costNorm)))flags.push('COST_MISMATCH');
      if(cooldown!==null&&Number(s.cooldown??0)!==cooldown)flags.push('COOLDOWN_MISMATCH');
      const expTarget=expectedTargetForCurrent(canonTarget);
      if(expTarget&&String(curM.target??'unknown')!==expTarget)flags.push('TARGET_MISMATCH');
      if(!currentKindCompatible(curM.kind,canonKind))flags.push('KIND_MISMATCH');
      if(canonKind.startsWith('compound:'))flags.push('COMPOUND_MECHANIC');
      if(adv.length)flags.push('ADVANCED_MECHANIC');
      if(adv.includes('dynamic_change')||adv.includes('requirement')||adv.includes('channel')||adv.includes('trap')||adv.includes('stack'))flags.push('DYNAMIC_MECHANIC');
      parsed={description:parseDesc(raw),cost,cooldown,targets,canonicalTarget:canonTarget,canonicalKind:canonKind,primitives:p,advancedMechanics:adv,raw:compact(raw).slice(0,3500)};
    }
    const severity=flags.includes('CHARACTER_NOT_FOUND')||flags.includes('JUTSU_NOT_FOUND')?'UNRESOLVED':flags.includes('TARGET_MISMATCH')||flags.includes('KIND_MISMATCH')?'CRITICAL':flags.includes('COMPOUND_MECHANIC')||flags.includes('DYNAMIC_MECHANIC')?'HIGH':flags.length?'MEDIUM':'OK';
    const row={characterId:charRow.characterId,characterName:c.name,slot:i+1,currentName:s.name??null,originalName,current:{description:s.desc??'',effectText:s.effectText??'',cost:arr(s.cost),cooldown:Number(s.cooldown??0),mechanic:s.mechanic??null},canonical:parsed,flags:uniq(flags),severity};
    skillRows.push(row);charRow.skills.push({slot:i+1,originalName,flags:row.flags,severity});
  }
  characterRows.push(charRow);
}

const severityCounts={};const flagCounts={};
for(const r of skillRows){severityCounts[r.severity]=(severityCounts[r.severity]||0)+1;for(const f of r.flags)flagCounts[f]=(flagCounts[f]||0)+1}
const matchedCharacters=characterRows.filter(x=>x.canonicalFound).length;
const matchedJutsus=skillRows.filter(x=>x.canonical).length;
const engineNeeds={};
for(const r of skillRows){for(const a of r.canonical?.advancedMechanics||[])engineNeeds[a]=(engineNeeds[a]||0)+1}
const summary={
  generatedAt:new Date().toISOString(),upstreamCommit:'3f81bcd0de1795c17ce1f8e8d9f9fa51b38af0e1',
  rosterCharacters:roster.length,rosterJutsus:totalSkills,canonicalCharactersParsed:canonicalCharacters.length,sourceFiles:files.length,
  matchedCharacters,unmatchedCharacters:roster.length-matchedCharacters,matchedJutsus,unmatchedJutsus:totalSkills-matchedJutsus,
  severityCounts,flagCounts,engineFeatureCounts:Object.fromEntries(Object.entries(engineNeeds).sort((a,b)=>b[1]-a[1])),
  parserPolicy:'heuristic structural audit: exact character/skill names + family preference; flags require human/runtime review before mutation'
};

fs.writeFileSync(path.join(outDir,'CANONICAL-UPSTREAM-SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'CANONICAL-UPSTREAM-JUTSUS.json'),JSON.stringify(skillRows,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'CANONICAL-UPSTREAM-CHARACTERS.json'),JSON.stringify(characterRows,null,2)+'\n');

const topFlags=Object.entries(flagCounts).sort((a,b)=>b[1]-a[1);
const topNeeds=Object.entries(engineNeeds).sort((a,b)=>b[1]-a[1]);
const critical=skillRows.filter(x=>x.severity==='CRITICAL').slice(0,100);
const unresolved=skillRows.filter(x=>x.severity==='UNRESOLVED').slice(0,100);
const e=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
let md=`# Auditoria canônica automatizada — roster inteiro\n\nGerado em: ${summary.generatedAt}\n\nUpstream fixado: \`${summary.upstreamCommit}\`.\n\n## Cobertura\n\n- Personagens atuais: **${summary.rosterCharacters}**\n- Jutsus atuais: **${summary.rosterJutsus}**\n- Personagens canônicos parseados: **${summary.canonicalCharactersParsed}** em **${summary.sourceFiles}** arquivos Haskell.\n- Personagens vinculados ao upstream: **${matchedCharacters}/${summary.rosterCharacters}**.\n- Jutsus vinculados: **${matchedJutsus}/${summary.rosterJutsus}**.\n\n## Severidade\n\n${Object.entries(severityCounts).sort().map(([k,v])=>`- ${k}: **${v}**`).join('\n')}\n\n## Flags\n\n${topFlags.map(([k,v])=>`- ${k}: **${v}**`).join('\n')}\n\n## Recursos avançados encontrados no upstream\n\n${topNeeds.map(([k,v])=>`- ${k}: **${v}** jutsus vinculados`).join('\n')}\n\n## Primeiros casos críticos\n\n| Personagem | Jutsu | Atual | Canônico | Flags |\n|---|---|---|---|---|\n`;
for(const r of critical)md+=`| ${e(r.characterName)} | ${e(r.originalName)} | ${e(`${r.current.mechanic?.kind??'—'} / ${r.current.mechanic?.target??'—'}`)} | ${e(`${r.canonical?.canonicalKind??'—'} / ${r.canonical?.canonicalTarget??'—'}`)} | ${e(r.flags.join(', '))} |\n`;
md+=`\n## Não resolvidos pelo parser\n\n| Personagem | Jutsu | Flags |\n|---|---|---|\n`;
for(const r of unresolved)md+=`| ${e(r.characterName)} | ${e(r.originalName)} | ${e(r.flags.join(', '))} |\n`;
md+=`\n## Interpretação correta\n\nEste relatório é uma triagem estrutural, não um patch automático. Um \`KIND_MISMATCH\` ou \`TARGET_MISMATCH\` é prioridade de revisão. \`ADVANCED_MECHANIC\`/\`DYNAMIC_MECHANIC\` significa que o upstream possui lógica que não cabe necessariamente nos seis tipos simples atuais. Antes de alterar um personagem, conferir o bloco canônico, o simulador, o runtime local e o backend autoritativo.\n`;
fs.writeFileSync(path.join(outDir,'CANONICAL-UPSTREAM-REPORT.md'),md);

console.log(JSON.stringify(summary,null,2));
if(roster.length!==209||totalSkills!==836)process.exitCode=2;
if(canonicalCharacters.length<150)process.exitCode=3;
