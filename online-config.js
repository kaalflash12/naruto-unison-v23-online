window.NARUTO_ONLINE_CONFIG={functionUrl:'https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/naruto-api',hosting:'github-pages',database:'supabase-postgres',version:'online'};

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

(()=>{
  document.title='Naruto Unison PT-BR';
  const clean=()=>{
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){let t=n.nodeValue||'';t=t.replace(/\s*•?\s*V23\.17\s+R33\s+NARUTO\s+UNISON/gi,'').replace(/\bV23\.17\s+R33\b/gi,'').replace(/\bR33\b/gi,'');n.nodeValue=t.replace(/\s+•\s*$/,'').replace(/•\s*•/g,'•');}
  };
  if(document.body)clean(); else document.addEventListener('DOMContentLoaded',clean,{once:true});
  const recovery=document.createElement('script');recovery.src='account-recovery.js?v=20260824';recovery.async=false;document.head.appendChild(recovery);
  const guard=document.createElement('script');guard.src='battle-mobile-guard.js?v=20260823-2117';guard.async=false;document.head.appendChild(guard);
})();
