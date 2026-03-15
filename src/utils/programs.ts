import type React from 'react';
import ComponentPreview from '../components/programs/component-preview/ComponentPreview';

export type TitleBarButton = 'minimize' | 'maximize' | 'close' | 'help';

export type WindowConfig = {
   defaultSize?: { width: number; height: number };

   minSize?: { width: number; height: number };

   maxSize?: { width: number; height: number };

   defaultPosition?: { x: number; y: number };

   defaultStatus?: 'normal' | 'minimized' | 'maximized';

   titleBarButtons?: TitleBarButton[];

   resizable?: boolean;
};

export type Program = {
   id: string;
   name: string;
   label: string;
   icons: {
      sm: string;
      md: string;
      lg: string;
   };
   exe?: React.FC;
   windowConfig?: WindowConfig;
};

export const programs: Program[] = [
   {
      id: 'internet-explorer',
      name: 'Internet Explorer',
      label: 'Internet',
      icons: {
         lg: 'src/assets/icons/system/internet-explorer-48.png',
         sm: 'src/assets/icons/system/internet-explorer-16.png',
         md: 'src/assets/icons/system/internet-explorer-32.png',
      },
   },
   {
      id: 'outlook',
      name: 'Outlook Express',
      label: 'E-mail',
      icons: {
         lg: 'src/assets/icons/misc/email-48.png',
         sm: 'src/assets/icons/misc/email-16.png',
         md: 'src/assets/icons/misc/email-32.png',
      },
   },
   {
      id: 'windows-media-player',
      name: 'Windows Media Player',
      label: 'Media Player',
      icons: {
         lg: 'src/assets/icons/system/windows-media-player-48.png',
         sm: 'src/assets/icons/system/windows-media-player-16.png',
         md: 'src/assets/icons/system/windows-media-player-32.png',
      },
   },
   {
      id: 'microsoft-news',
      name: 'MSN',
      label: 'News',
      icons: {
         lg: 'src/assets/icons/system/microsoft-news-48.png',
         sm: 'src/assets/icons/system/microsoft-news-16.png',
         md: 'src/assets/icons/system/microsoft-news-32.png',
      },
   },
   {
      id: 'windows-messenger',
      name: 'Windows Messenger',
      label: 'Messenger',
      icons: {
         lg: 'src/assets/icons/system/messenger-48.png',
         sm: 'src/assets/icons/system/messenger-16.png',
         md: 'src/assets/icons/system/messenger-32.png',
      },
   },
   {
      id: 'windows-tour',
      name: 'Windows XP Guided Tour',
      label: 'Tour',
      icons: {
         lg: 'src/assets/icons/system/windows-guided-tour-48.png',
         sm: 'src/assets/icons/system/windows-guided-tour-16.png',
         md: 'src/assets/icons/system/windows-guided-tour-32.png',
      },
   },
   {
      id: 'transfer-wizzard',
      name: 'Files and Settings Transfer Wizzard',
      label: 'Transfer Wizzard',
      icons: {
         lg: 'src/assets/icons/system/transfert-wizzard-48.png',
         sm: 'src/assets/icons/system/transfert-wizzard-16.png',
         md: 'src/assets/icons/system/transfert-wizzard-32.png',
      },
   },

   {
      id: 'visual-keyboard',
      name: 'Visual Keyboard',
      label: 'On-Screen Keyboard',
      icons: {
         lg: 'src/assets/icons/system/visual-keyboard-48.png',
         sm: 'src/assets/icons/system/visual-keyboard-16.png',
         md: 'src/assets/icons/system/visual-keyboard-32.png',
      },
   },
   {
      id: 'control-panel',
      name: 'Control Panel',
      label: 'Control Panel',
      icons: {
         lg: 'src/assets/icons/files/control-panel-48.png',
         sm: 'src/assets/icons/files/control-panel-16.png',
         md: 'src/assets/icons/files/control-panel-32.png',
      },
   },
   {
      id: 'setup-default-programs',
      name: 'Setup Default Programs',
      label: 'Default Programs',
      icons: {
         lg: 'src/assets/icons/system/default-program-settings-48.png',
         sm: 'src/assets/icons/system/default-program-settings-16.png',
         md: 'src/assets/icons/system/default-program-settings-32.png',
      },
   },
   {
      id: 'printer-and-faxes',
      name: 'Printers and Faxes',
      label: 'Printers and Faxes',
      icons: {
         lg: 'src/assets/icons/devices/printer-and-faxes-48.png',
         sm: 'src/assets/icons/devices/printer-and-faxes-16.png',
         md: 'src/assets/icons/devices/printer-and-faxes-32.png',
      },
   },
   {
      id: 'help-and-support',
      name: 'Help and Support',
      label: 'Help and Support',
      icons: {
         lg: 'src/assets/icons/ui/help-48.png',
         sm: 'src/assets/icons/ui/help-16.png',
         md: 'src/assets/icons/ui/help-32.png',
      },
   },
   {
      id: 'search',
      name: 'Search',
      label: 'Search',
      icons: {
         lg: 'src/assets/icons/files/search-48.png',
         sm: 'src/assets/icons/files/search-16.png',
         md: 'src/assets/icons/files/search-32.png',
      },
   },
   {
      id: 'run',
      name: 'Run',
      label: 'Run',
      icons: {
         lg: 'src/assets/icons/system/run-48.png',
         sm: 'src/assets/icons/system/run-16.png',
         md: 'src/assets/icons/system/run-32.png',
      },
      windowConfig: {
         defaultSize: { width: 400, height: 200 },
         defaultStatus: 'normal',
         titleBarButtons: ['help', 'close'],
         resizable: false,
      },
   },
   {
      id: 'component-preview',
      name: 'Component Preview',
      label: 'Dev Tools',
      icons: {
         lg: 'src/assets/icons/ui/help-48.png',
         sm: 'src/assets/icons/ui/help-16.png',
         md: 'src/assets/icons/ui/help-32.png',
      },
      exe: ComponentPreview,
      windowConfig: {
         defaultSize: { width: 700, height: 500 },
         minSize: { width: 400, height: 300 },
      },
   },
];

