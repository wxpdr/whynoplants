// Preview de produto (admin) – carrossel + dados
const API = (window.API_BASE ?? (location.origin + "/api"));

const params = new URLSearchParams(location.search);
const id = Number(params.get("id"));

const btnVoltar = document.getElementById("btnVoltar");
const imgStage = document.getElementById("imgStage");
const thumbs = document.getElementById("thumbs");

const elNome = document.getElementById("nome");
const elValor = document.getElementById("valor");
const elQtd = document.getElementById("quantidade");
const elStatus = document.getElementById("status");
const elCodigo = document.getElementById("codigo");
const elDesc = document.getElementById("descricao");
const elRating = document.getElementById("rating");

btnVoltar.addEventListener("click", ()=> history.length > 1 ? history.back() : location.href="produto.html");

let imagens = [];
let index = 0;

(async function init(){
  if (!id){ alert("ID inválido"); location.href="produto.html"; return; }

  // carrega produto
  try{
    const r = await fetch(`${API}/produtos/${id}`, { credentials:"include" });
    if (!r.ok) throw new Error();
    const p = await r.json();
    preencherProduto(p);
  }catch(_){
    alert("Falha ao carregar produto.");
    location.href="produto.html";
    return;
  }

  // carrega imagens (seu projeto já tem endpoint de imagens)
  try{
    const r2 = await fetch(`${API}/produtos/${id}/imagens`, { credentials:"include" });
    if (r2.ok){
      imagens = await r2.json();
      imagens.sort((a,b)=>{
        // principal primeiro; depois ordem; depois id
        const pa = a.principal ? 1 : 0;
        const pb = b.principal ? 1 : 0;
        if (pa !== pb) return pb - pa;
        if ((a.ordem ?? 0) !== (b.ordem ?? 0)) return (a.ordem ?? 0) - (b.ordem ?? 0);
        return (a.id ?? 0) - (b.id ?? 0);
      });
    }
  }catch(_){}

  // fallback: se não tiver imagens, coloca placeholder
  if (!imagens || imagens.length === 0){
    imagens = [{ arquivo: "uploads/placeholder.png", principal:true }];
  }

  montarThumbs();
  mostrar(0);
})();

function preencherProduto(p){
  elNome.textContent = p.nome ?? "Produto";
  elCodigo.textContent = p.codigo ?? "—";
  elValor.textContent = (p.valor != null ? Number(p.valor).toFixed(2).replace('.', ',') : "0,00");
  elQtd.textContent = (p.quantidade ?? 0);
  elStatus.textContent = (p.ativo ? "Ativo" : "Inativo");
  elDesc.textContent = (p.descricao ?? "—");

  // estrelas (1..5 com passos de 0.5, se vier null deixa vazio)
  elRating.innerHTML = "";
  const nota = p.avaliacao != null ? Number(p.avaliacao) : null;
  if (nota != null){
    for (let i=1; i<=5; i++){
      const star = document.createElement("span");
      star.className = "star" + (i <= Math.floor(nota) ? "" : " off");
      star.textContent = "★";
      elRating.appendChild(star);
    }
  }
}

function montarThumbs(){
  thumbs.innerHTML = "";
  imagens.forEach((img, i)=>{
    const div = document.createElement("div");
    div.className = "item";
    if (i === 0) div.classList.add("active");
    const imgt = document.createElement("img");
    imgt.src = urlArquivo(img.arquivo);
    imgt.alt = `Imagem ${i+1}`;
    div.appendChild(imgt);
    div.addEventListener("click", ()=> mostrar(i));
    thumbs.appendChild(div);
  });

  document.getElementById("btnPrev").onclick = ()=> navegar(-1);
  document.getElementById("btnNext").onclick = ()=> navegar(+1);
}

function mostrar(i){
  if (i < 0) i = 0;
  if (i >= imagens.length) i = imagens.length-1;
  index = i;
  imgStage.src = urlArquivo(imagens[i].arquivo);
  Array.from(thumbs.children).forEach((t, k)=>{
    t.classList.toggle("active", k === i);
  });
}

function navegar(delta){
  let i = index + delta;
  if (i < 0) i = imagens.length - 1;
  if (i >= imagens.length) i = 0;
  mostrar(i);
}

function urlArquivo(path){
  // no banco salvamos "uploads/produtos/<id>/<arquivo>"
  // para servir estático, basta prefixar com "/" (Spring está servindo /uploads/**)
  if (!path) return "https://via.placeholder.com/800x600?text=Sem+imagem";
  if (path.startsWith("http")) return path;
  return "/" + path.replace(/^\/+/, "");
}
