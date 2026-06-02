# Analisi: Reskin LIPU → stile SegnalaOra

> Solo analisi e piano — nessun codice modificato.

---

## 1. Differenze visive chiave

### 1.1 Palette colori

| Token | LIPU (attuale) | SegnalaOra (target) |
|---|---|---|
| Background body | `#f8f8f5` (grigio freddo) | `#f5f0e8` (carta pergamena calda) |
| Colore primario | `#2D6A4F` verde bosco | `#d4820a` ambra dorata |
| Primario chiaro | `#40916C` | `#e8a030` |
| Testo principale | `#1a1a18` nero freddo | `#3d2f1e` bruno caldo |
| Bordi / mist | `#f2f2ee` | `#e8e2d6` (più caldo) |
| Accento secondario | `#E76F00` arancio | `#3d5a47` salvia scura |
| Topbar/header bg | verde `#2D6A4F` | bianco carta con bordo inferiore ambra |

### 1.2 Tipografia

| Elemento | LIPU | SegnalaOra |
|---|---|---|
| Font principale | Titillium Web | Titillium Web (identico) |
| Label sezioni | `Courier New` mono uppercase | Titillium Web regolare con icona FA |
| Border-radius componenti | 6px (compatto, istituzionale) | 12–20px (arrotondato, consumer) |
| Padding sezioni | denso, govdev-style | generoso con spazio bianco |

### 1.3 Struttura UI

| Componente | LIPU | SegnalaOra | Delta |
|---|---|---|---|
| Header | Topbar verde 62px con logo PA + testo multi-riga | Header compatto con logo-mark (icona) + amber border-bottom | **Refactor** |
| Login screen | Full-screen verde scuro, PIN pad | Non presente in Segnalazioni | **Mantenere funzionalità, reskinare** |
| Sidebar filtri | Header verde + select mono | Header ambra/caldo + select stilizzati warm | **Reskin** |
| Panel dettaglio | Header verde, sezioni mono uppercase | Card con sezioni icon + titolo warm | **Reskin** |
| Bottom nav mobile | Assente | Presente (5 voci) | **Da aggiungere** (HTML + CSS) |
| Dark mode | Assente | Toggle + `html.dark` class completo | **Da aggiungere** (CSS + JS) |
| Demo banner | `#fffbeb` / giallo | Ambra warm `rgba(212,130,10,0.1)` | **Reskin** |
| Leggenda mappa | Bordi grigi, dot colorati | Stesso pattern ma warm | **Reskin minore** |
| Stats sidebar | Verde header, mono labels | Card section warm con FA icon | **Reskin** |

---

## 2. Fattibilità

**Pienamente fattibile** senza modificare la logica JS.

Tutto il delta è in `css/lipu.css` + piccole aggiunte HTML:
- Nessun cambio a `js/lipu.js`
- Nessun cambio alla struttura HTML profonda
- Solo 2 aggiunte HTML: `<nav class="bottom-nav">` + pulsante dark mode nella topbar

---

## 3. Piano di lavoro

### Fase 1 — Token CSS (variabili)
```
--ink:         #3d2f1e    ← sostituisce --gray-900 #1a1a18
--paper:       #f5f0e8    ← sostituisce --gray-50  #f8f8f5
--amber:       #d4820a    ← sostituisce --green     #2D6A4F (come colore primario)
--amber-light: #e8a030
--sage:        #3d5a47    ← colore secondario (ex --green-light per accenti map)
--mist:        #e8e2d6    ← sostituisce --gray-100
--rust:        #c0392b    ← mantiene funzione di --red #C1121F
--shadow:      rgba(60,40,20,0.12)  ← shadow calda
--radius:      12px       ← da 6px (più arrotondato)
```
**Nota**: `--amber` LIPU (`#E76F00`) ha già il nome giusto ma colore sbagliato — sostituire il valore, non aggiungere variabile.

### Fase 2 — Login screen
- Background: da `var(--green)` → `var(--paper)` con texture o gradiente ambra
- Card PIN: da `rgba(255,255,255,.10)` su verde → card bianca su carta con ombra calda
- Testo: da bianco su verde → `var(--ink)` su carta
- PIN dots e pad: da verde → ambra

