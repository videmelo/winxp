export type TitleBarButton = 'minimize' | 'maximize' | 'close' | 'help';

export type WindowConfig = {
   defaultSize?: { width: number; height: number };
   minSize?: { width: number; height: number };
   maxSize?: { width: number; height: number };
   defaultPosition?: { x: number; y: number };
   defaultStatus?: 'normal' | 'minimized' | 'maximized';
   titleBarButtons?: TitleBarButton[];
   resizable?: boolean;
   singleInstance?: boolean;
   isLoading?: boolean;
};

export type ProgramMetadata = {
   id: string;
   name: string;
   label: string;
   icons: {
      sm: string;
      md: string;
      lg: string;
   };
   windowConfig?: WindowConfig;
   singleInstance?: boolean;
};

export const programsMetadata: ProgramMetadata[] = [
   {
      id: 'internet-explorer',
      name: 'Internet Explorer',
      label: 'Internet',
      icons: {
         lg: '/assets/icons/system/internet-explorer-48.png',
         sm: '/assets/icons/system/internet-explorer-16.png',
         md: '/assets/icons/system/internet-explorer-32.png',
      },
   },
   {
      id: 'outlook',
      name: 'Outlook Express',
      label: 'E-mail',
      icons: {
         lg: '/assets/icons/misc/email-48.png',
         sm: '/assets/icons/misc/email-16.png',
         md: '/assets/icons/misc/email-32.png',
      },
   },
   {
      id: 'windows-media-player',
      name: 'Windows Media Player',
      label: 'Media Player',
      icons: {
         lg: '/assets/icons/system/windows-media-player-48.png',
         sm: '/assets/icons/system/windows-media-player-16.png',
         md: '/assets/icons/system/windows-media-player-32.png',
      },
   },
   {
      id: 'microsoft-news',
      name: 'MSN',
      label: 'News',
      icons: {
         lg: '/assets/icons/system/microsoft-news-48.png',
         sm: '/assets/icons/system/microsoft-news-16.png',
         md: '/assets/icons/system/microsoft-news-32.png',
      },
   },
   {
      id: 'windows-messenger',
      name: 'Windows Messenger',
      label: 'Messenger',
      icons: {
         lg: '/assets/icons/system/messenger-48.png',
         sm: '/assets/icons/system/messenger-16.png',
         md: '/assets/icons/system/messenger-32.png',
      },
   },
   {
      id: 'windows-tour',
      name: 'Windows XP Guided Tour',
      label: 'Tour',
      icons: {
         lg: '/assets/icons/system/windows-guided-tour-48.png',
         sm: '/assets/icons/system/windows-guided-tour-16.png',
         md: '/assets/icons/system/windows-guided-tour-32.png',
      },
   },
   {
      id: 'transfer-wizzard',
      name: 'Files and Settings Transfer Wizzard',
      label: 'Transfer Wizzard',
      icons: {
         lg: '/assets/icons/system/transfert-wizzard-48.png',
         sm: '/assets/icons/system/transfert-wizzard-16.png',
         md: '/assets/icons/system/transfert-wizzard-32.png',
      },
   },
   {
      id: 'visual-keyboard',
      name: 'Visual Keyboard',
      label: 'On-Screen Keyboard',
      icons: {
         lg: '/assets/icons/system/visual-keyboard-48.png',
         sm: '/assets/icons/system/visual-keyboard-16.png',
         md: '/assets/icons/system/visual-keyboard-32.png',
      },
   },
   {
      id: 'control-panel',
      name: 'Control Panel',
      label: 'Control Panel',
      icons: {
         lg: '/assets/icons/files/control-panel-48.png',
         sm: '/assets/icons/files/control-panel-16.png',
         md: '/assets/icons/files/control-panel-32.png',
      },
   },
   {
      id: 'setup-default-programs',
      name: 'Setup Default Programs',
      label: 'Default Programs',
      icons: {
         lg: '/assets/icons/system/default-program-settings-48.png',
         sm: '/assets/icons/system/default-program-settings-16.png',
         md: '/assets/icons/system/default-program-settings-32.png',
      },
   },
   {
      id: 'printer-and-faxes',
      name: 'Printers and Faxes',
      label: 'Printers and Faxes',
      icons: {
         lg: '/assets/icons/devices/printer-and-faxes-48.png',
         sm: '/assets/icons/devices/printer-and-faxes-16.png',
         md: '/assets/icons/devices/printer-and-faxes-32.png',
      },
   },
   {
      id: 'help-and-support',
      name: 'Help and Support',
      label: 'Help and Support',
      icons: {
         lg: '/assets/icons/ui/help-48.png',
         sm: '/assets/icons/ui/help-16.png',
         md: '/assets/icons/ui/help-32.png',
      },
   },
   {
      id: 'search',
      name: 'Search',
      label: 'Search',
      icons: {
         lg: '/assets/icons/files/search-48.png',
         sm: '/assets/icons/files/search-16.png',
         md: '/assets/icons/files/search-32.png',
      },
   },
   {
      id: 'run',
      name: 'Run',
      label: 'Run',
      icons: {
         lg: '/assets/icons/system/run-48.png',
         sm: '/assets/icons/system/run-16.png',
         md: '/assets/icons/system/run-32.png',
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
         lg: '/assets/icons/ui/help-48.png',
         sm: '/assets/icons/ui/help-16.png',
         md: '/assets/icons/ui/help-32.png',
      },
      windowConfig: {
         defaultSize: { width: 700, height: 500 },
         minSize: { width: 400, height: 300 },
      },
   },
   {
      id: 'minecraft',
      name: 'Minecraft',
      label: 'Classic',
      icons: {
         lg: '/assets/icons/games/minecraft-48.png',
         sm: '/assets/icons/games/minecraft-16.png',
         md: '/assets/icons/games/minecraft-32.png',
      },
      windowConfig: {
         defaultSize: { width: 960, height: 700 },
         minSize: { width: 640, height: 480 },
         singleInstance: true,
      },
   },
   {
      id: 'network-and-internet',
      name: 'Network and Internet',
      label: 'Network and Internet',
      icons: {
         lg: '/assets/icons/network/internet-network-48.png',
         sm: '/assets/icons/network/internet-network-16.png',
         md: '/assets/icons/network/internet-network-32.png',
      },
   },
   {
      id: 'administration-tools',
      name: 'Administration Tools',
      label: 'Administration Tools',
      icons: {
         lg: '/assets/icons/system/adminitration-tools-48.png',
         sm: '/assets/icons/system/adminitration-tools-16.png',
         md: '/assets/icons/system/adminitration-tools-32.png',
      },
   },
   {
      id: 'scanners-and-cameras',
      name: 'Scanners and Cameras',
      label: 'Scanners and Cameras',
      icons: {
         lg: '/assets/icons/devices/scanners-and-cameras-48.png',
         sm: '/assets/icons/devices/scanners-and-cameras-16.png',
         md: '/assets/icons/devices/scanners-and-cameras-32.png',
      },
   },
   {
      id: 'scheduled-tasks',
      name: 'Scheduled Tasks',
      label: 'Scheduled Tasks',
      icons: {
         lg: '/assets/icons/files/scheduled-tasks-48.png',
         sm: '/assets/icons/files/scheduled-tasks-16.png',
         md: '/assets/icons/files/scheduled-tasks-32.png',
      },
   },
   {
      id: 'paint',
      name: 'Paint',
      label: 'Paint',
      icons: {
         lg: '/assets/icons/system/paint-48.png',
         sm: '/assets/icons/system/paint-16.png',
         md: '/assets/icons/system/paint-32.png',
      },
      windowConfig: {
         defaultSize: { width: 800, height: 600 },
         minSize: { width: 400, height: 300 },
         isLoading: true,
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
      id: 'desktop',
      name: 'Desktop',
      icons: {
         lg: '/assets/icons/files/desktop-32.png',
         sm: '/assets/icons/files/desktop-16.png',
         xl: '/assets/icons/files/desktop-48.png',
      },
   },
   {
      id: 'this-computer',
      name: 'This Computer',
      icons: {
         lg: '/assets/icons/files/this-computer-32.png',
         sm: '/assets/icons/files/this-computer-16.png',
         md: '/assets/icons/files/this-computer-24.png',
         xl: '/assets/icons/files/this-computer-48.png',
      },
   },
   {
      id: 'my-documents',
      name: 'Documents',
      icons: {
         lg: '/assets/icons/files/my-documents-32.png',
         sm: '/assets/icons/files/my-documents-16.png',
         md: '/assets/icons/files/my-documents-24.png',
         xl: '/assets/icons/files/my-documents-48.png',
      },
   },
   {
      id: 'shared-documents',
      name: 'Shared Documents',
      icons: {
         lg: '/assets/icons/files/shared-document-folder-32.png',
         sm: '/assets/icons/files/shared-document-folder-16.png',
         xl: '/assets/icons/files/shared-document-folder-48.png',
      },
   },
   {
      id: 'user-documents',
      name: 'Vinicius Documents',
      icons: {
         lg: '/assets/icons/files/my-documents-32.png',
         sm: '/assets/icons/files/my-documents-16.png',
         md: '/assets/icons/files/my-documents-24.png',
         xl: '/assets/icons/files/my-documents-48.png',
      },
   },
   {
      id: 'local-drive-c',
      name: 'Local Drive (C:)',
      icons: {
         lg: '/assets/icons/devices/disk-drive-32.png',
         sm: '/assets/icons/devices/disk-drive-16.png',
         xl: '/assets/icons/devices/disk-drive-48.png',
      },
   },
   {
      id: 'cd-drive-d',
      name: 'CD Drive (D:)',
      icons: {
         lg: '/assets/icons/devices/cd-rom-32.png',
         sm: '/assets/icons/devices/cd-rom-16.png',
         xl: '/assets/icons/devices/cd-rom-48.png',
      },
   },
   {
      id: 'network-favorites',
      name: 'Network Favorites',
      icons: {
         lg: '/assets/icons/network/network-favorites-32.png',
         sm: '/assets/icons/network/network-favorites-16.png',
         md: '/assets/icons/network/network-favorites-24.png',
         xl: '/assets/icons/network/network-favorites-48.png',
      },
   },
   {
      id: 'my-computer',
      name: 'Computer',
      icons: {
         lg: '/assets/icons/files/this-computer-32.png',
         sm: '/assets/icons/files/this-computer-16.png',
         md: '/assets/icons/files/this-computer-24.png',
         xl: '/assets/icons/files/this-computer-48.png',
      },
   },
   {
      id: 'recycle-bin',
      name: 'Recycle Bin',
      icons: {
         lg: '/assets/icons/files/recycle-bin-full-32.png',
         sm: '/assets/icons/files/recycle-bin-full-16.png',
         xl: '/assets/icons/files/recycle-bin-full-48.png',
      },
   },
   {
      id: 'my-music',
      name: 'Music',
      icons: {
         lg: '/assets/icons/files/my-music-32.png',
         sm: '/assets/icons/files/my-music-16.png',
         md: '/assets/icons/files/my-music-24.png',
         xl: '/assets/icons/files/my-music-48.png',
      },
   },
   {
      id: 'my-pictures',
      name: 'Pictures',
      icons: {
         lg: '/assets/icons/files/my-pictures-32.png',
         sm: '/assets/icons/files/my-pictures-16.png',
         md: '/assets/icons/files/my-pictures-24.png',
         xl: '/assets/icons/files/my-pictures-48.png',
      },
   },
   {
      id: 'my-videos',
      name: 'Videos',
      icons: {
         lg: '/assets/icons/files/my-videos-32.png',
         sm: '/assets/icons/files/my-videos-16.png',
         md: '/assets/icons/files/my-videos-24.png',
         xl: '/assets/icons/files/my-videos-48.png',
      },
   },
   {
      id: 'my-recent-documents',
      name: 'Recent Documents',
      icons: {
         lg: '/assets/icons/files/file-history-32.png',
         sm: '/assets/icons/files/file-history-16.png',
         md: '/assets/icons/files/file-history-24.png',
         xl: '/assets/icons/files/file-history-48.png',
      },
   },
];
