// ===== GRAFICI =====

/* Plugin: testo centrato nel doughnut */
const doughnutCenterPlugin = {
    id: 'doughnutCenter',
    afterDraw(chart) {
        if (chart.config.type !== 'doughnut') return;
        const cpcTotal = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        if (cpcTotal === 0) return;
        const totalTrees = chart._totalTrees != null ? chart._totalTrees : cpcTotal;
        const showSubline = totalTrees > cpcTotal;
        const { ctx, chartArea: { width, height, left, top } } = chart;
        const cx = left + width / 2, cy = top + height / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (showSubline) {
            ctx.font = 'bold 20px "Titillium Web", Arial, sans-serif';
            ctx.fillStyle = '#1a1a1a';
            ctx.fillText(totalTrees.toLocaleString('it-IT'), cx, cy - 17);
            ctx.font = '8px "Titillium Web", Arial, sans-serif';
            ctx.fillStyle = '#aaa';
            ctx.fillText('ALBERI', cx, cy - 4);
            ctx.font = 'bold 20px "Titillium Web", Arial, sans-serif';
            ctx.fillStyle = '#1a1a1a';
            ctx.fillText(cpcTotal.toLocaleString('it-IT'), cx, cy + 9);
            ctx.font = '8px "Titillium Web", Arial, sans-serif';
            ctx.fillStyle = '#888';
            ctx.fillText('con CPC', cx, cy + 22);
        } else {
            ctx.font = 'bold 20px "Titillium Web", Arial, sans-serif';
            ctx.fillStyle = '#1a1a1a';
            ctx.fillText(totalTrees.toLocaleString('it-IT'), cx, cy - 9);
            ctx.font = '9px "Titillium Web", Arial, sans-serif';
            ctx.fillStyle = '#aaa';
            ctx.fillText('ALBERI', cx, cy + 10);
        }
        ctx.restore();
    }
};

/* Renderizza lista stagionale HTML */
function renderSeasonalList(containerId, totals) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const seasons = [
        { key: 'primavera', name: 'Primavera', icon: 'fa-seedling',  color: '#F8C471' },
        { key: 'estate',    name: 'Estate',    icon: 'fa-sun',       color: '#5DADE2' },
        { key: 'autunno',   name: 'Autunno',   icon: 'fa-leaf',      color: '#CA6F1E' },
        { key: 'inverno',   name: 'Inverno',   icon: 'fa-snowflake', color: '#7F8C8D' }
    ];
    const max = Math.max(...seasons.map(s => totals[s.key] || 0)) || 1;
    const grand = seasons.reduce((a, s) => a + (totals[s.key] || 0), 0);
    el.innerHTML = `
        <div class="rl-header">
            <span><i class="fas fa-calendar-alt"></i> Totale foglie</span>
            <span class="rl-count-badge" style="background:#27ae60">${grand.toLocaleString('it-IT')}</span>
        </div>
        <div class="sl-items">
        ${seasons.map(s => {
            const val = totals[s.key] || 0;
            const pct = (val / max * 100).toFixed(1);
            const pctTotal = grand > 0 ? ((val / grand) * 100).toFixed(1) : '0.0';
            return `<div class="sl-item">
                <div class="sl-icon" style="background:${s.color}22;color:${s.color}">
                    <i class="fas ${s.icon}"></i>
                </div>
                <div class="sl-meta">
                    <span class="sl-name">${s.name}</span>
                    <span class="sl-pct">${pctTotal}%</span>
                </div>
                <div class="rl-bar-wrap" style="width:80px"><div class="rl-bar" style="width:${pct}%;background:${s.color}"></div></div>
                <span class="rl-value">${val.toLocaleString('it-IT')}</span>
            </div>`;
        }).join('')}
        </div>`;
}

