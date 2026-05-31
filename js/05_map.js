// ===== MAPPA =====
let initialView = {
    center: [38.1266,13.3476],
    zoom: 13
};

const CLUSTER_DISABLE_ZOOM = 16;
let pruneCluster = null;

// Mappa CPC → indice categoria (ordine stabile)
const CPC_KEYS = ['B', 'C', 'C/D', 'D', 'Ceppaia', 'A', 'Vuoto', 'Verifica', 'Non Class', 'No Interv'];
const CPC_CAT_COLORS = CPC_KEYS.map(k => cpcColors[k]);
const CPC_VAL_TO_CAT = {};
const CPC_CAT_TO_VAL = {};
CPC_KEYS.forEach(function(k, i) { CPC_VAL_TO_CAT[k] = i; CPC_CAT_TO_VAL[i] = k; });

// ── Icona ciambella SVG per cluster aggregato ──────────────────────────────
function _buildDonutIcon(catColors, cluster) {
    const n     = cluster.population;
    const stats = cluster.stats || [];
    const total = stats.reduce(function(s, v) { return s + (v || 0); }, 0) || n;
    const SZ = 44, CX = 22, CY = 22, OR = 20, IR = 11;
    let paths = '';
    const nonEmpty = stats.filter(function(v) { return v > 0; });
    if (nonEmpty.length > 1) {
        let angle = -Math.PI / 2;
        stats.forEach(function(count, idx) {
            if (!count) return;
            const sweep = (count / total) * 2 * Math.PI;
            const end   = angle + sweep;
            const large = sweep > Math.PI ? 1 : 0;
            const cos0  = Math.cos(angle), sin0 = Math.sin(angle);
            const cos1  = Math.cos(end),   sin1 = Math.sin(end);
            const color = catColors[idx] || '#3388ff';
            paths += '<path d="'
                + 'M '  + (CX + OR * cos0).toFixed(2) + ' ' + (CY + OR * sin0).toFixed(2)
                + ' A ' + OR + ' ' + OR + ' 0 ' + large + ' 1 '
                        + (CX + OR * cos1).toFixed(2) + ' ' + (CY + OR * sin1).toFixed(2)
                + ' L ' + (CX + IR * cos1).toFixed(2) + ' ' + (CY + IR * sin1).toFixed(2)
                + ' A ' + IR + ' ' + IR + ' 0 ' + large + ' 0 '
                        + (CX + IR * cos0).toFixed(2) + ' ' + (CY + IR * sin0).toFixed(2)
                + ' Z" fill="' + color + '" stroke="#fff" stroke-width="0.8"/>';
            angle = end;
        });
    } else {
        const idx   = stats.findIndex(function(v) { return v > 0; });
        const color = catColors[idx >= 0 ? idx : 0] || '#3388ff';
        paths = '<circle cx="' + CX + '" cy="' + CY + '" r="' + OR + '" fill="' + color + '"/>'
              + '<circle cx="' + CX + '" cy="' + CY + '" r="' + IR + '" fill="white"/>';
    }
    const label = '<text x="' + CX + '" y="' + (CY + 4) + '" '
        + 'text-anchor="middle" font-family="Arial,sans-serif" '
        + 'font-size="' + (n > 99 ? 8 : 10) + '" font-weight="bold" fill="#333">'
        + n + '</text>';
    return L.divIcon({
        html: '<svg width="' + SZ + '" height="' + SZ + '" viewBox="0 0 ' + SZ + ' ' + SZ
            + '" xmlns="http://www.w3.org/2000/svg">' + paths + label + '</svg>',
        className: 'gs-donut-cluster', iconSize: L.point(SZ, SZ), iconAnchor: L.point(SZ / 2, SZ / 2),
    });
}

