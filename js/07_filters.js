// ===== FILTRI =====

const PROGETTO_COLORS = ['#27ae60','#3498db','#9b59b6','#e67e22','#e74c3c','#1abc9c','#f39c12','#16a085','#2980b9','#8e44ad'];

// --- Cards Progetto con sotto-griglia Ordinativi ---
function populateProgettoMultiSelect() {
    const progetti = [...new Set(allTrees.map(t => t.progetto).filter(p => p && p !== '-'))].sort();
    const container = document.getElementById('progettoOptions');
    if (!container) return;
    container.innerHTML = '';

    progetti.forEach((p, idx) => {
        const count = allTrees.filter(t => t.progetto === p).length;
        const color = PROGETTO_COLORS[idx % PROGETTO_COLORS.length];
        const pEsc = p.replace(/"/g, '&quot;');

        const ordinativi = [...new Set(
            allTrees.filter(t => t.progetto === p && t.ordinativo && t.ordinativo !== '-').map(t => t.ordinativo)
        )].sort();
        const hasOrdinativi = ordinativi.length > 0;

        const wrap = document.createElement('div');
        wrap.className = 'progetto-item-wrap progetto-section';

        // Checkbox nascosta (usata dalla logica filtri)
        const hiddenCb = document.createElement('input');
        hiddenCb.type = 'checkbox';
        hiddenCb.className = 'progetto-cb';
        hiddenCb.value = p;
        hiddenCb.checked = true;
        hiddenCb.style.display = 'none';
        hiddenCb.addEventListener('change', function () { onProgettoCbChange(this); });
        wrap.appendChild(hiddenCb);

        if (hasOrdinativi) {
            // Intestazione sezione (click = toggle tutto il progetto)
            const header = document.createElement('div');
            header.className = 'progetto-section-header';
            header.style.setProperty('--section-color', color);
            header.innerHTML = `
                <label class="progetto-header-toggle" onclick="event.stopPropagation()">
                    <input type="checkbox" class="progetto-header-switch" checked>
                    <span class="toggle-switch"></span>
                </label>
                <span class="progetto-section-dot" style="background:${color}"></span>
                <span class="progetto-section-name" title="${pEsc}">${p}</span>
                <span class="progetto-section-count">${count}</span>
            `;
            header.querySelector('.progetto-header-switch').addEventListener('change', function(e) {
                e.stopPropagation();
                toggleProgettoCard(wrap);
            });
            header.addEventListener('click', () => toggleProgettoCard(wrap));
            wrap.appendChild(header);

            // Sotto-griglia ordinativi (sempre visibile)
            const subGrid = document.createElement('div');
            subGrid.className = 'ordinativi-cards-grid';

            ordinativi.forEach(o => {
                const oCount = allTrees.filter(t => t.progetto === p && t.ordinativo === o).length;

                const cardWrap = document.createElement('div');
                cardWrap.className = 'ordinativo-card-wrap';

                const hiddenOrdCb = document.createElement('input');
                hiddenOrdCb.type = 'checkbox';
                hiddenOrdCb.className = 'ordinativo-sub-cb';
                hiddenOrdCb.value = o;
                hiddenOrdCb.checked = true;
                hiddenOrdCb.style.display = 'none';
                hiddenOrdCb.addEventListener('change', function () { onOrdinativoSubCbChange(this); });
                cardWrap.appendChild(hiddenOrdCb);

                const ordCard = document.createElement('div');
                ordCard.className = 'ordinativo-card selected';
                ordCard.style.setProperty('--ord-color', color);
                ordCard.innerHTML = `
                    <div class="ordinativo-card-name" title="${o.replace(/"/g,'&quot;')}">${o}</div>
                    <div class="ordinativo-card-count">${oCount}</div>
                `;
                ordCard.addEventListener('click', () => toggleOrdinativoCard(cardWrap));
                cardWrap.appendChild(ordCard);

                subGrid.appendChild(cardWrap);
            });

            wrap.appendChild(subGrid);
        } else {
            // Progetto senza ordinativi: card singola
            const card = document.createElement('div');
            card.className = 'progetto-card selected';
            card.style.setProperty('--prog-color', color);
            card.innerHTML = `
                <div class="progetto-card-content">
                    <div class="progetto-card-name" title="${pEsc}">${p}</div>
                </div>
                <span class="progetto-card-count">${count}</span>
            `;
            card.addEventListener('click', () => toggleProgettoCard(wrap));
            wrap.appendChild(card);
        }

        container.appendChild(wrap);
    });
}

function toggleProgettoCard(wrap) {
    const cb = wrap.querySelector('.progetto-cb');
    if (!cb) return;
    cb.checked = !cb.checked;
    // Progetto senza ordinativi
    const card = wrap.querySelector('.progetto-card');
    if (card) card.classList.toggle('selected', cb.checked);
    // Progetto con ordinativi: sync tutte le card ordinativo
    wrap.querySelectorAll('.ordinativo-sub-cb').forEach(c => { c.checked = cb.checked; });
    wrap.querySelectorAll('.ordinativo-card').forEach(c => c.classList.toggle('selected', cb.checked));
    // Sync switch visuale
    const sw = wrap.querySelector('.progetto-header-switch');
    if (sw) { sw.checked = cb.checked; sw.indeterminate = false; }
    _updateSectionHeaderState(wrap);
    _syncProgettoAllCheckbox();
    applyFilters();
}

function toggleOrdinativoCard(cardWrap) {
    const cb = cardWrap.querySelector('.ordinativo-sub-cb');
    if (!cb) return;
    cb.checked = !cb.checked;
    const card = cardWrap.querySelector('.ordinativo-card');
    if (card) card.classList.toggle('selected', cb.checked);
    const wrap = cardWrap.closest('.progetto-item-wrap');
    if (wrap) {
        const allSubCbs = wrap.querySelectorAll('.ordinativo-sub-cb');
        const checkedCount = Array.from(allSubCbs).filter(c => c.checked).length;
        const progettoCb = wrap.querySelector('.progetto-cb');
        if (progettoCb) {
            progettoCb.checked = checkedCount > 0;
            progettoCb.indeterminate = checkedCount > 0 && checkedCount < allSubCbs.length;
        }
        _updateSectionHeaderState(wrap);
    }
    _syncProgettoAllCheckbox();
    applyFilters();
}

function _updateSectionHeaderState(wrap) {
    const header = wrap.querySelector('.progetto-section-header');
    if (!header) return;
    const allSubCbs = wrap.querySelectorAll('.ordinativo-sub-cb');
    const checkedCount = Array.from(allSubCbs).filter(c => c.checked).length;
    header.classList.toggle('partial', checkedCount > 0 && checkedCount < allSubCbs.length);
    header.classList.toggle('none', checkedCount === 0);
    header.classList.toggle('all', checkedCount === allSubCbs.length);
    const sw = header.querySelector('.progetto-header-switch');
    if (sw) {
        sw.checked = checkedCount > 0;
        sw.indeterminate = checkedCount > 0 && checkedCount < allSubCbs.length;
    }
}

function _syncProgettoAllCheckbox() {
    const allCb = document.getElementById('progettoAll');
    if (!allCb) return;
    const cbs = document.querySelectorAll('.progetto-cb');
    const checkedCount = Array.from(cbs).filter(c => c.checked).length;
    allCb.checked = checkedCount === cbs.length;
    allCb.indeterminate = checkedCount > 0 && checkedCount < cbs.length;
}

function toggleOrdinativiSubgroup(btn, event) {
    event.stopPropagation();
    const wrap = btn.closest('.progetto-item-wrap');
    const subGroup = wrap.querySelector('.ordinativi-subgroup');
    const icon = btn.querySelector('i');
    const isOpen = subGroup.classList.contains('open');
    subGroup.classList.toggle('open', !isOpen);
    icon.style.transform = isOpen ? '' : 'rotate(180deg)';
}

function onProgettoCbChange(cb) {
    const wrap = cb.closest('.progetto-item-wrap');
    const card = wrap && wrap.querySelector('.progetto-card');
    if (card) card.classList.toggle('selected', cb.checked);
    wrap.querySelectorAll('.ordinativo-sub-cb').forEach(c => { c.checked = cb.checked; });
    wrap.querySelectorAll('.ordinativo-card').forEach(c => c.classList.toggle('selected', cb.checked));
    const sw = wrap && wrap.querySelector('.progetto-header-switch');
    if (sw) { sw.checked = cb.checked; sw.indeterminate = false; }
    _updateSectionHeaderState(wrap);
    _syncProgettoAllCheckbox();
    applyFilters();
}

function onOrdinativoSubCbChange(cb) {
    const cardWrap = cb.closest('.ordinativo-card-wrap');
    if (cardWrap) {
        const ordCard = cardWrap.querySelector('.ordinativo-card');
        if (ordCard) ordCard.classList.toggle('selected', cb.checked);
    }
    const wrap = cb.closest('.progetto-item-wrap');
    if (!wrap) return;
    const allSubCbs = wrap.querySelectorAll('.ordinativo-sub-cb');
    const checkedCount = Array.from(allSubCbs).filter(c => c.checked).length;
    const progettoCb = wrap.querySelector('.progetto-cb');
    if (progettoCb) {
        progettoCb.checked = checkedCount > 0;
        progettoCb.indeterminate = checkedCount > 0 && checkedCount < allSubCbs.length;
    }
    _updateSectionHeaderState(wrap);
    _syncProgettoAllCheckbox();
    applyFilters();
}

function toggleAllOrdinativiForProgetto(cb) {
    // mantenuta per compatibilità, ora non ha checkbox "tutti" visibile
    const wrap = cb.closest('.progetto-item-wrap');
    if (!wrap) return;
    wrap.querySelectorAll('.ordinativo-sub-cb').forEach(c => { c.checked = cb.checked; });
    wrap.querySelectorAll('.ordinativo-card').forEach(c => c.classList.toggle('selected', cb.checked));
    const progettoCb = wrap.querySelector('.progetto-cb');
    if (progettoCb) { progettoCb.checked = cb.checked; progettoCb.indeterminate = false; }
    _updateSectionHeaderState(wrap);
    _syncProgettoAllCheckbox();
    applyFilters();
}

function getProgettoOrdinativoSelection() {
    const wraps = document.querySelectorAll('.progetto-item-wrap');
    if (wraps.length === 0) {
        const result = {};
        [...new Set(allTrees.map(t => t.progetto).filter(p => p && p !== '-'))].forEach(p => { result[p] = null; });
        return result;
    }
    const result = {};
    wraps.forEach(wrap => {
        const progettoCb = wrap.querySelector('.progetto-cb');
        if (!progettoCb || !progettoCb.value) return;
        const subCbs = wrap.querySelectorAll('.ordinativo-sub-cb');
        if (subCbs.length === 0) {
            if (progettoCb.checked) result[progettoCb.value] = null;
        } else {
            const checked = Array.from(subCbs).filter(c => c.checked).map(c => c.value);
            if (checked.length > 0) result[progettoCb.value] = new Set(checked);
        }
    });
    return result;
}

function toggleAllProgetti(cb) {
    document.querySelectorAll('.progetto-cb').forEach(c => { c.checked = cb.checked; c.indeterminate = false; });
    document.querySelectorAll('.progetto-card').forEach(card => card.classList.toggle('selected', cb.checked));
    document.querySelectorAll('.ordinativo-sub-cb').forEach(c => { c.checked = cb.checked; });
    document.querySelectorAll('.ordinativo-card').forEach(card => card.classList.toggle('selected', cb.checked));
    document.querySelectorAll('.progetto-item-wrap').forEach(wrap => _updateSectionHeaderState(wrap));
    applyFilters();
}

function onProgettoChange() {
    _syncProgettoAllCheckbox();
    applyFilters();
}

function getSelectedProgetti() {
    return Array.from(document.querySelectorAll('.progetto-item-wrap'))
        .filter(wrap => {
            const progettoCb = wrap.querySelector('.progetto-cb');
            if (!progettoCb) return false;
            if (progettoCb.checked) return true;
            return Array.from(wrap.querySelectorAll('.ordinativo-sub-cb')).some(c => c.checked);
        })
        .map(wrap => wrap.querySelector('.progetto-cb').value);
}

function populateFilterSelects() {
    populateProgettoMultiSelect();

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

    // I civici verranno popolati dinamicamente in base all'Odonimo selezionato
    // Inizialmente lasciamo solo l'opzione di default

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

    // Inizializza i civici (mostra tutti inizialmente)
    updateCiviciByOdonimo();
}

// Funzione per aggiornare dinamicamente i civici in base all'Odonimo selezionato
function updateCiviciByOdonimo() {
    const odonimoValue = document.getElementById('odonimoFilter').value;
    const civicoSelect = document.getElementById('civicoFilter');
    const currentCivicoValue = civicoSelect.value;

    // Rimuovi tutte le opzioni tranne la prima (placeholder)
    while (civicoSelect.options.length > 1) {
        civicoSelect.remove(1);
    }

    if (!odonimoValue) {
        // Se non c'è un Odonimo selezionato, mostra tutti i civici
        const allCivici = [...new Set(allTrees.map(t => t.civico).filter(c => c && c !== '-'))].sort((a, b) => {
            const numA = parseInt(a) || 0;
            const numB = parseInt(b) || 0;
            return numA - numB;
        });

        allCivici.forEach(civ => {
            const opt = document.createElement('option');
            opt.value = civ;
            const count = allTrees.filter(t => t.civico === civ).length;
            opt.textContent = `${civ} (${count})`;
            civicoSelect.appendChild(opt);
        });
    } else {
        // Filtra i civici solo per l'Odonimo selezionato
        const civiciForOdonimo = [...new Set(
            allTrees
                .filter(t => t.odonimo === odonimoValue)
                .map(t => t.civico)
                .filter(c => c && c !== '-')
        )].sort((a, b) => {
            const numA = parseInt(a) || 0;
            const numB = parseInt(b) || 0;
            return numA - numB;
        });

        civiciForOdonimo.forEach(civ => {
            const opt = document.createElement('option');
            opt.value = civ;
            const count = allTrees.filter(t => t.odonimo === odonimoValue && t.civico === civ).length;
            opt.textContent = `${civ} (${count})`;
            civicoSelect.appendChild(opt);
        });
    }

    // Ripristina il valore del civico se ancora disponibile
    if (currentCivicoValue && Array.from(civicoSelect.options).some(opt => opt.value === currentCivicoValue)) {
        civicoSelect.value = currentCivicoValue;
    } else {
        civicoSelect.value = '';
    }
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
    const maxHeightEl = document.getElementById('maxHeight');
    const maxHeight = maxHeightEl ? parseFloat(maxHeightEl.value) : Infinity;
    const minDiameter = parseFloat(document.getElementById('minDiameter').value);
    const maxDiameterEl = document.getElementById('maxDiameter');
    const maxDiameter = maxDiameterEl ? parseFloat(maxDiameterEl.value) : Infinity;
    const odonimo = document.getElementById('odonimoFilter').value;
    const civico = document.getElementById('civicoFilter').value;
    const upl = document.getElementById('uplFilter').value;
    const quartiere = document.getElementById('quartiereFilter').value;
    const circoscrizione = document.getElementById('circoscrizioneFilter').value;
    const pulizia = document.getElementById('puliziaFilter').value;
    const fase = document.getElementById('faseFilter').value;
    const progettoSel = getProgettoOrdinativoSelection();
    let testValue = filterValue;

    return allTrees.filter(tree => {
        let match = true;

        if (filterType === 'progetto') {
            match = match && tree.progetto === filterValue;
        } else {
            const pSel = progettoSel[tree.progetto];
            match = match && pSel !== undefined && (pSel === null || pSel.has(tree.ordinativo) || !tree.ordinativo || tree.ordinativo === '-');
        }

        // Applica il filtro corrente che stiamo testando
        if (filterType === 'specie') match = match && tree.specie === testValue;
        else if (specie) match = match && tree.specie === specie;

        if (filterType === 'cpc') match = match && tree.cpc === testValue;
        else if (cpc) match = match && tree.cpc === cpc;

        if (filterType === 'site') match = match && tree.sito === testValue;
        else if (site) match = match && tree.sito === site;

        if (filterType === 'odonimo') match = match && tree.odonimo === testValue;
        else if (odonimo) match = match && tree.odonimo === odonimo;

        if (filterType === 'civico') match = match && tree.civico === testValue;
        else if (civico) match = match && tree.civico === civico;

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

        // Filtro fase lavorazione
        if (filterType === 'fase') {
            if (testValue === 'fase1') match = match && true; // Tutti hanno fase 1
            else if (testValue === 'fase2') match = match && (tree.cod_lav_f2 || tree.lavori_f2 || tree.prezzo_f2 || tree.data_lav_f2);
            else if (testValue === 'fase3') match = match && (tree.cod_lav_f3 || tree.lavori_f3 || tree.prezzo_f3 || tree.data_lav_f3);
            // FASE 4 DISATTIVATA - Non rientra nei filtri
            // else if (testValue === 'fase4') match = match && (tree.cod_lav_f4 || tree.lavori_f4 || tree.prezzo_f4 || tree.data_lav_f4);
        } else if (fase) {
            if (fase === 'fase1') match = match && true; // Tutti hanno fase 1
            else if (fase === 'fase2') match = match && (tree.cod_lav_f2 || tree.lavori_f2 || tree.prezzo_f2 || tree.data_lav_f2);
            else if (fase === 'fase3') match = match && (tree.cod_lav_f3 || tree.lavori_f3 || tree.prezzo_f3 || tree.data_lav_f3);
            // FASE 4 DISATTIVATA - Non rientra nei filtri
            // else if (fase === 'fase4') match = match && (tree.cod_lav_f4 || tree.lavori_f4 || tree.prezzo_f4 || tree.data_lav_f4);
        }

        match = match && (tree.altezza === null || (tree.altezza >= minHeight && tree.altezza <= maxHeight));
        match = match && (tree.diametro === null || (tree.diametro >= minDiameter && tree.diametro <= maxDiameter));

        return match;
    }).length;
}

function applyFilters() {
    // Resetta l'albero selezionato quando si applicano i filtri manuali
    selectedTree = null;
    selectedMarker = null;

    const specie = document.getElementById('specieFilter').value;
    const cpc = document.getElementById('cpcFilter').value;
    const site = document.getElementById('siteFilter').value;
    const minHeight = parseFloat(document.getElementById('minHeight').value);
    const maxHeightEl_a = document.getElementById('maxHeight');
    const maxHeight = maxHeightEl_a ? parseFloat(maxHeightEl_a.value) : Infinity;
    const minDiameter = parseFloat(document.getElementById('minDiameter').value);
    const maxDiameterEl_a = document.getElementById('maxDiameter');
    const maxDiameter = maxDiameterEl_a ? parseFloat(maxDiameterEl_a.value) : Infinity;
    const odonimo = document.getElementById('odonimoFilter').value;
    const civico = document.getElementById('civicoFilter').value;
    const upl = document.getElementById('uplFilter').value;
    const quartiere = document.getElementById('quartiereFilter').value;
    const circoscrizione = document.getElementById('circoscrizioneFilter').value;
    const pulizia = document.getElementById('puliziaFilter').value;
    const fase = document.getElementById('faseFilter').value;
    const progettoSel = getProgettoOrdinativoSelection();

    filteredTrees = allTrees.filter(tree => {
        const pSel = progettoSel[tree.progetto];
        let match = pSel !== undefined && (pSel === null || pSel.has(tree.ordinativo) || !tree.ordinativo || tree.ordinativo === '-') &&
               (!specie || tree.specie === specie) &&
               (!cpc || tree.cpc === cpc) &&
               (!site || tree.sito === site) &&
               (tree.altezza === null || (tree.altezza >= minHeight && tree.altezza <= maxHeight)) &&
               (tree.diametro === null || (tree.diametro >= minDiameter && tree.diametro <= maxDiameter)) &&
               (!odonimo || tree.odonimo === odonimo) &&
               (!civico || tree.civico === civico) &&
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

        // Applica filtro fase lavorazione
        if (match && fase) {
            if (fase === 'fase1') match = match && true; // Tutti hanno fase 1
            else if (fase === 'fase2') match = match && (tree.cod_lav_f2 || tree.lavori_f2 || tree.prezzo_f2 || tree.data_lav_f2);
            else if (fase === 'fase3') match = match && (tree.cod_lav_f3 || tree.lavori_f3 || tree.prezzo_f3 || tree.data_lav_f3);
            // FASE 4 DISATTIVATA - Non rientra nei filtri
            // else if (fase === 'fase4') match = match && (tree.cod_lav_f4 || tree.lavori_f4 || tree.prezzo_f4 || tree.data_lav_f4);
        }

        // Time-slider F1→F2→F3
        if (match && window.vuTimeSlider && typeof window.vuTimeSlider.passes === 'function') {
            match = window.vuTimeSlider.passes(tree);
        }
        return match;
    });

    updateFilterInfo();
    updateFilterCounts();
    updatePageTitle(odonimo);
    updateMap();
    updateStats();
    updateCharts();
    if (typeof updateURLFromFilters === 'function') updateURLFromFilters();
    if (typeof renderFilterChips === 'function') renderFilterChips();
    _syncRightSidebarTabs();
}

function _maybeCloseRightSidebar() {
    const btns = document.querySelectorAll('#sidebarRight .sb-tab-btn');
    const anyVisible = Array.from(btns).some(function(b) { return b.style.display !== 'none'; });
    if (!anyVisible) {
        const container = document.querySelector('.container');
        if (container && !container.classList.contains('sidebar-right-hidden')) {
            if (typeof toggleSidebarRight === 'function') toggleSidebarRight();
        }
    }
}

function _syncRightSidebarTabs() {
    const hasData = getSelectedProgetti().length > 0;
    ['statistiche', 'dataviz'].forEach(function(tabId) {
        const btn  = document.querySelector('#sidebarRight .sb-tab-btn[data-tab="' + tabId + '"]');
        const pane = document.getElementById('sb-pane-' + tabId);
        if (!btn) return;
        btn.style.display = hasData ? '' : 'none';
        if (!hasData && pane && pane.classList.contains('active')) {
            pane.classList.remove('active');
            btn.classList.remove('active');
            const lipuBtn = document.getElementById('sb-tab-btn-lipu');
            if (lipuBtn && lipuBtn.style.display !== 'none') {
                if (typeof showRightSidebarTab === 'function') showRightSidebarTab('lipu-stats');
            }
        }
    });
    if (hasData) {
        const container = document.querySelector('.container');
        if (container && container.classList.contains('sidebar-right-hidden')) {
            if (typeof toggleSidebarRight === 'function') toggleSidebarRight();
        }
        const hasActive = document.querySelector('#sidebarRight .sb-pane.active');
        if (!hasActive && typeof showRightSidebarTab === 'function') showRightSidebarTab('dataviz');
    } else {
        _maybeCloseRightSidebar();
    }
}

// Aggiorna il titolo della pagina con l'Odonimo selezionato
function updatePageTitle(odonimo) {
    const titleElement = document.getElementById('pageTitle');
    if (!titleElement) {
        console.warn('⚠️ Elemento pageTitle non trovato');
        return;
    }
    if (odonimo) {
        titleElement.innerHTML = `<i class="fas fa-tree"></i> Rigenerazione del Verde Urbano di Palermo: Riqualificazione Stradale e Arredo della Città | ${odonimo}`;
    } else {
        titleElement.innerHTML = `<i class="fas fa-tree"></i> Rigenerazione del Verde Urbano di Palermo: Riqualificazione Stradale e Arredo della Città`;
    }
}

function updateFilterInfo() {
    // Helper per accedere in sicurezza agli elementi
    const safeGetElement = (id) => document.getElementById(id);
    const safeGetValue = (id) => {
        const elem = safeGetElement(id);
        return elem ? elem.value : '';
    };
    const safeSetText = (id, text) => {
        const elem = safeGetElement(id);
        if (elem) elem.textContent = text;
    };

    const selectedP = getSelectedProgetti();
    safeSetText('progettoInfo', selectedP.length ? `${filteredTrees.length} alberi` : '');

    const specieValue = safeGetValue('specieFilter');
    const cpcValue = safeGetValue('cpcFilter');
    const siteValue = safeGetValue('siteFilter');
    const odonimoValue = safeGetValue('odonimoFilter');
    const civicoValue = safeGetValue('civicoFilter');
    const uplValue = safeGetValue('uplFilter');
    const quartiereValue = safeGetValue('quartiereFilter');
    const circoscrizioneValue = safeGetValue('circoscrizioneFilter');
    const puliziaValue = safeGetValue('puliziaFilter');
    const faseValue = safeGetValue('faseFilter');

    safeSetText('specieInfo', specieValue ? `${filteredTrees.filter(t => t.specie === specieValue).length}` : '');
    safeSetText('cpcInfo', cpcValue ? `${filteredTrees.filter(t => t.cpc === cpcValue).length}` : '');
    safeSetText('siteInfo', siteValue ? `${filteredTrees.filter(t => t.sito === siteValue).length}` : '');
    safeSetText('odonimoInfo', odonimoValue ? `${filteredTrees.filter(t => t.odonimo === odonimoValue).length}` : '');
    safeSetText('civicoInfo', civicoValue ? `${filteredTrees.filter(t => t.civico === civicoValue).length}` : '');
    safeSetText('uplInfo', uplValue ? `${filteredTrees.filter(t => t.upl === uplValue).length}` : '');
    safeSetText('quartiereInfo', quartiereValue ? `${filteredTrees.filter(t => t.quartiere === quartiereValue).length}` : '');
    safeSetText('circoscrizioneInfo', circoscrizioneValue ? `${filteredTrees.filter(t => t.circoscrizione === circoscrizioneValue).length}` : '');
    safeSetText('puliziaInfo', puliziaValue ? `${filteredTrees.length} alberi` : '');
    safeSetText('faseInfo', faseValue ? `${filteredTrees.length} alberi` : '');
}

// ── Filtri a cascata ──────────────────────────────────────────────────────────
function _getFilteredExcluding(excludeField) {
    const specie = document.getElementById('specieFilter').value;
    const cpc = document.getElementById('cpcFilter').value;
    const site = document.getElementById('siteFilter').value;
    const minHeight = parseFloat(document.getElementById('minHeight').value) || 0;
    const maxHeightEl = document.getElementById('maxHeight');
    const maxHeight = maxHeightEl ? parseFloat(maxHeightEl.value) : Infinity;
    const minDiameter = parseFloat(document.getElementById('minDiameter').value) || 0;
    const maxDiameterEl = document.getElementById('maxDiameter');
    const maxDiameter = maxDiameterEl ? parseFloat(maxDiameterEl.value) : Infinity;
    const odonimo = document.getElementById('odonimoFilter').value;
    const civico = document.getElementById('civicoFilter').value;
    const upl = document.getElementById('uplFilter').value;
    const quartiere = document.getElementById('quartiereFilter').value;
    const circoscrizione = document.getElementById('circoscrizioneFilter').value;
    const pulizia = document.getElementById('puliziaFilter').value;
    const fase = document.getElementById('faseFilter').value;
    const progettoSel = getProgettoOrdinativoSelection();

    return allTrees.filter(tree => {
        const pSel = progettoSel[tree.progetto];
        if (excludeField !== 'progetto') {
            if (pSel === undefined) return false;
            if (pSel !== null && tree.ordinativo && tree.ordinativo !== '-' && !pSel.has(tree.ordinativo)) return false;
        }
        if (excludeField !== 'specie' && specie && tree.specie !== specie) return false;
        if (excludeField !== 'cpc' && cpc && tree.cpc !== cpc) return false;
        if (excludeField !== 'site' && site && tree.sito !== site) return false;
        if (excludeField !== 'odonimo' && odonimo && tree.odonimo !== odonimo) return false;
        if (excludeField !== 'civico' && civico && tree.civico !== civico) return false;
        if (excludeField !== 'upl' && upl && tree.upl !== upl) return false;
        if (excludeField !== 'quartiere' && quartiere && tree.quartiere !== quartiere) return false;
        if (excludeField !== 'circoscrizione' && circoscrizione && tree.circoscrizione !== circoscrizione) return false;
        if (excludeField !== 'pulizia' && pulizia) {
            const pct = calcolaPrioritaPulizia(tree);
            if (pulizia === 'alta' && pct <= 30) return false;
            if (pulizia === 'media' && (pct < 15 || pct > 30)) return false;
            if (pulizia === 'bassa' && pct >= 15) return false;
        }
        if (excludeField !== 'fase' && fase) {
            if (fase === 'fase2' && !tree.cod_lav_f2 && !tree.lavori_f2 && !tree.prezzo_f2 && !tree.data_lav_f2) return false;
            if (fase === 'fase3' && !tree.cod_lav_f3 && !tree.lavori_f3 && !tree.prezzo_f3 && !tree.data_lav_f3) return false;
        }
        if (tree.altezza !== null && (tree.altezza < minHeight || tree.altezza > maxHeight)) return false;
        if (tree.diametro !== null && (tree.diametro < minDiameter || tree.diametro > maxDiameter)) return false;
        if (window.vuTimeSlider && typeof window.vuTimeSlider.passes === 'function') {
            if (!window.vuTimeSlider.passes(tree)) return false;
        }
        return true;
    });
}

function _rebuildDynamicSelect(selectId, excludeField, fieldFn, sortFn) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const currentValue = select.value;
    const candidates = _getFilteredExcluding(excludeField);

    const valueCounts = new Map();
    candidates.forEach(tree => {
        const val = fieldFn(tree);
        if (val && val !== '-') valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
    });

    while (select.options.length > 1) select.remove(1);

    const entries = [...valueCounts.entries()].sort(
        sortFn || ((a, b) => a[0].localeCompare(b[0]))
    );
    entries.forEach(([val, count]) => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val + ' (' + count + ')';
        select.appendChild(opt);
    });

    select.value = (currentValue && valueCounts.has(currentValue)) ? currentValue : '';
}

