(function(){
  "use strict";
  const replacements = new Map([
    ["Servidor R27 + Cloudflare Tunnel","Cloudflare Workers + Durable Objects"],
    ["Salas persistentes no servidor local; quando o mesmo servidor é publicado por Cloudflare Tunnel, jogadores externos entram pelo mesmo endereço.","Salas coordenadas no Cloudflare Durable Objects, com contas e saves persistidos no MongoDB Atlas."],
    ["Esta versão sincroniza presença, resumo da ficha, chat, saves individuais e o mesmo contexto de campanha/IA ao entrar em uma sala. Combate simultâneo compartilhado ainda não está implementado nesta etapa.","O online sincroniza presença, resumo da ficha, chat, saves individuais e contexto de campanha. Ações de sala passam pela autoridade do Worker antes de serem aceitas."],
    ["Online indisponível. O servidor Node precisa estar ativo. Worker/D1 é opcional; sem ele as salas persistem localmente no host.","Online indisponível. O Worker Cloudflare precisa estar configurado e conectado ao MongoDB Atlas."],
    ["Save local, D1 e Drive confirmados.","Save local e MongoDB Atlas confirmados."],
    ["Save confirmado no computador, D1 e Drive.","Save confirmado no computador e MongoDB Atlas."],
    ["Save privado confirmado no computador, D1 e Drive.","Save privado confirmado no computador e MongoDB Atlas."]
  ]);
  function repair(root=document.body){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){const original=n.nodeValue;if(!original||!original.trim())continue;let next=original;for(const [from,to] of replacements)next=next.split(from).join(to);next=next.replace(/\bD1 e Drive\b/g,"MongoDB Atlas").replace(/\bWorker\/D1\b/g,"Cloudflare\/MongoDB");if(next!==original)n.nodeValue=next;}
    document.documentElement.dataset.r41Backend=window.NARUTO_R41_API_ORIGIN?"cloudflare-mongodb":"unconfigured";
  }
  let queued=false;const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;repair();});};
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.addEventListener("DOMContentLoaded",schedule,{once:true});schedule();
  window.__R41_FINAL_REPAIR__={build:"R41-INTEGRAL-20260819",repair};
})();
