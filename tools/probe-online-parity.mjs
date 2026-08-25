import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const API='https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/naruto-api';
const run=String(process.env.GITHUB_RUN_ID||Date.now()).replace(/\D/g,'').slice(-10);
const users=[`ciparity${run}a`,`ciparity${run}b`];
const password=()=>`Ci!${crypto.randomBytes(10).toString('hex')}9a`;
const result={generatedAt:new Date().toISOString(),runId:run,users,steps:[],turns:[],observedKinds:new Set(),errors:[]};

function loadRoster(){
  const context={window:{},console};context.window.window=context.window;vm.createContext(context);
  vm.runInContext(fs.readFileSync('roster.js','utf8'),context,{filename:'roster.js',timeout:30000});
  const roster=context.window.NARUTO_ROSTER;
  if(!Array.isArray(roster)||roster.length<3)throw new Error('roster ausente');
  const starters=['naruto-uzumaki','sasuke-uchiha','sakura-haruno'];
  const defs=starters.map(slug=>roster.find(c=>c.slug===slug));
  if(defs.some(x=>!x))throw new Error('starter team incompleto');
  return defs;
}
const defs=loadRoster();
const defBySlug=new Map(defs.map(c=>[c.slug,c]));
const team=defs.map(c=>({slug:c.slug,loadout:[null,null,null,null],gear:{}}));

async function call(path,data=undefined){
  const opt=data===undefined?{cache:'no-store'}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),cache:'no-store'};
  const res=await fetch(API+path,opt);
  const text=await res.text();let body;try{body=JSON.parse(text)}catch{body={raw:text.slice(0,500)}}
  if(!res.ok||body?.ok===false){const e=new Error(`${opt.method||'GET'} ${path} -> HTTP ${res.status}: ${body?.error||body?.message||text.slice(0,200)}`);e.status=res.status;e.data=body;throw e}
  return body;
}
const chakraTypes=()=>['Blood','Gen','Nin','Tai'];
function canPay(ch,cost){
  const c={...ch};let rand=0;
  for(const x of cost||[]){if(x==='Rand')rand++;else if(Number(c[x]||0)>0)c[x]=Number(c[x]||0)-1;else return false}
  return chakraTypes().reduce((a,k)=>a+Number(c[k]||0),0)>=rand;
}
function alive(list){return (list||[]).map((f,i)=>({f,i})).filter(x=>Number(x.f?.hp||0)>0)}
function hydratedSkills(f){
  const base=defBySlug.get(f?.slug)?.skills||[],cds=Array.isArray(f?.cds)?f.cds:[];
  return base.map((s,i)=>({...s,cd:Number(cds[i]||0)}));
}
function summarizeGame(g){
  const fighter=f=>({slug:f?.slug,hp:Number(f?.hp||0),maxHp:Number(f?.maxHp||100),shield:Number(f?.shield||0),shieldTurns:Number(f?.shieldTurns||0),stun:Number(f?.stun||0),stunTurns:Number(f?.stunTurns||0),dot:Number(f?.dot||0),dotTurns:Number(f?.dotTurns||0),inv:Number(f?.inv||0),invTurns:Number(f?.invTurns||0),cds:Array.isArray(f?.cds)?f.cds.map(Number):[]});
  return {turn:Number(g?.turn||0),winner:g?.winner??null,hostCh:g?.hostCh??null,guestCh:g?.guestCh??null,host:(g?.host||[]).map(fighter),guest:(g?.guest||[]).map(fighter),log:Array.isArray(g?.log)?g.log.slice(-20):[]};
}
let sideState={game:null};
function actionCandidates(side,preference){
  const own=side==='host'?sideState.game.host:sideState.game.guest;
  const foe=side==='host'?sideState.game.guest:sideState.game.host;
  const ch=side==='host'?sideState.game.hostCh:sideState.game.guestCh;
  const out=[];
  for(const {f,i:user} of alive(own)){
    const skills=hydratedSkills(f);
    for(let skill=0;skill<skills.length;skill++){
      const sk=skills[skill],m=sk?.mechanic||{},kind=String(m.kind||'damage');
      if(Number(sk?.cd||0)>0||!canPay(ch,sk?.cost||[]))continue;
      let targetSide=m.target==='enemy'?'opponent':'self',target=0;
      if(m.target==='self')target=user;
      else if(m.target==='enemy')target=alive(foe)[0]?.i??0;
      else target=alive(own).sort((a,b)=>Number(a.f.hp||0)-Number(b.f.hp||0))[0]?.i??user;
      const p=preference.indexOf(kind);
      out.push({user,skill,targetSide,target,kind,name:sk.name,cost:sk.cost||[],score:p<0?99:p});
    }
  }
  return out.sort((a,b)=>a.score-b.score||a.user-b.user||a.skill-b.skill);
}
async function waitState(token,code,pred,tries=30){
  for(let i=0;i<tries;i++){
    const r=await call(`/api/room/state?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`);
    const g=r.game||r.room?.game||r.room?.data?.game;
    if(g&&pred(g))return {raw:r,game:g};
    await new Promise(r=>setTimeout(r,600));
  }
  throw new Error('timeout aguardando estado da sala');
}
function submissionId(side,turn){return crypto.randomUUID()}

