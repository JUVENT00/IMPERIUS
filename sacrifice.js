// ============================================================
// IMPERIUS RPG — SISTEMA DE SACRIFÍCIO
// ============================================================
const { getJogador, salvarJogador, getSacrificio, setSacrificio, deleteSacrificio, getAllSacrificios, adicionarConquista, adicionarTitulo, getPendente, setPendente, deletePendente } = require('./db');

function criarSacrificio(jogador_id, jogador_nome, pedido, oferta) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Mortos não fazem sacrifícios.' };

  const sac_existente = getSacrificio(jogador_id);
  if (sac_existente) return { erro: '⏳ Você já tem um sacrifício pendente. Aguarde o Deus responder.' };

  setSacrificio(jogador_id, {
    jogador_id,
    jogador_nome,
    oferta,
    pedido,
    criado_em: Date.now()
  });

  adicionarConquista(jogador_id, 'sacrificado');
  adicionarTitulo(jogador_id, 'sacrificador');

  return {
    sucesso: true,
    msg_grupo: `🩸 *SACRIFÍCIO AO DEUS* 🩸\n━━━━━━━━━━━━━━━━━━━━\n\n💀 *${jogador_nome}* fez uma oferta ao Deus!\n\n🎁 *Oferta:* ${oferta}\n🙏 *Pedido:* ${pedido}\n\n⏳ _O Deus analisará sua oferta..._\n_Que os deuses tenham misericórdia._`
  };
}

function aceitarSacrificio(alvo_id, recompensa) {
  const sac = getSacrificio(alvo_id);
  if (!sac) return { erro: '❌ Nenhum sacrifício pendente deste jogador.' };

  const jogador = getJogador(alvo_id);
  if (!jogador) return { erro: '❌ Jogador não encontrado.' };

  // Aplicar oferta (cobrar do jogador)
  aplicarOferta(jogador, sac.oferta);
  salvarJogador(alvo_id, jogador);
  deleteSacrificio(alvo_id);

  return {
    sucesso: true,
    msg_grupo: `⚡ *O DEUS ACEITOU O SACRIFÍCIO!* ⚡\n━━━━━━━━━━━━━━━━━━━━\n\n🩸 *${sac.jogador_nome}* foi agraciado!\n\n🎁 Oferta entregue: _${sac.oferta}_\n✨ Recompensa divina: *${recompensa}*\n\n_O Deus é generoso com os dignos._\n⚔️ _Evolua ou morra._`
  };
}

function recusarSacrificio(alvo_id) {
  const sac = getSacrificio(alvo_id);
  if (!sac) return { erro: '❌ Nenhum sacrifício pendente deste jogador.' };

  const jogador = getJogador(alvo_id);
  if (!jogador) return { erro: '❌ Jogador não encontrado.' };

  // Cobra mesmo assim — o Deus não devolve nada
  aplicarOferta(jogador, sac.oferta);
  salvarJogador(alvo_id, jogador);
  deleteSacrificio(alvo_id);

  return {
    sucesso: true,
    msg_grupo: `🔥 *O DEUS RECUSOU O SACRIFÍCIO!* 🔥\n━━━━━━━━━━━━━━━━━━━━\n\n😈 *${sac.jogador_nome}* foi desprezado!\n\n🎁 Oferta perdida: _${sac.oferta}_\n❌ O Deus não devolveu nada.\n\n_O Deus não negocia com os fracos._\n💀 _Evolua ou morra._`
  };
}

