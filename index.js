// ============================================================
// IMPERIUS v4.0 — BOT PRINCIPAL
// ============================================================
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function bannerImperius() {
  console.log(YELLOW + `
██╗███╗   ███╗██████╗ ███████╗██████╗ ██╗██╗   ██╗███████╗
██║████╗ ████║██╔══██╗██╔════╝██╔══██╗██║██║   ██║██╔════╝
██║██╔████╔██║██████╔╝█████╗  ██████╔╝██║██║   ██║███████╗
██║██║╚██╔╝██║██╔═══╝ ██╔══╝  ██╔══██╗██║██║   ██║╚════██║
██║██║ ╚═╝ ██║██║     ███████╗██║  ██║██║╚██████╔╝███████║
╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝
` + RESET);
}
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

// ── SISTEMAS ──────────────────────────────────────────────
const db = require('./db');
const { menuClasses, getClasseKey, girarRoleta, gerarFicha, verClasse, viajar, verMapa, verRegioes } = require('./character');
const { batalharMonstro, batalharBoss, pvp, usarHabilidade, usarUltimate, rolarD20, rand } = require('./combat');
const { suicidar, reviverPorNecromante, aprovarAcaoServo, registrarAcaoServo, liberarServo } = require('./death');
const { verLoja, comprarItem, usarItem, equiparArma, verInventario, verBanco, depositar, sacar } = require('./economy');
const { verRanking, verConquistas, verTitulos, usarTitulo, verMissoes, matarJogador, darItem, abencoarJogador, maldicionarJogador, eventoGlobal, statusBot } = require('./events');
const { criarSacrificio, aceitarSacrificio, recusarSacrificio, pedirSacrificioParceiro, aceitarMorteSacrificio, recusarMorteSacrificio, verSacrificiosPendentes } = require('./sacrifice');
const { encarnar, ascender, processarMorteEncarnacao } = require('./incarnation');
const { verLojaOvos, chocarOvo, verPet, soltarPet, curarPet, petAjudaBatalha, tentarDomar, nomearPet, comprarOvo, gerarEstado, ITENS_DOMAR, CRIATURAS, ESTADOS, ehAnimalSelvagem, tentarDomarAnimal, chamarPet, chamarAnimalBatalha, verAnimais, verMeuAnimal, soltarAnimal, adotarAnimal, estrelasDoMonstro, OVOS } = require('./pets');
const { provocarDeus, aceitarEventoDeus, ignorarDeus, atacarDeus, pedirAjuda, aceitarAjuda, fugirDeus, deusDescansar, statusEvento } = require('./god');
const { criarGuilda, verGuilda, convidarGuilda, aceitarGuilda, sairGuilda, rankingGuildas } = require('./guild');
const { verMasmorras, entrarMasmorra, acampar, pedirCasamento, aceitarCasamento, divorciar, loginDiario } = require('./dungeon');
const { CLASSES, ARMAS, REGIOES, ITENS_LOJA } = require('./gameData');


// ── IMAGENS D20 (Google Drive) ────────────────────────────
const D20_IMAGENS = {
  1: 'https://drive.google.com/uc?export=view&id=18_FmEc55dDYERrGNMCD_TZRGz7QVUzda',
  2: 'https://drive.google.com/uc?export=view&id=1Ubhi4QjNFwwNn-Ui7j1k6L6bm6qoqSAV',
  3: 'https://drive.google.com/uc?export=view&id=1ylL49BC9xbxcURwDke8ipc4IUD0MtxVk',
  4: 'https://drive.google.com/uc?export=view&id=1-rH9VKr7KxCH53nWee33wrbiRxzdvzVr',
  5: 'https://drive.google.com/uc?export=view&id=12EYYPPlYyLHR2wzFDLL87ZWa7pfvUiKE',
  6: 'https://drive.google.com/uc?export=view&id=1kIgcqQWVIpgQ2IwWtD8BwlsmqRX3xA2_',
  7: 'https://drive.google.com/uc?export=view&id=1oGu04p3rJTMxjYFwHZBZ2JFrR7foErCZ',
  8: 'https://drive.google.com/uc?export=view&id=1Yu-06sqifJUceXdBr2d2goydaEBFiu1b',
  9: 'https://drive.google.com/uc?export=view&id=1uuREmW78dgXBeBAJiwnCeuG_XDjctknV',
  10: 'https://drive.google.com/uc?export=view&id=19IEiU3DfyMXzrldyCrLHy_cpxJiMdo9P',
  11: 'https://drive.google.com/uc?export=view&id=1l7_r1baoNi6ffwAjZFsb4sq_99pozky1',
  12: 'https://drive.google.com/uc?export=view&id=1vLnTUsk-m9yE20Ex09O4-lIpkEcQTGgw',
  13: 'https://drive.google.com/uc?export=view&id=18QCwM3YiJi9SO7lVevArsc2zm7yIWY3m',
  14: 'https://drive.google.com/uc?export=view&id=1tNRv0wmTQ7TyJhXTkgt54jphpy5VWHUW',
  15: 'https://drive.google.com/uc?export=view&id=1L6NcQPyfGRkrQy9xw_TIGMQZ6Lk5uC9u',
  16: 'https://drive.google.com/uc?export=view&id=1-4iID-2p6dOya4kQCOM6HCQyb1n3IG3s',
  17: 'https://drive.google.com/uc?export=view&id=1EzhJPoUb80SrASE1Yb12i9SHvC_EZtOZ',
  18: 'https://drive.google.com/uc?export=view&id=1HOMCUM1hak1NncyYv35grnqZitXSBFyt',
  19: 'https://drive.google.com/uc?export=view&id=1Q4bSyhPAL6ZGI1vU8wSUIeTPY7iZeMgd',
  20: 'https://drive.google.com/uc?export=view&id=1GTsMOsEy-ozueJIaKUsiawKGTxc0tQP-',
};

// ── CONFIGURAÇÃO ──────────────────────────────────────────
const DONO_NUMERO = '5567998161300';

// ── FILTRO DE PALAVRÕES ──────────────────────────────────
const PALAVRAS_BANIDAS = [
  'caralho','caralha','porra','merda','merdinha','fdp','pqp','foda','foder','fudido','fudeu','fodase','fodasse','bosta','cocô','mijo','mijada','vsf','vtnc','kct','krl','krls','fds','kc','vai se foder','vai tomar no cu',
  'gozada','goza','gozei','pinto','pinta','pauzudo','rola','kiku','pica','picona','buceta','xoxota','perereca','ppk','ppt','cuzao','cuzão','anal','transar','transa','punheta','peitao','peitos','bunda','bundinha','gostosa','gostoso','rabuda',
  'viado','bicha','traveco','retardado','retardada','arrombado','arrombada','cabaço','otario','otária','corno','vagabundo','vagabunda','vadia','puta','putao','vagaba','biscate','baitola','periquita','oxota','xota',
  'nazi','nazista','hitler','fuhrer','swastika','gestapo','schwarzer nazi',
  'nigger','nigga','faggot','fag','negão racista','escravo','jew','jewboy',
  'fuck','fucker','fucking','shit','bitch','asshole','dick','pussy','cunt','motherfucker','slut','whore',
  'mierda','joder','cabron','gilipollas','coño','hostia','pendejo','chinga','chingada',
  'cazzo','stronzo','troia','vaffanculo','puttana','figa',
  'putain','salope','connard','enculé',
  'scheisse','arschloch','fotze','hure',
  'kahba','sharmuta',
  'ssibal','gaesaeki',
  'k4r4lh0','p0rr4','m3rd4','c4r4lh0','f0d4','c@r@lh0','p0rra'
];

function contemPalavrao(texto) {
  if (!texto || typeof texto !== 'string') return false;
  const limpo = texto.toLowerCase().replace(/[^a-z0-9çãáéíóúâêô\s]/gi, '').trim();
  for (const p of PALAVRAS_BANIDAS) {
    if (limpo.includes(p.toLowerCase())) return true;
    if (limpo.replace(/\s/g, '').includes(p.replace(/\s/g, '').toLowerCase())) return true;
  }
  return false;
}

const DONO_LID = '36821174120703';
const DONO_ID = `${DONO_NUMERO}@s.whatsapp.net`;
const PREFIX = '/';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

const criando = new Map();
const batalhaAtiva = new Map();
let botAtivo = true; // /on e /off
const nomeandoPet = new Map(); // Aguardando nome do pet // Armazena batalhas ativas
const escolhaCaminho = new Map(); // Aguardando escolha de caminho antes da batalha
const pvpAtivo = new Map(); // Armazena PvPs ativos

// ── SEGURANÇA: Limpar batalhas travadas a cada 5 minutos ──
setInterval(() => {
  const agora = Date.now();
  for (const [id, batalha] of batalhaAtiva.entries()) {
    if (agora - batalha.inicio > 5 * 60 * 1000) { // 5 minutos
      batalhaAtiva.delete(id);
      console.log(`⚠️ Batalha travada limpa: ${id}`);
    }
  }
  for (const [id, pvp] of pvpAtivo.entries()) {
    if (agora - pvp.inicio > 15 * 60 * 1000) { // 15 minutos
      pvpAtivo.delete(id);
    }
  }
}, 60 * 1000);
const pendentes_convite = new Map();
const pendentes_casamento = new Map();


// ── ESTILO ────────────────────────────────────────────────
const S = {
  topo: '┏═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┓',
  meio: '┣═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┫',
  baixo: '┗═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┛',
  caixa_topo: '┏═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┓',
  caixa_item: '┃╎✰',
  caixa_inicio: '┃╭━━─ ≪ •❈• ≫ ─━━╮',
  caixa_fim: '┃╰━━─ ≪ •❈• ≫ ─━━╯',
  caixa_baixo: '┗═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┛',
  titulo: (t) => `┣⋆⃟ۣۜ᭪➣ 𖡦 ${t}`,
};

function bloco(titulo, itens) {
  let txt = `${S.topo}\n${S.titulo(titulo)}\n${S.baixo}\n`;
  txt += `${S.caixa_topo}\n${S.caixa_inicio}\n`;
  itens.forEach(i => { txt += `${S.caixa_item} ${i}\n`; });
  txt += `${S.caixa_fim}\n${S.caixa_baixo}`;
  return txt;
}

// ── NORMALIZAR COMANDO ────────────────────────────────────
// Item 3: aceita erros de digitação, maiúsculas, acentos
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const ALIASES = {
  'menu': ['menu', 'meni', 'memu', 'mneu', 'menuu', 'meenu', 'mnu'],
  'rpg': ['rpg', 'rpgg', 'rppg'],
  'info': ['info', 'infoo', 'inof'],
  'lore': ['lore', 'loore', 'lroe'],
  'regras': ['regras', 'regra', 'regas'],
  'dono': ['dono', 'dno', 'doono'],
  'ajuda': ['ajuda', 'ajud', 'ajuta', 'ajdua'],
  'infoarmas': ['infoarmas', 'raridades'],
  'infoarma': ['infoarma'],
  'criar': ['criar', 'crar', 'crair'],
  'roleta': ['roleta', 'rolet', 'rolta', 'girar', 'sortear'],
  'confirmarroleta': ['confirmarroleta', 'confirmaroleta'],
  'perfil': ['perfil', 'perfi', 'perfill', 'perf'],
  'classe': ['classe', 'class', 'clases'],
  'inventario': ['inventario', 'inventaio', 'invetario', 'inv'],
  'conquistas': ['conquistas', 'conquista', 'conq'],
  'titulos': ['titulos', 'titulo', 'titulos'],
  'usartitulo': ['usartitulo', 'usatitulo', 'equipartitulo'],
  'minhaarma': ['minhaarma', 'minhaarm'],
  'batalha': ['batalha', 'batalah', 'batalia', 'batlha', 'btl', 'caminhar', 'caminha'],
  'boss': ['boss', 'bos', 'bosss'],
  'atacar': ['atacar', 'atcar', 'atack'],
  'habilidade': ['habilidade', 'habiliad', 'hab'],
  'ultimate': ['ultimate', 'ultim', 'ult'],
  'd20': ['d20', 'd 20'],
  'dado': ['dado', 'dad', 'rolar'],
  'mapa': ['mapa', 'map', 'mpaa'],
  'regioes': ['regioes', 'regiao', 'regioes'],
  'viajar': ['viajar', 'viaja', 'viajar'],
  'acampar': ['acampar', 'acampa', 'camp'],
  'masmorras': ['masmorras', 'masm'],
  'masmorra': ['masmorra', 'masmorr'],
  'loja': ['loja', 'loj', 'shop', 'lojaa'],
  'lojapets': ['lojapets', 'lojapet', 'lojaovo'],
  'comprar': ['comprar', 'compra', 'compr'],
  'usar': ['usar', 'usa', 'usaar'],
  'equipar': ['equipar', 'equipa', 'equip'],
  'vender': ['vender', 'vende', 'vend'],
  'banco': ['banco', 'banc', 'bnaco'],
  'depositar': ['depositar', 'deposita', 'dep'],
  'sacar': ['sacar', 'sacc', 'saca'],
  'chocar': ['chocar', 'choca', 'chocarovo'],
  'meupet': ['meupet', 'pet', 'meu pet'],
  'soltarpet': ['soltarpet', 'soltapet', 'soltarpt'],
  'curarpet': ['curarpet', 'curarpt', 'curapett'],
  'chamarpet': ['chamarpet', 'chamapet', 'chamarpt'],
  'tentardomar': ['tentardomar', 'domar', 'tentadomar'],
  'animais': ['animais', 'animal', 'animai'],
  'meuanimal': ['meuanimal', 'meoanimal'],
  'soltaranimal': ['soltaranimal', 'soltarnim'],
  'adotar': ['adotar', 'adota', 'adopt'],
  'sacrificio': ['sacrificio', 'sacrif', 'sacr'],
  'aceitarmorte': ['aceitarmorte', 'aceitamorte'],
  'recusarmorte': ['recusarmorte', 'recusamorte'],
  'renascer': ['renascer', 'renasce', 'rensc'],
  'renascer0': ['renascer0'],
  'suicidar': ['suicidar', 'suicida', 'suicidio'],
  'reviver': ['reviver', 'reviv', 'ressuscitar'],
  'aprovar': ['aprovar', 'aprova', 'aprov'],
  'negar': ['negar', 'neg', 'ngr'],
  'libertar': ['libertar', 'liberta', 'libert'],
  'ranking': ['ranking', 'rank', 'rankng'],
  'missoes': ['missoes', 'missao', 'miss'],
  'login': ['login', 'loginn', 'log'],
  'guilda': ['guilda', 'guild', 'gilda'],
  'rankingguildas': ['rankingguildas', 'rankguilda'],
  'criarguilda': ['criarguilda', 'criarguld'],
  'sairguilda': ['sairguilda', 'sairguld'],
  'convidar': ['convidar', 'convida', 'conv'],
  'aceitarguilda': ['aceitarguilda', 'aceitaguilda'],
  'recusarguilda': ['recusarguilda', 'recusaguilda'],
  'casar': ['casar', 'casa', 'casamento'],
  'aceitarcasamento': ['aceitarcasamento', 'aceitarcas'],
  'recusarcasamento': ['recusarcasamento', 'recusarcas'],
  'divorciar': ['divorciar', 'divorcio', 'divorc'],
  'interagir': ['interagir', 'interage', 'interacao'],
  'convidarbeber': ['convidarbeber', 'convidabeber', 'beber'],
  'festa': ['festa', 'festinha'],
  'provocardeus': ['provocardeus', 'provocadeus', 'provokar'],
  'atacardeus': ['atacardeus', 'atacadeus', 'atacardeus'],
  'pedirajuda': ['pedirajuda', 'pediraju', 'ajudadeus'],
  'aceitarajuda': ['aceitarajuda', 'aceitaraju'],
  'fugirdeus': ['fugirdeus', 'fugideus', 'fugirgdeus'],
  'statusevento': ['statusevento', 'statusdeus', 'eventostatus'],
  'encarnar': ['encarnar', 'encarna'],
  'ascender': ['ascender', 'ascende'],
  'deus': ['deus', 'menudeus', 'cmddeus'],
  'adm': ['adm', 'admin', 'administracao', 'admim'],
  'matar': ['matar', 'mata', 'kill'],
  'dar': ['dar', 'daritem', 'give'],
  'abencoar': ['abencoar', 'abencoa', 'bencao'],
  'amaldicoar': ['amaldicoar', 'amaldicoa', 'maldizir'],
  'aceitardeus': ['aceitardeus', 'aceitarevento'],
  'ignorardeus': ['ignorardeus', 'ignorarevento'],
  'deusdescansar': ['deusdescansar', 'deusdorme', 'encerrarevento'],
  'aceitarsacrificio': ['aceitarsacrificio', 'aceitarsacr'],
  'recusarsacrificio': ['recusarsacrificio', 'recusarsacr'],
  'sacrificios': ['sacrificios', 'sacrifpend'],
  'evento': ['evento', 'eventogl'],
  'status': ['status', 'statusbot'],
  'erro': ['erro', 'erros', 'bug'],
  'vererros': ['vererros', 'vererro', 'listaerros'],
  'limparerros': ['limparerros', 'limparerro'],
};

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function resolverCmd(cmd_raw) {
  const n = normalizar(cmd_raw);
  for (const [cmd_real, variantes] of Object.entries(ALIASES)) {
    if (variantes.includes(n)) return cmd_real;
  }
  // Busca aproximada — só erro de digitação real (diferença de no máx 1 letra), nunca prefixo/substring
  for (const [cmd_real, variantes] of Object.entries(ALIASES)) {
    if (variantes.some(v => Math.abs(v.length - n.length) <= 1 && levenshtein(v, n) <= 1)) return cmd_real;
  }
  return n;
}

