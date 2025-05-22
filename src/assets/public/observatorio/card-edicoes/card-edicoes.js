
class CardEdicao extends HTMLElement {
    constructor() {
      super();
    }

      connectedCallback() {
        const title = this.getAttribute("title");
        const description = this.getAttribute("description");
        const img = this.getAttribute("img");
        const pdf = this.getAttribute("pdf");
        const livreto = this.getAttribute("livreto");

        fetch("./card-edicoes/card-edicoes.html")
          .then((response) => {
            if (!response.ok) throw new Error("Falha ao carregar o menu");
            return response.text();
          })
          .then((html) => {
            // Substitui os placeholders no HTML com os valores dos atributos
            this.innerHTML = html
              .replace("{{title}}", title || "")
              .replace("{{description}}", description || "")
              .replace("{{img}}", img || "")
              .replace("{{pdf}}", pdf || "")
              .replace("{{livreto}}", livreto || "");

          })
          .catch((error) => {
            console.error("Erro no CardEdicao:", error);
            this.innerHTML = "<div>Erro ao carregar o card</div>";
          });
      }


  }
  
  customElements.define("card-edicao", CardEdicao);
  


  class CardList extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      const infos = this.getAttribute("infos");
      const imgs = this.getAttribute("imgs");
      const pdf = this.getAttribute("pdf");
      const livreto = this.getAttribute("livreto");


      fetch(infos)
        .then((response) => {
          if (!response.ok) throw new Error("Falha ao carregar os dados dos cards");
          return response.json();
        })
        .then((cards) => {
          // Renderiza vários card-edicao
          this.className="card-list-obs"
          this.innerHTML = "";
          cards.forEach((card) => {
            const cardEl = document.createElement("card-edicao");
            cardEl.setAttribute("title", card.name);
            cardEl.setAttribute("description", card.description);
            cardEl.setAttribute("img", imgs.replace("{{name}}", card.slug));
            cardEl.setAttribute("pdf", pdf.replace("{{name}}", card.slug));
            cardEl.setAttribute("livreto", livreto.replace("{{name}}", card.slug));
            this.appendChild(cardEl);
          });
        })
        .catch((error) => {
          console.error("Erro no CardList:", error);
          this.innerHTML = "<div>Erro ao carregar a lista de cards</div>";
        });
    }
  }

  customElements.define("card-list", CardList);
  customElements.define("card-edicao", CardEdicao);
  