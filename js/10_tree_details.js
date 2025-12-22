// ===== DETTAGLI ALBERO =====
function showTreeDetails(tree) {
    selectedTree = tree;  // SALVA L'ALBERO SELEZIONATO

    // Calcola i valori ambientali
    const o2Production = calculateO2Production(tree);
    const co2Absorption = calculateCO2Absorption(tree);
    const workingCost = getWorkingCost(tree);

    const info = document.getElementById('selectedTreeInfo');
    info.innerHTML = `
        <div class="detail-item"><div class="detail-label">ID</div><div class="detail-value">${tree.id}</div></div>
        <div class="detail-item"><div class="detail-label">Specie arborea</div><div class="detail-value">${tree.specie}</div></div>
        <div class="detail-item"><div class="detail-label">Dimora</div><div class="detail-value">${tree.sito}</div></div>
        <div class="detail-item"><div class="detail-label">Altezza (m)</div><div class="detail-value">${tree.altezza || 'n/a'}</div></div>
        <div class="detail-item"><div class="detail-label">Diametro (cm)</div><div class="detail-value">${tree.diametro || 'n/a'}</div></div>
        <div class="detail-item"><div class="detail-label">classe propensione cedimento - CPC</div><div class="detail-value" style="color: ${cpcColors[tree.cpc]}">${tree.cpc}</div></div>
        <div class="detail-item"><div class="detail-label">Descrizione CPC</div><div class="detail-value">${tree.descrizione_ccp}</div></div>
        <div class="detail-item"><div class="detail-label">Cod. Lavorazione</div><div class="detail-value">${tree.codice}</div></div>
        <div class="detail-item" ><div class="detail-label">Tipo di lavorazione</div><div class="detail-value" style="font-size: 12px;">${tree.descrizione}</div></div>
        <div class="detail-item"><div class="detail-label">Prezzo unitario</div><div class="detail-value">${formatCurrency(tree.prezzo)}</div></div>

        <div class="detail-item" style="grid-column: 1/-1; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #e3f2fd 0%, #f1f8ff 100%); border-left: 4px solid #3498db; border-radius: 6px;">
            <div class="detail-label" style="margin-bottom: 10px;"><i class="fa fa-map-marker-alt"></i> LOCALIZZAZIONE TERRITORIALE</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Strada (Odonimo)</div><div class="detail-value">${tree.odonimo || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">UPL</div><div class="detail-value">${tree.upl || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Quartiere</div><div class="detail-value">${tree.quartiere || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Circoscrizione</div><div class="detail-value">${tree.circoscrizione || '-'}</div></div>
            </div>
        </div>

        <div class="detail-item" style="grid-column: 1/-1; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%); border-left: 4px solid #27ae60; border-radius: 6px;">
            <div class="detail-label" style="margin-bottom: 10px;"><i class="fa-solid fa-seedling"></i> BENEFICI AMBIENTALI (all'anno)</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #4caf50;">
                    <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px;">Assorbimento CO₂ annuale:</div>
                    <div style="font-size: 18px; font-weight: 700; color: #27ae60;">${co2Absorption} kg/anno</div>
                </div>
                <div style="padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #2196f3;">
                    <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px;">Produzione O₂ annuale:</div>
                    <div style="font-size: 18px; font-weight: 700; color: #1976d2;">${o2Production} kg/anno</div>
                </div>
            </div>
            <div style="font-size: 10px; color: #888; margin-top: 8px; font-style: italic;">
                Calcolati in base a: specie botanica, dimensioni, stato di salute
            </div>
        </div>

        <div class="detail-item" style="grid-column: 1/-1; margin-top: 10px;">
            <button class="pdf-button" onclick="generateTreePDF()" style="width: 100%; background: #27ae60; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"><i class="fa fa-download" aria-hidden="true"></i> Scarica PDF</button>
        </div>
    `;
}
