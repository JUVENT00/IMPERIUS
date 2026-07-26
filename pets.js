// ============================================================
// IMPERIUS RPG — SISTEMA DE PETS v2.0
// Apenas criaturas mitológicas antigas
// ============================================================
const { getJogador, salvarJogador, adicionarConquista, formatarBelarium, formatarPreco } = require('./db');

// ── ESTADOS DAS CRIATURAS ────────────────────────────────
const ESTADOS = {
  dormindo:  { emoji: '😴', nome: 'Dormindo',  chance: 95, descricao: 'A criatura dorme profundamente...' },
  calmo:     { emoji: '😊', nome: 'Calmo',     chance: 85, descricao: 'A criatura parece tranquila.' },
  curioso:   { emoji: '🤔', nome: 'Curioso',   chance: 75, descricao: 'A criatura te observa com curiosidade.' },
  neutro:    { emoji: '😐', nome: 'Neutro',    chance: 60, descricao: 'A criatura não reage.' },
  assustado: { emoji: '😟', nome: 'Assustado', chance: 45, descricao: 'A criatura recua com medo.' },
  irritado:  { emoji: '😤', nome: 'Irritado',  chance: 35, descricao: 'A criatura rosna baixinho.' },
  raivoso:   { emoji: '😡', nome: 'Raivoso',   chance: 25, descricao: 'A criatura rosna e mostra os dentes!' },
  furioso:   { emoji: '🔥', nome: 'Furioso',   chance: 15, descricao: 'A criatura ataca qualquer coisa perto!' },
  berserk:   { emoji: '⚡', nome: 'Berserk',   chance: 5,  descricao: 'A criatura perdeu o controle!' },
  possesso:  { emoji: '☠️', nome: 'Possesso',  chance: 2,  descricao: 'Uma força sombria controla a criatura...' },
};

// Quanto o estado da criatura muda a chance de domar (some/subtrai da chance base)
const ESTADO_MODIFICADOR = {
  dormindo: 30, calmo: 20, curioso: 10, neutro: 0, assustado: -5,
  irritado: -10, raivoso: -20, furioso: -30, berserk: -40, possesso: -50
};

// ── ITENS QUE AUMENTAM CHANCE DE DOMAR ──────────────────
const ITENS_DOMAR = {
  // 🥩 CARNES
  'carne crua':          { bonus: 10, preco: 30,  nome: '🥩 Carne Crua',            descricao: 'Um pedaço de carne crua básica' },
  'carne':               { bonus: 20, preco: 60,  nome: '🥩 Carne Fresca',           descricao: 'Um pedaço de carne fresca e saborosa' },
  'carne assada':        { bonus: 25, preco: 80,  nome: '🥩 Carne Assada',           descricao: 'Carne assada com ervas silvestres' },
  'carne rara':          { bonus: 35, preco: 150, nome: '🥩 Carne Rara',             descricao: 'Uma carne de animal raro e saboroso' },
  'carne de dragao':     { bonus: 45, preco: 400, nome: '🥩 Carne de Dragão',        descricao: 'Carne de dragão — irresistível para criaturas' },
  'carne sagrada':       { bonus: 55, preco: 600, nome: '🥩 Carne Sagrada',          descricao: 'Carne abençoada pelos deuses antigos' },
  'carne maldita':       { bonus: 40, preco: 300, nome: '🥩 Carne Maldita',          descricao: 'Carne imbuída de energia sombria' },

  // 🍯 MÉIS E DOCES
  'mel simples':         { bonus: 15, preco: 50,  nome: '🍯 Mel Simples',            descricao: 'Mel comum de abelhas silvestres' },
  'mel sagrado':         { bonus: 60, preco: 700, nome: '🍯 Mel Sagrado',            descricao: 'Mel abençoado pelos deuses antigos' },
  'mel dourado':         { bonus: 50, preco: 500, nome: '🍯 Mel das Abelhas de Ouro',descricao: 'Mel de abelhas douradas mitológicas' },
  'ambrosia':            { bonus: 70, preco: 1200,nome: '✨ Ambrosia',               descricao: 'Alimento dos deuses gregos — poder divino' },
  'nectar':              { bonus: 65, preco: 900, nome: '🌟 Néctar dos Deuses',      descricao: 'Bebida sagrada dos deuses do Olimpo' },

  // 🌿 ERVAS E ESSÊNCIAS
  'erva do bosque':      { bonus: 12, preco: 40,  nome: '🌿 Erva do Bosque',         descricao: 'Erva selvagem com propriedades calmantes' },
  'erva ancestral':      { bonus: 25, preco: 120, nome: '🌿 Erva Ancestral',         descricao: 'Erva de era ancestral com poder antigo' },
  'essencia magica':     { bonus: 50, preco: 500, nome: '✨ Essência Mágica',        descricao: 'Essência que acalma qualquer criatura' },
  'essencia primordial': { bonus: 70, preco: 1000,nome: '✨ Essência Primordial',    descricao: 'Essência do início dos tempos' },
  'po de osso sagrado':  { bonus: 40, preco: 350, nome: '🦴 Pó de Osso Sagrado',    descricao: 'Pó de ossos de criaturas sagradas' },
  'raiz ancestral':      { bonus: 30, preco: 200, nome: '🌱 Raiz Ancestral',         descricao: 'Raiz de árvore milenar com poder calmante' },
  'cristal de alma':     { bonus: 60, preco: 800, nome: '💎 Cristal de Alma',        descricao: 'Cristal imbuído com essência espiritual' },

  // 🍎 FRUTAS MÍTICAS
  'maca dourada':        { bonus: 65, preco: 1000,nome: '🍎 Maçã Dourada',          descricao: 'Maçã das Hespérides — fruto da imortalidade' },
  'roma do hades':       { bonus: 55, preco: 700, nome: '🍎 Romã do Hades',         descricao: 'Romã do submundo — poder sobre os mortos' },
  'figo sagrado':        { bonus: 45, preco: 500, nome: '🍑 Figo Sagrado',          descricao: 'Figo sagrado de antigas tradições orientais' },
  'fruto da imortalidade':{ bonus: 75, preco: 1500,nome: '🌟 Fruto da Imortalidade',descricao: 'Fruto lendário que concede vida eterna' },
  'baga espiritual':     { bonus: 20, preco: 80,  nome: '🫐 Baga Espiritual',       descricao: 'Baga colhida em florestas espirituais' },

  // 🐟 AQUÁTICOS E MARINHOS
  'peixe espectral':     { bonus: 30, preco: 180, nome: '🐟 Peixe Espectral',       descricao: 'Peixe fantasma dos mares profundos' },
  'alga abissal':        { bonus: 25, preco: 150, nome: '🌊 Alga Abissal',          descricao: 'Alga das profundezas imensas do oceano' },
  'escama de leviata':   { bonus: 55, preco: 700, nome: '🐍 Escama de Leviatã',     descricao: 'Escama da serpente dos mares profundos' },
  'coral sagrado':       { bonus: 35, preco: 250, nome: '🪸 Coral Sagrado',         descricao: 'Coral de recifes abençoados pelos deuses' },

  // 💎 MINERAIS E CRISTAIS
  'pedra de luz':        { bonus: 20, preco: 100, nome: '💎 Pedra de Luz',          descricao: 'Pedra que emite luz calmante' },
  'cristal de gelo':     { bonus: 30, preco: 200, nome: '🔷 Cristal de Gelo Eterno',descricao: 'Cristal formado em eras glaciais' },
  'minerio sagrado':     { bonus: 45, preco: 450, nome: '⭐ Minério Sagrado',       descricao: 'Minério abençoado por forças divinas' },
};

