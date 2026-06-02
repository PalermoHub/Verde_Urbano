# Piano: Reskin LIPU → stile SegnalaOra

**Obiettivo**: trasformare graficamente la webapp LIPU adottando il linguaggio visivo caldo/consumer di SegnalaOra, senza toccare `js/lipu.js` né la struttura funzionale.

**File coinvolti**: `css/lipu.css` (principale) · `index.html` (2 aggiunte HTML) · `js/theme.js` (nuovo, copia da SegnalaOra)

---

## F1 — Token CSS e variabili root

**File**: `css/lipu.css`

Sostituire il blocco `:root { }` con la nuova palette:

| Token da sostituire | Valore attuale | Nuovo valore |
|---|---|---|
| `--green` | `#2D6A4F` | eliminare — rimpiazzato da `--amber` |
| `--green-light` | `#40916C` | eliminare — rimpiazzato da `--amber-light` |
| `--green-xpale` | `#F0FFF4` | eliminare — rimpiazzato da `--amber-pale` |
| `--amber` | `#E76F00` | `#d4820a` |
| `--gray-900` | `#1a1a18` | `#3d2f1e` (bruno caldo → diventa `--ink`) |
| `--gray-50` | `#f8f8f5` | `#f5f0e8` (pergamena calda → diventa `--paper`) |
| `--gray-100` | `#f2f2ee` | `#e8e2d6` (diventa `--mist`) |
| `--red` | `#C1121F` | `#c0392b` (invariato in pratica) |
| `--radius` | `6px` | `12px` |
| `--shadow` | `rgba(0,0,0,.10)` | `rgba(60,40,20,0.12)` |

Aggiungere nuovi token:
```css
--ink:         #3d2f1e;
--paper:       #f5f0e8;
--amber-light: #e8a030;
--amber-pale:  #fef3e2;
--sage:        #3d5a47;
--mist:        #e8e2d6;
```

Tutti i riferimenti `var(--green)` nel CSS → `var(--amber)`.  
Tutti i riferimenti `var(--green-light)` → `var(--sage)` o `var(--amber-light)` (vedere contesto).  
`var(--gray-50)` → `var(--paper)` · `var(--gray-900)` → `var(--ink)` · `var(--gray-100)` → `var(--mist)`.

> **Nota**: i colori semantici degli stati ispezione (verde `#40916C`, arancio `#E76F00`, rosso `#C1121F`) nelle legend item e donut rimangono invariati — sono informativi, non decorativi.

---

## F2 — Login screen

**File**: `css/lipu.css` — selettori `#login-screen`, `.pin-wrap`, `.pin-btn`, `.pin-dot`

- `#login-screen`: background da `var(--green)` → `var(--paper)`; aggiungere accent line ambra (`border-top: 4px solid var(--amber)` su `.pin-wrap`)
- `.login-institution`, `.login-dept`, ecc.: colore da `rgba(255,255,255,*)` → `var(--ink)` con opacità ridotta via `color: rgba(61,47,30,0.55)`
- `.pin-wrap`: da `rgba(255,255,255,.10)` su verde → `background: #fff; box-shadow: 0 8px 32px rgba(60,40,20,0.14); border: 1px solid var(--mist)`
- `.pin-btn`: da `rgba(255,255,255,.12)` → `background: var(--paper); border: 1.5px solid var(--mist); color: var(--ink)`; hover → `border-color: var(--amber); background: var(--amber-pale)`
- `.pin-dot.filled`: da `background:#fff` → `background: var(--amber)`
- `.pin-error`: da `#ffb3b3` → `#c0392b`
- `#demo-hint`: da `rgba(255,255,255,.10)` → `background: var(--amber-pale); border-color: var(--amber)`; testi da bianco → ink

---

## F3 — Topbar / Header

**File**: `css/lipu.css` — selettori `.topbar`, `.topbar-*`, `.logout-btn`, `.stats-toggle-btn`

- `.topbar`: `background: var(--green)` → `background: #fff; border-bottom: 2px solid var(--amber)`
- `.topbar-dept`, `.topbar-proj`, `.topbar-mob-name`, `.topbar-mob-sub`: colori da `#fff` / `rgba(255,255,255,*)` → `var(--ink)` con opacità scalata
- `.topbar-badge-demo`: aggiornare a palette ambra
- `.logout-btn`: da `rgba(255,255,255,.12)` su verde → `border: 1.5px solid var(--mist); background: none; color: var(--ink)`; hover → `border-color: var(--amber); color: var(--amber)`
- `.stats-toggle-btn`: stessa logica del logout-btn; `.active` → `background: var(--amber); color: #fff; border-color: var(--amber)`
- `#demo-banner`: da `#fffbeb / #92670a` → `background: rgba(212,130,10,0.1); color: #a06008; border-top-color: rgba(212,130,10,0.3)`

