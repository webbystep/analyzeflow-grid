import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { getNodeDefinition } from '@/lib/nodeDefinitions';
import { ConnectionHandle } from './ConnectionHandle';
import { NodeContextMenu } from './NodeContextMenu';
import * as Phosphor from '@phosphor-icons/react';
import * as SimpleIcons from 'react-icons/si';
import type { NodeType } from '@/lib/types/canvas';

interface FunnelNodeData {
  label: string;
  description?: string;
  customText?: string;
  platform?: string;
  icon?: string;
  iconColor?: string;
  customIconSvg?: string;
  color?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  onDeleteNode?: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
}

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
  const nodeType = type as NodeType;
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const isConnectedHighlighted = (data as any).isConnectedHighlighted || false;

  // Get the node definition to use its icon
  const nodeDefinition = getNodeDefinition(nodeType);

  // Determine icon to use (Phosphor Icons + Simple Icons for brands)
  let IconComponent: any;
  if (data.customIconSvg) {
    IconComponent = null; // Will render SVG directly
  } else if (data.icon?.startsWith('simple:')) {
    // Brand icon from Simple Icons
    const iconName = data.icon.replace('simple:', '');
    IconComponent = (SimpleIcons as any)[`Si${iconName}`] || Phosphor.Question;
  } else if (data.icon && (Phosphor as any)[data.icon]) {
    // UI icon from Phosphor Icons
    IconComponent = (Phosphor as any)[data.icon];
  } else {
    // Use the icon from nodeDefinition instead of the old nodeIcons mapping
    IconComponent = nodeDefinition?.icon || Phosphor.Question;
  }

  const iconColor = data.iconColor || 'white';
  const nodeColor = data.color || `var(--node-${nodeType})`;
  
  const handleDelete = () => {
    data.onDeleteNode?.(id);
  };

  const handleDuplicate = () => {
    data.onDuplicateNode?.(id);
  };

  return (
    <NodeContextMenu
      node={{ id, data, type, position: { x: 0, y: 0 } } as any}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: isHovered ? -1 : 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        onMouseEnter={() => {
          setIsHovered(true);
          (data as any).onNodeHover?.(id);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          (data as any).onNodeHover?.(null);
        }}
        className={`rounded-lg w-[240px] overflow-hidden relative z-10 transition-all duration-200 border ${
          selected || isConnectedHighlighted ? 'is-active' : ''
        }`}
        style={{
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
        }}
      >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-transparent !border-0" 
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-transparent !border-0" 
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-transparent !border-0" 
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-transparent !border-0" 
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      
      {/* Header */}
      <div 
        className="relative flex items-center justify-between px-2.5 py-2 border-b"
        style={{
          backgroundColor: 'hsl(var(--color-bg-node-header))',
          borderColor: 'hsl(var(--color-border))',
          color: 'hsl(var(--color-text-primary))'
        }}
      >
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center justify-center w-3.5 h-3.5">
            {data.customIconSvg ? (
              <div 
                className="w-3.5 h-3.5" 
                style={{ color: 'hsl(var(--color-text-primary))' }}
                dangerouslySetInnerHTML={{ __html: data.customIconSvg }}
              />
            ) : (
              IconComponent && <IconComponent size={14} style={{ color: 'hsl(var(--color-text-primary))' }} />
            )}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (label.trim() && label !== data.label) {
                  (data as any).onLabelChange?.(id, label.trim());
                } else {
                  setLabel(data.label);
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  if (label.trim() && label !== data.label) {
                    (data as any).onLabelChange?.(id, label.trim());
                  }
                } else if (e.key === 'Escape') {
                  setLabel(data.label);
                  setIsEditing(false);
                }
              }}
              className="nodrag font-semibold text-[13px] leading-tight bg-transparent border-none outline-none focus:ring-0 flex-1 min-w-0"
              style={{ color: 'hsl(var(--color-text-primary))' }}
              autoFocus
            />
          ) : (
            <div 
              className="font-semibold text-[13px] leading-tight cursor-text break-words flex-1 min-w-0"
              onClick={() => setIsEditing(true)}
              style={{ color: 'hsl(var(--color-text-primary))' }}
            >
              {data.label}
            </div>
          )}
        </div>
        <div className="relative z-10">
          <ConnectionHandle />
        </div>
      </div>
      
      {/* Body - show description (preferred) or customText (backward compat) */}
      {(data.description || data.customText) && (
        <div 
          className="px-3 py-2.5"
          style={{ backgroundColor: 'hsl(var(--color-bg-node-body))' }}
        >
          <div 
            className="text-xs leading-snug italic border-l-2 pl-2 break-words line-clamp-2"
            style={{
              borderColor: `hsl(var(--color-accent-green))`,
              color: 'hsl(var(--color-text-secondary))'
            }}
          >
            {data.description || data.customText}
          </div>
        </div>
      )}
      </motion.div>
    </NodeContextMenu>
  );
});

FunnelNode.displayName = 'FunnelNode';
