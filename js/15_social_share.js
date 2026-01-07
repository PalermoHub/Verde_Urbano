/**
 * MODULO CONDIVISIONE SOCIAL CON STATO COMPLETO
 * Gestisce la condivisione su social network preservando:
 * - Posizione mappa (zoom, lat, lng)
 * - Filtri attivi
 * - Albero selezionato
 * - Pagina e paragrafo corrente
 */

// Funzione per ottenere lo stato completo dell'applicazione
function getApplicationState() {
    const state = {
        page: window.location.pathname.split('/').pop() || 'index.html',
        hash: window.location.hash.substring(1), // Rimuove il #
        filters: {},
        mapState: null,
        selectedTree: null,
        scrollPosition: null
    };

    // Solo per la pagina index.html (dashboard con mappa)
    if (state.page === 'index.html' || state.page === '') {
        // Stato mappa (se esiste)
        if (typeof map !== 'undefined' && map) {
            const center = map.getCenter();
            state.mapState = {
                zoom: map.getZoom(),
                lat: center.lat.toFixed(6),
                lng: center.lng.toFixed(6)
            };
        }

        // Filtri attivi
        const filterElements = {
            odonimo: 'odonimoFilter',
            specie: 'specieFilter',
            cpc: 'cpcFilter',
            sito: 'siteFilter',
            upl: 'uplFilter',
            quartiere: 'quartiereFilter',
            circoscrizione: 'circoscrizioneFilter',
            fase: 'faseFilter',
            pulizia: 'puliziaFilter',
            minHeight: 'minHeight',
            minDiameter: 'minDiameter'
        };

        for (const [key, elementId] of Object.entries(filterElements)) {
            const element = document.getElementById(elementId);
            if (element && element.value) {
                state.filters[key] = element.value;
            }
        }

        // Albero selezionato
        if (typeof selectedTree !== 'undefined' && selectedTree) {
            state.selectedTree = {
                id: selectedTree.id,
                specie: selectedTree.specie
            };
        }
    } else {
        // Per le altre pagine, cattura l'anchor (paragrafo) se presente
        if (window.location.hash) {
            state.scrollPosition = window.location.hash.substring(1);
        }
    }

    return state;
}

// Funzione per generare URL condivisibile
function generateShareableURL() {
    const state = getApplicationState();
    const baseURL = window.location.origin + window.location.pathname;

    // Costruisci i parametri query
    const params = new URLSearchParams();

    // Aggiungi filtri (solo se presenti)
    for (const [key, value] of Object.entries(state.filters)) {
        if (value && value !== '' && value !== '0') {
            params.append(key, value);
        }
    }

    // Aggiungi albero selezionato
    if (state.selectedTree) {
        params.append('treeId', state.selectedTree.id);
    }

    // Costruisci URL
    let url = baseURL;

    const queryString = params.toString();
    if (queryString) {
        url += '?' + queryString;
    }

    // Aggiungi hash (mappa o paragrafo)
    if (state.page === 'index.html' || state.page === '') {
        if (state.mapState) {
            url += `#${state.mapState.zoom}/${state.mapState.lat}/${state.mapState.lng}`;
        }
    } else if (state.scrollPosition) {
        url += '#' + state.scrollPosition;
    } else if (state.hash) {
        url += '#' + state.hash;
    }

    return url;
}

// Funzione per ripristinare lo stato dall'URL
function restoreApplicationState() {
    const params = new URLSearchParams(window.location.search);
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Solo per la pagina index.html
    if (currentPage === 'index.html' || currentPage === '') {
        // Ripristina filtri
        const filterMapping = {
            odonimo: 'odonimoFilter',
            specie: 'specieFilter',
            cpc: 'cpcFilter',
            sito: 'siteFilter',
            upl: 'uplFilter',
            quartiere: 'quartiereFilter',
            circoscrizione: 'circoscrizioneFilter',
            fase: 'faseFilter',
            pulizia: 'puliziaFilter',
            minHeight: 'minHeight',
            minDiameter: 'minDiameter'
        };

        let hasFilters = false;

        for (const [param, elementId] of Object.entries(filterMapping)) {
            if (params.has(param)) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.value = params.get(param);
                    hasFilters = true;
                }
            }
        }

        // Applica filtri se presenti
        if (hasFilters && typeof applyFilters === 'function') {
            // Attendi che la mappa e i dati siano caricati
            if (typeof map !== 'undefined' && map && allTrees && allTrees.length > 0) {
                applyFilters();
            } else {
                // Ritenta dopo un breve delay
                setTimeout(() => {
                    if (typeof applyFilters === 'function') {
                        applyFilters();
                    }
                }, 1000);
            }
        }

        // Seleziona albero specifico se presente
        if (params.has('treeId')) {
            const treeId = params.get('treeId');
            setTimeout(() => {
                if (typeof allTrees !== 'undefined' && allTrees.length > 0) {
                    const tree = allTrees.find(t => t.id === treeId);
                    if (tree && typeof filterBySelectedTree === 'function') {
                        filterBySelectedTree(tree);
                    }
                }
            }, 1500);
        }

        // La posizione mappa viene gestita automaticamente da leaflet-hash
    }
    // Per altre pagine, lo scroll all'anchor è automatico del browser
}

