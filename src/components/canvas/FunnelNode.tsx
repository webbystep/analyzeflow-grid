import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  TrendingUp,
  Mail,
  FileText,
  ShoppingCart,
  PartyPopper,
  GitBranch,
} from 'lucide-react';

interface FunnelNodeData {
  label: string;
  icon?: string;
  color?: string;
  visits?: number;
  conversionRate?: number;
  conversions?: number;
  revenue?: number;
  averageOrderValue?: number;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

const nodeIcons = {
  traffic: TrendingUp,
  email: Mail,
  landing: FileText,
  checkout: ShoppingCart,
  thankyou: PartyPopper,
  condition: GitBranch,
};

export const FunnelNode = memo(({ data, type }: { data: FunnelNodeData; type?: string }) => {
  const Icon = nodeIcons[type as keyof typeof nodeIcons] || FileText;
  const nodeType = type as keyof typeof nodeIcons;
  
  return (
    <div 
      className="px-4 py-3 rounded-lg border-2 bg-card shadow-lg min-w-[180px] transition-all hover:shadow-xl"
      style={{
        borderColor: `hsl(var(--node-${nodeType}))`,
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-1.5 rounded"
          style={{ backgroundColor: `hsl(var(--node-${nodeType}) / 0.2)` }}
        >
          <Icon className="w-4 h-4" style={{ color: `hsl(var(--node-${nodeType}))` }} />
        </div>
        <div className="font-semibold text-sm">{data.label}</div>
      </div>
      
      {(data.visits !== undefined || data.conversionRate !== undefined) && (
        <div className="space-y-1 text-xs">
          {data.visits !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visits:</span>
              <span className="font-medium">{data.visits.toLocaleString()}</span>
            </div>
          )}
          {data.conversionRate !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">CR:</span>
              <span className="font-medium">{data.conversionRate}%</span>
            </div>
          )}
          {data.conversions !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conv:</span>
              <span className="font-medium">{data.conversions.toLocaleString()}</span>
            </div>
          )}
          {data.revenue !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium">${data.revenue.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

FunnelNode.displayName = 'FunnelNode';
