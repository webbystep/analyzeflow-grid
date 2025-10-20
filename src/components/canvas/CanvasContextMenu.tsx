import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Plus, AlignHorizontalSpaceAround, Eraser, Camera, AlignLeft, AlignRight, AlignCenter } from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onAddNode: (type: string) => void;
  onAlignNodes: (direction: 'left' | 'right' | 'center' | 'vertical') => void;
  onClearCanvas: () => void;
  onTakeScreenshot: () => void;
  hasNodes: boolean;
}

export function CanvasContextMenu({
  children,
  onAddNode,
  onAlignNodes,
  onClearCanvas,
  onTakeScreenshot,
  hasNodes,
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => onAddNode('traffic')}>
              Traffic Source
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddNode('email')}>
              Email Campaign
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddNode('landing')}>
              Landing Page
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddNode('checkout')}>
              Checkout
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddNode('thankyou')}>
              Thank You Page
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddNode('condition')}>
              Condition
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        {hasNodes && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <AlignHorizontalSpaceAround className="mr-2 h-4 w-4" />
                Align Nodes
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={() => onAlignNodes('left')}>
                  <AlignLeft className="mr-2 h-4 w-4" />
                  Align Left
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlignNodes('center')}>
                  <AlignCenter className="mr-2 h-4 w-4" />
                  Align Center
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlignNodes('right')}>
                  <AlignRight className="mr-2 h-4 w-4" />
                  Align Right
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem onClick={onTakeScreenshot}>
              <Camera className="mr-2 h-4 w-4" />
              Take Screenshot
            </ContextMenuItem>
            <ContextMenuSeparator />
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
