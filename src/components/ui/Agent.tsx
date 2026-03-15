import React, { useEffect, useRef, useState, useCallback } from 'react';
import JSZip from 'jszip';

interface AgentProps {
   fcsUrl: string;
   fps?: number;
   initialX?: number;
   initialY?: number;
}

const extractFramesAndRemoveBackground = async (blob: Blob): Promise<string> => {
   return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
         const canvas = document.createElement('canvas');
         canvas.width = img.width;
         canvas.height = img.height;
         const ctx = canvas.getContext('2d', { willReadFrequently: true });

         if (!ctx) {
            reject(new Error('Failed to get 2d context for Agent'));
            return;
         }

         ctx.drawImage(img, 0, 0);
         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
         const data = imageData.data;

         // the first pixel (top-left) determines the background color to become transparent
         const [bgR, bgG, bgB] = data;

         for (let i = 0; i < data.length; i += 4) {
            if (data[i] === bgR && data[i + 1] === bgG && data[i + 2] === bgB) {
               data[i + 3] = 0; // set alpha to 0 (transparent)
            }
         }

         ctx.putImageData(imageData, 0, 0);

         canvas.toBlob((newBlob) => {
            if (!newBlob) {
               reject(new Error('Failed to create blob from canvas'));
               return;
            }
            resolve(URL.createObjectURL(newBlob));
         }, 'image/png');
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
   });
};

