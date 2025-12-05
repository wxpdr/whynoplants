document.addEventListener("DOMContentLoaded", () => {
    const API = (window.API_BASE ?? (location.origin + "/api"));
    const qs = (k) => new URLSearchParams(location.search).get(k);

    const id = Number(qs("id"));
    const btnVoltar = document.getElementById("btnVoltar");
    
    // Elementos do Carrossel
    const imgStage = document.getElementById("imgStage");
    const thumbsContainer = document.getElementById("thumbs");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const galleryContainer = document.querySelector(".gallery .stage"); // Para detectar o mouse

    // Campos de texto
    const campos = {
        nome: document.getElementById("nome"),
        valor: document.getElementById("valor"),
        qtd: document.getElementById("quantidade"),
        status: document.getElementById("status"),
        codigo: document.getElementById("codigo"),
        desc: document.getElementById("descricao"),
        rating: document.getElementById("rating")
    };

    let imagens = [];
    let indexAtual = 0;
    let autoPlayInterval = null;
    const TEMPO_TROCA = 3000; // 3 segundos por imagem

    // Botão Voltar
    if(btnVoltar) {
        btnVoltar.onclick = () => {
            if (document.referrer && document.referrer.includes("/produto.html")) history.back();
            else location.href = "produto.html";
        };
    }

    if (!id) {
        alert("ID não informado");
        location.href = "produto.html";
        return;
    }

    // --- INIT ---
    (async function init() {
        try {
            const r = await fetch(`${API}/produtos/${id}`, { credentials: "include" });
            if (!r.ok) throw new Error();
            const p = await r.json();
            preencherDados(p);

            const r2 = await fetch(`${API}/produtos/${id}/detalhe`, { credentials: "include" });
            if (r2.ok) {
                const det = await r2.json();
                imagens = det.imagens || [];
            }
        } catch (err) { console.error(err); }

        if (imagens.length === 0) {
            imagens = [{ arquivo: "https://via.placeholder.com/800x800?text=Sem+Imagem", principal: true }];
        } else {
            imagens.sort((a, b) => (b.principal === true) - (a.principal === true));
        }

        montarCarrossel();
    })();

    function preencherDados(p) {
        if(campos.nome) campos.nome.textContent = p.nome || "Produto";
        if(campos.codigo) campos.codigo.textContent = p.codigo || "—";
        if(campos.valor) campos.valor.textContent = (p.valor != null ? Number(p.valor).toFixed(2).replace('.', ',') : "0,00");
        if(campos.qtd) campos.qtd.textContent = p.quantidade || 0;
        if(campos.status) campos.status.textContent = p.ativo ? "Ativo" : "Inativo";
        if(campos.desc) campos.desc.textContent = p.descricao || "—";

        if(campos.rating) {
            campos.rating.innerHTML = "";
            const nota = p.avaliacao != null ? Number(p.avaliacao) : 0;
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement("span");
                star.className = "star" + (i <= Math.floor(nota) ? "" : " off");
                star.textContent = "★";
                campos.rating.appendChild(star);
            }
        }
    }

    function montarCarrossel() {
        thumbsContainer.innerHTML = "";

        // Controla visibilidade das setas
        const temMaisDeUma = imagens.length > 1;
        if(btnPrev) btnPrev.style.display = temMaisDeUma ? "flex" : "none";
        if(btnNext) btnNext.style.display = temMaisDeUma ? "flex" : "none";

        // Cria miniaturas
        imagens.forEach((img, i) => {
            const div = document.createElement("div");
            div.className = "item";
            const imgEl = document.createElement("img");
            imgEl.src = resolverUrl(img.arquivo);
            div.appendChild(imgEl);
            div.onclick = () => {
                mudarImagem(i);
                resetAutoPlay(); // Reinicia contagem se o usuário clicar
            };
            thumbsContainer.appendChild(div);
        });

        if(btnPrev) btnPrev.onclick = (e) => { e.preventDefault(); navegar(-1); resetAutoPlay(); };
        if(btnNext) btnNext.onclick = (e) => { e.preventDefault(); navegar(1); resetAutoPlay(); };

        mudarImagem(0);

        // Se tiver mais de uma imagem, liga o automático
        if (temMaisDeUma) {
            iniciarAutoPlay();
            
            // Pausa ao passar o mouse (UX melhor)
            if(galleryContainer) {
                galleryContainer.addEventListener("mouseenter", pararAutoPlay);
                galleryContainer.addEventListener("mouseleave", iniciarAutoPlay);
            }
        }
    }

    function navegar(direcao) {
        let novo = indexAtual + direcao;
        if (novo < 0) novo = imagens.length - 1;
        if (novo >= imagens.length) novo = 0;
        mudarImagem(novo);
    }

    function mudarImagem(i) {
        indexAtual = i;
        if(imgStage) {
            imgStage.style.opacity = "0.8"; 
            imgStage.src = resolverUrl(imagens[i].arquivo);
            setTimeout(() => imgStage.style.opacity = "1", 200);
        }

        Array.from(thumbsContainer.children).forEach((el, k) => {
            if (k === i) el.classList.add("active");
            else el.classList.remove("active");
        });
    }

    // --- LÓGICA AUTOMÁTICA ---
    function iniciarAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            navegar(1); // Vai para a próxima
        }, TEMPO_TROCA);
    }

    function pararAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
        pararAutoPlay();
        // Só reinicia se o mouse NÃO estiver em cima (opcional, mas evita bugs visuais)
        // Aqui vamos reiniciar direto para garantir fluxo contínuo
        iniciarAutoPlay(); 
    }

    function resolverUrl(path) {
        if (!path) return "https://via.placeholder.com/800x800?text=Sem+Imagem";
        if (path.startsWith("http")) return path;
        return "/" + path.replace(/\\/g, "/").replace(/^\/+/, "");
    }
});