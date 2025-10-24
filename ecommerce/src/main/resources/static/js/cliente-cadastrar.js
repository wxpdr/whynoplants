// ===== Helpers de DOM
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const form = $('#formCadastro');
const listaEntrega = $('#listaEntrega');
const tplEndereco = $('#tplEndereco');

// ===== ViaCEP (autofill + validação simples)
async function viaCEP(cep) {
  cep = (cep || '').replace(/\D/g, '');
  if (cep.length !== 8) throw new Error('CEP inválido');
  const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const j = await r.json();
  if (j.erro) throw new Error('CEP não encontrado');
  return j; // {logradouro, bairro, localidade, uf, ...}
}

function maskCEP(v) {
  v = (v || '').replace(/\D/g, '').slice(0,8);
  if (v.length > 5) v = v.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
  return v;
}

function maskCPF(v) {
  v = (v || '').replace(/\D/g, '').slice(0,11);
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (m,a,b,c,d)=> d ? `${a}.${b}.${c}-${d}` : `${a}.${b}.${c}`);
}

// ===== Validações
function nomeValido(nome) {
  const partes = (nome || '').trim().split(/\s+/);
  if (partes.length < 2) return false;
  return partes.every(p => p.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g,'').length >= 3);
}

function cpfValido(cpf) {
  cpf = (cpf || '').replace(/\D/g, '');
  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i=0;i<9;i++) soma += parseInt(cpf.charAt(i))*(10-i);
  let resto = 11 - (soma%11); if (resto>=10) resto=0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i=0;i<10;i++) soma += parseInt(cpf.charAt(i))*(11-i);
  resto = 11 - (soma%11); if (resto>=10) resto=0;
  return resto === parseInt(cpf.charAt(10));
}

function emailUnico(email) {
  // Temporário: checa em localStorage
  const base = JSON.parse(localStorage.getItem('clientes_wnp') || '[]');
  return !base.some(c => (c.email||'').toLowerCase() === (email||'').toLowerCase());
}

