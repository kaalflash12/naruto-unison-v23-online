# Batch 001 — revisão canônica de mecânica

Referência upstream: `naruto-unison/naruto-unison@3f81bcd0de1795c17ce1f8e8d9f9fa51b38af0e1`.

**Regra:** este documento não prescreve buff/nerf numérico enquanto houver divergência de mecânica. Primeiro corrige-se identidade, alvo, tipo, condição e duração; depois repete-se a simulação.

## Legenda

- `CADASTRO_INCORRETO`: campo atual contradiz diretamente o upstream.
- `MOTOR_INSUFICIENTE`: a mecânica original exige recurso que o motor simples atual ainda não representa fielmente.
- `SIMPLIFICACAO_FORTE`: a intenção geral existe, mas perdeu classes, condições ou efeitos compostos relevantes.
- `PROXIMO_DO_CANONICO`: suficiente para não ser o primeiro alvo de correção.

---

## 1. Haku (Reanimated) — BUFF_CANDIDATE

### Thousand Needles of Death

**Atual:** `stun`, power 10, alvo `ally`, AoE, duração 1.

**Canônico:** custa Blood; causa 10 piercing em todos os inimigos. Durante Crystal Ice Mirrors, concentra 30 em um inimigo. O stun de 1 turno só ocorre condicionalmente se o alvo perder pelo menos 50 de vida no mesmo turno.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

- alvo `ally` é incorreto;
- stun não é efeito imediato garantido;
- falta modo alternativo durante Mirrors;
- falta condição por dano acumulado.

### Acupuncture

**Atual:** invulnerabilidade em `self`, AoE, 2 turnos.

**Canônico:** aplica `Silence` por 2 turnos em um inimigo; durante Mirrors passa a atingir todos os inimigos e bypassa invulnerabilidade.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Crystal Ice Mirrors

**Atual:** shield 20 por 3 turnos.

**Canônico:** 20 de defesa destrutível permanente; durante 3 turnos, se a defesa quebrar, pode recuperar defesa equivalente à vida perdida no mesmo turno.

**Diagnóstico:** `SIMPLIFICACAO_FORTE + MOTOR_INSUFICIENTE`.

### Ice Dome

Invulnerabilidade defensiva simples. `PROXIMO_DO_CANONICO`.

**Conclusão do personagem:** não aplicar buff de dano. A taxa de vitória baixa está contaminada por três traduções mecânicas erradas/incompletas.

---

## 2. Masked Man — BUFF_CANDIDATE

### Kusari Chains

**Atual:** invulnerabilidade própria por 1 turno.

**Canônico:** custa Tai, CD2; atinge inimigo, atordoa apenas skills físicas e aplica `Expose` por 1 turno; também marca o usuário como Corporeal.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Kamui Banishment

**Atual:** Blood+Gen, dano 20 simples em inimigo.

**Canônico:** custo Gen, CD1; 20 piercing, `Alone` + `Taunt` por 1 turno; se Kusari Chains estiver ativo, +20 dano e +1 turno.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Major Summoning: Kurama

**Atual:** dano 25 em aliados, AoE, duração 3.

**Canônico:** Blood+Gen+Tai, CD5, 3 turnos; demole defesa destrutível da equipe inimiga e a própria barreira do Masked Man, depois causa 25 a um inimigo aleatório por turno.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Kamui Phase

**Atual:** invuln self 1, CD4.

**Canônico:** invuln self 1, CD0, mas só pode ser usado se nenhuma skill foi usada no turno anterior (`Corporeal`).

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

**Conclusão:** não buffar numericamente. O kit atual praticamente não representa o original.

---

## 3. Haku (base) — BUFF_CANDIDATE

### Thousand Needles of Death

**Atual:** damage 30 enemy AoE sempre.

**Canônico:** 30 em um inimigo; somente durante Crystal Ice Mirrors passa a atingir todos os inimigos.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Acupuncture

**Atual:** stun 10 em aliados, AoE, 1 turno.

**Canônico:** se usado em inimigo, stun 1; se usado em aliado, cura stuns/disables e concede imunidade a stun/disables por 1 turno; durante Mirrors, alcança todos aliados e inimigos.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Crystal Ice Mirrors

**Atual:** invuln self por 3 turnos.

**Canônico:** invulnerabilidade própria por 3 turnos.

**Diagnóstico:** `PROXIMO_DO_CANONICO`.

### Parry

Defesa padrão. `PROXIMO_DO_CANONICO`.

**Conclusão:** a fraqueza não justifica buff bruto antes de corrigir Thousand Needles e Acupuncture.

---

## 4. Torune Aburame — BUFF_CANDIDATE

### Nano-Sized Venomous Beetles

**Atual:** DoT 5 em `self` por 5 turnos.

**Canônico:** aplica Afflict 5 por 5 turnos a um inimigo e dá 15 de defesa destrutível permanente a Torune; quem quebra essa defesa recebe Venomous Beetle. Enquanto a defesa existe, custo muda e a defesa não é reaplicada.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Jar of Poison

