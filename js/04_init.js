// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inizializzazione...');

    // Step 0: Inizializza mappa
    if (window.updateLoaderProgress) window.updateLoaderProgress(10);
    if (window.updateLoaderStatus) window.updateLoaderStatus('<i class="fas fa-map"></i> Inizializzazione mappa...');
    initMap();

    // Carica i dati dal CSV
    console.log('📥 Step 1: Caricamento CSV...');
    if (window.updateLoaderProgress) window.updateLoaderProgress(30);
    if (window.updateLoaderStatus) window.updateLoaderStatus('<i class="fas fa-file-csv"></i> Caricamento dati CSV...');
    const loaded = await loadCSVData();
    if (!loaded) {
        console.error('❌ Impossibile caricare i dati');
        return;
    }
    console.log('✅ Step 1 completato - rawGeoJson:', rawGeoJson ? `${rawGeoJson.features.length} features` : 'NULL');

    // Carica i dati foglie stagionali (opzionale)
    console.log('📥 Step 2: Caricamento foglie stagionali...');
    if (window.updateLoaderProgress) window.updateLoaderProgress(50);
    if (window.updateLoaderStatus) window.updateLoaderStatus('<i class="fas fa-leaf"></i> Caricamento dati stagionali...');
    const leavesLoaded = await loadSeasonalLeavesData();
    if (!leavesLoaded) {
        console.warn('⚠️ Continuazione senza dati foglie stagionali');
    }
    console.log('✅ Step 2 completato');

    console.log('📥 Step 3: Processamento dati...');
    if (window.updateLoaderProgress) window.updateLoaderProgress(60);
    if (window.updateLoaderStatus) window.updateLoaderStatus('<i class="fas fa-database"></i> Elaborazione dati territoriali...');
    loadData();
    console.log('✅ Step 3 completato - allTrees:', allTrees.length);

    // Aggiorna il contatore del loader
    if (window.updateTreeCount) {
        window.updateTreeCount(allTrees.length);
    }

    console.log('📥 Step 4: Popolamento filtri...');
    if (window.updateLoaderStatus) window.updateLoaderStatus('<i class="fas fa-filter"></i> Configurazione filtri...');
    populateFilterSelects();
    console.log('✅ Step 4 completato');

    console.log('📥 Step 5: Inizializzazione grafici...');
    if (window.updateLoaderStatus) window.updateLoaderStatus('<i class="fas fa-chart-bar"></i> Preparazione grafici...');
    initCharts();
    console.log('✅ Step 5 completato');

    console.log('📥 Step 6: Applicazione filtri...');
    if (window.updateLoaderStatus) window.updateLoaderStatus('<i class="fas fa-map-marker-alt"></i> Rendering mappa...');
    applyFilters();
    console.log('✅ Step 6 completato - filteredTrees:', filteredTrees.length);

    console.log('✅ Inizializzazione completata');

    // Segnala al loader che i dati sono completamente caricati
    if (window.loaderDataLoaded) {
        window.loaderDataLoaded();
    }
});
