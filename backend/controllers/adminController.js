const db = require('../config/database');

exports.listarTodasOngs = (req, res) => {
  db.all(`SELECT * FROM ongs ORDER BY data_cadastro DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao carregar ONGs.' });
    res.status(200).json(rows);
  });
};

exports.atualizarStatusOng = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(`UPDATE ongs SET status_verificacao = ? WHERE id = ?`, [status, id], function (err) {
    if (err) return res.status(500).json({ erro: 'Erro ao atualizar status da ONG.' });
    res.status(200).json({ mensagem: `Status alterado para "${status}" com sucesso!` });
  });
};

exports.obterIndicadores = (req, res) => {
  db.get(`SELECT COUNT(*) as totalUsuarios FROM usuarios`, [], (err, u) => {
    db.get(`SELECT COUNT(*) as totalOngs FROM ongs`, [], (err, o) => {
      res.status(200).json({ usuarios: u ? u.totalUsuarios : 0, ongs: o ? o.totalOngs : 0 });
    });
  });
};
