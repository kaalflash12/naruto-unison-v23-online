import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors={
  'access-control-allow-origin':'*',
  'access-control-allow-headers':'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods':'GET,POST,OPTIONS',
  'content-type':'application/json; charset=utf-8'
};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const enc=new TextEncoder();
const dec64=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const b64=(b:ArrayBuffer|Uint8Array)=>{const a=b instanceof Uint8Array?b:new Uint8Array(b);let s='';for(const x of a)s+=String.fromCharCode(x);return btoa(s)};
const hex=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const random64=(n=32)=>b64(crypto.getRandomValues(new Uint8Array(n))).replace(/=+$/,'');
const userKey=(v:unknown)=>String(v||'').trim().toLowerCase().normalize('NFKC').replace(/\s+/g,'');
async function derive(password:string,saltB64:string,iterations:number,hash:'SHA-1'|'SHA-256'='SHA-256'){
  const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
  return b64(await crypto.subtle.deriveBits({name:'PBKDF2',salt:dec64(saltB64),iterations,hash},key,256));
}
function safeEq(a:string,b:string){if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
const supa=()=>createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
async function body(req:Request){try{return await req.json()}catch{return {}}}
async function accountFromToken(req:Request){
  const raw=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
  if(!raw)return null;const tokenHash=await hex(raw);const db=supa();
  const {data:s}=await db.from('sns_sessions').select('account_id,expires_at').eq('token_hash',tokenHash).maybeSingle();
  if(!s||Date.parse(s.expires_at)<=Date.now())return null;
  await db.from('sns_sessions').update({last_seen_at:new Date().toISOString()}).eq('token_hash',tokenHash);
  const {data:a}=await db.from('sns_accounts').select('id,username,display_name,leon_entitled').eq('id',s.account_id).maybeSingle();
  return a||null;
}
async function issueSession(accountId:string){const raw=random64(36),tokenHash=await hex(raw),expires=new Date(Date.now()+1000*60*60*24*30).toISOString();await supa().from('sns_sessions').insert({token_hash:tokenHash,account_id:accountId,expires_at:expires});return {token:raw,expires_at:expires}}
async function importLegacyIfValid(username:string,password:string){
  const db=supa(),key=userKey(username);const {data:l}=await db.from('naruto_accounts').select('user_name,user_key,kdf,iterations,salt,pass_hash').eq('user_key',key).maybeSingle();
  if(!l)return null;const algo=String(l.kdf||'').toLowerCase().includes('sha1')?'SHA-1':'SHA-256';const got=await derive(password,l.salt,Number(l.iterations||120000),algo);if(!safeEq(got,String(l.pass_hash||'')))return null;
  const salt=random64(18),iterations=210000,passHash=await derive(password,salt,iterations,'SHA-256');
  const {data:a,error}=await db.from('sns_accounts').insert({username:l.user_name||username,username_key:key,display_name:l.user_name||username,password_salt:salt,password_hash:passHash,password_iterations:iterations,leon_entitled:key==='kaalflash'}).select('id,username,display_name,leon_entitled').single();
  if(error)throw error;return a;
}
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('',{status:204,headers:cors});
  const u=new URL(req.url),route=u.pathname.replace(/^.*\/shinobi-api/,'')||'/';
  try{
    if(route==='/'||route==='/health')return json({ok:true,service:'shinobi-api',version:'R39-online',pcRequired:false});
    if(route==='/register'&&req.method==='POST'){
      const b=await body(req),username=String(b.username||'').trim(),key=userKey(username),password=String(b.password||''),display=String(b.displayName||username).trim();
      if(key.length<3||key.length>40)return json({ok:false,error:'Usuário deve ter 3 a 40 caracteres.'},400);if(password.length<8)return json({ok:false,error:'Senha deve ter pelo menos 8 caracteres.'},400);
      const db=supa();const {data:exists}=await db.from('sns_accounts').select('id').eq('username_key',key).maybeSingle();if(exists)return json({ok:false,error:'Usuário já existe.'},409);
      const {data:legacy}=await db.from('naruto_accounts').select('id').eq('user_key',key).maybeSingle();if(legacy)return json({ok:false,error:'Conta antiga encontrada. Use Entrar para migrá-la com sua senha existente.'},409);
      const salt=random64(18),iterations=210000,passHash=await derive(password,salt,iterations,'SHA-256');const {data:a,error}=await db.from('sns_accounts').insert({username,username_key:key,display_name:display,password_salt:salt,password_hash:passHash,password_iterations:iterations}).select('id,username,display_name,leon_entitled').single();if(error)throw error;const s=await issueSession(a.id);return json({ok:true,account:a,...s});
    }
    if(route==='/login'&&req.method==='POST'){
      const b=await body(req),username=String(b.username||'').trim(),key=userKey(username),password=String(b.password||'');
      if(key.length<3||!password)return json({ok:false,error:'Usuário e senha são obrigatórios.'},400);
      const db=supa();let {data:a}=await db.from('sns_accounts').select('id,username,display_name,leon_entitled,password_salt,password_hash,password_iterations').eq('username_key',key).maybeSingle();
      if(!a){const imported=await importLegacyIfValid(username,password);if(!imported)return json({ok:false,error:'Usuário ou senha inválidos.'},401);a=imported as any}else{const got=await derive(password,a.password_salt,Number(a.password_iterations||210000),'SHA-256');if(!safeEq(got,String(a.password_hash||'')))return json({ok:false,error:'Usuário ou senha inválidos.'},401)}
      const s=await issueSession(a.id);const {data:chars}=await db.from('sns_characters').select('id,slot_key,name,is_leon,revision,updated_at').eq('account_id',a.id).order('updated_at',{ascending:false});
      return json({ok:true,account:{id:a.id,username:a.username,display_name:a.display_name,leon_entitled:!!a.leon_entitled},characters:chars||[],...s});
    }
    if(route==='/logout'&&req.method==='POST'){
      const raw=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();if(raw)await supa().from('sns_sessions').delete().eq('token_hash',await hex(raw));return json({ok:true});
    }
    const account=await accountFromToken(req);if(!account)return json({ok:false,error:'Sessão inválida ou expirada.'},401);const db=supa();
    if(route==='/characters'&&req.method==='GET'){
      const {data,error}=await db.from('sns_characters').select('id,slot_key,name,is_leon,state,revision,updated_at').eq('account_id',account.id).order('updated_at',{ascending:false});if(error)throw error;return json({ok:true,characters:data||[]});
    }
    if(route==='/save'&&req.method==='POST'){
      const b=await body(req),slot=String(b.slotKey||b.slot_key||'').trim(),state=b.state&&typeof b.state==='object'?b.state:{},isLeon=!!(b.isLeon||state?.character?.privateCharacter==='leon');if(!slot)return json({ok:false,error:'slotKey obrigatório.'},400);if(isLeon&&!account.leon_entitled)return json({ok:false,error:'Leon não pertence a esta conta.'},403);
      const name=String(b.name||state?.character?.name||(isLeon?'Leon Kosmo':'Shinobi')).slice(0,80);const {data:old}=await db.from('sns_characters').select('revision').eq('account_id',account.id).eq('slot_key',slot).maybeSingle();const rev=Number(old?.revision||0)+1;
      const {data,error}=await db.from('sns_characters').upsert({account_id:account.id,slot_key:slot,name,is_leon:isLeon,state,revision:rev,updated_at:new Date().toISOString()},{onConflict:'account_id,slot_key'}).select('id,slot_key,name,is_leon,revision,updated_at').single();if(error)throw error;return json({ok:true,character:data});
    }
    if(route==='/event'&&req.method==='POST'){
      const b=await body(req);let characterId:String|undefined=undefined;if(b.slotKey){const {data:c}=await db.from('sns_characters').select('id').eq('account_id',account.id).eq('slot_key',String(b.slotKey)).maybeSingle();if(c)characterId=c.id}
      const {data,error}=await db.from('sns_world_events').insert({account_id:account.id,character_id:characterId||null,campaign_key:String(b.campaignKey||''),arc_key:String(b.arcKey||''),content_type:String(b.contentType||'SCENE'),event_type:String(b.eventType||'GAME_EVENT'),payload:b.payload||{}}).select('id,created_at').single();if(error)throw error;return json({ok:true,event:data});
    }
    if(route==='/events'&&req.method==='GET'){
      const limit=Math.min(100,Math.max(1,Number(u.searchParams.get('limit')||40)));const campaign=u.searchParams.get('campaignKey')||'';let q=db.from('sns_world_events').select('id,campaign_key,arc_key,content_type,event_type,payload,created_at').eq('account_id',account.id).order('id',{ascending:false}).limit(limit);if(campaign)q=q.eq('campaign_key',campaign);const {data,error}=await q;if(error)throw error;return json({ok:true,events:data||[]});
    }
    if(route==='/room'&&req.method==='POST'){
      const b=await body(req),code=String(b.code||'').trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,24);if(!code)return json({ok:false,error:'Código de sala obrigatório.'},400);const {data:old}=await db.from('sns_rooms').select('revision,owner_account_id').eq('code',code).maybeSingle();if(old?.owner_account_id&&old.owner_account_id!==account.id)return json({ok:false,error:'Sala pertence a outra conta.'},403);const rev=Number(old?.revision||0)+1;const {data,error}=await db.from('sns_rooms').upsert({code,owner_account_id:account.id,state:b.state||{},revision:rev,updated_at:new Date().toISOString()}).select('code,state,revision,updated_at').single();if(error)throw error;return json({ok:true,room:data});
    }
    if(route==='/room'&&req.method==='GET'){
      const code=String(u.searchParams.get('code')||'').trim().toUpperCase();const {data,error}=await db.from('sns_rooms').select('code,state,revision,updated_at').eq('code',code).maybeSingle();if(error)throw error;return json({ok:true,room:data||null});
    }
    return json({ok:false,error:'Rota não encontrada.'},404);
  }catch(e){console.error(e);return json({ok:false,error:'Falha interna do serviço online.'},500)}
});
