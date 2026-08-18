(()=>{'use strict';
const META={version:'R38-MASTER-2792',count:2792,source:'TERION_NARUTO_V68_MASTER_2792.zip',engine:'TERION 2D10',possessionPolicy:'ENCICLOPEDIA_NAO_CONCEDE_POSSE'};
window.NARUTO_R38_MASTER_META=META;
window.NARUTO_R38_MASTER_LOADED=false;
window.NARUTO_R38_TECH_INDEX=new Map();
window.NARUTO_R38_LOAD_MASTER=async function(){
  if(window.NARUTO_R38_MASTER_LOADED)return window.NARUTO_V84_KNOWLEDGE?.techniques||[];
  if(window.__R38_LOADING)return window.__R38_LOADING;
  window.__R38_LOADING=(async()=>{
    const r=await fetch('data/r38-master-2792.json',{cache:'no-cache'});
    if(!r.ok)throw new Error('MASTER_2792 HTTP '+r.status);
    const a=await r.json();
    if(!Array.isArray(a)||a.length!==2792)throw new Error('MASTER_2792 inválido: '+(a?.length??'n/a'));
    const kb=window.NARUTO_V84_KNOWLEDGE||(window.NARUTO_V84_KNOWLEDGE={});
    kb.techniques=a;
    window.NARUTO_R38_TECH_INDEX=new Map(a.map(x=>[String(x.id),x]));
    window.NARUTO_R38_MASTER_LOADED=true;
    return a;
  })();
  try{return await window.__R38_LOADING}finally{window.__R38_LOADING=null}
};
})();
