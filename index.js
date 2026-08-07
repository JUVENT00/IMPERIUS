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
const { usarHabilidade, usarUltimate, rolarD20, rand, gerarMonstro, gerarBoss, bossesDaRegiao, faseAtualBoss, calcularDanoBase, calcularDefesa, aplicarPassivaClasse, getResultadoD20, usarHabilidadeArma, usarSupremaArma } = require('./combat');
const { suicidar, reviverPorNecromante, aprovarAcaoServo, registrarAcaoServo, liberarServo } = require('./death');
const { verLoja, comprarItem, usarItem, equiparArma, equiparArmadura, venderItem, verInventario, verBanco, depositar, sacar } = require('./economy');
const { verRanking, verRankingConquistas, verConquistas, verTitulos, verTitulosDisponiveis, usarTitulo, verMissoes, progredirMissao, coletarMissao, matarJogador, darItem, removerItem, abencoarJogador, maldicionarJogador, eventoGlobal, statusBot, verRankingMoedas, verRankingXP, verRankingKills, verRankingPets, iniciarEventoAleatorio, participarEventoAleatorio, finalizarEventoAleatorio, statusEventoAleatorio, listarADMs, isADM, darADM, removerADM } = require('./events');
const { criarSacrificio, aceitarSacrificio, recusarSacrificio, pedirSacrificioParceiro, aceitarMorteSacrificio, recusarMorteSacrificio, verSacrificiosPendentes } = require('./sacrifice');
const { encarnar, ascender, processarMorteEncarnacao, isEncarnacao } = require('./incarnation');
const { verLojaOvos, chocarOvo, verPet, soltarPet, curarPet, petAjudaBatalha, tentarDomar, nomearPet, comprarOvo, gerarEstado, ITENS_DOMAR, CRIATURAS, ESTADOS, ehAnimalSelvagem, tentarDomarAnimal, chamarPet, chamarAnimalBatalha, verAnimais, verMeuAnimal, soltarAnimal, adotarAnimal, estrelasDoMonstro, OVOS } = require('./pets');
const { verReceitas, craftar } = require('./craft');
const { provocarDeus, aceitarEventoDeus, ignorarDeus, atacarDeus, pedirAjuda, aceitarAjuda, fugirDeus, deusDescansar, statusEvento } = require('./god');
const { criarGuilda, verGuilda, convidarGuilda, aceitarGuilda, sairGuilda, rankingGuildas } = require('./guild');
const { verMasmorras, entrarMasmorra, acampar, pedirCasamento, aceitarCasamento, divorciar, loginDiario } = require('./dungeon');
const { reforjar, sucatear, guerraGuilda, verPodio, verTalentos, investirTalento, prestigiar, petBatalha, criarLeilao, verLeiloes, comprarLeilao, cancelarLeilao } = require('./extras');
const {
  novoJogoVelha, tabuleiroVelhaTexto, jogarVelha,
  novoJogoMemoria, tabuleiroMemoriaTexto, virarCartaMemoria,
  novoJogoForca, palavraForcaTexto, chutarLetraForca, BONECO_FORCA,
  jogarCacaNiquel, jogarPPT, jogarCaraCoroa,
  novoJogoAdivinhacao, tentarAdivinhar,
  getPontosMinigame, adicionarPontosMinigame, rankingMinigamesTexto,
} = require('./minigames');
const { responderComoImperius, mencionaImperius, podeUsarChat, mensagemBoasVindas } = require('./imperius_ai');
const { CLASSES, ARMAS, ARMADURAS, ARMAS_PRIMORDIAIS, REGIOES, ITENS_LOJA, TITULOS, CONQUISTAS, HABILIDADES_ARMA_EXCLUSIVA } = require('./gameData');


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
const mercadorAtivo = new Map(); // ambulante de troca raro que aparece em vez de um monstro
const convitesCoop = new Map(); // convites pendentes de /chamarajuda, chave = id do convidado
let botAtivo = true; // /on e /off

// WhatsApp/Baileys às vezes reemite o mesmo evento 'notify' (reconexão,
// multi-device sync) — sem isso, o mesmo comando podia ser processado duas
// vezes (ex: /depositar rodando 2x pra mesma mensagem, "duplicando" o valor).
const mensagensProcessadas = new Map(); // msg.key.id -> timestamp
const JANELA_DEDUP_MS = 5 * 60 * 1000;
function jaProcessada(id) {
  if (!id) return false;
  const agora = Date.now();
  for (const [k, t] of mensagensProcessadas) {
    if (agora - t > JANELA_DEDUP_MS) mensagensProcessadas.delete(k);
  }
  if (mensagensProcessadas.has(id)) return true;
  mensagensProcessadas.set(id, agora);
  return false;
}

const nomeandoPet = new Map(); // Aguardando nome do pet // Armazena batalhas ativas
const escolhaCaminho = new Map(); // Aguardando escolha de caminho antes da batalha
const pvpAtivo = new Map(); // Duelos ATIVOS (aceitos) — cada participante aponta pro mesmo objeto
const convitesDuelo = new Map(); // Desafios de duelo PENDENTES, chave = id de quem foi desafiado
const confirmarBossArriscado = new Map(); // jogador_id -> { bossNome, expira } — confirmação de 2º passo pra boss arriscado
let confirmacaoResetPendente = null; // { criado_em } — /resetarbot arma isso, confirma enviando "0"

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
  for (const [id, convite] of convitesDuelo.entries()) {
    if (agora - convite.criado_em > 5 * 60 * 1000) { // 5 minutos sem responder
      convitesDuelo.delete(id);
    }
  }
  for (const [id, pendente] of confirmarBossArriscado.entries()) {
    if (agora - pendente.criado > 30 * 1000) { // já expirou de qualquer forma
      confirmarBossArriscado.delete(id);
    }
  }
}, 60 * 1000);

// ── EVENTO ALEATÓRIO: o bot anuncia sozinho de tempos em tempos ──
setInterval(async () => {
  if (!sock) return;
  const grupoId = db.getConfig('grupo_id');
  if (!grupoId) return; // ainda não viu nenhuma mensagem de grupo pra saber onde anunciar
  const jaAtivo = db.getConfig('evento_aleatorio_ativo');
  if (jaAtivo) return; // já tem evento rolando, não sobrepõe

  if (Math.random() < 0.25) { // ~25% de chance a cada checagem (a cada 20 min, em média 1 evento por ~1h20)
    const anuncio = iniciarEventoAleatorio();
    try { await sock.sendMessage(grupoId, { text: anuncio }); } catch (e) { console.error('Erro ao anunciar evento aleatório:', e); }

    setTimeout(async () => {
      const resultado = finalizarEventoAleatorio();
      if (resultado) {
        try { await sock.sendMessage(grupoId, { text: resultado }); } catch (e) { console.error('Erro ao finalizar evento aleatório:', e); }
      }
    }, 10 * 60 * 1000); // mesma duração usada em iniciarEventoAleatorio (events.js)
  }
}, 20 * 60 * 1000);
const pendentes_convite = new Map();
const pendentes_casamento = new Map();
// ── MINIGAMES: estado em memória ──────────────────────────
const velhaAtiva = new Map();        // jogador_id -> objeto do jogo (ambos participantes apontam pro mesmo objeto)
const convitesVelha = new Map();     // alvo_id -> { desafiante_id, criado_em }
const memoriaAtiva = new Map();      // jogador_id -> objeto do jogo
const forcaAtiva = new Map();        // jogador_id -> objeto do jogo
const adivinhacaoAtiva = new Map();  // jogador_id -> objeto do jogo
const trocasAtivas = new Map(); // trocas de item em andamento via /trocar e /oferecer


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
  'resetarbot': ['resetarbot', 'resetbot', 'resetartudo'],
  'ajuda': ['ajuda', 'ajud', 'ajuta', 'ajdua'],
  'expiniciantes': ['expiniciantes', 'expiniciante', 'guiainiciante', 'iniciantes'],
  'moneyrank': ['moneyrank', 'moneyranking', 'rankdinheiro', 'rankmoedas'],
  'xprank': ['xprank', 'xpranking', 'rankxp'],
  'killrank': ['killrank', 'killranking', 'rankkills', 'rankmortes'],
  'rankpet': ['rankpet', 'rankpets', 'petrank'],
  'minigames': ['minigames', 'minigame', 'minijogos', 'minijogo'],
  'velha': ['velha', 'jogodavelha', 'jvelha'],
  'aceitarvelha': ['aceitarvelha'],
  'jogar': ['jogar'],
  'memoria': ['memoria', 'jogodamemoria', 'jmemoria'],
  'virar': ['virar'],
  'forca': ['forca', 'jogodaforca'],
  'letra': ['letra'],
  'caçaniquel': ['caçaniquel', 'cacaniquel', 'slot', 'caçaniqueis'],
  'ppt': ['ppt', 'pedrapapeltesoura'],
  'caracoroa': ['caracoroa', 'caraoucoroa'],
  'adivinhar': ['adivinhar', 'adivinhacao', 'adivinharnumero', 'chute'],
  'participarevento': ['participarevento', 'atacarevento'],
  'rankminigames': ['rankminigames', 'minigamerank', 'rankjogos'],
  'eventoaleatorio': ['eventoaleatorio', 'statuseventoaleatorio'],
  'infoarmas': ['infoarmas', 'raridades'],
  'infoarma': ['infoarma'],
  'murageral': ['murageral', 'muralgeral', 'mural'],
  'givedangerarmor': ['givedangerarmor'],
  'givenakanoarmor': ['givenakanoarmor'],
  'giveescarlatearmor': ['giveescarlatearmor'],
  'givealabardaarmor': ['givealabardaarmor'],
  'removeritem': ['removeritem', 'confiscar', 'tiraritem'],
  'daradm': ['daradm', 'darADM', 'nomearadm'],
  'removeradm': ['removeradm', 'removerADM', 'tiraradm'],
  'listaadm': ['listaadm', 'listaadms', 'admins'],
  'definirgrupoiniciante': ['definirgrupoiniciante', 'setgrupoiniciante'],
  'removergrupoiniciante': ['removergrupoiniciante', 'tirargrupoiniciante'],
  'habilidadearma': ['habilidadearma', 'harma'],
  'supremaarma': ['supremaarma', 'suprema'],
  'criar': ['criar', 'crar', 'crair'],
  'roleta': ['roleta', 'rolet', 'rolta', 'girar', 'sortear'],
  'confirmarroleta': ['confirmarroleta', 'confirmaroleta'],
  'perfil': ['perfil', 'perfi', 'perfill', 'perf'],
  'classe': ['classe', 'class', 'clases'],
  'inventario': ['inventario', 'inventaio', 'invetario', 'inv'],
  'conquistas': ['conquistas', 'conquista', 'conq'],
  'topconquistas': ['topconquistas', 'rankconquistas', 'topconq'],
  'titulos': ['titulos', 'titulo'],
  'todostitulos': ['todostitulos', 'titulosdisponiveis', 'catalogotitulos'],
  'usartitulo': ['usartitulo', 'usatitulo', 'equipartitulo'],
  'minhaarma': ['minhaarma', 'minhaarm'],
  'batalha': ['batalha', 'batalah', 'batalia', 'batlha', 'btl', 'caminhar', 'caminha'],
  'boss': ['boss', 'bos', 'bosss'],
  'bosses': ['bosses', 'listabosses', 'bossesregiao'],
  'atacar': ['atacar', 'atcar', 'atack'],
  'chamarajuda': ['chamarajuda', 'chamarauxilio', 'convocar'],
  'ajudar': ['ajudar', 'entrarajuda', 'reforco'],
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
  'armaduras': ['armaduras', 'armadura'],
  'armas': ['armas', 'arma', 'armass'],
  'armasc': ['armasc'],
  'armasd': ['armasd'],
  'armasm': ['armasm'],
  'buscararma': ['buscararma', 'buscarma', 'pesquisararma'],
  'lojapets': ['lojapets', 'lojapet', 'lojaovo'],
  'comprar': ['comprar', 'compra', 'compr'],
  'negociar': ['negociar', 'negocio', 'trocar'],
  'irembora': ['irembora', 'ir embora', 'recusar', 'ignorarmercador'],
  'usar': ['usar', 'usa', 'usaar'],
  'equipar': ['equipar', 'equipa', 'equip'],
  'equiparmadura': ['equiparmadura', 'vestir', 'equiparmor', 'equipararmadura'],
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
  'coletarmissao': ['coletarmissao', 'coletarmissoes', 'coletarmiss'],
  'login': ['login', 'loginn', 'log', 'diario', 'recompensadiaria'],
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
  'revivernpc': ['revivernpc', 'reviverpc', 'revivernp'],
  'banir': ['banir', 'ban'],
  'desbanir': ['desbanir', 'unban', 'desban'],
  'setnivel': ['setnivel', 'setlvl', 'setnv'],
  'curartudo': ['curartudo', 'curatudo'],
  'resetcd': ['resetcd', 'resetcooldown', 'limparcd'],
  'dartitulo': ['dartitulo', 'dartítulo', 'concedertitulo'],
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
  'verperfil': ['verperfil', 'perfilver', 'vperfil'],
  'craft': ['craft', 'craftar'],
  'receitas': ['receitas', 'receita', 'receitascraft'],
  'reforjar': ['reforjar', 'reforja'],
  'sucatear': ['sucatear', 'sucata', 'desmontar'],
  'duelo': ['duelo', 'duelar'],
  'aceitarduelo': ['aceitarduelo', 'aceitoduelo'],
  'recusarduelo': ['recusarduelo', 'recusoduelo'],
  'golpe': ['golpe', 'atacarduelo'],
  'fugirduelo': ['fugirduelo', 'desistirduelo'],
  'guerraguilda': ['guerraguilda', 'guerradeguilda', 'guildaguerra'],
  'podio': ['podio', 'pódio', 'halldafama'],
  'talentos': ['talentos', 'talento'],
  'prestigio': ['prestigio', 'prestígio'],
  'petbatalha': ['petbatalha', 'duelopet', 'batalhapet'],
  'leilao': ['leilao', 'leilão', 'mercado'],
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

// ── DUELO POR TURNOS (PvP com consentimento e vez de cada um) ──────────
function iniciarDesafioDuelo(desafiante_id, alvo_id, aposta) {
  const desafiante = db.getJogador(desafiante_id);
  const alvo = db.getJogador(alvo_id);
  if (!desafiante) return { erro: '❌ Você não tem personagem.' };
  if (!alvo) return { erro: '❌ Alvo não encontrado. Ele precisa ter um personagem criado.' };
  if (desafiante_id === alvo_id) return { erro: '❌ Você não pode duelar consigo mesmo!' };
  if (desafiante.morto) return { erro: '💀 Você está morto! Use /renascer antes.' };
  if (alvo.morto) return { erro: `💀 ${alvo.nome} está morto e não pode duelar agora.` };
  if (pvpAtivo.has(desafiante_id)) return { erro: '❌ Você já está em um duelo! Termine ele primeiro (/golpe ou /fugirduelo).' };
  if (pvpAtivo.has(alvo_id)) return { erro: `❌ ${alvo.nome} já está em outro duelo agora.` };
  if (convitesDuelo.has(alvo_id)) return { erro: `❌ ${alvo.nome} já tem um desafio de duelo pendente.` };

  const valorAposta = Math.max(0, Math.floor(aposta) || 0);
  if (valorAposta > 0) {
    if ((desafiante.moedas || 0) < valorAposta) return { erro: `❌ Você não tem ${db.formatarPreco(valorAposta)} pra apostar!` };
    if ((alvo.moedas || 0) < valorAposta) return { erro: `❌ ${alvo.nome} não tem ${db.formatarPreco(valorAposta)} pra cobrir a aposta!` };
  }

  convitesDuelo.set(alvo_id, {
    desafiante_id, desafiante_nome: desafiante.nome,
    alvo_id, alvo_nome: alvo.nome,
    aposta: valorAposta, criado_em: Date.now()
  });

  return {
    msg: `⚔️ *${desafiante.nome}* desafiou *${alvo.nome}* pra um duelo!${valorAposta > 0 ? `\n💰 Aposta: ${db.formatarPreco(valorAposta)}` : ''}\n\n📝 ${alvo.nome}, use */aceitarduelo* ou */recusarduelo*!`
  };
}

function aceitarDuelo(alvo_id) {
  const convite = convitesDuelo.get(alvo_id);
  if (!convite) return '❌ Você não tem nenhum desafio de duelo pendente.';
  convitesDuelo.delete(alvo_id);

  const desafiante = db.getJogador(convite.desafiante_id);
  const alvo = db.getJogador(alvo_id);
  if (!desafiante || !alvo) return '❌ Um dos jogadores não existe mais.';
  if (pvpAtivo.has(convite.desafiante_id) || pvpAtivo.has(alvo_id)) return '❌ Um dos dois já entrou em outro duelo enquanto isso.';

  const d20_a = rolarD20();
  const d20_b = rolarD20();
  const comecaId = d20_a >= d20_b ? convite.desafiante_id : alvo_id;
  const comecaNome = comecaId === convite.desafiante_id ? desafiante.nome : alvo.nome;

  const batalha = {
    a_id: convite.desafiante_id, a_nome: desafiante.nome,
    b_id: alvo_id, b_nome: alvo.nome,
    hp_a: desafiante.hp_max, hp_a_max: desafiante.hp_max,
    hp_b: alvo.hp_max, hp_b_max: alvo.hp_max,
    turno: comecaId,
    aposta: convite.aposta,
    inicio: Date.now()
  };
  pvpAtivo.set(convite.desafiante_id, batalha);
  pvpAtivo.set(alvo_id, batalha);

  return `${S.topo}\n⚔️ *DUELO ACEITO!*\n${desafiante.nome} 🆚 ${alvo.nome}\n${S.baixo}\n\n🎲 D20: ${desafiante.nome} tirou ${d20_a} | ${alvo.nome} tirou ${d20_b}\n👉 Quem começa: *${comecaNome}*!\n\n📝 Use */golpe* na sua vez pra atacar.`;
}

function recusarDuelo(alvo_id) {
  const convite = convitesDuelo.get(alvo_id);
  if (!convite) return '❌ Você não tem nenhum desafio de duelo pendente.';
  convitesDuelo.delete(alvo_id);
  return `❌ *${convite.alvo_nome}* recusou o duelo de *${convite.desafiante_nome}*.`;
}

function finalizarDuelo(batalha, vencedor_id, perdedor_id, logs) {
  pvpAtivo.delete(batalha.a_id);
  pvpAtivo.delete(batalha.b_id);

  const vencedorJ = db.getJogador(vencedor_id);
  const perdedorJ = db.getJogador(perdedor_id);
  if (!vencedorJ || !perdedorJ) return null;

  vencedorJ.pvp_vitorias = (vencedorJ.pvp_vitorias || 0) + 1;
  perdedorJ.mortes = (perdedorJ.mortes || 0) + 1;
  db.salvarJogador(vencedor_id, vencedorJ);
  db.salvarJogador(perdedor_id, perdedorJ);
  db.adicionarTitulo(perdedor_id, 'mais_fraco');
  if (perdedorJ.mortes >= 10) db.adicionarTitulo(perdedor_id, 'perdedor');

  db.adicionarXP(vencedor_id, 100);
  db.adicionarMoedas(vencedor_id, 50);
  progredirMissao(vencedor_id, 'pvp');

  if (batalha.aposta > 0) {
    db.adicionarMoedas(vencedor_id, batalha.aposta);
    const perdedorAtual = db.getJogador(perdedor_id);
    if (perdedorAtual) {
      perdedorAtual.moedas = Math.max(0, (perdedorAtual.moedas || 0) - batalha.aposta);
      db.salvarJogador(perdedor_id, perdedorAtual);
    }
    logs.push(`\n💰 *${vencedorJ.nome}* ganhou a aposta: +${db.formatarPreco(batalha.aposta)}!`);
  }

  logs.push(`\n🏆 *${vencedorJ.nome} venceu o duelo!* (+50 💰 +100 ⭐)`);

  // Mesmo tratamento especial que o antigo /atacar instantâneo já dava
  // quando o derrotado era uma Encarnação.
  if (isEncarnacao && isEncarnacao(perdedor_id)) {
    return processarMorteEncarnacao(perdedor_id, vencedor_id, vencedorJ.nome);
  }
  return null;
}

