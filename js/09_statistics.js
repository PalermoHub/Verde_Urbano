// ===== STATISTICHE =====
function updateStats() {
    const total = allTrees.length;
    const filtered = filteredTrees.length;
    const altezze = filteredTrees.filter(t => t.altezza !== null).map(t => t.altezza);
    const diametri = filteredTrees.filter(t => t.diametro !== null).map(t => t.diametro);
    const species = new Set(filteredTrees.map(t => t.specie)).size;

    // Statistiche base
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statFiltered').textContent = filtered;
    document.getElementById('statAvgHeight').textContent = altezze.length > 0 ?
        (altezze.reduce((a, b) => a + b, 0) / altezze.length).toFixed(1) + 'm' : '-';
    document.getElementById('statAvgDiameter').textContent = diametri.length > 0 ?
        (diametri.reduce((a, b) => a + b, 0) / diametri.length).toFixed(1) + 'cm' : '-';
    document.getElementById('statSpecies').textContent = species;

    // ===== NUOVA PARTE: Conteggio CPC =====
    const cpcCount = {B: 0, C: 0, 'C/D': 0, D: 0};
    filteredTrees.forEach(t => {
        if (cpcCount.hasOwnProperty(t.cpc)) {
            cpcCount[t.cpc]++;
        }
    });
    document.getElementById('statCpcB').textContent = cpcCount.B;
    document.getElementById('statCpcC').textContent = cpcCount.C;
    document.getElementById('statCpcCD').textContent = cpcCount['C/D'];
    document.getElementById('statCpcD').textContent = cpcCount.D;

    // ===== NUOVA PARTE: Conteggio Cod. Lavorazione =====
    const lavorazioneCount = {};
    filteredTrees.forEach(t => {
        lavorazioneCount[t.codice] = (lavorazioneCount[t.codice] || 0) + 1;
    });

    // Ordina per frequenza decrescente
    const sortedLavorazioni = Object.entries(lavorazioneCount)
        .sort((a, b) => b[1] - a[1]);

    // Crea HTML per le lavorazioni
    let lavorazioneHTML = '';
    sortedLavorazioni.forEach(([cod, count]) => {
        lavorazioneHTML += `
            <div style="padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-left: 3px solid #27ae60; border-radius: 4px;">
                <strong>${cod}</strong>: <span style="color: #27ae60; font-weight: 700;">${count}</span>
            </div>
        `;
    });

    document.getElementById('statLavorazione').innerHTML = lavorazioneHTML ||
        '<div style="padding: 8px; color: #999;">Nessun dato</div>';

    // ===== NUOVA PARTE: Calcoli ambientali e costi =====
    let totalO2 = 0;
    let totalCO2 = 0;
    let totalWorkingCost = 0;

    filteredTrees.forEach(t => {
        totalO2 += parseFloat(calculateO2Production(t));
        totalCO2 += parseFloat(calculateCO2Absorption(t));
        totalWorkingCost += getWorkingCost(t);
    });

    // Aggiorna i dati ambientali
    document.getElementById('statTotalO2').textContent = totalO2.toFixed(2) + ' kg/anno';
    document.getElementById('statTotalCO2').textContent = totalCO2.toFixed(2) + ' kg/anno';
    document.getElementById('statTotalWorkingCost').textContent = formatCurrency(totalWorkingCost);

    // ===== NUOVA PARTE: Dati Territorio =====
    const strade = new Set(filteredTrees.map(t => t.odonimo).filter(o => o !== '-'));
    const uplCount = {};
    const quartiereCount = {};
    const circoscrizioneCount = {};

    filteredTrees.forEach(t => {
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

    // Formatta i dati per territorio (mostra solo i primi 2 valori)
    const formatTerritorioData = (data) => {
        const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
        if (entries.length === 0) return '-';
        if (entries.length === 1) return `${entries[0][0]}: ${entries[0][1]}`;
        // Mostra i primi 2 risultati
        const top2 = entries.slice(0, 2).map(([nome, count]) => `${nome}: ${count}`).join(', ');
        return entries.length > 2 ? `${top2}, ...` : top2;
    };

    document.getElementById('statTotalStrade').textContent = strade.size;
    document.getElementById('statAlberiPerUPL').textContent = formatTerritorioData(uplCount);
    document.getElementById('statAlberiPerQuartiere').textContent = formatTerritorioData(quartiereCount);
    document.getElementById('statAlberiPerCircoscrizione').textContent = formatTerritorioData(circoscrizioneCount);
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
