const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

// Garante API correta
const API_BASE = window.API || "http://localhost:8080";

/* -------- Carrinho base -------- */
const CART_KEY='wnplants_cart';
const FRETE_KEY='wnplants_frete'; 
const money = v => Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

function read(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch{ return []; } }
function write(x){ try{ localStorage.setItem(CART_KEY, JSON.stringify(x)); }catch{} }
function count(){ return read().reduce((s,i)=>s+Number(i.quantidade||0),0); }
function updateBadge(){ const b=$('#cartCount'); if(b) b.textContent = count()||''; }

/* ---------- Frete por região ---------- */
const ORIGEM = { cep: '01000-000', regiao: 'SP' };

function normalizarCEP(str){
  const d = (str||'').replace(/\D/g,'').slice(0,8);
  return d.length>5 ? d.slice(0,5)+'-'+d.slice(5) : d;
}

function regiaoPorCep(cep){
  const dig = Number(String(cep).replace(/\D/g,'')[0] || 0);
  if (dig<=1) return 'SP';
  if (dig<=3) return 'Sudeste';
  if (dig<=5) return 'Nordeste';
  if (dig===6) return 'Norte';
  if (dig===7) return 'Centro-Oeste';
  if (dig===8) return 'Sul';
  return 'Sul'; 
}

const TABELA_FRETE = {
  'SP': [
    { id:'eco', nome:'Econômico', valor:12.90, prazo:'3–5 dias' },
    { id:'std', nome:'Padrão',    valor:19.90, prazo:'2–3 dias' },
    { id:'exp', nome:'Expresso',  valor:29.90, prazo:'1–2 dias' },
  ],
  'Sudeste': [
    { id:'eco', nome:'Econômico', valor:17.90, prazo:'4–7 dias' },
    { id:'std', nome:'Padrão',    valor:27.90, prazo:'3–5 dias' },
    { id:'exp', nome:'Expresso',  valor:44.90, prazo:'1–2 dias' },
  ],
  'Sul': [
    { id:'eco', nome:'Econômico', valor:22.90, prazo:'5–8 dias' },
    { id:'std', nome:'Padrão',    valor:34.90, prazo:'3–6 dias' },
    { id:'exp', nome:'Expresso',  valor:54.90, prazo:'2–3 dias' },
  ],
  'Centro-Oeste': [
    { id:'eco', nome:'Econômico', valor:24.90, prazo:'6–9 dias' },
    { id:'std', nome:'Padrão',    valor:39.90, prazo:'4–7 dias' },
    { id:'exp', nome:'Expresso',  valor:59.90, prazo:'2–4 dias' },
  ],
  'Nordeste': [
    { id:'eco', nome:'Econômico', valor:29.90, prazo:'7–12 dias' },
    { id:'std', nome:'Padrão',    valor:49.90, prazo:'5–9 dias'  },
    { id:'exp', nome:'Expresso',  valor:79.90, prazo:'3–5 dias'  },
  ],
  'Norte': [
    { id:'eco', nome:'Econômico', valor:39.90, prazo:'9–14 dias' },
    { id:'std', nome:'Padrão',    valor:69.90, prazo:'6–10 dias' },
    { id:'exp', nome:'Expresso',  valor:99.90, prazo:'4–6 dias'  },
  ],
};

function calcularFretePorRegiao(cepDestino, subtotal){
  const reg = regiaoPorCep(cepDestino);
  let opcoes = TABELA_FRETE[reg] || TABELA_FRETE['Sudeste'];
  if (reg === 'SP' && subtotal >= 300){
    opcoes = opcoes.map(o => o.id==='eco' ? { ...o, valor:0 } : o);
  }
  return opcoes.map(o => ({ ...o, regiao: reg }));
}

function saveFrete(sel){ try{ localStorage.setItem(FRETE_KEY, JSON.stringify(sel||null)); }catch{} }
function readFrete(){ try{ return JSON.parse(localStorage.getItem(FRETE_KEY)||'null'); }catch{ return null; } }

