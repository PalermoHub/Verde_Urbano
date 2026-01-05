# 🔍 Sistema di Ricerca Intelligente - Verde Urbano Palermo

## Panoramica

Il sistema di ricerca intelligente è un modulo completamente automatico che permette agli utenti di cercare informazioni all'interno di tutte le pagine della web app Verde Urbano Palermo.

## ✨ Caratteristiche Principali

### 🚀 Indicizzazione Automatica
- **Automatica al 100%**: Indicizza automaticamente tutte le pagine HTML del sito
- **Nessuna configurazione necessaria**: Nuove pagine vengono indicizzate automaticamente
- **Aggiornamento dinamico**: L'indice si aggiorna a ogni caricamento della pagina

### 🎯 Ricerca Intelligente
- **Ricerca in tempo reale**: I risultati appaiono mentre digiti
- **Autocompletamento**: Suggerimenti intelligenti per completare la parola
- **Ricerca fuzzy**: Trova risultati anche con parole parziali
- **Ordinamento per rilevanza**: I risultati più pertinenti appaiono per primi
- **Evidenziazione**: I termini cercati sono evidenziati nei risultati

### 📱 Mobile-First Design
- **Completamente responsive**: Ottimizzato per mobile, tablet e desktop
- **Touch-friendly**: Interfaccia ottimizzata per dispositivi touch
- **Performance**: Veloce anche su connessioni lente

### ⌨️ Accessibilità
- **Scorciatoie da tastiera**:
  - `Ctrl+K` / `Cmd+K` - Apri ricerca
  - `Esc` - Chiudi ricerca
  - `↑` `↓` - Naviga nei risultati
  - `Enter` - Apri risultato selezionato
- **Screen reader friendly**: Supporto completo per lettori di schermo
- **Focus visibile**: Indicatori chiari per la navigazione da tastiera

## 📂 Struttura dei File

```
Verde_Urbano/
├── js/
│   ├── search-engine.js      # Motore di ricerca e indicizzazione
│   └── search-ui.js           # Interfaccia utente
├── css/
│   └── search.css             # Stili responsive (mobile-first)
└── test-search.html           # Pagina di test
```

## 🔧 Come Funziona

### 1. Indicizzazione

Il motore di ricerca (`search-engine.js`) carica automaticamente tutte le pagine HTML:

```javascript
pages = [
    'index.html',
    'il-progetto.html',
    'obiettivi.html',
    'fasi.html',
    'potatura.html',
    'radicali.html',
    'impianti.html',
    'sicurezza.html',
    'dati-economici.html'
]
```

Per ogni pagina, estrae:
- Titoli (h1, h2, h3)
- Paragrafi
- Liste
- Sezioni con ID per link diretti

### 2. Ricerca

Quando l'utente digita:
1. Il testo viene normalizzato (rimozione accenti, lowercase)
2. Viene cercato nell'indice
3. I risultati vengono ordinati per rilevanza
4. Vengono mostrati con preview e link diretti

### 3. Autocompletamento

Il sistema suggerisce:
- Parole che iniziano con il testo digitato
- Titoli che contengono la query
- Termini popolari del progetto

## 🎨 Interfaccia Utente

### Pulsante di Ricerca
Posizionato nell'header accanto al pulsante informazioni:
- **Mobile**: Solo icona
- **Tablet**: Icona + testo "Cerca"
- **Desktop**: Icona + testo + scorciatoia "Ctrl+K"

### Modale di Ricerca
- **Mobile**: Schermo intero
- **Desktop**: Modale centrato (800px max)
- **Sezioni**:
  - Header con input di ricerca
  - Body con risultati scrollabili
  - Footer con suggerimenti

## 🔍 Cosa Viene Indicizzato

Per ogni pagina HTML:

| Elemento | Peso | Descrizione |
|----------|------|-------------|
| H1 | 10 | Titolo principale |
| H2 | 8 | Sottotitoli sezioni |
| H3 | 6 | Sottotitoli sottosezioni |
| Liste | 3 | Elementi di elenco |
| Paragrafi | 2 | Contenuto testuale |

