// js/login.js
const $ = (sel)=>document.querySelector(sel);

$("#ok").addEventListener("click", async ()=> {
  const email = $("#email").value.trim();
  const senha = $("#senha").value.trim();
  const souCliente = $("#souCliente")?.checked === true;

  $("#msg").textContent = "";
  if(!email || !senha){ $("#msg").textContent = "Preencha e-mail e senha"; return; }

  // Fluxo CLIENTE (local) — não interfere no backend/colaboradores
  if (souCliente) {
    try{
      const r = await window.AuthCliente.signIn(email, senha);
      if (!r.ok) {
        $("#msg").textContent = (r.reason === "EMAIL_NAO_ENCONTRADO")
          ? "Cliente não encontrado. Crie sua conta."
          : "Senha inválida para Cliente.";
        return;
      }
      const param = encodeURIComponent(r.cliente.email);
      location.href = `cliente-home.html?email=${param}`;
      return;
    }catch(_){
      $("#msg").textContent = "Falha no login do cliente.";
      return;
    }
  }

  // Fluxo COLABORADOR (Admin/Estoquista) — exatamente como você já tinha
  try{
    const res = await fetch(`${API}/login`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      credentials:"include",
      body: JSON.stringify({ email, senha })
    });
    if(res.ok){
      const data = await res.json(); // {id, perfil, nome}
      if(data.perfil === "Administrador"){
        location.href = "principal.html";
      } else if(data.perfil === "Estoquista"){
        location.href = "principal-estoque.html";
      } else {
        $("#msg").textContent = "Perfil não reconhecido";
      }
    } else {
      const txt = await res.text();
      $("#msg").textContent = txt || "Falha no login";
    }
  }catch(e){ $("#msg").textContent = "Erro de rede"; }
});

$("#cancel").addEventListener("click", e=>{
  e.preventDefault();
  $("#email").value="";
  $("#senha").value="";
  $("#souCliente").checked = false;
  $("#msg").textContent = "";
});
