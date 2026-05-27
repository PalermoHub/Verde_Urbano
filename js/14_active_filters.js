// ===== GESTIONE FILTRI ATTIVI =====

// Mostra il modale con i filtri attivi
function showActiveFilters() {
    const modal = document.getElementById('activeFiltersModal');
    const content = document.getElementById('activeFiltersContent');

    // Raccogli i valori dei filtri
    const selectedP = typeof getSelectedProgetti === 'function' ? getSelectedProgetti() : [];
    const filters = {
        ...(selectedP.length ? { 'Progetto': selectedP.join(', ') } : {}),
        'Odonimo (Strada)': document.getElementById('odonimoFilter').value,
        'Circoscrizione': document.getElementById('circoscrizioneFilter').value,
        'Quartiere': document.getElementById('quartiereFilter').value,
        'UPL': document.getElementById('uplFilter').value,
        'Specie Botanica': document.getElementById('specieFilter').value,
        'Stato Salute (CPC)': document.getElementById('cpcFilter').value,
        'Dimora': document.getElementById('siteFilter').value,
        'Altezza Minima': document.getElementById('minHeight').value + 'm',
        'Diametro Minimo': document.getElementById('minDiameter').value + 'cm',
        'Fase Lavorazione': document.getElementById('faseFilter').value,
        'Necessità Pulizia Foglie': document.getElementById('puliziaFilter').value
    };

    // Mappa i valori dei filtri in testi più leggibili
    const filterLabels = {
        'fase1': 'Solo Fase 1 (Potatura/Abbattimento)',
        'fase2': 'Con Fase 2 (Rimozione ceppo)',
        'fase3': 'Con Fase 3 (Nuova pianta)',
        'fase4': 'Con Fase 4 (Pali tutori)',
        'alta': 'Alta priorità (>30% variazione)',
        'media': 'Media priorità (15-30%)',
        'bassa': 'Bassa priorità (<15%)',
        'B': 'B - Bassa',
        'C': 'C - Moderata',
        'C/D': 'C/D - Elevata',
        'D': 'D - Estrema'
    };

    // Crea l'HTML con i filtri attivi
    let html = '';
    let hasActiveFilters = false;

    for (const [label, value] of Object.entries(filters)) {
        if (value && value !== '' && value !== '0m' && value !== '0cm') {
            hasActiveFilters = true;
            const displayValue = filterLabels[value] || value;
            html += `
                <div style="padding: 12px; margin-bottom: 10px; background: #f9f9f9; border-left: 4px solid #9b59b6; border-radius: 4px;">
                    <div style="font-weight: 700; color: #555; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">
                        ${label}
                    </div>
                    <div style="color: #313131; font-size: 14px; font-weight: 600;">
                        ${displayValue}
                    </div>
                </div>
            `;
        }
    }

    if (!hasActiveFilters) {
        html = `
            <div style="padding: 40px; text-align: center; color: #999;">
                <i class="fas fa-filter" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                <p style="font-size: 16px; margin-bottom: 8px;"><strong>Nessun filtro attivo</strong></p>
                <p style="font-size: 13px;">Tutti i dati sono visualizzati senza restrizioni.</p>
            </div>
        `;
    } else {
        // Aggiungi statistiche sui risultati filtrati
        html = `
            <div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; text-align: center;">
                <div style="font-size: 14px; margin-bottom: 5px;">Alberi visualizzati</div>
                <div style="font-size: 32px; font-weight: 700;">${filteredTrees.length}</div>
                <div style="font-size: 12px; opacity: 0.9;">su ${allTrees.length} totali</div>
            </div>
        ` + html;
    }

    content.innerHTML = html;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

// Chiudi il modale dei filtri attivi
function closeActiveFilters() {
    const modal = document.getElementById('activeFiltersModal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Toggle della sidebar sinistra
function toggleFiltersSidebar() {
    const sidebar = document.querySelector('.sidebar-left');
    if (sidebar.style.display === 'none') {
        sidebar.style.display = 'block';
    } else {
        sidebar.style.display = 'none';
    }
}


// ===== CHIP FILTRI ATTIVI SOPRA LA MAPPA =====
function renderFilterChips() {
    const container = document.getElementById('activeFilterChips');
    if (!container) return;

    // helper per nomi human-readable
    const FASE_LABELS = {
        'fase1': 'Solo Fase 1',
        'fase2': 'Con Fase 2',
        'fase3': 'Con Fase 3',
        'fase4': 'Con Fase 4'
    };
    const PULIZIA_LABELS = {
        'alta': 'Alta priorità',
        'media': 'Media priorità',
        'bassa': 'Bassa priorità'
    };
    const CPC_LABELS = {
        'A': 'A - Trascurabile',
        'B': 'B - Bassa',
        'C': 'C - Moderata',
        'C/D': 'C/D - Elevata',
        'D': 'D - Estrema',
        'Ceppaia': 'Ceppaia',
        'Vuoto': 'Cercine vuoto',
        'Verifica': 'Da verificare',
        'Non Class': 'Non classificato',
        'No Interv': 'Nessun intervento'
    };

    // Costruisci la lista di filtri attivi
    const chips = [];

    // Progetti
    const selectedP = typeof getSelectedProgetti === 'function' ? getSelectedProgetti() : [];
    const allProg = document.querySelectorAll('.progetto-cb').length;
    if (selectedP.length && selectedP.length < allProg) {
        chips.push({ key: 'progetto', label: 'Progetto', value: selectedP.length === 1 ? selectedP[0] : (selectedP.length + ' progetti') });
    }

    // Helpers per select / range
    const sel = (id) => document.getElementById(id);
    const addSelect = (id, label, mapLabels) => {
        const el = sel(id); if (!el || !el.value) return;
        const v = mapLabels && mapLabels[el.value] ? mapLabels[el.value] : el.value;
        chips.push({ key: id, label: label, value: v });
    };

    addSelect('odonimoFilter',       'Odonimo');
    addSelect('civicoFilter',        'Civico');
    addSelect('circoscrizioneFilter','Circoscriz.');
    addSelect('quartiereFilter',     'Quartiere');
    addSelect('uplFilter',           'UPL');
    addSelect('faseFilter',          'Fase',     FASE_LABELS);
    addSelect('specieFilter',        'Specie');
    addSelect('cpcFilter',           'CPC',      CPC_LABELS);
    addSelect('siteFilter',          'Dimora');
    addSelect('puliziaFilter',       'Pulizia foglie', PULIZIA_LABELS);

    // Time-slider periodo
    if (window.vuTimeSlider && window.vuTimeSlider.isActive && window.vuTimeSlider.isActive()) {
        const r = window.vuTimeSlider.getRange && window.vuTimeSlider.getRange();
        if (r) {
            const fmt = d => d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
            chips.push({ key: 'timeRange', label: 'Periodo', value: fmt(r[0]) + ' → ' + fmt(r[1]) });
        }
    }

    // Range numerici (min/max)
    const minH = sel('minHeight'), maxH = sel('maxHeight');
    if (minH && maxH) {
        const lo = parseFloat(minH.value), hi = parseFloat(maxH.value);
        const loDef = parseFloat(minH.min), hiDef = parseFloat(maxH.max);
        if (lo > loDef || hi < hiDef) {
            chips.push({ key: 'heightRange', label: 'Altezza', value: lo + '–' + hi + ' m' });
        }
    }
    const minD = sel('minDiameter'), maxD = sel('maxDiameter');
    if (minD && maxD) {
        const lo = parseFloat(minD.value), hi = parseFloat(maxD.value);
        const loDef = parseFloat(minD.min), hiDef = parseFloat(maxD.max);
        if (lo > loDef || hi < hiDef) {
            chips.push({ key: 'diameterRange', label: 'Diametro', value: lo + '–' + hi + ' cm' });
        }
    }

    // Albero selezionato
    if (typeof selectedTree !== 'undefined' && selectedTree) {
        const name = (selectedTree.specie || selectedTree.id || 'Albero');
        chips.push({ key: 'selectedTree', label: 'Albero', value: name });
    }

    // Renderizza
    if (chips.length === 0) {
        container.classList.remove('has-chips');
        container.innerHTML = '';
        return;
    }
    container.classList.add('has-chips');

    const safe = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    let html = '<span class="chips-leading"><i class="fas fa-filter"></i> Filtri</span>';
    chips.forEach(c => {
        html += '<span class="filter-chip">'
              +   '<span class="filter-chip__label">' + safe(c.label) + '</span>'
              +   '<span class="filter-chip__value" title="' + safe(c.value) + '">' + safe(c.value) + '</span>'
              +   '<button type="button" class="filter-chip__remove" aria-label="Rimuovi filtro ' + safe(c.label) + '" data-chip-key="' + safe(c.key) + '">'
              +     '<i class="fas fa-times"></i>'
              +   '</button>'
              + '</span>';
    });
    html += '<button type="button" class="filter-chips-clear" onclick="resetFilters()" title="Rimuovi tutti i filtri"><i class="fas fa-rotate-left"></i> Ripristina</button>';
    const fc = (typeof filteredTrees !== 'undefined') ? filteredTrees.length : 0;
    const tc = (typeof allTrees !== 'undefined') ? allTrees.length : 0;
    if (tc) html += '<span class="filter-chips-count"><strong>' + fc.toLocaleString('it-IT') + '</strong> di ' + tc.toLocaleString('it-IT') + ' alberi</span>';

    container.innerHTML = html;

    // Wire remove buttons
    container.querySelectorAll('.filter-chip__remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-chip-key');
            removeFilterByKey(key);
        });
    });
}

