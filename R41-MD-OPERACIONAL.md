# SHINOBI NO SHO R41 — MD OPERACIONAL APLICADO

Data: 2026-08-17
Autoridade mecânica: TERION 2D10
Base preservada: R40

## Bloqueadores corrigidos

- Agência narrativa: o jogador decide ação/fala/intenção; IA narra consequência depois de TERION.
- Quests de mapa: etapa passa por minijogo + TERION; não avança somente por clicar.
- Treinos: 12 modalidades jogáveis, score/erros/tempo, modificador circunstancial, TERION, World Tick e Save Point.
- Missões formais: escolhas não-combate abrem gameplay; escolhas de combate usam o campo tático.
- Defesa territorial: minijogo próprio por ondas/lane interception.
- Fūinjutsu: combinação de chakra/selos (mecânica inspirada, sem copiar 2048 literalmente).
- Kurai: reserva 8/8 exibida separadamente no HUD e persistida.
- Level-up: não restaura PV/Chakra automaticamente.
- Ferimentos: separados de PV e persistentes; o braço com tenketsu bloqueado não some por descanso.
- Hospital: diagnóstico, custo, tempo, tratamento e World Tick; tratamento antigo de reset foi desativado.
- Descanso: trava anti-spam, tempo real, World Tick, recuperação limitada e sem recarga gratuita das reservas especiais.
- Autosave: local + cloud para conta autenticada nos pontos críticos.
- Combate: resultado TERION é convertido em apresentação/estado visual/HUD/narrativa/save.
- Dōjutsu/transformações: Mechanical State + Visual State + Narrative Fact.
- Aparência: equipamento/arma/dōjutsu/transformação/dano ligados ao estado persistente.
- NPCs de serviço da Folha: identidades canônicas no lugar dos nomes genéricos da tela inicial.
- Imagens: arte apenas com arquivo por ID não é mais chamada de “semântica”; só o manifesto verificado recebe esse selo. Fallback conhecido permanece explicitamente pendente.
- História: beats obrigatórios de arcos concluídos/históricos normalizados; IA não continua gerando novas cenas dentro de arco encerrado.
- GM3: os 2.792 registros R38 foram adaptados para contrato GM3 R41 usando somente os campos já presentes na fonte.
- Online: sala autenticada com presença/chat + ações, intenções, resultados de minijogo, combate e atividades compartilhados no backend; estado compartilhado da sala é lido pela IA.
- Economia/atividades: coleta, craft, pesca, caça, entrega e colecionáveis usam gameplay + TERION + tempo + save.
- Content packs: manifests, dependências e checksums verificados.
- Importadores externos: pipeline raw → normalized → conflicts, sem overwrite silencioso de conteúdo validado.

## Validação automática atual

- R41: 32/32 gates.
- Regressão R40: 27/27.
- Regressão R39: 35/35.
- JavaScript/MJS: 100 arquivos sem erro de sintaxe.
- JSON: 50 arquivos parseados sem erro.
- World missions: 45/45 possuem roteiro R33 e wrapper de gameplay R41.
- GM3: 2.792/2.792 contratos completos após mapeamento de campos existentes.
- História: 26 arcos, 6 campanhas; arcos concluídos não possuem mandatory beats pendentes.

## Regra de publicação

A produção anterior continua sendo ponto de rollback. R41 só substitui a produção depois do deploy e do smoke test HTTP da versão publicada. O GitHub preserva o commit R40 anterior.