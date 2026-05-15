// ============================================================
// IMPERIUS v4.0 — BOT PRINCIPAL
// ============================================================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

// ── SISTEMAS ──────────────────────────────────────────────
const db = require('./db');
const { menuClasses, getClasseKey, girarRoleta, gerarFicha, verClasse, viajar, verMapa, verRegioes } = require('./character');
const { batalharMonstro, batalharBoss, pvp, usarHabilidade, usarUltimate, rolarD20, rand } = require('./combat');
const { renascer, reviverPorNecromante, aprovarAcaoServo, liberarServo } = require('./death');
const { verLoja, comprarItem, usarItem, equiparArma, verInventario, verBanco, depositar, sacar } = require('./economy');
const { verRanking, verConquistas, verTitulos, usarTitulo, verMissoes, matarJogador, darItem, abencoarJogador, maldicionarJogador, eventoGlobal, statusBot } = require('./events');
const { criarSacrificio, aceitarSacrificio, recusarSacrificio, pedirSacrificioParceiro, aceitarMorteSacrificio, recusarMorteSacrificio, verSacrificiosPendentes } = require('./sacrifice');
const { encarnar, ascender, processarMorteEncarnacao } = require('./incarnation');
const { verLojaOvos, chocarOvo, verPet, soltarPet, curarPet, petAjudaBatalha, tentarDomar, nomearPet, comprarOvo, gerarEstado, ITENS_DOMAR } = require('./pets');
const { provocarDeus, aceitarEventoDeus, ignorarDeus, atacarDeus, pedirAjuda, aceitarAjuda, fugirDeus, deusDescansar, statusEvento } = require('./god');
const { criarGuilda, verGuilda, convidarGuilda, aceitarGuilda, sairGuilda, rankingGuildas } = require('./guild');
const { verMasmorras, entrarMasmorra, acampar, pedirCasamento, aceitarCasamento, divorciar, loginDiario } = require('./dungeon');
const { CLASSES, ARMAS } = require('./gameData');


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
const DONO_LID = '36821174120703';
const DONO_ID = `${DONO_NUMERO}@s.whatsapp.net`;
const PREFIX = '/';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

const criando = new Map();
const batalhaAtiva = new Map();
let botAtivo = true; // /on e /off
const nomeandoPet = new Map(); // Aguardando nome do pet // Armazena batalhas ativas
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
  'criar': ['criar', 'crar', 'crair'],
  'roleta': ['roleta', 'rolet', 'rolta', 'girar', 'sortear'],
  'confirmarroleta': ['confirmarroleta', 'confirmaroleta', 'confirmar'],
  'perfil': ['perfil', 'perfi', 'perfill', 'perf'],
  'classe': ['classe', 'class', 'clases'],
  'inventario': ['inventario', 'inventaio', 'invetario', 'inv'],
  'conquistas': ['conquistas', 'conquista', 'conq'],
  'titulos': ['titulos', 'titulo', 'titulos'],
  'usartitulo': ['usartitulo', 'usatitulo', 'equipartitulo'],
  'minhaarma': ['minhaarma', 'minhaarm'],
  'armasc': ['armasc', 'armasC'],
  'armasd': ['armasd', 'armasD'],
  'armasm': ['armasm', 'armasM'],
  'armas': ['armas'],
  'comida': ['comida', 'comidas'],
  'ovos': ['ovos', 'ovo'],
  'itens': ['itens', 'iten', 'item'],
  'batalha': ['batalha', 'batalah', 'batalia', 'batlha', 'btl'],
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
  'masmorras': ['masmorras', 'masmorra', 'masm'],
  'masmorra': ['masmorra', 'masmorr'],
  'loja': ['loja', 'loj', 'shop', 'lojaa'],
  'lojapets': ['lojapets', 'lojapet', 'ovos', 'lojaovo'],
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
  'animais': ['animais', 'animal', 'animai'],
  'meuanimal': ['meuanimal', 'meoanimal'],
  'soltaranimal': ['soltaranimal', 'soltarnim'],
  'adotar': ['adotar', 'adota', 'adopt'],
  'sacrificio': ['sacrificio', 'sacrif', 'sacr'],
  'aceitarmorte': ['aceitarmorte', 'aceitamorte'],
  'recusarmorte': ['recusarmorte', 'recusamorte'],
  'renascer': ['renascer', 'renasce', 'rensc'],
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
  'matar': ['matar', 'mata'],
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
};

function resolverCmd(cmd_raw) {
  const n = normalizar(cmd_raw);
  // Match exato primeiro
  for (const [cmd_real, variantes] of Object.entries(ALIASES)) {
    if (variantes.includes(n)) return cmd_real;
  }
  // Match exato com o próprio nome do comando
  for (const cmd_real of Object.keys(ALIASES)) {
    if (cmd_real === n) return cmd_real;
  }
  // Busca aproximada — só se diferença for pequena (1-2 letras)
  for (const [cmd_real, variantes] of Object.entries(ALIASES)) {
    for (const v of variantes) {
      // Só aceita se a diferença de tamanho for de no máximo 2
      if (Math.abs(v.length - n.length) <= 2) {
        if (v.startsWith(n) && n.length >= 3) return cmd_real;
        if (n.startsWith(v) && v.length >= 3 && n.length - v.length <= 2) return cmd_real;
      }
    }
  }
  return n;
}

