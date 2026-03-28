import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
   hug?: boolean;
}

export function Button({ children, className = '', disabled, hug = false, ...props }: ButtonProps) {
   return (
      <div className={`p-px inline-flex flex-col justify-start items-start ${hug ? '' : 'min-w-20'} ${className}`}>
         <button
            disabled={disabled}
            className={`${hug ? 'px-1.5' : 'self-stretch px-3'} py-1 rounded-sm outline-1 -outline-offset-1 inline-flex justify-center items-center overflow-hidden transition-all ${
               disabled
                  ? 'bg-stone-100 outline-black/20 ui-button-disabled cursor-not-allowed'
                  : 'ui-button-interactive outline-cyan-800'
            }`}
            {...props}
         >
            <span
               className={`text-center justify-center text-xs font-normal font-['Tahoma'] line-clamp-1 ${
                  disabled ? 'text-black opacity-30' : 'text-black'
               }`}
            >
               {children}
            </span>
         </button>
      </div>
   );
}
