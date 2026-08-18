window.NARUTO_V84 = (() => {
  const visuals = window.NARUTO_V84_VISUALS || {};
  const world = window.NARUTO_V84_WORLD || {};
  const trainer = (id, name, specialties, location, image, extra = {}) => ({
    id, name, specialties, location, image, discovered: true,
    relation: { trustMin: 0, respectMin: 0 },
    schedule: { startHour: 6, endHour: 22, days: ['todos'] },
    agenda: [], knowledge: [], requirements: [], teachableTechniqueIds: [],
    teachableCategories: [], triggers: [], refusals: [], ...extra
  });

  const trainers = [
    trainer('gai', 'Might Guy', ['Taijutsu', 'Hachimon'], 'folha', visuals.npcsByName?.['might guy'] || 'assets/events_v74/gai.svg', {
      relation: { trustMin: 0, respectMin: 1 }, teachableCategories: ['taijutsu'],
      requirements: ['Corpo e disciplina compatíveis com o treino'],
      refusals: ['Recusa abrir novo Portão sem prova, tempo e Save Point.']
    }),
    trainer('kakashi', 'Kakashi Hatake', ['Raiton', 'controle', 'tática'], 'folha', visuals.npcsByName?.['kakashi hatake'] || 'assets/events_v74/kakashi.svg', {
      relation: { trustMin: 1, respectMin: 1 }, teachableCategories: ['raiton', 'ninjutsu', 'espaco'],
      requirements: ['Técnica e Controle de Chakra compatíveis'],
      refusals: ['Recusa técnica de alto risco sem domínio dos fundamentos.']
    }),
    trainer('anko', 'Anko Mitarashi', ['campo', 'sobrevivência', 'kenjutsu não letal'], 'folha', visuals.npcsByName?.['anko mitarashi'] || 'assets/ui_v8/creator/roster/roster_12.jpg', {
      relation: { trustMin: 0, respectMin: 1 }, teachableCategories: ['kurai', 'ninjutsu'],
      requirements: ['Treino em local seguro ou missão compatível'],
      refusals: ['Recusa treino irresponsável com selo ou veneno.']
    }),
    trainer('iruka', 'Iruka Umino', ['fundamentos', 'controle básico'], 'folha', visuals.npcsByName?.['iruka umino'] || 'assets/events_v74/iruka.svg', {
      teachableCategories: ['base', 'ninjutsu'], requirements: ['Aluno matriculado ou recomendado']
    }),
    trainer('kurenai', 'Kurenai Yūhi', ['genjutsu', 'percepção'], 'folha', visuals.npcsByName?.['kurenai yuhi'] || 'assets/r25/characters/kurenai-yuhi.jpg', {
      relation: { trustMin: 1, respectMin: 1 }, teachableCategories: ['genjutsu', 'dojutsu'],
      requirements: ['Controle de Chakra confirmado'], refusals: ['Recusa confundir observação ocular com posse de dōjutsu.']
    }),
    trainer('asuma', 'Asuma Sarutobi', ['armas de chakra', 'vento', 'combate em equipe'], 'folha', visuals.npcsByName?.['asuma sarutobi'] || 'assets/r25/characters/asuma-sarutobi.jpg', {
      relation: { trustMin: 1, respectMin: 1 }, teachableCategories: ['ninjutsu', 'taijutsu'],
      requirements: ['Missão, recomendação ou relação suficiente']
    }),
    trainer('tsunade', 'Tsunade', ['medicina', 'controle de chakra', 'força'], 'variavel', visuals.npcsByName?.['tsunade'] || 'assets/r25/characters/tsunade.jpg', {
      discovered: false, secret: true, relation: { trustMin: 3, respectMin: 3 }, teachableCategories: ['medicina', 'taijutsu'],
      triggers: ['arc:ARC_10:encountered', 'fact:tsunade-disponivel'],
      requirements: ['Encontrar a pessoa no mundo vivo', 'Consentimento da mentora'],
      refusals: ['Indisponível antes do encontro narrativo.']
    }),
    trainer('jiraiya', 'Jiraiya', ['fūinjutsu', 'invocação', 'ninjutsu'], 'variavel', visuals.npcsByName?.['jiraiya'] || 'assets/r25/characters/jiraiya.jpg', {
      discovered: false, secret: true, relation: { trustMin: 2, respectMin: 2 }, teachableCategories: ['fuinjutsu', 'ninjutsu'],
      triggers: ['fact:jiraiya-conhece-leon'], requirements: ['Encontro e aceitação narrativos']
    }),
    trainer('yamato', 'Yamato', ['contenção', 'mokuton', 'controle de bijū'], 'variavel', visuals.npcsByName?.['yamato'] || 'assets/ui_v8/creator/roster/roster_09.jpg', {
      discovered: false, secret: true, relation: { trustMin: 2, respectMin: 2 }, teachableCategories: ['mokuton', 'kusenro'],
      triggers: ['fact:anbu-autoriza-yamato'], requirements: ['Autorização narrativa e compatibilidade']
    }),
    trainer('suirin', 'Suirin', ['vínculo ofídico', 'rastreamento', 'veneno'], 'vinculo', visuals.entities?.suirin || 'assets/v84/entities/suirin.png', {
      discovered: true, relation: { trustMin: 1, respectMin: 0 }, teachableCategories: ['suirin'],
      requirements: ['Vínculo ativo', 'Suirin presente e disposta'], refusals: ['Recusa se ferida, ausente ou em desacordo.']
    })
  ];

  return {
    version: '8.4.1',
    stateSchema: 'TERION_MASTER_STATE_V2',
    resolutionSystem: 'TERION_2D10',
    visuals,
    world,
    precedence: [
      'Registro Mestre confirmado',
      'Último Save Point confirmado',
      'Ficha ativa confirmada',
      'Grimório/cartão ativo confirmado',
      'Override vivo confirmado',
      'Pacotes locais embarcados',
      'Banco Universo',
      'Cânone não alterado'
    ],
    liveLeon: world.leonBaseline || null,
    trainers,
    sceneStage: {
      enabled: true,
      defaultBackdrop: visuals.battlefields?.village || 'assets/v84/battlefields/rua_vila.png',
      showActors: true,
      showTechniqueFocus: true,
      allowBattlefieldToggle: true
    },
    battlefields: {
      arena: { id: 'arena', name: 'Arena do Exame', image: visuals.battlefields?.arena, gridSize: 12, terrain: 'pedra', moveScaleMeters: 2 },
      forest: { id: 'forest', name: 'Floresta de missão', image: visuals.battlefields?.forest, gridSize: 12, terrain: 'floresta', moveScaleMeters: 2 },
      village: { id: 'village', name: 'Ruas de Nova Konoha', image: visuals.battlefields?.village, gridSize: 12, terrain: 'urbano', moveScaleMeters: 2 }
    },
    accessRules: {
      encyclopediaIsOwnership: false,
      ownedStates: ['ATIVA', 'ATIVO', 'ATIVO_NIVEL_1', 'ATIVO_POS_TREINO', 'COPIADA_ATIVA'],
      blockedStates: ['BLOQUEADA', 'COPIADA_BLOQUEADA', 'EM_TREINO', 'PENDENTE_TREINO_E_SAVE_POINT'],
      activationBeforeUse: ['KUGANGAN_*', 'KURAI_*', 'KUSENRO_*', 'HACHIMON_*'],
      hiddenContentPolicy: 'Não renderizar nome, imagem, técnica, gatilho ou requisito até descoberta.'
    },
    masterDirectives: [
      'Narrativa, missão, combate, treino, mentor, rumor, relação e tempo usam o mesmo evento persistente.',
      'Toda cena significativa avança o relógio e executa World Tick.',
      'A enciclopédia é conhecimento; somente a ficha/save contém posse e disponibilidade.',
      'Missões podem gerar combate, investigação, treino, encontro ou novo mentor; o resultado retorna à missão.',
      'NPCs têm localização, agenda e conhecimento limitado; registro não significa presença na cena.',
      'TERION 2D10 é o único núcleo matemático desta campanha; SNS é apenas referência mecânica de adaptação.',
      'Não inventar número ausente; usar falha fechada.'
    ],
    migration: {
      from: ['8.3.0', '8.3.1', '5.2'],
      preserve: ['inventory', 'equipment', 'events', 'missions', 'relationships', 'training', 'savepoints', 'clock', 'currentResourcesWhenNewer'],
      liveBaselineSource: 'OVERRIDE_FONTE_VIVA_NOVA_KONOHA 2026-08-08'
    }
  };
})();
