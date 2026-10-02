PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    tipo_usuario TEXT CHECK(tipo_usuario IN ('DOADOR', 'ONG', 'ADMIN')) NOT NULL DEFAULT 'DOADOR',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ongs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    cnpj TEXT UNIQUE NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    endereco TEXT,
    telefone TEXT,
    status_verificacao TEXT CHECK(status_verificacao IN ('Pendente', 'Em análise', 'Verificada', 'Rejeitada', 'Suspensa')) DEFAULT 'Pendente',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS necessidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ong_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT CHECK(categoria IN ('Ração', 'Medicamentos', 'Produtos de Higiene', 'Evolução/Instalações', 'Outros')) NOT NULL,
    quantidade INTEGER DEFAULT 1,
    prioridade TEXT CHECK(prioridade IN ('Baixa', 'Média', 'Alta', 'Urgente')) DEFAULT 'Média',
    status TEXT CHECK(status IN ('Ativa', 'Atendida', 'Cancelada')) DEFAULT 'Ativa',
    FOREIGN KEY (ong_id) REFERENCES ongs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campanhas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ong_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    meta REAL NOT NULL,
    valor_arrecadado REAL DEFAULT 0.0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status TEXT CHECK(status IN ('Ativa', 'Encerrada', 'Meta Atingida')) DEFAULT 'Ativa',
    FOREIGN KEY (ong_id) REFERENCES ongs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    ong_id INTEGER NOT NULL,
    campanha_id INTEGER,
    tipo TEXT CHECK(tipo IN ('Financeira', 'Ração', 'Medicamentos', 'Produtos de Higiene', 'Outros')) NOT NULL,
    valor REAL DEFAULT 0.0,
    descricao TEXT,
    status TEXT CHECK(status IN ('Pendente', 'Confirmada', 'Cancelada')) DEFAULT 'Confirmada',
    data_doacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (ong_id) REFERENCES ongs(id) ON DELETE CASCADE,
    FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS atualizacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ong_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ong_id) REFERENCES ongs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prestacoes_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ong_id INTEGER NOT NULL,
    doacao_id INTEGER,
    descricao TEXT NOT NULL,
    comprovante TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ong_id) REFERENCES ongs(id) ON DELETE CASCADE,
    FOREIGN KEY (doacao_id) REFERENCES doacoes(id) ON DELETE SET NULL
);
