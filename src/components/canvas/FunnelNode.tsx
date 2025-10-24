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
    scale: 0.95,
    opacity: 0
  }} animate={{
    scale: 1,
    opacity: 1,
    y: isHovered ? -1 : 0
  }} transition={{
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1]
  }} onMouseEnter={() => {
    setIsHovered(true);
    (data as any).onNodeHover?.(id);
  }} onMouseLeave={() => {
    setIsHovered(false);
    (data as any).onNodeHover?.(null);
  }} className={`rounded-lg w-[240px] overflow-hidden relative z-10 transition-all duration-200 border ${selected || isConnectedHighlighted ? 'is-active' : ''}`} style={{
    backgroundColor: 'hsl(var(--color-node-bg))',
    borderColor: selected || isConnectedHighlighted
      ? `hsl(var(--color-accent-green))` 
      : `hsl(var(--color-node-border))`,
    boxShadow: selected || isConnectedHighlighted
      ? `var(--shadow-glow-strong)` 
      : isHovered
      ? `var(--shadow-glow)`
      : 'none',
    willChange: 'transform, box-shadow'
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
      
      {/* Minimalist header */}
      <div className="relative flex items-center justify-between px-2.5 py-2 border-b" style={{
      backgroundColor: 'hsl(var(--color-bg-node-header))',
      borderColor: 'hsl(var(--color-border))',
      color: 'hsl(var(--color-text-primary))'
    }}>
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center justify-center w-3.5 h-3.5">
            {data.customIconSvg ? (
              <div 
                className="w-3.5 h-3.5" 
                style={{ color: 'hsl(var(--color-text-primary))' }}
                dangerouslySetInnerHTML={{ __html: data.customIconSvg }}
              />
            ) : (
              IconComponent && <IconComponent className="w-3.5 h-3.5" style={{ color: 'hsl(var(--color-text-primary))' }} />
            )}
          </div>
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
      }} className="nodrag font-semibold text-[13px] leading-tight bg-transparent border-none outline-none focus:ring-0 flex-1 min-w-0" style={{ color: 'hsl(var(--color-text-primary))' }} autoFocus /> : <div className="font-semibold text-[13px] leading-tight cursor-text break-words flex-1 min-w-0" onClick={() => setIsEditing(true)} style={{ color: 'hsl(var(--color-text-primary))' }}>
            {data.label}
          </div>}
        </div>
        <div className="relative z-10">
          <ConnectionHandle />
        </div>
      </div>
      
      {/* Metrics section */}
      <div className="px-3 py-2.5 space-y-1.5" style={{
        backgroundColor: 'hsl(var(--color-bg-node-body))'
      }}>
        {data.customText && (
          <div className="mb-2 text-xs leading-snug italic border-l-2 pl-2 break-words" style={{
            borderColor: `hsl(var(--color-accent-green))`,
            color: 'hsl(var(--color-text-secondary))'
          }}>
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