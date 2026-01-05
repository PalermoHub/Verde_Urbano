// Page Loader Handler
(function() {
    'use strict';

    let countInterval = null;
    let currentCount = 0;
    let targetCount = 0;
    let isDataLoaded = false;
    let currentProgress = 0;

    // Show loader function
    function showLoader() {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            document.body.classList.add('loading-active');
            loader.classList.remove('hidden');
        }
    }

    // Hide loader function
    function hideLoader() {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            // Stop counting if still running
            if (countInterval) {
                clearInterval(countInterval);
                countInterval = null;
            }

            loader.classList.add('hidden');
            document.body.classList.remove('loading-active');
        }
    }

    // Update progress bar
    function updateProgress(percentage) {
        const progressBar = document.getElementById('loaderProgressBar');
        const percentageText = document.getElementById('loaderPercentage');

        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        if (percentageText) {
            percentageText.textContent = Math.floor(percentage) + '%';
        }
        currentProgress = percentage;
    }

    // Update status text
    function updateStatus(text) {
        const statusText = document.getElementById('loaderStatusText');
        if (statusText) {
            statusText.innerHTML = text;
        }
    }

    // Update tree color based on progress
    function updateTreeColor(progress) {
        const layer1 = document.querySelector('.tree-layer.layer-1');
        const layer2 = document.querySelector('.tree-layer.layer-2');
        const layer3 = document.querySelector('.tree-layer.layer-3');
        const layer4 = document.querySelector('.tree-layer.layer-4');
        const layer5 = document.querySelector('.tree-layer.layer-5');
        const layer6 = document.querySelector('.tree-layer.layer-6');
        const layer7 = document.querySelector('.tree-layer.layer-7');
        const layer8 = document.querySelector('.tree-layer.layer-8');

        if (!layer1 || !layer2 || !layer3 || !layer4 || !layer5 || !layer6 || !layer7 || !layer8) return;

        const allLayers = [layer1, layer2, layer3, layer4, layer5, layer6, layer7, layer8];

        // Rimuovi classi precedenti
        allLayers.forEach(layer => {
            layer.classList.remove('active-1', 'active-2', 'active-3', 'active-4', 'active-5', 'active-6', 'active-7', 'active-8', 'complete');
        });

        // Colora progressivamente in base alla percentuale (dal basso verso l'alto, come un pino che cresce)
        if (progress >= 98) {
            // Albero completamente verde scurissimo
            allLayers.forEach(layer => layer.classList.add('complete'));
        } else if (progress >= 88) {
            // 8 strati colorati con tutte le sfumature
            layer1.classList.add('active-1');
            layer2.classList.add('active-2');
            layer3.classList.add('active-3');
            layer4.classList.add('active-4');
            layer5.classList.add('active-5');
            layer6.classList.add('active-6');
            layer7.classList.add('active-7');
            layer8.classList.add('active-8');
        } else if (progress >= 75) {
            // 7 strati colorati (dal basso)
            layer2.classList.add('active-1');
            layer3.classList.add('active-2');
            layer4.classList.add('active-3');
            layer5.classList.add('active-4');
            layer6.classList.add('active-5');
            layer7.classList.add('active-6');
            layer8.classList.add('active-7');
        } else if (progress >= 63) {
            // 6 strati colorati
            layer3.classList.add('active-1');
            layer4.classList.add('active-2');
            layer5.classList.add('active-3');
            layer6.classList.add('active-4');
            layer7.classList.add('active-5');
            layer8.classList.add('active-6');
        } else if (progress >= 50) {
            // 5 strati colorati
            layer4.classList.add('active-1');
            layer5.classList.add('active-2');
            layer6.classList.add('active-3');
            layer7.classList.add('active-4');
            layer8.classList.add('active-5');
        } else if (progress >= 38) {
            // 4 strati colorati
            layer5.classList.add('active-1');
            layer6.classList.add('active-2');
            layer7.classList.add('active-3');
            layer8.classList.add('active-4');
        } else if (progress >= 25) {
            // 3 strati colorati
            layer6.classList.add('active-1');
            layer7.classList.add('active-2');
            layer8.classList.add('active-3');
        } else if (progress >= 15) {
            // 2 strati colorati
            layer7.classList.add('active-1');
            layer8.classList.add('active-2');
        } else if (progress >= 8) {
            // 1 strato colorato (il più basso)
            layer8.classList.add('active-1');
        }
    }

    // Animate tree counter
    function animateCounter(target) {
        const counterElement = document.getElementById('treeCount');
        if (!counterElement) return;

        targetCount = target;
        const duration = 2500; // 2.5 secondi
        const steps = 80;
        const increment = target / steps;
        const stepDuration = duration / steps;

        currentCount = 0;

        if (countInterval) {
            clearInterval(countInterval);
        }

        // Inizia il conteggio
        updateStatus('<i class="fas fa-spinner fa-spin"></i> Caricamento alberi in corso...');

        countInterval = setInterval(function() {
            currentCount += increment;

            if (currentCount >= targetCount) {
                currentCount = targetCount;
                counterElement.textContent = Math.floor(currentCount).toLocaleString('it-IT');
                updateProgress(100);
                updateTreeColor(100);
                updateStatus('<i class="fas fa-check-circle"></i> Caricamento completato!');
                clearInterval(countInterval);
                countInterval = null;

                // Dopo aver completato il conteggio, aspetta 1.5 secondi e nascondi il loader
                if (isDataLoaded) {
                    setTimeout(function() {
                        hideLoader();
                    }, 1500);
                }
            } else {
                counterElement.textContent = Math.floor(currentCount).toLocaleString('it-IT');
                // Aggiorna progress bar proporzionalmente
                const progress = (currentCount / targetCount) * 100;
                updateProgress(progress);
                updateTreeColor(progress);
            }
        }, stepDuration);
    }

    // Function to update tree count (chiamata dal codice esterno)
    function updateTreeCount(count) {
        animateCounter(count);
    }

    // Function to signal data is loaded
    function dataLoaded() {
        isDataLoaded = true;
        // Se il conteggio è già completato, nascondi dopo 2 secondi
        if (!countInterval) {
            setTimeout(function() {
                hideLoader();
            }, 1000);
        }
    }

    // Initialize loader on page load
    function initLoader() {
        // Show loader initially
        showLoader();
        updateProgress(0);
        updateStatus('<i class="fas fa-spinner fa-spin"></i> Inizializzazione in corso...');

        // Simula un progresso iniziale
        let initialProgress = 0;
        const initialProgressInterval = setInterval(function() {
            if (initialProgress < 20) {
                initialProgress += 2;
                updateProgress(initialProgress);
            } else {
                clearInterval(initialProgressInterval);
            }
        }, 100);

        // Safety timeout: hide loader after max 12 seconds
        setTimeout(function() {
            if (countInterval) {
                clearInterval(countInterval);
            }
            hideLoader();
        }, 12000);
    }

    // Start loader when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoader);
    } else {
        initLoader();
    }

    // Expose functions globally if needed
    window.showLoader = showLoader;
    window.hideLoader = hideLoader;
    window.updateTreeCount = updateTreeCount;
    window.loaderDataLoaded = dataLoaded;
    window.updateLoaderProgress = updateProgress;
    window.updateLoaderStatus = updateStatus;
})();
