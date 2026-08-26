import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root=process.cwd();
const outDir=path.join(root,'audit','balance','current');
const meta=JSON.parse(fs.readFileSync(path.join(outDir,'META-BALANCE.json'),'utf8'));
const sim=JSON.parse(fs.readFileSync(path.join(outDir,'CHARACTER-SIMULATION.json'),'utf8'));
const context={window:{},console,setTimeout,clearTimeout};context.window.window=context.window;vm.createContext(context);
for(const file of ['roster.js','jutsu-variants.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file,timeout:30000});
const roster=context.window.NARUTO_ROSTER||[];
const byId=new Map(roster.map(c=>[String(c.slug??c.id??c.name),c]));
const simById=new Map(sim.map(c=>[c.characterId,c]));
const top=(action,n=5)=>meta.priorities.filter(x=>x.action===action).slice(0,n);
const selected=[...top('BUFF_CANDIDATE'),...top('NERF_CANDIDATE')];
const rows=selected.map(p=>{
  const c=byId.get(p.characterId);if(!c)throw new Error(`Roster ausente: ${p.characterId}`);
  const s=simById.get(p.characterId)||null;
  return {
    characterId:p.characterId,name:p.name,action:p.action,priority:p.priority,
    meta:{teamWinRate:p.teamWinRate,duelWinRate:p.duelWinRate,teamWinRate95:p.teamWinRate95,duelWinRate95:p.duelWinRate95,orderGap:p.orderGap,policyRange:p.policyRange,teamDuelGap:p.teamDuelGap,worstMatchupWinRate:p.worstMatchupWinRate,teamEloEquivalent:p.teamEloEquivalent,duelEloEquivalent:p.duelEloEquivalent},
    bio:c.bio??'',icon:c.icon??null,
    skills:(c.skills||[]).map((sk,i)=>({slot:i+1,name:sk.name,originalName:sk.originalName??sk.name,desc:sk.desc??'',effectText:sk.effectText??'',cost:sk.cost??[],cooldown:sk.cooldown??0,image:sk.image??null,mechanic:sk.mechanic??null})),
    worstMatchups:s?.worstMatchups?.slice(0,5)??[],bestMatchups:s?.bestMatchups?.slice(0,5)??[],policyWinRates:s?.duel?.policies??{}
  };
});
const output={generatedAt:new Date().toISOString(),sourceMetaGeneratedAt:meta.generatedAt,selectionRule:'top 5 BUFF_CANDIDATE + top 5 NERF_CANDIDATE por priority; nenhum valor alterado',characters:rows};
fs.writeFileSync(path.join(outDir,'BATCH-001-CANDIDATES.json'),JSON.stringify(output,null,2)+'\n');
let md=`# Batch 001 — candidatos extremos para revisão canônica\n\nGerado em: ${output.generatedAt}\n\nNenhum valor foi alterado. Este lote existe para revisar **mecânica e cânone primeiro**.\n\n`;
for(const c of rows){
  md+=`## ${c.name} — ${c.action}\n\n- ID: \`${c.characterId}\`\n- Prioridade: **${c.priority}**\n- Win 3x3: **${(c.meta.teamWinRate*100).toFixed(1)}%**\n- Win duelo: **${(c.meta.duelWinRate*100).toFixed(1)}%**\n- Gap de ordem: **${(c.meta.orderGap*100).toFixed(1)} p.p.**\n- Pior matchup: **${(c.meta.worstMatchupWinRate*100).toFixed(1)}%**\n\n| # | Jutsu | Nome original | Custo | CD | Tipo | Power | Alvo | AoE | Duração |\n|---|---|---|---|---:|---|---:|---|---|---:|\n`;
  for(const s of c.skills){const m=s.mechanic||{};md+=`| ${s.slot} | ${String(s.name).replace(/\|/g,'\\|')} | ${String(s.originalName).replace(/\|/g,'\\|')} | ${(s.cost||[]).join('+')||'0'} | ${s.cooldown} | ${m.kind??'—'} | ${m.power??'—'} | ${m.target??'—'} | ${m.aoe?'sim':'não'} | ${m.duration??0} |\n`}
  md+='\n';
}
fs.writeFileSync(path.join(outDir,'BATCH-001-CANDIDATES.md'),md);
console.log(JSON.stringify({count:rows.length,buffs:rows.filter(x=>x.action==='BUFF_CANDIDATE').map(x=>x.name),nerfs:rows.filter(x=>x.action==='NERF_CANDIDATE').map(x=>x.name)},null,2));
