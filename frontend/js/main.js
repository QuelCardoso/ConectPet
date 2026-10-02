// ConectaPet - Lógica Global e Acessibilidade

const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacaoNav();
  configurarAltoContraste();

  if (document.getElementById('stat-ongs')) {
    carregarIndicadoresGerais();
    carregarOngsDestaque();
    carregarCampanhasDestaque();
  }
});

function configurarAltoContraste() {
  const btnContrast = document.getElementById('btn-contrast');
  
  if (localStorage.getItem('altoContraste') === 'ativo') {
    document.body.classList.add('high-contrast');
  }

  if (btnContrast) {
    btnContrast.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('high-contrast');
      
      const ativo = document.body.classList.contains('high-contrast');
      localStorage.setItem('altoContraste', ativo ? 'ativo' : 'desativado');
    });
  }
}

function verificarAutenticacaoNav() {
  const navAuth = document.getElementById('nav-auth');
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  if (token && usuario.nome && navAuth) {
    navAuth.innerHTML = `
      <a href="dashboard.html" class="btn btn-outline" style="margin-right: 0.5rem;">Painel (${usuario.nome.split(' ')[0]})</a>
      <button onclick="fazerLogout()" class="btn btn-outline" style="border-color: var(--danger-color); color: var(--danger-color);">Sair</button>
    `;
  }
}

function fazerLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

async function carregarIndicadoresGerais() {
  try {
    const res = await fetch(`${API_BASE}/ongs`);
    const ongs = await res.json();

    const resCamp = await fetch(`${API_BASE}/ongs/campanhas`);
    const campanhas = await resCamp.json();

    document.getElementById('stat-ongs').innerText = ongs.length || 0;
    document.getElementById('stat-campanhas').innerText = campanhas.length || 0;
    document.getElementById('stat-doacoes').innerText = '12';
  } catch (err) {
    console.error('Erro ao carregar indicadores:', err);
  }
}

async function carregarOngsDestaque() {
  const container = document.getElementById('container-ongs');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/ongs`);
    const ongs = await res.json();

    if (!ongs || ongs.length === 0) {
      container.innerHTML = '<p>Nenhuma ONG verificada disponível no momento.</p>';
      return;
    }

    container.innerHTML = ongs.slice(0, 3).map(ong => `
      <article class="card">
        <div>
          <span class="badge badge-verified">✓ ONG ${ong.status_verificacao}</span>
          <h3 style="margin: 0.5rem 0; color: var(--primary-color);">${ong.nome}</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">📍 ${ong.cidade} - ${ong.estado}</p>
          <p style="margin-top: 0.8rem;">${ong.descricao}</p>
        </div>
        <div style="margin-top: 1.5rem;">
          <a href="doacao.html?ong=${ong.id}" class="btn btn-secondary" style="width: 100%; text-align: center;">Fazer Doação</a>
        </div>
      </article>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p>Erro ao carregar ONGs.</p>';
  }
}

async function carregarCampanhasDestaque() {
  const container = document.getElementById('container-campanhas');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/ongs/campanhas`);
    const campanhas = await res.json();

    if (!campanhas || campanhas.length === 0) {
      container.innerHTML = '<p>Nenhuma campanha ativa no momento.</p>';
      return;
    }

    container.innerHTML = campanhas.slice(0, 3).map(camp => {
      const pct = Math.min(Math.round((camp.valor_arrecadado / camp.meta) * 100), 100);
      return `
        <article class="card">
          <div>
            <h3 style="color: var(--primary-color);">${camp.titulo}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">Por: <strong>${camp.ong_nome}</strong> (${camp.ong_cidade})</p>
            <p>${camp.descricao}</p>
            
            <div style="margin-top: 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: bold;">
                <span>R$ ${camp.valor_arrecadado.toFixed(2)}</span>
                <span>Meta: R$ ${camp.meta.toFixed(2)}</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
              </div>
              <p style="text-align: right; font-size: 0.8rem; color: var(--text-muted);">${pct}% atingido</p>
            </div>
          </div>

          <div style="margin-top: 1.5rem;">
            <a href="doacao.html?campanha=${camp.id}&ong=${camp.ong_id}" class="btn btn-secondary" style="width: 100%; text-align: center;">Ajudar esta Campanha</a>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p>Erro ao carregar campanhas.</p>';
  }
}