// ── Tooltip per ciambella cluster ──────────────────────────────────────────
function _clusterTooltipHtml(cluster, catColors, catToVal) {
    const n     = cluster.population;
    const stats = cluster.stats || [];
    if (!stats.some(function(v) { return v > 0; })) return null;
    let rows = '';
    stats.forEach(function(count, idx) {
        if (!count) return;
        const name  = catToVal[idx] !== undefined ? catToVal[idx] : ('cat. ' + idx);
        const color = catColors[idx] || '#888';
        const pct   = Math.round(count / n * 100);
        rows += '<tr>'
            + '<td><span style="display:inline-block;width:9px;height:9px;border-radius:50%;'
            + 'background:' + color + ';margin-right:5px;vertical-align:middle;"></span></td>'
            + '<td style="padding-right:10px;white-space:nowrap;">' + name + '</td>'
            + '<td style="text-align:right;font-weight:600;">' + count + '</td>'
            + '<td style="color:#999;padding-left:5px;">(' + pct + '%)</td>'
            + '</tr>';
    });
    return '<div style="font-size:11px;line-height:1.7;">'
        + '<div style="font-weight:700;margin-bottom:3px;padding-bottom:3px;'
        + 'border-bottom:1px solid #eee;">' + n + ' alberi</div>'
        + '<table style="border-collapse:collapse;">' + rows + '</table>'
        + '</div>';
}

