// js/produto-cadastrar.js

document.addEventListener("DOMContentLoaded", () => {
    const API = "http://localhost:8080"; 
    const LAST_CODE_KEY = 'last_product_code';

    // ===== DOM =====
    const form = document.getElementById("formProduto");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnAbrirGaleria = document.getElementById("btnAbrirGaleria");
    const modal = document.getElementById("modalGaleria");
    const btnFechar = document.getElementById("btnFechar");
    const btnSalvarGaleria = document.getElementById("btnSalvarGaleria");
    const btnAddImg = document.getElementById("btnAddImg");
    const inputImagens = document.getElementById("inputImagens");
    const gridImgs = document.getElementById("gridImgs");
    const imgPreview = document.getElementById("imgPreview");
    const placeholder = document.querySelector(".placeholder");
    const inputCodigo = document.getElementById("codigo"); // Input ESCONDIDO

    // ===== Estado =====
    let arquivos = [];
    let principalIndex = 0;

    // --- FUNÇÕES DE AUTO-INCREMENTO SIMULADO ---
    function formatarCodigo(num) {
        return String(num).padStart(4, '0');
    }

    // Tenta carregar o último código usado e define o próximo
    async function definirProximoCodigo() {
        if (!inputCodigo) return; // Se o input não existir, para aqui.
        
        let proximoNumero = 1;
        
        const lastUsed = localStorage.getItem(LAST_CODE_KEY);
        if (lastUsed && !isNaN(Number(lastUsed))) {
            proximoNumero = Number(lastUsed) + 1;
        } else {
            // Fallback: Tenta buscar o último ID/código no banco
            try {
                const r = await fetch(`${API}/produtos?page=0&size=1&sort=id,desc`);
                if (r.ok) {
                    const page = await r.json();
                    const ultimoProduto = (page.content || [])[0];
                    if (ultimoProduto && ultimoProduto.codigo) {
                        proximoNumero = Number(ultimoProduto.codigo) + 1;
                    }
                }
            } catch (e) {
                console.warn("Falha ao buscar último código no banco. Iniciando em 0001.");
            }
        }

        const codigoFormatado = formatarCodigo(proximoNumero);
        inputCodigo.value = codigoFormatado;
    }

    // ===== Modal: abrir / fechar / salvar =====
    function abrirModal(e){ e?.preventDefault?.(); modal?.removeAttribute("hidden"); }
    function fecharModal(e){ e?.preventDefault?.(); modal?.setAttribute("hidden",""); }

    btnAbrirGaleria?.addEventListener("click", abrirModal);
    btnFechar?.addEventListener("click", fecharModal);
    btnSalvarGaleria?.addEventListener("click", (e) => { e.preventDefault(); atualizarPreview(); fecharModal(); });

    modal?.addEventListener("click", (e) => { if (e.target === modal) fecharModal(e); });

    // ===== Upload / galeria =====
    btnAddImg?.addEventListener("click", () => inputImagens?.click());

    inputImagens?.addEventListener("change", (e) => {
        for (const f of e.target.files) arquivos.push(f);
        renderGaleria();
        atualizarPreview();
        e.target.value = "";
    });

    function renderGaleria(){
        if (!gridImgs) return;
        gridImgs.innerHTML = "";
        arquivos.forEach((file, idx) => {
            const url = URL.createObjectURL(file);
            const div = document.createElement("div");
            div.className = "card-img";
            div.innerHTML = `
                <div class="thumb"><img src="${url}" alt=""></div>
                <div class="row">
                    <button type="button" class="btn ghost" data-remove="${idx}">Remover</button>
                    <span class="star ${idx===principalIndex ? 'on':''}" data-star="${idx}" title="Definir como principal">★</span>
                </div>
            `;
            gridImgs.appendChild(div);
        });

        // Eventos de remoção e principal
        gridImgs.querySelectorAll("[data-remove]").forEach(b => {
            b.addEventListener("click", (ev) => {
                const i = Number(ev.currentTarget.getAttribute("data-remove"));
                arquivos.splice(i, 1);
                if (principalIndex >= arquivos.length) principalIndex = Math.max(0, arquivos.length - 1);
                renderGaleria();
                atualizarPreview();
            });
        });
        gridImgs.querySelectorAll("[data-star]").forEach(s => {
            s.addEventListener("click", (ev) => {
                principalIndex = Number(ev.currentTarget.getAttribute("data-star"));
                renderGaleria();
                atualizarPreview();
            });
        });
    }

    function atualizarPreview(){
        if (!imgPreview || !placeholder) return;
        if (arquivos.length === 0){
            imgPreview.style.display = "none";
            placeholder.style.display = "block";
            return;
        }
        const url = URL.createObjectURL(arquivos[principalIndex]);
        imgPreview.src = url;
        imgPreview.style.display = "block";
        placeholder.style.display = "none";
    }

    // ===== Formulário: Submissão =====
    btnCancelar?.addEventListener("click", (e) => { e.preventDefault(); location.href = "produto.html"; });

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        // O código será lido do input ESCONDIDO
        const codigoValor = document.getElementById("codigo")?.value.trim();

        const dados = {
            codigo: codigoValor, 
            nome: document.getElementById("nome")?.value.trim(),
            valor: Number(document.getElementById("valor")?.value),
            quantidade: Number(document.getElementById("quantidade")?.value),
            descricao: document.getElementById("descricao")?.value.trim() || null,
            avaliacao: document.getElementById("avaliacao")?.value ? Number(document.getElementById("avaliacao").value) : null,
            principalIndex: arquivos.length ? principalIndex : null
        };

        // validações simples: Código já vem preenchido pelo JS, então só validamos o nome
        if (!dados.codigo || !dados.nome || isNaN(dados.valor) || isNaN(dados.quantidade)) {
            alert("Preencha Nome, Preço e Estoque.");
            return;
        }
        if (dados.descricao && dados.descricao.length > 2000){
            alert("Descrição deve ter no máximo 2000 caracteres.");
            return;
        }
        if (dados.avaliacao && (dados.avaliacao < 1 || dados.avaliacao > 5)) {
            alert("Avaliação deve ser entre 1 e 5.");
            return;
        }

        // FormData (multipart)
        const fd = new FormData();
        fd.append("dados", new Blob([JSON.stringify(dados)], { type: "application/json" }));
        arquivos.forEach(f => fd.append("imagens", f));

        try{
            const r = await fetch(`${API}/produtos`, { method: "POST", credentials: "include", body: fd });
            if (!r.ok){
                const txt = await r.text().catch(()=>"");
                console.error("Erro ao salvar produto:", txt || r.status);
                alert("Falha ao salvar produto.");
                return;
            }
            // Sucesso: incrementa o contador para a próxima vez
            const currentCode = Number(codigoValor);
            localStorage.setItem(LAST_CODE_KEY, currentCode + 1); 
            
            location.href = "produto.html";
        }catch(err){
            console.error(err);
            alert("Não foi possível comunicar com a API.");
        }
    });

    // Inicia a definição do código ao carregar a página
    definirProximoCodigo(); 
});