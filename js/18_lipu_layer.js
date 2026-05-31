// ===== STRATO LIPU ISPEZIONI =====
// Carica ispezioni.csv, renderizza su mappa Leaflet con colori LIPU,
// tooltip hover e modale dettaglio al click.

const LIPU_CSV_URL     = 'Lipu/dati/ispezioni.csv';
const LIPU_JSON_DIR    = 'Lipu/schede_pdf/';
const LIPU_PMTILES_URL = 'https://palermohub.github.io/Verde_Urbano/Lipu/dati/dati_alberi.pmtiles';

let _lipuPMTilesTotal = null; // cache conteggio da PMTiles

async function _fetchLipuPMTilesTotal() {
    if (_lipuPMTilesTotal !== null) return _lipuPMTilesTotal;
    try {
        // Legge header PMTiles v3 (127 byte): metadata_offset @24, metadata_length @32 (uint64 LE)
        const hdrResp = await fetch(LIPU_PMTILES_URL, { headers: { Range: 'bytes=0-126' } });
        if (!hdrResp.ok) return null;
        const hdrBuf  = await hdrResp.arrayBuffer();
        const view    = new DataView(hdrBuf);
        const metaOffset = Number(view.getBigUint64(24, true));
        const metaLength = Number(view.getBigUint64(32, true));

        const metaResp = await fetch(LIPU_PMTILES_URL, {
            headers: { Range: 'bytes=' + metaOffset + '-' + (metaOffset + metaLength - 1) }
        });
        if (!metaResp.ok) return null;
        const rawBuf = await metaResp.arrayBuffer();

        // Decompressione gzip tramite DecompressionStream
        let text;
        try {
            const ds     = new DecompressionStream('gzip');
            const writer = ds.writable.getWriter();
            const reader = ds.readable.getReader();
            writer.write(new Uint8Array(rawBuf));
            writer.close();
            const chunks = [];
            let done = false;
            while (!done) {
                const { value, done: d } = await reader.read();
                if (value) chunks.push(value);
                done = d;
            }
            const merged = new Uint8Array(chunks.reduce(function(a, c) { return a + c.length; }, 0));
            let off = 0;
            chunks.forEach(function(c) { merged.set(c, off); off += c.length; });
            text = new TextDecoder().decode(merged);
        } catch (_) {
            // fallback: dati già in testo
            text = new TextDecoder().decode(rawBuf);
        }

        const meta  = JSON.parse(text);
        const layer = meta.tilestats && meta.tilestats.layers && meta.tilestats.layers[0];
        if (layer && layer.count != null) {
            _lipuPMTilesTotal = layer.count;
            return _lipuPMTilesTotal;
        }
        _lipuPMTilesTotal = meta.total_features || meta.feature_count || null;
        return _lipuPMTilesTotal;
    } catch(e) {
        console.warn('LIPU PMTiles metadata error:', e);
        return null;
    }
}

const LIPU_COL = {
    NEGATIVO:  '#40916C',
    NECESSITA: '#E76F00',
    SOSPENDERE:'#C1121F',
    DEFAULT:   '#aaaaaa'
};

// Mappa esito CSV → chiave stato
const LIPU_ESITO_TO_STATO = {
    'NEGATIVO':           'ok',
    'STATO DI NECESSITÀ': 'pending',
    'SOSPENDERE':         'stop'
};

let lipuLayerGroup   = null;
let lipuLayerVisible = false;
let lipuLoaded       = false;
let lipuData         = [];
let lipuFiltriStati  = new Set(); // vuoto = mostra tutti; non-vuoto = mostra solo quelli nel set
let _lipuPendingTf   = null;      // valori territoriali catturati prima che applyFilters li resetti

// ── Helpers ────────────────────────────────────────────────────────────────