function golpeDuelo(jogador_id) {
  const batalha = pvpAtivo.get(jogador_id);
  if (!batalha) return { erro: '❌ Você não está em nenhum duelo ativo. Use /duelo @jogador pra desafiar alguém.' };
  if (batalha.turno !== jogador_id) {
    const nomeDaVez = batalha.turno === batalha.a_id ? batalha.a_nome : batalha.b_nome;
    return { erro: `⏳ Não é sua vez! Esperando *${nomeDaVez}* atacar.` };
  }

  const souA = batalha.a_id === jogador_id;
  const atacante_id = jogador_id;
  const alvo_id = souA ? batalha.b_id : batalha.a_id;
  const atacanteJ = db.getJogador(atacante_id);
  const alvoJ = db.getJogador(alvo_id);
  if (!atacanteJ || !alvoJ) {
    pvpAtivo.delete(batalha.a_id);
    pvpAtivo.delete(batalha.b_id);
    return { erro: '❌ Duelo cancelado — um dos jogadores não existe mais.' };
  }

  const d20 = rolarD20();
  const res = getResultadoD20(d20);
  const { dano_base } = calcularDanoBase(atacanteJ);
  const defesaAlvo = calcularDefesa(alvoJ);
  const dano = Math.max(1, Math.floor(dano_base * (res.mult || 1)) - defesaAlvo);

  if (souA) batalha.hp_b = Math.max(0, batalha.hp_b - dano);
  else batalha.hp_a = Math.max(0, batalha.hp_a - dano);

  const logs = [];
  logs.push(`⚔️ *${atacanteJ.nome}* ataca *${alvoJ.nome}*!`);
  logs.push(`🎲 D20: *${d20}* — ${res.emoji || ''} ${res.texto || ''}`);
  logs.push(`💥 Dano: *${dano}*`);

  const hpAlvoRestante = souA ? batalha.hp_b : batalha.hp_a;
  if (hpAlvoRestante <= 0) {
    const enc_result = finalizarDuelo(batalha, atacante_id, alvo_id, logs);
    return { logs, fim: true, vencedor_id: atacante_id, perdedor_id: alvo_id, enc_result };
  }

  batalha.turno = alvo_id;
  logs.push(`\n❤️ ${batalha.a_nome}: ${batalha.hp_a}/${batalha.hp_a_max}`);
  logs.push(`❤️ ${batalha.b_nome}: ${batalha.hp_b}/${batalha.hp_b_max}`);
  logs.push(`\n⏳ Agora é a vez de *${alvoJ.nome}*! (/golpe)`);
  return { logs, fim: false, proximo_id: alvo_id };
}

