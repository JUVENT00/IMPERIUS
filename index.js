const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const express = require('express');
const qrcode = require('qrcode');

const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');
const DONO_NUMERO = '5567998161300';
const DONO_LID = '36821174120703';

function isDono(from) {
  const num = from
    .replace('@s.whatsapp.net', '')
    .replace('@lid', '')
    .split(':')[0];
  return num === DONO_NUMERO || num === DONO_LID;
}

async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['IMPERIUS', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    const app = express();
    let qrAtual = '';
    app.get('/', async (req, res) => {
      if (!qrAtual) return res.send('<h2>Aguardando QR...</h2>');
      const img = await qrcode.toDataURL(qrAtual);
      res.send(`<img src="${img}" style="width:300px"/>`);
    });
    if (!global.srv) global.srv = app.listen(3001);
    sock.ev.on('connection.update', ({ qr }) => {
      if (qr) { qrAtual = qr; console.log('📱 QR atualizado!'); }
    });
  }

  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') console.log('✅ Conectado!');
    if (connection === 'close') setTimeout(conectar, 5000);
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (msg.key.fromMe) return;

      const jid = msg.key.remoteJid;
      const from = msg.key.participant || msg.key.remoteJid;
      const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

      if (!texto.startsWith('/')) return;
      const cmd = texto.slice(1).trim().toLowerCase();

      if (cmd === 'ping') {
        await sock.sendMessage(jid, { text: '🏓 Pong!' });
      }

      if (cmd === 'meuid') {
        await sock.sendMessage(jid, { text: `Seu ID: ${from}` });
      }

      if (cmd === 'deus') {
        if (!isDono(from)) {
          await sock.sendMessage(jid, { text: '❌ Apenas o Deus pode usar esse comando!' });
          return;
        }
        await sock.sendMessage(jid, { text: '☠️ Bem-vindo, DEUS JUVENT!\nSeus poderes estão ativos!' });
      }
    }
  });
}

conectar();
