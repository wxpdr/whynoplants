const $ = (sel)=>document.querySelector(sel);

$("#ok").addEventListener("click", async ()=> {
  const email = $("#email").value.trim();
  const senha = $("#senha").value.trim();
  $("#msg").textContent = "";
  if(!email || !senha){ $("#msg").textContent = "Preencha e-mail e senha"; return; }

  try{
    const res = await fetch(`${API}/login`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      credentials:"include",
      body: JSON.stringify({ email, senha })
    });
    if(res.ok){ location.href = "principal.html"; }
    else{
      const txt = await res.text();
      $("#msg").textContent = txt || "Falha no login";
    }
  }catch(e){ $("#msg").textContent = "Erro de rede"; }
});

$("#cancel").addEventListener("click", e=>{ e.preventDefault(); $("#email").value=""; $("#senha").value=""; });
