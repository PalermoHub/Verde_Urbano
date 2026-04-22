// ===== MAPPA =====
// Variabili globali per posizione iniziale
let initialView = {
    center: [38.1266,13.3476],
    zoom: 14
};

function initMap() {
    map = L.map('map').setView(initialView.center, initialView.zoom);

    const osmLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap - Map tiles by cartodb.com - under ODbL - Elaborazione dati: by <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener"> @gbvitrano</a>',
        minZoom: 14,
		maxZoom: 20
    });

    const ctrLayer = L.tileLayer('https://siciliahub.github.io/Tiles/ctr_pa_2k/{z}/{x}/{y}.png', {
        attribution: '© CTC 2k Palermo - Elaborazione dati: by <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener"> @gbvitrano</a>',
		minZoom: 14,
        maxZoom: 20    });

	    const googleSatLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google - Elaborazione dati: by <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank" rel="noopener"> @gbvitrano</a>',
		minZoom: 14,
        maxZoom: 20
    });
    osmLayer.addTo(map);

    const baseMaps = {
        'OpenStreetMap': osmLayer,
        'CTC 2k Palermo': ctrLayer,
		'Google Satellite': googleSatLayer
    };

    L.control.layers(baseMaps).addTo(map);

    // Aggiungi Leaflet Hash per sincronizzare URL con posizione mappa
    if (typeof L.hash !== 'undefined') {
        new L.Hash(map);
    }

    // Aggiungi pulsante Home
    addHomeButton();

    // Aggiungi legenda CPC
    addCpcLegend();
    map.on('moveend', updateLegendContent);

    // Aggiungi evento click sulla mappa per deselezionare l'albero
    map.on('click', function(e) {
        // Deseleziona solo se c'è un albero selezionato
        // e se il click non è su un marker (il click sui marker viene gestito separatamente)
        if (selectedTree) {
            // Verifica che il click non sia su un marker
            let clickedOnMarker = false;
            markers.forEach(marker => {
                if (marker.getLatLng().distanceTo(e.latlng) < 20) { // 20 metri di tolleranza
                    clickedOnMarker = true;
                }
            });

            // Se non ha cliccato su un marker, deseleziona
            if (!clickedOnMarker) {
                clearSelectedTreeFilter();
            }
        }
    });

    // Aggiungi evento zoomend per aggiornare la dimensione dei marker in base al livello di zoom
    map.on('zoomend', function() {
        updateMarkerSizes();
    });

    console.log('✅ Mappa inizializzata');
}

// Aggiungi pulsante Home per tornare alla vista iniziale
function addHomeButton() {
    const HomeControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
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

// Funzione per filtrare tutto in base a un albero selezionato dalla mappa
function filterBySelectedTree(tree) {
    // Salva l'albero selezionato
    selectedTree = tree;

    // NON modifichiamo filteredTrees - manteniamo visibili tutti gli alberi sulla mappa
    // I grafici e le statistiche useranno solo selectedTree quando è impostato

    // Mostra il banner con informazioni sull'albero selezionato
    const banner = document.getElementById('selectedTreeBanner');
    const nameDiv = document.getElementById('selectedTreeName');
    if (banner && nameDiv) {
        nameDiv.textContent = `ID: ${tree.id} - ${tree.specie}`;
        banner.style.display = 'flex';
    }

    // Aggiorna tutti i componenti
    updateStats();
    updateCharts();
    updateMap();

    console.log('🎯 Filtrato per albero selezionato:', tree.id);
}

// Funzione per ripristinare i filtri normali
function clearSelectedTreeFilter() {
    selectedTree = null;
    selectedMarker = null;

    // Nascondi il banner
    const banner = document.getElementById('selectedTreeBanner');
    if (banner) {
        banner.style.display = 'none';
    }

    // Riapplica i filtri normali
    applyFilters();

    console.log('🔄 Filtro albero selezionato rimosso');
}

// Funzione per aggiornare solo le dimensioni dei marker senza ricrearli
function updateMarkerSizes() {
    const currentZoom = map.getZoom();

    markers.forEach(marker => {
        const tree = marker.treeData;
        if (!tree) return;

        // Calcola il nuovo raggio in base al livello di zoom
        let radius;
        if (currentZoom <= 15) {
            // Zoom 14-15: dimensione fissa per tutti i punti
            radius = 3;
        } else {
            // Zoom 16+: dimensione variabile in base al diametro
            radius = Math.max(3, Math.min(tree.diametro ? tree.diametro / 8 : 6, 15));
        }

        // Verifica se questo marker è quello selezionato
        const isSelected = selectedTree && selectedTree.id === tree.id;

        // Aggiorna solo il raggio del marker
        marker.setRadius(isSelected ? radius * 1.5 : radius);
    });
}

// ===== MAPPA - UPDATE =====
function updateMap() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // Ottieni il livello di zoom corrente
    const currentZoom = map.getZoom();

    filteredTrees.forEach(tree => {
        const color = cpcColors[tree.cpc] || '#95a5a6';

        // Calcola il raggio in base al livello di zoom
        let radius;
        if (currentZoom <= 15) {
            // Zoom 14-15: dimensione fissa per tutti i punti
            radius = 3;
        } else {
            // Zoom 16+: dimensione variabile in base al diametro
            radius = Math.max(3, Math.min(tree.diametro ? tree.diametro / 8 : 6, 15));
        }

        // Verifica se questo marker è quello selezionato
        const isSelected = selectedTree && selectedTree.id === tree.id;

        const marker = L.circleMarker([tree.lat, tree.lon], {
            radius: isSelected ? radius * 1.5 : radius,
            fillColor: color,
            color: isSelected ? '#FFD700' : '#fff',
            weight: isSelected ? 3 : 0.75,
            opacity: 1,
            fillOpacity: isSelected ? 1 : 0.85
        }).addTo(map);

        // Salva il riferimento all'albero nel marker
        marker.treeData = tree;

        const popupContent = `
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
                        <tr>
                            <td style="padding: 3px; font-weight: bold;">Strada:</td>
                            <td style="padding: 3px;">${tree.odonimo || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px; font-weight: bold;">Civico:</td>
                            <td style="padding: 3px;">${tree.civico || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px; font-weight: bold;">UPL:</td>
                            <td style="padding: 3px;">${tree.upl || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px; font-weight: bold;">Quartiere:</td>
                            <td style="padding: 3px;">${tree.quartiere || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px; font-weight: bold;">Circoscrizione:</td>
                            <td style="padding: 3px;">${tree.circoscrizione || '-'}</td>
                        </tr>
                    </table>
                </div>
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                    <button onclick="showTreeDetailsFromPopup('${tree.id}')" Title="Visualizza la scheda completa"style="flex: 1; padding: 10px; background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-info-circle"></i>
                        <span>Scheda Completa</span>
                    </button>
                    ${tree.geouri ? `<a href="${tree.geouri}" title="Naviga da Mobile" target="_blank" style="flex: 1; padding: 10px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Naviga</span>
                    </a>` : ''}
                </div>
            </div>
        `;
        marker.bindPopup(popupContent, {maxWidth: 400, className: 'custom-popup'});

        // Aggiungi tooltip con ID Pianta, Odonimo e Civico
        const tooltipContent = `${tree.id} - ${tree.odonimo || 'n/a'}${tree.civico && tree.civico !== '-' ? ', ' + tree.civico : ''}`;
        marker.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'top',
            className: 'custom-tooltip'
        });

        // Aggiungi evento click al marker per filtrare tutto per questo albero
        marker.on('click', function(e) {
            // Previeni il comportamento di default solo se non stiamo già visualizzando questo albero
            if (!selectedTree || selectedTree.id !== tree.id) {
                filterBySelectedTree(tree);
            }
        });

        markers.push(marker);
    });

    // Solo fai fitBounds se non c'è un albero selezionato
    if (filteredTrees.length > 0 && !selectedTree) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.15), {maxZoom: 16});
    }

    // Aggiorna la legenda con i nuovi conteggi
    updateLegendContent();
}

