// Loja pública — renderização de cards (Sprint 3)
// Tenta ambos os endpoints de detalhe e normaliza caminhos de imagem.

const grid = document.getElementById("produtosGrid");
const tpl = document.getElementById("tplCard");
 
document.addEventListener("DOMContentLoaded", carregarProdutos);

function normalizarUrlUpload(path){
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  let p = String(path).trim().replace(/\\/g,'/').replace(/^\/+/, '');
  if (!/^uploads\//i.test(p)) p = 'uploads/' + p;  // prefixa se faltar
  return '/' + p; // -> /uploads/...
}

function formatCurrency(v){
  try{ return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  catch{ return 'R$ —'; }
}

// Tenta ambos os endpoints existentes no back
async function carregarDetalheProduto(id){
  const urls = [
    `${API}/produtos/${id}/detalhe`,
    `${API}/produtos/${id}`
  ];
  for (const u of urls){
    try{
      const r = await fetch(u);
      if (r.ok) return await r.json();
    }catch(e){}
  }
  throw new Error('Nenhum endpoint de detalhe respondeu OK');
}

async function carregarProdutos(){
  grid.innerHTML = criarSkeleton(8);
  try{
    const r = await fetch(`${API}/produtos?ativo=true&page=0&size=24`);
    if(!r.ok) throw new Error('Falha ao listar produtos');
    const page = await r.json();
    const itens = page.content ?? [];

    const frag = document.createDocumentFragment();

    for(const p of itens){
      const card = tpl.content.cloneNode(true);
      const aImg   = card.querySelector('.img-wrap');
      const img    = card.querySelector('img');
      const titulo = card.querySelector('.titulo');
      const preco  = card.querySelector('.preco');
      const btnDet = card.querySelector('.btn.detalhes');

      titulo.textContent = p.nome ?? 'Produto';
      preco.textContent  = formatCurrency(p.valor);

      let imgSrc = 'https://via.placeholder.com/600x450?text=Sem+imagem';
      try{
        const det = await carregarDetalheProduto(p.id);
        const principal = (det.imagens ?? []).sort((a,b)=>{
          const pa = a.principal?1:0, pb=b.principal?1:0;
          if (pa!==pb) return pb-pa;
          const oa=a.ordem??0, ob=b.ordem??0;
          if (oa!==ob) return oa-ob;
          return (a.id??0)-(b.id??0);
        })[0];
        if (principal?.arquivo){
          imgSrc = normalizarUrlUpload(principal.arquivo);
        } else {
          console.warn('Sem imagem principal para produto', p.id, det.imagens);
        }
      }catch(err){
        console.warn('Detalhe não carregado para', p.id, err);
      }

      img.src = imgSrc;
      img.alt = `Imagem de ${p.nome ?? 'produto'}`;

      // >>> Corrigido: salva o id e navega com query string
      const go = () => {
        try { sessionStorage.setItem('produtoId', String(p.id)); } catch {}
        location.href = `produto-visualizar-cliente.html?id=${p.id}`;
      };
      aImg.addEventListener('click', go);
      aImg.addEventListener('keypress', (e)=>{ if(e.key==='Enter') go(); });
      btnDet.addEventListener('click', go);

      frag.appendChild(card);
    }

    grid.innerHTML = '';
    grid.appendChild(frag);

  }catch(err){
    console.error(err);
    grid.innerHTML = `<div class="erro">Não foi possível carregar os produtos.</div>`;
  }
}

function criarSkeleton(qtd){
  const arr = Array.from({length:qtd}, ()=>`
    <article class="card skeleton">
      <div class="img-wrap"></div>
      <div class="card-body">
        <div class="sk-line" style="width:70%"></div>
        <div class="sk-line" style="width:40%"></div>
        <div class="sk-btn"></div>
      </div>
    </article>`);
  return arr.join('');
}


// js/cart-badge.js — somente badge do carrinho na index (sem "comprar" nos cards)

const CART_KEY = 'wnplants_cart';

function readCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function updateCartCount(){
  const el = document.querySelector('#cartCount');
  if (!el) return;
  const total = readCart().reduce((sum, it) => sum + Number(it.quantidade || 0), 0);
  el.textContent = total > 0 ? String(total) : '';
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // Atualiza se o carrinho mudar em OUTRA aba/janela
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) updateCartCount();
  });
});
