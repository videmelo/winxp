import Taskbar from './components/layout/Taskbar';
import Window from './components/layout/Window';
import { WindowManagerProvider, useWindowManager } from './hooks/useWindowManager';
import Agent from './components/ui/Agent';
import DesktopIcons from './components/layout/DesktopIcons';
import { useEffect, useRef } from 'react';
import { useSound } from './hooks/useSound';
import { useErrorDialog } from './hooks/useErrorDialog';

function DesktopContent() {
   const { windows } = useWindowManager();
   const { play } = useSound();
   const { showWarning } = useErrorDialog();
   const hasRun = useRef(false);

   useEffect(() => {
      if (hasRun.current) return;
      hasRun.current = true;

      play('xp-startup', { volume: 0.5 });

      const isChromium = !!(window as any).chrome;
      if (!isChromium) {
         showWarning(
            'Attention: You are not using a Chromium-based browser. This system has been optimized for browsers such as Google Chrome, Microsoft Edge, or Brave. Some features (such as sound effects and transparencies) may not function correctly.',
            'Compatibility Warning',
            { width: 450, height: 180 },
         );
      }
   }, [play, showWarning]);

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
