// ===== TIME-SLIDER F1→F2→F3 (scaffold, attivo solo se dati date presenti) =====
(function() {
    'use strict';

    let _datesByTree = null;     // Map<treeId, {f1:Date, f2:Date, f3:Date}>
    let _minTime = null, _maxTime = null;
    let _spanDays = 0;
    let _ready = false;
    let _hasData = false;
    let _playTimer = null;

    /** Parse "DD/MM/YYYY", "YYYY-MM-DD", or "DD-MM-YYYY". Returns Date or null. */
    function parseDate(s) {
        if (!s || typeof s !== 'string') return null;
        s = s.trim();
        if (!s || s === '-') return null;
        let m;
        // ISO YYYY-MM-DD
        m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
        // DD/MM/YYYY or DD-MM-YYYY
        m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
        // Fallback: native parse
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }

    function fmtDate(d) {
        if (!d) return '—';
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    /** Scan allTrees for dates, build the index, return whether any data exists. */
    function buildDateIndex() {
        if (typeof allTrees === 'undefined' || !allTrees.length) return false;
        const idx = {};
        let min = Infinity, max = -Infinity;
        let any = false;
        for (const t of allTrees) {
            const f1 = parseDate(t.data_lav_f1);
            const f2 = parseDate(t.data_lav_f2);
            const f3 = parseDate(t.data_lav_f3);
            if (!f1 && !f2 && !f3) continue;
            any = true;
            idx[t.id] = { f1, f2, f3 };
            [f1, f2, f3].forEach(d => { if (d) { const tt = d.getTime(); if (tt < min) min = tt; if (tt > max) max = tt; } });
        }
        if (!any) return false;
        _datesByTree = idx;
        _minTime = min;
        _maxTime = max;
        _spanDays = Math.max(1, Math.round((max - min) / 86400000));
        return true;
    }

    /** Returns currently selected [startDate, endDate] from slider position. */
    function getRange() {
        const startEl = document.getElementById('vuTSStart');
        const endEl   = document.getElementById('vuTSEnd');
        if (!startEl || !endEl || !_hasData) return null;
        const s = parseInt(startEl.value, 10);
        const e = parseInt(endEl.value, 10);
        const startDate = new Date(_minTime + (s / 100) * (_maxTime - _minTime));
        const endDate   = new Date(_minTime + (e / 100) * (_maxTime - _minTime));
        return [startDate, endDate];
    }

    /** Returns the set of active phases (F1/F2/F3) from checkboxes. */
    function getActivePhases() {
        const phases = [];
        if (document.getElementById('vuTSPhaseF1')?.checked) phases.push('f1');
        if (document.getElementById('vuTSPhaseF2')?.checked) phases.push('f2');
        if (document.getElementById('vuTSPhaseF3')?.checked) phases.push('f3');
        return phases;
    }

    /** Whether the time-slider is currently filtering (not full range). */
    function isActive() {
        if (!_hasData) return false;
        const startEl = document.getElementById('vuTSStart');
        const endEl   = document.getElementById('vuTSEnd');
        if (!startEl || !endEl) return false;
        return parseInt(startEl.value, 10) > 0 || parseInt(endEl.value, 10) < 100;
    }

    /** Predicate used by applyFilters. Returns true if tree passes the time filter. */
    function passes(tree) {
        if (!_hasData) return true;
        if (!isActive()) return true;
        const dates = _datesByTree[tree.id];
        if (!dates) return false;  // no work dates → exclude from time filter
        const range = getRange();
        if (!range) return true;
        const [s, e] = range;
        const phases = getActivePhases();
        if (phases.length === 0) return false;
        for (const ph of phases) {
            const d = dates[ph];
            if (d && d.getTime() >= s.getTime() && d.getTime() <= e.getTime()) return true;
        }
        return false;
    }

    function updateLabels() {
        const range = getRange();
        const ls = document.getElementById('vuTSStartLabel');
        const le = document.getElementById('vuTSEndLabel');
        const rg = document.getElementById('vuTSRange');
        if (range) {
            if (ls) ls.textContent = fmtDate(range[0]);
            if (le) le.textContent = fmtDate(range[1]);
            if (rg) rg.textContent = isActive()
                ? (fmtDate(range[0]) + ' \u2192 ' + fmtDate(range[1]))
                : 'Tutto il periodo';
        } else {
            if (ls) ls.textContent = '\u2014';
            if (le) le.textContent = '\u2014';
            if (rg) rg.textContent = '\u2014';
        }
    }

    function updateHighlight() {
        const minEl = document.getElementById('vuTSStart');
        const maxEl = document.getElementById('vuTSEnd');
        const hl = document.getElementById('vuTSHL');
        if (!minEl || !maxEl || !hl) return;
        const lo = parseInt(minEl.value, 10);
        const hi = parseInt(maxEl.value, 10);
        hl.style.left = lo + '%';
        hl.style.right = (100 - hi) + '%';
    }

    function onSliderInput(input) {
        const minEl = document.getElementById('vuTSStart');
        const maxEl = document.getElementById('vuTSEnd');
        let lo = parseInt(minEl.value, 10);
        let hi = parseInt(maxEl.value, 10);
        if (lo > hi) {
            if (input === minEl) maxEl.value = lo;
            else                 minEl.value = hi;
        }
        updateHighlight();
        updateLabels();
        if (typeof applyFilters === 'function') applyFilters();
    }

    function reset() {
        const minEl = document.getElementById('vuTSStart');
        const maxEl = document.getElementById('vuTSEnd');
        if (minEl) minEl.value = 0;
        if (maxEl) maxEl.value = 100;
        ['vuTSPhaseF1','vuTSPhaseF2','vuTSPhaseF3'].forEach(id => { const el = document.getElementById(id); if (el) el.checked = true; });
        updateHighlight();
        updateLabels();
        if (typeof applyFilters === 'function') applyFilters();
    }

    function toggleOpen(force) {
        const panel = document.getElementById('vuTimeslider');
        const btn   = document.getElementById('vuTSToggle');
        const toolbarBtn = document.querySelector('.zoom-bar-time');
        if (!panel) return;
        const open = (typeof force === 'boolean') ? force : !panel.classList.contains('is-open');
        panel.classList.toggle('is-open', open);
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (toolbarBtn) toolbarBtn.classList.toggle('is-active', open);
    }

    function startPlay() {
        if (!_hasData) return;
        const playBtn = document.getElementById('vuTSPlay');
        const minEl = document.getElementById('vuTSStart');
        const maxEl = document.getElementById('vuTSEnd');
        if (!playBtn || !minEl || !maxEl) return;
        if (_playTimer) { stopPlay(); return; }
        // Anima il bordo destro da current → 100
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.title = 'Pausa';
        const startVal = parseInt(maxEl.value, 10);
        let v = startVal;
        _playTimer = setInterval(() => {
            v += 1;
            if (v > 100) { stopPlay(); return; }
            maxEl.value = v;
            updateHighlight();
            updateLabels();
            if (typeof applyFilters === 'function') applyFilters();
        }, 200);
    }
    function stopPlay() {
        if (_playTimer) { clearInterval(_playTimer); _playTimer = null; }
        const playBtn = document.getElementById('vuTSPlay');
        if (playBtn) { playBtn.innerHTML = '<i class="fas fa-play"></i>'; playBtn.title = 'Anima il periodo'; }
    }

    function init() {
        if (_ready) return;
        _ready = true;
        _hasData = buildDateIndex();
        const panel = document.getElementById('vuTimeslider');
        if (panel) panel.classList.toggle('has-data', _hasData);

        // Enable controls if data exists
        const startEl = document.getElementById('vuTSStart');
        const endEl   = document.getElementById('vuTSEnd');
        const playBtn = document.getElementById('vuTSPlay');
        if (_hasData) {
            [startEl, endEl, playBtn].forEach(el => { if (el) el.disabled = false; });
        }

        // Wire events
        if (startEl) startEl.addEventListener('input', () => onSliderInput(startEl));
        if (endEl)   endEl.addEventListener('input',   () => onSliderInput(endEl));
        ['vuTSPhaseF1','vuTSPhaseF2','vuTSPhaseF3'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => { if (typeof applyFilters === 'function') applyFilters(); });
        });
        document.getElementById('vuTSReset')?.addEventListener('click', reset);
        document.getElementById('vuTSPlay')?.addEventListener('click', startPlay);
        document.getElementById('vuTSClose')?.addEventListener('click', () => toggleOpen(false));
        document.getElementById('vuTSToggle')?.addEventListener('click', () => toggleOpen());

        updateHighlight();
        updateLabels();
        window.VU_DEBUG && console.log('[timeslider] init', { hasData: _hasData, span: _spanDays + 'd' });
    }

    // Expose for use by filter logic + chip renderer
    window.vuTimeSlider = {
        init: init,
        passes: passes,
        isActive: isActive,
        getRange: getRange,
        getActivePhases: getActivePhases
    };

    // Auto-init after data is loaded. Init is called from 04_init.js after applyFilters,
    // but we also try via a one-shot DOMContentLoaded as fallback.
    document.addEventListener('DOMContentLoaded', () => {
        // Delay slightly so allTrees is populated
        const tryInit = (attempts) => {
            if (typeof allTrees !== 'undefined' && allTrees.length) { init(); return; }
            if (attempts <= 0) { init(); return; }  // init anyway with hasData=false
            setTimeout(() => tryInit(attempts - 1), 500);
        };
        tryInit(10);
    });
})();
