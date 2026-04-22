// ===== URL ROUTING PER FILTRI =====

function updateURLFromFilters() {
    const params = new URLSearchParams();

    const selectedP = typeof getSelectedProgetti === 'function' ? getSelectedProgetti() : [];
    if (selectedP.length) params.set('progetto', selectedP.join(','));

    const specie = document.getElementById('specieFilter').value;
    const cpc = document.getElementById('cpcFilter').value;
    const site = document.getElementById('siteFilter').value;
    const minHeight = document.getElementById('minHeight').value;
    const minDiameter = document.getElementById('minDiameter').value;
    const odonimo = document.getElementById('odonimoFilter').value;
    const civico = document.getElementById('civicoFilter').value;
    const upl = document.getElementById('uplFilter').value;
    const quartiere = document.getElementById('quartiereFilter').value;
    const circoscrizione = document.getElementById('circoscrizioneFilter').value;
    const pulizia = document.getElementById('puliziaFilter').value;
    const fase = document.getElementById('faseFilter').value;

    if (specie) params.set('specie', specie);
    if (cpc) params.set('cpc', cpc);
    if (site) params.set('sito', site);
    if (parseFloat(minHeight) > 0) params.set('altezza', minHeight);
    if (parseFloat(minDiameter) > 0) params.set('diametro', minDiameter);
    if (odonimo) params.set('odonimo', odonimo);
    if (civico) params.set('civico', civico);
    if (upl) params.set('upl', upl);
    if (quartiere) params.set('quartiere', quartiere);
    if (circoscrizione) params.set('circoscrizione', circoscrizione);
    if (pulizia) params.set('pulizia', pulizia);
    if (fase) params.set('fase', fase);

    const search = params.toString() ? '?' + params.toString() : window.location.pathname;
    history.replaceState(null, '', search + window.location.hash);
}

function applyFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;

    const specie = params.get('specie');
    const cpc = params.get('cpc');
    const site = params.get('sito');
    const altezza = params.get('altezza');
    const diametro = params.get('diametro');
    const odonimo = params.get('odonimo');
    const civico = params.get('civico');
    const upl = params.get('upl');
    const quartiere = params.get('quartiere');
    const circoscrizione = params.get('circoscrizione');
    const pulizia = params.get('pulizia');
    const fase = params.get('fase');

    const progetto = params.get('progetto');
    if (progetto) {
        const values = progetto.split(',');
        document.querySelectorAll('.progetto-cb').forEach(cb => { cb.checked = values.includes(cb.value); });
        if (typeof onProgettoChange === 'function') onProgettoChange();
    }

    if (specie) document.getElementById('specieFilter').value = specie;
    if (cpc) document.getElementById('cpcFilter').value = cpc;
    if (site) document.getElementById('siteFilter').value = site;
    if (altezza) {
        document.getElementById('minHeight').value = altezza;
        updateHeightLabel();
    }
    if (diametro) {
        document.getElementById('minDiameter').value = diametro;
        updateDiameterLabel();
    }
    if (odonimo) {
        document.getElementById('odonimoFilter').value = odonimo;
        updateCiviciByOdonimo();
    }
    if (civico) document.getElementById('civicoFilter').value = civico;
    if (upl) document.getElementById('uplFilter').value = upl;
    if (quartiere) document.getElementById('quartiereFilter').value = quartiere;
    if (circoscrizione) document.getElementById('circoscrizioneFilter').value = circoscrizione;
    if (pulizia) document.getElementById('puliziaFilter').value = pulizia;
    if (fase) document.getElementById('faseFilter').value = fase;
}
