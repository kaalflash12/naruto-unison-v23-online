# Auditoria de semântica real do combate

Gerado em 2026-08-25T23:55:43.637Z.

## Base

- 209 personagens
- 836 jutsus
- 203 personagens padrão
- 4 personagens/eventos separados
- 2 personagens especiais para revisão de elegibilidade PvP
- 379 jutsus com pelo menos um alerta
- Alertas: **41 críticos**, **200 altos**, 176 médios, 0 baixos

## Regras efetivamente modeladas

- DAMAGE: power com variação ~90–110%; duration não participa do dano.
- STUN: dano imediato + perda de ação; duration 0 vira 1 turno.
- DOT: dano imediato + 7 por tick; duration 0 vira 1 tick.
- HEAL: cura power até maxHp.
- SHIELD: power entra no pool; duration 0 não expira por relógio.
- INVULN: power é ignorado; duration 0 vira 1 turno.
- AOE: aplica o efeito a cada alvo vivo, logo o impacto é 1×/2×/3×, não um multiplicador fixo.

## Revisão prioritária

| Sev. | Personagem | Jutsu | Kind | Alvo | Power | Dur. | Custo | Problema |
|---|---|---|---|---|---:|---:|---:|---|
| CRITICAL | Kabuto Yakushi | Pre-Healing Technique | damage | self | 25 | 5 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo self. |
| CRITICAL | Kiba Inuzuka | Dynamic Marking | invuln | self | 1 | 3 | 0 | long_invulnerability — Invulnerabilidade dura 3 turnos com custo 0. |
| CRITICAL | Sage Mode Kabuto | Transfusion | invuln | self | 1 | 3 | 0 | long_invulnerability — Invulnerabilidade dura 3 turnos com custo 0. |
| CRITICAL | Aoba Yamashiro | Scattering Crow Swarm | damage | ally | 5 | 4 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Gaara | Sand Armor | damage | self | 25 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo self. |
| HIGH | Hidan | Death Blow | damage | self | 50 | 0 | 2 | burst_statistical_outlier — Dano base z robusto 3.373. |
| CRITICAL | Hiruzen Sarutobi | Adamantine Prison | damage | ally | 25 | 1 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Ino Yamanaka | Proxy Surveillance | damage | ally | 25 | 3 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Kiba Inuzuka | Man-Beast Clone | stun | self | 10 | 4 | 1 | hostile_effect_targets_own_team — stun causa efeito hostil em alvo self. |
| CRITICAL | Konohamaru Sarutobi | Quick Recovery | damage | ally | 25 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Kushina Uzumaki | Life Transfer | damage | ally | 25 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Mangekyō Sasuke | Susanoo | damage | self | 25 | 3 | 2 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo self. |
| CRITICAL | Masked Man | Major Summoning: Kurama | damage | ally | 25 | 3 | 3 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| HIGH | Might Guy | Hirudora | damage | enemy | 300 | 0 | 2 | burst_statistical_outlier — Dano base z robusto 37.097. |
| CRITICAL | Sakura Haruno | Técnica de Cura | damage | ally | 25 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| HIGH | Sasuke Uchiha | Kirin | damage | enemy | 60 | 0 | 0 | burst_statistical_outlier — Dano base z robusto 4.721. |
| CRITICAL | Temari | Gale Raging Wall | damage | ally | 25 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Toroi | Magnetic Field | damage | self | 25 | 3 | 0 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo self. |
| CRITICAL | Torune Aburame | Nano-Sized Venomous Beetles | dot | self | 5 | 5 | 1 | hostile_effect_targets_own_team — dot causa efeito hostil em alvo self. |
| CRITICAL | Torune Aburame | Jar of Poison | dot | self | 5 | 5 | 2 | hostile_effect_targets_own_team — dot causa efeito hostil em alvo self. |
| CRITICAL | Haku | Acupuncture | stun | ally | 10 | 1 | 1 | hostile_effect_targets_own_team — stun causa efeito hostil em alvo ally. |
| CRITICAL | Haku | Thousand Needles of Death | stun | ally | 10 | 1 | 1 | hostile_effect_targets_own_team — stun causa efeito hostil em alvo ally. |
| CRITICAL | Kidōmaru | Spiral Web | damage | ally | 25 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Kimimaro | Clematis Dance | damage | ally | 20 | 0 | 2 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Mei Terumi | Lava Monster | dot | self | 10 | 3 | 2 | hostile_effect_targets_own_team — dot causa efeito hostil em alvo self. |
| CRITICAL | Naraka Path Pain | Energy Transfer | damage | self | 25 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo self. |
| CRITICAL | Rock Lee | Full Power of Youth | damage | ally | 20 | 0 | 2 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Sage Mode Kabuto | DNA Transmission Shadow | damage | ally | 25 | 0 | 3 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Sakon and Ukon | Demon Parasite | dot | self | 20 | 0 | 2 | hostile_effect_targets_own_team — dot causa efeito hostil em alvo self. |
| CRITICAL | Sasori | Poison Blade Assault | dot | self | 10 | 2 | 2 | hostile_effect_targets_own_team — dot causa efeito hostil em alvo self. |
| CRITICAL | Shikaku Nara | Problem Analysis | damage | ally | 25 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Tsunade | Heaven Spear Kick | damage | ally | 20 | 0 | 1 | hostile_effect_targets_own_team — damage causa efeito hostil em alvo ally. |
| CRITICAL | Zabuza Momochi | Demon Shroud | stun | self | 10 | 2 | 2 | hostile_effect_targets_own_team — stun causa efeito hostil em alvo self. |
| HIGH | A | One-Fingered Assault | invuln | self | 1 | 3 | 3 | long_invulnerability — Invulnerabilidade dura 3 turnos com custo 3. |
| HIGH | Eight-Gates Guy | Night Guy | damage | enemy | 50 | 2 | 2 | burst_statistical_outlier — Dano base z robusto 3.373. |
| HIGH | Haku | Crystal Ice Mirrors | invuln | self | 1 | 3 | 2 | long_invulnerability — Invulnerabilidade dura 3 turnos com custo 2. |
| HIGH | Ino Yamanaka | Transferência Mental | invuln | self | 1 | 4 | 2 | long_invulnerability — Invulnerabilidade dura 4 turnos com custo 2. |
| HIGH | Inoichi Yamanaka | Mental Invasion | invuln | self | 1 | 4 | 1 | long_invulnerability — Invulnerabilidade dura 4 turnos com custo 1. |
| HIGH | Izumo and Kotetsu | Devastate | damage | enemy | 65 | 3 | 1 | burst_statistical_outlier — Dano base z robusto 5.396. |
| HIGH | Izumo and Kotetsu | Annihilate | damage | enemy | 65 | 3 | 1 | burst_statistical_outlier — Dano base z robusto 5.396. |
| HIGH | Jigen | Daikokuten | damage | enemy | 50 | 0 | 2 | burst_statistical_outlier — Dano base z robusto 3.373. |
| HIGH | Naruto Uzumaki — Hokage | Fūton: Rasenshuriken | damage | enemy | 58 | 0 | 3 | burst_statistical_outlier — Dano base z robusto 4.452. |
| HIGH | Oboro | Fog Clone | invuln | self | 1 | 3 | 2 | long_invulnerability — Invulnerabilidade dura 3 turnos com custo 2. |
| HIGH | Puppet Master Kankurō | Kuroari Trap | invuln | self | 1 | 5 | 1 | long_invulnerability — Invulnerabilidade dura 5 turnos com custo 1. |
| HIGH | Rock Lee | Lótus Oculta | damage | enemy | 100 | 0 | 2 | burst_statistical_outlier — Dano base z robusto 10.117. |
| HIGH | Sai | Ink Mist | invuln | self | 1 | 3 | 2 | long_invulnerability — Invulnerabilidade dura 3 turnos com custo 2. |
| HIGH | Sasuke Uchiha | Sharingan | invuln | self | 1 | 4 | 1 | long_invulnerability — Invulnerabilidade dura 4 turnos com custo 1. |
| HIGH | Shikamaru Nara | Final Explosion | damage | enemy | 100 | 0 | 2 | burst_statistical_outlier — Dano base z robusto 10.117. |
| HIGH | A | Lightning Armor | damage | enemy | 25 | 3 | 1 | damage_duration_unused — Duração 3 não é usada pelo resolvedor de damage. |
| HIGH | Akatsuchi | Stone Golem | damage | enemy | 15 | 2 | 2 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Animal Path Pain | Summoning: Giant Multi-Headed Dog | damage | enemy | 10 | 3 | 2 | damage_duration_unused — Duração 3 não é usada pelo resolvedor de damage. |
| HIGH | Anko Mitarashi | Dual Pin | damage | enemy | 5 | 1 | 0 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Ao | Técnica Sensorial | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Ao | Barrier Talisman | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Asuma Sarutobi | Flying Swallow | damage | enemy | 15 | 2 | 2 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Asura Path Pain | Missile Salvo | damage | enemy | 10 | 2 | 2 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | C | Técnica Sensorial | damage | enemy | 20 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | C | Flash Pillar | damage | enemy | 35 | 1 | 2 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Chiyo | Army of Illusions | damage | enemy | 20 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Chōji Akimichi | Obstructing Tackle | damage | enemy | 20 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Chōji Akimichi | Butterfly Bombing | damage | enemy | 30 | 1 | 3 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Chōji Akimichi | Spiky Human Boulder | damage | enemy | 15 | 2 | 3 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Chōjūrō | Hiramekarei Hammer | damage | enemy | 50 | 0 | 2 | burst_statistical_outlier — Dano base z robusto 3.373. |
| HIGH | Chūkichi | Psychic Jamming | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Chūkichi | Silent Killing | damage | enemy | 30 | 1 | 2 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Corrupted Obito | Hide | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Corrupted Obito | Murderous Resolve | damage | enemy | 35 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Curse Mark Jūgo | Psychotic Break | damage | enemy | 10 | 3 | 1 | damage_duration_unused — Duração 3 não é usada pelo resolvedor de damage. |
| HIGH | Curse Mark Jūgo | Connected Cannons | damage | enemy | 50 | 0 | 2 | burst_statistical_outlier — Dano base z robusto 3.373. |
| HIGH | Curse Mark Sasuke | Chidori | damage | enemy | 45 | 2 | 2 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Curse Mark Sasuke (shippuden) | Snake Shedding | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Curse Mark Sasuke (shippuden) | Sharingan Genjutsu | damage | enemy | 35 | 1 | 2 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Danzō Shimura | Izanagi: Contra-ataque | damage | enemy | 25 | 1 | 2 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Deidara | Detonating Clay | damage | enemy | 20 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Deidara | C1: Bird Bomb | damage | enemy | 15 | 4 | 1 | damage_duration_unused — Duração 4 não é usada pelo resolvedor de damage. |
| HIGH | Deidara | C3: Megaton Sculpture | damage | enemy | 20 | 4 | 2 | damage_duration_unused — Duração 4 não é usada pelo resolvedor de damage. |
| HIGH | Deidara | C2: Dragon Missile | damage | enemy | 30 | 4 | 1 | damage_duration_unused — Duração 4 não é usada pelo resolvedor de damage. |
| HIGH | Dodai | Rubber Wall | stun | enemy | 10 | 3 | 2 | long_stun — Atordoamento pode remover 3 ações do alvo. |
| HIGH | Dodai | Rubber Sphere and Rope | damage | enemy | 35 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Dosu Kinuta | Resonating Echo Drill | damage | enemy | 20 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Dosu Kinuta | Echo Speaker Tuning | damage | enemy | 25 | 4 | 1 | damage_duration_unused — Duração 4 não é usada pelo resolvedor de damage. |
| HIGH | Drunken Lee | Drunken Fist | damage | enemy | 15 | 3 | 2 | damage_duration_unused — Duração 3 não é usada pelo resolvedor de damage. |
| HIGH | Eight-Tailed B | Lariat | damage | enemy | 20 | 1 | 2 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Four Tailed Naruto (shippuden) | Tailed Beast Bomb | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Four Tailed Naruto (shippuden) | Chakra Slam | damage | enemy | 35 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Fū Yamanaka | Mind Transfer Puppet Curse | damage | enemy | 25 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Fuguki Suikazan | Needle Senbon | damage | enemy | 15 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Fukasaku and Shima | Frog Song | damage | enemy | 25 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Gaara Of The Funk | Funk Coffin | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Gaara Of The Funk | Couldve Hada V8 | damage | enemy | 35 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Hanabi Hyūga | Punho Gentil | damage | enemy | 15 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Hashirama Senju | Wood Golem | damage | enemy | 20 | 2 | 2 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Hashirama Senju | Deep Forest Creation | damage | enemy | 25 | 2 | 2 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Hiashi Hyūga | Eight Trigrams Palm Rotation | damage | enemy | 15 | 2 | 2 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Hidan | First Blood | damage | enemy | 5 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Hidan | Blood Curse | damage | enemy | 25 | 3 | 1 | damage_duration_unused — Duração 3 não é usada pelo resolvedor de damage. |
| HIGH | Hinata Hyūga | Punho Gentil | damage | enemy | 20 | 2 | 2 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Hinata Hyūga | Pressure Point Strike | damage | enemy | 10 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Hinata Hyūga | Eight Trigrams Sixty-Four Palms | damage | enemy | 25 | 4 | 1 | damage_duration_unused — Duração 4 não é usada pelo resolvedor de damage. |
| HIGH | Hiruko Sasori (shippuden) | Defensive Puppeteering | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Hiruko Sasori (shippuden) | Scorpion Tail Constriction | damage | enemy | 35 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Hiruzen Sarutobi | Major Summoning: Enma | damage | enemy | 5 | 1 | 3 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Hoshigaki Kisame Body Double (shippuden) | Triple Water Prison | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Hoshigaki Kisame Body Double (shippuden) | 5 Man Eating Sharks | damage | enemy | 35 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Human Path Pain | Mind Invasion | damage | enemy | 15 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Human Path Pain | Spirit Absorption | damage | enemy | 25 | 1 | 2 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Ino Yamanaka | Chakra Hair Trap | damage | enemy | 25 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Ino Yamanaka | Mind Destruction | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Ino Yamanaka | Mind Transfer Clone | damage | enemy | 25 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Inoichi Yamanaka | Psycho Mind Transmission | damage | enemy | 20 | 2 | 1 | damage_duration_unused — Duração 2 não é usada pelo resolvedor de damage. |
| HIGH | Iruka Umino | Capture and Arrest | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Isshiki Ōtsutsuki | Daikokuten | damage | enemy | 48 | 0 | 2 | burst_statistical_outlier — Dano base z robusto 3.103. |
| HIGH | Itachi Uchiha (reanimado) | Phoenix Flower | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Itachi Uchiha (reanimado) | Izanami | damage | enemy | 35 | 1 | 2 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Ittan | Mobile Core | damage | enemy | 30 | 1 | 2 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Jinin Akebino | Axe Chop | damage | enemy | 15 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Jinin Akebino | Hammer Bash | damage | enemy | 25 | 4 | 1 | damage_duration_unused — Duração 4 não é usada pelo resolvedor de damage. |
| HIGH | Jinpachi Munashi | Scroll Unraveling | damage | enemy | 25 | 1 | 1 | damage_duration_unused — Duração 1 não é usada pelo resolvedor de damage. |
| HIGH | Jiraiya | Raging Lion's Mane | stun | enemy | 10 | 3 | 1 | long_stun — Atordoamento pode remover 3 ações do alvo. |
| HIGH | Jūgo | Sage Transformation | damage | enemy | 25 | 3 | 2 | damage_duration_unused — Duração 3 não é usada pelo resolvedor de damage. |

## Regra de decisão

Nenhum alerta numérico autoriza nerf/buff sozinho. Primeiro corrigir mapeamentos semânticos, depois confirmar paridade com o backend online, depois executar simulação reproduzível e medir taxa de vitória/TTK/chakra/controle por matchup.
