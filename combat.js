// ============================================================
// IMPERIUS RPG — SISTEMA DE COMBATE v4.0
// ============================================================
const { getJogador, salvarJogador, adicionarXP, adicionarMoedas, adicionarConquista, adicionarTitulo, formatarBelarium, formatarPreco, registrarHistorico } = require('./db');
const { CLASSES, REGIOES, ARMAS, ARMADURAS, ARMAS_PRIMORDIAIS, MONSTROS_HP, MONSTROS_DANO, HABILIDADES_ARMA_EXCLUSIVA } = require('./gameData');
const { processarMorteEncarnacao, isEncarnacao } = require('./incarnation');

function rolarD20() { return Math.floor(Math.random() * 20) + 1; }
function rolarDado(max) { return Math.floor(Math.random() * max) + 1; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ── EMOJI DE MONSTRO/BOSS POR TIPO ────────────────────────
function emojiMonstro(nome) {
  const n = (nome || '').toLowerCase();
  const mapa = [
    [['lobo', 'wolf'], '🐺'], [['morcego', 'bat'], '🦇'],
    [['zumbi', 'zombie'], '🧟'], [['esqueleto', 'skeleton'], '💀'],
    [['goblin'], '👺'], [['aranha', 'spider'], '🕷️'],
    [['cobra', 'serpente', 'naga'], '🐍'], [['dragao', 'dragão', 'dragon'], '🐉'],
    [['fantasma', 'espectro', 'ghost'], '👻'], [['orc'], '👹'],
    [['troll'], '🧌'], [['urso', 'bear'], '🐻'],
    [['lagarto', 'reptil', 'reptile'], '🦎'], [['ave', 'harpia', 'bird'], '🦅'],
    [['escorpiao', 'escorpião', 'scorpion'], '🦂'], [['golem', 'pedra', 'rocha'], '🗿'],
    [['slime', 'gosma'], '🟢'], [['demonio', 'demônio', 'demon'], '👹'],
    [['bruxa', 'witch'], '🧙'], [['vampiro', 'vampire'], '🧛'],
    [['leao', 'leão', 'lion'], '🦁'],
  ];
  for (const [chaves, emoji] of mapa) {
    if (chaves.some(k => n.includes(k))) return emoji;
  }
  return '👾';
}

function getResultadoD20(d20) {
  if (d20 === 1)  return { tipo: 'catastrofe',  mult: 0,   emoji: '💀', texto: 'FALHA CATASTRÓFICA!' };
  if (d20 <= 5)  return { tipo: 'falha_grave',  mult: 0,   emoji: '❌', texto: 'Falha Grave!' };
  if (d20 <= 9)  return { tipo: 'falha',        mult: 0.5, emoji: '😬', texto: 'Falha...' };
  if (d20 <= 14) return { tipo: 'normal',       mult: 1.0, emoji: '⚔️', texto: 'Ataque Normal' };
  if (d20 <= 17) return { tipo: 'bom',          mult: 1.2, emoji: '💥', texto: 'Bom Ataque!' };
  if (d20 <= 19) return { tipo: 'critico',      mult: 1.5, emoji: '🌟', texto: 'CRÍTICO!' };
  return           { tipo: 'perfeito',          mult: 2.0, emoji: '⭐', texto: 'ACERTO PERFEITO!!' };
}

function getBonusAtributo(xp) {
  if (xp >= 100000) return 150;
  if (xp >= 55000)  return 100;
  if (xp >= 35000)  return 75;
  if (xp >= 22000)  return 55;
  if (xp >= 13000)  return 40;
  if (xp >= 7000)   return 28;
  if (xp >= 3500)   return 18;
  if (xp >= 1500)   return 10;
  if (xp >= 500)    return 5;
  return 0;
}

function calcularDanoBase(jogador) {
  const bonus = getBonusAtributo(jogador.xp);
  const for_total = (jogador.for || 10) + bonus;
  const int_total = (jogador.int || 5) + bonus;
  const armaData = ARMAS.find(a => a.id === jogador.arma);
  const dano_arma = armaData ? rand(armaData.dano[0], armaData.dano[1]) : rand(5, 10);
  let dano_base = Math.floor(for_total * 1.5) + dano_arma;
  const bonus_talento = 1 + Math.min((jogador.talentos && jogador.talentos.dano) || 0, 20) * 0.01;
  dano_base = Math.floor(dano_base * bonus_talento);
  return { dano_base, for_total, int_total, bonus };
}

function calcularDefesa(jogador) {
  const bonus = getBonusAtributo(jogador.xp);
  const base = Math.floor(((jogador.con || 10) + bonus) * 1.2);
  const armaduraData = ARMADURAS.find(a => a.id === jogador.armadura);
  const bonus_armadura = armaduraData ? armaduraData.defesa : 0;
  const bonus_talento = 1 + Math.min((jogador.talentos && jogador.talentos.defesa) || 0, 20) * 0.01;
  return Math.floor((base + bonus_armadura) * bonus_talento);
}

function aplicarPassivaClasse(jogador, dano_causado, dano_recebido, resultado, monstro_morreu) {
  let dano_c = dano_causado;
  let dano_r = dano_recebido;
  let extras = [];

  switch (jogador.classe) {
    case 'guerreiro':
      dano_r = Math.floor(dano_r * 0.85);
      break;
    case 'assassino':
      if (resultado.tipo === 'normal') {
        dano_c = Math.floor(dano_c * 1.5);
        extras.push('🗡️ *Primeiro ataque crítico!* (Passiva Assassino)');
      }
      break;
    case 'cacador':
    case 'cacador_demonios':
      dano_c = Math.floor(dano_c * 1.2);
      break;
    case 'berserker':
      const hp_pct = jogador.hp / jogador.hp_max;
      if (hp_pct < 0.3) {
        dano_c = Math.floor(dano_c * 1.5);
        extras.push('😡 *MODO BERSERK ATIVADO!* +50% dano');
      }
      break;
    case 'vampiro':
      const roubo = Math.floor(dano_c * 0.15);
      jogador.hp = Math.min(jogador.hp_max, jogador.hp + roubo);
      extras.push(`🩸 *Roubo Vital:* +${roubo} HP sugado`);
      jogador.vampiro_roubos = (jogador.vampiro_roubos || 0) + roubo;
      break;
    case 'curandeiro':
      const cura = Math.floor(jogador.hp_max * 0.05);
      jogador.hp = Math.min(jogador.hp_max, jogador.hp + cura);
      extras.push(`💚 *Regeneração:* +${cura} HP`);
      break;
    case 'paladino':
      dano_r = Math.floor(dano_r * 0.75);
      extras.push('🛡️ *Escudo Divino* reduz dano recebido!');
      break;
    case 'monge':
      if (Math.random() < 0.2) {
        dano_r = 0;
        extras.push('🥋 *Esquiva perfeita!* Dano evitado!');
      }
      break;
    case 'ninja':
      if (Math.random() < 0.3) {
        dano_r = 0;
        extras.push('💨 *Sombra!* Você desapareceu no último segundo!');
      }
      break;
    case 'espectro':
      dano_c = Math.floor(dano_c * 1.5);
      extras.push('👻 *Ataque etéreo!* Ignora defesa');
      break;
    case 'heroi_caido':
      if (monstro_morreu && jogador.poderes_absorvidos && jogador.poderes_absorvidos.length < 5) {
        const poder = `Poder #${jogador.poderes_absorvidos.length + 1}`;
        jogador.poderes_absorvidos.push(poder);
        extras.push(`🔥 *Poder absorvido!* Você absorveu um poder do inimigo.`);
      }
      break;
    case 'artificer':
      if (jogador.armadilhas > 0) {
        const dano_trap = rand(15, 35);
        dano_c += dano_trap;
        jogador.armadilhas--;
        extras.push(`⚙️ *Armadilha ativada!* +${dano_trap} dano automático`);
      }
      break;
    case 'druida':
      const cura_druida = Math.floor(jogador.hp_max * 0.08);
      jogador.hp = Math.min(jogador.hp_max, jogador.hp + cura_druida);
      extras.push(`🌿 *Cura Natural:* +${cura_druida} HP`);
      break;
  }

  return { dano_c, dano_r, extras };
}

// ── GERAR MONSTRO (CORRIGIDO) ─────────────────────────────
function gerarMonstro(regiao_id, nivel) {
  const regiao = REGIOES[regiao_id];
  if (!regiao || !regiao.monstros || regiao.monstros.length === 0) return null;

  const monstro_base = regiao.monstros[Math.floor(Math.random() * regiao.monstros.length)];

  // Suporta tanto formato array [min,max] quanto número fixo
  function resolverValor(val) {
    if (Array.isArray(val)) return rand(val[0], val[1]);
    if (typeof val === 'number') return val;
    return 10;
  }

  const hp = resolverValor(monstro_base.hp);
  const dano = resolverValor(monstro_base.dano);
  const xp = resolverValor(monstro_base.xp);
  const moedas = resolverValor(monstro_base.moedas);

  return {
    nome: monstro_base.nome,
    hp, hp_max: hp, dano, xp, moedas
  };
}

// ── BATALHA MONSTRO ────────────────────────────────────────
// NOTA: batalharMonstro(), batalharBoss() e pvp() (resolução instantânea,
// 1 mensagem só) foram removidas — eram código morto, nunca chamadas em
// lugar nenhum. A batalha real do jogo é turno-a-turno e mora inteira em
// processarTurnoBatalha() no index.js, usando gerarMonstro/gerarBoss/
// calcularDanoBase/calcularDefesa/aplicarPassivaClasse daqui.


// ── GERAR BOSS (para batalha interativa turno-a-turno) ─────
function gerarBoss(regiao_id, bossEspecifico) {
  const regiao = REGIOES[regiao_id];
  if (!regiao || !regiao.bosses || regiao.bosses.length === 0) return null;
  const base = bossEspecifico || regiao.bosses[Math.floor(Math.random() * regiao.bosses.length)];
  return {
    nome: base.nome,
    hp: base.hp, hp_max: base.hp,
    dano: base.dano,
    xp: base.xp,
    moedas: base.moedas,
    drop: base.drop,
    drop_arma: !!base.drop_arma,
    fases: base.fases || []
  };
}

// Ranqueia os bosses de uma região do mais fraco (rank 1) pro mais forte
// (rank 10), com um "nível recomendado" interpolado dentro da faixa de
// nível da própria região — usado pelo /bosses e /boss [nome].
function bossesDaRegiao(regiao_id) {
  const regiao = REGIOES[regiao_id];
  if (!regiao || !regiao.bosses || regiao.bosses.length === 0) return [];
  const ordenados = regiao.bosses.slice().sort((a, b) => a.hp - b.hp);
  const total = ordenados.length;
  return ordenados.map((b, i) => ({
    ...b,
    rank: i + 1,
    nivel_recomendado: total > 1
      ? Math.round(regiao.nivel_min + (regiao.nivel_max - regiao.nivel_min) * (i / (total - 1)))
      : regiao.nivel_min
  }));
}

// Retorna a fase atual do boss de acordo com o % de HP restante
function faseAtualBoss(boss) {
  if (!boss.fases || boss.fases.length === 0) return null;
  const hp_pct = (boss.hp / boss.hp_max) * 100;
  let fase = boss.fases[0];
  for (const f of boss.fases) {
    if (hp_pct <= f.hp_pct) fase = f;
  }
  return fase;
}

// ── HABILIDADES ────────────────────────────────────────────
function usarHabilidade(jogador_id, hab_key) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Mortos não usam habilidades.' };

  const classeData = CLASSES[jogador.classe];
  if (!classeData || !classeData.habilidades[hab_key]) return { erro: '❌ Habilidade não encontrada.' };

  const hab = classeData.habilidades[hab_key];
  if (jogador.mana < hab.custo) return { erro: `❌ Mana insuficiente! Precisa: ${hab.custo}, tem: ${jogador.mana}` };

  jogador.mana -= hab.custo;
  const { for_total, int_total } = calcularDanoBase(jogador);
  let dano = 0;
  let msg_efeito = '';

  if (typeof hab.dano === 'function') {
    dano = Math.floor(hab.dano(for_total, int_total));
  }

  if (hab.efeito && Math.random() * 100 < (hab.chance || 100)) {
    msg_efeito = `\n✨ Efeito: *${hab.efeito}* aplicado!`;
  }

  salvarJogador(jogador_id, jogador);

  return {
    dano,
    logs: [
      `🎯 *${hab.nome}* ativada!`,
      `💧 Mana gasta: ${hab.custo} | Restante: ${jogador.mana}/${jogador.mana_max}`,
      dano > 0 ? `💥 Dano: *${dano}*` : `✨ Efeito ativado!`,
      msg_efeito
    ].filter(Boolean)
  };
}

