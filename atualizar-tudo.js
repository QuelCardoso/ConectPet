const fs = require('fs');
const path = require('path');

const arquivos = {
  // 1. LOGIN
  'frontend/login.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - ConectaPet</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <a href="index.html" class="logo">🐾 ConectaPet</a>
      <ul class="nav-links">
        <li><a href="index.html">Início</a></li>
        <li><a href="ongs.html">ONGs</a></li>
        <li><a href="cadastro.html" class="btn btn-primary">Criar Conta</a></li>
      </ul>
    </nav>
  </header>

  <main style="max-width: 450px;">
    <section class="card" style="margin-top: 2rem;">
      <h2 style="color: var(--primary-color); text-align: center; margin-bottom: 1.5rem;">Entrar no ConectaPet</h2>
      
      <div id="mensagem-erro" style="display: none; background-color: #fed7d7; color: #9b2c2c; padding: 0.8rem; border-radius: var(--radius); margin-bottom: 1rem; font-size: 0.9rem;"></div>

      <form id="form-login">
        <div style="margin-bottom: 1rem;">
          <label for="email" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">E-mail</label>
          <input type="email" id="email" required placeholder="seuemail@exemplo.com" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label for="senha" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Senha</label>
          <input type="password" id="senha" required placeholder="••••••••" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Acessar Conta</button>
      </form>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem;">
        <p>Ainda não tem conta? <a href="cadastro.html" style="color: var(--primary-color); font-weight: bold;">Cadastre-se</a></p>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.8rem; color: var(--text-muted);">
        <p><strong>Contas de teste (Senha: 123456):</strong></p>
        <ul>
          <li>Admin: admin@conectapet.org</li>
          <li>Doador: raquel@email.com</li>
          <li>ONG: contato@patasamigas.org</li>
        </ul>
      </div>
    </section>
  </main>

  <script src="js/main.js"></script>
  <script>
    document.getElementById('form-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      const msgErro = document.getElementById('mensagem-erro');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        const data = await res.json();

        if (!res.ok) {
          msgErro.innerText = data.erro || 'Erro ao realizar login.';
          msgErro.style.display = 'block';
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.href = 'dashboard.html';
      } catch (err) {
        msgErro.innerText = 'Erro de conexão com o servidor.';
        msgErro.style.display = 'block';
      }
    });
  </script>
