// static/js/cliente-cadastrar.js
(() => {
  // ---------------- utils ----------------
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const onlyDigits = (s) => (s || "").replace(/\D/g, "");
  const up = (s) => (s || "").toUpperCase().trim();

  function splitNome(nome) {
    const parts = (nome || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { primeiro: "", sobrenome: "" };
    if (parts.length === 1) return { primeiro: parts[0], sobrenome: parts[0] };
    return { primeiro: parts[0], sobrenome: parts.slice(1).join(" ") };
  }

  async function viaCep(cepStr) {
    const cep = onlyDigits(cepStr);
    if (cep.length !== 8) return null;
    const r = await fetch(`/clientes/viacep/${cep}`);
    if (!r.ok) return null;
    return r.json();
  }

  // --------------- coleta dados ---------------
  function getFat() {
    return {
      cep: $("#fat_cep").value,
      logradouro: $("#fat_logradouro").value,
      numero: $("#fat_numero").value,
      complemento: $("#fat_complemento").value,
      bairro: $("#fat_bairro").value,
      cidade: $("#fat_cidade").value,
      uf: up($("#fat_uf").value),
      tipo: "FATURAMENTO",
    };
  }

  function getEntregas() {
    const lista = [];
    $$("#listaEntrega .endereco").forEach((card) => {
      lista.push({
        cep: $(".ent_cep", card).value,
        logradouro: $(".ent_logradouro", card).value,
        numero: $(".ent_numero", card).value,
        complemento: $(".ent_complemento", card).value,
        bairro: $(".ent_bairro", card).value,
        cidade: $(".ent_cidade", card).value,
        uf: up($(".ent_uf", card).value),
        tipo: "ENTREGA",
      });
    });
    return lista;
  }

  function montarPayload() {
    const { primeiro, sobrenome } = splitNome($("#nome").value);
    const generoEnum = $("#genero").value || "NAO_INFORMAR"; // value já vem correto do HTML

    const faturamento = getFat();
    const entregas = getEntregas();

    return {
      primeiroNome: primeiro,
      sobrenome: sobrenome,
      email: $("#email").value.trim(),
      senha: $("#senha").value,
      cpf: onlyDigits($("#cpf").value), // <<< AQUI: envia só dígitos
      dataNascimento: $("#nascimento").value || null,
      genero: generoEnum, // FEMININO | MASCULINO | NAO_INFORMAR | OUTRO
      enderecos: [faturamento, ...entregas],
      copiarEnderecoEntrega: entregas.length === 0, // se não houver entrega, copiar do faturamento
    };
  }

  // --------------- UI / comportamento ---------------
  async function bindCepAutoFillFat() {
    $("#fat_cep").addEventListener("blur", async () => {
      const data = await viaCep($("#fat_cep").value);
      if (!data) return;
      $("#fat_logradouro").value = data.logradouro || "";
      $("#fat_bairro").value = data.bairro || "";
      $("#fat_cidade").value = data.localidade || "";
      $("#fat_uf").value = (data.uf || "").toUpperCase();
    });
  }

  function addEntregaCard(prefill) {
    const tpl = $("#tplEndereco");
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector(".endereco");

    // CEP autofill individual
    $(".ent_cep", card).addEventListener("blur", async () => {
      const data = await viaCep($(".ent_cep", card).value);
      if (!data) return;
      $(".ent_logradouro", card).value = data.logradouro || "";
      $(".ent_bairro", card).value = data.bairro || "";
      $(".ent_cidade", card).value = data.localidade || "";
      $(".ent_uf", card).value = (data.uf || "").toUpperCase();
    });

    // Remover card
    $(".removerEndereco", card).addEventListener("click", () => {
      card.remove();
    });

    // Preenchimento inicial (quando copiar do faturamento)
    if (prefill) {
      $(".ent_cep", card).value = prefill.cep || "";
      $(".ent_logradouro", card).value = prefill.logradouro || "";
      $(".ent_numero", card).value = prefill.numero || "";
      $(".ent_complemento", card).value = prefill.complemento || "";
      $(".ent_bairro", card).value = prefill.bairro || "";
      $(".ent_cidade", card).value = prefill.cidade || "";
      $(".ent_uf", card).value = up(prefill.uf || "");
    }

    $("#listaEntrega").appendChild(card);
  }

  function bindButtons() {
    // copiar faturamento → adiciona uma entrega pré-preenchida
    $("#copiarFaturamento").addEventListener("click", () => {
      addEntregaCard(getFat());
    });

    // adicionar entrega em branco
    $("#novoEndereco").addEventListener("click", () => {
      addEntregaCard(null);
    });
  }

  function formatValidationMessage(msg) {
    if (!msg) return "Erro no cadastro. Verifique os campos.";

    // tira colchetes [ ... ]
    msg = String(msg);
    if (msg.startsWith("[") && msg.endsWith("]")) {
      msg = msg.slice(1, -1);
    }

    // quebra em itens se tiver vários campos
    const parts = msg.split(",").map(s => s.trim()).filter(Boolean);

    if (parts.length > 1) {
      // vira lista bonitinha:
      return "Corrija os seguintes campos:\n- " + parts.join("\n- ");
    }

    const lower = msg.toLowerCase();

    if (lower.includes("cpf")) {
      return "CPF inválido. Verifique os números digitados.";
    }
    if (lower.includes("cep")) {
      return "CEP inválido. Verifique o endereço informado.";
    }
    if (lower.includes("e-mail") || lower.includes("email")) {
      return "E-mail inválido. Verifique o endereço informado.";
    }

    return msg;
  }

  // --------------- submissão ---------------
  async function cadastrarCliente(payload) {
    let msg = "Erro no cadastro. Verifique os campos.";

    try {
      const res = await fetch("/clientes/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201 || res.ok) {
        alert('Conta criada com sucesso! 🎉');
        window.location.href = '/login.html';
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        msg = j.message || j.error || msg;
      } else {
        const t = await res.text();
        if (t) msg = t;
      }
    } catch (e) {
      console.error(e);
      // mantém msg padrão se der erro inesperado
    }

    msg = formatValidationMessage(msg);
    alert(msg);
  }

  function validateFront(payload) {
    if (!$("#aceite").checked) {
      alert("Confirme que os dados estão corretos.");
      return false;
    }
    if (!payload.primeiroNome || payload.primeiroNome.length < 3 ||
        !payload.sobrenome || payload.sobrenome.length < 3) {
      alert("Informe nome e sobrenome (mínimo 3 letras cada).");
      return false;
    }
    if (!payload.email || !payload.senha || !payload.cpf) {
      alert("Preencha e-mail, senha e CPF.");
      return false;
    }
    // UF com 2 letras quando preenchido
    if ($("#fat_uf").value && up($("#fat_uf").value).length !== 2) {
      alert("UF do faturamento deve ter 2 letras.");
      return false;
    }
    // CEP com 8 dígitos (backend valida também)
    const cepFat = onlyDigits($("#fat_cep").value);
    if (cepFat.length !== 8) {
      alert("CEP do faturamento deve ter 8 dígitos.");
      return false;
    }
    return true;
  }

  function bindSubmit() {
    $("#formCadastro").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = montarPayload();

      if (!validateFront(payload)) return;

      await cadastrarCliente(payload);
    });
  }

  // --------------- init ---------------
  document.addEventListener("DOMContentLoaded", () => {
    bindCepAutoFillFat();
    bindButtons();
    bindSubmit();
  });
})();