function fugirDuelo(jogador_id) {
  const batalha = pvpAtivo.get(jogador_id);
  if (!batalha) return { erro: '❌ Você não está em nenhum duelo ativo.' };
  const outroId = batalha.a_id === jogador_id ? batalha.b_id : batalha.a_id;
  const logs = [];
  const enc_result = finalizarDuelo(batalha, outroId, jogador_id, logs);
  return { msg: `🏳️ Você fugiu do duelo — derrota por desistência!\n${logs.join('\n')}`, enc_result };
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
function checarTituloImperador(jogador_id) {
  const j = db.getJogador(jogador_id);
  if (!j) return;
  // O próprio db.adicionarXP já concede 'imperador' automaticamente ao chegar no nível 200.
  // Isso aqui é só uma rede de segurança, usando o nível real do jogador (não o xp do gameData, que é de outro sistema).
  if ((j.nivel || 1) >= 200) db.adicionarTitulo(jogador_id, 'imperador');
}

// ── AMBULANTE DE TROCA (mercador raro em batalha) ───────────
const ORDEM_RARIDADE_ARMA = [
  '⬜ Comum', '🟫 Inferior', '🟩 Incomum', '🟦 Raro', '🟪 Épico', '🟨 Lendário',
  '🔶 Ancestral', '🔷 Arcana', '🔴 Primordial', '🟠 Abissal', '⚫ Sombria',
  '🌑 Amaldiçoada', '🌟 Celestial', '☀️ Solar', '🌊 Abissal Marinha',
  '❄️ Glacial Eterna', '🔥 Infernal', '⚡ Relâmpago Divino'
];

function gerarOfertasMercador(jogador_id) {
  const j = jogador_id ? db.getJogador(jogador_id) : null;
  const armaAtual = j ? ARMAS.find(a => a.id === j.arma) : null;
  const idxAtual = armaAtual ? ORDEM_RARIDADE_ARMA.indexOf(armaAtual.raridade) : 0;
  // Janela de raridades plausíveis pro jogador: 2 tiers abaixo até 3 acima do que ele já tem equipado
  const idxMin = Math.max(0, idxAtual - 2);
  const idxMax = Math.min(ORDEM_RARIDADE_ARMA.length - 1, idxAtual + 3);
  const tiersValidos = new Set(ORDEM_RARIDADE_ARMA.slice(idxMin, idxMax + 1));

  const pool = [
    ...ARMAS.filter(a => !a.exclusiva && a.preco > 0 && tiersValidos.has(a.raridade)).map(a => ({ tipo: 'arma', id: a.id, nome: a.nome, preco: a.preco, raridade: a.raridade })),
    ...ARMADURAS.filter(a => !a.exclusiva && tiersValidos.has(a.raridade)).map(a => ({ tipo: 'armadura', id: a.id, nome: a.nome, preco: a.preco, raridade: a.raridade })),
    ...ITENS_LOJA.filter(i => i.preco > 0).map(i => ({ tipo: 'item', id: i.id, nome: i.nome, preco: i.preco, raridade: null })),
  ];
  const escolhidos = [];
  const usados = new Set();
  while (escolhidos.length < 3 && escolhidos.length < pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    if (usados.has(idx)) continue;
    usados.add(idx);
    const base = pool[idx];
    const desconto = 0.3 + Math.random() * 0.25; // 30% a 55% de desconto
    const preco_final = Math.max(1, Math.floor(base.preco * (1 - desconto)));
    escolhidos.push({ ...base, preco_original: base.preco, preco: preco_final });
  }
  return escolhidos;
}

async function apresentarMercadorAmbulante(from, jid) {
  const ofertas = gerarOfertasMercador(from);
  mercadorAtivo.set(from, { ofertas, expira: Date.now() + 5 * 60 * 1000 });

  const linhas = ofertas.map((o, i) =>
    `${i + 1}️⃣ *${o.nome}*${o.raridade ? ` — ${o.raridade}` : ''}\n   ~~${o.preco_original}~~ ➡️ ${db.formatarPreco(o.preco)}`
  );

  return enviar(jid, bloco('🧳 𝐀𝐌𝐁𝐔𝐋𝐀𝐍𝐓𝐄 𝐃𝐄 𝐓𝐑𝐎𝐂𝐀 【🧳】', [
    '_Uma figura encapuzada surge no caminho, empurrando um carrinho cheio de relíquias..._',
    '_"Psst... preços especiais, só hoje, só pra você."_',
    '━━━━━━━━━━',
    ...linhas,
    '━━━━━━━━━━',
    '📝 */negociar [número]* — Comprar oferta',
    '🚶 */irembora* — Recusar e seguir caminho'
  ]));
}

function gerarListaArmasPorTipo(tipo) {
  const compraveis = ARMAS.filter(a => a.tipo === tipo && !a.exclusiva && a.preco > 0);
  // Raridades ordenadas por preço (Comum -> Lendário -> ...), não na ordem
  // arbitrária em que apareceram no array.
  const raridades = [...new Set(compraveis.slice().sort((a, b) => a.preco - b.preco).map(a => a.raridade))];
  const linhas = [];
  const nomesUsados = new Set();
  raridades.forEach(r => {
    const doTier = compraveis.filter(a => a.raridade === r);
    // Evita repetir o mesmo nome de arma em raridades diferentes na mesma
    // lista — antes sorteava sem checar, e o mesmo nome (ex: "Espada
    // Ancestral") aparecia várias vezes com preços/danos bem diferentes,
    // parecendo duplicado.
    const candidatos = doTier.filter(a => !nomesUsados.has(a.nome));
    const opcoes = candidatos.length > 0 ? candidatos : doTier;
    const exemplo = opcoes[Math.floor(Math.random() * opcoes.length)];
    nomesUsados.add(exemplo.nome);
    linhas.push(`*${exemplo.nome}* — ${db.formatarPreco(exemplo.preco)} | Dano: ${exemplo.dano[0]}-${exemplo.dano[1]} | ${r}`);
  });
  linhas.push('━━━━━━━━━━');
  linhas.push(`📝 Isso é só um exemplo de cada raridade (${compraveis.length} armas no total nessa categoria).`);
  linhas.push('🔍 */buscararma [nome ou raridade]* — ver mais opções');
  linhas.push('🛒 */comprar [nome] [raridade]* — comprar (a raridade é obrigatória se o nome tiver mais de uma versão)');
  return linhas;
}

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
  if (roll < 95) {
    // Material de crafting — cai do corpo do inimigo, vai pro inventário
    const chaves_material = Object.keys(ITENS_DOMAR);
    const chave = chaves_material[Math.floor(Math.random() * chaves_material.length)];
    const material = ITENS_DOMAR[chave];
    j.inventario = j.inventario || [];
    j.inventario.push(chave);
    db.salvarJogador(jogador_id, j);
    return `${material.nome.split(' ')[0]} O inimigo deixou cair *${material.nome.replace(/^\S+\s/, '')}*!\n📦 Use /receitas pra ver o que dá pra craftar com isso.`;
  }
  return null; // 5% de chance de não dropar nada
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

  // ── BOAS-VINDAS AO ENTRAR NO GRUPO ─────────────────────────
  sock.ev.on('group-participants.update', async (update) => {
    try {
      if (update.action !== 'add') return; // só dispara quando alguém ENTRA
      for (const participante of update.participants) {
        const numero = '@' + participante.split('@')[0];
        const texto = mensagemBoasVindas(numero);
        await enviar(update.id, texto, [participante]);
      }
    } catch (err) {
      console.error('Erro nas boas-vindas:', err);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      if (jaProcessada(msg.key.id)) continue;
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
  if (db.getConfig('grupo_id') !== jid) db.setConfig('grupo_id', jid); // memoriza o grupo pra anúncios automáticos (eventos aleatórios)

  const texto_raw = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption || '';
  const texto = texto_raw.trim();

  if (!texto.startsWith(PREFIX)) {
    if (texto.trim() === '0' && isDono(from) && confirmacaoResetPendente && Date.now() - confirmacaoResetPendente.criado_em < 60 * 1000) {
      confirmacaoResetPendente = null;
      await enviar(jid, '🔄 Resetando... aguarde.');
      const backupPath = await db.resetarTudo();
      await enviar(jid, `✅ *RESET CONCLUÍDO!*\n\nTodos os dados de jogadores foram apagados.\n💾 Backup de segurança salvo em:\n${backupPath}`);
      return;
    }
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

    // Chat livre: só responde se a mensagem citar "Imperius" — sem isso
    // a IA estava respondendo a qualquer coisa reconhecida no meio de
    // conversa normal do grupo e virou spam de mensagem.
    // EXCEÇÃO: no grupo de iniciantes (definido com /definirgrupoiniciante),
    // o bot responde qualquer mensagem sem precisar ser mencionado, pra
    // ajudar quem tá começando sem precisar chamar "Imperius" toda hora.
    const ehGrupoIniciantes = db.getConfig('grupo_iniciantes') === jid;
    if (!criando.has(from) && !batalhaAtiva.has(from) && (mencionaImperius(texto) || ehGrupoIniciantes)) {
      if (!podeUsarChat(from)) return;
      const resposta = responderComoImperius(texto, from, true);
      if (resposta) await enviar(jid, resposta);
    }
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
  if (cmd === 'resetarbot') {
    if (!isDono(from)) return enviar(jid, '❌ Só o dono do bot pode usar esse comando.');
    confirmacaoResetPendente = { criado_em: Date.now() };
    return enviar(jid, `⚠️ *ATENÇÃO — RESET GERAL* ⚠️\n\nIsso vai *apagar os dados de TODOS os jogadores* (personagens, guildas, casamentos, leilões...). Um backup de segurança é feito automaticamente antes de apagar.\n\n🔴 Essa ação não tem volta fácil.\n\n📝 Pra confirmar, envie *0* (só o número, sem comando) nos próximos 60 segundos.\nQualquer outra coisa cancela.`);
  }

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

` + bloco('𝐆𝐄𝐑𝐀𝐋 【📋】', ['ℹ️ /info', '🆘 /ajuda', '🆕 /expiniciantes']) + `

${S.caixa_topo}
${S.caixa_inicio}
┃╎ ⚔️ /rpg — Entrar no mundo
┃╎ 🎮 /minigames — Jogos e diversão
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
      '  ↳ /equiparmadura — Equipar armadura',
      '  ↳ /vender — Vender item do inventário',
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
      '  ↳ /chamarajuda — Chamar amigo pra batalha',
      '  ↳ /ajudar — Aceitar convite de batalha',
      '  ↳ /negociar — Comprar do ambulante',
      '  ↳ /irembora — Recusar o ambulante',
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
      '  ↳ /armaduras — Ver armaduras',
      '  ↳ /buscararma — Buscar arma por nome/raridade',
      '  ↳ /comprar — Comprar item/arma',
      '  ↳ /usar — Usar item',
      '  ↳ /banco — Ver saldo',
      '  ↳ /depositar — Depositar',
      '  ↳ /sacar — Sacar',
      '  ↳ /doar — Doar Belarium',
      '',
      '🔨 CRAFTING',
      '  ↳ /receitas — Ver receitas de craft',
      '  ↳ /craft [receita] — Craftar arma/armadura com materiais',
      '  ↳ /reforjar [item] — Tentar subir a raridade de um item',
      '  ↳ /sucatear [item] — Desmontar item em materiais',
      '',
      '🆕 NOVIDADES',
      '  ↳ /duelo @jogador [aposta] — PvP com aposta de moedas',
      '  ↳ /guerraguilda @alguém — Batalha guilda x guilda',
      '  ↳ /podio — Hall da fama do servidor',
      '  ↳ /talentos [dano|defesa|moedas] — Investir pontos',
      '  ↳ /prestigio — Reset no nível 200 por selo permanente',
      '  ↳ /petbatalha @jogador — Duelo de pets',
      '  ↳ /leilao [ver|criar|comprar|cancelar] — Mercado entre jogadores',
      '  ↳ /diario — Recompensa diária (mesmo que /login)',
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
      '  ↳ /moneyrank — Top Belarium',
      '  ↳ /xprank — Top XP',
      '  ↳ /killrank — Top abates',
      '  ↳ /rankpet — Top pets',
      '  ↳ /conquistas — Suas conquistas',
      '  ↳ /topconquistas — Top conquistadores',
      '  ↳ /titulos — Seus títulos',
      '  ↳ /todostitulos — Catálogo com todos os títulos e como conseguir',
      '  ↳ /usartitulo — Equipar título',
      '  ↳ /missoes — Ver missões',
      '  ↳ /coletarmissao — Coletar recompensa',
      '  ↳ /login — Recompensa diária',
      '  ↳ /casar — Casar @jogador',
      '  ↳ /divorciar — Divorciar',
      '',
      'ℹ️ GERAL',
      '  ↳ /menu — Menu principal',
      '  ↳ /info — Informações do bot',
      '  ↳ /lore — História do IMPERIUS',
      '  ↳ /infoarmas — Raridades de armas',
      '  ↳ /murageral — Mural de armas lendárias',
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
        '🕹️ Mantido e desenvolvido sozinho',
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

  // ── GUIA RÁPIDO PRA INICIANTE ───────────────────────────────
  if (cmd === 'expiniciantes') {
    return enviar(jid,
      bloco('𝐆𝐔𝐈𝐀 𝐃𝐎 𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐓𝐄 【🆕】', [
        '🤖 Bot de WhatsApp: programa que',
        '   responde comandos aqui no grupo',
        '━━━━━━━━━━',
        '🌍 IMPERIUS: um RPG de texto,',
        '   mundo de guerreiros e magia',
        '📱 Esse bot: a versão jogável',
        '   do IMPERIUS aqui no grupo',
        '━━━━━━━━━━',
        '🚀 COMO COMEÇAR',
        '1️⃣ /criar — crie seu personagem',
        '2️⃣ /caminhar — primeira batalha',
        '3️⃣ /loja — compre itens e armas',
        '4️⃣ /perfil — veja sua ficha',
        '━━━━━━━━━━',
        '📋 /rpg — todos os comandos'
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
      '_Único responsável por todo o servidor_',
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
  if (cmd === 'armaduras') {
    // Mesma correção da loja: agrupa por nome (mostra só a versão mais
    // barata) em vez de listar as 18 raridades de cada armadura repetida.
    const porNome = new Map();
    ARMADURAS.forEach(a => {
      const atual = porNome.get(a.nome);
      if (!atual || a.preco < atual.preco) porNome.set(a.nome, a);
    });
    const linhas = [...porNome.values()].map(a => `*${a.nome}* — ${db.formatarPreco(a.preco)} | Defesa: +${a.defesa} | ${a.raridade}`);
    return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐃𝐔𝐑𝐀𝐒 【🛡️】', [
      ...linhas,
      '━━━━━━━━━━',
      '📝 Cada armadura tem outras raridades — inclua a raridade na busca.',
      '🛒 */comprar [nome] [raridade]* — comprar',
      '🛡️ */equiparmadura [nome]* — equipar'
    ]));
  }

  if (cmd === 'buscararma') {
    if (!resto) return enviar(jid, `❌ Use: /buscararma [nome ou raridade, ex: lendário]`);
    const busca = normalizar(resto);
    const encontradas = ARMAS.filter(a => !a.exclusiva && a.preco > 0 &&
      (normalizar(a.nome).includes(busca) || normalizar(a.raridade).includes(busca) || normalizar(a.tipo).includes(busca))
    ).slice(0, 10);
    if (encontradas.length === 0) return enviar(jid, `❌ Nenhuma arma encontrada com "${resto}".`);
    const linhas = encontradas.map(a => `*${a.nome}* — ${db.formatarPreco(a.preco)} | Dano: ${a.dano[0]}-${a.dano[1]} | ${a.raridade}`);
    return enviar(jid, bloco('🔍 RESULTADOS 【🔍】', [
      ...linhas,
      '━━━━━━━━━━',
      '🛒 */comprar [nome exato]*'
    ]));
  }

  if (cmd === 'armas' || cmd === 'armasc' || cmd === 'armasd' || cmd === 'armasm') {
    const sub = cmd === 'armasc' ? 'contato' : cmd === 'armasd' ? 'distancia' : cmd === 'armasm' ? 'magicas' : (resto ? resto.toLowerCase().trim() : '');
    if (sub === 'contato' || sub === 'contato') {
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 𝐃𝐄 𝐂𝐎𝐍𝐓𝐀𝐓𝐎 【⚔️】', gerarListaArmasPorTipo('contato')));
    }
    if (sub === 'distancia' || sub === 'distância') {
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 𝐃𝐄 𝐃𝐈𝐒𝐓𝐀̂𝐍𝐂𝐈𝐀 【🏹】', gerarListaArmasPorTipo('distancia')));
    }
    if (sub === 'magicas' || sub === 'mágicas') {
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 𝐌𝐀́𝐆𝐈𝐂𝐀𝐒 【🪄】', gerarListaArmasPorTipo('magica')));
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
        '⚡ Relâmpago Divino', '🌈 Primeva', '🩸 Personalizada', '☠️ DEUS',
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
      'primeva':'🌈 Primeva','personalizada':'🩸 Personalizada','deus':'☠️ DEUS'
    };
    const raridade = mapa[normalizar(resto)] || mapa[resto.toLowerCase()];
    if (!raridade) return enviar(jid, `❌ Raridade não encontrada!\nUse /infoarmas para ver a lista.`);
    const armas_f = ARMAS.filter(a => a.raridade === raridade);
    if (!armas_f.length) return enviar(jid, `❌ Nenhuma arma nessa raridade!`);
    const itens = armas_f.map(a => `${a.nome} | Dano: ${a.dano[0]}-${a.dano[1]}${a.exclusiva ? ' 🔒' : ''}`);
    return enviar(jid, bloco(`${raridade} 【⚔️】`, itens));
  }

  // ── MURAL GERAL (armas exclusivas de jogadores específicos) ──
  if (cmd === 'murageral') {
    const fs = require('fs');
    const path = require('path');

    const txt_danger = bloco('𝐀𝐊𝐀𝐊𝐄𝐓𝐒𝐔 𝐍𝐎 𝐄𝐍𝐌𝐀 【☠️】', [
      '赤血の閻魔 — 「Enma do Sangue Carmesim」',
      '👤 Portador: Danger',
      '📱 +55 63 9284-8073',
      '━━━━━━━━━━',
      'Katana amaldiçoada que transforma o sangue',
      'derramado em poder absoluto. Forjada nas',
      'profundezas do inferno com o sangue de',
      'incontáveis guerreiros e a alma de um rei',
      'demoníaco.',
      '',
      'Passiva — Trono Carmesim (紅玉座): cada gota',
      'de sangue derramada fortalece a espada.',
      '',
      '1. Banho Escarlate (緋血斬) — o sangue do',
      '   alvo explode em lâminas que o perseguem.',
      '2. Coração da Carnificina (虐殺心臓) — recupera',
      '   energia e aumenta força/velocidade/percepção',
      '   enquanto houver sangue por perto.',
      '3. Mar Carmesim (紅海) — cobre o campo com',
      '   sangue amaldiçoado, drenando os inimigos.',
      '4. Dragão do Sangue (血龍) — libera um dragão',
      '   de sangue que atravessa tudo em seu caminho.',
      '5. Eclipse Rubro (紅蝕) — todo golpe acerta,',
      '   cortes não regeneram, energia é absorvida.',
      '6. Julgamento de Enma (閻魔裁断) — marca o alvo;',
      '   todos os cortes anteriores atingem de novo.',
      '7. Corte da Existência (存在断絶) — corta corpo,',
      '   alma, espaço e energia; anula cura/revive.',
      '',
      '💀 Suprema — Inferno Carmesim Absoluto (紅蓮地獄):',
      'transforma o campo num inferno de sangue onde',
      'a katana nunca perde o fio e cada golpe cria',
      'dezenas de cortes invisíveis. Só termina quando',
      'todos caírem ou o portador encerrar.'
    ]);

    const txt_nakano = bloco('𝐘𝐎𝐌𝐈𝐊𝐀𝐆𝐀𝐑𝐈 【☠️】', [
      '黄泉鎌狩 — 「A Foice Caçadora do Yomi」',
      '👤 Portador: Nakano',
      '📱 +55 74 9979-4808',
      '━━━━━━━━━━',
      'Foice infernal forjada no liminar entre a vida',
      'e o nada — caça não apenas corpos, mas destinos,',
      'memórias e existências inteiras.',
      '',
      'Passiva — Trono da Morte: toda criatura que',
      'encara a lâmina sente sua energia enfraquecer.',
      '',
      '1. Fim Inevitável (終焉の一閃) — corte que ignora',
      '   armaduras, barreiras e regeneração.',
      '2. Ceifador do Destino (運命刈り) — reduz a sorte,',
      '   velocidade, precisão e reação do inimigo.',
      '3. Abismo Carmesim (紅獄) — abre uma fenda que',
      '   prende o alvo com correntes e chamas negras.',
      '4. Mil Cortes do Juízo (千死裁断) — um movimento',
      '   gera centenas de cortes invisíveis ao redor.',
      '5. Eclipse da Existência (存在消滅) — golpe supremo:',
      '   apaga a existência do alvo, sem ressurreição.',
      '',
      '💀 Suprema — Reinado de Yomi (黄泉王の領域):',
      'o mundo vira um reino infernal onde todos os',
      'golpes acertam, o tempo desacelera pros inimigos',
      'e cada inimigo derrotado fortalece o próximo golpe.'
    ]);

    const txt_escarlate = bloco('𝐅𝐀𝐂𝐀 𝐃𝐄 𝐁𝐎𝐋𝐒𝐎 𝐄𝐒𝐂𝐀𝐑𝐋𝐀𝐓𝐄 【🗡️】', [
      '👤 Portador: 👑 Guirhz 👑',
      '📱 +55 82 9905-6829',
      '━━━━━━━━━━',
      '_"Seu fio é humilde demais para ter',
      'reconhecimento do deus do mundo em',
      'que ela se encontra."_',
      '',
      '📜 A Lâmina Humilde. Dizem que não foi',
      'forjada em vulcão nem abençoada por',
      'deus algum — surgiu numa feira, numa',
      'sexta-feira de atraso, quando Zé',
      'Malandro devia 3 meses de aluguel',
      'pro seu Manoel da serralheria e pagou',
      'com um pedaço de ferro velho, uma',
      'lima cega e muita lábia.',
      '',
      '✦ Passiva — O Preço a se Pagar: cada',
      'ataque dobra o dano, mas o',
      'reconhecimento por Deus é esquecido',
      'a cada golpe.',
      '',
      '1. 🩸 Saquear de Sangue — sangra o',
      '   inimigo por 3 turnos.',
      '2. ⚔️ Corte Liso — ignora defesa e o',
      '   reconhecimento de Deus.',
      '3. ✨ Brilho Eterno — reflexo do sol',
      '   no fio cega e atordoa o inimigo.',
      '4. ⏳ Golpe Atrasado — armazena o',
      '   ataque pro turno seguinte, causando',
      '   4x o dano base.',
      '5. 🩸 Sangue Humilde — o sangue',
      '   derramado fortalece o portador,',
      '   roubando a força do inimigo.',
      '━━━━━━━━━━',
      '⚔️ Dano: 500 | ⚡ Vel: 500',
      '🛡️ Durabilidade: 100 | ✨ Magia: 700',
      '📖 Tipo: Faca de Bolso | Classe: Única',
      'Nível necessário: 0 | Valor: não',
      'pode ser comprada'
    ]);

    const txt_alabarda = bloco('𝐀𝐋𝐀𝐁𝐀𝐑𝐃𝐀 𝐃𝐎 𝐑𝐄𝐈 【⚜️】', [
      '👤 Portador: 🎭 pontificy 🎭',
      '📱 +55 82 9905-6829',
      '━━━━━━━━━━',
      'Forjada nas chamas eternas do trono',
      'celestial, criada para governar os',
      'campos de batalha com justiça e',
      'poder absoluto.',
      '',
      'Diz-se que um guerreiro lendário,',
      'escolhido pelo próprio destino,',
      'empunhou esta arma e uniu reinos',
      'sob sua bandeira — não pela sede de',
      'sangue, mas pela vontade de proteger',
      'os inocentes e trazer paz através',
      'da ordem.',
      '',
      '✦ Passiva — Autoridade do Rei:',
      'enfraquece inimigos próximos e',
      'fortalece seu portador.',
      '',
      '1. 👑 Golpe da Coroa — onda de luz',
      '   rubra que esmaga defesas à frente.',
      '2. 🗡️ Perfuração Real — salto',
      '   perfurante, ignora parte da defesa.',
      '3. ⚖️ Julgamento da Coroa — dano',
      '   sagrado massivo e reduz defesa.',
      '4. ✨ Édito Divino — explosão sagrada',
      '   ao redor, reduz defesa e cura o',
      '   portador.',
      '5. 🔥 Rastro do Rei — avanço rápido',
      '   deixando um rastro de chamas reais.',
      '',
      '👑 Suprema — Domínio do Rei: o campo',
      'vira um reino sagrado — todos os',
      'atributos do portador sobem, inimigos',
      'ficam lentos e indefesos, cada golpe',
      'é garantido e cada inimigo derrotado',
      'fortalece o próximo golpe.',
      '_(Duração 15s | Recarga 180s)_',
      '━━━━━━━━━━',
      '⚔️ Dano base: 900-1150',
      '📖 Tipo: Alabarda | Elemento: Luz',
      'Divina / Fogo Real | Nível: 60',
      'Classe: Guerreiros, Paladinos'
    ]);

    const txt_juvent = bloco('𝐅𝐎𝐈𝐂𝐄 𝐃𝐀 𝐂𝐑𝐈𝐀𝐂̧𝐀̃𝐎 【☀️】', [
      '「Arma de Deus」',
      '👑 Portador: JUVENT — Dono do IMPERIUS',
      '📱 +55 67 99816-1300',
      '━━━━━━━━━━',
      'A primeira arma criada por JUVENT, forjada com',
      'o próprio tecido da realidade. Não corta apenas',
      'carne e osso — corta o destino, o tempo e a',
      'própria existência. Sua luz não ilumina: revela',
      'a verdade. Sua escuridão não destrói: apaga o',
      'que jamais deveria ter existido.',
      '',
      'Nenhum mortal pode empunhá-la. Nenhum deus',
      'pode enfrentá-la. Não é uma arma — é a',
      'assinatura do Criador.',
      '',
      'Raridade: ☠️ DEUS | Dano: Infinito | Alcance:',
      'Existência Inteira | Afinidade: Luz e Escuridão',
      '',
      '1. Corte da Criação — um único traço apaga o',
      '   alvo da existência, como se nunca tivesse sido.',
      '2. Julgamento Divino — JUVENT decreta o fim de',
      '   qualquer ser, sem chance de recurso ou fuga.',
      '3. Manifestação do Deus — invoca o poder absoluto',
      '   de JUVENT, manifestando sua vontade no campo.',
      '4. Renascimento do Mundo — reescreve a realidade',
      '   ao redor conforme o desejo de seu portador.',
      '',
      '💬 "Eu não criei esta arma para vencer batalhas...',
      'Eu a criei para lembrar que sou o começo e o fim."',
      '— JUVENT'
    ]);

    const armas_mural = [
      { img: 'danger.jpg', txt: txt_danger },
      { img: 'nakano.jpg', txt: txt_nakano },
      { img: 'escarlate.jpg', txt: txt_escarlate },
      { img: 'alabarda.jpg', txt: txt_alabarda },
      { img: 'juvent.jpg', txt: txt_juvent }
    ];

    for (const a of armas_mural) {
      const caminho_img = path.join(__dirname, a.img);
      if (fs.existsSync(caminho_img)) {
        await sock.sendMessage(jid, {
          image: fs.readFileSync(caminho_img),
          caption: a.txt,
          mimetype: 'image/jpeg'
        });
      } else {
        await enviar(jid, a.txt);
      }
    }
    return;
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
        '  /revivernpc @jogador',
        '  /dar @jogador [item]',
        '  /abencoar @jogador',
        '  /amaldicoar @jogador',
        '  /curartudo @jogador',
        '  /setnivel @jogador [1-200]',
        '  /resetcd @jogador',
        '  /dartitulo @jogador [título]',
        '  /banir @jogador [motivo]',
        '  /desbanir @jogador',
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
        '  /revivernpc @jogador',
        '  /dar @jogador [item]',
        '  /abencoar @jogador',
        '  /amaldicoar @jogador',
        '  /curartudo @jogador',
        '  /setnivel @jogador [1-200]',
        '  /resetcd @jogador',
        '  /dartitulo @jogador [título]',
        '  /banir @jogador [motivo]',
        '  /desbanir @jogador',
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
    const armadura = ARMADURAS.find(a => a.id === j.armadura);
    const regiaoData = REGIOES[j.regiao];
    const guilda = j.guilda_id ? db.getGuilda(j.guilda_id) : null;
    const nomePetPerfil = !j.pet
      ? (j.tem_dragao ? '🐉 Dragão (Dragomante)' : 'Nenhum')
      : (j.pet.nome_dado && j.pet.nome_dado.trim() ? `${j.pet.especie} (${j.pet.nome_dado})` : (j.pet.especie || j.pet.nome || 'Pet sem nome'));

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
        `🛡️ ${armadura ? armadura.nome : 'Sem armadura'}`,
        `🐾 Pet: ${nomePetPerfil}`,
        
        '━━━━━━━━━━',
        `🗺️ ${regiaoData?.nome || j.regiao} | 💰 ${db.formatarBelarium(j)}`,
        `🏛️ Guilda: ${guilda?.nome || 'Nenhuma'}`,
        `💀 Kills: ${j.kills} | Mortes: ${j.mortes}`,
        `${j.morto ? '💀 MORTO' : '✅ VIVO'}`
      ]);
    await enviar(jid, perfil_txt);
    return;
  }

  if (cmd === 'classe') { const j = db.getJogador(from); if (!j) return enviar(jid, `❌ Sem personagem!`); return enviar(jid, verClasse(from)); }
  if (cmd === 'inventario') return enviar(jid, verInventario(from));

  // ── /cooldowns ────────────────────────────────────────────
  if (cmd === 'cooldowns') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    const agora = Date.now();
    const lista = [
      { nome: '⚔️ Batalha', campo: 'cooldown_batalha', duracao: 30 * 1000 },
      { nome: '🎰 Roleta', campo: 'cooldown_roleta', duracao: 10 * 60 * 1000 },
      { nome: '🏰 Masmorra', campo: 'cooldown_masmorra', duracao: 2 * 60 * 60 * 1000 },
      { nome: '🏕️ Acampar', campo: 'cooldown_acampar', duracao: 3 * 60 * 1000 },
    ];
    const linhas = lista.map(c => {
      const ultimo = j[c.campo] || 0;
      const restante = c.duracao - (agora - ultimo);
      if (restante <= 0) return `${c.nome}: ✅ Disponível`;
      const min = Math.ceil(restante / 60000);
      return `${c.nome}: ⏳ ${min > 0 ? `${min} min` : `${Math.ceil(restante / 1000)}s`}`;
    });
    return enviar(jid, bloco('𝐂𝐎𝐎𝐋𝐃𝐎𝐖𝐍𝐒 【⏳】', linhas));
  }

  // ── /desequipar ───────────────────────────────────────────
  if (cmd === 'desequipar') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    const alvo = (resto || '').trim().toLowerCase();
    if (!alvo) return enviar(jid, `❌ Use: /desequipar arma  ou  /desequipar armadura`);
    if (alvo.startsWith('arma') && !alvo.startsWith('armadura')) {
      if (!j.arma) return enviar(jid, `❌ Você não tem arma equipada!`);
      j.arma = null;
      db.salvarJogador(from, j);
      return enviar(jid, `✅ Arma desequipada.`);
    }
    if (alvo.startsWith('armadura')) {
      if (!j.armadura) return enviar(jid, `❌ Você não tem armadura equipada!`);
      j.armadura = null;
      db.salvarJogador(from, j);
      return enviar(jid, `✅ Armadura desequipada.`);
    }
    return enviar(jid, `❌ Use: /desequipar arma  ou  /desequipar armadura`);
  }

  // ── /comparar [item1] / [item2] ──────────────────────────
  if (cmd === 'comparar') {
    const partes = (resto || '').split('/').map(s => s.trim()).filter(Boolean);
    if (partes.length !== 2) return enviar(jid, `❌ Use: /comparar [item1] / [item2]`);
    const buscar = nome => ARMAS.find(a => a.nome.toLowerCase().includes(nome.toLowerCase()))
      || ARMADURAS.find(a => a.nome.toLowerCase().includes(nome.toLowerCase()));
    const i1 = buscar(partes[0]);
    const i2 = buscar(partes[1]);
    if (!i1 || !i2) return enviar(jid, `❌ Um dos itens não foi encontrado. Confira o nome exato.`);
    const linha = (label, v1, v2) => `${label}: *${v1}* vs *${v2}*`;
    const linhas = [`⚔️ *${i1.nome}* vs 🛡️ *${i2.nome}*`, '━━━━━━━━━━'];
    if (i1.dano) linhas.push(linha('Dano', `${i1.dano[0]}-${i1.dano[1]}`, i2.dano ? `${i2.dano[0]}-${i2.dano[1]}` : '—'));
    if (i1.defesa !== undefined || i2.defesa !== undefined) linhas.push(linha('Defesa', i1.defesa ?? '—', i2.defesa ?? '—'));
    linhas.push(linha('Preço', db.formatarPreco(i1.preco), db.formatarPreco(i2.preco)));
    linhas.push(linha('Raridade', i1.raridade, i2.raridade));
    return enviar(jid, bloco('𝐂𝐎𝐌𝐏𝐀𝐑𝐀𝐑 【⚖️】', linhas));
  }

  // ── /proximopasso ─────────────────────────────────────────
  if (cmd === 'proximopasso') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    const nivel = j.nivel || 1;
    let sugestoes = [];
    if (j.morto) sugestoes = ['💀 Você está morto — use /criar pra renascer.'];
    else if (!j.arma) sugestoes = ['⚔️ Compre uma arma na /loja antes de tudo.'];
    else if (nivel < 5) sugestoes = ['🗺️ /caminhar pra ganhar XP e Belarium', '⚔️ /batalha pra evoluir mais rápido'];
    else if (nivel < 15) sugestoes = ['🏰 Já dá pra tentar uma /masmorras', '🛒 Bora dar uma olhada na /loja por armas melhores'];
    else if (nivel < 30) sugestoes = ['🐾 Considere adotar um pet (/lojapets)', '⚔️ Encare os bosses da sua região (/mapa)'];
    else sugestoes = ['🏛️ Bora fundar ou entrar numa /guilda', '🗺️ Explore regiões mais avançadas (/viajar)'];
    return enviar(jid, bloco('𝐏𝐑𝐎́𝐗𝐈𝐌𝐎 𝐏𝐀𝐒𝐒𝐎 【🧭】', [`⭐ Nível ${nivel}`, '━━━━━━━━━━', ...sugestoes]));
  }

  // ── /atalhos ──────────────────────────────────────────────
  if (cmd === 'atalhos') {
    return enviar(jid, bloco('𝐀𝐓𝐀𝐋𝐇𝐎𝐒 【⚡】', [
      '/caminhar | /batalha | /perfil',
      '/loja | /comprar | /inventario',
      '/mapa | /viajar | /masmorras',
      '/acampar | /roleta | /login',
      '/cooldowns | /proximopasso'
    ]));
  }

  // ── /estatisticas ─────────────────────────────────────────
  if (cmd === 'estatisticas') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    return enviar(jid, bloco('𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 【📊】', [
      `⭐ Nível: ${j.nivel || 1} | Rank: ${j.rank || 'F'}`,
      `💀 Kills: ${j.kills || 0} | Mortes: ${j.mortes || 0}`,
      `🏰 Masmorras concluídas: ${j.masmorras_concluidas || 0}`,
      `🗺️ Regiões visitadas: ${(j.regioes_visitadas || []).length}/${Object.keys(REGIOES).length}`,
      `🏆 Conquistas: ${(j.conquistas || []).length}`,
      `🏷️ Títulos: ${(j.titulos || []).length}`,
      `💰 Belarium: ${db.formatarBelarium(j)}`
    ]));
  }

  // ── /avisos ───────────────────────────────────────────────
  if (cmd === 'avisos') {
    const aviso = db.getConfig('ultimo_aviso');
    if (!aviso) return enviar(jid, `📭 Nenhum aviso oficial registrado ainda.`);
    return enviar(jid, bloco('𝐔́𝐋𝐓𝐈𝐌𝐎 𝐀𝐕𝐈𝐒𝐎 【📢】', [aviso]));
  }

  // ── /anunciar [mensagem] (dono) ───────────────────────────
  if (cmd === 'anunciar') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode anunciar.`);
    const texto_aviso = (resto || '').trim();
    if (!texto_aviso) return enviar(jid, `❌ Use: /anunciar [mensagem]`);
    db.setConfig('ultimo_aviso', texto_aviso);
    const jogadores = db.todosJogadores();
    const marcar = jogadores.filter(jg => !jg.silenciado).map(jg => jg._id);
    return enviar(jid, bloco('𝐀𝐕𝐈𝐒𝐎 𝐎𝐅𝐈𝐂𝐈𝐀𝐋 【📢】', [texto_aviso]), marcar);
  }

  // ── /silenciar ────────────────────────────────────────────
  if (cmd === 'silenciar') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    j.silenciado = !j.silenciado;
    db.salvarJogador(from, j);
    return enviar(jid, j.silenciado
      ? `🔕 Mensagens automáticas desligadas. Use /silenciar de novo pra reativar.`
      : `🔔 Mensagens automáticas reativadas.`);
  }

  // ── /historico ────────────────────────────────────────────
  if (cmd === 'historico') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    const h = j.historico || [];
    if (!h.length) return enviar(jid, `📭 Nenhuma ação registrada ainda.`);
    return enviar(jid, bloco('𝐇𝐈𝐒𝐓𝐎́𝐑𝐈𝐂𝐎 【📜】', h.slice(-10).reverse()));
  }

  // ── /marcar [local] ───────────────────────────────────────
  if (cmd === 'marcar') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    const local = (resto || '').trim();
    if (!local) {
      if (!j.ponto_marcado) return enviar(jid, `📍 Nenhum ponto marcado ainda. Use /marcar [nome do local].`);
      return enviar(jid, `📍 Ponto marcado atual: *${j.ponto_marcado}*`);
    }
    j.ponto_marcado = local;
    db.salvarJogador(from, j);
    return enviar(jid, `📍 Ponto marcado: *${local}*`);
  }

  // ── /enviar @jogador [item] ───────────────────────────────
  if (cmd === 'enviar') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /enviar @jogador [nome do item]`);
    const nome_item = resto.replace(/@\S+/g, '').trim();
    if (!nome_item) return enviar(jid, `❌ Informe o item. Use: /enviar @jogador [nome do item]`);
    const alvo = db.getJogador(alvo_id);
    if (!alvo) return enviar(jid, `❌ Jogador não encontrado.`);
    if (alvo_id === from) return enviar(jid, `❌ Você não pode enviar um item pra si mesmo.`);
    if (!j.inventario) j.inventario = [];
    const idx = j.inventario.findIndex(it => {
      const dados = ARMAS.find(a => a.id === it) || ARMADURAS.find(a => a.id === it) || ITENS_LOJA.find(i => i.id === it);
      return dados && dados.nome.toLowerCase().includes(nome_item.toLowerCase());
    });
    if (idx === -1) return enviar(jid, `❌ Você não tem esse item no inventário.`);
    const item_id = j.inventario[idx];
    const item_dados = ARMAS.find(a => a.id === item_id) || ARMADURAS.find(a => a.id === item_id) || ITENS_LOJA.find(i => i.id === item_id);
    j.inventario.splice(idx, 1);
    db.salvarJogador(from, j);
    if (!alvo.inventario) alvo.inventario = [];
    alvo.inventario.push(item_id);
    db.salvarJogador(alvo_id, alvo);
    await enviar(jid, `🎁 Você enviou *${item_dados?.nome || item_id}* pra ${alvo.nome}!`);
    return enviar(jid, `🎁 ${j.nome} te enviou um presente: *${item_dados?.nome || item_id}*!`, [alvo_id]);
  }

  // ── /trocar @jogador ──────────────────────────────────────
  if (cmd === 'trocar') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Sem personagem!`);
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /trocar @jogador — depois cada um usa /oferecer [item] pra propor a troca.`);
    if (alvo_id === from) return enviar(jid, `❌ Você não pode trocar consigo mesmo.`);
    const alvo = db.getJogador(alvo_id);
    if (!alvo) return enviar(jid, `❌ Jogador não encontrado.`);
    trocasAtivas.set(from, { com: alvo_id, meu_item: null, item_dele: null });
    trocasAtivas.set(alvo_id, { com: from, meu_item: null, item_dele: null });
    await enviar(jid, `🔄 Troca iniciada com ${alvo.nome}! Use /oferecer [item] pra escolher o que vai dar.`);
    return enviar(jid, `🔄 ${j.nome} quer trocar itens com você! Use /oferecer [item] pra escolher o que vai dar.`, [alvo_id]);
  }

  if (cmd === 'oferecer') {
    const troca = trocasAtivas.get(from);
    if (!troca) return enviar(jid, `❌ Você não tem troca ativa. Use /trocar @jogador primeiro.`);
    const j = db.getJogador(from);
    const nome_item = (resto || '').trim();
    if (!nome_item) return enviar(jid, `❌ Use: /oferecer [nome do item]`);
    const idx = (j.inventario || []).findIndex(it => {
      const dados = ARMAS.find(a => a.id === it) || ARMADURAS.find(a => a.id === it) || ITENS_LOJA.find(i => i.id === it);
      return dados && dados.nome.toLowerCase().includes(nome_item.toLowerCase());
    });
    if (idx === -1) return enviar(jid, `❌ Você não tem esse item.`);
    troca.meu_item = j.inventario[idx];
    trocasAtivas.set(from, troca);
    const outraTroca = trocasAtivas.get(troca.com);
    if (outraTroca) { outraTroca.item_dele = troca.meu_item; trocasAtivas.set(troca.com, outraTroca); }

    if (troca.meu_item && outraTroca?.meu_item) {
      // ambos ofereceram — executa a troca
      const jOutro = db.getJogador(troca.com);
      const meuIdx = j.inventario.indexOf(troca.meu_item);
      const idxOutro = jOutro.inventario.indexOf(outraTroca.meu_item);
      j.inventario.splice(meuIdx, 1);
      jOutro.inventario.splice(idxOutro, 1);
      j.inventario.push(outraTroca.meu_item);
      jOutro.inventario.push(troca.meu_item);
      db.salvarJogador(from, j);
      db.salvarJogador(troca.com, jOutro);
      trocasAtivas.delete(from);
      trocasAtivas.delete(troca.com);
      await enviar(jid, `✅ Troca concluída!`);
      return enviar(jid, `✅ Troca concluída!`, [troca.com]);
    }
    return enviar(jid, `✅ Você ofereceu seu item. Aguardando a outra pessoa oferecer também.`);
  }



  if (cmd === 'minhaarma') {
    const j = db.getJogador(from); if (!j) return enviar(jid, `❌ Sem personagem!`);
    const arma = ARMAS.find(a => a.id === j.arma);
    if (!arma) return enviar(jid, `❌ Sem arma! Compre na /loja.`);
    const armaEx = HABILIDADES_ARMA_EXCLUSIVA[j.arma];
    if (!armaEx) {
      return enviar(jid, bloco('𝐒𝐔𝐀 𝐀𝐑𝐌𝐀 【⚔️】', [`${arma.nome}`, `Raridade: ${arma.raridade}`, `Dano: ${arma.dano[0]}-${arma.dano[1]}`]));
    }
    const linhas_hab = Object.values(armaEx.habilidades).map(h =>
      `${h.nome} — 💧${h.custo} mana | ⏳${h.cooldown}min${h.hits > 1 ? ` | ${h.hits} hits` : ''}`
    );
    return enviar(jid, bloco('𝐒𝐔𝐀 𝐀𝐑𝐌𝐀 【⚔️】', [
      `${arma.nome}`,
      `Raridade: ${arma.raridade}`,
      `Dano: ${arma.dano[0]}-${arma.dano[1]}`,
      '━━━━━━━━━━',
      '🎯 Técnicas (use /habilidadearma [nome]):',
      ...linhas_hab,
      '━━━━━━━━━━',
      `${armaEx.suprema.nome} — 💧${armaEx.suprema.custo} mana | ⏳${armaEx.suprema.cooldown}min`,
      '_Use /supremaarma pra ativar_'
    ]));
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
    const batalha_fuga = batalhaAtiva.get(from);
    if (batalha_fuga.participantes) batalha_fuga.participantes = batalha_fuga.participantes.filter(p => p !== from);
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
      const resultado_animal = tentarDomarAnimal(from, nome_monstro_dom, b_dom.estado_criatura);
      if (resultado_animal.erro) return enviar(jid, resultado_animal.erro);
      batalhaAtiva.delete(from);
      if (resultado_animal.sucesso) db.adicionarTitulo(from, 'domador');
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

    // Usa o estado já sorteado no início da batalha (se existir); só sorteia
    // um novo aqui como fallback, pra batalhas antigas que começaram antes dessa mudança.
    const estado_dom = b_dom.estado_criatura || gerarEstado();
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
    db.adicionarTitulo(from, 'domador');
    return enviar(jid, bloco('✅ DOMADO! 【🐾】', [
      `${estado_info?.emoji || '🐾'} ${estado_info?.descricao || ''}`,
      resultado_dom.texto
    ]));
  }

  if (cmd === 'boss') {
    if (resto && resto.trim()) return escolherBoss(from, jid, resto.trim());
    return iniciarEncontroBoss(from, jid);
  }
  if (cmd === 'bosses') return enviar(jid, verBossesRegiao(from));

  if (cmd === 'atacar' && !batalhaAtiva.has(from)) {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador! Use: /atacar @jogador`);
    const partesAposta = resto.replace(/@\d+/, '').trim().split(/\s+/);
    const apostaAtacar = parseInt(partesAposta[0]) || 0;
    const r = iniciarDesafioDuelo(from, alvo_id, apostaAtacar);
    if (r.erro) return enviar(jid, r.erro);
    return enviar(jid, r.msg, [alvo_id]);
  }

  if (cmd === 'duelo') {
    const alvo_duelo = extrairMencao(resto, msg);
    if (!alvo_duelo) return enviar(jid, `❌ Use: /duelo @jogador [aposta opcional]`);
    const partes_duelo = resto.replace(/@\d+/, '').trim().split(/\s+/);
    const aposta = parseInt(partes_duelo[0]) || 0;
    const r = iniciarDesafioDuelo(from, alvo_duelo, aposta);
    if (r.erro) return enviar(jid, r.erro);
    return enviar(jid, r.msg, [alvo_duelo]);
  }

  if (cmd === 'aceitarduelo') return enviar(jid, aceitarDuelo(from));
  if (cmd === 'recusarduelo') return enviar(jid, recusarDuelo(from));

  if (cmd === 'golpe' || (cmd === 'atacar' && pvpAtivo.has(from))) {
    const r = golpeDuelo(from);
    if (r.erro) return enviar(jid, r.erro);
    if (r.enc_result) { await enviar(jid, r.logs.join('\n')); return enviar(jid, r.enc_result.msg_grupo); }
    return enviar(jid, r.logs.join('\n'));
  }

  if (cmd === 'fugirduelo') {
    const r = fugirDuelo(from);
    if (r.erro) return enviar(jid, r.erro);
    if (r.enc_result) { await enviar(jid, r.msg); return enviar(jid, r.enc_result.msg_grupo); }
    return enviar(jid, r.msg);
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
    return aplicarDanoHabilidadeNaBatalha(from, jid, resultado);
  }

  if (cmd === 'ultimate') {
    const r = usarUltimate(from);
    if (r.erro) return enviar(jid, r.erro);
    return aplicarDanoHabilidadeNaBatalha(from, jid, r);
  }

  if (cmd === 'habilidadearma') {
    if (!resto) return enviar(jid, `❌ Use: /habilidadearma [nome]\nUse /minhaarma pra ver as técnicas da sua arma.`);
    const j_ha = db.getJogador(from); if (!j_ha) return enviar(jid, `❌ Sem personagem!`);
    const armaEx = HABILIDADES_ARMA_EXCLUSIVA[j_ha.arma];
    if (!armaEx) return enviar(jid, `❌ Sua arma equipada não tem técnicas especiais.`);
    const hab_key_arma = Object.keys(armaEx.habilidades).find(k =>
      k.toLowerCase().includes(normalizar(resto)) || armaEx.habilidades[k].nome.toLowerCase().includes(resto.toLowerCase())
    );
    if (!hab_key_arma) return enviar(jid, `❌ Técnica não encontrada! Use /minhaarma para ver a lista.`);
    const resultado_arma = usarHabilidadeArma(from, hab_key_arma);
    if (resultado_arma.erro) return enviar(jid, resultado_arma.erro);
    return aplicarDanoHabilidadeNaBatalha(from, jid, resultado_arma);
  }
  if (cmd === 'supremaarma') {
    const j_sa = db.getJogador(from); if (!j_sa) return enviar(jid, `❌ Sem personagem!`);
    const r_sa = usarSupremaArma(from);
    if (r_sa.erro) return enviar(jid, r_sa.erro);
    return aplicarDanoHabilidadeNaBatalha(from, jid, r_sa);
  }
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

  // ════════════════════════════════════════════════════════
  // ── MINIGAMES (categoria separada do RPG principal) ───────
  // ════════════════════════════════════════════════════════
  if (cmd === 'minigames') {
    return enviar(jid, bloco('𝐌𝐈𝐍𝐈𝐆𝐀𝐌𝐄𝐒 【🎮】', [
      '🎲 /dado [lados] — rolar um dado',
      '━━━━━━━━━━',
      '⭕ 1x1 (contra outro jogador):',
      '❌ /velha @jogador — jogo da velha',
      '━━━━━━━━━━',
      '🧠 Solo:',
      '🃏 /memoria — jogo da memória',
      '🪢 /forca — forca',
      '🎰 /caçaniquel [aposta] — caça-níquel',
      '✂️ /ppt [pedra/papel/tesoura] — vs bot',
      '🔢 /adivinhar — adivinhe o número',
      '━━━━━━━━━━',
      '🪙 /caracoroa @jogador [cara/coroa] [aposta]',
      '━━━━━━━━━━',
      '🏅 /rankminigames — ranking de pontos',
      '',
      '_Os pontos daqui são só pra ranking_',
      '_de minigame — não viram Belarium e_',
      '_não afetam seu personagem no RPG!_',
      '━━━━━━━━━━',
      '_Mais minigames chegando toda semana!_'
    ]));
  }

  // ── JOGO DA VELHA (1x1) ────────────────────────────────────
  if (cmd === 'velha') {
    const alvo_velha = extrairMencao(resto, msg);
    if (!alvo_velha) return enviar(jid, `❌ Use: /velha @jogador`);
    if (alvo_velha === from) return enviar(jid, `❌ Você não pode desafiar a si mesmo!`);
    if (velhaAtiva.has(from) || velhaAtiva.has(alvo_velha)) return enviar(jid, `❌ Um dos dois já está em uma partida!`);
    convitesVelha.set(alvo_velha, { desafiante_id: from, criado_em: Date.now() });
    return enviar(jid, `❌⭕ *DESAFIO DE JOGO DA VELHA!*\n\nVocê foi desafiado para o jogo da velha!\nUse /aceitarvelha para aceitar.`, [alvo_velha]);
  }

  if (cmd === 'aceitarvelha') {
    const convite_velha = convitesVelha.get(from);
    if (!convite_velha) return enviar(jid, `❌ Você não tem nenhum desafio de jogo da velha pendente!`);
    convitesVelha.delete(from);
    const jogo_velha = novoJogoVelha(convite_velha.desafiante_id, from);
    velhaAtiva.set(convite_velha.desafiante_id, jogo_velha);
    velhaAtiva.set(from, jogo_velha);
    return enviar(jid,
      `❌⭕ *JOGO DA VELHA COMEÇOU!*\n\n${tabuleiroVelhaTexto(jogo_velha)}\n\n_Vez de:_ ❌\nUse /jogar [posição 1-9] na sua vez.`,
      [convite_velha.desafiante_id, from]
    );
  }

  if (cmd === 'jogar') {
    if (!velhaAtiva.has(from)) return enviar(jid, `❌ Você não está em nenhuma partida! Use /velha @jogador para desafiar alguém.`);
    const jogo_velha_atual = velhaAtiva.get(from);
    const posicao = parseInt(resto);
    const r_velha = jogarVelha(jogo_velha_atual, from, posicao);
    if (r_velha.erro) return enviar(jid, r_velha.erro);

    const { X, O } = jogo_velha_atual.jogadores;
    if (r_velha.resultado) {
      velhaAtiva.delete(X);
      velhaAtiva.delete(O);
      const jx = db.getJogador(X), jo = db.getJogador(O);
      let texto_fim;
      if (r_velha.resultado === 'empate') {
        texto_fim = `❌⭕ *EMPATE!*\n\n${tabuleiroVelhaTexto(jogo_velha_atual)}\n\n_Ninguém venceu dessa vez._`;
      } else {
        const vencedor_id = r_velha.resultado === 'X' ? X : O;
        const vencedor_j = r_velha.resultado === 'X' ? jx : jo;
        const pts_velha = adicionarPontosMinigame(vencedor_id, 10);
        texto_fim = `❌⭕ *FIM DE JOGO!*\n\n${tabuleiroVelhaTexto(jogo_velha_atual)}\n\n🏆 *${vencedor_j?.nome || '???'} venceu!* +10 🏅 (total: ${pts_velha} pontos de minigame)`;
      }
      return enviar(jid, texto_fim, [X, O]);
    }

    const prox = jogo_velha_atual.vez === 'X' ? X : O;
    return enviar(jid, `❌⭕ *Jogada registrada!*\n\n${tabuleiroVelhaTexto(jogo_velha_atual)}\n\n_Vez de:_ ${jogo_velha_atual.vez === 'X' ? '❌' : '⭕'}`, [prox]);
  }

  // ── JOGO DA MEMÓRIA (solo) ─────────────────────────────────
  if (cmd === 'memoria') {
    const jogo_mem = novoJogoMemoria(6);
    memoriaAtiva.set(from, jogo_mem);
    return enviar(jid, `🃏 *JOGO DA MEMÓRIA!*\n\n${tabuleiroMemoriaTexto(jogo_mem)}\n\n_Use /virar [número] pra virar uma carta._`);
  }

  if (cmd === 'virar') {
    if (!memoriaAtiva.has(from)) return enviar(jid, `❌ Você não tem um jogo da memória ativo! Use /memoria pra começar.`);
    const jogo_mem_atual = memoriaAtiva.get(from);
    const pos_mem = parseInt(resto);
    const r_mem = virarCartaMemoria(jogo_mem_atual, pos_mem);
    if (r_mem.erro) return enviar(jid, r_mem.erro);

    if (r_mem.primeiraCartas) {
      return enviar(jid, `🃏 Carta virada!\n\n${tabuleiroMemoriaTexto(jogo_mem_atual)}\n\n_Vire outra carta._`);
    }
    if (r_mem.par) {
      if (r_mem.completo) {
        memoriaAtiva.delete(from);
        const pts_mem = adicionarPontosMinigame(from, 15);
        return enviar(jid, `🎉 *VOCÊ COMPLETOU O JOGO DA MEMÓRIA!*\n\n${tabuleiroMemoriaTexto(jogo_mem_atual, true)}\n\n✅ Tentativas: ${jogo_mem_atual.tentativas}\n🏅 +15 pontos de minigame (total: ${pts_mem})`);
      }
      return enviar(jid, `✅ *PAR ENCONTRADO!*\n\n${tabuleiroMemoriaTexto(jogo_mem_atual)}\n\n_Continue virando cartas._`);
    }
    return enviar(jid, `❌ Não é par (${r_mem.cartaAnterior} ≠ ${r_mem.cartaAtual})\n\n${tabuleiroMemoriaTexto(jogo_mem_atual)}\n\n_Tente de novo._`);
  }

  // ── FORCA (solo) ────────────────────────────────────────────
  if (cmd === 'forca') {
    const jogo_forca = novoJogoForca();
    forcaAtiva.set(from, jogo_forca);
    return enviar(jid, `🪢 *JOGO DA FORCA!*\n\n${palavraForcaTexto(jogo_forca)}\n\n${BONECO_FORCA[0]}\n_Use /letra [letra] pra tentar._`);
  }

  if (cmd === 'letra') {
    if (!forcaAtiva.has(from)) return enviar(jid, `❌ Você não tem um jogo de forca ativo! Use /forca pra começar.`);
    const jogo_forca_atual = forcaAtiva.get(from);
    const r_forca = chutarLetraForca(jogo_forca_atual, resto);
    if (r_forca.erro) return enviar(jid, r_forca.erro);

    if (r_forca.acertou) {
      if (r_forca.venceu) {
        forcaAtiva.delete(from);
        const pts_forca = adicionarPontosMinigame(from, 12);
        return enviar(jid, `🎉 *VOCÊ ACERTOU A PALAVRA!*\n\n${jogo_forca_atual.palavra}\n\n🏅 +12 pontos de minigame (total: ${pts_forca})`);
      }
      return enviar(jid, `✅ Letra certa!\n\n${palavraForcaTexto(jogo_forca_atual)}\n\n${BONECO_FORCA[jogo_forca_atual.erros]}`);
    }
    if (r_forca.perdeu) {
      forcaAtiva.delete(from);
      return enviar(jid, `💀 *VOCÊ PERDEU!*\n\nA palavra era: *${jogo_forca_atual.palavra}*\n\n${BONECO_FORCA[6]}`);
    }
    return enviar(jid, `❌ Letra errada!\n\n${palavraForcaTexto(jogo_forca_atual)}\n\n${BONECO_FORCA[jogo_forca_atual.erros]}\n_Letras erradas: ${jogo_forca_atual.letrasErradas.join(', ')}_`);
  }

  // ── CAÇA-NÍQUEL (solo — aposta é em pontos de minigame, não em Belarium) ──
  if (cmd === 'caçaniquel') {
    const j_slot = db.getJogador(from);
    if (!j_slot) return enviar(jid, `❌ Você não tem personagem!`);
    const aposta_slot = parseInt(resto) || 0;
    if (aposta_slot < 5) return enviar(jid, `❌ Aposta mínima: 5 pontos. Use: /caçaniquel [valor]`);
    if (getPontosMinigame(from) < aposta_slot) return enviar(jid, `❌ Você não tem pontos de minigame suficientes! Ganhe pontos jogando /velha, /memoria ou /forca.`);

    adicionarPontosMinigame(from, -aposta_slot);
    const r_slot = jogarCacaNiquel(aposta_slot);
    if (r_slot.ganho > 0) adicionarPontosMinigame(from, r_slot.ganho);

    return enviar(jid, `🎰 [ ${r_slot.resultado.join(' | ')} ]\n\n${r_slot.ganho > 0 ? `🎉 *Você ganhou ${r_slot.ganho} pontos!*` : '❌ *Não foi dessa vez...*'}\n🏅 Total: ${getPontosMinigame(from)} pontos`);
  }

  // ── PEDRA, PAPEL E TESOURA (solo vs bot) ────────────────────
  if (cmd === 'ppt') {
    if (!resto) return enviar(jid, `❌ Use: /ppt [pedra/papel/tesoura]`);
    const r_ppt = jogarPPT(resto);
    if (r_ppt.erro) return enviar(jid, r_ppt.erro);
    const emoji_ppt = { pedra: '🪨', papel: '📄', tesoura: '✂️' };
    const texto_resultado = r_ppt.resultado === 'empate' ? '🤝 *Empate!*' : r_ppt.resultado === 'vitoria' ? '🎉 *Você venceu!*' : '❌ *Você perdeu!*';
    if (r_ppt.resultado === 'vitoria') adicionarPontosMinigame(from, 5);
    return enviar(jid, `✂️ *PEDRA, PAPEL E TESOURA*\n\nVocê: ${emoji_ppt[r_ppt.escolhaJogador]}\nBot: ${emoji_ppt[r_ppt.escolhaBot]}\n\n${texto_resultado}`);
  }

  // ── ADIVINHAÇÃO DE NÚMERO (solo) ────────────────────────────
  if (cmd === 'adivinhar') {
    if (!adivinhacaoAtiva.has(from) && !resto) {
      const jogo_adv = novoJogoAdivinhacao(1, 100);
      adivinhacaoAtiva.set(from, jogo_adv);
      return enviar(jid, `🔢 *ADIVINHE O NÚMERO!*\n\nPensei em um número de 1 a 100.\nVocê tem 7 tentativas.\n\n_Use /adivinhar [número]._`);
    }
    if (!adivinhacaoAtiva.has(from)) {
      const jogo_adv = novoJogoAdivinhacao(1, 100);
      adivinhacaoAtiva.set(from, jogo_adv);
    }
    const jogo_adv_atual = adivinhacaoAtiva.get(from);
    const palpite = parseInt(resto);
    const r_adv = tentarAdivinhar(jogo_adv_atual, palpite);
    if (r_adv.erro) return enviar(jid, r_adv.erro);

    if (r_adv.acertou) {
      adivinhacaoAtiva.delete(from);
      const premio = Math.max(1, 10 - jogo_adv_atual.tentativas);
      const pts_adv = adicionarPontosMinigame(from, premio);
      return enviar(jid, `🎉 *VOCÊ ACERTOU!* O número era *${jogo_adv_atual.numero}*.\n\n✅ Tentativas: ${jogo_adv_atual.tentativas}\n🏅 +${premio} pontos (total: ${pts_adv})`);
    }
    if (r_adv.acabou) {
      adivinhacaoAtiva.delete(from);
      return enviar(jid, `💀 *SUAS TENTATIVAS ACABARAM!*\n\nO número era *${jogo_adv_atual.numero}*.\n_Tente de novo com /adivinhar._`);
    }
    return enviar(jid, `🔢 O número é *${r_adv.dica}* que ${palpite}!\n\n_Tentativas restantes: ${jogo_adv_atual.max_tentativas - jogo_adv_atual.tentativas}_`);
  }

  // ── CARA OU COROA (1x1 — aposta em pontos de minigame) ──────
  if (cmd === 'caracoroa') {
    const alvo_cc = extrairMencao(resto, msg);
    if (!alvo_cc) return enviar(jid, `❌ Use: /caracoroa @jogador [cara/coroa] [aposta]`);
    const partes_cc = resto.replace(/@\d+/, '').trim().split(/\s+/);
    const chamada_cc = (partes_cc[0] || '').toLowerCase();
    const aposta_cc = parseInt(partes_cc[1]) || 0;
    if (chamada_cc !== 'cara' && chamada_cc !== 'coroa') return enviar(jid, `❌ Use: /caracoroa @jogador [cara/coroa] [aposta]`);
    if (alvo_cc === from) return enviar(jid, `❌ Você não pode apostar contra si mesmo!`);

    const j_cc = db.getJogador(from);
    const alvo_j_cc = db.getJogador(alvo_cc);
    if (!j_cc || !alvo_j_cc) return enviar(jid, `❌ Um dos jogadores não tem personagem!`);
    if (aposta_cc > 0 && (getPontosMinigame(from) < aposta_cc || getPontosMinigame(alvo_cc) < aposta_cc)) {
      return enviar(jid, `❌ Um dos dois não tem pontos de minigame suficientes pra essa aposta!`);
    }

    const r_cc = jogarCaraCoroa(chamada_cc);
    let texto_cc = `🪙 *CARA OU COROA!*\n\n${j_cc.nome} chamou: *${chamada_cc}*\nResultado: *${r_cc.resultado}* ${r_cc.resultado === 'cara' ? '👑' : '🔵'}\n\n`;
    if (r_cc.acertou && aposta_cc > 0) {
      adicionarPontosMinigame(from, aposta_cc);
      adicionarPontosMinigame(alvo_cc, -aposta_cc);
      texto_cc += `🎉 *${j_cc.nome} venceu!* +${aposta_cc} pontos`;
    } else if (!r_cc.acertou && aposta_cc > 0) {
      adicionarPontosMinigame(from, -aposta_cc);
      adicionarPontosMinigame(alvo_cc, aposta_cc);
      texto_cc += `🎉 *${alvo_j_cc.nome} venceu!* +${aposta_cc} pontos`;
    } else {
      texto_cc += r_cc.acertou ? `🎉 *${j_cc.nome} acertou!*` : `❌ *${j_cc.nome} errou!*`;
    }
    return enviar(jid, texto_cc, [from, alvo_cc]);
  }

  // ── RANKING DOS MINIGAMES ────────────────────────────────────
  if (cmd === 'rankminigames') return enviar(jid, rankingMinigamesTexto());

  // ── EVENTO ALEATÓRIO ─────────────────────────────────────────
  if (cmd === 'participarevento') {
    const r_evt = participarEventoAleatorio(from);
    if (r_evt.erro) return enviar(jid, r_evt.erro);
    return enviar(jid, r_evt.msg);
  }
  if (cmd === 'eventoaleatorio') return enviar(jid, statusEventoAleatorio());



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

    const resultado_viagem = viajar(from, resto);
    if (typeof resultado_viagem === 'string' && !resultado_viagem.includes('❌')) {
      progredirMissao(from, 'viajar');
    }
    return enviar(jid, resultado_viagem);
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
      const linhas = ITENS_LOJA.filter(i => IDS_POCOES.includes(i.id)).map(i => `${i.nome} — ${db.formatarPreco(i.preco)}`);
      return enviar(jid, bloco('𝐏𝐎𝐂̧𝐎̃𝐄𝐒 【🧪】', [...linhas, '', '💡 /comprar [nome]']));
    }
    if (sub.includes('especial')) {
      const linhas = ITENS_LOJA.filter(i => IDS_ESPECIAIS.includes(i.id)).map(i => `${i.nome} — ${db.formatarPreco(i.preco)}`);
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
      `  🥩 Carne Crua (#CCC) — ${db.formatarPreco(30)}`,
      `  🥩 Carne Fresca (#CCF) — ${db.formatarPreco(60)}`,
      `  🥩 Carne Assada (#CCA) — ${db.formatarPreco(80)}`,
      `  🥩 Carne Rara (#CCR) — ${db.formatarPreco(150)}`,
      `  🥩 Carne de Dragão (#CCD) — ${db.formatarPreco(400)}`,
      `  🥩 Carne Sagrada (#CCS) — ${db.formatarPreco(600)}`,
      '',
      '🍯 MÉIS E DOCES',
      `  🍯 Mel Simples (#CMS) — ${db.formatarPreco(50)}`,
      `  🍯 Mel Dourado (#CMD) — ${db.formatarPreco(500)}`,
      `  🍯 Mel Sagrado (#CMG) — ${db.formatarPreco(700)}`,
      `  🌟 Néctar dos Deuses (#CNE) — ${db.formatarPreco(900)}`,
      `  ✨ Ambrosia (#CAN) — ${db.formatarPreco(1200)}`,
      '',
      '🌿 ERVAS E ESSÊNCIAS',
      `  🌿 Erva do Bosque (#CEB) — ${db.formatarPreco(40)}`,
      `  🌿 Erva Ancestral (#CEA) — ${db.formatarPreco(120)}`,
      `  🌱 Raiz Ancestral (#CRA) — ${db.formatarPreco(200)}`,
      `  ✨ Essência Mágica (#CEM) — ${db.formatarPreco(500)}`,
      `  ✨ Essência Primordial (#CEP) — ${db.formatarPreco(1000)}`,
      '',
      '🍎 FRUTAS MÍTICAS',
      `  🫐 Baga Espiritual (#CFB) — ${db.formatarPreco(80)}`,
      `  🍑 Figo Sagrado (#CFF) — ${db.formatarPreco(500)}`,
      `  🍎 Romã do Hades (#CFR) — ${db.formatarPreco(700)}`,
      `  🍎 Maçã Dourada (#CFM) — ${db.formatarPreco(1000)}`,
      `  🌟 Fruto da Imortalidade (#CFI) — ${db.formatarPreco(1500)}`,
      '',
      '🌊 AQUÁTICOS',
      `  🌊 Alga Abissal (#CAL) — ${db.formatarPreco(150)}`,
      `  🪸 Coral Sagrado (#CCO) — ${db.formatarPreco(250)}`,
      `  🐟 Peixe Espectral (#CPE) — ${db.formatarPreco(180)}`,
      `  🐍 Escama de Leviatã (#CEL) — ${db.formatarPreco(700)}`,
      '',
      '💎 MINERAIS',
      `  💎 Pedra de Luz (#CPL) — ${db.formatarPreco(100)}`,
      `  🔷 Cristal de Gelo (#CCG) — ${db.formatarPreco(200)}`,
      `  ⭐ Minério Sagrado (#CMI) — ${db.formatarPreco(450)}`,
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
      '  ↳ /buscararma [nome/raridade] — Buscar',
      '',
      '🛡️ ARMADURAS',
      '  ↳ /armaduras — Ver todas',
      '',
      '🧪 ITENS',
      '  ↳ /itens pocoes',
      '  ↳ /itens especiais',
      '',
      '🥚 OVOS',
      '  ↳ /ovos',
      '',
      '🥩 COMIDA',
      '  ↳ /comida',
      '━━━━━━━━━━',
      '🛒 /comprar [nome exato] — Comprar qualquer item'
    ]));
  }
  if (cmd === 'lojapets') return enviar(jid, verLojaOvos());
  // ── CHAMAR AMIGO PARA AJUDAR NA BATALHA (co-op) ─────────────
  if (cmd === 'chamarajuda') {
    if (!batalhaAtiva.has(from)) return enviar(jid, `❌ Você precisa estar em batalha pra chamar ajuda! Use /batalha ou /boss.`);
    const amigo_id = extrairMencao(resto, msg);
    if (!amigo_id) return enviar(jid, `❌ Use: /chamarajuda @amigo`);
    if (amigo_id === from) return enviar(jid, `❌ Você não pode chamar a si mesmo!`);
    const j_amigo = db.getJogador(amigo_id);
    if (!j_amigo) return enviar(jid, `❌ Esse jogador ainda não tem personagem.`);
    if (j_amigo.morto) return enviar(jid, `❌ ${j_amigo.nome} está morto e não pode ajudar agora.`);
    if (batalhaAtiva.has(amigo_id)) return enviar(jid, `❌ ${j_amigo.nome} já está em outra batalha.`);

    convitesCoop.set(amigo_id, { convidante_id: from, expira: Date.now() + 2 * 60 * 1000 });
    const batalha_atual = batalhaAtiva.get(from);
    return enviar(jid, bloco('🤝 PEDIDO DE AJUDA 【🤝】', [
      `*${j_amigo.nome}*, você foi chamado para ajudar contra:`,
      `${batalha_atual.tipo === 'boss' ? '👑' : '⚔️'} *${batalha_atual.monstro_nome}*`,
      `❤️ HP: ${batalha_atual.monstro_hp}/${batalha_atual.monstro_hp_max}`,
      '━━━━━━━━━━',
      '📝 Use */ajudar* para entrar na luta! (expira em 2 min)'
    ]), [amigo_id]);
  }

  if (cmd === 'ajudar') {
    const convite = convitesCoop.get(from);
    if (!convite) return enviar(jid, `❌ Ninguém te chamou pra ajudar em batalha nenhuma agora.`);
    if (Date.now() > convite.expira) { convitesCoop.delete(from); return enviar(jid, `❌ O convite expirou.`); }
    if (batalhaAtiva.has(from)) return enviar(jid, `❌ Você já está em batalha!`);
    const batalha_alvo = batalhaAtiva.get(convite.convidante_id);
    if (!batalha_alvo) { convitesCoop.delete(from); return enviar(jid, `❌ Essa batalha já acabou.`); }

    const j_ajuda = db.getJogador(from);
    if (!j_ajuda) return enviar(jid, `❌ Você não tem personagem!`);
    if (j_ajuda.morto) return enviar(jid, `❌ Você está morto e não pode entrar em batalha.`);

    if (!batalha_alvo.participantes) batalha_alvo.participantes = [convite.convidante_id];
    if (!batalha_alvo.participantes.includes(from)) batalha_alvo.participantes.push(from);
    batalhaAtiva.set(from, batalha_alvo); // mesma referência: HP do monstro é compartilhado
    convitesCoop.delete(from);

    return enviar(jid, bloco('⚔️ REFORÇOS CHEGARAM! 【⚔️】', [
      `*${j_ajuda.nome}* entrou na batalha!`,
      `${batalha_alvo.tipo === 'boss' ? '👑' : '⚔️'} *${batalha_alvo.monstro_nome}*`,
      `❤️ HP: ${batalha_alvo.monstro_hp}/${batalha_alvo.monstro_hp_max}`,
      '━━━━━━━━━━',
      'Use /matar ou /habilidade pra atacar junto!'
    ]));
  }

  if (cmd === 'negociar') {
    const merc = mercadorAtivo.get(from);
    if (!merc) return enviar(jid, `❌ Não há nenhum ambulante por perto agora. Ele pode aparecer aleatoriamente em /batalha.`);
    if (Date.now() > merc.expira) { mercadorAtivo.delete(from); return enviar(jid, `❌ O ambulante já foi embora...`); }
    const num = parseInt(resto);
    if (isNaN(num) || num < 1 || num > merc.ofertas.length) return enviar(jid, `❌ Use: /negociar [1-${merc.ofertas.length}]`);
    const oferta = merc.ofertas[num - 1];
    const j_neg = db.getJogador(from);
    if (!j_neg) return enviar(jid, `❌ Você não tem personagem!`);
    if (j_neg.moedas < oferta.preco) return enviar(jid, `❌ Belarium insuficiente! Você tem ${db.formatarBelarium(j_neg)}, precisa de ${db.formatarPreco(oferta.preco)}.`);
    j_neg.moedas -= oferta.preco;
    if (!j_neg.inventario) j_neg.inventario = [];
    j_neg.inventario.push(oferta.id);
    db.salvarJogador(from, j_neg);
    mercadorAtivo.delete(from);
    return enviar(jid, bloco('🧳 NEGÓCIO FECHADO 【✅】', [
      `Você comprou *${oferta.nome}* por ${db.formatarPreco(oferta.preco)}!`,
      '_"Um prazer fazer negócios. Até a próxima!"_',
      `💰 Belarium: ${db.formatarBelarium(j_neg)}`
    ]));
  }
  if (cmd === 'irembora') {
    if (!mercadorAtivo.has(from)) return enviar(jid, `❌ Não há nada acontecendo agora.`);
    mercadorAtivo.delete(from);
    return enviar(jid, `🚶 Você recusa a oferta e segue seu caminho.`);
  }

  if (cmd === 'comprar') {
    if (!resto) return enviar(jid, `❌ Use: /comprar [item]`);
    const nome_norm = normalizar(resto);
    const nome_norm_prefixado = normalizar(`ovo ${resto}`);
    const eh_ovo = Object.keys(OVOS).some(k => normalizar(k) === nome_norm || normalizar(k) === nome_norm_prefixado);
    if (eh_ovo) return enviar(jid, comprarOvo(from, resto));
    return enviar(jid, comprarItem(from, resto));
  }
  if (cmd === 'usar') {
    if (!resto) return enviar(jid, `❌ Use: /usar [item]`);
    const j_usar = db.getJogador(from);
    if (j_usar && j_usar.inventario) {
      const buscaN = normalizar(resto);
      const idxDeus = j_usar.inventario.findIndex(id => {
        const it = ITENS_LOJA.find(x => x.id === id);
        return it && it.efeito === 'dano_deus' && (id.toLowerCase().includes(buscaN) || it.nome.toLowerCase().includes(resto.toLowerCase()));
      });
      if (idxDeus !== -1) {
        const itemDeus = ITENS_LOJA.find(x => x.id === j_usar.inventario[idxDeus]);
        if (!batalhaAtiva.has(from)) return enviar(jid, `🌍 *${itemDeus.nome}* só tem efeito durante uma batalha ativa!`);
        j_usar.inventario.splice(idxDeus, 1);
        db.salvarJogador(from, j_usar);
        return aplicarDanoHabilidadeNaBatalha(from, jid, {
          dano: itemDeus.valor,
          logs: [`🌍 *${itemDeus.nome}* usada!`, `💥 Poder divino: *${itemDeus.valor}* de dano!`]
        });
      }
    }
    return enviar(jid, usarItem(from, resto));
  }
  if (cmd === 'equipar') { if (!resto) return enviar(jid, `❌ Use: /equipar [arma]`); return enviar(jid, equiparArma(from, resto)); }
  if (cmd === 'equiparmadura') { if (!resto) return enviar(jid, `❌ Use: /equiparmadura [armadura]`); return enviar(jid, equiparArmadura(from, resto)); }
  if (cmd === 'vender') { if (!resto) return enviar(jid, `❌ Use: /vender [item]`); return enviar(jid, venderItem(from, resto)); }
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

  if (cmd === 'receitas') {
    return enviar(jid, bloco('𝐑𝐄𝐂𝐄𝐈𝐓𝐀𝐒 𝐃𝐄 𝐂𝐑𝐀𝐅𝐓 【🔧】', [
      '_Materiais caem dos inimigos em /batalha (chance de drop)._',
      '━━━━━━━━━━',
      ...verReceitas(),
      '━━━━━━━━━━',
      '📝 */craft [receita]* — Craftar'
    ]));
  }

  if (cmd === 'craft') {
    const r_craft = craftar(from, resto);
    if (r_craft.erro) return enviar(jid, r_craft.erro);
    return enviar(jid, r_craft.msg);
  }

  if (cmd === 'reforjar') {
    if (!resto) return enviar(jid, `❌ Use: /reforjar [nome do item]`);
    return enviar(jid, reforjar(from, resto));
  }

  if (cmd === 'sucatear') {
    if (!resto) return enviar(jid, `❌ Use: /sucatear [nome do item]`);
    return enviar(jid, sucatear(from, resto));
  }

  if (cmd === 'duelo') {
    const alvo_duelo = extrairMencao(resto, msg);
    if (!alvo_duelo) return enviar(jid, `❌ Use: /duelo @jogador [aposta opcional]`);
    const partes_duelo = resto.replace(/@\d+/, '').trim().split(/\s+/);
    const aposta = parseInt(partes_duelo[0]) || 0;
    const r_duelo = duelo(from, alvo_duelo, aposta);
    if (r_duelo.erro) return enviar(jid, r_duelo.erro);
    return enviar(jid, r_duelo.logs.join('\n'), [alvo_duelo]);
  }

  if (cmd === 'guerraguilda') {
    const alvo_guerra = extrairMencao(resto, msg);
    if (!alvo_guerra) return enviar(jid, `❌ Use: /guerraguilda @alguém da guilda rival`);
    return enviar(jid, guerraGuilda(from, alvo_guerra));
  }

  if (cmd === 'podio') return enviar(jid, verPodio());

  if (cmd === 'talentos') {
    if (!resto) return enviar(jid, verTalentos(from));
    return enviar(jid, investirTalento(from, resto));
  }

  if (cmd === 'prestigio') return enviar(jid, prestigiar(from));

  if (cmd === 'petbatalha') {
    const alvo_pet = extrairMencao(resto, msg);
    if (!alvo_pet) return enviar(jid, `❌ Use: /petbatalha @jogador`);
    return enviar(jid, petBatalha(from, alvo_pet));
  }

  if (cmd === 'leilao') {
    const sub = (args[0] || '').toLowerCase();
    if (!sub || sub === 'ver' || sub === 'listar') return enviar(jid, verLeiloes());
    if (sub === 'criar') {
      const precoStr = args[args.length - 1];
      const preco = parseInt(precoStr);
      const nomeItem = args.slice(1, isNaN(preco) ? args.length : args.length - 1).join(' ');
      if (!nomeItem || isNaN(preco)) return enviar(jid, `❌ Use: /leilao criar [item] [preço]`);
      return enviar(jid, criarLeilao(from, nomeItem, preco));
    }
    if (sub === 'comprar') return enviar(jid, comprarLeilao(from, args[1]));
    if (sub === 'cancelar') return enviar(jid, cancelarLeilao(from, args[1]));
    return enviar(jid, `❌ Use: /leilao [ver|criar|comprar|cancelar]`);
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
      checarTituloImperador(from);
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
  if (cmd === 'moneyrank') return enviar(jid, verRankingMoedas());
  if (cmd === 'xprank') return enviar(jid, verRankingXP());
  if (cmd === 'killrank') return enviar(jid, verRankingKills());
  if (cmd === 'rankpet') return enviar(jid, verRankingPets());
  if (cmd === 'conquistas') return enviar(jid, verConquistas(from));
  if (cmd === 'topconquistas') return enviar(jid, verRankingConquistas());
  if (cmd === 'titulos') return enviar(jid, verTitulos(from));
  if (cmd === 'todostitulos') return enviar(jid, verTitulosDisponiveis(from));
  if (cmd === 'usartitulo') { if (!resto) return enviar(jid, `❌ Use: /usartitulo [nome do título]`); return enviar(jid, usarTitulo(from, resto)); }
  if (cmd === 'missoes') return enviar(jid, verMissoes(from));
  if (cmd === 'coletarmissao') { if (!resto) return enviar(jid, `❌ Use: /coletarmissao [nome/id da missão]`); return enviar(jid, coletarMissao(from, resto)); }

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

  // ── BLOQUEAR BANIDOS ─────────────────────────────────────
  if (!isDono(from)) {
    const j_ban_check = db.getJogador(from);
    if (j_ban_check && j_ban_check.banido) {
      return enviar(jid, bloco('⛔ VOCÊ ESTÁ BANIDO 【⛔】', [
        `📝 Motivo: _${j_ban_check.motivo_ban || 'Sem motivo especificado'}_`,
        '━━━━━━━━━━',
        '_Fale com o Deus se acha que isso é um engano._'
      ]));
    }
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
      'regras','dono','ajuda','infoarmas','infoarma','murageral','ranking','statusevento',
      'meuid','ping','revivernpc','banir','desbanir','setnivel','curartudo',
      'resetcd','dartitulo','givedangerarmor','givenakanoarmor','giveescarlatearmor','givealabardaarmor','removeritem','daradm','removeradm','listaadm','definirgrupoiniciante','removergrupoiniciante','verperfil'];
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

  if (cmd === 'definirgrupoiniciante') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode definir o grupo de iniciantes.`);
    db.setConfig('grupo_iniciantes', jid);
    return enviar(jid, `✅ Esse grupo agora é o *grupo de iniciantes*!\n\nO bot vai responder qualquer mensagem aqui pra ajudar quem tá começando, sem precisar mencionar "Imperius".`);
  }
  if (cmd === 'removergrupoiniciante') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode remover essa configuração.`);
    db.setConfig('grupo_iniciantes', null);
    return enviar(jid, `✅ Esse grupo não é mais o grupo de iniciantes.`);
  }

  if (cmd === 'aceitardeus') { const r = aceitarEventoDeus(from, jid); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo); }
  if (cmd === 'ignorardeus') { const r = ignorarDeus(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo); }
  if (cmd === 'deusdescansar') { const r = deusDescansar(from, jid); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg_grupo); }

  // ── REVIVER NPC / JOGADOR (poder do Deus, ou de um ADM autorizado) ──
  if (cmd === 'revivernpc') {
    if (!isDono(from) && !isADM(from)) return enviar(jid, `❌ Apenas o Deus ou um ADM autorizado pode reviver alguém assim.`);
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /revivernpc @jogador`);
    const j_rev = db.getJogador(alvo_id);
    if (!j_rev) return enviar(jid, `❌ Jogador não encontrado!`);
    j_rev.morto = false;
    j_rev.hp = j_rev.hp_max;
    j_rev.mana = j_rev.mana_max || j_rev.mana;
    db.salvarJogador(alvo_id, j_rev);
    return enviar(jid, bloco('☠️ RESSURREIÇÃO DIVINA 【✨】', [
      `*${j_rev.nome}* foi trazido de volta à vida pelo Deus!`,
      '━━━━━━━━━━',
      `❤️ HP: ${j_rev.hp}/${j_rev.hp_max}`,
      `💧 Mana: ${j_rev.mana}`,
      '_"Levante-se. Ainda não terminei com você."_'
    ]), [alvo_id]);
  }

  // ── BANIR / DESBANIR (poder do Deus) ───────────────────────
  if (cmd === 'banir') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /banir @jogador [motivo]`);
    const j_ban = db.getJogador(alvo_id);
    if (!j_ban) return enviar(jid, `❌ Jogador não encontrado!`);
    const motivo = args.slice(1).join(' ') || 'Sem motivo especificado';
    j_ban.banido = true;
    j_ban.motivo_ban = motivo;
    db.salvarJogador(alvo_id, j_ban);
    return enviar(jid, bloco('⛔ BANIDO PELO DEUS 【⛔】', [
      `*${j_ban.nome}* foi banido do IMPERIUS.`,
      `📝 Motivo: _${motivo}_`
    ]), [alvo_id]);
  }
  if (cmd === 'desbanir') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /desbanir @jogador`);
    const j_deb = db.getJogador(alvo_id);
    if (!j_deb) return enviar(jid, `❌ Jogador não encontrado!`);
    j_deb.banido = false;
    j_deb.motivo_ban = null;
    db.salvarJogador(alvo_id, j_deb);
    return enviar(jid, bloco('✅ PERDÃO DIVINO 【✅】', [`*${j_deb.nome}* foi desbanido e pode voltar a jogar.`]), [alvo_id]);
  }

  // ── SETAR NÍVEL (poder do Deus) ─────────────────────────────
  if (cmd === 'setnivel') {
    const alvo_id = extrairMencao(resto, msg);
    const nivel_alvo = parseInt(args[1]);
    if (!alvo_id || isNaN(nivel_alvo) || nivel_alvo < 1 || nivel_alvo > 200) return enviar(jid, `❌ Use: /setnivel @jogador [1-200]`);
    const j_niv = db.getJogador(alvo_id);
    if (!j_niv) return enviar(jid, `❌ Jogador não encontrado!`);

    const classeBase = CLASSES[j_niv.classe] || { hp: 100, mana: 50, for: 10, con: 10 };
    const niveis_ganhos = nivel_alvo - 1;
    j_niv.nivel = nivel_alvo;
    j_niv.xp = 0;
    j_niv.xp_proximo = db.calcularXPProximo(nivel_alvo);
    j_niv.rank = db.getRank(nivel_alvo);
    j_niv.hp_max = classeBase.hp + niveis_ganhos * 10;
    j_niv.hp = j_niv.hp_max;
    j_niv.mana_max = classeBase.mana + niveis_ganhos * 5;
    j_niv.mana = j_niv.mana_max;
    j_niv.for = classeBase.for + niveis_ganhos;
    j_niv.con = classeBase.con + niveis_ganhos;
    if (nivel_alvo >= 200) { j_niv.imperador = true; db.adicionarTitulo(alvo_id, 'imperador'); }
    db.salvarJogador(alvo_id, j_niv);
    return enviar(jid, bloco('⭐ NÍVEL ALTERADO 【⭐】', [
      `*${j_niv.nome}* agora está no nível *${nivel_alvo}*!`,
      `❤️ HP: ${j_niv.hp_max} | 💧 Mana: ${j_niv.mana_max} | 🏅 Rank: ${j_niv.rank}`
    ]), [alvo_id]);
  }

  // ── CURAR TOTALMENTE (poder do Deus) ────────────────────────
  if (cmd === 'curartudo') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /curartudo @jogador`);
    const j_cur = db.getJogador(alvo_id);
    if (!j_cur) return enviar(jid, `❌ Jogador não encontrado!`);
    j_cur.hp = j_cur.hp_max;
    j_cur.mana = j_cur.mana_max || j_cur.mana;
    j_cur.status_negativos = [];
    db.salvarJogador(alvo_id, j_cur);
    return enviar(jid, bloco('💚 CURA DIVINA 【💚】', [`*${j_cur.nome}* foi completamente curado e purificado!`]), [alvo_id]);
  }

  // ── RESETAR COOLDOWNS (poder do Deus) ───────────────────────
  if (cmd === 'resetcd') {
    const alvo_id = extrairMencao(resto, msg) || from;
    const j_cd = db.getJogador(alvo_id);
    if (!j_cd) return enviar(jid, `❌ Jogador não encontrado!`);
    j_cd.cooldown_batalha = 0;
    j_cd.cooldown_masmorra = 0;
    j_cd.cooldown_ultimate = {};
    db.salvarJogador(alvo_id, j_cd);
    return enviar(jid, bloco('⏳ COOLDOWNS RESETADOS 【⏳】', [`*${j_cd.nome}* pode agir livremente novamente.`]), [alvo_id]);
  }

  // ── DAR TÍTULO (poder do Deus — para títulos narrativos) ────
  if (cmd === 'dartitulo') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /dartitulo @jogador [título]`);
    const busca_tit = normalizar(args.slice(1).join(' '));
    if (!busca_tit) return enviar(jid, `❌ Informe o título! Ex: /dartitulo @jogador servo`);
    const key_tit = Object.keys(TITULOS).find(k => normalizar(k).includes(busca_tit) || normalizar(TITULOS[k]).includes(busca_tit));
    if (!key_tit) return enviar(jid, `❌ Título não encontrado. Títulos disponíveis:\n${Object.values(TITULOS).join('\n')}`);
    const j_tit = db.getJogador(alvo_id);
    if (!j_tit) return enviar(jid, `❌ Jogador não encontrado!`);
    db.adicionarTitulo(alvo_id, key_tit);
    return enviar(jid, bloco('🏷️ TÍTULO CONCEDIDO 【🏷️】', [
      `*${j_tit.nome}* recebeu o título:`,
      `${TITULOS[key_tit]}`,
      '━━━━━━━━━━',
      `_Use /usartitulo para equipar._`
    ]), [alvo_id]);
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
  if (cmd === 'removeritem') { if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode confiscar itens.`); const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Use: /removeritem @jogador [nome do item/arma/armadura]`); const item = args.slice(1).join(' '); const r = removerItem(a, item); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg, [a]); }
  if (cmd === 'daradm') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode conceder ADM.`);
    const a = extrairMencao(resto, msg);
    if (!a) return enviar(jid, `❌ Use: /darADM @jogador`);
    const r = darADM(a);
    if (r.erro) return enviar(jid, r.erro);
    const j_novo_adm = db.getJogador(a);
    return enviar(jid, bloco('⚖️ NOVO ADM NOMEADO 【⚖️】', [
      `👑 O Deus escolheu *${j_novo_adm?.nome || '???'}* para servir como ADM!`,
      '━━━━━━━━━━',
      '🕊️ Responsável por reviver jogadores',
      '   caídos em batalha (/revivernpc)',
      '━━━━━━━━━━',
      '_"Que sirva bem, ou que caia em desgraça."_'
    ]), [a]);
  }
  if (cmd === 'removeradm') { if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode tirar ADM.`); const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Use: /removerADM @jogador`); const r = removerADM(a); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg, [a]); }
  if (cmd === 'listaadm') {
    const lista_adm = listarADMs();
    if (lista_adm.length === 0) return enviar(jid, `📭 Nenhum ADM nomeado ainda.`);
    const nomes_adm = lista_adm.map(id => db.getJogador(id)?.nome || '???').join('\n');
    return enviar(jid, bloco('⚖️ ADMS AUTORIZADOS 【⚖️】', [nomes_adm]));
  }

  if (cmd === 'verperfil') {
    const alvo_perfil = extrairMencao(resto, msg);
    if (!alvo_perfil) return enviar(jid, `❌ Use: /verperfil @jogador`);
    const jp = db.getJogador(alvo_perfil);
    if (!jp) return enviar(jid, `❌ Esse jogador não tem personagem!`);
    const nivel_p = jp.nivel || 1;
    const xp_p = jp.xp || 0;
    const xp_prox_p = jp.xp_proximo || 100;
    const xp_pct_p = Math.floor((xp_p / xp_prox_p) * 10);
    const barra_xp_p = '█'.repeat(xp_pct_p) + '░'.repeat(10 - xp_pct_p);
    const hp_pct_p = Math.floor((jp.hp / jp.hp_max) * 10);
    const barra_hp_p = '█'.repeat(hp_pct_p) + '░'.repeat(10 - hp_pct_p);
    const mana_pct_p = Math.floor((jp.mana / jp.mana_max) * 10);
    const barra_mana_p = '█'.repeat(mana_pct_p) + '░'.repeat(10 - mana_pct_p);
    const arma_p = ARMAS.find(a => a.id === jp.arma);
    const armadura_p = ARMADURAS.find(a => a.id === jp.armadura);
    const regiaoData_p = REGIOES[jp.regiao];
    const guilda_p = jp.guilda_id ? db.getGuilda(jp.guilda_id) : null;
    const nomePet_p = !jp.pet
      ? (jp.tem_dragao ? '🐉 Dragão (Dragomante)' : 'Nenhum')
      : (jp.pet.nome_dado && jp.pet.nome_dado.trim() ? `${jp.pet.especie} (${jp.pet.nome_dado})` : (jp.pet.especie || jp.pet.nome || 'Pet sem nome'));

    return enviar(jid, bloco('𝐏𝐄𝐑𝐅𝐈𝐋 【👤】', [
        `👤 ${jp.nome} ${jp.imperador ? '👑' : ''}`,
        `🏷️ ${jp.titulo_ativo || 'Sem título'}`,
        `🎭 ${CLASSES[jp.classe]?.nome || jp.classe}`,
        `⭐ Nível: ${nivel_p} | Rank: ${jp.rank || 'F'}`,
        `📊 XP: ${xp_p}/${xp_prox_p}`,
        `[${barra_xp_p}]`,
        '━━━━━━━━━━',
        `❤️ HP: ${jp.hp}/${jp.hp_max}`,
        `[${barra_hp_p}]`,
        `💧 Mana: ${jp.mana}/${jp.mana_max}`,
        `[${barra_mana_p}]`,
        '━━━━━━━━━━',
        `💪 FOR: ${jp.for} | 🐆 DES: ${jp.des}`,
        `🛡️ CON: ${jp.con} | 🧠 INT: ${jp.int}`,
        '━━━━━━━━━━',
        `⚔️ ${arma_p ? arma_p.nome : 'Sem arma'}`,
        `🛡️ ${armadura_p ? armadura_p.nome : 'Sem armadura'}`,
        `🐾 Pet: ${nomePet_p}`,
        '━━━━━━━━━━',
        `🗺️ ${regiaoData_p?.nome || jp.regiao} | 💰 ${db.formatarBelarium(jp)}`,
        `🏛️ Guilda: ${guilda_p?.nome || 'Nenhuma'}`,
        `💀 Kills: ${jp.kills} | Mortes: ${jp.mortes}`,
        `${jp.morto ? '💀 MORTO' : '✅ VIVO'}`
      ]), [alvo_perfil]);
  }

  // ── DAR AS ARMAS EXCLUSIVAS DO MURAL (só o Deus pode usar) ──
  if (cmd === 'givedangerarmor') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode dar essa arma.`);
    const alvo_danger = extrairMencao(resto, msg);
    if (!alvo_danger) return enviar(jid, `❌ Use: /givedangerarmor @Danger`);
    const r_danger = darItem(alvo_danger, 'Akaketsu no Enma');
    if (r_danger.erro) return enviar(jid, r_danger.erro);
    const eq_danger = equiparArma(alvo_danger, 'Akaketsu no Enma');
    return enviar(jid, bloco('☠️ AKAKETSU NO ENMA ENTREGUE 【☠️】', [
      '_A katana do sangue carmesim escolheu seu portador._',
      eq_danger
    ]), [alvo_danger]);
  }
  if (cmd === 'givenakanoarmor') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode dar essa arma.`);
    const alvo_nakano = extrairMencao(resto, msg);
    if (!alvo_nakano) return enviar(jid, `❌ Use: /givenakanoarmor @Nakano`);
    const r_nakano = darItem(alvo_nakano, 'Yomikagari');
    if (r_nakano.erro) return enviar(jid, r_nakano.erro);
    const eq_nakano = equiparArma(alvo_nakano, 'Yomikagari');
    return enviar(jid, bloco('☠️ YOMIKAGARI ENTREGUE 【☠️】', [
      '_A foice caçadora do Yomi escolheu seu portador._',
      eq_nakano
    ]), [alvo_nakano]);
  }
  if (cmd === 'giveescarlatearmor') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode dar essa arma.`);
    const alvo_escarlate = extrairMencao(resto, msg);
    if (!alvo_escarlate) return enviar(jid, `❌ Use: /giveescarlatearmor @Guirhz`);
    const r_escarlate = darItem(alvo_escarlate, 'Faca de Bolso Escarlate');
    if (r_escarlate.erro) return enviar(jid, r_escarlate.erro);
    const eq_escarlate = equiparArma(alvo_escarlate, 'Faca de Bolso Escarlate');
    return enviar(jid, bloco('🗡️ FACA DE BOLSO ESCARLATE ENTREGUE 【🗡️】', [
      '_A lâmina humilde escolheu seu portador._',
      eq_escarlate
    ]), [alvo_escarlate]);
  }
  if (cmd === 'givealabardaarmor') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode dar essa arma.`);
    const alvo_alabarda = extrairMencao(resto, msg);
    if (!alvo_alabarda) return enviar(jid, `❌ Use: /givealabardaarmor @pontificy`);
    const r_alabarda = darItem(alvo_alabarda, 'Alabarda do Rei');
    if (r_alabarda.erro) return enviar(jid, r_alabarda.erro);
    const eq_alabarda = equiparArma(alvo_alabarda, 'Alabarda do Rei');
    return enviar(jid, bloco('⚜️ ALABARDA DO REI ENTREGUE 【⚜️】', [
      '_O trono celestial reconheceu seu novo portador._',
      eq_alabarda
    ]), [alvo_alabarda]);
  }
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
    try {
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
    } catch (e) {
      console.error('Falha ao registrar /erro:', e);
      return enviar(jid, `⚠️ Não consegui registrar o erro agora, tenta de novo.`);
    }
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
    try {
      const ERROS_FILE = require('path').join(__dirname, 'erros.json');
      require('fs').writeFileSync(ERROS_FILE, '[]');
      return enviar(jid, `🧹 Lista de erros limpa!`);
    } catch (e) {
      console.error('Falha ao limpar erros:', e);
      return enviar(jid, `⚠️ Não consegui limpar a lista agora.`);
    }
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
      `💰 +${db.formatarPreco(moedas)}`,
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
// ── APLICA DANO DE HABILIDADE/ULTIMATE NA BATALHA ATIVA ────
// Antes, /habilidade e /ultimate calculavam um número de dano mas nunca
// aplicavam em lugar nenhum — o monstro nunca perdia HP de verdade.
// Processa os efeitos ativos no monstro (sangramento, lentidão, marca de Enma)
// que foram aplicados por habilidades de arma em turnos anteriores.
function tickEfeitosMonstro(batalha) {
  if (!batalha.efeitos_monstro) batalha.efeitos_monstro = [];
  let dano_extra = 0;
  let reducao_dano_monstro = 0;
  let pular_contra_ataque = false;
  const logs = [];
  const restantes = [];

  for (const ef of batalha.efeitos_monstro) {
    if (ef.tipo === 'sangramento') {
      const d = Math.max(1, Math.floor((batalha.monstro_hp_max || 100) * (ef.valor || 0.06)));
      dano_extra += d;
      logs.push(`🩸 Sangramento causa *${d}* de dano!`);
    } else if (ef.tipo === 'lentidao') {
      reducao_dano_monstro = Math.max(reducao_dano_monstro, ef.valor || 0);
    } else if (ef.tipo === 'paralisia') {
      pular_contra_ataque = true;
      logs.push(`⛓️ *${batalha.monstro_nome}* continua paralisado!`);
    } else if (ef.tipo === 'marca_enma' && ef.duracao <= 1) {
      dano_extra += ef.valor || 0;
      logs.push(`⚖️ A marca de Enma explode causando *${ef.valor}* de dano extra!`);
    }
    ef.duracao -= 1;
    if (ef.duracao > 0) restantes.push(ef);
  }

  batalha.efeitos_monstro = restantes;
  return { dano_extra, reducao_dano_monstro, pular_contra_ataque, logs };
}

