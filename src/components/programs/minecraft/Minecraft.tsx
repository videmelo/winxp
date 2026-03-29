import { useEffect, useState } from 'react';
import { useErrorDialog } from '../../../hooks/useErrorDialog';
import { useWindowManager } from '../../../hooks/useWindowManager';

const CACHE_NAME = 'minecraft-session-cache';
const SW_SCOPE = '/minecraft/';

export default function Minecraft({ windowId }: { windowId: string }) {
   const { showError } = useErrorDialog();
   const { closeWindow } = useWindowManager();
   const [isReady, setIsReady] = useState(false);
   const [progress, setProgress] = useState(8);
   const [launch, setLaunch] = useState('Preparing clean environment...');

   useEffect(() => {
      if (isReady) return;

      const status = [
         'Preparing clean environment...',
         'Starting session worker...',
         'Checking game assets...',
         'Almost ready...',
      ];

      let step = 0;
      const statusTimer = window.setInterval(() => {
         if (step < status.length - 1) {
            step++;
            setLaunch(status[step]);
         } else {
            window.clearInterval(statusTimer);
         }
      }, 1400);

      const progressTimer = window.setInterval(() => {
         setProgress((prev) => {
            if (prev >= 94) return prev;

            const next = prev + Math.max(1, Math.round((96 - prev) * 0.08));
            return Math.min(94, next);
         });
      }, 320);

      return () => {
         window.clearInterval(statusTimer);
         window.clearInterval(progressTimer);
      };
   }, [isReady]);

   useEffect(() => {
      let mounted = true;

      const fullCleanup = async () => {
         if (!('serviceWorker' in navigator)) return;

         // 1. Unregister all workers in the scope
         const registrations = await navigator.serviceWorker.getRegistrations();
         for (const reg of registrations) {
            if (reg.scope.includes(SW_SCOPE)) {
               await reg.unregister();
               console.log('[MINECRAFT] Cleaned up Service Worker');
            }
         }

         // 2. Delete the cache explicitly from the main thread
         if ('caches' in window) {
            const cacheKeys = await caches.keys();
            for (const key of cacheKeys) {
               if (key === CACHE_NAME) {
                  await caches.delete(key);
                  console.log('[MINECRAFT] Cleaned up Minecraft Cache');
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
                  setProgress(100);
                  setLaunch('Launching Minecraft Classic...');

                  // Minimum delay for the browser to process interceptor activation
                  setTimeout(() => {
                     if (mounted) setIsReady(true);
                  }, 150);
               } else if (registration.installing) {
                  registration.installing.addEventListener('statechange', (e: Event) => {
                     if ((e.target as ServiceWorker).state === 'activated' && mounted) checkStatus();
                  });
               } else if (registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
               }
            };

            checkStatus();
            registration.addEventListener('updatefound', checkStatus);
         } catch (err) {
            console.error('[MINECRAFT] Init error:', err);
            if (mounted) {
               const errorMsg = err instanceof Error ? err.message : String(err);
               const isStorageError = errorMsg.includes('storage') || errorMsg.includes('SecurityError');

               const message = isStorageError
                  ? 'Storage access is blocked. Please disable Incognito mode or allow cookies for this site to run Minecraft Classic.'
                  : `Failed to start Minecraft: ${errorMsg}`;

               showError(message, 'Minecraft Classic Error');
               closeWindow(windowId);
            }
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
      <div className="m-0 flex h-full w-full items-center justify-center overflow-hidden bg-black p-0">
         {!isReady ? (
            <div className="w-[min(420px,calc(100%-40px))] border border-white bg-black p-5 font-mono text-white">
               <div className="mb-2 text-lg font-bold">Minecraft Classic</div>
               <div className="mb-3.5 text-xs text-white">{launch}</div>

               <div className="h-3.5 w-full overflow-hidden border border-white bg-black">
                  <div
                     className="h-full bg-white"
                     style={{
                        width: `${progress}%`,
                     }}
                  />
               </div>

               <div className="mt-2 flex justify-between text-xs text-white">
                  <span>Session boot</span>
                  <span>{Math.round(progress)}%</span>
               </div>
            </div>
         ) : (
            <iframe
               src="/minecraft/index.html"
               className="block h-full w-full border-0"
               title="Minecraft Classic"
               sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            />
         )}
      </div>
   );
}