export type Folder = {
   id: string;
   name: string;
   icons: {
      sm: string;
      md?: string;
      lg: string;
      xl: string;
   };
   windowConfig?: WindowConfig;
};

export const folders: Folder[] = [
   {
      id: 'my-documents',
      name: 'Documents',
      icons: {
         lg: 'src/assets/icons/files/my-documents-32.png',
         sm: 'src/assets/icons/files/my-documents-16.png',
         md: 'src/assets/icons/files/my-documents-24.png',
         xl: 'src/assets/icons/files/my-documents-48.png',
      },
   },
   {
      id: 'my-computer',
      name: 'Computer',
      icons: {
         lg: 'src/assets/icons/files/this-computer-32.png',
         sm: 'src/assets/icons/files/this-computer-16.png',
         md: 'src/assets/icons/files/this-computer-24.png',
         xl: 'src/assets/icons/files/this-computer-48.png',
      },
   },
   {
      id: 'recycle-bin',
      name: 'Recycle Bin',
      icons: {
         lg: 'src/assets/icons/files/recycle-bin-full-32.png',
         sm: 'src/assets/icons/files/recycle-bin-full-16.png',
         xl: 'src/assets/icons/files/recycle-bin-full-48.png',
      },
   },
   {
      id: 'my-music',
      name: 'Music',
      icons: {
         lg: 'src/assets/icons/files/my-music-32.png',
         sm: 'src/assets/icons/files/my-music-16.png',
         md: 'src/assets/icons/files/my-music-24.png',
         xl: 'src/assets/icons/files/my-music-48.png',
      },
   },
   {
      id: 'my-pictures',
      name: 'Pictures',
      icons: {
         lg: 'src/assets/icons/files/my-pictures-32.png',
         sm: 'src/assets/icons/files/my-pictures-16.png',
         md: 'src/assets/icons/files/my-pictures-24.png',
         xl: 'src/assets/icons/files/my-pictures-48.png',
      },
   },
   {
      id: 'my-videos',
      name: 'Videos',
      icons: {
         lg: 'src/assets/icons/files/my-videos-32.png',
         sm: 'src/assets/icons/files/my-videos-16.png',
         md: 'src/assets/icons/files/my-videos-24.png',
         xl: 'src/assets/icons/files/my-videos-48.png',
      },
   },
   {
      id: 'my-recent-documents',
      name: 'Recent Documents',
      icons: {
         lg: 'src/assets/icons/files/file-history-32.png',
         sm: 'src/assets/icons/files/file-history-16.png',
         md: 'src/assets/icons/files/file-history-24.png',
         xl: 'src/assets/icons/files/file-history-48.png',
      },
   },
];
