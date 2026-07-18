// ============================================================
// IMPERIUS RPG — CHAT LIVRE (perguntas e respostas prontas)
// ============================================================
// Responde mensagens que citam "Imperius" em texto livre (sem precisar de /comando).
// Não usa nenhuma API paga — é tudo baseado em palavras-chave e respostas prontas.

function normalizar(t) {
  return (t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

// Detecta se a mensagem "chama" o Imperius
function mencionaImperius(texto) {
  const t = normalizar(texto);
  return /\bimperius\b/.test(t);
}

// Frases de saudação/abertura, sorteadas pra não ficar repetitivo
const SAUDACOES = [
  '_As sombras se movem quando meu nome é dito._\n\nFale, mortal. O que deseja saber sobre este mundo?',
  '_Sinto quando me chamam..._\n\nDiga o que precisa, e eu responderei.',
  'Estou sempre ouvindo. O que você busca no IMPERIUS?',
  '_Uma voz ecoa nas sombras..._\n\nPergunte, e talvez eu conceda uma resposta.'
];

// Base de perguntas prováveis → respostas prontas.
// Cada entrada tem: palavras-chave (qualquer uma ativa) e a resposta.
// A ordem importa: a primeira categoria que bater alguma palavra-chave é usada.
const BASE_RESPOSTAS = [
  {
    chaves: ['oi', 'ola', 'e ai', 'tudo bem', 'blz', 'beleza', 'salve'],
    resposta: () => SAUDACOES[Math.floor(Math.random() * SAUDACOES.length)]
  },
  {
    chaves: ['quem e voce', 'quem e vc', 'o que e voce', 'oque e voce', 'quem e imperius', 'o que e imperius', 'oque e imperius'],
    resposta: () => '_Eu sou o mundo. A voz por trás de cada batalha, cada escolha, cada queda._\n\nSou IMPERIUS — o reino que você está prestes a desafiar. Digite */menu* pra conhecer os comandos, ou pergunte sobre classes, batalhas, regiões e mais.'
  },
  {
    chaves: ['menu', 'comando', 'o que voce faz', 'oque voce faz', 'ajuda', 'como funciona', 'como jogo', 'como jogar'],
    resposta: () => '_Todo poder começa com uma escolha._\n\nUse */menu* ou */rpg* pra ver a lista completa de comandos. Se ainda não tem personagem, comece com */criar*.'
  },
  {
    chaves: ['classe', 'classes'],
    resposta: () => '_Cada classe é um caminho — e cada caminho, um destino diferente._\n\nExistem mais de 30 classes, entre comuns e raras. Use */classe* pra ver a sua depois de criar o personagem, ou */criar* se ainda não escolheu seu caminho.'
  },
  {
    chaves: ['criar personagem', 'criar meu personagem', 'como comeco', 'como comecar', 'quero jogar', 'quero criar'],
    resposta: () => '_Toda lenda começa com um primeiro passo._\n\nUse */criar* pra dar vida ao seu personagem. Você vai escolher nome, receberá uma classe, e sua jornada começa em Valdris.'
  },
  {
    chaves: ['batalha', 'batalhar', 'lutar', 'como luto', 'como batalho', 'monstro', 'caminhar'],
    resposta: () => '_O sangue é a moeda desse mundo._\n\nUse */batalha* (ou */caminhar*) pra enfrentar um monstro. Durante a luta, use */matar* pra atacar, */fugir* pra escapar, ou */habilidade [nome]* pra usar um poder de classe.'
  },
  {
    chaves: ['boss', 'chefe'],
    resposta: () => '_Alguns inimigos não perdoam erros._\n\nUse */boss* pra enfrentar o chefe da sua região. Eles são muito mais fortes que monstros comuns — considere chamar ajuda com */chamarajuda @amigo*.'
  },
  {
    chaves: ['loja', 'comprar', 'vender', 'moeda', 'belarium', 'dinheiro'],
    resposta: () => '_Tudo tem um preço, até a sobrevivência._\n\nUse */loja* pra ver o que está à venda, */comprar [nome]* pra comprar, e */vender [item]* pra trocar o que não precisa por belarium.'
  },
  {
    chaves: ['arma', 'equipar', 'espada', 'armadura'],
    resposta: () => '_Uma lâmina sem dono é só um pedaço de metal._\n\nUse */equipar [nome da arma]* ou */equiparmadura [nome]* pra equipar o que estiver no seu inventário. Veja o catálogo com */buscararma [nome]* ou */armaduras*.'
  },
  {
    chaves: ['nivel', 'subir de nivel', 'xp', 'experiencia'],
    resposta: () => '_Poder não é dado. É conquistado, golpe a golpe._\n\nVocê ganha XP batalhando, completando missões e explorando masmorras. Use */perfil* pra ver seu nível atual.'
  },
  {
    chaves: ['regiao', 'regioes', 'viajar', 'mapa', 'onde estou'],
    resposta: () => '_O mundo é vasto, e nem todo canto é seguro._\n\nUse */regioes* pra ver os lugares disponíveis e */viajar [nome]* pra se mudar. Use */mapa* pra ver visualmente.'
  },
  {
    chaves: ['masmorra', 'masmorras', 'dungeon'],
    resposta: () => '_Nas profundezas, tesouro e morte andam juntos._\n\nUse */masmorras* pra ver as disponíveis e */masmorra [nome]* pra entrar.'
  },
  {
    chaves: ['missao', 'missoes', 'diaria', 'diarias'],
    resposta: () => '_Até os pequenos feitos constroem lendas._\n\nUse */missoes* pra ver suas missões diárias e */coletarmissao [nome]* quando completar uma.'
  },
  {
    chaves: ['titulo', 'titulos', 'conquista', 'conquistas', 'ranking'],
    resposta: () => '_Alguns nomes ecoam mais alto que outros._\n\nUse */conquistas* pra ver as suas, */topconquistas* pro ranking geral, */titulos* pros que você já tem, e */usartitulo [nome]* pra equipar um.'
  },
  {
    chaves: ['pet', 'ovo', 'ovos', 'chocar', 'domar', 'bicho'],
    resposta: () => '_Nem toda companhia precisa falar para ser leal._\n\nUse */lojapets* pra comprar um ovo, */chocar* pra choca-lo, e */meupet* pra ver seu companheiro.'
  },
  {
    chaves: ['morri', 'morto', 'morre', 'reviver', 'renascer'],
    resposta: () => '_A morte aqui raramente é o fim._\n\nSe você morreu, use */criar* pra recomeçar, ou espere ser revivido por um Necromante com */reviver*.'
  },
  {
    chaves: ['casar', 'casamento', 'namorar', 'divorcio'],
    resposta: () => '_Até em meio ao caos, alguns encontram companhia._\n\nUse */casar @jogador* pra pedir em casamento, e */divorciar* se as coisas não derem certo.'
  },
  {
    chaves: ['deus', 'imperador', 'servo', 'necromante'],
    resposta: () => '_Poder de verdade tem um preço. Alguns pagam com liberdade, outros com a própria vida._\n\nEsses são sistemas avançados do jogo — pergunte a um administrador ou explore o */menu* pra descobrir mais.'
  }
];

// Resposta padrão quando nada bate com as palavras-chave
const RESPOSTA_PADRAO = () =>
  '_Suas palavras se perdem no vento... não entendi o que busca._\n\nDigite */menu* pra ver tudo que posso te mostrar.';

function responderComoImperius(texto) {
  const t = normalizar(texto);
  const palavras = new Set(t.split(/\s+/).filter(Boolean));

  for (const entrada of BASE_RESPOSTAS) {
    const bateu = entrada.chaves.some(chave => {
      const chavePalavras = chave.split(/\s+/);
      if (chavePalavras.length === 1) {
        return palavras.has(chavePalavras[0]);
      }
      // Chave com mais de uma palavra: todas precisam aparecer na mensagem (em qualquer ordem)
      return chavePalavras.every(p => palavras.has(p));
    });
    if (bateu) return entrada.resposta();
  }
  return RESPOSTA_PADRAO();
}

// Cooldown por jogador pra não spammar o grupo
const ultimoUso = new Map();
const COOLDOWN_MS = 4000;
function podeUsarChat(jogador_id) {
  const agora = Date.now();
  const ultima = ultimoUso.get(jogador_id) || 0;
  if (agora - ultima < COOLDOWN_MS) return false;
  ultimoUso.set(jogador_id, agora);
  return true;
}

module.exports = { responderComoImperius, mencionaImperius, podeUsarChat };
