# Fila canônica de correções

Gerado em: 2026-08-26T10:02:52.133Z

## Política

- **CORE_PATCHABLE:** tipo/alvo/custo/CD/AoE podem ser determinados sem mecânica composta/dinâmica. Ainda exige sincronização com o `naruto-api` antes de deploy.
- **ENGINE_EXPANSION:** o efeito canônico exige ampliar o motor ou revisar semântica; não aproximar usando um tipo errado.
- **UNRESOLVED:** personagem/jutsu ainda não ligado ao upstream.
- **MANUAL_CANONICAL_REVIEW:** não há diff simples, mas a auditoria ainda exige revisão.

## Contagem

- ENGINE_EXPANSION: **641**
- UNRESOLVED: **110**
- VERIFIED_NO_CORE_CHANGE: **50**
- CORE_PATCHABLE: **35**

- CORE_PATCHABLE críticos: **24**
- ENGINE_EXPANSION críticos: **178**

## Primeiros CORE_PATCHABLE

| Personagem | Jutsu | Sev. | Patch de núcleo | Flags |
|---|---|---|---|---|
| Aoba Yamashiro | Crow Barrier | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Asura Path Pain | Head Cannon | CRITICAL | {"target":"self","cost":["Rand","Rand"]} | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Eight-Tailed B | Chakra Barrier | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Fukasaku and Shima | Sand Dust | CRITICAL | {"target":"ally","aoe":true} | TARGET_MISMATCH_CONFIRMED |
| Gaara | Sand Armor | CRITICAL | {"kind":"shield","cost":["Rand"]} | COST_MISMATCH, KIND_MISMATCH_CONFIRMED |
| Hashirama Senju | Veritable 1000-Armed Kannon | CRITICAL | {"target":"ally"} | TARGET_MISMATCH_CONFIRMED |
| Ittan | Trench Defense | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Jirōbō | Sphere of Graves | CRITICAL | {"target":"self"} | TARGET_MISMATCH_CONFIRMED |
| Jirōbō | Terra Shield | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Karin | Heal Bite | CRITICAL | {"kind":"heal","target":"ally"} | KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Kazekage Gaara | Levitating Sand Shield | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Kisame Hoshigaki | Scale Shield | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Kushina Uzumaki | Life Transfer | CRITICAL | {"kind":"heal","cost":["Rand"]} | COST_MISMATCH, KIND_MISMATCH_CONFIRMED |
| Maki | Cloth Shield | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Preta Path Pain | Chakra Shield | CRITICAL | {"kind":"shield","target":"self"} | KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Rasa | Gold Dust Shield | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Regimental Commander Gaara | Sand Shield | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Rin Nohara | Medical Kit | CRITICAL | {"kind":"heal","target":"ally","cost":["Rand","Rand"]} | COST_MISMATCH, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Sage Mode Naruto | Sage Mode | CRITICAL | {"kind":"heal","target":"self"} | KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Sakon and Ukon | Regeneration | CRITICAL | {"kind":"heal","target":"self","cost":["Rand","Rand"]} | COST_MISMATCH, KIND_MISMATCH_CONFIRMED, TARGET_MISMATCH_CONFIRMED |
| Tenten | Spiked Boulder Shield | CRITICAL | {"kind":"shield"} | KIND_MISMATCH_CONFIRMED |
| Tenten | Chain Spin | CRITICAL | {"target":"ally","cost":["Rand"],"aoe":true} | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Tobirama Senju | Infinite Darkness | CRITICAL | {"target":"ally","aoe":true} | TARGET_MISMATCH_CONFIRMED |
| Tsunade | Strength of One Hundred Seal | CRITICAL | {"target":"self","cost":["Rand"]} | COST_MISMATCH, TARGET_MISMATCH_CONFIRMED |
| Asuma Sarutobi | Kannon Strike | MEDIUM | {"cost":["Rand"]} | COST_MISMATCH |
| Chiyo | Assault Blade | MEDIUM | {"cost":["Rand"]} | COST_MISMATCH |
| Demon Brothers | Water Melding | MEDIUM | {"cost":["Rand","Rand"]} | COST_MISMATCH |
| Fū Yamanaka | Puppet Curse: Attack | MEDIUM | {"cost":["Rand"]} | COST_MISMATCH |
| Human Path Pain | Mind Invasion | MEDIUM | {"cost":["Rand"]} | COST_MISMATCH |
| Ino Yamanaka | Art of the Valentine | MEDIUM | {"cost":["Rand"]} | COST_MISMATCH |
| Kushimaru Kuriarare | Eviscerate | MEDIUM | {"cost":["Rand","Rand"]} | COST_MISMATCH |
| Puppet Master Kankurō | Iron Maiden | MEDIUM | {"cost":["Rand","Rand"]} | COST_MISMATCH |
| Tobi | Kamui Strike | MEDIUM | {"cost":["Gen"]} | COST_MISMATCH |
| Ameyuri Ringo | Thunder Gate | OK | {"aoe":false} |  |
| Chōji Akimichi | Partial Expansion | OK | {"aoe":true} |  |

