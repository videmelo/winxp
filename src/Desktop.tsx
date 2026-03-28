import Taskbar from './components/layout/Taskbar';
import Window from './components/layout/Window';
import { WindowManagerProvider, useWindowManager } from './hooks/useWindowManager';
import Agent from './components/ui/Agent';
import DesktopIcons from './components/layout/DesktopIcons';
import { useEffect } from 'react';
import { useSound } from './hooks/useSound';

function DesktopContent() {
   const { windows } = useWindowManager();
   const { play } = useSound();

   useEffect(() => {
      play('xp-startup', { volume: 0.5 });
   }, [play]);

   const isAnyWindowLoading = windows.some((w) => w.isLoading);

   return (
      <div className="w-screen h-screen relative overflow-hidden">
         {isAnyWindowLoading && <style>{`* { cursor: progress !important; }`}</style>}

         <DesktopIcons />

         {windows.map((win) => (
            <Window key={win.id} windowId={win.id} />
         ))}

         <Agent name="rover" />
         <Taskbar />
      </div>
   );
}

export default function Desktop() {
   return (
      <WindowManagerProvider>
         <DesktopContent />
      </WindowManagerProvider>
   );
}
