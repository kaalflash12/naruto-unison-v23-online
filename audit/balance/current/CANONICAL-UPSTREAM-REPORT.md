# Auditoria canônica automatizada — roster inteiro

Gerado em: 2026-08-26T06:22:39.324Z

Upstream fixado: `3f81bcd0de1795c17ce1f8e8d9f9fa51b38af0e1`.

## Cobertura

- Personagens atuais: **209**
- Jutsus atuais: **836**
- Personagens canônicos parseados: **182** em **24** arquivos Haskell.
- Personagens vinculados ao upstream: **182/209**.
- Jutsus vinculados: **726/836**.

## Severidade

- CRITICAL: **449**
- HIGH: **161**
- MEDIUM: **67**
- OK: **49**
- UNRESOLVED: **110**

## Flags

- ADVANCED_MECHANIC: **476**
- KIND_MISMATCH: **382**
- DYNAMIC_MECHANIC: **328**
- COST_MISMATCH: **173**
- TARGET_MISMATCH: **173**
- CHARACTER_NOT_FOUND: **108**
- COMPOUND_MECHANIC: **91**
- JUTSU_NOT_FOUND: **2**

## Recursos avançados encontrados no upstream

- channel: **117** jutsus vinculados
- trap: **112** jutsus vinculados
- alternate: **92** jutsus vinculados
- stack: **92** jutsus vinculados
- reduce: **67** jutsus vinculados
- requirement: **62** jutsus vinculados
- dynamic_change: **56** jutsus vinculados
- weaken: **33** jutsus vinculados
- counter: **33** jutsus vinculados
- expose: **32** jutsus vinculados
- bomb: **19** jutsus vinculados
- alone: **16** jutsus vinculados
- enrage: **15** jutsus vinculados
- charges: **15** jutsus vinculados
- strengthen: **15** jutsus vinculados
- cure: **14** jutsus vinculados
- exhaust: **14** jutsus vinculados
- focus: **13** jutsus vinculados
- absorb: **13** jutsus vinculados
- deplete: **12** jutsus vinculados
- leech: **12** jutsus vinculados
- demolish: **11** jutsus vinculados
- snare: **10** jutsus vinculados
- taunt: **8** jutsus vinculados
- reflect: **6** jutsus vinculados
- endure: **6** jutsus vinculados
- throttle: **5** jutsus vinculados
- purge: **3** jutsus vinculados
- execute: **3** jutsus vinculados
- redirect: **3** jutsus vinculados
- interrupt: **2** jutsus vinculados
- silence: **2** jutsus vinculados

## Primeiros casos críticos

