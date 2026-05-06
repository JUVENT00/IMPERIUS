// ============================================================
// IMPERIUS RPG — SISTEMA DE COMBATE
// ============================================================
const { getJogador, salvarJogador, adicionarXP, adicionarMoedas, adicionarConquista, adicionarTitulo } = require('./db');
const { CLASSES, REGIOES, ARMAS, MONSTROS_HP, MONSTROS_DANO } = require('./gameData');
const { processarMorteEncarnacao, isEncarnacao } = require('./incarnation');

function rolarD20() { return Math.floor(Math.random() * 20) + 1; }
function rolarDado(max) { return Math.floor(Math.random() * max) + 1; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

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
  const for_total = jogador.for + bonus;
  const int_total = jogador.int + bonus;
  const armaData = ARMAS.find(a => a.id === jogador.arma);
  const dano_arma = armaData ? rand(armaData.dano[0], armaData.dano[1]) : rand(5, 10);
  const dano_base = Math.floor(for_total * 1.5) + dano_arma;
  return { dano_base, for_total, int_total, bonus };
}

function calcularDefesa(jogador) {
  const bonus = getBonusAtributo(jogador.xp);
  return Math.floor((jogador.con + bonus) * 1.2);
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
      if ((jogador.primeiro_ataque_batalha || true) && resultado.tipo === 'normal') {
        dano_c = Math.floor(dano_c * 1.5);
        extras.push('🗡️ *Primeiro ataque crítico!* (Passiva Assassino)');
      }
      break;
    case 'cacador':
      dano_c = Math.floor(dano_c * 1.2);
      break;
    case 'berserker':
      const hp_pct = jogador.hp_max / jogador.hp;
      if (hp_pct < 0.3) {
        dano_c = Math.floor(dano_c * 1.5);
        extras.push('😡 *MODO BERSERK ATIVADO!* +50% dano');
      }
      break;
    case 'vampiro':
      const roubo = Math.floor(dano_c * 0.15);
      jogador.hp_max = Math.min(jogador.hp, jogador.hp_max + roubo);
      extras.push(`🩸 *Roubo Vital:* +${roubo} HP sugado`);
      jogador.vampiro_roubos = (jogador.vampiro_roubos || 0) + roubo;
      break;
    case 'ninja':
      if (Math.random() < 0.30) {
        dano_r = 0;
        extras.push('🥷 *Esquiva perfeita!* (Passiva Ninja)');
      }
      break;
    case 'sombra':
      if (jogador.invisivel) {
        dano_c = Math.floor(dano_c * 3);
        jogador.invisivel = false;
        extras.push('🌑 *Ataque das sombras!* Dano triplicado!');
      }
      break;
    case 'dragomante':
      if (jogador.tem_dragao) {
        const dano_dragao = rand(20, 50);
        dano_c += dano_dragao;
        extras.push(`🐉 *Dragão atacou junto!* +${dano_dragao} dano`);
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
  }

  return { dano_c, dano_r, extras };
}

function gerarMonstro(regiao_id, nivel) {
  const regiao = REGIOES[regiao_id];
  if (!regiao) return null;
  const tier = Math.min(7, Math.max(1, Math.floor(nivel / 15) + 1));
  const nome = regiao.monstros[Math.floor(Math.random() * regiao.monstros.length)];
  const hp = rand(MONSTROS_HP[tier][0], MONSTROS_HP[tier][1]);
  const dano = rand(MONSTROS_DANO[tier][0], MONSTROS_DANO[tier][1]);
  return {
    nome, hp, hp_max: hp, dano,
    xp: Math.floor(regiao.xp[0] + rand(10, 30)),
    moedas: rand(regiao.moedas[0], regiao.moedas[1])
  };
}

