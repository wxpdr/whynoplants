(() => {
  const API = ""; 
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  // Elementos
  const formPerfil = $("#formPerfil");
  const formSenha = $("#formSenha");
  const formEndereco = $("#formEndereco");
  const boxEnderecos = $("#enderecos");

  const inpNome = $("#primeiroNome");
  const inpSobrenome = $("#sobrenome");
  const inpNascimento = $("#nascimento");
  const selGenero = $("#genero");

  const eCEP = $("#e_cep");
  const eNumero = $("#e_numero");
  const eLogradouro = $("#e_logradouro");
  const eCompl = $("#e_complemento");
  const eBairro = $("#e_bairro");
  const eCidade = $("#e_cidade");
  const eUF = $("#e_uf");

  let USER_ID = null;

  function toast(msg) { alert(msg); }
  function onlyDigits(s) { return (s || "").replace(/\D+/g, ""); }

  async function fetchJson(url, opts = {}) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...opts,
    });
    if (res.status === 204) return null;
    
    let data;
    const text = await res.text();
    try { data = JSON.parse(text); } catch { data = { message: text }; }

    if (!res.ok) throw new Error(data.message || "Erro na requisição");
    return data;
  }

  // --- RENDER (AJUSTADO PARA NOVO CSS) ---
  function buildEnderecoLinha(e) {
    const div = document.createElement("div");
    div.className = "addr-item";
    
    // Badge "Pílula"
    const badge = e.padrao ? '<span class="badge-default">Padrão</span>' : '';
    
    // Botão ou Texto de Status
    const btnAction = e.padrao 
        ? '<span style="font-size:0.85rem; color:#4CAF50; font-weight:600;">Endereço Atual</span>'
        : `<button type="button" class="btn ghost" data-acao="padrao" data-id="${e.id}">Tornar Padrão</button>`;

    div.innerHTML = `
      <div class="addr-info">
        <div class="addr-header">
            <strong>${e.logradouro}, ${e.numero}</strong>
            ${badge}
        </div>
        <span class="addr-details">${e.bairro} • ${e.cidade}/${e.uf} • CEP ${e.cep}</span>
      </div>
      <div>
        ${btnAction}
      </div>
    `;
    return div;
  }

  // --- LOAD ---
  async function loadMe() {
    const me = await fetchJson(`${API}/whoami`);
    USER_ID = me.id;
  }

  async function loadPerfil() {
    const d = await fetchJson(`${API}/clientes/${USER_ID}`);
    inpNome.value = d.primeiroNome || "";
    inpSobrenome.value = d.sobrenome || "";
    inpNascimento.value = d.dataNascimento || "";
    selGenero.value = d.genero || "NAO_INFORMAR";
  }

  async function loadEnderecos() {
    boxEnderecos.innerHTML = "";
    try {
        const lista = await fetchJson(`${API}/clientes/${USER_ID}/enderecos`);
        if (!lista || !lista.length) {
            boxEnderecos.innerHTML = `<div style="color:#888; font-style:italic">Nenhum endereço cadastrado.</div>`;
            return;
        }
        // Ordena padrão primeiro
        lista.sort((a,b) => (b.padrao === true) - (a.padrao === true));
        
        for (const e of lista) boxEnderecos.appendChild(buildEnderecoLinha(e));
    } catch(err) {
        boxEnderecos.innerHTML = "Erro ao carregar endereços.";
    }
  }

  // --- ACTIONS ---
  formPerfil?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const body = {
      primeiroNome: inpNome.value.trim(),
      sobrenome: inpSobrenome.value.trim(),
      dataNascimento: inpNascimento.value,
      genero: selGenero.value,
    };
    try {
      await fetchJson(`${API}/clientes/${USER_ID}`, { method: "PUT", body: JSON.stringify(body) });
      toast("Dados atualizados!");
    } catch (e) { toast(e.message); }
  });

  formSenha?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const senhaAtual = $("#senhaAtual").value;
    const novaSenha = $("#novaSenha").value;
    if (!senhaAtual || !novaSenha) { toast("Preencha as senhas."); return; }
    try {
      await fetchJson(`${API}/clientes/${USER_ID}/senha`, {
        method: "PUT",
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      $("#senhaAtual").value = "";
      $("#novaSenha").value = "";
      toast("Senha alterada!");
    } catch (e) { toast(e.message); }
  });

  eCEP?.addEventListener("blur", async () => {
    const cep = onlyDigits(eCEP.value);
    if (cep.length !== 8) return;
    try {
      const r = await fetchJson(`${API}/clientes/viacep/${cep}`);
      if (!eLogradouro.value) eLogradouro.value = r.logradouro || "";
      if (!eBairro.value) eBairro.value = r.bairro || "";
      if (!eCidade.value) eCidade.value = r.localidade || "";
      if (!eUF.value) eUF.value = r.uf || "";
    } catch {}
  });

  formEndereco?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const body = {
      tipo: "ENTREGA",
      cep: onlyDigits(eCEP.value),
      logradouro: eLogradouro.value.trim(),
      numero: eNumero.value.trim(),
      complemento: eCompl.value.trim(),
      bairro: eBairro.value.trim(),
      cidade: eCidade.value.trim(),
      uf: eUF.value.trim().toUpperCase(),
    };
    try {
      await fetchJson(`${API}/clientes/${USER_ID}/enderecos`, { method: "POST", body: JSON.stringify(body) });
      formEndereco.reset();
      await loadEnderecos();
      toast("Endereço adicionado!");
    } catch (e) { toast(e.message); }
  });

  boxEnderecos?.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("[data-acao='padrao']");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    try {
      await fetchJson(`${API}/clientes/enderecos/${id}/padrao`, { method: "PUT" });
      await loadEnderecos();
      toast("Endereço padrão atualizado.");
    } catch (e) { toast(e.message); }
  });

  (async function init() {
    try {
      await loadMe();
      await loadPerfil();
      await loadEnderecos();
    } catch (e) {
      if (/401/.test(e.message)) location.href = "login.html";
    }
  })();
})();