async function aplicarDanoHabilidadeNaBatalha(from, jid, resultado) {
  const batalha = batalhaAtiva.get(from);
  const j0_efeito = db.getJogador(from);

  // Cura (ex: Coração da Carnificina) é aplicada mesmo sem dano na habilidade
  if (resultado.cura && j0_efeito) {
    j0_efeito.hp = Math.min(j0_efeito.hp_max, j0_efeito.hp + resultado.cura);
    db.salvarJogador(from, j0_efeito);
  }

  // Habilidades sem dano (buffs/curas) funcionam mesmo fora de batalha
  if (!resultado.dano || resultado.dano <= 0) {
    return enviar(jid, resultado.logs.join('\n'));
  }

  if (!batalha) {
    return enviar(jid, resultado.logs.join('\n') + `\n\n⚠️ _Você não está em batalha, o dano não teve efeito. Use /batalha ou /boss primeiro._`);
  }

  const j = db.getJogador(from);
  if (!j) return enviar(jid, resultado.logs.join('\n'));

  const isBoss = batalha.tipo === 'boss';

  // 1) Processa efeitos já ativos de turnos anteriores (sangramento/lentidão/marca)
  const tick = tickEfeitosMonstro(batalha);

  // 2) Execução (Eclipse da Existência): dano bônus se o monstro já estiver bem fraco
  let dano_final = resultado.dano;
  if (resultado.efeito?.tipo === 'execucao') {
    const pct_hp = batalha.monstro_hp / (batalha.monstro_hp_max || 1);
    if (pct_hp <= (resultado.efeito.valor || 0.3)) {
      dano_final = Math.floor(dano_final * 1.8);
      resultado.logs.push(`☠️ *EXECUÇÃO!* O monstro estava fraco — dano ampliado para *${dano_final}*!`);
    }
  }

  batalha.monstro_hp -= dano_final;
  batalha.monstro_hp -= tick.dano_extra;
  if (tick.logs.length) resultado.logs.push(...tick.logs);

  // 3) Drenagem (Eclipse Rubro): cura o jogador com base no dano causado agora
  if (resultado.efeito?.tipo === 'drenagem') {
    const cura_drenagem = Math.floor(dano_final * (resultado.efeito.valor || 0.4));
    j.hp = Math.min(j.hp_max, j.hp + cura_drenagem);
    resultado.logs.push(`🌑 Drenou *${cura_drenagem}* HP do inimigo!`);
  }

  // 4) Aplica o novo efeito (se persistente) pros próximos turnos
  if (resultado.efeito && ['sangramento', 'lentidao'].includes(resultado.efeito.tipo)) {
    batalha.efeitos_monstro = batalha.efeitos_monstro || [];
    batalha.efeitos_monstro.push({ ...resultado.efeito });
  }
  if (resultado.efeito?.tipo === 'paralisia' && (resultado.efeito.duracao || 1) > 1) {
    batalha.efeitos_monstro = batalha.efeitos_monstro || [];
    // -1 porque este turno já conta como o primeiro turno paralisado
    batalha.efeitos_monstro.push({ tipo: 'paralisia', duracao: resultado.efeito.duracao - 1 });
  }
  if (resultado.efeito?.tipo === 'marca_enma') {
    batalha.efeitos_monstro = batalha.efeitos_monstro || [];
    batalha.efeitos_monstro.push({ tipo: 'marca_enma', duracao: resultado.efeito.duracao || 2, valor: Math.floor(dano_final * 1.8) });
  }

  // Lentidão recém-aplicada também reduz o contra-ataque deste turno
  let reducao_dano_monstro = tick.reducao_dano_monstro;
  if (resultado.efeito?.tipo === 'lentidao') {
    reducao_dano_monstro = Math.max(reducao_dano_monstro, resultado.efeito.valor || 0);
  }

  if (batalha.monstro_hp <= 0) {
    batalhaAtiva.delete(from);
    j.kills = (j.kills || 0) + 1;

    let xp_ganho, moedas, drop_texto = null;
    if (isBoss) {
      xp_ganho = batalha.boss.xp;
      moedas = rand(batalha.boss.moedas[0], batalha.boss.moedas[1]);
      j.boss_mortos = [...(j.boss_mortos || []), batalha.boss.nome];
      if (batalha.boss.nome.toLowerCase().includes('drag')) db.adicionarTitulo(from, 'matador_dragao');
      if (batalha.boss.drop_arma && ARMAS_PRIMORDIAIS.length > 0) {
        const armaDrop = ARMAS_PRIMORDIAIS[Math.floor(Math.random() * ARMAS_PRIMORDIAIS.length)];
        if (!j.inventario) j.inventario = [];
        j.inventario.push(armaDrop.id);
        drop_texto = `⚔️ *Drop especial!* Você recebeu *${armaDrop.nome}* (${armaDrop.raridade})!\nUse /equipar ${armaDrop.nome} para equipar.`;
      } else if (batalha.boss.drop) {
        if (!j.inventario) j.inventario = [];
        j.inventario.push(batalha.boss.drop);
        drop_texto = `🎁 *Drop!* Você recebeu *${batalha.boss.drop}*!\nUse /inventario pra ver, ou /vender pra trocar por belarium.`;
      }
    } else {
      xp_ganho = batalha.monstro_xp || 20;
      moedas = batalha.monstro_moedas || 10;
    }

    j.cooldown_batalha = Date.now();
    db.salvarJogador(from, j);
    db.adicionarXP(from, xp_ganho);
    checarTituloImperador(from);
    db.adicionarMoedas(from, moedas);
    if (isBoss) db.adicionarConquista(from, 'iniciado_boss');
    progredirMissao(from, isBoss ? 'boss' : 'batalhar');
    await recompensarParceirosCoop(batalha, from, jid, xp_ganho, moedas, isBoss);

    const loot_msg = isBoss ? null : rolarLootBatalha(from);
    const j_pos_loot = db.getJogador(from) || j;

    return enviar(jid, bloco(isBoss ? '𝐁𝐎𝐒𝐒 𝐃𝐄𝐑𝐑𝐎𝐓𝐀𝐃𝐎 【🏆】' : '𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 【🏆】', [
      ...resultado.logs,
      '━━━━━━━━━━',
      `⚔️ ${batalha.monstro_nome} derrotado!`,
      `⭐ XP: +${xp_ganho}`,
      `💰 +${db.formatarPreco(moedas)}`,
      ...(drop_texto ? [drop_texto] : []),
      ...(loot_msg ? [loot_msg] : []),
      `❤️ HP: ${j_pos_loot.hp}/${j_pos_loot.hp_max}`,
      '━━━━━━━━━━',
      '/caminhar | /acampar | /perfil | /rpg'
    ]));
  }

  // Monstro sobrevive: contra-ataca normalmente (a não ser que esteja paralisado)
  const defesa_jogador = calcularDefesa(j);
  let dano_monstro;
  if (resultado.efeito?.tipo === 'paralisia' || tick.pular_contra_ataque) {
    dano_monstro = 0;
    resultado.logs.push(`⛓️ *${batalha.monstro_nome}* ficou paralisado e não conseguiu contra-atacar!`);
  } else {
    let dano_bruto_monstro;
    if (isBoss) {
      const fase = faseAtualBoss({ hp: batalha.monstro_hp, hp_max: batalha.monstro_hp_max, fases: batalha.boss.fases });
      const mult_fase = fase ? (fase.dano_mult || 1) : 1;
      dano_bruto_monstro = Math.floor(rand(batalha.boss.dano[0], batalha.boss.dano[1]) * mult_fase);
    } else {
      dano_bruto_monstro = Math.floor((batalha.monstro_dano || 10) * (0.8 + Math.random() * 0.4));
    }
    if (reducao_dano_monstro > 0) {
      dano_bruto_monstro = Math.floor(dano_bruto_monstro * (1 - reducao_dano_monstro));
      resultado.logs.push(`🌊 *${batalha.monstro_nome}* está mais lento — dano reduzido!`);
    }
    // Bosses em fases avançadas multiplicam o dano bruto em até 5x (dano_mult).
    // Antes a defesa só mitigava metade desse golpe já multiplicado, causando
    // saltos de dano desproporcionais ao entrar em fase 2/3. Agora a defesa
    // cheia é aplicada contra bosses pra compensar o multiplicador de fase.
    const mitigacao = isBoss ? defesa_jogador : Math.floor(defesa_jogador * 0.5);
    dano_monstro = Math.max(3, dano_bruto_monstro - mitigacao);
  }
  j.hp = Math.max(0, j.hp - dano_monstro);
  db.salvarJogador(from, j);

  if (j.hp <= 0) {
    batalhaAtiva.delete(from);
    if (batalha.participantes) batalha.participantes = batalha.participantes.filter(p => p !== from);
    j.morto = true;
    j.hp = 0;
    j.mortes = (j.mortes || 0) + 1;
    if (j.mortes >= 10) db.adicionarTitulo(from, 'perdedor');
    db.salvarJogador(from, j);
    return enviar(jid, bloco('𝐃𝐄𝐑𝐑𝐎𝐓𝐀 【💀】', [
      ...resultado.logs,
      '━━━━━━━━━━',
      `${j.nome} foi derrotado por ${batalha.monstro_nome}!`,
      '/criar — Criar novo personagem'
    ]));
  }

  const hp_pct = Math.floor((j.hp / j.hp_max) * 10);
  const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);
  const m_pct = Math.max(0, Math.floor((batalha.monstro_hp / batalha.monstro_hp_max) * 10));
  const m_barra = '█'.repeat(m_pct) + '░'.repeat(10 - m_pct);

  batalhaAtiva.set(from, batalha);
  return enviar(jid, bloco('𝐁𝐀𝐓𝐀𝐋𝐇𝐀 — 𝐓𝐔𝐑𝐍𝐎 【⚔️】', [
    ...resultado.logs,
    '━━━━━━━━━━',
    `${isBoss ? '👑' : emojiMonstro(batalha.monstro_nome)} ${batalha.monstro_nome}`,
    `❤️ HP: ${batalha.monstro_hp}/${batalha.monstro_hp_max}`,
    `[${m_barra}]`,
    '━━━━━━━━━━',
    `👤 ${j.nome}`,
    `💢 Recebeu ${dano_monstro}`,
    `❤️ HP: ${j.hp}/${j.hp_max}`,
    `[${barra}]`,
    '━━━━━━━━━━',
    '1️⃣ /matar | 2️⃣ /fugir',
    '3️⃣ /mochila | 4️⃣ /chamarpet'
  ]));
}