function _lipuColor(esito) {
    if (!esito) return LIPU_COL.DEFAULT;
    const e = esito.trim();
    if (e === 'NEGATIVO')             return LIPU_COL.NEGATIVO;
    if (e === 'STATO DI NECESSITÀ')   return LIPU_COL.NECESSITA;
    if (e === 'SOSPENDERE')           return LIPU_COL.SOSPENDERE;
    return LIPU_COL.DEFAULT;
}

function _lipuLabel(esito) {
    if (!esito) return '—';
    const e = esito.trim();
    if (e === 'NEGATIVO')           return 'Ispezionato OK';
    if (e === 'STATO DI NECESSITÀ') return 'Stato di necessità';
    if (e === 'SOSPENDERE')         return 'Lavori sospesi';
    return esito;
}

function _lipuEsitoClass(esito) {
    if (!esito) return '';
    const e = esito.trim();
    if (e === 'SOSPENDERE')         return 'lm-stop';
    if (e === 'STATO DI NECESSITÀ') return 'lm-pending';
    return 'lm-ok';
}

function _lipuJsonFilename(id, timestamp) {
    // "2026-05-30T08:03:10.000Z" → "1001_2026-05-30_08-03-10.json"
    try {
        const d    = new Date(timestamp);
        const date = d.toISOString().slice(0, 10);
        const time = d.toISOString().slice(11, 19).replace(/:/g, '-');
        return id + '_' + date + '_' + time + '.json';
    } catch(e) { return null; }
}

function _lipuFormatDate(ts) {
    if (!ts) return '—';
    try {
        const d = new Date(ts);
        return d.toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'numeric' })
             + ' ' + d.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
    } catch(e) { return ts; }
}

function _get(obj, ...keys) {
    for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== '') return obj[k];
    }
    return '—';
}

// ── Caricamento CSV ─────────────────────────────────────────────────────────

async function _loadLipuCSV() {
    const resp = await fetch(LIPU_CSV_URL);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const text = await resp.text();
    return parseCSV(text); // parseCSV definita in js/02_csv_loader.js
}

// ── Filtri territoriali dalla sidebar principale ─────────────────────────────

function _getLipuTerritoryFilters() {
    if (_lipuPendingTf) return _lipuPendingTf;
    return {
        circoscrizione: (document.getElementById('circoscrizioneFilter') || {}).value || '',
        quartiere:      (document.getElementById('quartiereFilter')      || {}).value || '',
        upl:            (document.getElementById('uplFilter')            || {}).value || ''
    };
}

// ── Toggle stato filtro legenda ───────────────────────────────────────────────

function toggleLipuStato(stato) {
    if (lipuFiltriStati.has(stato)) {
        lipuFiltriStati.delete(stato);   // deseleziona → torna a mostrare tutti se set vuoto
    } else {
        lipuFiltriStati.add(stato);      // seleziona → mostra solo quelli nel set
    }
    _updateLipuLegendUI();
    if (lipuLoaded) {
        _renderLipuMarkers();
        updateLipuStatsSidebar();
    }
}

function _updateLipuLegendUI() {
    const hasFilter = lipuFiltriStati.size > 0;
    ['ok', 'pending', 'stop'].forEach(function(stato) {
        const el = document.querySelector('.lipu-leg-btn[data-stato="' + stato + '"]');
        if (!el) return;
        const active = lipuFiltriStati.has(stato);
        // inattivo solo se c'è un filtro attivo E questo stato non è selezionato
        el.classList.toggle('lipu-leg-inactive', hasFilter && !active);
        el.classList.toggle('lipu-leg-active',   active);
    });
}

// ── Render markers ──────────────────────────────────────────────────────────

