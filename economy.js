// ============================================================
// IMPERIUS RPG — ECONOMIA
// ============================================================
const { getJogador, salvarJogador, adicionarMoedas, adicionarXP, adicionarConquista } = require('./db');
const { ITENS_LOJA, ARMAS, ARMADURAS, REGIOES } = require('./gameData');

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function verLoja() {
  let texto = `🛒 *LOJA DE VALDRIS* 🛒\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  texto += `⚔️ *ARMAS:*\n`;
  const armas_compraveis = ARMAS.filter(a => !a.exclusiva && a.preco > 0);
  armas_compraveis.forEach(a => {
    texto += `• *${a.nome}* — 💰 ${a.preco} | Dano: ${a.dano[0]}-${a.dano[1]} | ${a.raridade}\n`;
  });

  texto += `\n🛡️ *ARMADURAS:*\n`;
  ARMADURAS.forEach(a => {
    texto += `• *${a.nome}* — 💰 ${a.preco} | Defesa: +${a.defesa} | ${a.raridade}\n`;
  });

  texto += `\n🧪 *ITENS:*\n`;
  ITENS_LOJA.filter(i => i.preco > 0).forEach(i => {
    texto += `• *${i.nome}* — 💰 ${i.preco}\n`;
  });

  texto += `\n📝 Use */comprar [nome do item/arma/armadura]*`;
  return texto;
}

function normalizarTexto(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'os', 'as']);
function palavrasSignificativas(t) {
  return normalizarTexto(t).replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w && !STOPWORDS.has(w));
}

// Busca tolerante: aceita substring direto OU todas as palavras-chave da busca
// presentes no nome, em qualquer ordem (ex: "pocao maxima" acha "Poção de HP Máxima")
function matchTexto(busca, alvo) {
  const b = normalizarTexto(busca);
  const a = normalizarTexto(alvo);
  if (!b) return false;
  if (a.includes(b)) return true;
  const palavrasBusca = palavrasSignificativas(busca);
  if (palavrasBusca.length === 0) return false;
  const palavrasAlvo = new Set(palavrasSignificativas(alvo));
  return palavrasBusca.every(p => palavrasAlvo.has(p));
}

function comprarItem(jogador_id, item_nome) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (jogador.morto) return '💀 Mortos não compram.';

  const busca = normalizarTexto(item_nome);
  const item = ITENS_LOJA.find(i => i.preco > 0 && (normalizarTexto(i.nome).includes(busca) || normalizarTexto(i.id).includes(busca)));
  const arma = ARMAS.filter(a => !a.exclusiva).find(a => normalizarTexto(a.nome).includes(busca) || normalizarTexto(a.id).includes(busca));
  const armadura = ARMADURAS.find(a => normalizarTexto(a.nome).includes(busca) || normalizarTexto(a.id).includes(busca));

  const alvo = item || arma || armadura;
  if (!alvo) return `❌ Item *${item_nome}* não encontrado. Use /loja para ver os itens.`;

  if (jogador.moedas < alvo.preco) return `❌ Moedas insuficientes! Você tem *${jogador.moedas}* moedas, precisa de *${alvo.preco}*.`;

  jogador.moedas -= alvo.preco;

  if (arma) {
    if (!jogador.inventario) jogador.inventario = [];
    jogador.inventario.push(arma.id);
    salvarJogador(jogador_id, jogador);
    adicionarConquista(jogador_id, 'comprador');
    if (jogador.moedas >= 1000) adicionarConquista(jogador_id, 'rico');
    return `✅ *${arma.nome}* comprada!\n💰 Moedas restantes: *${jogador.moedas}*\nUse */equipar ${arma.nome}* para equipar.`;
  }

  if (armadura) {
    if (!jogador.inventario) jogador.inventario = [];
    jogador.inventario.push(armadura.id);
    salvarJogador(jogador_id, jogador);
    adicionarConquista(jogador_id, 'comprador');
    if (jogador.moedas >= 1000) adicionarConquista(jogador_id, 'rico');
    return `✅ *${armadura.nome}* comprada!\n💰 Moedas restantes: *${jogador.moedas}*\nUse */equiparmadura ${armadura.nome}* para equipar.`;
  }

  if (!jogador.inventario) jogador.inventario = [];
  jogador.inventario.push(item.id);
  salvarJogador(jogador_id, jogador);

  adicionarConquista(jogador_id, 'comprador');
  if (jogador.moedas >= 1000) adicionarConquista(jogador_id, 'rico');

  return `✅ *${item.nome}* comprado!\n💰 Moedas restantes: *${jogador.moedas}*\nUse */usar ${item.id}* para usar.`;
}

function usarItem(jogador_id, item_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (jogador.morto) return '💀 Mortos não usam itens.';

  const busca = normalizarTexto(item_id);
  const idx = jogador.inventario?.findIndex(i => {
    if (normalizarTexto(i).includes(busca)) return true;
    const item_lookup = ITENS_LOJA.find(x => x.id === i);
    return item_lookup && normalizarTexto(item_lookup.nome).includes(busca);
  });
  if (idx === -1 || idx === undefined) return '❌ Item não encontrado no inventário.';

  const item_key = jogador.inventario[idx];
  const item = ITENS_LOJA.find(i => i.id === item_key);
  if (!item) return '❌ Item inválido.';

  // Bônus Alquimista
  const mult = jogador.classe === 'alquimista' ? 2 : 1;

  jogador.inventario.splice(idx, 1);

  switch (item.efeito) {
    case 'curar':
      const cura = item.valor * mult;
      jogador.hp = Math.min(jogador.hp_max, jogador.hp + cura);
      salvarJogador(jogador_id, jogador);
      return `💚 *${item.nome}* usado! +${cura} HP\nHP atual: *${jogador.hp}/${jogador.hp_max}*`;

    case 'mana':
      const mana_rec = item.valor * mult;
      jogador.mana = Math.min(jogador.mana_max || 100, (jogador.mana || 0) + mana_rec);
      salvarJogador(jogador_id, jogador);
      return `💧 *${item.nome}* usado! +${mana_rec} Mana\nMana atual: *${jogador.mana}*`;

    case 'curar_total':
      jogador.hp = jogador.hp_max;
      salvarJogador(jogador_id, jogador);
      return `💚 *${item.nome}* usado! HP totalmente restaurado!\nHP atual: *${jogador.hp}/${jogador.hp_max}*`;

    case 'mana_total':
      jogador.mana = jogador.mana_max || jogador.mana;
      salvarJogador(jogador_id, jogador);
      return `💧 *${item.nome}* usado! Mana totalmente restaurada!\nMana atual: *${jogador.mana}*`;

    case 'curar_sangramento':
      jogador.status_negativos = (jogador.status_negativos || []).filter(s => s !== 'sangramento' && s !== 'envenenado');
      salvarJogador(jogador_id, jogador);
      return `🩹 *${item.nome}* usado! Status negativos removidos.`;

    case 'purificar':
      jogador.status_negativos = [];
      salvarJogador(jogador_id, jogador);
      return `✨ *${item.nome}* usado! Purificado completamente.`;

    case 'xp':
      const xp_val = item.valor * mult;
      salvarJogador(jogador_id, jogador); // persiste a remoção do item no inventário primeiro
      adicionarXP(jogador_id, xp_val);    // só então aplica o XP (senão o salvamento acima sobrescrevia o ganho)
      return `📚 *${item.nome}* usado! +${xp_val} XP`;

    case 'ressurreicao':
      jogador.morto = false;
      jogador.hp = Math.max(1, Math.floor(jogador.hp - (jogador.hp * 0.1)));
      salvarJogador(jogador_id, jogador);
      return `💎 *Pedra de Ressurreição* usada! Você voltou com 80% do HP!`;

    case 'buff_for': {
      const ganho_for = item.valor * mult;
      jogador.for = (jogador.for || 10) + ganho_for;
      salvarJogador(jogador_id, jogador);
      return `💪 *${item.nome}* usado! Força permanente +${ganho_for}\nForça atual: *${jogador.for}*`;
    }

    case 'buff_sorte': {
      const duracao = item.duracao || 5;
      jogador.sorte_valor = item.valor * mult;
      jogador.sorte_batalhas_restantes = duracao;
      salvarJogador(jogador_id, jogador);
      return `🍀 *${item.nome}* usado! Sorte aumentada nas próximas *${duracao}* batalhas.`;
    }

    case 'teletransporte': {
      const regioes_ids = Object.keys(REGIOES).filter(r => r !== jogador.regiao);
      if (regioes_ids.length === 0) {
        salvarJogador(jogador_id, jogador);
        return `📜 *${item.nome}* usado, mas não há outra região para onde ir.`;
      }
      const destino = regioes_ids[Math.floor(Math.random() * regioes_ids.length)];
      jogador.regiao = destino;
      salvarJogador(jogador_id, jogador);
      return `📜 *${item.nome}* usado! Você foi teletransportado para *${REGIOES[destino].nome}*.`;
    }

    case 'nivel_up': {
      const xp_faltante = Math.max(1, (jogador.xp_proximo || 100) - (jogador.xp || 0));
      salvarJogador(jogador_id, jogador); // persiste a remoção do item antes de aplicar XP
      adicionarXP(jogador_id, xp_faltante);
      return `⭐ *${item.nome}* usado! Você subiu de nível instantaneamente!`;
    }

    default:
      salvarJogador(jogador_id, jogador);
      return `✅ *${item.nome}* usado!`;
  }
}

function equiparArma(jogador_id, arma_busca) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  const busca = normalizarTexto(arma_busca);
  const tem = jogador.inventario?.find(i => {
    if (normalizarTexto(i).includes(busca)) return true;
    const armaData = ARMAS.find(a => a.id === i);
    return armaData && normalizarTexto(armaData.nome).includes(busca);
  });
  if (!tem) return '❌ Você não possui esta arma no inventário.';

  const armaData = ARMAS.find(a => a.id === tem);
  if (!armaData) return '❌ Arma inválida.';

  jogador.arma = tem;
  salvarJogador(jogador_id, jogador);

  return `⚔️ *${armaData.nome}* equipada!\nDano: *${armaData.dano[0]}-${armaData.dano[1]}* | ${armaData.raridade}`;
}

function equiparArmadura(jogador_id, armadura_busca) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  const busca = normalizarTexto(armadura_busca);
  const tem = jogador.inventario?.find(i => {
    if (normalizarTexto(i).includes(busca)) return true;
    const armaduraData = ARMADURAS.find(a => a.id === i);
    return armaduraData && normalizarTexto(armaduraData.nome).includes(busca);
  });
  if (!tem) return '❌ Você não possui esta armadura no inventário.';

  const armaduraData = ARMADURAS.find(a => a.id === tem);
  if (!armaduraData) return '❌ Armadura inválida.';

  jogador.armadura = tem;
  salvarJogador(jogador_id, jogador);

  return `🛡️ *${armaduraData.nome}* equipada!\nDefesa: *+${armaduraData.defesa}* | ${armaduraData.raridade}`;
}

// ── VENDER ITEM (converte itens/troféus do inventário em Belarium) ──
const VALOR_TROFEU_MIN = 10;
const VALOR_TROFEU_MAX = 35;

function venderItem(jogador_id, item_nome) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (!jogador.inventario || jogador.inventario.length === 0) return '❌ Seu inventário está vazio.';

  const busca = normalizarTexto(item_nome);
  const idx = jogador.inventario.findIndex(i => {
    if (normalizarTexto(i).includes(busca)) return true;
    const item_lookup = ITENS_LOJA.find(x => x.id === i);
    if (item_lookup && normalizarTexto(item_lookup.nome).includes(busca)) return true;
    const arma_lookup = ARMAS.find(x => x.id === i);
    if (arma_lookup && normalizarTexto(arma_lookup.nome).includes(busca)) return true;
    const armadura_lookup = ARMADURAS.find(x => x.id === i);
    if (armadura_lookup && normalizarTexto(armadura_lookup.nome).includes(busca)) return true;
    return false;
  });

  if (idx === -1) return '❌ Item não encontrado no inventário. Use /inventario para ver o que você tem.';

  const item_key = jogador.inventario[idx];
  const item = ITENS_LOJA.find(i => i.id === item_key);
  const arma = ARMAS.find(a => a.id === item_key);
  const armadura = ARMADURAS.find(a => a.id === item_key);

  let valor = 0;
  let nome_exibido = item_key;

  if (arma && jogador.arma === item_key) return '❌ Você não pode vender a arma equipada! Equipe outra antes com /equipar.';
  if (armadura && jogador.armadura === item_key) return '❌ Você não pode vender a armadura equipada! Equipe outra antes com /equiparmadura.';

  if (item) { valor = Math.max(5, Math.floor((item.preco || 20) * 0.4)); nome_exibido = item.nome; }
  else if (arma) { valor = Math.max(10, Math.floor((arma.preco || 50) * 0.4)); nome_exibido = arma.nome; }
  else if (armadura) { valor = Math.max(10, Math.floor((armadura.preco || 50) * 0.4)); nome_exibido = armadura.nome; }
  else { valor = rand(VALOR_TROFEU_MIN, VALOR_TROFEU_MAX); nome_exibido = item_key; }

  jogador.inventario.splice(idx, 1);
  jogador.moedas = (jogador.moedas || 0) + valor;
  salvarJogador(jogador_id, jogador);

  return `💰 *${nome_exibido}* vendido por *${valor}* Belarium!\n💰 Moedas atuais: *${jogador.moedas}*`;
}

function verInventario(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  const armaAtual = ARMAS.find(a => a.id === jogador.arma);
  const armaduraAtual = ARMADURAS.find(a => a.id === jogador.armadura);
  let texto = `🎒 *INVENTÁRIO DE ${jogador.nome.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  texto += `⚔️ Arma equipada: *${armaAtual?.nome || 'Nenhuma'}*\n`;
  if (armaAtual) texto += `   Dano: ${armaAtual.dano[0]}-${armaAtual.dano[1]} | ${armaAtual.raridade}\n`;
  texto += `🛡️ Armadura equipada: *${armaduraAtual?.nome || 'Nenhuma'}*\n`;
  if (armaduraAtual) texto += `   Defesa: +${armaduraAtual.defesa} | ${armaduraAtual.raridade}\n`;
  texto += `💰 Moedas: *${jogador.moedas}*\n\n`;

  if (!jogador.inventario || jogador.inventario.length === 0) {
    texto += `_Inventário vazio._`;
  } else {
    texto += `📦 *ITENS:*\n`;
    const contagem = {};
    jogador.inventario.forEach(item_id => {
      contagem[item_id] = (contagem[item_id] || 0) + 1;
    });
    Object.entries(contagem).forEach(([item_id, qtd], i) => {
      const item = ITENS_LOJA.find(x => x.id === item_id);
      const arma = ARMAS.find(a => a.id === item_id);
      const armadura = ARMADURAS.find(a => a.id === item_id);
      const nome = item?.nome || arma?.nome || armadura?.nome || item_id;
      texto += `${i + 1}. ${nome}${qtd > 1 ? ` x${qtd}` : ''}\n`;
    });
    texto += `\n📝 */equipar [arma]* | */equiparmadura [armadura]* | */vender [item]*`;
  }

  if (jogador.poder_especial) {
    texto += `\n⚡ *PODER ESPECIAL:*\n_${jogador.poder_especial}_`;
  }

  return texto;
}

function verBanco(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  return `🏦 *BANCO DE VALDRIS*\n━━━━━━━━━━━━━━━━━━━━\n\n👤 *${jogador.nome}*\n\n💰 Carteira: *${jogador.moedas}* moedas\n🏦 Banco: *${jogador.banco || 0}* moedas\n\n📝 */depositar [valor]* — Depositar\n📝 */sacar [valor]* — Sacar`;
}

function depositar(jogador_id, valor) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (isNaN(valor) || valor <= 0) return '❌ Valor inválido.';
  if (jogador.moedas < valor) return `❌ Você não tem *${valor}* moedas na carteira.`;

  jogador.moedas -= valor;
  jogador.banco = (jogador.banco || 0) + valor;
  salvarJogador(jogador_id, jogador);

  return `🏦 Depositado *${valor}* moedas!\n💰 Carteira: *${jogador.moedas}* | Banco: *${jogador.banco}*`;
}

function sacar(jogador_id, valor) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (isNaN(valor) || valor <= 0) return '❌ Valor inválido.';
  if ((jogador.banco || 0) < valor) return `❌ Você não tem *${valor}* moedas no banco.`;

  jogador.banco -= valor;
  jogador.moedas += valor;
  salvarJogador(jogador_id, jogador);

  return `💰 Sacado *${valor}* moedas!\n💰 Carteira: *${jogador.moedas}* | Banco: *${jogador.banco}*`;
}

module.exports = { verLoja, comprarItem, usarItem, equiparArma, equiparArmadura, venderItem, verInventario, verBanco, depositar, sacar };
