import { MongoClient, ObjectId } from "mongodb";
import worker, { GameRoom } from "./index.js";
export { GameRoom };

function safeEqual(a,b){
  a=String(a||"");b=String(b||"");
  if(a.length!==b.length)return false;
  let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);
  return d===0;
}
function cors(req,env){
  const origin=req.headers.get("origin")||"";
  const allowed=String(env.ALLOWED_ORIGINS||env.ALLOWED_ORIGIN||"https://kaalflash12.github.io").split(",").map(x=>x.trim()).filter(Boolean);
  const selected=allowed.includes(origin)?origin:(!origin?(allowed[0]||"*"):"null");
  return {"content-type":"application/json; charset=utf-8","access-control-allow-origin":selected,"access-control-allow-methods":"GET,POST,PUT,PATCH,DELETE,OPTIONS","access-control-allow-headers":"authorization,content-type,x-r41-revision","cache-control":"no-store","vary":"origin"};
}
async function fingerprint(value){
  const bytes=new TextEncoder().encode(String(value||""));
  const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",bytes));
  return [...hash].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function claimLeon(req,env,ctx){
  if(req.method!=="POST")return new Response(JSON.stringify({ok:false,error:"METHOD_NOT_ALLOWED"}),{status:405,headers:cors(req,env)});
  if(!env.LEON_PRIVATE_CODE||!env.MONGODB_URI)return new Response(JSON.stringify({ok:false,error:"PRIVATE_CLAIM_NOT_CONFIGURED"}),{status:503,headers:cors(req,env)});
  let body={};try{body=await req.clone().json();}catch{}
  if(!safeEqual(String(body.code||""),String(env.LEON_PRIVATE_CODE)))return new Response(JSON.stringify({ok:false,error:"PRIVATE_ACCESS_DENIED"}),{status:403,headers:cors(req,env)});

  const meUrl=new URL(req.url);meUrl.pathname="/api/auth/me";meUrl.search="";
  const meReq=new Request(meUrl.toString(),{method:"POST",headers:req.headers});
  const meRes=await worker.fetch(meReq,env,ctx);
  const me=await meRes.json().catch(()=>({}));
  if(!meRes.ok||!me.ok||!me.account?.id)return new Response(JSON.stringify({ok:false,error:"UNAUTHORIZED"}),{status:401,headers:cors(req,env)});

  let client;
  try{
    client=new MongoClient(env.MONGODB_URI,{maxPoolSize:2,minPoolSize:0,serverSelectionTimeoutMS:6000,connectTimeoutMS:6000});
    await client.connect();
    const db=client.db(env.MONGODB_DB||"naruto_shinobi_r41");
    const fp=await fingerprint(env.LEON_PRIVATE_CODE);
    const already=await db.collection("private_claims").findOne({type:"leon",fingerprint:fp,redeemed:true});
    const uid=new ObjectId(String(me.account.id));
    const current=await db.collection("users").findOne({_id:uid});
    if(!current)return new Response(JSON.stringify({ok:false,error:"ACCOUNT_NOT_FOUND"}),{status:404,headers:cors(req,env)});
    if(already&&current.role!=="leon")return new Response(JSON.stringify({ok:false,error:"LEON_CLAIM_ALREADY_USED"}),{status:409,headers:cors(req,env)});

    if(current.role!=="leon"){
      await db.collection("users").updateMany({role:"leon",_id:{$ne:uid}},{$set:{role:"player",updatedAt:new Date()}});
      await db.collection("users").updateOne({_id:uid},{$set:{role:"leon",displayName:current.displayName||"Leon",updatedAt:new Date()}});
      await db.collection("private_claims").updateOne({type:"leon",fingerprint:fp},{$set:{type:"leon",fingerprint:fp,redeemed:true,userId:uid,redeemedAt:new Date()}},{upsert:true});
      await db.collection("audit_events").insertOne({type:"private.leon.claim",userId:uid,detail:{source:"installer-browser-claim"},createdAt:new Date(),build:"R41-CLOUDFLARE-MONGODB-INTEGRAL-20260819"});
    }
    const u=await db.collection("users").findOne({_id:uid});
    return new Response(JSON.stringify({ok:true,claimed:true,account:{id:String(u._id),username:u.username,displayName:u.displayName||u.username,role:u.role||"player",createdAt:u.createdAt}}),{status:200,headers:cors(req,env)});
  }catch(e){
    console.error("LEON_CLAIM_ERROR",e);
    return new Response(JSON.stringify({ok:false,error:"PRIVATE_CLAIM_FAILED"}),{status:500,headers:cors(req,env)});
  }finally{try{await client?.close();}catch{}}
}

async function mapWorldTick(req){
  const url = new URL(req.url);
  if (url.pathname.replace(/\/+$/g, "") !== "/api/v84/world/tick") return null;
  let body = {};
  try { body = await req.clone().json(); } catch {}
  const mapped = new URL(req.url);
  mapped.pathname = "/api/v84/world/event";
  const payload = {
    type: "world_tick",
    detail: body,
    campaignId: body.campaignId || body.detail?.campaignId || "default",
    minutes: Number(body.minutes ?? body.deltaMinutes ?? 0),
    source: "world-tick"
  };
  return new Request(mapped.toString(), {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(payload)
  });
}

export default {
  async fetch(req, env, ctx) {
    const url=new URL(req.url),path=url.pathname.replace(/\/+$/g,"")||"/";
    if(path==="/api/private/claim-leon")return claimLeon(req,env,ctx);
    const mapped = await mapWorldTick(req);
    if (mapped) return worker.fetch(mapped, env, ctx);
    return worker.fetch(req, env, ctx);
  }
};
