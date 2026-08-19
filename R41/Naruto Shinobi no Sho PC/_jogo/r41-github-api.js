(function(){
  "use strict";
  const originalFetch = window.fetch.bind(window);
  const gameBase = new URL("./", document.baseURI);
  function apiOrigin(){return String(window.NARUTO_R41_API_ORIGIN || localStorage.getItem("sns-r41-api-origin") || "").replace(/\/+$/g, "");}
  function token(){return sessionStorage.getItem("sns-v841-auth-token") || "";}
  function mapTarget(raw){
    if (raw.startsWith("/api/")) {
      const origin=apiOrigin();
      if (!origin) throw new Error("R41_API_ORIGIN_NOT_CONFIGURED");
      return {url:origin + raw,api:true};
    }
    if (raw.startsWith("/assets/") || raw.startsWith("/data/") || raw.startsWith("/_r40/") || raw.startsWith("/src/")) return {url:new URL(raw.slice(1), gameBase).toString(),api:false};
    return {url:raw,api:false};
  }
  function withAuth(init,api){
    if(!api)return init;
    const out={...(init||{})};
    const headers=new Headers(out.headers||{});
    const t=token();
    if(t&&!headers.has("authorization"))headers.set("authorization",`Bearer ${t}`);
    out.headers=headers;
    return out;
  }
  window.fetch = function(input, init){
    const raw=typeof input === "string" ? input : (input && input.url ? input.url : String(input));
    let mapped;try{mapped=mapTarget(raw);}catch(err){return Promise.reject(err);}
    if (typeof input === "string") return originalFetch(mapped.url, withAuth(init,mapped.api));
    if (input instanceof Request) {
      const merged=withAuth(init,mapped.api),headers=new Headers(input.headers);
      if(merged?.headers)for(const [k,v] of merged.headers.entries())headers.set(k,v);
      return originalFetch(new Request(mapped.url,input),{...merged,headers});
    }
    return originalFetch(mapped.url,withAuth(init,mapped.api));
  };
  window.__R41_GITHUB_API__ = {build:"R41-CLOUDFLARE-MONGODB-INTEGRAL-20260819",get apiOrigin(){return apiOrigin();},backend:apiOrigin()?"cloudflare-mongodb-durable-objects":"unconfigured",sameOriginStatic:true};
})();
