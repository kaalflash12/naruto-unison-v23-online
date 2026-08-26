import fs from 'node:fs';

const file='tools/simulate-balance-3v3-v2.mjs';
const src=fs.readFileSync(file,'utf8');
const marker="const pairLimit=MODE==='smoke'?40:Infinity;let pairs=0;\nouter:for(let i=0;i<chars.length;i++)for(let j=i+1;j<chars.length;j++){if(pairs++>=pairLimit)break outer;const A=chars[i],B=chars[j],m={a:A.slug,b:B.slug,games:0,aWins:0,bWins:0,draws:0,turns:0,hpDiff:0};";
if(!src.includes(marker))throw new Error('pair-loop marker not found; simulator changed');
const replacement="const pairLimit=MODE==='smoke'?40:Infinity;let pairs=0;\nconst FOCUS=new Set(String(process.env.SIM_FOCUS_SLUGS||'').split(',').map(x=>x.trim()).filter(Boolean));\nouter:for(let i=0;i<chars.length;i++)for(let j=i+1;j<chars.length;j++){const A=chars[i],B=chars[j];if(FOCUS.size&&!FOCUS.has(A.slug)&&!FOCUS.has(B.slug))continue;if(pairs++>=pairLimit)break outer;const m={a:A.slug,b:B.slug,games:0,aWins:0,bWins:0,draws:0,turns:0,hpDiff:0};";
fs.writeFileSync(file,src.replace(marker,replacement));
console.log(JSON.stringify({ok:true,file,focus:String(process.env.SIM_FOCUS_SLUGS||'').split(',').filter(Boolean)},null,2));
