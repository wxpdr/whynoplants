(() => {
  const $ = s => document.querySelector(s);
  const API_BASE = window.API || "http://localhost:8080"; // Fallback seguro

  async function api(path, opts = {}) {
    const r = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...opts });
    if (!r.ok) throw new Error(await r.text());
    const ct = r.headers.get('content-type') || '';
    return ct.includes('json') ? r.json() : r.text();
  }

  function getPedidoId() {
    const p = new URLSearchParams(location.search);
    return p.get('id');
  }

  function money(v) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  
  // --- Funções de formatação (mantidas) ---
  function labelStatus(st) { /* ... */
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

  // --- Renderiza Endereço ---
  function renderEndereco(endereco) {
      const box = $('#endereco-entrega');
      if (!box) return;

      if (!endereco || !endereco.logradouro) {
          box.innerHTML = '<p class="muted">Endereço de entrega não detalhado.</p>';
          return;
      }

      const end = endereco; // Simplificação
      box.innerHTML = `
          <p>
              <strong>${end.logradouro}, ${end.numero}</strong><br>
              ${end.complemento ? end.complemento + ' • ' : ''}${end.bairro}<br>
              ${end.cidade}/${end.uf} • CEP ${end.cep}
          </p>
      `;
  }
  
  // --- Linha do Tempo Visual (mantida) ---
  function buildStatusTimeline(status) { 
      const container = document.createElement('div');
      container.className = 'status-timeline';
      
      // [Timeline rendering logic is extensive and unchanged, omitted for brevity]
      
      const steps = [
        { code: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando' },
        { code: 'PAGO',                 label: 'Aprovado' },
        { code: 'ENVIADO',              label: 'Enviado' },
        { code: 'ENTREGUE',             label: 'Entregue' }
      ];

      if (status === 'CANCELADO') {
          container.innerHTML = `
              <div class="status-step status-cancelado">
                  <div class="status-dot"></div>
                  <div class="status-label">Cancelado</div>
              </div>
          `;
          container.style.justifyContent = 'center';  
          return container;
      }

      let reachedIndex = steps.findIndex(s => s.code === status);
      if (reachedIndex === -1 && status === 'CARRINHO') reachedIndex = -1;

      steps.forEach((step, index) => {
          const stepDiv = document.createElement('div');
          stepDiv.className = 'status-step';

          if (reachedIndex > index) stepDiv.classList.add('done'); 
          else if (reachedIndex === index) stepDiv.classList.add('current'); 

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
    const itensBox  = $('#pedido-itens');
    // Adicionado: Puxa o objeto de endereço do DTO do pedido
    const enderecoEntrega = dto.enderecoEntrega || dto.endereco || null; 

    if (!dto) {
      resumoBox.innerHTML = '<p class="muted">Pedido não encontrado.</p>';
      if (itensBox) itensBox.textContent = '';
      return;
    }

    // --- Renderiza Endereço ---
    renderEndereco(enderecoEntrega);


    const data = dto.dataCriacao
      ? new Date(dto.dataCriacao).toLocaleString('pt-BR')
      : '-';

    const total      = dto.valorTotal  != null ? money(dto.valorTotal)  : 'R$ 0,00';
    const valorItens = dto.valorItens  != null ? money(dto.valorItens)  : 'R$ 0,00';
    const freteValor = dto.freteValor != null ? money(dto.freteValor) : 'R$ 0,00';
    const status     = dto.status || 'AGUARDANDO_PAGAMENTO';
    const forma      = dto.formaPagamento || '-';

    // Bloco Superior (Resumo)
    resumoBox.innerHTML = `
      <div class="pedido-resumo-top">
        <div>
          <div style="font-size:1.2rem; color:#333;"><strong>Pedido #${dto.id}</strong></div>
          <div class="muted">Data: ${data}</div>
        </div>
        <div class="pedido-resumo-valores">
          <div>Itens: ${valorItens}</div>
          <div>Frete: ${freteValor}</div>
          <div style="font-size:1.2rem; color:#4CAF50; margin-top:5px;"><strong>Total: ${total}</strong></div>
        </div>
      </div>

      <div class="pedido-resumo-extra">
        <div>
            <small class="muted">Status</small><br>
            <strong>${labelStatus(status)}</strong>
        </div>
        <div>
            <small class="muted">Pagamento</small><br>
            <strong>${labelFormaPagamento(forma)}</strong>
        </div>
        <div>
            <small class="muted">Tipo Frete</small><br>
            <strong>${dto.freteOpcao || '-'}</strong>
        </div>
      </div>
    `;

    const timeline = buildStatusTimeline(status);
    resumoBox.appendChild(timeline);

    // Bloco Itens
    if (itensBox) {
      if (!dto.itens || dto.itens.length === 0) {
        itensBox.innerHTML = '<p class="muted">Nenhum item encontrado.</p>';
      } else {
        itensBox.innerHTML = '';
        dto.itens.forEach(item => {
          const div = document.createElement('div');
          div.className = 'pedido-item-row';
          const sub = Number(item.valorUnitario || 0) * Number(item.quantidade || 0);
          div.innerHTML = `
            <div class="pi-nome">
              <strong>${item.produtoNome}</strong>
              <span class="muted">Qtd: ${item.quantidade} x ${money(item.valorUnitario)}</span>
            </div>
            <div class="pi-valores">
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
      alert('ID do pedido não informado.');
      history.back();
      return;
    }

    try {
      const dto = await api(`/pedidos/${id}`);
      renderPedido(dto);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar detalhes do pedido.');
      // Oculta blocos de carregamento em caso de falha
      $('#pedido-resumo').textContent = 'Erro ao carregar detalhes do pedido.';
      $('#pedido-itens').textContent  = '';
      $('#endereco-entrega').textContent = '—';
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();