import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const outDir=path.join(process.cwd(),'audit','balance','runtime');
fs.mkdirSync(outDir,{recursive:true});
const ctx={window:{},console};ctx.window.window=ctx.window;vm.createContext(ctx);
for(const file of ['roster.js','jutsu-variants.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file,timeout:30000});
const roster=ctx.window.NARUTO_ROSTER;
if(!Array.isArray(roster)||!roster.length)throw new Error('NARUTO_ROSTER vazio');

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const uniq=a=>[...new Set(a)];
const round=x=>Number(Number(x||0).toFixed(3));
const median=a=>{const s=[...a].filter(Number.isFinite).sort((x,y)=>x-y);if(!s.length)return 0;const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2};
const mad=a=>{const m=median(a);return median(a.map(x=>Math.abs(x-m)))||1};
const rz=(x,a)=>round(.6745*(x-median(a))/mad(a));

function classification(c){
  if(c.eventOnly===true||/^bijuu-/.test(String(c.slug||'')))return 'event';
  const b=norm(c.bio);
  if(/chefe|boss|exclusiv/.test(b))return 'special-review';
  return 'standard';
}
function effectiveDuration(kind,d){
  d=Math.max(0,n(d));
  if(['stun','dot','invuln'].includes(kind))return d||1;
  return d;
}
function semanticHints(s){
  const t=norm(`${s.name||''} ${s.originalName||''} ${s.desc||''} ${s.effectText||''}`),h=[];
  if(/cura|heal|healing|recovery|recuper|regenera|transfer.*life|life transfer/.test(t))h.push('heal');
  if(/escudo|shield|armor|armour|barrier|defesa|defense|protect|guard|wall/.test(t))h.push('shield');
  if(/invulner|dodge|evade|substitution|hide|intang|imune|immune/.test(t))h.push('invuln');
  if(/stun|atordo|paralis|immobili|snare|bind|trap|prisao|prison/.test(t))h.push('stun');
  if(/poison|venen|bleed|sangr|burn|queim|damage over time|dano continuo|aflic/.test(t))h.push('dot');
  if(/damage|dano|ataque|attack|golpe|punch|kick|barrage|blade|bomb|blast|strike|rasengan|chidori/.test(t))h.push('damage');
  return uniq(h);
}
function runtimeProjection(s){
  const m=s?.mechanic||{},kind=String(m.kind||'damage'),power=Math.max(0,n(m.power,25)),duration=effectiveDuration(kind,m.duration),target=String(m.target||'enemy'),aoe=m.aoe===true;
  const immediateDamage=['damage','stun','dot'].includes(kind)?power:0;
  const dotTicks=kind==='dot'?duration:0;
  const dotDamage=dotTicks*7;
  const heal=kind==='heal'?power:0;
  const shield=kind==='shield'?power:0;
  const invulnTurns=kind==='invuln'?duration:0;
  const stunTurns=kind==='stun'?duration:0;
  const maxTargets=aoe?(target==='self'?1:3):1;
  return {kind,power,target,aoe,declaredDuration:Math.max(0,n(m.duration)),effectiveDuration:duration,immediateDamageMean:immediateDamage,immediateDamageRange:immediateDamage?[Math.round(immediateDamage*.9),Math.round(immediateDamage*1.1)]:[0,0],dotTicks,dotDamagePotential:dotDamage,totalDamagePotential:immediateDamage+dotDamage,heal,shieldPool:shield,shieldExpiryTurns:kind==='shield'?Math.max(0,n(m.duration)):0,shieldPersistsUntilBroken:kind==='shield'&&Math.max(0,n(m.duration))===0,invulnTurns,stunTurns,maxTargets,totalTeamDamagePotential:(immediateDamage+dotDamage)*maxTargets,totalTeamHealPotential:heal*maxTargets,totalTeamShieldPotential:shield*maxTargets};
}
function review(c,s,p){
  const warnings=[],hints=semanticHints(s),text=norm(`${s.desc||''} ${s.effectText||''}`),cost=Array.isArray(s.cost)?s.cost.length:0,cls=classification(c);
  const add=(severity,code,why)=>warnings.push({severity,code,why});
  if(!String(s.desc||'').trim())add('medium','description_empty','Descrição vazia.');
  if(!String(s.effectText||'').trim())add('medium','effect_text_empty','Texto de efeito vazio.');
  if(!s?.mechanic?.kind)add('critical','mechanic_kind_missing','Motor cairá no comportamento padrão/indefinido.');
  if(!s?.mechanic?.target)add('high','mechanic_target_missing','Alvo não está explicitamente estruturado.');
  if(['damage','stun','dot'].includes(p.kind)&&['self','ally'].includes(p.target))add('critical','hostile_effect_targets_own_team',`${p.kind} causa efeito hostil em alvo ${p.target}.`);
  if(p.kind==='damage'&&p.declaredDuration>0)add('high','damage_duration_unused',`Duração ${p.declaredDuration} não é usada pelo resolvedor de damage.`);
  if(p.kind==='invuln'&&p.power>0)add('medium','invuln_power_unused',`Power ${p.power} é ignorado pelo resolvedor de invulnerabilidade.`);
  if(p.kind==='invuln'&&p.invulnTurns>=3)add(cost===0?'critical':'high','long_invulnerability',`Invulnerabilidade dura ${p.invulnTurns} turnos com custo ${cost}.`);
  if(p.kind==='stun'&&p.stunTurns>=3)add('high','long_stun',`Atordoamento pode remover ${p.stunTurns} ações do alvo.`);
  if(p.kind==='dot'&&p.dotTicks>=4)add('high','long_dot',`DoT adiciona até ${p.dotDamagePotential} de dano fixo além do impacto inicial.`);
  if(cls==='standard'&&p.immediateDamageMean>=100)add(p.immediateDamageMean>=150?'critical':'high','standard_extreme_burst',`Dano médio base ${p.immediateDamageMean} em personagem não marcado como evento.`);
  if(cost===0&&(p.immediateDamageMean>=40||p.invulnTurns>=2||p.stunTurns>=2||p.shieldPool>=35))add('critical','strong_effect_zero_cost','Efeito forte sem custo de chakra.');
  if(p.aoe&&['damage','stun','dot'].includes(p.kind)&&p.totalTeamDamagePotential>=150&&cls==='standard')add('high','high_aoe_damage',`Potencial bruto em 3 alvos: ${p.totalTeamDamagePotential}.`);
  if(p.kind==='damage'&&hints.some(x=>['heal','shield','invuln'].includes(x))&&!hints.includes('damage'))add('critical','semantic_support_mapped_as_damage',`Nome/descrição sugere ${hints.join('/')} mas mechanic.kind é damage.`);
  if(p.kind==='damage'&&['ally','self'].includes(p.target)&&hints.some(x=>['heal','shield','invuln'].includes(x)))add('critical','support_skill_damages_ally',`Técnica de suporte aparente está estruturada como dano em ${p.target}.`);
  if(p.kind==='heal'&&!/(cura|heal|recuper|restaur|regenera)/.test(text))add('low','heal_not_explained','Cura estruturada pouco explícita no texto.');
  if(p.kind==='shield'&&!/(defesa|escudo|shield|armor|barrier|protect|guard|reduz)/.test(text))add('low','shield_not_explained','Defesa estruturada pouco explícita no texto.');
  if(p.kind==='stun'&&!/(atord|stun|paralis|imobil|pris|trap|bind)/.test(text))add('medium','stun_not_explained','Atordoamento estruturado pouco explícito no texto.');
  if(p.kind==='dot'&&!/(aflic|dano continuo|poison|venen|sangr|bleed|burn|queim)/.test(text))add('medium','dot_not_explained','DoT estruturado pouco explícito no texto.');
  const rank={critical:4,high:3,medium:2,low:1};warnings.sort((a,b)=>rank[b.severity]-rank[a.severity]||a.code.localeCompare(b.code));
  return warnings;
}

const rows=[],chars=[];
for(const c of roster){
  const cls=classification(c),id=String(c.slug||c.id||c.name),skills=Array.isArray(c.skills)?c.skills:[];
  const js=[];
  skills.forEach((s,i)=>{
    const projection=runtimeProjection(s),warnings=review(c,s,projection),row={jutsuId:`${id}:${i+1}`,characterId:id,characterName:c.name,characterClass:cls,eventOnly:c.eventOnly===true,slot:i+1,name:s.name,originalName:s.originalName||null,description:s.desc||'',effectText:s.effectText||'',cost:s.cost||[],cooldown:n(s.cooldown),mechanic:s.mechanic||null,runtime:projection,semanticHints:semanticHints(s),warnings};
    rows.push(row);js.push(row);
  });
  chars.push({characterId:id,name:c.name,class:cls,eventOnly:c.eventOnly===true,jutsuCount:skills.length,critical:js.reduce((x,j)=>x+j.warnings.filter(w=>w.severity==='critical').length,0),high:js.reduce((x,j)=>x+j.warnings.filter(w=>w.severity==='high').length,0),medium:js.reduce((x,j)=>x+j.warnings.filter(w=>w.severity==='medium').length,0),low:js.reduce((x,j)=>x+j.warnings.filter(w=>w.severity==='low').length,0),damagePotential:round(js.reduce((x,j)=>x+j.runtime.totalDamagePotential,0)),maxBurst:Math.max(0,...js.map(j=>j.runtime.immediateDamageMean)),maxInvuln:Math.max(0,...js.map(j=>j.runtime.invulnTurns)),maxStun:Math.max(0,...js.map(j=>j.runtime.stunTurns))});
}

const standardRows=rows.filter(x=>x.characterClass==='standard');
const bursts=standardRows.map(x=>x.runtime.immediateDamageMean).filter(x=>x>0),totalDmg=standardRows.map(x=>x.runtime.totalDamagePotential).filter(x=>x>0);
for(const r of rows){r.runtime.burstRobustZ=r.characterClass==='standard'&&r.runtime.immediateDamageMean>0?rz(r.runtime.immediateDamageMean,bursts):null;r.runtime.totalDamageRobustZ=r.characterClass==='standard'&&r.runtime.totalDamagePotential>0?rz(r.runtime.totalDamagePotential,totalDmg):null;if(r.runtime.burstRobustZ!=null&&r.runtime.burstRobustZ>=3)r.warnings.unshift({severity:'high',code:'burst_statistical_outlier',why:`Dano base z robusto ${r.runtime.burstRobustZ}.`})}

const sev={critical:4,high:3,medium:2,low:1};
const reviewRows=rows.filter(r=>r.warnings.length).sort((a,b)=>(Math.max(...b.warnings.map(w=>sev[w.severity]))-Math.max(...a.warnings.map(w=>sev[w.severity])))||b.warnings.length-a.warnings.length||a.characterName.localeCompare(b.characterName));
const summary={generatedAt:new Date().toISOString(),characters:chars.length,jutsus:rows.length,standardCharacters:chars.filter(c=>c.class==='standard').length,eventCharacters:chars.filter(c=>c.class==='event').length,specialReviewCharacters:chars.filter(c=>c.class==='special-review').length,warningJutsus:reviewRows.length,warnings:{critical:reviewRows.reduce((x,r)=>x+r.warnings.filter(w=>w.severity==='critical').length,0),high:reviewRows.reduce((x,r)=>x+r.warnings.filter(w=>w.severity==='high').length,0),medium:reviewRows.reduce((x,r)=>x+r.warnings.filter(w=>w.severity==='medium').length,0),low:reviewRows.reduce((x,r)=>x+r.warnings.filter(w=>w.severity==='low').length,0)},runtimeRules:{damage:'power com rolagem uniforme aproximada de 90% a 110%; duration ignorada',stun:'mesmo dano imediato de damage + perda de ação por max(1,duration)',dot:'mesmo dano imediato + 7 por turno por max(1,duration)',heal:'cura power, limitada ao maxHp',shield:'adiciona power ao pool; duration 0 persiste até quebrar, duration >0 expira em ticks',invuln:'power ignorado; bloqueia hit por max(1,duration)',aoe:'efeito repetido em cada alvo vivo elegível; impacto depende de 1/2/3 alvos',cooldown:'decrementa no tick ao final da rodada',cost:'tipos específicos + Rand pago pelo chakra real mais abundante disponível'}};

fs.writeFileSync(path.join(outDir,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'JUTSU-RUNTIME.json'),JSON.stringify(rows,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'SEMANTIC-REVIEW.json'),JSON.stringify(reviewRows,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'CHARACTER-RUNTIME.json'),JSON.stringify(chars.sort((a,b)=>(b.critical*100+b.high*10+b.medium)-(a.critical*100+a.high*10+a.medium)||b.damagePotential-a.damagePotential),null,2)+'\n');

let md=`# Auditoria de semântica real do combate\n\nGerado em ${summary.generatedAt}.\n\n## Base\n\n- ${summary.characters} personagens\n- ${summary.jutsus} jutsus\n- ${summary.standardCharacters} personagens padrão\n- ${summary.eventCharacters} personagens/eventos separados\n- ${summary.specialReviewCharacters} personagens especiais para revisão de elegibilidade PvP\n- ${summary.warningJutsus} jutsus com pelo menos um alerta\n- Alertas: **${summary.warnings.critical} críticos**, **${summary.warnings.high} altos**, ${summary.warnings.medium} médios, ${summary.warnings.low} baixos\n\n## Regras efetivamente modeladas\n\n- DAMAGE: power com variação ~90–110%; duration não participa do dano.\n- STUN: dano imediato + perda de ação; duration 0 vira 1 turno.\n- DOT: dano imediato + 7 por tick; duration 0 vira 1 tick.\n- HEAL: cura power até maxHp.\n- SHIELD: power entra no pool; duration 0 não expira por relógio.\n- INVULN: power é ignorado; duration 0 vira 1 turno.\n- AOE: aplica o efeito a cada alvo vivo, logo o impacto é 1×/2×/3×, não um multiplicador fixo.\n\n## Revisão prioritária\n\n| Sev. | Personagem | Jutsu | Kind | Alvo | Power | Dur. | Custo | Problema |\n|---|---|---|---|---|---:|---:|---:|---|\n`;
for(const r of reviewRows.slice(0,120)){const w=r.warnings[0];md+=`| ${w.severity.toUpperCase()} | ${String(r.characterName).replace(/\|/g,'/')} | ${String(r.name).replace(/\|/g,'/')} | ${r.runtime.kind} | ${r.runtime.target} | ${r.runtime.power} | ${r.runtime.declaredDuration} | ${r.cost.length} | ${String(w.code+' — '+w.why).replace(/\|/g,'/')} |\n`}
md+=`\n## Regra de decisão\n\nNenhum alerta numérico autoriza nerf/buff sozinho. Primeiro corrigir mapeamentos semânticos, depois confirmar paridade com o backend online, depois executar simulação reproduzível e medir taxa de vitória/TTK/chakra/controle por matchup.\n`;
fs.writeFileSync(path.join(outDir,'RUNTIME-REPORT.md'),md);
console.log(JSON.stringify(summary,null,2));
if(rows.length!==chars.length*4)process.exitCode=2;
