// ============================================================
// IMPERIUS RPG — COMANDOS NOVOS (extras.js)
// Reforjar, Sucatear, Duelo, Guerra de Guilda, Pódio, Talentos,
// Prestígio, Batalha de Pet e Leilão.
// ============================================================
const {
  getJogador, salvarJogador, adicionarXP, adicionarMoedas, adicionarTitulo,
  formatarBelarium, formatarPreco, todosJogadores, getGuilda, setGuilda, todasGuildas,
  getConfig, setConfig
} = require('./db');
const { ARMAS, ARMADURAS } = require('./gameData');
const { pvp, calcularDanoBase, calcularDefesa } = require('./combat');

const BORDAS = {
  topo: '╔═★·°·❃·°·★·°·❃·°·★═╗',
  meio: '╠══════════════════╣',
  baixo: '╚═★·°·❃·°·★·°·❃·°·★═╝',
  linha: '╔══════════════════╗',
  fim: '╚══════════════════╝'
};

function normalizarTexto(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
function limparNome(s) {
  return normalizarTexto(s).replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ').trim();
}

// ── Ajuda comum: acha um item do INVENTÁRIO do jogador (arma ou armadura)
// pelo nome, com desambiguação de raridade igual ao /comprar. ─────────────
function encontrarNoInventario(jogador, busca) {
  const buscaLimpa = limparNome(busca);

  const todos = (jogador.inventario || []).map((id, idx) => {
    const arma = ARMAS.find(a => a.id === id);
    const armadura = !arma ? ARMADURAS.find(a => a.id === id) : null;
    return { id, idx, obj: arma || armadura, tipoObj: arma ? 'arma' : (armadura ? 'armadura' : null) };
  }).filter(c => c.obj);

  // Acha o nome de item mais específico que seja PREFIXO da busca (pra
  // aceitar "espada ancestral epico" -> nome "espada ancestral" + sobra
  // "epico" tratada como raridade), igual ao /comprar na loja.
  const nomesUnicos = [...new Set(todos.map(c => c.obj.nome))];
  const nomesQueBatem = nomesUnicos
    .filter(nome => buscaLimpa.includes(limparNome(nome)))
    .sort((a, b) => b.length - a.length);

  let candidatos, leftover;
  if (nomesQueBatem.length > 0) {
    const nomeEscolhido = nomesQueBatem[0];
    leftover = buscaLimpa.replace(limparNome(nomeEscolhido), '').trim();
    candidatos = todos.filter(c => c.obj.nome === nomeEscolhido);
  } else {
    candidatos = todos.filter(c => limparNome(c.obj.nome).includes(buscaLimpa));
    leftover = '';
  }

  if (candidatos.length === 0) return { item: null, ambiguo: null };

  if (leftover) {
    const filtrados = candidatos.filter(c => limparNome(c.obj.raridade).includes(leftover));
    if (filtrados.length) candidatos = filtrados;
  }

  const nomesRestantes = new Set(candidatos.map(c => c.obj.nome));
  if (candidatos.length > 1 && nomesRestantes.size === 1 && !leftover) {
    return { item: null, ambiguo: candidatos };
  }

  return { item: candidatos[0], ambiguo: null };
}

function mensagemAmbiguidadeInv(candidatos, busca) {
  const linhas = candidatos.map(c => `• *${c.obj.nome}* ${c.obj.raridade}`);
  return [
    `❓ Você tem *${candidatos.length}* itens chamados "${busca}" (raridades diferentes):`,
    ...linhas,
    '',
    '📝 Inclua a raridade no comando pra escolher.'
  ].join('\n');
}

// ============================================================
// /REFORJAR — sobe a raridade de uma arma/armadura em 1 nível
// ============================================================
function reforjar(jogador_id, nome_item) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  if (!nome_item || !nome_item.trim()) return '❌ Use: /reforjar [nome do item]';

  const { item, ambiguo } = encontrarNoInventario(j, nome_item);
  if (ambiguo) return mensagemAmbiguidadeInv(ambiguo, nome_item);
  if (!item) return `❌ Você não tem "${nome_item}" no inventário.`;

  const lista = item.tipoObj === 'arma' ? ARMAS : ARMADURAS;
  const match = item.id.match(/^(.*)_(\d+)$/);
  if (!match) return '❌ Esse item não pode ser reforjado.';
  const [, prefixo, tierStr] = match;
  const tier = parseInt(tierStr, 10);
  const proximoId = `${prefixo}_${tier + 1}`;
  const proximo = lista.find(a => a.id === proximoId);

  if (!proximo) return `✨ *${item.obj.nome}* já está na raridade máxima (${item.obj.raridade})! Não dá pra reforjar mais.`;

  const custo = Math.max(50, Math.floor((proximo.preco || item.obj.preco * 2) * 0.5));
  if ((j.moedas || 0) < custo) {
    return `❌ Reforjar *${item.obj.nome}* pra ${proximo.raridade} custa *${formatarPreco(custo)}*!\nVocê tem: ${formatarBelarium(j)}`;
  }

  j.moedas -= custo;
  const chance_sucesso = 0.6;
  const sucesso = Math.random() < chance_sucesso;

  if (sucesso) {
    j.inventario[item.idx] = proximoId;
    if (item.tipoObj === 'arma' && j.arma === item.id) j.arma = proximoId;
    if (item.tipoObj === 'armadura' && j.armadura === item.id) j.armadura = proximoId;
    salvarJogador(jogador_id, j);
    const statTexto = item.tipoObj === 'arma' ? `Dano: ${proximo.dano[0]}-${proximo.dano[1]}` : `Defesa: +${proximo.defesa}`;
    return `${BORDAS.topo}\n   ✨ REFORJA BEM-SUCEDIDA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ *${proximo.nome}*\n║ ${item.obj.raridade} → ${proximo.raridade}\n║ ${statTexto}\n${BORDAS.meio}\n║ 💰 Custo: ${formatarPreco(custo)}\n${BORDAS.fim}`;
  } else {
    salvarJogador(jogador_id, j);
    return `${BORDAS.topo}\n   💥 A REFORJA FALHOU!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ *${item.obj.nome}* não quebrou,\n║ mas continua ${item.obj.raridade}.\n║ 💰 Perdeu: ${formatarPreco(custo)}\n${BORDAS.fim}`;
  }
}

