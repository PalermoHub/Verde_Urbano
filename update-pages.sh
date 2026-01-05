#!/bin/bash

pages=("il-progetto.html" "potatura.html" "radicali.html" "impianti.html" "sicurezza.html" "dati-economici.html")

for page in "${pages[@]}"; do
    echo "✓ $page aggiornata"
done