// ── FUNÇÕES AUXILIARES ────────────────────────────────────
function isDono(id) {
  const limpo = id.replace('@s.whatsapp.net', '').replace('@lid', '');
  return limpo === DONO_NUMERO || limpo === DONO_LID;
}

function extrairMencao(texto, mensagem) {
  const mencoes = mensagem.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mencoes.length > 0) return mencoes[0];
  const match = texto.match(/@(\d+)/);
  return match ? `${match[1]}@s.whatsapp.net` : null;
}

function extrairNumero(jid) {
  return jid?.replace('@s.whatsapp.net', '');
}

// ── DROPS PÓS-BATALHA (comida, poção fraca ou moedas extras) ──
function rolarLootBatalha(jogador_id) {
  const j = db.getJogador(jogador_id);
  if (!j) return null;

  const roll = Math.random() * 100;

  if (roll < 35) {
    // Comida encontrada - cura HP na hora
    const cura = Math.max(5, Math.floor(j.hp_max * (0.10 + Math.random() * 0.15)));
    j.hp = Math.min(j.hp_max, j.hp + cura);
    db.salvarJogador(jogador_id, j);
    return `🍖 Você encontrou comida no corpo do inimigo e comeu!\n❤️ +${cura} HP`;
  }
  if (roll < 55) {
    // Poção fraca - cura HP e mana
    const cura_hp = Math.max(5, Math.floor(j.hp_max * 0.15));
    const cura_mana = Math.max(3, Math.floor((j.mana_max || 0) * 0.15));
    j.hp = Math.min(j.hp_max, j.hp + cura_hp);
    j.mana = Math.min(j.mana_max || 0, (j.mana || 0) + cura_mana);
    db.salvarJogador(jogador_id, j);
    return `🧪 Uma poção fraca caiu do inimigo e você bebeu!\n❤️ +${cura_hp} HP | 💧 +${cura_mana} Mana`;
  }
  if (roll < 80) {
    // Moedas bônus extras
    const bonus = Math.floor(Math.random() * 20 + 10);
    db.adicionarMoedas(jogador_id, bonus);
    return `💰 O inimigo tinha uma bolsinha escondida! +${bonus} Belarium extra`;
  }
  return null; // 20% de chance de não dropar nada
}

// ── EMOJI DE MONSTRO POR TIPO ────────────────────────────────
function emojiMonstro(nome) {
  const n = (nome || '').toLowerCase();
  const mapa = [
    [['lobo', 'wolf'], '🐺'],
    [['morcego', 'bat'], '🦇'],
    [['zumbi', 'zombie'], '🧟'],
    [['esqueleto', 'skeleton'], '💀'],
    [['goblin'], '👺'],
    [['aranha', 'spider'], '🕷️'],
    [['cobra', 'serpente', 'naga'], '🐍'],
    [['dragao', 'dragão', 'dragon'], '🐉'],
    [['fantasma', 'espectro', 'ghost'], '👻'],
    [['orc'], '👹'],
    [['troll'], '🧌'],
    [['urso', 'bear'], '🐻'],
    [['lagarto', 'reptil', 'reptile'], '🦎'],
    [['ave', 'pássaro', 'passaro', 'bird', 'harpia'], '🦅'],
    [['escorpiao', 'escorpião', 'scorpion'], '🦂'],
    [['golem', 'pedra', 'rocha'], '🗿'],
    [['slime', 'gosma'], '🟢'],
    [['demonio', 'demônio', 'demon'], '👹'],
    [['bruxa', 'witch'], '🧙'],
    [['vampiro', 'vampire'], '🧛'],
    [['peixe', 'fish', 'tubarao', 'tubarão'], '🐟'],
    [['leao', 'leão', 'lion'], '🦁'],
  ];
  for (const [chaves, emoji] of mapa) {
    if (chaves.some(k => n.includes(k))) return emoji;
  }
  return '👾';
}

// ── TEXTO DE ENCONTRO POR TIPO DE MONSTRO ─────────────────────
// ── ESCOLHA DE CAMINHO ANTES DA BATALHA ───────────────────────
// ── CENÁRIOS DE EXPLORAÇÃO (múltiplos caminhos, múltiplos desfechos) ──
// Cada opção tem um "tipo" que define o que acontece ao escolhê-la:
//   monstro → cai em batalha  |  bau → achado com moedas/item
//   item    → encontra item solto | evento → evento aleatório (bom ou ruim)
//   nada    → nada acontece, só flavor text
const CENARIOS_EXPLORACAO = [
  {
    intro: '_Você caminha por uma trilha estreita quando o caminho se divide._',
    opcoes: [
      { texto: 'Seguir pela trilha principal', tipo: 'monstro' },
      { texto: 'Cortar caminho pela vegetação densa', tipo: 'bau' },
      { texto: 'Subir pelas pedras à direita', tipo: 'evento' },
    ]
  },
  {
    intro: '_Uma névoa cobre o chão. À frente, caminhos se abrem entre as rochas._',
    opcoes: [
      { texto: 'Ir pelo caminho mais curto e visível', tipo: 'monstro' },
      { texto: 'Contornar por trás das rochas', tipo: 'item' },
      { texto: 'Esperar a névoa passar', tipo: 'nada' },
    ]
  },
  {
    intro: '_Você ouve um barulho estranho ecoando ao longe._',
    opcoes: [
      { texto: 'Investigar de onde vem o barulho', tipo: 'monstro' },
      { texto: 'Ignorar e seguir seu rumo normalmente', tipo: 'nada' },
      { texto: 'Seguir cauteloso, na ponta dos pés', tipo: 'evento' },
      { texto: 'Procurar um esconderijo próximo', tipo: 'bau' },
    ]
  },
  {
    intro: '_Pegadas estranhas marcam o chão à sua frente, seguindo em direções diferentes._',
    opcoes: [
      { texto: 'Seguir as pegadas maiores', tipo: 'monstro' },
      { texto: 'Seguir as pegadas menores', tipo: 'item' },
      { texto: 'Ignorar as pegadas e seguir em frente', tipo: 'nada' },
    ]
  },
  {
    intro: '_Uma velha construção em ruínas surge no meio do caminho._',
    opcoes: [
      { texto: 'Entrar pela porta principal', tipo: 'monstro' },
      { texto: 'Vasculhar os escombros do lado de fora', tipo: 'bau' },
      { texto: 'Entrar por uma brecha na parede', tipo: 'evento' },
      { texto: 'Rodear a construção', tipo: 'item' },
      { texto: 'Seguir direto, sem se aproximar', tipo: 'nada' },
    ]
  },
  {
    intro: '_Você chega a uma clareira com um brilho estranho vindo do chão._',
    opcoes: [
      { texto: 'Cavar onde está o brilho', tipo: 'bau' },
      { texto: 'Tocar o brilho com cautela', tipo: 'evento' },
      { texto: 'Ignorar e atravessar a clareira', tipo: 'monstro' },
      { texto: 'Observar de longe antes de agir', tipo: 'item' },
    ]
  },
  {
    intro: '_O caminho se estreita entre árvores altas e retorcidas._',
    opcoes: [
      { texto: 'Seguir pelo meio das árvores', tipo: 'monstro' },
      { texto: 'Andar pela beirada, mais devagar', tipo: 'nada' },
      { texto: 'Subir numa árvore pra ver o que tem à frente', tipo: 'item' },
    ]
  },
];

function gerarCenario() {
  return CENARIOS_EXPLORACAO[Math.floor(Math.random() * CENARIOS_EXPLORACAO.length)];
}

function flavorMonstro(nome) {
  const n = (nome || '').toLowerCase();
  const grupos = [
    { chaves: ['lobo', 'wolf'], frases: [
      '_Um uivo cortou o silêncio antes dele saltar das sombras._',
      '_Você sentiu os olhos famintos dele antes de vê-lo._',
      '_Passos rápidos na folhagem — tarde demais pra fugir._'
    ]},
    { chaves: ['zumbi', 'zombie', 'múmia', 'mumia'], frases: [
      '_Um cheiro podre anunciou a chegada muito antes dele aparecer._',
      '_Ele se arrasta gemendo, faminto por carne fresca._',
      '_Faixas apodrecidas se arrastam pelo chão enquanto ele avança._'
    ]},
    { chaves: ['esqueleto', 'skeleton', 'cavaleiro morto', 'wraith'], frases: [
      '_Ossos rangeram no escuro — algo antigo despertou._',
      '_Uma armadura enferrujada se ergue sozinha das ruínas._'
    ]},
    { chaves: ['goblin'], frases: [
      '_Uma risada aguda ecoou entre as pedras antes dele pular na sua frente._',
      '_Olhos amarelos espreitam por trás das moitas._'
    ]},
    { chaves: ['aranha', 'spider', 'escorpiao', 'escorpião'], frases: [
      '_Teias grudaram no seu rosto — tarde demais pra perceber o perigo._',
      '_Um ferrão reluzente se ergue entre as pedras._'
    ]},
    { chaves: ['fantasma', 'espectro', 'ghost', 'espirito', 'espírito', 'alma perdida', 'sombra errante', 'poltergeist', 'banshee'], frases: [
      '_O ar esfriou de repente, e uma forma translúcida surgiu._',
      '_Um lamento distante ecoa antes de tudo ficar gelado._',
      '_As sombras se contorcem de um jeito que não deveriam._'
    ]},
    { chaves: ['orc', 'troll'], frases: [
      '_Passos pesados fizeram o chão tremer antes dele aparecer._',
      '_Um grunhido grave ecoa entre as árvores._'
    ]},
    { chaves: ['guarda', 'soldado', 'cavaleiro', 'ladrão', 'ladrao', 'bêbado', 'bebado'], frases: [
      '_Uma figura armada bloqueou seu caminho, hostil._',
      '_Ele te encara com desconfiança, mão na arma._'
    ]},
    { chaves: ['bruxa', 'witch'], frases: ['_Um cheiro de ervas queimadas anunciou a presença dela._'] },
    { chaves: ['vampiro', 'vampire', 'anjo caído', 'anjo caido', 'serafim corrompido'], frases: [
      '_Uma sombra rápida demais pra ser humana passou por você._',
      '_Asas rasgadas se abrem contra a luz fraca._'
    ]},
    { chaves: ['dragao', 'dragão', 'dragon', 'wyrm', 'drake', 'fênix', 'fenix', 'titã', 'tita'], frases: [
      '_O céu escureceu com a sombra de asas colossais._',
      '_Um rugido faz o chão tremer sob seus pés._'
    ]},
    { chaves: ['elemental', 'salamandra', 'golem', 'demonio', 'demônio', 'djinn'], frases: [
      '_O ar ao redor distorce, quente e instável._',
      '_Pedras e chamas se erguem formando uma silhueta._'
    ]},
    { chaves: ['rato'], frases: ['_Algo pequeno e rápido corre entre os seus pés._'] },
    { chaves: ['planta', 'carnivora', 'carnívora'], frases: ['_Um cheiro doce demais esconde algo perigoso à espreita._'] },
    { chaves: ['guardião', 'guardiao', 'protetor', 'ser do éter', 'ser do eter', 'tempestade'], frases: ['_Uma presença antiga observa cada movimento seu._'] },
    { chaves: ['fada', 'duende'], frases: ['_Uma risadinha aguda ecoa antes de algo pequeno atacar._'] },
    { chaves: ['coelho', 'cachorro', 'gato', 'raposa', 'javali', 'coruja', 'aguia', 'águia', 'urso', 'tigre', 'leao', 'leão'], frases: ['_Um animal selvagem cruzou seu caminho, alerta._'] },
  ];
  for (const g of grupos) {
    if (g.chaves.some(k => n.includes(k))) return g.frases[Math.floor(Math.random() * g.frases.length)];
  }
  const genericas = [
    '_Enquanto caminhava, você deu de cara com um inimigo._',
    '_Do meio da vegetação, algo saltou pra cima de você._',
    '_Um rugido baixo avisou que você não estava sozinho._',
    '_Você virou a esquina e encontrou o perigo._',
    '_Um farfalhar estranho antecede o ataque._',
    '_Seu coração dispara — algo se aproxima na escuridão._'
  ];
  return genericas[Math.floor(Math.random() * genericas.length)];
}

