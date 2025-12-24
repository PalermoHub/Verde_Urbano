// ===== DETTAGLI ALBERO =====
function showTreeDetails(tree) {
    selectedTree = tree;  // SALVA L'ALBERO SELEZIONATO

    // Calcola i valori ambientali
    const o2Production = calculateO2Production(tree);
    const co2Absorption = calculateCO2Absorption(tree);
    const workingCost = getWorkingCost(tree);

    // Mostra la modale
    const modal = document.getElementById('treeDetailsModal');
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    // Aggiorna il grafico delle foglie per mostrare solo questo albero
    updateSeasonalLeavesChartForSingleTree(tree);

    const info = document.getElementById('selectedTreeInfo');
    info.innerHTML = `
        <div class="detail-item"><div class="detail-label">ID</div><div class="detail-value">${tree.id}</div></div>
        <div class="detail-item"><div class="detail-label">Specie arborea</div><div class="detail-value">${tree.specie}</div></div>
        <div class="detail-item"><div class="detail-label">Dimora</div><div class="detail-value">${tree.sito}</div></div>
        <div class="detail-item"><div class="detail-label">Altezza (m)</div><div class="detail-value">${tree.altezza || 'n/a'}</div></div>
        <div class="detail-item"><div class="detail-label">Diametro (cm)</div><div class="detail-value">${tree.diametro || 'n/a'}</div></div>
        <div class="detail-item"><div class="detail-label">classe propensione cedimento - CPC</div><div class="detail-value" style="color: ${cpcColors[tree.cpc]}">${tree.cpc}</div></div>
        <div class="detail-item" style="grid-column: 1/-1;"><div class="detail-label">Descrizione CPC</div><div class="detail-value">${tree.descrizione_cpc}</div></div>

        <div class="detail-item" style="grid-column: 1/-1; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #e3f2fd 0%, #f1f8ff 100%); border-left: 4px solid #3498db; border-radius: 6px;">
            <div class="detail-label" style="margin-bottom: 10px;"><i class="fa fa-map-marker-alt"></i> LOCALIZZAZIONE TERRITORIALE</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Strada (Odonimo)</div><div class="detail-value">${tree.odonimo || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">UPL</div><div class="detail-value">${tree.upl || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Quartiere</div><div class="detail-value">${tree.quartiere || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Circoscrizione</div><div class="detail-value">${tree.circoscrizione || '-'}</div></div>
            </div>
        </div>

        <div class="detail-item" style="grid-column: 1/-1; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-left: 4px solid #ff9800; border-radius: 6px;">
            <div class="detail-label" style="margin-bottom: 10px; font-size: 14px; font-weight: 700; color: #e65100;">
                <i class="fas fa-scissors"></i> FASE 1: Potatura o Abbattimento
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 10px; line-height: 1.5; font-style: italic;">
                La prima fase comprende le operazioni di potatura ordinaria e straordinaria, oppure l'abbattimento dell'esemplare arboreo quando le sue condizioni fitopatologiche, strutturali o di sicurezza lo rendono necessario.
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Cod. Lavorazione</div><div class="detail-value">${tree.codice || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Data Lavori</div><div class="detail-value">${tree.data_lav_f1 || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Prezzo unitario</div><div class="detail-value">${formatCurrency(tree.prezzo)}</div></div>
                <div class="detail-item" style="margin: 0; grid-column: 1/-1;"><div class="detail-label">Tipo di lavorazione</div><div class="detail-value" style="font-size: 12px;">${tree.descrizione || '-'}</div></div>
            </div>
        </div>

        ${tree.cod_lav_f2 || tree.lavori_f2 || tree.prezzo_f2 || tree.data_lav_f2 ? `
        <div class="detail-item" style="grid-column: 1/-1; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%); border-left: 4px solid #e91e63; border-radius: 6px;">
            <div class="detail-label" style="margin-bottom: 10px; font-size: 14px; font-weight: 700; color: #880e4f;">
                <i class="fas fa-tree"></i> FASE 2: Rimozione del ceppo
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 10px; line-height: 1.5; font-style: italic;">
                In caso di abbattimento, la seconda fase consiste nella rimozione del ceppo e della relativa apparato radicale, inclusa l'asportazione dei materiali di risulta verso le aree di deposito temporaneo o i centri di smaltimento autorizzati.
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Cod. Lavorazione</div><div class="detail-value">${tree.cod_lav_f2 || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Data Lavori</div><div class="detail-value">${tree.data_lav_f2 || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Prezzo</div><div class="detail-value">${tree.prezzo_f2 ? formatCurrency(tree.prezzo_f2) : '-'}</div></div>
                <div class="detail-item" style="margin: 0; grid-column: 1/-1;"><div class="detail-label">Lavori</div><div class="detail-value" style="font-size: 12px;">${tree.lavori_f2 || '-'}</div></div>
            </div>
        </div>
        ` : ''}

        ${tree.cod_lav_f3 || tree.lavori_f3 || tree.prezzo_f3 || tree.data_lav_f3 ? `
        <div class="detail-item" style="grid-column: 1/-1; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-left: 4px solid #4caf50; border-radius: 6px;">
            <div class="detail-label" style="margin-bottom: 10px; font-size: 14px; font-weight: 700; color: #1b5e20;">
                <i class="fas fa-seedling"></i> FASE 3: Fornitura e messa a dimora di nuova pianta
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 10px; line-height: 1.5; font-style: italic;">
                La terza fase riguarda l'approvvigionamento di esemplari arborei e/o arbustivi conformi alle specifiche tecniche del progetto, seguita dalle operazioni di messa a dimora con realizzazione della buca di impianto a profondità e dimensioni adeguate alla zolla, nonché dalla sistemazione del terreno circostante.
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Cod. Lavorazione</div><div class="detail-value">${tree.cod_lav_f3 || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Data Lavori</div><div class="detail-value">${tree.data_lav_f3 || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Prezzo</div><div class="detail-value">${tree.prezzo_f3 ? formatCurrency(tree.prezzo_f3) : '-'}</div></div>
                <div class="detail-item" style="margin: 0; grid-column: 1/-1;"><div class="detail-label">Lavori</div><div class="detail-value" style="font-size: 12px;">${tree.lavori_f3 || '-'}</div></div>
            </div>
        </div>
        ` : ''}

        ${tree.cod_lav_f4 || tree.lavori_f4 || tree.prezzo_f4 || tree.data_lav_f4 ? `
        <div class="detail-item" style="grid-column: 1/-1; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); border-left: 4px solid #fbc02d; border-radius: 6px;">
            <div class="detail-label" style="margin-bottom: 10px; font-size: 14px; font-weight: 700; color: #f57f17;">
                <i class="fas fa-ruler-vertical"></i> FASE 4: Fornitura e posizionamento di pali tutori
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 10px; line-height: 1.5; font-style: italic;">
                La quarta e ultima fase prevede la fornitura di pali tutori in legno e la loro installazione secondo le migliori pratiche agronomiche, al fine di garantire la stabilità della pianta durante il periodo di attecchimento e il suo corretto sviluppo vegetativo.
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Cod. Lavorazione</div><div class="detail-value">${tree.cod_lav_f4 || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Data Lavori</div><div class="detail-value">${tree.data_lav_f4 || '-'}</div></div>
                <div class="detail-item" style="margin: 0;"><div class="detail-label">Prezzo</div><div class="detail-value">${tree.prezzo_f4 ? formatCurrency(tree.prezzo_f4) : '-'}</div></div>
                <div class="detail-item" style="margin: 0; grid-column: 1/-1;"><div class="detail-label">Lavori</div><div class="detail-value" style="font-size: 12px;">${tree.lavori_f4 || '-'}</div></div>
            </div>
        </div>
        ` : ''}

        <div class="detail-item" style="grid-column: 1/-1; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%); border-left: 4px solid #ffa726; border-radius: 6px;">
            <div class="detail-label" style="margin-bottom: 10px;"><i class="fas fa-leaf"></i> NUMERO DI FOGLIE PER STAGIONE</div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px;">
                <div style="padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #8bc34a; text-align: center;">
                    <div style="font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
                        <i class="fas fa-seedling"></i> Primavera
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #8bc34a;">${tree.foglie_primavera.toLocaleString()}</div>
                </div>
                <div style="padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #fdd835; text-align: center;">
                    <div style="font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
                        <i class="fas fa-sun"></i> Estate
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #f9a825;">${tree.foglie_estate.toLocaleString()}</div>
                </div>
                <div style="padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #ff9800; text-align: center;">
                    <div style="font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
                        <i class="fas fa-leaf"></i> Autunno
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #ff9800;">${tree.foglie_autunno.toLocaleString()}</div>
                </div>
                <div style="padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #90a4ae; text-align: center;">
                    <div style="font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
                        <i class="fas fa-snowflake"></i> Inverno
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #607d8b;">${tree.foglie_inverno.toLocaleString()}</div>
                </div>
            </div>
            ${(() => {
                const foglieValues = [tree.foglie_primavera, tree.foglie_estate, tree.foglie_autunno, tree.foglie_inverno];
                const maxFoglie = Math.max(...foglieValues);
                const minFoglie = Math.min(...foglieValues);
                const differenza = maxFoglie - minFoglie;
                const percentuale = maxFoglie > 0 ? ((differenza / maxFoglie) * 100).toFixed(1) : 0;

                return `
                <div style="padding: 10px; background: #fff3e0; border-radius: 4px; border: 1px dashed #ff9800;">
                    <div style="font-size: 11px; color: #e65100; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">
                        <i class="fas fa-broom"></i> INDICATORE PULIZIA STAGIONALE
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 12px;">
                        <div>
                            <span style="color: #666;">Max:</span> <strong style="color: #4caf50;">${maxFoglie.toLocaleString()}</strong>
                        </div>
                        <div>
                            <span style="color: #666;">Min:</span> <strong style="color: #607d8b;">${minFoglie.toLocaleString()}</strong>
                        </div>
                        <div>
                            <span style="color: #666;">Diff:</span> <strong style="color: #ff9800;">${differenza.toLocaleString()}</strong> <span style="font-size: 10px; color: #666;">(${percentuale}%)</span>
                        </div>
                    </div>
                    <div style="font-size: 10px; color: #666; margin-top: 6px; font-style: italic;">
                        ${differenza > maxFoglie * 0.3
                            ? '<i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i> Variazione significativa: pianificare pulizie intensive in autunno-inverno'
                            : '<i class="fas fa-check-circle" style="color: #4caf50;"></i> Variazione moderata: manutenzione ordinaria sufficiente'}
                    </div>
                </div>
                `;
            })()}
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

// Funzione per chiudere la modale dei dettagli albero
function closeTreeDetails() {
    const modal = document.getElementById('treeDetailsModal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');

    // Ripristina il grafico delle foglie alla visualizzazione normale
    updateSeasonalLeavesChart();
}

// Chiudi la modale quando si clicca fuori dall'area del contenuto
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('treeDetailsModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeTreeDetails();
            }
        });
    }
});

// Chiudi la modale con il tasto ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('treeDetailsModal');
        if (modal && modal.classList.contains('active')) {
            closeTreeDetails();
        }
    }
});
