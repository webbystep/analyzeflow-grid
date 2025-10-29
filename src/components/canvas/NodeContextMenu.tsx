import { Node } from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Trash2, Copy } from 'lucide-react';

interface NodeContextMenuProps {
  children: React.ReactNode;
  node: Node | null;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function NodeContextMenu({
  children,
  node,
  onDelete,
  onDuplicate,
}: NodeContextMenuProps) {
  if (!node) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplikálás
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Törlés
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
