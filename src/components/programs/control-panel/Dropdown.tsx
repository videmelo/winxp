import { useEffect, useMemo, useRef, useState } from 'react';
import ProgramIcon from '../../ui/ProgramIcon';
import { SYSTEM_TREE, type SystemTreeNode } from '../../../constants/system-tree';
import DropdownTree, { type AddressNode } from './DropdownTree';

const DEFAULT_EXPANDED = new Set(['desktop-tree-root', 'my-computer-tree', 'control-panel-tree']);
const DEFAULT_SELECTED_NODE = 'control-panel-tree';

function resolveTree(nodes: SystemTreeNode[]): AddressNode[] {
   return nodes.map((node) => {
      return {
         id: node.id,
         label: node.label,
         iconId: node.iconId,
         iconPath: node.iconPath,
         children: node.children ? resolveTree(node.children) : undefined,
      };
   });
}

function findNodeById(nodes: AddressNode[], id: string): AddressNode | null {
   for (const node of nodes) {
      if (node.id === id) {
         return node;
      }

      if (node.children?.length) {
         const child = findNodeById(node.children, id);
         if (child) return child;
      }
   }

   return null;
}

export default function Dropdown() {
   const rootRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const [isOpen, setIsOpen] = useState(false);
   const [selectedId, setSelectedId] = useState(DEFAULT_SELECTED_NODE);
   const [hoveredId, setHoveredId] = useState(DEFAULT_SELECTED_NODE);
   const [expanded, setExpanded] = useState<Set<string>>(DEFAULT_EXPANDED);

   const resolvedTree = useMemo(() => resolveTree(SYSTEM_TREE), []);
   const selectedNode = useMemo(() => findNodeById(resolvedTree, selectedId), [resolvedTree, selectedId]);
   const selectedLabel = selectedNode?.label ?? 'Desktop';
   const [addressValue, setAddressValue] = useState(selectedLabel);

   useEffect(() => {
      if (!isOpen) return;

      inputRef.current?.focus();
      inputRef.current?.select();

      function handlePointerDown(event: PointerEvent) {
         if (!rootRef.current?.contains(event.target as Node)) {
            setIsOpen(false);
         }
      }

      window.addEventListener('pointerdown', handlePointerDown);
      return () => window.removeEventListener('pointerdown', handlePointerDown);
   }, [isOpen]);

   function toggleExpanded(nodeId: string) {
      setExpanded((current) => {
         const next = new Set(current);
         if (next.has(nodeId)) {
            next.delete(nodeId);
         } else {
            next.add(nodeId);
         }
         return next;
      });
   }

   function handleSelectNode(node: AddressNode, hasChildren: boolean) {
      setSelectedId(node.id);
      setAddressValue(node.label);

      if (hasChildren) {
         toggleExpanded(node.id);
         return;
      }

      setIsOpen(false);
   }

   return (
      <div
         ref={rootRef}
         className="relative self-stretch w-full bg-white border h-5.5 border-slate-400 inline-flex justify-start items-center overflow-visible"
      >
         <div
            className={`flex-1 m-px inline-flex justify-start items-center text-left ${isOpen ? 'bg-bg-selection' : ''}`}
            onClick={() => {
               setAddressValue(selectedLabel);
               setIsOpen(true);
            }}
         >
            <span className="self-stretch p-px inline-flex justify-start items-center gap-1 w-full">
               {selectedNode?.iconId ? <ProgramIcon id={selectedNode.iconId} size="sm" /> : null}
               {!selectedNode?.iconId && selectedNode?.iconPath ? (
                  <img src={selectedNode.iconPath} alt={selectedNode.label} className="size-4 pixelated" />
               ) : null}
               <input
                  ref={inputRef}
                  value={isOpen ? addressValue : selectedLabel}
                  onChange={(event) => setAddressValue(event.target.value)}
                  onFocus={() => {
                     setAddressValue(selectedLabel);
                     setIsOpen(true);
                  }}
                  readOnly={!isOpen}
                  className={`label-tahoma w-full bg-transparent border-none outline-none ${isOpen ? 'text-white' : 'text-black'}`}
               />
            </span>
         </div>

         <button
            type="button"
            aria-label="Toggle address dropdown"
            className={`ui-dropdownmenu-switch-btn ${isOpen ? 'ui-dropdownmenu-switch-btn--up' : ''}`}
            onClick={() => {
               setIsOpen((current) => {
                  const nextIsOpen = !current;
                  if (nextIsOpen) {
                     setAddressValue(selectedLabel);
                  }
                  return nextIsOpen;
               });
            }}
         />

         {isOpen && (
            <div className="ui-address-dropdown">
               <DropdownTree
                  nodes={resolvedTree}
                  expanded={expanded}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                  onToggleExpanded={toggleExpanded}
                  onSelectNode={handleSelectNode}
               />
            </div>
         )}
      </div>
   );
}
