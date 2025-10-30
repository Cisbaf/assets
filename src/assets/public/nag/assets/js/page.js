const sections = document.getElementsByTagName("section");
const urlPrincipalLooker = "https://lookerstudio.google.com/embed/reporting/645c0418-5111-445e-bdc0-6791e22fb09e/page"

var HACKED_AUTH;

const mappingPages = {
    "G22MF": { title: "Monitoramento", paramsList: ["ds0.municipio"] },
    "p_vy1tgkq4sd": { title: "Pactuado", paramsList: ["ds2.municipio"] },
    "p_n0gowcq6sd": { title: "Pactuado x Informado", paramsList: ["ds2.municipio", "ds0.municipio", "ds16.municipio"] },
    "p_3j7qsvxjtd": { title: "Beneficiados pelo PMAE", paramsList: ["ds0.municipio"] },
    "p_c51yrn0jtd": { title: "Absenteísmo nas atividades OCI", paramsList: ["ds0.municipio", "ds12.municipio"] },
    "p_d62oi0juud": { title: "OCI por CID", paramsList: ["ds0.municipio"] },
    "p_o7q7ob94wd": { title: "CNES Habilitados por Status", paramsList: ["ds12.municipio", "ds14.municipio"] },
    "p_j0s7vs35wd": { title: "Geo Localização Estabelecimentos", paramsList: ["ds12.municipio"] },
    // "p_9llnbgdatd": { title: "TABNET: Quantidade Aprovada", paramsList: ["ds10.municipio"] },
    "p_pzc3jab6wd": { title: "TABNET: Quantidade Apresentada e Executada", paramsList: ["ds10.municipio"] },
    "p_vngu6rc6wd": { title: "CNES Habilitações", paramsList: ["ds14.municipio"] },
    "p_vflv15fctd": { title: "Etapas Plano de Ação", paramsList: ["ds8.municipio"] },
    "p_51ifyssrtd": { title: "Check list_Quadro Geral", paramsList: ["ds4.municipio"] },
};

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
    const page_key = page_url || FIRST_PAGE; 

    try {
        SaveSession(page_key);

        const page = mappingPages[page_key];
        const pageSearch = GetNameForSearch(HACKED_AUTH);

        showBackdrop(0, `${page.title.toUpperCase()}...`);

        // Monta automaticamente o objeto de parâmetros
        const params = {};
        page.paramsList.forEach(paramKey => {
            params[paramKey] = pageSearch;
        });

        const url = makeUrl(page_key, params);
        setUrlForIframe(url);

        HighlightMenu(page.title);
        SetDashboardName(GetNameForTitle(HACKED_AUTH));
    } catch (e) {
        showError("Erro ao tentar atualizar dashboard: " + String(e));
    }
}


window.addEventListener("municipioChange", (e)=>{
    const value = e.detail.value;
    if (!value) return;
    HACKED_AUTH = value;
    UpdateDashBoard();
});

SetCallbackUpdateDashboard(UpdateDashBoard);