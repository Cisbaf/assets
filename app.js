const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const cors = require('cors');

const { Ofuscar } = require("./transform.js");

app.use(express.static(__dirname+'/src/assets'));
app.use(require('cors')());

app.get('/', (req, res)=>{
    res.redirect("/relatorios");
})

app.get("/duvidas-nep",(req,res)=>{
res.sendFile(__dirname+"/src/assets/public/duvidas-nep/index.html");
})

app.get("/cartilha",(req,res)=>{
res.sendFile(__dirname+"/src/assets/public/cartilha/index.html");
})

app.get("/relatorios", (req, res)=>{
    const htmlPath = path.join(__dirname, "src/assets/public/relatorios/index.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    const jsPath = path.join(__dirname, "src/assets/public/relatorios/script.js")
    const jsContent = fs.readFileSync(jsPath, "utf8");
    const cssPath = path.join(__dirname, "src/assets/public/relatorios/style.css")
    const cssContent = fs.readFileSync(cssPath, "utf8");
    const result = Ofuscar(htmlContent, jsContent, cssContent);
    res.send(result);
})

app.get("/nag", (req, res)=>{
    const htmlPath = path.join(__dirname, "src/assets/public/nag/index.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    const jsPath = path.join(__dirname, "src/assets/public/nag/script.js")
    const jsContent = fs.readFileSync(jsPath, "utf8");
    const menuPath = path.join(__dirname, "src/assets/public/nag/menufloating.js")
    const menuContent = fs.readFileSync(menuPath, "utf8");
    const backdropPath = path.join(__dirname, "src/assets/public/nag/backdrop.js")
    const backdropContent = fs.readFileSync(backdropPath, "utf8");
    const union = `${backdropContent}\n\n${menuContent}\n\n${jsContent}`;
    const cssPath = path.join(__dirname, "src/assets/public/nag/style.css")
    const cssContent = fs.readFileSync(cssPath, "utf8");
    const result = Ofuscar(htmlContent, union, cssContent);
    res.send(result);
})

app.get("/nag/logo", (req, res)=>{
  const logo = path.join(__dirname, "src/assets/public/nag/assets/cisbaf_logo.png");
  res.sendFile(logo); // envia o arquivo de imagem
})

app.get("/nag/background", (req, res)=>{
  const logo = path.join(__dirname, "src/assets/public/nag/assets/flat.png");
  res.sendFile(logo); // envia o arquivo de imagem
})

app.listen("8000",()=>{
    console.log("Servidor inicializado!");
})
