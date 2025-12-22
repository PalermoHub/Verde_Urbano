// ===== CARICAMENTO DATI =====
function loadData() {
    try {
        rawGeoJson.features.forEach(feature => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;

            const tree = {
                id: props['ID Pianta'],
                specie: props['Specie'] || '-',
                sito: props['Sito Impianto'] || '-',
                altezza: (() => {
                    const h = props['h (m)'];
                    if (!h || h === 'n/a') return null;
                    if (typeof h === 'string' && h.includes('-')) {
                        const val = parseFloat(h.split('-')[0]);
                        return isNaN(val) ? null : val;
                    }
                    const val = parseFloat(h);
                    return isNaN(val) ? null : val;
                })(),
                diametro: parseFloat(props['Diametro (cm)']) || null,
                cpc: props['CPC'] || '-',
                distStrada: parseFloat(props['Dist. sede stradale (m)']) || null,
                distMarciapiede: props['Dist. marciapiede (m)'] || 'n/a',
                codice: props['Cod. lavorazione/elenco prezzi'] || '-',
                prezzo: (() => {
                    const p = props['Prezzo Unitario'];
                    if (!p) return 0;
                    if (typeof p === 'string') {
                        return parseFloat(p.replace('€', '').replace(',', '.')) || 0;
                    }
                    return parseFloat(p) || 0;
                })(),
                descrizione: props['Descrizione'] || '-',
                descrizione_ccp: props['descrizione ccp'] || '-',
                odonimo: props['Odonimo'] || '-',
                upl: props['UPL'] || '-',
                quartiere: props['Quartiere'] || '-',
                circoscrizione: props['Circoscrizione'] || '-',
                lat: coords[1],
                lon: coords[0]
            };
            allTrees.push(tree);
        });

        filteredTrees = [...allTrees];
        console.log(`✅ Caricati ${allTrees.length} alberi`);
    } catch (error) {
        console.error('❌ Errore caricamento:', error);
    }
}
