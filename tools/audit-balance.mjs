import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root=process.cwd();
const outDir=path.join(root,'audit','balance','current');
fs.mkdirSync(outDir,{recursive:true});

const context={window:{},console,setTimeout,clearTimeout};
context.window.window=context.window;
vm.createContext(context);
for(const file of ['roster.js','jutsu-variants.js']){
  const src=fs.readFileSync(path.join(root,file),'utf8');
  vm.runInContext(src,context,{filename:file,timeout:30000});
}
const roster=context.window.NARUTO_ROSTER;
if(!Array.isArray(roster)||!roster.length) throw new Error('window.NARUTO_ROSTER ausente ou vazio');

const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const safe=v=>v===undefined?null:v;
const pct=v=>{const x=num(v,0);return x>1?Math.min(1,x/100):Math.max(0,x)};
const median=a=>{const s=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!s.length)return 0;const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2};
const mad=a=>{const m=median(a);return median(a.map(x=>Math.abs(x-m)))||1};
const robustZ=(x,a)=>{const m=median(a),d=mad(a);return 0.6745*(x-m)/d};
const round=(x,n=3)=>Number(Number(x||0).toFixed(n));
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);

const statusWeights={
 stun:10,stunned:10,paralyze:10,paralyzed:10,paralisado:10,paralisia:10,
 silence:9,silenced:9,seal:9,sealed:9,selado:9,
 sleep:10,asleep:10,sono:10,
 poison:5,poisoned:5,veneno:5,bleed:5,bleeding:5,sangramento:5,burn:5,burning:5,queimadura:5,
 slow:4,slowed:4,lentidao:4,blind:6,blinded:6,cegueira:6,
 weaken:4,weakened:4,weak:4,fragil:4,defdown:5,atkdown:5,
 shield:5,barrier:5,barreira:5,guard:5,protecao:5,
 heal:4,regen:4,regeneration:4,regeneracao:4
};
function statusScore(skill){
  const statuses=arr(skill.status).filter(Boolean).map(String);
  const chance=skill.statusChance==null?(statuses.length?1:0):pct(skill.statusChance);
  const turns=Math.max(1,num(skill.statusTurns,1));
  return statuses.reduce((s,x)=>s+(statusWeights[norm(x)]??3),0)*chance*Math.min(turns,4);
}
function damage(skill){
  if(Number.isFinite(Number(skill.damage))) return Math.max(0,Number(skill.damage));
  const lo=Number(skill.damageMin),hi=Number(skill.damageMax);
  if(Number.isFinite(lo)||Number.isFinite(hi)){
    const a=Number.isFinite(lo)?lo:hi,b=Number.isFinite(hi)?hi:lo;
    return Math.max(0,(a+b)/2);
  }
  return 0;
}
function detectEffects(skill){
  const effects=new Set();
  for(const st of arr(skill.status).filter(Boolean)) effects.add('status:'+String(st));
  if(num(skill.healSelf)>0) effects.add('healSelf');
  if(num(skill.heal)>0) effects.add('heal');
  if(skill.bonusVsStatus) effects.add('bonusVsStatus:'+String(skill.bonusVsStatus));
  if(num(skill.bonusMultiplier)>0) effects.add('bonusMultiplier');
  if(skill.condition) effects.add('condition:'+String(skill.condition));
  if(skill.conditionTarget) effects.add('conditionTarget:'+String(skill.conditionTarget));
  for(const [k,v] of Object.entries(skill)){
    if(v==null||v===false||v===0||['slot','name','type','cost','cd','desc','icon','fx','sfx','damage','damageMin','damageMax','status','statusTurns','statusChance','bonusVsStatus','bonusMultiplier','condition','conditionTarget','healSelf','heal','hit'].includes(k)) continue;
    if(/shield|guard|protect|invul|dodge|evade|reflect|drain|steal|chakra|cleanse|dispel|buff|debuff|counter|taunt|mark|dot|hot|pierce|ignore|crit|cooldown|stun|silence|poison|bleed|burn|slow/i.test(k)) effects.add(k+':'+String(v));
  }
  return [...effects];
}
function descriptionFlags(skill){
  const d=norm(skill.desc);
  const warnings=[];
  const hasStatus=arr(skill.status).filter(Boolean).length>0;
  const statusWords=/(paralis|atordo|stun|silenc|selad|sono|dorm|venen|sangr|queim|lent|ceg|fraqu|reduz)/.test(d);
  if(statusWords&&!hasStatus) warnings.push('descricao_indica_status_sem_status_estruturado');
  if(hasStatus&&!statusWords) warnings.push('status_estruturado_nao_explicitado_na_descricao');
  const heal=num(skill.healSelf)+num(skill.heal);
  const healWords=/(cura|curar|recuper|regenera|restaura.*vida|hp|pv)/.test(d);
  if(heal>0&&!healWords) warnings.push('cura_estruturada_nao_explicitada_na_descricao');
  if(healWords&&heal<=0&&!/roub|dren/.test(d)) warnings.push('descricao_indica_cura_sem_valor_estruturado');
  const dmg=damage(skill);
  if(dmg<=0&&/(causa|inflige|dano|damage)/.test(d)) warnings.push('descricao_indica_dano_sem_dano_estruturado');
  if(dmg>0&&!/(dano|damage|causa|inflige|atinge|golpe|ataca)/.test(d)) warnings.push('dano_estruturado_pouco_explicito_na_descricao');
  if(!String(skill.desc??'').trim()) warnings.push('descricao_vazia');
  return warnings;
}

