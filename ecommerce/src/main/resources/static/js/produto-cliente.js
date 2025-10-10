// Página pública de produto (cliente): carrossel + contador + carrinho (localStorage)

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* ---------- Configs ---------- */
const AUTOPLAY = true;      // autoplay ligado
const INTERVALO_MS = 2000;  // intervalo do autoplay (ms)

/* ---------- Utilidades ---------- */
function getId(){
  const urlId = new URL(location.href).searchParams.get("id");
  if (urlId) return urlId;
  try { const ssId = sessionStorage.getItem('produtoId'); if (ssId) return ssId; } catch {}
  return null;
}
function normalizarUrlUpload(path){
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  let p = String(path).trim().replace(/\\/g,'/').replace(/^\/+/, '');
  if (!/^uploads\//i.test(p)) p = 'uploads/' + p;
  return '/' + p;
}
function money(v){
  try{ return Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
  catch{ return "R$ —"; }
}
function renderStars(av){
  const v = Math.max(0, Math.min(5, Number(av||0)));
  const full = Math.floor(v);
  const half = v - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half?'☆':'') + '✩'.repeat(empty);
}
async function carregarDetalheProduto(id){
  const urls = [`${API}/produtos/${id}/detalhe`, `${API}/produtos/${id}`];
  for (const u of urls){
    try{ const r = await fetch(u); if (r.ok) return await r.json(); }catch(e){}
  }
  throw new Error('Nenhum endpoint de detalhe respondeu OK');
}

/* ---------- Carrinho (localStorage) ---------- */
const CART_KEY = 'wnplants_cart';
function readCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }catch{ return []; } }
function writeCart(list){ try{ localStorage.setItem(CART_KEY, JSON.stringify(list)); }catch{} }
function addToCart(item){ // {id,nome,valor,imagem,quantidade}
  const cart = readCart();
  const idx = cart.findIndex(x => String(x.id) === String(item.id));
  if (idx >= 0) cart[idx].quantidade += item.quantidade;
  else cart.push(item);
  writeCart(cart);
  updateCartCount();
}
function updateCartCount(){
  const el = $('#cartCount');
  if (!el) return;
  const total = readCart().reduce((s,i)=>s + Number(i.quantidade||0), 0);
  el.textContent = total > 0 ? total : '';
}

/* ---------- Carrossel ---------- */
let imagens = [];      // URLs normalizadas
let currentIdx = 0;
function showAt(idx){
  if (!imagens.length) return;
  currentIdx = (idx + imagens.length) % imagens.length;
  const src = imagens[currentIdx];
  const big = $('#imgPrincipal');
  if (big) big.src = src;

  $$('.thumbs img').forEach((t,i)=> t.classList.toggle('active', i===currentIdx));

  // controla setas quando só há 1 imagem
  const prev = $('.nav.prev'), next = $('.nav.next');
  const single = imagens.length <= 1;
  if (prev) prev.disabled = single;
  if (next) next.disabled = single;
}

