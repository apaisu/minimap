const CACHE = 'gdecheaply-v4';
const FILES = ['./', './index.html', './manifest.json', './logo.png', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// сначала сеть (чтобы обновления на GitHub Pages доезжали), при отсутствии сети — кэш
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});

<script>
  // Инициализация корзины
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
  }

  document.querySelectorAll('.plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.pc');
      if (!card) return;

      const product = {
        id: card.dataset.id || Math.random().toString(36).substr(2, 9),
        name: card.querySelector('.pn')?.innerText || 'Товар',
        price: parseInt(card.querySelector('.pp')?.textContent.replace(/[^0-9]/g, '') || 0),
      };

      let cart = JSON.parse(localStorage.getItem('cart'));
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));

      // Визуально показываем, что товар выбран
      card.classList.add('on');

      // Показываем уведомление
      const toast = document.getElementById('toast');
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    });
  });
</script>
