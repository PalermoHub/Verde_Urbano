# Script per aggiornare la struttura del banner in tutte le pagine HTML
# Sposta il pulsante info nel banner-actions insieme al pulsante cerca

$files = @(
    "il-progetto.html",
    "obiettivi.html",
    "fasi.html",
    "potatura.html",
    "radicali.html",
    "impianti.html",
    "sicurezza.html",
    "dati-economici.html"
)

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file

    if (Test-Path $filePath) {
        Write-Host "Aggiornamento di $file..." -ForegroundColor Green

        # Leggi il contenuto del file
        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Rimuovi il pulsante info dall'header-actions
        $content = $content -replace '(?s)<div class="header-actions">.*?<div class="info-icon".*?</div>.*?</div>', '<div class="header-actions">
                <!-- Info button spostato nel banner -->
            </div>'

        # Aggiungi il pulsante info nel banner-actions prima del pulsante cerca
        $content = $content -replace '(<div class="banner-actions">)', '$1
                <div class="info-icon" id="infoBtn" title="Informazioni su questa app">
                    <i class="fas fa-circle-info"></i>
                </div>'

        # Salva il file aggiornato
        Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline

        Write-Host "✓ $file aggiornato con successo" -ForegroundColor Cyan
    } else {
        Write-Host "✗ File non trovato: $file" -ForegroundColor Red
    }
}

Write-Host "`nAggiornamento completato!" -ForegroundColor Green
