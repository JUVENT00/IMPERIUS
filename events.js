// ============================================================
// IMPERIUS RPG — EVENTOS, RANKING, MISSÕES
// ============================================================
const { getJogador, salvarJogador, adicionarXP, adicionarMoedas, adicionarConquista, adicionarTitulo, getRanking, getConfig, setConfig, todosJogadores, formatarBelarium, formatarPreco } = require('./db');
const { CONQUISTAS, TITULOS, ARMAS, ARMADURAS, ITENS_LOJA } = require('./gameData');

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

// Condições reais de cada título, conferidas direto no código que concede
// cada um (adicionarTitulo). Onde a condição depende de um sistema que não
// está nesses arquivos (sacrifício/encarnação) ou não tem gatilho no código
// ainda, isso é dito honestamente em vez de inventar uma explicação.
const REQUISITOS_TITULOS = {
  matador_dragao: 'Derrote um boss com "Dragão" no nome',
  livre: 'Sendo servo de um Necromante, consiga se libertar com /libertar',
  perdedor: 'Morra 10 vezes (em batalha ou PvP)',
  mais_fraco: 'Perca uma luta de PvP',
  deicida: 'Participe de uma batalha contra o Deus',
  agraciado: 'Tire a classe rara "Ajudante de Deus" na roleta de classes',
  servo: 'Seja ressuscitado por um Necromante e vire servo dele',
  encarnado: 'Complete uma encarnação',
  sacrificador: 'Realize um sacrifício',
  sobrevivente: 'Complete 5 masmorras',
  imperador: 'Alcance o nível 200',
  mestre_pets: '(condição ainda não implementada no jogo)',
  campeao_evento: 'Cause o maior dano no evento do Deus e receba a recompensa quando Ele descansar',
  domador: 'Domestique um animal selvagem com sucesso'
};

