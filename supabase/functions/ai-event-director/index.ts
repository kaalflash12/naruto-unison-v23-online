import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const MAX_BODY_BYTES = 64 * 1024;
const GAME_TIME_ZONE = "America/Bahia";
const FAMILIES = [
  "Exame Chūnin", "Invasão de Konoha", "Resgate de Sasuke", "Resgate do Kazekage",
  "Caçada Akatsuki", "Hidan & Kakuzu", "Ataque de Pain", "Cúpula dos Cinco Kage",
  "Quarta Guerra Ninja", "Jinchūriki & Bijū", "Vale do Fim", "The Last", "Kara & Karma"
];
const CYCLES = new Set(["weekly", "monthly", "seasonal"]);
const ALLOWED_ORIGINS = new Set([
  "https://kaalflash12.github.io",
  "https://naruto-shinobi-r40-online.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

function pick(name: string, legacy: string) {
  const raw = Deno.env.get(name);
  if (raw) {
    try {
      const obj = JSON.parse(raw);
      return String(obj.default ?? Object.values(obj)[0] ?? "");
    } catch {
      return raw;
    }
  }
  return Deno.env.get(legacy) ?? "";
}

const PUBLISHABLE_KEY = pick("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
const SERVICE_KEY = pick("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");

class AppError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://kaalflash12.github.io";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ai-director-secret",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
}

function reply(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: cors(req) });
}

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}

async function parseBody(req: Request) {
  const declared = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new AppError(413, "BODY_TOO_LARGE", "Corpo da requisição excede o limite.");
  const raw = await req.arrayBuffer();
  if (raw.byteLength > MAX_BODY_BYTES) throw new AppError(413, "BODY_TOO_LARGE", "Corpo da requisição excede o limite.");
  if (!raw.byteLength) return {} as Record<string, unknown>;
  try {
    const value = JSON.parse(new TextDecoder().decode(raw));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("object_required");
    return value as Record<string, unknown>;
  } catch {
    throw new AppError(400, "INVALID_JSON", "JSON inválido.");
  }
}

async function requirePermission(req: Request, permission: string) {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) throw new AppError(401, "AUTH", "Sessão inválida.");
  const client = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new AppError(401, "AUTH", "Sessão inválida.");

  const db = adminClient();
  const { data: allowed, error: rpcError } = await db.rpc("authorize_as_user", {
    p_user_id: data.user.id,
    p_permission: permission
  });
  if (!rpcError && allowed) return { user: data.user, db };

  const { data: rows, error: fallbackError } = await db
    .from("admin_principals")
    .select("id,admin_principal_roles!inner(role,admin_role_permissions!inner(permission))")
    .eq("user_id", data.user.id)
    .eq("active", true);
  if (fallbackError) throw new AppError(503, "AUTHZ_UNAVAILABLE", "Autorização indisponível.");
  const ok = (rows || []).some((p: any) => (p.admin_principal_roles || []).some((r: any) =>
    (r.admin_role_permissions || []).some((x: any) => x.permission === permission)
  ));
  if (!ok) throw new AppError(403, "FORBIDDEN", "Permissão insuficiente.");
  return { user: data.user, db };
}

async function principalFor(db: ReturnType<typeof adminClient>, userId: string) {
  const { data } = await db
    .from("admin_principals")
    .select("id,display_name")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();
  return data;
}

function dateParts(d = new Date()) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: GAME_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short"
  }).formatToParts(d).filter((x) => x.type !== "literal").map((x) => [x.type, x.value]));
}

function monthKey(d = new Date()) {
  const p = dateParts(d);
  return `${p.year}-${p.month}`;
}

function weekKey(d = new Date()) {
  const p = dateParts(d);
  const x = new Date(`${p.year}-${p.month}-${p.day}T12:00:00Z`);
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() - day + 4);
  const y = x.getUTCFullYear();
  const y0 = new Date(Date.UTC(y, 0, 1));
  const w = Math.ceil((((x.getTime() - y0.getTime()) / 86400000) + 1) / 7);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

function inferCycle(d = new Date()) {
  const p = dateParts(d);
  if (p.day === "01") return "monthly";
  if (p.weekday === "Mon") return "weekly";
  return null;
}

const proposalSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    family: { type: "string", enum: FAMILIES },
    name: { type: "string", maxLength: 160 },
    cycle: { type: "string", enum: ["weekly", "monthly", "seasonal"] },
    bossId: { type: ["string", "null"], maxLength: 120 },
    missionIds: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 10 },
    modifiers: { type: "array", items: { type: "object" }, maxItems: 20 },
    rewardBudget: { type: "integer", minimum: 0, maximum: 5000 },
    announcement: { type: "string", maxLength: 2000 }
  },
  required: ["family", "name", "cycle", "missionIds", "modifiers", "rewardBudget", "announcement"]
};

