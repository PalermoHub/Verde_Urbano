// ===== GESTIONE MODALE INFO =====
document.getElementById('infoBtn').addEventListener('click', openInfoModal);
document.getElementById('infoModal').addEventListener('click', function(e) {
    if (e.target === this) closeInfoModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeInfoModal();
});

function openInfoModal() {
    document.getElementById('infoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
    document.getElementById('infoModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}