// ── ULTIMATE ───────────────────────────────────────────────
function usarUltimate(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Mortos não usam ultimate.' };

  const classeData = CLASSES[jogador.classe];
  if (!classeData || !classeData.ultimate) return { erro: '❌ Classe sem ultimate.' };

  const ult = classeData.ultimate;
  const now = Date.now();
  const cooldown_ms = (ult.cooldown || 5) * 60 * 1000;

  if (!jogador.cooldown_ultimate) jogador.cooldown_ultimate = {};
  if (now - (jogador.cooldown_ultimate[jogador.classe] || 0) < cooldown_ms) {
    const restante = Math.ceil((cooldown_ms - (now - jogador.cooldown_ultimate[jogador.classe])) / 60000);
    return { erro: `⏳ Ultimate em cooldown! Aguarde *${restante} min*.` };
  }

  if (jogador.mana < ult.custo) return { erro: `❌ Mana insuficiente! Precisa: ${ult.custo}` };

  jogador.mana -= ult.custo;
  const { for_total, int_total } = calcularDanoBase(jogador);
  const hits = ult.hits || 1;
  let dano_total = 0;

  for (let i = 0; i < hits; i++) {
    if (typeof ult.dano === 'function') {
      dano_total += Math.floor(ult.dano(for_total, int_total));
    }
  }

  jogador.cooldown_ultimate[jogador.classe] = now;
  salvarJogador(jogador_id, jogador);

  return {
    dano: dano_total,
    logs: [
      `💫 *ULTIMATE!* ${ult.nome}`,
      `💥 Dano total: *${dano_total}* (${hits} hit${hits > 1 ? 's' : ''})`,
      `💧 Mana restante: ${jogador.mana}/${jogador.mana_max}`,
      `⏳ Cooldown: ${ult.cooldown} minutos`
    ]
  };
}

