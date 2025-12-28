/* ============================================
   STICKY HEADER BEHAVIOR - VERSIONE SEMPLIFICATA
   Nasconde l'header principale allo scroll
   La navbar rimane SEMPRE visibile (si muove insieme all'header)
   ============================================ */

(function() {
    function initStickyHeader() {
        const header = document.querySelector('header');
        const navbar = document.querySelector('.navbar');
        const container = document.querySelector('.container, .page-container');

        if (!header) return;

        // Aspetta che la navbar sia caricata
        if (!navbar) {
            setTimeout(initStickyHeader, 100);
            return;
        }

        // Calcola l'altezza dell'header e della navbar
        const headerHeight = header.offsetHeight;
        const navbarHeight = navbar.offsetHeight;

        // Setup iniziale: header e navbar fissi dall'inizio
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.width = '100%';
        header.style.zIndex = '10000';
        header.style.transition = 'transform 0.3s ease';

        navbar.style.position = 'fixed';
        navbar.style.top = headerHeight + 'px';
        navbar.style.width = '100%';
        navbar.style.zIndex = '10000';
        navbar.style.transition = 'top 0.3s ease';

        // Aggiungi padding al contenitore per compensare header+navbar fissi
        if (container) {
            container.style.paddingTop = (headerHeight + navbarHeight) + 'px';
            container.style.transition = 'padding-top 0.3s ease';
        }

        // Gestisci lo scroll
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 80) {
                // Nascondi l'header e sposta la navbar in alto
                header.style.transform = 'translateY(-100%)';

                // La navbar sale in cima
                navbar.style.top = '0';

                // Riduci il padding del contenitore (solo navbar visibile)
                if (container) {
                    container.style.paddingTop = navbarHeight + 'px';
                }
            } else {
                // Mostra l'header e navbar torna sotto
                header.style.transform = 'translateY(0)';

                // La navbar torna sotto l'header
                navbar.style.top = headerHeight + 'px';

                // Ripristina padding completo
                if (container) {
                    container.style.paddingTop = (headerHeight + navbarHeight) + 'px';
                }
            }
        }, { passive: true });
    }

    // Avvia l'inizializzazione
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStickyHeader);
    } else {
        // Aspetta un attimo per dare tempo alla navbar di caricarsi
        setTimeout(initStickyHeader, 500);
    }
})();
