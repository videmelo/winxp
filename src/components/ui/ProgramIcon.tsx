import { programsMetadata, folders, type ProgramMetadata, type Folder } from '../../constants/program-data';

type IconSize = 'sm' | 'md' | 'lg' | 'xl';

type ProgramIconProps = {
   id: string;
   size: IconSize;
   className?: string;
};

const sizeClasses: Record<IconSize, string> = {
   sm: 'size-4',
   md: 'size-6',
   lg: 'size-8',
   xl: 'size-12',
};

const items = new Map<string, ProgramMetadata | Folder>(
   [...programsMetadata, ...folders].map((item) => [item.id, item])
);

function ProgramIcon({ id, size, className = '' }: ProgramIconProps) {
   const item = items.get(id);
   if (!item) return null;

   const icon = item.icons[size as keyof typeof item.icons];
   if (!icon) return null;

   return <img src={icon} alt={item.name} className={`pixelated ${sizeClasses[size]} ${className}`} />;
}

export default ProgramIcon;