// ── HABILIDADE EXCLUSIVA DE ARMA ────────────────────────────
function usarHabilidadeArma(jogador_id, hab_key_arma) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Mortos não usam técnicas de arma.' };

  const armaEx = HABILIDADES_ARMA_EXCLUSIVA[jogador.arma];
  if (!armaEx || !armaEx.habilidades || !armaEx.habilidades[hab_key_arma]) {
    return { erro: '❌ Sua arma equipada não tem essa técnica especial.' };
  }

  const hab = armaEx.habilidades[hab_key_arma];
  if (jogador.mana < hab.custo) return { erro: `❌ Mana insuficiente! Precisa: ${hab.custo}, tem: ${jogador.mana}` };

  jogador.mana -= hab.custo;
  const { for_total, int_total } = calcularDanoBase(jogador);
  let dano = 0;
  if (typeof hab.dano === 'function') dano = Math.floor(hab.dano(for_total, int_total));

  salvarJogador(jogador_id, jogador);

  return {
    dano,
    logs: [
      `⚔️ *${hab.nome}* (técnica de arma) ativada!`,
      `💧 Mana gasta: ${hab.custo} | Restante: ${jogador.mana}/${jogador.mana_max}`,
      dano > 0 ? `💥 Dano: *${dano}*` : `✨ Efeito ativado!`
    ]
  };
}