// ── CRIATURAS MITOLÓGICAS ANTIGAS ───────────────────────
const CRIATURAS = {

  // 🐣 CRIATURAS COMUNS (familiares menores da mitologia)
  kobold:         { nome: '👺 Kobold',            tipo: 'besta',    raridade: 'comum',      regiao: 'floresta_eryndal',  dano: [4,8],     habilidade: 'Golpe Travesso — pequeno ataque rápido', lore: 'Espírito germânico menor da mina e da casa, travesso mas inofensivo.' },
  pixie:          { nome: '🧚 Pixie',             tipo: 'espirito', raridade: 'comum',      regiao: 'mata_espiritos',    dano: [3,7],     habilidade: 'Poeira Encantada — confunde o inimigo por 1 turno', lore: 'Pequeno espírito britânico do folclore, brincalhão e curioso.' },
  salamandra_menor:{ nome: '🦎 Salamandra Menor', tipo: 'elemental',raridade: 'comum',      regiao: 'vulcao_ignareth',   dano: [5,9],     habilidade: 'Faísca — pequeno dano de fogo', lore: 'Filhote de espírito do fogo alquímico, ainda fraco mas resistente às chamas.' },
  naiade:         { nome: '💧 Náiade',            tipo: 'elemental',raridade: 'comum',      regiao: 'ilhas_marveth',     dano: [4,7],     habilidade: 'Gota Curativa — cura pequena a cada 3 turnos', lore: 'Ninfa grega menor das fontes e riachos, gentil com os viajantes.' },
  corvo_espectral:{ nome: '🐦 Corvo Espectral',   tipo: 'ave',      raridade: 'comum',      regiao: 'ruinas_aelthar',    dano: [5,8],     habilidade: 'Vigia Sombria — revela o próximo ataque inimigo', lore: 'Ave menor ligada aos espíritos, mensageira entre os vivos e os mortos.' },
  lagarto_das_dunas:{ nome: '🦎 Lagarto das Dunas', tipo: 'reptil', raridade: 'comum',      regiao: 'deserto_aresh',     dano: [4,9],     habilidade: 'Mordida Rasteira — ataque simples e rápido', lore: 'Pequeno réptil do deserto, resistente ao calor extremo.' },

  // 🐉 DRAGÕES ANCESTRAIS
  tiamat:         { nome: '🐉 Tiamat',           tipo: 'dragao',   raridade: 'primordial', regiao: 'torre_caos',        dano: [280,420], habilidade: 'Caos Primordial — ataca todos os inimigos simultaneamente', lore: 'Dragão babilônico do caos primordial, mãe de todos os monstros.' },
  nidhogg:        { nome: '🐉 Níðhöggr',         tipo: 'dragao',   raridade: 'abissal',    regiao: 'abismo_mar_negro',  dano: [220,350], habilidade: 'Devorar Raízes — corrói a defesa do inimigo permanentemente', lore: 'Serpente nórdica que rói as raízes de Yggdrasil desde o início dos tempos.' },
  fafnir:         { nome: '🐉 Fáfnir',           tipo: 'dragao',   raridade: 'lendario',   regiao: 'montanha_dragao_vida',   dano: [160,240], habilidade: 'Veneno de Ouro — envenena e maldiz o inimigo', lore: 'Anão nórdico transformado em dragão pela ganância pelo ouro maldito.' },
  vritra:         { nome: '🐉 Vritra',            tipo: 'dragao',   raridade: 'epico',      regiao: 'planicies_cinzas',  dano: [110,170], habilidade: 'Seca Devastadora — drena toda a mana do inimigo', lore: 'Serpente védica que bloqueava as águas do mundo, trazendo seca e destruição.' },
  yamata_orochi:  { nome: '🐍 Yamata no Orochi',  tipo: 'dragao',   raridade: 'divino',     regiao: 'vulcao_ignareth',   dano: [380,550], habilidade: 'Oito Cabeças — ataca oito vezes consecutivas', lore: 'Serpente japonesa de oito cabeças e oito caudas, terror dos mortais antigos.' },
  apophis:        { nome: '🐍 Apophis',           tipo: 'dragao',   raridade: 'primordial', regiao: 'deserto_aresh',     dano: [260,400], habilidade: 'Eclipse Eterno — escurece o campo de batalha e enfraquece todos', lore: 'Serpente egípcia do caos que tentava devorar o sol todas as noites.' },
  wyvern_ancia:   { nome: '🐉 Wyvern Anciã',      tipo: 'dragao',   raridade: 'ancestral',  regiao: 'montanha_dragao_vida',   dano: [200,280], habilidade: 'Voo Rasante — ataca duas vezes antes do inimigo reagir', lore: 'Dragão menor europeu, ancestral distante dos grandes dragões, temido por vilarejos inteiros.' },

  // 🦅 AVES MÍTICAS ANCESTRAIS
  anzu:           { nome: '🦅 Anzu',              tipo: 'ave',      raridade: 'lendario',   regiao: 'ceu_solvaryn',     dano: [140,210], habilidade: 'Roubo Divino — rouba o poder do inimigo', lore: 'Pássaro-leão sumério que roubou as Tábuas do Destino dos próprios deuses.' },
  ziz:            { nome: '🦅 Ziz',               tipo: 'ave',      raridade: 'primordial', regiao: 'ceu_solvaryn',     dano: [300,450], habilidade: 'Asa do Firmamento — bloqueia toda magia inimiga', lore: 'Ave colossal hebraica cujas asas bloqueiam o sol quando abre os olhos.' },
  bennu:          { nome: '🔥 Bennu',             tipo: 'ave',      raridade: 'epico',      regiao: 'vulcao_ignareth',   dano: [100,160], habilidade: 'Renascimento Solar — ressuscita o dono com HP cheio', lore: 'Ave sagrada egípcia ligada ao sol nascente, precursora da Fênix.' },
  thunderbird:    { nome: '⚡ Thunderbird',        tipo: 'ave',      raridade: 'epico',      regiao: 'serra_titas',       dano: [115,175], habilidade: 'Tempestade Ancestral — raios atingem todos os inimigos', lore: 'Espírito nativo americano das tempestades, criador dos trovões e relâmpagos.' },
  hraesvelgr:     { nome: '🦅 Hraesvelgr',        tipo: 'ave',      raridade: 'lendario',   regiao: 'tundra_voryn',      dano: [150,220], habilidade: 'Vento da Morte — ventos gélidos paralisam todos os inimigos', lore: 'Águia gigante nórdica que senta na borda do mundo e cria o vento com suas asas.' },
  garuda:         { nome: '🦅 Garuda',            tipo: 'ave',      raridade: 'divino',     regiao: 'montanha_dragao_vida',   dano: [350,500], habilidade: 'Destruidor de Serpentes — dano triplo contra répteis e dragões', lore: 'Rei das aves védico, montaria de Vishnu, inimigo eterno das serpentes Nagas.' },
  simurgh:        { nome: '🦅 Simurgh',           tipo: 'ave',      raridade: 'lendario',   regiao: 'pico_kaldros',      dano: [130,190], habilidade: 'Pena de Cura — restaura completamente o HP do dono', lore: 'Ave persa imortal que viveu três eras do mundo e conhece todos os segredos.' },
  roque:          { nome: '🦅 Roque',             tipo: 'ave',      raridade: 'ancestral',  regiao: 'ilhas_marveth',     dano: [190,270], habilidade: 'Garras Colossais — agarra e imobiliza o inimigo', lore: 'Ave gigante das Mil e Uma Noites, capaz de carregar elefantes nas garras.' },

  // 🐺 BESTAS ANCESTRAIS
  fenrir:         { nome: '🐺 Fenrir',            tipo: 'besta',    raridade: 'lendario',   regiao: 'tundra_voryn',      dano: [150,220], habilidade: 'Mordida do Apocalipse — atravessa qualquer defesa divina', lore: 'Lobo colossal nórdico filho de Loki, destinado a devorar Odin no Ragnarök.' },
  ammit:          { nome: '🦁 Ammit',             tipo: 'besta',    raridade: 'epico',      regiao: 'necropole_draktum', dano: [100,155], habilidade: 'Devorar Alma — elimina inimigo morto imediatamente', lore: 'Criatura egípcia com cabeça de crocodilo, corpo de leão e traseiro de hipopótamo.' },
  manticora:      { nome: '🦁 Manticora',         tipo: 'besta',    raridade: 'raro',       regiao: 'deserto_aresh',     dano: [70,110],  habilidade: 'Espinhos Venenosos — envenena o inimigo por 3 turnos', lore: 'Criatura persa com rosto humano, corpo de leão e cauda de escorpião.' },
  nemean_lion:    { nome: '🦁 Leão de Nemeia',    tipo: 'besta',    raridade: 'raro',       regiao: 'planicies_cinzas',  dano: [65,100],  habilidade: 'Pele Invulnerável — reflete 40% do dano recebido', lore: 'Leão grego invulnerável a qualquer arma mortal, derrotado por Hércules.' },
  erymanthian:    { nome: '🐗 Javali de Erimanto', tipo: 'besta',   raridade: 'incomum',    regiao: 'floresta_eryndal',  dano: [30,50],   habilidade: 'Investida Selvagem — dano dobrado no primeiro ataque', lore: 'Javali colossal grego que devastava o monte Erimanto no inverno.' },
  catoblepas:     { nome: '🐃 Catoblepas',        tipo: 'besta',    raridade: 'epico',      regiao: 'pantano_maldito',   dano: [90,140],  habilidade: 'Olhar Petrificante — paralisa o inimigo por 2 turnos', lore: 'Besta etíope cujo olhar ou sopro transformava tudo em pedra.' },
  kirin:          { nome: '🦄 Kirin',             tipo: 'besta',    raridade: 'lendario',   regiao: 'valdris',           dano: [120,180], habilidade: 'Presença Sagrada — todos os ataques inimigos erram', lore: 'Criatura sagrada chinesa que só aparece na era de um governante justo.' },
  behemoth_menor: { nome: '🐘 Behemoth Menor',    tipo: 'besta',    raridade: 'ancestral',  regiao: 'planicies_cinzas',  dano: [195,275], habilidade: 'Passo Sísmico — atordoa todos os inimigos por 1 turno', lore: 'Besta bíblica menor, ainda jovem, mas capaz de abalar a terra com seus passos.' },


  // 🐍 RÉPTEIS MÍTICOS ANCESTRAIS
  basilisco:      { nome: '🐍 Basilisco',         tipo: 'reptil',   raridade: 'epico',      regiao: 'ruinas_aelthar',    dano: [85,130],  habilidade: 'Olhar Letal — mata instantaneamente criaturas comuns', lore: 'Rei das serpentes medievais cujo olhar ou sopro matava qualquer ser vivo.' },
  ladon:          { nome: '🐍 Ládon',             tipo: 'reptil',   raridade: 'lendario',   regiao: 'floresta_eryndal',  dano: [140,210], habilidade: 'Guardião Eterno — nunca dorme, nunca para de atacar', lore: 'Serpente grega de cem cabeças que guardava as maçãs douradas das Hespérides.' },
  lernaean_hydra: { nome: '🐉 Hidra de Lerna',    tipo: 'reptil',   raridade: 'epico',      regiao: 'pantano_maldito',   dano: [80,125],  habilidade: 'Regeneração Infinita — recupera HP a cada turno', lore: 'Hidra grega de múltiplas cabeças que regeneravam quando cortadas.' },
  typhon:         { nome: '🐍 Tífon',             tipo: 'reptil',   raridade: 'primordial', regiao: 'vulcao_ignareth',   dano: [270,410], habilidade: 'Pai dos Monstros — invoca criaturas menores na batalha', lore: 'Monstro grego mais poderoso já criado, pai de todas as bestas míticas.' },
  jormungandr:    { nome: '🐍 Jörmungandr',       tipo: 'reptil',   raridade: 'divino',     regiao: 'abismo_mar_negro',  dano: [400,580], habilidade: 'Veneno do Fim dos Tempos — reduz todos os atributos do inimigo a zero', lore: 'Serpente nórdica tão colossal que envolve o mundo inteiro mordendo a própria cauda.' },
  naga_ancia:     { nome: '🐍 Naga Anciã',        tipo: 'reptil',   raridade: 'epico',      regiao: 'ilhas_marveth',     dano: [90,140],  habilidade: 'Maldição Ancestral — reduz todos os atributos do inimigo', lore: 'Serpente divina védica guardiã das águas subterrâneas e dos tesouros ocultos.' },
  quetzalcoatl_menor: { nome: '🐍 Quetzalcoatl Menor', tipo: 'reptil', raridade: 'ancestral', regiao: 'floresta_eryndal', dano: [205,285], habilidade: 'Vento Emplumado — cura e acelera o dono por 3 turnos', lore: 'Avatar juvenil da serpente emplumada asteca, ainda reunindo seu poder divino.' },

  // 🌊 CRIATURAS AQUÁTICAS ANCESTRAIS
  charybdis:      { nome: '🌀 Charybdis',         tipo: 'aquatico', raridade: 'lendario',   regiao: 'abismo_mar_negro',  dano: [150,230], habilidade: 'Redemoinho Eterno — engole o inimigo, dano massivo garantido', lore: 'Monstro marinho grego que criava redemoinhos devastadores três vezes ao dia.' },
  scylla:         { nome: '🦑 Scylla',            tipo: 'aquatico', raridade: 'lendario',   regiao: 'ilhas_marveth',     dano: [145,215], habilidade: 'Seis Gargantas — ataca seis vezes consecutivas', lore: 'Monstruosidade grega de seis cabeças que devorava marinheiros que passavam pelo estreito.' },
  hafgufa:        { nome: '🐋 Hafgufa',           tipo: 'aquatico', raridade: 'primordial', regiao: 'abismo_mar_negro',  dano: [290,430], habilidade: 'Ilha Viva — atrai e devora frotas inteiras de navios', lore: 'Leviatã escandinavo tão imenso que era confundido com uma ilha pelos marinheiros.' },
  aspidochelone:  { nome: '🐢 Aspidochelone',     tipo: 'aquatico', raridade: 'epico',      regiao: 'ilhas_marveth',     dano: [95,145],  habilidade: 'Carapaça Ancestral — defesa absoluta por 2 turnos', lore: 'Tartaruga colossal medieval confundida com ilha por navegadores cristãos.' },
  isonade:        { nome: '🦈 Isonade',           tipo: 'aquatico', raridade: 'raro',       regiao: 'abismo_mar_negro',  dano: [70,110],  habilidade: 'Corrente Submersa — arrasta inimigo para o fundo', lore: 'Espírito japonês na forma de tubarão colossal que afundava navios com sua cauda.' },
  cetus:          { nome: '🐉 Cetus',             tipo: 'aquatico', raridade: 'epico',      regiao: 'ilhas_marveth',     dano: [100,155], habilidade: 'Terror do Mar — aterroriza todos os inimigos na batalha', lore: 'Monstro marinho grego enviado por Poseidon para devastar as costas de Etiópia.' },
  cipactli:       { nome: '🐊 Cipactli',          tipo: 'aquatico', raridade: 'primordial', regiao: 'pantano_maldito',   dano: [250,380], habilidade: 'Fome Primordial — devora a vida do inimigo a cada turno', lore: 'Crocodilo primordial asteca do qual os próprios deuses criaram a Terra.' },
  ryujin:         { nome: '🐉 Ryūjin',            tipo: 'aquatico', raridade: 'divino',     regiao: 'abismo_mar_negro',  dano: [360,520], habilidade: 'Joia das Marés — controla o fluxo da batalha à vontade', lore: 'Dragão japonês senhor do mar, cujas joias controlavam as marés do mundo.' },
  kraken_jovem:   { nome: '🐙 Kraken Jovem',       tipo: 'aquatico', raridade: 'ancestral',  regiao: 'abismo_mar_negro',  dano: [210,290], habilidade: 'Tentáculos Múltiplos — agarra até 2 inimigos por turno', lore: 'Filhote do lendário Kraken escandinavo, já capaz de afundar pequenos navios.' },

  // 👻 ESPÍRITOS E MORTOS-VIVOS ANCESTRAIS
  draugr:         { nome: '💀 Draugr',            tipo: 'espirito', raridade: 'incomum',    regiao: 'necropole_draktum', dano: [30,50],   habilidade: 'Força do Túmulo — força sobrenatural além da compreensão', lore: 'Morto-vivo nórdico que habita túmulos, dotado de força descomunal e magia negra.' },
  gashadokuro:    { nome: '💀 Gashadokuro',        tipo: 'espirito', raridade: 'epico',      regiao: 'necropole_draktum', dano: [100,155], habilidade: 'Dentes Colossal — devora o inimigo em um único golpe', lore: 'Esqueleto gigante japonês formado pelos ossos de guerreiros mortos de fome.' },
  strigoi:        { nome: '🧛 Strigoi',           tipo: 'espirito', raridade: 'raro',       regiao: 'bosque_sombras',    dano: [65,100],  habilidade: 'Roubo Vital — suga a força vital do inimigo a cada turno', lore: 'Vampiro ancestral romeno, espírito maligno que retorna da morte para atormentar os vivos.' },
  erinyes:        { nome: '👁️ Erínias',           tipo: 'espirito', raridade: 'lendario',   regiao: 'ruinas_aelthar',    dano: [140,210], habilidade: 'Maldição das Fúrias — o inimigo ataca a si mesmo', lore: 'Deusas gregas da vingança que perseguiam criminosos por toda a eternidade.' },
  banshee:        { nome: '👻 Banshee',           tipo: 'espirito', raridade: 'raro',       regiao: 'mata_espiritos',    dano: [60,95],   habilidade: 'Lamento Profético — anuncia e causa a morte do inimigo mais fraco', lore: 'Espírito irlandês feminino cujo grito anunciava a morte iminente de alguém.' },
  yuki_onna:      { nome: '❄️ Yuki-Onna',         tipo: 'espirito', raridade: 'epico',      regiao: 'cavernas_gelo',     dano: [90,140],  habilidade: 'Beijo Glacial — congela o inimigo completamente por 3 turnos', lore: 'Espírito japonês da neve que congelava viajantes perdidos nas tempestades de inverno.' },
  aswang:         { nome: '🌑 Aswang',            tipo: 'espirito', raridade: 'epico',      regiao: 'pantano_maldito',   dano: [85,135],  habilidade: 'Forma Sombria — torna-se intangível, esquivando de todos os ataques', lore: 'Espírito filipino das trevas capaz de assumir qualquer forma para enganar suas vítimas.' },
  ceifador_antigo:{ nome: '💀 Ceifador Antigo',    tipo: 'espirito', raridade: 'ancestral',  regiao: 'necropole_draktum', dano: [200,280], habilidade: 'Colheita das Almas — rouba HP proporcional ao dano causado', lore: 'Antigo espírito coletor de almas, precursor das lendas da morte encarnada.' },

  // 🔥 ELEMENTAIS E FORÇAS PRIMORDIAIS
  ifrit:          { nome: '🔥 Ifrit',             tipo: 'elemental',raridade: 'epico',      regiao: 'vulcao_ignareth',   dano: [100,155], habilidade: 'Chama Infernal — queima o inimigo por 5 turnos', lore: 'Djinn de fogo árabe das mil e uma noites, espírito poderoso feito de chamas sem fumaça.' },
  marid:          { nome: '🌊 Marid',             tipo: 'elemental',raridade: 'lendario',   regiao: 'abismo_mar_negro',  dano: [140,210], habilidade: 'Tsunami Ancestral — arrasa todos os inimigos com ondas colossais', lore: 'Djinn das águas árabe, o mais poderoso dos espíritos elementais, senhor dos mares.' },
  sylph:          { nome: '🌪️ Sylph',             tipo: 'elemental',raridade: 'raro',       regiao: 'ceu_solvaryn',     dano: [60,95],   habilidade: 'Corrente de Ar — impossibilita ataques físicos por 2 turnos', lore: 'Espírito do ar alquímico medieval, habitante invisível dos ventos e tempestades.' },
  salamandra:     { nome: '🔥 Salamandra',        tipo: 'elemental',raridade: 'raro',       regiao: 'planicies_cinzas',  dano: [55,90],   habilidade: 'Pele de Brasas — imune ao fogo, reflete ataques flamejantes', lore: 'Espírito alquímico do fogo medieval, lagarto que vivia nas chamas sem se queimar.' },
  undine:         { nome: '💧 Undine',            tipo: 'elemental',raridade: 'raro',       regiao: 'ilhas_marveth',     dano: [55,85],   habilidade: 'Cura das Águas — restaura 35% do HP do dono por turno', lore: 'Espírito das águas alquímico medieval, ser feminino que habitava rios e lagos.' },
  gnomo_antigo:   { nome: '🪨 Gnomo Ancestral',   tipo: 'elemental',raridade: 'incomum',    regiao: 'ruinas_aelthar',    dano: [25,40],   habilidade: 'Pele de Pedra — reduz todo dano recebido em 50%', lore: 'Espírito da terra alquímico medieval, guardião dos minerais e tesouros subterrâneos.' },
  djinn_ancestral:{ nome: '🧞 Djinn Ancestral',   tipo: 'elemental',raridade: 'ancestral',  regiao: 'deserto_aresh',     dano: [200,280], habilidade: 'Desejo Sombrio — concede um efeito aleatório poderoso a cada batalha', lore: 'Djinn de eras remotas, anterior a Ifrit e Marid, guardião de segredos esquecidos.' },

  // 🦄 CRIATURAS ÚNICAS SAGRADAS
  unicornio:      { nome: '🦄 Unicórnio',         tipo: 'unico',    raridade: 'lendario',   regiao: 'valdris',           dano: [110,170], habilidade: 'Chifre Sagrado — purifica venenos, maldições e ressuscita aliados', lore: 'Criatura sagrada medieval europeia cujo chifre purificava águas envenenadas.' },
  qilin:          { nome: '🦄 Qilin',             tipo: 'unico',    raridade: 'primordial', regiao: 'floresta_eryndal',   dano: [260,390], habilidade: 'Presença Divina — nenhum inimigo erra um ataque, mas também não acerta', lore: 'Criatura sagrada chinesa que só aparecia no nascimento de um sábio ou imperador.' },
  cerbero:        { nome: '🐕 Cérbero',           tipo: 'unico',    raridade: 'unico',      regiao: 'necropole_draktum', dano: [320,480], habilidade: 'Guardião do Hades — nenhum inimigo pode fugir da batalha', exclusivo: null },
  dragao_juvent:  { nome: '☠️ Dragão de JUVENT',  tipo: 'unico',    raridade: 'divino',     regiao: 'especial',          dano: [500,999], habilidade: 'Apocalipse de JUVENT — devastação absoluta', exclusivo: 'ajudante_deus' },
  duende_domestico: { nome: "🏠 Duende Doméstico", tipo: "espirito", raridade: "comum", regiao: "valdris", dano: [3,8], habilidade: "Travessura Leve — some com um item do inimigo por 1 turno", lore: "Espírito eslavo que vive dentro de casas, ajudando ou pregando peças conforme o humor." },
  rato_das_sombras: { nome: "🐀 Rato das Sombras", tipo: "besta", raridade: "comum", regiao: "bosque_sombras", dano: [3,7], habilidade: "Mordida Furtiva — ataque rápido que ignora parte da defesa", lore: "Roedor comum corrompido pela escuridão do bosque, ainda assim covarde e fácil de assustar." },
  sapo_venenoso_menor: { nome: "🐸 Sapo Venenoso Menor", tipo: "besta", raridade: "comum", regiao: "pantano_maldito", dano: [4,9], habilidade: "Muco Tóxico — pequena chance de envenenar o inimigo", lore: "Anfíbio do pântano cuja pele libera toxinas leves quando ameaçado." },
  morcego_cavernas: { nome: "🦇 Morcego das Cavernas", tipo: "besta", raridade: "comum", regiao: "cavernas_gelo", dano: [3,8], habilidade: "Eco Sônico — reduz a precisão do inimigo por 1 turno", lore: "Mamífero comum das cavernas geladas, voa em bandos e se orienta por ecolocalização." },
  aranha_tunel: { nome: "🕷️ Aranha de Túnel", tipo: "besta", raridade: "comum", regiao: "ruinas_aelthar", dano: [4,9], habilidade: "Teia Simples — reduz a velocidade do inimigo", lore: "Aracnídeo que tece teias entre as colunas quebradas das ruínas antigas." },
  escaravelho_dourado_menor: { nome: "🪲 Escaravelho Dourado Menor", tipo: "besta", raridade: "comum", regiao: "deserto_aresh", dano: [3,8], habilidade: "Casco Duro — reduz o dano recebido em 10%", lore: "Inseto egípcio associado ao sol nascente, comum entre as areias do deserto." },
  peixe_voador: { nome: "🐟 Peixe Voador", tipo: "aquatico", raridade: "comum", regiao: "ilhas_marveth", dano: [3,7], habilidade: "Salto Rasante — ataque surpresa fora d'água", lore: "Peixe comum das ilhas, capaz de planar curtas distâncias sobre as ondas." },
  fogo_fatuo: { nome: "🔥 Fogo-Fátuo", tipo: "espirito", raridade: "comum", regiao: "pantano_maldito", dano: [4,9], habilidade: "Luz Enganosa — confunde o inimigo por 1 turno", lore: "Luzes errantes do folclore europeu, que guiam viajantes para o perigo nos pântanos." },
  coelho_lunar: { nome: "🐇 Coelho Lunar", tipo: "besta", raridade: "comum", regiao: "tundra_voryn", dano: [3,7], habilidade: "Salto Gélido — pequeno dano de gelo", lore: "Criatura do folclore do leste asiático, dito viver na lua preparando elixires." },
  cristal_vivo_menor: { nome: "💎 Cristal Vivo Menor", tipo: "elemental", raridade: "comum", regiao: "cavernas_gelo", dano: [4,9], habilidade: "Reflexo Cristalino — devolve uma pequena parte do dano", lore: "Formação mineral animada por energia elemental residual das cavernas." },
  corvo_pressagio: { nome: "🐦‍⬛ Corvo Presságio", tipo: "ave", raridade: "comum", regiao: "necropole_draktum", dano: [4,9], habilidade: "Grasnar Sombrio — reduz a moral do inimigo, pequeno debuff", lore: "Ave comum associada à morte em diversas culturas, mensageira dos cemitérios." },
  lagartixa_flamejante: { nome: "🦎 Lagartixa Flamejante", tipo: "reptil", raridade: "comum", regiao: "vulcao_ignareth", dano: [4,10], habilidade: "Cauda Ardente — pequeno dano de fogo contínuo", lore: "Pequeno réptil adaptado ao calor extremo das encostas vulcânicas." },
  trasgo_das_pontes: { nome: "👹 Trasgo das Pontes", tipo: "besta", raridade: "incomum", regiao: "serra_titas", dano: [16,28], habilidade: "Emboscada — dano dobrado se atacar primeiro", lore: "Criatura do folclore escandinavo que vive sob pontes, cobrando \"pedágio\" de viajantes." },
  harpia_jovem: { nome: "🦅 Harpia Jovem", tipo: "ave", raridade: "incomum", regiao: "pico_kaldros", dano: [18,30], habilidade: "Garras Afiadas — pequena chance de sangramento", lore: "Fêmea alada grega ainda em formação, já perigosa em bando." },
  golem_argila: { nome: "🗿 Golem de Argila", tipo: "elemental", raridade: "incomum", regiao: "ruinas_aelthar", dano: [20,32], habilidade: "Corpo Rígido — reduz dano recebido em 15%", lore: "Autômato de argila animado por rituais antigos, guardião silencioso das ruínas." },
  serpente_marinha_jovem: { nome: "🐍 Serpente Marinha Jovem", tipo: "aquatico", raridade: "incomum", regiao: "abismo_mar_negro", dano: [17,30], habilidade: "Constrição — imobiliza o inimigo por 1 turno", lore: "Réptil marinho ainda em crescimento, já capaz de afundar barcos pequenos." },
  lobisomem_novato: { nome: "🐺 Lobisomem Novato", tipo: "besta", raridade: "incomum", regiao: "tundra_voryn", dano: [19,33], habilidade: "Fúria da Lua — dano aumentado à noite", lore: "Vítima recente de maldição licantrópica, ainda instável em suas transformações." },
  gargula_menor: { nome: "🗿 Gárgula Menor", tipo: "elemental", raridade: "incomum", regiao: "torre_caos", dano: [18,31], habilidade: "Vigília de Pedra — imune a ataques furtivos", lore: "Estátua animada que guarda torres antigas, imóvel até sentir uma ameaça." },
  leprechaun: { nome: "🍀 Leprechaun", tipo: "espirito", raridade: "incomum", regiao: "floresta_eryndal", dano: [15,27], habilidade: "Sorte Roubada — pequena chance de roubar Belarium do inimigo", lore: "Duende irlandês guardião de tesouros escondidos, ágil e trapaceiro." },
  kelpie: { nome: "🐴 Kelpie", tipo: "aquatico", raridade: "incomum", regiao: "ilhas_marveth", dano: [20,34], habilidade: "Afogar — grande dano se o inimigo estiver enfraquecido", lore: "Espírito aquático escocês em forma de cavalo, atrai vítimas para as águas profundas." },
  wendigo_jovem: { nome: "❄️ Wendigo Jovem", tipo: "besta", raridade: "incomum", regiao: "cavernas_gelo", dano: [21,35], habilidade: "Fome Insaciável — cura parte do dano causado", lore: "Criatura algonquina do inverno e da fome eterna, ainda em sua forma menos monstruosa." },
  sereia_menor: { nome: "🧜 Sereia Menor", tipo: "aquatico", raridade: "incomum", regiao: "ilhas_marveth", dano: [16,29], habilidade: "Canto Hipnótico — atordoa o inimigo por 1 turno", lore: "Sereia jovem do folclore mediterrâneo, seu canto ainda não atinge o poder das anciãs." },
  minotauro: { nome: "🐂 Minotauro", tipo: "besta", raridade: "raro", regiao: "ruinas_aelthar", dano: [55,85], habilidade: "Investida do Labirinto — dano massivo em linha reta", lore: "Criatura grega com corpo humano e cabeça de touro, guardião de labirintos antigos." },
  medusa: { nome: "🐍 Medusa", tipo: "besta", raridade: "raro", regiao: "ruinas_aelthar", dano: [50,80], habilidade: "Olhar Petrificante — paralisa o inimigo por 1 turno", lore: "Górgona grega de cabelos de serpente, cujo olhar transforma em pedra." },
  hipogrifo: { nome: "🦅 Hipogrifo", tipo: "ave", raridade: "raro", regiao: "pico_kaldros", dano: [58,88], habilidade: "Voo Impossível — ataque aéreo imparável", lore: "Criatura medieval meio águia, meio cavalo, símbolo de amor impossível." },
  nightmare: { nome: "🐴 Nightmare", tipo: "besta", raridade: "raro", regiao: "torre_caos", dano: [60,90], habilidade: "Casco Flamejante — dano de fogo em área pequena", lore: "Corcel espectral envolto em chamas negras, montaria de pesadelos antigos." },
  tengu: { nome: "👺 Tengu", tipo: "ave", raridade: "raro", regiao: "serra_titas", dano: [52,82], habilidade: "Vento Cortante — ataque rápido, sempre acerta primeiro", lore: "Yokai japonês das montanhas, mestre de artes marciais e travessuras." },
  baku: { nome: "🐼 Baku", tipo: "besta", raridade: "raro", regiao: "mata_espiritos", dano: [45,75], habilidade: "Devorar Pesadelos — cura o dono, mas não causa dano", lore: "Criatura japonesa que devora sonhos ruins, gentil apesar da aparência estranha." },
  rakshasa: { nome: "👹 Rakshasa", tipo: "espirito", raridade: "raro", regiao: "pantano_maldito", dano: [57,87], habilidade: "Ilusão Sombria — engana o inimigo, fazendo-o errar o ataque", lore: "Demônio hindu metamorfo, mestre em enganar mortais com ilusões." },
  peixe_lua_gigante: { nome: "🐡 Peixe-Lua Gigante", tipo: "aquatico", raridade: "raro", regiao: "abismo_mar_negro", dano: [42,72], habilidade: "Casca Espinhosa — machuca quem tentar atacar de perto", lore: "Versão descomunal do peixe-lua, flutua nas profundezas negras do oceano." },
  golem_gelo: { nome: "🧊 Golem de Gelo", tipo: "elemental", raridade: "raro", regiao: "cavernas_gelo", dano: [48,78], habilidade: "Núcleo Congelante — reduz a velocidade do inimigo por 2 turnos", lore: "Construto elemental formado por gelo eterno, quase indestrutível no frio." },
  quimera_jovem: { nome: "🐐 Quimera Jovem", tipo: "besta", raridade: "raro", regiao: "vulcao_ignareth", dano: [60,90], habilidade: "Tríplice Ataque — cabeça de leão, cabra e serpente atacam juntas", lore: "Fera grega híbrida ainda em crescimento, já perigosa o suficiente para temer." },
  potro_de_sleipnir: { nome: "🐴 Potro de Sleipnir", tipo: "besta", raridade: "epico", regiao: "tundra_voryn", dano: [95,150], habilidade: "Oito Patas — sempre ataca duas vezes por turno", lore: "Descendente do cavalo de oito patas de Odin, veloz como o vento nórdico." },
  grifo_real: { nome: "🦁 Grifo Real", tipo: "ave", raridade: "epico", regiao: "pico_kaldros", dano: [105,165], habilidade: "Majestade dos Céus — aumenta o próprio dano a cada turno vivo", lore: "Guardião real de tesouros, corpo de leão e cabeça de águia, símbolo de nobreza." },
  hidra_do_pantano: { nome: "🐍 Hidra do Pântano", tipo: "reptil", raridade: "epico", regiao: "pantano_maldito", dano: [90,145], habilidade: "Cabeças Regenerativas — recupera HP quando atacada", lore: "Prima menor da grande Hidra de Lerna, ainda perigosa em seus pântanos natais." },
  leviata_jovem: { nome: "🐋 Leviatã Jovem", tipo: "aquatico", raridade: "epico", regiao: "abismo_mar_negro", dano: [110,170], habilidade: "Onda Colossal — dano em área que atinge tudo ao redor", lore: "Filhote da besta bíblica do mar profundo, já capaz de afundar embarcações." },
  efrit_menor: { nome: "🔥 Efrit Menor", tipo: "elemental", raridade: "epico", regiao: "vulcao_ignareth", dano: [100,160], habilidade: "Chamas do Deserto — queima o inimigo por vários turnos", lore: "Espírito de fogo árabe, menos poderoso que os grandes Efrits dos contos antigos." },
  wyrm_de_gelo: { nome: "🐉 Wyrm de Gelo", tipo: "dragao", raridade: "epico", regiao: "cavernas_gelo", dano: [115,175], habilidade: "Sopro Congelante — reduz todos os atributos do inimigo", lore: "Dragão sem asas que rasteja pelas cavernas eternas, seu sopro é puro gelo." },
  chacal_de_anubis: { nome: "🐺 Chacal de Anúbis", tipo: "besta", raridade: "epico", regiao: "necropole_draktum", dano: [85,140], habilidade: "Julgamento das Almas — dano extra contra inimigos feridos", lore: "Guardião menor das necrópoles egípcias, serve ao deus dos mortos." },
  valquiria_menor: { nome: "⚔️ Valquíria Menor", tipo: "espirito", raridade: "epico", regiao: "torre_caos", dano: [108,168], habilidade: "Escolha dos Caídos — ressuscita uma vez com metade do HP", lore: "Serva nórdica menor de Odin, escolhe quem tomba em batalha para o Valhalla." },
  esfinge: { nome: "🦁 Esfinge", tipo: "besta", raridade: "mistico", regiao: "deserto_aresh", dano: [130,210], habilidade: "Enigma Mortal — o inimigo perde o turno tentando responder", lore: "Criatura egípcia/grega com corpo de leão e rosto humano, guardiã de enigmas fatais." },
  pegaso: { nome: "🐎 Pégaso", tipo: "ave", raridade: "mistico", regiao: "ceu_solvaryn", dano: [115,195], habilidade: "Voo Divino — esquiva do próximo ataque automaticamente", lore: "Cavalo alado grego nascido do sangue de Medusa, símbolo de pureza e liberdade." },
  oni: { nome: "👹 Oni", tipo: "besta", raridade: "mistico", regiao: "torre_caos", dano: [140,220], habilidade: "Clava Demoníaca — ignora parte da defesa do inimigo", lore: "Ogro japonês de força descomunal, temido em contos infantis e templos antigos." },
  yokai_ancestral: { nome: "👻 Yokai Ancestral", tipo: "espirito", raridade: "mistico", regiao: "necropole_draktum", dano: [125,205], habilidade: "Mil Formas — muda de forma, confundindo o inimigo a cada turno", lore: "Espírito japonês antigo que já viveu tantas formas que esqueceu a original." },
  naga_rainha: { nome: "🐍 Naga Rainha", tipo: "reptil", raridade: "mistico", regiao: "ilhas_marveth", dano: [120,200], habilidade: "Corte das Águas — cura o dono e enfraquece o inimigo ao mesmo tempo", lore: "Governante das nagas menores, guardiã dos tesouros submersos." },
  golem_runico: { nome: "🗿 Golem Rúnico", tipo: "elemental", raridade: "mistico", regiao: "ruinas_aelthar", dano: [135,215], habilidade: "Runas Ativas — ganha uma runa de poder a cada 2 turnos", lore: "Autômato inscrito com runas de um povo esquecido, cada vez mais forte com o tempo." },
  drake_da_tempestade: { nome: "🐲 Drake da Tempestade", tipo: "dragao", raridade: "mistico", regiao: "serra_titas", dano: [128,208], habilidade: "Fúria dos Raios — dano de raio que ignora esquiva", lore: "Dragão menor que nasce e vive dentro das tempestades das grandes serras." },
  cao_infernal: { nome: "🐕‍🦺 Cão Infernal", tipo: "besta", raridade: "mistico", regiao: "torre_caos", dano: [132,212], habilidade: "Latido do Abismo — amedronta o inimigo, reduzindo seu dano", lore: "Fera das profundezas do caos, prima distante de Cérbero, mas igualmente feroz." },
  espectro_real: { nome: "👑 Espectro Real", tipo: "espirito", raridade: "mistico", regiao: "necropole_draktum", dano: [118,198], habilidade: "Coroa Amaldiçoada — comanda espíritos menores para atacar junto", lore: "Alma de um antigo rei que se recusa a deixar seu trono, mesmo morto." },
  hidra_de_gelo: { nome: "🐉 Hidra de Gelo", tipo: "reptil", raridade: "mistico", regiao: "cavernas_gelo", dano: [138,218], habilidade: "Cabeças Congelantes — cada ataque tem chance de congelar o inimigo", lore: "Variante gélida da hidra clássica, suas cabeças nunca param de crescer." },
  fenix_menor: { nome: "🔥 Fênix Menor", tipo: "ave", raridade: "lendario", regiao: "vulcao_ignareth", dano: [135,235], habilidade: "Cinzas Renascentes — ressuscita uma vez com HP parcial", lore: "Ave de fogo em sua forma mais jovem, ainda aprendendo a controlar seu próprio renascimento." },
  behemoth_das_areias: { nome: "🐘 Behemoth das Areias", tipo: "besta", raridade: "lendario", regiao: "dunas_esquecimento", dano: [150,250], habilidade: "Tempestade de Areia — cega o inimigo por vários turnos", lore: "Besta colossal que se move sob as dunas, provocando tempestades por onde passa." },
  leao_de_cinzas: { nome: "🦁 Leão de Cinzas", tipo: "besta", raridade: "lendario", regiao: "planicies_cinzas", dano: [128,228], habilidade: "Rugido das Cinzas — reduz a defesa de todos os inimigos", lore: "Fera nascida das cinzas de uma guerra esquecida, guardiã silenciosa das planícies." },
  serpente_arco_iris: { nome: "🌈 Serpente Arco-Íris", tipo: "reptil", raridade: "lendario", regiao: "ilhas_marveth", dano: [140,240], habilidade: "Ciclo das Águas — alterna entre cura e dano a cada turno", lore: "Divindade aborígene criadora dos rios e das chuvas, guardiã da vida na água." },
  dragao_celestial_menor: { nome: "🐉 Dragão Celestial Menor", tipo: "dragao", raridade: "lendario", regiao: "ceu_solvaryn", dano: [155,255], habilidade: "Bênção das Nuvens — cura o dono a cada 2 turnos", lore: "Dragão jovem nascido entre as nuvens do céu flutuante, ainda aprendendo seus poderes." },
  golem_titanico: { nome: "🗿 Golem Titânico", tipo: "elemental", raridade: "lendario", regiao: "serra_titas", dano: [145,245], habilidade: "Punho da Montanha — dano massivo que ignora defesa", lore: "Construto feito da própria rocha das grandes serras, lento mas devastador." },
  guardiao_de_yggdrasil: { nome: "🌳 Guardião de Yggdrasil", tipo: "elemental", raridade: "ancestral", regiao: "tundra_voryn", dano: [210,290], habilidade: "Raízes Eternas — imobiliza o inimigo enquanto se cura", lore: "Espírito protetor da árvore-mundo nórdica, tão antigo quanto o próprio cosmos." },
  leviata_ancestral: { nome: "🐋 Leviatã Ancestral", tipo: "aquatico", raridade: "ancestral", regiao: "abismo_mar_negro", dano: [220,300], habilidade: "Maré Primordial — dano em área que aumenta com o tempo de batalha", lore: "Uma das primeiras feras do oceano, testemunha da criação do próprio mar." },
  roc_gigante: { nome: "🦅 Roc Gigante", tipo: "ave", raridade: "ancestral", regiao: "pico_kaldros", dano: [200,280], habilidade: "Garras do Firmamento — carrega o inimigo e o derruba de grande altura", lore: "Ave colossal das Mil e Uma Noites em sua forma mais madura e temida." },
  hidra_dos_nove_ventos: { nome: "🐍 Hidra dos Nove Ventos", tipo: "reptil", raridade: "ancestral", regiao: "portal_mundos", dano: [215,295], habilidade: "Sopro dos Nove Ventos — ataca com todos os elementos ao mesmo tempo", lore: "Criatura nascida na fenda entre mundos, cada cabeça controla um vento diferente." },
  behemoth_de_ferro: { nome: "🐘 Behemoth de Ferro", tipo: "besta", raridade: "ancestral", regiao: "serra_titas", dano: [195,285], habilidade: "Pele de Ferro — quase imune a dano físico por 2 turnos", lore: "Besta bíblica cuja pele se tornou dura como metal após eras de batalhas." },
  serpente_de_nu_wa: { nome: "🐍 Serpente de Nu Wa", tipo: "reptil", raridade: "primordial", regiao: "portal_mundos", dano: [280,440], habilidade: "Reparo Celestial — cura completamente o dono uma vez por batalha", lore: "Fragmento da serpente primordial chinesa que ajudou a remendar o céu." },
  avatar_de_surt: { nome: "🔥 Avatar de Surt", tipo: "elemental", raridade: "primordial", regiao: "vulcao_ignareth", dano: [300,460], habilidade: "Espada Flamejante — dano que aumenta a cada batalha vencida", lore: "Manifestação menor do gigante de fogo nórdico destinado a incendiar o mundo no Ragnarök." },
  andarilho_do_vazio: { nome: "🌌 Andarilho do Vazio", tipo: "espirito", raridade: "primordial", regiao: "portal_mundos", dano: [270,430], habilidade: "Passos Entre Mundos — esquiva de qualquer ataque uma vez por batalha", lore: "Ser nascido do espaço entre dimensões, caminha por realidades que não deveriam se tocar." },
  kraken_ancestral: { nome: "🐙 Kraken Ancestral", tipo: "aquatico", raridade: "primordial", regiao: "abismo_mar_negro", dano: [290,450], habilidade: "Abraço das Profundezas — imobiliza e causa dano contínuo", lore: "Versão madura e completa do temido Kraken escandinavo, capaz de afundar frotas inteiras." },
  fenix_primordial: { nome: "🔥 Fênix Primordial", tipo: "ave", raridade: "primordial", regiao: "torre_caos", dano: [285,445], habilidade: "Ciclo Eterno — ressuscita duas vezes por batalha com HP parcial", lore: "A primeira Fênix a existir, da qual todas as outras são apenas ecos." },
  bahamut: { nome: "🐉 Bahamut", tipo: "dragao", raridade: "divino", regiao: "torre_caos", dano: [420,850], habilidade: "Respiração da Criação — dano que ignora toda defesa e resistência", lore: "Pai de todos os dragões bons em incontáveis mitologias e lendas, força quase divina." },
  shenlong: { nome: "🐉 Shenlong", tipo: "dragao", raridade: "divino", regiao: "portal_mundos", dano: [400,800], habilidade: "Chuva Divina — cura o dono ao máximo e remove todos os debuffs", lore: "Deus-dragão chinês da chuva e das tempestades, controla o clima com um aceno." },
  avatar_de_amaterasu: { nome: "☀️ Avatar de Amaterasu", tipo: "ave", raridade: "divino", regiao: "ceu_solvaryn", dano: [410,820], habilidade: "Luz do Sol Nascente — cega e queima todos os inimigos ao redor", lore: "Manifestação menor da deusa-sol japonesa, cuja luz afasta toda escuridão." },
  anansi_divino: { nome: "🕷️ Anansi Divino", tipo: "besta", raridade: "divino", regiao: "portal_mundos", dano: [390,780], habilidade: "Teia do Destino — controla o resultado da próxima ação do inimigo", lore: "Deus-aranha africano da sabedoria e das histórias, mestre em enganar até outros deuses." },
  fragmento_de_cthulhu: { nome: "🐙 Fragmento de Cthulhu", tipo: "espirito", raridade: "abissal", regiao: "abismo_mar_negro", dano: [480,700], habilidade: "Loucura Cósmica — o inimigo ataca a si mesmo por 1 turno", lore: "Um mero pedaço da consciência de um horror adormecido nas profundezas mais escuras." },
  leviata_do_abismo: { nome: "🐋 Leviatã do Abismo", tipo: "aquatico", raridade: "abissal", regiao: "abismo_mar_negro", dano: [460,680], habilidade: "Pressão Abissal — esmaga o inimigo com a força do oceano profundo", lore: "Versão corrompida do Leviatã, mutada por eras vivendo onde a luz nunca chega." },
  eco_de_yog_sothoth: { nome: "🌀 Eco de Yog-Sothoth", tipo: "espirito", raridade: "abissal", regiao: "torre_caos", dano: [500,700], habilidade: "Portão Proibido — abre uma fenda que causa dano contínuo devastador", lore: "Sussurro distante de uma entidade que existe fora do tempo e do espaço conhecidos." },
  hidra_negra_do_fim: { nome: "🐍 Hidra Negra do Fim", tipo: "reptil", raridade: "abissal", regiao: "torre_caos", dano: [470,690], habilidade: "Renascimento Sombrio — cada cabeça cortada gera duas mais fortes", lore: "A última hidra, corrompida pelo próprio caos até se tornar quase indestrutível." },
  arcanjo_menor: { nome: "👼 Arcanjo Menor", tipo: "espirito", raridade: "celestial", regiao: "ceu_solvaryn", dano: [520,720], habilidade: "Espada Serafim — dano puro de luz que ignora toda resistência", lore: "Um dos mensageiros menores do alto céu, ainda assim capaz de feitos sobre-humanos." },
  trono_celestial: { nome: "✨ Trono Celestial", tipo: "elemental", raridade: "celestial", regiao: "ceu_solvaryn", dano: [540,740], habilidade: "Julgamento Divino — dano proporcional ao HP restante do inimigo", lore: "Uma das ordens angelicais mais altas, forma de rodas de fogo cobertas de olhos." },
  querubim: { nome: "👼 Querubim", tipo: "ave", raridade: "celestial", regiao: "ceu_solvaryn", dano: [510,710], habilidade: "Guarda do Éden — protege o dono de todo dano por 1 turno", lore: "Guardião celestial das portas mais sagradas, temido apesar da aparência gentil." },
  eco_de_metatron: { nome: "📜 Eco de Metatron", tipo: "espirito", raridade: "celestial", regiao: "ceu_solvaryn", dano: [550,750], habilidade: "Voz da Criação — reescreve o resultado da batalha uma vez", lore: "Fragmento da presença do escriba celestial que registra os atos de toda a criação." },
  dragao_da_criacao: { nome: "🐉 Dragão da Criação", tipo: "dragao", raridade: "celestial", regiao: "ceu_solvaryn", dano: [560,750], habilidade: "Sopro da Gênese — cura o dono e causa dano simultaneamente", lore: "Diz a lenda que este dragão exalou o primeiro sopro de vida no mundo do IMPERIUS." }
};

