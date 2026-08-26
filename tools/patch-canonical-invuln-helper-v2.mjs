import fs from 'node:fs';

const file='tools/classify-canonical-upstream-v2.mjs';
let src=fs.readFileSync(file,'utf8');
const old=`      for (const m of seg.matchAll(/\\binvuln\\s+\"([^\"]+)\"\\s+\"([^\"]*)\"\\s+\\[([^\\]]*)\\]/g)) {
        skills.push({
          name: m[1], normName: norm(m[1]), description: m[2] || '',
          cost: m[3].split(',').map((x) => x.trim()).filter(Boolean), cooldown: null,
          ...upstreamFacts(m[0], 'invuln'), raw: m[0], helper: 'invuln'
        });
      }`;
const replacement=`      for (const m of seg.matchAll(/\\binvuln\\s+\"([^\"]+)\"\\s+\"([^\"]*)\"\\s+\\[([^\\]]*)\\]/g)) {
        const helperFacts=upstreamFacts(m[0], 'invuln');
        skills.push({
          name: m[1], normName: norm(m[1]),
          description: \`${'${m[2]}'} becomes invulnerable for 1 turn.\`,
          cost: [], cooldown: 4,
          ...helperFacts,
          durations: [1], targets: ['self'],
          classes: m[3].split(',').map((x) => x.trim()).filter(Boolean),
          raw: m[0], helper: 'invuln'
        });
      }`;
const count=src.split(old).length-1;
if(count!==1) throw new Error(`INVULN_HELPER_PATCH_MATCHES=${count}`);
src=src.replace(old,replacement);
fs.writeFileSync(file,src);
console.log('CANONICAL_INVULN_HELPER_PATCH=PASS');
