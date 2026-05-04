// =============================================================================
// GourmetRevient Service Worker — v3.0 (PWA Avancée)
// Stratégie : Cache-First pour assets statiques + Offline Queue pour mutations
// =============================================================================

const CACHE_VERSION = '5.0.0'; // Comprehensive Menu Onboarding
const CACHE_STATIC  = `gourmet-static-v${CACHE_VERSION}`;
const CACHE_RUNTIME = `gourmet-runtime-v${CACHE_VERSION}`;
const SYNC_TAG      = 'gourmet-sync-recipes';
const IDB_NAME      = 'GourmetOfflineQueue';
const IDB_STORE     = 'pendingOps';

// ── Assets à précacher (Shell de l'app) ──────────────────────────────────────
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './i18n.js',
  './dashboard-premium.js',
  './lab-logic.js',
  './exam-scheduler.js',
  './creative-tools.js',
  './advanced-modules.js',
  './crm-enhanced-v2.js',
  './equipment.js',
  './master-converter.js',
  './premium-effects.js',
  './pro-features.js',
  './commercial-features.js',
  './manifest.json',
  './analytics-interactive.js',
  './security.js',
  './supabase-config.js',
  './auth-ui.js',
  './rgpd-banner.js',
  './legal.html',
  './css/premium-branding.css',
  './css/creative-tools.css',
  './css/master-converter.css',
  './css/premium-effects.css',
  './css/commercial-features.css',
];

// CDN externes (Chart.js, GSAP, etc.) — mis en cache au runtime
const CDN_ORIGINS = [
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'flagcdn.com',
];

// ── IndexedDB helpers (sync queue) ──────────────────────────────────────────
function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess  = (e) => resolve(e.target.result);
    req.onerror    = (e) => reject(e.target.error);
  });
}

async function getPendingOps() {
  const db    = await openIDB();
  const tx    = db.transaction(IDB_STORE, 'readonly');
  const store = tx.objectStore(IDB_STORE);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function clearOp(id) {
  const db    = await openIDB();
  const tx    = db.transaction(IDB_STORE, 'readwrite');
  const store = tx.objectStore(IDB_STORE);
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// ── INSTALL — Précache shell ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // Ne pas bloquer l'install si un asset local est manquant
        console.warn('[SW] Précache partiel:', err);
      });
    })
  );
});

// ── ACTIVATE — Nettoyage anciens caches ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  self.clients.claim(); // Force la prise de contrôle immédiate
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const validCaches = [CACHE_STATIC, CACHE_RUNTIME];
      return Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
});

// ── FETCH — Stratégie intelligente par type de ressource ────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET (POST, PUT, etc.)
  if (request.method !== 'GET') return;

  // Ignorer les extensions de navigateur et Chrome DevTools
  if (url.protocol === 'chrome-extension:') return;

  // ── Stratégie 1 : Cache-First pour assets du shell (même origine) ──
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstWithNetworkFallback(request));
    return;
  }

  // ── Stratégie 2 : Stale-While-Revalidate pour CDN ──────────────────
  const isCDN = CDN_ORIGINS.some((origin) => url.hostname.includes(origin));
  if (isCDN) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

// Cache-First : retourne le cache immédiatement, sinon réseau → cache
async function cacheFirstWithNetworkFallback(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Offline et pas en cache → page offline de secours
    if (request.destination === 'document') {
      const fallback = await caches.match('./index.html', { ignoreSearch: true });
      return fallback || new Response(offlinePage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    return new Response('', { status: 503 });
  }
}

// Stale-While-Revalidate : cache immédiatement + mise à jour en arrière-plan
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE_RUNTIME);
  const cached = await cache.match(request, { ignoreSearch: true });

  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cached);

  return cached || networkPromise;
}

// ── SYNC — Rejoue la file des opérations offline ────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncPendingOps());
  }
});

async function syncPendingOps() {
  const ops = await getPendingOps();
  if (ops.length === 0) return;

  const results = await Promise.allSettled(
    ops.map(async (op) => {
      // Les opérations localStorage sont côté client.
      // Ici on notifie les clients de rejouer les ops en attente.
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({
          type:    'SYNC_OP',
          payload: op,
        });
      });
      await clearOp(op.id);
    })
  );

  // Notifier que la sync est terminée
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  const synced  = results.filter((r) => r.status === 'fulfilled').length;
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE', synced });
  });
}

// ── MESSAGE — Commandes depuis l'app ────────────────────────────────────────
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  // Forcer une mise à jour du SW
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Enregistrer une opération pour la sync ultérieure
  if (type === 'QUEUE_OP') {
    openIDB().then((db) => {
      const tx    = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.add({
        ...payload,
        queuedAt: new Date().toISOString(),
      });
    });
  }

  // Forcer le nettoyage des vieux caches
  if (type === 'CLEAR_CACHE') {
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))));
  }
});

// ── Page de secours inline (affiché en mode avion total) ────────────────────
function offlinePage() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GourmetRevient — Hors ligne</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1b2e 100%);
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 32px;
      padding: 3rem 2.5rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 25px 80px rgba(0,0,0,0.5);
    }
    .icon { font-size: 4rem; margin-bottom: 1.5rem; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.8rem; }
    p  { color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 2rem; font-size: 0.95rem; }
    .badge {
      display: inline-block;
      background: rgba(99,102,241,0.2);
      border: 1px solid rgba(99,102,241,0.4);
      color: #818cf8;
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }
    button {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff;
      border: none;
      padding: 0.9rem 2rem;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 8px 30px rgba(99,102,241,0.4);
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,0.5); }
    .info { font-size: 0.78rem; color: rgba(255,255,255,0.35); margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🧁</div>
    <div class="badge">Mode Hors Ligne</div>
    <h1>GourmetRevient</h1>
    <p>Vous êtes actuellement sans connexion internet.<br>
    Vos recettes et données restent accessibles en local.<br>
    Les modifications seront synchronisées au retour du réseau.</p>
    <button onclick="location.reload()">🔄 Réessayer</button>
    <p class="info">GourmetRevient fonctionne en mode PWA — vos données sont sauvegardées localement.</p>
  </div>
</body>
</html>`;
}
