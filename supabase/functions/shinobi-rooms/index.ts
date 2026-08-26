import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const C={
  'access-control-allow-origin':'*',
  'access-control-allow-headers':'authorization, content-type, apikey, x-client-info',
  'access-control-allow-methods':'GET,POST,OPTIONS',
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store',
  'x-content-type-options':'nosniff'
};
const J=(x:unknown,s=200)=>new Response(JSON.stringify(x),{status:s,headers:C});
const E=new TextEncoder();
const TOKEN_MAX=512,ROOM_BODY_MAX=256*1024,MESSAGE_BODY_MAX=16*1024,ROOM_ID_MAX=64;
function pick(name:string,legacy:string){const raw=Deno.env.get(name);if(raw){try{const obj=JSON.parse(raw);return String(obj.default??Object.values(obj)[0]??'')}catch{return raw}}return Deno.env.get(legacy)??''}
const SERVICE_KEY=pick('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
const H=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',E.encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const DB=()=>createClient(Deno.env.get('SUPABASE_URL')!,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
class AppError extends Error{status:number;code:string;constructor(status:number,code:string,message:string){super(message);this.status=status;this.code=code}}
async function body(r:Request,max:number){const declared=Number(r.headers.get('content-length')||'0');if(Number.isFinite(declared)&&declared>max)throw new AppError(413,'BODY_TOO_LARGE','Corpo da requisição excede o limite.');const raw=await r.arrayBuffer();if(raw.byteLength>max)throw new AppError(413,'BODY_TOO_LARGE','Corpo da requisição excede o limite.');if(!raw.byteLength)return{};try{const v=JSON.parse(new TextDecoder().decode(raw));if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('object');return v}catch{throw new AppError(400,'INVALID_JSON','JSON inválido.')}}
async function auth(r:Request){const raw=(r.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();if(!raw||raw.length>TOKEN_MAX)return null;const {data:s,error}=await DB().from('sns_sessions').select('account_id,expires_at').eq('token_hash',await H(raw)).maybeSingle();if(error||!s||Date.parse(s.expires_at)<=Date.now())return null;return{id:String(s.account_id)}}
const code=()=>{const b=crypto.getRandomValues(new Uint8Array(9));return 'ROOM-'+Array.from(b,x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()};
function validRoomId(v:string){return v.length>=1&&v.length<=ROOM_ID_MAX&&!/[\u0000-\u001f\u007f]/.test(v)&&!/\s/.test(v)}
function characterOf(v:any){return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
async function limited(db:any,accountId:string,action:'room_join'|'room_create'|'room_message',limit:number,windowMs:number){const cutoff=new Date(Date.now()-windowMs).toISOString();const {error:ins}=await db.from('sns_rate_limit_events').insert({account_id:accountId,action});if(ins)throw new AppError(503,'RATE_LIMIT_UNAVAILABLE','Controle de frequência indisponível.');const {count,error}=await db.from('sns_rate_limit_events').select('id',{count:'exact',head:true}).eq('account_id',accountId).eq('action',action).gte('created_at',cutoff);if(error)throw new AppError(503,'RATE_LIMIT_UNAVAILABLE','Controle de frequência indisponível.');return Number(count||0)>limit}

Deno.serve(async r=>{
  if(r.method==='OPTIONS')return new Response('',{status:204,headers:C});
  const u=new URL(r.url),route=u.pathname.replace(/^.*\/shinobi-rooms/,'')||'/';
  try{
    if(route==='/'||route==='/health')return r.method==='GET'?J({ok:true,service:'shinobi-rooms',version:'R39.1',pcRequired:false}):J({ok:false,error:'Método não permitido.'},405);
    const a=await auth(r);if(!a)return J({ok:false,error:'Sessão inválida.'},401);
    const db=DB();
    let b:any={};
    if(r.method==='POST')b=await body(r,route==='/message'?MESSAGE_BODY_MAX:ROOM_BODY_MAX);

    if(route==='/create'){
      if(r.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      if(await limited(db,a.id,'room_create',6,60000))return J({ok:false,error:'Muitas tentativas. Aguarde antes de criar outra sala.'},429);
      const roomCode=code(),title=String(b.title||'Campanha Online').slice(0,100),campaignId=String(b.campaignId||'').slice(0,120),state={title,campaignId,createdBy:a.id};
      const {error}=await db.from('sns_rooms').insert({code:roomCode,owner_account_id:a.id,state,revision:1});if(error)throw error;
      const {error:memberError}=await db.from('sns_room_members').upsert({room_code:roomCode,account_id:a.id,character:characterOf(b.character),last_seen_at:new Date().toISOString()},{onConflict:'room_code,account_id'});if(memberError)throw memberError;
      return J({ok:true,roomId:roomCode,title,campaignId});
    }

    const roomCode=String(b.roomId||u.searchParams.get('roomId')||'').trim().toUpperCase();
    if(!validRoomId(roomCode))return J({ok:false,error:'roomId inválido.'},400);
    if(route==='/join'&&r.method==='POST'&&await limited(db,a.id,'room_join',12,60000))return J({ok:false,error:'Muitas tentativas. Aguarde antes de tentar entrar novamente.'},429);
    const {data:room,error:roomError}=await db.from('sns_rooms').select('code,state,revision,updated_at').eq('code',roomCode).maybeSingle();if(roomError)throw roomError;
    if(!room)return J({ok:false,error:'Sala não encontrada.'},404);

    if(route==='/join'){
      if(r.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      const {error}=await db.from('sns_room_members').upsert({room_code:roomCode,account_id:a.id,character:characterOf(b.character),last_seen_at:new Date().toISOString()},{onConflict:'room_code,account_id'});if(error)throw error;
      return J({ok:true,roomId:roomCode,title:room.state?.title||'Campanha Online',campaignId:room.state?.campaignId||String(b.campaignId||'').slice(0,120)});
    }

    const {data:membership,error:membershipError}=await db.from('sns_room_members').select('account_id').eq('room_code',roomCode).eq('account_id',a.id).maybeSingle();if(membershipError)throw membershipError;
    if(!membership)return J({ok:false,error:'Entre na sala antes de acessar este recurso.'},403);

    if(route==='/heartbeat'){
      if(r.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      const {error}=await db.from('sns_room_members').update({character:characterOf(b.character),last_seen_at:new Date().toISOString()}).eq('room_code',roomCode).eq('account_id',a.id);if(error)throw error;
      return J({ok:true});
    }
    if(route==='/room'){
      if(r.method!=='GET'&&r.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      const cutoff=new Date(Date.now()-180000).toISOString(),{data:members,error}=await db.from('sns_room_members').select('account_id,character,last_seen_at,joined_at').eq('room_code',roomCode).gte('last_seen_at',cutoff).order('joined_at');if(error)throw error;
      return J({ok:true,room:{roomId:room.code,title:room.state?.title||'Campanha Online',campaignId:room.state?.campaignId||'',revision:room.revision,members:members||[]}});
    }
    if(route==='/message'){
      if(r.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      if(await limited(db,a.id,'room_message',30,10000))return J({ok:false,error:'Muitas mensagens em pouco tempo. Aguarde antes de enviar novamente.'},429);
      const msg=String(b.message||'').trim().slice(0,1500);if(!msg)return J({ok:false,error:'Mensagem vazia.'},400);
      const {data,error}=await db.from('sns_room_messages').insert({room_code:roomCode,account_id:a.id,character_name:String(b.characterName||'Shinobi').slice(0,80),message:msg}).select('id,character_name,message,created_at').single();if(error)throw error;
      return J({ok:true,message:data});
    }
    if(route==='/messages'){
      if(r.method!=='GET'&&r.method!=='POST')return J({ok:false,error:'Método não permitido.'},405);
      const afterRaw=Number(b.afterId||u.searchParams.get('afterId')||0),after=Number.isFinite(afterRaw)?Math.max(0,Math.floor(afterRaw)):0;
      const {data,error}=await db.from('sns_room_messages').select('id,character_name,message,created_at').eq('room_code',roomCode).gt('id',after).order('id').limit(100);if(error)throw error;
      return J({ok:true,messages:(data||[]).map((x:any)=>({id:x.id,characterName:x.character_name,message:x.message,at:x.created_at}))});
    }
    return J({ok:false,error:'Rota não encontrada.'},404);
  }catch(e){if(e instanceof AppError)return J({ok:false,code:e.code,error:e.message},e.status);console.error('shinobi-rooms',e);return J({ok:false,error:'Falha nas salas online.'},500)}
});