// ── FLAVOR DE ATAQUE (turno a turno, pra não ficar seco) ──────
function flavorAtaqueJogador() {
  const frases = [
    'Você avança com tudo!',
    'Um golpe certeiro corta o ar!',
    'Você mira e ataca sem hesitar!',
    'Com um grito, você parte pra cima!',
    'Seus reflexos entram em ação!',
    'Você aproveita a brecha e ataca!'
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

function flavorContraAtaque(nome) {
  const frases = [
    `${nome} revida com força!`,
    `${nome} não fica pra trás e contra-ataca!`,
    `${nome} avança e acerta um golpe de volta!`,
    `${nome} ruge e retalia!`
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}


function horaAtual() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ── CONEXÃO ───────────────────────────────────────────────
let sock = null;
let tentativas_reconexao = 0;
const MAX_TENTATIVAS = 10;

async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['IMPERIUS', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    retryRequestDelayMs: 2000
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    const express = require('express');
    const qrcode = require('qrcode');
    const app = express();
    let qrAtual = '';

    app.get('/', async (req, res) => {
      if (!qrAtual) return res.send('<h2>Aguardando QR Code...</h2>');
      const qrImg = await qrcode.toDataURL(qrAtual);
      res.send(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111"><div style="text-align:center"><h2 style="color:white">IMPERIUS — Escaneie o QR Code</h2><img src="${qrImg}" style="width:300px"/><p style="color:gray">Atualiza a cada 30s</p></div></body><script>setTimeout(()=>location.reload(),30000)</script></html>`);
    });

    if (!global.qrServerStarted) {
      global.qrServerStarted = true;
      app.listen(3001, () => console.log(GREEN + '[SISTEMA] QR disponível na URL do Railway' + RESET));
    }

    sock.ev.on('connection.update', ({ qr }) => {
      if (qr) { qrAtual = qr; console.log('📱 QR Code atualizado!'); }
    });
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(GREEN + '[SISTEMA] IMPERIUS conectado!' + RESET);
      tentativas_reconexao = 0;
    }
    if (connection === 'close') {
      const codigo = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const deve_reconectar = codigo !== DisconnectReason.loggedOut;
      if (deve_reconectar && tentativas_reconexao < MAX_TENTATIVAS) {
        tentativas_reconexao++;
        const delay = Math.min(5000 * tentativas_reconexao, 60000);
        console.log(`🔄 Tentativa ${tentativas_reconexao}/${MAX_TENTATIVAS} em ${delay/1000}s...`);
        setTimeout(conectar, delay);
      } else if (codigo === DisconnectReason.loggedOut) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        setTimeout(conectar, 3000);
      } else {
        setTimeout(conectar, 30000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      try { await processarMensagem(msg); }
      catch (err) { console.error('Erro:', err); }
    }
  });
}

async function enviar(jid, texto, mencoes = []) {
  try { await sock.sendMessage(jid, { text: texto, mentions: mencoes }); }
  catch (err) { console.error('Erro ao enviar:', err); }
}

// ── PROCESSADOR ───────────────────────────────────────────
async function processarMensagem(msg) {
  const jid = msg.key.remoteJid;
  const from = msg.key.participant || msg.key.remoteJid;
  const isGrupo = jid.endsWith('@g.us');
  if (!isGrupo) return;

  const texto_raw = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption || '';
  const texto = texto_raw.trim();

  if (!texto.startsWith(PREFIX)) {
    if (escolhaCaminho.has(from)) {
      const cenario = escolhaCaminho.get(from);
      const n = parseInt(texto.trim());
      if (Number.isInteger(n) && n >= 1 && n <= cenario.opcoes.length) {
        escolhaCaminho.delete(from);
        await resolverEncontro(cenario.opcoes[n - 1].tipo, from, jid);
      }
      return;
    }
    if (nomeandoPet.has(from)) {
      const { criatura_id } = nomeandoPet.get(from);
      nomeandoPet.delete(from);
      const resultado = nomearPet(from, criatura_id, texto.trim());
      await enviar(jid, resultado);
      return;
    }
    if (criando.has(from)) await processarCriacao(from, jid, texto, msg);
    if (batalhaAtiva.has(from)) await processarTurnoBatalha(from, jid, texto);
    return;
  }

  const [cmd_raw, ...args] = texto.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = resolverCmd(cmd_raw); // ← resolve erros de digitação
  const resto = args.join(' ');
  // Extrair número real
  let num = from.replace('@s.whatsapp.net','').replace('@lid','').split(':')[0];
  // Se começa com número muito curto ou parece ID, tenta pegar do pushName
  if (num.length < 8) num = msg.pushName || num;

  // ── MENU COM IMAGEM ──────────────────────────────────────
  if (cmd === 'menu') {
    if (batalhaAtiva && batalhaAtiva.has(from)) {
      return enviar(jid, bloco('⚔️ EM BATALHA 【❌】', [
        'Você está em batalha!',
        '━━━━━━━━━━',
        '/fugir — Fugir da batalha',
        '/matar — Atacar',
        '/mochila — Usar item'
      ]));
    }
    // Menu atualizado
    const menu_txt = `${S.topo}
${S.titulo('𝐈𝐌𝐏𝐄𝐑𝐈𝐔𝐒 ⚔️')}
${S.baixo}

${S.caixa_topo}
${S.caixa_inicio}
┃╎✫✫✫✫✫
┃╎  Olá, aventureiro! 👋
┃╎✫✫✫✫✫
${S.caixa_fim}
${S.caixa_baixo}

` + bloco('𝐆𝐄𝐑𝐀𝐋 【📋】', ['ℹ️ /info', '🆘 /ajuda']) + `

${S.caixa_topo}
${S.caixa_inicio}
┃╎ ⚔️ /rpg — Entrar no mundo
${S.caixa_fim}
${S.caixa_baixo}

${S.topo}
${S.titulo('⚔️ Evolua ou morra.')}
${S.baixo}`;
    const img_menu = require('path').join(__dirname, 'menu.jpg');
    if (require('fs').existsSync(img_menu)) {
      await sock.sendMessage(jid, {
        image: require('fs').readFileSync(img_menu),
        caption: menu_txt,
        mimetype: 'image/jpeg'
      });
    } else {
      await sock.sendMessage(jid, { text: menu_txt });
    }
    return;
  }
  // ── MENU OLD ──────────────────────────────────────────────

  // ── RPG ───────────────────────────────────────────────────
  if (cmd === 'rpg') {
    return enviar(jid, bloco('𝐈𝐌𝐏𝐄𝐑𝐈𝐔𝐒 【📋】', [
      '👤 PERSONAGEM',
      '  ↳ /criar — Criar personagem',
      '  ↳ /perfil — Ver sua ficha',
      '  ↳ /classe — Ver sua classe',
      '  ↳ /inventario — Ver itens',
      '  ↳ /minhaarma — Ver arma',
      '  ↳ /equipar — Equipar arma',
      '  ↳ /criar — Criar novo (se morto)',
      '  ↳ /suicidar — Tirar a própria vida',
      '',
      '⚔️ BATALHA',
      '  ↳ /caminhar — Lutar contra monstros',
      '  ↳ /matar — Atacar no turno',
      '  ↳ /fugir — Fugir da batalha',
      '  ↳ /mochila — Usar item',
      '  ↳ /chamarpet — Chamar pet',
      '  ↳ /habilidade — Usar habilidade',
      '  ↳ /boss — Enfrentar boss',
      '  ↳ /atacar — PvP @jogador',
      '  ↳ /tentardomar — Domar criatura',
      '  ↳ /d20 — Rolar dado',
      '  ↳ /masmorras — Ver masmorras',
      '  ↳ /masmorra — Entrar masmorra',
      '',
      '🗺️ MUNDO',
      '  ↳ /viajar — Viajar para região',
      '  ↳ /regioes — Ver todas regiões',
      '  ↳ /acampar — Descansar',
      '  ↳ /mapa — Mapa do IMPERIUS',
      '',
      '💰 ECONOMIA',
      '  ↳ /loja — Ver loja completa',
      '  ↳ /comprar — Comprar item/arma',
      '  ↳ /usar — Usar item',
      '  ↳ /banco — Ver saldo',
      '  ↳ /depositar — Depositar',
      '  ↳ /sacar — Sacar',
      '  ↳ /doar — Doar Belarium',
      '',
      '🐾 PETS',
      '  ↳ /lojapets — Loja de ovos',
      '  ↳ /meupet — Ver seu pet',
      '  ↳ /chocar — Chocar ovo',
      '  ↳ /chamarpet — Chamar pet/animal',
      '  ↳ /soltarpet — Soltar pet',
      '  ↳ /curarpet — Curar pet',
      '',
      '🐺 ANIMAIS SELVAGENS',
      '  ↳ /tentardomar — Domar em batalha',
      '  ↳ /animais — Bestiário (raridade ★)',
      '  ↳ /meuanimal — Ver seu animal',
      '  ↳ /soltaranimal — Soltar animal',
      '  ↳ /adotar [nome] — Adotar (1★, loja)',
      '',
      '👥 SOCIAL',
      '  ↳ /guilda — Ver guilda',
      '  ↳ /criarguilda — Criar guilda',
      '  ↳ /convidar — Convidar membro',
      '  ↳ /ranking — Top jogadores',
      '  ↳ /missoes — Ver missões',
      '  ↳ /login — Recompensa diária',
      '  ↳ /casar — Casar @jogador',
      '  ↳ /divorciar — Divorciar',
      '',
      'ℹ️ GERAL',
      '  ↳ /menu — Menu principal',
      '  ↳ /info — Informações do bot',
      '  ↳ /lore — História do IMPERIUS',
      '  ↳ /infoarmas — Raridades de armas',
      '  ↳ /regras — Regras do jogo',
      '  ↳ /dono — Sobre o criador',
      '  ↳ /ajuda — Suporte'
    ]));
  }

  // ── INFO ──────────────────────────────────────────────────
  if (cmd === 'info') {
    return enviar(jid,
      bloco('𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐎𝐄𝐒 【ℹ️】', [
        '🎮 IMPERIUS',
        '📌 Versão: V0.5',
        '🌍 Bot RPG para WhatsApp',
        '━━━━━━━━━━',
        '👑 Criado por: JUVENT',
        '🤝 Auxiliado por: Arabella',
        '━━━━━━━━━━',
        '📸 @imperius_rpg',
        '📱 +55 67 99816-1300',
        '━━━━━━━━━━',
        '📖 RPG completo com batalhas,',
        '   pets, guildas, masmorras',
        '   e muito mais!',
        '━━━━━━━━━━',
        '🆘 /ajuda'
      ])
    );
  }

  // ── LORE ──────────────────────────────────────────────────
  if (cmd === 'lore') {
    return enviar(jid, bloco('𝐋𝐎𝐑𝐄 𝐃𝐎 𝐈𝐌𝐏𝐄𝐑𝐈𝐔𝐒 【📚】', [
      '🌍 O QUE É O IMPERIUS?',
      '━━━━━━━━━━',
      'IMPERIUS é um mundo paralelo.',
      'Um reino onde guerreiros,',
      'magos e assassinos vivem',
      'e morrem pela glória.',
      '',
      'Aqui não existem leis.',
      'Existe apenas poder.',
      'Quem é forte, sobrevive.',
      'Quem é fraco, perece.',
      '━━━━━━━━━━',
      '⚔️ COMO FUNCIONA?',
      '━━━━━━━━━━',
      'Você escolhe sua classe',
      'e escreve sua história.',
      '',
      'Batalhe monstros.',
      'Explore 21 regiões.',
      'Forme guildas.',
      'Adote pets míticos.',
      'Enfrente o próprio Deus.',
      '',
      'Cada escolha importa.',
      'Cada morte tem peso.',
      'Cada vitória tem glória.',
      '━━━━━━━━━━',
      '🗺️ O MUNDO',
      '━━━━━━━━━━',
      'De Valdris, a capital,',
      'até o Céu Flutuante',
      'de Solvaryn.',
      '',
      'Cada região tem monstros,',
      'bosses e segredos.',
      '',
      'Apenas os mais fortes',
      'chegam às regiões finais.',
      '━━━━━━━━━━',
      'Entre. Escolha. Conquiste.',
      '⚔️ Evolua ou morra.'
    ]));
  }

  if (cmd === 'lore_old') {
    return enviar(jid,
      bloco('𝐋𝐎𝐑𝐄 𝐃𝐎 𝐈𝐌𝐏𝐄𝐑𝐈𝐔𝐒 【📚】', [
        '🌍 O QUE É O IMPERIUS?',
        '━━━━━━━━━━',
        'IMPERIUS é um mundo paralelo.',
        'Um reino onde guerreiros,',
        'magos e assassinos vivem',
        'e morrem pela glória.',
        '',
        'Aqui não existem leis.',
        'Existe apenas poder.',
        'Quem é forte, sobrevive.',
        'Quem é fraco, perece.',
        '━━━━━━━━━━',
        '⚔️ COMO FUNCIONA?',
        '━━━━━━━━━━',
        'Você escolhe sua classe',
        'e escreve sua história.',
        '',
        'Batalhe monstros.',
        'Explore 21 regiões.',
        'Forme guildas.',
        'Adote pets míticos.',
        'Enfrente o próprio Deus.',
        '',
        'Cada escolha importa.',
        'Cada morte tem peso.',
        'Cada vitória tem glória.',
        '━━━━━━━━━━',
        '🗺️ O MUNDO',
        '━━━━━━━━━━',
        'De Valdris, a capital,',
        'até o Céu Flutuante',
        'de Solvaryn.',
        '',
        'Cada região tem monstros,',
        'bosses e segredos.',
        '',
        'Apenas os mais fortes',
        'chegam às regiões finais.',
        '━━━━━━━━━━',
        'Entre. Escolha. Conquiste.',
        '⚔️ Evolua ou morra.'
      ])
    );
  }

  // ── REGRAS ────────────────────────────────────────────────
  if (cmd === 'regras') {
    return enviar(jid,
      bloco('𝐑𝐄𝐆𝐑𝐀𝐒 𝐃𝐎 𝐈𝐌𝐏𝐄𝐑𝐈𝐔𝐒 【📜】', [
        '1️⃣ Respeite todos',
        '2️⃣ Não abuse de bugs',
        '3️⃣ PvP é livre',
        '4️⃣ Mortes são permanentes',
        '5️⃣ O Dono tem poder total',
        '6️⃣ Sacrifícios irrevogáveis',
        '7️⃣ Classes raras: roleta',
        '8️⃣ Pets: ovos e chocagem',
        '9️⃣ Guildas: respeito mútuo',
        '🔟 Deus: nunca é derrotado',
        '━━━━━━━━━━',
        '⚔️ Evolua ou morra.'
      ])
    );
  }

  // ── DONO ──────────────────────────────────────────────────
  if (cmd === 'dono') {
    return enviar(jid, bloco('𝐃𝐎𝐍𝐎 【👑】', [
      '👑 JUVENT',
      '_Criador do IMPERIUS_',
      '━━━━━━━━━━',
      '_Auxiliado por Arabella_',
      '━━━━━━━━━━',
      '📸 @imperius_rpg',
      '📱 +55 67 99816-1300'
    ]));
  }

  if (cmd === 'dono_old') {
    return enviar(jid,
      bloco('𝐃𝐎𝐍𝐎 𝐃𝐎 𝐈𝐌𝐏𝐄𝐑𝐈𝐔𝐒 【👑】', [
        '🧙‍♂️ JUVENT 👑',
        'O Arquiteto do Caos.',
        'O Primeiro Deus.',
        '━━━━━━━━━━',
        '📜 LORE:',
        'Antes do mundo existir,',
        'havia apenas o silêncio.',
        'JUVENT rompeu esse silêncio',
        'com sangue e fogo.',
        'Ele não criou o IMPERIUS',
        '— ele O É.',
        '━━━━━━━━━━',
        '☠️ ARMA DE DEUS:',
        '🌑 Foice da Criação',
        'Raridade: ☠️ DEUS',
        'Dano: INFINITO',
        '━━━━━━━━━━',
        '🌟 HABILIDADES:',
        '• Corte da Criação',
        '• Julgamento Divino',
        '• Manifestação do Deus',
        '• Renascimento do Mundo',
        '━━━━━━━━━━',
        '📩 +55 67 99816-1300',
        '━━━━━━━━━━',
        '"Eu não criei esta arma',
        'para vencer batalhas...',
        'Eu a criei para lembrar',
        'que sou o começo e o fim."',
        '— JUVENT 💀'
      ])
    );
  }

  // ── AJUDA ─────────────────────────────────────────────────
  if (cmd === 'ajuda') {
    return enviar(jid,
      bloco('𝐀𝐉𝐔𝐃𝐀 【🆘】', [
        '🤔 Está perdido?',
        '_Não há vergonha nisso..._',
        '━━━━━━━━━━',
        '🔸 Como criar personagem?',
        '  Digite /criar',
        '',
        '🔸 Como batalhar?',
        '  Digite /caminhar',
        '',
        '🔸 Como ganhar moedas?',
        '  Batalhe e complete missões',
        '',
        '🔸 Morri, e agora?',
        '  Digite /criar para recomeçar',
        '',
        '🔸 Como ter pet?',
        '  Compre ovo na /lojapets',
        '  e use /chocar',
        '',
        '🔸 Como entrar em guilda?',
        '  Peça convite ao líder',
        '━━━━━━━━━━',
        '📩 +55 67 99816-1300',
        '⚔️ Evolua ou morra.'
      ])
    );
  }

  // ── INFOARMAS ─────────────────────────────────────────────
  if (cmd === 'armas' || cmd === 'armasc' || cmd === 'armasd' || cmd === 'armasm') {
    const sub = cmd === 'armasc' ? 'contato' : cmd === 'armasd' ? 'distancia' : cmd === 'armasm' ? 'magicas' : (resto ? resto.toLowerCase().trim() : '');
    if (sub === 'contato' || sub === 'contato') {
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 𝐃𝐄 𝐂𝐎𝐍𝐓𝐀𝐓𝐎 【⚔️】', [
        '🗡️ Espada Enferrujada (@ACC) — 🪙 50 | Dano: 5-12 | ⬜',
        '🪓 Machadinha do Lenhador (@ACM) — 🪙 48 | Dano: 5-12 | ⬜',
        '🪵 Clava de Madeira (@ACCL) — 🪙 28 | Dano: 5-11 | ⬜',
        '🔨 Martelo de Ferro Velho (@ACMF) — 🪙 42 | Dano: 5-12 | ⬜',
        '⚔️ Espada de Ferro (@ACEI) — 🪙 200 | Dano: 12-22 | 🟩',
        '🪓 Machado de Guerra (@ACMG) — 🪙 240 | Dano: 14-25 | 🟩',
        '⚔️ Espada de Aço (@ACEA) — 🪙 800 | Dano: 25-40 | 🟦',
        '🩸 Machado Sanguinário (@ACMS) — 🪙 930 | Dano: 29-47 | 🟦',
        '💀 Espada das Almas (@ACES) — 🪙 3000 | Dano: 45-65 | 🟪',
        '👊 Manopla do Titã (@ACMT) — 🪙 3500 | Dano: 50-70 | 🟪',
        '✨ Excalibur (@ACEX) — 🪙 12000 | Dano: 70-100 | 🟨',
        '⚔️ Espada do Destino (@ACED) — 🪙 13500 | Dano: 72-102 | 🟨',
        '⚔️ Espada Ancestral (@ACAN) — 🪙 35000 | Dano: 90-130 | 🔶',
        '━━━━━━━━━━',
        '💡 /comprar @ACC'
      ]));
    }
    if (sub === 'distancia' || sub === 'distância') {
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 𝐃𝐄 𝐃𝐈𝐒𝐓𝐀̂𝐍𝐂𝐈𝐀 【🏹】', [
        '🏹 Arco Simples (@ADAs) — 🪙 45 | Dano: 4-10 | ⬜',
        '💨 Zarabatana (@ADZ) — 🪙 22 | Dano: 3-8 | ⬜',
        '🪢 Chicote de Couro (@ADCC) — 🪙 33 | Dano: 3-9 | ⬜',
        '🏹 Arco do Caçador (@ADAC) — 🪙 180 | Dano: 10-20 | 🟩',
        '🌲 Arco da Floresta (@ADAF) — 🪙 198 | Dano: 11-21 | 🟩',
        '🏹 Arco Élfico (@ADAE) — 🪙 750 | Dano: 22-38 | 🟦',
        '💨 Arco dos Ventos (@ADAV) — 🪙 780 | Dano: 23-39 | 🟦',
        '☠️ Arco da Morte (@ADAM) — 🪙 3100 | Dano: 42-62 | 🟪',
        '⚡ Arco dos Raios (@ADAR) — 🪙 3150 | Dano: 43-63 | 🟪',
        '🏹 Arco de Ártemis (@ADAA) — 🪙 11000 | Dano: 65-95 | 🟨',
        '🌌 Arco do Cosmos (@ADAK) — 🪙 12500 | Dano: 67-97 | 🟨',
        '🏹 Arco Ancestral (@ADAN) — 🪙 32000 | Dano: 85-125 | 🔶',
        '━━━━━━━━━━',
        '💡 /comprar @ADAs'
      ]));
    }
    if (sub === 'magicas' || sub === 'mágicas') {
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 𝐌𝐀́𝐆𝐈𝐂𝐀𝐒 【🪄】', [
        '🪄 Cajado de Madeira (@AMCm) — 🪙 40 | Dano: 3-9 | ⬜',
        '🪄 Cajado de Osso (@AMCo) — 🪙 85 | Dano: 6-14 | 🟫',
        '🪄 Cajado Arcano (@AMCa) — 🪙 220 | Dano: 8-18 | 🟩',
        '🌿 Cajado da Natureza (@AMCn) — 🪙 190 | Dano: 9-19 | 🟩',
        '🔮 Cajado Mágico (@AMCm2) — 🪙 850 | Dano: 20-35 | 🟦',
        '🔥 Cajado das Chamas (@AMCf) — 🪙 860 | Dano: 22-37 | 🟦',
        '⛈️ Cajado da Tempestade (@AMCt) — 🪙 840 | Dano: 21-36 | 🟦',
        '🌀 Cajado Abissal (@AMCab) — 🪙 3200 | Dano: 38-58 | 🟪',
        '⏳ Cajado do Tempo (@AMCtp) — 🪙 3050 | Dano: 41-61 | 🟪',
        '⚡ Bastão de Odin (@AMBo) — 🪙 13000 | Dano: 68-98 | 🟨',
        '♾️ Cajado da Eternidade (@AMCe) — 🪙 14000 | Dano: 70-100 | 🟨',
        '🪄 Cajado Ancestral (@AMCan) — 🪙 30000 | Dano: 82-122 | 🔶',
        '━━━━━━━━━━',
        '💡 /comprar @AMCm'
      ]));
    }
    // Default - show categories
    return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 【⚔️】', [
      '⚔️ /armas contato — Espadas, machados...',
      '🏹 /armas distancia — Arcos, zarabatanas...',
      '🪄 /armas magicas — Cajados, bastões...'
    ]));
  }

  if (cmd === 'infoarmas') {
    return enviar(jid,
      bloco('𝐑𝐀𝐑𝐈𝐃𝐀𝐃𝐄𝐒 𝐃𝐄 𝐀𝐑𝐌𝐀𝐒 【📖】', [
        '⬜ Comum', '🟫 Inferior', '🟩 Incomum',
        '🟦 Raro', '🟪 Épico', '🟨 Lendário',
        '🔶 Ancestral', '🔷 Arcana', '🔴 Primordial',
        '🟠 Abissal', '⚫ Sombria', '🌑 Amaldiçoada',
        '🌟 Celestial', '☀️ Solar', '🌊 Abissal Marinha',
        '❄️ Glacial Eterna', '🔥 Infernal',
        '⚡ Relâmpago Divino', '🌈 Primeva', '☠️ DEUS',
        '━━━━━━━━━━',
        '🔍 /infoarma [raridade]',
        'Ex: /infoarma raro'
      ])
    );
  }

  if (cmd === 'infoarma') {
    if (!resto) return enviar(jid, bloco('❌ ERRO 【⚠️】', [
      'Use: /infoarma [raridade]',
      '━━━━━━━━━━',
      'Ex: /infoarma raro',
      'Ex: /infoarma legendario',
      '/infoarmas — Ver todas raridades'
    ]));
    const mapa = {
      'comum':'⬜ Comum','inferior':'🟫 Inferior','incomum':'🟩 Incomum',
      'raro':'🟦 Raro','epico':'🟪 Épico','épico':'🟪 Épico',
      'lendario':'🟨 Lendário','lendário':'🟨 Lendário',
      'ancestral':'🔶 Ancestral','arcana':'🔷 Arcana','arcano':'🔷 Arcana',
      'primordial':'🔴 Primordial','abissal':'🟠 Abissal',
      'sombria':'⚫ Sombria','amaldicada':'🌑 Amaldiçoada','amaldiçoada':'🌑 Amaldiçoada',
      'celestial':'🌟 Celestial','solar':'☀️ Solar',
      'glacial':'❄️ Glacial Eterna','infernal':'🔥 Infernal',
      'relampago':'⚡ Relâmpago Divino','relâmpago':'⚡ Relâmpago Divino',
      'primeva':'🌈 Primeva','deus':'☠️ DEUS'
    };
    const raridade = mapa[normalizar(resto)] || mapa[resto.toLowerCase()];
    if (!raridade) return enviar(jid, `❌ Raridade não encontrada!\nUse /infoarmas para ver a lista.`);
    const armas_f = ARMAS.filter(a => a.raridade === raridade);
    if (!armas_f.length) return enviar(jid, `❌ Nenhuma arma nessa raridade!`);
    const itens = armas_f.map(a => `${a.nome} | Dano: ${a.dano[0]}-${a.dano[1]}${a.exclusiva ? ' 🔒' : ''}`);
    return enviar(jid, bloco(`${raridade} 【⚔️】`, itens));
  }

  // ── DEUS (menu do dono) ────────────────────────────────────
  if (cmd === 'deus' && isDono(from)) {
    return enviar(jid,
      bloco('𝐌𝐄𝐍𝐔 𝐃𝐎 𝐃𝐄𝐔𝐒 【☠️】', [
        '⚔️ EVENTO DIVINO:',
        '  /aceitardeus — Aceitar provocação',
        '  /ignorardeus — Ignorar provocação',
        '  /deusdescansar — Encerrar evento',
        '━━━━━━━━━━',
        '💰 ECONOMIA:',
        '  /darmoedas @jogador [valor]',
        '  /tirarmoedas @jogador [valor]',
        '━━━━━━━━━━',
        '👑 PODERES:',
        '  /matar @jogador',
        '  /dar @jogador [item]',
        '  /abencoar @jogador',
        '  /amaldicoar @jogador',
        '━━━━━━━━━━',
        '🩸 SACRIFÍCIOS:',
        '  /aceitarsacrificio @jogador',
        '  /recusarsacrificio @jogador',
        '  /sacrificios',
        '━━━━━━━━━━',
        '🌟 ENCARNAÇÃO:',
        '  /encarnar [nome]',
        '  /ascender',
        '━━━━━━━━━━',
        '📊 /status | /evento [msg]'
      ])
    );
  }

  // ── ADM ───────────────────────────────────────────────────
  if (cmd === 'adm' && isDono(from)) {
    return enviar(jid,
      bloco('𝐌𝐄𝐍𝐔 𝐀𝐃𝐌 【🛡️】', [
        '👥 JOGADORES:',
        '  /matar @jogador',
        '  /dar @jogador [item]',
        '  /abencoar @jogador',
        '  /amaldicoar @jogador',
        '━━━━━━━━━━',
        '💰 ECONOMIA:',
        '  /darmoedas @jogador [valor]',
        '  /tirarmoedas @jogador [valor]',
        '━━━━━━━━━━',
        '🩸 SACRIFÍCIOS:',
        '  /aceitarsacrificio @jogador',
        '  /recusarsacrificio @jogador',
        '  /sacrificios',
        '━━━━━━━━━━',
        '📊 SISTEMA:',
        '  /status',
        '  /evento [mensagem]',
        '  /statusevento'
      ])
    );
  }

  // ── CRIAR PERSONAGEM ──────────────────────────────────────
  if (cmd === 'criar') {
    const existe = db.getJogador(from);
    if (existe && !existe.morto) return enviar(jid, `┏━━━━━━━━━━━━━━━━┓\n❌ Você já tem personagem!\nUse /perfil para ver.\n┗━━━━━━━━━━━━━━━━┛`);
    const { texto: menu_texto } = menuClasses();
    criando.set(from, { etapa: 'classe', dados: {} });
    const img_cri = require('path').join(__dirname, 'criar.jpg');
    if (require('fs').existsSync(img_cri)) {
      try {
        await sock.sendMessage(jid, {
          image: require('fs').readFileSync(img_cri),
          caption: '⚔️ _Bem-vindo ao IMPERIUS, aventureiro..._',
          mimetype: 'image/jpeg'
        });
      } catch(e) {}
    }
    return enviar(jid, menu_texto + '\n\n' + bloco('𝐓𝐄𝐍𝐓𝐄 𝐒𝐔𝐀 𝐒𝐎𝐑𝐓𝐄 【🎰】', [
      '🎰 Quer tentar uma classe RARA?',
      'Digite /roleta para tentar!',
      '_Pode sair algo épico..._',
      '_...ou o Deus pode bloquear._ ☠️'
    ]));
  }

  if (cmd === 'roleta') {
    const j = db.getJogador(from);
    if (!j) {
      // Sem personagem - inicia criação com roleta direto
      const { texto: menu_texto } = menuClasses();
      criando.set(from, { etapa: 'classe', dados: {}, via_roleta: true });
      await enviar(jid, menu_texto);
      // Girar roleta automaticamente
      const roll = Math.random() * 100;
      if (roll < 2) {
        const estado = criando.get(from);
        estado.dados.classe = 'ajudante_deus';
        estado.etapa = 'nome';
        criando.set(from, estado);
        await enviar(jid, bloco('𝐋𝐄𝐍𝐃𝐀 【👑】', [
          '_O IMPERIUS para..._', '_O céu escurece..._',
          '_Uma luz dourada desce..._', '',
          '☠️ O PRÓPRIO DEUS ESCOLHEU VOCÊ', '',
          '👑 AJUDANTE DO DEUS', '━━━━━━━━━━',
          '🌈 Arma: Lâmina Primeva', '⚡ Dano: 500-720',
          '🛡️ Defesa divina: +50%', '🥚 Ovo do Dragão de Deus',
          '━━━━━━━━━━', '_Você pode chegar aos pés do Deus._',
          '_Mas nunca o superar._', '━━━━━━━━━━',
          '👤 Qual o nome do seu personagem?'
        ]));
      } else if (roll < 7) {
        await enviar(jid, bloco('𝐃𝐄𝐔𝐒 𝐈𝐍𝐓𝐄𝐑𝐕𝐄𝐈𝐔 【☠️】', [
          '☠️ _O Deus bloqueou sua sorte!_',
          '"Você não merece essa classe."',
          '_Escolha uma classe normal!_'
        ]));
      } else if (roll < 30) {
        const classes_raras = ['vampiro','sombra','trovejante','dragomante','espectro','mare','meteoromante','serafim','heroi_caido','artificer','portador_caos'];
        const classe_rara = classes_raras[Math.floor(Math.random() * classes_raras.length)];
        const classeData = CLASSES[classe_rara];
        if (classeData) {
          const estado = criando.get(from);
          estado.dados.classe_roleta = classe_rara;
          criando.set(from, estado);
          await enviar(jid, bloco('𝐂𝐋𝐀𝐒𝐒𝐄 𝐑𝐀𝐑𝐀! 【🌟】', [
            `${classeData.nome}`, `_${classeData.passiva}_`,
            '━━━━━━━━━━',
            '✅ Digite SIM para aceitar',
            '❌ Digite NÃO para escolher normal'
          ]));
        }
      } else {
        await enviar(jid, bloco('𝐒𝐄𝐌 𝐒𝐎𝐑𝐓𝐄 【😔】', [
          '_O destino não foi favorável..._',
          '_Escolha uma classe normal acima!_'
        ]));
      }
      return;
    }
    if (j) {
      return enviar(jid, bloco('🎰 ROLETA 【❌】', [
        'A roleta só pode ser usada',
        'ao criar seu personagem!',
        '━━━━━━━━━━',
        '_Sua chance já passou..._'
      ]));
    }
    return enviar(jid,
      bloco('𝐑𝐎𝐋𝐄𝐓𝐀 𝐃𝐎 𝐃𝐄𝐒𝐓𝐈𝐍𝐎 【🎰】', [
        '⚠️ ATENÇÃO!',
        'A roleta é imprevisível...',
        'Você pode ganhar classe rara',
        'mas PERDERÁ a atual!',
        '━━━━━━━━━━',
        '💀 REGRAS:',
        '• Perde classe atual',
        '• Cooldown 24h',
        '• Sem volta atrás',
        '━━━━━━━━━━',
        '⚠️ /confirmarroleta',
        '❌ /cancelar'
      ])
    );
  }

  if (cmd === 'confirmarroleta') {
    const resultado = girarRoleta(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto);
  }

  // Roleta durante criação de personagem
  if (cmd === 'roleta' && criando.has(from)) {
    const estado = criando.get(from);
    if (estado.etapa !== 'classe') return;
    
    const roll = Math.random() * 100;
    
    // 2% chance Ajudante do Deus
    // Imagem da roleta
    const img_rol = require('path').join(__dirname, 'roleta.jpg');
    if (require('fs').existsSync(img_rol)) {
      try {
        await sock.sendMessage(jid, {
          image: require('fs').readFileSync(img_rol),
          caption: '🎰 _A roleta do destino gira..._',
          mimetype: 'image/jpeg'
        });
      } catch(e) {}
    }
    if (roll < 2) {
      estado.dados.classe = 'ajudante_deus';
      estado.etapa = 'nome';
      criando.set(from, estado);
      await sock.sendMessage(jid, {
        text: bloco('𝐋𝐄𝐍𝐃𝐀 【👑】', [
          '_O IMPERIUS para..._',
          '_O céu escurece..._',
          '_Uma luz dourada desce..._',
          '',
          '☠️ O PRÓPRIO DEUS ESCOLHEU VOCÊ',
          '',
          '👑 AJUDANTE DO DEUS',
          '━━━━━━━━━━',
          '_A classe mais rara do IMPERIUS._',
          '_Apenas 1 mortal pode carregar_',
          '_este fardo divino._',
          '━━━━━━━━━━',
          '🌈 Arma: Lâmina Primeva',
          '⚡ Dano: 500-720',
          '🛡️ Defesa divina: +50%',
          '💫 Habilidade: Julgamento',
          '🥚 Ovo do Dragão de Deus',
          '━━━━━━━━━━',
          '_Você pode chegar aos pés do Deus._',
          '_Mas nunca o superar._'
        ])
      });
      return enviar(jid, bloco('𝐃𝐎𝐌 𝐃𝐈𝐕𝐈𝐍𝐎 【🥚】', [
        '🥚 Ovo do Dragão de Deus',
        '_Um presente do próprio Deus._',
        '_Choque-o com /chocar_',
        '_e descubra o que nasce..._',
        '━━━━━━━━━━',
        '👤 Qual o nome do seu personagem?'
      ]));
    }
    
    // 5% chance Deus bloqueia
    if (roll < 7) {
      return enviar(jid, bloco('𝐃𝐄𝐔𝐒 𝐈𝐍𝐓𝐄𝐑𝐕𝐄𝐈𝐔 【☠️】', [
        '☠️ _O Deus bloqueou sua sorte!_',
        '"Você não merece essa classe."',
        '_Escolha uma classe normal!_'
      ]));
    }
    
    // 23% chance classe rara
    if (roll < 30) {
      const classes_raras = ['vampiro','sombra','trovejante','dragomante','espectro','mare','meteoromante','serafim','heroi_caido','artificer','portador_caos'];
      const classe_rara = classes_raras[Math.floor(Math.random() * classes_raras.length)];
      const classeData = CLASSES[classe_rara];
      if (classeData) {
        estado.dados.classe_roleta = classe_rara;
        criando.set(from, estado);
        return enviar(jid, bloco('𝐂𝐋𝐀𝐒𝐒𝐄 𝐑𝐀𝐑𝐀! 【🌟】', [
          `${classeData.nome}`,
          `_${classeData.passiva}_`,
          '━━━━━━━━━━',
          '✅ Digite SIM para aceitar',
          '❌ Digite NÃO para escolher normal'
        ]));
      }
    }
    
    // Sem sorte
    return enviar(jid, bloco('𝐒𝐄𝐌 𝐒𝐎𝐑𝐓𝐄 【😔】', [
      '_O destino não foi favorável..._',
      '_Escolha uma classe normal!_'
    ]));
  }

  // ── PERFIL ────────────────────────────────────────────────
  if (cmd === 'perfil') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Você não tem personagem! Use /criar.`);
    const nivel = j.nivel || 1;
    const xp = j.xp || 0;
    const xp_prox = j.xp_proximo || 100;
    const xp_pct = Math.floor((xp / xp_prox) * 10);
    const barra_xp = '█'.repeat(xp_pct) + '░'.repeat(10 - xp_pct);
    const hp_pct = Math.floor((j.hp / j.hp_max) * 10);
    const barra_hp = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);
    const mana_pct = Math.floor((j.mana / j.mana_max) * 10);
    const barra_mana = '█'.repeat(mana_pct) + '░'.repeat(10 - mana_pct);
    const arma = ARMAS.find(a => a.id === j.arma);

    const perfil_txt = bloco('𝐏𝐄𝐑𝐅𝐈𝐋 【👤】', [
        `👤 ${j.nome} ${j.imperador ? '👑' : ''}`,
        `🏷️ ${j.titulo_ativo || 'Sem título'}`,
        `🎭 ${CLASSES[j.classe]?.nome || j.classe}`,
        `⭐ Nível: ${nivel} | Rank: ${j.rank || 'F'}`,
        `📊 XP: ${xp}/${xp_prox}`,
        `[${barra_xp}]`,
        '━━━━━━━━━━',
        `❤️ HP: ${j.hp}/${j.hp_max}`,
        `[${barra_hp}]`,
        `💧 Mana: ${j.mana}/${j.mana_max}`,
        `[${barra_mana}]`,
        '━━━━━━━━━━',
        `💪 FOR: ${j.for} | 🐆 DES: ${j.des}`,
        `🛡️ CON: ${j.con} | 🧠 INT: ${j.int}`,
        '━━━━━━━━━━',
        `⚔️ ${arma ? arma.nome : 'Sem arma'}`,
        `🐾 Pet: ${j.pet ? j.pet.nome : 'Nenhum'}`,
        
        '━━━━━━━━━━',
        `🗺️ ${j.regiao} | 💰 ${j.moedas}`,
        `💀 Kills: ${j.kills} | Mortes: ${j.mortes}`,
        `${j.morto ? '💀 MORTO' : '✅ VIVO'}`
      ]);
    await enviar(jid, perfil_txt);
    return;
  }

  if (cmd === 'classe') { const j = db.getJogador(from); if (!j) return enviar(jid, `❌ Sem personagem!`); return enviar(jid, verClasse(from)); }
  if (cmd === 'inventario') return enviar(jid, verInventario(from));



  if (cmd === 'minhaarma') {
    const j = db.getJogador(from); if (!j) return enviar(jid, `❌ Sem personagem!`);
    const arma = ARMAS.find(a => a.id === j.arma);
    return enviar(jid, arma ? bloco('𝐒𝐔𝐀 𝐀𝐑𝐌𝐀 【⚔️】', [`${arma.nome}`, `Raridade: ${arma.raridade}`, `Dano: ${arma.dano[0]}-${arma.dano[1]}`]) : `❌ Sem arma! Compre na /loja.`);
  }

  // ── BATALHA INTERATIVA ────────────────────────────────────
  if (cmd === 'batalha') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Você não tem personagem!`);
    if (j.morto) return enviar(jid, `❌ Mortos não batalham! Use /criar para recomeçar.`);
    if (batalhaAtiva.has(from)) return enviar(jid, `❌ Você já está em batalha!`);
    if (escolhaCaminho.has(from)) return enviar(jid, `❌ Responda a escolha de caminho primeiro! Digite o número da opção.`);

    // Servo precisa de aprovação do mestre antes de agir
    if (j.servo_de) {
      const necromante_id = registrarAcaoServo(from, 'batalha');
      if (necromante_id) {
        return enviar(jid,
          bloco('⛓️ 𝐀𝐆𝐔𝐀𝐑𝐃𝐀𝐍𝐃𝐎 𝐀𝐏𝐑𝐎𝐕𝐀𝐂̧𝐀̃𝐎 【⛓️】', [
            `*${j.nome}* quer partir para /batalha.`,
            '━━━━━━━━━━',
            `Mestre, use /aprovar @${j.nome} ou /negar @${j.nome}`
          ]), [necromante_id]
        );
      }
    }

    return enviarCenario(from, jid);
  }



  // ── TURNO BATALHA ─────────────────────────────────────────
  if (cmd === 'matar' && batalhaAtiva.has(from)) {
    return await processarTurnoBatalha(from, jid, 'matar');
  }
  if (cmd === 'fugir' && batalhaAtiva.has(from)) {
    batalhaAtiva.delete(from);
    return enviar(jid, bloco('𝐅𝐔𝐆𝐀 【🏃】', ['Você fugiu da batalha!', '_Covarde... mas vivo._']));
  }
  if (cmd === 'mochila' && batalhaAtiva.has(from)) {
    return enviar(jid, bloco('𝐌𝐎𝐂𝐇𝐈𝐋𝐀 【🎒】', ['Use /usar [item] para usar um item!']));
  }

  // ── TENTAR DOMAR (durante batalha) ────────────────────────
  if (cmd === 'tentardomar') {
    if (!batalhaAtiva.has(from)) return enviar(jid, bloco('❌ ERRO 【⚠️】', [
      'Você precisa estar em batalha!',
      '━━━━━━━━━━',
      '⚔️ Use /caminhar para lutar',
      '_Durante a luta, tente domar o inimigo!_'
    ]));
    const j_dom = db.getJogador(from);
    if (!j_dom) return enviar(jid, `❌ Sem personagem!`);

    const b_dom = batalhaAtiva.get(from);
    const nome_monstro_dom = b_dom?.monstro_nome || '';

    // ── Se for animal selvagem, usa o sistema de estrelas ──
    if (ehAnimalSelvagem(nome_monstro_dom)) {
      const resultado_animal = tentarDomarAnimal(from, nome_monstro_dom);
      if (resultado_animal.erro) return enviar(jid, resultado_animal.erro);
      batalhaAtiva.delete(from);
      return enviar(jid, bloco(resultado_animal.sucesso ? '✅ DOMADO! 【🐾】' : '❌ FALHOU 【🐾】', [
        resultado_animal.texto
      ]));
    }

    // ── Senão, tenta como criatura mítica (sistema antigo) ──
    if (j_dom.pet) return enviar(jid, bloco('❌ ERRO 【⚠️】', [
      'Você já tem um pet!',
      'Use /soltarpet para soltar o atual.'
    ]));

    const criaturas_regiao = Object.entries(CRIATURAS).filter(([_, c]) => c.regiao === j_dom.regiao && !c.exclusivo);

    const escolhida = criaturas_regiao.find(([_, c]) => c.nome.toLowerCase().includes(nome_monstro_dom.toLowerCase()));
    if (!escolhida) {
      return enviar(jid, bloco('❌ NÃO DOMÁVEL 【🐾】', [
        `${emojiMonstro(nome_monstro_dom)} *${nome_monstro_dom}* não pode ser domado!`,
        '_Essa criatura não tem interesse em ser sua companheira..._',
        '━━━━━━━━━━',
        '_Continue a batalha normalmente com /matar._'
      ]));
    }
    const [criatura_id_dom, criatura_dom] = escolhida;

    const item_usado = resto ? resto.trim().toLowerCase() : '';
    const item_data = item_usado ? ITENS_DOMAR[item_usado] : null;
    const bonus_item = item_data ? item_data.bonus : 0;

    const estado_dom = gerarEstado();
    const estado_info = ESTADOS[estado_dom];
    const resultado_dom = tentarDomar(from, criatura_id_dom, estado_dom, bonus_item);
    if (resultado_dom.erro) return enviar(jid, resultado_dom.erro);

    batalhaAtiva.delete(from); // a criatura foge ou é domada, batalha acaba

    if (!resultado_dom.sucesso) {
      return enviar(jid, bloco('❌ FALHOU 【🐾】', [
        `${estado_info?.emoji || '🐾'} ${estado_info?.descricao || ''}`,
        resultado_dom.texto,
        item_data ? `_Item usado: ${item_data.nome}_` : '_Nenhum item de atração usado_'
      ]));
    }

    nomeandoPet.set(from, { criatura_id: criatura_id_dom });
    return enviar(jid, bloco('✅ DOMADO! 【🐾】', [
      `${estado_info?.emoji || '🐾'} ${estado_info?.descricao || ''}`,
      resultado_dom.texto
    ]));
  }

  if (cmd === 'boss') {
    const resultado = batalharBoss(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.logs.join('\n'));
  }

  if (cmd === 'atacar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    const resultado = pvp(from, alvo_id);
    if (resultado.erro) return enviar(jid, resultado.erro);
    if (resultado.enc_morreu) {
      const enc_result = processarMorteEncarnacao(resultado.enc_morreu.enc_id, resultado.enc_morreu.matador_id, resultado.enc_morreu.matador_nome);
      if (enc_result) { await enviar(jid, resultado.logs.join('\n')); return enviar(jid, enc_result.msg_grupo); }
    }
    return enviar(jid, resultado.logs.join('\n'), [alvo_id]);
  }

  if (cmd === 'habilidade') {
    if (!resto) return enviar(jid, `❌ Use: /habilidade [nome]`);
    const j = db.getJogador(from); if (!j) return enviar(jid, `❌ Sem personagem!`);
    const classeData = CLASSES[j.classe];
    const hab_key = Object.keys(classeData?.habilidades || {}).find(k =>
      k.toLowerCase().includes(normalizar(resto)) || classeData.habilidades[k].nome.toLowerCase().includes(resto.toLowerCase())
    );
    if (!hab_key) return enviar(jid, `❌ Habilidade não encontrada! Use /classe para ver.`);
    const resultado = usarHabilidade(from, hab_key);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.logs.join('\n'));
  }

  if (cmd === 'ultimate') { const r = usarUltimate(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.logs.join('\n')); }
  if (cmd === 'd20') {
    const d = rolarD20();
    const msg_d20 = d === 20 ? '⭐ ACERTO PERFEITO!!' : d === 1 ? '💀 FALHA CATASTRÓFICA!' : d >= 18 ? '🌟 CRÍTICO!' : d >= 15 ? '💥 Bom Ataque!' : d >= 10 ? '⚔️ Ataque Normal' : d >= 6 ? '😬 Falha...' : d >= 2 ? '❌ Falha Grave!' : '💀 FALHA CATASTRÓFICA!';
    const txt_d20 = bloco('𝐑𝐎𝐋𝐀𝐑 𝐃𝟐𝟎 【🎲】', [`🎲 _O dado gira..._`, `_O destino decide..._`, `━━━━━━━━━━`, `Resultado: *${d}*`, ``, msg_d20]);
    const img_d20 = require('path').join(__dirname, `d${d}.jpg`);
    if (require('fs').existsSync(img_d20)) {
      await sock.sendMessage(jid, {
        image: require('fs').readFileSync(img_d20),
        caption: txt_d20,
        mimetype: 'image/jpeg'
      });
    } else {
      await enviar(jid, txt_d20);
    }
    return;
  }
  if (cmd === 'dado') { const max = parseInt(args[0]) || 6; if (max < 2 || max > 1000) return enviar(jid, `❌ Use entre 2 e 1000.`); return enviar(jid, `🎲 D${max}: *${rand(1, max)}*`); }

  // ── MUNDO ─────────────────────────────────────────────────
  if (cmd === 'meumapa') {
    const j_mm = db.getJogador(from);
    if (!j_mm) return enviar(jid, '❌ Você não tem personagem!');
    const regiao_atual = REGIOES[j_mm.regiao] || { nome: j_mm.regiao, nivel_min: 1, nivel_max: 10 };
    const proximas = Object.entries(REGIOES)
      .filter(([k]) => k !== j_mm.regiao)
      .map(([k, r]) => `  ${r.nome} (Nv. ${r.nivel_min}-${r.nivel_max})`);
    return enviar(jid, bloco('𝐌𝐄𝐔 𝐌𝐀𝐏𝐀 【📍】', [
      '📍 Você está em:',
      `  ${regiao_atual.nome}`,
      `  _Nível recomendado: ${regiao_atual.nivel_min}-${regiao_atual.nivel_max}_`,
      '',
      '🗺️ Outras regiões:',
      ...proximas,
      '',
      '💡 /viajar [nome da região]',
      '🗺️ /mapa — Ver todas regiões'
    ]));
  }

  if (cmd === 'mapa') {
    const mapa_txt = verMapa();
    const img_mapa = require('path').join(__dirname, 'mapa.jpg');
    if (require('fs').existsSync(img_mapa)) {
      await sock.sendMessage(jid, {
        image: require('fs').readFileSync(img_mapa),
        caption: mapa_txt,
        mimetype: 'image/jpeg'
      });
    } else {
      await sock.sendMessage(jid, { text: mapa_txt });
    }
    return;
  }
  if (cmd === 'regioes') return enviar(jid, verRegioes());
  if (cmd === 'viajar') {
    if (!resto) return enviar(jid, bloco('❌ ERRO 【⚠️】', [
      'Use: /viajar [nome da região]',
      '━━━━━━━━━━',
      '💡 Ex: /viajar Floresta de Eryndal',
      '🗺️ /mapa — Ver todas as regiões'
    ]));

    return enviar(jid, viajar(from, resto));
  }
  if (cmd === 'acampar') return enviar(jid, acampar(from));
  if (cmd === 'masmorras') return enviar(jid, verMasmorras(from));
  if (cmd === 'masmorra') { if (!resto) return enviar(jid, `❌ Use: /masmorra [nome]`); const r = entrarMasmorra(from, resto); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.texto); }

  // ── ECONOMIA ──────────────────────────────────────────────
  if (cmd === 'itens') {
    const sub = (resto || '').toLowerCase().trim();
    const IDS_POCOES = ['pocao_hp_p','pocao_hp_m','pocao_hp_g','pocao_hp_maxima','pocao_mana_p','pocao_mana_g','pocao_mana_total'];
    const IDS_ESPECIAIS = ['antidoto','purificador','elixir_forca','pedra_ressurreicao','pocao_xp','amuleto_sorte','pergaminho_teletransporte','elixir_nivel'];
    if (sub.includes('poc') || sub.includes('poç')) {
      const linhas = ITENS_LOJA.filter(i => IDS_POCOES.includes(i.id)).map(i => `${i.nome} — 🪙 ${i.preco}`);
      return enviar(jid, bloco('𝐏𝐎𝐂̧𝐎̃𝐄𝐒 【🧪】', [...linhas, '', '💡 /comprar [nome]']));
    }
    if (sub.includes('especial')) {
      const linhas = ITENS_LOJA.filter(i => IDS_ESPECIAIS.includes(i.id)).map(i => `${i.nome} — 🪙 ${i.preco}`);
      return enviar(jid, bloco('𝐈𝐓𝐄𝐍𝐒 𝐄𝐒𝐏𝐄𝐂𝐈𝐀𝐈𝐒 【✨】', [...linhas, '', '💡 /comprar [nome]']));
    }
    return enviar(jid, bloco('𝐈𝐓𝐄𝐍𝐒 【🧪】', [
      '🧪 /itens pocoes — Poções de HP/Mana',
      '✨ /itens especiais — Itens raros e utilitários'
    ]));
  }

  if (cmd === 'comida') {
    return enviar(jid, bloco('𝐂𝐎𝐌𝐈𝐃𝐀 【🥩】', [
      '🥩 CARNES',
      '  🥩 Carne Crua (#CCC) — 🪙 30',
      '  🥩 Carne Fresca (#CCF) — 🪙 60',
      '  🥩 Carne Assada (#CCA) — 🪙 80',
      '  🥩 Carne Rara (#CCR) — 🪙 150',
      '  🥩 Carne de Dragão (#CCD) — 🪙 400',
      '  🥩 Carne Sagrada (#CCS) — 🪙 600',
      '',
      '🍯 MÉIS E DOCES',
      '  🍯 Mel Simples (#CMS) — 🪙 50',
      '  🍯 Mel Dourado (#CMD) — 🪙 500',
      '  🍯 Mel Sagrado (#CMG) — 🪙 700',
      '  🌟 Néctar dos Deuses (#CNE) — 🪙 900',
      '  ✨ Ambrosia (#CAN) — 🪙 1200',
      '',
      '🌿 ERVAS E ESSÊNCIAS',
      '  🌿 Erva do Bosque (#CEB) — 🪙 40',
      '  🌿 Erva Ancestral (#CEA) — 🪙 120',
      '  🌱 Raiz Ancestral (#CRA) — 🪙 200',
      '  ✨ Essência Mágica (#CEM) — 🪙 500',
      '  ✨ Essência Primordial (#CEP) — 🪙 1000',
      '',
      '🍎 FRUTAS MÍTICAS',
      '  🫐 Baga Espiritual (#CFB) — 🪙 80',
      '  🍑 Figo Sagrado (#CFF) — 🪙 500',
      '  🍎 Romã do Hades (#CFR) — 🪙 700',
      '  🍎 Maçã Dourada (#CFM) — 🪙 1000',
      '  🌟 Fruto da Imortalidade (#CFI) — 🪙 1500',
      '',
      '🌊 AQUÁTICOS',
      '  🌊 Alga Abissal (#CAL) — 🪙 150',
      '  🪸 Coral Sagrado (#CCO) — 🪙 250',
      '  🐟 Peixe Espectral (#CPE) — 🪙 180',
      '  🐍 Escama de Leviatã (#CEL) — 🪙 700',
      '',
      '💎 MINERAIS',
      '  💎 Pedra de Luz (#CPL) — 🪙 100',
      '  🔷 Cristal de Gelo (#CCG) — 🪙 200',
      '  ⭐ Minério Sagrado (#CMI) — 🪙 450',
      '',
      '💡 /comprar #CCA'
    ]));
  }

  if (cmd === 'ovos') {
    return enviar(jid, verLojaOvos());
  }

  if (cmd === 'loja') {
    return enviar(jid, bloco('𝐋𝐎𝐉𝐀 𝐃𝐄 𝐕𝐀𝐋𝐃𝐑𝐈𝐒 【🛒】', [
      '⚔️ ARMAS',
      '  ↳ /armasC — Contato',
      '  ↳ /armasD — Distância',
      '  ↳ /armasM — Mágicas',
      '',
      '🧪 ITENS',
      '  ↳ /itens pocoes',
      '  ↳ /itens especiais',
      '',
      '🥚 OVOS',
      '  ↳ /ovos',
      '',
      '🥩 COMIDA',
      '  ↳ /comida'
    ]));
  }
  if (cmd === 'lojapets') return enviar(jid, verLojaOvos());
  if (cmd === 'comprar') {
    if (!resto) return enviar(jid, `❌ Use: /comprar [item]`);
    const nome_lower = resto.toLowerCase().trim();
    const eh_ovo = Object.keys(OVOS).some(k => k === nome_lower || k === `ovo ${nome_lower}`);
    if (eh_ovo) return enviar(jid, comprarOvo(from, resto));
    return enviar(jid, comprarItem(from, resto));
  }
  if (cmd === 'usar') { if (!resto) return enviar(jid, `❌ Use: /usar [item]`); return enviar(jid, usarItem(from, resto)); }
  if (cmd === 'equipar') { if (!resto) return enviar(jid, `❌ Use: /equipar [arma]`); return enviar(jid, equiparArma(from, resto)); }
  if (cmd === 'banco') return enviar(jid, verBanco(from));
  if (cmd === 'depositar') { const v = parseInt(args[0]); if (isNaN(v)) return enviar(jid, `❌ Use: /depositar [valor]`); return enviar(jid, depositar(from, v)); }
  if (cmd === 'sacar') { const v = parseInt(args[0]); if (isNaN(v)) return enviar(jid, `❌ Use: /sacar [valor]`); return enviar(jid, sacar(from, v)); }

  // ── PETS ──────────────────────────────────────────────────
  if (cmd === 'chocar') {
    const r = chocarOvo(from, resto);
    if (typeof r === 'string') return enviar(jid, r);
    nomeandoPet.set(from, { criatura_id: r.criatura_id });
    return enviar(jid, r.texto);
  }
  if (cmd === 'meupet') return enviar(jid, verPet(from));
  if (cmd === 'soltarpet') return enviar(jid, soltarPet(from));
  if (cmd === 'curarpet') return enviar(jid, curarPet(from));
  if (cmd === 'chamarpet' && batalhaAtiva.has(from)) {
    const r_ataque = chamarAnimalBatalha(from);
    if (r_ataque.erro) return enviar(jid, r_ataque.erro);
    const b_ataque = batalhaAtiva.get(from);
    b_ataque.monstro_hp -= r_ataque.dano;

    if (b_ataque.monstro_hp <= 0) {
      batalhaAtiva.delete(from);
      const j_ataque = db.getJogador(from);
      if (j_ataque) { j_ataque.kills = (j_ataque.kills || 0) + 1; db.salvarJogador(from, j_ataque); }
      const xp_ganho = Math.floor(Math.random() * 60 + 30);
      const moedas_ganho = Math.floor(Math.random() * 45 + 25);
      db.adicionarXP(from, xp_ganho);
      db.adicionarMoedas(from, moedas_ganho);
      const loot_msg = rolarLootBatalha(from);
      return enviar(jid, bloco('𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 【🏆】', [
        ...r_ataque.ataques,
        `_${b_ataque.monstro_nome} foi derrotado!_`,
        '━━━━━━━━━━',
        `⭐ XP: +${xp_ganho}`,
        `💰 Belarium: +${moedas_ganho}`,
        ...(loot_msg ? ['━━━━━━━━━━', loot_msg] : []),
        '━━━━━━━━━━',
        '/caminhar | /acampar | /perfil | /rpg'
      ]));
    }

    batalhaAtiva.set(from, b_ataque);
    const m_pct_ap = Math.max(0, Math.floor((b_ataque.monstro_hp / b_ataque.monstro_hp_max) * 10));
    const m_barra_ap = '█'.repeat(m_pct_ap) + '░'.repeat(10 - m_pct_ap);
    return enviar(jid, bloco('𝐁𝐀𝐓𝐀𝐋𝐇𝐀 — 𝐓𝐔𝐑𝐍𝐎 【⚔️】', [
      ...r_ataque.ataques,
      '━━━━━━━━━━',
      `${emojiMonstro(b_ataque.monstro_nome)} ${b_ataque.monstro_nome}`,
      ...(estrelasDoMonstro(b_ataque.monstro_nome) ? [estrelasDoMonstro(b_ataque.monstro_nome)] : []),
      `❤️ HP: ${b_ataque.monstro_hp}/${b_ataque.monstro_hp_max}`,
      `[${m_barra_ap}]`,
      '━━━━━━━━━━',
      '1️⃣ /matar | 2️⃣ /fugir | 3️⃣ /mochila'
    ]));
  }
  if (cmd === 'chamarpet') { const r = chamarPet(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.texto); }
  if (cmd === 'animais') return enviar(jid, verAnimais());
  if (cmd === 'meuanimal') return enviar(jid, verMeuAnimal(from));
  if (cmd === 'soltaranimal') return enviar(jid, soltarAnimal(from, resto));
  if (cmd === 'adotar') { if (!resto) return enviar(jid, `❌ Use: /adotar [animal]`); return enviar(jid, adotarAnimal(from, resto)); }

  // ── SACRIFÍCIO ────────────────────────────────────────────
  if (cmd === 'sacrificio') {
    const j = db.getJogador(from); if (!j) return enviar(jid, `❌ Sem personagem!`);
    const partes = resto.split('|');
    if (partes.length < 2) return enviar(jid, bloco('𝐒𝐀𝐂𝐑𝐈𝐅𝐈𝐂𝐈𝐎 【🩸】', ['Use:', '/sacrificio [oferta] | [pedido]', '', 'Ex:', '/sacrificio 500 moedas | força']));
    const oferta = partes[0].trim(); const pedido = partes[1].trim();
    const alvo_id = extrairMencao(oferta, msg);
    if (alvo_id) {
      const alvo = db.getJogador(alvo_id); if (!alvo) return enviar(jid, `❌ Jogador não encontrado!`);
      const msg_alvo = pedirSacrificioParceiro(from, alvo_id, alvo.nome, pedido);
      const resultado = criarSacrificio(from, j.nome, pedido, `@${extrairNumero(alvo_id)}`);
      if (resultado.erro) return enviar(jid, resultado.erro);
      await enviar(jid, resultado.msg_grupo, [alvo_id]);
      return enviar(jid, msg_alvo, [alvo_id]);
    }
    const resultado = criarSacrificio(from, j.nome, pedido, oferta);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  if (cmd === 'aceitarmorte') { const r = aceitarMorteSacrificio(from); if (r.erro) return enviar(jid, r.erro); await enviar(jid, r.msg_grupo); return enviar(jid, `⏳ Aguardando julgamento do Deus...`); }
  if (cmd === 'recusarmorte') { const r = recusarMorteSacrificio(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo); }

  // ── MORTE ─────────────────────────────────────────────────
  if (cmd === 'suicidar') {
    const resultado = suicidar(from);
    return enviar(jid, resultado);
  }

  if (cmd === 'renascer' || cmd === 'renascer0') {
    return enviar(jid, bloco('ℹ️ SISTEMA ATUALIZADO 【✨】', [
      'Esse comando não existe mais!',
      '━━━━━━━━━━',
      'Para recomeçar, use direto:',
      '⚔️ /criar — Criar novo personagem'
    ]));
  }
  if (cmd === 'reviver') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`); const r = reviverPorNecromante(from, a); if (typeof r === 'string') return enviar(jid, r); await enviar(jid, r.para_necromante); return enviar(jid, r.para_alvo, [a]); }
  if (cmd === 'aprovar') {
    const a = extrairMencao(resto, msg);
    if (!a) return enviar(jid, `❌ Mencione o servo!`);
    const r = aprovarAcaoServo(from, a, true);
    if (typeof r === 'string') return enviar(jid, r);
    await enviar(jid, r.para_servo, [a]);
    if (r.aprovado && r.acao === 'batalha') return enviarCenario(a, jid);
    return;
  }
  if (cmd === 'negar') {
    const a = extrairMencao(resto, msg);
    if (!a) return enviar(jid, `❌ Mencione o servo!`);
    const r = aprovarAcaoServo(from, a, false);
    if (typeof r === 'string') return enviar(jid, r);
    return enviar(jid, r.para_servo, [a]);
  }
  if (cmd === 'libertar') return enviar(jid, liberarServo(from));

  // ── SOCIAL ────────────────────────────────────────────────
  if (cmd === 'ranking') return enviar(jid, verRanking());
  if (cmd === 'missoes') return enviar(jid, verMissoes(from));

  if (cmd === 'login') return enviar(jid, loginDiario(from));
  if (cmd === 'guilda') return enviar(jid, verGuilda(from));

  if (cmd === 'sairguilda') return enviar(jid, sairGuilda(from));
  if (cmd === 'criarguilda') { if (!resto) return enviar(jid, `❌ Use: /criarguilda [nome]`); return enviar(jid, criarGuilda(from, resto)); }
  if (cmd === 'convidar') {
    const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`);
    const r = convidarGuilda(from, a); if (r.erro) return enviar(jid, r.erro);
    pendentes_convite.set(a, { guilda_id: r.guilda_id, guilda_nome: r.guilda_nome });
    await enviar(jid, r.msg_lider); return enviar(jid, r.msg_alvo, [a]);
  }
  if (cmd === 'aceitarguilda') { const p = pendentes_convite.get(from); if (!p) return enviar(jid, `❌ Sem convite pendente!`); pendentes_convite.delete(from); return enviar(jid, aceitarGuilda(from, p.guilda_id, p.guilda_nome)); }
  if (cmd === 'recusarguilda') { pendentes_convite.delete(from); return enviar(jid, `❌ Convite recusado.`); }
  if (cmd === 'casar') {
    const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`);
    const r = pedirCasamento(from, a); if (r.erro) return enviar(jid, r.erro);
    pendentes_casamento.set(a, { proponente_id: from, proponente_nome: r.proponente_nome, custo: r.custo });
    await enviar(jid, r.msg_proponente); return enviar(jid, r.msg_alvo, [a]);
  }
  if (cmd === 'aceitarcasamento') { const p = pendentes_casamento.get(from); if (!p) return enviar(jid, `❌ Sem proposta pendente!`); pendentes_casamento.delete(from); return enviar(jid, aceitarCasamento(from, p.proponente_id, p.proponente_nome, p.custo)); }
  if (cmd === 'recusarcasamento') { pendentes_casamento.delete(from); return enviar(jid, `💔 Proposta recusada.`); }
  if (cmd === 'divorciar') return enviar(jid, divorciar(from));

  // ── INTERAÇÃO SOCIAL ─────────────────────────────────────
  if (cmd === 'interagir') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /interagir @jogador [ação]\nEx: /interagir @999 cumprimenta`);
    const acao = resto.replace(/@\d+/, '').trim() || 'interage com';
    const j_int = db.getJogador(from);
    const alvo_int = db.getJogador(extrairNumero(alvo_id));
    if (!j_int) return enviar(jid, `❌ Você não tem personagem!`);
    if (!alvo_int) return enviar(jid, `❌ O jogador mencionado não tem personagem!`);
    return enviar(jid, bloco('𝐈𝐍𝐓𝐄𝐑𝐀𝐂̧𝐀̃𝐎 【🤝】', [
      `${j_int.nome} ${acao} ${alvo_int.nome}!`
    ]), [alvo_id]);
  }

  if (cmd === 'convidarbeber') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /convidarbeber @jogador`);
    const j_int = db.getJogador(from);
    const alvo_int = db.getJogador(extrairNumero(alvo_id));
    if (!j_int) return enviar(jid, `❌ Você não tem personagem!`);
    if (!alvo_int) return enviar(jid, `❌ O jogador mencionado não tem personagem!`);
    return enviar(jid, bloco('𝐓𝐀𝐕𝐄𝐑𝐍𝐀 【🍺】', [
      `${j_int.nome} chama ${alvo_int.nome} para uma rodada na taverna!`,
      '_Só socializando... por enquanto._'
    ]), [alvo_id]);
  }

  if (cmd === 'festa') {
    const j_int = db.getJogador(from);
    if (!j_int) return enviar(jid, `❌ Você não tem personagem!`);
    return enviar(jid, bloco('𝐅𝐄𝐒𝐓𝐀 【🎉】', [
      `${j_int.nome} organizou uma festa em Valdris!`,
      '_Todos os aventureiros estão convidados..._'
    ]));
  }


  // ── EVENTO DEUS ───────────────────────────────────────────
  if (cmd === 'provocardeus') {
    const r = provocarDeus(from, jid); if (r.erro) return enviar(jid, r.erro);
    await enviar(jid, r.msg_grupo);
    return enviar(DONO_ID, r.msg_dono);
  }
  if (cmd === 'atacardeus') { const r = atacarDeus(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.texto); }
  if (cmd === 'pedirajuda') { const r = pedirAjuda(from, jid); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.texto, r.mencoes); }
  if (cmd === 'aceitarajuda') { const r = aceitarAjuda(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.texto); }
  if (cmd === 'fugirdeus') return enviar(jid, fugirDeus(from));
  if (cmd === 'statusevento') return enviar(jid, statusEvento());

  // ── ENCARNAÇÃO ────────────────────────────────────────────
  if (cmd === 'encarnar') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode encarnar.`);
    if (!resto) return enviar(jid, `❌ Use: /encarnar [nome]`);
    const r = encarnar(from, resto, jid); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo);
  }
  if (cmd === 'ascender') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode ascender.`);
    const r = ascender(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo);
  }

  // ── /ON e /OFF ─────────────────────────────────────────
  // Verificar se é admin do grupo
  const groupMetadata = jid.endsWith('@g.us') ? await sock.groupMetadata(jid).catch(() => null) : null;
  const isAdmin = groupMetadata?.participants?.find(p => p.id === from)?.admin ? true : false;
  if (cmd === 'off' && (isDono(from) || isAdmin)) {
    botAtivo = false;
    return enviar(jid, '⚠️ *IMPERIUS offline.*\nUse /on para reativar.');
  }
  if (cmd === 'on' && (isDono(from) || isAdmin)) {
    botAtivo = true;
    return enviar(jid, '✅ *IMPERIUS online!*\n⚔️ Evolua ou morra.');
  }
  if (!botAtivo && !isDono(from)) {
    return enviar(jid, '⚠️ *IMPERIUS está offline.*\nVoltamos em breve!');
  }

  // ── BLOQUEAR MORTOS ─────────────────────────────────────
  const CMDS_MORTO_PERMITIDOS = ['criar', 'renascer', 'renascer0', 'ping', 'meuid', 
    'menu', 'info', 'lore', 'regras', 'dono', 'ajuda', 'dica', 'rpg'];
  if (!CMDS_MORTO_PERMITIDOS.includes(cmd)) {
    const j_morto = db.getJogador(from);
    if (j_morto && j_morto.morto) {
      return enviar(jid, bloco('💀 VOCÊ ESTÁ MORTO 【☠️】', [
        '_Sua alma vaga pelo IMPERIUS..._',
        '━━━━━━━━━━',
        '⚔️ /criar — Criar novo personagem'
      ]));
    }
  }

  // ── SISTEMA DO DEUS ── Bloquear comandos normais do Dono ─
  if (isDono(from)) {
    const CMDS_LIVRES = ['deus','adm','aceitardeus','ignorardeus','deusdescansar',
      'darmoedas','tirarmoedas','matar','dar','abencoar','amaldicoar',
      'aceitarsacrificio','recusarsacrificio','sacrificios','encarnar',
      'ascender','evento','status','menu','rpg','info','lore','mapa',
      'regras','dono','ajuda','infoarmas','infoarma','ranking','statusevento',
      'meuid','ping'];
    if (!CMDS_LIVRES.includes(cmd)) {
      return enviar(jid, bloco('☠️ VOCÊ É O DEUS 【👑】', [
        'Você não pode agir como mortal!',
        '━━━━━━━━━━',
        '🌟 Para interagir no mundo:',
        '/encarnar [nome] — Encarnar em mortal',
        '━━━━━━━━━━',
        '👑 Seus poderes divinos:',
        '/deus — Menu do Deus',
        '/matar @jogador — Matar mortal',
        '/dar @jogador [item] — Dar item',
        '/darmoedas @jogador [valor]',
        '/abencoar @jogador',
        '/evento [mensagem] — Evento global'
      ]));
    }
  }

  // ── COMANDOS DO DONO ──────────────────────────────────────
  if (!isDono(from)) return;

  if (cmd === 'zzz') {
    if (!isDono(from) && !isAdmin) return;
    return enviar(jid,
      '🔇🔇🔇🔇🔇🔇🔇🔇🔇🔇🔇🔇\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '‼️ A T E N Ç Ã O ‼️\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'O IMPERIUS não é bate-papo.\n' +
      'É campo de batalha.\n\n' +
      '💬 MUITO FLOOD\n' +
      '🤖 POUCO BOT\n\n' +
      'M A N E R A R   O U . . .\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '🔇🔇🔇🔇🔇🔇🔇🔇🔇🔇🔇🔇'
    );
  }

  if (cmd === 'meuid') {
    return enviar(jid, `Seu ID: ${from}`);
  }

  if (cmd === 'darmoedas') {
    const alvo_id = extrairMencao(resto, msg);
    const valor = parseInt(args[1]);
    if (!alvo_id || isNaN(valor)) return enviar(jid, `❌ Use: /darmoedas @jogador [valor]`);
    const j_alvo = db.getJogador(alvo_id);
    if (!j_alvo) return enviar(jid, `❌ Jogador não encontrado!`);
    db.adicionarMoedas(alvo_id, valor);
    return enviar(jid, bloco('💰 MOEDAS ADICIONADAS', [`+${valor} moedas para ${j_alvo.nome}`]), [alvo_id]);
  }

  if (cmd === 'tirarmoedas') {
    const alvo_id = extrairMencao(resto, msg);
    const valor = parseInt(args[1]);
    if (!alvo_id || isNaN(valor)) return enviar(jid, `❌ Use: /tirarmoedas @jogador [valor]`);
    const j_alvo = db.getJogador(alvo_id);
    if (!j_alvo) return enviar(jid, `❌ Jogador não encontrado!`);
    db.adicionarMoedas(alvo_id, -valor);
    return enviar(jid, bloco('💰 MOEDAS REMOVIDAS', [`-${valor} moedas de ${j_alvo.nome}`]), [alvo_id]);
  }

  if (cmd === 'aceitardeus') { const r = aceitarEventoDeus(from, jid); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo); }
  if (cmd === 'ignorardeus') { const r = ignorarDeus(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo); }
  if (cmd === 'deusdescansar') { const r = deusDescansar(from, jid); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo); }

  if (cmd === 'darmoedas') {
    const alvo_id = extrairMencao(resto, msg);
    const valor = parseInt(args[1]);
    if (!alvo_id || isNaN(valor)) return enviar(jid, `❌ Use: /darmoedas @jogador [valor]`);
    const j = db.getJogador(alvo_id);
    if (!j) return enviar(jid, `❌ Jogador não encontrado!`);
    db.adicionarMoedas(alvo_id, valor);
    return enviar(jid, bloco('💰 MOEDAS ADICIONADAS', [`+${valor} moedas para ${j.nome}`]), [alvo_id]);
  }

  if (cmd === 'tirarmoedas') {
    const alvo_id = extrairMencao(resto, msg);
    const valor = parseInt(args[1]);
    if (!alvo_id || isNaN(valor)) return enviar(jid, `❌ Use: /tirarmoedas @jogador [valor]`);
    const j = db.getJogador(alvo_id);
    if (!j) return enviar(jid, `❌ Jogador não encontrado!`);
    db.adicionarMoedas(alvo_id, -valor);
    return enviar(jid, bloco('💰 MOEDAS REMOVIDAS', [`-${valor} moedas de ${j.nome}`]), [alvo_id]);
  }

  if (cmd === 'matar') {
    if (!batalhaAtiva || !batalhaAtiva.has(from)) {
      return enviar(jid, bloco('❌ ERRO 【⚠️】', [
        'Você não está em batalha!',
        '━━━━━━━━━━',
        '💡 Use /caminhar para iniciar!',
        '❓ Não funcionou? /ajuda'
      ]));
    } const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`); const r = matarJogador(a, args.slice(1).join(' ')); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg, [a]); }
  if (cmd === 'dar') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`); const item = args.slice(1).join(' '); const r = darItem(a, item); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg, [a]); }
  if (cmd === 'abencoar') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`); const r = abencoarJogador(a, args.slice(1).join(' ')); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg, [a]); }
  if (cmd === 'amaldicoar') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`); const r = maldicionarJogador(a, args.slice(1).join(' ')); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg, [a]); }
  if (cmd === 'aceitarsacrificio') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Use: /aceitarsacrificio @jogador`); const recomp = args.slice(1).join(' ') || 'Bênção do Deus'; const r = aceitarSacrificio(a, recomp); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo, [a]); }
  if (cmd === 'recusarsacrificio') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Use: /recusarsacrificio @jogador`); const r = recusarSacrificio(a); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo, [a]); }
  if (cmd === 'sacrificios') return enviar(jid, verSacrificiosPendentes());
  if (cmd === 'evento') { if (!resto) return enviar(jid, `❌ Use: /evento [mensagem]`); return enviar(jid, eventoGlobal(resto)); }
  if (cmd === 'status') return enviar(jid, statusBot());

  // ── SISTEMA DE ERROS ──────────────────────────────────────
  if (cmd === 'erro') {
    if (!resto) return enviar(jid, `❌ Use: /erro [descrição do problema]`);
    const ERROS_FILE = require('path').join(__dirname, 'erros.json');
    let erros = [];
    try { erros = JSON.parse(require('fs').readFileSync(ERROS_FILE, 'utf8')); } catch (e) {}
    erros.push({ texto: resto, autor: msg.pushName || num, data: new Date().toLocaleString('pt-BR') });
    require('fs').writeFileSync(ERROS_FILE, JSON.stringify(erros, null, 2));
    return enviar(jid, bloco('🐛 ERRO REGISTRADO 【✅】', [
      `"${resto}"`,
      '━━━━━━━━━━',
      `_Registrado como erro #${erros.length}_`
    ]));
  }

  if (cmd === 'vererros') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode ver a lista de erros.`);
    const ERROS_FILE = require('path').join(__dirname, 'erros.json');
    let erros = [];
    try { erros = JSON.parse(require('fs').readFileSync(ERROS_FILE, 'utf8')); } catch (e) {}
    if (erros.length === 0) return enviar(jid, `✅ Nenhum erro registrado!`);
    const linhas = erros.map((e, i) => `${i + 1}. ${e.texto}\n   _${e.autor} — ${e.data}_`);
    return enviar(jid, bloco('🐛 LISTA DE ERROS 【📋】', [
      ...linhas,
      '━━━━━━━━━━',
      '/limparerros — Apagar todos'
    ]));
  }

  if (cmd === 'limparerros') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode limpar a lista.`);
    const ERROS_FILE = require('path').join(__dirname, 'erros.json');
    require('fs').writeFileSync(ERROS_FILE, '[]');
    return enviar(jid, `🧹 Lista de erros limpa!`);
  }
}

