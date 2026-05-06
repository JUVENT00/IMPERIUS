// ============================================================
// IMPERIUS RPG — DADOS DO JOGO (v2.0)
// ============================================================

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
  { nome: '✦LENDÁRIO✦', xp_min: 100000, bonus: 150 }
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
      maldicao: { nome: 'Maldição', custo: 25, dano: 0, efeito: 'amaldicado', chance: 100 }
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

  // ── CLASSES RARAS DA ROLETA (11) ─────────────────────────
  vampiro: {
    nome: '🩸 Vampiro', hp: 100, mana: 120,
    for: 13, des: 14, con: 10, int: 13,
    passiva: 'Cada ataque rouba 15% do HP causado',
    poder_especial: '🩸 ROUBO VITAL: A cada ataque, recupera % do dano causado como HP. Nenhuma outra classe possui isso.',
    lore: 'Ele não escolheu a escuridão. A escuridão o escolheu numa noite sem lua. Agora ele se alimenta para sobreviver, e sobrevive para se alimentar.',
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
    poder_especial: '🌑 INVISIBILIDADE TOTAL: Pode ficar completamente invisível por 1 turno — inimigos erram automaticamente. Nenhuma outra classe possui isso.',
    lore: 'Não existe nas memórias de quem sobreviveu. Existe apenas na ferida que deixou.',
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
    poder_especial: '⚡ CADEIA DE RAIOS: Seus ataques pulam automaticamente para inimigos próximos, atingindo até 3 alvos. Nenhuma outra classe possui isso.',
    lore: 'Os deuses do céu foram mortos há milênios. Alguém ficou com o raio deles.',
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
    passiva: 'Possui um dragão como pet permanente que auxilia em batalhas',
    poder_especial: '🐉 DRAGÃO PERMANENTE: Invoca um dragão como companheiro eterno que ataca junto em cada batalha. Nenhuma outra classe possui isso.',
    lore: 'Domar um dragão não é coragem. É loucura aceita pelo dragão.',
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
    poder_especial: '👻 ATRAVESSAR DEFESA: Seus ataques ignoram completamente a armadura e defesa do inimigo. Nenhuma outra classe possui isso.',
    lore: 'Morreu uma vez. Não gostou. Voltou sem pedir permissão.',
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
    poder_especial: '🌊 CONGELAR: Pode congelar completamente o inimigo por 1 turno, impedindo qualquer ação. Nenhuma outra classe possui isso.',
    lore: 'O mar não tem raiva. Tem paciência. E um dia ele chega em todo lugar.',
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
    passiva: 'Ataques em área atingem todos os inimigos presentes',
    poder_especial: '☄️ METEORO TOTAL: Invoca meteoros que atingem todos os inimigos e jogadores inimigos ao mesmo tempo (AoE em grupo). Nenhuma outra classe possui isso.',
    lore: 'Ele não invoca o céu. Ele lembra o céu do que ele é capaz.',
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
    poder_especial: '🕯️ RESSURREIÇÃO DIVINA: Ao morrer pela primeira vez, ressuscita automaticamente com HP cheio. Nenhuma outra classe possui isso.',
    lore: 'Caiu do paraíso mas não chegou ao inferno. Ficou no meio. Julgando os dois lados.',
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
    poder_especial: '🔥 ABSORÇÃO DE PODER: Ao matar um inimigo, absorve permanentemente uma habilidade ou poder dele. Nenhuma outra classe possui isso.',
    lore: 'Foi o maior de todos. Até o dia em que descobriu que os heróis também mentem.',
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
    poder_especial: '⚙️ ARMADILHAS AUTOMÁTICAS: Coloca armadilhas que explodem sozinhas quando o inimigo age, sem gastar turno. Nenhuma outra classe possui isso.',
    lore: 'Não acredita em magia. Acredita em engrenagens. O resultado é o mesmo: você morre.',
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
    poder_especial: '☠️ CAOS ABSOLUTO: Tudo é imprevisível — pode causar dano massivo ou curar o inimigo, morrer ou imortalizar. Nenhuma outra classe possui isso.',
    lore: 'Ninguém sabe de onde veio. Nem ele.',
    habilidades: {
      toque_caos: { nome: 'Toque do Caos', custo: 20, dano: (f) => f * Math.random() * 5, efeito: 'aleatorio_total' },
      ruptura: { nome: 'Ruptura', custo: 25, dano: (f, i) => (f + i) * Math.random() * 4, efeito: 'colapso_realidade' },
      paradoxo: { nome: 'Paradoxo', custo: 30, dano: 0, efeito: 'paradoxo_total' }
    },
    ultimate: { nome: '🌀 Fim de Tudo', custo: 50, dano: (f, i) => (f + i) * Math.random() * 10, efeito: 'destruicao_ou_cura', cooldown: 5 }
  }
};