const characters=[];
const jutsus=[];
const links=[];
const duplicateSlots=[];
for(const c of roster){
  const cards=Array.isArray(c.skillCards)?c.skillCards:[];
  const seen=new Set();
  for(let i=0;i<cards.length;i++){
    const s=cards[i]||{};
    const slot=s.slot??i;
    if(seen.has(String(slot))) duplicateSlots.push({characterId:c.id,characterName:c.name,slot});
    seen.add(String(slot));
    const jid=`${c.id}:${slot}`;
    const rawDamage=damage(s),cost=Math.max(0,num(s.cost)),cd=Math.max(0,num(s.cd));
    const utility=statusScore(s);
    const healing=Math.max(0,num(s.healSelf)+num(s.heal));
    const efficiency=rawDamage/(Math.max(1,cost)*(cd+1));
    const power=rawDamage + utility + healing*0.8 + (s.bonusMultiplier?Math.max(0,num(s.bonusMultiplier)-1)*rawDamage*0.35:0);
    const row={
      jutsuId:jid,characterId:c.id,characterName:c.name,characterRole:c.role??null,element:c.element??null,
      slot,name:s.name??`Slot ${slot}`,type:s.type??null,cost,cd,description:s.desc??'',
      damage:round(rawDamage),damageMin:safe(s.damageMin),damageMax:safe(s.damageMax),hit:safe(s.hit),
      status:safe(s.status),statusChance:safe(s.statusChance),statusTurns:safe(s.statusTurns),
      healSelf:safe(s.healSelf),heal:safe(s.heal),bonusVsStatus:safe(s.bonusVsStatus),bonusMultiplier:safe(s.bonusMultiplier),
      condition:safe(s.condition),conditionTarget:safe(s.conditionTarget),effects:detectEffects(s),descriptionWarnings:descriptionFlags(s),
      metrics:{utilityScore:round(utility),healingScore:round(healing),damageEfficiency:round(efficiency),rawPowerIndex:round(power)},
      sourceKeys:Object.keys(s).sort()
    };
    jutsus.push(row);
    links.push({characterId:c.id,characterName:c.name,jutsuId:jid,slot,name:row.name});
  }
  characters.push({
    characterId:c.id,name:c.name??c.id,game:c.game??null,role:c.role??null,element:c.element??null,image:c.img??null,
    jutsuCount:cards.length,jutsuIds:cards.map((s,i)=>`${c.id}:${s?.slot??i}`)
  });
}

