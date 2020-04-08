const CACHE_NAME_STATIC = 'static-v1';
const CACHE_URLS_STATIC = [
    /** Specify the URLs to be cached. */
    /** Default static */
    '/favicon.ico',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/vendor.js',
];
const CACHE_NAME_ROUTES = 'routes-v1';
const CACHE_URLS_ROUTES = [
    /** Default routes */
    // '/',
];



self.addEventListener('install', (event) => {
    event.waitUntil(async () => {
        const cache = await caches.open(CACHE_NAME_STATIC);
        await cache.addAll(CACHE_URLS_STATIC);

        const cache = await caches.open(CACHE_NAME_ROUTES);
        await cache.addAll(CACHE_URLS_ROUTES);
    }());
});


self.addEventListener('activate', (event) => {
    event.waitUntil(async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.filter((cacheName) => {
                /**
                 * Return true to pass the filter check.
                 * Additional logic can be implemented.
                 */
                return true;
            }).map(cacheName => caches.delete(cacheName))
        );
    }());
});


self.addEventListener('fetch', (event) => {
    event.respondWith(async () => {
        const cache = await caches.open(CACHE_NAME_STATIC);

        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(event.request);

        /** Uncomment to add any other unspecified requests to cache. */
        // event.waitUntil(
        //     cache.put(event.request, networkResponse.clone())
        // );

        return networkResponse;
    }());

    event.respondWith(async () => {
        const cache = await caches.open(CACHE_NAME_ROUTES);

        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(event.request);

        /** Uncomment to add any other unspecified requests to cache. */
        // event.waitUntil(
        //     cache.put(event.request, networkResponse.clone())
        // );

        return networkResponse;
    }());
});