// ============================================================
// /SUCATEAR — desmonta um item em materiais de craft
// ============================================================
const POOL_MATERIAIS = [
  'pedra de luz', 'carne crua', 'cristal de gelo', 'coral sagrado',
  'essencia magica', 'raiz ancestral', 'peixe espectral', 'alga abissal',
  'minerio sagrado', 'po de osso sagrado', 'cristal de alma', 'escama de leviata',
  'essencia primordial', 'fruto da imortalidade', 'maca dourada', 'roma do hades'
];

function sucatear(jogador_id, nome_item) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  if (!nome_item || !nome_item.trim()) return '❌ Use: /sucatear [nome do item]';

  const { item, ambiguo } = encontrarNoInventario(j, nome_item);
  if (ambiguo) return mensagemAmbiguidadeInv(ambiguo, nome_item);
  if (!item) return `❌ Você não tem "${nome_item}" no inventário.`;

  if (item.tipoObj === 'arma' && j.arma === item.id) return '❌ Você não pode sucatear a arma equipada! Equipe outra antes.';
  if (item.tipoObj === 'armadura' && j.armadura === item.id) return '❌ Você não pode sucatear a armadura equipada! Equipe outra antes.';

  const match = item.id.match(/_(\d+)$/);
  const tier = match ? parseInt(match[1], 10) : 0;
  const qtd_materiais = 1 + Math.floor(tier / 4); // 1 a 5 conforme a raridade
  const pool_disponivel = POOL_MATERIAIS.slice(0, Math.min(POOL_MATERIAIS.length, 3 + tier));

  const materiaisGanhos = {};
  for (let i = 0; i < qtd_materiais; i++) {
    const mat = pool_disponivel[Math.floor(Math.random() * pool_disponivel.length)];
    materiaisGanhos[mat] = (materiaisGanhos[mat] || 0) + 1;
    j.inventario.push(mat);
  }

  j.inventario.splice(item.idx, 1);
  salvarJogador(jogador_id, j);

  const linhas = Object.entries(materiaisGanhos).map(([m, q]) => `${q}x ${m}`);
  return `${BORDAS.topo}\n   🔨 ITEM SUCATEADO\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ *${item.obj.nome}* ${item.obj.raridade}\n║ virou material!\n${BORDAS.meio}\n║ 📦 Ganhou:\n║ ${linhas.join('\n║ ')}\n${BORDAS.fim}`;
}

