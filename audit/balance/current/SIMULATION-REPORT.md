# Simulação de balanceamento — runtime atual

Gerado em: 2026-08-25T23:47:44.638Z

## Modelo aplicado

- 209 personagens, 4 jutsus por personagem.
- Duelo 1x1 completo entre pares, espelhando a ordem de ação e repetindo as políticas balanced, aggressive, control, support.
- 30000 batalhas 3x3 com equipes aleatórias sem repetição e políticas variadas.
- 100 PV base, 6 chakras iniciais, +3 por turno, dano ±10%, DOT 7/tick e cooldown/escudo/invulnerabilidade conforme app-online.js.
- Sem equipamentos, itens, bônus de dificuldade, história ou boss: o objetivo é isolar o kit do personagem.
- 10 jutsus nunca foram selecionados pelas quatro políticas; eles permanecem no inventário com uso zero para auditoria.

## Mais fortes no 3x3 simulado

| Personagem | Win 3x3 | IC95 | Win duelo | 1º age | 2º age | Flags |
|---|---:|---|---:|---:|---:|---|
| Kushimaru Kuriarare | 89.2% | 86.9–91.1% | 64.1% | 70.9% | 57.4% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Fukasaku and Shima | 87.4% | 85.0–89.5% | 87.1% | 94.8% | 79.3% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Oboro | 83.3% | 80.7–85.6% | 78.3% | 85.6% | 71.0% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| White Snake Orochimaru | 81.0% | 78.2–83.5% | 92.0% | 98.9% | 85.2% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Shikaku Nara | 80.0% | 77.2–82.6% | 60.4% | 71.3% | 49.5% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Tsume Inuzuka | 75.9% | 72.9–78.6% | 91.7% | 99.5% | 84.0% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Sasuke Uchiha | 75.8% | 72.7–78.5% | 86.1% | 92.4% | 79.7% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Sage Mode Naruto | 75.0% | 72.0–77.8% | 91.4% | 98.9% | 83.9% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Shikamaru Nara | 74.8% | 71.7–77.6% | 52.5% | 61.9% | 43.1% | team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Shukaku | 74.4% | 71.4–77.1% | 88.0% | 95.0% | 81.1% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Kurama | 72.6% | 69.5–75.4% | 82.7% | 90.4% | 75.1% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Shikamaru Nara | 71.4% | 68.4–74.3% | 88.9% | 95.7% | 82.1% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Hanabi Hyūga | 70.3% | 67.2–73.2% | 89.2% | 96.7% | 81.8% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Izumo and Kotetsu | 69.8% | 66.7–72.6% | 89.4% | 96.8% | 82.1% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Dodai | 69.7% | 66.4–72.7% | 89.7% | 97.1% | 82.3% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Tayuya | 69.3% | 66.0–72.3% | 36.4% | 40.4% | 32.5% | duel_winrate_baixo, team_winrate_alto, matchup_muito_exploravel |
| Zaku Abumi | 67.7% | 64.6–70.8% | 57.7% | 63.9% | 51.5% | team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Chūkichi | 67.3% | 64.1–70.3% | 54.4% | 59.6% | 49.1% | team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Jigen | 66.1% | 62.8–69.2% | 88.6% | 95.3% | 81.9% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Young Kakashi | 65.1% | 61.8–68.3% | 87.6% | 95.1% | 80.2% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Kakuzu | 64.5% | 61.2–67.5% | 85.3% | 92.1% | 78.4% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Gyūki | 64.1% | 60.8–67.2% | 76.1% | 82.6% | 69.6% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Demon Brothers | 63.8% | 60.6–66.9% | 86.0% | 94.4% | 77.6% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Might Guy | 63.4% | 60.1–66.7% | 82.1% | 90.7% | 73.4% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Ino Yamanaka | 62.9% | 59.6–66.1% | 84.4% | 92.6% | 76.3% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |

## Mais fracos no 3x3 simulado

| Personagem | Win 3x3 | IC95 | Win duelo | Flags |
|---|---:|---|---:|---|
| Haku | 12.3% | 10.3–14.7% | 1.7% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Masked Man | 21.3% | 18.7–24.1% | 7.2% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Ino Yamanaka | 25.6% | 22.8–28.6% | 10.5% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Haku | 27.5% | 24.6–30.6% | 3.4% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Zabuza Momochi | 29.5% | 26.6–32.7% | 4.5% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Torune Aburame | 29.6% | 26.7–32.8% | 1.1% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Puppet Master Kankurō | 29.8% | 26.9–32.8% | 11.8% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Tsunade | 30.2% | 27.2–33.3% | 4.2% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Suigetsu Hōzuki | 31.3% | 28.2–34.4% | 39.1% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, sensivel_a_politica, matchup_muito_exploravel |
| Rasa | 31.7% | 28.7–34.8% | 16.2% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Mei Terumi | 31.8% | 28.8–34.9% | 10.2% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Sasori | 31.9% | 28.8–35.2% | 4.0% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Hiruzen Sarutobi | 32.0% | 29.1–35.1% | 45.2% | team_winrate_baixo, matchup_muito_exploravel |
| Danzō Shimura | 32.1% | 29.1–35.3% | 16.3% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Ittan | 32.3% | 29.4–35.3% | 27.5% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Konohamaru Sarutobi | 32.5% | 29.4–35.6% | 16.9% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Toroi | 32.5% | 29.5–35.6% | 1.4% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Kidōmaru | 32.6% | 29.6–35.7% | 38.8% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Hashirama Senju | 33.5% | 30.5–36.7% | 25.8% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Konohamaru Sarutobi | 33.6% | 30.4–36.9% | 7.1% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Kimimaro | 34.0% | 30.9–37.2% | 42.4% | team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Rock Lee | 34.1% | 31.0–37.3% | 6.5% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Kiba Inuzuka | 34.1% | 31.1–37.3% | 19.6% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Regimental Commander Gaara | 34.2% | 31.1–37.4% | 13.1% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Mizuki | 34.3% | 31.3–37.6% | 13.3% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |

## Interpretação

- **Win 3x3** é o sinal principal para o modo padrão; duelo serve para detectar one-shot, travas e matchups extremos.
- **1º age / 2º age** mede a assimetria do runtime: escudo/invulnerabilidade de duração curta podem ter valor muito diferente conforme a ordem.
- **Pior matchup** em CHARACTER-SIMULATION.json funciona como proxy de exploitability: um personagem pode ter média aceitável e ainda ser facilmente anulável por determinados kits.
- JUTSU-SIMULATION.json registra uso e resultado efetivo por técnica, inclusive dano contínuo, cura, escudo, stun e KOs.
- UNUSED-JUTSUS.json lista técnicas que as políticas simuladas nunca consideraram melhores do que as alternativas disponíveis.

## Arquivos

- SIMULATION-SUMMARY.json
- CHARACTER-SIMULATION.json
- JUTSU-SIMULATION.json
- UNUSED-JUTSUS.json
- SIMULATION-REPORT.md
