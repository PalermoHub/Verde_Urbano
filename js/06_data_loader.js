// ===== CARICAMENTO DATI =====
function loadData() {
    try {
        // Verifica che rawGeoJson sia stato caricato
        if (!rawGeoJson || !rawGeoJson.features) {
            console.error('❌ rawGeoJson non disponibile');
            return;
        }

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
                descrizione_cpc: props['descrizione cpc'] || '-',
                tipo_foglia: props['tipo_foglia'] || '-',
                foglie_primavera: parseInt(props['# Primavera']) || 0,
                foglie_estate: parseInt(props['# Estate']) || 0,
                foglie_autunno: parseInt(props['# Autunno']) || 0,
                foglie_inverno: parseInt(props['# Inverno']) || 0,
                odonimo: props['Odonimo'] || '-',
                upl: props['UPL'] || '-',
                quartiere: props['Quartiere'] || '-',
                circoscrizione: props['Circoscrizione'] || '-',
                data_lav_f1: props['Data lav. F1'] || '',
                cod_lav_f2: props['Cod. lavorazione - F2'] || '',
                lavori_f2: props['Lavori - F2'] || '',
                prezzo_f2: (() => {
                    const p = props['Prezzo F2'];
                    if (!p) return 0;
                    if (typeof p === 'string') {
                        return parseFloat(p.replace('€', '').replace(',', '.')) || 0;
                    }
                    return parseFloat(p) || 0;
                })(),
                data_lav_f2: props['Data lav. F2'] || '',
                cod_lav_f3: props['Cod. lavorazione - F3'] || '',
                lavori_f3: props['Lavori - F3'] || '',
                prezzo_f3: (() => {
                    const p = props['Prezzo F3'];
                    if (!p) return 0;
                    if (typeof p === 'string') {
                        return parseFloat(p.replace('€', '').replace(',', '.')) || 0;
                    }
                    return parseFloat(p) || 0;
                })(),
                data_lav_f3: props['Data lav. F3'] || '',
                cod_lav_f4: props['Cod. lavorazione - F4'] || '',
                lavori_f4: props['Lavori - F4'] || '',
                prezzo_f4: (() => {
                    const p = props['Prezzo F4'];
                    if (!p) return 0;
                    if (typeof p === 'string') {
                        return parseFloat(p.replace('€', '').replace(',', '.')) || 0;
                    }
                    return parseFloat(p) || 0;
                })(),
                data_lav_f4: props['Data lav. F4'] || '',
                geouri: props['geouri'] || '',
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
