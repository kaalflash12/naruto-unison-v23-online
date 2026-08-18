(function(){
  // R41 canonical-service repair without replacing the giant V7 catalog.
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
})();