**HTML** `index.html`: aggiungere pulsante dark mode tra `.topbar-user` e il primo `.stats-toggle-btn`:
```html
<button class="btn-theme" id="themeToggle" onclick="toggleTheme()" title="Tema scuro">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
</button>
```

---

## F4 — Sidebar filtri

**File**: `css/lipu.css` — selettori `.sb-header`, `.sb-body`, `.sb-section-hdr`, `.fsel`, `.f-badge`, `.fi-box`

- `.sb-header`: `background: var(--green)` → `background: #fff; border-bottom: 2px solid var(--amber)`; `.sb-ttl` da bianco → `var(--ink)`; `.sb-icon` stroke da `rgba(255,255,255,.75)` → `var(--amber)`
- `.sb-switch-thumb`: `background: var(--green)` → `background: var(--amber)`
- `.sb-section-hdr`: `color: var(--green)` → `color: var(--amber); border-bottom-color: var(--mist)`
- `.fsel`: `border-color` hover/focus da `var(--green-light)` → `var(--amber)`; aggiungere `border-radius: 8px`
- `.f-badge`: `background: var(--green-xpale); border-color: #a0cfb4; color: var(--green)` → `background: var(--amber-pale); border-color: rgba(212,130,10,0.35); color: var(--amber)`
- `.f-badge button`: `color: var(--green)` → `color: var(--amber)`
- `.fi-reset`: hover `border-color` e `color` da `var(--red)` → ok invariato

---

## F5 — Stats sidebar

**File**: `css/lipu.css` — selettori `.ss-head`, `.ss-section-hdr`, `.ss-hero`, `.ss-mini-card`

- `.ss-head`: `background` da verde → `background: #fff; border-bottom: 2px solid var(--amber)`; testi da `rgba(255,255,255,*)` → `var(--ink)` scalati
- `.ss-head-ttl`: bianco → `var(--ink)`
- `.ss-switch` (toggle chiudi): thumb `background: var(--green)` → `var(--amber)`
- `.ss-section-hdr`: `color: var(--green)` → `color: var(--amber); border-bottom-color: var(--mist)`
- `.ss-hero-val`: colore da verde (se presente) → `var(--ink)`
- `.ss-via-row` svg stroke: da verde → `var(--amber)`
- `.donut-center-val` text fill: aggiornare a `var(--ink)`
- Striscia rank bar: `background: var(--green-light)` → `background: var(--amber)`

---

## F6 — Panel dettaglio albero

**File**: `css/lipu.css` — selettori `.panel-header`, `.section-title`, `.check-item`, `.esito-opt`, `.btn-invia`, `input`, `textarea`

- `.panel-header`: `background: var(--green)` → `background: #fff; border-bottom: 2px solid var(--amber)`; `.panel-doc` da `rgba(255,255,255,.55)` → `var(--amber)`; `.panel-tree-name` da `#fff` → `var(--ink)`; `.panel-tree-via` da `rgba(255,255,255,.65)` → `rgba(61,47,30,0.55)`
- `.panel-close` switch thumb: `background: var(--green)` → `var(--amber)`
- `.section-title`: `color: var(--gray-500)` → `color: var(--amber); border-bottom-color: var(--mist); font-family: var(--font); font-size: 11px; letter-spacing: .04em; text-transform: none; font-weight: 600`
- `.check-item`: `border-radius: var(--radius)` — eredita già il nuovo `12px`; stato `.no → border-color: var(--sage)`; `.check-item.no .check-box` → `background: var(--sage)`
- `.esito-opt.selected-neg`: `border-color: var(--sage); background: rgba(61,90,71,0.08)` 
- `.btn-invia`: `background: var(--green)` → `background: var(--amber); border-radius: 12px`; hover → `background: var(--amber-light)`
- `input`, `textarea`, `.firma-input`: aggiungere `border-radius: 10px; border-color: var(--mist)`; focus `border-color: var(--amber)`
- `#p-pdf-link` (link PDF): aggiornare colori da verde → ambra

---

## F7 — Modali

**File**: `css/lipu.css` — selettori `.ms-dialog`, `.mc-dialog`, `.mi-dialog`, `.disc-dialog`

Per tutte le dialog:
- `border-radius`: portare a `20px` (da `var(--radius)`)
- Header dialog: `background: #fff; border-bottom: 2px solid var(--amber)`; titoli → `var(--ink)`; close button switch thumb → `var(--amber)`

Per `.mc-inp` (search autocomplete):
- `border-radius: 10px; border-color: var(--mist)`; focus → `border-color: var(--amber); outline: none`

Per `.ms-close`, `.mc-close`, `.mi-close`:
- switch thumb `background: var(--green)` → `var(--amber)`

Per `.disc-ok-btn`:
- `background: var(--green)` → `var(--amber)`

---

## F8 — Bottom nav mobile

**File**: `index.html` — inserire prima di `</body>`  
**File**: `css/lipu.css` — aggiungere stili