// ── BATALHA MONSTRO ────────────────────────────────────────
function batalharMonstro(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Você está morto! Use /renascer.' };

  const now = Date.now();
  if (now - (jogador.cooldown_batalha || 0) < 10000) {
    return { erro: `⏳ Aguarde ${Math.ceil((10000 - (now - jogador.cooldown_batalha)) / 1000)}s.` };
  }

  const monstro = gerarMonstro(jogador.regiao, getBonusAtributo(jogador.xp));
  if (!monstro) return { erro: '❌ Região inválida.' };

  const d20 = rolarD20();
  const resultado = getResultadoD20(d20);
  const { dano_base } = calcularDanoBase(jogador);
  const defesa_monstro = Math.floor(monstro.hp * 0.05);

  let dano_causado = 0;
  let logs = [];

  if (resultado.tipo === 'catastrofe') {
    const auto = Math.floor(dano_base * 0.3);
    jogador.hp_max = Math.max(1, jogador.hp_max - auto);
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

  jogador.hp_max -= dano_recebido;

  logs.unshift(`🎲 D20: *${d20}* — ${resultado.emoji} ${resultado.texto}`);
  logs.push(`⚔️ Atacou *${monstro.nome}* — Dano: *${dano_causado}*`);
  logs.push(`🛡️ ${monstro.nome} atacou: *-${dano_recebido} HP*`);
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

    adicionarXP(jogador_id, ganhos.xp);
    adicionarMoedas(jogador_id, ganhos.moedas);

    if (jogador.kills === 1)    adicionarConquista(jogador_id, 'primeiro_sangue');
    if (jogador.kills >= 10)   adicionarConquista(jogador_id, 'matador');
    if (jogador.kills >= 50)   adicionarConquista(jogador_id, 'cacador_exp');
    if (jogador.kills >= 200)  adicionarConquista(jogador_id, 'ceifador');
    if (jogador.kills >= 1000) adicionarConquista(jogador_id, 'lenda_viva');
    if (d20 === 20) adicionarConquista(jogador_id, 'critico_perfeito');
  }

  if (jogador.hp_max <= 0) {
    // Serafim ressuscita automaticamente
    if (jogador.classe === 'serafim' && !jogador.ressurreicao_usada) {
      jogador.hp_max = jogador.hp;
      jogador.ressurreicao_usada = true;
      logs.push(`\n🕯️ *RESSURREIÇÃO DIVINA!* O Serafim voltou com HP cheio!`);
    } else {
      jogador.morto = true;
      jogador.hp_max = 0;
      jogador.mortes = (jogador.mortes || 0) + 1;
      logs.push(`\n💀 *VOCÊ MORREU!*\nUse /renascer ou aguarde um Curandeiro/Necromante.`);
      adicionarConquista(jogador_id, 'primeira_morte');
    }
  }

  jogador.cooldown_batalha = now;
  salvarJogador(jogador_id, jogador);

  return { logs, monstro_morreu, jogador_morreu: jogador.morto, ganhos, hp_atual: jogador.hp_max, hp_max: jogador.hp };
}

