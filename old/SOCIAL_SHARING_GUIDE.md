# Guida alla Condivisione Social con Stato Completo

## Panoramica

Il sistema di condivisione social implementato nella web app "Verde Urbano Palermo" permette di condividere link che preservano **completamente lo stato dell'applicazione** al momento della condivisione.

## Funzionalità

### 🗺️ Per la Dashboard (index.html)

Quando un utente condivide la mappa, il link include:

1. **Posizione Mappa**
   - Livello di zoom corrente
   - Coordinate del centro mappa (latitudine/longitudine)
   - Formato: `#zoom/lat/lng` (es: `#14/38.126600/13.347600`)

2. **Filtri Attivi**
   - Strada (odonimo)
   - Specie botanica
   - Stato salute albero (CPC)
   - Tipo dimora (sito impianto)
   - UPL (Unità Programmazione Lavori)
   - Quartiere
   - Circoscrizione
   - Fase lavorazione
   - Necessità pulizia foglie
   - Altezza minima
   - Diametro minimo

3. **Albero Selezionato**
   - Se un albero specifico è selezionato, l'ID viene incluso nel link
   - Al caricamento, l'albero viene automaticamente ri-selezionato

### 📄 Per le Pagine di Testo

Quando un utente condivide una pagina con paragrafi:

1. **Pagina Corrente**
   - URL della pagina specifica

