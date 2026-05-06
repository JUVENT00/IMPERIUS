// ============================================================
// IMPERIUS RPG v2.0 — BOT PRINCIPAL
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
const { renascer, reviverPorNecromante, aprovarAcaoServo, registrarAcaoServo, liberarServo } = require('./death');
const { verLoja, comprarItem, usarItem, equiparArma, verInventario, verBanco, depositar, sacar } = require('./economy');
const { verRanking, verConquistas, verTitulos, usarTitulo, verMissoes, matarJogador, darItem, abencoarJogador, maldicionarJogador, eventoGlobal, statusBot } = require('./events');
const { criarSacrificio, aceitarSacrificio, recusarSacrificio, pedirSacrificioParceiro, aceitarMorteSacrificio, recusarMorteSacrificio, verSacrificiosPendentes } = require('./sacrifice');
const { encarnar, ascender, processarMorteEncarnacao, isEncarnacao, getEncarnacaoAtiva } = require('./incarnation');
const { CLASSES, CLASSES_NORMAIS, ARMAS } = require('./gameData');

// ── CONFIGURAÇÃO ──────────────────────────────────────────
const DONO_ID = process.env.DONO_ID || '5511999999999@s.whatsapp.net'; // Trocar pelo seu número
const PREFIX = '/';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

// Estado de criação de personagem
const criando = new Map(); // id -> { etapa, dados }

