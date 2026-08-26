# Fila de correções canônicas V2

- Técnicas totais contabilizadas: **836**
- Comparáveis 1:1: **719**
- Justificadas sem referência 1:1 e excluídas da fila: **117**
- CORRETA: **9**
- Técnicas com correção pendente: **710**
- SAFE_STRUCTURAL: **0**
- COMPLEX_EFFECT: **710**
- MANUAL_REVIEW: **0**
- Dimensões estruturais retidas: **1053**
- DESCRIPTION_AFTER_MECHANICS: **707**
- Gate: **PASS**

## Regra

- Nenhuma das 117 técnicas justificadas entra na fila.
- SAFE_STRUCTURAL é calculado por dimensão, exige evidência exata e valor representável pelo schema publicado.
- O patch automático futuro só pode consumir safeStructuralDimensions; classifications não é autorização de escrita.
- Dimensões não representáveis ficam em heldStructuralDimensions.
- EFEITO_ERRADO e categorias dinâmicas nunca são auto-corrigidas por este estágio.
- DESCRIÇÃO_ERRADA é corrigida somente depois da mecânica correspondente.
- Este estágio é fidelidade canônica; não aplica buff/nerf de balanceamento.
