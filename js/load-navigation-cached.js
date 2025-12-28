/* ============================================
   CARICAMENTO NAVBAR CON CACHE
   Evita il fastidioso ricaricamento ad ogni cambio pagina
   ============================================ */

(function() {
    const CACHE_KEY = 'verde-urbano-navbar';
    const CACHE_VERSION = '1.0'; // Incrementa questo numero quando modifichi la navbar

    function loadNavigation() {
        const placeholder = document.getElementById('navigation-placeholder');
        if (!placeholder) return;

        // Prova a caricare dalla cache
        const cached = sessionStorage.getItem(CACHE_KEY);
        const cachedVersion = sessionStorage.getItem(CACHE_KEY + '-version');

        if (cached && cachedVersion === CACHE_VERSION) {
            // Usa la versione cachata - rendering immediato
            placeholder.innerHTML = cached;
            initNavigationAfterLoad();
        } else {
            // Carica dal server e salva in cache
            fetch('includes/navigation-simple.html')
                .then(response => response.text())
                .then(data => {
                    placeholder.innerHTML = data;
                    // Salva in sessionStorage
                    sessionStorage.setItem(CACHE_KEY, data);
                    sessionStorage.setItem(CACHE_KEY + '-version', CACHE_VERSION);
                    initNavigationAfterLoad();
                })
                .catch(error => console.error('Errore caricamento navigazione:', error));
        }
    }

    function initNavigationAfterLoad() {
        // EVIDENZIA LA PAGINA ATTIVA
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.navbar-menu a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });

        // Ricarica lo script di navigazione solo se non è già stato caricato
        if (!window.navigationScriptLoaded) {
            const script = document.createElement('script');
            script.src = 'js/navigation.js';
            document.body.appendChild(script);
            window.navigationScriptLoaded = true;
        }
    }

    // Avvia il caricamento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNavigation);
    } else {
        loadNavigation();
    }
})();