function _renderLipuMarkers() {
    if (typeof map === 'undefined' || !map) return;

    if (lipuLayerGroup) {
        if (map.hasLayer(lipuLayerGroup)) map.removeLayer(lipuLayerGroup);
    }
    lipuLayerGroup = L.layerGroup();

    const tf = _getLipuTerritoryFilters();

    lipuData.forEach(function(row) {
        const lat = parseFloat(row.lat);
        const lng = parseFloat(row.long);
        if (isNaN(lat) || isNaN(lng)) return;

        // Filtro stato (legenda): set vuoto = mostra tutti
        const stato = LIPU_ESITO_TO_STATO[row.esito] || 'ok';
        if (lipuFiltriStati.size > 0 && !lipuFiltriStati.has(stato)) return;

        // Filtro territorio in cascata con filtri principali
        if (tf.circoscrizione && row.Circoscrizione !== tf.circoscrizione) return;
        if (tf.quartiere      && row.Quartiere      !== tf.quartiere)      return;
        if (tf.upl            && row.UPL            !== tf.upl)            return;

        const color  = _lipuColor(row.esito);
        const label  = _lipuLabel(row.esito);
        const eClass = stato === 'stop' ? 'lipu-tt-stop' : stato === 'pending' ? 'lipu-tt-pending' : 'lipu-tt-ok';

        const marker = L.circleMarker([lat, lng], {
            radius:      7,
            fillColor:   color,
            color:       '#fff',
            weight:      1.5,
            fillOpacity: 0.9,
            pane:        'markerPane'
        });

        const ttHtml = '<div class="lipu-tt-inner">'
            + '<div class="lipu-tt-id">#' + (row.id_albero || '') + '</div>'
            + '<div class="lipu-tt-specie">' + (row.specie || '—') + '</div>'
            + '<div class="lipu-tt-loc">'   + (row.Quartiere || row.UPL || '') + '</div>'
            + '<div class="lipu-tt-esito '  + eClass + '">' + label + '</div>'
            + '</div>';

        marker.bindTooltip(ttHtml, {
            className: 'lipu-tooltip-wrap',
            sticky:    true,
            direction: 'top',
            offset:    [0, -8]
        });

        marker.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            _openLipuModal(row);
        });

        lipuLayerGroup.addLayer(marker);
    });

    if (lipuLayerVisible) {
        lipuLayerGroup.addTo(map);
        lipuLayerGroup.bringToFront && lipuLayerGroup.bringToFront();
        _fitLipuBounds();
    }
}

function _fitLipuBounds() {
    if (!lipuLayerGroup || typeof map === 'undefined') return;
    const tf = _getLipuTerritoryFilters();
    const hasFilter = lipuFiltriStati.size > 0 || tf.circoscrizione || tf.quartiere || tf.upl;
    if (!hasFilter) return; // nessun filtro attivo → non muovere la mappa

    const layers = [];
    lipuLayerGroup.eachLayer(function(l) { layers.push(l); });
    if (!layers.length) return;

    try {
        const bounds = L.featureGroup(layers).getBounds();
        if (bounds.isValid()) map.fitBounds(bounds.pad(0.15), { maxZoom: 16, animate: true });
    } catch(e) {}
}

// ── Modale dettaglio ────────────────────────────────────────────────────────

async function _openLipuModal(row) {
    let json = null;
    const fname = _lipuJsonFilename(row.id_albero, row.timestamp);
    if (fname) {
        try {
            const resp = await fetch(LIPU_JSON_DIR + fname);
            if (resp.ok) json = await resp.json();
        } catch(e) { /* JSON non trovato: usa solo dati CSV */ }
    }
    _populateLipuModal(row, json);
}

