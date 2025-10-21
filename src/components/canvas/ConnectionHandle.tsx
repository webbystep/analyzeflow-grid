import { Plus } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

export function ConnectionHandle() {
  return (
    <div
      className="absolute top-1 right-1 z-50"
      style={{
        width: '32px',
        height: '32px',
      }}
    >
      <Handle
        type="source"
        position={Position.Right}
        className="!w-7 !h-7 !bg-primary !border-[3px] !border-white !rounded-full !shadow-xl hover:!shadow-2xl hover:!bg-primary/90 transition-all duration-200 cursor-crosshair"
      >
        <Plus className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </Handle>
    </div>
  );
}