// Recompensa os outros participantes de uma batalha em co-op (além de quem desferiu o golpe final)
async function recompensarParceirosCoop(batalha, autor_id, jid, xp_ganho, moedas, isBoss) {
  const parceiros = (batalha.participantes || []).filter(p => p !== autor_id);
  for (const parceiro_id of parceiros) {
    if (!batalhaAtiva.has(parceiro_id)) continue; // já não está mais nessa luta (morreu antes, etc.)
    batalhaAtiva.delete(parceiro_id);
    const jp = db.getJogador(parceiro_id);
    if (!jp) continue;
    jp.kills = (jp.kills || 0) + 1;
    jp.cooldown_batalha = Date.now();
    db.salvarJogador(parceiro_id, jp);
    db.adicionarXP(parceiro_id, xp_ganho);
    db.adicionarMoedas(parceiro_id, moedas);
    checarTituloImperador(parceiro_id);
    if (isBoss) db.adicionarConquista(parceiro_id, 'iniciado_boss');
    progredirMissao(parceiro_id, isBoss ? 'boss' : 'batalhar');
    await enviar(jid, bloco('🤝 VITÓRIA EM EQUIPE! 【🏆】', [
      `*${jp.nome}*, sua equipe derrotou *${batalha.monstro_nome}*!`,
      `⭐ XP: +${xp_ganho} | 💰 +${db.formatarPreco(moedas)}`
    ]), [parceiro_id]);
  }
}

