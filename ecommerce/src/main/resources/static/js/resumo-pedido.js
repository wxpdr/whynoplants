(() => {
  const $ = (s) => document.querySelector(s);
  const API_BASE = window.API || "http://localhost:8080";
  const money = v => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Chaves de Storage
  const CART_KEY = 'wnplants_cart';
  const FRETE_KEY = 'wnplants_frete';
  
  // Variáveis de Estado
  let USER_ID = null;
  let ENDERECO_OBJ = null; 
  let ENDERECO_ID = sessionStorage.getItem('temp_endereco_id');
  let FORMA_PAGTO = sessionStorage.getItem('temp_forma_pagamento');

  // --- Recupera dados e Helpers ---
  function getItens() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  }
  function getFrete() {
    try { return JSON.parse(localStorage.getItem(FRETE_KEY) || 'null'); } catch { return null; }
  }
  async function api(path, opts = {}) {
    const r = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...opts });
    const text = await r.text();
    if (!r.ok) throw new Error(text || 'Erro na requisição');
    const ct = r.headers.get('content-type') || '';
    return ct.includes('json') ? JSON.parse(text || 'null') : text;
  }

  // --- Renderização ---
  async function renderPage() {
    const itens = getItens();
    const frete = getFrete();

    if (!itens.length || !frete || !ENDERECO_ID || !FORMA_PAGTO) {
      alert("Dados do pedido incompletos. Retornando ao carrinho.");
      location.href = "carrinho.html";
      return;
    }
    
    // Busca Endereço
    try {
      const listaEnderecos = await api(`/clientes/${USER_ID}/enderecos?tipo=ENTREGA`);
      const arr = Array.isArray(listaEnderecos) ? listaEnderecos : (listaEnderecos.content || []);
      ENDERECO_OBJ = arr.find(e => String(e.id) === String(ENDERECO_ID));
      if (!ENDERECO_OBJ) throw new Error("Endereço não encontrado.");

      // Renderiza Endereço
      $('#review-endereco').innerHTML = `
        <strong>${ENDERECO_OBJ.logradouro}, ${ENDERECO_OBJ.numero} ${ENDERECO_OBJ.complemento ? '- ' + ENDERECO_OBJ.complemento : ''}</strong>
        <span>${ENDERECO_OBJ.bairro} - ${ENDERECO_OBJ.cidade}/${ENDERECO_OBJ.uf}</span><br>
        <span>CEP: ${ENDERECO_OBJ.cep}</span>
      `;

    } catch (e) {
      console.error(e);
      alert("Erro ao recuperar endereço. Retornando.");
      location.href = "pagamento.html";
      return;
    }

    // Renderiza Pagamento e Totais
    const labelPagto = { 'PIX': 'Pix', 'CARTAO': 'Cartão de Crédito', 'BOLETO': 'Boleto Bancário' }[FORMA_PAGTO] || FORMA_PAGTO;
    $('#review-pagamento').innerHTML = `<strong>${labelPagto}</strong>`;

    const boxItens = $('#lista-itens');
    boxItens.innerHTML = '';
    let subtotal = 0;

    itens.forEach(i => {
      const totalItem = Number(i.valor || 0) * Number(i.quantidade || 0);
      subtotal += totalItem;
      const div = document.createElement('div');
      div.className = 'item-row';
      div.innerHTML = `
        <div>
          <div class="item-name">${i.nome}</div>
          <div class="item-qtd">${i.quantidade}un. x ${money(i.valor)}</div>
        </div>
        <div class="item-total">${money(totalItem)}</div>
      `;
      boxItens.appendChild(div);
    });

    const totalFinal = subtotal + Number(frete.valor || 0);
    $('#subtotal').textContent = money(subtotal);
    $('#frete-nome').textContent = `(${frete.nome})`;
    $('#frete-valor').textContent = money(frete.valor);
    $('#total').textContent = money(totalFinal);
  }

  // --- Lógica de Envio (Confirmar Compra) ---
  $('#btnConfirmarCompra')?.addEventListener('click', async () => {
    const itens = getItens();
    const frete = getFrete();

    // 1. Monta payload com STATUS CORRIGIDO
    const payload = {
      itens: itens.map(i => ({
        produtoId: i.id,
        quantidade: i.quantidade
      })),
      freteOpcao: frete.nome,
      freteValor: frete.valor,
      formaPagamento: FORMA_PAGTO,
      enderecoId: Number(ENDERECO_ID),
      // CORREÇÃO CRÍTICA: Define o status inicial no Front-end
      status: "AGUARDANDO_PAGAMENTO" 
    };

    $('#loading-overlay').classList.remove('hidden');

    try {
      // 2. POST REAL PARA O BACKEND
      const res = await api('/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // SUCESSO!
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(FRETE_KEY);
      sessionStorage.removeItem('temp_endereco_id');
      sessionStorage.removeItem('temp_forma_pagamento');

      // 3. Redireciona para detalhes (Sucesso)
      setTimeout(() => {
        // Redireciona para a página de detalhes/confirmação
        window.location.href = `pedido-detalhes.html?id=${res.id}`;
      }, 500);

    } catch (e) {
      // ERRO
      $('#loading-overlay').classList.add('hidden');
      console.error(e);
      alert("Erro ao processar pedido: " + e.message);
    }
  });

  // --- BOOT ---
  (async function init() {
    try {
      const who = await api('/whoami');
      USER_ID = who.id;
      
      if (who.perfil !== 'Cliente') {
        alert("Acesso restrito a clientes.");
        location.href = "index.html";
        return;
      }

      await renderPage();

    } catch (e) {
      alert("Sessão expirada. Faça login novamente.");
      location.href = "login.html";
    }
  })();

})();