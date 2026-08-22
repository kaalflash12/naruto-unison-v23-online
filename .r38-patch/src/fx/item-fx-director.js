import { BattleEvent as E } from '../domains/battle/battle-events.js';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return Math.abs(h|0)};
export class ItemFxDirector{
 constructor({bus,root=document,audio}){Object.assign(this,{bus,root,audio});this.controller=new AbortController();}
 start(){const o={signal:this.controller.signal};this.bus.on(E.ITEM_USED,p=>this.play(p),o);this.bus.on('item:consumed',p=>{if(!p.context?.battle)this.playInventory(p)},o);}
 stop(){this.controller.abort();}
 targetEl(id){return id?this.root.querySelector(`[data-fighter-id="${CSS.escape(id)}"]`):null;}
 reduced(){return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.reducedMotion==='true';}
 async play({item,target,after,before}){
  const el=this.targetEl(target?.id);if(!el||!item)return;const kind=item.fxProfileId||item.effect?.kind||'item',seed=hash(item.id),card=document.createElement('div');card.className=`itemFx itemFx--${kind}`;card.style.setProperty('--item-spin',`${180+seed%540}deg`);card.style.setProperty('--item-shift',`${(seed%31)-15}px`);
  const img=document.createElement('img');img.src=item.image;img.alt='';img.onerror=()=>img.classList.add('itemFx__missing');const text=document.createElement('span'),name=document.createElement('b'),delta=document.createElement('small');name.textContent=item.name;delta.textContent=this.delta(item,before,after);text.append(name,delta);card.append(img,text);el.append(card);this.audio?.play?.(`item:${kind}`);
  const cls=`fx-${kind}`;el.classList.add(cls,'fighter--item-use');if(!this.reduced()&&card.animate)card.animate([{opacity:0,transform:'translate(-50%,18px) scale(.72) rotate(-8deg)'},{opacity:1,transform:'translate(-50%,-8px) scale(1.04) rotate(2deg)',offset:.42},{opacity:0,transform:'translate(calc(-50% + var(--item-shift)),-46px) scale(1.12) rotate(8deg)'}],{duration:860,fill:'forwards',easing:'cubic-bezier(.2,.8,.2,1)'});await wait(this.reduced()?40:590);card.remove();el.classList.remove(cls,'fighter--item-use');
 }
 delta(item,before,after){const kind=item.effect?.kind;if(kind==='heal')return `+${Math.max(0,Number(after?.hp||0)-Number(before?.hp||0))} PV`;if(kind==='shield')return `+${Math.max(0,Number(after?.shield||0)-Number(before?.shield||0))} DEF`;if(kind==='chakra')return 'CHAKRA RECUPERADO';if(kind==='damage')return 'DANO DIRETO';if(kind==='cleanse')return 'EFEITOS REMOVIDOS';if(kind==='status')return 'EFEITO APLICADO';return String(item.description||'ITEM USADO').slice(0,48);}
 playInventory({item}){if(!item)return;document.dispatchEvent(new CustomEvent('unison:toast',{detail:{image:item.image,title:item.name,text:'Item utilizado.'}}));}
}
