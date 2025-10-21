import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter, AlignLeft, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyEnd } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SelectionToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onDuplicate: () => void;
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export function SelectionToolbar({
  selectedCount,
  onDelete,
  onDuplicate,
  onAlign,
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-card border shadow-lg rounded-lg px-3 py-2 flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2">
          {selectedCount} node{selectedCount > 1 ? 's' : ''} selected
        </span>
        
        <div className="h-5 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          className="h-8"
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <AlignHorizontalJustifyCenter className="h-4 w-4 mr-2" />
              Align
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => onAlign('left')}>
              <AlignLeft className="h-4 w-4 mr-2" />
              Align Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('center')}>
              <AlignHorizontalJustifyCenter className="h-4 w-4 mr-2" />
              Align Center (Horizontal)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('right')}>
              <AlignRight className="h-4 w-4 mr-2" />
              Align Right
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('top')}>
              <AlignVerticalJustifyStart className="h-4 w-4 mr-2" />
              Align Top
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('middle')}>
              <AlignVerticalJustifyCenter className="h-4 w-4 mr-2" />
              Align Middle (Vertical)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('bottom')}>
              <AlignVerticalJustifyEnd className="h-4 w-4 mr-2" />
              Align Bottom
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-5 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
