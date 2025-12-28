# Script per aggiornare tutte le pagine HTML con il codice per evidenziare la pagina attiva

$files = @(
    "fasi.html",
    "potatura.html",
    "radicali.html",
    "impianti.html",
    "sicurezza.html",
    "dati-economici.html",
    "index.html"
)

$oldCode = @"
                // Ricarica lo script di navigazione
                const script = document.createElement('script');
                script.src = 'js/navigation.js';
                document.body.appendChild(script);
"@

$newCode = @"

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
"@

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $newContent = $content -replace [regex]::Escape($oldCode), $newCode

        if ($content -ne $newContent) {
            Set-Content $file $newContent -Encoding UTF8 -NoNewline
            Write-Host "✓ Aggiornato: $file"
        } else {
            Write-Host "- Già aggiornato: $file"
        }
    } else {
        Write-Host "✗ File non trovato: $file"
    }
}

Write-Host "`nAggiornamento completato!"
