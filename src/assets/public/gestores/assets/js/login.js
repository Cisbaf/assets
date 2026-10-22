// Tela de login e inicialização da página.
const Login = (() => {
    const $ = id => document.getElementById(id);

    function erro(texto) {
        const el = $("login-erro");
        el.hidden = !texto;
        el.textContent = texto || "";
        if (texto) { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; }
    }

    function mostrar(mensagem) {
        mostrarTela("login");
        erro(mensagem);
        $("login-senha").value = "";
        const usuario = $("login-usuario");
        if (!usuario.value) usuario.value = Local.ler("ultimoUsuario", "") || "";
        (usuario.value ? $("login-senha") : usuario).focus();
    }

    async function enviar(e) {
        e.preventDefault();
        const usuario = $("login-usuario").value.trim();
        const senha = $("login-senha").value;
        if (!usuario || !senha) return erro("Informe usuário e senha.");

        const botao = $("btn-entrar");
        botao.classList.add("ocupado");
        erro("");
        try {
            const perfil = await Api.entrar(usuario, senha);
            Local.gravar("ultimoUsuario", usuario);
            $("login-senha").value = "";
            Painel.abrir(perfil);
        } catch (err) {
            erro(err.message);
            $("login-senha").select();
        } finally {
            botao.classList.remove("ocupado");
        }
    }

    function ligarEventos() {
        $("form-login").addEventListener("submit", enviar);

        $("ver-senha").addEventListener("click", e => {
            const campo = $("login-senha");
            const mostrarSenha = campo.type === "password";
            campo.type = mostrarSenha ? "text" : "password";
            e.currentTarget.setAttribute("aria-pressed", String(mostrarSenha));
            e.currentTarget.setAttribute("aria-label", mostrarSenha ? "Ocultar senha" : "Mostrar senha");
            e.currentTarget.innerHTML = `<span data-icone="${mostrarSenha ? "eyeOff" : "eye"}"></span>`;
            aplicarIcones(e.currentTarget);
            campo.focus();
        });

        const caps = e => { if (e.getModifierState) $("aviso-caps").hidden = !e.getModifierState("CapsLock"); };
        $("login-senha").addEventListener("keyup", caps);
        $("login-senha").addEventListener("keydown", caps);
    }

    return { mostrar, ligarEventos };
})();

(async function iniciar() {
    aplicarIcones();
    document.querySelectorAll(".ano-atual").forEach(el => { el.textContent = new Date().getFullYear(); });
    Visualizador.iniciar();
    Login.ligarEventos();
    Painel.ligarEventos();
    try {
        Painel.abrir(await Api.perfil());
    } catch (err) {
        Login.mostrar(err.status === 401 ? "" : err.message);
    }
})();
