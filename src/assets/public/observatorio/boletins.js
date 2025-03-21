const configAPI = Object.create({
    ip: "observatorio.cisbaf.org.br/api",
    route: "livreto",
    system: "observatorio"
})


function CreateCard(obj){
    
    return `
         <div class="item">
            <div class="card-doctor">
                <div class="header">
                    <img src="https://${configAPI.ip}/livreto/page/${obj.slug}/0/30" alt="">
                    <div class="meta">
                        <a href="https://${configAPI.ip}/livreto/pdf/${obj.slug}"
                            target="_blank" class="link-btn"><span class="mai-reader"></span></a>
                        <a href="https://${configAPI.ip}/livreto/render/${obj.slug}"
                            target="_blank" class="link-btn"><span class="mai-document"></span></a>
                    </div>
                </div>
                <div class="body">
                    <p class="text-xl mb-0">${obj.name}</p>
                    <span class="text-sm text-grey">${obj.description}</span>
                </div>
            </div>
        </div>
    `
}

function addScripts(scripts) {
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true; // Asynchronous loading to not block other operations
        document.body.appendChild(script); // Append script to the end of body
    });
}

const scriptSources = [
    './assets/js/bootstrap.bundle.min.js',
    './assets/vendor/owl-carousel/js/owl.carousel.min.js',
    './assets/vendor/wow/wow.min.js',
    './assets/js/theme.js'
];

async function GetLivretos(){
    const response = await fetch(`https://${configAPI.ip}/${configAPI.route}/infos/${configAPI.system}`)
    const response_json = await response.json();
    const carrousel = document.getElementById("doctorSlideshow");
    const spinner = document.getElementById("spinner");
    var cards_html_string = '';
    for (var x = 0; x < response_json.length; x ++){
        console.log(response_json[x]);
        cards_html_string += CreateCard(response_json[x]);
    }
    carrousel.innerHTML = cards_html_string;
    while (carrousel.childElementCount != response_json.length);

    setTimeout(()=>{
        addScripts(scriptSources);
        setTimeout(()=>{
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './assets/vendor/owl-carousel/css/owl.carousel.css';
            document.head.appendChild(link);
            spinner.style.display = "none";
            setTimeout(()=>{
                carrousel.style.display = "block";;
            }, 500);
        }, 500);
    }, 500);
}

window.addEventListener("DOMContentLoaded", ()=>{
    GetLivretos();
})