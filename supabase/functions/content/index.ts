import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

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
const TYPE_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=30",
  "X-Content-Type-Options": "nosniff"
};

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
  if (req.method !== "GET") return reply(405, { ok: false, error: "method_not_allowed" });

  try {
    const db = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const u = new URL(req.url);
    const path = u.pathname.replace(/^\/functions\/v1\/content\/?/, "");

    if (path === "manifest") {
      const [{ data: publication, error: publicationError }, { data: types, error: typesError }] = await Promise.all([
        db.from("content_publications").select("revision,created_at").order("revision", { ascending: false }).limit(1).maybeSingle(),
        db.from("content_entities").select("entity_type").not("published", "is", null)
      ]);
      if (publicationError || typesError) return reply(503, { ok: false, error: "content_unavailable" });
      const entities = [...new Set((types || []).map((x: { entity_type: string }) => x.entity_type))]
        .filter((type) => TYPE_RE.test(type))
        .sort()
        .map((type) => ({ type }));
      return reply(200, { ok: true, revision: publication?.revision || 0, entities });
    }

    const type = (u.searchParams.get("type") || path || "").trim();
    if (!TYPE_RE.test(type)) return reply(400, { ok: false, error: "invalid_type" });

    const { data, error } = await db
      .from("content_entities")
      .select("entity_id,published,published_version")
      .eq("entity_type", type)
      .not("published", "is", null);
    if (error) return reply(503, { ok: false, error: "content_unavailable" });

    return reply(200, {
      ok: true,
      type,
      items: (data || []).map((x: { published: unknown }) => x.published),
      versions: Object.fromEntries((data || []).map((x: { entity_id: string; published_version: number }) => [x.entity_id, x.published_version]))
    });
  } catch {
    return reply(503, { ok: false, error: "content_unavailable" });
  }
});
