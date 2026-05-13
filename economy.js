// ============================================================
// IMPERIUS RPG — ECONOMIA
// ============================================================
const { getJogador, salvarJogador, adicionarMoedas, adicionarXP, adicionarConquista } = require('./db');
const { ITENS_LOJA, ARMAS } = require('./gameData');

function verLoja() {
  let texto = `🛒 *LOJA DE VALDRIS* 🛒\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  texto += `⚔️ *ARMAS:*\n`;
  const armas_compraveis = ARMAS.filter(a => !a.exclusiva && a.preco > 0);
  armas_compraveis.forEach(a => {
    texto += `• *${a.nome}* — 💰 ${a.preco} | Dano: ${a.dano[0]}-${a.dano[1]} | ${a.raridade}\n`;
  });

  texto += `\n🧪 *ITENS:*\n`;
  ITENS_LOJA.forEach(i => {
    texto += `• *${i.nome}* — 💰 ${i.preco}\n`;
  });

  texto += `\n📝 Use */comprar [nome do item/arma]*`;
  return texto;
}

function comprarItem(jogador_id, item_nome) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (jogador.morto) return '💀 Mortos não compram.';

  const item = ITENS_LOJA.find(i => i.nome.toLowerCase().includes(item_nome.toLowerCase()) || i.id.toLowerCase().includes(item_nome.toLowerCase()));
  const arma = ARMAS.filter(a => !a.exclusiva).find(a => a.nome.toLowerCase().includes(item_nome.toLowerCase()) || a.id.toLowerCase().includes(item_nome.toLowerCase()));

  const alvo = item || arma;
  if (!alvo) return `❌ Item *${item_nome}* não encontrado. Use /loja para ver os itens.`;

  if (jogador.moedas < alvo.preco) return `❌ Moedas insuficientes! Você tem *${jogador.moedas}* moedas, precisa de *${alvo.preco}*.`;

  jogador.moedas -= alvo.preco;

  if (arma) {
    if (!jogador.inventario) jogador.inventario = [];
    jogador.inventario.push(arma.id);
    salvarJogador(jogador_id, jogador);
    return `✅ *${arma.nome}* comprada!\n💰 Moedas restantes: *${jogador.moedas}*\nUse */equipar ${arma.id}* para equipar.`;
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

  const idx = jogador.inventario?.findIndex(i => i === item_id || i.toLowerCase().includes(item_id.toLowerCase()));
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
      adicionarXP(jogador_id, xp_val);
      salvarJogador(jogador_id, jogador);
      return `📚 *${item.nome}* usado! +${xp_val} XP`;

    case 'ressurreicao':
      jogador.morto = false;
      jogador.hp = Math.max(1, Math.floor(jogador.hp - (jogador.hp * 0.1)));
      salvarJogador(jogador_id, jogador);
      return `💎 *Pedra de Ressurreição* usada! Você voltou com 80% do HP!`;

    default:
      salvarJogador(jogador_id, jogador);
      return `✅ *${item.nome}* usado!`;
  }
}

function equiparArma(jogador_id, arma_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  const tem = jogador.inventario?.find(i => i === arma_id || i.toLowerCase().includes(arma_id.toLowerCase()));
  if (!tem) return '❌ Você não possui esta arma no inventário.';

  const armaData = ARMAS.find(a => a.id === tem);
  if (!armaData) return '❌ Arma inválida.';

  jogador.arma = tem;
  salvarJogador(jogador_id, jogador);

  return `⚔️ *${armaData.nome}* equipada!\nDano: *${armaData.dano[0]}-${armaData.dano[1]}* | ${armaData.raridade}`;
}

function verInventario(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';

  const armaAtual = ARMAS.find(a => a.id === jogador.arma);
  let texto = `🎒 *INVENTÁRIO DE ${jogador.nome.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  texto += `⚔️ Arma equipada: *${armaAtual?.nome || 'Nenhuma'}*\n`;
  if (armaAtual) texto += `   Dano: ${armaAtual.dano[0]}-${armaAtual.dano[1]} | ${armaAtual.raridade}\n`;
  texto += `💰 Moedas: *${jogador.moedas}*\n\n`;

  if (!jogador.inventario || jogador.inventario.length === 0) {
    texto += `_Inventário vazio._`;
  } else {
    texto += `📦 *ITENS:*\n`;
    jogador.inventario.forEach((item_id, i) => {
      const item = ITENS_LOJA.find(i => i.id === item_id);
      const arma = ARMAS.find(a => a.id === item_id);
      const nome = item?.nome || arma?.nome || item_id;
      texto += `${i + 1}. ${nome}\n`;
    });
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

module.exports = { verLoja, comprarItem, usarItem, equiparArma, verInventario, verBanco, depositar, sacar };
