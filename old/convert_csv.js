const fs = require('fs');
const path = require('path');

// Leggi il file CSV
const csvPath = path.join(__dirname, 'dati', '17_query_web.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n');
const headers = lines[0].split(',');
const features = [];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV con gestione delle virgole dentro le celle
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            values.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    values.push(currentValue);

    // Crea oggetto riga
    const row = {};
    headers.forEach((header, idx) => {
        row[header.trim()] = values[idx] ? values[idx].trim() : '';
    });

    // Salta righe senza coordinate
    if (!row['Lat'] || !row['Log']) continue;

    const lat = parseFloat(row['Lat']);
    const lon = parseFloat(row['Log']);

    if (isNaN(lat) || isNaN(lon)) continue;

    // Crea feature GeoJSON
    const feature = {
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
    };

    features.push(feature);
}

// Crea GeoJSON
const geojson = {
    type: 'FeatureCollection',
    features: features
};

// Salva come stringa compatta per l'inclusione in HTML
const geojsonString = JSON.stringify(geojson);

// Salva anche come file separato
fs.writeFileSync('verde_urbano_geojson.json', JSON.stringify(geojson, null, 2));

console.log(`✅ Conversione completata! ${features.length} alberi convertiti.`);
console.log('File salvato: verde_urbano_geojson.json');
console.log(`\nPer incorporare nel file HTML, usa:\nconst rawGeoJson = ${geojsonString.substring(0, 100)}...`);
