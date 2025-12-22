// ===== DOWNLOAD RELAZIONE TECNICA DA FILE LINKATO =====
function downloadRelazione() {
    // URL del file PDF - MODIFICA CON L'URL REALE DEL TUO FILE
    const pdfUrl = 'https://palermohub.github.io/Verde_Urbano/Analisi_Viale_Emilia_Completa.pdf';

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Relazione_Tecnica_Viale_Emilia.pdf';

    try {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ Download relazione tecnica avviato');
    } catch (error) {
        console.error('❌ Errore nel download:', error);
        alert('Errore nel download. Verifica che l\'URL sia corretto.');
    }
}

// ===== STAMPA MAPPA IN PDF =====
function printMapPdf() {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generazione...';
    btn.disabled = true;

    setTimeout(() => {
        try {
            // Crea un contenitore temporaneo per il PDF - LANDSCAPE
            const pdfContainer = document.createElement('div');
            pdfContainer.style.width = '297mm';
            pdfContainer.style.height = '210mm';
            pdfContainer.style.padding = '12mm';
            pdfContainer.style.fontFamily = 'Segoe UI, Arial, sans-serif';
            pdfContainer.style.backgroundColor = '#ffffff';
            pdfContainer.style.display = 'flex';
            pdfContainer.style.flexDirection = 'column';
            pdfContainer.style.fontSize = '12px';
            pdfContainer.style.color = '#333';

            // HEADER
            const header = document.createElement('div');
            header.style.flex = '0 0 auto';
            header.style.borderBottom = '3px solid #27ae60';
            header.style.paddingBottom = '8mm';
            header.style.marginBottom = '8mm';
            const odonimoFilter = document.getElementById('odonimoFilter').value;
            const titleText = odonimoFilter ? `alberi ${odonimoFilter}` : 'Verde Urbano';
            header.innerHTML = `
                <div style="font-size: 18px; font-weight: 700; color: #27ae60; margin-bottom: 4px;">
                    <i class="fas fa-tree"></i> Demo prototipale | ${titleText}
                </div>
                <div style="font-size: 11px; color: #666;">
                    Palermo 2025 - Monitoraggio e analisi dello stato di salute del verde urbano
                </div>
            `;
            pdfContainer.appendChild(header);

            // SEZIONE MAPPA (la parte centrale - la più grande)
            const mapSection = document.createElement('div');
            mapSection.style.flex = '1 1 auto';
            mapSection.style.display = 'flex';
            mapSection.style.justifyContent = 'center';
            mapSection.style.alignItems = 'center';
            mapSection.style.marginBottom = '8mm';
            mapSection.style.overflow = 'hidden';

            // Clona la mappa
            const mapElement = document.getElementById('map');
            const mapClone = mapElement.cloneNode(true);
            mapClone.style.width = '100%';
            mapClone.style.height = '110mm';
            mapClone.style.borderRadius = '4px';
            mapClone.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            mapSection.appendChild(mapClone);

            pdfContainer.appendChild(mapSection);

            // FOOTER
            const footer = document.createElement('div');
            footer.style.flex = '0 0 auto';
            footer.style.borderTop = '2px solid #27ae60';
            footer.style.paddingTop = '8mm';
            footer.style.fontSize = '10px';
            footer.style.lineHeight = '1.4';
            footer.style.color = '#555';
            footer.innerHTML = `
                <div style="font-weight: 700; color: #27ae60; margin-bottom: 4px; font-size: 11px;">
                    <i class="fas fa-lightbulb"></i> Natura della Demo
                </div>
                <div style="text-align: justify;">
                    Questa è una demo prototipale che mostra i dati di monitoraggio relativi a una singola strada (Viale Emilia). Il progetto completo di cui fa parte è molto più articolato e comprende ulteriori strade, zone e funzionalità avanzate non ancora rappresentate in questa versione.
                </div>
            `;
            pdfContainer.appendChild(footer);

            // Aggiungi temporaneamente al DOM per il rendering
            pdfContainer.style.position = 'fixed';
            pdfContainer.style.top = '-5000px';
            pdfContainer.style.left = '0';
            pdfContainer.style.zIndex = '-1';
            document.body.appendChild(pdfContainer);

            // Usa html2canvas per catturare l'elemento
            html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                allowTaint: true,
                logging: false
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);

                // Crea il PDF con jsPDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                // Calcola le dimensioni per adattare l'immagine al PDF
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pdfWidth;
                const imgHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

                // Aggiungi timbro "work in progress" ruotato di 45°
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const centerX = pageWidth / 2
                const centerY = pageHeight / 1.5;

                // Imposta le proprietà del timbro
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(30);
                pdf.setTextColor(220, 80, 80); // Rosso

                // Crea uno stato grafico con trasparenza
                pdf.setGState(new pdf.GState({opacity: 0.75}));

                // Ruota il testo di 45°
                pdf.text('Work in progress - Mappa non corretta', centerX, centerY, {
                    align: 'center',
                    baseline: 'middle',
                    angle: 25
                });

                pdf.save('Mappa_Viale_Emilia.pdf');

                console.log('✅ Mappa stampata in PDF con layout landscape');

                // Rimuovi il contenitore temporaneo
                document.body.removeChild(pdfContainer);

                // Ripristina il pulsante
                btn.innerHTML = originalText;
                btn.disabled = false;

            }).catch(error => {
                console.error('❌ Errore nella stampa:', error);
                alert('Errore nella generazione del PDF. Riprova.');
                if (document.body.contains(pdfContainer)) {
                    document.body.removeChild(pdfContainer);
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
            });

        } catch (error) {
            console.error('❌ Errore nella stampa:', error);
            alert('Errore nella generazione del PDF. Riprova.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }, 100);
}
