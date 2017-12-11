this.addEventListener('install', event => {
  event.waitUntil(
    caches.open('assets-v1').then(cache => {
      return cache.addAll([
        '/',
        '/js/scripts.js',
        '/css/styles.css',
        '/assets/locked_icon.svg',
        '/assets/unlocked_icon.svg'
      ]);
    })
  );
});
