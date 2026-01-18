const VERSION = 'v3'; // ⬅️ МЕНЯТЬ ПРИ КАЖДОМ РЕЛИЗЕ
const CACHE_NAME = `livedns-${VERSION}`;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ❌ НИКОГДА не кэшируем API
  if (url.pathname.startsWith('/health')) {
    return;
  }

  // ❌ НИКОГДА не кэшируем index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }

  // ⚠️ Остальное — network first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
