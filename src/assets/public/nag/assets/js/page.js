const sections = document.getElementsByTagName("section");
const urlPrincipalLooker = "https://lookerstudio.google.com/embed/reporting/645c0418-5111-445e-bdc0-6791e22fb09e/page"

var COUNTRY;

const mappingAuth = {
    'belfordroxo': {'password': 'belfordroxo579', 'search': 'Belford Roxo'},
    'caxias': {'password': 'caxias450', 'search': 'Duque de Caxias'},
    'itaguai': {'password': 'itaguai689', 'search': 'Itaguai'},
    'japeri': {'password': 'japeri25a', 'search': 'Japeri'},
    'mage': {'password': 'mage905', 'search': 'Magé'},
    'mesquita': {'password': 'mesquita087', 'search': 'Mesquita'},
    'nilopolis': {'password': 'nilopolis601', 'search': 'Nilópolis'},
    'novaiguacu': {'password': 'novaiguacu145', 'search': 'Nova Iguaçu'},
    'queimados': {'password': 'queimados787', 'search': 'Queimados'},
    'saojoao': {'password': 'saojoao236', 'search': 'São João de Meriti'}, // ?
    'seropedica': {'password': 'seropedica265', 'search': 'Seropedica'},
}


const mappingPages = {
    "G22MF": {params: "ds0.municipio", title: "Monitoramento"},
    "p_vy1tgkq4sd": {params: "ds2.municipio", title: "Pactuado"},
    "p_n0gowcq6sd": {params: "ds2.municipio", title: "Pactuado x Informado", secondParams: "ds0.municipio"},
    "p_3j7qsvxjtd": {params: "ds0.municipio", title: "Beneficiados pelo PMAE"},
    "p_c51yrn0jtd": {params: "ds0.municipio", title: "Absenteísmo nas atividades OCI"},
    "p_d62oi0juud": {params: "ds0.municipio", title: "OCI por CID"},
    "p_9llnbgdatd": {params: "ds10.municipio", title: "Monitora Produção TABNET"},
    "p_vflv15fctd": {params: "ds8.municipio", title: "Etapas Plano de Ação"},
}

async function updateSessionAndPage(country, page) {
    return new Promise((resolve, reject)=>{
       try {
        if (!country || !page) reject();
        const sessionData = {
            country: country,
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
    iframe.onload = function () {
        hideBackdrop();
    };

    iframe.src = url;
}

function makeUrl(page, params) {
    const url = `${urlPrincipalLooker}/${page}?params=${encodeURIComponent(JSON.stringify(params))}`;
    return url;
}

function UpdateDashBoard(page_url) {
    try {
        updateSessionAndPage(COUNTRY, page_url);
        showBackdrop(5000);
        const page = mappingPages[page_url];
        const param1 = page["params"];
        const param2 = page["secondParams"];
        const params = { [param1]: COUNTRY };
        if (param2) {
            params[param2] = COUNTRY;
        }
        const url = makeUrl(page_url, params);
        setUrlForIframe(url);
        // Salvar sessão e pagina atual no localStorage
        HighlightMenu(page["title"]);

    } catch (e) {
        showError("Erro ao tentar atualizar dashboard" + String(e));
    }

}

function showError(content) {
    const messages = document.getElementById("messages");
    const message = document.createElement("h1");
    message.classList.add("message");
    message.innerText = content;
    messages.appendChild(message);

    setTimeout(() => {
        messages.removeChild(message);
    }, 3000);
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
        const verific = mappingAuth[input_login];
        if (!verific) {
            throw new Error("Usuário ou senha incorretos!");
        }
        if (verific["password"] != input_pass) {
            throw new Error("Usuário ou senha incorretos!");
        }
        COUNTRY = verific["search"];
        UpdateDashBoard("G22MF");
        show("dash");
        SetDashboardName(COUNTRY);
    } catch (e) {
        showError(e.message);
    }
}

function Logout() {
    showBackdrop(1000);
    setTimeout(()=>{
        localStorage.removeItem('userSession');
        COUNTRY = "";
        show("login");
    }, 1000);
}

// Verificar sessão ao carregar a página
const savedSession = localStorage.getItem('userSession');
if (savedSession) {
    try {
        const sessionData = JSON.parse(savedSession);
        COUNTRY = sessionData.country;
        show("dash");
        SetDashboardName(COUNTRY);
        UpdateDashBoard(sessionData.currentPage);
    } catch (e) {
        console.error('Erro ao restaurar a sessão:', e);
        localStorage.removeItem('userSession');
        show("login");
    }
} else {
    show("login");
}