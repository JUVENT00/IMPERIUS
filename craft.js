// ============================================================
// IMPERIUS RPG — SISTEMA DE CRAFTING
// Usa materiais dropados em batalha (rolarLootBatalha) pra criar
// armas e armaduras reais do jogo.
// ============================================================
const { getJogador, salvarJogador } = require('./db');
const { ITENS_DOMAR } = require('./pets');
const { ARMAS, ARMADURAS } = require('./gameData');

function buscarArma(id) { return ARMAS.find(a => a.id === id); }
function buscarArmadura(id) { return ARMADURAS.find(a => a.id === id); }

// ── RECEITAS ──────────────────────────────────────────────
// materiais: { chave_do_item_domar: quantidade }
// resultado: { tipo: 'arma' | 'armadura', id: id_no_gameData }
const RECEITAS = {
  'punhal rustico': {
    nome: '🗡️ Punhal Rúnico (Incomum)',
    materiais: { 'pedra de luz': 2, 'carne crua': 3 },
    moedas: 150,
    resultado: { tipo: 'arma', id: 'contato_punhal_runico_2' }
  },
  'besta reforcada': {
    nome: '🏹 Besta Ancestral (Raro)',
    materiais: { 'cristal de gelo': 2, 'coral sagrado': 1 },
    moedas: 300,
    resultado: { tipo: 'arma', id: 'distancia_besta_ancestral_3' }
  },
  'cetro menor': {
    nome: '🪄 Cetro Arcano (Épico)',
    materiais: { 'essencia magica': 2, 'raiz ancestral': 2 },
    moedas: 700,
    resultado: { tipo: 'arma', id: 'magica_cetro_arcano_4' }
  },
  'armadura elfica leve': {
    nome: '🍃 Armadura Élfica (Raro)',
    materiais: { 'peixe espectral': 2, 'alga abissal': 2 },
    moedas: 250,
    resultado: { tipo: 'armadura', id: 'armadura_elfica_3' }
  },
  'armadura titan media': {
    nome: '🗿 Armadura de Titã (Épico)',
    materiais: { 'minerio sagrado': 2, 'po de osso sagrado': 1 },
    moedas: 650,
    resultado: { tipo: 'armadura', id: 'armadura_titan_4' }
  },
  'punhal ancestral': {
    nome: '🗡️ Punhal Rúnico (Ancestral)',
    materiais: { 'cristal de alma': 2, 'escama de leviata': 2, 'essencia primordial': 1 },
    moedas: 1900,
    resultado: { tipo: 'arma', id: 'contato_punhal_runico_6' }
  },
  'besta lendaria': {
    nome: '🏹 Besta Ancestral (Lendário)',
    materiais: { 'fruto da imortalidade': 1, 'maca dourada': 1, 'cristal de alma': 2 },
    moedas: 1600,
    resultado: { tipo: 'arma', id: 'distancia_besta_ancestral_5' }
  },
  'armadura titan pesada': {
    nome: '🗿 Armadura de Titã (Ancestral)',
    materiais: { 'roma do hades': 2, 'minerio sagrado': 3, 'essencia primordial': 1 },
    moedas: 2200,
    resultado: { tipo: 'armadura', id: 'armadura_titan_6' }
  },
  'cetro primordial menor': {
    nome: '🪄 Cetro Arcano (Primordial)',
    materiais: { 'essencia primordial': 3, 'figo sagrado': 2, 'cristal de alma': 2 },
    moedas: 4500,
    resultado: { tipo: 'arma', id: 'magica_cetro_arcano_8' }
  },
  'armadura elfica pesada': {
    nome: '🍃 Armadura Élfica (Abissal)',
    materiais: { 'escama de leviata': 3, 'ambrosia': 1, 'essencia primordial': 2 },
    moedas: 9000,
    resultado: { tipo: 'armadura', id: 'armadura_elfica_9' }
  }
};

function normalizarChave(s) {
  return (s || '').toLowerCase().trim();
}

function contarMaterial(inventario, chave) {
  return (inventario || []).filter(i => normalizarChave(i) === chave).length;
}

function verReceitas() {
  const linhas = Object.entries(RECEITAS).map(([key, r]) => {
    const mats = Object.entries(r.materiais).map(([m, q]) => `${q}x ${ITENS_DOMAR[m] ? ITENS_DOMAR[m].nome : m}`).join(', ');
    return `🔧 */craft ${key}*\n   ↳ ${r.nome}\n   ↳ Precisa: ${mats} + 🪙 ${r.moedas}`;
  });
  return linhas;
}

function craftar(jogador_id, nome_receita) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: '❌ Personagem não encontrado!' };
  if (!nome_receita || !nome_receita.trim()) return { erro: '❌ Use: /craft [receita]\nVeja as receitas com /receitas' };

  const key = normalizarChave(nome_receita);
  const receita = RECEITAS[key];
  if (!receita) return { erro: `❌ Receita não encontrada!\nUse /receitas pra ver as disponíveis.` };

  // Checa materiais
  for (const [material, qtd] of Object.entries(receita.materiais)) {
    if (contarMaterial(j.inventario, material) < qtd) {
      const nomeMat = ITENS_DOMAR[material] ? ITENS_DOMAR[material].nome : material;
      return { erro: `❌ Faltam materiais! Você precisa de ${qtd}x ${nomeMat}.` };
    }
  }
  if ((j.moedas || 0) < receita.moedas) {
    return { erro: `❌ Você precisa de 🪙 ${receita.moedas} pra craftar isso!` };
  }

  // Consome materiais
  for (const [material, qtd] of Object.entries(receita.materiais)) {
    let restante = qtd;
    j.inventario = j.inventario.filter(i => {
      if (restante > 0 && normalizarChave(i) === material) { restante--; return false; }
      return true;
    });
  }
  j.moedas -= receita.moedas;

  // Gera o resultado
  let itemFinal;
  if (receita.resultado.tipo === 'arma') {
    itemFinal = buscarArma(receita.resultado.id);
    j.inventario.push(itemFinal.id);
  } else if (receita.resultado.tipo === 'armadura') {
    itemFinal = buscarArmadura(receita.resultado.id);
    j.inventario.push(itemFinal.id);
  }
  if (!itemFinal) return { erro: '❌ Erro interno: item de resultado não encontrado.' };

  salvarJogador(jogador_id, j);

  return {
    msg: `🔨 Você craftou *${itemFinal.nome}*!\n${receita.resultado.tipo === 'arma' ? `⚔️ Dano: ${itemFinal.dano[0]}-${itemFinal.dano[1]}` : `🛡️ Defesa: +${itemFinal.defesa}`} | ${itemFinal.raridade}\n\nUse /equipar ${itemFinal.nome} pra vestir.`
  };
}

module.exports = { RECEITAS, verReceitas, craftar };
