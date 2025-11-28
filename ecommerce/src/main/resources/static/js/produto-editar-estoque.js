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

// -------------------- CARREGAR DADOS DO PRODUTO --------------------
(async function init() {
  if (!id) {
    alert("ID inválido");
    location.href = "estoque-produto.html";
    return;
  }

  try {
    // Usa o mesmo endpoint de detalhe usado pelo admin
    const r = await fetch(`${API}/produtos/${id}/detalhe`, {
      credentials: "include"
    });

    if (!r.ok) {
      throw new Error("Falha ao carregar produto");
    }

    const p = await r.json();

    if (elCodigo) elCodigo.value = p.codigo ?? "";
    if (elNome) elNome.value = p.nome ?? "";
    if (elValor) {
      elValor.value =
        p.valor != null
          ? Number(p.valor).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : "";
    }
    if (elQuantidade) elQuantidade.value = p.quantidade ?? 0;
    if (elStatus) elStatus.value = p.ativo ? "Ativo" : "Inativo";
  } catch (e) {
    console.error(e);
    alert("Não foi possível carregar o produto.");
    location.href = "estoque-produto.html";
  }
})();

// -------------------- SUBMIT: ATUALIZAR QUANTIDADE --------------------
form?.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const valorDigitado = elQuantidade?.value ?? "";
  const qtd = Number(valorDigitado.replace(",", "."));

  if (!Number.isFinite(qtd) || qtd < 0) {
    alert("Informe uma quantidade válida (0 ou maior).");
    return;
  }

  try {
    const r = await fetch(`${API}/produtos/${id}/quantidade`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quantidade: qtd })
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error(txt);
      alert("Falha ao atualizar quantidade.");
      return;
    }

    alert("Quantidade atualizada com sucesso.");
    location.href = "estoque-produto.html";
  } catch (e) {
    console.error(e);
    alert("Erro ao atualizar quantidade.");
  }
});
