# Script PowerShell per aggiornare il caricamento della navbar in tutte le pagine HTML

$files = @(
    "fasi.html",
    "potatura.html",
    "radicali.html",
    "impianti.html",
    "sicurezza.html",
    "dati-economici.html"
)

$oldCode = @"
    <!-- Include Navigation da file esterno -->
    <div id="navigation-placeholder"></div>
    <script>
        fetch('includes/navigation-simple.html?v=' + Date.now())
            .then(response => response.text())
            .then(data => {
                document.getElementById('navigation-placeholder').innerHTML = data;

                // EVIDENZIA LA PAGINA ATTIVA
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const navLinks = document.querySelectorAll('.navbar-menu a');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === currentPage) {
                        link.classList.add('active');
                        console.log('✓ Pagina attiva evidenziata:', currentPage);
                    }
                });

                // Ricarica lo script di navigazione
                const script = document.createElement('script');
                script.src = 'js/navigation.js';
                document.body.appendChild(script);
            })
            .catch(error => console.error('Errore caricamento navigazione:', error));
    </script>
"@

$newCode = @"
    <!-- Include Navigation da file esterno -->
    <div id="navigation-placeholder"></div>
    <script src="js/load-navigation-cached.js"></script>
"@

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Aggiornamento di $file..."
        $content = Get-Content $file -Raw
        $content = $content -replace [regex]::Escape($oldCode), $newCode
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "✓ $file aggiornato"
    } else {
        Write-Host "✗ $file non trovato"
    }
}

Write-Host "`nAggiornamento completato!"
