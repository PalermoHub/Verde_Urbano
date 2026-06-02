# Briefing nuova sessione: Reskin LIPU → stile SegnalaOra

Usa questo file come istruzione di avvio per una nuova sessione Claude Code.

---

## Contesto del progetto

Webapp mobile **LIPU · Protocollo di Tutela Faunistica** (ispezione alberi prima del taglio).  
Repository locale: `D:\GitHub - Clone\SiciliaHub\Verde_Urbano\Lipu\`  
Deploy: GitHub Pages su `https://palermohub.github.io/Verde_Urbano/Lipu`

**Stack**:
- `index.html` — SPA unica, tutto il markup
- `css/lipu.css` — tutto il CSS (no framework, custom puro)
- `js/lipu.js` — tutta la logica (MapLibre GL, PMTiles, PIN auth, Google Sheets)
- Librerie: MapLibre GL 4, PMTiles 3, Font Awesome 6.5, Titillium Web (Google Fonts)

---

## Obiettivo della sessione

Eseguire il **reskin grafico** completo della webapp LIPU adottando il linguaggio visivo della webapp SegnalaOra (`https://github.com/gbvitrano/Segnalazioni`).

**Regola assoluta**: non modificare `js/lipu.js`. Solo CSS e aggiunte HTML minime.

---

## Piano da eseguire

Il piano dettagliato è in **`PIANO_REDESIGN.md`** (nella stessa cartella).  
Leggerlo integralmente prima di iniziare. Contiene per ogni fase: selettori esatti, valori prima/dopo, snippet HTML pronti.

### Le 9 fasi in ordine

| # | Fase | File |
|---|---|---|
| F1 | Token CSS — swap palette `:root` | `css/lipu.css` |
| F2 | Login screen | `css/lipu.css` |
| F3 | Topbar + pulsante dark mode | `css/lipu.css` + `index.html` |
| F4 | Sidebar filtri | `css/lipu.css` |
| F5 | Stats sidebar | `css/lipu.css` |
| F6 | Panel dettaglio albero | `css/lipu.css` |
| F7 | Modali (schede, cerca, info) | `css/lipu.css` |
| F8 | Bottom nav mobile (HTML nuovo + CSS nuovo) | `css/lipu.css` + `index.html` |
| F9 | Dark mode (`theme.js` + blocco `html.dark`) | `css/lipu.css` + `index.html` + `js/theme.js` (nuovo) |

**Eseguire in ordine F1→F9**. F1 è il fondamento: tutte le fasi successive usano i nuovi token.

---

## Vincoli critici — NON toccare

1. **`js/lipu.js`** — nessuna modifica, nessuna riga
2. **Colori semantici stati ispezione** — questi valori esatti devono sopravvivere nel CSS:
   - `#40916C` verde = Ispezionato OK
   - `#E76F00` arancio = Stato di necessità
   - `#C1121F` rosso = Lavori sospesi
   - `#aaa` grigio = Non ispezionato
   - Usati in: `.legend-item`, donut SVG, cluster marker (quelli sono in JS — intoccabili)
3. **Logo PA Palermo** (`img/logo_pa_01.png`) — rimane visibile nella topbar
4. **Struttura HTML** — non rimuovere né riordinare elementi esistenti; solo aggiungere `<nav class="bottom-nav">` e il pulsante dark mode
5. **Font Titillium Web** — già presente, non cambiare

---

## Riferimento stile target

Per dubbi su un componente, il CSS sorgente di riferimento è:
```
gh api repos/gbvitrano/Segnalazioni/contents/css/app.css --jq '.content' | base64 -d
```

Palette target esatta:
```css
--ink:         #3d2f1e;
--paper:       #f5f0e8;
--amber:       #d4820a;
--amber-light: #e8a030;
--amber-pale:  #fef3e2;
--sage:        #3d5a47;
--mist:        #e8e2d6;
--rust:        #c0392b;
--radius:      12px;
--shadow:      rgba(60,40,20,0.12);
```

Per il `theme.js` standalone:
```
gh api repos/gbvitrano/Segnalazioni/contents/js/theme.js --jq '.content' | base64 -d
```

---

## Come procedere

1. Leggi `PIANO_REDESIGN.md` integralmente
2. Leggi `css/lipu.css` integralmente (serve per trovare i selettori esistenti)
3. Esegui F1 per primo — stabilisce i nuovi token usati da tutto il resto
4. Esegui F2–F7 in ordine, una fase per volta, verificando che i selettori esistano prima di modificarli
5. F8: aggiungi `<nav class="bottom-nav">` in `index.html` prima di `</body>`, poi aggiungi il CSS in `lipu.css`
6. F9: scarica `theme.js` da SegnalaOra con il comando `gh` sopra, salvalo in `js/theme.js`, aggiungi `<script src="js/theme.js"></script>` nel `<head>` di `index.html`, aggiungi il blocco `html.dark` in fondo a `lipu.css`
7. Commit finale con messaggio descrittivo

---

## Verifica finale

Dopo tutte le fasi, controllare:
- [ ] Login screen: sfondo chiaro/caldo, card PIN con ombra, pulsanti ambra
- [ ] Topbar: sfondo bianco, bordo inferiore ambra, testi scuri, pulsante dark mode
- [ ] Sidebar filtri: header senza verde, select con hover ambra
- [ ] Stats sidebar: header senza verde, sezioni con accent ambra
- [ ] Panel dettaglio: header senza verde, sezioni leggibili, bottone invia ambra
- [ ] Modali: dialog arrotondate (20px), header ambra
- [ ] Bottom nav visibile su mobile (≤768px), nascosta su desktop
- [ ] Dark mode: toggle funzionante, tutti i pannelli si scuriscono
- [ ] Colori stati ispezione nella legenda: invariati (verde/arancio/rosso/grigio)
- [ ] Logo PA Palermo: ancora visibile
