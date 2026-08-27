import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const has = (x) => argv.includes(x);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const REQUIRED_UPSTREAM_COMMIT = '3f81bcd0de1795c17ce1f8e8d9f9fa51b38af0e1';
const CLASSIFICATIONS = Object.freeze([
  'CORRETA',
  'DESCRIÇÃO_ERRADA',
  'DANO_ERRADO',
  'EFEITO_ERRADO',
  'ALVO_ERRADO',
  'CUSTO_ERRADO',
  'COOLDOWN_ERRADO',
  'DURAÇÃO_ERRADA',
  'MOTOR_INSUFICIENTE'
]);
const CLASS_SET = new Set(CLASSIFICATIONS);
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const compact = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const uniq = (a) => [...new Set(a.filter((x) => x !== null && x !== undefined && x !== ''))];
const arr = (v) => Array.isArray(v) ? v : (v == null ? [] : [v]);
const num = (v, d = null) => Number.isFinite(Number(v)) ? Number(v) : d;
const sameSet = (a, b) => {
  const A = uniq(a).sort();
  const B = uniq(b).sort();
  return JSON.stringify(A) === JSON.stringify(B);
};
const costNorm = (x) => {
  const t = String(x ?? '').trim().toLowerCase();
  const map = {
    blood: 'blood', kek: 'blood', bloodline: 'blood',
    gen: 'gen', genjutsu: 'gen',
    nin: 'nin', ninjutsu: 'nin',
    tai: 'tai', taijutsu: 'tai',
    rand: 'rand', random: 'rand', q: 'rand'
  };
  return map[t] || t;
};
const normalizeCost = (xs) => arr(xs).map(costNorm).filter(Boolean).sort();
const normalizeTarget = (x) => {
  const t = String(x ?? '').trim().toLowerCase();
  if (['self'].includes(t)) return 'self';
  if (['ally'].includes(t)) return 'ally';
  if (['allies', 'all-allies'].includes(t)) return 'allies';
  if (['allies-except-self', 'xallies'].includes(t)) return 'allies-except-self';
  if (['enemy', 'primary'].includes(t)) return 'enemy';
  if (['enemies', 'all-enemies'].includes(t)) return 'enemies';
  if (['everyone'].includes(t)) return 'everyone';
  return t || 'unknown';
};
const targetCompatible = (localTargets, upstreamTargets) => {
  const L = uniq(localTargets.map(normalizeTarget));
  const U = uniq(upstreamTargets.map(normalizeTarget));
  if (!U.length) return true;
  const aliases = (t) => {
    if (t === 'allies-except-self') return new Set(['allies-except-self', 'allies']);
    return new Set([t]);
  };
  const compatible=(a,b)=>aliases(a).has(b)||aliases(b).has(a);
  return U.every((u) => L.some((l) => compatible(u,l))) && L.every((l) => U.some((u) => compatible(u,l)));
};

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && p.endsWith('.hs')) out.push(p);
  }
  return out;
}
function field(block, name) {
  const m = block.match(new RegExp(`Skill\\.${name}\\s*=\\s*"([^"]*)"`));
  return m?.[1] ?? null;
}
function listField(block, name) {
  const m = block.match(new RegExp(`Skill\\.${name}\\s*=\\s*\\[([^\\]]*)\\]`, 's'));
  return m ? m[1].split(',').map((x) => x.trim()).filter(Boolean) : [];
}
function maybeNumberField(block, name) {
  const m = block.match(new RegExp(`Skill\\.${name}\\s*=\\s*(-?\\d+)`));
  return m ? Number(m[1]) : null;
}
function blockAt(text, start) {
  const open = text.indexOf('{', start);
  if (open < 0) return null;
  let depth = 0, inString = false, esc = false;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}
