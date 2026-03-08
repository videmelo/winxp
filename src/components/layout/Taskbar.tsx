import React from 'react';
import Separator from '../../assets/tsx/Separator';
import StartMenu from './StartMenu';
import ProgramIcon from '../ui/ProgramIcon';
import { useWindowManager } from '../../hooks/useWindowManager';

interface TaskbarTabProps {
   icon: string;
   label: string;
   isActive?: boolean;
   onClick?: () => void;
}

function TaskbarTab({ icon, label, isActive, onClick }: TaskbarTabProps) {
   return (
      <div
         className={`program-tab ${
            isActive ? 'active' : ''
         } flex items-center gap-0.75 px-2.5 py-1 pr-3.75 cursor-pointer text-white w-40 min-w-9 h-6.25`}
         onClick={onClick}
      >
         <ProgramIcon id={icon} size="sm" />
         <span className="truncate">{label}</span>
      </div>
   );
}

function StartButton({ onClick }: { onClick?: () => void }) {
   return (
      <div className="start-button flex items-center gap-1.5 cursor-pointer h-7.5 w-24.75 relative" onClick={onClick}>
         <img src="src/assets/icons/system/windows-flag-16.png" className="pixelated ml-2.5" alt="Start" />
         <span className="italic font-bold text-[18px] leading-5.5 text-white">start</span>
      </div>
   );
}

function SystemTray() {
   const [time, setTime] = React.useState(
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
   );

   React.useEffect(() => {
      const timer = setInterval(() => {
         setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }, 1000);

      return () => clearInterval(timer);
   }, []);

   return (
      <div className="system-tray flex justify-end items-center p-0.75 pr-2 pl-2.75 gap-px h-7.5 relative">
         <span className="system-tray-overflow absolute -left-2.25" />
         <img src="src/assets/icons/system/sound-16.png" className="pixelated cursor-pointer" alt="Volume" />
         <img
            src="src/assets/icons/network/network-favorites-16.png"
            className="pixelated cursor-pointer"
            alt="Network"
         />
         <div className="flex justify-end items-center grow-0 shrink-0 relative gap-2.5 px-1">
            <p className="grow-0 shrink-0 text-[11px] text-left text-white">{time}</p>
         </div>
      </div>
   );
}

function Taskbar() {
   const [startMenuOpen, setStartMenuOpen] = React.useState(false);
   const containerRef = React.useRef<HTMLDivElement>(null);
   const { windows, focusWindow, minimizeWindow, openProgram } = useWindowManager();

   React.useEffect(() => {
      function handleClick(event: MouseEvent) {
         if (startMenuOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setStartMenuOpen(false);
         }
      }

      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
   }, [startMenuOpen]);

   const handleTabClick = (windowId: string, isActive: boolean, isMinimized: boolean) => {
      if (isMinimized || !isActive) {
         focusWindow(windowId);
      } else {
         minimizeWindow(windowId);
      }
   };

   return (
      <div className="taskbar absolute bottom-0 left-0 w-full h-7.5 flex justify-between items-center z-9999">
         <div ref={containerRef} className="relative flex-1 min-w-0">
            <div className="absolute bottom-7.5 left-0">
               {startMenuOpen ? (
                  <StartMenu
                     onLaunch={(programId) => {
                        openProgram(programId);
                        setStartMenuOpen(false);
                     }}
                  />
               ) : null}
            </div>
            <div className="flex gap-1.5 items-center">
               <StartButton onClick={() => setStartMenuOpen((prev) => !prev)} />
               <Separator />
               <div className="flex gap-1.5 items-center flex-1 min-w-0 overflow-hidden">
                  {windows.map((win) => (
                     <TaskbarTab
                        key={win.id}
                        icon={win.icon}
                        label={win.title}
                        isActive={win.isActive}
                        onClick={() => handleTabClick(win.id, win.isActive, win.status === 'minimized')}
                     />
                  ))}
               </div>
            </div>
         </div>
         <SystemTray />
      </div>
   );
}

export default Taskbar;
