import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { useSound } from '../../hooks/useSound';

interface AgentProps {
   name: string;
   fps?: number;
   initialX?: number;
   initialY?: number;
}

type AnimationOptions = {
   fps?: number;
   loop?: boolean;
   nextAnim?: string;
   nextOptions?: AnimationOptions;
};

type AnimationMap = Record<string, string[]>;

const IDLE_INTERVAL_MIN = 5000;
const IDLE_INTERVAL_MAX = 15000;

const IDLE_ANIMATIONS = [
   'Idle',
   'GetAttentionMinor',
   'Pleased',
   'Books',
   'Sports',
   'Cooking',
   'Travel',
   'Money',
   'Celebrity',
];

const AGENT_STORY = [
   { text: "Woof! I'm Rover. Click this bubble to hear my story and learn about Windows XP!", anim: 'Greet' },
   { text: 'I was officially introduced in 2001 as the search companion for Windows XP.', anim: 'Searching' },
   {
      text: "But my origins go back to 1995! I was originally created for a project called 'Microsoft Bob'.",
      anim: 'Thinking',
   },
   {
      text: "With Windows XP, Microsoft brought the colorful 'Luna' theme, making computers much friendlier.",
      anim: 'LookUp',
   },
   { text: 'My job was to sniff out your files and keep you company while you worked.', anim: 'Pleased' },
   { text: "I'll let you explore the desktop now. Just click on me if you want to interact!", anim: 'Acknowledge' },
];

const loadAgentAnimations = async (agentName: string): Promise<AnimationMap> => {
   const manifestUrl = `/${agentName}/manifest.json`;

   try {
      const manifestRes = await fetch(manifestUrl, { cache: 'no-store' });
      if (!manifestRes.ok) {
         throw new Error(`[AGENT] Failed to load manifest at ${manifestUrl} (status ${manifestRes.status}).`);
      }

      const manifest = await manifestRes.json();
      return manifest.animations as Record<string, string[]>;
   } catch (error) {
      console.error('[AGENT] Error:', error);
      return {};
   }
};

function useAgentAnimator(defaultFps: number) {
   const imgRef = useRef<HTMLImageElement>(null);
   const animationsRef = useRef<AnimationMap>({});
   const timerRef = useRef<number | null>(null);
   const currentAnimRef = useRef<string | null>(null);

   const stopAnimation = useCallback(() => {
      if (timerRef.current !== null) {
         window.clearInterval(timerRef.current);
         timerRef.current = null;
      }
   }, []);

   const playAnimation = useCallback(
      (animName: string, options: AnimationOptions = {}) => {
         if (!animationsRef.current[animName] || !imgRef.current) return;

         console.log(`[AGENT] Playing: ${animName}`);

         const playFps = options.fps ?? defaultFps;
         const isLooping = options.loop ?? false;
         const nextAnim = options.nextAnim ?? 'RestPose';
         const nextOptions = options.nextOptions || { loop: true };

         const frames = animationsRef.current[animName];
         const frameTime = 1000 / playFps;

         stopAnimation();
         currentAnimRef.current = animName;

         let currentFrameIndex = 0;
         imgRef.current.src = frames[0];

         timerRef.current = window.setInterval(() => {
            currentFrameIndex++;

            if (currentFrameIndex >= frames.length) {
               if (isLooping) {
                  currentFrameIndex = 0;
               } else {
                  stopAnimation();
                  if (nextAnim && animationsRef.current[nextAnim]) {
                     setTimeout(() => playAnimation(nextAnim, nextOptions), frameTime);
                  } else {
                     currentAnimRef.current = null;
                  }
                  return;
               }
            }

            if (imgRef.current) {
               imgRef.current.src = frames[currentFrameIndex];
            }
         }, frameTime);
      },
      [defaultFps, stopAnimation],
   );

   return { imgRef, animationsRef, currentAnimRef, playAnimation, stopAnimation };
}

