(function(){
  "use strict";
  const originalFetch = window.fetch.bind(window);
  const gameBase = new URL("./", document.baseURI);
  const CLAIM_KEY="sns-r41-leon-claim";
  function apiOrigin(){return String(window.NARUTO_R41_API_ORIGIN || localStorage.getItem("sns-r41-api-origin") || "").replace(/\/+$/g, "");}
  function token(){return sessionStorage.getItem("sns-v841-auth-token") || "";}
  function captureClaim(){
    try{
      const u=new URL(location.href),claim=String(u.searchParams.get("leonClaim")||"").trim();
      if(claim){sessionStorage.setItem(CLAIM_KEY,claim);u.searchParams.delete("leonClaim");history.replaceState(null,"",u.pathname+(u.search?u.search:"")+(u.hash||""));}
    }catch{}
  }
  captureClaim();
  function mapTarget(raw){
    if (raw.startsWith("/api/")) {
      const origin=apiOrigin();
      if (!origin) throw new Error("R41_API_ORIGIN_NOT_CONFIGURED");
      return {url:origin + raw,api:true,route:raw};
    }
    if (raw.startsWith("/assets/") || raw.startsWith("/data/") || raw.startsWith("/_r40/") || raw.startsWith("/src/")) return {url:new URL(raw.slice(1), gameBase).toString(),api:false,route:""};
    return {url:raw,api:false,route:""};
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
  async function applyLeonClaim(response,mapped){
    if(!mapped.api||!response.ok||!["/api/auth/login","/api/auth/register"].includes(mapped.route))return response;
    const claim=sessionStorage.getItem(CLAIM_KEY)||"";
    if(!claim)return response;
    let data;try{data=await response.clone().json();}catch{return response;}
    if(!data?.ok||!data?.token||!data?.account)return response;
    if(data.account.role==="leon"){sessionStorage.removeItem(CLAIM_KEY);return response;}
    try{
      const origin=apiOrigin();
      const claimed=await originalFetch(origin+"/api/private/claim-leon",{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${data.token}`},body:JSON.stringify({code:claim})});
      const c=await claimed.json().catch(()=>({}));
      if(!claimed.ok||!c.ok||c.account?.role!=="leon")return response;
      data.account=c.account;
      sessionStorage.removeItem(CLAIM_KEY);
      const headers=new Headers(response.headers);headers.set("content-type","application/json; charset=utf-8");
      return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
    }catch{return response;}
  }
  window.fetch = async function(input, init){
    const raw=typeof input === "string" ? input : (input && input.url ? input.url : String(input));
    let mapped;try{mapped=mapTarget(raw);}catch(err){return Promise.reject(err);}
    let response;
    if (typeof input === "string") response=await originalFetch(mapped.url, withAuth(init,mapped.api));
    else if (input instanceof Request) {
      const merged=withAuth(init,mapped.api),headers=new Headers(input.headers);
      if(merged?.headers)for(const [k,v] of merged.headers.entries())headers.set(k,v);
      response=await originalFetch(new Request(mapped.url,input),{...merged,headers});
    } else response=await originalFetch(mapped.url,withAuth(init,mapped.api));
    return applyLeonClaim(response,mapped);
  };
  window.__R41_GITHUB_API__ = {build:"R41-CLOUDFLARE-MONGODB-INTEGRAL-20260819",get apiOrigin(){return apiOrigin();},backend:apiOrigin()?"cloudflare-mongodb-durable-objects":"unconfigured",sameOriginStatic:true,leonClaimPending:()=>!!sessionStorage.getItem(CLAIM_KEY)};
})();
