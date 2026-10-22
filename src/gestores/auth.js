// Senhas com scrypt e sessão em cookie assinado (HMAC) — nada fica guardado no servidor.
const crypto = require("crypto");

const COOKIE = "gestores_sessao";

let SEGREDO = process.env.GESTORES_SESSION_SECRET;

function segredo() {
    if (!SEGREDO) {
        SEGREDO = crypto.randomBytes(32).toString("hex");
        console.warn("[gestores] GESTORES_SESSION_SECRET não definido: as sessões serão perdidas ao reiniciar o servidor.");
    }
    return SEGREDO;
}

// ---------- Senhas ----------

function gerarHash(senha) {
    const sal = crypto.randomBytes(16);
    const hash = crypto.scryptSync(senha, sal, 64);
    return `scrypt$${sal.toString("base64")}$${hash.toString("base64")}`;
}

function conferirSenha(senha, armazenado) {
    const [tipo, sal, hash] = String(armazenado || "").split("$");
    if (tipo !== "scrypt" || !sal || !hash) return false;
    const esperado = Buffer.from(hash, "base64");
    const obtido = crypto.scryptSync(String(senha), Buffer.from(sal, "base64"), esperado.length);
    return crypto.timingSafeEqual(esperado, obtido);
}

// Hash usado para comparar tempo de resposta quando o usuário não existe.
const HASH_FALSO = gerarHash(crypto.randomBytes(8).toString("hex"));

function gerarSenhaAleatoria(tamanho = 12) {
    const alfabeto = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from(crypto.randomBytes(tamanho), b => alfabeto[b % alfabeto.length]).join("");
}

// ---------- Sessão ----------

// A "versão" muda quando a senha muda, derrubando sessões antigas.
function versaoSenha(usuario) {
    return crypto.createHash("sha256").update(usuario.senha || "").digest("base64url").slice(0, 10);
}

function assinar(texto) {
    return crypto.createHmac("sha256", segredo()).update(texto).digest("base64url");
}

function criarToken(login, usuario, horas) {
    const corpo = Buffer.from(JSON.stringify({
        u: login,
        v: versaoSenha(usuario),
        exp: Date.now() + horas * 3600 * 1000,
    })).toString("base64url");
    return `${corpo}.${assinar(corpo)}`;
}

function lerToken(token) {
    const [corpo, assinatura] = String(token || "").split(".");
    if (!corpo || !assinatura) return null;
    const esperado = Buffer.from(assinar(corpo));
    const recebido = Buffer.from(assinatura);
    if (esperado.length !== recebido.length || !crypto.timingSafeEqual(esperado, recebido)) return null;
    try {
        const dados = JSON.parse(Buffer.from(corpo, "base64url").toString());
        return dados.exp > Date.now() ? dados : null;
    } catch {
        return null;
    }
}

function lerCookie(req, nome) {
    const cabecalho = req.headers.cookie || "";
    for (const parte of cabecalho.split(";")) {
        const i = parte.indexOf("=");
        if (i > -1 && parte.slice(0, i).trim() === nome) return decodeURIComponent(parte.slice(i + 1).trim());
    }
    return null;
}

function cookieSessao(req, valor, maxAgeSeg) {
    const seguro = req.secure || req.headers["x-forwarded-proto"] === "https";
    return [
        `${COOKIE}=${encodeURIComponent(valor)}`,
        "Path=/gestores",
        "HttpOnly",
        "SameSite=Strict",
        `Max-Age=${maxAgeSeg}`,
        seguro ? "Secure" : "",
    ].filter(Boolean).join("; ");
}

// ---------- Limite de tentativas (memória) ----------

const JANELA_MS = 15 * 60 * 1000;
const MAX_FALHAS = 5;
const falhas = new Map();

function chaveTentativa(req, login) {
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    return `${ip}|${login}`;
}

function bloqueadoAte(chave) {
    const f = falhas.get(chave);
    if (!f) return 0;
    if (Date.now() - f.inicio > JANELA_MS) {
        falhas.delete(chave);
        return 0;
    }
    return f.qtd >= MAX_FALHAS ? f.inicio + JANELA_MS : 0;
}

function registrarFalha(chave) {
    const f = falhas.get(chave);
    if (!f || Date.now() - f.inicio > JANELA_MS) falhas.set(chave, { qtd: 1, inicio: Date.now() });
    else f.qtd++;
}

setInterval(() => {
    const agora = Date.now();
    for (const [k, f] of falhas) if (agora - f.inicio > JANELA_MS) falhas.delete(k);
}, JANELA_MS).unref();

module.exports = {
    COOKIE, gerarHash, conferirSenha, HASH_FALSO, gerarSenhaAleatoria, versaoSenha,
    criarToken, lerToken, lerCookie, cookieSessao,
    chaveTentativa, bloqueadoAte, registrarFalha, limparFalhas: chave => falhas.delete(chave),
};