function _populateLipuModal(row, json) {
    const d = json || {};

    const esito = d.esito || row.esito || '';
    const color = _lipuColor(esito);

    // Header
    document.getElementById('lm-specie').textContent   = _get(d, 'specie') !== '—' ? d.specie : (row.specie || '—');
    document.getElementById('lm-via').textContent      = _get(d, 'via', 'Quartiere', 'quartiere') !== '—'
        ? (d.via || d.quartiere || '') : (row.Quartiere || row.UPL || '—');
    document.getElementById('lm-id').textContent       = '#' + (d.id_albero || row.id_albero || '—');
    document.getElementById('lm-esito').textContent    = _lipuLabel(esito);
    document.getElementById('lm-esito').style.color    = color;
    document.getElementById('lm-esito').className      = 'lipu-modal-esito ' + _lipuEsitoClass(esito);

    // Campi
    document.getElementById('lm-data').textContent          = _lipuFormatDate(d.timestamp || row.timestamp);
    document.getElementById('lm-ora').textContent           = _get(d, 'ora_controllo')         !== '—' ? d.ora_controllo         : (row.ora_controllo || '—');
    document.getElementById('lm-circoscrizione').textContent= _get(d, 'circoscrizione')        !== '—' ? d.circoscrizione        : (row.Circoscrizione || '—');
    document.getElementById('lm-quartiere').textContent     = _get(d, 'quartiere')             !== '—' ? d.quartiere             : (row.Quartiere || '—');
    document.getElementById('lm-upl').textContent           = _get(d, 'upl')                   !== '—' ? d.upl                   : (row.UPL || '—');
    document.getElementById('lm-alt-compl').textContent     = (_get(d, 'altezza_complessiva')   !== '—' ? d.altezza_complessiva   : (row['Altezza complessiva [m]'] || '—')) + ' m';
    document.getElementById('lm-alt-base').textContent      = (_get(d, 'altezza_base_chioma')   !== '—' ? d.altezza_base_chioma   : (row['Altezza della base della chioma [m]'] || '—')) + ' m';
    document.getElementById('lm-operatore').textContent     = _get(d, 'nome_operatore')        !== '—' ? d.nome_operatore        : (row.nome_operatore || '—');
    document.getElementById('lm-ditta').textContent         = _get(d, 'ditta_operatore')       !== '—' ? d.ditta_operatore       : (row.ditta_operatore || '—');
    document.getElementById('lm-nido').textContent          = _get(d, 'nido_visibile')         !== '—' ? d.nido_visibile         : (row.nido_visibile || '—');
    document.getElementById('lm-richiami').textContent      = _get(d, 'richiami')              !== '—' ? d.richiami              : (row.richiami || '—');
    document.getElementById('lm-andirivieni').textContent   = _get(d, 'andirivieni')           !== '—' ? d.andirivieni           : (row.andirivieni || '—');
    document.getElementById('lm-note').textContent          = _get(d, 'note')                  !== '—' ? d.note                  : (row.note || '—');
    document.getElementById('lm-firma-op').textContent      = _get(d, 'firma_operatore')       !== '—' ? d.firma_operatore       : (row.firma_operatore || '—');
    document.getElementById('lm-firma-cap').textContent     = _get(d, 'firma_capocantiere')    !== '—' ? d.firma_capocantiere    : (row.firma_capocantiere || '—');

    // Foto 1-3 in griglia miniature
    const fotos = [
        (d.url_foto_1 || row.url_foto_1 || '').trim(),
        (d.url_foto_2 || row.url_foto_2 || '').trim(),
        (d.url_foto_3 || row.url_foto_3 || '').trim()
    ].filter(Boolean);
    const fotoGrid = document.getElementById('lm-foto-grid');
    const fotoWrp  = document.getElementById('lm-foto-wrap');
    fotoGrid.innerHTML = '';
    if (fotos.length) {
        fotos.slice(0, 3).forEach(function(url, i) {
            const img = document.createElement('img');
            img.src       = url;
            img.alt       = 'Foto ispezione ' + (i + 1);
            img.className = 'lipu-foto-thumb';
            img.addEventListener('click', function() {
                if (typeof openImageGallery === 'function') openImageGallery(fotos, i);
            });
            fotoGrid.appendChild(img);
        });
        fotoWrp.style.display = 'block';
    } else {
        fotoWrp.style.display = 'none';
    }

    // PDF
    const pdfUrl  = (d.url_pdf || row.url_pdf || '').trim();
    const pdfLink = document.getElementById('lm-pdf-link');
    if (pdfUrl) {
        pdfLink.href           = pdfUrl;
        pdfLink.style.display  = 'inline-flex';
    } else {
        pdfLink.style.display  = 'none';
    }

    // Apri modale
    const tog = document.getElementById('lipuModalToggle');
    if (tog) tog.checked = true;
    document.getElementById('lipuDetailModal').classList.add('active');

    // Assicura che la sidebar destra sia aperta (modale la copre dall'interno)
    const container = document.querySelector('.container');
    if (container && container.classList.contains('sidebar-right-hidden')) {
        if (typeof toggleSidebarRight === 'function') toggleSidebarRight();
    }
}

