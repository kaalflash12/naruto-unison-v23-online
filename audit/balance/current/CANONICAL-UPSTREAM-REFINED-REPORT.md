# Auditoria canônica refinada

Gerado em: 2026-08-26T06:24:30.538Z

Esta camada reduz falsos positivos do parser Haskell. Um mismatch de tipo só é confirmado quando a descrição/helper canônico fornece evidência forte.

## Cobertura

- Jutsus atuais: **836**
- Jutsus vinculados ao upstream: **726**
- Não resolvidos: **110**

## Severidade refinada

- CRITICAL: **202**
- HIGH: **341**
- MEDIUM: **16**
- OK: **167**
- UNRESOLVED: **110**

## Flags refinadas

- ADVANCED_MECHANIC: **476**
- DYNAMIC_MECHANIC: **328**
- COST_MISMATCH: **173**
- TARGET_MISMATCH_CONFIRMED: **173**
- CHARACTER_NOT_FOUND: **108**
- COMPOUND_MECHANIC: **91**
- KIND_MISMATCH_CONFIRMED: **50**
- JUTSU_NOT_FOUND: **2**

## Casos críticos confirmados

| Personagem | Jutsu | Atual | Esperado | Alvo atual | Alvo canônico | Flags |
|---|---|---|---|---|---|---|
| Sasuke Uchiha | Sharingan | invuln | invuln+shield+damage | self | enemy | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kakashi Hatake | Sharingan | damage | utility | enemy | self | TARGET_MISMATCH_CONFIRMED |
| Neji Hyūga | Eight Trigrams Palm Rotation | damage | invuln+damage | enemy | self | COMPOUND_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hinata Hyūga | Eight Trigrams Sixty-Four Palms | shield | shield+damage | self | ally | TARGET_MISMATCH_CONFIRMED |
| Gaara | Sand Coffin | invuln | stun+invuln+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Gaara | Sand Clone | damage | shield+dot+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Gaara | Sand Armor | damage | shield | self | self | COST_MISMATCH, KIND_MISMATCH_CONFIRMED |
| Itachi Uchiha | Susanoo | damage | shield+heal | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Jiraiya | Summoning: Toad Mouth Trap | invuln | invuln+dot+damage | self | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Jiraiya | Major Summoning: Gamabunta | dot | dot+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Tsunade | Mitotic Regeneration | damage | heal | enemy | self | ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| A | Piercing Four-Fingered | stun | stun | enemy | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| A | Three-Fingered Assault | damage | damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| A | Lightning Armor | damage | dot+damage | enemy | self | TARGET_MISMATCH_CONFIRMED |
| Akatsuchi | Stone Golem | damage | shield+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Animal Path Pain | Summoning: Giant Crustacean | invuln | invuln+shield+damage | self | ally | COST_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Animal Path Pain | Summoning: Giant Panda | invuln | invuln+shield | self | ally | COMPOUND_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Animal Path Pain | Summoning: Giant Multi-Headed Dog | damage | dot+damage | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Anko Mitarashi | Twin Snake Sacrifice | damage | dot | enemy | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Ao | Barrier Talisman | damage | shield | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Aoba Yamashiro | Revenge of the Murder | invuln | invuln+heal | self | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Aoba Yamashiro | Crow Barrier | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Asuma Sarutobi | Flying Swallow | damage | stun+shield+damage | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Asuma Sarutobi | Sharpen Blades | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Asuma Sarutobi | Thousand Hand Strike | shield | shield+damage | self | enemy | COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Asuma Sarutobi | Burning Ash | damage | dot | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Asuma Sarutobi | Burning Ash: Ignite | dot | dot+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Asura Path Pain | Head Cannon | damage | damage | enemy | self | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Baki | Flak Jacket | shield | shield | self | ally | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Chiyo | Ten Puppets Collection | shield | shield+damage | self | enemy | COST_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Chiyo | Lion Roar Sealing | invuln | invuln+damage | self | enemy | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Chōji Akimichi | Spinach Pill | shield | shield+heal+damage | self | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Chōji Akimichi | Butterfly Bombing | damage | damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Chōji Akimichi | Butterfly Mode | damage | utility | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Chōjūrō | Hiramekarei Twinswords | damage | damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Curse Mark Jūgo | Cellular Absorption | damage | heal | enemy | enemy | ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Curse Mark Sasuke | Dark Void | invuln | stun+invuln+damage | self | enemy | COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Danzō Shimura | Izanagi | invuln | heal | self | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Danzō Shimura | Izanagi | damage | heal | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Deidara | Sonar Bat Bombs | dot | dot+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Deidara | C3: Megaton Sculpture | damage | damage | enemy | self | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Deva Path Pain | Almighty Push | damage | damage | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Deva Path Pain | Planetary Devastation | stun | invuln+shield+damage | enemy | enemy | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Dodai | Rubber Wall | stun | stun+shield+damage | enemy | ally | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Dosu Kinuta | Echo Speaker Tuning | damage | utility | enemy | self | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Drunken Lee | Drunken Counter | damage | damage | enemy | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Eight-Gates Guy | Battle Stance | damage | heal+damage | enemy | self | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Eight-Tailed B | Chakra Bones | damage | shield+damage | enemy | self | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Eight-Tailed B | Chakra Barrier | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Fū Yamanaka | Mind Transfer | invuln | invuln | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Fū Yamanaka | Mind Transfer Puppet Curse | damage | shield | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Fukasaku and Shima | Sand Dust | invuln | invuln | self | ally | TARGET_MISMATCH_CONFIRMED |
| Fukasaku and Shima | Demonic Illusion: Gamarinsho | stun | stun | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Gaara Of The Funk | Dance Dance Resurrection | invuln | heal | self | mixed | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Gari | Ground Pound | damage | shield+heal+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Gengetsu Hōzuki | Steaming Danger Tyranny Boy | invuln | invuln+heal | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Haku | Acupuncture | invuln | invuln+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hanabi Hyūga | Unyielding Tenacity | stun | stun+heal+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hanzō | Major Summoning: Ibuse | damage | heal+dot+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hanzō | Venom Sac | damage | dot+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hashirama Senju | Veritable 1000-Armed Kannon | shield | shield | self | ally | TARGET_MISMATCH_CONFIRMED |
| Hashirama Senju | Tree Wave Destruction | shield | shield+damage | self | ally | COST_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hashirama Senju | Deep Forest Creation | damage | utility | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hiashi Hyūga | Eight Trigrams Air Palm Wall | damage | utility | enemy | ally | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hidan | Jashin Sigil | damage | utility | enemy | self | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hinata Hyūga | Gentle Step Twin Lion Fists | damage | invuln+damage | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hinata Hyūga | Eight Trigrams Sixty-Four Palms | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Hiruzen Sarutobi | Major Summoning: Enma | damage | invuln+shield+damage | enemy | ally | COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Human Path Pain | Spirit Absorption | damage | heal | enemy | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Ibiki Morino | Biding Time | damage | shield+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Ibiki Morino | Summoning: Iron Maiden | shield | shield+damage | self | enemy | COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Ibiki Morino | Summoning: Torture Chamber | shield | shield+damage | self | enemy | COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Ino Yamanaka | Mind Transfer | invuln | stun+invuln+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Ino Yamanaka | Mind Transfer Clone | damage | utility | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Inoichi Yamanaka | Sensory Radar | damage | heal | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Inoichi Yamanaka | Sensory Radar: Collate | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Inoichi Yamanaka | Mental Invasion | invuln | invuln | self | enemy | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Iruka Umino | Ally Shield | invuln | invuln+shield | self | ally | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Itachi Uchiha | Mangekyō Sharingan | damage | invuln+heal+dot+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Ittan | Earth Dome | invuln | invuln+shield | self | ally | TARGET_MISMATCH_CONFIRMED |
| Ittan | Trench Defense | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Jinpachi Munashi | Scroll Unraveling | damage | dot+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Jiraiya | Raging Lion's Mane | stun | stun+damage | enemy | ally | COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Jirōbō | Sphere of Graves | damage | damage | enemy | self | TARGET_MISMATCH_CONFIRMED |
| Jirōbō | Terra Shield | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Kabuto Yakushi | Pre-Healing Technique | damage | heal | self | self | ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Kakashi Hatake | Team Tactics | damage | utility | enemy | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kakuzu | Searing Migraine | dot | dot+damage | enemy | self | TARGET_MISMATCH_CONFIRMED |
| Kankurō | Sanshōuo Shield | damage | stun+invuln+shield+dot+damage | enemy | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kankurō | Salamander Puppet | damage | shield+damage | enemy | ally | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Karin | Heal Bite | damage | heal | enemy | ally | KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Kazekage Gaara | Sand Summoning | shield | shield+damage | self | ally | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kazekage Gaara | Levitating Sand Shield | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Kiba Inuzuka | Two-Headed Wolf | damage | shield+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kiba Inuzuka | Dynamic Marking | invuln | invuln+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Killer B | Acrobat | damage | damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Killer B | Octopus Hold | damage | damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kimimaro | Bracken Dance | dot | dot+damage | enemy | self | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kimimaro | Digital Shrapnel | damage | shield+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kin Tsuchi | Bell Ring Illusion | invuln | invuln+damage | self | enemy | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Kisame Hoshigaki | Scale Shield | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Kisame Hoshigaki | Thousand Hungry Sharks | damage | damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kisame Hoshigaki | Exploding Water Shockwave | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kitsuchi | Erupt | stun | stun+shield+damage | enemy | self | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Konohamaru Sarutobi | Refocus | damage | shield+heal | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Konohamaru Sarutobi | Unsexy Technique | invuln | invuln+shield+damage | self | enemy | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Konohamaru Sarutobi | Agile Backflip | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Konohamaru Sarutobi | Quick Recovery | damage | heal | ally | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Kurenai Yuhi | Demonic Illusion: Entrap | shield | invuln+shield+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Kushina Uzumaki | Life Transfer | damage | heal | ally | ally | COST_MISMATCH, KIND_MISMATCH_CONFIRMED |
| Kushina Uzumaki | Adamantine Sealing Chains | invuln | stun+invuln | self | enemy | COMPOUND_MECHANIC, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Madara Uchiha | Mangekyō Sharingan | damage | dot+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Madara Uchiha | Eternal Mangekyō Sharingan | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Maki | Binding Cloth | stun | stun+shield+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Maki | Cloth Shield | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Masked Man | Kusari Chains | invuln | stun+invuln+damage | self | enemy | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Masked Man | Major Summoning: Kurama | damage | shield+damage | ally | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Minato Namikaze | Space-Time Marking | damage | invuln+damage | enemy | self | TARGET_MISMATCH_CONFIRMED |
| Minato Namikaze | Space-Time Marking | shield | shield+damage | self | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Minato Namikaze | Reciprocal Round-Robin | invuln | invuln+shield+damage | self | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Minato Namikaze | Chakra-Arm Raijin | invuln | invuln | self | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Misumi Tsurugi | Soft Physique Modification | invuln | invuln+damage | self | enemy | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Misumi Tsurugi | Tighten Joints | stun | stun+shield+damage | enemy | self | COST_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Mū | Fragmentation | stun | stun+heal+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Nagato | Naraka Path | damage | shield+heal | enemy | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Nagato | Control | damage | shield+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Naraka Path Pain | Energy Transfer | damage | shield+heal | self | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Naraka Path Pain | Judgment | damage | shield+heal | enemy | enemy | ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Naruto Uzumaki | Multi Shadow Clone | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Obito Uchiha | Sharingan | shield | shield+dot+damage | self | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Omoi | Back Slice | damage | damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Omoi | Paper Bomb | damage | damage | enemy | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Ōnoki | Earth Golem | shield | shield+damage | self | ally | COMPOUND_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Ōnoki | Lightened Boulder | shield | shield+damage | self | ally | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Orochimaru | Body Replacement Substitution | damage | heal | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Preta Path Pain | Chakra Shield | damage | shield | enemy | self | KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Preta Path Pain | Ninjutsu Absorption | damage | stun | enemy | enemy | COST_MISMATCH, ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Puppet Master Kankurō | Kuroari Trap | invuln | stun+invuln | self | enemy | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Rasa | 24-Karat Barricade | damage | shield | enemy | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Rasa | Gold Dust Shield | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Reanimator Kabuto | Reanimated Army | damage | stun | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Reanimator Kabuto | Binding Talisman | stun | stun | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Reanimator Kabuto | Binding Talisman | damage | stun | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Reanimator Kabuto | Reanimation Scroll | damage | utility | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Regimental Commander Gaara | Sand Shield | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Rehabilitated Gaara | Sand Shower | shield | shield+damage | self | enemy | COST_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Rehabilitated Gaara | Sand Burial Prison | damage | utility | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Rehabilitated Gaara | Sand Tsunami | damage | damage | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Rin Nohara | Pit Trap | shield | shield+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Rin Nohara | Medical Kit | damage | heal | enemy | ally | COST_MISMATCH, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Rock Lee | Full Power of Youth | damage | heal+damage | ally | enemy | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Sage Mode Jiraiya | Needle Senbon | damage | invuln+damage | enemy | self | COMPOUND_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sage Mode Kabuto | Sage Transformation | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sage Mode Kabuto | DNA Transmission Shadow | damage | heal | ally | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Sage Mode Kabuto | Inorganic Animation | damage | heal+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sage Mode Kabuto | Transfusion | invuln | invuln+heal | self | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sage Mode Naruto | Sage Mode | damage | heal | enemy | self | KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Sage Mode Naruto | Natural Energy Assault | stun | stun | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sai | Super Beast Scroll: Lions | shield | shield+damage | self | enemy | COMPOUND_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sai | Super Beast Scroll: Snake | invuln | stun+invuln+damage | self | enemy | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sai | Ink Mist | invuln | stun+invuln+dot+damage | self | ally | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sakon and Ukon | Demon Parasite | dot | shield+dot+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sakon and Ukon | Regeneration | damage | heal | enemy | self | COST_MISMATCH, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Sakura Haruno | Healing Technique | damage | heal | ally | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Sakura Haruno | Strength of One Hundred Seal | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sakura Haruno | Seal Release | heal | heal | ally | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sasori | Ally Control | damage | utility | enemy | ally | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Sasori | Poison Blade Assault | dot | shield+dot+damage | self | enemy | COST_MISMATCH, COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Sasuke Uchiha | Chidori Stream | damage | damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Shigure | Umbrella Toss | damage | utility | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Shigure | Senbon Shower | damage | damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Shino Aburame | Insect Barricade | damage | utility | enemy | ally | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Shukaku Gaara | Desert Hand | shield | shield+damage | self | enemy | COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Shukaku Gaara | Sand Transformation | shield | shield | ally | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Suigetsu Hōzuki | Great Water Arm | shield | shield+damage | self | enemy | COMPOUND_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Tayuya | Summoning: Doki | damage | shield+dot+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Temari | Sandstorm | invuln | invuln+damage | self | ally | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Temari | First Moon | damage | shield+damage | enemy | self | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Temari | Second Moon | damage | shield+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Tenten | Rising Dragon Control | damage | damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Tenten | Spiked Boulder Shield | invuln | shield | self | — | KIND_MISMATCH_CONFIRMED |
| Tenten | Chain Spin | invuln | invuln | self | ally | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Tobi | Sharingan | damage | utility | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Tobi | Izanagi | damage | heal | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Tobirama Senju | Infinite Darkness | invuln | invuln | self | ally | TARGET_MISMATCH_CONFIRMED |
| Torune Aburame | Nano-Sized Venomous Beetles | dot | shield+dot+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Torune Aburame | Venom Explosion | damage | dot | enemy | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Tsume Inuzuka | Call Kuromaru | damage | shield+damage | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Tsume Inuzuka | Light Bomb | invuln | invuln | self | ally | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Tsunade | Strength of One Hundred Seal | heal | heal | ally | self | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Utakata | Six-Tailed Transformation | damage | shield+heal+damage | enemy | self | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| White Snake Orochimaru | Regenerative Bite | damage | heal | enemy | enemy | ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED |
| White Snake Orochimaru | Eight-Headed Serpent | stun | stun+dot+damage | enemy | self | COMPOUND_MECHANIC, ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Yamato | Tenth Edict on Enlightenment | damage | heal | enemy | enemy | ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED |
| Yondaime Minato | Teleportation Barrier | damage | shield | enemy | ally | ADVANCED_MECHANIC, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Yoroi Akadō | Chakra Focus | damage | utility | enemy | self | COST_MISMATCH, ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Yūgao Uzuki | Sealing Technique | invuln | invuln+shield+damage | self | enemy | ADVANCED_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Yugito Nii | Two-Tailed Transformation | damage | shield+damage | enemy | self | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Zabuza Momochi | Silent Killing | invuln | invuln+shield+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |
| Zabuza Momochi | Demon Shroud | stun | stun+shield+damage | self | enemy | ADVANCED_MECHANIC, DYNAMIC_MECHANIC, TARGET_MISMATCH_CONFIRMED |

## Regra

Crítico confirmado ainda não significa patch automático. Técnicas compostas ou dinâmicas devem ser traduzidas para o motor V2 antes de alterar números.