function removeFilterByKey(key) {
    if (key === 'progetto') {
        document.querySelectorAll('.progetto-cb').forEach(cb => cb.checked = true);
        const all = document.getElementById('progettoAll');
        if (all) all.checked = true;
        if (typeof onProgettoChange === 'function') onProgettoChange();
        return;
    }
    if (key === 'selectedTree') {
        if (typeof clearSelectedTreeFilter === 'function') clearSelectedTreeFilter();
        return;
    }
    if (key === 'timeRange') {
        var ts = window.vuTimeSlider;
        var minEl = document.getElementById('vuTSStart');
        var maxEl = document.getElementById('vuTSEnd');
        if (minEl) minEl.value = 0;
        if (maxEl) maxEl.value = 100;
        // Reset highlight visually
        var hl = document.getElementById('vuTSHL');
        if (hl) { hl.style.left = '0%'; hl.style.right = '0%'; }
        if (typeof applyFilters === 'function') applyFilters();
        return;
    }
    if (key === 'heightRange' || key === 'diameterRange') {
        var prefix = key === 'heightRange' ? 'Height' : 'Diameter';
        var mn = document.getElementById('min' + prefix);
        var mx = document.getElementById('max' + prefix);
        if (mn) mn.value = mn.min;
        if (mx) mx.value = mx.max;
        if (typeof syncDualRange === 'function' && mn) syncDualRange(mn);
        if (typeof applyFilters === 'function') applyFilters();
        return;
    }
    // <select> fields: clear value and re-apply
    const el = document.getElementById(key);
    if (el) {
        el.value = '';
        if (typeof applyFilters === 'function') applyFilters();
    }
}