// Classes disponíveis no /criar (20 normais)
const CLASSES_NORMAIS = [
  'guerreiro','mago','assassino','cacador','curandeiro',
  'bardo','necromante','paladino','arqueiro','monge',
  'espadachim','invocador','alquimista','berserker','samurai',
  'ninja','druida','cacador_demonios','vidente','bombardeiro'
];

// Classes exclusivas da /roleta (11 raras)
const CLASSES_RARAS = [
  'vampiro','sombra','trovejante','dragomante','espectro',
  'mare','meteoromante','serafim','heroi_caido','artificer','portador_caos'
];

// ── REGIÕES ───────────────────────────────────────────────
const REGIOES = {
  valdris: {
    nome: '🏰 Valdris (Capital)', nivel: [1, 5],
    monstros: ['Rato Gigante','Bêbado Raivoso','Ladrão de Rua','Cão Selvagem','Goblin Bêbado'],
    boss: 'Senhor das Sombras de Valdris', boss_hp: 500, boss_dano: [20, 40],
    xp: [30, 60], moedas: [15, 35], drop: 'Chave de Valdris',
    clima: 'normal'
  },
  floresta_eryndal: {
    nome: '🌲 Floresta de Eryndal', nivel: [5, 15],
    monstros: ['Lobo das Sombras','Aranha Venenosa','Goblin Arqueiro','Troll da Floresta','Planta Carnívora'],
    boss: 'Hydra de Eryndal', boss_hp: 1200, boss_dano: [35, 65],
    xp: [60, 100], moedas: [30, 60], drop: 'Escama da Hydra',
    clima: 'nevoa'
  },
  bosque_sombras: {
    nome: '🌑 Bosque das Sombras', nivel: [10, 20],
    monstros: ['Espectro Menor','Zumbi Antigo','Sombra Errante','Banshee','Cavaleiro Morto'],
    boss: 'Rei das Sombras', boss_hp: 1800, boss_dano: [45, 80],
    xp: [80, 130], moedas: [40, 80], drop: 'Fragmento de Trevas',
    clima: 'nevoa'
  },
  mata_espiritos: {
    nome: '👻 Mata dos Espíritos', nivel: [15, 25],
    monstros: ['Espírito Errante','Fantasma Vingativo','Poltergeist','Alma Perdida','Demônio Menor'],
    boss: 'Mãe dos Espíritos', boss_hp: 2500, boss_dano: [55, 95],
    xp: [100, 160], moedas: [50, 100], drop: 'Essência Espiritual',
    clima: 'nevoa'
  },
  pico_kaldros: {
    nome: '🏔️ Pico de Kaldros', nivel: [20, 30],
    monstros: ['Águia Gigante','Yeti','Golem de Pedra','Grifo','Elemental de Vento'],
    boss: 'Senhor das Alturas', boss_hp: 3200, boss_dano: [65, 110],
    xp: [130, 200], moedas: [65, 120], drop: 'Pena do Grifo Dourado',
    clima: 'nevoa'
  },
  serra_titas: {
    nome: '⛰️ Serra dos Titãs', nivel: [25, 35],
    monstros: ['Titã Menor','Ciclope','Golem Antigo','Gigante das Pedras','Rocha Viva'],
    boss: 'Titã Primordial', boss_hp: 4500, boss_dano: [80, 130],
    xp: [160, 240], moedas: [80, 150], drop: 'Osso de Titã',
    clima: 'normal'
  },
  montanha_dragao: {
    nome: '🐉 Montanha do Dragão', nivel: [35, 50],
    monstros: ['Dragão Jovem','Wyrm de Fogo','Draconiano','Wyvern','Guardião do Dragão'],
    boss: 'Valdrak o Eterno', boss_hp: 8000, boss_dano: [120, 180],
    xp: [300, 500], moedas: [200, 400], drop: 'Coração de Dragão',
    clima: 'lava'
  },
  deserto_aresh: {
    nome: '☀️ Deserto de Aresh', nivel: [30, 40],
    monstros: ['Escorpião Gigante','Múmia Guerreira','Djinn do Deserto','Elemental de Areia','Cobra Gigante'],
    boss: 'Faraó Imortal', boss_hp: 5000, boss_dano: [90, 140],
    xp: [170, 260], moedas: [85, 160], drop: 'Amuleto do Faraó',
    clima: 'calor'
  },
  dunas_esquecimento: {
    nome: '🌪️ Dunas do Esquecimento', nivel: [35, 45],
    monstros: ['Memória Corrompida','Ilusão Mortal','Espírito do Deserto','Tempestade Viva','Ser Esquecido'],
    boss: 'O Esquecido', boss_hp: 6000, boss_dano: [100, 155],
    xp: [200, 300], moedas: [100, 190], drop: 'Fragmento de Memória',
    clima: 'calor'
  },
  tundra_voryn: {
    nome: '🌨️ Tundra de Voryn', nivel: [40, 50],
    monstros: ['Urso Polar Mutante','Elemental de Gelo','Viking Morto','Lobo do Ártico','Banshee Congelada'],
    boss: 'Rainha do Gelo Eterno', boss_hp: 7000, boss_dano: [110, 165],
    xp: [220, 340], moedas: [110, 210], drop: 'Cristal do Gelo Eterno',
    clima: 'nevasca'
  },
  cavernas_gelo: {
    nome: '🧊 Cavernas de Gelo Eterno', nivel: [45, 55],
    monstros: ['Golem de Gelo','Elemental Glacial','Ser Congelado','Dragão de Gelo Jovem','Criatura das Profundezas'],
    boss: 'O Ancião Congelado', boss_hp: 9000, boss_dano: [130, 190],
    xp: [260, 400], moedas: [130, 250], drop: 'Núcleo Glacial',
    clima: 'nevasca'
  },
  ilhas_marveth: {
    nome: '🏝️ Ilhas de Marveth', nivel: [25, 40],
    monstros: ['Sereia Assassina','Kraken Jovem','Pirata Morto','Tubarão Mutante','Elemental Aquático'],
    boss: 'Capitão dos Mares Mortos', boss_hp: 5500, boss_dano: [95, 150],
    xp: [190, 280], moedas: [95, 175], drop: 'Tesouro do Capitão',
    clima: 'tempestade'
  },
  abismo_mar_negro: {
    nome: '🌊 Abismo do Mar Negro', nivel: [50, 65],
    monstros: ['Leviatã Menor','Abissal','Kraken Adulto','Ser das Profundezas','Sombra Aquática'],
    boss: 'O Leviatã Eterno', boss_hp: 12000, boss_dano: [160, 220],
    xp: [350, 500], moedas: [175, 320], drop: 'Escama do Leviatã',
    clima: 'tempestade'
  },
  necropole_draktum: {
    nome: '💀 Necrópole de Draktum', nivel: [45, 60],
    monstros: ['Lich Menor','Cavaleiro da Morte','Zumbi Lendário','Vampiro Antigo','Fantasma Senhor'],
    boss: 'Arquilich Valdrath', boss_hp: 10000, boss_dano: [145, 200],
    xp: [300, 450], moedas: [150, 280], drop: 'Alma Aprisionada',
    clima: 'nevoa'
  },
  pantano_maldito: {
    nome: '🌿 Pântano Maldito', nivel: [40, 55],
    monstros: ['Croc Mutante','Bruxa da Lama','Elemental do Pântano','Serpente Gigante','Ser da Lama'],
    boss: 'Mãe do Pântano', boss_hp: 8500, boss_dano: [125, 180],
    xp: [270, 410], moedas: [135, 255], drop: 'Essência do Pântano',
    clima: 'nevoa'
  },
  torre_caos: {
    nome: '🌀 Torre do Caos', nivel: [60, 80],
    monstros: ['Ser do Caos','Anomalia Viva','Paradoxo Andante','Elemental do Vazio','Criatura Impossível'],
    boss: 'O Caos Personificado', boss_hp: 15000, boss_dano: [190, 260],
    xp: [450, 650], moedas: [225, 400], drop: 'Fragmento do Caos',
    clima: 'normal'
  },
  vulcao_ignareth: {
    nome: '🌋 Vulcão de Ignareth', nivel: [55, 70],
    monstros: ['Elemental de Fogo','Salamandra Gigante','Demônio do Fogo','Golem de Lava','Fênix Menor'],
    boss: 'Senhor das Chamas Eternas', boss_hp: 13000, boss_dano: [175, 240],
    xp: [400, 580], moedas: [200, 360], drop: 'Chama Eterna',
    clima: 'lava'
  },
  planicies_cinzas: {
    nome: '🌫️ Planícies de Cinzas', nivel: [50, 65],
    monstros: ['Guerreiro das Cinzas','Espírito da Guerra','Revenant','Cavaleiro Sem Rosto','Sombra da Batalha'],
    boss: 'O General Eterno', boss_hp: 11000, boss_dano: [155, 215],
    xp: [330, 490], moedas: [165, 300], drop: 'Bandeira da Batalha Eterna',
    clima: 'normal'
  },
  ruinas_aelthar: {
    nome: '🏚️ Ruínas de Aelthar', nivel: [55, 75],
    monstros: ['Guardião Antigo','Construto de Pedra','Eco do Passado','Sombra Ancestral','Relíquia Viva'],
    boss: 'O Último de Aelthar', boss_hp: 14000, boss_dano: [185, 250],
    xp: [420, 620], moedas: [210, 380], drop: 'Relíquia de Aelthar',
    clima: 'nevoa'
  },
  portal_mundos: {
    nome: '🌀 Portal dos Mundos', nivel: [70, 90],
    monstros: ['Ser Interdimensional','Viajante Corrompido','Anomalia Dimensional','Eco do Outro Lado','Invasor'],
    boss: 'O Guardião do Portal', boss_hp: 18000, boss_dano: [220, 290],
    xp: [550, 800], moedas: [275, 500], drop: 'Fragmento do Portal',
    clima: 'normal'
  },
  ceu_solvaryn: {
    nome: '☁️ Céu Flutuante de Solvaryn', nivel: [80, 100],
    monstros: ['Anjo Caído','Serafim Corrompido','Guardião Celestial','Tempestade Viva','Ser do Éter'],
    boss: 'O Soberano do Céu', boss_hp: 25000, boss_dano: [280, 380],
    xp: [700, 1000], moedas: [350, 650], drop: 'Pena do Soberano',
    clima: 'tempestade'
  },
  montanha_dragao_vida: {
    nome: '🐉 Montanha do Dragão da Vida', nivel: [90, 120],
    monstros: ['Dragão Sagrado','Protetor Ancestral','Elemental Primordial','Guardião da Vida','Wyrm Sagrado'],
    boss: 'Vyraxis o Dragão da Vida', boss_hp: 35000, boss_dano: [350, 480],
    xp: [900, 1400], moedas: [450, 850], drop: 'Escama da Vida',
    clima: 'normal'
  }
};

