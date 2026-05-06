// ============================================================
// IMPERIUS RPG — ENCARNAÇÃO DIVINA
// ============================================================
const { getJogador, salvarJogador, criarJogador, getEncarnacao, setEncarnacao, deleteEncarnacao, adicionarConquista, adicionarTitulo } = require('./db');
const { CLASSES, ARMAS_PRIMORDIAIS } = require('../data/gameData');

const DONO_ID = process.env.DONO_ID || '';

function encarnar(dono_id, nome_personagem, grupo_id) {
  const enc_existente = getEncarnacao(dono_id);
  if (enc_existente) return { erro: '❌ Você já está encarnado! Use /ascender para voltar.' };

  // Criar personagem temporário do Deus
  const classe_key = 'guerreiro'; // Deus encarna como guerreiro por padrão
  const classeData = CLASSES[classe_key];

  const personagem_enc = {
    id: `enc_${dono_id}`,
    whatsapp_nome: 'Deus Encarnado',
    nome: nome_personagem,
    classe: classe_key,
    rank: 'SSS',
    xp: 55000,
    moedas: 9999,
    hp: 500, hp_max: 500,
    mana: 500, mana_max: 500,
    for: 50, des: 50, con: 50, int: 50,
    sorte: 100, fe: 100,
    arma: null, inventario: [], pet: null,
    conquistas: [], titulos: ['encarnado'],
    titulo_ativo: 'encarnado',
    regiao: 'valdris',
    morto: false, servo_de: null,
    status_negativos: [], status_positivos: [],
    boss_mortos: [], regioes_visitadas: ['valdris'],
    pvp_vitorias: 0, pvp_derrotas: 0,
    kills: 0, mortes: 0,
    cooldown_batalha: 0, cooldown_ultimate: {},
    criado_em: new Date().toISOString(),
    encarnando: true,
    dono_id,
    grupo_id
  };

  setEncarnacao(dono_id, {
    dono_id,
    personagem: personagem_enc,
    nome: nome_personagem,
    grupo_id,
    criado_em: Date.now()
  });

  // Salvar como jogador temporário
  salvarJogador(`enc_${dono_id}`, personagem_enc);

  return {
    sucesso: true,
    personagem: personagem_enc,
    msg_grupo: `🌟 *UM SER PODEROSO CHEGOU...* 🌟\n━━━━━━━━━━━━━━━━━━━━\n\n_O mundo tremeu levemente._\n_Algo ou alguém acabou de entrar no IMPERIUS._\n\n👤 Nome: *${nome_personagem}*\n\n_Ninguém sabe quem realmente é..._\n⚔️ _Evolua ou morra._`
  };
}

function ascender(dono_id) {
  const enc = getEncarnacao(dono_id);
  if (!enc) return { erro: '❌ Você não está encarnado no momento.' };

  const personagem = getJogador(`enc_${dono_id}`);
  const nome = enc.nome;

  // Deletar personagem encarnado
  deleteEncarnacao(dono_id);

  return {
    sucesso: true,
    nome,
    msg_grupo: `⚡ *O ÉTER RASGOU!* ⚡\n━━━━━━━━━━━━━━━━━━━━\n\n_O ser conhecido como *${nome}* se dissolveu no ar._\n_Uma força imensurável retornou ao seu trono._\n\n👑 *O DEUS VOLTOU.*\n\n_Que os mortais se curvem._\n☠️ _Evolua ou morra._`
  };
}

function processarMorteEncarnacao(enc_id, matador_id, matador_nome) {
  // Descobrir se é encarnação
  const enc_data = enc_id.startsWith('enc_') ? enc_id.replace('enc_', '') : null;
  if (!enc_data) return null;

  const enc = getEncarnacao(enc_data);
  if (!enc) return null;

  const nome_encarnado = enc.nome;

  // Sortear arma primordial
  const arma = ARMAS_PRIMORDIAIS[Math.floor(Math.random() * ARMAS_PRIMORDIAIS.length)];

  // Dar arma e título ao matador
  const matador = getJogador(matador_id);
  if (matador) {
    if (!matador.inventario) matador.inventario = [];
    matador.inventario.push(arma.id);
    matador.arma = arma.id;
    if (!matador.titulos) matador.titulos = [];
    if (!matador.titulos.includes('deicida')) matador.titulos.push('deicida');
    salvarJogador(matador_id, matador);
    adicionarConquista(matador_id, 'deicida');
    adicionarTitulo(matador_id, 'deicida');
  }

  // Remover encarnação
  deleteEncarnacao(enc_data);

  return {
    arma,
    msg_grupo: `💀 *A ENCARNAÇÃO DO DEUS FOI MORTA!* 💀\n━━━━━━━━━━━━━━━━━━━━\n\n⚔️ *${matador_nome}* matou *${nome_encarnado}*!\n\n_O mundo tremeu. O céu escureceu._\n_O Deus foi forçado a abandonar sua forma mortal._\n\n🏆 *${matador_nome}* recebeu:\n• 🏷️ Título: *⚡ Deicida*\n• 🌟 Arma: *${arma.nome}* (${arma.raridade})\n\n😡 _O Deus... não vai esquecer._\n\n👑 *O DEUS VOLTOU AO SEU TRONO.*`
  };
}

function isEncarnacao(jogador_id) {
  return jogador_id.startsWith('enc_');
}

function getEncarnacaoAtiva(dono_id) {
  return getEncarnacao(dono_id);
}

module.exports = { encarnar, ascender, processarMorteEncarnacao, isEncarnacao, getEncarnacaoAtiva };
