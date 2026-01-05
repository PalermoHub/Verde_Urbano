// UI Controller per la ricerca intelligente
// Gestisce l'interfaccia utente della barra di ricerca e dei risultati

class SearchUI {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.searchOverlay = null;
        this.isOpen = false;
        this.currentResults = [];
        this.selectedIndex = -1;
    }

    // Inizializza l'interfaccia utente
    init() {
        this.createSearchUI();
        this.attachEventListeners();
    }

    // Crea gli elementi dell'interfaccia
    createSearchUI() {
        // Trova il pulsante di ricerca nell'header
        const searchBtn = document.getElementById('searchBtn');
        if (!searchBtn) {
            console.error('Pulsante di ricerca non trovato');
            return;
        }

        // Crea il contenitore del modale di ricerca
        const searchModal = document.createElement('div');
        searchModal.id = 'searchModal';
        searchModal.className = 'search-modal';
        searchModal.innerHTML = `
            <div class="search-modal-content">
                <div class="search-header">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            id="searchInput"
                            class="search-input"
                            placeholder="Cerca informazioni nel progetto..."
                            autocomplete="off"
                            aria-label="Campo di ricerca"
                        >
                        <button class="search-clear" id="searchClear" aria-label="Cancella ricerca">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <button class="search-close" id="searchClose" aria-label="Chiudi ricerca">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-body">
                    <div id="searchResults" class="search-results"></div>
                    <div id="searchSuggestions" class="search-suggestions"></div>
                </div>
                <div class="search-footer">
                    <div class="search-tips">
                        <i class="fas fa-lightbulb"></i>
                        <span>Suggerimento: prova a cercare "potatura", "VTA", "radicali", "sicurezza"...</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(searchModal);

        // Salva i riferimenti agli elementi
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.searchModal = searchModal;
        this.searchBtn = searchBtn;
        this.searchClear = document.getElementById('searchClear');
        this.searchClose = document.getElementById('searchClose');
    }

    // Collega gli event listener
    attachEventListeners() {
        // Apri la ricerca
        this.searchBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openSearch();
        });

        // Chiudi la ricerca
        this.searchClose?.addEventListener('click', () => {
            this.closeSearch();
        });

        // Chiudi con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSearch();
            }
        });

        // Chiudi cliccando fuori
        this.searchModal?.addEventListener('click', (e) => {
            if (e.target === this.searchModal) {
                this.closeSearch();
            }
        });

        // Input di ricerca
        this.searchInput?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Cancella ricerca
        this.searchClear?.addEventListener('click', () => {
            this.clearSearch();
        });

        // Navigazione con tastiera
        this.searchInput?.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Scorciatoia da tastiera: Ctrl+K o Cmd+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
        });
    }

    // Apri la ricerca
    openSearch() {
        this.isOpen = true;
        this.searchModal?.classList.add('active');
        document.body.style.overflow = 'hidden'; // Previeni scroll del body

        // Nascondi il project banner se esiste
        const projectBanner = document.getElementById('projectBanner');
        if (projectBanner) {
            projectBanner.style.display = 'none';
        }

        // Focus sull'input dopo un breve delay per l'animazione
        setTimeout(() => {
            this.searchInput?.focus();
        }, 100);

        // Mostra suggerimenti iniziali
        this.showInitialSuggestions();
    }

    // Chiudi la ricerca
    closeSearch() {
        this.isOpen = false;
        this.searchModal?.classList.remove('active');
        document.body.style.overflow = ''; // Ripristina scroll

        // Ripristina il project banner se esiste
        const projectBanner = document.getElementById('projectBanner');
        if (projectBanner) {
            projectBanner.style.display = '';
        }

        this.clearSearch();
    }

    // Cancella la ricerca
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.searchResults.innerHTML = '';
        this.searchSuggestions.innerHTML = '';
        this.currentResults = [];
        this.selectedIndex = -1;
        this.searchClear?.classList.remove('visible');
    }

    // Gestisci la ricerca
    async handleSearch(query) {
        // Mostra/nascondi pulsante cancella
        if (query.length > 0) {
            this.searchClear?.classList.add('visible');
        } else {
            this.searchClear?.classList.remove('visible');
            this.showInitialSuggestions();
            return;
        }

        // Aspetta che il motore di ricerca sia inizializzato
        if (!window.searchEngine?.initialized) {
            this.searchResults.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Caricamento indice di ricerca...</div>';
            setTimeout(() => this.handleSearch(query), 500);
            return;
        }

        // Esegui la ricerca
        const results = window.searchEngine.search(query, 20);
        this.currentResults = results;
        this.selectedIndex = -1;

        // Mostra i risultati
        this.displayResults(results, query);

        // Mostra suggerimenti
        const suggestions = window.searchEngine.getSuggestions(query, 5);
        this.displaySuggestions(suggestions);
    }

    // Mostra suggerimenti iniziali
    showInitialSuggestions() {
        const popularSearches = [
            'potatura',
            'VTA',
            'radicali',
            'sicurezza',
            'abbattimento',
            'nuovi impianti',
            'mitigazione climatica',
            'barriere architettoniche'
        ];

        this.searchSuggestions.innerHTML = `
            <div class="popular-searches">
                <h4><i class="fas fa-fire"></i> Ricerche popolari</h4>
                <div class="suggestion-tags">
                    ${popularSearches.map(term =>
                        `<button class="suggestion-tag" data-query="${term}">${term}</button>`
                    ).join('')}
                </div>
            </div>
        `;

        // Event listener per i tag
        this.searchSuggestions.querySelectorAll('.suggestion-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const query = e.target.dataset.query;
                this.searchInput.value = query;
                this.handleSearch(query);
            });
        });
    }

    // Mostra i risultati
    displayResults(results, query) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Nessun risultato trovato per "<strong>${this.escapeHtml(query)}</strong>"</p>
                    <p class="no-results-hint">Prova con altri termini o consulta i suggerimenti qui sotto</p>
                </div>
            `;
            return;
        }

        const resultsHtml = results.map((result, index) => {
            const url = window.searchEngine.getResultUrl(result);
            const icon = this.getIconForType(result.type);
            const badge = this.getBadgeForPage(result.page);

            return `
                <a href="${url}" class="search-result-item" data-index="${index}">
                    <div class="result-icon">${icon}</div>
                    <div class="result-content">
                        <div class="result-header">
                            <h4 class="result-title">${this.escapeHtml(result.title || result.pageTitle)}</h4>
                            <span class="result-badge">${badge}</span>
                        </div>
                        ${result.preview ? `<p class="result-preview">${this.escapeHtml(result.preview)}</p>` : ''}
                        <div class="result-meta">
                            <span class="result-page">${this.getPageName(result.page)}</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

        this.searchResults.innerHTML = `
            <div class="results-header">
                <span class="results-count">
                    <i class="fas fa-check-circle"></i>
                    ${results.length} risultat${results.length === 1 ? 'o' : 'i'} trovat${results.length === 1 ? 'o' : 'i'}
                </span>
            </div>
            ${resultsHtml}
        `;

        // Event listener per i risultati
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.closeSearch();
            });

            item.addEventListener('mouseenter', (e) => {
                this.selectedIndex = parseInt(e.currentTarget.dataset.index);
                this.updateSelection();
            });
        });
    }

    // Mostra suggerimenti
    displaySuggestions(suggestions) {
        if (suggestions.length === 0) {
            this.searchSuggestions.innerHTML = '';
            return;
        }

        this.searchSuggestions.innerHTML = `
            <div class="autocomplete-suggestions">
                <h5><i class="fas fa-magic"></i> Suggerimenti</h5>
                <div class="suggestion-list">
                    ${suggestions.map(suggestion =>
                        `<button class="suggestion-item" data-suggestion="${this.escapeHtml(suggestion)}">
                            <i class="fas fa-arrow-right"></i>
                            ${this.escapeHtml(suggestion)}
                        </button>`
                    ).join('')}
                </div>
            </div>
        `;

        // Event listener per i suggerimenti
        this.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const suggestion = e.currentTarget.dataset.suggestion;
                this.searchInput.value = suggestion;
                this.handleSearch(suggestion);
            });
        });
    }

    // Navigazione con tastiera
    handleKeyboardNavigation(e) {
        const items = this.searchResults.querySelectorAll('.search-result-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
            this.updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
            this.updateSelection();
        } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
            e.preventDefault();
            items[this.selectedIndex]?.click();
        }
    }

    // Aggiorna la selezione visuale
    updateSelection() {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Ottieni icona per tipo
    getIconForType(type) {
        const icons = {
            'heading1': '<i class="fas fa-heading"></i>',
            'heading2': '<i class="fas fa-heading"></i>',
            'heading3': '<i class="fas fa-heading"></i>',
            'paragraph': '<i class="fas fa-paragraph"></i>',
            'list': '<i class="fas fa-list"></i>'
        };
        return icons[type] || '<i class="fas fa-file-alt"></i>';
    }

    // Ottieni badge per pagina
    getBadgeForPage(page) {
        const badges = {
            'index.html': 'Dashboard',
            'il-progetto.html': 'Progetto',
            'obiettivi.html': 'Obiettivi',
            'fasi.html': 'Fasi',
            'potatura.html': 'Potatura',
            'radicali.html': 'Radicali',
            'impianti.html': 'Impianti',
            'sicurezza.html': 'Sicurezza',
            'dati-economici.html': 'Dati Economici'
        };
        return badges[page] || page;
    }

    // Ottieni nome della pagina
    getPageName(page) {
        return this.getBadgeForPage(page);
    }

    // Escape HTML per sicurezza
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inizializza l'UI quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.searchUI = new SearchUI();
        window.searchUI.init();
    });
} else {
    window.searchUI = new SearchUI();
    window.searchUI.init();
}
