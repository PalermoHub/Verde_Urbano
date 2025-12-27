/* ============================================
   NAVIGATION MENU SCRIPT - Verde Urbano Palermo
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
});

function initNavigation() {
    const navbar = document.querySelector('.navbar-menu');
    const toggle = document.querySelector('.navbar-toggle');
    const overlay = document.querySelector('.navbar-overlay');
    const closeBtn = document.querySelector('.navbar-close');
    const dropdownItems = document.querySelectorAll('.navbar-menu > li > a');

    // Mobile menu toggle
    if (toggle) {
        toggle.addEventListener('click', function() {
            navbar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close menu function
    function closeMenu() {
        navbar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        // Close all open dropdowns
        document.querySelectorAll('.dropdown-active').forEach(item => {
            item.classList.remove('dropdown-active');
        });
    }

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    // Overlay click
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // Mobile dropdown toggle
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Only on mobile
            if (window.innerWidth <= 1024) {
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
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            closeMenu();
        }
    });

    // Keyboard navigation (Escape key)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navbar.classList.contains('active')) {
            closeMenu();
        }
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
                parentLi.querySelector('a').classList.add('active');
            }
        }
    });
}

// Smooth scroll for anchor links
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
                if (navbar.classList.contains('active')) {
                    navbar.classList.remove('active');
                    document.querySelector('.navbar-overlay').classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        }
    });
});
