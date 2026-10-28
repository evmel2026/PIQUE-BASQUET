/* PIQUE · service worker: permite abrir la app sin internet e instalarla */
const C = 'pique-v3';
const PRE = ['./', 'pq-manifest.webmanifest', 'pq-icon-192.png', 'pq-icon-512.png', 'pq-icon-maskable.png', 'pq-apple-icon.png', 'pq-favicon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => Promise.all(PRE.map(u => c.add(u).catch(() => { }))))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin && (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/'))) {
    // primero la red (para recibir actualizaciones); si no hay internet, la copia guardada
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put('./', cp)); return res; }).catch(() => caches.match('./')));
  } else if (u.origin === location.origin && /\.(png|jpg|webmanifest|svg)$/.test(u.pathname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
  } else if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(u.host)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
  }
});
