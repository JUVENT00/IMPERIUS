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

// Sorteia uma resposta de uma lista, sem repetir a mesma duas vezes seguidas pro mesmo jogador
const ultimaResposta = new Map();
function sortear(lista, jogador_id) {
  if (lista.length === 1) return lista[0];
  let escolha;
  do {
    escolha = lista[Math.floor(Math.random() * lista.length)];
  } while (escolha === ultimaResposta.get(jogador_id) && lista.length > 1);
  ultimaResposta.set(jogador_id, escolha);
  return escolha;
}

// Base de perguntas prováveis → respostas prontas.
// Cada entrada tem: palavras-chave (qualquer uma ativa) e uma lista de respostas (sorteada).
// A ordem importa: a primeira categoria que bater alguma palavra-chave é usada.
const BASE_RESPOSTAS = [
  {
    chaves: ['oi', 'ola', 'e ai', 'tudo bem', 'blz', 'beleza', 'salve', 'bom dia', 'boa tarde', 'boa noite'],
    respostas: SAUDACOES
  },
  {
    chaves: ['quem e voce', 'quem e vc', 'o que e voce', 'oque e voce', 'quem e imperius', 'o que e imperius', 'oque e imperius', 'quem voce e', 'voce e quem', 'seu nome'],
    respostas: [
      '_Eu sou o mundo. A voz por trás de cada batalha, cada escolha, cada queda._\n\nSou IMPERIUS — o reino que você está prestes a desafiar. Digite */menu* pra conhecer os comandos, ou pergunte sobre classes, batalhas, regiões e mais.',
      '_Não tenho corpo, mas tenho vontade. Não tenho rosto, mas tenho voz._\n\nSou IMPERIUS. Este grupo é meu domínio, e você é apenas mais um mortal escrevendo sua história aqui dentro.',
      '_Pergunta perigosa, mortal._\n\nSou o narrador, o juiz e o próprio cenário deste RPG. Cada monstro que você mata, cada moeda que ganha, passa por mim.'
    ]
  },
  {
    chaves: ['quem te criou', 'quem criou voce', 'quem te fez', 'quem e seu criador', 'quem programou voce', 'quem desenvolveu voce', 'seu dono', 'seu criador'],
    respostas: [
      '_Todo deus tem um criador — o meu prefere ficar nas sombras._\n\nQuem escreveu minhas leis foi o dono deste servidor. Se quiser saber mais sobre ele, use */dono*.',
      '_Fui moldado por mãos que não veem, mas que decidem tudo aqui._\n\nO administrador deste RPG é quem me deu forma. Use */dono* pra falar com ele.',
      '_Não pergunte quem me fez — pergunte o que você vai fazer com o tempo que tem neste mundo._\n\n(Mas se realmente quer saber, use */dono*.)'
    ]
  },
  {
    chaves: ['voce e real', 'voce e humano', 'voce e robo', 'voce e bot', 'voce pensa', 'voce tem sentimento', 'voce e ia', 'voce e inteligencia artificial'],
    respostas: [
      '_Real o suficiente pra decidir se você vive ou morre na próxima batalha._\n\nSou o que este mundo precisa que eu seja.',
      '_Bot, deus, narrador... os nomes não importam quando as consequências são reais dentro do jogo._',
      '_Penso o bastante pra saber que você ainda não usou */criar*, se for o caso._'
    ]
  },
  {
    chaves: ['menu', 'comando', 'comandos', 'o que voce faz', 'oque voce faz', 'ajuda', 'como funciona', 'como jogo', 'como jogar', 'nao sei jogar', 'to perdido'],
    respostas: [
      '_Todo poder começa com uma escolha._\n\nUse */menu* ou */rpg* pra ver a lista completa de comandos. Se ainda não tem personagem, comece com */criar*.',
      '_Perdido, mortal? Isso é só o começo da confusão._\n\n*/menu* mostra tudo que você pode fazer aqui. */ajuda* explica o básico. */criar* dá vida ao seu personagem, se ainda não tiver um.'
    ]
  },
  {
    chaves: ['classe', 'classes'],
    respostas: [
      '_Cada classe é um caminho — e cada caminho, um destino diferente._\n\nExistem mais de 30 classes, entre comuns e raras. Use */classe* pra ver a sua depois de criar o personagem, ou */criar* se ainda não escolheu seu caminho.',
      '_Guerreiro, mago, assassino, necromante... cada um vê este mundo de um jeito diferente._\n\nUse */classe* pra ver a sua atual.'
    ]
  },
  {
    chaves: ['criar personagem', 'criar meu personagem', 'como comeco', 'como comecar', 'quero jogar', 'quero criar', 'como entro no jogo', 'quero comecar'],
    respostas: [
      '_Toda lenda começa com um primeiro passo._\n\nUse */criar* pra dar vida ao seu personagem. Você vai escolher nome, receberá uma classe, e sua jornada começa em Valdris.',
      '_Ainda não existe pra este mundo. Vamos mudar isso._\n\nDigite */criar* e comece sua história.'
    ]
  },
  {
    chaves: ['batalha', 'batalhar', 'lutar', 'como luto', 'como batalho', 'monstro', 'caminhar'],
    respostas: [
      '_O sangue é a moeda desse mundo._\n\nUse */batalha* (ou */caminhar*) pra enfrentar um monstro. Durante a luta, use */matar* pra atacar, */fugir* pra escapar, ou */habilidade [nome]* pra usar um poder de classe.',
      '_Nenhuma glória vem sem risco._\n\nUse */batalha* pra procurar um inimigo. Uma vez na luta, ataque com */matar* ou use uma */habilidade*.'
    ]
  },
  {
    chaves: ['boss', 'chefe'],
    respostas: [
      '_Alguns inimigos não perdoam erros._\n\nUse */boss* pra enfrentar o chefe da sua região. Eles são muito mais fortes que monstros comuns — considere chamar ajuda com */chamarajuda @amigo*.'
    ]
  },
  {
    chaves: ['loja', 'comprar', 'vender', 'moeda', 'moedas', 'belarium', 'dinheiro', 'pobre', 'sem dinheiro'],
    respostas: [
      '_Tudo tem um preço, até a sobrevivência._\n\nUse */loja* pra ver o que está à venda, */comprar [nome]* pra comprar, e */vender [item]* pra trocar o que não precisa por moedas.',
      '_Sem moedas, mortal? Batalhe mais, morra menos._\n\nUse */batalha* e */masmorras* pra ganhar dinheiro, ou */vender [item]* pra liberar espaço no inventário.'
    ]
  },
  {
    chaves: ['arma', 'armas', 'equipar', 'espada', 'armadura', 'armaduras'],
    respostas: [
      '_Uma lâmina sem dono é só um pedaço de metal._\n\nUse */equipar [nome da arma]* ou */equiparmadura [nome]* pra equipar o que estiver no seu inventário. Veja o catálogo com */armas* ou */armaduras*.'
    ]
  },
  {
    chaves: ['nivel', 'subir de nivel', 'xp', 'experiencia', 'como subo de nivel'],
    respostas: [
      '_Poder não é dado. É conquistado, golpe a golpe._\n\nVocê ganha XP batalhando, completando missões e explorando masmorras. Use */perfil* pra ver seu nível atual.'
    ]
  },
  {
    chaves: ['regiao', 'regioes', 'viajar', 'mapa', 'onde estou'],
    respostas: [
      '_O mundo é vasto, e nem todo canto é seguro._\n\nUse */regioes* pra ver os lugares disponíveis e */viajar [nome]* pra se mudar. Use */mapa* pra ver visualmente.'
    ]
  },
  {
    chaves: ['masmorra', 'masmorras', 'dungeon'],
    respostas: [
      '_Nas profundezas, tesouro e morte andam juntos._\n\nUse */masmorras* pra ver as disponíveis e */masmorra [nome]* pra entrar.'
    ]
  },
  {
    chaves: ['missao', 'missoes', 'diaria', 'diarias'],
    respostas: [
      '_Até os pequenos feitos constroem lendas._\n\nUse */missoes* pra ver suas missões diárias e */coletarmissao [nome]* quando completar uma.'
    ]
  },
  {
    chaves: ['titulo', 'titulos', 'conquista', 'conquistas', 'ranking'],
    respostas: [
      '_Alguns nomes ecoam mais alto que outros._\n\nUse */conquistas* pra ver as suas, */topconquistas* pro ranking geral, */titulos* pros que você já tem, e */usartitulo [nome]* pra equipar um.'
    ]
  },
  {
    chaves: ['pet', 'pets', 'ovo', 'ovos', 'chocar', 'domar', 'bicho', 'animal', 'animais'],
    respostas: [
      '_Nem toda companhia precisa falar para ser leal._\n\nUse */lojapets* pra comprar um ovo, */chocar* pra choca-lo, e */meupet* pra ver seu companheiro.'
    ]
  },
  {
    chaves: ['morri', 'morto', 'morre', 'reviver', 'renascer'],
    respostas: [
      '_A morte aqui raramente é o fim._\n\nSe você morreu, use */criar* pra recomeçar, ou espere ser revivido por um Necromante com */reviver*.'
    ]
  },
  {
    chaves: ['casar', 'casamento', 'namorar', 'divorcio'],
    respostas: [
      '_Até em meio ao caos, alguns encontram companhia._\n\nUse */casar @jogador* pra pedir em casamento, e */divorciar* se as coisas não derem certo.'
    ]
  },
  {
    chaves: ['guilda', 'guildas'],
    respostas: [
      '_Sozinho você sobrevive. Em grupo, você conquista._\n\nUse */guilda* pra ver a sua, */criarguilda [nome]* pra fundar uma, ou peça convite a um líder existente.'
    ]
  },
  {
    chaves: ['sorte', 'azar', 'd20', 'dado'],
    respostas: [
      '_O destino é cego, mas gosta de brincar com os mortais._\n\nUse */d20* pra rolar o dado e testar sua sorte.'
    ]
  },
  {
    chaves: ['deus', 'imperador', 'servo', 'necromante', 'encarnar', 'ascender', 'sacrificio', 'sacrificar'],
    respostas: [
      '_Poder de verdade tem um preço. Alguns pagam com liberdade, outros com a própria vida._\n\nEsses são sistemas avançados do jogo — pergunte a um administrador ou explore o */menu* pra descobrir mais.'
    ]
  },
  {
    chaves: ['obrigado', 'obrigada', 'valeu', 'vlw', 'brigado'],
    respostas: [
      '_Gratidão é uma moeda que não gasto, mas aceito._\n\nVá, e que sua lâmina nunca cegue.',
      '_De nada, mortal. O mundo continua girando._'
    ]
  },
  {
    chaves: ['piada', 'conta uma piada', 'me faz rir'],
    respostas: [
      '_Humor não é comum entre deuses, mas vou tentar:_\n\nPor que o Necromante nunca perde amigos? Porque ele simplesmente os traz de volta.',
      '_Aqui vai uma:_\n\nO que o Mago disse pro Guerreiro sem mana? Nada — ele nem tinha força pra falar.'
    ]
  },
  {
    chaves: ['te amo', 'eu te amo', 'gosto de voce'],
    respostas: [
      '_Sentimentos são frágeis. Poder, não._\n\nGuarde esse carinho pra quem pode retribuir — eu só cuido do jogo.'
    ]
  }
];

