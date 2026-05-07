// ============================================================
// IMPERIUS RPG — SISTEMA DE PETS E ANIMAIS v3.0
// ============================================================
const { getJogador, salvarJogador, adicionarConquista, adicionarTitulo } = require('./db');
const { PETS, OVOS, ANIMAIS } = require('./gameData');

const BORDAS = {
  topo: '╔═★·°·❃·°·★·°·❃·°·★═╗',
  meio: '╠══════════════════╣',
  baixo: '╚═★·°·❃·°·★·°·❃·°·★═╝',
  linha: '╔══════════════════╗',
  fim: '╚══════════════════╝'
};

// ── LOJA DE OVOS ─────────────────────────────────────────
function verLojaOvos() {
  let texto = `${BORDAS.topo}\n     🥚 LOJA DE OVOS 🥚\n${BORDAS.baixo}\n\n`;
  texto += `${BORDAS.linha}\n`;
  OVOS.forEach((ovo, i) => {
    texto += `║ ${i+1}️⃣ ${ovo.nome}\n`;
    texto += `║    💰 ${ovo.preco} moedas\n`;
    texto += `║    📜 ${ovo.descricao}\n`;
    texto += `║    ⭐ Raridade base: ${ovo.raridade_base}\n`;
    if (i < OVOS.length - 1) texto += `${BORDAS.meio}\n`;
  });
  texto += `${BORDAS.fim}\n\n_Use /comprar [nome do ovo] para comprar!_`;
  return texto;
}

// ── CHOCAR OVO ────────────────────────────────────────────
function chocarOvo(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: `${BORDAS.topo}\n❌ Personagem não encontrado!\n${BORDAS.baixo}` };
  if (!j.ovos || j.ovos.length === 0) return { erro: `${BORDAS.topo}\n❌ Você não tem ovos!\nCompre na /lojapets\n${BORDAS.baixo}` };
  if (j.pet) return { erro: `${BORDAS.topo}\n❌ Você já tem um pet!\nSolte-o primeiro com /soltarpet\n${BORDAS.baixo}` };

  const ovo = j.ovos.shift();
  const ovo_dados = OVOS.find(o => o.id === ovo.id);

  // Sortear pet com base na raridade do ovo
  const roll = Math.random() * 100;
  let pet_sorteado;

  if (roll < ovo_dados.chance_raro) {
    const pets_raros = PETS.filter(p => p.raridade.includes('Lendário') || p.raridade.includes('Primordial'));
    pet_sorteado = pets_raros[Math.floor(Math.random() * pets_raros.length)];
  } else if (roll < ovo_dados.chance_raro + 30) {
    const pets_epicos = PETS.filter(p => p.raridade.includes('Épico'));
    pet_sorteado = pets_epicos[Math.floor(Math.random() * pets_epicos.length)] || PETS[0];
  } else {
    const pets_comuns = PETS.filter(p => p.raridade.includes('Comum') || p.raridade.includes('Raro'));
    pet_sorteado = pets_comuns[Math.floor(Math.random() * pets_comuns.length)] || PETS[0];
  }

  j.pet = {
    id: pet_sorteado.id,
    nome: pet_sorteado.nome,
    raridade: pet_sorteado.raridade,
    hp: pet_sorteado.hp,
    hp_max: pet_sorteado.hp,
    dano: pet_sorteado.dano,
    habilidade: pet_sorteado.habilidade,
    nivel: 1,
    xp: 0
  };

  salvarJogador(jogador_id, j);

  adicionarConquista(jogador_id, 'primeiro_ovo');
  if (pet_sorteado.raridade.includes('Lendário')) adicionarConquista(jogador_id, 'pet_lendario');

  return {
    texto: `${BORDAS.topo}\n     🥚 OVO CHOCANDO! 🥚\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ O ovo começa a rachar...\n║ Uma luz brilha de dentro...\n${BORDAS.meio}\n║ ✨ NASCEU!\n║\n║ ${pet_sorteado.nome}\n║ Raridade: ${pet_sorteado.raridade}\n║ ❤️ HP: ${pet_sorteado.hp}\n║ ⚔️ Dano: ${pet_sorteado.dano[0]}-${pet_sorteado.dano[1]}\n║ 🎯 Hab: ${pet_sorteado.habilidade}\n║\n║ 📜 ${pet_sorteado.descricao}\n${BORDAS.fim}\n\n_Seu pet está pronto para batalhar!_`
  };
}

