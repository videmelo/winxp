import React from 'react';

import { programs, folders } from '../../utils/programs.ts';
import { useWindowManager } from '../../hooks/useWindowManager';

type ProgramItem = {
   id: string;
   icon: string;
   name: string;
   label?: string;
};

type RightPaneItem = {
   id: string;
   icon: string;
   name: string;
   isBold?: boolean;
};

type StartMenuProps = {
   user?: {
      name: string;
      avatar: string;
   };
   leftItems?: {
      pinned: ProgramItem[];
      recent: ProgramItem[];
   };
   rightItems?: RightPaneItem[][];
   onLaunch?: (programId: string) => void;
};

const items = new Map(
   [...programs, ...folders].map((item) => [item.id, { ...item, label: 'label' in item ? item.label : item.name }]),
);

function Header({ username, avatarUrl }: { username: string; avatarUrl: string }) {
   return (
      <div className="w-full h-16 flex p-1.5 items-center gap-2">
         <img src={avatarUrl} alt="Avatar" className="startmenu-avatar size-13" />
         <p className="startmenu-username">{username}</p>
      </div>
   );
}

function LeftPane({
   pinneds,
   recents,
   onLaunch,
}: {
   pinneds: ProgramItem[];
   recents: ProgramItem[];
   onLaunch?: (id: string) => void;
}) {
   return (
      <div className="bg-white h-full flex-1 flex flex-col gap-2 items-start p-2.5">
         {pinneds.map((program, index) => (
            <div
               key={`pinned-${index}`}
               className="flex items-center gap-1 p-px hover:bg-xp-blue-selection w-full hover:text-white! group cursor-pointer"
               onClick={() => onLaunch?.(program.id)}
            >
               <img src={program.icon} className="pixelated size-8" />
               <div className="flex flex-col justify-start items-start grow relative">
                  <p className="label-bold-tahoma">{program.name}</p>
                  {program.label ? <p className="label-tahoma">{program.label}</p> : null}
               </div>
            </div>
         ))}

         {pinneds.length > 0 ? <span className="gradient-line m-px" /> : null}

         {recents.map((program, index) => (
            <div
               key={`recent-${index}`}
               className="flex items-center gap-1 p-px hover:bg-xp-blue-selection w-full hover:text-white! group cursor-pointer"
               onClick={() => onLaunch?.(program.id)}
            >
               <img src={program.icon} className="pixelated size-8" />
               <div className="flex flex-col justify-start items-start grow relative">
                  <p className="label-tahoma text-[#373738] group-hover:text-white">{program.name}</p>
               </div>
            </div>
         ))}

         <span className="gradient-line m-px" />
         <div className="flex justify-end items-center self-stretch gap-2 p-0.5 hover:bg-xp-blue-selection w-full hover:text-white!">
            <p className="label-bold-tahoma">All Programs</p>
            <span className="all-programs-btn" />
         </div>
      </div>
   );
}

function RightPane({ sections, onLaunch }: { sections: RightPaneItem[][]; onLaunch?: (id: string) => void }) {
   return (
      <div className="bg-[#D3E5FA] h-full flex-1 border-l border-l-[#95BDEE] flex flex-col gap-1 px-1.5 pt-2 pb-0.5">
         {sections.map((section, index) => (
            <React.Fragment key={`section-${index}`}>
               {section.map((item, itemIndex) => (
                  <div
                     key={`item-${itemIndex}`}
                     className="flex justify-start items-center self-stretch relative gap-1 p-px hover:bg-xp-blue-selection w-full hover:text-white! group cursor-pointer"
                     onClick={() => onLaunch?.(item.id)}
                  >
                     <div className="size-6 relative">
                        <img src={item.icon} className="pixelated size-6" />
                     </div>
                     <p
                        className={`${item.isBold ? 'label-bold-tahoma' : 'label-tahoma group-hover:text-white'} text-[#0a236a]`}
                     >
                        {item.name}
                     </p>
                  </div>
               ))}
               {index < sections.length - 1 ? (
                  <div className="flex flex-col justify-start items-center self-stretch relative">
                     <div className="w-33.5 h-px relative overflow-hidden bg-linear-to-r from-[#bad6fd] via-[#80b6ff] to-[#b5d3fc]" />
                  </div>
               ) : null}
            </React.Fragment>
         ))}
      </div>
   );
}

function Footer() {
   const actions = [
      { label: 'Log off', btnClass: 'xp-btn-yellow xp-icon-logoff' },
      { label: 'Turn off', btnClass: 'xp-btn-red xp-icon-poweroff' },
   ];

   return (
      <div className="flex justify-end items-center h-10 w-full gap-4 px-2.5">
         {actions.map((action, idx) => (
            <div key={idx} className="flex items-center gap-1 p-0.5 cursor-pointer">
               <div className={action.btnClass} />
               <p className="label-tahoma text-white">{action.label}</p>
            </div>
         ))}
      </div>
   );
}

function StartMenu({
   user = { name: 'Vinicius', avatar: './src/assets/icons/system/placeholders-32.png' },
   onLaunch,
   leftItems = {
      pinned: ['internet-explorer', 'outlook'].map((id) => {
         const item = items.get(id);
         return {
            id,
            icon: item?.icons.md || '',
            name: item?.name || '',
            label: item?.label || '',
         };
      }),
      recent: ['windows-media-player', 'microsoft-news', 'windows-messenger', 'windows-tour', 'transfer-wizzard'].map(
         (id) => ({
            id,
            icon: items.get(id)?.icons.md || '',
            name: items.get(id)?.name || '',
         }),
      ),
   },
   rightItems = [
      ['my-documents', 'my-recent-documents', 'my-pictures', 'my-music', 'my-computer'].map((id) => ({
         id,
         icon: items.get(id)?.icons.md || '',
         name: items.get(id)?.name || '',
         isBold: true,
      })),
      ['control-panel', 'setup-default-programs', 'printer-and-faxes'].map((id) => ({
         id,
         icon: items.get(id)?.icons.md || '',
         name: items.get(id)?.name || '',
      })),
      ['help-and-support', 'search', 'run'].map((id) => ({
         id,
         icon: items.get(id)?.icons.md || '',
         name: items.get(id)?.name || '',
      })),
   ],
}: StartMenuProps) {
   const { openProgram } = useWindowManager();

   const handleLaunch = onLaunch ?? ((programId: string) => openProgram(programId));

   return (
      <div className="startmenu flex flex-col rounded-t-md border border-[#215CC5] w-95 h-120">
         <Header username={user.name} avatarUrl={user.avatar} />
         <div className="flex w-full h-full">
            <div className="startmenu-launcher flex flex-col w-full relative border-t mx-px border-t-[#1964CD]">
               <span className="startmenu-gradient absolute w-full h-0.5" />
               <div className="flex w-full h-full">
                  <LeftPane pinneds={leftItems.pinned} recents={leftItems.recent} onLaunch={handleLaunch} />
                  <RightPane sections={rightItems} onLaunch={handleLaunch} />
               </div>
               <Footer />
            </div>
         </div>
      </div>
   );
}

export default StartMenu;
