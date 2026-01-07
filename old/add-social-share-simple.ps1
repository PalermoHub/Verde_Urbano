# Script semplice per aggiungere CSS e JS social share

$files = @(
    "il-progetto.html",
    "fasi.html",
    "potatura.html",
    "radicali.html",
    "impianti.html",
    "sicurezza.html",
    "dati-economici.html",
    "tavole.html",
    "gruppo.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Green

        $content = Get-Content $file -Raw -Encoding UTF8

        # Aggiungi CSS se non presente
        if ($content -notmatch 'social-share\.css') {
            $content = $content -replace '(<link rel="stylesheet" href="css/image-popup\.css">)', "`$1`n    <link rel=`"stylesheet`" href=`"css/social-share.css`">"
            Write-Host "  CSS added" -ForegroundColor Cyan
        }

        # Aggiungi JS se non presente
        if ($content -notmatch '15_social_share\.js') {
            $content = $content -replace '(    <!-- Include Footer da file esterno -->)', "    <script src=`"js/15_social_share.js`"></script>`n`n`$1"
            Write-Host "  JS added" -ForegroundColor Cyan
        }

        $content | Set-Content $file -Encoding UTF8 -NoNewline
        Write-Host "  Done!" -ForegroundColor Green
    }
}

Write-Host "`nCompleted!" -ForegroundColor Green
