(async ()=>{
  const $ = (s)=>document.querySelector(s);

  // Checa sessão
  try{
    const r = await fetch(`${API}/me`, { credentials:"include" });
    if(!r.ok){ location.href="login.html"; return; }
    const id = await r.json?.() ?? null;

    // (Opcional) dá um ping no servidor pra descobrir perfil via endpoint próprio
    // Como /me retorna só id (no seu back), tentamos um "whoami" leve se quiser no futuro.
    // Por enquanto, só mostra uma mensagem simples:
    $("#welcome").textContent = `ID: ${id}`;
  }catch{
    location.href="login.html"; return;
  }

  // Logout
  $("#logout")?.addEventListener("click", async ()=>{
    try{
      await fetch(`${API}/logout`, { method:"POST", credentials:"include" });
    }catch{}
    location.href="login.html";
  });
})();
