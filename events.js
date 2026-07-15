// ============================================================
// IMPERIUS RPG — EVENTOS, RANKING, MISSÕES
// ============================================================
const { getJogador, salvarJogador, adicionarXP, adicionarMoedas, adicionarConquista, adicionarTitulo, getRanking, getConfig, setConfig, todosJogadores } = require('./db');
const { CONQUISTAS, TITULOS } = require('./gameData');

function verRanking() {
  const top = getRanking();
  if (top.length === 0) return '📭 Nenhum jogador no ranking ainda.';

  const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  let texto = `👑 *RANKING DO IMPERIUS* 👑\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  top.forEach((j, i) => {
    texto += `${medalhas[i]} *${j.nome}* [${j.rank}]\n`;
    texto += `   📚 XP: ${j.xp} | 💀 Kills: ${j.kills || 0}\n\n`;
  });

  return texto;
}

function verRankingConquistas() {
  const jogadores = todosJogadores();
  if (!jogadores || jogadores.length === 0) return '📭 Nenhum jogador encontrado ainda.';

  const total_conquistas = Object.keys(CONQUISTAS).length;
  const ordenados = jogadores
    .map(j => ({ nome: j.nome, qtd: (j.conquistas || []).length }))
    .filter(j => j.qtd > 0)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 10);

  if (ordenados.length === 0) return '📭 Ninguém completou nenhuma conquista ainda. Vá batalhar!';

  const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  let texto = `🏆 *RANKING DE CONQUISTAS* 🏆\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  ordenados.forEach((j, i) => {
    texto += `${medalhas[i]} *${j.nome}* — ${j.qtd}/${total_conquistas} conquistas\n`;
  });
  texto += `\n📝 Use */conquistas* para ver as suas.`;
  return texto;
}

function verConquistas(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  const conquistadas = jogador.conquistas || [];
  const total = Object.keys(CONQUISTAS).length;

  let texto = `🏆 *CONQUISTAS DE ${jogador.nome.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  texto += `Conquistadas: *${conquistadas.length}/${total}*\n\n`;

  if (conquistadas.length === 0) {
    texto += `_Nenhuma conquista ainda. Vá batalhar!_`;
  } else {
    conquistadas.forEach(key => {
      const c = CONQUISTAS[key];
      if (c) texto += `✅ *${c.nome}*\n   _${c.desc}_\n\n`;
    });
  }

  return texto;
}

function verTitulos(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  let texto = `🏷️ *TÍTULOS DE ${jogador.nome.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (!jogador.titulos || jogador.titulos.length === 0) {
    texto += `_Nenhum título ainda._`;
  } else {
    jogador.titulos.forEach(key => {
      const t = TITULOS[key];
      const ativo = jogador.titulo_ativo === key ? ' ← *ATIVO*' : '';
      texto += `• ${t || key}${ativo}\n`;
    });
  }

  texto += `\n📝 Use */usartitulo [nome]* para equipar`;
  return texto;
}

function usarTitulo(jogador_id, titulo) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  const key = Object.keys(TITULOS).find(k =>
    k.toLowerCase().includes(titulo.toLowerCase()) ||
    (TITULOS[k] || '').toLowerCase().includes(titulo.toLowerCase())
  );

  if (!key) return '❌ Título não encontrado.';
  if (!jogador.titulos?.includes(key)) return '❌ Você não possui este título.';

  jogador.titulo_ativo = key;
  salvarJogador(jogador_id, jogador);

  return `✅ Título *${TITULOS[key]}* equipado!`;
}

