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
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const round=(x,n=3)=>Number(Number(x||0).toFixed(n));
const median=a=>{const s=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!s.length)return 0;const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2};
const mad=a=>{const m=median(a);return median(a.map(x=>Math.abs(x-m)))||1};
const robustZ=(x,a)=>{const m=median(a),d=mad(a);return 0.6745*(x-m)/d};
const groupBy=(items,keyFn)=>{const m=new Map();for(const item of items){const k=keyFn(item);if(!m.has(k))m.set(k,[]);m.get(k).push(item)}return m};

const DAMAGE_KINDS=new Set(['damage','stun','afflict','pierce','drain','bleed','burn','poison']);
const HEAL_KINDS=new Set(['heal','regen','regenerate','healing']);
const DEFENSE_KINDS=new Set(['shield','defend','reduce','invuln','invulnerable','guard','barrier']);
const CONTROL_WEIGHTS={
  stun:12,silence:11,seal:10,snare:7,slow:6,weaken:6,expose:8,taunt:7,
  disable:11,blind:7,paralyze:12,paralysis:12,poison:5,bleed:5,burn:5,afflict:5,
  drain:6,reflect:9,counter:9,invuln:0,shield:0,heal:0,damage:0,pierce:2
};

function skillShape(c){
  if(Array.isArray(c.skills)) return {field:'skills',skills:c.skills};
  if(Array.isArray(c.skillCards)) return {field:'skillCards',skills:c.skillCards};
  return {field:null,skills:[]};
}
function mechanicOf(s){return s&&typeof s.mechanic==='object'&&s.mechanic?s.mechanic:{}};
function kindOf(s){return norm(mechanicOf(s).kind||s.type||'unknown').replace(/\s+/g,'-')||'unknown'}
function durationOf(s){return Math.max(0,num(mechanicOf(s).duration,s.statusTurns??0))}
function costParts(s){return arr(s.cost).filter(x=>String(x).trim()!=='').map(String)}
function costUnits(s){const c=costParts(s);return c.length||Math.max(0,num(s.cost,0))}
function cooldownOf(s){return Math.max(0,num(s.cooldown,s.cd??0))}
function rawPower(s){return Math.max(0,num(mechanicOf(s).power,s.damage??0))}
function damageOf(s){
  const k=kindOf(s),p=rawPower(s);
  if(DAMAGE_KINDS.has(k)) return p;
  if(Number.isFinite(Number(s.damage))) return Math.max(0,Number(s.damage));
  if(Number.isFinite(Number(s.damageMin))||Number.isFinite(Number(s.damageMax))){
    const lo=Number.isFinite(Number(s.damageMin))?Number(s.damageMin):Number(s.damageMax);
    const hi=Number.isFinite(Number(s.damageMax))?Number(s.damageMax):Number(s.damageMin);
    return Math.max(0,(lo+hi)/2);
  }
  return 0;
}
function healingOf(s){const k=kindOf(s);return HEAL_KINDS.has(k)?rawPower(s):Math.max(0,num(s.healSelf)+num(s.heal))}
function defenseOf(s){const k=kindOf(s);if(k==='invuln'||k==='invulnerable') return 25*Math.max(1,durationOf(s));return DEFENSE_KINDS.has(k)?rawPower(s)*Math.max(1,Math.min(4,durationOf(s)||1)):0}
function controlOf(s){
  const k=kindOf(s),dur=Math.max(1,Math.min(4,durationOf(s)||1));
  let score=(CONTROL_WEIGHTS[k]??0)*dur;
  const text=norm(`${s.desc??''} ${s.effectText??''}`);
  if(k==='damage'&&/atord|stun/.test(text))score=Math.max(score,12*dur);
  if(/silenc/.test(text))score=Math.max(score,11*dur);
  if(/invulner|invulneravel/.test(text)&&!DEFENSE_KINDS.has(k))score+=8*dur;
  return score;
}
function aoeFactor(s){return mechanicOf(s).aoe===true?1.75:1}
function targetOf(s){return String(mechanicOf(s).target??'unknown')}
function effectsOf(s){
  const m=mechanicOf(s),out=[];
  out.push(`kind:${kindOf(s)}`);
  if(m.target!=null)out.push(`target:${m.target}`);
  if(m.aoe===true)out.push('aoe:true');
  if(num(m.duration)>0)out.push(`duration:${num(m.duration)}`);
  if(m.power!=null)out.push(`power:${m.power}`);
  for(const [k,v] of Object.entries(s)){
    if(['name','originalName','desc','effectText','cost','cooldown','image','mechanic'].includes(k)||v==null||v===false||v==='')continue;
    if(/status|chance|condition|bonus|heal|shield|guard|protect|invul|reflect|drain|steal|cleanse|dispel|buff|debuff|counter|taunt|mark|pierce|ignore|crit|hit/i.test(k))out.push(`${k}:${typeof v==='object'?JSON.stringify(v):String(v)}`);
  }
  return out;
}
function descriptionWarnings(s){
  const m=mechanicOf(s),k=kindOf(s),p=rawPower(s),dur=durationOf(s);
  const text=norm(`${s.desc??''} ${s.effectText??''}`);
  const w=[];
  if(!String(s.name??'').trim())w.push('nome_vazio');
  if(!String(s.desc??'').trim())w.push('descricao_vazia');
  if(!String(s.effectText??'').trim())w.push('effectText_vazio');
  if(!s.image)w.push('imagem_ausente');
  if(!m.kind)w.push('mechanic_kind_ausente');
  if(m.target==null)w.push('mechanic_target_ausente');
  if(DAMAGE_KINDS.has(k)&&p>0&&!/(dano|damage|causa|inflige|atinge)/.test(text))w.push('dano_mecanico_nao_explicito');
  if(HEAL_KINDS.has(k)&&p>0&&!/(cura|recuper|restaura|heal|pv|vida)/.test(text))w.push('cura_mecanica_nao_explicita');
  if((k==='shield'||k==='defend'||k==='reduce')&&p>0&&!/(defesa|reduz|proteg|escudo|shield|defense)/.test(text))w.push('defesa_mecanica_nao_explicita');
  if((k==='invuln'||k==='invulnerable')&&!/invulner|protege|dano e efeitos hostis/.test(text))w.push('invulnerabilidade_nao_explicita');
  if(k==='stun'&&!/(atord|stun)/.test(text))w.push('stun_nao_explicito');
  if(m.aoe===true&&!/(todos|todas|equipe|all |aoe|área|area)/.test(text))w.push('aoe_nao_explicito');
  if(p>1&&!text.includes(String(p)))w.push('valor_de_power_nao_aparece_no_texto');
  if(dur>1&&!text.includes(String(dur)))w.push('duracao_nao_aparece_no_texto');
  if(/causa\s+\d+\s+de\s+dano/.test(text)&&damageOf(s)<=0)w.push('texto_indica_dano_mas_kind_nao_ofensivo');
  return [...new Set(w)];
}

