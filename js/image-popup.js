// Image Popup Handler — single image + gallery navigation
(function() {
    'use strict';

    let _gallery = [];
    let _idx     = 0;

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

        const prevBtn = document.createElement('button');
        prevBtn.className = 'image-popup-nav image-popup-prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Precedente');

        const nextBtn = document.createElement('button');
        nextBtn.className = 'image-popup-nav image-popup-next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Successiva');

        const counter = document.createElement('div');
        counter.className = 'image-popup-counter';
        counter.id = 'imagePopupCounter';

        const img = document.createElement('img');
        img.alt = 'Immagine ingrandita';

        content.appendChild(closeBtn);
        content.appendChild(img);
        content.appendChild(counter);
        overlay.appendChild(prevBtn);
        overlay.appendChild(content);
        overlay.appendChild(nextBtn);
        document.body.appendChild(overlay);

        return overlay;
    }

    function _showImage(idx) {
        const overlay = document.getElementById('imagePopupOverlay');
        if (!overlay) return;
        const img     = overlay.querySelector('img');
        const counter = overlay.querySelector('.image-popup-counter');
        const prevBtn = overlay.querySelector('.image-popup-prev');
        const nextBtn = overlay.querySelector('.image-popup-next');

        _idx = idx;
        img.src = _gallery[_idx];
        img.alt = 'Foto ' + (_idx + 1) + ' di ' + _gallery.length;

        const many = _gallery.length > 1;
        prevBtn.style.display  = many ? 'flex' : 'none';
        nextBtn.style.display  = many ? 'flex' : 'none';
        counter.style.display  = many ? 'block' : 'none';
        if (many) counter.textContent = (_idx + 1) + ' / ' + _gallery.length;

        prevBtn.disabled = _idx === 0;
        nextBtn.disabled = _idx === _gallery.length - 1;
    }

    function openImageGallery(urls, startIndex) {
        _gallery = Array.isArray(urls) ? urls.filter(Boolean) : [urls];
        _showImage(Math.max(0, Math.min(startIndex || 0, _gallery.length - 1)));
        document.getElementById('imagePopupOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function openImagePopup(imageSrc, imageAlt) {
        openImageGallery([imageSrc], 0);
    }

    function closeImagePopup() {
        const overlay = document.getElementById('imagePopupOverlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        _gallery = [];
    }

    function init() {
        if (!document.getElementById('imagePopupOverlay')) {
            const overlay = createPopupOverlay();

            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) closeImagePopup();
            });

            overlay.querySelector('.image-popup-close').addEventListener('click', closeImagePopup);

            overlay.querySelector('.image-popup-prev').addEventListener('click', function(e) {
                e.stopPropagation();
                if (_idx > 0) _showImage(_idx - 1);
            });

            overlay.querySelector('.image-popup-next').addEventListener('click', function(e) {
                e.stopPropagation();
                if (_idx < _gallery.length - 1) _showImage(_idx + 1);
            });

            document.addEventListener('keydown', function(e) {
                const overlay = document.getElementById('imagePopupOverlay');
                if (!overlay.classList.contains('active')) return;
                if (e.key === 'Escape')     closeImagePopup();
                if (e.key === 'ArrowLeft'  && _idx > 0)                  _showImage(_idx - 1);
                if (e.key === 'ArrowRight' && _idx < _gallery.length - 1) _showImage(_idx + 1);
            });
        }

        document.querySelectorAll('.image-clickable').forEach(function(img) {
            img.addEventListener('click', function() {
                openImagePopup(this.src, this.alt);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.openImagePopup   = openImagePopup;
    window.openImageGallery = openImageGallery;
    window.closeImagePopup  = closeImagePopup;
})();
