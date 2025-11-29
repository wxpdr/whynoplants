(() => {
  const $ = s => document.querySelector(s);

  async function api(path, opts = {}) {
    const r = await fetch(path, { credentials: 'include', ...opts });
    if (!r.ok) throw new Error(await r.text());
    const ct = r.headers.get('content-type') || '';
    return ct.includes('json') ? r.json() : r.text();
  }

  function getPedidoId() {
    const p = new URLSearchParams(location.search);
    return p.get('id');
  }

  function money(v) {
    return Number(v || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function labelStatus(st) {
    switch (st) {
      case 'CARRINHO':             return 'Carrinho aberto';
      case 'AGUARDANDO_PAGAMENTO': return 'Aguardando pagamento';
      case 'PAGO':                 return 'Pagamento aprovado';
      case 'ENVIADO':              return 'Enviado';
      case 'ENTREGUE':             return 'Entregue';
      case 'CANCELADO':            return 'Cancelado';
      default:                     return st || '-';
    }
  }

  function labelFormaPagamento(fp) {
    switch (fp) {
      case 'PIX':    return 'Pix';
      case 'CARTAO': return 'Cartão de crédito';
      case 'BOLETO': return 'Boleto bancário';
      default:       return fp || '-';
    }
  }

  // ---------- monta HTML da linha do tempo com base no status ----------
  function buildStatusTimeline(status) {
    const container = document.createElement('div');
    container.className = 'status-timeline';

    if (status === 'CANCELADO') {
      container.innerHTML = `
        <div class="status-step status-cancelado">
          <div class="status-dot"></div>
          <div class="status-label">Cancelado</div>
        </div>
      `;
      return container;
    }

    const steps = [
      { code: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando pagamento' },
      { code: 'PAGO',                 label: 'Pagamento aprovado' },
      { code: 'ENVIADO',              label: 'Enviado' },
      { code: 'ENTREGUE',             label: 'Entregue' }
    ];

    let reachedIndex = steps.findIndex(s => s.code === status);
    if (reachedIndex === -1) {
      reachedIndex = -1;
    }

    steps.forEach((step, index) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'status-step';

      if (reachedIndex > index) {
        stepDiv.classList.add('done');
      } else if (reachedIndex === index) {
        stepDiv.classList.add('current');
      }

      stepDiv.innerHTML = `
        <div class="status-dot"></div>
        <div class="status-label">${step.label}</div>
      `;

      container.appendChild(stepDiv);
    });

    return container;
  }

  function renderPedido(dto) {
    const resumoBox = $('#pedido-resumo');
    const itensBox  = $('#pedido-itens');

    if (!dto) {
      resumoBox.textContent = 'Pedido não encontrado.';
      if (itensBox) itensBox.textContent = '';
      return;
    }

    const data = dto.dataCriacao
      ? new Date(dto.dataCriacao).toLocaleString('pt-BR')
      : '-';

    const total      = dto.valorTotal  != null ? money(dto.valorTotal)  : 'R$ 0,00';
    const valorItens = dto.valorItens  != null ? money(dto.valorItens)  : 'R$ 0,00';
    const freteValor = dto.freteValor != null ? money(dto.freteValor) : 'R$ 0,00';
    const status     = dto.status || 'AGUARDANDO_PAGAMENTO';
    const forma      = dto.formaPagamento || null;

    resumoBox.innerHTML = `
      <div class="pedido-resumo-top">
        <div>
          <div><strong>Pedido #${dto.id}</strong></div>
          <div class="muted">${data}</div>
        </div>
        <div class="pedido-resumo-valores">
          <div><b>Produtos:</b> ${valorItens}</div>
          <div><b>Frete:</b> ${freteValor}</div>
          <div><b>Total:</b> ${total}</div>
        </div>
      </div>

      <div class="pedido-resumo-extra">
        <div><b>Status atual:</b> ${labelStatus(status)}</div>
        <div><b>Forma de pagamento:</b> ${labelFormaPagamento(forma)}</div>
        <div><b>Frete:</b> ${dto.freteOpcao || '-'}</div>
      </div>
    `;

    const timeline = buildStatusTimeline(status);
    resumoBox.appendChild(timeline);

    if (itensBox) {
      if (!dto.itens || dto.itens.length === 0) {
        itensBox.textContent = 'Nenhum item encontrado neste pedido.';
      } else {
        itensBox.innerHTML = '';
        dto.itens.forEach(item => {
          const div = document.createElement('div');
          div.className = 'pedido-item-row';
          const sub = Number(item.valorUnitario || 0) * Number(item.quantidade || 0);
          div.innerHTML = `
            <div class="pi-nome">
              <strong>${item.produtoNome}</strong>
              <span class="muted">Qtd: ${item.quantidade}</span>
            </div>
            <div class="pi-valores">
              <span>${money(item.valorUnitario)}</span>
              <span><b>${money(sub)}</b></span>
            </div>
          `;
          itensBox.appendChild(div);
        });
      }
    }
  }

  async function boot() {
    const id = getPedidoId();
    if (!id) {
      $('#pedido-resumo').textContent = 'ID do pedido não informado.';
      return;
    }

    try {
      const dto = await api(`/pedidos/${id}`);
      renderPedido(dto);
    } catch (e) {
      console.error(e);
      $('#pedido-resumo').textContent = 'Erro ao carregar detalhes do pedido.';
      $('#pedido-itens').textContent  = '';
    }

    // 👉 handler do botão Voltar: manda para o cadastro do cliente
    const btnVoltar = $('#btnVoltar');
    if (btnVoltar) {
      btnVoltar.addEventListener('click', (ev) => {
        ev.preventDefault();
        // Se preferir a home, troque para 'index.html'
        window.location.href = 'index.html';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
