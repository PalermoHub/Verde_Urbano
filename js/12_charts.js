// ===== GRAFICI =====

function initCharts() {
    console.log('📊 Inizializzazione grafici...');

    // Altezze
    const heightCtx = document.getElementById('heightChart');
    if (heightCtx && heightCtx.getContext) {
        chartsInstances.height = new Chart(heightCtx, {
            type: 'bar',
            data: {
                labels: ['6-8m', '8-10m', '10-12m', '12-14m', '14-16m', '>16m'],
                datasets: [{
                    label: 'Alberi',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#27ae60',
                    borderColor: '#1e8449',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: { y: { beginAtZero: true } }
            },
            plugins: [{
                afterDatasetsDraw(chart) {
                    const ctx = chart.ctx;
                    const chartArea = chart.chartArea;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 12px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';

                                const barHeight = bar.height;
                                const barY = bar.y;
                                const labelY = barY + barHeight / 2;

                                // Se la barra è abbastanza alta (> 35px), etichetta dentro in bianco
                                if (barHeight > 35) {
                                    ctx.fillStyle = 'white';
                                    ctx.fillText(value, bar.x, labelY);
                                }
                                // Altrimenti etichetta fuori sopra la barra in grigio più visibile
                                else {
                                    ctx.fillStyle = '#555';
                                    ctx.fillText(value, bar.x, barY - 10);
                                }
                            }
                        });
                    });
                }
            }]
        });
    }

    // CPC - TRASFORMATO IN GRAFICO A COLONNE VERTICALI
    const healthCtx = document.getElementById('healthChart');
    if (healthCtx && healthCtx.getContext) {
        chartsInstances.health = new Chart(healthCtx, {
            type: 'bar',
            data: {
                labels: ['B', 'C', 'C/D', 'D'],
                datasets: [{
                    label: 'Alberi',
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#2cc15f', '#f39c12', '#c164a1', '#e74c3c'],
                    borderColor: ['#25a84f', '#d68910', '#a04d85', '#c0392b'],
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            },
            plugins: [{
                afterDatasetsDraw(chart) {
                    const ctx = chart.ctx;

                    chart.data.datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.getDatasetMeta(datasetIndex);

                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];

                            if (value > 0) {
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 12px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';

                                const barHeight = bar.height;
                                const barY = bar.y;
                                const barX = bar.x;

                                if (barHeight > 35) {
                                    ctx.fillStyle = 'white';
                                    ctx.fillText(value, barX, barY + barHeight / 2);
                                } else {
                                    ctx.fillStyle = '#555';
                                    ctx.fillText(value, barX, barY - 10);
                                }
                            }
                        });
                    });
                }
            }]
        });
    }

    // Specie
    const speciesCtx = document.getElementById('speciesChart');
    if (speciesCtx && speciesCtx.getContext) {
        chartsInstances.species = new Chart(speciesCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Esemplari',
                    data: [],
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: { x: { beginAtZero: true } }
            },
            plugins: [{
                afterDatasetsDraw(chart) {
                    const ctx = chart.ctx;
                    const chartArea = chart.chartArea;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 11px Arial';
                                ctx.textBaseline = 'middle';
                                const barWidth = bar.width;

                                // Se la barra è abbastanza lunga (> 50px), etichetta dentro in bianco
                                if (barWidth > 45) {
                                    ctx.fillStyle = 'white';
                                    ctx.textAlign = 'center';
                                    ctx.fillText(value, bar.x - 35, bar.y);
                                }
                                // Altrimenti etichetta fuori a destra in grigio
                                else {
                                    ctx.fillStyle = '#555';
                                    ctx.textAlign = 'left';
                                    ctx.fillText(value, bar.x + barWidth + 8, bar.y);
                                }
                            }
                        });
                    });
                }
            }]
        });
    }

    // Sito impianto
    const siteCtx = document.getElementById('siteChart');
    if (siteCtx && siteCtx.getContext) {
        chartsInstances.site = new Chart(siteCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Esemplari',
                    data: [],
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: { x: { beginAtZero: true } }
            },
            plugins: [{
                afterDatasetsDraw(chart) {
                    const ctx = chart.ctx;
                    const chartArea = chart.chartArea;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 11px Arial';
                                ctx.textBaseline = 'middle';
                                const barWidth = bar.width;

                                // Se la barra è abbastanza lunga (> 50px), etichetta dentro in bianco
                                if (barWidth > 45) {
                                    ctx.fillStyle = 'white';
                                    ctx.textAlign = 'left';
                                    ctx.fillText(value, bar.x - 35, bar.y);
                                }
                                // Altrimenti etichetta fuori a destra in grigio
                                else {
                                    ctx.fillStyle = '#555';
                                    ctx.textAlign = 'left';
                                    ctx.fillText(value, bar.x + barWidth + 8, bar.y);
                                }
                            }
                        });
                    });
                }
            }]
        });
    }

    // Foglie stagionali - grafico orizzontale con stagioni sull'asse Y
    const seasonalLeavesCtx = document.getElementById('seasonalLeavesChart');
    if (seasonalLeavesCtx && seasonalLeavesCtx.getContext) {
        chartsInstances.seasonalLeaves = new Chart(seasonalLeavesCtx, {
            type: 'bar',
            data: {
                labels: ['Primavera', 'Estate', 'Autunno', 'Inverno'],
                datasets: []
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.x.toLocaleString('it-IT') + ' foglie';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('it-IT');
                            }
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 13,
                                weight: 'bold'
                            }
                        }
                    }
                }
            },
            plugins: [{
                afterDatasetsDraw(chart) {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.getDatasetMeta(datasetIndex);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                const barWidth = bar.width;
                                const barX = bar.x;
                                const barY = bar.y;

                                ctx.font = 'bold 11px Arial';
                                ctx.textBaseline = 'middle';

                                // Se la barra è abbastanza lunga, etichetta bianca dentro
                                if (barWidth > 80) {
                                    ctx.fillStyle = 'white';
                                    ctx.textAlign = 'center';
                                    ctx.fillText(value.toLocaleString('it-IT'), barX - barWidth / 2 + 40, barY);
                                } else {
                                    // Altrimenti etichetta fuori a destra
                                    ctx.fillStyle = '#555';
                                    ctx.textAlign = 'left';
                                    ctx.fillText(value.toLocaleString('it-IT'), barX + 5, barY);
                                }
                            }
                        });
                    });
                }
            }]
        });

        // Popola il grafico con i dati
        updateSeasonalLeavesChart();
    }

    console.log('✅ Grafici inizializzati');
}

