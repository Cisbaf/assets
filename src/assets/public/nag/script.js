const sections = document.getElementsByTagName("section");
const urlPrincipalLooker = "https://lookerstudio.google.com/embed/reporting/645c0418-5111-445e-bdc0-6791e22fb09e/page"
var municipio = "";

const acessos = {
    'belfordroxo': {'password': 'e57fde6f1d', 'search': 'BELFORD ROXO'},
    'caxias': {'password': 'a5b3b0d136', 'search': 'DUQUE DE CAXIAS'},
    'itaguai': {'password': 'e898eab2ab', 'search': 'ITAGUAÍ'},
    'japeri': {'password': '25a3d11c77', 'search': 'JAPERI'},
    'mage': {'password': '9a519a0f7d', 'search': 'MAGÉ'},
    'mesquita': {'password': 'b875be9982', 'search': 'MESQUITA'},
    'nilopolis': {'password': 'a013633a31', 'search': 'NILÓPOLIS'},
    'novaiguacu': {'password': '14583cdadc', 'search': 'NOVA IGUAÇU'},
    'paracambi': {'password': 'c926a17e72', 'search': 'PARACAMBI'},
    'queimados': {'password': 'a8e124db44', 'search': 'QUEIMADOS'},
    'saojoao': {'password': '2d0c31fb56', 'search': 'SÃO JOÃO DE MERITI'},
    'seropedica': {'password': '2b5169eb42', 'search': 'SEROPÉDICA'},
}

const mudancas = {
    "DUQUE DE CAXIAS": "DUQUE DE CAXIAS - HOSPITAL MOACIR DO CARMO",
    "ITAGUAÍ": "ITAGUAI",
    "MAGÉ": "MAGE",
    "NILÓPOLIS": "NILOPOLIS",
    "SÃO JOÃO DE MERITI": "SAO JOAO DE MERITI",
    "SEROPÉDICA": "SEROPEDICA",
    "NOVA IGUAÇU": "NOVA IGUAÇU - SEMUS",
}

const mappingParams = {
    "G22MF": "ds0.municipio"
}

async function updateSessionAndPage(municipio, page) {
    return new Promise((resolve, reject)=>{
       try {
        if (!municipio || !page) reject();
        const sessionData = {
            municipio: municipio,
            currentPage: page,
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        resolve();
       } catch {
        reject();
       }
    })
}

function setUrlForIframe(url) {
    const iframe = document.getElementById("lookerIframe");
    iframe.src = url;
}

function makeUrl(page, params) {
    const url = `${urlPrincipalLooker}/${page}?params=${encodeURIComponent(JSON.stringify(params))}`;
    console.log(url);
    return url;
}

function OtherParamsUpdateDashBoard(page) {
    const params = {
        "ds024._cidade": municipio,
        "ds025._cidade": municipio,
        "ds531._cidade": municipio,
    };
    const url = makeUrl(page, params);
    setUrlForIframe(url);
    // Salvar sessão e pagina atual no localStorage
    updateSessionAndPage(municipio, page);
}

function UpdateDashBoard(page, component) {
    const _municipio_ = mudancas[municipio] ? mudancas[municipio] : municipio;
    const param_name = mappingParams[page];
    const param = { [param_name]: municipio.toLowerCase() };
    const url = makeUrl(page, param);
    setUrlForIframe(url);
    // Salvar sessão e pagina atual no localStorage
    updateSessionAndPage(municipio, page);
    try {
        if (component) SetDashboardPageTitle(`Pagina ${component.innerText}`);
        showBackdrop(5000);
    }catch{}
}

function showError(content) {
    const messages = document.getElementById("messages");
    const message = document.createElement("h1");
    message.classList.add("message");
    message.innerText = content;
    messages.appendChild(message);

    console.lof(messages);
    setTimeout(() => {
        messages.removeChild(message);
    }, 5000);
}

function show(id) {
    for (let section of sections) {
        section.style.display = section.id === id ? "" : "none";
    }
}


function Login() {
    const input_login = document.getElementById("user").value;
    const input_pass = document.getElementById("pass").value;

    try {
        if (!input_login || !input_pass) {
            throw new Error("Digite a senha e o usuário!");
        }
        const verific = acessos[input_login];
        if (!verific) {
            throw new Error("Usuário ou senha incorretos!");
        }
        if (verific["password"] != input_pass) {
            throw new Error("Usuário ou senha incorretos!");
        }
        municipio = verific["search"];
        UpdateDashBoard("G22MF");
        show("dash");
        SetDashboardPageTitle("Monitoramento");
    } catch (e) {
        showError(e.message);
    }
}


function Logout() {
    localStorage.removeItem('userSession');
    municipio = "";
    show("login");
}

// Verificar sessão ao carregar a página
const savedSession = localStorage.getItem('userSession');
if (savedSession) {
    try {
        const sessionData = JSON.parse(savedSession);
        municipio = sessionData.municipio;
        show("dash");
        SetDashboardName(municipio);
        UpdateDashBoard(sessionData.currentPage, sessionData.mudar);
    } catch (e) {
        console.error('Erro ao restaurar a sessão:', e);
        localStorage.removeItem('userSession');
        show("login");
    }
} else {
    show("login");
}