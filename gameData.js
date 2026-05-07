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
  valdris: {
    nome: '🏰 Valdris (Capital)', nivel_min: 1, nivel_max: 10,
    descricao: 'A capital do IMPERIUS. Ponto de partida de todos os aventureiros.',
    monstros: [
      { nome: 'Rato Gigante', hp: [20,40], dano: [3,8], xp: [10,20], moedas: [5,10] },
      { nome: 'Bêbado Raivoso', hp: [30,50], dano: [5,12], xp: [15,25], moedas: [8,15] },
      { nome: 'Ladrão de Rua', hp: [35,55], dano: [6,14], xp: [18,30], moedas: [10,20] },
      { nome: 'Cão Selvagem', hp: [25,45], dano: [4,10], xp: [12,22], moedas: [6,12] },
      { nome: 'Goblin Bêbado', hp: [40,60], dano: [7,15], xp: [20,35], moedas: [12,22] },
      { nome: 'Guarda Corrompido', hp: [50,80], dano: [10,20], xp: [25,40], moedas: [15,28] },
    ],
    bosses: [
      {
        nome: '🗡️ Capitão dos Guardas Corrompidos',
        hp: 500, dano: [20,35], xp: 200, moedas: [100,200],
        drop: 'Espada do Capitão',
        fases: [
          { nome: 'Fase 1 — Confiante', hp_pct: 100, dano_mult: 1.0, msg: 'O Capitão ri de você. "Mais um idiota."' },
          { nome: 'Fase 2 — Furioso', hp_pct: 50, dano_mult: 1.5, msg: '⚠️ O Capitão perde a paciência! Dano aumentado!' },
          { nome: 'Fase 3 — Desesperado', hp_pct: 20, dano_mult: 2.0, msg: '🔥 O Capitão entra em frenesi! PERIGO!' }
        ]
      },
      {
        nome: '🧙 Mago Negro de Valdris',
        hp: 800, dano: [25,45], xp: 350, moedas: [150,300],
        drop: 'Tomo do Mago Negro',
        fases: [
          { nome: 'Fase 1 — Calculando', hp_pct: 100, dano_mult: 1.0, msg: 'O Mago analisa seus pontos fracos...' },
          { nome: 'Fase 2 — Conjurando', hp_pct: 60, dano_mult: 1.6, msg: '⚠️ O Mago invoca escudos arcanos!' },
          { nome: 'Fase 3 — Apocalipse', hp_pct: 25, dano_mult: 2.2, msg: '💥 O Mago canaliza toda sua magia!' }
        ]
      },
      {
        nome: '👑 Senhor das Sombras de Valdris',
        hp: 1200, dano: [35,60], xp: 600, moedas: [300,500],
        drop: 'Coroa das Sombras',
        drop_arma: true,
        fases: [
          { nome: 'Fase 1 — Soberano', hp_pct: 100, dano_mult: 1.0, msg: 'O Senhor das Sombras ergue sua coroa.' },
          { nome: 'Fase 2 — Irado', hp_pct: 55, dano_mult: 1.7, msg: '⚠️ As sombras se intensificam ao redor!' },
          { nome: 'Fase 3 — Forma Sombria', hp_pct: 20, dano_mult: 2.5, msg: '🌑 O Senhor assume sua verdadeira forma!' }
        ]
      }
    ],
    clima: 'normal'
  },
  floresta_eryndal: {
    nome: '🌲 Floresta de Eryndal', nivel_min: 5, nivel_max: 20,
    descricao: 'Uma floresta ancestral onde criaturas selvagens dominam.',
    monstros: [
      { nome: 'Lobo das Sombras', hp: [60,100], dano: [12,25], xp: [40,70], moedas: [20,40] },
      { nome: 'Aranha Venenosa', hp: [50,90], dano: [10,22], xp: [35,65], moedas: [18,35] },
      { nome: 'Goblin Arqueiro', hp: [55,95], dano: [11,24], xp: [38,68], moedas: [19,38] },
      { nome: 'Troll da Floresta', hp: [80,130], dano: [15,30], xp: [50,85], moedas: [25,50] },
      { nome: 'Planta Carnívora', hp: [70,110], dano: [13,27], xp: [45,78], moedas: [22,45] },
      { nome: 'Duende Selvagem', hp: [45,80], dano: [9,20], xp: [32,60], moedas: [16,32] },
      { nome: 'Fada Corrompida', hp: [65,105], dano: [14,28], xp: [48,80], moedas: [24,48] },
    ],
    bosses: [
      {
        nome: '🐺 Alfa da Matilha Sombria',
        hp: 1500, dano: [40,70], xp: 500, moedas: [200,400],
        drop: 'Pele do Lobo Alfa',
        fases: [
          { nome: 'Fase 1 — Caçando', hp_pct: 100, dano_mult: 1.0, msg: 'O Alfa da Matilha uiva para seus filhos.' },
          { nome: 'Fase 2 — Raiva', hp_pct: 55, dano_mult: 1.6, msg: '⚠️ O Alfa convoca mais lobos!' },
          { nome: 'Fase 3 — Berserk', hp_pct: 20, dano_mult: 2.3, msg: '🔥 O Alfa entra em modo selvagem!' }
        ]
      },
      {
        nome: '🕷️ Rainha das Aranhas',
        hp: 2000, dano: [50,85], xp: 750, moedas: [300,550],
        drop: 'Veneno da Rainha',
        fases: [
          { nome: 'Fase 1 — Tecendo', hp_pct: 100, dano_mult: 1.0, msg: 'A Rainha tece teias ao seu redor...' },
          { nome: 'Fase 2 — Envenenando', hp_pct: 60, dano_mult: 1.7, msg: '⚠️ Veneno mortal é liberado!' },
          { nome: 'Fase 3 — Prole Infinita', hp_pct: 25, dano_mult: 2.0, msg: '🕷️ Centenas de filhotes invadem!' }
        ]
      },
      {
        nome: '🐉 Hydra de Eryndal',
        hp: 3500, dano: [65,110], xp: 1200, moedas: [500,900],
        drop: 'Escama da Hydra',
        drop_arma: true,
        fases: [
          { nome: 'Fase 1 — Três Cabeças', hp_pct: 100, dano_mult: 1.0, msg: 'A Hydra ataca com três cabeças!' },
          { nome: 'Fase 2 — Regeneração', hp_pct: 60, dano_mult: 1.5, msg: '⚠️ A Hydra regenera duas cabeças!' },
          { nome: 'Fase 3 — Sete Cabeças', hp_pct: 30, dano_mult: 2.0, msg: '💀 A Hydra tem SETE cabeças agora!' },
          { nome: 'Fase 4 — Fúria Final', hp_pct: 10, dano_mult: 3.0, msg: '🔥 A Hydra cospe veneno em área!' }
        ]
      }
    ],
    clima: 'nevoa'
  },
  bosque_sombras: {
    nome: '🌑 Bosque das Sombras', nivel_min: 15, nivel_max: 30,
    descricao: 'Um bosque onde a luz nunca penetra. Criaturas das trevas habitam aqui.',
    monstros: [
      { nome: 'Espectro Menor', hp: [100,160], dano: [20,40], xp: [60,100], moedas: [30,60] },
      { nome: 'Zumbi Antigo', hp: [120,180], dano: [22,44], xp: [65,110], moedas: [33,65] },
      { nome: 'Sombra Errante', hp: [90,150], dano: [18,38], xp: [55,95], moedas: [28,55] },
      { nome: 'Banshee', hp: [110,170], dano: [21,42], xp: [62,105], moedas: [31,62] },
      { nome: 'Cavaleiro Morto', hp: [140,200], dano: [25,50], xp: [75,120], moedas: [38,75] },
      { nome: 'Demônio Menor', hp: [130,190], dano: [24,48], xp: [72,115], moedas: [36,72] },
    ],
    bosses: [
      {
        nome: '💀 Espectro do General',
        hp: 3000, dano: [60,100], xp: 1000, moedas: [400,700],
        drop: 'Armadura Espectral',
        fases: [
          { nome: 'Fase 1 — Intangível', hp_pct: 100, dano_mult: 1.0, msg: 'O Espectro flutua, intocável.' },
          { nome: 'Fase 2 — Materializado', hp_pct: 50, dano_mult: 1.8, msg: '⚠️ O Espectro se materializa furioso!' },
          { nome: 'Fase 3 — Possessão', hp_pct: 20, dano_mult: 2.5, msg: '👻 O Espectro tenta possuir você!' }
        ]
      },
      {
        nome: '🧛 Vampiro Ancião das Trevas',
        hp: 4500, dano: [75,120], xp: 1500, moedas: [600,1000],
        drop: 'Capa do Vampiro Ancião',
        fases: [
          { nome: 'Fase 1 — Sedutor', hp_pct: 100, dano_mult: 1.0, msg: 'O Vampiro sorri. "Venha, mortal..."' },
          { nome: 'Fase 2 — Faminto', hp_pct: 55, dano_mult: 1.7, msg: '🩸 O Vampiro drena seu sangue!' },
          { nome: 'Fase 3 — Forma Morcego', hp_pct: 25, dano_mult: 2.3, msg: '🦇 Uma nuvem de morcegos ataca!' }
        ]
      },
      {
        nome: '👑 Rei das Sombras',
        hp: 7000, dano: [100,160], xp: 2500, moedas: [1000,1800],
        drop: 'Coroa das Trevas Eternas',
        drop_arma: true,
        fases: [
          { nome: 'Fase 1 — Soberania', hp_pct: 100, dano_mult: 1.0, msg: 'O Rei das Sombras emerge do escuro.' },
          { nome: 'Fase 2 — Tempestade Sombria', hp_pct: 60, dano_mult: 1.6, msg: '⚠️ Uma tempestade de trevas explode!' },
          { nome: 'Fase 3 — Exército Morto', hp_pct: 35, dano_mult: 2.0, msg: '💀 O Rei invoca seu exército!' },
          { nome: 'Fase 4 — Forma Divina das Trevas', hp_pct: 10, dano_mult: 3.2, msg: '🌑 O Rei assume sua forma divina!' }
        ]
      }
    ],
    clima: 'trevas'
  },
  mata_espiritos: {
    nome: '👻 Mata dos Espíritos', nivel_min: 20, nivel_max: 35,
    descricao: 'Almas perdidas vagam aqui pela eternidade.',
    monstros: [
      { nome: 'Espírito Errante', hp: [150,220], dano: [28,55], xp: [80,130], moedas: [40,80] },
      { nome: 'Fantasma Vingativo', hp: [160,240], dano: [30,60], xp: [85,140], moedas: [43,85] },
      { nome: 'Poltergeist', hp: [140,210], dano: [26,52], xp: [75,125], moedas: [38,75] },
      { nome: 'Alma Perdida', hp: [130,200], dano: [24,48], xp: [70,120], moedas: [35,70] },
      { nome: 'Demônio Menor', hp: [170,250], dano: [32,64], xp: [90,150], moedas: [45,90] },
      { nome: 'Wraith Ancião', hp: [180,260], dano: [34,68], xp: [95,160], moedas: [48,95] },
    ],
    bosses: [
      {
        nome: '👻 Banshee Rainha',
        hp: 4000, dano: [80,130], xp: 1400, moedas: [550,950],
        drop: 'Véu da Banshee',
        fases: [
          { nome: 'Fase 1 — Lamentando', hp_pct: 100, dano_mult: 1.0, msg: 'A Banshee chora. Você sente frio...' },
          { nome: 'Fase 2 — Gritando', hp_pct: 55, dano_mult: 1.7, msg: '⚠️ O grito da Banshee paralisa!' },
          { nome: 'Fase 3 — Possessão em Massa', hp_pct: 20, dano_mult: 2.4, msg: '💀 Almas tentam possuir você!' }
        ]
      },
      {
        nome: '🌀 Vórtice de Almas',
        hp: 6000, dano: [100,160], xp: 2000, moedas: [800,1400],
        drop: 'Essência do Vórtice',
        fases: [
          { nome: 'Fase 1 — Girando', hp_pct: 100, dano_mult: 1.0, msg: 'O Vórtice suga tudo ao redor.' },
          { nome: 'Fase 2 — Acelerando', hp_pct: 60, dano_mult: 1.8, msg: '⚠️ O Vórtice gira mais rápido!' },
          { nome: 'Fase 3 — Implosão', hp_pct: 25, dano_mult: 2.6, msg: '💥 O Vórtice implode violentamente!' }
        ]
      },
      {
        nome: '👑 Mãe dos Espíritos',
        hp: 9000, dano: [130,200], xp: 3000, moedas: [1200,2000],
        drop: 'Alma da Mãe',
        drop_arma: true,
        fases: [
          { nome: 'Fase 1 — Maternal', hp_pct: 100, dano_mult: 1.0, msg: 'A Mãe dos Espíritos olha para você com pena.' },
          { nome: 'Fase 2 — Protetora', hp_pct: 60, dano_mult: 1.7, msg: '⚠️ Ela chama todos os espíritos!' },
          { nome: 'Fase 3 — Ira Materna', hp_pct: 30, dano_mult: 2.3, msg: '👻 A fúria de uma mãe não tem limites!' },
          { nome: 'Fase 4 — Transcendência', hp_pct: 10, dano_mult: 3.5, msg: '✨ A Mãe transcende para além da morte!' }
        ]
      }
    ],
    clima: 'nevoa'
  },
  deserto_aresh: {
    nome: '🏜️ Deserto de Aresh', nivel_min: 30, nivel_max: 50,
    descricao: 'Um deserto sem fim onde o calor mata antes dos monstros.',
    monstros: [
      { nome: 'Escorpião Gigante', hp: [200,300], dano: [40,80], xp: [100,170], moedas: [50,100] },
      { nome: 'Múmia Guerreira', hp: [220,320], dano: [42,85], xp: [105,178], moedas: [53,105] },
      { nome: 'Djinn do Deserto', hp: [240,350], dano: [45,90], xp: [110,185], moedas: [55,110] },
      { nome: 'Elemental de Areia', hp: [180,280], dano: [38,75], xp: [95,160], moedas: [48,95] },
      { nome: 'Cobra Gigante', hp: [210,310], dano: [41,82], xp: [102,172], moedas: [51,102] },
      { nome: 'Ladrão do Deserto', hp: [190,290], dano: [39,78], xp: [98,165], moedas: [49,98] },
    ],
    bosses: [
      {
        nome: '🦂 Senhor dos Escorpiões',
        hp: 6000, dano: [100,160], xp: 2000, moedas: [800,1400],
        drop: 'Ferrão do Senhor',
        fases: [
          { nome: 'Fase 1 — Caçando', hp_pct: 100, dano_mult: 1.0, msg: 'O Senhor dos Escorpiões avança.' },
          { nome: 'Fase 2 — Veneno', hp_pct: 55, dano_mult: 1.8, msg: '☠️ Veneno mortal é injetado!' },
          { nome: 'Fase 3 — Prole', hp_pct: 20, dano_mult: 2.4, msg: '🦂 Centenas de escorpiões surgem!' }
        ]
      },
      {
        nome: '🧞 Grande Djinn de Aresh',
        hp: 8500, dano: [130,200], xp: 3000, moedas: [1200,2000],
        drop: 'Lamparina do Djinn',
        fases: [
          { nome: 'Fase 1 — Ilusão', hp_pct: 100, dano_mult: 1.0, msg: 'O Djinn cria ilusões para confundir.' },
          { nome: 'Fase 2 — Tempestade', hp_pct: 55, dano_mult: 1.7, msg: '🌪️ Tempestade de areia!' },
          { nome: 'Fase 3 — Poder Real', hp_pct: 25, dano_mult: 2.5, msg: '⚡ O Djinn mostra seu poder real!' }
        ]
      },
      {
        nome: '👑 Faraó Imortal',
        hp: 14000, dano: [180,280], xp: 5000, moedas: [2000,3500],
        drop: 'Amuleto do Faraó',
        drop_arma: true,
        fases: [
          { nome: 'Fase 1 — Soberano', hp_pct: 100, dano_mult: 1.0, msg: 'O Faraó ergue seu cajado dourado.' },
          { nome: 'Fase 2 — Maldição', hp_pct: 65, dano_mult: 1.6, msg: '⚠️ Uma maldição antiga te atinge!' },
          { nome: 'Fase 3 — Exército de Múmias', hp_pct: 40, dano_mult: 2.0, msg: '🧟 Múmias guerreiras surgem!' },
          { nome: 'Fase 4 — Transcendência Divina', hp_pct: 15, dano_mult: 3.0, msg: '☀️ O Faraó se torna um deus mortal!' }
        ]
      }
    ],
    clima: 'calor'
  },
  vulcao_ignareth: {
    nome: '🌋 Vulcão de Ignareth', nivel_min: 55, nivel_max: 75,
    descricao: 'O vulcão mais ativo do IMPERIUS. Elementais de fogo dominam aqui.',
    monstros: [
      { nome: 'Elemental de Fogo', hp: [400,600], dano: [80,150], xp: [200,340], moedas: [100,200] },
      { nome: 'Salamandra Gigante', hp: [380,580], dano: [76,144], xp: [192,325], moedas: [96,192] },
      { nome: 'Demônio do Fogo', hp: [420,630], dano: [84,158], xp: [210,357], moedas: [105,210] },
      { nome: 'Golem de Lava', hp: [500,750], dano: [100,188], xp: [250,425], moedas: [125,250] },
      { nome: 'Fênix Menor', hp: [360,540], dano: [72,136], xp: [180,306], moedas: [90,180] },
      { nome: 'Drake de Chamas', hp: [440,660], dano: [88,165], xp: [220,374], moedas: [110,220] },
    ],
    bosses: [
      {
        nome: '🔥 Elemental Primordial do Fogo',
        hp: 15000, dano: [220,350], xp: 5500, moedas: [2200,3800],
        drop: 'Coração de Fogo',
        fases: [
          { nome: 'Fase 1 — Aquecendo', hp_pct: 100, dano_mult: 1.0, msg: 'O Elemental aquece o ar ao redor.' },
          { nome: 'Fase 2 — Explodindo', hp_pct: 55, dano_mult: 1.8, msg: '💥 Explosões de lava em área!' },
          { nome: 'Fase 3 — Sol', hp_pct: 20, dano_mult: 2.6, msg: '☀️ O Elemental brilha como um sol!' }
        ]
      },
      {
        nome: '🐉 Drake Ancião das Chamas',
        hp: 22000, dano: [300,480], xp: 8000, moedas: [3200,5500],
        drop: 'Escama do Drake Ancião',
        fases: [
          { nome: 'Fase 1 — Ameaçando', hp_pct: 100, dano_mult: 1.0, msg: 'O Drake ruge e chamas saem de suas narinas.' },
          { nome: 'Fase 2 — Sopro Infernal', hp_pct: 60, dano_mult: 1.7, msg: '🔥 Sopro de fogo em cone!' },
          { nome: 'Fase 3 — Fúria Dracônica', hp_pct: 25, dano_mult: 2.4, msg: '💀 O Drake entra em fúria dracônica!' }
        ]
      },
      {
        nome: '👑 Senhor das Chamas Eternas',
        hp: 35000, dano: [400,650], xp: 14000, moedas: [5500,9000],
        drop: 'Chama Eterna',
        drop_arma: true,
        fases: [
          { nome: 'Fase 1 — Manifestando', hp_pct: 100, dano_mult: 1.0, msg: 'O Senhor das Chamas manifesta sua presença.' },
          { nome: 'Fase 2 — Inferno', hp_pct: 65, dano_mult: 1.6, msg: '🌋 O vulcão entra em erupção!' },
          { nome: 'Fase 3 — Fênix Renascida', hp_pct: 40, dano_mult: 2.0, msg: '🦅 O Senhor renova suas chamas!' },
          { nome: 'Fase 4 — Chama Primordial', hp_pct: 15, dano_mult: 3.2, msg: '🔥 A chama primordial consome tudo!' }
        ]
      }
    ],
    clima: 'lava'
  },
  ceu_solvaryn: {
    nome: '☁️ Céu Flutuante de Solvaryn', nivel_min: 80, nivel_max: 120,
    descricao: 'Ilhas flutuantes no céu. Apenas os mais fortes chegam aqui.',
    monstros: [
      { nome: 'Anjo Caído', hp: [800,1200], dano: [160,300], xp: [400,680], moedas: [200,400] },
      { nome: 'Serafim Corrompido', hp: [900,1350], dano: [180,338], xp: [450,765], moedas: [225,450] },
      { nome: 'Guardião Celestial', hp: [1000,1500], dano: [200,375], xp: [500,850], moedas: [250,500] },
      { nome: 'Tempestade Viva', hp: [750,1125], dano: [150,281], xp: [375,637], moedas: [188,375] },
      { nome: 'Ser do Éter', hp: [850,1275], dano: [170,319], xp: [425,722], moedas: [213,425] },
      { nome: 'Titã Voador', hp: [1100,1650], dano: [220,413], xp: [550,935], moedas: [275,550] },
    ],
    bosses: [
      {
        nome: '⚡ Tempestade Eterna',
        hp: 40000, dano: [500,800], xp: 18000, moedas: [7000,12000],
        drop: 'Essência da Tempestade',
        fases: [
          { nome: 'Fase 1 — Nublando', hp_pct: 100, dano_mult: 1.0, msg: 'Nuvens negras cobrem o céu.' },
          { nome: 'Fase 2 — Relâmpagos', hp_pct: 55, dano_mult: 1.9, msg: '⚡ Raios caem em área!' },
          { nome: 'Fase 3 — Furacão', hp_pct: 20, dano_mult: 2.7, msg: '🌪️ Um furacão letal se forma!' }
        ]
      },
      {
        nome: '👼 Arcanjo Corrompido',
        hp: 60000, dano: [700,1100], xp: 25000, moedas: [10000,17000],
        drop: 'Asa do Arcanjo',
        fases: [
          { nome: 'Fase 1 — Santo', hp_pct: 100, dano_mult: 1.0, msg: 'O Arcanjo ainda tem resquícios de santidade.' },
          { nome: 'Fase 2 — Corrompido', hp_pct: 60, dano_mult: 1.8, msg: '⚠️ A corrupção toma conta!' },
          { nome: 'Fase 3 — Demoníaco', hp_pct: 25, dano_mult: 2.6, msg: '😈 O Arcanjo se torna demônio!' }
        ]
      },
      {
        nome: '☀️ O Soberano do Céu',
        hp: 100000, dano: [1000,1600], xp: 45000, moedas: [18000,30000],
        drop: 'Pena do Soberano',
        drop_arma: true,
        fases: [
          { nome: 'Fase 1 — Majestuoso', hp_pct: 100, dano_mult: 1.0, msg: 'O Soberano paira acima de tudo.' },
          { nome: 'Fase 2 — Julgamento', hp_pct: 65, dano_mult: 1.7, msg: '⚡ O Soberano julga você!' },
          { nome: 'Fase 3 — Exército Celestial', hp_pct: 40, dano_mult: 2.2, msg: '👼 O exército celestial marcha!' },
          { nome: 'Fase 4 — Poder Divino', hp_pct: 15, dano_mult: 3.5, msg: '☀️ O poder divino absoluto!' },
          { nome: 'Fase 5 — Extinção Celestial', hp_pct: 5, dano_mult: 5.0, msg: '💀 O Soberano tenta extinguir tudo!' }
        ]
      }
    ],
    clima: 'tempestade'
  },
  montanha_dragao_vida: {
    nome: '🐉 Montanha do Dragão da Vida', nivel_min: 100, nivel_max: 150,
    descricao: 'O lar do Dragão da Vida. Apenas lendas chegam aqui.',
    monstros: [
      { nome: 'Dragão Sagrado', hp: [2000,3000], dano: [400,750], xp: [1000,1700], moedas: [500,1000] },
      { nome: 'Protetor Ancestral', hp: [2200,3300], dano: [440,825], xp: [1100,1870], moedas: [550,1100] },
      { nome: 'Elemental Primordial', hp: [2400,3600], dano: [480,900], xp: [1200,2040], moedas: [600,1200] },
      { nome: 'Guardião da Vida', hp: [1800,2700], dano: [360,675], xp: [900,1530], moedas: [450,900] },
      { nome: 'Wyrm Sagrado', hp: [2600,3900], dano: [520,975], xp: [1300,2210], moedas: [650,1300] },
    ],
    bosses: [
      {
        nome: '🔮 Guardião do Dragão',
        hp: 80000, dano: [1200,2000], xp: 35000, moedas: [14000,24000],
        drop: 'Cristal do Guardião',
        fases: [
          { nome: 'Fase 1 — Protetor', hp_pct: 100, dano_mult: 1.0, msg: 'O Guardião protege o dragão.' },
          { nome: 'Fase 2 — Fúria', hp_pct: 50, dano_mult: 2.0, msg: '⚠️ O Guardião entra em fúria!' },
          { nome: 'Fase 3 — Poder Máximo', hp_pct: 20, dano_mult: 3.0, msg: '💥 Poder ilimitado!' }
        ]
      },
      {
        nome: '🌟 Wyrm Primordial',
        hp: 150000, dano: [2000,3200], xp: 60000, moedas: [24000,40000],
        drop: 'Escama Primordial do Wyrm',
        fases: [
          { nome: 'Fase 1 — Antigo', hp_pct: 100, dano_mult: 1.0, msg: 'O Wyrm é mais antigo que o mundo.' },
          { nome: 'Fase 2 — Destruição', hp_pct: 55, dano_mult: 1.9, msg: '💀 O Wyrm destrói o terreno!' },
          { nome: 'Fase 3 — Primordial', hp_pct: 20, dano_mult: 3.2, msg: '🌟 Energia primordial explode!' }
        ]
      },
      {
        nome: '🐉 Vyraxis — O Dragão da Vida',
        hp: 300000, dano: [3500,5500], xp: 120000, moedas: [50000,90000],
        drop: 'Coração do Dragão da Vida',
        drop_arma: true,
        fases: [
          { nome: 'Fase 1 — Despertando', hp_pct: 100, dano_mult: 1.0, msg: '🐉 Vyraxis abre seus olhos após séculos dormindo.' },
          { nome: 'Fase 2 — Testando', hp_pct: 75, dano_mult: 1.5, msg: '⚠️ Vyraxis testa sua força!' },
          { nome: 'Fase 3 — Dracônico', hp_pct: 50, dano_mult: 2.2, msg: '🔥 O poder dracônico se manifesta!' },
          { nome: 'Fase 4 — Vida Absoluta', hp_pct: 25, dano_mult: 3.0, msg: '💚 Vyraxis canaliza a energia da vida!' },
          { nome: 'Fase 5 — Dragão Eterno', hp_pct: 10, dano_mult: 5.0, msg: '🌟 Vyraxis — eterno, invencível, absoluto!' }
        ]
      }
    ],
    clima: 'sagrado'
  }
};

