import { useEffect, useState } from 'react';

const CACHE_NAME = 'minecraft-session-cache';
const SW_SCOPE = '/minecraft/';

export default function Minecraft() {
   const [isReady, setIsReady] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      let mounted = true;

      const fullCleanup = async () => {
         if (!('serviceWorker' in navigator)) return;

         // 1. Unregister all workers in the scope
         const registrations = await navigator.serviceWorker.getRegistrations();
         for (const reg of registrations) {
            if (reg.scope.includes(SW_SCOPE)) {
               await reg.unregister();
               console.log('Cleaned up Service Worker');
            }
         }

         // 2. Delete the cache explicitly from the main thread
         if ('caches' in window) {
            const cacheKeys = await caches.keys();
            for (const key of cacheKeys) {
               if (key === CACHE_NAME) {
                  await caches.delete(key);
                  console.log('Cleaned up Minecraft Cache');
               }
            }
         }
      };

      const init = async () => {
         try {
            // ALWAYS clean up everything before starting a new session
            await fullCleanup();

            if (!mounted) return;

            // Register the new worker
            const registration = await navigator.serviceWorker.register('/minecraft/sw.js', { scope: SW_SCOPE });

            const checkStatus = () => {
               if (!mounted) return;
               if (registration.active && registration.active.state === 'activated') {
                  // Minimum delay for the browser to process interceptor activation
                  setTimeout(() => {
                     if (mounted) setIsReady(true);
                  }, 150);
               } else if (registration.installing) {
                  registration.installing.addEventListener('statechange', (e: any) => {
                     if (e.target.state === 'activated' && mounted) checkStatus();
                  });
               } else if (registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
               }
            };

            checkStatus();
            registration.addEventListener('updatefound', checkStatus);
         } catch (err) {
            console.error('Init error:', err);
            if (mounted) setError('Failed to start Minecraft.');
         }
      };

      init();

      // Cleanup on window close/refresh
      window.addEventListener('beforeunload', fullCleanup);
      return () => {
         mounted = false;
         window.removeEventListener('beforeunload', fullCleanup);
         fullCleanup(); // Unregister when closing the window inside Windows XP
      };
   }, []);

   return (
      <div
         style={{
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
         }}
      >
         {error ? (
            <div style={{ color: '#ff4444', fontFamily: 'monospace' }}>{error}</div>
         ) : !isReady ? (
            <div style={{ color: '#fff', fontFamily: 'monospace', textAlign: 'center' }}>
               <div style={{ fontSize: '18px', marginBottom: '10px' }}>Minecraft Classic</div>
               <div>Initializing Clean Session...</div>
            </div>
         ) : (
            <iframe
               src="/minecraft/index.html"
               style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
               title="Minecraft Classic"
               sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            />
         )}
      </div>
   );
}
