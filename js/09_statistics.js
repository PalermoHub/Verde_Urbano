// ===== STATISTICHE =====
function updateStats() {
    window.VU_DEBUG && console.log('📊 Aggiornamento statistiche...', {totalTrees: allTrees.length, filteredTrees: filteredTrees.length});

    // Se c'è un albero selezionato, usa solo quello per le statistiche
    const treesToAnalyze = selectedTree ? [selectedTree] : filteredTrees;

    const total = allTrees.length;
    const filtered = treesToAnalyze.length;
    const altezze = treesToAnalyze.filter(t => t.altezza !== null).map(t => t.altezza);
    const diametri = treesToAnalyze.filter(t => t.diametro !== null).map(t => t.diametro);
    const species = new Set(treesToAnalyze.map(t => t.specie)).size;

    // Statistiche base
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statFiltered').textContent = filtered;
    document.getElementById('statAvgHeight').textContent = altezze.length > 0 ?
        (altezze.reduce((a, b) => a + b, 0) / altezze.length).toFixed(1) + 'm' : '-';
    document.getElementById('statAvgDiameter').textContent = diametri.length > 0 ?
        (diametri.reduce((a, b) => a + b, 0) / diametri.length).toFixed(1) + 'cm' : '-';
    document.getElementById('statSpecies').textContent = species;

    // Nota: I conteggi CPC sono ora gestiti nella legenda della mappa tramite updateLegendContent()

    // ===== NUOVA PARTE: Conteggio Cod. Lavorazione =====
    const lavorazioneMap = {};
    let totalConLavorazione = 0;
    treesToAnalyze.forEach(t => {
        const cod = (t.codice && t.codice !== '-') ? t.codice : null;
        if (!cod) return;
        totalConLavorazione++;
        if (!lavorazioneMap[cod]) {
            lavorazioneMap[cod] = { count: 0, descrizione: t.descrizione || '' };
        }
        lavorazioneMap[cod].count++;
    });

    const sortedLavorazioni = Object.entries(lavorazioneMap)
        .sort((a, b) => b[1].count - a[1].count);

    const tipiCount = sortedLavorazioni.length;

    // Hero card con totale tipi
    const heroHTML = `<div class="terr-hero-row" style="border-left-color:#27ae60;margin-bottom:10px;">
        <span><i class="fas fa-tools" style="color:#27ae60;margin-right:6px;"></i>Tipi di lavorazione</span>
        <span class="terr-hero-value">${tipiCount}</span>
    </div>`;

    let listHTML = '';
    if (sortedLavorazioni.length === 0) {
        listHTML = '<div class="rl-empty"><i class="fas fa-hourglass-half"></i> Nessun dato disponibile</div>';
    } else {
        const maxCount = sortedLavorazioni[0][1].count || 1;
        listHTML = '<div class="rl-items">' + sortedLavorazioni.map(([cod, { count, descrizione }], i) => {
            const pct = (count / maxCount * 100).toFixed(1);
            const desc = descrizione
                ? (descrizione.length > 30 ? descrizione.substring(0, 30) + '…' : descrizione)
                : '';
            return `<div class="rl-item lav-item">
                <span class="rl-rank">${i + 1}</span>
                <div class="lav-label-wrap" title="${cod}${descrizione ? ' — ' + descrizione : ''}">
                    <span class="rl-label">${cod}</span>
                    ${desc ? `<span class="lav-desc">${desc}</span>` : ''}
                </div>
                <div class="rl-bar-wrap"><div class="rl-bar" style="width:${pct}%;background:#27ae60"></div></div>
                <span class="rl-value">${count}</span>
            </div>`;
        }).join('') + '</div>';
    }

    document.getElementById('statLavorazione').innerHTML = heroHTML + listHTML;

    // ===== NUOVA PARTE: Calcoli ambientali e costi =====
    let totalO2 = 0;
    let totalCO2 = 0;
    let totalWorkingCost = 0;

    treesToAnalyze.forEach(t => {
        totalO2 += parseFloat(calculateO2Production(t));
        totalCO2 += parseFloat(calculateCO2Absorption(t));
        totalWorkingCost += getWorkingCost(t);
    });

    // Aggiorna i dati ambientali
    document.getElementById('statTotalO2').textContent = totalO2.toFixed(2) + ' kg/anno';
    document.getElementById('statTotalCO2').textContent = totalCO2.toFixed(2) + ' kg/anno';
    document.getElementById('statTotalWorkingCost').textContent = formatCurrency(totalWorkingCost);

    // ===== NUOVA PARTE: Dati Territorio =====
    const strade = new Set(treesToAnalyze.map(t => t.odonimo).filter(o => o !== '-'));
    const uplCount = {};
    const quartiereCount = {};
    const circoscrizioneCount = {};

    treesToAnalyze.forEach(t => {
        if (t.upl && t.upl !== '-') {
            uplCount[t.upl] = (uplCount[t.upl] || 0) + 1;
        }
        if (t.quartiere && t.quartiere !== '-') {
            quartiereCount[t.quartiere] = (quartiereCount[t.quartiere] || 0) + 1;
        }
        if (t.circoscrizione && t.circoscrizione !== '-') {
            circoscrizioneCount[t.circoscrizione] = (circoscrizioneCount[t.circoscrizione] || 0) + 1;
        }
    });

    // Formatta i dati per territorio come ranked list (stile rl-item)
    const formatTerritorioList = (data, color, filterKey) => {
        const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
        if (entries.length === 0) return '<div class="rl-empty"><i class="fas fa-hourglass-half"></i> Nessun dato disponibile</div>';
        const max = entries[0][1] || 1;
        const escAttr = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        return entries.map(([nome, count], i) => {
            const pct = (count / max * 100).toFixed(1);
            const display = nome.length > 22 ? nome.substring(0, 22) + '…' : nome;
            const clickable = filterKey ? ` data-filter-key="${filterKey}" data-filter-value="${escAttr(nome)}" role="button" tabindex="0" title="Clicca per filtrare: ${escAttr(nome)}"` : '';
            const klass = filterKey ? 'rl-item rl-item--clickable' : 'rl-item';
            return `<div class="${klass}"${clickable}>
                <span class="rl-rank">${i + 1}</span>
                <span class="rl-label">${display}</span>
                <div class="rl-bar-wrap"><div class="rl-bar" style="width:${pct}%;background:${color}"></div></div>
                <span class="rl-value">${count}</span>
            </div>`;
        }).join('');
    };

    document.getElementById('statTotalStrade').textContent = strade.size;
    document.getElementById('statAlberiPerUPL').innerHTML = formatTerritorioList(uplCount, '#3498db', 'uplFilter');
    document.getElementById('statAlberiPerQuartiere').innerHTML = formatTerritorioList(quartiereCount, 'var(--pa-green-500)', 'quartiereFilter');
    document.getElementById('statAlberiPerCircoscrizione').innerHTML = formatTerritorioList(circoscrizioneCount, '#e67e22', 'circoscrizioneFilter');

    window.VU_DEBUG && console.log('✅ Statistiche aggiornate con successo');
}

// ===== FUNZIONE PER FORMATTARE VALUTA IN FORMATO ITALIANO =====
function formatCurrency(value) {
    if (value === 0 || !value) return '0,00 €';

    // Converti in stringa con 2 decimali
    const fixed = value.toFixed(2);
    const [integerPart, decimalPart] = fixed.split('.');

    // Aggiungi separatore migliaia
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Ritorna nel formato italiano
    return `${formattedInteger},${decimalPart} €`;
}