**Atual:** DoT 5 em `self` por 5 turnos.

**Canônico:** aplica o veneno a todos os inimigos e dá 30 de defesa permanente a Torune, com o mesmo gatilho de quebra e custo condicional.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Venom Explosion

**Atual:** damage 25 em inimigo.

**Canônico:** requer ao menos um Venomous Beetle e depleta 1 chakra aleatório por stack; não é ataque de 25 de dano.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Dodge

`PROXIMO_DO_CANONICO`.

**Conclusão:** não buffar dano. O personagem perdeu quase toda a economia de stacks/defesa/chakra.

---

## 5. Ino Yamanaka — BUFF_CANDIDATE

### Mind Destruction

**Atual:** damage 25 imediato em inimigo.

**Canônico:** prepara controle por 2 turnos; no turno seguinte causa 15. Se o alvo usar uma skill contra Ino/equipe, ela é counterada e Mind Destruction é temporariamente substituída pela skill copiada.

**Diagnóstico:** `SIMPLIFICACAO_FORTE + MOTOR_INSUFICIENTE`.

### Proxy Surveillance

**Atual:** damage 25 em aliados, AoE, 3 turnos.

**Canônico:** controle por 3 turnos; revela efeitos invisíveis/cooldowns e reduz em 15 a eficácia de redução de dano, defesa destrutível e barreira do time inimigo.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Mind Transfer Clone

**Atual:** damage 25 em inimigo por 2 turnos.

**Canônico:** durante 2 turnos os aliados de Ino ignoram status negativos não-danosos.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Hide

`PROXIMO_DO_CANONICO`.

**Conclusão:** o baixo win-rate é estrutural; três skills de controle/suporte viraram dano genérico.

---

## 6. Fukasaku and Shima — NERF_CANDIDATE

### Frog Song

**Atual:** Nin, damage 25, enemy, duração 2.

**Canônico:** custo Rand, CD1; 20 de affliction por 2 turnos e aumenta o custo de todas as skills do alvo em 1 chakra arbitrário.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Sand Dust

**Atual:** invulnerabilidade própria total por 1.

**Canônico:** todos os aliados ficam invulneráveis apenas a skills `Ranged` por 1 turno.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Demonic Illusion: Gamarinsho

**Atual:** stun 10 AoE por 2 turnos em todos os inimigos, disponível imediatamente.

**Canônico:** cada uso acumula Harmony; somente no terceiro uso consecutivo todos os inimigos são atordoados por 2 turnos. O uso cancela stuns anteriores da mesma técnica. Não há dano direto de 10 no efeito canônico.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE` — prioridade crítica.

### Reverse Summoning

`PROXIMO_DO_CANONICO`.

**Conclusão:** o nerf correto é restaurar a condição de três usos e as mecânicas originais, não simplesmente reduzir `power`.

---

## 7. White Snake Orochimaru — NERF_CANDIDATE

### Regenerative Bite

**Atual:** damage 25.

**Canônico:** drena 35 de vida do inimigo e cura Orochimaru pelo dano drenado; depois de adquirir novo corpo transforma-se em Kusanagi.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Kusanagi

A versão atual usa damage 30. O efeito ofensivo básico está próximo do alternate canônico, mas a transformação/estado que o disponibiliza não é representada fielmente.

**Diagnóstico:** `SIMPLIFICACAO_FORTE`.

### Immortality Transference

**Atual:** stun genérico + dano 15 por 3 turnos.

**Canônico:** 15 de dano por 3 turnos e stun apenas de skills físicas/chakra; se o alvo morrer durante o efeito, Orochimaru recupera toda a vida; depois da aquisição de corpo transforma-se em Eight-Headed Serpent.

**Diagnóstico:** `SIMPLIFICACAO_FORTE + MOTOR_INSUFICIENTE`.

### Eight-Headed Serpent

**Atual:** stun 20 AoE por 3 turnos.

**Canônico:** 20 de dano a todos os inimigos por 3 turnos; Orochimaru ignora stuns/disables e quem o stunar sofre 20 de dano e stun 1.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE` — o stun AoE contínuo atual é muito mais opressivo que o original.

**Conclusão:** candidato a correção mecânica severa antes de qualquer nerf de valores.

---

## 8. Kushimaru Kuriarare — NERF_CANDIDATE

### Needle Stitching

**Atual:** damage 20 em inimigo, duração 1.

**Canônico:** 20 piercing, impede o alvo de afetar Kushimaru por 1 turno; ganha +5 dano por pessoa já afetada e prolonga o efeito nos demais; não pode ser usado em alvo já afetado.

**Diagnóstico:** `SIMPLIFICACAO_FORTE + MOTOR_INSUFICIENTE`.

### Eviscerate

**Atual:** Nin+Nin, damage 20 AoE.

**Canônico:** Rand+Rand, CD3, 20 piercing AoE e prolonga Needle Stitching/Wire Crucifixion em 1 turno.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Wire Crucifixion