## Primeiros ENGINE_EXPANSION

| Personagem | Jutsu | Sev. | Motivos | Esperado |
|---|---|---|---|---|
| A | Piercing Four-Fingered | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:stack | stun |
| A | Three-Fingered Assault | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:stack | damage |
| A | Lightning Armor | CRITICAL | COMPOUND_EFFECT, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Akatsuchi | Stone Golem | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:channel | shield+damage |
| Animal Path Pain | Summoning: Giant Crustacean | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:exhaust, ADVANCED:reduce, ADVANCED:channel | invuln+shield+damage |
| Animal Path Pain | Summoning: Giant Panda | CRITICAL | COMPOUND_EFFECT | invuln+shield |
| Animal Path Pain | Summoning: Giant Multi-Headed Dog | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:stack, ADVANCED:channel, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Anko Mitarashi | Twin Snake Sacrifice | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:requirement, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot |
| Ao | Barrier Talisman | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:exhaust, ADVANCED:trap, ADVANCED:counter | shield |
| Aoba Yamashiro | Revenge of the Murder | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:focus, ADVANCED:trap, ADVANCED:alone, ADVANCED:enrage, ADVANCED:bomb | invuln+heal |
| Asuma Sarutobi | Flying Swallow | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:alternate, ADVANCED:dynamic_change, ADVANCED:channel | stun+shield+damage |
| Asuma Sarutobi | Thousand Hand Strike | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:requirement | shield+damage |
| Asuma Sarutobi | Sharpen Blades | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:stack, NO_SINGLE_SUPPORTED_KIND |  |
| Asuma Sarutobi | Burning Ash | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:snare, ADVANCED:channel, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot |
| Asuma Sarutobi | Burning Ash: Ignite | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:stack, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Baki | Flak Jacket | CRITICAL | ADVANCED:enrage | shield |
| Chiyo | Ten Puppets Collection | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:channel | shield+damage |
| Chiyo | Lion Roar Sealing | CRITICAL | COMPOUND_EFFECT, ADVANCED:expose | invuln+damage |
| Chōji Akimichi | Spinach Pill | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:channel | shield+heal+damage |
| Chōji Akimichi | Butterfly Bombing | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:enrage, ADVANCED:dynamic_change | damage |
| Chōji Akimichi | Butterfly Mode | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:stack, ADVANCED:channel, NO_SINGLE_SUPPORTED_KIND |  |
| Chōjūrō | Hiramekarei Twinswords | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:counter | damage |
| Curse Mark Jūgo | Cellular Absorption | CRITICAL | ADVANCED:leech | heal |
| Curse Mark Sasuke | Dark Void | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:alone, ADVANCED:dynamic_change, ADVANCED:channel | stun+invuln+damage |
| Danzō Shimura | Izanagi | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:stack, ADVANCED:channel | heal |
| Danzō Shimura | Izanagi | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:stack, ADVANCED:channel | heal |
| Deidara | C3: Megaton Sculpture | CRITICAL | ADVANCED:weaken | damage |
| Deidara | Sonar Bat Bombs | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:stack, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Deva Path Pain | Almighty Push | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:counter, ADVANCED:channel | damage |
| Deva Path Pain | Planetary Devastation | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:stack, ADVANCED:alone | invuln+shield+damage |
| Dodai | Rubber Wall | CRITICAL | COMPOUND_EFFECT, ADVANCED:focus, ADVANCED:reduce | stun+shield+damage |
| Dosu Kinuta | Echo Speaker Tuning | CRITICAL | NO_SINGLE_SUPPORTED_KIND |  |
| Drunken Lee | Drunken Counter | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:stack, ADVANCED:counter | damage |
| Eight-Gates Guy | Battle Stance | CRITICAL | COMPOUND_EFFECT, ADVANCED:strengthen, ADVANCED:enrage | heal+damage |
| Eight-Tailed B | Chakra Bones | CRITICAL | COMPOUND_EFFECT, ADVANCED:reduce, ADVANCED:strengthen, ADVANCED:charges | shield+damage |
| Fū Yamanaka | Mind Transfer | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alone, ADVANCED:channel | invuln |
| Fū Yamanaka | Mind Transfer Puppet Curse | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:counter | shield |
| Fukasaku and Shima | Demonic Illusion: Gamarinsho | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:stack | stun |
| Gaara | Sand Coffin | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:expose, ADVANCED:alternate, ADVANCED:channel | stun+invuln+damage |
| Gaara | Sand Clone | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:enrage, ADVANCED:requirement, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | shield+dot+damage |
| Gaara Of The Funk | Dance Dance Resurrection | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:requirement | heal |
| Gari | Ground Pound | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:trap | shield+heal+damage |
| Gengetsu Hōzuki | Steaming Danger Tyranny Boy | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:taunt, ADVANCED:bomb, ADVANCED:requirement | invuln+heal |
| Haku | Acupuncture | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:silence, ADVANCED:dynamic_change, ADVANCED:requirement | invuln+damage |
| Hanabi Hyūga | Unyielding Tenacity | CRITICAL | COMPOUND_EFFECT, ADVANCED:focus, ADVANCED:strengthen, ADVANCED:endure | stun+heal+damage |
| Hanzō | Major Summoning: Ibuse | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:alternate, ADVANCED:trap, ADVANCED:stack, ADVANCED:dynamic_change, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | heal+dot+damage |
| Hanzō | Venom Sac | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Hashirama Senju | Tree Wave Destruction | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:dynamic_change | shield+damage |
| Hashirama Senju | Deep Forest Creation | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:exhaust, ADVANCED:alternate, ADVANCED:snare, ADVANCED:channel, NO_SINGLE_SUPPORTED_KIND |  |
| Hiashi Hyūga | Eight Trigrams Air Palm Wall | CRITICAL | ADVANCED:reflect, NO_SINGLE_SUPPORTED_KIND |  |
| Hidan | Jashin Sigil | CRITICAL | ADVANCED:alternate, NO_SINGLE_SUPPORTED_KIND |  |
| Hinata Hyūga | Eight Trigrams Sixty-Four Palms | CRITICAL | COMPOUND_EFFECT | shield+damage |
| Hinata Hyūga | Gentle Step Twin Lion Fists | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:stack, ADVANCED:deplete, ADVANCED:requirement | invuln+damage |
| Hinata Hyūga | Eight Trigrams Sixty-Four Palms | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:stack, NO_SINGLE_SUPPORTED_KIND |  |
| Hiruzen Sarutobi | Major Summoning: Enma | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:alternate, ADVANCED:channel | invuln+shield+damage |
| Human Path Pain | Spirit Absorption | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:leech, ADVANCED:absorb, ADVANCED:requirement | heal |
| Ibiki Morino | Biding Time | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:alternate, ADVANCED:trap, ADVANCED:stack | shield+damage |
| Ibiki Morino | Summoning: Iron Maiden | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:trap | shield+damage |
| Ibiki Morino | Summoning: Torture Chamber | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:trap | shield+damage |
| Ino Yamanaka | Mind Transfer | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:expose, ADVANCED:alternate, ADVANCED:channel | stun+invuln+damage |
| Ino Yamanaka | Mind Transfer Clone | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:enrage, ADVANCED:channel, NO_SINGLE_SUPPORTED_KIND |  |
| Inoichi Yamanaka | Sensory Radar | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:stack | heal |
| Inoichi Yamanaka | Sensory Radar: Collate | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:stack, NO_SINGLE_SUPPORTED_KIND |  |
| Inoichi Yamanaka | Mental Invasion | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:throttle, ADVANCED:channel | invuln |
| Iruka Umino | Ally Shield | CRITICAL | COMPOUND_EFFECT | invuln+shield |
| Itachi Uchiha | Susanoo | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:channel | shield+heal |
| Itachi Uchiha | Mangekyō Sharingan | CRITICAL | COMPOUND_EFFECT, ADVANCED:alternate, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | invuln+heal+dot+damage |
| Ittan | Earth Dome | CRITICAL | COMPOUND_EFFECT | invuln+shield |
| Jinpachi Munashi | Scroll Unraveling | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Jiraiya | Summoning: Toad Mouth Trap | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:expose, ADVANCED:trap, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | invuln+dot+damage |
| Jiraiya | Major Summoning: Gamabunta | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:channel, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Jiraiya | Raging Lion's Mane | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:trap | stun+damage |
| Kabuto Yakushi | Pre-Healing Technique | CRITICAL | ADVANCED:cure | heal |
| Kakashi Hatake | Sharingan | CRITICAL | NO_SINGLE_SUPPORTED_KIND |  |
| Kakashi Hatake | Team Tactics | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:stack, ADVANCED:snare, NO_SINGLE_SUPPORTED_KIND |  |
| Kakuzu | Searing Migraine | CRITICAL | COMPOUND_EFFECT, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Kankurō | Sanshōuo Shield | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:alternate, ADVANCED:channel, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | stun+invuln+shield+dot+damage |
| Kankurō | Salamander Puppet | CRITICAL | COMPOUND_EFFECT, ADVANCED:reduce | shield+damage |
| Kazekage Gaara | Sand Summoning | CRITICAL | COMPOUND_EFFECT, ADVANCED:reduce, ADVANCED:strengthen, ADVANCED:charges | shield+damage |
| Kiba Inuzuka | Two-Headed Wolf | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:channel | shield+damage |
| Kiba Inuzuka | Dynamic Marking | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:expose, ADVANCED:requirement | invuln+damage |
| Killer B | Acrobat | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap | damage |
| Killer B | Octopus Hold | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:counter | damage |
| Kimimaro | Bracken Dance | CRITICAL | COMPOUND_EFFECT, ADVANCED:weaken, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Kimimaro | Digital Shrapnel | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:trap | shield+damage |
| Kin Tsuchi | Bell Ring Illusion | CRITICAL | COMPOUND_EFFECT | invuln+damage |
| Kisame Hoshigaki | Thousand Hungry Sharks | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:stack, ADVANCED:channel | damage |
| Kisame Hoshigaki | Exploding Water Shockwave | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:snare, ADVANCED:channel, NO_SINGLE_SUPPORTED_KIND |  |
| Kitsuchi | Erupt | CRITICAL | COMPOUND_EFFECT, ADVANCED:reduce, ADVANCED:counter, ADVANCED:reflect, ADVANCED:throttle | stun+shield+damage |
| Konohamaru Sarutobi | Refocus | CRITICAL | COMPOUND_EFFECT, ADVANCED:alternate | shield+heal |
| Konohamaru Sarutobi | Unsexy Technique | CRITICAL | COMPOUND_EFFECT, ADVANCED:expose | invuln+shield+damage |
| Konohamaru Sarutobi | Agile Backflip | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:counter, ADVANCED:dynamic_change, NO_SINGLE_SUPPORTED_KIND |  |
| Konohamaru Sarutobi | Quick Recovery | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap | heal |
| Kurenai Yuhi | Demonic Illusion: Entrap | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:expose, ADVANCED:exhaust, ADVANCED:stack, ADVANCED:weaken | invuln+shield+damage |
| Kushina Uzumaki | Adamantine Sealing Chains | CRITICAL | COMPOUND_EFFECT, ADVANCED:alone, ADVANCED:purge | stun+invuln |
| Madara Uchiha | Mangekyō Sharingan | CRITICAL | COMPOUND_EFFECT, ADVANCED:alternate, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | dot+damage |
| Madara Uchiha | Eternal Mangekyō Sharingan | CRITICAL | ADVANCED:enrage, NO_SINGLE_SUPPORTED_KIND |  |
| Maki | Binding Cloth | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:trap | stun+shield+damage |
| Masked Man | Kusari Chains | CRITICAL | COMPOUND_EFFECT, ADVANCED:expose | stun+invuln+damage |
| Masked Man | Major Summoning: Kurama | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:demolish, ADVANCED:channel | shield+damage |
| Minato Namikaze | Space-Time Marking | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:trap | shield+damage |
| Minato Namikaze | Reciprocal Round-Robin | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:redirect | invuln+shield+damage |
| Minato Namikaze | Space-Time Marking | CRITICAL | COMPOUND_EFFECT | invuln+damage |
| Minato Namikaze | Chakra-Arm Raijin | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:requirement | invuln |
| Misumi Tsurugi | Soft Physique Modification | CRITICAL | COMPOUND_EFFECT, ADVANCED:expose, ADVANCED:redirect | invuln+damage |
| Misumi Tsurugi | Tighten Joints | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:requirement | stun+shield+damage |
| Mū | Fragmentation | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:focus, ADVANCED:reduce, ADVANCED:trap, ADVANCED:weaken | stun+heal+damage |
| Nagato | Control | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:stack, ADVANCED:dynamic_change, ADVANCED:requirement | shield+damage |
| Nagato | Naraka Path | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:leech, ADVANCED:requirement | shield+heal |
| Naraka Path Pain | Energy Transfer | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:stack | shield+heal |
| Naraka Path Pain | Judgment | CRITICAL | COMPOUND_EFFECT, ADVANCED:leech | shield+heal |
| Naruto Uzumaki | Multi Shadow Clone | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:counter, NO_SINGLE_SUPPORTED_KIND |  |
| Neji Hyūga | Eight Trigrams Palm Rotation | CRITICAL | COMPOUND_EFFECT | invuln+damage |
| Obito Uchiha | Sharingan | CRITICAL | COMPOUND_EFFECT, DYNAMIC_OR_CONDITIONAL, ADVANCED:reduce, ADVANCED:trap, ADVANCED:strengthen, DOT_RUNTIME_SEMANTICS_REQUIRE_REVIEW | shield+dot+damage |
| Omoi | Back Slice | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:alternate, ADVANCED:trap, ADVANCED:counter | damage |
| Omoi | Paper Bomb | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:trap, ADVANCED:stack | damage |
| Ōnoki | Earth Golem | CRITICAL | COMPOUND_EFFECT | shield+damage |
| Ōnoki | Lightened Boulder | CRITICAL | COMPOUND_EFFECT, ADVANCED:reduce | shield+damage |
| Orochimaru | Body Replacement Substitution | CRITICAL | DYNAMIC_OR_CONDITIONAL, ADVANCED:requirement | heal |
| Preta Path Pain | Ninjutsu Absorption | CRITICAL | ADVANCED:absorb | stun |
