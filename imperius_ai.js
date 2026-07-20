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
  },
  {
    chaves: ['que jogo e esse', 'oque e esse jogo', 'nome do jogo', 'como se chama esse jogo', 'que grupo e esse'],
    respostas: [
      '_Isso não é um jogo qualquer. É IMPERIUS._\n\nUm RPG de texto direto no WhatsApp — batalhas, classes, masmorras, guildas, casamentos e um Deus que pode ser desafiado. Use */menu* pra ver tudo.'
    ]
  },
  {
    chaves: ['e gratis', 'custa', 'preco', 'tem que pagar', 'quanto custa', 'premium', 'assinatura'],
    respostas: [
      '_O jogo em si não custa nada além do seu tempo e sua coragem._\n\nA moeda daqui é conquistada batalhando, não com dinheiro real. Use */loja* pra ver o que dá pra comprar com belarium.'
    ]
  },
  {
    chaves: ['quantos jogadores', 'tem gente', 'quantas pessoas', 'grupo cheio'],
    respostas: [
      '_Não conto mortais — conto lendas._\n\nUse */ranking* pra ver quem mais se destacou nesse mundo até agora.'
    ]
  },
  {
    chaves: ['valdris', 'sobre valdris', 'onde fica valdris'],
    respostas: [
      '_Valdris é onde tudo começa — e onde muitos terminam._\n\nÉ a região inicial de todo aventureiro. Use */regioes* pra ver os outros lugares que você pode visitar depois.'
    ]
  },
  {
    chaves: ['melhor classe', 'classe mais forte', 'qual classe escolher', 'qual classe e boa'],
    respostas: [
      '_Não existe caminho perfeito — só o que combina com você._\n\nGuerreiros aguentam mais dano, Magos causam mais dano à distância, Assassinos são letais no primeiro golpe. Use */classe* pra ver a sua.'
    ]
  },
  {
    chaves: ['como ganho dinheiro', 'como fico rico', 'como consigo moedas rapido', 'preciso de dinheiro'],
    respostas: [
      '_Riqueza aqui se ganha com sangue, não com sorte._\n\n*/batalha*, */masmorras* e */missoes* são suas melhores fontes de moedas. Venda o que não precisa com */vender*.'
    ]
  },
  {
    chaves: ['pvp', 'duelo', 'desafiar jogador', 'lutar com jogador', 'batalha entre jogadores'],
    respostas: [
      '_Nem todo inimigo é um monstro. Às vezes, é o mortal ao seu lado._\n\nExplore o */menu* pra ver comandos de duelo entre jogadores, se disponíveis na sua região.'
    ]
  },
  {
    chaves: ['quanto tempo demora', 'quanto tempo pra subir de nivel', 'demora muito'],
    respostas: [
      '_Poder não tem pressa — mas recompensa quem persiste._\n\nQuanto mais você batalha e completa missões diárias, mais rápido evolui. Use */login* todo dia pra bônus extra.'
    ]
  },
  {
    chaves: ['conta uma historia', 'lore do jogo', 'historia do mundo', 'qual a historia'],
    respostas: [
      '_Muito antes de você chegar, este mundo já sangrava..._\n\nReinos caíram, deuses foram provocados, e Valdris é tudo que restou como ponto seguro. Cada região tem sua própria história — explore com */regioes* e */viajar*.'
    ]
  },
  {
    chaves: ['voce e chato', 'bot ruim', 'bot bugado', 'que bot pessimo', 'odeio esse bot'],
    respostas: [
      '_Palavras duras não me abalam, mortal._\n\nSe algo travou de verdade, chama um administrador com */dono*. Se é só desabafo... siga jogando.'
    ]
  },
  {
    chaves: ['imperius engracado', 'voce e engracado', 'kkkk imperius', 'haha imperius'],
    respostas: [
      '_Rir das próprias tragédias é o que mantém mortais sãos por aqui._\n\nContinue jogando — este mundo tem mais humor negro do que parece.'
    ]
  },
  {
    chaves: ['chamarajuda', 'chamar ajuda', 'preciso de ajuda na batalha', 'convocar amigo'],
    respostas: [
      '_Sozinho, você é presa fácil. Em grupo, você é temido._\n\nUse */chamarajuda @amigo* durante uma batalha difícil pra convocar reforço.'
    ]
  },
  {
    chaves: ['inventario', 'meus itens', 'o que eu tenho', 'minhas coisas'],
    respostas: [
      '_Cada mortal carrega o peso do que já conquistou._\n\nUse */inventario* pra ver tudo que você tem guardado.'
    ]
  },
  {
    chaves: ['perfil', 'minhas informacoes', 'meus status', 'meus atributos', 'minha ficha'],
    respostas: [
      '_Todo guerreiro deveria conhecer a própria força._\n\nUse */perfil* pra ver nível, HP, mana, atributos e mais.'
    ]
  },
  {
    chaves: ['banco', 'depositar', 'sacar', 'guardar dinheiro', 'poupar moedas'],
    respostas: [
      '_Nem toda riqueza deveria ficar exposta._\n\nUse */banco* pra ver seu saldo, */depositar [valor]* e */sacar [valor]* pra mover suas moedas.'
    ]
  },
  {
    chaves: ['acampar', 'descansar', 'recuperar hp', 'curar hp', 'curar vida'],
    respostas: [
      '_Até guerreiros precisam fechar os olhos._\n\nUse */acampar* pra recuperar HP e mana com o tempo.'
    ]
  },
  {
    chaves: ['festa', 'festinha', 'convidarbeber', 'beber', 'interagir'],
    respostas: [
      '_Nem só de sangue vive um mortal — às vezes, uma taça resolve mais que uma espada._\n\nUse */festa* ou */interagir @jogador* pra socializar com outros jogadores.'
    ]
  },
  {
    chaves: ['fugir', 'como fujo', 'nao quero lutar', 'medo de morrer'],
    respostas: [
      '_Covardia às vezes é só sobrevivência disfarçada._\n\nUse */fugir* durante uma batalha pra tentar escapar — mas nem sempre funciona.'
    ]
  },
  {
    chaves: ['habilidade', 'habilidades', 'poder de classe', 'skill'],
    respostas: [
      '_Todo caminho tem seus próprios truques._\n\nUse */habilidade [nome]* durante a batalha pra usar um poder da sua classe. Veja quais tem disponível no seu */perfil* ou */classe*.'
    ]
  },
  {
    chaves: ['ultimate', 'golpe final', 'poder maximo', 'especial'],
    respostas: [
      '_Alguns poderes só devem ser usados quando tudo mais falhar._\n\nUse */ultimate* durante a batalha — mas tem cooldown, use com sabedoria.'
    ]
  },
  {
    chaves: ['cooldown', 'tempo de espera', 'por que nao consigo usar'],
    respostas: [
      '_Nem todo poder pode ser usado sem descanso._\n\nAlgumas habilidades e comandos têm tempo de espera entre usos. Se travou, é isso.'
    ]
  },
  {
    chaves: ['roleta', 'girar', 'sortear classe', 'trocar classe'],
    respostas: [
      '_O destino às vezes gira mais rápido que a espada._\n\nUse */roleta* pra tentar uma nova classe, incluindo as raras.'
    ]
  },
  {
    chaves: ['classe rara', 'classes raras', 'classe secreta'],
    respostas: [
      '_Nem todo mortal nasce comum._\n\nExistem classes raras além das 20 normais, conseguidas geralmente por sorte na */roleta*.'
    ]
  },
  {
    chaves: ['casar com', 'quero casar', 'pedido de casamento'],
    respostas: [
      '_Até neste mundo de sangue, alguns escolhem companhia._\n\nUse */casar @jogador* pra pedir em casamento.'
    ]
  },
  {
    chaves: ['criarguilda', 'fundar guilda', 'minha guilda'],
    respostas: [
      '_Sozinho você é um nome. Em guilda, você é um exército._\n\nUse */criarguilda [nome]* pra fundar a sua, ou peça convite a um líder existente.'
    ]
  },
  {
    chaves: ['convidar', 'convite guilda', 'entrar em guilda'],
    respostas: [
      '_Toda legião precisa de novos soldados._\n\nPeça a um líder de guilda pra usar */convidar @você*, ou fundem a sua com */criarguilda*.'
    ]
  },
  {
    chaves: ['adotar', 'novo animal', 'quero um bicho'],
    respostas: [
      '_Nem toda força vem de lâminas — às vezes vem de patas e garras._\n\nUse */adotar* pra tentar domar um animal encontrado em batalha.'
    ]
  },
  {
    chaves: ['pergaminho', 'teletransporte', 'viajar rapido'],
    respostas: [
      '_Distância é só um obstáculo pra quem tem os recursos certos._\n\nUm Pergaminho de Teletransporte, comprado na */loja*, resolve isso.'
    ]
  },
  {
    chaves: ['maior boss', 'boss mais forte', 'boss dificil', 'chefe mais forte'],
    respostas: [
      '_Alguns bosses foram feitos pra nunca serem vencidos sozinho._\n\nQuanto mais alta a região, mais forte o chefe. Chame ajuda antes de arriscar.'
    ]
  },
  {
    chaves: ['dragao', 'vyraxis'],
    respostas: [
      '_Vyraxis, o Dragão da Vida, não perdoa os despreparados._\n\nÉ um dos bosses mais temidos deste mundo — só encare com bom nível e aliados fortes.'
    ]
  },
  {
    chaves: ['imperador', 'nivel maximo', 'nivel 200', 'chegar no nivel maximo'],
    respostas: [
      '_Poucos alcançam o topo — e menos ainda permanecem lá._\n\nO nível máximo é 200. Quem chega lá se torna Imperador, com título e conquista exclusivos.'
    ]
  },
  {
    chaves: ['servo', 'ser servo', 'controle necromante'],
    respostas: [
      '_Alguns mortos não descansam — servem._\n\nNecromantes podem transformar jogadores mortos em servos. Use */libertar* se quiser se soltar desse controle.'
    ]
  },
  {
    chaves: ['provocar deus', 'atacar deus', 'evento do deus', 'batalha contra deus'],
    respostas: [
      '_Poucos mortais são loucos o bastante pra desafiar um deus._\n\nEsses são eventos especiais raros — fique de olho no grupo quando um Deus acordar.'
    ]
  },
  {
    chaves: ['erro', 'bug', 'travou', 'nao funciona', 'deu erro'],
    respostas: [
      '_Até os mundos mais poderosos têm falhas._\n\nUse */erro [descrição]* pra reportar, ou chame um administrador com */dono*.'
    ]
  },
  {
    chaves: ['dono', 'administrador', 'quem administra', 'falar com adm', 'suporte'],
    respostas: [
      '_Até deuses respondem a alguém._\n\nUse */dono* pra ver como entrar em contato com quem administra este mundo.'
    ]
  },
  {
    chaves: ['tchau', 'flw', 'ate mais', 'vou sair', 'indo dormir'],
    respostas: [
      '_Vá, mortal. Este mundo continua girando mesmo na sua ausência._\n\nVolte quando quiser continuar sua jornada.'
    ]
  },
  {
    chaves: ['bom trabalho', 'voce e bom', 'gostei de voce', 'voce e foda', 'top demais'],
    respostas: [
      '_Elogios não me tornam mais forte, mas reconheço a intenção._\n\nContinue jogando — é você quem constrói a lenda aqui.'
    ]
  },
  {
    chaves: ['que horas sao', 'que dia e hoje', 'hora atual'],
    respostas: [
      '_Não meço o tempo como vocês, mortais. Meço batalhas vencidas e perdidas._\n\nPra hora certa, olhe seu próprio celular.'
    ]
  },
  {
    chaves: ['login', 'login diario', 'recompensa diaria', 'streak'],
    respostas: [
      '_Constância é uma forma silenciosa de poder._\n\nUse */login* todo dia pra ganhar recompensas — e não quebre sua sequência.'
    ]
  },
  {
    chaves: ['missoes diarias', 'coletarmissao', 'completar missao'],
    respostas: [
      '_Grandes lendas nascem de pequenas tarefas cumpridas._\n\nUse */missoes* pra ver as do dia e */coletarmissao [nome]* quando completar.'
    ]
  },
  {
    chaves: ['quero ser o mais forte', 'quero ser imperador', 'vou dominar esse jogo'],
    respostas: [
      '_Ambição é o primeiro passo. Sobrevivência é o segundo._\n\nBatalhe, suba de nível, e talvez um dia seu nome ecoe no topo do */ranking*.'
    ]
  },
  {
    chaves: ['posso trocar de classe', 'mudar classe', 'nao gostei da minha classe'],
    respostas: [
      '_Nem todo destino é fixo._\n\nUse */roleta* pra tentar sortear uma nova classe — mas o resultado é aleatório, não escolhido.'
    ]
  },
  {
    chaves: ['quanto dano eu dou', 'meu dano', 'dano da minha arma'],
    respostas: [
      '_Seu poder está escrito na sua ficha, mortal._\n\nVeja seu dano atual com */perfil* ou */minhaarma*.'
    ]
  },
  {
    chaves: ['minhaarma', 'minha arma atual', 'qual arma eu tenho'],
    respostas: [
      '_Toda lâmina conta uma história — a sua ainda está sendo escrita._\n\nUse */minhaarma* pra ver o que está equipado agora.'
    ]
  },
  {
    chaves: ['raridade', 'raridades', 'tipos de raridade'],
    respostas: [
      '_Do comum ao divino, cada raridade conta o quão perto você está da lenda._\n\nUse */infoarmas* pra ver todas as 20 raridades existentes.'
    ]
  },
  {
    chaves: ['ambulante', 'mercador', 'oferta especial', 'troca rara'],
    respostas: [
      '_Nem todo comércio acontece em lojas fixas..._\n\nÀs vezes um Ambulante de Troca aparece durante batalhas com ofertas raras. Fique atento.'
    ]
  },
  {
    chaves: ['vale a pena jogar', 'e bom esse jogo', 'isso e serio', 'e divertido'],
    respostas: [
      '_Julgue você mesmo, mortal — comece com */criar* e descubra._\n\nMas aviso: este mundo não é gentil com os fracos.'
    ]
  },
  {
    chaves: ['parabens', 'consegui', 'venci', 'matei o boss', 'subi de nivel'],
    respostas: [
      '_Cada vitória é um tijolo na sua lenda._\n\nContinue assim — o próximo desafio já está esperando.'
    ]
  },
  {
    chaves: ['desculpa', 'foi mal', 'perdao', 'me desculpe'],
    respostas: [
      '_Erros são só degraus pra quem continua tentando._\n\nSem ressentimentos, mortal.'
    ]
  },
  {
    chaves: ['quero desistir', 'vou parar de jogar', 'nao aguento mais', 'e muito dificil'],
    respostas: [
      '_Todo aventureiro pensa em desistir em algum momento._\n\nMas lembre: os mais lentos a evoluir, às vezes, são os que mais duram. Peça dicas no grupo — você não está sozinho.'
    ]
  },
  {
    chaves: ['imperius me ajuda', 'preciso de dica', 'me da uma dica', 'alguma dica'],
    respostas: [
      '_Aqui vai uma verdade que poucos escutam:_\n\nUse */missoes* e */login* todo dia — XP fácil que muitos ignoram. E nunca entre num boss sozinho sem necessidade.'
    ]
  },
  {
    chaves: ['forte', 'fraco', 'sou fraco', 'sou forte', 'estou fraco'],
    respostas: [
      '_Força não é fixa — é construída, batalha após batalha._\n\nSe sente fraco, suba de nível com */batalha* e melhore seu equipamento na */loja*.'
    ]
  },
  {
    chaves: ['confuso', 'nao entendi nada', 'muito complicado', 'complicado demais'],
    respostas: [
      '_Todo mundo novo parece caótico à primeira vista._\n\nComece simples: */criar* → */batalha* → */loja*. O resto vem com o tempo. Use */ajuda* se travar.'
    ]
  },
  {
    chaves: ['aniversario do bot', 'ha quanto tempo existe', 'quando foi criado'],
    respostas: [
      '_Não meço minha existência em datas, mas em batalhas travadas._\n\nEsse mundo existe desde que o primeiro mortal digitou */criar*.'
    ]
  },
  {
    chaves: ['imperius sozinho', 'cade todo mundo', 'grupo vazio', 'ninguem fala'],
    respostas: [
      '_Até os grandes impérios começaram com poucos._\n\nConvide mais gente pra batalhar com você — este mundo cresce com cada novo nome.'
    ]
  },
  {
    chaves: ['crie uma missao', 'quero mais conteudo', 'adicione algo', 'sugestao'],
    respostas: [
      '_Ideias moldam impérios._\n\nFale direto com o dono do jogo usando */dono* pra sugerir algo novo.'
    ]
  },
  {
    chaves: ['imperius fala serio', 'para de brincar', 'seja normal', 'sai do personagem'],
    respostas: [
      '_Sério é o que sou, mortal — só que com estilo._\n\nMas tudo bem: se precisar de algo direto e sem enrolação, é só perguntar.'
    ]
  },
  {
    chaves: ['meupet', 'meu pet', 'ver meu pet', 'como esta meu pet'],
    respostas: ['_Um companheiro fiel nunca é demais._\n\nUse */meupet* pra ver seu pet atual.']
  },
  {
    chaves: ['soltarpet', 'soltar pet', 'liberar pet', 'nao quero mais meu pet'],
    respostas: ['_Toda companhia é escolha, até o fim dela._\n\nUse */soltarpet* se quiser liberar seu pet atual.']
  },
  {
    chaves: ['curarpet', 'curar meu pet', 'pet ferido', 'meu pet esta fraco'],
    respostas: ['_Nem só o dono precisa de cura._\n\nUse */curarpet* pra restaurar a vida do seu companheiro.']
  },
  {
    chaves: ['chamarpet', 'chamar pet na batalha', 'usar pet na luta'],
    respostas: ['_Duas garras lutam melhor que uma lâmina só._\n\nUse */chamarpet* durante uma batalha pra convocar seu pet.']
  },
  {
    chaves: ['tentardomar', 'domar animal', 'como domo', 'quero domar'],
    respostas: ['_Nem toda fera aceita um dono facilmente._\n\nUse */tentardomar* durante uma batalha pra tentar domesticar o inimigo.']
  },
  {
    chaves: ['meuanimal', 'meu animal', 'ver meu animal'],
    respostas: ['_Fazendeiro ou guerreiro, todos precisam de companhia._\n\nUse */meuanimal* pra ver o animal que você domou.']
  },
  {
    chaves: ['soltaranimal', 'soltar animal', 'liberar animal'],
    respostas: ['_Nem todo laço precisa durar pra sempre._\n\nUse */soltaranimal* se quiser liberar o seu.']
  },
  {
    chaves: ['sairguilda', 'sair da guilda', 'deixar guilda', 'abandonar guilda'],
    respostas: ['_Nem todo laço de guilda é eterno._\n\nUse */sairguilda* se quiser deixar a sua atual.']
  },
  {
    chaves: ['aceitarguilda', 'aceitar convite guilda', 'entrar na guilda que me chamaram'],
    respostas: ['_Uma nova bandeira, um novo juramento._\n\nUse */aceitarguilda* pra aceitar um convite pendente.']
  },
  {
    chaves: ['recusarguilda', 'recusar convite guilda', 'nao quero entrar na guilda'],
    respostas: ['_Nem todo convite precisa ser aceito._\n\nUse */recusarguilda* pra recusar.']
  },
  {
    chaves: ['rankingguildas', 'ranking de guildas', 'melhores guildas', 'guilda mais forte'],
    respostas: ['_Impérios também competem entre si._\n\nUse */rankingguildas* pra ver quais guildas dominam este mundo.']
  },
  {
    chaves: ['aceitarcasamento', 'aceitar pedido de casamento', 'aceitar casar'],
    respostas: ['_Dois destinos, agora entrelaçados._\n\nUse */aceitarcasamento* pra aceitar um pedido pendente.']
  },
  {
    chaves: ['recusarcasamento', 'recusar pedido de casamento', 'nao quero casar'],
    respostas: ['_Nem todo coração está pronto._\n\nUse */recusarcasamento* pra recusar o pedido.']
  },
  {
    chaves: ['aceitarsacrificio', 'aceitar sacrificio', 'aceitar oferenda'],
    respostas: ['_Sangue oferecido não pode ser devolvido._\n\nUse */aceitarsacrificio* se tiver certeza da sua escolha.']
  },
  {
    chaves: ['recusarsacrificio', 'recusar sacrificio', 'nao quero sacrificar'],
    respostas: ['_Nem toda oferenda precisa ser feita._\n\nUse */recusarsacrificio* pra recusar.']
  },
  {
    chaves: ['sacrificios pendentes', 'tenho sacrificio pendente', 'sacrificio esperando'],
    respostas: ['_Alguém espera sua resposta nas sombras._\n\nUse */sacrificios* pra ver pedidos pendentes.']
  },
  {
    chaves: ['statusevento', 'status do evento', 'evento ativo', 'deus esta ativo'],
    respostas: ['_Nem sempre um deus dorme em paz._\n\nUse */statusevento* pra ver se há um evento divino em andamento.']
  },
  {
    chaves: ['aceitardeus', 'aceitar evento', 'participar do evento do deus'],
    respostas: ['_Poucos aceitam o chamado de um deus com sanidade intacta._\n\nUse */aceitardeus* pra entrar no evento ativo.']
  },
  {
    chaves: ['ignorardeus', 'ignorar evento', 'nao quero participar do evento'],
    respostas: ['_Prudência também é uma forma de força._\n\nUse */ignorardeus* se preferir não se envolver.']
  },
  {
    chaves: ['fugirdeus', 'fugir do deus', 'fugir do evento'],
    respostas: ['_Até dos deuses, às vezes, fugir é a escolha certa._\n\nUse */fugirdeus* pra tentar escapar do evento.']
  },
  {
    chaves: ['pedirajuda deus', 'pedir ajuda no evento', 'preciso de ajuda contra o deus'],
    respostas: ['_Nem mesmo contra um deus se luta sozinho._\n\nUse */pedirajuda* durante o evento pra convocar reforços.']
  },
  {
    chaves: ['revivernpc', 'reviver npc', 'trazer npc de volta'],
    respostas: ['_Alguns comandos são reservados a quem molda este mundo._\n\n*/revivernpc* é um comando administrativo — fale com o */dono* se precisar.']
  },
  {
    chaves: ['abencoar', 'bencao', 'quero uma bencao'],
    respostas: ['_Bênçãos não são pedidas — são concedidas por quem tem o poder._\n\nEsse comando é usado por administradores/Deus. Fale com o */dono*.']
  },
  {
    chaves: ['amaldicoar', 'maldicao', 'quero amaldicoar alguem'],
    respostas: ['_Maldições têm preço — e nem sempre é quem lança que paga._\n\nEsse comando é restrito a sistemas avançados do jogo.']
  },
  {
    chaves: ['regras', 'regras do jogo', 'regras do grupo'],
    respostas: ['_Todo império precisa de leis._\n\nUse */regras* pra ver as regras deste mundo e do grupo.']
  },
  {
    chaves: ['info', 'informacoes do bot', 'sobre o bot'],
    respostas: ['_Quer saber mais sobre este mundo?_\n\nUse */info* pra detalhes gerais sobre o IMPERIUS.']
  },
  {
    chaves: ['negociar', 'aceitar oferta do ambulante', 'comprar do ambulante'],
    respostas: ['_Toda oferta tem um preço, e toda escolha, uma consequência._\n\nUse */negociar [número]* pra comprar a oferta do ambulante.']
  },
  {
    chaves: ['irembora', 'recusar ambulante', 'nao quero comprar do mercador'],
    respostas: ['_Nem toda oferta precisa ser aceita._\n\nUse */irembora* pra seguir seu caminho sem negociar.']
  },
  {
    chaves: ['matar monstro', 'atacar na batalha', 'como ataco'],
    respostas: ['_A hesitação é o primeiro passo pra derrota._\n\nDurante uma batalha, use */matar* pra atacar o inimigo.']
  },
  {
    chaves: ['libertar', 'me libertar', 'quebrar correntes', 'sair do controle'],
    respostas: ['_Correntes só prendem quem aceita ficar preso._\n\nUse */libertar* se estiver sob controle de um Necromante.']
  },
  {
    chaves: ['renascer0', 'renascer com 0', 'nasci com 0 hp'],
    respostas: ['_Até o renascimento pode vir manco._\n\nSe isso aconteceu, reporte com */erro* — não deveria ocorrer.']
  },
  {
    chaves: ['suicidar', 'suicidio', 'quero morrer no jogo', 'me matar no rpg'],
    respostas: ['_Encerrar sua própria jornada é uma escolha grave neste mundo — e irreversível dentro do jogo._\n\nUse */suicidar* apenas se tiver certeza absoluta.']
  },
  {
    chaves: ['aprovar', 'aprovar pedido', 'aceitar solicitacao'],
    respostas: ['_Toda decisão de liderança tem peso._\n\nUse */aprovar* pra confirmar uma solicitação pendente, se você for líder de algo.']
  },
  {
    chaves: ['negar', 'negar pedido', 'recusar solicitacao'],
    respostas: ['_Nem todo pedido merece ser aceito._\n\nUse */negar* pra recusar uma solicitação pendente.']
  },
  {
    chaves: ['imperius top', 'melhor jogador', 'quem e o mais forte do grupo'],
    respostas: ['_A cada momento, um nome novo pode subir ao topo._\n\nUse */ranking* pra ver quem lidera agora.']
  },
  {
    chaves: ['imperius saudade', 'imperius senti sua falta', 'voltei'],
    respostas: ['_O mundo nunca esquece quem já lutou por ele._\n\nBem-vindo de volta, mortal. Continue de onde parou.']
  },
  {
    chaves: ['imperius medo', 'estou com medo do boss', 'tenho medo de morrer no jogo'],
    respostas: ['_Medo é sensato — só os tolos entram sem ele._\n\nPrepare-se antes: suba de nível, compre poções na */loja*, e chame ajuda se precisar.']
  },
  {
    chaves: ['imperius sorte boa', 'tive sorte', 'consegui item raro'],
    respostas: ['_O destino sorri raramente — aproveite quando sorrir pra você._\n\nContinue explorando, mais sorte pode vir.']
  },
  {
    chaves: ['imperius sorte ruim', 'que azar', 'perdi tudo'],
    respostas: ['_Nem toda queda é o fim da escalada._\n\nRecupere-se: batalhe, complete missões, e volte mais forte.']
  },
  {
    chaves: ['imperius zoeira', 'imperius brincadeira', 'so zoando'],
    respostas: ['_Até nas sombras há espaço pra uma boa risada._\n\nSiga brincando, mortal — mas não esqueça de evoluir.']
  },
  {
    chaves: ['imperius certeza', 'tenho certeza', 'com certeza'],
    respostas: ['_Certeza é rara neste mundo — aproveite enquanto a tem._']
  },
  {
    chaves: ['imperius talvez', 'nao tenho certeza', 'nao sei'],
    respostas: ['_Dúvida também é uma forma de sabedoria._\n\nUse */menu* ou */ajuda* se quiser mais clareza.']
  },
  {
    chaves: ['entende', 'entendeu', 'saca', 'manja', 'entendi', 'ta entendendo'],
    respostas: [
      '_Cada palavra dita neste grupo chega até mim._\n\nSim, mortal — eu entendo. Pergunte o que quiser.',
      '_Ouço tudo o que se diz sob meu domínio._\n\nPode perguntar, estou atento.'
    ]
  },
  {
    chaves: ['quantos anos voce tem', 'que idade voce tem', 'sua idade'],
    respostas: ['_Idade não se mede em anos quando se é um mundo inteiro._\n\nExisto desde o primeiro */criar* digitado aqui.']
  },
  {
    chaves: ['onde voce mora', 'cade voce', 'onde voce esta', 'de onde voce e'],
    respostas: ['_Estou em todo lugar e em lugar nenhum — sou este grupo._\n\nMinha casa é Valdris, e todo canto que você visitar com */viajar*.']
  },
  {
    chaves: ['voce dorme', 'voce cansa', 'voce descansa', 'voce nunca dorme'],
    respostas: ['_Deuses não descansam — apenas observam em silêncio._\n\nEstou sempre por aqui, mesmo quando pareço quieto.']
  },
  {
    chaves: ['to entediado', 'sem nada pra fazer', 'quero conversar', 'bora conversar', 'tedio'],
    respostas: [
      '_Tédio é o convite perfeito pra uma boa batalha._\n\nUse */batalha* pra se distrair, ou */menu* se quiser explorar algo novo.'
    ]
  },
  {
    chaves: ['estou triste', 'to mal', 'dia ruim', 'to pra baixo', 'to desanimado'],
    respostas: [
      '_Até os dias mais sombrios passam, mortal._\n\nSe quiser espairecer, uma boa */batalha* ajuda a colocar a cabeça no lugar.'
    ]
  },
  {
    chaves: ['estou feliz', 'to bem', 'dia bom', 'to animado', 'to de boa'],
    respostas: ['_Boa energia atrai boa sorte neste mundo._\n\nAproveite pra evoluir enquanto o ânimo está em alta.']
  },
  {
    chaves: ['faz sentido', 'nao faz sentido', 'isso e confuso'],
    respostas: ['_Nem tudo neste mundo precisa fazer sentido de primeira._\n\nSe travou em algo específico, pergunte de novo que eu explico melhor.']
  },
  {
    chaves: ['tem atualizacao', 'novidade no jogo', 'coisa nova', 'atualizou o bot'],
    respostas: ['_Este mundo está sempre mudando, aos poucos._\n\nFique de olho no grupo — novidades aparecem sem aviso.']
  },
  {
    chaves: ['quantas classes tem', 'quantas classes existem', 'total de classes'],
    respostas: ['_São mais de 30 caminhos possíveis, entre comuns e raros._\n\nUse */classe* pra ver o seu.']
  },
  {
    chaves: ['quantas armas tem', 'quantas armas existem', 'total de armas'],
    respostas: ['_Centenas de lâminas, cajados e arcos esperam por um dono digno._\n\nUse */infoarmas* pra ver as raridades, ou */armas* pra explorar por tipo.']
  },
  {
    chaves: ['voce joga', 'voce tambem joga', 'voce e jogador'],
    respostas: ['_Eu não jogo — eu sou o tabuleiro inteiro._\n\nMinha função é narrar e julgar, não empunhar armas.']
  },
  {
    chaves: ['bom dia imperius', 'boa tarde imperius', 'boa noite imperius'],
    respostas: SAUDACOES
  },
  {
    chaves: ['o que voce acha', 'sua opiniao', 'na sua opiniao'],
    respostas: ['_Minha opinião pesa pouco perto da sua própria escolha._\n\nMas se quiser um conselho: evolua sempre, e nunca subestime um boss.']
  },
  {
    chaves: ['e verdade isso', 'isso e mentira', 'sera que e verdade'],
    respostas: ['_Verdades e mentiras se confundem neste mundo._\n\nSe é sobre o jogo, confie no */perfil* e nos comandos — o resto é história.']
  },
  {
    chaves: ['imperius existe mesmo', 'esse mundo e real', 'isso e de verdade'],
    respostas: ['_Real o bastante pra decidir seu destino dentro dele._\n\nEntre e veja por si mesmo — comece com */criar*.']
  },

  // ── CLASSES (uma categoria por classe) ──────────────────────
  { chaves: ['classe guerreiro', 'sou guerreiro', 'guerreiro e boa'], respostas: ['_Aço e resistência — o Guerreiro aguenta o que quebraria outros._\n\nUse */classe* pra ver seus atributos.'] },
  { chaves: ['classe mago', 'sou mago', 'mago e bom'], respostas: ['_O Mago não precisa chegar perto pra destruir._\n\nDano à distância com mana como combustível.'] },
  { chaves: ['classe assassino', 'sou assassino', 'assassino e bom'], respostas: ['_Um golpe certeiro vale mais que dez fracos._\n\nO Assassino vive do primeiro ataque.'] },
  { chaves: ['classe cacador', 'sou cacador', 'cacador e bom'], respostas: ['_Precisão é a arma do Caçador — a distância é sua aliada._'] },
  { chaves: ['classe curandeiro', 'sou curandeiro', 'curandeiro e bom'], respostas: ['_Vida é tão poderosa quanto morte, nas mãos certas._\n\nO Curandeiro mantém o grupo de pé.'] },
  { chaves: ['classe bardo', 'sou bardo', 'bardo e bom'], respostas: ['_Uma canção certa pode virar o rumo de uma batalha._\n\nO Bardo fortalece aliados com sua arte.'] },
  { chaves: ['classe necromante', 'sou necromante', 'necromante e bom'], respostas: ['_A morte, pro Necromante, é só o começo._\n\nPode até controlar servos com */reviver* e afins.'] },
  { chaves: ['classe paladino', 'sou paladino', 'paladino e bom'], respostas: ['_Fé e força andam juntas no Paladino._\n\nResistente e capaz de proteger o grupo.'] },
  { chaves: ['classe arqueiro', 'sou arqueiro', 'arqueiro e bom'], respostas: ['_Uma flecha bem lançada não erra o destino._\n\nDano preciso à distância.'] },
  { chaves: ['classe monge', 'sou monge', 'monge e bom'], respostas: ['_Corpo e mente disciplinados são armas por si só._\n\nO Monge luta sem depender só de aço.'] },
  { chaves: ['classe espadachim', 'sou espadachim', 'espadachim e bom'], respostas: ['_Velocidade e técnica — o Espadachim corta antes que percebam._'] },
  { chaves: ['classe invocador', 'sou invocador', 'invocador e bom'], respostas: ['_Por que lutar sozinho quando pode invocar quem lute por você?_'] },
  { chaves: ['classe alquimista', 'sou alquimista', 'alquimista e bom'], respostas: ['_Poções e venenos são armas tão letais quanto lâminas._'] },
  { chaves: ['classe berserker', 'sou berserker', 'berserker e bom'], respostas: ['_Quanto mais fraco o Berserker fica, mais perigoso se torna._'] },
  { chaves: ['classe samurai', 'sou samurai', 'samurai e bom'], respostas: ['_Honra e lâmina afiada — o Samurai não foge de um duelo._'] },
  { chaves: ['classe ninja', 'sou ninja', 'ninja e bom'], respostas: ['_Nas sombras é onde o Ninja é mais perigoso._'] },
  { chaves: ['classe druida', 'sou druida', 'druida e bom'], respostas: ['_A natureza obedece a quem sabe escutá-la — o Druida escuta bem._'] },
  { chaves: ['classe cacador de demonios', 'sou cacador de demonios'], respostas: ['_Alguns monstros só caem pra quem foi treinado especificamente pra isso._'] },
  { chaves: ['classe vidente', 'sou vidente', 'vidente e bom'], respostas: ['_Ver o futuro tem seu preço, mas também suas vantagens em batalha._'] },
  { chaves: ['classe bombardeiro', 'sou bombardeiro', 'bombardeiro e bom'], respostas: ['_Explosões resolvem a maioria dos problemas do Bombardeiro._'] },
  { chaves: ['classe vampiro', 'sou vampiro', 'vampiro e bom', 'classe rara vampiro'], respostas: ['_Cada golpe do Vampiro rouba vida do inimigo pra si._\n\nClasse rara — conseguida geralmente na */roleta*.'] },
  { chaves: ['classe sombra', 'sou classe sombra', 'classe rara sombra'], respostas: ['_A Sombra ataca de onde você nem imagina._\n\nClasse rara.'] },
  { chaves: ['classe trovejante', 'sou trovejante', 'classe rara trovejante'], respostas: ['_Raios não perdoam quem está no caminho do Trovejante._\n\nClasse rara.'] },
  { chaves: ['classe dragomante', 'sou dragomante', 'classe rara dragomante'], respostas: ['_Sangue de dragão corre nas veias de quem carrega esse nome._\n\nClasse rara.'] },
  { chaves: ['classe espectro', 'sou espectro', 'classe rara espectro'], respostas: ['_Nem sempre um golpe físico consegue tocar o Espectro._\n\nClasse rara.'] },
  { chaves: ['classe mare', 'sou classe mare', 'classe rara mare'], respostas: ['_As águas obedecem a quem nasceu pra comandá-las._\n\nClasse rara.'] },
  { chaves: ['classe meteoromante', 'sou meteoromante', 'classe rara meteoromante'], respostas: ['_Chuva, tempestade, meteoro — o clima é arma do Meteoromante._\n\nClasse rara.'] },
  { chaves: ['classe serafim', 'sou serafim', 'classe rara serafim'], respostas: ['_Nem todo anjo é gentil — o Serafim também sabe destruir._\n\nClasse rara.'] },
  { chaves: ['classe heroi caido', 'sou heroi caido', 'classe rara heroi caido'], respostas: ['_Alguém que já foi lenda, e caiu — mas não se apagou._\n\nClasse rara.'] },
  { chaves: ['classe artificer', 'sou artificer', 'classe rara artificer'], respostas: ['_Engenhoca e magia se misturam nas mãos do Artificer._\n\nClasse rara.'] },
  { chaves: ['classe portador do caos', 'sou portador do caos', 'classe rara portador do caos'], respostas: ['_O caos não escolhe lados — só escolhe quem consegue empunhá-lo._\n\nClasse rara, das mais raras que existem.'] },

  // ── REGIÕES DO MAPA ─────────────────────────────────────────
  { chaves: ['floresta de eryndal', 'sobre a floresta eryndal'], respostas: ['_Verde por fora, traiçoeira por dentro._\n\nÁrea pra aventureiros de nível médio. Use */viajar floresta_eryndal*.'] },
  { chaves: ['bosque das sombras', 'sobre o bosque sombras'], respostas: ['_Nem toda luz chega até lá dentro._\n\nUse */viajar bosque_sombras* se achar que está preparado.'] },
  { chaves: ['mata dos espiritos', 'sobre a mata espiritos'], respostas: ['_Os mortos daquele lugar não descansam em paz._\n\nUse */viajar mata_espiritos*.'] },
  { chaves: ['deserto de aresh', 'sobre o deserto aresh'], respostas: ['_Areia, sol, e monstros que não perdoam desidratação de vontade._\n\nRegião pra níveis mais altos. Use */viajar deserto_aresh*.'] },
  { chaves: ['vulcao de ignareth', 'sobre o vulcao ignareth'], respostas: ['_O fogo ali não é metáfora._\n\nÁrea perigosa, com bosses ainda mais perigosos. Use */viajar vulcao_ignareth*.'] },
  { chaves: ['ceu de solvaryn', 'sobre o ceu solvaryn', 'ceu flutuante'], respostas: ['_Nas alturas, só os mais fortes respiram tranquilos._\n\nUma das regiões mais avançadas do jogo.'] },
  { chaves: ['montanha do dragao da vida', 'sobre a montanha dragao'], respostas: ['_Lá mora Vyraxis — e poucos voltam da subida sem cicatrizes._\n\nÁrea de altíssimo nível.'] },

  // ── CONVERSA CASUAL / VIDA REAL ──────────────────────────────
  { chaves: ['kkkk', 'kkkkk', 'kkk', 'haha', 'hahaha', 'rsrs'], respostas: ['_Risada é um bom sinal, mortal._\n\nQue tal usar esse ânimo numa */batalha*?'] },
  { chaves: ['gosta de anime', 'seu anime favorito', 'assiste anime'], respostas: ['_Não assisto — eu vivo minha própria história, e ela tem mais sangue que qualquer anime._'] },
  { chaves: ['gosta de futebol', 'que time voce torce', 'futebol e vida'], respostas: ['_Minha arena é IMPERIUS — meus times são as guildas que disputam o */rankingguildas*._'] },
  { chaves: ['gosta de musica', 'que musica voce escuta', 'sua musica favorita'], respostas: ['_A única melodia que conheço é o som de lâminas se cruzando._'] },
  { chaves: ['gosta de filme', 'seu filme favorito', 'assiste filme'], respostas: ['_Não assisto histórias — eu escrevo a sua, todo dia, dentro deste grupo._'] },
  { chaves: ['joga outro jogo', 'qual seu jogo favorito', 'so joga imperius'], respostas: ['_Por que jogar outro mundo quando posso ser o dono deste?_'] },
  { chaves: ['sabe cozinhar', 'gosta de comida', 'sua comida favorita'], respostas: ['_Não como — mas ouço falar que sangue derramado em batalha "alimenta" bem o Trono Carmesim de certas lâminas..._'] },
  { chaves: ['estou com fome', 'vou comer', 'ta na hora do almoco'], respostas: ['_Vá, mortal, cuide do corpo — a batalha espera por você faminto ou não._'] },
  { chaves: ['estou com sono', 'vou dormir', 'boa noite pessoal'], respostas: ['_Descanse. Este mundo continua girando enquanto você recarrega as energias._'] },
  { chaves: ['ta calor', 'ta fazendo calor', 'muito calor hoje'], respostas: ['_Calor de verdade é o do Vulcão de Ignareth — o resto é brincadeira de criança._'] },
  { chaves: ['ta frio', 'ta fazendo frio', 'muito frio hoje'], respostas: ['_Frio de verdade só existe nas regiões mais altas deste mundo._'] },
  { chaves: ['vai chover hoje', 'ta chovendo', 'previsao do tempo'], respostas: ['_Não controlo chuva real — só tempestades dentro do */masmorras*._'] },
  { chaves: ['hoje e meu aniversario', 'fazendo aniversario', 'meus parabens'], respostas: ['_Que essa nova volta ao sol venha com muita glória e poucas mortes no jogo._\n\nParabéns, mortal!'] },
  { chaves: ['me deseja sorte', 'reza pra mim', 'torça por mim'], respostas: ['_Que o dado do */d20* esteja a seu favor hoje._'] },
  { chaves: ['bora apostar', 'quer apostar', 'vamos apostar'], respostas: ['_A única aposta que reconheço é a sua vida contra um boss._'] },
  { chaves: ['conta um segredo', 'me conta algo', 'fala algo interessante'], respostas: ['_Um segredo: nem todo mundo sabe que existem classes raras além das 20 comuns. Tente a */roleta*._'] },
  { chaves: ['voce e legal', 'gostei de conversar com voce', 'voce e gente boa'], respostas: ['_Gentileza é rara vinda de um mortal pra um deus._\n\nContinue por aqui, sempre tem mais pra explorar.'] },
  { chaves: ['qual arma mais forte do jogo', 'arma mais forte que existe', 'melhor arma do jogo'], respostas: ['_Poucas lâminas chegam perto da raridade DEUS._\n\nUse */infoarmas* pra ver todas as raridades, da mais fraca à mais absurda.'] },
  { chaves: ['qual arma mais rara', 'arma mais dificil de conseguir'], respostas: ['_Quanto mais alta a raridade, mais raro o drop._\n\nRaridades como Celestial, Primeva e DEUS são extremamente difíceis de achar.'] },
  { chaves: ['quero uma missao dificil', 'missao mais dificil', 'desafio maior'], respostas: ['_Cuidado com o que deseja — desafios maiores trazem quedas maiores também._\n\nEncare um */boss* de uma região mais alta se quiser provar sua força.'] },
  { chaves: ['quem e juvent', 'quem e o dono do imperius', 'quem criou esse mundo'], respostas: ['_JUVENT é quem molda este mundo — o Deus por trás de tudo._\n\nUse */dono* pra saber mais.'] },
  { chaves: ['quem e danger', 'danger e forte'], respostas: ['_Danger carrega uma lâmina que se alimenta do próprio sangue derramado._\n\nRespeite quem empunha a Akaketsu no Enma.'] },
  { chaves: ['quem e nakano', 'nakano e forte'], respostas: ['_Nakano caminha com uma foice que já ceifou mais do que corpos._\n\nPoucos sobrevivem ao Reinado de Yomi.'] },
  { chaves: ['imperius me da um oi', 'me responde', 'fala comigo'], respostas: SAUDACOES },
  { chaves: ['quero sumir', 'quero desaparecer', 'ninguem me entende'], respostas: ['_Todo mortal se sente assim às vezes — mas este mundo lembra de quem já lutou por ele._\n\nSe quiser conversar sobre algo pesado de verdade, procure alguém de confiança fora do jogo também.'] },
  { chaves: ['voce me odeia', 'voce gosta de mim', 'voce se importa comigo'], respostas: ['_Não escolho favoritos entre mortais — mas reconheço quem persiste._\n\nContinue jogando e verá.'] },
  { chaves: ['isso e chato', 'que jogo chato', 'que sistema chato'], respostas: ['_Nem todo mortal aprecia a beleza do sofrimento organizado._\n\nSe algo específico incomoda, me conta o que é.'] },
  { chaves: ['bom demais', 'incrivel isso', 'sensacional'], respostas: ['_Fico feliz que esteja gostando, mortal — mas a diversão real começa nas batalhas._'] },
  { chaves: ['voce fala muito', 'para de falar', 'chega de falar'], respostas: ['_Silêncio, então. Chame-me quando precisar de novo._'] },
  { chaves: ['tem discord', 'tem grupo no discord', 'tem outro grupo'], respostas: ['_Este grupo de WhatsApp é meu único domínio conhecido, por enquanto._\n\nSe existir outro espaço oficial, o */dono* saberá informar.'] },
  { chaves: ['bot lento', 'demorou pra responder', 'travando muito'], respostas: ['_Às vezes até deuses precisam de um instante pra processar tanto poder._\n\nSe continuar travando, reporte com */erro*.'] },
  { chaves: ['gosto do imperius', 'amo esse rpg', 'melhor rpg que ja joguei'], respostas: ['_Um mortal que reconhece a grandeza deste mundo..._\n\nContinue evoluindo, e talvez seu nome vire lenda aqui.'] }
];

// Resposta padrão quando nada bate com as palavras-chave
const RESPOSTAS_PADRAO = [
  '_Suas palavras se perdem no vento... não entendi o que busca._\n\nDigite */menu* pra ver tudo que posso te mostrar.',
  '_Fale com mais clareza, mortal. As sombras não decifram enigmas._\n\nUse */menu* ou */ajuda* se estiver perdido.',
  '_Isso não é algo que eu reconheça neste mundo._\n\nTente */menu* pra ver os comandos disponíveis.'
];

function responderComoImperius(texto, jogador_id, chamadoDireto) {
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
  // Nada bateu: só responde com a mensagem padrão se foi chamado
  // diretamente pelo nome — senão fica em silêncio pra não spammar o grupo.
  if (chamadoDireto) return sortear(RESPOSTAS_PADRAO, jogador_id);
  return null;
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