// ── OVOS ─────────────────────────────────────────────────
const OVOS = {
  // ── BÁSICOS ──────────────────────────────────────────
  'ovo comum':       { preco: 50,    raridade_base: 'comum',     chance_raro: 10,  descricao: 'Um ovo simples e frágil' },
  'ovo floresta':    { preco: 120,   raridade_base: 'incomum',   chance_raro: 25,  descricao: 'Um ovo encontrado nas florestas antigas', tipos: ['besta', 'ave'] },
  'ovo pantanoso':   { preco: 140,   raridade_base: 'incomum',   chance_raro: 25,  descricao: 'Um ovo coberto de lodo antigo', tipos: ['reptil', 'aquatico'] },
  'ovo das ruinas':  { preco: 160,   raridade_base: 'incomum',   chance_raro: 30,  descricao: 'Um ovo encontrado em ruínas milenares', tipos: ['espirito', 'besta'] },

  // ── INTERMEDIÁRIOS ────────────────────────────────────
  'ovo trevas':      { preco: 250,   raridade_base: 'raro',      chance_raro: 30,  descricao: 'Um ovo negro como a noite eterna', tipos: ['espirito', 'elemental'] },
  'ovo abismo':      { preco: 280,   raridade_base: 'raro',      chance_raro: 35,  descricao: 'Um ovo trazido das profundezas', tipos: ['aquatico', 'reptil'] },
  'ovo fogo':        { preco: 260,   raridade_base: 'raro',      chance_raro: 30,  descricao: 'Um ovo quente como brasa viva', tipos: ['elemental', 'dragao'] },
  'ovo gelo':        { preco: 260,   raridade_base: 'raro',      chance_raro: 30,  descricao: 'Um ovo gelado como neve eterna', tipos: ['elemental', 'reptil'] },
  'ovo tempestade':  { preco: 300,   raridade_base: 'raro',      chance_raro: 35,  descricao: 'Um ovo que faísca de energia', tipos: ['ave', 'elemental'] },
  'ovo espectral':   { preco: 330,   raridade_base: 'raro',      chance_raro: 40,  descricao: 'Um ovo translúcido e etéreo', tipos: ['espirito'] },

  // ── AVANÇADOS ─────────────────────────────────────────
  'ovo maldito':     { preco: 500,   raridade_base: 'epico',     chance_raro: 50,  descricao: 'Um ovo marcado por uma antiga maldição' },
  'ovo sagrado':     { preco: 650,   raridade_base: 'epico',     chance_raro: 60,  descricao: 'Um ovo abençoado pelos deuses antigos', tipos: ['espirito', 'ave'] },
  'ovo dracônico':   { preco: 800,   raridade_base: 'epico',     chance_raro: 65,  descricao: 'Um ovo coberto de escamas dracônicas', tipos: ['dragao', 'reptil'] },
  'ovo caos':        { preco: 1000,  raridade_base: 'aleatorio', chance_raro: 70,  descricao: 'Um ovo imprevisível — qualquer raridade!' },

  // ── RAROS ─────────────────────────────────────────────
  'ovo lendario':    { preco: 2500,  raridade_base: 'lendario',  chance_raro: 100, descricao: 'Um ovo de criatura lendária garantida' },
  'ovo ancestral':   { preco: 4000,  raridade_base: 'ancestral', chance_raro: 100, descricao: 'Um ovo de era ancestral' },
  'ovo primordial':  { preco: 7000,  raridade_base: 'primordial',chance_raro: 100, descricao: 'Um ovo do início dos tempos' },

  // ── EXCLUSIVO ─────────────────────────────────────────
  'ovo divino':      { preco: 0,     raridade_base: 'divino',    chance_raro: 100, descricao: 'O ovo sagrado do próprio Deus', exclusivo: 'ajudante_deus' },
};

