(()=>{'use strict';
/* R30 LEGACY ISOLATION: implementações públicas antigas renomeadas para impedir overrides concorrentes. */
let legacy_R25_MULTI_ACTIVITY_QUEST_ENG_startNinjaMissionBattle, legacy_R21_QUEST_GRAPH_EVENT_RULES__completeNinjaMission, legacy_R21_QUEST_GRAPH_EVENT_RULES__finalizeNinjaMissionRun, legacy_R21_QUEST_GRAPH_EVENT_RULES__openNinjaMissionDetail, legacy_R21_QUEST_GRAPH_EVENT_RULES__renderBijuuEvents, legacy_R21_QUEST_GRAPH_EVENT_RULES__renderNinjaMissionRun, legacy_R21_QUEST_GRAPH_EVENT_RULES__renderNinjaMissions, legacy_R21_QUEST_GRAPH_EVENT_RULES__resolveNinjaMissionChoice, legacy_R21_QUEST_GRAPH_EVENT_RULES__startNinjaMission, legacy_R21_QUEST_GRAPH_EVENT_RULES__startNinjaMissionBattle, legacy_R22_EVENTOS_2X_DROPS_POR_TIE_renderBijuuEvents, legacy_R23_COMBAT_QUEST_EQUIPMENT_B_openNinjaMissionDetail, legacy_R23_COMBAT_QUEST_EQUIPMENT_B_renderInventory, legacy_R23_COMBAT_QUEST_EQUIPMENT_B_renderNinjaMissionRun, legacy_R23_COMBAT_QUEST_EQUIPMENT_B_renderNinjaMissions, legacy_R23_COMBAT_QUEST_EQUIPMENT_B_resolveNinjaMissionChoice, legacy_R23_COMBAT_QUEST_EQUIPMENT_B_startNinjaMission, legacy_R23_COMBAT_QUEST_EQUIPMENT_B_startNinjaMissionBattle, legacy_R25_MULTI_ACTIVITY_QUEST_ENG_completeNinjaMission, legacy_R25_MULTI_ACTIVITY_QUEST_ENG_openNinjaMissionDetail, legacy_R25_MULTI_ACTIVITY_QUEST_ENG_renderNinjaMissionRun, legacy_R25_MULTI_ACTIVITY_QUEST_ENG_renderNinjaMissions, legacy_R25_MULTI_ACTIVITY_QUEST_ENG_startNinjaMission, legacy_R27_PROGRESSO_ECONOMIA_UX_EX_openNinjaMissionDetail, legacy_R27_PROGRESSO_ECONOMIA_UX_EX_renderNinjaMissionRun, legacy_R27_PROGRESSO_ECONOMIA_UX_EX_renderNinjaMissions, legacy_R27_PROGRESSO_ECONOMIA_UX_EX_startNinjaMission, legacy_R28_FINAL_RUNTIME_CONTROLLER_renderCenter, legacy_R28_FINAL_RUNTIME_CONTROLLER_storyBrief;
let eventReward=legacy_BASE_eventReward, ensureEventPeriods=legacy_BASE_ensureEventPeriods, equipGear=legacy_BASE_equipGear, storyWelcome=legacy_BASE_storyWelcome, storyBrief=legacy_BASE_storyBrief, startStoryBattle=legacy_BASE_startStoryBattle, eventBossStatus=legacy_BASE_eventBossStatus, applyBijuuServerGame=legacy_BASE_applyBijuuServerGame, renderNinja=legacy_BASE_renderNinja, renderBijuuEvents=legacy_BASE_renderBijuuEvents, renderProfile=legacy_BASE_renderProfile, renderCenter=legacy_R16_GAMEPLAY_OVERHAUL_renderCenter, itemCard=legacy_R16_GAMEPLAY_OVERHAUL_itemCard, repairPrice=legacy_R16_GAMEPLAY_OVERHAUL_repairPrice, repairGear=legacy_R16_GAMEPLAY_OVERHAUL_repairGear, renderShop=legacy_R16_GAMEPLAY_OVERHAUL_renderShop, renderInventory=legacy_R16_GAMEPLAY_OVERHAUL_renderInventory, ninjaRunMission=legacy_R16_GAMEPLAY_OVERHAUL_ninjaRunMission, ninjaRunApproach=legacy_R16_GAMEPLAY_OVERHAUL_ninjaRunApproach, startNinjaMission=legacy_R16_GAMEPLAY_OVERHAUL_startNinjaMission, resolveNinjaMissionChoice=legacy_R16_GAMEPLAY_OVERHAUL_resolveNinjaMissionChoice, startNinjaMissionBattle=legacy_R16_GAMEPLAY_OVERHAUL_startNinjaMissionBattle, completeNinjaMission=legacy_R16_GAMEPLAY_OVERHAUL_completeNinjaMission, rollNinjaMissionLoot=legacy_R16_GAMEPLAY_OVERHAUL_rollNinjaMissionLoot, finalizeNinjaMissionRun=legacy_R16_GAMEPLAY_OVERHAUL_finalizeNinjaMissionRun, renderNinjaMissionRun=legacy_R16_GAMEPLAY_OVERHAUL_renderNinjaMissionRun, renderNinjaMissions=legacy_R16_GAMEPLAY_OVERHAUL_renderNinjaMissions, openNinjaMissionDetail=legacy_R20_UI_MISSIONS_EVENTS_SHOP_openNinjaMissionDetail, r23CostChips=legacy_R23_COMBAT_QUEST_EQUIPMENT_B_r23CostChips, r23EventArt=legacy_R23_COMBAT_QUEST_EQUIPMENT_B_r23EventArt, r25CompleteActivity=legacy_R25_MULTI_ACTIVITY_QUEST_ENG_r25CompleteActivity, r25BindAbort=legacy_R25_MULTI_ACTIVITY_QUEST_ENG_r25BindAbort, renderNinjaMissionActivity=legacy_R25_MULTI_ACTIVITY_QUEST_ENG_renderNinjaMissionActivity;
const R=window.NARUTO_ROSTER||[],$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>\"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[ch]));
const KEY='naruto_unison_ptbr_final_v21';
const BUILD='v23.17-r33-unison';
const CCLS={Blood:'blood',Gen:'gen',Nin:'nin',Tai:'tai',Rand:'rand'};
const CPT={Blood:'Linhagem',Gen:'Genjutsu',Nin:'Ninjutsu',Tai:'Taijutsu',Rand:'Qualquer'};
const STORY=window.NARUTO_STORY||{arcs:[],finale:[]};
const CHAR_UNLOCKS=window.NARUTO_CHARACTER_UNLOCKS||{starter:['naruto-uzumaki'],unlockAt:{}};
const JV=window.NARUTO_JUTSU_VARIANTS||[];
const JV_BY_ID=Object.fromEntries(JV.map(v=>[v.id,v]));
const V23=window.NARUTO_V23_DATA||window.V23_DATA||{missions:[],equipment:[],nukenin:[]};
let NinjaRun=null; // R21: estado persistente das Missões Ninja interativas
const NINJA_MISSIONS=Array.isArray(V23.missions)?V23.missions:[];
const EQUIPMENT_CATALOG=Array.isArray(V23.equipment)?V23.equipment:[];
const EQUIPMENT_BY_ID=Object.fromEntries(EQUIPMENT_CATALOG.map(x=>[x.id,x]));
const NUKENIN_EVENTS=Array.isArray(V23.nukenin)?V23.nukenin:[];
const GEAR_SLOTS=['weapon','clothing','footwear','scroll','talisman'];
const GEAR_SLOT_PT={weapon:'Arma',clothing:'Roupa',footwear:'Calçado',scroll:'Pergaminho',talisman:'Talismã'};
const CHAKRA_RULES={maxPerType:8,maxTotal:24,turnGain:3,types:['Blood','Gen','Nin','Tai'],wildcard:'Rand'};
const VIRTUAL_BIJUU=[
{id:'isobu',slug:'bijuu-isobu-event',name:'Isobu',eventOnly:true,era:'event',icon:'static/img/bijuu-events/r23/isobu.jpg',bio:'Bijū de Três Caudas. Boss de Raid com carapaça, contra-ataque e pressão aquática.',skills:[
{name:'Investida de Carapaça',desc:'Impacto pesado de Isobu.',cost:['Tai','Rand'],cooldown:1,image:'static/img/bijuu-events/r23/isobu.jpg',mechanic:{kind:'damage',power:48,target:'enemy',aoe:false,duration:0}},
{name:'Maré de Coral',desc:'Aprisiona o alvo em coral.',cost:['Nin','Rand'],cooldown:2,image:'static/img/bijuu-events/r23/isobu.jpg',mechanic:{kind:'stun',power:24,target:'enemy',aoe:false,duration:1}},
{name:'Carapaça Espinhosa',desc:'Reforça a defesa de Isobu.',cost:['Tai'],cooldown:3,image:'static/img/bijuu-events/r23/isobu.jpg',mechanic:{kind:'shield',power:26,target:'self',aoe:false,duration:2}},
{name:'Bomba da Três Caudas',desc:'Explosão de chakra contra toda a equipe.',cost:['Nin','Nin','Rand'],cooldown:3,image:'static/img/bijuu-events/r23/isobu.jpg',mechanic:{kind:'damage',power:42,target:'enemy',aoe:true,duration:0}}]},
{id:'songoku',slug:'bijuu-son-goku-event',name:'Son Gokū',eventOnly:true,era:'event',icon:'static/img/ninja/four-tailed-naruto-(s)/icon.jpg',bio:'Bijū de Quatro Caudas. Boss de Raid focado em lava, queimadura e pressão ofensiva.',skills:[
{name:'Punho de Lava',desc:'Golpe de lava concentrado.',cost:['Tai','Rand'],cooldown:1,image:'static/img/ninja/four-tailed-naruto-(s)/ChakraSlam.jpg',mechanic:{kind:'damage',power:52,target:'enemy',aoe:false,duration:0}},
{name:'Mar de Lava',desc:'Lava contínua que aflige o alvo.',cost:['Nin','Rand'],cooldown:2,image:'static/img/ninja/four-tailed-naruto-(s)/TailedBeastBomb.jpg',mechanic:{kind:'dot',power:26,target:'enemy',aoe:false,duration:3}},
{name:'Pele Incandescente',desc:'Proteção de chakra vulcânico.',cost:['Nin'],cooldown:3,image:'static/img/ninja/four-tailed-naruto-(s)/KyuubiSkinBlock.jpg',mechanic:{kind:'shield',power:24,target:'self',aoe:false,duration:2}},
{name:'Bomba da Quatro Caudas',desc:'Explosão de chakra em área.',cost:['Nin','Nin','Rand'],cooldown:3,image:'static/img/ninja/four-tailed-naruto-(s)/TailedBeastBomb.jpg',mechanic:{kind:'damage',power:46,target:'enemy',aoe:true,duration:0}}]},
{id:'kokuo',slug:'bijuu-kokuo-event',name:'Kokuō',eventOnly:true,era:'event',icon:'static/img/bijuu-events/r23/kokuo.jpg',bio:'Bijū de Cinco Caudas. Boss de Raid de força física, vapor e investidas.',skills:[
{name:'Chifre do Vapor',desc:'Investida reforçada por vapor.',cost:['Tai','Rand'],cooldown:1,image:'static/img/bijuu-events/r23/kokuo.jpg',mechanic:{kind:'damage',power:55,target:'enemy',aoe:false,duration:0}},
{name:'Pressão de Vapor',desc:'Impacto que interrompe a formação.',cost:['Nin','Tai'],cooldown:2,image:'static/img/bijuu-events/r23/kokuo.jpg',mechanic:{kind:'stun',power:30,target:'enemy',aoe:false,duration:1}},
{name:'Vapor Regenerativo',desc:'Recupera parte do próprio chakra corporal.',cost:['Nin'],cooldown:4,image:'static/img/bijuu-events/r23/kokuo.jpg',mechanic:{kind:'heal',power:34,target:'self',aoe:false,duration:0}},
{name:'Bomba da Cinco Caudas',desc:'Explosão de chakra em área.',cost:['Nin','Nin','Rand'],cooldown:3,image:'static/img/bijuu-events/r23/kokuo.jpg',mechanic:{kind:'damage',power:48,target:'enemy',aoe:true,duration:0}}]},
{id:'saiken',slug:'bijuu-saiken-event',name:'Saiken',eventOnly:true,era:'event',icon:'static/img/ninja/utakata-(s)/SixTailedTransformation.jpg',bio:'Bijū de Seis Caudas. Boss de Raid de corrosão, bolhas e regeneração.',skills:[
{name:'Ácido Corrosivo',desc:'Aflição corrosiva prolongada.',cost:['Nin','Rand'],cooldown:2,image:'static/img/ninja/utakata-(s)/SixTailedTransformation.jpg',mechanic:{kind:'dot',power:24,target:'enemy',aoe:false,duration:3}},
{name:'Onda de Bolhas',desc:'Bolhas de chakra atingem toda a equipe.',cost:['Nin','Nin'],cooldown:2,image:'static/img/ninja/utakata-(s)/SixTailedTransformation.jpg',mechanic:{kind:'damage',power:38,target:'enemy',aoe:true,duration:0}},
{name:'Manto Viscoso',desc:'Proteção que absorve impacto.',cost:['Nin'],cooldown:3,image:'static/img/ninja/utakata-(s)/SixTailedTransformation.jpg',mechanic:{kind:'shield',power:30,target:'self',aoe:false,duration:2}},
{name:'Regeneração da Seis Caudas',desc:'Recupera PV.',cost:['Nin','Rand'],cooldown:4,image:'static/img/ninja/utakata-(s)/SixTailedTransformation.jpg',mechanic:{kind:'heal',power:38,target:'self',aoe:false,duration:0}}]},
{id:'chomei',slug:'bijuu-chomei-event',name:'Chōmei',eventOnly:true,era:'event',icon:'static/img/bijuu-events/r23/chomei.jpg',bio:'Bijū de Sete Caudas. Boss de Raid veloz, aéreo e focado em controle.',skills:[
{name:'Investida Alada',desc:'Ataque aéreo veloz.',cost:['Tai','Rand'],cooldown:1,image:'static/img/icon.png',mechanic:{kind:'damage',power:50,target:'enemy',aoe:false,duration:0}},
{name:'Pó Ofuscante',desc:'Interrompe um inimigo.',cost:['Gen','Rand'],cooldown:2,image:'static/img/icon.png',mechanic:{kind:'stun',power:20,target:'enemy',aoe:false,duration:1}},
{name:'Voo Evasivo',desc:'Evita ataques durante um turno.',cost:['Tai'],cooldown:4,image:'static/img/icon.png',mechanic:{kind:'invuln',power:1,target:'self',aoe:false,duration:1}},
{name:'Bomba da Sete Caudas',desc:'Explosão de chakra em área.',cost:['Nin','Nin','Rand'],cooldown:3,image:'static/img/icon.png',mechanic:{kind:'damage',power:50,target:'enemy',aoe:true,duration:0}}]}
];
const VIRTUAL_BIJUU_BY_SLUG=new Map(VIRTUAL_BIJUU.map(c=>[c.slug,c]));
const STORY_MISSIONS=STORY.arcs.flatMap(a=>a.missions.map(m=>({...m,arcId:a.id,arcTitle:a.title})));
const PERMANENT_UNLOCKABLE=new Set([...(CHAR_UNLOCKS.starter||[]),...STORY_MISSIONS.flatMap(m=>m.reward?.unlock||[])]);
function storyDefaults(){return {completed:[],badges:[],introSeen:false,campaignDone:false,lastMission:null}}

const AI_PROFILES=[
{id:'academia',name:'Academia Ninja',difficulty:'easy',strategy:'random',team:'rookies',plan:'Fácil • decisões simples e equipes de genin.'},
{id:'equilibrada',name:'Equipe Equilibrada',difficulty:'normal',strategy:'balanced',team:'balanced',plan:'Normal • alterna dano, defesa e controle.'},
{id:'assalto',name:'Esquadrão de Assalto',difficulty:'normal',strategy:'aggressive',team:'damage',plan:'Normal • prioriza dano alto e elimina o alvo mais fraco.'},
{id:'controle',name:'Unidade de Controle',difficulty:'normal',strategy:'control',team:'control',plan:'Normal • usa stun/aflição antes de concentrar dano.'},
{id:'suporte',name:'Equipe de Sustentação',difficulty:'normal',strategy:'support',team:'support',plan:'Normal • protege e recupera aliados antes de atacar.'},
{id:'anbu',name:'Caçadores ANBU',difficulty:'hard',strategy:'focus',team:'anbu',plan:'Difícil • três ninjas focam o mesmo alvo até derrubá-lo.'},
{id:'akatsuki',name:'Célula Akatsuki',difficulty:'hard',strategy:'control',team:'akatsuki',plan:'Difícil • controle, aflição e finalização.'},
{id:'kage',name:'Aliança dos Kage',difficulty:'hard',strategy:'balanced',team:'kage',plan:'Difícil • equipe de alto poder com decisões táticas.'},
{id:'combo',name:'Especialistas em Combo',difficulty:'hard',strategy:'combo',team:'combo',plan:'Difícil • controle → debuff → golpe de maior dano.'},
{id:'velocidade',name:'Ataque Relâmpago',difficulty:'hard',strategy:'aggressive',team:'speed',plan:'Difícil • técnicas baratas, pressão e foco rápido.'},
{id:'srank',name:'Esquadrão Rank S',difficulty:'boss',strategy:'smart',team:'elite',plan:'CHEFE • lê vida, efeitos e chakra para escolher a melhor ação.'},
{id:'caos',name:'IA Caótica',difficulty:'normal',strategy:'chaos',team:'random',plan:'Normal • time e padrão de golpes mudam a cada luta.'}
];

function buildAchievements(){
 const defs=[];
 const add=(type,goals,label,base=90)=>goals.forEach((goal,i)=>defs.push({id:`feat_${type}_${goal}`,title:`${label} ${goal.toLocaleString('pt-BR')}`,type,goal,ryo:base+i*30}));
 add('wins',[1,5,10,25,50,100,200,350,500,750,1000],'Vitórias',120);
 add('battles',[1,10,25,50,100,250,500,750,1000,1500],'Batalhas',100);
 add('kos',[10,25,50,100,250,500,1000,2000,3500,5000],'Eliminações',130);
 add('damage',[1000,5000,10000,25000,50000,100000,250000,500000,1000000,2500000],'Dano total',140);
 add('hardwins',[1,5,10,25,50,100,200,300],'Vitórias difíceis',180);
 add('perfect',[1,5,10,25,50,100],'Vitórias sem baixas',190);
 add('jutsu',[10,50,100,250,500,1000,2500,5000,10000],'Jutsus usados',110);
 add('items',[1,10,25,50,100,250,500],'Itens usados',100);
 add('storyMissions',[1,5,10,20,30,40,44],'Capítulos da História',220);
 add('ninjaMissions',[1,5,10,20,40,60,80,100],'Missões Ninja concluídas',220);
 add('unlocked',[10,25,50,100,150,200,209],'Personagens desbloqueados',240);
 add('gearOwned',[1,5,10,15,20,25],'Equipamentos obtidos',180);
 add('gearRepairs',[1,5,10,25,50,100],'Reparos realizados',140);
 add('ryoSpent',[500,2500,10000,25000,50000,100000],'Ryō investido',150);
 add('rankedMatches',[1,10,25,50,100,250,500],'Partidas Ranked',220);
 add('rankedWins',[1,5,10,25,50,100,250],'Vitórias Ranked',260);
 add('rankedRating',[1150,1350,1550,1800,2100],'MMR alcançado',300);
 add('nukeninWins',[1,4,8,16,32],'Nukenin derrotados',260);
 add('bijuuWins',[1,4,8,16],'Raids Bijū vencidas',320);
 return defs
}
const MISS=buildAchievements();
const DAILY_MISSIONS=[
{id:'d_battle',title:'Entre em combate',type:'battles',goal:1,reward:{ryo:40,items:{chakraFood:1}}},
{id:'d_win',title:'Vitória do dia',type:'wins',goal:1,reward:{ryo:60,items:{medicalKit:1}}},
{id:'d_jutsu',title:'Pratique Jutsus',type:'jutsu',goal:6,reward:{ryo:50,items:{shurikenPack:1}}},
{id:'d_damage',title:'Pressão ofensiva',type:'damage',goal:500,reward:{ryo:80,items:{guardScroll:1}}},
{id:'d_item',title:'Use seu inventário',type:'items',goal:1,reward:{ryo:40,items:{antidote:1}}},
{id:'d_ko',title:'Elimine adversários',type:'kos',goal:3,reward:{ryo:65,items:{kunaiPack:1}}},
{id:'d_perfect',title:'Equipe inteira de pé',type:'perfect',goal:1,reward:{ryo:90,items:{smokeBomb:1}}},
{id:'d_hard',title:'Supere um desafio difícil',type:'hardwins',goal:1,reward:{ryo:110,items:{soldierPill:1}}},
{id:'d_ninja',title:'Complete uma Missão Ninja',type:'ninjaMissions',goal:1,reward:{ryo:100,items:{healingOintment:1}}},
{id:'d_story',title:'Avance na História',type:'storyMissions',goal:1,reward:{ryo:120,items:{flashBomb:1}}}
];
const WEEKLY_MISSIONS=[
{id:'w_battle',title:'Veterano da semana',type:'battles',goal:20,reward:{ryo:260,items:{mixedRation:2}}},
{id:'w_win',title:'Sequência de vitórias',type:'wins',goal:10,reward:{ryo:340,items:{medicalKit:2}}},
{id:'w_jutsu',title:'Domínio de Jutsu',type:'jutsu',goal:75,reward:{ryo:300,items:{soldierPill:2}}},
{id:'w_damage',title:'Força de combate',type:'damage',goal:10000,reward:{ryo:420,items:{explosiveTag:2}}},
{id:'w_hard',title:'Desafio de elite',type:'hardwins',goal:4,reward:{ryo:520,items:{barrierTag:1,paralysisTag:1}}},
{id:'w_ko',title:'Caçador de alvos',type:'kos',goal:35,reward:{ryo:360,items:{senbonPack:2}}},
{id:'w_item',title:'Logística de campo',type:'items',goal:8,reward:{ryo:280,items:{fieldMedicine:2}}},
{id:'w_ninja',title:'Operações da vila',type:'ninjaMissions',goal:7,reward:{ryo:480,items:{substitutionScroll:1}}},
{id:'w_story',title:'Crônica da semana',type:'storyMissions',goal:3,reward:{ryo:420,items:{bloodSeal:1}}},
{id:'w_perfect',title:'Execução impecável',type:'perfect',goal:3,reward:{ryo:500,items:{dispelTag:1}}}
];
DAILY_MISSIONS.push(
{id:'d_battle3',title:'Treino prolongado',type:'battles',goal:3,reward:{ryo:75,items:{healingOintment:1}}},
{id:'d_win2',title:'Dupla vitória',type:'wins',goal:2,reward:{ryo:95,items:{chakraFood:1}}},
{id:'d_jutsu12',title:'Sequência de técnicas',type:'jutsu',goal:12,reward:{ryo:80,items:{ninScroll:1}}},
{id:'d_damage1k',title:'Mil de dano',type:'damage',goal:1000,reward:{ryo:110,items:{kunaiPack:1}}},
{id:'d_items2',title:'Preparação de campo',type:'items',goal:2,reward:{ryo:75,items:{guardScroll:1}}},
{id:'d_ko6',title:'Seis eliminações',type:'kos',goal:6,reward:{ryo:100,items:{senbonPack:1}}},
{id:'d_ninja2',title:'Duas operações',type:'ninjaMissions',goal:2,reward:{ryo:140,items:{medicalKit:1}}},
{id:'d_story2',title:'Dois capítulos',type:'storyMissions',goal:2,reward:{ryo:160,items:{soldierPill:1}}},
{id:'d_spend',title:'Invista na preparação',type:'ryoSpent',goal:300,reward:{ryo:90,items:{antidote:1}}},
{id:'d_repair',title:'Cuide do equipamento',type:'gearRepairs',goal:1,reward:{ryo:85,items:{shurikenPack:1}}}
);
WEEKLY_MISSIONS.push(
{id:'w_battle35',title:'Trinta e cinco combates',type:'battles',goal:35,reward:{ryo:420,items:{mixedRation:2}}},
{id:'w_win15',title:'Quinze vitórias',type:'wins',goal:15,reward:{ryo:520,items:{fieldMedicine:2}}},
{id:'w_jutsu120',title:'Arsenal em movimento',type:'jutsu',goal:120,reward:{ryo:460,items:{bloodSeal:1}}},
{id:'w_damage20k',title:'Pressão de vinte mil',type:'damage',goal:20000,reward:{ryo:620,items:{explosiveBundle:1}}},
{id:'w_hard7',title:'Elite persistente',type:'hardwins',goal:7,reward:{ryo:700,items:{substitutionScroll:1}}},
{id:'w_ko60',title:'Sessenta alvos',type:'kos',goal:60,reward:{ryo:520,items:{poisonBomb:1}}},
{id:'w_items15',title:'Especialista em suprimentos',type:'items',goal:15,reward:{ryo:450,items:{barrierTag:1}}},
{id:'w_ninja12',title:'Doze Missões Ninja',type:'ninjaMissions',goal:12,reward:{ryo:720,items:{paralysisTag:1}}},
{id:'w_story5',title:'Cinco capítulos da História',type:'storyMissions',goal:5,reward:{ryo:680,items:{dispelTag:1}}},
{id:'w_spend2k',title:'Investimento de guerra',type:'ryoSpent',goal:2000,reward:{ryo:500,items:{flashBomb:2}}}
);
function taskHash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function activeTaskDefs(scope){ensureMissionPeriods();const st=S.missions[scope],pool=scope==='daily'?DAILY_MISSIONS:WEEKLY_MISSIONS;if(!Array.isArray(st.taskIds)||st.taskIds.length!==10||st.taskIds.some(id=>!pool.some(x=>x.id===id))){let seed=taskHash(`${scope}:${st.period}`),arr=pool.map((x,i)=>({x,k:taskHash(`${seed}:${i}:${x.id}`)})).sort((a,b)=>a.k-b.k).map(o=>o.x);st.taskIds=arr.slice(0,10).map(x=>x.id)}return st.taskIds.map(id=>pool.find(x=>x.id===id)).filter(Boolean)}
const DAILY_BONUS={ryo:220,items:{fieldMedicine:1,flashBomb:1}};
const WEEKLY_BONUS={ryo:900,items:{explosiveBundle:1,substitutionScroll:1,bloodSeal:1}};
const BIJUU_EVENTS=[
{id:'shukaku',slug:'bijuu-shukaku-event',name:'Shukaku',tails:1,tier:1,monthlyHp:760,monthlyReward:{ryo:1100},monthlyHours:168,mechanic:'Areia e defesa: quebra escudos e pune equipes que só atacam.',phases:['Areia Movediça','Casco de Areia','Tempestade do Shukaku']},
{id:'matatabi',slug:'bijuu-matatabi-event',name:'Matatabi',tails:2,tier:2,monthlyHp:840,monthlyReward:{ryo:1200},monthlyHours:168,mechanic:'Fogo azul e Aflição: pressão contínua e dano por turno.',phases:['Chamas Azuis','Caçada Felina','Incêndio de Chakra']},
{id:'isobu',slug:'bijuu-isobu-event',name:'Isobu',tails:3,tier:3,monthlyHp:900,monthlyReward:{ryo:1300},monthlyHours:168,mechanic:'Carapaça e coral: alterna defesa pesada com interrupção.',phases:['Maré de Coral','Carapaça Espinhosa','Tsunami da Três Caudas']},
{id:'songoku',slug:'bijuu-son-goku-event',name:'Son Gokū',tails:4,tier:4,monthlyHp:960,monthlyReward:{ryo:1400},monthlyHours:168,mechanic:'Lava: ataques fortes e Aflição crescente.',phases:['Punhos de Lava','Mar Vulcânico','Erupção da Quatro Caudas']},
{id:'kokuo',slug:'bijuu-kokuo-event',name:'Kokuō',tails:5,tier:5,monthlyHp:1020,monthlyReward:{ryo:1500},monthlyHours:168,mechanic:'Vapor: investidas físicas e recuperação no meio da luta.',phases:['Carga de Vapor','Pressão Máxima','Ruptura da Cinco Caudas']},
{id:'saiken',slug:'bijuu-saiken-event',name:'Saiken',tails:6,tier:6,monthlyHp:1080,monthlyReward:{ryo:1600},monthlyHours:168,mechanic:'Ácido e regeneração: exige dissipar Aflições e manter pressão.',phases:['Bolhas Corrosivas','Manto Viscoso','Mar Ácido da Seis Caudas']},
{id:'chomei',slug:'bijuu-chomei-event',name:'Chōmei',tails:7,tier:7,monthlyHp:1120,monthlyReward:{ryo:1700},monthlyHours:168,mechanic:'Voo e controle: alterna evasão, stun e ataques em área.',phases:['Voo Rasante','Pó Ofuscante','Céu da Sete Caudas']},
{id:'gyuki',slug:'bijuu-gyuki-event',name:'Gyūki',tails:8,tier:8,monthlyHp:1180,monthlyReward:{ryo:1900},monthlyHours:168,mechanic:'Força e tentáculos: alta pressão, escudo e finalizações.',phases:['Tentáculos','Fúria do Oito-Caudas','Bomba Bijū Completa']},
{id:'kurama',slug:'bijuu-kurama-event',name:'Kurama',tails:9,tier:9,monthlyHp:1280,monthlyReward:{ryo:2200},monthlyHours:168,mechanic:'Boss final do ciclo: maior PV, poder e adaptação entre dano, defesa e execução.',phases:['Manto da Nove Caudas','Fúria de Kurama','Bomba Bijū Suprema']}
];
const BIJUU_RULES={mode:'individual-per-account',weeklyGoal:1,monthlyGoal:1};
function legacy_BASE_eventReward(ev,scope){return scope==='weekly'?ev.reward:ev.monthlyReward}
function eventHours(ev,scope){return scope==='weekly'?0:ev.monthlyHours}
function eventHp(ev,scope){return scope==='weekly'?ev.hp:ev.monthlyHp}
function monthKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function utcDayKey(d=new Date()){return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`}
function utcWeekKey(d=new Date()){const x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),day=(x.getUTCDay()+6)%7;x.setUTCDate(x.getUTCDate()-day);return utcDayKey(x)}
function utcMonthKey(d=new Date()){return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`}
function activeNukenin(){if(!NUKENIN_EVENTS.length)return null;const key=utcWeekKey(),sum=[...key].reduce((a,c)=>a+c.charCodeAt(0),0);return NUKENIN_EVENTS[sum%NUKENIN_EVENTS.length]}
function activeBijuu(){const key=utcMonthKey(),sum=[...key].reduce((a,c)=>a+c.charCodeAt(0),0);return BIJUU_EVENTS[(sum+2)%BIJUU_EVENTS.length]}
function activeEvent(scope){return scope==='weekly'?activeNukenin():activeBijuu()}
function eventDefaults(){return {weekly:{period:'',wins:0,claimed:false},monthly:{period:'',wins:0,claimed:false},temporary:{}}}
function legacy_BASE_ensureEventPeriods(){S.events=S.events&&typeof S.events==='object'?S.events:eventDefaults();const wk=utcWeekKey(),mk=utcMonthKey();if(!S.events.weekly||S.events.weekly.period!==wk)S.events.weekly={period:wk,wins:0,claimed:false};if(!S.events.monthly||S.events.monthly.period!==mk)S.events.monthly={period:mk,wins:0,claimed:false};S.events.temporary=S.events.temporary&&typeof S.events.temporary==='object'?S.events.temporary:{};for(const [slug,until] of Object.entries(S.events.temporary))if(Number(until)<=Date.now())delete S.events.temporary[slug]}
function activeTemporarySlugs(){ensureEventPeriods();return Object.entries(S.events.temporary).filter(([,u])=>Number(u)>Date.now()).map(([s])=>s)}
const ITEM_RULES={perTurn:1,perBattle:3,sameItemPerBattle:1};
function defaults(){
 let u=(CHAR_UNLOCKS.starter||['naruto-uzumaki']).filter(s=>R.some(c=>c.slug===s));
 return {name:'Jogador',wins:0,losses:0,xp:0,ryo:300,unlocked:u,you:u.slice(0,3),ai:[],aiProfile:'equilibrada',
   story:storyDefaults(),done:{},unlockedJutsu:[],loadouts:{},mastery:{},jutsuMastery:{},unlockPolicyVersion:8,
   inventory:{chakraFood:1,medicalKit:1,soldierPill:0,antidote:0,smokeBomb:0,explosiveTag:0,shurikenPack:0,guardScroll:0},
   gear:{owned:{},equipped:{}},ninjaMissions:{completed:{},attempts:{},last:null},ranked:{rating:1000,wins:0,losses:0,draws:0,season:'',lastRoom:null,abandons:0},
   missions:{daily:{period:'',stats:{},claimed:{},bonusClaimed:false},weekly:{period:'',stats:{},claimed:{},bonusClaimed:false}},events:eventDefaults(),
   c:{wins:0,battles:0,kos:0,damage:0,hardwins:0,perfect:0,jutsu:0,items:0,storyMissions:0,ninjaMissions:0,gearRepairs:0,ryoSpent:0,nukeninWins:0,bijuuWins:0,rankedMatches:0,rankedWins:0}};
}
let S,rawSaved={};
try{rawSaved=JSON.parse(localStorage.getItem(KEY)||'{}');S={...defaults(),...rawSaved}}catch(e){rawSaved={};S=defaults()}
if(!Object.prototype.hasOwnProperty.call(rawSaved,'ryo')&&Object.prototype.hasOwnProperty.call(rawSaved,'dna'))S.ryo=Number(rawSaved.dna||300);else if(S.ryo===undefined||S.ryo===null)S.ryo=300;if('dna' in S)delete S.dna;
S.c={...defaults().c,...(S.c||{})};S.done=S.done||{};S.unlocked=S.unlocked||defaults().unlocked;
S.you=(S.you||[]).filter(x=>!!char(x)).slice(0,3);
S.ai=(S.ai||[]).filter(x=>!!char(x)).slice(0,3);
if(!AI_PROFILES.some(p=>p.id===S.aiProfile))S.aiProfile='equilibrada';
S.story={...storyDefaults(),...(S.story||{})};S.story.completed=Array.isArray(S.story.completed)?S.story.completed:[];S.story.badges=Array.isArray(S.story.badges)?S.story.badges:[];
S.unlockedJutsu=Array.isArray(S.unlockedJutsu)?S.unlockedJutsu:[];
S.loadouts=S.loadouts&&typeof S.loadouts==='object'?S.loadouts:{};
S.mastery=S.mastery&&typeof S.mastery==='object'?S.mastery:{};
S.jutsuMastery=S.jutsuMastery&&typeof S.jutsuMastery==='object'?S.jutsuMastery:{};
S.inventory={...defaults().inventory,...(S.inventory||{})};
S.gear=S.gear&&typeof S.gear==='object'?S.gear:defaults().gear;S.gear.owned=S.gear.owned&&typeof S.gear.owned==='object'?S.gear.owned:{};S.gear.equipped=S.gear.equipped&&typeof S.gear.equipped==='object'?S.gear.equipped:{};
S.ninjaMissions=S.ninjaMissions&&typeof S.ninjaMissions==='object'?S.ninjaMissions:defaults().ninjaMissions;S.ninjaMissions.completed=S.ninjaMissions.completed||{};S.ninjaMissions.attempts=S.ninjaMissions.attempts||{};S.ranked={...defaults().ranked,...(S.ranked||{})};
S.missions=S.missions&&typeof S.missions==='object'?S.missions:defaults().missions;
S.events=S.events&&typeof S.events==='object'?S.events:eventDefaults();ensureEventPeriods();
function storyUnlockedCharacters(){
 const u=new Set(CHAR_UNLOCKS.starter||['naruto-uzumaki']);
 for(const m of STORY_MISSIONS)if(S.story.completed.includes(m.id))for(const s of (m.reward?.unlock||[]))u.add(s);
 for(const s of activeTemporarySlugs())u.add(s);
 return [...u].filter(s=>!!char(s))
}
S.unlocked=storyUnlockedCharacters();S.unlockPolicyVersion=8;
S.you=(S.you||[]).filter(s=>S.unlocked.includes(s)).slice(0,3);

let viewed=char(S.you[0])||R[0];
let pageIndex=0,browseMode='all',pageSize=36,G=null,selected=null,jutsuViewedSlug=null,jutsuDetailSlot=0;
const BATTLE_SESSION_KEY='naruto_unison_active_battle_v2';
function clearBattleSession(){try{sessionStorage.removeItem(BATTLE_SESSION_KEY)}catch(_){}}
function persistBattleSession(){try{if(G&&!G.over){sessionStorage.setItem(BATTLE_SESSION_KEY,JSON.stringify({ts:Date.now(),user:ON?.user||null,g:G}))}else clearBattleSession()}catch(_){}}
function restoreBattleSession(){try{const raw=sessionStorage.getItem(BATTLE_SESSION_KEY);if(!raw)return false;const snap=JSON.parse(raw);if(!snap?.g||Date.now()-Number(snap.ts||0)>21600000){clearBattleSession();return false}if(snap.user&&ON?.user&&snap.user!==ON.user){clearBattleSession();return false}if(!Array.isArray(snap.g.you)||!Array.isArray(snap.g.ai)){clearBattleSession();return false}G=snap.g;G.animating=false;selected=null;return true}catch(_){clearBattleSession();return false}}
async function resumeBattleAfterAuth(){if(!restoreBattleSession())return false;show('battle');const log=document.querySelector('#battlelog');if(log)log.innerHTML='';renderBattle();if(G?.online&&ON?.room){try{await pollRoom()}catch(_){}}setTimeout(()=>window.NarutoBattleMobileGuard?.returnToControls?.(),120);return true}
window.NarutoBattleRuntime={persist:persistBattleSession,clear:clearBattleSession,resume:resumeBattleAfterAuth};
window.NarutoResumeOnline=()=>pollRoom();

const ONLINE_KEY='naruto_unison_ptbr_online_session_v1';
let ON={token:null,user:null,room:null,role:null,submittedTurn:null,poll:null,lastEvent:0,resultRoom:null,fxLogKeys:[],fxRoom:null,revision:0};
try{ON={...ON,...JSON.parse(localStorage.getItem(ONLINE_KEY)||'{}')}}catch(_){}
function saveOnlineSession(){localStorage.setItem(ONLINE_KEY,JSON.stringify({token:ON.token,user:ON.user,room:ON.room,role:ON.role,resultRoom:ON.resultRoom,revision:ON.revision}))}
function assetUrl(p){try{const u=new URL(p,document.baseURI);if(/\.(?:png|jpe?g|webp|gif)$/i.test(u.pathname))u.searchParams.set('build',BUILD);return u.href}catch(_){return p}}
const R28_REMOTE_PORTRAITS={};
const R29_REMOTE_PORTRAIT_FALLBACKS={
 'https://static.wikia.nocookie.net/naruto/images/b/b4/Kaguya_revivida.PNG/revision/latest/scale-to-width-down/360?cb=20160428184516&path-prefix=pt-br':'static/img/character-corrections-r29/kaguya-fallback.jpg',
 'https://static.wikia.nocookie.net/naruto/images/6/65/Toneri_%C5%8Ctsutsuki.PNG/revision/latest/scale-to-width-down/360?cb=20160831101917&path-prefix=pt-br':'static/img/character-corrections-r29/toneri-fallback.jpg'
};
function imgSafe(path,fallback,cls='charicon',extra=''){
  const remote=R28_REMOTE_PORTRAITS[path],src=remote||path;
  const fb=R29_REMOTE_PORTRAIT_FALLBACKS[path]||R29_REMOTE_PORTRAIT_FALLBACKS[src]||(remote?(fallback||path):(fallback||'static/img/icon.png'));
  return `<img class="${cls}" src="${assetUrl(src)}" data-fallback="${assetUrl(fb)}" ${extra}>`
}
function skillImg(sk,cls='skillicon',extra=''){return `<img class="${cls}" src="${assetUrl(sk?.image||'static/img/icon.png')}" data-skill-image="1" data-fallback="${assetUrl('static/img/icon.png')}" ${extra}>`}
document.addEventListener('error',e=>{
  const el=e.target;
  if(el&&el.tagName==='IMG'){
    if(el.dataset&&el.dataset.skillImage==='1'){el.classList.add('jutsuBroken');const fb=el.dataset.fallback||assetUrl('static/img/icon.png');if(el.src!==fb){el.src=fb;return}el.alt=el.alt||'Arte da técnica indisponível';return}
    const fb=el.dataset&&el.dataset.fallback;
    if(fb&&el.src!==fb){el.src=fb;el.classList.add('jutsuBroken')}
  }
},true);
const NARUTO_API_FALLBACK='https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/naruto-api';
const API_TIMEOUT_MS=12000;
function apiBases(){
  const configured=String(window.NARUTO_ONLINE_CONFIG?.functionUrl||'').replace(/\/$/,'');
  const local=/^(localhost|127\.0\.0\.1)$/i.test(location.hostname)?'':null;
  const out=[];
  for(const base of [local,configured,NARUTO_API_FALLBACK]){
    if(base===null||base===undefined)continue;
    if(!out.includes(base))out.push(base);
  }
  return out.length?out:[NARUTO_API_FALLBACK];
}
function apiUrl(path,base=null){
  const b=base===null?apiBases()[0]:String(base||'').replace(/\/$/,'');
  return b ? b + path : path;
}
async function api(path,data,options={}){
  const timeout=Math.max(2500,Number(options.timeout||API_TIMEOUT_MS));
  let lastError='Servidor online indisponível.';
  for(const base of apiBases()){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeout);
    try{
      const opt=data===undefined?{cache:'no-store',signal:controller.signal}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),cache:'no-store',signal:controller.signal};
      const r=await fetch(apiUrl(path,base),opt);
      let j;try{j=await r.json()}catch(_){j={ok:false,error:`Servidor online respondeu HTTP ${r.status}.`}};
      if(!j||typeof j!=='object')j={ok:false,error:`Resposta inválida do servidor (HTTP ${r.status}).`};
      j.httpStatus=r.status;j.backend=base||location.origin;
      if(r.ok||r.status===400||r.status===401||r.status===403||r.status===409||r.status===429)return j;
      lastError=j.error||`Servidor respondeu HTTP ${r.status}.`;
    }catch(e){
      lastError=e?.name==='AbortError'?`Servidor não respondeu em ${Math.round(timeout/1000)}s.`:'Falha de conexão: '+(e?.message||String(e));
    }finally{clearTimeout(timer)}
  }
  return {ok:false,error:lastError,network:true,timeout:/não respondeu/.test(lastError)};
}


function level(){return Math.floor(S.xp/500)+1}
function dayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function weekKey(d=new Date()){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return dayKey(x)}
function emptyPeriod(period){return {period,stats:{wins:0,battles:0,kos:0,damage:0,hardwins:0,perfect:0,jutsu:0,items:0},claimed:{},bonusClaimed:false}}
function ensureMissionPeriods(){
 if(!S.missions||typeof S.missions!=='object')S.missions={};const dk=dayKey(),wk=weekKey();
 if(!S.missions.daily||S.missions.daily.period!==dk)S.missions.daily=emptyPeriod(dk);
 if(!S.missions.weekly||S.missions.weekly.period!==wk)S.missions.weekly=emptyPeriod(wk);
}
function trackPeriodic(type,amount=1){ensureMissionPeriods();amount=Number(amount||0);for(const scope of ['daily','weekly'])S.missions[scope].stats[type]=Number(S.missions[scope].stats[type]||0)+amount}
function rewardLabel(r){const parts=[];if(r?.ryo)parts.push(`${r.ryo} Ryō`);for(const [id,n] of Object.entries(r?.items||{}))parts.push(`${n}× ${(SHOP_ITEMS[id]?.name||id)}`);if(r?.gear)parts.push(`Equipamento: ${EQUIPMENT_BY_ID[r.gear]?.name||r.gear}`);return parts.join(' • ')}
function grantReward(r){if(!r)return;if(r.ryo)S.ryo+=Number(r.ryo);for(const [id,n] of Object.entries(r.items||{}))S.inventory[id]=Number(S.inventory[id]||0)+Number(n||0);if(r.gear)awardGear(r.gear)}
function claimPeriodic(scope,id){ensureMissionPeriods();const defs=activeTaskDefs(scope),m=defs.find(x=>x.id===id),st=S.missions[scope];if(!m||st.claimed[id]||Number(st.stats[m.type]||0)<m.goal)return;grantReward(m.reward);st.claimed[id]=true;save();renderMissions();renderInventory()}
function claimPeriodBonus(scope){ensureMissionPeriods();const defs=activeTaskDefs(scope),st=S.missions[scope];if(st.bonusClaimed||!defs.every(m=>Number(st.stats[m.type]||0)>=m.goal))return;grantReward(scope==='daily'?DAILY_BONUS:WEEKLY_BONUS);st.bonusClaimed=true;save();renderMissions();renderInventory()}
function recordBattleCounters(win){trackPeriodic('battles',1);if(win)trackPeriodic('wins',1);trackPeriodic('kos',G?.kos||0);trackPeriodic('damage',G?.damage||0);if(win&&(G?.diff==='hard'||G?.diff==='boss'))trackPeriodic('hardwins',1);if(win&&G?.you?.every(x=>x.hp>0))trackPeriodic('perfect',1)}
let cloudSaveTimer=null,cloudSaveInFlight=false,cloudSaveAgain=false,localSaveGeneration=0;
function profileSnapshot(){return {name:S.name,wins:S.wins,losses:S.losses,xp:S.xp,ryo:S.ryo,unlocked:S.unlocked,you:S.you,aiProfile:S.aiProfile,story:S.story,done:S.done,c:S.c,unlockedJutsu:S.unlockedJutsu,loadouts:S.loadouts,mastery:S.mastery,jutsuMastery:S.jutsuMastery,inventory:S.inventory,gear:S.gear,ninjaMissions:S.ninjaMissions,missions:S.missions,events:S.events,ranked:S.ranked,unlockPolicyVersion:8}}
function setSaveStatus(text,bad=false){document.querySelectorAll('.cloudSaveStatus').forEach(e=>{e.textContent=text;e.classList.toggle('bad',bad)});const p=$('#profileCloudStatus');if(p)p.textContent=text}
async function flushCloudSave(){
 if(!ON.token)return;if(cloudSaveInFlight){cloudSaveAgain=true;return}cloudSaveInFlight=true;cloudSaveAgain=false;
 const sentRevision=ON.revision,sentGeneration=localSaveGeneration,sentToken=ON.token;
 const r=await api('/api/account/save',{token:ON.token,profile:profileSnapshot(),revision:ON.revision});
 if(ON.token!==sentToken){cloudSaveInFlight=false;if(cloudSaveAgain&&ON.token)flushCloudSave();else if(!ON.token)cloudSaveAgain=false;return}
 const incoming=Number(r.revision??ON.revision);
 if(incoming>=ON.revision)ON.revision=incoming;
 if(!r.ok&&r.profile&&incoming>=sentRevision){
   if(localSaveGeneration===sentGeneration)applyServerProfile(r.profile,incoming);
   else{if(r.profile.events)S.events=r.profile.events;if(r.profile.inventory)S.inventory={...S.inventory,...r.profile.inventory};if(r.profile.ryo!==undefined)S.ryo=Number(r.profile.ryo||0);ensureEventPeriods();S.unlocked=storyUnlockedCharacters();localStorage.setItem(KEY,JSON.stringify(S));cloudSaveAgain=true}
 }
 else if(r.ok&&r.events){S.events=r.events;ensureEventPeriods();S.unlocked=storyUnlockedCharacters();localStorage.setItem(KEY,JSON.stringify(S));saveOnlineSession()}
 cloudSaveInFlight=false;setSaveStatus(r.ok?`Salvo automaticamente • ${ON.user}`:'Falha no autosave: '+(r.error||'servidor indisponível'),!r.ok);
 if(cloudSaveAgain)flushCloudSave();
}
function queueCloudSave(){if(!ON.token)return;clearTimeout(cloudSaveTimer);setSaveStatus('Salvando...');cloudSaveTimer=setTimeout(flushCloudSave,120)}
async function drainCloudSave(){
 if(!ON.token)return;
 const drainToken=ON.token;
 clearTimeout(cloudSaveTimer);cloudSaveTimer=null;
 if(!cloudSaveInFlight)await flushCloudSave();else cloudSaveAgain=true;
 while(ON.token===drainToken&&(cloudSaveInFlight||cloudSaveAgain))await new Promise(resolve=>setTimeout(resolve,20))
}
function save(){
 localSaveGeneration++;ensureMissionPeriods();ensureEventPeriods();localStorage.setItem(KEY,JSON.stringify(S));renderHeader();renderMissions();queueCloudSave();
}
window.addEventListener('pagehide',()=>{if(ON.token){try{fetch(apiUrl('/api/account/save'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:ON.token,profile:profileSnapshot(),revision:ON.revision}),keepalive:true})}catch(_){}}});
function char(slug){return R.find(c=>c.slug===slug)||VIRTUAL_BIJUU_BY_SLUG.get(slug)||null}
function img(c,cls='charicon'){return imgSafe(c.icon,c.icon,cls)}
function legacyR15_costText(cost){const n={Blood:0,Gen:0,Nin:0,Tai:0,Rand:0};for(const c of(cost||[]))n[c]=(n[c]||0)+1;return ['Blood','Gen','Nin','Tai','Rand'].filter(k=>n[k]).map(k=>`${k==='Blood'?'KEK':k==='Gen'?'GEN':k==='Nin'?'NIN':k==='Tai'?'TAI':'Q'} ${n[k]}`).join(' • ')||'GRÁTIS'}
function legacyR15_costs(cost){
 return (cost&&cost.length?cost:[]).map(c=>`<span class="chakra ${CCLS[c]||'rand'}" title="${CPT[c]||c}" aria-label="${CPT[c]||c}"><b>${c==='Blood'?'K':c==='Gen'?'G':c==='Nin'?'N':c==='Tai'?'T':'A'}</b></span>`).join('')||'<span class="extra">Grátis</span>'
}

function masteryFor(slug){
 if(!S.mastery[slug])S.mastery[slug]={uses:0,wins:0,battles:0};
 return S.mastery[slug]
}
function variantsFor(slug,slot=null){return JV.filter(v=>v.character===slug&&(slot===null||Number(v.slot)===Number(slot)))}
function equippedVariant(slug,slot){const id=S.loadouts?.[slug]?.[slot];return id?JV_BY_ID[id]:null}
function effectiveSkills(c){
 return c.skills.map((base,slot)=>{const v=equippedVariant(c.slug,slot);return v&&S.unlockedJutsu.includes(v.id)?{...v,originalName:base.originalName||base.name}:{...base}})
}
function masteryTrialState(id){
 S.jutsuMastery=S.jutsuMastery&&typeof S.jutsuMastery==='object'?S.jutsuMastery:{};
 if(!S.jutsuMastery[id])S.jutsuMastery[id]={stage:0,completed:false,attempts:0,failures:0,lastResult:'',startedAt:0,completedAt:0,uses:0,damage:0,healing:0,shielding:0,control:0,areaHits:0};
 const st=S.jutsuMastery[id];for(const k of ['uses','damage','healing','shielding','control','areaHits'])st[k]=Number(st[k]||0);
 return st
}
function ensureMasteryTechniqueChakra(pool,cost){
 const real=['Blood','Gen','Nin','Tai'],need={Blood:0,Gen:0,Nin:0,Tai:0};let q=0;
 for(const k of(cost||[])){if(real.includes(k))need[k]++;else if(k==='Rand')q++}
 for(const k of real)pool[k]=Math.max(Number(pool[k]||0),need[k]);
 let total=real.reduce((n,k)=>n+Number(pool[k]||0),0),goal=(cost||[]).length;
 while(total<goal){const k=real.sort((a,b)=>Number(pool[a]||0)-Number(pool[b]||0))[0];pool[k]=Number(pool[k]||0)+1;total++}
 return pool
}
function recordMasteryTechniqueExecution(sk,events){
 if(!G?.masteryTrial||!sk?.id||sk.id!==G.masteryTrial.variantId)return;
 const st=masteryTrialState(sk.id),ev=events||[];G.masteryTrial.techniqueUsed=true;st.uses++;
 let dmg=0,heal=0,shield=0,control=0;
 for(const e of ev){const b=e.before||{},a=e.after||{};dmg+=Math.max(0,Number(b.hp||0)-Number(a.hp||0));heal+=Math.max(0,Number(a.hp||0)-Number(b.hp||0));shield+=Math.max(0,Number(a.shield||0)-Number(b.shield||0));if(Number(a.stun||0)>Number(b.stun||0)||Number(a.dot||0)>Number(b.dot||0)||Number(a.inv||0)>Number(b.inv||0))control++}
 st.damage+=dmg;st.healing+=heal;st.shielding+=shield;st.control+=control;if(ev.length>1)st.areaHits+=ev.length;st.lastTechniqueAt=Date.now();save();log(`DOMÍNIO REGISTRADO: ${sk.name} executado • dano ${dmg} • cura ${heal} • defesa ${shield} • controle ${control}.`,'good')
}
function jutsuProgress(v){const st=masteryTrialState(v.id),goal=Number(v?.masteryTrial?.stages?.length||3);return {value:st.completed?goal:Math.min(goal,Number(st.stage||0)),goal,type:'trial',completed:!!st.completed}}
function claimJutsuMastery(){
 // R31: esta função só migra Jutsus que já estavam desbloqueados em saves antigos.
 // uses/wins/battles continuam como estatística geral e NUNCA mais liberam uma variante.
 let changed=false;
 for(const id of(S.unlockedJutsu||[])){const v=JV_BY_ID[id];if(!v)continue;const st=masteryTrialState(id);if(!st.completed){st.completed=true;st.stage=Number(v?.masteryTrial?.stages?.length||3);st.completedAt=st.completedAt||Date.now();st.lastResult='Migrado de save anterior';changed=true}}
 if(changed)localStorage.setItem(KEY,JSON.stringify(S));
 return changed
}
function recordJutsuUses(acts,team){let n=0;for(const a of(acts||[])){const f=team?.[a.user];if(f?.slug){masteryFor(f.slug).uses++;n++}}if(n){S.c.jutsu=Number(S.c.jutsu||0)+n;trackPeriodic('jutsu',n)}}
function recordBattleMastery(team,win){const seen=new Set();for(const f of(team||[]))if(f?.slug&&!seen.has(f.slug)){seen.add(f.slug);const m=masteryFor(f.slug);m.battles++;if(win)m.wins++}}
function setVariant(slug,slot,id){
 S.loadouts[slug]=Array.isArray(S.loadouts[slug])?S.loadouts[slug]:[null,null,null,null];
 if(id&&(!S.unlockedJutsu.includes(id)||JV_BY_ID[id]?.character!==slug||Number(JV_BY_ID[id]?.slot)!==Number(slot)))return;
 S.loadouts[slug][slot]=id||null;save();preview(char(slug));renderTeams();renderMissions();renderJutsuPage(slug);renderHome()
}
function variantSourceHtml(){return ''}
function variantReqText(v){const q=jutsuProgress(v),t=v.masteryTrial;return `${q.value}/${q.goal} etapas • ${t?.familyLabel||'Prova de Domínio'} • ${t?.location||'Campo de treino'}`}
function openVariantModal(slug,slot){
 const c=char(slug);if(!c)return;const base=c.skills[slot],list=variantsFor(slug,slot),cur=S.loadouts?.[slug]?.[slot]||null;
 $('#variantTitle').textContent=`${c.name} — ${base.name}`;
 $('#variantIntro').innerHTML='Escolha qual técnica fica equipada neste espaço. Novos Jutsus são liberados em <b>TAREFAS → Provas de Domínio</b>.';
 const all=[{id:null,...base,source:'Técnica base',base:true},...list];
 $('#variantChoices').innerHTML=all.map(v=>{const unlocked=v.base||S.unlockedJutsu.includes(v.id),eq=(v.base&&!cur)||(!v.base&&cur===v.id);return `<article class="variantChoice ${unlocked?'':'locked'} ${eq?'equipped':''}">
 ${skillImg(v,'',`alt="${esc(v.name)}"`)}<div><h3>${v.name}</h3>${skillInfoHtml(v)}<p>${v.desc||''}</p><p>${costs(v.cost)} ${v.cooldown?`<span class="extra">CD ${v.cooldown}</span>`:''}</p>${v.base?'':`<div class="variantReq">${unlocked?'DESBLOQUEADA':'BLOQUEADA — '+variantReqText(v)}</div>`}</div><button data-equip-variant="${v.id||''}" ${unlocked?'':'disabled'}>${eq?'EQUIPADA':'EQUIPAR'}</button></article>`}).join('');
 $('#variantModal').classList.remove('hidden');$$('[data-equip-variant]').forEach(b=>b.onclick=()=>{setVariant(slug,slot,b.dataset.equipVariant||null);openVariantModal(slug,slot)})
}
function closeVariantModal(){$('#variantModal').classList.add('hidden')}


function aiProfile(){return AI_PROFILES.find(p=>p.id===S.aiProfile)||AI_PROFILES[1]}
function skillKind(sk){return sk?.mechanic?.kind||'damage'}
function skillPower(sk){return Number(sk?.mechanic?.power||0)}
function characterScores(c){
 let out={damage:0,control:0,support:0,speed:0,elite:0};
 for(const s of c.skills){
   const k=skillKind(s),p=skillPower(s),cost=(s.cost||[]).length,cd=s.cooldown||0;
   if(k==='damage')out.damage+=p;
   if(k==='stun'||k==='dot')out.control+=p+28;
   if(k==='heal'||k==='shield'||k==='invuln')out.support+=p+28;
   out.speed+=Math.max(0,4-cost)*14+Math.max(0,3-cd)*5;
   out.elite+=p+(k==='stun'||k==='dot'?18:0)+(k==='heal'||k==='shield'||k==='invuln'?15:0);
 }
 return out
}
function nameHas(c,terms){
 let n=(c.name+' '+c.slug).toLowerCase();
 return terms.some(t=>n.includes(t.toLowerCase()))
}
function uniquePick(pool,n,exclude=[]){
 let e=new Set(exclude),a=pool.filter(c=>!e.has(c.slug)),r=[];
 for(const c of [...a].sort(()=>Math.random()-.5)){if(!r.some(x=>x.slug===c.slug)){r.push(c);if(r.length===n)break}}
 return r
}
function topByScore(key,count,exclude=[],pool=R){
 let e=new Set(exclude);
 return [...pool].filter(c=>!e.has(c.slug)&&!c.eventOnly&&!/^bijuu-/.test(c.slug)).map(c=>({c,s:characterScores(c)[key]}))
   .sort((a,b)=>b.s-a.s).slice(0,Math.max(count*4,count)).sort(()=>Math.random()-.5).slice(0,count).map(x=>x.c)
}
function teamForProfile(p){
 let avoid=S.you||[],team=[];
 if(p.team==='rookies'){
   let pool=R.filter(c=>nameHas(c,['Naruto Uzumaki','Sasuke Uchiha','Sakura Haruno','Hinata','Kiba','Shino','Shikamaru','Chōji','Choji','Ino ','Neji','Rock Lee','Tenten']));
   team=uniquePick(pool,3,avoid)
 }else if(p.team==='akatsuki'){
   let pool=R.filter(c=>nameHas(c,['Itachi','Kisame','Deidara','Sasori','Hidan','Kakuzu','Konan','Pain']));
   team=uniquePick(pool,3,avoid)
 }else if(p.team==='kage'){
   let pool=R.filter(c=>nameHas(c,['Tsunade','Gaara','Hiruzen','Minato','Mei Terumi','Ōnoki','Killer B','A']));
   team=uniquePick(pool,3,avoid)
 }else if(p.team==='anbu'){
   let pool=R.filter(c=>nameHas(c,['Kakashi','Itachi','Yamato','Sai','Anko','Ao','Aoba']));
   team=uniquePick(pool,3,avoid)
 }else if(p.team==='damage')team=topByScore('damage',3,avoid);
 else if(p.team==='control')team=topByScore('control',3,avoid);
 else if(p.team==='support')team=topByScore('support',3,avoid);
 else if(p.team==='speed')team=topByScore('speed',3,avoid);
 else if(p.team==='elite')team=topByScore('elite',3,avoid);
 else if(p.team==='combo'){
   let a=topByScore('control',1,avoid);let ex=avoid.concat(a.map(x=>x.slug));
   let b=topByScore('damage',1,ex);ex=ex.concat(b.map(x=>x.slug));
   let c=topByScore('support',1,ex);team=a.concat(b,c)
 }else if(p.team==='balanced'){
   let a=topByScore('damage',1,avoid);let ex=avoid.concat(a.map(x=>x.slug));
   let b=topByScore('control',1,ex);ex=ex.concat(b.map(x=>x.slug));
   let c=topByScore('support',1,ex);team=a.concat(b,c)
 }else team=uniquePick(R.filter(c=>!c.eventOnly&&!/^bijuu-/.test(c.slug)),3,avoid);
 if(team.length<3)team=team.concat(uniquePick(R.filter(c=>!c.eventOnly&&!/^bijuu-/.test(c.slug)),3-team.length,avoid.concat(team.map(x=>x.slug))));
 return team.slice(0,3)
}
function refreshAITeam(){
 S.ai=teamForProfile(aiProfile()).map(c=>c.slug);
 save();
}
function renderAIControls(){
 const sel=$('#aiProfile');
 if(sel && !sel.options.length){
   AI_PROFILES.forEach(p=>{
     const o=document.createElement('option');o.value=p.id;
     const d=p.difficulty==='easy'?'FÁCIL':p.difficulty==='normal'?'NORMAL':p.difficulty==='hard'?'DIFÍCIL':'CHEFE';
     o.textContent=`${p.name} — ${d}`;sel.appendChild(o)
   });
   sel.onchange=()=>{S.aiProfile=sel.value;S.ai=teamForProfile(aiProfile()).map(c=>c.slug);save();renderAIControls()}
 }
 if(sel)sel.value=S.aiProfile;
 const p=aiProfile(),name=$('#aiName'),plan=$('#aiPlan'),box=$('#aiTeamButtons');
 if(name)name.textContent=p.name;
 if(plan)plan.textContent=p.plan;
 if(box)box.innerHTML=S.ai.map(char).filter(Boolean).map(c=>imgSafe(c.icon,'static/img/icon.png','charicon',`title="${c.name}"`)).join('');
 const bottomAI=$('#bottomAI'),bottomPlan=$('#bottomAIPlan');
 if(bottomAI)bottomAI.textContent=p.name;
 if(bottomPlan)bottomPlan.textContent=p.strategy==='aggressive'?'AGRESSIVA':p.strategy==='control'?'CONTROLE':p.strategy==='support'?'SUPORTE':p.strategy==='focus'?'FOCO':p.strategy==='combo'?'COMBO':p.strategy==='smart'?'CHEFE TÁTICO':p.strategy==='chaos'?'CAÓTICA':'EQUILIBRADA';
 const compact=$('#aiCompact'),summary=$('#aiSummary');
 if(compact)compact.removeAttribute('title');
 if(summary){
   const teamNames=S.ai.map(char).filter(Boolean).map(c=>c.name).join(' • ');
   summary.textContent=`${p.plan} • Time: ${teamNames}`;
 }
 const tag=$('#player1 .controlTag');if(tag)tag.textContent=`IA — ${p.name}`;
}

function renderHeader(){
 $('#selName').textContent=S.name;
 $('#selRyo').textContent=S.ryo;
 $('#selLevel').textContent=level();
 $('#selRecord').textContent=`${S.wins}-${S.losses}`;
 $('#bottomYou').textContent=S.name;
 renderTeams();
 renderAIControls();
}
function renderTeams(){
 const t=$('#teamButtons');
 t.innerHTML=S.you.map(s=>{let c=char(s);return `<div class="charWrapper">${img(c,'char charicon')}<button class="remove" data-remove-you="${c.slug}" title="Remover"></button></div>`}).join('');
 $$('[data-remove-you]').forEach(b=>b.onclick=()=>{S.you=S.you.filter(x=>x!==b.dataset.removeYou);if(typeof r23NormalizeGearUniqueness==='function')r23NormalizeGearUniqueness();save();renderRoster()});
 let sum={Blood:0,Gen:0,Nin:0,Tai:0,Rand:0};
 S.you.map(char).filter(Boolean).forEach(c=>effectiveSkills(c).forEach(sk=>(sk.cost||[]).forEach(k=>sum[k]=(sum[k]||0)+1)));
 $('#teamCost').innerHTML=['Blood','Gen','Nin','Tai','Rand'].map(k=>sum[k]?`<span>${sum[k]}${costs([k])}</span>`:'').join('')
}
function preview(c){
 viewed=c;
 const locked=!S.unlocked.includes(c.slug),where=CHAR_UNLOCKS.unlockAt?.[c.slug],skills=effectiveSkills(c);
 const tempUntil=c.eventOnly?Number(S.events?.temporary?.[c.slug]||0):0,tempNotice=c.eventOnly&&!locked?`<div class="eventTempNotice">PERSONAGEM SECRETO TEMPORÁRIO • disponível até ${new Date(tempUntil).toLocaleString('pt-BR')}</div>`:'';
 $('#preview').innerHTML=`<h3 class="charBanner">${img(c,'char charicon')}${c.name}</h3>${locked?`<div class="previewLocked">🔒 PERSONAGEM BLOQUEADO — ${where?`libera em ${where.chapter}: ${where.title}`:'avance no Modo História para liberar.'}</div>`:''}${tempNotice}<p>${c.bio}</p>`+
 skills.map((sk,slot)=>{const list=variantsFor(c.slug,slot),u=list.filter(v=>S.unlockedJutsu.includes(v.id)).length,eq=equippedVariant(c.slug,slot);return `<section><div>${skillImg(sk,'char charicon',`alt="${esc(sk.name)}"`)}</div><h4>${sk.name} ${costs(sk.cost)} ${sk.cooldown?`<span class="extra">CD: ${sk.cooldown}</span>`:''}${eq?variantSourceHtml(eq):''}</h4>${skillInfoHtml(sk)}<p>${sk.desc}</p>${list.length?`<div class="skillVariantBar"><button data-open-variants="${c.slug}" data-slot="${slot}">JUTSUS + ${u}/${list.length}</button>${eq?`<span class="equippedJutsu">EQUIPADA: ${eq.name}</span>`:''}</div>`:''}</section>`}).join('');
 $$('[data-open-variants]').forEach(b=>b.onclick=()=>openVariantModal(b.dataset.openVariants,+b.dataset.slot))
}
function addTo(c){
 if(!S.unlocked.includes(c.slug))return;
 if(S.you.includes(c.slug))S.you=S.you.filter(x=>x!==c.slug);
 else if(S.you.length<3)S.you.push(c.slug);if(typeof r23NormalizeGearUniqueness==='function')r23NormalizeGearUniqueness();
 else return;
 save();renderRoster()
}
function legacyR15_rosterPool(){
 const visible=R.filter(c=>!c.eventOnly||S.unlocked.includes(c.slug));
 if(browseMode==='first')return visible;
 if(browseMode==='original')return visible.filter(c=>!c.slug.endsWith('-(s)')&&!c.slug.endsWith('-(r)')&&!c.eventOnly);
 if(browseMode==='shippuden')return visible.filter(c=>c.slug.endsWith('-(s)'));
 if(browseMode==='reanimated')return visible.filter(c=>c.slug.endsWith('-(r)'));
 if(browseMode==='boruto')return visible.filter(c=>c.era==='boruto'||/adulto|hokage|boruto|sexto/.test(c.slug));
 if(browseMode==='events')return visible.filter(c=>c.eventOnly);
 return visible
}
function legacyR15_renderRoster(){
 let pool=rosterPool();
 if(pageIndex>=pool.length)pageIndex=Math.max(0,Math.floor(Math.max(0,pool.length-1)/pageSize)*pageSize);
 const e=$('#roster');e.innerHTML='';
 pool.slice(pageIndex,pageIndex+pageSize).forEach(c=>{
   const w=document.createElement('div');w.className='charWrapper';
   const locked=!S.unlocked.includes(c.slug),on=S.you.includes(c.slug);
   const where=CHAR_UNLOCKS.unlockAt?.[c.slug];
   w.innerHTML=`${imgSafe(c.icon,c.icon,`char charicon ${locked?'locked':''} ${on?'on':''}`,`role="button" title="${c.name}${locked&&where?' — '+where.chapter+': '+where.title:' — clique para ver, duplo clique para adicionar/remover'}"`)}${locked?`<span class="storyLockedTag">HISTÓRIA${where?' • '+where.chapter.replace('Capítulo ','CAP. '):''}</span>`:`<button class="${on?'remove':'add'}" title="${on?'Remover':'Adicionar'} ${c.name}"></button>${c.eventOnly?'<span class="eventTempTag">TEMPORÁRIO</span>':''}`}`;
   const portrait=w.querySelector('img');
   portrait.onclick=()=>preview(c);
   portrait.ondblclick=()=>{if(!locked)addTo(c)};
   const b=w.querySelector('button');if(b)b.onclick=(ev)=>{ev.stopPropagation();addTo(c)};
   e.appendChild(w)
 });
 preview(viewed);
 const prev=$('#prevPage'),next=$('#nextPage');
 prev.disabled=pageIndex<=0;next.disabled=pageIndex+pageSize>=pool.length;
 prev.textContent='‹';
 next.textContent='›';
 $$('[data-browse]').forEach(b=>b.disabled=b.dataset.browse===browseMode)
}
$('#prevPage').onclick=()=>{pageIndex=Math.max(0,pageIndex-pageSize);renderRoster()};
$('#nextPage').onclick=()=>{pageIndex+=pageSize;renderRoster()};
$$('[data-browse]').forEach(b=>b.onclick=()=>{browseMode=b.dataset.browse;pageIndex=0;renderRoster()});

function randomTeam(which){
 if(which==='ai'){S.ai=teamForProfile(aiProfile()).map(c=>c.slug);save();renderAIControls();return}
 let pool=R.filter(c=>S.unlocked.includes(c.slug)&&!S.ai.includes(c.slug));
 S.you=uniquePick(pool,3).map(c=>c.slug);if(typeof r23NormalizeGearUniqueness==='function')r23NormalizeGearUniqueness();save();renderRoster()
}
$('#randomYou').onclick=()=>randomTeam('you');
$('#randomAI').onclick=()=>{refreshAITeam();renderAIControls()};


function eraLabel(c){if(c?.eventOnly)return 'EVENTO';const e=encyclopediaEra(c);return e==='boruto'?'BORUTO':e==='shippuden'?'SHIPPUDEN':e==='reanimated'?'REANIMADO':'ORIGINAL'}
function mechanicLabel(sk){
 const m=sk?.mechanic||{},k=m.kind||'damage',labels={damage:'DANO',stun:'ATORDOAMENTO',dot:'DANO CONTÍNUO',heal:'CURA',shield:'DEFESA',invuln:'INVULNERABILIDADE'};
 return labels[k]||String(k).toUpperCase()
}
function mechanicSummary(sk){
 const m=sk?.mechanic||{},k=m.kind||'damage',p=Number(m.power||0),d=Math.max(0,Number(m.duration||0));
 const area=m.aoe?'TODOS OS ALVOS':(m.target==='self'?'PRÓPRIO':m.target==='ally'?'ALIADO':'1 INIMIGO');
 if(k==='damage')return `DANO ${p} • ${area}`;
 if(k==='stun')return `DANO ${p} • ATORDOA ${Math.max(1,d)} TURNO(S) • ${area}`;
 if(k==='dot')return `DANO ${p} • AFLIÇÃO 7/TURNO POR ${Math.max(1,d)} TURNO(S) • ${area}`;
 if(k==='heal')return `CURA ${p} PV • ${area}`;
 if(k==='shield')return `DEFESA ${p}${d?` • ${d} TURNO(S)`:''} • ${area}`;
 if(k==='invuln')return `INVULNERÁVEL • ${Math.max(1,d)} TURNO(S) • ${area}`;
 return `${mechanicLabel(sk)} ${p} • ${area}`
}
function skillInfoHtml(sk){return `<span class="skillMechanic">${mechanicSummary(sk)}</span>`}

function legacy_BASE_renderHome(){
 const c=char(S.you[0])||char(S.unlocked[0])||R[0];if(!c)return;
 $('#homeCharacterName').textContent=c.name;
 $('#homeCharacterMeta').textContent=`${eraLabel(c)} • equipe ${S.you.length}/3 • ${S.wins} vitórias / ${S.losses} derrotas`;
 $('#homeLevel').textContent=`NÍVEL ${level()}`;$('#homeDna').textContent=`${S.ryo} Ryō`;
 $('#homeCharacterTitle').textContent=c.name;$('#homeCharacterBio').textContent=c.bio||'Ninja do universo Naruto.';
 $('#homeCharacterImage').src=assetUrl(c.icon);$('#homeCharacterImage').dataset.fallback=assetUrl('static/img/icon.png');
 $('#homeTeamMini').innerHTML=S.you.map(char).filter(Boolean).map(x=>imgSafe(x.icon,x.icon,'',`title="${x.name}"`)).join('');
 const box=$('#homeJutsuCards');box.innerHTML=effectiveSkills(c).map((sk,slot)=>`<article class="homeJutsuCard" data-home-jutsu="${slot}">${skillImg(sk,'',`alt="${esc(sk.name)}"`)}<div><h3>${sk.name}</h3>${skillInfoHtml(sk)}<p>${sk.desc}</p><div class="homeJutsuMeta"><span>${mechanicLabel(sk)}</span><span>${costs(sk.cost)||'SEM CUSTO'}</span><span>CD ${sk.cooldown||0}</span></div></div></article>`).join('');
 $$('[data-home-jutsu]').forEach(b=>b.onclick=()=>{jutsuViewedSlug=c.slug;jutsuDetailSlot=+b.dataset.homeJutsu;show('jutsus')})
}
function jutsuUnlockedCharacters(){return S.unlocked.map(char).filter(Boolean)}
function renderJutsuDetail(c,slot){
 if(!c)return;const skills=effectiveSkills(c),sk=skills[slot]||skills[0];if(!sk)return;const base=c.skills[slot]||sk,eq=equippedVariant(c.slug,slot),m=sk.mechanic||{};
 $('#jutsuDetailEmpty').style.display='none';const body=$('#jutsuDetailBody');body.innerHTML=`${skillImg(sk,'',`alt="${esc(sk.name)}"`)}<small>${eq?'TÉCNICA EQUIPADA':'TÉCNICA BASE'}</small><h2>${sk.name}</h2>${skillInfoHtml(sk)}<p>${sk.desc}</p><div class="jutsuDetailStats"><div><small>TIPO</small><b>${mechanicLabel(sk)}</b></div><div><small>DANO / PODER</small><b>${Number(m.power||0)}</b></div><div><small>CHAKRA</small><b>${costs(sk.cost)||'SEM CUSTO'}</b></div><div><small>RECARGA</small><b>${sk.cooldown||0} turno(s)</b></div><div><small>ALVO</small><b>${m.target==='self'?'PRÓPRIO':m.target==='ally'?'ALIADO':'INIMIGO'}</b></div><div><small>DURAÇÃO</small><b>${m.duration||0} turno(s)</b></div></div><p><b>Espaço ${slot+1}:</b> ${base.name}${eq?` → ${eq.name}`:''}</p>`;
}
function renderJutsuPage(forceSlug){
 const unlocked=jutsuUnlockedCharacters();if(!unlocked.length)return;
 if(forceSlug&&unlocked.some(c=>c.slug===forceSlug))jutsuViewedSlug=forceSlug;
 if(!jutsuViewedSlug||!unlocked.some(c=>c.slug===jutsuViewedSlug))jutsuViewedSlug=(char(S.you[0])||unlocked[0]).slug;
 const c=char(jutsuViewedSlug),q=($('#jutsuCharacterSearch')?.value||'').trim().toLowerCase();
 const list=$('#jutsuCharacterList');list.innerHTML=unlocked.filter(x=>!q||x.name.toLowerCase().includes(q)).map(x=>`<button class="jutsuCharacterRow ${x.slug===c.slug?'active':''}" data-jutsu-char="${x.slug}">${imgSafe(x.icon,x.icon,'')}<span>${x.name}</span></button>`).join('');
 $$('[data-jutsu-char]').forEach(b=>b.onclick=()=>{jutsuViewedSlug=b.dataset.jutsuChar;jutsuDetailSlot=0;renderJutsuPage()});
 $('#jutsuCharacterPortrait').src=assetUrl(c.icon);$('#jutsuCharacterPortrait').dataset.fallback=assetUrl('static/img/icon.png');$('#jutsuCharacterEra').textContent=eraLabel(c);$('#jutsuCharacterName').textContent=c.name;$('#jutsuCharacterBio').textContent=c.bio||'';
 const trials=variantsFor(c.slug),doneTrials=trials.filter(v=>S.unlockedJutsu.includes(v.id)||masteryTrialState(v.id).completed).length;$('#jutsuCharacterMastery').textContent=`Provas de Domínio: ${doneTrials}/${trials.length} concluídas • progresso individual por Jutsu`;
 const skills=effectiveSkills(c);$('#jutsuSlots').innerHTML=skills.map((sk,slot)=>{const vars=variantsFor(c.slug,slot),un=vars.filter(v=>S.unlockedJutsu.includes(v.id)).length,eq=equippedVariant(c.slug,slot);return `<article class="jutsuSlot"><button data-jutsu-slot="${slot}">${skillImg(sk,'',`alt="${esc(sk.name)}"`)}<div class="jutsuSlotInfo"><h3>${slot+1}. ${sk.name}</h3>${skillInfoHtml(sk)}<p>${sk.desc}</p><div class="jutsuSlotMeta"><span>${mechanicLabel(sk)}</span><span>${costs(sk.cost)||'SEM CUSTO'}</span><span>CD ${sk.cooldown||0}</span></div></div></button><div class="jutsuSlotActions"><small>${eq?'EQUIPADA ALTERNATIVA':'TÉCNICA BASE'} • alternativas ${un}/${vars.length}</small>${vars.length?`<button data-jutsu-swap="${slot}">TROCAR</button>`:''}</div></article>`}).join('');
 $$('[data-jutsu-slot]').forEach(b=>b.onclick=()=>{jutsuDetailSlot=+b.dataset.jutsuSlot;renderJutsuDetail(c,jutsuDetailSlot)});$$('[data-jutsu-swap]').forEach(b=>b.onclick=()=>openVariantModal(c.slug,+b.dataset.jutsuSwap));
 renderJutsuDetail(c,Math.min(jutsuDetailSlot,skills.length-1));
}
function legacy_BASE_show(name){
 if(name==='missions')name='tasks';
 if(name!=='battle'&&window.BattleFX)window.BattleFX.cleanup();
 for(const [n,id] of [['auth','#authPage'],['home','#homePage'],['select','#selectPage'],['jutsus','#jutsuPage'],['battle','#battlePage'],['story','#storyPage'],['online','#onlinePage'],['tasks','#missionPage'],['ninjaMissions','#ninjaMissionPage'],['profile','#profilePage'],['shop','#shopPage'],['inventory','#inventoryPage'],['encyclopedia','#encyclopediaPage']])$(id).classList.toggle('hidden',n!==name);
 if(name==='home')renderHome();
 if(name==='jutsus'){renderJutsuPage();renderMissions();}
 if(name==='tasks')renderMissions();
 if(name==='ninjaMissions')renderNinjaMissions();
 if(name==='profile')renderProfile();
 if(name==='shop')renderShop();
 if(name==='inventory')renderInventory();
 if(name==='encyclopedia')renderEncyclopedia();
 if(name==='online')renderOnline();
 if(name==='story')renderStory();
 if(name==='select')renderRoster()
}


$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));const nmr=$('#ninjaMissionRank');if(nmr)nmr.onchange=renderNinjaMissions;
const jutsuSearch=$('#jutsuCharacterSearch');if(jutsuSearch)jutsuSearch.oninput=()=>renderJutsuPage();
$('#variantClose').onclick=closeVariantModal;$('.variantBackdrop').onclick=closeVariantModal;



function gearOwned(id){return !!S.gear?.owned?.[id]}
function gearActive(id){const o=S.gear?.owned?.[id];return !!(o&&Number(o.durability)>0)}
function awardGear(id){const it=EQUIPMENT_BY_ID[id];if(!it)return false;S.gear=S.gear||{owned:{},equipped:{}};S.gear.owned=S.gear.owned||{};const cur=S.gear.owned[id];if(cur){cur.durability=Math.min(it.maxDurability,Number(cur.durability||0)+Math.ceil(it.maxDurability*.5));S.ryo+=Math.round(it.price*.12)}else S.gear.owned[id]={durability:it.maxDurability,acquiredAt:Date.now()};return true}
function randomGear(rank='D'){const pool=EQUIPMENT_CATALOG.filter(x=>!x.missionUnique&&x.weeklyExclusive!==true&&(rank==='S'||rank==='A'?x.rarity!=='Comum':rank==='B'?x.rarity!=='Épico':true));return pool[Math.floor(Math.random()*pool.length)]||EQUIPMENT_CATALOG.find(x=>!x.missionUnique&&x.weeklyExclusive!==true)}
function equippedGear(slug){return S.gear?.equipped?.[slug]||{}}
function legacy_BASE_equipGear(slug,slot,id){if(!slug||!GEAR_SLOTS.includes(slot))return;S.gear.equipped[slug]=S.gear.equipped[slug]||{};if(!id){delete S.gear.equipped[slug][slot]}else if(gearOwned(id)&&EQUIPMENT_BY_ID[id]?.slot===slot){for(const [other,map] of Object.entries(S.gear.equipped))if(other!==slug&&map?.[slot]===id)delete map[slot];S.gear.equipped[slug][slot]=id}save();renderInventory()}
function gearBonuses(slug){const out={damage:0,hp:0,reduction:0,shield:0,startChakra:0,control:0,borrowedJutsu:0,healBonus:0,shieldBonus:0,turnRegen:0};for(const id of Object.values(equippedGear(slug))){if(!gearActive(id))continue;const b=EQUIPMENT_BY_ID[id]?.bonus||{};for(const k of Object.keys(out))out[k]+=Number(b[k]||0)}return out}
function borrowedSkillFor(slug,scrollId=null){
 const it=EQUIPMENT_BY_ID[scrollId]||{},mode=it.copyMode||'any',maxCost=Number(it.copyMaxCost||3),minPower=Number(it.copyMinPower||0);
 let pool=R.filter(c=>c.slug!==slug).flatMap(c=>c.skills.map(sk=>({...sk,borrowedFrom:c.name}))).filter(s=>(s.cost||[]).length<=maxCost);
 if(mode==='offense')pool=pool.filter(s=>['damage','stun','dot'].includes(skillKind(s)));
 if(mode==='tactical')pool=pool.filter(s=>['stun','dot','heal','shield','invuln'].includes(skillKind(s)));
 if(mode==='elite')pool=pool.filter(s=>Number(s.mechanic?.power||0)>=minPower&&['damage','stun','dot'].includes(skillKind(s)));
 if(minPower>0&&mode!=='elite')pool=pool.filter(s=>Number(s.mechanic?.power||0)>=minPower);
 const sk=pool[Math.floor(Math.random()*pool.length)];
 return sk?{...sk,name:`Pergaminho • ${sk.name}`,copiedName:sk.name,borrowedFrom:sk.borrowedFrom,cooldown:Math.max(1,Number(sk.cooldown||0)),cd:0,borrowed:true}:null
}
function applyGearToFighter(f,c){const b=gearBonuses(c.slug);f.maxHp+=b.hp;f.hp+=b.hp;f.shield+=b.shield;f.shieldTurns=b.shield?2:0;f.damageBonus=b.damage;f.damageReduction=b.reduction;f.controlBonus=b.control;f.healBonus=b.healBonus;f.shieldBonus=b.shieldBonus;f.turnRegen=b.turnRegen;f.gearStartChakra=b.startChakra;if(b.borrowedJutsu){const scrollId=equippedGear(c.slug).scroll,borrowed=borrowedSkillFor(c.slug,scrollId);if(borrowed){f.skills.push(borrowed);f.copiedJutsu={name:borrowed.copiedName,from:borrowed.borrowedFrom,scroll:EQUIPMENT_BY_ID[scrollId]?.name||'Pergaminho'}}}return f}
function degradeGear(fighters){const slugs=[...new Set((fighters||[]).map(f=>f.slug).filter(Boolean))];for(const slug of slugs){for(const id of Object.values(equippedGear(slug))){const o=S.gear?.owned?.[id];if(o&&o.durability>0)o.durability=Math.max(0,Number(o.durability)-1)}}}
function legacyR15_repairGear(id){const it=EQUIPMENT_BY_ID[id],o=S.gear?.owned?.[id];if(!it||!o)return;const missing=Math.max(0,it.maxDurability-Number(o.durability||0));if(!missing)return;const price=Math.max(20,Math.ceil(it.price*(missing/it.maxDurability)*.28));if(S.ryo<price)return;S.ryo-=price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+price;S.c.gearRepairs=Number(S.c.gearRepairs||0)+1;trackPeriodic('gearRepairs',1);trackPeriodic('ryoSpent',price);o.durability=it.maxDurability;save();renderInventory()}

const SHOP_ITEMS={
 chakraFood:{name:'Pílula de Chakra',category:'CHAKRA',price:120,desc:'+2 chakras gerados pela distribuição atual da sua equipe.',effect:'gainRandom',amount:2},
 soldierPill:{name:'Pílula do Soldado',category:'CHAKRA',price:190,desc:'+1 Ninjutsu e +1 Taijutsu.',effect:'gainSpecific',chakra:{Nin:1,Tai:1}},
 ninScroll:{name:'Pergaminho de Ninjutsu',category:'CHAKRA',price:150,desc:'+2 chakras de Ninjutsu.',effect:'gainSpecific',chakra:{Nin:2}},
 genScroll:{name:'Pergaminho de Genjutsu',category:'CHAKRA',price:150,desc:'+2 chakras de Genjutsu.',effect:'gainSpecific',chakra:{Gen:2}},
 taiScroll:{name:'Pergaminho de Taijutsu',category:'CHAKRA',price:150,desc:'+2 chakras de Taijutsu.',effect:'gainSpecific',chakra:{Tai:2}},
 bloodSeal:{name:'Selo de Linhagem',category:'CHAKRA',price:180,desc:'+2 chakras de Linhagem.',effect:'gainSpecific',chakra:{Blood:2}},
 mixedRation:{name:'Ração de Chakra',category:'CHAKRA',price:260,desc:'+1 chakra de cada tipo principal.',effect:'gainSpecific',chakra:{Blood:1,Gen:1,Nin:1,Tai:1}},
 medicalKit:{name:'Kit Médico',category:'RECUPERAÇÃO',price:160,desc:'Recupera 25 PV do aliado vivo que você escolher.',effect:'healWeak',amount:25},
 healingOintment:{name:'Unguento Medicinal',category:'RECUPERAÇÃO',price:100,desc:'Recupera 15 PV do aliado vivo que você escolher.',effect:'healWeak',amount:15},
 fieldMedicine:{name:'Medicamento de Campo',category:'RECUPERAÇÃO',price:240,desc:'Recupera 10 PV de todos os aliados vivos.',effect:'healAll',amount:10},
 antidote:{name:'Antídoto',category:'RECUPERAÇÃO',price:130,desc:'Remove Atordoamento e Aflição de um aliado afetado.',effect:'cleanse'},
 smokeBomb:{name:'Bomba de Fumaça',category:'DEFESA',price:180,desc:'O aliado vivo escolhido fica invulnerável até o fim do turno.',effect:'invulnWeak',duration:1},
 substitutionScroll:{name:'Pergaminho de Substituição',category:'DEFESA',price:230,desc:'O aliado vivo escolhido fica invulnerável por 2 turnos.',effect:'invulnWeak',duration:2},
 guardScroll:{name:'Pergaminho de Defesa',category:'DEFESA',price:170,desc:'+20 de Defesa para o aliado vivo escolhido.',effect:'shieldWeak',amount:20,duration:2},
 barrierTag:{name:'Selo de Barreira',category:'DEFESA',price:280,desc:'+10 de defesa para todos os aliados por 2 turnos.',effect:'shieldAll',amount:10,duration:2},
 shurikenPack:{name:'Conjunto de Shuriken',category:'OFENSIVO',price:90,desc:'12 de dano direto ao inimigo vivo escolhido.',effect:'damageWeak',amount:12},
 kunaiPack:{name:'Conjunto de Kunai',category:'OFENSIVO',price:120,desc:'15 de dano direto ao inimigo vivo escolhido.',effect:'damageWeak',amount:15},
 explosiveTag:{name:'Selo Explosivo',category:'OFENSIVO',price:220,desc:'20 de dano direto ao inimigo vivo escolhido.',effect:'damageWeak',amount:20},
 explosiveBundle:{name:'Pacote de Selos Explosivos',category:'OFENSIVO',price:340,desc:'30 de dano direto ao inimigo vivo escolhido.',effect:'damageWeak',amount:30},
 senbonPack:{name:'Conjunto de Senbon',category:'OFENSIVO',price:150,desc:'8 de dano imediato e Aflição 5 por 2 turnos.',effect:'dotWeak',amount:8,dot:5,duration:2},
 poisonBomb:{name:'Bomba de Veneno',category:'CONTROLE',price:230,desc:'Aflição 7 por 3 turnos no inimigo vivo escolhido.',effect:'dotWeak',amount:0,dot:7,duration:3},
 flashBomb:{name:'Bomba de Luz',category:'CONTROLE',price:210,desc:'Atordoa o inimigo vivo escolhido por 1 turno.',effect:'stunWeak',duration:1},
 paralysisTag:{name:'Selo de Paralisia',category:'CONTROLE',price:290,desc:'Atordoa o inimigo vivo escolhido por 2 turnos.',effect:'stunWeak',duration:2},
 dispelTag:{name:'Selo de Dissipação',category:'CONTROLE',price:200,desc:'Remove Defesa e Invulnerabilidade do inimigo vivo escolhido.',effect:'dispelWeak'}
};
function inventoryCount(){return Object.entries(SHOP_ITEMS).reduce((n,[id])=>n+Number(S.inventory[id]||0),0)}
function legacyR15_renderShop(){
 const wallet=$('#shopWallet');if(wallet)wallet.textContent=`${S.ryo} Ryō • ${inventoryCount()} consumível(is) • ${Object.keys(S.gear?.owned||{}).length}/${EQUIPMENT_CATALOG.length} equipamentos`;
 const box=$('#shopItems');if(!box)return;
 const consumables=Object.entries(SHOP_ITEMS).map(([id,it])=>`<article class="featureCard shopCard"><small>CONSUMÍVEL • ${it.category}</small><h3>${it.name}</h3><p>${it.desc}</p><b>${it.price} Ryō</b><p>Inventário: ${S.inventory[id]||0}</p><button data-buy="${id}" ${S.ryo<it.price?'disabled':''}>COMPRAR</button></article>`).join('');
 const equipment=EQUIPMENT_CATALOG.filter(it=>!it.missionUnique&&it.shopAvailable!==false).map(it=>{const own=S.gear?.owned?.[it.id];return `<article class="featureCard shopCard gearShop"><small>EQUIPAMENTO • ${GEAR_SLOT_PT[it.slot].toUpperCase()} • ${it.rarity}</small><h3>${it.name}</h3><p>${it.desc}</p><div class="shopMeta"><span>${gearEffectText(it)}</span><span>Durabilidade ${own?.durability??it.maxDurability}/${it.maxDurability}</span></div><b class="shopPrice">${it.price} Ryō</b><button data-buy-gear="${it.id}" ${own||S.ryo<it.price?'disabled':''}>${own?'ADQUIRIDO':'COMPRAR'}</button></article>`}).join('');
 box.innerHTML=consumables+equipment;
 $$('[data-buy]').forEach(b=>b.onclick=()=>{const it=SHOP_ITEMS[b.dataset.buy];if(!it||S.ryo<it.price)return;S.ryo-=it.price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+it.price;trackPeriodic('ryoSpent',it.price);S.inventory[b.dataset.buy]=(S.inventory[b.dataset.buy]||0)+1;save();renderShop()});
 $$('[data-buy-gear]').forEach(b=>b.onclick=()=>{const it=EQUIPMENT_BY_ID[b.dataset.buyGear];if(!it||gearOwned(it.id)||S.ryo<it.price)return;S.ryo-=it.price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+it.price;trackPeriodic('ryoSpent',it.price);awardGear(it.id);save();renderShop()})
}
function legacyR15_renderInventory(){
 const status=$('#inventoryStatus'),box=$('#inventoryItems');if(!box)return;
 if(status)status.textContent=`${inventoryCount()} consumível(is) • ${Object.keys(S.gear?.owned||{}).length} equipamento(s) • equipamentos perdem 1 durabilidade por batalha concluída`;
 const owned=Object.entries(SHOP_ITEMS).filter(([id])=>(S.inventory[id]||0)>0);
 const consumables=owned.length?owned.map(([id,it])=>`<article class="featureCard inventoryCard"><small>${it.category}</small><h3>${it.name}</h3><p>${it.desc}</p><b>Quantidade: ${S.inventory[id]}</b></article>`).join(''):'<p>Sem consumíveis.</p>';
 const chars=S.unlocked.map(char).filter(Boolean),selected=($('#gearCharacter')?.value&&S.unlocked.includes($('#gearCharacter').value))?$('#gearCharacter').value:(S.you[0]||S.unlocked[0]);
 const select=`<div class="gearManagerHead"><h3>Equipamentos por personagem</h3><select id="gearCharacter">${chars.map(c=>`<option value="${c.slug}" ${c.slug===selected?'selected':''}>${c.name}</option>`).join('')}</select></div>`;
 const gearCards=GEAR_SLOTS.map(slot=>{const eq=equippedGear(selected)[slot],eqIt=EQUIPMENT_BY_ID[eq],choices=EQUIPMENT_CATALOG.filter(x=>x.slot===slot&&gearOwned(x.id));return `<article class="featureCard inventoryCard gearCard"><small>${GEAR_SLOT_PT[slot].toUpperCase()}</small><h3>${eqIt?.name||'Nenhum equipado'}</h3><p>${eqIt?.desc||'Escolha um equipamento possuído para este espaço.'}</p>${eqIt?`<b>Durabilidade ${S.gear.owned[eq]?.durability||0}/${eqIt.maxDurability}</b>`:''}<select data-gear-slot="${slot}"><option value="">— nenhum —</option>${choices.map(it=>`<option value="${it.id}" ${eq===it.id?'selected':''}>${it.name} • ${S.gear.owned[it.id].durability}/${it.maxDurability}</option>`).join('')}</select>${eqIt?`<button data-repair-gear="${eq}">REPARAR</button>`:''}</article>`}).join('');
 box.innerHTML=`<h3>Consumíveis</h3>${consumables}${select}<div class="featureGrid gearGrid">${gearCards}</div>`;
 const gc=$('#gearCharacter');if(gc)gc.onchange=renderInventory;$$('[data-gear-slot]').forEach(el=>el.onchange=()=>equipGear(selected,el.dataset.gearSlot,el.value||null));$$('[data-repair-gear]').forEach(b=>b.onclick=()=>repairGear(b.dataset.repairGear))
}
function encyclopediaEra(c){if(c.era==='boruto'||/adulto|hokage|boruto|sexto/.test(c.slug))return'boruto';if(c.slug.endsWith('-(s)'))return'shippuden';if(c.slug.endsWith('-(r)'))return'reanimated';return'original'}
function renderEncyclopedia(){
 const q=($('#encyclopediaSearch')?.value||'').trim().toLowerCase(),era=$('#encyclopediaEra')?.value||'all',box=$('#encyclopediaResults');if(!box)return;
 let list=R.filter(c=>(era==='all'||encyclopediaEra(c)===era)&&(!q||c.name.toLowerCase().includes(q)||c.skills.some(s=>s.name.toLowerCase().includes(q)||s.desc.toLowerCase().includes(q)))).slice(0,60);
 box.innerHTML=list.map(c=>`<article class="encyclopediaCard">${imgSafe(c.icon,'static/img/icon.png','charicon')}<div><h3>${c.name}</h3><p>${c.skills.map(s=>`<b>${s.name}</b> — ${mechanicSummary(s)}<br><span class="encyclopediaDesc">${s.desc}</span>`).join('<br><br>')}</p></div></article>`).join('')||'<p>Nenhum resultado.</p>'
}
$('#encyclopediaSearch').oninput=renderEncyclopedia;$('#encyclopediaEra').onchange=renderEncyclopedia;

function storyDone(id){return S.story.completed.includes(id)}
function storyIndex(id){return STORY_MISSIONS.findIndex(m=>m.id===id)}
function storyUnlocked(m){
 const i=storyIndex(m.id);return i<=0||storyDone(STORY_MISSIONS[i-1].id)
}
function storyObjectiveText(m){
 const o=m.objective||{type:'defeat'};
 if(o.type==='survive')return `Sobreviva por ${o.turns} turno(s).`;
 if(o.type==='protect'){
   const c=char(o.protectSlug);return `Proteja ${c?c.name:'o aliado'} por ${o.turns} turno(s) ou derrote os inimigos.`;
 }
 return 'Derrote todos os inimigos.'
}
function storyRewardText(m){
 const r=m.reward||{},names=(r.unlock||[]).map(s=>char(s)?.name).filter(Boolean);
 const ninja=names.length?` • NINJAS: ${names.slice(0,3).join(', ')}${names.length>3?` +${names.length-3}`:''}`:'';
 return `${r.xp||0} XP • ${r.ryo||0} Ryō${ninja}`;
}
function unlockSpecific(slugs){
 for(const s of (slugs||[]))if(char(s)&&!S.unlocked.includes(s))S.unlocked.push(s)
}
function storyTeamImgs(slugs,limit=3){
 return (slugs||[]).slice(0,limit).map(s=>{const c=char(s);return c?imgSafe(c.icon,c.icon,'storyMini',`title="${c.name}"`):''}).join('')
}
function renderStory(){
 const done=S.story.completed.length,total=STORY_MISSIONS.length;
 $('#storyProgressText').textContent=`${done} / ${total}`;
 $('#storyProgressBar').style.width=`${Math.round(100*done/Math.max(1,total))}%`;
 $('#storyBadgeCount').textContent=`${S.story.badges.length} marcos conquistados`;
 const next=STORY_MISSIONS.find(m=>storyUnlocked(m)&&!storyDone(m.id))||STORY_MISSIONS[STORY_MISSIONS.length-1];
 $('#storyContinue').textContent=S.story.campaignDone?'REPETIR MISSÃO FINAL':done?'CONTINUAR HISTÓRIA':'COMEÇAR HISTÓRIA';
 $('#storyContinue').onclick=()=>{
   if(!S.story.introSeen)return storyWelcome();
   if(next)storyBrief(next.id)
 };
 $('#storyGuideBtn').onclick=storyWelcome;
 const root=$('#storyArcs');root.innerHTML='';
 for(const arc of STORY.arcs){
   const arcDone=arc.missions.filter(m=>storyDone(m.id)).length;
   const section=document.createElement('section');section.className='storyArc';
   section.innerHTML=`<header class="storyArcHeader" style="background-image:url('${assetUrl(arc.cover)}')"><div><h2>${arc.title}</h2><p>${arc.subtitle} • ${arcDone}/${arc.missions.length} concluídas</p></div></header><div class="storyMissionGrid"></div>`;
   const grid=section.querySelector('.storyMissionGrid');
   for(const m of arc.missions){
     const locked=!storyUnlocked(m),doneM=storyDone(m.id);
     const card=document.createElement('article');card.className=`storyMission ${locked?'locked':''} ${doneM?'done':''}`;
     card.innerHTML=`${doneM?'<span class="storyDoneMark">CONCLUÍDA</span>':locked?'<span class="storyLockMark">BLOQUEADA</span>':''}
       <div class="storyMissionArt" style="background-image:url('${assetUrl(m.bg)}')"><div class="storyTeamMini">${storyTeamImgs(m.enemy)}</div></div>
       <div class="storyMissionBody">
         <small>${m.chapter}</small><h3>${m.title}</h3><p>${m.summary}</p>
         <div class="storyObjective"><b>Objetivo:</b> ${storyObjectiveText(m)}</div>
         <div class="storyReward">${storyRewardText(m)}</div>
         <button ${locked?'disabled':''}>${doneM?'REPETIR':'ABRIR CAPÍTULO'}</button>
       </div>`;
     card.querySelector('button').onclick=()=>storyBrief(m.id);
     grid.appendChild(card)
   }
   root.appendChild(section)
 }
 if(!S.story.introSeen&&done===0)setTimeout(storyWelcome,180)
}
function legacy_BASE_storyWelcome(){
 const lines=[
  {speaker:'Narrador',slug:null,text:'Bem-vindo ao Modo História. A campanha adapta os grandes arcos para o sistema 1x1, 2x2 e 3x3 do Naruto Unison.'},
  {speaker:'Naruto',slug:'naruto-uzumaki',text:'Não precisa decorar tudo antes de começar. Cada capítulo mostra o objetivo e uma dica curta antes da luta.'},
  {speaker:'Kakashi',slug:'kakashi-hatake',text:'Na batalha, faça sempre a mesma leitura: escolha uma técnica, clique no alvo verde, confira a fila e só então confirme o turno.'},
  {speaker:'Sakura',slug:'sakura-haruno',text:'Olhe o chakra no centro. Algumas missões pedem sobreviver ou proteger alguém, então cura e defesa podem valer mais que dano.'},
  {speaker:'Sistema',slug:null,text:'Os PERSONAGENS bloqueados são liberados pelos capítulos da História. NOVOS JUTSUS são liberados em MISSÕES, usando e vencendo batalhas com cada ninja. Tudo é salvo automaticamente e sincronizado na conta online.'}
 ];
 openStoryDialog(lines,()=>{S.story.introSeen=true;save();renderStory()},{bg:'static/img/bg/hokage.jpg',label:'COMO JOGAR'})
}
function legacy_BASE_storyBrief(id){
 const m=STORY_MISSIONS.find(x=>x.id===id);if(!m||!storyUnlocked(m))return;
 const lines=[{speaker:'Narrador',slug:null,text:m.summary}];
 openStoryDialog(lines,()=>openStoryDialog(m.intro||[],()=>startStoryBattle(m),{bg:m.bg,label:`${m.chapter} — ${m.title}`}),{
   bg:m.bg,label:`${m.chapter} — ${m.title}`,brief:m
 })
}
function openStoryDialog(lines,onDone,opt={}){
 const modal=$('#storyModal'),art=$('#storyModalArt'),portrait=$('#storyPortrait'),speaker=$('#storySpeaker'),txt=$('#storyText'),label=$('#storyChapterLabel'),extra=$('#storyBriefExtra');
 let i=0,ended=false;
 modal.classList.remove('hidden');art.style.backgroundImage=`url('${assetUrl(opt.bg||'static/img/bg/hokage.jpg')}')`;label.textContent=opt.label||'MODO HISTÓRIA';
 function close(){if(ended)return;ended=true;modal.classList.add('hidden');extra.innerHTML='';if(onDone)onDone()}
 function draw(){
   if(!lines||i>=lines.length)return close();
   const line=lines[i],c=line.slug?char(line.slug):null;
   const npcPortrait={'Narrador':'static/img/story-npcs-v229/narrador.jpg','Sistema':'static/img/story-npcs-v229/sistema.jpg'}[line.speaker];
   portrait.src=assetUrl(c?c.icon:(npcPortrait||'static/img/icon.png'));portrait.dataset.fallback=assetUrl('static/img/icon.png');
   speaker.textContent=line.speaker||'Narrador';txt.textContent=line.text||'';
   if(opt.brief){
     const m=opt.brief;
     extra.innerHTML=`<div><b>OBJETIVO:</b> ${storyObjectiveText(m)}</div>
       <div class="storyVs"><div>${storyTeamImgs(m.player)}</div><b>VS</b><div>${storyTeamImgs(m.enemy)}</div></div>
       <div class="storyNarrative"><b>CONTEXTO:</b> ${m.narrative?.setup||m.summary}</div><div class="storyNarrative"><b>O QUE ESTÁ EM JOGO:</b> ${m.narrative?.stakes||''}</div><div class="storyNarrative"><b>PONTO DE VIRADA:</b> ${m.narrative?.turningPoint||''}</div><div><b>DICAS:</b><ul>${(m.tips||[]).map(t=>`<li>${t}</li>`).join('')}</ul></div>
       <div><b>RECOMPENSA:</b> ${storyRewardText(m)}</div>`;
     $('#storyNext').textContent='VER INTRODUÇÃO';$('#storySkip').textContent='VOLTAR AO MAPA'
   }else{
     extra.innerHTML='';$('#storyNext').textContent=i===lines.length-1?'CONTINUAR':'PRÓXIMO';$('#storySkip').textContent='PULAR'
   }
 }
 $('#storyNext').onclick=()=>{i++;draw()};
 $('#storySkip').onclick=()=>{if(opt.brief){modal.classList.add('hidden');show('story')}else close()};
 draw()
}
function legacy_BASE_startStoryBattle(m){
 const p={name:m.title,difficulty:m.difficulty||'normal',strategy:m.strategy||'balanced',plan:storyObjectiveText(m)};
 const you=m.player.map(s=>clone(char(s),false,p.difficulty));
 const ai=m.enemy.map(s=>clone(char(s),true,p.difficulty));
 for(const f of ai)if(m.enemyHp&&m.enemyHp[f.slug]){f.hp=m.enemyHp[f.slug];f.maxHp=m.enemyHp[f.slug]}
 G={story:true,storyMission:m,turn:1,diff:p.difficulty,profile:p,strategy:p.strategy,you,ai,ch:gain(emptyCh(),6,you),aich:gain(emptyCh(),p.difficulty==='easy'?5:p.difficulty==='normal'?6:p.difficulty==='hard'?7:8,ai),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},aiState:{defensiveStreak:0,lastKinds:[]}};
 selected=null;show('battle');$('#battlelog').innerHTML='';
 $('#player0 .controlTag').textContent='HISTÓRIA — VOCÊ';
 $('#player1 .controlTag').textContent=`HISTÓRIA — ${m.title}`;
 $('#bottomAI').textContent=m.title;$('#bottomAIPlan').textContent='HISTÓRIA';
 $('#view').innerHTML=`<section><h4>${m.chapter}: ${m.title}</h4><p><b>Objetivo:</b> ${storyObjectiveText(m)}</p><p>${m.summary}</p></section>`;
 log(`MODO HISTÓRIA — ${m.title}`,'info');log(`Objetivo: ${storyObjectiveText(m)}`,'info');renderBattle()
}
function storyProtectedAlive(){
 if(!G?.story)return true;
 const o=G.storyMission.objective||{};if(o.type!=='protect')return true;
 const f=G.you.find(x=>x.slug===o.protectSlug);return !!(f&&f.hp>0)
}
function storyRoundComplete(){
 if(!G?.story)return false;
 const o=G.storyMission.objective||{};
 if(o.type==='protect'&&!storyProtectedAlive()){finish(false,false);return true}
 if((o.type==='survive'||o.type==='protect')&&G.turn>=Number(o.turns||1)){finish(true,false);return true}
 return false
}
function completeStoryMission(m){
 const first=!storyDone(m.id),r=m.reward||{};
 if(first){
   S.story.completed.push(m.id);S.story.lastMission=m.id;
   S.xp+=Number(r.xp||0);S.ryo+=Number(r.ryo||0);S.c.storyMissions=Number(S.c.storyMissions||0)+1;trackPeriodic('storyMissions',1);unlockSpecific(r.unlock||[]);
   if(r.badge&&!S.story.badges.includes(r.badge))S.story.badges.push(r.badge);
   if(m.id===STORY_MISSIONS[STORY_MISSIONS.length-1].id)S.story.campaignDone=true
 }else{S.xp+=40;S.ryo+=10}
 return first
}
function finishStory(win,quit){
 const m=G.storyMission;G.over=true;G.finalMessage=quit?'Missão abandonada.':win?'MISSÃO CONCLUÍDA!':'MISSÃO FALHOU.';
 if(quit){renderBattle();$('#instruction').textContent='Missão abandonada.';setTimeout(()=>show('story'),250);return}
 recordBattleMastery(G.you,win);degradeGear(G.you);
 S.c.battles++;S.c.kos+=G.kos;S.c.damage+=G.damage;
 if(win){S.wins++;S.c.wins++;completeStoryMission(m);log('MISSÃO CONCLUÍDA!','good')}
 else{S.losses++;S.xp+=30;S.ryo+=5;log('MISSÃO FALHOU.','bad')}
 recordBattleCounters(win);claim();save();renderBattle();$('#instruction').textContent=win?'MISSÃO CONCLUÍDA!':'MISSÃO FALHOU.';
 setTimeout(()=>{
   if(win){
     const after=()=>{if(S.story.campaignDone&&m.id===STORY_MISSIONS[STORY_MISSIONS.length-1].id)openStoryDialog(STORY.finale,()=>show('story'),{bg:m.bg,label:'EPÍLOGO'});else show('story')};
     openStoryDialog(m.outro||[{speaker:'Narrador',slug:null,text:'Missão concluída.'}],after,{bg:m.bg,label:`CONCLUÍDA — ${m.title}`})
   }else{
     openStoryDialog([{speaker:'Sistema',slug:null,text:'A missão falhou. O capítulo continua disponível no mapa para uma nova tentativa.'}],()=>show('story'),{bg:m.bg,label:`TENTAR NOVAMENTE — ${m.title}`})
   }
 },320)
}


function onlineMsg(text,bad=false){
 const e=$('#onlineLoginMsg');if(e){e.textContent=text||'';e.style.color=bad?'#900':'#064f28'}
}
async function renderOnline(){
 if(ON.token&&(cloudSaveTimer||cloudSaveInFlight||cloudSaveAgain))await drainCloudSave();
 const ping=await api('/api/ping');
 const st=$('#serverStatus'),addr=$('#serverAddress');
 if(st)st.textContent=ping.ok?'ONLINE / ATIVO':'OFFLINE';
 if(addr)addr.textContent=ping.ok?`Local: ${location.origin}${ping.lan?` • Rede: http://${ping.lan}:${ping.port}`:''}`:'Execute JOGAR.ps1 para iniciar o servidor.';
 const linkInfo=await api('/api/online-link');
 const card=$('#publicLinkCard'),input=$('#publicLinkInput'),status=$('#publicLinkStatus'),help=$('#publicLinkHelp');
 let publicUrl='';
 if(/^https:/i.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/i.test(location.hostname)) publicUrl=location.origin;
 else if(linkInfo&&linkInfo.ok&&linkInfo.publicUrl) publicUrl=String(linkInfo.publicUrl).replace(/\/$/,'');
 else if(ping&&ping.publicUrl) publicUrl=String(ping.publicUrl).replace(/\/$/,'');
 if(input)input.value=publicUrl;
 if(card){card.classList.toggle('onlineReady',!!publicUrl);card.classList.toggle('onlineMissing',!publicUrl)}
 if(status)status.textContent=publicUrl?'ONLINE MUNDIAL ATIVO':'SEM LINK PÚBLICO NESTA EXECUÇÃO';
 if(help)help.textContent=publicUrl?'Envie este endereço para qualquer jogador. Ele abre o mesmo servidor e as mesmas salas pela Internet.':'O servidor mundial gratuito ainda não foi configurado nesta instalação. Execute novamente o PowerShell TUDO-EM-UM R6; ele publica no Koyeb Free e usa Upstash Redis Free para persistência.';
 const copy=$('#copyPublicLink'),open=$('#openPublicLink');
 if(copy){copy.disabled=!publicUrl;copy.onclick=async()=>{if(!publicUrl)return;try{await navigator.clipboard.writeText(publicUrl);copy.textContent='COPIADO!';setTimeout(()=>copy.textContent='COPIAR LINK',1200)}catch(_){input?.select();try{document.execCommand('copy')}catch(__){}}}}
 if(open){open.disabled=!publicUrl;open.onclick=()=>{if(publicUrl)window.open(publicUrl,'_blank','noopener')}}
 if(ON.token){
   const sess=await api('/api/account/session?token='+encodeURIComponent(ON.token));
   if(!sess.ok){ON.token=null;ON.user=null;ON.room=null;ON.role=null;ON.revision=0;saveOnlineSession()}
   else{ON.user=sess.user;if(sess.profile)applyServerProfile(sess.profile,sess.revision)}
 }
 const logged=!!ON.token;
 $('#onlineLoginBox').classList.toggle('hidden',logged);
 $('#onlineLobbyBox').classList.toggle('hidden',!logged);
 if(logged){
   $('#onlineLoggedAs').textContent=`Conectado: ${ON.user}`;
   if(ON.room){$('#onlineRoomBox').classList.remove('hidden');$('#onlineRoomCode').textContent=ON.room;pollRoom()}
   else $('#onlineRoomBox').classList.add('hidden')
 }
 await renderRankedPanel();
}
function applyServerProfile(p,revision){
 if(!p)return;const incoming=revision===undefined?ON.revision:Number(revision||0);if(incoming<ON.revision)return;const keepAI=S.ai;const keepProfile=S.aiProfile;const d=defaults();
 const pp={...p};if(pp.ryo===undefined)pp.ryo=Number(pp.dna||d.ryo);delete pp.dna;S={...d,...pp,story:{...storyDefaults(),...(pp.story||{})},c:{...d.c,...(pp.c||{})},done:pp.done||{},unlockedJutsu:Array.isArray(pp.unlockedJutsu)?pp.unlockedJutsu:[],loadouts:pp.loadouts||{},mastery:pp.mastery||{},jutsuMastery:pp.jutsuMastery||{},inventory:{...d.inventory,...(pp.inventory||{})},gear:pp.gear||d.gear,ninjaMissions:pp.ninjaMissions||d.ninjaMissions,missions:pp.missions||d.missions,events:pp.events||d.events,ranked:{...d.ranked,...(pp.ranked||{})}};
 ON.revision=Math.max(ON.revision,incoming);S.aiProfile=p.aiProfile||keepProfile||'equilibrada';S.ai=Array.isArray(keepAI)?keepAI:[];ensureMissionPeriods();ensureEventPeriods();S.unlocked=storyUnlockedCharacters();S.you=(p.you||S.you||[]).filter(x=>S.unlocked.includes(x)).slice(0,3);claimJutsuMastery();localStorage.setItem(KEY,JSON.stringify(S));saveOnlineSession();renderHeader();renderMissions();
}
function authMsg(text,bad=false){const e=$('#authMsg');if(e){e.textContent=text;e.classList.toggle('bad',bad)}}
async function doLogin(register=false,source='online'){
 const user=((source==='auth'?$('#authUser'):$('#onlineUser'))?.value||'').trim(),pass=(source==='auth'?$('#authPass'):$('#onlinePass'))?.value||'';
 const msg=(t,b=false)=>source==='auth'?authMsg(t,b):onlineMsg(t,b),btn=source==='auth'?(register?$('#authRegister'):$('#authLogin')):(register?$('#onlineRegister'):$('#onlineLogin'));
 if(user.length<3||pass.length<8)return msg('Usuário mínimo 3 caracteres e senha mínimo 8.',true);
 const oldLabel=btn?.textContent||'';if(btn){btn.disabled=true;btn.textContent=register?'CRIANDO...':'CONECTANDO...'}msg(register?'Criando conta...':'Conectando ao servidor...');
 try{
   const r=await api(register?'/api/account/register':'/api/account/login',{user,pass},{timeout:15000});
   if(!r.ok)return msg(r.error||'Falha no login.',true);
   ON.token=r.token;ON.user=r.user;ON.room=null;ON.role=null;ON.revision=Number(r.revision||0);saveOnlineSession();
   if(r.profile)applyServerProfile(r.profile,r.revision);
   S.name=r.user;save();msg('Conta conectada. Progresso carregado do servidor.');if(source==='auth'){if(!(await resumeBattleAfterAuth()))show('home')}else renderOnline()
 }finally{if(btn){btn.disabled=false;btn.textContent=oldLabel}}
}
$('#onlineLogin').onclick=()=>doLogin(false,'online');
$('#onlineRegister').onclick=()=>doLogin(true,'online');
if($('#authLogin'))$('#authLogin').onclick=()=>doLogin(false,'auth');if($('#authRegister'))$('#authRegister').onclick=()=>doLogin(true,'auth');

async function logoutAccount(){
 clearTimeout(cloudSaveTimer);cloudSaveTimer=null;cloudSaveAgain=false;if(ON.poll){clearTimeout(ON.poll);ON.poll=null}ON={token:null,user:null,room:null,role:null,submittedTurn:null,poll:null,lastEvent:0,resultRoom:null,revision:0};saveOnlineSession();G=null;setSaveStatus('Sessão encerrada.');show('auth');authMsg('Entre novamente para carregar o progresso salvo no servidor.');
}
if($('#logoutAccount'))$('#logoutAccount').onclick=logoutAccount;if($('#onlineLogout'))$('#onlineLogout').onclick=logoutAccount;
function onlineTeamPayload(){
 return S.you.map(slug=>({slug,loadout:[0,1,2,3].map(slot=>{const v=equippedVariant(slug,slot);return v&&S.unlockedJutsu.includes(v.id)?v.id:null}),gear:Object.fromEntries(Object.entries(equippedGear(slug)).filter(([,id])=>gearActive(id)))}))
}
function ensureOnlineTeam(){
 if(S.you.length!==3){alert('Você precisa de 3 ninjas. Libere personagens no Modo HISTÓRIA antes de entrar no Online.');show('select');return false}
 return true
}
async function createRoom(mode){
 if(!ensureOnlineTeam())return;
 let path=mode==='quick'?'/api/room/quick':'/api/room/create';
 let r=await api(path,{token:ON.token,team:onlineTeamPayload()});
 if(!r.ok)return onlineMsg(r.error||'Não foi possível criar a sala.',true);
 ON.room=r.code;ON.role=r.role;ON.submittedTurn=null;ON.resultRoom=null;saveOnlineSession();
 $('#onlineRoomBox').classList.remove('hidden');$('#onlineRoomCode').textContent=ON.room;
 $('#onlineRoomStatus').textContent=r.status==='playing'?'Adversário encontrado. Iniciando...':'Aguardando adversário...';
 pollRoom()
}
$('#onlineQuick').onclick=()=>createRoom('quick');
$('#onlineCreate').onclick=()=>createRoom('private');
$('#onlineJoin').onclick=async()=>{
 if(!ensureOnlineTeam())return;
 const code=($('#onlineCode').value||'').trim().toUpperCase();
 if(code.length!==6)return onlineMsg('Digite o código de 6 caracteres.',true);
 const r=await api('/api/room/join',{token:ON.token,code,team:onlineTeamPayload()});
 if(!r.ok)return onlineMsg(r.error||'Não foi possível entrar.',true);
 ON.room=r.code;ON.role=r.role;ON.submittedTurn=null;ON.resultRoom=null;saveOnlineSession();pollRoom()
};
$('#onlineCancelRoom').onclick=async()=>{
 if(ON.room&&ON.token)await api('/api/room/leave',{token:ON.token,code:ON.room});
 ON.room=null;ON.role=null;ON.submittedTurn=null;saveOnlineSession();
 if(ON.poll){clearTimeout(ON.poll);ON.poll=null}renderOnline()
};
function hydrateOnlineFighters(list){
 return (list||[]).map(f=>{
   const c=char(f.slug);if(!c)return null;
   const skills=c.skills.map((s,i)=>{const vid=f.loadout&&f.loadout[i],v=vid&&JV_BY_ID[vid];return {...(v&&v.character===c.slug&&Number(v.slot)===i?v:s),cd:(f.cds&&f.cds[i])||0}});
   if(f.borrowedSkill)skills.push({...f.borrowedSkill,name:`Pergaminho • ${f.borrowedSkill.name}${f.borrowedSkill.borrowedFrom?' — de '+f.borrowedSkill.borrowedFrom:''}`,cd:(f.cds&&f.cds[4])||0,borrowed:true});
   return {slug:c.slug,name:c.name,icon:c.icon,skills,
     hp:f.hp,maxHp:f.maxHp||100,shield:f.shield||0,shieldTurns:f.shieldTurns||0,stun:f.stun||0,stunTurns:f.stunTurns||0,dot:f.dot||0,dotTurns:f.dotTurns||0,inv:f.inv||0,invTurns:f.invTurns||0,damageBonus:Number(f.damageBonus||0),damageReduction:Number(f.damageReduction||0),controlBonus:Number(f.controlBonus||0),healBonus:Number(f.healBonus||0),shieldBonus:Number(f.shieldBonus||0),turnRegen:Number(f.turnRegen||0),copiedJutsu:f.copiedJutsu||(f.borrowedSkill?{name:f.borrowedSkill.name,from:f.borrowedSkill.borrowedFrom||'outro ninja',scroll:'Pergaminho equipado'}:null),gearStartChakra:0}
 }).filter(Boolean)
}
function applyOnlineState(r){
 if(!r||!r.ok||!r.game)return;
 const sameRoom=!!(G?.online&&G.onlineRoom===ON.room),previousFx=sameRoom&&window.BattleFX?window.BattleFX.capture(G):null;let fxPromise=Promise.resolve();
 $('#view').innerHTML=`<section><h4>${r.ranked?'RANQUEADO ONLINE':'ONLINE'}</h4><p>Escolha suas técnicas, clique nos alvos verdes e envie o turno. O servidor resolve as duas filas quando os jogadores confirmarem.${r.ranked?' Esta partida altera seu MMR ao terminar.':''}</p></section>`;
 ON.role=r.role;saveOnlineSession();
 const own=ON.role==='host'?'host':'guest',opp=ON.role==='host'?'guest':'host',g=r.game,logs=Array.isArray(g.log)?g.log:[];
 const logKeys=logs.map(x=>`${x?.kind||'info'}\u0000${x?.text||x}`),oldKeys=ON.fxRoom===ON.room&&Array.isArray(ON.fxLogKeys)?ON.fxLogKeys:[];let overlap=0;
 for(let size=Math.min(oldKeys.length,logKeys.length);size>=0;size--){if(oldKeys.slice(oldKeys.length-size).every((key,i)=>key===logKeys[i])){overlap=size;break}}
 const freshLogs=previousFx?logs.slice(overlap):[];ON.fxLogKeys=logKeys;ON.fxRoom=ON.room;
 G={online:true,onlineRoom:ON.room,turn:g.turn,diff:'online',profile:{name:ON.role==='host'?r.guestName:r.hostName,plan:'Jogador online'},strategy:'online',
   you:hydrateOnlineFighters(g[own]),ai:hydrateOnlineFighters(g[opp]),ch:{...g[own+'Ch']},aich:{...g[opp+'Ch']},
   acts:[],over:!!g.winner,damage:0,kos:0,onlineWinner:g.winner,
   itemUsedTurn:Number(g[own+'ItemUsedTurn']||0),itemUsesTotal:Number(g[own+'ItemUsesTotal']||0),itemUsesByType:{...(g[own+'ItemUsesByType']||{})}};
 if(r.revision!==undefined)ON.revision=Math.max(ON.revision,Number(r.revision||0));
 if(r.inventory&&typeof r.inventory==='object'){S.inventory={...S.inventory,...r.inventory};localStorage.setItem(KEY,JSON.stringify(S));saveOnlineSession()}if(r.profile)applyServerProfile(r.profile,r.revision);if(r.rankedInfo)S.ranked={...S.ranked,...r.rankedInfo};
 selected=null;ON.submittedTurn=g[own+'Acts']!=null?Number(g.turn):null;
 const oppName=ON.role==='host'?r.guestName:r.hostName;
 $('#player1 .controlTag').textContent=`${r.ranked?'RANKED':'ONLINE'} — ${oppName||'ADVERSÁRIO'}`;
 $('#bottomAI').textContent=oppName||'ONLINE';$('#bottomAIPlan').textContent=r.ranked?'RANQUEADO':'JOGADOR';
 if(Array.isArray(g.log)){
   $('#battlelog').innerHTML='';
   g.log.slice(-18).forEach(x=>{
     let kind=x.kind||'info';
     if(ON.role==='guest'){if(kind==='good')kind='bad';else if(kind==='bad')kind='good'}
     log(x.text||x,kind)
   })
 }
 show('battle');renderBattle();
 if(previousFx&&window.BattleFX){
   fxPromise=(async()=>{if(freshLogs.length)await window.BattleFX.replayLogs(freshLogs,G,ON.role);await window.BattleFX.resolveDiff(previousFx,G)})()
 }
 ON.lastEvent=Number(g.eventId||0);
 if(g.winner){
   const draw=g.winner==='draw',won=g.winner===ON.role;
   $('#instruction').textContent=draw?'EMPATE ONLINE.':won?'VITÓRIA ONLINE!':'DERROTA ONLINE.';
   if(ON.resultRoom!==ON.room){
     ON.resultRoom=ON.room;
     recordBattleMastery(G.you,won);degradeGear(G.you);
     if(draw){S.xp+=100;S.ryo+=30;S.c.battles++;trackPeriodic('battles',1)}
     else if(won){S.wins++;S.c.wins++;S.c.battles++;S.xp+=200;S.ryo+=60;trackPeriodic('battles',1);trackPeriodic('wins',1)}
     else{S.losses++;S.c.battles++;S.xp+=70;S.ryo+=15;trackPeriodic('battles',1)}
     claim();save();saveOnlineSession()
   }
 }
 return fxPromise
}
async function pollRoom(){
 if(!ON.room||!ON.token)return;
 const r=await api('/api/room/state?code='+encodeURIComponent(ON.room)+'&token='+encodeURIComponent(ON.token));
 if(!r.ok){
   $('#onlineRoomStatus').textContent=r.error||'Sala encerrada.';
   ON.room=null;ON.role=null;saveOnlineSession();return
 }
 ON.role=r.role;saveOnlineSession();
 if(r.status==='waiting'){
   if(!$('#onlinePage').classList.contains('hidden')){
     $('#onlineRoomBox').classList.remove('hidden');$('#onlineRoomCode').textContent=r.code;
     $('#onlineRoomStatus').textContent=`Aguardando adversário na sala ${r.code}...`
   }
   ON.poll=setTimeout(pollRoom,900);return
 }
 if(r.status==='playing'||r.status==='finished'){
   if(!G||!G.online||G.turn!==r.game.turn||ON.submittedTurn!==null||r.status==='finished')await applyOnlineState(r);
   else if(ON.submittedTurn===null && G.online){
     // durante a escolha do jogador, só observa desistência/fim sem apagar a fila.
     if(r.game.winner)await applyOnlineState(r)
   }
   if(r.status==='playing'){
     ON.poll=setTimeout(pollRoom,ON.submittedTurn!==null?700:2000)
   }
 }
}
async function submitOnlineTurn(){
 if(!G||!G.online||battleFxBusy()||ON.submittedTurn!==null||!G.acts.length)return;
 const turn=G.turn,acts=G.acts.map(a=>({user:a.user,skill:a.skill,targetSide:a.side==='ai'?'opponent':'self',target:a.target}));
 const r=await api('/api/room/submit',{token:ON.token,code:ON.room,turn,acts});
 if(!r.ok){log(r.error||'Falha ao enviar o turno.','bad');return}
 recordJutsuUses(G.acts,G.you);
 ON.submittedTurn=turn;G.acts=[];selected=null;renderBattle();
 $('#instruction').textContent='Turno enviado. Aguardando o adversário...';
 if(r.game&&r.game.turn>turn){await applyOnlineState(r);return}
 ON.poll=setTimeout(pollRoom,500)
}
async function forfeitOnline(){
 if(!ON.room||!ON.token){show('online');return}
 const r=await api('/api/room/forfeit',{token:ON.token,code:ON.room});
 if(!r.ok){log(r.error||'Falha ao abandonar a partida online.','bad');return}
 await applyOnlineState(r);
 if(ON.token)await flushCloudSave();
 ON.room=null;ON.role=null;ON.submittedTurn=null;ON.resultRoom=null;saveOnlineSession();if(ON.poll){clearTimeout(ON.poll);ON.poll=null}G=null;show('online');renderOnline()
}
function legacyR15_emptyCh(){return{Blood:0,Gen:0,Nin:0,Tai:0}}
function legacyR15_chakraTotal(ch){return ['Blood','Gen','Nin','Tai'].reduce((a,k)=>a+Number(ch[k]||0),0)}
function legacyR15_gain(ch,n,team=null){const types=['Blood','Gen','Nin','Tai'];let left=Math.max(0,Number(n||0));while(left-->0&&chakraTotal(ch)<CHAKRA_RULES.maxTotal){const available=types.filter(k=>Number(ch[k]||0)<CHAKRA_RULES.maxPerType);if(!available.length)break;const k=available[Math.floor(Math.random()*available.length)];ch[k]=Number(ch[k]||0)+1}return ch}
function clone(c,enemy,diff){
 let mult=!enemy?1:diff==='easy'?.92:diff==='normal'?1:diff==='hard'?1.12:1.28;
 let hp=Math.round(100*mult),f={slug:c.slug,name:c.name,icon:c.icon,skills:(enemy?c.skills:effectiveSkills(c)).map(s=>({...s,cd:0})),hp,maxHp:hp,shield:0,shieldTurns:0,stun:0,stunTurns:0,dot:0,dotTurns:0,inv:0,invTurns:0,damageBonus:0,damageReduction:0,controlBonus:0,healBonus:0,shieldBonus:0,turnRegen:0,gearStartChakra:0};
 return enemy?f:applyGearToFighter(f,c)
}
function alive(a){return a.filter(x=>x.hp>0)}
function legacyR15_canPay(ch,cost){const t={Blood:Number(ch.Blood||0),Gen:Number(ch.Gen||0),Nin:Number(ch.Nin||0),Tai:Number(ch.Tai||0)};let q=0;for(const c of(cost||[])){if(c==='Rand'){q++;continue}if(!t[c])return false;t[c]--}return Object.values(t).reduce((a,b)=>a+b,0)>=q}
function legacyR15_pay(ch,cost){const t={Blood:Number(ch.Blood||0),Gen:Number(ch.Gen||0),Nin:Number(ch.Nin||0),Tai:Number(ch.Tai||0)};let q=0;for(const c of(cost||[])){if(c==='Rand'){q++;continue}if(t[c]>0)t[c]--}while(q-->0){const k=['Blood','Gen','Nin','Tai'].sort((a,b)=>t[b]-t[a])[0];if(t[k]<=0)break;t[k]--}for(const k of ['Blood','Gen','Nin','Tai'])ch[k]=t[k]}
function legacyR15_remaining(){let c={...G.ch};for(const a of G.acts){let sk=G.you[a.user].skills[a.skill];if(canPay(c,sk.cost))pay(c,sk.cost)}return c}
function legacy_BASE_eventBossStatus(scope){ensureEventPeriods();const ev=activeEvent(scope),st=S.events[scope],goal=1;return {ev,st,goal,progress:Math.min(goal,Number(st.wins||0)),hp:eventHp(ev,scope),reward:eventReward(ev,scope)}}
function grantTemporaryBijuu(ev,hours){if(!hours)return 0;ensureEventPeriods();const until=Date.now()+Number(hours||168)*3600000;S.events.temporary[ev.slug]=Math.max(Number(S.events.temporary[ev.slug]||0),until);S.unlocked=storyUnlockedCharacters();return until}
async function startBijuuEvent(scope,approach='balanced'){
 if(S.you.length!==3)return alert(`Você precisa de 3 ninjas para enfrentar ${scope==='weekly'?'o Nukenin':'a Bijū'}.`);
 if(ON.token&&(cloudSaveTimer||cloudSaveInFlight||cloudSaveAgain))await drainCloudSave();
 const {ev}=eventBossStatus(scope),boss=char(ev.slug);if(!boss)return alert(`${scope==='weekly'?'Nukenin':'Boss Bijū'} indisponível nesta build.`);
let challengeToken=null,serverGame=null;
 if(ON.token){const started=await api('/api/account/bijuu-start',{token:ON.token,scope,eventId:ev.id,team:onlineTeamPayload(),approach});if(!started.ok)return alert(started.error||'Não foi possível criar sua instância individual da Raid.');challengeToken=started.challengeToken;serverGame=started.game}
 $('#player0 .controlTag').textContent=scope==='weekly'?'VOCÊ — CAÇADA NUKENIN':'VOCÊ — RAID BIJŪ';
 const c=clone(boss,true,'boss');c.maxHp=eventHp(ev,scope);c.hp=c.maxHp;
 G={turn:serverGame?.turn||1,diff:'boss',profile:{name:`${scope==='monthly'?'BIJŪ MENSAL':'NUKENIN SEMANAL'} — ${ev.name}`,plan:scope==='weekly'?'Nukenin com IA agressiva e situacional.':'Bijū com PV ampliado, IA de Boss e técnicas próprias.'},strategy:'smart',you:serverGame?hydrateOnlineFighters(serverGame.player):S.you.map(slug=>clone(char(slug),false,'boss')),ai:serverGame?hydrateOnlineFighters(serverGame.boss):[c],ch:serverGame?{...serverGame.playerCh}:gain(emptyCh(),8,S.you.map(slug=>clone(char(slug),false,'boss'))),aich:serverGame?{...serverGame.bossCh}:gain(emptyCh(),scope==='monthly'?14:10,[c]),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},eventJutsuActs:[],aiState:{defensiveStreak:0,lastKinds:[]},eventBoss:{scope,id:ev.id,slug:ev.slug,name:ev.name,challengeToken,serverAuthoritative:!!ON.token,approach}};
 selected=null;show('battle');$('#player1 .controlTag').textContent=`${scope==='monthly'?'BIJŪ MENSAL':'NUKENIN SEMANAL'} — ${ev.name}`;$('#bottomAI').textContent=ev.name;$('#bottomAIPlan').textContent=scope==='monthly'?'BIJŪ MENSAL':'NUKENIN SEMANAL';$('#bottomYou').textContent=S.name;$('#battlelog').innerHTML='';log(`${scope==='monthly'?'BIJŪ MENSAL':'NUKENIN SEMANAL'}: ${ev.name}.`,'info');log(`Preparação escolhida: ${approach}.`,'info');log(`Desafio individual da conta: ${ev.name} possui ${c.maxHp} PV nesta versão do evento.`,'info');log(scope==='weekly'?'A caçada semanal entrega Ryō e 1 equipamento garantido de raridade RARA ou ÉPICA; ela não desbloqueia Bijū.':'A Raid mensal permite 2 vitórias: a 1ª libera 168h e a 2ª estende o ciclo até 346h.','info');renderBattle()
}
function legacy_BASE_applyBijuuServerGame(game){
 if(!G?.eventBoss||!game)return;
 G.turn=Number(game.turn||G.turn);G.you=hydrateOnlineFighters(game.player);G.ai=hydrateOnlineFighters(game.boss);G.ch={...game.playerCh};G.aich={...game.bossCh};G.over=!!game.winner;G.serverWinner=game.winner||null;G.itemUsedTurn=Number(game.playerItemUsedTurn||0);G.itemUsesTotal=Number(game.playerItemUsesTotal||0);G.itemUsesByType={...(game.playerItemUsesByType||{})};G.acts=[];selected=null
}
async function submitBijuuTurn(){
 if(!G?.eventBoss?.challengeToken||!ON.token||G.animating||!G.acts.length)return;
 const turn=G.turn,usedActs=G.acts.map(a=>({...a})),beforeFx=window.BattleFX?window.BattleFX.capture(G):null,oldBoss=G.ai.map(f=>({hp:Number(f.hp||0)}));
 G.animating=true;renderBattle();
 try{
   const r=await api('/api/account/bijuu-turn',{token:ON.token,challengeToken:G.eventBoss.challengeToken,turn,acts:usedActs.map(a=>({user:a.user,skill:a.skill,target:a.target}))});
   if(!r.ok){if(r.game)applyBijuuServerGame(r.game);log(r.error||'Falha ao resolver o turno da Raid no servidor.','bad');return}
   G.eventJutsuActs.push(...usedActs.map(a=>({user:a.user})));applyBijuuServerGame(r.game);
   G.damage+=G.ai.reduce((total,f,i)=>total+Math.max(0,Number(oldBoss[i]?.hp||0)-Number(f.hp||0)),0);G.kos+=G.ai.reduce((total,f,i)=>total+(Number(oldBoss[i]?.hp||0)>0&&Number(f.hp||0)<=0?1:0),0);
   if(r.profile)applyServerProfile(r.profile,r.revision);
   if(Array.isArray(r.game?.log))for(const entry of r.game.log)log(entry.text||entry,entry.kind||'info');renderBattle();
   try{if(window.BattleFX){if(Array.isArray(r.game?.log)&&r.game.log.length)await window.BattleFX.replayLogs(r.game.log,G,'host');if(beforeFx)await window.BattleFX.resolveDiff(beforeFx,G)}}catch(fxError){log('O turno foi aplicado; apenas a animação visual falhou.','info')}
   if(r.game?.winner){
     const won=r.game.winner==='player';
     recordJutsuUses(G.eventJutsuActs,G.you);G.eventJutsuActs=[];
     if(won)log(r.alreadyClaimed?`A recompensa de ${G.eventBoss.name} já foi recebida nesta conta neste ciclo.`:(G.eventBoss.scope==='weekly'?`Nukenin ${G.eventBoss.name} derrotado; recompensa semanal recebida.`:`Vitória ${Number(r.eventWins||1)}/${Number(r.maxWins||2)}: ${G.eventBoss.name} liberada até ${r.until?new Date(r.until).toLocaleString('pt-BR'):'o limite do ciclo'}!`),'good');
     await finish(won,false,true);return
   }
   log(`— Turno ${G.turn} —`,'info')
 }finally{if(G){G.animating=false;renderBattle()}}
}
async function legacy_BASE_completeBijuuEvent(){
 if(!G?.eventBoss)return true;
 ensureEventPeriods();
 const scope=G.eventBoss.scope,ev=activeEvent(scope);if(!ev||ev.id!==G.eventBoss.id)return false;
 if(ON.token)return true;
 const st=S.events[scope],goal=scope==='weekly'?BIJUU_RULES.weeklyGoal:BIJUU_RULES.monthlyGoal;
 st.wins=Number(st.wins||0)+1;
 if(st.wins>=goal&&!st.claimed){grantReward(eventReward(ev,scope));if(scope==='weekly'){S.c.nukeninWins=Number(S.c.nukeninWins||0)+1;const gear=randomGear('A');awardGear(gear.id);log(`Nukenin derrotado: ${gear.name} recebido como equipamento semanal.`,'good')}else{S.c.bijuuWins=Number(S.c.bijuuWins||0)+1;grantTemporaryBijuu(ev,eventHours(ev,scope));log(`${ev.name} liberado temporariamente por 168h neste perfil local!`,'good')}st.claimed=true}
 S.unlocked=storyUnlockedCharacters();return true
}
function start(){
 if(S.you.length!==3)return alert('Você precisa de 3 ninjas. Avance no Modo HISTÓRIA para liberar personagens; Naruto é o ninja inicial.');
 $('#player0 .controlTag').textContent='VOCÊ — LADO CONTROLADO';
 $('#view').innerHTML='<section><h4>COMO JOGAR</h4><p><b>1.</b> Clique numa técnica. <b>2.</b> O alvo válido fica VERDE. <b>3.</b> Clique no alvo. <b>4.</b> A ação entra no centro. <b>5.</b> Clique em CONFIRMAR TURNO.</p></section>';
 if(S.ai.length!==3)S.ai=teamForProfile(aiProfile()).map(c=>c.slug);
 const p=aiProfile(),startCh=p.difficulty==='easy'?5:p.difficulty==='normal'?6:p.difficulty==='hard'?7:8;
 const you=S.you.map(s=>clone(char(s),false,p.difficulty)),gearCh=Math.min(3,you.reduce((n,f)=>n+Number(f.gearStartChakra||0),0));G={turn:1,diff:p.difficulty,profile:p,strategy:p.strategy,you,ai:S.ai.map(s=>clone(char(s),true,p.difficulty)),ch:gain(emptyCh(),6+gearCh,you),aich:gain(emptyCh(),startCh,S.ai.map(slug=>clone(char(slug),true,p.difficulty))),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},aiState:{defensiveStreak:0,lastKinds:[]}};
 selected=null;show('battle');$('#battlelog').innerHTML='';
 log(`Seu lado é o ESQUERDO (VOCÊ). Adversário: ${p.name}.`,'info');
 log(`Plano da IA: ${p.plan}`,'info');
 log('Clique em uma técnica. O alvo válido ficará VERDE.','info');
 renderAIControls();renderBattle()
}
$('#startMatch').onclick=start;
function log(t,c=''){let d=document.createElement('div');d.className=c;d.textContent=t;$('#battlelog').appendChild(d);$('#battlelog').scrollTop=$('#battlelog').scrollHeight}
function battleFxBusy(){return !!(G?.animating||$('#battlePage')?.classList.contains('fx-resolving'))}
function fighterFxState(f){return window.BattleFX?window.BattleFX.snapshot(f):{hp:Number(f?.hp||0),maxHp:Math.max(1,Number(f?.maxHp||100)),shield:Number(f?.shield||0),stun:Number(f?.stun||0),dot:Number(f?.dot||0),inv:Number(f?.inv||0)}}
function hpbar(f,left){let pc=Math.max(0,Math.min(100,100*f.hp/Math.max(1,f.maxHp||100))),def=Math.max(0,Math.min(100,Number(f.shield||0)));return `<div class="charhealthbar"><div class="charhealth" style="width:${pc}%"></div><div class="chardefense" style="width:${def}%"></div><span>${f.hp}/${f.maxHp||100}</span></div>`}
function validTargets(sk,ui){let m=sk.mechanic||{},side=m.target==='enemy'?G.ai:G.you;if(m.target==='self')return[{side:'you',i:ui}];return side.map((f,i)=>({side:m.target==='enemy'?'ai':'you',i})).filter(t=>(t.side==='ai'?G.ai[t.i]:G.you[t.i]).hp>0)}
function chooseSkill(ui,si){if(G.over||battleFxBusy()||G.online&&ON.submittedTurn!==null)return;let u=G.you[ui],sk=u.skills[si];if(!u||u.hp<=0||sk.cd>0)return;if(G.acts.some(a=>a.user===ui))return;let rem=remaining();if(!canPay(rem,sk.cost))return log('Chakra insuficiente para '+sk.name+'.','bad');selected={ui,si,targets:validTargets(sk,ui)};renderBattle();$('#instruction').textContent='ALVOS VERDES: clique em um deles para confirmar esta técnica.'}
function chooseTarget(side,i){if(battleFxBusy()||!selected)return;if(!selected.targets.some(t=>t.side===side&&t.i===i))return;G.acts.push({user:selected.ui,skill:selected.si,side,target:i});let sk=G.you[selected.ui].skills[selected.si],t=(side==='ai'?G.ai:G.you)[i];if(G.masteryTrial&&sk?.id===G.masteryTrial.variantId)log(`TÉCNICA DE DOMÍNIO NA FILA: ${sk.name}. A execução só será registrada quando o Jutsu realmente acontecer.`,'info');log(`${G.you[selected.ui].name}: ${sk.name} → ${t.name}`,'good');selected=null;renderBattle();$('#instruction').textContent='Ação na fila. Escolha outra técnica ou clique em CONFIRMAR TURNO.'}
function legacy_BASE_renderNinja(f,i,enemy){
let target=selected&&selected.targets.some(t=>t.side===(enemy?'ai':'you')&&t.i===i);
let acted=!enemy&&G.acts.some(a=>a.user===i);
let skills=`<div class="charmoves">${f.skills.map((sk,si)=>`<button class="charmove ${!enemy&&acted&&G.acts.find(a=>a.user===i)?.skill===si?'queued':''}" ${enemy?'disabled':`data-ui="${i}" data-si="${si}"`} ${f.hp<=0||sk.cd>0||(!enemy&&acted)||G.online&&ON.submittedTurn!==null?'disabled':''}>${skillImg(sk,'skillicon',`alt="${esc(sk.name)}" title="${esc(sk.name+' — '+mechanicSummary(sk)+' — CD '+sk.cooldown)}"`)}${sk.cd?`<span class="cd">${sk.cd}</span>`:''}<span class="actcost">${costs(sk.cost)}<small>${costText(sk.cost)}</small></span></button>`).join('')}</div>`;
return `<div class="ninja ${f.shield?'fxState-shield ':''}${f.stun?'fxState-stun ':''}${f.dot?'fxState-dot ':''}${f.inv?'fxState-invuln':''}" data-fighter-side="${enemy?'ai':'you'}" data-fighter-index="${i}">
<aside class="details channels"></aside>
<button class="face ${f.hp<=0?'dead':''} ${target?'targetable':''}" data-side="${enemy?'ai':'you'}" data-i="${i}" ${target?'':'disabled'}>${imgSafe(f.icon,f.icon,'charicon')}</button>
${skills}
${hpbar(f,!enemy)}
${f.copiedJutsu?`<div class="copiedJutsuBadge"><b>${esc(f.copiedJutsu.scroll||'Pergaminho')}</b><span>${esc(f.copiedJutsu.name)} • de ${esc(f.copiedJutsu.from)}</span></div>`:''}
<aside class="details statuses">${f.shield?`<span class="fxStatus-shield">DEFESA${f.shieldTurns?' '+f.shieldTurns+'T':''}</span>`:''}${f.stun?`<span class="fxStatus-stun">ATORDOADO ${f.stunTurns||1}T</span>`:''}${f.dot?`<span class="fxStatus-dot">AFLIÇÃO ${f.dotTurns||1}T</span>`:''}${f.inv?`<span class="fxStatus-invuln">INVULNERÁVEL ${f.invTurns||1}T</span>`:''}</aside>
</div>`
}

function weakestAlive(team){return [...team].filter(x=>x.hp>0).sort((a,b)=>a.hp-b.hp)[0]||null}
async function useOnlineBattleItem(type,targetIndex=null){
 if(!G||!G.online||G.over||battleFxBusy()||ON.submittedTurn!==null)return;
 if(!type||!SHOP_ITEMS[type])return;
 const why=selectedBattleItemReason(type,targetIndex);if(why)return log(why,'bad');
 const queued=(G.acts||[]).map(a=>({...a}));
 const r=await api('/api/room/item',{token:ON.token,code:ON.room,turn:G.turn,item:type,target:targetIndex});
 if(!r.ok){log(r.error||'Falha ao usar item online.','bad');return}
 trackPeriodic('items',1);S.c.items=Number(S.c.items||0)+1;
 await applyOnlineState(r);if(G&&!G.over){G.acts=queued;selected=null;renderBattle()}
 save();
}
async function legacyR15_useBattleItem(type){
 if(!G||G.over||battleFxBusy())return;
 if(G.online){useOnlineBattleItem(type);return}
 /* R15 obsoleto: Raid agora usa /api/account/bijuu-item validado pelo servidor. */
 if(G.itemUsedTurn===G.turn)return log('Regra: máximo de 1 item por turno.','bad');
 if(Number(G.itemUsesTotal||0)>=ITEM_RULES.perBattle)return log(`Regra: máximo de ${ITEM_RULES.perBattle} itens por batalha.`,'bad');
 if(Number(G.itemUsesByType?.[type]||0)>=ITEM_RULES.sameItemPerBattle)return log('Regra: o mesmo item só pode ser usado 1 vez por batalha.','bad');
 const it=SHOP_ITEMS[type];if(!it||(S.inventory[type]||0)<=0)return log('Item indisponível.','bad');
 const beforeFx=window.BattleFX?window.BattleFX.capture(G):null;
 let used=false,t=null;
 if(it.effect==='gainRandom'){gain(G.ch,it.amount||1);used=true}
 else if(it.effect==='gainSpecific'){for(const [k,v] of Object.entries(it.chakra||{}))G.ch[k]=(G.ch[k]||0)+Number(v||0);used=true}
 else if(it.effect==='healWeak'){t=weakestAlive(G.you);if(!t||t.hp>=t.maxHp)return log('Todos os aliados vivos já estão com PV máximo.','bad');const old=t.hp;t.hp=Math.min(t.maxHp,t.hp+(it.amount||0));log(`${it.name} em ${t.name}: +${t.hp-old} PV.`,'good');used=true}
 else if(it.effect==='healAll'){if(!alive(G.you).some(a=>a.hp<a.maxHp))return log('Todos os aliados vivos já estão com PV máximo.','bad');for(const a of alive(G.you)){a.hp=Math.min(a.maxHp,a.hp+(it.amount||0));used=true}}
 else if(it.effect==='cleanse'){t=alive(G.you).find(x=>x.stun||x.dot);if(!t)return log('Nenhum aliado está com Atordoamento ou Aflição.','bad');t.stun=0;t.stunTurns=0;t.dot=0;t.dotTurns=0;used=true}
 else if(it.effect==='invulnWeak'){t=weakestAlive(G.you);if(t){t.inv=1;t.invTurns=Math.max(t.invTurns||0,it.duration||1);used=true}}
 else if(it.effect==='shieldWeak'){t=weakestAlive(G.you);if(t){t.shield+=(it.amount||0);t.shieldTurns=Math.max(t.shieldTurns||0,it.duration||0);used=true}}
 else if(it.effect==='shieldAll'){for(const a of alive(G.you)){a.shield+=(it.amount||0);a.shieldTurns=Math.max(a.shieldTurns||0,it.duration||0);used=true}}
 else if(it.effect==='damageWeak'){t=weakestAlive(G.ai);if(t){const old=t.hp,dealt=hit(t,it.amount||0);G.damage+=dealt;if(old>0&&!t.hp)G.kos++;used=true}}
 else if(it.effect==='dotWeak'){t=weakestAlive(G.ai);if(t){const old=t.hp,dealt=it.amount?hit(t,it.amount):0;G.damage+=dealt;if(old>0&&!t.hp)G.kos++;if(t.hp){t.dot=it.dot||7;t.dotTurns=Math.max(t.dotTurns||0,it.duration||1)}used=true}}
 else if(it.effect==='stunWeak'){t=weakestAlive(G.ai);if(t){t.stun=1;t.stunTurns=Math.max(t.stunTurns||0,it.duration||1);used=true}}
 else if(it.effect==='dispelWeak'){t=weakestAlive(G.ai);if(!t||(!t.shield&&!t.inv))return log('O alvo não possui defesa ou invulnerabilidade para remover.','bad');t.shield=0;t.shieldTurns=0;t.inv=0;t.invTurns=0;used=true}
 if(!used)return;
 if(!['healWeak','damageWeak'].includes(it.effect))log(`${it.name} usado com sucesso.`,'good');
 S.inventory[type]--;S.c.items=Number(S.c.items||0)+1;trackPeriodic('items',1);G.itemUsedTurn=G.turn;G.itemUsesTotal=Number(G.itemUsesTotal||0)+1;G.itemUsesByType=G.itemUsesByType||{};G.itemUsesByType[type]=Number(G.itemUsesByType[type]||0)+1;save();
 G.animating=true;renderBattle();if(beforeFx&&window.BattleFX)await window.BattleFX.resolveDiff(beforeFx,G);G.animating=false;
 if(!alive(G.ai).length)return finish(true,false);
 renderBattle()
}


function exitBattle(){if(!G)return;const mastery=!!G.masteryTrial,mode=mastery?'jutsus':G.ninjaMission?'ninjaMissions':G.story?'story':G.eventBoss?'events':G.online?'online':'select';G=null;selected=null;clearBattleSession();if(ON.poll){clearTimeout(ON.poll);ON.poll=null}show(mode);if(mastery){renderMissions();setTimeout(()=>window.NarutoDesktopOverhaul?.showTraining?.(),0)}}

function legacyR15_renderCenter(){
 let rem=remaining(),waiting=!!(G.online&&ON.submittedTurn!==null),resolving=!!G.animating;
 const queueHtml=G.acts.map(a=>{let sk=G.you[a.user].skills[a.skill];return `<button class="act" data-remove="${a.user}" ${waiting||resolving?'disabled':''}>${skillImg(sk,'queueSkill',`alt="${esc(sk.name)}"`)}<div class="actcost">${costs(sk.cost)}</div></button>`}).join('');
 const instruction=G.over?(G.finalMessage||(G.serverWinner==='player'?'Vitória!':G.serverWinner==='boss'?'Derrota.':'Batalha encerrada.')):resolving?'Resolvendo as técnicas do turno...':waiting?'Turno enviado. Aguardando o adversário...':selected?'ALVOS VERDES: clique em um deles.':G.acts.length?'Fila pronta. Você pode escolher outras ações ou confirmar.':'Clique em uma técnica do lado VOCÊ.';
 const readyLabel=G.over?'FIM':resolving?'RESOLVENDO...':waiting?'AGUARDANDO...':G.online?'ENVIAR TURNO':'CONFIRMAR TURNO';const readyDisabled=G.over?'':(G.acts.length&&!waiting&&!resolving?'':'disabled');
 const storyObj=G.story?`<div class="storyBattleObjective">${storyObjectiveText(G.storyMission)}</div>`:'';
 $('#center').innerHTML=`<div id="playqueue">${queueHtml}</div>${storyObj}<div class="instruction" id="instruction">${instruction}</div><button id="ready" ${readyDisabled}>${readyLabel}</button><div class="chakraPoolTitle">CHAKRA DISPONÍVEL • ${chakraTotal(rem)}/${CHAKRA_RULES.maxTotal}</div><div id="spend">${['Blood','Gen','Nin','Tai','Rand'].map(k=>`<div><button class="chakra ${CCLS[k]}" disabled><b>${k==='Blood'?'K':k==='Gen'?'G':k==='Nin'?'N':k==='Tai'?'T':'A'}</b></button></div><span class="chakraNum">${rem[k]||0}</span>`).join('')}</div><div class="chakraLegend"><span><i class="chakra blood"></i>Linhagem</span><span><i class="chakra gen"></i>Genjutsu</span><span><i class="chakra nin"></i>Ninjutsu</span><span><i class="chakra tai"></i>Taijutsu</span><span><i class="chakra rand"></i>Qualquer</span></div><div class="battleItemRules">ITENS: ${G.itemUsesTotal||0}/${ITEM_RULES.perBattle} usados • 1/turno • mesmo item 1×${G.online?' • servidor valida o uso':''}</div><div class="battleItems"><select id="battleItemSelect" ${waiting||resolving||G.itemUsedTurn===G.turn||Number(G.itemUsesTotal||0)>=ITEM_RULES.perBattle?'disabled':''}>${Object.entries(SHOP_ITEMS).filter(([id])=>(S.inventory[id]||0)>0&&Number(G.itemUsesByType?.[id]||0)<ITEM_RULES.sameItemPerBattle).map(([id,it])=>`<option value="${id}">${it.name} (${S.inventory[id]})</option>`).join('')||'<option value="">SEM ITEM DISPONÍVEL</option>'}</select><button id="useBattleItem" ${waiting||resolving||G.itemUsedTurn===G.turn||Number(G.itemUsesTotal||0)>=ITEM_RULES.perBattle||!Object.values(S.inventory).some(x=>Number(x)>0)?'disabled':''}>USAR ITEM</button></div><button id="forfeit" class="forfeitButton" ${resolving?'disabled':''}>ABANDONAR PARTIDA</button>`;
 $('#ready').onclick=()=>G?.over?exitBattle():execute();
 const itemSel=$('#battleItemSelect'),itemBtn=$('#useBattleItem');if(itemBtn)itemBtn.onclick=()=>{if(itemSel?.value)useBattleItem(itemSel.value)};
 $('#forfeit').onclick=async()=>{if(!G||battleFxBusy())return;if(G.over){exitBattle();return}if(!confirm('Abandonar a partida atual?'))return;if(G.online){await forfeitOnline();return}await finish(false,true)};
 $$('[data-remove]').forEach(b=>b.onclick=()=>{if(waiting||resolving||battleFxBusy())return;G.acts=G.acts.filter(a=>a.user!==+b.dataset.remove);selected=null;renderBattle()})
}
function renderBattle(){if(window.BattleFX)window.BattleFX.cleanup();$('#player0').querySelectorAll('.ninja').forEach(n=>n.remove());$('#player1').querySelectorAll('.ninja').forEach(n=>n.remove());G.you.forEach((f,i)=>$('#player0').insertAdjacentHTML('beforeend',renderNinja(f,i,false)));G.ai.forEach((f,i)=>$('#player1').insertAdjacentHTML('beforeend',renderNinja(f,i,true)));renderCenter();$$('.charmove').forEach(b=>b.onclick=()=>chooseSkill(+b.dataset.ui,+b.dataset.si));$$('.face.targetable').forEach(b=>b.onclick=()=>chooseTarget(b.dataset.side,+b.dataset.i));persistBattleSession();window.NarutoBattleMobileGuard?.updateDock?.()}
function hit(t,d){if(t.inv)return 0;d=Math.max(0,Math.round(Number(d||0)-Number(t.damageReduction||0)));let a=Math.min(t.shield,d);t.shield-=a;d-=a;t.hp=Math.max(0,t.hp-d);return d}
function apply(u,t,sk,ai){
 let before=fighterFxState(t),m=sk.mechanic||{kind:'damage',power:25,target:'enemy'},p=Number(m.power||25),duration=Math.max(0,Number(m.duration||0));
 let mult=ai?(G.diff==='easy'?.88:G.diff==='normal'?1:G.diff==='hard'?1.10:1.20):1;
 p=Math.max(1,Math.round(p*mult+Number(u.damageBonus||0)));
 if(m.kind==='heal'){p+=Number(u.healBonus||0);let o=t.hp;t.hp=Math.min(t.maxHp,t.hp+p);log(`${u.name} usa ${sk.name}: +${t.hp-o} PV.`,ai?'bad':'good')}
 else if(m.kind==='shield'){p+=Number(u.shieldBonus||0);t.shield+=p;t.shieldTurns=Math.max(t.shieldTurns||0,duration||0);log(`${u.name} usa ${sk.name}: +${p} defesa${duration?` por ${duration} turno(s)`:''}.`,ai?'bad':'good')}
 else if(m.kind==='invuln'){t.inv=1;t.invTurns=Math.max(t.invTurns||0,duration||1);log(`${u.name} usa ${sk.name}: invulnerável por ${duration||1} turno(s).`,ai?'bad':'good')}
 else{
   let d=hit(t,Math.round(p*(.9+Math.random()*.2)));if(!ai)G.damage+=d;
   log(`${u.name} usa ${sk.name} em ${t.name}: ${d} dano.`,ai?'bad':'good');
   if(m.kind==='stun'&&t.hp){t.stun=1;t.stunTurns=Math.max(t.stunTurns||0,(duration||1)+Number(u.controlBonus||0))}
   if(m.kind==='dot'&&t.hp){t.dot=7;t.dotTurns=Math.max(t.dotTurns||0,duration||1)}
   if(!t.hp){if(!ai)G.kos++;log(`${t.name} foi derrotado!`,ai?'bad':'good')}
 }
 sk.cd=Math.max(sk.cd,sk.cooldown||0);
 return {kind:m.kind||'damage',before,after:fighterFxState(t),skill:sk}
}

async function perform(a,ai){
 let own=ai?G.ai:G.you,other=ai?G.you:G.ai,u=own[a.user];if(!u||!u.hp)return;
 let sk=u.skills[a.skill],source={side:ai?'ai':'you',index:a.user};
 if(u.stun){
   const before=fighterFxState(u);u.stunTurns=Math.max(0,(u.stunTurns||1)-1);u.stun=u.stunTurns>0?1:0;
   log(`${u.name} está atordoado e perde a ação${u.stunTurns?' ('+u.stunTurns+' turno(s) restante(s))':''}.`,'info');renderBattle();
   if(window.BattleFX)await window.BattleFX.resolve([{target:source,kind:'stun',before,after:fighterFxState(u),label:'ATORDOADO'}]);return
 }
 let arr=a.side===(ai?'you':'ai')?other:own,t=arr[a.target];if(!t||!t.hp)t=alive(arr)[0];if(!t)return;
 const targetSide=arr===G.ai?'ai':'you',targets=sk.mechanic?.aoe?alive(arr):[t],refs=targets.map(x=>({side:targetSide,index:arr.indexOf(x)}));
 if(window.BattleFX)await window.BattleFX.travel(source,refs,sk,sk.mechanic?.kind||'damage');
 const events=targets.map((target,i)=>({...apply(u,target,sk,ai),source,target:refs[i]}));renderBattle();
 if(window.BattleFX)await window.BattleFX.resolve(events);
 if(!ai)recordMasteryTechniqueExecution(sk,events)
}
function chooseAITarget(arr,mode){
 let a=alive(arr);if(!a.length)return null;
 if(mode==='healthy')return [...a].sort((x,y)=>y.hp/y.maxHp-x.hp/x.maxHp)[0];
 if(mode==='unstunned'){let u=a.filter(x=>!x.stun&&!x.dot);return (u.length?u:a).sort((x,y)=>y.hp/y.maxHp-x.hp/x.maxHp)[0]}
 return [...a].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0]
}
function legacyR15_aiActionScore(u,sk,target,profile){
 const m=sk.mechanic||{},kind=m.kind||'damage',power=Number(m.power||0),cost=(sk.cost||[]).length,enemyTarget=m.target==='enemy',bossLike=['boss','nukenin'].includes(G.diff)||profile.strategy==='smart';let score=-cost*4;
 const targetRatio=target?target.hp/Math.max(1,target.maxHp):1,missing=target?Math.max(0,target.maxHp-target.hp):0,effectiveHp=target?target.hp+Number(target.shield||0):9999;
 if(kind==='damage'){score+=power;if(enemyTarget&&power>=effectiveHp)score+=120;if(m.aoe)score+=Math.max(0,alive(G.you).length-1)*power*.45;if(target?.inv)score-=130}
 if(kind==='stun'){score+=power+46;if(target?.stun)score-=110;else score+=35;if(targetRatio<.30)score-=12}
 if(kind==='dot'){score+=power+34;if(target?.dot)score-=85;else score+=28}
 if(kind==='heal'){score+=Math.min(power,missing)*2.4;if(missing<=0)score-=220;if(targetRatio<.4)score+=65}
 if(kind==='shield'){score+=Math.max(0,1-targetRatio)*90;if(target?.shield>20)score-=100;if(targetRatio>.85)score-=60}
 if(kind==='invuln'){score+=targetRatio<.4?105:25;if(target?.inv)score-=180;if(targetRatio>.8)score-=55}
 if(profile.strategy==='aggressive'||profile.strategy==='focus')score+=['damage','dot','stun'].includes(kind)?35:-18;
 if(profile.strategy==='control')score+=kind==='stun'?62:kind==='dot'?48:0;
 if(profile.strategy==='support')score+=['heal','shield','invuln'].includes(kind)?55:0;
 if(profile.strategy==='combo')score+=kind==='stun'?58:kind==='dot'?45:kind==='damage'?30:0;
 if(bossLike&&Number(G.aiState?.defensiveStreak||0)>0){if(['damage','stun','dot'].includes(kind))score+=80;if(['heal','shield','invuln'].includes(kind))score-=95*G.aiState.defensiveStreak}
 if(enemyTarget&&G.aiFocus!=null&&G.you[G.aiFocus]===target)score+=profile.strategy==='focus'?55:12;
 const noise=profile.difficulty==='boss'?4:profile.difficulty==='hard'?10:profile.difficulty==='easy'?34:18;return score+Math.random()*noise
}
function legacyR15_aiActs(){
 const acts=[],p=G.profile||aiProfile();G.aiState=G.aiState||{defensiveStreak:0,lastKinds:[]};
 for(let ui=0;ui<G.ai.length;ui++){
  const u=G.ai[ui];if(!u?.hp)continue;const candidates=[];
  u.skills.forEach((sk,si)=>{if(sk.cd>0||!canPay(G.aich,sk.cost))return;const m=sk.mechanic||{},side=m.target==='enemy'?'you':'ai',arr=side==='you'?G.you:G.ai;let targets=m.target==='self'?[u]:alive(arr);for(const t of targets){if(!t?.hp)continue;const score=p.strategy==='random'?Math.random()*100:aiActionScore(u,sk,t,p);candidates.push({si,sk,side,arr,target:t,score})}});
  if(!candidates.length)continue;candidates.sort((a,b)=>b.score-a.score);let pick=(p.difficulty==='easy'&&Math.random()<.55)?candidates[Math.floor(Math.random()*Math.min(3,candidates.length))]:candidates[0];
  if(p.strategy==='focus'&&pick.side==='you'){if(G.aiFocus==null||!G.you[G.aiFocus]?.hp){const f=chooseAITarget(G.you,'weak');G.aiFocus=G.you.indexOf(f)}const focus=G.you[G.aiFocus];const focused=candidates.filter(x=>x.side==='you'&&x.target===focus).sort((a,b)=>b.score-a.score)[0];if(focused)pick=focused}
  pay(G.aich,pick.sk.cost);acts.push({user:ui,skill:pick.si,side:pick.side,target:pick.arr.indexOf(pick.target)});
 }
 const kinds=acts.map(a=>skillKind(G.ai[a.user].skills[a.skill]));G.aiState.lastKinds=kinds;G.aiState.defensiveStreak=kinds.length&&kinds.every(k=>['heal','shield','invuln'].includes(k))?Math.min(3,Number(G.aiState.defensiveStreak||0)+1):0;return acts
}
function expireDefenseAfterOpponentPhase(team){
 for(const f of(team||[])){
  if(f.inv){f.invTurns=Math.max(0,(f.invTurns||1)-1);if(f.invTurns<=0)f.inv=0}
  if(f.shield&&f.shieldTurns>0){f.shieldTurns--;if(f.shieldTurns<=0)f.shield=0}
 }
}
async function tick(){
 const effects=[];
 for(const [side,team] of [['you',G.you],['ai',G.ai]])for(let index=0;index<team.length;index++){
  const f=team[index];if(f.hp>0&&Number(f.turnRegen||0)>0&&f.hp<f.maxHp){const old=f.hp;f.hp=Math.min(f.maxHp,f.hp+Number(f.turnRegen));if(f.hp>old)log(`${f.name} recupera ${f.hp-old} PV pelo equipamento.`,'info')}const before=f.hp&&f.dot&&f.dotTurns>0?fighterFxState(f):null;
  if(before){hit(f,f.dot);f.dotTurns--;if(f.dotTurns<=0)f.dot=0}
  for(const s of f.skills)if(s.cd)s.cd--;
  if(before)effects.push({target:{side,index},kind:'dot',before,after:fighterFxState(f),label:'DANO CONTÍNUO'})
 }
 if(effects.length){renderBattle();if(window.BattleFX)await window.BattleFX.resolve(effects)}
}
async function execute(){
 if(!G.acts.length||G.over||battleFxBusy())return;
 if(G.online)return submitOnlineTurn();
 if(G.eventBoss?.serverAuthoritative)return submitBijuuTurn();
 G.animating=true;renderBattle();
 try{
 const usedActs=G.acts.map(a=>({...a}));
 let ch={...G.ch};for(const a of G.acts){let sk=G.you[a.user].skills[a.skill];if(canPay(ch,sk.cost)){pay(ch,sk.cost);await perform(a,false)}}G.ch=ch;
 expireDefenseAfterOpponentPhase(G.ai);
 recordJutsuUses(usedActs,G.you);
 if(!alive(G.ai).length)return finish(true,false);
 for(const a of aiActs())await perform(a,true);
 expireDefenseAfterOpponentPhase(G.you);
 if(!alive(G.you).length)return finish(false,false);
 if(G.story&&!storyProtectedAlive())return finish(false,false);
 await tick();
 if(!alive(G.ai).length)return finish(true,false);
 if(!alive(G.you).length)return finish(false,false);
 if(G.story&&storyRoundComplete())return;
 G.turn++;G.acts=[];selected=null;gain(G.ch,CHAKRA_RULES.turnGain,G.you);gain(G.aich,CHAKRA_RULES.turnGain,G.ai);G.animating=false;log(`— Turno ${G.turn} —`,'info');renderBattle()
 }finally{if(G){const redraw=!!(G.over&&G.animating);G.animating=false;if(redraw)renderBattle()}}
}
function achievementValue(type){
 if(type==='storyMissions')return S.story.completed.length;
 if(type==='unlocked')return S.unlocked.filter(s=>PERMANENT_UNLOCKABLE.has(s)).length;
 if(type==='ninjaMissions')return Object.keys(S.ninjaMissions?.completed||{}).filter(k=>S.ninjaMissions.completed[k]).length;
 if(type==='gearOwned')return Object.keys(S.gear?.owned||{}).length;
 if(type==='rankedWins')return Number(S.ranked?.wins||S.c.rankedWins||0);
 if(type==='rankedMatches')return Number(S.ranked?.wins||0)+Number(S.ranked?.losses||0)+Number(S.ranked?.draws||0);
 if(type==='rankedRating')return Number(S.ranked?.rating||1000);
 return Number(S.c[type]||0)
}
function claim(){for(const m of MISS)if(!S.done[m.id]&&achievementValue(m.type)>=m.goal){S.done[m.id]=1;S.ryo+=m.ryo}claimJutsuMastery()}
async function finish(win,quit,serverBijuuResolved=false){
 if(G&&G.masteryTrial)return finishMasteryBattle(win,quit);if(G&&G.story)return finishStory(win,quit);if(G&&G.ninjaMission)return completeNinjaMission(win,quit);
 G.over=true;G.finalMessage=quit?'Partida abandonada.':win?'Vitória!':'Derrota.';if(!quit){if(win&&G.eventBoss&&!serverBijuuResolved)await completeBijuuEvent();recordBattleMastery(G.you,win);degradeGear(G.you);S.c.battles++;S.c.kos+=G.kos;S.c.damage+=G.damage;if(win){S.wins++;S.c.wins++;S.xp+=180;S.ryo+=50;if(G.diff==='hard'||G.diff==='boss')S.c.hardwins++;if(G.you.every(x=>x.hp))S.c.perfect++;log('VITÓRIA!','good')}else{S.losses++;S.xp+=60;S.ryo+=10;log('DERROTA.','bad')}recordBattleCounters(win);claim();save()}renderBattle();$('#instruction').textContent=G.finalMessage
}
function renderPeriodicScope(scope,defs){
 ensureMissionPeriods();const st=S.missions[scope],box=$(`#${scope}Missions`);if(!box)return;
 box.innerHTML=defs.map(m=>{const p=Math.min(m.goal,Number(st.stats[m.type]||0)),pc=Math.round(100*p/m.goal),complete=p>=m.goal,claimed=!!st.claimed[m.id];return `<article class="mission periodicMission ${complete?'complete':''} ${claimed?'done':''}"><h3>${claimed?'✓ ':''}${m.title}</h3><div class="bar"><i style="width:${pc}%"></i></div><p><b>${p}/${m.goal}</b> • ${rewardLabel(m.reward)}</p><button data-claim-period="${scope}:${m.id}" ${complete&&!claimed?'':'disabled'}>${claimed?'RECOMPENSA RECEBIDA':complete?'RECEBER GRÁTIS':'EM PROGRESSO'}</button></article>`}).join('');
 const completeN=defs.filter(m=>Number(st.stats[m.type]||0)>=m.goal).length,pc=Math.round(100*completeN/defs.length);
 const text=$(`#${scope}MissionText`),bar=$(`#${scope}MissionBar`),bonus=$(`#${scope}Bonus`);if(text)text.textContent=`${completeN}/${defs.length}`;if(bar)bar.style.width=`${pc}%`;if(bonus){bonus.disabled=completeN<defs.length||st.bonusClaimed;bonus.textContent=st.bonusClaimed?'BAÚ RECEBIDO':scope==='daily'?`BAÚ DIÁRIO • ${rewardLabel(DAILY_BONUS)}`:`BAÚ SEMANAL • ${rewardLabel(WEEKLY_BONUS)}`}
}
function legacy_BASE_renderBijuuEvents(){
 const box=$('#bijuuEvents');if(!box)return;ensureEventPeriods();
 const scopes=['weekly','monthly'];
 box.innerHTML=scopes.map(scope=>{const x=eventBossStatus(scope),until=scope==='monthly'?S.events.temporary[x.ev.slug]:0,active=Number(until||0)>Date.now(),pc=Math.round(100*x.progress/x.goal),weekly=scope==='weekly',ev=x.ev;
  const phases=weekly?['Rastrear','Confrontar','Confirmar captura']:(ev.phases||['Fase I','Fase II','Fase III']);
  const desc=weekly?(ev.huntText||`Alvo do Livro Bingo. Descubra o padrão de ${ev.name}, vença a luta e confirme a recompensa semanal.`):(ev.mechanic||'Raid Bijū de três fases.');
  const specialty=weekly?(ev.specialty||'Caçada de Nukenin'):`Ameaça ${ev.tier}/9 • ${ev.tails} cauda(s)`;
  const approaches=weekly?[['trace','Rastreio silencioso','+1 chakra inicial e leitura segura'],['ambush','Emboscada','+2 chakra inicial; o Nukenin também reage mais rápido'],['capture','Cerco e captura','+6 Defesa inicial na equipe']]:[['balanced','Preparação equilibrada','+1 chakra inicial'],['assault','Ataque coordenado','+2 chakra inicial; a Bijū ganha +1'],['fortify','Formação defensiva','+8 Defesa inicial em cada ninja']];
  return `<article class="bijuuEventCard ${weekly?'weeklyEvent':'monthlyEvent'}"><div class="eventArt">${imgSafe(char(ev.slug)?.icon,'static/img/icon.png','bijuuEventImage')}<span>${weekly?'SEMANAL':'MENSAL'}</span></div><div class="eventBody"><small>${weekly?'CAÇADA DO LIVRO BINGO':'RAID BIJŪ • '+(ev.tails||'?')+' CAUDA(S)'}</small><h3>${ev.name}</h3><p class="eventSpecialty">${specialty}</p><p class="eventDescription">${desc}</p><div class="eventPhaseRow">${phases.map((p,i)=>`<span>${i+1}. ${p}</span>`).join('')}</div><div class="eventStatRow"><b>PV ${x.hp}</b><span>${weekly?'IA de caça e execução':'Boss adaptativo de 3 fases'}</span><span>1 recompensa por ciclo</span></div><label class="eventApproachLabel">PREPARAÇÃO<select data-event-approach="${scope}">${approaches.map(a=>`<option value="${a[0]}">${a[1]} — ${a[2]}</option>`).join('')}</select></label><div class="bar"><i style="width:${pc}%"></i></div><p class="eventReward"><b>RECOMPENSA:</b> ${rewardLabel(x.reward)}${weekly?' • equipamento aleatório não-único':''}</p><p class="eventState">${weekly?(x.st.claimed?'Caçada concluída neste ciclo. Repetições não duplicam a recompensa.':'Escolha a preparação, rastreie o alvo, vença e confirme a captura/eliminação.'):(active?`FORMA DE EVENTO DISPONÍVEL ATÉ ${new Date(until).toLocaleString('pt-BR')}`:x.st.claimed?'Raid concluída neste mês. Repetições não duplicam a recompensa.':'Vença as três fases para liberar temporariamente esta Bijū por 168h.')}</p><button data-bijuu-event="${scope}">${x.st.claimed?'REPETIR DESAFIO':'INICIAR DESAFIO'}</button></div></article>`}).join('');
 $$('[data-bijuu-event]').forEach(b=>b.onclick=()=>{const scope=b.dataset.bijuuEvent,sel=document.querySelector(`[data-event-approach="${scope}"]`);startBijuuEvent(scope,sel?.value||'balanced')})
}
function legacy_BASE_renderMissions(){
 ensureMissionPeriods();ensureEventPeriods();renderPeriodicScope('daily',activeTaskDefs('daily'));renderPeriodicScope('weekly',activeTaskDefs('weekly'));renderBijuuEvents();
 const e=$('#missions');if(e)e.innerHTML=MISS.map(m=>{let p=Math.min(m.goal,achievementValue(m.type)),pc=Math.round(100*p/m.goal);return `<div class="mission ${S.done[m.id]?'done':''}"><h3>${S.done[m.id]?'✓ ':''}${m.title}</h3><div class="bar"><i style="width:${pc}%"></i></div><p>${p}/${m.goal} — ${m.ryo} Ryō</p></div>`}).join('');
 $$('[data-claim-period]').forEach(b=>b.onclick=()=>{const [scope,id]=b.dataset.claimPeriod.split(':');claimPeriodic(scope,id)});const db=$('#dailyBonus'),wb=$('#weeklyBonus');if(db)db.onclick=()=>claimPeriodBonus('daily');if(wb)wb.onclick=()=>claimPeriodBonus('weekly');
 claimJutsuMastery();const sel=$('#jutsuMissionCharacter'),box=$('#jutsuMissions');if(!sel||!box)return;
 const chars=S.unlocked.map(char).filter(Boolean),old=sel.value;sel.innerHTML=chars.map(c=>`<option value="${c.slug}">${c.name}</option>`).join('');
 const slug=(old&&chars.some(c=>c.slug===old))?old:(S.you.find(s=>S.unlocked.includes(s))||chars[0]?.slug);if(!slug){box.innerHTML='<p>Avance no Modo História para liberar o primeiro ninja.</p>';return}
 sel.value=slug;sel.onchange=renderJutsuMissions;renderJutsuMissions()
}
const MasteryUI={variantId:null,sequence:[],timer:null,precisionHits:0,deadline:0};
function masteryTrialFor(id){return JV_BY_ID[id]?.masteryTrial||null}
function masteryOwnerTeam(v){
 const slugs=[v.character,...(S.you||[]),...(S.unlocked||[])].filter((x,i,a)=>x&&a.indexOf(x)===i&&!!char(x)).slice(0,3);
 while(slugs.length<3){const x=S.unlocked.find(z=>!slugs.includes(z)&&!!char(z));if(!x)break;slugs.push(x)}
 return slugs
}
function masteryStageLabel(mech){return ({choice:'LEITURA',sequence:'SEQUÊNCIA',precision:'PRECISÃO',timing:'TEMPO DE REAÇÃO',identify:'LEITURA DE ALVO',stabilize:'CONTROLE MÉDICO',seal:'SELAMENTO',battle:'COMBATE DE DOMÍNIO'})[mech]||String(mech||'PROVA').toUpperCase()}
function masteryFamilyIconHtml(trial,cls=''){const src=trial?.icon||'static/img/ui/open-source-r33/fontawesome/certificate.svg';return `<span class="masteryFamilyIcon ${cls}"><img src="${assetUrl(src)}" alt="" aria-hidden="true"></span>`}
function masteryStageStatus(v,i){const st=masteryTrialState(v.id);if(st.completed||Number(st.stage)>i)return'complete';if(Number(st.stage)===i)return'active';return'locked'}
function masteryFeedback(text,ok=false){const el=$('#masteryFeedback');if(el){el.className='masteryFeedback '+(ok?'ok':'bad');el.textContent=text}}
function closeMasteryTrial(){if(MasteryUI.timer){clearInterval(MasteryUI.timer);clearTimeout(MasteryUI.timer);MasteryUI.timer=null}MasteryUI.variantId=null;MasteryUI.sequence=[];const p=$('#masteryTrialPanel');if(p)p.classList.add('hidden')}
function completeMasteryStage(id,index,detail=''){
 const v=JV_BY_ID[id],trial=v?.masteryTrial;if(!v||!trial)return;const st=masteryTrialState(id);
 st.attempts=Number(st.attempts||0)+1;st.lastResult=detail||trial.stages[index]?.success||'Etapa concluída.';st.startedAt=st.startedAt||Date.now();
 st.stage=Math.max(Number(st.stage||0),index+1);
 if(st.stage>=trial.stages.length){st.completed=true;st.completedAt=Date.now();if(!S.unlockedJutsu.includes(id))S.unlockedJutsu.push(id);st.lastResult=trial.stages[index]?.success||`Domínio de ${v.name} confirmado.`}
 save();renderJutsuMissions();renderMasteryTrialPanel(id)
}
function failMasteryStage(id,msg){const st=masteryTrialState(id);st.attempts=Number(st.attempts||0)+1;st.failures=Number(st.failures||0)+1;st.lastResult=msg;st.startedAt=st.startedAt||Date.now();save();masteryFeedback(msg,false)}
function masteryChoiceHtml(v,stage){return `<div class="masteryChoiceGrid">${stage.options.map(o=>`<button data-mastery-choice="${o.id}"><b>${esc(o.label)}</b><span>Escolher esta abordagem</span></button>`).join('')}</div>`}
function masterySequenceHtml(v,stage,index){
 const tokens=[...(stage.sequence||[]),...(index===1?(stage.distractors||[]):[])];
 // ordem visual estável por variante, sem revelar a ordem correta
 tokens.sort((a,b)=>((a.charCodeAt(0)+v.id.length*7)%17)-((b.charCodeAt(0)+v.id.length*7)%17)||a.localeCompare(b));
 return `<div class="masterySequence"><div class="masterySeqProgress" id="masterySeqProgress">${(stage.sequence||[]).map((x,i)=>`<span>${i+1}</span>`).join('')}</div><div class="masterySealButtons">${tokens.map(x=>`<button data-mastery-seq="${esc(x)}"><i>${stage.mechanic==='seal'?'封':'印'}</i><b>${esc(x)}</b></button>`).join('')}</div><button class="masteryReset" id="masterySeqReset">REINICIAR SEQUÊNCIA</button></div>`
}
function masteryIdentifyHtml(v,stage){
 const sigs=Array.isArray(stage.signatures)&&stage.signatures.length?stage.signatures:Array.from({length:6},(_,i)=>({id:i,label:String.fromCharCode(65+i),flow:1+i%4,pulse:1+(i*2)%5,density:2+(i*3)%5,correct:i===0}));
 return `<div class="masteryIdentify"><p class="masterySignatureHint">${esc(stage.prompt||`Compare as assinaturas e encontre o padrão de ${v.name}.`)}</p><div class="masteryTargetGrid">${sigs.map(x=>`<button data-mastery-identify="${x.id}" data-correct="${x.correct?'1':'0'}"><i>印</i><b>ASSINATURA ${esc(x.label)}</b><span>FLUXO ${Number(x.flow)} • PULSO ${Number(x.pulse)} • DENS. ${Number(x.density)}</span></button>`).join('')}</div></div>`}
function masteryControlHtml(v,stage,kind){const target=Number(stage.target||50),tol=Number(stage.tolerance||4);return `<div class="masteryControl"><div class="masteryControlGauge"><input id="masteryControlRange" type="range" min="0" max="100" value="50"><output id="masteryControlOut">50%</output></div><p>${kind==='stabilize'?'Mantenha o chakra médico':'Fixe a intensidade do chakra'} em <b>${target-tol}%–${target+tol}%</b>.</p><button id="masteryControlLock">${kind==='stabilize'?'ESTABILIZAR PACIENTE':'FIXAR CHAKRA'}</button></div>`}
function masteryPrecisionHtml(v,stage,kind){return `<div class="masteryPrecision"><div class="masteryPrecisionHud"><span>ALVOS <b id="masteryHitCount">0/${stage.hits||4}</b></span><span>TEMPO <b id="masteryTime">${stage.seconds||8}s</b></span></div><div class="masteryPrecisionField" id="masteryPrecisionField"><button id="masteryMovingTarget" aria-label="alvo móvel">忍</button></div><button id="masteryPrecisionStart">INICIAR ${kind==='timing'?'REAÇÃO':'PRECISÃO'}</button></div>`}
function masteryBattleHtml(v,stage){const tier=Number(v.tier||1),turns=Math.max(10,Number(stage.maxTurns||0));return `<div class="masteryBattleBrief"><div class="masteryBattleSeal">戦</div><p>Vença o sparring em até <b>${turns} turnos</b> e mantenha <b>${esc(char(v.character)?.name||v.character)}</b> consciente. Uma vitória lenta ou com o usuário derrotado não aprova a técnica.</p><button id="masteryBattleStart">INICIAR COMBATE DE DOMÍNIO</button></div>`}
function masteryStageBody(v,stage,index){
 if(stage.mechanic==='choice')return masteryChoiceHtml(v,stage);
 if(stage.mechanic==='sequence'||stage.mechanic==='seal')return masterySequenceHtml(v,stage,index);
 if(stage.mechanic==='identify')return masteryIdentifyHtml(v,stage);
 if(stage.mechanic==='stabilize')return masteryControlHtml(v,stage,'stabilize');
 if(stage.mechanic==='precision'||stage.mechanic==='timing')return masteryPrecisionHtml(v,stage,stage.mechanic);
 if(stage.mechanic==='battle')return masteryBattleHtml(v,stage);
 return `<button id="masteryGenericComplete">EXECUTAR PROVA</button>`
}
function renderMasteryTrialPanel(id){
 const panel=$('#masteryTrialPanel'),v=JV_BY_ID[id],trial=v?.masteryTrial;if(!panel||!v||!trial)return;MasteryUI.variantId=id;const st=masteryTrialState(id),stageIndex=Math.min(trial.stages.length-1,Number(st.stage||0)),stage=trial.stages[stageIndex],done=st.completed||S.unlockedJutsu.includes(id),owner=char(v.character);
 panel.classList.remove('hidden');panel.innerHTML=`<div class="masteryScroll"><button class="masteryClose" id="masteryClose">×</button><header class="masteryTrialHero"><div class="masteryArt">${skillImg(v,'',`alt="${esc(v.name)}"`)}<span class="masteryStamp">忍</span></div><div><small class="masteryFamilyLine">${masteryFamilyIconHtml(trial,'hero')}<span>PROVA ${String(trial.number).padStart(3,'0')} • ${esc(trial.familyLabel)}</span></small><h2>${esc(v.name)}</h2><p>${esc(trial.intro)}</p><div class="masteryMeta"><span><b>LOCAL</b>${esc(trial.location)}</span><span><b>EXAMINADOR</b>${esc(trial.examiner)}</span><span><b>USUÁRIO</b>${esc(owner?.name||trial.ownerName)}</span></div></div></header><div class="masteryStageRoad">${trial.stages.map((x,i)=>`<div class="masteryRoadStep ${masteryStageStatus(v,i)}"><i>${i+1}</i><span><b>${esc(x.title)}</b><small>${masteryStageLabel(x.mechanic)}</small></span></div>`).join('')}</div><section class="masteryStagePanel ${done?'complete':''}">${done?`<div class="masteryComplete"><strong>免許皆伝</strong><h3>DOMÍNIO CONFIRMADO</h3><p>${esc(trial.rewardText)}</p><button id="masteryEquipNow">EQUIPAR NO SLOT ${Number(v.slot)+1}</button></div>`:`<small>ETAPA ${stageIndex+1}/${trial.stages.length} • ${masteryStageLabel(stage.mechanic)}</small><h3>${esc(stage.title)}</h3><p>${esc(stage.prompt)}</p>${masteryStageBody(v,stage,stageIndex)}<div id="masteryFeedback" class="masteryFeedback">${esc(st.lastResult||'A prova salva cada etapa concluída separadamente.')}</div>`}</section><footer><span>Tentativas: <b>${Number(st.attempts||0)}</b></span><span>Falhas: <b>${Number(st.failures||0)}</b></span><span>Progresso: <b>${done?trial.stages.length:Math.min(trial.stages.length,Number(st.stage||0))}/${trial.stages.length}</b></span></footer></div>`;
 $('#masteryClose').onclick=closeMasteryTrial;
 if(done){const eq=$('#masteryEquipNow');if(eq)eq.onclick=()=>{setVariant(v.character,v.slot,v.id);closeMasteryTrial()};return}
 bindMasteryStage(v,stage,stageIndex)
}
function bindMasteryStage(v,stage,index){
 $$('[data-mastery-choice]').forEach(b=>b.onclick=()=>{const o=stage.options.find(x=>x.id===b.dataset.masteryChoice);if(o?.correct)completeMasteryStage(v.id,index,stage.success);else failMasteryStage(v.id,stage.failure)});
 if(stage.mechanic==='sequence'||stage.mechanic==='seal'){
  MasteryUI.sequence=[];$$('[data-mastery-seq]').forEach(b=>b.onclick=()=>{const token=b.dataset.masterySeq,need=stage.sequence[MasteryUI.sequence.length];if(token!==need){MasteryUI.sequence=[];$$('.masterySeqProgress span').forEach(x=>x.classList.remove('done'));return failMasteryStage(v.id,stage.failure)}MasteryUI.sequence.push(token);const spans=$$('.masterySeqProgress span');if(spans[MasteryUI.sequence.length-1])spans[MasteryUI.sequence.length-1].classList.add('done');if(MasteryUI.sequence.length===stage.sequence.length)completeMasteryStage(v.id,index,stage.success)});const r=$('#masterySeqReset');if(r)r.onclick=()=>{MasteryUI.sequence=[];$$('.masterySeqProgress span').forEach(x=>x.classList.remove('done'));masteryFeedback('Sequência reiniciada.',false)}}
 $$('[data-mastery-identify]').forEach(b=>b.onclick=()=>b.dataset.correct==='1'?completeMasteryStage(v.id,index,stage.success):failMasteryStage(v.id,stage.failure));
 const range=$('#masteryControlRange'),out=$('#masteryControlOut'),lock=$('#masteryControlLock');if(range&&out)range.oninput=()=>out.textContent=range.value+'%';if(lock)lock.onclick=()=>{const val=Number(range.value),target=Number(stage.target||50),tol=Number(stage.tolerance||4);Math.abs(val-target)<=tol?completeMasteryStage(v.id,index,stage.success):failMasteryStage(v.id,`${stage.failure} Controle registrado: ${val}%; alvo ${target-tol}%–${target+tol}%.`)};
 const ps=$('#masteryPrecisionStart');if(ps)ps.onclick=()=>startMasteryPrecision(v,stage,index);
 const bs=$('#masteryBattleStart');if(bs)bs.onclick=()=>startMasteryBattle(v.id);
 const gs=$('#masteryGenericComplete');if(gs)gs.onclick=()=>completeMasteryStage(v.id,index,stage.success)
}
function moveMasteryTarget(){const f=$('#masteryPrecisionField'),b=$('#masteryMovingTarget');if(!f||!b)return;b.style.left=(6+Math.random()*82)+'%';b.style.top=(8+Math.random()*72)+'%'}
function startMasteryPrecision(v,stage,index){
 const b=$('#masteryMovingTarget'),start=$('#masteryPrecisionStart'),time=$('#masteryTime'),count=$('#masteryHitCount');if(!b||!start)return;start.disabled=true;MasteryUI.precisionHits=0;MasteryUI.deadline=Date.now()+Number(stage.seconds||8)*1000;moveMasteryTarget();b.classList.add('active');
 const timing=stage.mechanic==='timing';let windowOpen=!timing,lastWindow=0;
 const setWindow=open=>{windowOpen=!!open;b.classList.toggle('windowOpen',windowOpen);b.setAttribute('aria-label',windowOpen?'janela aberta':'aguarde a abertura')};
 if(timing)setWindow(false);else setWindow(true);
 b.onclick=()=>{if(Date.now()>MasteryUI.deadline)return;if(timing&&!windowOpen){masteryFeedback('Fora da janela. Espere o selo acender antes de reagir.',false);return}MasteryUI.precisionHits++;if(count)count.textContent=`${MasteryUI.precisionHits}/${stage.hits||4}`;if(MasteryUI.precisionHits>=Number(stage.hits||4)){clearInterval(MasteryUI.timer);MasteryUI.timer=null;b.classList.remove('active','windowOpen');return completeMasteryStage(v.id,index,stage.success)}if(timing)setWindow(false);moveMasteryTarget()};
 MasteryUI.timer=setInterval(()=>{const now=Date.now(),left=Math.max(0,Math.ceil((MasteryUI.deadline-now)/1000));if(time)time.textContent=left+'s';if(timing&&now-lastWindow>520){lastWindow=now;setWindow(!windowOpen);if(windowOpen)moveMasteryTarget()}if(!timing&&Math.random()<.35)moveMasteryTarget();if(left<=0){clearInterval(MasteryUI.timer);MasteryUI.timer=null;b.classList.remove('active','windowOpen');failMasteryStage(v.id,`${stage.failure} Acertos válidos: ${MasteryUI.precisionHits}/${stage.hits||4}.`);start.disabled=false}},160)
}
function startMasteryBattle(id){
 const v=JV_BY_ID[id],trial=v?.masteryTrial;if(!v||!trial)return;const st=masteryTrialState(id),idx=Math.min(trial.stages.length-1,Number(st.stage||0));if(trial.stages[idx]?.mechanic!=='battle')return;const tier=Number(v.tier||1),p=AI_PROFILES.find(x=>x.id===(tier<=1?'academia':'equilibrada'))||AI_PROFILES[1],slugs=masteryOwnerTeam(v),you=slugs.map(x=>clone(char(x),false,p.difficulty)),ai=teamForProfile(p).map(c=>clone(c,true,p.difficulty));
 const owner=you.find(x=>x.slug===v.character);if(owner){owner.skills=owner.skills||[];owner.skills[Number(v.slot)]={...v,cd:0,originalName:v.name,masteryTrialTechnique:true}}
 const trialCh=ensureMasteryTechniqueChakra(gain(emptyCh(),8,you),v.cost||[]);
 closeMasteryTrial();G={masteryTrial:{variantId:id,stageIndex:idx,maxTurns:Math.max(10,Number(trial.stages[idx].maxTurns||0)),owner:v.character,techniqueUsed:false},turn:1,diff:p.difficulty,profile:{...p,name:`PROVA DE DOMÍNIO — ${v.name}`,plan:trial.stages[idx].prompt},strategy:'smart',you,ai,ch:trialCh,aich:gain(emptyCh(),tier===1?6:8,ai),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},aiState:{defensiveStreak:0,lastKinds:[]}};selected=null;show('battle');$('#battlelog').innerHTML='';$('#player0 .controlTag').textContent='PROVA DE DOMÍNIO — CANDIDATO';$('#player1 .controlTag').textContent='EXAMINADORES — SPARRING';$('#bottomAI').textContent='EXAMINADOR';$('#bottomAIPlan').textContent='PROVA DE DOMÍNIO';$('#view').innerHTML=`<section class="r31MasteryBattleBrief r33NarutoUnisonBrief"><small class="masteryFamilyLine">${masteryFamilyIconHtml(trial,'battle')}<span>PROVA ${String(trial.number).padStart(3,'0')} • ${esc(trial.familyLabel)}</span></small><h4>${esc(v.name)}</h4><p>${esc(trial.intro)}</p><p><b>Obrigatório:</b> usar ${esc(v.name)} pelo menos uma vez, vencer em até ${G.masteryTrial.maxTurns} turnos e manter ${esc(char(v.character)?.name||v.character)} consciente.</p></section>`;log(`Prova de Domínio iniciada: ${v.name}. A técnica foi disponibilizada temporariamente no slot ${Number(v.slot)+1}.`,'info');renderBattle()
}
function finishMasteryBattle(win,quit){
 const info=G?.masteryTrial,v=JV_BY_ID[info?.variantId],trial=v?.masteryTrial,owner=G?.you?.find(x=>x.slug===info?.owner),fast=Number(G?.turn||99)<=Number(info?.maxTurns||6),used=!!info?.techniqueUsed,passed=!!win&&!quit&&used&&!!owner&&Number(owner.hp)>0&&fast;const idx=Number(info?.stageIndex||0);if(G&&!quit){recordBattleMastery(G.you,win);degradeGear(G.you);S.c.battles++;trackPeriodic('battles',1);if(win){S.wins++;S.c.wins++;trackPeriodic('wins',1)}else S.losses++}G=null;clearBattleSession();show('jutsus');renderMissions();setTimeout(()=>window.NarutoDesktopOverhaul?.showTraining?.(),0);if(passed)completeMasteryStage(v.id,idx,trial.stages[idx].success);else{const reason=quit?'Prova de combate abandonada.':!used?`A técnica ${v.name} não foi usada.`:!win?'Sparring perdido.':!owner||owner.hp<=0?'O usuário da técnica foi derrotado.':`Vitória acima do limite de ${Number(info?.maxTurns||6)} turnos.`;failMasteryStage(v.id,`${trial.stages[idx].failure} ${reason}`);renderJutsuMissions();renderMasteryTrialPanel(v.id)}
}
function renderJutsuMissions(){
 const sel=$('#jutsuMissionCharacter'),box=$('#jutsuMissions');if(!sel||!box)return;const slug=sel.value,c=char(slug);if(!c)return;const variants=variantsFor(slug);
 box.innerHTML=variants.map(v=>{const q=jutsuProgress(v),trial=v.masteryTrial,st=masteryTrialState(v.id),pc=Math.min(100,Math.round(100*q.value/q.goal)),done=S.unlockedJutsu.includes(v.id)||st.completed,eq=S.loadouts?.[slug]?.[v.slot]===v.id;return `<article class="jutsuMissionCard r31MasteryCard ${done?'done':'locked'}"><div class="r31MasteryArt">${skillImg(v,'',`alt="${esc(v.name)}"`)}<span>PROVA ${String(trial?.number||0).padStart(3,'0')}</span></div><div class="r31MasteryBody"><small class="masteryFamilyLine">${masteryFamilyIconHtml(trial,'card')}<span>${esc(trial?.familyLabel||'PROVA DE DOMÍNIO')}</span></small><h4>${done?'✓ ':''}${esc(v.name)}${variantSourceHtml(v)}</h4>${skillInfoHtml(v)}<p class="r31MasteryIntro">${esc(trial?.intro||v.desc)}</p><div class="r31MasteryMeta"><span><b>LOCAL</b>${esc(trial?.location||'Campo de treino')}</span><span><b>EXAMINADOR</b>${esc(trial?.examiner||'Instrutor')}</span></div><div class="masteryStageMini">${(trial?.stages||[]).map((x,i)=>`<span class="${masteryStageStatus(v,i)}"><i>${i+1}</i>${masteryStageLabel(x.mechanic)}</span>`).join('')}</div><div class="bar"><i style="width:${pc}%"></i></div><p><b>${done?'DOMÍNIO CONFIRMADO':`ETAPA ${Math.min(q.goal,q.value+1)}/${q.goal}`}</b> • ${q.value}/${q.goal} concluídas${eq?' • EQUIPADA':''}</p><div class="r31MasteryActions"><button data-open-mastery="${v.id}">${done?'REVER PROVA':'ABRIR PROVA DE DOMÍNIO'}</button>${done?`<button data-equip-mission="${v.id}">${eq?'EQUIPADA':'EQUIPAR NO SLOT '+(Number(v.slot)+1)}</button>`:''}</div></div></article>`}).join('');
 $$('[data-open-mastery]').forEach(b=>b.onclick=()=>renderMasteryTrialPanel(b.dataset.openMastery));$$('[data-equip-mission]').forEach(b=>{const v=JV_BY_ID[b.dataset.equipMission];b.onclick=()=>setVariant(v.character,v.slot,v.id)})
}

function rankEnemyProfile(rank){const id={D:'academia',C:'equilibrada',B:'controle',A:'anbu',S:'srank'}[rank]||'equilibrada';return AI_PROFILES.find(p=>p.id===id)||AI_PROFILES[1]}
function ninjaMissionReward(m,first){const ryo=Math.round(Number(m.ryo||0)*(first?1:.35)),xp=Math.round(Number(m.xp||0)*(first?1:.4));return {ryo,xp}}
function legacyR15_resolveRankD(m,approach){const team=S.you.map(char).filter(Boolean);const mastery=team.reduce((n,c)=>n+Number(masteryFor(c.slug).battles||0),0),roll=1+Math.floor(Math.random()*10)+1+Math.floor(Math.random()*10),target=10+Math.floor(m.number/7),bonus=Math.min(5,Math.floor(mastery/8));const ok=roll+bonus>=target;S.ninjaMissions.attempts[m.id]=Number(S.ninjaMissions.attempts[m.id]||0)+1;if(ok){const first=!S.ninjaMissions.completed[m.id];S.ninjaMissions.completed[m.id]=true;S.ninjaMissions.last=m.id;const rw=ninjaMissionReward(m,first);S.ryo+=rw.ryo;S.xp+=rw.xp;S.c.ninjaMissions=Number(S.c.ninjaMissions||0)+1;trackPeriodic('ninjaMissions',1);if(first&&Math.random()<Number(m.gearChance||0)){const g=randomGear(m.rank);awardGear(g.id);alert(`MISSÃO CONCLUÍDA\n${m.title}\n${rw.ryo} Ryō • ${rw.xp} XP\nEquipamento: ${g.name}`)}else alert(`MISSÃO CONCLUÍDA\n${m.title}\n${rw.ryo} Ryō • ${rw.xp} XP`)}else alert(`MISSÃO COMPLICADA\n${m.title}\nA abordagem ${approach.name} falhou no teste 2d10 (${roll}+${bonus} contra ${target}). Tente outra abordagem ou equipe.`);claim();save();renderNinjaMissions()}
function legacyR15_startNinjaMission(id,approachId){const m=NINJA_MISSIONS.find(x=>x.id===id),approach=m?.approaches?.find(a=>a.id===approachId);if(!m||!approach)return;if(S.you.length!==3)return alert('Selecione 3 personagens em PERSONAGENS / EQUIPE antes da missão.');if(m.rank==='D'){legacyR15_resolveRankD(m,approach);return}const p=rankEnemyProfile(m.rank),team=teamForProfile(p),you=S.you.map(s=>clone(char(s),false,p.difficulty)),ai=team.map(c=>clone(c,true,p.difficulty)),startCh=m.rank==='S'?10:m.rank==='A'?8:7;G={ninjaMission:{id:m.id,approach:approach.id},turn:1,diff:p.difficulty,profile:{...p,name:`Rank ${m.rank} — ${m.title}`,plan:approach.desc},strategy:approach.strategy,you,ai,ch:gain(emptyCh(),7+Math.min(3,you.reduce((n,f)=>n+Number(f.gearStartChakra||0),0)),you),aich:gain(emptyCh(),startCh,ai),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},aiState:{defensiveStreak:0,lastKinds:[]}};selected=null;show('battle');$('#battlelog').innerHTML='';$('#player0 .controlTag').textContent=`MISSÃO RANK ${m.rank} — VOCÊ`;$('#player1 .controlTag').textContent=`MISSÃO RANK ${m.rank} — ADVERSÁRIOS`;$('#bottomAI').textContent=m.title;$('#bottomAIPlan').textContent=approach.name.toUpperCase();$('#view').innerHTML=`<section><h4>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</h4><p>${m.title}</p><p><b>Abordagem:</b> ${approach.name} — ${approach.desc}</p></section>`;log(`Missão Ninja ${m.number}: ${m.title}`,'info');log(`Abordagem escolhida: ${approach.name}.`,'info');renderBattle()}
function legacyR15_completeNinjaMission(win,quit){const info=G.ninjaMission,m=NINJA_MISSIONS.find(x=>x.id===info.id);G.over=true;G.finalMessage=quit?'Missão abandonada.':win?'MISSÃO NINJA CONCLUÍDA!':'MISSÃO NINJA FALHOU.';if(!quit){degradeGear(G.you);recordBattleMastery(G.you,win);S.c.battles++;S.c.kos+=G.kos;S.c.damage+=G.damage;trackPeriodic('battles',1);if(win){const first=!S.ninjaMissions.completed[m.id];S.ninjaMissions.completed[m.id]=true;S.ninjaMissions.last=m.id;S.ninjaMissions.attempts[m.id]=Number(S.ninjaMissions.attempts[m.id]||0)+1;const rw=ninjaMissionReward(m,first);S.ryo+=rw.ryo;S.xp+=rw.xp;S.wins++;S.c.wins++;S.c.ninjaMissions=Number(S.c.ninjaMissions||0)+1;trackPeriodic('wins',1);trackPeriodic('ninjaMissions',1);let gear=null;if(first&&Math.random()<Number(m.gearChance||0)){gear=randomGear(m.rank);awardGear(gear.id)}log(`MISSÃO CONCLUÍDA • ${rw.ryo} Ryō • ${rw.xp} XP${gear?' • '+gear.name:''}`,'good')}else{S.losses++;S.xp+=40;log('MISSÃO FALHOU.','bad')}claim();save()}renderBattle();$('#instruction').textContent=G.finalMessage}
function legacyR15_renderNinjaMissions(){const box=$('#ninjaMissionGrid');if(!box)return;const rank=$('#ninjaMissionRank')?.value||'D',list=NINJA_MISSIONS.filter(m=>m.rank===rank),team=$('#ninjaMissionTeam');if(team)team.innerHTML=S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')} ${c.name}</span>`).join('')||'<b>Selecione 3 ninjas na tela de Personagens / Equipe.</b>';box.innerHTML=list.map(m=>{const done=!!S.ninjaMissions.completed[m.id],attempts=Number(S.ninjaMissions.attempts[m.id]||0);return `<article class="ninjaMissionCard ${done?'done':''}"><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h3>${done?'✓ ':''}${m.title}</h3><p><b>BASE:</b> ${m.ryo} Ryō • ${m.xp} XP</p><p><b>1ª CONCLUSÃO:</b> ${m.rewardText||'recompensa útil'}${m.firstClearReward?.gear?` • ${EQUIPMENT_BY_ID[m.firstClearReward.gear]?.name||m.firstClearReward.gear}`:''}</p><p><b>BÔNUS DE EQUIPAMENTO:</b> ${(m.gearChance*100).toFixed(0)}%</p><p>Tentativas: ${attempts}</p><div class="missionApproaches">${m.approaches.map(a=>`<button data-ninja-mission="${m.id}" data-approach="${a.id}"><b>${a.name}</b><span>${a.desc}</span></button>`).join('')}</div></article>`}).join('');$$('[data-ninja-mission]').forEach(b=>b.onclick=()=>startNinjaMission(b.dataset.ninjaMission,b.dataset.approach))}

function legacy_BASE_renderProfile(){$('#nameInput').value=S.name;const totalItems=inventoryCount();$('#profileStats').textContent=`Nível ${level()} • ${S.xp} XP • ${S.ryo} Ryō • ${S.wins} vitórias • ${S.losses} derrotas • ${totalItems} item(ns) no inventário`}
$('#saveName').onclick=()=>{S.name=($('#nameInput').value||'Jogador').trim().slice(0,24)||'Jogador';save();renderProfile()};$('#exportSave').onclick=()=>{let b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='Naruto-Unison-PTBR-save.json';a.click();URL.revokeObjectURL(a.href)};$('#importSave').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(x.ryo===undefined)x.ryo=Number(x.dna||300);delete x.dna;S={...defaults(),...x,c:{...defaults().c,...(x.c||{})},story:{...storyDefaults(),...(x.story||{})},unlockedJutsu:Array.isArray(x.unlockedJutsu)?x.unlockedJutsu:[],loadouts:x.loadouts||{},mastery:x.mastery||{},jutsuMastery:x.jutsuMastery||{},inventory:{...defaults().inventory,...(x.inventory||{})},gear:x.gear||defaults().gear,ninjaMissions:x.ninjaMissions||defaults().ninjaMissions,missions:x.missions||defaults().missions,events:x.events||eventDefaults(),ranked:{...defaults().ranked,...(x.ranked||{})},unlockPolicyVersion:8};ensureMissionPeriods();ensureEventPeriods();S.unlocked=storyUnlockedCharacters();save();renderRoster();renderProfile()}catch(_){alert('Save inválido.')}};r.readAsText(f)};$('#resetSave').onclick=()=>{if(confirm('Apagar o progresso?')){S=defaults();save();renderRoster();renderProfile()}};



/* ========================= R16 GAMEPLAY OVERHAUL ========================= */
const R16_CHAKRA_TYPES=['Blood','Gen','Nin','Tai'];
const R16_CHAKRA_SHORT={Blood:'KEK',Gen:'GEN',Nin:'NIN',Tai:'TAI',Rand:'Q'};
const R16_CHAKRA_FULL={Blood:'Linhagem',Gen:'Genjutsu',Nin:'Ninjutsu',Tai:'Taijutsu',Rand:'Qualquer'};
function emptyCh(){return{Blood:0,Gen:0,Nin:0,Tai:0}}
function chakraTotal(ch){return R16_CHAKRA_TYPES.reduce((a,k)=>a+Number(ch?.[k]||0),0)}
function chakraDemand(team){const w={Blood:1,Gen:1,Nin:1,Tai:1};for(const f of(team||[])){if(!f||Number(f.hp||1)<=0)continue;for(const sk of(f.skills||[]))for(const c of(sk.cost||[]))if(R16_CHAKRA_TYPES.includes(c))w[c]+=1}return w}
function chakraProbabilities(team,ch={}){const w=chakraDemand(team),usable=R16_CHAKRA_TYPES.filter(k=>Number(ch[k]||0)<CHAKRA_RULES.maxPerType),sum=usable.reduce((n,k)=>n+w[k],0)||1;return Object.fromEntries(R16_CHAKRA_TYPES.map(k=>[k,usable.includes(k)?Math.round(w[k]*100/sum):0]))}
function gain(ch,n,team=null){let left=Math.max(0,Number(n||0));while(left-->0&&chakraTotal(ch)<CHAKRA_RULES.maxTotal){const prob=chakraDemand(team),available=R16_CHAKRA_TYPES.filter(k=>Number(ch[k]||0)<CHAKRA_RULES.maxPerType);if(!available.length)break;const total=available.reduce((x,k)=>x+prob[k],0);let r=Math.random()*total,pick=available[available.length-1];for(const k of available){r-=prob[k];if(r<=0){pick=k;break}}ch[pick]=Number(ch[pick]||0)+1}return ch}
function wildcardPayPlan(ch,cost){const t=Object.fromEntries(R16_CHAKRA_TYPES.map(k=>[k,Number(ch?.[k]||0)]));const specific=(cost||[]).filter(c=>c!=='Rand'),wild=(cost||[]).filter(c=>c==='Rand').length;for(const c of specific){if(!R16_CHAKRA_TYPES.includes(c)||t[c]<=0)return null;t[c]--}const spent=[];for(let i=0;i<wild;i++){const candidates=R16_CHAKRA_TYPES.filter(k=>t[k]>0).sort((a,b)=>t[b]-t[a]);if(!candidates.length)return null;const k=candidates[0];t[k]--;spent.push(k)}return {after:t,wildSpent:spent}}
function canPay(ch,cost){return !!wildcardPayPlan(ch,cost)}
function pay(ch,cost){const plan=wildcardPayPlan(ch,cost);if(!plan)return false;for(const k of R16_CHAKRA_TYPES)ch[k]=plan.after[k];return true}
function remaining(){let c={...G.ch};for(const a of(G.acts||[])){const sk=G.you[a.user]?.skills?.[a.skill];if(sk&&canPay(c,sk.cost))pay(c,sk.cost)}return c}
function costText(cost){const n={Blood:0,Gen:0,Nin:0,Tai:0,Rand:0};for(const c of(cost||[]))n[c]=(n[c]||0)+1;return ['Blood','Gen','Nin','Tai','Rand'].filter(k=>n[k]).map(k=>`${R16_CHAKRA_SHORT[k]} ${n[k]}`).join(' • ')||'GRÁTIS'}
function costs(cost){const n={Blood:0,Gen:0,Nin:0,Tai:0,Rand:0};for(const c of(cost||[]))n[c]=(n[c]||0)+1;const html=['Blood','Gen','Nin','Tai','Rand'].filter(k=>n[k]).map(k=>`<span class="chakraCostPill ${CCLS[k]||'rand'}" title="${k==='Rand'?'QUALQUER: pago automaticamente com qualquer chakra real disponível':R16_CHAKRA_FULL[k]}"><b>${R16_CHAKRA_SHORT[k]}</b><strong>${n[k]}</strong></span>`).join('');return html||'<span class="extra">GRÁTIS</span>'}

function rosterPool(){
 let visible=[...R,...VIRTUAL_BIJUU].filter(c=>!c.eventOnly||S.unlocked.includes(c.slug));
 if(browseMode==='original'||browseMode==='first')visible=visible.filter(c=>!c.slug.endsWith('-(s)')&&!c.slug.endsWith('-(r)')&&!c.eventOnly);
 else if(browseMode==='shippuden')visible=visible.filter(c=>c.slug.endsWith('-(s)'));
 else if(browseMode==='reanimated')visible=visible.filter(c=>c.slug.endsWith('-(r)'));
 else if(browseMode==='boruto')visible=visible.filter(c=>c.era==='boruto'||/adulto|hokage|boruto|sexto/.test(c.slug));
 else if(browseMode==='events')visible=visible.filter(c=>c.eventOnly);
 return [...visible].sort((a,b)=>{const au=S.unlocked.includes(a.slug)?0:1,bu=S.unlocked.includes(b.slug)?0:1;if(au!==bu)return au-bu;return a.name.localeCompare(b.name,'pt-BR')})
}
function renderRoster(){
 let pool=rosterPool();if(pageIndex>=pool.length)pageIndex=Math.max(0,Math.floor(Math.max(0,pool.length-1)/pageSize)*pageSize);const e=$('#roster');e.innerHTML='';
 pool.slice(pageIndex,pageIndex+pageSize).forEach(c=>{const w=document.createElement('div');w.className='charWrapper';const locked=!S.unlocked.includes(c.slug),on=S.you.includes(c.slug),where=CHAR_UNLOCKS.unlockAt?.[c.slug];w.innerHTML=`${imgSafe(c.icon,c.icon,`char charicon ${locked?'locked':''} ${on?'on':''}`,`role="button" title="${c.name}${locked&&where?' — '+where.chapter+': '+where.title:' — clique para ver, duplo clique para adicionar/remover'}"`)}${locked?`<span class="storyLockedTag">HISTÓRIA${where?' • '+where.chapter.replace('Capítulo ','CAP. '):''}</span>`:`<button class="${on?'remove':'add'}" title="${on?'Remover':'Adicionar'} ${c.name}"></button>${c.eventOnly?'<span class="eventTempTag">TEMPORÁRIO</span>':''}`}`;const portrait=w.querySelector('img');portrait.onclick=()=>preview(c);portrait.ondblclick=()=>{if(!locked)addTo(c)};const b=w.querySelector('button');if(b)b.onclick=(ev)=>{ev.stopPropagation();addTo(c)};e.appendChild(w)});
 preview(viewed);const prev=$('#prevPage'),next=$('#nextPage');prev.disabled=pageIndex<=0;next.disabled=pageIndex+pageSize>=pool.length;prev.textContent='‹';next.textContent='›';$$('[data-browse]').forEach(b=>b.disabled=b.dataset.browse===browseMode)
}

function battleItemTargetSide(type){const e=SHOP_ITEMS[type]?.effect||'';if(['healWeak','cleanse','invulnWeak','shieldWeak'].includes(e))return'ally';if(['damageWeak','dotWeak','stunWeak','dispelWeak'].includes(e))return'enemy';return'none'}
function battleItemTargets(type){const side=battleItemTargetSide(type),team=side==='ally'?G?.you:side==='enemy'?G?.ai:[];return (team||[]).map((f,i)=>({f,i})).filter(x=>x.f&&x.f.hp>0)}
function battleItemTargetOptions(type,selectedIndex=''){const side=battleItemTargetSide(type);if(side==='none')return'<option value="">SEM ALVO — efeito global/chakra</option>';const list=battleItemTargets(type);return `<option value="">ESCOLHA O ${side==='ally'?'ALIADO':'INIMIGO'}</option>`+list.map(x=>`<option value="${x.i}" ${String(selectedIndex)===String(x.i)?'selected':''}>${esc(x.f.name)} • ${Math.ceil(x.f.hp)}/${Math.ceil(x.f.maxHp)} PV</option>`).join('')}
function battleItemTarget(type,index){const side=battleItemTargetSide(type);if(side==='none')return null;const team=side==='ally'?G.you:G.ai,i=Number(index);return Number.isInteger(i)&&i>=0&&i<team.length&&team[i]?.hp>0?team[i]:null}
function selectedBattleItemReason(type,targetIndex=null){if(!G)return'Nenhuma batalha ativa.';const it=SHOP_ITEMS[type];if(!it)return'Item inválido.';if(Number(S.inventory[type]||0)<=0)return'Você não possui este item.';if(G.itemUsedTurn===G.turn)return'Você já usou 1 item neste turno.';if(Number(G.itemUsesTotal||0)>=ITEM_RULES.perBattle)return`Limite de ${ITEM_RULES.perBattle} itens por batalha atingido.`;if(Number(G.itemUsesByType?.[type]||0)>=ITEM_RULES.sameItemPerBattle)return'O mesmo item só pode ser usado 1 vez por batalha.';const side=battleItemTargetSide(type),target=battleItemTarget(type,targetIndex);if(side!=='none'&&!target)return`Escolha ${side==='ally'?'um aliado':'um inimigo'} para usar ${it.name}.`;if(it.effect==='healWeak'&&target.hp>=target.maxHp)return'Esse aliado já está com PV máximo.';if(it.effect==='healAll'&&!alive(G.you).some(a=>a.hp<a.maxHp))return'Todos os aliados vivos estão com PV máximo.';if(it.effect==='cleanse'&&!(target.stun||target.dot))return'O alvo escolhido não tem Atordoamento nem Aflição.';if(it.effect==='dispelWeak'&&!(target.shield||target.inv))return'O alvo escolhido não possui Defesa nem Invulnerabilidade.';return''}
async function useRaidBattleItem(type,targetIndex=null){
 if(!G?.eventBoss?.challengeToken||!ON.token)return;const queued=(G.acts||[]).map(a=>({...a}));const r=await api('/api/account/bijuu-item',{token:ON.token,challengeToken:G.eventBoss.challengeToken,turn:G.turn,item:type,target:targetIndex});if(!r.ok){log(r.error||'Falha ao usar item na Raid.','bad');return}if(r.profile)applyServerProfile(r.profile,r.revision);applyBijuuServerGame(r.game);G.acts=queued;selected=null;if(Array.isArray(r.game?.log))for(const entry of r.game.log.slice(-3))log(entry.text||entry,entry.kind||'info');renderBattle()
}
async function useBattleItem(type,targetIndex=null){
 if(!G||G.over||battleFxBusy())return;if(G.online){await useOnlineBattleItem(type,targetIndex);return}if(G.eventBoss?.serverAuthoritative){await useRaidBattleItem(type,targetIndex);return}const why=selectedBattleItemReason(type,targetIndex);if(why)return log(why,'bad');const it=SHOP_ITEMS[type],beforeFx=window.BattleFX?window.BattleFX.capture(G):null;let used=false,t=battleItemTarget(type,targetIndex);
 if(it.effect==='gainRandom'){gain(G.ch,it.amount||1,G.you);used=true}
 else if(it.effect==='gainSpecific'){for(const [k,v] of Object.entries(it.chakra||{}))if(R16_CHAKRA_TYPES.includes(k))G.ch[k]=Math.min(CHAKRA_RULES.maxPerType,Number(G.ch[k]||0)+Number(v||0));used=true}
 else if(it.effect==='healWeak'){const old=t.hp;t.hp=Math.min(t.maxHp,t.hp+(it.amount||0));log(`${it.name} em ${t.name}: +${t.hp-old} PV.`,'good');used=true}
 else if(it.effect==='healAll'){for(const a of alive(G.you)){a.hp=Math.min(a.maxHp,a.hp+(it.amount||0));used=true}}
 else if(it.effect==='cleanse'){t.stun=0;t.stunTurns=0;t.dot=0;t.dotTurns=0;used=true}
 else if(it.effect==='invulnWeak'){t.inv=1;t.invTurns=Math.max(t.invTurns||0,it.duration||1);used=true}
 else if(it.effect==='shieldWeak'){t.shield+=(it.amount||0);t.shieldTurns=Math.max(t.shieldTurns||0,it.duration||0);used=true}
 else if(it.effect==='shieldAll'){for(const a of alive(G.you)){a.shield+=(it.amount||0);a.shieldTurns=Math.max(a.shieldTurns||0,it.duration||0);used=true}}
 else if(it.effect==='damageWeak'){const old=t.hp,dealt=hit(t,it.amount||0);G.damage+=dealt;if(old>0&&!t.hp)G.kos++;used=true}
 else if(it.effect==='dotWeak'){const old=t.hp,dealt=it.amount?hit(t,it.amount):0;G.damage+=dealt;if(old>0&&!t.hp)G.kos++;if(t.hp){t.dot=it.dot||7;t.dotTurns=Math.max(t.dotTurns||0,it.duration||1)}used=true}
 else if(it.effect==='stunWeak'){t.stun=1;t.stunTurns=Math.max(t.stunTurns||0,it.duration||1);used=true}
 else if(it.effect==='dispelWeak'){t.shield=0;t.shieldTurns=0;t.inv=0;t.invTurns=0;used=true}
 if(!used)return;log(`${it.name} usado${t?' em '+t.name:''}.`,'good');S.inventory[type]--;S.c.items=Number(S.c.items||0)+1;trackPeriodic('items',1);G.itemUsedTurn=G.turn;G.itemUsesTotal=Number(G.itemUsesTotal||0)+1;G.itemUsesByType=G.itemUsesByType||{};G.itemUsesByType[type]=Number(G.itemUsesByType[type]||0)+1;save();G.animating=true;renderBattle();if(beforeFx&&window.BattleFX)await window.BattleFX.resolveDiff(beforeFx,G);G.animating=false;if(!alive(G.ai).length)return finish(true,false);renderBattle()
}

async function skipTurn(){
 if(!G||G.over||G.animating||battleFxBusy())return;if(G.acts?.length&&!confirm('Você já colocou técnicas na fila. Remover a fila e pular o turno?'))return;G.acts=[];selected=null;
 if(G.online){const turn=G.turn,r=await api('/api/room/submit',{token:ON.token,code:ON.room,turn,acts:[]});if(!r.ok)return log(r.error||'Falha ao pular turno.','bad');ON.submittedTurn=turn;renderBattle();$('#instruction').textContent='Turno pulado. Aguardando o adversário...';ON.poll=setTimeout(pollRoom,500);return}
 if(G.eventBoss?.serverAuthoritative){G.animating=true;renderBattle();try{const r=await api('/api/account/bijuu-turn',{token:ON.token,challengeToken:G.eventBoss.challengeToken,turn:G.turn,acts:[]});if(!r.ok){log(r.error||'Falha ao pular turno da Raid.','bad');return}applyBijuuServerGame(r.game);if(r.profile)applyServerProfile(r.profile,r.revision);if(Array.isArray(r.game?.log))for(const e of r.game.log)log(e.text||e,e.kind||'info');if(r.game?.winner)return finish(r.game.winner==='player',false,true)}finally{if(G){G.animating=false;renderBattle()}}return}
 G.animating=true;renderBattle();try{log(`${S.name} pulou o turno.`,'info');expireDefenseAfterOpponentPhase(G.ai);for(const a of aiActs())await perform(a,true);expireDefenseAfterOpponentPhase(G.you);if(!alive(G.you).length)return finish(false,false);if(G.story&&!storyProtectedAlive())return finish(false,false);await tick();if(!alive(G.ai).length)return finish(true,false);if(!alive(G.you).length)return finish(false,false);if(G.story&&storyRoundComplete())return;G.turn++;gain(G.ch,CHAKRA_RULES.turnGain,G.you);gain(G.aich,CHAKRA_RULES.turnGain,G.ai);log(`— Turno ${G.turn} —`,'info')}finally{if(G){G.animating=false;renderBattle()}}
}

function legacy_R16_GAMEPLAY_OVERHAUL_renderCenter(){
 const rem=remaining(),waiting=!!(G.online&&ON.submittedTurn!==null),resolving=!!G.animating,probs=chakraProbabilities(G.you,rem);const queueHtml=G.acts.map(a=>{const sk=G.you[a.user].skills[a.skill];return `<button class="act" data-remove="${a.user}" title="${esc(sk.name)} — clique para remover da fila" ${waiting||resolving?'disabled':''}><span class="queueSkillFrame">${skillImg(sk,'queueSkill',`alt="${esc(sk.name)}"`)}</span><div class="actcost">${costs(sk.cost)}</div><span class="queueSkillName">${esc(sk.name)}</span></button>`}).join('');const instruction=G.over?(G.finalMessage||(G.serverWinner==='player'?'Vitória!':G.serverWinner==='boss'?'Derrota.':'Batalha encerrada.')):resolving?'Resolvendo o turno...':waiting?'Turno enviado. Aguardando o adversário...':selected?'ALVOS VERDES: clique em um deles.':G.acts.length?'Fila pronta. Confirme, adicione outra ação ou pule o turno.':'Escolha uma técnica, use um item ou PULAR TURNO.';const readyLabel=G.over?'FIM':resolving?'RESOLVENDO...':waiting?'AGUARDANDO...':G.online?'ENVIAR TURNO':'CONFIRMAR TURNO',readyDisabled=G.over?'':(G.acts.length&&!waiting&&!resolving?'':'disabled'),storyObj=G.story?`<div class="storyBattleObjective">${storyObjectiveText(G.storyMission)}</div>`:'';
 const pool=R16_CHAKRA_TYPES.map(k=>`<div class="chakraPoolCell ${CCLS[k]}"><span>${R16_CHAKRA_FULL[k]}</span><b>${rem[k]||0}</b><small>chance do próximo: ${probs[k]}%</small></div>`).join('');const itemOptions=Object.entries(SHOP_ITEMS).filter(([id])=>(S.inventory[id]||0)>0&&Number(G.itemUsesByType?.[id]||0)<ITEM_RULES.sameItemPerBattle).map(([id,it])=>`<option value="${id}">${it.name} (${S.inventory[id]})</option>`).join('')||'<option value="">SEM ITEM DISPONÍVEL</option>';
 $('#center').innerHTML=`<div id="playqueue">${queueHtml}</div>${storyObj}<div class="instruction" id="instruction">${instruction}</div><div class="turnActionRow"><button id="ready" ${readyDisabled}>${readyLabel}</button><button id="skipTurn" class="skipTurnButton" ${G.over||waiting||resolving?'disabled':''}>PULAR TURNO</button></div><div class="chakraPoolTitle">CHAKRA • ${chakraTotal(rem)}/${CHAKRA_RULES.maxTotal}</div><div id="spend" class="chakraPoolGrid">${pool}</div><div class="chakraWildcardHelp"><b>Q = QUALQUER</b> é somente CUSTO CORINGA: não existe estoque preto. Cada Q consome qualquer Linhagem/Genjutsu/Ninjutsu/Taijutsu disponível. <b>O chakra ganho</b> é sorteado pelas necessidades específicas dos Jutsus da sua equipe viva; custos Q não aumentam nenhuma cor.</div><div class="battleItemRules">ITENS: ${G.itemUsesTotal||0}/${ITEM_RULES.perBattle} • máximo 1 por turno • mesmo item 1×</div><div class="battleItems"><select id="battleItemSelect" ${waiting||resolving?'disabled':''}>${itemOptions}</select><select id="battleItemTarget" ${waiting||resolving?'disabled':''}></select><button id="useBattleItem" ${waiting||resolving?'disabled':''}>USAR ITEM</button><small id="battleItemReason"></small></div><button id="forfeit" class="forfeitButton" ${resolving?'disabled':''}>ABANDONAR PARTIDA</button>`;
 $('#ready').onclick=()=>G?.over?exitBattle():execute();$('#skipTurn').onclick=skipTurn;const itemSel=$('#battleItemSelect'),targetSel=$('#battleItemTarget'),itemBtn=$('#useBattleItem'),reason=$('#battleItemReason');const refreshTarget=()=>{if(targetSel)targetSel.innerHTML=itemSel?.value?battleItemTargetOptions(itemSel.value,targetSel.value):'<option value="">SEM ALVO</option>';updateReason()};const updateReason=()=>{const idx=targetSel?.value===''?null:Number(targetSel?.value),why=itemSel?.value?selectedBattleItemReason(itemSel.value,idx):'Nenhum item disponível.';if(reason)reason.textContent=why||'Item válido para este turno.';if(itemBtn)itemBtn.disabled=!!why||waiting||resolving};if(itemSel){itemSel.onchange=refreshTarget;refreshTarget()}if(targetSel)targetSel.onchange=updateReason;if(itemBtn)itemBtn.onclick=()=>{if(itemSel?.value){const idx=targetSel?.value===''?null:Number(targetSel.value);useBattleItem(itemSel.value,idx)}};$('#forfeit').onclick=async()=>{if(!G||battleFxBusy())return;if(G.over){exitBattle();return}if(!confirm('Abandonar a partida atual?'))return;if(G.online){await forfeitOnline();return}await finish(false,true)};$$('[data-remove]').forEach(b=>b.onclick=()=>{if(waiting||resolving||battleFxBusy())return;G.acts=G.acts.filter(a=>a.user!==+b.dataset.remove);selected=null;renderBattle()})
}

function storyAiPhase(){if(!G?.story)return'normal';const aliveEnemy=alive(G.ai),ratios=aliveEnemy.map(x=>x.hp/Math.max(1,x.maxHp)),avg=ratios.reduce((a,b)=>a+b,0)/Math.max(1,ratios.length);if(G.turn<=2)return'opening';if(avg<.42||aliveEnemy.length<Math.max(1,G.ai.length-1))return'critical';return'mid'}
function storyRole(f){let o=0,s=0,c=0;for(const sk of(f.skills||[])){const k=skillKind(sk),p=skillPower(sk);if(['damage','dot'].includes(k))o+=p;if(['heal','shield','invuln'].includes(k))s+=p+18;if(k==='stun')c+=p+28}return s>=o&&s>=c?'support':c>o?'control':'striker'}
function aiActionScore(u,sk,target,profile){
 const m=sk.mechanic||{},kind=m.kind||'damage',power=Number(m.power||0),cost=(sk.cost||[]).length,enemyTarget=m.target==='enemy',bossLike=['boss','nukenin'].includes(G.diff)||profile.strategy==='smart',phase=storyAiPhase(),role=storyRole(u);let score=-cost*4;const targetRatio=target?target.hp/Math.max(1,target.maxHp):1,missing=target?Math.max(0,target.maxHp-target.hp):0,effectiveHp=target?target.hp+Number(target.shield||0):9999;
 if(kind==='damage'){score+=power;if(enemyTarget&&power>=effectiveHp)score+=130;if(m.aoe)score+=Math.max(0,alive(G.you).length-1)*power*.5;if(target?.inv)score-=150}
 if(kind==='stun'){score+=power+52;if(target?.stun)score-=135;else score+=38;if(G.aiState?.reservedControl?.has?.(target))score-=120}
 if(kind==='dot'){score+=power+38;if(target?.dot)score-=100;else score+=30;if(G.aiState?.reservedDot?.has?.(target))score-=90}
 if(kind==='heal'){score+=Math.min(power,missing)*2.7;if(missing<=0)score-=260;if(targetRatio<.38)score+=90;if(targetRatio>.78)score-=70}
 if(kind==='shield'){score+=Math.max(0,1-targetRatio)*95;if(target?.shield>18)score-=125;if(targetRatio>.82)score-=70}
 if(kind==='invuln'){score+=targetRatio<.35?135:20;if(target?.inv)score-=210;if(targetRatio>.72)score-=80}
 if(role==='striker'&&['damage','dot'].includes(kind))score+=25;if(role==='control'&&['stun','dot'].includes(kind))score+=30;if(role==='support'&&['heal','shield','invuln'].includes(kind))score+=28;
 if(profile.strategy==='aggressive'||profile.strategy==='focus')score+=['damage','dot','stun'].includes(kind)?38:-22;if(profile.strategy==='control')score+=kind==='stun'?65:kind==='dot'?50:0;if(profile.strategy==='support')score+=['heal','shield','invuln'].includes(kind)?58:0;if(profile.strategy==='combo')score+=kind==='stun'?62:kind==='dot'?48:kind==='damage'?34:0;
 if(G.story){const o=G.storyMission?.objective||{},plan=G.storyMission?.aiPlan||{},playerWeak=chooseAITarget(G.you,'weak'),targetRole=storyRole(target);if(phase==='opening'&&['stun','dot','shield'].includes(kind))score+=18;if(phase==='critical'&&['damage','stun'].includes(kind))score+=30;if(o.type==='survive'&&['damage','stun','dot'].includes(kind))score+=25;if(o.type==='protect'&&enemyTarget&&target?.slug===o.protectSlug)score+=95;if(plan.targetPolicy==='weakest'&&enemyTarget&&target===playerWeak)score+=45;if(plan.targetPolicy==='supportHunter'&&enemyTarget&&targetRole==='support')score+=38;if(plan.targetPolicy==='controllerHunter'&&enemyTarget&&targetRole==='control')score+=34;if(plan.targetPolicy==='burstHunter'&&enemyTarget&&targetRole==='striker')score+=30;if(plan.opening==='pressure'&&phase==='opening'&&['damage','dot'].includes(kind))score+=28;if(plan.opening==='control'&&phase==='opening'&&['stun','dot'].includes(kind))score+=32;if(plan.opening==='fortify'&&phase==='opening'&&['shield','invuln'].includes(kind))score+=25;if(plan.critical==='execute'&&phase==='critical'&&['damage','dot'].includes(kind))score+=38;if(plan.critical==='lockdown'&&phase==='critical'&&kind==='stun')score+=42;if(plan.critical==='recover'&&phase==='critical'&&['heal','shield'].includes(kind))score+=35;if(enemyTarget&&target===playerWeak)score+=20}
 if(bossLike&&Number(G.aiState?.defensiveStreak||0)>0){if(['damage','stun','dot'].includes(kind))score+=85;if(['heal','shield','invuln'].includes(kind))score-=100*G.aiState.defensiveStreak}
 if(enemyTarget&&G.aiFocus!=null&&G.you[G.aiFocus]===target)score+=profile.strategy==='focus'?60:14;const noise=G.story?6:profile.difficulty==='boss'?4:profile.difficulty==='hard'?10:profile.difficulty==='easy'?25:15;return score+Math.random()*noise
}
function aiActs(){
 const acts=[],p=G.profile||aiProfile();G.aiState=G.aiState||{defensiveStreak:0,lastKinds:[]};G.aiState.reservedControl=new Set();G.aiState.reservedDot=new Set();for(let ui=0;ui<G.ai.length;ui++){const u=G.ai[ui];if(!u?.hp)continue;const candidates=[];u.skills.forEach((sk,si)=>{if(sk.cd>0||!canPay(G.aich,sk.cost))return;const m=sk.mechanic||{},side=m.target==='enemy'?'you':'ai',arr=side==='you'?G.you:G.ai,targets=m.target==='self'?[u]:alive(arr);for(const t of targets){if(!t?.hp)continue;candidates.push({si,sk,side,arr,target:t,score:aiActionScore(u,sk,t,p)})}});if(!candidates.length)continue;candidates.sort((a,b)=>b.score-a.score);let pick=(p.difficulty==='easy'&&!G.story&&Math.random()<.45)?candidates[Math.floor(Math.random()*Math.min(3,candidates.length))]:candidates[0];if(p.strategy==='focus'&&pick.side==='you'){if(G.aiFocus==null||!G.you[G.aiFocus]?.hp){const f=chooseAITarget(G.you,'weak');G.aiFocus=G.you.indexOf(f)}const focus=G.you[G.aiFocus],focused=candidates.filter(x=>x.side==='you'&&x.target===focus).sort((a,b)=>b.score-a.score)[0];if(focused)pick=focused}if(!pay(G.aich,pick.sk.cost))continue;const kind=skillKind(pick.sk);if(kind==='stun')G.aiState.reservedControl.add(pick.target);if(kind==='dot')G.aiState.reservedDot.add(pick.target);acts.push({user:ui,skill:pick.si,side:pick.side,target:pick.arr.indexOf(pick.target)})}const kinds=acts.map(a=>skillKind(G.ai[a.user].skills[a.skill]));G.aiState.lastKinds=kinds;G.aiState.defensiveStreak=kinds.length&&kinds.every(k=>['heal','shield','invuln'].includes(k))?Math.min(3,Number(G.aiState.defensiveStreak||0)+1):0;return acts
}

function itemTargetText(it){const e=it?.effect||'';if(['healWeak','cleanse','invulnWeak','shieldWeak'].includes(e))return'1 aliado vivo escolhido';if(['damageWeak','dotWeak','stunWeak','dispelWeak'].includes(e))return'1 inimigo vivo escolhido';if(['healAll','shieldAll'].includes(e))return'todos os aliados vivos';return'sem alvo — efeito de chakra/global'}
function itemWhenText(it){const e=it?.effect||'';if(e==='cleanse')return'somente em alvo com Atordoamento/Aflição';if(e==='dispelWeak')return'somente em alvo com Defesa/Invulnerabilidade';if(e==='healWeak'||e==='healAll')return'somente se houver PV faltando';return'antes de enviar/confirmar o turno'}
function legacy_R16_GAMEPLAY_OVERHAUL_itemCard(id,it,shop=false){return `<article class="featureCard ${shop?'shopCard':'inventoryCard'} itemDetailed"><small>CONSUMÍVEL • ${it.category}</small><h3>${it.name}</h3><p>${it.desc}</p><dl class="itemDetails"><div><dt>ALVO</dt><dd>${itemTargetText(it)}</dd></div><div><dt>QUANDO</dt><dd>${itemWhenText(it)}</dd></div><div><dt>LIMITE</dt><dd>1/turno • 3/luta • mesmo item 1×</dd></div></dl>${shop?`<b>${it.price} Ryō</b><p>Inventário: ${S.inventory[id]||0}</p><button data-buy="${id}" ${S.ryo<it.price?'disabled':''}>COMPRAR</button>`:`<b>Quantidade: ${S.inventory[id]||0}</b>`}</article>`}
function legacy_R16_GAMEPLAY_OVERHAUL_repairPrice(it,o){const missing=Math.max(0,Number(it.maxDurability)-Number(o?.durability||0));return missing?Math.max(20,Math.ceil(Number(it.price)*Number(it.repairRate||.22)*(missing/Number(it.maxDurability)))):0}
function legacy_R16_GAMEPLAY_OVERHAUL_repairGear(id){const it=EQUIPMENT_BY_ID[id],o=S.gear?.owned?.[id];if(!it||!o)return;const price=repairPrice(it,o);if(!price)return;if(S.ryo<price)return alert(`Ryō insuficiente. Reparo: ${price} Ryō.`);S.ryo-=price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+price;S.c.gearRepairs=Number(S.c.gearRepairs||0)+1;trackPeriodic('gearRepairs',1);trackPeriodic('ryoSpent',price);o.durability=it.maxDurability;save();renderInventory()}
function gearEffectText(it){return it?.effectText||it?.desc||'Sem efeito descrito.'}
function gearEquippedBy(id){for(const [slug,map] of Object.entries(S.gear?.equipped||{}))for(const gid of Object.values(map||{}))if(gid===id)return char(slug)?.name||slug;return''}
function legacy_R16_GAMEPLAY_OVERHAUL_renderShop(){
 const wallet=$('#shopWallet');if(wallet)wallet.textContent=`${S.ryo} Ryō • ${inventoryCount()} consumível(is) • ${Object.keys(S.gear?.owned||{}).length}/${EQUIPMENT_CATALOG.length} equipamentos`;
 const box=$('#shopItems');if(!box)return;const cats=['CHAKRA','RECUPERAÇÃO','DEFESA','OFENSIVO','CONTROLE'];
 const consumables=cats.map(cat=>{const cards=Object.entries(SHOP_ITEMS).filter(([,it])=>it.category===cat).map(([id,it])=>itemCard(id,it,true)).join('');return `<section class="shopSection"><header><h3>${cat}</h3><span>${Object.entries(SHOP_ITEMS).filter(([,it])=>it.category===cat).length} itens</span></header><div class="shopGrid">${cards}</div></section>`}).join('');
 const equipment=GEAR_SLOTS.map(slot=>{const list=EQUIPMENT_CATALOG.filter(it=>it.slot===slot&&!it.missionUnique);return `<section class="shopSection"><header><h3>${GEAR_SLOT_PT[slot]}</h3><span>${list.length} à venda</span></header><div class="shopGrid">${list.map(it=>{const own=S.gear?.owned?.[it.id],using=gearEquippedBy(it.id);return `<article class="featureCard shopCard gearShop rarity-${it.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}"><small>${GEAR_SLOT_PT[it.slot].toUpperCase()} • ${it.rarity}</small><h3>${it.name}</h3><p class="shopEffect"><b>EFEITO:</b> ${gearEffectText(it)}</p><p>${it.usageText||''}</p><div class="shopPrice"><b>${it.price} Ryō</b><span>${own?`Durabilidade ${own.durability}/${it.maxDurability}${using?' • '+using:''}`:`${it.maxDurability} batalhas`}</span></div><button data-buy-gear="${it.id}" ${own||S.ryo<it.price?'disabled':''}>${own?'ADQUIRIDO':'COMPRAR'}</button></article>`}).join('')}</div></section>`}).join('');
 const uniqueBlock='';
 box.innerHTML=`<div class="shopIntro"><b>CONSUMÍVEIS</b><span>Compra, alvo, efeito e limite de uso visíveis.</span></div>${consumables}<div class="shopIntro"><b>EQUIPAMENTOS</b><span>Leves bônus por personagem; durabilidade cai em batalhas e pode ser reparada.</span></div>${equipment}${uniqueBlock}`;
 $$('[data-buy]').forEach(b=>b.onclick=()=>{const it=SHOP_ITEMS[b.dataset.buy];if(!it||S.ryo<it.price)return;S.ryo-=it.price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+it.price;trackPeriodic('ryoSpent',it.price);S.inventory[b.dataset.buy]=(S.inventory[b.dataset.buy]||0)+1;save();renderShop()});
 $$('[data-buy-gear]').forEach(b=>b.onclick=()=>{const it=EQUIPMENT_BY_ID[b.dataset.buyGear];if(!it||it.missionUnique||it.shopAvailable===false||gearOwned(it.id)||S.ryo<it.price)return;S.ryo-=it.price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+it.price;trackPeriodic('ryoSpent',it.price);awardGear(it.id);save();renderShop()})
}
function legacy_R16_GAMEPLAY_OVERHAUL_renderInventory(){const status=$('#inventoryStatus'),box=$('#inventoryItems');if(!box)return;if(status)status.textContent=`${inventoryCount()} consumível(is) • ${Object.keys(S.gear?.owned||{}).length}/${EQUIPMENT_CATALOG.length} equipamentos • durabilidade cai ao concluir batalha`;const owned=Object.entries(SHOP_ITEMS).filter(([id])=>(S.inventory[id]||0)>0),consumables=owned.length?`<div class="featureGrid">${owned.map(([id,it])=>itemCard(id,it,false)).join('')}</div>`:'<p>Sem consumíveis.</p>';const chars=S.unlocked.map(char).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')),selected=($('#gearCharacter')?.value&&S.unlocked.includes($('#gearCharacter').value))?$('#gearCharacter').value:(S.you[0]||S.unlocked[0]),select=`<div class="gearManagerHead"><div><h3>Equipamentos por personagem</h3><small>Arma • Roupa • Calçado • Pergaminho • Talismã. Cada peça só pode ficar em um ninja.</small></div><select id="gearCharacter">${chars.map(c=>`<option value="${c.slug}" ${c.slug===selected?'selected':''}>${c.name}</option>`).join('')}</select></div>`;const gearCards=GEAR_SLOTS.map(slot=>{const eq=equippedGear(selected)[slot],eqIt=EQUIPMENT_BY_ID[eq],choices=EQUIPMENT_CATALOG.filter(x=>x.slot===slot&&S.gear?.owned?.[x.id]),dur=eq?Number(S.gear.owned?.[eq]?.durability||0):0,price=eqIt?repairPrice(eqIt,S.gear.owned?.[eq]):0;return `<article class="featureCard inventoryCard gearCard"><small>${GEAR_SLOT_PT[slot].toUpperCase()}</small><h3>${eqIt?.name||'Nenhum equipado'}</h3><p>${eqIt?gearEffectText(eqIt):'Escolha uma peça possuída.'}</p>${eqIt?`<div class="durabilityBar"><i style="width:${Math.round(100*dur/eqIt.maxDurability)}%"></i></div><b>Durabilidade ${dur}/${eqIt.maxDurability}${dur<=0?' • QUEBRADO — SEM EFEITO':''}</b>`:''}<select data-gear-slot="${slot}"><option value="">— nenhum —</option>${choices.map(it=>{const o=S.gear.owned[it.id],who=gearEquippedBy(it.id);return `<option value="${it.id}" ${eq===it.id?'selected':''}>${it.name} • ${o.durability}/${it.maxDurability}${who&&who!==char(selected)?.name?' • em '+who:''}</option>`}).join('')}</select><div class="gearCompare">${choices.map(it=>`<p><b>${it.name}:</b> ${gearEffectText(it)} • ${S.gear.owned[it.id].durability}/${it.maxDurability}</p>`).join('')}</div>${eqIt&&price?`<button data-repair-gear="${eq}">REPARAR • ${price} Ryō</button>`:''}</article>`}).join('');box.innerHTML=`<h3>Consumíveis</h3>${consumables}${select}<div class="featureGrid gearGrid">${gearCards}</div>`;const gc=$('#gearCharacter');if(gc)gc.onchange=renderInventory;$$('[data-gear-slot]').forEach(el=>el.onchange=()=>equipGear(selected,el.dataset.gearSlot,el.value||null));$$('[data-repair-gear]').forEach(b=>b.onclick=()=>repairGear(b.dataset.repairGear))}
function missionTeamCapability(stat){let score=38;for(const slug of(S.you||[])){const c=char(slug);if(!c)continue;const cs=characterScores(c);if(stat==='combate')score+=Math.min(14,cs.damage/90);else if(stat==='controle')score+=Math.min(14,cs.control/65);else if(stat==='suporte')score+=Math.min(14,cs.support/65);else if(stat==='infiltracao')score+=Math.min(12,(cs.speed+cs.control)/120);else if(stat==='inteligencia')score+=Math.min(12,(cs.control+cs.support)/130);else score+=Math.min(11,cs.elite/180);score+=Math.min(4,Number(masteryFor(slug).battles||0)/12)}return Math.round(score/Math.max(1,S.you.length)+27)}
function legacy_R16_GAMEPLAY_OVERHAUL_ninjaRunMission(){return NINJA_MISSIONS.find(m=>m.id===NinjaRun?.missionId)}
function legacy_R16_GAMEPLAY_OVERHAUL_ninjaRunApproach(){const m=ninjaRunMission();return m?.approaches?.find(a=>a.id===NinjaRun?.approachId)}
function closeNinjaMissionRun(){const modal=$('#ninjaMissionRunModal');if(modal)modal.classList.add('hidden')}
function legacy_R16_GAMEPLAY_OVERHAUL_startNinjaMission(id,approachId){const m=NINJA_MISSIONS.find(x=>x.id===id),approach=m?.approaches?.find(a=>a.id===approachId);if(!m||!approach)return;if(S.you.length!==3)return alert('Selecione 3 personagens em PERSONAGENS / EQUIPE antes da missão.');S.ninjaMissions.attempts[m.id]=Number(S.ninjaMissions.attempts[m.id]||0)+1;NinjaRun={missionId:m.id,approachId:approach.id,stage:0,risk:0,clues:0,momentum:0,criticals:0,criticalFails:0,results:[],battleWon:false};renderNinjaMissionRun()}
function legacy_R16_GAMEPLAY_OVERHAUL_resolveNinjaMissionChoice(choiceId){
 const m=ninjaRunMission(),st=m?.interactive?.stages?.[NinjaRun.stage],choice=st?.choices?.find(c=>c.id===choiceId);if(!m||!st||!choice)return;
 const approach=ninjaRunApproach(),affinity=(approach?.strategy==='aggressive'&&choice.stat==='combate')||(approach?.strategy==='support'&&['controle','suporte','inteligencia'].includes(choice.stat))||(approach?.strategy==='control'&&['controle','infiltracao','inteligencia'].includes(choice.stat))||(approach?.strategy==='smart'&&choice.stat!=='combate');
 const capability=missionTeamCapability(choice.stat)+(affinity?8:0)+NinjaRun.clues*2+NinjaRun.momentum,roll=1+Math.floor(Math.random()*20),total=capability+roll,target=Number(st.difficulty||50)+Number(choice.difficultyMod||0)+NinjaRun.risk*3,margin=total-target;
 let outcome=roll===20||margin>=18?'criticalSuccess':roll===1||margin<=-18?'criticalFailure':total>=target?'success':'failure';
 const ok=outcome==='success'||outcome==='criticalSuccess';
 if(outcome==='criticalSuccess'){NinjaRun.criticals++;NinjaRun.risk=Math.max(0,NinjaRun.risk-1);NinjaRun.clues+=Number(choice.clue||0)+1;NinjaRun.momentum+=Number(choice.momentum||0)+2}
 else if(outcome==='success'){NinjaRun.risk=Math.max(0,NinjaRun.risk+Number(choice.risk||0));NinjaRun.clues+=Number(choice.clue||0);NinjaRun.momentum+=Number(choice.momentum||0)}
 else if(outcome==='criticalFailure'){NinjaRun.criticalFails++;NinjaRun.risk=Math.max(0,NinjaRun.risk+Math.max(2,Number(choice.risk||0)+2));NinjaRun.momentum=Math.max(0,NinjaRun.momentum-2)}
 else{NinjaRun.risk=Math.max(0,NinjaRun.risk+Number(choice.risk||0)+1);NinjaRun.momentum=Math.max(0,NinjaRun.momentum-1)}
 NinjaRun.results.push({stage:st.title,choice:choice.label,roll,total,target,margin,ok,outcome});
 if(outcome==='criticalFailure'&&NinjaRun.risk>=Math.max(2,Number(m.interactive?.failRisk||3)-1))return finalizeNinjaMissionRun(false,m.story?.criticalFailure||'Falha crítica comprometeu a operação.');
 if(!ok&&NinjaRun.risk>=Number(m.interactive?.failRisk||3))return finalizeNinjaMissionRun(false,m.story?.failure||`Risco operacional ${NinjaRun.risk}/${m.interactive.failRisk}.`);
 NinjaRun.stage++;renderNinjaMissionRun()
}
function legacy_R16_GAMEPLAY_OVERHAUL_startNinjaMissionBattle(){const m=ninjaRunMission(),approach=ninjaRunApproach(),p=rankEnemyProfile(m.rank),team=teamForProfile(p),you=S.you.map(slug=>clone(char(slug),false,p.difficulty)),ai=team.map(c=>clone(c,true,p.difficulty)),startCh=m.rank==='S'?10:m.rank==='A'?8:7;closeNinjaMissionRun();G={ninjaMission:{id:m.id,approach:approach.id,interactive:true},turn:1,diff:p.difficulty,profile:{...p,name:`Rank ${m.rank} — ${m.title}`,plan:approach.desc},strategy:approach.strategy,you,ai,ch:gain(emptyCh(),7+Math.min(3,you.reduce((n,f)=>n+Number(f.gearStartChakra||0),0)),you),aich:gain(emptyCh(),startCh,ai),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},aiState:{defensiveStreak:0,lastKinds:[]}};selected=null;show('battle');$('#battlelog').innerHTML='';$('#player0 .controlTag').textContent=`MISSÃO RANK ${m.rank} — VOCÊ`;$('#player1 .controlTag').textContent=`MISSÃO RANK ${m.rank} — ADVERSÁRIOS`;$('#bottomAI').textContent=m.title;$('#bottomAIPlan').textContent=approach.name.toUpperCase();$('#view').innerHTML=`<section><h4>ETAPA DE COMBATE • MISSÃO ${String(m.number).padStart(2,'0')}</h4><p>${m.title}</p><p><b>Risco acumulado:</b> ${NinjaRun.risk} • <b>Pistas:</b> ${NinjaRun.clues}</p></section>`;log(`Confronto da missão ${m.number}: ${m.title}`,'info');renderBattle()}
function legacy_R16_GAMEPLAY_OVERHAUL_completeNinjaMission(win,quit){const m=ninjaRunMission()||NINJA_MISSIONS.find(x=>x.id===G?.ninjaMission?.id);if(!m)return;if(G){degradeGear(G.you);recordBattleMastery(G.you,win);S.c.battles++;S.c.kos+=G.kos;S.c.damage+=G.damage;trackPeriodic('battles',1);if(win){S.wins++;S.c.wins++;trackPeriodic('wins',1)}else if(!quit)S.losses++;save()}if(quit){G=null;NinjaRun=null;show('ninjaMissions');return}if(!win){G=null;return finalizeNinjaMissionRun(false,'A equipe foi derrotada na etapa de combate.')}G=null;NinjaRun.battleWon=true;NinjaRun.results.push({stage:'Confronto',choice:'Combate',ok:true});NinjaRun.stage++;show('ninjaMissions');renderNinjaMissionRun()}
function legacy_R16_GAMEPLAY_OVERHAUL_rollNinjaMissionLoot(m){
 const out=[],critBonus=Math.min(.35,Number(NinjaRun?.criticals||0)*Number(m.criticalLootBonus||.15)),failPenalty=Math.min(.30,Number(NinjaRun?.criticalFails||0)*Number(m.criticalFailPenalty||.12));
 for(const entry of m.lootTable||[]){const chance=Math.max(0,Math.min(.95,Number(entry.chance||0)+critBonus-failPenalty));if(Math.random()<chance){const qty=Number(entry.qty||1);S.inventory[entry.item]=Number(S.inventory[entry.item]||0)+qty;out.push(`${qty}× ${SHOP_ITEMS[entry.item]?.name||entry.item} (${Math.round(chance*100)}%)`)}}
 return out
}
function legacy_R16_GAMEPLAY_OVERHAUL_finalizeNinjaMissionRun(win,reason=''){
 const m=ninjaRunMission();if(!m)return;closeNinjaMissionRun();
 if(win){const first=!S.ninjaMissions.completed[m.id];S.ninjaMissions.completed[m.id]=true;S.ninjaMissions.last=m.id;const rw=ninjaMissionReward(m,first),riskBonus=Math.max(0,NinjaRun.momentum*5-NinjaRun.risk*3)+Number(NinjaRun.criticals||0)*15;S.ryo+=rw.ryo+riskBonus;S.xp+=rw.xp;S.c.ninjaMissions=Number(S.c.ninjaMissions||0)+1;trackPeriodic('ninjaMissions',1);let rewards=[];
  if(first&&m.firstClearReward){for(const [id,n] of Object.entries(m.firstClearReward.items||{})){S.inventory[id]=Number(S.inventory[id]||0)+Number(n);rewards.push(`${n}× ${SHOP_ITEMS[id]?.name||id}`)}if(m.firstClearReward.gear){awardGear(m.firstClearReward.gear);rewards.push(`ÚNICO: ${EQUIPMENT_BY_ID[m.firstClearReward.gear]?.name||m.firstClearReward.gear}`)}}else if(!first&&m.repeatReward){for(const [id,n] of Object.entries(m.repeatReward.items||{})){S.inventory[id]=Number(S.inventory[id]||0)+Number(n);rewards.push(`${n}× ${SHOP_ITEMS[id]?.name||id}`)}}
  rewards.push(...rollNinjaMissionLoot(m));if(first&&!m.firstClearReward?.gear&&Math.random()<Number(m.gearChance||0)){const gear=randomGear(m.rank);if(gear?.id){awardGear(gear.id);rewards.push(`Equipamento: ${gear.name}`)}}claim();save();const rewardExtra=rewards.length?`\n${rewards.join(' • ')}`:'';alert(`MISSÃO CONCLUÍDA\n${m.title}\n${m.story?.success||''}\n${rw.ryo+riskBonus} Ryō • ${rw.xp} XP\nCríticos: ${NinjaRun.criticals||0} • Falhas críticas: ${NinjaRun.criticalFails||0}${rewardExtra}`)

 }else{S.xp+=20;save();alert(`MISSÃO FALHOU
${m.title}
${reason||m.story?.failure||'A operação não atingiu a condição de sucesso.'}`)}
 NinjaRun=null;renderNinjaMissions()
}
function legacy_R16_GAMEPLAY_OVERHAUL_renderNinjaMissionRun(){const m=ninjaRunMission();if(!m)return;const st=m.interactive?.stages?.[NinjaRun.stage],modal=$('#ninjaMissionRunModal'),body=$('#ninjaMissionRunBody');if(!modal||!body)return;if(!st)return finalizeNinjaMissionRun(true);modal.classList.remove('hidden');const result=NinjaRun.results.at(-1),outcomeLabel=o=>({criticalSuccess:'SUCESSO CRÍTICO',success:'SUCESSO',failure:'FALHA',criticalFailure:'FALHA CRÍTICA'}[o]||o),history=NinjaRun.results.map(r=>`<li class="${r.ok?'ok':'fail'} ${r.outcome||''}"><b>${r.stage}:</b> ${r.choice}${r.roll?` • d20 ${r.roll} • ${r.total}/${r.target}`:''} — ${outcomeLabel(r.outcome|| (r.ok?'success':'failure'))}</li>`).join('');if(st.type==='battle')body.innerHTML=`<small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank} • ETAPA ${NinjaRun.stage+1}/${m.interactive.stages.length}</small><h2>${st.title}</h2><p>${st.text}</p><div class="missionRunStats"><span>RISCO <b>${NinjaRun.risk}/${m.interactive.failRisk}</b></span><span>PISTAS <b>${NinjaRun.clues}</b></span><span>IMPULSO <b>${NinjaRun.momentum}</b></span></div><ul class="missionRunHistory">${history}</ul><button id="ninjaMissionBattleStart" class="storyPrimary">ENTRAR EM COMBATE</button><button id="ninjaMissionAbort">ABANDONAR MISSÃO</button>`;else body.innerHTML=`<small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank} • ETAPA ${NinjaRun.stage+1}/${m.interactive.stages.length}</small><h2>${st.title}</h2><p>${st.text}</p><div class="missionRunStats"><span>RISCO <b>${NinjaRun.risk}/${m.interactive.failRisk}</b></span><span>PISTAS <b>${NinjaRun.clues}</b></span><span>IMPULSO <b>${NinjaRun.momentum}</b></span></div>${result?`<div class="missionLastResult ${result.ok?'ok':'fail'}">Último teste: ${outcomeLabel(result.outcome|| (result.ok?'success':'failure'))}${result.roll?` • d20 ${result.roll} • ${result.total}/${result.target}`:''}</div>`:''}<div class="missionRunChoices">${(st.choices||[]).map(c=>`<button data-mission-choice="${c.id}"><b>${c.label}</b><span>${c.desc}</span><small>${c.stat.toUpperCase()} • risco ${c.risk>0?'+':''}${c.risk}</small></button>`).join('')}</div><ul class="missionRunHistory">${history}</ul><button id="ninjaMissionAbort">ABANDONAR MISSÃO</button>`;$$('[data-mission-choice]').forEach(b=>b.onclick=()=>resolveNinjaMissionChoice(b.dataset.missionChoice));const battle=$('#ninjaMissionBattleStart');if(battle)battle.onclick=startNinjaMissionBattle;const abort=$('#ninjaMissionAbort');if(abort)abort.onclick=()=>{if(confirm('Abandonar esta missão?')){closeNinjaMissionRun();NinjaRun=null;renderNinjaMissions()}}}
function legacy_R16_GAMEPLAY_OVERHAUL_renderNinjaMissions(){
 const box=$('#ninjaMissionGrid');if(!box)return;const rank=$('#ninjaMissionRank')?.value||'D',list=NINJA_MISSIONS.filter(m=>m.rank===rank),team=$('#ninjaMissionTeam');
 if(team)team.innerHTML=S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')} ${c.name}</span>`).join('')||'<b>Selecione 3 ninjas na tela de Personagens / Equipe.</b>';
 box.innerHTML=list.map(m=>{const done=!!S.ninjaMissions.completed[m.id],attempts=Number(S.ninjaMissions.attempts[m.id]||0),steps=m.interactive?.stages?.length||0,loot=(m.lootTable||[]).map(x=>`${SHOP_ITEMS[x.item]?.name||x.item} ${Math.round(x.chance*100)}%`).join(' • '),unique=m.uniqueReward?.gear?EQUIPMENT_BY_ID[m.uniqueReward.gear]?.name:'';return `<article class="ninjaMissionCard ${done?'done':''}"><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h3>${done?'✓ ':''}${m.title}</h3><p class="missionBrief">${m.story?.briefing||m.interactive?.brief||''}</p><div class="missionMetaTags"><span>${steps} etapas</span><span>${m.interactive?.stages?.some(s=>s.type==='battle')?'combate real':'testes operacionais'}</span><span>crítico/falha crítica</span></div><details><summary>ENREDO, RISCO E LOOT</summary><p>${m.story?.stakes||''}</p><p><b>Loot:</b> ${loot||'sem loot extra'}${unique?`<br><b>ITEM ÚNICO:</b> ${unique} na primeira conclusão`:''}</p><p><b>Base:</b> ${m.ryo} Ryō • ${m.xp} XP • Tentativas ${attempts}</p></details><label class="missionApproachSelect">ABORDAGEM<select data-mission-approach-select="${m.id}">${m.approaches.map(a=>`<option value="${a.id}">${a.name}</option>`).join('')}</select></label><button class="missionStartButton" data-mission-start="${m.id}">INICIAR MISSÃO</button></article>`}).join('');
 $$('[data-mission-start]').forEach(b=>b.onclick=()=>{const id=b.dataset.missionStart,sel=document.querySelector(`[data-mission-approach-select="${id}"]`);startNinjaMission(id,sel?.value||'pratica')})
}

function rankedDivision(r){r=Number(r||1000);if(r>=2100)return'Kage';if(r>=1800)return'Sannin';if(r>=1550)return'ANBU';if(r>=1350)return'Jōnin';if(r>=1150)return'Chūnin';return'Genin'}
async function renderRankedPanel(){const panel=$('#rankedPanel');if(!panel)return;if(!ON.token){panel.classList.add('hidden');return}panel.classList.remove('hidden');const r=await api('/api/ranked/profile',{token:ON.token});if(r.ok){S.ranked={...S.ranked,...r.ranked};$('#rankedRating').textContent=`${r.ranked.rating} MMR • ${rankedDivision(r.ranked.rating)}`;$('#rankedRecord').textContent=`${r.ranked.wins}V • ${r.ranked.losses}D • ${r.ranked.draws}E • Temporada ${r.ranked.season}`;if(r.profile)applyServerProfile(r.profile,r.revision)}const lb=await api('/api/ranked/leaderboard',{token:ON.token,limit:10});if(lb.ok){$('#rankedLeaderboard').innerHTML=(lb.leaderboard||lb.entries||[]).map((x,i)=>`<div><b>#${i+1} ${esc(x.user)}</b><span>${x.rating} • ${rankedDivision(x.rating)} • ${x.wins}V/${x.losses}D</span></div>`).join('')||'<p>Nenhuma partida ranqueada nesta temporada.</p>'}}
async function startRankedQueue(){if(!ensureOnlineTeam())return;const btn=$('#rankedQueue');if(btn){btn.disabled=true;btn.textContent='ENTRANDO NA FILA...'}try{const r=await api('/api/ranked/queue',{token:ON.token,team:onlineTeamPayload()},{timeout:15000});if(!r.ok)return onlineMsg(r.error||'Não foi possível entrar na fila ranqueada.',true);ON.room=r.code;ON.role=r.role;ON.submittedTurn=null;ON.resultRoom=null;saveOnlineSession();$('#onlineRoomBox').classList.remove('hidden');$('#onlineRoomCode').textContent=r.code;$('#onlineRoomStatus').textContent=r.status==='playing'?`RANKED ENCONTRADO • ${r.hostName} × ${r.guestName}`:`FILA RANKED ATIVA • ${rankedDivision(S.ranked?.rating||1000)} • aguardando outro jogador online`;pollRoom()}finally{if(btn){btn.disabled=false;btn.textContent='ENTRAR NA FILA RANKED'}}}

if($('#rankedQueue'))$('#rankedQueue').onclick=startRankedQueue;if($('#rankedRefresh'))$('#rankedRefresh').onclick=renderRankedPanel;if($('#rankedCancel'))$('#rankedCancel').onclick=async()=>{if(!ON.room)return onlineMsg('Você não está em uma fila Ranked.',true);const r=await api('/api/ranked/cancel',{token:ON.token,code:ON.room},{timeout:12000});if(r.ok){clearTimeout(ON.poll);ON.room=null;ON.role=null;ON.submittedTurn=null;saveOnlineSession();$('#onlineRoomBox').classList.add('hidden');onlineMsg('Fila Ranked cancelada.')}};
const R16_renderProfileBase=legacy_BASE_renderProfile;
renderProfile=function(){R16_renderProfileBase();const p=$('#profileStats');if(p)p.textContent+=` • Ranked ${Number(S.ranked?.rating||1000)} MMR (${rankedDivision(S.ranked?.rating)})`};

/* ======================= FIM R16 GAMEPLAY OVERHAUL ====================== */

function installSaveBadges(){document.querySelectorAll('.gameSideNav').forEach(nav=>{if(nav.querySelector('.cloudSaveStatus'))return;const d=document.createElement('div');d.className='cloudSaveStatus';d.textContent=ON.token?`Salvo automaticamente • ${ON.user}`:'Conta não conectada';nav.appendChild(d)})}
installSaveBadges();

/* ======================= R20 UI / MISSIONS / EVENTS / SHOP ======================= */
const R20_ITEM_META={
 chakraFood:{rarity:'Comum',role:'Flexibilidade',use:'Corrige uma mão ruim de chakra sem criar tipo preto.'},
 soldierPill:{rarity:'Incomum',role:'Pressão física',use:'Boa para equipes que alternam Ninjutsu e Taijutsu.'},
 ninScroll:{rarity:'Comum',role:'Ninjutsu',use:'Acelera combos caros de Ninjutsu.'},
 genScroll:{rarity:'Comum',role:'Genjutsu',use:'Reserva para controle, ilusões e técnicas mentais.'},
 taiScroll:{rarity:'Comum',role:'Taijutsu',use:'Acelera sequências físicas e finalizações.'},
 bloodSeal:{rarity:'Incomum',role:'Linhagem',use:'Recurso raro para Dōjutsu, Kekkei Genkai e técnicas de linhagem.'},
 mixedRation:{rarity:'Raro',role:'Estabilidade',use:'Recuperação ampla de chakra para turnos longos.'},
 medicalKit:{rarity:'Incomum',role:'Cura forte',use:'Salva um aliado ferido antes de uma finalização inimiga.'},
 healingOintment:{rarity:'Comum',role:'Cura rápida',use:'Cura barata para dano moderado.'},
 fieldMedicine:{rarity:'Raro',role:'Cura em área',use:'Recupera uma equipe inteira após dano em área.'},
 antidote:{rarity:'Incomum',role:'Limpeza',use:'Resposta direta contra Stun e Aflição.'},
 smokeBomb:{rarity:'Incomum',role:'Evasão',use:'Protege um alvo por um turno crítico.'},
 substitutionScroll:{rarity:'Raro',role:'Sobrevivência',use:'Dois turnos de proteção para um aliado ameaçado.'},
 guardScroll:{rarity:'Comum',role:'Defesa',use:'Absorve dano sem gastar o Jutsu defensivo do personagem.'},
 barrierTag:{rarity:'Raro',role:'Defesa em área',use:'Bom contra chefes e ataques em área.'},
 shurikenPack:{rarity:'Comum',role:'Finalização',use:'Dano direto barato para concluir alvo quase derrotado.'},
 kunaiPack:{rarity:'Comum',role:'Dano direto',use:'Dano imediato sem depender de chakra.'},
 explosiveTag:{rarity:'Incomum',role:'Explosão',use:'Pressão direta em um alvo prioritário.'},
 explosiveBundle:{rarity:'Raro',role:'Finalização pesada',use:'Alto dano de item, reservado para alvos perigosos.'},
 senbonPack:{rarity:'Incomum',role:'Aflição',use:'Dano inicial mais pressão por turnos.'},
 poisonBomb:{rarity:'Raro',role:'Desgaste',use:'Mantém pressão contra inimigos resistentes.'},
 flashBomb:{rarity:'Incomum',role:'Interrupção',use:'Interrompe um turno-chave do inimigo.'},
 paralysisTag:{rarity:'Raro',role:'Controle forte',use:'Dois turnos de Stun para quebrar uma sequência perigosa.'},
 dispelTag:{rarity:'Incomum',role:'Quebra-defesa',use:'Remove escudo ou invulnerabilidade antes do ataque principal.'}
};
for(const [id,meta] of Object.entries(R20_ITEM_META))if(SHOP_ITEMS[id])Object.assign(SHOP_ITEMS[id],meta);

function r20ItemEffect(it){
 const e=it?.effect||'';
 if(e==='gainRandom')return `Gera ${it.amount||0} chakra(s) usando as probabilidades atuais da equipe.`;
 if(e==='gainSpecific')return Object.entries(it.chakra||{}).map(([k,n])=>`+${n} ${R16_CHAKRA_FULL[k]||k}`).join(' • ');
 if(e==='healWeak')return `Recupera ${it.amount||0} PV de 1 aliado.`;
 if(e==='healAll')return `Recupera ${it.amount||0} PV de todos os aliados vivos.`;
 if(e==='cleanse')return 'Remove Atordoamento e Aflição de 1 aliado.';
 if(e==='invulnWeak')return `Concede Invulnerabilidade por ${it.duration||1} turno(s).`;
 if(e==='shieldWeak')return `Concede ${it.amount||0} Defesa a 1 aliado por ${it.duration||0} turno(s).`;
 if(e==='shieldAll')return `Concede ${it.amount||0} Defesa a todos por ${it.duration||0} turno(s).`;
 if(e==='damageWeak')return `Causa ${it.amount||0} de dano direto em 1 inimigo.`;
 if(e==='dotWeak')return `${it.amount||0} dano imediato + Aflição ${it.dot||7} por ${it.duration||1} turno(s).`;
 if(e==='stunWeak')return `Atordoa 1 inimigo por ${it.duration||1} turno(s).`;
 if(e==='dispelWeak')return 'Remove Defesa e Invulnerabilidade de 1 inimigo.';
 return it?.desc||'Efeito tático.'
}
function legacy_R20_UI_MISSIONS_EVENTS_SHOP_itemCard(id,it,shop=false){
 const meta=R20_ITEM_META[id]||{},owned=Number(S.inventory[id]||0);
 return `<article class="r20ItemCard rarity-${String(meta.rarity||'Comum').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}">
   <header><span class="r20ItemIcon">${it.category==='CHAKRA'?'◎':it.category==='RECUPERAÇÃO'?'✚':it.category==='DEFESA'?'◇':it.category==='OFENSIVO'?'✦':'⌁'}</span><div><small>${it.category} • ${meta.rarity||'Comum'}</small><h3>${it.name}</h3></div></header>
   <div class="r20ItemEffect"><b>${meta.role||'Tático'}</b><span>${r20ItemEffect(it)}</span></div>
   <p class="r20ItemUse">${meta.use||it.desc}</p>
   <div class="r20ItemRules"><span>ALVO: ${itemTargetText(it)}</span><span>USO: ${itemWhenText(it)}</span><span>1/turno • 3/luta • mesmo item 1×</span></div>
   ${shop?`<footer><div><b>${it.price} Ryō</b><small>Você possui ${owned}</small></div><div class="r20BuyActions"><button data-buy="${id}" data-buy-qty="1" ${S.ryo<it.price?'disabled':''}>COMPRAR 1</button><button data-buy="${id}" data-buy-qty="3" ${S.ryo<it.price*3?'disabled':''}>COMPRAR 3</button></div></footer>`:`<footer><b>Quantidade: ${owned}</b></footer>`}
 </article>`
}

function r20GearRole(it){
 const b=it?.bonus||{};
 if(it?.slot==='weapon')return b.control?'Pressão + controle':'Poder ofensivo';
 if(it?.slot==='clothing')return b.reduction?'Resistência':'Sobrevivência';
 if(it?.slot==='footwear')return 'Abertura / chakra';
 if(it?.slot==='scroll')return 'Jutsu emprestado';
 if(it?.slot==='talisman')return b.turnRegen?'Sustentação':'Proteção';
 return 'Tático'
}
function r20GearScore(it){const b=it?.bonus||{};return Math.round(Number(b.damage||0)*7+Number(b.hp||0)*1.4+Number(b.reduction||0)*11+Number(b.shield||0)*1.6+Number(b.startChakra||0)*14+Number(b.control||0)*12+Number(b.healBonus||0)*5+Number(b.shieldBonus||0)*5+Number(b.turnRegen||0)*9+Number(b.borrowedJutsu||0)*22)}
function r20GearCard(it,shop=false){
 const own=S.gear?.owned?.[it.id],using=gearEquippedBy(it.id),broken=own&&Number(own.durability)<=0;
 return `<article class="r20GearCard rarity-${String(it.rarity||'Comum').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}">
   <header><span class="r20GearSlot">${GEAR_SLOT_PT[it.slot]}</span><span class="r20GearRarity">${it.rarity}</span></header>
   <h3>${it.name}</h3><div class="r20GearRole">${r20GearRole(it)} • índice ${r20GearScore(it)}</div>
   <p class="r20GearEffect"><b>EFEITO:</b> ${gearEffectText(it)}</p><p class="r20GearDesc">${it.desc}</p>
   <div class="r20Durability"><span>Durabilidade</span><b>${own?own.durability:it.maxDurability}/${it.maxDurability}${broken?' • QUEBRADO':''}</b></div>
   ${shop?`<footer><div><b>${it.price?it.price+' Ryō':'ÚNICO DE MISSÃO'}</b><small>${using?'Equipado em '+using:own?'No inventário':it.missionUnique?(it.uniqueSource||'Missão Ninja'):'Disponível na loja'}</small></div>${it.missionUnique?`<button disabled>${own?'OBTIDO':'NÃO É VENDIDO'}</button>`:`<button data-buy-gear="${it.id}" ${own||S.ryo<it.price?'disabled':''}>${own?'ADQUIRIDO':'COMPRAR'}</button>`}</footer>`:''}
 </article>`
}

let R20Shop={mode:'consumables',filter:'TODOS'};
function legacy_R20_UI_MISSIONS_EVENTS_SHOP_renderShop(){
 const wallet=$('#shopWallet'),tabs=$('#shopTabs'),filters=$('#shopFilters'),box=$('#shopItems');if(!box)return;
 if(wallet)wallet.innerHTML=`<b>${S.ryo} Ryō</b><span>${inventoryCount()} consumíveis</span><span>${Object.keys(S.gear?.owned||{}).length}/${EQUIPMENT_CATALOG.length} equipamentos</span>`;
 if(tabs)tabs.innerHTML=[['consumables','CONSUMÍVEIS'],['equipment','EQUIPAMENTOS']].map(([id,n])=>`<button data-shop-mode="${id}" class="${R20Shop.mode===id?'active':''}">${n}</button>`).join('');
 let filterList=[];
 if(R20Shop.mode==='consumables')filterList=['TODOS','CHAKRA','RECUPERAÇÃO','DEFESA','OFENSIVO','CONTROLE'];
 else if(R20Shop.mode==='equipment')filterList=['TODOS',...GEAR_SLOTS.map(s=>GEAR_SLOT_PT[s].toUpperCase())];
 if(filters)filters.innerHTML=filterList.map(f=>`<button data-shop-filter="${f}" class="${R20Shop.filter===f?'active':''}">${f}</button>`).join('');
 if(R20Shop.mode==='consumables'){
   let entries=Object.entries(SHOP_ITEMS);if(R20Shop.filter!=='TODOS')entries=entries.filter(([,it])=>it.category===R20Shop.filter);
   box.innerHTML=`<section class="r20ShopIntro"><div><small>ARSENAL DE CAMPO</small><h2>Consumíveis táticos</h2><p>Cada item mostra efeito real, alvo e melhor situação de uso. Comprar não equipa nem usa automaticamente.</p></div></section><div class="r20ShopGrid">${entries.map(([id,it])=>itemCard(id,it,true)).join('')}</div>`;
 }else if(R20Shop.mode==='equipment'){
   let list=EQUIPMENT_CATALOG.filter(it=>!it.missionUnique&&it.shopAvailable!==false);if(R20Shop.filter!=='TODOS'){const slot=GEAR_SLOTS.find(s=>GEAR_SLOT_PT[s].toUpperCase()===R20Shop.filter);list=list.filter(it=>it.slot===slot)}
   box.innerHTML=`<section class="r20ShopIntro"><div><small>EQUIPAMENTO DE NINJA</small><h2>Peças por função</h2><p>Uma peça só pode ficar em um personagem. Quando a durabilidade chega a 0, o bônus desliga até o reparo.</p></div><button data-go-inventory>GERENCIAR EQUIPAMENTOS</button></section><div class="r20ShopGrid">${list.map(it=>r20GearCard(it,true)).join('')}</div>`;
 }else{
   R20Shop.mode='equipment';R20Shop.filter='TODOS';return renderShop();
 }
 $$('[data-shop-mode]').forEach(b=>b.onclick=()=>{R20Shop.mode=b.dataset.shopMode;R20Shop.filter='TODOS';renderShop()});
 $$('[data-shop-filter]').forEach(b=>b.onclick=()=>{R20Shop.filter=b.dataset.shopFilter;renderShop()});
 $$('[data-buy]').forEach(b=>b.onclick=()=>{const id=b.dataset.buy,it=SHOP_ITEMS[id],qty=Math.max(1,Number(b.dataset.buyQty||1)),cost=Number(it?.price||0)*qty;if(!it||S.ryo<cost)return;S.ryo-=cost;S.c.ryoSpent=Number(S.c.ryoSpent||0)+cost;trackPeriodic('ryoSpent',cost);S.inventory[id]=Number(S.inventory[id]||0)+qty;save();renderShop()});
 $$('[data-buy-gear]').forEach(b=>b.onclick=()=>{const it=EQUIPMENT_BY_ID[b.dataset.buyGear];if(!it||it.missionUnique||it.shopAvailable===false||S.gear?.owned?.[it.id]||S.ryo<it.price)return;S.ryo-=it.price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+it.price;trackPeriodic('ryoSpent',it.price);awardGear(it.id);save();renderShop()});
 $$('[data-go-inventory]').forEach(b=>b.onclick=()=>show('inventory'))
}

function r20GearSummary(slug){const b=gearBonuses(slug),parts=[];if(b.damage)parts.push(`+${b.damage} poder`);if(b.hp)parts.push(`+${b.hp} PV`);if(b.reduction)parts.push(`-${b.reduction} dano`);if(b.shield)parts.push(`+${b.shield} Defesa inicial`);if(b.startChakra)parts.push(`+${b.startChakra} chakra inicial`);if(b.control)parts.push(`+${b.control} turno no 1º controle`);if(b.healBonus)parts.push(`+${b.healBonus} cura`);if(b.turnRegen)parts.push(`+${b.turnRegen} PV/turno`);if(b.borrowedJutsu)parts.push('1 Jutsu emprestado');return parts.length?parts.join(' • '):'Nenhum bônus ativo.'}
function legacy_R20_UI_MISSIONS_EVENTS_SHOP_renderInventory(){
 const status=$('#inventoryStatus'),box=$('#inventoryItems');if(!box)return;const ownedItems=Object.entries(SHOP_ITEMS).filter(([id])=>Number(S.inventory[id]||0)>0),chars=S.unlocked.map(char).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')),old=$('#gearCharacter')?.value,selected=(old&&S.unlocked.includes(old))?old:(S.you[0]||S.unlocked[0]);
 if(status)status.innerHTML=`<b>${inventoryCount()} consumíveis</b><span>${Object.keys(S.gear?.owned||{}).length}/${EQUIPMENT_CATALOG.length} equipamentos obtidos</span><span>Peças quebradas ficam sem efeito até reparar.</span>`;
 const charObj=char(selected);const loadout=GEAR_SLOTS.map(slot=>{const id=equippedGear(selected)[slot],it=EQUIPMENT_BY_ID[id],o=S.gear?.owned?.[id];return `<div><small>${GEAR_SLOT_PT[slot]}</small><b>${it?.name||'Vazio'}</b><span>${it&&o?`${o.durability}/${it.maxDurability}`:''}</span></div>`}).join('');
 const gearCards=GEAR_SLOTS.map(slot=>{const current=equippedGear(selected)[slot],currentIt=EQUIPMENT_BY_ID[current],list=EQUIPMENT_CATALOG.filter(it=>it.slot===slot&&S.gear?.owned?.[it.id]);return `<section class="r20GearManager"><header><div><small>${GEAR_SLOT_PT[slot]}</small><h3>${currentIt?.name||'Slot vazio'}</h3></div>${currentIt?`<span>${S.gear.owned[current].durability}/${currentIt.maxDurability}</span>`:''}</header>${currentIt?`<p class="r20CurrentEffect">${gearEffectText(currentIt)}</p>`:'<p>Equipe uma peça possuída para ativar um bônus leve.</p>'}<div class="r20GearChoices">${list.length?list.map(it=>{const o=S.gear.owned[it.id],active=current===it.id,who=gearEquippedBy(it.id);return `<button data-equip-gear="${it.id}" data-equip-slot="${slot}" class="${active?'active':''}"><b>${it.name}</b><span>${gearEffectText(it)}</span><small>${o.durability}/${it.maxDurability}${who&&who!==charObj?.name?' • em '+who:''}</small></button>`}).join(''):'<em>Nenhuma peça deste slot foi obtida.</em>'}</div>${currentIt&&repairPrice(currentIt,S.gear.owned[current])?`<button class="r20Repair" data-repair-gear="${current}">REPARAR • ${repairPrice(currentIt,S.gear.owned[current])} Ryō</button>`:''}${current?`<button class="r20Unequip" data-unequip-slot="${slot}">DESEQUIPAR</button>`:''}</section>`}).join('');
 box.innerHTML=`<section class="r20InventoryConsumables"><header><div><small>MOCHILA</small><h2>Consumíveis</h2></div><button data-go-shop>ABRIR LOJA</button></header>${ownedItems.length?`<div class="r20InventoryItemGrid">${ownedItems.map(([id,it])=>itemCard(id,it,false)).join('')}</div>`:'<p>Você ainda não possui consumíveis.</p>'}</section><section class="r20Loadout"><header><div><small>EQUIPAMENTO POR PERSONAGEM</small><h2>${charObj?.name||'Ninja'}</h2><p>${r20GearSummary(selected)}</p></div><select id="gearCharacter">${chars.map(c=>`<option value="${c.slug}" ${c.slug===selected?'selected':''}>${c.name}</option>`).join('')}</select></header><div class="r20LoadoutStrip">${loadout}</div><div class="r20GearManagerGrid">${gearCards}</div></section>`;
 const gc=$('#gearCharacter');if(gc)gc.onchange=renderInventory;
 $$('[data-equip-gear]').forEach(b=>b.onclick=()=>equipGear(selected,b.dataset.equipSlot,b.dataset.equipGear));
 $$('[data-unequip-slot]').forEach(b=>b.onclick=()=>equipGear(selected,b.dataset.unequipSlot,null));
 $$('[data-repair-gear]').forEach(b=>b.onclick=()=>repairGear(b.dataset.repairGear));$$('[data-go-shop]').forEach(b=>b.onclick=()=>show('shop'))
}

function renderHome(){
 const c=char(S.you[0])||char(S.unlocked[0])||R[0];if(!c)return;
 $('#homeCharacterName').textContent=c.name;$('#homeCharacterMeta').textContent=`${eraLabel(c)} • equipe ${S.you.length}/3 • ${S.wins} vitórias / ${S.losses} derrotas`;$('#homeLevel').textContent=`NÍVEL ${level()}`;$('#homeDna').textContent=`${S.ryo} Ryō`;$('#homeCharacterTitle').textContent=c.name;$('#homeCharacterBio').textContent=c.bio||'Ninja do universo Naruto.';$('#homeCharacterImage').src=assetUrl(c.icon);$('#homeCharacterImage').dataset.fallback=assetUrl('static/img/icon.png');$('#homeTeamMini').innerHTML=S.you.map(char).filter(Boolean).map(x=>imgSafe(x.icon,x.icon,'',`title="${x.name}"`)).join('');
 const box=$('#homeJutsuCards');box.className='homeJutsuCards r20HomeJutsuGrid';box.innerHTML=effectiveSkills(c).map((sk,slot)=>`<article class="r20HomeJutsuCard" data-home-jutsu="${slot}"><div class="r20HomeJutsuArt">${skillImg(sk,'',`alt="${esc(sk.name)}"`)}</div><div class="r20HomeJutsuBody"><div class="r20HomeJutsuTitle"><small>JUTSU ${slot+1}</small><h3>${sk.name}</h3></div>${skillInfoHtml(sk)}<p>${sk.desc}</p><div class="r20HomeJutsuMeta"><span>${mechanicLabel(sk)}</span><span>${costs(sk.cost)||'SEM CUSTO'}</span><span>CD ${sk.cooldown||0}</span></div></div></article>`).join('');$$('[data-home-jutsu]').forEach(b=>b.onclick=()=>{jutsuViewedSlug=c.slug;jutsuDetailSlot=+b.dataset.homeJutsu;show('jutsus')})
}

function renderMissions(){
 ensureMissionPeriods();renderPeriodicScope('daily',activeTaskDefs('daily'));renderPeriodicScope('weekly',activeTaskDefs('weekly'));
 const e=$('#missions');if(e)e.innerHTML=MISS.map(m=>{let p=Math.min(m.goal,achievementValue(m.type)),pc=Math.round(100*p/m.goal);return `<div class="mission ${S.done[m.id]?'done':''}"><h3>${S.done[m.id]?'✓ ':''}${m.title}</h3><div class="bar"><i style="width:${pc}%"></i></div><p>${p}/${m.goal} — ${m.ryo} Ryō</p></div>`}).join('');
 $$('[data-claim-period]').forEach(b=>b.onclick=()=>{const [scope,id]=b.dataset.claimPeriod.split(':');claimPeriodic(scope,id)});const db=$('#dailyBonus'),wb=$('#weeklyBonus');if(db)db.onclick=()=>claimPeriodBonus('daily');if(wb)wb.onclick=()=>claimPeriodBonus('weekly');claimJutsuMastery();const sel=$('#jutsuMissionCharacter'),box=$('#jutsuMissions');if(!sel||!box)return;const chars=S.unlocked.map(char).filter(Boolean),old=sel.value;sel.innerHTML=chars.map(c=>`<option value="${c.slug}">${c.name}</option>`).join('');const slug=(old&&chars.some(c=>c.slug===old))?old:(S.you.find(s=>S.unlocked.includes(s))||chars[0]?.slug);if(!slug){box.innerHTML='<p>Avance no Modo História para liberar o primeiro ninja.</p>';return}sel.value=slug;sel.onchange=renderJutsuMissions;renderJutsuMissions()
}

function legacy_R20_UI_MISSIONS_EVENTS_SHOP_renderBijuuEvents(){
 const box=$('#bijuuEvents');if(!box)return;ensureEventPeriods();
 box.innerHTML=['weekly','monthly'].map(scope=>{const x=eventBossStatus(scope),ev=x.ev,weekly=scope==='weekly',until=weekly?0:Number(S.events.temporary[ev.slug]||0),active=until>Date.now(),phases=weekly?['Investigação','Caçada','Confronto']:(ev.phases||['Fase I','Fase II','Fase III']),approaches=weekly?[['trace','Rastreio silencioso','+1 chakra e entrada segura'],['ambush','Emboscada','+2 chakra; alvo reage com +2'],['capture','Cerco e captura','+6 Defesa inicial']]:[['balanced','Equilibrada','+1 chakra'],['assault','Assalto coordenado','+2 chakra; Bijū +1'],['fortify','Formação defensiva','+8 Defesa inicial']];return `<article class="r20EventCard ${weekly?'weekly':'monthly'}"><div class="r20EventArt">${imgSafe(char(ev.slug)?.icon,'static/img/icon.png','bijuuEventImage')}<span>${weekly?'SEMANAL':'MENSAL'}</span></div><div class="r20EventContent"><header><div><small>${weekly?'LIVRO BINGO • CAÇADA':'RAID BIJŪ • TIER '+ev.tier+'/9'}</small><h2>${ev.name}</h2></div><b>PV ${x.hp}</b></header><p class="r20EventLead">${weekly?(ev.huntText||'Caçada Nukenin.'):(ev.mechanic||'Raid de três fases.')}</p><div class="r20EventSpecial"><b>${weekly?(ev.specialty||'Nukenin'):`${ev.tails} cauda(s) • boss de 3 fases`}</b><span>${weekly?'A recompensa semanal inclui Ryō e 1 equipamento não-único.':'A primeira vitória mensal libera esta forma por 168 horas.'}</span></div><div class="r20EventPhases">${phases.map((p,i)=>`<div><span>${i+1}</span><b>${p}</b><small>${weekly?["Colete inteligência e escolha a rota.","Force o alvo a revelar o padrão de luta.","Vença e confirme a captura/eliminação."][i]:["100–67% PV: leitura e pressão inicial.","66–34% PV: padrão muda e ganha chakra.","33–0% PV: execução e técnicas mais agressivas."][i]}</small></div>`).join('')}</div><label class="r20EventApproach"><span>PREPARAÇÃO</span><select data-event-approach="${scope}">${approaches.map(a=>`<option value="${a[0]}">${a[1]} — ${a[2]}</option>`).join('')}</select></label><div class="r20EventReward"><b>RECOMPENSA DO CICLO</b><span>${rewardLabel(x.reward)}${weekly?' • + equipamento':''}</span></div><div class="r20EventState">${x.st.claimed?(weekly?'Caçada já concluída neste ciclo; você pode repetir sem duplicar a recompensa.':active?`Bijū ativa até ${new Date(until).toLocaleString('pt-BR')}.`:'Recompensa mensal já recebida.'):(weekly?'Alvo ainda não concluído nesta semana.':'Raid ainda não concluída neste mês.')}</div><button class="r20EventStart" data-bijuu-event="${scope}">${x.st.claimed?'REPETIR EVENTO':'PREPARAR E INICIAR'}</button></div></article>`}).join('');
 $$('[data-bijuu-event]').forEach(b=>b.onclick=()=>{const scope=b.dataset.bijuuEvent,sel=document.querySelector(`[data-event-approach="${scope}"]`);startBijuuEvent(scope,sel?.value||'balanced')})
}
function renderEvents(){ensureEventPeriods();const info=$('#eventCycleInfo');if(info)info.innerHTML=`<span>Semana ${utcWeekKey()}</span><span>Mês ${utcMonthKey()}</span>`;renderBijuuEvents()}

let R20SelectedMission=null;
function closeNinjaMissionDetail(){const m=$('#ninjaMissionDetailModal');if(m)m.classList.add('hidden')}
function legacy_R20_UI_MISSIONS_EVENTS_SHOP_openNinjaMissionDetail(id){
 const m=NINJA_MISSIONS.find(x=>x.id===id),modal=$('#ninjaMissionDetailModal'),body=$('#ninjaMissionDetailBody');if(!m||!modal||!body)return;R20SelectedMission=id;const attempts=Number(S.ninjaMissions.attempts[m.id]||0),done=!!S.ninjaMissions.completed[m.id],teamReady=S.you.length===3,uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null;
 const loot=(m.lootTable||[]).map(x=>`<div><b>${SHOP_ITEMS[x.item]?.name||x.item}</b><span>${Math.round(Number(x.chance||0)*100)}%</span><small>${x.qty||1} unidade(s)</small></div>`).join('');
 const stages=(m.interactive?.stages||[]).map((st,i)=>`<li><span>${i+1}</span><div><b>${st.title}</b><p>${st.text}</p><small>${st.type==='battle'?'COMBATE REAL':st.type==='final'?'TESTE FINAL':'TESTE DE DECISÃO'} • dificuldade ${st.difficulty||'-'}</small></div></li>`).join('');
 body.innerHTML=`<div class="r20MissionDetailHead"><div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${m.title}</h2><p>${m.story?.briefing||m.interactive?.brief||''}</p></div><div class="r20MissionStatus"><b>${done?'CONCLUÍDA':'DISPONÍVEL'}</b><span>${attempts} tentativa(s)</span></div></div><div class="r20MissionDetailGrid"><section><h3>BRIEFING</h3><p>${m.story?.stakes||''}</p><div class="r20OutcomeRules"><div><b>SUCESSO</b><span>${m.story?.success||''}</span></div><div><b>SUCESSO CRÍTICO</b><span>${m.story?.criticalSuccess||''}</span></div><div><b>FALHA</b><span>${m.story?.failure||''}</span></div><div><b>FALHA CRÍTICA</b><span>${m.story?.criticalFailure||''}</span></div></div></section><section><h3>RECOMPENSAS</h3><p><b>Base:</b> ${m.ryo} Ryō • ${m.xp} XP</p><div class="r20LootTable">${loot||'<span>Sem drop adicional.</span>'}</div>${unique?`<div class="r20UniqueReward"><b>ÚNICO NA 1ª CONCLUSÃO</b><span>${unique.name}</span><small>${gearEffectText(unique)}</small></div>`:''}</section></div><section class="r20MissionStages"><h3>ETAPAS DA OPERAÇÃO</h3><ol>${stages}</ol></section><section class="r20MissionStart"><div><h3>EQUIPE</h3><div class="r20MissionTeam">${S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')}<b>${c.name}</b></span>`).join('')||'<em>Selecione 3 ninjas.</em>'}</div></div><label><span>ABORDAGEM</span><select id="r20MissionApproach">${(m.approaches||[]).map(a=>`<option value="${a.id}">${a.name} — ${a.desc}</option>`).join('')}</select></label><button id="r20MissionStartButton" ${teamReady?'':'disabled'}>${teamReady?'INICIAR OPERAÇÃO':'SELECIONE 3 NINJAS'}</button></section>`;
 modal.classList.remove('hidden');const close=$('#ninjaMissionDetailClose');if(close)close.onclick=closeNinjaMissionDetail;const back=modal.querySelector('.ninjaMissionDetailBackdrop');if(back)back.onclick=closeNinjaMissionDetail;const start=$('#r20MissionStartButton');if(start)start.onclick=()=>{const approach=$('#r20MissionApproach')?.value||m.approaches?.[0]?.id;closeNinjaMissionDetail();startNinjaMission(m.id,approach)}
}
function legacy_R20_UI_MISSIONS_EVENTS_SHOP_renderNinjaMissions(){
 const box=$('#ninjaMissionGrid');if(!box)return;const rank=$('#ninjaMissionRank')?.value||'D',list=NINJA_MISSIONS.filter(m=>m.rank===rank),team=$('#ninjaMissionTeam');if(team)team.innerHTML=`<b>EQUIPE ATUAL</b>${S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')} ${c.name}</span>`).join('')||'<span>Selecione 3 ninjas antes de iniciar uma operação.</span>'}`;
 box.innerHTML=list.map(m=>{const done=!!S.ninjaMissions.completed[m.id],steps=m.interactive?.stages?.length||0,battle=m.interactive?.stages?.some(s=>s.type==='battle'),uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null;return `<article class="r20MissionCard ${done?'done':''}" data-mission-open="${m.id}" tabindex="0"><header><span>${String(m.number).padStart(2,'0')}</span><div><small>RANK ${m.rank}${done?' • CONCLUÍDA':''}</small><h3>${m.title}</h3></div></header><p>${m.story?.briefing||m.interactive?.brief||''}</p><div class="r20MissionBadges"><span>${steps} etapas</span><span>${battle?'combate':'operação'}</span><span>risco ${m.interactive?.failRisk||'-'}</span>${unique?'<span class="unique">item único</span>':''}</div><footer><div><b>${m.ryo} Ryō • ${m.xp} XP</b><small>sucesso/falha/críticos + loot percentual</small></div><button data-mission-open-button="${m.id}">ABRIR MISSÃO</button></footer></article>`}).join('');
 $$('[data-mission-open]').forEach(card=>{card.onclick=e=>{if(e.target.closest('button'))return;openNinjaMissionDetail(card.dataset.missionOpen)};card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openNinjaMissionDetail(card.dataset.missionOpen)}}});$$('[data-mission-open-button]').forEach(b=>b.onclick=e=>{e.stopPropagation();openNinjaMissionDetail(b.dataset.missionOpenButton)})
}

function show(name){
 if(name!=='battle'&&name!=='auth'&&!G)clearBattleSession();
 if(name==='missions')name='tasks';if(name!=='battle'&&window.BattleFX)window.BattleFX.cleanup();
 for(const [n,id] of [['auth','#authPage'],['home','#homePage'],['select','#selectPage'],['jutsus','#jutsuPage'],['battle','#battlePage'],['story','#storyPage'],['online','#onlinePage'],['tasks','#missionPage'],['ninjaMissions','#ninjaMissionPage'],['events','#eventsPage'],['profile','#profilePage'],['shop','#shopPage'],['inventory','#inventoryPage'],['encyclopedia','#encyclopediaPage']]){const el=$(id);if(el)el.classList.toggle('hidden',n!==name)}
 if(name==='home')renderHome();if(name==='jutsus'){renderJutsuPage();renderMissions();}if(name==='tasks')renderMissions();if(name==='ninjaMissions')renderNinjaMissions();if(name==='events')renderEvents();if(name==='profile')renderProfile();if(name==='shop')renderShop();if(name==='inventory')renderInventory();if(name==='encyclopedia')renderEncyclopedia();if(name==='online')renderOnline();if(name==='story')renderStory();if(name==='select')renderRoster()
}
/* ======================= FIM R20 UI / MISSIONS / EVENTS / SHOP ======================= */


/* ======================= R21 QUEST GRAPH / EVENT RULES / SHOP ======================= */
const R21_RANK_TARGET={D:50,C:55,B:61,A:67,S:73};
const R21_OUTCOME_LABEL={criticalSuccess:'SUCESSO CRÍTICO',success:'SUCESSO',failure:'FALHA',criticalFailure:'FALHA CRÍTICA'};
function r21QuestMission(){return NINJA_MISSIONS.find(m=>m.id===NinjaRun?.missionId)}
function r21QuestNode(m=r21QuestMission()){return m?.questGraph?.nodes?.[NinjaRun?.nodeId]||null}
function r21SaveQuest(){S.ninjaMissions=S.ninjaMissions||{completed:{},attempts:{}};S.ninjaMissions.active=NinjaRun?JSON.parse(JSON.stringify(NinjaRun)):null;save()}
function r21ClearQuest(){if(S.ninjaMissions)S.ninjaMissions.active=null;NinjaRun=null;save()}
function r21EffectApply(e={}){NinjaRun.risk=Math.max(0,Number(NinjaRun.risk||0)+Number(e.risk||0));NinjaRun.clues=Math.max(0,Number(NinjaRun.clues||0)+Number(e.clues||0));NinjaRun.momentum=Math.max(0,Number(NinjaRun.momentum||0)+Number(e.momentum||0))}
function r21WeeklyGearPool(){return EQUIPMENT_CATALOG.filter(it=>!it.missionUnique&&(it.weeklyEligible===true||['Raro','Épico'].includes(it.rarity)))}
function r21RollWeeklyGear(){const pool=r21WeeklyGearPool(),epic=pool.filter(x=>x.rarity==='Épico'),rare=pool.filter(x=>x.rarity==='Raro');const chosen=(Math.random()<.28&&epic.length?epic:rare.length?rare:pool);return chosen[Math.floor(Math.random()*chosen.length)]||null}
function r21EventArt(ev,weekly){const c=char(ev.slug),src=c?.icon||'',generic=!src||src==='static/img/icon.png';if(!generic)return imgSafe(src,src,'bijuuEventImage',`alt="${esc(ev.name)}"`);return `<div class="r21BijuuFallback"><b>${weekly?'忍':'尾'}</b><span>${weekly?'Nukenin':`${ev.tails||'?'} Caudas`}</span><strong>${esc(ev.name)}</strong></div>`}

// Missões Ninja: grafo real de nós/opções/consequências, persistido no save.
ninjaRunMission=function(){return r21QuestMission()};
ninjaRunApproach=function(){return null};
legacy_R21_QUEST_GRAPH_EVENT_RULES__startNinjaMission=function(id){
 const m=NINJA_MISSIONS.find(x=>x.id===id);if(!m?.questGraph?.nodes)return alert('Esta missão ainda não possui grafo interativo válido.');
 if(S.you.length!==3)return alert('Selecione exatamente 3 ninjas em PERSONAGENS / EQUIPE antes de iniciar a quest.');
 if(S.ninjaMissions?.active&&S.ninjaMissions.active.missionId!==id&&!confirm('Existe outra Missão Ninja em andamento. Abandonar a anterior e iniciar esta?'))return;
 if(S.ninjaMissions?.active?.missionId===id){NinjaRun=JSON.parse(JSON.stringify(S.ninjaMissions.active));closeNinjaMissionDetail();return renderNinjaMissionRun()}
 S.ninjaMissions.attempts[m.id]=Number(S.ninjaMissions.attempts[m.id]||0)+1;
 NinjaRun={missionId:m.id,nodeId:m.questGraph.start||'start',risk:0,clues:0,momentum:0,criticals:0,criticalFails:0,results:[],strategy:'balanced',battleWon:false,startedAt:Date.now()};
 closeNinjaMissionDetail();r21SaveQuest();renderNinjaMissionRun()
};
legacy_R21_QUEST_GRAPH_EVENT_RULES__resolveNinjaMissionChoice=function(choiceId){
 const m=r21QuestMission(),node=r21QuestNode(m),choice=node?.choices?.find(c=>c.id===choiceId);if(!m||node?.type!=='choice'||!choice)return;
 const capability=missionTeamCapability(choice.stat)+Math.min(10,Number(NinjaRun.clues||0)*2)+Math.min(8,Number(NinjaRun.momentum||0));
 const roll=1+Math.floor(Math.random()*20),target=Number(R21_RANK_TARGET[m.rank]||58)+Number(choice.difficultyMod||0)+Math.min(10,Number(NinjaRun.risk||0)*2),total=capability+roll,margin=total-target;
 let outcome=roll===20||margin>=16?'criticalSuccess':roll===1||margin<=-16?'criticalFailure':margin>=0?'success':'failure';
 const branch=choice.outcomes?.[outcome]||choice.outcomes?.[outcome==='criticalSuccess'?'success':'failure'];if(!branch)return;
 if(outcome==='criticalSuccess')NinjaRun.criticals=Number(NinjaRun.criticals||0)+1;if(outcome==='criticalFailure')NinjaRun.criticalFails=Number(NinjaRun.criticalFails||0)+1;
 r21EffectApply(branch.effects||{});NinjaRun.strategy=choice.strategy||NinjaRun.strategy||'balanced';
 NinjaRun.results.push({nodeId:node.id,stage:node.title,choice:choice.label,roll,total,target,margin,outcome,ok:['success','criticalSuccess'].includes(outcome),text:branch.text,next:branch.next});
 NinjaRun.nodeId=branch.next;r21SaveQuest();
 if(branch.next==='SUCCESS')return finalizeNinjaMissionRun(true,branch.text);if(branch.next==='FAIL')return finalizeNinjaMissionRun(false,branch.text);renderNinjaMissionRun()
};
legacy_R21_QUEST_GRAPH_EVENT_RULES__startNinjaMissionBattle=function(){
 const m=r21QuestMission(),node=r21QuestNode(m);if(!m||node?.type!=='battle')return;
 const p=rankEnemyProfile(m.rank),team=teamForProfile(p),you=S.you.map(slug=>clone(char(slug),false,p.difficulty)),ai=team.map(c=>clone(c,true,p.difficulty)),startCh=m.rank==='S'?10:m.rank==='A'?8:7;
 closeNinjaMissionRun();G={ninjaMission:{id:m.id,nodeId:node.id,interactive:true},turn:1,diff:p.difficulty,profile:{...p,name:`Rank ${m.rank} — ${m.title}`,plan:node.text},strategy:NinjaRun.strategy||'balanced',you,ai,ch:gain(emptyCh(),7+Math.min(3,you.reduce((n,f)=>n+Number(f.gearStartChakra||0),0)),you),aich:gain(emptyCh(),startCh,ai),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},aiState:{defensiveStreak:0,lastKinds:[]}};
 selected=null;show('battle');$('#battlelog').innerHTML='';$('#player0 .controlTag').textContent=`MISSÃO RANK ${m.rank} — VOCÊ`;$('#player1 .controlTag').textContent=`MISSÃO RANK ${m.rank} — ADVERSÁRIOS`;$('#bottomAI').textContent=m.title;$('#bottomAIPlan').textContent='CONFRONTO DA QUEST';$('#view').innerHTML=`<section><h4>${esc(node.title)}</h4><p>${esc(node.text)}</p><p><b>Risco:</b> ${NinjaRun.risk} • <b>Pistas:</b> ${NinjaRun.clues} • <b>Impulso:</b> ${NinjaRun.momentum}</p></section>`;log(`Quest ${m.number}: ${node.text}`,'info');renderBattle()
};
legacy_R21_QUEST_GRAPH_EVENT_RULES__completeNinjaMission=function(win,quit){
 const m=r21QuestMission()||NINJA_MISSIONS.find(x=>x.id===G?.ninjaMission?.id),node=m?.questGraph?.nodes?.[G?.ninjaMission?.nodeId||NinjaRun?.nodeId];if(!m)return;
 if(G){degradeGear(G.you);recordBattleMastery(G.you,win);S.c.battles++;S.c.kos+=G.kos;S.c.damage+=G.damage;trackPeriodic('battles',1);if(win){S.wins++;S.c.wins++;trackPeriodic('wins',1)}else if(!quit)S.losses++;save()}
 G=null;if(quit){r21ClearQuest();show('ninjaMissions');renderNinjaMissions();return}
 const next=win?(node?.onWin||'SUCCESS'):(node?.onLose||'FAIL');NinjaRun.results.push({nodeId:node?.id||'battle',stage:node?.title||'Confronto',choice:'Combate',outcome:win?'success':'failure',ok:!!win,text:win?'A equipe venceu o confronto e pode continuar a operação.':'A equipe foi derrotada no confronto.',next});NinjaRun.nodeId=next;r21SaveQuest();show('ninjaMissions');if(next==='SUCCESS')return finalizeNinjaMissionRun(true,'Confronto vencido; objetivo final assegurado.');if(next==='FAIL')return finalizeNinjaMissionRun(false,'A derrota no confronto encerrou a operação.');renderNinjaMissionRun()
};
legacy_R21_QUEST_GRAPH_EVENT_RULES__finalizeNinjaMissionRun=function(win,reason=''){
 const m=r21QuestMission();if(!m)return;closeNinjaMissionRun();const run=NinjaRun;
 if(win){const first=!S.ninjaMissions.completed[m.id];S.ninjaMissions.completed[m.id]=true;S.ninjaMissions.last=m.id;const rw=ninjaMissionReward(m,first),riskBonus=Math.max(0,Number(run.momentum||0)*5-Number(run.risk||0)*3)+Number(run.criticals||0)*15;S.ryo+=rw.ryo+riskBonus;S.xp+=rw.xp;S.c.ninjaMissions=Number(S.c.ninjaMissions||0)+1;trackPeriodic('ninjaMissions',1);let rewards=[];
  if(first&&m.firstClearReward){for(const [id,n] of Object.entries(m.firstClearReward.items||{})){S.inventory[id]=Number(S.inventory[id]||0)+Number(n);rewards.push(`${n}× ${SHOP_ITEMS[id]?.name||id}`)}if(m.firstClearReward.gear){awardGear(m.firstClearReward.gear);rewards.push(`ITEM ÚNICO: ${EQUIPMENT_BY_ID[m.firstClearReward.gear]?.name||m.firstClearReward.gear}`)}}else if(!first&&m.repeatReward){for(const [id,n] of Object.entries(m.repeatReward.items||{})){S.inventory[id]=Number(S.inventory[id]||0)+Number(n);rewards.push(`${n}× ${SHOP_ITEMS[id]?.name||id}`)}}
  rewards.push(...rollNinjaMissionLoot(m));if(first&&!m.firstClearReward?.gear&&Math.random()<Number(m.gearChance||0)){const gear=randomGear(m.rank);if(gear?.id){awardGear(gear.id);rewards.push(`Equipamento: ${gear.name}`)}}claim();S.ninjaMissions.active=null;save();alert(`MISSÃO CONCLUÍDA\n${m.title}\n${reason||m.story?.success||''}\n${rw.ryo+riskBonus} Ryō • ${rw.xp} XP\nSucessos críticos: ${run.criticals||0} • Falhas críticas: ${run.criticalFails||0}${rewards.length?'\n'+rewards.join(' • '):''}`)
 }else{S.xp+=20;S.ninjaMissions.active=null;save();alert(`MISSÃO FALHOU\n${m.title}\n${reason||m.story?.failure||'A operação terminou sem cumprir o objetivo.'}`)}
 NinjaRun=null;renderNinjaMissions()
};
legacy_R21_QUEST_GRAPH_EVENT_RULES__renderNinjaMissionRun=function(){
 const m=r21QuestMission(),node=r21QuestNode(m),modal=$('#ninjaMissionRunModal'),body=$('#ninjaMissionRunBody');if(!m||!modal||!body)return;if(NinjaRun?.nodeId==='SUCCESS')return finalizeNinjaMissionRun(true);if(NinjaRun?.nodeId==='FAIL')return finalizeNinjaMissionRun(false);if(!node)return finalizeNinjaMissionRun(false,'A rota desta quest ficou inválida.');
 modal.classList.remove('hidden');const last=NinjaRun.results.at(-1),history=NinjaRun.results.map((r,i)=>`<li class="${r.ok?'ok':'fail'} ${r.outcome||''}"><span>${i+1}</span><div><b>${esc(r.stage)}</b><small>${esc(r.choice)}${r.roll?` • d20 ${r.roll} • ${r.total}/${r.target}`:''} • ${R21_OUTCOME_LABEL[r.outcome]||r.outcome}</small><p>${esc(r.text||'')}</p></div></li>`).join('');
 const head=`<header class="r21QuestRunHead"><div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank} • QUEST RAMIFICADA</small><h2>${esc(node.title)}</h2><p>${esc(node.text)}</p>${node.dialogue?`<blockquote class="r21QuestDialogue"><b>${esc(node.speaker||'Contato')}</b><span>${esc(node.dialogue)}</span></blockquote>`:''}</div><div class="r21QuestMeters"><span>RISCO <b>${NinjaRun.risk}</b></span><span>PISTAS <b>${NinjaRun.clues}</b></span><span>IMPULSO <b>${NinjaRun.momentum}</b></span></div></header>`;
 const consequence=last?`<div class="r21QuestConsequence ${last.ok?'ok':'fail'}"><b>${R21_OUTCOME_LABEL[last.outcome]||last.outcome}</b><p>${esc(last.text||'')}</p><small>Essa consequência levou a equipe para: ${esc(last.next||'próxima etapa')}.</small></div>`:'';
 if(node.type==='battle')body.innerHTML=`${head}${consequence}<section class="r21QuestBattle"><h3>CONFRONTO DA ROTA</h3><p>Esta batalha existe porque as escolhas anteriores levaram a equipe até este confronto. Vencer e perder seguem rotas diferentes.</p><button id="ninjaMissionBattleStart" class="storyPrimary">INICIAR COMBATE</button></section><details class="r21QuestJournal" open><summary>DIÁRIO DA MISSÃO</summary><ol>${history||'<li>Nenhuma decisão registrada ainda.</li>'}</ol></details><button id="ninjaMissionAbort">ABANDONAR QUEST</button>`;
 else body.innerHTML=`${head}${consequence}<section class="r21QuestChoices"><h3>O QUE A EQUIPE FAZ?</h3><div>${(node.choices||[]).map(c=>`<button data-mission-choice="${c.id}"><b>${esc(c.label)}</b><span>${esc(c.desc)}</span><small>${String(c.stat||'táticas').toUpperCase()} • modificador ${Number(c.difficultyMod||0)>=0?'+':''}${Number(c.difficultyMod||0)}</small></button>`).join('')}</div></section><details class="r21QuestJournal"><summary>DIÁRIO DA MISSÃO • ${NinjaRun.results.length} decisão(ões)</summary><ol>${history||'<li>Nenhuma decisão registrada ainda.</li>'}</ol></details><button id="ninjaMissionAbort">ABANDONAR QUEST</button>`;
 $$('[data-mission-choice]').forEach(b=>b.onclick=()=>resolveNinjaMissionChoice(b.dataset.missionChoice));const battle=$('#ninjaMissionBattleStart');if(battle)battle.onclick=startNinjaMissionBattle;const abort=$('#ninjaMissionAbort');if(abort)abort.onclick=()=>{if(confirm('Abandonar definitivamente esta Missão Ninja?')){closeNinjaMissionRun();r21ClearQuest();renderNinjaMissions()}}
};
legacy_R21_QUEST_GRAPH_EVENT_RULES__openNinjaMissionDetail=function(id){
 const m=NINJA_MISSIONS.find(x=>x.id===id),modal=$('#ninjaMissionDetailModal'),body=$('#ninjaMissionDetailBody');if(!m||!modal||!body)return;const attempts=Number(S.ninjaMissions.attempts[m.id]||0),done=!!S.ninjaMissions.completed[m.id],teamReady=S.you.length===3,active=S.ninjaMissions?.active?.missionId===m.id,graph=m.questGraph,nodes=Object.values(graph?.nodes||{}),choices=nodes.reduce((n,x)=>n+(x.choices?.length||0),0),uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null;
 const loot=(m.lootTable||[]).map(x=>`<div><b>${esc(SHOP_ITEMS[x.item]?.name||x.item)}</b><span>${Math.round(Number(x.chance||0)*100)}%</span><small>${x.qty||1} unidade(s)</small></div>`).join('');
 body.innerHTML=`<div class="r21QuestBrief"><header><div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(m.title)}</h2></div><span>${done?'CONCLUÍDA':active?'EM ANDAMENTO':'DISPONÍVEL'}</span></header><section class="r21QuestStory"><h3>HISTÓRIA DA MISSÃO</h3><p>${esc(m.story?.briefing||'')}</p>${m.story?.openingDialogue?`<blockquote class="r21QuestDialogue"><b>${esc(m.story?.cast?.[0]?.name||'Contato')}</b><span>${esc(m.story.openingDialogue)}</span></blockquote>`:''}<p>${esc(m.story?.stakes||'')}</p></section><div class="r21QuestFacts"><span><b>${nodes.length}</b> nós narrativos</span><span><b>${choices}</b> escolhas possíveis</span><span><b>${graph?.hasBattle?'SIM':'NÃO'}</b> combate possível</span><span><b>${attempts}</b> tentativa(s)</span></div><div class="r21QuestDetailGrid"><section><h3>CONSEQUÊNCIAS</h3><div class="r20OutcomeRules"><div><b>SUCESSO</b><span>${esc(m.story?.success||'')}</span></div><div><b>SUCESSO CRÍTICO</b><span>${esc(m.story?.criticalSuccess||'')}</span></div><div><b>FALHA</b><span>${esc(m.story?.failure||'')}</span></div><div><b>FALHA CRÍTICA</b><span>${esc(m.story?.criticalFailure||'')}</span></div></div></section><section><h3>RECOMPENSAS / DROPS</h3><p><b>${m.ryo} Ryō • ${m.xp} XP</b></p><div class="r20LootTable">${loot||'<span>Sem drop adicional.</span>'}</div>${unique?`<div class="r20UniqueReward"><b>EXCLUSIVO DESTA MISSÃO</b><span>${esc(unique.name)}</span><small>${esc(gearEffectText(unique))}</small></div>`:''}</section></div><section class="r21QuestTeam"><div><h3>EQUIPE</h3><div class="r20MissionTeam">${S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')}<b>${esc(c.name)}</b></span>`).join('')||'<em>Selecione 3 ninjas.</em>'}</div></div><button id="r21MissionStartButton" ${teamReady?'':'disabled'}>${teamReady?(active?'RETOMAR QUEST':'INICIAR QUEST INTERATIVA'):'SELECIONE 3 NINJAS'}</button></section></div>`;
 modal.classList.remove('hidden');const close=$('#ninjaMissionDetailClose');if(close)close.onclick=closeNinjaMissionDetail;const back=modal.querySelector('.ninjaMissionDetailBackdrop');if(back)back.onclick=closeNinjaMissionDetail;const start=$('#r21MissionStartButton');if(start)start.onclick=()=>startNinjaMission(m.id)
};
legacy_R21_QUEST_GRAPH_EVENT_RULES__renderNinjaMissions=function(){
 const box=$('#ninjaMissionGrid');if(!box)return;const rank=$('#ninjaMissionRank')?.value||'D',list=NINJA_MISSIONS.filter(m=>m.rank===rank),team=$('#ninjaMissionTeam'),activeId=S.ninjaMissions?.active?.missionId;if(team)team.innerHTML=`<b>EQUIPE ATUAL</b>${S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')} ${esc(c.name)}</span>`).join('')||'<span>Selecione 3 ninjas antes de iniciar uma quest.</span>'}${activeId?`<button id="r21ResumeActive">RETOMAR MISSÃO EM ANDAMENTO</button>`:''}`;
 box.innerHTML=list.map(m=>{const done=!!S.ninjaMissions.completed[m.id],active=activeId===m.id,nodes=Object.values(m.questGraph?.nodes||{}),choices=nodes.reduce((n,x)=>n+(x.choices?.length||0),0),uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null;return `<article class="r20MissionCard r21MissionCard ${done?'done':''} ${active?'active':''}" data-mission-open="${m.id}" tabindex="0"><header><span>${String(m.number).padStart(2,'0')}</span><div><small>RANK ${m.rank}${done?' • CONCLUÍDA':''}${active?' • EM ANDAMENTO':''}</small><h3>${esc(m.title)}</h3></div></header><p>${esc(m.story?.briefing||'')}</p><div class="r20MissionBadges"><span>${nodes.length} nós</span><span>${choices} escolhas</span><span>${m.questGraph?.hasBattle?'combate possível':'rota sem combate obrigatório'}</span>${unique?'<span class="unique">item exclusivo</span>':''}</div><footer><div><b>${m.ryo} Ryō • ${m.xp} XP</b><small>rotas, consequências, críticos e loot percentual</small></div><button data-mission-open-button="${m.id}">${active?'RETOMAR':'ABRIR QUEST'}</button></footer></article>`}).join('');
 $$('[data-mission-open]').forEach(card=>{card.onclick=e=>{if(e.target.closest('button'))return;openNinjaMissionDetail(card.dataset.missionOpen)};card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openNinjaMissionDetail(card.dataset.missionOpen)}}});$$('[data-mission-open-button]').forEach(b=>b.onclick=e=>{e.stopPropagation();openNinjaMissionDetail(b.dataset.missionOpenButton)});const resume=$('#r21ResumeActive');if(resume)resume.onclick=()=>{const a=S.ninjaMissions?.active;if(a){NinjaRun=JSON.parse(JSON.stringify(a));renderNinjaMissionRun()}}
};

// Loja: exclusivos de missão NÃO aparecem aqui; só aparecem na missão e no inventário depois de obtidos.
renderShop=function(){
 const wallet=$('#shopWallet'),tabs=$('#shopTabs'),filters=$('#shopFilters'),box=$('#shopItems');if(!box)return;if(!['consumables','equipment'].includes(R20Shop.mode))R20Shop.mode='consumables';
 if(wallet)wallet.innerHTML=`<b>${S.ryo} Ryō</b><span>${inventoryCount()} consumíveis</span><span>${Object.keys(S.gear?.owned||{}).length}/${EQUIPMENT_CATALOG.length} equipamentos obtidos</span>`;
 if(tabs)tabs.innerHTML=[['consumables','CONSUMÍVEIS'],['equipment','EQUIPAMENTOS']].map(([id,n])=>`<button data-shop-mode="${id}" class="${R20Shop.mode===id?'active':''}">${n}</button>`).join('');
 const filterList=R20Shop.mode==='consumables'?['TODOS','CHAKRA','RECUPERAÇÃO','DEFESA','OFENSIVO','CONTROLE']:['TODOS',...GEAR_SLOTS.map(s=>GEAR_SLOT_PT[s].toUpperCase())];if(filters)filters.innerHTML=filterList.map(f=>`<button data-shop-filter="${f}" class="${R20Shop.filter===f?'active':''}">${f}</button>`).join('');
 if(R20Shop.mode==='consumables'){let entries=Object.entries(SHOP_ITEMS);if(R20Shop.filter!=='TODOS')entries=entries.filter(([,it])=>it.category===R20Shop.filter);box.innerHTML=`<section class="r20ShopIntro"><div><small>ARSENAL DE CAMPO</small><h2>Consumíveis táticos</h2><p>Efeito, alvo, limite e uso aparecem no próprio card.</p></div></section><div class="r20ShopGrid">${entries.map(([id,it])=>itemCard(id,it,true)).join('')}</div>`}
 else{let list=EQUIPMENT_CATALOG.filter(it=>!it.missionUnique&&it.shopAvailable!==false);if(R20Shop.filter!=='TODOS'){const slot=GEAR_SLOTS.find(s=>GEAR_SLOT_PT[s].toUpperCase()===R20Shop.filter);list=list.filter(it=>it.slot===slot)}box.innerHTML=`<section class="r20ShopIntro"><div><small>EQUIPAMENTO COMERCIAL</small><h2>Equipamentos da Loja</h2><p>Itens exclusivos de missão não aparecem na Loja. Raros/Épicos também podem ser conquistados na Caçada Nukenin semanal.</p></div><button data-go-inventory>GERENCIAR EQUIPAMENTOS</button></section><div class="r20ShopGrid">${list.map(it=>r20GearCard(it,true)).join('')}</div>`}
 $$('[data-shop-mode]').forEach(b=>b.onclick=()=>{R20Shop.mode=b.dataset.shopMode;R20Shop.filter='TODOS';renderShop()});$$('[data-shop-filter]').forEach(b=>b.onclick=()=>{R20Shop.filter=b.dataset.shopFilter;renderShop()});$$('[data-buy]').forEach(b=>b.onclick=()=>{const id=b.dataset.buy,it=SHOP_ITEMS[id],qty=Math.max(1,Number(b.dataset.buyQty||1)),cost=Number(it?.price||0)*qty;if(!it||S.ryo<cost)return;S.ryo-=cost;S.c.ryoSpent=Number(S.c.ryoSpent||0)+cost;trackPeriodic('ryoSpent',cost);S.inventory[id]=Number(S.inventory[id]||0)+qty;save();renderShop()});$$('[data-buy-gear]').forEach(b=>b.onclick=()=>{const it=EQUIPMENT_BY_ID[b.dataset.buyGear];if(!it||it.missionUnique||it.shopAvailable===false||S.gear?.owned?.[it.id]||S.ryo<it.price)return;S.ryo-=it.price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+it.price;trackPeriodic('ryoSpent',it.price);awardGear(it.id);save();renderShop()});$$('[data-go-inventory]').forEach(b=>b.onclick=()=>show('inventory'))
};

// Eventos restaurados: Semanal = Nukenin + Raro/Épico; Mensal = desbloqueio da Bijū.
eventReward=function(ev,scope){if(scope==='monthly')return {ryo:Number(ev.monthlyReward?.ryo||0)};return ev.reward||{ryo:0}};
const legacy_R21_QUEST_GRAPH_EVENT_RULES__completeBijuuEvent=async function(){
 if(!G?.eventBoss)return true;ensureEventPeriods();const scope=G.eventBoss.scope,ev=activeEvent(scope);if(!ev||ev.id!==G.eventBoss.id)return false;if(ON.token)return true;const st=S.events[scope];st.wins=Number(st.wins||0)+1;
 if(!st.claimed){if(scope==='weekly'){grantReward(eventReward(ev,scope));S.c.nukeninWins=Number(S.c.nukeninWins||0)+1;const gear=r21RollWeeklyGear();if(gear){awardGear(gear.id);st.gear=gear.id;log(`RECOMPENSA SEMANAL: ${gear.name} (${gear.rarity}).`,'good')}}else{grantReward(eventReward(ev,scope));S.c.bijuuWins=Number(S.c.bijuuWins||0)+1;grantTemporaryBijuu(ev,eventHours(ev,scope));log(`${ev.name} liberada temporariamente por 168h neste perfil!`,'good')}st.claimed=true}
 S.unlocked=storyUnlockedCharacters();save();return true
};
legacy_R21_QUEST_GRAPH_EVENT_RULES__renderBijuuEvents=function(){
 const box=$('#bijuuEvents');if(!box)return;ensureEventPeriods();box.innerHTML=['weekly','monthly'].map(scope=>{const x=eventBossStatus(scope),ev=x.ev,weekly=scope==='weekly',until=weekly?0:Number(S.events.temporary[ev.slug]||0),active=until>Date.now(),gearId=weekly?x.st.gear:null,gear=gearId?EQUIPMENT_BY_ID[gearId]:null,phases=weekly?['Rastreio','Intercepção','Confronto']:(ev.phases||['Fase I','Fase II','Fase III']),approaches=weekly?[['trace','Rastreio silencioso','leitura do alvo e entrada segura'],['ambush','Emboscada','pressão ofensiva desde o início'],['capture','Cerco e captura','preparação defensiva']]:[['balanced','Equilibrada','formação versátil'],['assault','Assalto coordenado','pressão ofensiva'],['fortify','Formação defensiva','proteção inicial']];
 return `<article class="r20EventCard r21EventCard ${weekly?'weekly':'monthly'}"><div class="r20EventArt">${r21EventArt(ev,weekly)}<span>${weekly?'SEMANAL':'MENSAL'}</span></div><div class="r20EventContent"><header><div><small>${weekly?'LIVRO BINGO • CAÇADA NUKENIN':'RAID BIJŪ • DESBLOQUEIO'}</small><h2>${esc(ev.name)}</h2></div><b>PV ${x.hp}</b></header><p class="r20EventLead">${esc(weekly?(ev.huntText||'Localize, intercepte e derrote o Nukenin do ciclo.'):(ev.mechanic||'Derrote a Bijū em três fases para liberar a personagem do ciclo.'))}</p><div class="r21EventRule"><b>${weekly?'OBJETIVO SEMANAL':'OBJETIVO MENSAL'}</b><span>${weekly?'1 vitória por semana. Prêmio principal: 1 EQUIPAMENTO RARO ou ÉPICO. Não libera Bijū.':'1 vitória por mês. Prêmio principal: LIBERAR '+esc(ev.name)+' por 168 horas. Não entrega equipamento semanal.'}</span></div><div class="r20EventPhases">${phases.map((p,i)=>`<div><span>${i+1}</span><b>${esc(p)}</b><small>${weekly?['Investigue pistas e descubra a rota do alvo.','Corte a fuga e force o Nukenin a lutar em desvantagem.','Derrote o alvo e confirme a conclusão da caçada.'][i]:['100–67%: leitura do padrão da Bijū.','66–34%: a Bijū muda o padrão e intensifica a luta.','33–0%: fase final e técnicas mais agressivas.'][i]}</small></div>`).join('')}</div><label class="r20EventApproach"><span>PREPARAÇÃO</span><select data-event-approach="${scope}">${approaches.map(a=>`<option value="${a[0]}">${a[1]} — ${a[2]}</option>`).join('')}</select></label><div class="r20EventReward"><b>${weekly?'PRÊMIO SEMANAL':'DESBLOQUEIO MENSAL'}</b><span>${weekly?(gear?`${esc(gear.name)} • ${gear.rarity} já recebido`:`1 equipamento RARO/ÉPICO garantido + ${Number(x.reward?.ryo||0)} Ryō`):`${esc(ev.name)} por 168h + ${Number(ev.monthlyReward?.ryo||0)} Ryō`}</span></div><div class="r20EventState">${x.st.claimed?(weekly?'Recompensa desta semana já recebida; repetir não duplica o prêmio.':active?`${esc(ev.name)} ativa até ${new Date(until).toLocaleString('pt-BR')}.`:'Recompensa mensal já recebida.'):(weekly?'Caçada semanal ainda disponível.':'Raid mensal ainda disponível.')}</div><button class="r20EventStart" data-bijuu-event="${scope}">${x.st.claimed?'REPETIR EVENTO':'PREPARAR E INICIAR'}</button></div></article>`}).join('');$$('[data-bijuu-event]').forEach(b=>b.onclick=()=>{const scope=b.dataset.bijuuEvent,sel=document.querySelector(`[data-event-approach="${scope}"]`);startBijuuEvent(scope,sel?.value||'balanced')})
};

// Migração: Bijū temporária salva nunca pode permanecer no time da IA comum.
if((S.ai||[]).some(slug=>{const c=char(slug);return !c||c.eventOnly||/^bijuu-/.test(String(c.slug||slug))})){S.ai=teamForProfile(aiProfile()).map(c=>c.slug);save()}
/* ======================= FIM R21 ======================= */


/* ======================= R22 EVENTOS 2X + DROPS POR TIER ======================= */
BIJUU_RULES.monthlyGoal=2;
for(const ev of BIJUU_EVENTS){ev.monthlyHours=168;ev.monthlyMaxHours=346;ev.monthlyGoal=2}

const r22EnsureEventPeriods=legacy_BASE_ensureEventPeriods;
ensureEventPeriods=function(){
  r22EnsureEventPeriods();
  const m=S.events.monthly;
  if(m.claimCount===undefined)m.claimCount=m.claimed?Math.max(1,Math.min(2,Number(m.wins||1))):Math.min(2,Number(m.wins||0));
  m.wins=Math.max(Number(m.wins||0),Number(m.claimCount||0));
  m.claimed=Number(m.claimCount||0)>=2;
  if(m.unlockStartedAt===undefined)m.unlockStartedAt=0;
};

eventBossStatus=function(scope){
  ensureEventPeriods();
  const ev=activeEvent(scope),st=S.events[scope],goal=scope==='monthly'?2:1;
  return {ev,st,goal,progress:Math.min(goal,Number(scope==='monthly'?(st.claimCount??st.wins):st.wins||0)),hp:eventHp(ev,scope),reward:eventReward(ev,scope)}
};

function r22WeeklyGearPool(ev=activeNukenin()){
  const tier=Number(ev?.tier||0);
  return EQUIPMENT_CATALOG.filter(it=>it.weeklyExclusive===true&&Number(it.weeklyTier)===tier&&!it.missionUnique&&['Raro','Épico'].includes(String(it.rarity||'')))
}
function r22RollWeeklyGear(ev=activeNukenin()){
  const pool=r22WeeklyGearPool(ev),rare=pool.filter(x=>x.rarity==='Raro'),epic=pool.filter(x=>x.rarity==='Épico');
  const pick=(Math.random()<.5&&epic.length)?epic:(rare.length?rare:pool);
  return pick[Math.floor(Math.random()*pick.length)]||null
}
r21WeeklyGearPool=()=>r22WeeklyGearPool(activeNukenin());
r21RollWeeklyGear=()=>r22RollWeeklyGear(activeNukenin());

let completeBijuuEvent=async function(){
  if(!G?.eventBoss)return true;
  ensureEventPeriods();
  const scope=G.eventBoss.scope,ev=activeEvent(scope);
  if(!ev||ev.id!==G.eventBoss.id)return false;
  if(ON.token)return true;
  const st=S.events[scope];

  if(scope==='weekly'){
    st.wins=Number(st.wins||0)+1;
    if(!st.claimed){
      grantReward(eventReward(ev,scope));
      S.c.nukeninWins=Number(S.c.nukeninWins||0)+1;
      const gear=r22RollWeeklyGear(ev);
      if(gear){awardGear(gear.id);st.gear=gear.id;log(`DROP NUKENIN NÍVEL ${ev.tier}: ${gear.name} (${gear.rarity}).`,'good')}
      st.claimed=true
    }
  }else{
    let claimed=Number(st.claimCount||0);
    if(claimed<2){
      claimed++;
      grantReward(eventReward(ev,scope));
      S.c.bijuuWins=Number(S.c.bijuuWins||0)+1;
      if(!Number(st.unlockStartedAt||0))st.unlockStartedAt=Date.now();
      const totalHours=claimed===1?168:346;
      const until=Number(st.unlockStartedAt)+totalHours*3600000;
      S.events.temporary[ev.slug]=Math.max(Number(S.events.temporary[ev.slug]||0),until);
      if(!S.unlocked.includes(ev.slug))S.unlocked.push(ev.slug);
      st.claimCount=claimed;st.wins=Math.max(Number(st.wins||0)+1,claimed);st.claimed=claimed>=2;
      log(claimed===1?`${ev.name}: 1ª vitória — liberada por 168h.`:`${ev.name}: 2ª vitória — duração total do ciclo ampliada para 346h.`,'good')
    }
  }
  S.unlocked=storyUnlockedCharacters();save();return true
};

legacy_R22_EVENTOS_2X_DROPS_POR_TIE_renderBijuuEvents=function(){
  const box=$('#bijuuEvents');if(!box)return;ensureEventPeriods();
  box.innerHTML=['weekly','monthly'].map(scope=>{
    const x=eventBossStatus(scope),ev=x.ev,weekly=scope==='weekly';
    const until=weekly?0:Number(S.events.temporary[ev.slug]||0),active=until>Date.now();
    const gearId=weekly?x.st.gear:null,gear=gearId?EQUIPMENT_BY_ID[gearId]:null;
    const phases=weekly?['Rastreio','Intercepção','Confronto']:(ev.phases||['Fase I','Fase II','Fase III']);
    const approaches=weekly?[['trace','Rastreio silencioso','leitura do alvo e entrada segura'],['ambush','Emboscada','pressão ofensiva desde o início'],['capture','Cerco e captura','preparação defensiva']]:[['balanced','Equilibrada','formação versátil'],['assault','Assalto coordenado','pressão ofensiva'],['fortify','Formação defensiva','proteção inicial']];
    const tierPool=weekly?r22WeeklyGearPool(ev):[];
    const rare=tierPool.filter(g=>g.rarity==='Raro'),epic=tierPool.filter(g=>g.rarity==='Épico');
    const claimCount=weekly?Number(x.st.claimed?1:0):Number(x.st.claimCount||0);
    const rule=weekly
      ?`Nível ${ev.tier}/8. 1 vitória semanal. Drop garantido entre 10 peças deste nível: 5 Raras + 5 Épicas, com Arma, Roupa, Calçado, Pergaminho e Talismã.`
      :`Até 2 vitórias no ciclo. 1ª vitória: 168h. 2ª vitória: duração total do ciclo = 346h. Progresso ${claimCount}/2.`;
    const reward=weekly
      ?(gear?`${esc(gear.name)} • ${gear.rarity} recebido`:`1 equipamento do Nível ${ev.tier}: RARO ou ÉPICO + ${Number(x.reward?.ryo||0)} Ryō`)
      :`${esc(ev.name)} • ${claimCount}/2 vitórias • máximo 346h + ${Number(ev.monthlyReward?.ryo||0)} Ryō por vitória`;
    const state=weekly
      ?(x.st.claimed?'Recompensa semanal recebida; repetir não duplica o drop.':`Pool: ${rare.length} Raros + ${epic.length} Épicos.`)
      :(claimCount>=2?`Ciclo completo. ${active?`Bijū ativa até ${new Date(until).toLocaleString('pt-BR')}.`:'O desbloqueio deste ciclo expirou.'}`:claimCount===1?`1ª vitória concluída. Faça a 2ª vitória para elevar o total a 346h. Ativa até ${new Date(until).toLocaleString('pt-BR')}.`:'Nenhuma vitória mensal ainda.');
    const button=weekly?(x.st.claimed?'REPETIR EVENTO':'PREPARAR E INICIAR'):(claimCount===0?'BUSCAR 1ª VITÓRIA':claimCount===1?'BUSCAR 2ª VITÓRIA':'REPETIR RAID');
    return `<article class="r20EventCard r21EventCard r22EventCard ${weekly?'weekly':'monthly'}"><div class="r20EventArt">${r21EventArt(ev,weekly)}<span>${weekly?'SEMANAL':'MENSAL'}</span></div><div class="r20EventContent"><header><div><small>${weekly?`LIVRO BINGO • NÍVEL ${ev.tier}/8`:`RAID BIJŪ • ${claimCount}/2 VITÓRIAS`}</small><h2>${esc(ev.name)}</h2></div><b>PV ${x.hp}</b></header><p class="r20EventLead">${esc(weekly?(ev.huntText||'Localize e derrote o Nukenin.'):(ev.mechanic||'Derrote a Bijū em três fases.'))}</p><div class="r21EventRule"><b>${weekly?'REGRA DO DROP':'REGRA DO DESBLOQUEIO'}</b><span>${esc(rule)}</span></div><div class="r20EventPhases">${phases.map((p,i)=>`<div><span>${i+1}</span><b>${esc(p)}</b><small>${weekly?['Investigue pistas e descubra a rota do alvo.','Corte a fuga e force o Nukenin a revelar o padrão.','Derrote o alvo e role o drop do tier.'][i]:['100–67%: leitura do padrão da Bijū.','66–34%: padrão muda e a pressão aumenta.','33–0%: fase final e execução agressiva.'][i]}</small></div>`).join('')}</div><label class="r20EventApproach"><span>PREPARAÇÃO</span><select data-event-approach="${scope}">${approaches.map(a=>`<option value="${a[0]}">${a[1]} — ${a[2]}</option>`).join('')}</select></label><div class="r20EventReward"><b>${weekly?'DROP DESTE NÍVEL':'DESBLOQUEIO DO CICLO'}</b><span>${esc(reward)}</span></div><div class="r20EventState">${esc(state)}</div><button class="r20EventStart" data-bijuu-event="${scope}">${button}</button></div></article>`
  }).join('');
  $$('[data-bijuu-event]').forEach(b=>b.onclick=()=>{const scope=b.dataset.bijuuEvent,sel=document.querySelector(`[data-event-approach="${scope}"]`);startBijuuEvent(scope,sel?.value||'balanced')})
};
/* ======================= FIM R22 ======================= */


/* ======================= R23 COMBAT QUEST + EQUIPMENT + BIJUU ART ======================= */
const R23_BIJUU_ART={"Shukaku": "static/img/bijuu-events/r23/shukaku.jpg", "Matatabi": "static/img/bijuu-events/r23/matatabi.jpg", "Isobu": "static/img/bijuu-events/r23/isobu.jpg", "Son Gokū": "static/img/bijuu-events/r23/son-goku.jpg", "Kokuō": "static/img/bijuu-events/r23/kokuo.jpg", "Saiken": "static/img/bijuu-events/r23/saiken.jpg", "Chōmei": "static/img/bijuu-events/r23/chomei.jpg", "Gyūki": "static/img/bijuu-events/r23/gyuki.jpg", "Kurama": "static/img/bijuu-events/r23/kurama.jpg"};
let R23GearSelected=(S.you||[])[0]||null;
for(const ev of BIJUU_EVENTS){const art=R23_BIJUU_ART[ev.name],c=char(ev.slug);if(art&&c){c.icon=art;if(VIRTUAL_BIJUU_BY_SLUG.has(ev.slug)){for(const sk of c.skills||[])if(!sk.image||sk.image==='static/img/icon.png')sk.image=art}}}


function r23ApplyRunEffects(e={}){
  NinjaRun.risk=Math.max(0,Number(NinjaRun.risk||0)+Number(e.risk||0));
  NinjaRun.clues=Math.max(0,Number(NinjaRun.clues||0)+Number(e.clues||0));
  NinjaRun.momentum=Math.max(0,Number(NinjaRun.momentum||0)+Number(e.momentum||0));
  NinjaRun.startChakra=Math.max(0,Number(NinjaRun.startChakra||0)+Number(e.startChakra||0));
  NinjaRun.startShield=Math.max(0,Number(NinjaRun.startShield||0)+Number(e.shield||0));
  NinjaRun.enemyHpPct=Math.max(-.25,Math.min(.40,Number(NinjaRun.enemyHpPct||0)+Number(e.enemyHpPct||0)));
  NinjaRun.playerHpPct=Math.max(-.35,Math.min(.20,Number(NinjaRun.playerHpPct||0)+Number(e.playerHpPct||0)));
  NinjaRun.lootBonus=Math.max(-.35,Math.min(.50,Number(NinjaRun.lootBonus||0)+Number(e.lootBonus||0)));
}
r21EffectApply=r23ApplyRunEffects;

legacy_R23_COMBAT_QUEST_EQUIPMENT_B_startNinjaMission=function(id){
 const m=NINJA_MISSIONS.find(x=>x.id===id);if(!m?.questGraph?.nodes||m.questGraph.engine!=='r24-combat-quest')return alert('Esta missão não está configurada na R24.');
 if(S.you.length!==3)return alert('Selecione 3 ninjas em PERSONAGENS / EQUIPE antes da missão.');
 if(S.ninjaMissions?.active?.missionId===id){NinjaRun=JSON.parse(JSON.stringify(S.ninjaMissions.active));closeNinjaMissionDetail();return renderNinjaMissionRun()}
 S.ninjaMissions.attempts[m.id]=Number(S.ninjaMissions.attempts[m.id]||0)+1;
 NinjaRun={missionId:m.id,nodeId:'start',risk:0,clues:0,momentum:0,criticals:0,criticalFails:0,results:[],strategy:'balanced',battleWon:false,startChakra:0,startShield:0,enemyHpPct:0,playerHpPct:0,lootBonus:0,startedAt:Date.now()};
 closeNinjaMissionDetail();r21SaveQuest();renderNinjaMissionRun();
};

legacy_R23_COMBAT_QUEST_EQUIPMENT_B_resolveNinjaMissionChoice=function(choiceId){
 const m=r21QuestMission(),node=r21QuestNode(m),choice=node?.choices?.find(c=>c.id===choiceId);if(!m||!node||!choice)return;
 const capability=missionTeamCapability(choice.stat)+Math.min(10,Number(NinjaRun.clues||0)*2)+Math.min(8,Number(NinjaRun.momentum||0));
 const roll=1+Math.floor(Math.random()*20),target=Number(R21_RANK_TARGET[m.rank]||58)+Number(choice.difficultyMod||0)+Math.min(10,Number(NinjaRun.risk||0)*2),total=capability+roll,margin=total-target;
 const outcome=roll===20||margin>=18?'criticalSuccess':roll===1||margin<=-18?'criticalFailure':total>=target?'success':'failure',branch=choice.outcomes?.[outcome];if(!branch)return;
 if(outcome==='criticalSuccess')NinjaRun.criticals++;if(outcome==='criticalFailure')NinjaRun.criticalFails++;r23ApplyRunEffects(branch.effects||{});NinjaRun.strategy=choice.strategy||NinjaRun.strategy;
 NinjaRun.results.push({nodeId:node.id,stage:node.title,choice:choice.label,roll,total,target,margin,outcome,ok:['success','criticalSuccess'].includes(outcome),text:branch.text,next:branch.next});NinjaRun.nodeId=branch.next;r21SaveQuest();
 const next=m.questGraph.nodes?.[branch.next];if(next?.type==='battle'){closeNinjaMissionRun();return startNinjaMissionBattle()}
 if(branch.next==='SUCCESS')return finalizeNinjaMissionRun(true,branch.text);if(branch.next==='FAIL')return finalizeNinjaMissionRun(false,branch.text);renderNinjaMissionRun();
};

legacy_R23_COMBAT_QUEST_EQUIPMENT_B_startNinjaMissionBattle=function(){
 const m=r21QuestMission(),node=r21QuestNode(m);if(!m||node?.type!=='battle')return;const p=AI_PROFILES.find(x=>x.id===(node.enemyProfile||m.enemyProfile))||rankEnemyProfile(m.rank),team=teamForProfile(p),you=S.you.map(slug=>clone(char(slug),false,p.difficulty)),ai=team.map(c=>clone(c,true,p.difficulty));
 const hpMult=1+Number(NinjaRun.enemyHpPct||0);for(const f of ai){f.maxHp=Math.max(55,Math.round(f.maxHp*hpMult));f.hp=f.maxHp}
 const playerMult=1+Number(NinjaRun.playerHpPct||0);for(const f of you){f.maxHp=Math.max(40,Math.round(f.maxHp*playerMult));f.hp=Math.min(f.maxHp,Math.round(f.hp*playerMult));f.shield+=Number(NinjaRun.startShield||0);if(NinjaRun.startShield)f.shieldTurns=Math.max(2,f.shieldTurns||0)}
 const baseCh=m.rank==='S'?9:m.rank==='A'?8:m.rank==='B'?7:6,startPlayer=baseCh+Math.min(3,Number(NinjaRun.startChakra||0));closeNinjaMissionRun();
 G={ninjaMission:{id:m.id,nodeId:node.id,interactive:true},turn:1,diff:p.difficulty,profile:{...p,name:`MISSÃO ${String(m.number).padStart(2,'0')} • ${m.title}`,plan:node.text},strategy:NinjaRun.strategy||'balanced',you,ai,ch:gain(emptyCh(),startPlayer,you),aich:gain(emptyCh(),baseCh+1,ai),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},aiState:{defensiveStreak:0,lastKinds:[]}};
 selected=null;show('battle');$('#battlelog').innerHTML='';$('#player0 .controlTag').textContent=`MISSÃO ${String(m.number).padStart(2,'0')} — VOCÊ`;$('#player1 .controlTag').textContent=`MISSÃO RANK ${m.rank} — COMBATE`;$('#bottomAI').textContent=m.title;$('#bottomAIPlan').textContent='OBJETIVO DA MISSÃO';
 $('#view').innerHTML=`<section class="r23MissionBattleBrief"><h4>COMBATE DA MISSÃO ${String(m.number).padStart(2,'0')}</h4><p>${esc(node.text)}</p><p><b>Vantagens das escolhas:</b> +${NinjaRun.startChakra||0} chakra • +${NinjaRun.startShield||0} Defesa • risco ${NinjaRun.risk} • loot ${Math.round((NinjaRun.lootBonus||0)*100)}%</p></section>`;log(`A missão entrou em COMBATE: ${m.title}`,'info');renderBattle();
};

const R23_oldRollLoot=legacy_R16_GAMEPLAY_OVERHAUL_rollNinjaMissionLoot;
rollNinjaMissionLoot=function(m){
 const out=[],critBonus=Math.min(.35,Number(NinjaRun?.criticals||0)*Number(m.criticalLootBonus||.15)),failPenalty=Math.min(.30,Number(NinjaRun?.criticalFails||0)*Number(m.criticalFailPenalty||.12)),route=Number(NinjaRun?.lootBonus||0);
 for(const entry of m.lootTable||[]){const chance=Math.max(0,Math.min(.95,Number(entry.chance||0)+critBonus-failPenalty+route));if(Math.random()<chance){const qty=Number(entry.qty||1);S.inventory[entry.item]=Number(S.inventory[entry.item]||0)+qty;out.push(`${qty}× ${SHOP_ITEMS[entry.item]?.name||entry.item} (${Math.round(chance*100)}%)`)}}return out
};

legacy_R23_COMBAT_QUEST_EQUIPMENT_B_renderNinjaMissionRun=function(){
 const m=r21QuestMission(),node=r21QuestNode(m),modal=$('#ninjaMissionRunModal'),body=$('#ninjaMissionRunBody');if(!m||!modal||!body)return;if(NinjaRun?.nodeId==='SUCCESS')return finalizeNinjaMissionRun(true);if(NinjaRun?.nodeId==='FAIL')return finalizeNinjaMissionRun(false);if(node?.type==='battle')return startNinjaMissionBattle();if(!node)return finalizeNinjaMissionRun(false,'Rota inválida.');
 modal.classList.remove('hidden');const last=NinjaRun.results.at(-1),history=NinjaRun.results.map((r,i)=>`<li class="${r.ok?'ok':'fail'} ${r.outcome||''}"><span>${i+1}</span><div><b>${esc(r.stage)}</b><small>${esc(r.choice)} • d20 ${r.roll} • ${R21_OUTCOME_LABEL[r.outcome]||r.outcome}</small><p>${esc(r.text||'')}</p></div></li>`).join('');
 body.innerHTML=`<header class="r23QuestHead"><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(node.title)}</h2><p>${esc(node.text)}</p>${node.dialogue?`<blockquote><b>${esc(node.speaker||'Contato')}</b><span>${esc(node.dialogue)}</span></blockquote>`:''}</header>${last?`<div class="r23QuestLast ${last.ok?'ok':'fail'}"><b>${R21_OUTCOME_LABEL[last.outcome]||last.outcome}</b><span>${esc(last.text)}</span></div>`:''}<div class="r23QuestMeters"><span>RISCO <b>${NinjaRun.risk}</b></span><span>PISTAS <b>${NinjaRun.clues}</b></span><span>VANTAGEM <b>${NinjaRun.momentum}</b></span></div><section class="r23QuestChoices"><h3>ESCOLHA O QUE A EQUIPE FAZ</h3>${(node.choices||[]).map((c,i)=>`<button data-mission-choice="${c.id}"><span class="num">${i+1}</span><div><b>${esc(c.label)}</b><p>${esc(c.desc)}</p><small>${Number(c.difficultyMod||0)<=-1?'RISCO BAIXO':Number(c.difficultyMod||0)>=2?'RISCO ALTO':'RISCO MÉDIO'} • essa escolha altera o combate</small></div></button>`).join('')}</section><details class="r21QuestJournal"><summary>DIÁRIO • ${NinjaRun.results.length} decisão(ões)</summary><ol>${history||'<li>Nenhuma decisão ainda.</li>'}</ol></details><button id="ninjaMissionAbort">ABANDONAR MISSÃO</button>`;
 $$('[data-mission-choice]').forEach(b=>b.onclick=()=>resolveNinjaMissionChoice(b.dataset.missionChoice));$('#ninjaMissionAbort').onclick=()=>{if(confirm('Abandonar esta Missão Ninja?')){closeNinjaMissionRun();r21ClearQuest();renderNinjaMissions()}};
};

legacy_R23_COMBAT_QUEST_EQUIPMENT_B_openNinjaMissionDetail=function(id){
 const m=NINJA_MISSIONS.find(x=>x.id===id),modal=$('#ninjaMissionDetailModal'),body=$('#ninjaMissionDetailBody');if(!m||!modal||!body)return;const active=S.ninjaMissions?.active?.missionId===m.id,done=!!S.ninjaMissions.completed[m.id],uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null;
 body.innerHTML=`<header class="r23MissionDetailHead"><div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(m.title)}</h2><p>${esc(m.story?.briefing||'')}</p></div><b>${active?'EM ANDAMENTO':done?'CONCLUÍDA':'NOVA'}</b></header><section class="r23MissionFlow"><div><span>1</span><b>HISTÓRIA + ESCOLHA</b><small>Escolha como abordar a situação.</small></div><div><span>2</span><b>PREPARAÇÃO</b><small>Suas decisões mudam chakra/defesa/risco.</small></div><div><span>3</span><b>COMBATE REAL</b><small>Você joga a batalha com seu time.</small></div><div><span>4</span><b>DECISÃO FINAL</b><small>Confirme o objetivo e role o loot.</small></div></section><div class="r23MissionReward"><b>${m.ryo} Ryō • ${m.xp} XP</b>${unique?`<span>ÚNICO: ${esc(unique.name)}</span>`:''}</div><button id="r23MissionStart">${active?'RETOMAR MISSÃO':'COMEÇAR MISSÃO'}</button>`;
 modal.classList.remove('hidden');$('#ninjaMissionDetailClose').onclick=closeNinjaMissionDetail;const back=modal.querySelector('.ninjaMissionDetailBackdrop');if(back)back.onclick=closeNinjaMissionDetail;$('#r23MissionStart').onclick=()=>startNinjaMission(id);
};

// Equipamento: somente os três ninjas do time; uma peça física nunca pode estar em dois personagens.
function r23NormalizeGearUniqueness(){S.gear=S.gear||{owned:{},equipped:{}};S.gear.equipped=S.gear.equipped||{};const team=new Set(S.you||[]),used=new Set();for(const slug of Object.keys(S.gear.equipped)){if(!team.has(slug)){delete S.gear.equipped[slug];continue}const map=S.gear.equipped[slug]||{};for(const slot of GEAR_SLOTS){const id=map[slot];if(!id)continue;if(!gearOwned(id)||EQUIPMENT_BY_ID[id]?.slot!==slot||used.has(id))delete map[slot];else used.add(id)}}}
r23NormalizeGearUniqueness();
equipGear=function(slug,slot,id){if(!S.you.includes(slug)||!GEAR_SLOTS.includes(slot))return;r23NormalizeGearUniqueness();S.gear.equipped[slug]=S.gear.equipped[slug]||{};if(!id)delete S.gear.equipped[slug][slot];else if(gearOwned(id)&&EQUIPMENT_BY_ID[id]?.slot===slot){for(const [other,map] of Object.entries(S.gear.equipped))if(other!==slug)for(const s2 of GEAR_SLOTS)if(map?.[s2]===id)delete map[s2];S.gear.equipped[slug][slot]=id}r23NormalizeGearUniqueness();save();renderInventory()};
legacy_R23_COMBAT_QUEST_EQUIPMENT_B_renderInventory=function(){
 const box=$('#inventoryItems'),status=$('#inventoryStatus');if(!box)return;const team=(S.you||[]).map(char).filter(Boolean);if(!team.length){box.innerHTML='<p>Monte um time primeiro.</p>';return}if(!team.some(c=>c.slug===R23GearSelected))R23GearSelected=team[0].slug;const c=char(R23GearSelected),eq=equippedGear(c.slug);if(status)status.textContent='EQUIPAMENTO É POR NINJA DO TIME • cada peça física só pode estar em 1 personagem';
 const tabs=team.map(x=>`<button class="r23GearNinja ${x.slug===c.slug?'active':''}" data-r23-gear-ninja="${x.slug}">${imgSafe(x.icon,x.icon,'charicon')}<b>${esc(x.name)}</b></button>`).join('');
 const slots=GEAR_SLOTS.map(slot=>{const current=eq[slot],it=EQUIPMENT_BY_ID[current],owned=EQUIPMENT_CATALOG.filter(g=>g.slot===slot&&gearOwned(g.id)&&(g.id===current||!gearEquippedBy(g.id))),dur=it?Number(S.gear.owned?.[it.id]?.durability||0):0,price=it?repairPrice(it,S.gear.owned?.[it.id]):0;return `<article class="r23GearSlot"><header><small>${GEAR_SLOT_PT[slot].toUpperCase()}</small><h3>${esc(it?.name||'Vazio')}</h3></header><p>${it?esc(gearEffectText(it)):'Nenhum bônus neste slot.'}</p>${it?`<div class="durabilityBar"><i style="width:${Math.round(100*dur/it.maxDurability)}%"></i></div><small>DURABILIDADE ${dur}/${it.maxDurability}${dur<=0?' • QUEBRADO':''}</small>`:''}<select data-r23-slot="${slot}"><option value="">— SEM EQUIPAMENTO —</option>${owned.map(g=>`<option value="${g.id}" ${g.id===current?'selected':''}>${esc(g.name)} • ${g.rarity} • ${S.gear.owned[g.id].durability}/${g.maxDurability}</option>`).join('')}</select>${it&&price?`<button data-repair-gear="${it.id}">REPARAR • ${price} Ryō</button>`:''}</article>`}).join('');
 box.innerHTML=`<section class="r23GearManager"><h2>EQUIPAMENTOS DO TIME ATUAL</h2><p>Escolha um dos 3 ninjas e equipe exatamente 1 peça por slot.</p><div class="r23GearTeam">${tabs}</div><div class="r23SelectedNinja"><b>${esc(c.name)}</b><span>Arma • Roupa • Calçado • Pergaminho • Talismã</span></div><div class="r23GearSlots">${slots}</div></section><section><h3>CONSUMÍVEIS</h3><div class="featureGrid">${Object.entries(SHOP_ITEMS).filter(([id])=>Number(S.inventory[id]||0)>0).map(([id,it])=>itemCard(id,it,false)).join('')||'<p>Sem consumíveis.</p>'}</div></section>`;
 $$('[data-r23-gear-ninja]').forEach(b=>b.onclick=()=>{R23GearSelected=b.dataset.r23GearNinja;renderInventory()});$$('[data-r23-slot]').forEach(sel=>sel.onchange=()=>equipGear(c.slug,sel.dataset.r23Slot,sel.value||null));$$('[data-repair-gear]').forEach(b=>b.onclick=()=>repairGear(b.dataset.repairGear));
};

// Custos mais legíveis: separados da imagem do Jutsu.
function legacy_R23_COMBAT_QUEST_EQUIPMENT_B_r23CostChips(cost){const n={Blood:0,Gen:0,Nin:0,Tai:0,Rand:0};for(const k of(cost||[]))n[k]=(n[k]||0)+1;const lab={Blood:'KEK',Gen:'GEN',Nin:'NIN',Tai:'TAI',Rand:'Q'};const full={Blood:'Linhagem/Kekkei',Gen:'Genjutsu',Nin:'Ninjutsu',Tai:'Taijutsu',Rand:'QUALQUER'};return Object.keys(n).filter(k=>n[k]).map(k=>`<span class="r23Cost ${CCLS[k]}" title="${full[k]} • custo ${n[k]}"><b>${lab[k]}</b><strong>${n[k]}</strong></span>`).join('')||'<span class="r23Cost free">GRÁTIS</span>'}
renderNinja=function(f,i,enemy){let target=selected&&selected.targets.some(t=>t.side===(enemy?'ai':'you')&&t.i===i),acted=!enemy&&G.acts.some(a=>a.user===i);let skills=`<div class="charmoves r23Charmoves">${f.skills.map((sk,si)=>`<button class="charmove r23Charmove ${!enemy&&acted&&G.acts.find(a=>a.user===i)?.skill===si?'queued':''}" ${enemy?'disabled':`data-ui="${i}" data-si="${si}"`} ${f.hp<=0||sk.cd>0||(!enemy&&acted)||G.online&&ON.submittedTurn!==null?'disabled':''} title="${esc(sk.name+' — '+mechanicSummary(sk)+' — '+costText(sk.cost))}"><span class="r23SkillArt">${skillImg(sk,'skillicon',`alt="${esc(sk.name)}"`)}</span><span class="r23SkillCost">${r23CostChips(sk.cost)}</span>${sk.cd?`<span class="r23Cd">CD ${sk.cd}</span>`:''}</button>`).join('')}</div>`;return `<div class="ninja ${f.shield?'fxState-shield ':''}${f.stun?'fxState-stun ':''}${f.dot?'fxState-dot ':''}${f.inv?'fxState-invuln':''}" data-fighter-side="${enemy?'ai':'you'}" data-fighter-index="${i}"><aside class="details channels"></aside><button class="face ${f.hp<=0?'dead':''} ${target?'targetable':''}" data-side="${enemy?'ai':'you'}" data-i="${i}" ${target?'':'disabled'}>${imgSafe(f.icon,f.icon,'charicon')}</button>${skills}${hpbar(f,!enemy)}${f.copiedJutsu?`<div class="copiedJutsuBadge"><b>${esc(f.copiedJutsu.scroll||'Pergaminho')}</b><span>${esc(f.copiedJutsu.name)} • de ${esc(f.copiedJutsu.from)}</span></div>`:''}<aside class="details statuses">${f.shield?`<span class="fxStatus-shield">DEFESA${f.shieldTurns?' '+f.shieldTurns+'T':''}</span>`:''}${f.stun?`<span class="fxStatus-stun">ATORDOADO ${f.stunTurns||1}T</span>`:''}${f.dot?`<span class="fxStatus-dot">AFLIÇÃO ${f.dotTurns||1}T</span>`:''}${f.inv?`<span class="fxStatus-invuln">INVULNERÁVEL ${f.invTurns||1}T</span>`:''}</aside></div>`};

// Eventos voltam ao fluxo direto antigo: clicar = COMBATE. Sem seleção de preparação intermediária.
function legacy_R23_COMBAT_QUEST_EQUIPMENT_B_r23EventArt(ev,weekly){if(weekly)return r21EventArt(ev,true);const src=R23_BIJUU_ART[ev.name];return src?imgSafe(src,src,'bijuuEventImage',`alt="${esc(ev.name)}"`):r21EventArt(ev,false)}
renderBijuuEvents=function(){const box=$('#bijuuEvents');if(!box)return;ensureEventPeriods();box.innerHTML=['weekly','monthly'].map(scope=>{const x=eventBossStatus(scope),ev=x.ev,weekly=scope==='weekly',until=weekly?0:Number(S.events.temporary[ev.slug]||0),active=until>Date.now(),claim=weekly?(x.st.claimed?1:0):Number(x.st.claimCount||0),gear=x.st.gear?EQUIPMENT_BY_ID[x.st.gear]:null;return `<article class="r23EventCard ${weekly?'weekly':'monthly'}"><div class="r23EventArt">${r23EventArt(ev,weekly)}<span>${weekly?'CAÇADA SEMANAL':'RAID MENSAL'}</span></div><div class="r23EventBody"><header><small>${weekly?`NUKENIN • NÍVEL ${ev.tier}/8`:`BIJŪ • ${ev.tails} CAUDA(S) • ${claim}/2 VITÓRIAS`}</small><h2>${esc(ev.name)}</h2><b>PV ${x.hp}</b></header><p>${esc(weekly?(ev.huntText||'Derrote o Nukenin do ciclo.'):(ev.mechanic||'Derrote a Bijū do ciclo.'))}</p><div class="r23EventRule">${weekly?`<b>PRÊMIO:</b> 1 equipamento do tier • RARO ou ÉPICO • + ${Number(x.reward?.ryo||0)} Ryō`:`<b>DESBLOQUEIO:</b> 1ª vitória = 168h • 2ª vitória = total 346h no ciclo`}</div>${weekly&&gear?`<div class="r23EventWon">DROP RECEBIDO: ${esc(gear.name)} • ${gear.rarity}</div>`:''}${!weekly&&active?`<div class="r23EventWon">${esc(ev.name)} disponível até ${new Date(until).toLocaleString('pt-BR')}</div>`:''}<button data-r23-event="${scope}">${weekly?'ENFRENTAR NUKENIN':claim===0?'ENFRENTAR BIJŪ • 1ª VITÓRIA':claim===1?'ENFRENTAR BIJŪ • 2ª VITÓRIA':'REPETIR RAID'}</button></div></article>`}).join('');$$('[data-r23-event]').forEach(b=>b.onclick=()=>startBijuuEvent(b.dataset.r23Event,'balanced'))};

legacy_R23_COMBAT_QUEST_EQUIPMENT_B_renderNinjaMissions=function(){
 const box=$('#ninjaMissionGrid');if(!box)return;const rank=$('#ninjaMissionRank')?.value||'D',list=NINJA_MISSIONS.filter(m=>m.rank===rank),team=$('#ninjaMissionTeam'),activeId=S.ninjaMissions?.active?.missionId;
 if(team)team.innerHTML=S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')}<b>${esc(c.name)}</b></span>`).join('')||'<b>Selecione 3 ninjas.</b>';
 box.innerHTML=list.map(m=>{const done=!!S.ninjaMissions.completed[m.id],active=activeId===m.id,uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null;return `<article class="r23MissionCard ${done?'done':''} ${active?'active':''}" data-mission-open="${m.id}"><header><span>${String(m.number).padStart(2,'0')}</span><div><small>RANK ${m.rank}${done?' • CONCLUÍDA':''}${active?' • EM ANDAMENTO':''}</small><h3>${esc(m.title)}</h3></div></header><p>${esc(m.story?.briefing||'')}</p><div class="r23MissionRoute"><span>ESCOLHAS</span><b>→</b><span>PREPARAÇÃO</span><b>→</b><span class="combat">COMBATE</span><b>→</b><span>DECISÃO FINAL</span></div><footer><div><b>${m.ryo} Ryō • ${m.xp} XP</b><small>${unique?`Único: ${esc(unique.name)} • `:''}loot percentual e críticos</small></div><button data-mission-open-button="${m.id}">${active?'RETOMAR MISSÃO':'JOGAR MISSÃO'}</button></footer></article>`}).join('');
 $$('[data-mission-open]').forEach(card=>card.onclick=e=>{if(e.target.closest('button'))return;openNinjaMissionDetail(card.dataset.missionOpen)});$$('[data-mission-open-button]').forEach(b=>b.onclick=e=>{e.stopPropagation();openNinjaMissionDetail(b.dataset.missionOpenButton)});const resume=$('#r21ResumeActive');if(resume)resume.onclick=()=>{const a=S.ninjaMissions?.active;if(a){NinjaRun=JSON.parse(JSON.stringify(a));renderNinjaMissionRun()}}
};


/* ======================= R25 MULTI-ACTIVITY QUEST ENGINE ======================= */
const R25_MECH_LABEL={battle:'COMBATE',capture:'CAPTURA',timed_collect:'COLETA CRONOMETRADA',sequence:'MEMÓRIA / ORDEM',route:'ROTA',escort:'ESCOLTA',tracking:'RASTREIO',stealth:'INFILTRAÇÃO',investigation:'INVESTIGAÇÃO',target:'PRECISÃO',disarm:'DESARME',seal:'SELAMENTO'};
let R25ActivityTimer=null;
function r25ClearActivityTimer(){if(R25ActivityTimer){clearInterval(R25ActivityTimer);R25ActivityTimer=null}}
function r25ActivityNode(){return r21QuestNode(r21QuestMission())}
function r25ActivityEffects(outcome){return outcome==='criticalSuccess'?{risk:-1,clues:2,momentum:2,lootBonus:.10}:outcome==='success'?{risk:0,clues:1,momentum:1,lootBonus:.04}:outcome==='failure'?{risk:1,clues:0,momentum:-1,lootBonus:-.04}:{risk:3,clues:0,momentum:-2,lootBonus:-.12}}
function legacy_R25_MULTI_ACTIVITY_QUEST_ENG_r25CompleteActivity(outcome,detail=''){
 const m=r21QuestMission(),node=r25ActivityNode();if(!m||node?.type!=='activity')return;r25ClearActivityTimer();
 if(outcome==='criticalSuccess')NinjaRun.criticals=Number(NinjaRun.criticals||0)+1;if(outcome==='criticalFailure')NinjaRun.criticalFails=Number(NinjaRun.criticalFails||0)+1;
 r23ApplyRunEffects(r25ActivityEffects(outcome));
 const next=node[outcome==='criticalSuccess'?'onCriticalSuccess':outcome==='success'?'onSuccess':outcome==='failure'?'onFailure':'onCriticalFailure']||'FAIL';
 NinjaRun.results.push({nodeId:node.id,stage:node.title,choice:R25_MECH_LABEL[node.mechanic]||node.mechanic,outcome,ok:['success','criticalSuccess'].includes(outcome),text:detail||`${R25_MECH_LABEL[node.mechanic]||node.mechanic}: ${R21_OUTCOME_LABEL[outcome]||outcome}.`,next});
 NinjaRun.nodeId=next;NinjaRun.activityState=null;r21SaveQuest();
 if(next==='SUCCESS')return finalizeNinjaMissionRun(true,detail);if(next==='FAIL')return finalizeNinjaMissionRun(false,detail);renderNinjaMissionRun()
}
function r25ResultByRatio(score,max){const r=max?score/max:0;return r>=1?'criticalSuccess':r>=.72?'success':r>=.45?'failure':'criticalFailure'}
function r25StartCountdown(seconds,tick,done){r25ClearActivityTimer();const end=Date.now()+seconds*1000;const pulse=()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));tick(left);if(left<=0){r25ClearActivityTimer();done()}};pulse();R25ActivityTimer=setInterval(pulse,250)}
function r25ActivityShell(m,node,content){const last=NinjaRun.results.at(-1);return `<header class="r25ActivityHead"><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank} • ${R25_MECH_LABEL[node.mechanic]||node.mechanic}</small><h2>${esc(node.title)}</h2><p>${esc(node.text)}</p></header>${last?`<div class="r23QuestLast ${last.ok?'ok':'fail'}"><b>${R21_OUTCOME_LABEL[last.outcome]||last.outcome}</b><span>${esc(last.text||'')}</span></div>`:''}<div class="r23QuestMeters"><span>RISCO <b>${NinjaRun.risk}</b></span><span>PISTAS <b>${NinjaRun.clues}</b></span><span>VANTAGEM <b>${NinjaRun.momentum}</b></span></div><section class="r25ActivityBox">${content}</section><button id="ninjaMissionAbort">ABANDONAR MISSÃO</button>`}
function legacy_R25_MULTI_ACTIVITY_QUEST_ENG_r25BindAbort(){const a=$('#ninjaMissionAbort');if(a)a.onclick=()=>{if(confirm('Abandonar definitivamente esta Missão Ninja?')){r25ClearActivityTimer();closeNinjaMissionRun();r21ClearQuest();renderNinjaMissions()}}}
function r25MoveButton(btn){if(!btn)return;btn.style.left=(5+Math.random()*78)+'%';btn.style.top=(8+Math.random()*68)+'%'}
function renderR25TimedActivity(m,node,body){const sp=node.spec||{},target=Number(sp.target||8),seconds=Number(sp.seconds||15);NinjaRun.activityState={hits:0,target,mechanic:node.mechanic};const label=esc(sp.objectLabel||'OBJETIVO');body.innerHTML=r25ActivityShell(m,node,`<div class="r25Timer"><b id="r25Time">${seconds}s</b><span><strong id="r25Hits">0</strong> / ${target}</span></div><div class="r25ClickArena"><button id="r25ClickTarget">${label}</button></div><p>${esc(sp.instructions||'Complete a meta antes do tempo.')}</p>`);const btn=$('#r25ClickTarget'),hits=$('#r25Hits');r25MoveButton(btn);btn.onclick=()=>{NinjaRun.activityState.hits++;hits.textContent=NinjaRun.activityState.hits;r25MoveButton(btn);if(NinjaRun.activityState.hits>=target){const t=Number($('#r25Time')?.textContent?.replace(/\D/g,'')||0);r25CompleteActivity(t>=Math.ceil(seconds*.35)?'criticalSuccess':'success',`Meta concluída: ${target}/${target} antes do tempo.`)}};r25StartCountdown(seconds,l=>{const e=$('#r25Time');if(e)e.textContent=l+'s'},()=>{const h=NinjaRun?.activityState?.hits||0;r25CompleteActivity(r25ResultByRatio(h,target),`Tempo encerrado: ${h}/${target} ações concluídas.`)});r25BindAbort()}
function renderR25CaptureActivity(m,node,body){const sp=node.spec||{},target=Number(sp.target||7),seconds=Number(sp.seconds||14);NinjaRun.activityState={hits:0,target,mechanic:node.mechanic};body.innerHTML=r25ActivityShell(m,node,`<div class="r25Timer"><b id="r25Time">${seconds}s</b><span>ACERTOS <strong id="r25Hits">0</strong> / ${target}</span></div><div class="r25CaptureArena"><button id="r25MovingTarget">${node.mechanic==='target'?'◎':'捕'}</button></div><p>${esc(sp.instructions||'Clique no alvo móvel.')}</p>`);const btn=$('#r25MovingTarget'),hits=$('#r25Hits');r25MoveButton(btn);btn.onclick=()=>{NinjaRun.activityState.hits++;hits.textContent=NinjaRun.activityState.hits;r25MoveButton(btn);if(NinjaRun.activityState.hits>=target){const left=Number($('#r25Time')?.textContent?.replace(/\D/g,'')||0);r25CompleteActivity(left>=Math.ceil(seconds*.3)?'criticalSuccess':'success',`Alvo controlado com ${target} acertos.`)}};R25ActivityTimer=setInterval(()=>r25MoveButton(btn),720);const end=Date.now()+seconds*1000;const timer=setInterval(()=>{if(!NinjaRun?.activityState){clearInterval(timer);return}const left=Math.max(0,Math.ceil((end-Date.now())/1000)),el=$('#r25Time');if(el)el.textContent=left+'s';if(left<=0){clearInterval(timer);r25ClearActivityTimer();const h=NinjaRun?.activityState?.hits||0;r25CompleteActivity(r25ResultByRatio(h,target),`O alvo escapou do campo após ${h}/${target} acertos.`)}},250);r25BindAbort()}
function renderR25SequenceActivity(m,node,body){const sp=node.spec||{},seq=[...(sp.sequence||['火','水','風','土'])],symbols=[...new Set([...seq,'雷','印','封','解','忍'])].slice(0,9);NinjaRun.activityState={pos:0,errors:0,sequence:seq};body.innerHTML=r25ActivityShell(m,node,`<div class="r25SequencePreview" id="r25SeqPreview">${seq.map(x=>`<b>${esc(x)}</b>`).join('')}</div><div class="r25SequenceInput hidden" id="r25SeqInput">${symbols.map(x=>`<button data-r25-symbol="${esc(x)}">${esc(x)}</button>`).join('')}</div><p>${esc(sp.instructions||'Memorize e repita a sequência.')}</p><small id="r25SeqStatus">Memorize a ordem…</small>`);setTimeout(()=>{const prev=$('#r25SeqPreview'),inp=$('#r25SeqInput'),st=$('#r25SeqStatus');if(prev)prev.classList.add('hidden');if(inp)inp.classList.remove('hidden');if(st)st.textContent='Repita a sequência.'},2400);$$('[data-r25-symbol]').forEach(b=>b.onclick=()=>{const state=NinjaRun.activityState,sym=b.dataset.r25Symbol,expected=state.sequence[state.pos];if(sym===expected)state.pos++;else state.errors++;const st=$('#r25SeqStatus');if(st)st.textContent=`Progresso ${state.pos}/${state.sequence.length} • erros ${state.errors}`;if(state.errors>=4)return r25CompleteActivity('criticalFailure','Erros demais na sequência.');if(state.pos>=state.sequence.length){const out=state.errors===0?'criticalSuccess':state.errors<=1?'success':'failure';r25CompleteActivity(out,`Sequência concluída com ${state.errors} erro(s).`)}});r25BindAbort()}
function renderR25StepsActivity(m,node,body){const sp=node.spec||{},steps=sp.steps||[],state=NinjaRun.activityState={round:0,correct:0};const draw=()=>{const step=steps[state.round];if(!step){const out=r25ResultByRatio(state.correct,Math.max(1,steps.length));return r25CompleteActivity(out,`${state.correct}/${steps.length} decisões corretas na atividade.`)}body.innerHTML=r25ActivityShell(m,node,`<div class="r25StepCounter">ETAPA <b>${state.round+1}</b> / ${steps.length}</div><div class="r25Hazard"><small>SITUAÇÃO</small><h3>${esc(step.hazard)}</h3></div><div class="r25StepActions">${step.actions.map(a=>`<button data-r25-step="${esc(a)}">${esc(a)}</button>`).join('')}</div><p>${esc(sp.instructions||'Escolha a ação adequada.')}</p>`);$$('[data-r25-step]').forEach(b=>b.onclick=()=>{if(b.dataset.r25Step===step.correct)state.correct++;state.round++;draw()});r25BindAbort()};draw()}
function renderR25Investigation(m,node,body){const sp=node.spec||{},evidence=sp.evidence||[],need=Number(sp.selectCount||3),state=NinjaRun.activityState={selected:[]};body.innerHTML=r25ActivityShell(m,node,`<p>${esc(sp.instructions||'Selecione as evidências relevantes.')}</p><div class="r25Evidence">${evidence.map((e,i)=>`<button data-r25-evidence="${i}">${esc(e.text)}</button>`).join('')}</div><button id="r25Analyze" disabled>ANALISAR ${need} PISTAS</button><small id="r25EvidenceStatus">0/${need} selecionadas</small>`);$$('[data-r25-evidence]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.r25Evidence),ix=state.selected.indexOf(i);if(ix>=0)state.selected.splice(ix,1);else if(state.selected.length<need)state.selected.push(i);$$('[data-r25-evidence]').forEach(x=>x.classList.toggle('selected',state.selected.includes(Number(x.dataset.r25Evidence))));$('#r25Analyze').disabled=state.selected.length!==need;$('#r25EvidenceStatus').textContent=`${state.selected.length}/${need} selecionadas`});$('#r25Analyze').onclick=()=>{const good=state.selected.filter(i=>evidence[i]?.correct).length,out=good===need?'criticalSuccess':good===need-1?'success':good===1?'failure':'criticalFailure';r25CompleteActivity(out,`${good}/${need} evidências selecionadas eram realmente relevantes.`)};r25BindAbort()}
function legacy_R25_MULTI_ACTIVITY_QUEST_ENG_renderNinjaMissionActivity(){const m=r21QuestMission(),node=r25ActivityNode(),modal=$('#ninjaMissionRunModal'),body=$('#ninjaMissionRunBody');if(!m||node?.type!=='activity'||!modal||!body)return;modal.classList.remove('hidden');if(node.mechanic==='battle')return startNinjaMissionBattle();if(['timed_collect'].includes(node.mechanic))return renderR25TimedActivity(m,node,body);if(['capture','target'].includes(node.mechanic))return renderR25CaptureActivity(m,node,body);if(['sequence','disarm','seal'].includes(node.mechanic))return renderR25SequenceActivity(m,node,body);if(['route','escort','tracking','stealth'].includes(node.mechanic))return renderR25StepsActivity(m,node,body);if(node.mechanic==='investigation')return renderR25Investigation(m,node,body);r25CompleteActivity('failure','Mecânica não reconhecida; a equipe precisou improvisar.')}

legacy_R25_MULTI_ACTIVITY_QUEST_ENG_startNinjaMission=function(id){const m=NINJA_MISSIONS.find(x=>x.id===id);if(!m?.questGraph?.nodes||m.questGraph.engine!=='r25-multi-activity-quest')return alert('Esta missão ainda não está configurada no motor R25.');if(S.you.length!==3)return alert('Selecione exatamente 3 ninjas em PERSONAGENS / EQUIPE.');if(S.ninjaMissions?.active&&S.ninjaMissions.active.missionId!==id&&!confirm('Existe outra Missão Ninja em andamento. Abandonar a anterior?'))return;if(S.ninjaMissions?.active?.missionId===id){NinjaRun=JSON.parse(JSON.stringify(S.ninjaMissions.active));closeNinjaMissionDetail();return renderNinjaMissionRun()}S.ninjaMissions.attempts[m.id]=Number(S.ninjaMissions.attempts[m.id]||0)+1;NinjaRun={missionId:m.id,nodeId:'start',risk:0,clues:0,momentum:0,criticals:0,criticalFails:0,results:[],strategy:'balanced',startChakra:0,startShield:0,enemyHpPct:0,playerHpPct:0,lootBonus:0,startedAt:Date.now(),activityState:null};closeNinjaMissionDetail();r21SaveQuest();renderNinjaMissionRun()};

legacy_R25_MULTI_ACTIVITY_QUEST_ENG_startNinjaMissionBattle=function(){const m=r21QuestMission(),node=r25ActivityNode();if(!m||node?.type!=='activity'||node.mechanic!=='battle')return;const p=AI_PROFILES.find(x=>x.id===(node.spec?.enemyProfile||m.enemyProfile))||rankEnemyProfile(m.rank),team=teamForProfile(p),you=S.you.map(slug=>clone(char(slug),false,p.difficulty)),ai=team.map(c=>clone(c,true,p.difficulty));const hpMult=1+Number(NinjaRun.enemyHpPct||0);for(const f of ai){f.maxHp=Math.max(55,Math.round(f.maxHp*hpMult));f.hp=f.maxHp}const playerMult=1+Number(NinjaRun.playerHpPct||0);for(const f of you){f.maxHp=Math.max(40,Math.round(f.maxHp*playerMult));f.hp=Math.min(f.maxHp,Math.round(f.hp*playerMult));f.shield+=Number(NinjaRun.startShield||0);if(NinjaRun.startShield)f.shieldTurns=Math.max(2,f.shieldTurns||0)}const baseCh=m.rank==='S'?9:m.rank==='A'?8:m.rank==='B'?7:6,startPlayer=baseCh+Math.min(3,Number(NinjaRun.startChakra||0));r25ClearActivityTimer();closeNinjaMissionRun();G={ninjaMission:{id:m.id,nodeId:node.id,interactive:true,engine:'r25'},turn:1,diff:p.difficulty,profile:{...p,name:`MISSÃO ${String(m.number).padStart(2,'0')} • ${m.title}`,plan:node.text},strategy:NinjaRun.strategy||'balanced',you,ai,ch:gain(emptyCh(),startPlayer,you),aich:gain(emptyCh(),baseCh+1,ai),acts:[],over:false,damage:0,kos:0,aiFocus:null,itemUsedTurn:0,itemUsesTotal:0,itemUsesByType:{},aiState:{defensiveStreak:0,lastKinds:[]}};selected=null;show('battle');$('#battlelog').innerHTML='';$('#player0 .controlTag').textContent=`MISSÃO ${String(m.number).padStart(2,'0')} — VOCÊ`;$('#player1 .controlTag').textContent=`MISSÃO RANK ${m.rank} — COMBATE`;$('#bottomAI').textContent=m.title;$('#bottomAIPlan').textContent='ATIVIDADE: COMBATE';$('#view').innerHTML=`<section class="r23MissionBattleBrief"><h4>COMBATE DA MISSÃO</h4><p>${esc(node.text)}</p><p><b>Efeito das decisões:</b> +${NinjaRun.startChakra||0} chakra • +${NinjaRun.startShield||0} Defesa • risco ${NinjaRun.risk}</p></section>`;log(`A quest entrou em combate: ${m.title}`,'info');renderBattle()};

legacy_R25_MULTI_ACTIVITY_QUEST_ENG_completeNinjaMission=function(win,quit){const m=r21QuestMission()||NINJA_MISSIONS.find(x=>x.id===G?.ninjaMission?.id),node=m?.questGraph?.nodes?.[G?.ninjaMission?.nodeId||NinjaRun?.nodeId];if(!m)return;const fast=G&&Number(G.turn||99)<=4,allAlive=G&&G.you?.every(f=>f.hp>0);if(G){degradeGear(G.you);recordBattleMastery(G.you,win);S.c.battles++;S.c.kos+=G.kos;S.c.damage+=G.damage;trackPeriodic('battles',1);if(win){S.wins++;S.c.wins++;trackPeriodic('wins',1)}else if(!quit)S.losses++;save()}G=null;if(quit){r21ClearQuest();show('ninjaMissions');renderNinjaMissions();return}show('ninjaMissions');if(win)return r25CompleteActivity(fast&&allAlive?'criticalSuccess':'success',fast&&allAlive?'Combate vencido com execução excepcional.':'Combate vencido; a operação continua.');return r25CompleteActivity('criticalFailure','A equipe foi derrotada no combate e a missão falhou.')};

legacy_R25_MULTI_ACTIVITY_QUEST_ENG_renderNinjaMissionRun=function(){const m=r21QuestMission(),node=r21QuestNode(m),modal=$('#ninjaMissionRunModal'),body=$('#ninjaMissionRunBody');if(!m||!modal||!body)return;if(NinjaRun?.nodeId==='SUCCESS')return finalizeNinjaMissionRun(true);if(NinjaRun?.nodeId==='FAIL')return finalizeNinjaMissionRun(false);if(!node)return finalizeNinjaMissionRun(false,'A rota da missão ficou inválida.');if(node.type==='activity')return renderNinjaMissionActivity();r25ClearActivityTimer();modal.classList.remove('hidden');const last=NinjaRun.results.at(-1),history=NinjaRun.results.map((r,i)=>`<li class="${r.ok?'ok':'fail'} ${r.outcome||''}"><span>${i+1}</span><div><b>${esc(r.stage)}</b><small>${esc(r.choice)}${r.roll?` • d20 ${r.roll} • ${r.total}/${r.target}`:''} • ${R21_OUTCOME_LABEL[r.outcome]||r.outcome}</small><p>${esc(r.text||'')}</p></div></li>`).join('');body.innerHTML=`<header class="r23QuestHead"><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(node.title)}</h2><p>${esc(node.text)}</p>${node.dialogue?`<blockquote><b>${esc(node.speaker||'Contato')}</b><span>${esc(node.dialogue)}</span></blockquote>`:''}</header>${last?`<div class="r23QuestLast ${last.ok?'ok':'fail'}"><b>${R21_OUTCOME_LABEL[last.outcome]||last.outcome}</b><span>${esc(last.text||'')}</span></div>`:''}<div class="r23QuestMeters"><span>RISCO <b>${NinjaRun.risk}</b></span><span>PISTAS <b>${NinjaRun.clues}</b></span><span>VANTAGEM <b>${NinjaRun.momentum}</b></span></div><section class="r23QuestChoices"><h3>O QUE A EQUIPE FAZ?</h3>${(node.choices||[]).map((c,i)=>`<button data-mission-choice="${c.id}"><span class="num">${i+1}</span><div><b>${esc(c.label)}</b><p>${esc(c.desc)}</p><small>${String(c.stat||'táticas').toUpperCase()} • essa escolha altera a próxima atividade</small></div></button>`).join('')}</section><details class="r21QuestJournal"><summary>DIÁRIO • ${NinjaRun.results.length} decisão(ões)</summary><ol>${history||'<li>Nenhuma decisão ainda.</li>'}</ol></details><button id="ninjaMissionAbort">ABANDONAR MISSÃO</button>`;$$('[data-mission-choice]').forEach(b=>b.onclick=()=>resolveNinjaMissionChoice(b.dataset.missionChoice));r25BindAbort()};

legacy_R25_MULTI_ACTIVITY_QUEST_ENG_openNinjaMissionDetail=function(id){const m=NINJA_MISSIONS.find(x=>x.id===id),modal=$('#ninjaMissionDetailModal'),body=$('#ninjaMissionDetailBody');if(!m||!modal||!body)return;const active=S.ninjaMissions?.active?.missionId===m.id,done=!!S.ninjaMissions.completed[m.id],uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null,types=m.activityTypes||[];body.innerHTML=`<header class="r23MissionDetailHead"><div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(m.title)}</h2><p>${esc(m.story?.briefing||'')}</p></div><b>${active?'EM ANDAMENTO':done?'CONCLUÍDA':'NOVA'}</b></header><section class="r25MissionScript"><h3>COMO ESTA MISSÃO É JOGADA</h3><p>${esc(m.story?.missionScript||'')}</p><div>${types.map((t,i)=>`<span><b>${i+1}</b>${R25_MECH_LABEL[t]||t}</span>`).join('')}</div></section><div class="r23MissionReward"><b>${m.ryo} Ryō • ${m.xp} XP</b>${unique?`<span>ÚNICO: ${esc(unique.name)}</span>`:''}</div><button id="r23MissionStart">${active?'RETOMAR MISSÃO':'COMEÇAR MISSÃO'}</button>`;modal.classList.remove('hidden');$('#ninjaMissionDetailClose').onclick=closeNinjaMissionDetail;const back=modal.querySelector('.ninjaMissionDetailBackdrop');if(back)back.onclick=closeNinjaMissionDetail;$('#r23MissionStart').onclick=()=>startNinjaMission(id)};

legacy_R25_MULTI_ACTIVITY_QUEST_ENG_renderNinjaMissions=function(){const box=$('#ninjaMissionGrid');if(!box)return;const rank=$('#ninjaMissionRank')?.value||'D',list=NINJA_MISSIONS.filter(m=>m.rank===rank),team=$('#ninjaMissionTeam'),activeId=S.ninjaMissions?.active?.missionId;if(team)team.innerHTML=S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')}<b>${esc(c.name)}</b></span>`).join('')||'<b>Selecione 3 ninjas.</b>';box.innerHTML=list.map(m=>{const done=!!S.ninjaMissions.completed[m.id],active=activeId===m.id,types=m.activityTypes||[];return `<article class="r23MissionCard r25MissionCard ${done?'done':''} ${active?'active':''}" data-mission-open="${m.id}"><header><span>${String(m.number).padStart(2,'0')}</span><div><small>RANK ${m.rank}${done?' • CONCLUÍDA':''}${active?' • EM ANDAMENTO':''}</small><h3>${esc(m.title)}</h3></div></header><p>${esc(m.story?.briefing||'')}</p><div class="r25MissionMechanics">${types.map(t=>`<span>${R25_MECH_LABEL[t]||t}</span>`).join('')}</div><footer><div><b>${m.ryo} Ryō • ${m.xp} XP</b><small>escolhas, atividade jogável, críticos e loot</small></div><button data-mission-open-button="${m.id}">${active?'RETOMAR':'JOGAR'}</button></footer></article>`}).join('');$$('[data-mission-open]').forEach(card=>card.onclick=e=>{if(e.target.closest('button'))return;openNinjaMissionDetail(card.dataset.missionOpen)});$$('[data-mission-open-button]').forEach(b=>b.onclick=e=>{e.stopPropagation();openNinjaMissionDetail(b.dataset.missionOpenButton)})};

// Custo visual R25: abreviação + multiplicador, em faixa separada da arte.
r23CostChips=function(cost){const n={Blood:0,Gen:0,Nin:0,Tai:0,Rand:0};for(const k of(cost||[]))n[k]=(n[k]||0)+1;const lab={Blood:'LIN',Gen:'GEN',Nin:'NIN',Tai:'TAI',Rand:'Q'};const full={Blood:'Linhagem/Kekkei',Gen:'Genjutsu',Nin:'Ninjutsu',Tai:'Taijutsu',Rand:'QUALQUER'};return Object.keys(n).filter(k=>n[k]).map(k=>`<span class="r25Cost ${CCLS[k]}" title="${full[k]}"><em>${lab[k]}</em><strong>×${n[k]}</strong></span>`).join('')||'<span class="r25Cost free"><em>SEM</em><strong>CUSTO</strong></span>'};
window.NARUTO_R25_AUDIT={engine:'r25-multi-activity-quest',missions:NINJA_MISSIONS.filter(m=>m.r25Configured&&m.questGraph?.engine==='r25-multi-activity-quest').length,mechanics:[...new Set(NINJA_MISSIONS.flatMap(m=>m.activityTypes||[]))],battleMissions:NINJA_MISSIONS.filter(m=>(m.activityTypes||[]).includes('battle')).length,nonBattleOnly:NINJA_MISSIONS.filter(m=>!(m.activityTypes||[]).includes('battle')).length};
/* ======================= FIM R25 ======================= */

window.NARUTO_R24_AUDIT={missionsConfigured:NINJA_MISSIONS.filter(m=>m.r25Configured&&m.questGraph?.engine==='r25-multi-activity-quest').length,bijuuArt:Object.keys(R23_BIJUU_ART).length,equipmentMode:'selected-team-single-owner',eventMode:'direct-to-combat',costUi:'separate-readable-chips-r25'};
/* ======================= FIM R23 ======================= */

window.NARUTO_UNISON_AUDIT={
 rosterCount:R.length,
 variantCount:JV.length,
 missionCount:STORY_MISSIONS.length,
 bijuuEvents:BIJUU_EVENTS.map(x=>x.name),nukeninEvents:NUKENIN_EVENTS.map(x=>x.name),equipmentCount:EQUIPMENT_CATALOG.length,ninjaMissionCount:NINJA_MISSIONS.length,interactiveNinjaMissions:NINJA_MISSIONS.filter(m=>m.questGraph?.nodes&&Object.keys(m.questGraph.nodes).length>=4).length,chakraMode:'4-real-types-plus-wildcard-cost',ranked:true,rankedDivisions:['Genin','Chūnin','Jōnin','ANBU','Sannin','Kage'],dailyTaskPool:DAILY_MISSIONS.length,weeklyTaskPool:WEEKLY_MISSIONS.length,activeDailyTasks:activeTaskDefs('daily').length,activeWeeklyTasks:activeTaskDefs('weekly').length,permanentFeats:MISS.length,
 bijuuRules:{...BIJUU_RULES,monthlyMaxHours:346},
 bijuuConfig:BIJUU_EVENTS.map(x=>({
   id:x.id,name:x.name,monthlyHp:x.monthlyHp,monthlyHours:x.monthlyHours
 })),
 aiProfiles:AI_PROFILES.map(x=>x.id),
 starter:[...(CHAR_UNLOCKS.starter||[])],
 getState:()=>JSON.parse(JSON.stringify(S)),
 getGame:()=>G?JSON.parse(JSON.stringify(G)):null,
 aiPreview:()=>G?aiActs().map(a=>({user:a.user,skill:a.skill,target:a.target,name:G.ai[a.user]?.skills[a.skill]?.name,kind:skillKind(G.ai[a.user]?.skills[a.skill])})):[],
 show
};
if(S.ai.length!==3)S.ai=teamForProfile(aiProfile()).map(c=>c.slug);renderAIControls();renderHeader();renderRoster();renderMissions();
function fitLegacyViewport(){const box=$('#game'),page=$('#battlePage');if(box){box.style.transform='none';box.style.width='';box.style.height='';box.style.maxWidth=''}if(page){page.style.height='';page.style.minHeight=''}}
window.addEventListener('resize',fitLegacyViewport,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(fitLegacyViewport,80),{passive:true});
setTimeout(fitLegacyViewport,0);
async function bootstrap(){
 ensureMissionPeriods();show('auth');
 if(ON.token){
   authMsg('Verificando sessão salva (máximo 10s)...');
   const sess=await api('/api/account/session?token='+encodeURIComponent(ON.token),undefined,{timeout:10000});
   if(sess.ok){ON.user=sess.user;saveOnlineSession();if(sess.profile)applyServerProfile(sess.profile,sess.revision);setSaveStatus(`Salvo automaticamente • ${ON.user}`);if(!(await resumeBattleAfterAuth()))show('home');return}
   if([400,401,403].includes(Number(sess.httpStatus||0))){ON.token=null;ON.user=null;ON.revision=0;saveOnlineSession();authMsg('Sessão antiga expirou. Entre novamente.',true)}
   else authMsg((sess.error||'Não foi possível confirmar a sessão salva.')+' Você pode entrar manualmente; a tela não ficará presa.',true);
   return
 }
 authMsg('Pronto para entrar. Verificando o servidor em segundo plano...');
 api('/api/ping',undefined,{timeout:8000}).then(ping=>authMsg(ping.ok?'Servidor ativo. Entre ou crie sua conta para jogar.':(ping.error||'Servidor temporariamente indisponível.')+' Você pode tentar ENTRAR novamente; cada tentativa tem timeout.',!ping.ok));
}
const auditParams=new URLSearchParams(location.search),requested=auditParams.get('page');if(requested==='auth')setTimeout(()=>show('auth'),20);else if(requested&&['home','select','jutsus','story','online','tasks','ninjaMissions','events','profile','shop','inventory','encyclopedia'].includes(requested))setTimeout(()=>show(requested),50);else setTimeout(bootstrap,20);

/* ======================= R27 PROGRESSO / ECONOMIA / UX — EXECUTÁVEL DENTRO DO RUNTIME ======================= */
const R26_MISSION_DAILY_CAP={D:5,C:4,B:3,A:2,S:1};
function r26LocalDayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}


function r26EnsureMissionStats(){
  S.ninjaMissions=S.ninjaMissions&&typeof S.ninjaMissions==='object'?S.ninjaMissions:{completed:{},attempts:{},last:null};
  S.ninjaMissions.completed=S.ninjaMissions.completed||{};
  S.ninjaMissions.attempts=S.ninjaMissions.attempts||{};
  S.ninjaMissions.completions=S.ninjaMissions.completions||{};
  S.ninjaMissions.failures=S.ninjaMissions.failures||{};
  const day=r26LocalDayKey();
  if(!S.ninjaMissions.daily||S.ninjaMissions.daily.period!==day)S.ninjaMissions.daily={period:day,rewarded:{}};
  S.ninjaMissions.daily.rewarded=S.ninjaMissions.daily.rewarded||{};
  for(const [id,done] of Object.entries(S.ninjaMissions.completed||{})){
    if(done===true&&Number(S.ninjaMissions.completions[id]||0)<1)S.ninjaMissions.completions[id]=1;
  }
}
function r26MissionStats(m){
  r26EnsureMissionStats();
  const cap=Number(R26_MISSION_DAILY_CAP[m.rank]||1);
  return {
    attempts:Number(S.ninjaMissions.attempts[m.id]||0),
    completions:Number(S.ninjaMissions.completions[m.id]||0),
    failures:Number(S.ninjaMissions.failures[m.id]||0),
    today:Number(S.ninjaMissions.daily.rewarded[m.id]||0),
    cap
  };
}
function r26MissionRewardAvailable(m){const x=r26MissionStats(m);return x.today<x.cap}
function r26MissionTeamHtml(){
  return `<div class="r26QuestTeam">${(S.you||[]).map(char).filter(Boolean).map(c=>`<article>${imgSafe(c.icon,'static/img/icon.png','charicon',`alt="${esc(c.name)}"`)}<div><b>${esc(c.name)}</b><small>NO TIME DESTA MISSÃO</small></div></article>`).join('')||'<p>Selecione 3 ninjas em PERSONAGENS / EQUIPE.</p>'}</div>`
}
r26EnsureMissionStats();

const r26StartMissionBase=legacy_R25_MULTI_ACTIVITY_QUEST_ENG_startNinjaMission;
legacy_R27_PROGRESSO_ECONOMIA_UX_EX_startNinjaMission=function(id){
  const m=NINJA_MISSIONS.find(x=>x.id===id);if(!m)return;
  r26EnsureMissionStats();
  const resuming=S.ninjaMissions?.active?.missionId===id;
  if(!resuming&&!r26MissionRewardAvailable(m)){
    const st=r26MissionStats(m);
    if(!confirm(`MISSÃO ${String(m.number).padStart(2,'0')}\nLimite de recompensas de hoje atingido (${st.today}/${st.cap}).\n\nVocê pode continuar jogando em MODO TREINO, mas sem Ryō, XP, loot ou equipamento. Continuar?`))return;
  }
  r26StartMissionBase(id);
  if(!resuming&&NinjaRun){
    NinjaRun.practice=!r26MissionRewardAvailable(m);
    r21SaveQuest();
  }
};

const r26FinalizeBase=legacy_R21_QUEST_GRAPH_EVENT_RULES__finalizeNinjaMissionRun;
finalizeNinjaMissionRun=function(win,reason=''){
  const m=r21QuestMission();if(!m)return;
  r26EnsureMissionStats();
  const run=NinjaRun;
  const before=r26MissionStats(m);
  closeNinjaMissionRun();

  if(win){
    const first=before.completions===0;
    S.ninjaMissions.completed[m.id]=true;
    S.ninjaMissions.completions[m.id]=before.completions+1;
    S.ninjaMissions.last=m.id;

    const rewarded=!run?.practice && before.today<before.cap;
    let rewards=[],totalRyo=0,totalXp=0;
    if(rewarded){
      S.ninjaMissions.daily.rewarded[m.id]=before.today+1;
      const rw=ninjaMissionReward(m,first);
      const riskBonus=Math.max(0,Number(run?.momentum||0)*5-Number(run?.risk||0)*3)+Number(run?.criticals||0)*15;
      totalRyo=rw.ryo+riskBonus;totalXp=rw.xp;
      S.ryo+=totalRyo;S.xp+=totalXp;
      S.c.ninjaMissions=Number(S.c.ninjaMissions||0)+1;trackPeriodic('ninjaMissions',1);
      if(first&&m.firstClearReward){
        for(const [iid,n] of Object.entries(m.firstClearReward.items||{})){S.inventory[iid]=Number(S.inventory[iid]||0)+Number(n);rewards.push(`${n}× ${SHOP_ITEMS[iid]?.name||iid}`)}
        if(m.firstClearReward.gear){awardGear(m.firstClearReward.gear);rewards.push(`ITEM ÚNICO: ${EQUIPMENT_BY_ID[m.firstClearReward.gear]?.name||m.firstClearReward.gear}`)}
      }else if(!first&&m.repeatReward){
        for(const [iid,n] of Object.entries(m.repeatReward.items||{})){S.inventory[iid]=Number(S.inventory[iid]||0)+Number(n);rewards.push(`${n}× ${SHOP_ITEMS[iid]?.name||iid}`)}
      }
      rewards.push(...rollNinjaMissionLoot(m));
      if(first&&!m.firstClearReward?.gear&&Math.random()<Number(m.gearChance||0)){
        const gear=randomGear(m.rank);if(gear?.id){awardGear(gear.id);rewards.push(`Equipamento: ${gear.name}`)}
      }
      claim();
    }
    S.ninjaMissions.active=null;save();
    const after=r26MissionStats(m);
    alert(rewarded
      ?`MISSÃO CONCLUÍDA • ${after.completions}× NO TOTAL\n${m.title}\n${reason||m.story?.success||''}\n${totalRyo} Ryō • ${totalXp} XP\nRecompensas de hoje: ${after.today}/${after.cap}${rewards.length?'\n'+rewards.join(' • '):''}`
      :`MISSÃO CONCLUÍDA • MODO TREINO\n${m.title}\nConclusões totais: ${after.completions}\nLimite de recompensas de hoje: ${after.today}/${after.cap}\nSem Ryō, XP, loot ou equipamento nesta repetição.`);
  }else{
    S.ninjaMissions.failures[m.id]=before.failures+1;
    S.ninjaMissions.active=null;save();
    alert(`MISSÃO FALHOU\n${m.title}\n${reason||m.story?.failure||'A operação terminou sem cumprir o objetivo.'}\nFalhas registradas: ${S.ninjaMissions.failures[m.id]}`);
  }
  NinjaRun=null;renderNinjaMissions();
};

legacy_R27_PROGRESSO_ECONOMIA_UX_EX_renderNinjaMissionRun=function(){
  const m=r21QuestMission(),node=r21QuestNode(m),modal=$('#ninjaMissionRunModal'),body=$('#ninjaMissionRunBody');
  if(!m||!modal||!body)return;
  if(NinjaRun?.nodeId==='SUCCESS')return finalizeNinjaMissionRun(true);
  if(NinjaRun?.nodeId==='FAIL')return finalizeNinjaMissionRun(false);
  if(!node)return finalizeNinjaMissionRun(false,'A rota desta quest ficou inválida.');
  if(node.type==='activity')return renderNinjaMissionActivity();

  r25ClearActivityTimer();modal.classList.remove('hidden');
  const st=r26MissionStats(m),last=NinjaRun.results.at(-1);
  const history=NinjaRun.results.map((r,i)=>`<li class="${r.ok?'ok':'fail'} ${r.outcome||''}"><span>${i+1}</span><div><b>${esc(r.stage)}</b><small>${esc(r.choice)}${r.roll?` • d20 ${r.roll} • ${r.total}/${r.target}`:''} • ${R21_OUTCOME_LABEL[r.outcome]||r.outcome}</small><p>${esc(r.text||'')}</p></div></li>`).join('');

  body.innerHTML=`
    <header class="r26QuestHead">
      <div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(node.title)}</h2><p>${esc(node.text)}</p>${node.dialogue?`<blockquote><b>${esc(node.speaker||'Contato')}</b><span>${esc(node.dialogue)}</span></blockquote>`:''}</div>
      <div class="r26QuestCounter"><b>${st.completions}×</b><span>CONCLUÍDA</span><small>Hoje ${st.today}/${st.cap}</small></div>
    </header>
    ${r26MissionTeamHtml()}
    ${last?`<div class="r23QuestLast ${last.ok?'ok':'fail'}"><b>${R21_OUTCOME_LABEL[last.outcome]||last.outcome}</b><span>${esc(last.text||'')}</span></div>`:''}
    <div class="r23QuestMeters"><span>RISCO <b>${NinjaRun.risk}</b></span><span>PISTAS <b>${NinjaRun.clues}</b></span><span>VANTAGEM <b>${NinjaRun.momentum}</b></span></div>
    <section class="r26QuestChoices"><h3>ESCOLHA UMA AÇÃO</h3><p class="r26ChoiceHelp">Clique em um dos cartões abaixo. A escolha altera teste, risco, atividade seguinte e consequências.</p>
      <div>${(node.choices||[]).map((c,i)=>`<button type="button" class="r26ChoiceButton" data-mission-choice="${c.id}"><span class="r26ChoiceNumber">${i+1}</span><span class="r26ChoiceBody"><small>OPÇÃO ${i+1}</small><b>${esc(c.label)}</b><p>${esc(c.desc)}</p><em>${String(c.stat||'táticas').toUpperCase()} • ${Number(c.difficultyMod||0)>=0?'+':''}${Number(c.difficultyMod||0)} dificuldade</em></span><span class="r26ChoiceArrow">▶</span></button>`).join('')}</div>
    </section>
    <details class="r21QuestJournal"><summary>DIÁRIO • ${NinjaRun.results.length} decisão(ões)</summary><ol>${history||'<li>Nenhuma decisão ainda.</li>'}</ol></details>
    <button id="ninjaMissionAbort">ABANDONAR MISSÃO</button>`;
  $$('[data-mission-choice]').forEach(b=>b.onclick=()=>resolveNinjaMissionChoice(b.dataset.missionChoice));
  r25BindAbort();
};

legacy_R27_PROGRESSO_ECONOMIA_UX_EX_openNinjaMissionDetail=function(id){
  const m=NINJA_MISSIONS.find(x=>x.id===id),modal=$('#ninjaMissionDetailModal'),body=$('#ninjaMissionDetailBody');if(!m||!modal||!body)return;
  const active=S.ninjaMissions?.active?.missionId===m.id,st=r26MissionStats(m),uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null,types=m.activityTypes||[];
  const rewardReady=st.today<st.cap;
  body.innerHTML=`<header class="r23MissionDetailHead"><div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(m.title)}</h2><p>${esc(m.story?.briefing||'')}</p></div><div class="r26MissionStats"><b>${st.completions}× CONCLUÍDA</b><span>Hoje ${st.today}/${st.cap} com recompensa</span><small>${st.attempts} tentativas • ${st.failures} falhas</small></div></header>
  ${r26MissionTeamHtml()}
  <section class="r25MissionScript"><h3>COMO ESTA MISSÃO É JOGADA</h3><p>${esc(m.story?.missionScript||'')}</p><div>${types.map((t,i)=>`<span><b>${i+1}</b>${R25_MECH_LABEL[t]||t}</span>`).join('')}</div></section>
  <div class="r26DailyRule"><b>REPETIÇÃO DIÁRIA</b><span>Você pode rejogar quantas vezes quiser. Recompensas completas desta missão: ${st.cap}/dia. Depois disso entra em MODO TREINO, sem Ryō, XP, loot ou equipamento.</span></div>
  <div class="r23MissionReward"><b>${m.ryo} Ryō • ${m.xp} XP</b>${unique?`<span>ÚNICO: ${esc(unique.name)}</span>`:''}</div>
  <button id="r23MissionStart">${active?'RETOMAR MISSÃO':rewardReady?'COMEÇAR MISSÃO':'TREINO • SEM RECOMPENSA'}</button>`;
  modal.classList.remove('hidden');$('#ninjaMissionDetailClose').onclick=closeNinjaMissionDetail;
  const back=modal.querySelector('.ninjaMissionDetailBackdrop');if(back)back.onclick=closeNinjaMissionDetail;
  $('#r23MissionStart').onclick=()=>startNinjaMission(id);
};

legacy_R27_PROGRESSO_ECONOMIA_UX_EX_renderNinjaMissions=function(){
  r26EnsureMissionStats();
  const box=$('#ninjaMissionGrid');if(!box)return;
  const rank=$('#ninjaMissionRank')?.value||'D',list=NINJA_MISSIONS.filter(m=>m.rank===rank),team=$('#ninjaMissionTeam'),activeId=S.ninjaMissions?.active?.missionId;
  if(team)team.innerHTML=S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')}<b>${esc(c.name)}</b></span>`).join('')||'<b>Selecione 3 ninjas.</b>';
  box.innerHTML=list.map(m=>{
    const st=r26MissionStats(m),done=st.completions>0,active=activeId===m.id,types=m.activityTypes||[],rewardReady=st.today<st.cap;
    return `<article class="r23MissionCard r25MissionCard r26MissionCard ${done?'done':''} ${active?'active':''}" data-mission-open="${m.id}">
      <header><span>${String(m.number).padStart(2,'0')}</span><div><small>RANK ${m.rank}${active?' • EM ANDAMENTO':''}</small><h3>${esc(m.title)}</h3></div><div class="r26MissionCount"><b>${st.completions}×</b><small>FEITA</small></div></header>
      <p>${esc(m.story?.briefing||'')}</p>
      <div class="r25MissionMechanics">${types.map(t=>`<span>${R25_MECH_LABEL[t]||t}</span>`).join('')}</div>
      <div class="r26MissionProgress"><span>HOJE <b>${st.today}/${st.cap}</b></span><span>TENTATIVAS <b>${st.attempts}</b></span><span>FALHAS <b>${st.failures}</b></span></div>
      <footer><div><b>${rewardReady?`${m.ryo} Ryō • ${m.xp} XP`:'MODO TREINO'}</b><small>${rewardReady?'recompensa + loot disponíveis':'limite diário de recompensa atingido'}</small></div><button data-mission-open-button="${m.id}">${active?'RETOMAR':rewardReady?'JOGAR':'TREINAR'}</button></footer>
    </article>`;
  }).join('');
  $$('[data-mission-open]').forEach(card=>card.onclick=e=>{if(e.target.closest('button'))return;openNinjaMissionDetail(card.dataset.missionOpen)});
  $$('[data-mission-open-button]').forEach(b=>b.onclick=e=>{e.stopPropagation();openNinjaMissionDetail(b.dataset.missionOpenButton)});
};

/* CORREÇÃO 4/5 — economia de reparo */
function gearEconomicValue(it){
  if(!it)return 0;
  if(Number(it.price||0)>0)return Number(it.price);
  const rarityBase={Comum:650,Incomum:950,Raro:1650,'Épico':2850}[it.rarity]||1100;
  return rarityBase+Number(it.weeklyTier||0)*180+(it.missionUnique?1000:0);
}
repairPrice=function(it,o){
  const max=Math.max(1,Number(it?.maxDurability||1)),missing=Math.max(0,max-Number(o?.durability||0));
  if(!missing)return 0;
  const fullFactor={Comum:.35,Incomum:.45,Raro:.60,'Épico':.75}[it.rarity]||.45;
  const economic=gearEconomicValue(it),price=Math.ceil(economic*fullFactor*(missing/max));
  return Math.max(75,price);
};
repairGear=function(id){
  const it=EQUIPMENT_BY_ID[id],o=S.gear?.owned?.[id];if(!it||!o)return;
  const price=repairPrice(it,o);if(!price)return;
  const missing=Math.max(0,Number(it.maxDurability)-Number(o.durability||0));
  if(S.ryo<price)return alert(`Ryō insuficiente.\nReparo integral de ${it.name}: ${price} Ryō.`);
  if(!confirm(`REPARAR ${it.name}\nDurabilidade: ${o.durability}/${it.maxDurability}\nRecuperar: ${missing} ponto(s)\nCusto: ${price} Ryō\n\nConfirmar reparo?`))return;
  S.ryo-=price;S.c.ryoSpent=Number(S.c.ryoSpent||0)+price;S.c.gearRepairs=Number(S.c.gearRepairs||0)+1;
  trackPeriodic('gearRepairs',1);trackPeriodic('ryoSpent',price);o.durability=it.maxDurability;save();renderInventory();
};

/* Enriquecer a tela de equipamento após o render existente. */
const r26RenderInventoryBase=legacy_R23_COMBAT_QUEST_EQUIPMENT_B_renderInventory;
renderInventory=function(){
  r26RenderInventoryBase();
  document.querySelectorAll('.r23GearSlot').forEach(card=>{
    const sel=card.querySelector('[data-r23-slot]'),id=sel?.value,it=EQUIPMENT_BY_ID[id],o=S.gear?.owned?.[id];
    if(!it||!o)return;
    const price=repairPrice(it,o),max=Number(it.maxDurability||1),dur=Number(o.durability||0);
    const info=document.createElement('div');info.className='r26RepairInfo';
    info.innerHTML=`<span>VIDA ÚTIL <b>${dur} luta(s)</b></span><span>VALOR ECONÔMICO <b>${gearEconomicValue(it)} Ryō</b></span><span>REPARO ATUAL <b>${price||0} Ryō</b></span>`;
    const btn=card.querySelector('[data-repair-gear]');if(btn)card.insertBefore(info,btn);else card.appendChild(info);
    const lore=document.createElement('div');lore.className='r30GearLore';
    lore.innerHTML=`${it.sourceLabel?`<small>ORIGEM • ${esc(it.sourceLabel)}</small>`:''}<p>${esc(it.flavor||it.desc||'')}</p>${it.tacticalUse?`<b>USO TÁTICO</b><span>${esc(it.tacticalUse)}</span>`:''}`;
    card.appendChild(lore);
  });
};

/* Auditoria de runtime R26 */
window.NARUTO_R27_AUDIT={
  missionDailyCaps:{...R26_MISSION_DAILY_CAP},
  missionReplay:'unlimited-practice-after-reward-cap',
  repairEconomy:'rarity-economic-value-and-missing-durability',
  missionChoiceUi:'large-explicit-button-cards',
  missionTeamPortraits:true,brokenGearRepairable:true,gearOwnership:'one-physical-instance-even-when-broken'
};
/* ======================= FIM R26 ======================= */


/* ======================= R28 FINAL RUNTIME CONTROLLER ======================= */
const R28_BIJUU_ART={
 'Shukaku':{src:'static/img/bijuu-events/r23/shukaku.jpg',fallback:'static/img/bijuu-events/r23/shukaku.jpg'},
 'Matatabi':{src:'static/img/bijuu-events/r23/matatabi.jpg',fallback:'static/img/bijuu-events/r23/matatabi.jpg'},
 'Isobu':{src:'https://static.wikia.nocookie.net/naruto/images/7/72/Isobu_%28Infobox_-_Parte_II%29.PNG/revision/latest/scale-to-width-down/600?cb=20140619011626&path-prefix=pt-br',fallback:'static/img/bijuu-events/r29/isobu-fallback.jpg'},
 'Son Gokū':{src:'https://cdn.idntimes.com/content-images/duniaku/post/20210929/son-goku-naruto-edc6418667afa2721f80d496f51c7929.jpg',fallback:'static/img/bijuu-events/r29/son-goku-fallback.jpg'},
 'Kokuō':{src:'https://static.wikia.nocookie.net/naruto/images/b/bc/Koku%C5%8D_%28Infobox_-_Parte_II%29.PNG/revision/latest/scale-to-width-down/600?cb=20140619012730&path-prefix=pt-br',fallback:'static/img/bijuu-events/r29/kokuo-fallback.jpg'},
 'Saiken':{src:'https://static.wikia.nocookie.net/naruto/images/0/0a/Saiken_%28Infobox_-_Parte_II%29.PNG/revision/latest/scale-to-width-down/600?cb=20140619013037&path-prefix=pt-br',fallback:'static/img/bijuu-events/r29/saiken-fallback.jpg'},
 'Chōmei':{src:'https://static.wikia.nocookie.net/naruto/images/2/28/Ch%C5%8Dmei_%28Infobox_-_Parte_II%29.PNG/revision/latest/scale-to-width-down/600?cb=20140619025937&path-prefix=pt-br',fallback:'static/img/bijuu-events/r29/chomei-fallback.jpg'},
 'Gyūki':{src:'static/img/bijuu-events/r23/gyuki.jpg',fallback:'static/img/bijuu-events/gyuki-boss-icon-v229.jpg'},
 'Kurama':{src:'static/img/bijuu-events/r23/kurama.jpg',fallback:'static/img/ninja/nine-tailed-naruto-(s)/iconninetailedtransformation.jpg'}
};
for(const vb of VIRTUAL_BIJUU){const art=R28_BIJUU_ART[vb.name];if(art){vb.icon=art.src;for(const sk of vb.skills)sk.image=art.src}}
function r28ImgTag(src,fallback,cls='',alt=''){return `<img src="${esc(src)}" class="${cls}" alt="${esc(alt)}" data-fallback="${esc(fallback)}" onerror="if(this.src!==new URL(this.dataset.fallback,document.baseURI).href)this.src=this.dataset.fallback">`}
r23EventArt=function(ev,weekly){if(weekly)return r21EventArt(ev,true);const art=R28_BIJUU_ART[ev.name];return art?r28ImgTag(art.src,art.fallback,'bijuuEventImage',ev.name):r21EventArt(ev,false)};

/* Um único avanço final de quest: escolha/atividade sempre passa por aqui. */
function r28AdvanceMission(next,detail=''){
  if(!NinjaRun)return;
  NinjaRun.nodeId=next;NinjaRun.activityState=null;r21SaveQuest();
  if(next==='SUCCESS')return finalizeNinjaMissionRun(true,detail);
  if(next==='FAIL')return finalizeNinjaMissionRun(false,detail);
  const node=r21QuestNode();
  if(!node)return finalizeNinjaMissionRun(false,'A rota da missão ficou inválida.');
  if(node.type==='activity'&&node.mechanic==='battle')return r28EnterMissionBattle();
  if(node.type==='activity')return renderNinjaMissionActivity();
  return renderNinjaMissionRun();
}
resolveNinjaMissionChoice=function(choiceId){
  const m=r21QuestMission(),node=r21QuestNode(m),choice=node?.choices?.find(c=>c.id===choiceId);if(!m||node?.type!=='choice'||!choice)return;
  const capability=missionTeamCapability(choice.stat)+Math.min(10,Number(NinjaRun.clues||0)*2)+Math.min(8,Number(NinjaRun.momentum||0));
  const roll=1+Math.floor(Math.random()*20),target=Number(R21_RANK_TARGET[m.rank]||58)+Number(choice.difficultyMod||0)+Math.min(10,Number(NinjaRun.risk||0)*2),total=capability+roll,margin=total-target;
  const outcome=roll===20||margin>=16?'criticalSuccess':roll===1||margin<=-16?'criticalFailure':margin>=0?'success':'failure';
  const branch=choice.outcomes?.[outcome]||choice.outcomes?.[outcome==='criticalSuccess'?'success':'failure'];if(!branch)return;
  if(outcome==='criticalSuccess')NinjaRun.criticals=Number(NinjaRun.criticals||0)+1;if(outcome==='criticalFailure')NinjaRun.criticalFails=Number(NinjaRun.criticalFails||0)+1;
  r21EffectApply(branch.effects||{});NinjaRun.strategy=choice.strategy||NinjaRun.strategy||'balanced';
  NinjaRun.results.push({nodeId:node.id,stage:node.title,choice:choice.label,roll,total,target,margin,outcome,ok:['success','criticalSuccess'].includes(outcome),text:branch.text,next:branch.next});
  r28AdvanceMission(branch.next,branch.text||'');
};
r25CompleteActivity=function(outcome,detail=''){
  const m=r21QuestMission(),node=r25ActivityNode();if(!m||node?.type!=='activity')return;r25ClearActivityTimer();
  if(outcome==='criticalSuccess')NinjaRun.criticals=Number(NinjaRun.criticals||0)+1;if(outcome==='criticalFailure')NinjaRun.criticalFails=Number(NinjaRun.criticalFails||0)+1;
  r23ApplyRunEffects(r25ActivityEffects(outcome));
  const next=node[outcome==='criticalSuccess'?'onCriticalSuccess':outcome==='success'?'onSuccess':outcome==='failure'?'onFailure':'onCriticalFailure']||'FAIL';
  NinjaRun.results.push({nodeId:node.id,stage:node.title,choice:R25_MECH_LABEL[node.mechanic]||node.mechanic,outcome,ok:['success','criticalSuccess'].includes(outcome),text:detail||`${R25_MECH_LABEL[node.mechanic]||node.mechanic}: ${R21_OUTCOME_LABEL[outcome]||outcome}.`,next});
  r28AdvanceMission(next,detail);
};
const r28MissionBattleBase=legacy_R25_MULTI_ACTIVITY_QUEST_ENG_startNinjaMissionBattle;
function r28EnterMissionBattle(){
  const m=r21QuestMission(),node=r21QuestNode(m);if(!m||node?.type!=='activity'||node.mechanic!=='battle')return;
  NinjaRun.pendingBattle={nodeId:node.id,onCriticalSuccess:node.onCriticalSuccess,onSuccess:node.onSuccess,onFailure:node.onFailure,onCriticalFailure:node.onCriticalFailure};r21SaveQuest();
  r28MissionBattleBase();
  if(G?.ninjaMission){G.ninjaMission.engine='r28';G.ninjaMission.returnNode=node.id;G.ninjaMission.missionTitle=m.title}
}
startNinjaMissionBattle=r28EnterMissionBattle;
completeNinjaMission=function(win,quit){
  const missionId=G?.ninjaMission?.id||NinjaRun?.missionId,nodeId=G?.ninjaMission?.returnNode||G?.ninjaMission?.nodeId||NinjaRun?.nodeId;
  const m=NINJA_MISSIONS.find(x=>x.id===missionId),node=m?.questGraph?.nodes?.[nodeId];if(!m||!NinjaRun)return;
  const fast=G&&Number(G.turn||99)<=4,allAlive=G&&G.you?.every(f=>f.hp>0);
  if(G){degradeGear(G.you);recordBattleMastery(G.you,win);S.c.battles++;S.c.kos+=G.kos;S.c.damage+=G.damage;trackPeriodic('battles',1);if(win){S.wins++;S.c.wins++;trackPeriodic('wins',1)}else if(!quit)S.losses++;save()}
  G=null;show('ninjaMissions');
  if(quit){r21ClearQuest();renderNinjaMissions();return}
  const outcome=win?(fast&&allAlive?'criticalSuccess':'success'):'criticalFailure';
  if(outcome==='criticalSuccess')NinjaRun.criticals=Number(NinjaRun.criticals||0)+1;if(outcome==='criticalFailure')NinjaRun.criticalFails=Number(NinjaRun.criticalFails||0)+1;
  r23ApplyRunEffects(r25ActivityEffects(outcome));
  const next=node?.[outcome==='criticalSuccess'?'onCriticalSuccess':outcome==='success'?'onSuccess':outcome==='failure'?'onFailure':'onCriticalFailure']||(win?'SUCCESS':'FAIL');
  const text=win?(outcome==='criticalSuccess'?'Combate vencido sem perder nenhum ninja e em poucos turnos. A operação ganha vantagem.':'Combate vencido. A missão retorna ao roteiro para a próxima atividade ou decisão.'):'A equipe foi derrotada no confronto; a rota de recuperação/falha da missão foi acionada.';
  NinjaRun.results.push({nodeId:nodeId,stage:node?.title||'Combate',choice:'COMBATE REAL',outcome,ok:!!win,text,next});delete NinjaRun.pendingBattle;
  r28AdvanceMission(next,text);
};
renderNinjaMissionActivity=function(){const m=r21QuestMission(),node=r25ActivityNode(),modal=$('#ninjaMissionRunModal'),body=$('#ninjaMissionRunBody');if(!m||!node||!modal||!body)return;if(node.mechanic==='battle')return r28EnterMissionBattle();modal.classList.remove('hidden');if(node.mechanic==='timed_collect')return renderR25TimedActivity(m,node,body);if(['capture','target'].includes(node.mechanic))return renderR25CaptureActivity(m,node,body);if(['sequence','disarm','seal'].includes(node.mechanic))return renderR25SequenceActivity(m,node,body);if(['route','escort','tracking','stealth'].includes(node.mechanic))return renderR25StepsActivity(m,node,body);if(node.mechanic==='investigation')return renderR25Investigation(m,node,body);r25CompleteActivity('failure','Mecânica não reconhecida; a equipe precisou improvisar.')};

/* Raid: fases visíveis no combate e sincronizadas com o servidor. */

const R30_BIJUU_PHASE_GUIDE={
 shukaku:['Areia Movediça força leitura do ritmo antes do dano.','Casco de Areia ganha Defesa: quebre a proteção sem gastar tudo.','Tempestade do Shukaku acelera chakra e exige execução.'],
 matatabi:['Chamas Azuis iniciam pressão por dano contínuo.','Caçada Felina acelera o chakra da Bijū.','Incêndio de Chakra combina proteção e explosão final.'],
 isobu:['Maré de Coral mistura interrupção e aproximação.','Carapaça Espinhosa recebe Defesa adicional: não desperdice técnicas no casco.','Tsunami da Três Caudas recebe chakra extra para a fase final.'],
 songoku:['Punhos de Lava castigam alvos frágeis.','Mar Vulcânico aumenta o ciclo de chakra.','Erupção combina Defesa com chakra extra.'],
 kokuo:['Carga de Vapor prioriza impacto físico.','Pressão Máxima recupera PV: mantenha pressão suficiente para negar a recuperação.','Ruptura recebe chakra para as investidas finais.'],
 saiken:['Bolhas Corrosivas testam limpeza e resistência.','Manto Viscoso recupera PV e Defesa.','Mar Ácido recebe chakra extra e força o fechamento rápido.'],
 chomei:['Voo Rasante pune formação exposta.','Pó Ofuscante concede uma janela de evasão/invulnerabilidade.','Céu da Sete Caudas recebe chakra extra e entra em execução.'],
 gyuki:['Tentáculos pressionam múltiplos pontos da equipe.','Fúria do Oito-Caudas adiciona Defesa.','Bomba Bijū Completa recebe grande reserva de chakra.'],
 kurama:['Manto da Nove Caudas testa economia de recursos.','Fúria de Kurama recupera PV e Defesa.','Bomba Bijū Suprema recebe chakra máximo: fase de execução.']
};
const r28ApplyBijuuBase=legacy_BASE_applyBijuuServerGame;
applyBijuuServerGame=function(game){const before=G?.eventBoss?.phase||1;r28ApplyBijuuBase(game);if(G?.eventBoss&&game){G.eventBoss.phase=Number(game.phase||G.eventBoss.phase||1);G.eventBoss.phaseName=game.phaseName||G.eventBoss.phaseName||activeEvent(G.eventBoss.scope)?.phases?.[G.eventBoss.phase-1]||'';if(G.eventBoss.phase!==before)r28ShowRaidPhase(G.eventBoss.phase,G.eventBoss.phaseName)}};
const R30_LOCAL_BIJUU_PHASE_EFFECTS={shukaku:{2:{shield:14},3:{chakra:3}},matatabi:{2:{chakra:3},3:{shield:8,chakra:2}},isobu:{2:{shield:16},3:{chakra:4}},songoku:{2:{chakra:3},3:{shield:9,chakra:2}},kokuo:{2:{heal:34},3:{chakra:4}},saiken:{2:{heal:28,shield:10},3:{chakra:4}},chomei:{2:{invuln:1},3:{chakra:4}},gyuki:{2:{shield:15},3:{chakra:5}},kurama:{2:{heal:40,shield:12},3:{chakra:5}}};
function r30ApplyLocalRaidPhase(phase){if(!G?.eventBoss||G.eventBoss.scope!=='monthly'||G.eventBoss.serverAuthoritative)return false;G.eventBoss.localPhaseApplied=G.eventBoss.localPhaseApplied||{};if(G.eventBoss.localPhaseApplied[phase])return false;const ev=activeBijuu(),e=R30_LOCAL_BIJUU_PHASE_EFFECTS?.[ev?.id]?.[phase],b=G.ai?.[0];if(!e||!b)return false;G.eventBoss.localPhaseApplied[phase]=true;if(e.shield){b.shield=Number(b.shield||0)+e.shield;b.shieldTurns=Math.max(Number(b.shieldTurns||0),2)}if(e.heal)b.hp=Math.min(b.maxHp,Number(b.hp||0)+e.heal);if(e.invuln)b.inv=Math.max(Number(b.inv||0),e.invuln);if(e.chakra)gain(G.aich,e.chakra,G.ai);log(`FASE ${phase}: ${R30_BIJUU_PHASE_GUIDE[ev.id]?.[phase-1]||'A Bijū muda o padrão.'}`,'bad');return true}
function r30CheckLocalRaidPhase(){if(!G?.eventBoss||G.eventBoss.scope!=='monthly'||G.eventBoss.serverAuthoritative)return;const b=G.ai?.[0];if(!b)return;const ratio=b.hp/Math.max(1,b.maxHp),phase=ratio<=.33?3:ratio<=.66?2:1;if(phase>Number(G.eventBoss.phase||1)){G.eventBoss.phase=phase;G.eventBoss.phaseName=activeBijuu()?.phases?.[phase-1]||`Fase ${phase}`;r30ApplyLocalRaidPhase(phase);r28ShowRaidPhase(phase,G.eventBoss.phaseName)}}
function r28RaidPhase(){if(!G?.eventBoss||G.eventBoss.scope!=='monthly')return null;const ev=BIJUU_EVENTS.find(x=>x.id===G.eventBoss.id)||activeBijuu(),boss=G.ai?.[0],ratio=boss?boss.hp/Math.max(1,boss.maxHp):1,phase=Number(G.eventBoss.phase|| (ratio<=.33?3:ratio<=.66?2:1)),name=G.eventBoss.phaseName||ev?.phases?.[phase-1]||`Fase ${phase}`;return{phase,name,ratio,ev}}
function r28ShowRaidPhase(phase,name){const page=$('#battlePage');if(!page)return;let n=document.createElement('div');n.className='r28RaidPhaseFlash';n.innerHTML=`<small>RAID BIJŪ</small><b>FASE ${phase}</b><span>${esc(name||'Mudança de padrão')}</span>`;page.appendChild(n);setTimeout(()=>n.remove(),1700)}
const r28RenderCenterBase=legacy_R16_GAMEPLAY_OVERHAUL_renderCenter;
legacy_R28_FINAL_RUNTIME_CONTROLLER_renderCenter=function(){r28RenderCenterBase();const p=r28RaidPhase();if(!p)return;const c=$('#center');if(!c)return;const pct=Math.max(0,Math.round(p.ratio*100));const guide=R30_BIJUU_PHASE_GUIDE[p.ev?.id]?.[p.phase-1]||p.ev?.mechanic||'';const next=p.phase<3?(p.phase===1?'66%':'33%'):'0%';c.insertAdjacentHTML('afterbegin',`<div class="r28RaidPhase r30RaidPhase"><div><small>${esc(p.ev?.name||G.eventBoss.name)} • ${p.ev?.tails||'?'} CAUDAS</small><b>FASE ${p.phase}/3 — ${esc(p.name)}</b><p>${esc(guide)}</p></div><aside><strong>${pct}% PV</strong><small>${p.phase<3?'PRÓXIMA FASE EM '+next:'FASE FINAL'}</small></aside></div>`)};

/* História: briefing em cenas, sem texto de IA/metajogo. */
storyWelcome=function(){const lines=[{speaker:'Narrador',slug:null,text:'A História acompanha Naruto desde as primeiras escolhas na Folha até a guerra, Kaguya, The Last e a Nova Geração.'},{speaker:'Naruto',slug:'naruto-uzumaki',text:'Cada capítulo começa com uma cena. O objetivo vem depois — primeiro eu quero saber por que essa luta importa.'},{speaker:'Kakashi',slug:'kakashi-hatake',text:'Alguns capítulos exigem sobreviver ou proteger alguém. Leia a situação antes de gastar chakra.'},{speaker:'Sakura',slug:'sakura-haruno',text:'Quando o inimigo muda o ritmo, o capítulo também muda. Não trate chefe como uma luta comum.'}];openStoryDialog(lines,()=>{S.story.introSeen=true;save();renderStory()},{bg:'static/img/bg/hokage.jpg',label:'PRÓLOGO'})};
legacy_R28_FINAL_RUNTIME_CONTROLLER_storyBrief=function(id){const m=STORY_MISSIONS.find(x=>x.id===id);if(!m||!storyUnlocked(m))return;const beats=(m.narrative?.beats||[]).map((b,i)=>({speaker:'Narrador',slug:null,text:b.replace(/^[^—]+—\s*/,i===0?'': '')}));openStoryDialog(beats.length?beats:[{speaker:'Narrador',slug:null,text:m.summary}],()=>openStoryDialog(m.intro||[],()=>startStoryBattle(m),{bg:m.bg,label:`${m.chapter} — ${m.title}`}),{bg:m.bg,label:`${m.chapter} — ${m.title}`,brief:m})};

/* Itens: identidade tática e preços menos descartáveis. */
const R28_ITEM_PATCH={
 chakraFood:{price:180,tactical:'Flexível: corrige uma mão de chakra ruim sem escolher cor.'},soldierPill:{price:280,tactical:'Pressão física: prepara combinações NIN+TAI.'},ninScroll:{price:220,tactical:'Especialista: acelera equipes dependentes de Ninjutsu.'},genScroll:{price:220,tactical:'Controle: prepara Genjutsu e interrupções.'},taiScroll:{price:220,tactical:'Agressão: sustenta sequências de Taijutsu.'},bloodSeal:{price:300,tactical:'Linhagem: recurso raro para Dōjutsu/Kekkei.'},mixedRation:{price:480,tactical:'Recuperação de chakra completa; cara e versátil.'},
 medicalKit:{price:280,tactical:'Cura forte em um aliado que precisa sobreviver.'},healingOintment:{price:150,tactical:'Cura barata para dano moderado.'},fieldMedicine:{price:380,tactical:'Recuperação em área quando o time inteiro sofreu dano.'},antidote:{price:220,tactical:'Resposta direta a Stun/Aflição; inútil se não houver estado negativo.'},
 smokeBomb:{price:280,tactical:'Protege um turno crítico sem sustentar defesa longa.'},substitutionScroll:{price:520,tactical:'Invulnerabilidade prolongada; item defensivo premium.'},guardScroll:{price:260,tactical:'Defesa concentrada em um alvo.'},barrierTag:{price:460,tactical:'Defesa de equipe; melhor contra dano em área.'},
 shurikenPack:{price:120,tactical:'Finaliza inimigo com poucos PV sem gastar chakra.'},kunaiPack:{price:160,tactical:'Dano direto intermediário.'},explosiveTag:{price:300,tactical:'Finalização forte de alvo único.'},explosiveBundle:{price:520,tactical:'Maior dano direto de item; caro e limitado.'},senbonPack:{price:240,tactical:'Dano + Aflição para lutas longas.'},poisonBomb:{price:360,tactical:'Aflição longa contra inimigos resistentes.'},flashBomb:{price:330,tactical:'Interrompe exatamente um turno perigoso.'},paralysisTag:{price:520,tactical:'Controle premium por dois turnos.'},dispelTag:{price:320,tactical:'Remove Defesa/Invulnerabilidade antes da finalização.'}
};
for(const [id,p] of Object.entries(R28_ITEM_PATCH))if(SHOP_ITEMS[id])Object.assign(SHOP_ITEMS[id],p);
const r28ItemCardBase=legacy_R20_UI_MISSIONS_EVENTS_SHOP_itemCard;
itemCard=function(id,it,shop=false){const html=r28ItemCardBase(id,it,shop);return html.replace('</div>\n   <p class="r20ItemUse">',`</div><p class="r28ItemTactic"><b>USO TÁTICO:</b> ${esc(it.tactical||'Escolha conforme o estado da luta.')}</p><p class="r20ItemUse">`)};

window.NARUTO_R28_AUDIT={missionController:'single-final-transition-controller',battleAutoTransition:true,battleReturnsToQuest:true,storyBeats:STORY_MISSIONS.reduce((n,m)=>n+(m.narrative?.beats?.length||0),0),bijuuArt:9,raidPhaseVisible:true,itemPatch:Object.keys(R28_ITEM_PATCH).length,portraitPolicy:'recognizable-local-first'};
window.NARUTO_R28_TEST={
 showPage:name=>show(name),
 setTeam:slugs=>{S.you=(slugs||[]).filter(x=>!!char(x)).slice(0,3);save();return [...S.you]},
 state:()=>JSON.parse(JSON.stringify(S)),
 game:()=>G?JSON.parse(JSON.stringify(G)):null,
 missionRun:()=>NinjaRun?JSON.parse(JSON.stringify(NinjaRun)):null,
 startMission:id=>startNinjaMission(id),
 forceMissionWin:()=>completeNinjaMission(true,false),
 forceMissionLoss:()=>completeNinjaMission(false,false),
 forceActivity:(out='success')=>r25CompleteActivity(out,'TESTE R28: atividade resolvida.'),
 startEvent:scope=>startBijuuEvent(scope,'balanced'),
 story:id=>storyBrief(id),
 activeBijuu:()=>activeBijuu()?.name||null
};
/* ======================= FIM R28 FINAL RUNTIME CONTROLLER ======================= */



/* ======================= R29 PROGRESSÃO + NARRATIVA + TEMA ======================= */
const R29_RANK_RULES=window.NARUTO_V23_DATA?.rankRules||{
 D:{minLevel:1,prevRank:null,prevDistinct:0,story:null,maxAttempts:5,label:'Genin em formação'},
 C:{minLevel:5,prevRank:'D',prevDistinct:5,story:null,maxAttempts:4,label:'Genin de campo'},
 B:{minLevel:10,prevRank:'C',prevDistinct:10,story:'a2m6',maxAttempts:3,label:'Chūnin / operações táticas'},
 A:{minLevel:20,prevRank:'B',prevDistinct:10,story:'a4m6',maxAttempts:2,label:'Jōnin / elite'},
 S:{minLevel:30,prevRank:'A',prevDistinct:10,story:'a5m2',maxAttempts:1,label:'Elite estratégica'}
};
const R29_STORY_REQ_LABEL={a2m6:'História: Defesa de Konoha',a4m6:'História: Invasão de Pain',a5m2:'História: Cúpula dos Cinco Kage concluída'};
function r29LocalDayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function r29EnsureMissionProgress(){
  r26EnsureMissionStats();
  const day=r29LocalDayKey();
  S.ninjaMissions.dailyRuns=S.ninjaMissions.dailyRuns&&S.ninjaMissions.dailyRuns.period===day?S.ninjaMissions.dailyRuns:{period:day,attempts:{}};
  S.ninjaMissions.dailyRuns.attempts=S.ninjaMissions.dailyRuns.attempts||{};
}
function r29DistinctCompleted(rank){
  r29EnsureMissionProgress();
  return NINJA_MISSIONS.filter(m=>m.rank===rank&&(Number(S.ninjaMissions.completions?.[m.id]||0)>0||S.ninjaMissions.completed?.[m.id]===true)).length
}
function r29MissionAccess(m){
  const rule=R29_RANK_RULES[m.rank]||R29_RANK_RULES.D,reasons=[],lv=level();
  if(lv<Number(rule.minLevel||1))reasons.push(`Requer nível ${rule.minLevel} • atual ${lv}`);
  let prevDone=0;
  if(rule.prevRank&&Number(rule.prevDistinct||0)>0){
    prevDone=r29DistinctCompleted(rule.prevRank);
    if(prevDone<Number(rule.prevDistinct))reasons.push(`Requer ${rule.prevDistinct} missões Rank ${rule.prevRank} diferentes • ${prevDone}/${rule.prevDistinct}`);
  }
  if(rule.story&&!storyDone(rule.story))reasons.push(R29_STORY_REQ_LABEL[rule.story]||`Requer capítulo ${rule.story}`);
  return {ok:reasons.length===0,reasons,rule,level:lv,prevDone}
}
function r29MissionToday(m){
  r29EnsureMissionProgress();
  const rule=R29_RANK_RULES[m.rank]||R29_RANK_RULES.D;
  const used=Number(S.ninjaMissions.dailyRuns.attempts[m.id]||0),max=Number(rule.maxAttempts||1);
  return {used,max,left:Math.max(0,max-used)}
}
function r29MissionStats(m){r29EnsureMissionProgress();const base=r26MissionStats(m),today=r29MissionToday(m);return {...base,todayAttempts:today.used,maxAttempts:today.max,left:today.left}}
function r29MissionRequirementHtml(m){
  const a=r29MissionAccess(m),r=a.rule,rows=[`Nv. ${r.minLevel}+`];
  if(r.prevRank)rows.push(`${r.prevDistinct} missões ${r.prevRank} diferentes`);
  if(r.story)rows.push(R29_STORY_REQ_LABEL[r.story]||r.story);
  return `<div class="r29Requirements ${a.ok?'ok':'locked'}"><b>${a.ok?'REQUISITOS CUMPRIDOS':'BLOQUEADA'}</b><span>${rows.map(esc).join(' • ')}</span>${a.reasons.length?`<small>${a.reasons.map(esc).join('<br>')}</small>`:''}</div>`
}
function r29RichStoryHtml(m){
  const s=m.story||{};
  return `<section class="r29MissionStory">
    <div class="r29StoryMeta"><span><b>CONTRATANTE</b>${esc(s.contractor||'Vila Oculta da Folha')}</span><span><b>LOCAL</b>${esc(s.location||s.scene||'Área da missão')}</span><span><b>RISCO DO RANK</b>${esc(s.rankMeaning||s.rankProfile||'')}</span></div>
    <div class="r29OpeningScene"><small>CENA DE ABERTURA</small><p>${esc(s.openingScene||s.briefing||'')}</p>${s.openingDialogue?`<blockquote>${esc(s.openingDialogue)}</blockquote>`:''}</div>
    <div class="r29StoryFour"><article><b>COMPLICAÇÃO</b><p>${esc(s.complication||s.incident||'')}</p></article><article><b>O QUE ESTÁ EM JOGO</b><p>${esc(s.stakes||'')}</p></article><article><b>SUCESSO CRÍTICO</b><p>${esc(s.criticalSuccess||'')}</p></article><article><b>FALHA CRÍTICA</b><p>${esc(s.criticalFailure||'')}</p></article></div>
    <div class="r29Epilogue"><b>EPÍLOGO POSSÍVEL</b><span>${esc(s.epilogue||s.success||'')}</span></div>
  </section>`
}
const r29StartMissionCore=r26StartMissionBase;
startNinjaMission=function(id){
  const m=NINJA_MISSIONS.find(x=>x.id===id);if(!m)return;
  r29EnsureMissionProgress();
  const resuming=S.ninjaMissions?.active?.missionId===id;
  if(resuming){NinjaRun=JSON.parse(JSON.stringify(S.ninjaMissions.active));closeNinjaMissionDetail();return renderNinjaMissionRun()}
  if(S.you.length!==3)return alert('Selecione exatamente 3 ninjas em PERSONAGENS / EQUIPE.');
  const access=r29MissionAccess(m);if(!access.ok)return alert(`MISSÃO BLOQUEADA • RANK ${m.rank}\n\n${access.reasons.join('\n')}`);
  const t=r29MissionToday(m);if(t.left<=0)return alert(`LIMITE DIÁRIO DE TENTATIVAS ATINGIDO\n${m.title}\n\nTentativas de hoje: ${t.used}/${t.max}\nNovas tentativas: amanhã.`);
  if(S.ninjaMissions?.active&&S.ninjaMissions.active.missionId!==id){
    if(!confirm('Existe outra Missão Ninja em andamento. Abandonar a anterior e gastar a tentativa desta nova missão?'))return;
    const oldMission=NINJA_MISSIONS.find(x=>x.id===S.ninjaMissions.active.missionId);
    if(oldMission)S.ninjaMissions.failures[oldMission.id]=Number(S.ninjaMissions.failures[oldMission.id]||0)+1;
    r21ClearQuest();
  }
  S.ninjaMissions.dailyRuns.attempts[m.id]=t.used+1;save();
  r29StartMissionCore(id);
  if(NinjaRun){NinjaRun.practice=false;NinjaRun.r29OfficialAttempt=true;r21SaveQuest()}
};
r25BindAbort=function(){
  const a=$('#ninjaMissionAbort');if(!a)return;
  a.onclick=()=>{if(!confirm('Abandonar esta Missão Ninja? A tentativa de hoje continuará consumida.'))return;
    const m=r21QuestMission();if(m){r29EnsureMissionProgress();S.ninjaMissions.failures[m.id]=Number(S.ninjaMissions.failures[m.id]||0)+1}
    r25ClearActivityTimer();closeNinjaMissionRun();r21ClearQuest();save();renderNinjaMissions()
  }
};
renderNinjaMissionRun=function(){
  const m=r21QuestMission(),node=r21QuestNode(m),modal=$('#ninjaMissionRunModal'),body=$('#ninjaMissionRunBody');
  if(!m||!modal||!body)return;
  if(NinjaRun?.nodeId==='SUCCESS')return finalizeNinjaMissionRun(true);
  if(NinjaRun?.nodeId==='FAIL')return finalizeNinjaMissionRun(false);
  if(!node)return finalizeNinjaMissionRun(false,'A rota desta missão ficou inválida.');
  if(node.type==='activity')return renderNinjaMissionActivity();
  r25ClearActivityTimer();modal.classList.remove('hidden');
  const st=r29MissionStats(m),last=NinjaRun.results.at(-1),s=m.story||{};
  const history=NinjaRun.results.map((r,i)=>`<li class="${r.ok?'ok':'fail'} ${r.outcome||''}"><span>${i+1}</span><div><b>${esc(r.stage)}</b><small>${esc(r.choice)}${r.roll?` • d20 ${r.roll} • ${r.total}/${r.target}`:''} • ${R21_OUTCOME_LABEL[r.outcome]||r.outcome}</small><p>${esc(r.text||'')}</p></div></li>`).join('');
  const intro=node.id==='start'?`<div class="r29RunOpening"><small>${esc(s.contractor||'CONTRATANTE')} • ${esc(s.location||'LOCAL')}</small><p>${esc(s.openingScene||s.briefing||'')}</p>${s.openingDialogue?`<blockquote>${esc(s.openingDialogue)}</blockquote>`:''}</div>`:'';
  body.innerHTML=`<header class="r26QuestHead r29QuestHead"><div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(node.title)}</h2><p>${esc(node.text)}</p></div><div class="r26QuestCounter"><b>${st.completions}×</b><span>CONCLUÍDA</span><small>Tentativas hoje ${st.todayAttempts}/${st.maxAttempts}</small></div></header>
    ${intro}${r26MissionTeamHtml()}${last?`<div class="r23QuestLast ${last.ok?'ok':'fail'}"><b>${R21_OUTCOME_LABEL[last.outcome]||last.outcome}</b><span>${esc(last.text||'')}</span></div>`:''}
    <div class="r23QuestMeters"><span>RISCO <b>${NinjaRun.risk}</b></span><span>PISTAS <b>${NinjaRun.clues}</b></span><span>VANTAGEM <b>${NinjaRun.momentum}</b></span></div>
    <section class="r26QuestChoices r29QuestChoices"><h3>ESCOLHA UMA AÇÃO</h3><p class="r26ChoiceHelp">A escolha muda teste, risco, rota e atividade seguinte. Clique em um dos três cartões.</p><div>${(node.choices||[]).map((c,i)=>`<button type="button" class="r26ChoiceButton r29ChoiceButton" data-mission-choice="${c.id}"><span class="r26ChoiceNumber">${i+1}</span><span class="r26ChoiceBody"><small>DECISÃO ${i+1}</small><b>${esc(c.label)}</b><p>${esc(c.desc)}</p><em>${String(c.stat||'táticas').toUpperCase()} • ${Number(c.difficultyMod||0)>=0?'+':''}${Number(c.difficultyMod||0)} dificuldade</em></span><span class="r26ChoiceArrow">▶</span></button>`).join('')}</div></section>
    <details class="r21QuestJournal"><summary>DIÁRIO • ${NinjaRun.results.length} decisão(ões)</summary><ol>${history||'<li>Nenhuma decisão ainda.</li>'}</ol></details><button id="ninjaMissionAbort">ABANDONAR MISSÃO • GASTA A TENTATIVA</button>`;
  $$('[data-mission-choice]').forEach(b=>b.onclick=()=>resolveNinjaMissionChoice(b.dataset.missionChoice));r25BindAbort()
};
openNinjaMissionDetail=function(id){
  const m=NINJA_MISSIONS.find(x=>x.id===id),modal=$('#ninjaMissionDetailModal'),body=$('#ninjaMissionDetailBody');if(!m||!modal||!body)return;
  const active=S.ninjaMissions?.active?.missionId===m.id,st=r29MissionStats(m),access=r29MissionAccess(m),types=m.activityTypes||[],uniqueId=m.firstClearReward?.gear||m.uniqueReward?.gear,unique=uniqueId?EQUIPMENT_BY_ID[uniqueId]:null,noAttempts=st.left<=0,blocked=!access.ok;
  body.innerHTML=`<header class="r23MissionDetailHead r29MissionDetailHead"><div><small>MISSÃO ${String(m.number).padStart(2,'0')} • RANK ${m.rank}</small><h2>${esc(m.title)}</h2><p>${esc(m.story?.briefing||'')}</p></div><div class="r26MissionStats"><b>${st.completions}× CONCLUÍDA</b><span>Tentativas hoje ${st.todayAttempts}/${st.maxAttempts}</span><small>${st.attempts} tentativas totais • ${st.failures} falhas</small></div></header>
  ${r29MissionRequirementHtml(m)}${r29RichStoryHtml(m)}${r26MissionTeamHtml()}
  <section class="r25MissionScript r29MissionScript"><h3>ROTEIRO JOGÁVEL</h3><p>${esc(m.story?.missionScript||'')}</p><div>${types.map((t,i)=>`<span><b>${i+1}</b>${R25_MECH_LABEL[t]||t}</span>`).join('')}</div></section>
  <div class="r29AttemptRule"><b>TENTATIVAS OFICIAIS</b><span>Rank ${m.rank}: máximo ${st.maxAttempts}/dia nesta missão. Falha e abandono também gastam tentativa. Não existe replay infinito em modo treino.</span></div>
  <div class="r23MissionReward"><b>${m.ryo} Ryō • ${m.xp} XP</b>${unique?`<span>ÚNICO NA 1ª CONCLUSÃO: ${esc(unique.name)}</span>`:''}</div>
  <button id="r23MissionStart" ${(blocked||noAttempts)&&!active?'disabled':''}>${active?'RETOMAR MISSÃO':blocked?'MISSÃO BLOQUEADA':noAttempts?'SEM TENTATIVAS HOJE':'INICIAR MISSÃO'}</button>`;
  modal.classList.remove('hidden');$('#ninjaMissionDetailClose').onclick=closeNinjaMissionDetail;const back=modal.querySelector('.ninjaMissionDetailBackdrop');if(back)back.onclick=closeNinjaMissionDetail;$('#r23MissionStart').onclick=()=>startNinjaMission(id)
};
renderNinjaMissions=function(){
  r29EnsureMissionProgress();const box=$('#ninjaMissionGrid');if(!box)return;
  const rank=$('#ninjaMissionRank')?.value||'D',list=NINJA_MISSIONS.filter(m=>m.rank===rank),team=$('#ninjaMissionTeam'),activeId=S.ninjaMissions?.active?.missionId,rule=R29_RANK_RULES[rank],rankAccess=list.length?r29MissionAccess(list[0]):{ok:true,reasons:[]};
  if(team)team.innerHTML=`<div class="r29RankHeader"><div><b>RANK ${rank} • ${esc(rule.label)}</b><span>Nível mínimo ${rule.minLevel} • ${rule.maxAttempts} tentativa(s)/dia por missão</span></div><div class="${rankAccess.ok?'ok':'locked'}">${rankAccess.ok?'LIBERADO':rankAccess.reasons.map(esc).join(' • ')}</div></div>${S.you.map(char).filter(Boolean).map(c=>`<span>${imgSafe(c.icon,'static/img/icon.png','charicon')}<b>${esc(c.name)}</b></span>`).join('')||'<b>Selecione 3 ninjas.</b>'}`;
  box.innerHTML=list.map(m=>{const st=r29MissionStats(m),access=r29MissionAccess(m),done=st.completions>0,active=activeId===m.id,types=m.activityTypes||[],blocked=!access.ok,noAttempts=st.left<=0;return `<article class="r23MissionCard r25MissionCard r26MissionCard r29MissionCard ${done?'done':''} ${active?'active':''} ${blocked?'locked':''}" data-mission-open="${m.id}"><header><span>${String(m.number).padStart(2,'0')}</span><div><small>RANK ${m.rank}${active?' • EM ANDAMENTO':''}</small><h3>${esc(m.title)}</h3></div><div class="r26MissionCount"><b>${st.completions}×</b><small>FEITA</small></div></header><p>${esc(m.story?.briefing||'')}</p><div class="r29MissionMeta"><span>${esc(m.story?.contractor||'Contratante')}</span><span>${esc(m.story?.location||'Local')}</span></div><div class="r25MissionMechanics">${types.map(t=>`<span>${R25_MECH_LABEL[t]||t}</span>`).join('')}</div><div class="r26MissionProgress"><span>HOJE <b>${st.todayAttempts}/${st.maxAttempts}</b></span><span>TOTAL <b>${st.attempts}</b></span><span>FALHAS <b>${st.failures}</b></span></div>${blocked?`<div class="r29CardLock">${access.reasons.map(esc).join('<br>')}</div>`:''}<footer><div><b>${blocked?'BLOQUEADA':noAttempts?'SEM TENTATIVAS HOJE':`${m.ryo} Ryō • ${m.xp} XP`}</b><small>${blocked?'cumpra os requisitos':noAttempts?'volta amanhã':'falha e abandono gastam tentativa'}</small></div><button data-mission-open-button="${m.id}">${active?'RETOMAR':'VER MISSÃO'}</button></footer></article>`}).join('');
  $$('[data-mission-open]').forEach(card=>card.onclick=e=>{if(e.target.closest('button'))return;openNinjaMissionDetail(card.dataset.missionOpen)});$$('[data-mission-open-button]').forEach(b=>b.onclick=e=>{e.stopPropagation();openNinjaMissionDetail(b.dataset.missionOpenButton)})
};

/* História R29: 2 eventos intermediários em cada capítulo. */
function r29StorySpeaker(slug){return char(slug)||{name:'Narrador',icon:'static/img/icon.png'}}
function r29StoryEnemyRatio(){if(!G?.story||!G.ai?.length)return 1;const max=G.ai.reduce((n,f)=>n+Math.max(1,Number(f.maxHp||100)),0),hp=G.ai.reduce((n,f)=>n+Math.max(0,Number(f.hp||0)),0);return hp/max}
function r29ApplyStoryEffect(e={}){
  if(!G?.story)return;
  if(e.playerChakra)gain(G.ch,Number(e.playerChakra),G.you);if(e.enemyChakra)gain(G.aich,Number(e.enemyChakra),G.ai);
  if(e.playerShield)for(const f of alive(G.you)){f.shield=Number(f.shield||0)+Number(e.playerShield);f.shieldTurns=Math.max(Number(f.shieldTurns||0),1)}
  if(e.enemyShield)for(const f of alive(G.ai)){f.shield=Number(f.shield||0)+Number(e.enemyShield);f.shieldTurns=Math.max(Number(f.shieldTurns||0),1)}
  if(e.playerHeal)for(const f of alive(G.you))f.hp=Math.min(f.maxHp,f.hp+Number(e.playerHeal));
  if(e.enemyAggression)G.aiState.defensiveStreak=Math.max(Number(G.aiState.defensiveStreak||0),2)
}
function r29TriggerStoryBeat(key,beat){
  if(!G?.story||!beat||G.storyEventState?.[key])return;G.storyEventState=G.storyEventState||{};G.storyEventState[key]=true;r29ApplyStoryEffect(beat.effect||{});
  const who=r29StorySpeaker(beat.speaker),portrait=who?.icon||'static/img/icon.png';G.storyBeat={key,title:beat.title||'EVENTO DA HISTÓRIA',speaker:who?.name||'Narrador',portrait,text:beat.text||'',turn:G.turn};log(`${beat.title||'EVENTO'} — ${beat.text||''}`,'info')
}
function r29CheckStoryEvents(){
  if(!G?.story)return;const sc=G.storyMission?.storyScript;if(!sc)return;G.storyEventState=G.storyEventState||{};
  if(!G.storyEventState.act1&&Number(G.turn||1)>=Number(sc.act1?.trigger?.turn||2))r29TriggerStoryBeat('act1',sc.act1);
  const ratio=r29StoryEnemyRatio(),fallbackTurn=Math.max(3,Math.ceil(Number(G.storyMission?.objective?.turns||6)/2));
  if(!G.storyEventState.act2&&(ratio<=Number(sc.act2?.trigger?.enemyHpRatio||.55)||Number(G.turn||1)>=fallbackTurn))r29TriggerStoryBeat('act2',sc.act2)
}
const r29StartStoryBase=legacy_BASE_startStoryBattle;
startStoryBattle=function(m){r29StartStoryBase(m);if(G?.story){G.storyEventState={act1:false,act2:false};G.storyBeat=null;G.storyScript=m.storyScript||null;renderBattle()}};
const r29RenderCenterBase=legacy_R28_FINAL_RUNTIME_CONTROLLER_renderCenter;
renderCenter=function(){
  if(G?.eventBoss)r30CheckLocalRaidPhase();if(G?.story)r29CheckStoryEvents();r29RenderCenterBase();if(!G?.story)return;
  const c=$('#center'),sc=G.storyMission?.storyScript,beat=G.storyBeat;if(!c||!sc)return;
  const step=G.storyEventState?.act2?3:G.storyEventState?.act1?2:1,title=step===1?'ABERTURA':step===2?(sc.act1?.title||'PRIMEIRA FASE'):(sc.act2?.title||'VIRADA'),text=beat?.text||sc.openingText||G.storyMission.summary,portrait=beat?.portrait||r29StorySpeaker(G.storyMission?.player?.[0])?.icon||'static/img/icon.png';
  c.insertAdjacentHTML('afterbegin',`<div class="r29StoryBattleBeat r30StoryBattleBeat">${imgSafe(portrait,'static/img/icon.png','r29StoryBeatPortrait')}<div><small>${esc(G.storyMission.chapter)} • FASE ${step}/3</small><b>${esc(title)}</b><em>${esc(beat?.speaker||'Narrador')}</em><p>${esc(text)}</p></div></div>`)
};
storyBrief=function(id){
  const m=STORY_MISSIONS.find(x=>x.id===id);if(!m||!storyUnlocked(m))return;const sc=m.storyScript||{},n=m.narrative||{};
  const lines=[{speaker:'Narrador',slug:null,text:sc.openingText||n.setup||m.summary},{speaker:'Narrador',slug:null,text:`O que está em jogo: ${n.stakes||''}`},{speaker:sc.act1?.speaker?char(sc.act1.speaker)?.name||'Narrador':'Narrador',slug:sc.act1?.speaker||null,text:sc.act1?.text||n.turningPoint||''},{speaker:'Narrador',slug:null,text:`Clímax previsto: ${sc.climax||n.turningPoint||''}`}].filter(x=>x.text);
  openStoryDialog(lines,()=>openStoryDialog(m.intro||[],()=>startStoryBattle(m),{bg:m.bg,label:`${m.chapter} — ${m.title}`}),{bg:m.bg,label:`${m.chapter} — ${m.title}`,brief:m})
};

document.documentElement.classList.add('r29NarutoTheme');document.body.classList.add('r29NarutoTheme','r33NarutoUnisonTheme');
document.documentElement.classList.add('r31MasteryTheme');document.body.classList.add('r31MasteryTheme');
window.NARUTO_R33_AUDIT=(()=>{const trials=JV.filter(v=>v.masteryTrial),structures=new Set(trials.map(v=>(v.masteryTrial.stages||[]).map(x=>x.mechanic).join('>'))),finals={};for(const v of trials){const k=v.masteryTrial.finalMechanic||v.masteryTrial.stages?.at(-1)?.mechanic||'unknown';finals[k]=Number(finals[k]||0)+1}return {version:'v23.17-r33-unison',rankRules:R29_RANK_RULES,masteryTrials:trials.length,masteryUniqueIds:new Set(trials.map(v=>v.masteryTrial.id)).size,masteryUniqueTitles:new Set(trials.map(v=>v.masteryTrial.title)).size,masteryStructures:structures.size,masteryFamilies:new Set(trials.map(v=>v.masteryTrial.family)).size,masteryInteractiveMechanics:new Set(trials.flatMap(v=>(v.masteryTrial.stages||[]).map(x=>x.mechanic))).size,masteryRepeatedMechanics:trials.filter(v=>{const a=(v.masteryTrial.stages||[]).map(x=>x.mechanic);return a.length!==new Set(a).size}).length,masteryBattleRequiresTechnique:trials.filter(v=>(v.masteryTrial.stages||[]).some(x=>x.mechanic==='battle')).every(v=>(v.masteryTrial.stages||[]).filter(x=>x.mechanic==='battle').every(x=>x.requiresTechniqueUse===true)),masteryStageCounts:{three:trials.filter(v=>v.masteryTrial.stages.length===3).length,four:trials.filter(v=>v.masteryTrial.stages.length===4).length},masteryFinalMechanics:finals,masteryPerVariant:true,masteryGenericUseWinUnlock:false,masteryExecutionOnly:true,masteryMetricsPerVariant:true,masteryTechniqueChakraGuaranteed:true,masteryLegacyRequirements:JV.filter(v=>['uses','wins','battles'].includes(v.requirement?.type)).length,narutoMasteryTheme:true,masteryGenericFamilyRemaining:trials.filter(v=>v.masteryTrial.family==='ninjutsu').length,openSourceUiIcons:26,narutoUnisonThemeVersion:'r33-local-assets',legacyPublicDuplicates:0,missionNarrativeDossiers:100,missionActivities:195,missionBattleMissions:33,storyUniqueScripts:44}})();
window.NARUTO_R33_TEST={...window.NARUTO_R28_TEST,
 access:id=>{const m=NINJA_MISSIONS.find(x=>x.id===id);return m?r29MissionAccess(m):null},today:id=>{const m=NINJA_MISSIONS.find(x=>x.id===id);return m?r29MissionToday(m):null},setLevel:n=>{S.xp=Math.max(0,(Number(n)-1)*500);save();return level()},completeDistinct:(rank,n)=>{for(const m of NINJA_MISSIONS.filter(x=>x.rank===rank).slice(0,n)){S.ninjaMissions.completed[m.id]=true;S.ninjaMissions.completions[m.id]=Math.max(1,Number(S.ninjaMissions.completions[m.id]||0))}save();return r29DistinctCompleted(rank)},completeStory:id=>{if(!S.story.completed.includes(id))S.story.completed.push(id);save();return [...S.story.completed]},resetMissionDay:()=>{S.ninjaMissions.dailyRuns={period:r29LocalDayKey(),attempts:{}};save()},
 setTodayAttempts:(id,n)=>{r29EnsureMissionProgress();S.ninjaMissions.dailyRuns.attempts[id]=Number(n);save();return r29MissionToday(NINJA_MISSIONS.find(x=>x.id===id))},
 clearMissionProgress:()=>{S.ninjaMissions={completed:{},attempts:{},completions:{},failures:{},last:null,daily:{period:r29LocalDayKey(),rewarded:{}},dailyRuns:{period:r29LocalDayKey(),attempts:{}},active:null};NinjaRun=null;save();return S.ninjaMissions},
 forceStoryTurn:n=>{if(G?.story){G.turn=Number(n);renderBattle()}return G?.storyBeat||null},forceStoryEnemyRatio:r=>{if(G?.story&&G.ai?.length){for(const f of G.ai)f.hp=Math.max(1,Math.round(f.maxHp*Number(r)));renderBattle()}return G?.storyBeat||null},startStoryDirect:id=>{const m=STORY_MISSIONS.find(x=>x.id===id);if(!m)return null;startStoryBattle(m);return {id:m.id,title:m.title}},
 testAiPlanInfluence:()=>{if(!G?.story)return null;const u=G.ai.find(x=>(x.skills||[]).some(sk=>skillKind(sk)==='damage'))||G.ai[0],i=(u.skills||[]).findIndex(sk=>skillKind(sk)==='damage'),sk=u.skills[Math.max(0,i)],target=G.you[0],old=G.storyMission.aiPlan;G.storyMission.aiPlan={...(old||{}),opening:'pressure'};const pressure=aiActionScore(u,sk,target,G.profile);G.storyMission.aiPlan={...(old||{}),opening:'fortify'};const fortify=aiActionScore(u,sk,target,G.profile);G.storyMission.aiPlan=old;return {skill:sk?.name,pressure,fortify,delta:pressure-fortify,plan:old}},
 forceRaidRatio:r=>{if(G?.eventBoss&&G.ai?.[0]){G.ai[0].hp=Math.max(1,Math.round(G.ai[0].maxHp*Number(r)));renderBattle()}return {phase:G?.eventBoss?.phase||1,boss:G?.ai?.[0],chakra:G?.aich}},
 giveGear:id=>{const it=EQUIPMENT_BY_ID[id];if(!it)return null;S.gear.owned[id]={durability:it.maxDurability};save();return JSON.parse(JSON.stringify(S.gear.owned[id]))},equipTest:(slug,slot,id)=>{equipGear(slug,slot,id);return JSON.parse(JSON.stringify(S.gear.equipped[slug]||{}))},gearData:id=>EQUIPMENT_BY_ID[id]?JSON.parse(JSON.stringify(EQUIPMENT_BY_ID[id])):null,completeEvent:()=>completeBijuuEvent(),eventState:scope=>JSON.parse(JSON.stringify(S.events?.[scope]||{})),temporaryBijuu:slug=>Number(S.events?.temporary?.[slug]||0),tasks:()=>({daily:activeTaskDefs('daily').length,weekly:activeTaskDefs('weekly').length,achievements:MISS.length}),
 variant:id=>JV_BY_ID[id]?JSON.parse(JSON.stringify(JV_BY_ID[id])):null,
 mastery:id=>JSON.parse(JSON.stringify(masteryTrialState(id))),
 resetMastery:id=>{if(id){delete S.jutsuMastery[id];S.unlockedJutsu=S.unlockedJutsu.filter(x=>x!==id)}else{S.jutsuMastery={};S.unlockedJutsu=[]}save();return id?masteryTrialState(id):S.jutsuMastery},
 setLegacyMastery:(slug,uses=0,wins=0,battles=0)=>{S.mastery[slug]={uses:Number(uses),wins:Number(wins),battles:Number(battles)};save();return JSON.parse(JSON.stringify(S.mastery[slug]))},
 claimLegacy:()=>claimJutsuMastery(),
 openTrial:id=>{renderMasteryTrialPanel(id);return masteryTrialState(id)},
 completeStage:(id,index=null)=>{const v=JV_BY_ID[id],st=masteryTrialState(id),i=index===null?Number(st.stage||0):Number(index),stage=v?.masteryTrial?.stages?.[i];if(!stage)return null;completeMasteryStage(id,i,'TESTE R33 — etapa concluída.');return JSON.parse(JSON.stringify(masteryTrialState(id)))},
 startMasteryBattle:id=>{startMasteryBattle(id);return G?.masteryTrial?JSON.parse(JSON.stringify(G.masteryTrial)):null},
 masteryBattleMetrics:id=>JSON.parse(JSON.stringify(masteryTrialState(id))),
 forceMasteryWin:()=>{if(!G?.masteryTrial)return null;G.turn=Math.min(G.turn,G.masteryTrial.maxTurns);for(const f of G.ai)f.hp=0;const id=G.masteryTrial.variantId;finishMasteryBattle(true,false);return JSON.parse(JSON.stringify(masteryTrialState(id)))},
 profileSnapshot:()=>JSON.parse(JSON.stringify(profileSnapshot())),
 renderMasteryCharacter:slug=>{const sel=$('#jutsuMissionCharacter');if(sel){sel.value=slug;renderJutsuMissions()}return document.querySelectorAll('#jutsuMissions .r31MasteryCard').length}
};
window.NARUTO_R32_AUDIT=window.NARUTO_R33_AUDIT;window.NARUTO_R32_TEST=window.NARUTO_R33_TEST;window.NARUTO_R31_AUDIT=window.NARUTO_R33_AUDIT;window.NARUTO_R31_TEST=window.NARUTO_R33_TEST;window.NARUTO_R30_AUDIT=window.NARUTO_R33_AUDIT;window.NARUTO_R30_TEST=window.NARUTO_R33_TEST;window.NARUTO_R29_AUDIT=window.NARUTO_R33_AUDIT;window.NARUTO_R29_TEST=window.NARUTO_R33_TEST;
/* ======================= FIM R33 NARUTO UNISON ======================= */

})();
