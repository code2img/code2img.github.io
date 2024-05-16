const CACHE_NAME = "code2img-cache";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "assets/clipboard.svg",
        "assets/fa-arrow-down.svg",
        "assets/fa-caret-down.svg",
        "assets/fa-copy.svg",
        "icons/icon-192x192.png",
        "icons/icon-512x512.png",
        "index.html",
        "lib/html2canvas.min.js",
        "lib/shiki@1.5.2.js",
        "manifest.json",
        "script.js",
        "service-worker.js",
        "style.css",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          // Clone the response to avoid consuming it twice
          const fetchResponseClone = fetchResponse.clone();

          // Cache the response for future use
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponseClone);
          });

          return fetchResponse; // Return the original response to the browser
        })
      );
    })
  );
});
