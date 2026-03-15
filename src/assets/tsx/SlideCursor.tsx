import { useId, useState, type SVGProps } from 'react';

interface SliderCursorProps extends SVGProps<SVGSVGElement> {
   variant?: 'none' | 'left' | 'right';
   state?: 'normal' | 'hover' | 'active';
   orientation?: 'horizontal' | 'vertical';
}

type CursorState = NonNullable<SliderCursorProps['state']>;

const CURSOR_COLORS = {
   normal: '#22BE20',
   hover: '#F7B335',
   active: '#129000',
} as const;

function InnerShadowFilter({ id }: { id: string }) {
   return (
      <defs>
         <filter
            id={id}
            x={-1}
            y={-1}
            width={24}
            height={14}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
         >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
               in="SourceAlpha"
               type="matrix"
               values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
               result="hardAlpha"
            />
            <feOffset dx={2} dy={2} />
            <feGaussianBlur stdDeviation={1.5} />
            <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
            <feColorMatrix
               in="SourceAlpha"
               type="matrix"
               values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
               result="hardAlpha"
            />
            <feOffset dx={-1} dy={-1} />
            <feGaussianBlur stdDeviation={1.5} />
            <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0" />
            <feBlend mode="normal" in2="effect1_innerShadow" result="effect2_innerShadow" />
         </filter>
      </defs>
   );
}

export default function SliderCursor({
   variant: type = 'none',
   state,
   orientation = 'horizontal',
   ...props
}: SliderCursorProps) {
   const [interactionState, setInteractionState] = useState<CursorState>('normal');
   const filterId = useId().replace(/:/g, '_');
   const isControlled = state !== undefined;
   const isVertical = orientation === 'vertical';
   const currentState = state ?? interactionState;
   const currentFill = CURSOR_COLORS[currentState];
   const orientationTransform = isVertical ? 'matrix(0 1 -1 0 11 0)' : undefined;
   const svgWidth = isVertical ? 11 : 21;
   const svgHeight = isVertical ? 21 : 11;
   const svgViewBox = isVertical ? '0 0 11 21' : '0 0 21 11';

   const { onPointerEnter, onPointerLeave, onPointerDown, onPointerUp, onPointerCancel, ...svgProps } = props;

   const interactionProps: Pick<
      SVGProps<SVGSVGElement>,
      'onPointerEnter' | 'onPointerLeave' | 'onPointerDown' | 'onPointerUp' | 'onPointerCancel'
   > = {
      onPointerEnter: (event) => {
         onPointerEnter?.(event);
         if (!isControlled) {
            setInteractionState('hover');
         }
      },
      onPointerLeave: (event) => {
         onPointerLeave?.(event);
         if (!isControlled) {
            setInteractionState('normal');
         }
      },
      onPointerDown: (event) => {
         onPointerDown?.(event);
         if (!isControlled) {
            setInteractionState('active');
         }
      },
      onPointerUp: (event) => {
         onPointerUp?.(event);
         if (!isControlled) {
            setInteractionState(event.currentTarget.matches(':hover') ? 'hover' : 'normal');
         }
      },
      onPointerCancel: (event) => {
         onPointerCancel?.(event);
         if (!isControlled) {
            setInteractionState('normal');
         }
      },
   };

   if (type === 'none') {
      return (
         <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={svgViewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...svgProps}
            {...interactionProps}
         >
            <g transform={orientationTransform}>
               <g filter={`url(#${filterId})`}>
                  <path d="M4 1H1V10H4V1Z" fill={currentFill} />
                  <path d="M20 1H17V10H20V1Z" fill={currentFill} />
                  <path d="M4 10V1H17V10H4Z" fill="white" />
                  <path
                     d="M18 0.5C19.3807 0.5 20.5 1.61929 20.5 3V8C20.5 9.38071 19.3807 10.5 18 10.5H3C1.61929 10.5 0.5 9.38071 0.5 8V3C0.5 1.61929 1.61929 0.5 3 0.5H18Z"
                     stroke="#8DA8B9"
                  />
               </g>
            </g>
            <InnerShadowFilter id={filterId} />
         </svg>
      );
   }

   if (type === 'right') {
      return (
         <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={svgViewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...svgProps}
            {...interactionProps}
         >
            <g transform={orientationTransform}>
               <g filter={`url(#${filterId})`}>
                  <path d="M15 1H13L18 5.5L13 10H15L20 5.5L15 1Z" fill={currentFill} />
                  <path d="M1 1H4V10H1V1Z" fill={currentFill} />
                  <path d="M13 1H4V10H13L18 5.5L13 1Z" fill="white" />
                  <path
                     d="M15 0.5C15.1235 0.5 15.2431 0.545299 15.335 0.62793L20.335 5.12793C20.4403 5.22275 20.5 5.35828 20.5 5.5C20.5 5.64172 20.4403 5.77725 20.335 5.87207L15.335 10.3721C15.2431 10.4547 15.1235 10.5 15 10.5H3C1.61929 10.5 0.5 9.38071 0.5 8V3C0.5 1.61929 1.61929 0.5 3 0.5H15Z"
                     stroke="#8DA8B9"
                     strokeLinejoin="round"
                  />
               </g>
            </g>
            <InnerShadowFilter id={filterId} />
         </svg>
      );
   }

   return (
      <svg
         width={svgWidth}
         height={svgHeight}
         viewBox={svgViewBox}
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...svgProps}
         {...interactionProps}
      >
         <g transform={orientationTransform}>
            <g filter={`url(#${filterId})`}>
               <g transform="translate(21 0) scale(-1 1)">
                  <path d="M15 1H13L18 5.5L13 10H15L20 5.5L15 1Z" fill={currentFill} />
                  <path d="M1 1H4V10H1V1Z" fill={currentFill} />
                  <path d="M13 1H4V10H13L18 5.5L13 1Z" fill="white" />
                  <path
                     d="M15 0.5C15.1235 0.5 15.2431 0.545299 15.335 0.62793L20.335 5.12793C20.4403 5.22275 20.5 5.35828 20.5 5.5C20.5 5.64172 20.4403 5.77725 20.335 5.87207L15.335 10.3721C15.2431 10.4547 15.1235 10.5 15 10.5H3C1.61929 10.5 0.5 9.38071 0.5 8V3C0.5 1.61929 1.61929 0.5 3 0.5H15Z"
                     stroke="#8DA8B9"
                     strokeLinejoin="round"
                  />
               </g>
            </g>
         </g>
         <InnerShadowFilter id={filterId} />
      </svg>
   );
}
