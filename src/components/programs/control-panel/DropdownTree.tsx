import ProgramIcon from '../../ui/ProgramIcon';

export type AddressNode = {
   id: string;
   label: string;
   iconId?: string;
   iconPath?: string;
   children?: AddressNode[];
};

type VisibleNode = {
   key: string;
   node: AddressNode;
   level: number;
};

type DropdownTreeProps = {
   nodes: AddressNode[];
   expanded: Set<string>;
   hoveredId: string;
   onHover: (nodeId: string) => void;
   onToggleExpanded: (nodeId: string) => void;
   onSelectNode: (node: AddressNode, hasChildren: boolean) => void;
};

function flattenTree(nodes: AddressNode[], expanded: Set<string>, level = 0, parentKey = 'root'): VisibleNode[] {
   const visibleNodes: VisibleNode[] = [];

   for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      const key = `${parentKey}/${node.id}-${index}`;

      visibleNodes.push({ key, node, level });

      if (node.children?.length && expanded.has(node.id)) {
         visibleNodes.push(...flattenTree(node.children, expanded, level + 1, key));
      }
   }

   return visibleNodes;
}

export default function DropdownTree({
   nodes,
   expanded,
   hoveredId,
   onHover,
   onToggleExpanded,
   onSelectNode,
}: DropdownTreeProps) {
   const visibleNodes = flattenTree(nodes, expanded);

   return (
      <>
         {visibleNodes.map(({ key, node, level }) => {
            const isExpanded = expanded.has(node.id);
            const hasChildren = Boolean(node.children?.length);
            const isHovered = hoveredId === node.id;

            return (
               <button
                  key={key}
                  type="button"
                  className={`ui-address-dropdown-item ${isHovered ? 'is-hovered' : ''}`}
                  style={{ paddingLeft: `${level * 10 + 4}px` }}
                  onMouseEnter={() => onHover(node.id)}
                  onClick={() => onSelectNode(node, hasChildren)}
               >
                  {hasChildren ? (
                     <span
                        role="button"
                        aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
                        data-mode={isExpanded ? 'collapse' : 'expand'}
                        className="ui-tree-btn"
                        onClick={(event) => {
                           event.stopPropagation();
                           onToggleExpanded(node.id);
                        }}
                     >
                        <span className="ui-tree-btn-icon" />
                     </span>
                  ) : (
                     <span className="ui-address-dropdown-spacer" />
                  )}

                  {node.iconId ? <ProgramIcon id={node.iconId} size="sm" /> : null}
                  {!node.iconId && node.iconPath ? (
                     <img src={node.iconPath} alt={node.label} className="size-4 pixelated" draggable={false} />
                  ) : null}
                  <span className="label-tahoma truncate">{node.label}</span>
               </button>
            );
         })}
      </>
   );
}
