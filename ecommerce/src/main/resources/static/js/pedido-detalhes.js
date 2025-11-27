(() => {
  const $ = s => document.querySelector(s);

  async function api(path, opts={}) {
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
    if (v == null) return 'R$ 0,00';
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async function boot() {
    const id = getPedidoId();
    if (!id) {
      $('#pedido-resumo').textContent = 'Pedido não informado.';
      return;
    }

    try {
      const p = await api(`/pedidos/${id}`);

      $('#pedido-resumo').innerHTML = `
        <div><b>Código:</b> #${p.id}</div>
        <div><b>Data:</b> ${p.dataCriacao ?
            new Date(p.dataCriacao).toLocaleString('pt-BR') : '-'}</div>
        <div><b>Status:</b> ${p.status}</div>
        <div><b>Forma de pagamento:</b> ${p.formaPagamento || '-'}</div>
        <div><b>Frete:</b> ${p.freteOpcao || '-'} — ${money(p.freteValor)}</div>
        <div><b>Itens:</b> ${money(p.valorItens)}</div>
        <div><b>Total:</b> ${money(p.valorTotal)}</div>
      `;

      const box = $('#pedido-itens');
      box.innerHTML = '';

      if (!p.itens || p.itens.length === 0) {
        box.innerHTML = '<div class="muted">Nenhum item encontrado.</div>';
      } else {
        p.itens.forEach(it => {
          const div = document.createElement('div');
          div.className = 'pedido-item';
          div.innerHTML = `
            <div><b>${it.produtoNome}</b></div>
            <div>Qtd: ${it.quantidade}</div>
            <div>Unitário: ${money(it.valorUnitario)}</div>
            <div>Subtotal: ${money(it.valorTotal)}</div>
          `;
          box.appendChild(div);
        });
      }

    } catch (e) {
      console.error(e);
      $('#pedido-resumo').textContent = 'Erro ao carregar detalhes do pedido.';
      $('#pedido-itens').textContent = '';
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
