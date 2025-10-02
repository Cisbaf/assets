const express = require("express");
const path = require("path");
const app = express();
const cors = require('cors');

const { LoadFiles, GetPathAfterPublic, Ofuscar, UnionFiles } = require("./utils.js");

app.use(express.static(__dirname + '/src/assets'));
app.use(cors());

// Função genérica para rotas que carregam HTML + CSS + JS
function servePage(route, htmlFiles, jsFiles = [], cssFiles = [], components = []) {
    app.get(route, (req, res) => {
        const htmlContent = LoadFiles(GetPathAfterPublic(route.slice(1)), htmlFiles);
        const jsContent = LoadFiles(GetPathAfterPublic(`${route.slice(1)}/assets/js`), jsFiles);
        const cssContent = LoadFiles(GetPathAfterPublic(`${route.slice(1)}/assets/css`), cssFiles);
        const componentsContent = LoadFiles(GetPathAfterPublic(`${route.slice(1)}/assets/components`), components);
        const result = Ofuscar(htmlContent, jsContent.concat(componentsContent), cssContent);
        res.send(result);
    });
}

function serveFile(route, path) {
  app.get(route, (req, res) => {
      res.sendFile(path);
  })
}

// Rota Nag
servePage("/nag", ["index.html"], ["backdrop.js", "floating.js", "menu.js", "session.js", "page.js"], 
        ['style.css', 'login.css', 'menu.css', 'divFloating.css'],
        ["select-municipio.js"]
        );

// Rota Indicadores
servePage("/relatorios", ["index.html"], ["script.js"], ["style.css"]);

// Rota Cartilha
servePage("/cartilha", ["index.html"]);

// Rotas Static Nag
serveFile("/nag/logo", GetPathAfterPublic("nag/assets/img/cisbaf_logo.png"));
serveFile("/nag/background", GetPathAfterPublic("nag/assets/img/flat.png"));
serveFile("/nag/fav", GetPathAfterPublic("nag/assets/img/favicon.ico"));
serveFile("/nag/banner", GetPathAfterPublic("nag/assets/img/banner.png"))


// Inicialização do servidor
app.listen(8000, () => {
    console.log("Servidor inicializado na porta 8000!");
});