const creds=users.map(u=>({user:u,pass:password(),token:null}));
let roomCode=null;
try{
  await call('/api/ping');result.steps.push('ping_ok');
  for(const c of creds){
    const r=await call('/api/account/register',{user:c.user,pass:c.pass});
    c.token=r.token||null;if(!c.token)throw new Error(`registro ${c.user} não devolveu token`);
  }
  result.steps.push('two_ephemeral_accounts_registered');
  const create=await call('/api/room/create',{token:creds[0].token,team});
  roomCode=create.code||create.room?.code;if(!roomCode)throw new Error('room/create sem code');
  result.roomCode=roomCode;result.steps.push('room_created');
  await call('/api/room/join',{token:creds[1].token,code:roomCode,team});result.steps.push('room_joined');
  sideState=await waitState(creds[0].token,roomCode,g=>Array.isArray(g.host)&&g.host.length===3&&Array.isArray(g.guest)&&g.guest.length===3);
  result.initial=summarizeGame(sideState.game);
  const hostPrefs=['stun','damage','shield','invuln','heal','dot'];
  const guestPrefs=['shield','invuln','heal','damage','stun','dot'];
  for(let round=0;round<8;round++){
    if(sideState.game.winner)break;
    const before=summarizeGame(sideState.game),turn=Number(sideState.game.turn||0);
    const ha=actionCandidates('host',hostPrefs)[0],ga=actionCandidates('guest',guestPrefs)[0];
    if(!ha||!ga){result.errors.push({turn,error:'no_payable_action',host:!!ha,guest:!!ga,hostCh:sideState.game.hostCh,guestCh:sideState.game.guestCh});break}
    result.observedKinds.add(ha.kind);result.observedKinds.add(ga.kind);
    const guestSubmissionId=submissionId('guest',turn),hostSubmissionId=submissionId('host',turn);
    await call('/api/room/submit',{token:creds[1].token,code:roomCode,turn,submissionId:guestSubmissionId,acts:[{user:ga.user,skill:ga.skill,targetSide:ga.targetSide,target:ga.target}]});
    await call('/api/room/submit',{token:creds[0].token,code:roomCode,turn,submissionId:hostSubmissionId,acts:[{user:ha.user,skill:ha.skill,targetSide:ha.targetSide,target:ha.target}]});
    sideState=await waitState(creds[0].token,roomCode,g=>Number(g.turn||0)>turn||g.winner);
    result.turns.push({turn,before,hostAction:{...ha,cost:ha.cost},guestAction:{...ga,cost:ga.cost},submissionIdsPresent:true,after:summarizeGame(sideState.game)});
  }
  result.final=summarizeGame(sideState.game);
  try{if(!sideState.game.winner)await call('/api/room/forfeit',{token:creds[0].token,code:roomCode});result.steps.push('room_closed')}catch(e){result.errors.push({cleanupRoom:String(e.message)})}
  result.ok=result.turns.length>0;result.observedKinds=[...result.observedKinds];
  if(!result.ok)throw new Error('nenhum turno autoritativo foi resolvido');
}catch(e){
  result.ok=false;result.errors.push({fatal:String(e.message),status:e.status??null});result.observedKinds=[...result.observedKinds];process.exitCode=1;
}finally{
  fs.mkdirSync('audit/online',{recursive:true});
  fs.writeFileSync('audit/online/online-parity-proof.json',JSON.stringify(result,null,2)+'\n');
  fs.writeFileSync('audit/online/online-parity-cleanup.json',JSON.stringify({runId:run,users,roomCode},null,2)+'\n');
  console.log(JSON.stringify({ok:result.ok,runId:run,users,roomCode,turns:result.turns.length,observedKinds:result.observedKinds,errors:result.errors},null,2));
}
