import { Node } from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Trash2, Copy, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from 'lucide-react';

interface NodeContextMenuProps {
  children: React.ReactNode;
  node: Node | null;
  selectedNodes?: Node[];
  onDelete: () => void;
  onDuplicate: () => void;
  onAlign?: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export function NodeContextMenu({
  children,
  node,
  selectedNodes = [],
  onDelete,
  onDuplicate,
  onAlign,
}: NodeContextMenuProps) {
  if (!node) {
    return <>{children}</>;
  }

  const nodeCount = selectedNodes.length > 0 ? selectedNodes.length : 1;
  const isMultiSelect = nodeCount > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          {isMultiSelect ? `Kijelöltek másolása (${nodeCount} db)` : 'Másolás'}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {isMultiSelect ? `Kijelöltek törlése (${nodeCount} db)` : 'Törlés'}
        </ContextMenuItem>
        
        {isMultiSelect && onAlign && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <AlignHorizontalJustifyCenter className="mr-2 h-4 w-4" />
                Igazítás
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={() => onAlign('left')}>
                  <AlignHorizontalJustifyStart className="mr-2 h-4 w-4" />
                  Balra
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlign('center')}>
                  <AlignHorizontalJustifyCenter className="mr-2 h-4 w-4" />
                  Középre
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlign('right')}>
                  <AlignHorizontalJustifyEnd className="mr-2 h-4 w-4" />
                  Jobbra
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onAlign('top')}>
                  <AlignVerticalJustifyStart className="mr-2 h-4 w-4" />
                  Fel
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlign('middle')}>
                  <AlignVerticalJustifyCenter className="mr-2 h-4 w-4" />
                  Közép
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlign('bottom')}>
                  <AlignVerticalJustifyEnd className="mr-2 h-4 w-4" />
                  Le
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