### Fase 3 — Header / Topbar
- Sostituire sfondo verde con `var(--paper)` o bianco
- Aggiungere `border-bottom: 2px solid var(--amber)` (firma SegnalaOra)
- Logo PA: rimane (necessario istituzionalmente)
- Testi topbar: da bianco → `var(--ink)`
- Pulsanti azioni: da `rgba(255,255,255,.12)` → stile `btn-theme` SegnalaOra (bordo sottile, hover ambra)
- **Aggiungere** pulsante dark mode (icona luna) come in SegnalaOra

### Fase 4 — Sidebar filtri
- `.sb-header`: da verde → ambra o carta con accent ambra
- `.sb-section-hdr`: da mono verde uppercase → aggiungere emoji/icona + stile warm
- `.fsel`: aggiornare stile al `.app-select` di SegnalaOra (bordo sottile, hover ambra)
- `.f-badge`: da verde pallido → ambra pallido

### Fase 5 — Stats sidebar
- `.ss-head`: da verde → header warm con border-bottom ambra
- Sezioni: da mono uppercase → icon + title warm
- Donut SVG: colori stati invariati (ok=verde, pending=arancio, stop=rosso — logica)

### Fase 6 — Panel dettaglio albero
- `.panel-header`: da verde → carta con titolo `var(--ink)` + accent ambra
- `.section-title`: da mono uppercase grigio → icon + titolo warm (come `.section-title` SegnalaOra)
- `.check-item`, `.esito-opt`: `border-radius` da 6px → 12px, palette warm
- `.btn-invia`: da verde → ambra (come `.send-btn` SegnalaOra)
- Campi input/textarea: border-radius 12px, bordi warm

### Fase 7 — Modali (schede, cerca, info)
- Stile card modale: border-radius 20px (come `.info-card` SegnalaOra)
- Header modale: accent ambra
- Input autocomplete: stile warm

### Fase 8 — Bottom nav mobile (HTML + CSS)
Aggiungere in `index.html` dopo `</div id="app">`:
```html
<nav class="bottom-nav">
  <button class="bnav-item" onclick="toggleSidebar()">
    <i class="fa-solid fa-sliders"></i><span>Filtri</span>
  </button>
  <button class="bnav-item" onclick="tbHome()">
    <i class="fa-solid fa-map-location-dot"></i><span>Mappa</span>
  </button>
  <button class="bnav-item" onclick="toggleStatsSidebar()">
    <i class="fa-solid fa-chart-simple"></i><span>Statistiche</span>
  </button>
  <button class="bnav-item" onclick="openSearchModal()">
    <i class="fa-solid fa-magnifying-glass"></i><span>Cerca</span>
  </button>
  <button class="bnav-item" onclick="openInfoModal()">
    <i class="fa-solid fa-circle-info"></i><span>Info</span>
  </button>
</nav>
```
CSS: replicare `.bottom-nav` / `.bnav-item` da SegnalaOra con palette warm.

### Fase 9 — Dark mode
- Aggiungere `js/theme.js` (copia da SegnalaOra, è standalone)
- Aggiungere pulsante toggle topbar
- Aggiungere blocco `html.dark` in `lipu.css` per tutti i componenti

---

## 4. Elementi invarianti (non toccare)

| Elemento | Motivo |
|---|---|
| Logo PA Palermo | Identità istituzionale obbligatoria |
| Colori stati ispezione (verde/arancio/rosso) | Semantica funzionale, non grafica |
| Logica PIN e autenticazione | JS invariato |
| Struttura HTML profonda | Nessuna ristrutturazione necessaria |
| MapLibre + PMTiles | Libreria mappa, indipendente dal tema |
| Font Titillium Web | Già condiviso tra le due app |

---

## 5. Stima effort

| Fase | Effort stimato |
|---|---|
| 1 — Token CSS | 30 min |
| 2 — Login | 45 min |
| 3 — Header | 30 min |
| 4 — Sidebar filtri | 30 min |
| 5 — Stats sidebar | 30 min |
| 6 — Panel dettaglio | 45 min |
| 7 — Modali | 30 min |
| 8 — Bottom nav | 45 min |
| 9 — Dark mode | 60 min |
| **Totale** | **~5–6 ore** |

Tutto il lavoro è in `css/lipu.css` + piccole modifiche in `index.html`.  
Nessun rischio regressione funzionale — solo CSS + HTML strutturale minimo.