// ── ARMAS (20 raridades) ─────────────────────────────────
const ARMAS = [
  // ⬜ Comum
  { id: 'espada_enferrujada', nome: '🗡️ Espada Enferrujada', dano: [5,12], raridade: '⬜ Comum', preco: 50 },
  { id: 'arco_simples', nome: '🏹 Arco Simples', dano: [4,10], raridade: '⬜ Comum', preco: 45 },
  { id: 'cajado_madeira', nome: '🪄 Cajado de Madeira', dano: [3,9], raridade: '⬜ Comum', preco: 40 },
  { id: 'adaga_ferrugem', nome: '🗡️ Adaga de Ferrugem', dano: [4,11], raridade: '⬜ Comum', preco: 35 },
  { id: 'faca_osso', nome: '🦴 Faca de Osso', dano: [3,8], raridade: '⬜ Comum', preco: 30 },
  { id: 'lanca_bambu', nome: '🎋 Lança de Bambu', dano: [4,10], raridade: '⬜ Comum', preco: 38 },
  { id: 'clava_madeira', nome: '🪵 Clava de Madeira', dano: [5,11], raridade: '⬜ Comum', preco: 28 },
  { id: 'foice_simples', nome: '🌾 Foice Simples', dano: [4,9], raridade: '⬜ Comum', preco: 32 },
  { id: 'pedra_afiada', nome: '🪨 Pedra Afiada', dano: [2,7], raridade: '⬜ Comum', preco: 15 },
  { id: 'bastao_simples', nome: '🪵 Bastão Simples', dano: [3,8], raridade: '⬜ Comum', preco: 20 },
  { id: 'espada_madeira', nome: '🗡️ Espada de Madeira', dano: [4,10], raridade: '⬜ Comum', preco: 25 },
  { id: 'zarabatana', nome: '💨 Zarabatana', dano: [3,8], raridade: '⬜ Comum', preco: 22 },
  { id: 'martelo_ferro_velho', nome: '🔨 Martelo de Ferro Velho', dano: [5,12], raridade: '⬜ Comum', preco: 42 },
  { id: 'gancho_pirata', nome: '🪝 Gancho de Pirata', dano: [4,10], raridade: '⬜ Comum', preco: 36 },
  { id: 'chicote_couro', nome: '🪢 Chicote de Couro', dano: [3,9], raridade: '⬜ Comum', preco: 33 },
  { id: 'arco_cipestre', nome: '🏹 Arco de Cipreste', dano: [4,11], raridade: '⬜ Comum', preco: 44 },
  { id: 'espeto_ferreiro', nome: '🗡️ Espeto do Ferreiro', dano: [4,10], raridade: '⬜ Comum', preco: 30 },
  { id: 'forcado_fazenda', nome: '🍴 Forcado da Fazenda', dano: [3,8], raridade: '⬜ Comum', preco: 18 },
  { id: 'machadinha_lenhador', nome: '🪓 Machadinha do Lenhador', dano: [5,12], raridade: '⬜ Comum', preco: 48 },
  { id: 'punhal_cobre', nome: '🗡️ Punhal de Cobre', dano: [4,11], raridade: '⬜ Comum', preco: 40 },

  // 🟫 Inferior
  { id: 'espada_pederneira', nome: '🗡️ Espada de Pederneira', dano: [8,16], raridade: '🟫 Inferior', preco: 100 },
  { id: 'arco_pinheiro', nome: '🏹 Arco de Pinheiro', dano: [7,15], raridade: '🟫 Inferior', preco: 90 },
  { id: 'cajado_osso', nome: '🪄 Cajado de Osso', dano: [6,14], raridade: '🟫 Inferior', preco: 85 },
  { id: 'machadinha_bronze', nome: '🪓 Machadinha de Bronze', dano: [9,18], raridade: '🟫 Inferior', preco: 110 },
  { id: 'adaga_ferro', nome: '🗡️ Adaga de Ferro', dano: [7,15], raridade: '🟫 Inferior', preco: 95 },
  { id: 'lanca_ferro', nome: '⚔️ Lança de Ferro', dano: [8,17], raridade: '🟫 Inferior', preco: 105 },
  { id: 'espadao_bronze', nome: '⚔️ Espadão de Bronze', dano: [10,20], raridade: '🟫 Inferior', preco: 120 },
  { id: 'arco_carvalho', nome: '🏹 Arco de Carvalho', dano: [7,16], raridade: '🟫 Inferior', preco: 98 },
  { id: 'martelo_pedra', nome: '🔨 Martelo de Pedra', dano: [9,18], raridade: '🟫 Inferior', preco: 112 },
  { id: 'foice_ferro', nome: '☠️ Foice de Ferro', dano: [8,16], raridade: '🟫 Inferior', preco: 102 },
  { id: 'espada_cobre', nome: '🗡️ Espada de Cobre', dano: [8,17], raridade: '🟫 Inferior', preco: 95 },
  { id: 'punhal_bronze', nome: '🗡️ Punhal de Bronze', dano: [7,15], raridade: '🟫 Inferior', preco: 88 },
  { id: 'arco_tecido', nome: '🏹 Arco Tecido', dano: [6,14], raridade: '🟫 Inferior', preco: 82 },
  { id: 'clava_ferro', nome: '🔩 Clava de Ferro', dano: [9,19], raridade: '🟫 Inferior', preco: 115 },
  { id: 'gancho_ferro', nome: '🪝 Gancho de Ferro', dano: [7,15], raridade: '🟫 Inferior', preco: 90 },
  { id: 'cajado_ferro', nome: '🪄 Cajado de Ferro', dano: [6,13], raridade: '🟫 Inferior', preco: 80 },
  { id: 'espeto_ferro', nome: '🗡️ Espeto de Ferro', dano: [8,16], raridade: '🟫 Inferior', preco: 93 },
  { id: 'machadao_ferro', nome: '🪓 Machadão de Ferro', dano: [10,21], raridade: '🟫 Inferior', preco: 125 },

  // 🟩 Incomum
  { id: 'espada_ferro', nome: '⚔️ Espada de Ferro', dano: [12,22], raridade: '🟩 Incomum', preco: 200 },
  { id: 'arco_cacador', nome: '🏹 Arco do Caçador', dano: [10,20], raridade: '🟩 Incomum', preco: 180 },
  { id: 'cajado_arcano', nome: '🪄 Cajado Arcano', dano: [8,18], raridade: '🟩 Incomum', preco: 220 },
  { id: 'machado_guerra', nome: '🪓 Machado de Guerra', dano: [14,25], raridade: '🟩 Incomum', preco: 240 },
  { id: 'adaga_prata', nome: '🗡️ Adaga de Prata', dano: [11,21], raridade: '🟩 Incomum', preco: 195 },
  { id: 'lanca_aco', nome: '⚔️ Lança de Aço', dano: [13,24], raridade: '🟩 Incomum', preco: 230 },
  { id: 'arco_elfico_menor', nome: '🏹 Arco Élfico Menor', dano: [12,22], raridade: '🟩 Incomum', preco: 210 },
  { id: 'cajado_natureza', nome: '🌿 Cajado da Natureza', dano: [9,19], raridade: '🟩 Incomum', preco: 190 },
  { id: 'espada_guardiao', nome: '🛡️ Espada do Guardião', dano: [13,23], raridade: '🟩 Incomum', preco: 225 },
  { id: 'martelo_aco', nome: '🔨 Martelo de Aço', dano: [14,26], raridade: '🟩 Incomum', preco: 245 },
  { id: 'foice_prata', nome: '☠️ Foice de Prata', dano: [11,22], raridade: '🟩 Incomum', preco: 205 },
  { id: 'espadao_aco', nome: '⚔️ Espadão de Aço', dano: [15,28], raridade: '🟩 Incomum', preco: 260 },
  { id: 'arco_floresta', nome: '🌲 Arco da Floresta', dano: [11,21], raridade: '🟩 Incomum', preco: 198 },
  { id: 'punhal_aco', nome: '🗡️ Punhal de Aço', dano: [10,20], raridade: '🟩 Incomum', preco: 185 },
  { id: 'cajado_cristal', nome: '🪄 Cajado de Cristal', dano: [10,20], raridade: '🟩 Incomum', preco: 215 },
  { id: 'lanca_carvalho_ferreo', nome: '⚔️ Lança Carvalho-Férreo', dano: [13,24], raridade: '🟩 Incomum', preco: 232 },

  // 🟦 Raro
  { id: 'espada_aco', nome: '⚔️ Espada de Aço', dano: [25,40], raridade: '🟦 Raro', preco: 800 },
  { id: 'arco_elfico', nome: '🏹 Arco Élfico', dano: [22,38], raridade: '🟦 Raro', preco: 750 },
  { id: 'cajado_magico', nome: '🔮 Cajado Mágico', dano: [20,35], raridade: '🟦 Raro', preco: 850 },
  { id: 'lanca_trovao', nome: '⚡ Lança do Trovão', dano: [28,45], raridade: '🟦 Raro', preco: 900 },
  { id: 'espada_crepusculo', nome: '🌅 Lâmina do Crepúsculo', dano: [26,42], raridade: '🟦 Raro', preco: 820 },
  { id: 'arco_ventos', nome: '💨 Arco dos Ventos', dano: [23,39], raridade: '🟦 Raro', preco: 780 },
  { id: 'cajado_chamas', nome: '🔥 Cajado das Chamas', dano: [22,37], raridade: '🟦 Raro', preco: 860 },
  { id: 'machado_sanguinario', nome: '🩸 Machado Sanguinário', dano: [29,47], raridade: '🟦 Raro', preco: 930 },
  { id: 'adaga_sombra', nome: '🌑 Adaga das Sombras', dano: [24,40], raridade: '🟦 Raro', preco: 810 },
  { id: 'espada_gelo', nome: '❄️ Espada de Gelo', dano: [25,41], raridade: '🟦 Raro', preco: 830 },
  { id: 'cajado_tempestade', nome: '⛈️ Cajado da Tempestade', dano: [21,36], raridade: '🟦 Raro', preco: 840 },
  { id: 'lanca_serpente', nome: '🐍 Lança da Serpente', dano: [27,44], raridade: '🟦 Raro', preco: 890 },
  { id: 'arco_aguia', nome: '🦅 Arco da Águia', dano: [24,40], raridade: '🟦 Raro', preco: 800 },
  { id: 'martelo_trovao', nome: '⚡ Martelo do Trovão', dano: [30,48], raridade: '🟦 Raro', preco: 950 },

  // 🟪 Épico
  { id: 'espada_almas', nome: '💀 Espada das Almas', dano: [45,65], raridade: '🟪 Épico', preco: 3000 },
  { id: 'arco_sombras', nome: '🌑 Arco das Sombras', dano: [40,60], raridade: '🟪 Épico', preco: 2800 },
  { id: 'cajado_abissal', nome: '🌀 Cajado Abissal', dano: [38,58], raridade: '🟪 Épico', preco: 3200 },
  { id: 'manopla_tita', nome: '👊 Manopla do Titã', dano: [50,70], raridade: '🟪 Épico', preco: 3500 },
  { id: 'lanca_dragao', nome: '🐉 Lança do Dragão', dano: [48,68], raridade: '🟪 Épico', preco: 3400 },
  { id: 'arco_morte', nome: '☠️ Arco da Morte', dano: [42,62], raridade: '🟪 Épico', preco: 3100 },
  { id: 'espada_chamas', nome: '🔥 Espada das Chamas', dano: [46,66], raridade: '🟪 Épico', preco: 3050 },
  { id: 'cajado_ossos', nome: '💀 Cajado dos Ossos', dano: [40,60], raridade: '🟪 Épico', preco: 2900 },
  { id: 'machado_titan', nome: '⚔️ Machado Titânico', dano: [52,72], raridade: '🟪 Épico', preco: 3600 },
  { id: 'adaga_veneno_epico', nome: '☠️ Adaga do Veneno Épico', dano: [44,64], raridade: '🟪 Épico', preco: 3000 },
  { id: 'arco_raios', nome: '⚡ Arco dos Raios', dano: [43,63], raridade: '🟪 Épico', preco: 3150 },
  { id: 'cajado_tempo', nome: '⏳ Cajado do Tempo', dano: [41,61], raridade: '🟪 Épico', preco: 3050 },

  // 🟨 Lendário
  { id: 'excalibur', nome: '✨ Excalibur', dano: [70,100], raridade: '🟨 Lendário', preco: 12000 },
  { id: 'arco_artemis', nome: '🏹 Arco de Ártemis', dano: [65,95], raridade: '🟨 Lendário', preco: 11000 },
  { id: 'bastao_odin', nome: '⚡ Bastão de Odin', dano: [68,98], raridade: '🟨 Lendário', preco: 13000 },
  { id: 'foice_morte', nome: '☠️ Foice da Morte', dano: [75,105], raridade: '🟨 Lendário', preco: 15000 },
  { id: 'espada_destino', nome: '⚔️ Espada do Destino', dano: [72,102], raridade: '🟨 Lendário', preco: 13500 },
  { id: 'arco_cosmos', nome: '🌌 Arco do Cosmos', dano: [67,97], raridade: '🟨 Lendário', preco: 12500 },
  { id: 'cajado_eternidade', nome: '♾️ Cajado da Eternidade', dano: [70,100], raridade: '🟨 Lendário', preco: 14000 },
  { id: 'lanca_olimpo', nome: '⚡ Lança do Olimpo', dano: [78,110], raridade: '🟨 Lendário', preco: 16000 },
  { id: 'espada_campeao', nome: '🏆 Espada do Campeão', dano: [73,103], raridade: '🟨 Lendário', preco: 14500 },
  { id: 'cajado_caos_lendario', nome: '🌀 Cajado do Caos', dano: [71,101], raridade: '🟨 Lendário', preco: 13800 },

  // 🔶 Ancestral
  { id: 'espada_ancestral', nome: '⚔️ Espada Ancestral', dano: [90,130], raridade: '🔶 Ancestral', preco: 35000 },
  { id: 'arco_ancestral', nome: '🏹 Arco Ancestral', dano: [85,125], raridade: '🔶 Ancestral', preco: 32000 },
  { id: 'cajado_ancestral', nome: '🪄 Cajado Ancestral', dano: [82,122], raridade: '🔶 Ancestral', preco: 30000 },
  { id: 'machado_ancestral', nome: '🪓 Machado Ancestral', dano: [95,140], raridade: '🔶 Ancestral', preco: 38000 },
  { id: 'lanca_ancestral', nome: '⚔️ Lança Ancestral', dano: [92,135], raridade: '🔶 Ancestral', preco: 36000 },
  { id: 'espada_primeiro_guerreiro', nome: '🗡️ Espada do Primeiro Guerreiro', dano: [96,142], raridade: '🔶 Ancestral', preco: 40000 },
  { id: 'arco_primeiro_cacador', nome: '🏹 Arco do Primeiro Caçador', dano: [88,130], raridade: '🔶 Ancestral', preco: 34000 },
  { id: 'cajado_primeiro_mago', nome: '🪄 Cajado do Primeiro Mago', dano: [84,124], raridade: '🔶 Ancestral', preco: 31000 },

  // 🔷 Arcana
  { id: 'espada_arcana', nome: '🔷 Lâmina Arcana', dano: [110,160], raridade: '🔷 Arcana', preco: 80000 },
  { id: 'arco_arcano', nome: '🔷 Arco Arcano', dano: [105,155], raridade: '🔷 Arcana', preco: 75000 },
  { id: 'cajado_arcano_puro', nome: '🔷 Cajado Arcano Puro', dano: [100,150], raridade: '🔷 Arcana', preco: 70000 },
  { id: 'lamina_runa', nome: '🔷 Lâmina das Runas', dano: [115,168], raridade: '🔷 Arcana', preco: 85000 },
  { id: 'arco_mana', nome: '🔷 Arco de Mana Pura', dano: [108,158], raridade: '🔷 Arcana', preco: 78000 },
  { id: 'cajado_runas', nome: '🔷 Cajado das Runas', dano: [103,153], raridade: '🔷 Arcana', preco: 72000 },

  // 🔴 Primordial
  { id: 'espada_primordial', nome: '🌟 Espada Primordial', dano: [150,220], raridade: '🔴 Primordial', preco: 0, exclusiva: true },
  { id: 'arco_primordial', nome: '🌟 Arco Primordial', dano: [140,210], raridade: '🔴 Primordial', preco: 0, exclusiva: true },
  { id: 'cajado_primordial', nome: '🌟 Cajado Primordial', dano: [145,215], raridade: '🔴 Primordial', preco: 0, exclusiva: true },
  { id: 'lamina_primordial', nome: '🌟 Lâmina Primordial', dano: [155,230], raridade: '🔴 Primordial', preco: 0, exclusiva: true },

  // 🟠 Abissal
  { id: 'garra_vazio', nome: '🌑 Garra do Vazio', dano: [180,260], raridade: '🟠 Abissal', preco: 0, exclusiva: true },
  { id: 'lanca_abissal', nome: '🌑 Lança Abissal', dano: [175,255], raridade: '🟠 Abissal', preco: 0, exclusiva: true },
  { id: 'machado_caos_eterno', nome: '🌑 Machado do Caos Eterno', dano: [185,270], raridade: '🟠 Abissal', preco: 0, exclusiva: true },

  // ⚫ Sombria
  { id: 'espada_sombria', nome: '⚫ Espada Sombria', dano: [200,290], raridade: '⚫ Sombria', preco: 0, exclusiva: true },
  { id: 'arco_sombrio', nome: '⚫ Arco Sombrio', dano: [195,280], raridade: '⚫ Sombria', preco: 0, exclusiva: true },
  { id: 'cajado_sombrio', nome: '⚫ Cajado Sombrio', dano: [190,275], raridade: '⚫ Sombria', preco: 0, exclusiva: true },

  // 🌑 Amaldiçoada
  { id: 'espada_amaldicada', nome: '🌑 Espada Amaldiçoada', dano: [220,320], raridade: '🌑 Amaldiçoada', preco: 0, exclusiva: true },
  { id: 'foice_amaldicada', nome: '🌑 Foice Amaldiçoada', dano: [215,310], raridade: '🌑 Amaldiçoada', preco: 0, exclusiva: true },

  // 🌟 Celestial
  { id: 'espada_celestial', nome: '🌟 Espada Celestial', dano: [250,360], raridade: '🌟 Celestial', preco: 0, exclusiva: true },
  { id: 'arco_celestial', nome: '🌟 Arco Celestial', dano: [245,355], raridade: '🌟 Celestial', preco: 0, exclusiva: true },

  // ☀️ Solar
  { id: 'espada_solar', nome: '☀️ Espada Solar', dano: [280,400], raridade: '☀️ Solar', preco: 0, exclusiva: true },
  { id: 'lanca_solar', nome: '☀️ Lança Solar', dano: [275,395], raridade: '☀️ Solar', preco: 0, exclusiva: true },

  // 🌊 Abissal Marinha
  { id: 'tridente_abissal', nome: '🌊 Tridente Abissal', dano: [300,430], raridade: '🌊 Abissal Marinha', preco: 0, exclusiva: true },
  { id: 'espada_oceano', nome: '🌊 Espada do Oceano', dano: [295,425], raridade: '🌊 Abissal Marinha', preco: 0, exclusiva: true },

  // ❄️ Glacial Eterna
  { id: 'espada_glacial', nome: '❄️ Espada Glacial Eterna', dano: [330,480], raridade: '❄️ Glacial Eterna', preco: 0, exclusiva: true },

  // 🔥 Infernal
  { id: 'espada_infernal', nome: '🔥 Espada Infernal', dano: [360,520], raridade: '🔥 Infernal', preco: 0, exclusiva: true },

  // ⚡ Relâmpago Divino
  { id: 'lanca_relampago', nome: '⚡ Lança do Relâmpago Divino', dano: [400,580], raridade: '⚡ Relâmpago Divino', preco: 0, exclusiva: true },

  // 🌈 Primeva
  { id: 'espada_primeva', nome: '🌈 Espada Primeva', dano: [500,720], raridade: '🌈 Primeva', preco: 0, exclusiva: true },

  // ☠️ DEUS — Exclusiva do JUVENT
  { id: 'foice_criacao', nome: '☠️ Foice da Criação', dano: [999,9999], raridade: '☠️ DEUS', preco: 0, exclusiva: true, dono: true },
];

