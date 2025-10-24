import type { NodeType, RevenueMode } from './types/canvas';

export type MetricRole =
  | 'visits_input'      // Traffic / entry points
  | 'conversion_output' // Conversions (leads, sales, registrations)
  | 'revenue_output'    // Revenue generation
  | 'engagement'        // Engagement metrics (not aggregated globally)
  | 'cost_input';       // Cost inputs

export interface FieldSchema {
  id: string;
  label: string;
  type: 'text' | 'number' | 'percentage' | 'currency' | 'textarea' | 'select' | 'toggle';
  role?: MetricRole;
  placeholder?: string;
  help?: string;
  helpText?: string; // Additional help text for calculated fields
  step?: number;
  required?: boolean;
  suffix?: string; // Display suffix (e.g., "Ft", "%")
  readOnly?: boolean; // For calculated fields
  options?: { value: string; label: string }[];
  calculate?: (data: Record<string, any>) => number | string;
  dependsOn?: string[];
}

// Helper function to determine default revenue mode based on node type
export function getDefaultRevenueMode(nodeType: NodeType): RevenueMode {
  const directNodes: NodeType[] = ['checkout', 'thankyou', 'contract', 'upsell', 'subscription-renewal'];
  const assistedNodes: NodeType[] = [
    'landing', 'lead-form', 'webinar-event', 'contact', 'sales-call', 
    'proposal', 'referral', 'referral-campaign'
  ];
  
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
    properties: SectionSchema;
    metrics?: SectionSchema;
    costs?: SectionSchema;
  };
  dataSourceOptions?: string[];
}

