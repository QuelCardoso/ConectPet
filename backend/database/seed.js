const db = require('../config/database');
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
