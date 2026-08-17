# R34 — AssetResolver canônico + reparo visual + minigames

## Objetivo

Esta camada elimina o uso silencioso de arte genérica quando existe uma associação semântica verificada e, quando a arte correta ainda não foi validada, mostra explicitamente **ARTE NÃO CADASTRADA** em vez de inventar uma imagem.

Ela foi desenhada como camada visual. Não altera PV, Chakra, dano, custo, CD, inventário ou qualquer outra regra TERION.

## Integração

`v23-data.js` já é carregado antes de `app-online.js`. Na R34 ele funciona como bootstrap:

1. carrega `asset-resolver.js` de forma síncrona durante o parsing;
2. o resolver indexa `NARUTO_ROSTER` e corrige referências genéricas conhecidas antes do app principal;
3. após `DOMContentLoaded`, carrega `r34-runtime-visuals.js`;
4. a camada de runtime repara imagens genéricas/quebradas no DOM e observa conteúdo criado dinamicamente.

## Aliases semânticos verificados nesta etapa

### Entidades/NPCs

- Iruka / Iruka Umino
- Gamabunta
- Enma
- Fukasaku / Shima / Fukasaku and Shima
- Gyūki / Eight Tails / Oito Caudas
- Chōmei / Seven Tails / Sete Caudas
- Shukaku
- Matatabi
- Kurama / Kyūbi / Nine Tails / Nove Caudas

### Técnicas/itens

- Kunai
- Shuriken
- Rasengan
- Raikiri / Lightning Blade
- Bunshin / Shadow Clone / Kage Bunshin
- Kawarimi / Substitution Technique

Esses aliases apontam somente para arquivos já existentes e identificáveis no repositório atual. **Isto não significa que toda a arte canônica do jogo esteja validada.**

## Pendências sem arte semântica validada

Nesta etapa, os seguintes nomes ficam deliberadamente como **ARTE NÃO CADASTRADA** quando cairiam em fallback genérico:

- Akamaru
- Aoda
- Gamakichi
- Henge / Transformation Technique / Técnica de Transformação

Isso é intencional: uma ausência explícita é preferível a uma imagem errada.

## API de auditoria

No console do navegador:

```js
NarutoAssetResolver.audit()
```

Para baixar o relatório JSON:

```js
NarutoAssetResolver.downloadAudit()
```

O relatório inclui contadores de imagens genéricas encontradas, correções pré-app, pendências, substituições no DOM, imagens quebradas e rótulos ainda sem arte validada.

## Reparação visual em runtime

`r34-runtime-visuals.js`:

- observa imagens novas com `MutationObserver`;
- trata erros reais de carregamento de `<img>`;
- usa `alt`, `title`, `data-*` e texto do cartão/diálogo para inferir contexto;
- troca apenas fallbacks genéricos/quebrados;
- preserva imagens específicas já existentes;
- usa placeholder explícito quando não há arte semântica validada.

## Minigames de treino

A R34 adiciona um botão **TREINO** e dois minigames funcionais:

1. **Controle de Chakra** — pare o marcador dentro da zona alvo; pontuação por precisão.
2. **Treino de Shuriken** — 10 lançamentos contra alvo móvel; pontuação por acerto e velocidade.

Melhores resultados ficam em `localStorage` (`naruto:r34:minigames`). Ao concluir, o jogo emite:

```js
window.addEventListener("naruto:minigame:complete", (event) => {
  console.log(event.detail); // { game, score, grade }
});
```

Os minigames não alteram as regras TERION; são uma camada de treino/UX e emitem um evento para integração futura controlada pelo sistema do jogo.

## Estado de validação

- Sintaxe JavaScript: validada com `node --check` antes do commit.
- Ordem de bootstrap: validada estaticamente em `v23-data.js`.
- Resolução semântica: validada por teste unitário simples dos aliases e preservação de imagens específicas.
- Browser/runtime real: **NOT_TESTED** até abrir/deployar a branch e executar os fluxos no navegador.