function closeLipuModal() {
    document.getElementById('lipuDetailModal').classList.remove('active');
    const tog = document.getElementById('lipuModalToggle');
    if (tog) tog.checked = false;
}

// ── Toggle layer ────────────────────────────────────────────────────────────

// ── Opzioni LIPU nei select territoriali con cascade ────────────────────────

function _lipuSelectData(excludeField) {
    const tf = _getLipuTerritoryFilters();
    return lipuData.filter(function(row) {
        if (excludeField !== 'circoscrizione' && tf.circoscrizione && row.Circoscrizione !== tf.circoscrizione) return false;
        if (excludeField !== 'quartiere'      && tf.quartiere      && row.Quartiere      !== tf.quartiere)      return false;
        if (excludeField !== 'upl'            && tf.upl            && row.UPL            !== tf.upl)            return false;
        return true;
    });
}

function _rebuildLipuSelect(selectId, field, excludeField) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const savedValue = select.value;

    // Rimuove le opzioni LIPU precedenti
    Array.from(select.options).forEach(function(opt) {
        if (opt.dataset.lipuOption) select.removeChild(opt);
    });

    if (!lipuLayerVisible || !lipuLoaded) return;

    // Conta valori LIPU filtrati in cascade
    const counts = new Map();
    _lipuSelectData(excludeField).forEach(function(row) {
        const val = row[field];
        if (val) counts.set(val, (counts.get(val) || 0) + 1);
    });

    counts.forEach(function(count, val) {
        // Aggiunge solo se non già presente nel dataset principale
        const mainHas = Array.from(select.options).some(function(o) { return o.value === val && !o.dataset.lipuOption; });
        if (!mainHas) {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val + ' (LIPU: ' + count + ')';
            opt.dataset.lipuOption = '1';
            select.appendChild(opt);
        }
    });

    // Ripristina selezione se ancora disponibile
    if (savedValue && Array.from(select.options).some(function(o) { return o.value === savedValue; })) {
        select.value = savedValue;
    }
}

function _addLipuOptionsToSelects() {
    _rebuildLipuSelect('circoscrizioneFilter', 'Circoscrizione', 'circoscrizione');
    _rebuildLipuSelect('quartiereFilter',      'Quartiere',      'quartiere');
    _rebuildLipuSelect('uplFilter',            'UPL',            'upl');
}

// ── Intercetta applyFilters per aggiornare i marker LIPU in cascata ──────────

(function _wrapApplyFilters() {
    const orig = window.applyFilters;
    if (typeof orig !== 'function') return;
    window.applyFilters = function() {
        // Cattura i valori territoriali PRIMA che _rebuildDynamicSelect li resetti
        _lipuPendingTf = {
            circoscrizione: (document.getElementById('circoscrizioneFilter') || {}).value || '',
            quartiere:      (document.getElementById('quartiereFilter')      || {}).value || '',
            upl:            (document.getElementById('uplFilter')            || {}).value || ''
        };
        orig.apply(this, arguments);
        if (lipuLayerVisible && lipuLoaded) {
            _renderLipuMarkers();
            updateLipuStatsSidebar();
        }
        _lipuPendingTf = null;
    };
})();

