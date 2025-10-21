import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, FileText, ShoppingCart, PartyPopper, GitBranch } from 'lucide-react';
import { MetricsFlowIndicator } from './MetricsFlowIndicator';
import { ConnectionHandle } from './ConnectionHandle';
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
  condition: GitBranch
};
export const FunnelNode = memo(({
  data,
  type,
  selected,
  id
}: {
  data: FunnelNodeData;
  type?: string;
  selected?: boolean;
  id: string;
}) => {
  const Icon = nodeIcons[type as keyof typeof nodeIcons] || FileText;
  const nodeType = type as keyof typeof nodeIcons;
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const isConnectedHighlighted = (data as any).isConnectedHighlighted || false;
  return <motion.div initial={{
    scale: 0.8,
    opacity: 0
  }} animate={{
    scale: selected ? 1.02 : 1,
    opacity: 1
  }} transition={{
    duration: 0.15,
    ease: 'easeOut'
  }} onMouseEnter={() => {
    setIsHovered(true);
    (data as any).onNodeHover?.(id);
  }} onMouseLeave={() => {
    setIsHovered(false);
    (data as any).onNodeHover?.(null);
  }} className={`rounded-lg bg-card shadow-lg min-w-[180px] transition-all hover:shadow-xl overflow-visible relative z-10 ${selected ? 'border-[3px] shadow-2xl' : 'border-2'}`} style={{
    borderColor: selected ? `hsl(var(--primary))` : isConnectedHighlighted ? `hsl(var(--primary) / 0.5)` : `hsl(var(--node-${nodeType}))`,
    boxShadow: selected ? `0 10px 40px -10px hsl(var(--primary) / 0.4), 0 0 0 3px hsl(var(--primary) / 0.1)` : isConnectedHighlighted ? `0 10px 30px -10px hsl(var(--primary) / 0.6), 0 0 0 2px hsl(var(--primary) / 0.3)` : `0 2px 4px rgba(0,0,0,0.1)`
  }}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-transparent !border-0" style={{
      opacity: 0,
      pointerEvents: 'auto'
    }} />
      <Handle type="target" position={Position.Bottom} className="!w-3 !h-3 !bg-transparent !border-0" style={{
      opacity: 0,
      pointerEvents: 'auto'
    }} />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-transparent !border-0" style={{
      opacity: 0,
      pointerEvents: 'auto'
    }} />
      <Handle type="target" position={Position.Right} className="!w-3 !h-3 !bg-transparent !border-0" style={{
      opacity: 0,
      pointerEvents: 'auto'
    }} />
      
      {/* Colored header bar */}
      <div className="relative flex items-center justify-between px-3 py-2 rounded-t-md" style={{
      backgroundColor: `hsl(var(--node-${nodeType}))`,
      color: 'white'
    }}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {isEditing ? <input type="text" value={label} onChange={e => setLabel(e.target.value)} onBlur={() => {
        setIsEditing(false);
        if (label.trim() && label !== data.label) {
          (data as any).onLabelChange?.(id, label.trim());
        } else {
          setLabel(data.label);
        }
      }} onKeyDown={e => {
        if (e.key === 'Enter') {
          setIsEditing(false);
          if (label.trim() && label !== data.label) {
            (data as any).onLabelChange?.(id, label.trim());
          }
        } else if (e.key === 'Escape') {
          setLabel(data.label);
          setIsEditing(false);
        }
      }} className="nodrag font-semibold text-sm bg-transparent border-none outline-none focus:ring-0 text-white w-full" autoFocus /> : <div className="font-semibold text-sm cursor-text" onClick={() => setIsEditing(true)}>
            {data.label}
          </div>}
        </div>
        <ConnectionHandle />
      </div>
      
      {/* Metrics section */}
      <div className="px-3 py-2">
      
        <MetricsFlowIndicator visits={data.visits} conversions={data.conversions} revenue={data.revenue} conversionRate={data.conversionRate} />
      </div>
    </motion.div>;
});
FunnelNode.displayName = 'FunnelNode';