// js/auth.js
window.Auth = (() => {
  async function whoami() {
    try {
      const r = await fetch(`${API}/whoami`, { credentials: "include" });
      if (!r.ok) return null;
      return await r.json(); // { id, nome, perfil }
    } catch {
      return null;
    }
  }

  async function ensureLoggedIn() {
    const me = await whoami();
    if (!me) { location.href = "login.html"; return null; }
    return me;
  }

  async function ensureAdmin() {
    const me = await ensureLoggedIn();
    if (!me) return null;
    if (me.perfil !== "Administrador") { location.href = "principal-estoque.html"; return null; }
    return me;
  }

  async function ensureRole(role) {
    const me = await ensureLoggedIn();
    if (!me) return null;
    if (me.perfil !== role) {
      location.href = role === "Administrador" ? "principal.html" : "principal-estoque.html";
      return null;
    }
    return me;
  }

  // Evita que a página volte do histórico “congelada” (bfcache)
  function preventBfcache() {
    window.onpageshow = (e) => { if (e.persisted) location.reload(); };
  }

  async function redirectHomeByPerfil() {
    const me = await whoami();
    if (!me) { location.href = "login.html"; return; }
    if (me.perfil === "Administrador") location.href = "principal.html";
    else location.href = "principal-estoque.html";
  }

  return { whoami, ensureLoggedIn, ensureAdmin, ensureRole, preventBfcache, redirectHomeByPerfil };
})();

async function redirectHomeByPerfil() {
  try{
    const r = await fetch("/api/whoami", { credentials:"include" });
    if (!r.ok) return;
    const me = await r.json();
    if (!me || !me.perfil) return;

    // Se estiver na home errada, redireciona
    if (location.pathname.endsWith("/principal.html") && me.perfil === "Estoquista") {
      location.href = "principal-estoque.html";
    }
    if (location.pathname.endsWith("/principal-estoque.html") && me.perfil === "Administrador") {
      location.href = "principal.html";
    }
  }catch(_){}
}

redirectHomeByPerfil();