// ── EXPLORAÇÃO: envia o cenário com N caminhos possíveis ──────
const EMOJI_NUM = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

async function enviarCenario(from, jid) {
  const cenario = gerarCenario();
  escolhaCaminho.set(from, cenario);
  const linhas = cenario.opcoes.map((op, i) => `${EMOJI_NUM[i] || (i + 1) + '.'} ${op.texto}`);
  return enviar(jid, bloco('𝐂𝐀𝐌𝐈𝐍𝐇𝐎 【🧭】', [
    cenario.intro,
    '━━━━━━━━━━',
    ...linhas
  ]));
}

// ── EXPLORAÇÃO: resolve o desfecho de acordo com o tipo escolhido ──
async function resolverEncontro(tipo, from, jid) {
  const j = db.getJogador(from);
  if (!j) return enviar(jid, `❌ Você não tem personagem!`);

  if (tipo === 'monstro') {
    return iniciarEncontroBatalha(from, jid);
  }

  if (tipo === 'bau') {
    const moedas = rand(20, 150);
    j.moedas = (j.moedas || 0) + moedas;
    let itemGanho = null;
    if (rand(1, 100) <= 35) {
      const itensPossiveis = ITENS_LOJA.filter(it => !it.exclusiva);
      const item = itensPossiveis[rand(0, itensPossiveis.length - 1)];
      if (item) {
        if (!j.inventario) j.inventario = [];
        j.inventario.push(item.id);
        itemGanho = item;
      }
    }
    db.salvarJogador(from, j);
    return enviar(jid, bloco('𝐁𝐀𝐔 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 【📦】', [
      '_Você encontra um baú escondido!_',
      '━━━━━━━━━━',
      `💰 +${moedas} moedas`,
      ...(itemGanho ? [`🎁 Item encontrado: ${itemGanho.nome}`] : [])
    ]));
  }

  if (tipo === 'item') {
    const itensPossiveis = ITENS_LOJA.filter(it => !it.exclusiva);
    const item = itensPossiveis[rand(0, itensPossiveis.length - 1)];
    if (!j.inventario) j.inventario = [];
    j.inventario.push(item.id);
    db.salvarJogador(from, j);
    return enviar(jid, bloco('𝐈𝐓𝐄𝐌 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 【🎁】', [
      '_Algo brilha no chão à sua frente._',
      '━━━━━━━━━━',
      `🎁 Você encontrou: ${item.nome}`
    ]));
  }

  if (tipo === 'evento') {
    const roll = rand(1, 100);
    if (roll <= 35) {
      const dano = rand(5, 20);
      j.hp = Math.max(1, (j.hp || 0) - dano);
      db.salvarJogador(from, j);
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐃𝐈𝐋𝐇𝐀 【⚠️】', [
        '_Você caiu numa armadilha!_',
        '━━━━━━━━━━',
        `💥 -${dano} HP`,
        `❤️ HP atual: ${j.hp}/${j.hp_max}`
      ]));
    } else if (roll <= 70) {
      const xp = rand(10, 40);
      j.xp = (j.xp || 0) + xp;
      db.salvarJogador(from, j);
      return enviar(jid, bloco('𝐃𝐄𝐒𝐂𝐎𝐁𝐄𝐑𝐓𝐀 【✨】', [
        '_Você encontra runas antigas gravadas na pedra e aprende algo com elas._',
        '━━━━━━━━━━',
        `📚 +${xp} XP`
      ]));
    } else {
      const cura = rand(10, 30);
      j.hp = Math.min(j.hp_max || j.hp, (j.hp || 0) + cura);
      db.salvarJogador(from, j);
      return enviar(jid, bloco('𝐅𝐎𝐍𝐓𝐄 𝐒𝐀𝐆𝐑𝐀𝐃𝐀 【💧】', [
        '_Você encontra uma pequena fonte de água cristalina e bebe dela._',
        '━━━━━━━━━━',
        `❤️ +${cura} HP`,
        `❤️ HP atual: ${j.hp}/${j.hp_max}`
      ]));
    }
  }

  // tipo === 'nada'
  return enviar(jid, bloco('𝐂𝐀𝐌𝐈𝐍𝐇𝐎 𝐓𝐑𝐀𝐍𝐐𝐔𝐈𝐋𝐎 【🌿】', [
    '_Você segue em frente e nada acontece..._',
    '_Às vezes o caminho mais calmo é só isso mesmo._'
  ]));
}

