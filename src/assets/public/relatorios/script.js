const sections = document.getElementsByTagName("section");
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


function Login() {
    const input_login = document.getElementById("user").value;
    const input_pass = document.getElementById("pass").value;

    try{
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
        UpdateDashBoard("p_sbunr82lkd", true);
        show("dash");
    }catch (e) {
        showError(e.message);
    }

}

function UpdateDashBoard(page, mudar) {
    var url;
    if (mudar) {
        const _municipio_ = mudancas[municipio]? mudancas[municipio] : municipio
        url = `https://lookerstudio.google.com/embed/reporting/bee3dcaf-bd6e-41a0-ab2f-79f921aacc2a/page/${page}?params=${encodeURIComponent(
            JSON.stringify({
                "ds400._cidade": _municipio_
            })
        )}`
    } else {
        url = `https://lookerstudio.google.com/embed/reporting/bee3dcaf-bd6e-41a0-ab2f-79f921aacc2a/page/${page}?params=${encodeURIComponent(
            JSON.stringify({
                "ds298._cidade": municipio,
                "ds371._cidade": municipio,
                "ds385._cidade": municipio
            })
        )}`
    }

    const iframe = document.getElementById("lookerIframe");
    iframe.src  = url;

}

function showError(content) {
    const messages = document.getElementById("messages");
    const message = document.createElement("h1");
    message.classList.add("message"); // Adiciona a classe CSS
    message.innerText = content;
    messages.appendChild(message);

    // Remove a mensagem após 5 segundos (duração da animação)
    setTimeout(() => {
        messages.removeChild(message);
    }, 5000);
}

function show(id) {
    for(let section of sections) {
        if (section.id == id) {
            section.style.display = "";
        } else {
            section.style.display = "none";
        }
    }
}

show("login");