// ============================================================
// /DUELO @jogador [aposta] — PvP com aposta de moedas
// ============================================================
function duelo(atacante_id, alvo_id, aposta) {
  const atacante = getJogador(atacante_id);
  const alvo = getJogador(alvo_id);
  if (!atacante) return { erro: '❌ Você não tem personagem.' };
  if (!alvo) return { erro: '❌ Alvo não encontrado.' };
  if (atacante_id === alvo_id) return { erro: '❌ Você não pode duelar consigo mesmo!' };

  const valorAposta = Math.max(0, Math.floor(aposta) || 0);
  if (valorAposta > 0) {
    if ((atacante.moedas || 0) < valorAposta) return { erro: `❌ Você não tem ${formatarPreco(valorAposta)} pra apostar!` };
    if ((alvo.moedas || 0) < valorAposta) return { erro: `❌ ${alvo.nome} não tem ${formatarPreco(valorAposta)} pra cobrir a aposta!` };
  }

  const resultado = pvp(atacante_id, alvo_id);
  if (resultado.erro) return resultado;

  let msg_aposta = '';
  if (valorAposta > 0) {
    const atacanteMorreu = resultado.logs.some(l => l.includes(`💀 *${atacante.nome} também caiu`));
    if (resultado.atacante_venceu && !atacanteMorreu) {
      adicionarMoedas(atacante_id, valorAposta);
      const a2 = getJogador(alvo_id);
      a2.moedas = Math.max(0, (a2.moedas || 0) - valorAposta);
      salvarJogador(alvo_id, a2);
      msg_aposta = `\n💰 *${atacante.nome}* ganhou a aposta: +${formatarPreco(valorAposta)}!`;
    } else if (!resultado.atacante_venceu && atacanteMorreu) {
      adicionarMoedas(alvo_id, valorAposta);
      const a2 = getJogador(atacante_id);
      a2.moedas = Math.max(0, (a2.moedas || 0) - valorAposta);
      salvarJogador(atacante_id, a2);
      msg_aposta = `\n💰 *${alvo.nome}* ganhou a aposta: +${formatarPreco(valorAposta)}!`;
    } else {
      msg_aposta = `\n🤝 Empate — aposta devolvida, ninguém perde nada.`;
    }
  }

  resultado.logs.push(msg_aposta);
  return resultado;
}

// ============================================================
// /GUERRAGUILDA @alguém_da_guilda_rival — batalha guilda x guilda
// ============================================================
function guerraGuilda(jogador_id, alvo_id) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  if (!j.guilda_id) return '❌ Você precisa estar em uma guilda! Use /criarguilda ou /convidar.';

  const alvo = getJogador(alvo_id);
  if (!alvo) return '❌ Mencione alguém de uma guilda rival.';
  if (!alvo.guilda_id) return `❌ ${alvo.nome} não está em nenhuma guilda!`;
  if (alvo.guilda_id === j.guilda_id) return '❌ Vocês são da mesma guilda!';

  const minhaGuilda = getGuilda(j.guilda_id);
  const guildaRival = getGuilda(alvo.guilda_id);
  if (!minhaGuilda || !guildaRival) return '❌ Guilda não encontrada.';
  if (minhaGuilda.lider_id !== jogador_id) return '❌ Só o líder da guilda pode declarar guerra!';

  // Poder de cada guilda: soma do dano+defesa dos membros ativos (até 10 por
  // guilda, pra não pesar em guildas gigantes), com uma variação aleatória.
  function poderGuilda(guilda) {
    let poder = 0;
    const membros = guilda.membros.slice(0, 10);
    membros.forEach(m => {
      const membroJ = getJogador(m.id);
      if (!membroJ) return;
      poder += calcularDanoBase(membroJ).dano_base + calcularDefesa(membroJ);
    });
    return Math.floor(poder * (0.85 + Math.random() * 0.3));
  }

  const poderMinha = poderGuilda(minhaGuilda);
  const poderRival = poderGuilda(guildaRival);
  const minhaVenceu = poderMinha >= poderRival;
  const vencedora = minhaVenceu ? minhaGuilda : guildaRival;
  const perdedora = minhaVenceu ? guildaRival : minhaGuilda;

  vencedora.vitorias_guerra = (vencedora.vitorias_guerra || 0) + 1;
  vencedora.xp = (vencedora.xp || 0) + 500;
  setGuilda(vencedora.id, vencedora);
  setGuilda(perdedora.id, perdedora);

  const premio = 300;
  vencedora.membros.forEach(m => adicionarMoedas(m.id, premio));

  return `${BORDAS.topo}\n   ⚔️ GUERRA DE GUILDAS! ⚔️\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ⚔️ ${minhaGuilda.nome} (poder ${poderMinha})\n║    vs\n║ ⚔️ ${guildaRival.nome} (poder ${poderRival})\n${BORDAS.meio}\n║ 🏆 Vencedora: *${vencedora.nome}*!\n║ 💰 Cada membro ganhou ${formatarPreco(premio)}\n║ ⭐ +500 XP de guilda\n${BORDAS.fim}`;
}

