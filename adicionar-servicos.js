const fs = require('fs');
const path = require('path');

const doacaoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Realizar Doação ou Voluntariado - ConectaPet</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <a href="index.html" class="logo">🐾 ConectaPet</a>
      <ul class="nav-links">
        <li><a href="index.html">Início</a></li>
        <li><a href="ongs.html">ONGs</a></li>
      </ul>
    </nav>
  </header>

  <main style="max-width: 580px;">
    <section class="card" style="margin-top: 2rem;">
      <h2 style="color: var(--primary-color); text-align: center; margin-bottom: 0.5rem;">Registrar Doação ou Trabalho Voluntário</h2>
      <p style="text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
        Sua ajuda transforma vidas! Escolha se deseja apoiar com recursos materiais, financeiros ou oferecendo seus serviços profissionais.
      </p>

      <div id="msg-doacao" style="display: none; padding: 0.8rem; border-radius: var(--radius); margin-bottom: 1rem; font-size: 0.9rem;"></div>

      <form id="form-doacao">
        <div style="margin-bottom: 1rem;">
          <label for="tipo_doacao" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Tipo de Ajuda / Doação</label>
          <select id="tipo_doacao" onchange="alternarCampos()" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
            <option value="Financeira">Doação Financeira (PIX Simulada)</option>
            <option value="Serviços">Oferecer Serviços (Veterinário, Banho, Limpeza, etc.)</option>
            <option value="Ração">Ração / Alimento</option>
            <option value="Medicamentos">Medicamentos</option>
            <option value="Produtos de Higiene">Produtos de Higiene</option>
            <option value="Outros">Outros Materiais</option>
          </select>
        </div>

        <!-- Campo Dinâmico para Doação Financeira -->
        <div id="campo-valor" style="margin-bottom: 1rem;">
          <label for="valor" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Valor da Doação (R$)</label>
          <input type="number" id="valor" min="1" step="0.50" value="50.00" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        </div>

        <!-- Campo Dinâmico para Oferta de Serviços -->
        <div id="campo-servico" style="display: none; margin-bottom: 1rem; background-color: #ebf8ff; padding: 1rem; border-radius: var(--radius); border: 1px solid #bee3f8;">
          <label for="tipo_servico" style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: #2b6cb0;">Especialidade / Tipo de Serviço Voluntário</label>
          <select id="tipo_servico" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius); margin-bottom: 0.8rem;">
            <option value="Atendimento Veterinário / Consultas">Atendimento Veterinário / Consultas</option>
            <option value="Castração / Procedimentos Cirúrgicos">Castração / Procedimentos Cirúrgicos</option>
            <option value="Banho, Tosa e Estética Animal">Banho, Tosa e Estética Animal</option>
            <option value="Limpeza e Higienização do Abrigo">Limpeza e Higienização do Abrigo</option>
            <option value="Manutenção de Instalações / Pintura">Manutenção de Instalações / Pintura</option>
            <option value="Transporte / Resgate de Animais">Transporte / Resgate de Animais</option>
          </select>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label for="descricao" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Descrição / Disponibilidade / Observações</label>
          <textarea id="descricao" rows="3" placeholder="Para serviços: informe seus dias/horários livres e contato. Para itens: descreva os materiais." style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);"></textarea>
        </div>

        <button type="submit" class="btn btn-secondary" style="width: 100%;">Confirmar Registro de Ajuda</button>
      </form>
    </section>
  </main>

  <script src="js/main.js"></script>
  <script>
    const params = new URLSearchParams(window.location.search);
    const ongId = params.get('ong') || 1;
    const campanhaId = params.get('campanha') || null;

    function alternarCampos() {
      const tipo = document.getElementById('tipo_doacao').value;
      const campoValor = document.getElementById('campo-valor');
      const campoServico = document.getElementById('campo-servico');

      if (tipo === 'Financeira') {
        campoValor.style.display = 'block';
        campoServico.style.display = 'none';
      } else if (tipo === 'Serviços') {
        campoValor.style.display = 'none';
        campoServico.style.display = 'block';
      } else {
        campoValor.style.display = 'none';
        campoServico.style.display = 'none';
      }
    }

    document.getElementById('form-doacao').addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const msg = document.getElementById('msg-doacao');

      if (!token) {
        alert('Faça login para registrar sua doação ou voluntariado.');
        window.location.href = 'login.html';
        return;
      }

      const tipo = document.getElementById('tipo_doacao').value;
      const valor = tipo === 'Financeira' ? (parseFloat(document.getElementById('valor').value) || 0) : 0;
      let descricao = document.getElementById('descricao').value;

      if (tipo === 'Serviços') {
        const servicoSelecionado = document.getElementById('tipo_servico').value;
        descricao = \`[Serviço Oferto: \${servicoSelecionado}] \${descricao}\`;
      }

      try {
        const res = await fetch('/api/doacoes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify({ ong_id: ongId, campanha_id: campanhaId, tipo, valor, descricao })
        });

        const data = await res.json();

        if (!res.ok) {
          msg.style.backgroundColor = '#fed7d7';
          msg.style.color = '#9b2c2c';
          msg.innerText = data.erro || 'Erro ao registrar oferta.';
          msg.style.display = 'block';
          return;
        }

        msg.style.backgroundColor = '#c6f6d5';
        msg.style.color = '#22543d';
        msg.innerText = 'Obrigado! Sua oferta de doação/serviço foi registrada com sucesso!';
        msg.style.display = 'block';

        setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
      } catch (err) {
        msg.style.backgroundColor = '#fed7d7';
        msg.style.color = '#9b2c2c';
        msg.innerText = 'Erro na comunicação com o servidor.';
        msg.style.display = 'block';
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.resolve(__dirname, 'frontend/doacao.html'), doacaoHtml, 'utf-8');
console.log('✅ Tela de doações atualizada com a funcionalidade de Serviços!');