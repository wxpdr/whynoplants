const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

const CART_KEY='wnplants_cart';
const money = v => Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

function read(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch{ return []; } }
function write(x){ try{ localStorage.setItem(CART_KEY, JSON.stringify(x)); }catch{} }
function count(){ return read().reduce((s,i)=>s+Number(i.quantidade||0),0); }
function updateBadge(){ const b=$('#cartCount'); if(b) b.textContent = count()||''; }

function render(){
  updateBadge();
  const box = $('#lista');
  const itens = read();
  if(!itens.length){
    box.innerHTML = `<div class="vazio">Seu carrinho está vazio.</div>`;
    $('#total').textContent = money(0);
    return;
  }

  box.innerHTML = '';
  let total = 0;

  itens.forEach((it,idx)=>{
    const el = document.createElement('div');
    el.className='item';
    total += Number(it.valor||0) * Number(it.quantidade||0);

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
      const arr = read(); arr.splice(idx,1); write(arr); render();
    });

    box.appendChild(el);
  });

  $('#total').textContent = money(total);
}

document.addEventListener('DOMContentLoaded', ()=>{
  render();
  $('#limpar')?.addEventListener('click', ()=>{ write([]); render(); });
  $('#checkout')?.addEventListener('click', ()=> alert('Checkout simulado. 😉'));
});
