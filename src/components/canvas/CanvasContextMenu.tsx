import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { Eraser, Maximize2, LayoutGrid, ArrowDownUp, ArrowLeftRight, Grid3x3, Circle } from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onClearCanvas: () => void;
  onFitView: () => void;
  onAutoLayout: () => void;
  onDagreLayoutTB: () => void;
  onDagreLayoutLR: () => void;
  onGridLayout: () => void;
  onCircularLayout: () => void;
  hasNodes: boolean;
}

export function CanvasContextMenu({
  children,
  onClearCanvas,
  onFitView,
  onAutoLayout,
  onDagreLayoutTB,
  onDagreLayoutLR,
  onGridLayout,
  onCircularLayout,
  hasNodes,
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {hasNodes && (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Rendezés
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-52">
                <ContextMenuItem onClick={onAutoLayout}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Hierarchikus
                </ContextMenuItem>
                <ContextMenuItem onClick={onDagreLayoutTB}>
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  Dagre - Függőleges
                </ContextMenuItem>
                <ContextMenuItem onClick={onDagreLayoutLR}>
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Dagre - Vízszintes
                </ContextMenuItem>
                <ContextMenuItem onClick={onGridLayout}>
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  Rács elrendezés
                </ContextMenuItem>
                <ContextMenuItem onClick={onCircularLayout}>
                  <Circle className="mr-2 h-4 w-4" />
                  Kör alakú
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
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
