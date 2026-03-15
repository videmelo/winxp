import React, { useEffect, useRef, useState, useCallback } from 'react';

interface AgentProps {
   fcsUrl: string;
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

const STARTUP_ANIMATIONS = ['Show', 'RestPose', 'Greet'];
const STARTUP_FPS = 10;
const STARTUP_DELAY = 230;

const processAnimationFrames = async (
   folderName: string,
   animName: string,
   frames: string[],
   assetVersion?: string,
): Promise<string[]> => {
   const isBase64 = frames.length > 0 && frames[0].startsWith('data:image');
   if (isBase64) {
      return frames;
   }

   const versionSuffix = assetVersion ? `?v=${encodeURIComponent(assetVersion)}` : '';
   const hasLegacyFrames = frames.some((frameFile) => !frameFile.toLowerCase().endsWith('.png'));

   if (hasLegacyFrames) {
      throw new Error('[AGENT] Manifest contains legacy non-PNG frames. Run pnpm run extract-agent.');
   }

   return frames.map((frameFile) => `${folderName}/${animName}/${frameFile}${versionSuffix}`);
};

const loadAgentAnimations = async (fcsUrl: string): Promise<AnimationMap> => {
   const folderName = fcsUrl.replace(/\.[^/.]+$/, '');
   const manifestUrl = `${folderName}/manifest.json`;
   const manifestRes = await fetch(manifestUrl, { cache: 'no-store' });

   if (!manifestRes.ok) {
      throw new Error(`[AGENT] Failed to load manifest at ${manifestUrl} (status ${manifestRes.status}).`);
   }

   console.log(`[AGENT] Loading optimized assets from ${folderName}`);
   const manifest = await manifestRes.json();
   const allAnimations = manifest.animations as Record<string, string[]>;
   const assetVersion = typeof manifest.version === 'string' ? manifest.version : undefined;
   const loadedAnimations: AnimationMap = {};

   const loadAnimation = async (animName: string) => {
      if (loadedAnimations[animName]) return;
      const frames = allAnimations[animName];
      if (!frames) return;

      loadedAnimations[animName] = await processAnimationFrames(folderName, animName, frames, assetVersion);
   };

   await Promise.all(STARTUP_ANIMATIONS.map((animName) => loadAnimation(animName)));

   const remainingAnims = Object.keys(allAnimations).filter((name) => !STARTUP_ANIMATIONS.includes(name));
   void (async () => {
      for (let i = 0; i < remainingAnims.length; i++) {
         await loadAnimation(remainingAnims[i]);

         if (i % 2 === 0) {
            await new Promise<void>((resolve) => {
               window.setTimeout(resolve, 0);
            });
         }
      }

      console.log('[AGENT] All animations loaded in background');
   })();

   return loadedAnimations;
};

const ROVER_STORY = [
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

export default function Agent({ fcsUrl, fps = 10, initialX, initialY }: AgentProps) {
   const imgRef = useRef<HTMLImageElement>(null);
   const [isReady, setIsReady] = useState(false);
   const animationsRef = useRef<Record<string, string[]>>({});
   const timerRef = useRef<number | null>(null);
   const idleTimerRef = useRef<number | null>(null);
   const currentAnimRef = useRef<string | null>(null);

   const [isBubbleVisible, setIsBubbleVisible] = useState(false);
   const [isStoryActive, setIsStoryActive] = useState(false);
   const [storyIndex, setStoryIndex] = useState(0);
   const isStoryActiveRef = useRef(false);

   const isDraggingRef = useRef(false);
   const [isDraggingState, setIsDraggingState] = useState(false);
   const hasDragged = useRef(false);

   useEffect(() => {
      isStoryActiveRef.current = isStoryActive;
   }, [isStoryActive]);

   const [position, setPosition] = useState(() => {
      const defaultX = window.innerWidth - 80 - 15;
      const defaultY = window.innerHeight - 80 - 30;

      return {
         x: initialX ?? defaultX,
         y: initialY ?? defaultY,
      };
   });
   const dragOffset = useRef({ x: 0, y: 0 });

   const stopAnimation = useCallback(() => {
      if (timerRef.current) {
         window.clearInterval(timerRef.current);
         timerRef.current = null;
      }
   }, []);

   const playAnimation = useCallback(
      (animName: string, options: AnimationOptions = {}) => {
         if (!animationsRef.current[animName] || !imgRef.current) return;

         console.log(`[AGENT] Playing: ${animName}`);

         const playFps = options.fps || fps;
         const isLooping = options.loop ?? true;
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
                  if (options.nextAnim && animationsRef.current[options.nextAnim]) {
                     setTimeout(() => playAnimation(options.nextAnim!, options.nextOptions), frameTime);
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
      [fps, stopAnimation],
   );

   const resetIdleTimer = useCallback(() => {
      if (idleTimerRef.current) {
         clearTimeout(idleTimerRef.current);
      }

      const nextIdleTime = Math.floor(Math.random() * 10000) + 5000;

      idleTimerRef.current = window.setTimeout(() => {
         const isIdle = currentAnimRef.current === 'RestPose' || currentAnimRef.current === null;

         if (isReady && !isDraggingRef.current && isIdle && !isStoryActiveRef.current) {
            const idleAnimations = [
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

            const availableIdles = idleAnimations.filter((anim) => animationsRef.current[anim]);

            if (availableIdles.length > 0) {
               const randomAnim = availableIdles[Math.floor(Math.random() * availableIdles.length)];
               playAnimation(randomAnim, {
                  fps: 10,
                  loop: false,
                  nextAnim: 'RestPose',
                  nextOptions: { fps: 10, loop: true },
               });
            }
         }
         resetIdleTimer();
      }, nextIdleTime);
   }, [isReady, playAnimation]);

   useEffect(() => {
      let isMounted = true;

      loadAgentAnimations(fcsUrl)
         .then((loadedAnimations) => {
            if (!isMounted) return;
            animationsRef.current = loadedAnimations;
            setIsReady(true);
            console.log('[AGENT] Ready (startup animations loaded)');
         })
         .catch((error) => {
            console.error('Agent FCS processing error:', error);
         });

      return () => {
         isMounted = false;
         stopAnimation();
      };
   }, [fcsUrl, stopAnimation]);

   const handleBubbleClick = useCallback(
      (e: React.MouseEvent) => {
         e.stopPropagation();
         if (!isStoryActiveRef.current) return;

         setIsBubbleVisible(false);

         setTimeout(() => {
            setStoryIndex((prev) => {
               const nextIndex = prev + 1;
               if (nextIndex >= ROVER_STORY.length) {
                  setIsStoryActive(false);
                  setIsBubbleVisible(false);
                  playAnimation('RestPose', { fps: 10, loop: true });
                  return 0;
               } else {
                  setStoryIndex(nextIndex);
                  setIsBubbleVisible(true);
                  playAnimation(ROVER_STORY[nextIndex].anim, {
                     fps: 10,
                     loop: false,
                     nextAnim: 'RestPose',
                     nextOptions: { fps: 10, loop: true },
                  });
                  return nextIndex;
               }
            });
         }, 300);
      },
      [playAnimation],
   );

   useEffect(() => {
      if (!isReady) return;

      const showFrames = animationsRef.current.Show?.length ?? 0;
      const showDurationMs = showFrames > 0 ? Math.ceil((showFrames / STARTUP_FPS) * 1000) : 900;

      playAnimation('Show', {
         fps: STARTUP_FPS,
         loop: false,
         nextAnim: 'RestPose',
         nextOptions: { fps: STARTUP_FPS, loop: true },
      });

      const storyStartTimer = window.setTimeout(() => {
         setIsStoryActive(true);
         setStoryIndex(0);
         setIsBubbleVisible(true);
         playAnimation(ROVER_STORY[0].anim, {
            fps: STARTUP_FPS,
            loop: false,
            nextAnim: 'RestPose',
            nextOptions: { fps: STARTUP_FPS, loop: true },
         });
      }, showDurationMs + STARTUP_DELAY);

      resetIdleTimer();

      return () => {
         window.clearTimeout(storyStartTimer);
         if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
         }
      };
   }, [isReady, playAnimation, resetIdleTimer]);

   const handleMouseMove = useCallback(
      (e: MouseEvent) => {
         if (!isDraggingRef.current) return;
         hasDragged.current = true;
         setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
         });
         resetIdleTimer();
      },
      [resetIdleTimer],
   );

   const handleMouseUp = useCallback(() => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDraggingState(false);

      if (!hasDragged.current && isReady) {
         playAnimation('ClickedOn', {
            fps: 10,
            loop: false,
            nextAnim: 'RestPose',
            nextOptions: { fps: 10, loop: true },
         });
      }

      resetIdleTimer();

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
   }, [handleMouseMove, isReady, playAnimation, resetIdleTimer]);

   const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
         e.preventDefault();
         if (!imgRef.current) return;

         const wrapperElement = imgRef.current.parentElement;
         if (!wrapperElement) return;

         const { left, top } = wrapperElement.getBoundingClientRect();
         dragOffset.current = { x: e.clientX - left, y: e.clientY - top };

         isDraggingRef.current = true;
         setIsDraggingState(true);
         hasDragged.current = false;

         resetIdleTimer();

         document.addEventListener('mousemove', handleMouseMove);
         document.addEventListener('mouseup', handleMouseUp);
      },
      [handleMouseMove, handleMouseUp, resetIdleTimer],
   );

   useEffect(() => {
      return () => {
         document.removeEventListener('mousemove', handleMouseMove);
         document.removeEventListener('mouseup', handleMouseUp);
      };
   }, [handleMouseMove, handleMouseUp]);

   return (
      <div
         style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 9999,
            display: 'block',
            opacity: isReady ? 1 : 0,
            width: '80px',
            height: '80px',
            pointerEvents: isReady ? 'auto' : 'none',
            transition: 'opacity 220ms ease-out',
            cursor: isDraggingState ? 'grabbing' : 'grab',
         }}
      >
         <div
            onClick={handleBubbleClick}
            className={`absolute bottom-23.75 right-8.75 w-40 p-2.5 bg-[#fffde1] rounded-xl shadow-[2px_2px_3px_0px_rgba(0,0,0,0.50)] border border-black flex justify-center items-center cursor-pointer transition-all duration-300 transform ${isBubbleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            style={{ pointerEvents: isBubbleVisible ? 'auto' : 'none' }}
         >
            <div className="text-black text-[11px] font-normal font-tahoma leading-tight text-center relative z-20">
               {isStoryActive ? ROVER_STORY[storyIndex].text : "Woof! Hello there, I'm Rover!"}
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
            draggable="false"
            onMouseDown={handleMouseDown}
            style={{
               cursor: 'inherit',
            }}
         />
      </div>
   );
}
