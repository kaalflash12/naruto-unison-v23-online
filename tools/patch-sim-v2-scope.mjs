import fs from 'node:fs';
const file='tools/simulate-balance-3v3-v2.mjs';
let s=fs.readFileSync(file,'utf8');
const reps=[
  ["const MODE=String(process.env.SIM_MODE||'standard');\nconst MAX_TURNS=", "const MODE=String(process.env.SIM_MODE||'standard');\nconst SIM_SCOPE=String(process.env.SIM_SCOPE||'competitive');\nconst MAX_TURNS="],
  ["function classification(c){if(c.eventOnly===true||/^bijuu-/.test(String(c.slug||'')))return'event';if(/chefe|boss|exclusiv/.test(norm(c.bio)))return'special-review';return'standard'}\nconst chars=roster.filter(c=>classification(c)==='standard'&&Array.isArray(c.skills)&&c.skills.length===4);", "function classification(c){if(c.eventOnly===true||/^bijuu-/.test(String(c.slug||'')))return'event';if(/chefe|boss|exclusiv/.test(norm(c.bio)))return'special-review';return'standard'}\nconst eligible=roster.filter(c=>Array.isArray(c.skills)&&c.skills.length===4);\nconst excludedCharacters=eligible.filter(c=>classification(c)!=='standard').map(c=>({slug:c.slug,name:c.name,classification:classification(c)}));\nconst chars=eligible.filter(c=>SIM_SCOPE==='all'||classification(c)==='standard');"],
  ["const summary={generatedAt:new Date().toISOString(),engine:'combat-rules-v2',engineVersion:rules.VERSION,mode:MODE,seeds:SEEDS,policies:POLICIES,roster:chars.length,", "const summary={generatedAt:new Date().toISOString(),engine:'combat-rules-v2',engineVersion:rules.VERSION,mode:MODE,scope:SIM_SCOPE,seeds:SEEDS,policies:POLICIES,totalRoster:roster.length,eligibleRoster:eligible.length,roster:chars.length,excludedCharacters:SIM_SCOPE==='all'?[]:excludedCharacters,"]
];
for(const [a,b] of reps){if(!s.includes(a))throw new Error('Patch target missing: '+a.slice(0,90));s=s.replace(a,b)}
fs.writeFileSync(file,s);
console.log(JSON.stringify({ok:true,file,scopeSupport:true},null,2));