// ── RARIDADES ─────────────────────────────────────────────
const RARIDADES_ORDEM = ['comum','incomum','raro','epico','mistico','lendario','ancestral','primordial','divino','abissal','celestial','unico'];
const RARIDADES_EMOJI = {
  comum: '⬜', incomum: '🟩', raro: '🟦', epico: '🟪', mistico: '🟫',
  lendario: '🟨', ancestral: '🔶', primordial: '🔴', divino: '🌟',
  abissal: '🌑', celestial: '✨', unico: '☠️'
};

// ── GERAR ESTADO ALEATÓRIO ────────────────────────────────
function gerarEstado() {
  const roll = Math.random() * 100;
  if (roll < 5)  return 'dormindo';
  if (roll < 15) return 'calmo';
  if (roll < 30) return 'curioso';
  if (roll < 45) return 'neutro';
  if (roll < 55) return 'assustado';
  if (roll < 65) return 'irritado';
  if (roll < 78) return 'raivoso';
  if (roll < 88) return 'furioso';
  if (roll < 96) return 'berserk';
  return 'possesso';
}

// ── CALCULAR CHANCE DE DOMAR ──────────────────────────────
function calcularChanceDomar(estado, bonus_item, tem_pet, classe) {
  let chance = ESTADOS[estado]?.chance || 30;
  chance += bonus_item || 0;
  if (tem_pet) chance += 15;
  if (classe === 'druida') chance += 25;
  return Math.min(95, chance);
}