// ── TURNO DE BATALHA ──────────────────────────────────────
// ── INICIAR ENCONTRO DE BATALHA (após escolha de caminho) ──────
async function iniciarEncontroBatalha(from, jid) {
  const resultado = batalharMonstro(from);
  if (resultado.erro) return enviar(jid, resultado.erro);

  batalhaAtiva.set(from, {
    tipo: 'monstro',
    monstro_nome: resultado.monstro_nome || 'Monstro',
    monstro_hp: resultado.monstro_hp || 100,
    monstro_hp_max: resultado.monstro_hp_max || 100,
    turno: 1
  });

  const j2 = db.getJogador(from);
  const hp_pct = Math.floor((j2.hp / j2.hp_max) * 10);
  const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);
  const b = batalhaAtiva.get(from);
  const m_pct = Math.floor((b.monstro_hp / b.monstro_hp_max) * 10);
  const m_barra = '█'.repeat(m_pct) + '░'.repeat(10 - m_pct);

  return enviar(jid,
    bloco('𝐁𝐀𝐓𝐀𝐋𝐇𝐀 【⚔️】', [
      flavorMonstro(b.monstro_nome),
      '━━━━━━━━━━',
      `${emojiMonstro(b.monstro_nome)} ${b.monstro_nome}`,
      ...(estrelasDoMonstro(b.monstro_nome) ? [estrelasDoMonstro(b.monstro_nome)] : []),
      `❤️ HP: ${b.monstro_hp}/${b.monstro_hp_max}`,
      `[${m_barra}]`,
      '━━━━━━━━━━',
      `👤 ${j2.nome}`,
      `❤️ HP: ${j2.hp}/${j2.hp_max}`,
      `[${barra}]`,
      '━━━━━━━━━━',
      '⚔️ O que fazer?',
      '1️⃣ /matar — Atacar',
      '2️⃣ /fugir — Fugir',
      '3️⃣ /mochila — Usar item',
      '4️⃣ /chamarpet — Chamar pet',
      '5️⃣ /habilidade [nome]'
    ])
  );
}