export const nodeSchemas: Record<NodeType, NodeSchema> = {
  // CORE NODES
  'traffic': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Egyedi leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Forgalmi mutatók',
        fields: [
          { id: 'visits', label: 'Látogatások', type: 'number', role: 'visits_input', help: 'Összes látogatás száma' },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' },
          { 
            id: 'conversionRate', 
            label: 'Konverziós ráta (%)', 
            type: 'percentage',
            calculate: (data) => data.visits && data.conversions ? ((data.conversions / data.visits) * 100).toFixed(2) : '0.00'
          }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'advertising', label: 'Hirdetési költség (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    }
  },

  'email': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Email tárgy', type: 'text' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Email mutatók',
        fields: [
          { id: 'emailsSent', label: 'Küldött emailek', type: 'number', role: 'visits_input' },
          { id: 'opens', label: 'Megnyitások', type: 'number', role: 'engagement' },
          { 
            id: 'openRate', 
            label: 'Megnyitási ráta (%)', 
            type: 'percentage',
            calculate: (data) => data.emailsSent && data.opens ? ((data.opens / data.emailsSent) * 100).toFixed(2) : '0.00'
          },
          { id: 'clicks', label: 'Kattintások', type: 'number', role: 'conversion_output' },
          { 
            id: 'clickRate', 
            label: 'Kattintási ráta (%)', 
            type: 'percentage',
            calculate: (data) => data.opens && data.clicks ? ((data.clicks / data.opens) * 100).toFixed(2) : '0.00'
          }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'costPerEmail', label: 'Költség/email (Ft)', type: 'currency', step: 0.01 },
          { 
            id: 'totalCost', 
            label: 'Összes költség (Ft)', 
            type: 'currency',
            role: 'cost_input',
            calculate: (data) => data.emailsSent && data.costPerEmail ? (data.emailsSent * data.costPerEmail).toFixed(0) : '0'
          }
        ]
      }
    },
    dataSourceOptions: ['Mailchimp', 'SendGrid', 'ActiveCampaign']
  },

  'landing': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Egyedi leírás', type: 'textarea', help: 'Ez jelenik meg a node-on' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Landing page mutatók',
        fields: [
          { id: 'visits', label: 'Látogatások', type: 'number', role: 'visits_input', help: 'Oldalmegnyitások száma' },
          { id: 'submissions', label: 'Kitöltések', type: 'number', role: 'conversion_output', help: 'Űrlap leadek' },
          { 
            id: 'conversionRate', 
            label: 'Konverziós ráta (%)', 
            type: 'percentage',
            calculate: (data) => data.visits && data.submissions ? ((data.submissions / data.visits) * 100).toFixed(2) : '0.00'
          }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'advertising', label: 'Hirdetési költség (Ft)', type: 'currency', role: 'cost_input' },
          { id: 'content', label: 'Tartalom készítés (Ft)', type: 'currency', role: 'cost_input' },
          { id: 'tools', label: 'Eszközök (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    },
    dataSourceOptions: ['Google Analytics', 'Custom API']
  },

  'checkout': {
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
        label: 'Értékesítési mutatók',
        fields: [
          { id: 'checkouts', label: 'Pénztárba lépések', type: 'number', role: 'visits_input' },
          { id: 'orders', label: 'Leadott rendelések', type: 'number', role: 'conversion_output' },
          { 
            id: 'checkoutRate', 
            label: 'Pénztár ráta (%)', 
            type: 'percentage',
            calculate: (data) => data.checkouts && data.orders ? ((data.orders / data.checkouts) * 100).toFixed(2) : '0.00'
          },
          { id: 'averageOrderValue', label: 'AOV (Ft)', type: 'currency' },
          { 
            id: 'revenue', 
            label: 'Bevétel (Ft)', 
            type: 'currency',
            role: 'revenue_output',
            calculate: (data) => data.orders && data.averageOrderValue ? (data.orders * data.averageOrderValue).toFixed(0) : '0'
          }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'tools', label: 'Payment gateway (Ft)', type: 'currency', role: 'cost_input' },
          { id: 'other', label: 'COGS (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    },
    dataSourceOptions: ['Shopify', 'WooCommerce', 'Stripe']
  },

  'thankyou': {
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
        fields: [
          { id: 'visits', label: 'Elérések', type: 'number', role: 'engagement' }
        ]
      }
    }
  },

  'condition': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tulajdonságok',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Feltétel leírása', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
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
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Mutatók',
        fields: [
          { id: 'visits', label: 'Látogatások', type: 'number', role: 'visits_input' },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' }
        ]
      }
    }
  },

  // TRAFFIC / ACQUISITION
  'meta-ads': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Kampány',
        fields: [
          { id: 'label', label: 'Kampány név', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Hirdetési mutatók',
        fields: [
          { id: 'impressions', label: 'Impressziók', type: 'number', role: 'engagement' },
          { id: 'clicks', label: 'Kattintások', type: 'number', role: 'visits_input' },
          { 
            id: 'ctr', 
            label: 'CTR (%)', 
            type: 'percentage',
            calculate: (data) => data.impressions && data.clicks ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0.00'
          },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'adSpend', label: 'Ad Spend (Ft)', type: 'currency', role: 'cost_input' },
          { 
            id: 'cpc', 
            label: 'CPC (Ft)', 
            type: 'currency',
            calculate: (data) => data.adSpend && data.clicks ? (data.adSpend / data.clicks).toFixed(2) : '0.00'
          },
          { 
            id: 'roas', 
            label: 'ROAS', 
            type: 'number',
            calculate: (data) => data.adSpend && data.revenue ? (data.revenue / data.adSpend).toFixed(2) : '0.00'
          }
        ]
      }
    },
    dataSourceOptions: ['Meta Ads Manager API']
  },

  'google-ads': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Kampány',
        fields: [
          { id: 'label', label: 'Kampány név', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Google Ads mutatók',
        fields: [
          { id: 'impressions', label: 'Impressziók', type: 'number', role: 'engagement' },
          { id: 'clicks', label: 'Kattintások', type: 'number', role: 'visits_input' },
          { 
            id: 'ctr', 
            label: 'CTR (%)', 
            type: 'percentage',
            calculate: (data) => data.impressions && data.clicks ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0.00'
          },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'adSpend', label: 'Ad Spend (Ft)', type: 'currency', role: 'cost_input' },
          { 
            id: 'cpc', 
            label: 'CPC (Ft)', 
            type: 'currency',
            calculate: (data) => data.adSpend && data.clicks ? (data.adSpend / data.clicks).toFixed(2) : '0.00'
          }
        ]
      }
    },
    dataSourceOptions: ['Google Ads API']
  },

  'linkedin-ads': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Kampány',
        fields: [
          { id: 'label', label: 'Kampány név', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'LinkedIn Ads mutatók',
        fields: [
          { id: 'impressions', label: 'Impressziók', type: 'number', role: 'engagement' },
          { id: 'clicks', label: 'Kattintások', type: 'number', role: 'visits_input' },
          { id: 'leads', label: 'Lead Form kitöltések', type: 'number', role: 'conversion_output' }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'adSpend', label: 'Ad Spend (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    },
    dataSourceOptions: ['LinkedIn Ads API']
  },

  'youtube-ads': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Kampány',
        fields: [
          { id: 'label', label: 'Kampány név', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'YouTube Ads mutatók',
        fields: [
          { id: 'views', label: 'Megtekintések', type: 'number', role: 'engagement' },
          { id: 'clicks', label: 'Kattintások', type: 'number', role: 'visits_input' },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'adSpend', label: 'Ad Spend (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    },
    dataSourceOptions: ['Google Ads API']
  },

  'organic-social': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Közösségi média',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Platform', type: 'text' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Organikus mutatók',
        fields: [
          { id: 'reach', label: 'Elérés', type: 'number', role: 'engagement' },
          { id: 'clicks', label: 'Kattintások', type: 'number', role: 'visits_input' },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' }
        ]
      }
    }
  },

  'seo-blog': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Tartalom',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'SEO mutatók',
        fields: [
          { id: 'visits', label: 'Organikus látogatás', type: 'number', role: 'visits_input' },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'content', label: 'Tartalomkészítés (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    }
  },

  'referral': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Ajánlás',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Ajánlási mutatók',
        fields: [
          { id: 'referrals', label: 'Ajánlások', type: 'number', role: 'visits_input' },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' }
        ]
      }
    }
  },

  'offline-campaign': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Offline kampány',
        fields: [
          { id: 'label', label: 'Kampány név', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Kampány mutatók',
        fields: [
          { id: 'reach', label: 'Elérés', type: 'number', role: 'engagement' },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'campaignCost', label: 'Kampányköltség (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    }
  },

  // CONVERSION / SALES
  'lead-form': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Lead űrlap',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Űrlap mutatók',
        fields: [
          { id: 'views', label: 'Megtekintések', type: 'number', role: 'visits_input' },
          { id: 'submissions', label: 'Kitöltések', type: 'number', role: 'conversion_output' },
          { 
            id: 'conversionRate', 
            label: 'Konverziós ráta (%)', 
            type: 'percentage',
            calculate: (data) => data.views && data.submissions ? ((data.submissions / data.views) * 100).toFixed(2) : '0.00'
          }
        ]
      }
    }
  },

  'contact': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Kapcsolatfelvétel',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Kapcsolat mutatók',
        fields: [
          { id: 'inquiries', label: 'Megkeresések', type: 'number', role: 'visits_input' },
          { id: 'responses', label: 'Válaszok', type: 'number', role: 'conversion_output' }
        ]
      }
    }
  },

  'sales-call': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Értékesítési hívás',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Hívás mutatók',
        fields: [
          { id: 'scheduled', label: 'Tervezett hívások', type: 'number', role: 'visits_input' },
          { id: 'completed', label: 'Lezárt hívások', type: 'number', role: 'conversion_output' },
          { id: 'deals', label: 'Ügyletek', type: 'number', role: 'conversion_output' }
        ]
      }
    }
  },

  'proposal': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Ajánlat',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Ajánlat mutatók',
        fields: [
          { id: 'sent', label: 'Küldött ajánlatok', type: 'number', role: 'visits_input' },
          { id: 'accepted', label: 'Elfogadott', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      }
    }
  },

  'contract': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Szerződés',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Szerződés mutatók',
        fields: [
          { id: 'sent', label: 'Küldött szerződések', type: 'number', role: 'visits_input' },
          { id: 'signed', label: 'Aláírt', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      }
    }
  },

  'upsell': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Upsell',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Upsell mutatók',
        fields: [
          { id: 'offers', label: 'Ajánlatok', type: 'number', role: 'visits_input' },
          { id: 'conversions', label: 'Konverziók', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Extra bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      }
    }
  },

  'partner-contact': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Partner kapcsolat',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Partner mutatók',
        fields: [
          { id: 'contacts', label: 'Kapcsolatok', type: 'number', role: 'visits_input' },
          { id: 'partnerships', label: 'Partnerségek', type: 'number', role: 'conversion_output' }
        ]
      }
    }
  },

  // RETENTION / REMARKETING
  'remarketing-ads': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Remarketing',
        fields: [
          { id: 'label', label: 'Kampány név', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Remarketing mutatók',
        fields: [
          { id: 'impressions', label: 'Impressziók', type: 'number', role: 'engagement' },
          { id: 'clicks', label: 'Kattintások', type: 'number', role: 'visits_input' },
          { id: 'conversions', label: 'Visszatérő konverziók', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'adSpend', label: 'Ad Spend (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    }
  },

  'loyalty-program': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Hűségprogram',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Hűségprogram mutatók',
        fields: [
          { id: 'members', label: 'Tagok', type: 'number', role: 'engagement' },
          { id: 'activeMembers', label: 'Aktív tagok', type: 'number', role: 'visits_input' },
          { id: 'repeatPurchases', label: 'Ismételt vásárlások', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      }
    }
  },

  'reactivation': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Reaktiválás',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Reaktiválási mutatók',
        fields: [
          { id: 'targeted', label: 'Megcélzott inaktívak', type: 'number', role: 'visits_input' },
          { id: 'reactivated', label: 'Reaktiváltak', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      }
    }
  },

  'subscription-renewal': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Előfizetés megújítás',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Megújítási mutatók',
        fields: [
          { id: 'expiring', label: 'Lejáró előfizetések', type: 'number', role: 'visits_input' },
          { id: 'renewed', label: 'Megújított', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      }
    }
  },

  'feedback-nps': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Visszajelzés / NPS',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Visszajelzés mutatók',
        fields: [
          { id: 'sent', label: 'Küldött kérdőívek', type: 'number', role: 'visits_input' },
          { id: 'responses', label: 'Válaszok', type: 'number', role: 'engagement' },
          { id: 'npsScore', label: 'NPS érték', type: 'number' }
        ]
      }
    }
  },

  'referral-campaign': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Ajánlói program',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Ajánlói mutatók',
        fields: [
          { id: 'referrals', label: 'Ajánlások', type: 'number', role: 'visits_input' },
          { id: 'conversions', label: 'Sikeres ajánlások', type: 'number', role: 'conversion_output' },
          { id: 'revenue', label: 'Bevétel (Ft)', type: 'currency', role: 'revenue_output' }
        ]
      }
    }
  },

  'unsubscribe': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Leiratkozás',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Leiratkozási mutatók',
        fields: [
          { id: 'unsubscribes', label: 'Leiratkozások', type: 'number', role: 'engagement' }
        ]
      }
    }
  },

  // AUTOMATION / INTEGRATIONS
  'webhook-api': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Webhook / API',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Endpoint', type: 'text' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'API mutatók',
        fields: [
          { id: 'calls', label: 'API hívások', type: 'number', role: 'engagement' },
          { id: 'success', label: 'Sikeres', type: 'number', role: 'engagement' }
        ]
      }
    }
  },

  'crm-sync': {
    sections: {
      properties: {
        id: 'properties',
        label: 'CRM szinkronizáció',
        fields: [
          { id: 'label', label: 'CRM név', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Szinkronizációs mutatók',
        fields: [
          { id: 'records', label: 'Szinkronizált rekordok', type: 'number', role: 'engagement' }
        ]
      }
    }
  },

  'automation-step': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Automatizálási lépés',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Automatizálási mutatók',
        fields: [
          { id: 'triggered', label: 'Aktivált', type: 'number', role: 'visits_input' },
          { id: 'completed', label: 'Befejezett', type: 'number', role: 'conversion_output' }
        ]
      }
    }
  },

  'ai-recommendation': {
    sections: {
      properties: {
        id: 'properties',
        label: 'AI ajánlás',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'AI mutatók',
        fields: [
          { id: 'shown', label: 'Megjelenített ajánlások', type: 'number', role: 'visits_input' },
          { id: 'clicks', label: 'Kattintások', type: 'number', role: 'conversion_output' }
        ]
      }
    }
  },

  'data-import': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Adat import',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Forrás', type: 'text' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Import mutatók',
        fields: [
          { id: 'records', label: 'Importált rekordok', type: 'number', role: 'engagement' }
        ]
      }
    }
  },

  // BRAND / SUPPORT
  'brand-awareness': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Márkaépítés',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Márka mutatók',
        fields: [
          { id: 'reach', label: 'Elérés', type: 'number', role: 'engagement' },
          { id: 'engagement', label: 'Engagement', type: 'number', role: 'engagement' }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'campaignCost', label: 'Kampányköltség (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    }
  },

  'webinar-event': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Esemény',
        fields: [
          { id: 'label', label: 'Esemény neve', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Esemény mutatók',
        fields: [
          { id: 'registrations', label: 'Regisztrációk', type: 'number', role: 'visits_input' },
          { id: 'attendees', label: 'Résztvevők', type: 'number', role: 'conversion_output' },
          { 
            id: 'attendanceRate', 
            label: 'Részvételi arány (%)', 
            type: 'percentage',
            calculate: (data) => data.registrations && data.attendees ? ((data.attendees / data.registrations) * 100).toFixed(2) : '0.00'
          },
          { id: 'leads', label: 'Leadek', type: 'number', role: 'conversion_output' },
          { 
            id: 'costPerLead', 
            label: 'Lead költség (Ft)', 
            type: 'currency',
            calculate: (data) => {
              const totalCost = (Number(data.advertising) || 0) + (Number(data.tools) || 0) + (Number(data.other) || 0);
              return data.leads && totalCost ? (totalCost / data.leads).toFixed(0) : '0';
            }
          }
        ]
      },
      costs: {
        id: 'costs',
        label: 'Költségek',
        fields: [
          { id: 'advertising', label: 'Promóció (Ft)', type: 'currency', role: 'cost_input' },
          { id: 'tools', label: 'Platform (Ft)', type: 'currency', role: 'cost_input' },
          { id: 'other', label: 'Előadói díj (Ft)', type: 'currency', role: 'cost_input' }
        ]
      }
    },
    dataSourceOptions: ['Zoom', 'Google Meet', 'Webinarjam']
  },

  'customer-support': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Ügyfélszolgálat',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Support mutatók',
        fields: [
          { id: 'tickets', label: 'Megkeresések', type: 'number', role: 'visits_input' },
          { id: 'resolved', label: 'Megoldott', type: 'number', role: 'conversion_output' },
          { 
            id: 'resolutionRate', 
            label: 'Megoldási arány (%)', 
            type: 'percentage',
            calculate: (data) => data.tickets && data.resolved ? ((data.resolved / data.tickets) * 100).toFixed(2) : '0.00'
          }
        ]
      }
    }
  },

  'review-testimonial': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Vélemények',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Leírás', type: 'textarea' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Vélemény mutatók',
        fields: [
          { id: 'requests', label: 'Kérések', type: 'number', role: 'visits_input' },
          { id: 'received', label: 'Kapott vélemények', type: 'number', role: 'conversion_output' },
          { id: 'rating', label: 'Átlag értékelés', type: 'number', step: 0.1 }
        ]
      }
    }
  },

  'community': {
    sections: {
      properties: {
        id: 'properties',
        label: 'Közösség',
        fields: [
          { id: 'label', label: 'Címke', type: 'text', required: true },
          { id: 'customText', label: 'Platform', type: 'text' },
          { id: 'notes', label: 'Jegyzetek', type: 'textarea' }
        ]
      },
      metrics: {
        id: 'metrics',
        label: 'Közösségi mutatók',
        fields: [
          { id: 'members', label: 'Tagok', type: 'number', role: 'engagement' },
          { id: 'activeMembers', label: 'Aktív tagok', type: 'number', role: 'engagement' },
          { id: 'posts', label: 'Bejegyzések', type: 'number', role: 'engagement' }
        ]
      }
    }
  }
};

export function getNodeSchema(nodeType: NodeType): NodeSchema | undefined {
  return nodeSchemas[nodeType];
}

export function findFieldByRole(schema: NodeSchema, role: MetricRole): FieldSchema | undefined {
  for (const section of Object.values(schema.sections)) {
    const field = section.fields.find(f => f.role === role);
    if (field) return field;
  }
  return undefined;
}