/* ---------- Fluxo principal ---------- */
async function carregar(){
  updateCartCount();

  const id = getId();
  const tituloEl = $("#titulo");
  if(!id){ if (tituloEl) tituloEl.textContent = "Produto não encontrado"; return; }

  let prod;
  try{
    prod = await carregarDetalheProduto(id);
  }catch(e){
    console.error("[produto-cliente] erro no detalhe:", e);
    if (tituloEl) tituloEl.textContent = "Erro ao carregar";
    return;
  }

  // Cabeçalho
  if (tituloEl) tituloEl.textContent = prod.nome ?? "Produto";
  $("#preco").textContent = money(prod.valor);
  $("#descricao").textContent = prod.descricao ?? "";
  $("#avaliacao").textContent = renderStars(prod.avaliacao);

  // Imagens (principal > ordem > id)
  const imgs = (prod.imagens ?? []).sort((a,b)=>{
    const pa = a.principal?1:0, pb=b.principal?1:0;
    if(pa!==pb) return pb-pa;
    const oa=a.ordem??0, ob=b.ordem??0;
    if(oa!==ob) return oa-ob;
    return (a.id??0)-(b.id??0);
  });

  imagens = imgs.map(x => normalizarUrlUpload(x.arquivo)).filter(Boolean);
  if (!imagens.length) imagens = ["https://via.placeholder.com/800x600?text=Sem+imagem"];

  // Render principal + thumbs
  const thumbs = $("#thumbs");
  thumbs.innerHTML = "";
  imagens.forEach((src, idx)=>{
    const im = document.createElement("img");
    im.src = src; im.alt = prod.nome ?? "Miniatura";
    im.classList.toggle('active', idx===0);
    im.addEventListener("click", ()=> showAt(idx));
    thumbs.appendChild(im);
  });

  // Setas e teclado
  const prev = $('.nav.prev'), next = $('.nav.next');
  if (prev) prev.addEventListener('click', ()=> showAt(currentIdx-1));
  if (next) next.addEventListener('click', ()=> showAt(currentIdx+1));
  document.addEventListener('keydown', (e)=>{
    if (imagens.length <= 1) return;
    if (e.key === 'ArrowLeft')  showAt(currentIdx-1);
    if (e.key === 'ArrowRight') showAt(currentIdx+1);
  });

  // Primeiro frame do carrossel
  showAt(0);

  // ----- contador de quantidade (- / +) -----
  function setQty(v){
    v = Math.max(1, Math.floor(Number(v) || 1));
    const hidden = $('#qtd'), view = $('#qtdView');
    if (hidden) hidden.value = v;
    if (view) view.textContent = v;
  }
  setQty($('#qtd')?.value || 1);
  $('#menos')?.addEventListener('click', ()=> setQty(Number($('#qtd')?.value || 1) - 1));
  $('#mais') ?.addEventListener('click', ()=> setQty(Number($('#qtd')?.value || 1) + 1));
  document.querySelector('.purchase')?.addEventListener('keydown', (e)=>{
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setQty(Number($('#qtd')?.value || 1) - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setQty(Number($('#qtd')?.value || 1) + 1); }
  });

  // --- Autoplay (pausa no hover/aba oculta e reinicia após interação) ---
  let timer = null;
  let paused = false;

  function startAuto(){
    if (!AUTOPLAY || imagens.length <= 1) return;
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAuto();
    timer = setInterval(()=> showAt(currentIdx + 1), INTERVALO_MS);
  }
  function stopAuto(){
    if (timer){ clearInterval(timer); timer = null; }
  }

  const gal = document.querySelector('.gallery');
  gal?.addEventListener('mouseenter', ()=>{ paused = true;  stopAuto(); });
  gal?.addEventListener('mouseleave', ()=>{ paused = false; startAuto(); });

  document.addEventListener('visibilitychange', ()=>{
    if (document.hidden) stopAuto();
    else startAuto();
  });

  const restartAfterManual = ()=> { stopAuto(); startAuto(); };
  prev?.addEventListener('click', restartAfterManual);
  next?.addEventListener('click', restartAfterManual);
  thumbs?.addEventListener('click', restartAfterManual);

  startAuto();

  // Botão: adicionar ao carrinho (com redirecionamento da Task 3)
  const btn = $("#btnComprar");
  if (btn){
    btn.addEventListener("click", ()=>{
      const qtd = Math.max(1, Number($("#qtd")?.value || 1));
      addToCart({
        id: prod.id,
        nome: prod.nome,
        valor: Number(prod.valor || 0),
        imagem: imagens[0] || null,
        quantidade: qtd
      });
      updateCartCount();
      const ir = confirm('Produto adicionado! Ir para o carrinho?');
      if (ir) location.href = 'carrinho.html';
      else location.href = '/'; // continuar comprando
    });
  }
}

document.addEventListener("DOMContentLoaded", carregar);