## 🚀 Come Aggiungere Nuove Pagine

**Non serve fare nulla!**

1. Crea la tua nuova pagina HTML (es: `nuova-pagina.html`)
2. Aggiungi l'header standard con il pulsante di ricerca
3. Includi i file JS e CSS di ricerca:
   ```html
   <link rel="stylesheet" href="css/search.css">
   <script src="js/search-engine.js"></script>
   <script src="js/search-ui.js"></script>
   ```
4. Aggiungi il nome della pagina all'array in `search-engine.js`:
   ```javascript
   this.pages = [
       // ... pagine esistenti
       'nuova-pagina.html'  // <-- Aggiungi qui
   ];
   ```

La pagina verrà automaticamente indicizzata al prossimo caricamento!

## 🧪 Test

### Pagina di Test
Apri `test-search.html` nel browser per:
- Testare la ricerca
- Verificare l'indicizzazione
- Eseguire diagnostica automatica
- Vedere esempi di funzionamento

### Ricerche di Prova
Prova a cercare:
- `potatura` - Informazioni sulla potatura degli alberi
- `VTA` - Metodologia Visual Tree Assessment
- `radicali` - Gestione apparati radicali
- `sicurezza` - Misure di sicurezza del progetto
- `abbattimento` - Informazioni sugli abbattimenti
- `platani` - Specie arboree
- `mitigazione` - Misure ambientali

## 📱 Responsive Breakpoints

```css
/* Mobile-first: base styles per mobile */

@media (min-width: 768px) {
    /* Tablet */
    - Modale ridimensionato (700px)
    - Testo "Cerca" visibile
    - Font size aumentato
}

@media (min-width: 1024px) {
    /* Desktop */
    - Modale max 800px
    - Scorciatoia "Ctrl+K" visibile
    - Layout ottimizzato
}
```

## 🎯 Best Practices

### Per i Contenuti
1. **Usa titoli semantici** (h1, h2, h3) - vengono indicizzati con peso maggiore
2. **Aggiungi ID alle sezioni** - permette link diretti ai risultati
3. **Testi descrittivi** - aiutano la rilevanza della ricerca
4. **Struttura chiara** - facilita l'indicizzazione

### Per le Prestazioni
1. L'indicizzazione avviene **una sola volta** al caricamento
2. La ricerca è **istantanea** (client-side)
3. Nessuna chiamata al server durante la ricerca
4. Cache automatica per 15 minuti

## 🐛 Troubleshooting

### La ricerca non funziona
1. Controlla la console del browser (F12)
2. Verifica che i file JS siano caricati
3. Controlla che le pagine siano accessibili

### Pagina non indicizzata
1. Verifica che sia nell'array `this.pages` in `search-engine.js`
2. Controlla che il file esista e sia accessibile
3. Guarda la console per errori di caricamento

### Risultati non trovati
1. Prova con termini più semplici
2. Controlla che il contenuto sia nelle sezioni `.content-section`
3. Verifica la struttura HTML della pagina

## 🔮 Funzionalità Future (Opzionali)

- [ ] Ricerca per sinonimi (es: albero = pianta = arbusto)
- [ ] Filtri per tipo di pagina
- [ ] Cronologia ricerche
- [ ] Ricerche salvate/preferite
- [ ] Supporto per ricerca avanzata (AND, OR, NOT)
- [ ] Integrazione con dati CSV per cercare alberi specifici
- [ ] Export risultati in PDF

## 📝 Note Tecniche

### Compatibilità Browser
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dipendenze
- Font Awesome 6.4.0 (per icone)
- Nessuna libreria JavaScript esterna richiesta
- CSS puro (no framework)

### Sicurezza
- Nessun dato inviato a server esterni
- Tutto funziona client-side
- Nessun cookie utilizzato
- Privacy completa dell'utente

## 📄 Licenza

Parte del progetto Verde Urbano Palermo
