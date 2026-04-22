// ===== MAPPA =====
let initialView = {
    center: [38.1266,13.3476],
    zoom: 14
};

const CLUSTER_DISABLE_ZOOM = 16;
let pruneCluster = null;

// Mappa CPC → indice categoria (ordine stabile)
const CPC_KEYS = ['B', 'C', 'C/D', 'D', 'Ceppaia'];
const CPC_CAT_COLORS = CPC_KEYS.map(k => cpcColors[k]);
const CPC_VAL_TO_CAT = {};
const CPC_CAT_TO_VAL = {};
CPC_KEYS.forEach(function(k, i) { CPC_VAL_TO_CAT[k] = i; CPC_CAT_TO_VAL[i] = k; });

const BASEMAPS_CONFIG = [
    { key: 'carto', label: 'CartoDB Chiaro', isDefault: true,
      thumbnail: 'https://a.basemaps.cartocdn.com/light_all/2/2/1.png',
      layer: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a> · Elaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener">@gbvitrano</a>',
          minZoom: 14, maxZoom: 20, subdomains: 'abcd'
      })
    },
    { key: 'ctr', label: 'CTC 2k Palermo', isDefault: false,
      thumbnail: 'img/ctc.jpg',
      layer: L.tileLayer('https://siciliahub.github.io/Tiles/ctr_pa_2k/{z}/{x}/{y}.png', {
          attribution: '© CTC 2k Palermo · Elaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener">@gbvitrano</a>',
          minZoom: 14, maxZoom: 20
      })
    },
    { key: 'google_satellite', label: 'Google Satellite', isDefault: false,
      thumbnail: 'https://mt0.google.com/vt/lyrs=s&x=2&y=1&z=2',
      layer: L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          attribution: '© <a href="https://maps.google.com">Google Maps</a> · Elaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener">@gbvitrano</a>',
          minZoom: 14, maxZoom: 20
      })
    }
];

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
    map = L.map('map').setView(initialView.center, initialView.zoom);

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

    addHomeButton();
    addCpcLegend();
    map.on('moveend', updateLegendContent);

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

    console.log('✅ Mappa inizializzata');
}

// ── Binding eventi per marker singolo nel cluster ──────────────────────────
function _bindClusterMarkerEvents(leafletMarker, tree) {
    const popupContent = _buildPopupContent(tree);
    leafletMarker.bindPopup(popupContent, { maxWidth: 400, className: 'custom-popup' });

    const tooltipContent = tree.id + ' - ' + (tree.odonimo || 'n/a')
        + (tree.civico && tree.civico !== '-' ? ', ' + tree.civico : '');
    leafletMarker.bindTooltip(tooltipContent, { permanent: false, direction: 'top', className: 'custom-tooltip' });

    leafletMarker.on('click', function() {
        if (!selectedTree || selectedTree.id !== tree.id) {
            filterBySelectedTree(tree);
        }
    });
}