// ── FUNÇÕES AUXILIARES ────────────────────────────────────
function isDono(id) {
  return id.replace('@s.whatsapp.net', '') === DONO_NUMERO;
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
      app.listen(3001, () => console.log('🌐 QR disponível na URL do Railway'));
    }

    sock.ev.on('connection.update', ({ qr }) => {
      if (qr) { qrAtual = qr; console.log('📱 QR Code atualizado!'); }
    });
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ IMPERIUS v4.0 conectado!');
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

` + bloco('𝐆𝐄𝐑𝐀𝐋 【📋】', ['ℹ️ /info', '📚 /lore', '🗺️ /mapa', '📜 /regras', '👑 /dono', '🆘 /ajuda']) + `

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
      '  ↳ /renascer — Renascer',
      '  ↳ /renascer0 — Zerar tudo',
      '  ↳ /kill — Morrer',
      '',
      '⚔️ BATALHA',
      '  ↳ /batalha — Lutar contra monstros',
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
      '  ↳ /chamarpet — Chamar pet',
      '  ↳ /soltarpet — Soltar pet',
      '  ↳ /curarpet — Curar pet',
      '',
      '👥 SOCIAL',
      '  ↳ /guilda — Ver guilda',
      '  ↳ /criarguilda — Criar guilda',
      '  ↳ /convidar — Convidar membro',
      '  ↳ /ranking — Top jogadores',
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
        '📌 Versão: 4.7.7 - TESTE NOVO',
        '🌍 Bot RPG para WhatsApp',
        '━━━━━━━━━━',
        '👑 Criado por: JUVENT',
        '🤝 Auxiliado por: Arabella',
        '━━━━━━━━━━',
        '📖 RPG completo com batalhas,',
        '   pets, guildas, masmorras',
        '   e muito mais!',
        '━━━━━━━━━━',
        '🆘 /ajuda | 👑 /dono | 📚 /lore'
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
        '  Digite /batalha',
        '',
        '🔸 Como ganhar moedas?',
        '  Batalhe e complete missões',
        '',
        '🔸 Morri, e agora?',
        '  Digite /renascer',
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
        '🗡️ Espada Enferrujada (@AEE) — 🪙 50 | Dano: 5-12 | ⬜',
        '🪓 Machadinha do Lenhador (@AML) — 🪙 48 | Dano: 5-12 | ⬜',
        '🪵 Clava de Madeira (@ACM) — 🪙 28 | Dano: 5-11 | ⬜',
        '🔨 Martelo Ferro Velho (@AMV) — 🪙 42 | Dano: 5-12 | ⬜',
        '⚔️ Espada de Ferro (@AEF) — 🪙 200 | Dano: 12-22 | 🟩',
        '🪓 Machado de Guerra (@AMG) — 🪙 240 | Dano: 14-25 | 🟩',
        '⚔️ Espada de Aço (@AEA) — 🪙 800 | Dano: 25-40 | 🟦',
        '🩸 Machado Sanguinário (@AMS) — 🪙 930 | Dano: 29-47 | 🟦',
        '💀 Espada das Almas (@AEA2) — 🪙 3000 | Dano: 45-65 | 🟪',
        '👊 Manopla do Titã (@AMT) — 🪙 3500 | Dano: 50-70 | 🟪',
        '✨ Excalibur (@AEX) — 🪙 12000 | Dano: 70-100 | 🟨',
        '⚔️ Espada do Destino (@AED) — 🪙 13500 | Dano: 72-102 | 🟨',
        '⚔️ Espada Ancestral (@AEN) — 🪙 35000 | Dano: 90-130 | 🔶',
        '━━━━━━━━━━',
        '💡 /comprar @AEE'
      ]));
    }
    if (sub === 'distancia' || sub === 'distância') {
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 𝐃𝐄 𝐃𝐈𝐒𝐓𝐀̂𝐍𝐂𝐈𝐀 【🏹】', [
        '🏹 Arco Simples (@AAS) — 🪙 45 | Dano: 4-10 | ⬜',
        '💨 Zarabatana (@AZA) — 🪙 22 | Dano: 3-8 | ⬜',
        '🪢 Chicote de Couro (@ACC) — 🪙 33 | Dano: 3-9 | ⬜',
        '🏹 Arco do Caçador (@AAC) — 🪙 180 | Dano: 10-20 | 🟩',
        '🌲 Arco da Floresta (@AAF) — 🪙 198 | Dano: 11-21 | 🟩',
        '🏹 Arco Élfico (@AAE) — 🪙 750 | Dano: 22-38 | 🟦',
        '💨 Arco dos Ventos (@AAV) — 🪙 780 | Dano: 23-39 | 🟦',
        '☠️ Arco da Morte (@AAM) — 🪙 3100 | Dano: 42-62 | 🟪',
        '⚡ Arco dos Raios (@AAR) — 🪙 3150 | Dano: 43-63 | 🟪',
        '🏹 Arco de Ártemis (@AAT) — 🪙 11000 | Dano: 65-95 | 🟨',
        '🌌 Arco do Cosmos (@AAK) — 🪙 12500 | Dano: 67-97 | 🟨',
        '🏹 Arco Ancestral (@AAN) — 🪙 32000 | Dano: 85-125 | 🔶',
        '━━━━━━━━━━',
        '💡 /comprar @AAS'
      ]));
    }
    if (sub === 'magicas' || sub === 'mágicas') {
      return enviar(jid, bloco('𝐀𝐑𝐌𝐀𝐒 𝐌𝐀́𝐆𝐈𝐂𝐀𝐒 【🪄】', [
        '🪄 Cajado de Madeira (@ACM) — 🪙 40 | Dano: 3-9 | ⬜',
        '🪄 Cajado de Osso (@ACO) — 🪙 85 | Dano: 6-14 | 🟫',
        '🪄 Cajado Arcano (@ACA) — 🪙 220 | Dano: 8-18 | 🟩',
        '🌿 Cajado da Natureza (@ACN) — 🪙 190 | Dano: 9-19 | 🟩',
        '🔮 Cajado Mágico (@ACG) — 🪙 850 | Dano: 20-35 | 🟦',
        '🔥 Cajado das Chamas (@ACC) — 🪙 860 | Dano: 22-37 | 🟦',
        '⛈️ Cajado da Tempestade (@ACT) — 🪙 840 | Dano: 21-36 | 🟦',
        '🌀 Cajado Abissal (@ACB) — 🪙 3200 | Dano: 38-58 | 🟪',
        '⏳ Cajado do Tempo (@ACP) — 🪙 3050 | Dano: 41-61 | 🟪',
        '⚡ Bastão de Odin (@ABO) — 🪙 13000 | Dano: 68-98 | 🟨',
        '♾️ Cajado da Eternidade (@ACE) — 🪙 14000 | Dano: 70-100 | 🟨',
        '🪄 Cajado Ancestral (@ACR) — 🪙 30000 | Dano: 82-122 | 🔶',
        '━━━━━━━━━━',
        '💡 /comprar @ACM'
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
    if (j.morto) return enviar(jid, `❌ Mortos não batalham! Use /renascer.`);
    if (batalhaAtiva.has(from)) return enviar(jid, `❌ Você já está em batalha!`);

    const resultado = batalharMonstro(from);
    if (resultado.erro) return enviar(jid, resultado.erro);

    // Salvar batalha ativa para turnos
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
        `👹 ${b.monstro_nome}`,
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

  // ── TURNO BATALHA ─────────────────────────────────────────
  if (cmd === 'matar' && batalhaAtiva.has(from)) {
    return await processarTurnoBatalha(from, jid, 'matar');
  }
  if (cmd === 'fugir') {
    if (!batalhaAtiva.has(from)) {
      return enviar(jid, bloco('❌ ERRO 【⚠️】', [
        'Você não está em batalha!',
        '━━━━━━━━━━',
        '/batalha — Iniciar batalha'
      ]));
    }
    batalhaAtiva.delete(from);
    return enviar(jid, bloco('𝐅𝐔𝐆𝐀 【🏃】', ['Você fugiu da batalha!', '_Covarde... mas vivo._']));
  }
  if (cmd === 'mochila' && batalhaAtiva.has(from)) {
    return enviar(jid, bloco('𝐌𝐎𝐂𝐇𝐈𝐋𝐀 【🎒】', ['Use /usar [item] para usar um item!']));
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
      .slice(0, 4)
      .map(([k, r]) => `  ${r.emoji || '🗺️'} ${r.nome} (Nv. ${r.nivel_min}+) — >${'V' + r.nome.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}`);
    return enviar(jid, bloco('𝐌𝐄𝐔 𝐌𝐀𝐏𝐀 【📍】', [
      '📍 Você está em:',
      `  ${regiao_atual.emoji || '🗺️'} ${regiao_atual.nome}`,
      `  _Nível recomendado: ${regiao_atual.nivel_min}-${regiao_atual.nivel_max}_`,
      '',
      '🗺️ Regiões próximas:',
      ...proximas,
      '',
      '💡 /viajar >VXX — Viajar',
      '🗺️ /mapa — Ver todas regiões'
    ]));
  }

  if (cmd === 'mapa') {
    return enviar(jid, bloco('𝐌𝐀𝐏𝐀 𝐃𝐎 𝐈𝐌𝐏𝐄𝐑𝐈𝐔𝐒 【🗺️】', [
      '☁️ Céu Flutuante de Solvaryn — >VCS',
      '❄️ Tundra de Voryn — >VTV',
      '❄️ Cavernas de Gelo Eterno — >VCG',
      '⛰️ Pico de Kaldros — >VPK',
      '🏔️ Serra dos Titãs — >VST',
      '🐉 Montanha do Dragão — >VMD',
      '🌲 Floresta de Eryndal — >VFE',
      '🌑 Bosque das Sombras — >VBS',
      '👻 Mata dos Espíritos — >VMP',
      '🏚️ Ruínas de Aelthar — >VRA',
      '🌀 Portal dos Mundos — >VPM',
      '🏰 Valdris Capital — >VVC',
      '🌊 Ilhas de Marveth — >VIM',
      '🌀 Abismo do Mar Negro — >VAM',
      '⛪ Necrópole de Draktum — >VND',
      '🌿 Pântano Maldito — >VPL',
      '🗼 Torre do Caos — >VTC',
      '🌋 Vulcão de Ignareth — >VVI',
      '🔥 Planícies de Cinzas — >VPC',
      '🏜️ Deserto de Aresh — >VDA',
      '🏜️ Dunas do Esquecimento — >VDE',
      '━━━━━━━━━━',
      '💡 /viajar >VFE',
      '📍 /meumapa — Ver onde está'
    ]));
  }
  if (cmd === 'regioes') return enviar(jid, verRegioes());
  if (cmd === 'viajar') { if (!resto) return enviar(jid, `❌ Use: /viajar [região]`); return enviar(jid, viajar(from, resto)); }
  if (cmd === 'acampar') return enviar(jid, acampar(from));
  if (cmd === 'masmorras') return enviar(jid, verMasmorras(from));
  if (cmd === 'masmorra') { if (!resto) return enviar(jid, `❌ Use: /masmorra [nome]`); const r = entrarMasmorra(from, resto); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.texto); }

  // ── ECONOMIA ──────────────────────────────────────────────
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
    return enviar(jid, bloco('𝐎𝐕𝐎𝐒 【🥚】', [
      '🥚 Ovo Comum ($OOC) — 🪙 80',
      '🥚 Ovo Floresta ($OOF) — 🪙 200',
      '🥚 Ovo Pantanoso ($OOP) — 🪙 250',
      '🥚 Ovo das Ruínas ($OOR) — 🪙 300',
      '🥚 Ovo Trevas ($OOT) — 🪙 450',
      '🥚 Ovo Abismo ($OOAB) — 🪙 500',
      '🥚 Ovo Fogo ($OOFG) — 🪙 480',
      '🥚 Ovo Gelo ($OOG) — 🪙 480',
      '🥚 Ovo Tempestade ($OOTE) — 🪙 550',
      '🥚 Ovo Espectral ($OOE) — 🪙 600',
      '🥚 Ovo Maldito ($OOM) — 🪙 900',
      '🥚 Ovo Sagrado ($OOS) — 🪙 1200',
      '🥚 Ovo Dracônico ($OOD) — 🪙 1500',
      '🥚 Ovo Caos ($OOCA) — 🪙 1800',
      '🥚 Ovo Lendário ($OOL) — 🪙 5000',
      '🥚 Ovo Ancestral ($OOAN) — 🪙 8000',
      '🥚 Ovo Primordial ($OOPR) — 🪙 15000',
      '',
      '💡 /comprar $OOC'
    ]));
  }

  if (cmd === 'itens') {
    const sub = resto ? resto.toLowerCase().trim() : '';
    if (sub === 'p' || sub === 'pocoes' || sub === 'poções' || sub === 'poçoes') {
      return enviar(jid, bloco('𝐈𝐓𝐄𝐍𝐒 𝐃𝐄 𝐏𝐎𝐂̧𝐎̃𝐄𝐒 【🧪】', [
        '🧪 Poção HP Pequena (!IPP) — 🪙 50 | +30 HP',
        '🧪 Poção HP Média (!IPM) — 🪙 120 | +70 HP',
        '🧪 Poção HP Grande (!IPG) — 🪙 280 | +150 HP',
        '🧪 Poção HP Máxima (!IPX) — 🪙 800 | HP Total',
        '💧 Poção de Mana P (!IMP) — 🪙 60 | +50 Mana',
        '💧 Poção de Mana G (!IMG) — 🪙 200 | +200 Mana',
        '💧 Poção Mana Total (!IMT) — 🪙 600 | Mana Total',
        '━━━━━━━━━━',
        '💡 /comprar !IPP'
      ]));
    }
    if (sub === 'e' || sub === 'especiais' || sub === 'especial') {
      return enviar(jid, bloco('𝐈𝐓𝐄𝐍𝐒 𝐄𝐒𝐏𝐄𝐂𝐈𝐀𝐈𝐒 【✨】', [
        '🩹 Antídoto (!IAN) — 🪙 80 | Cura veneno',
        '✨ Purificador (!IPU) — 🪙 200 | Remove maldições',
        '💪 Elixir de Força (!IEF) — 🪙 500 | +Força temporário',
        '💎 Pedra de Ressurreição (!IPR) — 🪙 2000 | Ressuscita',
        '📚 Poção de XP (!IXP) — 🪙 800 | +XP',
        '🍀 Amuleto da Sorte (!IAS) — 🪙 1500 | +Sorte',
        '📜 Pergaminho Teletransporte (!IPT) — 🪙 300',
        '⭐ Elixir de Nível (!IEN) — 🪙 5000 | +1 Nível',
        '━━━━━━━━━━',
        '💡 /comprar !IAN'
      ]));
    }
    return enviar(jid, bloco('𝐈𝐓𝐄𝐍𝐒 【🧪】', [
      '🧪 /itens P — Poções',
      '✨ /itens E — Especiais'
    ]));
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
  // ── SISTEMA DE CÓDIGOS ──────────────────────────────────
  if (cmd === 'comprar' && resto && (resto[0] === '#' || resto[0] === '$' || resto[0] === '@' || resto[0] === '!')) {
    const sim = resto[0];
    const cod = resto.slice(1).toUpperCase().trim();

    const CODIGOS = {
      '#': {
        'CCC': 'carne crua', 'CCF': 'carne', 'CCA': 'carne assada',
        'CCR': 'carne rara', 'CCD': 'carne de dragao', 'CCS': 'carne sagrada',
        'CMS': 'mel simples', 'CMD': 'mel dourado', 'CMG': 'mel sagrado',
        'CAN': 'ambrosia', 'CNE': 'nectar',
        'CEB': 'erva do bosque', 'CEA': 'erva ancestral', 'CRA': 'raiz ancestral',
        'CEM': 'essencia magica', 'CEP': 'essencia primordial',
        'CPO': 'po de osso sagrado', 'CCRA': 'cristal de alma',
        'CFM': 'maca dourada', 'CFR': 'roma do hades', 'CFF': 'figo sagrado',
        'CFI': 'fruto da imortalidade', 'CFB': 'baga espiritual',
        'CAL': 'alga abissal', 'CCO': 'coral sagrado',
        'CPE': 'peixe espectral', 'CEL': 'escama de leviata',
        'CPL': 'pedra de luz', 'CCG': 'cristal de gelo', 'CMI': 'minerio sagrado'
      },
      '$': {
        'OOC': 'ovo comum', 'OOF': 'ovo floresta', 'OOP': 'ovo pantanoso',
        'OOR': 'ovo das ruinas', 'OOT': 'ovo trevas', 'OOAB': 'ovo abismo',
        'OOFG': 'ovo fogo', 'OOG': 'ovo gelo', 'OOTE': 'ovo tempestade',
        'OOE': 'ovo espectral', 'OOM': 'ovo maldito', 'OOS': 'ovo sagrado',
        'OOD': 'ovo draconico', 'OOCA': 'ovo caos', 'OOL': 'ovo lendario',
        'OOAN': 'ovo ancestral', 'OOPR': 'ovo primordial'
      },
      '!': {
        'IPP': 'pocao hp p', 'IPM': 'pocao hp m', 'IPG': 'pocao hp g', 'IPX': 'pocao hp maxima',
        'IMP': 'pocao mana p', 'IMG': 'pocao mana g', 'IMT': 'pocao mana total',
        'IAN': 'antidoto', 'IPU': 'purificador',
        'IEF': 'elixir de forca', 'IPR': 'pedra de ressurreicao',
        'IXP': 'pocao de xp', 'IAS': 'amuleto da sorte',
        'IPT': 'pergaminho de teletransporte', 'IEN': 'elixir de nivel'
      },
      '@': {
        // Contato
        'AEE': 'Espada Enferrujada', 'AML': 'Machadinha do Lenhador',
        'ACM': 'Clava de Madeira', 'AMV': 'Martelo de Ferro Velho',
        'AEF': 'Espada de Ferro', 'AMG': 'Machado de Guerra',
        'AEA': 'Espada de Aco', 'AMS': 'Machado Sanguinario',
        'AEA2': 'Espada das Almas', 'AMT': 'Manopla do Tita',
        'AEX': 'Excalibur', 'AED': 'Espada do Destino',
        'AEN': 'Espada Ancestral',
        // Distancia
        'AAS': 'Arco Simples', 'AZA': 'Zarabatana',
        'ACC': 'Chicote de Couro', 'AAC': 'Arco do Cacador',
        'AAF': 'Arco da Floresta', 'AAE': 'Arco Elfico',
        'AAV': 'Arco dos Ventos', 'AAM': 'Arco da Morte',
        'AAR': 'Arco dos Raios', 'AAT': 'Arco de Artemis',
        'AAK': 'Arco do Cosmos', 'AAN': 'Arco Ancestral',
        // Magicas
        'ACO': 'Cajado de Osso', 'ACA': 'Cajado Arcano',
        'ACN': 'Cajado da Natureza', 'ACG': 'Cajado Magico',
        'ACT': 'Cajado da Tempestade', 'ACB': 'Cajado Abissal',
        'ACP': 'Cajado do Tempo', 'ABO': 'Bastao de Odin',
        'ACE': 'Cajado da Eternidade', 'ACR': 'Cajado Ancestral'
      }
    };

    const mapa_cod = CODIGOS[sim];
    if (!mapa_cod) return enviar(jid, '❌ Símbolo inválido!');

    const item_real = mapa_cod[cod];
    if (!item_real) return enviar(jid, bloco('❌ CÓDIGO INVÁLIDO 【⚠️】', [
      `Código "${resto}" não encontrado!`,
      '━━━━━━━━━━',
      '💡 /comida — Ver códigos de comida',
      '💡 /ovos — Ver códigos de ovos'
    ]));

    if (sim === '$') {
      return enviar(jid, comprarOvo(from, item_real));
    } else if (sim === '@') {
      // Para armas - comprar arma
      return enviar(jid, comprarItem(from, item_real));
    } else {
      return enviar(jid, comprarItem(from, item_real));
    }
  }

  if (cmd === 'comprar') { if (!resto) return enviar(jid, `❌ Use: /comprar [item]`); return enviar(jid, comprarItem(from, resto)); }
  if (cmd === 'usar') { if (!resto) return enviar(jid, `❌ Use: /usar [item]`); return enviar(jid, usarItem(from, resto)); }
  if (cmd === 'equipar') { if (!resto) return enviar(jid, `❌ Use: /equipar [arma]`); return enviar(jid, equiparArma(from, resto)); }
  if (cmd === 'banco') return enviar(jid, verBanco(from));
  if (cmd === 'depositar') { const v = parseInt(args[0]); if (isNaN(v)) return enviar(jid, `❌ Use: /depositar [valor]`); return enviar(jid, depositar(from, v)); }
  if (cmd === 'sacar') { const v = parseInt(args[0]); if (isNaN(v)) return enviar(jid, `❌ Use: /sacar [valor]`); return enviar(jid, sacar(from, v)); }

  // ── PETS ──────────────────────────────────────────────────
  if (cmd === 'chocar') { const r = chocarOvo(from); return enviar(jid, r.texto || r.erro); }
  if (cmd === 'meupet') return enviar(jid, verPet(from));
  if (cmd === 'soltarpet') return enviar(jid, soltarPet(from));
  if (cmd === 'curarpet') return enviar(jid, curarPet(from));
  if (cmd === 'chamarpet') { const r = chamarPet(from); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.texto); }
  if (cmd === 'animais') return enviar(jid, verAnimais());
  if (cmd === 'meuanimal') return enviar(jid, verMeuAnimal(from));
  if (cmd === 'soltaranimal') return enviar(jid, soltarAnimal(from));
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
  if (cmd === 'renascer') {
    const j_r = db.getJogador(from);
    if (!j_r) return enviar(jid, '❌ Você não tem personagem!');
    if (!j_r.morto && j_r.hp > 0) return enviar(jid, bloco('❌ ERRO 【⚠️】', [
      'Você não está morto!',
      '━━━━━━━━━━',
      '/batalha — Ir lutar!'
    ]));

    const agora_r = Date.now();
    if (j_r.cooldown_renascer && agora_r - j_r.cooldown_renascer < 5 * 60 * 1000) {
      const restante_r = Math.ceil((5 * 60 * 1000 - (agora_r - j_r.cooldown_renascer)) / 60000);
      return enviar(jid, bloco('☠️ NEGADO 【❌】', [
        '_O Deus ainda não permitiu..._',
        `_Aguarde ${restante_r} minutos_`
      ]));
    }

    const chance_r = Math.random() * 100;
    if (chance_r > 70) {
      j_r.cooldown_renascer = agora_r;
      db.salvarJogador(from, j_r);
      return enviar(jid, bloco('☠️ NEGADO 【❌】', [
        '_Sua alma clama pelo retorno..._',
        '_O Deus observa..._',
        '━━━━━━━━━━',
        '☠️ _O Deus não permitiu._',
        '"Ainda não é sua hora."',
        '━━━━━━━━━━',
        '_Tente novamente em 5 minutos_'
      ]));
    }

    // Deus permitiu - entrar no fluxo de escolha de classe
    j_r.renascendo = true;
    db.salvarJogador(from, j_r);
    criando.set(from, { etapa: 'classe', dados: {}, renascendo: true });

    const lista_classes = Object.entries(CLASSES)
      .filter(([k]) => k !== 'ajudante_deus')
      .map(([k, c], i) => `${i+1}. ${c.emoji || '⚔️'} ${c.nome} — _${c.passiva}_`);

    const img_renascer = require('path').join(__dirname, 'renascer.jpg');
    const texto_renascer = bloco('✨ O DEUS PERMITIU 【🌟】', [
      '_Sua alma retorna ao IMPERIUS..._',
      '_Mas você volta diferente._',
      '━━━━━━━━━━',
      '_Escolha sua nova classe:_'
    ]);
    if (require('fs').existsSync(img_renascer)) {
      await sock.sendMessage(jid, {
        image: require('fs').readFileSync(img_renascer),
        caption: texto_renascer,
        mimetype: 'image/jpeg'
      });
    } else {
      await enviar(jid, texto_renascer);
    }
    return enviar(jid, bloco('𝐄𝐒𝐂𝐎𝐋𝐇𝐀 𝐒𝐔𝐀 𝐂𝐋𝐀𝐒𝐒𝐄 【⚔️】', [
      ...lista_classes,
      '━━━━━━━━━━',
      '🎰 /roleta — Tentar classe rara'
    ]));
  }

  if (cmd === 'renascer0') {
    const j_r0 = db.getJogador(from);
    if (!j_r0) return enviar(jid, '❌ Você não tem personagem!');
    try { db.deletarJogador(from); } catch(e) {
      // Reset manualmente se não tiver deletarJogador
      j_r0.nivel = 1; j_r0.xp = 0; j_r0.moedas = 101;
      j_r0.hp = 100; j_r0.hp_max = 100; j_r0.mana = 50; j_r0.mana_max = 50;
      j_r0.morto = false; j_r0.pet = null; j_r0.arma = null;
      j_r0.inventario = []; j_r0.kills = 0; j_r0.mortes = 0;
      db.salvarJogador(from, j_r0);
    }
    criando.delete(from);
    batalhaAtiva.delete(from);
    criando.set(from, { etapa: 'classe', dados: {} });
    await enviar(jid, bloco('🔄 RENASCIMENTO TOTAL 【☠️】', [
      '_Tudo que você era... apagado._',
      '_O IMPERIUS esqueceu seu nome._',
      '━━━━━━━━━━',
      '_Escolha quem você será agora:_'
    ]));
    const lista_classes0 = Object.entries(CLASSES)
      .filter(([k]) => k !== 'ajudante_deus')
      .map(([k, c], i) => `${i+1}. ${c.emoji || '⚔️'} ${c.nome} — _${c.passiva}_`);
    return enviar(jid, bloco('𝐄𝐒𝐂𝐎𝐋𝐇𝐀 𝐒𝐔𝐀 𝐂𝐋𝐀𝐒𝐒𝐄 【⚔️】', [
      ...lista_classes0,
      '━━━━━━━━━━',
      '🎰 /roleta — Tentar classe rara'
    ]));
  }
  if (cmd === 'reviver') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`); const r = reviverPorNecromante(from, a); if (typeof r === 'string') return enviar(jid, r); await enviar(jid, r.para_necromante); return enviar(jid, r.para_alvo, [a]); }
  if (cmd === 'aprovar') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione o servo!`); const r = aprovarAcaoServo(from, a, true); if (typeof r === 'string') return enviar(jid, r); return enviar(jid, r.para_servo, [a]); }
  if (cmd === 'negar') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione o servo!`); const r = aprovarAcaoServo(from, a, false); if (typeof r === 'string') return enviar(jid, r); return enviar(jid, r.para_servo, [a]); }
  if (cmd === 'libertar') return enviar(jid, liberarServo(from));

  // ── SOCIAL ────────────────────────────────────────────────
  if (cmd === 'ranking') return enviar(jid, verRanking());

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
  const CMDS_MORTO_PERMITIDOS = ['renascer', 'renascer0', 'ping', 'meuid', 
    'menu', 'info', 'lore', 'regras', 'dono', 'ajuda', 'dica', 'rpg'];
  if (!CMDS_MORTO_PERMITIDOS.includes(cmd)) {
    const j_morto = db.getJogador(from);
    if (j_morto && j_morto.morto) {
      return enviar(jid, bloco('💀 VOCÊ ESTÁ MORTO 【☠️】', [
        '_Sua alma vaga pelo IMPERIUS..._',
        '━━━━━━━━━━',
        '/renascer — Tentar voltar',
        '/renascer0 — Começar do zero'
      ]));
    }
  }

  // ── AGUARDANDO NOME DO PET ───────────────────────────
  if (nomeandoPet.has(from) && !texto.startsWith('/')) {
    const { criatura_id } = nomeandoPet.get(from);
    nomeandoPet.delete(from);
    const resultado = nomearPet(from, criatura_id, texto.trim());
    return enviar(jid, resultado);
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
        '💡 Use /batalha para iniciar!',
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
}

// ── TURNO DE BATALHA ──────────────────────────────────────
async function processarTurnoBatalha(from, jid, acao) {
  const batalha = batalhaAtiva.get(from);
  if (!batalha) return;

  const j = db.getJogador(from);
  if (!j) return;

  if (acao === 'matar' || acao === 'atacar') {
    const dano_jogador = Math.floor((j.for || 10) * (1 + Math.random()));
    const dano_monstro = Math.floor(Math.random() * 20 + 5);

    batalha.monstro_hp -= dano_jogador;
    j.hp = Math.max(0, j.hp - dano_monstro);
    db.salvarJogador(from, j);

    if (batalha.monstro_hp <= 0) {
      batalhaAtiva.delete(from);
      const xp_ganho = Math.floor(Math.random() * 50 + 20);
      const moedas = Math.floor(Math.random() * 30 + 10);
      db.adicionarXP(from, xp_ganho);
      db.adicionarMoedas(from, moedas);
      const hp_v = Math.floor((j.hp / j.hp_max) * 10);
      const barra_v = '█'.repeat(Math.max(0,hp_v)) + '░'.repeat(Math.max(0,10-hp_v));
      return enviar(jid, bloco('𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 【🏆】', [
        `⚔️ ${batalha.monstro_nome} derrotado!`,
        `💥 Você causou ${dano_jogador} de dano`,
        '━━━━━━━━━━',
        `⭐ XP: +${xp_ganho}`,
        `💰 Belarium: +${moedas}`,
        `❤️ HP: ${j.hp}/${j.hp_max}`,
        `[${barra_v}]`,
        '━━━━━━━━━━',
        '/batalha | /acampar | /perfil | /rpg'
      ]));
    }

    if (j.hp <= 0) {
      batalhaAtiva.delete(from);
      j.morto = true;
      j.hp = 0;
      j.mortes = (j.mortes || 0) + 1;
      db.salvarJogador(from, j);
      return enviar(jid, bloco('𝐃𝐄𝐑𝐑𝐎𝐓𝐀 【💀】', [
        `${j.nome} foi derrotado por ${batalha.monstro_nome}!`,
        '━━━━━━━━━━',
        '_O IMPERIUS registrou sua queda._',
        '/renascer — Voltar à vida',
        '/renascer0 — Começar do zero'
      ]));
    }

    const hp_pct = Math.floor((j.hp / j.hp_max) * 10);
    const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);
    const m_pct = Math.max(0, Math.floor((batalha.monstro_hp / batalha.monstro_hp_max) * 10));
    const m_barra = '█'.repeat(m_pct) + '░'.repeat(10 - m_pct);

    batalhaAtiva.set(from, batalha);
    return enviar(jid, bloco('𝐁𝐀𝐓𝐀𝐋𝐇𝐀 — 𝐓𝐔𝐑𝐍𝐎 【⚔️】', [
      `👹 ${batalha.monstro_nome}`,
      `❤️ HP: ${batalha.monstro_hp}/${batalha.monstro_hp_max}`,
      `[${m_barra}]`,
      '━━━━━━━━━━',
      `👤 ${j.nome}`,
      `💥 Você causou ${dano_jogador}`,
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
    estado.dados.nome = texto;
    estado.etapa = 'genero';
    criando.set(from, estado);
    return enviar(jid, bloco('𝐍𝐎𝐌𝐄 𝐃𝐄𝐅𝐈𝐍𝐈𝐃𝐎 【✅】', [
      `Nome: ${texto}`,
      '━━━━━━━━━━',
      '⚧️ Qual o gênero do personagem?',
      '1️⃣ Masculino',
      '2️⃣ Feminino',
      '3️⃣ Outro'
    ]));
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
          '/batalha — Voltar a lutar'
        ]));
      }
    }

    db.criarJogador(from, whatsapp_nome, classe, nome, idade, historia, classeData);
    const moedas_iniciais = classeData.moedas_iniciais || 0;
    db.adicionarMoedas(from, 1 + moedas_iniciais);

    // Salvar características no jogador
    const j = db.getJogador(from);
    if (j) {
      j.genero = genero || 'outro';
      j.caracteristicas = caracteristicas || '';
      j.imagem_url = null;
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
      '💰 Belarium: 101',
      '🗺️ Região: Valdris',
      '⭐ Nível: 1',
      '━━━━━━━━━━',
      '_Bem-vindo ao IMPERIUS!_',
      '⚔️ Evolua ou morra.'
    ]);

    await enviar(jid, ficha_txt);

    return enviar(jid, bloco('𝐏𝐑𝐎́𝐗𝐈𝐌𝐎𝐒 𝐏𝐀𝐒𝐒𝐎𝐒 【📋】', [
      `Bem-vindo, ${nome}! O que fazer agora?`,
      '━━━━━━━━━━',
      '⚔️ /batalha — Sua primeira batalha!',
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
console.log('🚀 Iniciando IMPERIUS v4.0...');
conectar().catch(console.error);
process.on('uncaughtException', (err) => console.error('Erro não tratado:', err));
process.on('unhandledRejection', (err) => console.error('Promise rejeitada:', err));
