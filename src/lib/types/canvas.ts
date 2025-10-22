export type NodeType = 'traffic' | 'email' | 'landing' | 'checkout' | 'thankyou' | 'condition' | 'table';

export interface NodeCosts {
  // Direct costs for this specific node
  advertising?: number;    // e.g., Facebook Ads for this step
  content?: number;        // e.g., Landing page creation cost
  tools?: number;          // e.g., A/B testing tool for this step
  other?: number;          // Other direct costs
  
  // Variable costs (per action)
  emailsSent?: number;     // Number of emails sent
  costPerEmail?: number;   // Cost per email
  smsSent?: number;        // Number of SMS sent
  costPerSms?: number;     // Cost per SMS
  
  // Calculated/allocated (auto-computed by app)
  allocatedOverhead?: number;  // Portion of monthly fixed costs
  total?: number;              // Total cost for this node
}

export interface NodeMetrics {
  visits?: number;
  conversionRate?: number;
  averageOrderValue?: number;
  conversions?: number;
  revenue?: number;
  costs?: NodeCosts;
}

export interface NodeData extends NodeMetrics {
  label: string;
  icon?: string;
  color?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
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
    dropOffRate?: number;
    isHighlighted?: boolean;
    sourceNodeColor?: string;
    cardinality?: {
      source: string;
      target: string;
    };
    [key: string]: any;
  };
}