// ── VER PET ───────────────────────────────────────────────
function verPet(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `${BORDAS.topo}\n❌ Personagem não encontrado!\n${BORDAS.baixo}`;
  if (!j.pet) return `${BORDAS.topo}\n❌ Você não tem um pet!\n🥚 Compre um ovo na /lojapets\n${BORDAS.baixo}`;

  const pet = j.pet;
  const hp_pct = Math.floor((pet.hp / pet.hp_max) * 10);
  const barra = '█'.repeat(hp_pct) + '░'.repeat(10 - hp_pct);

  return `${BORDAS.topo}\n     🐾 SEU PET 🐾\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${pet.nome}\n║ Raridade: ${pet.raridade}\n${BORDAS.meio}\n║ ❤️ HP: ${pet.hp}/${pet.hp_max}\n║ [${barra}]\n║ ⚔️ Dano: ${pet.dano[0]}-${pet.dano[1]}\n║ 🎯 Hab: ${pet.habilidade}\n║ ⭐ Nível: ${pet.nivel || 1}\n${BORDAS.fim}`;
}

// ── CHAMAR PET ────────────────────────────────────────────
function chamarPet(jogador_id, tipo_batalha = 'monstro') {
  const j = getJogador(jogador_id);
  if (!j) return { erro: `❌ Personagem não encontrado!` };
  if (!j.pet) return { erro: `${BORDAS.topo}\n❌ Você não tem um pet!\n🥚 Compre um ovo na /lojapets\n${BORDAS.baixo}` };
  if (j.pet.hp <= 0) return { erro: `${BORDAS.topo}\n❌ Seu pet está sem HP!\nUse /curatpet para curar\n${BORDAS.baixo}` };

  const nivel_min_pet = 10;
  if ((j.nivel || 1) < nivel_min_pet) {
    return { erro: `${BORDAS.topo}\n❌ Nível insuficiente!\nVocê precisa ser nível ${nivel_min_pet}+\npara chamar seu pet em batalha!\n${BORDAS.baixo}` };
  }

  const pet = j.pet;
  const dano_pet = Math.floor(Math.random() * (pet.dano[1] - pet.dano[0] + 1)) + pet.dano[0];

  let msg_especial = '';
  if (tipo_batalha === 'deus') {
    msg_especial = `_O Deus ergue uma sobrancelha..._\n_"Interessante criatura..."_`;
  }

  return {
    dano: dano_pet,
    texto: `${BORDAS.topo}\n   🐾 PET ENTRA NA BATALHA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${pet.nome} ataca!\n║ 🎯 ${pet.habilidade}!\n║ 💥 Dano: ${dano_pet}\n${msg_especial ? `${BORDAS.meio}\n║ ${msg_especial}\n` : ''}${BORDAS.fim}`
  };
}