| Personagem | Jutsu | Atual | Canônico | Flags |
|---|---|---|---|---|
| Naruto Uzumaki | Naruto Uzumaki Barrage | damage / enemy | utility / enemy | KIND_MISMATCH |
| Naruto Uzumaki | Shadow Clones | shield / self | utility / self | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC |
| Naruto Uzumaki | Sexy Technique | invuln / self | utility / unknown | KIND_MISMATCH |
| Sasuke Uchiha | Lions Barrage | damage / enemy | utility / enemy | KIND_MISMATCH |
| Sasuke Uchiha | Chidori | damage / enemy | utility / enemy | KIND_MISMATCH |
| Sasuke Uchiha | Sharingan | invuln / self | utility / enemy | COST_MISMATCH, TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC |
| Sasuke Uchiha | Block | invuln / self | utility / unknown | KIND_MISMATCH |
| Sakura Haruno | Inner Sakura | shield / self | utility / self | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC |
| Sakura Haruno | Substitution Technique | invuln / self | utility / unknown | KIND_MISMATCH |
| Kakashi Hatake | Sharingan | damage / enemy | utility / self | TARGET_MISMATCH, KIND_MISMATCH |
| Kakashi Hatake | Hide | invuln / self | utility / unknown | KIND_MISMATCH |
| Rock Lee | Ferocious Fist | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Rock Lee | Primary Lotus | damage / enemy | utility / enemy | KIND_MISMATCH |
| Neji Hyūga | Eight Trigrams Palm Rotation | damage / enemy | compound:damage+invuln / self | TARGET_MISMATCH, COMPOUND_MECHANIC |
| Neji Hyūga | Byakugan Foresight | invuln / self | utility / unknown | KIND_MISMATCH |
| Hinata Hyūga | Eight Trigrams Sixty-Four Palms | shield / self | shield / ally | TARGET_MISMATCH |
| Hinata Hyūga | Byakugan | shield / self | utility / self | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC |
| Hinata Hyūga | Block | invuln / self | utility / unknown | KIND_MISMATCH |
| Gaara | Sand Coffin | invuln / self | stun / enemy | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Gaara | Sand Burial | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Gaara | Sand Clone | damage / enemy | utility / self | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Gaara | Sand Armor | damage / self | shield / self | COST_MISMATCH, KIND_MISMATCH |
| Shikamaru Nara | Meditate | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Shikamaru Nara | Hide | invuln / self | utility / unknown | KIND_MISMATCH |
| Itachi Uchiha | Susanoo | damage / enemy | shield / self | COST_MISMATCH, TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Itachi Uchiha | Amaterasu | dot / enemy | utility / enemy | COST_MISMATCH, KIND_MISMATCH |
| Jiraiya | Giant Flame Bomb | damage / enemy | dot_or_affliction / enemy | KIND_MISMATCH |
| Jiraiya | Summoning: Toad Mouth Trap | invuln / self | invuln / ally | TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Jiraiya | Major Summoning: Gamabunta | dot / enemy | dot_or_affliction / self | TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Jiraiya | Toad Oil Bomb | dot / enemy | utility / unknown | KIND_MISMATCH |
| Tsunade | Mitotic Regeneration | damage / enemy | utility / self | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC |
| A | Piercing Four-Fingered | stun / enemy | utility / ally | COST_MISMATCH, TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| A | Three-Fingered Assault | damage / enemy | utility / self | COST_MISMATCH, TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| A | Lightning Armor | damage / enemy | utility / self | TARGET_MISMATCH, KIND_MISMATCH |
| Akatsuchi | Stone Golem | damage / enemy | damage / self | TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Akatsuchi | Dodge | invuln / self | utility / unknown | KIND_MISMATCH |
| Ameyuri Ringo | Lightning Fang | invuln / self | utility / unknown | KIND_MISMATCH |
| Ameyuri Ringo | Thunder Gate | damage / enemy | utility / enemy | KIND_MISMATCH |
| Ameyuri Ringo | Parry | invuln / self | utility / unknown | KIND_MISMATCH |
| Animal Path Pain | Summoning: Giant Crustacean | invuln / self | compound:damage+invuln / ally | COST_MISMATCH, TARGET_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Animal Path Pain | Summoning: Giant Panda | invuln / self | compound:shield+invuln / ally | TARGET_MISMATCH, COMPOUND_MECHANIC |
| Animal Path Pain | Summoning: Giant Multi-Headed Dog | damage / enemy | utility / ally | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Anko Mitarashi | Dual Pin | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC |
| Anko Mitarashi | Dragon Flame | dot / enemy | utility / unknown | KIND_MISMATCH |
| Anko Mitarashi | Twin Snake Sacrifice | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Anko Mitarashi | Striking Shadow Snakes | dot / enemy | damage / enemy | KIND_MISMATCH |
| Ao | Byakugan | shield / self | damage / self | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Ao | Barrier Talisman | damage / enemy | utility / self | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Ao | Block | invuln / self | utility / unknown | KIND_MISMATCH |
| Aoba Yamashiro | Revenge of the Murder | invuln / self | invuln / ally | COST_MISMATCH, TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Aoba Yamashiro | Converging Murder | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Aoba Yamashiro | Crow Barrier | invuln / self | utility / unknown | KIND_MISMATCH |
| Asuma Sarutobi | Flying Swallow | damage / enemy | damage / ally | TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Asuma Sarutobi | Sharpen Blades | damage / enemy | utility / self | COST_MISMATCH, TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Asuma Sarutobi | Thousand Hand Strike | shield / self | compound:damage+shield / enemy | TARGET_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Asuma Sarutobi | Burning Ash | damage / enemy | utility / self | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Asuma Sarutobi | Burning Ash: Ignite | dot / enemy | utility / self | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Asura Path Pain | Metal Blade | dot / enemy | damage / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Asura Path Pain | Head Cannon | damage / enemy | damage / self | COST_MISMATCH, TARGET_MISMATCH |
| Asura Path Pain | Guided Missile | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Atsui | Burning Blade | shield / self | dot_or_affliction / self | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Atsui | Fire Wall | damage / enemy | dot_or_affliction / unknown | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Atsui | Flame Slice | dot / enemy | utility / enemy | KIND_MISMATCH |
| Atsui | Parry | invuln / self | utility / unknown | KIND_MISMATCH |
| Baki | Flak Jacket | shield / self | shield / ally | COST_MISMATCH, TARGET_MISMATCH, ADVANCED_MECHANIC |
| Baki | Teleport | invuln / self | utility / unknown | KIND_MISMATCH |
| C | Parry | invuln / self | utility / unknown | KIND_MISMATCH |
| Chiyo | Puppet Distraction | invuln / self | utility / unknown | KIND_MISMATCH |
| Chiyo | Ten Puppets Collection | shield / self | compound:damage+shield / enemy | COST_MISMATCH, TARGET_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Chiyo | Lion Roar Sealing | invuln / self | utility / enemy | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC |
| Chōji Akimichi | Spinach Pill | shield / self | utility / ally | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Chōji Akimichi | Butterfly Bombing | damage / enemy | damage / self | TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Chōji Akimichi | Butterfly Mode | damage / enemy | utility / self | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Chōjūrō | Hiramekarei Twinswords | damage / enemy | damage / self | TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Chōjūrō | Dodge  | invuln / self | utility / unknown | KIND_MISMATCH |
| Chōza Akimichi | Block | invuln / self | utility / unknown | KIND_MISMATCH |
| Chūkichi | Psychic Jamming | damage / enemy | utility / unknown | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Chūkichi | Silent Killing | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Chūkichi | Hide | invuln / self | utility / unknown | KIND_MISMATCH |
| Curse Mark Jūgo | Cellular Absorption | damage / enemy | heal_or_leech / enemy | KIND_MISMATCH, ADVANCED_MECHANIC |
| Curse Mark Jūgo | Block | invuln / self | utility / unknown | KIND_MISMATCH |
| Curse Mark Sasuke | Dark Void | invuln / self | compound:damage+stun+invuln / enemy | TARGET_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Curse Mark Sasuke | Sharingan Foresight | invuln / self | utility / unknown | KIND_MISMATCH |
| Danzō Shimura | Izanagi | invuln / self | utility / self | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Danzō Shimura | Izanagi | damage / enemy | utility / self | COST_MISMATCH, TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Danzō Shimura | Reverse Tetragram Sealing | invuln / self | utility / self | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Darui | Black Panther | damage / enemy | utility / enemy | KIND_MISMATCH |
| Darui | Block | invuln / self | utility / unknown | KIND_MISMATCH |
| Deidara | Detonating Clay | damage / enemy | invuln / enemy | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Deidara | Sonar Bat Bombs | dot / enemy | dot_or_affliction / self | TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Deidara | C3: Megaton Sculpture | damage / enemy | damage / self | TARGET_MISMATCH, ADVANCED_MECHANIC |
| Demon Brothers | Chain Shred | stun / enemy | damage / enemy | KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Demon Brothers | Poison Gauntlet | dot / enemy | utility / enemy | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Deva Path Pain | Almighty Push | damage / enemy | damage / ally | TARGET_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Deva Path Pain | Planetary Devastation | stun / enemy | invuln / enemy | COST_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC |
| Dodai | Rubber Wall | stun / enemy | utility / ally | TARGET_MISMATCH, KIND_MISMATCH, ADVANCED_MECHANIC |
| Dodai | Dodge | invuln / self | utility / unknown | KIND_MISMATCH |
| Dosu Kinuta | Resonating Echo Drill | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC |
| Dosu Kinuta | Sound Manipulation | damage / enemy | utility / enemy | KIND_MISMATCH, ADVANCED_MECHANIC |
| Dosu Kinuta | Echo Speaker Tuning | damage / enemy | utility / self | COST_MISMATCH, TARGET_MISMATCH, KIND_MISMATCH |

