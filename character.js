// ============================================================
// IMPERIUS RPG — PERSONAGEM, CLASSES E ROLETA
// ============================================================
const { criarJogador, getJogador, salvarJogador, adicionarConquista, adicionarTitulo } = require('./db');
const { CLASSES, CLASSES_NORMAIS, CLASSES_RARAS, REGIOES, ARMAS, TITULOS } = require('./gameData');
// ── MENU DE CLASSES ────────────────────────────────────────
function menuClasses() {
  let texto = `⚔️ *IMPERIUS RPG* ⚔️\n━━━━━━━━━━━━━━━━━━━━\n\n🌟 *BEM-VINDO, AVENTUREIRO!*\n_Antes de entrar neste mundo..._\n_você precisa escolher seu destino._\n\n━━━━━━━━━━━━━━━━━━━━\n\n🎭 *ESCOLHA SUA CLASSE:*\n\n`;

  const lista = CLASSES_NORMAIS.map((key, i) => {
    const c = CLASSES[key];
    return [String(i + 1), key, c.nome, c.passiva];
  });

  lista.forEach(([num, , nome, passiva]) => {
    texto += `*${num}.* ${nome}\n   _${passiva}_\n\n`;
  });

  texto += `━━━━━━━━━━━━━━━━━━━━\n🎰 *Quer tentar a sorte?*\n   _Digite /roleta para uma classe rara!_\n━━━━━━━━━━━━━━━━━━━━\n_Digite o número ou nome da classe:_`;
  return { texto, lista };
}

function getClasseKey(input) {
  const num = parseInt(input);
  if (!isNaN(num) && num >= 1 && num <= CLASSES_NORMAIS.length) {
    return CLASSES_NORMAIS[num - 1];
  }
  return CLASSES_NORMAIS.find(k =>
    k.toLowerCase().includes(input.toLowerCase()) ||
    CLASSES[k].nome.toLowerCase().includes(input.toLowerCase())
  ) || null;
}

// ── ROLETA ─────────────────────────────────────────────────
function podeUsarRoleta(jogador) {
  const cooldown = 24 * 60 * 60 * 1000; // 24h
  return Date.now() - (jogador.cooldown_roleta || 0) >= cooldown;
}

function girarRoleta(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return { erro: '❌ Personagem não encontrado.' };
  if (jogador.morto) return { erro: '💀 Mortos não giram a roleta.' };

  if (!podeUsarRoleta(jogador)) {
    const restante = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - jogador.cooldown_roleta)) / 3600000);
    return { erro: `⏳ Você já girou a roleta hoje! Aguarde *${restante}h* para girar novamente.` };
  }

  // Sortear classe rara
  const classe_key = CLASSES_RARAS[Math.floor(Math.random() * CLASSES_RARAS.length)];
  const classeData = CLASSES[classe_key];

  // Aplicar classe
  const classeAnterior = jogador.classe;
  jogador.classe = classe_key;
  jogador.hp = classeData.hp;
  jogador.hp_max = classeData.hp;
  jogador.mana = classeData.mana;
  jogador.mana_max = classeData.mana;
  jogador.for = classeData.for;
  jogador.des = classeData.des;
  jogador.con = classeData.con;
  jogador.int = classeData.int;
  jogador.poder_especial = classeData.poder_especial;
  jogador.ressurreicao_usada = false;
  jogador.tem_dragao = classe_key === 'dragomante';
  jogador.cooldown_roleta = Date.now();

  salvarJogador(jogador_id, jogador);
  adicionarConquista(jogador_id, 'roleta_rara');
  adicionarTitulo(jogador_id, 'agraciado');

  return {
    classe_key,
    classeData,
    classeAnterior,
    texto: `🎰 *GIRANDO A ROLETA DO DESTINO...*\n━━━━━━━━━━━━━━━━━━━━\n\n⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛\n_Consultando os deuses..._\n\n🔮 *Girando...*\n⚡ *Acelerando...*\n💫 *O destino escolhe...*\n🌀 *Quase...*\n\n━━━━━━━━━━━━━━━━━━━━\n\n✨ *O DESTINO FALOU...* ✨\n\n━━━━━━━━━━━━━━━━━━━━\n\n${classeData.nome}\n_"${classeData.lore}"_\n\n━━━━━━━━━━━━━━━━━━━━\n\n💀 *PODER EXCLUSIVO:*\n${classeData.poder_especial}\n\n━━━━━━━━━━━━━━━━━━━━\n⚠️ _Sua classe anterior (${CLASSES[classeAnterior]?.nome || classeAnterior}) foi destruída._\n_Bem-vindo ao seu novo destino._\n⚔️ _Evolua ou morra._`
  };
}

