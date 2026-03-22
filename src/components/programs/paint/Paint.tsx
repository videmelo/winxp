export default function Paint({ onLoaded }: { onLoaded?: () => void }) {
   return (
      <div className="h-full w-full overflow-hidden bg-[#C0C0C0] relative">
         <div className={`h-full w-full flex flex-col`}>
            <ul className="flex h-5">
               <li className="label-tahoma hover:text-white hover:bg-[#000080] py-[2.75px] px-2 cursor-default">
                  File
               </li>
               <li className="label-tahoma hover:text-white hover:bg-[#000080] py-[2.75px] px-2 cursor-default">
                  Edit
               </li>
               <li className="label-tahoma hover:text-white hover:bg-[#000080] py-[2.75px] px-2 cursor-default">
                  Display
               </li>
               <li className="label-tahoma hover:text-white hover:bg-[#000080] py-[2.75px] px-2 cursor-default">
                  Favorites
               </li>
               <li className="label-tahoma hover:text-white hover:bg-[#000080] py-[2.75px] px-2 cursor-default">
                  Tools
               </li>
               <li className="label-tahoma hover:text-white hover:bg-[#000080] py-[2.75px] px-2 cursor-default">?</li>
            </ul>
            <div className="flex-1 w-full overflow-hidden bg-[#C0C0C0]">
               <iframe
                  src="https://jspaint.app/"
                  className="block w-full border-0"
                  style={{ height: '100%', marginTop: '-19px' }}
                  title="Paint"
                  lang="en"
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={() => {
                     if (onLoaded) onLoaded();
                  }}
               />
            </div>
         </div>
      </div>
   );
}
