// Página pública de produto (cliente) — detalhe + normalização de URLs

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

// >>> Corrigido: usa ?id= e tem fallback para sessionStorage
function getId(){
  const urlId = new URL(location.href).searchParams.get("id");
  if (urlId) return urlId;
  try {
    const ssId = sessionStorage.getItem('produtoId');
    if (ssId) return ssId;
  } catch {}
  return null;
}

function normalizarUrlUpload(path){
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  let p = String(path).trim().replace(/\\/g,'/').replace(/^\/+/, '');
  if (!/^uploads\//i.test(p)) p = 'uploads/' + p; // prefixa se faltar
  return '/' + p; // /uploads/...
}

function money(v){
  try{ return Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
  catch{ return "R$ —"; }
}

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

async function carregar(){
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

  // Título, preço e descrição
  if (tituloEl) tituloEl.textContent = prod.nome ?? "Produto";
  $("#preco").textContent = money(prod.valor);
  $("#descricao").textContent = prod.descricao ?? "";

  // Ordena imagens: principal > ordem > id
  const imgs = (prod.imagens ?? []).sort((a,b)=>{
    const pa = a.principal?1:0, pb=b.principal?1:0;
    if(pa!==pb) return pb-pa;
    const oa=a.ordem??0, ob=b.ordem??0;
    if(oa!==ob) return oa-ob;
    return (a.id??0)-(b.id??0);
  });

  // Principal
  const principal = imgs[0]?.arquivo
    ? normalizarUrlUpload(imgs[0].arquivo)
    : "https://via.placeholder.com/800x600?text=Sem+imagem";

  const imgEl = $("#imgPrincipal");
  imgEl.src = principal;
  imgEl.alt = prod.nome ?? "Imagem do produto";

  // Thumbs
  const thumbs = $("#thumbs");
  thumbs.innerHTML = "";
  imgs.forEach((it, idx)=>{
    const im = document.createElement("img");
    im.src = normalizarUrlUpload(it.arquivo);
    im.alt = prod.nome ?? "Imagem do produto";
    if(idx===0) im.classList.add("active");
    im.addEventListener("click", ()=>{
      imgEl.src = im.src;
      $$(".thumbs img").forEach(t => t.classList.remove("active"));
      im.classList.add("active");
    });
    thumbs.appendChild(im);
  });

  // Placeholder do carrinho (futuro)
  const btn = $("#btnComprar");
  if (btn){
    btn.addEventListener("click", ()=>{
      const qtd = Math.max(1, Number($("#qtd")?.value || 1));
      alert(`(placeholder) Adicionar ao carrinho:\n${prod.nome} — Qtd: ${qtd}`);
    });
  }
}

document.addEventListener("DOMContentLoaded", carregar);
