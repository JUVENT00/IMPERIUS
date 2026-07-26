// ============================================================
// IMPERIUS RPG — DADOS DO JOGO (v3.0)
// ============================================================

// ── SISTEMA DE NÍVEIS (1-200) ─────────────────────────────
const NIVEIS = [];
for (let i = 1; i <= 200; i++) {
  let xp_necessario;
  if (i <= 10) xp_necessario = i * 100;
  else if (i <= 30) xp_necessario = i * 250;
  else if (i <= 60) xp_necessario = i * 500;
  else if (i <= 100) xp_necessario = i * 1000;
  else if (i <= 150) xp_necessario = i * 2000;
  else xp_necessario = i * 4000;
  NIVEIS.push({ nivel: i, xp: xp_necessario });
}

function calcularNivel(xp_total) {
  let nivel = 1;
  let xp_acumulado = 0;
  for (let i = 0; i < NIVEIS.length; i++) {
    if (xp_total >= xp_acumulado + NIVEIS[i].xp) {
      xp_acumulado += NIVEIS[i].xp;
      nivel = i + 2;
    } else {
      return {
        nivel: Math.min(nivel, 200),
        xp_atual: xp_total - xp_acumulado,
        xp_proximo: NIVEIS[i].xp,
        xp_acumulado
      };
    }
  }
  return { nivel: 200, xp_atual: 0, xp_proximo: 0, xp_acumulado };
}

// ── RANKS ─────────────────────────────────────────────────
const RANKS = [
  { nome: 'F',  xp_min: 0,     bonus: 0   },
  { nome: 'E',  xp_min: 500,   bonus: 5   },
  { nome: 'D',  xp_min: 1500,  bonus: 10  },
  { nome: 'C',  xp_min: 3500,  bonus: 18  },
  { nome: 'B',  xp_min: 7000,  bonus: 28  },
  { nome: 'A',  xp_min: 13000, bonus: 40  },
  { nome: 'S',  xp_min: 22000, bonus: 55  },
  { nome: 'SS', xp_min: 35000, bonus: 75  },
  { nome: 'SSS',xp_min: 55000, bonus: 100 },
  { nome: '✦LENDÁRIO✦', xp_min: 100000, bonus: 150 },
  { nome: '☠️ IMPERADOR', xp_min: 999999, bonus: 250 }
];

// ── CLASSES NORMAIS (20) ──────────────────────────────────
const CLASSES = {
  guerreiro: {
    nome: '⚔️ Guerreiro', hp: 130, mana: 50,
    for: 15, des: 8, con: 14, int: 6,
    passiva: 'Reduz 15% do dano recebido',
    habilidades: {
      golpe_brutal: { nome: 'Golpe Brutal', custo: 15, dano: (f) => f * 2.5, efeito: 'atordoado', chance: 30 },
      grito_guerra: { nome: 'Grito de Guerra', custo: 20, dano: 0, efeito: 'buff_ataque_aliados', valor: 25 },
      investida: { nome: 'Investida', custo: 25, dano: (f) => f * 2.0, efeito: 'ignora_defesa', valor: 50 }
    },
    ultimate: { nome: '🔥 Fúria do Titã', custo: 50, hits: 5, dano: (f) => f * 1.8, efeito: 'sangramento', chance: 20, cooldown: 5 }
  },
  mago: {
    nome: '🔮 Mago', hp: 65, mana: 160,
    for: 5, des: 9, con: 6, int: 18,
    passiva: 'Magias custam 10% menos mana',
    habilidades: {
      bola_fogo: { nome: 'Bola de Fogo', custo: 20, dano: (i) => i * 2.8, efeito: 'queimando', chance: 40 },
      relampago: { nome: 'Relâmpago', custo: 25, dano: (i) => i * 3.0, efeito: 'paralisado', chance: 35 },
      escudo_arcano: { nome: 'Escudo Arcano', custo: 30, dano: 0, efeito: 'escudo', valor: (i) => i * 5 }
    },
    ultimate: { nome: '💥 Apocalipse Arcano', custo: 80, dano: (i) => i * 6.0, efeito: 'area', cooldown: 6 }
  },
  assassino: {
    nome: '🗡️ Assassino', hp: 80, mana: 90,
    for: 11, des: 16, con: 8, int: 8,
    passiva: 'Primeiro ataque sempre crítico',
    habilidades: {
      golpe_furtivo: { nome: 'Golpe Furtivo', custo: 20, dano: (f) => f * 3.5, efeito: 'sangramento', chance: 100 },
      veneno: { nome: 'Veneno', custo: 15, dano: (f) => f * 1.0, efeito: 'envenenado', chance: 100, duracao: 5 },
      desaparecer: { nome: 'Desaparecer', custo: 25, dano: 0, efeito: 'invisivel', duracao: 2 }
    },
    ultimate: { nome: '☠️ Execução Sombria', custo: 60, dano: (f) => f * 4.0, efeito: 'execucao', cooldown: 7 }
  },
  cacador: {
    nome: '🏹 Caçador', hp: 90, mana: 75,
    for: 10, des: 14, con: 10, int: 9,
    passiva: '+20% dano contra bosses',
    habilidades: {
      flecha_certeira: { nome: 'Flecha Certeira', custo: 15, dano: (f, d) => f * 2.2 + d * 0.5, efeito: 'ignora_esquiva' },
      armadilha: { nome: 'Armadilha', custo: 20, dano: (f) => f * 1.5, efeito: 'paralisado', chance: 100, duracao: 2 },
      olho_aguia: { nome: 'Olho de Águia', custo: 10, dano: 0, efeito: 'buff_dano', valor: 40, duracao: 3 }
    },
    ultimate: { nome: '🌧️ Chuva de Flechas', custo: 55, hits: 3, dano: (f) => f * 1.5, efeito: 'area', cooldown: 5 }
  },
  curandeiro: {
    nome: '💚 Curandeiro', hp: 75, mana: 140,
    for: 6, des: 9, con: 8, int: 16,
    passiva: 'Regenera 5 HP por turno',
    habilidades: {
      curar: { nome: 'Curar', custo: 25, cura: (i) => i * 3.0, efeito: 'cura' },
      purificar: { nome: 'Purificar', custo: 30, dano: 0, efeito: 'remove_status' },
      escudo_luz: { nome: 'Escudo de Luz', custo: 35, dano: 0, efeito: 'escudo', valor: (i) => i * 6 }
    },
    ultimate: { nome: '✨ Milagre', custo: 100, efeito: 'reviver_aliado', cooldown: 10 }
  },
  bardo: {
    nome: '🎵 Bardo', hp: 85, mana: 110,
    for: 8, des: 11, con: 9, int: 13,
    passiva: 'Aliados próximos ganham +10% ataque',
    habilidades: {
      cancao_guerra: { nome: 'Canção de Guerra', custo: 20, dano: 0, efeito: 'buff_grupo', valor: 30 },
      maldicao_sonora: { nome: 'Maldição Sonora', custo: 25, dano: (i) => i * 1.5, efeito: 'confuso', chance: 100 },
      encantamento: { nome: 'Encantamento', custo: 30, dano: 0, efeito: 'pular_turno' }
    },
    ultimate: { nome: '🎼 Sinfonia do Fim', custo: 70, efeito: 'paralisar_todos', duracao: 3, cooldown: 8 }
  },
  necromante: {
    nome: '💀 Necromante', hp: 70, mana: 150,
    for: 6, des: 8, con: 6, int: 17,
    passiva: 'Ganha força quando aliado morre',
    habilidades: {
      invocar_morto: { nome: 'Invocar Morto-Vivo', custo: 35, dano: 0, efeito: 'invocar', tipo: 'zumbi' },
      drenar_vida: { nome: 'Drenar Vida', custo: 20, dano: (i) => i * 2.5, efeito: 'drenar', pct: 50 },
      maldicao: { nome: 'Maldição', custo: 25, dano: 0, efeito: 'amaldicao', chance: 100 }
    },
    ultimate: { nome: '⚰️ Exército dos Mortos', custo: 90, efeito: 'invocar_3', cooldown: 8 }
  },
  paladino: {
    nome: '🛡️ Paladino', hp: 140, mana: 95,
    for: 13, des: 8, con: 16, int: 10,
    passiva: 'Imune a maldições e venenos',
    habilidades: {
      golpe_sagrado: { nome: 'Golpe Sagrado', custo: 20, dano: (f, i) => f * 2.0 + i * 1.0, efeito: 'sagrado' },
      protecao_divina: { nome: 'Proteção Divina', custo: 30, dano: 0, efeito: 'escudo_aliado', valor: (c) => c * 8 },
      expurgar: { nome: 'Expurgar', custo: 25, dano: (i) => i * 2.5, efeito: 'remover_debuffs_area' }
    },
    ultimate: { nome: '⚡ Julgamento Celestial', custo: 80, dano: (f, i) => (f + i) * 4.0, efeito: 'cegar_todos', cooldown: 7 }
  },
  arqueiro: {
    nome: '🎯 Arqueiro', hp: 85, mana: 70,
    for: 10, des: 15, con: 9, int: 9,
    passiva: 'Ataques à distância têm +25% crítico',
    habilidades: {
      tiro_perfurante: { nome: 'Tiro Perfurante', custo: 20, dano: (f, d) => f * 2.8 + d * 0.8, efeito: 'ignora_defesa_total' },
      flecha_gelo: { nome: 'Flecha de Gelo', custo: 25, dano: (f) => f * 2.0, efeito: 'congelado', chance: 100 },
      marcar_alvo: { nome: 'Marcar Alvo', custo: 10, dano: 0, efeito: 'marcar', valor: 40, duracao: 3 }
    },
    ultimate: { nome: '🏹 Tiro Dimensional', custo: 65, dano: (f) => f * 5.0, efeito: 'perfurar_tudo', cooldown: 6 }
  },
  monge: {
    nome: '👊 Monge', hp: 105, mana: 95,
    for: 12, des: 14, con: 11, int: 10,
    passiva: 'Esquiva +20% quando sem armadura',
    habilidades: {
      soco_dragao: { nome: 'Soco do Dragão', custo: 15, dano: (f, d) => f * 2.5 + d * 1.0, efeito: 'atordoado', chance: 40 },
      meditacao: { nome: 'Meditação', custo: 0, dano: 0, efeito: 'recuperar', hp_pct: 10, mana_pct: 20 },
      fluxo_ki: { nome: 'Fluxo do Ki', custo: 20, dano: 0, efeito: 'acelerado', duracao: 2 }
    },
    ultimate: { nome: '💥 Cem Golpes', custo: 60, hits: 10, dano: (f) => f * 0.8, efeito: 'atordoado', chance: 15, cooldown: 6 }
  },
  espadachim: {
    nome: '🔰 Espadachim', hp: 95, mana: 80,
    for: 12, des: 15, con: 10, int: 9,
    passiva: 'Ataca duas vezes por turno',
    habilidades: {
      corte_veloz: { nome: 'Corte Veloz', custo: 15, dano: (f) => f * 2.0, hits: 2, efeito: 'ignora_defesa_parcial' },
      redemoinho: { nome: 'Redemoinho', custo: 25, dano: (f) => f * 1.8, efeito: 'area_sangramento', chance: 30 },
      parar_lamina: { nome: 'Parar Lâmina', custo: 20, dano: 0, efeito: 'contra_ataque', valor: (f) => f * 3.0 }
    },
    ultimate: { nome: '⚡ Dança das Mil Lâminas', custo: 70, hits: 8, dano: (f) => f * 1.2, efeito: 'indefensavel', cooldown: 7 }
  },
  invocador: {
    nome: '🌀 Invocador', hp: 70, mana: 155,
    for: 5, des: 9, con: 6, int: 18,
    passiva: 'Criaturas invocadas têm +15% HP',
    habilidades: {
      invocar_elemental: { nome: 'Invocar Elemental', custo: 40, dano: 0, efeito: 'invocar_elemental' },
      portal: { nome: 'Portal', custo: 30, dano: 0, efeito: 'portal' },
      vinculo_arcano: { nome: 'Vínculo Arcano', custo: 25, dano: 0, efeito: 'vinculo', pct: 30 }
    },
    ultimate: { nome: '🌑 Chamado do Abismo', custo: 100, efeito: 'invocar_lendario', duracao: 5, cooldown: 10 }
  },
  alquimista: {
    nome: '⚗️ Alquimista', hp: 80, mana: 115,
    for: 8, des: 11, con: 9, int: 14,
    passiva: 'Poções têm efeito duplo',
    habilidades: {
      bomba_acida: { nome: 'Bomba Ácida', custo: 20, dano: (i) => i * 2.5, efeito: 'reduzir_defesa', valor: 40, duracao: 3 },
      pocao_furia: { nome: 'Poção de Fúria', custo: 25, dano: 0, efeito: 'furia_aliado', duracao: 3 },
      transmutacao: { nome: 'Transmutação', custo: 35, dano: 0, efeito: 'transmutacao' }
    },
    ultimate: { nome: '🌟 Grande Obra', custo: 80, efeito: 'criar_lendario', cooldown: 10 }
  },
  berserker: {
    nome: '😡 Berserker', hp: 150, mana: 30,
    for: 18, des: 7, con: 13, int: 4,
    passiva: 'Abaixo de 30% HP ganha +50% dano',
    habilidades: {
      furia_cega: { nome: 'Fúria Cega', custo: 10, dano: (f) => f * 3.0, efeito: 'auto_dano', pct: 15 },
      rugido: { nome: 'Rugido', custo: 15, dano: 0, efeito: 'assustar', valor: 30, duracao: 2 },
      golpe_devastador: { nome: 'Golpe Devastador', custo: 25, dano: (f) => f * 4.0, efeito: 'destruir_escudo' }
    },
    ultimate: { nome: '🔥 Modo Berserk', custo: 30, efeito: 'berserk', duracao: 3, cooldown: 6 }
  },
  samurai: {
    nome: '🈵 Samurai', hp: 115, mana: 75,
    for: 14, des: 12, con: 13, int: 8,
    passiva: 'Contraataque automático se bloqueado',
    habilidades: {
      corte_horizonte: { nome: 'Corte do Horizonte', custo: 20, dano: (f) => f * 3.0, efeito: 'cortar_defesa' },
      meditacao_guerreiro: { nome: 'Meditação do Guerreiro', custo: 0, dano: 0, efeito: 'proximo_critico' },
      bainha_sagrada: { nome: 'Bainha Sagrada', custo: 25, dano: 0, efeito: 'imune_turno_contra' }
    },
    ultimate: { nome: '⚔️ Iaijutsu Final', custo: 65, dano: (f) => f * 7.0, efeito: 'morte_instantanea_chance', cooldown: 8 }
  },
  ninja: {
    nome: '🥷 Ninja', hp: 80, mana: 90,
    for: 10, des: 17, con: 8, int: 10,
    passiva: '30% chance de esquivar qualquer ataque',
    habilidades: {
      shuriken: { nome: 'Shuriken Explosiva', custo: 15, dano: (d, f) => d * 2.0 + f * 1.0, efeito: 'queimando', chance: 35 },
      fumaca: { nome: 'Fumaça', custo: 20, dano: 0, efeito: 'cegar_todos', duracao: 2 },
      clone: { nome: 'Clone de Sombra', custo: 30, dano: 0, efeito: 'clone' }
    },
    ultimate: { nome: '🌑 Tempestade de Sombras', custo: 70, hits: 8, dano: (d) => d * 1.5, efeito: 'cego', chance: 50, cooldown: 7 }
  },
  druida: {
    nome: '🌿 Druida', hp: 95, mana: 130,
    for: 9, des: 11, con: 11, int: 14,
    passiva: 'Regenera 10 HP por turno em regiões naturais',
    habilidades: {
      forma_animal: { nome: 'Forma Animal', custo: 35, dano: (f) => f * 2.5, efeito: 'transformar', bonus_hp: 30 },
      raiz_presa: { nome: 'Raiz Presa', custo: 20, dano: (f) => f * 1.5, efeito: 'paralisado_sangramento', duracao: 2 },
      cura_terra: { nome: 'Cura da Terra', custo: 30, cura_turno: (i) => i * 2.5, duracao: 3, efeito: 'hot' }
    },
    ultimate: { nome: '🌪️ Ira da Natureza', custo: 85, dano: (i) => i * 5.0, efeito: 'tempestade_area', cooldown: 8 }
  },
  cacador_demonios: {
    nome: '😈 Caçador de Demônios', hp: 110, mana: 100,
    for: 13, des: 12, con: 12, int: 11,
    passiva: '+40% dano contra criaturas das trevas',
    habilidades: {
      lamina_demoniaca: { nome: 'Lâmina Demoníaca', custo: 20, dano: (f) => f * 2.5, efeito: 'anti_trevas' },
      absorver_trevas: { nome: 'Absorver Trevas', custo: 0, dano: 0, efeito: 'absorver_magia' },
      selamento: { nome: 'Selamento', custo: 35, dano: (i) => i * 2.0, efeito: 'selar_ultimate', duracao: 4 }
    },
    ultimate: { nome: '💀 Forma Demoníaca', custo: 75, dano: (f, i) => (f + i) * 3.5, efeito: 'demonio', cooldown: 7 }
  },
  vidente: {
    nome: '👁️ Vidente', hp: 75, mana: 130,
    for: 7, des: 13, con: 7, int: 16,
    passiva: 'Vê as fraquezas do inimigo antes de atacar',
    habilidades: {
      olho_verdade: { nome: 'Olho da Verdade', custo: 15, dano: 0, efeito: 'revelar_fraqueza', bonus: 40 },
      reescrever: { nome: 'Reescrever', custo: 40, dano: 0, efeito: 'reverter_ataque' },
      visao_futura: { nome: 'Visão Futura', custo: 25, dano: 0, efeito: 'esquiva_garantida', duracao: 2 }
    },
    ultimate: { nome: '🌀 Reescrever o Destino', custo: 90, efeito: 'anular_morte', cooldown: 10 }
  },
  bombardeiro: {
    nome: '💣 Bombardeiro', hp: 100, mana: 85,
    for: 13, des: 9, con: 11, int: 12,
    passiva: 'Explosões em área acertam todos os inimigos',
    habilidades: {
      bomba_cluster: { nome: 'Bomba Cluster', custo: 25, dano: (f) => f * 2.2, efeito: 'area', hits: 3 },
      mina: { nome: 'Lançar Mina', custo: 20, dano: (f) => f * 3.0, efeito: 'armadilha_explosiva' },
      barril_explosivo: { nome: 'Barril Explosivo', custo: 30, dano: (f) => f * 2.8, efeito: 'queimando_area', chance: 60 }
    },
    ultimate: { nome: '💥 Apocalipse de Pólvora', custo: 80, hits: 6, dano: (f) => f * 2.0, efeito: 'destruicao_total', cooldown: 8 }
  },

  // ── CLASSES RARAS DA ROLETA ───────────────────────────────
  vampiro: {
    nome: '🩸 Vampiro', hp: 100, mana: 120,
    for: 13, des: 14, con: 10, int: 13,
    passiva: 'Cada ataque rouba 15% do HP causado',
    poder_especial: '🩸 ROUBO VITAL',
    habilidades: {
      mordida: { nome: 'Mordida das Trevas', custo: 20, dano: (f) => f * 2.8, efeito: 'drenar_hp', pct: 50 },
      nuvem_morcegos: { nome: 'Nuvem de Morcegos', custo: 25, dano: (f) => f * 1.5, efeito: 'cegar', duracao: 2 },
      forma_morcego: { nome: 'Forma de Morcego', custo: 30, dano: 0, efeito: 'invisivel_voo', duracao: 2 }
    },
    ultimate: { nome: '🌑 Senhor da Noite', custo: 80, dano: (f, i) => (f + i) * 4.5, efeito: 'drenar_total', cooldown: 8 }
  },
  sombra: {
    nome: '🌑 Sombra', hp: 85, mana: 110,
    for: 12, des: 18, con: 8, int: 12,
    passiva: 'Ataques vindos da invisibilidade causam dano triplo',
    poder_especial: '🌑 INVISIBILIDADE TOTAL',
    habilidades: {
      golpe_sombrio: { nome: 'Golpe das Sombras', custo: 20, dano: (f) => f * 3.2, efeito: 'sangramento', chance: 100 },
      fundir_sombras: { nome: 'Fundir-se às Sombras', custo: 15, dano: 0, efeito: 'invisivel_total', duracao: 1 },
      passo_sombrio: { nome: 'Passo Sombrio', custo: 25, dano: (f) => f * 2.5, efeito: 'teleporte_ataque' }
    },
    ultimate: { nome: '🕳️ Vazio das Sombras', custo: 75, dano: (f) => f * 6.0, efeito: 'apagar_existencia', cooldown: 8 }
  },
  trovejante: {
    nome: '⚡ Trovejante', hp: 90, mana: 140,
    for: 10, des: 15, con: 9, int: 16,
    passiva: 'Ataques têm 30% de chance de saltar para outro alvo',
    poder_especial: '⚡ CADEIA DE RAIOS',
    habilidades: {
      raio: { nome: 'Raio Direto', custo: 20, dano: (i) => i * 3.0, efeito: 'paralisado', chance: 40 },
      tempestade: { nome: 'Tempestade Local', custo: 30, dano: (i) => i * 2.0, efeito: 'area_raio', hits: 3 },
      sobrecarga: { nome: 'Sobrecarga', custo: 25, dano: 0, efeito: 'buff_raio', valor: 60, duracao: 2 }
    },
    ultimate: { nome: '⛈️ Juízo Elétrico', custo: 85, hits: 5, dano: (i) => i * 2.5, efeito: 'cadeia_raios', cooldown: 8 }
  },
  dragomante: {
    nome: '🐉 Dragomante', hp: 120, mana: 130,
    for: 14, des: 10, con: 13, int: 15,
    passiva: 'Possui um dragão como pet permanente',
    poder_especial: '🐉 DRAGÃO PERMANENTE',
    habilidades: {
      sopro_dragao: { nome: 'Sopro do Dragão', custo: 30, dano: (f, i) => (f + i) * 2.5, efeito: 'queimando_area', chance: 70 },
      escama_dura: { nome: 'Escama Endurecida', custo: 20, dano: 0, efeito: 'defesa_dragao', valor: 50, duracao: 3 },
      chamado_dragao: { nome: 'Chamado do Dragão', custo: 35, dano: (f) => f * 3.5, efeito: 'ataque_dragao' }
    },
    ultimate: { nome: '🔥 Fúria do Ancião', custo: 90, hits: 4, dano: (f, i) => (f + i) * 3.0, efeito: 'dragao_berserk', cooldown: 9 }
  },
  espectro: {
    nome: '👻 Espectro', hp: 75, mana: 145,
    for: 9, des: 16, con: 6, int: 17,
    passiva: 'Ataques ignoram 50% da defesa inimiga',
    poder_especial: '👻 ATRAVESSAR DEFESA',
    habilidades: {
      toque_espectral: { nome: 'Toque Espectral', custo: 20, dano: (i) => i * 3.0, efeito: 'ignora_defesa_total' },
      possessao: { nome: 'Possessão', custo: 35, dano: 0, efeito: 'possuir', duracao: 2 },
      grito_alma: { nome: 'Grito da Alma', custo: 25, dano: (i) => i * 2.0, efeito: 'terror', chance: 80 }
    },
    ultimate: { nome: '💀 Forma Etérea Total', custo: 80, dano: (i) => i * 7.0, efeito: 'intangivel_ataque', cooldown: 9 }
  },
  mare: {
    nome: '🌊 Maré', hp: 95, mana: 150,
    for: 8, des: 12, con: 10, int: 17,
    passiva: 'Ataques aquáticos têm +35% de dano',
    poder_especial: '🌊 CONGELAR TOTAL',
    habilidades: {
      onda_gelada: { nome: 'Onda Gelada', custo: 25, dano: (i) => i * 2.8, efeito: 'congelado_total', chance: 100 },
      correnteza: { nome: 'Correnteza', custo: 20, dano: (i) => i * 2.0, efeito: 'arrastar', duracao: 2 },
      tsunami: { nome: 'Tsunami', custo: 35, dano: (i) => i * 3.0, efeito: 'area_aqua', hits: 2 }
    },
    ultimate: { nome: '🌊 Dilúvio Eterno', custo: 90, dano: (i) => i * 5.5, efeito: 'afogar_todos', cooldown: 9 }
  },
  meteoromante: {
    nome: '☄️ Meteoromante', hp: 80, mana: 160,
    for: 6, des: 10, con: 7, int: 19,
    passiva: 'Ataques em área atingem todos os inimigos',
    poder_especial: '☄️ METEORO TOTAL',
    habilidades: {
      meteorito: { nome: 'Meteorito', custo: 30, dano: (i) => i * 3.5, efeito: 'area_fogo', hits: 2 },
      chuva_meteoros: { nome: 'Chuva de Meteoros', custo: 40, dano: (i) => i * 2.5, efeito: 'area_massiva', hits: 5 },
      gravitacao: { nome: 'Gravitação', custo: 25, dano: (i) => i * 2.0, efeito: 'prender', duracao: 2 }
    },
    ultimate: { nome: '☄️ Extinção', custo: 100, hits: 8, dano: (i) => i * 3.0, efeito: 'destruicao_area_total', cooldown: 10 }
  },
  serafim: {
    nome: '🕯️ Serafim', hp: 110, mana: 155,
    for: 9, des: 11, con: 12, int: 18,
    passiva: 'Volta da morte 1 vez automaticamente com HP cheio',
    poder_especial: '🕯️ RESSURREIÇÃO DIVINA',
    habilidades: {
      luz_sagrada: { nome: 'Luz Sagrada', custo: 25, dano: (f, i) => (f + i) * 2.5, efeito: 'sagrado_purificar' },
      asas_divinas: { nome: 'Asas Divinas', custo: 20, dano: 0, efeito: 'voo_escudo', duracao: 2 },
      bencao_serafim: { nome: 'Bênção do Serafim', custo: 35, dano: 0, efeito: 'curar_aliados_area', valor: 60 }
    },
    ultimate: { nome: '✨ Julgamento Final', custo: 95, dano: (f, i) => (f + i) * 5.0, efeito: 'purificar_destruir', cooldown: 9 }
  },
  heroi_caido: {
    nome: '🔥 Herói Caído', hp: 130, mana: 100,
    for: 16, des: 12, con: 14, int: 12,
    passiva: 'Absorve habilidades dos inimigos que mata',
    poder_especial: '🔥 ABSORÇÃO DE PODER',
    habilidades: {
      queda_heroi: { nome: 'Queda do Herói', custo: 25, dano: (f) => f * 3.0, efeito: 'esmagamento' },
      corrupcao: { nome: 'Corrupção', custo: 20, dano: (f, i) => (f + i) * 2.0, efeito: 'corrompido', duracao: 3 },
      poder_absorvido: { nome: 'Poder Absorvido', custo: 30, dano: (f) => f * 3.5, efeito: 'usar_absorvido' }
    },
    ultimate: { nome: '💔 Redenção Impossível', custo: 85, dano: (f, i) => (f + i) * 4.5, efeito: 'destruicao_total', cooldown: 8 }
  },
  artificer: {
    nome: '⚙️ Artificer', hp: 95, mana: 110,
    for: 11, des: 13, con: 10, int: 15,
    passiva: 'Armadilhas causam dano passivo automático',
    poder_especial: '⚙️ ARMADILHAS AUTOMÁTICAS',
    habilidades: {
      armadilha_mecanica: { nome: 'Armadilha Mecânica', custo: 20, dano: (f) => f * 2.5, efeito: 'armadilha_auto' },
      torrela: { nome: 'Torreta Automática', custo: 35, dano: (f) => f * 1.5, efeito: 'torrela', hits: 3, duracao: 3 },
      bomba_fumaca: { nome: 'Bomba de Fumaça', custo: 15, dano: 0, efeito: 'cegar_confundir', duracao: 2 }
    },
    ultimate: { nome: '⚙️ Protocolo Exterminação', custo: 90, hits: 10, dano: (f) => f * 1.8, efeito: 'maquinas_guerra', cooldown: 9 }
  },
  portador_caos: {
    nome: '☠️ Portador do Caos', hp: 100, mana: 100,
    for: 12, des: 12, con: 10, int: 12,
    passiva: 'Todos os atributos variam aleatoriamente a cada batalha',
    poder_especial: '☠️ CAOS ABSOLUTO',
    habilidades: {
      toque_caos: { nome: 'Toque do Caos', custo: 20, dano: (f) => f * Math.random() * 5, efeito: 'aleatorio_total' },
      ruptura: { nome: 'Ruptura', custo: 25, dano: (f, i) => (f + i) * Math.random() * 4, efeito: 'colapso_realidade' },
      paradoxo: { nome: 'Paradoxo', custo: 30, dano: 0, efeito: 'paradoxo_total' }
    },
    ultimate: { nome: '🌀 Fim de Tudo', custo: 50, dano: (f, i) => (f + i) * Math.random() * 10, efeito: 'destruicao_ou_cura', cooldown: 5 }
  }
};

const CLASSES_NORMAIS = [
  'guerreiro','mago','assassino','cacador','curandeiro',
  'bardo','necromante','paladino','arqueiro','monge',
  'espadachim','invocador','alquimista','berserker','samurai',
  'ninja','druida','cacador_demonios','vidente','bombardeiro'
];

const CLASSES_RARAS = [
  'vampiro','sombra','trovejante','dragomante','espectro',
  'mare','meteoromante','serafim','heroi_caido','artificer','portador_caos'
];

// ── REGIÕES COM 3 BOSSES CADA ─────────────────────────────
const REGIOES = {
  ceu_solvaryn: {
    nome: "☁️ Céu Flutuante de Solvaryn", nivel_min: 80, nivel_max: 120,
    descricao: "Ilhas flutuantes no céu. Apenas os mais fortes chegam aqui.",
    monstros: [
      { nome: "Anjo Caído", hp: [800,1200], dano: [160,300], xp: [400,680], moedas: [200,400] },
      { nome: "Serafim Corrompido", hp: [900,1350], dano: [180,338], xp: [450,765], moedas: [225,450] },
      { nome: "Guardião Celestial", hp: [1000,1500], dano: [200,375], xp: [500,850], moedas: [250,500] },
      { nome: "Tempestade Viva", hp: [750,1125], dano: [150,281], xp: [375,637], moedas: [188,375] },
      { nome: "Ser do Éter", hp: [850,1275], dano: [170,319], xp: [425,722], moedas: [213,425] },
      { nome: "Titã Voador", hp: [1100,1650], dano: [220,413], xp: [550,935], moedas: [275,550] },
      { nome: "Harpia Real", hp: [700,1050], dano: [140,262], xp: [350,595], moedas: [175,350] },
      { nome: "Elemental das Nuvens", hp: [950,1425], dano: [190,356], xp: [475,807], moedas: [238,475] },
      { nome: "Serpente Celeste", hp: [1050,1575], dano: [210,394], xp: [525,892], moedas: [263,525] },
      { nome: "Fênix Ancestral", hp: [1200,1800], dano: [240,450], xp: [600,1020], moedas: [300,600] },
      { nome: "Guardiã da Lua Cheia", hp: [880,1320], dano: [176,330], xp: [440,748], moedas: [220,440] },
      { nome: "Espírito do Vento Eterno", hp: [820,1230], dano: [164,308], xp: [410,697], moedas: [205,410] },
      { nome: "Tempestade Voador", hp: [633,1582], dano: [114,443], xp: [285,1028], moedas: [139,601] },
      { nome: "Espírito Caído", hp: [644,1611], dano: [116,451], xp: [290,1047], moedas: [142,612] },
      { nome: "Elemental Celeste", hp: [656,1639], dano: [118,459], xp: [295,1065], moedas: [144,623] },
      { nome: "Ser Viva", hp: [656,1639], dano: [118,459], xp: [295,1065], moedas: [144,623] },
      { nome: "Titã Caído", hp: [667,1668], dano: [120,467], xp: [300,1084], moedas: [147,634] },
      { nome: "Espírito Celeste", hp: [679,1697], dano: [122,475], xp: [306,1103], moedas: [149,645] },
      { nome: "Titã do Éter", hp: [690,1726], dano: [124,483], xp: [310,1122], moedas: [152,656] },
      { nome: "Fênix das Nuvens", hp: [702,1755], dano: [126,491], xp: [316,1141], moedas: [154,667] },
      { nome: "Serpente do Vento Eterno", hp: [714,1785], dano: [129,500], xp: [321,1160], moedas: [157,678] },
      { nome: "Titã Real", hp: [714,1785], dano: [129,500], xp: [321,1160], moedas: [157,678] },
      { nome: "Titã das Nuvens", hp: [726,1814], dano: [131,508], xp: [327,1179], moedas: [160,689] },
      { nome: "Tempestade Real", hp: [738,1844], dano: [133,516], xp: [332,1199], moedas: [162,701] },
      { nome: "Guardiã Celeste", hp: [749,1874], dano: [135,525], xp: [337,1218], moedas: [165,712] },
      { nome: "Guardião Real", hp: [761,1904], dano: [137,533], xp: [342,1238], moedas: [167,724] },
      { nome: "Espírito do Éter", hp: [761,1904], dano: [137,533], xp: [342,1238], moedas: [167,724] },
      { nome: "Harpia Caído", hp: [773,1934], dano: [139,542], xp: [348,1257], moedas: [170,735] },
      { nome: "Elemental Celestial", hp: [786,1964], dano: [141,550], xp: [354,1277], moedas: [173,746] },
      { nome: "Tempestade Celestial", hp: [798,1994], dano: [144,558], xp: [359,1296], moedas: [176,758] },
      { nome: "Guardiã das Nuvens", hp: [810,2025], dano: [146,567], xp: [364,1316], moedas: [178,770] },
      { nome: "Anjo Corrompido", hp: [822,2055], dano: [148,575], xp: [370,1336], moedas: [181,781] },
      { nome: "Harpia Celestial", hp: [822,2055], dano: [148,575], xp: [370,1336], moedas: [181,781] },
      { nome: "Serpente Caído", hp: [834,2086], dano: [150,584], xp: [375,1356], moedas: [183,793] },
      { nome: "Guardião Celeste", hp: [847,2117], dano: [152,593], xp: [381,1376], moedas: [186,804] },
      { nome: "Guardiã Caído", hp: [859,2148], dano: [155,601], xp: [387,1396], moedas: [189,816] },
      { nome: "Espírito Corrompido", hp: [872,2179], dano: [157,610], xp: [392,1416], moedas: [192,828] },
      { nome: "Serpente Real", hp: [872,2179], dano: [157,610], xp: [392,1416], moedas: [192,828] },
      { nome: "Fênix do Vento Eterno", hp: [884,2211], dano: [159,619], xp: [398,1437], moedas: [194,840] },
      { nome: "Serafim Real", hp: [897,2242], dano: [161,628], xp: [404,1457], moedas: [197,852] },
      { nome: "Guardiã Corrompido", hp: [910,2274], dano: [164,637], xp: [410,1478], moedas: [200,864] },
      { nome: "Serpente da Lua Cheia", hp: [922,2306], dano: [166,646], xp: [415,1499], moedas: [203,876] },
      { nome: "Ser Celeste", hp: [922,2306], dano: [166,646], xp: [415,1499], moedas: [203,876] },
      { nome: "Guardiã Real", hp: [935,2338], dano: [168,655], xp: [421,1520], moedas: [206,888] },
      { nome: "Harpia Ancestral", hp: [948,2370], dano: [171,664], xp: [427,1540], moedas: [209,901] },
      { nome: "Serafim do Éter", hp: [961,2402], dano: [173,673], xp: [432,1561], moedas: [211,913] },
      { nome: "Titã Corrompido", hp: [974,2434], dano: [175,682], xp: [438,1582], moedas: [214,925] },
      { nome: "Titã do Vento Eterno", hp: [987,2466], dano: [178,690], xp: [444,1603], moedas: [217,937] },
      { nome: "Titã Viva", hp: [987,2466], dano: [178,690], xp: [444,1603], moedas: [217,937] },
      { nome: "Fênix Celestial", hp: [1000,2499], dano: [180,700], xp: [450,1624], moedas: [220,950] }
    ],
    bosses: [
      {
        nome: "⚡ Tempestade Eterna",
        hp: 40000, dano: [500,800], xp: 18000, moedas: [7000,12000],
        drop: "Essência da Tempestade",
        fases: [
          { nome: "Fase 1 — Nublando", hp_pct: 100, dano_mult: 1, msg: "Nuvens negras cobrem o céu." },
          { nome: "Fase 2 — Relâmpagos", hp_pct: 55, dano_mult: 1.9, msg: "⚡ Raios caem em área!" },
          { nome: "Fase 3 — Furacão", hp_pct: 20, dano_mult: 2.7, msg: "🌪️ Um furacão letal se forma!" }
        ]
      },
      {
        nome: "👼 Arcanjo Corrompido",
        hp: 60000, dano: [700,1100], xp: 25000, moedas: [10000,17000],
        drop: "Asa do Arcanjo",
        fases: [
          { nome: "Fase 1 — Santo", hp_pct: 100, dano_mult: 1, msg: "O Arcanjo ainda tem resquícios de santidade." },
          { nome: "Fase 2 — Corrompido", hp_pct: 60, dano_mult: 1.8, msg: "⚠️ A corrupção toma conta!" },
          { nome: "Fase 3 — Demoníaco", hp_pct: 25, dano_mult: 2.6, msg: "😈 O Arcanjo se torna demônio!" }
        ]
      },
      {
        nome: "☀️ O Soberano do Céu",
        hp: 100000, dano: [1000,1600], xp: 45000, moedas: [18000,30000],
        drop: "Pena do Soberano",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Majestuoso", hp_pct: 100, dano_mult: 1, msg: "O Soberano paira acima de tudo." },
          { nome: "Fase 2 — Julgamento", hp_pct: 65, dano_mult: 1.7, msg: "⚡ O Soberano julga você!" },
          { nome: "Fase 3 — Exército Celestial", hp_pct: 40, dano_mult: 2.2, msg: "👼 O exército celestial marcha!" },
          { nome: "Fase 4 — Poder Divino", hp_pct: 15, dano_mult: 3.5, msg: "☀️ O poder divino absoluto!" },
          { nome: "Fase 5 — Extinção Celestial", hp_pct: 5, dano_mult: 5, msg: "💀 O Soberano tenta extinguir tudo!" }
        ]
      },
      {
        nome: "🐺 Devorador Tempestade",
        hp: 32637, dano: [1142,1893], xp: 13055, moedas: [6527,12402],
        drop: "Relíquia de Tempestade",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Ser",
        hp: 36003, dano: [1260,2088], xp: 14401, moedas: [7201,13681],
        drop: "Relíquia de Ser",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Titã",
        hp: 38805, dano: [1358,2251], xp: 15522, moedas: [7761,14746],
        drop: "Relíquia de Titã",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Harpia",
        hp: 42446, dano: [1486,2462], xp: 16978, moedas: [8489,16129],
        drop: "Relíquia de Harpia",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Elemental",
        hp: 45469, dano: [1591,2637], xp: 18188, moedas: [9094,17278],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Serpente",
        hp: 49382, dano: [1728,2864], xp: 19753, moedas: [9876,18765],
        drop: "Relíquia de Serpente",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Fênix",
        hp: 52621, dano: [1842,3052], xp: 21048, moedas: [10524,19996],
        drop: "Relíquia de Fênix",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "tempestade",
    comerciante: "Vendedora Aeris"
  },
  pico_kaldros: {
    nome: "🏔️ Pico de Kaldros", nivel_min: 100, nivel_max: 130,
    descricao: "Picos nevados onde poucos ousam escalar até o topo.",
    monstros: [
      { nome: "Espectro de Pedra", hp: [872,2179], dano: [157,610], xp: [392,1416], moedas: [192,828] },
      { nome: "Águia Rochosa", hp: [884,2211], dano: [159,619], xp: [398,1437], moedas: [194,840] },
      { nome: "Condor de Pedra", hp: [884,2211], dano: [159,619], xp: [398,1437], moedas: [194,840] },
      { nome: "Condor Rochosa", hp: [897,2242], dano: [161,628], xp: [404,1457], moedas: [197,852] },
      { nome: "Águia Real", hp: [897,2242], dano: [161,628], xp: [404,1457], moedas: [197,852] },
      { nome: "Elemental de Pedra", hp: [910,2274], dano: [164,637], xp: [410,1478], moedas: [200,864] },
      { nome: "Águia de Pedra", hp: [922,2306], dano: [166,646], xp: [415,1499], moedas: [203,876] },
      { nome: "Grifo de Pedra", hp: [922,2306], dano: [166,646], xp: [415,1499], moedas: [203,876] },
      { nome: "Gigante Real", hp: [935,2338], dano: [168,655], xp: [421,1520], moedas: [206,888] },
      { nome: "Condor das Neves", hp: [948,2370], dano: [171,664], xp: [427,1540], moedas: [209,901] },
      { nome: "Condor Kaldriano", hp: [948,2370], dano: [171,664], xp: [427,1540], moedas: [209,901] },
      { nome: "Águia de Granito", hp: [961,2402], dano: [173,673], xp: [432,1561], moedas: [211,913] },
      { nome: "Condor da Montanha", hp: [961,2402], dano: [173,673], xp: [432,1561], moedas: [211,913] },
      { nome: "Yeti Rochosa", hp: [974,2434], dano: [175,682], xp: [438,1582], moedas: [214,925] },
      { nome: "Condor das Alturas", hp: [987,2466], dano: [178,690], xp: [444,1603], moedas: [217,937] },
      { nome: "Gigante das Alturas", hp: [987,2466], dano: [178,690], xp: [444,1603], moedas: [217,937] },
      { nome: "Gigante de Granito", hp: [1000,2499], dano: [180,700], xp: [450,1624], moedas: [220,950] },
      { nome: "Condor de Granito", hp: [1000,2499], dano: [180,700], xp: [450,1624], moedas: [220,950] },
      { nome: "Golem das Neves", hp: [1013,2532], dano: [182,709], xp: [456,1646], moedas: [223,962] },
      { nome: "Yeti da Montanha", hp: [1026,2564], dano: [185,718], xp: [462,1667], moedas: [226,974] },
      { nome: "Yeti de Pedra", hp: [1026,2564], dano: [185,718], xp: [462,1667], moedas: [226,974] },
      { nome: "Golem de Pedra", hp: [1039,2597], dano: [187,727], xp: [468,1688], moedas: [229,987] },
      { nome: "Espectro Congelado", hp: [1039,2597], dano: [187,727], xp: [468,1688], moedas: [229,987] },
      { nome: "Harpia de Pedra", hp: [1052,2630], dano: [189,736], xp: [473,1710], moedas: [231,999] },
      { nome: "Guerreiro de Granito", hp: [1065,2663], dano: [192,746], xp: [479,1731], moedas: [234,1012] },
      { nome: "Espectro da Montanha", hp: [1065,2663], dano: [192,746], xp: [479,1731], moedas: [234,1012] },
      { nome: "Golem Kaldriano", hp: [1079,2697], dano: [194,755], xp: [486,1753], moedas: [237,1025] },
      { nome: "Harpia Rochosa", hp: [1092,2730], dano: [197,764], xp: [491,1774], moedas: [240,1037] },
      { nome: "Grifo Kaldriano", hp: [1092,2730], dano: [197,764], xp: [491,1774], moedas: [240,1037] },
      { nome: "Grifo Congelado", hp: [1105,2764], dano: [199,774], xp: [497,1797], moedas: [243,1050] },
      { nome: "Águia da Montanha", hp: [1105,2764], dano: [199,774], xp: [497,1797], moedas: [243,1050] },
      { nome: "Guerreiro das Neves", hp: [1119,2797], dano: [201,783], xp: [504,1818], moedas: [246,1063] },
      { nome: "Grifo Real", hp: [1132,2831], dano: [204,793], xp: [509,1840], moedas: [249,1076] },
      { nome: "Elemental Congelado", hp: [1132,2831], dano: [204,793], xp: [509,1840], moedas: [249,1076] },
      { nome: "Guerreiro das Alturas", hp: [1146,2865], dano: [206,802], xp: [516,1862], moedas: [252,1089] },
      { nome: "Yeti Congelado", hp: [1146,2865], dano: [206,802], xp: [516,1862], moedas: [252,1089] },
      { nome: "Yeti de Granito", hp: [1160,2899], dano: [209,812], xp: [522,1884], moedas: [255,1102] },
      { nome: "Guerreiro Real", hp: [1173,2933], dano: [211,821], xp: [528,1906], moedas: [258,1115] },
      { nome: "Espectro de Granito", hp: [1173,2933], dano: [211,821], xp: [528,1906], moedas: [258,1115] },
      { nome: "Espectro das Neves", hp: [1187,2968], dano: [214,831], xp: [534,1929], moedas: [261,1128] },
      { nome: "Grifo das Neves", hp: [1187,2968], dano: [214,831], xp: [534,1929], moedas: [261,1128] },
      { nome: "Gigante da Montanha", hp: [1201,3002], dano: [216,841], xp: [540,1951], moedas: [264,1141] },
      { nome: "Guerreiro de Pedra", hp: [1215,3037], dano: [219,850], xp: [547,1974], moedas: [267,1154] },
      { nome: "Elemental das Alturas", hp: [1215,3037], dano: [219,850], xp: [547,1974], moedas: [267,1154] },
      { nome: "Espectro Rochosa", hp: [1228,3071], dano: [221,860], xp: [553,1996], moedas: [270,1167] },
      { nome: "Yeti Kaldriano", hp: [1242,3106], dano: [224,870], xp: [559,2019], moedas: [273,1180] },
      { nome: "Espectro Kaldriano", hp: [1242,3106], dano: [224,870], xp: [559,2019], moedas: [273,1180] },
      { nome: "Harpia de Granito", hp: [1256,3141], dano: [226,879], xp: [565,2042], moedas: [276,1194] },
      { nome: "Elemental Real", hp: [1256,3141], dano: [226,879], xp: [565,2042], moedas: [276,1194] },
      { nome: "Golem Real", hp: [1270,3176], dano: [229,889], xp: [572,2064], moedas: [279,1207] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Águia",
        hp: 37392, dano: [1309,2169], xp: 14957, moedas: [7478,14209],
        drop: "Relíquia de Águia",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Grifo",
        hp: 39522, dano: [1383,2292], xp: 15809, moedas: [7904,15018],
        drop: "Relíquia de Grifo",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Yeti",
        hp: 42446, dano: [1486,2462], xp: 16978, moedas: [8489,16129],
        drop: "Relíquia de Yeti",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Golem",
        hp: 44704, dano: [1565,2593], xp: 17882, moedas: [8941,16988],
        drop: "Relíquia de Golem",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Gigante",
        hp: 47016, dano: [1646,2727], xp: 18806, moedas: [9403,17866],
        drop: "Relíquia de Gigante",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Condor",
        hp: 50183, dano: [1756,2911], xp: 20073, moedas: [10037,19070],
        drop: "Relíquia de Condor",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Elemental",
        hp: 52621, dano: [1842,3052], xp: 21048, moedas: [10524,19996],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Guerreiro",
        hp: 55114, dano: [1929,3197], xp: 22046, moedas: [11023,20943],
        drop: "Relíquia de Guerreiro",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Espectro",
        hp: 58520, dano: [2048,3394], xp: 23408, moedas: [11704,22238],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Harpia",
        hp: 61137, dano: [2140,3546], xp: 24455, moedas: [12227,23232],
        drop: "Relíquia de Harpia",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "frio",
    comerciante: "Alpinista Rurik"
  },
  tundra_voryn: {
    nome: "❄️ Tundra de Voryn", nivel_min: 25, nivel_max: 40,
    descricao: "Uma vastidão gelada e implacável, lar de feras adaptadas ao frio extremo.",
    monstros: [
      { nome: "Rena de Gelo", hp: [119,298], dano: [21,83], xp: [54,194], moedas: [26,113] },
      { nome: "Lobo de Gelo", hp: [119,298], dano: [21,83], xp: [54,194], moedas: [26,113] },
      { nome: "Espectro Ancião", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Urso Voryniano", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Espectro Congelado", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Mamute Congelado", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Yeti das Neves", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Golem Gélido", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Guerreiro de Gelo", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Mamute da Tundra", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] },
      { nome: "Guerreiro Ancião", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] },
      { nome: "Urso de Gelo", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] },
      { nome: "Elemental Congelado", hp: [148,369], dano: [27,103], xp: [67,240], moedas: [33,140] },
      { nome: "Elemental Gélido", hp: [148,369], dano: [27,103], xp: [67,240], moedas: [33,140] },
      { nome: "Mamute das Neves", hp: [148,369], dano: [27,103], xp: [67,240], moedas: [33,140] },
      { nome: "Elemental Polar", hp: [155,387], dano: [28,108], xp: [70,252], moedas: [34,147] },
      { nome: "Golem Selvagem", hp: [155,387], dano: [28,108], xp: [70,252], moedas: [34,147] },
      { nome: "Espectro de Gelo", hp: [155,387], dano: [28,108], xp: [70,252], moedas: [34,147] },
      { nome: "Urso da Tundra", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Rena Congelado", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Yeti Congelado", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Lobo das Neves", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Yeti de Gelo", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Espectro Selvagem", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Lobo Voryniano", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Golem Voryniano", hp: [178,444], dano: [32,124], xp: [80,289], moedas: [39,169] },
      { nome: "Elemental Selvagem", hp: [178,444], dano: [32,124], xp: [80,289], moedas: [39,169] },
      { nome: "Elemental da Tundra", hp: [178,444], dano: [32,124], xp: [80,289], moedas: [39,169] },
      { nome: "Bruxa Polar", hp: [185,463], dano: [33,130], xp: [83,301], moedas: [41,176] },
      { nome: "Espectro Polar", hp: [185,463], dano: [33,130], xp: [83,301], moedas: [41,176] },
      { nome: "Mamute Ancião", hp: [185,463], dano: [33,130], xp: [83,301], moedas: [41,176] },
      { nome: "Bruxa Selvagem", hp: [185,463], dano: [33,130], xp: [83,301], moedas: [41,176] },
      { nome: "Yeti Gélido", hp: [193,483], dano: [35,135], xp: [87,314], moedas: [42,184] },
      { nome: "Mamute de Gelo", hp: [193,483], dano: [35,135], xp: [87,314], moedas: [42,184] },
      { nome: "Mamute Selvagem", hp: [193,483], dano: [35,135], xp: [87,314], moedas: [42,184] },
      { nome: "Rena Polar", hp: [201,503], dano: [36,141], xp: [90,327], moedas: [44,191] },
      { nome: "Espectro Gélido", hp: [201,503], dano: [36,141], xp: [90,327], moedas: [44,191] },
      { nome: "Elemental de Gelo", hp: [201,503], dano: [36,141], xp: [90,327], moedas: [44,191] },
      { nome: "Espectro da Tundra", hp: [209,523], dano: [38,146], xp: [94,340], moedas: [46,199] },
      { nome: "Rena das Neves", hp: [209,523], dano: [38,146], xp: [94,340], moedas: [46,199] },
      { nome: "Espectro das Neves", hp: [209,523], dano: [38,146], xp: [94,340], moedas: [46,199] },
      { nome: "Elemental das Neves", hp: [217,544], dano: [39,152], xp: [98,354], moedas: [48,207] },
      { nome: "Rena Voryniano", hp: [217,544], dano: [39,152], xp: [98,354], moedas: [48,207] },
      { nome: "Yeti Selvagem", hp: [217,544], dano: [39,152], xp: [98,354], moedas: [48,207] },
      { nome: "Yeti da Tundra", hp: [217,544], dano: [39,152], xp: [98,354], moedas: [48,207] },
      { nome: "Guerreiro Gélido", hp: [226,564], dano: [41,158], xp: [102,367], moedas: [50,214] },
      { nome: "Urso Congelado", hp: [226,564], dano: [41,158], xp: [102,367], moedas: [50,214] },
      { nome: "Rena Selvagem", hp: [226,564], dano: [41,158], xp: [102,367], moedas: [50,214] },
      { nome: "Lobo Gélido", hp: [234,585], dano: [42,164], xp: [105,380], moedas: [51,222] },
      { nome: "Golem Polar", hp: [234,585], dano: [42,164], xp: [105,380], moedas: [51,222] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Lobo",
        hp: 2783, dano: [97,161], xp: 1113, moedas: [557,1058],
        drop: "Relíquia de Lobo",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Urso",
        hp: 3215, dano: [113,186], xp: 1286, moedas: [643,1222],
        drop: "Relíquia de Urso",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Yeti",
        hp: 3442, dano: [120,200], xp: 1377, moedas: [688,1308],
        drop: "Relíquia de Yeti",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Mamute",
        hp: 3917, dano: [137,227], xp: 1567, moedas: [783,1488],
        drop: "Relíquia de Mamute",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Elemental",
        hp: 4420, dano: [155,256], xp: 1768, moedas: [884,1680],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Guerreiro",
        hp: 4682, dano: [164,272], xp: 1873, moedas: [936,1779],
        drop: "Relíquia de Guerreiro",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Espectro",
        hp: 5228, dano: [183,303], xp: 2091, moedas: [1046,1987],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Rena",
        hp: 5802, dano: [203,337], xp: 2321, moedas: [1160,2205],
        drop: "Relíquia de Rena",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Golem",
        hp: 6099, dano: [213,354], xp: 2440, moedas: [1220,2318],
        drop: "Relíquia de Golem",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Bruxa",
        hp: 6715, dano: [235,389], xp: 2686, moedas: [1343,2552],
        drop: "Relíquia de Bruxa",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "frio",
    comerciante: "Caçadora Freya"
  },
  floresta_eryndal: {
    nome: "🌲 Floresta de Eryndal", nivel_min: 5, nivel_max: 20,
    descricao: "Uma floresta ancestral onde criaturas selvagens dominam.",
    monstros: [
      { nome: "Lobo das Sombras", hp: [60,100], dano: [12,25], xp: [40,70], moedas: [20,40] },
      { nome: "Aranha Venenosa", hp: [50,90], dano: [10,22], xp: [35,65], moedas: [18,35] },
      { nome: "Goblin Arqueiro", hp: [55,95], dano: [11,24], xp: [38,68], moedas: [19,38] },
      { nome: "Troll da Floresta", hp: [80,130], dano: [15,30], xp: [50,85], moedas: [25,50] },
      { nome: "Planta Carnívora", hp: [70,110], dano: [13,27], xp: [45,78], moedas: [22,45] },
      { nome: "Duende Selvagem", hp: [45,80], dano: [9,20], xp: [32,60], moedas: [16,32] },
      { nome: "Fada Corrompida", hp: [65,105], dano: [14,28], xp: [48,80], moedas: [24,48] },
      { nome: "Serpente da Floresta", hp: [12,30], dano: [2,8], xp: [5,20], moedas: [3,11] },
      { nome: "Lobo da Floresta", hp: [12,30], dano: [2,8], xp: [5,20], moedas: [3,11] },
      { nome: "Fada da Floresta", hp: [15,38], dano: [3,11], xp: [7,25], moedas: [3,14] },
      { nome: "Troll Carnívora", hp: [15,38], dano: [3,11], xp: [7,25], moedas: [3,14] },
      { nome: "Goblin Selvagem", hp: [15,38], dano: [3,11], xp: [7,25], moedas: [3,14] },
      { nome: "Duende Venenosa", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Serpente Zombeteiro", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Sátiro Carnívora", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Ent Ancião", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Ent Venenosa", hp: [23,58], dano: [4,16], xp: [10,38], moedas: [5,22] },
      { nome: "Javali Venenosa", hp: [23,58], dano: [4,16], xp: [10,38], moedas: [5,22] },
      { nome: "Planta das Sombras", hp: [23,58], dano: [4,16], xp: [10,38], moedas: [5,22] },
      { nome: "Duende da Floresta", hp: [28,69], dano: [5,19], xp: [13,45], moedas: [6,26] },
      { nome: "Duende Corrompida", hp: [28,69], dano: [5,19], xp: [13,45], moedas: [6,26] },
      { nome: "Goblin Feroz", hp: [28,69], dano: [5,19], xp: [13,45], moedas: [6,26] },
      { nome: "Lobo Selvagem", hp: [32,80], dano: [6,22], xp: [14,52], moedas: [7,30] },
      { nome: "Javali Selvagem", hp: [32,80], dano: [6,22], xp: [14,52], moedas: [7,30] },
      { nome: "Aranha das Sombras", hp: [32,80], dano: [6,22], xp: [14,52], moedas: [7,30] },
      { nome: "Goblin Corrompida", hp: [37,92], dano: [7,26], xp: [17,60], moedas: [8,35] },
      { nome: "Fada Ancião", hp: [37,92], dano: [7,26], xp: [17,60], moedas: [8,35] },
      { nome: "Planta Venenosa", hp: [37,92], dano: [7,26], xp: [17,60], moedas: [8,35] },
      { nome: "Goblin Carnívora", hp: [37,92], dano: [7,26], xp: [17,60], moedas: [8,35] },
      { nome: "Troll da Copa", hp: [42,104], dano: [8,29], xp: [19,68], moedas: [9,40] },
      { nome: "Troll Ancião", hp: [42,104], dano: [8,29], xp: [19,68], moedas: [9,40] },
      { nome: "Fada das Sombras", hp: [42,104], dano: [8,29], xp: [19,68], moedas: [9,40] },
      { nome: "Troll Venenosa", hp: [47,117], dano: [8,33], xp: [21,76], moedas: [10,44] },
      { nome: "Fada Feroz", hp: [47,117], dano: [8,33], xp: [21,76], moedas: [10,44] },
      { nome: "Lobo Feroz", hp: [47,117], dano: [8,33], xp: [21,76], moedas: [10,44] },
      { nome: "Javali Carnívora", hp: [52,130], dano: [9,36], xp: [23,84], moedas: [11,49] },
      { nome: "Goblin da Floresta", hp: [52,130], dano: [9,36], xp: [23,84], moedas: [11,49] },
      { nome: "Javali da Floresta", hp: [52,130], dano: [9,36], xp: [23,84], moedas: [11,49] },
      { nome: "Goblin das Sombras", hp: [52,130], dano: [9,36], xp: [23,84], moedas: [11,49] },
      { nome: "Planta Ancião", hp: [57,143], dano: [10,40], xp: [26,93], moedas: [13,54] },
      { nome: "Planta Selvagem", hp: [57,143], dano: [10,40], xp: [26,93], moedas: [13,54] },
      { nome: "Serpente das Sombras", hp: [57,143], dano: [10,40], xp: [26,93], moedas: [13,54] },
      { nome: "Troll Selvagem", hp: [63,157], dano: [11,44], xp: [28,102], moedas: [14,60] },
      { nome: "Aranha da Copa", hp: [63,157], dano: [11,44], xp: [28,102], moedas: [14,60] },
      { nome: "Planta da Floresta", hp: [63,157], dano: [11,44], xp: [28,102], moedas: [14,60] },
      { nome: "Fada Venenosa", hp: [69,171], dano: [12,48], xp: [31,111], moedas: [15,65] },
      { nome: "Serpente Selvagem", hp: [69,171], dano: [12,48], xp: [31,111], moedas: [15,65] },
      { nome: "Ent Feroz", hp: [69,171], dano: [12,48], xp: [31,111], moedas: [15,65] },
      { nome: "Lobo Ancião", hp: [74,186], dano: [13,52], xp: [33,121], moedas: [16,71] },
      { nome: "Fada Arqueiro", hp: [74,186], dano: [13,52], xp: [33,121], moedas: [16,71] }
    ],
    bosses: [
      {
        nome: "🐺 Alfa da Matilha Sombria",
        hp: 1500, dano: [40,70], xp: 500, moedas: [200,400],
        drop: "Pele do Lobo Alfa",
        fases: [
          { nome: "Fase 1 — Caçando", hp_pct: 100, dano_mult: 1, msg: "O Alfa da Matilha uiva para seus filhos." },
          { nome: "Fase 2 — Raiva", hp_pct: 55, dano_mult: 1.6, msg: "⚠️ O Alfa convoca mais lobos!" },
          { nome: "Fase 3 — Berserk", hp_pct: 20, dano_mult: 2.3, msg: "🔥 O Alfa entra em modo selvagem!" }
        ]
      },
      {
        nome: "🕷️ Rainha das Aranhas",
        hp: 2000, dano: [50,85], xp: 750, moedas: [300,550],
        drop: "Veneno da Rainha",
        fases: [
          { nome: "Fase 1 — Tecendo", hp_pct: 100, dano_mult: 1, msg: "A Rainha tece teias ao seu redor..." },
          { nome: "Fase 2 — Envenenando", hp_pct: 60, dano_mult: 1.7, msg: "⚠️ Veneno mortal é liberado!" },
          { nome: "Fase 3 — Prole Infinita", hp_pct: 25, dano_mult: 2, msg: "🕷️ Centenas de filhotes invadem!" }
        ]
      },
      {
        nome: "🐉 Hydra de Eryndal",
        hp: 3500, dano: [65,110], xp: 1200, moedas: [500,900],
        drop: "Escama da Hydra",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Três Cabeças", hp_pct: 100, dano_mult: 1, msg: "A Hydra ataca com três cabeças!" },
          { nome: "Fase 2 — Regeneração", hp_pct: 60, dano_mult: 1.5, msg: "⚠️ A Hydra regenera duas cabeças!" },
          { nome: "Fase 3 — Sete Cabeças", hp_pct: 30, dano_mult: 2, msg: "💀 A Hydra tem SETE cabeças agora!" },
          { nome: "Fase 4 — Fúria Final", hp_pct: 10, dano_mult: 3, msg: "🔥 A Hydra cospe veneno em área!" }
        ]
      },
      {
        nome: "🐺 Devorador Troll",
        hp: 500, dano: [18,29], xp: 200, moedas: [100,190],
        drop: "Relíquia de Troll",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Planta",
        hp: 703, dano: [25,41], xp: 281, moedas: [141,267],
        drop: "Relíquia de Planta",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Duende",
        hp: 817, dano: [29,47], xp: 327, moedas: [163,310],
        drop: "Relíquia de Duende",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Fada",
        hp: 1068, dano: [37,62], xp: 427, moedas: [214,406],
        drop: "Relíquia de Fada",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Urso",
        hp: 1351, dano: [47,78], xp: 540, moedas: [270,513],
        drop: "Relíquia de Urso",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Javali",
        hp: 1504, dano: [53,87], xp: 602, moedas: [301,572],
        drop: "Relíquia de Javali",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Serpente",
        hp: 1832, dano: [64,106], xp: 733, moedas: [366,696],
        drop: "Relíquia de Serpente",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "nevoa",
    comerciante: "Vendedora Sylvi"
  },
  serra_titas: {
    nome: "⛰️ Serra dos Titãs", nivel_min: 70, nivel_max: 95,
    descricao: "Montanhas colossais onde titãs de pedra ainda vagam.",
    monstros: [
      { nome: "Golem das Serras", hp: [523,1306], dano: [94,366], xp: [235,849], moedas: [115,496] },
      { nome: "Behemoth das Serras", hp: [533,1333], dano: [96,373], xp: [240,866], moedas: [117,507] },
      { nome: "Ciclope das Serras", hp: [533,1333], dano: [96,373], xp: [240,866], moedas: [117,507] },
      { nome: "Gigante Jovem", hp: [544,1360], dano: [98,381], xp: [245,884], moedas: [120,517] },
      { nome: "Colosso Titânico", hp: [544,1360], dano: [98,381], xp: [245,884], moedas: [120,517] },
      { nome: "Gárgula das Serras", hp: [555,1387], dano: [100,388], xp: [250,902], moedas: [122,527] },
      { nome: "Gigante Rochosa", hp: [555,1387], dano: [100,388], xp: [250,902], moedas: [122,527] },
      { nome: "Colosso de Pedra", hp: [566,1415], dano: [102,396], xp: [255,920], moedas: [125,538] },
      { nome: "Elemental de Rocha", hp: [566,1415], dano: [102,396], xp: [255,920], moedas: [125,538] },
      { nome: "Ciclope de Pedra", hp: [577,1442], dano: [104,404], xp: [260,937], moedas: [127,548] },
      { nome: "Titã de Pedra", hp: [577,1442], dano: [104,404], xp: [260,937], moedas: [127,548] },
      { nome: "Gárgula Jovem", hp: [588,1470], dano: [106,412], xp: [265,956], moedas: [129,559] },
      { nome: "Behemoth Menor", hp: [588,1470], dano: [106,412], xp: [265,956], moedas: [129,559] },
      { nome: "Behemoth de Pedra", hp: [599,1498], dano: [108,419], xp: [270,974], moedas: [132,569] },
      { nome: "Elemental Jovem", hp: [599,1498], dano: [108,419], xp: [270,974], moedas: [132,569] },
      { nome: "Gigante Titânico", hp: [610,1526], dano: [110,427], xp: [274,992], moedas: [134,580] },
      { nome: "Elemental das Serras", hp: [610,1526], dano: [110,427], xp: [274,992], moedas: [134,580] },
      { nome: "Behemoth de Granito", hp: [622,1554], dano: [112,435], xp: [280,1010], moedas: [137,591] },
      { nome: "Titã de Granito", hp: [622,1554], dano: [112,435], xp: [280,1010], moedas: [137,591] },
      { nome: "Gigante Menor", hp: [633,1582], dano: [114,443], xp: [285,1028], moedas: [139,601] },
      { nome: "Behemoth Jovem", hp: [633,1582], dano: [114,443], xp: [285,1028], moedas: [139,601] },
      { nome: "Titã Rochosa", hp: [644,1611], dano: [116,451], xp: [290,1047], moedas: [142,612] },
      { nome: "Guardião de Rocha", hp: [644,1611], dano: [116,451], xp: [290,1047], moedas: [142,612] },
      { nome: "Titã Jovem", hp: [656,1639], dano: [118,459], xp: [295,1065], moedas: [144,623] },
      { nome: "Colosso de Granito", hp: [656,1639], dano: [118,459], xp: [295,1065], moedas: [144,623] },
      { nome: "Titã das Serras", hp: [667,1668], dano: [120,467], xp: [300,1084], moedas: [147,634] },
      { nome: "Gárgula de Granito", hp: [667,1668], dano: [120,467], xp: [300,1084], moedas: [147,634] },
      { nome: "Ciclope Rochosa", hp: [679,1697], dano: [122,475], xp: [306,1103], moedas: [149,645] },
      { nome: "Ciclope de Granito", hp: [679,1697], dano: [122,475], xp: [306,1103], moedas: [149,645] },
      { nome: "Guerreiro de Pedra", hp: [690,1726], dano: [124,483], xp: [310,1122], moedas: [152,656] },
      { nome: "Guerreiro de Rocha", hp: [690,1726], dano: [124,483], xp: [310,1122], moedas: [152,656] },
      { nome: "Elemental Titânico", hp: [702,1755], dano: [126,491], xp: [316,1141], moedas: [154,667] },
      { nome: "Golem Menor", hp: [702,1755], dano: [126,491], xp: [316,1141], moedas: [154,667] },
      { nome: "Colosso Menor", hp: [714,1785], dano: [129,500], xp: [321,1160], moedas: [157,678] },
      { nome: "Elemental de Pedra", hp: [714,1785], dano: [129,500], xp: [321,1160], moedas: [157,678] },
      { nome: "Gigante de Rocha", hp: [726,1814], dano: [131,508], xp: [327,1179], moedas: [160,689] },
      { nome: "Guardião Titânico", hp: [726,1814], dano: [131,508], xp: [327,1179], moedas: [160,689] },
      { nome: "Ciclope de Rocha", hp: [738,1844], dano: [133,516], xp: [332,1199], moedas: [162,701] },
      { nome: "Ciclope Jovem", hp: [738,1844], dano: [133,516], xp: [332,1199], moedas: [162,701] },
      { nome: "Ciclope Menor", hp: [749,1874], dano: [135,525], xp: [337,1218], moedas: [165,712] },
      { nome: "Elemental Menor", hp: [749,1874], dano: [135,525], xp: [337,1218], moedas: [165,712] },
      { nome: "Guardião das Serras", hp: [761,1904], dano: [137,533], xp: [342,1238], moedas: [167,724] },
      { nome: "Elemental de Granito", hp: [761,1904], dano: [137,533], xp: [342,1238], moedas: [167,724] },
      { nome: "Behemoth de Rocha", hp: [773,1934], dano: [139,542], xp: [348,1257], moedas: [170,735] },
      { nome: "Golem de Rocha", hp: [773,1934], dano: [139,542], xp: [348,1257], moedas: [170,735] },
      { nome: "Gárgula de Pedra", hp: [786,1964], dano: [141,550], xp: [354,1277], moedas: [173,746] },
      { nome: "Guardião Jovem", hp: [786,1964], dano: [141,550], xp: [354,1277], moedas: [173,746] },
      { nome: "Golem Jovem", hp: [798,1994], dano: [144,558], xp: [359,1296], moedas: [176,758] },
      { nome: "Colosso Rochosa", hp: [798,1994], dano: [144,558], xp: [359,1296], moedas: [176,758] },
      { nome: "Guardião Menor", hp: [810,2025], dano: [146,567], xp: [364,1316], moedas: [178,770] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Titã",
        hp: 19164, dano: [671,1112], xp: 7666, moedas: [3833,7282],
        drop: "Relíquia de Titã",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Golem",
        hp: 20732, dano: [726,1202], xp: 8293, moedas: [4146,7878],
        drop: "Relíquia de Golem",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Ciclope",
        hp: 22357, dano: [782,1297], xp: 8943, moedas: [4471,8496],
        drop: "Relíquia de Ciclope",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Colosso",
        hp: 23473, dano: [822,1361], xp: 9389, moedas: [4695,8920],
        drop: "Relíquia de Colosso",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Guerreiro",
        hp: 25193, dano: [882,1461], xp: 10077, moedas: [5039,9573],
        drop: "Relíquia de Guerreiro",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Gigante",
        hp: 26970, dano: [944,1564], xp: 10788, moedas: [5394,10249],
        drop: "Relíquia de Gigante",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Gárgula",
        hp: 28803, dano: [1008,1671], xp: 11521, moedas: [5761,10945],
        drop: "Relíquia de Gárgula",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Guardião",
        hp: 30056, dano: [1052,1743], xp: 12022, moedas: [6011,11421],
        drop: "Relíquia de Guardião",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Elemental",
        hp: 31983, dano: [1119,1855], xp: 12793, moedas: [6397,12154],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Behemoth",
        hp: 33965, dano: [1189,1970], xp: 13586, moedas: [6793,12907],
        drop: "Relíquia de Behemoth",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Anão Borin"
  },
  cavernas_gelo: {
    nome: "🧊 Cavernas de Gelo Eterno", nivel_min: 75, nivel_max: 100,
    descricao: "Um labirinto subterrâneo de gelo que nunca derrete.",
    monstros: [
      { nome: "Golem Vivo", hp: [577,1442], dano: [104,404], xp: [260,937], moedas: [127,548] },
      { nome: "Aranha Vivo", hp: [588,1470], dano: [106,412], xp: [265,956], moedas: [129,559] },
      { nome: "Morcego Vivo", hp: [588,1470], dano: [106,412], xp: [265,956], moedas: [129,559] },
      { nome: "Morcego Gigante", hp: [599,1498], dano: [108,419], xp: [270,974], moedas: [132,569] },
      { nome: "Morcego de Gelo", hp: [599,1498], dano: [108,419], xp: [270,974], moedas: [132,569] },
      { nome: "Aranha de Gelo", hp: [610,1526], dano: [110,427], xp: [274,992], moedas: [134,580] },
      { nome: "Golem de Gelo", hp: [610,1526], dano: [110,427], xp: [274,992], moedas: [134,580] },
      { nome: "Elemental de Gelo", hp: [622,1554], dano: [112,435], xp: [280,1010], moedas: [137,591] },
      { nome: "Yeti Vivo", hp: [622,1554], dano: [112,435], xp: [280,1010], moedas: [137,591] },
      { nome: "Elemental Faminto", hp: [633,1582], dano: [114,443], xp: [285,1028], moedas: [139,601] },
      { nome: "Elemental das Cavernas", hp: [633,1582], dano: [114,443], xp: [285,1028], moedas: [139,601] },
      { nome: "Basilisco de Gelo", hp: [644,1611], dano: [116,451], xp: [290,1047], moedas: [142,612] },
      { nome: "Basilisco Gigante", hp: [644,1611], dano: [116,451], xp: [290,1047], moedas: [142,612] },
      { nome: "Espectro Congelada", hp: [656,1639], dano: [118,459], xp: [295,1065], moedas: [144,623] },
      { nome: "Aranha Faminto", hp: [656,1639], dano: [118,459], xp: [295,1065], moedas: [144,623] },
      { nome: "Cristal de Gelo", hp: [667,1668], dano: [120,467], xp: [300,1084], moedas: [147,634] },
      { nome: "Verme de Gelo", hp: [667,1668], dano: [120,467], xp: [300,1084], moedas: [147,634] },
      { nome: "Wendigo de Gelo", hp: [679,1697], dano: [122,475], xp: [306,1103], moedas: [149,645] },
      { nome: "Basilisco Vivo", hp: [679,1697], dano: [122,475], xp: [306,1103], moedas: [149,645] },
      { nome: "Yeti Gélido", hp: [690,1726], dano: [124,483], xp: [310,1122], moedas: [152,656] },
      { nome: "Espectro de Gelo", hp: [690,1726], dano: [124,483], xp: [310,1122], moedas: [152,656] },
      { nome: "Cristal Gigante", hp: [702,1755], dano: [126,491], xp: [316,1141], moedas: [154,667] },
      { nome: "Basilisco das Cavernas", hp: [702,1755], dano: [126,491], xp: [316,1141], moedas: [154,667] },
      { nome: "Verme Congelada", hp: [714,1785], dano: [129,500], xp: [321,1160], moedas: [157,678] },
      { nome: "Cristal Gélido", hp: [714,1785], dano: [129,500], xp: [321,1160], moedas: [157,678] },
      { nome: "Elemental Vivo", hp: [726,1814], dano: [131,508], xp: [327,1179], moedas: [160,689] },
      { nome: "Yeti das Cavernas", hp: [726,1814], dano: [131,508], xp: [327,1179], moedas: [160,689] },
      { nome: "Wendigo Gigante", hp: [738,1844], dano: [133,516], xp: [332,1199], moedas: [162,701] },
      { nome: "Yeti de Gelo", hp: [738,1844], dano: [133,516], xp: [332,1199], moedas: [162,701] },
      { nome: "Golem Gélido", hp: [749,1874], dano: [135,525], xp: [337,1218], moedas: [165,712] },
      { nome: "Verme das Cavernas", hp: [749,1874], dano: [135,525], xp: [337,1218], moedas: [165,712] },
      { nome: "Morcego das Cavernas", hp: [761,1904], dano: [137,533], xp: [342,1238], moedas: [167,724] },
      { nome: "Aranha Gélido", hp: [761,1904], dano: [137,533], xp: [342,1238], moedas: [167,724] },
      { nome: "Cristal Faminto", hp: [773,1934], dano: [139,542], xp: [348,1257], moedas: [170,735] },
      { nome: "Yeti Congelada", hp: [773,1934], dano: [139,542], xp: [348,1257], moedas: [170,735] },
      { nome: "Aranha Gigante", hp: [786,1964], dano: [141,550], xp: [354,1277], moedas: [173,746] },
      { nome: "Verme Gélido", hp: [786,1964], dano: [141,550], xp: [354,1277], moedas: [173,746] },
      { nome: "Aranha Congelada", hp: [798,1994], dano: [144,558], xp: [359,1296], moedas: [176,758] },
      { nome: "Cristal Congelada", hp: [798,1994], dano: [144,558], xp: [359,1296], moedas: [176,758] },
      { nome: "Elemental Congelada", hp: [810,2025], dano: [146,567], xp: [364,1316], moedas: [178,770] },
      { nome: "Verme Faminto", hp: [810,2025], dano: [146,567], xp: [364,1316], moedas: [178,770] },
      { nome: "Yeti Gigante", hp: [822,2055], dano: [148,575], xp: [370,1336], moedas: [181,781] },
      { nome: "Espectro Gigante", hp: [822,2055], dano: [148,575], xp: [370,1336], moedas: [181,781] },
      { nome: "Espectro Gélido", hp: [834,2086], dano: [150,584], xp: [375,1356], moedas: [183,793] },
      { nome: "Golem Congelada", hp: [834,2086], dano: [150,584], xp: [375,1356], moedas: [183,793] },
      { nome: "Golem Faminto", hp: [847,2117], dano: [152,593], xp: [381,1376], moedas: [186,804] },
      { nome: "Espectro Vivo", hp: [847,2117], dano: [152,593], xp: [381,1376], moedas: [186,804] },
      { nome: "Golem das Cavernas", hp: [859,2148], dano: [155,601], xp: [387,1396], moedas: [189,816] },
      { nome: "Wendigo Vivo", hp: [859,2148], dano: [155,601], xp: [387,1396], moedas: [189,816] },
      { nome: "Basilisco Gélido", hp: [872,2179], dano: [157,610], xp: [392,1416], moedas: [192,828] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Yeti",
        hp: 21809, dano: [763,1265], xp: 8724, moedas: [4362,8287],
        drop: "Relíquia de Yeti",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Elemental",
        hp: 23473, dano: [822,1361], xp: 9389, moedas: [4695,8920],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Cristal",
        hp: 25193, dano: [882,1461], xp: 10077, moedas: [5039,9573],
        drop: "Relíquia de Cristal",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Golem",
        hp: 26371, dano: [923,1530], xp: 10548, moedas: [5274,10021],
        drop: "Relíquia de Golem",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Aranha",
        hp: 28186, dano: [987,1635], xp: 11274, moedas: [5637,10711],
        drop: "Relíquia de Aranha",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Morcego",
        hp: 30056, dano: [1052,1743], xp: 12022, moedas: [6011,11421],
        drop: "Relíquia de Morcego",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Wendigo",
        hp: 31983, dano: [1119,1855], xp: 12793, moedas: [6397,12154],
        drop: "Relíquia de Wendigo",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Espectro",
        hp: 33298, dano: [1165,1931], xp: 13319, moedas: [6660,12653],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Verme",
        hp: 35317, dano: [1236,2048], xp: 14127, moedas: [7063,13420],
        drop: "Relíquia de Verme",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Basilisco",
        hp: 37392, dano: [1309,2169], xp: 14957, moedas: [7478,14209],
        drop: "Relíquia de Basilisco",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "frio",
    comerciante: "Eremita Wynn"
  },
  bosque_sombras: {
    nome: "🌑 Bosque das Sombras", nivel_min: 15, nivel_max: 30,
    descricao: "Um bosque onde a luz nunca penetra. Criaturas das trevas habitam aqui.",
    monstros: [
      { nome: "Espectro Menor", hp: [100,160], dano: [20,40], xp: [60,100], moedas: [30,60] },
      { nome: "Zumbi Antigo", hp: [120,180], dano: [22,44], xp: [65,110], moedas: [33,65] },
      { nome: "Sombra Errante", hp: [90,150], dano: [18,38], xp: [55,95], moedas: [28,55] },
      { nome: "Banshee", hp: [110,170], dano: [21,42], xp: [62,105], moedas: [31,62] },
      { nome: "Cavaleiro Morto", hp: [140,200], dano: [25,50], xp: [75,120], moedas: [38,75] },
      { nome: "Demônio Menor", hp: [130,190], dano: [24,48], xp: [72,115], moedas: [36,72] },
      { nome: "Necrófago Antigo", hp: [57,143], dano: [10,40], xp: [26,93], moedas: [13,54] },
      { nome: "Cavaleiro Errante", hp: [57,143], dano: [10,40], xp: [26,93], moedas: [13,54] },
      { nome: "Cavaleiro Voraz", hp: [63,157], dano: [11,44], xp: [28,102], moedas: [14,60] },
      { nome: "Ceifador Menor", hp: [63,157], dano: [11,44], xp: [28,102], moedas: [14,60] },
      { nome: "Zumbi Sussurrante", hp: [63,157], dano: [11,44], xp: [28,102], moedas: [14,60] },
      { nome: "Carrasco Sussurrante", hp: [69,171], dano: [12,48], xp: [31,111], moedas: [15,65] },
      { nome: "Necrófago das Trevas", hp: [69,171], dano: [12,48], xp: [31,111], moedas: [15,65] },
      { nome: "Cavaleiro Menor", hp: [69,171], dano: [12,48], xp: [31,111], moedas: [15,65] },
      { nome: "Banshee Morto", hp: [69,171], dano: [12,48], xp: [31,111], moedas: [15,65] },
      { nome: "Ceifador Antigo", hp: [74,186], dano: [13,52], xp: [33,121], moedas: [16,71] },
      { nome: "Espectro Amaldiçoado", hp: [74,186], dano: [13,52], xp: [33,121], moedas: [16,71] },
      { nome: "Carrasco Voraz", hp: [74,186], dano: [13,52], xp: [33,121], moedas: [16,71] },
      { nome: "Assombração das Trevas", hp: [80,201], dano: [14,56], xp: [36,131], moedas: [18,76] },
      { nome: "Ceifador Morto", hp: [80,201], dano: [14,56], xp: [36,131], moedas: [18,76] },
      { nome: "Assombração Morto", hp: [80,201], dano: [14,56], xp: [36,131], moedas: [18,76] },
      { nome: "Ceifador Uivante", hp: [87,216], dano: [16,60], xp: [39,140], moedas: [19,82] },
      { nome: "Sombra Voraz", hp: [87,216], dano: [16,60], xp: [39,140], moedas: [19,82] },
      { nome: "Banshee Amaldiçoado", hp: [87,216], dano: [16,60], xp: [39,140], moedas: [19,82] },
      { nome: "Necrófago Morto", hp: [93,232], dano: [17,65], xp: [42,151], moedas: [20,88] },
      { nome: "Necrófago Errante", hp: [93,232], dano: [17,65], xp: [42,151], moedas: [20,88] },
      { nome: "Assombração Sussurrante", hp: [93,232], dano: [17,65], xp: [42,151], moedas: [20,88] },
      { nome: "Ceifador Errante", hp: [93,232], dano: [17,65], xp: [42,151], moedas: [20,88] },
      { nome: "Zumbi Uivante", hp: [99,248], dano: [18,69], xp: [45,161], moedas: [22,94] },
      { nome: "Sombra Menor", hp: [99,248], dano: [18,69], xp: [45,161], moedas: [22,94] },
      { nome: "Necrófago Menor", hp: [99,248], dano: [18,69], xp: [45,161], moedas: [22,94] },
      { nome: "Carrasco Errante", hp: [106,265], dano: [19,74], xp: [48,172], moedas: [23,101] },
      { nome: "Sombra Antigo", hp: [106,265], dano: [19,74], xp: [48,172], moedas: [23,101] },
      { nome: "Necrófago Uivante", hp: [106,265], dano: [19,74], xp: [48,172], moedas: [23,101] },
      { nome: "Ceifador Sussurrante", hp: [112,281], dano: [20,79], xp: [50,183], moedas: [25,107] },
      { nome: "Demônio Errante", hp: [112,281], dano: [20,79], xp: [50,183], moedas: [25,107] },
      { nome: "Assombração Uivante", hp: [112,281], dano: [20,79], xp: [50,183], moedas: [25,107] },
      { nome: "Assombração Menor", hp: [112,281], dano: [20,79], xp: [50,183], moedas: [25,107] },
      { nome: "Zumbi Menor", hp: [119,298], dano: [21,83], xp: [54,194], moedas: [26,113] },
      { nome: "Carrasco das Trevas", hp: [119,298], dano: [21,83], xp: [54,194], moedas: [26,113] },
      { nome: "Espectro Morto", hp: [119,298], dano: [21,83], xp: [54,194], moedas: [26,113] },
      { nome: "Zumbi Errante", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Sombra Morto", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Assombração Voraz", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Banshee Voraz", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Demônio Antigo", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Espectro Antigo", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Banshee das Trevas", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] },
      { nome: "Ceifador das Trevas", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] },
      { nome: "Necrófago Sussurrante", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] }
    ],
    bosses: [
      {
        nome: "💀 Espectro do General",
        hp: 3000, dano: [60,100], xp: 1000, moedas: [400,700],
        drop: "Armadura Espectral",
        fases: [
          { nome: "Fase 1 — Intangível", hp_pct: 100, dano_mult: 1, msg: "O Espectro flutua, intocável." },
          { nome: "Fase 2 — Materializado", hp_pct: 50, dano_mult: 1.8, msg: "⚠️ O Espectro se materializa furioso!" },
          { nome: "Fase 3 — Possessão", hp_pct: 20, dano_mult: 2.5, msg: "👻 O Espectro tenta possuir você!" }
        ]
      },
      {
        nome: "🧛 Vampiro Ancião das Trevas",
        hp: 4500, dano: [75,120], xp: 1500, moedas: [600,1000],
        drop: "Capa do Vampiro Ancião",
        fases: [
          { nome: "Fase 1 — Sedutor", hp_pct: 100, dano_mult: 1, msg: "O Vampiro sorri. \"Venha, mortal...\"" },
          { nome: "Fase 2 — Faminto", hp_pct: 55, dano_mult: 1.7, msg: "🩸 O Vampiro drena seu sangue!" },
          { nome: "Fase 3 — Forma Morcego", hp_pct: 25, dano_mult: 2.3, msg: "🦇 Uma nuvem de morcegos ataca!" }
        ]
      },
      {
        nome: "👑 Rei das Sombras",
        hp: 7000, dano: [100,160], xp: 2500, moedas: [1000,1800],
        drop: "Coroa das Trevas Eternas",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Soberania", hp_pct: 100, dano_mult: 1, msg: "O Rei das Sombras emerge do escuro." },
          { nome: "Fase 2 — Tempestade Sombria", hp_pct: 60, dano_mult: 1.6, msg: "⚠️ Uma tempestade de trevas explode!" },
          { nome: "Fase 3 — Exército Morto", hp_pct: 35, dano_mult: 2, msg: "💀 O Rei invoca seu exército!" },
          { nome: "Fase 4 — Forma Divina das Trevas", hp_pct: 10, dano_mult: 3.2, msg: "🌑 O Rei assume sua forma divina!" }
        ]
      },
      {
        nome: "🐺 Devorador Banshee",
        hp: 1832, dano: [64,106], xp: 733, moedas: [366,696],
        drop: "Relíquia de Banshee",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Cavaleiro",
        hp: 2190, dano: [77,127], xp: 876, moedas: [438,832],
        drop: "Relíquia de Cavaleiro",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Demônio",
        hp: 2380, dano: [83,138], xp: 952, moedas: [476,904],
        drop: "Relíquia de Demônio",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Necrófago",
        hp: 2783, dano: [97,161], xp: 1113, moedas: [557,1058],
        drop: "Relíquia de Necrófago",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Ceifador",
        hp: 3215, dano: [113,186], xp: 1286, moedas: [643,1222],
        drop: "Relíquia de Ceifador",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Assombração",
        hp: 3442, dano: [120,200], xp: 1377, moedas: [688,1308],
        drop: "Relíquia de Assombração",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Carrasco",
        hp: 3917, dano: [137,227], xp: 1567, moedas: [783,1488],
        drop: "Relíquia de Carrasco",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "trevas",
    comerciante: "Comerciante Vex"
  },
  montanha_dragao_vida: {
    nome: "🐉 Montanha do Dragão da Vida", nivel_min: 100, nivel_max: 150,
    descricao: "O lar do Dragão da Vida. Apenas lendas chegam aqui.",
    monstros: [
      { nome: "Dragão Sagrado", hp: [2000,3000], dano: [400,750], xp: [1000,1700], moedas: [500,1000] },
      { nome: "Protetor Ancestral", hp: [2200,3300], dano: [440,825], xp: [1100,1870], moedas: [550,1100] },
      { nome: "Elemental Primordial", hp: [2400,3600], dano: [480,900], xp: [1200,2040], moedas: [600,1200] },
      { nome: "Guardião da Vida", hp: [1800,2700], dano: [360,675], xp: [900,1530], moedas: [450,900] },
      { nome: "Wyrm Sagrado", hp: [2600,3900], dano: [520,975], xp: [1300,2210], moedas: [650,1300] },
      { nome: "Guardião Ancestral", hp: [872,2179], dano: [157,610], xp: [392,1416], moedas: [192,828] },
      { nome: "Dragão da Vida", hp: [884,2211], dano: [159,619], xp: [398,1437], moedas: [194,840] },
      { nome: "Protetor Primordial", hp: [897,2242], dano: [161,628], xp: [404,1457], moedas: [197,852] },
      { nome: "Fênix da Montanha", hp: [910,2274], dano: [164,637], xp: [410,1478], moedas: [200,864] },
      { nome: "Fênix da Vida", hp: [922,2306], dano: [166,646], xp: [415,1499], moedas: [203,876] },
      { nome: "Elemental de Pedra", hp: [935,2338], dano: [168,655], xp: [421,1520], moedas: [206,888] },
      { nome: "Titã Sagrado", hp: [948,2370], dano: [171,664], xp: [427,1540], moedas: [209,901] },
      { nome: "Elemental da Vida", hp: [961,2402], dano: [173,673], xp: [432,1561], moedas: [211,913] },
      { nome: "Serafim Renascida", hp: [974,2434], dano: [175,682], xp: [438,1582], moedas: [214,925] },
      { nome: "Fênix de Pedra", hp: [987,2466], dano: [178,690], xp: [444,1603], moedas: [217,937] },
      { nome: "Protetor Sagrado", hp: [1000,2499], dano: [180,700], xp: [450,1624], moedas: [220,950] },
      { nome: "Serafim Sagrado", hp: [1013,2532], dano: [182,709], xp: [456,1646], moedas: [223,962] },
      { nome: "Dragão Renascida", hp: [1026,2564], dano: [185,718], xp: [462,1667], moedas: [226,974] },
      { nome: "Wyrm da Montanha", hp: [1039,2597], dano: [187,727], xp: [468,1688], moedas: [229,987] },
      { nome: "Titã Primordial", hp: [1052,2630], dano: [189,736], xp: [473,1710], moedas: [231,999] },
      { nome: "Serafim da Vida", hp: [1065,2663], dano: [192,746], xp: [479,1731], moedas: [234,1012] },
      { nome: "Titã da Montanha", hp: [1079,2697], dano: [194,755], xp: [486,1753], moedas: [237,1025] },
      { nome: "Dragão de Pedra", hp: [1092,2730], dano: [197,764], xp: [491,1774], moedas: [240,1037] },
      { nome: "Dragão Primordial", hp: [1105,2764], dano: [199,774], xp: [497,1797], moedas: [243,1050] },
      { nome: "Serafim Ancestral", hp: [1119,2797], dano: [201,783], xp: [504,1818], moedas: [246,1063] },
      { nome: "Protetor Renascida", hp: [1132,2831], dano: [204,793], xp: [509,1840], moedas: [249,1076] },
      { nome: "Titã Ancestral", hp: [1146,2865], dano: [206,802], xp: [516,1862], moedas: [252,1089] },
      { nome: "Guardião Renascida", hp: [1160,2899], dano: [209,812], xp: [522,1884], moedas: [255,1102] },
      { nome: "Fênix Ancestral", hp: [1173,2933], dano: [211,821], xp: [528,1906], moedas: [258,1115] },
      { nome: "Serafim da Montanha", hp: [1187,2968], dano: [214,831], xp: [534,1929], moedas: [261,1128] },
      { nome: "Wyrm Primordial", hp: [1215,3037], dano: [219,850], xp: [547,1974], moedas: [267,1154] },
      { nome: "Serafim de Pedra", hp: [1228,3071], dano: [221,860], xp: [553,1996], moedas: [270,1167] },
      { nome: "Guardião Primordial", hp: [1242,3106], dano: [224,870], xp: [559,2019], moedas: [273,1180] },
      { nome: "Titã da Vida", hp: [1256,3141], dano: [226,879], xp: [565,2042], moedas: [276,1194] },
      { nome: "Dragão da Montanha", hp: [1270,3176], dano: [229,889], xp: [572,2064], moedas: [279,1207] },
      { nome: "Wyrm Ancestral", hp: [1284,3211], dano: [231,899], xp: [578,2087], moedas: [282,1220] },
      { nome: "Wyrm da Vida", hp: [1298,3246], dano: [234,909], xp: [584,2110], moedas: [286,1233] },
      { nome: "Fênix Renascida", hp: [1313,3282], dano: [236,919], xp: [591,2133], moedas: [289,1247] },
      { nome: "Wyrm Renascida", hp: [1327,3317], dano: [239,929], xp: [597,2156], moedas: [292,1260] },
      { nome: "Titã Renascida", hp: [1341,3353], dano: [241,939], xp: [603,2179], moedas: [295,1274] },
      { nome: "Fênix Sagrado", hp: [1355,3388], dano: [244,949], xp: [610,2202], moedas: [298,1287] },
      { nome: "Elemental Sagrado", hp: [1370,3424], dano: [247,959], xp: [616,2226], moedas: [301,1301] },
      { nome: "Elemental Renascida", hp: [1384,3460], dano: [249,969], xp: [623,2249], moedas: [304,1315] },
      { nome: "Protetor da Montanha", hp: [1398,3496], dano: [252,979], xp: [629,2272], moedas: [308,1328] },
      { nome: "Fênix Primordial", hp: [1413,3532], dano: [254,989], xp: [636,2296], moedas: [311,1342] },
      { nome: "Titã de Pedra", hp: [1427,3568], dano: [257,999], xp: [642,2319], moedas: [314,1356] },
      { nome: "Guardião de Pedra", hp: [1442,3605], dano: [260,1009], xp: [649,2343], moedas: [317,1370] },
      { nome: "Dragão Ancestral", hp: [1457,3641], dano: [262,1019], xp: [656,2367], moedas: [321,1384] },
      { nome: "Elemental da Montanha", hp: [1471,3678], dano: [265,1030], xp: [662,2391], moedas: [324,1398] },
      { nome: "Guardião Sagrado", hp: [1486,3715], dano: [267,1040], xp: [669,2415], moedas: [327,1412] }
    ],
    bosses: [
      {
        nome: "🔮 Guardião do Dragão",
        hp: 80000, dano: [1200,2000], xp: 35000, moedas: [14000,24000],
        drop: "Cristal do Guardião",
        fases: [
          { nome: "Fase 1 — Protetor", hp_pct: 100, dano_mult: 1, msg: "O Guardião protege o dragão." },
          { nome: "Fase 2 — Fúria", hp_pct: 50, dano_mult: 2, msg: "⚠️ O Guardião entra em fúria!" },
          { nome: "Fase 3 — Poder Máximo", hp_pct: 20, dano_mult: 3, msg: "💥 Poder ilimitado!" }
        ]
      },
      {
        nome: "🌟 Wyrm Primordial",
        hp: 150000, dano: [2000,3200], xp: 60000, moedas: [24000,40000],
        drop: "Escama Primordial do Wyrm",
        fases: [
          { nome: "Fase 1 — Antigo", hp_pct: 100, dano_mult: 1, msg: "O Wyrm é mais antigo que o mundo." },
          { nome: "Fase 2 — Destruição", hp_pct: 55, dano_mult: 1.9, msg: "💀 O Wyrm destrói o terreno!" },
          { nome: "Fase 3 — Primordial", hp_pct: 20, dano_mult: 3.2, msg: "🌟 Energia primordial explode!" }
        ]
      },
      {
        nome: "🐉 Vyraxis — O Dragão da Vida",
        hp: 300000, dano: [3500,5500], xp: 120000, moedas: [50000,90000],
        drop: "Coração do Dragão da Vida",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Despertando", hp_pct: 100, dano_mult: 1, msg: "🐉 Vyraxis abre seus olhos após séculos dormindo." },
          { nome: "Fase 2 — Testando", hp_pct: 75, dano_mult: 1.5, msg: "⚠️ Vyraxis testa sua força!" },
          { nome: "Fase 3 — Dracônico", hp_pct: 50, dano_mult: 2.2, msg: "🔥 O poder dracônico se manifesta!" },
          { nome: "Fase 4 — Vida Absoluta", hp_pct: 25, dano_mult: 3, msg: "💚 Vyraxis canaliza a energia da vida!" },
          { nome: "Fase 5 — Dragão Eterno", hp_pct: 10, dano_mult: 5, msg: "🌟 Vyraxis — eterno, invencível, absoluto!" }
        ]
      },
      {
        nome: "🐺 Devorador Guardião",
        hp: 50183, dano: [1756,2911], xp: 20073, moedas: [10037,19070],
        drop: "Relíquia de Guardião",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Wyrm",
        hp: 54277, dano: [1900,3148], xp: 21711, moedas: [10855,20625],
        drop: "Relíquia de Wyrm",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Serafim",
        hp: 59387, dano: [2079,3444], xp: 23755, moedas: [11877,22567],
        drop: "Relíquia de Serafim",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Fênix",
        hp: 63808, dano: [2233,3701], xp: 25523, moedas: [12762,24247],
        drop: "Relíquia de Fênix",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Titã",
        hp: 69308, dano: [2426,4020], xp: 27723, moedas: [13862,26337],
        drop: "Relíquia de Titã",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Dragão",
        hp: 74054, dano: [2592,4295], xp: 29622, moedas: [14811,28141],
        drop: "Relíquia de Dragão",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Protetor",
        hp: 79941, dano: [2798,4637], xp: 31976, moedas: [15988,30378],
        drop: "Relíquia de Protetor",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "sagrado",
    comerciante: "Guardião Dravos"
  },
  mata_espiritos: {
    nome: "👻 Mata dos Espíritos", nivel_min: 20, nivel_max: 35,
    descricao: "Almas perdidas vagam aqui pela eternidade.",
    monstros: [
      { nome: "Espírito Errante", hp: [150,220], dano: [28,55], xp: [80,130], moedas: [40,80] },
      { nome: "Fantasma Vingativo", hp: [160,240], dano: [30,60], xp: [85,140], moedas: [43,85] },
      { nome: "Poltergeist", hp: [140,210], dano: [26,52], xp: [75,125], moedas: [38,75] },
      { nome: "Alma Perdida", hp: [130,200], dano: [24,48], xp: [70,120], moedas: [35,70] },
      { nome: "Demônio Menor", hp: [170,250], dano: [32,64], xp: [90,150], moedas: [45,90] },
      { nome: "Wraith Ancião", hp: [180,260], dano: [34,68], xp: [95,160], moedas: [48,95] },
      { nome: "Eco Faminta", hp: [87,216], dano: [16,60], xp: [39,140], moedas: [19,82] },
      { nome: "Eco Vingativo", hp: [87,216], dano: [16,60], xp: [39,140], moedas: [19,82] },
      { nome: "Fantasma Errante", hp: [93,232], dano: [17,65], xp: [42,151], moedas: [20,88] },
      { nome: "Alma das Névoas", hp: [93,232], dano: [17,65], xp: [42,151], moedas: [20,88] },
      { nome: "Wraith das Névoas", hp: [93,232], dano: [17,65], xp: [42,151], moedas: [20,88] },
      { nome: "Aparição Zombeteiro", hp: [99,248], dano: [18,69], xp: [45,161], moedas: [22,94] },
      { nome: "Wraith Esquecido", hp: [99,248], dano: [18,69], xp: [45,161], moedas: [22,94] },
      { nome: "Sombra das Névoas", hp: [99,248], dano: [18,69], xp: [45,161], moedas: [22,94] },
      { nome: "Wraith Vingativo", hp: [99,248], dano: [18,69], xp: [45,161], moedas: [22,94] },
      { nome: "Aparição Perdida", hp: [106,265], dano: [19,74], xp: [48,172], moedas: [23,101] },
      { nome: "Wraith Chorosa", hp: [106,265], dano: [19,74], xp: [48,172], moedas: [23,101] },
      { nome: "Fantasma Chorosa", hp: [106,265], dano: [19,74], xp: [48,172], moedas: [23,101] },
      { nome: "Poltergeist Vingativo", hp: [112,281], dano: [20,79], xp: [50,183], moedas: [25,107] },
      { nome: "Demônio Vingativo", hp: [112,281], dano: [20,79], xp: [50,183], moedas: [25,107] },
      { nome: "Eco Errante", hp: [112,281], dano: [20,79], xp: [50,183], moedas: [25,107] },
      { nome: "Eco Perdida", hp: [119,298], dano: [21,83], xp: [54,194], moedas: [26,113] },
      { nome: "Demônio das Névoas", hp: [119,298], dano: [21,83], xp: [54,194], moedas: [26,113] },
      { nome: "Demônio Zombeteiro", hp: [119,298], dano: [21,83], xp: [54,194], moedas: [26,113] },
      { nome: "Espírito Zombeteiro", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Espírito Esquecido", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Wraith Perdida", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Poltergeist Errante", hp: [126,315], dano: [23,88], xp: [57,205], moedas: [28,120] },
      { nome: "Aparição Menor", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Demônio Chorosa", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Sussurro das Névoas", hp: [133,333], dano: [24,93], xp: [60,216], moedas: [29,127] },
      { nome: "Aparição Esquecido", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] },
      { nome: "Alma Zombeteiro", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] },
      { nome: "Fantasma Esquecido", hp: [140,351], dano: [25,98], xp: [63,228], moedas: [31,133] },
      { nome: "Demônio Ancião", hp: [148,369], dano: [27,103], xp: [67,240], moedas: [33,140] },
      { nome: "Sussurro Perdida", hp: [148,369], dano: [27,103], xp: [67,240], moedas: [33,140] },
      { nome: "Demônio Esquecido", hp: [148,369], dano: [27,103], xp: [67,240], moedas: [33,140] },
      { nome: "Alma Menor", hp: [148,369], dano: [27,103], xp: [67,240], moedas: [33,140] },
      { nome: "Poltergeist Esquecido", hp: [155,387], dano: [28,108], xp: [70,252], moedas: [34,147] },
      { nome: "Eco Ancião", hp: [155,387], dano: [28,108], xp: [70,252], moedas: [34,147] },
      { nome: "Fantasma Menor", hp: [155,387], dano: [28,108], xp: [70,252], moedas: [34,147] },
      { nome: "Poltergeist Faminta", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Sussurro Faminta", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Sombra Menor", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Fantasma Ancião", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Sussurro Errante", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Fantasma das Névoas", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Wraith Errante", hp: [178,444], dano: [32,124], xp: [80,289], moedas: [39,169] },
      { nome: "Eco Zombeteiro", hp: [178,444], dano: [32,124], xp: [80,289], moedas: [39,169] },
      { nome: "Espírito das Névoas", hp: [178,444], dano: [32,124], xp: [80,289], moedas: [39,169] }
    ],
    bosses: [
      {
        nome: "👻 Banshee Rainha",
        hp: 4000, dano: [80,130], xp: 1400, moedas: [550,950],
        drop: "Véu da Banshee",
        fases: [
          { nome: "Fase 1 — Lamentando", hp_pct: 100, dano_mult: 1, msg: "A Banshee chora. Você sente frio..." },
          { nome: "Fase 2 — Gritando", hp_pct: 55, dano_mult: 1.7, msg: "⚠️ O grito da Banshee paralisa!" },
          { nome: "Fase 3 — Possessão em Massa", hp_pct: 20, dano_mult: 2.4, msg: "💀 Almas tentam possuir você!" }
        ]
      },
      {
        nome: "🌀 Vórtice de Almas",
        hp: 6000, dano: [100,160], xp: 2000, moedas: [800,1400],
        drop: "Essência do Vórtice",
        fases: [
          { nome: "Fase 1 — Girando", hp_pct: 100, dano_mult: 1, msg: "O Vórtice suga tudo ao redor." },
          { nome: "Fase 2 — Acelerando", hp_pct: 60, dano_mult: 1.8, msg: "⚠️ O Vórtice gira mais rápido!" },
          { nome: "Fase 3 — Implosão", hp_pct: 25, dano_mult: 2.6, msg: "💥 O Vórtice implode violentamente!" }
        ]
      },
      {
        nome: "👑 Mãe dos Espíritos",
        hp: 9000, dano: [130,200], xp: 3000, moedas: [1200,2000],
        drop: "Alma da Mãe",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Maternal", hp_pct: 100, dano_mult: 1, msg: "A Mãe dos Espíritos olha para você com pena." },
          { nome: "Fase 2 — Protetora", hp_pct: 60, dano_mult: 1.7, msg: "⚠️ Ela chama todos os espíritos!" },
          { nome: "Fase 3 — Ira Materna", hp_pct: 30, dano_mult: 2.3, msg: "👻 A fúria de uma mãe não tem limites!" },
          { nome: "Fase 4 — Transcendência", hp_pct: 10, dano_mult: 3.5, msg: "✨ A Mãe transcende para além da morte!" }
        ]
      },
      {
        nome: "🐺 Devorador Alma",
        hp: 2783, dano: [97,161], xp: 1113, moedas: [557,1058],
        drop: "Relíquia de Alma",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Demônio",
        hp: 3215, dano: [113,186], xp: 1286, moedas: [643,1222],
        drop: "Relíquia de Demônio",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Wraith",
        hp: 3442, dano: [120,200], xp: 1377, moedas: [688,1308],
        drop: "Relíquia de Wraith",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Sombra",
        hp: 3917, dano: [137,227], xp: 1567, moedas: [783,1488],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Aparição",
        hp: 4420, dano: [155,256], xp: 1768, moedas: [884,1680],
        drop: "Relíquia de Aparição",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Eco",
        hp: 4682, dano: [164,272], xp: 1873, moedas: [936,1779],
        drop: "Relíquia de Eco",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Sussurro",
        hp: 5228, dano: [183,303], xp: 2091, moedas: [1046,1987],
        drop: "Relíquia de Sussurro",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "nevoa",
    comerciante: "Xamã Ithel"
  },
  ruinas_aelthar: {
    nome: "🏛️ Ruínas de Aelthar", nivel_min: 40, nivel_max: 60,
    descricao: "Os restos de uma civilização perdida, guardados por autômatos antigos.",
    monstros: [
      { nome: "Espírito Aelthariano", hp: [234,585], dano: [42,164], xp: [105,380], moedas: [51,222] },
      { nome: "Espírito Enferrujado", hp: [234,585], dano: [42,164], xp: [105,380], moedas: [51,222] },
      { nome: "Sacerdote Rúnico", hp: [243,606], dano: [44,170], xp: [109,394], moedas: [53,230] },
      { nome: "Sombra Corrompido", hp: [243,606], dano: [44,170], xp: [109,394], moedas: [53,230] },
      { nome: "Guardião Aelthariano", hp: [251,628], dano: [45,176], xp: [113,408], moedas: [55,239] },
      { nome: "Sombra Enferrujado", hp: [251,628], dano: [45,176], xp: [113,408], moedas: [55,239] },
      { nome: "Autômato Antigo", hp: [251,628], dano: [45,176], xp: [113,408], moedas: [55,239] },
      { nome: "Esqueleto Ancestral", hp: [260,649], dano: [47,182], xp: [117,422], moedas: [57,247] },
      { nome: "Sombra Antigo", hp: [260,649], dano: [47,182], xp: [117,422], moedas: [57,247] },
      { nome: "Zumbi Aelthariano", hp: [268,671], dano: [48,188], xp: [121,436], moedas: [59,255] },
      { nome: "Guardião Ancestral", hp: [268,671], dano: [48,188], xp: [121,436], moedas: [59,255] },
      { nome: "Estátua de Pedra", hp: [268,671], dano: [48,188], xp: [121,436], moedas: [59,255] },
      { nome: "Autômato Ancestral", hp: [277,693], dano: [50,194], xp: [125,450], moedas: [61,263] },
      { nome: "Sacerdote Aelthariano", hp: [277,693], dano: [50,194], xp: [125,450], moedas: [61,263] },
      { nome: "Gárgula Antigo", hp: [286,715], dano: [51,200], xp: [129,465], moedas: [63,272] },
      { nome: "Espírito Rúnico", hp: [286,715], dano: [51,200], xp: [129,465], moedas: [63,272] },
      { nome: "Guardião das Ruínas", hp: [295,738], dano: [53,207], xp: [133,480], moedas: [65,280] },
      { nome: "Sacerdote Corrompido", hp: [295,738], dano: [53,207], xp: [133,480], moedas: [65,280] },
      { nome: "Zumbi Enferrujado", hp: [295,738], dano: [53,207], xp: [133,480], moedas: [65,280] },
      { nome: "Gárgula das Ruínas", hp: [304,760], dano: [55,213], xp: [137,494], moedas: [67,289] },
      { nome: "Esqueleto das Ruínas", hp: [304,760], dano: [55,213], xp: [137,494], moedas: [67,289] },
      { nome: "Zumbi das Ruínas", hp: [313,783], dano: [56,219], xp: [141,509], moedas: [69,298] },
      { nome: "Estátua das Ruínas", hp: [313,783], dano: [56,219], xp: [141,509], moedas: [69,298] },
      { nome: "Zumbi Antigo", hp: [313,783], dano: [56,219], xp: [141,509], moedas: [69,298] },
      { nome: "Sombra de Pedra", hp: [322,806], dano: [58,226], xp: [145,524], moedas: [71,306] },
      { nome: "Sacerdote das Ruínas", hp: [322,806], dano: [58,226], xp: [145,524], moedas: [71,306] },
      { nome: "Golem Antigo", hp: [332,829], dano: [60,232], xp: [149,539], moedas: [73,315] },
      { nome: "Estátua Rúnico", hp: [332,829], dano: [60,232], xp: [149,539], moedas: [73,315] },
      { nome: "Sombra Viva", hp: [332,829], dano: [60,232], xp: [149,539], moedas: [73,315] },
      { nome: "Zumbi Ancestral", hp: [341,853], dano: [61,239], xp: [153,554], moedas: [75,324] },
      { nome: "Sombra Rúnico", hp: [341,853], dano: [61,239], xp: [153,554], moedas: [75,324] },
      { nome: "Guardião de Pedra", hp: [351,876], dano: [63,245], xp: [158,569], moedas: [77,333] },
      { nome: "Espírito Ancestral", hp: [351,876], dano: [63,245], xp: [158,569], moedas: [77,333] },
      { nome: "Autômato de Pedra", hp: [351,876], dano: [63,245], xp: [158,569], moedas: [77,333] },
      { nome: "Espírito de Pedra", hp: [360,900], dano: [65,252], xp: [162,585], moedas: [79,342] },
      { nome: "Espírito das Ruínas", hp: [360,900], dano: [65,252], xp: [162,585], moedas: [79,342] },
      { nome: "Zumbi de Pedra", hp: [370,924], dano: [67,259], xp: [166,601], moedas: [81,351] },
      { nome: "Golem Viva", hp: [370,924], dano: [67,259], xp: [166,601], moedas: [81,351] },
      { nome: "Espírito Corrompido", hp: [379,948], dano: [68,265], xp: [171,616], moedas: [83,360] },
      { nome: "Sacerdote Ancestral", hp: [379,948], dano: [68,265], xp: [171,616], moedas: [83,360] },
      { nome: "Zumbi Corrompido", hp: [379,948], dano: [68,265], xp: [171,616], moedas: [83,360] },
      { nome: "Autômato Corrompido", hp: [389,973], dano: [70,272], xp: [175,632], moedas: [86,370] },
      { nome: "Autômato Viva", hp: [389,973], dano: [70,272], xp: [175,632], moedas: [86,370] },
      { nome: "Gárgula de Pedra", hp: [399,997], dano: [72,279], xp: [180,648], moedas: [88,379] },
      { nome: "Autômato Enferrujado", hp: [399,997], dano: [72,279], xp: [180,648], moedas: [88,379] },
      { nome: "Golem Ancestral", hp: [399,997], dano: [72,279], xp: [180,648], moedas: [88,379] },
      { nome: "Sacerdote Viva", hp: [409,1022], dano: [74,286], xp: [184,664], moedas: [90,388] },
      { nome: "Autômato Aelthariano", hp: [409,1022], dano: [74,286], xp: [184,664], moedas: [90,388] },
      { nome: "Esqueleto Corrompido", hp: [419,1047], dano: [75,293], xp: [189,681], moedas: [92,398] },
      { nome: "Estátua Corrompido", hp: [419,1047], dano: [75,293], xp: [189,681], moedas: [92,398] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Guardião",
        hp: 6715, dano: [235,389], xp: 2686, moedas: [1343,2552],
        drop: "Relíquia de Guardião",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Estátua",
        hp: 7358, dano: [258,427], xp: 2943, moedas: [1472,2796],
        drop: "Relíquia de Estátua",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Espírito",
        hp: 8028, dano: [281,466], xp: 3211, moedas: [1606,3051],
        drop: "Relíquia de Espírito",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Golem",
        hp: 9084, dano: [318,527], xp: 3634, moedas: [1817,3452],
        drop: "Relíquia de Golem",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Zumbi",
        hp: 9822, dano: [344,570], xp: 3929, moedas: [1964,3732],
        drop: "Relíquia de Zumbi",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Esqueleto",
        hp: 10587, dano: [371,614], xp: 4235, moedas: [2117,4023],
        drop: "Relíquia de Esqueleto",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Gárgula",
        hp: 11378, dano: [398,660], xp: 4551, moedas: [2276,4324],
        drop: "Relíquia de Gárgula",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Sacerdote",
        hp: 12615, dano: [442,732], xp: 5046, moedas: [2523,4794],
        drop: "Relíquia de Sacerdote",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Sombra",
        hp: 13472, dano: [472,781], xp: 5389, moedas: [2694,5119],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Autômato",
        hp: 14356, dano: [502,833], xp: 5742, moedas: [2871,5455],
        drop: "Relíquia de Autômato",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Arqueólogo Temmin"
  },
  deserto_aresh: {
    nome: "🏜️ Deserto de Aresh", nivel_min: 30, nivel_max: 50,
    descricao: "Um deserto sem fim onde o calor mata antes dos monstros.",
    monstros: [
      { nome: "Escorpião Gigante", hp: [200,300], dano: [40,80], xp: [100,170], moedas: [50,100] },
      { nome: "Múmia Guerreira", hp: [220,320], dano: [42,85], xp: [105,178], moedas: [53,105] },
      { nome: "Djinn do Deserto", hp: [240,350], dano: [45,90], xp: [110,185], moedas: [55,110] },
      { nome: "Elemental de Areia", hp: [180,280], dano: [38,75], xp: [95,160], moedas: [48,95] },
      { nome: "Cobra Gigante", hp: [210,310], dano: [41,82], xp: [102,172], moedas: [51,102] },
      { nome: "Ladrão do Deserto", hp: [190,290], dano: [39,78], xp: [98,165], moedas: [49,98] },
      { nome: "Cobra das Dunas", hp: [155,387], dano: [28,108], xp: [70,252], moedas: [34,147] },
      { nome: "Nômade Gigante", hp: [155,387], dano: [28,108], xp: [70,252], moedas: [34,147] },
      { nome: "Basilisco das Dunas", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Djinn de Areia", hp: [162,406], dano: [29,114], xp: [73,264], moedas: [36,154] },
      { nome: "Nômade das Dunas", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Cobra do Deserto", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Ladrão Guerreira", hp: [170,425], dano: [31,119], xp: [76,276], moedas: [37,162] },
      { nome: "Cobra Guerreira", hp: [178,444], dano: [32,124], xp: [80,289], moedas: [39,169] },
      { nome: "Chacal do Deserto", hp: [178,444], dano: [32,124], xp: [80,289], moedas: [39,169] },
      { nome: "Escorpião do Deserto", hp: [185,463], dano: [33,130], xp: [83,301], moedas: [41,176] },
      { nome: "Basilisco Guerreira", hp: [185,463], dano: [33,130], xp: [83,301], moedas: [41,176] },
      { nome: "Ladrão Gigante", hp: [185,463], dano: [33,130], xp: [83,301], moedas: [41,176] },
      { nome: "Ladrão Amaldiçoado", hp: [193,483], dano: [35,135], xp: [87,314], moedas: [42,184] },
      { nome: "Abutre das Dunas", hp: [193,483], dano: [35,135], xp: [87,314], moedas: [42,184] },
      { nome: "Cobra de Areia", hp: [201,503], dano: [36,141], xp: [90,327], moedas: [44,191] },
      { nome: "Nômade do Deserto", hp: [201,503], dano: [36,141], xp: [90,327], moedas: [44,191] },
      { nome: "Múmia Gigante", hp: [209,523], dano: [38,146], xp: [94,340], moedas: [46,199] },
      { nome: "Nômade Faminto", hp: [209,523], dano: [38,146], xp: [94,340], moedas: [46,199] },
      { nome: "Múmia de Areia", hp: [209,523], dano: [38,146], xp: [94,340], moedas: [46,199] },
      { nome: "Chacal Guerreira", hp: [217,544], dano: [39,152], xp: [98,354], moedas: [48,207] },
      { nome: "Ladrão de Areia", hp: [217,544], dano: [39,152], xp: [98,354], moedas: [48,207] },
      { nome: "Escorpião Amaldiçoado", hp: [226,564], dano: [41,158], xp: [102,367], moedas: [50,214] },
      { nome: "Abutre de Areia", hp: [226,564], dano: [41,158], xp: [102,367], moedas: [50,214] },
      { nome: "Chacal das Dunas", hp: [226,564], dano: [41,158], xp: [102,367], moedas: [50,214] },
      { nome: "Djinn Amaldiçoado", hp: [234,585], dano: [42,164], xp: [105,380], moedas: [51,222] },
      { nome: "Basilisco do Deserto", hp: [234,585], dano: [42,164], xp: [105,380], moedas: [51,222] },
      { nome: "Basilisco de Areia", hp: [243,606], dano: [44,170], xp: [109,394], moedas: [53,230] },
      { nome: "Nômade de Areia", hp: [243,606], dano: [44,170], xp: [109,394], moedas: [53,230] },
      { nome: "Abutre Amaldiçoado", hp: [243,606], dano: [44,170], xp: [109,394], moedas: [53,230] },
      { nome: "Abutre Gigante", hp: [251,628], dano: [45,176], xp: [113,408], moedas: [55,239] },
      { nome: "Abutre Faminto", hp: [251,628], dano: [45,176], xp: [113,408], moedas: [55,239] },
      { nome: "Nômade Guerreira", hp: [260,649], dano: [47,182], xp: [117,422], moedas: [57,247] },
      { nome: "Basilisco Gigante", hp: [260,649], dano: [47,182], xp: [117,422], moedas: [57,247] },
      { nome: "Chacal Gigante", hp: [260,649], dano: [47,182], xp: [117,422], moedas: [57,247] },
      { nome: "Djinn Guerreira", hp: [268,671], dano: [48,188], xp: [121,436], moedas: [59,255] },
      { nome: "Cobra Faminto", hp: [268,671], dano: [48,188], xp: [121,436], moedas: [59,255] },
      { nome: "Múmia Amaldiçoado", hp: [277,693], dano: [50,194], xp: [125,450], moedas: [61,263] },
      { nome: "Escorpião de Areia", hp: [277,693], dano: [50,194], xp: [125,450], moedas: [61,263] },
      { nome: "Cobra Amaldiçoado", hp: [286,715], dano: [51,200], xp: [129,465], moedas: [63,272] },
      { nome: "Elemental do Deserto", hp: [286,715], dano: [51,200], xp: [129,465], moedas: [63,272] },
      { nome: "Múmia do Deserto", hp: [286,715], dano: [51,200], xp: [129,465], moedas: [63,272] },
      { nome: "Djinn Gigante", hp: [295,738], dano: [53,207], xp: [133,480], moedas: [65,280] },
      { nome: "Escorpião Faminto", hp: [295,738], dano: [53,207], xp: [133,480], moedas: [65,280] },
      { nome: "Djinn Faminto", hp: [304,760], dano: [55,213], xp: [137,494], moedas: [67,289] }
    ],
    bosses: [
      {
        nome: "🦂 Senhor dos Escorpiões",
        hp: 6000, dano: [100,160], xp: 2000, moedas: [800,1400],
        drop: "Ferrão do Senhor",
        fases: [
          { nome: "Fase 1 — Caçando", hp_pct: 100, dano_mult: 1, msg: "O Senhor dos Escorpiões avança." },
          { nome: "Fase 2 — Veneno", hp_pct: 55, dano_mult: 1.8, msg: "☠️ Veneno mortal é injetado!" },
          { nome: "Fase 3 — Prole", hp_pct: 20, dano_mult: 2.4, msg: "🦂 Centenas de escorpiões surgem!" }
        ]
      },
      {
        nome: "🧞 Grande Djinn de Aresh",
        hp: 8500, dano: [130,200], xp: 3000, moedas: [1200,2000],
        drop: "Lamparina do Djinn",
        fases: [
          { nome: "Fase 1 — Ilusão", hp_pct: 100, dano_mult: 1, msg: "O Djinn cria ilusões para confundir." },
          { nome: "Fase 2 — Tempestade", hp_pct: 55, dano_mult: 1.7, msg: "🌪️ Tempestade de areia!" },
          { nome: "Fase 3 — Poder Real", hp_pct: 25, dano_mult: 2.5, msg: "⚡ O Djinn mostra seu poder real!" }
        ]
      },
      {
        nome: "👑 Faraó Imortal",
        hp: 14000, dano: [180,280], xp: 5000, moedas: [2000,3500],
        drop: "Amuleto do Faraó",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Soberano", hp_pct: 100, dano_mult: 1, msg: "O Faraó ergue seu cajado dourado." },
          { nome: "Fase 2 — Maldição", hp_pct: 65, dano_mult: 1.6, msg: "⚠️ Uma maldição antiga te atinge!" },
          { nome: "Fase 3 — Exército de Múmias", hp_pct: 40, dano_mult: 2, msg: "🧟 Múmias guerreiras surgem!" },
          { nome: "Fase 4 — Transcendência Divina", hp_pct: 15, dano_mult: 3, msg: "☀️ O Faraó se torna um deus mortal!" }
        ]
      },
      {
        nome: "🐺 Devorador Elemental",
        hp: 5802, dano: [203,337], xp: 2321, moedas: [1160,2205],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Cobra",
        hp: 6404, dano: [224,371], xp: 2562, moedas: [1281,2434],
        drop: "Relíquia de Cobra",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Ladrão",
        hp: 7033, dano: [246,408], xp: 2813, moedas: [1407,2673],
        drop: "Relíquia de Ladrão",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Abutre",
        hp: 7689, dano: [269,446], xp: 3076, moedas: [1538,2922],
        drop: "Relíquia de Abutre",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Nômade",
        hp: 8725, dano: [305,506], xp: 3490, moedas: [1745,3316],
        drop: "Relíquia de Nômade",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Basilisco",
        hp: 9450, dano: [331,548], xp: 3780, moedas: [1890,3591],
        drop: "Relíquia de Basilisco",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Chacal",
        hp: 10201, dano: [357,592], xp: 4080, moedas: [2040,3876],
        drop: "Relíquia de Chacal",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "calor",
    comerciante: "Mercador Kadar"
  },
  portal_mundos: {
    nome: "🌀 Portal dos Mundos", nivel_min: 120, nivel_max: 155,
    descricao: "Uma fenda na realidade onde criaturas de outros planos vazam para o nosso.",
    monstros: [
      { nome: "Aberração de Outro Mundo", hp: [1132,2831], dano: [204,793], xp: [509,1840], moedas: [249,1076] },
      { nome: "Ser de Realidade", hp: [1146,2865], dano: [206,802], xp: [516,1862], moedas: [252,1089] },
      { nome: "Aberração Instável", hp: [1146,2865], dano: [206,802], xp: [516,1862], moedas: [252,1089] },
      { nome: "Vórtice de Mundos", hp: [1160,2899], dano: [209,812], xp: [522,1884], moedas: [255,1102] },
      { nome: "Ser do Vazio", hp: [1173,2933], dano: [211,821], xp: [528,1906], moedas: [258,1115] },
      { nome: "Guardião do Portal", hp: [1187,2968], dano: [214,831], xp: [534,1929], moedas: [261,1128] },
      { nome: "Eco do Portal", hp: [1187,2968], dano: [214,831], xp: [534,1929], moedas: [261,1128] },
      { nome: "Fragmento Vivo", hp: [1201,3002], dano: [216,841], xp: [540,1951], moedas: [264,1141] },
      { nome: "Fragmento Dimensional", hp: [1215,3037], dano: [219,850], xp: [547,1974], moedas: [267,1154] },
      { nome: "Fragmento de Mundos", hp: [1215,3037], dano: [219,850], xp: [547,1974], moedas: [267,1154] },
      { nome: "Sombra de Realidade", hp: [1228,3071], dano: [221,860], xp: [553,1996], moedas: [270,1167] },
      { nome: "Sombra de Outro Mundo", hp: [1242,3106], dano: [224,870], xp: [559,2019], moedas: [273,1180] },
      { nome: "Guardião Vivo", hp: [1256,3141], dano: [226,879], xp: [565,2042], moedas: [276,1194] },
      { nome: "Fragmento Instável", hp: [1256,3141], dano: [226,879], xp: [565,2042], moedas: [276,1194] },
      { nome: "Devorador Instável", hp: [1270,3176], dano: [229,889], xp: [572,2064], moedas: [279,1207] },
      { nome: "Vórtice Vivo", hp: [1284,3211], dano: [231,899], xp: [578,2087], moedas: [282,1220] },
      { nome: "Eco Dimensional", hp: [1284,3211], dano: [231,899], xp: [578,2087], moedas: [282,1220] },
      { nome: "Portal de Outro Mundo", hp: [1298,3246], dano: [234,909], xp: [584,2110], moedas: [286,1233] },
      { nome: "Guardião Dimensional", hp: [1313,3282], dano: [236,919], xp: [591,2133], moedas: [289,1247] },
      { nome: "Devorador do Vazio", hp: [1327,3317], dano: [239,929], xp: [597,2156], moedas: [292,1260] },
      { nome: "Aberração Dimensional", hp: [1327,3317], dano: [239,929], xp: [597,2156], moedas: [292,1260] },
      { nome: "Errante do Portal", hp: [1341,3353], dano: [241,939], xp: [603,2179], moedas: [295,1274] },
      { nome: "Portal Dimensional", hp: [1355,3388], dano: [244,949], xp: [610,2202], moedas: [298,1287] },
      { nome: "Errante de Realidade", hp: [1355,3388], dano: [244,949], xp: [610,2202], moedas: [298,1287] },
      { nome: "Ser de Outro Mundo", hp: [1370,3424], dano: [247,959], xp: [616,2226], moedas: [301,1301] },
      { nome: "Vórtice do Vazio", hp: [1384,3460], dano: [249,969], xp: [623,2249], moedas: [304,1315] },
      { nome: "Ser Dimensional", hp: [1398,3496], dano: [252,979], xp: [629,2272], moedas: [308,1328] },
      { nome: "Eco do Vazio", hp: [1398,3496], dano: [252,979], xp: [629,2272], moedas: [308,1328] },
      { nome: "Sombra do Portal", hp: [1413,3532], dano: [254,989], xp: [636,2296], moedas: [311,1342] },
      { nome: "Fragmento de Outro Mundo", hp: [1427,3568], dano: [257,999], xp: [642,2319], moedas: [314,1356] },
      { nome: "Errante Instável", hp: [1427,3568], dano: [257,999], xp: [642,2319], moedas: [314,1356] },
      { nome: "Errante de Outro Mundo", hp: [1442,3605], dano: [260,1009], xp: [649,2343], moedas: [317,1370] },
      { nome: "Fragmento do Vazio", hp: [1457,3641], dano: [262,1019], xp: [656,2367], moedas: [321,1384] },
      { nome: "Vórtice Dimensional", hp: [1471,3678], dano: [265,1030], xp: [662,2391], moedas: [324,1398] },
      { nome: "Devorador Dimensional", hp: [1471,3678], dano: [265,1030], xp: [662,2391], moedas: [324,1398] },
      { nome: "Errante de Mundos", hp: [1486,3715], dano: [267,1040], xp: [669,2415], moedas: [327,1412] },
      { nome: "Eco de Mundos", hp: [1501,3751], dano: [270,1050], xp: [675,2438], moedas: [330,1425] },
      { nome: "Errante Vivo", hp: [1501,3751], dano: [270,1050], xp: [675,2438], moedas: [330,1425] },
      { nome: "Devorador de Mundos", hp: [1515,3788], dano: [273,1061], xp: [682,2462], moedas: [333,1439] },
      { nome: "Vórtice do Portal", hp: [1530,3825], dano: [275,1071], xp: [688,2486], moedas: [337,1454] },
      { nome: "Eco Instável", hp: [1545,3863], dano: [278,1082], xp: [695,2511], moedas: [340,1468] },
      { nome: "Eco de Realidade", hp: [1545,3863], dano: [278,1082], xp: [695,2511], moedas: [340,1468] },
      { nome: "Sombra Instável", hp: [1560,3900], dano: [281,1092], xp: [702,2535], moedas: [343,1482] },
      { nome: "Devorador de Outro Mundo", hp: [1575,3937], dano: [284,1102], xp: [709,2559], moedas: [346,1496] },
      { nome: "Devorador de Realidade", hp: [1575,3937], dano: [284,1102], xp: [709,2559], moedas: [346,1496] },
      { nome: "Ser do Portal", hp: [1590,3975], dano: [286,1113], xp: [716,2584], moedas: [350,1510] },
      { nome: "Sombra Vivo", hp: [1605,4012], dano: [289,1123], xp: [722,2608], moedas: [353,1525] },
      { nome: "Portal do Portal", hp: [1620,4050], dano: [292,1134], xp: [729,2632], moedas: [356,1539] },
      { nome: "Fragmento do Portal", hp: [1620,4050], dano: [292,1134], xp: [729,2632], moedas: [356,1539] },
      { nome: "Portal Instável", hp: [1635,4088], dano: [294,1145], xp: [736,2657], moedas: [360,1553] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Aberração",
        hp: 52621, dano: [1842,3052], xp: 21048, moedas: [10524,19996],
        drop: "Relíquia de Aberração",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Vórtice",
        hp: 55956, dano: [1958,3245], xp: 22382, moedas: [11191,21263],
        drop: "Relíquia de Vórtice",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Ser",
        hp: 59387, dano: [2079,3444], xp: 23755, moedas: [11877,22567],
        drop: "Relíquia de Ser",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Sombra",
        hp: 62912, dano: [2202,3649], xp: 25165, moedas: [12582,23907],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Guardião",
        hp: 66532, dano: [2329,3859], xp: 26613, moedas: [13306,25282],
        drop: "Relíquia de Guardião",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Fragmento",
        hp: 69308, dano: [2426,4020], xp: 27723, moedas: [13862,26337],
        drop: "Relíquia de Fragmento",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Eco",
        hp: 73093, dano: [2558,4239], xp: 29237, moedas: [14619,27775],
        drop: "Relíquia de Eco",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Devorador",
        hp: 76971, dano: [2694,4464], xp: 30788, moedas: [15394,29249],
        drop: "Relíquia de Devorador",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Errante",
        hp: 80943, dano: [2833,4695], xp: 32377, moedas: [16189,30758],
        drop: "Relíquia de Errante",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Portal",
        hp: 85008, dano: [2975,4930], xp: 34003, moedas: [17002,32303],
        drop: "Relíquia de Portal",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "caotico",
    comerciante: "Andarilho Zael"
  },
  dunas_esquecimento: {
    nome: "🏜️ Dunas do Esquecimento", nivel_min: 45, nivel_max: 65,
    descricao: "Areias negras que engolem tudo — e todos — que nelas se perdem.",
    monstros: [
      { nome: "Elemental das Dunas Mortas", hp: [277,693], dano: [50,194], xp: [125,450], moedas: [61,263] },
      { nome: "Nômade do Esquecimento", hp: [277,693], dano: [50,194], xp: [125,450], moedas: [61,263] },
      { nome: "Espectro Esquecido", hp: [286,715], dano: [51,200], xp: [129,465], moedas: [63,272] },
      { nome: "Nômade Enterrado", hp: [286,715], dano: [51,200], xp: [129,465], moedas: [63,272] },
      { nome: "Esqueleto Esquecido", hp: [295,738], dano: [53,207], xp: [133,480], moedas: [65,280] },
      { nome: "Areia de Areia Negra", hp: [295,738], dano: [53,207], xp: [133,480], moedas: [65,280] },
      { nome: "Sombra das Dunas", hp: [295,738], dano: [53,207], xp: [133,480], moedas: [65,280] },
      { nome: "Fantasma Esquecido", hp: [304,760], dano: [55,213], xp: [137,494], moedas: [67,289] },
      { nome: "Elemental do Esquecimento", hp: [304,760], dano: [55,213], xp: [137,494], moedas: [67,289] },
      { nome: "Esqueleto Enterrado", hp: [313,783], dano: [56,219], xp: [141,509], moedas: [69,298] },
      { nome: "Djinn Esquecido", hp: [313,783], dano: [56,219], xp: [141,509], moedas: [69,298] },
      { nome: "Guardião das Dunas", hp: [313,783], dano: [56,219], xp: [141,509], moedas: [69,298] },
      { nome: "Sombra das Dunas Mortas", hp: [322,806], dano: [58,226], xp: [145,524], moedas: [71,306] },
      { nome: "Fantasma Amaldiçoada", hp: [322,806], dano: [58,226], xp: [145,524], moedas: [71,306] },
      { nome: "Esqueleto de Areia Negra", hp: [332,829], dano: [60,232], xp: [149,539], moedas: [73,315] },
      { nome: "Fantasma das Dunas", hp: [332,829], dano: [60,232], xp: [149,539], moedas: [73,315] },
      { nome: "Múmia das Dunas", hp: [341,853], dano: [61,239], xp: [153,554], moedas: [75,324] },
      { nome: "Nômade de Areia Negra", hp: [341,853], dano: [61,239], xp: [153,554], moedas: [75,324] },
      { nome: "Djinn Amaldiçoada", hp: [341,853], dano: [61,239], xp: [153,554], moedas: [75,324] },
      { nome: "Djinn das Dunas", hp: [351,876], dano: [63,245], xp: [158,569], moedas: [77,333] },
      { nome: "Fantasma de Areia Negra", hp: [351,876], dano: [63,245], xp: [158,569], moedas: [77,333] },
      { nome: "Elemental Esquecido", hp: [360,900], dano: [65,252], xp: [162,585], moedas: [79,342] },
      { nome: "Esqueleto do Esquecimento", hp: [360,900], dano: [65,252], xp: [162,585], moedas: [79,342] },
      { nome: "Múmia Esquecido", hp: [360,900], dano: [65,252], xp: [162,585], moedas: [79,342] },
      { nome: "Guardião Enterrado", hp: [370,924], dano: [67,259], xp: [166,601], moedas: [81,351] },
      { nome: "Múmia Enterrado", hp: [370,924], dano: [67,259], xp: [166,601], moedas: [81,351] },
      { nome: "Sombra Perdido", hp: [379,948], dano: [68,265], xp: [171,616], moedas: [83,360] },
      { nome: "Múmia Perdido", hp: [379,948], dano: [68,265], xp: [171,616], moedas: [83,360] },
      { nome: "Nômade Esquecido", hp: [379,948], dano: [68,265], xp: [171,616], moedas: [83,360] },
      { nome: "Fantasma das Dunas Mortas", hp: [389,973], dano: [70,272], xp: [175,632], moedas: [86,370] },
      { nome: "Djinn das Dunas Mortas", hp: [389,973], dano: [70,272], xp: [175,632], moedas: [86,370] },
      { nome: "Esqueleto Perdido", hp: [399,997], dano: [72,279], xp: [180,648], moedas: [88,379] },
      { nome: "Areia Esquecido", hp: [399,997], dano: [72,279], xp: [180,648], moedas: [88,379] },
      { nome: "Areia Viva", hp: [399,997], dano: [72,279], xp: [180,648], moedas: [88,379] },
      { nome: "Nômade Viva", hp: [409,1022], dano: [74,286], xp: [184,664], moedas: [90,388] },
      { nome: "Espectro das Dunas Mortas", hp: [409,1022], dano: [74,286], xp: [184,664], moedas: [90,388] },
      { nome: "Sombra Amaldiçoada", hp: [419,1047], dano: [75,293], xp: [189,681], moedas: [92,398] },
      { nome: "Guardião Perdido", hp: [419,1047], dano: [75,293], xp: [189,681], moedas: [92,398] },
      { nome: "Esqueleto Amaldiçoada", hp: [429,1072], dano: [77,300], xp: [193,697], moedas: [94,407] },
      { nome: "Elemental das Dunas", hp: [429,1072], dano: [77,300], xp: [193,697], moedas: [94,407] },
      { nome: "Djinn Perdido", hp: [429,1072], dano: [77,300], xp: [193,697], moedas: [94,407] },
      { nome: "Sombra de Areia Negra", hp: [439,1098], dano: [79,307], xp: [198,714], moedas: [97,417] },
      { nome: "Areia Enterrado", hp: [439,1098], dano: [79,307], xp: [198,714], moedas: [97,417] },
      { nome: "Sombra Esquecido", hp: [449,1123], dano: [81,314], xp: [202,730], moedas: [99,427] },
      { nome: "Areia das Dunas", hp: [449,1123], dano: [81,314], xp: [202,730], moedas: [99,427] },
      { nome: "Múmia Viva", hp: [449,1123], dano: [81,314], xp: [202,730], moedas: [99,427] },
      { nome: "Fantasma Enterrado", hp: [459,1149], dano: [83,322], xp: [207,747], moedas: [101,437] },
      { nome: "Esqueleto das Dunas Mortas", hp: [459,1149], dano: [83,322], xp: [207,747], moedas: [101,437] },
      { nome: "Elemental Enterrado", hp: [470,1175], dano: [85,329], xp: [212,764], moedas: [103,446] },
      { nome: "Fantasma do Esquecimento", hp: [470,1175], dano: [85,329], xp: [212,764], moedas: [103,446] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Fantasma",
        hp: 8373, dano: [293,486], xp: 3349, moedas: [1675,3182],
        drop: "Relíquia de Fantasma",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Múmia",
        hp: 9084, dano: [318,527], xp: 3634, moedas: [1817,3452],
        drop: "Relíquia de Múmia",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Elemental",
        hp: 9822, dano: [344,570], xp: 3929, moedas: [1964,3732],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Djinn",
        hp: 10979, dano: [384,637], xp: 4392, moedas: [2196,4172],
        drop: "Relíquia de Djinn",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Areia",
        hp: 11784, dano: [412,683], xp: 4714, moedas: [2357,4478],
        drop: "Relíquia de Areia",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Nômade",
        hp: 12615, dano: [442,732], xp: 5046, moedas: [2523,4794],
        drop: "Relíquia de Nômade",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Espectro",
        hp: 13472, dano: [472,781], xp: 5389, moedas: [2694,5119],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Sombra",
        hp: 14808, dano: [518,859], xp: 5923, moedas: [2962,5627],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Guardião",
        hp: 15730, dano: [551,912], xp: 6292, moedas: [3146,5977],
        drop: "Relíquia de Guardião",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Esqueleto",
        hp: 16679, dano: [584,967], xp: 6672, moedas: [3336,6338],
        drop: "Relíquia de Esqueleto",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Nômade Sahir"
  },
  valdris: {
    nome: "🏰 Valdris (Capital)", nivel_min: 1, nivel_max: 10,
    descricao: "A capital do IMPERIUS. Ponto de partida de todos os aventureiros.",
    monstros: [
      { nome: "Rato Gigante", hp: [20,40], dano: [3,8], xp: [10,20], moedas: [5,10] },
      { nome: "Bêbado Raivoso", hp: [30,50], dano: [5,12], xp: [15,25], moedas: [8,15] },
      { nome: "Ladrão de Rua", hp: [35,55], dano: [6,14], xp: [18,30], moedas: [10,20] },
      { nome: "Cão Selvagem", hp: [25,45], dano: [4,10], xp: [12,22], moedas: [6,12] },
      { nome: "Goblin Bêbado", hp: [40,60], dano: [7,15], xp: [20,35], moedas: [12,22] },
      { nome: "Guarda Corrompido", hp: [50,80], dano: [10,20], xp: [25,40], moedas: [15,28] },
      { nome: "Bêbado Bêbado da Taverna", hp: [5,10], dano: [1,3], xp: [5,6], moedas: [3,4] },
      { nome: "Cão Raivoso", hp: [5,10], dano: [1,3], xp: [5,6], moedas: [3,4] },
      { nome: "Batedor das Docas", hp: [5,10], dano: [1,3], xp: [5,6], moedas: [3,4] },
      { nome: "Cão Gigante", hp: [5,8], dano: [1,2], xp: [5,5], moedas: [3,3] },
      { nome: "Bêbado Gigante", hp: [5,8], dano: [1,2], xp: [5,5], moedas: [3,3] },
      { nome: "Contrabandista Gigante", hp: [5,8], dano: [1,2], xp: [5,5], moedas: [3,3] },
      { nome: "Arruaceiro Bêbado da Taverna", hp: [5,8], dano: [1,2], xp: [5,5], moedas: [3,3] },
      { nome: "Rato Sujo", hp: [5,8], dano: [1,2], xp: [5,5], moedas: [3,3] },
      { nome: "Bêbado das Docas", hp: [5,8], dano: [1,2], xp: [5,5], moedas: [3,3] },
      { nome: "Goblin Raivoso", hp: [6,14], dano: [1,4], xp: [5,9], moedas: [3,5] },
      { nome: "Arruaceiro Sujo", hp: [6,14], dano: [1,4], xp: [5,9], moedas: [3,5] },
      { nome: "Goblin Fujão", hp: [6,14], dano: [1,4], xp: [5,9], moedas: [3,5] },
      { nome: "Goblin Selvagem", hp: [6,14], dano: [1,4], xp: [5,9], moedas: [3,5] },
      { nome: "Miliciano Bêbado", hp: [6,14], dano: [1,4], xp: [5,9], moedas: [3,5] },
      { nome: "Goblin Bêbado da Taverna", hp: [9,21], dano: [2,6], xp: [5,14], moedas: [3,8] },
      { nome: "Goblin Faminto", hp: [9,21], dano: [2,6], xp: [5,14], moedas: [3,8] },
      { nome: "Rato Encapuzado", hp: [9,21], dano: [2,6], xp: [5,14], moedas: [3,8] },
      { nome: "Cão Bêbado da Taverna", hp: [9,21], dano: [2,6], xp: [5,14], moedas: [3,8] },
      { nome: "Arruaceiro Faminto", hp: [9,21], dano: [2,6], xp: [5,14], moedas: [3,8] },
      { nome: "Cão Fujão", hp: [9,21], dano: [2,6], xp: [5,14], moedas: [3,8] },
      { nome: "Ladrão Sujo", hp: [12,30], dano: [2,8], xp: [5,20], moedas: [3,11] },
      { nome: "Guarda de Rua", hp: [12,30], dano: [2,8], xp: [5,20], moedas: [3,11] },
      { nome: "Miliciano Gigante", hp: [12,30], dano: [2,8], xp: [5,20], moedas: [3,11] },
      { nome: "Contrabandista Bêbado da Taverna", hp: [12,30], dano: [2,8], xp: [5,20], moedas: [3,11] },
      { nome: "Miliciano Sujo", hp: [12,30], dano: [2,8], xp: [5,20], moedas: [3,11] },
      { nome: "Guarda Selvagem", hp: [15,38], dano: [3,11], xp: [7,25], moedas: [3,14] },
      { nome: "Goblin Gigante", hp: [15,38], dano: [3,11], xp: [7,25], moedas: [3,14] },
      { nome: "Guarda Bêbado", hp: [15,38], dano: [3,11], xp: [7,25], moedas: [3,14] },
      { nome: "Mendigo Raivoso", hp: [15,38], dano: [3,11], xp: [7,25], moedas: [3,14] },
      { nome: "Guarda Raivoso", hp: [15,38], dano: [3,11], xp: [7,25], moedas: [3,14] },
      { nome: "Miliciano das Docas", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Contrabandista das Docas", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Cão de Rua", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Bêbado Corrompido", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Batedor Corrompido", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Cão Bêbado", hp: [19,48], dano: [3,13], xp: [9,31], moedas: [4,18] },
      { nome: "Rato das Docas", hp: [23,58], dano: [4,16], xp: [10,38], moedas: [5,22] },
      { nome: "Bêbado Fujão", hp: [23,58], dano: [4,16], xp: [10,38], moedas: [5,22] },
      { nome: "Rato Corrompido", hp: [23,58], dano: [4,16], xp: [10,38], moedas: [5,22] },
      { nome: "Rato Bêbado", hp: [23,58], dano: [4,16], xp: [10,38], moedas: [5,22] },
      { nome: "Ladrão Bêbado", hp: [23,58], dano: [4,16], xp: [10,38], moedas: [5,22] },
      { nome: "Miliciano de Rua", hp: [28,69], dano: [5,19], xp: [13,45], moedas: [6,26] },
      { nome: "Mendigo de Rua", hp: [28,69], dano: [5,19], xp: [13,45], moedas: [6,26] },
      { nome: "Cão Encapuzado", hp: [28,69], dano: [5,19], xp: [13,45], moedas: [6,26] }
    ],
    bosses: [
      {
        nome: "🗡️ Capitão dos Guardas Corrompidos",
        hp: 500, dano: [20,35], xp: 200, moedas: [100,200],
        drop: "Espada do Capitão",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1, msg: "O Capitão ri de você. \"Mais um idiota.\"" },
          { nome: "Fase 2 — Furioso", hp_pct: 50, dano_mult: 1.5, msg: "⚠️ O Capitão perde a paciência! Dano aumentado!" },
          { nome: "Fase 3 — Desesperado", hp_pct: 20, dano_mult: 2, msg: "🔥 O Capitão entra em frenesi! PERIGO!" }
        ]
      },
      {
        nome: "🧙 Mago Negro de Valdris",
        hp: 800, dano: [25,45], xp: 350, moedas: [150,300],
        drop: "Tomo do Mago Negro",
        fases: [
          { nome: "Fase 1 — Calculando", hp_pct: 100, dano_mult: 1, msg: "O Mago analisa seus pontos fracos..." },
          { nome: "Fase 2 — Conjurando", hp_pct: 60, dano_mult: 1.6, msg: "⚠️ O Mago invoca escudos arcanos!" },
          { nome: "Fase 3 — Apocalipse", hp_pct: 25, dano_mult: 2.2, msg: "💥 O Mago canaliza toda sua magia!" }
        ]
      },
      {
        nome: "👑 Senhor das Sombras de Valdris",
        hp: 1200, dano: [35,60], xp: 600, moedas: [300,500],
        drop: "Coroa das Sombras",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Soberano", hp_pct: 100, dano_mult: 1, msg: "O Senhor das Sombras ergue sua coroa." },
          { nome: "Fase 2 — Irado", hp_pct: 55, dano_mult: 1.7, msg: "⚠️ As sombras se intensificam ao redor!" },
          { nome: "Fase 3 — Forma Sombria", hp_pct: 20, dano_mult: 2.5, msg: "🌑 O Senhor assume sua verdadeira forma!" }
        ]
      },
      {
        nome: "🐺 Devorador Cão",
        hp: 200, dano: [7,12], xp: 80, moedas: [40,76],
        drop: "Relíquia de Cão",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Goblin",
        hp: 200, dano: [7,12], xp: 80, moedas: [40,76],
        drop: "Relíquia de Goblin",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Guarda",
        hp: 200, dano: [7,12], xp: 80, moedas: [40,76],
        drop: "Relíquia de Guarda",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Mendigo",
        hp: 256, dano: [9,15], xp: 102, moedas: [51,97],
        drop: "Relíquia de Mendigo",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Batedor",
        hp: 329, dano: [12,19], xp: 132, moedas: [66,125],
        drop: "Relíquia de Batedor",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Espião",
        hp: 410, dano: [14,24], xp: 164, moedas: [82,156],
        drop: "Relíquia de Espião",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Arruaceiro",
        hp: 500, dano: [18,29], xp: 200, moedas: [100,190],
        drop: "Relíquia de Arruaceiro",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Mercador Aldric"
  },
  ilhas_marveth: {
    nome: "🏝️ Ilhas de Marveth", nivel_min: 130, nivel_max: 160,
    descricao: "Um arquipélago cercado por águas traiçoeiras e criaturas marinhas amaldiçoadas.",
    monstros: [
      { nome: "Pirata Marinha", hp: [1270,3176], dano: [229,889], xp: [572,2064], moedas: [279,1207] },
      { nome: "Naufrago Fantasma", hp: [1284,3211], dano: [231,899], xp: [578,2087], moedas: [282,1220] },
      { nome: "Elemental Amaldiçoada", hp: [1284,3211], dano: [231,899], xp: [578,2087], moedas: [282,1220] },
      { nome: "Serpente Amaldiçoada", hp: [1298,3246], dano: [234,909], xp: [584,2110], moedas: [286,1233] },
      { nome: "Pirata Errante", hp: [1298,3246], dano: [234,909], xp: [584,2110], moedas: [286,1233] },
      { nome: "Pirata Amaldiçoada", hp: [1313,3282], dano: [236,919], xp: [591,2133], moedas: [289,1247] },
      { nome: "Sereia da Água", hp: [1327,3317], dano: [239,929], xp: [597,2156], moedas: [292,1260] },
      { nome: "Naufrago Errante", hp: [1327,3317], dano: [239,929], xp: [597,2156], moedas: [292,1260] },
      { nome: "Elemental do Naufrágio", hp: [1341,3353], dano: [241,939], xp: [603,2179], moedas: [295,1274] },
      { nome: "Tubarão Amaldiçoada", hp: [1355,3388], dano: [244,949], xp: [610,2202], moedas: [298,1287] },
      { nome: "Sombra da Água", hp: [1355,3388], dano: [244,949], xp: [610,2202], moedas: [298,1287] },
      { nome: "Naufrago Amaldiçoada", hp: [1370,3424], dano: [247,959], xp: [616,2226], moedas: [301,1301] },
      { nome: "Serpente Gigante", hp: [1370,3424], dano: [247,959], xp: [616,2226], moedas: [301,1301] },
      { nome: "Tubarão Marinha", hp: [1384,3460], dano: [249,969], xp: [623,2249], moedas: [304,1315] },
      { nome: "Tritão da Água", hp: [1398,3496], dano: [252,979], xp: [629,2272], moedas: [308,1328] },
      { nome: "Tritão Gigante", hp: [1398,3496], dano: [252,979], xp: [629,2272], moedas: [308,1328] },
      { nome: "Tritão do Naufrágio", hp: [1413,3532], dano: [254,989], xp: [636,2296], moedas: [311,1342] },
      { nome: "Elemental da Água", hp: [1413,3532], dano: [254,989], xp: [636,2296], moedas: [311,1342] },
      { nome: "Sereia Fantasma", hp: [1427,3568], dano: [257,999], xp: [642,2319], moedas: [314,1356] },
      { nome: "Sombra Amaldiçoada", hp: [1442,3605], dano: [260,1009], xp: [649,2343], moedas: [317,1370] },
      { nome: "Kraken Gigante", hp: [1442,3605], dano: [260,1009], xp: [649,2343], moedas: [317,1370] },
      { nome: "Fantasma Amaldiçoada", hp: [1457,3641], dano: [262,1019], xp: [656,2367], moedas: [321,1384] },
      { nome: "Pirata da Água", hp: [1457,3641], dano: [262,1019], xp: [656,2367], moedas: [321,1384] },
      { nome: "Elemental Marinha", hp: [1471,3678], dano: [265,1030], xp: [662,2391], moedas: [324,1398] },
      { nome: "Naufrago Guerreiro", hp: [1486,3715], dano: [267,1040], xp: [669,2415], moedas: [327,1412] },
      { nome: "Elemental Fantasma", hp: [1486,3715], dano: [267,1040], xp: [669,2415], moedas: [327,1412] },
      { nome: "Naufrago do Naufrágio", hp: [1501,3751], dano: [270,1050], xp: [675,2438], moedas: [330,1425] },
      { nome: "Sombra Guerreiro", hp: [1515,3788], dano: [273,1061], xp: [682,2462], moedas: [333,1439] },
      { nome: "Elemental Menor", hp: [1515,3788], dano: [273,1061], xp: [682,2462], moedas: [333,1439] },
      { nome: "Naufrago Marinha", hp: [1530,3825], dano: [275,1071], xp: [688,2486], moedas: [337,1454] },
      { nome: "Sombra Gigante", hp: [1530,3825], dano: [275,1071], xp: [688,2486], moedas: [337,1454] },
      { nome: "Sereia Guerreiro", hp: [1545,3863], dano: [278,1082], xp: [695,2511], moedas: [340,1468] },
      { nome: "Serpente Marinha", hp: [1560,3900], dano: [281,1092], xp: [702,2535], moedas: [343,1482] },
      { nome: "Tritão Amaldiçoada", hp: [1560,3900], dano: [281,1092], xp: [702,2535], moedas: [343,1482] },
      { nome: "Sereia Marinha", hp: [1575,3937], dano: [284,1102], xp: [709,2559], moedas: [346,1496] },
      { nome: "Pirata Guerreiro", hp: [1575,3937], dano: [284,1102], xp: [709,2559], moedas: [346,1496] },
      { nome: "Fantasma Errante", hp: [1590,3975], dano: [286,1113], xp: [716,2584], moedas: [350,1510] },
      { nome: "Sereia Errante", hp: [1605,4012], dano: [289,1123], xp: [722,2608], moedas: [353,1525] },
      { nome: "Fantasma Gigante", hp: [1605,4012], dano: [289,1123], xp: [722,2608], moedas: [353,1525] },
      { nome: "Sereia Amaldiçoada", hp: [1620,4050], dano: [292,1134], xp: [729,2632], moedas: [356,1539] },
      { nome: "Pirata Fantasma", hp: [1620,4050], dano: [292,1134], xp: [729,2632], moedas: [356,1539] },
      { nome: "Pirata Menor", hp: [1635,4088], dano: [294,1145], xp: [736,2657], moedas: [360,1553] },
      { nome: "Tubarão do Naufrágio", hp: [1650,4126], dano: [297,1155], xp: [742,2682], moedas: [363,1568] },
      { nome: "Sombra Marinha", hp: [1650,4126], dano: [297,1155], xp: [742,2682], moedas: [363,1568] },
      { nome: "Sombra Fantasma", hp: [1665,4164], dano: [300,1166], xp: [749,2707], moedas: [366,1582] },
      { nome: "Kraken do Naufrágio", hp: [1681,4202], dano: [303,1177], xp: [756,2731], moedas: [370,1597] },
      { nome: "Sombra do Naufrágio", hp: [1681,4202], dano: [303,1177], xp: [756,2731], moedas: [370,1597] },
      { nome: "Elemental Gigante", hp: [1696,4240], dano: [305,1187], xp: [763,2756], moedas: [373,1611] },
      { nome: "Sereia Menor", hp: [1696,4240], dano: [305,1187], xp: [763,2756], moedas: [373,1611] },
      { nome: "Tritão Errante", hp: [1711,4278], dano: [308,1198], xp: [770,2781], moedas: [376,1626] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Sereia",
        hp: 61137, dano: [2140,3546], xp: 24455, moedas: [12227,23232],
        drop: "Relíquia de Sereia",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Kraken",
        hp: 63808, dano: [2233,3701], xp: 25523, moedas: [12762,24247],
        drop: "Relíquia de Kraken",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Pirata",
        hp: 67451, dano: [2361,3912], xp: 26980, moedas: [13490,25631],
        drop: "Relíquia de Pirata",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Elemental",
        hp: 70246, dano: [2459,4074], xp: 28098, moedas: [14049,26693],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Serpente",
        hp: 73093, dano: [2558,4239], xp: 29237, moedas: [14619,27775],
        drop: "Relíquia de Serpente",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Tritão",
        hp: 76971, dano: [2694,4464], xp: 30788, moedas: [15394,29249],
        drop: "Relíquia de Tritão",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Sombra",
        hp: 79941, dano: [2798,4637], xp: 31976, moedas: [15988,30378],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Fantasma",
        hp: 82964, dano: [2904,4812], xp: 33186, moedas: [16593,31526],
        drop: "Relíquia de Fantasma",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Tubarão",
        hp: 87075, dano: [3048,5050], xp: 34830, moedas: [17415,33088],
        drop: "Relíquia de Tubarão",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Naufrago",
        hp: 90219, dano: [3158,5233], xp: 36088, moedas: [18044,34283],
        drop: "Relíquia de Naufrago",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Capitã Merrow"
  },
  vulcao_ignareth: {
    nome: "🌋 Vulcão de Ignareth", nivel_min: 55, nivel_max: 75,
    descricao: "O vulcão mais ativo do IMPERIUS. Elementais de fogo dominam aqui.",
    monstros: [
      { nome: "Elemental de Fogo", hp: [400,600], dano: [80,150], xp: [200,340], moedas: [100,200] },
      { nome: "Salamandra Gigante", hp: [380,580], dano: [76,144], xp: [192,325], moedas: [96,192] },
      { nome: "Demônio do Fogo", hp: [420,630], dano: [84,158], xp: [210,357], moedas: [105,210] },
      { nome: "Golem de Lava", hp: [500,750], dano: [100,188], xp: [250,425], moedas: [125,250] },
      { nome: "Fênix Menor", hp: [360,540], dano: [72,136], xp: [180,306], moedas: [90,180] },
      { nome: "Drake de Chamas", hp: [440,660], dano: [88,165], xp: [220,374], moedas: [110,220] },
      { nome: "Gárgula Infernal", hp: [370,924], dano: [67,259], xp: [166,601], moedas: [81,351] },
      { nome: "Fênix Ardente", hp: [370,924], dano: [67,259], xp: [166,601], moedas: [81,351] },
      { nome: "Elemental de Obsidiana", hp: [379,948], dano: [68,265], xp: [171,616], moedas: [83,360] },
      { nome: "Golem Gigante", hp: [379,948], dano: [68,265], xp: [171,616], moedas: [83,360] },
      { nome: "Drake Menor", hp: [389,973], dano: [70,272], xp: [175,632], moedas: [86,370] },
      { nome: "Gárgula de Fogo", hp: [389,973], dano: [70,272], xp: [175,632], moedas: [86,370] },
      { nome: "Gárgula Ardente", hp: [389,973], dano: [70,272], xp: [175,632], moedas: [86,370] },
      { nome: "Salamandra de Lava", hp: [399,997], dano: [72,279], xp: [180,648], moedas: [88,379] },
      { nome: "Espectro Flamejante", hp: [399,997], dano: [72,279], xp: [180,648], moedas: [88,379] },
      { nome: "Salamandra do Fogo", hp: [409,1022], dano: [74,286], xp: [184,664], moedas: [90,388] },
      { nome: "Efrit Ardente", hp: [409,1022], dano: [74,286], xp: [184,664], moedas: [90,388] },
      { nome: "Cão Ardente", hp: [409,1022], dano: [74,286], xp: [184,664], moedas: [90,388] },
      { nome: "Espectro de Chamas", hp: [419,1047], dano: [75,293], xp: [189,681], moedas: [92,398] },
      { nome: "Fênix Flamejante", hp: [419,1047], dano: [75,293], xp: [189,681], moedas: [92,398] },
      { nome: "Demônio Gigante", hp: [429,1072], dano: [77,300], xp: [193,697], moedas: [94,407] },
      { nome: "Drake Ardente", hp: [429,1072], dano: [77,300], xp: [193,697], moedas: [94,407] },
      { nome: "Gárgula Gigante", hp: [439,1098], dano: [79,307], xp: [198,714], moedas: [97,417] },
      { nome: "Gárgula de Lava", hp: [439,1098], dano: [79,307], xp: [198,714], moedas: [97,417] },
      { nome: "Cão de Lava", hp: [439,1098], dano: [79,307], xp: [198,714], moedas: [97,417] },
      { nome: "Golem de Fogo", hp: [449,1123], dano: [81,314], xp: [202,730], moedas: [99,427] },
      { nome: "Elemental de Lava", hp: [449,1123], dano: [81,314], xp: [202,730], moedas: [99,427] },
      { nome: "Drake do Fogo", hp: [459,1149], dano: [83,322], xp: [207,747], moedas: [101,437] },
      { nome: "Cão do Fogo", hp: [459,1149], dano: [83,322], xp: [207,747], moedas: [101,437] },
      { nome: "Elemental do Fogo", hp: [459,1149], dano: [83,322], xp: [207,747], moedas: [101,437] },
      { nome: "Golem Menor", hp: [470,1175], dano: [85,329], xp: [212,764], moedas: [103,446] },
      { nome: "Demônio Menor", hp: [470,1175], dano: [85,329], xp: [212,764], moedas: [103,446] },
      { nome: "Fênix do Fogo", hp: [480,1201], dano: [86,336], xp: [216,781], moedas: [106,456] },
      { nome: "Cão Gigante", hp: [480,1201], dano: [86,336], xp: [216,781], moedas: [106,456] },
      { nome: "Cão de Obsidiana", hp: [480,1201], dano: [86,336], xp: [216,781], moedas: [106,456] },
      { nome: "Salamandra Ardente", hp: [491,1227], dano: [88,344], xp: [221,798], moedas: [108,466] },
      { nome: "Golem de Chamas", hp: [491,1227], dano: [88,344], xp: [221,798], moedas: [108,466] },
      { nome: "Drake Gigante", hp: [501,1253], dano: [90,351], xp: [225,814], moedas: [110,476] },
      { nome: "Fênix Infernal", hp: [501,1253], dano: [90,351], xp: [225,814], moedas: [110,476] },
      { nome: "Fênix de Lava", hp: [501,1253], dano: [90,351], xp: [225,814], moedas: [110,476] },
      { nome: "Cão Infernal", hp: [512,1280], dano: [92,358], xp: [230,832], moedas: [113,486] },
      { nome: "Elemental Flamejante", hp: [512,1280], dano: [92,358], xp: [230,832], moedas: [113,486] },
      { nome: "Espectro de Fogo", hp: [523,1306], dano: [94,366], xp: [235,849], moedas: [115,496] },
      { nome: "Cão de Fogo", hp: [523,1306], dano: [94,366], xp: [235,849], moedas: [115,496] },
      { nome: "Demônio de Lava", hp: [533,1333], dano: [96,373], xp: [240,866], moedas: [117,507] },
      { nome: "Espectro Gigante", hp: [533,1333], dano: [96,373], xp: [240,866], moedas: [117,507] },
      { nome: "Efrit Gigante", hp: [533,1333], dano: [96,373], xp: [240,866], moedas: [117,507] },
      { nome: "Salamandra de Fogo", hp: [544,1360], dano: [98,381], xp: [245,884], moedas: [120,517] },
      { nome: "Drake Infernal", hp: [544,1360], dano: [98,381], xp: [245,884], moedas: [120,517] },
      { nome: "Efrit Menor", hp: [555,1387], dano: [100,388], xp: [250,902], moedas: [122,527] }
    ],
    bosses: [
      {
        nome: "🔥 Elemental Primordial do Fogo",
        hp: 15000, dano: [220,350], xp: 5500, moedas: [2200,3800],
        drop: "Coração de Fogo",
        fases: [
          { nome: "Fase 1 — Aquecendo", hp_pct: 100, dano_mult: 1, msg: "O Elemental aquece o ar ao redor." },
          { nome: "Fase 2 — Explodindo", hp_pct: 55, dano_mult: 1.8, msg: "💥 Explosões de lava em área!" },
          { nome: "Fase 3 — Sol", hp_pct: 20, dano_mult: 2.6, msg: "☀️ O Elemental brilha como um sol!" }
        ]
      },
      {
        nome: "🐉 Drake Ancião das Chamas",
        hp: 22000, dano: [300,480], xp: 8000, moedas: [3200,5500],
        drop: "Escama do Drake Ancião",
        fases: [
          { nome: "Fase 1 — Ameaçando", hp_pct: 100, dano_mult: 1, msg: "O Drake ruge e chamas saem de suas narinas." },
          { nome: "Fase 2 — Sopro Infernal", hp_pct: 60, dano_mult: 1.7, msg: "🔥 Sopro de fogo em cone!" },
          { nome: "Fase 3 — Fúria Dracônica", hp_pct: 25, dano_mult: 2.4, msg: "💀 O Drake entra em fúria dracônica!" }
        ]
      },
      {
        nome: "👑 Senhor das Chamas Eternas",
        hp: 35000, dano: [400,650], xp: 14000, moedas: [5500,9000],
        drop: "Chama Eterna",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Manifestando", hp_pct: 100, dano_mult: 1, msg: "O Senhor das Chamas manifesta sua presença." },
          { nome: "Fase 2 — Inferno", hp_pct: 65, dano_mult: 1.6, msg: "🌋 O vulcão entra em erupção!" },
          { nome: "Fase 3 — Fênix Renascida", hp_pct: 40, dano_mult: 2, msg: "🦅 O Senhor renova suas chamas!" },
          { nome: "Fase 4 — Chama Primordial", hp_pct: 15, dano_mult: 3.2, msg: "🔥 A chama primordial consome tudo!" }
        ]
      },
      {
        nome: "🐺 Devorador Golem",
        hp: 15266, dano: [534,885], xp: 6106, moedas: [3053,5801],
        drop: "Relíquia de Golem",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Fênix",
        hp: 16202, dano: [567,940], xp: 6481, moedas: [3240,6157],
        drop: "Relíquia de Fênix",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Drake",
        hp: 17163, dano: [601,995], xp: 6865, moedas: [3433,6522],
        drop: "Relíquia de Drake",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Espectro",
        hp: 18151, dano: [635,1053], xp: 7260, moedas: [3630,6897],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Cão",
        hp: 19680, dano: [689,1141], xp: 7872, moedas: [3936,7478],
        drop: "Relíquia de Cão",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Gárgula",
        hp: 20732, dano: [726,1202], xp: 8293, moedas: [4146,7878],
        drop: "Relíquia de Gárgula",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Efrit",
        hp: 21809, dano: [763,1265], xp: 8724, moedas: [4362,8287],
        drop: "Relíquia de Efrit",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "lava",
    comerciante: "Ferreiro Bragg"
  },
  necropole_draktum: {
    nome: "⚰️ Necrópole de Draktum", nivel_min: 145, nivel_max: 170,
    descricao: "A cidade dos mortos, onde liches governam sobre exércitos de esqueletos.",
    monstros: [
      { nome: "Vampiro Menor", hp: [1486,3715], dano: [267,1040], xp: [669,2415], moedas: [327,1412] },
      { nome: "Lich Menor", hp: [1501,3751], dano: [270,1050], xp: [675,2438], moedas: [330,1425] },
      { nome: "Esqueleto Voraz", hp: [1501,3751], dano: [270,1050], xp: [675,2438], moedas: [330,1425] },
      { nome: "Necrófago Profano", hp: [1515,3788], dano: [273,1061], xp: [682,2462], moedas: [333,1439] },
      { nome: "Zumbi Menor", hp: [1515,3788], dano: [273,1061], xp: [682,2462], moedas: [333,1439] },
      { nome: "Espectro Voraz", hp: [1530,3825], dano: [275,1071], xp: [688,2486], moedas: [337,1454] },
      { nome: "Sacerdote das Criptas", hp: [1530,3825], dano: [275,1071], xp: [688,2486], moedas: [337,1454] },
      { nome: "Zumbi Profano", hp: [1545,3863], dano: [278,1082], xp: [695,2511], moedas: [340,1468] },
      { nome: "Lich Guerreiro", hp: [1545,3863], dano: [278,1082], xp: [695,2511], moedas: [340,1468] },
      { nome: "Espectro Óssea", hp: [1560,3900], dano: [281,1092], xp: [702,2535], moedas: [343,1482] },
      { nome: "Ceifador Necrótica", hp: [1560,3900], dano: [281,1092], xp: [702,2535], moedas: [343,1482] },
      { nome: "Ceifador das Criptas", hp: [1575,3937], dano: [284,1102], xp: [709,2559], moedas: [346,1496] },
      { nome: "Esqueleto das Criptas", hp: [1575,3937], dano: [284,1102], xp: [709,2559], moedas: [346,1496] },
      { nome: "Esqueleto Óssea", hp: [1590,3975], dano: [286,1113], xp: [716,2584], moedas: [350,1510] },
      { nome: "Zumbi Draktumiano", hp: [1590,3975], dano: [286,1113], xp: [716,2584], moedas: [350,1510] },
      { nome: "Sombra das Criptas", hp: [1605,4012], dano: [289,1123], xp: [722,2608], moedas: [353,1525] },
      { nome: "Espectro Necrótica", hp: [1605,4012], dano: [289,1123], xp: [722,2608], moedas: [353,1525] },
      { nome: "Gárgula Guerreiro", hp: [1620,4050], dano: [292,1134], xp: [729,2632], moedas: [356,1539] },
      { nome: "Zumbi das Criptas", hp: [1620,4050], dano: [292,1134], xp: [729,2632], moedas: [356,1539] },
      { nome: "Sombra Voraz", hp: [1635,4088], dano: [294,1145], xp: [736,2657], moedas: [360,1553] },
      { nome: "Ceifador Guerreiro", hp: [1635,4088], dano: [294,1145], xp: [736,2657], moedas: [360,1553] },
      { nome: "Necrófago das Criptas", hp: [1650,4126], dano: [297,1155], xp: [742,2682], moedas: [363,1568] },
      { nome: "Gárgula Profano", hp: [1650,4126], dano: [297,1155], xp: [742,2682], moedas: [363,1568] },
      { nome: "Esqueleto Draktumiano", hp: [1665,4164], dano: [300,1166], xp: [749,2707], moedas: [366,1582] },
      { nome: "Necrófago Guerreiro", hp: [1665,4164], dano: [300,1166], xp: [749,2707], moedas: [366,1582] },
      { nome: "Esqueleto Profano", hp: [1681,4202], dano: [303,1177], xp: [756,2731], moedas: [370,1597] },
      { nome: "Ceifador Draktumiano", hp: [1681,4202], dano: [303,1177], xp: [756,2731], moedas: [370,1597] },
      { nome: "Sacerdote Voraz", hp: [1696,4240], dano: [305,1187], xp: [763,2756], moedas: [373,1611] },
      { nome: "Gárgula Necrótica", hp: [1696,4240], dano: [305,1187], xp: [763,2756], moedas: [373,1611] },
      { nome: "Vampiro Necrótica", hp: [1711,4278], dano: [308,1198], xp: [770,2781], moedas: [376,1626] },
      { nome: "Vampiro das Criptas", hp: [1711,4278], dano: [308,1198], xp: [770,2781], moedas: [376,1626] },
      { nome: "Zumbi Óssea", hp: [1727,4317], dano: [311,1209], xp: [777,2806], moedas: [380,1640] },
      { nome: "Gárgula das Criptas", hp: [1727,4317], dano: [311,1209], xp: [777,2806], moedas: [380,1640] },
      { nome: "Esqueleto Necrótica", hp: [1742,4355], dano: [314,1219], xp: [784,2831], moedas: [383,1655] },
      { nome: "Gárgula Draktumiano", hp: [1742,4355], dano: [314,1219], xp: [784,2831], moedas: [383,1655] },
      { nome: "Zumbi Voraz", hp: [1758,4394], dano: [316,1230], xp: [791,2856], moedas: [387,1670] },
      { nome: "Esqueleto Menor", hp: [1758,4394], dano: [316,1230], xp: [791,2856], moedas: [387,1670] },
      { nome: "Sacerdote Necrótica", hp: [1773,4432], dano: [319,1241], xp: [798,2881], moedas: [390,1684] },
      { nome: "Espectro Draktumiano", hp: [1773,4432], dano: [319,1241], xp: [798,2881], moedas: [390,1684] },
      { nome: "Necrófago Voraz", hp: [1789,4471], dano: [322,1252], xp: [805,2906], moedas: [394,1699] },
      { nome: "Espectro das Criptas", hp: [1789,4471], dano: [322,1252], xp: [805,2906], moedas: [394,1699] },
      { nome: "Gárgula Menor", hp: [1804,4510], dano: [325,1263], xp: [812,2932], moedas: [397,1714] },
      { nome: "Vampiro Draktumiano", hp: [1804,4510], dano: [325,1263], xp: [812,2932], moedas: [397,1714] },
      { nome: "Lich Draktumiano", hp: [1820,4549], dano: [328,1274], xp: [819,2957], moedas: [400,1729] },
      { nome: "Sacerdote Menor", hp: [1820,4549], dano: [328,1274], xp: [819,2957], moedas: [400,1729] },
      { nome: "Gárgula Voraz", hp: [1835,4588], dano: [330,1285], xp: [826,2982], moedas: [404,1743] },
      { nome: "Sombra Necrótica", hp: [1835,4588], dano: [330,1285], xp: [826,2982], moedas: [404,1743] },
      { nome: "Gárgula Óssea", hp: [1851,4628], dano: [333,1296], xp: [833,3008], moedas: [407,1759] },
      { nome: "Ceifador Óssea", hp: [1851,4628], dano: [333,1296], xp: [833,3008], moedas: [407,1759] },
      { nome: "Zumbi Guerreiro", hp: [1867,4667], dano: [336,1307], xp: [840,3034], moedas: [411,1773] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Lich",
        hp: 75021, dano: [2626,4351], xp: 30008, moedas: [15004,28508],
        drop: "Relíquia de Lich",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Esqueleto",
        hp: 77956, dano: [2728,4521], xp: 31182, moedas: [15591,29623],
        drop: "Relíquia de Esqueleto",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Zumbi",
        hp: 80943, dano: [2833,4695], xp: 32377, moedas: [16189,30758],
        drop: "Relíquia de Zumbi",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Necrófago",
        hp: 82964, dano: [2904,4812], xp: 33186, moedas: [16593,31526],
        drop: "Relíquia de Necrófago",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Espectro",
        hp: 86038, dano: [3011,4990], xp: 34415, moedas: [17208,32694],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Vampiro",
        hp: 89165, dano: [3121,5172], xp: 35666, moedas: [17833,33883],
        drop: "Relíquia de Vampiro",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Gárgula",
        hp: 92344, dano: [3232,5356], xp: 36938, moedas: [18469,35091],
        drop: "Relíquia de Gárgula",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Sacerdote",
        hp: 94492, dano: [3307,5481], xp: 37797, moedas: [18898,35907],
        drop: "Relíquia de Sacerdote",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Sombra",
        hp: 97757, dano: [3421,5670], xp: 39103, moedas: [19551,37148],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Ceifador",
        hp: 101074, dano: [3538,5862], xp: 40430, moedas: [20215,38408],
        drop: "Relíquia de Ceifador",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Coveiro Malachar"
  },
  pantano_maldito: {
    nome: "🐊 Pântano Maldito", nivel_min: 60, nivel_max: 80,
    descricao: "Um lodaçal venenoso onde bruxas praticam magias proibidas.",
    monstros: [
      { nome: "Planta Venenosa", hp: [419,1047], dano: [75,293], xp: [189,681], moedas: [92,398] },
      { nome: "Serpente Gigante", hp: [419,1047], dano: [75,293], xp: [189,681], moedas: [92,398] },
      { nome: "Zumbi Gigante", hp: [429,1072], dano: [77,300], xp: [193,697], moedas: [94,407] },
      { nome: "Espectro de Lodo", hp: [429,1072], dano: [77,300], xp: [193,697], moedas: [94,407] },
      { nome: "Zumbi do Pântano", hp: [439,1098], dano: [79,307], xp: [198,714], moedas: [97,417] },
      { nome: "Serpente do Pântano", hp: [439,1098], dano: [79,307], xp: [198,714], moedas: [97,417] },
      { nome: "Jacaré Maldita", hp: [439,1098], dano: [79,307], xp: [198,714], moedas: [97,417] },
      { nome: "Zumbi Carnívora", hp: [449,1123], dano: [81,314], xp: [202,730], moedas: [99,427] },
      { nome: "Jacaré Gigante", hp: [449,1123], dano: [81,314], xp: [202,730], moedas: [99,427] },
      { nome: "Sombra do Pântano", hp: [459,1149], dano: [83,322], xp: [207,747], moedas: [101,437] },
      { nome: "Planta Carnívora", hp: [459,1149], dano: [83,322], xp: [207,747], moedas: [101,437] },
      { nome: "Verme Carnívora", hp: [459,1149], dano: [83,322], xp: [207,747], moedas: [101,437] },
      { nome: "Jacaré do Pântano", hp: [470,1175], dano: [85,329], xp: [212,764], moedas: [103,446] },
      { nome: "Zumbi de Lodo", hp: [470,1175], dano: [85,329], xp: [212,764], moedas: [103,446] },
      { nome: "Zumbi Amaldiçoado", hp: [480,1201], dano: [86,336], xp: [216,781], moedas: [106,456] },
      { nome: "Bruxa de Lodo", hp: [480,1201], dano: [86,336], xp: [216,781], moedas: [106,456] },
      { nome: "Sapo Gigante", hp: [491,1227], dano: [88,344], xp: [221,798], moedas: [108,466] },
      { nome: "Bruxa do Pântano", hp: [491,1227], dano: [88,344], xp: [221,798], moedas: [108,466] },
      { nome: "Elemental de Lodo", hp: [491,1227], dano: [88,344], xp: [221,798], moedas: [108,466] },
      { nome: "Sapo Carnívora", hp: [501,1253], dano: [90,351], xp: [225,814], moedas: [110,476] },
      { nome: "Verme de Lodo", hp: [501,1253], dano: [90,351], xp: [225,814], moedas: [110,476] },
      { nome: "Espectro Pantanosa", hp: [512,1280], dano: [92,358], xp: [230,832], moedas: [113,486] },
      { nome: "Elemental do Lodo", hp: [512,1280], dano: [92,358], xp: [230,832], moedas: [113,486] },
      { nome: "Serpente Venenosa", hp: [512,1280], dano: [92,358], xp: [230,832], moedas: [113,486] },
      { nome: "Sombra Maldita", hp: [523,1306], dano: [94,366], xp: [235,849], moedas: [115,496] },
      { nome: "Planta Maldita", hp: [523,1306], dano: [94,366], xp: [235,849], moedas: [115,496] },
      { nome: "Jacaré Amaldiçoado", hp: [533,1333], dano: [96,373], xp: [240,866], moedas: [117,507] },
      { nome: "Espectro Maldita", hp: [533,1333], dano: [96,373], xp: [240,866], moedas: [117,507] },
      { nome: "Zumbi Podre", hp: [533,1333], dano: [96,373], xp: [240,866], moedas: [117,507] },
      { nome: "Jacaré Podre", hp: [544,1360], dano: [98,381], xp: [245,884], moedas: [120,517] },
      { nome: "Sombra do Lodo", hp: [544,1360], dano: [98,381], xp: [245,884], moedas: [120,517] },
      { nome: "Bruxa Venenosa", hp: [555,1387], dano: [100,388], xp: [250,902], moedas: [122,527] },
      { nome: "Bruxa Pantanosa", hp: [555,1387], dano: [100,388], xp: [250,902], moedas: [122,527] },
      { nome: "Planta do Lodo", hp: [555,1387], dano: [100,388], xp: [250,902], moedas: [122,527] },
      { nome: "Serpente Maldita", hp: [566,1415], dano: [102,396], xp: [255,920], moedas: [125,538] },
      { nome: "Bruxa do Lodo", hp: [566,1415], dano: [102,396], xp: [255,920], moedas: [125,538] },
      { nome: "Serpente Carnívora", hp: [577,1442], dano: [104,404], xp: [260,937], moedas: [127,548] },
      { nome: "Bruxa Maldita", hp: [577,1442], dano: [104,404], xp: [260,937], moedas: [127,548] },
      { nome: "Verme Maldita", hp: [588,1470], dano: [106,412], xp: [265,956], moedas: [129,559] },
      { nome: "Jacaré Venenosa", hp: [588,1470], dano: [106,412], xp: [265,956], moedas: [129,559] },
      { nome: "Elemental do Pântano", hp: [588,1470], dano: [106,412], xp: [265,956], moedas: [129,559] },
      { nome: "Sapo Pantanosa", hp: [599,1498], dano: [108,419], xp: [270,974], moedas: [132,569] },
      { nome: "Verme do Lodo", hp: [599,1498], dano: [108,419], xp: [270,974], moedas: [132,569] },
      { nome: "Verme Gigante", hp: [610,1526], dano: [110,427], xp: [274,992], moedas: [134,580] },
      { nome: "Sombra Venenosa", hp: [610,1526], dano: [110,427], xp: [274,992], moedas: [134,580] },
      { nome: "Elemental Maldita", hp: [610,1526], dano: [110,427], xp: [274,992], moedas: [134,580] },
      { nome: "Sapo Amaldiçoado", hp: [622,1554], dano: [112,435], xp: [280,1010], moedas: [137,591] },
      { nome: "Planta Amaldiçoado", hp: [622,1554], dano: [112,435], xp: [280,1010], moedas: [137,591] },
      { nome: "Espectro do Lodo", hp: [633,1582], dano: [114,443], xp: [285,1028], moedas: [139,601] },
      { nome: "Serpente Pantanosa", hp: [633,1582], dano: [114,443], xp: [285,1028], moedas: [139,601] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Bruxa",
        hp: 14356, dano: [502,833], xp: 5742, moedas: [2871,5455],
        drop: "Relíquia de Bruxa",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Elemental",
        hp: 15266, dano: [534,885], xp: 6106, moedas: [3053,5801],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Sapo",
        hp: 16202, dano: [567,940], xp: 6481, moedas: [3240,6157],
        drop: "Relíquia de Sapo",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Verme",
        hp: 17654, dano: [618,1024], xp: 7062, moedas: [3531,6709],
        drop: "Relíquia de Verme",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Zumbi",
        hp: 18654, dano: [653,1082], xp: 7462, moedas: [3731,7089],
        drop: "Relíquia de Zumbi",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Planta",
        hp: 19680, dano: [689,1141], xp: 7872, moedas: [3936,7478],
        drop: "Relíquia de Planta",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Espectro",
        hp: 20732, dano: [726,1202], xp: 8293, moedas: [4146,7878],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Serpente",
        hp: 22357, dano: [782,1297], xp: 8943, moedas: [4471,8496],
        drop: "Relíquia de Serpente",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Sombra",
        hp: 23473, dano: [822,1361], xp: 9389, moedas: [4695,8920],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Jacaré",
        hp: 24613, dano: [861,1428], xp: 9845, moedas: [4923,9353],
        drop: "Relíquia de Jacaré",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Bruxa Grelka"
  },
  planicies_cinzas: {
    nome: "🌫️ Planícies de Cinzas", nivel_min: 90, nivel_max: 125,
    descricao: "Os restos de uma guerra esquecida, cobertos por cinzas eternas.",
    monstros: [
      { nome: "Cavaleiro Espectral", hp: [749,1874], dano: [135,525], xp: [337,1218], moedas: [165,712] },
      { nome: "Fantasma das Cinzas", hp: [761,1904], dano: [137,533], xp: [342,1238], moedas: [167,724] },
      { nome: "Sombra Espectral", hp: [761,1904], dano: [137,533], xp: [342,1238], moedas: [167,724] },
      { nome: "Elemental Caído", hp: [773,1934], dano: [139,542], xp: [348,1257], moedas: [170,735] },
      { nome: "Espectro Gigante", hp: [786,1964], dano: [141,550], xp: [354,1277], moedas: [173,746] },
      { nome: "Cinzas Vivas Espectral", hp: [798,1994], dano: [144,558], xp: [359,1296], moedas: [176,758] },
      { nome: "Corvo das Cinzas", hp: [798,1994], dano: [144,558], xp: [359,1296], moedas: [176,758] },
      { nome: "Cinzas Vivas das Cinzas", hp: [810,2025], dano: [146,567], xp: [364,1316], moedas: [178,770] },
      { nome: "Cavaleiro Gigante", hp: [822,2055], dano: [148,575], xp: [370,1336], moedas: [181,781] },
      { nome: "Elemental de Cinzas", hp: [822,2055], dano: [148,575], xp: [370,1336], moedas: [181,781] },
      { nome: "Sombra das Cinzas", hp: [834,2086], dano: [150,584], xp: [375,1356], moedas: [183,793] },
      { nome: "Cavaleiro de Guerra", hp: [847,2117], dano: [152,593], xp: [381,1376], moedas: [186,804] },
      { nome: "Espectro Errantes", hp: [859,2148], dano: [155,601], xp: [387,1396], moedas: [189,816] },
      { nome: "Cinzas Vivas de Cinzas", hp: [859,2148], dano: [155,601], xp: [387,1396], moedas: [189,816] },
      { nome: "Sombra Errantes", hp: [872,2179], dano: [157,610], xp: [392,1416], moedas: [192,828] },
      { nome: "Cinzas Vivas Esquecido", hp: [884,2211], dano: [159,619], xp: [398,1437], moedas: [194,840] },
      { nome: "Golem Esquecido", hp: [884,2211], dano: [159,619], xp: [398,1437], moedas: [194,840] },
      { nome: "Elemental Esquecido", hp: [897,2242], dano: [161,628], xp: [404,1457], moedas: [197,852] },
      { nome: "Golem de Cinzas", hp: [910,2274], dano: [164,637], xp: [410,1478], moedas: [200,864] },
      { nome: "Guerreiro Errantes", hp: [922,2306], dano: [166,646], xp: [415,1499], moedas: [203,876] },
      { nome: "Cinzas Vivas Caído", hp: [922,2306], dano: [166,646], xp: [415,1499], moedas: [203,876] },
      { nome: "Guerreiro das Planícies", hp: [935,2338], dano: [168,655], xp: [421,1520], moedas: [206,888] },
      { nome: "Cão Esquecido", hp: [948,2370], dano: [171,664], xp: [427,1540], moedas: [209,901] },
      { nome: "Guerreiro Esquecido", hp: [948,2370], dano: [171,664], xp: [427,1540], moedas: [209,901] },
      { nome: "Cão Errantes", hp: [961,2402], dano: [173,673], xp: [432,1561], moedas: [211,913] },
      { nome: "Elemental de Guerra", hp: [974,2434], dano: [175,682], xp: [438,1582], moedas: [214,925] },
      { nome: "Cão das Planícies", hp: [987,2466], dano: [178,690], xp: [444,1603], moedas: [217,937] },
      { nome: "Elemental das Cinzas", hp: [987,2466], dano: [178,690], xp: [444,1603], moedas: [217,937] },
      { nome: "Golem Gigante", hp: [1000,2499], dano: [180,700], xp: [450,1624], moedas: [220,950] },
      { nome: "Sombra de Cinzas", hp: [1013,2532], dano: [182,709], xp: [456,1646], moedas: [223,962] },
      { nome: "Cão Gigante", hp: [1013,2532], dano: [182,709], xp: [456,1646], moedas: [223,962] },
      { nome: "Fantasma Esquecido", hp: [1026,2564], dano: [185,718], xp: [462,1667], moedas: [226,974] },
      { nome: "Fantasma Errantes", hp: [1039,2597], dano: [187,727], xp: [468,1688], moedas: [229,987] },
      { nome: "Elemental Espectral", hp: [1052,2630], dano: [189,736], xp: [473,1710], moedas: [231,999] },
      { nome: "Guerreiro Espectral", hp: [1052,2630], dano: [189,736], xp: [473,1710], moedas: [231,999] },
      { nome: "Elemental Gigante", hp: [1065,2663], dano: [192,746], xp: [479,1731], moedas: [234,1012] },
      { nome: "Espectro das Planícies", hp: [1079,2697], dano: [194,755], xp: [486,1753], moedas: [237,1025] },
      { nome: "Guerreiro Caído", hp: [1079,2697], dano: [194,755], xp: [486,1753], moedas: [237,1025] },
      { nome: "Fantasma Gigante", hp: [1092,2730], dano: [197,764], xp: [491,1774], moedas: [240,1037] },
      { nome: "Golem Errantes", hp: [1105,2764], dano: [199,774], xp: [497,1797], moedas: [243,1050] },
      { nome: "Sombra das Planícies", hp: [1119,2797], dano: [201,783], xp: [504,1818], moedas: [246,1063] },
      { nome: "Cavaleiro das Cinzas", hp: [1119,2797], dano: [201,783], xp: [504,1818], moedas: [246,1063] },
      { nome: "Corvo Esquecido", hp: [1132,2831], dano: [204,793], xp: [509,1840], moedas: [249,1076] },
      { nome: "Elemental das Planícies", hp: [1146,2865], dano: [206,802], xp: [516,1862], moedas: [252,1089] },
      { nome: "Golem de Guerra", hp: [1146,2865], dano: [206,802], xp: [516,1862], moedas: [252,1089] },
      { nome: "Corvo de Cinzas", hp: [1160,2899], dano: [209,812], xp: [522,1884], moedas: [255,1102] },
      { nome: "Guerreiro das Cinzas", hp: [1173,2933], dano: [211,821], xp: [528,1906], moedas: [258,1115] },
      { nome: "Cão Espectral", hp: [1187,2968], dano: [214,831], xp: [534,1929], moedas: [261,1128] },
      { nome: "Cinzas Vivas Gigante", hp: [1187,2968], dano: [214,831], xp: [534,1929], moedas: [261,1128] },
      { nome: "Corvo Gigante", hp: [1201,3002], dano: [216,841], xp: [540,1951], moedas: [264,1141] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Cavaleiro",
        hp: 30692, dano: [1074,1780], xp: 12277, moedas: [6138,11663],
        drop: "Relíquia de Cavaleiro",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Espectro",
        hp: 33298, dano: [1165,1931], xp: 13319, moedas: [6660,12653],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Cinzas Vivas",
        hp: 36003, dano: [1260,2088], xp: 14401, moedas: [7201,13681],
        drop: "Relíquia de Cinzas Vivas",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Corvo",
        hp: 38805, dano: [1358,2251], xp: 15522, moedas: [7761,14746],
        drop: "Relíquia de Corvo",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Elemental",
        hp: 41706, dano: [1460,2419], xp: 16682, moedas: [8341,15848],
        drop: "Relíquia de Elemental",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Guerreiro",
        hp: 43945, dano: [1538,2549], xp: 17578, moedas: [8789,16699],
        drop: "Relíquia de Guerreiro",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Sombra",
        hp: 47016, dano: [1646,2727], xp: 18806, moedas: [9403,17866],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Fantasma",
        hp: 50183, dano: [1756,2911], xp: 20073, moedas: [10037,19070],
        drop: "Relíquia de Fantasma",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Golem",
        hp: 53446, dano: [1871,3100], xp: 21378, moedas: [10689,20309],
        drop: "Relíquia de Golem",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Cão",
        hp: 56805, dano: [1988,3295], xp: 22722, moedas: [11361,21586],
        drop: "Relíquia de Cão",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Sobrevivente Ashen"
  },
  abismo_mar_negro: {
    nome: "🌊 Abismo do Mar Negro", nivel_min: 160, nivel_max: 185,
    descricao: "As profundezas mais escuras do oceano, onde a luz nunca chega.",
    monstros: [
      { nome: "Sombra Abissal", hp: [1711,4278], dano: [308,1198], xp: [770,2781], moedas: [376,1626] },
      { nome: "Eco Menor", hp: [1727,4317], dano: [311,1209], xp: [777,2806], moedas: [380,1640] },
      { nome: "Leviatã Abissal", hp: [1727,4317], dano: [311,1209], xp: [777,2806], moedas: [380,1640] },
      { nome: "Horror das Profundezas", hp: [1742,4355], dano: [314,1219], xp: [784,2831], moedas: [383,1655] },
      { nome: "Kraken das Profundezas", hp: [1742,4355], dano: [314,1219], xp: [784,2831], moedas: [383,1655] },
      { nome: "Peixe das Profundezas", hp: [1758,4394], dano: [316,1230], xp: [791,2856], moedas: [387,1670] },
      { nome: "Kraken Menor", hp: [1758,4394], dano: [316,1230], xp: [791,2856], moedas: [387,1670] },
      { nome: "Abissal Menor", hp: [1773,4432], dano: [319,1241], xp: [798,2881], moedas: [390,1684] },
      { nome: "Devorador do Abismo", hp: [1773,4432], dano: [319,1241], xp: [798,2881], moedas: [390,1684] },
      { nome: "Abissal Jovem", hp: [1789,4471], dano: [322,1252], xp: [805,2906], moedas: [394,1699] },
      { nome: "Eco Errante", hp: [1789,4471], dano: [322,1252], xp: [805,2906], moedas: [394,1699] },
      { nome: "Horror Abissal", hp: [1804,4510], dano: [325,1263], xp: [812,2932], moedas: [397,1714] },
      { nome: "Eco Jovem", hp: [1804,4510], dano: [325,1263], xp: [812,2932], moedas: [397,1714] },
      { nome: "Kraken de Almas", hp: [1820,4549], dano: [328,1274], xp: [819,2957], moedas: [400,1729] },
      { nome: "Devorador Menor", hp: [1820,4549], dano: [328,1274], xp: [819,2957], moedas: [400,1729] },
      { nome: "Horror de Almas", hp: [1835,4588], dano: [330,1285], xp: [826,2982], moedas: [404,1743] },
      { nome: "Sombra do Abismo", hp: [1835,4588], dano: [330,1285], xp: [826,2982], moedas: [404,1743] },
      { nome: "Tentáculo Jovem", hp: [1851,4628], dano: [333,1296], xp: [833,3008], moedas: [407,1759] },
      { nome: "Serpente Errante", hp: [1851,4628], dano: [333,1296], xp: [833,3008], moedas: [407,1759] },
      { nome: "Leviatã das Profundezas", hp: [1867,4667], dano: [336,1307], xp: [840,3034], moedas: [411,1773] },
      { nome: "Sombra Jovem", hp: [1867,4667], dano: [336,1307], xp: [840,3034], moedas: [411,1773] },
      { nome: "Eco de Almas", hp: [1883,4706], dano: [339,1318], xp: [847,3059], moedas: [414,1788] },
      { nome: "Peixe Abissal", hp: [1883,4706], dano: [339,1318], xp: [847,3059], moedas: [414,1788] },
      { nome: "Horror Errante", hp: [1898,4746], dano: [342,1329], xp: [854,3085], moedas: [418,1803] },
      { nome: "Leviatã Errante", hp: [1898,4746], dano: [342,1329], xp: [854,3085], moedas: [418,1803] },
      { nome: "Abissal de Almas", hp: [1914,4786], dano: [345,1340], xp: [861,3111], moedas: [421,1819] },
      { nome: "Leviatã Jovem", hp: [1914,4786], dano: [345,1340], xp: [861,3111], moedas: [421,1819] },
      { nome: "Sombra Menor", hp: [1930,4825], dano: [347,1351], xp: [868,3136], moedas: [425,1834] },
      { nome: "Eco das Profundezas", hp: [1930,4825], dano: [347,1351], xp: [868,3136], moedas: [425,1834] },
      { nome: "Tentáculo das Profundezas", hp: [1946,4865], dano: [350,1362], xp: [876,3162], moedas: [428,1849] },
      { nome: "Kraken Errante", hp: [1946,4865], dano: [350,1362], xp: [876,3162], moedas: [428,1849] },
      { nome: "Devorador Abissal", hp: [1962,4905], dano: [353,1373], xp: [883,3188], moedas: [432,1864] },
      { nome: "Kraken do Abismo", hp: [1962,4905], dano: [353,1373], xp: [883,3188], moedas: [432,1864] },
      { nome: "Kraken Jovem", hp: [1978,4945], dano: [356,1385], xp: [890,3214], moedas: [435,1879] },
      { nome: "Devorador das Profundezas", hp: [1978,4945], dano: [356,1385], xp: [890,3214], moedas: [435,1879] },
      { nome: "Horror Menor", hp: [1994,4985], dano: [359,1396], xp: [897,3240], moedas: [439,1894] },
      { nome: "Sombra de Almas", hp: [1994,4985], dano: [359,1396], xp: [897,3240], moedas: [439,1894] },
      { nome: "Tentáculo do Abismo", hp: [2010,5026], dano: [362,1407], xp: [904,3267], moedas: [442,1910] },
      { nome: "Eco Abissal", hp: [2010,5026], dano: [362,1407], xp: [904,3267], moedas: [442,1910] },
      { nome: "Serpente Menor", hp: [2026,5066], dano: [365,1418], xp: [912,3293], moedas: [446,1925] },
      { nome: "Devorador Errante", hp: [2026,5066], dano: [365,1418], xp: [912,3293], moedas: [446,1925] },
      { nome: "Abissal do Abismo", hp: [2043,5106], dano: [368,1430], xp: [919,3319], moedas: [449,1940] },
      { nome: "Serpente Abissal", hp: [2043,5106], dano: [368,1430], xp: [919,3319], moedas: [449,1940] },
      { nome: "Kraken Abissal", hp: [2059,5147], dano: [371,1441], xp: [927,3346], moedas: [453,1956] },
      { nome: "Horror Jovem", hp: [2059,5147], dano: [371,1441], xp: [927,3346], moedas: [453,1956] },
      { nome: "Peixe Jovem", hp: [2075,5188], dano: [374,1453], xp: [934,3372], moedas: [456,1971] },
      { nome: "Serpente das Profundezas", hp: [2075,5188], dano: [374,1453], xp: [934,3372], moedas: [456,1971] },
      { nome: "Peixe de Almas", hp: [2091,5228], dano: [376,1464], xp: [941,3398], moedas: [460,1987] },
      { nome: "Sombra das Profundezas", hp: [2091,5228], dano: [376,1464], xp: [941,3398], moedas: [460,1987] },
      { nome: "Abissal Errante", hp: [2108,5269], dano: [379,1475], xp: [949,3425], moedas: [464,2002] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Kraken",
        hp: 90219, dano: [3158,5233], xp: 36088, moedas: [18044,34283],
        drop: "Relíquia de Kraken",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Leviatã",
        hp: 93415, dano: [3270,5418], xp: 37366, moedas: [18683,35498],
        drop: "Relíquia de Leviatã",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Sombra",
        hp: 96663, dano: [3383,5606], xp: 38665, moedas: [19333,36732],
        drop: "Relíquia de Sombra",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Abissal",
        hp: 98857, dano: [3460,5734], xp: 39543, moedas: [19771,37566],
        drop: "Relíquia de Abissal",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Serpente",
        hp: 102191, dano: [3577,5927], xp: 40876, moedas: [20438,38833],
        drop: "Relíquia de Serpente",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Devorador",
        hp: 105576, dano: [3695,6123], xp: 42230, moedas: [21115,40119],
        drop: "Relíquia de Devorador",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Peixe",
        hp: 109013, dano: [3815,6323], xp: 43605, moedas: [21803,41425],
        drop: "Relíquia de Peixe",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Horror",
        hp: 111333, dano: [3897,6457], xp: 44533, moedas: [22267,42307],
        drop: "Relíquia de Horror",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Tentáculo",
        hp: 114855, dano: [4020,6662], xp: 45942, moedas: [22971,43645],
        drop: "Relíquia de Tentáculo",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Eco",
        hp: 118429, dano: [4145,6869], xp: 47372, moedas: [23686,45003],
        drop: "Relíquia de Eco",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "normal",
    comerciante: "Mergulhador Nyx"
  },
  torre_caos: {
    nome: "🌪️ Torre do Caos", nivel_min: 180, nivel_max: 200,
    descricao: "O último desafio. No topo da torre, o próprio Caos aguarda.",
    monstros: [
      { nome: "Aberração Indescritível", hp: [2026,5066], dano: [365,1418], xp: [912,3293], moedas: [446,1925] },
      { nome: "Devorador de Mundos", hp: [2026,5066], dano: [365,1418], xp: [912,3293], moedas: [446,1925] },
      { nome: "Demônio de Mundos", hp: [2043,5106], dano: [368,1430], xp: [919,3319], moedas: [449,1940] },
      { nome: "Demônio do Caos", hp: [2043,5106], dano: [368,1430], xp: [919,3319], moedas: [449,1940] },
      { nome: "Devorador Menor do Caos", hp: [2059,5147], dano: [371,1441], xp: [927,3346], moedas: [453,1956] },
      { nome: "Aberração Menor do Caos", hp: [2059,5147], dano: [371,1441], xp: [927,3346], moedas: [453,1956] },
      { nome: "Avatar do Caos", hp: [2059,5147], dano: [371,1441], xp: [927,3346], moedas: [453,1956] },
      { nome: "Demônio Menor", hp: [2075,5188], dano: [374,1453], xp: [934,3372], moedas: [456,1971] },
      { nome: "Aberração Menor", hp: [2075,5188], dano: [374,1453], xp: [934,3372], moedas: [456,1971] },
      { nome: "Guardião Menor", hp: [2091,5228], dano: [376,1464], xp: [941,3398], moedas: [460,1987] },
      { nome: "Avatar Indescritível", hp: [2091,5228], dano: [376,1464], xp: [941,3398], moedas: [460,1987] },
      { nome: "Espectro do Caos", hp: [2091,5228], dano: [376,1464], xp: [941,3398], moedas: [460,1987] },
      { nome: "Espectro Primordial", hp: [2108,5269], dano: [379,1475], xp: [949,3425], moedas: [464,2002] },
      { nome: "Fragmento Indescritível", hp: [2108,5269], dano: [379,1475], xp: [949,3425], moedas: [464,2002] },
      { nome: "Aberração da Torre", hp: [2124,5310], dano: [382,1487], xp: [956,3452], moedas: [467,2018] },
      { nome: "Avatar Menor", hp: [2124,5310], dano: [382,1487], xp: [956,3452], moedas: [467,2018] },
      { nome: "Caos Vivo Indescritível", hp: [2140,5351], dano: [385,1498], xp: [963,3478], moedas: [471,2033] },
      { nome: "Horror da Torre", hp: [2140,5351], dano: [385,1498], xp: [963,3478], moedas: [471,2033] },
      { nome: "Aberração do Caos", hp: [2140,5351], dano: [385,1498], xp: [963,3478], moedas: [471,2033] },
      { nome: "Caos Vivo do Caos", hp: [2157,5392], dano: [388,1510], xp: [971,3505], moedas: [475,2049] },
      { nome: "Espectro da Torre", hp: [2157,5392], dano: [388,1510], xp: [971,3505], moedas: [475,2049] },
      { nome: "Avatar Caótico", hp: [2173,5433], dano: [391,1521], xp: [978,3531], moedas: [478,2065] },
      { nome: "Espectro Indescritível", hp: [2173,5433], dano: [391,1521], xp: [978,3531], moedas: [478,2065] },
      { nome: "Horror do Caos", hp: [2173,5433], dano: [391,1521], xp: [978,3531], moedas: [478,2065] },
      { nome: "Devorador Indescritível", hp: [2190,5475], dano: [394,1533], xp: [986,3559], moedas: [482,2080] },
      { nome: "Fragmento Primordial", hp: [2190,5475], dano: [394,1533], xp: [986,3559], moedas: [482,2080] },
      { nome: "Guardião do Caos", hp: [2206,5516], dano: [397,1544], xp: [993,3585], moedas: [485,2096] },
      { nome: "Fragmento Caótico", hp: [2206,5516], dano: [397,1544], xp: [993,3585], moedas: [485,2096] },
      { nome: "Aberração de Mundos", hp: [2206,5516], dano: [397,1544], xp: [993,3585], moedas: [485,2096] },
      { nome: "Sombra da Torre", hp: [2223,5558], dano: [400,1556], xp: [1000,3613], moedas: [489,2112] },
      { nome: "Guardião Indescritível", hp: [2223,5558], dano: [400,1556], xp: [1000,3613], moedas: [489,2112] },
      { nome: "Fragmento Menor", hp: [2240,5599], dano: [403,1568], xp: [1008,3639], moedas: [493,2128] },
      { nome: "Horror Menor do Caos", hp: [2240,5599], dano: [403,1568], xp: [1008,3639], moedas: [493,2128] },
      { nome: "Espectro Menor do Caos", hp: [2240,5599], dano: [403,1568], xp: [1008,3639], moedas: [493,2128] },
      { nome: "Fragmento de Mundos", hp: [2256,5641], dano: [406,1579], xp: [1015,3667], moedas: [496,2144] },
      { nome: "Horror Menor", hp: [2256,5641], dano: [406,1579], xp: [1015,3667], moedas: [496,2144] },
      { nome: "Fragmento da Torre", hp: [2273,5683], dano: [409,1591], xp: [1023,3694], moedas: [500,2160] },
      { nome: "Espectro Caótico", hp: [2273,5683], dano: [409,1591], xp: [1023,3694], moedas: [500,2160] },
      { nome: "Espectro Menor", hp: [2290,5724], dano: [412,1603], xp: [1030,3721], moedas: [504,2175] },
      { nome: "Devorador do Caos", hp: [2290,5724], dano: [412,1603], xp: [1030,3721], moedas: [504,2175] },
      { nome: "Horror Primordial", hp: [2290,5724], dano: [412,1603], xp: [1030,3721], moedas: [504,2175] },
      { nome: "Caos Vivo de Mundos", hp: [2307,5766], dano: [415,1614], xp: [1038,3748], moedas: [508,2191] },
      { nome: "Sombra de Mundos", hp: [2307,5766], dano: [415,1614], xp: [1038,3748], moedas: [508,2191] },
      { nome: "Fragmento do Caos", hp: [2323,5808], dano: [418,1626], xp: [1045,3775], moedas: [511,2207] },
      { nome: "Sombra Primordial", hp: [2323,5808], dano: [418,1626], xp: [1045,3775], moedas: [511,2207] },
      { nome: "Horror Caótico", hp: [2323,5808], dano: [418,1626], xp: [1045,3775], moedas: [511,2207] },
      { nome: "Aberração Primordial", hp: [2340,5851], dano: [421,1638], xp: [1053,3803], moedas: [515,2223] },
      { nome: "Demônio Indescritível", hp: [2340,5851], dano: [421,1638], xp: [1053,3803], moedas: [515,2223] },
      { nome: "Demônio Caótico", hp: [2357,5893], dano: [424,1650], xp: [1061,3830], moedas: [519,2239] },
      { nome: "Guardião Primordial", hp: [2357,5893], dano: [424,1650], xp: [1061,3830], moedas: [519,2239] }
    ],
    bosses: [
      {
        nome: "🗡️ Guardião Demônio",
        hp: 112501, dano: [3938,6525], xp: 45000, moedas: [22500,42750],
        drop: "Relíquia de Demônio",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧙 Senhor Aberração",
        hp: 114855, dano: [4020,6662], xp: 45942, moedas: [22971,43645],
        drop: "Relíquia de Aberração",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👑 Flagelo Caos Vivo",
        hp: 117232, dano: [4103,6799], xp: 46893, moedas: [23446,44548],
        drop: "Relíquia de Caos Vivo",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🐺 Devorador Guardião",
        hp: 120839, dano: [4229,7009], xp: 48336, moedas: [24168,45919],
        drop: "Relíquia de Guardião",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🕷️ Tirano Horror",
        hp: 123272, dano: [4315,7150], xp: 49309, moedas: [24654,46843],
        drop: "Relíquia de Horror",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "🐉 Arauto Espectro",
        hp: 125728, dano: [4400,7292], xp: 50291, moedas: [25146,47777],
        drop: "Relíquia de Espectro",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "💀 Soberano Devorador",
        hp: 128207, dano: [4487,7436], xp: 51283, moedas: [25641,48719],
        drop: "Relíquia de Devorador",
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      },
      {
        nome: "🧛 Terror Fragmento",
        hp: 131967, dano: [4619,7654], xp: 52787, moedas: [26393,50147],
        drop: "Relíquia de Fragmento",
        fases: [
          { nome: "Fase 1 — Confiante", hp_pct: 100, dano_mult: 1.0, msg: "Ela ri da sua presença. \"Mais um tolo.\"" },
          { nome: "Fase 2 — Irritada", hp_pct: 50, dano_mult: 1.6, msg: "⚠️ A paciência acabou — os golpes ficam mais fortes!" },
          { nome: "Fase 3 — Frenética", hp_pct: 18, dano_mult: 2.3, msg: "💥 Um frenesi tomou conta da criatura!" }
        ]
      },
      {
        nome: "👻 Espectro Supremo Avatar",
        hp: 134501, dano: [4708,7801], xp: 53800, moedas: [26900,51110],
        drop: "Relíquia de Avatar",
        fases: [
          { nome: "Fase 1 — Calculista", hp_pct: 100, dano_mult: 1.0, msg: "Ela estuda cada movimento seu, à espera de uma abertura." },
          { nome: "Fase 2 — Ofensiva", hp_pct: 60, dano_mult: 1.55, msg: "⚠️ Ela avança com tudo, sem mais cautela!" },
          { nome: "Fase 3 — Ruína", hp_pct: 22, dano_mult: 2.2, msg: "🌑 O que resta dela é pura fúria destrutiva!" }
        ]
      },
      {
        nome: "🌀 Avatar Sombra",
        hp: 137059, dano: [4797,7949], xp: 54824, moedas: [27412,52082],
        drop: "Relíquia de Sombra",
        drop_arma: true,
        fases: [
          { nome: "Fase 1 — Vigilante", hp_pct: 100, dano_mult: 1.0, msg: "A criatura observa você com cautela." },
          { nome: "Fase 2 — Agressiva", hp_pct: 55, dano_mult: 1.5, msg: "⚠️ A criatura parte para cima com fúria redobrada!" },
          { nome: "Fase 3 — Desesperada", hp_pct: 20, dano_mult: 2.1, msg: "🔥 Ferida de morte, a criatura ataca sem piedade!" }
        ]
      }
    ],
    clima: "caotico",
    comerciante: "Arauto Ferum"
  }
};

// ── ARMAS (20 raridades) ─────────────────────────────────
const ARMAS = [
  { id: "contato_espada_ancestral_0", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [8,14], raridade: "⬜ Comum", preco: 50 },
  { id: "distancia_arco_sombrio_0", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [5,10], raridade: "⬜ Comum", preco: 84 },
  { id: "magica_cajado_radiante_0", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [5,9], raridade: "⬜ Comum", preco: 80 },
  { id: "contato_machado_corrompido_0", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [7,11], raridade: "⬜ Comum", preco: 84 },
  { id: "distancia_besta_sagrado_0", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [6,10], raridade: "⬜ Comum", preco: 82 },
  { id: "magica_bastao_amaldicoado_0", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [8,14], raridade: "⬜ Comum", preco: 54 },
  { id: "contato_lanca_glacial_0", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [5,14], raridade: "⬜ Comum", preco: 45 },
  { id: "distancia_zarabatana_flamejante_0", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [9,12], raridade: "⬜ Comum", preco: 62 },
  { id: "magica_grimorio_espectral_0", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [5,9], raridade: "⬜ Comum", preco: 70 },
  { id: "contato_martelo_runico_0", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [5,12], raridade: "⬜ Comum", preco: 87 },
  { id: "distancia_funda_abissal_0", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [5,10], raridade: "⬜ Comum", preco: 78 },
  { id: "magica_orbe_divino_0", nome: "🪄 Orbe Divino", tipo: "magica", dano: [7,14], raridade: "⬜ Comum", preco: 68 },
  { id: "contato_adaga_vingativo_0", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [9,14], raridade: "⬜ Comum", preco: 60 },
  { id: "distancia_chicote_silencioso_0", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [7,14], raridade: "⬜ Comum", preco: 50 },
  { id: "magica_cetro_etereo_0", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [5,8], raridade: "⬜ Comum", preco: 77 },
  { id: "contato_clava_voraz_0", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [5,10], raridade: "⬜ Comum", preco: 57 },
  { id: "distancia_lamina_arrojadica_imortal_0", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [9,13], raridade: "⬜ Comum", preco: 81 },
  { id: "magica_varinha_cristalino_0", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [5,14], raridade: "⬜ Comum", preco: 42 },
  { id: "contato_foice_tempestuoso_0", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [7,11], raridade: "⬜ Comum", preco: 67 },
  { id: "distancia_arpao_venenoso_0", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [6,13], raridade: "⬜ Comum", preco: 48 },
  { id: "magica_tomo_celestial_0", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [9,13], raridade: "⬜ Comum", preco: 77 },
  { id: "contato_alabarda_profano_0", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [9,12], raridade: "⬜ Comum", preco: 80 },
  { id: "distancia_bumerangue_eterno_0", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [6,9], raridade: "⬜ Comum", preco: 53 },
  { id: "magica_relicario_selvagem_0", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [9,12], raridade: "⬜ Comum", preco: 46 },
  { id: "contato_machadinha_draconiano_0", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [9,14], raridade: "⬜ Comum", preco: 78 },
  { id: "distancia_arco_infernal_0", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [5,10], raridade: "⬜ Comum", preco: 42 },
  { id: "magica_cajado_lunar_0", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [5,14], raridade: "⬜ Comum", preco: 40 },
  { id: "contato_maca_solar_0", nome: "🗡️ Maça Solar", tipo: "contato", dano: [5,12], raridade: "⬜ Comum", preco: 73 },
  { id: "distancia_besta_anciao_0", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [5,10], raridade: "⬜ Comum", preco: 40 },
  { id: "magica_bastao_fantasma_0", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [6,10], raridade: "⬜ Comum", preco: 52 },
  { id: "contato_espada_titanico_0", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [9,14], raridade: "⬜ Comum", preco: 81 },
  { id: "distancia_zarabatana_umbrio_0", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [6,13], raridade: "⬜ Comum", preco: 52 },
  { id: "magica_grimorio_marcado_0", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [6,9], raridade: "⬜ Comum", preco: 47 },
  { id: "contato_machado_perdido_0", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [8,13], raridade: "⬜ Comum", preco: 81 },
  { id: "distancia_funda_bendito_0", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [6,12], raridade: "⬜ Comum", preco: 81 },
  { id: "magica_orbe_impuro_0", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [5,9], raridade: "⬜ Comum", preco: 66 },
  { id: "contato_lanca_nebuloso_0", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [9,12], raridade: "⬜ Comum", preco: 53 },
  { id: "distancia_chicote_ardente_0", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [8,12], raridade: "⬜ Comum", preco: 46 },
  { id: "magica_cetro_congelante_0", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [6,11], raridade: "⬜ Comum", preco: 45 },
  { id: "contato_martelo_sussurrante_0", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [7,13], raridade: "⬜ Comum", preco: 55 },
  { id: "distancia_lamina_arrojadica_nefasto_0", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [8,12], raridade: "⬜ Comum", preco: 46 },
  { id: "magica_varinha_prateado_0", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [5,9], raridade: "⬜ Comum", preco: 48 },
  { id: "contato_adaga_dourado_0", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [5,10], raridade: "⬜ Comum", preco: 75 },
  { id: "distancia_arpao_negro_0", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [8,12], raridade: "⬜ Comum", preco: 69 },
  { id: "magica_tomo_branco_0", nome: "🪄 Tomo Branco", tipo: "magica", dano: [6,12], raridade: "⬜ Comum", preco: 79 },
  { id: "contato_clava_carmesim_0", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [9,13], raridade: "⬜ Comum", preco: 76 },
  { id: "distancia_bumerangue_verdejante_0", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [7,11], raridade: "⬜ Comum", preco: 57 },
  { id: "magica_relicario_cinereo_0", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [5,13], raridade: "⬜ Comum", preco: 57 },
  { id: "contato_foice_espinhoso_0", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [7,14], raridade: "⬜ Comum", preco: 49 },
  { id: "distancia_arco_cristal_0", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [7,10], raridade: "⬜ Comum", preco: 73 },
  { id: "magica_cajado_runa_0", nome: "🪄 Cajado Runa", tipo: "magica", dano: [6,12], raridade: "⬜ Comum", preco: 56 },
  { id: "contato_alabarda_chama_0", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [6,12], raridade: "⬜ Comum", preco: 86 },
  { id: "distancia_besta_trovao_0", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [7,10], raridade: "⬜ Comum", preco: 54 },
  { id: "magica_bastao_vento_0", nome: "🪄 Bastão Vento", tipo: "magica", dano: [5,10], raridade: "⬜ Comum", preco: 87 },
  { id: "contato_machadinha_aco_0", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [8,14], raridade: "⬜ Comum", preco: 45 },
  { id: "distancia_zarabatana_ferro_0", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [6,12], raridade: "⬜ Comum", preco: 67 },
  { id: "magica_grimorio_osso_0", nome: "🪄 Grimório Osso", tipo: "magica", dano: [6,13], raridade: "⬜ Comum", preco: 69 },
  { id: "contato_maca_sangue_0", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [6,10], raridade: "⬜ Comum", preco: 74 },
  { id: "distancia_funda_alma_0", nome: "🏹 Funda Alma", tipo: "distancia", dano: [7,14], raridade: "⬜ Comum", preco: 87 },
  { id: "magica_orbe_vazio_0", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [7,14], raridade: "⬜ Comum", preco: 70 },
  { id: "contato_espada_ancestral_1", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [16,22], raridade: "🟫 Inferior", preco: 106 },
  { id: "distancia_arco_sombrio_1", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [12,17], raridade: "🟫 Inferior", preco: 140 },
  { id: "magica_cajado_radiante_1", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [11,19], raridade: "🟫 Inferior", preco: 151 },
  { id: "contato_machado_corrompido_1", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [14,22], raridade: "🟫 Inferior", preco: 175 },
  { id: "distancia_besta_sagrado_1", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [16,22], raridade: "🟫 Inferior", preco: 156 },
  { id: "magica_bastao_amaldicoado_1", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [10,21], raridade: "🟫 Inferior", preco: 93 },
  { id: "contato_lanca_glacial_1", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [15,21], raridade: "🟫 Inferior", preco: 132 },
  { id: "distancia_zarabatana_flamejante_1", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [16,21], raridade: "🟫 Inferior", preco: 174 },
  { id: "magica_grimorio_espectral_1", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [12,19], raridade: "🟫 Inferior", preco: 111 },
  { id: "contato_martelo_runico_1", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [11,21], raridade: "🟫 Inferior", preco: 157 },
  { id: "distancia_funda_abissal_1", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [15,21], raridade: "🟫 Inferior", preco: 94 },
  { id: "magica_orbe_divino_1", nome: "🪄 Orbe Divino", tipo: "magica", dano: [16,22], raridade: "🟫 Inferior", preco: 129 },
  { id: "contato_adaga_vingativo_1", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [11,16], raridade: "🟫 Inferior", preco: 122 },
  { id: "distancia_chicote_silencioso_1", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [15,21], raridade: "🟫 Inferior", preco: 129 },
  { id: "magica_cetro_etereo_1", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [13,18], raridade: "🟫 Inferior", preco: 175 },
  { id: "contato_clava_voraz_1", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [12,21], raridade: "🟫 Inferior", preco: 115 },
  { id: "distancia_lamina_arrojadica_imortal_1", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [11,19], raridade: "🟫 Inferior", preco: 131 },
  { id: "magica_varinha_cristalino_1", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [11,21], raridade: "🟫 Inferior", preco: 153 },
  { id: "contato_foice_tempestuoso_1", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [11,21], raridade: "🟫 Inferior", preco: 156 },
  { id: "distancia_arpao_venenoso_1", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [16,22], raridade: "🟫 Inferior", preco: 116 },
  { id: "magica_tomo_celestial_1", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [10,15], raridade: "🟫 Inferior", preco: 91 },
  { id: "contato_alabarda_profano_1", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [14,19], raridade: "🟫 Inferior", preco: 172 },
  { id: "distancia_bumerangue_eterno_1", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [13,20], raridade: "🟫 Inferior", preco: 131 },
  { id: "magica_relicario_selvagem_1", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [10,18], raridade: "🟫 Inferior", preco: 101 },
  { id: "contato_machadinha_draconiano_1", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [13,20], raridade: "🟫 Inferior", preco: 109 },
  { id: "distancia_arco_infernal_1", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [16,20], raridade: "🟫 Inferior", preco: 157 },
  { id: "magica_cajado_lunar_1", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [14,20], raridade: "🟫 Inferior", preco: 137 },
  { id: "contato_maca_solar_1", nome: "🗡️ Maça Solar", tipo: "contato", dano: [12,17], raridade: "🟫 Inferior", preco: 154 },
  { id: "distancia_besta_anciao_1", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [13,17], raridade: "🟫 Inferior", preco: 110 },
  { id: "magica_bastao_fantasma_1", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [12,19], raridade: "🟫 Inferior", preco: 100 },
  { id: "contato_espada_titanico_1", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [16,21], raridade: "🟫 Inferior", preco: 155 },
  { id: "distancia_zarabatana_umbrio_1", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [14,19], raridade: "🟫 Inferior", preco: 161 },
  { id: "magica_grimorio_marcado_1", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [11,20], raridade: "🟫 Inferior", preco: 164 },
  { id: "contato_machado_perdido_1", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [16,21], raridade: "🟫 Inferior", preco: 144 },
  { id: "distancia_funda_bendito_1", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [12,20], raridade: "🟫 Inferior", preco: 152 },
  { id: "magica_orbe_impuro_1", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [12,18], raridade: "🟫 Inferior", preco: 103 },
  { id: "contato_lanca_nebuloso_1", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [15,20], raridade: "🟫 Inferior", preco: 161 },
  { id: "distancia_chicote_ardente_1", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [14,18], raridade: "🟫 Inferior", preco: 129 },
  { id: "magica_cetro_congelante_1", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [13,21], raridade: "🟫 Inferior", preco: 131 },
  { id: "contato_martelo_sussurrante_1", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [12,22], raridade: "🟫 Inferior", preco: 164 },
  { id: "distancia_lamina_arrojadica_nefasto_1", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [13,22], raridade: "🟫 Inferior", preco: 133 },
  { id: "magica_varinha_prateado_1", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [14,19], raridade: "🟫 Inferior", preco: 154 },
  { id: "contato_adaga_dourado_1", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [11,21], raridade: "🟫 Inferior", preco: 95 },
  { id: "distancia_arpao_negro_1", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [11,19], raridade: "🟫 Inferior", preco: 136 },
  { id: "magica_tomo_branco_1", nome: "🪄 Tomo Branco", tipo: "magica", dano: [12,20], raridade: "🟫 Inferior", preco: 171 },
  { id: "contato_clava_carmesim_1", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [13,19], raridade: "🟫 Inferior", preco: 122 },
  { id: "distancia_bumerangue_verdejante_1", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [14,19], raridade: "🟫 Inferior", preco: 130 },
  { id: "magica_relicario_cinereo_1", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [13,22], raridade: "🟫 Inferior", preco: 173 },
  { id: "contato_foice_espinhoso_1", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [14,18], raridade: "🟫 Inferior", preco: 92 },
  { id: "distancia_arco_cristal_1", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [16,22], raridade: "🟫 Inferior", preco: 122 },
  { id: "magica_cajado_runa_1", nome: "🪄 Cajado Runa", tipo: "magica", dano: [10,22], raridade: "🟫 Inferior", preco: 175 },
  { id: "contato_alabarda_chama_1", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [14,20], raridade: "🟫 Inferior", preco: 170 },
  { id: "distancia_besta_trovao_1", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [13,20], raridade: "🟫 Inferior", preco: 153 },
  { id: "magica_bastao_vento_1", nome: "🪄 Bastão Vento", tipo: "magica", dano: [16,20], raridade: "🟫 Inferior", preco: 101 },
  { id: "contato_machadinha_aco_1", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [10,21], raridade: "🟫 Inferior", preco: 118 },
  { id: "distancia_zarabatana_ferro_1", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [13,18], raridade: "🟫 Inferior", preco: 152 },
  { id: "magica_grimorio_osso_1", nome: "🪄 Grimório Osso", tipo: "magica", dano: [13,22], raridade: "🟫 Inferior", preco: 124 },
  { id: "contato_maca_sangue_1", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [13,22], raridade: "🟫 Inferior", preco: 138 },
  { id: "distancia_funda_alma_1", nome: "🏹 Funda Alma", tipo: "distancia", dano: [13,17], raridade: "🟫 Inferior", preco: 93 },
  { id: "magica_orbe_vazio_1", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [15,20], raridade: "🟫 Inferior", preco: 144 },
  { id: "contato_espada_ancestral_2", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [18,28], raridade: "🟩 Incomum", preco: 290 },
  { id: "distancia_arco_sombrio_2", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [24,32], raridade: "🟩 Incomum", preco: 190 },
  { id: "magica_cajado_radiante_2", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [25,33], raridade: "🟩 Incomum", preco: 182 },
  { id: "contato_machado_corrompido_2", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [20,26], raridade: "🟩 Incomum", preco: 312 },
  { id: "distancia_besta_sagrado_2", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [24,33], raridade: "🟩 Incomum", preco: 216 },
  { id: "magica_bastao_amaldicoado_2", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [23,33], raridade: "🟩 Incomum", preco: 309 },
  { id: "contato_lanca_glacial_2", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [26,32], raridade: "🟩 Incomum", preco: 272 },
  { id: "distancia_zarabatana_flamejante_2", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [23,28], raridade: "🟩 Incomum", preco: 310 },
  { id: "magica_grimorio_espectral_2", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [22,29], raridade: "🟩 Incomum", preco: 254 },
  { id: "contato_martelo_runico_2", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [26,33], raridade: "🟩 Incomum", preco: 320 },
  { id: "distancia_funda_abissal_2", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [24,33], raridade: "🟩 Incomum", preco: 279 },
  { id: "magica_orbe_divino_2", nome: "🪄 Orbe Divino", tipo: "magica", dano: [19,33], raridade: "🟩 Incomum", preco: 289 },
  { id: "contato_adaga_vingativo_2", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [20,32], raridade: "🟩 Incomum", preco: 291 },
  { id: "distancia_chicote_silencioso_2", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [19,27], raridade: "🟩 Incomum", preco: 259 },
  { id: "magica_cetro_etereo_2", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [24,29], raridade: "🟩 Incomum", preco: 249 },
  { id: "contato_clava_voraz_2", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [26,33], raridade: "🟩 Incomum", preco: 216 },
  { id: "distancia_lamina_arrojadica_imortal_2", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [20,26], raridade: "🟩 Incomum", preco: 270 },
  { id: "magica_varinha_cristalino_2", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [22,34], raridade: "🟩 Incomum", preco: 297 },
  { id: "contato_foice_tempestuoso_2", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [24,34], raridade: "🟩 Incomum", preco: 261 },
  { id: "distancia_arpao_venenoso_2", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [18,23], raridade: "🟩 Incomum", preco: 243 },
  { id: "magica_tomo_celestial_2", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [20,26], raridade: "🟩 Incomum", preco: 317 },
  { id: "contato_alabarda_profano_2", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [20,33], raridade: "🟩 Incomum", preco: 244 },
  { id: "distancia_bumerangue_eterno_2", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [22,33], raridade: "🟩 Incomum", preco: 311 },
  { id: "magica_relicario_selvagem_2", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [19,28], raridade: "🟩 Incomum", preco: 248 },
  { id: "contato_machadinha_draconiano_2", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [25,31], raridade: "🟩 Incomum", preco: 317 },
  { id: "distancia_arco_infernal_2", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [25,30], raridade: "🟩 Incomum", preco: 217 },
  { id: "magica_cajado_lunar_2", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [26,31], raridade: "🟩 Incomum", preco: 194 },
  { id: "contato_maca_solar_2", nome: "🗡️ Maça Solar", tipo: "contato", dano: [20,25], raridade: "🟩 Incomum", preco: 282 },
  { id: "distancia_besta_anciao_2", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [23,30], raridade: "🟩 Incomum", preco: 263 },
  { id: "magica_bastao_fantasma_2", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [22,28], raridade: "🟩 Incomum", preco: 183 },
  { id: "contato_espada_titanico_2", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [24,29], raridade: "🟩 Incomum", preco: 314 },
  { id: "distancia_zarabatana_umbrio_2", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [24,30], raridade: "🟩 Incomum", preco: 276 },
  { id: "magica_grimorio_marcado_2", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [26,33], raridade: "🟩 Incomum", preco: 182 },
  { id: "contato_machado_perdido_2", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [20,34], raridade: "🟩 Incomum", preco: 209 },
  { id: "distancia_funda_bendito_2", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [22,30], raridade: "🟩 Incomum", preco: 304 },
  { id: "magica_orbe_impuro_2", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [26,31], raridade: "🟩 Incomum", preco: 318 },
  { id: "contato_lanca_nebuloso_2", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [26,32], raridade: "🟩 Incomum", preco: 205 },
  { id: "distancia_chicote_ardente_2", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [23,29], raridade: "🟩 Incomum", preco: 281 },
  { id: "magica_cetro_congelante_2", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [25,33], raridade: "🟩 Incomum", preco: 246 },
  { id: "contato_martelo_sussurrante_2", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [18,34], raridade: "🟩 Incomum", preco: 212 },
  { id: "distancia_lamina_arrojadica_nefasto_2", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [18,29], raridade: "🟩 Incomum", preco: 206 },
  { id: "magica_varinha_prateado_2", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [18,25], raridade: "🟩 Incomum", preco: 216 },
  { id: "contato_adaga_dourado_2", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [24,30], raridade: "🟩 Incomum", preco: 317 },
  { id: "distancia_arpao_negro_2", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [24,32], raridade: "🟩 Incomum", preco: 258 },
  { id: "magica_tomo_branco_2", nome: "🪄 Tomo Branco", tipo: "magica", dano: [21,28], raridade: "🟩 Incomum", preco: 286 },
  { id: "contato_clava_carmesim_2", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [21,31], raridade: "🟩 Incomum", preco: 258 },
  { id: "distancia_bumerangue_verdejante_2", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [22,33], raridade: "🟩 Incomum", preco: 202 },
  { id: "magica_relicario_cinereo_2", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [24,33], raridade: "🟩 Incomum", preco: 266 },
  { id: "contato_foice_espinhoso_2", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [26,31], raridade: "🟩 Incomum", preco: 196 },
  { id: "distancia_arco_cristal_2", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [21,29], raridade: "🟩 Incomum", preco: 266 },
  { id: "magica_cajado_runa_2", nome: "🪄 Cajado Runa", tipo: "magica", dano: [20,27], raridade: "🟩 Incomum", preco: 299 },
  { id: "contato_alabarda_chama_2", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [26,33], raridade: "🟩 Incomum", preco: 307 },
  { id: "distancia_besta_trovao_2", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [24,32], raridade: "🟩 Incomum", preco: 308 },
  { id: "magica_bastao_vento_2", nome: "🪄 Bastão Vento", tipo: "magica", dano: [23,32], raridade: "🟩 Incomum", preco: 296 },
  { id: "contato_machadinha_aco_2", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [21,30], raridade: "🟩 Incomum", preco: 281 },
  { id: "distancia_zarabatana_ferro_2", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [26,32], raridade: "🟩 Incomum", preco: 273 },
  { id: "magica_grimorio_osso_2", nome: "🪄 Grimório Osso", tipo: "magica", dano: [19,28], raridade: "🟩 Incomum", preco: 312 },
  { id: "contato_maca_sangue_2", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [18,24], raridade: "🟩 Incomum", preco: 224 },
  { id: "distancia_funda_alma_2", nome: "🏹 Funda Alma", tipo: "distancia", dano: [19,31], raridade: "🟩 Incomum", preco: 303 },
  { id: "magica_orbe_vazio_2", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [20,30], raridade: "🟩 Incomum", preco: 303 },
  { id: "contato_espada_ancestral_3", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [36,49], raridade: "🟦 Raro", preco: 355 },
  { id: "distancia_arco_sombrio_3", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [36,49], raridade: "🟦 Raro", preco: 433 },
  { id: "magica_cajado_radiante_3", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [36,47], raridade: "🟦 Raro", preco: 480 },
  { id: "contato_machado_corrompido_3", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [30,47], raridade: "🟦 Raro", preco: 515 },
  { id: "distancia_besta_sagrado_3", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [36,50], raridade: "🟦 Raro", preco: 339 },
  { id: "magica_bastao_amaldicoado_3", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [37,52], raridade: "🟦 Raro", preco: 447 },
  { id: "contato_lanca_glacial_3", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [31,38], raridade: "🟦 Raro", preco: 447 },
  { id: "distancia_zarabatana_flamejante_3", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [36,48], raridade: "🟦 Raro", preco: 492 },
  { id: "magica_grimorio_espectral_3", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [38,52], raridade: "🟦 Raro", preco: 472 },
  { id: "contato_martelo_runico_3", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [40,51], raridade: "🟦 Raro", preco: 401 },
  { id: "distancia_funda_abissal_3", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [35,50], raridade: "🟦 Raro", preco: 519 },
  { id: "magica_orbe_divino_3", nome: "🪄 Orbe Divino", tipo: "magica", dano: [35,47], raridade: "🟦 Raro", preco: 413 },
  { id: "contato_adaga_vingativo_3", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [35,47], raridade: "🟦 Raro", preco: 531 },
  { id: "distancia_chicote_silencioso_3", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [38,45], raridade: "🟦 Raro", preco: 410 },
  { id: "magica_cetro_etereo_3", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [40,52], raridade: "🟦 Raro", preco: 536 },
  { id: "contato_clava_voraz_3", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [35,43], raridade: "🟦 Raro", preco: 414 },
  { id: "distancia_lamina_arrojadica_imortal_3", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [30,37], raridade: "🟦 Raro", preco: 474 },
  { id: "magica_varinha_cristalino_3", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [32,47], raridade: "🟦 Raro", preco: 352 },
  { id: "contato_foice_tempestuoso_3", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [37,49], raridade: "🟦 Raro", preco: 467 },
  { id: "distancia_arpao_venenoso_3", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [34,48], raridade: "🟦 Raro", preco: 444 },
  { id: "magica_tomo_celestial_3", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [32,46], raridade: "🟦 Raro", preco: 382 },
  { id: "contato_alabarda_profano_3", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [37,49], raridade: "🟦 Raro", preco: 542 },
  { id: "distancia_bumerangue_eterno_3", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [36,49], raridade: "🟦 Raro", preco: 524 },
  { id: "magica_relicario_selvagem_3", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [31,38], raridade: "🟦 Raro", preco: 404 },
  { id: "contato_machadinha_draconiano_3", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [34,51], raridade: "🟦 Raro", preco: 444 },
  { id: "distancia_arco_infernal_3", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [30,40], raridade: "🟦 Raro", preco: 423 },
  { id: "magica_cajado_lunar_3", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [32,43], raridade: "🟦 Raro", preco: 502 },
  { id: "contato_maca_solar_3", nome: "🗡️ Maça Solar", tipo: "contato", dano: [33,44], raridade: "🟦 Raro", preco: 410 },
  { id: "distancia_besta_anciao_3", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [33,45], raridade: "🟦 Raro", preco: 350 },
  { id: "magica_bastao_fantasma_3", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [40,49], raridade: "🟦 Raro", preco: 484 },
  { id: "contato_espada_titanico_3", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [34,48], raridade: "🟦 Raro", preco: 424 },
  { id: "distancia_zarabatana_umbrio_3", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [30,51], raridade: "🟦 Raro", preco: 325 },
  { id: "magica_grimorio_marcado_3", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [34,42], raridade: "🟦 Raro", preco: 466 },
  { id: "contato_machado_perdido_3", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [39,51], raridade: "🟦 Raro", preco: 532 },
  { id: "distancia_funda_bendito_3", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [35,52], raridade: "🟦 Raro", preco: 476 },
  { id: "magica_orbe_impuro_3", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [36,48], raridade: "🟦 Raro", preco: 510 },
  { id: "contato_lanca_nebuloso_3", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [33,50], raridade: "🟦 Raro", preco: 359 },
  { id: "distancia_chicote_ardente_3", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [30,38], raridade: "🟦 Raro", preco: 361 },
  { id: "magica_cetro_congelante_3", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [33,48], raridade: "🟦 Raro", preco: 540 },
  { id: "contato_martelo_sussurrante_3", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [35,51], raridade: "🟦 Raro", preco: 539 },
  { id: "distancia_lamina_arrojadica_nefasto_3", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [31,45], raridade: "🟦 Raro", preco: 492 },
  { id: "magica_varinha_prateado_3", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [39,47], raridade: "🟦 Raro", preco: 427 },
  { id: "contato_adaga_dourado_3", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [39,51], raridade: "🟦 Raro", preco: 366 },
  { id: "distancia_arpao_negro_3", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [41,49], raridade: "🟦 Raro", preco: 416 },
  { id: "magica_tomo_branco_3", nome: "🪄 Tomo Branco", tipo: "magica", dano: [30,39], raridade: "🟦 Raro", preco: 510 },
  { id: "contato_clava_carmesim_3", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [41,52], raridade: "🟦 Raro", preco: 458 },
  { id: "distancia_bumerangue_verdejante_3", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [38,49], raridade: "🟦 Raro", preco: 507 },
  { id: "magica_relicario_cinereo_3", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [40,51], raridade: "🟦 Raro", preco: 439 },
  { id: "contato_foice_espinhoso_3", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [34,49], raridade: "🟦 Raro", preco: 384 },
  { id: "distancia_arco_cristal_3", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [35,51], raridade: "🟦 Raro", preco: 327 },
  { id: "magica_cajado_runa_3", nome: "🪄 Cajado Runa", tipo: "magica", dano: [30,37], raridade: "🟦 Raro", preco: 367 },
  { id: "contato_alabarda_chama_3", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [30,50], raridade: "🟦 Raro", preco: 356 },
  { id: "distancia_besta_trovao_3", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [33,45], raridade: "🟦 Raro", preco: 436 },
  { id: "magica_bastao_vento_3", nome: "🪄 Bastão Vento", tipo: "magica", dano: [30,46], raridade: "🟦 Raro", preco: 339 },
  { id: "contato_machadinha_aco_3", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [39,52], raridade: "🟦 Raro", preco: 385 },
  { id: "distancia_zarabatana_ferro_3", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [35,49], raridade: "🟦 Raro", preco: 526 },
  { id: "magica_grimorio_osso_3", nome: "🪄 Grimório Osso", tipo: "magica", dano: [31,40], raridade: "🟦 Raro", preco: 395 },
  { id: "contato_maca_sangue_3", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [33,41], raridade: "🟦 Raro", preco: 451 },
  { id: "distancia_funda_alma_3", nome: "🏹 Funda Alma", tipo: "distancia", dano: [40,50], raridade: "🟦 Raro", preco: 536 },
  { id: "magica_orbe_vazio_3", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [39,48], raridade: "🟦 Raro", preco: 451 },
  { id: "contato_espada_ancestral_4", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [55,68], raridade: "🟪 Épico", preco: 638 },
  { id: "distancia_arco_sombrio_4", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [55,77], raridade: "🟪 Épico", preco: 617 },
  { id: "magica_cajado_radiante_4", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [59,73], raridade: "🟪 Épico", preco: 832 },
  { id: "contato_machado_corrompido_4", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [55,68], raridade: "🟪 Épico", preco: 575 },
  { id: "distancia_besta_sagrado_4", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [58,74], raridade: "🟪 Épico", preco: 662 },
  { id: "magica_bastao_amaldicoado_4", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [53,68], raridade: "🟪 Épico", preco: 790 },
  { id: "contato_lanca_glacial_4", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [63,77], raridade: "🟪 Épico", preco: 555 },
  { id: "distancia_zarabatana_flamejante_4", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [48,60], raridade: "🟪 Épico", preco: 556 },
  { id: "magica_grimorio_espectral_4", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [51,62], raridade: "🟪 Épico", preco: 807 },
  { id: "contato_martelo_runico_4", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [50,62], raridade: "🟪 Épico", preco: 781 },
  { id: "distancia_funda_abissal_4", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [55,77], raridade: "🟪 Épico", preco: 621 },
  { id: "magica_orbe_divino_4", nome: "🪄 Orbe Divino", tipo: "magica", dano: [54,70], raridade: "🟪 Épico", preco: 899 },
  { id: "contato_adaga_vingativo_4", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [63,74], raridade: "🟪 Épico", preco: 564 },
  { id: "distancia_chicote_silencioso_4", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [62,73], raridade: "🟪 Épico", preco: 763 },
  { id: "magica_cetro_etereo_4", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [62,75], raridade: "🟪 Épico", preco: 787 },
  { id: "contato_clava_voraz_4", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [53,65], raridade: "🟪 Épico", preco: 915 },
  { id: "distancia_lamina_arrojadica_imortal_4", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [62,76], raridade: "🟪 Épico", preco: 888 },
  { id: "magica_varinha_cristalino_4", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [49,60], raridade: "🟪 Épico", preco: 637 },
  { id: "contato_foice_tempestuoso_4", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [51,77], raridade: "🟪 Épico", preco: 627 },
  { id: "distancia_arpao_venenoso_4", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [54,78], raridade: "🟪 Épico", preco: 675 },
  { id: "magica_tomo_celestial_4", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [53,74], raridade: "🟪 Épico", preco: 916 },
  { id: "contato_alabarda_profano_4", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [49,66], raridade: "🟪 Épico", preco: 934 },
  { id: "distancia_bumerangue_eterno_4", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [57,77], raridade: "🟪 Épico", preco: 642 },
  { id: "magica_relicario_selvagem_4", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [54,70], raridade: "🟪 Épico", preco: 687 },
  { id: "contato_machadinha_draconiano_4", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [52,67], raridade: "🟪 Épico", preco: 925 },
  { id: "distancia_arco_infernal_4", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [60,78], raridade: "🟪 Épico", preco: 698 },
  { id: "magica_cajado_lunar_4", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [55,74], raridade: "🟪 Épico", preco: 851 },
  { id: "contato_maca_solar_4", nome: "🗡️ Maça Solar", tipo: "contato", dano: [53,64], raridade: "🟪 Épico", preco: 939 },
  { id: "distancia_besta_anciao_4", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [49,59], raridade: "🟪 Épico", preco: 668 },
  { id: "magica_bastao_fantasma_4", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [61,75], raridade: "🟪 Épico", preco: 676 },
  { id: "contato_espada_titanico_4", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [57,69], raridade: "🟪 Épico", preco: 906 },
  { id: "distancia_zarabatana_umbrio_4", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [60,74], raridade: "🟪 Épico", preco: 726 },
  { id: "magica_grimorio_marcado_4", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [59,70], raridade: "🟪 Épico", preco: 803 },
  { id: "contato_machado_perdido_4", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [48,60], raridade: "🟪 Épico", preco: 703 },
  { id: "distancia_funda_bendito_4", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [55,74], raridade: "🟪 Épico", preco: 793 },
  { id: "magica_orbe_impuro_4", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [63,76], raridade: "🟪 Épico", preco: 921 },
  { id: "contato_lanca_nebuloso_4", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [51,61], raridade: "🟪 Épico", preco: 904 },
  { id: "distancia_chicote_ardente_4", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [49,70], raridade: "🟪 Épico", preco: 642 },
  { id: "magica_cetro_congelante_4", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [58,68], raridade: "🟪 Épico", preco: 784 },
  { id: "contato_martelo_sussurrante_4", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [62,78], raridade: "🟪 Épico", preco: 886 },
  { id: "distancia_lamina_arrojadica_nefasto_4", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [63,76], raridade: "🟪 Épico", preco: 657 },
  { id: "magica_varinha_prateado_4", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [52,70], raridade: "🟪 Épico", preco: 757 },
  { id: "contato_adaga_dourado_4", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [48,69], raridade: "🟪 Épico", preco: 831 },
  { id: "distancia_arpao_negro_4", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [62,78], raridade: "🟪 Épico", preco: 575 },
  { id: "magica_tomo_branco_4", nome: "🪄 Tomo Branco", tipo: "magica", dano: [58,68], raridade: "🟪 Épico", preco: 656 },
  { id: "contato_clava_carmesim_4", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [52,68], raridade: "🟪 Épico", preco: 916 },
  { id: "distancia_bumerangue_verdejante_4", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [48,66], raridade: "🟪 Épico", preco: 946 },
  { id: "magica_relicario_cinereo_4", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [55,71], raridade: "🟪 Épico", preco: 803 },
  { id: "contato_foice_espinhoso_4", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [54,69], raridade: "🟪 Épico", preco: 907 },
  { id: "distancia_arco_cristal_4", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [51,76], raridade: "🟪 Épico", preco: 801 },
  { id: "magica_cajado_runa_4", nome: "🪄 Cajado Runa", tipo: "magica", dano: [62,74], raridade: "🟪 Épico", preco: 770 },
  { id: "contato_alabarda_chama_4", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [55,65], raridade: "🟪 Épico", preco: 654 },
  { id: "distancia_besta_trovao_4", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [53,72], raridade: "🟪 Épico", preco: 818 },
  { id: "magica_bastao_vento_4", nome: "🪄 Bastão Vento", tipo: "magica", dano: [61,78], raridade: "🟪 Épico", preco: 741 },
  { id: "contato_machadinha_aco_4", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [63,75], raridade: "🟪 Épico", preco: 740 },
  { id: "distancia_zarabatana_ferro_4", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [51,68], raridade: "🟪 Épico", preco: 937 },
  { id: "magica_grimorio_osso_4", nome: "🪄 Grimório Osso", tipo: "magica", dano: [59,69], raridade: "🟪 Épico", preco: 589 },
  { id: "contato_maca_sangue_4", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [63,74], raridade: "🟪 Épico", preco: 608 },
  { id: "distancia_funda_alma_4", nome: "🏹 Funda Alma", tipo: "distancia", dano: [49,71], raridade: "🟪 Épico", preco: 577 },
  { id: "magica_orbe_vazio_4", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [59,71], raridade: "🟪 Épico", preco: 656 },
  { id: "contato_espada_ancestral_5", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [91,104], raridade: "🟨 Lendário", preco: 1087 },
  { id: "distancia_arco_sombrio_5", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [78,106], raridade: "🟨 Lendário", preco: 1209 },
  { id: "magica_cajado_radiante_5", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [90,102], raridade: "🟨 Lendário", preco: 1091 },
  { id: "contato_machado_corrompido_5", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [88,101], raridade: "🟨 Lendário", preco: 1036 },
  { id: "distancia_besta_sagrado_5", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [91,107], raridade: "🟨 Lendário", preco: 1229 },
  { id: "magica_bastao_amaldicoado_5", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [88,107], raridade: "🟨 Lendário", preco: 1407 },
  { id: "contato_lanca_glacial_5", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [78,97], raridade: "🟨 Lendário", preco: 1585 },
  { id: "distancia_zarabatana_flamejante_5", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [75,100], raridade: "🟨 Lendário", preco: 1333 },
  { id: "magica_grimorio_espectral_5", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [85,102], raridade: "🟨 Lendário", preco: 1491 },
  { id: "contato_martelo_runico_5", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [83,97], raridade: "🟨 Lendário", preco: 970 },
  { id: "distancia_funda_abissal_5", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [80,98], raridade: "🟨 Lendário", preco: 1586 },
  { id: "magica_orbe_divino_5", nome: "🪄 Orbe Divino", tipo: "magica", dano: [76,96], raridade: "🟨 Lendário", preco: 1405 },
  { id: "contato_adaga_vingativo_5", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [86,106], raridade: "🟨 Lendário", preco: 1313 },
  { id: "distancia_chicote_silencioso_5", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [75,105], raridade: "🟨 Lendário", preco: 1441 },
  { id: "magica_cetro_etereo_5", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [80,101], raridade: "🟨 Lendário", preco: 1049 },
  { id: "contato_clava_voraz_5", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [73,95], raridade: "🟨 Lendário", preco: 1031 },
  { id: "distancia_lamina_arrojadica_imortal_5", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [76,90], raridade: "🟨 Lendário", preco: 1191 },
  { id: "magica_varinha_cristalino_5", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [85,99], raridade: "🟨 Lendário", preco: 1385 },
  { id: "contato_foice_tempestuoso_5", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [72,85], raridade: "🟨 Lendário", preco: 1524 },
  { id: "distancia_arpao_venenoso_5", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [91,108], raridade: "🟨 Lendário", preco: 1070 },
  { id: "magica_tomo_celestial_5", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [83,98], raridade: "🟨 Lendário", preco: 1528 },
  { id: "contato_alabarda_profano_5", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [73,93], raridade: "🟨 Lendário", preco: 1285 },
  { id: "distancia_bumerangue_eterno_5", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [88,100], raridade: "🟨 Lendário", preco: 1537 },
  { id: "magica_relicario_selvagem_5", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [80,106], raridade: "🟨 Lendário", preco: 1292 },
  { id: "contato_machadinha_draconiano_5", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [85,107], raridade: "🟨 Lendário", preco: 1503 },
  { id: "distancia_arco_infernal_5", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [79,102], raridade: "🟨 Lendário", preco: 1440 },
  { id: "magica_cajado_lunar_5", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [87,109], raridade: "🟨 Lendário", preco: 1429 },
  { id: "contato_maca_solar_5", nome: "🗡️ Maça Solar", tipo: "contato", dano: [72,103], raridade: "🟨 Lendário", preco: 1487 },
  { id: "distancia_besta_anciao_5", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [80,96], raridade: "🟨 Lendário", preco: 1575 },
  { id: "magica_bastao_fantasma_5", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [85,99], raridade: "🟨 Lendário", preco: 1536 },
  { id: "contato_espada_titanico_5", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [89,106], raridade: "🟨 Lendário", preco: 1593 },
  { id: "distancia_zarabatana_umbrio_5", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [79,107], raridade: "🟨 Lendário", preco: 1494 },
  { id: "magica_grimorio_marcado_5", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [91,110], raridade: "🟨 Lendário", preco: 1442 },
  { id: "contato_machado_perdido_5", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [75,110], raridade: "🟨 Lendário", preco: 1338 },
  { id: "distancia_funda_bendito_5", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [80,92], raridade: "🟨 Lendário", preco: 1522 },
  { id: "magica_orbe_impuro_5", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [79,97], raridade: "🟨 Lendário", preco: 1194 },
  { id: "contato_lanca_nebuloso_5", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [88,109], raridade: "🟨 Lendário", preco: 1246 },
  { id: "distancia_chicote_ardente_5", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [81,101], raridade: "🟨 Lendário", preco: 1559 },
  { id: "magica_cetro_congelante_5", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [73,102], raridade: "🟨 Lendário", preco: 1551 },
  { id: "contato_martelo_sussurrante_5", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [77,96], raridade: "🟨 Lendário", preco: 1366 },
  { id: "distancia_lamina_arrojadica_nefasto_5", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [83,101], raridade: "🟨 Lendário", preco: 1461 },
  { id: "magica_varinha_prateado_5", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [81,100], raridade: "🟨 Lendário", preco: 1413 },
  { id: "contato_adaga_dourado_5", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [82,97], raridade: "🟨 Lendário", preco: 1072 },
  { id: "distancia_arpao_negro_5", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [83,108], raridade: "🟨 Lendário", preco: 1247 },
  { id: "magica_tomo_branco_5", nome: "🪄 Tomo Branco", tipo: "magica", dano: [86,100], raridade: "🟨 Lendário", preco: 1300 },
  { id: "contato_clava_carmesim_5", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [74,105], raridade: "🟨 Lendário", preco: 1306 },
  { id: "distancia_bumerangue_verdejante_5", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [89,110], raridade: "🟨 Lendário", preco: 991 },
  { id: "magica_relicario_cinereo_5", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [89,109], raridade: "🟨 Lendário", preco: 966 },
  { id: "contato_foice_espinhoso_5", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [80,110], raridade: "🟨 Lendário", preco: 1193 },
  { id: "distancia_arco_cristal_5", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [73,110], raridade: "🟨 Lendário", preco: 1591 },
  { id: "magica_cajado_runa_5", nome: "🪄 Cajado Runa", tipo: "magica", dano: [84,107], raridade: "🟨 Lendário", preco: 1531 },
  { id: "contato_alabarda_chama_5", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [79,96], raridade: "🟨 Lendário", preco: 1241 },
  { id: "distancia_besta_trovao_5", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [74,90], raridade: "🟨 Lendário", preco: 1525 },
  { id: "magica_bastao_vento_5", nome: "🪄 Bastão Vento", tipo: "magica", dano: [82,94], raridade: "🟨 Lendário", preco: 1154 },
  { id: "contato_machadinha_aco_5", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [74,92], raridade: "🟨 Lendário", preco: 1533 },
  { id: "distancia_zarabatana_ferro_5", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [84,101], raridade: "🟨 Lendário", preco: 1192 },
  { id: "magica_grimorio_osso_5", nome: "🪄 Grimório Osso", tipo: "magica", dano: [72,88], raridade: "🟨 Lendário", preco: 1343 },
  { id: "contato_maca_sangue_5", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [73,94], raridade: "🟨 Lendário", preco: 1378 },
  { id: "distancia_funda_alma_5", nome: "🏹 Funda Alma", tipo: "distancia", dano: [88,100], raridade: "🟨 Lendário", preco: 1463 },
  { id: "magica_orbe_vazio_5", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [85,107], raridade: "🟨 Lendário", preco: 1196 },
  { id: "contato_espada_ancestral_6", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [125,150], raridade: "🔶 Ancestral", preco: 2101 },
  { id: "distancia_arco_sombrio_6", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [103,137], raridade: "🔶 Ancestral", preco: 1848 },
  { id: "magica_cajado_radiante_6", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [122,147], raridade: "🔶 Ancestral", preco: 2240 },
  { id: "contato_machado_corrompido_6", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [107,145], raridade: "🔶 Ancestral", preco: 2572 },
  { id: "distancia_besta_sagrado_6", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [109,125], raridade: "🔶 Ancestral", preco: 1784 },
  { id: "magica_bastao_amaldicoado_6", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [123,143], raridade: "🔶 Ancestral", preco: 1901 },
  { id: "contato_lanca_glacial_6", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [121,149], raridade: "🔶 Ancestral", preco: 1817 },
  { id: "distancia_zarabatana_flamejante_6", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [102,150], raridade: "🔶 Ancestral", preco: 1777 },
  { id: "magica_grimorio_espectral_6", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [100,119], raridade: "🔶 Ancestral", preco: 2513 },
  { id: "contato_martelo_runico_6", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [123,150], raridade: "🔶 Ancestral", preco: 1976 },
  { id: "distancia_funda_abissal_6", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [102,135], raridade: "🔶 Ancestral", preco: 2109 },
  { id: "magica_orbe_divino_6", nome: "🪄 Orbe Divino", tipo: "magica", dano: [117,149], raridade: "🔶 Ancestral", preco: 2302 },
  { id: "contato_adaga_vingativo_6", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [119,149], raridade: "🔶 Ancestral", preco: 1634 },
  { id: "distancia_chicote_silencioso_6", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [113,134], raridade: "🔶 Ancestral", preco: 2226 },
  { id: "magica_cetro_etereo_6", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [101,128], raridade: "🔶 Ancestral", preco: 2419 },
  { id: "contato_clava_voraz_6", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [104,123], raridade: "🔶 Ancestral", preco: 2379 },
  { id: "distancia_lamina_arrojadica_imortal_6", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [109,141], raridade: "🔶 Ancestral", preco: 1877 },
  { id: "magica_varinha_cristalino_6", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [111,133], raridade: "🔶 Ancestral", preco: 2554 },
  { id: "contato_foice_tempestuoso_6", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [101,144], raridade: "🔶 Ancestral", preco: 2511 },
  { id: "distancia_arpao_venenoso_6", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [118,134], raridade: "🔶 Ancestral", preco: 2253 },
  { id: "magica_tomo_celestial_6", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [112,135], raridade: "🔶 Ancestral", preco: 1699 },
  { id: "contato_alabarda_profano_6", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [115,136], raridade: "🔶 Ancestral", preco: 1689 },
  { id: "distancia_bumerangue_eterno_6", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [101,133], raridade: "🔶 Ancestral", preco: 2036 },
  { id: "magica_relicario_selvagem_6", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [108,134], raridade: "🔶 Ancestral", preco: 1886 },
  { id: "contato_machadinha_draconiano_6", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [103,148], raridade: "🔶 Ancestral", preco: 2506 },
  { id: "distancia_arco_infernal_6", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [125,146], raridade: "🔶 Ancestral", preco: 2560 },
  { id: "magica_cajado_lunar_6", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [113,136], raridade: "🔶 Ancestral", preco: 1756 },
  { id: "contato_maca_solar_6", nome: "🗡️ Maça Solar", tipo: "contato", dano: [122,149], raridade: "🔶 Ancestral", preco: 1805 },
  { id: "distancia_besta_anciao_6", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [104,150], raridade: "🔶 Ancestral", preco: 2482 },
  { id: "magica_bastao_fantasma_6", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [123,141], raridade: "🔶 Ancestral", preco: 1681 },
  { id: "contato_espada_titanico_6", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [103,124], raridade: "🔶 Ancestral", preco: 2389 },
  { id: "distancia_zarabatana_umbrio_6", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [103,120], raridade: "🔶 Ancestral", preco: 2367 },
  { id: "magica_grimorio_marcado_6", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [110,131], raridade: "🔶 Ancestral", preco: 2472 },
  { id: "contato_machado_perdido_6", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [109,149], raridade: "🔶 Ancestral", preco: 2547 },
  { id: "distancia_funda_bendito_6", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [101,121], raridade: "🔶 Ancestral", preco: 2245 },
  { id: "magica_orbe_impuro_6", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [117,140], raridade: "🔶 Ancestral", preco: 2183 },
  { id: "contato_lanca_nebuloso_6", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [115,143], raridade: "🔶 Ancestral", preco: 2009 },
  { id: "distancia_chicote_ardente_6", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [123,150], raridade: "🔶 Ancestral", preco: 1946 },
  { id: "magica_cetro_congelante_6", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [122,147], raridade: "🔶 Ancestral", preco: 1791 },
  { id: "contato_martelo_sussurrante_6", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [112,142], raridade: "🔶 Ancestral", preco: 2158 },
  { id: "distancia_lamina_arrojadica_nefasto_6", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [124,150], raridade: "🔶 Ancestral", preco: 2199 },
  { id: "magica_varinha_prateado_6", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [110,137], raridade: "🔶 Ancestral", preco: 1903 },
  { id: "contato_adaga_dourado_6", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [109,131], raridade: "🔶 Ancestral", preco: 2559 },
  { id: "distancia_arpao_negro_6", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [116,136], raridade: "🔶 Ancestral", preco: 1981 },
  { id: "magica_tomo_branco_6", nome: "🪄 Tomo Branco", tipo: "magica", dano: [116,145], raridade: "🔶 Ancestral", preco: 2483 },
  { id: "contato_clava_carmesim_6", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [121,149], raridade: "🔶 Ancestral", preco: 1836 },
  { id: "distancia_bumerangue_verdejante_6", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [121,147], raridade: "🔶 Ancestral", preco: 2388 },
  { id: "magica_relicario_cinereo_6", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [120,145], raridade: "🔶 Ancestral", preco: 1682 },
  { id: "contato_foice_espinhoso_6", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [123,143], raridade: "🔶 Ancestral", preco: 1679 },
  { id: "distancia_arco_cristal_6", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [113,147], raridade: "🔶 Ancestral", preco: 1626 },
  { id: "magica_cajado_runa_6", nome: "🪄 Cajado Runa", tipo: "magica", dano: [118,149], raridade: "🔶 Ancestral", preco: 2233 },
  { id: "contato_alabarda_chama_6", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [119,140], raridade: "🔶 Ancestral", preco: 2349 },
  { id: "distancia_besta_trovao_6", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [116,143], raridade: "🔶 Ancestral", preco: 1867 },
  { id: "magica_bastao_vento_6", nome: "🪄 Bastão Vento", tipo: "magica", dano: [120,149], raridade: "🔶 Ancestral", preco: 1699 },
  { id: "contato_machadinha_aco_6", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [104,122], raridade: "🔶 Ancestral", preco: 1647 },
  { id: "distancia_zarabatana_ferro_6", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [102,126], raridade: "🔶 Ancestral", preco: 2335 },
  { id: "magica_grimorio_osso_6", nome: "🪄 Grimório Osso", tipo: "magica", dano: [105,136], raridade: "🔶 Ancestral", preco: 2108 },
  { id: "contato_maca_sangue_6", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [102,126], raridade: "🔶 Ancestral", preco: 1707 },
  { id: "distancia_funda_alma_6", nome: "🏹 Funda Alma", tipo: "distancia", dano: [124,143], raridade: "🔶 Ancestral", preco: 1901 },
  { id: "magica_orbe_vazio_6", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [111,137], raridade: "🔶 Ancestral", preco: 2598 },
  { id: "contato_espada_ancestral_7", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [142,174], raridade: "🔷 Arcana", preco: 3469 },
  { id: "distancia_arco_sombrio_7", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [142,169], raridade: "🔷 Arcana", preco: 2627 },
  { id: "magica_cajado_radiante_7", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [141,180], raridade: "🔷 Arcana", preco: 3933 },
  { id: "contato_machado_corrompido_7", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [149,183], raridade: "🔷 Arcana", preco: 3993 },
  { id: "distancia_besta_sagrado_7", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [168,198], raridade: "🔷 Arcana", preco: 3870 },
  { id: "magica_bastao_amaldicoado_7", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [152,173], raridade: "🔷 Arcana", preco: 3427 },
  { id: "contato_lanca_glacial_7", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [162,182], raridade: "🔷 Arcana", preco: 4022 },
  { id: "distancia_zarabatana_flamejante_7", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [147,199], raridade: "🔷 Arcana", preco: 4016 },
  { id: "magica_grimorio_espectral_7", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [148,199], raridade: "🔷 Arcana", preco: 2938 },
  { id: "contato_martelo_runico_7", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [145,165], raridade: "🔷 Arcana", preco: 3583 },
  { id: "distancia_funda_abissal_7", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [146,183], raridade: "🔷 Arcana", preco: 3162 },
  { id: "magica_orbe_divino_7", nome: "🪄 Orbe Divino", tipo: "magica", dano: [161,199], raridade: "🔷 Arcana", preco: 2829 },
  { id: "contato_adaga_vingativo_7", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [167,200], raridade: "🔷 Arcana", preco: 3300 },
  { id: "distancia_chicote_silencioso_7", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [164,188], raridade: "🔷 Arcana", preco: 2934 },
  { id: "magica_cetro_etereo_7", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [169,200], raridade: "🔷 Arcana", preco: 3390 },
  { id: "contato_clava_voraz_7", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [163,187], raridade: "🔷 Arcana", preco: 3304 },
  { id: "distancia_lamina_arrojadica_imortal_7", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [142,173], raridade: "🔷 Arcana", preco: 4046 },
  { id: "magica_varinha_cristalino_7", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [145,197], raridade: "🔷 Arcana", preco: 3540 },
  { id: "contato_foice_tempestuoso_7", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [157,182], raridade: "🔷 Arcana", preco: 3683 },
  { id: "distancia_arpao_venenoso_7", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [158,182], raridade: "🔷 Arcana", preco: 3085 },
  { id: "magica_tomo_celestial_7", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [149,194], raridade: "🔷 Arcana", preco: 3514 },
  { id: "contato_alabarda_profano_7", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [150,182], raridade: "🔷 Arcana", preco: 3058 },
  { id: "distancia_bumerangue_eterno_7", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [159,188], raridade: "🔷 Arcana", preco: 3851 },
  { id: "magica_relicario_selvagem_7", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [145,168], raridade: "🔷 Arcana", preco: 3406 },
  { id: "contato_machadinha_draconiano_7", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [169,189], raridade: "🔷 Arcana", preco: 4177 },
  { id: "distancia_arco_infernal_7", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [152,182], raridade: "🔷 Arcana", preco: 3427 },
  { id: "magica_cajado_lunar_7", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [153,180], raridade: "🔷 Arcana", preco: 3078 },
  { id: "contato_maca_solar_7", nome: "🗡️ Maça Solar", tipo: "contato", dano: [169,192], raridade: "🔷 Arcana", preco: 3673 },
  { id: "distancia_besta_anciao_7", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [145,192], raridade: "🔷 Arcana", preco: 3766 },
  { id: "magica_bastao_fantasma_7", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [141,165], raridade: "🔷 Arcana", preco: 3424 },
  { id: "contato_espada_titanico_7", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [149,181], raridade: "🔷 Arcana", preco: 3047 },
  { id: "distancia_zarabatana_umbrio_7", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [161,182], raridade: "🔷 Arcana", preco: 3306 },
  { id: "magica_grimorio_marcado_7", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [170,194], raridade: "🔷 Arcana", preco: 3248 },
  { id: "contato_machado_perdido_7", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [169,199], raridade: "🔷 Arcana", preco: 4033 },
  { id: "distancia_funda_bendito_7", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [164,193], raridade: "🔷 Arcana", preco: 4149 },
  { id: "magica_orbe_impuro_7", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [146,196], raridade: "🔷 Arcana", preco: 3929 },
  { id: "contato_lanca_nebuloso_7", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [150,188], raridade: "🔷 Arcana", preco: 3471 },
  { id: "distancia_chicote_ardente_7", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [149,197], raridade: "🔷 Arcana", preco: 3041 },
  { id: "magica_cetro_congelante_7", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [152,190], raridade: "🔷 Arcana", preco: 2841 },
  { id: "contato_martelo_sussurrante_7", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [149,191], raridade: "🔷 Arcana", preco: 3896 },
  { id: "distancia_lamina_arrojadica_nefasto_7", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [161,183], raridade: "🔷 Arcana", preco: 4022 },
  { id: "magica_varinha_prateado_7", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [143,196], raridade: "🔷 Arcana", preco: 3766 },
  { id: "contato_adaga_dourado_7", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [158,194], raridade: "🔷 Arcana", preco: 2858 },
  { id: "distancia_arpao_negro_7", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [155,191], raridade: "🔷 Arcana", preco: 3193 },
  { id: "magica_tomo_branco_7", nome: "🪄 Tomo Branco", tipo: "magica", dano: [152,193], raridade: "🔷 Arcana", preco: 2726 },
  { id: "contato_clava_carmesim_7", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [150,193], raridade: "🔷 Arcana", preco: 2624 },
  { id: "distancia_bumerangue_verdejante_7", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [168,199], raridade: "🔷 Arcana", preco: 3325 },
  { id: "magica_relicario_cinereo_7", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [165,195], raridade: "🔷 Arcana", preco: 2652 },
  { id: "contato_foice_espinhoso_7", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [144,171], raridade: "🔷 Arcana", preco: 3905 },
  { id: "distancia_arco_cristal_7", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [154,194], raridade: "🔷 Arcana", preco: 3946 },
  { id: "magica_cajado_runa_7", nome: "🪄 Cajado Runa", tipo: "magica", dano: [169,194], raridade: "🔷 Arcana", preco: 4194 },
  { id: "contato_alabarda_chama_7", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [150,181], raridade: "🔷 Arcana", preco: 4126 },
  { id: "distancia_besta_trovao_7", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [148,190], raridade: "🔷 Arcana", preco: 3018 },
  { id: "magica_bastao_vento_7", nome: "🪄 Bastão Vento", tipo: "magica", dano: [157,193], raridade: "🔷 Arcana", preco: 3119 },
  { id: "contato_machadinha_aco_7", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [162,200], raridade: "🔷 Arcana", preco: 3993 },
  { id: "distancia_zarabatana_ferro_7", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [164,187], raridade: "🔷 Arcana", preco: 3394 },
  { id: "magica_grimorio_osso_7", nome: "🪄 Grimório Osso", tipo: "magica", dano: [148,192], raridade: "🔷 Arcana", preco: 4058 },
  { id: "contato_maca_sangue_7", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [155,196], raridade: "🔷 Arcana", preco: 4129 },
  { id: "distancia_funda_alma_7", nome: "🏹 Funda Alma", tipo: "distancia", dano: [167,189], raridade: "🔷 Arcana", preco: 3690 },
  { id: "magica_orbe_vazio_7", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [170,193], raridade: "🔷 Arcana", preco: 3620 },
  { id: "contato_espada_ancestral_8", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [203,228], raridade: "🔴 Primordial", preco: 4268 },
  { id: "distancia_arco_sombrio_8", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [216,241], raridade: "🔴 Primordial", preco: 4981 },
  { id: "magica_cajado_radiante_8", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [198,256], raridade: "🔴 Primordial", preco: 6125 },
  { id: "contato_machado_corrompido_8", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [205,234], raridade: "🔴 Primordial", preco: 6797 },
  { id: "distancia_besta_sagrado_8", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [214,249], raridade: "🔴 Primordial", preco: 6336 },
  { id: "magica_bastao_amaldicoado_8", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [195,242], raridade: "🔴 Primordial", preco: 5926 },
  { id: "contato_lanca_glacial_8", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [206,245], raridade: "🔴 Primordial", preco: 5311 },
  { id: "distancia_zarabatana_flamejante_8", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [198,243], raridade: "🔴 Primordial", preco: 4430 },
  { id: "magica_grimorio_espectral_8", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [220,249], raridade: "🔴 Primordial", preco: 6129 },
  { id: "contato_martelo_runico_8", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [201,239], raridade: "🔴 Primordial", preco: 5782 },
  { id: "distancia_funda_abissal_8", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [203,228], raridade: "🔴 Primordial", preco: 5188 },
  { id: "magica_orbe_divino_8", nome: "🪄 Orbe Divino", tipo: "magica", dano: [223,251], raridade: "🔴 Primordial", preco: 4503 },
  { id: "contato_adaga_vingativo_8", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [210,241], raridade: "🔴 Primordial", preco: 5087 },
  { id: "distancia_chicote_silencioso_8", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [212,244], raridade: "🔴 Primordial", preco: 4972 },
  { id: "magica_cetro_etereo_8", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [211,241], raridade: "🔴 Primordial", preco: 6096 },
  { id: "contato_clava_voraz_8", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [196,236], raridade: "🔴 Primordial", preco: 6668 },
  { id: "distancia_lamina_arrojadica_imortal_8", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [217,245], raridade: "🔴 Primordial", preco: 5620 },
  { id: "magica_varinha_cristalino_8", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [197,236], raridade: "🔴 Primordial", preco: 4959 },
  { id: "contato_foice_tempestuoso_8", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [207,242], raridade: "🔴 Primordial", preco: 5888 },
  { id: "distancia_arpao_venenoso_8", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [194,226], raridade: "🔴 Primordial", preco: 6516 },
  { id: "magica_tomo_celestial_8", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [210,256], raridade: "🔴 Primordial", preco: 6027 },
  { id: "contato_alabarda_profano_8", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [207,259], raridade: "🔴 Primordial", preco: 4700 },
  { id: "distancia_bumerangue_eterno_8", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [207,251], raridade: "🔴 Primordial", preco: 6477 },
  { id: "magica_relicario_selvagem_8", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [194,258], raridade: "🔴 Primordial", preco: 5226 },
  { id: "contato_machadinha_draconiano_8", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [210,256], raridade: "🔴 Primordial", preco: 5284 },
  { id: "distancia_arco_infernal_8", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [223,253], raridade: "🔴 Primordial", preco: 4723 },
  { id: "magica_cajado_lunar_8", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [192,238], raridade: "🔴 Primordial", preco: 6300 },
  { id: "contato_maca_solar_8", nome: "🗡️ Maça Solar", tipo: "contato", dano: [199,232], raridade: "🔴 Primordial", preco: 5863 },
  { id: "distancia_besta_anciao_8", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [213,248], raridade: "🔴 Primordial", preco: 6609 },
  { id: "magica_bastao_fantasma_8", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [200,259], raridade: "🔴 Primordial", preco: 6576 },
  { id: "contato_espada_titanico_8", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [193,217], raridade: "🔴 Primordial", preco: 5935 },
  { id: "distancia_zarabatana_umbrio_8", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [194,227], raridade: "🔴 Primordial", preco: 6531 },
  { id: "magica_grimorio_marcado_8", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [194,222], raridade: "🔴 Primordial", preco: 6100 },
  { id: "contato_machado_perdido_8", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [222,250], raridade: "🔴 Primordial", preco: 4200 },
  { id: "distancia_funda_bendito_8", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [191,249], raridade: "🔴 Primordial", preco: 5437 },
  { id: "magica_orbe_impuro_8", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [214,252], raridade: "🔴 Primordial", preco: 5424 },
  { id: "contato_lanca_nebuloso_8", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [195,242], raridade: "🔴 Primordial", preco: 4756 },
  { id: "distancia_chicote_ardente_8", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [220,255], raridade: "🔴 Primordial", preco: 4310 },
  { id: "magica_cetro_congelante_8", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [198,250], raridade: "🔴 Primordial", preco: 4326 },
  { id: "contato_martelo_sussurrante_8", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [211,247], raridade: "🔴 Primordial", preco: 6357 },
  { id: "distancia_lamina_arrojadica_nefasto_8", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [206,258], raridade: "🔴 Primordial", preco: 5145 },
  { id: "magica_varinha_prateado_8", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [194,226], raridade: "🔴 Primordial", preco: 6204 },
  { id: "contato_adaga_dourado_8", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [208,249], raridade: "🔴 Primordial", preco: 6725 },
  { id: "distancia_arpao_negro_8", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [211,255], raridade: "🔴 Primordial", preco: 4686 },
  { id: "magica_tomo_branco_8", nome: "🪄 Tomo Branco", tipo: "magica", dano: [206,237], raridade: "🔴 Primordial", preco: 5425 },
  { id: "contato_clava_carmesim_8", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [217,240], raridade: "🔴 Primordial", preco: 6569 },
  { id: "distancia_bumerangue_verdejante_8", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [221,244], raridade: "🔴 Primordial", preco: 6470 },
  { id: "magica_relicario_cinereo_8", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [204,237], raridade: "🔴 Primordial", preco: 5766 },
  { id: "contato_foice_espinhoso_8", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [201,245], raridade: "🔴 Primordial", preco: 5303 },
  { id: "distancia_arco_cristal_8", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [201,257], raridade: "🔴 Primordial", preco: 5003 },
  { id: "magica_cajado_runa_8", nome: "🪄 Cajado Runa", tipo: "magica", dano: [224,255], raridade: "🔴 Primordial", preco: 4508 },
  { id: "contato_alabarda_chama_8", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [204,253], raridade: "🔴 Primordial", preco: 4629 },
  { id: "distancia_besta_trovao_8", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [222,252], raridade: "🔴 Primordial", preco: 6500 },
  { id: "magica_bastao_vento_8", nome: "🪄 Bastão Vento", tipo: "magica", dano: [206,250], raridade: "🔴 Primordial", preco: 5730 },
  { id: "contato_machadinha_aco_8", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [220,257], raridade: "🔴 Primordial", preco: 5681 },
  { id: "distancia_zarabatana_ferro_8", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [213,245], raridade: "🔴 Primordial", preco: 4601 },
  { id: "magica_grimorio_osso_8", nome: "🪄 Grimório Osso", tipo: "magica", dano: [215,240], raridade: "🔴 Primordial", preco: 4715 },
  { id: "contato_maca_sangue_8", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [203,256], raridade: "🔴 Primordial", preco: 5189 },
  { id: "distancia_funda_alma_8", nome: "🏹 Funda Alma", tipo: "distancia", dano: [197,225], raridade: "🔴 Primordial", preco: 6223 },
  { id: "magica_orbe_vazio_8", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [214,249], raridade: "🔴 Primordial", preco: 6522 },
  { id: "contato_espada_ancestral_9", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [284,325], raridade: "🟠 Abissal", preco: 10338 },
  { id: "distancia_arco_sombrio_9", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [271,305], raridade: "🟠 Abissal", preco: 10320 },
  { id: "magica_cajado_radiante_9", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [270,339], raridade: "🟠 Abissal", preco: 7604 },
  { id: "contato_machado_corrompido_9", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [262,304], raridade: "🟠 Abissal", preco: 8316 },
  { id: "distancia_besta_sagrado_9", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [287,333], raridade: "🟠 Abissal", preco: 7914 },
  { id: "magica_bastao_amaldicoado_9", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [269,313], raridade: "🟠 Abissal", preco: 7055 },
  { id: "contato_lanca_glacial_9", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [276,334], raridade: "🟠 Abissal", preco: 8639 },
  { id: "distancia_zarabatana_flamejante_9", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [277,318], raridade: "🟠 Abissal", preco: 7431 },
  { id: "magica_grimorio_espectral_9", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [276,323], raridade: "🟠 Abissal", preco: 10100 },
  { id: "contato_martelo_runico_9", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [284,324], raridade: "🟠 Abissal", preco: 8758 },
  { id: "distancia_funda_abissal_9", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [252,327], raridade: "🟠 Abissal", preco: 8810 },
  { id: "magica_orbe_divino_9", nome: "🪄 Orbe Divino", tipo: "magica", dano: [270,331], raridade: "🟠 Abissal", preco: 9598 },
  { id: "contato_adaga_vingativo_9", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [274,332], raridade: "🟠 Abissal", preco: 7653 },
  { id: "distancia_chicote_silencioso_9", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [286,321], raridade: "🟠 Abissal", preco: 9287 },
  { id: "magica_cetro_etereo_9", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [271,329], raridade: "🟠 Abissal", preco: 10207 },
  { id: "contato_clava_voraz_9", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [293,335], raridade: "🟠 Abissal", preco: 10391 },
  { id: "distancia_lamina_arrojadica_imortal_9", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [271,338], raridade: "🟠 Abissal", preco: 9001 },
  { id: "magica_varinha_cristalino_9", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [279,324], raridade: "🟠 Abissal", preco: 8384 },
  { id: "contato_foice_tempestuoso_9", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [257,300], raridade: "🟠 Abissal", preco: 8292 },
  { id: "distancia_arpao_venenoso_9", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [272,321], raridade: "🟠 Abissal", preco: 8356 },
  { id: "magica_tomo_celestial_9", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [254,285], raridade: "🟠 Abissal", preco: 7053 },
  { id: "contato_alabarda_profano_9", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [264,313], raridade: "🟠 Abissal", preco: 8911 },
  { id: "distancia_bumerangue_eterno_9", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [261,316], raridade: "🟠 Abissal", preco: 7044 },
  { id: "magica_relicario_selvagem_9", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [269,332], raridade: "🟠 Abissal", preco: 6869 },
  { id: "contato_machadinha_draconiano_9", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [279,329], raridade: "🟠 Abissal", preco: 9491 },
  { id: "distancia_arco_infernal_9", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [286,336], raridade: "🟠 Abissal", preco: 7060 },
  { id: "magica_cajado_lunar_9", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [256,329], raridade: "🟠 Abissal", preco: 8949 },
  { id: "contato_maca_solar_9", nome: "🗡️ Maça Solar", tipo: "contato", dano: [289,327], raridade: "🟠 Abissal", preco: 8560 },
  { id: "distancia_besta_anciao_9", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [266,314], raridade: "🟠 Abissal", preco: 8674 },
  { id: "magica_bastao_fantasma_9", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [262,311], raridade: "🟠 Abissal", preco: 9528 },
  { id: "contato_espada_titanico_9", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [290,336], raridade: "🟠 Abissal", preco: 9034 },
  { id: "distancia_zarabatana_umbrio_9", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [278,313], raridade: "🟠 Abissal", preco: 8851 },
  { id: "magica_grimorio_marcado_9", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [295,328], raridade: "🟠 Abissal", preco: 8216 },
  { id: "contato_machado_perdido_9", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [283,331], raridade: "🟠 Abissal", preco: 9278 },
  { id: "distancia_funda_bendito_9", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [294,336], raridade: "🟠 Abissal", preco: 9416 },
  { id: "magica_orbe_impuro_9", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [256,339], raridade: "🟠 Abissal", preco: 8927 },
  { id: "contato_lanca_nebuloso_9", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [270,319], raridade: "🟠 Abissal", preco: 8667 },
  { id: "distancia_chicote_ardente_9", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [271,309], raridade: "🟠 Abissal", preco: 10171 },
  { id: "magica_cetro_congelante_9", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [268,329], raridade: "🟠 Abissal", preco: 8406 },
  { id: "contato_martelo_sussurrante_9", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [270,319], raridade: "🟠 Abissal", preco: 9085 },
  { id: "distancia_lamina_arrojadica_nefasto_9", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [269,336], raridade: "🟠 Abissal", preco: 7628 },
  { id: "magica_varinha_prateado_9", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [269,337], raridade: "🟠 Abissal", preco: 9681 },
  { id: "contato_adaga_dourado_9", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [295,329], raridade: "🟠 Abissal", preco: 8380 },
  { id: "distancia_arpao_negro_9", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [264,311], raridade: "🟠 Abissal", preco: 7276 },
  { id: "magica_tomo_branco_9", nome: "🪄 Tomo Branco", tipo: "magica", dano: [287,327], raridade: "🟠 Abissal", preco: 7042 },
  { id: "contato_clava_carmesim_9", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [293,333], raridade: "🟠 Abissal", preco: 8674 },
  { id: "distancia_bumerangue_verdejante_9", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [278,317], raridade: "🟠 Abissal", preco: 7301 },
  { id: "magica_relicario_cinereo_9", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [267,340], raridade: "🟠 Abissal", preco: 9618 },
  { id: "contato_foice_espinhoso_9", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [281,313], raridade: "🟠 Abissal", preco: 8353 },
  { id: "distancia_arco_cristal_9", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [257,339], raridade: "🟠 Abissal", preco: 9934 },
  { id: "magica_cajado_runa_9", nome: "🪄 Cajado Runa", tipo: "magica", dano: [291,326], raridade: "🟠 Abissal", preco: 9438 },
  { id: "contato_alabarda_chama_9", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [279,310], raridade: "🟠 Abissal", preco: 7821 },
  { id: "distancia_besta_trovao_9", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [267,321], raridade: "🟠 Abissal", preco: 9418 },
  { id: "magica_bastao_vento_9", nome: "🪄 Bastão Vento", tipo: "magica", dano: [277,312], raridade: "🟠 Abissal", preco: 8378 },
  { id: "contato_machadinha_aco_9", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [288,326], raridade: "🟠 Abissal", preco: 7909 },
  { id: "distancia_zarabatana_ferro_9", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [271,332], raridade: "🟠 Abissal", preco: 7144 },
  { id: "magica_grimorio_osso_9", nome: "🪄 Grimório Osso", tipo: "magica", dano: [292,322], raridade: "🟠 Abissal", preco: 9425 },
  { id: "contato_maca_sangue_9", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [271,339], raridade: "🟠 Abissal", preco: 9812 },
  { id: "distancia_funda_alma_9", nome: "🏹 Funda Alma", tipo: "distancia", dano: [267,314], raridade: "🟠 Abissal", preco: 10394 },
  { id: "magica_orbe_vazio_9", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [252,312], raridade: "🟠 Abissal", preco: 8199 },
  { id: "contato_espada_ancestral_10", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [363,407], raridade: "⚫ Sombria", preco: 11154 },
  { id: "distancia_arco_sombrio_10", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [332,372], raridade: "⚫ Sombria", preco: 12106 },
  { id: "magica_cajado_radiante_10", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [379,416], raridade: "⚫ Sombria", preco: 15266 },
  { id: "contato_machado_corrompido_10", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [336,408], raridade: "⚫ Sombria", preco: 13944 },
  { id: "distancia_besta_sagrado_10", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [340,416], raridade: "⚫ Sombria", preco: 14912 },
  { id: "magica_bastao_amaldicoado_10", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [344,403], raridade: "⚫ Sombria", preco: 15380 },
  { id: "contato_lanca_glacial_10", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [360,406], raridade: "⚫ Sombria", preco: 12153 },
  { id: "distancia_zarabatana_flamejante_10", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [364,422], raridade: "⚫ Sombria", preco: 12206 },
  { id: "magica_grimorio_espectral_10", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [363,409], raridade: "⚫ Sombria", preco: 14851 },
  { id: "contato_martelo_runico_10", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [374,427], raridade: "⚫ Sombria", preco: 14808 },
  { id: "distancia_funda_abissal_10", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [353,395], raridade: "⚫ Sombria", preco: 14923 },
  { id: "magica_orbe_divino_10", nome: "🪄 Orbe Divino", tipo: "magica", dano: [341,411], raridade: "⚫ Sombria", preco: 15191 },
  { id: "contato_adaga_vingativo_10", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [362,401], raridade: "⚫ Sombria", preco: 14942 },
  { id: "distancia_chicote_silencioso_10", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [344,398], raridade: "⚫ Sombria", preco: 15349 },
  { id: "magica_cetro_etereo_10", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [357,410], raridade: "⚫ Sombria", preco: 14971 },
  { id: "contato_clava_voraz_10", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [350,430], raridade: "⚫ Sombria", preco: 11627 },
  { id: "distancia_lamina_arrojadica_imortal_10", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [363,396], raridade: "⚫ Sombria", preco: 13499 },
  { id: "magica_varinha_cristalino_10", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [330,413], raridade: "⚫ Sombria", preco: 11889 },
  { id: "contato_foice_tempestuoso_10", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [334,372], raridade: "⚫ Sombria", preco: 11256 },
  { id: "distancia_arpao_venenoso_10", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [356,408], raridade: "⚫ Sombria", preco: 11277 },
  { id: "magica_tomo_celestial_10", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [347,385], raridade: "⚫ Sombria", preco: 12700 },
  { id: "contato_alabarda_profano_10", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [358,406], raridade: "⚫ Sombria", preco: 11868 },
  { id: "distancia_bumerangue_eterno_10", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [354,417], raridade: "⚫ Sombria", preco: 12809 },
  { id: "magica_relicario_selvagem_10", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [366,417], raridade: "⚫ Sombria", preco: 11777 },
  { id: "contato_machadinha_draconiano_10", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [335,372], raridade: "⚫ Sombria", preco: 15452 },
  { id: "distancia_arco_infernal_10", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [340,380], raridade: "⚫ Sombria", preco: 10642 },
  { id: "magica_cajado_lunar_10", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [367,425], raridade: "⚫ Sombria", preco: 13571 },
  { id: "contato_maca_solar_10", nome: "🗡️ Maça Solar", tipo: "contato", dano: [378,411], raridade: "⚫ Sombria", preco: 13434 },
  { id: "distancia_besta_anciao_10", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [373,429], raridade: "⚫ Sombria", preco: 11161 },
  { id: "magica_bastao_fantasma_10", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [342,430], raridade: "⚫ Sombria", preco: 13082 },
  { id: "contato_espada_titanico_10", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [338,410], raridade: "⚫ Sombria", preco: 12464 },
  { id: "distancia_zarabatana_umbrio_10", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [370,407], raridade: "⚫ Sombria", preco: 13781 },
  { id: "magica_grimorio_marcado_10", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [357,403], raridade: "⚫ Sombria", preco: 13908 },
  { id: "contato_machado_perdido_10", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [332,429], raridade: "⚫ Sombria", preco: 14541 },
  { id: "distancia_funda_bendito_10", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [378,427], raridade: "⚫ Sombria", preco: 13470 },
  { id: "magica_orbe_impuro_10", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [338,394], raridade: "⚫ Sombria", preco: 14341 },
  { id: "contato_lanca_nebuloso_10", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [345,384], raridade: "⚫ Sombria", preco: 15453 },
  { id: "distancia_chicote_ardente_10", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [345,415], raridade: "⚫ Sombria", preco: 15565 },
  { id: "magica_cetro_congelante_10", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [351,390], raridade: "⚫ Sombria", preco: 14703 },
  { id: "contato_martelo_sussurrante_10", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [356,427], raridade: "⚫ Sombria", preco: 11834 },
  { id: "distancia_lamina_arrojadica_nefasto_10", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [374,422], raridade: "⚫ Sombria", preco: 15407 },
  { id: "magica_varinha_prateado_10", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [367,427], raridade: "⚫ Sombria", preco: 11127 },
  { id: "contato_adaga_dourado_10", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [364,427], raridade: "⚫ Sombria", preco: 10762 },
  { id: "distancia_arpao_negro_10", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [367,421], raridade: "⚫ Sombria", preco: 13255 },
  { id: "magica_tomo_branco_10", nome: "🪄 Tomo Branco", tipo: "magica", dano: [372,423], raridade: "⚫ Sombria", preco: 13986 },
  { id: "contato_clava_carmesim_10", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [331,380], raridade: "⚫ Sombria", preco: 14364 },
  { id: "distancia_bumerangue_verdejante_10", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [365,422], raridade: "⚫ Sombria", preco: 14474 },
  { id: "magica_relicario_cinereo_10", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [344,413], raridade: "⚫ Sombria", preco: 15755 },
  { id: "contato_foice_espinhoso_10", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [347,413], raridade: "⚫ Sombria", preco: 12016 },
  { id: "distancia_arco_cristal_10", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [367,414], raridade: "⚫ Sombria", preco: 11142 },
  { id: "magica_cajado_runa_10", nome: "🪄 Cajado Runa", tipo: "magica", dano: [373,427], raridade: "⚫ Sombria", preco: 14798 },
  { id: "contato_alabarda_chama_10", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [353,417], raridade: "⚫ Sombria", preco: 14554 },
  { id: "distancia_besta_trovao_10", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [368,417], raridade: "⚫ Sombria", preco: 11783 },
  { id: "magica_bastao_vento_10", nome: "🪄 Bastão Vento", tipo: "magica", dano: [377,428], raridade: "⚫ Sombria", preco: 14270 },
  { id: "contato_machadinha_aco_10", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [369,412], raridade: "⚫ Sombria", preco: 15851 },
  { id: "distancia_zarabatana_ferro_10", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [378,419], raridade: "⚫ Sombria", preco: 15476 },
  { id: "magica_grimorio_osso_10", nome: "🪄 Grimório Osso", tipo: "magica", dano: [367,407], raridade: "⚫ Sombria", preco: 13858 },
  { id: "contato_maca_sangue_10", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [373,409], raridade: "⚫ Sombria", preco: 12828 },
  { id: "distancia_funda_alma_10", nome: "🏹 Funda Alma", tipo: "distancia", dano: [374,430], raridade: "⚫ Sombria", preco: 13290 },
  { id: "magica_orbe_vazio_10", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [363,400], raridade: "⚫ Sombria", preco: 11994 },
  { id: "contato_espada_ancestral_11", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [470,525], raridade: "🌑 Amaldiçoada", preco: 19144 },
  { id: "distancia_arco_sombrio_11", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [438,483], raridade: "🌑 Amaldiçoada", preco: 18461 },
  { id: "magica_cajado_radiante_11", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [448,508], raridade: "🌑 Amaldiçoada", preco: 22541 },
  { id: "contato_machado_corrompido_11", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [454,539], raridade: "🌑 Amaldiçoada", preco: 23668 },
  { id: "distancia_besta_sagrado_11", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [446,513], raridade: "🌑 Amaldiçoada", preco: 16525 },
  { id: "magica_bastao_amaldicoado_11", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [469,515], raridade: "🌑 Amaldiçoada", preco: 16105 },
  { id: "contato_lanca_glacial_11", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [435,535], raridade: "🌑 Amaldiçoada", preco: 21171 },
  { id: "distancia_zarabatana_flamejante_11", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [475,535], raridade: "🌑 Amaldiçoada", preco: 22719 },
  { id: "magica_grimorio_espectral_11", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [441,501], raridade: "🌑 Amaldiçoada", preco: 20070 },
  { id: "contato_martelo_runico_11", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [475,524], raridade: "🌑 Amaldiçoada", preco: 23328 },
  { id: "distancia_funda_abissal_11", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [423,503], raridade: "🌑 Amaldiçoada", preco: 20855 },
  { id: "magica_orbe_divino_11", nome: "🪄 Orbe Divino", tipo: "magica", dano: [468,525], raridade: "🌑 Amaldiçoada", preco: 21763 },
  { id: "contato_adaga_vingativo_11", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [425,477], raridade: "🌑 Amaldiçoada", preco: 16172 },
  { id: "distancia_chicote_silencioso_11", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [440,514], raridade: "🌑 Amaldiçoada", preco: 20977 },
  { id: "magica_cetro_etereo_11", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [478,529], raridade: "🌑 Amaldiçoada", preco: 19498 },
  { id: "contato_clava_voraz_11", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [452,511], raridade: "🌑 Amaldiçoada", preco: 16772 },
  { id: "distancia_lamina_arrojadica_imortal_11", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [424,540], raridade: "🌑 Amaldiçoada", preco: 16996 },
  { id: "magica_varinha_cristalino_11", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [425,501], raridade: "🌑 Amaldiçoada", preco: 23923 },
  { id: "contato_foice_tempestuoso_11", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [470,512], raridade: "🌑 Amaldiçoada", preco: 16633 },
  { id: "distancia_arpao_venenoso_11", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [469,533], raridade: "🌑 Amaldiçoada", preco: 22606 },
  { id: "magica_tomo_celestial_11", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [448,499], raridade: "🌑 Amaldiçoada", preco: 20913 },
  { id: "contato_alabarda_profano_11", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [477,535], raridade: "🌑 Amaldiçoada", preco: 19471 },
  { id: "distancia_bumerangue_eterno_11", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [458,540], raridade: "🌑 Amaldiçoada", preco: 17487 },
  { id: "magica_relicario_selvagem_11", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [432,523], raridade: "🌑 Amaldiçoada", preco: 17627 },
  { id: "contato_machadinha_draconiano_11", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [474,519], raridade: "🌑 Amaldiçoada", preco: 21330 },
  { id: "distancia_arco_infernal_11", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [473,520], raridade: "🌑 Amaldiçoada", preco: 19409 },
  { id: "magica_cajado_lunar_11", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [426,496], raridade: "🌑 Amaldiçoada", preco: 18634 },
  { id: "contato_maca_solar_11", nome: "🗡️ Maça Solar", tipo: "contato", dano: [432,509], raridade: "🌑 Amaldiçoada", preco: 19604 },
  { id: "distancia_besta_anciao_11", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [433,504], raridade: "🌑 Amaldiçoada", preco: 17078 },
  { id: "magica_bastao_fantasma_11", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [463,528], raridade: "🌑 Amaldiçoada", preco: 19713 },
  { id: "contato_espada_titanico_11", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [454,520], raridade: "🌑 Amaldiçoada", preco: 16892 },
  { id: "distancia_zarabatana_umbrio_11", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [434,494], raridade: "🌑 Amaldiçoada", preco: 23036 },
  { id: "magica_grimorio_marcado_11", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [477,525], raridade: "🌑 Amaldiçoada", preco: 19284 },
  { id: "contato_machado_perdido_11", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [477,532], raridade: "🌑 Amaldiçoada", preco: 23891 },
  { id: "distancia_funda_bendito_11", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [466,529], raridade: "🌑 Amaldiçoada", preco: 20557 },
  { id: "magica_orbe_impuro_11", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [464,506], raridade: "🌑 Amaldiçoada", preco: 19576 },
  { id: "contato_lanca_nebuloso_11", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [452,498], raridade: "🌑 Amaldiçoada", preco: 18229 },
  { id: "distancia_chicote_ardente_11", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [428,480], raridade: "🌑 Amaldiçoada", preco: 18083 },
  { id: "magica_cetro_congelante_11", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [439,520], raridade: "🌑 Amaldiçoada", preco: 16977 },
  { id: "contato_martelo_sussurrante_11", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [429,506], raridade: "🌑 Amaldiçoada", preco: 20279 },
  { id: "distancia_lamina_arrojadica_nefasto_11", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [420,469], raridade: "🌑 Amaldiçoada", preco: 22767 },
  { id: "magica_varinha_prateado_11", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [459,519], raridade: "🌑 Amaldiçoada", preco: 18973 },
  { id: "contato_adaga_dourado_11", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [478,537], raridade: "🌑 Amaldiçoada", preco: 23282 },
  { id: "distancia_arpao_negro_11", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [451,499], raridade: "🌑 Amaldiçoada", preco: 16177 },
  { id: "magica_tomo_branco_11", nome: "🪄 Tomo Branco", tipo: "magica", dano: [459,508], raridade: "🌑 Amaldiçoada", preco: 16014 },
  { id: "contato_clava_carmesim_11", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [463,505], raridade: "🌑 Amaldiçoada", preco: 17421 },
  { id: "distancia_bumerangue_verdejante_11", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [432,518], raridade: "🌑 Amaldiçoada", preco: 18130 },
  { id: "magica_relicario_cinereo_11", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [440,517], raridade: "🌑 Amaldiçoada", preco: 17734 },
  { id: "contato_foice_espinhoso_11", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [458,525], raridade: "🌑 Amaldiçoada", preco: 23986 },
  { id: "distancia_arco_cristal_11", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [459,529], raridade: "🌑 Amaldiçoada", preco: 21051 },
  { id: "magica_cajado_runa_11", nome: "🪄 Cajado Runa", tipo: "magica", dano: [439,540], raridade: "🌑 Amaldiçoada", preco: 20066 },
  { id: "contato_alabarda_chama_11", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [434,516], raridade: "🌑 Amaldiçoada", preco: 19023 },
  { id: "distancia_besta_trovao_11", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [468,523], raridade: "🌑 Amaldiçoada", preco: 19673 },
  { id: "magica_bastao_vento_11", nome: "🪄 Bastão Vento", tipo: "magica", dano: [436,498], raridade: "🌑 Amaldiçoada", preco: 16434 },
  { id: "contato_machadinha_aco_11", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [432,482], raridade: "🌑 Amaldiçoada", preco: 22366 },
  { id: "distancia_zarabatana_ferro_11", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [459,523], raridade: "🌑 Amaldiçoada", preco: 18385 },
  { id: "magica_grimorio_osso_11", nome: "🪄 Grimório Osso", tipo: "magica", dano: [428,537], raridade: "🌑 Amaldiçoada", preco: 22527 },
  { id: "contato_maca_sangue_11", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [441,526], raridade: "🌑 Amaldiçoada", preco: 20451 },
  { id: "distancia_funda_alma_11", nome: "🏹 Funda Alma", tipo: "distancia", dano: [439,501], raridade: "🌑 Amaldiçoada", preco: 18931 },
  { id: "magica_orbe_vazio_11", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [459,528], raridade: "🌑 Amaldiçoada", preco: 16413 },
  { id: "contato_espada_ancestral_12", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [578,640], raridade: "🌟 Celestial", preco: 27799 },
  { id: "distancia_arco_sombrio_12", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [589,653], raridade: "🌟 Celestial", preco: 27578 },
  { id: "magica_cajado_radiante_12", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [550,599], raridade: "🌟 Celestial", preco: 31202 },
  { id: "contato_machado_corrompido_12", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [535,644], raridade: "🌟 Celestial", preco: 24085 },
  { id: "distancia_besta_sagrado_12", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [592,650], raridade: "🌟 Celestial", preco: 31641 },
  { id: "magica_bastao_amaldicoado_12", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [547,611], raridade: "🌟 Celestial", preco: 29540 },
  { id: "contato_lanca_glacial_12", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [566,657], raridade: "🌟 Celestial", preco: 28104 },
  { id: "distancia_zarabatana_flamejante_12", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [550,653], raridade: "🌟 Celestial", preco: 29276 },
  { id: "magica_grimorio_espectral_12", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [592,642], raridade: "🌟 Celestial", preco: 29731 },
  { id: "contato_martelo_runico_12", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [558,660], raridade: "🌟 Celestial", preco: 27754 },
  { id: "distancia_funda_abissal_12", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [535,634], raridade: "🌟 Celestial", preco: 32642 },
  { id: "magica_orbe_divino_12", nome: "🪄 Orbe Divino", tipo: "magica", dano: [556,627], raridade: "🌟 Celestial", preco: 27060 },
  { id: "contato_adaga_vingativo_12", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [530,588], raridade: "🌟 Celestial", preco: 31785 },
  { id: "distancia_chicote_silencioso_12", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [594,654], raridade: "🌟 Celestial", preco: 33758 },
  { id: "magica_cetro_etereo_12", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [561,614], raridade: "🌟 Celestial", preco: 24153 },
  { id: "contato_clava_voraz_12", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [530,653], raridade: "🌟 Celestial", preco: 30780 },
  { id: "distancia_lamina_arrojadica_imortal_12", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [572,628], raridade: "🌟 Celestial", preco: 24129 },
  { id: "magica_varinha_cristalino_12", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [593,659], raridade: "🌟 Celestial", preco: 27955 },
  { id: "contato_foice_tempestuoso_12", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [542,591], raridade: "🌟 Celestial", preco: 24788 },
  { id: "distancia_arpao_venenoso_12", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [573,637], raridade: "🌟 Celestial", preco: 27976 },
  { id: "magica_tomo_celestial_12", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [568,616], raridade: "🌟 Celestial", preco: 34615 },
  { id: "contato_alabarda_profano_12", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [547,601], raridade: "🌟 Celestial", preco: 28727 },
  { id: "distancia_bumerangue_eterno_12", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [554,598], raridade: "🌟 Celestial", preco: 25247 },
  { id: "magica_relicario_selvagem_12", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [564,650], raridade: "🌟 Celestial", preco: 33061 },
  { id: "contato_machadinha_draconiano_12", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [530,599], raridade: "🌟 Celestial", preco: 30913 },
  { id: "distancia_arco_infernal_12", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [595,641], raridade: "🌟 Celestial", preco: 24977 },
  { id: "magica_cajado_lunar_12", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [594,643], raridade: "🌟 Celestial", preco: 34085 },
  { id: "contato_maca_solar_12", nome: "🗡️ Maça Solar", tipo: "contato", dano: [553,621], raridade: "🌟 Celestial", preco: 28867 },
  { id: "distancia_besta_anciao_12", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [577,639], raridade: "🌟 Celestial", preco: 28581 },
  { id: "magica_bastao_fantasma_12", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [577,649], raridade: "🌟 Celestial", preco: 25421 },
  { id: "contato_espada_titanico_12", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [556,627], raridade: "🌟 Celestial", preco: 30143 },
  { id: "distancia_zarabatana_umbrio_12", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [568,618], raridade: "🌟 Celestial", preco: 26176 },
  { id: "magica_grimorio_marcado_12", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [572,632], raridade: "🌟 Celestial", preco: 24726 },
  { id: "contato_machado_perdido_12", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [582,625], raridade: "🌟 Celestial", preco: 29614 },
  { id: "distancia_funda_bendito_12", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [540,593], raridade: "🌟 Celestial", preco: 30417 },
  { id: "magica_orbe_impuro_12", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [551,599], raridade: "🌟 Celestial", preco: 34676 },
  { id: "contato_lanca_nebuloso_12", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [534,619], raridade: "🌟 Celestial", preco: 28827 },
  { id: "distancia_chicote_ardente_12", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [566,624], raridade: "🌟 Celestial", preco: 31055 },
  { id: "magica_cetro_congelante_12", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [536,591], raridade: "🌟 Celestial", preco: 26928 },
  { id: "contato_martelo_sussurrante_12", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [592,645], raridade: "🌟 Celestial", preco: 33320 },
  { id: "distancia_lamina_arrojadica_nefasto_12", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [553,607], raridade: "🌟 Celestial", preco: 27717 },
  { id: "magica_varinha_prateado_12", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [532,589], raridade: "🌟 Celestial", preco: 25542 },
  { id: "contato_adaga_dourado_12", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [536,587], raridade: "🌟 Celestial", preco: 24819 },
  { id: "distancia_arpao_negro_12", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [575,650], raridade: "🌟 Celestial", preco: 25874 },
  { id: "magica_tomo_branco_12", nome: "🪄 Tomo Branco", tipo: "magica", dano: [573,646], raridade: "🌟 Celestial", preco: 24881 },
  { id: "contato_clava_carmesim_12", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [594,660], raridade: "🌟 Celestial", preco: 32859 },
  { id: "distancia_bumerangue_verdejante_12", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [530,588], raridade: "🌟 Celestial", preco: 29398 },
  { id: "magica_relicario_cinereo_12", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [567,614], raridade: "🌟 Celestial", preco: 28903 },
  { id: "contato_foice_espinhoso_12", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [575,642], raridade: "🌟 Celestial", preco: 24186 },
  { id: "distancia_arco_cristal_12", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [556,628], raridade: "🌟 Celestial", preco: 25033 },
  { id: "magica_cajado_runa_12", nome: "🪄 Cajado Runa", tipo: "magica", dano: [578,642], raridade: "🌟 Celestial", preco: 25101 },
  { id: "contato_alabarda_chama_12", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [585,641], raridade: "🌟 Celestial", preco: 29850 },
  { id: "distancia_besta_trovao_12", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [585,634], raridade: "🌟 Celestial", preco: 28944 },
  { id: "magica_bastao_vento_12", nome: "🪄 Bastão Vento", tipo: "magica", dano: [591,637], raridade: "🌟 Celestial", preco: 24980 },
  { id: "contato_machadinha_aco_12", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [542,630], raridade: "🌟 Celestial", preco: 26106 },
  { id: "distancia_zarabatana_ferro_12", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [586,660], raridade: "🌟 Celestial", preco: 31133 },
  { id: "magica_grimorio_osso_12", nome: "🪄 Grimório Osso", tipo: "magica", dano: [543,593], raridade: "🌟 Celestial", preco: 32223 },
  { id: "contato_maca_sangue_12", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [547,620], raridade: "🌟 Celestial", preco: 25331 },
  { id: "distancia_funda_alma_12", nome: "🏹 Funda Alma", tipo: "distancia", dano: [575,643], raridade: "🌟 Celestial", preco: 31600 },
  { id: "magica_orbe_vazio_12", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [578,651], raridade: "🌟 Celestial", preco: 32996 },
  { id: "contato_espada_ancestral_13", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [679,744], raridade: "☀️ Solar", preco: 48393 },
  { id: "distancia_arco_sombrio_13", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [713,785], raridade: "☀️ Solar", preco: 44045 },
  { id: "magica_cajado_radiante_13", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [665,722], raridade: "☀️ Solar", preco: 40783 },
  { id: "contato_machado_corrompido_13", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [668,763], raridade: "☀️ Solar", preco: 46828 },
  { id: "distancia_besta_sagrado_13", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [670,766], raridade: "☀️ Solar", preco: 46974 },
  { id: "magica_bastao_amaldicoado_13", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [706,779], raridade: "☀️ Solar", preco: 49658 },
  { id: "contato_lanca_glacial_13", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [672,740], raridade: "☀️ Solar", preco: 42540 },
  { id: "distancia_zarabatana_flamejante_13", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [698,772], raridade: "☀️ Solar", preco: 42381 },
  { id: "magica_grimorio_espectral_13", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [698,785], raridade: "☀️ Solar", preco: 42698 },
  { id: "contato_martelo_runico_13", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [710,780], raridade: "☀️ Solar", preco: 42603 },
  { id: "distancia_funda_abissal_13", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [683,765], raridade: "☀️ Solar", preco: 44532 },
  { id: "magica_orbe_divino_13", nome: "🪄 Orbe Divino", tipo: "magica", dano: [703,760], raridade: "☀️ Solar", preco: 44108 },
  { id: "contato_adaga_vingativo_13", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [688,769], raridade: "☀️ Solar", preco: 45438 },
  { id: "distancia_chicote_silencioso_13", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [675,796], raridade: "☀️ Solar", preco: 43252 },
  { id: "magica_cetro_etereo_13", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [683,753], raridade: "☀️ Solar", preco: 47765 },
  { id: "contato_clava_voraz_13", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [658,738], raridade: "☀️ Solar", preco: 35991 },
  { id: "distancia_lamina_arrojadica_imortal_13", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [708,791], raridade: "☀️ Solar", preco: 40930 },
  { id: "magica_varinha_cristalino_13", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [680,744], raridade: "☀️ Solar", preco: 42919 },
  { id: "contato_foice_tempestuoso_13", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [720,773], raridade: "☀️ Solar", preco: 49132 },
  { id: "distancia_arpao_venenoso_13", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [673,745], raridade: "☀️ Solar", preco: 47937 },
  { id: "magica_tomo_celestial_13", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [703,790], raridade: "☀️ Solar", preco: 42843 },
  { id: "contato_alabarda_profano_13", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [652,784], raridade: "☀️ Solar", preco: 40092 },
  { id: "distancia_bumerangue_eterno_13", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [662,757], raridade: "☀️ Solar", preco: 42319 },
  { id: "magica_relicario_selvagem_13", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [656,727], raridade: "☀️ Solar", preco: 37184 },
  { id: "contato_machadinha_draconiano_13", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [669,773], raridade: "☀️ Solar", preco: 42288 },
  { id: "distancia_arco_infernal_13", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [715,765], raridade: "☀️ Solar", preco: 40254 },
  { id: "magica_cajado_lunar_13", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [683,799], raridade: "☀️ Solar", preco: 47988 },
  { id: "contato_maca_solar_13", nome: "🗡️ Maça Solar", tipo: "contato", dano: [651,789], raridade: "☀️ Solar", preco: 48129 },
  { id: "distancia_besta_anciao_13", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [684,739], raridade: "☀️ Solar", preco: 36232 },
  { id: "magica_bastao_fantasma_13", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [708,782], raridade: "☀️ Solar", preco: 42078 },
  { id: "contato_espada_titanico_13", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [710,772], raridade: "☀️ Solar", preco: 40395 },
  { id: "distancia_zarabatana_umbrio_13", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [665,753], raridade: "☀️ Solar", preco: 43922 },
  { id: "magica_grimorio_marcado_13", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [700,784], raridade: "☀️ Solar", preco: 47425 },
  { id: "contato_machado_perdido_13", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [720,798], raridade: "☀️ Solar", preco: 41181 },
  { id: "distancia_funda_bendito_13", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [707,761], raridade: "☀️ Solar", preco: 40334 },
  { id: "magica_orbe_impuro_13", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [660,736], raridade: "☀️ Solar", preco: 37060 },
  { id: "contato_lanca_nebuloso_13", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [690,773], raridade: "☀️ Solar", preco: 42606 },
  { id: "distancia_chicote_ardente_13", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [702,772], raridade: "☀️ Solar", preco: 39928 },
  { id: "magica_cetro_congelante_13", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [684,758], raridade: "☀️ Solar", preco: 45728 },
  { id: "contato_martelo_sussurrante_13", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [714,764], raridade: "☀️ Solar", preco: 39962 },
  { id: "distancia_lamina_arrojadica_nefasto_13", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [701,755], raridade: "☀️ Solar", preco: 36330 },
  { id: "magica_varinha_prateado_13", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [656,760], raridade: "☀️ Solar", preco: 38681 },
  { id: "contato_adaga_dourado_13", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [685,737], raridade: "☀️ Solar", preco: 40856 },
  { id: "distancia_arpao_negro_13", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [669,796], raridade: "☀️ Solar", preco: 45059 },
  { id: "magica_tomo_branco_13", nome: "🪄 Tomo Branco", tipo: "magica", dano: [669,777], raridade: "☀️ Solar", preco: 35850 },
  { id: "contato_clava_carmesim_13", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [661,765], raridade: "☀️ Solar", preco: 43184 },
  { id: "distancia_bumerangue_verdejante_13", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [679,733], raridade: "☀️ Solar", preco: 47439 },
  { id: "magica_relicario_cinereo_13", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [723,800], raridade: "☀️ Solar", preco: 35782 },
  { id: "contato_foice_espinhoso_13", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [693,746], raridade: "☀️ Solar", preco: 37470 },
  { id: "distancia_arco_cristal_13", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [723,795], raridade: "☀️ Solar", preco: 41286 },
  { id: "magica_cajado_runa_13", nome: "🪄 Cajado Runa", tipo: "magica", dano: [697,784], raridade: "☀️ Solar", preco: 40809 },
  { id: "contato_alabarda_chama_13", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [716,770], raridade: "☀️ Solar", preco: 44243 },
  { id: "distancia_besta_trovao_13", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [666,783], raridade: "☀️ Solar", preco: 35911 },
  { id: "magica_bastao_vento_13", nome: "🪄 Bastão Vento", tipo: "magica", dano: [662,718], raridade: "☀️ Solar", preco: 45123 },
  { id: "contato_machadinha_aco_13", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [718,790], raridade: "☀️ Solar", preco: 49355 },
  { id: "distancia_zarabatana_ferro_13", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [653,725], raridade: "☀️ Solar", preco: 48726 },
  { id: "magica_grimorio_osso_13", nome: "🪄 Grimório Osso", tipo: "magica", dano: [704,791], raridade: "☀️ Solar", preco: 43047 },
  { id: "contato_maca_sangue_13", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [666,761], raridade: "☀️ Solar", preco: 42883 },
  { id: "distancia_funda_alma_13", nome: "🏹 Funda Alma", tipo: "distancia", dano: [678,771], raridade: "☀️ Solar", preco: 41380 },
  { id: "magica_orbe_vazio_13", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [657,788], raridade: "☀️ Solar", preco: 48326 },
  { id: "contato_espada_ancestral_14", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [808,867], raridade: "🌊 Abissal Marinha", preco: 63074 },
  { id: "distancia_arco_sombrio_14", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [853,908], raridade: "🌊 Abissal Marinha", preco: 55121 },
  { id: "magica_cajado_radiante_14", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [863,925], raridade: "🌊 Abissal Marinha", preco: 59467 },
  { id: "contato_machado_corrompido_14", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [847,923], raridade: "🌊 Abissal Marinha", preco: 66305 },
  { id: "distancia_besta_sagrado_14", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [862,927], raridade: "🌊 Abissal Marinha", preco: 53178 },
  { id: "magica_bastao_amaldicoado_14", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [807,878], raridade: "🌊 Abissal Marinha", preco: 54800 },
  { id: "contato_lanca_glacial_14", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [805,911], raridade: "🌊 Abissal Marinha", preco: 68491 },
  { id: "distancia_zarabatana_flamejante_14", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [847,940], raridade: "🌊 Abissal Marinha", preco: 62971 },
  { id: "magica_grimorio_espectral_14", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [847,945], raridade: "🌊 Abissal Marinha", preco: 60835 },
  { id: "contato_martelo_runico_14", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [816,871], raridade: "🌊 Abissal Marinha", preco: 61220 },
  { id: "distancia_funda_abissal_14", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [867,949], raridade: "🌊 Abissal Marinha", preco: 53247 },
  { id: "magica_orbe_divino_14", nome: "🪄 Orbe Divino", tipo: "magica", dano: [859,948], raridade: "🌊 Abissal Marinha", preco: 65827 },
  { id: "contato_adaga_vingativo_14", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [864,923], raridade: "🌊 Abissal Marinha", preco: 65621 },
  { id: "distancia_chicote_silencioso_14", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [827,903], raridade: "🌊 Abissal Marinha", preco: 59172 },
  { id: "magica_cetro_etereo_14", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [818,874], raridade: "🌊 Abissal Marinha", preco: 63073 },
  { id: "contato_clava_voraz_14", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [793,900], raridade: "🌊 Abissal Marinha", preco: 60665 },
  { id: "distancia_lamina_arrojadica_imortal_14", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [858,917], raridade: "🌊 Abissal Marinha", preco: 62083 },
  { id: "magica_varinha_cristalino_14", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [835,934], raridade: "🌊 Abissal Marinha", preco: 51389 },
  { id: "contato_foice_tempestuoso_14", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [859,943], raridade: "🌊 Abissal Marinha", preco: 66319 },
  { id: "distancia_arpao_venenoso_14", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [859,912], raridade: "🌊 Abissal Marinha", preco: 56747 },
  { id: "magica_tomo_celestial_14", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [866,921], raridade: "🌊 Abissal Marinha", preco: 66800 },
  { id: "contato_alabarda_profano_14", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [870,931], raridade: "🌊 Abissal Marinha", preco: 64290 },
  { id: "distancia_bumerangue_eterno_14", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [870,941], raridade: "🌊 Abissal Marinha", preco: 61644 },
  { id: "magica_relicario_selvagem_14", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [820,924], raridade: "🌊 Abissal Marinha", preco: 66318 },
  { id: "contato_machadinha_draconiano_14", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [811,917], raridade: "🌊 Abissal Marinha", preco: 69883 },
  { id: "distancia_arco_infernal_14", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [854,947], raridade: "🌊 Abissal Marinha", preco: 50512 },
  { id: "magica_cajado_lunar_14", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [796,943], raridade: "🌊 Abissal Marinha", preco: 50957 },
  { id: "contato_maca_solar_14", nome: "🗡️ Maça Solar", tipo: "contato", dano: [839,926], raridade: "🌊 Abissal Marinha", preco: 57531 },
  { id: "distancia_besta_anciao_14", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [815,895], raridade: "🌊 Abissal Marinha", preco: 56286 },
  { id: "magica_bastao_fantasma_14", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [793,879], raridade: "🌊 Abissal Marinha", preco: 66803 },
  { id: "contato_espada_titanico_14", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [821,890], raridade: "🌊 Abissal Marinha", preco: 67763 },
  { id: "distancia_zarabatana_umbrio_14", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [843,917], raridade: "🌊 Abissal Marinha", preco: 67633 },
  { id: "magica_grimorio_marcado_14", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [791,876], raridade: "🌊 Abissal Marinha", preco: 68773 },
  { id: "contato_machado_perdido_14", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [822,924], raridade: "🌊 Abissal Marinha", preco: 69405 },
  { id: "distancia_funda_bendito_14", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [867,930], raridade: "🌊 Abissal Marinha", preco: 55380 },
  { id: "magica_orbe_impuro_14", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [797,904], raridade: "🌊 Abissal Marinha", preco: 61356 },
  { id: "contato_lanca_nebuloso_14", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [826,887], raridade: "🌊 Abissal Marinha", preco: 59836 },
  { id: "distancia_chicote_ardente_14", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [832,913], raridade: "🌊 Abissal Marinha", preco: 69637 },
  { id: "magica_cetro_congelante_14", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [800,929], raridade: "🌊 Abissal Marinha", preco: 65785 },
  { id: "contato_martelo_sussurrante_14", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [808,897], raridade: "🌊 Abissal Marinha", preco: 54764 },
  { id: "distancia_lamina_arrojadica_nefasto_14", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [845,946], raridade: "🌊 Abissal Marinha", preco: 52057 },
  { id: "magica_varinha_prateado_14", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [812,884], raridade: "🌊 Abissal Marinha", preco: 59674 },
  { id: "contato_adaga_dourado_14", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [803,903], raridade: "🌊 Abissal Marinha", preco: 65408 },
  { id: "distancia_arpao_negro_14", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [825,880], raridade: "🌊 Abissal Marinha", preco: 69938 },
  { id: "magica_tomo_branco_14", nome: "🪄 Tomo Branco", tipo: "magica", dano: [804,945], raridade: "🌊 Abissal Marinha", preco: 69059 },
  { id: "contato_clava_carmesim_14", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [843,948], raridade: "🌊 Abissal Marinha", preco: 66247 },
  { id: "distancia_bumerangue_verdejante_14", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [840,905], raridade: "🌊 Abissal Marinha", preco: 56549 },
  { id: "magica_relicario_cinereo_14", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [804,934], raridade: "🌊 Abissal Marinha", preco: 65901 },
  { id: "contato_foice_espinhoso_14", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [831,946], raridade: "🌊 Abissal Marinha", preco: 51316 },
  { id: "distancia_arco_cristal_14", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [804,930], raridade: "🌊 Abissal Marinha", preco: 62066 },
  { id: "magica_cajado_runa_14", nome: "🪄 Cajado Runa", tipo: "magica", dano: [844,944], raridade: "🌊 Abissal Marinha", preco: 51993 },
  { id: "contato_alabarda_chama_14", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [804,889], raridade: "🌊 Abissal Marinha", preco: 54314 },
  { id: "distancia_besta_trovao_14", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [837,920], raridade: "🌊 Abissal Marinha", preco: 68054 },
  { id: "magica_bastao_vento_14", nome: "🪄 Bastão Vento", tipo: "magica", dano: [860,924], raridade: "🌊 Abissal Marinha", preco: 67232 },
  { id: "contato_machadinha_aco_14", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [806,915], raridade: "🌊 Abissal Marinha", preco: 69399 },
  { id: "distancia_zarabatana_ferro_14", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [850,912], raridade: "🌊 Abissal Marinha", preco: 55941 },
  { id: "magica_grimorio_osso_14", nome: "🪄 Grimório Osso", tipo: "magica", dano: [816,915], raridade: "🌊 Abissal Marinha", preco: 62616 },
  { id: "contato_maca_sangue_14", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [846,946], raridade: "🌊 Abissal Marinha", preco: 65402 },
  { id: "distancia_funda_alma_14", nome: "🏹 Funda Alma", tipo: "distancia", dano: [820,889], raridade: "🌊 Abissal Marinha", preco: 61508 },
  { id: "magica_orbe_vazio_14", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [843,904], raridade: "🌊 Abissal Marinha", preco: 61943 },
  { id: "contato_espada_ancestral_15", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [942,1004], raridade: "❄️ Glacial Eterna", preco: 72838 },
  { id: "distancia_arco_sombrio_15", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [951,1063], raridade: "❄️ Glacial Eterna", preco: 93108 },
  { id: "magica_cajado_radiante_15", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [1028,1117], raridade: "❄️ Glacial Eterna", preco: 76722 },
  { id: "contato_machado_corrompido_15", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [1001,1069], raridade: "❄️ Glacial Eterna", preco: 81588 },
  { id: "distancia_besta_sagrado_15", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [997,1058], raridade: "❄️ Glacial Eterna", preco: 72859 },
  { id: "magica_bastao_amaldicoado_15", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [965,1107], raridade: "❄️ Glacial Eterna", preco: 71330 },
  { id: "contato_lanca_glacial_15", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [960,1108], raridade: "❄️ Glacial Eterna", preco: 84725 },
  { id: "distancia_zarabatana_flamejante_15", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [1017,1108], raridade: "❄️ Glacial Eterna", preco: 83345 },
  { id: "magica_grimorio_espectral_15", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [987,1053], raridade: "❄️ Glacial Eterna", preco: 71244 },
  { id: "contato_martelo_runico_15", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [984,1047], raridade: "❄️ Glacial Eterna", preco: 94795 },
  { id: "distancia_funda_abissal_15", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [943,1080], raridade: "❄️ Glacial Eterna", preco: 70556 },
  { id: "magica_orbe_divino_15", nome: "🪄 Orbe Divino", tipo: "magica", dano: [974,1047], raridade: "❄️ Glacial Eterna", preco: 88920 },
  { id: "contato_adaga_vingativo_15", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [1023,1109], raridade: "❄️ Glacial Eterna", preco: 94243 },
  { id: "distancia_chicote_silencioso_15", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [988,1087], raridade: "❄️ Glacial Eterna", preco: 93822 },
  { id: "magica_cetro_etereo_15", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [940,1013], raridade: "❄️ Glacial Eterna", preco: 94529 },
  { id: "contato_clava_voraz_15", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [1015,1112], raridade: "❄️ Glacial Eterna", preco: 93512 },
  { id: "distancia_lamina_arrojadica_imortal_15", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [950,1022], raridade: "❄️ Glacial Eterna", preco: 76513 },
  { id: "magica_varinha_cristalino_15", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [1016,1103], raridade: "❄️ Glacial Eterna", preco: 82741 },
  { id: "contato_foice_tempestuoso_15", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [1004,1081], raridade: "❄️ Glacial Eterna", preco: 92077 },
  { id: "distancia_arpao_venenoso_15", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [953,1101], raridade: "❄️ Glacial Eterna", preco: 72772 },
  { id: "magica_tomo_celestial_15", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [949,1055], raridade: "❄️ Glacial Eterna", preco: 88884 },
  { id: "contato_alabarda_profano_15", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [1028,1103], raridade: "❄️ Glacial Eterna", preco: 77502 },
  { id: "distancia_bumerangue_eterno_15", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [940,1115], raridade: "❄️ Glacial Eterna", preco: 70950 },
  { id: "magica_relicario_selvagem_15", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [1002,1073], raridade: "❄️ Glacial Eterna", preco: 86421 },
  { id: "contato_machadinha_draconiano_15", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [982,1073], raridade: "❄️ Glacial Eterna", preco: 88888 },
  { id: "distancia_arco_infernal_15", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [969,1079], raridade: "❄️ Glacial Eterna", preco: 77154 },
  { id: "magica_cajado_lunar_15", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [975,1087], raridade: "❄️ Glacial Eterna", preco: 74351 },
  { id: "contato_maca_solar_15", nome: "🗡️ Maça Solar", tipo: "contato", dano: [996,1105], raridade: "❄️ Glacial Eterna", preco: 70427 },
  { id: "distancia_besta_anciao_15", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [984,1112], raridade: "❄️ Glacial Eterna", preco: 86466 },
  { id: "magica_bastao_fantasma_15", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [965,1097], raridade: "❄️ Glacial Eterna", preco: 73631 },
  { id: "contato_espada_titanico_15", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [952,1065], raridade: "❄️ Glacial Eterna", preco: 79294 },
  { id: "distancia_zarabatana_umbrio_15", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [958,1068], raridade: "❄️ Glacial Eterna", preco: 72009 },
  { id: "magica_grimorio_marcado_15", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [966,1054], raridade: "❄️ Glacial Eterna", preco: 79156 },
  { id: "contato_machado_perdido_15", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [952,1028], raridade: "❄️ Glacial Eterna", preco: 77643 },
  { id: "distancia_funda_bendito_15", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [1009,1084], raridade: "❄️ Glacial Eterna", preco: 79829 },
  { id: "magica_orbe_impuro_15", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [991,1098], raridade: "❄️ Glacial Eterna", preco: 90383 },
  { id: "contato_lanca_nebuloso_15", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [954,1023], raridade: "❄️ Glacial Eterna", preco: 79086 },
  { id: "distancia_chicote_ardente_15", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [948,1047], raridade: "❄️ Glacial Eterna", preco: 92084 },
  { id: "magica_cetro_congelante_15", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [996,1085], raridade: "❄️ Glacial Eterna", preco: 88284 },
  { id: "contato_martelo_sussurrante_15", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [941,1034], raridade: "❄️ Glacial Eterna", preco: 77623 },
  { id: "distancia_lamina_arrojadica_nefasto_15", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [1003,1090], raridade: "❄️ Glacial Eterna", preco: 84852 },
  { id: "magica_varinha_prateado_15", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [956,1098], raridade: "❄️ Glacial Eterna", preco: 94898 },
  { id: "contato_adaga_dourado_15", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [975,1076], raridade: "❄️ Glacial Eterna", preco: 70487 },
  { id: "distancia_arpao_negro_15", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [1013,1118], raridade: "❄️ Glacial Eterna", preco: 86675 },
  { id: "magica_tomo_branco_15", nome: "🪄 Tomo Branco", tipo: "magica", dano: [988,1085], raridade: "❄️ Glacial Eterna", preco: 70074 },
  { id: "contato_clava_carmesim_15", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [1018,1087], raridade: "❄️ Glacial Eterna", preco: 73369 },
  { id: "distancia_bumerangue_verdejante_15", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [990,1070], raridade: "❄️ Glacial Eterna", preco: 83701 },
  { id: "magica_relicario_cinereo_15", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [1005,1119], raridade: "❄️ Glacial Eterna", preco: 82804 },
  { id: "contato_foice_espinhoso_15", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [954,1079], raridade: "❄️ Glacial Eterna", preco: 71478 },
  { id: "distancia_arco_cristal_15", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [1008,1079], raridade: "❄️ Glacial Eterna", preco: 76495 },
  { id: "magica_cajado_runa_15", nome: "🪄 Cajado Runa", tipo: "magica", dano: [1004,1104], raridade: "❄️ Glacial Eterna", preco: 79830 },
  { id: "contato_alabarda_chama_15", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [1021,1094], raridade: "❄️ Glacial Eterna", preco: 88975 },
  { id: "distancia_besta_trovao_15", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [1017,1089], raridade: "❄️ Glacial Eterna", preco: 93983 },
  { id: "magica_bastao_vento_15", nome: "🪄 Bastão Vento", tipo: "magica", dano: [996,1108], raridade: "❄️ Glacial Eterna", preco: 70028 },
  { id: "contato_machadinha_aco_15", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [972,1085], raridade: "❄️ Glacial Eterna", preco: 73676 },
  { id: "distancia_zarabatana_ferro_15", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [1014,1078], raridade: "❄️ Glacial Eterna", preco: 70846 },
  { id: "magica_grimorio_osso_15", nome: "🪄 Grimório Osso", tipo: "magica", dano: [941,1010], raridade: "❄️ Glacial Eterna", preco: 79183 },
  { id: "contato_maca_sangue_15", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [975,1095], raridade: "❄️ Glacial Eterna", preco: 78751 },
  { id: "distancia_funda_alma_15", nome: "🏹 Funda Alma", tipo: "distancia", dano: [964,1024], raridade: "❄️ Glacial Eterna", preco: 83342 },
  { id: "magica_orbe_vazio_15", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [997,1076], raridade: "❄️ Glacial Eterna", preco: 71232 },
  { id: "contato_espada_ancestral_16", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [1170,1248], raridade: "🔥 Infernal", preco: 106608 },
  { id: "distancia_arco_sombrio_16", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [1146,1264], raridade: "🔥 Infernal", preco: 120900 },
  { id: "magica_cajado_radiante_16", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [1141,1280], raridade: "🔥 Infernal", preco: 107760 },
  { id: "contato_machado_corrompido_16", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [1141,1258], raridade: "🔥 Infernal", preco: 99795 },
  { id: "distancia_besta_sagrado_16", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [1187,1282], raridade: "🔥 Infernal", preco: 123097 },
  { id: "magica_bastao_amaldicoado_16", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [1177,1248], raridade: "🔥 Infernal", preco: 127815 },
  { id: "contato_lanca_glacial_16", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [1173,1280], raridade: "🔥 Infernal", preco: 118950 },
  { id: "distancia_zarabatana_flamejante_16", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [1210,1309], raridade: "🔥 Infernal", preco: 128333 },
  { id: "magica_grimorio_espectral_16", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [1205,1292], raridade: "🔥 Infernal", preco: 111142 },
  { id: "contato_martelo_runico_16", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [1164,1268], raridade: "🔥 Infernal", preco: 119063 },
  { id: "distancia_funda_abissal_16", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [1120,1315], raridade: "🔥 Infernal", preco: 113273 },
  { id: "magica_orbe_divino_16", nome: "🪄 Orbe Divino", tipo: "magica", dano: [1125,1239], raridade: "🔥 Infernal", preco: 114248 },
  { id: "contato_adaga_vingativo_16", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [1116,1295], raridade: "🔥 Infernal", preco: 112924 },
  { id: "distancia_chicote_silencioso_16", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [1174,1285], raridade: "🔥 Infernal", preco: 100351 },
  { id: "magica_cetro_etereo_16", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [1114,1265], raridade: "🔥 Infernal", preco: 113819 },
  { id: "contato_clava_voraz_16", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [1163,1280], raridade: "🔥 Infernal", preco: 109374 },
  { id: "distancia_lamina_arrojadica_imortal_16", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [1176,1253], raridade: "🔥 Infernal", preco: 120113 },
  { id: "magica_varinha_cristalino_16", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [1154,1235], raridade: "🔥 Infernal", preco: 101553 },
  { id: "contato_foice_tempestuoso_16", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [1168,1255], raridade: "🔥 Infernal", preco: 127658 },
  { id: "distancia_arpao_venenoso_16", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [1198,1320], raridade: "🔥 Infernal", preco: 125713 },
  { id: "magica_tomo_celestial_16", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [1182,1268], raridade: "🔥 Infernal", preco: 125380 },
  { id: "contato_alabarda_profano_16", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [1178,1290], raridade: "🔥 Infernal", preco: 103120 },
  { id: "distancia_bumerangue_eterno_16", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [1207,1312], raridade: "🔥 Infernal", preco: 106971 },
  { id: "magica_relicario_selvagem_16", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [1135,1314], raridade: "🔥 Infernal", preco: 109783 },
  { id: "contato_machadinha_draconiano_16", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [1188,1290], raridade: "🔥 Infernal", preco: 117067 },
  { id: "distancia_arco_infernal_16", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [1205,1320], raridade: "🔥 Infernal", preco: 113098 },
  { id: "magica_cajado_lunar_16", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [1208,1286], raridade: "🔥 Infernal", preco: 105236 },
  { id: "contato_maca_solar_16", nome: "🗡️ Maça Solar", tipo: "contato", dano: [1178,1287], raridade: "🔥 Infernal", preco: 109492 },
  { id: "distancia_besta_anciao_16", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [1131,1206], raridade: "🔥 Infernal", preco: 104829 },
  { id: "magica_bastao_fantasma_16", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [1140,1237], raridade: "🔥 Infernal", preco: 112284 },
  { id: "contato_espada_titanico_16", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [1131,1270], raridade: "🔥 Infernal", preco: 119334 },
  { id: "distancia_zarabatana_umbrio_16", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [1208,1282], raridade: "🔥 Infernal", preco: 121979 },
  { id: "magica_grimorio_marcado_16", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [1113,1232], raridade: "🔥 Infernal", preco: 103183 },
  { id: "contato_machado_perdido_16", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [1171,1243], raridade: "🔥 Infernal", preco: 95739 },
  { id: "distancia_funda_bendito_16", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [1149,1305], raridade: "🔥 Infernal", preco: 129667 },
  { id: "magica_orbe_impuro_16", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [1131,1245], raridade: "🔥 Infernal", preco: 108420 },
  { id: "contato_lanca_nebuloso_16", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [1121,1194], raridade: "🔥 Infernal", preco: 112163 },
  { id: "distancia_chicote_ardente_16", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [1185,1279], raridade: "🔥 Infernal", preco: 108876 },
  { id: "magica_cetro_congelante_16", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [1130,1267], raridade: "🔥 Infernal", preco: 125704 },
  { id: "contato_martelo_sussurrante_16", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [1114,1302], raridade: "🔥 Infernal", preco: 103401 },
  { id: "distancia_lamina_arrojadica_nefasto_16", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [1152,1319], raridade: "🔥 Infernal", preco: 123229 },
  { id: "magica_varinha_prateado_16", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [1212,1320], raridade: "🔥 Infernal", preco: 106829 },
  { id: "contato_adaga_dourado_16", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [1134,1283], raridade: "🔥 Infernal", preco: 120091 },
  { id: "distancia_arpao_negro_16", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [1200,1304], raridade: "🔥 Infernal", preco: 107959 },
  { id: "magica_tomo_branco_16", nome: "🪄 Tomo Branco", tipo: "magica", dano: [1195,1283], raridade: "🔥 Infernal", preco: 106039 },
  { id: "contato_clava_carmesim_16", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [1145,1294], raridade: "🔥 Infernal", preco: 99770 },
  { id: "distancia_bumerangue_verdejante_16", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [1117,1205], raridade: "🔥 Infernal", preco: 122840 },
  { id: "magica_relicario_cinereo_16", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [1151,1283], raridade: "🔥 Infernal", preco: 101129 },
  { id: "contato_foice_espinhoso_16", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [1122,1264], raridade: "🔥 Infernal", preco: 119984 },
  { id: "distancia_arco_cristal_16", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [1117,1280], raridade: "🔥 Infernal", preco: 107533 },
  { id: "magica_cajado_runa_16", nome: "🪄 Cajado Runa", tipo: "magica", dano: [1174,1244], raridade: "🔥 Infernal", preco: 95706 },
  { id: "contato_alabarda_chama_16", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [1167,1252], raridade: "🔥 Infernal", preco: 96208 },
  { id: "distancia_besta_trovao_16", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [1161,1309], raridade: "🔥 Infernal", preco: 101689 },
  { id: "magica_bastao_vento_16", nome: "🪄 Bastão Vento", tipo: "magica", dano: [1138,1209], raridade: "🔥 Infernal", preco: 128435 },
  { id: "contato_machadinha_aco_16", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [1144,1284], raridade: "🔥 Infernal", preco: 111860 },
  { id: "distancia_zarabatana_ferro_16", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [1150,1303], raridade: "🔥 Infernal", preco: 119194 },
  { id: "magica_grimorio_osso_16", nome: "🪄 Grimório Osso", tipo: "magica", dano: [1120,1271], raridade: "🔥 Infernal", preco: 111043 },
  { id: "contato_maca_sangue_16", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [1132,1277], raridade: "🔥 Infernal", preco: 114637 },
  { id: "distancia_funda_alma_16", nome: "🏹 Funda Alma", tipo: "distancia", dano: [1166,1294], raridade: "🔥 Infernal", preco: 118659 },
  { id: "magica_orbe_vazio_16", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [1165,1251], raridade: "🔥 Infernal", preco: 115569 },
  { id: "contato_espada_ancestral_17", nome: "🗡️ Espada Ancestral", tipo: "contato", dano: [1374,1540], raridade: "⚡ Relâmpago Divino", preco: 166997 },
  { id: "distancia_arco_sombrio_17", nome: "🏹 Arco Sombrio", tipo: "distancia", dano: [1390,1517], raridade: "⚡ Relâmpago Divino", preco: 140856 },
  { id: "magica_cajado_radiante_17", nome: "🪄 Cajado Radiante", tipo: "magica", dano: [1350,1504], raridade: "⚡ Relâmpago Divino", preco: 153347 },
  { id: "contato_machado_corrompido_17", nome: "🗡️ Machado Corrompido", tipo: "contato", dano: [1394,1511], raridade: "⚡ Relâmpago Divino", preco: 174276 },
  { id: "distancia_besta_sagrado_17", nome: "🏹 Besta Sagrado", tipo: "distancia", dano: [1307,1535], raridade: "⚡ Relâmpago Divino", preco: 147415 },
  { id: "magica_bastao_amaldicoado_17", nome: "🪄 Bastão Amaldiçoado", tipo: "magica", dano: [1339,1549], raridade: "⚡ Relâmpago Divino", preco: 156823 },
  { id: "contato_lanca_glacial_17", nome: "🗡️ Lança Glacial", tipo: "contato", dano: [1386,1470], raridade: "⚡ Relâmpago Divino", preco: 134141 },
  { id: "distancia_zarabatana_flamejante_17", nome: "🏹 Zarabatana Flamejante", tipo: "distancia", dano: [1346,1476], raridade: "⚡ Relâmpago Divino", preco: 154974 },
  { id: "magica_grimorio_espectral_17", nome: "🪄 Grimório Espectral", tipo: "magica", dano: [1399,1550], raridade: "⚡ Relâmpago Divino", preco: 172054 },
  { id: "contato_martelo_runico_17", nome: "🗡️ Martelo Rúnico", tipo: "contato", dano: [1336,1483], raridade: "⚡ Relâmpago Divino", preco: 148181 },
  { id: "distancia_funda_abissal_17", nome: "🏹 Funda Abissal", tipo: "distancia", dano: [1385,1546], raridade: "⚡ Relâmpago Divino", preco: 143011 },
  { id: "magica_orbe_divino_17", nome: "🪄 Orbe Divino", tipo: "magica", dano: [1373,1510], raridade: "⚡ Relâmpago Divino", preco: 137379 },
  { id: "contato_adaga_vingativo_17", nome: "🗡️ Adaga Vingativo", tipo: "contato", dano: [1414,1518], raridade: "⚡ Relâmpago Divino", preco: 159028 },
  { id: "distancia_chicote_silencioso_17", nome: "🏹 Chicote Silencioso", tipo: "distancia", dano: [1422,1543], raridade: "⚡ Relâmpago Divino", preco: 142790 },
  { id: "magica_cetro_etereo_17", nome: "🪄 Cetro Etéreo", tipo: "magica", dano: [1376,1500], raridade: "⚡ Relâmpago Divino", preco: 133607 },
  { id: "contato_clava_voraz_17", nome: "🗡️ Clava Voraz", tipo: "contato", dano: [1347,1533], raridade: "⚡ Relâmpago Divino", preco: 140387 },
  { id: "distancia_lamina_arrojadica_imortal_17", nome: "🏹 Lâmina Arrojadiça Imortal", tipo: "distancia", dano: [1319,1515], raridade: "⚡ Relâmpago Divino", preco: 152847 },
  { id: "magica_varinha_cristalino_17", nome: "🪄 Varinha Cristalino", tipo: "magica", dano: [1404,1532], raridade: "⚡ Relâmpago Divino", preco: 146744 },
  { id: "contato_foice_tempestuoso_17", nome: "🗡️ Foice Tempestuoso", tipo: "contato", dano: [1307,1530], raridade: "⚡ Relâmpago Divino", preco: 167655 },
  { id: "distancia_arpao_venenoso_17", nome: "🏹 Arpão Venenoso", tipo: "distancia", dano: [1421,1526], raridade: "⚡ Relâmpago Divino", preco: 133353 },
  { id: "magica_tomo_celestial_17", nome: "🪄 Tomo Celestial", tipo: "magica", dano: [1351,1486], raridade: "⚡ Relâmpago Divino", preco: 158770 },
  { id: "contato_alabarda_profano_17", nome: "🗡️ Alabarda Profano", tipo: "contato", dano: [1416,1507], raridade: "⚡ Relâmpago Divino", preco: 152320 },
  { id: "distancia_bumerangue_eterno_17", nome: "🏹 Bumerangue Eterno", tipo: "distancia", dano: [1340,1534], raridade: "⚡ Relâmpago Divino", preco: 163601 },
  { id: "magica_relicario_selvagem_17", nome: "🪄 Relicário Selvagem", tipo: "magica", dano: [1317,1406], raridade: "⚡ Relâmpago Divino", preco: 150859 },
  { id: "contato_machadinha_draconiano_17", nome: "🗡️ Machadinha Draconiano", tipo: "contato", dano: [1394,1500], raridade: "⚡ Relâmpago Divino", preco: 136881 },
  { id: "distancia_arco_infernal_17", nome: "🏹 Arco Infernal", tipo: "distancia", dano: [1384,1529], raridade: "⚡ Relâmpago Divino", preco: 172158 },
  { id: "magica_cajado_lunar_17", nome: "🪄 Cajado Lunar", tipo: "magica", dano: [1315,1416], raridade: "⚡ Relâmpago Divino", preco: 154483 },
  { id: "contato_maca_solar_17", nome: "🗡️ Maça Solar", tipo: "contato", dano: [1326,1495], raridade: "⚡ Relâmpago Divino", preco: 148406 },
  { id: "distancia_besta_anciao_17", nome: "🏹 Besta Ancião", tipo: "distancia", dano: [1313,1529], raridade: "⚡ Relâmpago Divino", preco: 130688 },
  { id: "magica_bastao_fantasma_17", nome: "🪄 Bastão Fantasma", tipo: "magica", dano: [1398,1550], raridade: "⚡ Relâmpago Divino", preco: 148338 },
  { id: "contato_espada_titanico_17", nome: "🗡️ Espada Titânico", tipo: "contato", dano: [1326,1415], raridade: "⚡ Relâmpago Divino", preco: 141017 },
  { id: "distancia_zarabatana_umbrio_17", nome: "🏹 Zarabatana Umbrio", tipo: "distancia", dano: [1323,1507], raridade: "⚡ Relâmpago Divino", preco: 161780 },
  { id: "magica_grimorio_marcado_17", nome: "🪄 Grimório Marcado", tipo: "magica", dano: [1374,1501], raridade: "⚡ Relâmpago Divino", preco: 172959 },
  { id: "contato_machado_perdido_17", nome: "🗡️ Machado Perdido", tipo: "contato", dano: [1407,1541], raridade: "⚡ Relâmpago Divino", preco: 167728 },
  { id: "distancia_funda_bendito_17", nome: "🏹 Funda Bendito", tipo: "distancia", dano: [1305,1458], raridade: "⚡ Relâmpago Divino", preco: 145832 },
  { id: "magica_orbe_impuro_17", nome: "🪄 Orbe Impuro", tipo: "magica", dano: [1390,1534], raridade: "⚡ Relâmpago Divino", preco: 143155 },
  { id: "contato_lanca_nebuloso_17", nome: "🗡️ Lança Nebuloso", tipo: "contato", dano: [1355,1469], raridade: "⚡ Relâmpago Divino", preco: 144787 },
  { id: "distancia_chicote_ardente_17", nome: "🏹 Chicote Ardente", tipo: "distancia", dano: [1402,1538], raridade: "⚡ Relâmpago Divino", preco: 165350 },
  { id: "magica_cetro_congelante_17", nome: "🪄 Cetro Congelante", tipo: "magica", dano: [1402,1493], raridade: "⚡ Relâmpago Divino", preco: 169644 },
  { id: "contato_martelo_sussurrante_17", nome: "🗡️ Martelo Sussurrante", tipo: "contato", dano: [1326,1480], raridade: "⚡ Relâmpago Divino", preco: 167066 },
  { id: "distancia_lamina_arrojadica_nefasto_17", nome: "🏹 Lâmina Arrojadiça Nefasto", tipo: "distancia", dano: [1381,1505], raridade: "⚡ Relâmpago Divino", preco: 168160 },
  { id: "magica_varinha_prateado_17", nome: "🪄 Varinha Prateado", tipo: "magica", dano: [1386,1482], raridade: "⚡ Relâmpago Divino", preco: 165151 },
  { id: "contato_adaga_dourado_17", nome: "🗡️ Adaga Dourado", tipo: "contato", dano: [1390,1495], raridade: "⚡ Relâmpago Divino", preco: 149202 },
  { id: "distancia_arpao_negro_17", nome: "🏹 Arpão Negro", tipo: "distancia", dano: [1365,1539], raridade: "⚡ Relâmpago Divino", preco: 167519 },
  { id: "magica_tomo_branco_17", nome: "🪄 Tomo Branco", tipo: "magica", dano: [1303,1405], raridade: "⚡ Relâmpago Divino", preco: 149145 },
  { id: "contato_clava_carmesim_17", nome: "🗡️ Clava Carmesim", tipo: "contato", dano: [1391,1493], raridade: "⚡ Relâmpago Divino", preco: 163756 },
  { id: "distancia_bumerangue_verdejante_17", nome: "🏹 Bumerangue Verdejante", tipo: "distancia", dano: [1398,1532], raridade: "⚡ Relâmpago Divino", preco: 138062 },
  { id: "magica_relicario_cinereo_17", nome: "🪄 Relicário Cinéreo", tipo: "magica", dano: [1385,1485], raridade: "⚡ Relâmpago Divino", preco: 134746 },
  { id: "contato_foice_espinhoso_17", nome: "🗡️ Foice Espinhoso", tipo: "contato", dano: [1384,1546], raridade: "⚡ Relâmpago Divino", preco: 148171 },
  { id: "distancia_arco_cristal_17", nome: "🏹 Arco Cristal", tipo: "distancia", dano: [1339,1426], raridade: "⚡ Relâmpago Divino", preco: 141274 },
  { id: "magica_cajado_runa_17", nome: "🪄 Cajado Runa", tipo: "magica", dano: [1417,1503], raridade: "⚡ Relâmpago Divino", preco: 136219 },
  { id: "contato_alabarda_chama_17", nome: "🗡️ Alabarda Chama", tipo: "contato", dano: [1336,1488], raridade: "⚡ Relâmpago Divino", preco: 157336 },
  { id: "distancia_besta_trovao_17", nome: "🏹 Besta Trovão", tipo: "distancia", dano: [1409,1541], raridade: "⚡ Relâmpago Divino", preco: 163628 },
  { id: "magica_bastao_vento_17", nome: "🪄 Bastão Vento", tipo: "magica", dano: [1328,1461], raridade: "⚡ Relâmpago Divino", preco: 158849 },
  { id: "contato_machadinha_aco_17", nome: "🗡️ Machadinha Aço", tipo: "contato", dano: [1352,1550], raridade: "⚡ Relâmpago Divino", preco: 145667 },
  { id: "distancia_zarabatana_ferro_17", nome: "🏹 Zarabatana Ferro", tipo: "distancia", dano: [1417,1527], raridade: "⚡ Relâmpago Divino", preco: 146839 },
  { id: "magica_grimorio_osso_17", nome: "🪄 Grimório Osso", tipo: "magica", dano: [1387,1528], raridade: "⚡ Relâmpago Divino", preco: 161954 },
  { id: "contato_maca_sangue_17", nome: "🗡️ Maça Sangue", tipo: "contato", dano: [1349,1515], raridade: "⚡ Relâmpago Divino", preco: 155097 },
  { id: "distancia_funda_alma_17", nome: "🏹 Funda Alma", tipo: "distancia", dano: [1420,1547], raridade: "⚡ Relâmpago Divino", preco: 154205 },
  { id: "magica_orbe_vazio_17", nome: "🪄 Orbe Vazio", tipo: "magica", dano: [1308,1416], raridade: "⚡ Relâmpago Divino", preco: 165213 },
  { id: "espada_primordial", nome: "🌟 Espada Primordial", dano: [150,220], raridade: "🔴 Primordial", preco: 0, exclusiva: true },
  { id: "arco_primordial", nome: "🌟 Arco Primordial", dano: [140,210], raridade: "🔴 Primordial", preco: 0, exclusiva: true },
  { id: "cajado_primordial", nome: "🌟 Cajado Primordial", dano: [145,215], raridade: "🔴 Primordial", preco: 0, exclusiva: true },
  { id: "lamina_primordial", nome: "🌟 Lâmina Primordial", dano: [155,230], raridade: "🔴 Primordial", preco: 0, exclusiva: true },
  { id: "garra_vazio", nome: "🌑 Garra do Vazio", dano: [180,260], raridade: "🟠 Abissal", preco: 0, exclusiva: true },
  { id: "lanca_abissal", nome: "🌑 Lança Abissal", dano: [175,255], raridade: "🟠 Abissal", preco: 0, exclusiva: true },
  { id: "machado_caos_eterno", nome: "🌑 Machado do Caos Eterno", dano: [185,270], raridade: "🟠 Abissal", preco: 0, exclusiva: true },
  { id: "espada_sombria", nome: "⚫ Espada Sombria", dano: [200,290], raridade: "⚫ Sombria", preco: 0, exclusiva: true },
  { id: "arco_sombrio", nome: "⚫ Arco Sombrio", dano: [195,280], raridade: "⚫ Sombria", preco: 0, exclusiva: true },
  { id: "cajado_sombrio", nome: "⚫ Cajado Sombrio", dano: [190,275], raridade: "⚫ Sombria", preco: 0, exclusiva: true },
  { id: "espada_amaldicada", nome: "🌑 Espada Amaldiçoada", dano: [220,320], raridade: "🌑 Amaldiçoada", preco: 0, exclusiva: true },
  { id: "foice_amaldicada", nome: "🌑 Foice Amaldiçoada", dano: [215,310], raridade: "🌑 Amaldiçoada", preco: 0, exclusiva: true },
  { id: "espada_celestial", nome: "🌟 Espada Celestial", dano: [250,360], raridade: "🌟 Celestial", preco: 0, exclusiva: true },
  { id: "arco_celestial", nome: "🌟 Arco Celestial", dano: [245,355], raridade: "🌟 Celestial", preco: 0, exclusiva: true },
  { id: "espada_solar", nome: "☀️ Espada Solar", dano: [280,400], raridade: "☀️ Solar", preco: 0, exclusiva: true },
  { id: "lanca_solar", nome: "☀️ Lança Solar", dano: [275,395], raridade: "☀️ Solar", preco: 0, exclusiva: true },
  { id: "tridente_abissal", nome: "🌊 Tridente Abissal", dano: [300,430], raridade: "🌊 Abissal Marinha", preco: 0, exclusiva: true },
  { id: "espada_oceano", nome: "🌊 Espada do Oceano", dano: [295,425], raridade: "🌊 Abissal Marinha", preco: 0, exclusiva: true },
  { id: "espada_glacial", nome: "❄️ Espada Glacial Eterna", dano: [330,480], raridade: "❄️ Glacial Eterna", preco: 0, exclusiva: true },
  { id: "espada_infernal", nome: "🔥 Espada Infernal", dano: [360,520], raridade: "🔥 Infernal", preco: 0, exclusiva: true },
  { id: "lanca_relampago", nome: "⚡ Lança do Relâmpago Divino", dano: [400,580], raridade: "⚡ Relâmpago Divino", preco: 0, exclusiva: true },
  { id: "espada_primeva", nome: "🌈 Espada Primeva", dano: [500,720], raridade: "🌈 Primeva", preco: 0, exclusiva: true },
  { id: "akaketsu_no_enma", nome: "☠️ Akaketsu no Enma", dano: [700,950], raridade: "🩸 Personalizada", preco: 0, exclusiva: true },
  { id: "yomikagari", nome: "☠️ Yomikagari", dano: [700,950], raridade: "🩸 Personalizada", preco: 0, exclusiva: true },
  { id: "lanca_primeva", nome: "🌈 Lança do Primeiro Amanhecer", dano: [510,730], raridade: "🌈 Primeva", preco: 0, exclusiva: true },
  { id: "arco_primeva", nome: "🌈 Arco da Aurora Eterna", dano: [490,710], raridade: "🌈 Primeva", preco: 0, exclusiva: true },
  { id: "cajado_primeva", nome: "🌈 Cajado da Gênese", dano: [520,740], raridade: "🌈 Primeva", preco: 0, exclusiva: true },
  { id: "machado_primeva", nome: "🌈 Machado do Primeiro Mundo", dano: [530,750], raridade: "🌈 Primeva", preco: 0, exclusiva: true },
  { id: "adaga_primeva", nome: "🌈 Adaga do Vazio Original", dano: [480,700], raridade: "🌈 Primeva", preco: 0, exclusiva: true },
  { id: "foice_criacao", nome: "☠️ Foice da Criação", dano: [999,9999], raridade: "☠️ DEUS", preco: 0, exclusiva: true, dono: true },

  // NOVAS FAMÍLIAS DE ARMAS (18 raridades cada)
  { id: "contato_punhal_runico_0", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [8,13], raridade: "⬜ Comum", preco: 47 },
  { id: "contato_punhal_runico_1", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [15,21], raridade: "🟫 Inferior", preco: 100 },
  { id: "contato_punhal_runico_2", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [17,26], raridade: "🟩 Incomum", preco: 273 },
  { id: "contato_punhal_runico_3", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [34,46], raridade: "🟦 Raro", preco: 334 },
  { id: "contato_punhal_runico_4", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [52,64], raridade: "🟪 Épico", preco: 600 },
  { id: "contato_punhal_runico_5", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [86,98], raridade: "🟨 Lendário", preco: 1022 },
  { id: "contato_punhal_runico_6", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [118,141], raridade: "🔶 Ancestral", preco: 1975 },
  { id: "contato_punhal_runico_7", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [133,164], raridade: "🔷 Arcana", preco: 3261 },
  { id: "contato_punhal_runico_8", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [191,214], raridade: "🔴 Primordial", preco: 4012 },
  { id: "contato_punhal_runico_9", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [267,306], raridade: "🟠 Abissal", preco: 9718 },
  { id: "contato_punhal_runico_10", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [341,383], raridade: "⚫ Sombria", preco: 10485 },
  { id: "contato_punhal_runico_11", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [442,494], raridade: "🌑 Amaldiçoada", preco: 17995 },
  { id: "contato_punhal_runico_12", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [543,602], raridade: "🌟 Celestial", preco: 26131 },
  { id: "contato_punhal_runico_13", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [638,699], raridade: "☀️ Solar", preco: 45489 },
  { id: "contato_punhal_runico_14", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [759,815], raridade: "🌊 Abissal Marinha", preco: 59290 },
  { id: "contato_punhal_runico_15", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [885,944], raridade: "❄️ Glacial Eterna", preco: 68467 },
  { id: "contato_punhal_runico_16", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [1100,1173], raridade: "🔥 Infernal", preco: 100212 },
  { id: "contato_punhal_runico_17", nome: "🗡️ Punhal Rúnico", tipo: "contato", dano: [1292,1448], raridade: "⚡ Relâmpago Divino", preco: 156977 },
  { id: "distancia_besta_ancestral_0", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [7,11], raridade: "⬜ Comum", preco: 77 },
  { id: "distancia_besta_ancestral_1", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [17,23], raridade: "🟫 Inferior", preco: 128 },
  { id: "distancia_besta_ancestral_2", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [22,30], raridade: "🟩 Incomum", preco: 279 },
  { id: "distancia_besta_ancestral_3", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [37,54], raridade: "🟦 Raro", preco: 343 },
  { id: "distancia_besta_ancestral_4", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [54,80], raridade: "🟪 Épico", preco: 841 },
  { id: "distancia_besta_ancestral_5", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [77,116], raridade: "🟨 Lendário", preco: 1671 },
  { id: "distancia_besta_ancestral_6", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [119,154], raridade: "🔶 Ancestral", preco: 1707 },
  { id: "distancia_besta_ancestral_7", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [162,204], raridade: "🔷 Arcana", preco: 4143 },
  { id: "distancia_besta_ancestral_8", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [211,270], raridade: "🔴 Primordial", preco: 5253 },
  { id: "distancia_besta_ancestral_9", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [270,356], raridade: "🟠 Abissal", preco: 10431 },
  { id: "distancia_besta_ancestral_10", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [385,435], raridade: "⚫ Sombria", preco: 11699 },
  { id: "distancia_besta_ancestral_11", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [482,555], raridade: "🌑 Amaldiçoada", preco: 22104 },
  { id: "distancia_besta_ancestral_12", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [584,659], raridade: "🌟 Celestial", preco: 26285 },
  { id: "distancia_besta_ancestral_13", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [759,835], raridade: "☀️ Solar", preco: 43350 },
  { id: "distancia_besta_ancestral_14", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [844,977], raridade: "🌊 Abissal Marinha", preco: 65169 },
  { id: "distancia_besta_ancestral_15", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [1058,1133], raridade: "❄️ Glacial Eterna", preco: 80320 },
  { id: "distancia_besta_ancestral_16", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [1173,1344], raridade: "🔥 Infernal", preco: 112910 },
  { id: "distancia_besta_ancestral_17", nome: "🏹 Besta Ancestral", tipo: "distancia", dano: [1406,1497], raridade: "⚡ Relâmpago Divino", preco: 148338 },
  { id: "magica_cetro_arcano_0", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [5,13], raridade: "⬜ Comum", preco: 38 },
  { id: "magica_cetro_arcano_1", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [13,19], raridade: "🟫 Inferior", preco: 132 },
  { id: "magica_cetro_arcano_2", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [25,30], raridade: "🟩 Incomum", preco: 186 },
  { id: "magica_cetro_arcano_3", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [31,41], raridade: "🟦 Raro", preco: 482 },
  { id: "magica_cetro_arcano_4", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [53,71], raridade: "🟪 Épico", preco: 817 },
  { id: "magica_cetro_arcano_5", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [84,105], raridade: "🟨 Lendário", preco: 1372 },
  { id: "magica_cetro_arcano_6", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [108,131], raridade: "🔶 Ancestral", preco: 1686 },
  { id: "magica_cetro_arcano_7", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [147,173], raridade: "🔷 Arcana", preco: 2955 },
  { id: "magica_cetro_arcano_8", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [184,228], raridade: "🔴 Primordial", preco: 6048 },
  { id: "magica_cetro_arcano_9", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [246,316], raridade: "🟠 Abissal", preco: 8591 },
  { id: "magica_cetro_arcano_10", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [352,408], raridade: "⚫ Sombria", preco: 13028 },
  { id: "magica_cetro_arcano_11", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [409,476], raridade: "🌑 Amaldiçoada", preco: 17889 },
  { id: "magica_cetro_arcano_12", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [570,617], raridade: "🌟 Celestial", preco: 32722 },
  { id: "magica_cetro_arcano_13", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [655,767], raridade: "☀️ Solar", preco: 46068 },
  { id: "magica_cetro_arcano_14", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [764,905], raridade: "🌊 Abissal Marinha", preco: 48918 },
  { id: "magica_cetro_arcano_15", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [936,1044], raridade: "❄️ Glacial Eterna", preco: 71377 },
  { id: "magica_cetro_arcano_16", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [1160,1235], raridade: "🔥 Infernal", preco: 101026 },
  { id: "magica_cetro_arcano_17", nome: "🪄 Cetro Arcano", tipo: "magica", dano: [1262,1359], raridade: "⚡ Relâmpago Divino", preco: 148304 },
];

const ARMAS_PRIMORDIAIS = ARMAS.filter(a => a.raridade === '🔴 Primordial');
const ARMAS_RARAS_DROP = ARMAS.filter(a => a.exclusiva && !a.dono);

// ── ARMADURAS (compráveis na loja) ────────────────────────
// Item 3 do relatório: dá defesa extra e deixa classes com pouca
// resistência (mago, curandeiro, etc.) mais viáveis no longo prazo.
const ARMADURAS = [
  { id: 'armadura_pano', nome: '👕 Roupas de Pano', tipo: 'leve', defesa: 4, raridade: '⬜ Comum', preco: 40 },
  { id: 'armadura_couro', nome: '🥋 Armadura de Couro', tipo: 'leve', defesa: 9, raridade: '⬜ Comum', preco: 90 },
  { id: 'armadura_couro_reforcado', nome: '🥋 Couro Reforçado', tipo: 'leve', defesa: 15, raridade: '🟫 Inferior', preco: 180 },
  { id: 'armadura_malha', nome: '🔗 Armadura de Malha', tipo: 'media', defesa: 22, raridade: '🟩 Incomum', preco: 320 },
  { id: 'armadura_ferro', nome: '🛡️ Armadura de Ferro', tipo: 'media', defesa: 32, raridade: '🟦 Raro', preco: 560 },
  { id: 'manto_arcano', nome: '🧥 Manto Arcano', tipo: 'leve', defesa: 28, raridade: '🟦 Raro', preco: 600 },
  { id: 'armadura_aco', nome: '🛡️ Armadura de Aço', tipo: 'pesada', defesa: 45, raridade: '🟪 Épico', preco: 1100 },
  { id: 'armadura_placas', nome: '🛡️ Armadura de Placas', tipo: 'pesada', defesa: 60, raridade: '🟪 Épico', preco: 1800 },
  { id: 'armadura_espectral', nome: '👻 Armadura Espectral', tipo: 'media', defesa: 55, raridade: '🟨 Lendário', preco: 3200 },
  { id: 'armadura_draconica', nome: '🐉 Armadura Dracônica', tipo: 'pesada', defesa: 90, raridade: '🔴 Primordial', preco: 6000 },
  { id: 'armadura_abissal', nome: '🌊 Armadura Abissal', tipo: 'pesada', defesa: 115, raridade: '🟠 Abissal', preco: 12000 },
  { id: 'manto_sombrio', nome: '⚫ Manto Sombrio', tipo: 'leve', defesa: 105, raridade: '⚫ Sombria', preco: 13000 },
  { id: 'armadura_celestial', nome: '🌟 Armadura Celestial', tipo: 'media', defesa: 130, raridade: '🌟 Celestial', preco: 18000 },
  { id: 'armadura_solar', nome: '☀️ Armadura Solar', tipo: 'pesada', defesa: 145, raridade: '☀️ Solar', preco: 24000 },
  { id: 'armadura_infernal', nome: '🔥 Armadura Infernal', tipo: 'pesada', defesa: 160, raridade: '🔥 Infernal', preco: 32000 },
// ARMADURA ÉLFICA (leve)
  { id: "armadura_elfica_0", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 5, raridade: "⬜ Comum", preco: 45 },
  { id: "armadura_elfica_1", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 6, raridade: "🟫 Inferior", preco: 72 },
  { id: "armadura_elfica_2", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 8, raridade: "🟩 Incomum", preco: 115 },
  { id: "armadura_elfica_3", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 9, raridade: "🟦 Raro", preco: 184 },
  { id: "armadura_elfica_4", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 12, raridade: "🟪 Épico", preco: 295 },
  { id: "armadura_elfica_5", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 14, raridade: "🟨 Lendário", preco: 472 },
  { id: "armadura_elfica_6", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 18, raridade: "🔶 Ancestral", preco: 755 },
  { id: "armadura_elfica_7", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 22, raridade: "🔷 Arcana", preco: 1208 },
  { id: "armadura_elfica_8", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 27, raridade: "🔴 Primordial", preco: 1933 },
  { id: "armadura_elfica_9", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 33, raridade: "🟠 Abissal", preco: 3092 },
  { id: "armadura_elfica_10", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 41, raridade: "⚫ Sombria", preco: 4948 },
  { id: "armadura_elfica_11", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 51, raridade: "🌑 Amaldiçoada", preco: 7916 },
  { id: "armadura_elfica_12", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 63, raridade: "🌟 Celestial", preco: 12666 },
  { id: "armadura_elfica_13", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 78, raridade: "☀️ Solar", preco: 20266 },
  { id: "armadura_elfica_14", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 96, raridade: "🌊 Abissal Marinha", preco: 32426 },
  { id: "armadura_elfica_15", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 119, raridade: "❄️ Glacial Eterna", preco: 51881 },
  { id: "armadura_elfica_16", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 146, raridade: "🔥 Infernal", preco: 83010 },
  { id: "armadura_elfica_17", nome: "🍃 Armadura Élfica", tipo: "leve", defesa: 181, raridade: "⚡ Relâmpago Divino", preco: 132817 },

// ARMADURA DE TITÃ (pesada)
  { id: "armadura_titan_0", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 8, raridade: "⬜ Comum", preco: 70 },
  { id: "armadura_titan_1", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 10, raridade: "🟫 Inferior", preco: 113 },
  { id: "armadura_titan_2", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 12, raridade: "🟩 Incomum", preco: 184 },
  { id: "armadura_titan_3", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 15, raridade: "🟦 Raro", preco: 298 },
  { id: "armadura_titan_4", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 19, raridade: "🟪 Épico", preco: 482 },
  { id: "armadura_titan_5", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 24, raridade: "🟨 Lendário", preco: 781 },
  { id: "armadura_titan_6", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 30, raridade: "🔶 Ancestral", preco: 1265 },
  { id: "armadura_titan_7", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 37, raridade: "🔷 Arcana", preco: 2050 },
  { id: "armadura_titan_8", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 46, raridade: "🔴 Primordial", preco: 3321 },
  { id: "armadura_titan_9", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 57, raridade: "🟠 Abissal", preco: 5379 },
  { id: "armadura_titan_10", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 72, raridade: "⚫ Sombria", preco: 8715 },
  { id: "armadura_titan_11", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 89, raridade: "🌑 Amaldiçoada", preco: 14118 },
  { id: "armadura_titan_12", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 111, raridade: "🌟 Celestial", preco: 22871 },
  { id: "armadura_titan_13", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 138, raridade: "☀️ Solar", preco: 37050 },
  { id: "armadura_titan_14", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 172, raridade: "🌊 Abissal Marinha", preco: 60022 },
  { id: "armadura_titan_15", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 214, raridade: "❄️ Glacial Eterna", preco: 97235 },
  { id: "armadura_titan_16", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 267, raridade: "🔥 Infernal", preco: 157521 },
  { id: "armadura_titan_17", nome: "🗿 Armadura de Titã", tipo: "pesada", defesa: 332, raridade: "⚡ Relâmpago Divino", preco: 255184 },
];

// ── RARIDADES DE PETS (100) ───────────────────────────────
const RARIDADES_PETS = [
  { id: 1, nome: '⬜ Comum', emoji: '⬜', chance: 40, dano_mult: 1.0, hp_mult: 1.0 },
  { id: 2, nome: '🟫 Inferior', emoji: '🟫', chance: 35, dano_mult: 1.1, hp_mult: 1.1 },
  { id: 3, nome: '🟩 Incomum', emoji: '🟩', chance: 30, dano_mult: 1.2, hp_mult: 1.2 },
  { id: 4, nome: '🟦 Raro', emoji: '🟦', chance: 25, dano_mult: 1.4, hp_mult: 1.4 },
  { id: 5, nome: '🟪 Épico', emoji: '🟪', chance: 20, dano_mult: 1.6, hp_mult: 1.6 },
  { id: 6, nome: '🟨 Lendário', emoji: '🟨', chance: 15, dano_mult: 2.0, hp_mult: 2.0 },
  { id: 7, nome: '🔶 Ancestral', emoji: '🔶', chance: 10, dano_mult: 2.5, hp_mult: 2.5 },
  { id: 8, nome: '🔷 Arcano', emoji: '🔷', chance: 8, dano_mult: 3.0, hp_mult: 3.0 },
  { id: 9, nome: '🔴 Primordial', emoji: '🔴', chance: 5, dano_mult: 4.0, hp_mult: 4.0 },
  { id: 10, nome: '🟠 Abissal', emoji: '🟠', chance: 3, dano_mult: 5.0, hp_mult: 5.0 },
];

// ── PETS DISPONÍVEIS ─────────────────────────────────────
const PETS = [
  // Comuns
  { id: 'lobo_cinza', nome: '🐺 Lobo Cinza', raridade: '⬜ Comum', hp: 100, dano: [10,20], habilidade: 'Mordida', descricao: 'Um lobo comum mas leal.' },
  { id: 'gato_negro', nome: '🐱 Gato Negro', raridade: '⬜ Comum', hp: 80, dano: [8,16], habilidade: 'Arranhão', descricao: 'Pequeno mas veloz.' },
  { id: 'aguia_pequena', nome: '🦅 Águia Pequena', raridade: '⬜ Comum', hp: 70, dano: [9,18], habilidade: 'Mergulho', descricao: 'Voa alto e ataca com garras.' },
  { id: 'cobra_verde', nome: '🐍 Cobra Verde', raridade: '⬜ Comum', hp: 60, dano: [7,15], habilidade: 'Mordida Venenosa', descricao: 'Seu veneno enfraquece o inimigo.' },
  { id: 'urso_filhote', nome: '🐻 Urso Filhote', raridade: '⬜ Comum', hp: 150, dano: [12,22], habilidade: 'Abraço', descricao: 'Pequeno mas com força surpreendente.' },
  // Raros
  { id: 'lobo_fogo', nome: '🔥 Lobo de Fogo', raridade: '🟦 Raro', hp: 300, dano: [40,70], habilidade: 'Sopro de Chamas', descricao: 'Suas pegadas deixam chamas.' },
  { id: 'falcao_trovao', nome: '⚡ Falcão do Trovão', raridade: '🟦 Raro', hp: 280, dano: [38,68], habilidade: 'Mergulho Elétrico', descricao: 'Atinge com velocidade de raio.' },
  { id: 'tigre_sombra', nome: '🌑 Tigre das Sombras', raridade: '🟦 Raro', hp: 320, dano: [42,75], habilidade: 'Salto Sombrio', descricao: 'Desaparece nas sombras antes de atacar.' },
  // Épicos
  { id: 'fenix_menor', nome: '🦅 Fênix Menor', raridade: '🟪 Épico', hp: 500, dano: [80,130], habilidade: 'Renascimento', descricao: 'Renasce das cinzas uma vez por batalha.' },
  { id: 'dragao_gelo', nome: '❄️ Dragão de Gelo', raridade: '🟪 Épico', hp: 600, dano: [90,150], habilidade: 'Sopro Glacial', descricao: 'Congela inimigos com seu sopro.' },
  { id: 'golem_arcano', nome: '🔷 Golem Arcano', raridade: '🟪 Épico', hp: 700, dano: [85,140], habilidade: 'Escudo Arcano', descricao: 'Protege o dono com magia pura.' },
  // Lendários
  { id: 'veldora', nome: '🐉 Veldora Tempest', raridade: '🟨 Lendário', hp: 2000, dano: [300,500], habilidade: 'Rugido do Caos', descricao: 'O dragão do tempest. Lendário entre lendários.', especial: true },
  { id: 'fenix_lendaria', nome: '🔥 Fênix Lendária', raridade: '🟨 Lendário', hp: 1800, dano: [280,480], habilidade: 'Chama Eterna', descricao: 'Suas chamas nunca se apagam.' },
  { id: 'leviatа', nome: '🌊 Leviatã', raridade: '🟨 Lendário', hp: 2200, dano: [320,540], habilidade: 'Maré Destruidora', descricao: 'Senhor dos oceanos.' },
  // Primordiais
  { id: 'dragao_primordial', nome: '🌟 Dragão Primordial', raridade: '🔴 Primordial', hp: 5000, dano: [800,1200], habilidade: 'Extinção', descricao: 'Existia antes do mundo.' },
];

// ── OVOS DE PETS ─────────────────────────────────────────
const OVOS = [
  { id: 'ovo_comum', nome: '🥚 Ovo Comum', preco: 500, raridade_base: '⬜ Comum', chance_raro: 10, descricao: 'Um ovo simples. O que nascerá?' },
  { id: 'ovo_inferior', nome: '🥚 Ovo Rachado', preco: 900, raridade_base: '🟫 Inferior', chance_raro: 16, descricao: 'Tem uma rachadura estranha, mas parece estável.' },
  { id: 'ovo_incomum', nome: '🥚 Ovo Manchado', preco: 1400, raridade_base: '🟩 Incomum', chance_raro: 22, descricao: 'Manchas incomuns cobrem a casca.' },
  { id: 'ovo_raro', nome: '🥚 Ovo Raro', preco: 2000, raridade_base: '🟦 Raro', chance_raro: 30, descricao: 'Brilha levemente. Algo especial está dentro.' },
  { id: 'ovo_epico', nome: '🥚 Ovo Épico', preco: 8000, raridade_base: '🟪 Épico', chance_raro: 60, descricao: 'Pulsa com energia mágica.' },
  { id: 'ovo_ancestral', nome: '🥚 Ovo Ancestral', preco: 15000, raridade_base: '🔶 Ancestral', chance_raro: 70, descricao: 'Coberto por runas de uma era esquecida.' },
  { id: 'ovo_arcano', nome: '🥚 Ovo Arcano', preco: 22000, raridade_base: '🔷 Arcano', chance_raro: 78, descricao: 'Flutua sozinho, envolto em magia pura.' },
  { id: 'ovo_lendario', nome: '🥚 Ovo Lendário', preco: 30000, raridade_base: '🟨 Lendário', chance_raro: 85, descricao: 'Extremamente raro. O que está dentro é lendário.' },
  { id: 'ovo_dragao', nome: '🥚 Ovo de Dragão', preco: 100000, raridade_base: '🔴 Primordial', chance_raro: 100, descricao: 'Um ovo de dragão verdadeiro. Impossível de encontrar.' },
  { id: 'ovo_abissal', nome: '🥚 Ovo do Abismo', preco: 250000, raridade_base: '🟠 Abissal', chance_raro: 100, descricao: 'Vindo das profundezas mais escuras. Nem os deuses sabem o que vive lá.' },
];

// ── ANIMAIS MITOLÓGICOS PARA ADOTAR ─────────────────────
// Cada animal é ÚNICO no servidor — apenas 1 jogador pode ter cada criatura!
const ANIMAIS = [
  {
    id: 'dragao_jovem', nome: '🐉 Dragão Jovem', preco: 15000, unico: true,
    descricao: 'Uma cria de dragão ancestral. Seus olhos guardam sabedoria milenar.',
    lore: 'Nascido das cinzas do Grande Dragão Vermelho, este filhote já carrega o peso de eras em seu olhar de brasa.'
  },
  {
    id: 'unicornio', nome: '🦄 Unicórnio', preco: 12000, unico: true,
    descricao: 'A criatura mais pura do IMPERIUS. Seu chifre cura qualquer veneno.',
    lore: 'Dizem que quem monta um Unicórnio nunca adoece. Sua presença afasta o mal e purifica a alma.'
  },
  {
    id: 'grifo', nome: '🦅 Grifo', preco: 18000, unico: true,
    descricao: 'Metade águia, metade leão. Símbolo de força e majestade.',
    lore: 'Os Grifos escolhem seus donos, nunca o contrário. Se um Grifo te aceita, és digno de reis.'
  },
  {
    id: 'fenrir', nome: '🐺 Fenrir', preco: 20000, unico: true,
    descricao: 'O lobo mítico que abalou os próprios deuses. Sua mordida atravessa qualquer armadura.',
    lore: 'Na era dos primeiros deuses, Fenrir foi acorrentado por temer seu poder. Agora é seu companheiro.'
  },
  {
    id: 'quimera', nome: '🦁 Quimera', preco: 25000, unico: true,
    descricao: 'Corpo de leão, cabeça de cabra, cauda de serpente. Terror de mundos antigos.',
    lore: 'Criada pelos deuses como teste para os heróis. Apenas os mais corajosos ousam domesticá-la.'
  },
  {
    id: 'kitsune', nome: '🦊 Kitsune', preco: 10000, unico: true,
    descricao: 'A raposa de nove caudas. Manipula ilusões e engana até os mais sábios.',
    lore: 'A cada século que vive, ganha uma nova cauda. Com nove caudas, torna-se imbatível em astúcia.'
  },
  {
    id: 'basilisco', nome: '🐍 Basilisco', preco: 22000, unico: true,
    descricao: 'O rei das serpentes. Seu olhar petrifica inimigos.',
    lore: 'Nascido do ovo de um galo chocado por uma serpente. Sua existência desafia a própria natureza.'
  },
  {
    id: 'simurgh', nome: '🦅 Simurgh', preco: 30000, unico: true,
    descricao: 'O pássaro persa imortal. Viveu três eras do mundo e conhece todos os segredos.',
    lore: 'O Simurgh pousa no topo da Árvore do Conhecimento. Sua pena cura qualquer ferida.'
  },
  {
    id: 'urso_espiritual', nome: '🐻 Urso Espiritual', preco: 8000, unico: true,
    descricao: 'Um urso entre dois mundos — o material e o espiritual. Protege contra maldições.',
    lore: 'Os xamãs antigos invocavam o Urso Espiritual para proteger aldeias inteiras de espíritos malignos.'
  },
  {
    id: 'fenix_jovem', nome: '🔥 Fênix Jovem', preco: 35000, unico: true,
    descricao: 'Renasce das próprias cinzas. Símbolo eterno de morte e renascimento.',
    lore: 'A Fênix nunca morre de verdade. A cada morte, renasce mais forte. Ter uma é ter a eternidade.'
  },
  {
    id: 'hidra', nome: '🐉 Hidra', preco: 28000, unico: true,
    descricao: 'Sete cabeças que regeneram quando cortadas. Impossível de derrotar — mas você a conquistou.',
    lore: 'Heróis tentaram matar a Hidra por eras. Você foi o único a entender: não se mata a Hidra, se a conquista.'
  },
  {
    id: 'cerbero', nome: '🐕 Cérbero', preco: 45000, unico: true,
    descricao: 'O guardião do mundo dos mortos. Três cabeças, cada uma com poder diferente.',
    lore: 'Apenas os mais dignos conseguem trazer Cérbero ao mundo dos vivos. Sua presença aterroriza qualquer inimigo.'
  },
];

// ── ITENS DA LOJA ─────────────────────────────────────────
const ITENS_LOJA = [
  { id: 'pocao_hp_p', nome: '🧪 Poção de HP (P)', preco: 50, efeito: 'curar', valor: 30 },
  { id: 'pocao_hp_m', nome: '🧪 Poção de HP (M)', preco: 120, efeito: 'curar', valor: 70 },
  { id: 'pocao_hp_g', nome: '🧪 Poção de HP (G)', preco: 280, efeito: 'curar', valor: 150 },
  { id: 'pocao_hp_maxima', nome: '🧪 Poção de HP Máxima', preco: 800, efeito: 'curar_total', valor: 9999 },
  { id: 'pocao_mana_p', nome: '💧 Poção de Mana (P)', preco: 60, efeito: 'mana', valor: 30 },
  { id: 'pocao_mana_g', nome: '💧 Poção de Mana (G)', preco: 200, efeito: 'mana', valor: 100 },
  { id: 'antidoto', nome: '🩹 Antídoto', preco: 80, efeito: 'curar_sangramento' },
  { id: 'purificador', nome: '✨ Purificador', preco: 200, efeito: 'purificar' },
  { id: 'elixir_forca', nome: '💪 Elixir de Força', preco: 500, efeito: 'buff_for', valor: 10, duracao: 3 },
  { id: 'pedra_ressurreicao', nome: '💎 Pedra de Ressurreição', preco: 2000, efeito: 'ressurreicao' },
  { id: 'pocao_xp', nome: '📚 Poção de XP', preco: 800, efeito: 'xp', valor: 500 },
  { id: 'amuleto_sorte', nome: '🍀 Amuleto da Sorte', preco: 1500, efeito: 'buff_sorte', valor: 20, duracao: 5 },
  { id: 'pergaminho_teletransporte', nome: '📜 Pergaminho de Teletransporte', preco: 300, efeito: 'teletransporte' },
  { id: 'pocao_mundos', nome: '🌍 Poção dos Mundos', preco: 0, efeito: 'dano_deus', valor: 99999, exclusiva: true, descricao: 'Capaz de chamar a atenção de um Deus.' },
  { id: 'elixir_nivel', nome: '⭐ Elixir de Nível', preco: 5000, efeito: 'nivel_up', valor: 1 },
  { id: 'pocao_mana_total', nome: '💧 Poção de Mana Total', preco: 600, efeito: 'mana_total', valor: 9999 },

  // ── COMIDA ────────────────────────────────────────────
  { id: 'carne_crua', nome: '🥩 Carne Crua', preco: 30, efeito: 'curar', valor: 20 },
  { id: 'carne_fresca', nome: '🥩 Carne Fresca', preco: 60, efeito: 'curar', valor: 45 },
  { id: 'carne_assada', nome: '🥩 Carne Assada', preco: 80, efeito: 'curar', valor: 65 },
  { id: 'carne_rara', nome: '🥩 Carne Rara', preco: 150, efeito: 'curar', valor: 130 },
  { id: 'carne_dragao', nome: '🥩 Carne de Dragão', preco: 400, efeito: 'curar', valor: 350 },
  { id: 'carne_sagrada', nome: '🥩 Carne Sagrada', preco: 600, efeito: 'curar_total', valor: 9999 },
  { id: 'mel_simples', nome: '🍯 Mel Simples', preco: 50, efeito: 'mana', valor: 35 },
  { id: 'mel_dourado', nome: '🍯 Mel Dourado', preco: 500, efeito: 'mana', valor: 400 },
  { id: 'mel_sagrado', nome: '🍯 Mel Sagrado', preco: 700, efeito: 'mana_total', valor: 9999 },
  { id: 'nectar_deuses', nome: '🌟 Néctar dos Deuses', preco: 900, efeito: 'curar_total', valor: 9999 },
  { id: 'ambrosia', nome: '✨ Ambrosia', preco: 1200, efeito: 'xp', valor: 800 },
  { id: 'erva_bosque', nome: '🌿 Erva do Bosque', preco: 40, efeito: 'curar_sangramento' },
  { id: 'erva_ancestral', nome: '🌿 Erva Ancestral', preco: 120, efeito: 'curar', valor: 100 },
  { id: 'raiz_ancestral', nome: '🌱 Raiz Ancestral', preco: 200, efeito: 'mana', valor: 160 },
  { id: 'essencia_magica', nome: '✨ Essência Mágica', preco: 500, efeito: 'mana', valor: 420 },
  { id: 'essencia_primordial', nome: '✨ Essência Primordial', preco: 1000, efeito: 'xp', valor: 700 },
  { id: 'baga_espiritual', nome: '🫐 Baga Espiritual', preco: 80, efeito: 'curar', valor: 65 },
  { id: 'figo_sagrado', nome: '🍑 Figo Sagrado', preco: 500, efeito: 'curar', valor: 420 },
  { id: 'roma_hades', nome: '🍎 Romã do Hades', preco: 700, efeito: 'xp', valor: 500 },
  { id: 'maca_dourada', nome: '🍎 Maçã Dourada', preco: 1000, efeito: 'xp', valor: 750 },
  { id: 'fruto_imortalidade', nome: '🌟 Fruto da Imortalidade', preco: 1500, efeito: 'ressurreicao' },
  { id: 'alga_abissal', nome: '🌊 Alga Abissal', preco: 150, efeito: 'curar', valor: 120 },
  { id: 'coral_sagrado', nome: '🪸 Coral Sagrado', preco: 250, efeito: 'mana', valor: 200 },
  { id: 'peixe_espectral', nome: '🐟 Peixe Espectral', preco: 180, efeito: 'curar', valor: 150 },
  { id: 'escama_leviata', nome: '🐍 Escama de Leviatã', preco: 700, efeito: 'mana_total', valor: 9999 },
  { id: 'pedra_luz', nome: '💎 Pedra de Luz', preco: 100, efeito: 'curar', valor: 80 },
  { id: 'cristal_gelo', nome: '🔷 Cristal de Gelo', preco: 200, efeito: 'mana', valor: 160 },
  { id: 'minerio_sagrado', nome: '⭐ Minério Sagrado', preco: 450, efeito: 'curar', valor: 380 },
];

// ── CONQUISTAS ────────────────────────────────────────────
const CONQUISTAS = {
  comprador: { nome: '🛍️ Comprador', desc: 'Fez sua primeira compra na loja' },
  primeiro_sangue: { nome: '🩸 Primeiro Sangue', desc: 'Venceu sua primeira batalha' },
  matador: { nome: '⚔️ Matador', desc: 'Matou 10 monstros' },
  cacador_exp: { nome: '🏹 Caçador Experiente', desc: 'Matou 50 monstros' },
  ceifador: { nome: '☠️ Ceifador', desc: 'Matou 200 monstros' },
  lenda_viva: { nome: '✨ Lenda Viva', desc: 'Matou 1000 monstros' },
  critico_perfeito: { nome: '🎯 Crítico Perfeito', desc: 'Tirou 20 no D20' },
  primeira_morte: { nome: '💀 A Primeira Queda', desc: 'Morreu pela primeira vez' },
  imortal: { nome: '♾️ Imortal', desc: 'Morreu 20 vezes e voltou' },
  rico: { nome: '💰 Rico', desc: 'Acumulou 1000 moedas' },
  milionario: { nome: '💎 Milionário', desc: 'Acumulou 10000 moedas' },
  iniciado_boss: { nome: '🏆 Caçador de Bosses', desc: 'Matou um boss' },
  mestre_bosses: { nome: '👑 Mestre dos Bosses', desc: 'Matou todos os bosses' },
  matador_dragao: { nome: '🐉 Matador de Dragão', desc: 'Matou Vyraxis o Dragão da Vida' },
  viajante: { nome: '🗺️ Grande Viajante', desc: 'Visitou todas as regiões' },
  livre: { nome: '🔓 Livre', desc: 'Se libertou das correntes' },
  deicida: { nome: '⚡ Deicida', desc: 'Participou de uma batalha contra o Deus' },
  imperador: { nome: '👑 Imperador', desc: 'Atingiu o nível máximo — 200' },
  sobrevivente_caos: { nome: '🌀 Sobrevivente do Caos', desc: 'Sobreviveu à Torre do Caos' },
  roleta_rara: { nome: '🎰 Agraciado pelo Destino', desc: 'Conseguiu uma classe rara na roleta' },
  sacrificado: { nome: '🩸 Sangue Oferecido', desc: 'Fez um sacrifício ao Deus' },
  servo_liberto: { nome: '⛓️ Servo Liberto', desc: 'Se libertou do controle Necromante' },
  primeiro_pet: { nome: '🐾 Domador', desc: 'Adotou seu primeiro pet' },
  pet_lendario: { nome: '🐉 Mestre dos Pets', desc: 'Conseguiu um pet Lendário' },
  primeiro_animal: { nome: '🦁 Fazendeiro', desc: 'Adotou seu primeiro animal' },
  primeiro_ovo: { nome: '🥚 Colecionador', desc: 'Chocou seu primeiro ovo' },
  maior_dano_deus: { nome: '💥 Campeão do Evento', desc: 'Causou mais dano ao Deus em um evento' },
};

// ── TÍTULOS ───────────────────────────────────────────────
const TITULOS = {
  matador_dragao: '🐉 Matador de Dragão',
  livre: '🔓 O Livre',
  perdedor: '😔 O Eterno Perdedor',
  mais_fraco: '💪 O Mais Fraco',
  deicida: '⚡ Deicida',
  agraciado: '🎰 Agraciado pelo Destino',
  servo: '⛓️ O Servo',
  encarnado: '🌟 O Encarnado',
  sacrificador: '🩸 O Sacrificador',
  sobrevivente: '💀 O Sobrevivente',
  imperador: '👑 Imperador',
  mestre_pets: '🐾 Mestre dos Pets',
  campeao_evento: '💥 Campeão do Evento Divino',
  domador: '🦁 Domador de Feras',
};

// ── HP/DANO DE MONSTROS POR TIER ──────────────────────────
const MONSTROS_HP = {
  1: [30, 60],   2: [60, 120],   3: [120, 220],
  4: [220, 380], 5: [380, 600],  6: [600, 950],
  7: [950, 1500]
};

const MONSTROS_DANO = {
  1: [5, 15],   2: [12, 28],   3: [25, 50],
  4: [45, 85],  5: [80, 130],  6: [120, 190],
  7: [180, 280]
};

// ── MASMORRAS ─────────────────────────────────────────────
const MASMORRAS = [
  {
    id: 'caverna_perdida', nome: '🕳️ Caverna Perdida', nivel_min: 5,
    andares: 3, descricao: 'Uma caverna esquecida com tesouros e perigos.',
    recompensa: { xp: 500, moedas: [200,400], chance_item: 50 }
  },
  {
    id: 'torre_esqueletos', nome: '💀 Torre dos Esqueletos', nivel_min: 20,
    andares: 5, descricao: 'Uma torre habitada por mortos-vivos.',
    recompensa: { xp: 1200, moedas: [500,900], chance_item: 65 }
  },
  {
    id: 'labirinto_espelhos', nome: '🪞 Labirinto dos Espelhos', nivel_min: 40,
    andares: 7, descricao: 'Um labirinto onde suas ilusões te atacam.',
    recompensa: { xp: 2500, moedas: [1000,2000], chance_item: 75 }
  },
  {
    id: 'abismo_infinito', nome: '🌀 Abismo Infinito', nivel_min: 80,
    andares: 10, descricao: 'Uma masmorra sem fim. Apenas os mais fortes sobrevivem.',
    recompensa: { xp: 8000, moedas: [3000,6000], chance_item: 90 }
  },
];

// ── HABILIDADES EXCLUSIVAS DE ARMA ──────────────────────────
// Estrutura: HABILIDADES_ARMA_EXCLUSIVA[id_da_arma] = { habilidades: {...}, suprema: {...} }
// Nenhuma arma tem técnica cadastrada ainda — é aqui que futuras técnicas exclusivas
// de armas específicas devem ser adicionadas.
const HABILIDADES_ARMA_EXCLUSIVA = {};

module.exports = {
  CLASSES, CLASSES_NORMAIS, CLASSES_RARAS,
  REGIOES, ARMAS, ARMAS_PRIMORDIAIS, ARMAS_RARAS_DROP, ARMADURAS,
  ITENS_LOJA, CONQUISTAS, TITULOS, RANKS,
  MONSTROS_HP, MONSTROS_DANO,
  NIVEIS, calcularNivel,
  PETS, OVOS, ANIMAIS, RARIDADES_PETS,
  MASMORRAS, HABILIDADES_ARMA_EXCLUSIVA
};
