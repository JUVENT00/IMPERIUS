// ============================================================
// IMPERIUS RPG — MORTE E RESSURREIÇÃO
// ============================================================
const { getJogador, salvarJogador, adicionarConquista, adicionarTitulo, getPendente, setPendente, deletePendente } = require('./db');
const { CLASSES } = require('./gameData');

const COOLDOWN_SUICIDIO = 3 * 60 * 1000; // 3 minutos em ms

function suicidar(jogador_id) {
  const jogador = getJogador(jogador_id);
  if (!jogador) return '❌ Personagem não encontrado.';
  if (jogador.morto) return '❌ Você já está morto!';

  const agora = Date.now();
  const ultimo = jogador.ultimo_suicidio || 0;
  const restante = COOLDOWN_SUICIDIO - (agora - ultimo);

  if (restante > 0) {
    const min = Math.ceil(restante / 60000);
    return `⏳ Espere *${min} minuto(s)* para usar de novo.`;
  }

  const nome_antigo = jogador.nome;

  // ── ZERA TUDO — o personagem morre de vez, sem meio-termo ──
  jogador.morto = true;
  jogador.ultimo_suicidio = agora;
  jogador.hp = 0;
  jogador.hp_max = 0;
  jogador.mana = 0;
  jogador.mana_max = 0;
  jogador.xp = 0;
  jogador.nivel = 1;
  jogador.moedas = 0;
  jogador.inventario = [];
  jogador.arma = null;
  jogador.pet = null;
  jogador.animais = [];
  jogador.titulos = [];
  jogador.titulo_ativo = null;
  jogador.conquistas = [];
  jogador.kills = 0;
  jogador.mortes = (jogador.mortes || 0) + 1;
  jogador.servo_de = null;
  jogador.servo_de_id = null;
  jogador.status_negativos = [];
  jogador.status_positivos = [];
  jogador.regiao = 'valdris';

  salvarJogador(jogador_id, jogador);

  return `💀 *${nome_antigo}* tirou a própria vida.\n\n_Tudo que ele possuía se foi junto._\n\nUse /criar para recomeçar do zero.`;
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

module.exports = { suicidar, reviverPorNecromante, aprovarAcaoServo, registrarAcaoServo, liberarServo };