// ===== Criptografia de senha (hash SHA-256)
async function hashSenha(plain) {
  const enc = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ===== Endereços de entrega dinâmicos
function addEnderecoEntrega(dados={}) {
  const node = tplEndereco.content.firstElementChild.cloneNode(true);
  const q = s => node.querySelector(s);

  q('.ent_apelido').value    = dados.apelido || '';
  q('.ent_cep').value        = maskCEP(dados.cep || '');
  q('.ent_logradouro').value = dados.logradouro || '';
  q('.ent_numero').value     = dados.numero || '';
  q('.ent_complemento').value= dados.complemento || '';
  q('.ent_bairro').value     = dados.bairro || '';
  q('.ent_cidade').value     = dados.cidade || '';
  q('.ent_uf').value         = dados.uf || '';

  // Autofill via CEP
  q('.ent_cep').addEventListener('input', async (e)=>{
    e.target.value = maskCEP(e.target.value);
    const raw = e.target.value.replace(/\D/g,'');
    if (raw.length === 8) {
      try {
        const v = await viaCEP(raw);
        q('.ent_logradouro').value = v.logradouro || '';
        q('.ent_bairro').value     = v.bairro || '';
        q('.ent_cidade').value     = v.localidade || '';
        q('.ent_uf').value         = v.uf || '';
      } catch(_) {}
    }
  });

  node.querySelector('.removerEndereco').addEventListener('click', ()=>{
    node.remove();
    if (!listaEntrega.children.length) addEnderecoEntrega(); // mantém pelo menos 1
  });

  listaEntrega.appendChild(node);
}

$('#novoEndereco').addEventListener('click', ()=> addEnderecoEntrega());
$('#copiarFaturamento').addEventListener('click', ()=>{
  // Copia faturamento para um novo endereço de entrega
  addEnderecoEntrega({
    apelido: 'Principal',
    cep: $('#fat_cep').value,
    logradouro: $('#fat_logradouro').value,
    numero: $('#fat_numero').value,
    complemento: $('#fat_complemento').value,
    bairro: $('#fat_bairro').value,
    cidade: $('#fat_cidade').value,
    uf: $('#fat_uf').value
  });
});

// Mantém pelo menos 1 endereço de entrega
addEnderecoEntrega();

// Masks e auto-preenchimento faturamento
$('#fat_cep').addEventListener('input', async (e)=>{
  e.target.value = maskCEP(e.target.value);
  const raw = e.target.value.replace(/\D/g,'');
  if (raw.length === 8) {
    try {
      const v = await viaCEP(raw);
      $('#fat_logradouro').value = v.logradouro || '';
      $('#fat_bairro').value     = v.bairro || '';
      $('#fat_cidade').value     = v.localidade || '';
      $('#fat_uf').value         = v.uf || '';
    } catch(_) {}
  }
});

$('#cpf').addEventListener('input', (e)=> e.target.value = maskCPF(e.target.value));

// ===== Submit
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const erros = [];

  const nome = $('#nome').value.trim();
  if (!nomeValido(nome)) erros.push('O nome deve ter ao menos 2 palavras e cada uma com 3+ letras.');

  const cpf = $('#cpf').value;
  if (!cpfValido(cpf)) erros.push('CPF inválido.');

  const email = $('#email').value.trim();
  if (!email) erros.push('Informe um e-mail.');
  else if (!emailUnico(email)) erros.push('E-mail já cadastrado.');

  // Faturamento obrigatório
  const fat = {
    cep: $('#fat_cep').value.replace(/\D/g,''),
    logradouro: $('#fat_logradouro').value.trim(),
    numero: $('#fat_numero').value.trim(),
    complemento: $('#fat_complemento').value.trim(),
    bairro: $('#fat_bairro').value.trim(),
    cidade: $('#fat_cidade').value.trim(),
    uf: $('#fat_uf').value.trim().toUpperCase()
  };
  if (Object.values(fat).some((v,i)=> (i!==3) && !v)) erros.push('Preencha todos os campos obrigatórios do endereço de faturamento.');

  // Pelo menos 1 endereço de entrega
  const enderecos = [];
  $$('.endereco').forEach(n=>{
    const get = s => n.querySelector(s).value.trim();
    enderecos.push({
      apelido: get('.ent_apelido'),
      cep: get('.ent_cep').replace(/\D/g,''),
      logradouro: get('.ent_logradouro'),
      numero: get('.ent_numero'),
      complemento: get('.ent_complemento'),
      bairro: get('.ent_bairro'),
      cidade: get('.ent_cidade'),
      uf: get('.ent_uf').toUpperCase()
    });
  });
  if (!enderecos.length || enderecos.some(e=>!e.apelido || !e.cep || !e.logradouro || !e.numero || !e.bairro || !e.cidade || !e.uf)) {
    erros.push('Preencha os campos obrigatórios de pelo menos um endereço de entrega.');
  }

  if (!$('#aceite').checked) erros.push('Confirme o aceite dos dados.');

  // Mostra erros (sem quebrar nada)
  $('.err')?.remove();
  if (erros.length) {
    const box = document.createElement('div');
    box.className = 'err';
    box.innerHTML = erros.map(e=>`• ${e}`).join('<br>');
    form.appendChild(box);
    return;
  }

  // Monta payload
  const payload = {
    nome,
    genero: $('#genero').value,
    nascimento: $('#nascimento').value,
    cpf: $('#cpf').value.replace(/\D/g,''),
    email,
    senha_hash: await hashSenha($('#senha').value), // senha criptografada
    faturamento: fat,
    entrega: enderecos
  };

  // ===== Persistência temporária (sem tocar no backend atual)
  // Guarda em localStorage para cumprir o critério "armazenado na base"
  const base = JSON.parse(localStorage.getItem('clientes_wnp') || '[]');
  base.push(payload);
  localStorage.setItem('clientes_wnp', JSON.stringify(base));

  // Depois trocamos por:
  // await fetch('/api/clientes', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });

  // Redireciona para login
  window.location.href = 'login.html';
});
