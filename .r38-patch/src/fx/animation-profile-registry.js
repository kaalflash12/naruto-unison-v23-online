const rules=[
  [/rasengan|rasenshuriken|odama rasengan|rasenkyu/i,{family:'rasengan',signature:'spiral',motion:'lunge',glyph:'螺',asset:'spiral'}],
  [/chidori|raiton|lightning|kirin|raikiri|hell stab|black panther|laser circus/i,{family:'lightning',signature:'arc',motion:'dash',glyph:'雷',asset:'lightning'}],
  [/katon|fire|flame|amaterasu|phoenix flower|goukakyuu|burning ash/i,{family:'fire',signature:'cone',motion:'cast',glyph:'火',asset:'fire'}],
  [/suiton|water|mist|shark|torrent|water dragon|hozuki/i,{family:'water',signature:'wave',motion:'cast',glyph:'水',asset:'water'}],
  [/fuuton|fūton|wind|gale|vacuum|air bullet/i,{family:'wind',signature:'blades',motion:'cast',glyph:'風',asset:'wind'}],
  [/doton|earth|mud|stone|rock|earth flow|ground pound|trench/i,{family:'earth',signature:'shards',motion:'slam',glyph:'土',asset:'earth'}],
  [/mokuton|wood|tree world|deep forest|tree wave|tree strangulation|sprigs|kannon/i,{family:'wood',signature:'roots',motion:'cast',glyph:'木',asset:'wood'}],
  [/hyouton|hyōton|ice|frost|crystal ice/i,{family:'ice',signature:'crystals',motion:'cast',glyph:'氷',asset:'crystal'}],
  [/shoton|crystal/i,{family:'crystal',signature:'crystals',motion:'cast',glyph:'晶',asset:'crystal'}],
  [/youton|yōton|lava|boil|steam|futton|jokey boy/i,{family:'lava',signature:'molten',motion:'cast',glyph:'溶',asset:'lava'}],
  [/sand|suna|gaara|iron sand|gold dust/i,{family:'sand',signature:'swirl',motion:'cast',glyph:'砂',asset:'sand'}],
  [/magnet|jiton/i,{family:'magnet',signature:'rings',motion:'cast',glyph:'磁',asset:'seal'}],
  [/shadow|kagemane|nara/i,{family:'shadow',signature:'tether',motion:'focus',glyph:'影',asset:'shadow'}],
  [/medical|heal|cura|chakra scalpel|mystical palm|regeneration/i,{family:'medical',signature:'pulse',motion:'focus',glyph:'医',asset:'medical'}],
  [/sharingan|byakugan|rinnegan|dojutsu|dōjutsu|tenseigan|izanagi|izanami|foresight|sensory|radar/i,{family:'dojutsu',signature:'eye',motion:'focus',glyph:'眼',asset:'mind'}],
  [/genjutsu|illusion|mirage|tsukuyomi|hypnosis|mind|mental|psychic|valentine/i,{family:'genjutsu',signature:'distort',motion:'focus',glyph:'幻',asset:'mind'}],
  [/clone|bunshin|substitution|substituição|replacement|poss[uú]m/i,{family:'clone',signature:'smoke',motion:'split',glyph:'分',asset:'clone'}],
  [/seal|fuuin|fūin|barrier|formula|jashin sigil|prison/i,{family:'seal',signature:'matrix',motion:'cast',glyph:'封',asset:'seal'}],
  [/explos|bomb|clay|paper bomb|detonat|missile|cannon|depth charge|megaton/i,{family:'explosive',signature:'burst',motion:'throw',glyph:'爆',asset:'impact'}],
  [/paper|origami|kami/i,{family:'paper',signature:'feathers',motion:'cast',glyph:'紙',asset:'paper'}],
  [/puppet|kugutsu|sasori|chakra strings|chakra weave/i,{family:'puppet',signature:'threads',motion:'control',glyph:'傀',asset:'shadow'}],
  [/insect|kikaichu|aburame|beetle|swarm|parasite/i,{family:'insect',signature:'swarm',motion:'cast',glyph:'虫',asset:'insect'}],
  [/fang|beast|inuzuka|wolf|man beast/i,{family:'beast',signature:'rush',motion:'dash',glyph:'獣',asset:'taijutsu'}],
  [/susanoo/i,{family:'susanoo',signature:'avatar',motion:'summon',glyph:'須',asset:'summon'}],
  [/summon|summoning|toad|snake|slug|kuchiyose|reanimation/i,{family:'summon',signature:'sealburst',motion:'summon',glyph:'召',asset:'summon'}],
  [/space.?time|spacetime|teleport|kamui|flying raijin|hiraishin|mobility/i,{family:'space',signature:'rift',motion:'blink',glyph:'時',asset:'space'}],
  [/curse|jugo|seal of heaven/i,{family:'curse',signature:'spikes',motion:'focus',glyph:'呪',asset:'shadow'}],
  [/poison|venom|toxin|attrition/i,{family:'poison',signature:'miasma',motion:'cast',glyph:'毒',asset:'poison'}],
  [/ink|super beast|choju/i,{family:'ink',signature:'splash',motion:'draw',glyph:'墨',asset:'ink'}],
  [/bone|kimimaro|shikotsu/i,{family:'bone',signature:'spines',motion:'lunge',glyph:'骨',asset:'bone'}],
  [/scorch|shakuton/i,{family:'scorch',signature:'halo',motion:'cast',glyph:'灼',asset:'fire'}],
  [/biju|bijū|tailed beast|kyuubi|tail manifestation|chakra arms/i,{family:'bijuu',signature:'sphere',motion:'charge',glyph:'尾',asset:'bijuu'}],
  [/gentle fist|punho gentil|eight trigrams|palm rotation|pressure point|hyuga/i,{family:'hyuga',signature:'rings',motion:'combo',glyph:'柔',asset:'taijutsu'}],
  [/sound|resonat|echo|sonic|frog song/i,{family:'sound',signature:'wave',motion:'cast',glyph:'音',asset:'sound'}],
  [/shinra tensei|chibaku tensei|universal pull|atração universal|gravity/i,{family:'gravity',signature:'rings',motion:'focus',glyph:'引',asset:'gravity'}],
  [/block|bloqueio|parry|aparar|dodge|esquiva|guard|defen|shield|wall|flak jacket|hide|transparency/i,{family:'guard',signature:'matrix',motion:'focus',glyph:'守',asset:'guard'}],
  [/expansion|human boulder|butterfly mode|lariat|slam|tackle|assault|strike|blow|palm|kick|punch|barrage|lotus|gate|dynamic entry|taijutsu/i,{family:'taijutsu',signature:'impact',motion:'combo',glyph:'体',asset:'taijutsu'}],
  [/shuriken|kunai|sword|blade|weapon|weapons|kenjutsu|senbon|needle|tant[oō]|kusanagi|sickle|mace|slash|chain shred|chain wrap|flying swallow/i,{family:'weapon',signature:'slash',motion:'throw',glyph:'刃',asset:'weapon'}],
  [/scientific|laser|mechanical|chakra receiver/i,{family:'science',signature:'arc',motion:'cast',glyph:'機',asset:'science'}],
  [/chakra absorption|chakra_absorption|spirit absorption|chakra devour|chakra link|chakra_link/i,{family:'chakra',signature:'pulse',motion:'focus',glyph:'気',asset:'chakra'}],
  [/transformation|sexy technique|partial expansion/i,{family:'transform',signature:'smoke',motion:'split',glyph:'変',asset:'clone'}]
];

