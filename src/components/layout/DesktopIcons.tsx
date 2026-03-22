import React, { useState, useRef, useEffect, useMemo } from 'react';
import ProgramIcon from '../ui/ProgramIcon';
import { useWindowManager } from '../../hooks/useWindowManager';
import { programsMetadata, folders } from '../../constants/program-data';

const desktopIconIds = ['my-computer', 'my-documents', 'recycle-bin', 'internet-explorer', 'minecraft', 'paint'];

const items = new Map([...programsMetadata, ...folders].map((item) => [item.id, item]));

type Position = { x: number; y: number };

export default function DesktopIcons() {
   const { openProgram } = useWindowManager();
   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

   const positions = useMemo(() => {
      const pos: Record<string, Position> = {};
      desktopIconIds.forEach((id, index) => {
         pos[id] = { x: 10, y: 10 + index * 85 };
      });
      return pos;
   }, []);

   const [marquee, setMarquee] = useState<{
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
   } | null>(null);

   const containerRef = useRef<HTMLDivElement>(null);

   const handlePointerDown = (e: React.PointerEvent) => {
      if (e.target !== containerRef.current) return;

      setSelectedIds(new Set());
      setMarquee({
         startX: e.clientX,
         startY: e.clientY,
         currentX: e.clientX,
         currentY: e.clientY,
      });
   };

   useEffect(() => {
      const onPointerMove = (e: PointerEvent) => {
         if (!marquee) return;

         const currentX = e.clientX;
         const currentY = e.clientY;

         setMarquee((prev) => (prev ? { ...prev, currentX, currentY } : null));

         const startX = marquee.startX;
         const startY = marquee.startY;

         const selLeft = Math.min(startX, currentX);
         const selRight = Math.max(startX, currentX);
         const selTop = Math.min(startY, currentY);
         const selBottom = Math.max(startY, currentY);

         const newSelected = new Set<string>();

         desktopIconIds.forEach((id) => {
            const pos = positions[id];

            const itemLeft = pos.x;
            const itemTop = pos.y;
            const itemRight = itemLeft + 74; // width
            const itemBottom = itemTop + 85; // height

            const isIntersecting = !(
               selRight < itemLeft ||
               selLeft > itemRight ||
               selBottom < itemTop ||
               selTop > itemBottom
            );

            if (isIntersecting) {
               newSelected.add(id);
            }
         });

         setSelectedIds(newSelected);
      };

      const onPointerUp = () => {
         setMarquee(null);
      };

      if (marquee) {
         window.addEventListener('pointermove', onPointerMove);
         window.addEventListener('pointerup', onPointerUp);
      }

      return () => {
         window.removeEventListener('pointermove', onPointerMove);
         window.removeEventListener('pointerup', onPointerUp);
      };
   }, [marquee, positions]);

   const handleIconPointerDown = (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      if (!e.ctrlKey) {
         setSelectedIds(new Set([id]));
      } else {
         setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
         });
      }
   };

   let marqueeStyle: React.CSSProperties = {};
   if (marquee) {
      const left = Math.min(marquee.startX, marquee.currentX);
      const top = Math.min(marquee.startY, marquee.currentY);
      const width = Math.abs(marquee.startX - marquee.currentX);
      const height = Math.abs(marquee.startY - marquee.currentY);
      marqueeStyle = {
         left,
         top,
         width,
         height,
         border: '1px solid rgba(49, 106, 197, 0.8)',
         backgroundColor: 'rgba(49, 106, 197, 0.3)',
         position: 'absolute',
         zIndex: 10,
      };
   }

   return (
      <div
         id="desktop-container"
         ref={containerRef}
         className="absolute inset-0 z-0 h-full w-full"
         onPointerDown={handlePointerDown}
      >
         {marquee && <div style={marqueeStyle} className="pointer-events-none" />}

         {desktopIconIds.map((id) => {
            const item = items.get(id);
            if (!item) return null;
            const isSelected = selectedIds.has(id);

            return (
               <div
                  key={id}
                  className="absolute flex flex-col items-center justify-start w-18.5 p-1 cursor-default"
                  style={{ left: positions[id]?.x ?? 0, top: positions[id]?.y ?? 0 }}
                  onPointerDown={(e) => handleIconPointerDown(e, id)}
                  onDoubleClick={(e) => {
                     e.stopPropagation();
                     openProgram(id);
                  }}
                  onDragStart={(e) => e.preventDefault()}
               >
                  <div
                     className={`flex justify-center items-center w-12 h-12 mb-1 relative rounded-sm ${
                        isSelected
                           ? 'before:absolute before:inset-0 before:bg-[#316ac5] before:opacity-50 before:mix-blend-multiply'
                           : ''
                     }`}
                  >
                     <ProgramIcon id={id} size="lg" className="relative z-10 w-8 h-8" />
                  </div>
                  <div className="flex justify-center w-full">
                     <span
                        className={`text-center text-[11px] font-tahoma px-1 wrap-break-word line-clamp-2 ${
                           isSelected ? 'bg-[#316ac5] text-white' : 'text-white'
                        }`}
                        style={{
                           textShadow: isSelected ? 'none' : '1px 1px 2px #000',
                           lineHeight: '1.2',
                           outline: isSelected ? '1px dotted rgba(255,255,255,0.4)' : 'none',
                        }}
                     >
                        {item.name}
                     </span>
                  </div>
               </div>
            );
         })}
      </div>
   );
}