async function buildContext(db: ReturnType<typeof adminClient>, cycle: string, context: string) {
  const [events, bosses, missions] = await Promise.all([
    db.from("event_instances").select("name,cycle,boss_id,starts_at").order("starts_at", { ascending: false }).limit(20),
    db.from("content_entities").select("entity_id,published").eq("entity_type", "boss").not("published", "is", null),
    db.from("content_entities").select("entity_id,published").eq("entity_type", "mission").not("published", "is", null)
  ]);
  if (events.error || bosses.error || missions.error) throw new Error("context_db_failed");
  return {
    cycle,
    context,
    allowedFamilies: FAMILIES,
    recentEvents: events.data || [],
    bosses: (bosses.data || []).map((x: any) => x.published),
    missions: (missions.data || []).map((x: any) => x.published),
    constraints: { rewardBudgetMax: 5000, narutoOnly: true, noAccountActions: true }
  };
}

async function generateProposal(input: any, cycle: string) {
  const key = Deno.env.get("OPENAI_API_KEY");
  const model = Deno.env.get("OPENAI_EVENT_MODEL");
  if (!key || !model) return deterministicProposal(input, cycle);

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: [{ type: "input_text", text: "Você é o AI_EVENT_DIRECTOR do Naruto Unison. Crie somente eventos baseados em Naruto/Boruto usando apenas bosses e missões fornecidos. Nunca altere contas, permissões ou economia fora do rewardBudget." }] },
        { role: "user", content: [{ type: "input_text", text: JSON.stringify(input) }] }
      ],
      text: { format: { type: "json_schema", name: "naruto_event", strict: true, schema: proposalSchema } }
    })
  });
  if (!res.ok) throw new Error("model_failed");
  const data = await res.json();
  const outputText = data.output?.flatMap((o: any) => o.content || []).find((c: any) => c.type === "output_text")?.text || data.output_text;
  if (!outputText || typeof outputText !== "string" || outputText.length > 65536) throw new Error("model_output_invalid");
  return JSON.parse(outputText);
}