const damageValues=jutsus.filter(j=>j.damage>0).map(j=>j.damage);
const effValues=jutsus.filter(j=>j.damage>0).map(j=>j.metrics.damageEfficiency);
const powerValues=jutsus.map(j=>j.metrics.rawPowerIndex);
for(const j of jutsus){
  j.metrics.damageRobustZ=round(robustZ(j.damage,damageValues));
  j.metrics.efficiencyRobustZ=round(robustZ(j.metrics.damageEfficiency,effValues));
  j.metrics.powerRobustZ=round(robustZ(j.metrics.rawPowerIndex,powerValues));
  j.balanceFlags=[];
  if(j.damage>0&&Math.abs(j.metrics.damageRobustZ)>=2.5) j.balanceFlags.push(j.metrics.damageRobustZ>0?'dano_outlier_alto':'dano_outlier_baixo');
  if(j.damage>0&&Math.abs(j.metrics.efficiencyRobustZ)>=2.5) j.balanceFlags.push(j.metrics.efficiencyRobustZ>0?'eficiencia_outlier_alta':'eficiencia_outlier_baixa');
  if(Math.abs(j.metrics.powerRobustZ)>=3) j.balanceFlags.push(j.metrics.powerRobustZ>0?'indice_poder_outlier_alto':'indice_poder_outlier_baixo');
  if(j.cost===0&&j.damage>0) j.balanceFlags.push('dano_com_custo_zero');
  if(j.cd===0&&j.metrics.utilityScore>=10) j.balanceFlags.push('controle_forte_sem_cooldown');
  if(j.descriptionWarnings.length) j.balanceFlags.push('descricao_mecanica_revisar');
}

const byChar=new Map();
for(const j of jutsus){if(!byChar.has(j.characterId))byChar.set(j.characterId,[]);byChar.get(j.characterId).push(j)}
const charMetrics=[];
for(const c of characters){
  const js=byChar.get(c.characterId)||[];
  const m={
    characterId:c.characterId,name:c.name,role:c.role,element:c.element,jutsuCount:js.length,
    avgDamage:round(js.reduce((s,j)=>s+j.damage,0)/Math.max(1,js.length)),
    maxDamage:round(Math.max(0,...js.map(j=>j.damage))),
    totalDamageBudget:round(js.reduce((s,j)=>s+j.damage,0)),
    avgCost:round(js.reduce((s,j)=>s+j.cost,0)/Math.max(1,js.length)),
    avgCooldown:round(js.reduce((s,j)=>s+j.cd,0)/Math.max(1,js.length)),
    utilityScore:round(js.reduce((s,j)=>s+j.metrics.utilityScore,0)),
    healingScore:round(js.reduce((s,j)=>s+j.metrics.healingScore,0)),
    rawPowerIndex:round(js.reduce((s,j)=>s+j.metrics.rawPowerIndex,0)),
    descriptionWarnings:js.reduce((s,j)=>s+j.descriptionWarnings.length,0),
    jutsuBalanceFlags:js.reduce((s,j)=>s+j.balanceFlags.length,0)
  };
  charMetrics.push(m);
}
const charPower=charMetrics.map(c=>c.rawPowerIndex);
for(const c of charMetrics){
  c.powerRobustZ=round(robustZ(c.rawPowerIndex,charPower));
  c.balanceFlags=[];
  if(Math.abs(c.powerRobustZ)>=2.5)c.balanceFlags.push(c.powerRobustZ>0?'personagem_power_outlier_alto':'personagem_power_outlier_baixo');
  if(c.jutsuCount!==4)c.balanceFlags.push('quantidade_jutsus_diferente_de_4');
  if(c.descriptionWarnings)c.balanceFlags.push('possui_descricao_mecanica_inconsistente');
}

const duplicateNames=[...Map.groupBy(jutsus,j=>norm(j.name))].filter(([,v])=>v.length>1).map(([name,v])=>({normalizedName:name,count:v.length,uses:v.map(x=>({jutsuId:x.jutsuId,character:x.characterName,name:x.name}))}));
const summary={
  generatedAt:new Date().toISOString(),sourceFiles:['roster.js','jutsu-variants.js'],characters:characters.length,jutsus:jutsus.length,links:links.length,
  roles:[...new Set(characters.map(x=>x.role).filter(Boolean))].sort(),elements:[...new Set(characters.map(x=>x.element).filter(Boolean))].sort(),
  duplicateSlots:duplicateSlots.length,duplicateJutsuNames:duplicateNames.length,
  descriptionWarnings:jutsus.reduce((s,j)=>s+j.descriptionWarnings.length,0),jutsuBalanceFlags:jutsus.reduce((s,j)=>s+j.balanceFlags.length,0),
  characterBalanceFlags:charMetrics.reduce((s,c)=>s+c.balanceFlags.length,0),
  methodology:{
    statusScore:'peso por tipo × chance × duração limitada a 4 turnos',
    damageEfficiency:'dano médio / (max(1,custo) × (cooldown+1))',
    rawPowerIndex:'dano + utilidade + 0.8×cura + bônus condicional estimado',
    outliers:'robust z-score baseado em mediana/MAD; triagem, não nerf/buff automático'
  }
};

