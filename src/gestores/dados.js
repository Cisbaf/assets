// Leitura dos arquivos JSON do painel (sem banco de dados).
// Os arquivos são relidos automaticamente quando mudam no disco, sem reiniciar o servidor.
const fs = require("fs");
const path = require("path");

const DIR = process.env.GESTORES_DIR || __dirname;

const ARQUIVOS = {
    config: path.join(DIR, "config.json"),
    paginas: path.join(DIR, "paginas_gestores.json"),
    usuarios: path.join(DIR, "usuarios.json"),
};

const cache = {};

function lerJson(nome) {
    const arquivo = ARQUIVOS[nome];
    const mtime = fs.statSync(arquivo).mtimeMs;
    if (!cache[nome] || cache[nome].mtime !== mtime) {
        cache[nome] = { mtime, dados: JSON.parse(fs.readFileSync(arquivo, "utf8")) };
        if (nome !== "usuarios") cache.catalogo = null;
    }
    return cache[nome].dados;
}

function slug(texto) {
    return String(texto)
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function urlPowerBI(config, pageName) {
    return `https://app.powerbi.com/view?r=${encodeURIComponent(config.powerbi.r)}`
        + `&pageName=${encodeURIComponent(pageName)}&navContentPaneEnabled=false`;
}

function montarPaginas(config, paginas) {
    return paginas
        .filter(p => !p.oculta)
        .map(p => {
            const chave = p.chave || slug(p.base || p.titulo);
            const secao = config.secoes[chave] || {};
            return {
                chave,
                titulo: secao.titulo || p.base || p.titulo,
                curto: secao.curto || p.base || p.titulo,
                icone: secao.icone || "chart",
                url: urlPowerBI(config, p.id),
            };
        });
}

// Catálogo: todas as "visões" (master + uma por gestor/município) com suas páginas.
function catalogo() {
    const config = lerJson("config");
    const fonte = lerJson("paginas");
    if (cache.catalogo) return cache.catalogo;

    const visoes = new Map();
    if (fonte.paginas_master && fonte.paginas_master.length) {
        const paginas = montarPaginas(config, fonte.paginas_master);
        visoes.set(config.visaoMaster.id, {
            id: config.visaoMaster.id,
            nome: config.visaoMaster.nome,
            master: true,
            paginas,
            entrada: paginas[0] && paginas[0].chave,
        });
    }
    for (const g of fonte.gestores) {
        const paginas = montarPaginas(config, g.paginas);
        const entrada = g.paginas.find(p => p.id === g.pagina_entrada);
        visoes.set(g.gestor, {
            id: g.gestor,
            nome: g.municipio,
            master: false,
            paginas,
            entrada: entrada ? (entrada.chave || slug(entrada.base)) : paginas[0] && paginas[0].chave,
        });
    }

    cache.catalogo = { config, visoes };
    return cache.catalogo;
}

function usuarios() {
    return lerJson("usuarios").usuarios || {};
}

function salvarUsuarios(lista) {
    const ordenado = Object.fromEntries(Object.keys(lista).sort().map(k => [k, lista[k]]));
    fs.writeFileSync(ARQUIVOS.usuarios, JSON.stringify({ usuarios: ordenado }, null, 2) + "\n");
}

// Visões que um usuário pode abrir, na ordem do catálogo.
function visoesDoUsuario(usuario) {
    const { visoes } = catalogo();
    return [...visoes.values()].filter(v => {
        if (v.master) return usuario.master === true;
        if (usuario.master || usuario.gestores === "*") return true;
        return Array.isArray(usuario.gestores) && usuario.gestores.includes(v.id);
    });
}

module.exports = { ARQUIVOS, catalogo, usuarios, salvarUsuarios, visoesDoUsuario, slug };
