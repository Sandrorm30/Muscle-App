// FitBuilder — sw.js (Service Worker simplificado)
const CACHE = 'fitbuilder-v3';

// Não tenta pre-cachear no install — evita erros de URL
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Ignora requests da API do Google (sempre rede)
  if (e.request.url.includes('script.google.com') ||
      e.request.url.includes('fonts.googleapis') ||
      e.request.url.includes('cdn.jsdelivr') ||
      e.request.url.includes('cdnjs.cloudflare')) {
    return; // deixa o browser lidar normalmente
  }
  // Cache-first para os arquivos locais
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
