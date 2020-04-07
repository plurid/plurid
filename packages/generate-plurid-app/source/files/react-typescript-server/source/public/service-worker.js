self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    return self.clients.claim();
});

// self.addEventListener('fetch', function(event) {
//     // console.log('fetch', event);
//     event.respondWith(fetch(event.request));
// });