function initMap() {
    map = L.map('map', { zoomControl: false }).setView(initialView.center, initialView.zoom);

    const BASEMAPS_CONFIG = [
        { key: 'carto', label: 'CartoDB Chiaro', isDefault: true,
          thumbnail: 'https://a.basemaps.cartocdn.com/light_all/2/2/1.png',
          layer: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a> · Elaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener">@gbvitrano</a>',
              minZoom: 13, maxZoom: 19, subdomains: 'abcd'
          })
        },
        { key: 'ctr', label: 'CTC 2k Palermo', isDefault: false,
          thumbnail: 'img/ctc.jpg',
          layer: L.tileLayer('https://siciliahub.github.io/Tiles/ctr_pa_2k/{z}/{x}/{y}.png', {
              attribution: '© CTC 2k Palermo · Elaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener">@gbvitrano</a>',
              minZoom: 13, maxZoom: 19
          })
        },
        { key: 'google_satellite', label: 'Google Satellite', isDefault: false,
          thumbnail: 'https://mt0.google.com/vt/lyrs=s&x=2&y=1&z=2',
          layer: L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
              attribution: '© <a href="https://maps.google.com">Google Maps</a> · Elaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener">@gbvitrano</a>',
              minZoom: 13, maxZoom: 19
          })
        }
    ];

    // ── Basemap gallery ────────────────────────────────────────────────────
    let activeBasemap = (BASEMAPS_CONFIG.find(function(b) { return b.isDefault; }) || BASEMAPS_CONFIG[0]).layer.addTo(map);
    activeBasemap.bringToBack();

    L.Control.BasemapGallery = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function(m) {
            const c = L.DomUtil.create('div', 'basemap-gallery bm-horizontal');
            L.DomEvent.disableClickPropagation(c);
            L.DomEvent.disableScrollPropagation(c);
            BASEMAPS_CONFIG.forEach(function(bm) {
                const item = L.DomUtil.create('div', 'bm-item bm-square' + (bm.isDefault ? ' active' : ''), c);
                item.title = bm.label;
                const img = L.DomUtil.create('img', 'bm-thumb', item);
                img.src = bm.thumbnail; img.alt = bm.label;
                img.onerror = function() { img.style.display = 'none'; item.style.background = '#ddd'; };
                const lbl = L.DomUtil.create('span', 'bm-label', item);
                lbl.textContent = bm.label;
                item.addEventListener('click', function() {
                    m.removeLayer(activeBasemap);
                    activeBasemap = bm.layer.addTo(m);
                    activeBasemap.bringToBack();
                    c.querySelectorAll('.bm-item').forEach(function(el) { el.classList.remove('active'); });
                    item.classList.add('active');
                });
            });
            return c;
        }
    });
    new L.Control.BasemapGallery().addTo(map);

    // ── PruneCluster ───────────────────────────────────────────────────────
    if (typeof PruneClusterForLeaflet !== 'undefined') {
        pruneCluster = new PruneClusterForLeaflet(200);

        pruneCluster.BuildLeafletClusterIcon = function(cluster) {
            return _buildDonutIcon(CPC_CAT_COLORS, cluster);
        };

        pruneCluster.PrepareLeafletMarker = function(leafletMarker, data) {
            const tree = data.tree;
            if (!tree) return;
            const color = cpcColors[tree.cpc] || '#95a5a6';
            const r = 8, d = r * 2;
            leafletMarker.setIcon(L.divIcon({
                html: '<svg width="' + d + '" height="' + d + '" viewBox="0 0 ' + d + ' ' + d
                    + '" xmlns="http://www.w3.org/2000/svg">'
                    + '<circle cx="' + r + '" cy="' + r + '" r="' + (r - 0.5) + '" '
                    + 'fill="' + color + '" fill-opacity="0.85" stroke="#fff" stroke-width="0.75"/>'
                    + '</svg>',
                className: '',
                iconSize: [d, d],
                iconAnchor: [r, r],
                popupAnchor: [0, -r],
            }));
            leafletMarker.off();
            _bindClusterMarkerEvents(leafletMarker, tree);
        };

        const _origBuildCluster = pruneCluster.BuildLeafletCluster.bind(pruneCluster);
        pruneCluster.BuildLeafletCluster = function(cluster, position) {
            const m = _origBuildCluster(cluster, position);
            const html = _clusterTooltipHtml(cluster, CPC_CAT_COLORS, CPC_CAT_TO_VAL);
            if (html && m && m.bindTooltip) {
                m.bindTooltip(html, { className: 'gs-cluster-tt', direction: 'top', sticky: false, opacity: 1 });
            }
            return m;
        };

        map.addLayer(pruneCluster);
    }

    // ── Leaflet Hash ───────────────────────────────────────────────────────
    if (typeof L.hash !== 'undefined') {
        new L.Hash(map);
    }

    addZoomBar();
    addCpcLegend();
    map.on('moveend', updateLegendContent);

    map.on('popupopen', function(e) {
        setTimeout(function() {
            if (!e.popup._container) return;
            var px = map.project(e.popup.getLatLng());
            px.y -= e.popup._container.clientHeight / 2 + 10;
            map.panTo(map.unproject(px), { animate: true, duration: 0.25 });
        }, 0);
    });

    map.on('click', function(e) {
        if (selectedTree) {
            let clickedOnMarker = false;
            markers.forEach(function(marker) {
                if (marker.getLatLng().distanceTo(e.latlng) < 20) {
                    clickedOnMarker = true;
                }
            });
            if (!clickedOnMarker) {
                clearSelectedTreeFilter();
            }
        }
    });

    // zoomend: cambia modalità cluster↔punti, NON ricalcola fitBounds
    map.on('zoomend', function() {
        updateMap(true);
        updateLegendContent();
    });

    window.VU_DEBUG && console.log('✅ Mappa inizializzata');
}

// ── Binding eventi per marker singolo nel cluster ──────────────────────────
function _bindClusterMarkerEvents(leafletMarker, tree) {
    const popupContent = _buildPopupContent(tree);

    const tooltipContent = tree.id + ' - ' + (tree.odonimo || 'n/a')
        + (tree.civico && tree.civico !== '-' ? ', ' + tree.civico : '');
    leafletMarker.bindTooltip(tooltipContent, { permanent: false, direction: 'top', className: 'custom-tooltip' });

    leafletMarker.on('click', function(e) {
        L.DomEvent.stopPropagation(e.originalEvent);
        if (!selectedTree || selectedTree.id !== tree.id) {
            filterBySelectedTree(tree);
        }
        L.popup({ maxWidth: 400, className: 'custom-popup' })
            .setLatLng([tree.lat, tree.lon])
            .setContent(popupContent)
            .openOn(map);
    });
}