async function iniciarEncontroBatalha(from, jid) {
  const j0 = db.getJogador(from);
  if (!j0) return enviar(jid, '❌ Você não tem personagem! Use /criar.');
  if (j0.morto) return enviar(jid, '❌ Você está morto! Use /renascer.');
  if (batalhaAtiva.has(from)) return enviar(jid, '❌ Você já está em batalha! Use /matar, /habilidade ou /fugir.');

  const agora = Date.now();
  if (j0.cooldown_batalha && agora - j0.cooldown_batalha < 10 * 1000) {
    return enviar(jid, `⏳ Aguarde um pouco antes de batalhar de novo.`);
  }

  // ── AMBULANTE DE TROCA (raro, ~7% de chance no lugar de um monstro) ──
  if (Math.random() < 0.07) {
    j0.cooldown_batalha = agora;
    db.salvarJogador(from, j0);
    return apresentarMercadorAmbulante(from, jid);
  }

  const monstro = gerarMonstro(j0.regiao);
  if (!monstro) return enviar(jid, '❌ Não há monstros nesta região. Use /viajar para mudar de região.');

  // Se for um animal selvagem (domável), sorteia o estado dele UMA vez aqui
  // e guarda na batalha — antes ele só era sorteado (de novo, do zero) na
  // hora do /tentardomar, então nunca aparecia antes disso pro jogador ver.
  const eh_selvagem = ehAnimalSelvagem(monstro.nome);
  const estado_criatura = eh_selvagem ? gerarEstado() : null;
  const estado_info_ini = estado_criatura ? ESTADOS[estado_criatura] : null;

  batalhaAtiva.set(from, {
    tipo: 'monstro',
    monstro_nome: monstro.nome,
    monstro_hp: monstro.hp,
    monstro_hp_max: monstro.hp_max,
    monstro_dano: monstro.dano,
    monstro_xp: monstro.xp,
    monstro_moedas: monstro.moedas,
    estado_criatura,
    participantes: [from],
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
      ...(estado_info_ini ? [`${estado_info_ini.emoji} Estado: *${estado_info_ini.nome}* — _${estado_info_ini.descricao}_`] : []),
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
      '5️⃣ /habilidade [nome]',
      ...(HABILIDADES_ARMA_EXCLUSIVA[j2.arma] ? ['✨ /minhaarma — Ver técnicas da sua arma'] : []),
      ...(eh_selvagem ? ['6️⃣ /tentardomar — Tentar domar'] : [])
    ])
  );
}

