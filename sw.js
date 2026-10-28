/* Maxi Básquet Live · service worker: permite abrir la app sin internet */
const C = 'maxi-basquet-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['./']).catch(() => {}))); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin && (r.mode === 'navigate' || u.pathname.endsWith('.html'))) {
    // primero la red (para recibir actualizaciones); si no hay internet, la copia guardada
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put('./', cp)); return res; }).catch(() => caches.match('./')));
  } else if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(u.host)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
  }
});
