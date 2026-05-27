// ===== DETTAGLI ALBERO =====
function showTreeDetails(tree) {
    selectedTree = tree;

    const o2Production  = calculateO2Production(tree);
    const co2Absorption = calculateCO2Absorption(tree);
    const workingCost   = getWorkingCost(tree);

    const modal = document.getElementById('treeDetailsModal');
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    updateSeasonalLeavesChartForSingleTree(tree);

    const hasProgetto = (tree.progetto && tree.progetto !== '-') || (tree.ordinativo && tree.ordinativo !== '-');
    const hasF2 = tree.cod_lav_f2 || tree.lavori_f2 || tree.prezzo_f2 || tree.data_lav_f2;
    const hasF3 = tree.cod_lav_f3 || tree.lavori_f3 || tree.prezzo_f3 || tree.data_lav_f3;

    const field = (label, value, opts) => {
        opts = opts || {};
        const style = opts.color ? ` style="color:${opts.color}"` : '';
        const klass = opts.full ? 'td-field td-field--full' : 'td-field';
        return `<div class="${klass}"><div class="td-field__label">${label}</div><div class="td-field__value"${style}>${value || '—'}</div></div>`;
    };

    const foglieValues = [tree.foglie_primavera, tree.foglie_estate, tree.foglie_autunno, tree.foglie_inverno];
    const maxFoglie = Math.max.apply(null, foglieValues);
    const minFoglie = Math.min.apply(null, foglieValues);
    const differenza = maxFoglie - minFoglie;
    const percentuale = maxFoglie > 0 ? ((differenza / maxFoglie) * 100).toFixed(1) : 0;
    const variazioneSig = differenza > maxFoglie * 0.3;

    const info = document.getElementById('selectedTreeInfo');
    info.innerHTML = `
        <!-- Identità -->
        <div class="td-section td-section--id">
            <div class="td-grid td-grid-3">
                ${field('ID', tree.id)}
                ${field('Specie arborea', tree.specie)}
                ${field('Dimora', tree.sito)}
                ${field('Altezza', tree.altezza ? tree.altezza + ' m' : 'n/a')}
                ${field('Diametro', tree.diametro ? tree.diametro + ' cm' : 'n/a')}
                ${field('CPC', tree.cpc, { color: cpcColors[tree.cpc] })}
            </div>
            ${tree.descrizione_cpc ? `<div class="td-cpc-desc"><strong>Descrizione CPC:</strong> ${tree.descrizione_cpc}</div>` : ''}
        </div>

        ${hasProgetto ? `
        <div class="td-section td-section--progetto">
            <div class="td-section__title"><i class="fas fa-folder-open"></i> Progetto</div>
            <div class="td-grid td-grid-2">
                ${tree.progetto && tree.progetto !== '-' ? field('Accordo quadro', tree.progetto) : ''}
                ${tree.ordinativo && tree.ordinativo !== '-' ? field('Ordinativo', tree.ordinativo) : ''}
            </div>
        </div>` : ''}

        <div class="td-section td-section--loc">
            <div class="td-section__title"><i class="fa fa-map-marker-alt"></i> Localizzazione territoriale</div>
            <div class="td-grid td-grid-3">
                ${field('Strada (Odonimo)', tree.odonimo || '-')}
                ${field('Civico', tree.civico || '-')}
                ${field('UPL', tree.upl || '-')}
                ${field('Quartiere', tree.quartiere || '-')}
                ${field('Circoscrizione', tree.circoscrizione || '-')}
            </div>
        </div>

        <div class="td-section td-section--phase td-phase-f1">
            <div class="td-section__title">
                <span class="td-phase-tag">F1</span>
                <i class="fas fa-scissors"></i> Potatura o abbattimento
                <button type="button" class="td-section__info" aria-expanded="false" title="Mostra descrizione">
                    <i class="fas fa-circle-info"></i>
                </button>
            </div>
            <div class="td-section__desc" hidden>
                La prima fase comprende le operazioni di potatura ordinaria e straordinaria, oppure l'abbattimento dell'esemplare quando le condizioni fitopatologiche, strutturali o di sicurezza lo rendono necessario.
            </div>
            <div class="td-grid td-grid-3">
                ${field('Cod. lavorazione', tree.codice || '-')}
                ${field('Data lavori', tree.data_lav_f1 || '-')}
                ${field('Prezzo unitario', formatCurrency(tree.prezzo))}
                ${field('Tipo di lavorazione', tree.descrizione || '-', { full: true })}
            </div>
        </div>

        ${hasF2 ? `
        <div class="td-section td-section--phase td-phase-f2">
            <div class="td-section__title">
                <span class="td-phase-tag">F2</span>
                <i class="fas fa-tree"></i> Rimozione del ceppo
                <button type="button" class="td-section__info" aria-expanded="false" title="Mostra descrizione">
                    <i class="fas fa-circle-info"></i>
                </button>
            </div>
            <div class="td-section__desc" hidden>
                In caso di abbattimento, la seconda fase consiste nella rimozione del ceppo e dell'apparato radicale, inclusa l'asportazione dei materiali verso le aree di deposito temporaneo o i centri di smaltimento autorizzati.
            </div>
            <div class="td-grid td-grid-3">
                ${field('Cod. lavorazione', tree.cod_lav_f2 || '-')}
                ${field('Data lavori', tree.data_lav_f2 || '-')}
                ${field('Prezzo', tree.prezzo_f2 ? formatCurrency(tree.prezzo_f2) : '-')}
                ${field('Lavori', tree.lavori_f2 || '-', { full: true })}
            </div>
        </div>` : ''}

        ${hasF3 ? `
        <div class="td-section td-section--phase td-phase-f3">
            <div class="td-section__title">
                <span class="td-phase-tag">F3</span>
                <i class="fas fa-seedling"></i> Fornitura e messa a dimora di nuova pianta
                <button type="button" class="td-section__info" aria-expanded="false" title="Mostra descrizione">
                    <i class="fas fa-circle-info"></i>
                </button>
            </div>
            <div class="td-section__desc" hidden>
                Approvvigionamento di esemplari arborei conformi alle specifiche tecniche, messa a dimora con buca di impianto e sistemazione del terreno, fornitura e installazione dei pali tutori per garantire la stabilità della pianta durante l'attecchimento.
            </div>
            <div class="td-grid td-grid-3">
                ${field('Cod. lavorazione', tree.cod_lav_f3 || '-')}
                ${field('Data lavori', tree.data_lav_f3 || '-')}
                ${field('Prezzo', tree.prezzo_f3 ? formatCurrency(tree.prezzo_f3) : '-')}
                ${field('Lavori', tree.lavori_f3 || '-', { full: true })}
            </div>
        </div>` : ''}

        <div class="td-section td-section--leaves">
            <div class="td-section__title"><i class="fas fa-leaf"></i> Foglie per stagione</div>
            <div class="td-leaves">
                <div class="td-leaf td-leaf--p"><i class="fas fa-seedling"></i><span class="td-leaf__name">Primavera</span><span class="td-leaf__num">${(tree.foglie_primavera||0).toLocaleString('it-IT')}</span></div>
                <div class="td-leaf td-leaf--e"><i class="fas fa-sun"></i><span class="td-leaf__name">Estate</span><span class="td-leaf__num">${(tree.foglie_estate||0).toLocaleString('it-IT')}</span></div>
                <div class="td-leaf td-leaf--a"><i class="fas fa-leaf"></i><span class="td-leaf__name">Autunno</span><span class="td-leaf__num">${(tree.foglie_autunno||0).toLocaleString('it-IT')}</span></div>
                <div class="td-leaf td-leaf--i"><i class="fas fa-snowflake"></i><span class="td-leaf__name">Inverno</span><span class="td-leaf__num">${(tree.foglie_inverno||0).toLocaleString('it-IT')}</span></div>
            </div>
            <div class="td-cleaning">
                <div class="td-cleaning__title"><i class="fas fa-broom"></i> Indicatore pulizia stagionale</div>
                <div class="td-cleaning__stats">
                    <span><span class="td-cleaning__lab">Max:</span> <strong>${maxFoglie.toLocaleString('it-IT')}</strong></span>
                    <span><span class="td-cleaning__lab">Min:</span> <strong>${minFoglie.toLocaleString('it-IT')}</strong></span>
                    <span><span class="td-cleaning__lab">Δ:</span> <strong>${differenza.toLocaleString('it-IT')}</strong> (${percentuale}%)</span>
                </div>
                <div class="td-cleaning__hint">
                    ${variazioneSig
                        ? '<i class="fas fa-triangle-exclamation"></i> Variazione significativa: pianificare pulizie intensive in autunno-inverno'
                        : '<i class="fas fa-check-circle"></i> Variazione moderata: manutenzione ordinaria sufficiente'}
                </div>
            </div>
        </div>

        <div class="td-section td-section--benefits">
            <div class="td-section__title"><i class="fa-solid fa-seedling"></i> Benefici ambientali annui</div>
            <div class="td-benefits">
                <div class="td-benefit td-benefit--co2">
                    <span class="td-benefit__icon"><i class="fas fa-cloud"></i></span>
                    <span class="td-benefit__label">CO₂ assorbita</span>
                    <span class="td-benefit__value">${co2Absorption} kg/anno</span>
                </div>
                <div class="td-benefit td-benefit--o2">
                    <span class="td-benefit__icon"><i class="fas fa-wind"></i></span>
                    <span class="td-benefit__label">O₂ prodotto</span>
                    <span class="td-benefit__value">${o2Production} kg/anno</span>
                </div>
            </div>
            <div class="td-benefits__note">Calcolati in base a: specie botanica, dimensioni, stato di salute</div>
        </div>

        <div class="td-actions">
            <button class="td-action-btn" onclick="generateTreePDF()">
                <i class="fa fa-download"></i> Scarica PDF
            </button>
        </div>
    `;

    // Wire up phase info toggles
    info.querySelectorAll('.td-section__info').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var section = btn.closest('.td-section');
            var desc = section && section.querySelector('.td-section__desc');
            if (!desc) return;
            var open = !desc.hidden;
            desc.hidden = open;
            btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        });
    });
}


// Funzione per chiudere la modale dei dettagli albero
function closeTreeDetails() {
    const modal = document.getElementById('treeDetailsModal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');

    // Ripristina il grafico delle foglie alla visualizzazione normale
    updateSeasonalLeavesChart();
}

// Chiudi la modale quando si clicca fuori dall'area del contenuto
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('treeDetailsModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeTreeDetails();
            }
        });
    }
});

// Chiudi la modale con il tasto ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('treeDetailsModal');
        if (modal && modal.classList.contains('active')) {
            closeTreeDetails();
        }
    }
});