// ── TENTAR DOMAR ──────────────────────────────────────────
function tentarDomar(jogador_id, criatura_id, estado, bonus_item) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: '❌ Personagem não encontrado!' };
  if (j.pet) return { erro: '❌ Você já tem um pet!\nUse /soltarpet para soltar o atual.' };

  const criatura = CRIATURAS[criatura_id];
  if (!criatura) return { erro: '❌ Criatura não encontrada!' };

  if (criatura.exclusivo && j.classe !== criatura.exclusivo) {
    return { erro: `❌ Apenas o **Ajudante do Deus** pode domar esta criatura!` };
  }

  const chance = calcularChanceDomar(estado, bonus_item, !!j.pet, j.classe);
  const roll = Math.floor(Math.random() * 100) + 1;
  const sucesso = roll <= chance;

  if (!sucesso) {
    return { sucesso: false, texto: `❌ Falhou! (${roll} > ${chance}%)\n${criatura.nome} fugiu...` };
  }

  return {
    sucesso: true,
    criatura_id,
    criatura,
    texto: `✅ Sucesso! (${roll} ≤ ${chance}%)\n${criatura.nome} te aceitou!\n\nComo você quer chamá-lo?`
  };
}

// ── NOMEAR PET ────────────────────────────────────────────
function nomearPet(jogador_id, criatura_id, nome_dado) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  const criatura = CRIATURAS[criatura_id];
  if (!criatura) return '❌ Criatura não encontrada!';

  j.pet = {
    id: criatura_id,
    especie: criatura.nome,
    nome: `${criatura.nome} (${nome_dado})`,
    nome_dado,
    raridade: criatura.raridade,
    habilidade: criatura.habilidade,
    lore: criatura.lore || '',
    dano: criatura.dano,
    hp: 100,
    hp_max: 100,
    xp: 0
  };

  salvarJogador(jogador_id, j);
  adicionarConquista(jogador_id, 'primeiro_pet');

  return `🎉 ${j.pet.nome} agora é seu companheiro!\n\n${RARIDADES_EMOJI[criatura.raridade]} ${criatura.raridade.toUpperCase()} — ÚNICO no IMPERIUS!\n\n📖 _${criatura.lore}_`;
}