function fileFamily(p) {
  const x = p.replaceAll('\\', '/');
  if (x.includes('/Reanimated/')) return 'Reanimated';
  if (x.includes('/Shippuden/')) return 'Shippuden';
  if (x.includes('/Original/')) return 'Original';
  if (x.includes('/Boruto/')) return 'Boruto';
  return 'Other';
}
function familyPreference(slug) {
  const s = String(slug || '');
  if (/-\(r\)$/.test(s)) return ['Reanimated', 'Shippuden', 'Original', 'Boruto', 'Other'];
  if (/-\(s\)$/.test(s)) return ['Shippuden', 'Original', 'Reanimated', 'Boruto', 'Other'];
  return ['Original', 'Shippuden', 'Reanimated', 'Boruto', 'Other'];
}
function targetFacts(block) {
  const out = [];
  const pairs = [
    [/\bTo Self\b/g, 'self'],
    [/\bTo Ally\b/g, 'ally'],
    [/\bTo Allies\b/g, 'allies'],
    [/\bTo XAllies\b/g, 'allies-except-self'],
    [/\bTo Enemy\b/g, 'enemy'],
    [/\bTo Enemies\b/g, 'enemies'],
    [/\bTo XEnemies\b/g, 'enemies'],
    [/\bTo Everyone\b/g, 'everyone']
  ];
  for (const [re, t] of pairs) if (re.test(block)) out.push(t);
  return uniq(out);
}
function values(block, re) {
  return [...block.matchAll(re)].map((m) => Number(m[1])).filter(Number.isFinite);
}
function upstreamFacts(block, helper = null) {
  const cats = [];
  const tests = [
    ['damage', /\bdamage\b(?!\s+reduction)|\bdamages\b|\bpierce\b/i],
    ['heal', /\bheal\b|\bhealing\b/i],
    ['defense', /\bdefend\b|\bDefense\b/i],
    ['reduction', /\bReduce\b|damage reduction/i],
    ['stun', /\bStun\b|\bstun/i],
    ['disable', /\bDisable\b/i],
    ['silence', /\bSilence\b/i],
    ['expose', /\bExpose\b/i],
    ['weaken', /\bWeaken\b/i],
    ['strengthen', /\bStrengthen\b/i],
    ['exhaust', /\bExhaust\b/i],
    ['focus', /\bFocus\b/i],
    ['cleanse', /\bcure(?:All|Bane|Stun)?\b|\bremoveStatus\b|\bremove.*status/i],
    ['dispel', /\bpurge\b|\bdispel\b/i],
    ['chakra', /\bgainChakra\b|\babsorbChakra\b|\bdepleteChakra\b/i],
    ['alternate', /\balternate|alternates\b/i],
    ['stack', /\bstack|tag\b/i],
    ['trap-counter', /\bcounter|trap\b/i],
    ['leech', /\bleech|drain.*health/i],
    ['demolish', /\bdemolish|destroy.*defen/i],
    ['dot', /\bBleed\b|\bPoison\b|\bBurn\b|\bafflict\b|damage.*each turn|damage.*per turn/i],
    ['execute', /\bexecuteAt\b|\bexecute\b/i],
    ['invulnerable', /\bInvulnerable\b/i],
    ['requirement', /Skill\.require/],
    ['charges', /Skill\.charges|\brecharge\b/],
    ['dynamic-change', /Skill\.changes|changeWith|changePer/],
    ['channel', /Skill\.dur\s*=\s*(?:Action|Control|Ongoing|Passive)/],
    ['reflect', /\bReflect\b/],
    ['redirect', /\bRedirect\b/],
    ['sacrifice', /\bsacrifice\b/i],
    ['bomb', /\bbomb(?:With)?\b/i],
    ['interrupt', /\binterrupt\b/i]
  ];
  if (helper === 'invuln') cats.push('invulnerable');
  for (const [c, re] of tests) if (re.test(block)) cats.push(c);
  return {
    categories: uniq(cats),
    damage: values(block, /\bdamage\s+(-?\d+)/g),
    pierce: values(block, /\bpierce\s+(-?\d+)/g),
    afflict: values(block, /\bafflict\s+(-?\d+)/g),
    heal: values(block, /\bheal\s+(-?\d+)/gi),
    defend: values(block, /\bdefend(?:'|With)?(?:\s+\w+)?\s+(-?\d+)/g),
    reduce: values(block, /\bReduce\s+\[[^\]]*\]\s+Flat\s+(-?\d+)/g),
    executeThresholds: values(block, /\bexecuteAt\s+(-?\d+)/g),
    durations: uniq(values(block, /\bapply(?:With\s*\[[^\]]*\])?\s+(\d+)\b/g).concat(values(block, /\bControl\s+(\d+)\b/g))),
    targets: targetFacts(block)
  };
}
function parseUpstream(upstreamRoot) {
  const root = path.join(upstreamRoot, 'src', 'Game', 'Characters');
  if (!fs.existsSync(root)) throw new Error(`UPSTREAM_CHARACTERS_MISSING:${root}`);
  const characters = [];
  for (const file of walk(root)) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(upstreamRoot, file).replaceAll('\\', '/');
    const chars = [...text.matchAll(/\bCharacter\s*\r?\n\s*"([^"]+)"/g)];
    for (let ci = 0; ci < chars.length; ci++) {
      const name = chars[ci][1];
      const start = chars[ci].index;
      const end = ci + 1 < chars.length ? chars[ci + 1].index : text.length;
      const seg = text.slice(start, end);
      const skills = [];
      let pos = 0;
      while ((pos = seg.indexOf('Skill.new', pos)) >= 0) {
        const block = blockAt(seg, pos);
        if (!block) { pos += 9; continue; }
        const skillName = field(block, 'name');
        if (skillName) {
          skills.push({
            name: skillName,
            normName: norm(skillName),
            description: field(block, 'desc') || '',
            cost: listField(block, 'cost'),
            cooldown: maybeNumberField(block, 'cooldown'),
            ...upstreamFacts(block),
            raw: block
          });
        }
        pos += Math.max(9, block.length);
      }
      for (const m of seg.matchAll(/\binvuln\s+"([^"]+)"\s+"([^"]*)"\s+\[([^\]]*)\]/g)) {
        const helperFacts=upstreamFacts(m[0], 'invuln');
        skills.push({
          name: m[1], normName: norm(m[1]),
          description: `${m[2]} becomes invulnerable for 1 turn.`,
          cost: [], cooldown: 4,
          ...helperFacts,
          durations: [1], targets: ['self'],
          classes: m[3].split(',').map((x) => x.trim()).filter(Boolean),
          raw: m[0], helper: 'invuln'
        });
      }
      characters.push({
        name, normName: norm(name), family: fileFamily(file), source: rel,
        skills, skillNames: new Set(skills.map((s) => s.normName))
      });
    }
  }
  if (characters.length < 150) throw new Error(`UPSTREAM_CHARACTER_PARSE_TOO_LOW:${characters.length}`);
  return characters;
}
function loadLegacyRoster(root) {
  const context = { window: {}, console };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'roster.js'), 'utf8'), context, { filename: 'roster.js', timeout: 30000 });
  try {
    vm.runInContext(fs.readFileSync(path.join(root, 'jutsu-variants.js'), 'utf8'), context, { filename: 'jutsu-variants.js', timeout: 30000 });
  } catch {}
  const roster = context.window.NARUTO_ROSTER;
  if (!Array.isArray(roster) || roster.length !== 209) throw new Error(`LEGACY_ROSTER_COUNT:${roster?.length}`);
  return roster;
}
function chooseUpstreamCharacter(localChar, upstreamCharacters) {
  const originalNames = arr(localChar.skills).map((s) => norm(s.originalName || s.name)).filter(Boolean);
  const pref = familyPreference(localChar.slug || localChar.id);
  const direct = upstreamCharacters.filter((c) => c.normName === norm(localChar.name));
  if (direct.length) {
    const ranked = direct.map((c) => ({ c, rank: pref.indexOf(c.family) >= 0 ? pref.indexOf(c.family) : 99 }));
    ranked.sort((a, b) => a.rank - b.rank);
    if (ranked.length === 1 || ranked[0].rank < ranked[1].rank) return { character: ranked[0].c, source: 'EXACT_NAME_FAMILY', score: 100, margin: null };
    const overlapRanked = ranked.map((x) => ({ ...x, overlap: originalNames.filter((n) => x.c.skillNames.has(n)).length }))
      .sort((a, b) => b.overlap - a.overlap || a.rank - b.rank);
    if (overlapRanked[0].overlap > (overlapRanked[1]?.overlap ?? -1)) return { character: overlapRanked[0].c, source: 'EXACT_NAME_SKILL_SET', score: 100 + overlapRanked[0].overlap, margin: overlapRanked[0].overlap - (overlapRanked[1]?.overlap ?? 0) };
  }
  const scored = upstreamCharacters.map((c) => {
    const overlap = originalNames.filter((n) => c.skillNames.has(n)).length;
    const familyRank = pref.indexOf(c.family) >= 0 ? pref.indexOf(c.family) : 99;
    return { c, overlap, familyRank };
  }).filter((x) => x.overlap > 0).sort((a, b) => b.overlap - a.overlap || a.familyRank - b.familyRank || a.c.name.localeCompare(b.c.name));
  if (!scored.length) return { character: null, source: 'UNRESOLVED_CHARACTER', score: 0, margin: 0 };
  const best = scored[0], second = scored[1];
  const margin = best.overlap - (second?.overlap ?? 0);
  if (best.overlap >= 3 && margin >= 1) return { character: best.c, source: 'UNIQUE_SKILL_SET', score: best.overlap, margin };
  if (best.overlap === 4 && (!second || second.overlap < 4)) return { character: best.c, source: 'FULL_SKILL_SET', score: 4, margin };
  return { character: null, source: 'AMBIGUOUS_CHARACTER', score: best.overlap, margin, candidates: scored.slice(0, 5).map((x) => ({ name: x.c.name, family: x.c.family, overlap: x.overlap, source: x.c.source })) };
}
function chooseUpstreamSkill(localSkill, upstreamCharacter, upstreamCharacters) {
  const names = uniq([localSkill?.originalName, localSkill?.name].map(norm).filter(Boolean));
  if (upstreamCharacter) {
    const local = upstreamCharacter.skills.filter((s) => names.includes(s.normName));
    if (local.length === 1) return { skill: local[0], source: 'EXACT_WITHIN_CHARACTER' };
    if (local.length > 1) return { skill: null, source: 'AMBIGUOUS_WITHIN_CHARACTER', candidates: local.map((s) => s.name) };
  }
  const global = [];
  for (const c of upstreamCharacters) for (const s of c.skills) if (names.includes(s.normName)) global.push({ c, s });
  if (global.length === 1) return { skill: global[0].s, character: global[0].c, source: 'EXACT_GLOBAL_UNIQUE' };
  if (global.length > 1) return { skill: null, source: 'AMBIGUOUS_GLOBAL', candidates: global.slice(0, 10).map((x) => `${x.c.name} :: ${x.s.name}`) };
  return { skill: null, source: 'UPSTREAM_SKILL_NOT_FOUND' };
}

