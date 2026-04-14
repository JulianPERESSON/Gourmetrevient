const CACHE_NAME = 'gourmet-v' + new Date().getTime() + '-1'; // Auto-versioning
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data.js',
    './i18n.js',
    './dashboard-premium.js',
    './lab-logic.js',
    './manifest.json'
];

// Install: Cache essential assets
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Become available to all pages immediately
    );
});

// Fetch: Network-First Strategy for all same-origin assets
// Always try the network first to get the latest code, fall back to cache when offline.
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    
    // Only handle same-origin requests
    if (url.origin !== self.origin) return;

    // Network First for everything
    e.respondWith(
        fetch(e.request).then((networkResponse) => {
            // Update cache with the new version
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseToCache);
                });
            }
            return networkResponse;
        }).catch(() => caches.match(e.request))
    );
});
