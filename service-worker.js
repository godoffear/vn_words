// Увеличивай номер версии при каждом деплое, чтобы обновление дошло до телефона.
const CACHE = 'vn-words-v13';

// Относительные пути: работают и в подпапке GitHub Pages (/vn_words/).
const FILES = [
  './',
  './index.html',
  './words.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Сначала сеть (чтобы видеть свежую версию), без сети — из кэша.
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          const key = req.mode === 'navigate' ? './index.html' : req;
          caches.open(CACHE).then(cache => cache.put(key, copy));
        }
        return res;
      })
      .catch(() => caches.match(req.mode === 'navigate' ? './index.html' : req))
  );
});
