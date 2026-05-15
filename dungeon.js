// ============================================================
// IMPERIUS RPG — MASMORRAS E CASAMENTO v3.0
// ============================================================
const { getJogador, salvarJogador, adicionarConquista, adicionarXP, adicionarMoedas, getCasamento, setCasamento, deleteCasamento } = require('./db');
const { MASMORRAS } = require('./gameData');

const BORDAS = {
  topo: '╔═★·°·❃·°·★·°·❃·°·★═╗',
  meio: '╠══════════════════╣',
  baixo: '╚═★·°·❃·°·★·°·❃·°·★═╝',
  linha: '╔══════════════════╗',
  fim: '╚══════════════════╝'
};

// ── MASMORRAS ─────────────────────────────────────────────
function verMasmorras(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Você não tem personagem!`;

  let texto = `${BORDAS.topo}\n   🏰 MASMORRAS 🏰\n${BORDAS.baixo}\n\n${BORDAS.linha}\n`;
  MASMORRAS.forEach((m, i) => {
    const disponivel = (j.nivel || 1) >= m.nivel_min;
    texto += `║ ${disponivel ? '✅' : '🔒'} ${m.nome}\n`;
    texto += `║    ⭐ Nível mín: ${m.nivel_min}\n`;
    texto += `║    🏢 Andares: ${m.andares}\n`;
    texto += `║    📜 ${m.descricao}\n`;
    if (i < MASMORRAS.length - 1) texto += `${BORDAS.meio}\n`;
  });
  texto += `${BORDAS.fim}\n\n_Use /masmorra [nome] para entrar!_`;
  return texto;
}

function entrarMasmorra(jogador_id, nome_masmorra) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: `❌ Você não tem personagem!` };
  if (j.morto) return { erro: `❌ Mortos não entram em masmorras!` };

  const agora = Date.now();
  if (j.cooldown_masmorra && agora - j.cooldown_masmorra < 2 * 60 * 60 * 1000) {
    const restante = Math.ceil((2 * 60 * 60 * 1000 - (agora - j.cooldown_masmorra)) / 60000);
    return { erro: `${BORDAS.topo}\n⏳ Cooldown de masmorra!\nAguarde ${restante} minutos.\n${BORDAS.baixo}` };
  }

  const masmorra = MASMORRAS.find(m =>
    m.nome.toLowerCase().includes(nome_masmorra.toLowerCase()) ||
    m.id.toLowerCase().includes(nome_masmorra.toLowerCase())
  );

  if (!masmorra) return { erro: `${BORDAS.topo}\n❌ Masmorra não encontrada!\nUse /masmorras para ver a lista\n${BORDAS.baixo}` };
  if ((j.nivel || 1) < masmorra.nivel_min) return { erro: `${BORDAS.topo}\n❌ Nível insuficiente!\nPrecisa: Nível ${masmorra.nivel_min}\nSeu nível: ${j.nivel || 1}\n${BORDAS.baixo}` };

  // Simulação de masmorra
  let sobreviveu = Math.random() > 0.3;
  const xp_ganho = Math.floor(Math.random() * (masmorra.recompensa.xp * 0.5) + masmorra.recompensa.xp * 0.5);
  const moedas_ganhas = Math.floor(Math.random() * (masmorra.recompensa.moedas[1] - masmorra.recompensa.moedas[0])) + masmorra.recompensa.moedas[0];

  j.cooldown_masmorra = agora;

  let resultado_texto = '';
  if (sobreviveu) {
    const nivel_result = adicionarXP(jogador_id, xp_ganho);
    adicionarMoedas(jogador_id, moedas_ganhas);
    resultado_texto = `${BORDAS.topo}\n   🏰 MASMORRA CONCLUÍDA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ✅ ${j.nome} sobreviveu!\n║ 🏰 ${masmorra.nome}\n${BORDAS.meio}\n║ 📊 RECOMPENSAS:\n║ ⭐ XP: +${xp_ganho}\n║ 💰 Moedas: +${moedas_ganhas}\n${nivel_result?.subiu ? `${BORDAS.meio}\n║ 🎉 SUBIU PARA NÍVEL ${nivel_result.nivelDepois}!\n` : ''}${BORDAS.fim}`;
  } else {
    j.hp = Math.max(1, Math.floor(j.hp_max * 0.1));
    salvarJogador(jogador_id, j);
    resultado_texto = `${BORDAS.topo}\n   🏰 DERROTA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ❌ ${j.nome} foi derrotado!\n║ 🏰 ${masmorra.nome}\n${BORDAS.meio}\n║ ❤️ HP: ${j.hp}/${j.hp_max}\n║ _Você escapou por pouco..._\n${BORDAS.fim}`;
  }

  salvarJogador(jogador_id, j);
  return { texto: resultado_texto };
}

// ── ACAMPAR ───────────────────────────────────────────────
function acampar(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Você não tem personagem!`;
  if (j.morto) return `❌ Mortos não acampam!`;

  const agora = Date.now();
  if (j.cooldown_acampar && agora - j.cooldown_acampar < 30 * 60 * 1000) {
    const restante = Math.ceil((30 * 60 * 1000 - (agora - j.cooldown_acampar)) / 60000);
    return `${BORDAS.topo}\n⏳ Você já acampou recentemente!\nAguarde ${restante} minutos.\n${BORDAS.baixo}`;
  }

  const cura = Math.floor(j.hp_max * 0.5);
  const mana_recuperada = Math.floor(j.mana_max * 0.5);
  j.hp = Math.min(j.hp_max, j.hp + cura);
  j.mana = Math.min(j.mana_max, j.mana + mana_recuperada);
  j.cooldown_acampar = agora;
  salvarJogador(jogador_id, j);

  return `${BORDAS.topo}\n   🏕️ ACAMPANDO\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${j.nome} descansa...\n║ _O fogo crepita suavemente._\n║ _As estrelas brilham._\n${BORDAS.meio}\n║ ❤️ HP: +${cura} → ${j.hp}/${j.hp_max}\n║ 💧 Mana: +${mana_recuperada} → ${j.mana}/${j.mana_max}\n${BORDAS.fim}`;
}

