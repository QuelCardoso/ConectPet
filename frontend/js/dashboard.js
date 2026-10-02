// Controle das Visões do Dashboard

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  if (!token || !usuario.tipo_usuario) {
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('dash-titulo').innerText = `Olá, ${usuario.nome}!`;
  document.getElementById('dash-subtitulo').innerText = `E-mail: ${usuario.email}`;
  document.getElementById('dash-tipo-badge').innerText = usuario.tipo_usuario;

  if (usuario.tipo_usuario === 'DOADOR') {
    document.getElementById('painel-doador').style.display = 'block';
    carregarDoacoesDoador(token);
  } else if (usuario.tipo_usuario === 'ONG') {
    document.getElementById('painel-ong').style.display = 'block';
    configurarFormulariosOng(token);
  } else if (usuario.tipo_usuario === 'ADMIN') {
    document.getElementById('painel-admin').style.display = 'block';
    carregarOngsAdmin(token);
  }
});

// Carrega Histórico do Doador
async function carregarDoacoesDoador(token) {
  const container = document.getElementById('tabela-doacoes-doador');
  try {
    const res = await fetch('/api/doacoes/minhas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const doacoes = await res.json();

    if (!doacoes || doacoes.length === 0) {
      container.innerHTML = '<p>Você ainda não realizou doações na plataforma.</p>';
      return;
    }

    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border-color);">
            <th style="padding: 0.6rem;">ONG</th>
            <th style="padding: 0.6rem;">Tipo</th>
            <th style="padding: 0.6rem;">Valor</th>
            <th style="padding: 0.6rem;">Data</th>
          </tr>
        </thead>
        <tbody>
          ${doacoes.map(d => `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 0.6rem; font-weight: 600;">${d.ong_nome}</td>
              <td style="padding: 0.6rem;">${d.tipo}</td>
              <td style="padding: 0.6rem; color: var(--success-color); font-weight: bold;">${d.valor > 0 ? 'R$ ' + d.valor.toFixed(2) : 'Materiais'}</td>
              <td style="padding: 0.6rem; font-size: 0.85rem;">${new Date(d.data_doacao).toLocaleDateString('pt-BR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = '<p>Erro ao carregar histórico de doações.</p>';
  }
}

// Configura Envio de Necessidades e Campanhas pela ONG
function configurarFormulariosOng(token) {
  document.getElementById('form-nova-necessidade').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('nec-titulo').value;
    const categoria = document.getElementById('nec-categoria').value;
    const quantidade = parseInt(document.getElementById('nec-quantidade').value);

    const res = await fetch('/api/ongs/necessidades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ titulo, categoria, quantidade, prioridade: 'Alta' })
    });

    if (res.ok) {
      alert('Necessidade cadastrada com sucesso!');
      e.target.reset();
    } else {
      alert('Erro ao cadastrar necessidade.');
    }
  });

  document.getElementById('form-nova-campanha').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('camp-titulo').value;
    const meta = parseFloat(document.getElementById('camp-meta').value);
    const descricao = document.getElementById('camp-desc').value;

    const res = await fetch('/api/ongs/campanhas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo,
        meta,
        descricao,
        data_inicio: '2026-10-01',
        data_fim: '2026-12-31'
      })
    });

    if (res.ok) {
      alert('Campanha lançada com sucesso!');
      e.target.reset();
    } else {
      alert('Erro ao lançar campanha.');
    }
  });
}

// Carrega ONGs no Painel Admin para Aprovação/Verificação
async function carregarOngsAdmin(token) {
  const container = document.getElementById('tabela-ongs-admin');
  try {
    const res = await fetch('/api/admin/ongs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const ongs = await res.json();

    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border-color);">
            <th style="padding: 0.6rem;">ONG</th>
            <th style="padding: 0.6rem;">CNPJ</th>
            <th style="padding: 0.6rem;">Status Atual</th>
            <th style="padding: 0.6rem;">Ação de Verificação</th>
          </tr>
        </thead>
        <tbody>
          ${ongs.map(o => `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 0.6rem; font-weight: 600;">${o.nome}</td>
              <td style="padding: 0.6rem; font-size: 0.85rem;">${o.cnpj}</td>
              <td style="padding: 0.6rem;"><span class="badge badge-verified">${o.status_verificacao}</span></td>
              <td style="padding: 0.6rem;">
                <button onclick="alterarStatusOng(${o.id}, 'Verificada')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Aprovar</button>
                <button onclick="alterarStatusOng(${o.id}, 'Rejeitada')" class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; color: var(--danger-color); border-color: var(--danger-color);">Rejeitar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = '<p>Erro ao carregar lista de ONGs para administração.</p>';
  }
}

async function alterarStatusOng(id, status) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/admin/ongs/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (res.ok) {
    alert(`Status da ONG alterado para ${status}!`);
    carregarOngsAdmin(token);
  }
}