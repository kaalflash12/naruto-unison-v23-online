(()=>{
  'use strict';

  const ADMIN_ALIAS='narutoadm';
  const OWNER_EMAIL='admin@naruto-unison.example';
  const SUPABASE_URL='https://cpdgkszviwrgrwsltbyk.supabase.co';
  const SUPABASE_KEY='sb_publishable_KGkT_uJNg1nRBgftEvlT3w_c_aHOo5K';
  const SUPABASE_JS='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  let client=null;
  let busy=false;
  let loaderPromise=null;

  const $=sel=>document.querySelector(sel);
  const adminAliasEntered=()=>String($('#authUser')?.value||'').trim().toLowerCase()===ADMIN_ALIAS;

  function setMessage(message,bad=false){
    const el=$('#authMsg');
    if(!el)return;
    el.textContent=message;
    el.classList.toggle('bad',!!bad);
  }

  function loadSupabase(){
    if(window.supabase?.createClient)return Promise.resolve(window.supabase);
    if(loaderPromise)return loaderPromise;
    loaderPromise=new Promise((resolve,reject)=>{
      const previous=document.querySelector('script[data-naruto-admin-supabase]');
      const finish=()=>window.supabase?.createClient?resolve(window.supabase):reject(new Error('Biblioteca de autenticação administrativa indisponível.'));
      if(previous){
        previous.addEventListener('load',finish,{once:true});
        previous.addEventListener('error',()=>reject(new Error('Falha ao carregar a autenticação administrativa.')),{once:true});
        return;
      }
      const script=document.createElement('script');
      script.src=SUPABASE_JS;
      script.async=true;
      script.dataset.narutoAdminSupabase='1';
      script.onload=finish;
      script.onerror=()=>reject(new Error('Falha ao carregar a autenticação administrativa.'));
      document.head.appendChild(script);
    });
    return loaderPromise;
  }

  async function getClient(){
    if(client)return client;
    const lib=await loadSupabase();
    client=lib.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return client;
  }

  async function verifyAdminSession(sb,token){
    const response=await fetch(SUPABASE_URL+'/functions/v1/admin-gameops/accounts?q='+encodeURIComponent('__narutoadm_probe__'),{
      method:'GET',
      headers:{'content-type':'application/json','apikey':SUPABASE_KEY,'authorization':'Bearer '+token}
    });
    const body=await response.json().catch(()=>({}));
    if(!response.ok||body.ok===false)throw new Error(body.error||body.code||'A conta autenticou, mas não possui acesso administrativo.');
    return true;
  }

  async function enterAdmin(){
    if(busy)return;
    const pass=String($('#authPass')?.value||'');
    if(!pass){setMessage('Digite a senha da conta administrativa.',true);return;}
    const button=$('#authLogin');
    const oldLabel=button?.textContent||'ENTRAR';
    busy=true;
    if(button){button.disabled=true;button.textContent='ABRINDO ADMIN...';}
    setMessage('Validando narutoadm no servidor...');
    try{
      const sb=await getClient();
      const {data,error}=await sb.auth.signInWithPassword({email:OWNER_EMAIL,password:pass});
      if(error||!data?.session)throw new Error(error?.message||'Senha administrativa inválida.');
      await verifyAdminSession(sb,data.session.access_token);
      setMessage('OWNER validado. Abrindo o painel administrativo...');
      location.assign('./admin.html');
    }catch(error){
      try{if(client)await client.auth.signOut();}catch(_){ }
      setMessage(error?.message||'Falha ao abrir o painel administrativo.',true);
      busy=false;
      if(button){button.disabled=false;button.textContent=oldLabel;}
    }
  }

  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target.closest('#authLogin,#authRegister'):null;
    if(!target||!adminAliasEntered())return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(target.id==='authRegister'){
      setMessage('narutoadm é o acesso administrativo reservado. Use ENTRAR com a senha OWNER.',true);
      return;
    }
    void enterAdmin();
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key!=='Enter'||event.target?.id!=='authPass'||!adminAliasEntered())return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void enterAdmin();
  },true);
})();
