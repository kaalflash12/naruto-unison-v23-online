import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const MASTER_BODY_MAX = 256 * 1024;
const BOOTSTRAP_BODY_MAX = 64 * 1024;
const TOKEN_MAX = 512;
const ALLOWED_ORIGINS = new Set([
  "https://kaalflash12.github.io",
  "https://naruto-shinobi-r40-online.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
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

const SERVICE_KEY = pick("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
const E = new TextEncoder();
const SYSTEM = `Você é o Mestre IA do Naruto Shinobi no Sho PC. TERION 2D10 é a autoridade mecânica absoluta. NUNCA invente PV, Chakra, dano, CD, custo, inventário, técnica possuída ou resultado de rolagem. CAMPANHA, ARCO, EVENTO CANÔNICO, MISSÃO, TAREFA e CENA são categorias diferentes. Um arco/evento não vira missão automaticamente. Receba o estado vivo, narre a reação do mundo e, quando houver incerteza mecânica, solicite testRequest sem resolver o teste. combat.confirmed só pode ser true com ameaça concreta e inimigos identificados. Retorne SOMENTE JSON válido no formato {"scene":{"title":"","narrative":""},"options":[],"testRequest":null|{"skill":"","reason":"","risk":""},"worldIntents":[],"combat":{"confirmed":false,"enemies":[]},"notes":[]}.`;

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
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://kaalflash12.github.io";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
}

function reply(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: cors(req) });
}

function DB() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}

async function hash(s: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", E.encode(s))))
    .map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function account(req: Request) {
  const raw = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!raw || raw.length > TOKEN_MAX) return null;
  const db = DB();
  const { data: session, error } = await db.from("sns_sessions")
    .select("account_id,expires_at").eq("token_hash", await hash(raw)).maybeSingle();
  if (error || !session || Date.parse(session.expires_at) <= Date.now()) return null;
  return { id: String(session.account_id), db };
}

function routePath(req: Request) {
  const parts = new URL(req.url).pathname.split("/").filter(Boolean);
  const i = parts.lastIndexOf("shinobi-master");
  return "/" + (i >= 0 ? parts.slice(i + 1).join("/") : parts.at(-1) || "");
}

async function readJson(req: Request, max: number) {
  const declared = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > max) throw new AppError(413, "BODY_TOO_LARGE", "Corpo da requisição excede o limite.");
  const bytes = await req.arrayBuffer();
  if (bytes.byteLength > max) throw new AppError(413, "BODY_TOO_LARGE", "Corpo da requisição excede o limite.");
  if (!bytes.byteLength) return {} as Record<string, unknown>;
  try {
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("object_required");
    return value as Record<string, any>;
  } catch {
    throw new AppError(400, "INVALID_JSON", "JSON inválido.");
  }
}

async function consumeRate(db: ReturnType<typeof DB>, accountId: string, action: string, limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const { count, error } = await db.from("sns_rate_limit_events").select("id", { count: "exact", head: true })
    .eq("account_id", accountId).eq("action", action).gte("created_at", since);
  if (error) throw new AppError(503, "RATE_LIMIT_UNAVAILABLE", "Controle de frequência indisponível.");
  if ((count || 0) >= limit) throw new AppError(429, "RATE_LIMIT", "Muitas requisições. Tente novamente em instantes.");
  const { error: insertError } = await db.from("sns_rate_limit_events").insert({ account_id: accountId, action });
  if (insertError) throw new AppError(503, "RATE_LIMIT_UNAVAILABLE", "Controle de frequência indisponível.");
}

async function listSecrets(db: ReturnType<typeof DB>, accountId: string) {
  const { data, error } = await db.rpc("sns_list_ai_secrets", { p_account_id: accountId });
  if (error) throw new AppError(503, "AI_KEYS_UNAVAILABLE", "Chaves de IA indisponíveis.");
  return data || [];
}

