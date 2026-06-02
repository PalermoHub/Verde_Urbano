(function () {
  var STORAGE_KEY = 'lipu-theme';

  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
  }

  function updateBtn() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var dark = document.documentElement.classList.contains('dark');
    btn.innerHTML = dark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.title = dark ? 'Passa al tema chiaro' : 'Passa al tema scuro';
  }

  // Sempre chiaro al caricamento — ignora preferenza salvata
  applyTheme(false);

  window.toggleTheme = function () {
    var isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem(STORAGE_KEY, isDark ? 'light' : 'dark');
    applyTheme(!isDark);
    updateBtn();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { dark: !isDark } }));
  };

  document.addEventListener('DOMContentLoaded', updateBtn);
})();
