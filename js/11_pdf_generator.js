// ===== GENERAZIONE PDF ALBERO =====
function generateTreePDF() {
    if (!selectedTree) {
        alert('Seleziona un albero prima di generare il PDF');
        return;
    }

    const tree = selectedTree;

    // Crea un iframe invisibile
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    padding: 20px;
                    line-height: 1.6;
                }
                h1 {
                    color: #27ae60;
                    text-align: center;
                    margin-bottom: 5px;
                    font-size: 24px;
                }
                .header {
                    text-align: center;
                    color: #888;
                    font-size: 12px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #27ae60;
                    padding-bottom: 15px;
                }
                h2 {
                    color: #1e8449;
                    margin: 20px 0 10px 0;
                    font-size: 14px;
                    border-bottom: 2px solid #27ae60;
                    padding-bottom: 5px;
                }
                table {
                    width: 100%;
                    margin-bottom: 15px;
                    border-collapse: collapse;
                }
                td {
                    padding: 8px;
                    border-bottom: 1px solid #eee;
                }
                td:first-child {
                    font-weight: bold;
                    width: 40%;
                }
                .section {
                    margin-bottom: 20px;
                    padding: 10px;
                    background: #f9f9f9;
                    border-left: 3px solid #27ae60;
                    border-radius: 4px;
                }
                .footer {
                    text-align: center;
                    color: #888;
                    font-size: 10px;
                    margin-top: 30px;
                    border-top: 1px solid #ddd;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <h1>Scheda Albero</h1>
            <div class="header">Dashboard Alberi Viale Emilia - Palermo</div>

            <h2>Informazioni Generali</h2>
            <table>
                <tr><td>ID Pianta:</td><td>${tree.id}</td></tr>
                <tr><td>Specie arborea:</td><td>${tree.specie}</td></tr>
                <tr><td>Dimora:</td><td>${tree.sito}</td></tr>
            </table>

            <h2>Dimensioni</h2>
            <table>
                <tr><td>Altezza (m):</td><td>${tree.altezza || 'n/a'}</td></tr>
                <tr><td>Diametro (cm):</td><td>${tree.diametro || 'n/a'}</td></tr>
            </table>

            <h2>Localizzazione Territoriale</h2>
            <table>
                <tr><td>Strada (Odonimo):</td><td>${tree.odonimo || '-'}</td></tr>
                <tr><td>UPL:</td><td>${tree.upl || '-'}</td></tr>
                <tr><td>Quartiere:</td><td>${tree.quartiere || '-'}</td></tr>
                <tr><td>Circoscrizione:</td><td>${tree.circoscrizione || '-'}</td></tr>
            </table>

            <h2>Stato di Salute e Interventi</h2>
            <table>
                <tr><td>CPC:</td><td style="color: ${cpcColors[tree.cpc]}; font-weight: bold;">${tree.cpc}</td></tr>
                <tr><td>Cod. Lavorazione:</td><td>${tree.codice}</td></tr>
                <tr><td>Prezzo Unitario (€):</td><td>${tree.prezzo.toFixed(2)}</td></tr>
            </table>

            <h2>Benefici Ambientali all'anno</h2>
            <div class="section" style="background: #e8f5e9; border-left: 4px solid #27ae60;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: bold; color: #27ae60; font-size: 12px; margin-bottom: 5px;">PRODUZIONE O₂ ANNUALE</div>
                        <div style="font-size: 18px; font-weight: bold; color: #1976d2;">${calculateO2Production(tree)} kg/anno</div>
                    </div>
                    <div>
                        <div style="font-weight: bold; color: #27ae60; font-size: 12px; margin-bottom: 5px;">ASSORBIMENTO CO₂ ANNUALE</div>
                        <div style="font-size: 18px; font-weight: bold; color: #27ae60;">${calculateCO2Absorption(tree)} kg/anno</div>
                    </div>
                </div>
            </div>
			<hr>
			<div class="section" style="font-size: 11px;">
                <strong>Nota metodologica:</strong> I valori sono calcolati mediante modelli scientifici standardizzati (USDA Forest Service, Urban Forest Carbon Study),
                considerando la specie botanica, le dimensioni dell'albero (altezza e diametro), e il suo stato fitosanitario (CPC).
                Questi sono valori indicativi di sequestro di CO₂ e produzione di O₂ per singolo esemplare arboreo.
            </div>

            <h2>Descrizione Intervento</h2>
            <div class="section">${tree.descrizione}</div>
            <br>
            <h2>Descrizione Classe Propensione Cedimento CPC</h2>
            <div class="section">${tree.descrizione_ccp}</div>

<h2>Documentazione Fotografica</h2>
            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 15px; page-break-inside: avoid;">
                    <div style="font-weight: bold; color: #27ae60; font-size: 11px; margin-bottom: 8px;">📸 Cercine e Tronco</div>
                    <div style="width: 100%; height: 200px; background: linear-gradient(180deg, #8B7355 0%, #654321 100%); border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
                        <svg viewBox="0 0 400 300" style="width: 100%; height: 100%;">
                            <defs>
                                <radialGradient id="barkGrad" cx="50%" cy="30%">
                                    <stop offset="0%" style="stop-color:#9b8b7e;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#5d4e37;stop-opacity:1" />
                                </radialGradient>
                            </defs>
                            <rect width="400" height="300" fill="#8B7355"/>
                            <ellipse cx="200" cy="150" rx="100" ry="120" fill="url(#barkGrad)"/>
                            <path d="M120 150 Q120 120 150 100 Q180 90 200 85 Q220 90 250 100 Q280 120 280 150" fill="#704214" opacity="0.3"/>
                            <path d="M130 180 Q130 160 160 150 Q190 145 200 142 Q210 145 240 150 Q270 160 270 180" fill="#5d4e37" opacity="0.4"/>
                            <circle cx="180" cy="130" r="8" fill="#3a3a3a" opacity="0.5"/>
                            <circle cx="220" cy="125" r="6" fill="#3a3a3a" opacity="0.5"/>
                            <circle cx="150" cy="160" r="7" fill="#3a3a3a" opacity="0.4"/>
                            <circle cx="250" cy="165" r="9" fill="#3a3a3a" opacity="0.4"/>
                            <text x="200" y="270" font-size="16" fill="white" text-anchor="middle" font-weight="bold">Cercine e Tronco</text>
                        </svg>
                    </div>
                    <div style="font-size: 9px; color: #999; margin-top: 5px; text-align: center;">Dettaglio del cercine e del tronco</div>
                </div>

                <div style="margin-bottom: 15px; page-break-inside: avoid;">
                    <div style="font-weight: bold; color: #27ae60; font-size: 11px; margin-bottom: 8px;">📸 Albero Intero</div>
                    <div style="width: 100%; height: 200px; background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%); border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <svg viewBox="0 0 400 300" style="width: 100%; height: 100%;">
                            <defs>
                                <radialGradient id="crown1" cx="50%" cy="40%">
                                    <stop offset="0%" style="stop-color:#2d8f2d;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#1a5e1a;stop-opacity:1" />
                                </radialGradient>
                                <radialGradient id="crown2" cx="45%" cy="35%">
                                    <stop offset="0%" style="stop-color:#3a9d3a;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#2d7a2d;stop-opacity:1" />
                                </radialGradient>
                            </defs>
                            <ellipse cx="200" cy="250" rx="180" ry="40" fill="#8B7355" opacity="0.3"/>
                            <rect x="175" y="170" width="50" height="90" fill="#8B6F47"/>
                            <ellipse cx="200" cy="120" rx="85" ry="90" fill="url(#crown1)"/>
                            <ellipse cx="140" cy="100" rx="65" ry="70" fill="url(#crown2)"/>
                            <ellipse cx="260" cy="100" rx="65" ry="70" fill="url(#crown2)"/>
                            <ellipse cx="200" cy="60" rx="60" ry="65" fill="#2d8f2d"/>
                            <circle cx="120" cy="130" r="20" fill="#3a9d3a" opacity="0.6"/>
                            <circle cx="280" cy="130" r="20" fill="#3a9d3a" opacity="0.6"/>
                            <rect x="0" y="260" width="400" height="40" fill="#8B7355" opacity="0.2"/>
                            <text x="200" y="290" font-size="14" fill="#333" text-anchor="middle" font-weight="bold">Albero Intero</text>
                        </svg>
                    </div>
                    <div style="font-size: 9px; color: #999; margin-top: 5px; text-align: center;">Vista completa dell'albero</div>
                </div>

                <div style="margin-bottom: 15px; page-break-inside: avoid;">
                    <div style="font-weight: bold; color: #27ae60; font-size: 11px; margin-bottom: 8px;">📸 Chioma</div>
                    <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #87CEEB 0%, #C8E6C9 100%); border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <svg viewBox="0 0 400 300" style="width: 100%; height: 100%;">
                            <defs>
                                <radialGradient id="leaf1" cx="50%" cy="40%">
                                    <stop offset="0%" style="stop-color:#4db84d;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#1a5e1a;stop-opacity:1" />
                                </radialGradient>
                                <radialGradient id="leaf2" cx="45%" cy="35%">
                                    <stop offset="0%" style="stop-color:#66bb6a;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#2d7a2d;stop-opacity:1" />
                                </radialGradient>
                            </defs>
                            <ellipse cx="200" cy="150" rx="110" ry="120" fill="url(#leaf1)"/>
                            <ellipse cx="150" cy="110" rx="75" ry="85" fill="url(#leaf2)"/>
                            <ellipse cx="250" cy="110" rx="75" ry="85" fill="url(#leaf2)"/>
                            <ellipse cx="200" cy="70" rx="65" ry="75" fill="#4db84d"/>
                            <circle cx="130" cy="150" r="25" fill="#66bb6a" opacity="0.7"/>
                            <circle cx="270" cy="150" r="25" fill="#66bb6a" opacity="0.7"/>
                            <circle cx="200" cy="200" r="28" fill="#66bb6a" opacity="0.8"/>
                            <path d="M180 90 L190 120 L200 100 L210 125 L220 95" stroke="#2d7a2d" stroke-width="2" fill="none" opacity="0.5"/>
                            <text x="200" y="270" font-size="14" fill="#333" text-anchor="middle" font-weight="bold">Dettaglio Chioma</text>
                        </svg>
                    </div>
                    <div style="font-size: 9px; color: #999; margin-top: 5px; text-align: center;">Dettaglio della chioma e fogliame</div>
                </div>
            </div>
			<p>
			Questa applicazione è stata sviluppata a scopo dimostrativo e educativo per illustrare le potenzialità dei sistemi di monitoraggio urbano e gestione dati geospaziali. I dati visualizzati sono sintetici e non rappresentano situazioni reali certificate.</p>
			<div class="footer">Documento DEMO generato il ${new Date().toLocaleDateString('it-IT')}</div>
        </body>
        </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Attendi il rendering e stampa
    setTimeout(() => {
        iframe.contentWindow.print();
        // Rimuovi l'iframe dopo la stampa
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 100);
    }, 500);
}
