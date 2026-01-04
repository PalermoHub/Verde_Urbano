# Header e Footer secondo Designer Italia

Questo documento descrive l'implementazione di **Header** e **Footer** conformi alle linee guida di **Designer Italia** per i siti web dei Comuni italiani.

## 📋 Indice

- [Panoramica](#panoramica)
- [File Creati](#file-creati)
- [Struttura dell'Header](#struttura-dellheader)
- [Struttura del Footer](#struttura-del-footer)
- [Requisiti](#requisiti)
- [Installazione](#installazione)
- [Utilizzo](#utilizzo)
- [Personalizzazione](#personalizzazione)
- [Conformità Normativa](#conformità-normativa)
- [Risorse Utili](#risorse-utili)

---

## 🎯 Panoramica

Il progetto implementa header e footer secondo le **Linee Guida di Design per i Servizi Web della Pubblica Amministrazione** emesse da AgID (Agenzia per l'Italia Digitale) e sviluppate dal Team per la Trasformazione Digitale.

### Obiettivi

- ✅ Conformità alle linee guida **Designer Italia**
- ✅ Accessibilità **WCAG 2.1 livello AA**
- ✅ Design **responsive** per tutti i dispositivi
- ✅ Utilizzo di **Bootstrap Italia**
- ✅ Font ufficiale **Titillium Web**
- ✅ Requisiti PNRR per digitalizzazione PA

---

## 📁 File Creati

### Header
- **`includes/header.html`** - Header completo a tre livelli (Slim Header, Header Centrale, Header di Navigazione)

### Footer
- **`includes/footer-designer-italia.html`** - Footer conforme con tutte le sezioni obbligatorie

### CSS
- **`css/designer-italia-custom.css`** - Stili personalizzati conformi alle linee guida

### Documentazione
- **`esempio-designer-italia.html`** - Pagina di esempio con il nuovo header e footer
- **`README-DESIGNER-ITALIA.md`** - Questa documentazione

---

## 🎨 Struttura dell'Header

L'header è strutturato in **tre livelli** come richiesto dalle linee guida:

### 1️⃣ Slim Header (Intestazione Iniziale)

**Posizione:** Parte superiore della pagina
**Colore di sfondo:** Blu primario (#0066CC)
**Contenuto:**

- **Sinistra:** Collegamento all'ente di appartenenza (Regione Siciliana)
- **Destra:**
  - Selettore lingua (ITA/ENG)
  - Pulsante "Accedi all'area personale"

```html
<div class="it-header-slim-wrapper">
    <!-- Contenuto Slim Header -->
</div>
```

### 2️⃣ Header Centrale

**Contenuto:**

- **Logo** e **Nome dell'ente** (Comune di Palermo)
- **Tagline** dell'ufficio/area (Area delle Politiche Ambientali...)
- **Social network** (Facebook, Twitter, Instagram)
- **Pulsante di ricerca** (obbligatorio)

```html
<div class="it-header-center-wrapper">
    <!-- Contenuto Header Centrale -->
</div>
```

### 3️⃣ Header di Navigazione

**Contenuto:**

- Menu principale con le sezioni del sito
- Supporto per megamenu (se necessario)
- Responsive con hamburger menu su mobile

```html
<div class="it-nav-wrapper">
    <!-- Contenuto Navigazione -->
</div>
```

### 4️⃣ Banner Progetto

Banner personalizzato con:
- Titolo del progetto
- Link al CUP su OpenCUP
- Sfondo verde (tema ambientale)

---

## 📄 Struttura del Footer

Il footer include **tutte le informazioni obbligatorie** secondo la normativa:

### Sezione 1: Contatti

- Indirizzo completo dell'ente
- PEC (Posta Elettronica Certificata)
- Codice Fiscale e Partita IVA
- Numero di telefono
- Link all'URP

### Sezione 2: Amministrazione

**Link obbligatori:**

- ✅ Amministrazione Trasparente
- ✅ Albo Pretorio
- ✅ Informativa Privacy
- ✅ Note Legali
- ✅ Dichiarazione di Accessibilità
- ✅ Cookie Policy

### Sezione 3: Servizi al Cittadino

**Funzionalità richieste dalle linee guida:**

- 📅 Prenotazione Appuntamento
- 💬 Richiesta Assistenza
- ⚠️ Segnalazione Disservizio
- ❓ Domande Frequenti (FAQ)
- 🗺️ Mappa del Sito

### Sezione 4: Progetto Verde Urbano

Link specifici al progetto:
- Il Progetto
- Obiettivi e Finalità
- Dati Economici
- CUP OpenCUP
- Ufficio Verde Urbano

### Sezione 5: Social Network

Collegamenti ai canali ufficiali:
- Facebook
- Twitter
- Instagram
- YouTube

### Footer Small Prints

**Contenuto:**

- Link a Media Policy, Mappa del sito, Performance
- Riferimento al PNRR
- Credits (Designer Italia, Bootstrap Italia)
- Copyright

---

## 🔧 Requisiti

### Obbligatori

1. **Bootstrap Italia** (versione 2.x)
   - Download: https://github.com/italia/bootstrap-italia/releases
   - Include CSS, JS e sprite SVG

2. **Font Titillium Web**
   - Google Fonts: https://fonts.google.com/specimen/Titillium+Web
   - Pesi richiesti: 300, 400, 600, 700

3. **Icone**
   - Bootstrap Italia SVG Sprites (ufficiali)
   - In alternativa temporanea: Font Awesome 6.x

### Opzionali

- jQuery (se si usa Bootstrap Italia < 2.0)
- Popper.js (per dropdown e tooltip)

---

## 💻 Installazione

### Passo 1: Scaricare Bootstrap Italia

```bash
# Opzione 1: Download manuale
# Vai su https://github.com/italia/bootstrap-italia/releases
# Scarica l'ultima versione e estrai in /bootstrap-italia/

# Opzione 2: NPM
npm install bootstrap-italia

# Opzione 3: CDN (solo per sviluppo)
# Vedi documentazione ufficiale
```

### Passo 2: Copiare i file nel progetto

```
/Verde_Urbano/
├── includes/
│   ├── header.html                      ✅ Nuovo
│   ├── footer-designer-italia.html      ✅ Nuovo
│   ├── navigation-simple.html           (vecchio)
│   └── footer.html                      (vecchio)
├── css/
│   ├── designer-italia-custom.css       ✅ Nuovo
│   └── verde_urbano.css                 (esistente)
└── bootstrap-italia/
    ├── css/
    │   └── bootstrap-italia.min.css
    ├── js/
    │   └── bootstrap-italia.bundle.min.js
    └── dist/
        └── svg/
            └── sprites.svg               ⚠️ Importante per le icone
```

### Passo 3: Includere nel `<head>` delle pagine HTML

```html
<head>
    <!-- Font Titillium Web (obbligatorio) -->
    <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap" rel="stylesheet">

    <!-- Bootstrap Italia CSS -->
    <link rel="stylesheet" href="/bootstrap-italia/dist/css/bootstrap-italia.min.css">

    <!-- CSS Personalizzato -->
    <link rel="stylesheet" href="css/designer-italia-custom.css">
</head>
```

### Passo 4: Includere JavaScript prima di `</body>`

```html
<body>
    <!-- Contenuto -->

    <!-- Bootstrap Italia JS Bundle (include Popper) -->
    <script src="/bootstrap-italia/dist/js/bootstrap-italia.bundle.min.js"></script>
</body>
```

---

## 🚀 Utilizzo

### Includere Header e Footer via JavaScript

```html
<!-- Header -->
<div id="header-placeholder"></div>
<script>
    fetch('includes/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        });
</script>

<!-- Contenuto pagina -->
<main>
    <!-- ... -->
</main>

<!-- Footer -->
<div id="footer-placeholder"></div>
<script>
    fetch('includes/footer-designer-italia.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
</script>
```

### Testare la Pagina di Esempio

Apri nel browser:
```
esempio-designer-italia.html
```

---

## 🎨 Personalizzazione

### Colori

I colori principali sono definiti in `designer-italia-custom.css`:

```css
:root {
    --primary: #0066CC;        /* Blu primario PA */
    --primary-dark: #004C99;   /* Blu scuro */
    --success: #008055;        /* Verde */
    --danger: #CC334D;         /* Rosso */
    --warning: #F90;           /* Arancione */
}
```

**Nota:** Mantenere i colori conformi alle linee guida Designer Italia.

### Logo

Sostituire il logo in `includes/header.html`:

```html
<img src="img/logo_pa_gb.svg" alt="Logo Comune di Palermo">
```

### Link del Footer

Aggiornare tutti i link segnaposto (`#` o link generici) con quelli effettivi del Comune:

```html
<!-- Esempio da modificare -->
<a href="https://www.comune.palermo.it/servizi.php" target="_blank">
    Tutti i Servizi
</a>
```

### Menu di Navigazione

Modificare le voci del menu in `includes/header.html`:

```html
<ul class="navbar-nav">
    <li class="nav-item">
        <a class="nav-link" href="index.html">
            <span>Dashboard</span>
        </a>
    </li>
    <!-- Aggiungi/Modifica voci qui -->
</ul>
```

---

## ⚖️ Conformità Normativa

### Riferimenti Legislativi

- **CAD** (Codice dell'Amministrazione Digitale) - D.Lgs. 82/2005
- **Legge Stanca** - Legge 4/2004 sull'accessibilità
- **WCAG 2.1** - Web Content Accessibility Guidelines livello AA
- **PNRR** - Misura 1.4.1 per digitalizzazione PA

### Linee Guida AgID

Documenti di riferimento:

1. **Linee Guida di Design per i Servizi Web della PA**
   - https://docs.italia.it/italia/designers-italia/design-linee-guida-docs/

2. **Modello Comuni**
   - https://docs.italia.it/italia/designers-italia/design-comuni-docs/

3. **Bootstrap Italia**
   - https://italia.github.io/bootstrap-italia/

### Requisiti PNRR (Misura 1.4.1)

Per i comuni che accedono ai finanziamenti PNRR:

- ✅ Design conforme al modello Comuni
- ✅ Performance misurata con Lighthouse
- ✅ Piano di miglioramento nel footer (se performance negative)
- ✅ Dichiarazione di accessibilità obbligatoria

### Elementi Obbligatori nel Footer

Secondo la normativa vigente:

| Elemento | Normativa | Stato |
|----------|-----------|-------|
| Amministrazione Trasparente | D.Lgs. 33/2013 | ✅ |
| Privacy | GDPR (UE 679/2016) | ✅ |
| Note Legali | CAD | ✅ |
| Dichiarazione Accessibilità | Legge 4/2004 | ✅ |
| Prenotazione Appuntamento | Linee Guida Design | ✅ |
| Segnalazione Disservizio | Linee Guida Design | ✅ |
| PEC | CAD art. 54 | ✅ |

---

## 📚 Risorse Utili

### Documentazione Ufficiale

- **Designer Italia**
  https://designers.italia.it/

- **Linee Guida Design PA**
  https://docs.italia.it/italia/designers-italia/design-linee-guida-docs/

- **Modello Comuni**
  https://designers.italia.it/modelli/comuni/

- **Bootstrap Italia**
  https://italia.github.io/bootstrap-italia/

- **Bootstrap Italia GitHub**
  https://github.com/italia/bootstrap-italia

- **UI Kit Italia**
  https://github.com/italia/design-ui-kit

### Tool di Validazione

- **Validatore WCAG**
  https://wave.webaim.org/

- **Lighthouse** (performance e accessibilità)
  Integrato in Chrome DevTools

- **PAdigitale2026**
  https://padigitale2026.gov.it/

### Community e Supporto

- **Forum Designer Italia**
  https://forum.italia.it/c/design

- **Slack Developers Italia**
  https://slack.developers.italia.it/

---

## 📝 Checklist Implementazione

### Fase 1: Setup Iniziale
- [ ] Scaricare Bootstrap Italia
- [ ] Copiare file CSS, JS e SVG sprites nel progetto
- [ ] Includere font Titillium Web
- [ ] Testare caricamento risorse

### Fase 2: Header
- [ ] Integrare `includes/header.html`
- [ ] Aggiornare logo con quello ufficiale del Comune
- [ ] Verificare link Regione Siciliana
- [ ] Configurare ricerca (modal funzionante)
- [ ] Aggiornare link social con quelli ufficiali
- [ ] Testare menu responsive

### Fase 3: Footer
- [ ] Integrare `includes/footer-designer-italia.html`
- [ ] Aggiornare tutti i link con quelli effettivi
- [ ] Verificare PEC e contatti corretti
- [ ] Aggiungere link Dichiarazione Accessibilità
- [ ] Testare tutti i link esterni

### Fase 4: Test e Validazione
- [ ] Test responsive (mobile, tablet, desktop)
- [ ] Validazione accessibilità WCAG 2.1
- [ ] Test performance con Lighthouse (>90)
- [ ] Verifica conformità PAdigitale2026
- [ ] Cross-browser testing

### Fase 5: Deploy
- [ ] Commit su repository
- [ ] Deploy su ambiente di staging
- [ ] Review finale
- [ ] Deploy in produzione

---

## 🆘 Supporto

Per domande o problemi:

1. Consultare la [documentazione ufficiale](https://designers.italia.it/)
2. Aprire una issue su GitHub del progetto
3. Contattare il Team per la Trasformazione Digitale

---

## 📄 Licenza

Questo progetto utilizza:
- **Bootstrap Italia**: Licenza BSD-3-Clause
- **Font Titillium Web**: Licenza SIL Open Font License

---

## ✅ Conclusioni

L'implementazione di header e footer secondo Designer Italia garantisce:

- ✅ **Conformità normativa** alle linee guida AgID
- ✅ **Accessibilità** per tutti gli utenti (WCAG 2.1 AA)
- ✅ **Usabilità** migliorata con pattern standardizzati
- ✅ **Riconoscibilità** dei siti della PA italiana
- ✅ **Eligibilità** per finanziamenti PNRR (Misura 1.4.1)

---

**Versione documento:** 1.0
**Data:** 04 gennaio 2026
**Autore:** Giovan Battista Vitrano
**Progetto:** Rigenerazione del Verde Urbano - Comune di Palermo
