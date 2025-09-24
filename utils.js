const path = require("path");
const fs = require("fs");

const JavaScriptObfuscator = require("javascript-obfuscator");


function Ofuscar(html, js, css) {
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(js, {
        compact: true, // Remove espaços extras
        controlFlowFlattening: true, // Dificulta a lógica do código
    }).getObfuscatedCode();

    html = html.replace("<style></style>", `<style>${css}</style>`)
    return html.replace("<script></script>", `<script>${obfuscatedCode}</script>`);
}


function GetPathAfterPublic(_path) {
  return path.join(__dirname, "src/assets/public/" + _path);
}

function LoadFiles(folder_path, files) {
    return  files.map(file => {
      try {
        return fs.readFileSync(path.join(folder_path, file), 'utf8');
      } catch (err) {
        console.error(`Erro ao ler o arquivo ${file}:`, err);
        return '';
      }
    }).join('\n'); // junta com quebras de linha entre os arquivos
}

function UnionFiles(files = []) {
  return files.map(f => f).join("");
}


module.exports = { LoadFiles, GetPathAfterPublic, Ofuscar, UnionFiles};