function verTitulosDisponiveis(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  const possuidos = new Set(jogador.titulos || []);

  let texto = `📜 *CATÁLOGO DE TÍTULOS*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  Object.entries(TITULOS).forEach(([key, nome]) => {
    const tem = possuidos.has(key);
    const requisito = REQUISITOS_TITULOS[key] || 'Condição especial';
    texto += `${tem ? '✅' : '🔒'} *${nome}*\n   _${requisito}_\n\n`;
  });
  texto += `📝 Use */titulos* pra ver só os seus e */usartitulo [nome]* pra equipar um que já tem.`;
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
// Pool de missões possíveis por tipo — todo dia é sorteada uma
// variante de cada tipo, então a meta e a recompensa mudam.
const POOL_MISSOES = {
  batalhar: [
    { id: 'batalhar_3', meta: 3, nome: '⚔️ Combatente Diário', desc: 'Batalhe 3 vezes', xp: 120, moedas: 60 },
    { id: 'batalhar_5', meta: 5, nome: '⚔️ Guerreiro Diário', desc: 'Batalhe 5 vezes', xp: 200, moedas: 100 },
    { id: 'batalhar_8', meta: 8, nome: '⚔️ Incansável', desc: 'Batalhe 8 vezes', xp: 320, moedas: 160 },
  ],
  boss: [
    { id: 'boss_1', meta: 1, nome: '💀 Caçador de Bosses', desc: 'Derrote 1 boss', xp: 500, moedas: 250 },
    { id: 'boss_2', meta: 2, nome: '💀 Exterminador', desc: 'Derrote 2 bosses', xp: 900, moedas: 450 },
  ],
  viajar: [
    { id: 'viajar_1', meta: 1, nome: '🗺️ Viajante', desc: 'Viaje para uma nova região', xp: 150, moedas: 75 },
  ],
  pvp: [
    { id: 'pvp_1', meta: 1, nome: '⚔️ Combatente PvP', desc: 'Vença 1 PvP', xp: 300, moedas: 150 },
    { id: 'pvp_2', meta: 2, nome: '⚔️ Duelista Nato', desc: 'Vença 2 PvPs', xp: 550, moedas: 275 },
  ]
};

// Mantido só pra compatibilidade de nome — não usar direto, use jogador.missoes_diarias.lista
const DEFINICAO_MISSOES = Object.entries(POOL_MISSOES).map(([tipo, opcoes]) => ({ ...opcoes[0], tipo }));

function sortearMissoesDoDia() {
  return Object.keys(POOL_MISSOES).map(tipo => {
    const opcoes = POOL_MISSOES[tipo];
    const escolhida = opcoes[Math.floor(Math.random() * opcoes.length)];
    return { ...escolhida, tipo };
  });
}

function normalizarBusca(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function garantirMissoesDoDia(jogador) {
  const hoje = new Date().toDateString();
  if (jogador.missoes_diarias?.data !== hoje) {
    jogador.missoes_diarias = { data: hoje, feitas: [], progresso: {}, lista: sortearMissoesDoDia() };
  }
  if (!jogador.missoes_diarias.progresso) jogador.missoes_diarias.progresso = {};
  if (!jogador.missoes_diarias.lista) jogador.missoes_diarias.lista = sortearMissoesDoDia(); // jogador antigo, sem lista salva ainda
}

// Chamada nos pontos de progresso do jogo (vitória em batalha, boss, viagem, pvp)
function progredirMissao(jogador_id, tipo) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return;
  garantirMissoesDoDia(jogador);

  const missao = jogador.missoes_diarias.lista.find(m => m.tipo === tipo);
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
  jogador.missoes_diarias.lista.forEach(m => {
    const feita = jogador.missoes_diarias.feitas.includes(m.id);
    const progresso = jogador.missoes_diarias.progresso[m.id] || 0;
    const pronta = !feita && progresso >= m.meta;
    const icone = feita ? '✅' : (pronta ? '🎁' : '⬜');
    texto += `${icone} *${m.nome}*\n   ${m.desc} (${Math.min(progresso, m.meta)}/${m.meta})\n   🏆 ${m.xp} XP + ${formatarPreco(m.moedas)}\n`;
    if (pronta) texto += `   ➡️ */coletarmissao ${m.id}*\n`;
    texto += `\n`;
  });
  texto += `_Amanhã as missões mudam — volte pra conferir!_`;

  return texto;
}

function coletarMissao(jogador_id, busca) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  garantirMissoesDoDia(jogador);

  const alvo = normalizarBusca(busca);
  const missao = jogador.missoes_diarias.lista.find(m =>
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
  const atualizado = getJogador(jogador_id);

  return `🎁 *${missao.nome}* coletada!\n⭐ +${missao.xp} XP | 💰 +${formatarPreco(missao.moedas)}\n💰 Belarium atual: ${formatarBelarium(atualizado)}`;
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

function removerItem(alvo_id, item) {
  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: '❌ Jogador não encontrado.' };
  if (!item) return { erro: '❌ Use: /removeritem @jogador [nome do item/arma/armadura]' };

  const busca = normalizarBusca(item);
  const arma = ARMAS.find(a => normalizarBusca(a.nome).includes(busca) || normalizarBusca(a.id).includes(busca));
  const armadura = !arma && ARMADURAS.find(a => normalizarBusca(a.nome).includes(busca) || normalizarBusca(a.id).includes(busca));
  const itemLoja = !arma && !armadura && ITENS_LOJA.find(i => normalizarBusca(i.nome).includes(busca) || normalizarBusca(i.id).includes(busca));
  const alvoFinal = arma || armadura || itemLoja;

  if (!alvoFinal) {
    return { erro: `❌ Item *"${item}"* não existe no catálogo do jogo.` };
  }

  if (!alvo.inventario) alvo.inventario = [];
  const idx = alvo.inventario.indexOf(alvoFinal.id);
  const estavaEquipado = (arma && alvo.arma === alvoFinal.id) || (armadura && alvo.armadura === alvoFinal.id);

  if (idx === -1 && !estavaEquipado) {
    return { erro: `❌ *${alvo.nome}* não tem *${alvoFinal.nome}*.` };
  }

  if (idx !== -1) alvo.inventario.splice(idx, 1);
  if (arma && alvo.arma === alvoFinal.id) alvo.arma = null;
  if (armadura && alvo.armadura === alvoFinal.id) alvo.armadura = null;
  salvarJogador(alvo_id, alvo);

  const tipoTexto = arma ? '⚔️ Arma' : armadura ? '🛡️ Armadura' : '🧪 Item';
  return {
    sucesso: true,
    msg: `⚖️ *CONFISCADO!* ⚖️\n\n${tipoTexto}: *${alvoFinal.nome}* removido de *${alvo.nome}*.${estavaEquipado ? '\n_Estava equipado — foi desequipado também._' : ''}`
  };
}

function darItem(alvo_id, item) {
  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: '❌ Jogador não encontrado.' };
  if (!item) return { erro: '❌ Use: /dar @jogador [nome do item/arma/armadura]' };

  const busca = normalizarBusca(item);
  const arma = ARMAS.find(a => normalizarBusca(a.nome).includes(busca) || normalizarBusca(a.id).includes(busca));
  const armadura = !arma && ARMADURAS.find(a => normalizarBusca(a.nome).includes(busca) || normalizarBusca(a.id).includes(busca));
  const itemLoja = !arma && !armadura && ITENS_LOJA.find(i => normalizarBusca(i.nome).includes(busca) || normalizarBusca(i.id).includes(busca));
  const alvoFinal = arma || armadura || itemLoja;

  if (!alvoFinal) {
    return { erro: `❌ Item *"${item}"* não existe no catálogo do jogo. Use um nome real de arma, armadura ou item da loja (ex: /itens pocoes).` };
  }

  if (!alvo.inventario) alvo.inventario = [];
  alvo.inventario.push(alvoFinal.id);
  salvarJogador(alvo_id, alvo);

  const tipoTexto = arma ? '⚔️ Arma' : armadura ? '🛡️ Armadura' : '🧪 Item';
  const dica = arma ? `Use /equipar ${arma.nome} pra equipar.` : armadura ? `Use /equiparmadura ${armadura.nome} pra equipar.` : `Use /usar ${itemLoja.nome} pra usar.`;

  return {
    sucesso: true,
    msg: `✨ *BÊNÇÃO DIVINA!* ✨\n\n${tipoTexto}: *${alvoFinal.nome}* recebido por *${alvo.nome}*!\n_O Deus foi generoso hoje._\n\n📝 ${dica}`
  };
}

function abencoarJogador(alvo_id, bencao) {
  const alvo = getJogador(alvo_id);
  if (!alvo) return { erro: '❌ Jogador não encontrado.' };

  // Antes: `alvo.hp_max = alvo.hp` travava o HP máximo real no valor baixo
  // em que o jogador estava no momento da bênção (ex: virava 20/20 pra sempre).
  // Agora só restaura o HP/mana atuais até o máximo já existente.
  alvo.hp = alvo.hp_max;
  alvo.mana = alvo.mana_max || 100;
  alvo.moedas += 500;
  alvo.morto = false;
  if (!alvo.status_positivos) alvo.status_positivos = [];
  alvo.status_positivos.push('abencado');
  salvarJogador(alvo_id, alvo);

  return {
    sucesso: true,
    msg: `⚡ *BÊNÇÃO DO DEUS!* ⚡\n━━━━━━━━━━━━━━━━━━━━\n\n✨ *${alvo.nome}* foi abençoado!\n${bencao || ''}\n\n• HP restaurado\n• Mana restaurada\n• +500 🥉 Bronze\n💰 Belarium atual: ${formatarBelarium(alvo)}\n\n_O Deus sorriu para você._`
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
    msg: `💀 *MALDIÇÃO DO DEUS!* 💀\n━━━━━━━━━━━━━━━━━━━━\n\n😈 *${alvo.nome}* foi amaldiçoado!\n${maldicao || ''}\n\n• HP reduzido à metade\n• Mana zerada\n• 50% do Belarium perdido\n💰 Belarium atual: ${formatarBelarium(alvo)}\n\n_O Deus ficou descontente._`
  };
}

function verRankingMoedas() {
  const jogadores = todosJogadores();
  const ordenados = jogadores
    .filter(j => (j.moedas || 0) > 0)
    .sort((a, b) => (b.moedas || 0) - (a.moedas || 0))
    .slice(0, 10);
  if (ordenados.length === 0) return '📭 Nenhum jogador com Belarium ainda.';

  const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  let texto = `💰 *RANKING DE RIQUEZA* 💰\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  ordenados.forEach((j, i) => {
    texto += `${medalhas[i]} *${j.nome}* — ${formatarBelarium(j)}\n`;
  });
  return texto;
}

