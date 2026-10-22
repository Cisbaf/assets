// Painel: seletor de município, abas das páginas, rota na URL (#/G1/tabnet-migracao) e atalhos.
const Painel = (() => {
    let perfil = null;
    let visao = null;
    let pagina = null;
    let popoverAberto = null;
    let verificador = null;

    const $ = id => document.getElementById(id);

    // ---------- Rota ----------

    function lerRota() {
        const [, v, p] = location.hash.split("/");
        return { visaoId: v ? decodeURIComponent(v) : null, chave: p ? decodeURIComponent(p) : null };
    }

    function escreverRota(adicionarHistorico) {
        const hash = `#/${encodeURIComponent(visao.id)}/${encodeURIComponent(pagina.chave)}`;
        if (location.hash === hash) return;
        if (adicionarHistorico) history.pushState(null, "", hash);
        else history.replaceState(null, "", hash);
    }

    function ir(visaoId, chave, { historico = true } = {}) {
        const novaVisao = perfil.visoes.find(v => v.id === visaoId)
            || (visao && perfil.visoes.find(v => v.id === visao.id))
            || perfil.visoes[0];
        const novaPagina = novaVisao.paginas.find(p => p.chave === chave)
            || novaVisao.paginas.find(p => p.chave === novaVisao.entrada)
            || novaVisao.paginas[0];

        const trocouVisao = novaVisao !== visao;
        visao = novaVisao;
        pagina = novaPagina;
        Local.gravar(`ultima.${perfil.usuario}`, { visaoId: visao.id, chave: pagina.chave });

        if (trocouVisao) renderizarVisao();
        marcarAba();
        escreverRota(historico);
        document.title = `${pagina.curto} · ${visao.nome} — ${perfil.titulo}`;
        Visualizador.mostrar(`${visao.id}/${pagina.chave}`, pagina.url, pagina.titulo, visao.nome);
    }

    // ---------- Cabeçalho ----------

    function renderizarVisao() {
        $("visao-rotulo").textContent = visao.master ? "Visão" : "Município";
        $("visao-nome").textContent = visao.nome;

        const abas = $("abas");
        abas.querySelectorAll(".aba").forEach(a => a.remove());
        visao.paginas.forEach((p, i) => {
            const aba = document.createElement("button");
            aba.type = "button";
            aba.className = "aba";
            aba.setAttribute("role", "tab");
            aba.id = `aba-${p.chave}`;
            aba.dataset.chave = p.chave;
            aba.title = `${p.titulo} (${i + 1})`;
            aba.innerHTML = `<span data-icone="${p.icone}"></span><span class="aba-texto"></span>`;
            aba.querySelector(".aba-texto").textContent = p.curto;
            abas.appendChild(aba);
        });
        aplicarIcones(abas);
    }

    function marcarAba() {
        const abas = $("abas");
        let ativa = null;
        abas.querySelectorAll(".aba").forEach(a => {
            const sel = a.dataset.chave === pagina.chave;
            a.setAttribute("aria-selected", String(sel));
            a.tabIndex = sel ? 0 : -1;
            if (sel) ativa = a;
        });
        moverIndicador(ativa);
        if (ativa) ativa.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }

    function marcarCortes() {
        const abas = $("abas");
        abas.classList.toggle("corte-esq", abas.scrollLeft > 2);
        abas.classList.toggle("corte-dir", abas.scrollLeft + abas.clientWidth < abas.scrollWidth - 2);
    }

    function moverIndicador(aba = $("abas").querySelector('[aria-selected="true"]')) {
        marcarCortes();
        const ind = $("abas").querySelector(".abas-indicador");
        if (!aba) { ind.style.width = "0"; return; }
        ind.style.width = `${aba.offsetWidth - 16}px`;
        ind.style.transform = `translateX(${aba.offsetLeft + 8}px)`;
    }

    function iniciais(nome) {
        return nome.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]).join("").toUpperCase();
    }

    // ---------- Popovers ----------

    function abrirPopover(pop, botao) {
        fecharPopover();
        pop.hidden = false;
        const r = botao.getBoundingClientRect();
        const largura = pop.offsetWidth;
        const esquerda = Math.min(Math.max(8, r.left), window.innerWidth - largura - 8);
        pop.style.top = `${r.bottom + 6}px`;
        pop.style.left = `${esquerda}px`;
        botao.setAttribute("aria-expanded", "true");
        popoverAberto = { pop, botao };
    }

    function fecharPopover(devolverFoco = false) {
        if (!popoverAberto) return;
        popoverAberto.pop.hidden = true;
        popoverAberto.botao.setAttribute("aria-expanded", "false");
        if (devolverFoco) popoverAberto.botao.focus();
        popoverAberto = null;
    }

    // Seletor de município com busca e navegação por teclado.
    function semAcento(t) {
        return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    }

    function renderizarListaVisoes() {
        const termo = semAcento($("busca-visao").value.trim());
        const lista = $("lista-visao");
        lista.innerHTML = "";
        const itens = perfil.visoes.filter(v => !termo || semAcento(v.nome).includes(termo) || v.id.toLowerCase() === termo);
        if (!itens.length) {
            lista.innerHTML = '<li class="vazio">Nenhum município encontrado</li>';
            return;
        }
        itens.forEach(v => {
            const li = document.createElement("li");
            li.setAttribute("role", "option");
            li.dataset.id = v.id;
            li.setAttribute("aria-selected", String(v.id === visao.id));
            if (v.master) li.classList.add("master");
            li.textContent = v.nome;
            if (v.paginas.length < 5 && !v.master) {
                const qtd = document.createElement("small");
                qtd.textContent = `${v.paginas.length} páginas`;
                li.appendChild(qtd);
            }
            lista.appendChild(li);
        });
        realcar(lista.querySelector('[aria-selected="true"]') || lista.firstElementChild);
    }

    function realcar(li) {
        $("lista-visao").querySelectorAll(".realce").forEach(x => x.classList.remove("realce"));
        if (li && li.dataset.id) {
            li.classList.add("realce");
            li.scrollIntoView({ block: "nearest" });
        }
    }

    function escolherVisao(id) {
        fecharPopover(true);
        if (id && id !== visao.id) ir(id, pagina.chave);
    }

    // ---------- Sessão ----------

    function verificarSessao() {
        Api.perfil().catch(err => {
            if (err.status === 401) encerrar("Sua sessão expirou. Entre novamente.");
        });
    }

    async function sair() {
        fecharPopover();
        try { await Api.sair(); } catch { /* segue saindo */ }
        encerrar();
    }

    function encerrar(mensagem) {
        clearInterval(verificador);
        Visualizador.limpar();
        perfil = visao = pagina = null;
        history.replaceState(null, "", location.pathname);
        document.title = "Painel dos Gestores · CISBAF";
        Login.mostrar(mensagem);
    }

    // ---------- Modo foco / tela cheia ----------

    function alternarFoco(ativo = !document.body.classList.contains("foco")) {
        document.body.classList.toggle("foco", ativo);
        Local.gravar("foco", ativo);
        if (!ativo) requestAnimationFrame(() => moverIndicador());
    }

    function telaCheia() {
        const palco = $("palco");
        if (document.fullscreenElement) document.exitFullscreen();
        else if (palco.requestFullscreen) palco.requestFullscreen().catch(() => avisar("Tela cheia não disponível neste navegador."));
    }

    // ---------- Eventos (registrados uma vez) ----------

    function ligarEventos() {
        $("abas").addEventListener("click", e => {
            const aba = e.target.closest(".aba");
            if (aba) ir(visao.id, aba.dataset.chave);
        });
        $("abas").addEventListener("keydown", e => {
            const abas = [...$("abas").querySelectorAll(".aba")];
            const i = abas.indexOf(document.activeElement);
            if (i < 0) return;
            const destinos = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: abas.length - 1 };
            if (!(e.key in destinos)) return;
            e.preventDefault();
            const alvo = abas[(destinos[e.key] + abas.length) % abas.length];
            alvo.focus();
            ir(visao.id, alvo.dataset.chave);
        });
        $("abas").addEventListener("scroll", marcarCortes, { passive: true });
        // Larguras mudam quando a aba ativa troca (texto aparece/some), então observa as abas também
        const observador = new ResizeObserver(() => moverIndicador());
        observador.observe($("abas"));
        new MutationObserver(() => $("abas").querySelectorAll(".aba").forEach(a => observador.observe(a)))
            .observe($("abas"), { childList: true });

        $("btn-visao").addEventListener("click", e => {
            if (popoverAberto && popoverAberto.pop === $("pop-visao")) return fecharPopover();
            $("busca-visao").value = "";
            renderizarListaVisoes();
            abrirPopover($("pop-visao"), e.currentTarget);
            $("busca-visao").focus();
        });
        $("busca-visao").addEventListener("input", renderizarListaVisoes);
        $("busca-visao").addEventListener("keydown", e => {
            const itens = [...$("lista-visao").querySelectorAll("li[data-id]")];
            const i = itens.findIndex(li => li.classList.contains("realce"));
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const passo = e.key === "ArrowDown" ? 1 : -1;
                realcar(itens[(i + passo + itens.length) % itens.length]);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (itens[i]) escolherVisao(itens[i].dataset.id);
            }
        });
        $("lista-visao").addEventListener("click", e => {
            const li = e.target.closest("li[data-id]");
            if (li) escolherVisao(li.dataset.id);
        });
        $("lista-visao").addEventListener("mousemove", e => {
            const li = e.target.closest("li[data-id]");
            if (li && !li.classList.contains("realce")) realcar(li);
        });

        $("btn-usuario").addEventListener("click", e => {
            if (popoverAberto && popoverAberto.pop === $("pop-usuario")) return fecharPopover();
            abrirPopover($("pop-usuario"), e.currentTarget);
            const pop = $("pop-usuario");
            pop.style.left = `${window.innerWidth - pop.offsetWidth - 8}px`;
        });
        $("btn-sair").addEventListener("click", sair);

        document.addEventListener("pointerdown", e => {
            if (popoverAberto && !popoverAberto.pop.contains(e.target) && !popoverAberto.botao.contains(e.target)) fecharPopover();
        });
        window.addEventListener("blur", () => fecharPopover()); // clique dentro do iframe
        window.addEventListener("resize", () => fecharPopover());

        $("btn-recarregar").addEventListener("click", () => Visualizador.recarregar());
        $("btn-foco").addEventListener("click", () => alternarFoco(true));
        $("btn-sair-foco").addEventListener("click", () => alternarFoco(false));
        $("btn-tela-cheia").addEventListener("click", telaCheia);

        document.addEventListener("keydown", e => {
            if (!perfil) return;
            if (e.key === "Escape") {
                if (popoverAberto) return fecharPopover(true);
                if (document.body.classList.contains("foco")) return alternarFoco(false);
            }
            if (e.ctrlKey || e.metaKey || e.altKey || digitando(e)) return;
            if (/^[1-9]$/.test(e.key)) {
                const p = visao.paginas[Number(e.key) - 1];
                if (p) ir(visao.id, p.chave);
            } else if (e.key === "f" || e.key === "F") {
                alternarFoco();
            } else if (e.key === "r" || e.key === "R") {
                Visualizador.recarregar();
            }
        });

        window.addEventListener("popstate", () => {
            if (!perfil) return;
            const { visaoId, chave } = lerRota();
            ir(visaoId, chave, { historico: false });
        });

        document.addEventListener("visibilitychange", () => {
            if (perfil && document.visibilityState === "visible") verificarSessao();
        });
    }

    // ---------- Início ----------

    function abrir(dados) {
        perfil = dados;
        visao = pagina = null;
        Visualizador.limpar();
        Visualizador.definirRecorte(perfil.recorteRodapePx);

        if (!perfil.visoes.length) {
            Login.mostrar("Seu usuário não tem páginas liberadas. Procure a equipe do CISBAF.");
            return;
        }

        $("btn-visao").disabled = perfil.visoes.length < 2;
        $("btn-usuario").textContent = iniciais(perfil.nome);
        $("usuario-nome").textContent = perfil.nome;
        $("usuario-login").textContent = perfil.usuario;
        document.body.classList.toggle("foco", Local.ler("foco", false) === true);

        mostrarTela("painel");

        const rota = lerRota();
        const ultima = Local.ler(`ultima.${perfil.usuario}`, {}) || {};
        ir(rota.visaoId || ultima.visaoId, rota.chave || ultima.chave, { historico: false });

        clearInterval(verificador);
        verificador = setInterval(verificarSessao, 10 * 60 * 1000);
    }

    return { abrir, ligarEventos };
})();
