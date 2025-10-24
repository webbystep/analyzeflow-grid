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
    scale: selected ? 1.02 : isHovered ? 1.01 : 1,
    opacity: 1,
    y: isHovered ? -2 : 0
  }} whileHover={{
    scale: 1.02
  }} transition={{
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1]
  }} onMouseEnter={() => {
    setIsHovered(true);
    (data as any).onNodeHover?.(id);
  }} onMouseLeave={() => {
    setIsHovered(false);
    (data as any).onNodeHover?.(null);
  }} className={`rounded-xl w-[200px] overflow-visible relative z-10 transition-all duration-200 ${selected ? 'border-2' : 'border'}`} style={{
    backgroundColor: 'hsl(var(--card))',
    borderColor: selected 
      ? `hsl(var(--primary))` 
      : isConnectedHighlighted 
      ? `hsl(var(--primary) / 0.5)` 
      : `hsl(${nodeColor} / 0.3)`,
    boxShadow: selected 
      ? `0 20px 40px -10px hsl(${nodeColor} / 0.4), 0 0 0 2px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.3)` 
      : isConnectedHighlighted 
      ? `0 15px 30px -10px hsl(${nodeColor} / 0.6), 0 0 0 2px hsl(var(--primary) / 0.3)` 
      : isHovered
      ? `0 12px 24px -8px hsl(${nodeColor} / 0.35), 0 0 0 1px hsl(${nodeColor} / 0.4)`
      : `0 4px 12px -4px hsl(${nodeColor} / 0.25)`,
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
      
      {/* Colored header bar with gradient glow */}
      <div className="relative flex items-center justify-between px-3 py-2.5 rounded-t-xl overflow-hidden" style={{
      background: `linear-gradient(135deg, hsl(${nodeColor}) 0%, hsl(${nodeColor} / 0.85) 100%)`,
      color: 'hsl(var(--color-text-invert))',
      boxShadow: `inset 0 1px 0 hsl(${nodeColor} / 0.2), inset 0 -1px 2px hsl(${nodeColor} / 0.3)`
    }}>
        {/* Subtle inner glow */}
        <div className="absolute inset-0 opacity-30" style={{
          background: `radial-gradient(circle at top left, hsl(${nodeColor} / 0.4) 0%, transparent 70%)`
        }} />
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center justify-center w-5 h-5 rounded-md" style={{
            backgroundColor: 'hsla(0, 0%, 100%, 0.15)',
            backdropFilter: 'blur(4px)'
          }}>
            {data.customIconSvg ? (
              <div 
                className="w-3.5 h-3.5" 
                dangerouslySetInnerHTML={{ __html: data.customIconSvg }}
              />
            ) : (
              IconComponent && <IconComponent className="w-3.5 h-3.5" style={{ color: iconColor }} />
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
      }} className="nodrag font-semibold text-sm bg-transparent border-none outline-none focus:ring-0 text-white flex-1 min-w-0" autoFocus /> : <div className="font-semibold text-sm cursor-text break-words flex-1 min-w-0 tracking-tight" onClick={() => setIsEditing(true)}>
            {data.label}
          </div>}
        </div>
        <div className="relative z-10">
          <ConnectionHandle />
        </div>
      </div>
      
      {/* Metrics section */}
      <div className="px-3 py-2.5 space-y-1.5">
        {data.customText && (
          <div className="mb-2 text-xs text-muted-foreground italic border-l-2 pl-2 break-words" style={{
            borderColor: `hsl(${nodeColor} / 0.3)`
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