function verRankingXP() {
  const jogadores = todosJogadores();
  const ordenados = jogadores
    .filter(j => !j.morto)
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 10);
  if (ordenados.length === 0) return '📭 Nenhum jogador no ranking ainda.';

  const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  let texto = `📚 *RANKING DE XP* 📚\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  ordenados.forEach((j, i) => {
    texto += `${medalhas[i]} *${j.nome}* [${j.rank}] — ⭐ ${j.xp || 0} XP (Nv. ${j.nivel || 1})\n`;
  });
  return texto;
}

function verRankingKills() {
  const jogadores = todosJogadores();
  const ordenados = jogadores
    .filter(j => (j.kills || 0) > 0)
    .sort((a, b) => (b.kills || 0) - (a.kills || 0))
    .slice(0, 10);
  if (ordenados.length === 0) return '📭 Ninguém matou nada ainda. Vá batalhar!';

  const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  let texto = `💀 *RANKING DE KILLS* 💀\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  ordenados.forEach((j, i) => {
    texto += `${medalhas[i]} *${j.nome}* — 💀 ${j.kills || 0} abates\n`;
  });
  return texto;
}

function verRankingPets() {
  const jogadores = todosJogadores();
  const ordenados = jogadores
    .filter(j => j.pet && j.pet.dano)
    .map(j => ({ nome: j.nome, pet_nome: j.pet.nome, poder: Math.floor(((j.pet.dano[0] || 0) + (j.pet.dano[1] || 0)) / 2) }))
    .sort((a, b) => b.poder - a.poder)
    .slice(0, 10);
  if (ordenados.length === 0) return '📭 Ninguém tem um pet ainda. Use */loja* pra comprar um ovo!';

  const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  let texto = `🐾 *RANKING DE PETS* 🐾\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  ordenados.forEach((j, i) => {
    texto += `${medalhas[i]} *${j.pet_nome}* (${j.nome}) — ⚔️ ~${j.poder} de dano\n`;
  });
  return texto;
}

// ============================================================
// EVENTO ALEATÓRIO — o bot anuncia sozinho, jogadores participam
// e quem mais atacar/participar leva a recompensa maior
// ============================================================
const EVENTOS_ALEATORIOS = [
  { nome: '🔥 Invasão Demoníaca', desc: 'Uma horda de demônios invade Valdris! Ataque para repelir a invasão.' },
  { nome: '🌌 Fenda Dimensional', desc: 'Uma fenda se abriu no céu, derramando poder bruto sobre quem lutar perto dela.' },
  { nome: '💰 Caravana do Tesouro', desc: 'Uma caravana carregada de Belarium está sendo saqueada — ataque para pegar sua parte!' },
  { nome: '☠️ Praga Ancestral', desc: 'Uma praga desperta criaturas antigas. Combata-as antes que se espalhe!' },
  { nome: '⚡ Tempestade Arcana', desc: 'Uma tempestade de energia mágica varre a região, fortalecendo quem ousar enfrentá-la.' },
];

function iniciarEventoAleatorio() {
  const template = EVENTOS_ALEATORIOS[Math.floor(Math.random() * EVENTOS_ALEATORIOS.length)];
  const duracao_ms = 10 * 60 * 1000; // 10 minutos
  const estado = {
    nome: template.nome,
    desc: template.desc,
    inicio: Date.now(),
    expira: Date.now() + duracao_ms,
    participantes: {}, // jogador_id -> contagem
  };
  setConfig('evento_aleatorio_ativo', estado);
  return `${template.nome}\n━━━━━━━━━━━━━━━━━━━━\n\n${template.desc}\n\n⚔️ Use */participarevento* para entrar na luta!\n⏳ Dura 10 minutos. Quem mais participar leva a maior recompensa.`;
}

function participarEventoAleatorio(jogador_id) {
  const estado = getConfig('evento_aleatorio_ativo');
  if (!estado) return { erro: '❌ Nenhum evento ativo no momento.' };
  if (Date.now() > estado.expira) return { erro: '❌ O evento já terminou!' };

  const j = getJogador(jogador_id);
  if (!j) return { erro: '❌ Você não tem personagem!' };
  if (j.morto) return { erro: '❌ Mortos não participam de eventos!' };

  const agora = Date.now();
  const ultimoUso = estado._cooldowns?.[jogador_id] || 0;
  if (agora - ultimoUso < 20 * 1000) return { erro: '⏳ Aguarde um pouco antes de atacar de novo!' };

  if (!estado._cooldowns) estado._cooldowns = {};
  estado._cooldowns[jogador_id] = agora;
  estado.participantes[jogador_id] = (estado.participantes[jogador_id] || 0) + 1;
  setConfig('evento_aleatorio_ativo', estado);

  const dano = Math.floor(Math.random() * 40) + 10;
  const moedas = Math.floor(Math.random() * 30) + 10;
  adicionarMoedas(jogador_id, moedas);

  return {
    sucesso: true,
    msg: `⚔️ Você atacou! Causou *${dano}* de dano ao evento.\n💰 +${moedas} Belarium\n📊 Seus ataques nesse evento: ${estado.participantes[jogador_id]}`
  };
}

function finalizarEventoAleatorio() {
  const estado = getConfig('evento_aleatorio_ativo');
  if (!estado) return null;
  setConfig('evento_aleatorio_ativo', null);

  const ranking = Object.entries(estado.participantes || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (ranking.length === 0) {
    return `${estado.nome}\n━━━━━━━━━━━━━━━━━━━━\n\n_O evento terminou e ninguém apareceu para lutar..._\n_As criaturas se retiraram, por ora._`;
  }

  const premios = [500, 250, 100];
  const medalhas = ['🥇', '🥈', '🥉'];
  let texto = `${estado.nome} — ENCERRADO\n━━━━━━━━━━━━━━━━━━━━\n\n🏆 *Resultado final:*\n\n`;

  ranking.forEach(([id, count], i) => {
    const j = getJogador(id);
    if (!j) return;
    adicionarMoedas(id, premios[i] || 0);
    adicionarXP(id, Math.floor((premios[i] || 0) / 2));
    texto += `${medalhas[i]} *${j.nome}* — ${count} ataques (+${premios[i]} Belarium)\n`;
  });

  texto += `\n_O evento acabou... até a próxima ameaça surgir._`;
  return texto;
}

function statusEventoAleatorio() {
  const estado = getConfig('evento_aleatorio_ativo');
  if (!estado) return '📭 Nenhum evento ativo no momento.';
  const restante = Math.max(0, Math.floor((estado.expira - Date.now()) / 1000));
  const min = Math.floor(restante / 60);
  const seg = restante % 60;
  return `${estado.nome}\n━━━━━━━━━━━━━━━━━━━━\n\n${estado.desc}\n\n⏳ Tempo restante: ${min}m${seg}s\n⚔️ Use */participarevento* para atacar!`;
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
  verRanking, verRankingConquistas, verConquistas, verTitulos, verTitulosDisponiveis, usarTitulo, verMissoes, progredirMissao, coletarMissao,
  matarJogador, darItem, removerItem, abencoarJogador, maldicionarJogador,
  eventoGlobal, statusBot,
  verRankingMoedas, verRankingXP, verRankingKills, verRankingPets,
  iniciarEventoAleatorio, participarEventoAleatorio, finalizarEventoAleatorio, statusEventoAleatorio
};