// ── Costruisce il contenuto HTML del popup ─────────────────────────────────
function _buildPopupContent(tree) {
    return `
        <div style="font-family: Arial, sans-serif; font-size: 12px; min-width: 280px;">
            <div style="background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); color: white; padding: 10px; border-radius: 6px 6px 0 0; font-weight: bold; margin-bottom: 8px;">
                <i class="fa fa-tree" aria-hidden="true"></i> Albero - ${tree.id}
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">Specie arborea:</td>
                    <td style="padding: 6px;">${tree.specie}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">Tipo foglia:</td>
                    <td style="padding: 6px;">${tree.tipo_foglia}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">Dimora:</td>
                    <td style="padding: 6px;">${tree.sito}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">Altezza:</td>
                    <td style="padding: 6px;">${tree.altezza ? tree.altezza + ' m' : 'n/a'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">Diametro:</td>
                    <td style="padding: 6px;">${tree.diametro ? tree.diametro + ' cm' : 'n/a'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">CPC:</td>
                    <td style="padding: 6px; color: ${cpcColors[tree.cpc]}; font-weight: bold;">${tree.cpc}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">Cod. lavorazione:</td>
                    <td style="padding: 6px;">${tree.codice}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">Tipo lavorazione:</td>
                    <td style="padding: 6px;">${tree.descrizione}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; font-weight: bold; color: #313131;">Prezzo unitario:</td>
                    <td style="padding: 6px;">€ ${tree.prezzo.toFixed(2)}</td>
                </tr>
            </table>
            <div style="background: #f8f9fa; padding: 8px; margin-top: 8px; border-radius: 4px; border-left: 3px solid #3498db;">
                <div style="font-weight: bold; color: #3498db; margin-bottom: 4px;"><i class="fa fa-map-marker-alt"></i> LOCALIZZAZIONE</div>
                <table style="width: 100%; font-size: 11px;">
                    <tr><td style="padding: 3px; font-weight: bold;">Strada:</td><td style="padding: 3px;">${tree.odonimo || '-'}</td></tr>
                    <tr><td style="padding: 3px; font-weight: bold;">Civico:</td><td style="padding: 3px;">${tree.civico || '-'}</td></tr>
                    <tr><td style="padding: 3px; font-weight: bold;">UPL:</td><td style="padding: 3px;">${tree.upl || '-'}</td></tr>
                    <tr><td style="padding: 3px; font-weight: bold;">Quartiere:</td><td style="padding: 3px;">${tree.quartiere || '-'}</td></tr>
                    <tr><td style="padding: 3px; font-weight: bold;">Circoscrizione:</td><td style="padding: 3px;">${tree.circoscrizione || '-'}</td></tr>
                </table>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
                <button onclick="showTreeDetailsFromPopup('${tree.id}')" title="Visualizza la scheda completa" style="flex: 1; padding: 10px; background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fas fa-info-circle"></i><span>Scheda Completa</span>
                </button>
                ${tree.geouri ? `<a href="${tree.geouri}" title="Naviga da Mobile" target="_blank" style="flex: 1; padding: 10px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="fas fa-map-marker-alt"></i><span>Naviga</span></a>` : ''}
            </div>
        </div>
    `;
}

function addHomeButton() {
    const HomeControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('a', 'leaflet-control-home', container);
            button.innerHTML = '<i class="fas fa-home"></i>';
            button.href = '#';
            button.title = 'Torna alla vista iniziale';
            L.DomEvent.on(button, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                map.setView(initialView.center, initialView.zoom);
            });
            return container;
        }
    });
    map.addControl(new HomeControl());
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
    console.log('🎯 Filtrato per albero selezionato:', tree.id);
}

function clearSelectedTreeFilter() {
    selectedTree = null;
    selectedMarker = null;
    const banner = document.getElementById('selectedTreeBanner');
    if (banner) banner.style.display = 'none';
    applyFilters();
    console.log('🔄 Filtro albero selezionato rimosso');
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
            marker.bindPopup(_buildPopupContent(tree), { maxWidth: 400, className: 'custom-popup' });

            const tooltipContent = tree.id + ' - ' + (tree.odonimo || 'n/a')
                + (tree.civico && tree.civico !== '-' ? ', ' + tree.civico : '');
            marker.bindTooltip(tooltipContent, { permanent: false, direction: 'top', className: 'custom-tooltip' });

            marker.on('click', function(e) {
                if (!selectedTree || selectedTree.id !== tree.id) {
                    filterBySelectedTree(tree);
                }
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

    const viewportMode = !isAnyFilterActive();
    const sourceTrees = viewportMode ? getViewportTrees() : filteredTrees;

    const cpcCount = { B: 0, C: 0, 'C/D': 0, D: 0, 'Ceppaia': 0 };
    sourceTrees.forEach(function(t) {
        if (cpcCount.hasOwnProperty(t.cpc)) cpcCount[t.cpc]++;
    });

    const activeCpc = document.getElementById('cpcFilter') ? document.getElementById('cpcFilter').value : '';

    const legendDefs = [
        { key: 'B',       color: '#2cc15f', label: '<strong>B</strong> - Bassa'    },
        { key: 'C',       color: '#f39c12', label: '<strong>C</strong> - Moderata' },
        { key: 'C/D',     color: '#c164a1', label: '<strong>C/D</strong> - Elevata'},
        { key: 'D',       color: '#e74c3c', label: '<strong>D</strong> - Estrema'  },
        { key: 'Ceppaia', color: '#434343', label: '<strong>Ceppaia</strong>'       },
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

    const modeLabel = viewportMode
        ? '<i class="fas fa-eye"></i> Viewport'
        : '<i class="fas fa-filter"></i> Filtrati';

    container.innerHTML = '<h4><i class="fas fa-list-check"></i> Classificazione CPC</h4>'
        + itemsHtml
        + '<div class="legend-mode-badge">' + modeLabel + '</div>';
}
