// ============================================================
// IMPERIUS RPG v2.0 — BOT PRINCIPAL (index.js COMPLETO)
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

// ── SISTEMAS ──────────────────────────────────────────────
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
  registrarAcaoServo,
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
  processarMorteEncarnacao,
  isEncarnacao,
  getEncarnacaoAtiva
} = require('./incarnation');
const { CLASSES, CLASSES_NORMAIS, ARMAS } = require('./gameData');

// Módulos opcionais (carrega se existir)
let god = null;
try { god = require('./god'); } catch (e) {}

let dungeonModule = null;
try {
  const d = require('./dungeon');
  dungeonModule = d;
} catch (e) {}

let marriageModule = null;
try { marriageModule = require('./marriage'); } catch (e) {}

let guildModule = null;
try { guildModule = require('./guild'); } catch (e) {}

let petModule = null;
try { petModule = require('./pet'); } catch (e) {}

let animalModule = null;
try { animalModule = require('./animal'); } catch (e) {}

// ── CONFIGURAÇÃO ──────────────────────────────────────────
const DONO_NUMERO = '5567998161300';
const DONO_ID = `${DONO_NUMERO}@s.whatsapp.net`;
const PREFIX = '/';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

// Estado de criação de personagem
const criando = new Map(); // id -> { etapa, dados }

// ── FUNÇÕES AUXILIARES ─────────────────────────────────────
function isDono(id) {
  const num = id.replace('@s.whatsapp.net', '').replace(/\D/g, '');
  return num === DONO_NUMERO.replace(/\D/g, '');
}

function extrairMencao(texto, mensagem) {
  const mencoes =
    mensagem.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mencoes.length > 0) return mencoes[0];
  const match = texto.match(/@(\d+)/);
  return match ? `${match[1]}@s.whatsapp.net` : null;
}

function extrairNumero(jid) {
  return jid?.replace('@s.whatsapp.net', '');
}

// ── CONEXÃO E QR CODE ─────────────────────────────────────
let sock = null;
let tentativas_reconexao = 0;
const MAX_TENTATIVAS = 10;

// Servidor Express para exibir QR Code
const app = express();
let qrAtual = '';
let botConectado = false;

app.get('/', async (req, res) => {
  if (botConectado) {
    return res.send(`
      <html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111">
        <div style="text-align:center">
          <h1 style="color:#00ff88;font-family:sans-serif">✅ IMPERIUS RPG ONLINE</h1>
          <p style="color:gray;font-family:sans-serif">Bot conectado ao WhatsApp com sucesso!</p>
        </div>
      </body></html>
    `);
  }
  if (!qrAtual) {
    return res.send(`
      <html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111">
        <div style="text-align:center">
          <h2 style="color:white;font-family:sans-serif">⏳ Aguardando QR Code...</h2>
          <p style="color:gray;font-family:sans-serif">Atualizando em 5 segundos...</p>
        </div>
      </body><script>setTimeout(()=>location.reload(),5000)</script></html>
    `);
  }
  try {
    const qrImg = await qrcode.toDataURL(qrAtual);
    res.send(`
      <html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111">
        <div style="text-align:center">
          <h2 style="color:white;font-family:sans-serif">⚔️ IMPERIUS RPG — Escaneie o QR Code</h2>
          <img src="${qrImg}" style="width:300px;border:4px solid #444;border-radius:12px"/>
          <p style="color:gray;font-family:sans-serif">Abre o WhatsApp → Aparelhos conectados → Conectar um aparelho</p>
          <p style="color:#888;font-family:sans-serif">A página atualiza sozinha a cada 30s</p>
        </div>
      </body><script>setTimeout(()=>location.reload(),30000)</script></html>
    `);
  } catch (err) {
    res.send('<h2 style="color:red">Erro ao gerar QR</h2>');
  }
});