// Funzione per aggiornare il grafico delle foglie stagionali con un singolo albero
function updateSeasonalLeavesChartForSingleTree(tree) {
    if (!chartsInstances.seasonalLeaves) {
        console.warn('⚠️ Grafico foglie stagionali non inizializzato');
        return;
    }

    // Colori stagionali specifici
    const seasonalColors = [
        { bg: '#FAD5A5', border: '#F4C78D' },  // Primavera
        { bg: '#B0C4DE', border: '#9BB3D0' },  // Estate
        { bg: '#D2691E', border: '#C05A18' },  // Autunno
        { bg: '#000080', border: '#000066' }   // Inverno
    ];

    const dataset = {
        label: `Albero ${tree.id} - ${tree.specie}`,
        data: [tree.foglie_primavera || 0, tree.foglie_estate || 0, tree.foglie_autunno || 0, tree.foglie_inverno || 0],
        backgroundColor: seasonalColors.map(c => c.bg),
        borderColor: seasonalColors.map(c => c.border),
        borderWidth: 2
    };

    chartsInstances.seasonalLeaves.data.datasets = [dataset];
    chartsInstances.seasonalLeaves.update();

    console.log('📊 Grafico foglie aggiornato per albero:', tree.id);
}

// Funzione per aggiornare il grafico delle foglie stagionali
function updateSeasonalLeavesChart() {
    if (!chartsInstances.seasonalLeaves) {
        console.warn('⚠️ Grafico foglie stagionali non inizializzato');
        return;
    }

    // Se c'è un albero selezionato, usa la funzione specifica per singolo albero
    if (selectedTree) {
        updateSeasonalLeavesChartForSingleTree(selectedTree);
        return;
    }

    // Calcola i totali dalle foglie degli alberi filtrati
    const aggregatedData = {};

    filteredTrees.forEach(tree => {
        // Determina la chiave di aggregazione basata sui filtri attivi
        let key = 'Totale Generale';

        // Se ci sono filtri territoriali attivi, aggrega per quello più specifico
        const odonimoFilter = document.getElementById('odonimoFilter').value;
        const quartiereFilter = document.getElementById('quartiereFilter').value;
        const circoscrizioneFilter = document.getElementById('circoscrizioneFilter').value;
        const uplFilter = document.getElementById('uplFilter').value;

        // Priorità: singolo albero > odonimo > UPL > quartiere > circoscrizione > totale generale
        if (filteredTrees.length === 1) {
            // Se c'è un solo albero filtrato, mostra i dati per quell'albero
            key = `Albero ${tree.id} - ${tree.specie}`;
        } else if (odonimoFilter) {
            key = tree.odonimo || 'Sconosciuto';
        } else if (uplFilter) {
            key = tree.upl || 'Sconosciuto';
        } else if (quartiereFilter) {
            key = tree.quartiere || 'Sconosciuto';
        } else if (circoscrizioneFilter) {
            key = tree.circoscrizione || 'Sconosciuto';
        }

        // Inizializza l'aggregazione se non esiste
        if (!aggregatedData[key]) {
            aggregatedData[key] = {
                primavera: 0,
                estate: 0,
                autunno: 0,
                inverno: 0
            };
        }

        // Somma le foglie stagionali
        aggregatedData[key].primavera += tree.foglie_primavera || 0;
        aggregatedData[key].estate += tree.foglie_estate || 0;
        aggregatedData[key].autunno += tree.foglie_autunno || 0;
        aggregatedData[key].inverno += tree.foglie_inverno || 0;
    });

    // Prepara i datasets per ogni categoria (via, UPL, quartiere, ecc.)
    const categories = Object.keys(aggregatedData).sort();
    const datasets = [];

    // Colori stagionali specifici
    const seasonalColors = [
        { bg: '#FAD5A5', border: '#F4C78D' },  // Primavera
        { bg: '#B0C4DE', border: '#9BB3D0' },  // Estate
        { bg: '#D2691E', border: '#C05A18' },  // Autunno
        { bg: '#000080', border: '#000066' }   // Inverno
    ];

    categories.forEach((category, index) => {
        const data = aggregatedData[category];

        datasets.push({
            label: category,
            data: [data.primavera, data.estate, data.autunno, data.inverno],
            backgroundColor: seasonalColors.map(c => c.bg),
            borderColor: seasonalColors.map(c => c.border),
            borderWidth: 2
        });
    });

    chartsInstances.seasonalLeaves.data.datasets = datasets;
    chartsInstances.seasonalLeaves.update();

    console.log('📊 Grafico foglie stagionali aggiornato con', categories.length, 'categorie');
}

