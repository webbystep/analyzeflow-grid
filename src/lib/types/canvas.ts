export type NodeType = 'traffic' | 'email' | 'landing' | 'checkout' | 'thankyou' | 'condition';

export interface NodeMetrics {
  visits?: number;
  conversionRate?: number;
  averageOrderValue?: number;
  conversions?: number;
  revenue?: number;
}

export interface NodeData extends NodeMetrics {
  label: string;
  icon?: string;
  color?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
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
    dropOffRate?: number;
    [key: string]: any;
  };
}