**HTML** (prima di `<script src="https://unpkg.com/maplibre-gl..."`):
```html
<nav class="bottom-nav" id="bottom-nav">
  <button class="bnav-item" id="bnav-filtri" onclick="toggleSidebar()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
    <span>Filtri</span>
  </button>
  <button class="bnav-item" id="bnav-mappa" onclick="tbHome()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    <span>Mappa</span>
  </button>
  <button class="bnav-item" id="bnav-stats" onclick="toggleStatsSidebar()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 18V11M12 18V6M17 18V14"/></svg>
    <span>Statistiche</span>
  </button>
  <button class="bnav-item" id="bnav-cerca" onclick="openSearchModal()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <span>Cerca</span>
  </button>
  <button class="bnav-item" id="bnav-info" onclick="openInfoModal()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
    <span>Info</span>
  </button>
</nav>
```

**CSS** da aggiungere in `lipu.css`:
```css
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  background: #fff;
  border-top: 1.5px solid var(--mist);
  z-index: 1200;
  justify-content: space-around;
  align-items: center;
  padding: 0 4px;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4px 16px rgba(60,40,20,0.08);
}
.bnav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9a8f80;
  font-family: var(--font);
  font-size: 9px;
  font-weight: 500;
  padding: 6px 0;
  transition: color 0.18s;
}
.bnav-item:hover, .bnav-item.bnav-active { color: var(--amber); }
.bnav-item svg { flex-shrink: 0; }

@media (max-width: 768px) {
  .bottom-nav { display: flex; }
  body { padding-bottom: 60px; }
  #app { padding-bottom: 60px; }
}
```

---

## F9 — Dark mode

**File**: `js/theme.js` (nuovo) — copiare verbatim da `gbvitrano/Segnalazioni/js/theme.js`  
**File**: `index.html` — aggiungere `<script src="js/theme.js"></script>` nel `<head>` (prima di altri script)  
**File**: `css/lipu.css` — aggiungere in fondo il blocco `html.dark { ... }`

Variabili dark da definire:
```css
html.dark {
  --ink:    rgba(245,240,232,0.92);
  --paper:  #1a1410;
  --mist:   rgba(255,255,255,0.08);
  --shadow: rgba(0,0,0,0.35);
}
html.dark body          { background: #1a1410; color: var(--ink); }
html.dark .topbar       { background: #1a1410; border-bottom-color: var(--amber); }
html.dark #sidebar      { background: #1f1a14; border-right-color: rgba(255,255,255,0.07); }
html.dark .sb-header    { background: #1f1a14; border-bottom-color: var(--amber); }
html.dark #stats-sidebar{ background: #1f1a14; }
html.dark .ss-head      { background: #1f1a14; }
html.dark #panel        { background: #1f1a14; border-left-color: rgba(255,255,255,0.07); }
html.dark .panel-header { background: #1f1a14; border-bottom-color: var(--amber); }
html.dark .field-val    { background: #15110d; border-color: rgba(255,255,255,0.08); }
html.dark .fsel,
html.dark .mc-inp,
html.dark .note-area,
html.dark .firma-input  { background: #15110d; border-color: rgba(255,255,255,0.1); color: var(--ink); }
html.dark .ms-dialog,
html.dark .mc-dialog,
html.dark .mi-dialog,
html.dark .disc-dialog  { background: #1f1a14; }
html.dark .map-legend   { background: rgba(26,20,16,0.92); border-color: rgba(255,255,255,0.1); }
html.dark .bottom-nav   { background: #1a1410; border-top-color: rgba(255,255,255,0.1); }
html.dark #login-screen { background: #1a1410; }
html.dark .pin-wrap     { background: #1f1a14; border-color: rgba(255,255,255,0.1); box-shadow: none; }
html.dark .pin-btn      { background: #15110d; border-color: rgba(255,255,255,0.1); color: var(--ink); }
```

---

## Elementi da NON modificare

- `js/lipu.js` — nessuna modifica
- Colori semantici stati: `#40916C` (ok), `#E76F00` (pending), `#C1121F` (stop), `#aaa` (non ispez) nella legenda e nel donut
- Logo PA Palermo e testo istituzionale
- Logica PIN, autenticazione, invio schede
- Librerie esterne (MapLibre, PMTiles, Font Awesome, Titillium Web)

---

## Stima effort

| Fase | File | Effort |
|---|---|---|
| F1 — Token CSS | `lipu.css` | 30 min |
| F2 — Login | `lipu.css` | 45 min |
| F3 — Topbar | `lipu.css` + `index.html` | 30 min |
| F4 — Sidebar filtri | `lipu.css` | 30 min |
| F5 — Stats sidebar | `lipu.css` | 30 min |
| F6 — Panel dettaglio | `lipu.css` | 45 min |
| F7 — Modali | `lipu.css` | 30 min |
| F8 — Bottom nav | `lipu.css` + `index.html` | 45 min |
| F9 — Dark mode | `lipu.css` + `index.html` + `js/theme.js` | 60 min |
| **Totale** | | **~5–6 ore** |