## Não resolvidos pelo parser

| Personagem | Jutsu | Flags |
|---|---|---|
| Sasori Antigo | Puppet Techniques | CHARACTER_NOT_FOUND |
| Sasori Antigo | Puppet Specialties | CHARACTER_NOT_FOUND |
| Sasori Antigo | Puppet Mastery | CHARACTER_NOT_FOUND |
| Sasori Antigo | Body Switch | CHARACTER_NOT_FOUND |
| Corrupted Obito | Hide | CHARACTER_NOT_FOUND |
| Corrupted Obito | Murderous Resolve | CHARACTER_NOT_FOUND |
| Corrupted Obito | Cutting Sprigs | CHARACTER_NOT_FOUND |
| Corrupted Obito | Mangekyo Sharingan | CHARACTER_NOT_FOUND |
| Curse Mark Sasuke (shippuden) | Snake Shedding | CHARACTER_NOT_FOUND |
| Curse Mark Sasuke (shippuden) | Sharingan Genjutsu | CHARACTER_NOT_FOUND |
| Curse Mark Sasuke (shippuden) | Sharingan | CHARACTER_NOT_FOUND |
| Curse Mark Sasuke (shippuden) | Chidori | CHARACTER_NOT_FOUND |
| Four Tailed Naruto (shippuden) | Tailed Beast Bomb | CHARACTER_NOT_FOUND |
| Four Tailed Naruto (shippuden) | Chakra Slam | CHARACTER_NOT_FOUND |
| Four Tailed Naruto (shippuden) | Kyuubi Skin Block | CHARACTER_NOT_FOUND |
| Four Tailed Naruto (shippuden) | Fourth Tail Manifestation | CHARACTER_NOT_FOUND |
| Gaara Of The Funk | Couldve Hada V8 | JUTSU_NOT_FOUND |
| Gaara Of The Funk | Nchk Nchk Nchk Nchk | JUTSU_NOT_FOUND |
| Hiruko Sasori (shippuden) | Defensive Puppeteering | CHARACTER_NOT_FOUND |
| Hiruko Sasori (shippuden) | Scorpion Tail Constriction | CHARACTER_NOT_FOUND |
| Hiruko Sasori (shippuden) | Tail Block | CHARACTER_NOT_FOUND |
| Hiruko Sasori (shippuden) | Scorpion Tail Strike | CHARACTER_NOT_FOUND |
| Hoshigaki Kisame Body Double (shippuden) | Triple Water Prison | CHARACTER_NOT_FOUND |
| Hoshigaki Kisame Body Double (shippuden) | 5 Man Eating Sharks | CHARACTER_NOT_FOUND |
| Hoshigaki Kisame Body Double (shippuden) | Water Waterfall Wave | CHARACTER_NOT_FOUND |
| Hoshigaki Kisame Body Double (shippuden) | Kisame Water Clone | CHARACTER_NOT_FOUND |
| Itachi Uchiha (reanimado) | Phoenix Flower | CHARACTER_NOT_FOUND |
| Itachi Uchiha (reanimado) | Izanami | CHARACTER_NOT_FOUND |
| Itachi Uchiha (reanimado) | Susanoo | CHARACTER_NOT_FOUND |
| Itachi Uchiha (reanimado) | Block | CHARACTER_NOT_FOUND |
| Uchiha Itachi Body Double (shippuden) | Genjutsu Reversal | CHARACTER_NOT_FOUND |
| Uchiha Itachi Body Double (shippuden) | Itachi Fireball Technique | CHARACTER_NOT_FOUND |
| Uchiha Itachi Body Double (shippuden) | Finger Genjutsu | CHARACTER_NOT_FOUND |
| Uchiha Itachi Body Double (shippuden) | Illusionary Crows | CHARACTER_NOT_FOUND |
| Zaji | Kunai Block | CHARACTER_NOT_FOUND |
| Zaji | Exploding Chakra Kunai | CHARACTER_NOT_FOUND |
| Zaji | Chakra Sense | CHARACTER_NOT_FOUND |
| Zaji | Momemtum Reversal | CHARACTER_NOT_FOUND |
| Boruto Uzumaki | Boruto Sutoraiku | CHARACTER_NOT_FOUND |
| Boruto Uzumaki | Kage Bunshin no Jutsu | CHARACTER_NOT_FOUND |
| Boruto Uzumaki | Fūton: Reppūshō | CHARACTER_NOT_FOUND |
| Boruto Uzumaki | Kieru Rasengan | CHARACTER_NOT_FOUND |
| Sarada Uchiha | Katon: Gōkakyū no Jutsu | CHARACTER_NOT_FOUND |
| Sarada Uchiha | Sharingan | CHARACTER_NOT_FOUND |
| Sarada Uchiha | Ōkashō | CHARACTER_NOT_FOUND |
| Sarada Uchiha | Shurikenjutsu: Uchiha | CHARACTER_NOT_FOUND |
| Mitsuki | Senei Jashu | CHARACTER_NOT_FOUND |
| Mitsuki | Raiton: Hebi Mikazuchi | CHARACTER_NOT_FOUND |
| Mitsuki | Fūton: Toppa | CHARACTER_NOT_FOUND |
| Mitsuki | Senjutsu | CHARACTER_NOT_FOUND |
| Kawaki | Kāma | CHARACTER_NOT_FOUND |
| Kawaki | Kāma: Hōsha | CHARACTER_NOT_FOUND |
| Kawaki | Kagaku Ningu: Henshitsu | CHARACTER_NOT_FOUND |
| Kawaki | Kāma: Kyūshū | CHARACTER_NOT_FOUND |
| Naruto Uzumaki — Hokage | Chō Ōdama Rasengan | CHARACTER_NOT_FOUND |
| Naruto Uzumaki — Hokage | Tajū Kage Bunshin no Jutsu | CHARACTER_NOT_FOUND |
| Naruto Uzumaki — Hokage | Fūton: Rasenshuriken | CHARACTER_NOT_FOUND |
| Naruto Uzumaki — Hokage | Kurama Chakra Mōdo | CHARACTER_NOT_FOUND |
| Sasuke Uchiha — Adulto | Chidori | CHARACTER_NOT_FOUND |
| Sasuke Uchiha — Adulto | Amenotejikara | CHARACTER_NOT_FOUND |
| Sasuke Uchiha — Adulto | Enton: Kagutsuchi | CHARACTER_NOT_FOUND |
| Sasuke Uchiha — Adulto | Susanoo | CHARACTER_NOT_FOUND |
| Sakura Haruno — Adulta | Ōkashō | CHARACTER_NOT_FOUND |
| Sakura Haruno — Adulta | Shōsen Jutsu | CHARACTER_NOT_FOUND |
| Sakura Haruno — Adulta | Byakugō no Jutsu | CHARACTER_NOT_FOUND |
| Sakura Haruno — Adulta | Katsuyu: Mōryōjika | CHARACTER_NOT_FOUND |
| Kakashi Hatake — Sexto Hokage | Shiden | CHARACTER_NOT_FOUND |
| Kakashi Hatake — Sexto Hokage | Raiton: Raijū Tsuiga | CHARACTER_NOT_FOUND |
| Kakashi Hatake — Sexto Hokage | Doton: Doryūheki | CHARACTER_NOT_FOUND |
| Kakashi Hatake — Sexto Hokage | Kage Bunshin no Jutsu | CHARACTER_NOT_FOUND |
| Momoshiki Ōtsutsuki | Takamimusubinokami | CHARACTER_NOT_FOUND |
| Momoshiki Ōtsutsuki | Inukaitakerunomikoto | CHARACTER_NOT_FOUND |
| Momoshiki Ōtsutsuki | Rinnegan: Kyūshū | CHARACTER_NOT_FOUND |
| Momoshiki Ōtsutsuki | Chakra Edan | CHARACTER_NOT_FOUND |
| Isshiki Ōtsutsuki | Sukunahikona | CHARACTER_NOT_FOUND |
| Isshiki Ōtsutsuki | Daikokuten | CHARACTER_NOT_FOUND |
| Isshiki Ōtsutsuki | Kokuyō no Bō | CHARACTER_NOT_FOUND |
| Isshiki Ōtsutsuki | Jikūkan Idō | CHARACTER_NOT_FOUND |
| Jigen | Kāma | CHARACTER_NOT_FOUND |
| Jigen | Kokuyō no Bō | CHARACTER_NOT_FOUND |
| Jigen | Jikūkan Ninjutsu | CHARACTER_NOT_FOUND |
| Jigen | Daikokuten | CHARACTER_NOT_FOUND |
| Konohamaru Sarutobi — Sensei | Rasengan | CHARACTER_NOT_FOUND |
| Konohamaru Sarutobi — Sensei | Kage Bunshin no Jutsu | CHARACTER_NOT_FOUND |
| Konohamaru Sarutobi — Sensei | Katon: Gōkakyū no Jutsu | CHARACTER_NOT_FOUND |
| Konohamaru Sarutobi — Sensei | Shuriken Kage Bunshin no Jutsu | CHARACTER_NOT_FOUND |
| Shukaku | Fūton: Renkūdan | CHARACTER_NOT_FOUND |
| Shukaku | Braço Monstruoso de Areia | CHARACTER_NOT_FOUND |
| Shukaku | Defesa de Shukaku | CHARACTER_NOT_FOUND |
| Shukaku | Liberação Total de Shukaku | CHARACTER_NOT_FOUND |
| Matatabi | Garras da Matatabi | CHARACTER_NOT_FOUND |
| Matatabi | Rugido Flamejante | CHARACTER_NOT_FOUND |
| Matatabi | Manto de Duas Caudas | CHARACTER_NOT_FOUND |
| Matatabi | Investida da Matatabi | CHARACTER_NOT_FOUND |
| Gyūki | Bijūdama | CHARACTER_NOT_FOUND |
| Gyūki | Ossos de Chakra | CHARACTER_NOT_FOUND |
| Gyūki | Lariat | CHARACTER_NOT_FOUND |
| Gyūki | Barreira de Chakra | CHARACTER_NOT_FOUND |
| Kurama | Bijūdama | CHARACTER_NOT_FOUND |
| Kurama | Bijūdama Massiva | CHARACTER_NOT_FOUND |

## Interpretação correta

Este relatório é uma triagem estrutural, não um patch automático. Um `KIND_MISMATCH` ou `TARGET_MISMATCH` é prioridade de revisão. `ADVANCED_MECHANIC`/`DYNAMIC_MECHANIC` significa que o upstream possui lógica que não cabe necessariamente nos seis tipos simples atuais. Antes de alterar um personagem, conferir o bloco canônico, o simulador, o runtime local e o backend autoritativo.
