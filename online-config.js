window.NARUTO_ONLINE_CONFIG={functionUrl:'https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/naruto-api',hosting:'github-pages',database:'supabase-postgres',version:'online-r39'};

(()=>{
  const originalFetch=window.fetch.bind(window);
  const pending=new Map();
  const TTL_MS=5*60*1000;

  function makeSubmissionId(){
    if(window.crypto&&typeof window.crypto.randomUUID==='function') return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
      const r=Math.random()*16|0;
      const v=c==='x'?r:(r&0x3|0x8);
      return v.toString(16);
    });
  }

  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(!url.includes('/api/room/submit')||!init||typeof init.body!=='string') return originalFetch(input,init);

    let body;
    try{body=JSON.parse(init.body);}catch{return originalFetch(input,init);}
    if(!body||typeof body!=='object'||body.submissionId) return originalFetch(input,init);

    const now=Date.now();
    for(const [key,value] of pending){if(value.expiresAt<=now) pending.delete(key);}

    const key=JSON.stringify(body);
    let record=pending.get(key);
    if(!record){record={id:makeSubmissionId(),expiresAt:now+TTL_MS};pending.set(key,record);}
    body.submissionId=record.id;
    const patchedInit={...init,body:JSON.stringify(body)};
    try{const response=await originalFetch(input,patchedInit);if(response.ok)pending.delete(key);return response;}
    catch(error){record.expiresAt=Date.now()+TTL_MS;throw error;}
  };
})();

/* R39 — Provas de Domínio: continuam sendo provas reais, mas sem reflexo de e-sport ou punição absurda. */
(()=>{
  const variants=Array.isArray(window.NARUTO_JUTSU_VARIANTS)?window.NARUTO_JUTSU_VARIANTS:[];
  for(const v of variants){
    const trial=v?.masteryTrial;if(!trial||!Array.isArray(trial.stages))continue;
    for(const stage of trial.stages){
      const mech=String(stage?.mechanic||'');
      if(mech==='precision'){
        stage.hits=Math.min(2,Math.max(1,Number(stage.hits||2)));
        stage.seconds=Math.max(24,Number(stage.seconds||0));
      }
      if(mech==='timing'){
        /* a janela de ~0,5 s era a parte humanamente impraticável em touch/PC; vira precisão assistida */
        stage.originalMechanic='timing';
        stage.mechanic='precision';
        stage.hits=1;
        stage.seconds=Math.max(26,Number(stage.seconds||0));
        stage.prompt=(stage.prompt||'Reaja ao selo correto.')+' A janela de reação foi ampliada: acerte o alvo uma vez dentro do tempo.';
      }
      if(mech==='sequence'||mech==='seal'){
        if(Array.isArray(stage.sequence)&&stage.sequence.length>2)stage.sequence=stage.sequence.slice(0,2);
        if(Array.isArray(stage.distractors))stage.distractors=[];
      }
      if(mech==='identify'&&Array.isArray(stage.signatures)&&stage.signatures.length>3){
        const correct=stage.signatures.find(x=>x?.correct);
        const others=stage.signatures.filter(x=>!x?.correct).slice(0,correct?2:3);
        stage.signatures=correct?[correct,...others]:others;
      }
      if(mech==='stabilize'||mech==='control')stage.tolerance=Math.max(20,Number(stage.tolerance||0));
      if(mech==='battle')stage.maxTurns=Math.max(20,Number(stage.maxTurns||0));
    }
  }
})();

(()=>{
  document.title='Naruto Unison PT-BR';
  const clean=()=>{
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){let t=n.nodeValue||'';t=t.replace(/\s*•?\s*V23\.17\s+R33\s+NARUTO\s+UNISON/gi,'').replace(/\bV23\.17\s+R33\b/gi,'').replace(/\bR33\b/gi,'');n.nodeValue=t.replace(/\s+•\s*$/,'').replace(/•\s*•/g,'•');}
  };
  if(document.body)clean(); else document.addEventListener('DOMContentLoaded',clean,{once:true});

  const css=document.createElement('link');css.rel='stylesheet';css.href='desktop-overhaul.css?v=20260824-3';document.head.appendChild(css);
  const r39css=document.createElement('link');r39css.rel='stylesheet';r39css.href='r39-live-hotfix.css?v=20260824-1758';document.head.appendChild(r39css);

  const recovery=document.createElement('script');recovery.src='account-recovery.js?v=20260824';recovery.async=false;document.head.appendChild(recovery);
  const guard=document.createElement('script');guard.src='battle-mobile-guard.js?v=20260824-3';guard.async=false;document.head.appendChild(guard);
  const desktop=document.createElement('script');desktop.src='desktop-overhaul.js?v=20260824-3';desktop.async=false;document.head.appendChild(desktop);
  const r39=document.createElement('script');r39.src='r39-live-hotfix.js?v=20260824-1758';r39.async=false;document.head.appendChild(r39);
})();
