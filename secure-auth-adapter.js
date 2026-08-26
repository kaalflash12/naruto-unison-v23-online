(()=>{
  'use strict';
  const cfg=window.NARUTO_ONLINE_CONFIG||{};
  const SB_URL=String(cfg.supabaseUrl||'https://cpdgkszviwrgrwsltbyk.supabase.co').replace(/\/$/,'');
  const PUB=String(cfg.publishableKey||'sb_publishable_KGkT_uJNg1nRBgftEvlT3w_c_aHOo5K');
  const BRIDGE=String(cfg.authBridgeUrl||`${SB_URL}/functions/v1/legacy-auth-bridge`).replace(/\/$/,'');
  const SDK='2.112.3';
  const REF='cpdgkszviwrgrwsltbyk';
  const AUTH_STORAGE=`sb-${REF}-auth-token`;
  const LEGACY_STORAGE='naruto_unison_ptbr_online_session_v1';
  const REAUTH_FLAG='naruto_secure_reauth_v1';
  const baseFetch=window.fetch.bind(window);
  let clientPromise=null;

  function forceOneTimeReauth(){
    try{
      const legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE)||'{}');
      if(legacy?.token&&!localStorage.getItem(AUTH_STORAGE)){
        legacy.token=null;legacy.room=null;legacy.role=null;legacy.resultRoom=null;legacy.revision=0;
        localStorage.setItem(LEGACY_STORAGE,JSON.stringify(legacy));
        sessionStorage.setItem(REAUTH_FLAG,'1');
      }
    }catch(_){ }
  }
  forceOneTimeReauth();

  function loadClient(){
    if(clientPromise)return clientPromise;
    clientPromise=new Promise((resolve,reject)=>{
      const make=()=>{
        try{resolve(window.supabase.createClient(SB_URL,PUB,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}))}
        catch(e){reject(e)}
      };
      if(window.supabase?.createClient)return make();
      const existing=document.querySelector('script[data-nu-supabase-sdk="1"]');
      if(existing){existing.addEventListener('load',make,{once:true});existing.addEventListener('error',()=>reject(new Error('Falha ao carregar autenticação segura.')),{once:true});return}
      const s=document.createElement('script');s.dataset.nuSupabaseSdk='1';s.src=`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@${SDK}/dist/umd/supabase.min.js`;s.onload=make;s.onerror=()=>reject(new Error('Falha ao carregar autenticação segura.'));document.head.appendChild(s);
    });
    return clientPromise;
  }

  function requestPath(input){try{return new URL(typeof input==='string'?input:input?.url||'',location.href).pathname}catch{return''}}
  function parseBody(init){if(!init||typeof init.body!=='string')return null;try{const b=JSON.parse(init.body);return b&&typeof b==='object'&&!Array.isArray(b)?b:null}catch{return null}}
  function isLegacyLogin(path){return /\/api\/account\/(?:login|register)$/.test(path)}
  async function exchange(token,password){
    const r=await baseFetch(`${BRIDGE}/exchange`,{method:'POST',headers:{'content-type':'application/json','apikey':PUB},body:JSON.stringify({token,password}),cache:'no-store'});
    const b=await r.json().catch(()=>({}));
    if(!r.ok||!b?.ok||!b?.session?.access_token||!b?.session?.refresh_token){const e=new Error(b?.error||'Não foi possível iniciar a sessão segura.');e.status=r.status||503;throw e}
    const c=await loadClient();
    const {data,error}=await c.auth.setSession({access_token:b.session.access_token,refresh_token:b.session.refresh_token});
    if(error||!data?.session)throw error||new Error('A sessão segura não pôde ser persistida.');
    sessionStorage.removeItem(REAUTH_FLAG);
    window.dispatchEvent(new CustomEvent('naruto:secure-auth',{detail:{username:b.username||null,migrated:!!b.migrated}}));
    return data.session;
  }

  window.fetch=async function(input,init){
    const path=requestPath(input);
    if(!isLegacyLogin(path))return baseFetch(input,init);
    const reqBody=parseBody(init);
    const response=await baseFetch(input,init);
    if(!response.ok||!reqBody?.pass)return response;
    const legacy=await response.clone().json().catch(()=>null);
    if(!legacy?.ok||!legacy?.token)return response;
    try{await exchange(String(legacy.token),String(reqBody.pass));return response}
    catch(e){
      console.error('secure auth cutover failed',e?.message||e);
      const status=Number(e?.status||503);return new Response(JSON.stringify({ok:false,error:e?.message||'Não foi possível iniciar a sessão segura.'}),{status:status>=400&&status<=599?status:503,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})
    }
  };

  async function getSession(){const c=await loadClient();const {data,error}=await c.auth.getSession();if(error)throw error;return data?.session||null}
  async function signOut(){try{const c=await loadClient();await c.auth.signOut()}catch(_){}}
  async function functionFetch(name,path='',options={}){
    const session=await getSession();if(!session?.access_token)throw new Error('Sessão segura ausente. Entre novamente.');
    const method=options.method||((options.body===undefined)?'GET':'POST');
    const headers={...(options.headers||{}),'apikey':PUB,'authorization':`Bearer ${session.access_token}`};
    let body=options.body;if(body!==undefined&&typeof body!=='string'){headers['content-type']='application/json';body=JSON.stringify(body)}
    return baseFetch(`${SB_URL}/functions/v1/${name}${path}`,{...options,method,headers,body,cache:options.cache||'no-store'});
  }
  window.NarutoSecureAuth={loadClient,getSession,signOut,functionFetch,supabaseUrl:SB_URL,publishableKey:PUB};

  document.addEventListener('click',e=>{const el=e.target?.closest?.('#logoutAccount,#onlineLogout');if(el)signOut()});
  document.addEventListener('DOMContentLoaded',()=>{if(sessionStorage.getItem(REAUTH_FLAG)==='1')setTimeout(()=>{const m=document.getElementById('authMsg');if(m)m.textContent='Atualização de segurança: entre novamente uma vez para vincular sua sessão ao novo backend.'},0)},{once:true});
})();