// ===== DRILL-DOWN: click sulle statistiche applica i filtri =====
(function initStatDrilldown() {
    function handleActivate(el) {
        if (!el) return;
        var key = el.getAttribute('data-filter-key');
        var val = el.getAttribute('data-filter-value');
        if (!key || val == null) return;
        var ctrl = document.getElementById(key);
        if (!ctrl) return;
        // Verify the value exists in the select; fallback no-op
        if (ctrl.tagName === 'SELECT') {
            var found = Array.from(ctrl.options).some(function(o){ return o.value === val; });
            if (!found) return;
            ctrl.value = val;
        } else {
            ctrl.value = val;
        }
        if (typeof applyFilters === 'function') applyFilters();
        // If on mobile, close left sidebar to reveal the map
        if (window.innerWidth <= 768) {
            var container = document.querySelector('.container');
            if (container && !container.classList.contains('sidebar-left-hidden')) {
                if (typeof toggleSidebarLeft === 'function') toggleSidebarLeft();
            }
        }
    }
    document.addEventListener('click', function(e) {
        var el = e.target.closest('.rl-item--clickable');
        if (el) handleActivate(el);
    });
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var el = e.target.closest && e.target.closest('.rl-item--clickable');
        if (el) { e.preventDefault(); handleActivate(el); }
    });
})();


// ===== ESPORTA filteredTrees come CSV o GeoJSON =====
function exportFilteredTrees(format) {
    if (typeof filteredTrees === 'undefined' || !filteredTrees || filteredTrees.length === 0) {
        alert('Nessun albero da esportare. Modifica i filtri.');
        return;
    }
    var trees = filteredTrees;
    var stamp = new Date().toISOString().replace(/[-:T]/g,'').slice(0,15);
    var filename = 'verde_urbano_' + trees.length + 'alberi_' + stamp;

    if (format === 'geojson') {
        var fc = {
            type: 'FeatureCollection',
            features: trees.map(function(t) {
                return {
                    type: 'Feature',
                    properties: Object.assign({}, t),
                    geometry: { type: 'Point', coordinates: [t.lon, t.lat] }
                };
            })
        };
        var blob = new Blob([JSON.stringify(fc, null, 2)], {type: 'application/geo+json'});
        downloadBlob(blob, filename + '.geojson');
        return;
    }

    // CSV (default)
    var keys = ['id', 'specie', 'sito', 'altezza', 'diametro', 'cpc', 'descrizione_cpc',
                'codice', 'descrizione', 'prezzo', 'odonimo', 'civico', 'upl', 'quartiere',
                'circoscrizione', 'progetto', 'ordinativo', 'lat', 'lon'];
    var rows = [keys.join(',')];
    function esc(v) {
        if (v === null || v === undefined) return '';
        var s = String(v).replace(/"/g, '""');
        if (/[,";\n\r]/.test(s)) s = '"' + s + '"';
        return s;
    }
    trees.forEach(function(t) {
        rows.push(keys.map(function(k) { return esc(t[k]); }).join(','));
    });
    var csv = '\uFEFF' + rows.join('\n');  // BOM for Excel
    var blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
    downloadBlob(blob, filename + '.csv');
}

function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        URL.revokeObjectURL(url);
        a.remove();
    }, 100);
}
