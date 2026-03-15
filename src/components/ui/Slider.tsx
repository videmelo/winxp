import { Fragment, useMemo, useRef, useState, type ReactNode } from 'react';
import SliderCursor from '../../assets/tsx/SlideCursor';

type SliderOrientation = 'horizontal' | 'vertical';
type SliderCursorVariant = 'none' | 'left' | 'right';

interface SliderProps {
   min?: number;
   max?: number;
   step?: number;
   value?: number;
   defaultValue?: number;
   disabled?: boolean;
   orientation?: SliderOrientation;
   reverse?: boolean;
   variant?: SliderCursorVariant;
   spacers?: boolean;
   stepSpacersOffset?: number;
   size?: number;
   startLabel?: ReactNode;
   endLabel?: ReactNode;
   onChange?: (value: number) => void;
}

function clamp(value: number, min: number, max: number) {
   return Math.min(max, Math.max(min, value));
}

function normalizeValue(value: number, min: number, max: number, step: number) {
   const safeStep = step > 0 ? step : 1;
   const steppedValue = min + Math.round((value - min) / safeStep) * safeStep;
   return clamp(steppedValue, min, max);
}

export function Slider({
   min = 0,
   max = 100,
   step = 10,
   value,
   disabled = false,
   orientation = 'horizontal',
   reverse = false,
   variant,
   spacers = true,
   size = 80,
   startLabel,
   endLabel,
   onChange,
}: SliderProps) {
   const safeBounds = useMemo(() => {
      if (max <= min) {
         return { min, max: min + 1 };
      }

      return { min, max };
   }, [max, min]);

   const trackRef = useRef<HTMLDivElement>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [isFocused, setIsFocused] = useState(false);
   const [isHovered, setIsHovered] = useState(false);

   const [internalValue, setInternalValue] = useState(() =>
      normalizeValue(value ?? safeBounds.min, safeBounds.min, safeBounds.max, step),
   );

   const isControlled = value !== undefined;
   const currentValue = normalizeValue(isControlled ? value : internalValue, safeBounds.min, safeBounds.max, step);

   const range = safeBounds.max - safeBounds.min;
   const ratio = (currentValue - safeBounds.min) / range;
   const visualRatio = reverse ? 1 - ratio : ratio;
   const percent = visualRatio * 100;
   const isVertical = orientation === 'vertical';

   const emitValue = (nextValue: number) => {
      const normalized = normalizeValue(nextValue, safeBounds.min, safeBounds.max, step);

      if (!isControlled) {
         setInternalValue(normalized);
      }

      onChange?.(normalized);
   };

   const updateFromPointer = (clientX: number, clientY: number) => {
      const track = trackRef.current;

      if (!track) {
         return;
      }

      const rect = track.getBoundingClientRect();
      const trackLength = isVertical ? rect.height : rect.width;

      if (trackLength <= 0) {
         return;
      }

      const rawRatio = isVertical
         ? clamp((rect.bottom - clientY) / rect.height, 0, 1)
         : clamp((clientX - rect.left) / rect.width, 0, 1);
      const valueRatio = reverse ? 1 - rawRatio : rawRatio;
      const nextValue = safeBounds.min + valueRatio * range;
      emitValue(nextValue);
   };

   const keyStep = step > 0 ? step : 1;
   const hasSpacers = spacers && keyStep > 0;
   const totalSteps = Math.max(1, Math.floor(range / keyStep));
   const spacerPoints = useMemo(() => {
      if (!hasSpacers) {
         return [];
      }

      const points = Array.from({ length: totalSteps + 1 }, (_, index) => index / totalSteps);
      return reverse ? points.map((point) => 1 - point) : points;
   }, [hasSpacers, reverse, totalSteps]);

   const cursorState: 'normal' | 'hover' | 'active' = isDragging
      ? 'active'
      : isHovered || isFocused
        ? 'hover'
        : 'normal';
   const resolvedCursorVariant: SliderCursorVariant = variant ?? (isVertical ? 'none' : 'left');
   const resolvedCursorOrientation: SliderOrientation = isVertical ? 'horizontal' : 'vertical';
   const showStartSpacers = resolvedCursorVariant === 'left' || resolvedCursorVariant === 'none';
   const showEndSpacers = resolvedCursorVariant === 'right' || resolvedCursorVariant === 'none';
   const safeSize = Math.max(size, 40);

   const containerClasses = isVertical ? 'w-5 justify-center' : 'h-5 items-center';
   const containerSizeStyle = isVertical
      ? ({ height: `${safeSize}px` } as const)
      : ({ width: `${safeSize}px` } as const);
   const trackClasses = isVertical ? 'h-full w-1' : 'h-1 w-full';
   const cursorPositionStyle = isVertical
      ? ({ bottom: `calc(${percent}% - 5.5px)` } as const)
      : ({ left: `calc(${percent}% - 5.5px)` } as const);
   const cursorPositionClasses = isVertical
      ? 'absolute left-1/2 -translate-x-1/2'
      : 'absolute top-1/2 -translate-y-1/2';

   const leftLabel = reverse ? endLabel : startLabel;
   const rightLabel = reverse ? startLabel : endLabel;
   const topLabel = reverse ? startLabel : endLabel;
   const bottomLabel = reverse ? endLabel : startLabel;
   const hasAnyLabel = startLabel !== undefined || endLabel !== undefined;

   const sliderControl = (
      <div
         role="slider"
         aria-orientation={orientation}
         aria-valuemin={safeBounds.min}
         aria-valuemax={safeBounds.max}
         aria-valuenow={Math.round(currentValue)}
         aria-disabled={disabled}
         tabIndex={disabled ? -1 : 0}
         className={`relative inline-flex ${containerClasses} ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
         style={containerSizeStyle}
         onPointerDown={(event) => {
            if (disabled) {
               return;
            }

            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsDragging(true);
            updateFromPointer(event.clientX, event.clientY);
         }}
         onPointerMove={(event) => {
            if (!isDragging || disabled) {
               return;
            }

            updateFromPointer(event.clientX, event.clientY);
         }}
         onPointerUp={() => setIsDragging(false)}
         onPointerCancel={() => setIsDragging(false)}
         onBlur={() => setIsFocused(false)}
         onFocus={() => setIsFocused(true)}
         onKeyDown={(event) => {
            if (disabled) {
               return;
            }

            let nextValue = currentValue;
            const shouldDecreaseOnLeft = !reverse;
            const shouldDecreaseOnDown = !reverse;

            switch (event.key) {
               case 'ArrowLeft':
                  nextValue = currentValue + (shouldDecreaseOnLeft ? -keyStep : keyStep);
                  break;
               case 'ArrowDown':
                  nextValue = currentValue + (shouldDecreaseOnDown ? -keyStep : keyStep);
                  break;
               case 'ArrowRight':
                  nextValue = currentValue + (shouldDecreaseOnLeft ? keyStep : -keyStep);
                  break;
               case 'ArrowUp':
                  nextValue = currentValue + (shouldDecreaseOnDown ? keyStep : -keyStep);
                  break;
               case 'PageDown':
                  nextValue = currentValue - keyStep * 10;
                  break;
               case 'PageUp':
                  nextValue = currentValue + keyStep * 10;
                  break;
               case 'Home':
                  nextValue = safeBounds.min;
                  break;
               case 'End':
                  nextValue = safeBounds.max;
                  break;
               default:
                  return;
            }

            event.preventDefault();
            emitValue(nextValue);
         }}
      >
         <div ref={trackRef} className={`ui-slider-track rounded-lg bg-stone-100 ${trackClasses}`} />

         {hasSpacers && (
            <div className="pointer-events-none absolute inset-0">
               {spacerPoints.map((point, index) => {
                  const isEdgeStep = index === 0 || index === spacerPoints.length - 1;
                  const tickLength = 4;
                  const tickThickness = isEdgeStep ? 0.75 : 1;
                  const stepSpacersOffset = 12;
                  const startStyle = isVertical
                     ? ({
                          bottom: `${point * 100}%`,
                          right: `calc(50% + ${stepSpacersOffset}px)`,
                          transform: 'translateY(50%)',
                          width: `${tickLength}px`,
                          height: `${tickThickness}px`,
                       } as const)
                     : ({
                          left: `${point * 100}%`,
                          bottom: `calc(50% + ${stepSpacersOffset}px)`,
                          transform: 'translateX(-50%)',
                          width: `${tickThickness}px`,
                          height: `${tickLength}px`,
                       } as const);
                  const endStyle = isVertical
                     ? ({
                          bottom: `${point * 100}%`,
                          left: `calc(50% + ${stepSpacersOffset}px)`,
                          transform: 'translateY(50%)',
                          width: `${tickLength}px`,
                          height: `${tickThickness}px`,
                       } as const)
                     : ({
                          left: `${point * 100}%`,
                          top: `calc(50% + ${stepSpacersOffset}px)`,
                          transform: 'translateX(-50%)',
                          width: `${tickThickness}px`,
                          height: `${tickLength}px`,
                       } as const);
                  const tickClasses = 'absolute rounded bg-black/35';

                  return (
                     <Fragment key={point}>
                        {showStartSpacers && <span className={tickClasses} style={startStyle} />}
                        {showEndSpacers && <span className={tickClasses} style={endStyle} />}
                     </Fragment>
                  );
               })}
            </div>
         )}

         <div
            className={cursorPositionClasses}
            style={cursorPositionStyle}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
         >
            <SliderCursor variant={resolvedCursorVariant} orientation={resolvedCursorOrientation} state={cursorState} />
         </div>
      </div>
   );

   if (!hasAnyLabel) {
      return sliderControl;
   }

   if (isVertical) {
      return (
         <div className="inline-flex flex-col items-center gap-2">
            {topLabel !== undefined && <span className="label-tahoma text-black">{topLabel}</span>}
            {sliderControl}
            {bottomLabel !== undefined && <span className="label-tahoma text-black">{bottomLabel}</span>}
         </div>
      );
   }

   return (
      <div className="inline-flex items-center gap-2">
         {leftLabel !== undefined && <span className="label-tahoma text-black">{leftLabel}</span>}
         {sliderControl}
         {rightLabel !== undefined && <span className="label-tahoma text-black">{rightLabel}</span>}
      </div>
   );
}
