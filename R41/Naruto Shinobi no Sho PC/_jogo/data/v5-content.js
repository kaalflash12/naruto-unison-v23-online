window.NARUTO_V5 = {
  creationSteps: [
    ['identidade','Identidade'],['origem','Clã / Hijutsu'],['atributos','Atributos'],['combate','Combate'],['pericias','Perícias'],['aptidoes','Aptidões'],['poderes','Poderes'],['oficio','Ofício'],['equipamentos','Equipamentos'],['revisao','Revisão']
  ],
  villageArt: {
    folha:{map:'assets/original/vilas/layout_mapa_1.jpg',header:'assets/original/vilas/layout_home_kages_1.jpg',bandana:'assets/original/vilas/layout_bandanas_1.png',lider:'Hokage'},
    areia:{map:'assets/original/vilas/layout_mapa_2.jpg',header:'assets/original/vilas/layout_home_kages_2.jpg',bandana:'assets/original/vilas/layout_bandanas_2.png',lider:'Kazekage'},
    nevoa:{map:'assets/original/vilas/layout_mapa_3.jpg',header:'assets/original/vilas/layout_home_kages_3.jpg',bandana:'assets/original/vilas/layout_bandanas_3.png',lider:'Mizukage'},
    pedra:{map:'assets/original/vilas/layout_mapa_4.jpg',header:'assets/original/vilas/layout_home_kages_4.jpg',bandana:'assets/original/vilas/layout_bandanas_4.png',lider:'Tsuchikage'},
    nuvem:{map:'assets/original/vilas/layout_mapa_5.jpg',header:'assets/original/vilas/layout_home_kages_5.jpg',bandana:'assets/original/vilas/layout_bandanas_5.png',lider:'Raikage'},
    errante:{map:'assets/original/vilas/layout_mapa_6.jpg',header:'assets/original/vilas/layout_home_kages_6.jpg',bandana:'assets/original/vilas/layout_bandanas_6.png',lider:'Líder'},
    som:{map:'assets/original/vilas/layout_mapa_7.jpg',header:'assets/original/vilas/layout_home_kages_7.jpg',bandana:'assets/original/vilas/layout_bandanas_7.png',lider:'Otokage'},
    chuva:{map:'assets/original/vilas/layout_mapa_8.jpg',header:'assets/original/vilas/layout_home_kages_8.jpg',bandana:'assets/original/vilas/layout_bandanas_8.png',lider:'Amekage'}
  },


  attributeHelp: {
    forca:'Potência física. Afeta ataques corporais, Atletismo e testes de força bruta.',
    destreza:'Coordenação e precisão manual. Afeta ataques à distância, Escapar e Prestidigitação.',
    agilidade:'Velocidade, equilíbrio e reflexos. Afeta Esquiva, Acrobacia e Furtividade.',
    percepcao:'Atenção e leitura do ambiente. Afeta Ler Movimento, Procurar, Prontidão e Rastrear.',
    inteligencia:'Raciocínio, estudo e conhecimento técnico. Afeta a maior parte das perícias de conhecimento e fabricação.',
    vigor:'Resistência corporal. É uma das bases da Vitalidade e de testes contra esforço, doenças e condições físicas.',
    espirito:'Força de chakra e determinação. É a base da reserva de Chakra e de muitos poderes/técnicas.',
    carisma:'Presença, simpatia e força social para influenciar pessoas de forma aberta.',
    manipulacao:'Capacidade de conduzir, ocultar intenção e pressionar socialmente de forma indireta.'
  },
  skillHelp: {
    acrobacia:'Equilíbrio, saltos, quedas e movimentos acrobáticos.', arte:'Expressão artística e execução de técnicas ligadas a artes.', atletismo:'Corrida, escalada, natação e esforço físico.',
    ciencias:'Conhecimento da natureza, substâncias, plantas, animais e fenômenos naturais.', concentracao:'Manter foco sob pressão e sustentar técnicas.', cultura:'História, geografia, costumes, organizações e conhecimentos gerais.',
    disfarces:'Alterar aparência, figurino e apresentação para passar por outra pessoa.', escapar:'Livrar-se de amarras, agarrões e espaços apertados.', furtividade:'Mover-se e agir sem ser percebido.',
    animais:'Treino e manejo de animais. Perícia treinada.', mecanismos:'Criar, entender e desarmar mecanismos. Perícia treinada.', medicina:'Primeiros socorros, diagnóstico e tratamento. Perícia treinada.',
    ocultismo:'Conhecimento de assuntos incomuns, chakra, selos e fenômenos ocultos. Perícia treinada.', prestidigitacao:'Movimentos discretos das mãos, ocultar e manipular pequenos objetos.',
    procurar:'Busca ativa por pistas, objetos e detalhes.', prontidao:'Percepção imediata de perigo e acontecimentos.', rastrear:'Seguir rastros e sinais de passagem.', veneficio:'Produção, identificação e uso de venenos. Perícia treinada.',
    persuasao:'Adaptação PC: teste social baseado em Carisma.', enganacao:'Adaptação PC: teste social baseado em Manipulação.'
  },
  originOfficial: {
    sem_cla:{unlock:'Nenhuma linha restrita de clã. Mantém a escolha livre de Hijutsu.',note:'Sem bônus numérico automático pela regra básica.'},
    aburame:{unlock:'Kikaichuu, Shōkaichuu, Kidaichuu/Rinkaichuu e o poder Kikai Ninpou.',note:'As técnicas de insetos precisam ser compradas e respeitar seus pré-requisitos.'},
    akimichi:{unlock:'Corpulência, Resiliência, Baika Ninpou e técnicas/pílulas próprias do clã.',note:'As Três Pílulas Coloridas são itens característicos do clã; os poderes ainda seguem seus requisitos.'},
    hatake:{unlock:'Uma das linhas de treinamento do clã: Kuchiyose restrito de Cães; ou Tensai com Presa de Prata.',note:'A Espada de Chakra Branco é equipamento característico do clã e possui requisitos próprios para uso pleno.'},
    hyuuga:{unlock:'Byakugan, Tenketsu Byakugan e o poder Juuken.',note:'Byakugan e Juuken não são concedidos automaticamente: ficam disponíveis para compra quando os requisitos forem atendidos.'},
    inuzuka:{unlock:'Companheiro Animal, Hakken no Jutsu e o poder Shikakyu (Quadrúpede).',note:'O companheiro canino/lupino faz parte da linha restrita do clã.'},
    nara:{unlock:'Poder Kagejutsu — Arte das Sombras e suas técnicas.',note:'O clã abre a linha de manipulação de sombras; os níveis do poder são comprados normalmente.'},
    sarutobi:{unlock:'Uma das linhas do clã: Kuchiyose restrito de Macacos; ou Tensai com Vontade do Fogo.',note:'As opções especiais continuam sujeitas a seus pré-requisitos.'},
    senju:{unlock:'Linhas especiais ligadas a Mokuton/Tensai, Maximizar, Regeneração e Senjutsu conforme a opção do clã.',note:'Mokuton e demais opções não são bônus automáticos: são acessos restritos.'},
    uchiha:{unlock:'Elemento Natural: Katon, Sharingan e suas evoluções, além das técnicas oculares restritas.',note:'Exigência do clã: desde a criação, possuir Katon ou Elemento Natural: Katon.'},
    uzumaki:{unlock:'Regeneração, Chakra Expandido, Kongou Fuusa e outras opções restritas do clã; Fuuinjutsu é recomendado.',note:'Os benefícios só existem quando a aptidão/poder correspondente é comprado.'},
    yamanaka:{unlock:'Poder Shindenshin — Transmissão da Mente e técnicas mentais restritas.',note:'A escolha abre a linha mental do clã; os poderes continuam tendo custo e pré-requisitos.'},
    fuuma:{unlock:'Treinamento característico com Tensai/Demônio do Vento e técnicas/armas restritas Fuuma.',note:'Acesso não significa receber gratuitamente todas as aptidões da linha.'},
    hoshigaki:{unlock:'Opções restritas ligadas ao corpo Hoshigaki, Suiton e combate prolongado.',note:'As características específicas são compradas conforme a linha do Livro de Hijutsus.'},
    hozuki:{unlock:'Linha Hozuki de hidrificação corporal e técnicas de Suiton associadas.',note:'Hidrificação e suas evoluções precisam ser adquiridas conforme os requisitos.'},
    kaguya:{unlock:'Conjunto Shikotsumyaku — Pulso dos Ossos Mortais — e acesso relacionado à Regeneração.',note:'O Shikotsumyaku é um conjunto de aptidões disponíveis para compra.'},
    yotsuki:{unlock:'Tensai e a aptidão restrita Lâmina da Lua.',note:'A Lâmina da Lua depende da linha Tensai e dos requisitos descritos no livro.'},
    yuki:{unlock:'Selos Especiais, Congelamento e o poder exclusivo Hyouton — Elemento Gelo.',note:'Hyouton é exclusivo da linha do clã e precisa ser comprado.'},
    shimura:{unlock:'Elemento Natural: Fuuton, opções com Kuchiyose Baku/Tensai e acesso aos Shimura Juinjutsu.',note:'As duas opções de formação do clã mantêm acesso aos selos exclusivos Shimura.'},
    hoshigakure:{unlock:'Chakra Expandido, aptidões Kujaku Myoho e o poder restrito Kujaku Myoho.',note:'O treinamento da estrela traz benefícios e custos próprios descritos no poder.'}
  },

  powers: [
    {id:'ninpou',nome:'Ninpou — Arte Ninja',icone:'🌀',resumo:'Arte ninja não elemental personalizável por efeitos.',req:'Nenhum',tipo:'comum',fonte:'Livro Básico, p. 91'},
    {id:'doton',nome:'Doton — Elemento Terra',icone:'🪨',resumo:'Ninjutsu elemental de terra, solo e matéria mineral.',req:'Nenhum',tipo:'elemental',elemento:'doton',fonte:'Livro Básico, p. 103'},
    {id:'fuuton',nome:'Fuuton — Elemento Vento',icone:'🌪️',resumo:'Ninjutsu elemental de vento, pressão e corte.',req:'Nenhum',tipo:'elemental',elemento:'fuuton',fonte:'Livro Básico, p. 105'},
    {id:'katon',nome:'Katon — Elemento Fogo',icone:'🔥',resumo:'Ninjutsu elemental de fogo e chamas.',req:'Nenhum',tipo:'elemental',elemento:'katon',fonte:'Livro Básico, p. 107'},
    {id:'raiton',nome:'Raiton — Elemento Trovão',icone:'⚡',resumo:'Ninjutsu elemental elétrico, velocidade e perfuração.',req:'Nenhum',tipo:'elemental',elemento:'raiton',fonte:'Livro Básico, p. 109'},
    {id:'suiton',nome:'Suiton — Elemento Água',icone:'💧',resumo:'Ninjutsu elemental de água, pressão e controle de campo.',req:'Nenhum',tipo:'elemental',elemento:'suiton',fonte:'Livro Básico, p. 111'},
    {id:'fuuinjutsu',nome:'Fuuinjutsu — Selamento',icone:'📜',resumo:'Selos de armazenamento, barreiras, armadilhas e contenção.',req:'Inteligência 6',tipo:'comum',lockedAtNc4:true,fonte:'Livro Básico, p. 114'},
    {id:'iryou',nome:'Iryou Ninjutsu — Ninjutsu Médico',icone:'🩺',resumo:'Cura por chakra e técnicas médicas avançadas.',req:'Ninja Médico; Espírito 6',tipo:'comum',lockedAtNc4:true,fonte:'Livro Básico, p. 120'},
    {id:'rasengan',nome:'Rasengan — Explosão Espiral',icone:'🔵',resumo:'Esfera rotatória de chakra para combate corpo a corpo.',req:'Espírito 8',tipo:'comum',lockedAtNc4:true,fonte:'Livro Básico, p. 121'}
  ],
  professions: [
    {id:'mensageiro',nome:'Mensageiro Shinobi',icone:'📨',resumo:'Entrega documentos, atravessa rotas perigosas e conhece atalhos.',bonusTexto:'+1 Prontidão; +2 de Vigor de missão; recebe 1 Bomba de Fumaça.',skill:'prontidao',skillBonus:1,stamina:2,item:'bomba_fumaca',itemQty:1},
    {id:'rastreador',nome:'Rastreador',icone:'🐾',resumo:'Segue pegadas, cheiro, chakra residual e sinais de passagem.',bonusTexto:'+1 Rastrear e +1 Procurar.',skill:'rastrear',skillBonus:1,skill2:'procurar',skillBonus2:1},
    {id:'medico_campo',nome:'Assistente Médico',icone:'🩺',resumo:'Atua em primeiros socorros e triagem durante missões.',bonusTexto:'+1 Medicina; recebe 1 Kit Médico; cura com itens +2.',skill:'medicina',skillBonus:1,item:'kit_medico',itemQty:1,healing:2},
    {id:'armeiro',nome:'Armeiro / Ferreiro',icone:'🔨',resumo:'Mantém armas, ferramentas, fios e mecanismos simples.',bonusTexto:'+1 Mecanismos; armas custam 5% menos nas lojas; recebe Fio de Aço.',skill:'mecanismos',skillBonus:1,shopDiscount:0.05,item:'fio_aco',itemQty:1},
    {id:'investigador',nome:'Investigador',icone:'🔎',resumo:'Reúne pistas, entrevista testemunhas e reconstrói cenas.',bonusTexto:'+1 Procurar e +1 Cultura.',skill:'procurar',skillBonus:1,skill2:'cultura',skillBonus2:1},
    {id:'artesao',nome:'Artesão',icone:'🎨',resumo:'Produz objetos, desenhos, selos decorativos e itens de ofício.',bonusTexto:'+1 Arte; começa com Kit de Artesão narrativo.',skill:'arte',skillBonus:1,tag:'kit_artesao'},
    {id:'comerciante',nome:'Comerciante',icone:'💰',resumo:'Negocia suprimentos e conhece o mercado das vilas.',bonusTexto:'+1 Persuasão; 5% de desconto em compras comuns.',skill:'persuasao',skillBonus:1,shopDiscount:0.05},
    {id:'cozinheiro',nome:'Cozinheiro',icone:'🍜',resumo:'Prepara refeições de viagem e conhece ingredientes locais.',bonusTexto:'Comidas recuperam +3 Vitalidade; recebe 2 Ramen Simples.',foodHealing:3,item:'ramen_simples',itemQty:2},
    {id:'cacador',nome:'Caçador',icone:'🏹',resumo:'Sobrevive fora das vilas, caça e prepara emboscadas.',bonusTexto:'+1 Furtividade e +1 Rastrear.',skill:'furtividade',skillBonus:1,skill2:'rastrear',skillBonus2:1},
    {id:'escriba',nome:'Escriba / Arquivista',icone:'📚',resumo:'Lida com registros, códigos, história e burocracia.',bonusTexto:'+1 Cultura e +1 Ocultismo.',skill:'cultura',skillBonus:1,skill2:'ocultismo',skillBonus2:1},
    {id:'guarda',nome:'Guarda da Vila',icone:'🛡️',resumo:'Patrulha portões, acompanha presos e protege civis.',bonusTexto:'+1 Prontidão; +1 Vitalidade máxima.',skill:'prontidao',skillBonus:1,hp:1},
    {id:'explorador',nome:'Explorador',icone:'🧭',resumo:'Mapeia áreas desconhecidas e prepara rotas de viagem.',bonusTexto:'+1 Atletismo e +1 Rastrear.',skill:'atletismo',skillBonus:1,skill2:'rastrear',skillBonus2:1}
  ],
  professionNotice: 'Ofícios são uma regra opcional da Edição PC. O Livro Básico detalha perícias e trabalhos, mas não fornece uma etapa obrigatória chamada Ofício na criação; por isso estes bônus são uma adaptação digital e ficam identificados como tal.',
  itemArt: {
    kunai:'assets/original/ui/layout_enhancements_kunai_up.jpg',
    shuriken:'assets/original/ui/layout_ico_shuriken.png',
    ramen_simples:'assets/original/ui/layout_comidas_nissin.jpg',
    ramen_especial:'assets/original/ui/layout_comidas_nissin.jpg',
    pergaminho_chakra:'assets/original/ui/pergaminho.png'
  },

  equipmentReferences: [
    {page:127,src:'assets/referencias/equipamentos/equipamentos_p127.jpg'},
    {page:128,src:'assets/referencias/equipamentos/equipamentos_p128.jpg'},
    {page:129,src:'assets/referencias/equipamentos/equipamentos_p129.jpg'},
    {page:130,src:'assets/referencias/equipamentos/equipamentos_p130.jpg'},
    {page:131,src:'assets/referencias/equipamentos/equipamentos_p131.jpg'},
    {page:132,src:'assets/referencias/equipamentos/equipamentos_p132.jpg'},
    {page:133,src:'assets/referencias/equipamentos/equipamentos_p133.jpg'},
    {page:134,src:'assets/referencias/equipamentos/equipamentos_p134.jpg'},
    {page:135,src:'assets/referencias/equipamentos/equipamentos_p135.jpg'},
    {page:136,src:'assets/referencias/equipamentos/equipamentos_p136.jpg'},
    {page:137,src:'assets/referencias/equipamentos/equipamentos_p137.jpg'},
  ],
  defaultAvatars: [
    {id:'default',nome:'Silhueta Shinobi',src:'assets/ui/avatar.png'},
    {id:'original',nome:'Perfil do jogo original',src:'assets/original/avatares/perfil_original.png'},
    {id:'profile7',nome:'Retrato do projeto original',src:'assets/original/avatares/layout_profile_7.png'},
    {id:'vip1747',nome:'Retrato clássico 1',src:'assets/original/avatares/layout_icon_vip_1747.jpg'},
    {id:'vip1797',nome:'Retrato clássico 2',src:'assets/original/avatares/layout_icon_vip_1797.jpg'}
  ],
  villageLocations: [
    {id:'academia',nome:'Academia Ninja',icone:'🎓',descricao:'Treinamento básico, aulas e exames.'},
    {id:'missoes',nome:'Edifício de Missões',icone:'📜',descricao:'Contratos, recompensas e equipes.'},
    {id:'hospital',nome:'Hospital',icone:'🏥',descricao:'Recuperação, tratamento e medicina ninja.'},
    {id:'dojo',nome:'Dojo',icone:'🥋',descricao:'Treino de combate e duelos.'},
    {id:'loja',nome:'Loja Ninja',icone:'🛍️',descricao:'Armas, consumíveis, armaduras e ferramentas.'},
    {id:'ramen',nome:'Restaurante',icone:'🍜',descricao:'Comida e recuperação fora de combate.'},
    {id:'portao',nome:'Portões da Vila',icone:'⛩️',descricao:'Entrada, patrulha, viagens e missões externas.'},
    {id:'arquivo',nome:'Arquivo / Biblioteca',icone:'📚',descricao:'Registros históricos e pesquisa de regras pelo Mestre IA.'}
  ]
};