export default function Agent({ name, fps = 10, initialX, initialY }: AgentProps) {
   const [isReady, setIsReady] = useState(false);

   const { imgRef, animationsRef, currentAnimRef, playAnimation, stopAnimation } = useAgentAnimator(fps);

   const [storyState, setStoryState] = useState({
      isActive: false,
      isVisible: false,
      index: 0,
   });

   const { play } = useSound();

   useEffect(() => {
      if (storyState.isVisible) {
         play('xp-balloon');
      }
   }, [storyState.isVisible, play]);

   const storyStateRef = useRef(storyState);
   useEffect(() => {
      storyStateRef.current = storyState;
   }, [storyState]);

   const idleTimerRef = useRef<number | null>(null);

   const resetIdleTimerRef = useRef<() => void>(() => {});

   const resetIdleTimer = useCallback(() => {
      if (idleTimerRef.current !== null) {
         window.clearTimeout(idleTimerRef.current);
      }

      const nextIdleTime = Math.floor(Math.random() * (IDLE_INTERVAL_MAX - IDLE_INTERVAL_MIN)) + IDLE_INTERVAL_MIN;

      idleTimerRef.current = window.setTimeout(() => {
         const { isActive } = storyStateRef.current;
         const isIdle = currentAnimRef.current === 'RestPose' || currentAnimRef.current === null;

         if (isReady && isIdle && !isActive) {
            const availableIdles = IDLE_ANIMATIONS.filter((anim) => animationsRef.current[anim]);
            if (availableIdles.length > 0) {
               const randomAnim = availableIdles[Math.floor(Math.random() * availableIdles.length)];
               playAnimation(randomAnim);
            }
         }
         resetIdleTimerRef.current();
      }, nextIdleTime);
   }, [isReady, playAnimation, currentAnimRef, animationsRef]);

   useEffect(() => {
      resetIdleTimerRef.current = resetIdleTimer;
   }, [resetIdleTimer]);

   const [position, setPosition] = useState(() => ({
      x: initialX ?? window.innerWidth - 80 - 15,
      y: initialY ?? window.innerHeight - 80 - 30,
   }));

   const { isDragging, onPointerDown: handlePointerDown } = useDrag({
      onDragStart: (e) => {
         const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
         if (!rect) return false;
         resetIdleTimer();
         return { x: rect.left, y: rect.top };
      },
      onDrag: (x, y) => {
         setPosition({ x, y });
         resetIdleTimer();
      },
      onDragEnd: (wasDragged) => {
         if (!wasDragged && isReady) {
            playAnimation('ClickedOn');
         }
         resetIdleTimer();
      },
   });

   useEffect(() => {
      let isMounted = true;

      loadAgentAnimations(name).then((loadedAnimations) => {
         if (!isMounted) return;
         animationsRef.current = loadedAnimations;
         setIsReady(true);
         console.log('[AGENT] Ready (startup animations loaded)');
      });

      return () => {
         isMounted = false;
         stopAnimation();
      };
   }, [name, stopAnimation, animationsRef]);

   useEffect(() => {
      if (!isReady) return;

      const showFrames = animationsRef.current.Show?.length ?? 0;
      const showDurationMs = showFrames > 0 ? Math.ceil((showFrames / fps) * 1000) + 100 : 900;

      playAnimation('Show');

      const storyStartTimer = window.setTimeout(() => {
         setStoryState({ isActive: true, isVisible: true, index: 0 });
         playAnimation(AGENT_STORY[0].anim);
      }, showDurationMs);

      resetIdleTimer();

      return () => {
         window.clearTimeout(storyStartTimer);
         if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
      };
   }, [isReady, playAnimation, resetIdleTimer, fps, animationsRef]);

   const handleBubbleClick = useCallback(
      (e: React.MouseEvent) => {
         e.stopPropagation();
         const { isActive, index } = storyStateRef.current;

         if (!isActive) return;

         setStoryState((prev) => ({ ...prev, isVisible: false }));

         setTimeout(() => {
            const nextIndex = index + 1;
            if (nextIndex >= AGENT_STORY.length) {
               setStoryState({ isActive: false, isVisible: false, index: 0 });
               playAnimation('RestPose', { loop: true });
            } else {
               setStoryState({ isActive: true, isVisible: true, index: nextIndex });
               playAnimation(AGENT_STORY[nextIndex].anim);
            }
         }, 300);
      },
      [playAnimation],
   );

   return (
      <div
         style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 99,
            display: 'block',
            opacity: isReady ? 1 : 0,
            width: '80px',
            height: '80px',
            pointerEvents: isReady ? 'auto' : 'none',
            transition: 'opacity 220ms ease-out',
            cursor: isDragging ? 'grabbing' : 'grab',
         }}
      >
         <div
            onClick={handleBubbleClick}
            className={`absolute bottom-23.75 right-8.75 w-40 p-2.5 bg-[#fffde1] rounded-xl shadow-[2px_2px_3px_0px_rgba(0,0,0,0.50)] border border-black flex justify-center items-center cursor-pointer transition-all duration-300 transform ${
               storyState.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
            style={{ pointerEvents: storyState.isVisible ? 'auto' : 'none' }}
         >
            <div className="text-black text-[11px] font-normal font-tahoma leading-tight text-center relative z-20">
               {storyState.isActive ? AGENT_STORY[storyState.index].text : 'Hello there!'}
            </div>

            <div className="absolute -bottom-2.5 right-2.5 w-0 h-0 border-t-10 border-t-black border-l-10 border-l-transparent" />
            <div className="absolute -bottom-2 right-2.75 w-0 h-0 border-t-[9px] border-t-[#fffde1] border-l-[9px] border-l-transparent z-10" />
         </div>

         <img
            ref={imgRef}
            className="pixelated block"
            width="80"
            height="80"
            alt="Desktop Agent"
            draggable={false}
            onPointerDown={handlePointerDown}
            style={{ cursor: 'inherit' }}
         />
      </div>
   );
}