/* Renderizza lista classificata come HTML (TOP TIPI style) */
function renderRankedList(containerId, items, accentColor, maxItems, filterKey) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const top = items.slice(0, maxItems || 12);
    if (top.length === 0) {
        el.innerHTML = '<div class="rl-empty"><i class="fas fa-hourglass-half"></i> Nessun dato disponibile</div>';
        return;
    }
    const max = top[0][1] || 1;
    const escAttr = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    el.innerHTML = `
        <div class="rl-header">
            <span><i class="fas fa-arrow-trend-up"></i> Top (${items.length})</span>
            <span class="rl-count-badge" style="background:${accentColor}">${top.length}</span>
        </div>
        <div class="rl-items">
        ${top.map(([name, count], i) => {
            const pct = (count / max * 100).toFixed(1);
            const display = name && name.length > 24 ? name.substring(0, 24) + '…' : (name || '—');
            const clickable = (filterKey && name) ? ` data-filter-key="${filterKey}" data-filter-value="${escAttr(name)}" role="button" tabindex="0" title="Clicca per filtrare: ${escAttr(name)}"` : '';
            const klass = (filterKey && name) ? 'rl-item rl-item--clickable' : 'rl-item';
            return `<div class="${klass}"${clickable}>
                <span class="rl-rank">${i + 1}</span>
                <span class="rl-label">${display}</span>
                <div class="rl-bar-wrap"><div class="rl-bar" style="width:${pct}%;background:${accentColor}"></div></div>
                <span class="rl-value">${count}</span>
            </div>`;
        }).join('')}
        </div>`;
}

/* Aggiorna legenda HTML del doughnut CPC */
function updateHealthLegend(data) {
    const el = document.getElementById('healthChartLegend');
    if (!el) return;
    const labels = ['B', 'C', 'C/D', 'D', 'Ceppaia'];
    const colors = ['#2cc15f', '#f39c12', '#c164a1', '#e74c3c', '#434343'];
    const total = data.reduce((a, b) => a + b, 0);
    el.innerHTML = labels.map((label, i) => {
        if (data[i] === 0) return '';
        const pct = total > 0 ? ((data[i] / total) * 100).toFixed(1) : '0.0';
        return `<div class="donut-legend-item">
            <div class="donut-legend-dot" style="background:${colors[i]}"></div>
            <span class="donut-legend-name">${label}</span>
            <span class="donut-legend-count">${data[i].toLocaleString('it-IT')} · ${pct}%</span>
        </div>`;
    }).join('');
}

function initCharts() {
    window.VU_DEBUG && console.log('📊 Inizializzazione grafici...');

    /* Altezze — lista classificata HTML */
    renderRankedList('heightChart', [], '#52be80', 6);

    /* CPC — doughnut con plugin testo centrale */
    const healthCtx = document.getElementById('healthChart');
    if (healthCtx && healthCtx.getContext) {
        chartsInstances.health = new Chart(healthCtx, {
            type: 'doughnut',
            data: {
                labels: ['B', 'C', 'C/D', 'D', 'Ceppaia'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: ['#2cc15f', '#f39c12', '#c164a1', '#e74c3c', '#434343'],
                    borderColor: '#fff',
                    borderWidth: 3,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                }
            },
            plugins: [doughnutCenterPlugin]
        });
        updateHealthLegend([0, 0, 0, 0, 0]);
    }

    /* Specie — lista classificata HTML */
    renderRankedList('speciesChart', [], '#27ae60', 12);

    /* Dimora — lista classificata HTML */
    renderRankedList('siteChart', [], '#3498db', 10);

    /* Foglie stagionali — lista stagionale HTML */
    renderSeasonalList('seasonalLeavesChart', { primavera: 0, estate: 0, autunno: 0, inverno: 0 });
    updateSeasonalLeavesChart();

    window.VU_DEBUG && console.log('✅ Grafici inizializzati');
}

/* Aggiorna lista foglie per singolo albero */
function updateSeasonalLeavesChartForSingleTree(tree) {
    renderSeasonalList('seasonalLeavesChart', {
        primavera: tree.foglie_primavera || 0,
        estate:    tree.foglie_estate    || 0,
        autunno:   tree.foglie_autunno   || 0,
        inverno:   tree.foglie_inverno   || 0
    });
}

