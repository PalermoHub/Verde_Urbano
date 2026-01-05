# Script migliorato per spostare il pulsante ricerca nelle pagine rimanenti

$pages = @(
    "il-progetto.html",
    "potatura.html",
    "radicali.html",
    "impianti.html",
    "sicurezza.html",
    "dati-economici.html"
)

foreach ($page in $pages) {
    if (!(Test-Path $page)) {
        Write-Host "File $page non trovato, skip..."
        continue
    }

    Write-Host "Aggiornando $page..."
    $content = Get-Content $page -Raw -Encoding UTF8
    $modified = $false

    # STEP 1: Rimuovi il pulsante search dall'header
    $oldHeader = @'
            <div class="header-actions">
                <button class="search-trigger" id="searchBtn" title="Cerca nel progetto (Ctrl+K)">
                    <i class="fas fa-search"></i>
                    <span class="search-trigger-text">Cerca</span>
                    <span class="search-trigger-shortcut">Ctrl+K</span>
                </button>
                <div class="info-icon" id="infoBtn" title="Informazioni su questa app">
                    <i class="fas fa-circle-info"></i>
                </div>

            </div>
'@

    $newHeader = @'
            <div class="header-actions">
                <div class="info-icon" id="infoBtn" title="Informazioni su questa app">
                    <i class="fas fa-circle-info"></i>
                </div>

            </div>
'@

    if ($content -match [regex]::Escape($oldHeader)) {
        $content = $content.Replace($oldHeader, $newHeader)
        Write-Host "  - Rimosso pulsante dall'header"
        $modified = $true
    }

    # STEP 2: Aggiungi banner-actions nel banner
    $oldBanner = @'
            </h2>

			 <button class="menu-toggle" id="menuToggle" aria-label="Menu">
                <i class="fas fa-bars"></i>
                </button>
        </div>
    </div>
'@

    $newBanner = @'
            </h2>

			<div class="banner-actions">
                <button class="search-trigger" id="searchBtn" title="Cerca nel progetto (Ctrl+K)">
                    <i class="fas fa-search"></i>
                    <span class="search-trigger-text">Cerca</span>
                </button>
                <button class="menu-toggle" id="menuToggle" aria-label="Menu">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    </div>
'@

    if ($content -match [regex]::Escape($oldBanner)) {
        $content = $content.Replace($oldBanner, $newBanner)
        Write-Host "  - Aggiunto pulsante al banner"
        $modified = $true
    }

    # Salva solo se modificato
    if ($modified) {
        $content | Set-Content $page -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Completato!`n"
    } else {
        Write-Host "  ⚠ Nessuna modifica necessaria`n"
    }
}

Write-Host "`n✓ Processo completato!"