2. **Paragrafo Visualizzato**
   - Anchor (#) al paragrafo specifico che l'utente stava leggendo
   - Es: `obiettivi.html#riqualificazione`

## Come Funziona

### Generazione URL

Quando l'utente clicca su un pulsante di condivisione, la funzione `generateShareableURL()` in `js/15_social_share.js`:

1. Cattura lo stato corrente dell'applicazione
2. Codifica i filtri come parametri URL query string
3. Aggiunge la posizione mappa come hash
4. Genera un URL completo condivisibile

**Esempio URL generato:**
```
https://palermohub.github.io/Verde_Urbano/index.html?odonimo=Viale%20Emilia&cpc=D&minHeight=5#14/38.147000/13.340000
```

Questo URL contiene:
- `odonimo=Viale%20Emilia` - Filtro per strada "Viale Emilia"
- `cpc=D` - Filtro per stato salute "Estremo"
- `minHeight=5` - Filtro per altezza minima 5 metri
- `#14/38.147000/13.340000` - Zoom 14, coordinate specifiche

### Ripristino Stato

Quando un utente apre un link condiviso, la funzione `restoreApplicationState()`:

1. Legge i parametri dall'URL
2. Imposta i valori nei filtri corrispondenti
3. Applica i filtri ai dati
4. Ripristina la posizione mappa (gestita automaticamente da Leaflet Hash)
5. Ri-seleziona l'albero se specificato

## Pulsanti di Condivisione

### Social Network Supportati

I pulsanti nel footer permettono di condividere su:

1. **WhatsApp** 📱
   - Apre WhatsApp con il link e titolo pre-compilato
   - Mobile-friendly

2. **Telegram** ✈️
   - Condivisione via Telegram
   - Include titolo e link

3. **Facebook** 👍
   - Utilizza Facebook Sharer
   - Mostra anteprima con Open Graph tags

4. **X (Twitter)** 🐦
   - Tweet pre-compilato con titolo e link
   - Limite caratteri rispettato

5. **Bluesky** ☁️
   - Composizione post su Bluesky
   - Include titolo e link

6. **Email** 📧
   - Apre client email con:
     - Subject: Titolo condivisione
     - Body: Descrizione + link

7. **Copia Link** 🔗
   - Copia l'URL negli appunti
   - Notifica visiva di conferma

## Posizionamento

I pulsanti sono posizionati nel **footer**, nella colonna "Seguici", **sotto l'immagine di Santa Rosalia**.

```
Footer
  └─ Colonna "Seguici"
      ├─ Social media del Comune (Facebook, Twitter, Instagram, etc.)
      ├─ Immagine Santa Rosalia
      └─ Pulsanti Condivisione ← NUOVA SEZIONE
          ├─ Titolo: "Condividi questa vista"
          ├─ Pulsanti social (7 pulsanti)
          └─ Info: "Il link include filtri, posizione mappa e selezioni attive"
```

## File Implementati

### JavaScript
- **`js/15_social_share.js`** (468 righe)
  - Funzioni di cattura stato
  - Funzioni di generazione URL
  - Funzioni di ripristino stato
  - Handler per ogni social network
  - Sistema di notifiche

### CSS
- **`css/social-share.css`** (306 righe)
  - Stili pulsanti
  - Colori brand per ogni social
  - Animazioni hover
  - Tooltip
  - Notifiche toast
  - Responsive design

### HTML
- **`includes/footer.html`** (modificato)
  - Aggiunta sezione condivisione
  - 7 pulsanti con icone Font Awesome
  - Testo informativo

## Integrazione nelle Pagine

Tutte le pagine HTML includono:

```html
<!-- Nel <head> -->
<link rel="stylesheet" href="css/social-share.css">

<!-- Prima del footer -->
<script src="js/15_social_share.js"></script>
```

### Pagine Aggiornate
✅ index.html
✅ il-progetto.html
✅ obiettivi.html
✅ fasi.html
✅ potatura.html
✅ radicali.html
✅ impianti.html
✅ sicurezza.html
✅ dati-economici.html
✅ tavole.html
✅ gruppo.html

## Caratteristiche Tecniche

### Gestione Stato URL

La web app utilizza due meccanismi complementari:

1. **Query Parameters** (`?key=value&key2=value2`)
   - Filtri applicati
   - Albero selezionato
   - Altri parametri applicativi

2. **Hash Fragment** (`#zoom/lat/lng`)
   - Posizione mappa gestita da **Leaflet Hash**
   - Automaticamente sincronizzato con la mappa
   - Supporta browser history (back/forward)

### Compatibilità Browser

Il sistema è compatibile con:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### API Clipboard

Per la funzionalità "Copia Link":
- Usa `navigator.clipboard.writeText()` (moderno)
- Fallback con `document.execCommand('copy')` per browser più vecchi
- Notifica visiva di successo/errore

## Meta Tags Social

Le pagine includono meta tags Open Graph e Twitter Card per anteprime ottimizzate:

```html
<!-- Open Graph -->
<meta property="og:url" content="...">
<meta property="og:type" content="website">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content=".../img/Social_Card.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content=".../img/Social_Card.jpg">
```

## Esempi d'Uso

### Scenario 1: Condivisione Vista Specifica della Mappa

**Azioni utente:**
1. Applica filtro: Strada = "Viale Emilia"
2. Applica filtro: CPC = "D" (Estremo)
3. Fa zoom sulla zona interessata (zoom 16)
4. Clicca su "Condividi su WhatsApp"

**Risultato:**
```
https://palermohub.github.io/Verde_Urbano/index.html?odonimo=Viale%20Emilia&cpc=D#16/38.147233/13.340567

👤 Messaggio WhatsApp:
Verde Urbano - Viale Emilia
https://palermohub.github.io/Verde_Urbano/index.html?odonimo=Viale%20Emilia&cpc=D#16/38.147233/13.340567
```

**Quando il destinatario apre il link:**
- La mappa si posiziona esattamente sulla stessa zona
- I filtri "Viale Emilia" e CPC "D" sono già applicati
- Vede esattamente la stessa vista dell'utente che ha condiviso

### Scenario 2: Condivisione Albero Specifico

**Azioni utente:**
1. Clicca su un albero nella mappa
2. Visualizza i dettagli dell'albero ID "PA-12345"
3. Clicca su "Condividi via Email"

**Risultato:**
```
Email To: [destinatario]
Subject: Verde Urbano - Albero #PA-12345 (Ficus retusa)

Body:
Albero #PA-12345 - Ficus retusa

Visualizza qui: https://palermohub.github.io/Verde_Urbano/index.html?treeId=PA-12345#14/38.126/13.347
```

### Scenario 3: Condivisione Paragrafo Specifico

**Azioni utente:**
1. Naviga su `obiettivi.html`
2. Scorre fino alla sezione "Sicurezza e Incolumità Pubblica"
3. Clicca su "Condividi su Twitter"

**Risultato:**
```
Tweet:
Obiettivi e Finalità - Verde Urbano Palermo
https://palermohub.github.io/Verde_Urbano/obiettivi.html#sicurezza
```

**Quando il destinatario apre il link:**
- La pagina si apre direttamente alla sezione "Sicurezza"
- La sidebar evidenzia la voce corretta
- Il browser scrolla automaticamente al paragrafo

## Personalizzazione

### Aggiungere Altri Social Network

Per aggiungere un nuovo social network:

1. **Aggiungi la funzione in `js/15_social_share.js`:**

```javascript
function shareOnNewSocial() {
    const url = generateShareableURL();
    const title = getShareTitle();
    const shareUrl = `https://newsocial.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}
```

2. **Aggiungi il pulsante in `includes/footer.html`:**

```html
<button onclick="shareOnNewSocial()" class="share-btn newsocial" title="Condividi su NewSocial">
    <i class="fab fa-newsocial"></i>
</button>
```

3. **Aggiungi gli stili in `css/social-share.css`:**

```css
.share-btn.newsocial {
    background: linear-gradient(135deg, #colorprimario 0%, #colorsecondario 100%);
}

.share-btn.newsocial:hover {
    background: linear-gradient(135deg, #colorsecondario 0%, #colorterziario 100%);
}
```

### Modificare i Filtri Condivisi

Per aggiungere/rimuovere filtri dalla condivisione, modifica l'oggetto `filterElements` in `js/15_social_share.js`:

```javascript
const filterElements = {
    odonimo: 'odonimoFilter',
    specie: 'specieFilter',
    // Aggiungi il tuo nuovo filtro qui
    nuovoFiltro: 'nuovoFiltroId',
    // ...
};
```

## Troubleshooting

### Il link non include i filtri

**Causa:** I filtri non sono applicati o gli ID degli elementi sono cambiati.

**Soluzione:** Verifica che gli ID in `filterElements` corrispondano agli ID effettivi nel DOM.

### La posizione mappa non viene ripristinata

**Causa:** Leaflet Hash non è caricato o la mappa non è inizializzata.

**Soluzione:** Verifica che `leaflet-hash.min.js` sia caricato prima di `05_map.js`.

### I pulsanti non funzionano

**Causa:** JavaScript non caricato o errori nella console.

**Soluzione:**
1. Apri DevTools (F12)
2. Vai alla tab Console
3. Verifica errori
4. Assicurati che `15_social_share.js` sia caricato

### Notifica "Copia link" non appare

**Causa:** CSS non caricato o conflitti di z-index.

**Soluzione:** Verifica che `social-share.css` sia caricato e che il CSS abbia `z-index: 10000` per `.copy-notification`.

## Best Practices

1. **Testa sempre i link generati** prima di condividerli pubblicamente
2. **Evita URL troppo lunghi** - limita il numero di filtri attivi
3. **Usa titoli descrittivi** - modificando `getShareTitle()` per contesti specifici
4. **Monitora le condivisioni** - usa Google Analytics per tracciare i link condivisi
5. **Mantieni i parametri URL retrocompatibili** - evita di rinominare i parametri esistenti

## Licenza

Questo sistema è parte del progetto "Verde Urbano Palermo" ed è rilasciato sotto licenza **CC BY-SA 4.0**.

---

**Sviluppato da:** Giovan Battista Vitrano con Claude AI (Anthropic)
**Data:** Gennaio 2026
**Versione:** 1.0
