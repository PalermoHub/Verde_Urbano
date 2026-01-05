# Script per spostare il pulsante di ricerca dal header al banner in tutte le pagine

$pages = @(
    "il-progetto.html",
    "obiettivi.html",
    "fasi.html",
    "potatura.html",
    "radicali.html",
    "impianti.html",
    "sicurezza.html",
    "dati-economici.html"
)

foreach ($page in $pages) {
    Write-Host "Aggiornando $page..."

    $content = Get-Content $page -Raw -Encoding UTF8

    # 1. Rimuovi il pulsante di ricerca dall'header
    $headerPattern = '(\s*)<button class="search-trigger"[^>]*>.*?</button>\s*(<div class="info-icon")'
    $content = $content -replace $headerPattern, '$1$2'

    # 2. Aggiungi il contenitore banner-actions con i pulsanti nel banner
    $bannerButtonPattern = '(\s*)<button class="menu-toggle" id="menuToggle"[^>]*>.*?</button>'
    $newBannerButtons = @'
$1<div class="banner-actions">
                <button class="search-trigger" id="searchBtn" title="Cerca nel progetto (Ctrl+K)">
                    <i class="fas fa-search"></i>
                    <span class="search-trigger-text">Cerca</span>
                </button>
                <button class="menu-toggle" id="menuToggle" aria-label="Menu">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
'@

    if ($content -match $bannerButtonPattern) {
        $content = $content -replace $bannerButtonPattern, $newBannerButtons
        Write-Host "  - Spostato pulsante ricerca nel banner"
    }

    # Salva il file
    $content | Set-Content $page -Encoding UTF8 -NoNewline
    Write-Host "  Completato!`n"
}

Write-Host "Aggiornamento completato per tutte le pagine!"
