# 🧪 Come Testare la Condivisione Social

## Quick Start

### 1. Test Locale

Apri il file di test nel browser:
```
file:///D:/GitHub - Clone/SiciliaHub/Verde_Urbano/test-social-share.html
```

Oppure avvia un server locale:
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server

# Con PHP
php -S localhost:8000
```

Poi apri: `http://localhost:8000/test-social-share.html`

### 2. Test sulla Dashboard Reale

1. Apri `index.html` nel browser
2. Applica alcuni filtri (es: seleziona una strada, imposta CPC = D)
3. Fai zoom sulla mappa
4. Scorri fino al footer
5. Clicca su uno dei pulsanti di condivisione
6. Verifica che l'URL generato contenga i parametri

### 3. Test di Condivisione Completa

#### Test WhatsApp
1. Applica filtri: Odonimo = "Viale Emilia", CPC = "D"
2. Zoom sulla mappa (es: zoom 16)
3. Clicca su pulsante WhatsApp
4. Verifica l'URL nel messaggio WhatsApp
5. Copia l'URL e aprilo in una nuova finestra
6. **Risultato atteso:** La mappa si posiziona su Viale Emilia con filtro CPC = D applicato

#### Test Copia Link
1. Applica filtri a piacere
2. Clicca sul pulsante "Copia link" (icona catena)
3. **Risultato atteso:** Appare notifica "Link copiato negli appunti!"
4. Incolla l'URL in una nuova tab
5. **Risultato atteso:** Lo stato viene ripristinato

#### Test Albero Selezionato
1. Clicca su un albero nella mappa
2. Verifica che appaia il banner "ID: XXX - Specie"
3. Clicca su "Condividi via Email"
4. **Risultato atteso:** L'URL contiene `?treeId=XXX`
5. Apri l'URL in una nuova tab
6. **Risultato atteso:** L'albero viene automaticamente ri-selezionato

#### Test Pagina con Paragrafi
1. Vai su `obiettivi.html`
2. Scrolla fino a "Sicurezza e Incolumità Pubblica"
3. Clicca su "Condividi su Twitter"
4. **Risultato atteso:** URL termina con `#sicurezza`
5. Apri l'URL in una nuova tab
6. **Risultato atteso:** La pagina scrolla automaticamente alla sezione

## Checklist Test Completa

### ✅ Visibilità e Stile
- [ ] I pulsanti sono visibili nel footer
- [ ] I pulsanti sono sotto l'immagine di Santa Rosalia
- [ ] I colori dei pulsanti corrispondono ai brand social
- [ ] Gli hover effects funzionano (sollevamento + cambio colore)
- [ ] I tooltip appaiono al passaggio del mouse
- [ ] Il testo "Il link include filtri..." è visibile

### ✅ Funzionalità Base
- [ ] Ogni pulsante apre la finestra/app corretta
- [ ] Il pulsante "Copia link" mostra la notifica
- [ ] La notifica scompare dopo 3 secondi
- [ ] I link includono il dominio corretto

### ✅ Cattura Stato Mappa
- [ ] L'URL include il livello di zoom (#numero/...)
- [ ] L'URL include le coordinate corrette (#.../lat/lng)
- [ ] La posizione cambia quando si sposta la mappa
- [ ] La posizione cambia quando si fa zoom

### ✅ Cattura Filtri
- [ ] Il filtro "Odonimo" viene incluso nell'URL (?odonimo=...)
- [ ] Il filtro "Specie" viene incluso nell'URL
- [ ] Il filtro "CPC" viene incluso nell'URL
- [ ] Il filtro "Altezza minima" viene incluso (se > 0)
- [ ] Il filtro "Diametro minimo" viene incluso (se > 0)
- [ ] Altri filtri applicati vengono inclusi

