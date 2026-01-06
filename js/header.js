
    <!-- JAVASCRIPT per lo scroll dinamico e menu mobile -->
        const slimHeader = document.getElementById('slimHeader');
        const mainHeader = document.getElementById('mainHeader');
        const logoSection = document.getElementById('logoSection');
        const navHeader = document.querySelector('.nav-header');
        const projectBanner = document.getElementById('projectBanner');
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        // Funzione per aggiornare l'altezza del banner
        function updateBannerHeight() {
            if (projectBanner) {
                const bannerHeight = projectBanner.offsetHeight;
                document.documentElement.style.setProperty('--banner-height', `${bannerHeight}px`);
            }
        }

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
        updateBannerHeight();

        // Aggiorna altezza banner al resize della finestra
        window.addEventListener('resize', updateBannerHeight);

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

                // Aggiorna l'altezza del banner in caso di cambiamenti dinamici
                updateBannerHeight();
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

        // Gestione dropdown menu in mobile
        function setupDropdownMenu() {
            const dropdownItems = document.querySelectorAll('.has-dropdown');

            dropdownItems.forEach(item => {
                const mainLink = item.querySelector('a');

                mainLink.addEventListener('click', function(e) {
                    // In mobile, previeni il click se c'è un dropdown
                    if (window.innerWidth <= 768) {
                        e.preventDefault();

                        // Chiudi altri dropdown aperti
                        dropdownItems.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('dropdown-active');
                            }
                        });

                        // Toggle del dropdown corrente
                        item.classList.toggle('dropdown-active');
                    }
                });
            });

            // Chiudi dropdown quando si clicca su una voce del sotto-menu in mobile
            const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
            dropdownLinks.forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        // Chiudi il dropdown
                        const parentDropdown = this.closest('.has-dropdown');
                        if (parentDropdown) {
                            parentDropdown.classList.remove('dropdown-active');
                        }

                        // Chiudi il menu principale
                        navMenu.classList.remove('open');
                        const icon = menuToggle.querySelector('i');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
            });
        }

        // Evidenzia anche le voci del dropdown se attive
        function highlightActiveDropdownPage() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const dropdownLinks = document.querySelectorAll('.dropdown-menu a');

            dropdownLinks.forEach(link => {
                const linkPage = link.getAttribute('href');
                if (linkPage === currentPage) {
                    link.classList.add('active');
                    // Evidenzia anche il link principale del dropdown
                    const parentDropdown = link.closest('.has-dropdown');
                    if (parentDropdown) {
                        const mainLink = parentDropdown.querySelector(':scope > a');
                        if (mainLink) {
                            mainLink.classList.add('active');
                        }
                    }
                } else {
                    link.classList.remove('active');
                }
            });
        }

        // Inizializza il dropdown menu
        setupDropdownMenu();
        highlightActiveDropdownPage();
