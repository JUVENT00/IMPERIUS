// ============================================================
// IMPERIUS RPG — SISTEMA DO DEUS v3.0
// ============================================================
const { getJogador, salvarJogador, todosJogadores, adicionarConquista, adicionarTitulo, getEventoDeus, setEventoDeus, deleteEventoDeus } = require('./db');
const { ARMAS_RARAS_DROP } = require('./gameData');

const BORDAS = {
  topo: '╔═★·°·❃·°·★·°·❃·°·★═╗',
  meio: '╠══════════════════╣',
  baixo: '╚═★·°·❃·°·★·°·❃·°·★═╝',
  linha: '╔══════════════════╗',
  fim: '╚══════════════════╝'
};

const DONO_ID = process.env.DONO_ID || '5567998161300@s.whatsapp.net';
const DONO_LID = '36821174120703';

function ehDono(id) {
  const limpo = id.replace('@s.whatsapp.net', '').replace('@lid', '');
  return limpo === DONO_ID.replace('@s.whatsapp.net', '') || limpo === DONO_LID;
}

// ── PROVOCAR DEUS ─────────────────────────────────────────
function provocarDeus(jogador_id, jid) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: `❌ Você não tem personagem!` };
  if (j.morto) return { erro: `❌ Mortos não provocam deuses!` };

  const evento = getEventoDeus();
  if (evento && evento.ativo) return { erro: `${BORDAS.topo}\n⚠️ Já há um evento do Deus ativo!\nAguarde o fim do evento.\n${BORDAS.baixo}` };

  return {
    msg_grupo: `${BORDAS.topo}\n   😈 PROVOCAÇÃO DIVINA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ⚠️ ${j.nome} ousou\n║ provocar o Deus!\n${BORDAS.meio}\n║ _Uma mensagem foi enviada..._\n║ _O mundo contém a respiração..._\n║ _Será que o Deus responderá?_\n${BORDAS.fim}`,
    msg_dono: `${BORDAS.topo}\n   ⚠️ PROVOCAÇÃO!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${j.nome} te provocou!\n║ Número: ${jogador_id}\n║ Nível: ${j.nivel || 1}\n║ Classe: ${j.classe}\n${BORDAS.meio}\n║ Aceita o desafio?\n║ ✅ /aceitardeus\n║ ❌ /ignorardeus\n${BORDAS.fim}`,
    jogador_nome: j.nome,
    jogador_id
  };
}

// ── ACEITAR EVENTO ────────────────────────────────────────
function aceitarEventoDeus(dono_id, jid) {
  if (!ehDono(dono_id)) {
    return { erro: `❌ Apenas o Deus pode aceitar!` };
  }

  const evento = {
    ativo: true,
    iniciado_em: Date.now(),
    jid,
    participantes: {},
    imperadores: []
  };

  setEventoDeus(evento);

  return {
    msg_grupo: `${BORDAS.topo}\n   ☠️ O DEUS ACORDOU!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ 😱 O DEUS desceu dos céus!\n║\n║ _Sua presença congela o ar._\n║ _Sua sombra cobre o mundo._\n║ _O chão treme sob seus pés._\n${BORDAS.meio}\n║ ⚠️ Nenhum mortal pode\n║ vencê-lo...\n║ Mas os bravos podem tentar!\n${BORDAS.meio}\n║ ⚔️ /atacardeus — Atacar\n║ 👑 /pediraju — Chamar Imperador\n${BORDAS.fim}`
  };
}

// ── IGNORAR PROVOCAÇÃO ────────────────────────────────────
function ignorarDeus(dono_id) {
  if (!ehDono(dono_id)) {
    return { erro: `❌ Apenas o Deus pode ignorar!` };
  }
  return {
    msg_grupo: `${BORDAS.topo}\n   😴 O DEUS IGNORA...\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ O Deus não se dignou\n║ a responder a provocação.\n║\n║ _"Nem merecem minha atenção."_\n${BORDAS.fim}`
  };
}

