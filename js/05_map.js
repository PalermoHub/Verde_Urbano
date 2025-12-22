// ===== MAPPA =====
// Variabili globali per posizione iniziale
let initialView = {
    center: [38.147, 13.341],
    zoom: 15
};

function initMap() {
    map = L.map('map').setView(initialView.center, initialView.zoom);

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        minZoom: 14,
		maxZoom: 18
    });

    const ctrLayer = L.tileLayer('https://siciliahub.github.io/Tiles/ctr_pa_2k/{z}/{x}/{y}.png', {
        attribution: '© CTC 2k Palermo - by @gbvitrano',
		minZoom: 14,
        maxZoom: 18    });

	    const googleSatLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google',
		minZoom: 14,
        maxZoom: 18
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

// ===== MAPPA - UPDATE =====
function updateMap() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    filteredTrees.forEach(tree => {
        const color = cpcColors[tree.cpc] || '#95a5a6';
        const radius = Math.max(3, Math.min(tree.diametro ? tree.diametro / 8 : 6, 15));

        const marker = L.circleMarker([tree.lat, tree.lon], {
            radius: radius,
            fillColor: color,
            color: '#fff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(map);

        const popupContent = `
            <div style="font-family: Arial, sans-serif; font-size: 12px; min-width: 280px;">
                <div style="background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); color: white; padding: 10px; border-radius: 6px 6px 0 0; font-weight: bold; margin-bottom: 8px;">
                    <i class="fa fa-tree" aria-hidden="true"></i> Albero - ${tree.id}
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">Specie arborea:</td>
                        <td style="padding: 6px;">${tree.specie}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">Tipo foglia:</td>
                        <td style="padding: 6px;">${tree.tipo_foglia}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">Dimora:</td>
                        <td style="padding: 6px;">${tree.sito}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">Altezza:</td>
                        <td style="padding: 6px;">${tree.altezza ? tree.altezza + ' m' : 'n/a'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">Diametro:</td>
                        <td style="padding: 6px;">${tree.diametro ? tree.diametro + ' cm' : 'n/a'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">CPC:</td>
                        <td style="padding: 6px; color: ${cpcColors[tree.cpc]}; font-weight: bold;">${tree.cpc}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">Cod. lavorazione:</td>
                        <td style="padding: 6px;">${tree.codice}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">Tipo lavorazione:</td>
                        <td style="padding: 6px;">${tree.descrizione}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px; font-weight: bold; color: #27ae60;">Prezzo unitario:</td>
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
                <div style="margin-top: 10px;">
                    <button onclick="showTreeDetailsFromPopup('${tree.id}')" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-info-circle"></i>
                        <span>Visualizza Scheda Completa</span>
                    </button>
                </div>
            </div>
        `;
        marker.bindPopup(popupContent, {maxWidth: 400, className: 'custom-popup'});
        markers.push(marker);
    });

    if (filteredTrees.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.15), {maxZoom: 16});
    }
}

// Funzione per aprire i dettagli dell'albero dal popup
function showTreeDetailsFromPopup(treeId) {
    const tree = filteredTrees.find(t => t.id === treeId);
    if (tree) {
        map.closePopup(); // Chiudi il popup prima di aprire la modale
        showTreeDetails(tree);
    }
}