// ── Costruisce il contenuto HTML del popup ─────────────────────────────────
function _buildPopupContent(tree) {
    const row = (label, value, valueClass) =>
        `<tr><th>${label}</th><td${valueClass ? ' class="' + valueClass + '"' : ''}${valueClass === 'vu-popup__cpc' ? ' style="color:' + (cpcColors[tree.cpc] || '#666') + '"' : ''}>${value}</td></tr>`;
    const projRow = (label, value) => `<tr><th>${label}</th><td>${value}</td></tr>`;
    const hasProgetto = (tree.progetto && tree.progetto !== '-') || (tree.ordinativo && tree.ordinativo !== '-');
    return `
        <div class="vu-popup">
            <div class="vu-popup__header">
                <i class="fa fa-tree" aria-hidden="true"></i> Albero — ${tree.id}
            </div>
            ${hasProgetto ? `
            <div class="vu-popup__section vu-popup__section--progetto">
                <div class="vu-popup__section-title"><i class="fas fa-folder-open"></i> Progetto</div>
                <table class="vu-popup__mini">
                    ${tree.progetto && tree.progetto !== '-' ? projRow('Accordo quadro:', tree.progetto) : ''}
                    ${tree.ordinativo && tree.ordinativo !== '-' ? projRow('Ordinativo:', tree.ordinativo) : ''}
                </table>
            </div>` : ''}
            <table class="vu-popup__table">
                ${row('Specie arborea:', tree.specie || '—')}
                ${row('Tipo foglia:',   tree.tipo_foglia || '—')}
                ${row('Dimora:',        tree.sito || '—')}
                ${row('Altezza:',       tree.altezza ? tree.altezza + ' m' : 'n/a')}
                ${row('Diametro:',      tree.diametro ? tree.diametro + ' cm' : 'n/a')}
                ${row('CPC:',           tree.cpc || '—', 'vu-popup__cpc')}
                ${row('Cod. lavorazione:', tree.codice || '—')}
                ${row('Tipo lavorazione:', tree.descrizione || '—')}
                ${row('Prezzo unitario:',  '€ ' + (tree.prezzo || 0).toFixed(2))}
            </table>
            <div class="vu-popup__section vu-popup__section--loc">
                <div class="vu-popup__section-title"><i class="fa fa-map-marker-alt"></i> Localizzazione</div>
                <table class="vu-popup__mini">
                    ${projRow('Strada:', tree.odonimo || '-')}
                    ${projRow('Civico:', tree.civico || '-')}
                    ${projRow('UPL:', tree.upl || '-')}
                    ${projRow('Quartiere:', tree.quartiere || '-')}
                    ${projRow('Circoscrizione:', tree.circoscrizione || '-')}
                </table>
            </div>
            <div class="vu-popup__actions">
                <button class="vu-popup__btn vu-popup__btn--primary" onclick="showTreeDetailsFromPopup('${tree.id}')" title="Visualizza la scheda completa">
                    <i class="fas fa-info-circle"></i><span>Scheda completa</span>
                </button>
                ${tree.geouri ? `<a class="vu-popup__btn vu-popup__btn--nav" href="${tree.geouri}" target="_blank" rel="noopener" title="Naviga da Mobile"><i class="fas fa-route"></i><span>Naviga</span></a>` : ''}
            </div>
        </div>
    `;
}