function clean(s: string) {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
}
function parseOutput(s: string) {
  try { return JSON.parse(clean(s)); }
  catch { return { scene: { title: "Cena", narrative: s.slice(0, 12000) }, options: [], testRequest: null, worldIntents: [], combat: { confirmed: false, enemies: [] }, notes: ["Resposta textual normalizada."] }; }
}
function score(x: any) {
  let n = 0;
  if (x?.scene?.narrative?.length > 100) n += 3;
  if (x?.scene?.title) n++;
  if (Array.isArray(x?.worldIntents)) n++;
  if (x?.combat && typeof x.combat.confirmed === "boolean") n += 2;
  if (x?.testRequest === null || typeof x?.testRequest === "object") n++;
  return n;
}

async function providerFetch(url: string, init: RequestInit, provider: string) {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(45000) });
  if (!r.ok) throw new Error(`${provider}_failed`);
  return r;
}

async function gemini(key: string, model: string, payload: any) {
  model = model || "gemini-2.5-flash-lite";
  const r = await providerFetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: "user", parts: [{ text: JSON.stringify(payload) }] }], generationConfig: { responseMimeType: "application/json", temperature: .75 } })
  }, "gemini");
  const j = await r.json();
  return { provider: "gemini", model, text: j.candidates?.[0]?.content?.parts?.map((x: any) => x.text || "").join("") || "" };
}

async function openai(key: string, model: string, payload: any, base = "https://api.openai.com/v1/chat/completions", provider = "openai") {
  model = model || (provider === "groq" ? "llama-3.3-70b-versatile" : provider === "xai" ? "grok-3-mini" : "gpt-5-mini");
  const r = await providerFetch(base, {
    method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: JSON.stringify(payload) }], temperature: .7, response_format: { type: "json_object" } })
  }, provider);
  const j = await r.json();
  return { provider, model, text: j.choices?.[0]?.message?.content || "" };
}

async function anthropic(key: string, model: string, payload: any) {
  model = model || "claude-sonnet-4-5";
  const r = await providerFetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 1600, system: SYSTEM, messages: [{ role: "user", content: JSON.stringify(payload) }] })
  }, "anthropic");
  const j = await r.json();
  return { provider: "anthropic", model, text: j.content?.map((x: any) => x.text || "").join("") || "" };
}

async function invoke(s: any, payload: any) {
  if (s.provider === "gemini") return gemini(s.secret, s.model, payload);
  if (s.provider === "openai") return openai(s.secret, s.model, payload);
  if (s.provider === "groq") return openai(s.secret, s.model, payload, "https://api.groq.com/openai/v1/chat/completions", "groq");
  if (s.provider === "openrouter") return openai(s.secret, s.model || "google/gemini-2.0-flash-001", payload, "https://openrouter.ai/api/v1/chat/completions", "openrouter");
  if (s.provider === "xai") return openai(s.secret, s.model, payload, "https://api.x.ai/v1/chat/completions", "xai");
  if (s.provider === "anthropic") return anthropic(s.secret, s.model, payload);
  throw new Error("unknown_provider");
}

