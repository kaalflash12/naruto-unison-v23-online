import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_BODY_BYTES = 5 * 1024 * 1024;

const ALLOWED_ORIGINS = new Set([
  "https://kaalflash12.github.io",
  "https://naruto-shinobi-r40-online.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://kaalflash12.github.io";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function json(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: cors(req) });
}

function route(req: Request) {
  const u = new URL(req.url);
  return u.pathname.replace(/^\/functions\/v1\/r41-api-v1/, "") || "/";
}

function bodyObject(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("body_must_be_object");
  return v as Record<string, unknown>;
}

function text(v: unknown, field: string, max = 160) {
  if (typeof v !== "string" || !v.trim()) throw new Error(field + "_required");
  const out = v.trim();
  if (out.length > max) throw new Error(field + "_too_long");
  return out;
}

function intOrNull(v: unknown) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n < 0) throw new Error("invalid_revision");
  return n;
}

async function parseBody(req: Request) {
  const declared = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new Error("body_too_large");
  const raw = await req.arrayBuffer();
  if (raw.byteLength > MAX_BODY_BYTES) throw new Error("body_too_large");
  try {
    return bodyObject(JSON.parse(new TextDecoder().decode(raw)));
  } catch (e) {
    if (e instanceof Error && e.message === "body_too_large") throw e;
    throw new Error(e instanceof Error ? e.message : "invalid_json");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (!ALLOWED_ORIGINS.has(req.headers.get("origin") || "") && req.headers.has("origin")) {
    return json(req, 403, { ok: false, error: "origin_not_allowed" });
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json(req, 401, { ok: false, error: "missing_bearer_token" });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json(req, 401, { ok: false, error: "invalid_session" });
  const userId = userData.user.id;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const p = route(req);

  try {
    if (req.method === "GET" && p === "/health") {
      const { data, error } = await admin.rpc("test_r41_db");
      if (error) return json(req, 500, { ok: false, error: "db_health_failed", detail: error.message });
      return json(req, 200, { ok: true, api: "R41-API-V1", user_id: userId, db: data });
    }

    if (req.method !== "POST") return json(req, 405, { ok: false, error: "method_not_allowed" });
    const b = await parseBody(req);

    if (p === "/state/load") {
      const slot = text(b.slot ?? "default", "slot", 80).replace(/[^a-zA-Z0-9_.:-]/g, "_");
      const scopeKey = `acct:${userId}:${slot}`;
      const { data, error } = await admin.rpc("load_r41_state_v1", { p_scope_key: scopeKey });
      if (error) return json(req, 500, { ok: false, error: "state_load_failed", detail: error.message });
      return json(req, 200, data);
    }

    if (p === "/state/save") {
      const slot = text(b.slot ?? "default", "slot", 80).replace(/[^a-zA-Z0-9_.:-]/g, "_");
      const state = bodyObject(b.state);
      const expected = intOrNull(b.expected_revision);
      const scopeKey = `acct:${userId}:${slot}`;
      const { data, error } = await admin.rpc("save_r41_state_v1", {
        p_scope_key: scopeKey,
        p_state: state,
        p_expected_revision: expected,
        p_account_id: userId,
        p_character_id: null,
        p_world_id: null
      });
      if (error) return json(req, 500, { ok: false, error: "state_save_failed", detail: error.message });
      return json(req, data?.ok === false ? 409 : 200, data);
    }

    if (p === "/event") {
      const eventType = text(b.event_type, "event_type", 100);
      const payload = b.payload === undefined ? {} : bodyObject(b.payload);
      const slot = text(b.slot ?? "default", "slot", 80).replace(/[^a-zA-Z0-9_.:-]/g, "_");
      const scopeKey = `acct:${userId}:${slot}`;
      const { data, error } = await admin.rpc("append_r41_event", {
        p_scope_key: scopeKey,
        p_event_type: eventType,
        p_payload: payload,
        p_account_id: userId,
        p_character_id: null,
        p_world_id: null
      });
      if (error) return json(req, 500, { ok: false, error: "event_append_failed", detail: error.message });
      return json(req, 200, data);
    }

    if (p === "/world/create") {
      const code = text(b.code, "code", 40).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      if (!code) throw new Error("world_code_required");
      const state = b.state === undefined ? {} : bodyObject(b.state);
      const { data, error } = await admin.rpc("r41_create_world_v1", {
        p_code: code,
        p_owner_account_id: userId,
        p_state: state
      });
      if (error) return json(req, 500, { ok: false, error: "world_create_failed", detail: error.message });
      return json(req, data?.ok === false ? 409 : 200, data);
    }

    if (p === "/world/join") {
      const code = text(b.code, "code", 40).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      const characterId = typeof b.character_id === "string" && b.character_id ? b.character_id : null;
      const { data, error } = await admin.rpc("r41_join_world_v1", {
        p_code: code,
        p_account_id: userId,
        p_character_id: characterId
      });
      if (error) return json(req, 500, { ok: false, error: "world_join_failed", detail: error.message });
      return json(req, data?.ok === false ? 404 : 200, data);
    }

    if (p === "/world/claim") {
      const worldId = text(b.world_id, "world_id", 40);
      const actorKey = text(b.actor_key, "actor_key", 120);
      const ttl = Math.min(3600, Math.max(15, Number.isFinite(Number(b.ttl_seconds)) ? Math.floor(Number(b.ttl_seconds)) : 120));
      const { data, error } = await admin.rpc("r41_claim_actor_v1", {
        p_world_id: worldId,
        p_actor_key: actorKey,
        p_account_id: userId,
        p_ttl_seconds: ttl
      });
      if (error) return json(req, 500, { ok: false, error: "actor_claim_failed", detail: error.message });
      const status = data?.ok === false ? (data.error === "not_world_member" ? 403 : 409) : 200;
      return json(req, status, data);
    }

    if (p === "/world/release") {
      const worldId = text(b.world_id, "world_id", 40);
      const actorKey = text(b.actor_key, "actor_key", 120);
      const { data, error } = await admin.rpc("r41_release_actor_v1", {
        p_world_id: worldId,
        p_actor_key: actorKey,
        p_account_id: userId
      });
      if (error) return json(req, 500, { ok: false, error: "actor_release_failed", detail: error.message });
      return json(req, 200, data);
    }

    if (p === "/world/action") {
      const worldId = text(b.world_id, "world_id", 40);
      const actorKey = text(b.actor_key, "actor_key", 120);
      const action = bodyObject(b.action);
      const expected = intOrNull(b.expected_revision);
      const { data, error } = await admin.rpc("r41_apply_action_v2", {
        p_world_id: worldId,
        p_account_id: userId,
        p_actor_key: actorKey,
        p_action: action,
        p_expected_revision: expected
      });
      if (error) return json(req, 500, { ok: false, error: "world_action_failed", detail: error.message });
      const status = data?.ok === false ? (data.error === "revision_conflict" || data.error === "actor_not_claimed" ? 409 : 403) : 200;
      return json(req, status, data);
    }

    return json(req, 404, { ok: false, error: "route_not_found", route: p });
  } catch (e) {
    const message = e instanceof Error ? e.message : "bad_request";
    return json(req, message === "body_too_large" ? 413 : 400, { ok: false, error: message });
  }
});
