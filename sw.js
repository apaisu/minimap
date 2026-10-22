const CACHE = 'gdecheaply-v5';
const FILES = ['./', './index.html', './manifest.json', './logo.png', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

// Каждый файл кладём в кэш отдельно: если одного нет на сервере, установка не рушится
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Только свои файлы (не карта, не Telegram). Сначала сеть, чтобы обновления с GitHub Pages доезжали; без сети — кэш.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req).then(r => r || Response.error()))
  );
});
