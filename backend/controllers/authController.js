const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res) => {
  const { nome, email, senha, tipo_usuario } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });

  const tipo = ['DOADOR', 'ONG', 'ADMIN'].includes(tipo_usuario) ? tipo_usuario : 'DOADOR';

  try {
    const senha_hash = await bcrypt.hash(senha, 10);
    const query = `INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?)`;

    db.run(query, [nome, email, senha_hash, tipo], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ erro: 'E-mail já cadastrado.' });
        }
        return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
      }

      if (tipo === 'ONG') {
        const userId = this.lastID;
        db.run(`INSERT INTO ongs (usuario_id, nome, cnpj, cidade, estado, status_verificacao) VALUES (?, ?, ?, ?, ?, 'Pendente')`,
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

  db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, usuario) => {
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
