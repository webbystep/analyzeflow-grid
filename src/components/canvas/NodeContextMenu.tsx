import { Node } from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Edit, Palette, Trash2, BarChart3 } from 'lucide-react';

interface NodeContextMenuProps {
  children: React.ReactNode;
  node: Node | null;
  onEdit: () => void;
  onDuplicate: () => void;
  onChangeColor: () => void;
  onDelete: () => void;
  onViewMetrics: () => void;
}

export function NodeContextMenu({
  children,
  node,
  onEdit,
  onDuplicate,
  onChangeColor,
  onDelete,
  onViewMetrics,
}: NodeContextMenuProps) {
  if (!node) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Node
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={onChangeColor}>
          <Palette className="mr-2 h-4 w-4" />
          Change Color
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onViewMetrics}>
          <BarChart3 className="mr-2 h-4 w-4" />
          View Metrics
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
