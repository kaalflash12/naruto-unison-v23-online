const rules=[
  [/rasengan|rasenshuriken|odama rasengan|rasenkyu/i,{family:'rasengan',signature:'spiral',motion:'lunge',glyph:'螺',asset:'spiral'}],
  [/chidori|raiton|lightning|kirin|raikiri|hell stab/i,{family:'lightning',signature:'arc',motion:'dash',glyph:'雷',asset:'lightning'}],
  [/katon|fire|flame|amaterasu|phoenix flower|goukakyuu|shakujou/i,{family:'fire',signature:'cone',motion:'cast',glyph:'火',asset:'fire'}],
  [/suiton|water|mist|shark|torrent|water dragon/i,{family:'water',signature:'wave',motion:'cast',glyph:'水',asset:'water'}],
  [/fuuton|fūton|wind|gale|vacuum|air bullet/i,{family:'wind',signature:'blades',motion:'cast',glyph:'風',asset:'wind'}],
  [/doton|earth|mud|stone|rock|earth flow/i,{family:'earth',signature:'shards',motion:'slam',glyph:'土',asset:'earth'}],
  [/mokuton|wood|tree world|deep forest/i,{family:'wood',signature:'roots',motion:'cast',glyph:'木',asset:'earth'}],
  [/hyouton|hyōton|ice|crystal ice/i,{family:'ice',signature:'crystals',motion:'cast',glyph:'氷',asset:'crystal'}],
  [/shoton|crystal/i,{family:'crystal',signature:'crystals',motion:'cast',glyph:'晶',asset:'crystal'}],
  [/youton|yōton|lava|boil|steam|futton|jokey boy/i,{family:'lava',signature:'molten',motion:'cast',glyph:'溶',asset:'fire'}],
  [/sand|suna|gaara|iron sand|gold dust/i,{family:'sand',signature:'swirl',motion:'cast',glyph:'砂',asset:'earth'}],
  [/magnet|jiton/i,{family:'magnet',signature:'rings',motion:'cast',glyph:'磁',asset:'seal'}],
  [/shadow|kagemane|nara/i,{family:'shadow',signature:'tether',motion:'focus',glyph:'影',asset:'shadow'}],
  [/medical|heal|chakra scalpel|mystical palm|regeneration/i,{family:'medical',signature:'pulse',motion:'focus',glyph:'医',asset:'chakra'}],
  [/sharingan|byakugan|rinnegan|dojutsu|dōjutsu|tenseigan/i,{family:'dojutsu',signature:'eye',motion:'focus',glyph:'眼',asset:'shadow'}],
  [/genjutsu|illusion|tsukuyomi|hypnosis/i,{family:'genjutsu',signature:'distort',motion:'focus',glyph:'幻',asset:'shadow'}],
  [/clone|bunshin|substitution|replacement/i,{family:'clone',signature:'smoke',motion:'split',glyph:'分',asset:'chakra'}],
  [/seal|fuuin|fūin|barrier|formula/i,{family:'seal',signature:'matrix',motion:'cast',glyph:'封',asset:'seal'}],
  [/explos|bomb|clay|paper bomb|detonat/i,{family:'explosive',signature:'burst',motion:'throw',glyph:'爆',asset:'fire'}],
  [/paper|origami|kami/i,{family:'paper',signature:'feathers',motion:'cast',glyph:'紙',asset:'wind'}],
  [/puppet|kugutsu|sasori/i,{family:'puppet',signature:'threads',motion:'control',glyph:'傀',asset:'shadow'}],
  [/insect|kikaichu|aburame|beetle|swarm/i,{family:'insect',signature:'swarm',motion:'cast',glyph:'虫',asset:'shadow'}],
  [/fang|beast|inuzuka|wolf|man beast/i,{family:'beast',signature:'rush',motion:'dash',glyph:'獣',asset:'impact'}],
  [/susanoo/i,{family:'susanoo',signature:'avatar',motion:'summon',glyph:'須',asset:'shadow'}],
  [/summon|toad|snake|slug|kuchiyose/i,{family:'summon',signature:'sealburst',motion:'summon',glyph:'召',asset:'seal'}],
  [/space.?time|teleport|kamui|flying raijin|hiraishin/i,{family:'space',signature:'rift',motion:'blink',glyph:'時',asset:'lightning'}],
  [/curse|jugo|mark|seal of heaven/i,{family:'curse',signature:'spikes',motion:'focus',glyph:'呪',asset:'shadow'}],
  [/poison|venom|toxin/i,{family:'poison',signature:'miasma',motion:'cast',glyph:'毒',asset:'chakra'}],
  [/ink|super beast|choju/i,{family:'ink',signature:'splash',motion:'draw',glyph:'墨',asset:'shadow'}],
  [/bone|kimimaro|shikotsu/i,{family:'bone',signature:'spines',motion:'lunge',glyph:'骨',asset:'impact'}],
  [/scorch|shakuton/i,{family:'scorch',signature:'halo',motion:'cast',glyph:'灼',asset:'fire'}],
  [/biju|bijū|tailed beast|bomb/i,{family:'bijuu',signature:'sphere',motion:'charge',glyph:'尾',asset:'bijuu'}],
  [/taijutsu|kick|punch|barrage|lotus|gate|dynamic entry/i,{family:'taijutsu',signature:'impact',motion:'combo',glyph:'体',asset:'impact'}],
  [/shuriken|kunai|sword|blade|weapon|senbon|needle/i,{family:'weapon',signature:'slash',motion:'throw',glyph:'刃',asset:'impact'}]
];
const defaults={family:'ninjutsu',signature:'chakra',motion:'cast',glyph:'術',asset:'chakra',castMs:420,travelMs:460,impactMs:520};
export class AnimationProfileRegistry{
  constructor({content}={}){this.content=content;this.explicit=new Map();}
  register(id,profile){this.explicit.set(id,Object.freeze({...defaults,...profile,id}));}
  resolve(technique){if(!technique)return decorate(defaults,'unknown');const hay=[technique.id,technique.name,technique.family,technique.lineageId,...(technique.tags||[])].join(' '),matched=rules.find(([rx])=>rx.test(hay))?.[1]||{};const family=matched.family||technique.family||defaults.family;const explicitId=technique.animationProfileId||`family:${family}`,explicit=this.content?.get('animation_profile',explicitId)||this.explicit.get(explicitId);const base={...defaults,...matched,...(explicit||{}),id:explicit?.id||`auto:${technique.id||'unknown'}`};base.asset=matched.asset||base.asset||'chakra';return decorate(base,technique.id||technique.name||'unknown');}
  coverage(techniques){const missing=[];for(const t of techniques||[]){const p=this.resolve(t);if(!p?.family||!p?.signature||!p?.motion||!p?.asset||!Number.isInteger(p.seed)||!Number.isFinite(p.hue))missing.push(t.id);}return{total:techniques?.length||0,missing,ok:!missing.length};}
}
function decorate(profile,key){const seed=Math.abs(hash(key)),hue=seed%360;return{...profile,seed,hue,accentHue:(hue+45+(seed%90))%360,variant:seed%6,particleCount:7+(seed%8),trailLength:4+(seed%5),assetUrl:`assets/fx-r38/${profile.asset||'chakra'}.svg`};}
function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h|0;}
