const $ = s => document.querySelector(s);

function loadBase(){ return JSON.parse(localStorage.getItem('clientes_wnp') || '[]'); }
function firstName(full){ return (full||'').trim().split(/\s+/)[0] || ''; }
function getLoggedIndex(){
  const base = loadBase();
  const url = new URL(location.href);
  const emailQ = (url.searchParams.get('email') || '').toLowerCase();
  if (emailQ){
    const i = base.findIndex(c => (c.email||'').toLowerCase() === emailQ);
    if (i >= 0) return i;
  }
  return base.length ? 0 : -1;
}

const idx = getLoggedIndex();
if (idx === -1){
  alert('Nenhum cliente encontrado. Cadastre ou informe ?email= na URL.');
}

const base = loadBase();
const c = base[idx] || {};
$('#saudacao').textContent = `Olá, ${firstName(c.nome || 'Cliente')}!`;
$('#resEmail').value = c.email || '';
$('#resGenero').value = c.genero || '';
$('#resNascimento').value = c.nascimento || '';
$('#resQtdEnderecos').value = (c.entrega || []).length + ' endereço(s)';

const emailParam = c.email ? `?email=${encodeURIComponent(c.email)}` : '';
$('#btnEditar').href    = 'cliente-editar.html' + emailParam;
$('#btnEnderecos').href = 'cliente-editar.html' + emailParam + '#enderecos';
$('#btnSenha').href     = 'cliente-editar.html' + emailParam + '#senha';
$('#btnPedidos').href   = '#';

document.getElementById('btnSair').addEventListener('click', ()=>{
  sessionStorage.removeItem('cliente_email');
  alert('Sessão encerrada (cliente).');
  location.href = 'login.html';
});
