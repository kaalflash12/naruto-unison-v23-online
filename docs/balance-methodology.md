# Naruto Unison — Metodologia de balanceamento

## Objetivo

Balancear os 209 personagens e 836 jutsus sem substituir o comportamento real do jogo por médias abstratas. O balanceamento só é aprovado quando cadastro, motor, simulação e referência canônica apontam na mesma direção.

## Fontes metodológicas aplicadas

### DevBawky/Kalivra

Repositório: https://github.com/DevBawky/Kalivra

Aplicado ao Naruto Unison:
- Monte Carlo em vez de uma única luta;
- TTK/turnos até resolução;
- intervalos de confiança de win rate;
- identificação de outliers e caudas;
- mudanças reversíveis e comparáveis por versão;
- decisão explicável, não apenas "parece forte".

Não aplicado diretamente:
- fórmulas, pesos ou números de outro jogo.

### genshinsim/gcsim

Repositório: https://github.com/genshinsim/gcsim

Aplicado ao Naruto Unison:
- simulador deve reproduzir primeiro a semântica real do combate;
- configurações e seeds reproduzíveis;
- análise por distribuição e não apenas média;
- técnicas, efeitos, custo, cooldown e sequência de ações precisam ser validados contra o runtime.

Não aplicado diretamente:
- DPS/frames de Genshin, porque Naruto Unison é um sistema de turnos 3×3.

### google-deepmind/open_spiel

Repositório: https://github.com/google-deepmind/open_spiel

Aplicado ao Naruto Unison:
- não testar um personagem apenas contra uma política de IA;
- medir sensibilidade contra políticas `balanced`, `aggressive`, `control`, `support` e `focus`;
- usar um proxy de explorabilidade: diferença entre o melhor e o pior win rate contra essas políticas.

Importante:
- o campo `exploitabilityProxy` do Naruto Unison NÃO é NashConv formal e não deve ser apresentado como tal.

### Simuladores Monte Carlo de combate

Princípio aplicado:
- win rate sozinho é insuficiente;
- também medir duração, PV/escudo restante, chakra restante, uso de jutsus e viés de iniciativa.

## Semântica obrigatória do motor

O simulador deve acompanhar `app-online.js`:

- Chakra: `Blood`, `Gen`, `Nin`, `Tai` e custo `Rand`.
- Máximo: 8 por tipo e 24 total.
- Início padrão sem equipamento: 6 chakras.
- Ganho: +3 por turno.
- A geração é ponderada pela demanda de chakra das técnicas da equipe.
- `Rand` é pago com chakra real disponível, priorizando o tipo com maior saldo.
- Dano direto: `power × variação 0,9–1,1`.
- `stun`: dano inicial de `power` + perda de ação pela duração.
- `dot`: dano inicial de `power` + 7 por tick pela duração.
- `heal`: restaura `power` respeitando PV máximo.
- `shield`: `power` é um pool de absorção; duração 0 persiste até consumo.
- `invuln`: bloqueia dano e expira depois da fase adversária correspondente.
- Cooldown é reduzido no tick.
- AoE atinge todos os alvos vivos válidos.

Qualquer divergência entre simulador e runtime invalida o resultado até correção.

## Camadas de auditoria

### 1. Integridade do catálogo

Obrigatório:
- 209 personagens;
- 4 jutsus por personagem;
- 836 jutsus;
- 836 vínculos personagem↔jutsu;
- cada jutsu com nome, custo, cooldown, descrição e mecânica estruturada.

### 2. Descrição versus mecânica

Classificações:
- `CORRETO`;
- `DESCRICAO_INCORRETA`;
- `EFEITO_INCORRETO`;
- `ALVO_INCORRETO`;
- `VALOR_INCORRETO`;
- `MOTOR_INSUFICIENTE`.

`MOTOR_INSUFICIENTE` é usado quando a técnica canônica exige efeito composto/debuff/condição que não cabe em `damage/stun/dot/heal/shield/invuln`. Nesses casos não se aproxima a técnica com um efeito errado apenas para preencher o cadastro.

### 3. Auditoria estática

Comparar:
- dano e dano efetivo por custo/cooldown;
- controle e duração;
- cura;
- escudo;
- invulnerabilidade;
- AoE;
- alvo;
- economia de chakra.

Outlier estático é apenas candidato a investigação.

### 4. Gauntlet 1×1

Todos os pares do elenco são simulados com:
- seeds determinísticas;
- inversão do lado que age primeiro;
- várias políticas adversárias;
- intervalo Wilson 95%.

Métricas:
- win rate;
- IC95;
- TTK;
- PV/escudo restante;
- chakra restante;
- viés de iniciativa;
- sensibilidade à política adversária.

### 5. Monte Carlo 3×3

Equipes aleatórias válidas são simuladas para medir o personagem em contexto de equipe.

Isso evita concluir que um personagem é fraco apenas porque perde duelos, quando seu papel real é suporte/controle, e evita concluir que um personagem é equilibrado no 1×1 quando cria sinergias excessivas no 3×3.

## Banda-alvo e flags

Flags automáticas atuais:
- IC95 inteiro acima de 57%: forte com confiança;
- IC95 inteiro abaixo de 43%: fraco com confiança;
- viés de iniciativa absoluto acima de 8%;
- amplitude por política adversária acima de 25%;
- TTK de duelo abaixo de 3 turnos;
- TTK 3×3 acima de 25 turnos.

Esses limites são triagem inicial e podem ser recalibrados depois da primeira distribuição completa.

## Regra para buff/nerf

Nenhuma mudança numérica é aplicada só por uma flag.

Uma alteração de dano/custo/cooldown/duração exige convergência de pelo menos três evidências:

1. divergência canônica ou mecânica comprovada, OU confirmação de que a técnica está representada corretamente;
2. outlier estático relevante;
3. simulação 1×1 e/ou 3×3 com intervalo de confiança fora da banda-alvo.

Para efeitos incorretos, alvo incorreto ou motor insuficiente, a correção mecânica vem antes do balanceamento numérico.

## Processo após cada alteração

1. atualizar o jutsu/personagem;
2. executar auditoria estática;
3. executar toda a matriz de simulação novamente;
4. comparar antes/depois;
5. rejeitar a mudança se resolver um matchup criando outro outlier maior;
6. registrar justificativa e evidências.

## Arquivos canônicos de análise

- `tools/audit-balance.mjs` — inventário e auditoria estática;
- `tools/simulate-balance.mjs` — simulação 1×1 + 3×3;
- `audit/balance/current/` — catálogo/auditoria;
- `audit/balance/simulation/` — resultados Monte Carlo;
- `.github/workflows/balance-audit.yml` — gate do catálogo;
- `.github/workflows/balance-simulation.yml` — gate estatístico.
