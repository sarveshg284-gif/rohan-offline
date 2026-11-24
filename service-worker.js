
const CACHE_NAME = "transaction-manager-v2";

const FILES_TO_CACHE = [
    "./index.html",
    "./style.css",
    "./app.js",
    "./db.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

// Install Service Worker
self.addEventListener("install", (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {

            for (const file of FILES_TO_CACHE) {

                try {

                    const response = await fetch(file);

                    if (!response.ok) {
                        throw new Error("HTTP " + response.status);
                    }

                    await cache.put(file, response.clone());

                    console.log("Cached:", file);

                } catch (error) {

                    console.error("Cache Failed:", file, error);

                }

            }

        })
    );

    self.skipWaiting();

});


// Activate Service Worker
self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames.map((name) => {

                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }

                })

            );

        })

    );

    self.clients.claim();

});


// Fetch from Cache
self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request).then((cachedResponse) => {

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request);

        })

    );

});
