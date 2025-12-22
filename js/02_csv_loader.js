// ===== CARICAMENTO DATI DA CSV =====
let rawGeoJson = null;

// Funzione per parsare CSV
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        const row = {};
        headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
        });
        data.push(row);
    }
    return data;
}

// Funzione per caricare dati foglie stagionali
async function loadSeasonalLeavesData() {
    try {
        console.log('📥 Caricamento dati foglie stagionali...');

        let csvText;
        try {
            const response = await fetch('dati/16_tot_foglie.csv');
            if (!response.ok) throw new Error('Fetch fallito');
            csvText = await response.text();
        } catch (fetchError) {
            console.warn('⚠️ Fetch bloccato (CORS), uso XMLHttpRequest...');
            csvText = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'dati/16_tot_foglie.csv', true);
                xhr.onload = () => {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(`HTTP ${xhr.status}`));
                    }
                };
                xhr.onerror = () => reject(new Error('File non trovato'));
                xhr.send();
            });
        }

        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            console.warn('⚠️ File foglie vuoto o invalido');
            return false;
        }

        // Organizza i dati per via (salta la prima riga dell'header)
        const dataByStreet = {};
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length < 4) continue;

            const street = parts[0].trim();
            const season = parts[1].trim();
            const count = parseInt(parts[2]) || 0;
            const color = parts[3].trim();

            if (!street || !season) continue;

            if (!dataByStreet[street]) {
                dataByStreet[street] = {};
            }
            dataByStreet[street][season] = { count, color };
        }

        seasonalLeavesData = dataByStreet;
        console.log('✅ Dati foglie stagionali caricati:', Object.keys(dataByStreet).length, 'vie');
        return true;
    } catch (error) {
        console.error('❌ Errore caricamento dati foglie:', error);
        return false;
    }
}

// Funzione per caricare CSV e convertire in GeoJSON
async function loadCSVData() {
    try {
        console.log('📥 Caricamento CSV in corso...');

        // Prova prima con fetch, poi fallback a XMLHttpRequest
        let csvText;
        try {
            const response = await fetch('dati/17_query_web.csv');
            if (!response.ok) throw new Error('Fetch fallito');
            csvText = await response.text();
        } catch (fetchError) {
            console.warn('⚠️ Fetch bloccato (CORS), uso XMLHttpRequest...');
            // Fallback per file:// protocol
            csvText = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'dati/17_query_web.csv', true);
                xhr.onload = () => {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(`HTTP ${xhr.status}`));
                    }
                };
                xhr.onerror = () => reject(new Error('File non trovato'));
                xhr.send();
            });
        }

        const csvData = parseCSV(csvText);

        const features = [];
        csvData.forEach(row => {
            if (!row['Lat'] || !row['Log']) return;

            const lat = parseFloat(row['Lat']);
            const lon = parseFloat(row['Log']);

            if (isNaN(lat) || isNaN(lon)) return;

            features.push({
                type: 'Feature',
                properties: {
                    'ID Pianta': row['ID Pianta'],
                    'Specie': row['Specie'],
                    'Sito Impianto': row['Sito Impianto'],
                    'h (m)': row['h (m)'],
                    'Diametro (cm)': row['Diametro (cm)'],
                    'Dist. sede stradale (m)': row['Dist. sede stradale (m)'],
                    'Dist. marciapiede (m)': row['Dist. marciapiede (m)'],
                    'CPC': row['CPC'],
                    'Cod. lavorazione/elenco prezzi': row['Cod. lavorazione/elenco prezzi'],
                    'Note': row['Note'],
                    'Descrizione': row['Descrizione'],
                    'Prezzo Unitario': row['Prezzo Unitario'],
                    'Odonimo': row['Odonimo'],
                    'UPL': row['UPL'],
                    'Quartiere': row['Quartiere'],
                    'Circoscrizione': row['Circoscrizione'],
                    'tipo_foglia': row['tipo_foglia']
                },
                geometry: {
                    type: 'Point',
                    coordinates: [lon, lat]
                }
            });
        });

        rawGeoJson = {
            type: 'FeatureCollection',
            features: features
        };

        console.log(`✅ CSV caricato: ${features.length} alberi`);
        return true;
    } catch (error) {
        console.error('❌ Errore caricamento CSV:', error);
        alert('Errore nel caricamento dei dati. Verifica che il file dati/17_query_web.csv esista.');
        return false;
    }
}
