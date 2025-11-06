async function cadastrarCliente(payload){
  const res = await fetch('/clientes', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if(res.status === 201){
    location.href = '/login.html'; // critério: ir para login após cadastro
  } else {
    const err = await res.json().catch(()=>({message:'Erro no cadastro'}));
    alert(err.message || 'Erro no cadastro');
  }
}