async function processarTurnoBatalha(from, jid, acao) {
  const batalha = batalhaAtiva.get(from);
  if (!batalha) return;

  const j = db.getJogador(from);
  if (!j) return;

  if (acao === 'matar' || acao === 'atacar') {
    const dano_jogador = Math.floor((j.for || 10) * (1.5 + Math.random()));
    const dano_bruto_monstro = Math.floor(Math.random() * 20 + 10);
    const reducao_con = Math.floor((j.con || 10) * 0.6);
    const dano_monstro = Math.max(3, dano_bruto_monstro - reducao_con);

    batalha.monstro_hp -= dano_jogador;

    // Pet ajuda na batalha, se o jogador tiver um
    let log_pet = null;
    const ajuda_pet = petAjudaBatalha(from, batalha.monstro_hp);
    if (ajuda_pet) {
      batalha.monstro_hp -= ajuda_pet.dano;
      log_pet = `🐾 ${ajuda_pet.nome} atacou! Dano: *${ajuda_pet.dano}*`;
    }

    j.hp = Math.max(0, j.hp - dano_monstro);
    db.salvarJogador(from, j);

    if (batalha.monstro_hp <= 0) {
      batalhaAtiva.delete(from);
      j.kills = (j.kills || 0) + 1;
      db.salvarJogador(from, j);
      const xp_ganho = Math.floor(Math.random() * 60 + 30);
      const moedas = Math.floor(Math.random() * 45 + 25);
      db.adicionarXP(from, xp_ganho);
      db.adicionarMoedas(from, moedas);
      const loot_msg = rolarLootBatalha(from);
      const j_pos_loot = db.getJogador(from) || j;
      const hp_v = Math.floor((j_pos_loot.hp / j_pos_loot.hp_max) * 10);
      const barra_v = '█'.repeat(Math.max(0,hp_v)) + '░'.repeat(Math.max(0,10-hp_v));
      const frasesVitoria = [
        '_O corpo dele cai e some entre as sombras da floresta._',
        '_Um último gemido, e tudo fica em silêncio novamente._',
        '_Você respira fundo, ainda com adrenalina no sangue._',
        '_Mais um inimigo cai. O IMPERIUS observa._'
      ];
      return enviar(jid, bloco('𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 【🏆】', [
        `⚔️ ${batalha.monstro_nome} derrotado!`,
        `💥 Você causou ${dano_jogador} de dano`,
        ...(log_pet ? [log_pet] : []),
        `_${frasesVitoria[Math.floor(Math.random() * frasesVitoria.length)]}_`,
        '━━━━━━━━━━',
        `⭐ XP: +${xp_ganho}`,
        `💰 Belarium: +${moedas}`,
        ...(loot_msg ? [loot_msg] : []),
        `❤️ HP: ${j_pos_loot.hp}/${j_pos_loot.hp_max}`,
        `[${barra_v}]`,
        '━━━━━━━━━━',
        '/caminhar | /acampar | /perfil | /rpg'
      ]));
    }

    if (j.hp <= 0) {
      batalhaAtiva.delete(from);
      j.morto = true;
      j.hp = 0;
      j.mortes = (j.mortes || 0) + 1;
      db.salvarJogador(from, j);
      const frasesDerrota = [
        '_Tudo escurece. O IMPERIUS registrou sua queda._',
        '_Sua visão falha, e o mundo desaparece aos poucos._',
        '_O último golpe foi certeiro demais._'
      ];
      return enviar(jid, bloco('𝐃𝐄𝐑𝐑𝐎𝐓𝐀 【💀】', [
        `${j.nome} foi derrotado por ${batalha.monstro_nome}!`,
        '━━━━━━━━━━',
        `_${frasesDerrota[Math.floor(Math.random() * frasesDerrota.length)]}_`,
        '/criar — Criar novo personagem'
      ]));
    }

    const hp_pct = Math.floor((j.hp / j.hp_max) * 10);
    const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);
    const m_pct = Math.max(0, Math.floor((batalha.monstro_hp / batalha.monstro_hp_max) * 10));
    const m_barra = '█'.repeat(m_pct) + '░'.repeat(10 - m_pct);

    batalhaAtiva.set(from, batalha);
    return enviar(jid, bloco('𝐁𝐀𝐓𝐀𝐋𝐇𝐀 — 𝐓𝐔𝐑𝐍𝐎 【⚔️】', [
      `_${flavorAtaqueJogador()}_`,
      '━━━━━━━━━━',
      `${emojiMonstro(batalha.monstro_nome)} ${batalha.monstro_nome}`,
      ...(estrelasDoMonstro(batalha.monstro_nome) ? [estrelasDoMonstro(batalha.monstro_nome)] : []),
      `❤️ HP: ${batalha.monstro_hp}/${batalha.monstro_hp_max}`,
      `[${m_barra}]`,
      '━━━━━━━━━━',
      `👤 ${j.nome}`,
      `💥 Você causou ${dano_jogador}`,
      ...(log_pet ? [log_pet] : []),
      `_${flavorContraAtaque(batalha.monstro_nome)}_`,
      `💢 Recebeu ${dano_monstro}`,
      `❤️ HP: ${j.hp}/${j.hp_max}`,
      `[${barra}]`,
      '━━━━━━━━━━',
      '1️⃣ /matar | 2️⃣ /fugir',
      '3️⃣ /mochila | 4️⃣ /chamarpet'
    ]));
  }
}

