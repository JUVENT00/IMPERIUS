// ============================================================
// IMPERIUS RPG — BANCO DE DADOS (SQLite)
// ============================================================
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'imperius.db');
const db = new Database(DB_PATH);

// WAL mode para performance e segurança
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
`);

// ── BACKUP AUTOMÁTICO ─────────────────────────────────────
function fazerBackup() {
  const backup_path = path.join(DATA_DIR, `backup_${Date.now()}.db`);
  db.backup(backup_path).then(() => {
    // Manter só os 3 backups mais recentes
    const backups = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('backup_'))
      .sort()
      .reverse();
    backups.slice(3).forEach(f => fs.unlinkSync(path.join(DATA_DIR, f)));
  }).catch(() => {});
}

// Backup a cada 30 minutos
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
    rank: 'F', xp: 0, moedas: 100,
    hp: classeDados.hp, hp_max: classeDados.hp,
    mana: classeDados.mana, mana_max: classeDados.mana,
    for: classeDados.for, des: classeDados.des,
    con: classeDados.con, int: classeDados.int,
    sorte: Math.floor(Math.random() * 100) + 1,
    fe: ['paladino','curandeiro','serafim'].includes(classe) ? 100 :
        ['necromante','portador_caos','vampiro'].includes(classe) ? 10 : 50,
    idade, historia,
    arma: null, inventario: [], pet: null,
    conquistas: [], titulos: [], titulo_ativo: null,
    regiao: 'valdris', morto: false, servo_de: null, servo_de_id: null,
    status_negativos: [], status_positivos: [],
    boss_mortos: [], regioes_visitadas: ['valdris'],
    pvp_vitorias: 0, pvp_derrotas: 0,
    kills: 0, mortes: 0,
    cooldown_batalha: 0, cooldown_ultimate: {},
    cooldown_roleta: 0,
    criado_em: new Date().toISOString(),
    missoes_diarias: { data: '', feitas: [] },
    // Campos especiais para classes raras
    poder_especial: classeDados.poder_especial || null,
    // Vampiro
    vampiro_roubos: 0,
    // Sombra
    invisivel: false,
    // Serafim
    ressurreicao_usada: false,
    // Heroi Caido
    poderes_absorvidos: [],
    // Artificer
    armadilhas: 0,
    // Dragomante
    tem_dragao: classe === 'dragomante',
  };
  salvarJogador(id, jogador);
  return jogador;
}

// ── RANKING ───────────────────────────────────────────────
function getRanking() {
  const rows = db.prepare('SELECT dados FROM jogadores').all();
  return rows.map(r => JSON.parse(r.dados))
    .filter(j => !j.morto)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);
}

// ── XP E RANK ─────────────────────────────────────────────
function getRank(xp) {
  const { RANKS } = require('../data/gameData');
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xp_min) return RANKS[i].nome;
  }
  return 'F';
}

function getBonusRank(xp) {
  const { RANKS } = require('../data/gameData');
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xp_min) return RANKS[i].bonus;
  }
  return 0;
}

function adicionarXP(id, quantidade) {
  const j = getJogador(id);
  if (!j) return null;
  const rankAntes = j.rank;
  j.xp += quantidade;
  j.rank = getRank(j.xp);
  const bonus = getBonusRank(j.xp);
  j.hp_max = j.hp + bonus;
  j.mana_max = j.mana + bonus;
  salvarJogador(id, j);
  return { rankAntes, rankDepois: j.rank, subiu: rankAntes !== j.rank };
}

function adicionarMoedas(id, quantidade) {
  const j = getJogador(id);
  if (!j) return;
  j.moedas = Math.max(0, j.moedas + quantidade);
  salvarJogador(id, j);
}

function adicionarConquista(id, conquista_id) {
  const j = getJogador(id);
  if (!j || j.conquistas.includes(conquista_id)) return false;
  j.conquistas.push(conquista_id);
  salvarJogador(id, j);
  return true;
}

function adicionarTitulo(id, titulo_id) {
  const j = getJogador(id);
  if (!j || j.titulos.includes(titulo_id)) return false;
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

// ── PENDENTES (SERVO/SACRIFÍCIO) ──────────────────────────
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

function todosJogadores() {
  return db.prepare('SELECT dados FROM jogadores').all().map(r => JSON.parse(r.dados));
}

module.exports = {
  getJogador, salvarJogador, criarJogador,
  getRanking, getRank, getBonusRank,
  adicionarXP, adicionarMoedas, adicionarConquista, adicionarTitulo,
  getConfig, setConfig,
  getPendente, setPendente, deletePendente,
  getSacrificio, setSacrificio, deleteSacrificio, getAllSacrificios,
  getEncarnacao, setEncarnacao, deleteEncarnacao,
  todosJogadores, fazerBackup
};
