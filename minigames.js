// ============================================================
// IMPERIUS — MINIGAMES (categoria separada do RPG principal)
// ============================================================
const { getJogador, adicionarMoedas, formatarPreco } = require('./db');

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ── JOGO DA VELHA (1x1) ──────────────────────────────────────
function novoJogoVelha(jogador1_id, jogador2_id) {
  return {
    tabuleiro: Array(9).fill(null),
    jogadores: { X: jogador1_id, O: jogador2_id },
    vez: 'X',
    inicio: Date.now(),
  };
}

function tabuleiroVelhaTexto(jogo) {
  const simbolo = (v) => v === 'X' ? '❌' : v === 'O' ? '⭕' : '▪️';
  const linhas = [];
  for (let i = 0; i < 3; i++) {
    linhas.push(jogo.tabuleiro.slice(i * 3, i * 3 + 3).map(simbolo).join(''));
  }
  const posicoes = [];
  for (let i = 0; i < 3; i++) {
    posicoes.push(jogo.tabuleiro.slice(i * 3, i * 3 + 3).map((v, idx) => v ? simbolo(v) : `${i * 3 + idx + 1}️⃣`).join(''));
  }
  return posicoes.join('\n');
}

const LINHAS_VITORIA = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checarVitoriaVelha(tabuleiro) {
  for (const [a,b,c] of LINHAS_VITORIA) {
    if (tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[b] === tabuleiro[c]) return tabuleiro[a];
  }
  if (tabuleiro.every(v => v)) return 'empate';
  return null;
}

function jogarVelha(jogo, jogador_id, posicao) {
  const simboloJogador = jogo.jogadores.X === jogador_id ? 'X' : jogo.jogadores.O === jogador_id ? 'O' : null;
  if (!simboloJogador) return { erro: '❌ Você não faz parte dessa partida!' };
  if (jogo.vez !== simboloJogador) return { erro: '❌ Não é sua vez!' };
  if (posicao < 1 || posicao > 9) return { erro: '❌ Escolha uma posição de 1 a 9!' };
  if (jogo.tabuleiro[posicao - 1]) return { erro: '❌ Essa posição já está ocupada!' };

  jogo.tabuleiro[posicao - 1] = simboloJogador;
  const resultado = checarVitoriaVelha(jogo.tabuleiro);
  jogo.vez = jogo.vez === 'X' ? 'O' : 'X';

  return { sucesso: true, resultado, jogo };
}

// ── JOGO DA MEMÓRIA (solo) ───────────────────────────────────
const EMOJIS_MEMORIA = ['🍎','🍌','🍇','🍒','🍉','🥝','🍑','🍊'];

function novoJogoMemoria(pares = 6) {
  pares = Math.min(pares, EMOJIS_MEMORIA.length);
  const cartas = EMOJIS_MEMORIA.slice(0, pares).flatMap(e => [e, e]);
  for (let i = cartas.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
  }
  return {
    cartas,
    reveladas: Array(cartas.length).fill(false),
    viradaAtual: null, // índice da primeira carta virada nessa jogada
    tentativas: 0,
    acertos: 0,
    inicio: Date.now(),
  };
}

function tabuleiroMemoriaTexto(jogo, mostrarTudo = false) {
  const linhas = [];
  const porLinha = 4;
  for (let i = 0; i < jogo.cartas.length; i += porLinha) {
    const linha = jogo.cartas.slice(i, i + porLinha).map((c, idx) => {
      const pos = i + idx;
      if (mostrarTudo || jogo.reveladas[pos]) return c;
      return `${pos + 1}️⃣`;
    });
    linhas.push(linha.join(' '));
  }
  return linhas.join('\n');
}

function virarCartaMemoria(jogo, posicao) {
  if (posicao < 1 || posicao > jogo.cartas.length) return { erro: '❌ Posição inválida!' };
  const idx = posicao - 1;
  if (jogo.reveladas[idx]) return { erro: '❌ Essa carta já foi revelada!' };

  if (jogo.viradaAtual === null) {
    jogo.viradaAtual = idx;
    return { sucesso: true, primeiraCartas: true, jogo };
  }

  const primeiraIdx = jogo.viradaAtual;
  jogo.viradaAtual = null;
  jogo.tentativas++;

  if (jogo.cartas[primeiraIdx] === jogo.cartas[idx]) {
    jogo.reveladas[primeiraIdx] = true;
    jogo.reveladas[idx] = true;
    jogo.acertos++;
    const completo = jogo.reveladas.every(r => r);
    return { sucesso: true, par: true, completo, jogo };
  }

  return { sucesso: true, par: false, cartaAnterior: jogo.cartas[primeiraIdx], cartaAtual: jogo.cartas[idx], jogo };
}

// ── FORCA (solo, vs bot) ─────────────────────────────────────
const PALAVRAS_FORCA = [
  'ESPADA','DRAGAO','MASMORRA','GUERREIRO','FEITICEIRO','ARMADURA',
  'BATALHA','CAVALEIRO','VALDRIS','IMPERIUS','MONSTRO','BELARIUM',
  'GUILDA','TALENTO','PRESTIGIO','LENDARIO'
];

