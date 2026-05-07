// ============================================================
// IMPERIUS RPG v3.0 — BOT PRINCIPAL
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
const { verLoja, comprarItem, usarItem, equiparArma, verInventario, verBanco, depositar, sacar, venderItem } = require('./economy');
const { verRanking, verConquistas, verTitulos, usarTitulo, verMissoes, matarJogador, darItem, abencoarJogador, maldicionarJogador, eventoGlobal, statusBot } = require('./events');
const { criarSacrificio, aceitarSacrificio, recusarSacrificio, pedirSacrificioParceiro, aceitarMorteSacrificio, recusarMorteSacrificio, verSacrificiosPendentes } = require('./sacrifice');
const { encarnar, ascender, processarMorteEncarnacao } = require('./incarnation');
const { verLojaOvos, chocarOvo, verPet, chamarPet, soltarPet, curarPet, verAnimais, adotarAnimal, soltarAnimal, verMeuAnimal } = require('./animals');
const { provocarDeus, aceitarEventoDeus, ignorarDeus, atacarDeus, pedirAjuda, aceitarAjuda, fugirDeus, deusDescansar, statusEvento } = require('./god');
const { criarGuilda, verGuilda, convidarGuilda, aceitarGuilda, sairGuilda, rankingGuildas } = require('./guild');
const { verMasmorras, entrarMasmorra, acampar, pedirCasamento, aceitarCasamento, divorciar, loginDiario } = require('./dungeon');
const { CLASSES, ARMAS } = require('./gameData');

// ── CONFIGURAÇÃO ──────────────────────────────────────────
const DONO_ID = process.env.DONO_ID || '556796847913@s.whatsapp.net';
const PREFIX = '/';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

const criando = new Map();
const pendentes_convite = new Map();
const pendentes_casamento = new Map();

// ── BORDAS ────────────────────────────────────────────────
const T = '╔═★·°·❃·°·★·°·❃·°·★═╗';
const M = '╠══════════════════╣';
const B = '╚═★·°·❃·°·★·°·❃·°·★═╝';
const L = '╔══════════════════╗';
const F = '╚══════════════════╝';

// ── FUNÇÕES AUXILIARES ────────────────────────────────────
function isDono(id) {
  return id === DONO_ID || id.replace('@s.whatsapp.net','') === DONO_ID.replace('@s.whatsapp.net','');
}

function extrairMencao(texto, mensagem) {
  const mencoes = mensagem.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mencoes.length > 0) return mencoes[0];
  const match = texto.match(/@(\d+)/);
  return match ? `${match[1]}@s.whatsapp.net` : null;
}

