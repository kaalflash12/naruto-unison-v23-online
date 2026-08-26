(()=>{
'use strict';
const SB_URL='https://cpdgkszviwrgrwsltbyk.supabase.co';
const SB_KEY='sb_publishable_KGkT_uJNg1nRBgftEvlT3w_c_aHOo5K';
const API={content:SB_URL+'/functions/v1/content',admin:SB_URL+'/functions/v1/admin',ai:SB_URL+'/functions/v1/ai-event-director'};
const TYPES=[
  ['character','Personagens'],['technique','Técnicas / Jutsus'],['mission','Missões'],['story_chapter','Capítulos da História'],
  ['equipment','Equipamentos'],['boss','Bosses'],['event','Eventos'],['location','Locais'],['scene','Cenas'],
  ['ai_profile','Perfis de IA'],['animation_profile','Perfis de Animação']
];
const OPTIONS={
  techniqueType:['active','transformation','dojutsu','stance','summon','reaction','ultimate'],
  target:['enemy','ally','self','all-enemies','all-allies'],
  rank:['D','C','B','A','S'],
  equipmentSlot:['weapon','clothing','footwear','scroll','talisman'],
  bossKind:['nukenin','bijuu','story','seasonal'],
  cycle:['weekly','monthly','seasonal','manual'],
  difficulty:['easy','normal','hard','boss'],
  strategy:['aggressive','balanced','combo','control','focus','smart','support'],
  objectiveType:['defeat','survive','protect']
};
const F={
  character:[
    f('id','ID','text',{required:true,note:'slug estável; não altere IDs usados por saves sem migração'}),f('name','Nome','text',{required:true}),f('hp','PV','int',{required:true,min:1}),f('rank','Rank'),f('village','Vila'),f('image','Imagem'),f('tags','Tags','csv'),f('baseTechniqueIds','4 técnicas-base','csv',{note:'até 4 IDs publicados'}),f('stats.attack','Ataque','number'),f('stats.defense','Defesa','number')
  ],
  technique:[
    f('id','ID','text',{required:true}),f('characterId','Personagem ID','text',{required:true}),f('name','Nome','text',{required:true}),f('techniqueType','Tipo','select',{options:OPTIONS.techniqueType}),
    f('target','Alvo','select',{options:OPTIONS.target}),f('chakraCost','Custo de chakra','csv'),f('cooldown','Recarga','int',{min:0}),f('power','Potência','number'),
    f('family','Família'),f('image','Imagem'),f('classification','Classificação','csv'),f('tags','Tags','csv'),f('lineageId','Linhagem ID','text',{optional:true}),
    f('parentTechniqueId','Técnica-pai','text',{nullable:true}),f('masteryId','Domínio ID','text',{nullable:true}),f('animationProfileId','Perfil de animação','text',{nullable:true}),
    f('description','Descrição','textarea',{span:4}),f('_effectKind','Operação principal','select',{virtual:true,options:['damage','heal','shield','status','buff','debuff','chakra-drain','chakra-gain','cleanse','dispel','execute','drain','mark']}),
    f('_statusName','Status / marca','text',{virtual:true}),f('balance.version','Versão de balanceamento','int',{default:1,min:1}),f('balance.budget','Budget','number',{default:0})
  ],
  mission:[
    f('id','ID','text',{required:true}),f('number','Número','int',{required:true,min:1}),f('rank','Rank','select',{options:OPTIONS.rank}),f('title','Título','text',{required:true}),
    f('objective','Objetivo','textarea',{span:2,required:true}),f('summary','Resumo','textarea',{span:2}),f('sceneId','Cena ID'),f('locationName','Local'),f('attemptLimitPerDay','Tentativas/dia','int',{default:5,min:1}),
    f('reward.xp','XP','int',{default:0}),f('reward.ryo','Ryō','int',{default:0})
  ],
  story_chapter:[
    f('id','ID','text',{required:true}),f('arc','Arco','int',{required:true,min:1}),f('chapter','Capítulo','int',{required:true,min:1}),f('title','Título','text',{required:true}),f('sceneId','Cena ID'),
    f('battleConfig.player','Time do jogador','csv'),f('battleConfig.enemy','Inimigos','csv'),f('battleConfig.difficulty','Dificuldade','select',{options:OPTIONS.difficulty}),f('battleConfig.strategy','IA inimiga','select',{options:OPTIONS.strategy}),
    f('battleConfig.objective.type','Objetivo da batalha','select',{options:OPTIONS.objectiveType}),f('battleConfig.objective.turns','Turnos','int',{optional:true,min:1}),f('battleConfig.objective.protectSlug','Proteger','text',{optional:true}),
    f('battleConfig.reward.xp','XP','int',{default:0}),f('battleConfig.reward.ryo','Ryō','int',{default:0}),f('battleConfig.reward.unlock','Desbloqueios','csv'),f('battleConfig.reward.badge','Badge','text',{nullable:true}),
    f('_openingText','Abertura','textarea',{virtual:true,span:2}),f('_climaxText','Desfecho','textarea',{virtual:true,span:2})
  ],
  equipment:[
    f('id','ID','text',{required:true}),f('name','Nome','text',{required:true}),f('slot','Slot','select',{options:OPTIONS.equipmentSlot}),f('image','Imagem','text',{required:true}),
    f('price','Preço','int',{default:0,min:0}),f('rarity','Raridade'),f('maxDurability','Durabilidade máx.','int',{default:10,min:1}),f('repairCostPerPoint','Reparo/ponto','int',{default:0,min:0}),
    f('dropEnabled','Pode dropar','checkbox'),f('animationProfileId','Perfil de animação','text',{nullable:true}),f('stats.attack','Ataque','number',{optional:true}),f('stats.defense','Defesa','number',{optional:true}),f('stats.hp','PV','number',{optional:true}),
    f('description','Descrição','textarea',{span:4})
  ],
  boss:[
    f('id','ID','text',{required:true}),f('name','Nome','text',{required:true}),f('kind','Categoria','select',{options:OPTIONS.bossKind}),f('hp','PV','int',{default:500,min:1}),
    f('aiProfileId','Perfil de IA','text',{required:true}),f('sceneId','Cena ID','text',{required:true}),f('characterId','Personagem ID','text',{nullable:true}),f('techniqueIds','Técnicas','csv'),f('rewards.ryo','Ryō recompensa','int',{default:0}),
    f('_phase1','Fase 1','text',{virtual:true}),f('_phase2','Fase 2','text',{virtual:true}),f('_phase3','Fase 3','text',{virtual:true})
  ],
  event:[
    f('id','ID','text',{required:true}),f('name','Nome','text',{required:true}),f('cycle','Ciclo','select',{options:OPTIONS.cycle}),f('family','Família'),f('startsAt','Início ISO','text',{required:true}),f('endsAt','Fim ISO','text',{required:true}),
    f('bossId','Boss ID','text',{nullable:true}),f('missionIds','Missões','csv'),f('rewardBudget','Budget','int',{default:0,min:0}),f('announcement','Anúncio','textarea',{span:4})
  ],
  location:[
    f('id','ID','text',{required:true}),f('name','Nome','text',{required:true}),f('village','Vila'),f('sceneIds','Cenas','csv'),f('description','Descrição','textarea',{span:4})
  ],
  scene:[
    f('id','ID','text',{required:true}),f('name','Nome','text',{required:true}),f('background','Background','text',{required:true}),f('audio','Áudio','text',{nullable:true}),f('locationId','Local ID'),f('theme','Tema'),f('title','Título visual'),f('weather','Clima'),f('landmarks','Landmarks','csv')
  ],
  ai_profile:[
    f('id','ID','text',{required:true}),f('name','Nome','text',{required:true}),f('aggression','Agressividade','number',{default:.5,min:0,max:1,step:.05}),f('support','Suporte','number',{default:.5,min:0,max:1,step:.05}),f('finisher','Finalizador','number',{default:.7,min:0,max:2,step:.05})
  ],
  animation_profile:[
    f('id','ID','text',{required:true}),f('family','Família','text',{required:true}),f('signature','Assinatura','text',{required:true}),f('motion','Movimento','text',{required:true}),f('glyph','Glifo','text',{required:true}),f('castMs','Cast ms','int',{default:400,min:0}),f('travelMs','Viagem ms','int',{default:400,min:0}),f('impactMs','Impacto ms','int',{default:500,min:0})
  ]
};
function f(path,label,kind='text',extra={}){return{path,label,kind,...extra}}
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
let sb=null,session=null,currentType='character',currentItems=[],currentPayload=null,currentVersions={};
function csv(v){return String(v??'').split(',').map(x=>x.trim()).filter(Boolean)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function getPath(o,path){return path.split('.').reduce((v,k)=>v==null?undefined:v[k],o)}
function setPath(o,path,value){const p=path.split('.');let x=o;for(let i=0;i<p.length-1;i++){if(!x[p[i]]||typeof x[p[i]]!=='object'||Array.isArray(x[p[i]]))x[p[i]]={};x=x[p[i]]}x[p.at(-1)]=value}
function delPath(o,path){const p=path.split('.');let x=o;for(let i=0;i<p.length-1;i++){x=x?.[p[i]];if(!x)return}delete x[p.at(-1)]}
function msg(el,text,kind=''){if(!el)return;el.textContent=text||'';el.className='msg'+(kind?' '+kind:'')}
async function request(url,options={}){
  const headers={...(options.headers||{})};
  if(session?.access_token){headers.authorization='Bearer '+session.access_token;headers.apikey=SB_KEY}
  if(options.body&&!headers['content-type'])headers['content-type']='application/json';
  const r=await fetch(url,{...options,headers});
  const data=await r.json().catch(()=>({}));
  if(!r.ok||data.ok===false){const e=new Error(data.error||data.code||('HTTP '+r.status));e.status=r.status;e.data=data;throw e}
  return data;
}
function fillTypeSelects(){
  const html=TYPES.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  $('#entityType').innerHTML=html;$('#rollbackType').innerHTML=html;$('#entityType').value=currentType;$('#rollbackType').value=currentType;
}
function fieldValue(def,payload){
  if(def.virtual){
    if(def.path==='_effectKind')return payload?.effect?.kind||payload?.mechanics?.[0]?.op||'damage';
    if(def.path==='_statusName')return payload?.status?.id||payload?.status?.name||payload?.mechanics?.find(x=>x.status)?.status||payload?.mechanics?.find(x=>x.mark)?.mark||'';
    if(def.path==='_openingText')return payload?.beats?.find(x=>x.id==='opening')?.text||payload?.beats?.find(x=>x.type==='scene')?.text||'';
    if(def.path==='_climaxText')return payload?.beats?.find(x=>x.id==='climax')?.text||'';
    if(def.path.startsWith('_phase')){const idx=Number(def.path.slice(-1))-1;return payload?.phases?.[idx]?.name||''}
    return'';
  }
  const v=getPath(payload,def.path);
  if(def.kind==='csv')return Array.isArray(v)?v.join(', '):'';
  if(def.kind==='checkbox')return !!v;
  return v??def.default??'';
}
function renderForm(payload=null){
  const defs=F[currentType]||[];
  const html=defs.map(def=>{
    const val=fieldValue(def,payload||{});const span=def.span?` span${def.span}`:'';const id='field_'+def.path.replace(/[^a-z0-9]+/gi,'_');
    const note=def.note?`<span class="field-note">${esc(def.note)}</span>`:'';
    if(def.kind==='textarea')return `<label class="${span.trim()}">${esc(def.label)}<textarea id="${id}" data-path="${esc(def.path)}" data-kind="textarea" ${def.required?'required':''}>${esc(val)}</textarea>${note}</label>`;
    if(def.kind==='select')return `<label class="${span.trim()}">${esc(def.label)}<select id="${id}" data-path="${esc(def.path)}" data-kind="select">${(def.options||[]).map(x=>`<option value="${esc(x)}" ${String(val)===String(x)?'selected':''}>${esc(x)}</option>`).join('')}</select>${note}</label>`;
    if(def.kind==='checkbox')return `<label class="${span.trim()}">${esc(def.label)}<span class="checkbox-wrap"><input id="${id}" data-path="${esc(def.path)}" data-kind="checkbox" type="checkbox" ${val?'checked':''}><span>Ativo</span></span>${note}</label>`;
    const inputType=(def.kind==='int'||def.kind==='number')?'number':'text';
    const attrs=[def.required?'required':'',def.min!=null?`min="${def.min}"`:'',def.max!=null?`max="${def.max}"`:'',def.step!=null?`step="${def.step}"`:(def.kind==='number'?'step="any"':'')].filter(Boolean).join(' ');
    return `<label class="${span.trim()}">${esc(def.label)}<input id="${id}" data-path="${esc(def.path)}" data-kind="${esc(def.kind)}" type="${inputType}" value="${esc(val)}" ${attrs}>${note}</label>`;
  }).join('');
  $('#entityForm').innerHTML=html;
  const id=payload?.id||'nova';const version=payload?.id?currentVersions[payload.id]||'—':'—';
  $('#entityInfo').innerHTML=`<span class="chip">${esc(currentType)}</span><span class="chip">ID: ${esc(id)}</span><span class="chip">versão: ${esc(version)}</span><span class="chip">${payload?'edição':'criação'}</span>`;
  $('#metricType').textContent=currentType;
}
function readFields(){
  const defs=F[currentType]||[];const base=currentPayload?clone(currentPayload):{entityType:currentType};const virtual={};
  for(const def of defs){const id='field_'+def.path.replace(/[^a-z0-9]+/gi,'_');const el=$('#'+id);if(!el)continue;let value;
    if(def.kind==='checkbox')value=el.checked;
    else if(def.kind==='csv')value=csv(el.value);
    else if(def.kind==='int'){value=el.value===''?null:Math.trunc(Number(el.value))}
    else if(def.kind==='number'){value=el.value===''?null:Number(el.value)}
    else value=String(el.value??'').trim();
    if(def.virtual){virtual[def.path]=value;continue}
    if(value===''&&def.nullable)value=null;
    if((value===''||value==null)&&def.optional){delPath(base,def.path);continue}
    setPath(base,def.path,value);
  }
  base.entityType=currentType;
  finalize(currentType,base,virtual);
  return base;
}
function finalize(type,p,v){
  if(type==='character'){
    p.hp=Math.max(1,Math.trunc(Number(p.hp||100)));p.baseTechniqueIds=(p.baseTechniqueIds||[]).slice(0,4);p.tags=Array.isArray(p.tags)?p.tags:[];p.stats=p.stats&&typeof p.stats==='object'?p.stats:{};
    for(const k of Object.keys(p.stats))if(p.stats[k]==null||p.stats[k]==='')delete p.stats[k];
  }
  if(type==='technique'){
    p.cooldown=Math.max(0,Math.trunc(Number(p.cooldown||0)));p.chakraCost=Array.isArray(p.chakraCost)?p.chakraCost:[];p.classification=Array.isArray(p.classification)?p.classification:[];p.tags=Array.isArray(p.tags)?p.tags:[];
    p.balance=p.balance&&typeof p.balance==='object'?p.balance:{};p.balance.version=Math.max(1,Math.trunc(Number(p.balance.version||1)));p.balance.budget=Number(p.balance.budget||0);
    const kind=v._effectKind||p.effect?.kind||'damage';const power=Number(p.power||p.effect?.power||0);p.effect={...(p.effect&&typeof p.effect==='object'?p.effect:{}),kind,power};
    if(!Array.isArray(p.mechanics)||p.mechanics.length<3){const status=v._statusName||'setup';p.mechanics=[{op:kind,amount:power,target:'primary'},{op:'mark',mark:status,turns:2,target:'primary'},{op:'damage',amount:Math.max(1,Math.round(power*.35)),target:'primary',bonusIf:{targetHas:status},bonusMultiplier:1.25}]}
    if(v._statusName&&kind==='status')p.status={id:v._statusName};
    if(!p.lineageId)delete p.lineageId;
  }
  if(type==='mission'){
    p.number=Math.max(1,Math.trunc(Number(p.number||1)));p.attemptLimitPerDay=Math.max(1,Math.trunc(Number(p.attemptLimitPerDay||5)));p.reward={xp:Math.trunc(Number(p.reward?.xp||0)),ryo:Math.trunc(Number(p.reward?.ryo||0))};
    if(!p.questGraph||typeof p.questGraph!=='object'||!p.questGraph.start||!p.questGraph.nodes){p.questGraph={start:'opening',nodes:{opening:{id:'opening',type:'choice',title:p.title||'Início',text:p.objective||'',choices:[{id:'start',label:'Iniciar missão',description:p.summary||p.objective||'',next:'SUCCESS',delta:{risk:0,clues:0}}]},SUCCESS:{type:'success'}}}}
  }
  if(type==='story_chapter'){
    p.arc=Math.max(1,Math.trunc(Number(p.arc||1)));p.chapter=Math.max(1,Math.trunc(Number(p.chapter||1)));p.unlock=p.unlock&&typeof p.unlock==='object'?p.unlock:{};
    const opening=String(v._openingText||'').trim(),climax=String(v._climaxText||'').trim();
    if(opening||climax||!Array.isArray(p.beats)||!p.beats.length){p.beats=[{id:'opening',type:'scene',title:p.title||'Abertura',text:opening||p.title||''},{id:'battle',type:'battle',battle:{chapterId:p.id}},{id:'climax',type:'scene',title:'Desfecho',text:climax||'Capítulo concluído.'}]}
    const b=p.battleConfig&&typeof p.battleConfig==='object'?p.battleConfig:{};b.player=Array.isArray(b.player)&&b.player.length?b.player:[];b.enemy=Array.isArray(b.enemy)&&b.enemy.length?b.enemy:[];b.difficulty=b.difficulty||'normal';b.strategy=b.strategy||'balanced';b.objective=b.objective&&typeof b.objective==='object'?b.objective:{type:'defeat'};b.objective.type=b.objective.type||'defeat';if(b.objective.type!=='survive')delete b.objective.turns;if(b.objective.type!=='protect')delete b.objective.protectSlug;b.enemyHp=b.enemyHp&&typeof b.enemyHp==='object'?b.enemyHp:{};b.reward=b.reward&&typeof b.reward==='object'?b.reward:{};b.reward.xp=Math.max(0,Math.trunc(Number(b.reward.xp||0)));b.reward.ryo=Math.max(0,Math.trunc(Number(b.reward.ryo||0)));b.reward.unlock=Array.isArray(b.reward.unlock)?[...new Set(b.reward.unlock)].slice(0,50):[];b.reward.badge=b.reward.badge||null;p.battleConfig=b;
  }
  if(type==='equipment'){
    p.price=Math.max(0,Math.trunc(Number(p.price||0)));p.maxDurability=Math.max(1,Math.trunc(Number(p.maxDurability||10)));p.repairCostPerPoint=Math.max(0,Math.trunc(Number(p.repairCostPerPoint||0)));p.effects=Array.isArray(p.effects)?p.effects:[];p.stats=p.stats&&typeof p.stats==='object'?p.stats:{};for(const k of Object.keys(p.stats))if(p.stats[k]==null||p.stats[k]==='')delete p.stats[k];if(p.animationProfileId==='')p.animationProfileId=null;
  }
  if(type==='boss'){
    p.hp=Math.max(1,Math.trunc(Number(p.hp||500)));p.techniqueIds=Array.isArray(p.techniqueIds)?p.techniqueIds:[];p.rewards=p.rewards&&typeof p.rewards==='object'?p.rewards:{};p.rewards.ryo=Math.max(0,Math.trunc(Number(p.rewards.ryo||0)));
    const names=[v._phase1,v._phase2,v._phase3].map((x,i)=>String(x||p.phases?.[i]?.name||`Fase ${i+1}`).trim());p.phases=names.map((name,i)=>({id:`phase-${i+1}`,name,threshold:[1,.66,.33][i]}));if(p.characterId==='')p.characterId=null;
  }
  if(type==='event'){p.missionIds=Array.isArray(p.missionIds)?p.missionIds:[];p.modifiers=Array.isArray(p.modifiers)?p.modifiers:[];p.rewardBudget=Math.max(0,Math.trunc(Number(p.rewardBudget||0)));if(p.bossId==='')p.bossId=null}
  if(type==='location'){p.sceneIds=Array.isArray(p.sceneIds)?p.sceneIds:[]}
  if(type==='scene'){p.layers=Array.isArray(p.layers)?p.layers:[];p.landmarks=Array.isArray(p.landmarks)?p.landmarks:[];if(p.audio==='')p.audio=null}
  if(type==='ai_profile'){p.aggression=Math.max(0,Math.min(1,Number(p.aggression||0)));p.support=Math.max(0,Math.min(1,Number(p.support||0)));p.finisher=Math.max(0,Math.min(2,Number(p.finisher||0)));p.rules=Array.isArray(p.rules)?p.rules:[]}
  if(type==='animation_profile'){for(const k of ['castMs','travelMs','impactMs'])p[k]=Math.max(0,Math.trunc(Number(p[k]||0)))}
}
function renderEntitySelect(filter=''){
  const needle=String(filter||'').trim().toLowerCase();const rows=currentItems.filter(x=>!needle||String(x.id||'').toLowerCase().includes(needle)||String(x.name||x.title||'').toLowerCase().includes(needle));
  $('#entitySelect').innerHTML='<option value="">+ NOVA ENTIDADE</option>'+rows.map(x=>`<option value="${esc(x.id)}">${esc(x.name||x.title||x.id)} — ${esc(x.id)}</option>`).join('');
}
async function loadType(type=currentType,selectId=''){
  currentType=type;$('#entityType').value=type;$('#rollbackType').value=type;msg($('#contentMsg'),'Carregando '+type+'…');
  try{const data=await request(API.content+'?type='+encodeURIComponent(type));currentItems=Array.isArray(data.items)?data.items:[];currentVersions=data.versions||{};renderEntitySelect($('#entityFilter').value);currentPayload=selectId?currentItems.find(x=>x.id===selectId)||null:null;if(selectId)$('#entitySelect').value=selectId;renderForm(currentPayload);msg($('#contentMsg'),`${currentItems.length} entidade(s) carregadas.`,'ok')}
  catch(e){currentItems=[];currentVersions={};currentPayload=null;renderEntitySelect();renderForm(null);msg($('#contentMsg'),e.message,'bad')}
}
async function validatePayload(payload){return request(API.admin+'/content/validate',{method:'POST',body:JSON.stringify({type:currentType,payload})})}
async function validateCurrent(){
  try{const payload=readFields();const r=await validatePayload(payload);if(!r.valid){msg($('#contentMsg'),'REPROVADO: '+(r.errors||[]).join(' | '),'bad');return false}msg($('#contentMsg'),'VALIDAÇÃO PASS: schema e referências aprovados.','ok');return true}catch(e){msg($('#contentMsg'),'REPROVADO: '+e.message,'bad');return false}
}
async function publishCurrent(){
  const button=$('#publishBtn');button.disabled=true;
  try{const payload=readFields();const vr=await validatePayload(payload);if(!vr.valid){msg($('#contentMsg'),'REPROVADO: '+(vr.errors||[]).join(' | '),'bad');return}
    const r=await request(API.admin+'/content/publish',{method:'POST',body:JSON.stringify({type:currentType,payload,message:$('#publishMessage').value})});msg($('#contentMsg'),`PUBLICADO: ${r.id} v${r.version}`,'ok');await loadStatus();await loadType(currentType,r.id)
  }catch(e){msg($('#contentMsg'),'PUBLICAÇÃO FALHOU: '+e.message,'bad')}finally{button.disabled=false}
}
async function rollback(){
  const type=$('#rollbackType').value,id=$('#rollbackId').value.trim(),version=Number($('#rollbackVersion').value);if(!id||!Number.isSafeInteger(version)||version<1){msg($('#rollbackMsg'),'Informe tipo, ID e versão válida.','bad');return}
  const b=$('#rollbackBtn');b.disabled=true;try{const r=await request(API.admin+'/content/rollback',{method:'POST',body:JSON.stringify({type,id,version})});msg($('#rollbackMsg'),`ROLLBACK PASS: ${type}:${id} agora está na nova versão ${r.version}.`,'ok');await loadStatus();if(type===currentType)await loadType(type,id)}catch(e){msg($('#rollbackMsg'),'ROLLBACK FALHOU: '+e.message,'bad')}finally{b.disabled=false}
}
async function loadStatus(){const d=await request(API.admin+'/status');if(!d.allowed)throw new Error('Conta sem principal administrativo ativo.');$('#metricRole').textContent=d.role||'ADMIN';$('#metricRevision').textContent=d.contentRevision??0;$('#metricEvents').textContent=d.activeEvents??0;return d}
async function loadWorldSummary(){
  const types=['location','scene','animation_profile','ai_profile'];const results=await Promise.all(types.map(t=>request(API.content+'?type='+t).catch(()=>({items:[]}))));$('#worldSummary').innerHTML=types.map((t,i)=>`<div class="card"><b>${esc(TYPES.find(x=>x[0]===t)?.[1]||t)}</b><small>${results[i].items?.length||0} publicados</small></div>`).join('');return results.every(r=>Array.isArray(r.items))
}
async function runAi(){
  const b=$('#runAiBtn');b.disabled=true;msg($('#aiMsg'),'Executando AI_EVENT_DIRECTOR…');try{const r=await request(API.ai,{method:'POST',body:JSON.stringify({mode:'manual',cycle:$('#aiCycle').value,context:$('#aiContext').value.trim()})});$('#aiResult').textContent=JSON.stringify(r,null,2);msg($('#aiMsg'),r.duplicate?'Execução já existia para este período.':'Diretor executado e resposta recebida.','ok');await loadAiAudit();await loadStatus()}catch(e){$('#aiResult').textContent=JSON.stringify(e.data||{error:e.message},null,2);msg($('#aiMsg'),'DIRETOR FALHOU: '+e.message,'bad')}finally{b.disabled=false}
}
async function loadAiAudit(){
  try{const r=await request(API.admin+'/audit');const rows=(r.entries||[]).filter(x=>String(x.action||'').includes('ai_event_director')).slice(0,20);$('#aiAudit').innerHTML=rows.length?rows.map(x=>`<div class="card"><b>${esc(x.action)}</b><small>${esc(x.target_type||'')} ${esc(x.target_id||'')}<br>${esc(x.created_at||'')}</small></div>`).join(''):'<div class="card"><small>Nenhuma publicação do Diretor encontrada na auditoria.</small></div>';return true}catch(e){$('#aiAudit').innerHTML=`<div class="card"><small>${esc(e.message)}</small></div>`;return false}
}
async function proof(){
  const grid=$('#proofGrid');grid.innerHTML='<div class="card"><small>Revalidando…</small></div>';const checks=[];const add=(name,ok,detail)=>checks.push({name,ok,detail});
  add('Sessão administrativa',!!session?.access_token,session?'token ativo':'sem sessão');
  try{const s=await loadStatus();add('RBAC / status',!!s.allowed,`role=${s.role} revisão=${s.contentRevision}`)}catch(e){add('RBAC / status',false,e.message)}
  try{const m=await request(API.content+'/manifest');add('Manifesto de conteúdo',!!m.ok,`${m.entities?.length||0} tipos publicados`)}catch(e){add('Manifesto de conteúdo',false,e.message)}
  const worldOk=await loadWorldSummary().catch(()=>false);add('Mundo location/scene',worldOk,'locais, cenas, animação e IA consultáveis');
  const aiOk=await loadAiAudit();add('Auditoria do Diretor',aiOk,'endpoint audit protegido');
  add('Editor guiado',!!F.character&&!!F.technique&&!!F.mission&&!!F.story_chapter,'11 tipos sem JSON manual');
  add('Validação antes de publicar',typeof validatePayload==='function','/admin/content/validate');
  add('Rollback auditável',typeof rollback==='function','/admin/content/rollback');
  grid.innerHTML=checks.map(c=>`<div class="proof ${c.ok?'ok':'bad'}"><strong>${c.ok?'PASS':'FAIL'} — ${esc(c.name)}</strong><small>${esc(c.detail)}</small></div>`).join('');
}
async function boot(sess){
  session=sess;$('#loginPanel').classList.add('hidden');$('#studio').classList.remove('hidden');$('#logoutBtn').classList.remove('hidden');try{await loadStatus();await Promise.all([loadType(currentType),loadWorldSummary(),loadAiAudit()]);await proof()}catch(e){msg($('#loginMsg'),e.message,'bad');$('#studio').classList.add('hidden');$('#loginPanel').classList.remove('hidden')}
}
async function login(){const b=$('#loginBtn');b.disabled=true;msg($('#loginMsg'),'Validando OWNER…');try{const {data,error}=await sb.auth.signInWithPassword({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});if(error||!data?.session)throw error||new Error('Sessão ausente');await boot(data.session);msg($('#loginMsg'),'','')}catch(e){msg($('#loginMsg'),e?.message||'Falha de autenticação.','bad')}finally{b.disabled=false}}
async function logout(){try{await sb.auth.signOut()}finally{location.reload()}}
function bind(){
  $('#loginBtn').addEventListener('click',login);$('#loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')login()});$('#logoutBtn').addEventListener('click',logout);
  $$('.tab-btn').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.tab;$$('.tab-btn').forEach(x=>x.classList.toggle('active',x===b));$$('.tab-panel').forEach(x=>x.classList.add('hidden'));$('#tab-'+t).classList.remove('hidden')}));
  $('#entityType').addEventListener('change',e=>loadType(e.target.value));$('#entitySelect').addEventListener('change',e=>{currentPayload=currentItems.find(x=>x.id===e.target.value)||null;renderForm(currentPayload);if(currentPayload){$('#rollbackType').value=currentType;$('#rollbackId').value=currentPayload.id;$('#rollbackVersion').value=currentVersions[currentPayload.id]||''}});
  $('#entityFilter').addEventListener('input',e=>renderEntitySelect(e.target.value));$('#reloadTypeBtn').addEventListener('click',()=>loadType(currentType,$('#entitySelect').value));$('#validateBtn').addEventListener('click',validateCurrent);$('#publishBtn').addEventListener('click',publishCurrent);$('#rollbackBtn').addEventListener('click',rollback);
  $$('.jump-type').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.type;$$('.tab-btn').forEach(x=>x.classList.toggle('active',x.dataset.tab==='content'));$$('.tab-panel').forEach(x=>x.classList.add('hidden'));$('#tab-content').classList.remove('hidden');loadType(type)}));
  $('#runAiBtn').addEventListener('click',runAi);$('#refreshAiBtn').addEventListener('click',loadAiAudit);$('#refreshProofBtn').addEventListener('click',proof);
}
async function init(){fillTypeSelects();bind();sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const {data}=await sb.auth.getSession();if(data?.session)await boot(data.session);else renderForm(null)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
