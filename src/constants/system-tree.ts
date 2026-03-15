import { folders, programsMetadata } from './program-data';

export type SystemTreeNodeType = 'desktop' | 'group' | 'folder' | 'program' | 'drive' | 'file';

export type SystemTreeNode = {
   id: string;
   label: string;
   type: SystemTreeNodeType;
   iconId?: string;
   iconPath?: string;
   children?: SystemTreeNode[];
};

const metadata = new Map<string, { label: string }>();

for (const program of programsMetadata) {
   metadata.set(program.id, { label: program.name });
}

for (const folder of folders) {
   if (!metadata.has(folder.id)) {
      metadata.set(folder.id, { label: folder.name });
   }
}

function node(
   id: string,
   type: SystemTreeNodeType,
   children?: SystemTreeNode[],
   overrides?: { label?: string; iconId?: string },
): SystemTreeNode {
   return {
      id,
      label: overrides?.label ?? metadata.get(id)?.label ?? id,
      type,
      iconId: overrides?.iconId ?? id,
      children,
   };
}

function file(id: string, label: string, iconPath: string): SystemTreeNode {
   return {
      id,
      label,
      type: 'file',
      iconPath,
   };
}

const userFilesNode = node(
   'user-files',
   'group',
   [
      file('readme-txt', 'Readme.txt', '/assets/icons/files/file-16.png'),
      file('wallpaper-bmp', 'Wallpaper.bmp', '/assets/icons/files/bitmap-file-16.png'),
      file('song-wma', 'Song.wma', '/assets/icons/files/music-file-16.png'),
      file('movie-wmv', 'Movie.wmv', '/assets/icons/files/movie-file-16.png'),
      file('family-photo-jpg', 'FamilyPhoto.jpg', '/assets/icons/files/picture-file-16.png'),
      file('playlist-wpl', 'Favorites.wpl', '/assets/icons/files/playlist-file-16.png'),
   ],
   { label: 'Files', iconId: 'my-documents' },
);

const controlPanelNode = node(
   'control-panel-tree',
   'folder',
   [
      node('network-and-internet', 'program'),
      node('printer-and-faxes', 'program'),
      node('administration-tools', 'program'),
      node('scanners-and-cameras', 'program'),
      node('scheduled-tasks', 'program'),
      node('setup-default-programs', 'program'),
   ],
   { label: 'Control Panel', iconId: 'control-panel' },
);

const allProgramsNode = node(
   'all-programs',
   'group',
   [...programsMetadata].sort((a, b) => a.name.localeCompare(b.name)).map((program) => node(program.id, 'program')),
   { label: 'All Programs', iconId: 'search' },
);

export const SYSTEM_TREE: SystemTreeNode[] = [
   node(
      'desktop-tree-root',
      'desktop',
      [
         node('my-documents', 'folder', [
            node('shared-documents', 'folder'),
            node('user-documents', 'folder'),
            node('my-recent-documents', 'folder'),
            node('my-pictures', 'folder'),
            node('my-music', 'folder'),
            node('my-videos', 'folder'),
            userFilesNode,
         ]),
         node(
            'my-computer-tree',
            'drive',
            [
               node('local-drive-c', 'drive'),
               node('cd-drive-d', 'drive'),
               controlPanelNode,
               node('shared-documents', 'folder'),
               node('network-favorites', 'folder'),
            ],
            { label: 'My Computer', iconId: 'this-computer' },
         ),
         node('recycle-bin', 'folder'),
         allProgramsNode,
      ],
      { label: 'Desktop', iconId: 'desktop' },
   ),
];

export function findSystemTreeNodeById(nodes: SystemTreeNode[], id: string): SystemTreeNode | null {
   for (const node of nodes) {
      if (node.id === id) {
         return node;
      }

      if (node.children?.length) {
         const child = findSystemTreeNodeById(node.children, id);
         if (child) return child;
      }
   }

   return null;
}
