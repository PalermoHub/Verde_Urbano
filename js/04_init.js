// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inizializzazione...');
    initMap();

    // Carica i dati dal CSV
    console.log('📥 Step 1: Caricamento CSV...');
    const loaded = await loadCSVData();
    if (!loaded) {
        console.error('❌ Impossibile caricare i dati');
        return;
    }
    console.log('✅ Step 1 completato - rawGeoJson:', rawGeoJson ? `${rawGeoJson.features.length} features` : 'NULL');

    // Carica i dati foglie stagionali (opzionale)
    console.log('📥 Step 2: Caricamento foglie stagionali...');
    const leavesLoaded = await loadSeasonalLeavesData();
    if (!leavesLoaded) {
        console.warn('⚠️ Continuazione senza dati foglie stagionali');
    }
    console.log('✅ Step 2 completato');

    console.log('📥 Step 3: Processamento dati...');
    loadData();
    console.log('✅ Step 3 completato - allTrees:', allTrees.length);

    // Aggiorna il contatore del loader
    if (window.updateTreeCount) {
        window.updateTreeCount(allTrees.length);
    }

    console.log('📥 Step 4: Popolamento filtri...');
    populateFilterSelects();
    console.log('✅ Step 4 completato');

    console.log('📥 Step 5: Inizializzazione grafici...');
    initCharts();
    console.log('✅ Step 5 completato');

    console.log('📥 Step 6: Applicazione filtri...');
    applyFilters();
    console.log('✅ Step 6 completato - filteredTrees:', filteredTrees.length);

    console.log('✅ Inizializzazione completata');

    // Segnala al loader che i dati sono completamente caricati
    if (window.loaderDataLoaded) {
        window.loaderDataLoaded();
    }
});
