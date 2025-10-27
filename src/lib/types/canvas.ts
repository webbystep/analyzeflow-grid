// New simplified node types - 3 core types + action subtypes
export type NodeType = 'source' | 'page' | 'action';

// Action subtypes
export type ActionType = 'email' | 'delay' | 'condition' | 'custom';

export interface NodeCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface NodeData {
  label: string;
  description?: string; // replaces customText
  icon?: string; // Lucide icon name
  iconColor?: string; // Custom color for icon
  customIconSvg?: string; // Custom SVG override
  
  // Type-specific fields
  actionType?: ActionType; // only for action nodes
  parameters?: {
    // Email specific
    subject?: string;
    from?: string;
    timing?: string;
    
    // Delay specific
    delayTime?: string;
    delayUnit?: string;
    
    // Condition specific
    yesLabel?: string;
    noLabel?: string;
    rule?: string;
  };
  
  // Page specific
  url?: string;
  goalType?: string;
  
  // Source specific
  platform?: string;
  
  // Meta fields
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  
  // Backward compatibility
  customText?: string;
  
  [key: string]: any;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: {
    isHighlighted?: boolean;
    sourceNodeColor?: string;
    cardinality?: {
      source: string;
      target: string;
    };
    [key: string]: any;
  };
}
