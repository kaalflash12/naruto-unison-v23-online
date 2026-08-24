(()=>{'use strict';
const SIDE_ID={you:'player0',ai:'player1'};
const KIND_CLASS={attack:'damage',damage:'damage',stun:'stun',dot:'dot',heal:'heal',shield:'shield',invuln:'invuln',status:'status',cleanse:'heal',dispel:'status'};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const reducedMotion=()=>{try{if(localStorage.getItem('naruto_reduce_motion')==='1')return true}catch(_){}const coarse=!!(window.matchMedia&&(window.matchMedia('(pointer:coarse)').matches||window.matchMedia('(hover:none)').matches));return !!(coarse&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));

function snapshot(f){
 return {hp:Number(f?.hp||0),maxHp:Math.max(1,Number(f?.maxHp||100)),shield:Number(f?.shield||0),stun:Number(f?.stun||0),dot:Number(f?.dot||0),inv:Number(f?.inv||0)}
}
function capture(game){
 return {you:(game?.you||[]).map(snapshot),ai:(game?.ai||[]).map(snapshot)}
}
function fighter(ref){
 if(!ref||!SIDE_ID[ref.side])return null;
 return document.querySelector(`#${SIDE_ID[ref.side]} .ninja[data-fighter-index="${Number(ref.index)}"]`)
}
function face(ref){return fighter(ref)?.querySelector('.face')||null}
function ensureLayer(){
 const game=document.querySelector('#battlePage #game');if(!game)return null;
 let layer=game.querySelector(':scope > .battleFxLayer');
 if(!layer){layer=document.createElement('div');layer.className='battleFxLayer';layer.setAttribute('aria-hidden','true');game.appendChild(layer)}
 return layer
}
function cleanup(){
 document.querySelectorAll('.battleFxLayer').forEach(layer=>layer.remove());
 document.querySelector('#battlePage')?.classList.remove('fx-resolving');
 document.querySelectorAll('.battleFxTarget').forEach(el=>{for(const cls of [...el.classList])if(cls.startsWith('battleFxTarget'))el.classList.remove(cls)})
}
function localPoint(el,layer){
 if(!el||!layer)return null;const a=el.getBoundingClientRect(),b=layer.getBoundingClientRect();
 return {x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2}
}
function normalizeKind(kind){return KIND_CLASS[String(kind||'damage').toLowerCase()]||'damage'}
function chakraClass(skill){
 const cost=Array.isArray(skill?.cost)?skill.cost:[];
 const raw=cost.map(x=>String(x).toLowerCase());
 if(raw.some(x=>x.includes('blood')||x.includes('kek')||x.includes('lin')))return 'blood';
 if(raw.some(x=>x.includes('gen')))return 'gen';
 if(raw.some(x=>x.includes('tai')))return 'tai';
 if(raw.some(x=>x.includes('nin')))return 'nin';
 return 'wild';
}

function signatureClass(skill){
 const n=String(skill?.name||'').toLowerCase();
 if(n.includes('rasengan'))return'rasengan';
 if(n.includes('chidori')||n.includes('lightning blade')||n.includes('raikiri')||n.includes('raiton')||n.includes('lightning'))return'chidori';
 if(n.includes('amaterasu'))return'amaterasu';
 if(n.includes('susanoo'))return'susanoo';
 if(n.includes('sharingan')||n.includes('byakugan')||n.includes('rinnegan')||n.includes('dōjutsu')||n.includes('dojutsu'))return'dojutsu';
 if(n.includes('katon')||n.includes('fire')||n.includes('flame'))return'fire';
 if(n.includes('suiton')||n.includes('water')||n.includes('aqua')||n.includes('shark'))return'water';
 if(n.includes('fūton')||n.includes('futon')||n.includes('wind'))return'wind';
 if(n.includes('doton')||n.includes('earth')||n.includes('stone')||n.includes('rock'))return'earth';
 if(n.includes('sand')||n.includes('suna'))return'sand';
 if(n.includes('shadow')||n.includes('kage mane')||n.includes('kagemane'))return'shadow';
 if(n.includes('medical')||n.includes('healing')||n.includes('heal')||n.includes('mystical palm'))return'medical';
 if(n.includes('clone')||n.includes('bunshin'))return'clone';
 return chakraClass(skill);
}
function skillSource(skill){
 const raw=skill?.image||'';if(!raw)return '';
 try{return new URL(raw,document.baseURI).href}catch(_){return raw}
}
function projectile(source,target,skill,kind,order){
 const layer=ensureLayer(),from=localPoint(face(source),layer),to=localPoint(face(target),layer);
 if(!layer||!from||!to)return Promise.resolve();
 const node=document.createElement('div'),chakra=chakraClass(skill),signature=signatureClass(skill);node.className=`battleFxProjectile battleFx-${normalizeKind(kind)} battleFxChakra-${chakra} battleFxSig-${signature}`;node.dataset.signature=signature;
 const src=skillSource(skill);if(src){const img=document.createElement('img');img.src=src;img.alt='';node.appendChild(img)}
 const core=document.createElement('i');node.appendChild(core);const sig=document.createElement('u');sig.className='battleFxSignature';node.appendChild(sig);for(let n=0;n<7;n++){const p=document.createElement('span');p.className='battleFxSpark';p.style.setProperty('--i',n);node.appendChild(p)}node.style.left=`${from.x}px`;node.style.top=`${from.y}px`;layer.appendChild(node);
 const dx=to.x-from.x,dy=to.y-from.y,arc=Math.max(16,Math.min(58,Math.hypot(dx,dy)*.12));
 const duration=clamp(390+Number(order||0)*26,390,560);
 if(!node.animate){node.remove();return Promise.resolve()}
 const animation=node.animate([
  {transform:'translate(-50%,-50%) translate(0,0) scale(.35) rotate(-8deg)',opacity:0,filter:'brightness(1.6)'},
  {transform:`translate(-50%,-50%) translate(${dx*.5}px,${dy*.5-arc}px) scale(1.08) rotate(3deg)`,opacity:1,filter:'brightness(1.2)',offset:.52},
  {transform:`translate(-50%,-50%) translate(${dx}px,${dy}px) scale(.52) rotate(10deg)`,opacity:.12,filter:'brightness(2)'}
 ],{duration,easing:'cubic-bezier(.2,.75,.25,1)',fill:'forwards'});
 return animation.finished.catch(()=>{}).then(()=>node.remove())
}
async function travel(source,targets,skill,kind){
 const list=(targets||[]).filter(Boolean);if(reducedMotion()||!source||!list.length)return;
 document.querySelector('#battlePage')?.classList.add('fx-resolving');
 const srcFace=face(source),chakra=chakraClass(skill),signature=signatureClass(skill);if(srcFace){srcFace.classList.add('battleFxCasting',`battleFxCast-${signature}`);setTimeout(()=>srcFace.classList.remove('battleFxCasting',`battleFxCast-${signature}`),620)}if(srcFace?.animate&&!reducedMotion()){
 const frames=chakra==='tai'?[{transform:'translateX(0) scale(1)'},{transform:'translateX(10px) scale(1.08)',filter:'brightness(1.45)'},{transform:'translateX(0) scale(1)'}]:[{transform:'scale(1)'},{transform:'scale(1.06)',filter:'brightness(1.35)'},{transform:'scale(1)'}];
 srcFace.animate(frames,{duration:chakra==='tai'?210:260,easing:'ease-out'});
}
 await Promise.all(list.map((target,i)=>projectile(source,target,skill,kind,i)))
}
function valueLabel(event){
 const before=event.before||{},after=event.after||{},kind=normalizeKind(event.kind);
 const hpDelta=Number(after.hp||0)-Number(before.hp||0),shieldDelta=Number(after.shield||0)-Number(before.shield||0);
 if(kind==='heal')return hpDelta>0?`+${hpDelta} PV`:(event.label||'RECUPERAÇÃO');
 if(kind==='shield')return shieldDelta>0?`+${shieldDelta} DEF`:(event.label||'PROTEÇÃO');
 if(kind==='invuln')return event.label||'INVULNERÁVEL';
 if(kind==='stun'&&hpDelta===0)return event.label||'ATORDOADO';
 if(kind==='dot'&&hpDelta===0)return event.label||'AFLIÇÃO';
 if(hpDelta<0)return `−${Math.abs(hpDelta)} PV`;
 if(shieldDelta<0)return after.inv?'IMUNE':'BLOQUEADO';
 return event.label||(after.inv?'IMUNE':kind==='stun'?'ATORDOADO':kind==='dot'?'AFLIÇÃO':'EFEITO')
}
function animateCounter(span,before,after,duration){
 if(!span||before.hp===after.hp)return Promise.resolve();
 if(reducedMotion()){span.textContent=`${after.hp}/${after.maxHp}`;return Promise.resolve()}
 const start=performance.now();
 return new Promise(resolve=>{
  const step=now=>{const p=clamp((now-start)/duration,0,1),ease=1-Math.pow(1-p,3),hp=Math.round(before.hp+(after.hp-before.hp)*ease);span.textContent=`${hp}/${after.maxHp}`;if(p<1)requestAnimationFrame(step);else resolve()};
  requestAnimationFrame(step)
 })
}
function impact(event,index){
 const target=fighter(event.target);if(!target)return Promise.resolve();const layer=ensureLayer(),point=localPoint(target.querySelector('.face'),layer);if(!layer||!point)return Promise.resolve();
 const kind=normalizeKind(event.kind),duration=kind==='invuln'||kind==='shield'?650:560;
 target.classList.add('battleFxTarget',`battleFxTarget-${kind}`);
 const node=document.createElement('div');node.className=`battleFxImpact battleFx-${kind}`;node.style.left=`${point.x}px`;node.style.top=`${point.y}px`;
 const ring=document.createElement('i');ring.className='battleFxRing';node.appendChild(ring);
 const label=document.createElement('b');label.className='battleFxValue';label.textContent=valueLabel(event);node.appendChild(label);layer.appendChild(node);
 const before=event.before||snapshot({}),after=event.after||before;
 const hpDelta=Number(after.hp||0)-Number(before.hp||0),page=document.querySelector('#battlePage');
 if(page&&!reducedMotion()){const cls=hpDelta<=-35?'fx-heavy-hit':kind==='heal'?'fx-heal-pulse':kind==='stun'?'fx-stun-pulse':'';if(cls){page.classList.remove(cls);void page.offsetWidth;page.classList.add(cls);setTimeout(()=>page.classList.remove(cls),520)}}
 const hp=target.querySelector('.charhealth'),def=target.querySelector('.chardefense'),txt=target.querySelector('.charhealthbar span');
 const hpFrom=clamp(100*before.hp/before.maxHp,0,100),hpTo=clamp(100*after.hp/after.maxHp,0,100),defFrom=clamp(before.shield,0,100),defTo=clamp(after.shield,0,100);
 if(hp){hp.style.width=`${hpTo}%`;if(hp.animate&&!reducedMotion()&&hpFrom!==hpTo)hp.animate([{width:`${hpFrom}%`},{width:`${hpTo}%`}],{duration:520,easing:'cubic-bezier(.25,.8,.25,1)'})}
 if(def){def.style.width=`${defTo}%`;if(def.animate&&!reducedMotion()&&defFrom!==defTo)def.animate([{width:`${defFrom}%`},{width:`${defTo}%`}],{duration:520,easing:'cubic-bezier(.25,.8,.25,1)'})}
 const count=animateCounter(txt,before,after,520);
 if(reducedMotion()){node.remove();target.classList.remove('battleFxTarget',`battleFxTarget-${kind}`);return count}
 if(node.animate)node.animate([
  {opacity:0,transform:'translate(-50%,-50%) scale(.35)'},
  {opacity:1,transform:'translate(-50%,-50%) scale(1.12)',offset:.28},
  {opacity:0,transform:'translate(-50%,-50%) scale(1.45)'}
 ],{duration:duration+Number(index||0)*18,easing:'ease-out',fill:'forwards'});
 return Promise.all([count,wait(duration)]).then(()=>{node.remove();target.classList.remove('battleFxTarget',`battleFxTarget-${kind}`)})
}
async function resolve(events){
 const list=(events||[]).filter(e=>e&&e.target);if(!list.length){document.querySelector('#battlePage')?.classList.remove('fx-resolving');return}
 if(reducedMotion()){document.querySelector('#battlePage')?.classList.remove('fx-resolving');return}
 document.querySelector('#battlePage')?.classList.add('fx-resolving');
 await Promise.all(list.map(impact));document.querySelector('#battlePage')?.classList.remove('fx-resolving')
}
function diff(previous,game){
 const out=[];if(!previous||!game)return out;
 for(const side of ['you','ai'])for(let i=0;i<(game[side]||[]).length;i++){
  const before=previous[side]?.[i],after=snapshot(game[side][i]);if(!before)continue;
  if(before.hp===after.hp&&before.shield===after.shield&&before.stun===after.stun&&before.dot===after.dot&&before.inv===after.inv)continue;
  let kind=after.hp>before.hp?'heal':after.hp<before.hp?(after.dot&&!before.dot?'dot':'damage'):after.shield>before.shield?'shield':after.shield<before.shield?'damage':after.inv&&!before.inv?'invuln':after.stun&&!before.stun?'stun':after.dot&&!before.dot?'dot':'status';
  out.push({target:{side,index:i},kind,before,after})
 }
 return out
}
async function resolveDiff(previous,game){return resolve(diff(previous,game))}
function namedFighter(game,name,preferredSide){
 const wanted=String(name||'').trim().toLocaleLowerCase('pt-BR');
 const sides=preferredSide?[preferredSide,preferredSide==='you'?'ai':'you']:['you','ai'];
 for(const side of sides)for(let index=0;index<(game?.[side]||[]).length;index++)if(String(game[side][index].name||'').trim().toLocaleLowerCase('pt-BR')===wanted)return {side,index,fighter:game[side][index]};
 return null
}
function parseAction(entry,game,role){
 const text=entry?.text||entry,ownKind=role==='guest'?'bad':'good',sourceSide=entry?.kind===ownKind?'you':entry?.kind==='info'?null:'ai';
 let match=String(text||'').match(/^(.*?) usa (.*?) em (.*?):\s*\d+ (?:de )?dano\.?$/i),kind='damage',sourceName,skillName,targetName;
 if(match){[,sourceName,skillName,targetName]=match}
 else if((match=String(text||'').match(/^(.*?) usa (.*?):\s*\+\d+ PV(?: em (.*?))?\.?$/i))){[,sourceName,skillName,targetName]=match;kind='heal'}
 else if((match=String(text||'').match(/^(.*?) usa (.*?):\s*\+\d+ defesa(?: em (.*?))?(?: por .*?)?\.?$/i))){[,sourceName,skillName,targetName]=match;kind='shield'}
 else if((match=String(text||'').match(/^(.*?) usa (.*?):\s*(.*?) fica invulnerável/i))){[,sourceName,skillName,targetName]=match;kind='invuln'}
 else return null;
 const source=namedFighter(game,sourceName,sourceSide);if(!source)return null;
 const skill=source.fighter.skills?.find(s=>String(s.name).trim()===String(skillName).trim())||{name:skillName,image:'',mechanic:{kind}};
 kind=normalizeKind(skill.mechanic?.kind||kind);
 const targetSide=sourceSide?(skill.mechanic?.target==='enemy'?(sourceSide==='you'?'ai':'you'):sourceSide):null,target=namedFighter(game,targetName||sourceName,targetSide);if(!target)return null;
 return {source:{side:source.side,index:source.index},target:{side:target.side,index:target.index},skill,kind}
}
async function replayLogs(logs,game,role){
 if(reducedMotion())return;const list=Array.isArray(logs)?logs:[],texts=list.map(x=>String(x?.text||x));
 const from=Math.max(0,texts.findLastIndex?texts.findLastIndex(x=>/^— Turno /i.test(x)):0);
 const actions=list.slice(from).map(x=>parseAction(x,game,role)).filter(Boolean).slice(-8);if(!actions.length)return;
 document.querySelector('#battlePage')?.classList.add('fx-resolving');
 for(const action of actions)await travel(action.source,[action.target],action.skill,action.kind);
 document.querySelector('#battlePage')?.classList.remove('fx-resolving')
}

window.BattleFX={snapshot,capture,travel,resolve,diff,resolveDiff,replayLogs,reducedMotion,cleanup,chakraClass,signatureClass};
})();