// ── BATALHA BOSS ───────────────────────────────────────────
function batalharBoss(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Você está morto!' };

  const regiao = REGIOES[jogador.regiao];
  if (!regiao) return { erro: '❌ Região inválida.' };

  const d20 = rolarD20();
  const resultado = getResultadoD20(d20);
  const { dano_base } = calcularDanoBase(jogador);
  const boss_dano = rand(regiao.boss_dano[0], regiao.boss_dano[1]);
  let dano_recebido = Math.max(1, boss_dano - calcularDefesa(jogador));
  let dano_causado = 0;

  if (resultado.tipo !== 'catastrofe' && resultado.tipo !== 'falha_grave') {
    dano_causado = Math.max(1, Math.floor(dano_base * resultado.mult));
    if (jogador.classe === 'cacador') dano_causado = Math.floor(dano_causado * 1.2);
  }

  const boss_hp_atual = rand(Math.floor(regiao.boss_hp * 0.5), regiao.boss_hp);
  const boss_morreu = dano_causado >= boss_hp_atual;
  const { dano_c, dano_r, extras } = aplicarPassivaClasse(jogador, dano_causado, dano_recebido, resultado, boss_morreu);

  jogador.hp_max -= dano_r;

  const logs = [
    `🎲 D20: *${d20}* — ${resultado.emoji} ${resultado.texto}`,
    `⚔️ Atacou *${regiao.boss}* — Dano: *${dano_c}*`,
    `🛡️ Boss atacou: *-${dano_r} HP*`,
    ...extras
  ];

  if (boss_morreu) {
    const xp = Math.floor(regiao.xp[1] * 3);
    const moedas = Math.floor(regiao.moedas[1] * 3);
    jogador.kills = (jogador.kills || 0) + 1;
    if (!jogador.boss_mortos) jogador.boss_mortos = [];
    if (!jogador.boss_mortos.includes(regiao.boss)) jogador.boss_mortos.push(regiao.boss);

    logs.push(`\n🏆 *${regiao.boss} DERROTADO!*`);
    logs.push(`📚 +${xp} XP | 💰 +${moedas} moedas`);
    logs.push(`🎁 Drop: *${regiao.drop}*`);
    if (!jogador.inventario) jogador.inventario = [];
    jogador.inventario.push(regiao.drop);

    adicionarXP(jogador_id, xp);
    adicionarMoedas(jogador_id, moedas);
    adicionarConquista(jogador_id, 'iniciado_boss');
    if (jogador.boss_mortos.length >= Object.keys(REGIOES).length) adicionarConquista(jogador_id, 'mestre_bosses');
    if (jogador.regiao === 'montanha_dragao') {
      adicionarConquista(jogador_id, 'matador_dragao');
      adicionarTitulo(jogador_id, 'matador_dragao');
    }
  }

  if (jogador.hp_max <= 0) {
    if (jogador.classe === 'serafim' && !jogador.ressurreicao_usada) {
      jogador.hp_max = jogador.hp;
      jogador.ressurreicao_usada = true;
      logs.push(`\n🕯️ *RESSURREIÇÃO DIVINA!* Serafim voltou!`);
    } else {
      jogador.morto = true;
      jogador.hp_max = 0;
      jogador.mortes = (jogador.mortes || 0) + 1;
      const perdeu = jogador.inventario?.length > 0 ? jogador.inventario.splice(rand(0, jogador.inventario.length - 1), 1)[0] : null;
      logs.push(`\n💀 *VOCÊ MORREU PARA O BOSS!*`);
      if (perdeu) logs.push(`📦 Perdeu: *${perdeu}*`);
      adicionarConquista(jogador_id, 'primeira_morte');
    }
  }

  salvarJogador(jogador_id, jogador);
  return { logs, boss_morreu, jogador_morreu: jogador.morto, hp_atual: jogador.hp_max };
}