function publishedCategories(published) {
  const out = [];
  for (const m of arr(published?.mechanics)) {
    const op = String(m?.op || '');
    if (op === 'damage' || op === 'multi-hit') out.push('damage');
    if (op === 'execute') out.push('damage', 'execute');
    if (op === 'drain') out.push('damage', 'leech', 'heal');
    if (op === 'heal') out.push('heal');
    if (op === 'shield') out.push('defense');
    if (op === 'buff' && String(m.stat) === 'defense') out.push('reduction');
    if (op === 'buff' && String(m.stat) === 'attack') out.push('strengthen');
    if (op === 'debuff' && String(m.stat) === 'defense') out.push('expose');
    if (op === 'debuff' && String(m.stat) === 'attack') out.push('weaken');
    if (op === 'cleanse') out.push('cleanse');
    if (op === 'dispel') out.push('dispel');
    if (op === 'chakra-gain' || op === 'chakra-drain') out.push('chakra');
    if (op === 'mark') out.push('stack');
    if (op === 'status') {
      const s = String(m.status || '');
      if (['stun', 'freeze'].includes(s)) out.push('stun');
      else if (s === 'bind') out.push('disable');
      else if (s === 'silence') out.push('silence');
      else if (s === 'invuln') out.push('invulnerable');
      else if (['bleed', 'burn', 'parasite', 'poison'].includes(s)) out.push('dot');
      else if (s === 'counter') out.push('trap-counter');
      else if (s === 'regen') out.push('heal');
      else if (s === 'vulnerable') out.push('expose');
      else if (s === 'chakra-lock') out.push('chakra');
      else out.push('status');
    }
  }
  return uniq(out);
}
function publishedTargets(published) {
  return uniq(arr(published?.mechanics).map((m) => normalizeTarget(m?.target === 'primary' ? (['buff','heal','shield','cleanse','chakra-gain'].includes(String(m?.op)) ? 'ally' : 'enemy') : m?.target)));
}
function publishedDurations(published) {
  return uniq(arr(published?.mechanics).map((m) => num(m?.turns, null)).filter((x) => x != null && x > 0)).sort((a, b) => a - b);
}
function publishedDirectDamage(published) {
  const vals = [];
  for (const m of arr(published?.mechanics)) {
    const op = String(m?.op || '');
    if (op === 'damage' || op === 'multi-hit' || op === 'drain') {
      const n = num(m.amount, null); if (n != null) vals.push(n);
    }
  }
  return vals;
}
function canonicalDirectDamage(upstream) {
  return [...arr(upstream?.damage), ...arr(upstream?.pierce)].filter(Number.isFinite);
}
function publishedNumericEffects(published) {
  const out={heal:[],dot:[],defense:[],reduction:[],execute:[]};
  for(const m of arr(published?.mechanics)){
    const op=String(m?.op||'');
    if(op==='heal'){const n=num(m.amount,null);if(n!=null)out.heal.push(n)}
    if(op==='status'&&String(m.status||'')==='regen'){const n=num(m.value??m.amount,null);if(n!=null)out.heal.push(n)}
    if(op==='status'&&['bleed','burn','parasite','poison'].includes(String(m.status||''))){const n=num(m.damage??m.value??m.amount,null);if(n!=null)out.dot.push(n)}
    if(op==='shield'){const n=num(m.amount,null);if(n!=null)out.defense.push(n)}
    if(op==='buff'&&String(m.stat||'')==='defense'){const n=num(m.amount,null);if(n!=null)out.reduction.push(n)}
    if(op==='execute'){const n=num(m.threshold,null);if(n!=null)out.execute.push(n)}
  }
  for(const k of Object.keys(out))out[k].sort((a,b)=>a-b);
  return out;
}
function canonicalNumericEffects(upstream) {
  const out={
    heal:arr(upstream?.heal).filter(Number.isFinite),
    dot:arr(upstream?.afflict).filter(Number.isFinite),
    defense:arr(upstream?.defend).filter(Number.isFinite),
    reduction:arr(upstream?.reduce).filter(Number.isFinite),
    execute:arr(upstream?.executeThresholds).filter(Number.isFinite)
  };
  for(const k of Object.keys(out))out[k].sort((a,b)=>a-b);
  return out;
}
function numericEffectMismatches(published,upstream){
  const local=publishedNumericEffects(published),canonical=canonicalNumericEffects(upstream),mismatches={};
  for(const key of Object.keys(canonical)){
    const L=local[key],U=canonical[key];
    if(!L.length&&!U.length)continue;
    if(JSON.stringify(L)!==JSON.stringify(U))mismatches[key]={local:L,upstream:U};
  }
  return mismatches;
}
const ENGINE_SUPPORTED_CANONICAL_CATEGORIES = new Set([
  'damage','heal','defense','reduction','stun','disable','silence','expose','weaken','strengthen','exhaust','focus',
  'cleanse','dispel','chakra','alternate','stack','trap-counter','leech','demolish','dot','execute','invulnerable',
  'requirement','charges','dynamic-change','channel','reflect','redirect','sacrifice','bomb','interrupt'
]);
function engineInsufficient(upstream) {
  return arr(upstream?.categories).some((x) => !ENGINE_SUPPORTED_CANONICAL_CATEGORIES.has(x));
}
function effectEquivalent(localCats, upstreamCats) {
  const ignorableMeta = new Set(['requirement', 'charges']);
  const U = new Set(uniq(upstreamCats.filter((x) => !ignorableMeta.has(x))));
  const L = new Set(localCats);
  const hasUp = (c) => U.has(c);
  const hasLocal = (c) => L.has(c);
  for (const c of U) {
    if (c === 'reduction' && (hasLocal('reduction') || hasLocal('defense'))) continue;
    if (c === 'defense' && (hasLocal('defense') || hasLocal('reduction'))) continue;
    if (c === 'leech' && hasLocal('leech') && hasLocal('damage') && hasLocal('heal')) continue;
    if (!hasLocal(c)) return false;
  }
  for (const c of L) {
    if (c === 'status') continue;
    if (c === 'defense' && (hasUp('defense') || hasUp('reduction'))) continue;
    if (c === 'reduction' && (hasUp('reduction') || hasUp('defense'))) continue;
    if ((c === 'damage' || c === 'heal') && hasUp('leech')) continue;
    if (c === 'leech' && hasUp('leech')) continue;
    if (!hasUp(c)) return false;
  }
  return true;
}
function normalizeStackAuxiliarySelfTarget(localTargets, upstreamTargets, upstreamCategories, effectsMatch) {
  const L = uniq(arr(localTargets).map(normalizeTarget));
  const U = uniq(arr(upstreamTargets).map(normalizeTarget));
  if (!effectsMatch || !arr(upstreamCategories).includes('stack') || !U.includes('self')) return U;
  const withoutSelf = U.filter((t) => t !== 'self');
  return sameSet(L, withoutSelf) ? withoutSelf : U;
}
function descriptionClaimsDimension(description, category) {
  const t = norm(description);
  if (!t) return false;
  const tests = {
    'DANO_ERRADO': /\b(dano|damage|causa|causar|drena)\b/,
    'EFEITO_ERRADO': /\b(atord|silenc|escudo|defesa|cura|regenera|marca|veneno|queim|sangr|chakra|invulner|reduz|aumenta|finaliza|execute|counter|evas)\b/,
    'ALVO_ERRADO': /\b(inimigo|inimigos|aliado|aliados|si mesmo|todos)\b/,
    'CUSTO_ERRADO': /\b(custo|chakra)\b/,
    'COOLDOWN_ERRADO': /\b(recarga|cooldown)\b/,
    'DURAÇÃO_ERRADA': /\b(turno|turnos|rodada|rodadas|dura)\b/
  };
  return tests[category]?.test(t) ?? false;
}
function classifyTechnique({ published, upstream }) {
  if (!published) throw new Error('PUBLISHED_TECHNIQUE_REQUIRED');
  if (!upstream) return { classifications: [], resolution: 'UPSTREAM_NAO_RESOLVIDO', evidence: {} };
  const flags = [];
  const evidence = {};
  if (engineInsufficient(upstream)) {
    flags.push('MOTOR_INSUFICIENTE');
    evidence.motor = arr(upstream.categories).filter((x) => !ENGINE_SUPPORTED_CANONICAL_CATEGORIES.has(x));
  }
  const localCats = publishedCategories(published);
  const upCats = arr(upstream.categories);
  const effectsMatch = effectEquivalent(localCats, upCats);
  if (!effectsMatch) {
    flags.push('EFEITO_ERRADO');
    evidence.effect = { local: localCats, upstream: upCats };
  }
  const localTargets = publishedTargets(published);
  const rawUpTargets = arr(upstream.targets);
  const upTargets = normalizeStackAuxiliarySelfTarget(localTargets, rawUpTargets, upCats, effectsMatch);
  if (!targetCompatible(localTargets, upTargets)) {
    flags.push('ALVO_ERRADO');
    evidence.target = { local: localTargets, upstream: rawUpTargets, normalizedUpstream: upTargets };
  }
  const lc = normalizeCost(published.chakraCost ?? published.cost);
  const uc = normalizeCost(upstream.cost);
  if (JSON.stringify(lc) !== JSON.stringify(uc)) {
    flags.push('CUSTO_ERRADO');
    evidence.cost = { local: lc, upstream: uc };
  }
  const localCd = num(published.cooldown, 0);
  const upCd = num(upstream.cooldown, 0);
  if (localCd !== upCd) {
    flags.push('COOLDOWN_ERRADO');
    evidence.cooldown = { local: localCd, upstream: upCd };
  }
  const ld = publishedDurations(published);
  const ud = uniq(arr(upstream.durations).filter(Number.isFinite)).sort((a, b) => a - b);
  if (ud.length && !sameSet(ld, ud)) {
    flags.push('DURAÇÃO_ERRADA');
    evidence.duration = { local: ld, upstream: ud };
  }
  const localDamage = publishedDirectDamage(published);
  const upDamage = canonicalDirectDamage(upstream);
  if (localDamage.length === 1 && upDamage.length === 1 && localDamage[0] !== upDamage[0]) {
    flags.push('DANO_ERRADO');
    evidence.damage = { local: localDamage[0], upstream: upDamage[0] };
  }
  const numericEffects=numericEffectMismatches(published,upstream);
  if(Object.keys(numericEffects).length){
    if(!flags.includes('EFEITO_ERRADO'))flags.push('EFEITO_ERRADO');
    evidence.effectNumeric=numericEffects;
  }
  const structural = flags.filter((x) => ['DANO_ERRADO','EFEITO_ERRADO','ALVO_ERRADO','CUSTO_ERRADO','COOLDOWN_ERRADO','DURAÇÃO_ERRADA'].includes(x));
  const description = String(published.description || '');
  if (structural.some((x) => descriptionClaimsDimension(description, x))) {
    flags.push('DESCRIÇÃO_ERRADA');
    evidence.description = { reason: 'texto publicado descreve uma dimensão mecânica que diverge do upstream', dimensions: structural.filter((x) => descriptionClaimsDimension(description, x)) };
  }
  const out = uniq(flags).filter((x) => CLASS_SET.has(x));
  if (!out.length) out.push('CORRETA');
  if (out.includes('CORRETA') && out.length > 1) throw new Error('CORRETA_MUST_BE_EXCLUSIVE');
  return { classifications: out, resolution: 'RESOLVIDO', evidence };
}

