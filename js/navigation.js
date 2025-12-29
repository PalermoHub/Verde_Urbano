/* ============================================
   NAVIGATION MENU SCRIPT - Verde Urbano Palermo
   ============================================ */

// La funzione initNavigation() viene chiamata manualmente da load-navigation-cached.js
// dopo che il menu è stato caricato nel DOM

function initNavigation() {
    // Previeni inizializzazione multipla
    if (window.navigationInitialized) {
        console.log('Navigation already initialized, skipping...');
        return;
    }

    const navbar = document.querySelector('.navbar-menu');
    const toggle = document.querySelector('.navbar-toggle');
    const overlay = document.querySelector('.navbar-overlay');
    const closeBtn = document.querySelector('.navbar-close');
    const dropdownItems = document.querySelectorAll('.navbar-menu > li > a');

    // Verifica che gli elementi esistano
    if (!navbar || !toggle || !overlay) {
        console.warn('Navigation elements not found. Menu HTML not loaded yet.');
        return;
    }

    // Marca come inizializzato
    window.navigationInitialized = true;
    console.log('Navigation initialized successfully!');

    // Mobile menu toggle (apri e chiudi con lo stesso pulsante)
    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Toggle - se è aperto lo chiude, se è chiuso lo apre
        if (navbar.classList.contains('active')) {
            closeMenu();
        } else {
            navbar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    // Close menu function
    function closeMenu() {
        if (navbar) navbar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        // Close all open dropdowns
        document.querySelectorAll('.dropdown-active').forEach(item => {
            item.classList.remove('dropdown-active');
        });
    }

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
        });
    }

    // Overlay click
    overlay.addEventListener('click', function(e) {
        e.preventDefault();
        closeMenu();
    });

    // Mobile dropdown toggle
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Only on mobile - allineato con CSS @media (max-width: 900px)
            if (window.innerWidth <= 900) {
                const parent = this.parentElement;
                const hasDropdown = parent.querySelector('.dropdown-menu');

                if (hasDropdown) {
                    e.preventDefault();

                    // Toggle current dropdown
                    parent.classList.toggle('dropdown-active');

                    // Close other dropdowns
                    document.querySelectorAll('.navbar-menu > li').forEach(li => {
                        if (li !== parent) {
                            li.classList.remove('dropdown-active');
                        }
                    });
                }
            }
        });
    });

    // Set active page
    setActivePage();

    // Close menu on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 900) {
                closeMenu();
            }
        }, 250);
    });

    // Keyboard navigation (Escape key)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navbar && navbar.classList.contains('active')) {
            closeMenu();
        }
    });

    // Prevent scroll on body when menu is open
    navbar.addEventListener('touchmove', function(e) {
        e.stopPropagation();
    });
}

// Set active page based on current URL
function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.navbar-menu a');

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
            // Highlight parent if in dropdown
            const parentLi = link.closest('li').parentElement.closest('li');
            if (parentLi) {
                const parentLink = parentLi.querySelector('a');
                if (parentLink) {
                    parentLink.classList.add('active');
                }
            }
        }
    });
}

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    const navbar = document.querySelector('.navbar-menu');
                    const overlay = document.querySelector('.navbar-overlay');
                    if (navbar && navbar.classList.contains('active')) {
                        navbar.classList.remove('active');
                        if (overlay) overlay.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            }
        });
    });
});
