export type NodeType = 
  // Core nodes
  'traffic' | 'email' | 'landing' | 'checkout' | 'thankyou' | 'condition' | 'custom' |
  // Traffic / Acquisition
  'meta-ads' | 'google-ads' | 'linkedin-ads' | 'youtube-ads' | 'organic-social' | 'seo-blog' | 'referral' | 'offline-campaign' |
  // Conversion / Sales
  'lead-form' | 'contact' | 'sales-call' | 'proposal' | 'contract' | 'upsell' | 'partner-contact' |
  // Retention / Remarketing
  'remarketing-ads' | 'loyalty-program' | 'reactivation' | 'subscription-renewal' | 'feedback-nps' | 'referral-campaign' | 'unsubscribe' |
  // Automation / Integrations
  'webhook-api' | 'crm-sync' | 'automation-step' | 'ai-recommendation' | 'data-import' |
  // Brand / Support
  'brand-awareness' | 'webinar-event' | 'customer-support' | 'review-testimonial' | 'community';

export interface NodeCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

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
  customText?: string;
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
