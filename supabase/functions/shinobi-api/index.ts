import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const C={
  'access-control-allow-origin':'*',
  'access-control-allow-headers':'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods':'GET,POST,OPTIONS',
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store',
  'x-content-type-options':'nosniff'
};
const J=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:C});
const enc=new TextEncoder();
const TOKEN_MAX=512,AUTH_BODY_MAX=16*1024,SAVE_BODY_MAX=1024*1024,EVENT_BODY_MAX=256*1024,ROOM_BODY_MAX=512*1024;
const dec64=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const b64=(b:ArrayBuffer|Uint8Array)=>{const a=b instanceof Uint8Array?b:new Uint8Array(b);let s='';for(const x of a)s+=String.fromCharCode(x);return btoa(s)};
const hex=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const random64=(n=32)=>b64(crypto.getRandomValues(new Uint8Array(n))).replace(/=+$/,'');
const userKey=(v:unknown)=>String(v||'').trim().toLowerCase().normalize('NFKC').replace(/\s+/g,'');
function pick(name:string,legacy:string){const raw=Deno.env.get(name);if(raw){try{const obj=JSON.parse(raw);return String(obj.default??Object.values(obj)[0]??'')}catch{return raw}}return Deno.env.get(legacy)??''}
const SERVICE_KEY=pick('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
const supa=()=>createClient(Deno.env.get('SUPABASE_URL')!,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});