(function _wrapUpdateFilterCounts() {
    const orig = window.updateFilterCounts;
    if (typeof orig !== 'function') return;
    window.updateFilterCounts = function() {
        orig.apply(this, arguments);
        _addLipuOptionsToSelects();
    };
})();

// Wrap anche resetFilters per ripristinare i filtri stato LIPU
(function _wrapResetFilters() {
    const orig = window.resetFilters;
    if (typeof orig !== 'function') return;
    window.resetFilters = function() {
        orig.apply(this, arguments);
        lipuFiltriStati = new Set();
        _updateLipuLegendUI();
        if (lipuLayerVisible && lipuLoaded) {
            _renderLipuMarkers();
            updateLipuStatsSidebar();
        }
    };
})();

// ── Tab LIPU Stats nella sidebar destra ─────────────────────────────────────

let _lipuDonutChart = null;

function _showLipuStatsTab() {
    const btn = document.getElementById('sb-tab-btn-lipu');
    if (btn) btn.style.display = '';
    if (typeof showRightSidebarTab === 'function') showRightSidebarTab('lipu-stats');
}

function _hideLipuStatsTab() {
    const btn = document.getElementById('sb-tab-btn-lipu');
    if (btn) { btn.style.display = 'none'; btn.classList.remove('active'); }
    const lipuPane = document.getElementById('sb-pane-lipu-stats');
    if (lipuPane) lipuPane.classList.remove('active');
    // Fallback al primo tab visibile
    const fallback = ['dataviz', 'statistiche'].find(function(id) {
        const b = document.querySelector('#sidebarRight .sb-tab-btn[data-tab="' + id + '"]');
        return b && b.style.display !== 'none';
    });
    if (fallback && typeof showRightSidebarTab === 'function') showRightSidebarTab(fallback);
}

