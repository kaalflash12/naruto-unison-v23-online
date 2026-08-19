# R41 correção integral — 2026-08-19

Base canônica: `r41-cloudflare-mongodb-final-20260819`.
Branch de correção: `r41-correcao-integral-20260819`.

## Corrigido nesta branch

- API final migrada para Cloudflare Worker + MongoDB Atlas + Durable Objects.
- Contratos de autenticação, slots/save/load, online, PvP/coop, world event/savepoint e IA alinhados ao `app.js` R41.
- Frontend não usa Vercel/Supabase para `/api/*`; o Worker real é gravado após deploy.
- Sessão é injetada automaticamente nas rotas legadas que não enviavam `Authorization`.
- `.env.local.example` não contém Vercel/Supabase.
- Aliases visuais Naruto/Sasuke/Kakashi/Orochimaru não usam mais arte de jutsu como portrait.
- `r41-user-visuals.js` reserva 40 IDs semânticos de jutsu para artes recortadas das imagens fornecidas pelo usuário; screenshots de UI ficam como referência visual, não como arte de técnica.
- Correção de textos antigos D1/Drive/Tunnel na interface.

## Validação obrigatória antes de `main`

O pacote `ATIVAR_R41_CLOUDFLARE_MONGODB_AUTOMATICO.ps1` executa: sintaxe Worker, autenticações via navegador, MongoDB M0/reutilização, deploy Worker, CORS, registro, sessão, save/load, pool Kurai, Durable Object, mensagens, estado online, bloqueio de `grant_xp`, World Event, SavePoint, Workers AI quando disponível, testes R39/R40/R41 encontrados na árvore, push e promoção com rollback somente sem FAIL.

## Gate não falsificado

O MD operacional recuperado define critérios e a ordem de correção, mas não traz uma lista literal de 896 IDs. Por isso `896/896` permanece `UNVERIFIED` até existir a lista literal ou evidência equivalente. Esta branch não converte ausência de prova em PASS.

## Autoridade mecânica

TERION continua soberano. Durable Objects coordenam estado de sala e o Worker bloqueia ações cliente obviamente autoritativas como concessão de XP/nível. A migração de toda resolução TERION para o servidor é gate separado e não está declarada como concluída sem teste específico.
