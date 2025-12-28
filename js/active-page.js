/* ============================================
   ACTIVE PAGE HIGHLIGHTER - VERSIONE SEMPLIFICATA
   Evidenzia la pagina attiva nel menù di navigazione
   ============================================ */

(function() {
    function highlightActivePage() {
        // Ottieni il nome della pagina corrente
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // Cerca tutti i link nella navbar
        const navLinks = document.querySelectorAll('.navbar-menu a');

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');

            // Rimuovi la classe active da tutti
            link.classList.remove('active');

            // Aggiungi active solo al link della pagina corrente
            if (linkHref === currentPage) {
                link.classList.add('active');
                console.log('Active page:', currentPage, 'Link:', linkHref);
            }
        });
    }

    // Prova dopo 500ms (quando la navbar è caricata)
    setTimeout(highlightActivePage, 500);

    // Prova anche dopo 1 secondo per sicurezza
    setTimeout(highlightActivePage, 1000);
})();
