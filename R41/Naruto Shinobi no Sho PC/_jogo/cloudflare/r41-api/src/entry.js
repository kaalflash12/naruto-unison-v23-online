import worker, { GameRoom } from "./index.js";
export { GameRoom };

async function mapWorldTick(req){
  const url = new URL(req.url);
  if (url.pathname.replace(/\/+$/g, "") !== "/api/v84/world/tick") return null;
  let body = {};
  try { body = await req.clone().json(); } catch {}
  const mapped = new URL(req.url);
  mapped.pathname = "/api/v84/world/event";
  const payload = {
    type: "world_tick",
    detail: body,
    campaignId: body.campaignId || body.detail?.campaignId || "default",
    minutes: Number(body.minutes ?? body.deltaMinutes ?? 0),
    source: "world-tick"
  };
  return new Request(mapped.toString(), {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(payload)
  });
}

export default {
  async fetch(req, env, ctx) {
    const mapped = await mapWorldTick(req);
    if (mapped) return worker.fetch(mapped, env, ctx);
    return worker.fetch(req, env, ctx);
  }
};