class AppError extends Error{status:number;code:string;constructor(status:number,code:string,message:string){super(message);this.status=status;this.code=code}}
async function readBody(req:Request,max:number){
  const declared=Number(req.headers.get('content-length')||'0');
  if(Number.isFinite(declared)&&declared>max)throw new AppError(413,'BODY_TOO_LARGE','Corpo da requisição excede o limite.');
  const raw=await req.arrayBuffer();
  if(raw.byteLength>max)throw new AppError(413,'BODY_TOO_LARGE','Corpo da requisição excede o limite.');
  if(!raw.byteLength)return {} as Record<string,any>;
  try{const v=JSON.parse(new TextDecoder().decode(raw));if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('object');return v as Record<string,any>}
  catch{throw new AppError(400,'INVALID_JSON','JSON inválido.')}
}
async function derive(password:string,saltB64:string,iterations:number,hash:'SHA-1'|'SHA-256'='SHA-256'){
  const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
  return b64(await crypto.subtle.deriveBits({name:'PBKDF2',salt:dec64(saltB64),iterations,hash},key,256));
}
function safeEq(a:string,b:string){if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
function validSlot(s:string){return s.length>=1&&s.length<=128&&!/[\u0000-\u001f\u007f]/.test(s)}
function clientIp(req:Request){return String(req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||(req.headers.get('x-forwarded-for')||'').split(',')[0]||'').trim().slice(0,128)}
async function ratePreAuth(db:any,bucket:string,action:string,limit:number,windowMs:number){
  if(!bucket)return false;
  const {error:ins}=await db.from('sns_auth_rate_limit_events').insert({bucket_key:bucket,action});if(ins)throw new AppError(503,'RATE_LIMIT_UNAVAILABLE','Controle de frequência indisponível.');
  const cutoff=new Date(Date.now()-windowMs).toISOString();
  const {count,error}=await db.from('sns_auth_rate_limit_events').select('id',{count:'exact',head:true}).eq('bucket_key',bucket).eq('action',action).gte('created_at',cutoff);
  if(error)throw new AppError(503,'RATE_LIMIT_UNAVAILABLE','Controle de frequência indisponível.');
  return Number(count||0)>limit;
}
async function rateAccount(db:any,accountId:string,action:string,limit:number,windowMs:number){
  const {error:ins}=await db.from('sns_rate_limit_events').insert({account_id:accountId,action});if(ins)throw new AppError(503,'RATE_LIMIT_UNAVAILABLE','Controle de frequência indisponível.');
  const cutoff=new Date(Date.now()-windowMs).toISOString();
  const {count,error}=await db.from('sns_rate_limit_events').select('id',{count:'exact',head:true}).eq('account_id',accountId).eq('action',action).gte('created_at',cutoff);
  if(error)throw new AppError(503,'RATE_LIMIT_UNAVAILABLE','Controle de frequência indisponível.');
  return Number(count||0)>limit;
}
async function accountFromToken(req:Request){
  const raw=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
  if(!raw||raw.length>TOKEN_MAX)return null;const tokenHash=await hex(raw),db=supa();
  const {data:s,error}=await db.from('sns_sessions').select('account_id,expires_at').eq('token_hash',tokenHash).maybeSingle();
  if(error||!s||Date.parse(s.expires_at)<=Date.now())return null;
  await db.from('sns_sessions').update({last_seen_at:new Date().toISOString()}).eq('token_hash',tokenHash);
  const {data:a}=await db.from('sns_accounts').select('id,username,display_name,leon_entitled').eq('id',s.account_id).maybeSingle();
  return a||null;
}
async function issueSession(accountId:string){
  const raw=random64(36),tokenHash=await hex(raw),expires=new Date(Date.now()+1000*60*60*24*30).toISOString();
  const {error}=await supa().from('sns_sessions').insert({token_hash:tokenHash,account_id:accountId,expires_at:expires});if(error)throw error;
  return {token:raw,expires_at:expires};
}
async function legacyBanned(key:string){const {data,error}=await supa().from('naruto_accounts').select('banned').eq('user_key',key).maybeSingle();if(error)throw error;return !!data?.banned}
async function importLegacyIfValid(username:string,password:string){
  const db=supa(),key=userKey(username);const {data:l,error:legacyError}=await db.from('naruto_accounts').select('user_name,user_key,kdf,iterations,salt,pass_hash,banned,ban_saved_pass_hash').eq('user_key',key).maybeSingle();
  if(legacyError)throw legacyError;if(!l)return {account:null,banned:false};
  const algo=String(l.kdf||'').toLowerCase().includes('sha1')?'SHA-1':'SHA-256',iterations=Math.min(1000000,Math.max(10000,Number(l.iterations||120000)));
  const got=await derive(password,l.salt,iterations,algo),expected=String(l.banned?(l.ban_saved_pass_hash||''):(l.pass_hash||''));
  if(!expected||!safeEq(got,expected))return {account:null,banned:false};if(l.banned)return {account:null,banned:true};
  const salt=random64(18),newIterations=210000,passHash=await derive(password,salt,newIterations,'SHA-256');
  const {data:a,error}=await db.from('sns_accounts').insert({username:l.user_name||username,username_key:key,display_name:l.user_name||username,password_salt:salt,password_hash:passHash,password_iterations:newIterations,leon_entitled:key==='kaalflash'}).select('id,username,display_name,leon_entitled').single();
  if(error)throw error;return {account:a,banned:false};
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('',{status:204,headers:C});
  const u=new URL(req.url),route=u.pathname.replace(/^.*\/shinobi-api/,'')||'/';
  try{
    if(route==='/'||route==='/health')return req.method==='GET'?J({ok:true,service:'shinobi-api',version:'R39.1-online',pcRequired:false}):J({ok:false,error:'Método não permitido.'},405);
    if(route==='/register'){
      if(req.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      const b=await readBody(req,AUTH_BODY_MAX),username=String(b.username||'').trim(),key=userKey(username),password=String(b.password||''),display=String(b.displayName||username).trim();
      if(username.length>80||key.length<3||key.length>40)return J({ok:false,error:'Usuário deve ter 3 a 40 caracteres.'},400);
      if(password.length<8||password.length>256)return J({ok:false,error:'Senha deve ter 8 a 256 caracteres.'},400);
      if(!display||display.length>80)return J({ok:false,error:'Nome de exibição inválido.'},400);
      const db=supa(),userBucket=await hex('register-user:'+key),ip=clientIp(req),ipBucket=ip?await hex('register-ip:'+ip):'';
      if(await ratePreAuth(db,userBucket,'register_user',4,3600000)||(ipBucket&&await ratePreAuth(db,ipBucket,'register_ip',8,3600000)))return J({ok:false,error:'Muitas tentativas. Aguarde antes de registrar novamente.'},429);
      const {data:exists}=await db.from('sns_accounts').select('id').eq('username_key',key).maybeSingle();if(exists)return J({ok:false,error:'Usuário já existe.'},409);
      const {data:legacy}=await db.from('naruto_accounts').select('id').eq('user_key',key).maybeSingle();if(legacy)return J({ok:false,error:'Conta antiga encontrada. Use Entrar para migrá-la com sua senha existente.'},409);
      const salt=random64(18),iterations=210000,passHash=await derive(password,salt,iterations,'SHA-256');
      const {data:a,error}=await db.from('sns_accounts').insert({username,username_key:key,display_name:display,password_salt:salt,password_hash:passHash,password_iterations:iterations}).select('id,username,display_name,leon_entitled').single();if(error)throw error;
      const s=await issueSession(a.id);return J({ok:true,account:a,...s});
    }
    if(route==='/login'){
      if(req.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      const b=await readBody(req,AUTH_BODY_MAX),username=String(b.username||'').trim(),key=userKey(username),password=String(b.password||'');
      if(username.length>80||key.length<3||key.length>40||!password)return J({ok:false,error:'Usuário e senha são obrigatórios.'},400);
      if(password.length>256)return J({ok:false,error:'Usuário ou senha inválidos.'},401);
      const db=supa(),userBucket=await hex('login-user:'+key),ip=clientIp(req),ipBucket=ip?await hex('login-ip:'+ip):'';
      if(await ratePreAuth(db,userBucket,'login_user',12,300000)||(ipBucket&&await ratePreAuth(db,ipBucket,'login_ip',40,300000)))return J({ok:false,error:'Muitas tentativas. Aguarde antes de entrar novamente.'},429);
      let {data:a}=await db.from('sns_accounts').select('id,username,display_name,leon_entitled,password_salt,password_hash,password_iterations').eq('username_key',key).maybeSingle();
      if(!a){const imported=await importLegacyIfValid(username,password);if(imported.banned)return J({ok:false,error:'Conta banida.'},403);if(!imported.account)return J({ok:false,error:'Usuário ou senha inválidos.'},401);a=imported.account as any}
      else{const got=await derive(password,a.password_salt,Math.min(1000000,Math.max(10000,Number(a.password_iterations||210000))),'SHA-256');if(!safeEq(got,String(a.password_hash||'')))return J({ok:false,error:'Usuário ou senha inválidos.'},401);if(await legacyBanned(key))return J({ok:false,error:'Conta banida.'},403)}
      const s=await issueSession(a.id),{data:chars}=await db.from('sns_characters').select('id,slot_key,name,is_leon,revision,updated_at').eq('account_id',a.id).order('updated_at',{ascending:false});
      return J({ok:true,account:{id:a.id,username:a.username,display_name:a.display_name,leon_entitled:!!a.leon_entitled},characters:chars||[],...s});
    }
    if(route==='/logout'){
      if(req.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      const raw=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();if(raw&&raw.length<=TOKEN_MAX)await supa().from('sns_sessions').delete().eq('token_hash',await hex(raw));return J({ok:true});
    }
    const account=await accountFromToken(req);if(!account)return J({ok:false,error:'Sessão inválida ou expirada.'},401);const db=supa();
    if(route==='/characters'){
      if(req.method!=='GET')return J({ok:false,error:'Método não permitido.'},405);
      const {data,error}=await db.from('sns_characters').select('id,slot_key,name,is_leon,state,revision,updated_at').eq('account_id',account.id).order('updated_at',{ascending:false});if(error)throw error;return J({ok:true,characters:data||[]});
    }
    if(route==='/save'){
      if(req.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      if(await rateAccount(db,account.id,'character_save',30,60000))return J({ok:false,error:'Muitos salvamentos em pouco tempo.'},429);
      const b=await readBody(req,SAVE_BODY_MAX),slot=String(b.slotKey||b.slot_key||'').trim(),state=b.state&&typeof b.state==='object'&&!Array.isArray(b.state)?b.state:{},isLeon=!!(b.isLeon||state?.character?.privateCharacter==='leon');
      if(!validSlot(slot))return J({ok:false,error:'slotKey inválido.'},400);if(isLeon&&!account.leon_entitled)return J({ok:false,error:'Leon não pertence a esta conta.'},403);
      const name=String(b.name||state?.character?.name||(isLeon?'Leon Kosmo':'Shinobi')).slice(0,80),{data:old}=await db.from('sns_characters').select('revision').eq('account_id',account.id).eq('slot_key',slot).maybeSingle(),rev=Number(old?.revision||0)+1;
      const {data,error}=await db.from('sns_characters').upsert({account_id:account.id,slot_key:slot,name,is_leon:isLeon,state,revision:rev,updated_at:new Date().toISOString()},{onConflict:'account_id,slot_key'}).select('id,slot_key,name,is_leon,revision,updated_at').single();if(error)throw error;return J({ok:true,character:data});
    }
    if(route==='/event'){
      if(req.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      if(await rateAccount(db,account.id,'world_event',60,60000))return J({ok:false,error:'Muitos eventos em pouco tempo.'},429);
      const b=await readBody(req,EVENT_BODY_MAX),slot=String(b.slotKey||'').trim();let characterId:string|undefined;
      if(slot){if(!validSlot(slot))return J({ok:false,error:'slotKey inválido.'},400);const {data:c}=await db.from('sns_characters').select('id').eq('account_id',account.id).eq('slot_key',slot).maybeSingle();if(c)characterId=c.id}
      const campaignKey=String(b.campaignKey||'').slice(0,120),arcKey=String(b.arcKey||'').slice(0,120),contentType=String(b.contentType||'SCENE').slice(0,64),eventType=String(b.eventType||'GAME_EVENT').slice(0,64);
      const {data,error}=await db.from('sns_world_events').insert({account_id:account.id,character_id:characterId||null,campaign_key:campaignKey,arc_key:arcKey,content_type:contentType,event_type:eventType,payload:b.payload??{}}).select('id,created_at').single();if(error)throw error;return J({ok:true,event:data});
    }
    if(route==='/events'){
      if(req.method!=='GET')return J({ok:false,error:'Método não permitido.'},405);
      const limit=Math.min(100,Math.max(1,Number(u.searchParams.get('limit')||40))),campaign=String(u.searchParams.get('campaignKey')||'').slice(0,120);let q=db.from('sns_world_events').select('id,campaign_key,arc_key,content_type,event_type,payload,created_at').eq('account_id',account.id).order('id',{ascending:false}).limit(limit);if(campaign)q=q.eq('campaign_key',campaign);const {data,error}=await q;if(error)throw error;return J({ok:true,events:data||[]});
    }
    if(route==='/room'&&req.method==='POST'){
      if(await rateAccount(db,account.id,'room_state',30,60000))return J({ok:false,error:'Muitas atualizações de sala em pouco tempo.'},429);
      const b=await readBody(req,ROOM_BODY_MAX),code=String(b.code||'').trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,24),state=b.state&&typeof b.state==='object'&&!Array.isArray(b.state)?b.state:{};
      if(code.length<12)return J({ok:false,error:'Código de sala inválido.'},400);
      const {data:old}=await db.from('sns_rooms').select('revision,owner_account_id').eq('code',code).maybeSingle();if(old?.owner_account_id&&old.owner_account_id!==account.id)return J({ok:false,error:'Sala pertence a outra conta.'},403);
      const rev=Number(old?.revision||0)+1,{data,error}=await db.from('sns_rooms').upsert({code,owner_account_id:account.id,state,revision:rev,updated_at:new Date().toISOString()}).select('code,state,revision,updated_at').single();if(error)throw error;
      const {error:memberError}=await db.from('sns_room_members').upsert({room_code:code,account_id:account.id,last_seen_at:new Date().toISOString()},{onConflict:'room_code,account_id'});if(memberError)throw memberError;return J({ok:true,room:data});
    }
    if(route==='/room'&&req.method==='GET'){
      const code=String(u.searchParams.get('code')||'').trim().toUpperCase().slice(0,24);if(!code)return J({ok:true,room:null});
      const {data,error}=await db.from('sns_rooms').select('code,state,revision,updated_at,owner_account_id').eq('code',code).maybeSingle();if(error)throw error;if(!data)return J({ok:true,room:null});
      if(data.owner_account_id!==account.id){const {data:membership,error:memberError}=await db.from('sns_room_members').select('account_id').eq('room_code',code).eq('account_id',account.id).maybeSingle();if(memberError)throw memberError;if(!membership)return J({ok:false,error:'Entre na sala antes de acessar este recurso.'},403)}
      const {owner_account_id,...room}=data;return J({ok:true,room});
    }
    return J({ok:false,error:'Rota não encontrada.'},404);
  }catch(e){
    if(e instanceof AppError)return J({ok:false,code:e.code,error:e.message},e.status);
    console.error('shinobi-api',e);return J({ok:false,error:'Falha interna do serviço online.'},500);
  }
});
