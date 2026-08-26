import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const BODY_MAX = 16 * 1024;
const TOKEN_MAX = 512;
const SLOT_MAX = 128;
const E = new TextEncoder();
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

class AppError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message); this.status = status; this.code = code;
  }
}
function DB() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
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
async function hash(s: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", E.encode(s))))
    .map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function account(req: Request) {
  const raw = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!raw || raw.length > TOKEN_MAX) return null;
  const db = DB();
  const { data: session, error: sessionError } = await db.from("sns_sessions")
    .select("account_id,expires_at").eq("token_hash", await hash(raw)).maybeSingle();
  if (sessionError || !session || Date.parse(session.expires_at) <= Date.now()) return null;
  const { data: a, error } = await db.from("sns_accounts")
    .select("id,username,display_name,leon_entitled").eq("id", session.account_id).maybeSingle();
  if (error || !a) return null;
  return { ...a, db };
}
function routePath(req: Request) {
  const parts = new URL(req.url).pathname.split("/").filter(Boolean);
  const i = parts.lastIndexOf("shinobi-account-admin");
  return "/" + (i >= 0 ? parts.slice(i + 1).join("/") : parts.at(-1) || "");
}
async function readJson(req: Request) {
  const declared = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > BODY_MAX) throw new AppError(413, "BODY_TOO_LARGE", "Corpo da requisição excede o limite.");
  const bytes = await req.arrayBuffer();
  if (bytes.byteLength > BODY_MAX) throw new AppError(413, "BODY_TOO_LARGE", "Corpo da requisição excede o limite.");
  if (!bytes.byteLength) return {} as Record<string, unknown>;
  try {
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("object_required");
    return value as Record<string, unknown>;
  } catch {
    throw new AppError(400, "INVALID_JSON", "JSON inválido.");
  }
}
async function consumeRate(db: ReturnType<typeof DB>, accountId: string) {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await db.from("sns_rate_limit_events").select("id", { count: "exact", head: true })
    .eq("account_id", accountId).eq("action", "character_delete").gte("created_at", since);
  if (error) throw new AppError(503, "RATE_LIMIT_UNAVAILABLE", "Controle de frequência indisponível.");
  if ((count || 0) >= 10) throw new AppError(429, "RATE_LIMIT", "Muitas exclusões em pouco tempo.");
  const { error: insertError } = await db.from("sns_rate_limit_events").insert({ account_id: accountId, action: "character_delete" });
  if (insertError) throw new AppError(503, "RATE_LIMIT_UNAVAILABLE", "Controle de frequência indisponível.");
}
function validSlot(slot: string) {
  return slot.length >= 1 && slot.length <= SLOT_MAX && !/[\u0000-\u001f\u007f]/.test(slot);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  const origin = req.headers.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) return reply(req, 403, { ok: false, error: "Origem não autorizada." });
  const route = routePath(req);

  try {
    const a = await account(req);
    if (!a) return reply(req, 401, { ok: false, error: "Sessão inválida." });

    if (route === "/" || route === "/me") {
      if (req.method !== "GET") return reply(req, 405, { ok: false, error: "Método não permitido." });
      return reply(req, 200, {
        ok: true,
        account: {
          id: a.id,
          username: a.username,
          displayName: a.display_name || a.username,
          role: "player",
          leonEntitled: !!a.leon_entitled
        }
      });
    }

    if (route === "/delete") {
      if (req.method !== "POST") return reply(req, 405, { ok: false, error: "Método não permitido." });
      await consumeRate(a.db, a.id);
      const b = await readJson(req);
      const slot = typeof b.slotId === "string" ? b.slotId.trim() : "";
      if (!validSlot(slot)) return reply(req, 400, { ok: false, error: "slotId inválido." });
      if (slot === "leon-private") return reply(req, 403, { ok: false, error: "O slot privado de Leon não pode ser excluído." });

      const { data: target, error: targetError } = await a.db.from("sns_characters")
        .select("id,is_leon").eq("account_id", a.id).eq("slot_key", slot).maybeSingle();
      if (targetError) throw new AppError(503, "CHARACTER_LOOKUP_FAILED", "Não foi possível verificar o personagem.");
      if (target?.is_leon) return reply(req, 403, { ok: false, error: "O personagem privado de Leon não pode ser excluído." });

      if (target) {
        const { error } = await a.db.from("sns_characters").delete().eq("id", target.id).eq("account_id", a.id);
        if (error) throw new AppError(503, "CHARACTER_DELETE_FAILED", "Não foi possível excluir o personagem.");
      }
      return reply(req, 200, { ok: true });
    }

    return reply(req, 404, { ok: false, error: "Rota não encontrada." });
  } catch (e) {
    if (e instanceof AppError) return reply(req, e.status, { ok: false, code: e.code, error: e.message });
    console.error("shinobi-account-admin", e);
    return reply(req, 503, { ok: false, error: "Falha na administração da conta." });
  }
});
