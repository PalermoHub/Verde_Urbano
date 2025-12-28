// Service Worker per cachare la navbar e altri asset statici
const CACHE_NAME = 'verde-urbano-v1';
const urlsToCache = [
    'includes/navigation-simple.html',
    'includes/footer.html',
    'includes/info-modal.html',
    'css/verde_urbano.css',
    'css/navigation.css',
    'css/page-layout.css',
    'js/navigation.js',
    'js/sticky-header.js'
];

// Installazione del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aperta');
                return cache.addAll(urlsToCache);
            })
    );
});

// Gestione delle richieste
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - ritorna la risposta dalla cache
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Aggiornamento del Service Worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
