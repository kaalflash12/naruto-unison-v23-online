# Auditoria de personagens, jutsus e balanceamento

Gerado em: 2026-08-25T20:22:43.716Z

## Escopo

- Personagens: **209**
- Jutsus: **836**
- Ligações personagem↔jutsu: **836**
- Personagens sem exatamente 4 jutsus: **0**
- Alertas descrição↔mecânica: **110**
- Flags de jutsu: **278**
- Flags de personagem: **104**

## Tipos mecânicos encontrados

`{"damage":397,"dot":62,"heal":12,"invuln":179,"shield":88,"stun":98}`

## Critério

Os índices são **triagem comparativa**. Nenhum valor deve ser alterado só porque apareceu como outlier. Antes de nerf/buff é obrigatório confirmar o motor real, economia de chakra, alvo/área, duração, sinergias, requisitos e taxa de vitória por confronto.

## Personagens com maior desvio estático

| Personagem | Jutsus | Dano médio | Máx dano | Custo méd. | CD méd. | Ofensa | Sustentação | Utilidade | Índice | z robusto | Alertas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Might Guy | 4 | 101.25 | 300 | 1.75 | 0.5 | 405 | 0 | 12 | 417 | 10.994 | personagem_power_outlier_alto, possui_descricao_mecanica_inconsistente |
| Gengetsu Hōzuki | 4 | 2.5 | 10 | 1.75 | 3 | 10 | 302.625 | 0 | 312.625 | 7.474 | personagem_power_outlier_alto |
| Kurama | 4 | 45 | 78 | 2 | 2.5 | 288 | 0 | 12 | 300 | 7.049 | personagem_power_outlier_alto, possui_descricao_mecanica_inconsistente |
| Shukaku | 4 | 32.5 | 58 | 1.25 | 1.75 | 173.5 | 36 | 12 | 221.5 | 4.401 | personagem_power_outlier_alto |
| Gyūki | 4 | 25 | 62 | 1.75 | 2 | 146.5 | 50.85 | 12 | 209.35 | 3.991 | personagem_power_outlier_alto |
| Izumo and Kotetsu | 4 | 42.5 | 65 | 1.25 | 1.5 | 170 | 0 | 36 | 206 | 3.878 | personagem_power_outlier_alto, possui_descricao_mecanica_inconsistente |
| White Snake Orochimaru | 4 | 22.5 | 30 | 1.75 | 1.5 | 105 | 0 | 99 | 204 | 3.811 | personagem_power_outlier_alto |
| Jigen | 4 | 30 | 50 | 1.5 | 2 | 157.5 | 25.2 | 12 | 194.7 | 3.497 | personagem_power_outlier_alto |
| Naruto Uzumaki — Hokage | 4 | 28.25 | 58 | 2.25 | 2.5 | 156.5 | 36.45 | 0 | 192.95 | 3.438 | personagem_power_outlier_alto |
| Shikamaru Nara | 4 | 38.75 | 100 | 1.5 | 2.25 | 155 | 11.25 | 24 | 190.25 | 3.347 | personagem_power_outlier_alto |
| Toneri Ōtsutsuki | 4 | 24 | 58 | 1.5 | 2.5 | 139.5 | 36.45 | 12 | 187.95 | 3.27 | personagem_power_outlier_alto |
| Kaguya Ōtsutsuki | 4 | 27.5 | 64 | 2 | 2.75 | 158 | 11.25 | 12 | 181.25 | 3.044 | personagem_power_outlier_alto, possui_descricao_mecanica_inconsistente |
| Kiba Inuzuka | 4 | 20 | 40 | 2 | 3.25 | 80 | 40.5 | 60 | 180.5 | 3.018 | personagem_power_outlier_alto |
| Momoshiki Ōtsutsuki | 4 | 33 | 52 | 2 | 2 | 165 | 11.25 | 0 | 176.25 | 2.875 | personagem_power_outlier_alto |
| Konohamaru Sarutobi — Sensei | 4 | 26.5 | 40 | 1.5 | 1.5 | 155.5 | 16.2 | 0 | 171.7 | 2.722 | personagem_power_outlier_alto |
| Shikaku Nara | 4 | 18.75 | 25 | 1.25 | 1.75 | 90 | 0 | 81 | 171 | 2.698 | personagem_power_outlier_alto |
| Kimimaro | 4 | 0 | 0 | 1.75 | 1.75 | 0 | 11.25 | 0 | 11.25 | -2.69 | personagem_power_outlier_baixo, possui_descricao_mecanica_inconsistente |
| Pakura | 4 | 0 | 0 | 1.5 | 1.5 | 0 | 11.25 | 0 | 11.25 | -2.69 | personagem_power_outlier_baixo, possui_descricao_mecanica_inconsistente |
| True Form Sasori | 4 | 5 | 20 | 1.25 | 0.75 | 20 | 0 | 0 | 20 | -2.394 | possui_descricao_mecanica_inconsistente |
| Jirōbō | 4 | 12.5 | 30 | 2 | 2.5 | 65 | 93.938 | 0 | 158.938 | 2.291 |  |
| Rock Lee | 4 | 33.75 | 100 | 1.5 | 1 | 135 | 22.5 | 0 | 157.5 | 2.243 | possui_descricao_mecanica_inconsistente |
| Sakura Haruno — Adulta | 4 | 11 | 44 | 1.75 | 2 | 44 | 112.85 | 0 | 156.85 | 2.221 |  |
| Nine-Tailed Naruto | 4 | 0 | 0 | 1.25 | 0.25 | 0 | 29.25 | 0 | 29.25 | -2.083 | possui_descricao_mecanica_inconsistente |
| Jinpachi Munashi | 4 | 6.25 | 25 | 1.5 | 0.75 | 25 | 4.5 | 0 | 29.5 | -2.074 | possui_descricao_mecanica_inconsistente |
| Isshiki Ōtsutsuki | 4 | 20.5 | 48 | 1.5 | 2 | 118 | 22.5 | 12 | 152.5 | 2.074 |  |
| Anko Mitarashi | 4 | 7.5 | 25 | 1.25 | 1 | 30 | 0 | 0 | 30 | -2.057 | possui_descricao_mecanica_inconsistente |
| Kakashi Hatake | 4 | 31.25 | 40 | 1.75 | 1.25 | 125 | 0 | 24 | 149 | 1.956 | possui_descricao_mecanica_inconsistente |
| Rehabilitated Gaara | 4 | 22.5 | 40 | 1.75 | 1.75 | 127.5 | 20.25 | 0 | 147.75 | 1.914 |  |
| Mitsuki | 4 | 22 | 34 | 1.5 | 1.5 | 110.5 | 25.2 | 12 | 147.7 | 1.912 |  |
| Boruto Uzumaki | 4 | 23.75 | 38 | 1.25 | 1.25 | 119 | 16.2 | 12 | 147.2 | 1.895 |  |
| Sasori | 4 | 2.5 | 10 | 1.25 | 2.25 | 17.5 | 18 | 0 | 35.5 | -1.872 | possui_descricao_mecanica_inconsistente |
| Torune Aburame | 4 | 6.25 | 25 | 1.75 | 1.5 | 25 | 11.25 | 0 | 36.25 | -1.846 | possui_descricao_mecanica_inconsistente |
| Sage Mode Naruto | 4 | 26.25 | 50 | 1.25 | 0.5 | 112.5 | 0 | 33 | 145.5 | 1.838 |  |
| Zaku Abumi | 4 | 23.75 | 45 | 1.5 | 1.5 | 128.75 | 11.25 | 0 | 140 | 1.653 |  |
| Jiraiya | 4 | 5 | 20 | 1.75 | 1 | 20 | 22.5 | 0 | 42.5 | -1.636 | possui_descricao_mecanica_inconsistente |
| Might Guy | 4 | 28.75 | 60 | 1.5 | 1.5 | 115 | 22.5 | 0 | 137.5 | 1.568 |  |
| Kitsuchi | 4 | 22.5 | 45 | 1.5 | 2.25 | 90 | 11.25 | 36 | 137.25 | 1.56 |  |
| Ino Yamanaka | 4 | 20 | 30 | 1.5 | 1 | 80 | 45 | 12 | 137 | 1.551 |  |
| Kazekage Gaara | 4 | 3.75 | 10 | 1.5 | 1.75 | 15 | 18 | 12 | 45 | -1.551 |  |
| Haku | 4 | 10 | 30 | 1.5 | 2.75 | 70 | 45 | 21 | 136 | 1.518 |  |
| Mei Terumi | 4 | 5 | 20 | 1.5 | 2.75 | 35 | 11.25 | 0 | 46.25 | -1.509 | possui_descricao_mecanica_inconsistente |
| Mizuki | 4 | 6.25 | 15 | 1.25 | 1.5 | 25 | 22.5 | 0 | 47.5 | -1.467 | possui_descricao_mecanica_inconsistente |
| Ōnoki | 4 | 5 | 20 | 1 | 1.5 | 20 | 28.125 | 0 | 48.125 | -1.446 |  |
| Asuma Sarutobi | 4 | 27.5 | 35 | 1.75 | 0.5 | 121.25 | 0 | 12 | 133.25 | 1.425 | possui_descricao_mecanica_inconsistente |
| Atsui | 4 | 6.25 | 25 | 1.25 | 2.25 | 25 | 24.75 | 0 | 49.75 | -1.391 | possui_descricao_mecanica_inconsistente |
| Hanzō | 4 | 12.5 | 25 | 1.75 | 1.75 | 50 | 0 | 0 | 50 | -1.383 | possui_descricao_mecanica_inconsistente |
| Fuguki Suikazan | 4 | 6.25 | 15 | 1.25 | 3 | 25 | 13.5 | 12 | 50.5 | -1.366 | possui_descricao_mecanica_inconsistente |
| Utakata | 4 | 10 | 25 | 1.25 | 1.75 | 40 | 11.25 | 0 | 51.25 | -1.341 | possui_descricao_mecanica_inconsistente |
| Yugito Nii | 4 | 10 | 25 | 1 | 1.5 | 40 | 11.25 | 0 | 51.25 | -1.341 | possui_descricao_mecanica_inconsistente |
| Minato Namikaze | 4 | 5 | 20 | 1.25 | 1.75 | 20 | 31.5 | 0 | 51.5 | -1.332 |  |

