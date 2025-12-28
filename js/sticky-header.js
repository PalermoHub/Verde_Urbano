/* ============================================
   STICKY HEADER BEHAVIOR - SINCRONIZZAZIONE HEADER E NAVBAR
   Header e navbar sono sempre sincronizzati durante lo scroll
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
        header.style.left = '0';
        header.style.right = '0';
        header.style.width = '100%';
        header.style.zIndex = '10001';
        header.style.transition = 'transform 0.3s ease';

        navbar.style.position = 'fixed';
        navbar.style.top = headerHeight + 'px';
        navbar.style.left = '0';
        navbar.style.right = '0';
        navbar.style.width = '100%';
        navbar.style.zIndex = '10000';
        navbar.style.transition = 'top 0.3s ease';

        // Aggiungi padding al contenitore per compensare header+navbar fissi
        if (container) {
            container.style.paddingTop = (headerHeight + navbarHeight) + 'px';
            container.style.transition = 'padding-top 0.3s ease';
        }

        // Gestisci lo scroll - Header e navbar si muovono sempre insieme
        let lastScroll = 0;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 80 && currentScroll > lastScroll) {
                // Scrolling down - nascondi header e sposta navbar in alto
                header.style.transform = 'translateY(-100%)';
                navbar.style.top = '0';

                // Riduci il padding del contenitore (solo navbar visibile)
                if (container) {
                    container.style.paddingTop = navbarHeight + 'px';
                }
            } else if (currentScroll <= 80) {
                // Tornato all'inizio - mostra header e navbar sotto
                header.style.transform = 'translateY(0)';
                navbar.style.top = headerHeight + 'px';

                // Ripristina padding completo
                if (container) {
                    container.style.paddingTop = (headerHeight + navbarHeight) + 'px';
                }
            }

            lastScroll = currentScroll;
        }, { passive: true });

        // Ricalcola altezze al ridimensionamento della finestra
        window.addEventListener('resize', function() {
            const newHeaderHeight = header.offsetHeight;
            const newNavbarHeight = navbar.offsetHeight;

            if (window.pageYOffset <= 80) {
                navbar.style.top = newHeaderHeight + 'px';
                if (container) {
                    container.style.paddingTop = (newHeaderHeight + newNavbarHeight) + 'px';
                }
            } else {
                navbar.style.top = '0';
                if (container) {
                    container.style.paddingTop = newNavbarHeight + 'px';
                }
            }
        });
    }

    // Avvia l'inizializzazione
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStickyHeader);
    } else {
        // Aspetta un attimo per dare tempo alla navbar di caricarsi
        setTimeout(initStickyHeader, 500);
    }
})();