function addZoomBar() {
    const el = document.createElement('div');
    el.className = 'zoom-bar-control';
    el.id = 'zoomBarControl';
    const initZ = Math.min(18, Math.max(13, map.getZoom()));

    el.innerHTML = `
        <button class="zoom-bar-home" title="Torna alla vista iniziale" aria-label="Vista iniziale">
            <i class="fas fa-home"></i>
        </button>
        <button class="zoom-bar-locate" title="La mia posizione" aria-label="Centra mappa sulla mia posizione">
            <i class="fas fa-location-crosshairs"></i>
        </button>
        <button class="zoom-bar-time" title="Periodo lavorazione (F1→F2→F3)" aria-label="Apri filtro periodo lavorazione" onclick="document.getElementById('vuTSToggle').click()">
            <i class="fas fa-clock-rotate-left"></i>
        </button>
        <div class="zoom-bar-sep"></div>
        <i class="fas fa-magnifying-glass zoom-bar-icon-sm"></i>
        <div class="zoom-bar-track-wrap">
            <input type="range" class="zoom-bar-slider" id="zoomBarSlider"
                   min="13" max="18" step="1" value="${initZ}">
            <div class="zoom-bar-ticks">
                <span>13</span><span>14</span><span>15</span>
                <span>16</span><span>17</span><span>18</span>
            </div>
        </div>
        <span class="zoom-bar-level" id="zoomBarLevel">${initZ}</span>
    `;

    document.getElementById('map').appendChild(el);
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);

    function updateFill(slider) {
        const pct = ((parseInt(slider.value) - 13) / 5) * 100;
        slider.style.background =
            `linear-gradient(to right,#27ae60 ${pct}%,#ddd ${pct}%)`;
    }

    const slider = document.getElementById('zoomBarSlider');
    updateFill(slider);

    // ── Locate me ──
    let _userMarker = null;
    let _userAcc = null;
    const locateBtn = el.querySelector('.zoom-bar-locate');
    if (locateBtn) {
        locateBtn.addEventListener('click', function() {
            locateBtn.classList.add('locating');
            map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true, timeout: 10000 });
        });
        map.on('locationfound', function(ev) {
            locateBtn.classList.remove('locating');
            if (_userMarker) map.removeLayer(_userMarker);
            if (_userAcc) map.removeLayer(_userAcc);
            _userAcc = L.circle(ev.latlng, { radius: ev.accuracy, color: '#2c7bbf', weight: 1, fillOpacity: 0.08 }).addTo(map);
            _userMarker = L.circleMarker(ev.latlng, {
                radius: 8, color: '#fff', weight: 2,
                fillColor: '#2c7bbf', fillOpacity: 1
            }).addTo(map).bindPopup('Sei qui (precisione &plusmn;' + Math.round(ev.accuracy) + ' m)').openPopup();
        });
        map.on('locationerror', function(ev) {
            locateBtn.classList.remove('locating');
            alert('Impossibile ottenere la posizione: ' + ev.message);
        });
    }

    el.querySelector('.zoom-bar-home').addEventListener('click', function() {
        const source = (filteredTrees && filteredTrees.length) ? filteredTrees : allTrees;
        const valid = source.filter(function(t) { return t.lat && t.lon; });
        if (valid.length > 0) {
            const lats = valid.map(function(t) { return t.lat; });
            const lons = valid.map(function(t) { return t.lon; });
            map.fitBounds(
                [[Math.min.apply(null,lats), Math.min.apply(null,lons)],
                 [Math.max.apply(null,lats), Math.max.apply(null,lons)]],
                { padding: [30, 30] }
            );
        } else {
            map.setView(initialView.center, initialView.zoom);
        }
    });

    slider.addEventListener('input', function() {
        map.setZoom(parseInt(this.value, 10));
        updateFill(this);
    });

    map.on('zoomend', function() {
        const z = map.getZoom();
        const s = document.getElementById('zoomBarSlider');
        const l = document.getElementById('zoomBarLevel');
        if (s) { s.value = Math.min(18, Math.max(13, z)); updateFill(s); }
        if (l) l.textContent = z;
    });
}

function filterBySelectedTree(tree) {
    selectedTree = tree;
    const banner = document.getElementById('selectedTreeBanner');
    const nameDiv = document.getElementById('selectedTreeName');
    if (banner && nameDiv) {
        nameDiv.textContent = 'ID: ' + tree.id + ' - ' + tree.specie;
        banner.style.display = 'flex';
    }
    updateStats();
    updateCharts();
    updateMap();
    window.VU_DEBUG && console.log('🎯 Filtrato per albero selezionato:', tree.id);
}

