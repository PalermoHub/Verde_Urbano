# Script per integrare il sistema di ricerca in tutte le pagine HTML

$pages = @(
    "il-progetto.html",
    "potatura.html",
    "radicali.html",
    "impianti.html",
    "sicurezza.html",
    "dati-economici.html"
)

foreach ($page in $pages) {
    Write-Host "Aggiornando $page..."

    $content = Get-Content $page -Raw -Encoding UTF8

    # 1. Aggiungi CSS search.css se non presente
    if ($content -notmatch 'search\.css') {
        $content = $content -replace '(<link rel="stylesheet" href="css/page-layout\.css">)', "`$1`n    <link rel=`"stylesheet`" href=`"css/search.css`">"
        Write-Host "  - Aggiunto search.css"
    }

    # 2. Aggiungi pulsante di ricerca nell'header se non presente
    if ($content -notmatch 'searchBtn') {
        $headerPattern = '(<div class="header-actions">\s*<div class="info-icon")'
        $searchButton = @'
<div class="header-actions">
                <button class="search-trigger" id="searchBtn" title="Cerca nel progetto (Ctrl+K)">
                    <i class="fas fa-search"></i>
                    <span class="search-trigger-text">Cerca</span>
                    <span class="search-trigger-shortcut">Ctrl+K</span>
                </button>
                <div class="info-icon"
'@
        $content = $content -replace $headerPattern, $searchButton
        Write-Host "  - Aggiunto pulsante di ricerca"
    }

    # 3. Aggiungi script search-engine.js e search-ui.js se non presenti
    if ($content -notmatch 'search-engine\.js') {
        $content = $content -replace '(<script src="js/01_modal\.js"></script>)', "<script src=`"js/search-engine.js`"></script>`n    <script src=`"js/search-ui.js`"></script>`n    `$1"
        Write-Host "  - Aggiunti script di ricerca"
    }

    # Salva il file
    $content | Set-Content $page -Encoding UTF8 -NoNewline
    Write-Host "  Completato!`n"
}

Write-Host "Integrazione completata per tutte le pagine!"