// ── PVP ────────────────────────────────────────────────────
function pvp(atacante_id, defensor_id, matador_nome) {
  const atacante = getJogador(atacante_id);
  const defensor = getJogador(defensor_id);
  if (!atacante || !defensor) return { erro: '❌ Jogador não encontrado.' };
  if (atacante.morto || defensor.morto) return { erro: '❌ Um dos jogadores está morto.' };
  if (atacante_id === defensor_id) return { erro: '❌ Você não pode lutar contra si mesmo.' };

  const d20_at = rolarD20(), d20_def = rolarD20();
  const res_at = getResultadoD20(d20_at), res_def = getResultadoD20(d20_def);
  const { dano_base: dat } = calcularDanoBase(atacante);
  const { dano_base: ddef } = calcularDanoBase(defensor);

  let dano_at = Math.max(1, Math.floor(dat * res_at.mult) - calcularDefesa(defensor));
  let dano_def = Math.max(1, Math.floor(ddef * res_def.mult) - calcularDefesa(atacante));

  // Espectro ignora defesa
  if (atacante.classe === 'espectro') dano_at = Math.floor(dat * res_at.mult);
  if (defensor.classe === 'espectro') dano_def = Math.floor(ddef * res_def.mult);

  // Ninja esquiva
  if (defensor.classe === 'ninja' && Math.random() < 0.30) { dano_at = 0; }
  if (atacante.classe === 'ninja' && Math.random() < 0.30) { dano_def = 0; }

  // Sombra invisível
  if (atacante.invisivel) { dano_at = Math.floor(dano_at * 3); atacante.invisivel = false; }

  // Vampiro
  if (atacante.classe === 'vampiro') {
    const roubo = Math.floor(dano_at * 0.15);
    atacante.hp_max = Math.min(atacante.hp, atacante.hp_max + roubo);
  }

  defensor.hp_max -= dano_at;
  atacante.hp_max -= dano_def;

  const logs = [
    `⚔️ *PVP: ${atacante.nome} vs ${defensor.nome}*`,
    `\n${atacante.nome}: 🎲 D20=${d20_at} ${res_at.emoji} — Dano: *${dano_at}*`,
    `${defensor.nome}: 🎲 D20=${d20_def} ${res_def.emoji} — Dano: *${dano_def}*`
  ];

  let vencedor = null, perdedor = null;
  let enc_morreu = null;

  if (defensor.hp_max <= 0 && atacante.hp_max <= 0) {
    defensor.morto = true; defensor.hp_max = 0;
    atacante.morto = true; atacante.hp_max = 0;
    logs.push(`\n💀 *EMPATE FATAL! Ambos morreram!*`);
  } else if (defensor.hp_max <= 0) {
    // Serafim ressuscita
    if (defensor.classe === 'serafim' && !defensor.ressurreicao_usada) {
      defensor.hp_max = defensor.hp;
      defensor.ressurreicao_usada = true;
      logs.push(`\n🕯️ *RESSURREIÇÃO DIVINA!* ${defensor.nome} voltou!`);
    } else {
      defensor.morto = true; defensor.hp_max = 0;
      vencedor = atacante; perdedor = defensor;
      atacante.pvp_vitorias = (atacante.pvp_vitorias || 0) + 1;
      defensor.pvp_derrotas = (defensor.pvp_derrotas || 0) + 1;

      // Verificar se era encarnação
      if (isEncarnacao(defensor_id)) {
        enc_morreu = { enc_id: defensor_id, matador_id: atacante_id, matador_nome: atacante.nome };
      }
    }
  } else if (atacante.hp_max <= 0) {
    if (atacante.classe === 'serafim' && !atacante.ressurreicao_usada) {
      atacante.hp_max = atacante.hp;
      atacante.ressurreicao_usada = true;
      logs.push(`\n🕯️ *RESSURREIÇÃO DIVINA!* ${atacante.nome} voltou!`);
    } else {
      atacante.morto = true; atacante.hp_max = 0;
      vencedor = defensor; perdedor = atacante;
      defensor.pvp_vitorias = (defensor.pvp_vitorias || 0) + 1;
      atacante.pvp_derrotas = (atacante.pvp_derrotas || 0) + 1;

      if (isEncarnacao(atacante_id)) {
        enc_morreu = { enc_id: atacante_id, matador_id: defensor_id, matador_nome: defensor.nome };
      }
    }
  }

  if (vencedor && perdedor) {
    logs.push(`\n🏆 *${vencedor.nome} VENCEU!*`);
    logs.push(`💀 *${perdedor.nome} foi derrotado!*`);
    const moedas_roubadas = Math.floor((perdedor.moedas || 0) * 0.2);
    if (moedas_roubadas > 0) {
      vencedor.moedas = (vencedor.moedas || 0) + moedas_roubadas;
      perdedor.moedas = Math.max(0, (perdedor.moedas || 0) - moedas_roubadas);
      logs.push(`💰 ${vencedor.nome} roubou *${moedas_roubadas} moedas*!`);
    }
    if ((perdedor.pvp_derrotas || 0) >= 5) adicionarTitulo(perdedor.id, 'perdedor');
  }

  salvarJogador(atacante_id, atacante);
  salvarJogador(defensor_id, defensor);

  return { logs, vencedor: vencedor?.nome, perdedor: perdedor?.nome, enc_morreu };
}