function clearSelectedTreeFilter() {
    selectedTree = null;
    selectedMarker = null;
    const banner = document.getElementById('selectedTreeBanner');
    if (banner) banner.style.display = 'none';
    applyFilters();
    window.VU_DEBUG && console.log('🔄 Filtro albero selezionato rimosso');
}

// ── Aggiorna dimensioni circleMarker (solo in modalità punto) ──────────────
function updateMarkerSizes() {
    const currentZoom = map.getZoom();
    markers.forEach(function(marker) {
        const tree = marker.treeData;
        if (!tree) return;
        let radius;
        if (currentZoom <= 15) {
            radius = 3;
        } else {
            radius = Math.max(3, Math.min(tree.diametro ? tree.diametro / 8 : 6, 15));
        }
        const isSelected = selectedTree && selectedTree.id === tree.id;
        marker.setRadius(isSelected ? radius * 1.5 : radius);
    });
}

// ===== MAPPA - UPDATE =====
// skipFitBounds=true quando chiamata da zoomend per evitare di resettare la vista
function updateMap(skipFitBounds) {
    const currentZoom = map.getZoom();
    const useCluster = pruneCluster && currentZoom < CLUSTER_DISABLE_ZOOM;

    if (useCluster) {
        // ── Modalità cluster ───────────────────────────────────────────────
        markers.forEach(function(m) { map.removeLayer(m); });
        markers = [];

        pruneCluster.RemoveMarkers();

        filteredTrees.forEach(function(tree) {
            if (!tree.lat || !tree.lon) return;
            const pm = new PruneCluster.Marker(tree.lat, tree.lon);
            pm.data.tree = tree;
            pm.category = CPC_VAL_TO_CAT[tree.cpc] !== undefined ? CPC_VAL_TO_CAT[tree.cpc] : 0;
            pruneCluster.RegisterMarker(pm);
        });

        pruneCluster.ProcessView();

        if (!skipFitBounds && filteredTrees.length > 0 && !selectedTree) {
            const valid = filteredTrees.filter(function(t) { return t.lat && t.lon; });
            if (valid.length > 0) {
                const lats = valid.map(function(t) { return t.lat; });
                const lons = valid.map(function(t) { return t.lon; });
                map.fitBounds(
                    [[Math.min.apply(null, lats), Math.min.apply(null, lons)],
                     [Math.max.apply(null, lats), Math.max.apply(null, lons)]],
                    { padding: [24, 24], maxZoom: CLUSTER_DISABLE_ZOOM - 1 }
                );
            }
        }

    } else {
        // ── Modalità punti (zoom ≥ CLUSTER_DISABLE_ZOOM) ──────────────────
        if (pruneCluster) pruneCluster.RemoveMarkers();

        markers.forEach(function(m) { map.removeLayer(m); });
        markers = [];

        filteredTrees.forEach(function(tree) {
            const color = cpcColors[tree.cpc] || '#95a5a6';
            let radius;
            if (currentZoom <= 15) {
                radius = 3;
            } else {
                radius = Math.max(3, Math.min(tree.diametro ? tree.diametro / 8 : 6, 15));
            }
            const isSelected = selectedTree && selectedTree.id === tree.id;

            const marker = L.circleMarker([tree.lat, tree.lon], {
                radius: isSelected ? radius * 1.5 : radius,
                fillColor: color,
                color: isSelected ? '#FFD700' : '#fff',
                weight: isSelected ? 3 : 0.75,
                opacity: 1,
                fillOpacity: isSelected ? 1 : 0.85
            }).addTo(map);

            marker.treeData = tree;

            const tooltipContent = tree.id + ' - ' + (tree.odonimo || 'n/a')
                + (tree.civico && tree.civico !== '-' ? ', ' + tree.civico : '');
            marker.bindTooltip(tooltipContent, { permanent: false, direction: 'top', className: 'custom-tooltip' });

            marker.on('click', function(e) {
                L.DomEvent.stopPropagation(e.originalEvent);
                if (!selectedTree || selectedTree.id !== tree.id) {
                    filterBySelectedTree(tree);
                }
                L.popup({ maxWidth: 400, className: 'custom-popup' })
                    .setLatLng([tree.lat, tree.lon])
                    .setContent(_buildPopupContent(tree))
                    .openOn(map);
            });

            markers.push(marker);
        });

        if (!skipFitBounds && filteredTrees.length > 0 && !selectedTree) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 18 });
        }
    }

    updateLegendContent();
}

