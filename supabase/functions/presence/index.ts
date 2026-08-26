import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const URL=Deno.env.get("SUPABASE_URL")!;
const BODY_MAX=4*1024,WINDOW_SECONDS=75;
const ALLOWED=new Set(["online","lobby","ranked","pve","battle"]);
const C={
  "access-control-allow-origin":"*",
  "access-control-allow-headers":"authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods":"GET,POST,DELETE,OPTIONS",
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff"
};
function pick(name:string,legacy:string){const raw=Deno.env.get(name);if(raw){try{const o=JSON.parse(raw);return String(o.default??Object.values(o)[0]??"")}catch{return raw}}return Deno.env.get(legacy)??""}
const PUB=pick("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY"),SECRET=pick("SUPABASE_SECRET_KEYS","SUPABASE_SERVICE_ROLE_KEY");
const J=(x:unknown,s=200)=>new Response(JSON.stringify(x),{status:s,headers:C});
class AppError extends Error{status:number;code:string;constructor(status:number,code:string,message:string){super(message);this.status=status;this.code=code}}
const admin=()=>createClient(URL,SECRET,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
async function user(req:Request){const auth=req.headers.get("authorization")||"";if(!auth.startsWith("Bearer "))throw new AppError(401,"AUTH","Sessão inválida.");const c=createClient(URL,PUB,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});const {data,error}=await c.auth.getUser();if(error||!data.user)throw new AppError(401,"AUTH","Sessão inválida.");return data.user}
async function body(req:Request){const declared=Number(req.headers.get("content-length")||"0");if(Number.isFinite(declared)&&declared>BODY_MAX)throw new AppError(413,"BODY_TOO_LARGE","Corpo da requisição excede o limite.");const raw=await req.arrayBuffer();if(raw.byteLength>BODY_MAX)throw new AppError(413,"BODY_TOO_LARGE","Corpo da requisição excede o limite.");if(!raw.byteLength)return{} as Record<string,any>;try{const v=JSON.parse(new TextDecoder().decode(raw));if(!v||typeof v!=="object"||Array.isArray(v))throw 0;return v as Record<string,any>}catch{throw new AppError(400,"INVALID_JSON","JSON inválido.")}}

Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response("",{status:204,headers:C});
  try{
    if(!["GET","POST","DELETE"].includes(req.method))return J({ok:false,code:"METHOD",error:"Método inválido."},405);
    const u=await user(req),db=admin(),now=new Date();
    if(req.method==="DELETE"){
      const {error}=await db.from("naruto_online_presence").delete().eq("user_id",u.id);if(error)throw error;
      return J({ok:true,online:false});
    }
    const b=req.method==="POST"?await body(req):{},requested=String(b.activity||"lobby").toLowerCase().trim(),activity=ALLOWED.has(requested)?requested:"lobby",cutoff=new Date(now.getTime()-WINDOW_SECONDS*1000).toISOString();
    const {error:upsertError}=await db.from("naruto_online_presence").upsert({user_id:u.id,last_seen:now.toISOString(),activity,room_id:null},{onConflict:"user_id"});if(upsertError)throw upsertError;
    const {error:cleanupError}=await db.from("naruto_online_presence").delete().lt("last_seen",new Date(now.getTime()-24*60*60*1000).toISOString());if(cleanupError)console.error("presence cleanup",cleanupError);
    const [presenceRes,topRes]=await Promise.all([
      db.from("naruto_online_presence").select("user_id,last_seen,activity").gte("last_seen",cutoff).order("last_seen",{ascending:false}).limit(100),
      db.from("ranked_profiles").select("user_id,mmr,wins,losses,abandons,season_id").order("mmr",{ascending:false}).limit(10)
    ]);
    if(presenceRes.error)throw presenceRes.error;if(topRes.error)throw topRes.error;
    const presence=presenceRes.data||[],top=topRes.data||[],ids=[...new Set([...presence.map((x:any)=>x.user_id),...top.map((x:any)=>x.user_id),u.id])];
    let profiles:any[]=[],ratings:any[]=[];
    if(ids.length){const [p,r]=await Promise.all([db.from("profiles").select("user_id,username,level,rank").in("user_id",ids),db.from("ranked_profiles").select("user_id,mmr,wins,losses,abandons,season_id").in("user_id",ids)]);if(p.error)throw p.error;if(r.error)throw r.error;profiles=p.data||[];ratings=r.data||[]}
    const byProfile=new Map(profiles.map((x:any)=>[x.user_id,x])),byRating=new Map(ratings.map((x:any)=>[x.user_id,x]));
    const users=presence.map((x:any)=>{const p:any=byProfile.get(x.user_id)||{},r:any=byRating.get(x.user_id)||{};return{username:String(p.username||"Shinobi").slice(0,80),level:Number(p.level||1),rank:String(p.rank||"D").slice(0,32),activity:ALLOWED.has(String(x.activity))?x.activity:"lobby",lastSeen:x.last_seen,mmr:Number(r.mmr||1000),wins:Number(r.wins||0),losses:Number(r.losses||0),abandons:Number(r.abandons||0),self:x.user_id===u.id}});
    const leaderboard=top.map((x:any,i:number)=>{const p:any=byProfile.get(x.user_id)||{};return{position:i+1,username:String(p.username||"Shinobi").slice(0,80),mmr:Number(x.mmr||1000),wins:Number(x.wins||0),losses:Number(x.losses||0),abandons:Number(x.abandons||0),seasonId:String(x.season_id||"S1").slice(0,64),self:x.user_id===u.id}});
    const me=users.find((x:any)=>x.self)||(()=>{const p:any=byProfile.get(u.id)||{},r:any=byRating.get(u.id)||{};return{username:String(p.username||"Shinobi").slice(0,80),level:Number(p.level||1),rank:String(p.rank||"D").slice(0,32),activity,mmr:Number(r.mmr||1000),wins:Number(r.wins||0),losses:Number(r.losses||0),abandons:Number(r.abandons||0),self:true}})();
    return J({ok:true,count:users.length,windowSeconds:WINDOW_SECONDS,users,leaderboard,me});
  }catch(e:any){if(e instanceof AppError)return J({ok:false,code:e.code,error:e.message},e.status);console.error("presence",e);return J({ok:false,code:"PRESENCE_API",error:"Falha interna na presença online."},503)}
});
