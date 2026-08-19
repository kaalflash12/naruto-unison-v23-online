(()=>{'use strict';
const V7=window.NARUTO_V7;const W=window.NARUTO_V84_WORLD;const errors=[];
if(!V7)errors.push('NARUTO_V7 ausente');
if(!W)errors.push('NARUTO_V84_WORLD ausente');
if(errors.length){window.__R41_DATA_DELTA={ok:false,errors};throw new Error('[R41_DATA_DELTA] '+errors.join('; '));}
const npcPatch={
  folha_instrutor:{nome:'Iruka Umino',papel:'Academia • treino',fala:'Treino de fundamentos, controle e preparação de missão.',art:'assets/r40/atlas_verified/iruka-umino.webp',canonicalId:'iruka_umino',serviceRole:'training'},
  folha_balconista:{nome:'Tenten',papel:'Arsenal • armas',fala:'Posso orientar equipamento e ferramentas ninja; o estoque continua sendo do arsenal da vila.',art:'assets/r40/atlas_verified/tenten.webp',canonicalId:'tenten',serviceRole:'arsenal'},
  folha_oficial:{nome:'Kotetsu Hagane',papel:'Apoio do Edifício de Missões',fala:'Os contratos liberados dependem do seu rank, do estado do mundo e da equipe.',art:'assets/r40/atlas_verified/kotetsu-hagane.webp',canonicalId:'kotetsu_hagane',serviceRole:'missions'},
  folha_medica:{nome:'Shizune',papel:'Hospital • medicina',fala:'Primeiro eu avalio o ferimento. Tratamento não apaga lesão grave nem tempo decorrido.',art:'assets/r40/atlas_verified/shizune.webp',canonicalId:'shizune',serviceRole:'hospital'}
};
let npcApplied=0;
for(const npc of (V7.npcs?.folha||[])){const p=npcPatch[npc.id];if(p){Object.assign(npc,p);npcApplied++;}}
const completedArcIds=new Set(['ARC_01','ARC_02','ARC_03','ARC_04','ARC_05','ARC_06','ARC_07','ARC_08']);
let beatsApplied=0;
for(const arc of (W.arcs||[])){if(!completedArcIds.has(arc.id)||!Array.isArray(arc.mandatoryBeats))continue;for(const beat of arc.mandatoryBeats){if(beat.status!=='CONCLUIDO_OU_SUPERADO')beat.status='CONCLUIDO_OU_SUPERADO';beatsApplied++;}}
W.r41=W.r41||{};W.r41.storyConsistency={completedArcMandatoryBeatsNormalized:true,normalizedBeats:40,at:'2026-08-17T19:40:00Z'};
const validation={npcApplied,beatsApplied,storyConsistency:W.r41.storyConsistency,canonicalNpcOk:Object.entries(npcPatch).every(([id,p])=>{const n=(V7.npcs?.folha||[]).find(x=>x.id===id);return !!n&&Object.entries(p).every(([k,v])=>n[k]===v);}),completedBeatsOk:(W.arcs||[]).filter(a=>completedArcIds.has(a.id)).every(a=>(a.mandatoryBeats||[]).every(b=>b.status==='CONCLUIDO_OU_SUPERADO'))};
validation.ok=validation.npcApplied===4&&validation.beatsApplied===40&&validation.canonicalNpcOk&&validation.completedBeatsOk;
window.__R41_DATA_DELTA=validation;if(!validation.ok)throw new Error('[R41_DATA_DELTA] validação falhou: '+JSON.stringify(validation));console.info('[R41_DATA_DELTA]',validation);
})();
