import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { normalizeActions,validateActions,resolveAuthoritativeTurn,type Fighter,type RankedState,type Side } from "../_shared/ranked-engine.ts";

const URL=Deno.env.get("SUPABASE_URL")!;
const BODY_MAX=128*1024;
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STARTERS=new Set(["naruto-uzumaki","sasuke-uchiha","sakura-haruno"]);
const C={
  "access-control-allow-origin":"*",
  "access-control-allow-headers":"authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods":"GET,POST,OPTIONS",
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff"
};
function pick(name:string,legacy:string){const raw=Deno.env.get(name);if(raw){try{const o=JSON.parse(raw);return String(o.default??Object.values(o)[0]??"")}catch{return raw}}return Deno.env.get(legacy)??""}
const PUB=pick("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY"),SECRET=pick("SUPABASE_SECRET_KEYS","SUPABASE_SERVICE_ROLE_KEY");
const J=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:C});
class AppError extends Error{status:number;code:string;constructor(status:number,code:string,message:string){super(message);this.status=status;this.code=code}}
const admin=()=>createClient(URL,SECRET,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
async function requireUser(req:Request){const a=req.headers.get("authorization")||"";if(!a.startsWith("Bearer "))throw new AppError(401,"AUTH","Sessão inválida.");const c=createClient(URL,PUB,{global:{headers:{Authorization:a}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});const {data,error}=await c.auth.getUser();if(error||!data.user)throw new AppError(401,"AUTH","Sessão inválida.");return data.user}
async function readJson(req:Request){const declared=Number(req.headers.get("content-length")||"0");if(Number.isFinite(declared)&&declared>BODY_MAX)throw new AppError(413,"BODY_TOO_LARGE","Corpo da requisição excede o limite.");const raw=await req.arrayBuffer();if(raw.byteLength>BODY_MAX)throw new AppError(413,"BODY_TOO_LARGE","Corpo da requisição excede o limite.");if(!raw.byteLength)return{} as Record<string,any>;try{const v=JSON.parse(new TextDecoder().decode(raw));if(!v||typeof v!=="object"||Array.isArray(v))throw 0;return v as Record<string,any>}catch{throw new AppError(400,"INVALID_JSON","JSON inválido.")}}
function routeOf(req:Request){const p=new URL(req.url).pathname;const x=p.replace(/^.*\/ranked/,"");return x||"/"}
function asUuid(v:unknown,code:string){const s=String(v||"");if(!UUID_RE.test(s))throw new AppError(400,code,"Identificador inválido.");return s}
function teamIds(raw:any){if(!Array.isArray(raw)||raw.length<1||raw.length>3)throw new AppError(400,"TEAM","Equipe deve ter 1 a 3 personagens.");const ids=raw.map((x:any)=>String(typeof x==="string"?x:x?.characterId||x?.id||"").trim());if(ids.some(x=>!x||x.length>120)||new Set(ids).size!==ids.length)throw new AppError(400,"TEAM","Equipe contém personagem inválido ou duplicado.");return ids}

Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response("",{status:204,headers:C});
  try{
    if(req.method!=="GET"&&req.method!=="POST")return J({ok:false,code:"METHOD",error:"Método inválido."},405);
    const user=await requireUser(req),db=admin(),route=routeOf(req);
    if(req.method==="GET"&&route==="/leaderboard")return leaderboard(db);
    if(req.method==="GET"&&route.startsWith("/match/")){const id=asUuid(route.slice(7),"MATCH");return getMatch(db,user.id,id)}
    if(req.method!=="POST")return J({ok:false,code:"ROUTE",error:"Rota desconhecida."},404);
    const b=await readJson(req);
    if(route==="/queue")return queue(db,user.id,b);
    if(route==="/turn")return submitTurn(db,user.id,b);
    if(route==="/abandon")return abandon(db,user.id,b);
    return J({ok:false,code:"ROUTE",error:"Rota desconhecida."},404);
  }catch(e:any){
    const status=Number(e?.status||0);if(status>=400&&status<500)return J({ok:false,code:e?.code||"RANKED",error:String(e?.message||"Requisição inválida.")},status);
    console.error("ranked",e);return J({ok:false,code:"RANKED_API",error:"Falha interna no modo ranqueado."},503);
  }
});

