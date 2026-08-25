# Simulação de balanceamento — runtime atual

Gerado em: 2026-08-25T23:40:44.079Z

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
| Kushimaru Kuriarare | 88.3% | 86.0–90.3% | 60.7% | 75.4% | 46.1% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Fukasaku and Shima | 85.4% | 82.9–87.6% | 84.7% | 95.0% | 74.4% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| White Snake Orochimaru | 82.6% | 79.9–85.0% | 92.0% | 98.9% | 85.2% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Oboro | 82.5% | 79.8–84.9% | 75.1% | 86.8% | 63.5% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Shikaku Nara | 80.4% | 77.5–83.0% | 61.1% | 72.7% | 49.5% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Sasuke Uchiha | 76.1% | 73.1–78.9% | 86.1% | 92.7% | 79.5% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Sage Mode Naruto | 75.0% | 72.0–77.8% | 91.4% | 98.9% | 83.9% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Tsume Inuzuka | 74.9% | 71.9–77.7% | 91.4% | 99.5% | 83.2% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Shukaku | 74.4% | 71.4–77.1% | 88.0% | 95.2% | 80.8% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Kurama | 73.8% | 70.8–76.7% | 82.9% | 90.9% | 75.0% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Shikamaru Nara | 73.8% | 70.6–76.7% | 51.2% | 67.8% | 34.6% | team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Tayuya | 70.6% | 67.4–73.6% | 38.0% | 48.4% | 27.6% | duel_winrate_baixo, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Izumo and Kotetsu | 70.4% | 67.4–73.3% | 89.5% | 96.8% | 82.1% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Shikamaru Nara | 70.1% | 67.0–73.0% | 88.4% | 95.7% | 81.0% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Hanabi Hyūga | 68.6% | 65.5–71.5% | 88.7% | 96.8% | 80.7% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Zaku Abumi | 68.4% | 65.3–71.4% | 58.7% | 72.2% | 45.1% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Chūkichi | 66.9% | 63.7–70.0% | 48.0% | 67.9% | 28.0% | team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Dodai | 66.5% | 63.1–69.7% | 88.8% | 97.1% | 80.5% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Jigen | 66.2% | 62.9–69.3% | 88.4% | 95.4% | 81.4% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Demon Brothers | 65.2% | 62.0–68.3% | 86.1% | 94.5% | 77.6% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Zetsu | 64.6% | 61.3–67.8% | 26.4% | 34.8% | 18.1% | duel_winrate_baixo, team_winrate_alto, sensivel_a_ordem_de_acao, sensivel_a_politica, matchup_muito_exploravel |
| Young Kakashi | 64.3% | 61.0–67.5% | 87.0% | 95.5% | 78.4% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Gyūki | 64.2% | 60.9–67.3% | 76.2% | 84.1% | 68.3% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Ino Yamanaka | 63.6% | 60.3–66.8% | 84.5% | 92.9% | 76.1% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao |
| Kakuzu | 63.5% | 60.3–66.6% | 85.4% | 92.5% | 78.3% | duel_winrate_alto, team_winrate_alto, sensivel_a_ordem_de_acao, matchup_muito_exploravel |

## Mais fracos no 3x3 simulado

| Personagem | Win 3x3 | IC95 | Win duelo | Flags |
|---|---:|---|---:|---|
| Haku | 13.2% | 11.1–15.7% | 1.2% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Masked Man | 22.8% | 20.2–25.7% | 7.6% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Ino Yamanaka | 27.5% | 24.7–30.6% | 14.6% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Puppet Master Kankurō | 30.1% | 27.2–33.2% | 13.0% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Torune Aburame | 30.1% | 27.1–33.3% | 1.5% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Haku | 30.2% | 27.2–33.4% | 3.4% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Zabuza Momochi | 30.5% | 27.5–33.6% | 4.9% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Tsunade | 31.4% | 28.4–34.6% | 3.9% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Konohamaru Sarutobi | 32.6% | 29.5–35.9% | 10.0% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Sasori | 32.6% | 29.5–35.9% | 3.9% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Ittan | 32.9% | 30.0–35.9% | 25.8% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Konohamaru Sarutobi | 33.0% | 30.0–36.2% | 17.8% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Suigetsu Hōzuki | 33.3% | 30.2–36.5% | 36.8% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, sensivel_a_politica, matchup_muito_exploravel |
| Hiruzen Sarutobi | 33.4% | 30.5–36.6% | 47.2% | team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Mei Terumi | 33.5% | 30.4–36.7% | 11.5% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Rasa | 33.6% | 30.5–36.7% | 20.5% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Toroi | 33.9% | 30.9–37.1% | 1.6% | duel_winrate_baixo, team_winrate_baixo, matchup_muito_exploravel |
| Hinata Hyūga | 34.2% | 31.1–37.5% | 17.8% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Danzō Shimura | 34.4% | 31.2–37.6% | 18.5% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Kimimaro | 34.4% | 31.4–37.6% | 46.2% | team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Kidōmaru | 34.7% | 31.6–37.8% | 41.3% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Hashirama Senju | 34.9% | 31.8–38.1% | 24.9% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Rock Lee | 35.0% | 31.9–38.2% | 9.3% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Kiba Inuzuka | 35.0% | 32.0–38.3% | 23.3% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, matchup_muito_exploravel |
| Aoba Yamashiro | 35.4% | 32.3–38.6% | 28.7% | duel_winrate_baixo, team_winrate_baixo, sensivel_a_ordem_de_acao, sensivel_a_politica, matchup_muito_exploravel |

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