// ── BATALHA DE BOSS (mesmo estilo de turnos da batalha normal) ──
// ── LISTA DE BOSSES DA REGIÃO + ESCOLHA COM AVISO DE RISCO ──────────────
function verBossesRegiao(jogador_id) {
  const j = db.getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  const lista = bossesDaRegiao(j.regiao);
  if (lista.length === 0) return '❌ Não há bosses cadastrados nesta região.';

  const regiaoNome = REGIOES[j.regiao]?.nome || j.regiao;
  let texto = `👑 *BOSSES DE ${regiaoNome}*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  lista.forEach(b => {
    let status;
    if (j.nivel >= b.nivel_recomendado) status = '🔓';
    else if (j.nivel >= b.nivel_recomendado * 0.6) status = '⚠️';
    else status = '🔒';
    texto += `${status} *${b.rank}.* ${b.nome} — Nv. recomendado ${b.nivel_recomendado}\n`;
  });
  texto += `\n🔓 Tranquilo | ⚠️ Arriscado pro seu nível | 🔒 Perigoso demais\n\n📝 */boss [número ou nome]* — escolher um específico\n📝 */boss* sozinho — enfrenta um aleatório da região`;
  return texto;
}

async function escolherBoss(from, jid, busca) {
  const j = db.getJogador(from);
  if (!j) return enviar(jid, '❌ Você não tem personagem! Use /criar.');

  const lista = bossesDaRegiao(j.regiao);
  if (lista.length === 0) return enviar(jid, '❌ Não há bosses cadastrados nesta região.');

  const buscaNorm = normalizar(busca);
  let escolhido = null;
  const numero = parseInt(busca);
  if (!isNaN(numero)) escolhido = lista.find(b => b.rank === numero);
  if (!escolhido) escolhido = lista.find(b => normalizar(b.nome).includes(buscaNorm));
  if (!escolhido) return enviar(jid, `❌ Boss "${busca}" não encontrado nessa região. Use /bosses pra ver a lista.`);

  // Muito abaixo do recomendado: bloqueia de vez.
  if (j.nivel < escolhido.nivel_recomendado * 0.6) {
    return enviar(jid, `🔒 *${escolhido.nome}* é forte demais pra você agora!\nRecomendado: nível ${escolhido.nivel_recomendado} | Você: nível ${j.nivel}\n\nVolte quando tiver mais experiência.`);
  }

  // Abaixo do recomendado mas não tão longe: deixa, com aviso + confirmação.
  if (j.nivel < escolhido.nivel_recomendado) {
    const pendente = confirmarBossArriscado.get(from);
    if (pendente && pendente.bossNome === escolhido.nome && Date.now() - pendente.criado < 30000) {
      confirmarBossArriscado.delete(from);
      return iniciarEncontroBoss(from, jid, escolhido);
    }
    confirmarBossArriscado.set(from, { bossNome: escolhido.nome, criado: Date.now() });
    return enviar(jid, `⚠️ *AVISO!*\n*${escolhido.nome}* é recomendado pro nível ${escolhido.nivel_recomendado} — você é nível ${j.nivel}.\n\nSe tentar mesmo assim, pode dar muito errado (dano pesado, chance alta de derrota).\n\n📝 Digite o comando de novo em até 30s pra confirmar mesmo assim.`);
  }

  return iniciarEncontroBoss(from, jid, escolhido);
}

async function iniciarEncontroBoss(from, jid, bossEspecifico) {

  const j0 = db.getJogador(from);
  if (!j0) return enviar(jid, '❌ Você não tem personagem! Use /criar.');
  if (j0.morto) return enviar(jid, '❌ Você está morto! Use /renascer.');
  if (batalhaAtiva.has(from)) return enviar(jid, '❌ Você já está em batalha! Use /matar, /habilidade ou /fugir.');

  const agora = Date.now();
  if (j0.cooldown_batalha && agora - j0.cooldown_batalha < 30 * 1000) {
    const restante = Math.ceil((30 * 1000 - (agora - j0.cooldown_batalha)) / 1000);
    return enviar(jid, `⏳ Aguarde ${restante}s antes de enfrentar um boss novamente.`);
  }

  const boss = gerarBoss(j0.regiao, bossEspecifico);
  if (!boss) return enviar(jid, '❌ Não há boss nesta região.');

  batalhaAtiva.set(from, {
    tipo: 'boss',
    boss,
    monstro_nome: boss.nome,
    monstro_hp: boss.hp,
    monstro_hp_max: boss.hp_max,
    participantes: [from],
    turno: 1
  });

  const j2 = db.getJogador(from);
  const hp_pct = Math.floor((j2.hp / j2.hp_max) * 10);
  const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);
  const b = batalhaAtiva.get(from);
  const m_pct = Math.floor((b.monstro_hp / b.monstro_hp_max) * 10);
  const m_barra = '█'.repeat(m_pct) + '░'.repeat(10 - m_pct);

  return enviar(jid,
    bloco('𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐃𝐄 𝐁𝐎𝐒𝐒 【💀】', [
      flavorMonstro(b.monstro_nome),
      '━━━━━━━━━━',
      `👑 ${b.monstro_nome}`,
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
    const isBoss = batalha.tipo === 'boss';

    // Dano do jogador: agora usa a arma equipada de verdade (antes a arma não influenciava em nada)
    let d20 = rolarD20();
    let bonus_sorte_texto = null;
    if (j.sorte_batalhas_restantes > 0) {
      const bonus_sorte = Math.min(4, Math.floor((j.sorte_valor || 0) / 10));
      d20 = Math.min(20, d20 + bonus_sorte);
      j.sorte_batalhas_restantes -= 1;
      if (j.sorte_batalhas_restantes <= 0) { j.sorte_batalhas_restantes = 0; j.sorte_valor = 0; }
      bonus_sorte_texto = `🍀 Sorte ativa (+${bonus_sorte} na rolagem)`;
    }
    const resultado_d20 = getResultadoD20(d20);
    const { dano_base } = calcularDanoBase(j);
    let dano_jogador = Math.floor(dano_base * resultado_d20.mult);

    // Processa efeitos de habilidades de arma ativos (sangramento, lentidão)
    const tick_normal = tickEfeitosMonstro(batalha);

    // Dano recebido: usa a defesa real do jogador (incluindo armadura equipada)
    const defesa_jogador = calcularDefesa(j);
    let dano_bruto_monstro;
    if (tick_normal.pular_contra_ataque) {
      dano_bruto_monstro = 0;
    } else if (isBoss) {
      const fase = faseAtualBoss({ hp: batalha.monstro_hp, hp_max: batalha.monstro_hp_max, fases: batalha.boss.fases });
      const mult_fase = fase ? (fase.dano_mult || 1) : 1;
      dano_bruto_monstro = Math.floor(rand(batalha.boss.dano[0], batalha.boss.dano[1]) * mult_fase);
    } else {
      dano_bruto_monstro = Math.floor((batalha.monstro_dano || 10) * (0.8 + Math.random() * 0.4));
    }
    if (tick_normal.reducao_dano_monstro > 0) {
      dano_bruto_monstro = Math.floor(dano_bruto_monstro * (1 - tick_normal.reducao_dano_monstro));
    }
    // Mesma correção do outro handler de batalha: defesa cheia contra bosses,
    // já que o multiplicador de fase pode chegar a 5x o dano bruto.
    const mitigacao_normal = isBoss ? defesa_jogador : Math.floor(defesa_jogador * 0.5);
    const dano_monstro = Math.max(tick_normal.pular_contra_ataque ? 0 : 3, dano_bruto_monstro - mitigacao_normal);

    // Aplica passivas de classe (ex: guerreiro toma menos dano, assassino crítico no 1º golpe...)
    const passiva = aplicarPassivaClasse(j, dano_jogador, dano_monstro, resultado_d20, false);
    dano_jogador = passiva.dano_c;
    const dano_monstro_final = passiva.dano_r;

    batalha.monstro_hp -= dano_jogador;
    batalha.monstro_hp -= tick_normal.dano_extra;

    // Pet ajuda na batalha, se o jogador tiver um
    let log_pet = null;
    const ajuda_pet = petAjudaBatalha(from, batalha.monstro_hp);
    if (ajuda_pet) {
      batalha.monstro_hp -= ajuda_pet.dano;
      log_pet = `🐾 ${ajuda_pet.nome} atacou! Dano: *${ajuda_pet.dano}*`;
    }

    j.hp = Math.max(0, j.hp - dano_monstro_final);
    db.salvarJogador(from, j);

    const monstro_morreu = batalha.monstro_hp <= 0;

    if (monstro_morreu) {
      batalhaAtiva.delete(from);
      j.kills = (j.kills || 0) + 1;

      let xp_ganho, moedas, drop_texto = null;
      if (isBoss) {
        xp_ganho = batalha.boss.xp;
        moedas = rand(batalha.boss.moedas[0], batalha.boss.moedas[1]);
        j.boss_mortos = [...(j.boss_mortos || []), batalha.boss.nome];
        if (batalha.boss.nome.toLowerCase().includes('drag')) db.adicionarTitulo(from, 'matador_dragao');
        if (batalha.boss.drop_arma && ARMAS_PRIMORDIAIS.length > 0) {
          const armaDrop = ARMAS_PRIMORDIAIS[Math.floor(Math.random() * ARMAS_PRIMORDIAIS.length)];
          if (!j.inventario) j.inventario = [];
          j.inventario.push(armaDrop.id);
          drop_texto = `⚔️ *Drop especial!* Você recebeu *${armaDrop.nome}* (${armaDrop.raridade})!\nUse /equipar ${armaDrop.nome} para equipar.`;
        } else if (batalha.boss.drop) {
          if (!j.inventario) j.inventario = [];
          j.inventario.push(batalha.boss.drop);
          drop_texto = `🎁 *Drop!* Você recebeu *${batalha.boss.drop}*!\nUse /inventario pra ver, ou /vender pra trocar por belarium.`;
        }
      } else {
        // XP/moedas reais do monstro da região atual (antes era um valor fixo
        // igual pra qualquer região, por isso áreas mais avançadas não valiam a pena)
        xp_ganho = batalha.monstro_xp || 20;
        moedas = batalha.monstro_moedas || 10;
      }

      // O jogador pode ter derrubado o monstro no mesmo golpe em que o
      // contra-ataque zerou o próprio HP dele. Isso precisa marcar o
      // jogador como morto de verdade — senão ele fica "vivo" com HP 0
      // e livre pra usar poções de cura (que só checam `morto`).
      const jogador_tambem_caiu = j.hp <= 0;
      if (jogador_tambem_caiu) {
        j.morto = true;
        j.hp = 0;
        j.mortes = (j.mortes || 0) + 1;
        if (batalha.participantes) batalha.participantes = batalha.participantes.filter(p => p !== from);
        if (j.mortes >= 10) db.adicionarTitulo(from, 'perdedor');
      }

      j.cooldown_batalha = Date.now();
      db.salvarJogador(from, j);
      db.adicionarXP(from, xp_ganho);
      checarTituloImperador(from);
      db.adicionarMoedas(from, moedas);
      if (isBoss) db.adicionarConquista(from, 'iniciado_boss');

      progredirMissao(from, isBoss ? 'boss' : 'batalhar');
      await recompensarParceirosCoop(batalha, from, jid, xp_ganho, moedas, isBoss);

      const loot_msg = (isBoss || jogador_tambem_caiu) ? null : rolarLootBatalha(from);
      const j_pos_loot = db.getJogador(from) || j;
      const hp_v = Math.floor((j_pos_loot.hp / j_pos_loot.hp_max) * 10);
      const barra_v = '█'.repeat(Math.max(0,hp_v)) + '░'.repeat(Math.max(0,10-hp_v));
      const frasesVitoria = [
        '_O corpo dele cai e some entre as sombras da floresta._',
        '_Um último gemido, e tudo fica em silêncio novamente._',
        '_Você respira fundo, ainda com adrenalina no sangue._',
        '_Mais um inimigo cai. O IMPERIUS observa._'
      ];
      return enviar(jid, bloco(isBoss ? '𝐁𝐎𝐒𝐒 𝐃𝐄𝐑𝐑𝐎𝐓𝐀𝐃𝐎 【🏆】' : '𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 【🏆】', [
        `⚔️ ${batalha.monstro_nome} derrotado!`,
        `💥 Você causou ${dano_jogador} de dano`,
        ...(passiva.extras && passiva.extras.length ? passiva.extras : []),
        ...(log_pet ? [log_pet] : []),
        `_${frasesVitoria[Math.floor(Math.random() * frasesVitoria.length)]}_`,
        '━━━━━━━━━━',
        `⭐ XP: +${xp_ganho}`,
        `💰 +${db.formatarPreco(moedas)}`,
        ...(drop_texto ? [drop_texto] : []),
        ...(loot_msg ? [loot_msg] : []),
        ...(jogador_tambem_caiu
          ? ['\n💀 *Mas o contra-ataque foi fatal — você também caiu!*', 'Use /renascer para voltar.']
          : [`❤️ HP: ${j_pos_loot.hp}/${j_pos_loot.hp_max}`, `[${barra_v}]`]),
        '━━━━━━━━━━',
        jogador_tambem_caiu ? '/renascer' : '/caminhar | /acampar | /perfil | /rpg'
      ]));
    }

    if (j.hp <= 0) {
      batalhaAtiva.delete(from);
      if (batalha.participantes) batalha.participantes = batalha.participantes.filter(p => p !== from);
      j.morto = true;
      j.hp = 0;
      j.mortes = (j.mortes || 0) + 1;
      if (j.mortes >= 10) db.adicionarTitulo(from, 'perdedor');
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

    const fase_msg = (isBoss && faseAtualBoss({ hp: batalha.monstro_hp, hp_max: batalha.monstro_hp_max, fases: batalha.boss.fases })?.msg) ? [`\n👑 _${faseAtualBoss({ hp: batalha.monstro_hp, hp_max: batalha.monstro_hp_max, fases: batalha.boss.fases }).msg}_`] : [];

    batalhaAtiva.set(from, batalha);
    return enviar(jid, bloco('𝐁𝐀𝐓𝐀𝐋𝐇𝐀 — 𝐓𝐔𝐑𝐍𝐎 【⚔️】', [
      `_${flavorAtaqueJogador()}_`,
      `${resultado_d20.emoji} ${resultado_d20.texto}`,
      ...(bonus_sorte_texto ? [bonus_sorte_texto] : []),
      '━━━━━━━━━━',
      `${isBoss ? '👑' : emojiMonstro(batalha.monstro_nome)} ${batalha.monstro_nome}`,
      ...(!isBoss && estrelasDoMonstro(batalha.monstro_nome) ? [estrelasDoMonstro(batalha.monstro_nome)] : []),
      `❤️ HP: ${batalha.monstro_hp}/${batalha.monstro_hp_max}`,
      `[${m_barra}]`,
      ...fase_msg,
      '━━━━━━━━━━',
      `👤 ${j.nome}`,
      `💥 Você causou ${dano_jogador}`,
      ...(tick_normal.logs.length ? tick_normal.logs : []),
      ...(passiva.extras && passiva.extras.length ? passiva.extras : []),
      ...(log_pet ? [log_pet] : []),
      `_${flavorContraAtaque(batalha.monstro_nome)}_`,
      `💢 Recebeu ${dano_monstro_final}`,
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
        const niveis_ganhos = Math.max(0, (j_ren.nivel || 1) - 1);
        j_ren.classe = classe;
        j_ren.hp_max = classeData.hp + niveis_ganhos * 10;
        j_ren.mana_max = classeData.mana + niveis_ganhos * 5;
        j_ren.mana = j_ren.mana_max;
        j_ren.for = classeData.for + niveis_ganhos;
        j_ren.des = classeData.des;
        j_ren.con = classeData.con + niveis_ganhos;
        j_ren.int = classeData.int;
        j_ren.morto = false;
        j_ren.renascendo = false;
        j_ren.hp = Math.floor(j_ren.hp_max * 0.3);
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
    if (classe === 'ajudante_deus') db.adicionarTitulo(from, 'agraciado');

    // Salvar características no jogador
    const j = db.getJogador(from);
    let armadura_inicial = 'armadura_pano';
    if (j) {
      j.genero = genero || 'outro';
      j.caracteristicas = caracteristicas || '';
      j.imagem_url = null;
      if (!j.inventario) j.inventario = [];
      for (let i = 0; i < 5; i++) j.inventario.push('pocao_hp_maxima');

      // Armadura inicial de acordo com o arquétipo da classe (item 1 do relatório)
      const ARMADURA_INICIAL_POR_CLASSE = {
        guerreiro: 'armadura_couro', paladino: 'armadura_couro', berserker: 'armadura_couro',
        samurai: 'armadura_couro', cacador_demonios: 'armadura_couro', portador_caos: 'armadura_couro',
        espadachim: 'armadura_couro_reforcado', assassino: 'armadura_couro_reforcado',
        ninja: 'armadura_couro_reforcado', sombra: 'armadura_couro_reforcado',
        arqueiro: 'armadura_couro_reforcado', cacador: 'armadura_couro_reforcado',
        monge: 'armadura_pano', mago: 'armadura_pano', necromante: 'armadura_pano',
        invocador: 'armadura_pano', druida: 'armadura_pano', vidente: 'armadura_pano',
        dragomante: 'armadura_pano', meteoromante: 'armadura_pano', serafim: 'armadura_pano',
        trovejante: 'armadura_pano', mare: 'armadura_pano', bombardeiro: 'armadura_pano',
        alquimista: 'armadura_pano', curandeiro: 'armadura_pano', bardo: 'armadura_pano',
        espectro: 'manto_arcano', heroi_caido: 'manto_arcano', artificer: 'manto_arcano',
        vampiro: 'armadura_couro_reforcado',
      };
      const armadura_escolhida = ARMADURA_INICIAL_POR_CLASSE[classe] || 'armadura_pano';
      armadura_inicial = armadura_escolhida;
      j.inventario.push(armadura_escolhida);
      j.armadura = armadura_escolhida;

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
      `🛡️ Armadura inicial: ${ARMADURAS.find(a => a.id === armadura_inicial)?.nome || 'Roupas de Pano'} (equipada)`,
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