const characters=[];
const jutsus=[];
const links=[];
for(const c of roster){
  const id=String(c.slug??c.id??norm(c.name).replace(/[^a-z0-9]+/g,'-'));
  const shape=skillShape(c),skills=shape.skills;
  for(let i=0;i<skills.length;i++){
    const s=skills[i]||{},slot=i+1,jutsuId=`${id}:${slot}`;
    const damage=damageOf(s),heal=healingOf(s),defense=defenseOf(s),control=controlOf(s),cost=costUnits(s),cd=cooldownOf(s),aoe=aoeFactor(s);
    const offense=damage*aoe;
    const sustain=(heal*0.8+defense*0.45)*aoe;
    const utility=control*aoe;
    const denominator=Math.max(1,cost)*(cd+1);
    const rawPowerIndex=offense+sustain+utility;
    const row={
      jutsuId,characterId:id,characterName:c.name??id,slot,
      name:s.name??`Slot ${slot}`,originalName:s.originalName??null,description:s.desc??'',effectText:s.effectText??'',image:s.image??null,
      cost:costParts(s),costUnits:cost,cooldown:cd,
      mechanic:{kind:kindOf(s),power:rawPower(s),target:targetOf(s),aoe:mechanicOf(s).aoe===true,duration:durationOf(s)},
      damage:round(damage),healing:round(heal),defenseScore:round(defense),controlScore:round(control),
      effects:effectsOf(s),descriptionWarnings:descriptionWarnings(s),sourceKeys:Object.keys(s).sort(),
      metrics:{offenseScore:round(offense),sustainScore:round(sustain),utilityScore:round(utility),damageEfficiency:round(damage/denominator),powerEfficiency:round(rawPowerIndex/denominator),rawPowerIndex:round(rawPowerIndex)}
    };
    jutsus.push(row);
    links.push({characterId:id,characterName:c.name??id,jutsuId,slot,name:row.name,originalName:row.originalName});
  }
  characters.push({
    characterId:id,name:c.name??id,bio:c.bio??'',image:c.icon??c.img??null,skillField:shape.field,jutsuCount:skills.length,
    jutsuIds:skills.map((_,i)=>`${id}:${i+1}`)
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
  if(j.damage>0&&Math.abs(j.metrics.damageRobustZ)>=2.5)j.balanceFlags.push(j.metrics.damageRobustZ>0?'dano_outlier_alto':'dano_outlier_baixo');
  if(j.damage>0&&Math.abs(j.metrics.efficiencyRobustZ)>=2.5)j.balanceFlags.push(j.metrics.efficiencyRobustZ>0?'eficiencia_dano_outlier_alta':'eficiencia_dano_outlier_baixa');
  if(Math.abs(j.metrics.powerRobustZ)>=3)j.balanceFlags.push(j.metrics.powerRobustZ>0?'indice_poder_outlier_alto':'indice_poder_outlier_baixo');
  if(j.costUnits===0&&(j.damage>0||j.controlScore>0||j.healing>0||j.defenseScore>0))j.balanceFlags.push('efeito_relevante_sem_custo');
  if(j.cooldown===0&&j.controlScore>=10)j.balanceFlags.push('controle_forte_sem_cooldown');
  if(j.mechanic.kind==='invuln'&&j.mechanic.duration>1)j.balanceFlags.push('invulnerabilidade_multiturno_revisar');
  if(j.descriptionWarnings.length)j.balanceFlags.push('descricao_mecanica_revisar');
}

const byChar=groupBy(jutsus,j=>j.characterId);
const characterBalance=characters.map(c=>{
  const js=byChar.get(c.characterId)||[];
  return {
    characterId:c.characterId,name:c.name,jutsuCount:js.length,
    avgDamage:round(js.reduce((s,j)=>s+j.damage,0)/Math.max(1,js.length)),
    maxDamage:round(Math.max(0,...js.map(j=>j.damage))),
    totalDamageBudget:round(js.reduce((s,j)=>s+j.damage,0)),
    avgCostUnits:round(js.reduce((s,j)=>s+j.costUnits,0)/Math.max(1,js.length)),
    avgCooldown:round(js.reduce((s,j)=>s+j.cooldown,0)/Math.max(1,js.length)),
    offenseScore:round(js.reduce((s,j)=>s+j.metrics.offenseScore,0)),
    sustainScore:round(js.reduce((s,j)=>s+j.metrics.sustainScore,0)),
    utilityScore:round(js.reduce((s,j)=>s+j.metrics.utilityScore,0)),
    rawPowerIndex:round(js.reduce((s,j)=>s+j.metrics.rawPowerIndex,0)),
    descriptionWarnings:js.reduce((s,j)=>s+j.descriptionWarnings.length,0),
    jutsuBalanceFlags:js.reduce((s,j)=>s+j.balanceFlags.length,0)
  };
});
const characterPower=characterBalance.map(c=>c.rawPowerIndex);
for(const c of characterBalance){
  c.powerRobustZ=round(robustZ(c.rawPowerIndex,characterPower));
  c.balanceFlags=[];
  if(Math.abs(c.powerRobustZ)>=2.5)c.balanceFlags.push(c.powerRobustZ>0?'personagem_power_outlier_alto':'personagem_power_outlier_baixo');
  if(c.jutsuCount!==4)c.balanceFlags.push('quantidade_jutsus_diferente_de_4');
  if(c.descriptionWarnings)c.balanceFlags.push('possui_descricao_mecanica_inconsistente');
}

const duplicateNames=[...groupBy(jutsus,j=>norm(j.originalName||j.name))].filter(([,v])=>v.length>1).map(([name,v])=>({normalizedName:name,count:v.length,uses:v.map(x=>({jutsuId:x.jutsuId,character:x.characterName,name:x.name,originalName:x.originalName}))}));
const kindCounts=Object.fromEntries([...groupBy(jutsus,j=>j.mechanic.kind)].map(([k,v])=>[k,v.length]).sort((a,b)=>a[0].localeCompare(b[0])));
const countByField=Object.fromEntries([...groupBy(characters,c=>c.skillField||'none')].map(([k,v])=>[k,v.length]));
const summary={
  generatedAt:new Date().toISOString(),sourceFiles:['roster.js','jutsu-variants.js'],characters:characters.length,jutsus:jutsus.length,links:links.length,
  characterSkillFields:countByField,mechanicKinds:kindCounts,duplicateJutsuNames:duplicateNames.length,
  charactersWithoutFourJutsu:characterBalance.filter(c=>c.jutsuCount!==4).length,
  descriptionWarnings:jutsus.reduce((s,j)=>s+j.descriptionWarnings.length,0),jutsuBalanceFlags:jutsus.reduce((s,j)=>s+j.balanceFlags.length,0),characterBalanceFlags:characterBalance.reduce((s,c)=>s+c.balanceFlags.length,0),
  methodology:{
    offenseScore:'dano estruturado × fator de área (1.75 para AoE)',
    sustainScore:'0.8×cura + 0.45×defesa acumulada; AoE recebe fator 1.75',
    utilityScore:'peso por tipo de controle × duração (máximo 4) × fator de área',
    damageEfficiency:'dano / (max(1,custo em unidades) × (cooldown+1))',
    powerEfficiency:'(ofensa+sustentação+utilidade) / (max(1,custo) × (cooldown+1))',
    outliers:'robust z-score baseado em mediana/MAD; triagem somente, nunca nerf/buff automático'
  }
};

const write=(name,data)=>fs.writeFileSync(path.join(outDir,name),JSON.stringify(data,null,2)+'\n');
write('SUMMARY.json',summary);
write('CHARACTERS.json',characters);
write('JUTSUS.json',jutsus);
write('CHARACTER-JUTSU-MAP.json',links);
write('CHARACTER-BALANCE.json',characterBalance);
write('DUPLICATE-JUTSU-NAMES.json',duplicateNames);

const esc=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
const topJ=[...jutsus].sort((a,b)=>Math.abs(b.metrics.powerRobustZ)-Math.abs(a.metrics.powerRobustZ)).slice(0,50);
const topC=[...characterBalance].sort((a,b)=>Math.abs(b.powerRobustZ)-Math.abs(a.powerRobustZ)).slice(0,50);
let md=`# Auditoria de personagens, jutsus e balanceamento\n\nGerado em: ${summary.generatedAt}\n\n## Escopo\n\n- Personagens: **${summary.characters}**\n- Jutsus: **${summary.jutsus}**\n- Ligações personagem↔jutsu: **${summary.links}**\n- Personagens sem exatamente 4 jutsus: **${summary.charactersWithoutFourJutsu}**\n- Alertas descrição↔mecânica: **${summary.descriptionWarnings}**\n- Flags de jutsu: **${summary.jutsuBalanceFlags}**\n- Flags de personagem: **${summary.characterBalanceFlags}**\n\n## Tipos mecânicos encontrados\n\n\`${JSON.stringify(summary.mechanicKinds)}\`\n\n## Critério\n\nOs índices são **triagem comparativa**. Nenhum valor deve ser alterado só porque apareceu como outlier. Antes de nerf/buff é obrigatório confirmar o motor real, economia de chakra, alvo/área, duração, sinergias, requisitos e taxa de vitória por confronto.\n\n## Personagens com maior desvio estático\n\n| Personagem | Jutsus | Dano médio | Máx dano | Custo méd. | CD méd. | Ofensa | Sustentação | Utilidade | Índice | z robusto | Alertas |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|\n`;
for(const c of topC)md+=`| ${esc(c.name)} | ${c.jutsuCount} | ${c.avgDamage} | ${c.maxDamage} | ${c.avgCostUnits} | ${c.avgCooldown} | ${c.offenseScore} | ${c.sustainScore} | ${c.utilityScore} | ${c.rawPowerIndex} | ${c.powerRobustZ} | ${esc(c.balanceFlags.join(', '))} |\n`;
md+=`\n## Jutsus com maior desvio estático\n\n| Personagem | Jutsu | Tipo | Custo | CD | Dano | Sust. | Controle | Índice | z robusto | Alertas |\n|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|\n`;
for(const j of topJ)md+=`| ${esc(j.characterName)} | ${esc(j.name)} | ${esc(j.mechanic.kind)} | ${j.costUnits} | ${j.cooldown} | ${j.damage} | ${round(j.metrics.sustainScore)} | ${round(j.metrics.utilityScore)} | ${j.metrics.rawPowerIndex} | ${j.metrics.powerRobustZ} | ${esc([...j.balanceFlags,...j.descriptionWarnings].join(', '))} |\n`;
md+=`\n## Arquivos produzidos\n\n- \`CHARACTERS.json\`: levantamento de cada personagem.\n- \`JUTSUS.json\`: cada jutsu, descrição, custo, cooldown, dano, mecânica e efeitos.\n- \`CHARACTER-JUTSU-MAP.json\`: linkagem completa personagem↔jutsu.\n- \`CHARACTER-BALANCE.json\`: comparação agregada de cada kit.\n- \`DUPLICATE-JUTSU-NAMES.json\`: técnicas de mesmo nome usadas por múltiplos personagens/versões.\n- \`SUMMARY.json\`: contagens, tipos mecânicos e metodologia.\n\n## Próximo gate antes de alterar números\n\n1. Comparar jutsus com o repositório canônico Naruto Unison quando houver correspondência pelo nome original.\n2. Confirmar no motor como dano, defesa, invulnerabilidade, alvo, AoE, duração, requisitos e chakra são resolvidos.\n3. Rodar matriz personagem×personagem com sementes reproduzíveis e várias políticas de IA.\n4. Medir win rate, TTK, dano, chakra restante, controle e taxa de uso por jutsu.\n5. Corrigir primeiro inconsistências descrição↔mecânica; depois números em lotes pequenos; repetir a matriz após cada lote.\n`;
fs.writeFileSync(path.join(outDir,'BALANCE-REPORT.md'),md);

console.log(JSON.stringify(summary,null,2));
if(summary.characters<1||summary.jutsus<1||summary.links!==summary.jutsus||summary.charactersWithoutFourJutsu>0)process.exitCode=2;
