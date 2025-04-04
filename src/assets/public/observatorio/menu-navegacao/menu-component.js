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
