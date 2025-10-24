import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  // Core icons
  TrendingUp, Mail, FileText, ShoppingCart, PartyPopper, GitBranch, Box,
  // Traffic icons
  Facebook, Chrome, Linkedin, Youtube, Share2, BookOpen, Link2, Store,
  // Conversion icons
  ClipboardList, Phone, Headphones, FileOutput, CheckSquare, TrendingUpIcon, Handshake,
  // Retention icons
  RotateCcw, Gift, Zap, RefreshCw, MessageSquare, Users, XCircle,
  // Automation icons
  Webhook, Database, Settings, Sparkles, Upload,
  // Brand icons
  Globe, Video, HeadphonesIcon, Star, MessageCircle
} from 'lucide-react';
import { getNodeDefinition } from '@/lib/nodeDefinitions';
import { MetricsFlowIndicator } from './MetricsFlowIndicator';
import { ConnectionHandle } from './ConnectionHandle';
interface FunnelNodeData {
  label: string;
  customText?: string;
  icon?: string;
  iconColor?: string;
  customIconSvg?: string;
  color?: string;
  visits?: number;
  conversionRate?: number;
  conversions?: number;
  revenue?: number;
  estimatedRevenue?: number;
  averageOrderValue?: number;
  valuePerConversion?: number | { value: number; currency: string };
  revenueMode?: 'direct' | 'assisted' | 'none';
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}
import * as LucideIcons from 'lucide-react';
import { getDefaultIcon } from '@/lib/nodeMetricTemplates';

const nodeIcons: Record<string, any> = {
  'traffic': TrendingUp,
  'landing': FileText,
  'email': Mail,
  'offer': MessageSquare,
  'checkout': ShoppingCart,
  'thank_you': PartyPopper,
  'custom': Box
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
  const nodeType = type as keyof typeof nodeIcons;
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const isConnectedHighlighted = (data as any).isConnectedHighlighted || false;

  // Determine icon to use
  let IconComponent: any;
  if (data.customIconSvg) {
    IconComponent = null; // Will render SVG directly
  } else if (data.icon && (LucideIcons as any)[data.icon]) {
    IconComponent = (LucideIcons as any)[data.icon];
  } else {
    IconComponent = nodeIcons[nodeType] || FileText;
  }

  const iconColor = data.iconColor || 'white';
  const nodeColor = data.color || `var(--node-${nodeType})`;
  
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
  }} className={`rounded-lg shadow-lg w-[200px] transition-all hover:shadow-xl overflow-visible relative z-10 ${selected ? 'border-[3px] shadow-2xl' : 'border-2'}`} style={{
    backgroundColor: selected || isConnectedHighlighted 
      ? 'hsl(var(--card))' 
      : `hsl(${nodeColor} / 0.05)`,
    borderColor: selected 
      ? `hsl(var(--primary))` 
      : isConnectedHighlighted 
      ? `hsl(var(--primary) / 0.5)` 
      : `hsl(${nodeColor})`,
    boxShadow: selected 
      ? `0 10px 40px -10px hsl(var(--primary) / 0.4), 0 0 0 3px hsl(var(--primary) / 0.1)` 
      : isConnectedHighlighted 
      ? `0 10px 30px -10px hsl(var(--primary) / 0.6), 0 0 0 2px hsl(var(--primary) / 0.3)` 
      : `0 2px 4px hsl(${nodeColor} / 0.2)`
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
      backgroundColor: `hsl(${nodeColor})`,
      color: 'white'
    }}>
        <div className="flex items-center gap-2">
          {data.customIconSvg ? (
            <div 
              className="w-4 h-4" 
              dangerouslySetInnerHTML={{ __html: data.customIconSvg }}
            />
          ) : (
            IconComponent && <IconComponent className="w-4 h-4" style={{ color: iconColor }} />
          )}
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
      }} className="nodrag font-semibold text-sm bg-transparent border-none outline-none focus:ring-0 text-white flex-1 min-w-0" autoFocus /> : <div className="font-semibold text-sm cursor-text break-words flex-1 min-w-0" onClick={() => setIsEditing(true)}>
            {data.label}
          </div>}
        </div>
        <ConnectionHandle />
      </div>
      
      {/* Metrics section */}
      <div className="px-3 py-2">
        {data.customText && (
          <div className="mb-2 text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-2 break-words">
            {data.customText}
          </div>
        )}
        {(() => {
          const nodeDef = getNodeDefinition(nodeType as any);
          const shouldShowMetrics = nodeDef?.metricsVisible !== false;
          
          const valuePerConv = typeof data.valuePerConversion === 'object'
            ? data.valuePerConversion.value
            : data.valuePerConversion;
          
          const displayRevenue = data.revenue || data.estimatedRevenue;
          
          return shouldShowMetrics && nodeType !== 'custom' && (
            <MetricsFlowIndicator 
              visits={data.visits} 
              conversions={data.conversions} 
              revenue={displayRevenue}
              conversionRate={data.conversionRate}
              valuePerConversion={valuePerConv}
              revenueMode={data.revenueMode}
            />
          );
        })()}
      </div>
    </motion.div>;
});
FunnelNode.displayName = 'FunnelNode';