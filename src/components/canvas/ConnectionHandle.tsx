import { Plus } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

export function ConnectionHandle() {
  return (
    <Handle
      type="source"
      position={Position.Right}
      className="!static !inline-flex !items-center !justify-center shrink-0 !w-5 !h-5 !bg-background !border-2 !border-white !rounded-full !shadow-lg hover:!shadow-xl hover:!bg-background transition-all duration-200 cursor-crosshair !top-auto !right-auto !bottom-auto !left-auto !transform-none"
    >
      <Plus className="w-3.5 h-3.5 text-foreground pointer-events-none" />
    </Handle>
  );
}