function showTreeDetailsFromPopup(treeId) {
    const tree = filteredTrees.find(function(t) { return t.id === treeId; });
    if (tree) {
        map.closePopup();
        showTreeDetails(tree);
    }
}

// ── Legenda CPC ────────────────────────────────────────────────────────────
let legendControl = null;
let legendCollapsed = false;

function toggleLegend() {
    legendCollapsed = !legendCollapsed;
    updateLegendContent();
}

function addCpcLegend() {
    const LegendControl = L.Control.extend({
        options: { position: 'bottomleft' },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control-legend');
            container.id = 'map-legend-cpc';
            updateLegendContent();
            return container;
        }
    });
    legendControl = new LegendControl();
    map.addControl(legendControl);
}

function isAnyFilterActive() {
    if (selectedTree !== null) return true;
    const filterIds = ['specieFilter', 'cpcFilter', 'siteFilter', 'odonimoFilter',
                       'civicoFilter', 'uplFilter', 'quartiereFilter',
                       'circoscrizioneFilter', 'puliziaFilter', 'faseFilter'];
    if (filterIds.some(function(id) { const el = document.getElementById(id); return el && el.value !== ''; })) return true;
    if (parseFloat(document.getElementById('minHeight').value) > 0) return true;
    if (parseFloat(document.getElementById('minDiameter').value) > 0) return true;
    return false;
}

function getViewportTrees() {
    if (!map || !allTrees.length) return [];
    const bounds = map.getBounds();
    return allTrees.filter(function(t) { return t.lat && t.lon && bounds.contains([t.lat, t.lon]); });
}

function filterByCpcLegend(cpcValue) {
    const cpcSelect = document.getElementById('cpcFilter');
    cpcSelect.value = (cpcSelect.value === cpcValue) ? '' : cpcValue;
    applyFilters();
}

