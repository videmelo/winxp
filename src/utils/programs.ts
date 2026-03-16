import type React from 'react';
import ComponentPreview from '../components/programs/component-preview/ComponentPreview';
import ControlPanel from '../components/programs/control-panel/ControlPanel';
import Minecraft from '../components/programs/minecraft/Minecraft';
import {
   programsMetadata,
   folders as foldersMetadata,
   type ProgramMetadata,
   type Folder as FolderMetadata,
   type WindowConfig,
   type TitleBarButton,
} from '../constants/program-data';

export type { TitleBarButton, WindowConfig };

export type Program = ProgramMetadata & {
   exe?: React.FC;
};

export type Folder = FolderMetadata;

export const programs: Program[] = programsMetadata.map((p) => {
   if (p.id === 'control-panel') {
      return { ...p, exe: ControlPanel };
   }
   if (p.id === 'component-preview') {
      return { ...p, exe: ComponentPreview };
   }
   if (p.id === 'minecraft') {
      return { ...p, exe: Minecraft };
   }
   return p;
});

export const folders: Folder[] = foldersMetadata;
