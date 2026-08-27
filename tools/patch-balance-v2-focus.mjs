import fs from 'node:fs';

const file='tools/simulate-balance-3v3-v2.mjs';
let src=fs.readFileSync(file,'utf8');
const focus=String(process.env.SIM_FOCUS_SLUGS||'').split(',').map(x=>x.trim()).filter(Boolean);
if(!focus.length)throw new Error('SIM_FOCUS_SLUGS is empty');

const setupMarker="const pairLimit=MODE==='smoke'?Math.min(40,totalPossiblePairs):totalPossiblePairs;\nlet pairIndex=0;";
const setupReplacement=`const pairLimit=MODE==='smoke'?Math.min(40,totalPossiblePairs):totalPossiblePairs;\nconst FOCUS=new Set(String(process.env.SIM_FOCUS_SLUGS||'').split(',').map(x=>x.trim()).filter(Boolean));\nconst missingFocus=[...FOCUS].filter(slug=>!bySlug.has(slug));\nif(missingFocus.length)throw new Error(\`SIM_FOCUS_SLUGS unknown: \${missingFocus.join(',')}\`);\nlet pairIndex=0;`;
if(!src.includes(setupMarker))throw new Error('focus setup marker not found; simulator changed');
src=src.replace(setupMarker,setupReplacement);

const loopMarker="outer:for(let i=0;i<chars.length;i++)for(let j=i+1;j<chars.length;j++){\n if(pairIndex>=pairLimit)break outer;\n const currentPairIndex=pairIndex++;\n if(currentPairIndex%SHARD_COUNT!==SHARD_INDEX)continue;\n const A=chars[i],B=chars[j],m={";
const loopReplacement="outer:for(let i=0;i<chars.length;i++)for(let j=i+1;j<chars.length;j++){\n const A=chars[i],B=chars[j];\n if(FOCUS.size&&!FOCUS.has(A.slug)&&!FOCUS.has(B.slug))continue;\n if(pairIndex>=pairLimit)break outer;\n const currentPairIndex=pairIndex++;\n if(currentPairIndex%SHARD_COUNT!==SHARD_INDEX)continue;\n const m={";
if(!src.includes(loopMarker))throw new Error('focused pair-loop marker not found; simulator changed');
src=src.replace(loopMarker,loopReplacement);

fs.writeFileSync(file,src);
console.log(JSON.stringify({ok:true,file,focus,mode:'focused-pair-filter-v2'},null,2));