/* -------- Render -------- */
function render(){
  updateBadge();
  const box = $('#lista');
  const itens = read();

  if(!itens.length){
    box.innerHTML = `<div class="vazio">Seu carrinho está vazio.</div>`;
    $('#subtotal').textContent = money(0);
    $('#freteLinha').hidden = true;
    $('#total').textContent = money(0);
    return;
  }

  box.innerHTML = '';
  let subtotal = 0;

  itens.forEach((it,idx)=>{
    const el = document.createElement('div');
    el.className='item';
    subtotal += Number(it.valor||0) * Number(it.quantidade||0);

    el.innerHTML = `
      <img src="${it.imagem||'https://via.placeholder.com/80?text=%20'}" alt="">
      <div class="nome">${it.nome||'Produto'}</div>
      <div class="preco">${money(it.valor)}</div>
      <div class="qty">
        <button data-op="dec" aria-label="Diminuir">−</button>
        <span class="qtd">${it.quantidade}</span>
        <button data-op="inc" aria-label="Aumentar">+</button>
      </div>
      <button class="rm" aria-label="Remover">Remover</button>
    `;

    el.querySelector('[data-op="inc"]').addEventListener('click', ()=>{
      const arr = read(); arr[idx].quantidade++; write(arr); render();
    });
    el.querySelector('[data-op="dec"]').addEventListener('click', ()=>{
      const arr = read(); arr[idx].quantidade = Math.max(1, arr[idx].quantidade-1); write(arr); render();
    });
    el.querySelector('.rm').addEventListener('click', ()=>{
      const arr = read(); arr.splice(idx,1); write(arr);
      if (arr.length===0) saveFrete(null);
      render();
    });

    box.appendChild(el);
  });

  $('#subtotal').textContent = money(subtotal);

  const freteSel = readFrete();
  let total = subtotal;
  if (freteSel && typeof freteSel.valor === 'number'){
    $('#freteNome').textContent = `${freteSel.nome} • ${freteSel.regiao}`;
    $('#freteValor').textContent = money(freteSel.valor);
    $('#freteLinha').hidden = false;
    total += freteSel.valor;
  } else {
    $('#freteLinha').hidden = true;
  }
  $('#total').textContent = money(total);
}

function renderFreteUI(opcoes, selecionado){
  const wrap = $('#opcoesFrete');
  wrap.innerHTML = '';
  opcoes.forEach(opt=>{
    const row = document.createElement('label');
    row.className = 'frete-card';
    row.innerHTML = `
      <div class="frete-left">
        <input type="radio" name="frete" value="${opt.id}" ${selecionado?.id===opt.id?'checked':''}>
        <div>
          <div><strong>${opt.nome}</strong> — ${money(opt.valor)}</div>
          <div class="frete-prazo">${opt.regiao} • ${opt.prazo}</div>
        </div>
      </div>
    `;
    row.querySelector('input').addEventListener('change', ()=>{
      const sel = { ...opt, cep: $('#cep').value };
      saveFrete(sel);
      render();
    });
    wrap.appendChild(row);
  });
  wrap.hidden = false;
}

/* -------- Listeners -------- */
document.addEventListener('DOMContentLoaded', ()=>{
  render();

  const cepInput = $('#cep');
  const freteSalvo = readFrete();
  if (freteSalvo?.cep) cepInput.value = normalizarCEP(freteSalvo.cep);

  cepInput.addEventListener('input', ()=> cepInput.value = normalizarCEP(cepInput.value));

  $('#btnCalcFrete')?.addEventListener('click', ()=>{
    const cep = (cepInput.value||'').replace(/\D/g,'');
    if (cep.length !== 8){ alert('Informe um CEP válido (8 dígitos).'); return; }

    const subtotal = read().reduce((s,i)=>s + Number(i.valor||0)*Number(i.quantidade||0), 0);
    const opcoes = calcularFretePorRegiao(cep, subtotal);

    let sel = readFrete();
    if (!sel || !opcoes.some(o=>o.id===sel.id && o.regiao===sel.regiao)) {
      sel = { ...opcoes[0], cep: cepInput.value };
    }
    saveFrete(sel);

    renderFreteUI(opcoes, sel);
    render();
  });

  // ========== VALIDAÇÃO DE PERFIL E LOGIN NO CHECKOUT ==========
  $('#checkout')?.addEventListener('click', async () => {
    const itensCarrinho = read();
    const frete = readFrete();

    if (!itensCarrinho.length) {
      alert('Seu carrinho está vazio.');
      return;
    }

    if (!frete) {
      alert('Escolha uma opção de frete antes de continuar.');
      return;
    }

    // Verifica Login e Perfil
    try {
        const r = await fetch(`${API_BASE}/whoami`, { credentials: "include" });
        
        if (r.ok) {
            // Logado: Verifica se é Cliente
            const user = await r.json();
            
            if (user.perfil === 'Administrador' || user.perfil === 'Estoquista') {
                alert("Atenção:\nAdministradores e Estoquistas não podem realizar compras.\n\nPor favor, entre com uma conta de Cliente.");
                return;
            }

            // Tudo certo -> Vai para pagamento
            location.href = 'pagamento.html';

        } else {
            // Não logado -> Vai para login
            sessionStorage.setItem("redirect_after_login", "pagamento.html");
            alert("Você precisa estar logado para finalizar o pedido.");
            location.href = 'login.html';
        }
    } catch (e) {
        console.error("Erro auth:", e);
        alert("Erro de conexão ao verificar usuário.");
    }
  });
});