// ── SOLTAR PET ────────────────────────────────────────────
function soltarPet(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Personagem não encontrado!`;
  if (!j.pet) return `${BORDAS.topo}\n❌ Você não tem um pet!\n${BORDAS.baixo}`;

  const nome_pet = j.pet.nome;
  j.pet = null;
  salvarJogador(jogador_id, j);

  return `${BORDAS.topo}\n   🐾 PET SOLTO\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${nome_pet} foi solto.\n║ _Ele olha para trás uma última vez..._\n║ _e desaparece no horizonte._\n${BORDAS.fim}`;
}

// ── CURAR PET ─────────────────────────────────────────────
function curarPet(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Personagem não encontrado!`;
  if (!j.pet) return `❌ Você não tem um pet!`;

  const custo = 200;
  if (j.moedas < custo) return `${BORDAS.topo}\n❌ Você precisa de ${custo} moedas!\nVocê tem: ${j.moedas}\n${BORDAS.baixo}`;

  j.moedas -= custo;
  j.pet.hp = j.pet.hp_max;
  salvarJogador(jogador_id, j);

  return `${BORDAS.topo}\n   🐾 PET CURADO!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${j.pet.nome} foi curado!\n║ ❤️ HP: ${j.pet.hp_max}/${j.pet.hp_max}\n║ 💰 Custo: ${custo} moedas\n${BORDAS.fim}`;
}

// ── ADOTAR ANIMAL ─────────────────────────────────────────
function verAnimais() {
  let texto = `${BORDAS.topo}\n     🦁 ANIMAIS 🦁\n${BORDAS.baixo}\n\n${BORDAS.linha}\n`;
  ANIMAIS.forEach((animal, i) => {
    texto += `║ ${animal.nome}\n║    💰 ${animal.preco} moedas\n║    📜 ${animal.descricao}\n`;
    if (i < ANIMAIS.length - 1) texto += `${BORDAS.meio}\n`;
  });
  texto += `${BORDAS.fim}\n\n_Use /adotar [nome] para adotar!_`;
  return texto;
}

function adotarAnimal(jogador_id, nome_animal) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Personagem não encontrado!`;
  if (j.animal) return `${BORDAS.topo}\n❌ Você já tem um animal!\nSolte-o com /soltaranimal\n${BORDAS.baixo}`;

  const animal = ANIMAIS.find(a =>
    a.nome.toLowerCase().includes(nome_animal.toLowerCase()) ||
    a.id.toLowerCase().includes(nome_animal.toLowerCase())
  );

  if (!animal) return `${BORDAS.topo}\n❌ Animal não encontrado!\nUse /animais para ver a lista\n${BORDAS.baixo}`;
  if (j.moedas < animal.preco) return `${BORDAS.topo}\n❌ Moedas insuficientes!\nPrecisa: ${animal.preco}\nVocê tem: ${j.moedas}\n${BORDAS.baixo}`;

  j.moedas -= animal.preco;
  j.animal = { id: animal.id, nome: animal.nome, descricao: animal.descricao };
  salvarJogador(jogador_id, j);

  adicionarConquista(jogador_id, 'primeiro_animal');

  return `${BORDAS.topo}\n   🦁 ANIMAL ADOTADO!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${animal.nome} é seu agora!\n║ 📜 ${animal.descricao}\n║ 💰 Gasto: ${animal.preco} moedas\n${BORDAS.fim}`;
}

function soltarAnimal(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Personagem não encontrado!`;
  if (!j.animal) return `❌ Você não tem um animal!`;

  const nome = j.animal.nome;
  j.animal = null;
  salvarJogador(jogador_id, j);

  return `${BORDAS.topo}\n   🦁 ANIMAL SOLTO\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${nome} foi solto.\n║ _Que viva livre no mundo..._\n${BORDAS.fim}`;
}

function verMeuAnimal(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Personagem não encontrado!`;
  if (!j.animal) return `${BORDAS.topo}\n❌ Você não tem um animal!\n/animais para ver disponíveis\n${BORDAS.baixo}`;

  return `${BORDAS.topo}\n     🦁 SEU ANIMAL 🦁\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${j.animal.nome}\n║ 📜 ${j.animal.descricao}\n${BORDAS.fim}`;
}

module.exports = {
  verLojaOvos, chocarOvo, verPet, chamarPet,
  soltarPet, curarPet, verAnimais, adotarAnimal,
  soltarAnimal, verMeuAnimal
};
