import { useCallback, useRef } from 'react';
import { useWindowManager, type WindowPosition } from './useWindowManager';

export function useWindowDrag(windowId: string) {
   const { moveWindow, focusWindow, getWindow } = useWindowManager();
   const dragging = useRef(false);
   const offset = useRef<WindowPosition>({ x: 0, y: 0 });

   const onPointerDown = useCallback(
      (e: React.PointerEvent) => {
         const win = getWindow(windowId);
         if (!win || win.status === 'maximized') return;

         e.preventDefault();
         dragging.current = true;
         offset.current = {
            x: e.clientX - win.position.x,
            y: e.clientY - win.position.y,
         };

         focusWindow(windowId);

         const onPointerMove = (ev: PointerEvent) => {
            if (!dragging.current) return;
            moveWindow(windowId, {
               x: ev.clientX - offset.current.x,
               y: ev.clientY - offset.current.y,
            });
         };

         const onPointerUp = () => {
            dragging.current = false;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
         };

         document.addEventListener('pointermove', onPointerMove);
         document.addEventListener('pointerup', onPointerUp);
      },
      [windowId, moveWindow, focusWindow, getWindow],
   );

   return { onPointerDown };
}