async function ensureRankedProfile(db:any,userId:string){const {data,error}=await db.from("ranked_profiles").select("*").eq("user_id",userId).maybeSingle();if(error)throw error;if(data)return data;const {data:created,error:ce}=await db.from("ranked_profiles").insert({user_id:userId,mmr:1000,season_id:"S1"}).select("*").single();if(ce)throw ce;return created}
async function queue(db:any,userId:string,b:any){
  const {data:active,error:ae}=await db.from("ranked_matches").select("*").eq("status","ACTIVE").or(`player_a.eq.${userId},player_b.eq.${userId}`).order("created_at",{ascending:false}).limit(1).maybeSingle();if(ae)throw ae;if(active)return J({ok:true,status:"MATCHED",match:publicMatch(active,userId),existing:true});
  const ids=teamIds(b.team),p=await ensureRankedProfile(db,userId),snapshot=await buildRankedTeam(db,userId,ids);
  const {data,error}=await db.rpc("ranked_matchmake",{p_user_id:userId,p_team:{characterIds:ids,snapshot},p_mmr:Number(p.mmr||1000),p_season_id:String(p.season_id||"S1")});if(error)throw error;
  if(data?.status==="QUEUED")return J({ok:true,status:"QUEUED"});
  const m=data?.match;if(!m)throw new Error("matchmake returned no match");return J({ok:true,status:"MATCHED",match:publicMatch(m,userId),existing:!!data?.existing});
}
async function getMatch(db:any,userId:string,id:string){const {data:m,error}=await db.from("ranked_matches").select("*").eq("id",id).maybeSingle();if(error)throw error;if(!m)throw new AppError(404,"MATCH","Match ausente.");assertParticipant(m,userId);return J({ok:true,match:publicMatch(m,userId)})}
async function submitTurn(db:any,userId:string,b:any){
  const matchId=asUuid(b.matchId,"MATCH"),sid=asUuid(b.submissionId,"SUBMISSION"),turn=Number(b.turn);if(!Number.isInteger(turn)||turn<1||turn>10000)throw new AppError(400,"TURN","Turno inválido.");
  const {data:m,error:me}=await db.from("ranked_matches").select("*").eq("id",matchId).maybeSingle();if(me)throw me;if(!m)throw new AppError(404,"MATCH","Match ausente.");assertParticipant(m,userId);if(m.status!=="ACTIVE")throw new AppError(409,"MATCH_ENDED","A partida já terminou.");if(Number(m.turn)!==turn)throw new AppError(409,"TURN_MISMATCH",`Turno esperado ${m.turn}.`);
  const raw=Array.isArray(b.actions)?b.actions:null;if(!raw||raw.length>3)throw new AppError(400,"ACTIONS","Ações inválidas.");const actions=normalizeActions(raw);if(actions.length!==raw.length)throw new AppError(400,"ACTIONS","Ação inválida.");
  const side:Side=m.player_a===userId?"a":"b";try{validateActions(m.state as RankedState,side,actions)}catch(e:any){throw new AppError(Number(e?.status||400),"ACTIONS",String(e?.message||"Ação inválida."))}
  const {data:existing,error:xe}=await db.from("ranked_turn_submissions").select("submission_id").eq("match_id",matchId).eq("user_id",userId).eq("turn",turn).maybeSingle();if(xe)throw xe;
  if(existing){if(String(existing.submission_id)===sid){const latest=await loadMatch(db,matchId);return J({ok:true,duplicate:true,ready:true,match:publicMatch(latest,userId),resolution:latest.state?.resolvedSubmissions?.[String(turn)]||null})}throw new AppError(409,"TURN_ALREADY_SUBMITTED","Você já enviou uma jogada para este turno.")}
  const {error:ie}=await db.from("ranked_turn_submissions").insert({match_id:matchId,user_id:userId,turn,submission_id:sid,actions});if(ie){if(String(ie.code)==="23505")throw new AppError(409,"TURN_ALREADY_SUBMITTED","Você já enviou uma jogada para este turno.");throw ie}
  const {data:subs,error:se}=await db.from("ranked_turn_submissions").select("user_id,actions").eq("match_id",matchId).eq("turn",turn);if(se)throw se;const participantRows=(subs||[]).filter((x:any)=>x.user_id===m.player_a||x.user_id===m.player_b),distinct=new Set(participantRows.map((x:any)=>x.user_id));if(distinct.size<2)return J({ok:true,duplicate:false,ready:false});
  const byUser=new Map(participantRows.map((x:any)=>[x.user_id,x.actions])),state=structuredClone(m.state) as RankedState,resolution=resolveAuthoritativeTurn(state,{a:byUser.get(m.player_a)||[],b:byUser.get(m.player_b)||[]},matchId,turn);state.resolvedSubmissions=state.resolvedSubmissions||{};state.resolvedSubmissions[String(turn)]=resolution;const winner=resolution.winnerSide==="a"?m.player_a:resolution.winnerSide==="b"?m.player_b:null;
  const {data:commit,error:ce}=await db.rpc("ranked_commit_turn_resolution",{p_match_id:matchId,p_expected_turn:turn,p_new_state:state,p_winner:winner});if(ce)throw ce;
  const latest=await loadMatch(db,matchId);if(commit?.duplicate)return J({ok:true,duplicate:true,ready:true,resolution:latest.state?.resolvedSubmissions?.[String(turn)]||null,match:publicMatch(latest,userId)});
  if(winner){try{await Promise.all([creditRankedMastery(db,m.player_a,state.teams.a,state.events,matchId,"a"),creditRankedMastery(db,m.player_b,state.teams.b,state.events,matchId,"b")]);await db.from("battle_replays").insert({mode:"ranked",match_id:matchId,participants:{a:m.player_a,b:m.player_b},events:state.events})}catch(e){console.error("ranked post-result credit",e)}}
  return J({ok:true,duplicate:false,ready:true,resolution,match:publicMatch(latest,userId)});
}
async function abandon(db:any,userId:string,b:any){const id=asUuid(b.matchId,"MATCH"),m=await loadMatch(db,id);if(!m)throw new AppError(404,"MATCH","Match ausente.");assertParticipant(m,userId);const {data,error}=await db.rpc("ranked_commit_abandon",{p_match_id:id,p_user_id:userId});if(error)throw error;return J({ok:true,duplicate:!!data?.duplicate,winner:data?.winner||m.winner||null})}
async function leaderboard(db:any){const {data,error}=await db.from("ranked_profiles").select("user_id,mmr,wins,losses,abandons,season_id").order("mmr",{ascending:false}).limit(100);if(error)throw error;return J({ok:true,entries:data||[]})}
async function loadMatch(db:any,id:string){const {data,error}=await db.from("ranked_matches").select("*").eq("id",id).maybeSingle();if(error)throw error;return data}
function assertParticipant(m:any,userId:string){if(m.player_a!==userId&&m.player_b!==userId)throw new AppError(403,"PARTICIPANT","Você não participa deste match.")}
function publicMatch(m:any,userId:string){const side=m.player_a===userId?"a":"b";return{id:m.id,status:m.status,turn:m.turn,winner:m.winner,seasonId:m.season_id,you:side,state:m.state}}
async function buildRankedTeam(db:any,userId:string,characterIds:string[]):Promise<Fighter[]>{
  const {data:unlocks,error:ue}=await db.from("player_unlocks").select("entity_id").eq("user_id",userId).eq("entity_type","character").in("entity_id",characterIds);if(ue)throw ue;const allowed=new Set<string>([...STARTERS,...(unlocks||[]).map((x:any)=>String(x.entity_id))]);for(const id of characterIds)if(!allowed.has(id))throw new AppError(403,"CHARACTER_LOCKED",`Personagem bloqueado: ${id}`);
  const {data:chars,error:ce}=await db.from("content_entities").select("entity_id,published").eq("entity_type","character").in("entity_id",characterIds).not("published","is",null);if(ce)throw ce;const charMap=new Map((chars||[]).map((x:any)=>[x.entity_id,x.published]));
  const {data:slots,error:le}=await db.from("player_loadout_slots").select("character_id,slot,technique_id").eq("user_id",userId).in("character_id",characterIds);if(le)throw le;const byChar=new Map<string,any[]>();for(const s of slots||[]){const a=byChar.get(s.character_id)||[];a.push(s);byChar.set(s.character_id,a)}
  const techniqueIds=new Set<string>();for(const id of characterIds){const c:any=charMap.get(id);if(!c)throw new AppError(400,"CHARACTER",`Personagem não publicado: ${id}`);const ls=(byChar.get(id)||[]).sort((a,b)=>a.slot-b.slot).map(x=>x.technique_id).filter(Boolean);for(const t of (ls.length?ls:c.baseTechniqueIds||[]).slice(0,4))techniqueIds.add(String(t))}
  const {data:techs,error:te}=techniqueIds.size?await db.from("content_entities").select("entity_id,published").eq("entity_type","technique").in("entity_id",[...techniqueIds]).not("published","is",null):{data:[],error:null};if(te)throw te;const techMap=new Map((techs||[]).map((x:any)=>[x.entity_id,x.published]));
  return characterIds.map(id=>{const c:any=charMap.get(id),ls=(byChar.get(id)||[]).sort((a,b)=>a.slot-b.slot).map(x=>x.technique_id).filter(Boolean),ids=(ls.length?ls:c.baseTechniqueIds||[]).slice(0,4),skills=ids.map((t:string)=>techMap.get(t)).filter(Boolean);if(!skills.length)throw new AppError(400,"LOADOUT",`Loadout sem técnica publicada: ${id}`);const hp=Math.max(1,Math.min(100000,Number(c.hp||100)));return{characterId:id,name:String(c.name||id).slice(0,120),hp,maxHp:hp,shield:0,statuses:[],cooldowns:{},skills,stats:c.stats||{}}})
}
async function creditRankedMastery(db:any,userId:string,team:any[],events:any[],matchId:string,side:"a"|"b"){
  const {error:ce}=await db.from("mastery_match_credits").insert({user_id:userId,match_id:matchId});if(ce){if(String(ce.code)==="23505")return;throw ce}const characterIds=team.map((x:any)=>x.characterId).filter(Boolean);if(!characterIds.length)return;
  const {data:entities,error:ee}=await db.from("content_entities").select("entity_id,published").eq("entity_type","mastery").not("published","is",null);if(ee)throw ee;const trials=(entities||[]).map((x:any)=>x.published).filter((t:any)=>t&&characterIds.includes(t.characterId));if(!trials.length)return;
  const ids=trials.map((t:any)=>t.id),{data:existing,error:xe}=await db.from("mastery_progress").select("*").eq("user_id",userId).in("mastery_id",ids);if(xe)throw xe;const byId=new Map((existing||[]).map((x:any)=>[x.mastery_id,x]));
  const rows=trials.map((t:any)=>{const old=byId.get(t.id)||{},idx=team.findIndex((f:any)=>f.characterId===t.characterId),related=String(t.unlockRequirements?.relatedTechnique?.techniqueId||""),max=Math.max(1,Number(t.unlockRequirements?.relatedTechnique?.maxUsesPerBattle||3)),uses=Math.min(max,(events||[]).filter((e:any)=>e.type==="TECHNIQUE"&&e.side===side&&Number(e.actor)===idx&&e.techniqueId===related).length);return{user_id:userId,mastery_id:t.id,stage:0,completed:!!old.completed,metrics:old.metrics||{},character_matches:Number(old.character_matches||0)+1,related_uses:Number(old.related_uses||0)+uses,related_technique_id:related||old.related_technique_id||null,final_exam_passed:!!old.final_exam_passed,completed_at:old.completed_at||null,updated_at:new Date().toISOString()}});
  const {error:ue}=await db.from("mastery_progress").upsert(rows,{onConflict:"user_id,mastery_id"});if(ue)throw ue;
}