const ROVER_STORY = [
   { text: "Woof! I'm Rover. Click this bubble to hear my story and learn about Windows XP!", anim: "Greet" },
   { text: "I was officially introduced in 2001 as the search companion for Windows XP.", anim: "Searching" },
   { text: "But my origins go back to 1995! I was originally created for a project called 'Microsoft Bob'.", anim: "Thinking" },
   { text: "With Windows XP, Microsoft brought the colorful 'Luna' theme, making computers much friendlier.", anim: "LookUp" },
   { text: "My job was to sniff out your files and keep you company while you worked.", anim: "Pleased" },
   { text: "I'll let you explore the desktop now. Just click on me if you want to interact!", anim: "Acknowledge" },
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
      (animName: string, options: { fps?: number; loop?: boolean; nextAnim?: string; nextOptions?: any } = {}) => {
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

      const nextIdleTime = Math.floor(Math.random() * 10000) + 5000; // 5s to 15s

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

      const fetchAndParseFcs = async () => {
         try {
            // Try loading from pre-extracted folder first (Optimization)
            const folderName = fcsUrl.replace(/\.[^/.]+$/, '');
            const manifestUrl = `${folderName}/manifest.json`;

            try {
               const manifestRes = await fetch(manifestUrl);
               if (manifestRes.ok) {
                  console.log(`[AGENT] Loading optimized assets from ${folderName}`);
                  const manifest = await manifestRes.json();
                  const animEntries = Object.entries(manifest.animations as Record<string, string[]>);

                  // Helper to process a single animation
                  const processAnimation = async (animName: string, frames: string[]) => {
                     const framePromises = frames.map(async (frameFile) => {
                        const frameUrl = `${folderName}/${animName}/${frameFile}`;
                        const frameRes = await fetch(frameUrl);
                        const blob = await frameRes.blob();
                        return extractFramesAndRemoveBackground(blob);
                     });
                     return Promise.all(framePromises);
                  };

                  // 1. Prioritize essential animations
                  const priorityAnims = [
                     'Show',
                     'RestPose',
                     'Greet',
                     'Searching',
                     'Thinking',
                     'LookUp',
                     'Pleased',
                     'Acknowledge',
                  ];

                  for (const animName of priorityAnims) {
                     if (manifest.animations[animName]) {
                        animationsRef.current[animName] = await processAnimation(animName, manifest.animations[animName]);
                     }
                  }

                  if (isMounted) {
                     setIsReady(true);
                     console.log('[AGENT] Ready (Priority Anims Loaded)');
                  }

                  // 2. Load the rest in the background
                  const remainingAnims = animEntries.filter(([name]) => !priorityAnims.includes(name));

                  (async () => {
                     for (const [animName, frames] of remainingAnims) {
                        if (!isMounted) break;
                        animationsRef.current[animName] = await processAnimation(animName, frames);
                     }
                     if (isMounted) {
                        console.log('[AGENT] All Animations Loaded in Background');
                     }
                  })();

                  return;
               }
            } catch (e) {
               console.log('[AGENT] Optimized folder error, falling back to ZIP loading:', e);
            }

            // Fallback: Standard ZIP loading
            const response = await fetch(fcsUrl);
            if (!response.ok) throw new Error('Failed to fetch FCS file');

            const arrayBuffer = await response.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);

            const tempAnimations: Record<string, { index: number; url: string }[]> = {};
            const processingPromises: Promise<void>[] = [];

            Object.keys(zip.files).forEach((fileName, index) => {
               if (!fileName.toLowerCase().endsWith('.bmp')) return;

               const [animationName] = fileName.split('/');
               if (!animationName) return;

               const fileData = zip.files[fileName];

               const processFile = async () => {
                  const blob = await fileData.async('blob');
                  const transparentImageUrl = await extractFramesAndRemoveBackground(blob);

                  if (!tempAnimations[animationName]) tempAnimations[animationName] = [];
                  tempAnimations[animationName].push({ index, url: transparentImageUrl });
               };

               processingPromises.push(processFile());
            });

            await Promise.all(processingPromises);

            const parsedAnimations: Record<string, string[]> = {};
            Object.keys(tempAnimations).forEach((animName) => {
               const sortedFrames = tempAnimations[animName].sort((a, b) => a.index - b.index);
               parsedAnimations[animName] = sortedFrames.map((frame) => frame.url);
            });

            if (isMounted) {
               animationsRef.current = parsedAnimations;
               setIsReady(true);
               console.log('[AGENT] Available Animations (ZIP Fallback):', Object.keys(parsedAnimations));
            }
         } catch (error) {
            console.error('Agent FCS processing error:', error);
         }
      };

      fetchAndParseFcs();

      return () => {
         isMounted = false;
         stopAnimation();
      };
   }, [fcsUrl, stopAnimation]);

   const handleBubbleClick = useCallback(
      (e: React.MouseEvent) => {
         e.stopPropagation();
         if (!isStoryActiveRef.current) return;

         setIsBubbleVisible(false); // Fade out

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
                  setIsBubbleVisible(true); // Fade back in
                  playAnimation(ROVER_STORY[nextIndex].anim, {
                     fps: 10,
                     loop: false,
                     nextAnim: 'RestPose',
                     nextOptions: { fps: 10, loop: true },
                  });
                  return nextIndex;
               }
            });
         }, 300); // Wait for fade out animation
      },
      [playAnimation],
   );

   useEffect(() => {
      if (!isReady) return;

      // Initial show animation
      playAnimation('Show', {
         fps: 10,
         loop: false,
         nextAnim: 'RestPose',
         nextOptions: { fps: 10, loop: true },
      });

      const storyStartTimer = window.setTimeout(() => {
         setIsStoryActive(true);
         setStoryIndex(0);
         setIsBubbleVisible(true);
         playAnimation(ROVER_STORY[0].anim, {
            fps: 10,
            loop: false,
            nextAnim: 'RestPose',
            nextOptions: { fps: 10, loop: true },
         });
      }, 2000);

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
            display: isReady ? 'block' : 'none',
            width: '80px',
            height: '80px',
            cursor: isDraggingState ? 'grabbing' : 'grab',
         }}
      >
         {/* Speech Bubble */}
         <div
            onClick={handleBubbleClick}
            className={`absolute bottom-[95px] right-[35px] w-40 p-2.5 bg-[#fffde1] rounded-xl shadow-[2px_2px_3px_0px_rgba(0,0,0,0.50)] border border-black flex justify-center items-center cursor-pointer transition-all duration-300 transform ${isBubbleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            style={{ pointerEvents: isBubbleVisible ? 'auto' : 'none' }}
         >
            <div className="text-black text-[11px] font-normal font-tahoma leading-tight text-center relative z-20">
               {isStoryActive ? ROVER_STORY[storyIndex].text : "Woof! Hello there, I'm Rover!"}
            </div>

            {/* Bubble Tail (Outer Black) */}
            <div className="absolute -bottom-[10px] right-[10px] w-0 h-0 border-t-[10px] border-t-black border-l-[10px] border-l-transparent" />
            {/* Bubble Tail (Inner Yellow) */}
            <div className="absolute -bottom-[8px] right-[11px] w-0 h-0 border-t-[9px] border-t-[#fffde1] border-l-[9px] border-l-transparent z-10" />
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
