const UPSTREAM = "https://naruto-shinobi-r40-online.vercel.app";
const MAX_PATH_CHARS = 2048;
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);
const ALLOWED = new Set([
  "https://kaalflash12.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
]);

function cors(origin: string | null) {
  const allow = origin && ALLOWED.has(origin) ? origin : "https://kaalflash12.github.io";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, content-type, accept, x-client-info, apikey",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(origin: string | null, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "x-r41-bridge": "1" }
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const c = cors(origin);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: c });

  try {
    if (origin && !ALLOWED.has(origin)) return json(origin, 403, { error: "origin_not_allowed" });
    if (!ALLOWED_METHODS.has(req.method)) return json(origin, 405, { error: "method_not_allowed" });

    const url = new URL(req.url);
    const rawPath = url.searchParams.get("path") || "";
    if (
      !rawPath.startsWith("/api/") ||
      rawPath.length > MAX_PATH_CHARS ||
      rawPath.includes("://") ||
      /[\r\n]/.test(rawPath)
    ) {
      return json(origin, 400, { error: "invalid_path" });
    }

    const target = new URL(UPSTREAM + rawPath);
    if (target.origin !== UPSTREAM || !target.pathname.startsWith("/api/")) {
      return json(origin, 400, { error: "invalid_target" });
    }

    const headers = new Headers();
    const authorization = req.headers.get("authorization");
    const contentType = req.headers.get("content-type");
    const accept = req.headers.get("accept");
    if (authorization) headers.set("authorization", authorization);
    if (contentType) headers.set("content-type", contentType);
    if (accept) headers.set("accept", accept);
    headers.set("user-agent", "Shinobi-no-Sho-R41-GitHub-Bridge");

    const init: RequestInit = { method: req.method, headers, redirect: "manual" };
    if (BODY_METHODS.has(req.method)) {
      const declared = Number(req.headers.get("content-length") || "0");
      if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return json(origin, 413, { error: "body_too_large" });
      const body = await req.arrayBuffer();
      if (body.byteLength > MAX_BODY_BYTES) return json(origin, 413, { error: "body_too_large" });
      init.body = body;
    }

    const upstream = await fetch(target, init);
    const out = new Headers(c);
    const upstreamType = upstream.headers.get("content-type");
    const cache = upstream.headers.get("cache-control");
    if (upstreamType) out.set("content-type", upstreamType);
    if (cache) out.set("cache-control", cache);
    out.set("x-r41-bridge", "1");

    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (error) {
    return json(origin, 502, { error: "bridge_error", message: String((error as Error)?.message || error) });
  }
});
