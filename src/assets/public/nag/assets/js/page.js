const sections = document.getElementsByTagName("section");
const urlPrincipalLooker = "https://lookerstudio.google.com/embed/reporting/645c0418-5111-445e-bdc0-6791e22fb09e/page"

var HACKED_AUTH;

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

const FIRST_PAGE = Object.keys(mappingPages)[0];

function setUrlForIframe(url) {
    const iframe = document.getElementById("lookerIframe");
    const start = performance.now(); // marca o início

    iframe.onload = function () {
        const end = performance.now();
        const loadTime = (end - start) / 1000; // segundos

        if (loadTime <= 3) {
            console.log("Carregamento normal (" + loadTime.toFixed(2) + "s)");
        } else if (loadTime <= 6) {
            console.log("Carregamento médio (" + loadTime.toFixed(2) + "s)");
        } else {
            console.log("Carregamento lento (" + loadTime.toFixed(2) + "s)");
        }

        hideBackdrop();
    };

    iframe.src = url;
}

function makeUrl(page, params) {
    const url = `${urlPrincipalLooker}/${page}?params=${encodeURIComponent(JSON.stringify(params))}`;
    return url;
}

function UpdateDashBoard(page_url) {
    const page_key = page_url? page_url : FIRST_PAGE; 
    try {
        // Salvar sessão e pagina atual no localStorage
        const page = mappingPages[page_key];
        const param1 = page["params"];
        const param2 = page["secondParams"];
        const pageSearch = GetNameForSearch(HACKED_AUTH);
        if (!pageSearch) {
            SaveSession(page_key);
            showError("Selecione um municipio para continuar!", "center");
            return;
        }
        showBackdrop(5000);
        const params = { [param1]: pageSearch };
        if (param2) {
            params[param2] = pageSearch;
        }
        const url = makeUrl(page_key, params);
        setUrlForIframe(url);
        SetDashboardName(pageSearch);
        HighlightMenu(page["title"]);
    } catch (e) {
        showError("Erro ao tentar atualizar dashboard" + String(e));
    }
}

window.addEventListener("municipioChange", (e)=>{
    const value = e.detail.value;
    if (!value) return;
    HACKED_AUTH = value;
    UpdateDashBoard();
});

SetCallbackUpdateDashboard(UpdateDashBoard);