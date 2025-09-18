let backdropTimeout = null;
let backdropElement = null;

function showBackdrop(duration = 2000) {
    // Se já existe, não cria outro
    if (backdropElement) return;

    // Cria backdrop
    backdropElement = document.createElement('div');
    backdropElement.classList.add('backdrop');

    // Cria loader
    const loader = document.createElement('div');
    loader.classList.add('loader');

    // Adiciona loader ao backdrop
    backdropElement.appendChild(loader);
    document.body.appendChild(backdropElement);

    // Mostra com animação
    requestAnimationFrame(() => {
        backdropElement.classList.add('show');
    });

    // Agenda remoção automática
    backdropTimeout = setTimeout(() => {
        hideBackdrop();
    }, duration);
}

function hideBackdrop() {
    if (!backdropElement) return;

    // Cancela timeout automático (se existir)
    if (backdropTimeout) {
        clearTimeout(backdropTimeout);
        backdropTimeout = null;
    }

    backdropElement.classList.remove('show');
    backdropElement.addEventListener(
        'transitionend',
        () => {
            backdropElement?.remove();
            backdropElement = null;
        },
        { once: true } // garante que só escuta uma vez
    );
}