// ── HABILIDADE ─────────────────────────────────────────────
function usarHabilidade(jogador_id, hab_key) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Você está morto!' };

  const classeData = CLASSES[jogador.classe];
  const hab = classeData?.habilidades[hab_key];
  if (!hab) return { erro: '❌ Habilidade não encontrada. Use /classe para ver suas habilidades.' };
  if ((jogador.mana || 0) < hab.custo) return { erro: `❌ Mana insuficiente! Você tem ${jogador.mana} mana.` };

  jogador.mana -= hab.custo;

  const d20 = rolarD20();
  const resultado = getResultadoD20(d20);
  const bonus = getBonusAtributo(jogador.xp);
  const for_t = jogador.for + bonus, int_t = jogador.int + bonus, des_t = jogador.des + bonus;

  let dano = 0;
  let efeito_txt = '';

  if (typeof hab.dano === 'function') dano = Math.floor(hab.dano(for_t, int_t, des_t) * resultado.mult);

  // Efeitos especiais de habilidades raras
  if (jogador.classe === 'sombra' && hab_key === 'fundir_sombras') {
    jogador.invisivel = true;
    efeito_txt = '🌑 Você se fundiu às sombras! Próximo ataque faz dano triplo!';
  } else if (jogador.classe === 'artificer' && hab_key === 'armadilha_mecanica') {
    jogador.armadilhas = (jogador.armadilhas || 0) + 1;
    efeito_txt = `⚙️ Armadilha colocada! (Total: ${jogador.armadilhas})`;
  } else if (hab.efeito) {
    const chance = hab.chance || 100;
    if (Math.random() * 100 < chance) efeito_txt = `✨ Efeito: *${hab.efeito}*!`;
  }

  salvarJogador(jogador_id, jogador);

  return {
    logs: [
      `🎲 D20: *${d20}* — ${resultado.emoji} ${resultado.texto}`,
      `✨ *${hab.nome}* usado!`,
      dano > 0 ? `💥 Dano: *${dano}*` : '',
      `💧 Mana restante: *${jogador.mana}*`,
      efeito_txt
    ].filter(Boolean)
  };
}

// ── ULTIMATE ───────────────────────────────────────────────
function usarUltimate(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Você está morto!' };

  const classeData = CLASSES[jogador.classe];
  const ult = classeData?.ultimate;
  if (!ult) return { erro: '❌ Ultimate não encontrado.' };
  if ((jogador.mana || 0) < ult.custo) return { erro: `❌ Mana insuficiente! Precisa de ${ult.custo} mana.` };

  const agora = Date.now();
  const ultimo = jogador.cooldown_ultimate?.[jogador.classe] || 0;
  const cd_ms = (ult.cooldown || 5) * 60000;
  if (agora - ultimo < cd_ms) {
    return { erro: `⏳ Ultimate em cooldown! Aguarde ${Math.ceil((cd_ms - (agora - ultimo)) / 60000)} min.` };
  }

  jogador.mana = 0;
  if (!jogador.cooldown_ultimate) jogador.cooldown_ultimate = {};
  jogador.cooldown_ultimate[jogador.classe] = agora;

  const d20 = rolarD20();
  const resultado = getResultadoD20(d20);
  const bonus = getBonusAtributo(jogador.xp);
  const for_t = jogador.for + bonus, int_t = jogador.int + bonus;

  let dano_total = 0;
  if (typeof ult.dano === 'function') {
    const hits = ult.hits || 1;
    for (let i = 0; i < hits; i++) dano_total += Math.floor(ult.dano(for_t, int_t) * resultado.mult);
  }

  // Portador do Caos — tudo aleatório
  if (jogador.classe === 'portador_caos') {
    dano_total = rand(0, 9999);
    if (Math.random() < 0.1) {
      jogador.morto = true;
      jogador.hp_max = 0;
    }
  }

  salvarJogador(jogador_id, jogador);

  return {
    logs: [
      `🎲 D20: *${d20}* — ${resultado.emoji} ${resultado.texto}`,
      `💫 *ULTIMATE: ${ult.nome}* ATIVADO!`,
      dano_total > 0 ? `💥 Dano TOTAL: *${dano_total}*` : '',
      `⚡ Efeito: *${ult.efeito}*`,
      `💧 Mana zerada.`,
      jogador.morto ? `\n💀 O caos te consumiu também!` : ''
    ].filter(Boolean)
  };
}

module.exports = { batalharMonstro, batalharBoss, pvp, usarHabilidade, usarUltimate, rolarD20, rand };