function deterministicProposal(input: any, cycle: string) {
  const recent = new Set((input.recentEvents || []).map((x: any) => x.name));
  const family = FAMILIES.find((x) => ![...recent].some((y) => String(y).includes(x))) ||
    FAMILIES[Math.abs(weekKey().split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % FAMILIES.length];
  const boss = input.bosses?.find((b: any) => String(b.name || "").toLowerCase().includes(family.split(" ")[0].toLowerCase())) || input.bosses?.[0];
  const missionIds = (input.missions || []).filter((m: any) => ["B", "A", "S"].includes(m.rank)).slice(0, cycle === "monthly" ? 5 : 3).map((m: any) => m.id);
  return {
    family,
    name: `${family} — ${cycle === "monthly" ? "Operação Mensal" : "Operação Semanal"}`,
    cycle,
    bossId: boss?.id || null,
    missionIds,
    modifiers: [{ id: "chakra-pressure", value: 1 }],
    rewardBudget: cycle === "monthly" ? 4000 : 1800,
    announcement: `Uma nova operação inspirada em ${family} começou. Prepare sua equipe.`
  };
}

function validateProposal(p: any, input: any) {
  const errors: string[] = [];
  if (!p || typeof p !== "object" || Array.isArray(p)) return { ok: false, errors: ["proposta inválida"] };
  if (!FAMILIES.includes(p.family)) errors.push("família não Naruto");
  if (!CYCLES.has(p.cycle)) errors.push("ciclo inválido");
  if (typeof p.name !== "string" || !p.name.trim() || p.name.length > 160) errors.push("nome inválido");
  if (typeof p.announcement !== "string" || p.announcement.length > 2000) errors.push("anúncio inválido");
  if (!Number.isInteger(p.rewardBudget) || p.rewardBudget < 0 || p.rewardBudget > 5000) errors.push("orçamento inválido");
  if (!Array.isArray(p.missionIds) || p.missionIds.length > 10) errors.push("missões inválidas");
  if (!Array.isArray(p.modifiers) || p.modifiers.length > 20) errors.push("modificadores inválidos");
  const allowedBoss = new Set((input.bosses || []).map((x: any) => x.id));
  if (p.bossId && (!allowedBoss.has(p.bossId) || String(p.bossId).length > 120)) errors.push("boss fora do conteúdo publicado");
  const allowedMission = new Set((input.missions || []).map((x: any) => x.id));
  for (const id of p.missionIds || []) if (typeof id !== "string" || id.length > 120 || !allowedMission.has(id)) errors.push("missão inválida");
  return { ok: !errors.length, errors };
}

async function audit(db: ReturnType<typeof adminClient>, principalId: string | null, event: any) {
  await db.from("admin_audit_log").insert({
    principal_id: principalId,
    action: "ai_event_director.publish",
    target_type: "event",
    target_id: event.id,
    after: event
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  const origin = req.headers.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) return reply(req, 403, { ok: false, code: "ORIGIN", error: "Origem não autorizada." });
  if (req.method !== "POST") return reply(req, 405, { ok: false, code: "METHOD", error: "Método não permitido." });

  try {
    const b = await parseBody(req);
    const mode = typeof b.mode === "string" ? b.mode : "manual";
    if (mode === "configure-runtime") {
      return reply(req, 410, { ok: false, code: "SETUP_DISABLED", error: "Configuração de runtime desativada em produção." });
    }

    const isCron = mode === "cron";
    let db = adminClient();
    let principal: any = null;

    if (isCron) {
      const expected = Deno.env.get("AI_DIRECTOR_CRON_SECRET");
      if (!expected || req.headers.get("x-ai-director-secret") !== expected) throw new AppError(403, "CRON_SECRET", "Segredo inválido.");
      const { data: aiPrincipal, error } = await db
        .from("admin_principals")
        .select("id,display_name")
        .eq("principal_type", "ai")
        .eq("display_name", "AI_EVENT_DIRECTOR")
        .eq("active", true)
        .maybeSingle();
      if (error || !aiPrincipal) throw new AppError(503, "AI_PRINCIPAL", "Diretor de eventos indisponível.");
      principal = aiPrincipal;
    } else {
      const auth = await requirePermission(req, "events.ai");
      db = auth.db;
      principal = await principalFor(db, auth.user.id);
    }

    if (b.context !== undefined && typeof b.context !== "string") throw new AppError(400, "CONTEXT", "Contexto inválido.");
    const context = String(b.context || "");
    if (context.length > 4000) throw new AppError(413, "CONTEXT_TOO_LARGE", "Contexto excede o limite.");

    let cycle: string | null;
    if (b.cycle !== undefined && b.cycle !== null && b.cycle !== "") {
      if (typeof b.cycle !== "string" || !CYCLES.has(b.cycle)) throw new AppError(400, "CYCLE", "Ciclo inválido.");
      cycle = b.cycle;
    } else {
      cycle = inferCycle(new Date());
    }

    if (!cycle) return reply(req, 200, { ok: true, skipped: true, reason: "Nenhuma virada de ciclo agora.", timeZone: GAME_TIME_ZONE });
    const period = cycle === "monthly" ? monthKey() : weekKey();
    const runKey = `${cycle}:${period}`;
    if (runKey.length > 80) throw new AppError(400, "RUN_KEY", "Período inválido.");

    const { data: existing, error: existingError } = await db.from("ai_director_runs").select("*").eq("cycle", cycle).eq("period_key", period).maybeSingle();
    if (existingError) throw new Error("run_lookup_failed");
    if (existing) return reply(req, 200, { ok: true, duplicate: true, run: existing });

    const input = await buildContext(db, cycle, context);
    const proposal = await generateProposal(input, cycle);
    const validation = validateProposal(proposal, input);
    const { data: run, error: runError } = await db.from("ai_director_runs").insert({
      cycle,
      period_key: period,
      input,
      proposal,
      validation,
      status: validation.ok ? "PROPOSED" : "REJECTED"
    }).select("*").single();

    if (runError) {
      if ((runError as any).code === "23505") {
        const { data: raced } = await db.from("ai_director_runs").select("*").eq("cycle", cycle).eq("period_key", period).maybeSingle();
        if (raced) return reply(req, 200, { ok: true, duplicate: true, run: raced });
      }
      throw new Error("run_insert_failed");
    }
    if (!validation.ok) return reply(req, 422, { ok: false, run, validation });

    const starts = new Date();
    const ends = new Date(starts.getTime() + (cycle === "monthly" ? 28 : 7) * 86400000);
    const eventPayload = {
      template_id: null,
      name: proposal.name,
      cycle,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      boss_id: proposal.bossId || null,
      mission_ids: proposal.missionIds,
      modifiers: proposal.modifiers,
      reward_budget: proposal.rewardBudget,
      announcement: proposal.announcement,
      status: "ACTIVE",
      created_by: "AI_EVENT_DIRECTOR"
    };
    const { data: event, error: eventError } = await db.from("event_instances").insert(eventPayload).select("*").single();
    if (eventError) throw new Error("event_insert_failed");
    await db.from("ai_director_runs").update({ status: "PUBLISHED", created_event_id: event.id }).eq("id", run.id);
    await audit(db, principal?.id || null, event);

    return reply(req, 200, {
      ok: true,
      run: { ...run, status: "PUBLISHED", created_event_id: event.id },
      event,
      timeZone: GAME_TIME_ZONE
    });
  } catch (e) {
    if (e instanceof AppError) return reply(req, e.status, { ok: false, code: e.code, error: e.message });
    return reply(req, 500, { ok: false, code: "AI_DIRECTOR", error: "Falha interna do diretor de eventos." });
  }
});