async function getJson(url) {
  let last = 'CONTENT_UNAVAILABLE';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
      const text = await r.text();
      let body = null; try { body = JSON.parse(text); } catch {}
      if (r.ok && body?.ok) return body;
      last = `CONTENT_HTTP_${r.status}:${text.slice(0, 200)}`;
    } catch (e) { last = String(e?.message || e); }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 750));
  }
  throw new Error(last);
}

async function main() {
  const root = path.resolve(arg('root', process.cwd()));
  const upstreamRoot = path.resolve(arg('upstream', process.env.UPSTREAM_DIR || path.join(root, 'canonical-upstream')));
  const outDir = path.resolve(arg('out', path.join(root, 'audit', 'balance', 'canonical-v2')));
  const contentBase = String(arg('content-base', process.env.CONTENT_BASE || 'https://cpdgkszviwrgrwsltbyk.supabase.co/functions/v1/content')).replace(/\/$/, '');
  const upstreamCommit = String(arg('upstream-commit', process.env.UPSTREAM_COMMIT || REQUIRED_UPSTREAM_COMMIT));
  if (upstreamCommit !== REQUIRED_UPSTREAM_COMMIT) throw new Error(`UPSTREAM_COMMIT_NOT_PINNED:${upstreamCommit}`);
  fs.mkdirSync(outDir, { recursive: true });

  const require = createRequire(import.meta.url);
  const adapter = require(path.join(root, 'combat-content-adapter-v2.js'));
  const rules = require(path.join(root, 'combat-rules-v2.js'));
  if (!adapter?.adaptTechnique || !rules?.VERSION) throw new Error('V2_RUNTIME_IMPORT_FAILED');

  const legacyRoster = loadLegacyRoster(root);
  const upstreamCharacters = parseUpstream(upstreamRoot);
  const manifest = await getJson(`${contentBase}/manifest`);
  const [techniquesPayload, charactersPayload] = await Promise.all([
    getJson(`${contentBase}?type=technique`),
    getJson(`${contentBase}?type=character`)
  ]);
  const techniques = arr(techniquesPayload.items);
  const publishedCharacters = arr(charactersPayload.items);
  const techniqueById = new Map(techniques.map((t) => [String(t.id), t]));
  const characterById = new Map(publishedCharacters.map((c) => [String(c.id), c]));
  if (legacyRoster.length !== 209) throw new Error(`PLAYABLE_CHARACTERS:${legacyRoster.length}`);
  if (techniques.length < 1200) throw new Error(`PUBLISHED_TECHNIQUES_TOO_LOW:${techniques.length}`);

  const rows = [];
  const characterRows = [];
  for (const legacyChar of legacyRoster) {
    const charId = String(legacyChar.slug || legacyChar.id || '');
    const publishedChar = characterById.get(charId);
    const baseIds = arr(publishedChar?.baseTechniqueIds).map(String);
    const charResolution = chooseUpstreamCharacter(legacyChar, upstreamCharacters);
    characterRows.push({
      characterId: charId, characterName: legacyChar.name, upstreamCharacter: charResolution.character?.name ?? null,
      upstreamFamily: charResolution.character?.family ?? null, matchSource: charResolution.source, score: charResolution.score ?? null,
      margin: charResolution.margin ?? null, candidates: charResolution.candidates ?? []
    });
    if (!publishedChar || baseIds.length !== 4) {
      for (let i = 0; i < 4; i++) rows.push({ characterId: charId, characterName: legacyChar.name, slot: i + 1, resolution: 'PUBLISHED_CHARACTER_LINK_FAILURE', classifications: [], evidence: { baseIds } });
      continue;
    }
    for (let i = 0; i < 4; i++) {
      const published = techniqueById.get(baseIds[i]);
      const legacySkill = arr(legacyChar.skills)[i] || {};
      if (!published) {
        rows.push({ characterId: charId, characterName: legacyChar.name, slot: i + 1, techniqueId: baseIds[i], resolution: 'PUBLISHED_TECHNIQUE_MISSING', classifications: [], evidence: {} });
        continue;
      }
      const skillResolution = chooseUpstreamSkill({ originalName: legacySkill.originalName || published.originalName || published.name, name: published.name }, charResolution.character, upstreamCharacters);
      const chosenCharacter = skillResolution.character || charResolution.character;
      const upstreamSkill = skillResolution.skill;
      const classified = classifyTechnique({ published, upstream: upstreamSkill });
      rows.push({
        characterId: charId, characterName: legacyChar.name, slot: i + 1,
        techniqueId: String(published.id), techniqueName: String(published.name || published.id), originalName: String(legacySkill.originalName || published.originalName || published.name),
        resolution: upstreamSkill ? 'RESOLVIDO' : classified.resolution,
        matchSource: skillResolution.source,
        upstreamCharacter: chosenCharacter?.name ?? null, upstreamFamily: chosenCharacter?.family ?? null,
        upstreamTechnique: upstreamSkill?.name ?? null, upstreamSource: chosenCharacter?.source ?? null,
        classifications: classified.classifications, evidence: classified.evidence,
        published: {
          description: published.description ?? '', effect: published.effect ?? null, mechanics: published.mechanics ?? [],
          chakraCost: published.chakraCost ?? [], cooldown: num(published.cooldown, 0), power: num(published.power, null), target: published.target ?? null
        },
        upstream: upstreamSkill ? {
          description: upstreamSkill.description, cost: upstreamSkill.cost, cooldown: upstreamSkill.cooldown,
          categories: upstreamSkill.categories, damage: upstreamSkill.damage, pierce: upstreamSkill.pierce, afflict: upstreamSkill.afflict,
          heal: upstreamSkill.heal, defend: upstreamSkill.defend, reduce: upstreamSkill.reduce,
          durations: upstreamSkill.durations, targets: upstreamSkill.targets
        } : null,
        candidates: skillResolution.candidates ?? []
      });
    }
  }

  if (rows.length !== 836) throw new Error(`CLASSIFICATION_ROWS:${rows.length}`);
  const counts = Object.fromEntries(CLASSIFICATIONS.map((c) => [c, rows.filter((r) => r.classifications.includes(c)).length]));
  const resolutionCounts = {};
  const matchSourceCounts = {};
  for (const r of rows) {
    resolutionCounts[r.resolution] = (resolutionCounts[r.resolution] || 0) + 1;
    matchSourceCounts[r.matchSource || '<none>'] = (matchSourceCounts[r.matchSource || '<none>'] || 0) + 1;
  }
  const unresolved = rows.filter((r) => r.resolution !== 'RESOLVIDO');
  const invalid = rows.filter((r) => !r.classifications.every((x) => CLASS_SET.has(x)) || (r.classifications.includes('CORRETA') && r.classifications.length !== 1));
  const summary = {
    generatedAt: new Date().toISOString(), contentRevision: Number(manifest.revision || 0), upstreamCommit,
    playableCharacters: legacyRoster.length, classifiedTechniques: rows.length, upstreamCharactersParsed: upstreamCharacters.length,
    resolved: rows.length - unresolved.length, unresolved: unresolved.length, classificationCounts: counts, resolutionCounts, matchSourceCounts,
    invalidRows: invalid.length,
    gate: rows.length === 836 && legacyRoster.length === 209 && unresolved.length === 0 && invalid.length === 0 ? 'PASS' : 'FAIL'
  };
  const write = (name, data) => fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2) + '\n');
  write('SUMMARY.json', summary);
  write('CLASSIFICATION-836.json', rows);
  write('CHARACTER-MATCHES-209.json', characterRows);
  if (unresolved.length) write('UNRESOLVED.json', unresolved);
  const bad = rows.filter((r) => !r.classifications.includes('CORRETA'));
  write('DIVERGENCES.json', bad);
  let md = `# Comparação canônica V2 — 209 × 4\n\n- Conteúdo publicado revision: **${summary.contentRevision}**\n- Upstream fixado: **${upstreamCommit}**\n- Personagens jogáveis: **${summary.playableCharacters}**\n- Técnicas classificadas: **${summary.classifiedTechniques}**\n- Resolvidas: **${summary.resolved}**\n- Não resolvidas: **${summary.unresolved}**\n- Gate: **${summary.gate}**\n\n## Classificações\n\n`;
  for (const c of CLASSIFICATIONS) md += `- ${c}: **${counts[c] || 0}**\n`;
  md += `\n## Divergências\n\n| Personagem | Jutsu | Slot | Classificações | Match | Upstream |\n|---|---|---:|---|---|---|\n`;
  for (const r of bad.slice(0, 500)) md += `| ${compact(r.characterName)} | ${compact(r.techniqueName)} | ${r.slot} | ${r.classifications.join(', ')} | ${r.matchSource || '—'} | ${compact(r.upstreamTechnique || '—')} |\n`;
  if (unresolved.length) {
    md += `\n## Não resolvidos\n\n| Personagem | Jutsu | Slot | Estado | Candidatos |\n|---|---|---:|---|---|\n`;
    for (const r of unresolved) md += `| ${compact(r.characterName)} | ${compact(r.techniqueName || r.originalName || r.techniqueId || '—')} | ${r.slot} | ${r.resolution} | ${compact(JSON.stringify(r.candidates || []))} |\n`;
  }
  fs.writeFileSync(path.join(outDir, 'REPORT.md'), md);
  console.log(JSON.stringify(summary, null, 2));
  if (summary.gate !== 'PASS') process.exitCode = 2;
}

