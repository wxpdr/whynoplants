// src/main/resources/static/js/produto-editar-estoque.js
const API = (window.API_BASE ?? (location.origin + "/api"));

const params = new URLSearchParams(location.search);
const id = Number(params.get("id"));

const form = document.getElementById("formQtd");
const elCodigo = document.getElementById("codigo");
const elNome = document.getElementById("nome");
const elValor = document.getElementById("valor");
const elQuantidade = document.getElementById("quantidade");
const elStatus = document.getElementById("status");

// carrega dados do produto (somente para exibir)
(async function init(){
  if (!id) { alert("ID inválido"); location.href = "estoque-produto.html"; return; }

  try{
    const r = await fetch(`${API}/produtos/${id}`, { credentials:"include" });
    if(!r.ok){ throw new Error("Falha ao carregar produto"); }
    const p = await r.json();

    elCodigo.value = p.codigo ?? "";
    elNome.value = p.nome ?? "";
    elValor.value = (p.valor != null ? Number(p.valor).toFixed(2) : "");
    elQuantidade.value = (p.quantidade ?? 0);
    elStatus.value = p.ativo ? "Ativo" : "Inativo";
  }catch(e){
    console.error(e);
    alert("Não foi possível carregar o produto.");
    location.href = "estoque-produto.html";
  }
})();

// salvar somente a quantidade
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const qtd = Number(elQuantidade.value);
  if (isNaN(qtd) || qtd < 0){
    alert("Quantidade inválida.");
    return;
  }

  const r = await fetch(`${API}/produtos/${id}/quantidade`, {
    method: "PATCH",
    headers: { "Content-Type":"application/json" },
    credentials: "include",
    body: JSON.stringify({ quantidade: qtd })
  });

  if (!r.ok){
    const txt = await r.text().catch(()=> "");
    console.error(txt);
    alert("Falha ao atualizar quantidade.");
    return;
  }
  // volta para a listagem do Estoquista
  location.href = "estoque-produto.html";
});