// ── FICHA DO PERSONAGEM ────────────────────────────────────
function gerarBarra(atual, maximo) {
  const pct = Math.max(0, Math.min(1, atual / (maximo || 1)));
  const total = 10;
  const cheios = Math.round(pct * total);
  return `[${'█'.repeat(cheios)}${'░'.repeat(total - cheios)}] ${Math.round(pct * 100)}%`;
}

function gerarFicha(jogador) {
  const classeData = CLASSES[jogador.classe];
  const armaData = ARMAS.find(a => a.id === jogador.arma);
  const regiao = REGIOES[jogador.regiao];
  const titulo = jogador.titulo_ativo ? TITULOS[jogador.titulo_ativo] || jogador.titulo_ativo : 'Sem título';
  const eh_rara = jogador.poder_especial ? true : false;

  const barra_hp = gerarBarra(jogador.hp_max, jogador.hp);
  const barra_mana = gerarBarra(jogador.mana || 0, classeData?.mana || 100);

  return `
╔══════════════════════╗
   ⚔️ *IMPERIUS RPG* ⚔️
╚══════════════════════╝

👤 *${jogador.nome}*
🏷️ _${titulo}_
🎭 Classe: *${classeData?.nome || jogador.classe}*${eh_rara ? ' 🎰' : ''}
⭐ Rank: *${jogador.rank}* | 📚 XP: *${jogador.xp}*

❤️ HP: *${jogador.hp_max}/${jogador.hp}*
${barra_hp}
💧 Mana: *${jogador.mana || 0}/${classeData?.mana || 100}*
${barra_mana}

📊 *ATRIBUTOS*
💪 FOR: *${jogador.for}* | 🐆 DES: *${jogador.des}*
🛡️ CON: *${jogador.con}* | 🧠 INT: *${jogador.int}*
🍀 Sorte: *${jogador.sorte}* | ✝️ Fé: *${jogador.fe}*

⚔️ Arma: *${armaData?.nome || 'Nenhuma'}*
${armaData ? `   Dano: ${armaData.dano[0]}-${armaData.dano[1]} | ${armaData.raridade}` : ''}
🐾 Pet: *${jogador.pet || (jogador.tem_dragao ? '🐉 Dragão (Dragomante)' : 'Nenhum')}*

🗺️ Região: *${regiao?.nome || jogador.regiao}*
💰 Moedas: *${jogador.moedas}*
💀 Kills: *${jogador.kills || 0}* | Mortes: *${jogador.mortes || 0}*
🏆 Conquistas: *${(jogador.conquistas || []).length}*

${jogador.poder_especial ? `\n⚡ *PODER ESPECIAL:*\n_${jogador.poder_especial}_\n` : ''}
${jogador.morto ? '💀 *STATUS: MORTO*' : '✅ *STATUS: VIVO*'}
${jogador.servo_de ? `⛓️ *SERVO DE:* ${jogador.servo_de}` : ''}
${jogador.encarnando ? '🌟 *[DEUS ENCARNADO]*' : ''}
`.trim();
}

