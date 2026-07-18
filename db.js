// ============================================================
// IMPERIUS RPG — BANCO DE DADOS (SQLite) v3.0
// ============================================================
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'imperius.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// ── CRIAR TABELAS ─────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS jogadores (
    id TEXT PRIMARY KEY,
    dados TEXT NOT NULL,
    atualizado_em INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pendentes (
    id TEXT PRIMARY KEY,
    dados TEXT NOT NULL,
    criado_em INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS sacrificios (
    id TEXT PRIMARY KEY,
    dados TEXT NOT NULL,
    criado_em INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS encarnacoes (
    id TEXT PRIMARY KEY,
    dados TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS guildas (
    id TEXT PRIMARY KEY,
    dados TEXT NOT NULL,
    criado_em INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS casamentos (
    id TEXT PRIMARY KEY,
    dados TEXT NOT NULL,
    criado_em INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS evento_deus (
    id TEXT PRIMARY KEY,
    dados TEXT NOT NULL
  );
`);

// ── BACKUP AUTOMÁTICO ─────────────────────────────────────
function fazerBackup() {
  const backup_path = path.join(DATA_DIR, `backup_${Date.now()}.db`);
  db.backup(backup_path).then(() => {
    const backups = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('backup_'))
      .sort().reverse();
    backups.slice(3).forEach(f => fs.unlinkSync(path.join(DATA_DIR, f)));
  }).catch(() => {});
}

setInterval(fazerBackup, 30 * 60 * 1000);

// ── JOGADORES ─────────────────────────────────────────────
function getJogador(id) {
  const row = db.prepare('SELECT dados FROM jogadores WHERE id = ?').get(id);
  return row ? JSON.parse(row.dados) : null;
}

function salvarJogador(id, dados) {
  db.prepare(`
    INSERT INTO jogadores (id, dados, atualizado_em)
    VALUES (?, ?, strftime('%s','now'))
    ON CONFLICT(id) DO UPDATE SET dados = excluded.dados, atualizado_em = excluded.atualizado_em
  `).run(id, JSON.stringify(dados));
}

function criarJogador(id, whatsapp_nome, classe, nomePersonagem, idade, historia, classeDados) {
  const jogador = {
    id, whatsapp_nome, nome: nomePersonagem, classe,
    nivel: 1, xp: 0, xp_proximo: 100,
    rank: 'F', moedas: 100, banco: 0,
    hp: classeDados.hp, hp_max: classeDados.hp,
    mana: classeDados.mana, mana_max: classeDados.mana,
    for: classeDados.for, des: classeDados.des,
    con: classeDados.con, int: classeDados.int,
    sorte: Math.floor(Math.random() * 100) + 1,
    fe: ['paladino','curandeiro','serafim'].includes(classe) ? 100 :
        ['necromante','portador_caos','vampiro'].includes(classe) ? 10 : 50,
    idade, historia,
    arma: null, inventario: [], pet: null, animal: null,
    ovos: [],
    conquistas: [], titulos: [], titulo_ativo: null,
    regiao: 'valdris', morto: false, servo_de: null, servo_de_id: null,
    status_negativos: [], status_positivos: [],
    boss_mortos: [], regioes_visitadas: ['valdris'],
    pvp_vitorias: 0, pvp_derrotas: 0,
    kills: 0, mortes: 0,
    cooldown_batalha: 0, cooldown_ultimate: {},
    cooldown_roleta: 0, cooldown_masmorra: 0,
    cooldown_acampar: 0,
    criado_em: new Date().toISOString(),
    missoes_diarias: { data: '', feitas: [] },
    login_diario: { data: '', streak: 0 },
    guilda_id: null,
    casado_com: null,
    batalha_ativa: null,
    poder_especial: classeDados.poder_especial || null,
    vampiro_roubos: 0,
    invisivel: false,
    ressurreicao_usada: false,
    poderes_absorvidos: [],
    armadilhas: 0,
    tem_dragao: classe === 'dragomante',
    dano_total_deus: 0,
    imperador: false,
  };
  salvarJogador(id, jogador);
  return jogador;
}

function todosJogadores() {
  return db.prepare('SELECT dados FROM jogadores').all().map(r => JSON.parse(r.dados));
}

// ── RANKING ───────────────────────────────────────────────
function getRanking() {
  return todosJogadores()
    .filter(j => !j.morto)
    .sort((a, b) => (b.nivel || 1) - (a.nivel || 1) || b.xp - a.xp)
    .slice(0, 10);
}

// ── NÍVEL E XP ────────────────────────────────────────────
function calcularXPProximo(nivel) {
  if (nivel <= 10) return nivel * 100;
  if (nivel <= 30) return nivel * 250;
  if (nivel <= 60) return nivel * 500;
  if (nivel <= 100) return nivel * 1000;
  if (nivel <= 150) return nivel * 2000;
  return nivel * 4000;
}

function adicionarXP(id, quantidade) {
  const j = getJogador(id);
  if (!j) return null;

  const nivelAntes = j.nivel || 1;
  j.xp = (j.xp || 0) + quantidade;

  let nivel = j.nivel || 1;
  let subiu = false;
  let msgs = [];

  while (nivel < 200) {
    const xp_necessario = calcularXPProximo(nivel);
    if (j.xp >= xp_necessario) {
      j.xp -= xp_necessario;
      nivel++;
      subiu = true;
      // Bônus ao subir de nível
      j.hp_max += 10;
      j.hp = j.hp_max;
      j.mana_max += 5;
      j.mana = j.mana_max;
      j.for += 1;
      j.con += 1;

      if (nivel === 200) {
        j.imperador = true;
        if (!Array.isArray(j.titulos)) j.titulos = [];
        if (!j.titulos.includes('imperador')) j.titulos.push('imperador');
        msgs.push('👑 VOCÊ SE TORNOU UM IMPERADOR!');
      }
    } else break;
  }

  j.nivel = Math.min(nivel, 200);
  j.xp_proximo = calcularXPProximo(j.nivel);
  j.rank = getRank(j.nivel);

  salvarJogador(id, j);
  return { nivelAntes, nivelDepois: j.nivel, subiu, msgs };
}

function getRank(nivel) {
  if (nivel >= 200) return '☠️ IMPERADOR';
  if (nivel >= 150) return '✦LENDÁRIO✦';
  if (nivel >= 100) return 'SSS';
  if (nivel >= 80) return 'SS';
  if (nivel >= 60) return 'S';
  if (nivel >= 45) return 'A';
  if (nivel >= 30) return 'B';
  if (nivel >= 20) return 'C';
  if (nivel >= 10) return 'D';
  if (nivel >= 5) return 'E';
  return 'F';
}

function getBonusRank(nivel) {
  if (nivel >= 200) return 250;
  if (nivel >= 150) return 150;
  if (nivel >= 100) return 100;
  if (nivel >= 80) return 75;
  if (nivel >= 60) return 55;
  if (nivel >= 45) return 40;
  if (nivel >= 30) return 28;
  if (nivel >= 20) return 18;
  if (nivel >= 10) return 10;
  if (nivel >= 5) return 5;
  return 0;
}

function adicionarMoedas(id, quantidade) {
  const j = getJogador(id);
  if (!j) return;
  j.moedas = Math.max(0, (j.moedas || 0) + quantidade);
  salvarJogador(id, j);
}

function adicionarConquista(id, conquista_id) {
  const j = getJogador(id);
  if (!j) return false;
  if (!Array.isArray(j.conquistas)) j.conquistas = [];
  if (j.conquistas.includes(conquista_id)) return false;
  j.conquistas.push(conquista_id);
  salvarJogador(id, j);
  return true;
}

function adicionarTitulo(id, titulo_id) {
  const j = getJogador(id);
  if (!j) return false;
  if (!Array.isArray(j.titulos)) j.titulos = [];
  if (j.titulos.includes(titulo_id)) return false;
  j.titulos.push(titulo_id);
  salvarJogador(id, j);
  return true;
}

// ── CONFIG GLOBAL ─────────────────────────────────────────
function getConfig(chave) {
  const row = db.prepare('SELECT valor FROM config WHERE chave = ?').get(chave);
  return row ? JSON.parse(row.valor) : null;
}

function setConfig(chave, valor) {
  db.prepare(`
    INSERT INTO config (chave, valor) VALUES (?, ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor
  `).run(chave, JSON.stringify(valor));
}

// ── PENDENTES ─────────────────────────────────────────────
function getPendente(id) {
  const row = db.prepare('SELECT dados FROM pendentes WHERE id = ?').get(id);
  return row ? JSON.parse(row.dados) : null;
}

function setPendente(id, dados) {
  db.prepare(`
    INSERT INTO pendentes (id, dados) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET dados = excluded.dados
  `).run(id, JSON.stringify(dados));
}

function deletePendente(id) {
  db.prepare('DELETE FROM pendentes WHERE id = ?').run(id);
}

// ── SACRIFÍCIOS ───────────────────────────────────────────
function getSacrificio(id) {
  const row = db.prepare('SELECT dados FROM sacrificios WHERE id = ?').get(id);
  return row ? JSON.parse(row.dados) : null;
}

function setSacrificio(id, dados) {
  db.prepare(`
    INSERT INTO sacrificios (id, dados) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET dados = excluded.dados
  `).run(id, JSON.stringify(dados));
}

function deleteSacrificio(id) {
  db.prepare('DELETE FROM sacrificios WHERE id = ?').run(id);
}

function getAllSacrificios() {
  return db.prepare('SELECT dados FROM sacrificios').all().map(r => JSON.parse(r.dados));
}

// ── ENCARNAÇÃO ────────────────────────────────────────────
function getEncarnacao(id) {
  const row = db.prepare('SELECT dados FROM encarnacoes WHERE id = ?').get(id);
  return row ? JSON.parse(row.dados) : null;
}

function setEncarnacao(id, dados) {
  db.prepare(`
    INSERT INTO encarnacoes (id, dados) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET dados = excluded.dados
  `).run(id, JSON.stringify(dados));
}

function deleteEncarnacao(id) {
  db.prepare('DELETE FROM encarnacoes WHERE id = ?').run(id);
}

// ── GUILDAS ───────────────────────────────────────────────
function getGuilda(id) {
  const row = db.prepare('SELECT dados FROM guildas WHERE id = ?').get(id);
  return row ? JSON.parse(row.dados) : null;
}

function setGuilda(id, dados) {
  db.prepare(`
    INSERT INTO guildas (id, dados) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET dados = excluded.dados
  `).run(id, JSON.stringify(dados));
}

function deleteGuilda(id) {
  db.prepare('DELETE FROM guildas WHERE id = ?').run(id);
}

function todasGuildas() {
  return db.prepare('SELECT dados FROM guildas').all().map(r => JSON.parse(r.dados));
}

// ── CASAMENTOS ────────────────────────────────────────────
function getCasamento(id) {
  const row = db.prepare('SELECT dados FROM casamentos WHERE id = ?').get(id);
  return row ? JSON.parse(row.dados) : null;
}

function setCasamento(id, dados) {
  db.prepare(`
    INSERT INTO casamentos (id, dados) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET dados = excluded.dados
  `).run(id, JSON.stringify(dados));
}

function deleteCasamento(id) {
  db.prepare('DELETE FROM casamentos WHERE id = ?').run(id);
}

// ── EVENTO DEUS ───────────────────────────────────────────
function getEventoDeus() {
  const row = db.prepare('SELECT dados FROM evento_deus WHERE id = ?').get('atual');
  return row ? JSON.parse(row.dados) : null;
}

function setEventoDeus(dados) {
  db.prepare(`
    INSERT INTO evento_deus (id, dados) VALUES ('atual', ?)
    ON CONFLICT(id) DO UPDATE SET dados = excluded.dados
  `).run(JSON.stringify(dados));
}

function deleteEventoDeus() {
  db.prepare('DELETE FROM evento_deus WHERE id = ?').run('atual');
}

module.exports = {
  getJogador, salvarJogador, criarJogador, todosJogadores,
  getRanking, getRank, getBonusRank,
  adicionarXP, adicionarMoedas, adicionarConquista, adicionarTitulo,
  calcularXPProximo,
  getConfig, setConfig,
  getPendente, setPendente, deletePendente,
  getSacrificio, setSacrificio, deleteSacrificio, getAllSacrificios,
  getEncarnacao, setEncarnacao, deleteEncarnacao,
  getGuilda, setGuilda, deleteGuilda, todasGuildas,
  getCasamento, setCasamento, deleteCasamento,
  getEventoDeus, setEventoDeus, deleteEventoDeus,
  fazerBackup
};
