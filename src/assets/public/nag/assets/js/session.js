const MAP_AUTH = {
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
    'cisbaf': {'password': "cisbaf_nag"},
    'caosaudepjtcs': {'password': 'caosaudepjtcs'}
}

const SEARCH_ALL = Object.values(MAP_AUTH)
.map(obj=>obj.search)
.filter(obj=>obj).join("|");

MAP_AUTH['caosaudepjtcs']['search'] = SEARCH_ALL;


const SESSION = {
    auth: null,
    currentPage: null,
};

let callbackUpdateDashboard = null; // lugar onde vamos guardar a função
let callbackUpdateSelection = null;

function SetCallbackUpdateDashboard(f) {
    if (typeof f === "function") {
        callbackUpdateDashboard = f;
    } else {
        console.error("O parâmetro precisa ser uma função");
    }
}

function SetCallbackUpdateSelection(f) {
    if (typeof f === "function") {
        callbackUpdateSelection = f;
    } else {
        console.error("O parâmetro precisa ser uma função");
    }
}

const IsAdm = () => SESSION.auth === "cisbaf";


function showSection(id) {
    for (let section of document.getElementsByTagName("section")) {
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
        const auth = MAP_AUTH[input_login.toLocaleLowerCase()];
        if (!auth) {
            throw new Error("Usuário ou senha incorretos!");
        }
        if (auth["password"] != input_pass) {
            throw new Error("Usuário ou senha incorretos!");
        }
        SESSION.auth = input_login;
        try {
            callbackUpdateDashboard(SESSION.currentPage);
            callbackUpdateSelection();
        } catch(e) {
            showError("Erro inesperado, envie um print para os desenvolvedores!" + String(e), "top-center");
        }
        showSection("dash");
    } catch (e) {
        showError(e.message, "page-login");
    }
}


function Logout() {
    showBackdrop(1000);
    localStorage.removeItem('userSession');
    SESSION.auth = null;
    SESSION.currentPage = null;
    setTimeout(()=>{
        showSection("login");
        window.location.reload();
    }, 1000);
}

async function SaveSession(currentPage) {
    if (currentPage) {
        SESSION.currentPage = currentPage;
    }
    localStorage.setItem('userSession', JSON.stringify(SESSION));
}

// utils
function GetSelectOptions() {
    const infos = Object.keys(MAP_AUTH).map(key=>{
        if (key == "cisbaf") return;
        if (key == "caosaudepjtcs") return;
        return {[key]: MAP_AUTH[key].search};
    });

    return infos;
}

function GetNameForSearch(hacked) {
    if (IsAdm()) {
        if (hacked == "all" || !hacked) return SEARCH_ALL;
        if (hacked) return MAP_AUTH[hacked].search;
    }
    return MAP_AUTH[SESSION.auth].search;
}

function GetNameForTitle(hacked) {
    if (IsAdm()) return "Cisbaf";
    if (SESSION.auth === "caosaudepjtcs") return "MINISTÉRIO PÚBLICO";
    return MAP_AUTH[SESSION.auth].search;
}

window.addEventListener("load", ()=>{
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
        try {
            const sessionData = JSON.parse(savedSession);
            SESSION.auth = sessionData.auth;
            SESSION.currentPage = sessionData.currentPage;
            callbackUpdateDashboard(SESSION.currentPage);
            showSection("dash");
        } catch (e) {
            console.error('Erro ao restaurar a sessão:', e);
            localStorage.removeItem('userSession');
            showSection("login");
        }
    } else {
        showSection("login");
    }
});

function showError(content, position = "top-right") {
    const messages = document.createElement("div");
    messages.style.position = "fixed";
    messages.style.zIndex = "9999";

    // define posição
    switch (position) {
        case "top-left":
            messages.style.top = "100px";
            messages.style.left = "100px";
            break;
        case "top-right":
            messages.style.top = "10px";
            messages.style.right = "10px";
            break;
        case "top-center":
            messages.style.top = "100px";
            messages.style.left = "40%";
            break;
        case "page-login":
            messages.style.top = "100px";
            messages.style.left = "17%";
            break;
        case "bottom-left":
            messages.style.bottom = "10px";
            messages.style.left = "10px";
            break;
        case "bottom-right":
            messages.style.bottom = "10px";
            messages.style.right = "10px";
            break;
        case "center":
            messages.style.top = "40%";
            messages.style.left = "40%";
            messages.style.transform = "translate(-50%, -50%)";
            break;
    }

    const message = document.createElement("h1");
    message.classList.add("message");
    message.innerText = content;
    messages.appendChild(message);
    document.body.appendChild(messages);

    setTimeout(() => {
        messages.remove();
    }, 3000);
}
