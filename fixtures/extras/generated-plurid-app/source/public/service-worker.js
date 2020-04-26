const CACHE_NAME_STATIC = 'static-v1';
const CACHE_URLS_STATIC = [
    /** Specify the URLs to be cached. */
    /** Default static */
    '/favicon.ico',
    '/icon-192x192.png',
    '/icon-512x512.png',
    'manifest.json',
    '/vendor.js',
    '/index.js',
];
const CACHE_NAME_ROUTES = 'routes-v1';
const CACHE_URLS_ROUTES = [
    /** Default routes */
    '/',
];



self.addEventListener('install', (event) => {
    event.waitUntil(async function() {
        const cacheStatic = await caches.open(CACHE_NAME_STATIC);
        await cacheStatic.addAll(CACHE_URLS_STATIC);

        const cacheRoutes = await caches.open(CACHE_NAME_ROUTES);
        await cacheRoutes.addAll(CACHE_URLS_ROUTES);
    }());
});


self.addEventListener('activate', (event) => {
    event.waitUntil(async function() {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.filter((cacheName) => {
                /**
                 * Return true to pass the filter check.
                 * Additional logic can be implemented.
                 */
                // return true;
            }).map(cacheName => caches.delete(cacheName))
        );
    }());
});


self.addEventListener('fetch', (event) => {
    event.respondWith(async function() {
        const cacheStatic = await caches.open(CACHE_NAME_STATIC);
        const cachedStaticResponse = await cacheStatic.match(event.request);
        if (cachedStaticResponse) {
            return cachedStaticResponse;
        }

        const cacheRoutes = await caches.open(CACHE_NAME_ROUTES);
        const cachedRoutesResponse = await cacheRoutes.match(event.request);
        if (cachedRoutesResponse) {
            return cachedRoutesResponse;
        }

        const networkResponse = await fetch(event.request);

        /** Uncomment to add any other unspecified requests to cache. */
        // event.waitUntil(
        //     cache.put(event.request, networkResponse.clone())
        // );

        return networkResponse;
    }());
});
