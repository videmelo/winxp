import { useCallback } from 'react';
import SoundManager from '../utils/sound-manager';
import type { SoundName } from '../utils/sound-manager';

interface SoundOptions {
   volume?: number;
   preload?: boolean;
}

export function useSound() {
   const play = useCallback((name: SoundName, options: SoundOptions = {}) => {
      const { volume = 1.0, preload = false } = options;
      if (preload) {
         SoundManager.preload(name);
      }
      return SoundManager.play(name, volume);
   }, []);

   const stop = useCallback((name: SoundName) => {
      SoundManager.stop(name);
   }, []);

   return { play, stop };
}