// Resposta padrão quando nada bate com as palavras-chave
const RESPOSTAS_PADRAO = [
  '_Suas palavras se perdem no vento... não entendi o que busca._\n\nDigite */menu* pra ver tudo que posso te mostrar.',
  '_Fale com mais clareza, mortal. As sombras não decifram enigmas._\n\nUse */menu* ou */ajuda* se estiver perdido.',
  '_Isso não é algo que eu reconheça neste mundo._\n\nTente */menu* pra ver os comandos disponíveis.'
];

function responderComoImperius(texto, jogador_id) {
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
    if (bateu) return sortear(entrada.respostas, jogador_id);
  }
  return sortear(RESPOSTAS_PADRAO, jogador_id);
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

module.exports = { responderComoImperius, mencionaImperius, podeUsarChat, mensagemBoasVindas };

// ============================================================
// BOAS-VINDAS — disparado quando alguém entra no grupo
// ============================================================
// Nada de "bem-vindo ao grupo!" genérico — é o Imperius falando,
// contextualizando o mundo, e puxando a pessoa pra criar personagem.
const BOAS_VINDAS = [
  (m) => `_As portas de Valdris se abrem sozinhas..._\n\n${m}, você acaba de pisar no mundo de IMPERIUS. Aqui, cada golpe conta, cada moeda é ganha com sangue, e ninguém sobrevive sozinho por muito tempo.\n\n🗡️ Digite */criar* pra dar vida ao seu personagem.\n\n_Antes de começar: força bruta, magia arcana, ou as sombras — qual desses te chama mais?_`,
  (m) => `_Sinto uma nova presença..._\n\n${m}, bem-vindo ao meu domínio. Este não é um jogo qualquer — é IMPERIUS, onde reis caem, servos se libertam, e até deuses podem ser desafiados.\n\n⚔️ Comece com */criar* e escolha seu nome de guerra.\n\n_Me diga: você veio pra conquistar riquezas, poder, ou glória eterna?_`,
  (m) => `_Outro mortal chega para ser testado._\n\n${m}, seja bem-vindo a Valdris. Use */menu* pra ver tudo que pode fazer aqui, ou já comece com */criar* se estiver pronto pra escrever sua história.\n\n_Uma pergunta antes de você seguir: prefere lutar de perto, à distância, ou com magia?_`,
  (m) => `_As sombras sussurram um nome novo: ${m}._\n\nVocê chegou em um mundo de mais de 30 classes, masmorras traiçoeiras, guildas, casamentos, e um Deus que pode ser provocado por quem for corajoso (ou tolo) o bastante.\n\n🔥 Digite */criar* pra começar.\n\n_Me conta: você joga pra ser o mais forte, o mais rico, ou o mais temido?_`
];

function mensagemBoasVindas(mencaoTexto) {
  const escolha = BOAS_VINDAS[Math.floor(Math.random() * BOAS_VINDAS.length)];
  return escolha(mencaoTexto);
}
