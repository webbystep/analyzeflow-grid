import { Node } from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Trash2 } from 'lucide-react';

interface NodeContextMenuProps {
  children: React.ReactNode;
  node: Node | null;
  onDelete: () => void;
}

export function NodeContextMenu({
  children,
  node,
  onDelete,
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
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Node törlése
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
