(async () => {
  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  function money(v){
    return Number(v || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  }

  async function api(path, opts={}){
    const r = await fetch(`${API}${path}`, { credentials:'include', ...opts });
    if (!r.ok) throw new Error(await r.text());
    const ct = r.headers.get('content-type') || '';
    return ct.includes('json') ? r.json() : r.text();
  }

  // 1) Checa perfil (apenas Admin / Estoquista)
  let who;
  try {
    who = await api('/whoami');
  } catch (e) {
    console.error(e);
    alert('Sessão expirada. Faça login novamente.');
    location.href = 'login.html';
    return;
  }

  if (!who.perfil || (who.perfil !== 'Administrador' && who.perfil !== 'Estoquista')) {
    alert('Apenas Administradores ou Estoquistas podem ver esta tela.');
    location.href = 'principal.html';
    return;
  }

  // 2) Buscar lista de pedidos
  async function carregarPedidos(){
    const tbody = $('#pedidos-body');
    tbody.innerHTML = `
      <tr><td colspan="5" class="muted">Carregando pedidos...</td></tr>
    `;

    try {
      const lista = await api('/pedidos');

      if (!lista || lista.length === 0) {
        tbody.innerHTML = `
          <tr><td colspan="5" class="muted">Nenhum pedido encontrado.</td></tr>
        `;
        return;
      }

      tbody.innerHTML = '';
      lista.forEach(p => {
        const tr = document.createElement('tr');

        const data = p.dataCriacao
          ? new Date(p.dataCriacao).toLocaleString('pt-BR')
          : '-';

        const total = p.valorTotal != null ? money(p.valorTotal) : 'R$ 0,00';

        tr.innerHTML = `
          <td>#${p.id}</td>
          <td>${data}</td>
          <td>
            <select data-id="${p.id}" class="status-select">
              ${renderOptionsStatus(p.status)}
            </select>
          </td>
          <td>${total}</td>
          <td>
            <button class="btn small" data-ver="${p.id}">Ver detalhes</button>
          </td>
        `;

        tbody.appendChild(tr);
      });

    } catch (e) {
      console.error(e);
      tbody.innerHTML = `
        <tr><td colspan="5" class="muted">Erro ao carregar pedidos.</td></tr>
      `;
    }
  }

  function renderOptionsStatus(statusAtual){
    const statuses = [
      'CARRINHO',
      'AGUARDANDO_PAGAMENTO',
      'PAGO',
      'ENVIADO',
      'ENTREGUE',
      'CANCELADO'
    ];

    return statuses.map(st => `
      <option value="${st}" ${st === statusAtual ? 'selected' : ''}>
        ${labelStatus(st)}
      </option>
    `).join('');
  }

  function labelStatus(st){
    switch (st) {
      case 'CARRINHO':            return 'Carrinho (aberto)';
      case 'AGUARDANDO_PAGAMENTO':return 'Aguardando pagamento';
      case 'PAGO':                return 'Pagamento aprovado';
      case 'ENVIADO':             return 'Enviado';
      case 'ENTREGUE':            return 'Entregue';
      case 'CANCELADO':           return 'Cancelado';
      default:                    return st;
    }
  }

  // 3) Listener para mudança de status
  $('#pedidos-body')?.addEventListener('change', async (e) => {
    const sel = e.target.closest('select.status-select');
    if (!sel) return;

    const id = sel.getAttribute('data-id');
    const novoStatus = sel.value;

    if (!confirm(`Alterar status do pedido #${id} para "${labelStatus(novoStatus)}"?`)) {
      // se cancelar, recarrega a tabela pra restaurar valor
      carregarPedidos();
      return;
    }

    try {
      await api(`/pedidos/${id}/status?status=${encodeURIComponent(novoStatus)}`, {
        method: 'PATCH'
      });
      alert('Status atualizado com sucesso.');
      // recarrega para refletir ordem/status
      carregarPedidos();
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar status do pedido.');
      carregarPedidos();
    }
  });

  // 4) Listener para botão "Ver detalhes"
  $('#pedidos-body')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-ver]');
    if (!btn) return;
    const id = btn.getAttribute('data-ver');
    // Reaproveita a mesma tela de detalhes do cliente
    location.href = `pedido-detalhes.html?id=${id}`;
  });

  // Carrega na inicialização
  carregarPedidos();
})();
