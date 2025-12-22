// ===== FILTRI =====
function populateFilterSelects() {
    const species = [...new Set(allTrees.map(t => t.specie))].sort();
    const specieSelect = document.getElementById('specieFilter');
    species.forEach(sp => {
        const opt = document.createElement('option');
        opt.value = sp;
        const count = allTrees.filter(t => t.specie === sp).length;
        opt.textContent = `${sp} (${count})`;
        specieSelect.appendChild(opt);
    });

    const sites = [...new Set(allTrees.map(t => t.sito))].sort();
    const siteSelect = document.getElementById('siteFilter');
    sites.forEach(site => {
        const opt = document.createElement('option');
        opt.value = site;
        const count = allTrees.filter(t => t.sito === site).length;
        opt.textContent = `${site} (${count})`;
        siteSelect.appendChild(opt);
    });

    // Filtri territoriali
    const odonomi = [...new Set(allTrees.map(t => t.odonimo).filter(o => o && o !== '-'))].sort();
    const odonimoSelect = document.getElementById('odonimoFilter');
    odonomi.forEach(od => {
        const opt = document.createElement('option');
        opt.value = od;
        const count = allTrees.filter(t => t.odonimo === od).length;
        opt.textContent = `${od} (${count})`;
        odonimoSelect.appendChild(opt);
    });

    const upls = [...new Set(allTrees.map(t => t.upl).filter(u => u && u !== '-'))].sort();
    const uplSelect = document.getElementById('uplFilter');
    upls.forEach(upl => {
        const opt = document.createElement('option');
        opt.value = upl;
        const count = allTrees.filter(t => t.upl === upl).length;
        opt.textContent = `${upl} (${count})`;
        uplSelect.appendChild(opt);
    });

    const quartieri = [...new Set(allTrees.map(t => t.quartiere).filter(q => q && q !== '-'))].sort();
    const quartiereSelect = document.getElementById('quartiereFilter');
    quartieri.forEach(qua => {
        const opt = document.createElement('option');
        opt.value = qua;
        const count = allTrees.filter(t => t.quartiere === qua).length;
        opt.textContent = `${qua} (${count})`;
        quartiereSelect.appendChild(opt);
    });

    const circoscrizioni = [...new Set(allTrees.map(t => t.circoscrizione).filter(c => c && c !== '-'))].sort();
    const circoscrizioneSelect = document.getElementById('circoscrizioneFilter');
    circoscrizioni.forEach(cir => {
        const opt = document.createElement('option');
        opt.value = cir;
        const count = allTrees.filter(t => t.circoscrizione === cir).length;
        opt.textContent = `${cir} (${count})`;
        circoscrizioneSelect.appendChild(opt);
    });
}

function updateHeightLabel() {
    document.getElementById('minHeightLabel').textContent = document.getElementById('minHeight').value;
}

function updateDiameterLabel() {
    document.getElementById('minDiameterLabel').textContent = document.getElementById('minDiameter').value;
}

// Funzione helper per calcolare la priorità di pulizia
function calcolaPrioritaPulizia(tree) {
    const foglieValues = [tree.foglie_primavera, tree.foglie_estate, tree.foglie_autunno, tree.foglie_inverno];
    const maxFoglie = Math.max(...foglieValues);
    const minFoglie = Math.min(...foglieValues);
    const differenza = maxFoglie - minFoglie;
    const percentuale = maxFoglie > 0 ? ((differenza / maxFoglie) * 100) : 0;

    return percentuale;
}

