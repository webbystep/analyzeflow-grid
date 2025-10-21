import { Plus } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

export function ConnectionHandle() {
  return (
    <div
      className="absolute -top-2 -right-2 z-50"
      style={{
        width: '24px',
        height: '24px',
      }}
    >
      <Handle
        type="source"
        position={Position.Right}
        className="!w-6 !h-6 !bg-primary !border-2 !border-white !rounded-full !shadow-lg hover:!scale-125 hover:!shadow-xl hover:!bg-primary/90 transition-all duration-200 cursor-crosshair"
      >
        <Plus className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </Handle>
    </div>
  );
}
