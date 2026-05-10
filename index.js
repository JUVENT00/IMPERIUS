const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const express = require('express');
const qrcode = require('qrcode');

const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false });

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
    sock.ev.on('connection.update', ({ qr }) => { if (qr) qrAtual = qr; });
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
      const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      if (!texto.startsWith('/')) return;
      const cmd = texto.slice(1).trim().toLowerCase();

      if (cmd === 'ping') {
        await sock.sendMessage(jid, { text: '🏓 Pong!' });
      }

      if (cmd === 'menu') {
        const texto_menu = '⚔️ IMPERIUS RPG ⚔️\n\nBem-vindo ao IMPERIUS!';
        const img_path = path.join(__dirname, 'menu.jpg');
        if (fs.existsSync(img_path)) {
          await sock.sendMessage(jid, {
            image: fs.readFileSync(img_path),
            caption: texto_menu,
            mimetype: 'image/jpeg'
          });
        } else {
          await sock.sendMessage(jid, { text: '❌ Imagem não encontrada!\n\n' + texto_menu });
        }
      }
    }
  });
}

conectar();
