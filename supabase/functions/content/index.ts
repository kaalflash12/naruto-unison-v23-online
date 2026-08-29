import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const PAGE_SIZE = 1000;
const MAX_ROWS = 100_000;

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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=30",
  "X-Content-Type-Options": "nosniff"
};

type ContentRow = {
  entity_id: string;
  published: unknown;
  published_version: number;
};

type TypeRow = {
  entity_id: string;
  entity_type: string;
};

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function routePath(u: URL) {
  const segments = u.pathname.split("/").filter(Boolean);
  const marker = segments.lastIndexOf("content");
  if (marker >= 0) return segments.slice(marker + 1).join("/");
  return segments.at(-1) || "";
}

async function fetchPublishedRows(db: ReturnType<typeof createClient>, type: string) {
  const rows: ContentRow[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await db
      .from("content_entities")
      .select("entity_id,published,published_version")
      .eq("entity_type", type)
      .not("published", "is", null)
      .order("entity_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    const page = (data || []) as ContentRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return { data: rows, error: null };
  }
  throw new Error("content_row_limit_exceeded");
}

async function fetchPublishedTypes(db: ReturnType<typeof createClient>) {
  const rows: TypeRow[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await db
      .from("content_entities")
      .select("entity_id,entity_type")
      .not("published", "is", null)
      .order("entity_type", { ascending: true })
      .order("entity_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    const page = (data || []) as TypeRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return { data: rows, error: null };
  }
  throw new Error("content_type_row_limit_exceeded");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
  if (req.method !== "GET") return reply(405, { ok: false, error: "method_not_allowed" });

  try {
    const db = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const u = new URL(req.url);
    const path = routePath(u);

    if (path === "manifest") {
      const [{ data: publication, error: publicationError }, typeResult] = await Promise.all([
        db.from("content_publications").select("revision,created_at").order("revision", { ascending: false }).limit(1).maybeSingle(),
        fetchPublishedTypes(db)
      ]);
      if (publicationError || typeResult.error) return reply(503, { ok: false, error: "content_unavailable" });
      const types = typeResult.data || [];
      const entities = [...new Set(types.map((x) => x.entity_type))]
        .filter((type) => TYPE_RE.test(type))
        .sort()
        .map((type) => ({ type }));
      return reply(200, {
        ok: true,
        revision: publication?.revision || 0,
        entities,
        publishedCount: types.length
      });
    }

    const type = (u.searchParams.get("type") || path || "").trim();
    if (!TYPE_RE.test(type)) return reply(400, { ok: false, error: "invalid_type" });

    const { data, error } = await fetchPublishedRows(db, type);
    if (error || !data) return reply(503, { ok: false, error: "content_unavailable" });

    return reply(200, {
      ok: true,
      type,
      count: data.length,
      items: data.map((x) => x.published),
      versions: Object.fromEntries(data.map((x) => [x.entity_id, x.published_version]))
    });
  } catch (error) {
    console.error("content function failure", error);
    return reply(503, { ok: false, error: "content_unavailable" });
  }
});