function aplicarOferta(jogador, oferta) {
  const oferta_lower = oferta.toLowerCase();

  // Moedas
  const moedas_match = oferta_lower.match(/(\d+)\s*(moeda|gold|coin)/);
  if (moedas_match) {
    const valor = parseInt(moedas_match[1]);
    jogador.moedas = Math.max(0, jogador.moedas - valor);
  }

  // HP (partes do corpo)
  if (oferta_lower.includes('olho') || oferta_lower.includes('olhos')) {
    jogador.hp = Math.max(1, jogador.hp - Math.floor(jogador.hp * 0.2));
    jogador.hp_max = Math.max(1, jogador.hp_max - Math.floor(jogador.hp_max * 0.2));
    if (!jogador.status_negativos) jogador.status_negativos = [];
    jogador.status_negativos.push('cego_parcial');
  }
  if (oferta_lower.includes('braço') || oferta_lower.includes('braco') || oferta_lower.includes('mão') || oferta_lower.includes('mao')) {
    jogador.for = Math.max(1, jogador.for - 5);
    jogador.hp = Math.max(1, jogador.hp - Math.floor(jogador.hp * 0.15));
  }
  if (oferta_lower.includes('coração') || oferta_lower.includes('coracao')) {
    jogador.hp = Math.max(1, Math.floor(jogador.hp * 0.5));
    jogador.hp_max = Math.max(1, Math.floor(jogador.hp_max * 0.5));
  }
  if (oferta_lower.includes('voz')) {
    if (!jogador.status_negativos) jogador.status_negativos = [];
    jogador.status_negativos.push('sem_voz');
  }
  if (oferta_lower.includes('perna') || oferta_lower.includes('pé') || oferta_lower.includes('pe')) {
    jogador.des = Math.max(1, jogador.des - 5);
  }
  if (oferta_lower.includes('sangue')) {
    jogador.hp_max = Math.max(1, jogador.hp_max - Math.floor(jogador.hp_max * 0.1));
    jogador.hp = Math.min(jogador.hp, jogador.hp_max);
  }

  // XP
  const xp_match = oferta_lower.match(/(\d+)\s*xp/);
  if (xp_match) {
    jogador.xp = Math.max(0, jogador.xp - parseInt(xp_match[1]));
  }

  // Item
  if (oferta_lower.includes('item') || oferta_lower.includes('arma')) {
    if (jogador.arma) jogador.arma = null;
  }
}

// Sacrifício de companheiro (jogador alvo precisa aceitar)
function pedirSacrificioParceiro(sacrificante_id, alvo_id, alvo_nome, pedido) {
  setPendente(`sacrificio_parceiro_${alvo_id}`, {
    tipo: 'sacrificio_parceiro',
    sacrificante_id,
    alvo_id,
    alvo_nome,
    pedido,
    criado_em: Date.now()
  });

  return `⚠️ *${alvo_nome}*, você foi escolhido como sacrifício!\n\n🙏 O pedido do sacrificante: _${pedido}_\n\n💀 Você aceita ser sacrificado ao Deus?\n\n✅ */aceitarmorte* — Aceitar (você morre)\n❌ */recusarmorte* — Recusar`;
}

function aceitarMorteSacrificio(alvo_id) {
  const pendente = getPendente(`sacrificio_parceiro_${alvo_id}`);
  if (!pendente) return { erro: '❌ Nenhum pedido de sacrifício pendente.' };

  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: '❌ Jogador não encontrado.' };

  alvo.morto = true;
  alvo.hp_max = 0;
  alvo.mortes = (alvo.mortes || 0) + 1;
  salvarJogador(alvo_id, alvo);
  deletePendente(`sacrificio_parceiro_${alvo_id}`);

  return {
    sucesso: true,
    sacrificante_id: pendente.sacrificante_id,
    msg_grupo: `💀 *SACRIFÍCIO HUMANO REALIZADO!* 💀\n━━━━━━━━━━━━━━━━━━━━\n\n🩸 *${alvo.nome}* aceitou ser sacrificado!\n_Que o Deus receba esta alma..._\n\n⏳ Aguardando o julgamento divino.`
  };
}

function recusarMorteSacrificio(alvo_id) {
  const pendente = getPendente(`sacrificio_parceiro_${alvo_id}`);
  if (!pendente) return { erro: '❌ Nenhum pedido pendente.' };

  deletePendente(`sacrificio_parceiro_${alvo_id}`);

  return {
    sucesso: true,
    sacrificante_id: pendente.sacrificante_id,
    msg_grupo: `❌ *${pendente.alvo_nome}* recusou ser sacrificado!\n\n😡 _O Deus ficou desagradado com a hesitação..._`
  };
}

function verSacrificiosPendentes() {
  const todos = getAllSacrificios();
  if (todos.length === 0) return '📭 Nenhum sacrifício pendente.';

  let texto = `🩸 *SACRIFÍCIOS PENDENTES* 🩸\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  todos.forEach((s, i) => {
    texto += `*${i + 1}.* ${s.jogador_nome}\n`;
    texto += `   🎁 Oferta: _${s.oferta}_\n`;
    texto += `   🙏 Pedido: _${s.pedido}_\n\n`;
  });
  texto += `Use */aceitarsacrificio @jogador [recompensa]* ou */recusarsacrificio @jogador*`;
  return texto;
}

module.exports = {
  criarSacrificio, aceitarSacrificio, recusarSacrificio,
  pedirSacrificioParceiro, aceitarMorteSacrificio, recusarMorteSacrificio,
  verSacrificiosPendentes
};