const aliases={
  weapons:'weapon',kenjutsu:'weapon',summoning:'summon',sealing:'seal',spacetime:'space',control:'chakra',defense:'guard',impact:'taijutsu',hyuga:'hyuga',
  attrition:'poison',snake:'summon',mobility:'space',sensory:'dojutsu',akimichi:'taijutsu',yamanaka:'genjutsu',inuzuka:'beast',aburame:'insect',
  scientific:'science',reanimation:'summon',chakra_absorption:'chakra',chakra_link:'chakra',particle:'earth',parasite:'insect',transformation:'transform'
};
const assetByFamily={
  rasengan:'spiral',lightning:'lightning',fire:'fire',water:'water',wind:'wind',earth:'earth',wood:'wood',ice:'crystal',crystal:'crystal',lava:'lava',sand:'sand',magnet:'seal',
  shadow:'shadow',medical:'medical',dojutsu:'mind',genjutsu:'mind',clone:'clone',seal:'seal',explosive:'impact',paper:'paper',puppet:'shadow',insect:'insect',beast:'taijutsu',susanoo:'summon',
  summon:'summon',space:'space',curse:'shadow',poison:'poison',ink:'ink',bone:'bone',scorch:'fire',bijuu:'bijuu',taijutsu:'taijutsu',hyuga:'taijutsu',weapon:'weapon',guard:'guard',
  sound:'sound',gravity:'gravity',science:'science',chakra:'chakra',transform:'clone',ninjutsu:'chakra'
};
const signatureByFamily={guard:'matrix',sound:'wave',gravity:'rings',science:'arc',chakra:'pulse',transform:'smoke',hyuga:'rings'};
const motionByFamily={guard:'focus',sound:'cast',gravity:'focus',science:'cast',chakra:'focus',transform:'split',hyuga:'combo'};
const glyphByFamily={guard:'守',sound:'音',gravity:'引',science:'機',chakra:'気',transform:'変',hyuga:'柔',ninjutsu:'術'};
const defaults={family:'ninjutsu',signature:'chakra',motion:'cast',glyph:'術',asset:'chakra',castMs:420,travelMs:460,impactMs:520};

