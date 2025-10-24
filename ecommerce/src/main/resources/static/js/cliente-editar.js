const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function loadBase() { return JSON.parse(localStorage.getItem('clientes_wnp') || '[]'); }
function saveBase(arr) { localStorage.setItem('clientes_wnp', JSON.stringify(arr)); }

function getLoggedClientIndex(){
  const base = loadBase();
  const url = new URL(location.href);
  const emailQ = (url.searchParams.get('email') || '').toLowerCase();
  if (emailQ){
    const i = base.findIndex(c => (c.email||'').toLowerCase() === emailQ);
    if (i >= 0) return i;
  }
  return base.length ? 0 : -1;
}

function nomeValido(nome){
  const partes = (nome || '').trim().split(/\s+/);
  if (partes.length < 2) return false;
  return partes.every(p => p.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g,'').length >= 3);
}
function maskCEP(v){ v=(v||'').replace(/\D/g,'').slice(0,8); return v.length>5?v.replace(/^(\d{5})(\d{1,3})$/,'$1-$2'):v; }
async function viaCEP(cep){
  cep = (cep||'').replace(/\D/g,''); if (cep.length!==8) throw new Error('CEP inválido');
  const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`); const j=await r.json();
  if (j.erro) throw new Error('CEP não encontrado'); return j;
}
async function sha256(str){ const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)); return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join(''); }

const listaEntrega = $('#listaEntrega'); const tplEndereco = $('#tplEndereco');

function bindEnderecoNode(node){
  const q = s => node.querySelector(s);
  q('.ent_cep').addEventListener('input', async e=>{
    e.target.value = maskCEP(e.target.value);
    const raw = e.target.value.replace(/\D/g,'');
    if (raw.length===8){
      try {
        const v = await viaCEP(raw);
        q('.ent_logradouro').value = v.logradouro || '';
        q('.ent_bairro').value     = v.bairro || '';
        q('.ent_cidade').value     = v.localidade || '';
        q('.ent_uf').value         = v.uf || '';
      } catch(_){}
    }
  });
  node.querySelector('.removerEndereco').addEventListener('click', ()=> node.remove());
}
function addEndereco(dados={}){
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
  bindEnderecoNode(node);
  listaEntrega.appendChild(node);
}
$('#novoEndereco').addEventListener('click', ()=> addEndereco());

const idx = getLoggedClientIndex();
if (idx === -1){ alert('Nenhum cliente encontrado. Cadastre um cliente primeiro.'); }
else {
  const base = loadBase(); const c = base[idx];
  $('#nome').value       = c.nome || '';
  $('#genero').value     = c.genero || '';
  $('#nascimento').value = c.nascimento || '';
  $('#email').value      = c.email || '';
  (c.entrega || []).forEach(addEndereco);
  if (!listaEntrega.children.length) addEndereco();
}

$('#formPerfil').addEventListener('submit', e=>{
  e.preventDefault();
  const erros = [];
  const nome = $('#nome').value.trim();
  if (!nomeValido(nome)) erros.push('O nome deve ter ao menos 2 palavras com 3+ letras.');
  if (!$('#genero').value) erros.push('Selecione o gênero.');
  if (!$('#nascimento').value) erros.push('Informe a data de nascimento.');

  const enderecos = [];
  $$('.endereco').forEach(n=>{
    const g = s => n.querySelector(s).value.trim();
    const ent = {
      apelido:g('.ent_apelido'),
      cep:g('.ent_cep').replace(/\D/g,''),
      logradouro:g('.ent_logradouro'),
      numero:g('.ent_numero'),
      complemento:g('.ent_complemento'),
      bairro:g('.ent_bairro'),
      cidade:g('.ent_cidade'),
      uf:g('.ent_uf').toUpperCase()
    };
    if (!ent.apelido || !ent.cep || !ent.logradouro || !ent.numero || !ent.bairro || !ent.cidade || !ent.uf)
      erros.push('Preencha todos os campos obrigatórios dos endereços de entrega.');
    enderecos.push(ent);
  });
  $('.err')?.remove();
  if (erros.length){
    const box=document.createElement('div'); box.className='err'; box.innerHTML=erros.map(e=>'• '+e).join('<br>'); $('#formPerfil').appendChild(box);
    return;
  }
  const base = loadBase();
  const c = base[idx];
  c.nome = nome; c.genero = $('#genero').value; c.nascimento = $('#nascimento').value; c.entrega = enderecos;
  saveBase(base);
  alert('Dados atualizados com sucesso!');
});

$('#formSenha').addEventListener('submit', async e=>{
  e.preventDefault();
  $('.err')?.remove();
  const atual = $('#senhaAtual').value, nova = $('#senhaNova').value, conf = $('#senhaConfirma').value;
  if (!atual || !nova || !conf){
    const b=document.createElement('div'); b.className='err'; b.textContent='Preencha todos os campos de senha.'; $('#formSenha').appendChild(b); return;
  }
  if (nova.length<8){
    const b=document.createElement('div'); b.className='err'; b.textContent='A nova senha deve ter pelo menos 8 caracteres.'; $('#formSenha').appendChild(b); return;
  }
  if (nova!==conf){
    const b=document.createElement('div'); b.className='err'; b.textContent='A confirmação da senha não confere.'; $('#formSenha').appendChild(b); return;
  }
  const base = loadBase(); const c = base[idx];
  const hashAtual = await sha256(atual);
  if ((c.senha_hash||'') !== hashAtual){
    const b=document.createElement('div'); b.className='err'; b.textContent='Senha atual incorreta.'; $('#formSenha').appendChild(b); return;
  }
  c.senha_hash = await sha256(nova); saveBase(base);
  $('#senhaAtual').value = $('#senhaNova').value = $('#senhaConfirma').value = '';
  alert('Senha alterada com sucesso!');
});
