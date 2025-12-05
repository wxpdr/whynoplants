(async ()=>{
  const $ = (s)=>document.querySelector(s);
  
  // Usa o API definido no HTML ou fallback para localhost:8080
  const API = window.API || "http://localhost:8080";

  // 1. Verifica Sessão
  try {
    const r = await fetch(`${API}/me`, { credentials:"include" });
    
    // Se der erro (401/403), manda pro login
    if(!r.ok){ 
      console.warn("Sessão inválida, redirecionando...");
      location.href="login.html"; 
      return; 
    }
    
    // Se passar, pega o nome
    const user = await r.json();
    const display = user.nome ? user.nome : (user.id ? `ID: ${user.id}` : "Admin");
    
    if($("#welcome")) $("#welcome").textContent = `Olá, ${display}`;

  } catch(e) {
    console.error("Erro ao verificar sessão:", e);
    // Se der erro de rede (API desligada), manda pro login tbm
    location.href="login.html"; 
    return;
  }

  // 2. Logout (Único botão)
  $("#logout")?.addEventListener("click", async ()=>{
    try{
      await fetch(`${API}/logout`, { method:"POST", credentials:"include" });
    } catch{}
    location.href="login.html";
  });
})();