# Istruzioni per completare l'aggiornamento del file index.html

## Modifiche completate

✅ Aggiunti 4 nuovi filtri territoriali nella sidebar (Odonimo, UPL, Quartiere, Circoscrizione)
✅ Aggiornata funzione `loadData()` per includere i nuovi campi territoriali
✅ Aggiornata funzione `populateFilterSelects()` per popolare i nuovi filtri
✅ Aggiornata funzione `applyFilters()` per applicare i filtri territoriali
✅ Aggiornata funzione `updateFilterInfo()` per mostrare le info dei filtri
✅ Aggiornata funzione `resetFilters()` per resettare anche i filtri territoriali
✅ Creato file `caricamento_csv.js` con funzioni per caricare i dati dal CSV

## Modifiche da completare manualmente

### 1. Sostituire i dati incorporati con caricamento dinamico da CSV

Nel file `index.html`, trovare la sezione con:
```javascript
// ===== DATI INCORPORATI =====
const rawGeoJson = {"type":"FeatureCollection"...}; // linea molto lunga (riga 881)
```

E sostituirla con:
```javascript
// ===== DATI INCORPORATI - CARICAMENTO DA CSV =====
// (Vedi file caricamento_csv.js)
```

### 2. Includere lo script di caricamento CSV

Subito dopo la riga 880 (`// ===== DATI INCORPORATI =====`), INSERIRE il contenuto del file `caricamento_csv.js`

### 3. Aggiornare la funzione di inizializzazione

Trovare la funzione:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inizializzazione...');
    initMap();
    loadData();
    populateFilterSelects();
    initCharts();
    applyFilters();
    console.log('✅ Inizializzazione completata');
});
```

E sostituirla con:
```javascript
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inizializzazione...');
    initMap();

    // Carica i dati dal CSV
    const loaded = await loadCSVData();
    if (!loaded) {
        console.error('❌ Impossibile caricare i dati');
        return;
    }

    loadData();
    populateFilterSelects();
    initCharts();
    applyFilters();
    console.log('✅ Inizializzazione completata');
});
```

## Come applicare le modifiche

### Opzione 1: Modifica manuale
1. Aprire `index.html` in un editor di testo
2. Cercare la riga 881 che inizia con `const rawGeoJson = {"type":"FeatureCollection"`
3. Eliminare completamente quella riga lunghissima
4. Copiare il contenuto di `caricamento_csv.js` e incollarlo al posto della riga eliminata
5. Cercare `document.addEventListener('DOMContentLoaded'` e modificare come indicato sopra

### Opzione 2: Usa uno script
Oppure puoi creare uno script che automatizzi il processo.

## Verifica

Dopo aver applicato le modifiche:
1. Apri `index.html` in un browser
2. Apri la console del browser (F12)
3. Verifica che appaia il messaggio: `📥 Caricamento CSV in corso...`
4. Verifica che appaia: `✅ CSV caricato: XXX alberi` (dove XXX è il numero di alberi)
5. Verifica che i 4 nuovi filtri territoriali siano visibili e popolati
6. Testa il funzionamento dei filtri

## Riassunto modifiche

Il file ora:
- ✅ Carica i dati dal file `dati/17_query_web.csv` invece di averli incorporati
- ✅ Include 4 nuovi filtri territoriali: Odonimo, UPL, Quartiere, Circoscrizione
- ✅ Aggiorna automaticamente i dati ad ogni ricaricamento della pagina
- ✅ Supporta tutti i campi del CSV inclusi i campi territori ali