function updateCharts() {
    console.log('📊 Aggiornamento grafici...');

    // Se c'è un albero selezionato, usa solo quello per i grafici
    const treesToAnalyze = selectedTree ? [selectedTree] : filteredTrees;

    // Altezze - Corretto con 6 range
    const heights = [0, 0, 0, 0, 0, 0];
    treesToAnalyze.forEach(t => {
        if (t.altezza !== null && !isNaN(t.altezza)) {
            if (t.altezza < 8) heights[0]++;
            else if (t.altezza < 10) heights[1]++;
            else if (t.altezza < 12) heights[2]++;
            else if (t.altezza < 14) heights[3]++;
            else if (t.altezza < 16) heights[4]++;
            else heights[5]++;
        }
    });
    if (chartsInstances.height) {
        chartsInstances.height.data.datasets[0].data = heights;
        chartsInstances.height.update();
    }

    // CPC
    const cpcCounts = {B: 0, C: 0, 'C/D': 0, D: 0 };
    treesToAnalyze.forEach(t => {
        if (cpcCounts.hasOwnProperty(t.cpc)) cpcCounts[t.cpc]++;
    });
    if (chartsInstances.health) {
        chartsInstances.health.data.datasets[0].data = [cpcCounts.B, cpcCounts.C, cpcCounts['C/D'], cpcCounts.D];
        chartsInstances.health.update();
    }

    // Specie
    const speciesCount = {};
    treesToAnalyze.forEach(t => {
        speciesCount[t.specie] = (speciesCount[t.specie] || 0) + 1;
    });
    const sortedSpecies = Object.entries(speciesCount).sort((a, b) => b[1] - a[1]);
    if (chartsInstances.species) {
        chartsInstances.species.data.labels = sortedSpecies.map(s => s[0].substring(0, 15));
        chartsInstances.species.data.datasets[0].data = sortedSpecies.map(s => s[1]);
        chartsInstances.species.update();
    }

    // Siti
    const siteCount = {};
    treesToAnalyze.forEach(t => {
        siteCount[t.sito] = (siteCount[t.sito] || 0) + 1;
    });
    const sortedSites = Object.entries(siteCount).sort((a, b) => b[1] - a[1]);
    if (chartsInstances.site) {
        chartsInstances.site.data.labels = sortedSites.map(s => s[0]);
        chartsInstances.site.data.datasets[0].data = sortedSites.map(s => s[1]);
        chartsInstances.site.update();
    }

    // Aggiorna anche il grafico delle foglie stagionali
    updateSeasonalLeavesChart();

    console.log('✅ Grafici aggiornati');
}
