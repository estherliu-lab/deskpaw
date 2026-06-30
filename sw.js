const BASE_PATH = "/deskpaw";
const CACHE_NAME = "deskpaw-v3";
const OFFLINE_URL = `${BASE_PATH}/offline.html`;
const CORE_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/manifest.json`,
  OFFLINE_URL,
  `${BASE_PATH}/app-assets/index.css`,
  `${BASE_PATH}/app-assets/index.js`,
  `${BASE_PATH}/demo/sample-pet.png`,
  `${BASE_PATH}/demo/desk-texture.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") return caches.match(OFFLINE_URL);
          return caches.match(`${BASE_PATH}/demo/sample-pet.png`);
        });
    })
  );
});
