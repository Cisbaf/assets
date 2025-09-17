function showBackdrop(duration = 2000) {
    // Cria backdrop
    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop');

    // Cria loader
    const loader = document.createElement('div');
    loader.classList.add('loader');

    // Adiciona loader ao backdrop
    backdrop.appendChild(loader);
    document.body.appendChild(backdrop);

    // Mostra com animação
    requestAnimationFrame(() => {
        backdrop.classList.add('show');
    });

    // Remove depois do tempo definido
    setTimeout(() => {
        backdrop.classList.remove('show');
        backdrop.addEventListener('transitionend', () => {
            backdrop.remove();
        });
    }, duration);
}
