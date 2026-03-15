import Dropdown from './Dropdown';

export default function ControlPanel() {
   return (
      <div className="flex flex-col flex-1">
         <div className="flex flex-col">
            <ul className="flex h-5.5">
               <li className="label-tahoma hover:text-white hover:bg-bg-selection py-[2.75px] px-2">File</li>
               <li className="label-tahoma hover:text-white hover:bg-bg-selection py-[2.75px] px-2">Edit</li>
               <li className="label-tahoma hover:text-white hover:bg-bg-selection py-[2.75px] px-2">Display</li>
               <li className="label-tahoma hover:text-white hover:bg-bg-selection py-[2.75px] px-2">Favorites</li>
               <li className="label-tahoma hover:text-white hover:bg-bg-selection py-[2.75px] px-2">Tools</li>
               <li className="label-tahoma hover:text-white hover:bg-bg-selection py-[2.75px] px-2">?</li>
               <li className="label-tahoma ml-4 text-fg-soft py-[2.75px] px-2 xp-inset-border xp-inset-border-left">
                  Address
               </li>
               <li className="self-stretch flex-1">
                  <Dropdown />
               </li>

               <li className="flex items-center gap-1 mx-4">
                  <button className="xp-window-controls-btn-green xp-window-controls-icon-help"></button>
                  <span className="label-tahoma">OK</span>
               </li>
               <li className="px-4 xp-inset-border xp-inset-border-left bg-white flex items-center">
                  <img src="/assets/images/logo-windows.png" className="size-5 pixelated" />
               </li>
            </ul>
            <ul className="flex h-9.5">
               <li className="flex-1 xp-inset-border xp-inset-border-left xp-inset-border-top"></li>
               <li className="flex-1 xp-inset-border xp-inset-border-left xp-inset-border-top"></li>
               <li className="flex-1 xp-inset-border xp-inset-border-left xp-inset-border-top"></li>
            </ul>
         </div>
         <div className="flex flex-1">
            <div className="flex flex-1 xp-control-panel-sidepanel relative"></div>
            <div className="flex flex-2 bg-[#6375D6]"></div>
         </div>
      </div>
   );
}
