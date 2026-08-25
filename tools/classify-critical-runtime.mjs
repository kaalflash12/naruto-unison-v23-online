import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const dir=path.join(root,'audit','balance','runtime');
const rows=JSON.parse(fs.readFileSync(path.join(dir,'SEMANTIC-REVIEW.json'),'utf8'));
const critical=rows.filter(r=>r.warnings?.some(w=>w.severity==='critical'));

const codeCounts={};
const categories={};
const items=critical.map(r=>{
  const codes=r.warnings.filter(w=>w.severity==='critical').map(w=>w.code);
  for(const c of codes) codeCounts[c]=(codeCounts[c]||0)+1;
  let category='canonical_review_required';
  let rationale='A mecânica é suspeita, mas pode representar custo/sacrifício intencional; confirmar no upstream antes de alterar.';
  const hints=new Set(r.semanticHints||[]);
  const supportHint=[...hints].some(x=>['heal','shield','invuln'].includes(x));
  if(codes.includes('semantic_support_mapped_as_damage')||codes.includes('support_skill_damages_ally')||(supportHint&&['self','ally'].includes(r.runtime?.target)&&r.runtime?.kind==='damage')){
    category='probable_mapping_error';
    rationale='Texto/nome indica suporte, mas o resolvedor atual executa dano no próprio time.';
  } else if(codes.includes('long_invulnerability')||codes.includes('strong_effect_zero_cost')){
    category='balance_risk';
    rationale='A técnica pode estar semanticamente correta, mas duração/potência sem custo exige validação canônica e simulação.';
  } else if(codes.includes('standard_extreme_burst')){
    category='numeric_balance_risk';
    rationale='Burst extremo em personagem padrão; validar valor/custo/cooldown e taxa de vitória antes de nerf.';
  } else if(codes.includes('mechanic_kind_missing')){
    category='data_schema_error';
    rationale='Kind ausente deixa a execução depender do fallback do motor.';
  }
  categories[category]=(categories[category]||0)+1;
  return {
    jutsuId:r.jutsuId,characterId:r.characterId,characterName:r.characterName,slot:r.slot,
    name:r.name,originalName:r.originalName,description:r.description,effectText:r.effectText,
    cost:r.cost,cooldown:r.cooldown,mechanic:r.mechanic,runtime:r.runtime,semanticHints:r.semanticHints,
    criticalCodes:codes,allWarnings:r.warnings,triageCategory:category,triageRationale:rationale,
    canonicalStatus:'pending',canonicalSource:null,canonicalFinding:null,finalClassification:'pending',recommendedAction:'pending',confidence:'pending'
  };
});

items.sort((a,b)=>a.triageCategory.localeCompare(b.triageCategory)||a.characterName.localeCompare(b.characterName)||a.slot-b.slot);
const summary={generatedAt:new Date().toISOString(),criticalJutsus:items.length,criticalWarnings:items.reduce((n,x)=>n+x.criticalCodes.length,0),byCriticalCode:Object.fromEntries(Object.entries(codeCounts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))),byTriageCategory:Object.fromEntries(Object.entries(categories).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))),note:'Triagem mecânica. Nenhuma alteração automática de gameplay; canonicalStatus precisa ser preenchido antes de corrigir dados/números.'};

fs.writeFileSync(path.join(dir,'CRITICAL-BACKLOG.json'),JSON.stringify(items,null,2)+'\n');
fs.writeFileSync(path.join(dir,'CRITICAL-SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
let md=`# Backlog crítico de jutsus\n\nGerado em ${summary.generatedAt}.\n\n- Jutsus com alerta crítico: **${summary.criticalJutsus}**\n- Alertas críticos totais: **${summary.criticalWarnings}**\n\n## Categorias de triagem\n\n`;
for(const [k,v] of Object.entries(summary.byTriageCategory)) md+=`- **${k}**: ${v}\n`;
md+='\n## Casos\n\n| Categoria | Personagem | Jutsu | Kind | Alvo | Power | Dur. | Custo | Alertas críticos | Status canônico |\n|---|---|---|---|---|---:|---:|---:|---|---|\n';
for(const x of items){md+=`| ${x.triageCategory} | ${String(x.characterName).replace(/\|/g,'/')} | ${String(x.name).replace(/\|/g,'/')} | ${x.runtime.kind} | ${x.runtime.target} | ${x.runtime.power} | ${x.runtime.declaredDuration} | ${x.cost.length} | ${x.criticalCodes.join(', ')} | ${x.canonicalStatus} |\n`;}
md+='\n## Regra de execução\n\nNenhum item muda o jogo apenas por aparecer aqui. Primeiro: confirmar upstream/cânone. Depois classificar como `correct`, `description_wrong`, `effect_wrong`, `target_wrong`, `value_wrong` ou `engine_insufficient`. Só então aplicar patch e repetir auditoria + simulação.\n';
fs.writeFileSync(path.join(dir,'CRITICAL-REPORT.md'),md);
console.log(JSON.stringify(summary,null,2));
if(items.length!==41) process.exitCode=2;
