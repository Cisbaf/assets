
const JavaScriptObfuscator = require("javascript-obfuscator");

function Ofuscar(html, js, css) {
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(js, {
        compact: true, // Remove espaços extras
        controlFlowFlattening: true, // Dificulta a lógica do código
    }).getObfuscatedCode();

    html = html.replace("<style></style>", `<style>${css}</style>`)
    return html.replace("<script></script>", `<script>${obfuscatedCode}</script>`);
}


module.exports = { Ofuscar };
