/* Service worker: la app funciona sin internet y se actualiza sola.
   Archivos propios: primero la red (siempre la versión más nueva de GitHub), y si no hay internet, la copia guardada.
   Fuentes de Google: copia guardada primero. No hay que cambiar nada aquí al subir una versión nueva. */
const V = 'elitetwin-shell';
const SHELL = ['./', './index.html', './styles.css', './data.js', './app.js', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === self.location.origin;
  if (same) {
    e.respondWith(
      fetch(new Request(r, { cache: 'no-cache' }))
        .then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
        .catch(() => caches.match(r, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      caches.match(r).then(hit => {
        const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