async function one(list: any[], payload: any, skip = "") {
  for (const s of list) {
    if (s.provider === skip) continue;
    try { return await invoke(s, payload); } catch { /* try next provider */ }
  }
  throw new AppError(503, "AI_PROVIDER_UNAVAILABLE", "Nenhum provedor de IA configurado respondeu.");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  const origin = req.headers.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) return reply(req, 403, { ok: false, error: "Origem não autorizada." });
  const route = routePath(req);

  try {
    if ((route === "/" || route === "/health") && req.method === "GET") {
      return reply(req, 200, { ok: true, service: "shinobi-master", version: "R39.3", pcRequired: false, authority: "TERION_2D10" });
    }

    const auth = await account(req);
    if (!auth) return reply(req, 401, { ok: false, error: "Sessão online inválida." });
    const { id: accountId, db } = auth;

    if (route === "/providers") {
      if (req.method !== "GET") return reply(req, 405, { ok: false, error: "Método não permitido." });
      const { data, error } = await db.from("sns_ai_secrets").select("provider,model,enabled").eq("account_id", accountId).eq("enabled", true).order("provider");
      if (error) throw new AppError(503, "AI_KEYS_UNAVAILABLE", "Chaves de IA indisponíveis.");
      return reply(req, 200, { ok: true, providers: (data || []).map((x: any) => ({ provider: x.provider, model: x.model || "", enabled: true })) });
    }

    if (route === "/bootstrap") {
      if (req.method !== "POST") return reply(req, 405, { ok: false, error: "Método não permitido." });
      await consumeRate(db, accountId, "ai_bootstrap", 10, 60 * 60 * 1000);
      const b = await readJson(req, BOOTSTRAP_BODY_MAX);
      const incoming = b.providers && typeof b.providers === "object" && !Array.isArray(b.providers) ? b.providers : {};
      const models = b.models && typeof b.models === "object" && !Array.isArray(b.models) ? b.models : {};
      const map: Record<string, string[]> = {
        gemini: ["GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"], openai: ["OPENAI_API_KEY"], anthropic: ["ANTHROPIC_API_KEY"],
        groq: ["GROQ_API_KEY"], openrouter: ["OPENROUTER_API_KEY"], xai: ["XAI_API_KEY"]
      };
      const stored: string[] = [];
      for (const [provider, keys] of Object.entries(map)) {
        let secret = "";
        for (const key of keys) {
          const value = (incoming as Record<string, unknown>)[key];
          if (typeof value === "string" && value.trim()) { secret = value.trim(); break; }
        }
        if (!secret) continue;
        if (secret.length < 8 || secret.length > 8192) throw new AppError(400, "INVALID_KEY", "Chave de IA inválida.");
        const modelRaw = (models as Record<string, unknown>)[provider];
        const model = typeof modelRaw === "string" ? modelRaw.trim() : "";
        if (model.length > 200) throw new AppError(400, "INVALID_MODEL", "Modelo inválido.");
        const { error } = await db.rpc("sns_store_ai_secret", { p_account_id: accountId, p_provider: provider, p_secret: secret, p_model: model });
        if (error) throw new AppError(503, "AI_KEY_STORE_FAILED", "Não foi possível armazenar a chave de IA.");
        stored.push(provider);
      }
      if (!stored.length) return reply(req, 400, { ok: false, error: "Nenhuma chave de IA reconhecida foi enviada." });
      return reply(req, 200, { ok: true, stored });
    }

    if (route === "/master") {
      if (req.method !== "POST") return reply(req, 405, { ok: false, error: "Método não permitido." });
      await consumeRate(db, accountId, "ai_master", 30, 60 * 1000);
      const payload = await readJson(req, MASTER_BODY_MAX);
      const list = await listSecrets(db, accountId);
      if (!list.length) return reply(req, 503, { ok: false, error: "Mestre IA online ainda não recebeu chaves de provedor." });
      const first = await one(list, payload);
      if (!first.text || first.text.length > 65536) throw new AppError(503, "AI_OUTPUT_INVALID", "Resposta do provedor inválida.");
      let data = parseOutput(first.text), councilUsed = false, chosen = first;
      if (payload.critical === true) {
        try {
          const second = await one(list, payload, first.provider);
          if (second.text && second.text.length <= 65536) {
            const d2 = parseOutput(second.text); councilUsed = true;
            if (score(d2) > score(data)) { data = d2; chosen = second; }
          }
        } catch { /* first answer remains authoritative */ }
      }
      return reply(req, 200, { ok: true, councilUsed, provider: chosen.provider, model: chosen.model, ...data });
    }

    return reply(req, 404, { ok: false, error: "Rota não encontrada." });
  } catch (e) {
    if (e instanceof AppError) return reply(req, e.status, { ok: false, code: e.code, error: e.message });
    console.error("shinobi-master", e);
    return reply(req, 503, { ok: false, error: "Falha no Mestre IA online." });
  }
});
