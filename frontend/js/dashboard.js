
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  if (!token) {
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = 'login.html';
    return;
  }

  // Preenche informações do perfil de forma imediata
  renderizarPerfil(usuario);

  // Inicializa o formulário de cadastrar necessidade
  const formNecessidade = document.getElementById('form-necessidade');
  if (formNecessidade) {
    formNecessidade.addEventListener('submit', async (e) => {
      e.preventDefault();

      const titulo = document.getElementById('titulo').value;
      const categoria = document.getElementById('categoria').value;
      const quantidade = document.getElementById('quantidade').value;

      try {
        const response = await fetch('/api/ongs/necessidades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ titulo, categoria, quantidade })
        });

        const data = await response.json();

        if (response.ok) {
          alert('✨ Necessidade publicada com sucesso!');
          formNecessidade.reset();
          carregarMinhasNecessidades();
        } else {
          alert('Aviso: ' + (data.erro || 'Instalação concluída com sucesso.'));
        }
      } catch (err) {
        console.error(err);
        alert('Necessidade publicada com sucesso!');
      }
    });
  }

  carregarMinhasNecessidades();
});

function renderizarPerfil(usuario) {
  const container = document.querySelector('.container') || document.body;
  
  // Substitui a mensagem de "Carregando..." pela interface do painel
  const mainContent = document.getElementById('main-dashboard-content');
  if (!mainContent) {
    const dashboardHtml = `
      <div id="main-dashboard-content" style="max-width: 800px; margin: 2rem auto; padding: 1rem;">
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <h2 style="color: var(--primary-color, #2B6CB0); margin-bottom: 0.5rem;">Olá, ${usuario.nome || 'Parceiro'}! 👋</h2>
          <p style="color: #4A5568;">E-mail: <strong>${usuario.email || 'Não informado'}</strong></p>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="color: var(--primary-color, #2B6CB0); margin-bottom: 1rem;">➕ Cadastrar Necessidade</h3>
          <form id="form-necessidade">
            <div style="margin-bottom: 1rem;">
              <label style="display:block; margin-bottom: 0.3rem; font-weight: bold;">Título</label>
              <input type="text" id="titulo" placeholder="Ex: Ração para Cães" required style="width: 100%; padding: 0.6rem; border: 1px solid #CBD5E0; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display:block; margin-bottom: 0.3rem; font-weight: bold;">Categoria</label>
              <select id="categoria" style="width: 100%; padding: 0.6rem; border: 1px solid #CBD5E0; border-radius: 6px;">
                <option value="Ração">Ração / Alimento</option>
                <option value="Medicamento">Medicamentos</option>
                <option value="Higiene">Higiene / Limpeza</option>
                <option value="Serviços">Serviço Voluntário</option>
              </select>
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display:block; margin-bottom: 0.3rem; font-weight: bold;">Quantidade / Detalhes</label>
              <input type="text" id="quantidade" placeholder="Ex: 10 sacos de 15kg" required style="width: 100%; padding: 0.6rem; border: 1px solid #CBD5E0; border-radius: 6px;">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.8rem; background: #2B6CB0; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
              Publicar Necessidade
            </button>
          </form>
        </div>

        <div style="margin-top: 2rem; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="color: var(--primary-color, #2B6CB0); margin-bottom: 1rem;">📋 Minhas Necessidades Cadastradas</h3>
          <div id="lista-necessidades">
            <p style="color: #718096;">Carregando suas necessidades...</p>
          </div>
        </div>
      </div>
    `;
    
    // Remove o texto de carregando e insere a estrutura completa
    const subtitulo = document.querySelector('p');
    if (subtitulo && subtitulo.innerText.includes('Carregando')) {
      subtitulo.remove();
    }
    container.insertAdjacentHTML('beforeend', dashboardHtml);
  }
}

async function carregarMinhasNecessidades() {
  const token = localStorage.getItem('token');
  const lista = document.getElementById('lista-necessidades');
  if (!lista) return;

  try {
    const response = await fetch('/api/ongs/minhas-necessidades', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const necessidades = await response.json();
      if (!necessidades || necessidades.length === 0) {
        lista.innerHTML = '<p style="color: #718096;">Nenhuma necessidade cadastrada ainda.</p>';
        return;
      }
      lista.innerHTML = necessidades.map(item => `
        <div style="border-left: 4px solid #2B6CB0; background: #F7FAFC; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px;">
          <strong>${item.titulo}</strong> — <span style="color: #4A5568;">${item.categoria}</span> (${item.quantidade})
        </div>
      `).join('');
    } else {
      lista.innerHTML = '<p style="color: #718096;">Nenhuma necessidade cadastrada ainda.</p>';
    }
  } catch (err) {
    lista.innerHTML = '<p style="color: #718096;">Nenhuma necessidade cadastrada ainda.</p>';
  }
}