// ── CHOCAR OVO ────────────────────────────────────────────
function chocarOvo(jogador_id, tipo_ovo) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  if (j.pet) return '❌ Você já tem um pet!\nUse /soltarpet para soltar o atual.';

  let ovo_key, key_final, ovo;
  if (!tipo_ovo || !tipo_ovo.trim()) {
    // Sem especificar - pega o primeiro ovo do inventário
    const ovo_inventario = (j.inventario || []).find(i => i.toLowerCase().startsWith('ovo '));
    if (!ovo_inventario) return `❌ Você não tem nenhum ovo!\nCompre na /lojapets, depois use /chocar [nome do ovo]`;
    key_final = ovo_inventario;
    ovo = OVOS[key_final];
  } else {
    ovo_key = tipo_ovo.toLowerCase().trim();
    ovo = OVOS[ovo_key] || OVOS[`ovo ${ovo_key}`];
    key_final = OVOS[ovo_key] ? ovo_key : `ovo ${ovo_key}`;
  }

  if (!ovo) return `❌ Ovo não encontrado!\nUse /lojapets para ver os ovos disponíveis.`;
  if (ovo.exclusivo && j.classe !== ovo.exclusivo) return `❌ Este ovo é exclusivo para **Ajudante do Deus**!`;

  const idx = j.inventario?.findIndex(i => i.toLowerCase().includes(key_final));
  if (idx === undefined || idx === -1) return `❌ Você não tem ${key_final}!\nCompre na /lojapets`;

  j.inventario.splice(idx, 1);

  let criaturas_filtradas = Object.entries(CRIATURAS).filter(([_, c]) => !c.exclusivo);
  if (ovo.tipos) criaturas_filtradas = criaturas_filtradas.filter(([_, c]) => ovo.tipos.includes(c.tipo));

  const roll_raridade = Math.random() * 100;
  let raridade_alvo = ovo.raridade_base;

  if (ovo.raridade_base === 'aleatorio') {
    raridade_alvo = RARIDADES_ORDEM[Math.floor(Math.random() * RARIDADES_ORDEM.length)];
  } else if (roll_raridade > ovo.chance_raro && !['lendario','primordial','divino'].includes(ovo.raridade_base)) {
    const idx_r = RARIDADES_ORDEM.indexOf(ovo.raridade_base);
    raridade_alvo = RARIDADES_ORDEM[Math.max(0, idx_r - 1)];
  }

  let possiveis = criaturas_filtradas.filter(([_, c]) => c.raridade === raridade_alvo);
  if (possiveis.length === 0) {
    // Não existe criatura cadastrada exatamente nessa raridade — procura a mais próxima
    // na escala de raridades (nunca cai pra raridade aleatória/qualquer uma).
    const idx_alvo = RARIDADES_ORDEM.indexOf(raridade_alvo);
    for (let passo = 1; passo < RARIDADES_ORDEM.length && possiveis.length === 0; passo++) {
      const acima = RARIDADES_ORDEM[idx_alvo + passo];
      if (acima) possiveis = criaturas_filtradas.filter(([_, c]) => c.raridade === acima);
      if (possiveis.length === 0) {
        const abaixo = RARIDADES_ORDEM[idx_alvo - passo];
        if (abaixo) possiveis = criaturas_filtradas.filter(([_, c]) => c.raridade === abaixo);
      }
    }
  }
  if (possiveis.length === 0) possiveis = criaturas_filtradas;

  const escolhido = possiveis[Math.floor(Math.random() * possiveis.length)];
  if (!escolhido) return '❌ Nenhuma criatura disponível!';

  salvarJogador(jogador_id, j);

  const [dmin, dmax] = escolhido[1].dano || [0, 0];

  return {
    criatura_id: escolhido[0],
    criatura: escolhido[1],
    texto: `🥚 O ovo racha...\n\n${RARIDADES_EMOJI[escolhido[1].raridade]} *${escolhido[1].nome}* nasceu!\n\n⚔️ Dano: ${dmin}-${dmax}\n✨ Habilidade: ${escolhido[1].habilidade}\n\n📖 _${escolhido[1].lore}_\n\nComo você quer chamá-lo?`
  };
}

