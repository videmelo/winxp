import { useCallback, useRef, useState } from 'react';

type DragOptions = {
   onDragStart?: (e: React.PointerEvent) => { x: number; y: number } | false | void;
   onDrag?: (x: number, y: number) => void;
   onDragEnd?: (wasDragged: boolean) => void;
};

export function useDrag({ onDragStart, onDrag, onDragEnd }: DragOptions = {}) {
   const [isDragging, setIsDragging] = useState(false);

   const dragData = useRef({
      isDragging: false,
      hasDragged: false,
      offsetX: 0,
      offsetY: 0,
   });

   const onPointerDown = useCallback(
      (e: React.PointerEvent) => {
         let initialPos = { x: 0, y: 0 };

         if (onDragStart) {
            const result = onDragStart(e);
            if (result === false) return;
            if (result) {
               initialPos = result;
            } else {
               const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
               initialPos = { x: rect.left, y: rect.top };
            }
         } else {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            initialPos = { x: rect.left, y: rect.top };
         }

         if (e.pointerType === 'mouse' && e.button !== 0) return;

         if (e.pointerType === 'mouse') e.preventDefault();

         (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

         dragData.current.offsetX = e.clientX - initialPos.x;
         dragData.current.offsetY = e.clientY - initialPos.y;
         dragData.current.isDragging = true;
         dragData.current.hasDragged = false;

         setIsDragging(true);

         const handlePointerMove = (ev: PointerEvent) => {
            if (!dragData.current.isDragging) return;
            dragData.current.hasDragged = true;

            if (onDrag) {
               onDrag(ev.clientX - dragData.current.offsetX, ev.clientY - dragData.current.offsetY);
            }
         };

         const handlePointerUp = () => {
            if (!dragData.current.isDragging) return;

            dragData.current.isDragging = false;
            setIsDragging(false);

            if (onDragEnd) {
               onDragEnd(dragData.current.hasDragged);
            }

            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
            document.removeEventListener('pointercancel', handlePointerUp);
         };

         document.addEventListener('pointermove', handlePointerMove);
         document.addEventListener('pointerup', handlePointerUp);
         document.addEventListener('pointercancel', handlePointerUp);
      },
      [onDragStart, onDrag, onDragEnd],
   );

   return { isDragging, onPointerDown };
}