function novoJogoForca() {
  const palavra = PALAVRAS_FORCA[rand(0, PALAVRAS_FORCA.length - 1)];
  return {
    palavra,
    letrasCertas: [],
    letrasErradas: [],
    erros: 0,
    max_erros: 6,
    inicio: Date.now(),
  };
}

function palavraForcaTexto(jogo) {
  return jogo.palavra.split('').map(l => jogo.letrasCertas.includes(l) ? l : '_').join(' ');
}

function chutarLetraForca(jogo, letra) {
  letra = letra.toUpperCase().trim();
  if (!letra || letra.length !== 1) return { erro: '❌ Digite apenas uma letra!' };
  if (jogo.letrasCertas.includes(letra) || jogo.letrasErradas.includes(letra)) return { erro: '❌ Você já tentou essa letra!' };

  if (jogo.palavra.includes(letra)) {
    jogo.letrasCertas.push(letra);
    const venceu = jogo.palavra.split('').every(l => jogo.letrasCertas.includes(l));
    return { sucesso: true, acertou: true, venceu, jogo };
  }

  jogo.letrasErradas.push(letra);
  jogo.erros++;
  const perdeu = jogo.erros >= jogo.max_erros;
  return { sucesso: true, acertou: false, perdeu, jogo };
}

const BONECO_FORCA = [
  '😀', '😐 |', '😐/|', '😐/|\\', '😐/|\\\n  /', '😐/|\\\n  / \\', '💀 GAME OVER'
];

// ── CAÇA-NÍQUEL (solo) ───────────────────────────────────────
const SIMBOLOS_SLOT = ['🍒','🍋','🍇','⭐','💎','7️⃣'];
const MULTIPLICADORES_SLOT = { '🍒': 2, '🍋': 3, '🍇': 4, '⭐': 6, '💎': 10, '7️⃣': 20 };

function jogarCacaNiquel(aposta) {
  const resultado = [SIMBOLOS_SLOT[rand(0, 5)], SIMBOLOS_SLOT[rand(0, 5)], SIMBOLOS_SLOT[rand(0, 5)]];
  let ganho = 0;
  if (resultado[0] === resultado[1] && resultado[1] === resultado[2]) {
    ganho = aposta * MULTIPLICADORES_SLOT[resultado[0]];
  } else if (resultado[0] === resultado[1] || resultado[1] === resultado[2] || resultado[0] === resultado[2]) {
    ganho = Math.floor(aposta * 1.5);
  }
  return { resultado, ganho };
}

// ── PEDRA, PAPEL E TESOURA (solo vs bot) ─────────────────────
const OPCOES_PPT = { pedra: '🪨', papel: '📄', tesoura: '✂️' };
function jogarPPT(escolhaJogador) {
  escolhaJogador = escolhaJogador.toLowerCase().trim();
  if (!OPCOES_PPT[escolhaJogador]) return { erro: '❌ Escolha: pedra, papel ou tesoura!' };

  const opcoes = Object.keys(OPCOES_PPT);
  const escolhaBot = opcoes[rand(0, 2)];

  let resultado;
  if (escolhaJogador === escolhaBot) resultado = 'empate';
  else if (
    (escolhaJogador === 'pedra' && escolhaBot === 'tesoura') ||
    (escolhaJogador === 'papel' && escolhaBot === 'pedra') ||
    (escolhaJogador === 'tesoura' && escolhaBot === 'papel')
  ) resultado = 'vitoria';
  else resultado = 'derrota';

  return { escolhaJogador, escolhaBot, resultado };
}

// ── CARA OU COROA (1x1 com aposta) ────────────────────────────
function jogarCaraCoroa(chamada) {
  chamada = chamada.toLowerCase().trim();
  if (chamada !== 'cara' && chamada !== 'coroa') return { erro: '❌ Escolha: cara ou coroa!' };
  const resultado = Math.random() < 0.5 ? 'cara' : 'coroa';
  return { resultado, acertou: chamada === resultado };
}

// ── ADIVINHAÇÃO DE NÚMERO (solo) ─────────────────────────────
function novoJogoAdivinhacao(min = 1, max = 100) {
  return { numero: rand(min, max), min, max, tentativas: 0, max_tentativas: 7 };
}

function tentarAdivinhar(jogo, palpite) {
  if (isNaN(palpite)) return { erro: '❌ Digite um número válido!' };
  jogo.tentativas++;
  if (palpite === jogo.numero) return { sucesso: true, acertou: true, jogo };
  const dica = palpite < jogo.numero ? 'maior' : 'menor';
  const acabou = jogo.tentativas >= jogo.max_tentativas;
  return { sucesso: true, acertou: false, dica, acabou, jogo };
}

module.exports = {
  novoJogoVelha, tabuleiroVelhaTexto, jogarVelha,
  novoJogoMemoria, tabuleiroMemoriaTexto, virarCartaMemoria,
  novoJogoForca, palavraForcaTexto, chutarLetraForca, BONECO_FORCA,
  jogarCacaNiquel,
  jogarPPT,
  jogarCaraCoroa,
  novoJogoAdivinhacao, tentarAdivinhar,
};
