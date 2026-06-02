(function () {
  'use strict';

  var MOBILE_BP = 768;
  var current = 'mappa';
  var _gpsAutoTriggered = false;

  var TABS = ['mappa', 'filtri', 'stats', 'cerca', 'schede'];

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function setPage(page) {
    if (!isMobile()) return;

    // Tap tab già attivo → torna alla mappa
    if (page === current && page !== 'mappa') page = 'mappa';

    var prev = current;
    current = page;
    document.body.setAttribute('data-page', page);

    // Update bottom nav active indicators
    TABS.forEach(function (t) {
      var btn = document.getElementById('bnav-' + t);
      if (btn) btn.classList.toggle('bnav-active', t === page);
    });

    // Cleanup previous page
    if (prev === 'cerca' && page !== 'cerca') {
      var cerca = document.getElementById('modal-cerca');
      if (cerca) cerca.classList.remove('open');
    }
    if (prev === 'schede' && page !== 'schede') {
      var schede = document.getElementById('modal-schede');
      if (schede) schede.classList.remove('open');
    }

    // Auto-GPS alla prima visualizzazione mappa (solo se permesso già concesso)
    if (page === 'mappa' && !_gpsAutoTriggered) {
      _gpsAutoTriggered = true;
      setTimeout(function () {
        if (!navigator.permissions) return;
        navigator.permissions.query({ name: 'geolocation' }).then(function (s) {
          if (s.state === 'granted' && typeof tbGps === 'function') tbGps();
        }).catch(function () {});
      }, 800);
    }

    // Setup new page
    switch (page) {
      case 'filtri':
        var sb = document.getElementById('sidebar');
        if (sb) sb.classList.remove('collapsed');
        break;

      case 'stats':
        var ss = document.getElementById('stats-sidebar');
        if (ss) { ss.classList.remove('ss-hidden'); }
        break;

      case 'cerca':
        var c = document.getElementById('modal-cerca');
        if (c) c.classList.add('open');
        break;

      case 'schede':
        var ms = document.getElementById('modal-schede');
        if (ms) ms.classList.add('open');
        if (typeof openMieSchede === 'function') openMieSchede();
        break;
    }
  }

  window.navTo = setPage;

  function init() {
    if (isMobile()) {
      document.body.setAttribute('data-page', 'mappa');
      var btn = document.getElementById('bnav-mappa');
      if (btn) btn.classList.add('bnav-active');
    }
  }

  // MutationObserver: panel open → close bottom nav coverage
  document.addEventListener('DOMContentLoaded', function () {
    init();

    var panel = document.getElementById('panel');
    if (panel) {
      new MutationObserver(function () {
        if (!isMobile()) return;
        // Panel state managed by lipu.js — nothing to override
      }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    }
  });

  window.addEventListener('resize', function () {
    if (!isMobile()) {
      document.body.removeAttribute('data-page');
    } else if (!document.body.hasAttribute('data-page')) {
      document.body.setAttribute('data-page', 'mappa');
    }
  });
})();
