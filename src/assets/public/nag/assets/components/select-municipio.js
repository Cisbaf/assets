// Componente para trocar configuração do municipio;

class SelectMunicipio extends HTMLElement {
  connectedCallback() {
    const exclude = this.getAttribute("exclude"); // caso queira excluir algum município

    const options = GetSelectOptions()
      .map((obj) => {
        if (!obj) return "";
        const key = Object.keys(obj)[0];
        const value = obj[key];
        if (exclude && key === exclude) return ""; // remove se for igual ao exclude
        return `<option value="${key}">${value}</option>`;
      })
      .join("");

        this.innerHTML = `
        <select id="municipio-select">
            <option value="all">Visualizar Todos</option>
            ${options}
        </select>
        `;

    // adiciona o evento de mudança
    const selectEl = this.querySelector("#municipio-select");
    selectEl.addEventListener("change", (e) => {
      // você pode disparar um evento customizado
        this.dispatchEvent(
        new CustomEvent("municipioChange", {
            detail: { value: e.target.value },
            bubbles: true,
            composed: true,
        })
        );
    });
  }
}

function updateSelection() {
 if (IsAdm()) {
  customElements.define("select-municipio", SelectMunicipio);
  customElements.whenDefined("select-municipio").then(() => {
    const navDiv = document.getElementById("nav-logo");
    const h3 = navDiv.querySelector("h3"); // pega o primeiro <h3> dentro de nav-logo
    h3.style.display = "none";
    const select = document.createElement("select-municipio");
    navDiv.appendChild(select);
  });
 }
} 

SetCallbackUpdateSelection(updateSelection);

window.addEventListener("load", ()=>{
  updateSelection();
})