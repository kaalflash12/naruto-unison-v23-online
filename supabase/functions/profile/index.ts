import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const BODY_MAX=512*1024;
const C={
  "access-control-allow-origin":"*",
  "access-control-allow-headers":"authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods":"GET,PATCH,OPTIONS",
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff"
};
const RESERVED=new Set([
  "userId","username","level","xp","ryo","rank","items","equipment","equipmentSlots",
  "arsenal","mastery","masteryMeta","missionProgress","storyProgress","taskProgress",
  "achievementProgress","unlockedCharacters","pveDaily","statistics","loadouts","revision","schemaVersion"
]);
function pick(name:string,legacy:string){const raw=Deno.env.get(name);if(raw){try{const obj=JSON.parse(raw);return String(obj.default??Object.values(obj)[0]??"")}catch{return raw}}return Deno.env.get(legacy)??""}
const PUBLISHABLE_KEY=pick("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY");
const SERVICE_KEY=pick("SUPABASE_SECRET_KEYS","SUPABASE_SERVICE_ROLE_KEY");
function J(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:C})}
class AppError extends Error{status:number;code:string;constructor(status:number,code:string,message:string){super(message);this.status=status;this.code=code}}
function admin(){return createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})}
async function user(req:Request){const auth=req.headers.get("authorization")||"";if(!auth.startsWith("Bearer "))throw new AppError(401,"AUTH","Sessão inválida.");const c=createClient(SUPABASE_URL,PUBLISHABLE_KEY,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});const {data,error}=await c.auth.getUser();if(error||!data.user)throw new AppError(401,"AUTH","Sessão inválida.");return data.user}
async function readJson(req:Request){const declared=Number(req.headers.get("content-length")||"0");if(Number.isFinite(declared)&&declared>BODY_MAX)throw new AppError(413,"BODY_TOO_LARGE","Corpo da requisição excede o limite.");const bytes=await req.arrayBuffer();if(bytes.byteLength>BODY_MAX)throw new AppError(413,"BODY_TOO_LARGE","Corpo da requisição excede o limite.");if(!bytes.byteLength)return{} as Record<string,any>;try{const v=JSON.parse(new TextDecoder().decode(bytes));if(!v||typeof v!=="object"||Array.isArray(v))throw new Error("object");return v as Record<string,any>}catch{throw new AppError(400,"INVALID_JSON","JSON inválido.")}}
function safeSnapshot(profile:any){const out:any={};for(const [k,v] of Object.entries(profile||{})){if(RESERVED.has(k))continue;if(k==="password"||k==="accessToken"||k==="refreshToken"||k==="serviceRole")continue;out[k]=structuredClone(v)}return out}
function clamp(n:unknown,min:number,max:number,fallback:number){const x=Number(n);return Number.isFinite(x)?Math.min(max,Math.max(min,x)):fallback}
async function load(db:any,userId:string){const [p,s,items,gear,slots,tech,loadouts,mastery,missions,story,tasks,achievements,unlocks]=await Promise.all([
  db.from("profiles").select("user_id,username,level,xp,ryo,rank").eq("user_id",userId).single(),
  db.from("player_settings").select("*").eq("user_id",userId).maybeSingle(),
  db.from("player_items").select("item_id,qty").eq("user_id",userId),
  db.from("player_equipment").select("equipment_id,owned,durability").eq("user_id",userId),
  db.from("player_equipment_slots").select("character_id,slot,equipment_id").eq("user_id",userId),
  db.from("player_techniques").select("character_id,technique_id").eq("user_id",userId),
  db.from("player_loadout_slots").select("character_id,slot,technique_id").eq("user_id",userId),
  db.from("mastery_progress").select("*").eq("user_id",userId),
  db.from("mission_progress").select("*").eq("user_id",userId),
  db.from("story_progress").select("*").eq("user_id",userId),
  db.from("task_progress").select("*").eq("user_id",userId),
  db.from("achievement_progress").select("*").eq("user_id",userId),
  db.from("player_unlocks").select("entity_type,entity_id").eq("user_id",userId)
]);
  if(p.error)throw p.error;for(const r of [s,items,gear,slots,tech,loadouts,mastery,missions,story,tasks,achievements,unlocks])if(r.error)throw r.error;
  return {p:p.data,s:s.data,items:items.data||[],gear:gear.data||[],slots:slots.data||[],tech:tech.data||[],loadouts:loadouts.data||[],mastery:mastery.data||[],missions:missions.data||[],story:story.data||[],tasks:tasks.data||[],achievements:achievements.data||[],unlocks:unlocks.data||[]};
}
function groupSlots(rows:any[],valueKey:string){const out:any={};for(const r of rows){out[r.character_id]??={};out[r.character_id][r.slot]=r[valueKey]}return out}
function groupLoadouts(rows:any[]){const out:any={};for(const r of rows){out[r.character_id]??=[null,null,null,null];if(r.slot>=0&&r.slot<4)out[r.character_id][r.slot]=r.technique_id}return out}
function groupArsenal(rows:any[]){const out:any={};for(const r of rows)(out[r.character_id]??=[]).push(r.technique_id);return out}
function assemble(userId:string,x:any){return{
  userId,username:x.p.username,level:Number(x.p.level||1),xp:Number(x.p.xp||0),ryo:Number(x.p.ryo||0),rank:String(x.p.rank||"D"),
  settings:x.s||{},tutorial:x.s?.tutorial_state||{offered:false,declined:false,completed:false,step:0},
  items:Object.fromEntries(x.items.map((r:any)=>[r.item_id,Number(r.qty||0)])),
  equipment:Object.fromEntries(x.gear.map((r:any)=>[r.equipment_id,{owned:!!r.owned,durability:Number(r.durability||0)}])),
  equipmentSlots:groupSlots(x.slots,"equipment_id"),arsenal:groupArsenal(x.tech),loadouts:groupLoadouts(x.loadouts),
  mastery:Object.fromEntries(x.mastery.map((r:any)=>[r.mastery_id,{matches:Number(r.character_matches||0),relatedUses:Number(r.related_uses||0),finalExamPassed:!!r.final_exam_passed,completed:!!r.completed,completedAt:r.completed_at||null,metrics:r.metrics||{},relatedTechniqueId:r.related_technique_id||null}])),
  missionProgress:Object.fromEntries(x.missions.map((r:any)=>[r.mission_id,r])),storyProgress:Object.fromEntries(x.story.map((r:any)=>[r.chapter_id,r])),
  taskProgress:Object.fromEntries(x.tasks.map((r:any)=>[r.task_id,{value:Number(r.value||0),claimed:!!r.claimed,period:r.period_key}])),
  achievementProgress:Object.fromEntries(x.achievements.map((r:any)=>[r.achievement_id,{value:Number(r.value||0),claimed:!!r.completed_at,completedAt:r.completed_at||null,period:"permanent"}])),
  unlockedCharacters:x.unlocks.filter((r:any)=>r.entity_type==="character").map((r:any)=>r.entity_id)
}}
function mergeSafe(base:any,snap:any){const out={...base,...structuredClone(snap||{})};for(const k of RESERVED)if(k in base)(out as any)[k]=structuredClone(base[k]);out.settings={...(base.settings||{}),...(snap?.settings||{})};out.tutorial={...(base.tutorial||{}),...(snap?.tutorial||{})};return out}
async function syncSettings(db:any,userId:string,profile:any){const s=profile.settings&&typeof profile.settings==="object"&&!Array.isArray(profile.settings)?profile.settings:{};const tutorial=profile.tutorial&&typeof profile.tutorial==="object"&&!Array.isArray(profile.tutorial)?profile.tutorial:{};const {error}=await db.from("player_settings").upsert({user_id:userId,reduced_motion:!!s.reduced_motion,sfx_volume:clamp(s.sfx_volume,0,1,.65),music_volume:clamp(s.music_volume,0,1,.5),tutorial_state:tutorial,updated_at:new Date().toISOString()});if(error)throw error}
async function syncLoadouts(db:any,userId:string,requested:any,current:any[]){if(!requested||typeof requested!=="object"||Array.isArray(requested))return;const {data:owned,error}=await db.from("player_techniques").select("character_id,technique_id").eq("user_id",userId);if(error)throw error;const allowed=new Set((owned||[]).map((r:any)=>`${r.character_id}:${r.technique_id}`));const rows:any[]=[];for(const [characterId,slots] of Object.entries(requested)){if(!Array.isArray(slots))continue;for(let slot=0;slot<4;slot++){const id=slots[slot];if(typeof id==="string"&&allowed.has(`${characterId}:${id}`))rows.push({user_id:userId,character_id:characterId,slot,technique_id:id})}}
  const {error:del}=await db.from("player_loadout_slots").delete().eq("user_id",userId);if(del)throw del;if(rows.length){const {error:ins}=await db.from("player_loadout_slots").insert(rows);if(ins)throw ins}}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("",{status:204,headers:C});
  try{
    if(req.method!=="GET"&&req.method!=="PATCH")return J({ok:false,code:"METHOD",error:"Método inválido."},405);
    const u=await user(req),db=admin();
    if(req.method==="GET"){
      const [baseRes,latest]=await Promise.all([load(db,u.id),db.from("player_save_snapshots").select("revision,schema_version,snapshot,created_at").eq("user_id",u.id).order("revision",{ascending:false}).limit(1).maybeSingle()]);
      if(latest.error)throw latest.error;const base=assemble(u.id,baseRes),profile=mergeSafe(base,latest.data?.snapshot||{}),revision=Number(latest.data?.revision||0);profile.revision=revision;profile.schemaVersion=37;return J({ok:true,profile,revision,role:"PLAYER"});
    }
    const b=await readJson(req),incoming=b.profile;if(!incoming||typeof incoming!=="object"||Array.isArray(incoming))return J({ok:false,code:"PROFILE_REQUIRED",error:"Perfil ausente."},400);
    const {data:last,error:lastError}=await db.from("player_save_snapshots").select("revision").eq("user_id",u.id).order("revision",{ascending:false}).limit(1).maybeSingle();if(lastError)throw lastError;const serverRevision=Number(last?.revision||0),clientRevision=Number(b.clientRevision??incoming.revision??0);if(clientRevision<serverRevision&&!b.force)return J({ok:false,code:"REVISION_CONFLICT",error:"Existe um save mais novo no servidor.",details:{serverRevision}},409);
    const baseBefore=await load(db,u.id);await syncSettings(db,u.id,incoming);await syncLoadouts(db,u.id,incoming.loadouts,baseBefore.loadouts);
    const revision=serverRevision+1,snap=safeSnapshot(incoming);snap.settings=incoming.settings&&typeof incoming.settings==="object"&&!Array.isArray(incoming.settings)?structuredClone(incoming.settings):{};snap.tutorial=incoming.tutorial&&typeof incoming.tutorial==="object"&&!Array.isArray(incoming.tutorial)?structuredClone(incoming.tutorial):{};
    const {error:saveError}=await db.from("player_save_snapshots").insert({user_id:u.id,revision,schema_version:37,snapshot:snap,reason:String(b.reason||"client-save").slice(0,120)});if(saveError){if(String(saveError.code)==="23505")return J({ok:false,code:"REVISION_CONFLICT",error:"Outro save foi gravado antes deste.",details:{serverRevision}},409);throw saveError}
    const baseAfter=assemble(u.id,await load(db,u.id)),profile=mergeSafe(baseAfter,snap);profile.revision=revision;profile.schemaVersion=37;return J({ok:true,profile,revision});
  }catch(e){if(e instanceof AppError)return J({ok:false,code:e.code,error:e.message},e.status);console.error("profile",e);return J({ok:false,code:"PROFILE_API",error:"Falha ao carregar ou salvar o perfil."},503)}
});
