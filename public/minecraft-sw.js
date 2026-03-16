let manifest = {};

self.addEventListener('install', (event) => {
   event.waitUntil(
      fetch('/minecraft/manifest.json')
         .then((res) => res.json())
         .then((data) => {
            manifest = data;
            self.skipWaiting();
         }),
   );
});

self.addEventListener('activate', (event) => {
   event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
   const url = new URL(event.request.url);

   if (url.pathname.startsWith('/minecraft-virtual/')) {
      const filePath = url.pathname.replace('/minecraft-virtual/', '');

      if (manifest[filePath]) {
         const dataUri = manifest[filePath];
         const match = dataUri.match(/^data:(.*?);base64,(.*)$/);

         if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            const binary = atob(base64Data);
            const array = new Uint8Array(binary.length);

            for (let i = 0; i < binary.length; i++) {
               array[i] = binary.charCodeAt(i);
            }

            const blob = new Blob([array], { type: mimeType });
            const response = new Response(blob, {
               status: 200,
               headers: { 'Content-Type': mimeType },
            });

            event.respondWith(response);
            return;
         }
      }
   }
});
