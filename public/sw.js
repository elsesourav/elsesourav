/**
 * ElseSourav Production Service Worker
 * Focus: Installability, repeat visit performance, offline shell resilience.
 * Zero caching of private Firestore data, auth tokens, or administrative state.
 */

const CACHE_NAME = 'elsesourav-v1';

// Baseline static application shell assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Domains and paths that must NEVER be cached by the Service Worker
const EXCLUDED_PATTERNS = [
  /identitytoolkit\.googleapis\.com/,
  /securetoken\.googleapis\.com/,
  /firestore\.googleapis\.com/,
  /firebaseio\.com/,
  /\/auth\//i,
  /\/api\//i,
];

// -----------------------------------------------------------------------------
// Lifecycle: Install
// -----------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch((err) => {
        // Non-fatal if specific pre-cache asset fails
        console.warn('[ServiceWorker] Pre-cache warning:', err);
      })
  );
});

// -----------------------------------------------------------------------------
// Lifecycle: Activate (Cache Invalidation & Cleanup)
// -----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
            return Promise.resolve(false);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// -----------------------------------------------------------------------------
// Message Listener: Controlled Update Activation
// -----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// -----------------------------------------------------------------------------
// Fetch Interceptor: Conservative Strategy
// -----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = request.url;

  // 2. Strictly bypass sensitive endpoints (Firebase Auth, Firestore, APIs)
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(url))) {
    return;
  }

  // 3. Navigation Requests (HTML Page Loads): Network-First with Shell Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline, return the cached application shell
          return caches.match('/index.html').then((cachedShell) => {
            return (
              cachedShell ||
              caches.match('/').then((rootCached) => {
                return (
                  rootCached ||
                  new Response('<h1>Offline</h1><p>ElseSourav shell unavailable offline.</p>', {
                    headers: { 'Content-Type': 'text/html' },
                  })
                );
              })
            );
          });
        })
    );
    return;
  }

  // 4. Static Immutable Assets (/assets/*, fonts, icons, manifest): Cache-First
  const isStaticAsset =
    url.includes('/assets/') ||
    url.includes('/icons/') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.endsWith('.svg') ||
    url.endsWith('.webmanifest');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