function _rebuildStaticSelect(selectId, excludeField, options, countFn) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const currentValue = select.value;
    const candidates = _getFilteredExcluding(excludeField);

    while (select.options.length > 1) select.remove(1);

    options.forEach(function(item) {
        const count = countFn(candidates, item.value);
        if (count === 0) return;
        const opt = document.createElement('option');
        opt.value = item.value;
        opt.textContent = item.label + ' (' + count + ')';
        select.appendChild(opt);
    });

    const still = Array.from(select.options).some(o => o.value === currentValue);
    select.value = (currentValue && still) ? currentValue : '';
}

function updateFilterCounts() {
    // Aggiorna i conteggi per le section progetto e card singole
    document.querySelectorAll('.progetto-cb').forEach(cb => {
        const count = getCountForFilter('progetto', cb.value);
        const wrap = cb.closest('.progetto-item-wrap');
        const sectionCount = wrap ? wrap.querySelector('.progetto-section-count') : null;
        if (sectionCount) sectionCount.textContent = count;
        const cardCount = wrap ? wrap.querySelector('.progetto-card-count') : null;
        if (cardCount) cardCount.textContent = count;
        cb.disabled = count === 0;
        const card = wrap ? wrap.querySelector('.progetto-card') : null;
        if (card) card.style.opacity = count === 0 ? '0.45' : '';
        const header = wrap ? wrap.querySelector('.progetto-section-header') : null;
        if (header) header.style.opacity = count === 0 ? '0.4' : '';
    });

    // Aggiorna i conteggi per le card ordinativo
    document.querySelectorAll('.ordinativo-sub-cb').forEach(cb => {
        const wrap = cb.closest('.progetto-item-wrap');
        const progettoCb = wrap ? wrap.querySelector('.progetto-cb') : null;
        const progettoVal = progettoCb ? progettoCb.value : '';
        const count = allTrees.filter(t => t.progetto === progettoVal && t.ordinativo === cb.value).length;
        const cardWrap = cb.closest('.ordinativo-card-wrap');
        const countEl = cardWrap ? cardWrap.querySelector('.ordinativo-card-count') : null;
        if (countEl) countEl.textContent = count;
        const ordCard = cardWrap ? cardWrap.querySelector('.ordinativo-card') : null;
        if (ordCard) ordCard.style.opacity = count === 0 ? '0.4' : '';
    });

    // Select dinamici a cascata
    _rebuildDynamicSelect('specieFilter', 'specie', t => t.specie);
    _rebuildDynamicSelect('siteFilter', 'site', t => t.sito);
    _rebuildDynamicSelect('odonimoFilter', 'odonimo', t => t.odonimo);
    _rebuildDynamicSelect('civicoFilter', 'civico', t => t.civico,
        (a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
    _rebuildDynamicSelect('uplFilter', 'upl', t => t.upl);
    _rebuildDynamicSelect('quartiereFilter', 'quartiere', t => t.quartiere);
    _rebuildDynamicSelect('circoscrizioneFilter', 'circoscrizione', t => t.circoscrizione);

    // Select statici a cascata
    _rebuildStaticSelect('cpcFilter', 'cpc', [
        { value: 'A',         label: 'A - Trascurabile' },
        { value: 'B',         label: 'B - Bassa' },
        { value: 'C',         label: 'C - Moderata' },
        { value: 'C/D',       label: 'C/D - Elevata' },
        { value: 'D',         label: 'D - Estrema' },
        { value: 'Ceppaia',   label: 'Ceppaia' },
        { value: 'Vuoto',     label: 'Vuoto - Cercine vuoto' },
        { value: 'Verifica',  label: 'Verifica - Da verificare' },
        { value: 'Non Class', label: 'Non Class - Non Classificato' },
        { value: 'No Interv', label: 'No Interv - Nessun Intervento' }
    ], (candidates, val) => candidates.filter(t => t.cpc === val).length);

    _rebuildStaticSelect('puliziaFilter', 'pulizia', [
        { value: 'alta',  label: 'Alta priorità (>30% variazione)' },
        { value: 'media', label: 'Media priorità (15-30%)' },
        { value: 'bassa', label: 'Bassa priorità (<15%)' }
    ], (candidates, val) => candidates.filter(t => {
        const pct = calcolaPrioritaPulizia(t);
        if (val === 'alta')  return pct > 30;
        if (val === 'media') return pct >= 15 && pct <= 30;
        if (val === 'bassa') return pct < 15;
        return false;
    }).length);

    _rebuildStaticSelect('faseFilter', 'fase', [
        { value: 'fase1', label: 'Solo Fase 1 (Potatura/Abbattimento)' },
        { value: 'fase2', label: 'Con Fase 2 (Rimozione ceppo)' },
        { value: 'fase3', label: 'Con Fase 3 (Nuova pianta)' }
    ], (candidates, val) => {
        if (val === 'fase1') return candidates.length;
        if (val === 'fase2') return candidates.filter(t => t.cod_lav_f2 || t.lavori_f2 || t.prezzo_f2 || t.data_lav_f2).length;
        if (val === 'fase3') return candidates.filter(t => t.cod_lav_f3 || t.lavori_f3 || t.prezzo_f3 || t.data_lav_f3).length;
        return 0;
    });
}

function resetFilters() {
    // Resetta anche l'albero selezionato dalla mappa
    selectedTree = null;
    selectedMarker = null;

    document.querySelectorAll('.progetto-cb').forEach(c => { c.checked = true; c.indeterminate = false; });
    document.querySelectorAll('.progetto-card').forEach(card => { card.classList.add('selected'); card.style.opacity = ''; });
    document.querySelectorAll('.ordinativo-sub-cb').forEach(c => { c.checked = true; });
    document.querySelectorAll('.ordinativo-card').forEach(card => { card.classList.add('selected'); card.style.opacity = ''; });
    document.querySelectorAll('.progetto-section-header').forEach(h => { h.style.opacity = ''; h.classList.remove('partial','none'); h.classList.add('all'); });
    document.querySelectorAll('.progetto-header-switch').forEach(sw => { sw.checked = true; sw.indeterminate = false; });
    const allCb = document.getElementById('progettoAll');
    if (allCb) { allCb.checked = true; allCb.indeterminate = false; }

    document.getElementById('specieFilter').value = '';
    document.getElementById('cpcFilter').value = '';
    document.getElementById('siteFilter').value = '';
    document.getElementById('minHeight').value = '0';
    document.getElementById('minDiameter').value = '0';
    var mxH = document.getElementById('maxHeight'); if (mxH) mxH.value = mxH.max;
    var mxD = document.getElementById('maxDiameter'); if (mxD) mxD.value = mxD.max;
    if (typeof syncDualRange === 'function') {
        document.querySelectorAll('.dual-range__input--min').forEach(function(i){ syncDualRange(i); });
    }
    document.getElementById('odonimoFilter').value = '';
    document.getElementById('civicoFilter').value = '';
    document.getElementById('uplFilter').value = '';
    document.getElementById('quartiereFilter').value = '';
    document.getElementById('circoscrizioneFilter').value = '';
    document.getElementById('puliziaFilter').value = '';
    document.getElementById('faseFilter').value = '';
    updateHeightLabel();
    updateDiameterLabel();

    // Ripristina tutti i civici quando si resetta
    updateCiviciByOdonimo();

    applyFilters();
}


// ===== DUAL-RANGE SLIDER SYNC =====
function syncDualRange(input) {
    const wrap = input.closest('.dual-range');
    if (!wrap) return;
    const min = wrap.querySelector('.dual-range__input--min');
    const max = wrap.querySelector('.dual-range__input--max');
    let vMin = parseFloat(min.value);
    let vMax = parseFloat(max.value);
    // Enforce min <= max while keeping the user's last touched handle as priority
    const MIN_GAP = 0;
    if (vMin > vMax) {
        if (input === min) { max.value = vMin; vMax = vMin; }
        else { min.value = vMax; vMin = vMax; }
    }
    const rangeMin = parseFloat(min.min);
    const rangeMax = parseFloat(min.max);
    const span = rangeMax - rangeMin || 1;
    const leftPct = ((vMin - rangeMin) / span) * 100;
    const rightPct = 100 - ((vMax - rangeMin) / span) * 100;
    const highlight = wrap.querySelector('.dual-range__highlight');
    if (highlight) {
        highlight.style.left = leftPct + '%';
        highlight.style.right = rightPct + '%';
    }
    // Update labels
    if (min.id === 'minHeight') {
        document.getElementById('minHeightLabel').textContent = vMin;
        document.getElementById('maxHeightLabel').textContent = vMax;
    } else if (min.id === 'minDiameter') {
        document.getElementById('minDiameterLabel').textContent = vMin;
        document.getElementById('maxDiameterLabel').textContent = vMax;
    }
}
// Initialize highlights on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.dual-range').forEach(function(wrap) {
        const min = wrap.querySelector('.dual-range__input--min');
        if (min) syncDualRange(min);
    });
});
