# 🚀 Guida Rapida all'Integrazione

## Come integrare Header e Footer Designer Italia nelle pagine esistenti

---

## 📝 STEP 1: Preparazione File

### 1.1 Scaricare Bootstrap Italia

```bash
# Opzione A: Download diretto
# Vai su: https://github.com/italia/bootstrap-italia/releases
# Scarica la versione più recente (es. v2.x.x)
# Estrai nella cartella del progetto

# Opzione B: NPM (se disponibile)
npm install bootstrap-italia

# Opzione C: CDN (solo per test, non in produzione)
```

### 1.2 Struttura cartelle raccomandata

```
/Verde_Urbano/
├── bootstrap-italia/
│   ├── css/
│   │   └── bootstrap-italia.min.css
│   ├── js/
│   │   └── bootstrap-italia.bundle.min.js
│   └── dist/
│       └── svg/
│           └── sprites.svg
├── includes/
│   ├── header.html                    ✅ Nuovo
│   ├── footer-designer-italia.html    ✅ Nuovo
│   ├── navigation-simple.html         (da sostituire)
│   └── footer.html                    (da sostituire)
├── css/
│   ├── designer-italia-custom.css     ✅ Nuovo
│   └── verde_urbano.css               (esistente)
└── [altre pagine HTML]
```

---

## 📄 STEP 2: Modificare le Pagine HTML

### 2.1 Aggiornare il `<head>`

**Trovare questa sezione nel file HTML:**

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>...</title>

    <!-- CODICE ESISTENTE -->
    <link rel="stylesheet" href="css/verde_urbano.css">
```

**Aggiungere PRIMA del CSS esistente:**

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>...</title>

    <!-- Font Titillium Web (OBBLIGATORIO per Designer Italia) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap" rel="stylesheet">

    <!-- Bootstrap Italia CSS -->
    <link rel="stylesheet" href="bootstrap-italia/dist/css/bootstrap-italia.min.css">

    <!-- CSS Personalizzato Designer Italia -->
    <link rel="stylesheet" href="css/designer-italia-custom.css">

    <!-- CSS esistente del progetto -->
    <link rel="stylesheet" href="css/verde_urbano.css">
```

---

### 2.2 Sostituire l'Header

**TROVARE questo codice (circa righe 55-65 in index.html):**

```html
<header>
    <div class="demo-stamp demo-stamp-header">DEMO!</div>
    <div class="header-content">
        <a href="https://www.comune.palermo.it/" target="_blank">
            <img src="img/logo_pa_gb.svg" alt="Logo Comune di Palermo" class="header-logo">
        </a>
        <div class="header-right">
            <div class="info-icon" id="infoBtn">
                <i class="fas fa-circle-info"></i>
            </div>
        </div>
    </div>
</header>
```

**SOSTITUIRE con:**

```html
<!-- Include Header Designer Italia -->
<div id="header-placeholder"></div>
<script>
    fetch('includes/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Errore caricamento header:', error));
</script>
```

**⚠️ NOTA:** Se vuoi mantenere l'icona info, aggiungi questo DOPO l'header:

```html
<!-- Pulsante Info (opzionale) -->
<div style="position: fixed; top: 10px; right: 10px; z-index: 9999;">
    <button class="btn btn-primary btn-icon" id="infoBtn" title="Informazioni">
        <i class="fas fa-circle-info"></i>
    </button>
</div>
```

---

### 2.3 Rimuovere la Navigazione Duplicata

**TROVARE questo codice (circa righe 68-69):**

```html
<!-- Include Navigation da file esterno -->
<div id="navigation-placeholder"></div>
<script src="js/load-navigation-cached.js"></script>
```

