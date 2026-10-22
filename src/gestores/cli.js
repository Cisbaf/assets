#!/usr/bin/env node
// Gerencia os acessos do Painel dos Gestores (arquivo usuarios.json).
//
//   node src/gestores/cli.js listar
//   node src/gestores/cli.js criar <login> --nome "Belford Roxo" --gestores G1 [--senha X]
//   node src/gestores/cli.js criar <login> --nome "CISBAF" --master
//   node src/gestores/cli.js criar <login> --nome "Ministério Público" --gestores "*"
//   node src/gestores/cli.js senha <login> [--senha X]
//   node src/gestores/cli.js ativar <login> | desativar <login> | remover <login>
//   node src/gestores/cli.js visoes
//
// Sem --senha, uma senha aleatória é gerada e exibida uma única vez.
const fs = require("fs");
const auth = require("./auth.js");
const dados = require("./dados.js");

function argumentos(lista) {
    const opcoes = { _: [] };
    for (let i = 0; i < lista.length; i++) {
        const a = lista[i];
        if (!a.startsWith("--")) opcoes._.push(a);
        else if (lista[i + 1] && !lista[i + 1].startsWith("--")) opcoes[a.slice(2)] = lista[++i];
        else opcoes[a.slice(2)] = true;
    }
    return opcoes;
}

function sair(msg) {
    console.error(msg);
    process.exit(1);
}

function carregar() {
    if (!fs.existsSync(dados.ARQUIVOS.usuarios)) return {};
    return dados.usuarios();
}

function validarGestores(valor) {
    if (valor === "*") return "*";
    const validos = [...dados.catalogo().visoes.values()].filter(v => !v.master).map(v => v.id);
    const lista = String(valor).split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
    const invalidos = lista.filter(g => !validos.includes(g));
    if (invalidos.length) sair(`Gestor(es) inexistente(s): ${invalidos.join(", ")}. Válidos: ${validos.join(", ")}`);
    return lista;
}

function descreverAcesso(u) {
    if (u.master) return "MASTER (consolidado + todos)";
    if (u.gestores === "*") return "todos os municípios";
    const { visoes } = dados.catalogo();
    return (u.gestores || []).map(g => `${g} ${visoes.get(g) ? visoes.get(g).nome : "?"}`).join(", ");
}

const [comando, ...resto] = process.argv.slice(2);
const op = argumentos(resto);
const login = (op._[0] || "").toLowerCase();
const lista = carregar();

switch (comando) {
    case "listar": {
        const linhas = Object.entries(lista).map(([l, u]) => ({
            login: l, nome: u.nome, acesso: descreverAcesso(u), ativo: u.ativo === false ? "não" : "sim",
        }));
        console.table(linhas);
        break;
    }
    case "visoes": {
        console.table([...dados.catalogo().visoes.values()].map(v => ({
            id: v.id, nome: v.nome, paginas: v.paginas.map(p => p.curto).join(" | "),
        })));
        break;
    }
    case "criar": {
        if (!/^[a-z0-9._-]{3,40}$/.test(login)) sair("Login inválido (use 3-40 caracteres: letras, números, . _ -).");
        if (lista[login] && !op.substituir) sair(`Usuário "${login}" já existe (use --substituir para recriar).`);
        if (!op.master && !op.gestores) sair("Informe --gestores G1[,G2...] ou \"*\", ou --master.");
        const senha = typeof op.senha === "string" ? op.senha : auth.gerarSenhaAleatoria();
        lista[login] = {
            nome: typeof op.nome === "string" ? op.nome : login,
            senha: auth.gerarHash(senha),
            ...(op.master ? { master: true } : { gestores: validarGestores(op.gestores) }),
        };
        dados.salvarUsuarios(lista);
        console.log(`Usuário "${login}" criado — acesso: ${descreverAcesso(lista[login])}`);
        if (typeof op.senha !== "string") console.log(`Senha: ${senha}`);
        break;
    }
    case "senha": {
        if (!lista[login]) sair(`Usuário "${login}" não encontrado.`);
        const senha = typeof op.senha === "string" ? op.senha : auth.gerarSenhaAleatoria();
        lista[login].senha = auth.gerarHash(senha);
        dados.salvarUsuarios(lista);
        console.log(`Senha de "${login}" alterada (sessões abertas foram encerradas).`);
        if (typeof op.senha !== "string") console.log(`Nova senha: ${senha}`);
        break;
    }
    case "ativar":
    case "desativar": {
        if (!lista[login]) sair(`Usuário "${login}" não encontrado.`);
        if (comando === "ativar") delete lista[login].ativo;
        else lista[login].ativo = false;
        dados.salvarUsuarios(lista);
        console.log(`Usuário "${login}" ${comando === "ativar" ? "ativado" : "desativado"}.`);
        break;
    }
    case "remover": {
        if (!lista[login]) sair(`Usuário "${login}" não encontrado.`);
        delete lista[login];
        dados.salvarUsuarios(lista);
        console.log(`Usuário "${login}" removido.`);
        break;
    }
    default:
        console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 13).map(l => l.replace(/^\/\/ ?/, "")).join("\n"));
}