// ── ARMAS ─────────────────────────────────────────────────
const ARMAS = [
  // Comum
  { id: 'espada_enferrujada', nome: '🗡️ Espada Enferrujada', dano: [5, 12], raridade: '⬜ Comum', preco: 50 },
  { id: 'arco_simples', nome: '🏹 Arco Simples', dano: [4, 10], raridade: '⬜ Comum', preco: 45 },
  { id: 'cajado_madeira', nome: '🪄 Cajado de Madeira', dano: [3, 9], raridade: '⬜ Comum', preco: 40 },
  { id: 'adaga_ferrugem', nome: '🗡️ Adaga de Ferrugem', dano: [4, 11], raridade: '⬜ Comum', preco: 35 },
  // Incomum
  { id: 'espada_ferro', nome: '⚔️ Espada de Ferro', dano: [12, 22], raridade: '🟩 Incomum', preco: 200 },
  { id: 'arco_caçador', nome: '🏹 Arco do Caçador', dano: [10, 20], raridade: '🟩 Incomum', preco: 180 },
  { id: 'cajado_arcano', nome: '🪄 Cajado Arcano', dano: [8, 18], raridade: '🟩 Incomum', preco: 220 },
  { id: 'machado_guerra', nome: '🪓 Machado de Guerra', dano: [14, 25], raridade: '🟩 Incomum', preco: 240 },
  // Raro
  { id: 'espada_aco', nome: '⚔️ Espada de Aço', dano: [25, 40], raridade: '🟦 Raro', preco: 800 },
  { id: 'arco_élfico', nome: '🏹 Arco Élfico', dano: [22, 38], raridade: '🟦 Raro', preco: 750 },
  { id: 'cajado_magico', nome: '🔮 Cajado Mágico', dano: [20, 35], raridade: '🟦 Raro', preco: 850 },
  { id: 'lanca_trovao', nome: '⚡ Lança do Trovão', dano: [28, 45], raridade: '🟦 Raro', preco: 900 },
  // Épico
  { id: 'espada_almas', nome: '💀 Espada das Almas', dano: [45, 65], raridade: '🟪 Épico', preco: 3000 },
  { id: 'arco_sombras', nome: '🌑 Arco das Sombras', dano: [40, 60], raridade: '🟪 Épico', preco: 2800 },
  { id: 'cajado_abissal', nome: '🌀 Cajado Abissal', dano: [38, 58], raridade: '🟪 Épico', preco: 3200 },
  { id: 'manopla_titã', nome: '👊 Manopla do Titã', dano: [50, 70], raridade: '🟪 Épico', preco: 3500 },
  // Lendário
  { id: 'excalibur', nome: '✨ Excalibur', dano: [70, 100], raridade: '🟨 Lendário', preco: 12000 },
  { id: 'arco_artemis', nome: '🏹 Arco de Ártemis', dano: [65, 95], raridade: '🟨 Lendário', preco: 11000 },
  { id: 'bastao_odin', nome: '⚡ Bastão de Odin', dano: [68, 98], raridade: '🟨 Lendário', preco: 13000 },
  { id: 'foice_morte', nome: '☠️ Foice da Morte', dano: [75, 105], raridade: '🟨 Lendário', preco: 15000 },
  // Primordial (drop exclusivo de matar o Deus encarnado)
  { id: 'espada_primordial', nome: '🌟 Espada Primordial', dano: [120, 180], raridade: '🔴 Primordial', preco: 0, exclusiva: true },
  { id: 'arco_primordial', nome: '🌟 Arco Primordial', dano: [110, 170], raridade: '🔴 Primordial', preco: 0, exclusiva: true },
  { id: 'cajado_primordial', nome: '🌟 Cajado Primordial', dano: [115, 175], raridade: '🔴 Primordial', preco: 0, exclusiva: true },
  { id: 'lamina_primordial', nome: '🌟 Lâmina Primordial', dano: [125, 185], raridade: '🔴 Primordial', preco: 0, exclusiva: true },
];

