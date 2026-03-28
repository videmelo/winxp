import type React from 'react';
import ProgramIcon from '../ui/ProgramIcon';
import { useWindowManager, type WindowState } from '../../hooks/useWindowManager';
import { useDrag } from '../../hooks/useDrag';
import { useWindowResize, type ResizeEdge } from '../../hooks/useWindowResize';

const EDGE_SIZE = 5;

const edgeCursors: Record<ResizeEdge, string> = {
   top: 'cursor-ns-resize',
   bottom: 'cursor-ns-resize',
   left: 'cursor-ew-resize',
   right: 'cursor-ew-resize',
   'top-left': 'cursor-nwse-resize',
   'top-right': 'cursor-nesw-resize',
   'bottom-left': 'cursor-nesw-resize',
   'bottom-right': 'cursor-nwse-resize',
};

const edgeStyles: Record<ResizeEdge, React.CSSProperties> = {
   top: { top: -EDGE_SIZE, left: EDGE_SIZE, right: EDGE_SIZE, height: EDGE_SIZE * 2 },
   bottom: { bottom: -EDGE_SIZE, left: EDGE_SIZE, right: EDGE_SIZE, height: EDGE_SIZE * 2 },
   left: { left: -EDGE_SIZE, top: EDGE_SIZE, bottom: EDGE_SIZE, width: EDGE_SIZE * 2 },
   right: { right: -EDGE_SIZE, top: EDGE_SIZE, bottom: EDGE_SIZE, width: EDGE_SIZE * 2 },
   'top-left': { top: -EDGE_SIZE, left: -EDGE_SIZE, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2 },
   'top-right': { top: -EDGE_SIZE, right: -EDGE_SIZE, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2 },
   'bottom-left': { bottom: -EDGE_SIZE, left: -EDGE_SIZE, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2 },
   'bottom-right': { bottom: -EDGE_SIZE, right: -EDGE_SIZE, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2 },
};

const edges: ResizeEdge[] = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

function ResizeHandles({ windowId }: { windowId: string }) {
   const { onResizePointerDown } = useWindowResize(windowId);

   return (
      <>
         {edges.map((edge) => (
            <div
               key={edge}
               className={`absolute z-50 ${edgeCursors[edge]}`}
               style={{ ...edgeStyles[edge], position: 'absolute' }}
               onPointerDown={onResizePointerDown(edge)}
            />
         ))}
      </>
   );
}

function TitleBar({ win }: { win: WindowState }) {
   const { moveWindow, focusWindow, closeWindow, minimizeWindow, toggleMaximize } = useWindowManager();

   const { onPointerDown } = useDrag({
      onDragStart: () => {
         if (win.status === 'maximized') return false;
         focusWindow(win.id);
         return { x: win.position.x, y: win.position.y };
      },
      onDrag: (x, y) => {
         moveWindow(win.id, { x, y });
      },
   });

   const buttons = win.titleBarButtons;
   const hasMinimize = buttons.includes('minimize');
   const hasMaximize = buttons.includes('maximize');
   const hasClose = buttons.includes('close');
   const hasHelp = buttons.includes('help');

   return (
      <div
         className={`xp-window-title-bar-chrome p-1 flex gap-1 items-center justify-between overflow-hidden`}
         onPointerDown={onPointerDown}
         onDoubleClick={() => hasMaximize && toggleMaximize(win.id)}
      >
         <div className="xp-window-title-bar-children flex items-center relative gap-1 min-w-0 flex-1">
            <ProgramIcon id={win.icon} size="sm" />
            <span className="window-title text-xp-white truncate">{win.title}</span>
         </div>
         <div className="xp-window-title-bar-children flex gap-1 shrink-0">
            {hasHelp && (
               <button
                  className="xp-window-controls-btn-blue xp-window-controls-icon-help"
                  onPointerDown={(e) => e.stopPropagation()}
               />
            )}
            {hasMinimize && (
               <button
                  className="xp-window-controls-btn-blue xp-window-controls-icon-minimize"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => minimizeWindow(win.id)}
               />
            )}
            {hasMaximize && (
               <button
                  className={`xp-window-controls-btn-blue ${
                     win.status === 'maximized' ? 'xp-window-controls-icon-reduce' : 'xp-window-controls-icon-maximize'
                  }`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => toggleMaximize(win.id)}
               />
            )}
            {hasClose && (
               <button
                  className="xp-window-controls-btn-red xp-window-controls-icon-close"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => closeWindow(win.id)}
               />
            )}
         </div>
      </div>
   );
}

interface WindowProps {
   windowId: string;
   children?: React.ReactNode;
}

function Window({ windowId, children }: WindowProps) {
   const { windows, focusWindow, setWindowLoaded } = useWindowManager();
   const win = windows.find((w) => w.id === windowId);

   if (!win) return null;

   const isMinimized = win.status === 'minimized';
   const isMaximized = win.status === 'maximized';
   const isLoading = win.isLoading;

   return (
      <div
         className={`absolute flex flex-col xp-window-frame ${!win.isActive ? 'inactive' : ''} ${
            isLoading || isMinimized ? 'opacity-0 pointer-events-none' : ''
         }`}
         style={{
            left: win.position.x,
            top: win.position.y,
            width: win.size.width,
            height: win.size.height,
            zIndex: win.zIndex,
         }}
         onPointerDown={() => {
            if (!win.isActive && !isLoading) focusWindow(win.id);
         }}
      >
         <TitleBar win={win} />
         <div className="xp-window-content flex-1 flex overflow-hidden bg-bg-default-window">
            <div className="flex-1 flex p-0.5">
               {win.exe ? <win.exe windowId={win.id} onLoaded={() => setWindowLoaded(win.id)} /> : children}
            </div>
         </div>
         {!isMaximized && !isMinimized && win.resizable && !isLoading && <ResizeHandles windowId={win.id} />}
      </div>
   );
}

export default Window;
