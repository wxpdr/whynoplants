const $ = (sel)=>document.querySelector(sel);

$("#ok").addEventListener("click", async ()=> {
  const email = $("#email").value.trim();
  const senha = $("#senha").value.trim();
  $("#msg").textContent = "";
  if(!email || !senha){ $("#msg").textContent = "Preencha e-mail e senha"; return; }

  try{
    const res = await fetch(`/login`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      credentials:"include",
      body: JSON.stringify({ email, senha })
    });
    if(res.ok){
      const data = await res.json(); // {id, perfil, nome, redirect}
      if (data.redirect) {
        location.href = data.redirect;
        return;
      }
      // fallback por perfil
      if(data.perfil === "Administrador"){
        location.href = "principal.html";
      } else if(data.perfil === "Estoquista"){
        location.href = "principal-estoque.html";
      } else if(data.perfil === "Cliente"){
        location.href = "principal-cliente.html";
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
});
