import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Eraser } from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onClearCanvas: () => void;
  hasNodes: boolean;
}

export function CanvasContextMenu({
  children,
  onClearCanvas,
  hasNodes,
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {hasNodes && (
          <ContextMenuItem onClick={onClearCanvas} className="text-destructive focus:text-destructive">
            <Eraser className="mr-2 h-4 w-4" />
            Clear Canvas
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