function updateLegendContent() {
    const container = document.getElementById('map-legend-cpc');
    if (!container) return;

    // Nasconde la legenda quando nessun progetto è selezionato (nessun albero visibile)
    if (typeof filteredTrees !== 'undefined' && filteredTrees.length === 0 &&
        typeof allTrees !== 'undefined' && allTrees.length > 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = '';

    const viewportMode = !isAnyFilterActive();
    const sourceTrees = viewportMode ? getViewportTrees() : filteredTrees;

    const cpcCount = { B: 0, C: 0, 'C/D': 0, D: 0, 'Ceppaia': 0, A: 0, 'Vuoto': 0, 'Verifica': 0, 'Non Class': 0, 'No Interv': 0 };
    sourceTrees.forEach(function(t) {
        if (cpcCount.hasOwnProperty(t.cpc)) cpcCount[t.cpc]++;
    });

    const activeCpc = document.getElementById('cpcFilter') ? document.getElementById('cpcFilter').value : '';

    const legendDefs = [
        { key: 'A',         color: '#00ff00', label: '<strong>A</strong> - Trascurabile',              tip: 'Classe A - Trascurabile'          },
        { key: 'B',         color: '#2cc15f', label: '<strong>B</strong> - Bassa',                     tip: 'Classe B - Bassa'                 },
        { key: 'C',         color: '#f39c12', label: '<strong>C</strong> - Moderata',                  tip: 'Classe C - Moderata'              },
        { key: 'C/D',       color: '#c164a1', label: '<strong>C/D</strong> - Elevata',                 tip: 'Classe C/D - Elevata'             },
        { key: 'D',         color: '#e74c3c', label: '<strong>D</strong> - Estrema',                   tip: 'Classe D - Estrema'               },
        { key: 'Ceppaia',   color: '#434343', label: '<strong>Ceppaia</strong>',                        tip: 'Ceppaia'                          },
        { key: 'Vuoto',     color: '#ffff00', label: '<strong>Vuoto</strong> - Cercine vuoto',          tip: 'Vuoto - Cercine vuoto'            },
        { key: 'Verifica',  color: '#9fc5e8', label: '<strong>Verifica</strong> - Da verificare',       tip: 'Verifica - Da verificare'         },
        { key: 'Non Class', color: '#990000', label: '<strong>Non Class</strong> - Non Classificato',   tip: 'Non Class - Non Classificato'     },
        { key: 'No Interv', color: '#f4cccc', label: '<strong>No Interv</strong> - Nessun Intervento',  tip: 'No Interv - Nessun Intervento'    },
    ];

    const itemsHtml = legendDefs.map(function(item) {
        const isActive = activeCpc === item.key;
        const tipText = isActive ? 'Clicca per rimuovere il filtro' : 'Filtra per questa classe CPC';
        return '<div class="legend-item legend-item-clickable' + (isActive ? ' legend-item-active' : '') + '"'
            + ' style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;"'
            + ' onclick="filterByCpcLegend(\'' + item.key + '\')" title="' + tipText + '">'
            + '<div style="display:flex;align-items:center;gap:8px;">'
            + '<i class="fas fa-circle" style="color:' + item.color + ';font-size:14px;"></i>'
            + '<span style="color:#313131;font-size:11px;">' + item.label + '</span>'
            + '</div>'
            + '<span style="color:#313131;font-weight:bold;font-size:11px;">' + cpcCount[item.key] + '</span>'
            + '</div>';
    }).join('');

    const miniItemsHtml = legendDefs.map(function(item) {
        const isActive = activeCpc === item.key;
        const miniTip = item.tip + ' - ' + cpcCount[item.key];
        return '<div class="legend-mini-item' + (isActive ? ' legend-mini-item-active' : '') + '"'
            + ' onclick="filterByCpcLegend(\'' + item.key + '\')" title="' + miniTip + '">'
            + '<i class="fas fa-circle" style="color:' + item.color + ';font-size:12px;flex-shrink:0;"></i>'
            + '<span class="legend-mini-label">' + item.key + '</span>'
            + '<span class="legend-mini-count">' + cpcCount[item.key] + '</span>'
            + '</div>';
    }).join('');

    const modeLabel = viewportMode
        ? '<i class="fas fa-eye"></i> Viewport'
        : '<i class="fas fa-filter"></i> Filtrati';
    const modeLabelMini = viewportMode
        ? '<i class="fas fa-eye" title="Viewport"></i>'
        : '<i class="fas fa-filter" title="Filtrati"></i>';

    const chevron = legendCollapsed ? 'fa-chevron-right' : 'fa-chevron-left';
    const toggleTitle = legendCollapsed ? 'Espandi legenda' : 'Comprimi legenda';

    container.innerHTML =
        '<div class="legend-header">'
        + '<h4 class="legend-title"><i class="fas fa-list-check"></i><span class="legend-title-full"> Classificazione </span> CPC</h4>'
        + '<button class="legend-toggle-btn" onclick="toggleLegend()" title="' + toggleTitle + '">'
        + '<i class="fas ' + chevron + '"></i></button>'
        + '</div>'
        + '<div class="legend-full-body">'
        + itemsHtml
        + '<div class="legend-mode-badge">' + modeLabel + '</div>'
        + '</div>'
        + '<div class="legend-mini-body">'
        + miniItemsHtml
        + '<div class="legend-mode-mini">' + modeLabelMini + '</div>'
        + '</div>';

    if (legendCollapsed) {
        container.classList.add('legend-collapsed');
    } else {
        container.classList.remove('legend-collapsed');
    }
}
