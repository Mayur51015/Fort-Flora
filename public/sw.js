// Fort-Flora Service Worker — PWA Offline Support
const CACHE_NAME = 'fort-flora-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Network-first for API calls (Supabase, Groq)
    if (url.hostname.includes('supabase') || url.hostname.includes('groq')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful API responses for offline
                    if (response.ok && url.hostname.includes('supabase')) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache-first for static assets
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                // Cache new static resources
                if (response.ok && (url.origin === self.location.origin || url.hostname.includes('unpkg') || url.hostname.includes('fonts'))) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            });
        }).catch(() => {
            // Offline fallback
            if (request.destination === 'document') {
                return caches.match('/index.html');
            }
        })
    );
});
