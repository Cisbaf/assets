// Comunicação com o servidor e pequenos utilitários de interface.
const Api = {
    async chamar(metodo, caminho, corpo) {
        let resposta;
        try {
            resposta = await fetch(`/gestores/api/${caminho}`, {
                method: metodo,
                credentials: "same-origin",
                headers: corpo ? { "Content-Type": "application/json" } : {},
                body: corpo ? JSON.stringify(corpo) : undefined,
            });
        } catch {
            throw Object.assign(new Error("Sem conexão com o servidor. Verifique sua internet."), { status: 0 });
        }
        const dados = await resposta.json().catch(() => ({}));
        if (!resposta.ok) {
            throw Object.assign(new Error(dados.erro || "Não foi possível concluir a operação."), { status: resposta.status });
        }
        return dados;
    },
    perfil: () => Api.chamar("GET", "perfil"),
    entrar: (usuario, senha) => Api.chamar("POST", "login", { usuario, senha }),
    sair: () => Api.chamar("POST", "logout"),
};

const Local = {
    ler(chave, padrao = null) {
        try { const v = localStorage.getItem(`gestores.${chave}`); return v === null ? padrao : JSON.parse(v); }
        catch { return padrao; }
    },
    gravar(chave, valor) {
        try { localStorage.setItem(`gestores.${chave}`, JSON.stringify(valor)); } catch { /* sem armazenamento */ }
    },
};

function avisar(texto, ms = 3500) {
    const el = document.createElement("div");
    el.className = "aviso";
    el.textContent = texto;
    document.getElementById("avisos").appendChild(el);
    setTimeout(() => el.remove(), ms);
}

function mostrarTela(nome) {
    document.body.dataset.tela = nome;
    document.getElementById("tela-login").hidden = nome !== "login";
    document.getElementById("tela-painel").hidden = nome !== "painel";
}

function digitando(evento) {
    const alvo = evento.target;
    return alvo && (alvo.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName));
}
