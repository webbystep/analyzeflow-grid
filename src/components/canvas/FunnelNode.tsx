import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isHovered, setIsHovered] = useState(false);
  
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      {/* All handles - visible only on hover */}
      <AnimatePresence>
        {isHovered && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)' }}
            >
              <Handle 
                id="top"
                type="source" 
                position={Position.Top} 
                className="w-4 h-4 !bg-primary transition-all duration-200 opacity-60 hover:opacity-100 hover:shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)]"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }}
            >
              <Handle 
                id="bottom"
                type="source" 
                position={Position.Bottom} 
                className="w-4 h-4 !bg-primary transition-all duration-200 opacity-60 hover:opacity-100 hover:shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)]"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <Handle 
                id="left"
                type="source" 
                position={Position.Left} 
                className="w-4 h-4 !bg-primary transition-all duration-200 opacity-60 hover:opacity-100 hover:shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)]"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <Handle 
                id="right"
                type="source" 
                position={Position.Right} 
                className="w-4 h-4 !bg-primary transition-all duration-200 opacity-60 hover:opacity-100 hover:shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)]"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
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
    </motion.div>
  );
});

FunnelNode.displayName = 'FunnelNode';
