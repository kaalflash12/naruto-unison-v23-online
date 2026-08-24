(()=>{'use strict';
/* R42 compatibility bridge. The old R39 runtime used its own wheel/touch/scroll
   listeners in parallel with R40. That duplicated controller is intentionally
   removed: NarutoBattleGuard is now the single owner of battle scrolling. */
const guard=()=>window.NarutoBattleGuard||window.NarutoBattleMobileGuard;
const battleActive=()=>!!guard()?.battleActive?.();
const healthCheck=()=>guard()?.sync?.();
const targetControlsReturn=()=>guard()?.returnToControls?.();
const restoreBattle=()=>guard()?.resumeOnline?.();
const refreshJutsuHub=()=>{try{window.NarutoDesktopOverhaul?.refresh?.()}catch(_){ }};
const refreshAssets=()=>{try{window.NarutoDesktopOverhaul?.enhanceAssets?.(document)}catch(_){ }};
function boot(){healthCheck();refreshJutsuHub();refreshAssets()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.NarutoR39Hotfix={healthCheck,battleActive,targetControlsReturn,refreshJutsuHub,refreshAssets,restoreBattle};
})();
