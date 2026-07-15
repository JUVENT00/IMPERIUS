// ============================================================
// IMPERIUS RPG — SISTEMA DE COMBATE v4.0
// ============================================================
const { getJogador, salvarJogador, adicionarXP, adicionarMoedas, adicionarConquista, adicionarTitulo } = require('./db');
const { CLASSES, REGIOES, ARMAS, ARMADURAS, ARMAS_PRIMORDIAIS, MONSTROS_HP, MONSTROS_DANO } = require('./gameData');
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
  const dano_base = Math.floor(for_total * 1.5) + dano_arma;
  return { dano_base, for_total, int_total, bonus };
}

function calcularDefesa(jogador) {
  const bonus = getBonusAtributo(jogador.xp);
  const base = Math.floor(((jogador.con || 10) + bonus) * 1.2);
  const armaduraData = ARMADURAS.find(a => a.id === jogador.armadura);
  const bonus_armadura = armaduraData ? armaduraData.defesa : 0;
  return base + bonus_armadura;
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
function batalharMonstro(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Você está morto! Use /renascer.' };

  const now = Date.now();
  if (now - (jogador.cooldown_batalha || 0) < 10000) {
    return { erro: `⏳ Aguarde ${Math.ceil((10000 - (now - jogador.cooldown_batalha)) / 1000)}s para batalhar novamente.` };
  }

  const monstro = gerarMonstro(jogador.regiao, jogador.nivel || 1);
  if (!monstro) return { erro: '❌ Região inválida. Use /viajar para ir a uma região.' };

  const d20 = rolarD20();
  const resultado = getResultadoD20(d20);
  const { dano_base } = calcularDanoBase(jogador);
  const defesa_monstro = Math.floor(monstro.hp * 0.05);

  let dano_causado = 0;
  let logs = [];

  if (resultado.tipo === 'catastrofe') {
    const auto = Math.floor(dano_base * 0.3);
    jogador.hp = Math.max(1, jogador.hp - auto);
    logs.push(`💥 Você se machucou! *-${auto} HP*`);
  } else if (resultado.tipo !== 'falha_grave') {
    dano_causado = Math.max(1, Math.floor(dano_base * resultado.mult) - defesa_monstro);
  }

  const monstro_dano = rand(Math.floor(monstro.dano * 0.8), Math.ceil(monstro.dano * 1.2));
  let dano_recebido = Math.max(1, monstro_dano - calcularDefesa(jogador));
  const monstro_morreu = dano_causado >= monstro.hp;

  const { dano_c, dano_r, extras } = aplicarPassivaClasse(jogador, dano_causado, dano_recebido, resultado, monstro_morreu);
  dano_causado = dano_c;
  dano_recebido = dano_r;

  if (!monstro_morreu) {
    jogador.hp = Math.max(0, jogador.hp - dano_recebido);
  }

  logs.unshift(`🎲 D20: *${d20}* — ${resultado.emoji} ${resultado.texto}`);
  logs.push(`⚔️ Atacou *${monstro.nome}* — Dano: *${dano_causado}*`);
  if (!monstro_morreu) logs.push(`🛡️ ${monstro.nome} contra-atacou: *-${dano_recebido} HP*`);
  extras.forEach(e => logs.push(e));

  let ganhos = { xp: 0, moedas: 0, item: null };

  if (monstro_morreu) {
    ganhos.xp = monstro.xp;
    ganhos.moedas = monstro.moedas;
    jogador.kills = (jogador.kills || 0) + 1;
    logs.push(`\n✅ *${monstro.nome} derrotado!*`);
    logs.push(`📚 +${ganhos.xp} XP | 💰 +${ganhos.moedas} moedas`);

    if (Math.random() < 0.15) {
      const drops = ['Fragmento de Minério','Pele de Monstro','Osso Resistente','Cristal Bruto','Essência Elementar'];
      ganhos.item = drops[Math.floor(Math.random() * drops.length)];
      if (!jogador.inventario) jogador.inventario = [];
      jogador.inventario.push(ganhos.item);
      logs.push(`🎁 Drop: *${ganhos.item}*`);
    }

  }

  if (jogador.hp <= 0) {
    if (jogador.classe === 'serafim' && !jogador.ressurreicao_usada) {
      jogador.hp = jogador.hp_max;
      jogador.ressurreicao_usada = true;
      logs.push(`\n🕯️ *RESSURREIÇÃO DIVINA!* O Serafim voltou com HP cheio!`);
    } else {
      jogador.morto = true;
      jogador.hp = 0;
      jogador.mortes = (jogador.mortes || 0) + 1;
      logs.push(`\n💀 *VOCÊ MORREU!*\nUse /renascer para voltar.`);
    }
  }

  // Mostrar HP atual
  const hp_pct = Math.floor((jogador.hp / jogador.hp_max) * 10);
  const barra_hp = '█'.repeat(Math.max(0, hp_pct)) + '░'.repeat(Math.max(0, 10 - hp_pct));
  logs.push(`\n❤️ Seu HP: *${jogador.hp}/${jogador.hp_max}*\n[${barra_hp}]`);

  // Opções de próxima ação
  if (!jogador.morto) {
    logs.push(`\n⚔️ *Próxima ação:*\n1️⃣ /batalha — Continuar\n2️⃣ /boss — Enfrentar boss\n3️⃣ /usar [item] — Usar item\n4️⃣ /acampar — Descansar`);
  }

  jogador.cooldown_batalha = now;
  // Salva primeiro o estado local (HP, kills, morto, drop no inventário, cooldown).
  salvarJogador(jogador_id, jogador);

  // Só então aplica XP/moedas/conquistas — cada uma faz sua própria leitura e
  // gravação mais recente, então precisam vir DEPOIS do salvarJogador acima
  // (senão o salvarJogador sobrescreve o ganho de XP/moedas com o valor antigo).
  if (monstro_morreu) {
    adicionarXP(jogador_id, ganhos.xp);
    adicionarMoedas(jogador_id, ganhos.moedas);
    if (jogador.kills === 1)    adicionarConquista(jogador_id, 'primeiro_sangue');
    if (jogador.kills >= 10)   adicionarConquista(jogador_id, 'matador');
    if (jogador.kills >= 50)   adicionarConquista(jogador_id, 'cacador_exp');
    if (jogador.kills >= 200)  adicionarConquista(jogador_id, 'ceifador');
    if (jogador.kills >= 1000) adicionarConquista(jogador_id, 'lenda_viva');
    if (d20 === 20) adicionarConquista(jogador_id, 'critico_perfeito');
  }
  if (jogador.morto) adicionarConquista(jogador_id, 'primeira_morte');

  return { logs, monstro_morreu, jogador_morreu: jogador.morto, ganhos, hp_atual: jogador.hp, hp_max: jogador.hp_max, monstro_nome: monstro.nome, monstro_hp: monstro.hp, monstro_hp_max: monstro.hp_max };
}

// ── BATALHA BOSS ───────────────────────────────────────────
function batalharBoss(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Você está morto! Use /renascer.' };

  const regiao = REGIOES[jogador.regiao];
  if (!regiao || !regiao.bosses) return { erro: '❌ Não há boss nessa região!' };

  const now = Date.now();
  if (now - (jogador.cooldown_batalha || 0) < 30000) {
    return { erro: `⏳ Aguarde ${Math.ceil((30000 - (now - jogador.cooldown_batalha)) / 1000)}s para enfrentar um boss.` };
  }

  const boss = regiao.bosses[Math.floor(Math.random() * regiao.bosses.length)];
  const d20 = rolarD20();
  const resultado = getResultadoD20(d20);
  const { dano_base } = calcularDanoBase(jogador);
  const boss_dano = rand(boss.dano[0], boss.dano[1]);
  let dano_recebido = Math.max(1, boss_dano - calcularDefesa(jogador));
  let dano_causado = 0;

  if (resultado.tipo !== 'catastrofe' && resultado.tipo !== 'falha_grave') {
    dano_causado = Math.max(1, Math.floor(dano_base * resultado.mult));
  }

  const boss_morreu = dano_causado >= boss.hp;
  jogador.hp = Math.max(0, jogador.hp - dano_recebido);

  let logs = [];
  logs.push(`⚔️ *ENFRENTANDO BOSS!*`);
  logs.push(`${emojiMonstro(boss.nome)} ${boss.nome}`);
  logs.push(`❤️ HP Boss: ${boss.hp}`);
  logs.push(`\n🎲 D20: *${d20}* — ${resultado.emoji} ${resultado.texto}`);
  logs.push(`⚔️ Seu dano: *${dano_causado}*`);
  logs.push(`🛡️ Dano recebido: *-${dano_recebido} HP*`);

  const boss_moedas = rand(boss.moedas[0], boss.moedas[1]);
  if (boss_morreu) {
    logs.push(`\n🏆 *BOSS DERROTADO!*`);
    logs.push(`📚 +${boss.xp} XP | 💰 +${boss_moedas} moedas`);
    if (boss.drop_arma) logs.push(`⚔️ *Drop especial!* ${boss.drop}`);
    jogador.boss_mortos = [...(jogador.boss_mortos || []), boss.nome];
  }

  if (jogador.hp <= 0) {
    jogador.morto = true;
    jogador.hp = 0;
    jogador.mortes = (jogador.mortes || 0) + 1;
    logs.push(`\n💀 *VOCÊ MORREU!* O boss foi forte demais.\nUse /renascer para voltar.`);
  }

  const hp_pct = Math.floor((jogador.hp / jogador.hp_max) * 10);
  const barra_hp = '█'.repeat(Math.max(0, hp_pct)) + '░'.repeat(Math.max(0, 10 - hp_pct));
  logs.push(`\n❤️ Seu HP: *${jogador.hp}/${jogador.hp_max}*\n[${barra_hp}]`);

  jogador.cooldown_batalha = now;
  // Salva o estado local primeiro; XP/moedas/conquista são aplicados depois
  // (mesma correção de batalharMonstro — evita sobrescrever o ganho).
  salvarJogador(jogador_id, jogador);

  if (boss_morreu) {
    adicionarXP(jogador_id, boss.xp);
    adicionarMoedas(jogador_id, boss_moedas);
    adicionarConquista(jogador_id, 'iniciado_boss');
  }

  return { logs, boss_morreu, jogador_morreu: jogador.morto };
}

// ── GERAR BOSS (para batalha interativa turno-a-turno) ─────
function gerarBoss(regiao_id) {
  const regiao = REGIOES[regiao_id];
  if (!regiao || !regiao.bosses || regiao.bosses.length === 0) return null;
  const base = regiao.bosses[Math.floor(Math.random() * regiao.bosses.length)];
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

// ── PVP ────────────────────────────────────────────────────
function pvp(atacante_id, alvo_id) {
  const atacante = getJogador(atacante_id);
  const alvo = getJogador(alvo_id);
  if (!atacante) return { erro: '❌ Você não tem personagem.' };
  if (!alvo) return { erro: '❌ Alvo não encontrado.' };
  if (atacante.morto) return { erro: '💀 Mortos não atacam.' };
  if (alvo.morto) return { erro: '💀 O alvo já está morto.' };
  if (atacante_id === alvo_id) return { erro: '❌ Você não pode se atacar!' };

  const d20_a = rolarD20();
  const d20_d = rolarD20();
  const res_a = getResultadoD20(d20_a);
  const res_d = getResultadoD20(d20_d);

  const { dano_base: dano_a } = calcularDanoBase(atacante);
  const { dano_base: dano_d } = calcularDanoBase(alvo);
  const def_a = calcularDefesa(atacante);
  const def_d = calcularDefesa(alvo);

  const dano_causado = Math.max(1, Math.floor(dano_a * res_a.mult) - def_d);
  const dano_recebido = Math.max(1, Math.floor(dano_d * res_d.mult) - def_a);

  alvo.hp = Math.max(0, alvo.hp - dano_causado);
  atacante.hp = Math.max(0, atacante.hp - dano_recebido);

  let logs = [];
  logs.push(`⚔️ *PvP!* ${atacante.nome} vs ${alvo.nome}`);
  logs.push(`\n🎲 ${atacante.nome}: D20 *${d20_a}* — ${res_a.emoji} ${res_a.texto}`);
  logs.push(`💥 Dano causado: *${dano_causado}*`);
  logs.push(`\n🎲 ${alvo.nome}: D20 *${d20_d}* — ${res_d.emoji} ${res_d.texto}`);
  logs.push(`💥 Contra-ataque: *${dano_recebido}*`);

  let enc_morreu = null;
  let atacante_venceu = false;

  if (alvo.hp <= 0) {
    alvo.morto = true;
    alvo.hp = 0;
    alvo.mortes = (alvo.mortes || 0) + 1;
    atacante.pvp_vitorias = (atacante.pvp_vitorias || 0) + 1;
    atacante_venceu = true;
    logs.push(`\n💀 *${alvo.nome} foi derrotado!*`);
    adicionarTitulo(alvo_id, 'mais_fraco');
    if (alvo.mortes >= 10) adicionarTitulo(alvo_id, 'perdedor');
    if (isEncarnacao && isEncarnacao(alvo_id)) {
      enc_morreu = { enc_id: alvo_id, matador_id: atacante_id, matador_nome: atacante.nome };
    }
  }

  if (atacante.hp <= 0) {
    atacante.morto = true;
    atacante.hp = 0;
    atacante.mortes = (atacante.mortes || 0) + 1;
    logs.push(`\n💀 *${atacante.nome} também caiu!*`);
    adicionarTitulo(atacante_id, 'mais_fraco');
    if (atacante.mortes >= 10) adicionarTitulo(atacante_id, 'perdedor');
  }

  const hp_a_pct = Math.floor((atacante.hp / atacante.hp_max) * 10);
  const hp_d_pct = Math.floor((alvo.hp / alvo.hp_max) * 10);
  logs.push(`\n❤️ ${atacante.nome}: ${atacante.hp}/${atacante.hp_max} [${'█'.repeat(hp_a_pct)}${'░'.repeat(10-hp_a_pct)}]`);
  logs.push(`❤️ ${alvo.nome}: ${alvo.hp}/${alvo.hp_max} [${'█'.repeat(hp_d_pct)}${'░'.repeat(10-hp_d_pct)}]`);

  salvarJogador(atacante_id, atacante);
  salvarJogador(alvo_id, alvo);

  if (atacante_venceu) {
    adicionarXP(atacante_id, 100);
    adicionarMoedas(atacante_id, 50);
  }

  return { logs, enc_morreu, atacante_venceu };
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

module.exports = {
  batalharMonstro, batalharBoss, pvp, usarHabilidade, usarUltimate, rolarD20, rand, gerarMonstro,
  gerarBoss, faseAtualBoss, calcularDanoBase, calcularDefesa, aplicarPassivaClasse, getResultadoD20, emojiMonstro
};
