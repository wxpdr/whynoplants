(() => {
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  const CART_KEY  = 'wnplants_cart';
  const FRETE_KEY = 'wnplants_frete';
  const money = v => Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  function readCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  }

  function readFrete(){
    try { return JSON.parse(localStorage.getItem(FRETE_KEY) || 'null'); }
    catch { return null; }
  }

  function updateBadge(){
    const b = $('#cartCount');
    if (!b) return;
    const itens = readCart();
    const totalQtd = itens.reduce((s,i)=>s+Number(i.quantidade||0),0);
    b.textContent = totalQtd || '';
  }

  async function api(path, opts={}){
    const r = await fetch(path, { credentials:'include', ...opts });
    const text = await r.text();
    if (!r.ok) {
      // devolve SEMPRE a mensagem que veio do back (ex: "Estoque insuficiente para o produto: X")
      throw new Error(text || 'Erro na requisição');
    }
    const ct = r.headers.get('content-type') || '';
    return ct.includes('json') ? JSON.parse(text || 'null') : text;
  }

  // ---------- Helpers de “carregando pagamento” ----------
  function showPaymentLoading() {
    const el = document.getElementById('payment-loading');
    if (el) el.classList.remove('hidden');
  }

  function hidePaymentLoading() {
    const el = document.getElementById('payment-loading');
    if (el) el.classList.add('hidden');
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ---------- Tratamento amigável de erros ----------
  function formatApiError(msg) {
    if (!msg) return 'Não foi possível finalizar o pedido. Tente novamente.';

    msg = String(msg).trim();

    const lower = msg.toLowerCase();

    if (lower.includes('estoque insuficiente')) {
      return msg; // já vem boa: "Estoque insuficiente para o produto: X"
    }
    if (lower.includes('usuário não autenticado') || lower.includes('usuario nao autenticado')) {
      return 'Você precisa estar logado como CLIENTE para finalizar o pedido.';
    }
    if (lower.includes('carrinho vazio')) {
      return 'Seu carrinho está vazio. Volte e adicione produtos antes de finalizar.';
    }
    if (lower.includes('endereço de entrega é obrigatório') || lower.includes('endereco de entrega e obrigatorio')) {
      return 'Selecione um endereço de entrega válido antes de finalizar.';
    }

    // fallback: mostra a mensagem original do back
    return msg;
  }

  // ---------- Geração "fake" de código Pix com valor ----------
  function gerarCodigoPix(total){
    const cents = Math.round(Number(total||0) * 100);
    const rand  = Math.random().toString(36).substring(2,10).toUpperCase();
    // Não segue o padrão EMV real, mas simula um código de "cópia e cola" com valor embutido
    return `PIX|WNPLANTS|VL=${cents}|ID=${Date.now()}${rand}`;
  }

  // ---------- Geração "fake" de linha digitável de boleto ----------
  function gerarLinhaDigitavel(total){
    const cents = Math.round(Number(total||0) * 100).toString().padStart(11,'0');
    // Simulação de linha digitável (apenas acadêmico)
    return `34191.79001 01043.510047 91020.150008 1 ${cents}`;
  }

  // ---------- Render dos itens do pedido ----------
  function renderItens(itens){
    const box = $('#itensResumo');
    if (!box) return;
    if (!itens.length){
      box.innerHTML = '<div class="muted">Nenhum item encontrado no carrinho.</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    itens.forEach(i => {
      const linha = document.createElement('div');
      linha.className = 'item-row';
      const totalItem = Number(i.valor||0) * Number(i.quantidade||0);
      linha.innerHTML = `
        <div class="item-nome">${i.nome}</div>
        <div class="item-qtd">Qtd: ${i.quantidade}</div>
        <div class="item-preco">${money(i.valor)}</div>
        <div class="item-total">${money(totalItem)}</div>
      `;
      frag.appendChild(linha);
    });
    box.innerHTML = '';
    box.appendChild(frag);
  }

  // ---------- Resumo (subtotal / frete / total + códigos) ----------
  function renderResumo(){
    const itens = readCart();
    const frete = readFrete();

    if (!itens.length || !frete) {
      alert('Seu carrinho ou frete não foram encontrados. Voltando para o carrinho.');
      location.href = 'carrinho.html';
      return;
    }

    const subtotal = itens.reduce((s,i)=> s + Number(i.valor||0)*Number(i.quantidade||0), 0);
    const total = subtotal + Number(frete.valor || 0);

    $('#subtotal').textContent = money(subtotal);
    $('#frete').textContent    = money(frete.valor || 0);
    $('#freteInfo').textContent = frete.nome ? ` (${frete.nome} — ${frete.prazo || ''})` : '';
    $('#total').textContent    = money(total);

    renderItens(itens);

    // Atualiza códigos simulados de pagamento
    const pixArea = $('#pix-codigo');
    if (pixArea) pixArea.value = gerarCodigoPix(total);

    const bolArea = $('#boleto-linha');
    if (bolArea) bolArea.value = gerarLinhaDigitavel(total);
  }

  function mapFormaLabel(v){
    switch(v){
      case 'PIX':    return 'Pix';
      case 'CARTAO': return 'Cartão de crédito';
      case 'BOLETO': return 'Boleto bancário';
      default:       return v || '-';
    }
  }

  // ---------- Alterna campos conforme forma de pagamento ----------
  function toggleCamposPagamento(){
    const forma = document.querySelector('input[name="formaPagamento"]:checked')?.value || 'PIX';

    $('#campos-pix')?.classList.add('hidden');
    $('#campos-cartao')?.classList.add('hidden');
    $('#campos-boleto')?.classList.add('hidden');

    if (forma === 'PIX')    $('#campos-pix')?.classList.remove('hidden');
    if (forma === 'CARTAO') $('#campos-cartao')?.classList.remove('hidden');
    if (forma === 'BOLETO') $('#campos-boleto')?.classList.remove('hidden');

    const spanFp = $('#resumoFormaPagamento');
    if (spanFp) spanFp.textContent = mapFormaLabel(forma);
  }

  // ---------- Finalizar pedido (chama /pedidos) ----------
  async function finalizarPedido(){
    const itens = readCart();
    const frete = readFrete();

    if (!itens.length) {
      alert('Seu carrinho está vazio. Voltando para o carrinho.');
      location.href = 'carrinho.html';
      return;
    }
    if (!frete) {
      alert('Frete não encontrado. Volte ao carrinho para recalcular.');
      location.href = 'carrinho.html';
      return;
    }

    const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked')?.value;
    if (!formaPagamento){
      alert('Escolha uma forma de pagamento.');
      return;
    }

    // Regras extras:
    if (formaPagamento === 'CARTAO') {
      const num = $('#cartao-numero')?.value.trim();
      const val = $('#cartao-validade')?.value.trim();
      const cvc = $('#cartao-cvc')?.value.trim();
      if (!num || !val || !cvc){
        alert('Preencha todos os campos do cartão de crédito antes de finalizar.');
        return;
      }
    }

    if (formaPagamento === 'BOLETO') {
      const emailBol = $('#boleto-email')?.value.trim();
      if (!emailBol){
        alert('Informe o e-mail para envio do boleto.');
        return;
      }
    }

    const payload = {
      itens: itens.map(i => ({
        produtoId: i.id,
        quantidade: i.quantidade
      })),
      freteOpcao: frete.nome || frete.id,
      freteValor: frete.valor,
      formaPagamento
    };

    showPaymentLoading();

    try {
      const resumo = await api('/pedidos', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });

      // teatrinho de gateway de pagamento
      await delay(1500);

      // Sucesso → agora sim apaga carrinho/frete
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(FRETE_KEY);

      alert(`Pagamento aprovado! ✅\n\nPedido #${resumo.id} criado com sucesso.\nTotal: ${money(resumo.valorTotal)}`);
      location.href = `pedido-detalhes.html?id=${resumo.id}`;
    } catch (e) {
      console.error(e);
      const msg = formatApiError(e.message);
      alert(msg);
    } finally {
      hidePaymentLoading();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateBadge();
    renderResumo();
    toggleCamposPagamento();

    document.querySelectorAll('input[name="formaPagamento"]').forEach(radio => {
      radio.addEventListener('change', toggleCamposPagamento);
    });

    $('#btnVoltar')?.addEventListener('click', () => {
      // Volta sem limpar carrinho
      location.href = 'carrinho.html';
    });

    $('#btnFinalizar')?.addEventListener('click', finalizarPedido);
  });
})();
