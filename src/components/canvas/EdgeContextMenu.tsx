import { ReactNode } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Edge } from '@xyflow/react';
import { Plus, Trash2 } from 'lucide-react';

interface EdgeContextMenuProps {
  children: ReactNode;
  edge: Edge;
  onInsertNode: (edgeId: string, position: { x: number; y: number }) => void;
  onDeleteEdge: (edgeId: string) => void;
  labelPosition: { x: number; y: number };
}

export function EdgeContextMenu({
  children,
  edge,
  onInsertNode,
  onDeleteEdge,
  labelPosition,
}: EdgeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onInsertNode(edge.id, labelPosition)}>
          <Plus className="h-4 w-4 mr-2" />
          Insert Node Here
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onDeleteEdge(edge.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Edge
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