// ── ATACAR DEUS ───────────────────────────────────────────
function atacarDeus(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: `❌ Você não tem personagem!` };
  if (j.morto) return { erro: `❌ Mortos não atacam deuses!` };

  const evento = getEventoDeus();
  if (!evento || !evento.ativo) return { erro: `${BORDAS.topo}\n❌ Não há evento do Deus ativo!\nEspere alguém /provocardeus\n${BORDAS.baixo}` };

  // Calcular dano baseado nos atributos
  const dano_base = (j.for || 10) * 5 + (j.int || 5) * 3;
  const variacao = Math.floor(Math.random() * dano_base * 0.3);
  const dano = dano_base + variacao;

  // Registrar dano do participante
  if (!evento.participantes[jogador_id]) {
    evento.participantes[jogador_id] = { nome: j.nome, dano_total: 0, ataques: 0 };
  }
  evento.participantes[jogador_id].dano_total += dano;
  evento.participantes[jogador_id].ataques += 1;

  // Registrar no jogador
  j.dano_total_deus = (j.dano_total_deus || 0) + dano;
  salvarJogador(jogador_id, j);
  setEventoDeus(evento);

  // Dano do Deus ao jogador (sempre alto mas não mata)
  const dano_deus = Math.min(j.hp - 1, Math.floor(j.hp_max * 0.6));
  j.hp = Math.max(1, j.hp - dano_deus);
  salvarJogador(jogador_id, j);

  const hp_pct = Math.floor((j.hp / j.hp_max) * 10);
  const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);

  const respostas_deus = [
    '"Interessante... tente de novo."',
    '"Você ousou me tocar, mortal?"',
    '"Esse é o seu melhor?"',
    '"Eu mal senti isso."',
    '"Continue tentando, é divertido."'
  ];
  const resposta = respostas_deus[Math.floor(Math.random() * respostas_deus.length)];

  return {
    texto: `${BORDAS.topo}\n   ⚔️ ATAQUE AO DEUS!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ⚔️ ${j.nome} ataca!\n║ 💥 Dano causado: ${dano}\n${BORDAS.meio}\n║ ☠️ O Deus observa...\n║ _${resposta}_\n║ O golpe desaparece no ar.\n${BORDAS.meio}\n║ ☠️ O Deus contra-ataca!\n║ 💀 Dano recebido: ${dano_deus}\n║ ❤️ Seu HP: ${j.hp}/${j.hp_max}\n║ [${barra}]\n${BORDAS.meio}\n║ ⚔️ O que fazer?\n║ 1️⃣ /atacardeus\n║ 2️⃣ /habilidade\n║ 3️⃣ /usar [item]\n║ 4️⃣ /fugirdeus\n║ 5️⃣ /chamarpet\n║ 6️⃣ /pedirajuda\n${BORDAS.fim}`
  };
}

// ── PEDIR AJUDA DE IMPERADOR ──────────────────────────────
function pedirAjuda(jogador_id, jid) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: `❌ Você não tem personagem!` };

  const evento = getEventoDeus();
  if (!evento || !evento.ativo) return { erro: `❌ Não há evento do Deus ativo!` };

  // Buscar imperadores no banco
  const todos = todosJogadores();
  const imperadores = todos.filter(p => p.imperador && !p.morto && p.id !== jogador_id);

  if (imperadores.length === 0) {
    return {
      texto: `${BORDAS.topo}\n   👑 SEM IMPERADORES\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ⚠️ Não há Imperadores\n║ disponíveis no momento!\n║\n║ _Você está sozinho..._\n${BORDAS.fim}`,
      mencoes: []
    };
  }

  const mencoes = imperadores.map(i => i.id);
  const lista = imperadores.map(i => `║ 👑 @${i.id.replace('@s.whatsapp.net','')}`).join('\n');

  return {
    texto: `${BORDAS.topo}\n   🆘 PEDIDO DE AJUDA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ 📣 ${j.nome} precisa de ajuda!\n║ Enfrenta o DEUS!\n${BORDAS.meio}\n║ 👑 Imperadores chamados:\n${lista}\n${BORDAS.meio}\n║ ⚠️ Imperadores, ajudem!\n║ ✅ /aceitarajuda\n${BORDAS.fim}`,
    mencoes
  };
}

// ── ACEITAR AJUDA (IMPERADOR) ─────────────────────────────
function aceitarAjuda(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: `❌ Você não tem personagem!` };
  if (!j.imperador) return { erro: `❌ Apenas Imperadores podem ajudar!` };

  const evento = getEventoDeus();
  if (!evento || !evento.ativo) return { erro: `❌ Não há evento ativo!` };

  if (!evento.imperadores.includes(jogador_id)) {
    evento.imperadores.push(jogador_id);
    setEventoDeus(evento);
  }

  return {
    texto: `${BORDAS.topo}\n   👑 IMPERADOR CHEGOU!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ⚡ ${j.nome} responde\n║ ao chamado!\n║\n║ _O chão treme com\n║ sua chegada..._\n║ _O Deus ergue uma\n║ sobrancelha._\n${BORDAS.meio}\n║ 👑 Imperador na batalha!\n║ ❤️ HP: ${j.hp}/${j.hp_max}\n${BORDAS.fim}`
  };
}

