const $ = (s)=>document.querySelector(s);
const gridBody = $("#grid tbody");
const dlg = $("#dlg");
let editId = null;

(async ()=>{
  // Guard simples: se não tiver sessão, volta pro login
  try{
    const r = await fetch(`${API}/me`, { credentials:"include" });
    if(!r.ok){ location.href="login.html"; return; }
  }catch{ location.href="login.html"; return; }
})();

async function listar(nome=""){
  const url = nome ? `${API}/api/usuarios?nome=${encodeURIComponent(nome)}` : `${API}/api/usuarios`;
  const res = await fetch(url, { credentials:"include" });
  if(!res.ok){ $("#msg").textContent = await res.text(); return; }
  const data = await res.json();
  render(data);
}

function render(lista){
  gridBody.innerHTML = "";
  for(const u of lista){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.email||""}</td>
      <td><span class="badge ${u.ativo?'on':'off'}">${u.ativo?'Ativo':'Inativo'}</span></td>
      <td>${u.perfil || "-"}</td>
      <td><button class="btn" data-edit="${u.id}">Alterar</button></td>
      <td><button class="btn" data-toggle="${u.id}">${u.ativo?'Inativar':'Ativar'}</button> <button class="btn ghost" data-del="${u.id}">Excluir</button></td>
    `;
    gridBody.appendChild(tr);
  }

  gridBody.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-edit");
      const res = await fetch(`${API}/api/usuarios/${id}`, { credentials:"include" });
      if(!res.ok){ alert(await res.text()); return; }
      const u = await res.json();
      editId = u.id;
      $("#dlgTitle").textContent = `Editar usuário #${u.id}`;
      $("#u-id").value = u.id;
      $("#u-nome").value = u.nome || "";
      $("#u-cpf").value = u.cpf || "";
      $("#u-email").value = u.email || "";
      $("#u-perfil").value = u.perfil || "Administrador";
      $("#u-nova").value = "";
      $("#u-confirma").value = "";
      $("#msg").textContent = "";
      dlg.showModal();
    });
  });

  gridBody.querySelectorAll("[data-toggle]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-toggle");
      if(!confirm("Confirmar alteração de status?")) return;
      const res = await fetch(`${API}/api/usuarios/${id}/toggle`, { method:"PATCH", credentials:"include" });
      if(!res.ok){ alert(await res.text()); return; }
      listar($("#busca").value.trim());
    });
  });

  gridBody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("Excluir usuário?")) return;
      const res = await fetch(`${API}/api/usuarios/${id}`, { method:"DELETE", credentials:"include" });
      if(!res.ok){ alert(await res.text()); return; }
      listar($("#busca").value.trim());
    });
  });
}

$("#btnNovo").addEventListener("click", ()=>{
  editId = null;
  $("#dlgTitle").textContent = "Novo usuário";
  $("#u-id").value = "";
  $("#u-nome").value = "";
  $("#u-cpf").value  = "";
  $("#u-email").value= "";
  $("#u-perfil").value = "Administrador";
  $("#u-nova").value = "";
  $("#u-confirma").value = "";
  $("#msg").textContent = "";
  dlg.showModal();
});

$("#okDlg").addEventListener("click", async (e)=>{
  e.preventDefault();
  $("#msg").textContent = "";
  try{
    const body = {
      nome:  $("#u-nome").value.trim(),
      cpf:   $("#u-cpf").value.trim(),
      email: $("#u-email").value.trim(),
      perfil:$("#u-perfil").value
    };

    if(editId==null){
      const senha = $("#u-nova").value;
      const confirma = $("#u-confirma").value;
      if(!senha){ $("#msg").textContent = "Informe uma senha para criar"; return; }
      if(senha !== confirma){ $("#msg").textContent = "As senhas não conferem"; return; }
      const res = await fetch(`${API}/api/usuarios`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        credentials:"include",
        body: JSON.stringify({ ...body, senha })
      });
      if(!res.ok){ $("#msg").textContent = await res.text(); return; }
    }else{
      const novaSenha = $("#u-nova").value; // opcional no update
      const res = await fetch(`${API}/api/usuarios/${editId}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        credentials:"include",
        body: JSON.stringify({ nome:body.nome, cpf:body.cpf, perfil:body.perfil, novaSenha })
      });
      if(!res.ok){ $("#msg").textContent = await res.text(); return; }
    }
    dlg.close();
    listar($("#busca").value.trim());
  }catch{ $("#msg").textContent = "Erro de rede"; }
});

$("#cancelDlg").addEventListener("click", e=>{ e.preventDefault(); dlg.close(); });

$("#btnBuscar").addEventListener("click", ()=> listar($("#busca").value.trim()));
$("#busca").addEventListener("keydown",(e)=>{ if(e.key==="Enter") $("#btnBuscar").click(); });

document.getElementById("logout")?.addEventListener("click", async ()=>{
  try{ await fetch(`${API}/logout`, { method:"POST", credentials:"include" }); }catch{}
  location.href="login.html";
});

listar();