### ✅ Ripristino Stato
- [ ] Aprendo un link con filtri, questi vengono applicati
- [ ] La mappa si posiziona correttamente
- [ ] Gli alberi vengono filtrati correttamente
- [ ] I grafici si aggiornano con i dati filtrati
- [ ] Il banner con i filtri attivi si aggiorna

### ✅ Albero Selezionato
- [ ] Selezionando un albero, l'URL include `?treeId=...`
- [ ] Aprendo un link con treeId, l'albero viene ri-selezionato
- [ ] Il banner "ID: XXX - Specie" appare
- [ ] La mappa centra sull'albero selezionato

### ✅ Pagine di Testo
- [ ] L'URL include l'anchor (#paragrafo)
- [ ] Aprendo il link, la pagina scrolla al paragrafo
- [ ] La sidebar evidenzia la voce corretta
- [ ] Il paragrafo è visibile senza ulteriore scroll

### ✅ Cross-Browser
- [ ] Funziona su Chrome/Edge
- [ ] Funziona su Firefox
- [ ] Funziona su Safari (se disponibile)
- [ ] Funziona su mobile (smartphone)

### ✅ Social Network
- [ ] WhatsApp si apre con testo pre-compilato
- [ ] Telegram si apre con link e titolo
- [ ] Facebook mostra l'anteprima (Open Graph)
- [ ] Twitter compone il tweet correttamente
- [ ] Bluesky si apre con il testo
- [ ] Email apre il client con subject e body
- [ ] Il link copiato funziona se incollato

## Test Avanzati

### Test Parametri Multipli
```
?odonimo=Viale%20Emilia&cpc=D&minHeight=5&minDiameter=30#16/38.147/13.340
```
**Verifica:** Tutti i parametri vengono ripristinati correttamente.

### Test Caratteri Speciali
```
?odonimo=Piazza%20Sant'Anna
```
**Verifica:** I caratteri speciali (apostrofi, spazi) sono gestiti correttamente.

### Test URL Lunghi
Applica 10+ filtri e verifica che l'URL funzioni ancora.

### Test Bookmark
1. Genera un URL con filtri
2. Salvalo nei preferiti del browser
3. Riapri il bookmark dopo un giorno
**Verifica:** Lo stato viene ripristinato correttamente.

## Debugging

### Console Browser (F12)

Controlla la console per eventuali errori:

```javascript
// Test manuale della funzione
console.log(generateShareableURL());

// Verifica stato
console.log(getApplicationState());

// Test ripristino
restoreApplicationState();
```

### Network Tab

Verifica che i file siano caricati:
- ✅ `js/15_social_share.js` (Status 200)
- ✅ `css/social-share.css` (Status 200)
- ✅ `includes/footer.html` (Status 200)

### Common Issues

**Problema:** I pulsanti non appaiono
- **Causa:** CSS non caricato
- **Soluzione:** Verifica il path `css/social-share.css`

**Problema:** Cliccando non succede nulla
- **Causa:** JS non caricato o errori
- **Soluzione:** Controlla console (F12) per errori

**Problema:** URL non include filtri
- **Causa:** Gli ID degli elementi non corrispondono
- **Soluzione:** Verifica che `odonimoFilter`, `cpcFilter`, etc. esistano nel DOM

**Problema:** La posizione mappa non viene ripristinata
- **Causa:** Leaflet Hash non funziona
- **Soluzione:** Verifica che `leaflet-hash.min.js` sia caricato

## Report Issues

Se trovi problemi:

1. Apri la console browser (F12)
2. Copia eventuali errori
3. Annota i passi per riprodurre il problema
4. Segnala con screenshot se possibile

## Performance

### Metriche da Monitorare

- Tempo generazione URL: < 100ms
- Tempo ripristino stato: < 500ms
- Dimensione URL: < 2000 caratteri (limite browser)

### Test Stress

1. Applica 15+ filtri simultaneamente
2. Seleziona un albero
3. Genera URL
**Verifica:** L'applicazione rimane responsiva.

---

**Documento creato:** Gennaio 2026
**Versione:** 1.0
