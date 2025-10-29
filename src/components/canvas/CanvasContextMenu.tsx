import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Eraser, Maximize2, LayoutGrid } from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onClearCanvas: () => void;
  onFitView: () => void;
  onAutoLayout: () => void;
  hasNodes: boolean;
}

export function CanvasContextMenu({
  children,
  onClearCanvas,
  onFitView,
  onAutoLayout,
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
            <ContextMenuItem onClick={onAutoLayout}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Rendezés
            </ContextMenuItem>
            <ContextMenuItem onClick={onFitView}>
              <Maximize2 className="mr-2 h-4 w-4" />
              Összes node illesztése
            </ContextMenuItem>
            <ContextMenuItem onClick={onClearCanvas} className="text-destructive focus:text-destructive">
              <Eraser className="mr-2 h-4 w-4" />
              Canvas törlése
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
