

class MenuComponent extends HTMLElement {
  constructor() {
    super();

    // Caminho relativo corrigido
    fetch("./menu-navegacao/menu-navegacao.html")
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao carregar o menu");
        return response.text();
      })
      .then((html) => {
        this.innerHTML = html;
      })
      .catch((error) => {
        console.error("Erro no MenuComponent:", error);
        this.innerHTML = "<div>Erro ao carregar o menu</div>";
      });
  }
}

customElements.define("menu-navegacao", MenuComponent);


window.addEventListener("load", () => {
    document.querySelectorAll('#navbarDropdown').forEach(element => {
        element.addEventListener('click', function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            const submenu = this.nextElementSibling;

            // Fecha todos os outros submenus
            document.querySelectorAll('.dropdown-submenu .dropdown-menu.show').forEach(menu => {
                if (menu !== submenu) {
                    menu.classList.remove('show');
                }
            });

            // Alterna o submenu clicado
            submenu.classList.toggle('show');
        });
    });

    // Fecha submenus ao clicar fora

    document.addEventListener('click', function(){
        document.querySelectorAll('.dropdown-menu.show').forEach(function(menu){
        menu.classList.remove('show');
        });
    });
});