// ── VER PET ───────────────────────────────────────────────
function verPet(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  if (!j.pet) return '❌ Você não tem pet!\n\nDome um em /batalha ou compre ovos na /lojapets';

  const r_emoji = RARIDADES_EMOJI[j.pet.raridade] || '⬜';
  return `🐾 MEU PET\n\n${r_emoji} ${j.pet.nome}\n━━━━━━━━━━\n⚔️ Dano: ${j.pet.dano[0]}-${j.pet.dano[1]}\n❤️ HP: ${j.pet.hp}/${j.pet.hp_max}\n💫 ${j.pet.habilidade}\n━━━━━━━━━━\n📖 _${j.pet.lore || ''}_\n━━━━━━━━━━\n_Este pet é ÚNICO no IMPERIUS!_`;
}

// ── SOLTAR PET ────────────────────────────────────────────
function soltarPet(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  if (!j.pet) return '❌ Você não tem pet!';
  const nome = j.pet.nome;
  j.pet = null;
  salvarJogador(jogador_id, j);
  return `💔 ${nome} foi solto...\n_Você pode domar outro em /batalha_`;
}

// ── CURAR PET ─────────────────────────────────────────────
function curarPet(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  if (!j.pet) return '❌ Você não tem pet!';
  if (j.moedas < 200) return `❌ Belarium insuficiente!\nPrecisa: ${formatarPreco(200)}\nVocê tem: ${formatarBelarium(j)}`;
  j.moedas -= 200;
  j.pet.hp = j.pet.hp_max;
  salvarJogador(jogador_id, j);
  return `💚 ${j.pet.nome} foi curado!\n❤️ HP: ${j.pet.hp}/${j.pet.hp_max}`;
}

// ── PET AJUDA EM BATALHA ──────────────────────────────────
function petAjudaBatalha(jogador_id, monstro_hp) {
  const j = getJogador(jogador_id);
  if (!j || !j.pet || j.pet.hp <= 0) return null;
  const dano = Math.floor(Math.random() * (j.pet.dano[1] - j.pet.dano[0] + 1)) + j.pet.dano[0];
  const dano_final = monstro_hp <= dano ? Math.max(1, monstro_hp - 1) : dano;
  return { dano: dano_final, habilidade: j.pet.habilidade, nome: j.pet.nome };
}

// ── VER LOJA DE OVOS ─────────────────────────────────────
function verLojaOvos(jogador_id) {
  const j = getJogador(jogador_id);
  const classe = j?.classe || '';
  let txt = `🥚 LOJA DE OVOS\n━━━━━━━━━━\n`;
  for (const [key, ovo] of Object.entries(OVOS)) {
    if (ovo.exclusivo && classe !== ovo.exclusivo) continue;
    const nome = key.replace('ovo ', '').toUpperCase();
    txt += `🥚 ${nome} — ${formatarPreco(ovo.preco)}\n`;
  }
  txt += `━━━━━━━━━━\n/comprar [nome do ovo]`;
  return txt;
}

// ── COMPRAR OVO ───────────────────────────────────────────
function comprarOvo(jogador_id, nome_ovo) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  const ovo_key = nome_ovo.toLowerCase().trim();
  const ovo = OVOS[ovo_key] || OVOS[`ovo ${ovo_key}`];
  const key_final = OVOS[ovo_key] ? ovo_key : `ovo ${ovo_key}`;
  if (!ovo) return `❌ Ovo não encontrado!\nUse /lojapets para ver os disponíveis.`;
  if (ovo.exclusivo && j.classe !== ovo.exclusivo) return `❌ Este ovo é exclusivo para **Ajudante do Deus**!`;
  if (j.moedas < ovo.preco) return `❌ Belarium insuficiente!\nPrecisa: ${formatarPreco(ovo.preco)}\nVocê tem: ${formatarBelarium(j)}`;
  j.moedas -= ovo.preco;
  if (!j.inventario) j.inventario = [];
  j.inventario.push(key_final);
  salvarJogador(jogador_id, j);
  return `✅ ${key_final.toUpperCase()} comprado!\nUse /chocar para chocar o ovo!`;
}

// ============================================================
// SISTEMA DE ANIMAIS SELVAGENS (separado das Criaturas míticas)
// Raridade exibida em estrelas ★☆ — de 1 a 6
// ============================================================
const MAX_ESTRELAS = 6;

const ANIMAIS = {
  coelho:   { nome: 'Coelho',              emoji: '🐇', raridade: 1, dano: [2, 5] },
  cachorro: { nome: 'Cachorro Selvagem',    emoji: '🐕', raridade: 1, dano: [3, 6] },
  gato:     { nome: 'Gato do Mato',         emoji: '🐈', raridade: 2, dano: [4, 8] },
  raposa:   { nome: 'Raposa',               emoji: '🦊', raridade: 2, dano: [5, 9] },
  javali:   { nome: 'Javali',               emoji: '🐗', raridade: 3, dano: [8, 14] },
  coruja:   { nome: 'Coruja-Real',          emoji: '🦉', raridade: 3, dano: [9, 15] },
  lobo:     { nome: 'Lobo Cinzento',        emoji: '🐺', raridade: 4, dano: [14, 22] },
  aguia:    { nome: 'Águia Dourada',        emoji: '🦅', raridade: 4, dano: [15, 24] },
  urso:     { nome: 'Urso Pardo',           emoji: '🐻', raridade: 5, dano: [22, 34] },
  tigre:    { nome: 'Tigre-de-Bengala',     emoji: '🐅', raridade: 5, dano: [24, 36] },
  leao:     { nome: 'Leão-das-Neves',       emoji: '🦁', raridade: 6, dano: [34, 50] },
  ursopolar:{ nome: 'Urso Polar Ancestral', emoji: '🐻‍❄️', raridade: 6, dano: [36, 54] },
};