// Funzione per ottenere il titolo della condivisione
function getShareTitle() {
    const state = getApplicationState();
    let title = document.title;

    // Personalizza il titolo in base allo stato
    if (state.page === 'index.html' || state.page === '') {
        const activeFilters = Object.keys(state.filters).length;
        if (activeFilters > 0) {
            title = `Verde Urbano Palermo - ${activeFilters} filtro${activeFilters > 1 ? 'i' : ''} attivo${activeFilters > 1 ? 'i' : ''}`;

            // Aggiungi dettagli specifici
            if (state.filters.odonimo) {
                title = `Verde Urbano - ${state.filters.odonimo}`;
            } else if (state.filters.quartiere) {
                title = `Verde Urbano - Quartiere ${state.filters.quartiere}`;
            } else if (state.filters.circoscrizione) {
                title = `Verde Urbano - ${state.filters.circoscrizione}`;
            }
        }

        if (state.selectedTree) {
            title = `Verde Urbano - Albero #${state.selectedTree.id} (${state.selectedTree.specie})`;
        }
    }

    return title;
}

// Funzione per ottenere la descrizione della condivisione
function getShareDescription() {
    const state = getApplicationState();
    let description = 'Rigenerazione del Verde Urbano di Palermo';

    if (state.page === 'index.html' || state.page === '') {
        const filters = [];
        if (state.filters.odonimo) filters.push(`Strada: ${state.filters.odonimo}`);
        if (state.filters.specie) filters.push(`Specie: ${state.filters.specie}`);
        if (state.filters.cpc) filters.push(`Stato: ${state.filters.cpc}`);
        if (state.filters.quartiere) filters.push(`Quartiere: ${state.filters.quartiere}`);

        if (filters.length > 0) {
            description += ' - ' + filters.join(', ');
        }

        if (state.selectedTree) {
            description = `Albero #${state.selectedTree.id} - ${state.selectedTree.specie}`;
        }
    }

    return description;
}

// Funzioni per aprire condivisione su vari social network
function shareOnFacebook() {
    const url = generateShareableURL();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const url = generateShareableURL();
    const title = getShareTitle();
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
    const url = generateShareableURL();
    const title = getShareTitle();
    const text = `${title}\n${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
}

function shareOnTelegram() {
    const url = generateShareableURL();
    const title = getShareTitle();
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareOnBluesky() {
    const url = generateShareableURL();
    const title = getShareTitle();
    const text = `${title}\n${url}`;
    const shareUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=600');
}

function shareViaEmail() {
    const url = generateShareableURL();
    const title = getShareTitle();
    const description = getShareDescription();
    const body = `${description}\n\nVisualizza qui: ${url}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
}

function copyLinkToClipboard() {
    const url = generateShareableURL();

    // Usa l'API Clipboard se disponibile
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showCopyNotification('Link copiato negli appunti!');
        }).catch(() => {
            fallbackCopyToClipboard(url);
        });
    } else {
        fallbackCopyToClipboard(url);
    }
}

// Fallback per browser che non supportano l'API Clipboard
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showCopyNotification('Link copiato negli appunti!');
    } catch (err) {
        showCopyNotification('Errore nella copia. Seleziona e copia manualmente.', true);
        console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
}

// Mostra notifica di copia
function showCopyNotification(message, isError = false) {
    // Rimuovi eventuali notifiche precedenti
    const existingNotification = document.getElementById('copyNotification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'copyNotification';
    notification.className = 'copy-notification' + (isError ? ' error' : '');
    notification.innerHTML = `
        <i class="fas fa-${isError ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Mostra con animazione
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Nascondi dopo 3 secondi
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Inizializza il ripristino dello stato al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
    // Attendi che tutto sia caricato prima di ripristinare lo stato
    if (window.location.search) {
        // Se ci sono parametri nell'URL, attendi il caricamento completo
        window.addEventListener('load', function() {
            setTimeout(restoreApplicationState, 500);
        });
    }
});

// Funzione per mostrare/nascondere il pannello di condivisione (opzionale)
function toggleSharePanel() {
    const panel = document.getElementById('sharePanelDropdown');
    if (panel) {
        panel.classList.toggle('show');
    }
}

// Chiudi il pannello se si clicca fuori
document.addEventListener('click', function(event) {
    const shareButton = document.getElementById('shareButton');
    const sharePanel = document.getElementById('sharePanelDropdown');

    if (shareButton && sharePanel) {
        if (!shareButton.contains(event.target) && !sharePanel.contains(event.target)) {
            sharePanel.classList.remove('show');
        }
    }
});
