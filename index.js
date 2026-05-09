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
const { verLojaOvos, chocarOvo, verPet, chamarPet, soltarPet, curarPet, verAnimais, adotarAnimal, soltarAnimal, verMeuAnimal } = require('./animals');
const { provocarDeus, aceitarEventoDeus, ignorarDeus, atacarDeus, pedirAjuda, aceitarAjuda, fugirDeus, deusDescansar, statusEvento } = require('./god');
const { criarGuilda, verGuilda, convidarGuilda, aceitarGuilda, sairGuilda, rankingGuildas } = require('./guild');
const { verMasmorras, entrarMasmorra, acampar, pedirCasamento, aceitarCasamento, divorciar, loginDiario } = require('./dungeon');
const { CLASSES, ARMAS } = require('./gameData');

// ── CONFIGURAÇÃO ──────────────────────────────────────────
const DONO_NUMERO = '5567998161300';
const DONO_ID = `${DONO_NUMERO}@s.whatsapp.net`;
const PREFIX = '/';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

const criando = new Map();
const pendentes_convite = new Map();
const pendentes_casamento = new Map();
const batalhas_ativas = new Map();

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
  'infoarmas': ['infoarmas', 'infoarma', 'armas', 'raridades'],
  'criar': ['criar', 'crar', 'crair'],
  'roleta': ['roleta', 'rolet', 'rolta'],
  'confirmarroleta': ['confirmarroleta', 'confirmaroleta', 'confirmar'],
  'perfil': ['perfil', 'perfi', 'perfill', 'perf'],
  'classe': ['classe', 'class', 'clases'],
  'inventario': ['inventario', 'inventaio', 'invetario', 'inv'],
  'conquistas': ['conquistas', 'conquista', 'conq'],
  'titulos': ['titulos', 'titulo', 'titulos'],
  'usartitulo': ['usartitulo', 'usatitulo', 'equipartitulo'],
  'minhaarma': ['minhaarma', 'arma', 'minhaarm'],
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
};

