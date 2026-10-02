const db = require('../config/database');

exports.listarOngs = (req, res) => {
  const { cidade, busca, status } = req.query;
  let sql = `SELECT id, nome, descricao, cnpj, cidade, estado, telefone, status_verificacao FROM ongs WHERE 1=1`;
  const params = [];

  if (status) {
    sql += ` AND status_verificacao = ?`;
    params.push(status);
  } else {
    sql += ` AND status_verificacao = 'Verificada'`;
  }

  if (cidade) {
    sql += ` AND cidade LIKE ?`;
    params.push(`%${cidade}%`);
  }

  if (busca) {
    sql += ` AND (nome LIKE ? OR descricao LIKE ?)`;
    params.push(`%${busca}%`, `%${busca}%`);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar ONGs.' });
    res.status(200).json(rows);
  });
};

exports.obterOngPorId = (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM ongs WHERE id = ?`, [id], (err, ong) => {
    if (err || !ong) return res.status(404).json({ erro: 'ONG não encontrada.' });
    res.status(200).json(ong);
  });
};

exports.cadastrarNecessidade = (req, res) => {
  const { titulo, descricao, categoria, quantidade, prioridade } = req.body;
  const usuarioId = req.usuario.id;

  db.get(`SELECT id FROM ongs WHERE usuario_id = ?`, [usuarioId], (err, ong) => {
    if (err || !ong) return res.status(404).json({ erro: 'Perfil de ONG não localizado.' });

    const sql = `INSERT INTO necessidades (ong_id, titulo, descricao, categoria, quantidade, prioridade) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [ong.id, titulo, descricao, categoria, quantidade || 1, prioridade || 'Média'], function (err) {
      if (err) return res.status(500).json({ erro: 'Erro ao cadastrar necessidade.' });
      res.status(201).json({ mensagem: 'Necessidade cadastrada com sucesso!', id: this.lastID });
    });
  });
};

exports.cadastrarCampanha = (req, res) => {
  const { titulo, descricao, meta, data_inicio, data_fim } = req.body;
  const usuarioId = req.usuario.id;

  db.get(`SELECT id FROM ongs WHERE usuario_id = ?`, [usuarioId], (err, ong) => {
    if (err || !ong) return res.status(404).json({ erro: 'Perfil de ONG não localizado.' });

    const sql = `INSERT INTO campanhas (ong_id, titulo, descricao, meta, data_inicio, data_fim) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [ong.id, titulo, descricao, meta, data_inicio || '2026-10-01', data_fim || '2026-12-31'], function (err) {
      if (err) return res.status(500).json({ erro: 'Erro ao cadastrar campanha.' });
      res.status(201).json({ mensagem: 'Campanha criada com sucesso!', id: this.lastID });
    });
  });
};

exports.listarCampanhas = (req, res) => {
  const sql = `SELECT c.*, o.nome as ong_nome, o.cidade as ong_cidade FROM campanhas c JOIN ongs o ON c.ong_id = o.id WHERE c.status = 'Ativa'`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar campanhas.' });
    res.status(200).json(rows);
  });
};