## Jutsus com maior desvio estático

| Personagem | Jutsu | Tipo | Custo | CD | Dano | Sust. | Controle | Índice | z robusto | Alertas |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| Might Guy | Hirudora | damage | 2 | 0 | 300 | 0 | 0 | 300 | 14.268 | dano_outlier_alto, eficiencia_dano_outlier_alta, indice_poder_outlier_alto |
| Gengetsu Hōzuki | Major Summoning: Giant Clam | shield | 3 | 5 | 0 | 252 | 0 | 252 | 11.778 | indice_poder_outlier_alto |
| Kurama | Bijūdama Massiva | damage | 3 | 4 | 78 | 0 | 0 | 136.5 | 5.785 | dano_outlier_alto, indice_poder_outlier_alto |
| Kurama | Bijūdama | damage | 2 | 3 | 66 | 0 | 0 | 115.5 | 4.696 | dano_outlier_alto, indice_poder_outlier_alto |
| Kaguya Ōtsutsuki | Expansive Truth-Seeking Ball | damage | 3 | 4 | 64 | 0 | 0 | 112 | 4.514 | dano_outlier_alto, indice_poder_outlier_alto |
| Gyūki | Bijūdama | damage | 2 | 3 | 62 | 0 | 0 | 108.5 | 4.332 | dano_outlier_alto, indice_poder_outlier_alto |
| Naruto Uzumaki — Hokage | Fūton: Rasenshuriken | damage | 3 | 3 | 58 | 0 | 0 | 101.5 | 3.969 | dano_outlier_alto, indice_poder_outlier_alto |
| Shukaku | Liberação Total de Shukaku | damage | 2 | 3 | 58 | 0 | 0 | 101.5 | 3.969 | dano_outlier_alto, indice_poder_outlier_alto |
| Toneri Ōtsutsuki | Golden Wheel Reincarnation Explosion | damage | 2 | 3 | 58 | 0 | 0 | 101.5 | 3.969 | dano_outlier_alto, indice_poder_outlier_alto |
| Rock Lee | Lótus Oculta | damage | 2 | 0 | 100 | 0 | 0 | 100 | 3.891 | dano_outlier_alto, eficiencia_dano_outlier_alta, indice_poder_outlier_alto |
| Shikamaru Nara | Final Explosion | damage | 2 | 3 | 100 | 0 | 0 | 100 | 3.891 | dano_outlier_alto, indice_poder_outlier_alto |
| White Snake Orochimaru | Eight-Headed Serpent | stun | 2 | 3 | 20 | 0 | 63 | 98 | 3.788 | indice_poder_outlier_alto |
| Jigen | Daikokuten | damage | 2 | 3 | 50 | 0 | 0 | 87.5 | 3.243 | dano_outlier_alto, indice_poder_outlier_alto |
| Isshiki Ōtsutsuki | Daikokuten | damage | 2 | 2 | 48 | 0 | 0 | 84 | 3.061 | dano_outlier_alto, indice_poder_outlier_alto |
| Jirōbō | Earth Dome Prison | shield | 3 | 6 | 0 | 82.688 | 0 | 82.688 | 2.993 |  |
| Zaku Abumi | Supersonic Slicing Wave | damage | 3 | 0 | 45 | 0 | 0 | 78.75 | 2.789 | dano_outlier_alto |
| Momoshiki Ōtsutsuki | Inukaitakerunomikoto | damage | 2 | 2 | 44 | 0 | 0 | 77 | 2.698 | dano_outlier_alto |
| Might Guy | Asakujaku | stun | 2 | 0 | 60 | 0 | 12 | 72 | 2.439 | dano_outlier_alto, eficiencia_dano_outlier_alta, controle_forte_sem_cooldown |
| Kitsuchi | Sandwiching Mountain | stun | 2 | 2 | 45 | 0 | 24 | 69 | 2.283 | dano_outlier_alto |
| Izumo and Kotetsu | Devastate | damage | 1 | 2 | 65 | 0 | 0 | 65 | 2.075 | dano_outlier_alto, descricao_mecanica_revisar, duracao_nao_aparece_no_texto |
| Izumo and Kotetsu | Annihilate | damage | 1 | 2 | 65 | 0 | 0 | 65 | 2.075 | dano_outlier_alto, descricao_mecanica_revisar, duracao_nao_aparece_no_texto |
| Might Guy | Severe Leaf Hurricane | damage | 2 | 0 | 60 | 0 | 0 | 60 | 1.816 | dano_outlier_alto, eficiencia_dano_outlier_alta |
| Sasuke Uchiha | Kirin | damage | 0 | 0 | 60 | 0 | 0 | 60 | 1.816 | dano_outlier_alto, eficiencia_dano_outlier_alta, efeito_relevante_sem_custo |
| Shukaku Gaara | Wind Bullet | damage | 2 | 1 | 60 | 0 | 0 | 60 | 1.816 | dano_outlier_alto |
| Fukasaku and Shima | Demonic Illusion: Gamarinsho | stun | 1 | 0 | 10 | 0 | 42 | 59.5 | 1.79 | controle_forte_sem_cooldown |
| Konohamaru Sarutobi — Sensei | Shuriken Kage Bunshin no Jutsu | damage | 2 | 2 | 34 | 0 | 0 | 59.5 | 1.79 |  |
| Kiba Inuzuka | Man-Beast Clone | stun | 1 | 4 | 10 | 0 | 48 | 58 | 1.712 |  |
| Kaguya Ōtsutsuki | Tomogoroshi no Haikotsu | stun | 2 | 2 | 46 | 0 | 12 | 58 | 1.712 | dano_outlier_alto |
| Naruto Uzumaki | Rasengan | stun | 2 | 1 | 45 | 0 | 12 | 57 | 1.66 | dano_outlier_alto |
| Demon Brothers | Chain Shred | stun | 1 | 0 | 45 | 0 | 12 | 57 | 1.66 | dano_outlier_alto, eficiencia_dano_outlier_alta, controle_forte_sem_cooldown |
| Puppet Master Kankurō | Kuroari Trap | invuln | 1 | 5 | 0 | 56.25 | 0 | 56.25 | 1.621 | invulnerabilidade_multiturno_revisar |
| Oboro | Underground Move | stun | 2 | 0 | 20 | 0 | 21 | 56 | 1.608 | controle_forte_sem_cooldown |
| Shikaku Nara | Shadow Dispersion | stun | 1 | 0 | 20 | 0 | 21 | 56 | 1.608 | controle_forte_sem_cooldown |
| Boruto Uzumaki | Fūton: Reppūshō | damage | 1 | 1 | 32 | 0 | 0 | 56 | 1.608 |  |
| Konohamaru Sarutobi — Sensei | Katon: Gōkakyū no Jutsu | damage | 1 | 1 | 32 | 0 | 0 | 56 | 1.608 |  |
| Jirōbō | Summoning: Earth Prison Golem | shield | 2 | 4 | 0 | 55.125 | 0 | 55.125 | 1.563 |  |
| Naruto Uzumaki — Hokage | Chō Ōdama Rasengan | damage | 2 | 2 | 55 | 0 | 0 | 55 | 1.557 | dano_outlier_alto |
| Regimental Commander Gaara | Mother's Embrace | shield | 2 | 4 | 0 | 54 | 0 | 54 | 1.505 |  |
| Ameyuri Ringo | Thunder Gate | damage | 2 | 4 | 30 | 0 | 0 | 52.5 | 1.427 |  |
| Haku | Thousand Needles of Death | damage | 2 | 0 | 30 | 0 | 0 | 52.5 | 1.427 |  |
| Mitsuki | Fūton: Toppa | damage | 2 | 2 | 30 | 0 | 0 | 52.5 | 1.427 |  |
| Jūgo | Piston Fist | stun | 2 | 0 | 40 | 0 | 12 | 52 | 1.401 | controle_forte_sem_cooldown |
| Kiba Inuzuka | Tail Chasing Rotating Fang | stun | 3 | 4 | 40 | 0 | 12 | 52 | 1.401 |  |
| Momoshiki Ōtsutsuki | Takamimusubinokami | damage | 2 | 2 | 52 | 0 | 0 | 52 | 1.401 | dano_outlier_alto |
| Matatabi | Investida da Matatabi | damage | 2 | 2 | 52 | 0 | 0 | 52 | 1.401 | dano_outlier_alto |
| Tobirama Senju | Water Shockwave | stun | 2 | 3 | 15 | 0 | 36 | 51 | 1.349 |  |
| White Snake Orochimaru | Immortality Transference | stun | 2 | 3 | 15 | 0 | 36 | 51 | 1.349 |  |
| Kakashi Hatake | Lightning Blade | damage | 2 | 1 | 50 | 0 | 0 | 50 | 1.297 | dano_outlier_alto |
| Itachi Uchiha | Amaterasu | dot | 2 | 1 | 0 | 0 | 0 | 0 | -1.297 | descricao_mecanica_revisar, texto_indica_dano_mas_kind_nao_ofensivo |
| Jiraiya | Major Summoning: Gamabunta | dot | 3 | 0 | 0 | 0 | 0 | 0 | -1.297 | descricao_mecanica_revisar, texto_indica_dano_mas_kind_nao_ofensivo |

## Arquivos produzidos

- `CHARACTERS.json`: levantamento de cada personagem.
- `JUTSUS.json`: cada jutsu, descrição, custo, cooldown, dano, mecânica e efeitos.
- `CHARACTER-JUTSU-MAP.json`: linkagem completa personagem↔jutsu.
- `CHARACTER-BALANCE.json`: comparação agregada de cada kit.
- `DUPLICATE-JUTSU-NAMES.json`: técnicas de mesmo nome usadas por múltiplos personagens/versões.
- `SUMMARY.json`: contagens, tipos mecânicos e metodologia.

## Próximo gate antes de alterar números

1. Comparar jutsus com o repositório canônico Naruto Unison quando houver correspondência pelo nome original.
2. Confirmar no motor como dano, defesa, invulnerabilidade, alvo, AoE, duração, requisitos e chakra são resolvidos.
3. Rodar matriz personagem×personagem com sementes reproduzíveis e várias políticas de IA.
4. Medir win rate, TTK, dano, chakra restante, controle e taxa de uso por jutsu.
5. Corrigir primeiro inconsistências descrição↔mecânica; depois números em lotes pequenos; repetir a matriz após cada lote.
