// Checagem leve de sessão (opcional)
(async ()=>{
  try{
    const r = await fetch(`${API}/me`, { credentials:"include" });
    if(!r.ok) console.log("Sem sessão (ok por enquanto).");
  }catch{}
})();
