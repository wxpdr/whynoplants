// js/cliente-editar.js
(() => {
  const API = ""; // mesmo host
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // elements
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

  // -------------- helpers
  function toast(msg) {
    alert(msg); // simples; se quiser, troca depois por um toast bonitinho
  }

  function onlyDigits(s) {
    return (s || "").replace(/\D+/g, "");
  }

  function formatDateISOToInput(iso) {
    // espera "YYYY-MM-DD"
    return iso || "";
  }

  function formatValidationMessage(msg) {
    if (!msg) return "Erro na requisição. Verifique os dados.";

    msg = String(msg);

    // se vier no formato [campo: erro, campo2: erro]
    if (msg.startsWith("[") && msg.endsWith("]")) {
      msg = msg.slice(1, -1);
    }

    const parts = msg.split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      return "Corrija os seguintes campos:\n- " + parts.join("\n- ");
    }

    const lower = msg.toLowerCase();

    if (lower.includes("cpf")) {
      return "CPF inválido. Verifique os dígitos.";
    }
    if (lower.includes("e-mail") || lower.includes("email")) {
      return "E-mail inválido. Verifique o endereço informado.";
    }
    if (lower.includes("cep")) {
      return "CEP inválido. Verifique o endereço.";
    }
    if (lower.includes("senha atual")) {
      // caso o back mande algo tipo "Senha atual incorreta"
      return msg;
    }

    return msg;
  }

  async function fetchJson(url, opts = {}) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      credentials: "include",
      ...opts,
    });

    if (res.status === 204) return null;

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      const raw = data?.message || data?.error || text || "Erro na requisição";
      const msg = formatValidationMessage(raw);
      throw new Error(msg);
    }

    return data;
  }

  function buildEnderecoLinha(e) {
    const div = document.createElement("div");
    div.className = "addr";
    div.innerHTML = `
      <div>
        <strong>${e.logradouro}, ${e.numero}</strong>
        <div class="muted">${e.bairro} • ${e.cidade}/${e.uf} • CEP ${e.cep}</div>
      </div>
      <div>
        <button type="button" class="btn ghost" data-acao="padrao" data-id="${e.id}">Tornar padrão</button>
      </div>
    `;
    return div;
  }

  // -------------- load
  async function loadMe() {
    const me = await fetchJson(`${API}/whoami`);
    USER_ID = me.id;
  }

  async function loadPerfil() {
    const d = await fetchJson(`${API}/clientes/${USER_ID}`);
    inpNome.value = d.primeiroNome || "";
    inpSobrenome.value = d.sobrenome || "";
    inpNascimento.value = formatDateISOToInput(d.dataNascimento); // já vem YYYY-MM-DD
    selGenero.value = d.genero || "NAO_INFORMAR";
  }

  async function loadEnderecos() {
    boxEnderecos.innerHTML = "";
    const lista = await fetchJson(`${API}/clientes/${USER_ID}/enderecos`);
    if (!lista || !lista.length) {
      boxEnderecos.innerHTML = `<div class="muted">Nenhum endereço de entrega cadastrado.</div>`;
      return;
    }
    for (const e of lista) boxEnderecos.appendChild(buildEnderecoLinha(e));
  }

  // -------------- actions
  // salvar perfil
  formPerfil?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const body = {
      primeiroNome: inpNome.value.trim(),
      sobrenome: inpSobrenome.value.trim(),
      dataNascimento: inpNascimento.value, // YYYY-MM-DD
      genero: selGenero.value,
    };
    try {
      await fetchJson(`${API}/clientes/${USER_ID}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      toast("Dados atualizados!");
    } catch (e) {
      toast(e.message);
    }
  });

  // alterar senha
  formSenha?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const senhaAtual = $("#senhaAtual").value;
    const novaSenha = $("#novaSenha").value;
    if (!senhaAtual || !novaSenha) {
      toast("Preencha as senhas.");
      return;
    }
    try {
      await fetchJson(`${API}/clientes/${USER_ID}/senha`, {
        method: "PUT",
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      $("#senhaAtual").value = "";
      $("#novaSenha").value = "";
      toast("Senha alterada com sucesso!");
    } catch (e) {
      toast(e.message);
    }
  });

  // auto-CEP
  eCEP?.addEventListener("blur", async () => {
    const cep = onlyDigits(eCEP.value);
    if (cep.length !== 8) return;
    try {
      const r = await fetchJson(`${API}/clientes/viacep/${cep}`);
      // só preenche se vazio (permite sobrescrever)
      if (!eLogradouro.value) eLogradouro.value = r.logradouro || "";
      if (!eBairro.value) eBairro.value = r.bairro || "";
      if (!eCidade.value) eCidade.value = r.localidade || "";
      if (!eUF.value) eUF.value = r.uf || "";
    } catch {
      // ignora: usuário pode digitar manualmente
    }
  });

  // adicionar endereço
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
    if (!body.cep || body.cep.length !== 8) {
      toast("CEP inválido.");
      return;
    }
    if (!body.numero) {
      toast("Informe o número.");
      return;
    }

    try {
      await fetchJson(`${API}/clientes/${USER_ID}/enderecos`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      // limpa o formulário e recarrega a lista
      formEndereco.reset();
      await loadEnderecos();
      toast("Endereço adicionado!");
    } catch (e) {
      toast(e.message);
    }
  });

  // tornar padrão
  boxEnderecos?.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("[data-acao='padrao']");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    try {
      await fetchJson(`${API}/clientes/enderecos/${id}/padrao`, { method: "PUT" });
      toast("Endereço definido como padrão!");
      await loadEnderecos();
    } catch (e) {
      toast(e.message);
    }
  });

  // -------------- boot
  (async function init() {
    try {
      await loadMe();
      await loadPerfil();
      await loadEnderecos();
    } catch (e) {
      if (/401|não autenticado|nao autenticado/i.test(e.message)) {
        location.href = "login.html";
      } else {
        toast(e.message);
      }
    }
  })();
})();
