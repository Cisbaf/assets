// API do Painel dos Gestores: login, logout e perfil (visões/páginas liberadas para o usuário).
const express = require("express");
const auth = require("./auth.js");
const dados = require("./dados.js");

const router = express.Router();
router.use(express.json({ limit: "10kb" }));
router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

function usuarioDaSessao(req) {
    const sessao = auth.lerToken(auth.lerCookie(req, auth.COOKIE));
    if (!sessao) return null;
    const usuario = dados.usuarios()[sessao.u];
    if (!usuario || usuario.ativo === false) return null;
    if (auth.versaoSenha(usuario) !== sessao.v) return null;
    return { login: sessao.u, ...usuario };
}

function perfil(usuario) {
    const { config } = dados.catalogo();
    return {
        usuario: usuario.login,
        nome: usuario.nome || usuario.login,
        master: usuario.master === true,
        titulo: config.titulo,
        subtitulo: config.subtitulo,
        recorteRodapePx: config.powerbi.recorteRodapePx || 0,
        visoes: dados.visoesDoUsuario(usuario).map(v => ({
            id: v.id,
            nome: v.nome,
            master: v.master,
            entrada: v.entrada,
            paginas: v.paginas,
        })),
    };
}

router.post("/login", (req, res) => {
    const login = String((req.body && req.body.usuario) || "").trim().toLowerCase();
    const senha = String((req.body && req.body.senha) || "");
    if (!login || !senha) return res.status(400).json({ erro: "Informe usuário e senha." });

    const chave = auth.chaveTentativa(req, login);
    const ate = auth.bloqueadoAte(chave);
    if (ate) {
        const minutos = Math.ceil((ate - Date.now()) / 60000);
        return res.status(429).json({ erro: `Muitas tentativas. Tente novamente em ${minutos} min.` });
    }

    const usuario = dados.usuarios()[login];
    const ok = auth.conferirSenha(senha, usuario ? usuario.senha : auth.HASH_FALSO);
    if (!usuario || !ok || usuario.ativo === false) {
        auth.registrarFalha(chave);
        return res.status(401).json({ erro: "Usuário ou senha incorretos." });
    }
    auth.limparFalhas(chave);

    const horas = dados.catalogo().config.sessaoHoras || 12;
    res.set("Set-Cookie", auth.cookieSessao(req, auth.criarToken(login, usuario, horas), horas * 3600));
    res.json(perfil({ login, ...usuario }));
});

router.post("/logout", (req, res) => {
    res.set("Set-Cookie", auth.cookieSessao(req, "", 0));
    res.json({ ok: true });
});

router.get("/perfil", (req, res) => {
    const usuario = usuarioDaSessao(req);
    if (!usuario) return res.status(401).json({ erro: "Sessão expirada. Entre novamente." });
    res.json(perfil(usuario));
});

router.use((err, req, res, next) => {
    console.error("[gestores]", err);
    res.status(500).json({ erro: "Erro interno. Tente novamente em instantes." });
});

module.exports = router;
