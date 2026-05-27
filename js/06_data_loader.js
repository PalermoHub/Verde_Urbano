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
                civico: props['Civico'] || '-',
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
                progetto: props['Progetto'] || '-',
                ordinativo: props['Ordinativo'] || '-',
                geouri: props['geouri'] || '',
                lat: coords[1],
                lon: coords[0]
            };
            allTrees.push(tree);
        });

        // === DEMO ONLY === Inietta date fittizie F1/F2/F3 per attivare il time-slider
        // Rimuovi questo blocco quando il CSV avrà date reali.
        injectDemoDates(allTrees);
        filteredTrees = [...allTrees];
        window.VU_DEBUG && console.log(`✅ Caricati ${allTrees.length} alberi (date fittizie iniettate per demo)`);
    } catch (error) {
        console.error('❌ Errore caricamento:', error);
    }
}


// ===== DEMO ONLY: genera date fittizie F1/F2/F3 distribuite su 24 mesi =====
function injectDemoDates(trees) {
    if (!trees || !trees.length) return;
    // Solo se le date sono effettivamente vuote (preserva dati reali)
    const sample = trees.slice(0, 100).some(t => t.data_lav_f1);
    if (sample) {
        window.VU_DEBUG && console.log('Date reali presenti, salto iniezione demo');
        return;
    }
    const baseStart = new Date(2024, 0, 15).getTime();  // 15 gen 2024
    const baseEnd   = new Date(2026, 4, 1).getTime();   // 1 mag 2026
    const span = baseEnd - baseStart;
    function fmt(ts) {
        const d = new Date(ts);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return dd + '/' + mm + '/' + d.getFullYear();
    }
    // Deterministic pseudo-random based on tree id for reproducibility
    function hash(s) {
        let h = 2166136261;
        s = String(s);
        for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
        return h;
    }
    let injected = 0;
    trees.forEach(tree => {
        const h = hash(tree.id);
        // ~80% degli alberi hanno F1
        const hasF1 = (h % 100) < 80;
        if (!hasF1) return;
        const f1Start = baseStart + ((h % 1000) / 1000) * (span * 0.6);  // F1 nei primi 60% del periodo
        tree.data_lav_f1 = fmt(f1Start);
        // ~35% degli F1 ha anche F2 (rimozione ceppo)
        if (((h >>> 8) % 100) < 35) {
            const f2Date = f1Start + (5 + ((h >>> 4) % 60)) * 86400000; // 5-65 giorni dopo F1
            tree.data_lav_f2 = fmt(Math.min(f2Date, baseEnd));
        }
        // ~25% degli F1 ha anche F3 (nuovo impianto)
        if (((h >>> 16) % 100) < 25) {
            const f3Date = f1Start + (40 + ((h >>> 10) % 180)) * 86400000; // 40-220 giorni dopo F1
            tree.data_lav_f3 = fmt(Math.min(f3Date, baseEnd));
        }
        injected++;
    });
    window.VU_DEBUG && console.log('[demo] iniettate date su ' + injected + '/' + trees.length + ' alberi');
}