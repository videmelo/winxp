import { useEffect } from 'react';
import { useWindowManager } from '../../hooks/useWindowManager';
import { useSound } from '../../hooks/useSound';
import { Button } from './Button';

export type ErrorType = 'error' | 'warning' | 'info';

interface ErrorDialogProps {
   windowId: string;
   params?: {
      message: string;
      type?: ErrorType;
   };
}

export default function ErrorDialog({ windowId, params }: ErrorDialogProps) {
   const { closeWindow } = useWindowManager();
   const { play } = useSound();
   const { message, type = 'error' } = params || { message: 'Unknown error', type: 'error' };

   useEffect(() => {
      if (type === 'error') {
         play('xp-error');
      } else if (type === 'warning') {
         play('xp-exclamation');
      } else {
         play('xp-default');
      }
   }, [type, play]);

   const iconSrc = type === 'warning' 
      ? '/assets/icons/ui/warning-32.png' 
      : '/assets/icons/ui/error-32.png';

   return (
      <div className="flex flex-col flex-1 bg-[#ece9d8] p-3 body-tahoma text-black">
         <div className="flex items-start gap-4 mb-4 flex-1 mt-2 px-2">
            <img src={iconSrc} alt={type} className="pixelated shrink-0 w-8 h-8" />
            <div className="pt-1 select-text leading-tight break-words max-w-[280px]">
               {message}
            </div>
         </div>
         
         <div className="flex justify-center pb-2">
            <Button onClick={() => closeWindow(windowId)}>
               OK
            </Button>
         </div>
      </div>
   );
}