/* Aggiorna lista foglie stagionali aggregato */
function updateSeasonalLeavesChart() {
    if (selectedTree) {
        updateSeasonalLeavesChartForSingleTree(selectedTree);
        return;
    }
    const totals = { primavera: 0, estate: 0, autunno: 0, inverno: 0 };
    filteredTrees.forEach(t => {
        totals.primavera += t.foglie_primavera || 0;
        totals.estate    += t.foglie_estate    || 0;
        totals.autunno   += t.foglie_autunno   || 0;
        totals.inverno   += t.foglie_inverno   || 0;
    });
    renderSeasonalList('seasonalLeavesChart', totals);
    window.VU_DEBUG && console.log('📊 Foglie stagionali aggiornate');
}

function updateCharts() {
    window.VU_DEBUG && console.log('📊 Aggiornamento grafici...');
    const treesToAnalyze = selectedTree ? [selectedTree] : filteredTrees;

    /* Altezze — lista classificata */
    const heightBins = [0, 0, 0, 0, 0, 0];
    treesToAnalyze.forEach(t => {
        if (t.altezza !== null && !isNaN(t.altezza)) {
            if (t.altezza < 8) heightBins[0]++;
            else if (t.altezza < 10) heightBins[1]++;
            else if (t.altezza < 12) heightBins[2]++;
            else if (t.altezza < 14) heightBins[3]++;
            else if (t.altezza < 16) heightBins[4]++;
            else heightBins[5]++;
        }
    });
    const heightLabels = ['6-8m', '8-10m', '10-12m', '12-14m', '14-16m', '>16m'];
    const heightItems = heightBins
        .map((count, i) => [heightLabels[i], count])
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]);
    renderRankedList('heightChart', heightItems, '#52be80', 6);

    /* CPC */
    const cpcData = [0, 0, 0, 0, 0];
    const cpcMap = { B: 0, C: 1, 'C/D': 2, D: 3, 'Ceppaia': 4 };
    treesToAnalyze.forEach(t => {
        if (cpcMap.hasOwnProperty(t.cpc)) cpcData[cpcMap[t.cpc]]++;
    });
    const cpcTotal = cpcData.reduce((a, b) => a + b, 0);
    const totalTrees = treesToAnalyze.length;
    const cpcMissing = totalTrees - cpcTotal;
    if (chartsInstances.health) {
        chartsInstances.health._totalTrees = totalTrees;
        chartsInstances.health.data.datasets[0].data = cpcData;
        chartsInstances.health.update();
        updateHealthLegend(cpcData);
    }
    const cpcNote = document.getElementById('healthChartNote');
    if (cpcNote) {
        if (cpcMissing > 0) {
            cpcNote.textContent = cpcMissing.toLocaleString('it-IT') + ' alberi senza dato CPC';
            cpcNote.style.display = 'block';
        } else {
            cpcNote.style.display = 'none';
        }
    }

    /* Specie — lista classificata */
    const speciesCount = {};
    treesToAnalyze.forEach(t => {
        if (t.specie) speciesCount[t.specie] = (speciesCount[t.specie] || 0) + 1;
    });
    renderRankedList('speciesChart', Object.entries(speciesCount).sort((a, b) => b[1] - a[1]), 'var(--pa-green-500)', 12, 'specieFilter');

    /* Dimora — lista classificata */
    const siteCount = {};
    treesToAnalyze.forEach(t => {
        if (t.sito) siteCount[t.sito] = (siteCount[t.sito] || 0) + 1;
    });
    renderRankedList('siteChart', Object.entries(siteCount).sort((a, b) => b[1] - a[1]), '#3498db', 10, 'siteFilter');

    /* Foglie stagionali */
    updateSeasonalLeavesChart();

    window.VU_DEBUG && console.log('✅ Grafici aggiornati');
}
