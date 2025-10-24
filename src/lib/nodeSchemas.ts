// Simplified node schemas - 7 core node types with template-based metrics
import { NodeType, RevenueMode } from './types/canvas';

export type MetricRole = 'visits_input' | 'conversion_output' | 'revenue_output' | 'engagement' | 'cost_input';

export interface FieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'currency' | 'percentage' | 'toggle' | 'select';
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  role?: MetricRole;
  calculate?: (data: Record<string, any>) => string | number;
  step?: number;
  suffix?: string;
  readOnly?: boolean;
  helpText?: string;
}

// Default revenue mode based on node type
export function getDefaultRevenueMode(nodeType: NodeType): RevenueMode {
  const directNodes: NodeType[] = ['checkout', 'thank_you'];
  const assistedNodes: NodeType[] = ['landing', 'offer', 'email'];
  
  if (directNodes.includes(nodeType)) return 'direct';
  if (assistedNodes.includes(nodeType)) return 'assisted';
  return 'none';
}

export interface SectionSchema {
  id: string;
  label: string;
  icon?: string;
  fields: FieldSchema[];
  visible?: (data: Record<string, any>) => boolean;
}

export interface NodeSchema {
  sections: {
    properties?: SectionSchema;
    metrics?: SectionSchema;
    costs?: SectionSchema;
  };
  dataSourceOptions?: string[];
}

// Simplified node schemas - metrics are now template-based
export const nodeSchemas: Record<NodeType, NodeSchema> = {
  'traffic': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
          { 
            id: 'revenueMode', 
            label: 'Bevétel típusa', 
            type: 'select',
            help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
            options: [
              { value: 'direct', label: 'Közvetlen bevétel' },
              { value: 'assisted', label: 'Közvetett/hozzájáruló bevétel' },
              { value: 'none', label: 'Nincs bevétel' }
            ]
          }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Mutatók',
        fields: [] // Metrics come from templates
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'advertising', label: 'Hirdetési költség', type: 'currency', suffix: 'Ft' },
          { id: 'content', label: 'Tartalom költség', type: 'currency', suffix: 'Ft' },
          { id: 'tools', label: 'Eszköz költség', type: 'currency', suffix: 'Ft' }
        ]
      }
    }
  },

  'landing': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
          { 
            id: 'revenueMode', 
            label: 'Bevétel típusa', 
            type: 'select',
            help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
            options: [
              { value: 'direct', label: 'Közvetlen bevétel' },
              { value: 'assisted', label: 'Közvetett/hozzájáruló bevétel' },
              { value: 'none', label: 'Nincs bevétel' }
            ]
          }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Mutatók',
        fields: [] // Metrics come from templates
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'advertising', label: 'Hirdetési költség', type: 'currency', suffix: 'Ft' },
          { id: 'content', label: 'Oldal készítés', type: 'currency', suffix: 'Ft' },
          { id: 'tools', label: 'Eszközök (A/B teszt, stb.)', type: 'currency', suffix: 'Ft' }
        ]
      }
    },
    dataSourceOptions: ['Google Analytics', 'Facebook Pixel', 'HubSpot']
  },

  'email': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
          { 
            id: 'revenueMode', 
            label: 'Bevétel típusa', 
            type: 'select',
            help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
            options: [
              { value: 'direct', label: 'Közvetlen bevétel' },
              { value: 'assisted', label: 'Közvetett/hozzájáruló bevétel' },
              { value: 'none', label: 'Nincs bevétel' }
            ]
          }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Mutatók',
        fields: [] // Metrics come from templates
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'emailsSent', label: 'Elküldött emailek', type: 'number' },
          { id: 'costPerEmail', label: 'Email / db ár', type: 'currency', suffix: 'Ft' }
        ]
      }
    },
    dataSourceOptions: ['Mailchimp', 'SendGrid', 'ActiveCampaign']
  },

  'offer': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
          { 
            id: 'revenueMode', 
            label: 'Bevétel típusa', 
            type: 'select',
            help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
            options: [
              { value: 'direct', label: 'Közvetlen bevétel' },
              { value: 'assisted', label: 'Közvetett/hozzájáruló bevétel' },
              { value: 'none', label: 'Nincs bevétel' }
            ]
          }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Mutatók',
        fields: [] // Metrics come from templates
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'tools', label: 'CRM / ajánlatkészítő eszköz', type: 'currency', suffix: 'Ft' },
          { id: 'other', label: 'Egyéb költség', type: 'currency', suffix: 'Ft' }
        ]
      }
    }
  },

  'checkout': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
          { 
            id: 'revenueMode', 
            label: 'Bevétel típusa', 
            type: 'select',
            help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
            options: [
              { value: 'direct', label: 'Közvetlen bevétel' },
              { value: 'assisted', label: 'Közvetett/hozzájáruló bevétel' },
              { value: 'none', label: 'Nincs bevétel' }
            ]
          }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Mutatók',
        fields: [] // Metrics come from templates
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'paymentFees', label: 'Fizetési díjak (%)', type: 'percentage' },
          { id: 'platformFees', label: 'Platform díjak', type: 'currency', suffix: 'Ft' }
        ]
      }
    },
    dataSourceOptions: ['Shopify', 'WooCommerce', 'Stripe']
  },

  'thank_you': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Mutatók',
        fields: [] // Metrics come from templates
      }
    }
  },

  'custom': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
          { 
            id: 'revenueMode', 
            label: 'Bevétel típusa', 
            type: 'select',
            help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
            options: [
              { value: 'direct', label: 'Közvetlen bevétel' },
              { value: 'assisted', label: 'Közvetett/hozzájáruló bevétel' },
              { value: 'none', label: 'Nincs bevétel' }
            ]
          }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Mutatók',
        fields: [] // Custom metrics can be defined freely
      }
    }
  }
};

// Get node schema by type
export function getNodeSchema(nodeType: NodeType): NodeSchema | undefined {
  return nodeSchemas[nodeType];
}

// Find field by role in schema
export function findFieldByRole(schema: NodeSchema, role: MetricRole): FieldSchema | undefined {
  for (const section of Object.values(schema.sections)) {
    if (!section?.fields) continue;
    const field = section.fields.find(f => f.role === role);
    if (field) return field;
  }
  return undefined;
}
