# Soluzione Problema Caricamento Dati CSV

## Problema Identificato

La webapp non caricava i dati degli alberi sulla mappa e le statistiche rimanevano vuote.

## Causa Principale

Il problema era causato da **elementi DOM mancanti** che generavano errori JavaScript bloccando l'esecuzione del codice:

1. **Elemento `<h2 id="pageTitle">` mancante** - La funzione `updatePageTitle()` in `js/07_filters.js` tentava di accedere a questo elemento senza verificare se esistesse
2. **Header CSV inconsistenti** - Il file CSV aveva spazi extra e campi vuoti nell'header

## Errori Rilevati

### 1. Header CSV (dati/17_query_web.csv)
**Prima:**
```csv
Circoscrizione,,,tipo_foglia,# Primavera, # Estate,# Autunno,# Inverno
```
- 3 virgole consecutive dopo Circoscrizione (campi vuoti)
- Spazio dopo "# Primavera" ma non dopo altri campi
- Spazio dopo "# Estate" non consistente

**Dopo:**
```csv
Circoscrizione,tipo_foglia,# Primavera,# Estate,# Autunno,# Inverno
```

### 2. Header CSV foglie stagionali (dati/16_tot_foglie.csv)
**Prima:**
```csv
Odonimo,stagioni,,colore
```

**Dopo:**
```csv
Odonimo,stagioni,count,colore
```

### 3. Codice JavaScript non Robusto

**File:** `js/07_filters.js:217`
```javascript
// PRIMA (causava errore)
function updatePageTitle(odonimo) {
    const titleElement = document.getElementById('pageTitle');
    titleElement.innerHTML = ...; // ❌ Errore se titleElement è null
}

// DOPO (robusto)
function updatePageTitle(odonimo) {
    const titleElement = document.getElementById('pageTitle');
    if (!titleElement) {
        console.warn('⚠️ Elemento pageTitle non trovato');
        return;
    }
    titleElement.innerHTML = ...;
}
```

## Modifiche Implementate

### File Modificati

1. **dati/17_query_web.csv** - Header normalizzato
2. **dati/16_tot_foglie.csv** - Header corretto
3. **js/02_csv_loader.js** - Parser CSV migliorato
   - Gestione corretta header vuoti
   - Mappatura indici header-valori
   - Cache busting per forzare ricaricamento
   - Logging dettagliato
4. **js/06_data_loader.js** - Controllo null su rawGeoJson
5. **js/07_filters.js** - Controlli null su elementi DOM
6. **js/04_init.js** - Logging dettagliato fasi inizializzazione

### Dettaglio Miglioramenti Parser CSV

**Problema:** Quando si rimuovevano header vuoti con `.filter()`, gli indici non corrispondevano più ai valori.

**Soluzione:** Creazione di una mappa header-indice
```javascript
const rawHeaders = lines[0].split(',').map(h => h.trim());
const headerMap = [];
rawHeaders.forEach((header, idx) => {
    if (header !== '') {
        headerMap.push({ name: header, index: idx });
    }
});

// Poi durante il parsing:
const row = {};
headerMap.forEach(header => {
    row[header.name] = values[header.index] || '';
});
```

### Cache Busting

Aggiunto timestamp ai caricamenti CSV per evitare problemi di cache:
```javascript
const cacheBuster = '?t=' + new Date().getTime();
fetch('dati/17_query_web.csv' + cacheBuster);
```

### Funzioni Helper per Sicurezza DOM

Aggiunte funzioni helper in `updateFilterInfo()`:
```javascript
const safeGetElement = (id) => document.getElementById(id);
const safeGetValue = (id) => {
    const elem = safeGetElement(id);
    return elem ? elem.value : '';
};
const safeSetText = (id, text) => {
    const elem = safeGetElement(id);
    if (elem) elem.textContent = text;
};
```

## Testing

### File di Test Creati

1. **test_csv_loading.html** - Test completo caricamento con visualizzazione proprietà
2. **test_simple.html** - Test semplificato del flusso di caricamento
3. **debug_headers.html** - Debug analisi header CSV

### Come Testare

1. Apri `test_csv_loading.html` nel browser
2. Verifica che mostri:
   - ✅ CSV caricato: 258 alberi
   - ✅ Dati foglie stagionali caricati
   - ✅ Tutti i campi critici presenti (Lat, Log, # Primavera, ecc.)

## Risultato

✅ **258 alberi** vengono caricati correttamente
✅ **Mappa** mostra tutti i marker
✅ **Statistiche** calcolate e visualizzate
✅ **Grafici** popolati con dati
✅ **Filtri** funzionanti

## Lezioni Apprese

1. **Sempre validare elementi DOM prima dell'accesso** - Usare controlli `if (!element) return;`
2. **Header CSV devono essere consistenti** - No spazi extra, no campi vuoti
3. **Parser CSV devono gestire edge cases** - Campi vuoti, virgolette, encoding
4. **Cache browser può causare problemi** - Usare cache busting in sviluppo
5. **Logging dettagliato aiuta il debugging** - Aggiungere console.log strategici

## Manutenzione Futura

- Verificare che `<h2 id="pageTitle">` sia presente in tutte le pagine HTML
- Controllare header CSV prima di caricarli nel repository
- Testare con file `test_csv_loading.html` dopo modifiche ai CSV
- Mantenere i controlli null su tutti gli accessi DOM critici
