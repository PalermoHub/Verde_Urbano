// Page Loader Handler
(function() {
    'use strict';

    let countInterval = null;
    let currentCount = 0;
    let targetCount = 0;
    let isDataLoaded = false;

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

    // Animate tree counter
    function animateCounter(target) {
        const counterElement = document.getElementById('treeCount');
        if (!counterElement) return;

        targetCount = target;
        const duration = 2000; // 2 secondi
        const steps = 60;
        const increment = target / steps;
        const stepDuration = duration / steps;

        currentCount = 0;

        if (countInterval) {
            clearInterval(countInterval);
        }

        countInterval = setInterval(function() {
            currentCount += increment;

            if (currentCount >= targetCount) {
                currentCount = targetCount;
                counterElement.textContent = Math.floor(currentCount).toLocaleString('it-IT');
                clearInterval(countInterval);
                countInterval = null;

                // Dopo aver completato il conteggio, aspetta 2 secondi e nascondi il loader
                if (isDataLoaded) {
                    setTimeout(function() {
                        hideLoader();
                    }, 2000);
                }
            } else {
                counterElement.textContent = Math.floor(currentCount).toLocaleString('it-IT');
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

        // Safety timeout: hide loader after max 15 seconds
        setTimeout(function() {
            if (countInterval) {
                clearInterval(countInterval);
            }
            hideLoader();
        }, 9000);
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
})();
