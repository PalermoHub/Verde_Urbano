// Image Popup Handler
(function() {
    'use strict';

    // Create popup overlay on page load
    function createPopupOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'image-popup-overlay';
        overlay.id = 'imagePopupOverlay';

        const content = document.createElement('div');
        content.className = 'image-popup-content';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'image-popup-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.setAttribute('aria-label', 'Chiudi');

        const img = document.createElement('img');
        img.alt = 'Immagine ingrandita';

        content.appendChild(closeBtn);
        content.appendChild(img);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        return overlay;
    }

    // Open popup with image
    function openImagePopup(imageSrc, imageAlt) {
        const overlay = document.getElementById('imagePopupOverlay');
        const img = overlay.querySelector('img');

        img.src = imageSrc;
        img.alt = imageAlt || 'Immagine ingrandita';
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close popup
    function closeImagePopup() {
        const overlay = document.getElementById('imagePopupOverlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Initialize on page load
    function init() {
        // Create overlay if it doesn't exist
        if (!document.getElementById('imagePopupOverlay')) {
            const overlay = createPopupOverlay();

            // Close on overlay click
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeImagePopup();
                }
            });

            // Close on close button click
            const closeBtn = overlay.querySelector('.image-popup-close');
            closeBtn.addEventListener('click', closeImagePopup);

            // Close on ESC key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && overlay.classList.contains('active')) {
                    closeImagePopup();
                }
            });
        }

        // Make clickable images work
        const clickableImages = document.querySelectorAll('.image-clickable');
        clickableImages.forEach(img => {
            img.addEventListener('click', function() {
                openImagePopup(this.src, this.alt);
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally if needed
    window.openImagePopup = openImagePopup;
    window.closeImagePopup = closeImagePopup;
})();
