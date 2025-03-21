const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const { Ofuscar } = require("./transform.js");

app.use(express.static(__dirname+'/src/assets'));

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

app.listen("8002",()=>{})

