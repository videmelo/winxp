import type React from 'react';
import ComponentPreview from '../components/programs/component-preview/ComponentPreview';
import ControlPanel from '../components/programs/control-panel/ControlPanel';
import Minecraft from '../components/programs/minecraft/Minecraft';
import Paint from '../components/programs/paint/Paint';
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
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   exe?: React.ComponentType<any>;
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
   if (p.id === 'paint') {
      return { ...p, exe: Paint };
   }
   return p;
});

export const folders: Folder[] = foldersMetadata;
