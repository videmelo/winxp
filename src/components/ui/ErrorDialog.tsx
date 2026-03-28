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
      <div className="flex flex-col h-full bg-[#ece9d8] p-3 body-tahoma text-black overflow-hidden shadow-[inset_1px_1px_0px_#ffffff]">
         <div className="flex items-start gap-4 mb-3 px-2 flex-1 min-h-0">
            <img src={iconSrc} alt={type} className="pixelated shrink-0 w-8 h-8 mt-1" />
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 select-text leading-tight break-words pt-1">
               {message}
            </div>
         </div>
         
         <div className="flex justify-center shrink-0 pt-1 pb-1">
            <Button onClick={() => closeWindow(windowId)} className="min-w-[75px]">
               OK
            </Button>
         </div>
      </div>
   );
}