// ============================================================
// /PODIO — hall da fama rápido
// ============================================================
function verPodio() {
  const jogadores = todosJogadores();
  if (jogadores.length === 0) return '❌ Nenhum jogador registrado ainda.';

  const maisRico = jogadores.slice().sort((a, b) => (b.moedas || 0) - (a.moedas || 0))[0];
  const maisMortes = jogadores.slice().sort((a, b) => (b.pvp_vitorias || 0) - (a.pvp_vitorias || 0))[0];
  const maiorNivel = jogadores.slice().sort((a, b) => (b.nivel || 1) - (a.nivel || 1))[0];
  const guildas = todasGuildas().slice().sort((a, b) => (b.nivel || 1) - (a.nivel || 1) || (b.membros || []).length - (a.membros || []).length);
  const melhorGuilda = guildas[0];

  return `${BORDAS.topo}\n   🏆 PÓDIO DO IMPERIUS 🏆\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ 💰 Mais rico:\n║    ${maisRico.nome} — ${formatarBelarium(maisRico)}\n${BORDAS.meio}\n║ ⚔️ Mais vitórias em PvP:\n║    ${maisMortes.nome} — ${maisMortes.pvp_vitorias || 0} vitórias\n${BORDAS.meio}\n║ ⭐ Maior nível:\n║    ${maiorNivel.nome} — Nível ${maiorNivel.nivel || 1}\n${BORDAS.meio}\n║ 🛡️ Melhor guilda:\n║    ${melhorGuilda ? `${melhorGuilda.nome} (Nv.${melhorGuilda.nivel})` : 'Nenhuma guilda ainda'}\n${BORDAS.fim}`;
}

// ============================================================
// /TALENTOS — árvore de talentos simples (dano, defesa, moedas)
// ============================================================
const LIMITE_TALENTO = 20; // +1% por ponto, até 20% de bônus

function verTalentos(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  const t = j.talentos || { dano: 0, defesa: 0, moedas: 0 };
  const pontos = j.pontos_talento || 0;

  return `${BORDAS.topo}\n   🌟 SEUS TALENTOS 🌟\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ 🎯 Pontos disponíveis: *${pontos}*\n${BORDAS.meio}\n║ ⚔️ Dano: +${Math.min(t.dano, LIMITE_TALENTO)}% (${Math.min(t.dano, LIMITE_TALENTO)}/${LIMITE_TALENTO})\n║ 🛡️ Defesa: +${Math.min(t.defesa, LIMITE_TALENTO)}% (${Math.min(t.defesa, LIMITE_TALENTO)}/${LIMITE_TALENTO})\n║ 💰 Moedas: +${Math.min(t.moedas, LIMITE_TALENTO)}% (${Math.min(t.moedas, LIMITE_TALENTO)}/${LIMITE_TALENTO})\n${BORDAS.meio}\n║ 📝 Use /talentos [dano|defesa|moedas]\n║ pra investir 1 ponto.\n║ Ganha 1 ponto a cada level up!\n${BORDAS.fim}`;
}

