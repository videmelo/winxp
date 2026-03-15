import { type InputHTMLAttributes } from 'react';

interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
   label?: string;
   fill?: boolean;
}

export function RadioButton({
   checked = false,
   disabled = false,
   label,
   fill = false,
   className = '',
   ...props
}: RadioButtonProps) {
   return (
      <label
         className={`group px-px inline-flex justify-start items-center gap-1 cursor-default ${
            fill ? 'w-full' : ''
         } ${className}`}
      >
         <input type="radio" className="sr-only" checked={checked} disabled={disabled} {...props} />

         <div
            className={`w-2.5 h-2.5 relative rounded-[10px] outline-1 shrink-0 overflow-hidden ${
               disabled
                  ? 'outline-stone-300 bg-transparent'
                  : 'outline-cyan-800 ui-radiobutton-interactive group-hover:bg-stone-200'
            }`}
         >
            {!disabled && (
               <div className="w-2.5 h-2.5 left-0 top-0 absolute rounded-[10px] border-2 border-orange-100 opacity-0 group-hover:opacity-100 group-active:opacity-0 pointer-events-none" />
            )}

            {checked && (
               <div
                  className={`w-1.25 h-1.25 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[10px] pointer-events-none ${
                     disabled ? 'bg-stone-300' : 'ui-radiobutton-dot'
                  }`}
               />
            )}
         </div>

         {label && (
            <div className="flex justify-start items-center gap-1">
               <div
                  className={`justify-center text-xs font-normal font-['Tahoma'] ${
                     disabled ? 'text-stone-400 ui-radiobutton-label-disabled' : 'text-black'
                  }`}
               >
                  {label}
               </div>
            </div>
         )}
      </label>
   );
}
