const CACHE_NAME = 'gourmet-v' + new Date().getTime(); // Auto-versioning on file change
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

// Fetch: Stale-While-Revalidate Strategy
// This serves from cache but updates in the background for next time.
// For the index.html, we prefer a Network-First strategy to ensure latest content.
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    
    // For navigation/HTML: Network First
    if (e.request.mode === 'navigate' || (url.origin === self.origin && url.pathname.endsWith('.html'))) {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
        return;
    }

    // For other assets: Stale-While-Revalidate
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            const fetchPromise = fetch(e.request).then((networkResponse) => {
                // Update cache with the new version
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If network fails, we already have the cache response if it exists
            });

            return cachedResponse || fetchPromise;
        })
    );
});