function resolverCmd(cmd_raw) {
  const n = normalizar(cmd_raw);
  for (const [cmd_real, variantes] of Object.entries(ALIASES)) {
    if (variantes.includes(n)) return cmd_real;
  }
  // Busca aproximada — se começa igual
  for (const [cmd_real, variantes] of Object.entries(ALIASES)) {
    if (variantes.some(v => v.startsWith(n) || n.startsWith(v))) return cmd_real;
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
    if (batalhas_ativas.has(from)) await processarTurnoBatalha(from, jid, texto);
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
    await sock.sendMessage(jid, { text: menu_txt });
    return;
  }
  // ── MENU OLD ──────────────────────────────────────────────

  // ── RPG ───────────────────────────────────────────────────
  if (cmd === 'rpg') {
    return enviar(jid,
      `${S.topo}\n${S.titulo('𝐈𝐌𝐏𝐄𝐑𝐈𝐔𝐒 ⚔️')}\n${S.baixo}\n\n` +
      bloco('𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐆𝐄𝐌 【👤】', [
        '👤 /criar', '🎰 /roleta', '👁️ /perfil',
        '🎭 /classe', '🎒 /inventario', '🏆 /conquistas',
        '⭐ /titulos', '🐾 /meupet', '🦁 /meuanimal'
      ]) + '\n\n' +
      bloco('𝐁𝐀𝐓𝐀𝐋𝐇𝐀 【⚔️】', [
        '⚔️ /batalha', '💀 /boss', '👊 /atacar @jogador',
        '🎯 /habilidade', '💫 /ultimate', '🐾 /chamarpet',
        '🎲 /d20', '🏰 /masmorras'
      ]) + '\n\n' +
      bloco('𝐌𝐔𝐍𝐃𝐎 【🌍】', [
        '🗺️ /mapa', '🚶 /viajar [região]',
        '📖 /regioes', '🏕️ /acampar'
      ]) + '\n\n' +
      bloco('𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀 【💰】', [
        '🛒 /loja', '🥚 /lojapets', '💸 /comprar [item]',
        '🧪 /usar [item]', '⚔️ /equipar [arma]',
        '💵 /vender [item]', '🏦 /banco'
      ]) + '\n\n' +
      bloco('𝐏𝐄𝐓𝐒 & 𝐀𝐍𝐈𝐌𝐀𝐈𝐒 【🐾】', [
        '🥚 /chocar', '🐾 /treinar', '🦁 /animais',
        '🦁 /adotar [animal]', '🔓 /soltarpet', '💊 /curarpet'
      ]) + '\n\n' +
      bloco('𝐒𝐎𝐂𝐈𝐀𝐋 【👥】', [
        '👑 /ranking', '📋 /missoes', '⚔️ /guilda',
        '🏰 /criarguilda [nome]', '💍 /casar @jogador', '📅 /login'
      ]) + '\n\n' +
      bloco('𝐒𝐀𝐂𝐑𝐈𝐅𝐈𝐂𝐈𝐎 & 𝐌𝐎𝐑𝐓𝐄 【🩸】', [
        '🩸 /sacrificio', '☀️ /renascer',
        '⚰️ /reviver @jogador', '🔓 /libertar'
      ]) + '\n\n' +
      bloco('𝐄𝐕𝐄𝐍𝐓𝐎 𝐃𝐈𝐕𝐈𝐍𝐎 【☠️】', [
        '😈 /provocardeus', '⚔️ /atacardeus',
        '👑 /pedirajuda', '📊 /statusevento'
      ]) + '\n\n' +
      `${S.topo}\n${S.titulo('⚔️ Evolua ou morra.')}\n${S.baixo}`
    );
  }

  // ── INFO ──────────────────────────────────────────────────
  if (cmd === 'info') {
    return enviar(jid,
      bloco('𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐎𝐄𝐒 【ℹ️】', [
        '🎮 IMPERIUS',
        '📌 Versão: 4.0.0',
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
    if (!resto) return enviar(jid, `❌ Use: /infoarma [raridade]`);
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
    return enviar(jid, menu_texto);
  }

  if (cmd === 'roleta') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Você não tem personagem! Use /criar.`);
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

    return enviar(jid,
      bloco('𝐏𝐄𝐑𝐅𝐈𝐋 【👤】', [
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
        `🦁 Animal: ${j.animal ? j.animal.nome : 'Nenhum'}`,
        '━━━━━━━━━━',
        `🗺️ ${j.regiao} | 💰 ${j.moedas}`,
        `💀 Kills: ${j.kills} | Mortes: ${j.mortes}`,
        `${j.morto ? '💀 MORTO' : '✅ VIVO'}`
      ])
    );
  }

  if (cmd === 'classe') { const j = db.getJogador(from); if (!j) return enviar(jid, `❌ Sem personagem!`); return enviar(jid, verClasse(from)); }
  if (cmd === 'inventario') return enviar(jid, verInventario(from));
  if (cmd === 'conquistas') return enviar(jid, verConquistas(from));
  if (cmd === 'titulos') return enviar(jid, verTitulos(from));
  if (cmd === 'usartitulo') { if (!resto) return enviar(jid, `❌ Use: /usartitulo [nome]`); return enviar(jid, usarTitulo(from, resto)); }
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
    if (batalhas_ativas.has(from)) return enviar(jid, `❌ Você já está em batalha!`);

    const resultado = batalharMonstro(from);
    if (resultado.erro) return enviar(jid, resultado.erro);

    // Salvar batalha ativa para turnos
    batalhas_ativas.set(from, {
      tipo: 'monstro',
      monstro_nome: resultado.monstro_nome || 'Monstro',
      monstro_hp: resultado.monstro_hp || 100,
      monstro_hp_max: resultado.monstro_hp_max || 100,
      turno: 1
    });

    const j2 = db.getJogador(from);
    const hp_pct = Math.floor((j2.hp / j2.hp_max) * 10);
    const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);
    const b = batalhas_ativas.get(from);
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
  if (cmd === 'matar' && batalhas_ativas.has(from)) {
    return await processarTurnoBatalha(from, jid, 'matar');
  }
  if (cmd === 'fugir' && batalhas_ativas.has(from)) {
    batalhas_ativas.delete(from);
    return enviar(jid, bloco('𝐅𝐔𝐆𝐀 【🏃】', ['Você fugiu da batalha!', '_Covarde... mas vivo._']));
  }
  if (cmd === 'mochila' && batalhas_ativas.has(from)) {
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
  if (cmd === 'd20') { const d = rolarD20(); return enviar(jid, bloco('𝐃𝟐𝟎 【🎲】', [`Resultado: *${d}*`, d === 20 ? '⭐ ACERTO PERFEITO!' : d === 1 ? '💀 FALHA CATASTRÓFICA!' : d >= 15 ? '✅ Sucesso!' : '⚠️ Falha parcial'])); }
  if (cmd === 'dado') { const max = parseInt(args[0]) || 6; if (max < 2 || max > 1000) return enviar(jid, `❌ Use entre 2 e 1000.`); return enviar(jid, `🎲 D${max}: *${rand(1, max)}*`); }

  // ── MUNDO ─────────────────────────────────────────────────
  if (cmd === 'mapa') {
    const mapa_txt = verMapa();
    try {
      const https2 = require('https');
      const mapaUrl = 'https://i.imgur.com/yGxdkau.jpg';
      const mapaBuffer = await new Promise((resolve, reject) => {
        https2.get(mapaUrl, (res) => {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });
      await sock.sendMessage(jid, {
        image: mapaBuffer,
        caption: mapa_txt,
        mimetype: 'image/jpeg'
      });
    } catch {
      return enviar(jid, mapa_txt);
    }
    return;
  }
  if (cmd === 'regioes') return enviar(jid, verRegioes());
  if (cmd === 'viajar') { if (!resto) return enviar(jid, `❌ Use: /viajar [região]`); return enviar(jid, viajar(from, resto)); }
  if (cmd === 'acampar') return enviar(jid, acampar(from));
  if (cmd === 'masmorras') {
    const j_mas = db.getJogador(from);
    if (!j_mas) return enviar(jid, `❌ Você não tem personagem!`);
    const txt_mas = verMasmorras(from);
    return enviar(jid, txt_mas);
  }
  if (cmd === 'masmorra') {
    if (!resto) return enviar(jid, bloco('🏰 MASMORRAS', ['Use: /masmorra [nome]', '━━━━━━━━━━', 'Ex: /masmorra caverna', 'Use /masmorras para ver a lista!']));
    const r_mas = entrarMasmorra(from, resto);
    if (r_mas.erro) return enviar(jid, r_mas.erro);
    return enviar(jid, r_mas.texto);
  }

  // ── ECONOMIA ──────────────────────────────────────────────
  if (cmd === 'loja') return enviar(jid, verLoja());
  if (cmd === 'lojapets') return enviar(jid, verLojaOvos());
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
  if (cmd === 'renascer') return enviar(jid, renascer(from));
  if (cmd === 'reviver') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`); const r = reviverPorNecromante(from, a); if (typeof r === 'string') return enviar(jid, r); await enviar(jid, r.para_necromante); return enviar(jid, r.para_alvo, [a]); }
  if (cmd === 'aprovar') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione o servo!`); const r = aprovarAcaoServo(from, a, true); if (typeof r === 'string') return enviar(jid, r); return enviar(jid, r.para_servo, [a]); }
  if (cmd === 'negar') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione o servo!`); const r = aprovarAcaoServo(from, a, false); if (typeof r === 'string') return enviar(jid, r); return enviar(jid, r.para_servo, [a]); }
  if (cmd === 'libertar') return enviar(jid, liberarServo(from));

  // ── SOCIAL ────────────────────────────────────────────────
  if (cmd === 'ranking') return enviar(jid, verRanking());
  if (cmd === 'missoes') return enviar(jid, verMissoes(from));
  if (cmd === 'login') return enviar(jid, loginDiario(from));
  if (cmd === 'guilda') return enviar(jid, verGuilda(from));
  if (cmd === 'rankingguildas') return enviar(jid, rankingGuildas());
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

  // ── SISTEMA DO DEUS ── Dono não pode agir como mortal ────
  if (isDono(from)) {
    // Lista de comandos permitidos para o Dono sem encarnação
    const CMDS_DEUS = ['deus','adm','aceitardeus','ignorardeus','deusdescansar',
      'darmoedas','tirarmoedas','matar','dar','abencoar','amaldicoar',
      'aceitarsacrificio','recusarsacrificio','sacrificios','encarnar',
      'ascender','evento','status','menu','rpg','info','lore','mapa',
      'regras','dono','ajuda','infoarmas','infoarma','ranking','statusevento'];
    
    if (!CMDS_DEUS.includes(cmd)) {
      return enviar(jid, bloco('☠️ VOCÊ É O DEUS 【👑】', [
        'Você não pode agir como mortal!',
        '━━━━━━━━━━',
        '🌟 Para interagir no mundo:',
        '/encarnar [nome] — Encarnar em mortal',
        '━━━━━━━━━━',
        '👑 Seus poderes divinos:',
        '/deus — Menu do Deus',
        '/aceitardeus — Aceitar provocação',
        '/deusdescansar — Encerrar evento',
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

  if (cmd === 'matar') { const a = extrairMencao(resto, msg); if (!a) return enviar(jid, `❌ Mencione um jogador!`); const r = matarJogador(a, args.slice(1).join(' ')); if (r.erro) return enviar(jid, r.erro); return enviar(jid, r.msg, [a]); }
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
  const batalha = batalhas_ativas.get(from);
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
      batalhas_ativas.delete(from);
      const xp_ganho = Math.floor(Math.random() * 50 + 20);
      const moedas = Math.floor(Math.random() * 30 + 10);
      db.adicionarXP(from, xp_ganho);
      db.adicionarMoedas(from, moedas);
      return enviar(jid, bloco('𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 【🏆】', [
        `⚔️ ${batalha.monstro_nome} derrotado!`,
        `💥 Você causou ${dano_jogador} de dano`,
        '━━━━━━━━━━',
        `⭐ XP: +${xp_ganho}`,
        `💰 Moedas: +${moedas}`,
        `❤️ HP: ${j.hp}/${j.hp_max}`
      ]));
    }

    if (j.hp <= 0) {
      batalhas_ativas.delete(from);
      return enviar(jid, bloco('𝐃𝐄𝐑𝐑𝐎𝐓𝐀 【💀】', [
        `Você foi derrotado por ${batalha.monstro_nome}!`,
        'Use /renascer para voltar.'
      ]));
    }

    const hp_pct = Math.floor((j.hp / j.hp_max) * 10);
    const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);
    const m_pct = Math.max(0, Math.floor((batalha.monstro_hp / batalha.monstro_hp_max) * 10));
    const m_barra = '█'.repeat(m_pct) + '░'.repeat(10 - m_pct);

    batalhas_ativas.set(from, batalha);
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
    estado.etapa = 'idade';
    criando.set(from, estado);
    return enviar(jid, bloco('𝐍𝐎𝐌𝐄 𝐃𝐄𝐅𝐈𝐍𝐈𝐃𝐎 【✅】', [`Nome: ${texto}`, '━━━━━━━━━━', '📅 Qual a idade do personagem?']));
  }

  if (estado.etapa === 'idade') {
    const idade = parseInt(texto);
    if (isNaN(idade) || idade < 1 || idade > 9999) return enviar(jid, `❌ Digite uma idade válida.`);
    estado.dados.idade = idade;
    estado.etapa = 'historia';
    criando.set(from, estado);
    return enviar(jid, bloco('𝐈𝐃𝐀𝐃𝐄 𝐃𝐄𝐅𝐈𝐍𝐈𝐃𝐀 【✅】', [`Idade: ${idade}`, '━━━━━━━━━━', '📖 Escreva a história do personagem:']));
  }

  if (estado.etapa === 'historia') {
    estado.dados.historia = texto;
    criando.delete(from);
    const { classe, nome, idade, historia } = estado.dados;
    const classeData = CLASSES[classe];
    const whatsapp_nome = msg.pushName || 'Aventureiro';
    const novo_j = db.criarJogador(from, whatsapp_nome, classe, nome, idade, historia, classeData);
    // Dar moeda comemorativa
    db.adicionarMoedas(from, 1);

    await enviar(jid, bloco('𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐆𝐄𝐌 𝐂𝐑𝐈𝐀𝐃𝐎 【⚔️】', [
      `👤 ${nome}`,
      `🎭 ${classeData.nome}`,
      `📅 ${idade} anos`,
      `📖 _${historia}_`,
      '━━━━━━━━━━',
      `❤️ HP: ${classeData.hp}`,
      `💧 Mana: ${classeData.mana}`,
      `🛡️ Passiva: ${classeData.passiva}`,
      '━━━━━━━━━━',
      '💰 Moedas: 101 (100 + 🎖️ 1 Moeda Comemorativa)',
      '🗺️ Região: Valdris',
      '⭐ Nível: 1',
      '━━━━━━━━━━',
      '_Bem-vindo ao IMPERIUS!_',
      '⚔️ Evolua ou morra.'
    ]));
    return enviar(jid, bloco('𝐏𝐑𝐎́𝐗𝐈𝐌𝐎𝐒 𝐏𝐀𝐒𝐒𝐎𝐒 【📋】', [
      `Olá, ${nome}! O que fazer agora?`,
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