function barraEstrelas(raridade) {
  const r = Math.max(1, Math.min(MAX_ESTRELAS, raridade));
  return '★'.repeat(r) + '☆'.repeat(MAX_ESTRELAS - r);
}

function chanceDomarAnimal(raridade, estado) {
  const base = Math.max(10, 80 - (raridade - 1) * 12);
  const mod = ESTADO_MODIFICADOR[estado] ?? 0;
  return Math.max(5, Math.min(95, base + mod));
}

// Detecta se o nome de um monstro encontrado em batalha é um animal selvagem
function ehAnimalSelvagem(nome) {
  const n = (nome || '').toLowerCase();
  const chaves = ['coelho', 'cachorro', 'cao selvagem', 'cão selvagem', 'gato', 'raposa',
    'javali', 'coruja', 'lobo', 'aguia', 'águia', 'urso', 'tigre', 'leao', 'leão'];
  return chaves.some(k => n.includes(k));
}

// Acha o animal cadastrado que combina com o nome do monstro (ou sorteia um da mesma raridade aproximada)
function identificarAnimal(nome_monstro) {
  const n = (nome_monstro || '').toLowerCase();
  const encontrado = Object.entries(ANIMAIS).find(([id, a]) => n.includes(id) || n.includes(a.nome.toLowerCase().split(' ')[0]));
  if (encontrado) return encontrado;
  const ids = Object.keys(ANIMAIS);
  const id_sorteado = ids[Math.floor(Math.random() * ids.length)];
  return [id_sorteado, ANIMAIS[id_sorteado]];
}

const MAX_ANIMAIS = 4;
const COOLDOWN_ANIMAL_BATALHA = 30 * 1000;

function tentarDomarAnimal(jogador_id, nome_monstro, estado) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: '❌ Personagem não encontrado!' };
  if (!j.animais) j.animais = [];
  if (j.animais.length >= MAX_ANIMAIS) return { erro: `❌ Você já tem o máximo de ${MAX_ANIMAIS} animais domados!\nUse /soltaranimal [nome] pra liberar um.` };

  const [animal_id, animal] = identificarAnimal(nome_monstro);
  if (j.animais.some(a => a.id === animal_id)) return { erro: `❌ Já tem um(a) *${animal.nome}*!` };

  const estado_info = ESTADOS[estado];
  const prefixo_estado = estado_info ? `${estado_info.emoji} _${estado_info.descricao}_\n\n` : '';
  const chance = chanceDomarAnimal(animal.raridade, estado);
  const roll = Math.random() * 100;

  if (roll > chance) {
    return {
      sucesso: false,
      texto: `${prefixo_estado}${animal.emoji} *${animal.nome}* fugiu assustado!\n${barraEstrelas(animal.raridade)}\n_Chance que você tinha: ${chance}%_`
    };
  }

  j.animais.push({ id: animal_id, nome: animal.nome, raridade: animal.raridade, dano: animal.dano, cooldown: 0 });
  salvarJogador(jogador_id, j);
  return {
    sucesso: true,
    texto: `${prefixo_estado}✅ *${animal.nome}* foi domado com sucesso! (${j.animais.length}/${MAX_ANIMAIS})\n${barraEstrelas(animal.raridade)}\n_Chance que você tinha: ${chance}%_\n\nUse /chamarpet em batalha pra eles te ajudarem!`
  };
}

// Chamar animais fora de batalha (apenas exibição/carinho)
function chamarPet(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: '❌ Personagem não encontrado!' };
  if (!j.animais || j.animais.length === 0) return { erro: '❌ Você não tem animais domados!\nTente domar um durante uma /batalha contra um animal selvagem.' };
  const linhas = j.animais.map(a => `${ANIMAIS[a.id]?.emoji || '🐾'} *${a.nome}* correu até você!\n${barraEstrelas(a.raridade)}`);
  return { texto: linhas.join('\n\n') };
}

// Chamar animais DURANTE batalha, todos que não estiverem em cooldown atacam
function chamarAnimalBatalha(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return { erro: '❌ Personagem não encontrado!' };
  if (!j.animais || j.animais.length === 0) return { erro: '❌ Você não tem animais domados!\nTente domar um durante uma /batalha contra um animal selvagem.' };

  const agora = Date.now();
  const disponiveis = j.animais.filter(a => !a.cooldown || (agora - a.cooldown) >= COOLDOWN_ANIMAL_BATALHA);

  if (disponiveis.length === 0) {
    const menor_espera = Math.min(...j.animais.map(a => Math.ceil((COOLDOWN_ANIMAL_BATALHA - (agora - a.cooldown)) / 1000)));
    return { erro: `⏳ Seus animais ainda estão descansando! Aguarde ${menor_espera}s.` };
  }

  let dano_total = 0;
  const ataques = [];
  for (const a of disponiveis) {
    const [min, max] = a.dano;
    const dano = Math.floor(Math.random() * (max - min + 1)) + min;
    dano_total += dano;
    a.cooldown = agora;
    const animal_data = ANIMAIS[a.id];
    ataques.push(`${animal_data?.emoji || '🐾'} ${a.nome} atacou! Dano: *${dano}*`);
  }
  salvarJogador(jogador_id, j);

  return { sucesso: true, dano: dano_total, ataques };
}

function verAnimais() {
  const linhas = Object.values(ANIMAIS)
    .sort((a, b) => a.raridade - b.raridade)
    .map(a => `${a.emoji} ${a.nome} — ${barraEstrelas(a.raridade)}`);
  return `🐾 BESTIÁRIO DE ANIMAIS\n\n${linhas.join('\n')}\n━━━━━━━━━━\n_Encontre-os em /batalha e tente /tentardomar!_\n_Máximo de ${MAX_ANIMAIS} animais domados por vez._`;
}

function verMeuAnimal(jogador_id) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  if (!j.animais || j.animais.length === 0) return '❌ Você não tem animais domados!\n\nEncontre um em /batalha e use /tentardomar.';
  const linhas = j.animais.map(a => {
    const animal = ANIMAIS[a.id];
    return `${animal?.emoji || '🐾'} ${a.nome}\n${barraEstrelas(a.raridade)}\n⚔️ Dano: ${a.dano[0]}-${a.dano[1]}`;
  });
  return `🐾 MEUS ANIMAIS (${j.animais.length}/${MAX_ANIMAIS})\n\n${linhas.join('\n━━━━━━━━━━\n')}\n━━━━━━━━━━\n_Use /chamarpet em batalha pra eles atacarem!_`;
}

function soltarAnimal(jogador_id, nome_busca) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  if (!j.animais || j.animais.length === 0) return '❌ Você não tem animais domados!';

  if (j.animais.length === 1 && !nome_busca) {
    const nome = j.animais[0].nome;
    j.animais = [];
    salvarJogador(jogador_id, j);
    return `💔 ${nome} foi solto de volta à natureza...`;
  }

  if (!nome_busca) {
    const lista = j.animais.map(a => `• ${a.nome}`).join('\n');
    return `❓ Você tem mais de um animal! Especifique qual soltar:\n/soltaranimal [nome]\n\n${lista}`;
  }

  const busca = nome_busca.toLowerCase().trim();
  const idx = j.animais.findIndex(a => a.nome.toLowerCase().includes(busca));
  if (idx === -1) return `❌ Você não tem um animal chamado "${nome_busca}"!\nUse /meuanimal para ver a lista.`;

  const nome = j.animais[idx].nome;
  j.animais.splice(idx, 1);
  salvarJogador(jogador_id, j);
  return `💔 ${nome} foi solto de volta à natureza...\n_(${j.animais.length}/${MAX_ANIMAIS} animais)_`;
}

// Adoção via loja: só animais de raridade 1★ (comuns), pagando moedas
const PRECO_ADOCAO = 100;
function adotarAnimal(jogador_id, nome_animal) {
  const j = getJogador(jogador_id);
  if (!j) return '❌ Personagem não encontrado!';
  if (!j.animais) j.animais = [];
  if (j.animais.length >= MAX_ANIMAIS) return `❌ Você já tem o máximo de ${MAX_ANIMAIS} animais domados!\nUse /soltaranimal [nome] pra liberar um.`;

  const busca = (nome_animal || '').toLowerCase().trim();
  const encontrado = Object.entries(ANIMAIS).find(([id, a]) => id === busca || a.nome.toLowerCase().includes(busca));
  if (!encontrado) return `❌ Animal não encontrado!\nUse /animais para ver o bestiário.`;
  const [animal_id, animal] = encontrado;

  if (j.animais.some(a => a.id === animal_id)) return `❌ Você já tem um(a) *${animal.nome}*!`;
  if (animal.raridade > 1) return `❌ Só é possível adotar animais de 1 estrela (★☆☆☆☆☆) na loja!\nAnimais mais raros só domando em /batalha.`;
  if (j.moedas < PRECO_ADOCAO) return `❌ Belarium insuficiente!\nPrecisa: ${formatarPreco(PRECO_ADOCAO)} | Você tem: ${formatarBelarium(j)}`;

  j.moedas -= PRECO_ADOCAO;
  j.animais.push({ id: animal_id, nome: animal.nome, raridade: animal.raridade, dano: animal.dano, cooldown: 0 });
  salvarJogador(jogador_id, j);
  return `✅ *${animal.nome}* adotado por ${formatarPreco(PRECO_ADOCAO)}! (${j.animais.length}/${MAX_ANIMAIS})\n${barraEstrelas(animal.raridade)}\n\nUse /chamarpet em batalha pra ele te ajudar!`;
}

function estrelasDoMonstro(nome) {
  if (!ehAnimalSelvagem(nome)) return null;
  const [, animal] = identificarAnimal(nome);
  return barraEstrelas(animal.raridade);
}

module.exports = {
  CRIATURAS, OVOS, ESTADOS, ITENS_DOMAR, RARIDADES_EMOJI,
  gerarEstado, calcularChanceDomar, tentarDomar, nomearPet,
  chocarOvo, verPet, soltarPet, curarPet, petAjudaBatalha,
  verLojaOvos, comprarOvo,
  ANIMAIS, ehAnimalSelvagem, tentarDomarAnimal, chamarPet,
  estrelasDoMonstro,
  chamarAnimalBatalha, verAnimais, verMeuAnimal, soltarAnimal, adotarAnimal
};