async function updateLipuStatsSidebar() {
    if (!lipuLayerVisible || !lipuLoaded || !lipuData.length) return;

    const tf = _getLipuTerritoryFilters();
    const filtered = lipuData.filter(function(row) {
        if (tf.circoscrizione && row.Circoscrizione !== tf.circoscrizione) return false;
        if (tf.quartiere      && row.Quartiere      !== tf.quartiere)      return false;
        if (tf.upl            && row.UPL            !== tf.upl)            return false;
        if (lipuFiltriStati.size > 0) {
            const stato = LIPU_ESITO_TO_STATO[row.esito] || (row.esito ? 'ok' : 'non_ispez');
            if (!lipuFiltriStati.has(stato)) return false;
        }
        return true;
    });

    // Conteggi stato
    const counts = { ok: 0, pending: 0, stop: 0, non_ispez: 0 };
    filtered.forEach(function(row) {
        const esito = (row.esito || '').trim();
        if (esito === 'NEGATIVO')           counts.ok++;
        else if (esito === 'STATO DI NECESSITÀ') counts.pending++;
        else if (esito === 'SOSPENDERE')    counts.stop++;
        else                                counts.non_ispez++;
    });

    const hasTerrFilter = !!(tf.circoscrizione || tf.quartiere || tf.upl);

    // Hero: totale dal PMTiles LIPU
    const pmTotal = await _fetchLipuPMTilesTotal();
    const totalPMT = pmTotal !== null ? pmTotal : lipuData.length;
    const elTot = document.getElementById('ls-total');
    if (elTot) elTot.textContent = totalPMT.toLocaleString('it-IT');
    _setEl('ls-ispezionati', filtered.length.toLocaleString('it-IT'));
    const daIspez = hasTerrFilter ? '—' : Math.max(0, totalPMT - lipuData.length).toLocaleString('it-IT');
    const elDaIspez = document.getElementById('ls-da-ispez');
    if (elDaIspez) elDaIspez.textContent = daIspez;
    const pctIspez = hasTerrFilter
        ? (lipuData.length > 0 ? Math.round(filtered.length / lipuData.length * 100) : 0)
        : (totalPMT > 0 ? Math.round(lipuData.length / totalPMT * 100) : 0);
    const elFill = document.getElementById('ls-progress-fill');
    const elPct  = document.getElementById('ls-progress-pct');
    if (elFill) elFill.style.width = pctIspez + '%';
    if (elPct)  elPct.textContent  = pctIspez + '%';

    // Mini cards
    _setEl('ls-ok',      counts.ok);
    _setEl('ls-pending', counts.pending);
    _setEl('ls-stop',    counts.stop);

    // Donut Chart.js
    const canvas = document.getElementById('lipuStatsDonut');
    const LIPU_DONUT_LABELS  = ['Ispezionato OK', 'Stato di necessità', 'Lavori sospesi'];
    const LIPU_DONUT_COLORS  = ['#40916C', '#E76F00', '#C1121F'];
    const LIPU_DONUT_VALUES  = [counts.ok, counts.pending, counts.stop];
    if (canvas && typeof Chart !== 'undefined') {
        if (_lipuDonutChart) { _lipuDonutChart.destroy(); _lipuDonutChart = null; }
        const inspected = counts.ok + counts.pending + counts.stop;
        const lipuCenterPlugin = {
            id: 'lipuCenter',
            afterDraw: function(chart) {
                if (chart.config.type !== 'doughnut') return;
                const total      = chart._lipuTotal || 0;
                const insp       = chart._lipuInspected || 0;
                const isFiltered = chart._lipuFiltered || false;
                if (!total && !insp) return;
                const { ctx, chartArea: { width, height, left, top } } = chart;
                const cx = left + width / 2, cy = top + height / 2;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (isFiltered) {
                    ctx.font = 'bold 18px "Titillium Web", Arial, sans-serif';
                    ctx.fillStyle = '#1a1a1a';
                    ctx.fillText(insp.toLocaleString('it-IT'), cx, cy - 8);
                    ctx.font = '8px "Titillium Web", Arial, sans-serif';
                    ctx.fillStyle = '#aaa';
                    ctx.fillText('ISPEZIONI', cx, cy + 6);
                } else {
                    const daIspez = Math.max(0, total - insp);
                    ctx.font = 'bold 18px "Titillium Web", Arial, sans-serif';
                    ctx.fillStyle = '#1a1a1a';
                    ctx.fillText(total.toLocaleString('it-IT'), cx, cy - 14);
                    ctx.font = '8px "Titillium Web", Arial, sans-serif';
                    ctx.fillStyle = '#aaa';
                    ctx.fillText('ALBERI TOTALI', cx, cy - 2);
                    ctx.font = 'bold 14px "Titillium Web", Arial, sans-serif';
                    ctx.fillStyle = '#e67e22';
                    ctx.fillText(daIspez.toLocaleString('it-IT'), cx, cy + 11);
                    ctx.font = '8px "Titillium Web", Arial, sans-serif';
                    ctx.fillStyle = '#888';
                    ctx.fillText('da ispezionare', cx, cy + 23);
                }
                ctx.restore();
            }
        };
        _lipuDonutChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: LIPU_DONUT_LABELS,
                datasets: [{
                    data: LIPU_DONUT_VALUES,
                    backgroundColor: LIPU_DONUT_COLORS,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: {
                        label: function(ctx) { return ' ' + ctx.label + ': ' + ctx.raw; }
                    }}
                }
            },
            plugins: [lipuCenterPlugin]
        });
        _lipuDonutChart._lipuTotal     = hasTerrFilter ? filtered.length : totalPMT;
        _lipuDonutChart._lipuInspected = filtered.length;
        _lipuDonutChart._lipuFiltered  = hasTerrFilter;
        _lipuDonutChart.update();
        // Resize dopo breve delay: gestisce il caso mobile in cui il canvas
        // viene creato mentre la sidebar ha display:none (dimensioni 0×0).
        setTimeout(function() { if (_lipuDonutChart) _lipuDonutChart.resize(); }, 120);
    }
    // Legenda donut (stile donut-legend esistente)
    const legendEl = document.getElementById('ls-donut-legend');
    if (legendEl) {
        legendEl.innerHTML = LIPU_DONUT_LABELS.map(function(lbl, i) {
            return '<div class="donut-legend-item">'
                + '<div class="donut-legend-dot" style="background:' + LIPU_DONUT_COLORS[i] + '"></div>'
                + '<span class="donut-legend-name">' + lbl + '</span>'
                + '<span class="donut-legend-count">(' + LIPU_DONUT_VALUES[i] + ')</span>'
                + '</div>';
        }).join('');
    }

    // Ranking helpers
    function countBy(field) {
        const m = {};
        filtered.forEach(function(row) {
            const v = row[field];
            if (v) m[v] = (m[v] || 0) + 1;
        });
        return Object.entries(m).sort(function(a, b) { return b[1] - a[1]; });
    }

    _renderLipuRank('ls-species-rank', countBy('specie'), 10);
    _renderLipuRank('ls-upl-rank',     countBy('UPL'),    8);
    _renderLipuRank('ls-quart-rank',   countBy('Quartiere'), 8);
    _renderLipuRank('ls-circ-rank',    countBy('Circoscrizione'), 8);
}

