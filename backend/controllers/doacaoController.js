const db = require('../config/database');

exports.realizarDoacao = (req, res) => {
  const { ong_id, campanha_id, tipo, valor, descricao } = req.body;
  const usuario_id = req.usuario.id;

  if (!ong_id || !tipo) return res.status(400).json({ erro: 'ONG e tipo de doação são obrigatórios.' });

  const sql = `INSERT INTO doacoes (usuario_id, ong_id, campanha_id, tipo, valor, descricao, status) VALUES (?, ?, ?, ?, ?, ?, 'Confirmada')`;
  db.run(sql, [usuario_id, ong_id, campanha_id || null, tipo, valor || 0.0, descricao || ''], function (err) {
    if (err) return res.status(500).json({ erro: 'Erro ao registrar doação.' });

    if (campanha_id && valor > 0) {
      db.run(`UPDATE campanhas SET valor_arrecadado = valor_arrecadado + ? WHERE id = ?`, [valor, campanha_id]);
    }

    res.status(201).json({ mensagem: 'Doação registrada e simulada com sucesso!', doacaoId: this.lastID });
  });
};

exports.minhasDoacoes = (req, res) => {
  const usuario_id = req.usuario.id;
  const sql = `SELECT d.*, o.nome as ong_nome, c.titulo as campanha_titulo FROM doacoes d JOIN ongs o ON d.ong_id = o.id LEFT JOIN campanhas c ON d.campanha_id = c.id WHERE d.usuario_id = ? ORDER BY d.data_doacao DESC`;
  db.all(sql, [usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar doações.' });
    res.status(200).json(rows);
  });
};
