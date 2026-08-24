window.NARUTO_ONLINE_CONFIG={functionUrl:'https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/naruto-api',hosting:'github-pages',database:'supabase-postgres',version:'r33-unison-mobile-battle-guard'};

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
    if(!record){
      record={id:makeSubmissionId(),expiresAt:now+TTL_MS};
      pending.set(key,record);
    }

    body.submissionId=record.id;
    const patchedInit={...init,body:JSON.stringify(body)};
    try{
      const response=await originalFetch(input,patchedInit);
      if(response.ok) pending.delete(key);
      return response;
    }catch(error){
      record.expiresAt=Date.now()+TTL_MS;
      throw error;
    }
  };
})();

(()=>{const s=document.createElement('script');s.src='battle-mobile-guard.js?v=20260823-2117';s.async=false;document.head.appendChild(s)})();
