// ===== GESTIONE FILTRI ATTIVI =====

// Mostra il modale con i filtri attivi
function showActiveFilters() {
    const modal = document.getElementById('activeFiltersModal');
    const content = document.getElementById('activeFiltersContent');

    // Raccogli i valori dei filtri
    const filters = {
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
