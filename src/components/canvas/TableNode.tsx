import { memo } from 'react';
import * as React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Key, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TableField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  isNullable?: boolean;
}

export interface TableNodeData {
  label: string;
  fields: TableField[];
  onNodeHover?: (nodeId: string | null) => void;
  isConnectedHighlighted?: boolean;
}

export const TableNode = memo(({ data, selected, id }: NodeProps) => {
  const tableData = data as unknown as TableNodeData;
  const [isEditing, setIsEditing] = React.useState(false);
  const [label, setLabel] = React.useState(tableData.label);
  const isConnectedHighlighted = tableData.isConnectedHighlighted || false;

  return (
    <motion.div
      onMouseEnter={() => tableData.onNodeHover?.(id)}
      onMouseLeave={() => tableData.onNodeHover?.(null)}
      className={cn(
        "relative rounded-lg bg-card border-2 transition-all min-w-[220px] max-w-[300px]",
        selected && "border-primary shadow-lg ring-2 ring-primary/20",
        !selected && !isConnectedHighlighted && "border-border shadow-md",
        isConnectedHighlighted && "border-primary/50 shadow-2xl ring-2 ring-primary/30"
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-800 !border-2 !border-white"
        style={{ 
          opacity: 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-800 !border-2 !border-white"
        style={{ 
          opacity: 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />

      {/* Header */}
      <div 
        className="px-4 py-3 rounded-t-lg flex items-center gap-2"
        style={{ 
          backgroundColor: 'hsl(var(--node-landing))',
          color: 'white'
        }}
      >
        <Database className="w-4 h-4" />
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              if (label.trim() && label !== tableData.label) {
                (tableData as any).onLabelChange?.(id, label.trim());
              } else {
                setLabel(tableData.label);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditing(false);
                if (label.trim() && label !== tableData.label) {
                  (tableData as any).onLabelChange?.(id, label.trim());
                }
              } else if (e.key === 'Escape') {
                setLabel(tableData.label);
                setIsEditing(false);
              }
            }}
            className="nodrag font-semibold text-sm bg-transparent border-none outline-none focus:ring-0 text-white"
            autoFocus
          />
        ) : (
          <span 
            className="font-semibold text-sm cursor-text"
            onClick={() => setIsEditing(true)}
          >
            {tableData.label}
          </span>
        )}
      </div>

      {/* Fields */}
      <div className="divide-y divide-border/50">
        {tableData.fields.map((field, index) => (
          <div 
            key={index}
            className="px-4 py-2 flex items-center justify-between text-xs hover:bg-accent/20 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {field.isPrimary && (
                <Key className="w-3 h-3 text-primary flex-shrink-0" />
              )}
              {field.isForeign && (
                <Key className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
              <span className="font-mono font-medium truncate">
                {field.name}
              </span>
            </div>
            <span className="text-muted-foreground font-mono text-[10px] ml-2 flex-shrink-0">
              {field.type}
              {field.isNullable && '?'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

TableNode.displayName = 'TableNode';
