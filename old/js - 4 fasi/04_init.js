// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inizializzazione...');
    initMap();

    // Carica i dati dal CSV
    const loaded = await loadCSVData();
    if (!loaded) {
        console.error('❌ Impossibile caricare i dati');
        return;
    }

    // Carica i dati foglie stagionali (opzionale)
    const leavesLoaded = await loadSeasonalLeavesData();
    if (!leavesLoaded) {
        console.warn('⚠️ Continuazione senza dati foglie stagionali');
    }

    loadData();
    populateFilterSelects();
    initCharts();
    applyFilters();
    console.log('✅ Inizializzazione completata');
});