// ── MISSÕES DIÁRIAS ────────────────────────────────────────
const DEFINICAO_MISSOES = [
  { id: 'batalhar_5', tipo: 'batalhar', meta: 5, nome: '⚔️ Guerreiro Diário', desc: 'Batalhe 5 vezes', xp: 200, moedas: 100 },
  { id: 'boss_1', tipo: 'boss', meta: 1, nome: '💀 Caçador de Bosses', desc: 'Derrote 1 boss', xp: 500, moedas: 250 },
  { id: 'viajar_1', tipo: 'viajar', meta: 1, nome: '🗺️ Viajante', desc: 'Viaje para uma nova região', xp: 150, moedas: 75 },
  { id: 'pvp_1', tipo: 'pvp', meta: 1, nome: '⚔️ Combatente PvP', desc: 'Vença 1 PvP', xp: 300, moedas: 150 },
];

function normalizarBusca(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function garantirMissoesDoDia(jogador) {
  const hoje = new Date().toDateString();
  if (jogador.missoes_diarias?.data !== hoje) {
    jogador.missoes_diarias = { data: hoje, feitas: [], progresso: {} };
  }
  if (!jogador.missoes_diarias.progresso) jogador.missoes_diarias.progresso = {};
}

// Chamada nos pontos de progresso do jogo (vitória em batalha, boss, viagem, pvp)
function progredirMissao(jogador_id, tipo) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return;
  garantirMissoesDoDia(jogador);

  const missao = DEFINICAO_MISSOES.find(m => m.tipo === tipo);
  if (!missao) { salvarJogador(jogador_id, jogador); return; }
  if (jogador.missoes_diarias.feitas.includes(missao.id)) { salvarJogador(jogador_id, jogador); return; }

  const atual = jogador.missoes_diarias.progresso[missao.id] || 0;
  jogador.missoes_diarias.progresso[missao.id] = Math.min(missao.meta, atual + 1);
  salvarJogador(jogador_id, jogador);
}

