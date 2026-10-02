const fs = require('fs');
const path = require('path');

const arquivos = {
  // 1. Landing Page Completa (index.html)
  'frontend/index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ConectaPet - Conectando Amigos de Quatro Patas</title>
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
        <li><button id="btn-contrast" class="btn btn-outline" style="padding: 0.3rem 0.6rem;">👁️ Contraste</button></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h1>Aponte o amor na direção certa.</h1>
      <p>Conectamos você diretamente a ONGs de proteção animal verificadas e transparentes. Escolha como e quem ajudar hoje!</p>
      <div class="hero-buttons">
        <a href="ongs.html" class="btn btn-primary" style="background-color: #ffffff; color: var(--primary-color);">Quero Ajudar</a>
        <a href="cadastro.html" class="btn btn-outline" style="border-color: #ffffff; color: #ffffff;">Sou uma ONG</a>
      </div>
    </section>

    <section>
      <h2 style="margin-bottom: 1rem;">Nosso Impacto em Números</h2>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-number" id="stat-ongs">0</div><p>ONGs Verificadas</p></div>
        <div class="stat-card"><div class="stat-number" id="stat-doacoes">0</div><p>Doações Realizadas</p></div>
        <div class="stat-card"><div class="stat-number">150+</div><p>Animais Beneficiados</p></div>
        <div class="stat-card"><div class="stat-number" id="stat-campanhas">0</div><p>Campanhas Ativas</p></div>
      </div>
    </section>

    <section style="margin-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>ONGs em Destaque</h2>
        <a href="ongs.html" style="color: var(--primary-color); font-weight: bold;">Ver todas →</a>
      </div>
      <div id="container-ongs" class="grid-cards"><p>Carregando ONGs...</p></div>
    </section>

    <section style="margin-top: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>Campanhas Ativas</h2>
        <a href="campanhas.html" style="color: var(--primary-color); font-weight: bold;">Ver todas →</a>
      </div>
      <div id="container-campanhas" class="grid-cards"><p>Carregando campanhas...</p></div>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 ConectaPet - Plataforma Acadêmica de Proteção Animal.</p>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>`,

  // 2. Página de Campanhas (campanhas.html)
  'frontend/campanhas.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campanhas Ativas - ConectaPet</title>
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
    <h2>Campanhas de Arrecadação Ativas</h2>
    <p style="color: var(--text-muted); margin-bottom: 2rem;">Apoie metas específicas para reformas, tratamentos e castrações gerenciadas pelas ONGs.</p>
    <div id="lista-campanhas" class="grid-cards"><p>Carregando campanhas em andamento...</p></div>
  </main>

  <script src="js/main.js"></script>
  <script>
    async function carregarCampanhasPagina() {
      const container = document.getElementById('lista-campanhas');
      try {
        const res = await fetch('/api/ongs/campanhas');
        const campanhas = await res.json();
        if (campanhas.length === 0) {
          container.innerHTML = '<p>Nenhuma campanha ativa no momento.</p>';
          return;
        }
        container.innerHTML = campanhas.map(camp => {
          const pct = Math.min(Math.round((camp.valor_arrecadado / camp.meta) * 100), 100);
          return \`
            <article class="card">
              <div>
                <span class="badge badge-verified">Campanha Ativa</span>
                <h3 style="color: var(--primary-color); margin: 0.5rem 0;">\${camp.titulo}</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.8rem;">Por: <strong>\${camp.ong_nome}</strong> (\${camp.ong_cidade})</p>
                <p>\${camp.descricao}</p>
                <div style="margin-top: 1.2rem;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9rem;">
                    <span>R$ \${camp.valor_arrecadado.toFixed(2)}</span>
                    <span>Meta: R$ \${camp.meta.toFixed(2)}</span>
                  </div>
                  <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: \${pct}%;"></div></div>
                  <p style="text-align: right; font-size: 0.8rem; color: var(--text-muted);">\${pct}% arrecadado</p>
                </div>
              </div>
              <div style="margin-top: 1.5rem;">
                <a href="doacao.html?campanha=\${camp.id}&ong=\${camp.ong_id}" class="btn btn-secondary" style="width: 100%; text-align: center;">Apoiar esta Campanha</a>
              </div>
            </article>
          \`;
        }).join('');
      } catch (err) {
        container.innerHTML = '<p>Erro ao carregar campanhas do servidor.</p>';
      }
    }
    document.addEventListener('DOMContentLoaded', carregarCampanhasPagina);
  </script>
</body>
</html>`
};

Object.entries(arquivos).forEach(([filePath, content]) => {
  const fullPath = path.resolve(__dirname, filePath);
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Arquivo atualizado: ${filePath}`);
});

console.log('\n✨ Frontend atualizado com sucesso!');