function getCountForFilter(filterType, filterValue) {
    const specie = document.getElementById('specieFilter').value;
    const cpc = document.getElementById('cpcFilter').value;
    const site = document.getElementById('siteFilter').value;
    const minHeight = parseFloat(document.getElementById('minHeight').value);
    const minDiameter = parseFloat(document.getElementById('minDiameter').value);
    const odonimo = document.getElementById('odonimoFilter').value;
    const upl = document.getElementById('uplFilter').value;
    const quartiere = document.getElementById('quartiereFilter').value;
    const circoscrizione = document.getElementById('circoscrizioneFilter').value;
    const pulizia = document.getElementById('puliziaFilter').value;

    let testValue = filterValue;

    return allTrees.filter(tree => {
        let match = true;

        // Applica il filtro corrente che stiamo testando
        if (filterType === 'specie') match = match && tree.specie === testValue;
        else if (specie) match = match && tree.specie === specie;

        if (filterType === 'cpc') match = match && tree.cpc === testValue;
        else if (cpc) match = match && tree.cpc === cpc;

        if (filterType === 'site') match = match && tree.sito === testValue;
        else if (site) match = match && tree.sito === site;

        if (filterType === 'odonimo') match = match && tree.odonimo === testValue;
        else if (odonimo) match = match && tree.odonimo === odonimo;

        if (filterType === 'upl') match = match && tree.upl === testValue;
        else if (upl) match = match && tree.upl === upl;

        if (filterType === 'quartiere') match = match && tree.quartiere === testValue;
        else if (quartiere) match = match && tree.quartiere === quartiere;

        if (filterType === 'circoscrizione') match = match && tree.circoscrizione === testValue;
        else if (circoscrizione) match = match && tree.circoscrizione === circoscrizione;

        // Filtro pulizia foglie
        if (filterType === 'pulizia') {
            const percentuale = calcolaPrioritaPulizia(tree);
            if (testValue === 'alta') match = match && percentuale > 30;
            else if (testValue === 'media') match = match && percentuale >= 15 && percentuale <= 30;
            else if (testValue === 'bassa') match = match && percentuale < 15;
        } else if (pulizia) {
            const percentuale = calcolaPrioritaPulizia(tree);
            if (pulizia === 'alta') match = match && percentuale > 30;
            else if (pulizia === 'media') match = match && percentuale >= 15 && percentuale <= 30;
            else if (pulizia === 'bassa') match = match && percentuale < 15;
        }

        match = match && (tree.altezza === null || tree.altezza >= minHeight);
        match = match && (tree.diametro === null || tree.diametro >= minDiameter);

        return match;
    }).length;
}

function applyFilters() {
    const specie = document.getElementById('specieFilter').value;
    const cpc = document.getElementById('cpcFilter').value;
    const site = document.getElementById('siteFilter').value;
    const minHeight = parseFloat(document.getElementById('minHeight').value);
    const minDiameter = parseFloat(document.getElementById('minDiameter').value);
    const odonimo = document.getElementById('odonimoFilter').value;
    const upl = document.getElementById('uplFilter').value;
    const quartiere = document.getElementById('quartiereFilter').value;
    const circoscrizione = document.getElementById('circoscrizioneFilter').value;
    const pulizia = document.getElementById('puliziaFilter').value;

    filteredTrees = allTrees.filter(tree => {
        let match = (!specie || tree.specie === specie) &&
               (!cpc || tree.cpc === cpc) &&
               (!site || tree.sito === site) &&
               (tree.altezza === null || tree.altezza >= minHeight) &&
               (tree.diametro === null || tree.diametro >= minDiameter) &&
               (!odonimo || tree.odonimo === odonimo) &&
               (!upl || tree.upl === upl) &&
               (!quartiere || tree.quartiere === quartiere) &&
               (!circoscrizione || tree.circoscrizione === circoscrizione);

        // Applica filtro pulizia foglie
        if (match && pulizia) {
            const percentuale = calcolaPrioritaPulizia(tree);
            if (pulizia === 'alta') match = match && percentuale > 30;
            else if (pulizia === 'media') match = match && percentuale >= 15 && percentuale <= 30;
            else if (pulizia === 'bassa') match = match && percentuale < 15;
        }

        return match;
    });

    updateFilterInfo();
    updateFilterCounts();
    updatePageTitle(odonimo);
    updateMap();
    updateStats();
    updateCharts();
}

// Aggiorna il titolo della pagina con l'Odonimo selezionato
function updatePageTitle(odonimo) {
    const titleElement = document.getElementById('pageTitle');
    if (odonimo) {
        titleElement.innerHTML = `<i class="fas fa-tree"></i>  Demo prototipale | alberi ${odonimo}`;
    } else {
        titleElement.innerHTML = `<i class="fas fa-tree"></i>  Demo prototipale | Verde Urbano`;
    }
}

