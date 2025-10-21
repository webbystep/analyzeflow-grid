import { Plus } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

export function ConnectionHandle() {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 right-4 z-50"
      style={{
        width: '24px',
        height: '24px',
      }}
    >
      <Handle
        type="source"
        position={Position.Right}
        className="!w-5 !h-5 !bg-primary !border-2 !border-white !rounded-full !shadow-lg hover:!shadow-xl hover:!bg-primary/90 transition-all duration-200 cursor-crosshair"
      >
        <Plus className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </Handle>
    </div>
  );
}