// ── VIAJAR ────────────────────────────────────────────────
function viajar(jogador_id, destino) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (jogador.morto) return '💀 Mortos não viajam.';

  const regiao_key = Object.keys(REGIOES).find(k =>
    k.toLowerCase().includes(destino.toLowerCase()) ||
    REGIOES[k].nome.toLowerCase().includes(destino.toLowerCase())
  );

  if (!regiao_key) return `❌ Região *${destino}* não encontrada. Use */mapa* para ver as regiões.`;

  const regiao = REGIOES[regiao_key];
  const nivel_estimado = Math.floor((jogador.xp / 1000) + 1);

  if (nivel_estimado < regiao.nivel[0] * 0.5) {
    return `⚠️ *${regiao.nome}* é perigosa demais para você agora!\n━━━━━━━━━━\n📊 Seu nível estimado: *${nivel_estimado}*\n⭐ Nível recomendado: *${regiao.nivel[0]}-${regiao.nivel[1]}*\n━━━━━━━━━━\n_Ganhe mais XP batalhando (/batalha) antes de tentar viajar para cá._`;
  }

  jogador.regiao = regiao_key;
  if (!jogador.regioes_visitadas) jogador.regioes_visitadas = [];
  if (!jogador.regioes_visitadas.includes(regiao_key)) {
    jogador.regioes_visitadas.push(regiao_key);
    if (jogador.regioes_visitadas.length >= Object.keys(REGIOES).length) {
      adicionarConquista(jogador_id, 'viajante');
    }
  }

  salvarJogador(jogador_id, jogador);

  return `🗺️ Você viajou para *${regiao.nome}*!\n\n⚠️ Nível recomendado: *${regiao.nivel[0]}-${regiao.nivel[1]}*\n👾 Inimigos: _${regiao.monstros.slice(0, 3).join(', ')}..._\n💀 Boss: *${regiao.boss}*`;
}

// ── VER CLASSE ─────────────────────────────────────────────
function verClasse(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  const classeData = CLASSES[jogador.classe];
  if (!classeData) return '❌ Classe inválida.';

  let texto = `🎭 *${classeData.nome}*\n\n`;
  if (classeData.lore) texto += `📖 _"${classeData.lore}"_\n\n`;
  texto += `🛡️ Passiva: _${classeData.passiva}_\n`;
  if (classeData.poder_especial) texto += `\n⚡ *PODER EXCLUSIVO:*\n_${classeData.poder_especial}_\n`;
  texto += `\n⚔️ *HABILIDADES:*\n`;

  Object.values(classeData.habilidades).forEach(hab => {
    texto += `\n• *${hab.nome}* — Custo: ${hab.custo} mana\n`;
    if (hab.efeito) texto += `  Efeito: _${hab.efeito}_\n`;
  });

  texto += `\n🌟 *ULTIMATE: ${classeData.ultimate.nome}*\n`;
  texto += `   Custo: ${classeData.ultimate.custo} mana | Cooldown: ${classeData.ultimate.cooldown} min\n`;
  texto += `   Efeito: _${classeData.ultimate.efeito}_\n`;
  return texto;
}

// ── MAPA ──────────────────────────────────────────────────
function verMapa() {
  let texto = `🗺️ *MAPA DO IMPERIUS* 🗺️\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  Object.entries(REGIOES).forEach(([key, r]) => {
    texto += `${r.nome} — Nível ${r.nivel[0]}-${r.nivel[1]}\n`;
  });
  texto += `\n📝 Use */viajar [nome da região]* para viajar`;
  return texto;
}

function verRegioes() {
  let texto = `📖 *REGIÕES DO IMPERIUS*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  Object.entries(REGIOES).forEach(([key, r]) => {
    texto += `${r.nome}\n`;
    texto += `   Nível: ${r.nivel[0]}-${r.nivel[1]} | Boss: ${r.boss}\n\n`;
  });
  return texto;
}

module.exports = {
  menuClasses, getClasseKey, girarRoleta, podeUsarRoleta,
  gerarFicha, verClasse, viajar, verMapa, verRegioes
};