// ── TÉCNICA SUPREMA DE ARMA ──────────────────────────────────
function usarSupremaArma(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Mortos não usam técnicas de arma.' };

  const armaEx = HABILIDADES_ARMA_EXCLUSIVA[jogador.arma];
  if (!armaEx || !armaEx.suprema) {
    return { erro: '❌ Sua arma equipada não tem uma técnica suprema.' };
  }

  const sup = armaEx.suprema;
  const now = Date.now();
  const cooldown_ms = (sup.cooldown || 10) * 60 * 1000;
  if (!jogador.cooldown_suprema_arma) jogador.cooldown_suprema_arma = {};
  if (now - (jogador.cooldown_suprema_arma[jogador.arma] || 0) < cooldown_ms) {
    const restante = Math.ceil((cooldown_ms - (now - jogador.cooldown_suprema_arma[jogador.arma])) / 60000);
    return { erro: `⏳ Técnica suprema em cooldown! Aguarde *${restante} min*.` };
  }
  if (jogador.mana < sup.custo) return { erro: `❌ Mana insuficiente! Precisa: ${sup.custo}` };

  jogador.mana -= sup.custo;
  const { for_total, int_total } = calcularDanoBase(jogador);
  const hits = sup.hits || 1;
  let dano_total = 0;
  for (let i = 0; i < hits; i++) {
    if (typeof sup.dano === 'function') dano_total += Math.floor(sup.dano(for_total, int_total));
  }

  jogador.cooldown_suprema_arma[jogador.arma] = now;
  salvarJogador(jogador_id, jogador);

  return {
    dano: dano_total,
    logs: [
      `🌟 *TÉCNICA SUPREMA!* ${sup.nome}`,
      `💥 Dano total: *${dano_total}* (${hits} hit${hits > 1 ? 's' : ''})`,
      `💧 Mana restante: ${jogador.mana}/${jogador.mana_max}`,
      `⏳ Cooldown: ${sup.cooldown || 10} minutos`
    ]
  };
}

module.exports = {
  usarHabilidade, usarUltimate, usarHabilidadeArma, usarSupremaArma, rolarD20, rand, gerarMonstro,
  gerarBoss, bossesDaRegiao, faseAtualBoss, calcularDanoBase, calcularDefesa, aplicarPassivaClasse, getResultadoD20, emojiMonstro
};
