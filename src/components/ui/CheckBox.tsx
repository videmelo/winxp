import { type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
   label?: string;
   unknown?: boolean;
   fill?: boolean;
   type?: 'square' | 'check';
}

export function Checkbox({
   checked = false,
   unknown = false,
   disabled = false,
   label,
   fill = false,
   type = 'square',
   className = '',
   ...props
}: CheckboxProps) {
   return (
      <label
         className={`group px-px inline-flex justify-start items-center gap-1 cursor-default ${
            fill ? 'w-full' : ''
         } ${className}`}
      >
         <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} {...props} />

         <div
            className={`w-2.5 h-2.5 relative outline-1 shrink-0 overflow-hidden ${
               disabled
                  ? 'bg-white outline-stone-300 ui-checkbox-disabled'
                  : 'bg-white ui-checkbox-interactive outline-cyan-800 group-hover:bg-stone-200 group-active:bg-stone-200'
            }`}
         >
            {!disabled && (
               <div className="w-2.5 h-2.5 left-0 top-0 absolute border-2 border-orange-100 opacity-0 group-hover:opacity-100 group-active:opacity-0 pointer-events-none" />
            )}

            {unknown && !checked && (
               <div
                  className={`w-1.5 h-1.5 left-0.5 top-0.5 absolute pointer-events-none ${
                     disabled ? 'bg-stone-300' : 'bg-green-400 group-active:bg-green-700'
                  }`}
               />
            )}

            {checked && !unknown && type === 'square' && (
               <div
                  className={`w-1.5 h-1.5 left-0.5 top-0.5 absolute pointer-events-none ${
                     disabled ? 'bg-stone-300' : 'bg-green-600'
                  }`}
               />
            )}

            {checked && !unknown && type === 'check' && (
               <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-2.5 h-2.5 absolute left-0 top-0 pointer-events-none ${
                     disabled ? 'text-stone-300' : 'text-green-600'
                  }`}
               >
                  <path
                     d="M3.5 6.5L5 8L8.5 4"
                     stroke="currentColor"
                     strokeWidth="1.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               </svg>
            )}
         </div>

         {label && (
            <div className="flex justify-start items-center gap-1">
               <div
                  className={`justify-center text-xs font-normal font-['Tahoma'] ${
                     disabled ? 'text-stone-400 ui-checkbox-label-disabled' : 'text-black'
                  }`}
               >
                  {label}
               </div>
            </div>
         )}
      </label>
   );
}