function selfTest() {
  const basePublished = {
    description: 'Teste afeta um inimigo: causa 20 de dano; reduz Defesa por 2 turnos. Custo: NIN; recarga: 1 turno(s).',
    chakraCost: ['NIN'], cooldown: 1,
    mechanics: [
      { op: 'damage', amount: 20, target: 'primary' },
      { op: 'debuff', stat: 'defense', amount: 3, turns: 2, target: 'primary' }
    ]
  };
  const baseUpstream = {
    categories: ['damage', 'expose'], damage: [20], pierce: [], afflict: [], heal: [], defend: [], reduce: [],
    targets: ['enemy'], cost: ['Nin'], cooldown: 1, durations: [2]
  };
  const exact = classifyTechnique({ published: basePublished, upstream: baseUpstream });
  if (JSON.stringify(exact.classifications) !== JSON.stringify(['CORRETA'])) throw new Error(`SELFTEST_EXACT:${JSON.stringify(exact)}`);
  const wrongDamage = classifyTechnique({ published: { ...basePublished, mechanics: [{ op: 'damage', amount: 25, target: 'primary' }, basePublished.mechanics[1]] }, upstream: baseUpstream });
  if (!wrongDamage.classifications.includes('DANO_ERRADO')) throw new Error('SELFTEST_DAMAGE');
  if (!wrongDamage.classifications.includes('DESCRIÇÃO_ERRADA')) throw new Error('SELFTEST_DESCRIPTION');
  const multi = classifyTechnique({ published: { ...basePublished, chakraCost: ['TAI'], cooldown: 2, mechanics: [{ op: 'damage', amount: 20, target: 'all-allies' }, { op: 'debuff', stat: 'defense', amount: 3, turns: 3, target: 'all-allies' }] }, upstream: baseUpstream });
  for (const expected of ['ALVO_ERRADO', 'CUSTO_ERRADO', 'COOLDOWN_ERRADO', 'DURAÇÃO_ERRADA']) if (!multi.classifications.includes(expected)) throw new Error(`SELFTEST_${expected}`);
  const zeroDefaults = classifyTechnique({ published: { ...basePublished, chakraCost: ['NIN'], cooldown: 4 }, upstream: { ...baseUpstream, cost: [], cooldown: null } });
  if (!zeroDefaults.classifications.includes('CUSTO_ERRADO') || !zeroDefaults.classifications.includes('COOLDOWN_ERRADO')) throw new Error('SELFTEST_ZERO_DEFAULTS');
  const extraTarget = classifyTechnique({ published: { ...basePublished, mechanics: [...basePublished.mechanics, { op: 'heal', amount: 5, target: 'self' }] }, upstream: baseUpstream });
  if (!extraTarget.classifications.includes('ALVO_ERRADO')) throw new Error('SELFTEST_EXTRA_TARGET');
  const extraEffect = classifyTechnique({ published: { ...basePublished, mechanics: [...basePublished.mechanics, { op: 'heal', amount: 5, target: 'self' }] }, upstream: baseUpstream });
  if (!extraEffect.classifications.includes('EFEITO_ERRADO')) throw new Error('SELFTEST_EXTRA_EFFECT');
  const healMismatch=classifyTechnique({published:{description:'cura',chakraCost:['NIN'],cooldown:5,mechanics:[{op:'heal',amount:47,target:'self'},{op:'status',status:'regen',value:5,turns:2,target:'self'}]},upstream:{categories:['heal'],damage:[],pierce:[],afflict:[],heal:[15],defend:[],reduce:[],executeThresholds:[],targets:['self'],cost:['Nin'],cooldown:5,durations:[5]}});
  if(!healMismatch.classifications.includes('EFEITO_ERRADO')||!healMismatch.evidence.effectNumeric?.heal)throw new Error('SELFTEST_HEAL_NUMERIC');
  const dotMismatch=classifyTechnique({published:{description:'queimadura',chakraCost:[],cooldown:0,mechanics:[{op:'status',status:'burn',damage:5,turns:2,target:'primary'}]},upstream:{categories:['dot'],damage:[],pierce:[],afflict:[7],heal:[],defend:[],reduce:[],executeThresholds:[],targets:['enemy'],cost:[],cooldown:0,durations:[2]}});
  if(!dotMismatch.classifications.includes('EFEITO_ERRADO')||!dotMismatch.evidence.effectNumeric?.dot)throw new Error('SELFTEST_DOT_NUMERIC');
  const defenseMismatch=classifyTechnique({published:{description:'defesa',chakraCost:[],cooldown:0,mechanics:[{op:'shield',amount:20,turns:2,target:'self'}]},upstream:{categories:['defense'],damage:[],pierce:[],afflict:[],heal:[],defend:[30],reduce:[],executeThresholds:[],targets:['self'],cost:[],cooldown:0,durations:[2]}});
  if(!defenseMismatch.classifications.includes('EFEITO_ERRADO')||!defenseMismatch.evidence.effectNumeric?.defense)throw new Error('SELFTEST_DEFENSE_NUMERIC');
  const reductionFacts=upstreamFacts('Skill.desc = "Naruto gains damage reduction."\nSkill.effects = [ To Self $ apply 4 skillName [Reduce [All] Flat 15] ]');
  if(reductionFacts.categories.includes('damage')||!reductionFacts.categories.includes('reduction')||JSON.stringify(reductionFacts.reduce)!==JSON.stringify([15])||!reductionFacts.durations.includes(4))throw new Error('SELFTEST_REDUCTION_PARSER');
  const executeMismatch=classifyTechnique({published:{description:'execute',chakraCost:[],cooldown:0,mechanics:[{op:'execute',threshold:20,target:'primary'}]},upstream:{categories:['damage','execute'],damage:[],pierce:[],afflict:[],heal:[],defend:[],reduce:[],executeThresholds:[25],targets:['enemy'],cost:[],cooldown:0,durations:[]}});
  if(!executeMismatch.classifications.includes('EFEITO_ERRADO')||!executeMismatch.evidence.effectNumeric?.execute)throw new Error('SELFTEST_EXECUTE_NUMERIC');
  const supportedGap = classifyTechnique({ published: basePublished, upstream: { ...baseUpstream, categories: [...baseUpstream.categories, 'redirect'] } });
  if (supportedGap.classifications.includes('MOTOR_INSUFICIENTE')) throw new Error('SELFTEST_SUPPORTED_GAP_MOTOR');
  if (!supportedGap.classifications.includes('EFEITO_ERRADO')) throw new Error('SELFTEST_SUPPORTED_GAP_EFFECT');
  const futureGap = classifyTechnique({ published: basePublished, upstream: { ...baseUpstream, categories: [...baseUpstream.categories, 'future-unimplemented'] } });
  if (!futureGap.classifications.includes('MOTOR_INSUFICIENTE')) throw new Error('SELFTEST_FUTURE_MOTOR');
  const unresolved = classifyTechnique({ published: basePublished, upstream: null });
  if (unresolved.resolution !== 'UPSTREAM_NAO_RESOLVIDO' || unresolved.classifications.length) throw new Error('SELFTEST_UNRESOLVED');
  console.log('CANONICAL_UPSTREAM_CLASSIFIER_V2_SELFTEST=PASS');
}

if (has('--self-test')) selfTest();
else await main();

export { CLASSIFICATIONS, classifyTechnique, chooseUpstreamCharacter, chooseUpstreamSkill, publishedCategories, publishedTargets, publishedDurations };
