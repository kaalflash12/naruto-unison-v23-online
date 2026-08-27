# Fila de correções canônicas V2

- Técnicas totais contabilizadas: **836**
- Comparáveis 1:1: **719**
- Justificadas sem referência 1:1 e excluídas da fila: **117**
- CORRETA: **9**
- Técnicas com correção pendente: **710**
- SAFE_STRUCTURAL: **9**
- COMPLEX_EFFECT: **701**
- MANUAL_REVIEW: **0**
- Dimensões estruturais retidas: **867**
- DESCRIPTION_AFTER_MECHANICS: **700**
- Gate: **PASS**

## Regra

- Nenhuma das 117 técnicas justificadas entra na fila.
- SAFE_STRUCTURAL é calculado por dimensão, exige evidência exata e valor representável pelo schema publicado.
- Custo e cooldown estáticos podem ser corrigidos independentemente de um efeito divergente, exceto quando dynamic-change/alternate pode reescrevê-los.
- Dano só é liberado quando há valor estático explícito 1:1 e nenhum blocker que altere a quantidade ao longo do tempo.
- Alvo e duração permanecem retidos diante de EFEITO_ERRADO porque podem pertencer a subefeitos distintos.
- O patch automático futuro só pode consumir safeStructuralDimensions; classifications não é autorização de escrita.
- Dimensões não representáveis ficam em heldStructuralDimensions.
- EFEITO_ERRADO nunca é auto-corrigido por este estágio.
- DESCRIÇÃO_ERRADA é corrigida somente depois da mecânica correspondente.
- Este estágio é fidelidade canônica; não aplica buff/nerf de balanceamento.