// ── FUGIR DO DEUS ─────────────────────────────────────────
function fugirDeus(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Você não tem personagem!`;

  return `${BORDAS.topo}\n   💨 FUGA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${j.nome} foge da batalha!\n║\n║ _O Deus ri enquanto\n║ você recua..._\n║\n║ "Sábio. Mas covarde."\n${BORDAS.fim}`;
}

// ── DEUS DESCANSAR ────────────────────────────────────────
function deusDescansar(dono_id, jid) {
  if (!ehDono(dono_id)) {
    return { erro: `❌ Apenas o Deus pode encerrar!` };
  }

  const evento = getEventoDeus();
  if (!evento || !evento.ativo) return { erro: `❌ Não há evento ativo!` };

  // Encontrar quem causou mais dano
  let campeao = null;
  let maior_dano = 0;

  Object.entries(evento.participantes).forEach(([id, dados]) => {
    if (dados.dano_total > maior_dano) {
      maior_dano = dados.dano_total;
      campeao = { id, nome: dados.nome, dano: dados.dano_total };
    }
  });

  // Sortear arma para o campeão
  let arma_drop = null;
  let msg_drop = '';

  if (campeao && ARMAS_RARAS_DROP.length > 0) {
    arma_drop = ARMAS_RARAS_DROP[Math.floor(Math.random() * ARMAS_RARAS_DROP.length)];

    // Dar arma ao campeão
    const j_campeao = getJogador(campeao.id);
    if (j_campeao) {
      if (!j_campeao.inventario) j_campeao.inventario = [];
      j_campeao.inventario.push({ id: arma_drop.id, nome: arma_drop.nome, raridade: arma_drop.raridade });
      adicionarConquista(campeao.id, 'maior_dano_deus');
      adicionarTitulo(campeao.id, 'campeao_evento');
      salvarJogador(campeao.id, j_campeao);
    }

    msg_drop = `${BORDAS.meio}\n║ 🎁 ITEM DROPADO!\n║ ${arma_drop.nome}\n║ Raridade: ${arma_drop.raridade}\n${BORDAS.meio}\n║ 🏆 MAIOR DANO:\n║ 👤 ${campeao.nome}\n║ 💥 Dano total: ${campeao.dano.toLocaleString()}\n║\n║ A arma pertence a você!\n`;
  }

  // Adicionar conquista a todos participantes
  Object.keys(evento.participantes).forEach(id => {
    adicionarConquista(id, 'deicida');
  });

  deleteEventoDeus();

  return {
    msg_grupo: `${BORDAS.topo}\n   😴 O DEUS DESCANSA\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ O Deus olha para os\n║ guerreiros ao redor...\n║\n║ "Vocês foram corajosos."\n║ "Mas ainda são mortais."\n║\n║ _O Deus fecha os olhos..._\n║ _O céu escurece..._\n║ _O mundo respira aliviado..._\n${msg_drop}${BORDAS.meio}\n║ ⏳ O Deus dorme...\n║ Até o próximo despertar. ☠️\n${BORDAS.fim}`
  };
}

// ── STATUS DO EVENTO ──────────────────────────────────────
function statusEvento() {
  const evento = getEventoDeus();
  if (!evento || !evento.ativo) {
    return `${BORDAS.topo}\n   ☠️ EVENTO DIVINO\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ 😴 O Deus está dormindo.\n║ Nenhum evento ativo.\n║\n║ Use /provocardeus\n║ para tentar despertar!\n${BORDAS.fim}`;
  }

  const participantes = Object.values(evento.participantes);
  const total_dano = participantes.reduce((s, p) => s + p.dano_total, 0);

  let lista = participantes
    .sort((a, b) => b.dano_total - a.dano_total)
    .slice(0, 5)
    .map((p, i) => `║ ${i+1}. ${p.nome}: ${p.dano_total.toLocaleString()} dano`)
    .join('\n');

  return `${BORDAS.topo}\n   ☠️ EVENTO ATIVO!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ O Deus está ACORDADO!\n║ ❤️ HP: ∞ / ∞\n║ [██████████] ???%\n${BORDAS.meio}\n║ 👥 ${participantes.length} guerreiros lutando\n║ 💥 Dano total: ${total_dano.toLocaleString()}\n${BORDAS.meio}\n║ 🏆 TOP DANO:\n${lista || '║ Nenhum ataque ainda'}\n${BORDAS.fim}`;
}

module.exports = {
  provocarDeus, aceitarEventoDeus, ignorarDeus,
  atacarDeus, pedirAjuda, aceitarAjuda,
  fugirDeus, deusDescansar, statusEvento
};
