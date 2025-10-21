import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Mail,
  FileText,
  ShoppingCart,
  PartyPopper,
  GitBranch,
} from 'lucide-react';
import { MetricsFlowIndicator } from './MetricsFlowIndicator';

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

export const FunnelNode = memo(({ data, type, selected }: { data: FunnelNodeData; type?: string; selected?: boolean }) => {
  const Icon = nodeIcons[type as keyof typeof nodeIcons] || FileText;
  const nodeType = type as keyof typeof nodeIcons;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: selected ? 1.02 : 1, 
        opacity: 1 
      }}
      transition={{ 
        duration: 0.15, 
        ease: 'easeOut',
      }}
      className={`px-4 py-3 rounded-lg bg-card shadow-lg min-w-[180px] transition-all hover:shadow-xl ${
        selected ? 'border-[3px] shadow-2xl' : 'border-2'
      }`}
      style={{
        borderColor: selected ? `hsl(var(--primary))` : `hsl(var(--node-${nodeType}))`,
        boxShadow: selected 
          ? `0 10px 40px -10px hsl(var(--primary) / 0.4), 0 0 0 3px hsl(var(--primary) / 0.1)` 
          : undefined,
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 !bg-primary hover:scale-150 transition-transform duration-200 ease-out"
        style={{ transformOrigin: 'center' }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-primary hover:scale-150 transition-transform duration-200 ease-out"
        style={{ transformOrigin: 'center' }}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-1.5 rounded"
          style={{ backgroundColor: `hsl(var(--node-${nodeType}) / 0.2)` }}
        >
          <Icon className="w-4 h-4" style={{ color: `hsl(var(--node-${nodeType}))` }} />
        </div>
        <div className="font-semibold text-sm">{data.label}</div>
      </div>
      
      <MetricsFlowIndicator
        visits={data.visits}
        conversions={data.conversions}
        revenue={data.revenue}
        conversionRate={data.conversionRate}
      />
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 !bg-primary hover:scale-150 transition-transform duration-200 ease-out"
        style={{ transformOrigin: 'center' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-primary hover:scale-150 transition-transform duration-200 ease-out"
        style={{ transformOrigin: 'center' }}
      />
    </motion.div>
  );
});

FunnelNode.displayName = 'FunnelNode';
