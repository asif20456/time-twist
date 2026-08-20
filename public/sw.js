/**
 * Time Twist — Production Service Worker
 * 
 * Strategies:
 * - App Shell (HTML): Network-first with offline fallback
 * - Static Assets (JS/CSS/images): Cache-first
 * - Navigation: Network-first, fallback to cached root
 * - API/Fonts: Stale-while-revalidate
 */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `time-twist-static-${CACHE_VERSION}`;
const PAGES_CACHE = `time-twist-pages-${CACHE_VERSION}`;
const FONTS_CACHE = `time-twist-fonts-${CACHE_VERSION}`;

// App shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/offline',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, PAGES_CACHE, FONTS_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: apply appropriate strategy based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except fonts)
  if (url.origin !== self.location.origin) {
    // Only handle cross-origin font requests
    if (isFontRequest(request)) {
      event.respondWith(fontStrategy(request));
    }
    return;
  }

  // Navigation requests: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Font requests: stale-while-revalidate
  if (isFontRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, FONTS_CACHE));
    return;
  }

  // Default: stale-while-revalidate for everything else
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// --- Strategies ---

async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Try to serve from pages cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Try to serve the root page (SPA fallback)
    const rootResponse = await caches.match('/');
    if (rootResponse) return rootResponse;

    // Last resort: offline page
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) return offlineResponse;

    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

async function fontStrategy(request) {
  const cache = await caches.open(FONTS_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 408 });
  }
}

// --- Helpers ---

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/.test(url.pathname);
}

function isFontRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/fonts/') ||
    /\.(woff|woff2|ttf|eot)$/.test(url.pathname) ||
    request.headers.get('accept')?.includes('font/');
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
