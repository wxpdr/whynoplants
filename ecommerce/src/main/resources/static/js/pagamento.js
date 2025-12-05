(() => {
  const $  = (s,r=document)=>r.querySelector(s);
  const API_BASE = window.API || "http://localhost:8080";
  
  const CART_KEY  = 'wnplants_cart';
  const FRETE_KEY = 'wnplants_frete';
  const money = v => Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  let USER_ID = null;

  // --- LEITURA LOCALSTORAGE ---
  function readCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); } catch{ return []; } }
  function readFrete(){ try { return JSON.parse(localStorage.getItem(FRETE_KEY)||'null'); } catch{ return null; } }

  // --- API ---
  async function api(path, opts={}){
    const r = await fetch(`${API_BASE}${path}`, { credentials:'include', ...opts });
    const text = await r.text();
    if (!r.ok) throw new Error(text || 'Erro na requisição');
    const ct = r.headers.get('content-type') || '';
    return ct.includes('json') ? JSON.parse(text || 'null') : text;
  }

  // --- RENDERIZADORES ---
  function renderResumo() {
    const itens = readCart();
    const frete = readFrete();
    const box = $('#itensResumo');

    if(!itens.length || !frete) {
        location.href = "carrinho.html";
        return;
    }

    // Itens
    box.innerHTML = '';
    let subtotal = 0;
    itens.forEach(i => {
        const totalItem = Number(i.valor||0) * Number(i.quantidade||0);
        subtotal += totalItem;
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `
            <div>${i.nome} <span class="item-meta">x${i.quantidade}</span></div>
            <div>${money(totalItem)}</div>
        `;
        box.appendChild(div);
    });

    // Totais
    const total = subtotal + Number(frete.valor || 0);
    $('#subtotal').textContent = money(subtotal);
    $('#frete').textContent = money(frete.valor);
    $('#freteInfo').textContent = `(${frete.nome})`;
    $('#total').textContent = money(total);

    // Gera Código PIX Falso (apenas visual)
    const pixInput = $('#pix-codigo');
    if(pixInput) pixInput.value = `00020126580014BR.GOV.BCB.PIX0136WNPLANTS-${total.toFixed(2)}-${Date.now()}`;
  }

  async function carregarEnderecos() {
    const box = $('#listaEnderecos');
    box.innerHTML = '<p class="muted">Buscando endereços...</p>';
    
    try {
        let response = await api(`/clientes/${USER_ID}/enderecos?tipo=ENTREGA`);
        let enderecos = [];
        
        if (Array.isArray(response)) {
            enderecos = response;
        } else if (response.content && Array.isArray(response.content)) {
            enderecos = response.content;
        }

        if(enderecos.length === 0) {
            box.innerHTML = `
                <div style="padding:15px; background:#fff3cd; color:#856404; border-radius:6px; font-size:0.9rem;">
                    Nenhum endereço encontrado. 
                    <a href="cliente-editar.html" target="_blank" style="text-decoration:underline; font-weight:bold;">Cadastre um agora</a>.
                </div>
            `;
            return;
        }

        box.innerHTML = '';
        enderecos.sort((a,b) => (b.padrao===true) - (a.padrao===true));

        enderecos.forEach((end, idx) => {
            const label = document.createElement('label');
            label.className = 'addr-label';
            const checked = idx === 0 ? 'checked' : '';
            
            label.innerHTML = `
                <input type="radio" name="enderecoEntrega" value="${end.id}" ${checked}>
                <div class="addr-text">
                    <strong>${end.logradouro}, ${end.numero}</strong>
                    <small>${end.bairro} - ${end.cidade}/${end.uf} - CEP ${end.cep}</small>
                </div>
            `;
            box.appendChild(label);
        });

    } catch(e) {
        console.error("Erro ao carregar endereços:", e);
        box.innerHTML = '<p class="muted" style="color:red">Erro ao carregar endereços.</p>';
    }
  }

  // --- INTERAÇÕES ---
  function togglePagamento() {
    const method = document.querySelector('input[name="formaPagamento"]:checked').value;
    
    $('#campos-pix').classList.add('hidden');
    $('#campos-cartao').classList.add('hidden');
    $('#campos-boleto').classList.add('hidden');

    if(method === 'PIX') $('#campos-pix').classList.remove('hidden');
    if(method === 'CARTAO') $('#campos-cartao').classList.remove('hidden');
    if(method === 'BOLETO') $('#campos-boleto').classList.remove('hidden');
  }

  $('#btnCopyPix')?.addEventListener('click', () => {
    const input = $('#pix-codigo');
    input.select();
    document.execCommand('copy'); 
    alert("Código PIX copiado!");
  });

  // --- FINALIZAR PEDIDO (APENAS REDIRECIONA, MANTÉM DADOS) ---
  $('#btnFinalizar')?.addEventListener('click', async (e) => {
    e.preventDefault(); 

    // 1. Validações Visuais
    const itens = readCart();
    if(!itens.length) return alert("Carrinho vazio.");

    const enderecoInput = document.querySelector('input[name="enderecoEntrega"]:checked');
    if(!enderecoInput) return alert("Por favor, selecione um endereço de entrega.");

    const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked').value;
    
    // Validação Cartão (Básica)
    if(formaPagamento === 'CARTAO') {
        const num = $('#cartao-numero').value;
        const val = $('#cartao-validade').value;
        const cvc = $('#cartao-cvc').value;
        if(num.length < 16 || val.length < 4 || cvc.length < 3) {
            return alert("Verifique os dados do cartão.");
        }
    }

    if(formaPagamento === 'BOLETO') {
        if(!$('#boleto-email').value) return alert("Informe o e-mail para o boleto.");
    }

    // 2. Armazena dados de pagamento temporariamente (Opcional, se a prox pagina precisar saber)
    // Se a próxima página precisar saber qual endereço/forma foi escolhida, podemos salvar aqui.
    // Vou salvar no sessionStorage para não poluir o localStorage
    sessionStorage.setItem('temp_endereco_id', enderecoInput.value);
    sessionStorage.setItem('temp_forma_pagamento', formaPagamento);

    // 3. AÇÃO: Redireciona para o resumo final (NÃO LIMPA O CARRINHO AINDA)
    window.location.href = "resumo-pedido.html";
  });

  // --- BOOT ---
  (async function init(){
    try {
        const who = await api('/whoami');
        USER_ID = who.id;
        
        if(who.perfil !== 'Cliente') {
            alert("Apenas clientes podem comprar.");
            location.href = "index.html";
            return;
        }

        renderResumo();
        await carregarEnderecos();
        
        document.querySelectorAll('input[name="formaPagamento"]').forEach(el => {
            el.addEventListener('change', togglePagamento);
        });

    } catch(e) {
        alert("Faça login para continuar.");
        location.href = "login.html";
    }
  })();

})();