// Inicia servidor na porta 3000 (tenta 3001 se ocupada)
function iniciarServidor() {
  const server = app.listen(3000, () => {
    console.log('🌐 Servidor QR disponível em: http://localhost:3000');
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('⚠️ Porta 3000 ocupada, tentando 3001...');
      app.listen(3001, () => {
        console.log('🌐 Servidor QR disponível em: http://localhost:3001');
      });
    }
  });
}

async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino({ level: 'silent' })
      )
    },
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true, // Também mostra no terminal
    browser: ['IMPERIUS RPG', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    retryRequestDelayMs: 2000
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    // Atualiza QR para a página web
    if (qr) {
      qrAtual = qr;
      console.log('📱 QR Code atualizado! Acesse http://localhost:3000 para escanear.');
    }

    if (connection === 'open') {
      botConectado = true;
      qrAtual = '';
      tentativas_reconexao = 0;
      console.log('✅ IMPERIUS RPG conectado ao WhatsApp!');
      // Avisa o dono que o bot está online
      try {
        await sock.sendMessage(DONO_ID, {
          text: '⚔️ *IMPERIUS RPG v2.0* conectado com sucesso!\n_Evolua ou morra._'
        });
      } catch (e) {}
    }

    if (connection === 'close') {
      botConectado = false;
      const codigo = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const deve_reconectar = codigo !== DisconnectReason.loggedOut;

      console.log(`❌ Desconectado. Código: ${codigo}. Reconectando: ${deve_reconectar}`);

      if (deve_reconectar && tentativas_reconexao < MAX_TENTATIVAS) {
        tentativas_reconexao++;
        const delay = Math.min(5000 * tentativas_reconexao, 60000);
        console.log(`🔄 Tentativa ${tentativas_reconexao}/${MAX_TENTATIVAS} em ${delay / 1000}s...`);
        setTimeout(conectar, delay);
      } else if (codigo === DisconnectReason.loggedOut) {
        console.log('🚫 Sessão expirada. Deletando auth e reiniciando...');
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        setTimeout(conectar, 3000);
      } else {
        console.log('💀 Máximo de tentativas atingido. Reiniciando em 30s...');
        setTimeout(conectar, 30000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      try {
        await processarMensagem(msg);
      } catch (err) {
        console.error('Erro ao processar mensagem:', err);
      }
    }
  });
}

async function enviar(jid, texto, mencoes = []) {
  try {
    await sock.sendMessage(jid, { text: texto, mentions: mencoes });
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
  }
}

// ── FLUXO DE CRIAÇÃO DE PERSONAGEM ────────────────────────
async function processarCriacao(from, jid, texto, msg) {
  const estado = criando.get(from);
  if (!estado) return;

  const { etapa, dados } = estado;

  if (etapa === 'classe') {
    const key = getClasseKey(texto);
    if (!key) {
      return enviar(jid, `❌ Classe inválida. Digite o número ou nome da classe.`);
    }
    dados.classe = key;
    criando.set(from, { etapa: 'nome', dados });
    return enviar(jid, `✅ Classe *${key}* selecionada!\n\nAgora digite o *nome* do seu personagem:`);
  }

  if (etapa === 'nome') {
    if (texto.length < 2 || texto.length > 20) {
      return enviar(jid, `❌ Nome deve ter entre 2 e 20 caracteres.`);
    }
    dados.nome = texto;
    criando.delete(from);

    // Cria o personagem no banco
    const jogador = db.criarJogador(from, dados.nome, dados.classe);
    if (!jogador) {
      return enviar(jid, `❌ Erro ao criar personagem. Tente novamente com /criar.`);
    }
    return enviar(jid, gerarFicha(jogador));
  }
}

