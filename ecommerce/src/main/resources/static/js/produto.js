/* Produto - Listagem Geral (Sem filtro de status) */

const API = (window.API_BASE ?? (location.origin + "/api"));

let pagina = 0;
const tamanho = 10;
let termo = "";
// Removido: let apenasAtivos = true;

// Modal refs
const confirmModal = document.getElementById("confirmModal");
const confirmTitulo = document.getElementById("confirmTitulo");
const confirmMensagem = document.getElementById("confirmMensagem");
const btnCancelarConfirm = document.getElementById("btnCancelarConfirm");
const btnConfirmar = document.getElementById("btnConfirmar");
let _acaoPendente = null; 

(async function guard(){
  try{
    const r = await fetch(`${API.replace("/api","")}/api/whoami`, { credentials:"include" });
    if(r.ok){
      const me = await r.json();
      if (me && me.perfil && me.perfil !== "Administrador") {
        location.href = "principal-estoque.html";
        return;
      }
    }
  }catch(_e){}
  ligarEventos();
  listar();
})();

function ligarEventos(){
  const $ = (sel)=>document.querySelector(sel);
  $("#btnBuscar").addEventListener("click", onBuscar);
  $("#busca").addEventListener("keydown", (e)=>{ if(e.key==="Enter") onBuscar(); });
  $("#prev").addEventListener("click", ()=>{ pagina = Math.max(0, pagina-1); listar(); });
  $("#next").addEventListener("click", ()=>{ pagina = pagina+1; listar(); });
  
  // Removido listener do filtroAtivos

  // Eventos do modal
  btnCancelarConfirm?.addEventListener("click", fecharConfirmacao);
  confirmModal?.addEventListener("click", (e)=>{ if (e.target === confirmModal) fecharConfirmacao(); });
  btnConfirmar?.addEventListener("click", async ()=>{
    if (!_acaoPendente) return;
    const { id, vaiAtivar } = _acaoPendente;
    await efetivarToggle(id, vaiAtivar);
    fecharConfirmacao();
  });
}

function onBuscar(){
  termo = document.querySelector("#busca").value.trim();
  pagina = 0;
  listar();
}

async function listar(){
  const params = new URLSearchParams({ page: pagina, size: tamanho });
  if (termo) params.set("q", termo);
  
  // Removido: if (apenasAtivos) params.set("ativo", true);
  // Ao não enviar o param "ativo", o backend deve retornar todos.

  const r = await fetch(`${API}/produtos?${params.toString()}`, { credentials:"include" });
  if (!r.ok) { alert("Falha ao carregar produtos"); return; }
  const page = await r.json();
  renderTabela(page.content ?? []);
  renderPaginacao(page);
}

function renderTabela(items){
  const tbody = document.querySelector("#tabela tbody");
  tbody.innerHTML = "";
  for (const p of items){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(p.codigo)}</td>
      <td>${escapeHtml(p.nome)}</td>
      <td>${p.quantidade}</td>
      <td>${Number(p.valor).toFixed(2)}</td>
      <td><span class="badge ${p.ativo ? 'on':'off'}">${p.ativo ? 'Ativo':'Inativo'}</span></td>
      <td class="col-acoes">
        <div class="row-actions">
          <a class="btn ghost" href="produto-visualizar.html?id=${p.id}">Visualizar</a>
          <a class="btn ghost" href="produto-editar.html?id=${p.id}">Alterar</a>
          <button class="btn ghost" data-toggle="${p.id}" data-nome="${escapeHtml(p.nome)}" data-ativo="${p.ativo}">
            ${p.ativo ? 'Inativar':'Reativar'}
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll("button[data-toggle]").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const id = Number(e.currentTarget.getAttribute("data-toggle"));
      const nome = e.currentTarget.getAttribute("data-nome");
      const ativo = e.currentTarget.getAttribute("data-ativo") === "true";
      abrirConfirmacao({ id, vaiAtivar: !ativo, nome });
    });
  });
}

function renderPaginacao(page){
  const info = document.getElementById("infoPag");
  const totalPages = page.totalPages ?? 1;
  const number = (page.number ?? 0) + 1;
  info.textContent = `Página ${number} de ${totalPages}`;
  document.getElementById("prev").disabled = !!page.first;
  document.getElementById("next").disabled = !!page.last;
}

// ===== Confirmação =====
function abrirConfirmacao({ id, vaiAtivar, nome }) {
  _acaoPendente = { id, vaiAtivar };
  confirmTitulo.textContent = vaiAtivar ? "Ativar produto" : "Inativar produto";
  confirmMensagem.textContent = `Você confirma ${vaiAtivar ? "ativar" : "inativar"} o produto "${nome}"?`;
  confirmModal.removeAttribute("hidden");
}
function fecharConfirmacao() {
  confirmModal.setAttribute("hidden", "");
  _acaoPendente = null;
}

async function efetivarToggle(id, vaiAtivar){
  const url = `${API}/produtos/${id}/${vaiAtivar ? 'ativar' : 'inativar'}`;
  const r = await fetch(url, { method:"PATCH", credentials:"include" });
  if (!r.ok){
    alert("Falha ao alterar status do produto");
    return;
  }
  listar(); 
}

function escapeHtml(s){
  return String(s).replace(/[&<>"'`=\/]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
  }[c]));
}

// Guarda admin
(async function guardaAdmin(){
  try{
    const r = await fetch("/api/whoami", { credentials:"include" });
    if (r.ok){
      const me = await r.json();
      if (me && me.perfil === "Estoquista") {
        location.href = "estoque-produto.html";
        return;
      }
    }
  }catch(_){}
})();