function investirTalento(jogador_id, ramo) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  const ramoNorm = normalizarTexto(ramo);
  if (!['dano', 'defesa', 'moedas'].includes(ramoNorm)) {
    return '❌ Use: /talentos [dano|defesa|moedas]';
  }
  if (!j.pontos_talento || j.pontos_talento <= 0) {
    return '❌ Você não tem pontos de talento! Suba de nível pra ganhar mais.';
  }
  if (!j.talentos) j.talentos = { dano: 0, defesa: 0, moedas: 0 };
  if ((j.talentos[ramoNorm] || 0) >= LIMITE_TALENTO) {
    return `❌ Você já atingiu o máximo em ${ramoNorm} (+${LIMITE_TALENTO}%)!`;
  }

  j.talentos[ramoNorm] = (j.talentos[ramoNorm] || 0) + 1;
  j.pontos_talento -= 1;
  salvarJogador(jogador_id, j);

  return `✅ +1 ponto em *${ramoNorm}*! Agora: +${j.talentos[ramoNorm]}%.\n🎯 Pontos restantes: ${j.pontos_talento}`;
}

// ============================================================
// /PRESTIGIO — reseta nível 200 por bônus permanente
// ============================================================
function prestigiar(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  if ((j.nivel || 1) < 200) return `❌ Você precisa estar no nível 200 pra prestigiar! Nível atual: ${j.nivel || 1}.`;

  j.prestigio = (j.prestigio || 0) + 1;
  j.nivel = 1;
  j.xp = 0;
  if (!Array.isArray(j.titulos)) j.titulos = [];
  const tituloPrestigio = `prestigio_${j.prestigio}`;
  salvarJogador(jogador_id, j);

  return `${BORDAS.topo}\n   🌟 PRESTÍGIO ${j.prestigio}! 🌟\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ Você abriu mão do nível 200\n║ por um selo permanente.\n${BORDAS.meio}\n║ 🔄 Nível resetado pra 1\n║ ⭐ Selo: Prestígio ${j.prestigio}\n║ (fica marcado no /perfil)\n${BORDAS.fim}`;
}

// ============================================================
// /PETBATALHA @jogador — duelo de pets
// ============================================================
function petBatalha(jogador_id, alvo_id) {
  const j = getJogador(jogador_id);
  const alvo = getJogador(alvo_id);
  if (!j) return '❌ Personagem não encontrado.';
  if (!alvo) return '❌ Alvo não encontrado.';
  if (jogador_id === alvo_id) return '❌ Você não pode duelar contra si mesmo!';
  if (!j.pet) return '❌ Você não tem um pet! Use /chocar pra conseguir um ovo.';
  if (!alvo.pet) return `❌ ${alvo.nome} não tem um pet!`;
  if (j.pet.hp <= 0) return `❌ Seu pet está desmaiado! Use /curarpet primeiro.`;
  if (alvo.pet.hp <= 0) return `❌ O pet de ${alvo.nome} está desmaiado!`;

  const danoMeu = Math.floor(Math.random() * (j.pet.dano[1] - j.pet.dano[0] + 1)) + j.pet.dano[0];
  const danoAlvo = Math.floor(Math.random() * (alvo.pet.dano[1] - alvo.pet.dano[0] + 1)) + alvo.pet.dano[0];

  const vencedor = danoMeu >= danoAlvo ? j : alvo;
  const vencedorId = danoMeu >= danoAlvo ? jogador_id : alvo_id;
  const perdedorNome = danoMeu >= danoAlvo ? alvo.nome : j.nome;

  adicionarMoedas(vencedorId, 100);
  adicionarXP(vencedorId, 50);

  return `${BORDAS.topo}\n   🐾 BATALHA DE PETS! 🐾\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${j.pet.nome} (${j.nome}): ${danoMeu} de dano\n║ ${alvo.pet.nome} (${alvo.nome}): ${danoAlvo} de dano\n${BORDAS.meio}\n║ 🏆 Vencedor: *${vencedor.pet.nome}* (${vencedor.nome})!\n║ ${perdedorNome} perdeu o duelo.\n║ 💰 +100 | ⭐ +50 XP\n${BORDAS.fim}`;
}

// ============================================================
// /LEILAO — mercado entre jogadores (lista global via config)
// ============================================================
const CHAVE_LEILOES = 'leiloes_ativos';

function getLeiloes() {
  return getConfig(CHAVE_LEILOES) || [];
}
function salvarLeiloes(lista) {
  setConfig(CHAVE_LEILOES, lista);
}

