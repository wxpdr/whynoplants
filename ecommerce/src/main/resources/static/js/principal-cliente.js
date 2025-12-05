(() => {
  const API_BASE = window.API || "http://localhost:8080";
  const $ = s => document.querySelector(s);

  async function api(path, opts={}) {
    const r = await fetch(`${API_BASE}${path}`, {credentials:'include', ...opts});
    if(!r.ok) throw new Error(await r.text());
    const ct = r.headers.get('content-type')||'';
    return ct.includes('json') ? r.json() : r.text();
  }

  // --- RENDER DADOS (Ajustado: Só Nome, Nascimento e Gênero) ---
  function renderDadosPessoais(c) {
    const box = $('#me-dados');
    
    // Formata data de nascimento
    let nasc = '-';
    if(c.dataNascimento) {
        const d = new Date(c.dataNascimento);
        nasc = d.toLocaleDateString('pt-BR', {timeZone: 'UTC'});
    }

    // Exibe apenas o que foi solicitado
    box.innerHTML = `
      <div class="data-row">
        <span class="data-label">Nome Completo</span>
        <span class="data-value">${c.primeiroNome} ${c.sobrenome}</span>
      </div>
      
      <div class="data-row">
        <span class="data-label">Data de Nascimento</span>
        <span class="data-value">${nasc}</span>
      </div>
      
      <div class="data-row">
        <span class="data-label">Gênero</span>
        <span class="data-value">${c.genero || '-'}</span>
      </div>
    `;
  }

  function renderEnderecos(lista) {
    const box = $('#enderecos');
    box.innerHTML = '';
    
    if(!lista || lista.length === 0){
      box.innerHTML = '<div class="loader">Nenhum endereço cadastrado.</div>';
      return;
    }

    lista.sort((a,b) => (b.padrao === true) - (a.padrao === true));

    lista.forEach(a => {
      const div = document.createElement('div');
      div.className = 'addr-item';
      const badge = a.padrao ? '<span class="badge-default">Padrão</span>' : '';
      
      div.innerHTML = `
        <span class="addr-main">${a.logradouro}, ${a.numero} ${badge}</span>
        <div class="addr-details">
          ${a.bairro} - ${a.cidade}/${a.uf}<br>
          CEP: ${a.cep}
        </div>
      `;
      box.appendChild(div);
    });
  }

  function getStatusClass(status) {
    if(!status) return '';
    const s = status.toUpperCase();
    if(s.includes('AGUARDANDO')) return 'st-aguardando';
    if(s.includes('PAGO') || s.includes('ENTREGUE')) return 'st-pago';
    if(s.includes('ENVIADO')) return 'st-enviado';
    if(s.includes('CANCELADO')) return 'st-cancelado';
    return '';
  }

  function renderPedidos(lista) {
    const box = $('#pedidos');
    box.innerHTML = '';

    if (!lista || lista.length === 0) {
      box.innerHTML = '<div style="padding:20px; color:#777; text-align:center">Você ainda não tem pedidos.</div>';
      return;
    }

    lista.forEach(p => {
      const div = document.createElement('div');
      div.className = 'order-row';

      const data = p.dataCriacao ? new Date(p.dataCriacao).toLocaleString('pt-BR') : '-';
      const total = p.valorTotal != null 
        ? Number(p.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
        : 'R$ 0,00';
      
      const statusClass = getStatusClass(p.status);
      const statusLabel = p.status ? p.status.replace('_', ' ') : '-';

      div.innerHTML = `
        <div>
          <span class="ord-id">Pedido #${p.id}</span>
          <span class="ord-date">${data}</span>
        </div>
        <div>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div>
          <span class="ord-total">${total}</span>
        </div>
        <div class="order-action">
          <button class="btn small primary" data-id="${p.id}">Detalhes</button>
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

  // --- BOOT ---
  async function boot(){
    try {
        const who = await api('/whoami');
        $('#who-name').textContent = who.nome || 'Cliente';
        const id = who.id;

        // Tenta carregar dados pessoais
        try {
            const c = await api(`/clientes/${id}`);
            renderDadosPessoais(c);
        } catch { 
            $('#me-dados').innerHTML = '<div class="loader">Erro ao carregar dados.</div>'; 
        }

        // Tenta carregar endereços
        try {
            const lista = await api(`/clientes/${id}/enderecos?tipo=ENTREGA`);
            renderEnderecos(lista);
        } catch { $('#enderecos').innerHTML = '<div class="loader">Erro ao carregar endereços.</div>'; }

        // Tenta carregar pedidos
        try {
            const lista = await api(`/clientes/${id}/pedidos`);
            renderPedidos(lista);
        } catch { $('#pedidos').innerHTML = '<div class="loader">Erro ao carregar pedidos.</div>'; }

    } catch(e) {
        console.error("Erro fatal:", e);
        location.href = 'login.html';
    }

    $('#btnLogout').addEventListener('click', async ()=>{
      try{ await api('/logout', {method:'POST'}); } finally { location.href='login.html'; }
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();