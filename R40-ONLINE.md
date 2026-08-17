# Shinobi no Sho R40 — Online

Produção atual: https://naruto-shinobi-r40-online.vercel.app

Esta branch preserva o `main`/V23 para rollback e adiciona um ponto de entrada GitHub para a R40.

## Estado validado em 2026-08-17

- R40 base: 27/27 testes do validador R40.
- Regressão R39: 35/35.
- Core arquitetural integrado: 21/21.
- JavaScript da árvore local integrada: 84/84 em `node --check`.
- TERION 2D10 continua sendo a autoridade mecânica.

## Core arquitetural integrado no pacote R40

- AssetResolver + manifest/aliases.
- VisualStateEngine.
- AnimationRegistry.
- MinigameEngine.
- SceneDirector.
- SavePointManager.

O gate global 896 não é promovido sem evidência individual. O pacote completo R40 continua sendo a fonte executável; este repositório mantém o acesso web/GitHub e o histórico de rollback.
