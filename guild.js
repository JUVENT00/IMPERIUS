// ============================================================
// IMPERIUS RPG — SISTEMA DE GUILDAS v3.0
// ============================================================
const { getJogador, salvarJogador, getGuilda, setGuilda, deleteGuilda, todasGuildas } = require('./db');

const BORDAS = {
  topo: '╔═★·°·❃·°·★·°·❃·°·★═╗',
  meio: '╠══════════════════╣',
  baixo: '╚═★·°·❃·°·★·°·❃·°·★═╝',
  linha: '╔══════════════════╗',
  fim: '╚══════════════════╝'
};

function criarGuilda(jogador_id, nome_guilda) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Você não tem personagem!`;
  if (j.guilda_id) return `${BORDAS.topo}\n❌ Você já está em uma guilda!\nSaia com /sairguilda primeiro.\n${BORDAS.baixo}`;
  if (!nome_guilda) return `❌ Use: /criarguilda [nome]`;
  if (nome_guilda.length > 20) return `❌ Nome muito longo! Máximo 20 caracteres.`;

  const custo = 5000;
  if (j.moedas < custo) return `${BORDAS.topo}\n❌ Criar guilda custa ${custo} moedas!\nVocê tem: ${j.moedas}\n${BORDAS.baixo}`;

  const guilda_id = `guilda_${Date.now()}`;
  const guilda = {
    id: guilda_id,
    nome: nome_guilda,
    lider_id: jogador_id,
    lider_nome: j.nome,
    membros: [{ id: jogador_id, nome: j.nome, cargo: 'Líder' }],
    nivel: 1,
    xp: 0,
    criada_em: new Date().toISOString(),
    descricao: 'Uma nova guilda no IMPERIUS.'
  };

  j.moedas -= custo;
  j.guilda_id = guilda_id;
  salvarJogador(jogador_id, j);
  setGuilda(guilda_id, guilda);

  return `${BORDAS.topo}\n   ⚔️ GUILDA CRIADA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ⚔️ ${nome_guilda}\n║ 👑 Líder: ${j.nome}\n║ 👥 Membros: 1\n║ ⭐ Nível: 1\n${BORDAS.meio}\n║ 💰 Custo: ${custo} moedas\n║\n║ Convide membros com:\n║ /convidar @jogador\n${BORDAS.fim}`;
}

function verGuilda(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Você não tem personagem!`;
  if (!j.guilda_id) return `${BORDAS.topo}\n❌ Você não está em uma guilda!\nCrie com /criarguilda [nome]\n${BORDAS.baixo}`;

  const guilda = getGuilda(j.guilda_id);
  if (!guilda) return `❌ Guilda não encontrada!`;

  const membros_lista = guilda.membros.map(m => `║ ${m.cargo === 'Líder' ? '👑' : '⚔️'} ${m.nome}`).join('\n');

  return `${BORDAS.topo}\n   ⚔️ ${guilda.nome} ⚔️\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ 👑 Líder: ${guilda.lider_nome}\n║ ⭐ Nível: ${guilda.nivel}\n║ 👥 Membros: ${guilda.membros.length}\n${BORDAS.meio}\n║ 👥 MEMBROS:\n${membros_lista}\n${BORDAS.fim}`;
}

function convidarGuilda(lider_id, alvo_id) {
  const lider = getJogador(lider_id);
  if (!lider || !lider.guilda_id) return `❌ Você não está em uma guilda!`;

  const guilda = getGuilda(lider.guilda_id);
  if (!guilda || guilda.lider_id !== lider_id) return `❌ Apenas o líder pode convidar!`;

  const alvo = getJogador(alvo_id);
  if (!alvo) return `❌ Jogador não encontrado!`;
  if (alvo.guilda_id) return `❌ ${alvo.nome} já está em uma guilda!`;

  return {
    msg_lider: `${BORDAS.topo}\n✅ Convite enviado para ${alvo.nome}!\n${BORDAS.baixo}`,
    msg_alvo: `${BORDAS.topo}\n   ⚔️ CONVITE DE GUILDA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ ${lider.nome} te convidou\n║ para a guilda:\n║ ⚔️ ${guilda.nome}\n║ ⭐ Nível: ${guilda.nivel}\n║ 👥 Membros: ${guilda.membros.length}\n${BORDAS.meio}\n║ ✅ /aceitarguilda\n║ ❌ /recusarguilda\n${BORDAS.fim}`,
    guilda_id: guilda.id,
    guilda_nome: guilda.nome
  };
}

function aceitarGuilda(jogador_id, guilda_id, guilda_nome) {
  const j = getJogador(jogador_id);
  if (!j) return `❌ Personagem não encontrado!`;
  if (j.guilda_id) return `❌ Você já está em uma guilda!`;

  const guilda = getGuilda(guilda_id);
  if (!guilda) return `❌ Guilda não encontrada!`;

  guilda.membros.push({ id: jogador_id, nome: j.nome, cargo: 'Membro' });
  j.guilda_id = guilda_id;
  salvarJogador(jogador_id, j);
  setGuilda(guilda_id, guilda);

  return `${BORDAS.topo}\n   ⚔️ ENTROU NA GUILDA!\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ Bem-vindo à ${guilda.nome}!\n║ 👥 Membros: ${guilda.membros.length}\n${BORDAS.fim}`;
}

function sairGuilda(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j || !j.guilda_id) return `❌ Você não está em uma guilda!`;

  const guilda = getGuilda(j.guilda_id);
  if (!guilda) { j.guilda_id = null; salvarJogador(jogador_id, j); return `❌ Guilda não encontrada.`; }

  if (guilda.lider_id === jogador_id && guilda.membros.length > 1) {
    return `${BORDAS.topo}\n❌ Você é o líder!\nTransfira a liderança primeiro\nou expulse todos os membros.\n${BORDAS.baixo}`;
  }

  guilda.membros = guilda.membros.filter(m => m.id !== jogador_id);
  if (guilda.membros.length === 0) {
    deleteGuilda(guilda.id);
  } else {
    setGuilda(guilda.id, guilda);
  }

  j.guilda_id = null;
  salvarJogador(jogador_id, j);

  return `${BORDAS.topo}\n   ⚔️ SAIU DA GUILDA\n${BORDAS.baixo}\n\n${BORDAS.linha}\n║ Você saiu de ${guilda.nome}.\n${BORDAS.fim}`;
}

function rankingGuildas() {
  const guildas = todasGuildas().sort((a, b) => b.nivel - a.nivel || b.membros.length - a.membros.length).slice(0, 10);
  if (guildas.length === 0) return `${BORDAS.topo}\n❌ Nenhuma guilda criada ainda!\n${BORDAS.baixo}`;

  let texto = `${BORDAS.topo}\n   ⚔️ RANKING GUILDAS ⚔️\n${BORDAS.baixo}\n\n${BORDAS.linha}\n`;
  guildas.forEach((g, i) => {
    texto += `║ ${i+1}. ${g.nome}\n║    👑 ${g.lider_nome} | ⭐ Nv.${g.nivel} | 👥 ${g.membros.length}\n`;
  });
  texto += `${BORDAS.fim}`;
  return texto;
}

module.exports = { criarGuilda, verGuilda, convidarGuilda, aceitarGuilda, sairGuilda, rankingGuildas };