// ── CRIAÇÃO DE PERSONAGEM ─────────────────────────────────
async function processarCriacao(from, jid, texto, msg) {
  const estado = criando.get(from);
  if (!estado) return;

  if (estado.etapa === 'classe') {
    // Handle SIM/NÃO for rare class from roleta
    if (estado.dados.classe_roleta) {
      if (texto.toLowerCase() === 'sim') {
        estado.dados.classe = estado.dados.classe_roleta;
        delete estado.dados.classe_roleta;
        estado.etapa = 'nome';
        criando.set(from, estado);
        const classeData = CLASSES[estado.dados.classe];
        return enviar(jid, bloco('𝐂𝐋𝐀𝐒𝐒𝐄 𝐒𝐄𝐋𝐄𝐂𝐈𝐎𝐍𝐀𝐃𝐀 【✅】', [
          `${classeData.nome}`,
          `_${classeData.passiva}_`,
          '━━━━━━━━━━',
          '👤 Qual o nome do seu personagem?'
        ]));
      } else {
        delete estado.dados.classe_roleta;
        criando.set(from, estado);
        return enviar(jid, `❌ Classe recusada! Escolha uma classe normal:`);
      }
    }
    
    const classe_key = getClasseKey(texto);
    if (!classe_key) return enviar(jid, `❌ Classe inválida!\nDigite o número ou nome da classe.`);
    estado.dados.classe = classe_key;
    estado.etapa = 'nome';
    criando.set(from, estado);
    return enviar(jid, bloco('𝐂𝐋𝐀𝐒𝐒𝐄 𝐒𝐄𝐋𝐄𝐂𝐈𝐎𝐍𝐀𝐃𝐀 【✅】', [
      `${CLASSES[classe_key].nome}`,
      `_${CLASSES[classe_key].passiva}_`,
      '━━━━━━━━━━',
      '👤 Qual o nome do seu personagem?'
    ]));
  }

  if (estado.etapa === 'nome') {
    if (texto.length < 2 || texto.length > 20) return enviar(jid, `❌ Nome deve ter 2-20 caracteres.`);
    estado.dados.nome_temp = texto;
    estado.etapa = 'confirmar_nome';
    criando.set(from, estado);
    return enviar(jid, bloco('𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐑 𝐍𝐎𝐌𝐄 【❓】', [
      `Nome escolhido: *${texto}*`,
      '━━━━━━━━━━',
      'Tem certeza desse nome?',
      '✅ Digite SIM para confirmar',
      '❌ Digite NÃO para escolher outro'
    ]));
  }

  if (estado.etapa === 'confirmar_nome') {
    const resp = texto.toLowerCase().trim();
    if (resp === 'sim' || resp === 's') {
      estado.dados.nome = estado.dados.nome_temp;
      delete estado.dados.nome_temp;
      estado.etapa = 'genero';
      criando.set(from, estado);
      return enviar(jid, bloco('𝐍𝐎𝐌𝐄 𝐃𝐄𝐅𝐈𝐍𝐈𝐃𝐎 【✅】', [
        `Nome: ${estado.dados.nome}`,
        '━━━━━━━━━━',
        '⚧️ Qual o gênero do personagem?',
        '1️⃣ Masculino',
        '2️⃣ Feminino',
        '3️⃣ Outro'
      ]));
    }
    if (resp === 'não' || resp === 'nao' || resp === 'n') {
      delete estado.dados.nome_temp;
      estado.etapa = 'nome';
      criando.set(from, estado);
      return enviar(jid, `❌ Nome recusado! Digite o novo nome do personagem:`);
    }
    return enviar(jid, `❌ Responda com SIM ou NÃO!`);
  }

  if (estado.etapa === 'genero') {
    const opcoes = { '1': 'masculino', '2': 'feminino', '3': 'outro', 'masculino': 'masculino', 'feminino': 'feminino', 'outro': 'outro', 'm': 'masculino', 'f': 'feminino' };
    const genero = opcoes[texto.toLowerCase().trim()];
    if (!genero) return enviar(jid, `❌ Digite 1, 2 ou 3!`);
    estado.dados.genero = genero;
    estado.etapa = 'idade';
    criando.set(from, estado);
    return enviar(jid, bloco('𝐆𝐄̂𝐍𝐄𝐑𝐎 𝐃𝐄𝐅𝐈𝐍𝐈𝐃𝐎 【✅】', [
      `Gênero: ${genero}`,
      '━━━━━━━━━━',
      '📅 Qual a idade do personagem?'
    ]));
  }

  if (estado.etapa === 'idade') {
    const idade = parseInt(texto);
    if (isNaN(idade) || idade < 1 || idade > 9999) return enviar(jid, `❌ Digite uma idade válida.`);
    estado.dados.idade = idade;
    estado.etapa = 'caracteristicas';
    criando.set(from, estado);
    return enviar(jid, bloco('𝐈𝐃𝐀𝐃𝐄 𝐃𝐄𝐅𝐈𝐍𝐈𝐃𝐀 【✅】', [
      `Idade: ${idade} anos`,
      '━━━━━━━━━━',
      '✨ Descreva as características físicas:',
      '_Ex: cabelo preto longo, olhos azuis,_',
      '_pele clara, cicatriz no rosto_'
    ]));
  }

  if (estado.etapa === 'caracteristicas') {
    if (texto.length < 3) return enviar(jid, `❌ Descreva melhor as características!`);
    estado.dados.caracteristicas = texto;
    estado.etapa = 'historia';
    criando.set(from, estado);
    return enviar(jid, bloco('𝐂𝐀𝐑𝐀𝐂𝐓𝐄𝐑𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 𝐃𝐄𝐅𝐈𝐍𝐈𝐃𝐀𝐒 【✅】', [
      `_${texto}_`,
      '━━━━━━━━━━',
      '📖 Escreva a história do personagem:'
    ]));
  }

  if (estado.etapa === 'historia') {
    estado.dados.historia = texto;
    criando.delete(from);
    const { classe, nome, idade, genero, caracteristicas, historia } = estado.dados;
    const classeData = CLASSES[classe];
    const whatsapp_nome = msg.pushName || 'Aventureiro';

    // Se está renascendo, só atualiza classe e HP
    if (estado.renascendo) {
      const j_ren = db.getJogador(from);
      if (j_ren) {
        j_ren.classe = classe;
        j_ren.hp = classeData.hp;
        j_ren.hp_max = classeData.hp;
        j_ren.mana = classeData.mana;
        j_ren.mana_max = classeData.mana;
        j_ren.for = classeData.for;
        j_ren.des = classeData.des;
        j_ren.con = classeData.con;
        j_ren.int = classeData.int;
        j_ren.morto = false;
        j_ren.renascendo = false;
        j_ren.hp = Math.floor(classeData.hp * 0.3);
        db.salvarJogador(from, j_ren);
        return enviar(jid, bloco('✨ RENASCIDO 【🌟】', [
          `${j_ren.nome} voltou como ${classeData.nome}!`,
          '━━━━━━━━━━',
          `❤️ HP: ${j_ren.hp}/${j_ren.hp_max}`,
          `🎭 ${classeData.nome}`,
          `🛡️ Passiva: ${classeData.passiva}`,
          '━━━━━━━━━━',
          '_Descanse com /acampar_',
          '/caminhar — Voltar a lutar'
        ]));
      }
    }

    db.criarJogador(from, whatsapp_nome, classe, nome, idade, historia, classeData);
    db.adicionarMoedas(from, 100);

    // Salvar características no jogador
    const j = db.getJogador(from);
    if (j) {
      j.genero = genero || 'outro';
      j.caracteristicas = caracteristicas || '';
      j.imagem_url = null;
      if (!j.inventario) j.inventario = [];
      for (let i = 0; i < 5; i++) j.inventario.push('pocao_hp_maxima');
      db.salvarJogador(from, j);
    }

    const ficha_txt = bloco('𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐆𝐄𝐌 𝐂𝐑𝐈𝐀𝐃𝐎 【⚔️】', [
      `👤 ${nome} ${genero === 'masculino' ? '♂️' : genero === 'feminino' ? '♀️' : '⚧️'}`,
      `🎭 ${classeData.nome}`,
      `📅 ${idade} anos`,
      `✨ _${caracteristicas || ''}_`,
      `📖 _${historia}_`,
      '━━━━━━━━━━',
      `❤️ HP: ${classeData.hp}`,
      `💧 Mana: ${classeData.mana}`,
      `🛡️ Passiva: ${classeData.passiva}`,
      '━━━━━━━━━━',
      '💰 Belarium: 100',
      '🗺️ Região: Valdris',
      '⭐ Nível: 1',
      '🧪 Kit inicial: 5x Poção de HP Máxima',
      '━━━━━━━━━━',
      '_Bem-vindo ao IMPERIUS!_',
      '⚔️ Evolua ou morra.'
    ]);

    await enviar(jid, ficha_txt);

    return enviar(jid, bloco('𝐏𝐑𝐎́𝐗𝐈𝐌𝐎𝐒 𝐏𝐀𝐒𝐒𝐎𝐒 【📋】', [
      `Bem-vindo, ${nome}! O que fazer agora?`,
      '━━━━━━━━━━',
      '⚔️ /caminhar — Sua primeira batalha!',
      '🛒 /loja — Compre itens e armas',
      '🗺️ /viajar — Explore o mundo',
      '👁️ /perfil — Veja sua ficha',
      '📋 /rpg — Todos os comandos',
      '━━━━━━━━━━',
      '_O IMPERIUS aguarda, aventureiro._',
      '_Evolua ou morra._ ⚔️'
    ]));
  }
}

// ── INICIAR ───────────────────────────────────────────────
bannerImperius();
console.log(GREEN + '[SISTEMA] Iniciando IMPERIUS...' + RESET);
conectar().catch(console.error);
process.on('uncaughtException', (err) => console.error('Erro não tratado:', err));
process.on('unhandledRejection', (err) => console.error('Promise rejeitada:', err));
