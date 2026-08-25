import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CACHE_MS = 15_000;

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=15"
};

let cached: { at: number; status: number; body: Record<string, unknown> } | null = null;

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
  if (req.method !== "GET") return reply(405, { ok: false, error: "method_not_allowed" });

  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return reply(cached.status, cached.body);

  try {
    const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { error } = await db.from("r41_worlds").select("id", { head: true }).limit(1);
    const status = error ? 503 : 200;
    const body = error
      ? { ok: false, service: "naruto-shinobi-no-sho-r41", error: "service_unavailable" }
      : { ok: true, service: "naruto-shinobi-no-sho-r41", version: "R41-PUBLIC-HEALTH-2026-08-25" };
    cached = { at: now, status, body };
    return reply(status, body);
  } catch {
    const body = { ok: false, service: "naruto-shinobi-no-sho-r41", error: "service_unavailable" };
    cached = { at: now, status: 503, body };
    return reply(503, body);
  }
});