// ── FUNÇÕES AUXILIARES ─────────────────────────────────────
function isDono(id) {
  return id === DONO_ID || id.replace('@s.whatsapp.net', '') === DONO_ID.replace('@s.whatsapp.net', '');
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

function isHorarioAtivo() {
  const agora = new Date();
  const dia = agora.getDay(); // 0=Dom, 6=Sab
  const hora = agora.getHours();
  // Seg-Dom 00h-23h (ativo sempre, pode ajustar)
  return true;
}

// ── CONEXÃO E RECONEXÃO ────────────────────────────────────
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
  setTimeout(async () => {
    const numero = '556796847913';
    const codigo = await sock.requestPairingCode(numero);
    console.log(`🔑 SEU CÓDIGO DE PAREAMENTO: ${codigo}`);
  }, 10000);
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ IMPERIUS RPG conectado ao WhatsApp!');
      tentativas_reconexao = 0;
    }

    if (connection === 'close') {
      const codigo = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const deve_reconectar = codigo !== DisconnectReason.loggedOut;

      console.log(`❌ Desconectado. Código: ${codigo}. Reconectando: ${deve_reconectar}`);

      if (deve_reconectar && tentativas_reconexao < MAX_TENTATIVAS) {
        tentativas_reconexao++;
        const delay = Math.min(5000 * tentativas_reconexao, 60000);
        console.log(`🔄 Tentativa ${tentativas_reconexao}/${MAX_TENTATIVAS} em ${delay / 1000}s...`);
        setTimeout(conectar, delay);
      } else if (codigo === DisconnectReason.loggedOut) {
        console.log('🚫 Sessão expirada. Reiniciando...');
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        setTimeout(conectar, 3000);
      } else {
        console.log('💀 Número máximo de tentativas atingido. Reiniciando processo...');
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

// ── PROCESSADOR DE MENSAGENS ───────────────────────────────
async function processarMensagem(msg) {
  const jid = msg.key.remoteJid;
  const from = msg.key.participant || msg.key.remoteJid;
  const isGrupo = jid.endsWith('@g.us');

  if (!isGrupo) return; // Só responde em grupos

  const texto_raw = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption || '';

  const texto = texto_raw.trim();
  if (!texto.startsWith(PREFIX)) {
    // Verificar fluxo de criação
    if (criando.has(from)) {
      await processarCriacao(from, jid, texto, msg);
    }
    return;
  }

  const [cmd_raw, ...args] = texto.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = cmd_raw.toLowerCase();
  const resto = args.join(' ');

  // ── MENU ─────────────────────────────────────────────────
  if (cmd === 'menu') {
    return enviar(jid, `⚔️ *IMPERIUS RPG* ⚔️\n━━━━━━━━━━━━━━━━━━━━\n\n📋 *GERAL*\nℹ️ /info — Informações\n📚 /lore — História do mundo\n🗺️ /mapa — Mapa do IMPERIUS\n📜 /regras — Regras do mundo\n👑 /dono — Informações do Dono\n🆘 /ajuda — Suporte\n📖 /infoarmas — Raridades de armas\n\n━━━━━━━━━━━━━━━━━━━━\n\n⚔️ *Digite /rpg para entrar no mundo...*\n_Evolua ou morra._`);
  }

  if (cmd === 'rpg') {
    return enviar(jid, `⚔️ *IMPERIUS RPG* ⚔️\n━━━━━━━━━━━━━━━━━━━━\n\n🌟 *PERSONAGEM*\n👤 /criar — Criar personagem\n🎰 /roleta — Tentar classe rara\n👁️ /perfil — Ver sua ficha\n🎭 /classe — Info da sua classe\n🎒 /inventario — Ver inventário\n🏆 /conquistas — Ver conquistas\n⭐ /titulos — Ver títulos\n🏷️ /usartitulo [nome] — Equipar título\n⚔️ /minhaarma — Ver arma equipada\n\n━━━━━━━━━━━━━━━━━━━━\n\n⚔️ *BATALHA*\n⚔️ /batalha — Lutar contra monstro\n💀 /boss — Enfrentar o boss\n👊 /atacar @jogador — PvP\n🎯 /habilidade [nome] — Usar habilidade\n💫 /ultimate — Usar ultimate\n🎲 /d20 — Rolar D20\n🎰 /dado [N] — Rolar dado\n\n━━━━━━━━━━━━━━━━━━━━\n\n🌍 *MUNDO*\n🗺️ /mapa — Ver mapa\n🚶 /viajar [região] — Viajar\n📖 /regioes — Listar regiões\n🐉 /bosses — Ver todos os bosses\n\n━━━━━━━━━━━━━━━━━━━━\n\n💰 *ECONOMIA*\n🛒 /loja — Loja de Valdris\n💸 /comprar [item] — Comprar item\n🧪 /usar [item] — Usar item\n⚔️ /equipar [arma] — Equipar arma\n🏦 /banco — Ver banco\n💰 /depositar [valor] — Depositar\n💸 /sacar [valor] — Sacar\n\n━━━━━━━━━━━━━━━━━━━━\n\n🩸 *SACRIFÍCIO*\n🩸 /sacrificio [oferta] | [pedido]\n\n━━━━━━━━━━━━━━━━━━━━\n\n💀 *MORTE*\n☀️ /renascer — Renascer após morte\n⚰️ /reviver @jogador — Necromante ressuscita\n✅ /aprovar — Aprovar ação servo\n❌ /negar — Negar ação servo\n🔓 /libertar — Libertar-se do servo\n\n━━━━━━━━━━━━━━━━━━━━\n\n🏆 *SOCIAL*\n👑 /ranking — Top jogadores\n📋 /missoes — Missões diárias\n\n_Evolua ou morra._ ⚔️`);
  }

  // ── INFO ──────────────────────────────────────────────────
  if (cmd === 'info' || cmd === 'lore') {
    return enviar(jid, `📖 *LORE DO IMPERIUS*\n━━━━━━━━━━━━━━━━━━━━\n\n_No início havia apenas o Caos._\n_Do Caos surgiu Imperius — um mundo moldado por sangue, poder e ambição._\n\n_Os deuses criaram os mortais para guerrear._\n_Os mortais criaram heróis para sobreviver._\n_Os heróis criaram lendas para serem lembrados._\n\n_E você... o que vai criar?_\n\n⚔️ *Evolua ou morra.*`);
  }

  if (cmd === 'regras') {
    return enviar(jid, `📜 *REGRAS DO IMPERIUS*\n━━━━━━━━━━━━━━━━━━━━\n\n1️⃣ Respeite todos os jogadores\n2️⃣ Não abuse de bugs — relate ao Dono\n3️⃣ PvP é permitido em qualquer região\n4️⃣ Mortes são permanentes até renascer\n5️⃣ O Dono tem poder absoluto\n6️⃣ Sacrifícios são irrevogáveis\n7️⃣ Classes raras só pela roleta\n\n⚔️ _Evolua ou morra._`);
  }

  if (cmd === 'infoarmas') {
    return enviar(jid, `📖 *RARIDADES DE ARMAS*\n━━━━━━━━━━━━━━━━━━━━\n\n⬜ *Comum* — Dano baixo, barato\n🟩 *Incomum* — Dano moderado\n🟦 *Raro* — Dano alto\n🟪 *Épico* — Dano muito alto\n🟨 *Lendário* — Dano excepcional\n🔴 *Primordial* — Drop exclusivo por matar o Deus encarnado\n\n_Armas Primordiais não estão à venda._\n_Apenas os Deicidas as possuem._`);
  }

  // ── CRIAR PERSONAGEM ──────────────────────────────────────
  if (cmd === 'criar') {
    const existe = db.getJogador(from);
    if (existe && !existe.morto) return enviar(jid, `❌ Você já tem um personagem! Use /perfil para ver.`);

    const { texto: menu_texto } = menuClasses();
    criando.set(from, { etapa: 'classe', dados: {} });
    return enviar(jid, menu_texto);
  }

  // ── ROLETA ────────────────────────────────────────────────
  if (cmd === 'roleta') {
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem ainda! Use /criar.`);
    return enviar(jid, `🎰 *ROLETA DO DESTINO* 🎰\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ *ATENÇÃO, AVENTUREIRO!*\n_A roleta do destino é imprevisível..._\n_Você pode ganhar uma classe rara._\n_Mas sua classe atual será DESTRUÍDA._\n\n💀 *REGRAS:*\n• Você perderá sua classe atual\n• Cooldown de 24 horas\n• Não há como voltar atrás\n\n━━━━━━━━━━━━━━━━━━━━\n_Tem certeza que deseja girar?_\n⚠️ Digite */confirmarroleta* para continuar\n❌ Digite */cancelar* para desistir`);
  }

  if (cmd === 'confirmarroleta') {
    const resultado = girarRoleta(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.texto);
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

  if (cmd === 'inventario') {
    return enviar(jid, verInventario(from));
  }

  if (cmd === 'conquistas') {
    return enviar(jid, verConquistas(from));
  }

  if (cmd === 'titulos') {
    return enviar(jid, verTitulos(from));
  }

  if (cmd === 'usartitulo') {
    if (!resto) return enviar(jid, `❌ Use: /usartitulo [nome do título]`);
    return enviar(jid, usarTitulo(from, resto));
  }

  if (cmd === 'minhaarma') {
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem!`);
    const arma = ARMAS.find(a => a.id === jogador.arma);
    return enviar(jid, arma
      ? `⚔️ *Arma equipada:* ${arma.nome}\nDano: ${arma.dano[0]}-${arma.dano[1]} | ${arma.raridade}`
      : `❌ Nenhuma arma equipada. Compre uma na /loja.`);
  }

  // ── BATALHA ───────────────────────────────────────────────
  if (cmd === 'batalha') {
    const resultado = batalharMonstro(from);
    if (resultado.erro) return enviar(jid, resultado.erro);
    const jogador = db.getJogador(from);
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

    // Processar morte de encarnação
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
    const hab_key = Object.keys(classeData?.habilidades || {}).find(k =>
      k.toLowerCase().includes(resto.toLowerCase()) ||
      classeData.habilidades[k].nome.toLowerCase().includes(resto.toLowerCase())
    );
    if (!hab_key) return enviar(jid, `❌ Habilidade não encontrada. Use /classe para ver suas habilidades.`);
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
    const msgs = ['1','≤5','≤9','≤14','≤17','≤19','20'];
    return enviar(jid, `🎲 *ROLAR D20*\n\nResultado: *${d}*\n${d === 20 ? '⭐ ACERTO PERFEITO!' : d === 1 ? '💀 FALHA CATASTRÓFICA!' : ''}`);
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
    return enviar(jid, depositar(from, valor));
  }

  if (cmd === 'sacar') {
    const valor = parseInt(args[0]);
    return enviar(jid, sacar(from, valor));
  }

  // ── SACRIFÍCIO ────────────────────────────────────────────
  if (cmd === 'sacrificio') {
    const jogador = db.getJogador(from);
    if (!jogador) return enviar(jid, `❌ Você não tem personagem!`);

    // Formato: /sacrificio [oferta] | [pedido]
    const partes = resto.split('|');
    if (partes.length < 2) return enviar(jid, `❌ Use: /sacrificio [o que você oferece] | [o que você pede]\n\nEx: /sacrificio minhas 500 moedas | quero mais força`);

    const oferta = partes[0].trim();
    const pedido = partes[1].trim();

    // Verificar se é sacrifício de parceiro
    const alvo_id = extrairMencao(oferta, msg);
    if (alvo_id) {
      const alvo = db.getJogador(alvo_id);
      if (!alvo) return enviar(jid, `❌ Jogador mencionado não encontrado.`);
      const msg_alvo = pedirSacrificioParceiro(from, alvo_id, alvo.nome, pedido);
      // Criar o sacrifício pendente primeiro
      const resultado = criarSacrificio(from, jogador.nome, pedido, `@${extrairNumero(alvo_id)} (sacrifício humano)`);
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

  // ── SOCIAL ────────────────────────────────────────────────
  if (cmd === 'ranking') return enviar(jid, verRanking());
  if (cmd === 'missoes') return enviar(jid, verMissoes(from));

  // ── ENCARNAÇÃO DIVINA ─────────────────────────────────────
  if (cmd === 'encarnar') {
    if (!isDono(from)) return enviar(jid, `❌ Apenas o Deus pode encarnar.`);
    if (!resto) return enviar(jid, `❌ Use: /encarnar [nome do personagem]`);
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
  if (!isDono(from)) return; // Comandos abaixo são só do dono

  if (cmd === 'matar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador!`);
    const resultado = matarJogador(alvo_id, args.slice(1).join(' '));
    if (resultado.erro) return enviar(jid, resultado.erro);
    return enviar(jid, resultado.msg, [alvo_id]);
  }

  if (cmd === 'dar') {
    const alvo_id = extrairMencao(resto, msg);
    if (!alvo_id) return enviar(jid, `❌ Mencione um jogador e o item!`);
    const item = args.slice(1).join(' ');
    if (!item) return enviar(jid, `❌ Especifique o item!`);
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

  if (cmd === 'maldicoar') {
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

  if (cmd === 'sacrificiosPendentes' || cmd === 'sacrificios') {
    return enviar(jid, verSacrificiosPendentes());
  }

  if (cmd === 'evento') {
    if (!resto) return enviar(jid, `❌ Use: /evento [mensagem do evento]`);
    return enviar(jid, eventoGlobal(resto));
  }

  if (cmd === 'status') return enviar(jid, statusBot());
}

// ── FLUXO DE CRIAÇÃO DE PERSONAGEM ────────────────────────
async function processarCriacao(from, jid, texto, msg) {
  const estado = criando.get(from);
  if (!estado) return;

  if (estado.etapa === 'classe') {
    const classe_key = getClasseKey(texto);
    if (!classe_key) return enviar(jid, `❌ Classe inválida. Digite o número ou nome da classe.`);

    estado.dados.classe = classe_key;
    estado.etapa = 'nome';
    criando.set(from, estado);
    return enviar(jid, `✅ Classe *${CLASSES[classe_key].nome}* selecionada!\n\n👤 Agora, qual será o nome do seu personagem?`);
  }

  if (estado.etapa === 'nome') {
    if (texto.length < 2 || texto.length > 20) return enviar(jid, `❌ O nome deve ter entre 2 e 20 caracteres.`);

    estado.dados.nome = texto;
    estado.etapa = 'idade';
    criando.set(from, estado);
    return enviar(jid, `✅ Nome *${texto}* definido!\n\n📅 Qual a idade do seu personagem? (número)`);
  }

  if (estado.etapa === 'idade') {
    const idade = parseInt(texto);
    if (isNaN(idade) || idade < 1 || idade > 9999) return enviar(jid, `❌ Digite uma idade válida.`);

    estado.dados.idade = idade;
    estado.etapa = 'historia';
    criando.set(from, estado);
    return enviar(jid, `✅ Idade *${idade}* definida!\n\n📖 Agora escreva uma breve história do seu personagem (pode ser curta):`);
  }

  if (estado.etapa === 'historia') {
    estado.dados.historia = texto;
    criando.delete(from);

    const { classe, nome, idade, historia } = estado.dados;
    const classeData = CLASSES[classe];
    const whatsapp_nome = msg.pushName || 'Aventureiro';

    const jogador = db.criarJogador(from, whatsapp_nome, classe, nome, idade, historia, classeData);

    return enviar(jid, `⚔️ *PERSONAGEM CRIADO!* ⚔️\n━━━━━━━━━━━━━━━━━━━━\n\n👤 *${nome}*\n🎭 Classe: *${classeData.nome}*\n📅 Idade: *${idade}*\n📖 _${historia}_\n\n🛡️ Passiva: _${classeData.passiva}_\n\n💰 Moedas iniciais: *100*\n🗺️ Região inicial: *Valdris*\n\n━━━━━━━━━━━━━━━━━━━━\n_Bem-vindo ao IMPERIUS, ${nome}._\n_Evolua ou morra._ ⚔️`);
  }
}

// ── INICIAR ───────────────────────────────────────────────
console.log('🚀 Iniciando IMPERIUS RPG v2.0...');
conectar().catch(console.error);

// Tratamento de erros globais para não crashar
process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Promise rejeitada:', err);
});