// Funzione per aprire i dettagli dell'albero dal popup
function showTreeDetailsFromPopup(treeId) {
    const tree = filteredTrees.find(t => t.id === treeId);
    if (tree) {
        map.closePopup(); // Chiudi il popup prima di aprire la modale
        showTreeDetails(tree);
    }
}

// Variabile globale per il controllo della legenda
let legendControl = null;

// Aggiungi legenda CPC sulla mappa
function addCpcLegend() {
    const LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
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

// Restituisce true se almeno un filtro è attivo
function isAnyFilterActive() {
    if (selectedTree !== null) return true;
    const filterIds = ['specieFilter', 'cpcFilter', 'siteFilter', 'odonimoFilter',
                       'civicoFilter', 'uplFilter', 'quartiereFilter',
                       'circoscrizioneFilter', 'puliziaFilter', 'faseFilter'];
    if (filterIds.some(id => { const el = document.getElementById(id); return el && el.value !== ''; })) return true;
    if (parseFloat(document.getElementById('minHeight').value) > 0) return true;
    if (parseFloat(document.getElementById('minDiameter').value) > 0) return true;
    return false;
}

// Restituisce gli alberi visibili nel viewport corrente
function getViewportTrees() {
    if (!map || !allTrees.length) return [];
    const bounds = map.getBounds();
    return allTrees.filter(t => t.lat && t.lon && bounds.contains([t.lat, t.lon]));
}

// Filtro CPC dalla legenda (toggle)
function filterByCpcLegend(cpcValue) {
    const cpcSelect = document.getElementById('cpcFilter');
    cpcSelect.value = (cpcSelect.value === cpcValue) ? '' : cpcValue;
    applyFilters();
}

// Aggiorna il contenuto della legenda con i conteggi
function updateLegendContent() {
    const container = document.getElementById('map-legend-cpc');
    if (!container) return;

    const viewportMode = !isAnyFilterActive();
    const sourceTrees = viewportMode ? getViewportTrees() : filteredTrees;

    const cpcCount = {B: 0, C: 0, 'C/D': 0, D: 0, 'Ceppaia': 0};
    sourceTrees.forEach(t => {
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

    const itemsHtml = legendDefs.map(item => {
        const isActive = activeCpc === item.key;
        const tipText = isActive ? 'Clicca per rimuovere il filtro' : 'Filtra per questa classe CPC';
        return `<div class="legend-item legend-item-clickable${isActive ? ' legend-item-active' : ''}"
                     style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;"
                     onclick="filterByCpcLegend('${item.key}')" title="${tipText}">
            <div style="display:flex;align-items:center;gap:8px;">
                <i class="fas fa-circle" style="color:${item.color};font-size:14px;"></i>
                <span style="color:#313131;font-size:11px;">${item.label}</span>
            </div>
            <span style="color:#313131;font-weight:bold;font-size:11px;">${cpcCount[item.key]}</span>
        </div>`;
    }).join('');

    const modeLabel = viewportMode
        ? '<i class="fas fa-eye"></i> Viewport'
        : '<i class="fas fa-filter"></i> Filtrati';

    container.innerHTML = `
        <h4><i class="fas fa-list-check"></i> Classificazione CPC</h4>
        ${itemsHtml}
        <div class="legend-mode-badge">${modeLabel}</div>
    `;
}
