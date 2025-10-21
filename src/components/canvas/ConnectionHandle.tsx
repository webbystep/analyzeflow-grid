import { Plus } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

export function ConnectionHandle() {
  return (
    <Handle
      type="source"
      position={Position.Right}
      className="!relative !w-5 !h-5 !bg-background !border-2 !border-white !rounded-full !shadow-lg hover:!shadow-xl hover:!bg-background transition-all duration-200 cursor-crosshair"
    >
      <Plus className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </Handle>
  );
}
