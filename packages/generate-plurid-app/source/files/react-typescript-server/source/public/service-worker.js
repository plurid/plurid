self.addEventListener('install', (event) => {
    event.waitUntil(async function() {
        const cache = await caches.open('static-v1');
        await cache.addAll([
            /** Specify the URLs to be cached. */
            /** Default static */
            '/favicon.ico',
            'icon-192x192.png',
            'icon-512x512.png',
            '/vendor.js',

            /** Default routes */
            // '/',
        ]);
    }());
});


self.addEventListener('activate', (event) => {
    event.waitUntil(async function() {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.filter((cacheName) => {
                /**
                 * Return true if you want to remove this cache,
                 * but remember that caches are shared across
                 * the whole origin
                 */
            }).map(cacheName => caches.delete(cacheName))
        );
    }());
});


self.addEventListener('fetch', (event) => {
    event.respondWith(async function() {
      const cache = await caches.open('static-v1');
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;
        const networkResponse = await fetch(event.request);

        /** Uncomment to add any other unspecified requests to cache. */
        // event.waitUntil(
        //     cache.put(event.request, networkResponse.clone())
        // );

        return networkResponse;
    }());
});