**Atual:** custo zero; damage/stun 15 AoE em todos os inimigos.

**Canônico:** só afeta inimigos já marcados por Needle Stitching; causa 15 e stun 1; alvos ficam expostos; custo é 1 chakra arbitrário por Needle Stitching ativo.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE` — prioridade crítica.

### Block

`PROXIMO_DO_CANONICO`.

**Conclusão:** o atual Wire Crucifixion gratuito e incondicional explica parte substancial do excesso de força.

---

## 9. Oboro — NERF_CANDIDATE

### Exploding Kunai

**Atual:** Nin+Nin, 15 damage AoE.

**Canônico:** Rand+Rand, 15 damage AoE; durante Fog Clone custa apenas Rand.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE` apenas em custo condicional; dano/alvo próximos.

### Underground Move

**Atual:** stun 20 AoE incondicional.

**Canônico:** normalmente 20 em um inimigo + stun apenas Physical/Mental por 1; somente durante Fog Clone atinge todos e muda custo para Gen.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE` — o AoE/stun global atual é muito mais forte.

### Fog Clone

**Atual:** invulnerabilidade total por 3.

**Canônico:** 30 de defesa destrutível e invulnerabilidade apenas a Mental/Physical/Summon por 3 turnos.

**Diagnóstico:** `SIMPLIFICACAO_FORTE + MOTOR_INSUFICIENTE`.

### Hide

`PROXIMO_DO_CANONICO`.

**Conclusão:** restaurar condição do AoE e invulnerabilidade por classes antes de reduzir números.

---

## 10. Tsume Inuzuka — NERF_CANDIDATE

### Call Kuromaru

**Atual:** damage 10 em inimigo por 4 turnos.

**Canônico:** por 4 turnos dá 10 de redução de dano a Tsume e contra-ataca com 10 inimigos que usam skills não-Bane nela; enquanto ativo vira Fierce Bite.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Fierce Bite

**Atual:** stun 25 por 2 turnos.

**Canônico:** 25 de dano; se o alvo morrer naquele turno, Tsume recebe por 2 turnos +10 dano, Endure e Focus. Não é stun de 2 turnos.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE` — prioridade crítica.

### Tunneling Fang

**Atual:** stun 15 por 2 turnos.

**Canônico:** 15 piercing por 2 turnos; reduz em 2 a duração de stuns/disables aplicados pelo alvo; +5 por tick durante Call Kuromaru.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

### Light Bomb

**Atual:** invulnerabilidade total própria por 1.

**Canônico:** equipe inteira invulnerável apenas a skills não-Bane por 1; custo Rand, CD1, 3 cargas.

**Diagnóstico:** `CADASTRO_INCORRETO + MOTOR_INSUFICIENTE`.

**Conclusão:** o win-rate alto atual vem de dois stuns longos que não existem no original.

---

# Resultado do Batch 001

| Personagem | Direção simulada | Diagnóstico real antes de número |
|---|---|---|
| Haku (R) | Buff | 3 skills mecanicamente erradas/incompletas |
| Masked Man | Buff | 4 skills mecanicamente erradas/incompletas |
| Haku | Buff | 2 skills mecanicamente erradas/incompletas |
| Torune | Buff | 3 skills mecanicamente erradas/incompletas |
| Ino | Buff | 3 skills mecanicamente erradas/incompletas |
| Fukasaku & Shima | Nerf | 3 skills mecanicamente erradas/incompletas; Gamarinsho crítico |
| White Snake Orochimaru | Nerf | 3 skills mecanicamente erradas/incompletas; Eight-Headed Serpent crítico |
| Kushimaru | Nerf | 3 skills mecanicamente erradas/incompletas; Wire Crucifixion crítico |
| Oboro | Nerf | 3 skills mecanicamente erradas/incompletas |
| Tsume | Nerf | 4 skills mecanicamente erradas/incompletas; dois falsos stuns |

## Decisão

**Nenhum dos 10 recebe buff/nerf numérico neste estágio.**

O próximo lote de engenharia precisa ampliar o motor para representar, no mínimo:

1. stun por classe/tipo, não apenas stun total;
2. invulnerabilidade por classe/tipo;
3. `Silence`/Disable de efeitos não-danosos;
4. `Expose`/bloqueio de redução e invulnerabilidade;
5. `Focus`/imunidade a stun-disables;
6. `Exhaust`/aumento de custo;
7. stacks e requisitos por stack;
8. alternates/transformações de skill;
9. condições por skill/estado anterior;
10. efeitos compostos em um único jutsu;
11. defesa permanente e gatilhos ao quebrar defesa;
12. traps/counters/on-hit/on-death/on-action;
13. leech/cura baseada no dano;
14. chakra depletion;
15. taunt/alone/restrição de alvo;
16. cargas;
17. efeitos condicionais por ordem/fase/turno.

Depois da expansão, o Batch 001 deve ser traduzido novamente, simulado e só então reclassificado para buff/nerf numérico.
