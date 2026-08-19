(function(){
  "use strict";
  const params = new URLSearchParams(location.search);
  const fromQuery = String(params.get("api") || "").trim().replace(/\/+$/g, "");
  const fromStorage = String(localStorage.getItem("sns-r41-api-origin") || "").trim().replace(/\/+$/g, "");
  const baked = ""; // preenchido automaticamente pelo ATIVAR_R41_CLOUDFLARE_MONGODB.ps1 após o deploy
  const origin = fromQuery || fromStorage || baked;
  if (fromQuery) localStorage.setItem("sns-r41-api-origin", fromQuery);
  window.NARUTO_R41_API_ORIGIN = origin;
  window.NARUTO_R41_API_BUILD = "R41-CLOUDFLARE-MONGODB-INTEGRAL-20260819";
})();
