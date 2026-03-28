export type SoundName =
   | 'chimes'
   | 'chord'
   | 'ding'
   | 'feed-discovered'
   | 'information-bar'
   | 'navigation-start'
   | 'notify'
   | 'pop-up-blocked'
   | 'recycle'
   | 'ringin'
   | 'ringout'
   | 'start'
   | 'tada'
   | 'xp-balloon'
   | 'xp-battery-critical'
   | 'xp-battery-low'
   | 'xp-critical-stop'
   | 'xp-default'
   | 'xp-ding'
   | 'xp-error'
   | 'xp-exclamation'
   | 'xp-hardware-fail'
   | 'xp-hardware-insert'
   | 'xp-hardware-remove'
   | 'xp-information-bar'
   | 'xp-logoff-sound'
   | 'xp-logon-sound'
   | 'xp-menu-command'
   | 'xp-minimize'
   | 'xp-notify'
   | 'xp-pop-up-blocked'
   | 'xp-print-complete'
   | 'xp-recycle'
   | 'xp-restore'
   | 'xp-ringin'
   | 'xp-ringout'
   | 'xp-shutdown'
   | 'xp-start'
   | 'xp-startup';

class SoundManager {
   private static cache: Map<SoundName, HTMLAudioElement> = new Map();

   static preload(name: SoundName): void {
      if (!this.cache.has(name)) {
         const audio = new Audio(`/assets/sounds/${name}.wav`);
         audio.load();
         this.cache.set(name, audio);
      }
   }

   static play(name: SoundName, volume: number = 1.0): Promise<void> {
      let audio = this.cache.get(name);

      if (!audio) {
         audio = new Audio(`/assets/sounds/${name}.wav`);
         this.cache.set(name, audio);
      }

      audio.currentTime = 0;
      audio.volume = volume;

      return audio.play().catch((err) => {
         console.warn(`[SOUND] Failed to play sound "${name}":`, err);
      });
   }

   static stop(name: SoundName): void {
      const audio = this.cache.get(name);
      if (audio) {
         audio.pause();
         audio.currentTime = 0;
      }
   }
}

export default SoundManager;
