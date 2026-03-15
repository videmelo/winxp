import Taskbar from './components/layout/Taskbar';
import Window from './components/layout/Window';
import { WindowManagerProvider, useWindowManager } from './hooks/useWindowManager';
import Agent from './components/ui/Agent';

function DesktopContent() {
   const { windows } = useWindowManager();

   return (
      <div className="w-screen h-screen relative overflow-hidden">
         {windows.map((win) => (
            <Window key={win.id} windowId={win.id} />
         ))}

         <Agent fcsUrl="/rover.fcs" />
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
