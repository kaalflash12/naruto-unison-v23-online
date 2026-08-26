import fs from 'node:fs';

const appPath='app-online.js';
const simPath='tools/simulate-balance.mjs';
let app=fs.readFileSync(appPath,'utf8');
let sim=fs.readFileSync(simPath,'utf8');

function mustReplace(text, pattern, replacement, label){
  if(!pattern.test(text)) throw new Error(`Patch alvo não encontrado: ${label}`);
  return text.replace(pattern,replacement);
}

if(!app.includes('function battleInitiativeSide()')){
  const marker=/function expireDefenseAfterOpponentPhase\(team\)\{\n for\(const f of\(team\|\|\[\]\)\)\{\n  if\(f\.inv\)\{f\.invTurns=Math\.max\(0,\(f\.invTurns\|\|1\)-1\);if\(f\.invTurns<=0\)f\.inv=0\}\n  if\(f\.shield&&f\.shieldTurns>0\)\{f\.shieldTurns--;if\(f\.shieldTurns<=0\)f\.shield=0\}\n \}\n\}/;
  const helper=`function expireDefenseAfterOpponentPhase(team){\n for(const f of(team||[])){\n  if(f.inv){f.invTurns=Math.max(0,(f.invTurns||1)-1);if(f.invTurns<=0)f.inv=0}\n  if(f.shield&&f.shieldTurns>0){f.shieldTurns--;if(f.shieldTurns<=0)f.shield=0}\n }\n}\nfunction battleInitiativeSide(){\n if(!G)return 'you';\n if(G.initiativeFirst!=='you'&&G.initiativeFirst!=='ai'){\n  G.initiativeFirst=Math.random()<.5?'you':'ai';\n  log(\`Iniciativa inicial: \${G.initiativeFirst==='you'?'VOCÊ':'ADVERSÁRIO'}. A prioridade alterna a cada turno.\`,'info');\n }\n const odd=(Math.max(1,Number(G.turn||1))-1)%2===0;\n return odd?G.initiativeFirst:(G.initiativeFirst==='you'?'ai':'you');\n}`;
  app=mustReplace(app,marker,helper,'helper battleInitiativeSide');
}

if(!app.includes('const initiative=battleInitiativeSide();')){
  const phase=/const usedActs=G\.acts\.map\(a=>\(\{\.\.\.a\}\)\);\n let ch=\{\.\.\.G\.ch\};for\(const a of G\.acts\)\{let sk=G\.you\[a\.user\]\.skills\[a\.skill\];if\(canPay\(ch,sk\.cost\)\)\{pay\(ch,sk\.cost\);await perform\(a,false\)\}\}G\.ch=ch;\n expireDefenseAfterOpponentPhase\(G\.ai\);\n recordJutsuUses\(usedActs,G\.you\);\n if\(!alive\(G\.ai\)\.length\)return finish\(true,false\);\n for\(const a of aiActs\(\)\)await perform\(a,true\);\n expireDefenseAfterOpponentPhase\(G\.you\);\n if\(!alive\(G\.you\)\.length\)return finish\(false,false\);\n if\(G\.story&&!storyProtectedAlive\(\)\)return finish\(false,false\);/;
  const replacement=`const usedActs=G.acts.map(a=>({...a}));\n const playerPhase=async()=>{\n  let ch={...G.ch};for(const a of G.acts){const sk=G.you[a.user]?.skills?.[a.skill];if(sk&&G.you[a.user]?.hp>0&&canPay(ch,sk.cost)){pay(ch,sk.cost);await perform(a,false)}}G.ch=ch;\n  expireDefenseAfterOpponentPhase(G.ai);\n  recordJutsuUses(usedActs,G.you);\n };\n const aiPhase=async()=>{for(const a of aiActs())await perform(a,true);expireDefenseAfterOpponentPhase(G.you)};\n const initiative=battleInitiativeSide();\n if(initiative==='ai'){\n  await aiPhase();\n  if(!alive(G.you).length)return finish(false,false);\n  if(G.story&&!storyProtectedAlive())return finish(false,false);\n  await playerPhase();\n  if(!alive(G.ai).length)return finish(true,false);\n }else{\n  await playerPhase();\n  if(!alive(G.ai).length)return finish(true,false);\n  await aiPhase();\n  if(!alive(G.you).length)return finish(false,false);\n  if(G.story&&!storyProtectedAlive())return finish(false,false);\n }`;
  app=mustReplace(app,phase,replacement,'resolução alternada de turno');
}

if(!sim.includes("const turnFirst =")){
  const old=`    if (first === 'A') { runA(); if (!alive(B).length) break; runB(); }\n    else { runB(); if (!alive(A).length) break; runA(); }`;
  if(!sim.includes(old)) throw new Error('Patch alvo não encontrado: ordem do simulador');
  const replacement=`    const turnFirst = ((turn - 1) % 2 === 0) ? first : (first === 'A' ? 'B' : 'A');\n    if (turnFirst === 'A') { runA(); if (!alive(B).length) break; runB(); }\n    else { runB(); if (!alive(A).length) break; runA(); }`;
  sim=sim.replace(old,replacement);
}

if(!app.includes("const initiative=battleInitiativeSide();")) throw new Error('initiative runtime patch ausente');
if(!sim.includes('const turnFirst =')) throw new Error('initiative simulator patch ausente');

fs.writeFileSync(appPath,app);
fs.writeFileSync(simPath,sim);
console.log('INITIATIVE_FAIRNESS_PATCH=PASS');
