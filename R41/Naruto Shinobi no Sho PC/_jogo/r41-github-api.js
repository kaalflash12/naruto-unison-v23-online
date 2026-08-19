(function(){
  "use strict";
  const originalFetch = window.fetch.bind(window);
  const apiOrigin = String(window.NARUTO_R41_API_ORIGIN || "").replace(/\/+$/g, "");
  const gameBase = new URL("./", document.baseURI);
  function mapTarget(input){
    const raw = typeof input === "string" ? input : (input && input.url ? input.url : String(input));
    if (raw.startsWith("/api/")) {
      if (!apiOrigin) throw new Error("R41_API_ORIGIN_NOT_CONFIGURED");
      return apiOrigin + raw;
    }
    if (raw.startsWith("/assets/") || raw.startsWith("/data/") || raw.startsWith("/_r40/") || raw.startsWith("/src/")) {
      return new URL(raw.slice(1), gameBase).toString();
    }
    return raw;
  }
  window.fetch = function(input, init){
    let mapped;
    try { mapped = mapTarget(input); } catch (err) { return Promise.reject(err); }
    if (typeof input === "string") return originalFetch(mapped, init);
    if (input instanceof Request) return originalFetch(new Request(mapped, input), init);
    return originalFetch(mapped, init);
  };
  window.__R41_GITHUB_API__ = { build:"R41-CLOUDFLARE-MONGODB-20260819", apiOrigin, backend: apiOrigin ? "cloudflare-mongodb" : "unconfigured", sameOriginStatic:true };
})();