const write=(name,data)=>fs.writeFileSync(path.join(outDir,name),JSON.stringify(data,null,2)+'\n');
write('SUMMARY.json',summary);write('CHARACTERS.json',characters);write('JUTSUS.json',jutsus);write('CHARACTER-JUTSU-MAP.json',links);write('CHARACTER-BALANCE.json',charMetrics);write('DUPLICATE-JUTSU-NAMES.json',duplicateNames);

const esc=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
const topJ=[...jutsus].sort((a,b)=>Math.abs(b.metrics.powerRobustZ)-Math.abs(a.metrics.powerRobustZ)).slice(0,40);
const topC=[...charMetrics].sort((a,b)=>Math.abs(b.powerRobustZ)-Math.abs(a.powerRobustZ)).slice(0,40);
let md=`# Auditoria de personagens, jutsus e balanceamento\n\nGerado em: ${summary.generatedAt}\n\n## Escopo e contagem\n\n- Personagens jogáveis encontrados: **${summary.characters}**\n- Jutsus ligados aos personagens: **${summary.jutsus}**\n- Ligações personagem↔jutsu: **${summary.links}**\n- Alertas descrição↔mecânica: **${summary.descriptionWarnings}**\n- Flags de balanceamento de jutsu: **${summary.jutsuBalanceFlags}**\n- Flags de personagem: **${summary.characterBalanceFlags}**\n- Slots duplicados dentro do mesmo personagem: **${summary.duplicateSlots}**\n\n## Critério\n\nO índice abaixo é **triagem**, não uma decisão automática de balanceamento. Ele compara dano, custo, cooldown, controle, cura e bônus condicionais. A decisão final precisa considerar o motor real, alvo, duração, ação/economia de chakra, sinergias e matriz de confrontos.\n\n## Personagens com maior desvio do elenco\n\n| Personagem | Papel | Jutsus | Dano médio | Custo médio | CD médio | Utilidade | Cura | Índice | z robusto | Alertas |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|\n`;
for(const c of topC)md+=`| ${esc(c.name)} | ${esc(c.role)} | ${c.jutsuCount} | ${c.avgDamage} | ${c.avgCost} | ${c.avgCooldown} | ${c.utilityScore} | ${c.healingScore} | ${c.rawPowerIndex} | ${c.powerRobustZ} | ${esc(c.balanceFlags.join(', '))} |\n`;
md+=`\n## Jutsus com maior desvio\n\n| Personagem | Jutsu | Custo | CD | Dano | Utilidade | Cura | Eficiência | z poder | Alertas |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---|\n`;
for(const j of topJ)md+=`| ${esc(j.characterName)} | ${esc(j.name)} | ${j.cost} | ${j.cd} | ${j.damage} | ${j.metrics.utilityScore} | ${j.metrics.healingScore} | ${j.metrics.damageEfficiency} | ${j.metrics.powerRobustZ} | ${esc([...j.balanceFlags,...j.descriptionWarnings].join(', '))} |\n`;
md+=`\n## Arquivos detalhados\n\n- \`CHARACTERS.json\`: levantamento de cada personagem.\n- \`JUTSUS.json\`: levantamento de cada jutsu, descrição, dano, efeitos, custo, cooldown e flags.\n- \`CHARACTER-JUTSU-MAP.json\`: linkagem completa personagem↔jutsu.\n- \`CHARACTER-BALANCE.json\`: comparação de kits por personagem.\n- \`DUPLICATE-JUTSU-NAMES.json\`: nomes repetidos para revisão de identidade/versão.\n- \`SUMMARY.json\`: contagens e metodologia.\n\n## O que ainda exige simulação antes de alterar números\n\n1. Confirmar no motor como \`hit\`, bônus, defesa, alvo, duração e efeitos por turno entram no dano efetivo.\n2. Executar confrontos repetidos personagem×personagem com sementes reproduzíveis.\n3. Separar força do kit de força da política de IA/jogador.\n4. Medir taxa de vitória, duração, chakra restante, dano e controle por matchup.\n5. Ajustar em pequenos lotes e repetir a matriz após cada alteração.\n`;
fs.writeFileSync(path.join(outDir,'BALANCE-REPORT.md'),md);

console.log(JSON.stringify(summary,null,2));
if(summary.characters<1||summary.jutsus<1||summary.links!==summary.jutsus||summary.duplicateSlots>0) process.exitCode=2;
