import { resolveTechniqueMechanics, tickStatuses } from './mechanics-engine.ts';
export type Side='a'|'b';
export type Chakra={NIN:number,TAI:number,GEN:number,KEK:number};
export type Fighter={characterId:string,name:string,hp:number,maxHp:number,shield:number,statuses:any[],cooldowns:Record<string,number>,skills:any[],stats:Record<string,number>};
export type RankedState={turn:number,players:{a:string,b:string},teams:{a:Fighter[],b:Fighter[]},chakra:{a:Chakra,b:Chakra},events:any[],resolvedSubmissions:Record<string,any>};
export function normalizeTeamIds(team:any){return (Array.isArray(team)?team:[]).map((x:any)=>String(typeof x==='string'?x:x?.characterId||x?.id||'')).filter(Boolean).slice(0,3);}
export function normalizeActions(actions:any){return(Array.isArray(actions)?actions:[]).map((x:any)=>({actorIndex:Number(x.actorIndex),targetIndex:Number(x.targetIndex),techniqueId:String(x.techniqueId||'')})).filter((x:any)=>Number.isInteger(x.actorIndex)&&Number.isInteger(x.targetIndex)&&x.techniqueId);}
export function baseChakra():Chakra{return{NIN:2,TAI:2,GEN:2,KEK:2};}
export function validateActions(state:RankedState,side:Side,actions:any[]){
 if(!Array.isArray(actions)||actions.length>3)throw Object.assign(new Error('Máximo de 3 ações por turno.'),{status:400});
 const used=new Set<number>(),enemy:Side=side==='a'?'b':'a';
 for(const a of actions){
  if(!Number.isInteger(a.actorIndex)||!Number.isInteger(a.targetIndex))throw Object.assign(new Error('Índice de ator/alvo inválido.'),{status:400});
  if(used.has(a.actorIndex))throw Object.assign(new Error('Cada ninja pode agir apenas uma vez por turno.'),{status:400});used.add(a.actorIndex);
  const actor=state.teams[side]?.[a.actorIndex];if(!actor||actor.hp<=0)throw Object.assign(new Error('Ator inválido.'),{status:400});
  const skill=actor.skills.find((s:any)=>s.id===a.techniqueId);if(!skill)throw Object.assign(new Error(`Técnica fora do loadout: ${a.techniqueId}`),{status:400});
  if((actor.cooldowns[a.techniqueId]||0)>0)throw Object.assign(new Error(`Técnica em recarga: ${skill.name}`),{status:409});
  const allyTarget=state.teams[side]?.[a.targetIndex],enemyTarget=state.teams[enemy]?.[a.targetIndex];
  if(skill.target==='enemy'&&(!enemyTarget||enemyTarget.hp<=0))throw Object.assign(new Error('Alvo inimigo inválido.'),{status:400});
  if(skill.target==='ally'&&(!allyTarget||allyTarget.hp<=0))throw Object.assign(new Error('Alvo aliado inválido.'),{status:400});
  if(skill.target==='self'&&a.targetIndex!==a.actorIndex)throw Object.assign(new Error('Técnica de uso próprio exige o próprio ninja como alvo.'),{status:400});
  if(skill.target==='all-enemies'&&!state.teams[enemy].some(x=>x.hp>0))throw Object.assign(new Error('Não há inimigos válidos.'),{status:400});
  if(skill.target==='all-allies'&&!state.teams[side].some(x=>x.hp>0))throw Object.assign(new Error('Não há aliados válidos.'),{status:400});
 }
}
export function resolveAuthoritativeTurn(state:RankedState,sub:{a:any[],b:any[]},matchId:string,turn:number){
 const events:any[]=[];const first:Side=hash(`${matchId}:${turn}`)%2===0?'a':'b';const order:Side[]=first==='a'?['a','b']:['b','a'];
 for(const side of order){for(const action of sub[side]||[]){if(allDead(state.teams[side]))break;const ev=applyAuthoritativeTechniqueAction(state,side,action);if(ev)events.push(ev);if(allDead(state.teams[side==='a'?'b':'a']))break;}}
 tickAuthoritativeState(state);state.events.push(...events.map(e=>({...e,turn})));let winnerSide:Side|null=null;if(allDead(state.teams.a)&&!allDead(state.teams.b))winnerSide='b';else if(allDead(state.teams.b)&&!allDead(state.teams.a))winnerSide='a';else state.turn=turn+1;return{turn,firstSide:first,events,winnerSide,nextTurn:winnerSide?null:turn+1};
}
export function applyAuthoritativeTechniqueAction(state:RankedState,side:Side,a:any){const actor=state.teams[side][a.actorIndex];if(!actor||actor.hp<=0)return null;const skill=actor.skills.find((s:any)=>s.id===a.techniqueId);if(!skill)return null;if((actor.cooldowns[skill.id]||0)>0)return null;if(actor.statuses?.some((x:any)=>['stun','sleep','bind','freeze'].includes(x.type)&&x.turns>0))return{type:'SKIPPED_STATUS',side,actor:a.actorIndex,techniqueId:skill.id};if(actor.statuses?.some((x:any)=>['silence','chakra-lock'].includes(x.type)&&x.turns>0)&&!(skill.classification||[]).includes('taijutsu'))return{type:'SKIPPED_CHAKRA_LOCK',side,actor:a.actorIndex,techniqueId:skill.id};if(!spendChakra(state.chakra[side],skill.chakraCost||[]))return{type:'SKIPPED_NO_CHAKRA',side,actor:a.actorIndex,techniqueId:skill.id};const resolved=resolveTechniqueMechanics(state,side,a.actorIndex,skill,a.targetIndex);actor.cooldowns[skill.id]=Math.max(0,Number(skill.cooldown||0));const enemy:Side=side==='a'?'b':'a';const targetSide:Side=(skill.target==='enemy'||skill.target==='all-enemies')?enemy:side;return{type:'TECHNIQUE',side,actor:a.actorIndex,targetSide,targetIndex:a.targetIndex,techniqueId:skill.id,name:skill.name,changes:resolved.changes,mechanics:resolved.mechanics,metrics:resolved.metrics};}
function spendChakra(pool:Chakra,cost:string[]){const p={...pool};for(const raw of cost){const c=String(raw).toUpperCase();if(c==='Q'||c==='ANY'||c==='QUALQUER'){const k=(['NIN','TAI','GEN','KEK'] as const).sort((a,b)=>p[b]-p[a]).find(x=>p[x]>0);if(!k)return false;p[k]--;continue;}if(!(c in p)||p[c as keyof Chakra]<=0)return false;p[c as keyof Chakra]--;}Object.assign(pool,p);return true;}
export function tickAuthoritativeState(state:RankedState){for(const side of ['a','b'] as Side[]){for(const f of state.teams[side]){for(const k of Object.keys(f.cooldowns))f.cooldowns[k]=Math.max(0,f.cooldowns[k]-1);for(const ev of tickStatuses(f))state.events.push({...ev,side,turn:state.turn});}const pool=state.chakra[side],keys=(['NIN','TAI','GEN','KEK'] as const),k=keys[(state.turn-1)%keys.length];pool[k]=Math.min(9,pool[k]+1);}}
export function allDead(team:Fighter[]){return !team.some(x=>x.hp>0);}
function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
