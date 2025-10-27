// Simplified node types - 7 core types
export type NodeType = 
  'traffic' | 'landing' | 'email' | 'offer' | 'checkout' | 'thank_you' | 'custom';

export interface NodeCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface NodeData {
  label: string;
  customText?: string;
  icon?: string; // Lucide icon name
  iconColor?: string; // Custom color for icon
  customIconSvg?: string; // Custom SVG override
  color?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  
  // Dynamic fields (flexible structure for node-specific data)
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
