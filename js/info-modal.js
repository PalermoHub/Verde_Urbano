// ===== GESTIONE MODALE INFO GLOBALE =====
// Questo script gestisce il modal "Come Funziona" su tutte le pagine

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se il pulsante info esiste nella pagina
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');

    if (infoBtn && infoModal) {
        // Event listener per aprire il modal
        infoBtn.addEventListener('click', openInfoModal);

        // Event listener per chiudere cliccando fuori dal modal
        infoModal.addEventListener('click', function(e) {
            if (e.target === this) closeInfoModal();
        });

        // Event listener per chiudere con il tasto ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeInfoModal();
        });
    }
});

function openInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}
