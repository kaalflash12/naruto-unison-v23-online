import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-idempotency-key',
  'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
  'content-type': 'application/json; charset=utf-8',
};
const json = (x: unknown, s = 200) => new Response(JSON.stringify(x), { status: s, headers: cors });
const fail = (s: number, code: string, error: string) => json({ ok: false, code, error }, s);
const n = (v: unknown, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp0 = (v: unknown) => Math.max(0, n(v));
const bool = (v: unknown, d = false) => v === undefined ? d : (v === true || v === 'true' || v === 1 || v === '1');

function pick(name: string, legacy: string) {
  const raw = Deno.env.get(name);
  if (raw) {
    try {
      const obj = JSON.parse(raw);
      return String(obj.default ?? Object.values(obj)[0] ?? '');
    } catch {
      return raw;
    }
  }
  return Deno.env.get(legacy) ?? '';
}

const admin = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  pick('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const userClient = (req: Request) => createClient(
  Deno.env.get('SUPABASE_URL')!,
  pick('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY'),
  { global: { headers: { Authorization: req.headers.get('Authorization') || '' } }, auth: { persistSession: false, autoRefreshToken: false } },
);

function routePath(req: Request) {
  const p = new URL(req.url).pathname;
  for (const m of ['/functions/v1/admin-gameops', '/admin-gameops']) {
    const i = p.indexOf(m);
    if (i >= 0) {
      const rest = p.slice(i + m.length);
      return rest || '/';
    }
  }
  return p || '/';
}

async function requirePermission(req: Request, permission: string) {
  const uc = userClient(req);
  const { data, error } = await uc.auth.getUser();
  if (error || !data.user) throw Object.assign(new Error('Sessão inválida.'), { status: 401 });
  const db = admin();
  const p = await db.from('admin_principals').select('id').eq('user_id', data.user.id).eq('active', true).maybeSingle();
  if (p.error) throw p.error;
  if (!p.data) throw Object.assign(new Error('Principal administrativo inativo ou ausente.'), { status: 403 });
  const rr = await db.from('admin_principal_roles').select('role').eq('principal_id', p.data.id);
  if (rr.error) throw rr.error;
  const roles = [...new Set((rr.data || []).map((x: any) => String(x.role)).filter(Boolean))];
  if (!roles.length) throw Object.assign(new Error('Nenhuma função administrativa atribuída.'), { status: 403 });
  const pr = await db.from('admin_role_permissions').select('role,permission').in('role', roles).eq('permission', permission).limit(1);
  if (pr.error) throw pr.error;
  if (!(pr.data || []).length) throw Object.assign(new Error('Permissão insuficiente.'), { status: 403 });
  return { user: data.user, db, principal: { id: p.data.id }, roles };
}

async function audit(db: any, principalId: string, action: string, targetType: string, targetId: string, before: unknown, after: unknown) {
  const r = await db.from('admin_audit_log').insert({
    principal_id: principalId,
    action,
    target_type: targetType,
    target_id: targetId,
    before: before ?? null,
    after: after ?? null,
  });
  if (r.error) throw r.error;
}

async function protectedAdminRole(db: any, userId: string | null | undefined) {
  if (!userId) return null;
  const p = await db.from('admin_principals').select('id,display_name,active').eq('user_id', userId).eq('active', true).maybeSingle();
  if (p.error) throw p.error;
  if (!p.data) return null;
  const rr = await db.from('admin_principal_roles').select('role').eq('principal_id', p.data.id);
  if (rr.error) throw rr.error;
  const roles = (rr.data || []).map((x: any) => String(x.role).toLowerCase());
  const protectedRole = roles.find((role: string) => role === 'owner' || role === 'admin');
  return protectedRole ? { principalId: p.data.id, role: protectedRole, displayName: p.data.display_name || null } : null;
}

const authAccount = (r: any) => ({
  id: `AUTH:${r.user_id}`,
  targetKind: 'AUTH',
  targetId: r.user_id,
  username: r.username || '(sem nome)',
  level: n(r.level, 1),
  xp: n(r.xp),
  ryo: n(r.ryo),
  rank: r.rank || '',
  banned: !!r.banned,
  banReason: r.ban_reason || null,
  moderationSupported: true,
  recoveryReady: true,
  linkedAuth: true,
  createdAt: r.created_at,
});

const legacyAccount = (r: any) => {
  const p = r.profile || {};
  return {
    id: `LEGACY:${r.id}`,
    targetKind: 'LEGACY',
    targetId: r.id,
    username: r.user_name,
    level: n(p.level, 1),
    xp: n(p.xp),
    ryo: n(p.ryo),
    rank: p.rank || '',
    banned: !!r.banned,
    banReason: r.ban_reason || null,
    moderationSupported: true,
    recoveryReady: !!r.recovery_verified,
    linkedAuth: !!r.auth_user_id,
    revision: n(r.revision),
    createdAt: r.created_at,
  };
};

async function exactCount(q: any) {
  const r = await q;
  if (r.error) throw r.error;
  return r.count || 0;
}

function seasonConfig(body: any, base: Record<string, unknown> = {}) {
  const out: any = { ...(base || {}) };
  if (body.xpMultiplier !== undefined) out.xpMultiplier = Math.max(0, n(body.xpMultiplier, 1));
  if (body.ryoMultiplier !== undefined) out.ryoMultiplier = Math.max(0, n(body.ryoMultiplier, 1));
  if (body.rankedEnabled !== undefined) out.rankedEnabled = bool(body.rankedEnabled, true);
  return body.config && typeof body.config === 'object' ? { ...out, ...body.config } : out;
}

function seasonRewards(body: any, base: Record<string, unknown> = {}) {
  const out: any = { ...(base || {}) };
  if (body.championRyo !== undefined) out.championRyo = clamp0(body.championRyo);
  if (body.top10Ryo !== undefined) out.top10Ryo = clamp0(body.top10Ryo);
  return body.rewards && typeof body.rewards === 'object' ? { ...out, ...body.rewards } : out;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const db = admin();
    const path = routePath(req);
    const b: any = await req.json().catch(() => ({}));

    if (path === '/status' && req.method === 'GET') {
      await requirePermission(req, 'accounts.read');
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const [profiles, authBanned, legacyBanned, rooms, queue, activeMatches, presence, season] = await Promise.all([
        exactCount(db.from('profiles').select('*', { count: 'exact', head: true })),
        exactCount(db.from('profiles').select('*', { count: 'exact', head: true }).eq('banned', true)),
        exactCount(db.from('naruto_accounts').select('*', { count: 'exact', head: true }).eq('banned', true)),
        exactCount(db.from('naruto_rooms').select('*', { count: 'exact', head: true })),
        exactCount(db.from('ranked_queue').select('*', { count: 'exact', head: true })),
        exactCount(db.from('ranked_matches').select('*', { count: 'exact', head: true }).in('status', ['ACTIVE', 'PLAYING', 'IN_PROGRESS'])),
        db.from('naruto_online_presence').select('user_id,last_seen,activity,room_id').gte('last_seen', since).order('last_seen', { ascending: false }).limit(100),
        db.from('game_seasons').select('id,slug,name,status,starts_at,ends_at').eq('status', 'ACTIVE').order('starts_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (presence.error) throw presence.error;
      if (season.error) throw season.error;
      const rows = presence.data || [];
      const ids = [...new Set(rows.map((x: any) => x.user_id).filter(Boolean))];
      let names: Record<string, string> = {};
      if (ids.length) {
        const p = await db.from('profiles').select('user_id,username').in('user_id', ids);
        if (p.error) throw p.error;
        names = Object.fromEntries((p.data || []).map((x: any) => [x.user_id, x.username]));
      }
      const activity: Record<string, number> = {};
      for (const r of rows) activity[r.activity || 'unknown'] = (activity[r.activity || 'unknown'] || 0) + 1;
      return json({ ok: true, status: { online: rows.length, profiles, banned: authBanned + legacyBanned, authBanned, legacyBanned, rooms, queue, activeMatches, activity, activeSeason: season.data || null, presence: rows.map((r: any) => ({ ...r, username: names[r.user_id] || r.user_id })) } });
    }

    if (path === '/audit' && req.method === 'GET') {
      await requirePermission(req, 'audit.read');
      const r = await db.from('admin_audit_log').select('id,principal_id,action,target_type,target_id,before,after,request_id,created_at').order('created_at', { ascending: false }).limit(200);
      if (r.error) throw r.error;
      return json({ ok: true, entries: r.data || [] });
    }

    if (path === '/accounts' && req.method === 'GET') {
      await requirePermission(req, 'accounts.read');
      const q = new URL(req.url).searchParams.get('q') || '';
      let a = db.from('profiles').select('user_id,username,level,xp,ryo,rank,banned,ban_reason,created_at').limit(200);
      let l = db.from('naruto_accounts').select('id,user_name,profile,revision,auth_user_id,recovery_verified,banned,ban_reason,banned_at,banned_by,created_at').limit(200);
      if (q) {
        a = a.ilike('username', `%${q}%`);
        l = l.ilike('user_name', `%${q}%`);
      }
      const [ar, lr] = await Promise.all([a, l]);
      if (ar.error) throw ar.error;
      if (lr.error) throw lr.error;
      const accounts = [...(ar.data || []).map(authAccount), ...(lr.data || []).map(legacyAccount)].sort((x, y) => String(x.username).localeCompare(String(y.username), 'pt-BR'));
      return json({ ok: true, accounts });
    }

    const am = path.match(/^\/accounts\/([^/]+)$/);
    if (am && req.method === 'PATCH') {
      const id = decodeURIComponent(am[1]);
      const [kind, targetId] = id.includes(':') ? id.split(':', 2) : ['AUTH', id];
      const econ = Number.isFinite(Number(b.ryoDelta)) || Number.isFinite(Number(b.xpDelta));
      const mod = b.toggleBan !== undefined;
      if (!econ && !mod) return fail(400, 'ACCOUNT_PATCH', 'Nenhuma alteração suportada.');
      const ctx = await requirePermission(req, econ ? 'accounts.economy' : 'accounts.moderate');
      if (econ && mod) await requirePermission(req, 'accounts.moderate');

      if (kind === 'LEGACY') {
        const { data: before, error } = await db.from('naruto_accounts').select('*').eq('id', targetId).single();
        if (error || !before) return fail(404, 'ACCOUNT', 'Conta legada ausente.');
        const p = { ...(before.profile || {}) };
        const patch: any = {};
        if (Number.isFinite(Number(b.ryoDelta))) p.ryo = clamp0(n(p.ryo) + n(b.ryoDelta));
        if (Number.isFinite(Number(b.xpDelta))) p.xp = clamp0(n(p.xp) + n(b.xpDelta));
        if (econ) patch.profile = p;
        if (mod) {
          const nextBanned = !before.banned;
          if (nextBanned && before.auth_user_id) {
            const protectedRole = await protectedAdminRole(db, before.auth_user_id);
            if (protectedRole) return fail(403, 'PROTECTED_ADMIN', 'Conta vinculada a OWNER/ADMIN não pode ser banida.');
          }
          patch.banned = nextBanned;
          patch.ban_reason = nextBanned ? (String(b.reason || '').trim() || null) : null;
          patch.banned_at = nextBanned ? new Date().toISOString() : null;
          patch.banned_by = nextBanned ? ctx.user.id : null;
        }
        patch.revision = n(before.revision) + 1;
        patch.saved_at = new Date().toISOString();
        const u = await db.from('naruto_accounts').update(patch).eq('id', targetId).select('*').single();
        if (u.error) throw u.error;
        await audit(db, ctx.principal.id, 'account.update.legacy', 'legacy_account', targetId, before, u.data);
        return json({ ok: true, account: legacyAccount(u.data) });
      }

      const { data: before, error } = await db.from('profiles').select('*').eq('user_id', targetId).single();
      if (error || !before) return fail(404, 'ACCOUNT', 'Perfil Auth ausente.');
      const patch: any = {};
      if (mod) {
        const nextBanned = !before.banned;
        if (nextBanned) {
          if (targetId === ctx.user.id) return fail(403, 'SELF_BAN', 'Você não pode banir a própria conta administrativa.');
          const protectedRole = await protectedAdminRole(db, targetId);
          if (protectedRole) return fail(403, 'PROTECTED_ADMIN', 'Contas OWNER/ADMIN ativas não podem ser banidas.');
        }
        patch.banned = nextBanned;
        patch.ban_reason = nextBanned ? (String(b.reason || '').trim() || null) : null;
      }
      if (Number.isFinite(Number(b.ryoDelta))) patch.ryo = clamp0(n(before.ryo) + n(b.ryoDelta));
      if (Number.isFinite(Number(b.xpDelta))) patch.xp = clamp0(n(before.xp) + n(b.xpDelta));
      const u = await db.from('profiles').update(patch).eq('user_id', targetId).select('*').single();
      if (u.error) throw u.error;
      await audit(db, ctx.principal.id, 'account.update', 'profile', targetId, before, u.data);
      return json({ ok: true, account: authAccount(u.data) });
    }

    if (path === '/seasons' && req.method === 'GET') {
      await requirePermission(req, 'events.read');
      const r = await db.from('game_seasons').select('*').order('starts_at', { ascending: false }).limit(100);
      if (r.error) throw r.error;
      return json({ ok: true, seasons: r.data || [] });
    }

    if (path === '/seasons' && req.method === 'POST') {
      const ctx = await requirePermission(req, 'events.write');
      const payload = {
        slug: String(b.slug || '').trim(),
        name: String(b.name || '').trim(),
        status: String(b.status || 'PLANNED').toUpperCase(),
        starts_at: b.starts_at || b.startsAt || new Date().toISOString(),
        ends_at: b.ends_at || b.endsAt || null,
        config: seasonConfig(b, {}),
        rewards: seasonRewards(b, {}),
        created_by: ctx.user.id,
      };
      if (!payload.slug || !payload.name) return fail(400, 'SEASON', 'slug e nome são obrigatórios.');
      if (payload.status === 'ACTIVE') await db.from('game_seasons').update({ status: 'ENDED' }).eq('status', 'ACTIVE');
      const r = await db.from('game_seasons').insert(payload).select('*').single();
      if (r.error) throw r.error;
      await audit(db, ctx.principal.id, 'season.create', 'season', r.data.id, null, r.data);
      return json({ ok: true, season: r.data });
    }

    const sm = path.match(/^\/seasons\/([^/]+)$/);
    if (sm && req.method === 'PATCH') {
      const ctx = await requirePermission(req, 'events.write');
      const id = sm[1];
      const old = await db.from('game_seasons').select('*').eq('id', id).single();
      if (old.error || !old.data) return fail(404, 'SEASON', 'Temporada ausente.');
      const patch: any = {};
      for (const k of ['slug', 'name', 'starts_at', 'ends_at']) if (b[k] !== undefined) patch[k] = b[k];
      if (b.startsAt !== undefined) patch.starts_at = b.startsAt;
      if (b.endsAt !== undefined) patch.ends_at = b.endsAt;
      if (b.status !== undefined) patch.status = String(b.status).toUpperCase();
      if (['config', 'xpMultiplier', 'ryoMultiplier', 'rankedEnabled'].some((k) => b[k] !== undefined)) patch.config = seasonConfig(b, old.data.config || {});
      if (['rewards', 'championRyo', 'top10Ryo'].some((k) => b[k] !== undefined)) patch.rewards = seasonRewards(b, old.data.rewards || {});
      if (patch.status === 'ACTIVE') await db.from('game_seasons').update({ status: 'ENDED' }).eq('status', 'ACTIVE').neq('id', id);
      const u = await db.from('game_seasons').update(patch).eq('id', id).select('*').single();
      if (u.error) throw u.error;
      await audit(db, ctx.principal.id, 'season.update', 'season', id, old.data, u.data);
      return json({ ok: true, season: u.data });
    }

    if (path === '/rewards' && req.method === 'GET') {
      await requirePermission(req, 'accounts.economy');
      const r = await db.from('admin_reward_grants').select('*').order('granted_at', { ascending: false }).limit(200);
      if (r.error) throw r.error;
      return json({ ok: true, grants: r.data || [] });
    }

    if (path === '/rewards/grant' && req.method === 'POST') {
      const ctx = await requirePermission(req, 'accounts.economy');
      const kind = String(b.targetKind || '').toUpperCase();
      const targetId = String(b.targetId || '');
      const type = String(b.rewardType || '').toUpperCase();
      const amount = n(b.amount);
      const payload = b.payload && typeof b.payload === 'object' ? { ...b.payload } : {};
      const reason = String(b.reason || '').slice(0, 500);
      if (b.contentId && !payload.id) payload.id = String(b.contentId);
      if (!['AUTH', 'LEGACY'].includes(kind) || !targetId) return fail(400, 'REWARD_TARGET', 'Destino inválido.');
      if (!['RYO', 'XP', 'UNLOCK', 'ITEM', 'CUSTOM'].includes(type)) return fail(400, 'REWARD_TYPE', 'Tipo inválido.');
      let before: any = null;
      let after: any = null;

      if (kind === 'AUTH') {
        const r = await db.from('profiles').select('*').eq('user_id', targetId).single();
        if (r.error || !r.data) return fail(404, 'ACCOUNT', 'Perfil Auth ausente.');
        before = r.data;
        if (type === 'RYO' || type === 'XP') {
          const patch: any = {};
          if (type === 'RYO') patch.ryo = clamp0(n(before.ryo) + amount);
          if (type === 'XP') patch.xp = clamp0(n(before.xp) + amount);
          const u = await db.from('profiles').update(patch).eq('user_id', targetId).select('*').single();
          if (u.error) throw u.error;
          after = u.data;
        } else if (type === 'ITEM') {
          const itemId = String(payload.id || payload.itemId || '');
          if (!itemId) return fail(400, 'REWARD_PAYLOAD', 'ITEM exige ID do item.');
          const cur = await db.from('player_items').select('qty').eq('user_id', targetId).eq('item_id', itemId).maybeSingle();
          if (cur.error) throw cur.error;
          const qty = Math.max(1, Math.trunc(amount || 1));
          const next = clamp0(n(cur.data?.qty) + qty);
          const u = await db.from('player_items').upsert({ user_id: targetId, item_id: itemId, qty: next }, { onConflict: 'user_id,item_id' }).select('*').single();
          if (u.error) throw u.error;
          after = { ...before, item: u.data };
        } else if (type === 'UNLOCK') {
          const entityId = String(payload.id || payload.characterId || '');
          if (!entityId) return fail(400, 'REWARD_PAYLOAD', 'UNLOCK exige ID do conteúdo.');
          const entityType = String(payload.entityType || 'character');
          const u = await db.from('player_unlocks').upsert({ user_id: targetId, entity_type: entityType, entity_id: entityId, unlocked_at: new Date().toISOString(), source: 'admin' }, { onConflict: 'user_id,entity_type,entity_id' }).select('*').single();
          if (u.error) throw u.error;
          after = { ...before, unlock: u.data };
        } else {
          after = before;
        }
      } else {
        const r = await db.from('naruto_accounts').select('*').eq('id', targetId).single();
        if (r.error || !r.data) return fail(404, 'ACCOUNT', 'Conta legada ausente.');
        before = r.data;
        const p = { ...(before.profile || {}) };
        if (type === 'RYO') p.ryo = clamp0(n(p.ryo) + amount);
        else if (type === 'XP') p.xp = clamp0(n(p.xp) + amount);
        else if (type === 'UNLOCK') {
          const unlockId = String(payload.id || payload.characterId || '');
          if (!unlockId) return fail(400, 'REWARD_PAYLOAD', 'UNLOCK exige ID do conteúdo.');
          const cur = Array.isArray(p.unlocked) ? p.unlocked : [];
          p.unlocked = [...new Set([...cur, unlockId])];
        } else if (type === 'ITEM') {
          const itemId = String(payload.id || payload.itemId || '');
          if (!itemId) return fail(400, 'REWARD_PAYLOAD', 'ITEM exige ID do item.');
          const inv = p.inventory && typeof p.inventory === 'object' && !Array.isArray(p.inventory) ? { ...p.inventory } : {};
          inv[itemId] = clamp0(n(inv[itemId]) + Math.max(1, Math.trunc(amount || 1)));
          p.inventory = inv;
        }
        const u = type === 'CUSTOM'
          ? { data: before, error: null }
          : await db.from('naruto_accounts').update({ profile: p, revision: n(before.revision) + 1, saved_at: new Date().toISOString() }).eq('id', targetId).select('*').single();
        if (u.error) throw u.error;
        after = u.data;
      }

      const g = await db.from('admin_reward_grants').insert({ target_kind: kind, target_id: targetId, reward_type: type, amount, payload, reason, granted_by: ctx.user.id }).select('*').single();
      if (g.error) throw g.error;
      await audit(db, ctx.principal.id, 'reward.grant', kind === 'AUTH' ? 'profile' : 'legacy_account', targetId, { rewardType: type, account: before }, { rewardType: type, account: after, grant: g.data });
      return json({ ok: true, grant: g.data, account: kind === 'AUTH' ? authAccount(after) : legacyAccount(after) });
    }

    return fail(404, 'ROUTE', `Rota gameops desconhecida: ${path}`);
  } catch (e: any) {
    return fail(e.status || 500, 'GAMEOPS', e.message || String(e));
  }
});
