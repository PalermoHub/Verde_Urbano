# Script PowerShell per aggiungere il CSS e JS della condivisione social a tutte le pagine HTML

$files = @(
    "il-progetto.html",
    "obiettivi.html",
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
        Write-Host "Aggiornando $file..." -ForegroundColor Green

        $content = Get-Content $file -Raw -Encoding UTF8

        # Verifica se il file CSS social-share.css non è già presente
        if ($content -notmatch 'social-share\.css') {
            # Cerca il pattern per l'inserimento del CSS
            if ($content -match '(<link rel="stylesheet" href="css/image-popup\.css">)') {
                $content = $content -replace '(<link rel="stylesheet" href="css/image-popup\.css">)',
                    '$1' + "`n`t<link rel=`"stylesheet`" href=`"css/social-share.css`">"
                Write-Host "  - Aggiunto CSS social-share.css" -ForegroundColor Cyan
            }
            elseif ($content -match '(<link rel="stylesheet" href="css/page-layout\.css">)') {
                $content = $content -replace '(<link rel="stylesheet" href="css/page-layout\.css">)',
                    '$1' + "`n`t<link rel=`"stylesheet`" href=`"css/social-share.css`">"
                Write-Host "  - Aggiunto CSS social-share.css" -ForegroundColor Cyan
            }
        }
        else {
            Write-Host "  - CSS già presente" -ForegroundColor Yellow
        }

        # Verifica se il file JS 15_social_share.js non è già presente
        if ($content -notmatch '15_social_share\.js') {
            # Cerca il punto dove inserire il JS (prima del caricamento del footer)
            if ($content -match '(<!-- Include Footer da file esterno -->)') {
                $content = $content -replace '(<!-- Include Footer da file esterno -->)',
                    '<script src="js/15_social_share.js"></script>' + "`n`n`t$1"
                Write-Host "  - Aggiunto JS 15_social_share.js" -ForegroundColor Cyan
            }
            # Se non trova il commento, cerca direttamente lo script del footer
            elseif ($content -match '(<script>\s*fetch\([''"]includes/footer\.html)') {
                $content = $content -replace '(<script>\s*fetch\([''"]includes/footer\.html)',
                    '<script src="js/15_social_share.js"></script>' + "`n`n`t<script>`n`t`tfetch('includes/footer.html"
                Write-Host "  - Aggiunto JS 15_social_share.js" -ForegroundColor Cyan
            }
        }
        else {
            Write-Host "  - JS già presente" -ForegroundColor Yellow
        }

        # Salva il file modificato
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        Write-Host "  $file aggiornato con successo!" -ForegroundColor Green
    }
    else {
        Write-Host "File $file non trovato, saltato." -ForegroundColor Red
    }
}

Write-Host "`nAggiornamento completato!" -ForegroundColor Green
Write-Host "Tutti i file HTML sono stati aggiornati con il supporto per la condivisione social." -ForegroundColor Green
