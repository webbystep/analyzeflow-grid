import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Eraser, Maximize2 } from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onClearCanvas: () => void;
  onFitView: () => void;
  hasNodes: boolean;
}

export function CanvasContextMenu({
  children,
  onClearCanvas,
  onFitView,
  hasNodes,
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {hasNodes && (
          <>
            <ContextMenuItem onClick={onFitView}>
              <Maximize2 className="mr-2 h-4 w-4" />
              Fit All Nodes
            </ContextMenuItem>
            <ContextMenuItem onClick={onClearCanvas} className="text-destructive focus:text-destructive">
              <Eraser className="mr-2 h-4 w-4" />
              Clear Canvas
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
