// ============================================================
// IMPERIUS RPG — MORTE E RESSURREIÇÃO
// ============================================================
const { getJogador, salvarJogador, adicionarConquista, adicionarTitulo, getPendente, setPendente, deletePendente } = require('./db');
const { CLASSES } = require('../data/gameData');

function renascer(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (!jogador.morto) return '❌ Você não está morto!';

  const classeData = CLASSES[jogador.classe];
  jogador.morto = false;
  jogador.hp_max = Math.floor((classeData?.hp || 100) * 0.5);
  jogador.mana = Math.floor((classeData?.mana || 100) * 0.5);
  jogador.servo_de = null;
  jogador.servo_de_id = null;
  jogador.status_negativos = [];
  jogador.status_positivos = [];
  jogador.inventario = [];
  jogador.arma = null;
  jogador.xp = Math.floor(jogador.xp * 0.7);
  jogador.moedas = Math.floor(jogador.moedas * 0.5);
  jogador.regiao = 'valdris';
  jogador.ressurreicao_usada = false;

  salvarJogador(jogador_id, jogador);

  return `☀️ *${jogador.nome} RENASCEU!*\n\n⚠️ Você perdeu:\n• 30% do XP\n• 50% das moedas\n• Todos os itens e arma\n\nVocê está de volta em *Valdris*.\n\n_Evolua ou morra._`;
}

function reviverPorNecromante(necromante_id, alvo_id) {
  const necromante = getJogador(necromante_id);
  const alvo = getJogador(alvo_id);

  if (!necromante) return '❌ Necromante não encontrado.';
  if (!alvo) return '❌ Jogador não encontrado.';
  if (necromante.classe !== 'necromante') return '❌ Apenas Necromantes podem ressuscitar.';
  if (necromante.morto) return '💀 O Necromante está morto.';
  if (!alvo.morto) return '❌ Este jogador não está morto.';

  const classeData = CLASSES[alvo.classe];
  alvo.morto = false;
  alvo.hp_max = Math.floor((classeData?.hp || 100) * 0.30);
  alvo.mana = 0;
  alvo.servo_de = necromante.nome;
  alvo.servo_de_id = necromante_id;
  alvo.status_negativos = ['amaldicado'];

  salvarJogador(alvo_id, alvo);

  return {
    para_necromante: `⚰️ Você ressuscitou *${alvo.nome}*!\n⛓️ Ele agora é seu SERVO.`,
    para_alvo: `⚰️ *${necromante.nome}* te ressuscitou!\n⛓️ Você é servo de *${necromante.nome}*.\nSuas ações precisam de aprovação.\n\n_Use /libertar para tentar se libertar._`
  };
}

function aprovarAcaoServo(necromante_id, alvo_id, aprovado) {
  const pedido = getPendente(alvo_id);
  if (!pedido) return '❌ Nenhuma ação pendente.';
  if (pedido.necromante_id !== necromante_id) return '❌ Você não é o mestre deste servo.';

  deletePendente(alvo_id);

  if (!aprovado) return { aprovado: false, para_servo: '❌ Seu mestre negou sua ação.' };

  return { aprovado: true, acao: pedido.acao, para_servo: `✅ Seu mestre aprovou: *${pedido.acao}*` };
}

function registrarAcaoServo(servo_id, acao) {
  const servo = getJogador(servo_id);
  if (!servo?.servo_de) return null;

  setPendente(servo_id, {
    acao,
    servo_nome: servo.nome,
    necromante_id: servo.servo_de_id,
    timestamp: Date.now()
  });

  return servo.servo_de_id;
}

function liberarServo(servo_id) {
  const servo = getJogador(servo_id);
  if (!servo) return '❌ Jogador não encontrado.';
  if (!servo.servo_de) return '❌ Você não é servo de ninguém.';

  const mestre = servo.servo_de;
  servo.servo_de = null;
  servo.servo_de_id = null;
  servo.status_negativos = (servo.status_negativos || []).filter(s => s !== 'amaldicado');

  salvarJogador(servo_id, servo);
  adicionarConquista(servo_id, 'servo_liberto');
  adicionarTitulo(servo_id, 'livre');

  return `🔓 *${servo.nome}* se libertou de *${mestre}*!\n🏆 Conquista: *Servo Liberto*`;
}

module.exports = { renascer, reviverPorNecromante, aprovarAcaoServo, registrarAcaoServo, liberarServo };