// ── CASAMENTO ─────────────────────────────────────────────
function pedirCasamento(jogador_id, alvo_id) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: `❌ Você não tem personagem!` };
  if (j.casado_com) return { erro: `${BORDAS.topo}\n❌ Você já é casado!\n${BORDAS.baixo}` };

  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: `❌ Jogador não encontrado!` };
  if (alvo.casado_com) return { erro: `❌ ${alvo.nome} já é casado!` };
  if (jogador_id === alvo_id) return { erro: `❌ Você não pode se casar consigo mesmo!` };

  const custo = 1000;
  if (j.moedas < custo) return { erro: `${BORDAS.topo}\n❌ Casamento custa ${custo} moedas!\nVocê tem: ${j.moedas}\n${BORDAS.baixo}` };

  return {
    msg_proponente: `${BORDAS.topo}\n💍 Proposta enviada!\n${BORDAS.baixo}`,
    msg_alvo: `${BORDAS.topo}\n   💍 PROPOSTA DE CASAMENTO!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ 💕 ${j.nome} quer se\n║ casar com você!\n${BORDAS.meio}\n║ ✅ /aceitarcasamento\n║ ❌ /recusarcasamento\n${BORDAS.fim}`,
    proponente_id: jogador_id,
    proponente_nome: j.nome,
    custo
  };
}

function aceitarCasamento(jogador_id, proponente_id, proponente_nome, custo) {
  const j = getJogador(jogador_id);
  const proponente = getJogador(proponente_id);
  if (!j || !proponente) return `❌ Jogadores não encontrados!`;

  proponente.moedas -= custo;
  proponente.casado_com = jogador_id;
  j.casado_com = proponente_id;

  salvarJogador(proponente_id, proponente);
  salvarJogador(jogador_id, j);

  return `${BORDAS.topo}\n   💍 CASAMENTO! 💍\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ 💕 ${proponente_nome} e ${j.nome}\n║ estão casados!\n║\n║ _Que o IMPERIUS testemunhe\n║ esta união!_\n${BORDAS.fim}`;
}

function divorciar(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Você não tem personagem!`;
  if (!j.casado_com) return `❌ Você não é casado!`;

  const conjuge = getJogador(j.casado_com);
  if (conjuge) { conjuge.casado_com = null; salvarJogador(j.casado_com, conjuge); }

  j.casado_com = null;
  salvarJogador(jogador_id, j);

  return `${BORDAS.topo}\n   💔 DIVÓRCIO\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ O casamento chegou ao fim.\n║ _Às vezes o IMPERIUS\n║ é cruel com o amor._\n${BORDAS.fim}`;
}

// ── LOGIN DIÁRIO ──────────────────────────────────────────
function loginDiario(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Você não tem personagem!`;

  const hoje = new Date().toDateString();
  if (!j.login_diario) j.login_diario = { data: '', streak: 0 };

  if (j.login_diario.data === hoje) {
    return `${BORDAS.topo}\n⏳ Você já coletou hoje!\nVolte amanhã!\n${BORDAS.baixo}`;
  }

  const ontem = new Date(Date.now() - 86400000).toDateString();
  if (j.login_diario.data === ontem) {
    j.login_diario.streak = (j.login_diario.streak || 0) + 1;
  } else {
    j.login_diario.streak = 1;
  }

  j.login_diario.data = hoje;

  const streak = j.login_diario.streak;
  let moedas_bonus = 50 + (streak * 10);
  let xp_bonus = 30 + (streak * 5);

  if (streak >= 30) { moedas_bonus += 500; xp_bonus += 300; }
  else if (streak >= 7) { moedas_bonus += 100; xp_bonus += 50; }

  j.moedas = (j.moedas || 0) + moedas_bonus;
  salvarJogador(jogador_id, j);
  adicionarXP(jogador_id, xp_bonus);

  return `${BORDAS.topo}\n   📅 LOGIN DIÁRIO!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ✅ ${j.nome}!\n║ 🔥 Sequência: ${streak} dias\n${BORDAS.meio}\n║ 🎁 RECOMPENSAS:\n║ 💰 Moedas: +${moedas_bonus}\n║ ⭐ XP: +${xp_bonus}\n${streak >= 7 ? `${BORDAS.meio}\n║ 🎉 BÔNUS DE SEQUÊNCIA!\n` : ''}${BORDAS.fim}`;
}

module.exports = {
  verMasmorras, entrarMasmorra, acampar,
  pedirCasamento, aceitarCasamento, divorciar,
  loginDiario
};