// ── PROCESSADOR DE MENSAGENS ───────────────────────────────
async function processarMensagem(msg) {
  const jid = msg.key.remoteJid;
  const from = msg.key.participant || msg.key.remoteJid;
  const isGrupo = jid.endsWith('@g.us');

  if (!isGrupo) return; // Apenas grupos

  const texto_raw =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    '';

  const texto = texto_raw.trim();

  if (!texto.startsWith(PREFIX)) {
    if (criando.has(from)) {
      await processarCriacao(from, jid, texto, msg);
    }
    return;
  }

  const [cmd_raw, ...args] = texto.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = cmd_raw.toLowerCase();
  const resto = args.join(' ');

  // ── MENU GERAL ────────────────────────────────────────────
  if (cmd === 'menu') {
    return enviar(
      jid,
      `⚔️ *IMPERIUS RPG* ⚔️\n━━━━━━━━━━━━━━━━━━━━\n\n📋 *GERAL*\nℹ️ /info — Informações\n📚 /lore — História do mundo\n🗺️ /mapa — Mapa do IMPERIUS\n📜 /regras — Regras do mundo\n👑 /dono — Informações do Dono\n🆘 /ajuda — Suporte\n📖 /infoarmas — Raridades de armas\n\n━━━━━━━━━━━━━━━━━━━━\n\n⚔️ *Digite /rpg para ver todos os comandos...*\n_Evolua ou morra._`
    );
  }

  if (cmd === 'rpg') {
    return enviar(
      jid,
      `⚔️ *IMPERIUS RPG* ⚔️\n━━━━━━━━━━━━━━━━━━━━\n\n🌟 *PERSONAGEM*\n👤 /criar — Criar personagem\n🎰 /roleta — Tentar classe rara\n👁️ /perfil — Ver sua ficha\n🎭 /classe — Info da sua classe\n🎒 /inventario — Ver inventário\n🏆 /conquistas — Ver conquistas\n⭐ /titulos — Ver títulos\n🏷️ /usartitulo [nome] — Equipar título\n⚔️ /minhaarma — Ver arma equipada\n\n━━━━━━━━━━━━━━━━━━━━\n\n⚔️ *BATALHA*\n⚔️ /batalha — Lutar contra monstro\n💀 /boss — Enfrentar o boss\n👊 /atacar @jogador — PvP\n🎯 /habilidade [nome] — Usar habilidade\n💫 /ultimate — Usar ultimate\n🎲 /d20 — Rolar D20\n🎰 /dado [N] — Rolar dado\n\n━━━━━━━━━━━━━━━━━━━━\n\n🌍 *MUNDO*\n🗺️ /mapa — Ver mapa\n🚶 /viajar [região] — Viajar\n📖 /regioes — Listar regiões\n💀 /boss — Ver boss atual\n\n━━━━━━━━━━━━━━━━━━━━\n\n💰 *ECONOMIA*\n🛒 /loja — Loja de Valdris\n💸 /comprar [item] — Comprar item\n🧪 /usar [item] — Usar item\n⚔️ /equipar [arma] — Equipar arma\n🏦 /banco — Ver banco\n💰 /depositar [valor] — Depositar\n💸 /sacar [valor] — Sacar\n\n━━━━━━━━━━━━━━━━━━━━\n\n🩸 *SACRIFÍCIO*\n🩸 /sacrificio [oferta] | [pedido]\n\n━━━━━━━━━━━━━━━━━━━━\n\n💀 *MORTE*\n☀️ /renascer — Renascer após morte\n⚰️ /reviver @jogador — Necromante ressuscita\n✅ /aprovar @servo — Aprovar ação servo\n❌ /negar @servo — Negar ação servo\n🔓 /libertar — Libertar-se do servo\n\n━━━━━━━━━━━━━━━━━━━━\n\n🏰 *MASMORRAS*\n🏰 /masmorras — Ver masmorras\n⚔️ /masmorra [nome] — Entrar\n🏕️ /acampar — Descansar\n📅 /login — Recompensa diária\n\n━━━━━━━━━━━━━━━━━━━━\n\n💍 *CASAMENTO*\n💍 /casar @jogador — Pedir casamento\n💔 /divorcio — Divorciar\n\n━━━━━━━━━━━━━━━━━━━━\n\n🛡️ *GUILDAS*\n🛡️ /criarguilda [nome] — Criar guilda\n📋 /guilda — Ver sua guilda\n📨 /convidar @jogador — Convidar\n🚪 /sairguilda — Sair da guilda\n👑 /rankingguildas — Ranking\n\n━━━━━━━━━━━━━━━━━━━━\n\n🐾 *PETS & ANIMAIS*\n🥚 /lojapets — Loja de ovos\n🐣 /chocarovo — Chocar ovo\n🐾 /meupet — Ver pet\n📣 /chamarpet — Chamar pet\n🦋 /soltarpet — Soltar pet\n💊 /curarpet — Curar pet\n🦁 /animais — Ver animais\n🏠 /adotar [animal] — Adotar\n🌿 /soltaranimal — Soltar animal\n🐾 /meuanimal — Ver meu animal\n\n━━━━━━━━━━━━━━━━━━━━\n\n🏆 *SOCIAL*\n👑 /ranking — Top jogadores\n📋 /missoes — Missões diárias\n\n━━━━━━━━━━━━━━━━━━━━\n\n⚡ *DEUS*\n😤 /provocardeus — Provocar o Deus\n⚔️ /atacardeus — Atacar o Deus\n🙏 /pedirajuda — Pedir ajuda\n🏃 /fugirdeus — Fugir do Deus\n📊 /statusdeus — Status do evento\n\n_Evolua ou morra._ ⚔️`
    );
  }

  // ── INFORMAÇÕES ───────────────────────────────────────────
  if (cmd === 'info' || cmd === 'lore') {
    return enviar(
      jid,
      `📖 *LORE DO IMPERIUS*\n━━━━━━━━━━━━━━━━━━━━\n\n_No início havia apenas o Caos._\n_Do Caos surgiu Imperius — um mundo moldado por sangue, poder e ambição._\n\n_Os deuses criaram os mortais para guerrear._\n_Os mortais criaram heróis para sobreviver._\n_Os heróis criaram lendas para serem lembrados._\n\n_E você... o que vai criar?_\n\n⚔️ *Evolua ou morra.*`
    );
  }

  if (cmd === 'regras') {
    return enviar(
      jid,
      `📜 *REGRAS DO IMPERIUS*\n━━━━━━━━━━━━━━━━━━━━\n\n1️⃣ Respeite todos os jogadores\n2️⃣ Não abuse de bugs — relate ao Dono\n3️⃣ PvP é permitido em qualquer região\n4️⃣ Mortes são permanentes até renascer\n5️⃣ O Dono tem poder absoluto\n6️⃣ Sacrifícios são irrevogáveis\n7️⃣ Classes raras só pela roleta\n\n⚔️ _Evolua ou morra._`
    );
  }

  if (cmd === 'dono') {
    return enviar(
      jid,
      `👑 *DONO DO IMPERIUS*\n━━━━━━━━━━━━━━━━━━━━\n\n🌩️ *JUVENT* — O Deus Supremo\n📱 +55 67 99816-1300\n\n_Ele é a lei. Ele é o juiz._\n_Questionar o Dono é questionar os próprios deuses._\n\n⚔️ _Evolua ou morra._`
    );
  }

  if (cmd === 'ajuda') {
    return enviar(
      jid,
      `🆘 *SUPORTE IMPERIUS*\n━━━━━━━━━━━━━━━━━━━━\n\nProblemas? Entre em contato com o Dono:\n📱 +55 67 99816-1300\n\n_Ou use /menu para ver os comandos._`
    );
  }

  if (cmd === 'infoarmas') {
    return enviar(
      jid,
      `📖 *RARIDADES DE ARMAS*\n━━━━━━━━━━━━━━━━━━━━\n\n⬜ *Comum* — Dano baixo, barato\n🟩 *Incomum* — Dano moderado\n🟦 *Raro* — Dano alto\n🟪 *Épico* — Dano muito alto\n🟨 *Lendário* — Dano excepcional\n🔴 *Primordial* — Drop exclusivo por matar o Deus encarnado\n\n_Armas Primordiais não estão à venda._\n_Apenas os Deicidas as possuem._`
    );
  }

  // ── CRIAR PERSONAGEM ──────────────────────────────────────
  if (cmd === 'criar') {
    const existe = db.getJogador(from);
    if (existe && !existe.morto)
      return enviar(jid, `❌ Você já tem um personagem! Use /perfil para ver.`);

    const { texto: menu_texto } = menuClasses();
    criando.set(from, { etapa: 'classe', dados: {} });
    return enviar(jid, menu_texto);
  }

  // ── ROLETA ────────────────────────────────────────────────
  if (cmd === 'roleta') {
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem ainda! Use /criar.`);
    return enviar(
      jid,
      `🎰 *ROLETA DO DESTINO* 🎰\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ *ATENÇÃO, AVENTUREIRO!*\n_A roleta do destino é imprevisível..._\n_Você pode ganhar uma classe rara._\n_Mas sua classe atual será DESTRUÍDA._\n\n💀 *REGRAS:*\n• Você perderá sua classe atual\n• Cooldown de 24 horas\n• Não há como voltar atrás\n\n━━━━━━━━━━━━━━━━━━━━\n_Tem certeza que deseja girar?_\n⚠️ Digite */confirmarroleta* para continuar\n❌ Digite */cancelar* para desistir`
    );
  }

  if (cmd === 'confirmarroleta') {
    const resultado = girarRoleta(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto);
  }

  if (cmd === 'cancelar') {
    criando.delete(from);
    return enviar(jid, `❌ Ação cancelada.`);
  }

  // ── PERFIL ────────────────────────────────────────────────
  if (cmd === 'perfil') {
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem ainda! Use /criar.`);
    return enviar(jid, gerarFicha(jogador));
  }

  if (cmd === 'classe') {
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem ainda!`);
    return enviar(jid, verClasse(from));
  }

  if (cmd === 'inventario') return enviar(jid, verInventario(from));
  if (cmd === 'conquistas') return enviar(jid, verConquistas(from));
  if (cmd === 'titulos') return enviar(jid, verTitulos(from));

  if (cmd === 'usartitulo') {
    if (!resto) return enviar(jid, `❌ Use: /usartitulo [nome do título]`);
    return enviar(jid, usarTitulo(from, resto));
  }

  if (cmd === 'minhaarma') {
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem!`);
    const arma = ARMAS.find((a) => a.id === jogador.arma);
    return enviar(
      jid,
      arma
        ? `⚔️ *Arma equipada:* ${arma.nome}\nDano: ${arma.dano[0]}-${arma.dano[1]} | ${arma.raridade}`
        : `❌ Nenhuma arma equipada. Compre uma na /loja.`
    );
  }

  // ── BATALHA ───────────────────────────────────────────────
  if (cmd === 'batalha') {
    const resultado = batalharMonstro(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    const logs = resultado.logs.join('\n');
    return enviar(jid, `${logs}\n\n❤️ HP atual: *${resultado.hp_atual}/${resultado.hp_max}*`);
  }

  if (cmd === 'boss') {
    const resultado = batalharBoss(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.logs.join('\n'));
  }

  if (cmd === 'atacar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador! Ex: /atacar @jogador`);

    const resultado = pvp(from, alvo_id);
    if (resultado.erro) return enviar(jid, resultado.erro);

    if (resultado.enc_morreu) {
      const enc_result = processarMorteEncarnacao(
        resultado.enc_morreu.enc_id,
        resultado.enc_morreu.matador_id,
        resultado.enc_morreu.matador_nome
      );
      if (enc_result) {
        await enviar(jid, resultado.logs.join('\n'));
        return enviar(jid, enc_result.msg_grupo);
      }
    }

    return enviar(jid, resultado.logs.join('\n'), [alvo_id]);
  }

  if (cmd === 'habilidade') {
    if (!resto) return enviar(jid, `❌ Use: /habilidade [nome da habilidade]`);
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem!`);
    const classeData = CLASSES[jogador.classe];
    const hab_key = Object.keys(classeData?.habilidades || {}).find(
      (k) =>
        k.toLowerCase().includes(resto.toLowerCase()) ||
        classeData.habilidades[k].nome.toLowerCase().includes(resto.toLowerCase())
    );
    if (!hab_key)
      return enviar(jid, `❌ Habilidade não encontrada. Use /classe para ver suas habilidades.`);
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
    return enviar(
      jid,
      `🎲 *ROLAR D20*\n\nResultado: *${d}*\n${d === 20 ? '⭐ ACERTO PERFEITO!' : d === 1 ? '💀 FALHA CATASTRÓFICA!' : ''}`
    );
  }

  if (cmd === 'dado') {
    const max = parseInt(args[0]) || 6;
    if (max < 2 || max > 1000) return enviar(jid, `❌ Use um valor entre 2 e 1000.`);
    return enviar(jid, `🎲 D${max}: *${rand(1, max)}*`);
  }

  // ── MUNDO ─────────────────────────────────────────────────
  if (cmd === 'mapa') return enviar(jid, verMapa());
  if (cmd === 'regioes') return enviar(jid, verRegioes());

  if (cmd === 'viajar') {
    if (!resto) return enviar(jid, `❌ Use: /viajar [nome da região]`);
    return enviar(jid, viajar(from, resto));
  }

  // ── ECONOMIA ──────────────────────────────────────────────
  if (cmd === 'loja') return enviar(jid, verLoja());

  if (cmd === 'comprar') {
    if (!resto) return enviar(jid, `❌ Use: /comprar [nome do item]`);
    return enviar(jid, comprarItem(from, resto));
  }

  if (cmd === 'usar') {
    if (!resto) return enviar(jid, `❌ Use: /usar [nome do item]`);
    return enviar(jid, usarItem(from, resto));
  }

  if (cmd === 'equipar') {
    if (!resto) return enviar(jid, `❌ Use: /equipar [nome da arma]`);
    return enviar(jid, equiparArma(from, resto));
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

  // ── SACRIFÍCIO ────────────────────────────────────────────
  if (cmd === 'sacrificio') {
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem!`);

    const partes = resto.split('|');
    if (partes.length < 2)
      return enviar(
        jid,
        `❌ Use: /sacrificio [o que você oferece] | [o que você pede]\n\nEx: /sacrificio minhas 500 moedas | quero mais força`
      );

    const oferta = partes[0].trim();
    const pedido = partes[1].trim();

    const alvo_id = extrairMencao(oferta, msg);
    if (alvo_id) {
      const alvo = db.getJogador(alvo_id);
      if (!alvo) return enviar(jid, `❌ Jogador mencionado não encontrado.`);
      const msg_alvo = pedirSacrificioParceiro(from, alvo_id, alvo.nome, pedido);
      const resultado = criarSacrificio(
        from,
        jogador.nome,
        pedido,
        `@${extrairNumero(alvo_id)} (sacrifício humano)`
      );
      if (resultado.erro) return enviar(jid, resultado.erro);
      await enviar(jid, resultado.msg_grupo, [alvo_id]);
      return enviar(jid, msg_alvo, [alvo_id]);
    }

    const resultado = criarSacrificio(from, jogador.nome, pedido, oferta);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  if (cmd === 'aceitarmorte') {
    const resultado = aceitarMorteSacrificio(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    await enviar(jid, resultado.msg_grupo);
    return enviar(jid, `⏳ Aguardando o Deus julgar o sacrifício...`);
  }

  if (cmd === 'recusarmorte') {
    const resultado = recusarMorteSacrificio(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  if (cmd === 'sacrificios') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode ver os sacrifícios pendentes.`);
    return enviar(jid, verSacrificiosPendentes());
  }

  if (cmd === 'aceitarsacrificio') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode aceitar sacrifícios.`);
    const resultado = aceitarSacrificio(args[0]);
    if (typeof resultado === 'string') return enviar(jid, resultado);
    await enviar(jid, resultado.msg_grupo);
    return enviar(jid, resultado.msg_jogador);
  }

  if (cmd === 'recusarsacrificio') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode recusar sacrifícios.`);
    const resultado = recusarSacrificio(args[0]);
    if (typeof resultado === 'string') return enviar(jid, resultado);
    return enviar(jid, resultado.msg_grupo);
  }

  // ── MORTE / NECROMÂNCIA ────────────────────────────────────
  if (cmd === 'renascer') return enviar(jid, renascer(from));

  if (cmd === 'reviver') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador! Ex: /reviver @jogador`);
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

  // ── ENCARNAÇÃO DIVINA ──────────────────────────────────────
  if (cmd === 'encarnar') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode encarnar.`);
    const resultado = encarnar(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  if (cmd === 'ascender') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode ascender.`);
    const resultado = ascender(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg_grupo);
  }

  // ── SOCIAL ────────────────────────────────────────────────
  if (cmd === 'ranking') return enviar(jid, verRanking());
  if (cmd === 'missoes') return enviar(jid, verMissoes(from));

  // ── ADMIN / DONO ──────────────────────────────────────────
  if (cmd === 'matar') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode usar este comando.`);
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    return enviar(jid, matarJogador(alvo_id), [alvo_id]);
  }

  if (cmd === 'daritem') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode usar este comando.`);
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador e o item!`);
    const item = args.slice(1).join(' ');
    return enviar(jid, darItem(alvo_id, item), [alvo_id]);
  }

  if (cmd === 'abençoar' || cmd === 'abencoar') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode usar este comando.`);
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    return enviar(jid, abencoarJogador(alvo_id), [alvo_id]);
  }

  if (cmd === 'maldição' || cmd === 'maldicionar') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode usar este comando.`);
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    return enviar(jid, maldicionarJogador(alvo_id), [alvo_id]);
  }

  if (cmd === 'evento') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode usar este comando.`);
    if (!resto) return enviar(jid, `❌ Use: /evento [descrição do evento]`);
    return enviar(jid, eventoGlobal(jid, resto));
  }

  if (cmd === 'statusbot') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Dono pode ver o status do bot.`);
    return enviar(jid, statusBot());
  }

  // ── EVENTO DO DEUS ────────────────────────────────────────
  if (god) {
    if (cmd === 'provocardeus') {
      const resultado = god.provocarDeus(from, jid);
      if (resultado.erro) return enviar(jid, resultado.erro);
      await enviar(jid, resultado.msg_grupo);
      return enviar(DONO_ID, resultado.msg_dono);
    }
    if (cmd === 'aceitardeus') {
      const resultado = god.aceitarEventoDeus(from, jid);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.msg_grupo);
    }
    if (cmd === 'ignorardeus') {
      const resultado = god.ignorarDeus(from);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.msg_grupo);
    }
    if (cmd === 'atacardeus') {
      const resultado = god.atacarDeus(from);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.texto);
    }
    if (cmd === 'pedirajuda') {
      const resultado = god.pedirAjuda(from, jid);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.texto, resultado.mencoes);
    }
    if (cmd === 'aceitarajuda') {
      const resultado = god.aceitarAjuda(from);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.texto);
    }
    if (cmd === 'fugirdeus') {
      return enviar(jid, god.fugirDeus(from));
    }
    if (cmd === 'deusdescansar') {
      const resultado = god.deusDescansar(from, jid);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.msg_grupo);
    }
    if (cmd === 'statusdeus') {
      return enviar(jid, god.statusEvento());
    }
  }

  // ── MASMORRAS ─────────────────────────────────────────────
  if (dungeonModule) {
    const { verMasmorras, entrarMasmorra, acampar, loginDiario } = dungeonModule;
    if (cmd === 'masmorras') return enviar(jid, verMasmorras(from));
    if (cmd === 'masmorra') {
      if (!resto) return enviar(jid, `❌ Use: /masmorra [nome]`);
      const resultado = entrarMasmorra(from, resto);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.texto);
    }
    if (cmd === 'acampar') return enviar(jid, acampar(from));
    if (cmd === 'login') return enviar(jid, loginDiario(from));
  }

  // ── CASAMENTO ─────────────────────────────────────────────
  if (marriageModule) {
    const { pedirCasamento, divorciar } = marriageModule;
    if (cmd === 'casar') {
      const alvo_id = extrairMencao(resto, msg);
      if (!alvo_id) return enviar(jid, `❌ Mencione um jogador! Ex: /casar @jogador`);
      const resultado = pedirCasamento(from, alvo_id);
      if (resultado.erro) return enviar(jid, resultado.erro);
      await enviar(jid, resultado.msg_proponente);
      return enviar(jid, resultado.msg_alvo, [alvo_id]);
    }
    if (cmd === 'divorcio') return enviar(jid, divorciar(from));
  }

  // ── GUILDAS ───────────────────────────────────────────────
  if (guildModule) {
    const { criarGuilda, verGuilda, convidarGuilda, sairGuilda, rankingGuildas } = guildModule;
    if (cmd === 'criarguilda') {
      if (!resto) return enviar(jid, `❌ Use: /criarguilda [nome]`);
      return enviar(jid, criarGuilda(from, resto));
    }
    if (cmd === 'guilda') return enviar(jid, verGuilda(from));
    if (cmd === 'convidar') {
      const alvo_id = extrairMencao(resto, msg);
      if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
      const resultado = convidarGuilda(from, alvo_id);
      if (typeof resultado === 'string') return enviar(jid, resultado);
      await enviar(jid, resultado.msg_lider);
      return enviar(jid, resultado.msg_alvo, [alvo_id]);
    }
    if (cmd === 'sairguilda') return enviar(jid, sairGuilda(from));
    if (cmd === 'rankingguildas') return enviar(jid, rankingGuildas());
  }

  // ── PETS ──────────────────────────────────────────────────
  if (petModule) {
    const { verLojaOvos, chocarOvo, verPet, chamarPet, soltarPet, curarPet } = petModule;
    if (cmd === 'lojapets') return enviar(jid, verLojaOvos());
    if (cmd === 'chocarovo') {
      const resultado = chocarOvo(from);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.texto);
    }
    if (cmd === 'meupet') return enviar(jid, verPet(from));
    if (cmd === 'chamarpet') {
      const resultado = chamarPet(from);
      if (resultado.erro) return enviar(jid, resultado.erro);
      return enviar(jid, resultado.texto);
    }
    if (cmd === 'soltarpet') return enviar(jid, soltarPet(from));
    if (cmd === 'curarpet') return enviar(jid, curarPet(from));
  }

  // ── ANIMAIS ───────────────────────────────────────────────
  if (animalModule) {
    const { verAnimais, adotarAnimal, soltarAnimal, verMeuAnimal } = animalModule;
    if (cmd === 'animais') return enviar(jid, verAnimais());
    if (cmd === 'adotar') {
      if (!resto) return enviar(jid, `❌ Use: /adotar [nome do animal]`);
      return enviar(jid, adotarAnimal(from, resto));
    }
    if (cmd === 'soltaranimal') return enviar(jid, soltarAnimal(from));
    if (cmd === 'meuanimal') return enviar(jid, verMeuAnimal(from));
  }
}

// ── INICIAR ───────────────────────────────────────────────
console.log('🚀 Iniciando IMPERIUS RPG v2.0...');
iniciarServidor();
conectar().catch(console.error);

// Tratamento de erros globais para não crashar
process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Promise rejeitada:', err);
});
