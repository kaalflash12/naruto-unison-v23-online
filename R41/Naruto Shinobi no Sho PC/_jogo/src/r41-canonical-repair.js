(function(){
  "use strict";
  window.__R41_CANONICAL_REPAIR__ = true;
  try{
    const v=window.NARUTO_V7;
    if(v&&Array.isArray(v.npcs)){
      const byId=Object.fromEntries(v.npcs.map(x=>[x.id,x]));
      Object.assign(byId.folha_instrutor||{}, {nome:'Iruka Umino',papel:'Academia • treino',acao:'treino',fala:'Fundamentos, controle e preparação de missão.',art:'assets/r40/atlas_verified/iruka-umino.webp',canonicalId:'iruka_umino',serviceRole:'training'});
      Object.assign(byId.folha_balconista||{}, {nome:'Tenten',papel:'Arsenal • armas',acao:'loja',fala:'Posso orientar equipamento e ferramentas ninja; o estoque continua sendo do arsenal da vila.',art:'assets/r40/atlas_verified/tenten.webp',canonicalId:'tenten',serviceRole:'arsenal'});
      Object.assign(byId.folha_oficial||{}, {nome:'Kotetsu Hagane',papel:'Apoio do Edifício de Missões',acao:'missoes',fala:'Os contratos liberados dependem do seu rank, do estado do mundo e da equipe.',art:'assets/r40/atlas_verified/kotetsu-hagane.webp',canonicalId:'kotetsu_hagane',serviceRole:'missions'});
      Object.assign(byId.folha_medica||{}, {nome:'Shizune',papel:'Hospital • medicina',acao:'hospital',fala:'Primeiro eu avalio o ferimento. Tratamento não apaga lesão grave nem tempo decorrido.',art:'assets/r40/atlas_verified/shizune.webp',canonicalId:'shizune',serviceRole:'hospital'});
    }
  }catch(e){console.warn('R41 V7 patch',e);}
  try{
    const w=window.NARUTO_V84_WORLD;
    if(w&&Array.isArray(w.arcs)){
      let n=0;
      for(const arc of w.arcs){
        if(/CONCLUIDO|CONCLUÍDO|HISTORICO|HISTÓRICO/i.test(String(arc.status||''))){
          for(const beat of (arc.mandatoryBeats||[])){
            if(!/DONE|RESOLVED|CONCLUIDO|CONCLUÍDO|SUPERADO/i.test(String(beat.status||''))){beat.status='CONCLUIDO_OU_SUPERADO';n++;}
          }
        }
      }
      w.r41=w.r41||{};w.r41.storyConsistency={completedArcMandatoryBeatsNormalized:true,normalizedBeats:n,at:new Date().toISOString()};
    }
  }catch(e){console.warn('R41 world patch',e);}
  function slug(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
  const EXACT=Object.freeze({
    "naruto":"assets/r40/atlas_verified/naruto-uzumaki.webp",
    "naruto uzumaki":"assets/r40/atlas_verified/naruto-uzumaki.webp",
    "sasuke":"assets/r40/atlas_verified/sasuke-uchiha.webp",
    "sasuke uchiha":"assets/r40/atlas_verified/sasuke-uchiha.webp",
    "kakashi":"assets/r40/atlas_verified/kakashi-hatake.webp",
    "kakashi hatake":"assets/r40/atlas_verified/kakashi-hatake.webp",
    "orochimaru":"assets/r40/atlas_verified/orochimaru.webp",
    "dargan":"assets/final_generated/mestre_dargan_saudacao.png",
    "joana":"assets/r40/story/vila_mulher_icone.png",
    "motani":"assets/r40/story/vila_comerciante_icone.png",
    "examiner":"assets/r29/examiner.png",
    "examinador":"assets/r29/examiner.png",
    "dojutsu kugangan":"assets/r29/kugangan.png",
    "kugangan":"assets/r29/kugangan.png",
    "nukenin inimigo":"assets/r29/nukenin-inimigo.png",
    "inimigo":"assets/r29/nukenin-inimigo.png",
    "principal":"assets/r29/from_user/original_interface.png",
    "jutsus":"assets/user-provided/reference-ui/Interface de Jutsus do Naruto Unison.png",
    "mapa tatico":"assets/user-provided/maps/Mapa tático da vila ninja dourada.png"
  });
  const techniqueAliases={};
  for(const [id,file] of Object.entries(window.R41_USER_VISUALS?.techniques||{})) techniqueAliases[slug(id)]=file;
  const mapAliases={};
  const maps=window.R41_USER_VISUALS?.maps||{};
  for(const [name,file] of Object.entries(maps)) mapAliases[slug(name.replace(/\.[a-z0-9]+$/i,''))]=file;
  const mapSemantic={
    "arena":"Arena shinobi circular em planta baixa.png",
    "arena tatica":"Arena shinobi circular em planta baixa.png",
    "campo de treino":"Campo shinobi na floresta escondida.png",
    "floresta":"Campo shinobi na floresta escondida.png",
    "clareira":"Clareira ninja noturna para batalha tática.png",
    "covil":"Covil shinobi subterrâneo com selos azuis.png",
    "esconderijo":"Planta baixa do esconderijo shinobi subterrâneo.png",
    "mapa tatico":"Mapa tático da vila ninja dourada.png",
    "praca":"Praça shinobi ao entardecer.png"
  };
  for(const [alias,name] of Object.entries(mapSemantic)) if(maps[name]) mapAliases[slug(alias)]=maps[name];
  const merged=Object.assign({},EXACT,mapAliases,techniqueAliases);
  window.R41_IMAGE_ALIASES=Object.assign({},window.R41_IMAGE_ALIASES||{},merged);
  window.R41ResolveImage=function(raw){return merged[slug(raw)]||window.R41_IMAGE_ALIASES?.[slug(raw)]||"";};
  window.R41ResolveImageStrict=window.R41ResolveImage;
  window.__R41_CANONICAL_REPAIR_META__={build:"2026-08-19-integral",fallback:"disabled",aliases:Object.keys(merged).length,wrongPortraitTechniqueAliasesRemoved:true,userTechniqueAliases:Object.keys(techniqueAliases).length,userMapAliases:Object.keys(mapAliases).length};
})();
