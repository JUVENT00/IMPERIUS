// ============================================================
// IMPERIUS RPG — EVENTOS, RANKING, MISSÕES
// ============================================================
const { getJogador, salvarJogador, adicionarXP, adicionarMoedas, adicionarConquista, adicionarTitulo, getRanking, getConfig, setConfig, todosJogadores } = require('./db');
const { CONQUISTAS, TITULOS } = require('../data/gameData');

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

function verMissoes(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  const hoje = new Date().toDateString();
  if (jogador.missoes_diarias?.data !== hoje) {
    jogador.missoes_diarias = { data: hoje, feitas: [] };
    salvarJogador(jogador_id, jogador);
  }

  const missoes = [
    { id: 'batalhar_5', nome: '⚔️ Guerreiro Diário', desc: 'Batalhe 5 vezes', recompensa: '200 XP + 100 moedas' },
    { id: 'boss_1', nome: '💀 Caçador de Bosses', desc: 'Derrote 1 boss', recompensa: '500 XP + 250 moedas' },
    { id: 'viajar_1', nome: '🗺️ Viajante', desc: 'Viaje para uma nova região', recompensa: '150 XP + 75 moedas' },
    { id: 'pvp_1', nome: '⚔️ Combatente PvP', desc: 'Vença 1 PvP', recompensa: '300 XP + 150 moedas' },
  ];

  let texto = `📋 *MISSÕES DIÁRIAS*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  missoes.forEach(m => {
    const feita = jogador.missoes_diarias.feitas.includes(m.id);
    texto += `${feita ? '✅' : '⬜'} *${m.nome}*\n   ${m.desc}\n   🏆 ${m.recompensa}\n\n`;
  });

  return texto;
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
  verRanking, verConquistas, verTitulos, usarTitulo, verMissoes,
  matarJogador, darItem, abencoarJogador, maldicionarJogador,
  eventoGlobal, statusBot
};