const ARMAS_PRIMORDIAIS = ARMAS.filter(a => a.raridade === '🔴 Primordial');

// ── ITENS DA LOJA ─────────────────────────────────────────
const ITENS_LOJA = [
  { id: 'pocao_hp_p', nome: '🧪 Poção de HP (P)', preco: 50, efeito: 'curar', valor: 30 },
  { id: 'pocao_hp_m', nome: '🧪 Poção de HP (M)', preco: 120, efeito: 'curar', valor: 70 },
  { id: 'pocao_hp_g', nome: '🧪 Poção de HP (G)', preco: 280, efeito: 'curar', valor: 150 },
  { id: 'pocao_mana_p', nome: '💧 Poção de Mana (P)', preco: 60, efeito: 'mana', valor: 30 },
  { id: 'pocao_mana_g', nome: '💧 Poção de Mana (G)', preco: 200, efeito: 'mana', valor: 100 },
  { id: 'antidoto', nome: '🩹 Antídoto', preco: 80, efeito: 'curar_sangramento' },
  { id: 'purificador', nome: '✨ Purificador', preco: 200, efeito: 'purificar' },
  { id: 'elixir_forca', nome: '💪 Elixir de Força', preco: 500, efeito: 'buff_for', valor: 10, duracao: 3 },
  { id: 'pedra_ressurreicao', nome: '💎 Pedra de Ressurreição', preco: 2000, efeito: 'ressurreicao' },
  { id: 'pocao_xp', nome: '📚 Poção de XP', preco: 800, efeito: 'xp', valor: 500 },
  { id: 'amuleto_sorte', nome: '🍀 Amuleto da Sorte', preco: 1500, efeito: 'buff_sorte', valor: 20, duracao: 5 },
  { id: 'pergaminho_teletransporte', nome: '📜 Pergaminho de Teletransporte', preco: 300, efeito: 'teletransporte' },
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
  matador_dragao: { nome: '🐉 Matador de Dragão', desc: 'Matou o Dragão Eterno Valdrak' },
  viajante: { nome: '🗺️ Grande Viajante', desc: 'Visitou todas as regiões' },
  livre: { nome: '🔓 Livre', desc: 'Se libertou das correntes' },
  deicida: { nome: '⚡ Deicida', desc: 'Matou a encarnação do Deus' },
  sobrevivente_caos: { nome: '🌀 Sobrevivente do Caos', desc: 'Sobreviveu à Torre do Caos' },
  roleta_rara: { nome: '🎰 Agraciado pelo Destino', desc: 'Conseguiu uma classe rara na roleta' },
  sacrificado: { nome: '🩸 Sangue Oferecido', desc: 'Fez um sacrifício ao Deus' },
  servo_liberto: { nome: '⛓️ Servo Liberto', desc: 'Se libertou do controle Necromante' },
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
};

// ── HP/DANO DE MONSTROS POR TIER ──────────────────────────
const MONSTROS_HP = {
  1: [30, 60],
  2: [60, 120],
  3: [120, 220],
  4: [220, 380],
  5: [380, 600],
  6: [600, 950],
  7: [950, 1500]
};

const MONSTROS_DANO = {
  1: [5, 15],
  2: [12, 28],
  3: [25, 50],
  4: [45, 85],
  5: [80, 130],
  6: [120, 190],
  7: [180, 280]
};

module.exports = {
  CLASSES, CLASSES_NORMAIS, CLASSES_RARAS,
  REGIOES, ARMAS, ARMAS_PRIMORDIAIS,
  ITENS_LOJA, CONQUISTAS, TITULOS, RANKS,
  MONSTROS_HP, MONSTROS_DANO
};
