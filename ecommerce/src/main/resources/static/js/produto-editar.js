document.addEventListener("DOMContentLoaded", () => {
  const API = (window.API_BASE ?? (location.origin + "/api"));
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const $  = (sel) => document.querySelector(sel);

  const id = Number(qs("id"));
  if (!id) { alert("ID não informado"); location.href="produto.html"; return; }

  // Elementos do Formulário
  const form = $("#formProduto");
  const cancelar = $("#cancelar");
  const codigo = $("#codigo");
  const nome = $("#nome");
  const valor = $("#valor");
  const quantidade = $("#quantidade");
  const descricao = $("#descricao");
  const avaliacao = $("#avaliacao");
  const ativo = $("#ativo");
  const galeriaAtual = $("#galeriaAtual");

  // Elementos do Modal
  const modal = $("#modal");
  const abrirModal = $("#abrirModal");
  const fechar = $("#fechar");
  const salvarImgs = $("#salvarImgs");
  const addNova = $("#addNova");
  const inputNovas = $("#inputImgsNovas");
  const gridNovas = $("#gridNovas");

  let novas = [];
  let principalIndexNovas = null; // Índice da principal entre as novas

  // -------------------- LOAD --------------------
  (async function load(){
    try {
      const r = await fetch(`${API}/produtos/${id}/detalhe`, { credentials:"include" });
      if (!r.ok) throw new Error();
      const p = await r.json();

      codigo.value = p.codigo || "";
      nome.value = p.nome || "";
      valor.value = p.valor || 0;
      quantidade.value = p.quantidade || 0;
      descricao.value = p.descricao ?? "";
      avaliacao.value = p.avaliacao ?? "";
      ativo.value = String(p.ativo);

      renderGaleriaAtual(p.imagens || []);
    } catch(err) {
      console.error(err);
      alert("Erro ao carregar produto");
      location.href="produto.html";
    }
  })();

  // -------------------- GALERIA ATUAL (Imagens salvas) --------------------
  function renderGaleriaAtual(imagens){
    galeriaAtual.innerHTML = "";
    if(!imagens || imagens.length === 0){
        galeriaAtual.innerHTML = "<p>Sem imagens cadastradas.</p>";
        return;
    }

    imagens.forEach(img => {
      const card = document.createElement("div");
      card.className = "card-img";
      const srcImg = img.arquivo.startsWith('http') ? img.arquivo : `/${img.arquivo.replace(/^\//, '')}`;
      
      // RESTAURADO: Botão Remover E a Estrela
      card.innerHTML = `
        <div class="thumb"><img src="${srcImg}" alt=""></div>
        <div class="row">
          <button type="button" class="btn-remove" data-del="${img.id}">Remover</button>
          <span class="star ${img.principal ? 'on':''}" data-principal="${img.id}" title="Definir como principal">★</span>
        </div>
      `;
      galeriaAtual.appendChild(card);
    });

    // Evento Remover
    galeriaAtual.querySelectorAll("[data-del]").forEach(b=>{
      b.addEventListener("click", async (ev)=>{
        if(!confirm("Remover imagem?")) return;
        const imgId = ev.currentTarget.getAttribute("data-del");
        const r = await fetch(`${API}/produtos/${id}/imagens/${imgId}`, { method:"DELETE", credentials:"include" });
        if(r.ok) reloadImagens();
        else alert("Erro ao remover");
      });
    });

    // Evento Principal (Estrela)
    galeriaAtual.querySelectorAll("[data-principal]").forEach(s=>{
      s.addEventListener("click", async (ev)=>{
        const imgId = ev.currentTarget.getAttribute("data-principal");
        // Chama API para definir esta como principal
        const r = await fetch(`${API}/produtos/${id}/imagens/${imgId}/principal`, { method:"PATCH", credentials:"include" });
        if(r.ok) reloadImagens();
        else alert("Erro ao definir principal");
      });
    });
  }

  async function reloadImagens() {
      const rr = await fetch(`${API}/produtos/${id}/detalhe`, { credentials:"include" });
      const p = await rr.json();
      renderGaleriaAtual(p.imagens);
  }

  // -------------------- MODAL & NOVAS IMAGENS --------------------
  
  abrirModal?.addEventListener("click", (e)=>{ 
      e.preventDefault(); 
      modal.removeAttribute("hidden"); 
      renderNovas(); 
  });

  fechar?.addEventListener("click", (e)=>{ e.preventDefault(); modal.setAttribute("hidden",""); });
  modal?.addEventListener("click", (e)=>{ if (e.target===modal) modal.setAttribute("hidden",""); });

  addNova?.addEventListener("click", ()=> inputNovas.click());
  
  inputNovas?.addEventListener("change", (e)=>{
    for (const f of e.target.files) novas.push(f);
    // Se for a primeira imagem adicionada, já marca como principal automaticamente
    if (principalIndexNovas === null && novas.length > 0) {
        principalIndexNovas = 0;
    }
    renderNovas();
    e.target.value = "";
  });

  function renderNovas(){
    gridNovas.innerHTML = "";
    
    if (novas.length === 0) {
      gridNovas.innerHTML = '<span class="empty-msg">Nenhuma imagem adicionada ainda.</span>';
      gridNovas.style.justifyContent = "center";
      return;
    }
    
    gridNovas.style.justifyContent = "flex-start";

    novas.forEach((file, idx)=>{
      const url = URL.createObjectURL(file);
      const div = document.createElement("div");
      div.className = "card-img";
      // RESTAURADO: Estrela para novas imagens
      div.innerHTML = `
        <div class="thumb"><img src="${url}" alt=""></div>
        <div class="row">
          <button type="button" class="btn-remove" data-rmv="${idx}">Remover</button>
          <span class="star ${idx===principalIndexNovas ? 'on':''}" data-star="${idx}" title="Esta será a principal">★</span>
        </div>
      `;
      gridNovas.appendChild(div);
    });

    // Remover da lista de upload
    gridNovas.querySelectorAll("[data-rmv]").forEach(b=>{
      b.addEventListener("click",(ev)=>{
        const i = Number(ev.currentTarget.getAttribute("data-rmv"));
        novas.splice(i,1);
        
        // Ajusta o índice da principal se removemos alguma anterior ou a própria
        if (principalIndexNovas === i) principalIndexNovas = null;
        else if (principalIndexNovas > i) principalIndexNovas--;

        // Se ficou sem principal mas tem imagem, marca a primeira
        if (principalIndexNovas === null && novas.length > 0) principalIndexNovas = 0;

        renderNovas();
      });
    });

    // Selecionar principal no upload
    gridNovas.querySelectorAll("[data-star]").forEach(s=>{
      s.addEventListener("click",(ev)=>{
        principalIndexNovas = Number(ev.currentTarget.getAttribute("data-star"));
        renderNovas();
      });
    });
  }

  salvarImgs?.addEventListener("click", async (e)=>{
    e.preventDefault();
    if (!novas.length){ modal.setAttribute("hidden",""); return; }

    const fd = new FormData();
    novas.forEach(f=> fd.append("imagens", f));
    
    // Envia qual index é o principal, se houver
    if (principalIndexNovas !== null) {
        fd.append("principalIndex", String(principalIndexNovas));
    }

    try {
        const r = await fetch(`${API}/produtos/${id}/imagens`, { method:"POST", credentials:"include", body: fd });
        if (!r.ok) throw new Error();
        
        await reloadImagens();
        novas = [];
        principalIndexNovas = null;
        gridNovas.innerHTML="";
        modal.setAttribute("hidden","");
    } catch(err) {
        alert("Falha ao adicionar imagens");
    }
  });

  // -------------------- SALVAR PRODUTO --------------------
  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    
    if (!codigo.value || !nome.value || !valor.value || !quantidade.value) {
      alert("Preencha campos obrigatórios"); return;
    }

    const dados = {
      codigo: codigo.value.trim(),
      nome: nome.value.trim(),
      valor: Number(valor.value),
      quantidade: Number(quantidade.value),
      descricao: descricao.value.trim() || null,
      avaliacao: avaliacao.value ? Number(avaliacao.value) : null,
      ativo: ativo.value === "true"
    };

    try {
        const r = await fetch(`${API}/produtos/${id}`, {
          method:"PUT",
          credentials:"include",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify(dados)
        });
        if (!r.ok) throw new Error();

        alert("Produto salvo!");
        setTimeout(() => location.href = "produto.html", 300);
    } catch(err) {
        alert("Falha ao salvar produto");
    }
  });

  cancelar?.addEventListener("click", (e)=>{
    e.preventDefault();
    location.href="produto.html";
  });
});