function verMissoes(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  garantirMissoesDoDia(jogador);
  salvarJogador(jogador_id, jogador);

  let texto = `📋 *MISSÕES DIÁRIAS*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  DEFINICAO_MISSOES.forEach(m => {
    const feita = jogador.missoes_diarias.feitas.includes(m.id);
    const progresso = jogador.missoes_diarias.progresso[m.id] || 0;
    const pronta = !feita && progresso >= m.meta;
    const icone = feita ? '✅' : (pronta ? '🎁' : '⬜');
    texto += `${icone} *${m.nome}*\n   ${m.desc} (${Math.min(progresso, m.meta)}/${m.meta})\n   🏆 ${m.xp} XP + ${m.moedas} moedas\n`;
    if (pronta) texto += `   ➡️ */coletarmissao ${m.id}*\n`;
    texto += `\n`;
  });

  return texto;
}

function coletarMissao(jogador_id, busca) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  garantirMissoesDoDia(jogador);

  const alvo = normalizarBusca(busca);
  const missao = DEFINICAO_MISSOES.find(m =>
    normalizarBusca(m.id).includes(alvo) || normalizarBusca(m.nome).includes(alvo)
  );
  if (!missao) { salvarJogador(jogador_id, jogador); return '❌ Missão não encontrada. Use /missoes para ver a lista.'; }

  if (jogador.missoes_diarias.feitas.includes(missao.id)) {
    salvarJogador(jogador_id, jogador);
    return '❌ Você já coletou essa missão hoje!';
  }

  const progresso = jogador.missoes_diarias.progresso[missao.id] || 0;
  if (progresso < missao.meta) {
    salvarJogador(jogador_id, jogador);
    return `❌ Missão incompleta! Progresso: ${progresso}/${missao.meta}`;
  }

  jogador.missoes_diarias.feitas.push(missao.id);
  salvarJogador(jogador_id, jogador); // persiste a missão como coletada antes de aplicar XP/moedas
  adicionarXP(jogador_id, missao.xp);
  adicionarMoedas(jogador_id, missao.moedas);

  return `🎁 *${missao.nome}* coletada!\n⭐ +${missao.xp} XP | 💰 +${missao.moedas} moedas`;
}

// ── COMANDOS DO DONO ──────────────────────────────────────
function matarJogador(alvo_id, motivo) {
  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: '❌ Jogador não encontrado.' };
  if (alvo.morto) return { erro: '❌ Jogador já está morto.' };

  alvo.morto = true;
  alvo.hp_max = 0;
  alvo.mortes = (alvo.mortes || 0) + 1;
  salvarJogador(alvo_id, alvo);

  return {
    sucesso: true,
    msg: `☠️ *O DEUS AGIU!* ☠️\n━━━━━━━━━━━━━━━━━━━━\n\n💀 *${alvo.nome}* foi morto pelo Deus!\n_${motivo || 'Os deuses não explicam suas ações.'}_\n\n_Evolua ou morra._`
  };
}

function darItem(alvo_id, item) {
  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: '❌ Jogador não encontrado.' };

  if (!alvo.inventario) alvo.inventario = [];
  alvo.inventario.push(item);
  salvarJogador(alvo_id, alvo);

  return {
    sucesso: true,
    msg: `✨ *BÊNÇÃO DIVINA!* ✨\n\n🎁 *${alvo.nome}* recebeu: *${item}*\n_O Deus foi generoso hoje._`
  };
}

function abencoarJogador(alvo_id, bencao) {
  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: '❌ Jogador não encontrado.' };

  alvo.hp_max = alvo.hp;
  alvo.mana = alvo.mana_max || 100;
  alvo.moedas += 500;
  alvo.morto = false;
  if (!alvo.status_positivos) alvo.status_positivos = [];
  alvo.status_positivos.push('abencado');
  salvarJogador(alvo_id, alvo);

  return {
    sucesso: true,
    msg: `⚡ *BÊNÇÃO DO DEUS!* ⚡\n━━━━━━━━━━━━━━━━━━━━\n\n✨ *${alvo.nome}* foi abençoado!\n${bencao || ''}\n\n• HP restaurado\n• Mana restaurada\n• +500 moedas\n\n_O Deus sorriu para você._`
  };
}

function maldicionarJogador(alvo_id, maldicao) {
  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: '❌ Jogador não encontrado.' };

  alvo.hp_max = Math.floor(alvo.hp_max * 0.5);
  alvo.mana = 0;
  alvo.moedas = Math.floor(alvo.moedas * 0.5);
  if (!alvo.status_negativos) alvo.status_negativos = [];
  alvo.status_negativos.push('amaldicoado_deus');
  salvarJogador(alvo_id, alvo);

  return {
    sucesso: true,
    msg: `💀 *MALDIÇÃO DO DEUS!* 💀\n━━━━━━━━━━━━━━━━━━━━\n\n😈 *${alvo.nome}* foi amaldiçoado!\n${maldicao || ''}\n\n• HP reduzido à metade\n• Mana zerada\n• 50% das moedas perdidas\n\n_O Deus ficou descontente._`
  };
}

function eventoGlobal(mensagem) {
  return `🌍 *EVENTO GLOBAL DO DEUS* 🌍\n━━━━━━━━━━━━━━━━━━━━\n\n${mensagem}\n\n_O Deus falou. O mundo ouviu._\n⚔️ _Evolua ou morra._`;
}

function statusBot() {
  const jogadores = todosJogadores();
  const vivos = jogadores.filter(j => !j.morto).length;
  const mortos = jogadores.filter(j => j.morto).length;
  const total = jogadores.length;

  return `📊 *STATUS DO IMPERIUS*\n━━━━━━━━━━━━━━━━━━━━\n\n👥 Total de jogadores: *${total}*\n✅ Vivos: *${vivos}*\n💀 Mortos: *${mortos}*\n\n_O mundo continua girando._`;
}

module.exports = {
  verRanking, verRankingConquistas, verConquistas, verTitulos, usarTitulo, verMissoes, progredirMissao, coletarMissao,
  matarJogador, darItem, abencoarJogador, maldicionarJogador,
  eventoGlobal, statusBot
};
