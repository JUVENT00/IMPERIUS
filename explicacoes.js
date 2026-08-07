// ============================================================
// IMPERIUS — EXPLICAÇÕES (base de conhecimento pro /explicar
// e pra IA responder no grupo de iniciantes)
// ============================================================

const EXPLICACOES = {
  criar: {
    titulo: '🧙 /criar',
    texto: [
      'Cria seu personagem no IMPERIUS.',
      'Você escolhe nome e recebe uma classe',
      'inicial aleatória (normal). Depois pode',
      'tentar a /roleta pra buscar uma classe rara.',
      'É o primeiro comando que todo mundo',
      'precisa usar antes de qualquer outra coisa.'
    ]
  },
  roleta: {
    titulo: '🎡 /roleta',
    texto: [
      'A Roleta do Destino. Dá uma chance de',
      'trocar sua classe normal por uma das 11',
      'classes raras do jogo — muito mais fortes',
      'e com habilidades exclusivas.',
      'É sorte pura, então nem sempre acerta',
      'de primeira.'
    ]
  },
  batalha: {
    titulo: '⚔️ /batalha (ou /caminhar)',
    texto: [
      'Te manda pra um encontro na região atual:',
      'pode ser um monstro comum, um evento, ou',
      'até um boss. A batalha é por turnos, com',
      'um dado (D20) decidindo se seu golpe',
      'acerta em cheio, acerta normal ou erra.',
      'Use /atacar, /fugir ou /mochila (pra usar',
      'item) durante a luta.'
    ]
  },
  loja: {
    titulo: '🏪 /loja',
    texto: [
      'Mostra os itens, armas e armaduras à',
      'venda com Belarium (a moeda do jogo).',
      'Use /comprar [nome do item] pra levar',
      'algo, e depois /equipar [arma] ou',
      '/equiparmadura [armadura] pra colocar.',
      'Quanto mais rara a arma, mais cara e',
      'mais forte.'
    ]
  },
  equipar: {
    titulo: '🗡️ /equipar',
    texto: [
      'Equipa uma arma que já está no seu',
      'inventário. Sem uma arma equipada seu',
      'dano em batalha fica bem mais fraco.',
      'Use /equiparmadura pro mesmo processo',
      'com armaduras.'
    ]
  },
  mochila: {
    titulo: '🎒 /mochila',
    texto: [
      'Mostra seu inventário — itens, poções e',
      'materiais que você tem guardado.',
      'Durante uma batalha, /mochila também',
      'serve pra usar um item de cura na hora.'
    ]
  },
  viajar: {
    titulo: '🗺️ /viajar',
    texto: [
      'Move seu personagem entre as 21 regiões',
      'do mapa do IMPERIUS. Cada região tem seus',
      'próprios monstros, bosses e nível',
      'recomendado — regiões mais distantes da',
      'capital (Valdris) costumam ser mais',
      'perigosas e valer mais XP.'
    ]
  },
  perfil: {
    titulo: '📋 /perfil',
    texto: [
      'Mostra a ficha completa do seu',
      'personagem: nível, classe, XP, HP, arma',
      'e armadura equipadas, Belarium, pet (se',
      'tiver) e título ativo.'
    ]
  },
  pet: {
    titulo: '🐾 Pets',
    texto: [
      'Existem mais de 46 criaturas pra domar.',
      'Cada pet é ÚNICO no servidor — se alguém',
      'já tem aquela espécie com aquele nome,',
      'ninguém mais pode ter igual.',
      'Pets ajudam em batalha e podem lutar',
      'entre si com /petbatalha.',
      'Adquira um pet comprando um ovo na /loja.'
    ]
  },
  drop: {
    titulo: '📦 Drop',
    texto: [
      '"Drop" é qualquer coisa que você ganha',
      'ao vencer uma batalha, boss ou evento —',
      'pode ser Belarium, XP, um item, uma arma',
      'rara ou até um pet. Quanto mais forte o',
      'inimigo, melhor tende a ser o drop.',
      'Nem toda vitória dropa item — às vezes é',
      'só Belarium e XP mesmo.'
    ]
  },
  guilda: {
    titulo: '🏯 Guildas',
    texto: [
      'Grupo de jogadores unidos sob uma',
      'bandeira. Use /criarguilda pra fundar a',
      'sua ou /convidar pra trazer gente pra',
      'guilda que você já tem. Guildas podem',
      'entrar em /guerraguilda contra outras.'
    ]
  },
  duelo: {
    titulo: '🤺 Duelo (PvP)',
    texto: [
      'Luta direta entre dois jogadores. Use',
      '/atacar @jogador ou /duelo pra desafiar,',
      'a outra pessoa aceita com /aceitarduelo,',
      'e o combate roda em turnos alternados',
      'até alguém desistir com /fugirduelo ou',
      'perder o HP todo.'
    ]
  },
  banco: {
    titulo: '🏦 /banco',
    texto: [
      'Mostra seu saldo guardado no banco.',
      '/depositar e /sacar movem Belarium entre',
      'a carteira e o banco — guardar no banco',
      'costuma ser mais seguro contra perdas em',
      'certos eventos do jogo.'
    ]
  },
  talentos: {
    titulo: '🌟 /talentos',
    texto: [
      'Sistema de progressão paralelo ao nível.',
      'A cada level você ganha 1 ponto de',
      'talento pra investir em dano, defesa ou',
      'Belarium (até +20% em cada). Use',
      '/talentos pra ver seus pontos e',
      '/investirtalento pra gastar.'
    ]
  },
  prestigio: {
    titulo: '👑 /prestigio',
    texto: [
      'Ao chegar no nível 200, você pode',
      'prestigiar: reseta seu progresso de',
      'volta pro nível 1, mas ganha um selo',
      'permanente que fica pra sempre no seu',
      'perfil, mostrando que você já chegou',
      'no topo antes.'
    ]
  },
  leilao: {
    titulo: '🔨 /leilao',
    texto: [
      'Mercado entre jogadores. Você pode',
      'colocar um item seu à venda com',
      '/criarleilao, ver o que tá disponível',
      'com /verleiloes e comprar de outro',
      'jogador com /comprarleilao.'
    ]
  },
  reforjar: {
    titulo: '🔥 /reforjar',
    texto: [
      'Melhora uma arma ou item que você já',
      'tem, deixando ele mais forte. Tem custo',
      'em Belarium e pode ter chance de falhar',
      'dependendo da raridade do item.'
    ]
  },
  sucatear: {
    titulo: '⚙️ /sucatear',
    texto: [
      'Desmonta um item ou arma que você não',
      'quer mais em troca de Belarium ou',
      'materiais — uma forma de não deixar',
      'coisa inútil ocupando espaço na mochila.'
    ]
  },
  masmorra: {
    titulo: '🏚️ Masmorras',
    texto: [
      'Desafios especiais escondidos pelo',
      'mapa, normalmente mais difíceis que uma',
      'batalha comum e com recompensas melhores.',
      'Algumas só aparecem em certas regiões.'
    ]
  },
  boss: {
    titulo: '👹 Boss',
    texto: [
      'Cada região tem 10 bosses, muito mais',
      'fortes que monstros comuns e com',
      'múltiplas fases de HP. Use /bosses pra',
      'ver os da sua região atual e /boss',
      '[nome] pra enfrentar um específico —',
      'tem trava de nível recomendado.'
    ]
  },
  casamento: {
    titulo: '💍 Casamento',
    texto: [
      'Você pode se casar com outro jogador',
      'dentro do RPG — é só flavor/social, não',
      'muda seus atributos de batalha.'
    ]
  },
  ranking: {
    titulo: '📊 Rankings',
    texto: [
      'Vários rankings pra ver quem tá na',
      'frente: /ranking (nível/XP),',
      '/moneyrank (Belarium), /xprank,',
      '/killrank (abates), /rankpet e',
      '/podio (hall da fama geral).'
    ]
  },
  missoes: {
    titulo: '📜 /missoes',
    texto: [
      'Objetivos que dão recompensa extra ao',
      'completar — tipo derrotar X monstros ou',
      'chegar em tal nível. Use /missoes pra',
      'ver o progresso e /coletarmissao quando',
      'concluir uma.'
    ]
  },
  conquistas: {
    titulo: '🏆 /conquistas',
    texto: [
      'Marcos permanentes do seu personagem —',
      'tipo "primeiro boss derrotado" ou',
      '"primeiro pet domado". Ficam registradas',
      'pra sempre no seu perfil.'
    ]
  },
  titulos: {
    titulo: '🎖️ /titulos',
    texto: [
      'Apelidos especiais que aparecem no seu',
      'nome, ganhos por conquistas ou dados por',
      'admin. Use /usartitulo pra equipar o que',
      'você já tem e /todostitulos pra ver o',
      'catálogo completo com como conseguir',
      'cada um.'
    ]
  },
  minigames: {
    titulo: '🎮 /minigames',
    texto: [
      'Categoria separada do RPG, só diversão —',
      'jogo da velha, memória, forca, caça-',
      'níquel, pedra-papel-tesoura, cara ou',
      'coroa e adivinhação de número.',
      'Os pontos ganhos aqui NÃO viram Belarium',
      'e não afetam seu personagem — é um',
      'ranking totalmente separado (/rankminigames).'
    ]
  },
  evento: {
    titulo: '🔥 Eventos aleatórios',
    texto: [
      'De vez em quando o mundo se agita',
      'sozinho e o bot anuncia uma ameaça no',
      'grupo. Use /participarevento pra lutar',
      'durante os 10 minutos que ele fica',
      'ativo — quem mais atacar leva a maior',
      'recompensa quando fecha.'
    ]
  },
  murageral: {
    titulo: '🖼️ /muralgeral',
    texto: [
      'Galeria com as armas mais lendárias e',
      'personalizadas do servidor, cada uma com',
      'sua história, habilidades e o jogador',
      'que a porta.'
    ]
  },
  classe: {
    titulo: '🎭 Classes',
    texto: [
      'Definem seu estilo de jogo — dano,',
      'defesa, habilidades especiais. Existem',
      '20 classes normais e 11 raras (só pela',
      '/roleta). A mais rara de todas é o',
      '👑 Ajudante do Deus.'
    ]
  },
};

const ALIAS_TERMOS = {
  pets: 'pet', bosses: 'boss', guildas: 'guilda', duelos: 'duelo',
  drops: 'drop', titulo: 'titulos', conquista: 'conquistas',
  missao: 'missoes', eventos: 'evento', eventoaleatorio: 'evento',
  classes: 'classe', armas: 'equipar', armadura: 'equipar',
  dinheiro: 'banco', moeda: 'banco', moedas: 'banco', belarium: 'banco',
  minigame: 'minigames', dungeon: 'masmorra', dungeons: 'masmorra',
  masmorras: 'masmorra', casar: 'casamento', ranks: 'ranking', rankings: 'ranking',
};

function buscarExplicacao(termo) {
  if (!termo) return null;
  let chave = termo
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/^\//, '')
    .replace(/[^a-z]/g, '');
  chave = ALIAS_TERMOS[chave] || chave;
  return EXPLICACOES[chave] || null;
}

module.exports = { EXPLICACOES, buscarExplicacao };
