(()=>{'use strict';
const DESKTOP='(min-width:1051px)', MOBILE='(max-width:1050px)';
const $=s=>document.querySelector(s);
const page=()=>$('#battlePage');
const visible=el=>!!el&&!el.classList.contains('hidden')&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden';
const battleActive=()=>visible(page())&&!!page()?.querySelector('.ninja,.charmove,.r23Charmove,[data-technique-id]');
const isDesktop=()=>!!matchMedia?.(DESKTOP).matches;
const isMobile=()=>!!matchMedia?.(MOBILE).matches||!!matchMedia?.('(pointer:coarse)').matches;
let desktopStyles=null,lastTargetAt=0;

function setImportant(el,prop,value){if(el)el.style.setProperty(prop,value,'important')}
function syncBattleOverflow(){
 const p=page(),html=document.documentElement,body=document.body;
 if(!battleActive()){
   if(desktopStyles){for(const [el,prop,value,priority] of desktopStyles){if(value)el.style.setProperty(prop,value,priority);else el.style.removeProperty(prop)}desktopStyles=null}
   return;
 }
 if(isDesktop()){
   if(!desktopStyles){desktopStyles=[];for(const el of [html,body])for(const prop of ['height','min-height','overflow-y','overflow-x'])desktopStyles.push([el,prop,el.style.getPropertyValue(prop),el.style.getPropertyPriority(prop)])}
   for(const el of [html,body]){setImportant(el,'height','auto');setImportant(el,'min-height','100%');setImportant(el,'overflow-y','auto');setImportant(el,'overflow-x','hidden')}
   if(p){setImportant(p,'height','auto');setImportant(p,'overflow','visible')}
 }else if(isMobile()&&p){
   setImportant(p,'position','fixed');setImportant(p,'inset','0');setImportant(p,'height','100dvh');setImportant(p,'overflow-y','auto');setImportant(p,'overflow-x','hidden');setImportant(p,'touch-action','pan-y');setImportant(p,'-webkit-overflow-scrolling','touch')
 }
 window.NarutoBattleMobileGuard?.updateDock?.();
}

function nestedScroller(target,delta){
 const el=target?.closest?.('#battlelog,#center,.masteryScroll,#battleHoldCard');if(!el)return null;
 const max=el.scrollHeight-el.clientHeight;if(max<=2)return null;
 const down=delta>0;if((down&&el.scrollTop<max-1)||(!down&&el.scrollTop>1))return el;return null
}
function desktopWheel(e){
 if(!isDesktop()||!battleActive())return;
 if(nestedScroller(e.target,e.deltaY))return;
 const root=document.scrollingElement||document.documentElement;
 const before=root.scrollTop,max=Math.max(0,root.scrollHeight-root.clientHeight);
 if(max<=1)return;
 e.preventDefault();e.stopPropagation();
 root.scrollTop=Math.max(0,Math.min(max,before+e.deltaY));
}

function scrollBattleTo(el,block='center'){
 const p=page();if(!p||!el)return;
 try{el.scrollIntoView({behavior:'smooth',block,inline:'nearest'})}catch(_){try{el.scrollIntoView()}catch(__){}}
 if(isMobile())setTimeout(()=>{
   const pr=p.getBoundingClientRect(),er=el.getBoundingClientRect();
   if(er.top<pr.top+4||er.bottom>pr.bottom-88){
     const y=Math.max(0,p.scrollTop+(er.top-pr.top)-Math.max(8,(p.clientHeight-er.height)/2));
     try{p.scrollTo({top:y,behavior:'smooth'})}catch(_){p.scrollTop=y}
   }
 },90)
}
function targetControlsReturn(){
 if(!isMobile()||!battleActive())return;
 const center=$('#center'),ready=$('#ready');
 setTimeout(()=>{
   if(center)scrollBattleTo(center,'start');
   setTimeout(()=>{try{ready?.focus({preventScroll:true})}catch(_){}window.NarutoBattleMobileGuard?.updateDock?.()},220)
 },90)
}
function targetSelectionAssist(button){
 if(!isMobile()||!battleActive()||!button)return;
 setTimeout(()=>{
   const targets=[...document.querySelectorAll('#battlePage .face.targetable:not([disabled])')].filter(x=>x.offsetParent!==null);
   if(targets.length)scrollBattleTo(targets[0],'center');
 },60)
}

function refreshJutsuHub(){
 try{window.NarutoDesktopOverhaul?.refresh?.()}catch(_){}
 const missionTitle=$('#missionPage .missionPanel>h2');if(missionTitle&&/Provas de Domínio/i.test(missionTitle.textContent))missionTitle.textContent='Tarefas e Feitos';
}
function refreshAssets(){try{window.NarutoDesktopOverhaul?.enhanceAssets?.(document)}catch(_){}}
function restoreBattle(){
 if(battleActive())return;
 try{
   const key='naruto_unison_active_battle_v2',raw=sessionStorage.getItem(key);if(!raw)return;
   const snap=JSON.parse(raw);if(!snap?.g||Date.now()-Number(snap.ts||0)>21600000)return;
   Promise.resolve(window.NarutoBattleRuntime?.resume?.()).catch(()=>{});
 }catch(_){}
}
function healthCheck(){syncBattleOverflow();refreshJutsuHub();refreshAssets()}

document.addEventListener('wheel',desktopWheel,{capture:true,passive:false});
document.addEventListener('click',e=>{
 const skill=e.target.closest?.('#battlePage .charmove,#battlePage .r23Charmove,#battlePage [data-technique-id]');
 if(skill)targetSelectionAssist(skill);
 const target=e.target.closest?.('#battlePage .face.targetable');
 if(target){lastTargetAt=Date.now();targetControlsReturn()}
 const go=e.target.closest?.('[data-go]')?.dataset.go;
 if(go==='jutsus')setTimeout(refreshJutsuHub,0);
},true);

document.addEventListener('touchend',e=>{if(!battleActive()||!isMobile())return;const t=e.target.closest?.('#battlePage .face.targetable');if(t&&Date.now()-lastTargetAt>80)targetControlsReturn()},{passive:true,capture:true});

const observer=new MutationObserver(()=>queueMicrotask(healthCheck));
function boot(){
 observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','disabled']});
 healthCheck();restoreBattle();
 [250,800,1800,3500].forEach(ms=>setTimeout(()=>{healthCheck();restoreBattle()},ms));
}
window.addEventListener('pageshow',()=>{healthCheck();restoreBattle()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){healthCheck();restoreBattle()}});
window.addEventListener('resize',healthCheck,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(()=>{healthCheck();if(battleActive()&&isMobile())targetControlsReturn()},180),{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.NarutoR39Hotfix={healthCheck,battleActive,targetControlsReturn,refreshJutsuHub,refreshAssets,restoreBattle};
})();