</body>
</html>`,

  // 2. CADASTRO
  'frontend/cadastro.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro - ConectaPet</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <a href="index.html" class="logo">🐾 ConectaPet</a>
      <ul class="nav-links">
        <li><a href="index.html">Início</a></li>
        <li><a href="login.html" class="btn btn-outline">Entrar</a></li>
      </ul>
    </nav>
  </header>

  <main style="max-width: 500px;">
    <section class="card" style="margin-top: 2rem;">
      <h2 style="color: var(--primary-color); text-align: center; margin-bottom: 1.5rem;">Crie sua Conta</h2>
      
      <div id="msg" style="display: none; padding: 0.8rem; border-radius: var(--radius); margin-bottom: 1rem; font-size: 0.9rem;"></div>

      <form id="form-cadastro">
        <div style="margin-bottom: 1rem;">
          <label for="nome" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Nome Completo / Nome da ONG</label>
          <input type="text" id="nome" required placeholder="Digite seu nome" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        </div>

        <div style="margin-bottom: 1rem;">
          <label for="email" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">E-mail</label>
          <input type="email" id="email" required placeholder="seuemail@exemplo.com" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        </div>

        <div style="margin-bottom: 1rem;">
          <label for="senha" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Senha</label>
          <input type="password" id="senha" required minlength="6" placeholder="Mínimo 6 caracteres" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label for="tipo_usuario" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Perfil de Acesso</label>
          <select id="tipo_usuario" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
            <option value="DOADOR">Doador / Apoiador</option>
            <option value="ONG">Instituição / ONG de Proteção Animal</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Finalizar Cadastro</button>
      </form>
    </section>
  </main>

  <script src="js/main.js"></script>
  <script>
    document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome').value;
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      const tipo_usuario = document.getElementById('tipo_usuario').value;
      const msg = document.getElementById('msg');

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, senha, tipo_usuario })
        });

        const data = await res.json();

        if (!res.ok) {
          msg.style.backgroundColor = '#fed7d7';
          msg.style.color = '#9b2c2c';
          msg.innerText = data.erro || 'Erro ao cadastrar.';
          msg.style.display = 'block';
          return;
        }

        msg.style.backgroundColor = '#c6f6d5';
        msg.style.color = '#22543d';
        msg.innerText = 'Cadastro realizado com sucesso! Redirecionando...';
        msg.style.display = 'block';

        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      } catch (err) {
        msg.style.backgroundColor = '#fed7d7';
        msg.style.color = '#9b2c2c';
        msg.innerText = 'Erro de conexão com o servidor.';
        msg.style.display = 'block';
      }
    });
  </script>
</body>
</html>`,

  // 3. ONGS
  'frontend/ongs.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ONGs Cadastradas - ConectaPet</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <a href="index.html" class="logo">🐾 ConectaPet</a>
      <ul class="nav-links">
        <li><a href="index.html">Início</a></li>
        <li><a href="ongs.html">ONGs</a></li>
        <li><a href="campanhas.html">Campanhas</a></li>
        <li id="nav-auth"><a href="login.html" class="btn btn-outline">Entrar</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <h2>Instituições e ONGs de Proteção Animal</h2>
    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Instituições com selo de verificação ativado na plataforma.</p>

    <div class="card" style="margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <input type="text" id="filtro-busca" placeholder="Buscar por nome ou palavra-chave..." style="flex: 2; min-width: 200px; padding: 0.6rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        <input type="text" id="filtro-cidade" placeholder="Filtrar por cidade..." style="flex: 1; min-width: 150px; padding: 0.6rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        <button onclick="buscarOngs()" class="btn btn-primary">Pesquisar</button>
      </div>
    </div>

    <div id="lista-ongs" class="grid-cards">
      <p>Buscando instituições...</p>
    </div>
  </main>

  <script src="js/main.js"></script>
  <script>
    async function buscarOngs() {
      const busca = document.getElementById('filtro-busca').value;
      const cidade = document.getElementById('filtro-cidade').value;
      const container = document.getElementById('lista-ongs');

      try {
        const url = new URL('/api/ongs', window.location.origin);
        if (busca) url.searchParams.append('busca', busca);
        if (cidade) url.searchParams.append('cidade', cidade);

        const res = await fetch(url);
        const ongs = await res.json();

        if (ongs.length === 0) {
          container.innerHTML = '<p>Nenhuma ONG encontrada com esses critérios.</p>';
          return;
        }

        container.innerHTML = ongs.map(ong => \`
          <article class="card">
            <div>
              <span class="badge badge-verified">✓ \${ong.status_verificacao}</span>
              <h3 style="margin: 0.5rem 0; color: var(--primary-color);">\${ong.nome}</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem;">📍 \${ong.cidade} - \${ong.estado} | CNPJ: \${ong.cnpj}</p>
              <p style="margin-top: 0.8rem;">\${ong.descricao || 'Sem descrição cadastrada.'}</p>
              <p style="margin-top: 0.5rem; font-size: 0.9rem;">📞 <strong>Contato:</strong> \${ong.telefone || 'Não informado'}</p>
            </div>
            <div style="margin-top: 1.5rem;">
              <a href="doacao.html?ong=\${ong.id}" class="btn btn-secondary" style="width: 100%; text-align: center;">Fazer Doação</a>
            </div>
          </article>
        \`).join('');
      } catch (err) {
        container.innerHTML = '<p>Erro ao buscar ONGs no servidor.</p>';
      }
    }

    document.addEventListener('DOMContentLoaded', buscarOngs);
  </script>
</body>
</html>`,

  // 4. DOAÇÃO SIMULADA
  'frontend/doacao.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Realizar Doação - ConectaPet</title>
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

  <main style="max-width: 550px;">
    <section class="card" style="margin-top: 2rem;">
      <h2 style="color: var(--primary-color); text-align: center; margin-bottom: 1rem;">Registrar Doação Simulada</h2>
      <p style="text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
        Demonstração acadêmica. Nenhuma cobrança real será efetuada.
      </p>

      <div id="msg-doacao" style="display: none; padding: 0.8rem; border-radius: var(--radius); margin-bottom: 1rem; font-size: 0.9rem;"></div>

      <form id="form-doacao">
        <div style="margin-bottom: 1rem;">
          <label for="tipo_doacao" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Tipo de Ajuda</label>
          <select id="tipo_doacao" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
            <option value="Financeira">Doação Financeira (PIX Simulada)</option>
            <option value="Ração">Ração / Alimento</option>
            <option value="Medicamentos">Medicamentos</option>
            <option value="Produtos de Higiene">Produtos de Higiene</option>
            <option value="Outros">Outros Materiais</option>
          </select>
        </div>

        <div style="margin-bottom: 1rem;">
          <label for="valor" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Valor da Doação (R$)</label>
          <input type="number" id="valor" min="1" step="0.50" value="50.00" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);">
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label for="descricao" style="display: block; font-weight: 600; margin-bottom: 0.4rem;">Observação para a ONG</label>
          <textarea id="descricao" rows="3" placeholder="Mensagem ou informações de entrega..." style="width: 100%; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius);"></textarea>
        </div>

        <button type="submit" class="btn btn-secondary" style="width: 100%;">Confirmar Doação Simulada</button>
      </form>
    </section>
  </main>

  <script src="js/main.js"></script>
  <script>
    const params = new URLSearchParams(window.location.search);
    const ongId = params.get('ong') || 1;
    const campanhaId = params.get('campanha') || null;

    document.getElementById('form-doacao').addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const msg = document.getElementById('msg-doacao');

      if (!token) {
        alert('Faça login para registrar sua doação.');
        window.location.href = 'login.html';
        return;
      }

      const tipo = document.getElementById('tipo_doacao').value;
      const valor = parseFloat(document.getElementById('valor').value) || 0;
      const descricao = document.getElementById('descricao').value;

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
          msg.innerText = data.erro || 'Erro ao registrar doação.';
          msg.style.display = 'block';
          return;
        }

        msg.style.backgroundColor = '#c6f6d5';
        msg.style.color = '#22543d';
        msg.innerText = data.mensagem;
        msg.style.display = 'block';

        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1800);
      } catch (err) {
        msg.style.backgroundColor = '#fed7d7';
        msg.style.color = '#9b2c2c';
        msg.innerText = 'Erro na comunicação com o servidor.';
        msg.style.display = 'block';
      }
    });
  </script>
</body>
</html>`
};

Object.entries(arquivos).forEach(([filePath, content]) => {
  const fullPath = path.resolve(__dirname, filePath);
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Arquivo atualizado: ${filePath}`);
});

console.log('\n✨ Todas as páginas do frontend foram atualizadas!');