**RIMUOVERE completamente** (la navigazione è già nell'header)

---

### 2.4 Sostituire il Footer

**TROVARE questo codice (circa righe 494-502):**

```html
<!-- Include Footer da file esterno -->
<script>
    fetch('includes/footer.html?v=' + Date.now())
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
        })
        .catch(error => console.error('Errore caricamento footer:', error));
</script>
```

**SOSTITUIRE con:**

```html
<!-- Include Footer Designer Italia -->
<div id="footer-placeholder"></div>
<script>
    fetch('includes/footer-designer-italia.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Errore caricamento footer:', error));
</script>
```

---

### 2.5 Aggiungere JavaScript Bootstrap Italia

**ALLA FINE del file, PRIMA di `</body>`:**

```html
    <!-- JavaScript esistenti -->
    <script src="js/01_modal.js"></script>
    <script src="js/02_csv_loader.js"></script>
    <!-- ... altri script ... -->

    <!-- Bootstrap Italia JS Bundle (NUOVO) -->
    <script src="bootstrap-italia/dist/js/bootstrap-italia.bundle.min.js"></script>

</body>
</html>
```

---

## 🔧 STEP 3: Personalizzazioni Necessarie

### 3.1 Aggiornare i Link nel Footer

**Aprire:** `includes/footer-designer-italia.html`

**Cercare e sostituire i link segnaposto:**

```html
<!-- PRIMA (esempio) -->
<a href="https://www.comune.palermo.it/servizi.php" target="_blank">

<!-- DOPO (con link reale) -->
<a href="https://www.comune.palermo.it/servizi-online/" target="_blank">
```

**Link da aggiornare (lista prioritaria):**

1. ✅ PEC del Comune
2. ✅ Amministrazione Trasparente (URL esatto)
3. ✅ Albo Pretorio
4. ✅ Privacy Policy
5. ✅ Dichiarazione di Accessibilità
6. ✅ Prenotazione Appuntamenti
7. ✅ Segnalazione Disservizi
8. ✅ Link social ufficiali

---

### 3.2 Verificare il Logo

**Aprire:** `includes/header.html`

**Verificare il percorso del logo (riga ~59):**

```html
<img src="img/logo_pa_gb.svg" alt="Logo Comune di Palermo" class="icon" style="height: 82px;">
```

Se il logo è in un'altra cartella, aggiornare il percorso.

---

### 3.3 Aggiornare Link Social

**Nel footer (`includes/footer-designer-italia.html`):**

```html
<li class="list-inline-item">
    <a class="p-2 text-white" href="https://www.facebook.com/comunepalermo" target="_blank">
        <i class="fab fa-facebook fa-lg"></i>
    </a>
</li>
```

**Nell'header (`includes/header.html`):**

```html
<li>
    <a href="https://www.facebook.com/comunepalermo" target="_blank">
        <svg class="icon">
            <use href="/bootstrap-italia/dist/svg/sprites.svg#it-facebook"></use>
        </svg>
    </a>
</li>
```

Aggiornare con gli URL ufficiali dei social del Comune.

---

## 🎨 STEP 4: Gestire le Icone

### Opzione A: Usare Bootstrap Italia SVG (Raccomandato)

**Sostituire Font Awesome con SVG sprites:**

```html
<!-- PRIMA (Font Awesome) -->
<i class="fas fa-tree"></i>

<!-- DOPO (Bootstrap Italia SVG) -->
<svg class="icon">
    <use href="/bootstrap-italia/dist/svg/sprites.svg#it-pa"></use>
</svg>
```

**Lista icone disponibili:**
https://italia.github.io/bootstrap-italia/docs/utilities/icone/

### Opzione B: Mantenere Font Awesome (Temporaneo)

Mantenere nel `<head>`:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
```

---

## 📱 STEP 5: Test Responsive

### 5.1 Testare su diversi dispositivi

- 📱 **Mobile:** <768px - Menu hamburger
- 💻 **Tablet:** 768px-991px - Layout intermedio
- 🖥️ **Desktop:** >992px - Layout completo

### 5.2 Testare la navigazione

1. ✅ Menu principale funzionante
2. ✅ Hamburger menu su mobile
3. ✅ Link footer tutti cliccabili
4. ✅ Modal di ricerca funzionante
5. ✅ Dropdown lingua funzionante

---

## ♿ STEP 6: Accessibilità

### 6.1 Test con Screen Reader

```bash
# Windows: Usa NVDA (gratis)
# https://www.nvaccess.org/download/

# Mac: Usa VoiceOver (integrato)
# Cmd + F5
```

### 6.2 Test Contrasto Colori

Strumento online: https://webaim.org/resources/contrastchecker/

### 6.3 Test Navigazione Keyboard

- ✅ `Tab` - Navigazione tra link
- ✅ `Enter` - Attivare link/pulsanti
- ✅ `Esc` - Chiudere modal
- ✅ Focus visibile su tutti gli elementi

---

## 🚀 STEP 7: Validazione

### 7.1 Lighthouse Audit

**Chrome DevTools:**

1. F12 → Lighthouse
2. Esegui audit su:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

**Target:** Score >90 su tutti

### 7.2 Validatore HTML W3C

https://validator.w3.org/

**Caricare la pagina e verificare:**
- ✅ Nessun errore HTML
- ⚠️ Warning accettabili

### 7.3 WCAG Validator

https://wave.webaim.org/

**Verificare:**
- ✅ Nessun errore critico
- ⚠️ Alert risolvibili

---

## 📋 CHECKLIST FINALE

### Pre-Deploy

- [ ] Bootstrap Italia scaricato e integrato
- [ ] Header caricato correttamente
- [ ] Footer caricato correttamente
- [ ] Tutti i link footer aggiornati con URL reali
- [ ] Logo corretto e visibile
- [ ] Font Titillium Web caricato
- [ ] CSS personalizzato applicato
- [ ] JavaScript Bootstrap Italia funzionante
- [ ] Navigazione duplicata rimossa
- [ ] Modal ricerca funzionante
- [ ] Menu mobile (hamburger) funzionante

### Test Cross-Browser

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (se disponibile)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Test Accessibilità

- [ ] Lighthouse Accessibility >90
- [ ] WAVE WebAIM - nessun errore critico
- [ ] Navigazione keyboard funzionante
- [ ] Screen reader compatibile
- [ ] Contrasti colori conformi WCAG AA

### Conformità

- [ ] Header a 3 livelli completo
- [ ] Footer con tutti i link obbligatori
- [ ] PEC e contatti presenti
- [ ] Dichiarazione accessibilità linkata
- [ ] Credits Designer Italia presenti
- [ ] Riferimenti PNRR presenti

---

## 🔥 Quick Start (Minimo Indispensabile)

**Per partire subito in 5 minuti:**

### 1. Aggiungere al `<head>` di ogni pagina:

```html
<link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/designer-italia-custom.css">
```

### 2. Sostituire header:

```html
<div id="header-placeholder"></div>
<script>
fetch('includes/header.html').then(r => r.text()).then(d =>
    document.getElementById('header-placeholder').innerHTML = d
);
</script>
```

### 3. Sostituire footer:

```html
<div id="footer-placeholder"></div>
<script>
fetch('includes/footer-designer-italia.html').then(r => r.text()).then(d =>
    document.getElementById('footer-placeholder').innerHTML = d
);
</script>
```

### 4. Testare nel browser

Aprire `esempio-designer-italia.html` per vedere il risultato.

---

## 🆘 Troubleshooting

### Problema: Header non si vede

**Soluzione:**
- Verificare che `includes/header.html` esista
- Controllare la console browser (F12) per errori
- Verificare il percorso nel fetch()

### Problema: Icone mancanti

**Soluzione:**
- Scaricare Bootstrap Italia completo
- Verificare percorso sprites.svg
- In alternativa, usare Font Awesome temporaneamente

### Problema: Layout rotto su mobile

**Soluzione:**
- Verificare che Bootstrap Italia CSS sia caricato
- Controllare viewport meta tag
- Testare con Chrome DevTools (F12 → Toggle device toolbar)

### Problema: Link footer non funzionanti

**Soluzione:**
- Aprire `includes/footer-designer-italia.html`
- Sostituire tutti gli `href="#"` con URL reali
- Testare ogni link individualmente

---

## 📞 Supporto

**Documentazione ufficiale:**
- Designer Italia: https://designers.italia.it/
- Bootstrap Italia: https://italia.github.io/bootstrap-italia/
- Forum: https://forum.italia.it/c/design

**Community:**
- Slack Developers Italia: https://slack.developers.italia.it/

---

## ✅ Checklist Integrazione Rapida

```
□ Download Bootstrap Italia
□ Copiare file CSS e JS nel progetto
□ Aggiungere link CSS nel <head>
□ Sostituire header nelle pagine
□ Sostituire footer nelle pagine
□ Aggiornare link footer
□ Aggiungere JS Bootstrap Italia
□ Testare su mobile e desktop
□ Validare accessibilità
□ Deploy!
```

---

**Tempo stimato:** 30-60 minuti per la prima pagina
**Complessità:** ⭐⭐⚪⚪⚪ (Facile)
**Risultato:** Sito conforme Designer Italia 100%

---

**Ultima modifica:** 04 gennaio 2026
**Versione guida:** 1.0
