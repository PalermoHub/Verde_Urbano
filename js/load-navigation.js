/* ============================================
   NAVIGATION LOADER
   Carica la navigazione e evidenzia la pagina attiva
   ============================================ */

// Funzione per caricare la navigazione
function loadNavigation() {
    fetch('includes/navigation-simple.html?v=' + Date.now())
        .then(response => response.text())
        .then(data => {
            document.getElementById('navigation-placeholder').innerHTML = data;

            // EVIDENZIA LA PAGINA ATTIVA
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('.navbar-menu a');

            console.log('📄 Pagina corrente:', currentPage);
            console.log('🔗 Link nel menu:', navLinks.length);

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                link.classList.remove('active');

                if (href === currentPage) {
                    link.classList.add('active');
                    console.log('✅ Link evidenziato:', href);
                }
            });

            // Carica lo script di navigazione per il menu mobile
            const script = document.createElement('script');
            script.src = 'js/navigation.js';
            document.body.appendChild(script);
        })
        .catch(error => console.error('❌ Errore caricamento navigazione:', error));
}

// Esegui al caricamento della pagina
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavigation);
} else {
    loadNavigation();
}
