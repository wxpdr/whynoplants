/* Lista de produtos para o perfil Estoquista
   Critérios:
   - Ordenação: últimos inseridos (backend já faz por criadoEm DESC)
   - Busca parcial (q por nome/código)
   - 10 por página + paginação
   - Colunas: código, nome, estoque, valor, status
   - Ação permitida: apenas Alterar
*/

const API = (window.API_BASE ?? (location.origin + "/api"));

let pagina = 0;
const tamanho = 10;
let termo = "";

// Guarda/redirect por perfil (opcional, só para UX)
// Se não existir /api/whoami no seu back, pode remover este bloco.
(async function guard(){
  try{
    const r = await fetch(`${API.replace("/api","")}/api/whoami`, { credentials:"include" });
    if (r.ok) {
      const me = await r.json();
      // Se por acaso um Admin abrir essa tela, deixamos, mas o fluxo é para Estoquista
      // Se for outro perfil, volte para o principal do estoque
      if (me && me.perfil && !["Estoquista","Administrador"].includes(me.perfil)) {
        location.href = "principal-estoque.html";
        return;
      }
    }
  } catch(_e) {}
  ligarEventos();
  listar();
})();

function ligarEventos(){
  const $ = (sel)=>document.querySelector(sel);
  $("#btnBuscar").addEventListener("click", onBuscar);
  $("#busca").addEventListener("keydown", (e)=>{ if(e.key==="Enter") onBuscar(); });
  $("#prev").addEventListener("click", ()=>{ pagina = Math.max(0, pagina-1); listar(); });
  $("#next").addEventListener("click", ()=>{ pagina = pagina+1; listar(); });
}

function onBuscar(){
  termo = document.querySelector("#busca").value.trim();
  pagina = 0;
  listar();
}

async function listar(){
  const params = new URLSearchParams({ page: pagina, size: tamanho });
  if (termo) params.set("q", termo);

  const url = `${API}/produtos?${params.toString()}`;
  const r = await fetch(url, { credentials:"include" });
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
          <!-- Estoquista só pode ALTERAR -->
          <a class="btn ghost" href="produto-editar-estoque.html?id=${p.id}">Alterar</a>
        </div>
      </td>`;
    tbody.appendChild(tr);
  }
}

function renderPaginacao(page){
  const info = document.getElementById("infoPag");
  const totalPages = page.totalPages ?? 1;
  const number = (page.number ?? 0) + 1;
  info.textContent = `Página ${number} de ${totalPages}`;
  document.getElementById("prev").disabled = !!page.first;
  document.getElementById("next").disabled = !!page.last;
}

// util anti-XSS
function escapeHtml(s){
  return String(s).replace(/[&<>"'`=\/]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
  }[c]));
}