function criarLeilao(jogador_id, nome_item, preco) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  const valorPreco = Math.floor(preco);
  if (!nome_item || isNaN(valorPreco) || valorPreco <= 0) return '❌ Use: /leilao criar [item] [preço]';

  const { item, ambiguo } = encontrarNoInventario(j, nome_item);
  if (ambiguo) return mensagemAmbiguidadeInv(ambiguo, nome_item);
  if (!item) return `❌ Você não tem "${nome_item}" no inventário.`;
  if (item.tipoObj === 'arma' && j.arma === item.id) return '❌ Você não pode leiloar a arma equipada!';
  if (item.tipoObj === 'armadura' && j.armadura === item.id) return '❌ Você não pode leiloar a armadura equipada!';

  const leiloes = getLeiloes();
  if (leiloes.filter(l => l.vendedor_id === jogador_id).length >= 3) {
    return '❌ Você já tem 3 itens no leilão! Espere alguém comprar ou remova um.';
  }

  j.inventario.splice(item.idx, 1);
  salvarJogador(jogador_id, j);

  const novoLeilao = {
    id: `leilao_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    vendedor_id: jogador_id,
    vendedor_nome: j.nome,
    item_id: item.id,
    item_nome: item.obj.nome,
    item_raridade: item.obj.raridade,
    tipo: item.tipoObj,
    preco: valorPreco,
    criado_em: Date.now()
  };
  leiloes.push(novoLeilao);
  salvarLeiloes(leiloes);

  return `${BORDAS.topo}\n   🏷️ ITEM NO LEILÃO!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ *${item.obj.nome}* ${item.obj.raridade}\n║ 💰 Preço: ${formatarPreco(valorPreco)}\n${BORDAS.meio}\n║ Outros jogadores podem comprar\n║ com /leilao comprar ${leiloes.length}\n${BORDAS.fim}`;
}

function verLeiloes() {
  const leiloes = getLeiloes();
  if (leiloes.length === 0) return `${BORDAS.topo}\n❌ Nenhum item à venda no leilão agora!\nColoque o seu com /leilao criar [item] [preço]\n${BORDAS.baixo}`;

  let texto = `${BORDAS.topo}\n   🏷️ LEILÃO 🏷️\n${BORDAS.baixo}\n\n${BORDAS.linha}\n`;
  leiloes.forEach((l, i) => {
    texto += `║ ${i + 1}. *${l.item_nome}* ${l.item_raridade}\n║    💰 ${formatarPreco(l.preco)} | vendedor: ${l.vendedor_nome}\n`;
  });
  texto += `${BORDAS.meio}\n║ 🛒 /leilao comprar [número]\n║ ❌ /leilao cancelar [número] (só o seu)\n${BORDAS.fim}`;
  return texto;
}

function comprarLeilao(jogador_id, indice) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado.';
  const leiloes = getLeiloes();
  const idx = parseInt(indice, 10) - 1;
  const leilao = leiloes[idx];
  if (!leilao) return '❌ Número inválido! Use /leilao pra ver a lista.';
  if (leilao.vendedor_id === jogador_id) return '❌ Você não pode comprar seu próprio item!';
  if ((j.moedas || 0) < leilao.preco) return `❌ Você precisa de ${formatarPreco(leilao.preco)}! Você tem ${formatarBelarium(j)}.`;

  j.moedas -= leilao.preco;
  j.inventario.push(leilao.item_id);
  salvarJogador(jogador_id, j);
  adicionarMoedas(leilao.vendedor_id, leilao.preco);

  leiloes.splice(idx, 1);
  salvarLeiloes(leiloes);

  return `${BORDAS.topo}\n   ✅ COMPRA REALIZADA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ Você comprou *${leilao.item_nome}*!\n║ 💰 Pago: ${formatarPreco(leilao.preco)}\n${BORDAS.fim}`;
}

function cancelarLeilao(jogador_id, indice) {
  const leiloes = getLeiloes();
  const idx = parseInt(indice, 10) - 1;
  const leilao = leiloes[idx];
  if (!leilao) return '❌ Número inválido!';
  if (leilao.vendedor_id !== jogador_id) return '❌ Esse item não é seu!';

  const j = getJogador(jogador_id);
  j.inventario.push(leilao.item_id);
  salvarJogador(jogador_id, j);

  leiloes.splice(idx, 1);
  salvarLeiloes(leiloes);

  return `✅ *${leilao.item_nome}* voltou pro seu inventário.`;
}

module.exports = {
  reforjar, sucatear, duelo, guerraGuilda, verPodio,
  verTalentos, investirTalento, prestigiar, petBatalha,
  criarLeilao, verLeiloes, comprarLeilao, cancelarLeilao
};