function _setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function _renderLipuRank(containerId, entries, maxItems) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const max = entries.length ? entries[0][1] : 1;
    el.innerHTML = entries.slice(0, maxItems).map(function(e, i) {
        const pct = Math.round(e[1] / max * 100);
        return '<div class="rl-item">'
            + '<div class="rl-rank">' + (i + 1) + '</div>'
            + '<span class="rl-label" title="' + e[0] + '">' + e[0] + '</span>'
            + '<div class="rl-bar-wrap"><div class="rl-bar" style="width:' + pct + '%;background:#2D6A4F"></div></div>'
            + '<span class="rl-value">' + e[1] + '</span>'
            + '</div>';
    }).join('');
}

function toggleLipuLayer(checked) {
    lipuLayerVisible = !!checked;

    const legend = document.getElementById('lipu-legend-items');
    if (legend) legend.style.display = lipuLayerVisible ? 'block' : 'none';

    if (!lipuLayerVisible) {
        if (lipuLayerGroup && typeof map !== 'undefined' && map.hasLayer(lipuLayerGroup)) {
            map.removeLayer(lipuLayerGroup);
        }
        // Rimuove le opzioni LIPU-only dai select territoriali
        document.querySelectorAll('[data-lipu-option="1"]').forEach(function(opt) {
            // Se l'opzione è selezionata, resetta il select prima di rimuoverla
            if (opt.selected) opt.parentNode.value = '';
            opt.parentNode.removeChild(opt);
        });
        _hideLipuStatsTab();
        return;
    }

    if (!lipuLoaded) {
        _loadLipuCSV()
            .then(function(data) {
                lipuData   = data;
                lipuLoaded = true;
                if (!lipuLayerVisible) return; // utente ha spento il layer durante il caricamento
                _addLipuOptionsToSelects();
                _renderLipuMarkers();
                _showLipuStatsTab();
                updateLipuStatsSidebar();
            })
            .catch(function(err) {
                console.error('LIPU layer: errore caricamento CSV', err);
            });
    } else {
        _addLipuOptionsToSelects();
        if (lipuLayerGroup) {
            if (typeof map !== 'undefined') {
                lipuLayerGroup.addTo(map);
                lipuLayerGroup.bringToFront && lipuLayerGroup.bringToFront();
            }
        }
        _showLipuStatsTab();
        updateLipuStatsSidebar();
    }
}
