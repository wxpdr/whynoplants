(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  async function api(path, opts={}) {
    const r = await fetch(path, {credentials:'include', ...opts});
    if(!r.ok) throw new Error(await r.text());
    const ct = r.headers.get('content-type')||'';
    return ct.includes('json') ? r.json() : r.text();
  }

  function addrView(a){
    const d = document.createElement('div');
    d.className = 'addr';
    d.innerHTML = `
      <strong>${a.logradouro}, ${a.numero}</strong>
      <div class="muted">${a.bairro} • ${a.cidade}/${a.uf} • CEP ${a.cep}${a.padrao?' • <b>Padrão</b>':''}</div>
    `;
    return d;
  }

  async function boot(){
    // quem sou
    const who = await api('/whoami');
    $('#who-name').textContent = who.nome || 'Cliente';
    const id = who.id;

    // dados (GET /clientes/{id})
    try{
      const c = await api(`/clientes/${id}`);
      $('#me-dados').innerHTML =
        `<div><b>Nome: </b>${c.primeiroNome} ${c.sobrenome}</div>
         <div><b>Nascimento: </b>${c.dataNascimento || '-'}</div>
         <div><b>Gênero: </b>${c.genero || '-'}</div>`;
    }catch{ $('#me-dados').textContent = '—'; }

    // endereços
    try{
      const lista = await api(`/clientes/${id}/enderecos?tipo=ENTREGA`);
      const box = $('#enderecos'); box.innerHTML = '';
      if(!lista || lista.length===0){ box.innerHTML = '<div class="muted">Nenhum endereço cadastrado.</div>'; }
      else lista.forEach(a => box.appendChild(addrView(a)));
    }catch{
      $('#enderecos').innerHTML = '<div class="muted">Erro ao carregar endereços.</div>';
    }

        // pedidos
    try {
      const lista = await api(`/clientes/${id}/pedidos`);
      const box = document.querySelector('#pedidos');
      box.classList.remove('placeholder');
      box.innerHTML = '';

      if (!lista || lista.length === 0) {
        box.innerHTML = '<div class="muted">Você ainda não tem pedidos.</div>';
      } else {
        lista.forEach(p => {
          const div = document.createElement('div');
          div.className = 'pedido-item';

          const data = p.dataCriacao
            ? new Date(p.dataCriacao).toLocaleString('pt-BR')
            : '-';

          const total = p.valorTotal != null
            ? Number(p.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'R$ 0,00';

          div.innerHTML = `
            <div class="linha">
              <strong>Pedido #${p.id}</strong>
              <span>${data}</span>
            </div>
            <div class="linha">
              <span>Status: <b>${p.status}</b></span>
              <span>Total: <b>${total}</b></span>
            </div>
            <div class="linha">
              <button class="btn small" data-id="${p.id}">Ver detalhes</button>
            </div>
          `;

          box.appendChild(div);
        });

        box.addEventListener('click', e => {
          const btn = e.target.closest('button[data-id]');
          if (!btn) return;
          const pid = btn.getAttribute('data-id');
          location.href = `pedido-detalhes.html?id=${pid}`;
        });
      }
    } catch (e) {
      console.error(e);
      document.querySelector('#pedidos').innerHTML =
        '<div class="muted">Erro ao carregar pedidos.</div>';
    }


    // logout
    $('#btnLogout').addEventListener('click', async ()=>{
      try{ await api('/logout', {method:'POST'}); } finally { location.href='login.html'; }
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
