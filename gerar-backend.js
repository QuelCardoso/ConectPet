const fs = require('fs');
const path = require('path');

// 1. Criar pastas do backend se não existirem
const pastas = [
  'backend',
  'backend/config',
  'backend/controllers',
  'backend/database',
  'backend/middleware',
  'backend/routes'
];

pastas.forEach(dir => {
  const fullPath = path.resolve(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// 2. Mapeamento de todos os arquivos backend necessários
const arquivos = {
  // Database Config
  'backend/config/database.js': `const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database/conectapet.db');
const sqlInitPath = path.resolve(__dirname, '../database/init.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('⚡ Conectado com sucesso ao banco de dados SQLite.');
  }
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');
  if (fs.existsSync(sqlInitPath)) {
    const initSql = fs.readFileSync(sqlInitPath, 'utf-8');
    db.exec(initSql, (err) => {
      if (err) {
        console.error('❌ Erro no init.sql:', err.message);
      } else {
        console.log('✅ Tabelas do banco de dados inicializadas.');
      }
    });
  }
});

module.exports = db;
`,

  // Database SQL Init
  'backend/database/init.sql': `PRAGMA foreign_keys = ON;

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
`,

  // Seed Script
  'backend/database/seed.js': `const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Gerando dados fictícios de teste...');
  const senhaHash = await bcrypt.hash('123456', 10);

  db.serialize(() => {
    db.run('DELETE FROM prestacoes_contas');
    db.run('DELETE FROM atualizacoes');
    db.run('DELETE FROM doacoes');
    db.run('DELETE FROM campanhas');
    db.run('DELETE FROM necessidades');
    db.run('DELETE FROM ongs');
    db.run('DELETE FROM usuarios');

    const stmtUser = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?)');
    stmtUser.run('Administrador ConectaPet', 'admin@conectapet.org', senhaHash, 'ADMIN');
    stmtUser.run('Raquel Cardoso', 'raquel@email.com', senhaHash, 'DOADOR');
    stmtUser.run('Carlos Eduardo', 'carlos@email.com', senhaHash, 'DOADOR');
    stmtUser.run('Mariana Souza', 'mariana@email.com', senhaHash, 'DOADOR');
    stmtUser.run('ONG Patas Amigas', 'contato@patasamigas.org', senhaHash, 'ONG');
    stmtUser.run('ONG Anjos de Quatro Patas', 'contato@anjosqp.org', senhaHash, 'ONG');
    stmtUser.run('Instituto Proteção Animal', 'contato@protecaoanimal.org', senhaHash, 'ONG');
    stmtUser.finalize();

    const stmtOng = db.prepare('INSERT INTO ongs (usuario_id, nome, descricao, cnpj, cidade, estado, endereco, telefone, status_verificacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmtOng.run(5, 'Patas Amigas', 'Resgate e reabilitação de cães e gatos em situação de rua.', '12.345.678/0001-90', 'Santo Antônio de Jesus', 'BA', 'Rua das Flores, 120', '(75) 99999-1111', 'Verificada');
    stmtOng.run(6, 'Anjos de Quatro Patas', 'Abrigo e assistência veterinária gratuita para animais vulneráveis.', '98.765.432/0001-10', 'Salvador', 'BA', 'Av. Paralela, 4500', '(71) 98888-2222', 'Verificada');
    stmtOng.run(7, 'Instituto Proteção Animal', 'Acolhimento temporário e campanhas de castração.', '45.678.912/0001-33', 'Feira de Santana', 'BA', 'Rua Central, 80', '(75) 97777-3333', 'Pendente');
    stmtOng.finalize();

    const stmtCamp = db.prepare('INSERT INTO campanhas (ong_id, titulo, descricao, meta, valor_arrecadado, data_inicio, data_fim, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmtCamp.run(1, 'Reforma do Gatil', 'Reforma do espaço dos gatos para criar novas baias e enriquecimento ambiental.', 5000.00, 3250.00, '2026-09-01', '2026-10-31', 'Ativa');
    stmtCamp.run(2, 'Mutirão de Castração', 'Campanha para castração gratuita de 50 animais da comunidade.', 8000.00, 4500.00, '2026-09-15', '2026-11-15', 'Ativa');
    stmtCamp.finalize();

    const stmtDoac = db.prepare('INSERT INTO doacoes (usuario_id, ong_id, campanha_id, tipo, valor, descricao, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmtDoac.run(2, 1, 1, 'Financeira', 150.00, 'Doação para a reforma do gatil', 'Confirmada');
    stmtDoac.run(3, 1, 1, 'Financeira', 100.00, 'Apoio à campanha do gatil', 'Confirmada');
    stmtDoac.finalize();

    console.log('✨ Dados fictícios inseridos com sucesso!');
  });
}
seed();
`,

  // Middleware Auth
  'backend/middleware/auth.js': `const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta_conectapet_academico_2026', (err, usuario) => {
    if (err) return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    req.usuario = usuario;
    next();
  });
}

function autorizarTipos(...tiposPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !tiposPermitidos.includes(req.usuario.tipo_usuario)) {
      return res.status(403).json({ erro: 'Acesso não autorizado para seu tipo de perfil.' });
    }
    next();
  };
}

module.exports = { autenticarToken, autorizarTipos };
`,

  // Auth Controller
  'backend/controllers/authController.js': `const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res) => {
  const { nome, email, senha, tipo_usuario } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });

  const tipo = ['DOADOR', 'ONG', 'ADMIN'].includes(tipo_usuario) ? tipo_usuario : 'DOADOR';

  try {
    const senha_hash = await bcrypt.hash(senha, 10);
    const query = \`INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?)\`;

    db.run(query, [nome, email, senha_hash, tipo], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ erro: 'E-mail já cadastrado.' });
        }
        return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
      }

      if (tipo === 'ONG') {
        const userId = this.lastID;
        db.run(\`INSERT INTO ongs (usuario_id, nome, cnpj, cidade, estado, status_verificacao) VALUES (?, ?, ?, ?, ?, 'Pendente')\`,
          [userId, nome, '00.000.000/0001-00', 'Santo Antônio de Jesus', 'BA']);
      }

      res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: { id: this.lastID, nome, email, tipo_usuario: tipo } });
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno ao processar cadastro.' });
  }
};

exports.login = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Forneça e-mail e senha.' });

  db.get(\`SELECT * FROM usuarios WHERE email = ?\`, [email], async (err, usuario) => {
    if (err || !usuario) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo_usuario: usuario.tipo_usuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'chave_secreta_conectapet_academico_2026', { expiresIn: '8h' });

    res.status(200).json({ mensagem: 'Login realizado com sucesso!', token, usuario: payload });
  });
};

exports.getMe = (req, res) => {
  res.status(200).json({ usuario: req.usuario });
};
`,

  // ONG Controller
  'backend/controllers/ongController.js': `const db = require('../config/database');

exports.listarOngs = (req, res) => {
  const { cidade, busca, status } = req.query;
  let sql = \`SELECT id, nome, descricao, cnpj, cidade, estado, telefone, status_verificacao FROM ongs WHERE 1=1\`;
  const params = [];

  if (status) {
    sql += \` AND status_verificacao = ?\`;
    params.push(status);
  } else {
    sql += \` AND status_verificacao = 'Verificada'\`;
  }

  if (cidade) {
    sql += \` AND cidade LIKE ?\`;
    params.push(\`%\${cidade}%\`);
  }

  if (busca) {
    sql += \` AND (nome LIKE ? OR descricao LIKE ?)\`;
    params.push(\`%\${busca}%\`, \`%\${busca}%\`);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar ONGs.' });
    res.status(200).json(rows);
  });
};

exports.obterOngPorId = (req, res) => {
  const { id } = req.params;
  db.get(\`SELECT * FROM ongs WHERE id = ?\`, [id], (err, ong) => {
    if (err || !ong) return res.status(404).json({ erro: 'ONG não encontrada.' });
    res.status(200).json(ong);
  });
};

exports.cadastrarNecessidade = (req, res) => {
  const { titulo, descricao, categoria, quantidade, prioridade } = req.body;
  const usuarioId = req.usuario.id;

  db.get(\`SELECT id FROM ongs WHERE usuario_id = ?\`, [usuarioId], (err, ong) => {
    if (err || !ong) return res.status(404).json({ erro: 'Perfil de ONG não localizado.' });

    const sql = \`INSERT INTO necessidades (ong_id, titulo, descricao, categoria, quantidade, prioridade) VALUES (?, ?, ?, ?, ?, ?)\`;
    db.run(sql, [ong.id, titulo, descricao, categoria, quantidade || 1, prioridade || 'Média'], function (err) {
      if (err) return res.status(500).json({ erro: 'Erro ao cadastrar necessidade.' });
      res.status(201).json({ mensagem: 'Necessidade cadastrada com sucesso!', id: this.lastID });
    });
  });
};

exports.cadastrarCampanha = (req, res) => {
  const { titulo, descricao, meta, data_inicio, data_fim } = req.body;
  const usuarioId = req.usuario.id;

  db.get(\`SELECT id FROM ongs WHERE usuario_id = ?\`, [usuarioId], (err, ong) => {
    if (err || !ong) return res.status(404).json({ erro: 'Perfil de ONG não localizado.' });

    const sql = \`INSERT INTO campanhas (ong_id, titulo, descricao, meta, data_inicio, data_fim) VALUES (?, ?, ?, ?, ?, ?)\`;
    db.run(sql, [ong.id, titulo, descricao, meta, data_inicio || '2026-10-01', data_fim || '2026-12-31'], function (err) {
      if (err) return res.status(500).json({ erro: 'Erro ao cadastrar campanha.' });
      res.status(201).json({ mensagem: 'Campanha criada com sucesso!', id: this.lastID });
    });
  });
};

exports.listarCampanhas = (req, res) => {
  const sql = \`SELECT c.*, o.nome as ong_nome, o.cidade as ong_cidade FROM campanhas c JOIN ongs o ON c.ong_id = o.id WHERE c.status = 'Ativa'\`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar campanhas.' });
    res.status(200).json(rows);
  });
};
`,

  // Doação Controller
  'backend/controllers/doacaoController.js': `const db = require('../config/database');

exports.realizarDoacao = (req, res) => {
  const { ong_id, campanha_id, tipo, valor, descricao } = req.body;
  const usuario_id = req.usuario.id;

  if (!ong_id || !tipo) return res.status(400).json({ erro: 'ONG e tipo de doação são obrigatórios.' });

  const sql = \`INSERT INTO doacoes (usuario_id, ong_id, campanha_id, tipo, valor, descricao, status) VALUES (?, ?, ?, ?, ?, ?, 'Confirmada')\`;
  db.run(sql, [usuario_id, ong_id, campanha_id || null, tipo, valor || 0.0, descricao || ''], function (err) {
    if (err) return res.status(500).json({ erro: 'Erro ao registrar doação.' });

    if (campanha_id && valor > 0) {
      db.run(\`UPDATE campanhas SET valor_arrecadado = valor_arrecadado + ? WHERE id = ?\`, [valor, campanha_id]);
    }

    res.status(201).json({ mensagem: 'Doação registrada e simulada com sucesso!', doacaoId: this.lastID });
  });
};

exports.minhasDoacoes = (req, res) => {
  const usuario_id = req.usuario.id;
  const sql = \`SELECT d.*, o.nome as ong_nome, c.titulo as campanha_titulo FROM doacoes d JOIN ongs o ON d.ong_id = o.id LEFT JOIN campanhas c ON d.campanha_id = c.id WHERE d.usuario_id = ? ORDER BY d.data_doacao DESC\`;
  db.all(sql, [usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar doações.' });
    res.status(200).json(rows);
  });
};
`,

  // Admin Controller
  'backend/controllers/adminController.js': `const db = require('../config/database');

exports.listarTodasOngs = (req, res) => {
  db.all(\`SELECT * FROM ongs ORDER BY data_cadastro DESC\`, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao carregar ONGs.' });
    res.status(200).json(rows);
  });
};

exports.atualizarStatusOng = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(\`UPDATE ongs SET status_verificacao = ? WHERE id = ?\`, [status, id], function (err) {
    if (err) return res.status(500).json({ erro: 'Erro ao atualizar status da ONG.' });
    res.status(200).json({ mensagem: \`Status alterado para "\${status}" com sucesso!\` });
  });
};

exports.obterIndicadores = (req, res) => {
  db.get(\`SELECT COUNT(*) as totalUsuarios FROM usuarios\`, [], (err, u) => {
    db.get(\`SELECT COUNT(*) as totalOngs FROM ongs\`, [], (err, o) => {
      res.status(200).json({ usuarios: u ? u.totalUsuarios : 0, ongs: o ? o.totalOngs : 0 });
    });
  });
};
`,

  // Auth Routes
  'backend/routes/authRoutes.js': `const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticarToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', autenticarToken, authController.getMe);

module.exports = router;
`,

  // ONG Routes
  'backend/routes/ongRoutes.js': `const express = require('express');
const router = express.Router();
const ongController = require('../controllers/ongController');
const { autenticarToken, autorizarTipos } = require('../middleware/auth');

router.get('/', ongController.listarOngs);
router.get('/campanhas', ongController.listarCampanhas);
router.get('/:id', ongController.obterOngPorId);
router.post('/necessidades', autenticarToken, autorizarTipos('ONG'), ongController.cadastrarNecessidade);
router.post('/campanhas', autenticarToken, autorizarTipos('ONG'), ongController.cadastrarCampanha);

module.exports = router;
`,

  // Doacao Routes
  'backend/routes/doacaoRoutes.js': `const express = require('express');
const router = express.Router();
const doacaoController = require('../controllers/doacaoController');
const { autenticarToken } = require('../middleware/auth');

router.post('/', autenticarToken, doacaoController.realizarDoacao);
router.get('/minhas', autenticarToken, doacaoController.minhasDoacoes);

module.exports = router;
`,

  // Admin Routes
  'backend/routes/adminRoutes.js': `const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { autenticarToken, autorizarTipos } = require('../middleware/auth');

router.use(autenticarToken, autorizarTipos('ADMIN'));
router.get('/ongs', adminController.listarTodasOngs);
router.put('/ongs/:id/status', adminController.atualizarStatusOng);
router.get('/indicadores', adminController.obterIndicadores);

module.exports = router;
`,

  // Server principal
  'backend/server.js': `const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

const authRoutes = require('./routes/authRoutes');
const ongRoutes = require('./routes/ongRoutes');
const doacaoRoutes = require('./routes/doacaoRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ongs', ongRoutes);
app.use('/api/doacoes', doacaoRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', mensagem: 'API ConectaPet rodando perfeitamente!' });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ erro: 'Rota da API não encontrada.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`
  🐾 =============================================== 🐾
  🚀 Servidor ConectaPet rodando com sucesso!
  📍 Local: http://localhost:\${PORT}
  📡 API Health: http://localhost:\${PORT}/api/health
  🐾 =============================================== 🐾
  \`);
});
`
};

Object.entries(arquivos).forEach(([filePath, content]) => {
  const fullPath = path.resolve(__dirname, filePath);
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Arquivo criado/atualizado: ${filePath}`);
});

console.log('\n✨ Todos os módulos do backend foram gerados com sucesso!');