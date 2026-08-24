(()=>{
  'use strict';
  const SUPABASE_URL='https://cpdgkszviwrgrwsltbyk.supabase.co';
  const PUBLISHABLE_KEY='sb_publishable_KGkT_uJNg1nRBgftEvlT3w_c_aHOo5K';
  const BASE=(location.pathname.endsWith('/')?location.pathname:location.pathname.replace(/[^/]*$/,''));
  const RECOVERY_URL=location.origin+BASE+'recovery.html';
  let clientPromise=null;

  function cleanRevisionLabels(){
    document.title='Naruto Unison PT-BR';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    for(const n of nodes){
      let t=n.nodeValue||'';
      t=t.replace(/\s*•?\s*V23\.17\s+R33\s+NARUTO\s+UNISON/gi,'');
      t=t.replace(/\bV23\.17\s+R33\b/gi,'');
      t=t.replace(/\bR33\b/gi,'');
      n.nodeValue=t.replace(/\s+•\s*$/,'').replace(/•\s*•/g,'•');
    }
  }

  function loadSupabase(){
    if(window.supabase?.createClient) return Promise.resolve(window.supabase.createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
    if(clientPromise) return clientPromise;
    clientPromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload=()=>resolve(window.supabase.createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
      s.onerror=()=>reject(new Error('Não foi possível carregar o módulo de recuperação.'));
      document.head.appendChild(s);
    });
    return clientPromise;
  }

  function msg(text,bad=false){
    const el=document.getElementById('authMsg'); if(!el)return;
    el.textContent=text; el.style.color=bad?'#ffb3b3':'';
  }

  function modal(title,fields,submitLabel,onSubmit){
    document.getElementById('nuRecoveryModal')?.remove();
    const wrap=document.createElement('div'); wrap.id='nuRecoveryModal';
    wrap.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:18px';
    const card=document.createElement('section');
    card.style.cssText='width:min(520px,100%);background:#17100a;color:#f5ead8;border:1px solid #7f5d3a;border-radius:14px;padding:20px;box-shadow:0 20px 70px #000';
    card.innerHTML=`<h2 style="margin:0 0 8px">${title}</h2><div class="nuFields"></div><p class="nuModalMsg" style="min-height:22px;color:#d7c4a9"></p><div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" class="nuCancel">CANCELAR</button><button type="button" class="nuSubmit">${submitLabel}</button></div>`;
    const box=card.querySelector('.nuFields');
    for(const f of fields){
      const lab=document.createElement('label'); lab.style.cssText='display:block;margin:10px 0;font-size:13px'; lab.textContent=f.label;
      const input=document.createElement('input'); input.id=f.id; input.type=f.type||'text'; input.value=f.value||''; input.autocomplete=f.autocomplete||'off'; input.placeholder=f.placeholder||'';
      input.style.cssText='display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:11px;border-radius:8px;border:1px solid #755a3c;background:#0e0b08;color:#fff';
      lab.appendChild(input); box.appendChild(lab);
    }
    wrap.appendChild(card); document.body.appendChild(wrap);
    card.querySelector('.nuCancel').onclick=()=>wrap.remove();
    const submit=card.querySelector('.nuSubmit'), status=card.querySelector('.nuModalMsg');
    submit.onclick=async()=>{
      const values={}; for(const f of fields) values[f.id]=card.querySelector('#'+f.id).value;
      submit.disabled=true; status.textContent='Processando...';
      try{const result=await onSubmit(values,status); if(result!==false)wrap.remove();}
      catch(e){status.textContent=e?.message||'Falha na operação.'; status.style.color='#ffb3b3';}
      finally{submit.disabled=false;}
    };
  }

  async function claim(client,session,user,password){
    const r=await fetch(SUPABASE_URL+'/functions/v1/account-migration/claim',{
      method:'POST',headers:{'content-type':'application/json','apikey':PUBLISHABLE_KEY,'authorization':'Bearer '+session.access_token},body:JSON.stringify({user,password})
    });
    const body=await r.json().catch(()=>({}));
    if(!r.ok||!body.ok) throw new Error(body.error||'Não foi possível vincular a conta antiga.');
    return body;
  }

  async function activateRecovery(){
    const legacyUser=document.getElementById('authUser')?.value?.trim()||'';
    const legacyPass=document.getElementById('authPass')?.value||'';
    modal('Ativar recuperação por e-mail',[
      {id:'legacyUser',label:'Usuário atual do jogo',value:legacyUser,autocomplete:'username'},
      {id:'legacyPass',label:'Senha atual do jogo',type:'password',value:legacyPass,autocomplete:'current-password'},
      {id:'email',label:'E-mail de recuperação',type:'email',autocomplete:'email'},
      {id:'authPass',label:'Senha de recuperação (mínimo 8 caracteres)',type:'password',autocomplete:'new-password'}
    ],'ATIVAR',async(v,status)=>{
      if(v.legacyUser.trim().length<3||!v.legacyPass) throw new Error('Informe o usuário e a senha atuais do jogo.');
      if(!/^\S+@\S+\.\S+$/.test(v.email)) throw new Error('Informe um e-mail válido.');
      if(v.authPass.length<8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
      const client=await loadSupabase();
      const {data,error}=await client.auth.signUp({email:v.email.trim().toLowerCase(),password:v.authPass,options:{emailRedirectTo:RECOVERY_URL}});
      if(error) throw error;
      if(data.session){
        await claim(client,data.session,v.legacyUser.trim(),v.legacyPass);
        await client.auth.signOut();
        msg('Recuperação ativada. Agora você pode redefinir a senha pelo e-mail.');
        status.textContent='Recuperação ativada.';
        return true;
      }
      status.textContent='Confira seu e-mail. Abra o link de confirmação e finalize a vinculação na página que será aberta.';
      status.style.color='#d7c4a9';
      msg('E-mail de confirmação enviado. Finalize a ativação pelo link recebido.');
      return false;
    });
  }

  async function forgotPassword(){
    modal('Recuperar senha',[{id:'email',label:'E-mail de recuperação',type:'email',autocomplete:'email'}],'ENVIAR LINK',async(v,status)=>{
      if(!/^\S+@\S+\.\S+$/.test(v.email)) throw new Error('Informe um e-mail válido.');
      const client=await loadSupabase();
      const {error}=await client.auth.resetPasswordForEmail(v.email.trim().toLowerCase(),{redirectTo:RECOVERY_URL});
      if(error) throw error;
      status.textContent='Se o e-mail estiver vinculado a uma conta, o link de recuperação será enviado.';
      msg('Pedido de recuperação enviado. Verifique seu e-mail.');
      return false;
    });
  }

  function install(){
    cleanRevisionLabels();
    const actions=document.querySelector('.authActions');
    if(!actions||document.getElementById('authRecovery'))return;
    const activate=document.createElement('button'); activate.type='button'; activate.id='authRecoveryActivate'; activate.textContent='ATIVAR RECUPERAÇÃO'; activate.onclick=activateRecovery;
    const forgot=document.createElement('button'); forgot.type='button'; forgot.id='authRecovery'; forgot.textContent='ESQUECI MINHA SENHA'; forgot.onclick=forgotPassword;
    actions.append(activate,forgot);
    const style=document.createElement('style'); style.textContent='.authActions{flex-wrap:wrap}.authActions #authRecoveryActivate,.authActions #authRecovery{font-size:12px;opacity:.95}'; document.head.appendChild(style);
  }

  window.NarutoRecovery={activateRecovery,forgotPassword,cleanRevisionLabels};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true}); else install();
})();
