import { useEffect, useState } from 'react';

export default function Minecraft() {
   const [isReady, setIsReady] = useState(false);

   useEffect(() => {
      async function setupSW() {
         if ('serviceWorker' in navigator) {
            try {
               await navigator.serviceWorker.register('/minecraft-sw.js');

               if (navigator.serviceWorker.controller) {
                  setIsReady(true);
               } else {
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                     setIsReady(true);
                  });
               }
            } catch (error) {
               console.error(error);
            }
         }
      }

      setupSW();
   }, []);

   if (!isReady) {
      return null;
   }

   return (
      <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, overflow: 'hidden' }}>
         <iframe
            src="/minecraft-virtual/index.html"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            title="Minecraft Classic"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
         />
      </div>
   );
}