export class AnimationProfileRegistry{
  constructor({content}={}){this.content=content;this.explicit=new Map();}
  register(id,profile){this.explicit.set(id,Object.freeze({...defaults,...profile,id}));}
  resolve(technique){
    if(!technique)return decorate({...defaults,visualMode:'aura',trajectory:'none',impactCount:1},'unknown');
    const hay=[technique.id,technique.name,technique.family,technique.lineageId,technique.description,...(technique.classification||[]),...(technique.tags||[])].join(' ');
    const matched=rules.find(([rx])=>rx.test(hay))?.[1]||{};
    const rawFamily=matched.family||technique.family||defaults.family;
    const family=aliases[rawFamily]||rawFamily||defaults.family;
    const explicitId=technique.animationProfileId||`family:${family}`;
    const explicit=this.content?.get?.('animation_profile',explicitId)||this.explicit.get(explicitId);
    const base={...defaults,...matched,...(explicit||{})};
    base.family=aliases[base.family]||family;
    base.asset=matched.asset||base.asset||assetByFamily[base.family]||'chakra';
    base.signature=matched.signature||base.signature||signatureByFamily[base.family]||'chakra';
    base.motion=matched.motion||base.motion||motionByFamily[base.family]||'cast';
    base.glyph=matched.glyph||base.glyph||glyphByFamily[base.family]||'術';
    base.id=explicit?.id||`auto:${technique.id||'unknown'}`;
    Object.assign(base,inferChoreography(technique,base));
    return decorate(base,technique.id||technique.name||'unknown');
  }
  coverage(techniques){
    const missing=[];
    for(const t of techniques||[]){
      const p=this.resolve(t);
      if(!p?.family||!p?.signature||!p?.motion||!p?.asset||!p?.visualMode||!p?.trajectory||!Number.isInteger(p.seed)||!Number.isFinite(p.hue))missing.push(t.id);
    }
    return{total:techniques?.length||0,missing,ok:!missing.length};
  }
}

function inferChoreography(t,p){
  const mechanics=Array.isArray(t.mechanics)?t.mechanics:[];
  const ops=new Set(mechanics.map(m=>m.op));
  const target=String(t.target||'enemy');
  const text=[t.name,t.family,t.description,...(t.tags||[])].join(' ').toLowerCase();
  const multi=mechanics.find(m=>m.op==='multi-hit');
  const impactCount=Math.max(1,Math.min(8,Number(multi?.hits||1)));
  const support=ops.has('heal')||ops.has('cleanse')||ops.has('chakra-gain')||p.family==='medical';
  const defensive=ops.has('shield')||target==='self'&&([...ops].every(op=>['buff','shield','cleanse','chakra-gain','status','mark'].includes(op)))||p.family==='guard';
  const mind=['genjutsu','dojutsu'].includes(p.family)||/mind|mental|psychic|illusion|sensory|radar|foresight/.test(text);
  const summon=['summon','susanoo','clone','transform'].includes(p.family);
  const blink=p.family==='space';
  const melee=['taijutsu','hyuga','beast'].includes(p.family)||(/strike|assault|lariat|slam|tackle|punch|kick|palm|barrage/.test(text)&&!ops.has('chakra-drain'));
  const thrown=p.family==='weapon'&&/shuriken|kunai|senbon|needle|throw|flying/.test(text);
  const area=target.startsWith('all-');
  let visualMode='projectile';
  if(blink)visualMode='blink';
  else if(summon)visualMode='summon';
  else if(mind)visualMode='mind';
  else if(support)visualMode='support';
  else if(defensive)visualMode='aura';
  else if(area)visualMode='area';
  else if(melee)visualMode='melee';
  else if(thrown)visualMode='projectile';
  else if(target==='self'||target==='ally'||target==='all-allies')visualMode='aura';
  let trajectory='direct';
  if(['aura','support','mind','summon'].includes(visualMode))trajectory='none';
  else if(visualMode==='blink')trajectory='blink';
  else if(visualMode==='melee')trajectory='dash';
  else if(visualMode==='area')trajectory=['earth','sand','wood'].includes(p.family)?'ground':'wave';
  else if(['explosive','weapon'].includes(p.family))trajectory='arc';
  const resultTone=ops.has('heal')?'heal':ops.has('shield')?'shield':ops.has('debuff')?'debuff':ops.has('buff')?'buff':ops.has('chakra-drain')?'drain':ops.has('status')?'status':'damage';
  return{visualMode,trajectory,impactCount,resultTone,area,targeting:target,hasTravel:['projectile','melee','blink','area'].includes(visualMode)};
}

function decorate(profile,key){
  const seed=Math.abs(hash(key)),hue=seed%360;
  return{
    ...profile,seed,hue,accentHue:(hue+45+(seed%90))%360,variant:seed%12,particleCount:8+(seed%10),trailLength:5+(seed%7),
    angle:(seed%121)-60,spin:180+(seed%540),scale:0.9+((seed%31)/100),jitter:2+(seed%8),
    assetUrl:`assets/fx-r382/${profile.asset||'chakra'}.svg`,profileKey:`${profile.family}:${profile.visualMode}:${seed}`
  };
}
function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h|0;}