const ARMAS_PRIMORDIAIS = ARMAS.filter(a => a.raridade === '🔴 Primordial');
const ARMAS_RARAS_DROP = ARMAS.filter(a => a.exclusiva && !a.dono);

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
  { id: 'ovo_raro', nome: '🥚 Ovo Raro', preco: 2000, raridade_base: '🟦 Raro', chance_raro: 30, descricao: 'Brilha levemente. Algo especial está dentro.' },
  { id: 'ovo_epico', nome: '🥚 Ovo Épico', preco: 8000, raridade_base: '🟪 Épico', chance_raro: 60, descricao: 'Pulsa com energia mágica.' },
  { id: 'ovo_lendario', nome: '🥚 Ovo Lendário', preco: 30000, raridade_base: '🟨 Lendário', chance_raro: 85, descricao: 'Extremamente raro. O que está dentro é lendário.' },
  { id: 'ovo_dragao', nome: '🥚 Ovo de Dragão', preco: 100000, raridade_base: '🔴 Primordial', chance_raro: 100, descricao: 'Um ovo de dragão verdadeiro. Impossível de encontrar.' },
];

// ── ANIMAIS PARA ADOTAR ──────────────────────────────────
const ANIMAIS = [
  { id: 'lobo', nome: '🐺 Lobo', preco: 800, habilidade_batalha: false, descricao: 'Leal e feroz. Companheiro perfeito.' },
  { id: 'aguia', nome: '🦅 Águia', preco: 1200, habilidade_batalha: false, descricao: 'Visão afiada. Detecta inimigos escondidos.' },
  { id: 'urso', nome: '🐻 Urso', preco: 1500, habilidade_batalha: false, descricao: 'Força bruta. Intimida inimigos.' },
  { id: 'cobra', nome: '🐍 Cobra', preco: 600, habilidade_batalha: false, descricao: 'Pequena mas venenosa.' },
  { id: 'leao', nome: '🦁 Leão', preco: 3000, habilidade_batalha: false, descricao: 'O rei das feras. Imponente.' },
  { id: 'tigre', nome: '🐯 Tigre', preco: 2500, habilidade_batalha: false, descricao: 'Velocidade e força em um só.' },
  { id: 'falcao', nome: '🦆 Falcão', preco: 1000, habilidade_batalha: false, descricao: 'Mensageiro e guia.' },
  { id: 'cervo', nome: '🦌 Cervo', preco: 700, habilidade_batalha: false, descricao: 'Gracioso. Traz boa sorte.' },
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
];

// ── CONQUISTAS ────────────────────────────────────────────
const CONQUISTAS = {
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

module.exports = {
  CLASSES, CLASSES_NORMAIS, CLASSES_RARAS,
  REGIOES, ARMAS, ARMAS_PRIMORDIAIS, ARMAS_RARAS_DROP,
  ITENS_LOJA, CONQUISTAS, TITULOS, RANKS,
  MONSTROS_HP, MONSTROS_DANO,
  NIVEIS, calcularNivel,
  PETS, OVOS, ANIMAIS, RARIDADES_PETS,
  MASMORRAS
};
