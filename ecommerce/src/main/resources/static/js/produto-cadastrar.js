// js/produto-cadastrar.js

// Garante que os elementos existam antes de ligarmos os eventos
document.addEventListener("DOMContentLoaded", () => {
  // API base
  const API = (window.API_BASE ?? (location.origin + "/api"));

  // ===== DOM =====
  const form            = document.getElementById("formProduto");
  const btnCancelar     = document.getElementById("btnCancelar");
  const btnAbrirGaleria = document.getElementById("btnAbrirGaleria");
  const modal           = document.getElementById("modalGaleria");
  const btnFechar       = document.getElementById("btnFechar");
  const btnSalvarGaleria= document.getElementById("btnSalvarGaleria");
  const btnAddImg       = document.getElementById("btnAddImg");
  const inputImagens    = document.getElementById("inputImagens");
  const gridImgs        = document.getElementById("gridImgs");
  const imgPreview      = document.getElementById("imgPreview");
  const placeholder     = document.querySelector(".placeholder");

  // ===== Estado =====
  let arquivos = [];       // File[]
  let principalIndex = 0;  // índice da imagem principal (0-based)

  // ===== Modal: abrir / fechar / salvar =====
  function abrirModal(e){ e?.preventDefault?.(); modal?.removeAttribute("hidden"); }
  function fecharModal(e){ e?.preventDefault?.(); modal?.setAttribute("hidden",""); }

  btnAbrirGaleria?.addEventListener("click", abrirModal);
  btnFechar?.addEventListener("click", fecharModal);
  btnSalvarGaleria?.addEventListener("click", (e) => { e.preventDefault(); atualizarPreview(); fecharModal(); });

  // Fechar clicando no backdrop
  modal?.addEventListener("click", (e) => { if (e.target === modal) fecharModal(e); });

  // ===== Upload / galeria =====
  btnAddImg?.addEventListener("click", () => inputImagens?.click());

  inputImagens?.addEventListener("change", (e) => {
    for (const f of e.target.files) arquivos.push(f);
    renderGaleria();
    atualizarPreview();
    // limpa o input para permitir re-selecionar a mesma imagem depois
    e.target.value = "";
  });

  function renderGaleria(){
    if (!gridImgs) return;
    gridImgs.innerHTML = "";
    arquivos.forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const div = document.createElement("div");
      div.className = "card-img";
      div.innerHTML = `
        <div class="thumb"><img src="${url}" alt=""></div>
        <div class="row">
          <button type="button" class="btn ghost" data-remove="${idx}">Remover</button>
          <span class="star ${idx===principalIndex ? 'on':''}" data-star="${idx}" title="Definir como principal">★</span>
        </div>
      `;
      gridImgs.appendChild(div);
    });

    // remover
    gridImgs.querySelectorAll("[data-remove]").forEach(b => {
      b.addEventListener("click", (ev) => {
        const i = Number(ev.currentTarget.getAttribute("data-remove"));
        arquivos.splice(i, 1);
        if (principalIndex >= arquivos.length) principalIndex = Math.max(0, arquivos.length - 1);
        renderGaleria();
        atualizarPreview();
      });
    });

    // marcar principal
    gridImgs.querySelectorAll("[data-star]").forEach(s => {
      s.addEventListener("click", (ev) => {
        principalIndex = Number(ev.currentTarget.getAttribute("data-star"));
        renderGaleria();
        atualizarPreview();
      });
    });
  }

  function atualizarPreview(){
    if (!imgPreview || !placeholder) return;
    if (arquivos.length === 0){
      imgPreview.style.display = "none";
      placeholder.style.display = "block";
      return;
    }
    const url = URL.createObjectURL(arquivos[principalIndex]);
    imgPreview.src = url;
    imgPreview.style.display = "block";
    placeholder.style.display = "none";
  }

  // ===== Formulário =====
  btnCancelar?.addEventListener("click", (e) => { e.preventDefault(); location.href = "produto.html"; });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      codigo:      document.getElementById("codigo")?.value.trim(),
      nome:        document.getElementById("nome")?.value.trim(),
      valor:       Number(document.getElementById("valor")?.value),
      quantidade:  Number(document.getElementById("quantidade")?.value),
      descricao:   document.getElementById("descricao")?.value.trim() || null,
      avaliacao:   document.getElementById("avaliacao")?.value ? Number(document.getElementById("avaliacao").value) : null,
      principalIndex: arquivos.length ? principalIndex : null
    };

    // validações simples
    if (!dados.codigo || !dados.nome || isNaN(dados.valor) || isNaN(dados.quantidade)) {
      alert("Preencha Código, Nome, Preço e Estoque.");
      return;
    }
    if (dados.descricao && dados.descricao.length > 2000){
      alert("Descrição deve ter no máximo 2000 caracteres.");
      return;
    }
    if (dados.avaliacao && (dados.avaliacao < 1 || dados.avaliacao > 5)) {
      alert("Avaliação deve ser entre 1 e 5.");
      return;
    }

    // FormData (multipart): JSON em 'dados' + arquivos em 'imagens'
    const fd = new FormData();
    fd.append("dados", new Blob([JSON.stringify(dados)], { type: "application/json" }));
    arquivos.forEach(f => fd.append("imagens", f));

    try{
      const r = await fetch(`${API}/produtos`, { method: "POST", credentials: "include", body: fd });
      if (!r.ok){
        const txt = await r.text().catch(()=>"");
        console.error("Erro ao salvar produto:", txt || r.status);
        alert("Falha ao salvar produto.");
        return;
      }
      location.href = "produto.html";
    }catch(err){
      console.error(err);
      alert("Não foi possível comunicar com a API.");
    }
  });
});
