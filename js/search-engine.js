// Sistema di Ricerca Intelligente per Verde Urbano Palermo
// Indicizzazione automatica di tutte le pagine HTML del sito

class SearchEngine {
    constructor() {
        this.searchIndex = [];
        this.pages = [
            'index.html',
            'il-progetto.html',
            'obiettivi.html',
            'fasi.html',
            'potatura.html',
            'radicali.html',
            'impianti.html',
            'sicurezza.html',
            'dati-economici.html'
        ];
        this.initialized = false;
    }

    // Inizializza il motore di ricerca
    async init() {
        if (this.initialized) return;

        console.log('Inizializzazione motore di ricerca...');
        await this.indexAllPages();
        this.initialized = true;
        console.log(`Indicizzazione completata: ${this.searchIndex.length} elementi`);
    }

    // Indicizza tutte le pagine del sito
    async indexAllPages() {
        const indexPromises = this.pages.map(page => this.indexPage(page));
        await Promise.all(indexPromises);
    }

    // Indicizza una singola pagina
    async indexPage(pageUrl) {
        try {
            const response = await fetch(pageUrl);
            if (!response.ok) return;

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Estrai il titolo della pagina
            const pageTitle = doc.querySelector('title')?.textContent || pageUrl;

            // Indicizza h1
            const h1Elements = doc.querySelectorAll('h1');
            h1Elements.forEach(el => {
                this.addToIndex({
                    page: pageUrl,
                    pageTitle: pageTitle,
                    title: el.textContent.trim(),
                    content: el.textContent.trim(),
                    type: 'heading1',
                    weight: 10
                });
            });

            // Indicizza h2 con il loro contesto
            const h2Elements = doc.querySelectorAll('.content-section h2, .page-main-content h2');
            h2Elements.forEach(el => {
                const section = el.closest('.content-section');
                const sectionId = section?.id || '';
                const nextP = el.nextElementSibling;
                const preview = nextP?.textContent.trim().substring(0, 150) || '';

                this.addToIndex({
                    page: pageUrl,
                    pageTitle: pageTitle,
                    title: el.textContent.trim(),
                    content: el.textContent.trim() + ' ' + preview,
                    type: 'heading2',
                    sectionId: sectionId,
                    weight: 8,
                    preview: preview
                });
            });

            // Indicizza h3
            const h3Elements = doc.querySelectorAll('.content-section h3, .page-main-content h3');
            h3Elements.forEach(el => {
                const section = el.closest('.content-section');
                const sectionId = section?.id || '';

                this.addToIndex({
                    page: pageUrl,
                    pageTitle: pageTitle,
                    title: el.textContent.trim(),
                    content: el.textContent.trim(),
                    type: 'heading3',
                    sectionId: sectionId,
                    weight: 6
                });
            });

            // Indicizza paragrafi importanti
            const paragraphs = doc.querySelectorAll('.content-section p, .page-main-content p');
            paragraphs.forEach(el => {
                const text = el.textContent.trim();
                if (text.length > 50) {
                    const section = el.closest('.content-section');
                    const sectionId = section?.id || '';
                    const heading = section?.querySelector('h2, h3')?.textContent.trim() || '';

                    this.addToIndex({
                        page: pageUrl,
                        pageTitle: pageTitle,
                        title: heading,
                        content: text,
                        type: 'paragraph',
                        sectionId: sectionId,
                        weight: 2,
                        preview: text.substring(0, 150)
                    });
                }
            });

            // Indicizza liste
            const listItems = doc.querySelectorAll('.content-section li, .page-main-content li');
            listItems.forEach(el => {
                const text = el.textContent.trim();
                if (text.length > 20) {
                    const section = el.closest('.content-section');
                    const sectionId = section?.id || '';
                    const heading = section?.querySelector('h2, h3')?.textContent.trim() || '';

                    this.addToIndex({
                        page: pageUrl,
                        pageTitle: pageTitle,
                        title: heading,
                        content: text,
                        type: 'list',
                        sectionId: sectionId,
                        weight: 3,
                        preview: text.substring(0, 100)
                    });
                }
            });

        } catch (error) {
            console.error(`Errore nell'indicizzazione di ${pageUrl}:`, error);
        }
    }

    // Aggiungi elemento all'indice
    addToIndex(item) {
        // Normalizza il testo per la ricerca
        item.searchText = this.normalizeText(item.content);
        item.searchTitle = this.normalizeText(item.title);
        this.searchIndex.push(item);
    }

    // Normalizza il testo per la ricerca (rimuove accenti, lowercase, etc)
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Rimuove accenti
            .replace(/[^\w\s]/g, ' ') // Rimuove punteggiatura
            .replace(/\s+/g, ' ') // Normalizza spazi
            .trim();
    }

    // Cerca nel contenuto indicizzato
    search(query, maxResults = 10) {
        if (!query || query.length < 2) return [];

        const normalizedQuery = this.normalizeText(query);
        const queryWords = normalizedQuery.split(' ').filter(w => w.length > 1);

        const results = this.searchIndex.map(item => {
            let score = 0;

            queryWords.forEach(word => {
                // Match esatto nel titolo (peso alto)
                if (item.searchTitle.includes(word)) {
                    score += item.weight * 3;
                }

                // Match esatto nel contenuto
                if (item.searchText.includes(word)) {
                    score += item.weight;
                }

                // Match parziale (inizia con...)
                const words = item.searchText.split(' ');
                words.forEach(w => {
                    if (w.startsWith(word)) {
                        score += item.weight * 0.5;
                    }
                });
            });

            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

        // Raggruppa e de-duplica risultati simili
        return this.deduplicateResults(results);
    }

    // Rimuovi risultati duplicati o molto simili
    deduplicateResults(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = `${result.page}-${result.sectionId}-${result.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    // Ottieni suggerimenti per l'autocompletamento
    getSuggestions(query, maxSuggestions = 5) {
        if (!query || query.length < 2) return [];

        const normalizedQuery = this.normalizeText(query);
        const suggestions = new Set();

        this.searchIndex.forEach(item => {
            // Estrai parole che iniziano con la query
            const words = item.searchText.split(' ');
            words.forEach(word => {
                if (word.startsWith(normalizedQuery) && word.length > normalizedQuery.length) {
                    suggestions.add(word);
                }
            });

            // Aggiungi titoli che contengono la query
            if (item.title && item.searchTitle.includes(normalizedQuery)) {
                suggestions.add(item.title);
            }
        });

        return Array.from(suggestions)
            .slice(0, maxSuggestions)
            .sort((a, b) => a.length - b.length);
    }

    // Genera URL per il risultato
    getResultUrl(result) {
        let url = result.page;
        if (result.sectionId) {
            url += '#' + result.sectionId;
        }
        return url;
    }

    // Evidenzia il testo della query nei risultati
    highlightText(text, query) {
        if (!query) return text;

        const normalizedQuery = this.normalizeText(query);
        const words = normalizedQuery.split(' ').filter(w => w.length > 1);

        let highlightedText = text;
        words.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });

        return highlightedText;
    }
}

// Istanza globale del motore di ricerca
window.searchEngine = new SearchEngine();

// Inizializza automaticamente quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.searchEngine.init();
    });
} else {
    window.searchEngine.init();
}
