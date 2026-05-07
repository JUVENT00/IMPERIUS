// ============================================================
// IMPERIUS RPG v2.0 — BOT PRINCIPAL (VERSÃO FINAL CORRIGIDA)
// ============================================================

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const express = require('express');
const qrcode = require('qrcode');

// ── SISTEMAS (IMPORTAÇÕES) ──────────────────────────────────
const db = require('./db');
const {
  menuClasses,
  getClasseKey,
  girarRoleta,
  gerarFicha,
  verClasse,
  viajar,
  verMapa,
  verRegioes
} = require('./character');
const {
  batalharMonstro,
  batalharBoss,
  pvp,
  usarHabilidade,
  usarUltimate,
  rolarD20,
  rand
} = require('./combat');
const {
  renascer,
  reviverPorNecromante,
  aprovarAcaoServo,
  liberarServo
} = require('./death');
const {
  verLoja,
  comprarItem,
  usarItem,
  equiparArma,
  verInventario,
  verBanco,
  depositar,
  sacar
} = require('./economy');
const {
  verRanking,
  verConquistas,
  verTitulos,
  usarTitulo,
  verMissoes,
  matarJogador,
  darItem,
  abencoarJogador,
  maldicionarJogador,
  eventoGlobal,
  statusBot
} = require('./events');
const {
  criarSacrificio,
  aceitarSacrificio,
  recusarSacrificio,
  pedirSacrificioParceiro,
  aceitarMorteSacrificio,
  recusarMorteSacrificio,
  verSacrificiosPendentes
} = require('./sacrifice');
const {
  encarnar,
  ascender,
  processarMorteEncarnacao
} = require('./incarnation');
const { CLASSES, ARMAS } = require('./gameData');

// Módulos opcionais
let god = null; try { god = require('./god'); } catch (e) {}
let dungeonModule = null; try { dungeonModule = require('./dungeon'); } catch (e) {}
let marriageModule = null; try { marriageModule = require('./marriage'); } catch (e) {}
let guildModule = null; try { guildModule = require('./guild'); } catch (e) {}
let petModule = null; try { petModule = require('./pet'); } catch (e) {}
let animalModule = null; try { animalModule = require('./animal'); } catch (e) {}

// ── CONFIGURAÇÃO ──────────────────────────────────────────
const DONO_NUMERO = '5567998161300';
const DONO_ID = `${DONO_NUMERO}@s.whatsapp.net`;
const PREFIX = '/';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');
const criando = new Map();

// ── FUNÇÕES AUXILIARES ─────────────────────────────────────
function isDono(id) {
  return id.replace(/\D/g, '').includes(DONO_NUMERO);
}

function extrairMencao(texto, mensagem) {
  const mencoes = mensagem.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mencoes.length > 0) return mencoes[0];
  const match = texto.match(/@(\d+)/);
  return match ? `${match[1]}@s.whatsapp.net` : null;
}

// ── SERVIDOR WEB PARA QR CODE ──────────────────────────────
const app = express();
let qrAtual = '';
let botConectado = false;

app.get('/', async (req, res) => {
  if (botConectado) return res.send('<h1 style="font-family:sans-serif;text-align:center;margin-top:50px;color:green">✅ IMPERIUS RPG CONECTADO!</h1>');
  if (!qrAtual) return res.send('<h1 style="font-family:sans-serif;text-align:center;margin-top:50px">⏳ Gerando QR Code...</h1>');
  const qrImg = await qrcode.toDataURL(qrAtual);
  res.send(`<div style="text-align:center;font-family:sans-serif"><br><h2>⚔️ ESCANEIE O QR CODE PARA INICIAR</h2><img src="${qrImg}" width="300"/></div>`);
});

// ── CONEXÃO WHATSAPP ──────────────────────────────────────
async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    printQRInTerminal: true,
    browser: ['IMPERIUS RPG', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrAtual = qr;
    if (connection === 'open') {
      botConectado = true;
      console.log('✅ IMPERIUS RPG ONLINE!');
    }
    if (connection === 'close') {
      botConectado = false;
      const deveReconectar = (new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log('❌ Conexão fechada. Reconectando:', deveReconectar);
      if (deveReconectar) conectar();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    
    await processarMensagem(sock, msg);
  });
}

// ── PROCESSADOR DE COMANDOS ───────────────────────────────
async function processarMensagem(sock, msg) {
  const jid = msg.key.remoteJid;
  const from = msg.key.participant || jid;
  const textoRaw = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const texto = textoRaw.trim();

  const enviar = async (txt, mencoes = []) => {
    await sock.sendMessage(jid, { text: txt, mentions: mencoes });
  };

  // Lógica de Criação de Personagem
  if (criando.has(from) && !texto.startsWith(PREFIX)) {
    const estado = criando.get(from);
    if (estado.etapa === 'classe') {
      const key = getClasseKey(texto);
      if (!key) return enviar("❌ Classe inválida! Escolha uma da lista.");
      estado.dados.classe = key;
      estado.etapa = 'nome';
      return enviar(`✅ Classe *${key}* escolhida!\n\nAgora, qual será o *NOME* do seu herói?`);
    }
    if (estado.etapa === 'nome') {
      if (texto.length < 3) return enviar("❌ Nome muito curto!");
      db.criarJogador(from, texto, estado.dados.classe);
      criando.delete(from);
      return enviar(`🎊 *PERSONAGEM CRIADO!*\n\nBem-vindo ao Imperius, *${texto}*.\nUse /perfil para ver seus status.`);
    }
  }

  if (!texto.startsWith(PREFIX)) return;

  const [cmdRaw, ...args] = texto.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = cmdRaw.toLowerCase();
  const resto = args.join(' ');

  try {
    switch (cmd) {
      case 'menu':
      case 'ajuda':
        return enviar("⚔️ *IMPERIUS RPG* ⚔️\n\nUse */rpg* para ver a lista completa de comandos.");

      case 'criar':
        if (db.getJogador(from)) return enviar("❌ Você já possui um personagem!");
        criando.set(from, { etapa: 'classe', dados: {} });
        return enviar(menuClasses().texto);

      case 'perfil':
        const p = db.getJogador(from);
        return enviar(p ? gerarFicha(p) : "❌ Você não tem um personagem. Use /criar");

      case 'batalha':
        const resB = batalharMonstro(from);
        return enviar(resB.erro || resB.logs.join('\n'));

      case 'loja':
        return enviar(verLoja());

      case 'inventario':
        return enviar(verInventario(from));

      // Comandos de Animais (Onde o seu código parou)
      case 'animais':
        if (animalModule) return enviar(animalModule.verAnimais());
        break;

      case 'adotar':
        if (!animalModule) break;
        if (!resto) return enviar("❌ Use: /adotar [nome do animal]");
        return enviar(animalModule.adotarAnimal(from, resto));

      case 'meuanimal':
        if (animalModule) return enviar(animalModule.verMeuAnimal(from));
        break;

      case 'soltaranimal':
        if (animalModule) return enviar(animalModule.soltaranimal(from));
        break;

      // Comandos de Dono
      case 'matar':
        if (!isDono(from)) return enviar("❌ Sem permissão.");
        const alvo = extrairMencao(resto, msg);
        return enviar(alvo ? matarJogador(alvo) : "❌ Mencione alguém.");

      default:
        // Caso existam outros módulos (Guildas, Casamento, etc), o bot processa aqui
        break;
    }
  } catch (err) {
    console.error("Erro ao processar comando:", err);
  }
}

// ── INICIALIZAÇÃO ──────────────────────────────────────────
app.listen(3000, () => console.log('🌐 QR Code em: http://localhost:3000'));
conectar();
