# Metodologia de balanceamento — Naruto Unison

## Objetivo

Balancear o roster sem alterar números por impressão subjetiva. O processo separa quatro problemas diferentes:

1. **correção de dados** — personagem, jutsu, descrição, custo, cooldown, alvo e efeito;
2. **correção de motor** — garantir que cliente, simulador e backend autoritativo resolvam a mesma mecânica;
3. **balanceamento numérico** — dano, cura, escudo, duração, custo e cooldown;
4. **balanceamento de meta** — diversidade, matchups, ordem de ação, políticas e composição 3x3.

Uma técnica com mecânica errada nunca deve ser "balanceada" apenas mudando seu dano.

## Fontes de metodologia pesquisadas

### Naruto Unison canônico

- https://github.com/naruto-unison/naruto-unison
- Uso: referência primária para identidade dos personagens, técnicas, custos, cooldowns e semântica original quando houver correspondência.
- Regra: não copiar mecanicamente valores que dependam de um motor diferente; primeiro traduzir a semântica para o motor atual.

### Kalivra — DevBawky

- https://github.com/DevBawky/Kalivra
- Padrões aproveitados: Monte Carlo, distribuição de resultados, TTK, intervalos de confiança, logs explicáveis e tuning reversível.
- Aplicação no projeto: seeds reproduzíveis, IC95, duração média de batalha, separação entre medição e alteração.

### Metagame Balance — Niantic Labs

- https://github.com/nianticlabs/metagame-balance
- Padrão aproveitado: tratar diversidade do meta como objetivo explícito, não apenas aproximar cada win-rate de 50%.
- Aplicação no projeto: entropia de Shannon normalizada, HHI, roster efetivo e concentração Top-N como proxies de concentração de força.

### Reinforce Tactics

- https://github.com/kuds/reinforce-tactics
- Padrões aproveitados: round-robin, múltiplas políticas/agentes, self-play e rating comparável.
- Aplicação no projeto: duelos completos espelhados, políticas `balanced`, `aggressive`, `control`, `support` e Elo-equivalente apenas para comparação.

### OpenSpiel — Google DeepMind

- https://github.com/google-deepmind/open_spiel
- Padrões aproveitados: matriz de resultados, avaliação de políticas e exploitability.
- Aplicação no projeto: matriz de matchups, pior matchup, sensibilidade a política e prioridade de exploitability.

### Sorting-Battle

- https://github.com/chocola-mint/Sorting-Battle
- Padrão aproveitado: paridade entre o ambiente usado para treinar/testar e o game core.
- Aplicação no projeto: `tools/simulate-balance.mjs` deve reproduzir a semântica de `app-online.js`; probes contra `naruto-api` validam a parte autoritativa observável.

## Pipeline atual

### 1. Inventário estático

Fonte: `tools/audit-balance.mjs`.

Produz:

- `CHARACTERS.json`
- `JUTSUS.json`
- `CHARACTER-JUTSU-MAP.json`
- `CHARACTER-BALANCE.json`
- `DUPLICATE-JUTSU-NAMES.json`
- `BALANCE-REPORT.md`

Gate mínimo atual:

- 209 personagens;
- 4 jutsus por personagem;
- 836 jutsus;
- 836 vínculos personagem↔jutsu.

### 2. Semântica do runtime

O modelo atualmente comprovado considera:

- 100 PV base;
- 6 chakra inicial;
- +3 chakra por turno;
- máximo 8 por tipo e 24 total;
- dano com variação aproximada de ±10%;
- DoT: dano inicial + 7 por tick;
- stun: dano inicial + perda de ação pela duração;
- heal: cura pelo `power`;
- shield: pool de absorção; duração expira depois da fase adversária;
- invulnerability: bloqueia hit/DoT e expira depois da fase adversária;
- AoE: aplica aos alvos vivos elegíveis;
- cooldown decrementa no tick do turno.

### 3. Simulação reproduzível

Fonte: `tools/simulate-balance.mjs`.

Padrão principal:

- round-robin 1x1 completo;
- ordem espelhada;
- quatro políticas;
- seeds reproduzíveis;
- 30.000 batalhas 3x3 aleatórias por execução padrão;
- até 35 turnos;
- métricas por personagem e jutsu.

Produz:

- `CHARACTER-SIMULATION.json`
- `JUTSU-SIMULATION.json`
- `UNUSED-JUTSUS.json`
- `SIMULATION-SUMMARY.json`
- `SIMULATION-REPORT.md`

### 4. Meta-balance

Fonte: `tools/meta-balance-analysis.mjs`.

Mede:

- win-rate 1x1 e 3x3;
- IC95;
- Elo-equivalente;
- diferença entre agir primeiro/segundo;
- variação entre políticas;
- gap entre duelo e equipe;
- pior matchup;
- entropia normalizada;
- HHI;
- roster efetivo;
- concentração Top 5/10/25;
- prioridade de intervenção.

Classificações:

- `NERF_CANDIDATE`
- `BUFF_CANDIDATE`
- `TEAM_ROLE_SYNERGY_REVIEW`
- `TURN_ORDER_REVIEW`
- `POLICY_ROBUSTNESS_REVIEW`
- `MATCHUP_EXPLOITABILITY_REVIEW`
- `HOLD`

Nenhuma classificação altera o roster automaticamente.

## Ordem obrigatória para cada personagem

1. Confirmar identidade/versão do personagem.
2. Confirmar seus quatro jutsus.
3. Conferir nome original e ligação personagem↔jutsu.
4. Conferir descrição em PT-BR.
5. Conferir `mechanic.kind`.
6. Conferir `target`, `aoe` e `duration`.
7. Conferir `power`, custo e cooldown.
8. Comparar com a referência canônica quando existir.
9. Se o efeito canônico não couber no motor atual, classificar como **MOTOR_INSUFICIENTE** em vez de aproximar silenciosamente.
10. Só depois avaliar buff/nerf numérico.
11. Reexecutar simulação e meta-balance após cada lote.

## Critério de intervenção

### Buff/Nerf

A indicação depende de múltiplas evidências. Win-rate sozinho não basta.

- 3x3 é o sinal principal do modo padrão;
- 1x1 detecta one-shot, locks e extremos individuais;
- IC95 evita reagir demais a amostra pequena;
- gap de ordem identifica problema sistêmico;
- gap de política identifica fragilidade da IA/estratégia;
- pior matchup detecta exploitability;
- concentração do meta mede se poucos personagens dominam o conjunto.

### Ordem de ação

Quando a anomalia vier da ordem de ação, corrigir primeiro a regra global. Não compensar com dano individual.

### Mecânica incorreta

Prioridade superior a balanceamento numérico. Exemplos já identificados incluem técnicas compostas/debuffs que foram comprimidas nos tipos simples atuais.

### Mudança numérica

Fazer em lotes pequenos e reversíveis. Para cada lote registrar:

- valor anterior;
- motivo;
- evidência canônica;
- evidência de simulação;
- valor novo;
- resultado pós-mudança;
- regressões.

## Limitação autoritativa atual

`naruto-api` está ativo no Supabase e seu comportamento pode ser provado por contrato, mas sua fonte canônica ainda não está versionada em `supabase/functions/naruto-api` no `main`. Portanto:

- não publicar uma reconstrução aproximada por cima do runtime vivo;
- qualquer mudança que altere semântica autoritativa precisa de fonte recuperada/versionada ou de uma estratégia explícita de substituição testada;
- mudanças somente de apresentação/dados do cliente não podem ser tratadas como balanceamento online concluído até haver prova de paridade no backend.
