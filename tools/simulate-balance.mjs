import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const outDir = path.join(root, 'audit', 'balance', 'simulation');
fs.mkdirSync(outDir, { recursive: true });

const context = { window: {}, console, setTimeout, clearTimeout };
context.window.window = context.window;
vm.createContext(context);
for (const file of ['roster.js', 'jutsu-variants.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file, timeout: 30000 });
}
const roster = context.window.NARUTO_ROSTER;
if (!Array.isArray(roster) || roster.length < 2) throw new Error('NARUTO_ROSTER ausente ou insuficiente');

const TYPES = ['Blood', 'Gen', 'Nin', 'Tai'];
const POLICIES = ['balanced', 'aggressive', 'control', 'support', 'focus'];
const MAX_PER_TYPE = 8;
const MAX_TOTAL = 24;
const TURN_GAIN = 3;
const MAX_TURNS = Math.max(12, Number(process.env.BALANCE_MAX_TURNS || 40));
const DUEL_SEEDS = Math.max(1, Number(process.env.BALANCE_DUEL_SEEDS || 1));
const TEAM_BATTLES = Math.max(1000, Number(process.env.BALANCE_TEAM_BATTLES || 12000));

const n = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const round = (v, d = 4) => Number(Number(v || 0).toFixed(d));
const idOf = c => String(c?.slug ?? c?.id ?? c?.name ?? 'unknown');
const alive = team => team.filter(f => f.hp > 0);
const emptyCh = () => ({ Blood: 0, Gen: 0, Nin: 0, Tai: 0 });
const chakraTotal = ch => TYPES.reduce((s, k) => s + n(ch?.[k]), 0);

function hash32(s) {
  let h = 2166136261 >>> 0;
  for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function seeded(seed) {
  let a = hash32(seed);
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function wilson(w, total, z = 1.96) {
  if (!total) return [0, 1];
  const p = w / total, z2 = z * z, den = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / den;
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total) / den;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

function chakraDemand(team) {
  const w = { Blood: 1, Gen: 1, Nin: 1, Tai: 1 };
  for (const f of alive(team)) {
    for (const sk of f.skills || []) {
      for (const c of sk.cost || []) if (TYPES.includes(c)) w[c] += 1;
    }
  }
  return w;
}
function gain(ch, amount, team, rng) {
  let left = Math.max(0, Math.trunc(amount));
  while (left-- > 0 && chakraTotal(ch) < MAX_TOTAL) {
    const weights = chakraDemand(team);
    const available = TYPES.filter(k => n(ch[k]) < MAX_PER_TYPE);
    if (!available.length) break;
    const total = available.reduce((s, k) => s + weights[k], 0) || 1;
    let r = rng() * total;
    let pick = available.at(-1);
    for (const k of available) { r -= weights[k]; if (r <= 0) { pick = k; break; } }
    ch[pick] = n(ch[pick]) + 1;
  }
  return ch;
}
function paymentPlan(ch, cost) {
  const t = Object.fromEntries(TYPES.map(k => [k, n(ch?.[k])]));
  let wild = 0;
  for (const c of cost || []) {
    if (c === 'Rand') { wild += 1; continue; }
    if (!TYPES.includes(c) || t[c] <= 0) return null;
    t[c] -= 1;
  }
  while (wild-- > 0) {
    const candidates = TYPES.filter(k => t[k] > 0).sort((a, b) => t[b] - t[a]);
    if (!candidates.length) return null;
    t[candidates[0]] -= 1;
  }
  return t;
}
const canPay = (ch, cost) => !!paymentPlan(ch, cost);
function pay(ch, cost) {
  const p = paymentPlan(ch, cost);
  if (!p) return false;
  for (const k of TYPES) ch[k] = p[k];
  return true;
}

function cloneCharacter(c) {
  return {
    slug: idOf(c), name: c.name || idOf(c), hp: 100, maxHp: 100,
    shield: 0, shieldTurns: 0, stun: 0, stunTurns: 0,
    dot: 0, dotTurns: 0, dotSource: null, inv: 0, invTurns: 0,
    damageBonus: 0, damageReduction: 0, controlBonus: 0, healBonus: 0, shieldBonus: 0, turnRegen: 0,
    skills: (c.skills || []).map((s, i) => ({
      ...structuredClone(s), mechanic: { ...(s.mechanic || {}) }, cost: [...(s.cost || [])],
      cd: 0, slot: i + 1, jutsuId: `${idOf(c)}:${i + 1}`
    }))
  };
}
function hit(target, amount) {
  if (target.inv) return { hp: 0, shield: 0 };
  let dmg = Math.max(0, Math.round(n(amount) - n(target.damageReduction)));
  const shield = Math.min(target.shield, dmg);
  target.shield -= shield; dmg -= shield;
  const before = target.hp;
  target.hp = Math.max(0, target.hp - dmg);
  return { hp: before - target.hp, shield };
}
function kindOf(sk) { return String(sk?.mechanic?.kind || 'damage'); }
function powerOf(sk) { return Math.max(0, n(sk?.mechanic?.power, 25)); }

function skillStat(map, user, sk) {
  const key = sk.jutsuId;
  if (!map.has(key)) map.set(key, {
    jutsuId: key, characterId: user.slug, characterName: user.name, slot: sk.slot, name: sk.name || `Slot ${sk.slot}`,
    kind: kindOf(sk), costUnits: (sk.cost || []).length, cooldown: n(sk.cooldown), power: powerOf(sk),
    attempts: 0, executions: 0, damage: 0, dotDamage: 0, absorbed: 0, heal: 0, shield: 0,
    stuns: 0, stunTurnsApplied: 0, invulnTurnsApplied: 0, dotApplications: 0, kos: 0
  });
  return map.get(key);
}
function targetPool(own, enemy, user, sk) {
  const m = sk.mechanic || {};
  if (m.target === 'self') return [user];
  return m.target === 'enemy' ? alive(enemy) : alive(own);
}
function scoreTarget(target, sk, policy) {
  const m = sk.mechanic || {}, kind = kindOf(sk), power = powerOf(sk);
  const ratio = target.hp / Math.max(1, target.maxHp), missing = target.maxHp - target.hp;
  const effective = target.hp + target.shield;
  let score = -(sk.cost || []).length * 4;
  if (kind === 'damage') { score += power; if (m.target === 'enemy' && power >= effective) score += 125; if (target.inv) score -= 150; }
  if (kind === 'stun') { score += power + 50; score += target.stun ? -130 : 38; }
  if (kind === 'dot') { score += power + 38; score += target.dot ? -100 : 30; }
  if (kind === 'heal') { score += Math.min(power, missing) * 2.6; if (missing <= 0) score -= 260; if (ratio < .38) score += 90; }
  if (kind === 'shield') { score += (1 - ratio) * 95; if (target.shield > 18) score -= 125; if (ratio > .82) score -= 70; }
  if (kind === 'invuln') { score += ratio < .35 ? 135 : 20; if (target.inv) score -= 210; if (ratio > .72) score -= 80; }
  if (m.aoe) score += 28;
  if (policy === 'aggressive') score += ['damage', 'dot', 'stun'].includes(kind) ? 38 : -22;
  if (policy === 'control') score += kind === 'stun' ? 65 : kind === 'dot' ? 50 : 0;
  if (policy === 'support') score += ['heal', 'shield', 'invuln'].includes(kind) ? 58 : -8;
  if (policy === 'focus' && m.target === 'enemy') score += (1 - ratio) * 75;
  return score;
}
function planActions(own, enemy, ch, policy, rng) {
  const acts = [], availableCh = { ...ch };
  for (let ui = 0; ui < own.length; ui++) {
    const user = own[ui];
    if (!user || user.hp <= 0) continue;
    if (user.stun) { acts.push({ user: ui, stunned: true }); continue; }
    const choices = [];
    for (let si = 0; si < user.skills.length; si++) {
      const sk = user.skills[si];
      if (sk.cd > 0 || !canPay(availableCh, sk.cost)) continue;
      for (const target of targetPool(own, enemy, user, sk)) {
        choices.push({ user: ui, skill: si, target, score: scoreTarget(target, sk, policy) + rng() * 12 });
      }
    }
    if (!choices.length) continue;
    choices.sort((a, b) => b.score - a.score);
    const pick = choices[0], sk = user.skills[pick.skill];
    pay(availableCh, sk.cost);
    acts.push(pick);
  }
  return { acts, ch: availableCh };
}
function applySkill(user, target, sk, rng, stat) {
  const m = sk.mechanic || { kind: 'damage', power: 25, target: 'enemy' };
  const kind = kindOf(sk), duration = Math.max(0, n(m.duration));
  let power = Math.max(1, Math.round(powerOf(sk) + n(user.damageBonus)));
  stat.executions += 1;
  if (kind === 'heal') {
    power += n(user.healBonus); const before = target.hp;
    target.hp = Math.min(target.maxHp, target.hp + power); stat.heal += target.hp - before;
  } else if (kind === 'shield') {
    power += n(user.shieldBonus); target.shield += power;
    target.shieldTurns = Math.max(target.shieldTurns || 0, duration || 0); stat.shield += power;
  } else if (kind === 'invuln') {
    const turns = duration || 1; target.inv = 1; target.invTurns = Math.max(target.invTurns || 0, turns); stat.invulnTurnsApplied += turns;
  } else {
    const wasAlive = target.hp > 0;
    const dealt = hit(target, Math.round(power * (.9 + rng() * .2)));
    stat.damage += dealt.hp; stat.absorbed += dealt.shield;
    if (kind === 'stun' && target.hp) {
      const turns = (duration || 1) + n(user.controlBonus);
      target.stun = 1; target.stunTurns = Math.max(target.stunTurns || 0, turns);
      stat.stuns += 1; stat.stunTurnsApplied += turns;
    }
    if (kind === 'dot' && target.hp) {
      target.dot = 7; target.dotTurns = Math.max(target.dotTurns || 0, duration || 1);
      target.dotSource = stat.jutsuId; stat.dotApplications += 1;
    }
    if (wasAlive && !target.hp) stat.kos += 1;
  }
  sk.cd = Math.max(sk.cd, n(sk.cooldown));
}
function performPhase(own, enemy, ch, policy, rng, stats) {
  const plan = planActions(own, enemy, ch, policy, rng);
  for (const act of plan.acts) {
    const user = own[act.user];
    if (!user || user.hp <= 0) continue;
    if (act.stunned || user.stun) {
      user.stunTurns = Math.max(0, (user.stunTurns || 1) - 1);
      user.stun = user.stunTurns > 0 ? 1 : 0;
      continue;
    }
    const sk = user.skills[act.skill]; if (!sk) continue;
    const stat = skillStat(stats, user, sk); stat.attempts += 1;
    const pool = targetPool(own, enemy, user, sk);
    const targets = sk.mechanic?.aoe ? pool : [act.target?.hp > 0 ? act.target : pool[0]].filter(Boolean);
    for (const target of targets) applySkill(user, target, sk, rng, stat);
  }
  return plan.ch;
}
function expireDefense(team) {
  for (const f of team) {
    if (f.inv) { f.invTurns = Math.max(0, (f.invTurns || 1) - 1); if (f.invTurns <= 0) f.inv = 0; }
    if (f.shield && f.shieldTurns > 0) { f.shieldTurns -= 1; if (f.shieldTurns <= 0) f.shield = 0; }
  }
}
function tick(team, stats, metric) {
  for (const f of team) {
    if (f.hp > 0 && f.turnRegen > 0 && f.hp < f.maxHp) {
      const before = f.hp; f.hp = Math.min(f.maxHp, f.hp + f.turnRegen); metric.heal += f.hp - before;
    }
    if (f.hp > 0 && f.dot && f.dotTurns > 0) {
      const dealt = hit(f, f.dot); metric.dotDamage += dealt.hp;
      if (f.dotSource && stats.has(f.dotSource)) stats.get(f.dotSource).dotDamage += dealt.hp;
      f.dotTurns -= 1; if (f.dotTurns <= 0) { f.dot = 0; f.dotSource = null; }
    }
    for (const sk of f.skills) if (sk.cd) sk.cd -= 1;
  }
}
const effectiveHp = team => team.reduce((s, f) => s + Math.max(0, f.hp) + Math.max(0, f.shield), 0);
function metric() { return { damage: 0, dotDamage: 0, heal: 0, shield: 0, control: 0 }; }

function simulate(charsA, charsB, { seed, policyA = 'balanced', policyB = 'balanced', first = 'A', skillStats }) {
  const rng = seeded(seed), A = charsA.map(cloneCharacter), B = charsB.map(cloneCharacter);
  let chA = gain(emptyCh(), 6, A, rng), chB = gain(emptyCh(), 6, B, rng);
  const aM = metric(), bM = metric();
  let turn = 1;
  for (; turn <= MAX_TURNS; turn++) {
    const runA = () => { chA = performPhase(A, B, chA, policyA, rng, skillStats); expireDefense(B); };
    const runB = () => { chB = performPhase(B, A, chB, policyB, rng, skillStats); expireDefense(A); };
    const turnFirst = ((turn - 1) % 2 === 0) ? first : (first === 'A' ? 'B' : 'A');
    if (turnFirst === 'A') { runA(); if (!alive(B).length) break; runB(); }
    else { runB(); if (!alive(A).length) break; runA(); }
    if (!alive(A).length || !alive(B).length) break;
    tick(A, skillStats, aM); tick(B, skillStats, bM);
    if (!alive(A).length || !alive(B).length) break;
    gain(chA, TURN_GAIN, A, rng); gain(chB, TURN_GAIN, B, rng);
  }
  let winner = alive(A).length && !alive(B).length ? 'A' : alive(B).length && !alive(A).length ? 'B' : 'D';
  if (winner === 'D' && turn > MAX_TURNS) {
    const ea = effectiveHp(A), eb = effectiveHp(B);
    if (Math.abs(ea - eb) > 5) winner = ea > eb ? 'A' : 'B';
  }
  const side = (team, ch) => ({ alive: alive(team).length, effectiveHp: effectiveHp(team), chakra: chakraTotal(ch) });
  return { winner, turns: Math.min(turn, MAX_TURNS), A: side(A, chA), B: side(B, chB) };
}

function accumulator() {
  return { games: 0, wins: 0, losses: 0, draws: 0, turns: 0, hp: 0, chakra: 0, firstGames: 0, firstWins: 0, secondGames: 0, secondWins: 0, policies: Object.fromEntries(POLICIES.map(p => [p, { games: 0, wins: 0, draws: 0 }])) };
}
function addResult(acc, result, side, oppPolicy, first) {
  acc.games += 1; const win = result.winner === side, draw = result.winner === 'D';
  if (win) acc.wins += 1; else if (draw) acc.draws += 1; else acc.losses += 1;
  acc.turns += result.turns; const own = result[side]; acc.hp += own.effectiveHp; acc.chakra += own.chakra;
  const p = acc.policies[oppPolicy]; p.games += 1; if (win) p.wins += 1; if (draw) p.draws += 1;
  if (first) { acc.firstGames += 1; if (win) acc.firstWins += 1; }
  else { acc.secondGames += 1; if (win) acc.secondWins += 1; }
}
function finalize(c, acc) {
  const decisive = Math.max(1, acc.games - acc.draws), wr = acc.wins / decisive, ci = wilson(acc.wins, decisive);
  const policyWinRates = Object.fromEntries(POLICIES.map(p => {
    const x = acc.policies[p], d = Math.max(1, x.games - x.draws); return [p, round(x.wins / d)];
  }));
  const rates = Object.values(policyWinRates);
  return {
    characterId: idOf(c), name: c.name || idOf(c), games: acc.games, wins: acc.wins, losses: acc.losses, draws: acc.draws,
    winRate: round(wr), winRate95: ci.map(x => round(x)), avgTurns: round(acc.turns / acc.games),
    avgEffectiveHpRemaining: round(acc.hp / acc.games), avgChakraRemaining: round(acc.chakra / acc.games),
    firstSideWinRate: round(acc.firstWins / Math.max(1, acc.firstGames)), secondSideWinRate: round(acc.secondWins / Math.max(1, acc.secondGames)),
    sideBias: round(acc.firstWins / Math.max(1, acc.firstGames) - acc.secondWins / Math.max(1, acc.secondGames)),
    opponentPolicyWinRates: policyWinRates,
    exploitabilityProxy: round(Math.max(...rates) - Math.min(...rates))
  };
}

const duelAcc = new Map(roster.map(c => [idOf(c), accumulator()]));
const teamAcc = new Map(roster.map(c => [idOf(c), accumulator()]));
const skillStats = new Map();
for (const c of roster) {
  const u = cloneCharacter(c);
  for (const sk of u.skills) skillStat(skillStats, u, sk);
}
let battles = 0;

for (let i = 0; i < roster.length; i++) {
  for (let j = i + 1; j < roster.length; j++) {
    const a = roster[i], b = roster[j];
    for (const policy of POLICIES) {
      for (let r = 0; r < DUEL_SEEDS; r++) {
        let result = simulate([a], [b], { seed: `duel:${i}:${j}:${policy}:${r}:a-vs-policy:firstA`, policyA: 'balanced', policyB: policy, first: 'A', skillStats });
        addResult(duelAcc.get(idOf(a)), result, 'A', policy, true); addResult(duelAcc.get(idOf(b)), result, 'B', 'balanced', false); battles += 1;
        result = simulate([a], [b], { seed: `duel:${i}:${j}:${policy}:${r}:a-vs-policy:firstB`, policyA: 'balanced', policyB: policy, first: 'B', skillStats });
        addResult(duelAcc.get(idOf(a)), result, 'A', policy, false); addResult(duelAcc.get(idOf(b)), result, 'B', 'balanced', true); battles += 1;

        result = simulate([a], [b], { seed: `duel:${i}:${j}:${policy}:${r}:policy-vs-b:firstA`, policyA: policy, policyB: 'balanced', first: 'A', skillStats });
        addResult(duelAcc.get(idOf(a)), result, 'A', 'balanced', true); addResult(duelAcc.get(idOf(b)), result, 'B', policy, false); battles += 1;
        result = simulate([a], [b], { seed: `duel:${i}:${j}:${policy}:${r}:policy-vs-b:firstB`, policyA: policy, policyB: 'balanced', first: 'B', skillStats });
        addResult(duelAcc.get(idOf(a)), result, 'A', 'balanced', false); addResult(duelAcc.get(idOf(b)), result, 'B', policy, true); battles += 1;
      }
    }
  }
}

const teamRng = seeded('naruto-team-meta-v2');
for (let battleNo = 0; battleNo < TEAM_BATTLES; battleNo++) {
  const ids = Array.from({ length: roster.length }, (_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(teamRng() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  const A = ids.slice(0, 3).map(i => roster[i]), B = ids.slice(3, 6).map(i => roster[i]);
  const policyA = POLICIES[Math.floor(teamRng() * POLICIES.length)], policyB = POLICIES[Math.floor(teamRng() * POLICIES.length)];
  const first = teamRng() < .5 ? 'A' : 'B';
  const result = simulate(A, B, { seed: `team:${battleNo}:${teamRng()}`, policyA, policyB, first, skillStats }); battles += 1;
  for (const c of A) addResult(teamAcc.get(idOf(c)), result, 'A', policyB, first === 'A');
  for (const c of B) addResult(teamAcc.get(idOf(c)), result, 'B', policyA, first === 'B');
}

const duels = roster.map(c => finalize(c, duelAcc.get(idOf(c))));
const teams = roster.map(c => finalize(c, teamAcc.get(idOf(c))));
const byId = new Map(teams.map(x => [x.characterId, x]));
function flags(d, t) {
  const out = [];
  if (d.winRate95[0] > .57) out.push('DUEL_FORTE_COM_CONFIANCA');
  if (d.winRate95[1] < .43) out.push('DUEL_FRACO_COM_CONFIANCA');
  if (t.winRate95[0] > .57) out.push('3V3_FORTE_COM_CONFIANCA');
  if (t.winRate95[1] < .43) out.push('3V3_FRACO_COM_CONFIANCA');
  if (Math.abs(d.sideBias) > .08 || Math.abs(t.sideBias) > .08) out.push('VIES_DE_INICIATIVA');
  if (d.exploitabilityProxy > .25 || t.exploitabilityProxy > .25) out.push('SENSIVEL_A_POLITICA_ADVERSARIA');
  if (d.avgTurns < 3) out.push('TTK_DUELO_MUITO_BAIXO');
  if (t.avgTurns > 25) out.push('TTK_3V3_MUITO_ALTO');
  return out;
}
const characters = duels.map(d => ({ characterId: d.characterId, name: d.name, duel: d, team3v3: byId.get(d.characterId), flags: flags(d, byId.get(d.characterId)) }));
const flagged = characters.filter(x => x.flags.length).sort((a, b) => b.flags.length - a.flags.length || Math.abs(b.duel.winRate - .5) - Math.abs(a.duel.winRate - .5));
const jutsus = [...skillStats.values()].map(s => ({
  ...s, avgDamagePerExecution: round((s.damage + s.dotDamage) / Math.max(1, s.executions)),
  avgHealPerExecution: round(s.heal / Math.max(1, s.executions)), avgShieldPerExecution: round(s.shield / Math.max(1, s.executions)),
  executionRate: round(s.executions / Math.max(1, s.attempts))
}));
const summary = {
  generatedAt: new Date().toISOString(), schemaVersion: 2, roster: roster.length, jutsus: jutsus.length, battles,
  duelSeeds: DUEL_SEEDS, teamBattles: TEAM_BATTLES, maxTurns: MAX_TURNS, policies: POLICIES, flaggedCharacters: flagged.length,
  methodology: {
    monteCarlo: 'RNG determinístico por seed; todos os pares 1x1 e amostra 3x3.',
    confidence: 'Wilson 95% sobre partidas decisivas.',
    sideFairness: 'Duelo repetido com inversão de iniciativa.',
    exploitabilityProxy: 'Amplitude de win rate contra políticas adversárias; não é NashConv formal.',
    engineSemantics: ['chakra ponderado pela demanda do time', 'Blood/Gen/Nin/Tai + Rand', '6 chakra inicial', '+3 chakra/turno', 'max 8/tipo e 24 total', 'cooldown no tick', 'stun perde ação', 'DoT = dano inicial + 7/tick', 'shield como pool', 'invuln expira após fase adversária', 'AoE em alvos vivos']
  },
  references: ['DevBawky/Kalivra', 'genshinsim/gcsim', 'google-deepmind/open_spiel', 'kirtr/dnd-combat-sim']
};

fs.writeFileSync(path.join(outDir, 'SUMMARY.json'), JSON.stringify(summary, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'DUEL-GAUNTLET.json'), JSON.stringify(duels, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'TEAM-3V3-GAUNTLET.json'), JSON.stringify(teams, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'CHARACTER-SIMULATION.json'), JSON.stringify(characters, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'JUTSU-SIMULATION.json'), JSON.stringify(jutsus, null, 2) + '\n');

let md = `# Simulação de balanceamento Naruto Unison\n\nGerado em ${summary.generatedAt}.\n\n- Personagens: **${summary.roster}**\n- Jutsus: **${summary.jutsus}**\n- Batalhas simuladas: **${summary.battles}**\n- Personagens sinalizados: **${summary.flaggedCharacters}**\n\n## Método\n\nMonte Carlo com sementes reproduzíveis, todos os confrontos 1×1, amostra 3×3, inversão de iniciativa, intervalo Wilson 95%, TTK, PV/escudo e chakra restantes e sensibilidade a políticas adversárias. O proxy de explorabilidade é apenas a amplitude do win rate contra as políticas testadas, não NashConv formal.\n\n## Referências aplicadas\n\n- **Kalivra:** Monte Carlo, TTK, intervalos de confiança e logs explicáveis.\n- **gcsim:** configuração reproduzível e validação da semântica antes da otimização.\n- **OpenSpiel:** testar resposta adversária/explorabilidade em vez de uma IA única.\n- **dnd-combat-sim:** win rate, rodadas e vida restante como métricas de combate.\n\n## Casos sinalizados\n\n| Personagem | Duelo | IC95 | 3×3 | IC95 | TTK duelo | TTK 3×3 | Exploit. duelo | Exploit. 3×3 | Flags |\n|---|---:|---|---:|---|---:|---:|---:|---:|---|\n`;
for (const x of flagged.slice(0, 140)) {
  md += `| ${x.name} | ${(x.duel.winRate * 100).toFixed(1)}% | ${(x.duel.winRate95[0] * 100).toFixed(1)}–${(x.duel.winRate95[1] * 100).toFixed(1)}% | ${(x.team3v3.winRate * 100).toFixed(1)}% | ${(x.team3v3.winRate95[0] * 100).toFixed(1)}–${(x.team3v3.winRate95[1] * 100).toFixed(1)}% | ${x.duel.avgTurns} | ${x.team3v3.avgTurns} | ${x.duel.exploitabilityProxy} | ${x.team3v3.exploitabilityProxy} | ${x.flags.join(', ')} |\n`;
}
md += `\n## Regra de alteração\n\nNenhum nerf/buff é automático. Uma mudança numérica só entra quando convergem: **(1)** divergência canônica/mecânica comprovada, **(2)** outlier estático e **(3)** simulação com intervalo de confiança fora da banda-alvo. Depois de qualquer mudança, esta matriz deve ser executada novamente.\n`;
fs.writeFileSync(path.join(outDir, 'SIMULATION-REPORT.md'), md);

console.log(JSON.stringify(summary, null, 2));
if (roster.length !== 209) throw new Error(`roster esperado 209; atual ${roster.length}`);
if (jutsus.length !== roster.length * 4) throw new Error(`jutsus esperado ${roster.length * 4}; atual ${jutsus.length}`);
if (battles < 1000) throw new Error(`simulação insuficiente: ${battles} batalhas`);
