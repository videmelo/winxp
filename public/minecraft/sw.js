const CACHE_NAME = 'minecraft-session-cache';
const MANIFEST_URL = '/minecraft/manifest.json';

// Utility to convert base64 to Blob
function base64ToBlob(base64, mimeType) {
   const byteCharacters = atob(base64);
   const byteNumbers = new Array(byteCharacters.length);
   for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
   }
   const byteArray = new Uint8Array(byteNumbers);
   return new Blob([byteArray], { type: mimeType });
}

self.addEventListener('message', (event) => {
   if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
   }
   if (event.data && event.data.type === 'DELETE_CACHE') {
      event.waitUntil(
         caches.delete(CACHE_NAME).then(() => {
            console.log('Minecraft session cache cleared');
         }),
      );
   }
});

self.addEventListener('install', (event) => {
   self.skipWaiting(); // Force activate even if there are other tabs
   event.waitUntil(
      fetch(MANIFEST_URL, { cache: 'no-store' }) // Avoid manifest cache
         .then((response) => response.json())
         .then(async (manifest) => {
            const cache = await caches.open(CACHE_NAME);
            const assetKeys = Object.keys(manifest.assets);

            const cachePromises = assetKeys.map(async (url) => {
               const asset = manifest.assets[url];
               const blob = base64ToBlob(asset.data, asset.mimeType);
               const response = new Response(blob, {
                  headers: { 'Content-Type': asset.mimeType },
               });
               return cache.put(url, response);
            });

            return Promise.all(cachePromises);
         }),
   );
});

self.addEventListener('activate', (event) => {
   event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
   const url = new URL(event.request.url);
   if (url.pathname.startsWith('/minecraft/')) {
      event.respondWith(
         caches.match(event.request).then((response) => {
            // Return from cache or fetch from network (manifest/sw itself)
            return response || fetch(event.request);
         }),
      );
   }
});
