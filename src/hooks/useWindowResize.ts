import { useCallback, useRef } from 'react';
import { useWindowManager, type WindowPosition, type WindowSize } from './useWindowManager';

export type ResizeEdge =
   | 'top'
   | 'bottom'
   | 'left'
   | 'right'
   | 'top-left'
   | 'top-right'
   | 'bottom-left'
   | 'bottom-right';

export function useWindowResize(windowId: string) {
   const { resizeWindow, focusWindow, getWindow } = useWindowManager();
   const dragging = useRef(false);
   const startPos = useRef<WindowPosition>({ x: 0, y: 0 });
   const startSize = useRef<WindowSize>({ width: 0, height: 0 });
   const startWindowPos = useRef<WindowPosition>({ x: 0, y: 0 });

   const onPointerDown = useCallback(
      (edge: ResizeEdge) => (e: React.PointerEvent) => {
         const win = getWindow(windowId);
         if (!win || win.status === 'maximized') return;

         e.preventDefault();
         e.stopPropagation();
         dragging.current = true;
         startPos.current = { x: e.clientX, y: e.clientY };
         startSize.current = { ...win.size };
         startWindowPos.current = { ...win.position };

         focusWindow(windowId);

         const onPointerMove = (ev: PointerEvent) => {
            if (!dragging.current) return;

            const dx = ev.clientX - startPos.current.x;
            const dy = ev.clientY - startPos.current.y;

            let newWidth = startSize.current.width;
            let newHeight = startSize.current.height;
            let newX = startWindowPos.current.x;
            let newY = startWindowPos.current.y;

            const minW = win.minSize.width;
            const minH = win.minSize.height;
            const maxW = win.maxSize?.width ?? Infinity;
            const maxH = win.maxSize?.height ?? Infinity;

            if (edge.includes('right')) {
               newWidth = Math.min(maxW, Math.max(minW, startSize.current.width + dx));
            }
            if (edge.includes('left')) {
               const proposedWidth = startSize.current.width - dx;
               const clampedWidth = Math.min(maxW, Math.max(minW, proposedWidth));
               newX = startWindowPos.current.x + (startSize.current.width - clampedWidth);
               newWidth = clampedWidth;
            }

            if (edge.includes('bottom')) {
               newHeight = Math.min(maxH, Math.max(minH, startSize.current.height + dy));
            }
            if (edge.includes('top')) {
               const proposedHeight = startSize.current.height - dy;
               const clampedHeight = Math.min(maxH, Math.max(minH, proposedHeight));
               newY = startWindowPos.current.y + (startSize.current.height - clampedHeight);
               newHeight = clampedHeight;
            }

            resizeWindow(windowId, { width: newWidth, height: newHeight }, { x: newX, y: newY });
         };

         const onPointerUp = () => {
            dragging.current = false;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
         };

         document.addEventListener('pointermove', onPointerMove);
         document.addEventListener('pointerup', onPointerUp);
      },
      [windowId, resizeWindow, focusWindow, getWindow],
   );

   return { onResizePointerDown: onPointerDown };
}
