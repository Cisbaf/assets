// Mostra as páginas do Power BI. Cada página aberta fica guardada num iframe próprio,
// então voltar para uma página já visitada é instantâneo (sem recarregar o relatório).
const Visualizador = (() => {
    const MAX_ABERTAS = 3;          // iframes mantidos em memória
    const ESPERA_RENDER_MS = 1500;  // o Power BI ainda desenha os visuais após o "load"
    const LENTO_MS = 25000;

    const abertas = new Map();      // chave -> { iframe, pronto, timer }
    let atual = null;
    let palco, estado, titulo, detalhe, btnTentar;

    function iniciar() {
        palco = document.getElementById("palco");
        estado = document.getElementById("palco-estado");
        titulo = document.getElementById("palco-titulo");
        detalhe = document.getElementById("palco-detalhe");
        btnTentar = document.getElementById("btn-tentar");
        btnTentar.addEventListener("click", recarregar);
    }

    function definirRecorte(px) {
        document.documentElement.style.setProperty("--recorte", `${px || 0}px`);
    }

    function mostrarEstado(tipo, info = {}) {
        estado.dataset.estado = tipo;
        if (info.titulo) titulo.textContent = info.titulo;
        detalhe.textContent = info.detalhe || "";
        btnTentar.hidden = tipo !== "falha";
    }

    function criar(chave, url, nome) {
        const iframe = document.createElement("iframe");
        iframe.title = nome;
        iframe.src = url;
        iframe.allowFullscreen = true;
        iframe.setAttribute("referrerpolicy", "no-referrer");
        const item = { iframe, pronto: false, nome };

        iframe.addEventListener("load", () => {
            setTimeout(() => {
                item.pronto = true;
                clearTimeout(item.timer);
                iframe.classList.add("pronto");
                if (atual === chave) mostrarEstado("pronto");
            }, ESPERA_RENDER_MS);
        });
        item.timer = setTimeout(() => {
            if (!item.pronto && atual === chave) {
                mostrarEstado("falha", { titulo: "O relatório está demorando", detalhe: "A conexão com o Power BI pode estar lenta." });
            }
        }, LENTO_MS);

        palco.appendChild(iframe);
        return item;
    }

    function descartar(chave) {
        const item = abertas.get(chave);
        if (!item) return;
        clearTimeout(item.timer);
        item.iframe.remove();
        abertas.delete(chave);
    }

    function mostrar(chave, url, nome, contexto) {
        atual = chave;
        let item = abertas.get(chave);
        if (item) {
            abertas.delete(chave);           // reposiciona como "mais recente"
        } else {
            item = criar(chave, url, nome);
        }
        abertas.set(chave, item);

        while (abertas.size > MAX_ABERTAS) descartar(abertas.keys().next().value);
        for (const [k, it] of abertas) it.iframe.classList.toggle("ativo", k === chave);

        if (item.pronto) mostrarEstado("pronto");
        else mostrarEstado("carregando", { titulo: nome, detalhe: contexto });
    }

    function recarregar() {
        if (!atual || !abertas.has(atual)) return;
        const { iframe, nome } = abertas.get(atual);
        const url = iframe.src;
        descartar(atual);
        mostrar(atual, url, nome, "Recarregando…");
    }

    function limpar() {
        for (const chave of [...abertas.keys()]) descartar(chave);
        atual = null;
    }

    return { iniciar, definirRecorte, mostrar, recarregar, limpar };
})();
