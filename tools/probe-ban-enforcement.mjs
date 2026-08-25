import fs from 'node:fs';
import crypto from 'node:crypto';

const API='https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/naruto-api';
const run=String(process.env.GITHUB_RUN_ID||Date.now()).replace(/\D/g,'').slice(-10);
const user=`ciban${run}`;
const pass=`Ci!${crypto.randomBytes(12).toString('hex')}9a`;
const proof={generatedAt:new Date().toISOString(),runId:run,user,steps:[],preBan:null,postBan:null,ok:false,errors:[]};

async function request(path,data=undefined){
  const opt=data===undefined?{cache:'no-store'}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),cache:'no-store'};
  const res=await fetch(API+path,opt);
  const text=await res.text();
  let body; try{body=JSON.parse(text)}catch{body={raw:text.slice(0,300)}}
  return {status:res.status,ok:res.ok&&body?.ok!==false,body};
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

try{
  const reg=await request('/api/account/register',{user,pass});
  if(!reg.ok||!reg.body?.token)throw new Error(`register failed HTTP ${reg.status}: ${reg.body?.error||reg.body?.message||'unknown'}`);
  const token=reg.body.token;
  proof.steps.push('registered');

  const sessionBefore=await request('/api/account/session?token='+encodeURIComponent(token));
  if(!sessionBefore.ok)throw new Error(`pre-ban session failed HTTP ${sessionBefore.status}: ${sessionBefore.body?.error||'unknown'}`);
  proof.preBan={sessionStatus:sessionBefore.status,sessionAllowed:true};
  proof.steps.push('preban_session_allowed');

  console.log(`BAN_PROBE_READY user=${user} runId=${run}`);
  console.log('Waiting for external DB ban marker; no credential or token is logged.');
  for(let i=0;i<12;i++){
    await sleep(10000);
    const probe=await request('/api/account/session?token='+encodeURIComponent(token));
    if(!probe.ok){
      proof.steps.push(`preban_token_blocked_after_${(i+1)*10}s`);
      proof.postBan={sessionStatus:probe.status,sessionAllowed:false,sessionError:probe.body?.error||probe.body?.message||null};
      break;
    }
  }
  if(!proof.postBan)throw new Error('pre-ban token remained valid for full 120s observation window');

  const loginAfter=await request('/api/account/login',{user,pass});
  proof.postBan.loginStatus=loginAfter.status;
  proof.postBan.loginAllowed=loginAfter.ok&&Boolean(loginAfter.body?.token);
  proof.postBan.loginError=loginAfter.body?.error||loginAfter.body?.message||null;
  if(proof.postBan.loginAllowed)throw new Error('new login was allowed after ban');
  proof.steps.push('postban_login_blocked');

  proof.ok=true;
}catch(e){
  proof.errors.push(String(e?.message||e));
  process.exitCode=1;
}finally{
  fs.mkdirSync('audit/security',{recursive:true});
  fs.writeFileSync('audit/security/ban-enforcement-proof.json',JSON.stringify(proof,null,2)+'\n');
  fs.writeFileSync('audit/security/ban-enforcement-cleanup.json',JSON.stringify({runId:run,user},null,2)+'\n');
  console.log(JSON.stringify({ok:proof.ok,runId:run,user,steps:proof.steps,preBan:proof.preBan,postBan:proof.postBan,errors:proof.errors},null,2));
}
