document.addEventListener("DOMContentLoaded", () => {
  const API = (window.API_BASE ?? (location.origin + "/api"));
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const $  = (sel) => document.querySelector(sel);

  const id = Number(qs("id"));
  if (!id) { alert("ID não informado"); location.href="produto.html"; return; }

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

  const modal = $("#modal");
  const abrirModal = $("#abrirModal");
  const fechar = $("#fechar");
  const salvarImgs = $("#salvarImgs");
  const addNova = $("#addNova");
  const inputNovas = $("#inputImgsNovas");
  const gridNovas = $("#gridNovas");

  let novas = []; // File[]
  let principalIndexNovas = null;

  (async function load(){
    const r = await fetch(`${API}/produtos/${id}/detalhe`, { credentials:"include" });
    if (!r.ok) { alert("Não foi possível carregar o produto"); location.href="produto.html"; return; }
    const p = await r.json();

    codigo.value = p.codigo;
    nome.value = p.nome;
    valor.value = p.valor;
    quantidade.value = p.quantidade;
    descricao.value = p.descricao ?? "";
    avaliacao.value = p.avaliacao ?? "";
    ativo.value = String(p.ativo);

    renderGaleriaAtual(p.imagens);
  })();

  function renderGaleriaAtual(imagens){
    galeriaAtual.innerHTML = "";
    imagens.forEach(img => {
      const card = document.createElement("div");
      card.className = "card-img";
      card.innerHTML = `
        <div class="thumb"><img src="${img.arquivo.startsWith('http')? img.arquivo : ('/'+img.arquivo)}" alt=""></div>
        <div class="row">
          <button type="button" class="btn ghost" data-del="${img.id}">Remover</button>
          <span class="star ${img.principal ? 'on':''}" data-principal="${img.id}" title="Definir como principal">★</span>
        </div>
      `;
      galeriaAtual.appendChild(card);
    });

    galeriaAtual.querySelectorAll("[data-del]").forEach(b=>{
      b.addEventListener("click", async (ev)=>{
        const imgId = ev.currentTarget.getAttribute("data-del");
        if (!confirm("Remover esta imagem?")) return;
        const r = await fetch(`${API}/produtos/${id}/imagens/${imgId}`, { method:"DELETE", credentials:"include" });
        if (!r.ok) { alert("Falha ao remover imagem"); return; }
        const rr = await fetch(`${API}/produtos/${id}/detalhe`, { credentials:"include" });
        const p = await rr.json();
        renderGaleriaAtual(p.imagens);
      });
    });

    galeriaAtual.querySelectorAll("[data-principal]").forEach(s=>{
      s.addEventListener("click", async (ev)=>{
        const imgId = ev.currentTarget.getAttribute("data-principal");
        const r = await fetch(`${API}/produtos/${id}/imagens/${imgId}/principal`, { method:"PATCH", credentials:"include" });
        if (!r.ok) { alert("Falha ao marcar principal"); return; }
        const rr = await fetch(`${API}/produtos/${id}/detalhe`, { credentials:"include" });
        const p = await rr.json();
        renderGaleriaAtual(p.imagens);
      });
    });
  }

  // Modal
  abrirModal?.addEventListener("click", (e)=>{ e.preventDefault(); modal.removeAttribute("hidden"); });
  fechar?.addEventListener("click", (e)=>{ e.preventDefault(); modal.setAttribute("hidden",""); });
  modal?.addEventListener("click", (e)=>{ if (e.target===modal) modal.setAttribute("hidden",""); });

  // Novas imagens
  addNova?.addEventListener("click", ()=> inputNovas.click());
  inputNovas?.addEventListener("change", (e)=>{
    for (const f of e.target.files) novas.push(f);
    renderNovas(); e.target.value = "";
  });

  function renderNovas(){
    gridNovas.innerHTML = "";
    novas.forEach((file, idx)=>{
      const url = URL.createObjectURL(file);
      const div = document.createElement("div");
      div.className = "card-img";
      div.innerHTML = `
        <div class="thumb"><img src="${url}" alt=""></div>
        <div class="row">
          <button type="button" class="btn ghost" data-rmv="${idx}">Remover</button>
          <span class="star ${idx===principalIndexNovas ? 'on':''}" data-star="${idx}">★</span>
        </div>
      `;
      gridNovas.appendChild(div);
    });

    gridNovas.querySelectorAll("[data-rmv]").forEach(b=>{
      b.addEventListener("click",(ev)=>{
        const i = Number(ev.currentTarget.getAttribute("data-rmv"));
        novas.splice(i,1);
        if (principalIndexNovas!=null && principalIndexNovas>=novas.length) principalIndexNovas = novas.length? novas.length-1 : null;
        renderNovas();
      });
    });

    gridNovas.querySelectorAll("[data-star]").forEach(s=>{
      s.addEventListener("click",(ev)=>{
        principalIndexNovas = Number(ev.currentTarget.getAttribute("data-star"));
        renderNovas();
      });
    });
  }

  // <<< CORRIGIDO: principalIndex como string simples no FormData
  salvarImgs?.addEventListener("click", async (e)=>{
    e.preventDefault();
    if (!novas.length){ modal.setAttribute("hidden",""); return; }

    const fd = new FormData();
    novas.forEach(f=> fd.append("imagens", f));
    if (principalIndexNovas != null) fd.append("principalIndex", String(principalIndexNovas));

    const r = await fetch(`${API}/produtos/${id}/imagens`, { method:"POST", credentials:"include", body: fd });
    if (!r.ok){
      const txt = await r.text().catch(()=> "");
      console.error("Falha ao adicionar imagens:", r.status, txt);
      alert("Falha ao adicionar imagens");
      return;
    }

    const rr = await fetch(`${API}/produtos/${id}/detalhe`, { credentials:"include" });
    const p = await rr.json();
    renderGaleriaAtual(p.imagens);

    novas = []; principalIndexNovas = null; gridNovas.innerHTML="";
    modal.setAttribute("hidden","");
  });

  // salvar dados do produto
  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const dados = {
      codigo: codigo.value.trim(),
      nome: nome.value.trim(),
      valor: Number(valor.value),
      quantidade: Number(quantidade.value),
      descricao: descricao.value.trim() || null,
      avaliacao: avaliacao.value ? Number(avaliacao.value) : null,
      ativo: ativo.value === "true"
    };
    if (!dados.codigo || !dados.nome || isNaN(dados.valor) || isNaN(dados.quantidade)) { alert("Preencha Código, Nome, Preço e Estoque."); return; }
    if (dados.descricao && dados.descricao.length>2000){ alert("Descrição até 2000 caracteres."); return; }
    if (dados.avaliacao && (dados.avaliacao<1 || dados.avaliacao>5)){ alert("Avaliação entre 1 e 5."); return; }

    const r = await fetch(`${API}/produtos/${id}`, {
      method:"PUT", credentials:"include",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(dados)
    });
    if (!r.ok){ alert("Falha ao salvar alterações"); return; }
    location.href = "produto.html";
  });

  cancelar?.addEventListener("click", (e)=>{ e.preventDefault(); location.href="produto.html"; });
});
