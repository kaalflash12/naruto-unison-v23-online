window.NARUTO_V6 = {
  version: "6.1.0",
  villageGrid: { cols: 12, rows: 8, moveRange: 3 },
  worldGrid: { cols: 20, rows: 12, moveRange: 5 },
  hotspots: [
    {id:"academia", nome:"Academia Ninja", icone:"🎓", x:2, y:2, descricao:"Aulas, treinos básicos e preparação shinobi."},
    {id:"missoes", nome:"Edifício de Missões", icone:"📜", x:7, y:2, descricao:"Contratos, equipes, recompensas e despacho de missão."},
    {id:"hospital", nome:"Hospital", icone:"🏥", x:9, y:4, descricao:"Tratamento, repouso e medicina ninja."},
    {id:"dojo", nome:"Dojo", icone:"🥋", x:3, y:5, descricao:"Treino tático, combate e testes do personagem."},
    {id:"loja", nome:"Loja Ninja", icone:"🛍️", x:6, y:5, descricao:"Armas, ferramentas, consumíveis e suprimentos."},
    {id:"ramen", nome:"Restaurante", icone:"🍜", x:8, y:6, descricao:"Comida, descanso e cenas sociais."},
    {id:"arquivo", nome:"Arquivo / Biblioteca", icone:"📚", x:4, y:3, descricao:"Pesquisa, registros e consulta de regras."},
    {id:"portao", nome:"Portões da Vila", icone:"⛩️", x:11, y:7, descricao:"Saída para o Mapa Mundi, viagens e missões externas."}
  ],
  worldVillages: [
    {id:"folha", nome:"Vila Oculta da Folha", curto:"Folha", x:10, y:7, art:"assets/original/vilas/layout_mapa_1.jpg", risco:"moderado"},
    {id:"areia", nome:"Vila Oculta da Areia", curto:"Areia", x:5, y:9, art:"assets/original/vilas/layout_mapa_2.jpg", risco:"alto"},
    {id:"nevoa", nome:"Vila Oculta da Névoa", curto:"Névoa", x:16, y:8, art:"assets/original/vilas/layout_mapa_3.jpg", risco:"alto"},
    {id:"pedra", nome:"Vila Oculta da Pedra", curto:"Pedra", x:5, y:4, art:"assets/original/vilas/layout_mapa_4.jpg", risco:"alto"},
    {id:"nuvem", nome:"Vila Oculta da Nuvem", curto:"Nuvem", x:14, y:3, art:"assets/original/vilas/layout_mapa_5.jpg", risco:"alto"},
    {id:"errante", nome:"Entreposto Errante", curto:"Errante", x:9, y:2, art:"assets/original/vilas/layout_mapa_6.jpg", risco:"variável"},
    {id:"som", nome:"Vila Oculta do Som", curto:"Som", x:8, y:5, art:"assets/original/vilas/layout_mapa_7.jpg", risco:"alto"},
    {id:"chuva", nome:"Vila Oculta da Chuva", curto:"Chuva", x:11, y:4, art:"assets/original/vilas/layout_mapa_8.jpg", risco:"alto"}
  ],
  routes: [
    ["folha","areia"],["folha","chuva"],["folha","som"],["folha","nuvem"],
    ["areia","pedra"],["areia","chuva"],["pedra","som"],["pedra","errante"],
    ["som","chuva"],["chuva","nuvem"],["chuva","nevoa"],["nuvem","nevoa"],["errante","nuvem"]
  ],
  mapNotice: "A grade de navegação é inspirada no fluxo do Naruto Game. Distâncias e rotas desta edição PC são uma camada digital de campanha; não substituem as regras do livro Shinobi no Sho."
};