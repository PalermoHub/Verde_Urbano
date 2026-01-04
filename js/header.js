
    <!-- JAVASCRIPT per lo scroll dinamico e menu mobile -->
        const slimHeader = document.getElementById('slimHeader');
        const mainHeader = document.getElementById('mainHeader');
        const logoSection = document.getElementById('logoSection');
        const navHeader = document.querySelector('.nav-header');
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        // Evidenzia la pagina attiva nella navigazione
        function highlightActivePage() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('#navMenu a');

            navLinks.forEach(link => {
                const linkPage = link.getAttribute('href');
                if (linkPage === currentPage) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        // Esegui all'avvio
        highlightActivePage();

        // Scroll handler per header compatto
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;

            if (scrollPosition > 50) {
                // Nascondi livello 1 (slim header)
                slimHeader.classList.add('hidden');

                // Nascondi livello 2 (main header) completamente
                mainHeader.classList.add('hidden');

                // Sposta il livello 3 (navigazione) sotto il banner del progetto
                navHeader.classList.add('scrolled');
            } else {
                // Mostra tutto
                slimHeader.classList.remove('hidden');
                mainHeader.classList.remove('hidden');
                navHeader.classList.remove('scrolled');
            }
        });

        // Toggle menu mobile (hamburger)
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('open');

            // Cambia icona hamburger/close
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Chiudi menu quando si clicca su un link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('open');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