function extrairNumero(jid) {
  return jid?.replace('@s.whatsapp.net','');
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
    browser: ['IMPERIUS RPG', 'Chrome', '1.0.0'],
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
      res.send(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111"><div style="text-align:center"><h2 style="color:white">IMPERIUS RPG — Escaneie o QR Code</h2><img src="${qrImg}" style="width:300px"/><p style="color:gray">Atualiza a cada 30s</p></div></body><script>setTimeout(()=>location.reload(),30000)</script></html>`);
    });

    const server = app.listen(3000, () => console.log('🌐 QR disponível na URL do Railway'));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') app.listen(3001);
    });

    sock.ev.on('connection.update', ({ qr }) => {
      if (qr) { qrAtual = qr; console.log('📱 QR Code atualizado! Acesse a URL do Railway para escanear.'); }
    });
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ IMPERIUS RPG v3.0 conectado!');
      tentativas_reconexao = 0;
    }
    if (connection === 'close') {
      const codigo = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const deve_reconectar = codigo !== DisconnectReason.loggedOut;
      console.log(`❌ Desconectado. Código: ${codigo}. Reconectando: ${deve_reconectar}`);
      if (deve_reconectar && tentativas_reconexao < MAX_TENTATIVAS) {
        tentativas_reconexao++;
        const delay = Math.min(5000 * tentativas_reconexao, 60000);
        console.log(`🔄 Tentativa ${tentativas_reconexao}/${MAX_TENTATIVAS} em ${delay/1000}s...`);
        setTimeout(conectar, delay);
      } else if (codigo === DisconnectReason.loggedOut) {
        console.log('🚫 Sessão expirada. Reiniciando...');
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

// ── PROCESSADOR DE MENSAGENS ──────────────────────────────
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
    return;
  }

  const [cmd_raw, ...args] = texto.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = cmd_raw.toLowerCase();
  const resto = args.join(' ');

  // ── MENU ─────────────────────────────────────────────────
  if (cmd === 'menu') {
    const j = db.getJogador(from);
    const hora = horaAtual();
    const num = extrairNumero(from);
    return enviar(jid, `${T}\n      ⚔️ IMPERIUS RPG ⚔️\n${B}\n\n${L}\n★★★★★\nOiê, ${j ? j.nome : 'Aventureiro'}! 👋\n★ Número: ${num}\n★ Nível: ${j ? (j.nivel || 1) : '—'} ${j?.imperador ? '👑' : ''}\n★ Classe: ${j ? CLASSES[j.classe]?.nome || j.classe : '—'}\n★ Hora: ${hora}\n★ Versão: 3.0.0\n★ Dono: JUVENT 👑\n★★★★★\n${F}\n\n${L}\n║ 📋 GERAL\n${M}\n║ ℹ️ /info — Informações\n║ 📚 /lore — História\n║ 🗺️ /mapa — Mapa\n║ 📜 /regras — Regras\n║ 👑 /dono — O Criador\n║ 🆘 /ajuda — Suporte\n║ 📖 /infoarmas — Armas\n${F}\n\n${L}\n║ 👤 PERSONAGEM\n${M}\n║ 👤 /criar — Criar personagem\n║ 🎰 /roleta — Classe rara\n║ 👁️ /perfil — Sua ficha\n║ 🎭 /classe — Info da classe\n║ 🎒 /inventario — Inventário\n║ 🏆 /conquistas — Conquistas\n║ ⭐ /titulos — Títulos\n║ 🐾 /meupet — Ver seu pet\n║ 🦁 /meuanimal — Ver animal\n${F}\n\n${L}\n║ ⚔️ BATALHA\n${M}\n║ ⚔️ /batalha — Lutar\n║ 💀 /boss — Enfrentar boss\n║ 👊 /atacar @jogador — PvP\n║ 🎯 /habilidade — Habilidade\n║ 💫 /ultimate — Ultimate\n║ 🐾 /chamarpet — Chamar pet\n║ 🎲 /d20 — Rolar D20\n║ 🎰 /dado [N] — Rolar dado\n║ 🏰 /masmorras — Masmorras\n${F}\n\n${L}\n║ 🌍 MUNDO\n${M}\n║ 🗺️ /mapa — Ver mapa\n║ 🚶 /viajar [região] — Viajar\n║ 📖 /regioes — Regiões\n║ 🏕️ /acampar — Descansar\n${F}\n\n${L}\n║ 💰 ECONOMIA\n${M}\n║ 🛒 /loja — Loja\n║ 🥚 /lojapets — Ovos\n║ 💸 /comprar [item]\n║ 🧪 /usar [item]\n║ ⚔️ /equipar [arma]\n║ 💵 /vender [item]\n║ 🏦 /banco — Ver banco\n║ 💰 /depositar [valor]\n║ 💸 /sacar [valor]\n${F}\n\n${L}\n║ 🐾 PETS & ANIMAIS\n${M}\n║ 🥚 /chocar — Chocar ovo\n║ 🐾 /treinar — Treinar pet\n║ 🦁 /animais — Ver animais\n║ 🦁 /adotar [animal]\n║ 🔓 /soltarpet\n║ 🔓 /soltaranimal\n║ 💊 /curarpet\n${F}\n\n${L}\n║ 👥 SOCIAL\n${M}\n║ 👑 /ranking — Top jogadores\n║ 📋 /missoes — Missões\n║ ⚔️ /guilda — Ver guilda\n║ 🏰 /criarguilda [nome]\n║ 💍 /casar @jogador\n║ 📅 /login — Login diário\n║ 🏆 /rankingguildas\n${F}\n\n${L}\n║ 🩸 SACRIFÍCIO & MORTE\n${M}\n║ 🩸 /sacrificio\n║ ☀️ /renascer\n║ ⚰️ /reviver @jogador\n║ 🔓 /libertar\n${F}\n\n${L}\n║ ☠️ EVENTO DIVINO\n${M}\n║ 😈 /provocardeus\n║ ⚔️ /atacardeus\n║ 👑 /pedirajuda\n║ 📊 /statusevento\n${F}\n\n${T}\n    ⚔️ Evolua ou morra. ⚔️\n${B}`);
  }

  // ── INFO ──────────────────────────────────────────────────
  if (cmd === 'info') {
    return enviar(jid, `${T}\n  ℹ️ INFORMAÇÕES\n${B}\n\n${L}\n║ 🎮 IMPERIUS RPG\n║ 📌 Versão: 3.0.0\n║ 🌍 Bot RPG para WhatsApp\n${M}\n║ 👑 Criado por: JUVENT\n║ 🤝 Auxiliado por: Arabella\n${M}\n║ 📖 SOBRE:\n║ Bot RPG completo com\n║ batalhas, pets, guildas,\n║ casamento, masmorras e\n║ muito mais!\n${M}\n║ 🆘 /ajuda\n║ 👑 /dono\n║ 📚 /lore\n${F}`);
  }

  if (cmd === 'lore') {
    return enviar(jid, `${T}\n   📚 LORE DO IMPERIUS\n${B}\n\n${L}\n║ _No início havia apenas_\n║ _o Caos._\n║\n║ _Do Caos surgiu Imperius_\n║ _— um mundo moldado por_\n║ _sangue, poder e ambição._\n║\n║ _Os deuses criaram os_\n║ _mortais para guerrear._\n║ _Os mortais criaram heróis_\n║ _para sobreviver._\n║ _Os heróis criaram lendas_\n║ _para serem lembrados._\n║\n║ _E você..._\n║ _o que vai criar?_\n${M}\n║ ⚔️ Evolua ou morra.\n${F}`);
  }

  if (cmd === 'regras') {
    return enviar(jid, `${T}\n   📜 REGRAS DO IMPERIUS\n${B}\n\n${L}\n║ 1️⃣ Respeite todos\n║ 2️⃣ Não abuse de bugs\n║ 3️⃣ PvP é livre\n║ 4️⃣ Mortes são permanentes\n║ 5️⃣ O Dono tem poder total\n║ 6️⃣ Sacrifícios irrevogáveis\n║ 7️⃣ Classes raras: roleta\n║ 8️⃣ Pets: ovos e chocagem\n║ 9️⃣ Guildas: respeito mútuo\n║ 🔟 Deus: nunca é derrotado\n${M}\n║ ⚔️ Evolua ou morra.\n${F}`);
  }

  if (cmd === 'dono') {
    return enviar(jid, `${T}\n   👑 DONO DO IMPERIUS\n${B}\n\n${L}\n║ 🧙‍♂️ JUVENT 👑\n║ O Arquiteto do Caos.\n║ O Primeiro Deus.\n${M}\n║ 📜 LORE:\n║ _Antes do mundo existir,_\n║ _havia apenas o silêncio._\n║ _JUVENT rompeu esse silêncio_\n║ _com sangue e fogo._\n║ _Ele não criou o IMPERIUS_\n║ _— ele O É._\n${M}\n║ ☠️ ARMA DE DEUS:\n║ 🌑 Foice da Criação\n║ Raridade: ☠️ DEUS\n║ Dano: INFINITO\n║ _Impossível de obter_\n${M}\n║ 🌟 HABILIDADES:\n║ • Corte da Criação\n║ • Julgamento Divino\n║ • Manifestação do Deus\n║ • Renascimento do Mundo\n${M}\n║ 📩 +55 67 99816-1300\n${M}\n║ _"Eu não criei esta arma_\n║ _para vencer batalhas..._\n║ _Eu a criei para lembrar_\n║ _que sou o começo e o fim."_\n║ — JUVENT 💀\n${F}`);
  }

  if (cmd === 'ajuda') {
    return enviar(jid, `${T}\n   🆘 AJUDA — IMPERIUS\n${B}\n\n${L}\n║ 🤔 Está perdido?\n║ _Não há vergonha nisso..._\n║ _Mas há vergonha em fraco._\n${M}\n║ ❓ DÚVIDAS FREQUENTES:\n${M}\n║ 🔸 Como criar personagem?\n║ _Digite /criar_\n║\n║ 🔸 Como batalhar?\n║ _Digite /batalha_\n║\n║ 🔸 Como ganhar moedas?\n║ _Batalhe e complete missões_\n║\n║ 🔸 Morri, e agora?\n║ _Digite /renascer_\n║\n║ 🔸 Como ter pet?\n║ _Compre ovo na /lojapets_\n║ _e use /chocar_\n║\n║ 🔸 Como entrar em guilda?\n║ _Peça convite ao líder_\n${M}\n║ 📩 +55 67 99816-1300\n${M}\n║ ⚔️ Evolua ou morra.\n${F}`);
  }

  if (cmd === 'infoarmas') {
    return enviar(jid, `${T}\n   📖 RARIDADES DE ARMAS\n${B}\n\n${L}\n║ ⬜ Comum\n║ 🟫 Inferior\n║ 🟩 Incomum\n║ 🟦 Raro\n║ 🟪 Épico\n║ 🟨 Lendário\n║ 🔶 Ancestral\n║ 🔷 Arcana\n║ 🔴 Primordial\n║ 🟠 Abissal\n║ ⚫ Sombria\n║ 🌑 Amaldiçoada\n║ 🌟 Celestial\n║ ☀️ Solar\n║ 🌊 Abissal Marinha\n║ ❄️ Glacial Eterna\n║ 🔥 Infernal\n║ ⚡ Relâmpago Divino\n║ 🌈 Primeva\n║ ☠️ DEUS\n${M}\n║ 🔍 /infoarma [raridade]\n║ para ver armas detalhadas!\n║ Ex: /infoarma raro\n${M}\n║ ☠️ Armas acima de Primordial\n║ são impossíveis de obter.\n${F}`);
  }

  if (cmd === 'infoarma') {
    if (!resto) return enviar(jid, `❌ Use: /infoarma [raridade]\nEx: /infoarma raro`);
    const { ARMAS } = require('./gameData');
    const raridade_busca = resto.toLowerCase();
    const mapa_raridades = {
      'comum': '⬜ Comum', 'inferior': '🟫 Inferior', 'incomum': '🟩 Incomum',
      'raro': '🟦 Raro', 'epico': '🟪 Épico', 'épico': '🟪 Épico',
      'lendario': '🟨 Lendário', 'lendário': '🟨 Lendário',
      'ancestral': '🔶 Ancestral', 'arcana': '🔷 Arcana', 'arcano': '🔷 Arcana',
      'primordial': '🔴 Primordial', 'abissal': '🟠 Abissal',
      'sombria': '⚫ Sombria', 'amaldicada': '🌑 Amaldiçoada', 'amaldiçoada': '🌑 Amaldiçoada',
      'celestial': '🌟 Celestial', 'solar': '☀️ Solar',
      'abissal marinha': '🌊 Abissal Marinha', 'glacial': '❄️ Glacial Eterna',
      'infernal': '🔥 Infernal', 'relampago': '⚡ Relâmpago Divino', 'relâmpago': '⚡ Relâmpago Divino',
      'primeva': '🌈 Primeva', 'deus': '☠️ DEUS'
    };
    const raridade = mapa_raridades[raridade_busca];
    if (!raridade) return enviar(jid, `❌ Raridade não encontrada!\nUse /infoarmas para ver a lista.`);
    const armas_filtradas = ARMAS.filter(a => a.raridade === raridade);
    if (armas_filtradas.length === 0) return enviar(jid, `❌ Nenhuma arma nessa raridade!`);
    let texto = `${T}\n   ${raridade}\n${B}\n\n${L}\n`;
    armas_filtradas.forEach((a, i) => {
      texto += `║ ${a.nome}\n║   ⚔️ Dano: ${a.dano[0]}-${a.dano[1]}\n`;
      if (a.preco > 0) texto += `║   💰 Preço: ${a.preco}\n`;
      if (a.exclusiva) texto += `║   🔒 Exclusiva (não vendida)\n`;
      if (i < armas_filtradas.length - 1) texto += `${M}\n`;
    });
    texto += `${F}\n\n_Total: ${armas_filtradas.length} armas_`;
    return enviar(jid, texto);
  }

  // ── CRIAR PERSONAGEM ──────────────────────────────────────
  if (cmd === 'criar') {
    const existe = db.getJogador(from);
    if (existe && !existe.morto) return enviar(jid, `${T}\n❌ Você já tem personagem!\nUse /perfil para ver.\n${B}`);
    const { texto: menu_texto } = menuClasses();
    criando.set(from, { etapa: 'classe', dados: {} });
    return enviar(jid, menu_texto);
  }

  if (cmd === 'roleta') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `${T}\n❌ Você não tem personagem!\nUse /criar.\n${B}`);
    return enviar(jid, `${T}\n   🎰 ROLETA DO DESTINO\n${B}\n\n${L}\n║ ⚠️ ATENÇÃO!\n║ _A roleta é imprevisível..._\n║ Você pode ganhar classe rara\n║ mas perderá a atual!\n${M}\n║ 💀 REGRAS:\n║ • Perde classe atual\n║ • Cooldown 24h\n║ • Sem volta atrás\n${M}\n║ ⚠️ /confirmarroleta\n║ ❌ /cancelar\n${F}`);
  }

  if (cmd === 'confirmarroleta') {
    const resultado = girarRoleta(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto);
  }

  // ── PERFIL ────────────────────────────────────────────────
  if (cmd === 'perfil') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `${T}\n❌ Você não tem personagem!\nUse /criar.\n${B}`);
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

    return enviar(jid, `${T}\n   ⚔️ IMPERIUS RPG ⚔️\n${B}\n\n${L}\n★★★★★\n👤 ${j.nome} ${j.imperador ? '👑' : ''}\n🏷️ ${j.titulo_ativo || 'Sem título'}\n★ Classe: ${CLASSES[j.classe]?.nome || j.classe}\n★ Nível: ${nivel} | Rank: ${j.rank || 'F'}\n★ XP: ${xp}/${xp_prox}\n★ [${barra_xp}]\n★★★★★\n${F}\n\n${L}\n║ ❤️ VIDA & MANA\n${M}\n║ ❤️ HP: ${j.hp}/${j.hp_max}\n║ [${barra_hp}]\n║ 💧 Mana: ${j.mana}/${j.mana_max}\n║ [${barra_mana}]\n${F}\n\n${L}\n║ 📊 ATRIBUTOS\n${M}\n║ 💪 FOR: ${j.for} | 🐆 DES: ${j.des}\n║ 🛡️ CON: ${j.con} | 🧠 INT: ${j.int}\n║ 🍀 Sorte: ${j.sorte} | ✝️ Fé: ${j.fe}\n${F}\n\n${L}\n║ ⚔️ EQUIPAMENTO\n${M}\n║ ⚔️ ${arma ? arma.nome : 'Sem arma'}\n${arma ? `║   Dano: ${arma.dano[0]}-${arma.dano[1]} | ${arma.raridade}\n` : ''}║ 🐾 Pet: ${j.pet ? j.pet.nome : 'Nenhum'}\n║ 🦁 Animal: ${j.animal ? j.animal.nome : 'Nenhum'}\n${F}\n\n${L}\n║ 🌍 MUNDO\n${M}\n║ 🗺️ Região: ${j.regiao}\n║ 💰 Moedas: ${j.moedas}\n║ 🏦 Banco: ${j.banco || 0}\n║ 💀 Kills: ${j.kills} | Mortes: ${j.mortes}\n║ 🏆 Conquistas: ${j.conquistas?.length || 0}\n║ ⚔️ Guilda: ${j.guilda_id ? '✅' : 'Sem guilda'}\n║ 💍 Casado: ${j.casado_com ? '✅' : 'Não'}\n${F}\n\n${T}\n║ ${j.morto ? '💀 STATUS: MORTO' : '✅ STATUS: VIVO'}\n${B}`);
  }

  if (cmd === 'classe') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Você não tem personagem!`);
    return enviar(jid, verClasse(from));
  }

  if (cmd === 'inventario') return enviar(jid, verInventario(from));
  if (cmd === 'conquistas') return enviar(jid, verConquistas(from));
  if (cmd === 'titulos') return enviar(jid, verTitulos(from));

  if (cmd === 'usartitulo') {
    if (!resto) return enviar(jid, `❌ Use: /usartitulo [nome]`);
    return enviar(jid, usarTitulo(from, resto));
  }

  if (cmd === 'minhaarma') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Você não tem personagem!`);
    const arma = ARMAS.find(a => a.id === j.arma);
    return enviar(jid, arma
      ? `${T}\n   ⚔️ SUA ARMA\n${B}\n\n${L}\n║ ${arma.nome}\n║ Raridade: ${arma.raridade}\n║ Dano: ${arma.dano[0]}-${arma.dano[1]}\n${F}`
      : `${T}\n❌ Sem arma equipada!\nCompre na /loja.\n${B}`);
  }

  // ── BATALHA ───────────────────────────────────────────────
  if (cmd === 'batalha') {
    const resultado = batalharMonstro(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.logs.join('\n'));
  }

  if (cmd === 'boss') {
    const resultado = batalharBoss(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.logs.join('\n'));
  }

  if (cmd === 'atacar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!\nEx: /atacar @jogador`);
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
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Você não tem personagem!`);
    const classeData = CLASSES[j.classe];
    const hab_key = Object.keys(classeData?.habilidades || {}).find(k =>
      k.toLowerCase().includes(resto.toLowerCase()) ||
      classeData.habilidades[k].nome.toLowerCase().includes(resto.toLowerCase())
    );
    if (!hab_key) return enviar(jid, `❌ Habilidade não encontrada!\nUse /classe para ver suas habilidades.`);
    const resultado = usarHabilidade(from, hab_key);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.logs.join('\n'));
  }

  if (cmd === 'ultimate') {
    const resultado = usarUltimate(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.logs.join('\n'));
  }

  if (cmd === 'd20') {
    const d = rolarD20();
    return enviar(jid, `${T}\n   🎲 ROLAR D20\n${B}\n\n${L}\n║ Resultado: *${d}*\n║ ${d === 20 ? '⭐ ACERTO PERFEITO!' : d === 1 ? '💀 FALHA CATASTRÓFICA!' : d >= 15 ? '✅ Sucesso!' : '⚠️ Falha parcial'}\n${F}`);
  }

  if (cmd === 'dado') {
    const max = parseInt(args[0]) || 6;
    if (max < 2 || max > 1000) return enviar(jid, `❌ Use entre 2 e 1000.`);
    return enviar(jid, `🎲 D${max}: *${rand(1, max)}*`);
  }

  // ── MUNDO ─────────────────────────────────────────────────
  if (cmd === 'mapa') {

  await sock.sendMessage(jid, {
    image: fs.readFileSync('./mapa.jpg'),
    caption: '🗺️ MAPA DO IMPERIUS'
  });

  return;
}
  if (cmd === 'regioes') return enviar(jid, verRegioes());

  if (cmd === 'viajar') {
    if (!resto) return enviar(jid, `❌ Use: /viajar [região]`);
    return enviar(jid, viajar(from, resto));
  }

  if (cmd === 'acampar') return enviar(jid, acampar(from));

  if (cmd === 'masmorras') return enviar(jid, verMasmorras(from));

  if (cmd === 'masmorra') {
    if (!resto) return enviar(jid, `❌ Use: /masmorra [nome]\nUse /masmorras para ver a lista.`);
    const resultado = entrarMasmorra(from, resto);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto);
  }

  // ── ECONOMIA ──────────────────────────────────────────────
  if (cmd === 'loja') return enviar(jid, verLoja());
  if (cmd === 'lojapets') return enviar(jid, verLojaOvos());

  if (cmd === 'comprar') {
    if (!resto) return enviar(jid, `❌ Use: /comprar [item]`);
    return enviar(jid, comprarItem(from, resto));
  }

  if (cmd === 'usar') {
    if (!resto) return enviar(jid, `❌ Use: /usar [item]`);
    return enviar(jid, usarItem(from, resto));
  }

  if (cmd === 'equipar') {
    if (!resto) return enviar(jid, `❌ Use: /equipar [arma]`);
    return enviar(jid, equiparArma(from, resto));
  }

  if (cmd === 'vender') {
    if (!resto) return enviar(jid, `❌ Use: /vender [item]`);
    return enviar(jid, typeof venderItem === 'function' ? venderItem(from, resto) : `❌ Sistema em manutenção!`);
  }

  if (cmd === 'banco') return enviar(jid, verBanco(from));

  if (cmd === 'depositar') {
    const valor = parseInt(args[0]);
    if (isNaN(valor)) return enviar(jid, `❌ Use: /depositar [valor]`);
    return enviar(jid, depositar(from, valor));
  }

  if (cmd === 'sacar') {
    const valor = parseInt(args[0]);
    if (isNaN(valor)) return enviar(jid, `❌ Use: /sacar [valor]`);
    return enviar(jid, sacar(from, valor));
  }

  // ── PETS ──────────────────────────────────────────────────
  if (cmd === 'chocar') return enviar(jid, (chocarOvo(from)).texto || (chocarOvo(from)).erro);
  if (cmd === 'meupet') return enviar(jid, verPet(from));
  if (cmd === 'soltarpet') return enviar(jid, soltarPet(from));
  if (cmd === 'curarpet') return enviar(jid, curarPet(from));

  if (cmd === 'chamarpet') {
    const resultado = chamarPet(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto);
  }

  // ── ANIMAIS ───────────────────────────────────────────────
  if (cmd === 'animais') return enviar(jid, verAnimais());
  if (cmd === 'meuanimal') return enviar(jid, verMeuAnimal(from));
  if (cmd === 'soltaranimal') return enviar(jid, soltarAnimal(from));

  if (cmd === 'adotar') {
    if (!resto) return enviar(jid, `❌ Use: /adotar [animal]\nUse /animais para ver a lista.`);
    return enviar(jid, adotarAnimal(from, resto));
  }

  // ── SACRIFÍCIO ────────────────────────────────────────────
  if (cmd === 'sacrificio') {
    const j = db.getJogador(from);
    if (!j) return enviar(jid, `❌ Você não tem personagem!`);
    const partes = resto.split('|');
    if (partes.length < 2) return enviar(jid, `${T}\n   🩸 SACRIFÍCIO\n${B}\n\n${L}\n║ Use:\n║ /sacrificio [oferta] | [pedido]\n${M}\n║ Ex:\n║ /sacrificio 500 moedas | força\n${F}`);
    const oferta = partes[0].trim();
    const pedido = partes[1].trim();
    const alvo_id = extrairMencao(oferta, msg);
    if (alvo_id) {
      const alvo = db.getJogador(alvo_id);
      if (!alvo) return enviar(jid, `❌ Jogador não encontrado!`);
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

  if (cmd === 'aceitarmorte') {
    const resultado = aceitarMorteSacrificio(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    await enviar(jid, resultado.msg_grupo);
    return enviar(jid, `⏳ Aguardando julgamento do Deus...`);
  }

  if (cmd === 'recusarmorte') {
    const resultado = recusarMorteSacrificio(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  // ── MORTE ─────────────────────────────────────────────────
  if (cmd === 'renascer') return enviar(jid, renascer(from));

  if (cmd === 'reviver') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    const resultado = reviverPorNecromante(from, alvo_id);
    if (typeof resultado === 'string') return enviar(jid, resultado);
    await enviar(jid, resultado.para_necromante);
    return enviar(jid, resultado.para_alvo, [alvo_id]);
  }

  if (cmd === 'aprovar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione o servo!`);
    const resultado = aprovarAcaoServo(from, alvo_id, true);
    if (typeof resultado === 'string') return enviar(jid, resultado);
    return enviar(jid, resultado.para_servo, [alvo_id]);
  }

  if (cmd === 'negar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione o servo!`);
    const resultado = aprovarAcaoServo(from, alvo_id, false);
    if (typeof resultado === 'string') return enviar(jid, resultado);
    return enviar(jid, resultado.para_servo, [alvo_id]);
  }

  if (cmd === 'libertar') return enviar(jid, liberarServo(from));

  // ── SOCIAL ────────────────────────────────────────────────
  if (cmd === 'ranking') return enviar(jid, verRanking());
  if (cmd === 'missoes') return enviar(jid, verMissoes(from));
  if (cmd === 'login') return enviar(jid, loginDiario(from));

  // ── GUILDAS ───────────────────────────────────────────────
  if (cmd === 'guilda') return enviar(jid, verGuilda(from));
  if (cmd === 'rankingguildas') return enviar(jid, rankingGuildas());
  if (cmd === 'sairguilda') return enviar(jid, sairGuilda(from));

  if (cmd === 'criarguilda') {
    if (!resto) return enviar(jid, `❌ Use: /criarguilda [nome]`);
    return enviar(jid, criarGuilda(from, resto));
  }

  if (cmd === 'convidar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    const resultado = convidarGuilda(from, alvo_id);
    if (resultado.erro) return enviar(jid, resultado.erro);
    pendentes_convite.set(alvo_id, { guilda_id: resultado.guilda_id, guilda_nome: resultado.guilda_nome });
    await enviar(jid, resultado.msg_lider);
    return enviar(jid, resultado.msg_alvo, [alvo_id]);
  }

  if (cmd === 'aceitarguilda') {
    const pendente = pendentes_convite.get(from);
    if (!pendente) return enviar(jid, `❌ Nenhum convite pendente!`);
    pendentes_convite.delete(from);
    return enviar(jid, aceitarGuilda(from, pendente.guilda_id, pendente.guilda_nome));
  }

  if (cmd === 'recusarguilda') {
    pendentes_convite.delete(from);
    return enviar(jid, `${T}\n❌ Convite recusado.\n${B}`);
  }

  // ── CASAMENTO ─────────────────────────────────────────────
  if (cmd === 'casar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!\nEx: /casar @jogador`);
    const resultado = pedirCasamento(from, alvo_id);
    if (resultado.erro) return enviar(jid, resultado.erro);
    pendentes_casamento.set(alvo_id, { proponente_id: from, proponente_nome: resultado.proponente_nome, custo: resultado.custo });
    await enviar(jid, resultado.msg_proponente);
    return enviar(jid, resultado.msg_alvo, [alvo_id]);
  }

  if (cmd === 'aceitarcasamento') {
    const pendente = pendentes_casamento.get(from);
    if (!pendente) return enviar(jid, `❌ Nenhuma proposta pendente!`);
    pendentes_casamento.delete(from);
    return enviar(jid, aceitarCasamento(from, pendente.proponente_id, pendente.proponente_nome, pendente.custo));
  }

  if (cmd === 'recusarcasamento') {
    pendentes_casamento.delete(from);
    return enviar(jid, `${T}\n💔 Proposta recusada.\n${B}`);
  }

  if (cmd === 'divorciar') return enviar(jid, divorciar(from));

  // ── EVENTO DEUS ───────────────────────────────────────────
  if (cmd === 'provocardeus') {
    const resultado = provocarDeus(from, jid);
    if (resultado.erro) return enviar(jid, resultado.erro);
    await enviar(jid, resultado.msg_grupo);
    return enviar(DONO_ID, resultado.msg_dono);
  }

  if (cmd === 'atacardeus') {
    const resultado = atacarDeus(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto);
  }

  if (cmd === 'pedirajuda') {
    const resultado = pedirAjuda(from, jid);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto, resultado.mencoes);
  }

  if (cmd === 'aceitarajuda') {
    const resultado = aceitarAjuda(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto);
  }

  if (cmd === 'fugirdeus') return enviar(jid, fugirDeus(from));
  if (cmd === 'statusevento') return enviar(jid, statusEvento());

  // ── ENCARNAÇÃO ────────────────────────────────────────────
  if (cmd === 'encarnar') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode encarnar.`);
    if (!resto) return enviar(jid, `❌ Use: /encarnar [nome]`);
    const resultado = encarnar(from, resto, jid);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  if (cmd === 'ascender') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode ascender.`);
    const resultado = ascender(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  // ── COMANDOS DO DONO ──────────────────────────────────────
  if (!isDono(from)) return;

  if (cmd === 'aceitardeus') {
    const resultado = aceitarEventoDeus(from, jid);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  if (cmd === 'ignorardeus') {
    const resultado = ignorarDeus(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  if (cmd === 'deusdescansar') {
    const resultado = deusDescansar(from, jid);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  if (cmd === 'matar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    const resultado = matarJogador(alvo_id, args.slice(1).join(' '));
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg, [alvo_id]);
  }

  if (cmd === 'dar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    const item = args.slice(1).join(' ');
    const resultado = darItem(alvo_id, item);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg, [alvo_id]);
  }

  if (cmd === 'abencoar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    const resultado = abencoarJogador(alvo_id, args.slice(1).join(' '));
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg, [alvo_id]);
  }

  if (cmd === 'amaldicoar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    const resultado = maldicionarJogador(alvo_id, args.slice(1).join(' '));
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg, [alvo_id]);
  }

  if (cmd === 'aceitarsacrificio') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /aceitarsacrificio @jogador [recompensa]`);
    const recompensa = args.slice(1).join(' ') || 'Bênção do Deus';
    const resultado = aceitarSacrificio(alvo_id, recompensa);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo, [alvo_id]);
  }

  if (cmd === 'recusarsacrificio') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Use: /recusarsacrificio @jogador`);
    const resultado = recusarSacrificio(alvo_id);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo, [alvo_id]);
  }

  if (cmd === 'sacrificios') return enviar(jid, verSacrificiosPendentes());
  if (cmd === 'evento') {
    if (!resto) return enviar(jid, `❌ Use: /evento [mensagem]`);
    return enviar(jid, eventoGlobal(resto));
  }
  if (cmd === 'status') return enviar(jid, statusBot());
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
    return enviar(jid, `${T}\n✅ Classe selecionada!\n${B}\n\n${L}\n║ ${CLASSES[classe_key].nome}\n║ _${CLASSES[classe_key].passiva}_\n${M}\n║ 👤 Qual o nome do\n║ seu personagem?\n${F}`);
  }

  if (estado.etapa === 'nome') {
    if (texto.length < 2 || texto.length > 20) return enviar(jid, `❌ Nome deve ter 2-20 caracteres.`);
    estado.dados.nome = texto;
    estado.etapa = 'idade';
    criando.set(from, estado);
    return enviar(jid, `${T}\n✅ Nome: ${texto}\n${B}\n\n${L}\n║ 📅 Qual a idade do\n║ seu personagem?\n${F}`);
  }

  if (estado.etapa === 'idade') {
    const idade = parseInt(texto);
    if (isNaN(idade) || idade < 1 || idade > 9999) return enviar(jid, `❌ Digite uma idade válida.`);
    estado.dados.idade = idade;
    estado.etapa = 'historia';
    criando.set(from, estado);
    return enviar(jid, `${T}\n✅ Idade: ${idade}\n${B}\n\n${L}\n║ 📖 Escreva a história\n║ do seu personagem:\n${F}`);
  }

  if (estado.etapa === 'historia') {
    estado.dados.historia = texto;
    criando.delete(from);
    const { classe, nome, idade, historia } = estado.dados;
    const classeData = CLASSES[classe];
    const whatsapp_nome = msg.pushName || 'Aventureiro';
    const j = db.criarJogador(from, whatsapp_nome, classe, nome, idade, historia, classeData);

    return enviar(jid, `${T}\n   ⚔️ PERSONAGEM CRIADO!\n${B}\n\n${L}\n║ 👤 ${nome}\n║ 🎭 ${classeData.nome}\n║ 📅 ${idade} anos\n║ 📖 _${historia}_\n${M}\n║ ❤️ HP: ${classeData.hp}\n║ 💧 Mana: ${classeData.mana}\n║ 💪 FOR: ${classeData.for} | 🧠 INT: ${classeData.int}\n${M}\n║ 🛡️ Passiva:\n║ _${classeData.passiva}_\n${M}\n║ 💰 Moedas: 100\n║ 🗺️ Região: Valdris\n║ ⭐ Nível: 1\n${M}\n║ _Bem-vindo ao IMPERIUS!_\n║ _Evolua ou morra._ ⚔️\n${F}`);
  }
}

// ── INICIAR ───────────────────────────────────────────────
console.log('🚀 Iniciando IMPERIUS RPG v3.0...');
conectar().catch(console.error);

process.on('uncaughtException', (err) => console.error('Erro não tratado:', err));
process.on('unhandledRejection', (err) => console.error('Promise rejeitada:', err));