function updateFilterInfo() {
    const specieValue = document.getElementById('specieFilter').value;
    const cpcValue = document.getElementById('cpcFilter').value;
    const siteValue = document.getElementById('siteFilter').value;
    const odonimoValue = document.getElementById('odonimoFilter').value;
    const uplValue = document.getElementById('uplFilter').value;
    const quartiereValue = document.getElementById('quartiereFilter').value;
    const circoscrizioneValue = document.getElementById('circoscrizioneFilter').value;
    const puliziaValue = document.getElementById('puliziaFilter').value;

    document.getElementById('specieInfo').textContent =
        specieValue ? `${filteredTrees.filter(t => t.specie === specieValue).length}` : '';
    document.getElementById('cpcInfo').textContent =
        cpcValue ? `${filteredTrees.filter(t => t.cpc === cpcValue).length}` : '';
    document.getElementById('siteInfo').textContent =
        siteValue ? `${filteredTrees.filter(t => t.sito === siteValue).length}` : '';
    document.getElementById('odonimoInfo').textContent =
        odonimoValue ? `${filteredTrees.filter(t => t.odonimo === odonimoValue).length}` : '';
    document.getElementById('uplInfo').textContent =
        uplValue ? `${filteredTrees.filter(t => t.upl === uplValue).length}` : '';
    document.getElementById('quartiereInfo').textContent =
        quartiereValue ? `${filteredTrees.filter(t => t.quartiere === quartiereValue).length}` : '';
    document.getElementById('circoscrizioneInfo').textContent =
        circoscrizioneValue ? `${filteredTrees.filter(t => t.circoscrizione === circoscrizioneValue).length}` : '';
    document.getElementById('puliziaInfo').textContent =
        puliziaValue ? `${filteredTrees.length} alberi` : '';
}

function updateFilterCounts() {
    // Aggiorna i conteggi dinamici per le opzioni dei select
    const specieSelect = document.getElementById('specieFilter');
    Array.from(specieSelect.options).forEach((opt, idx) => {
        if (idx > 0) {
            const count = getCountForFilter('specie', opt.value);
            opt.textContent = `${opt.value} (${count})`;
            opt.disabled = count === 0;
        }
    });

    const siteSelect = document.getElementById('siteFilter');
    Array.from(siteSelect.options).forEach((opt, idx) => {
        if (idx > 0) {
            const count = getCountForFilter('site', opt.value);
            opt.textContent = `${opt.value} (${count})`;
            opt.disabled = count === 0;
        }
    });

    const cpcSelect = document.getElementById('cpcFilter');
    Array.from(cpcSelect.options).forEach((opt, idx) => {
        if (idx > 0) {
            const count = getCountForFilter('cpc', opt.value);
            opt.disabled = count === 0;
        }
    });

    // Aggiorna conteggi filtro pulizia
    const puliziaSelect = document.getElementById('puliziaFilter');
    Array.from(puliziaSelect.options).forEach((opt, idx) => {
        if (idx > 0) {
            const count = getCountForFilter('pulizia', opt.value);
            const label = opt.value === 'alta' ? 'Alta priorità (>30% variazione)' :
                         opt.value === 'media' ? 'Media priorità (15-30%)' :
                         'Bassa priorità (<15%)';
            opt.textContent = `${label} (${count})`;
            opt.disabled = count === 0;
        }
    });

    // Filtri territoriali
    const odonimoSelect = document.getElementById('odonimoFilter');
    Array.from(odonimoSelect.options).forEach((opt, idx) => {
        if (idx > 0) {
            const count = getCountForFilter('odonimo', opt.value);
            opt.textContent = `${opt.value} (${count})`;
            opt.disabled = count === 0;
        }
    });

    const uplSelect = document.getElementById('uplFilter');
    Array.from(uplSelect.options).forEach((opt, idx) => {
        if (idx > 0) {
            const count = getCountForFilter('upl', opt.value);
            opt.textContent = `${opt.value} (${count})`;
            opt.disabled = count === 0;
        }
    });

    const quartiereSelect = document.getElementById('quartiereFilter');
    Array.from(quartiereSelect.options).forEach((opt, idx) => {
        if (idx > 0) {
            const count = getCountForFilter('quartiere', opt.value);
            opt.textContent = `${opt.value} (${count})`;
            opt.disabled = count === 0;
        }
    });

    const circoscrizioneSelect = document.getElementById('circoscrizioneFilter');
    Array.from(circoscrizioneSelect.options).forEach((opt, idx) => {
        if (idx > 0) {
            const count = getCountForFilter('circoscrizione', opt.value);
            opt.textContent = `${opt.value} (${count})`;
            opt.disabled = count === 0;
        }
    });
}

function resetFilters() {
    document.getElementById('specieFilter').value = '';
    document.getElementById('cpcFilter').value = '';
    document.getElementById('siteFilter').value = '';
    document.getElementById('minHeight').value = '0';
    document.getElementById('minDiameter').value = '0';
    document.getElementById('odonimoFilter').value = '';
    document.getElementById('uplFilter').value = '';
    document.getElementById('quartiereFilter').value = '';
    document.getElementById('circoscrizioneFilter').value = '';
    document.getElementById('puliziaFilter').value = '';
    updateHeightLabel();
    updateDiameterLabel();
    applyFilters();
}
