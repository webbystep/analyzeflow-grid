// Node schemas with meta and metrics structure
import { NodeType, RevenueMode } from './types/canvas';

// Type definitions
export type MetricRole =
  | 'visits_input'
  | 'conversion_output'
  | 'revenue_output'
  | 'value_per_conversion'
  | 'cost_input'
  | 'cost_total'
  | 'rate_output'
  | 'efficiency_output'
  | 'interaction_output'
  | 'custom';

export interface FieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'currency' | 'percentage';
  role?: MetricRole;
  required?: boolean;
  readOnly?: boolean;
  help?: string;
  placeholder?: string;
  suffix?: string;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  calculate?: (data: Record<string, any>) => string | number;
}

// Helper function to get default revenue mode
export function getDefaultRevenueMode(nodeType: NodeType): RevenueMode {
  switch (nodeType) {
    case 'checkout':
      return 'direct';
    case 'landing':
    case 'email':
    case 'offer':
      return 'assisted';
    case 'traffic':
    case 'thank_you':
    case 'custom':
    default:
      return 'none';
  }
}

// Section schema for grouping fields
export interface SectionSchema {
  id: string;
  label: string;
  fields: FieldSchema[];
}

// Main node schema
export interface NodeSchema {
  properties: SectionSchema;
  meta?: SectionSchema;
  metrics?: SectionSchema;
  dataSources?: Array<{ value: string; label: string }>;
}

// Node schemas - 7 core types with detailed meta and metrics
export const nodeSchemas: Record<NodeType, NodeSchema> = {
  traffic: {
    properties: {
      id: 'properties',
      label: 'Tulajdonságok',
      fields: [
        { id: 'label', label: 'Címke', type: 'text', required: true },
        { id: 'customText', label: 'Egyedi leírás', type: 'textarea' },
        { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
        {
          id: 'revenueMode',
          label: 'Bevétel típusa',
          type: 'select',
          help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
          options: [
            { value: 'none', label: 'Ez csak forgalom / nem közvetlen bevétel' },
            { value: 'assisted', label: 'Közvetve hoz bevételt (assisted)' }
          ]
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Forrás adatok',
      fields: [
        { id: 'sourceName', label: 'Forrás neve', type: 'text', placeholder: 'pl. Facebook Ads' },
        { id: 'campaignName', label: 'Kampány neve', type: 'text', placeholder: 'pl. Q1 Lead kampány' },
        {
          id: 'dataSource',
          label: 'Adatforrás',
          type: 'select',
          options: [
            { value: 'google-ads', label: 'Google Ads' },
            { value: 'meta', label: 'Meta Ads' },
            { value: 'tiktok', label: 'TikTok Ads' },
            { value: 'custom', label: 'Egyedi API' }
          ]
        }
      ]
    },
    metrics: {
      id: 'metrics',
      label: 'Forgalom mutatók',
      fields: [
        {
          id: 'impressions',
          label: 'Megjelenések',
          type: 'number',
          role: 'visits_input',
          help: 'Hirdetés megjelenítések száma',
          placeholder: '0'
        },
        {
          id: 'clicks',
          label: 'Kattintások',
          type: 'number',
          role: 'interaction_output',
          help: 'Hirdetésre kattintások száma',
          placeholder: '0'
        },
        {
          id: 'cpc',
          label: 'Átlagos CPC',
          type: 'currency',
          suffix: 'Ft',
          role: 'cost_input',
          help: 'Költség kattintásonként',
          placeholder: '0',
          step: 1
        },
        {
          id: 'totalCost',
          label: 'Összes költség',
          type: 'currency',
          suffix: 'Ft',
          role: 'cost_total',
          readOnly: true,
          help: 'Kattintások × CPC',
          calculate: (data) => {
            const clicks = Number(data.clicks) || 0;
            const cpc = Number(data.cpc) || 0;
            return (clicks * cpc).toFixed(0);
          }
        },
        {
          id: 'ctr',
          label: 'CTR',
          type: 'percentage',
          suffix: '%',
          role: 'rate_output',
          readOnly: true,
          help: 'Kattintási arány: (kattintások / megjelenések) × 100',
          calculate: (data) => {
            const impressions = Number(data.impressions) || 0;
            const clicks = Number(data.clicks) || 0;
            return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
          }
        }
      ]
    }
  },

  landing: {
    properties: {
      id: 'properties',
      label: 'Tulajdonságok',
      fields: [
        { id: 'label', label: 'Címke', type: 'text', required: true },
        { id: 'customText', label: 'Egyedi leírás', type: 'textarea' },
        { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
        {
          id: 'revenueMode',
          label: 'Bevétel típusa',
          type: 'select',
          help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
          options: [
            { value: 'assisted', label: 'Ez csak lead, később lesz bevétel' },
            { value: 'direct', label: 'Ez közvetlenül pénzt termel' },
            { value: 'none', label: 'Ez csak érdeklődés / edukáció' }
          ]
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Oldal adatok',
      fields: [
        { id: 'pageName', label: 'Oldal neve', type: 'text', placeholder: 'pl. Fő landing oldal' },
        { id: 'url', label: 'URL', type: 'text', placeholder: 'https://...' },
        {
          id: 'dataSource',
          label: 'Adatforrás',
          type: 'select',
          options: [
            { value: 'google-analytics', label: 'Google Analytics' },
            { value: 'meta-pixel', label: 'Meta Pixel' },
            { value: 'custom-api', label: 'Egyedi API' }
          ]
        }
      ]
    },
    metrics: {
      id: 'metrics',
      label: 'Landing mutatók',
      fields: [
        {
          id: 'visits',
          label: 'Látogatások',
          type: 'number',
          role: 'visits_input',
          help: 'Oldalmegnyitások száma',
          placeholder: '0'
        },
        {
          id: 'conversions',
          label: 'Kitöltések / Regisztrációk',
          type: 'number',
          role: 'conversion_output',
          help: 'Sikeres űrlap kitöltések',
          placeholder: '0'
        },
        {
          id: 'valuePerConversion',
          label: 'Egy konverzió értéke',
          type: 'currency',
          suffix: 'Ft',
          role: 'value_per_conversion',
          help: 'Mennyit ér számodra 1 lead / regisztráció Ft-ban',
          placeholder: '0',
          step: 100
        },
        {
          id: 'cr',
          label: 'Konverziós ráta',
          type: 'percentage',
          suffix: '%',
          role: 'rate_output',
          readOnly: true,
          help: '(Kitöltések / Látogatások) × 100',
          calculate: (data) => {
            const visits = Number(data.visits) || 0;
            const conversions = Number(data.conversions) || 0;
            return visits > 0 ? ((conversions / visits) * 100).toFixed(2) : '0.00';
          }
        },
        {
          id: 'estimatedRevenue',
          label: 'Becsült bevétel',
          type: 'currency',
          suffix: 'Ft',
          role: 'revenue_output',
          readOnly: true,
          help: 'Kitöltések × Egy konverzió értéke',
          calculate: (data) => {
            const conversions = Number(data.conversions) || 0;
            const valuePerConv = Number(data.valuePerConversion) || 0;
            return (conversions * valuePerConv).toFixed(0);
          }
        }
      ]
    },
    dataSources: [
      { value: 'google-analytics', label: 'Google Analytics' },
      { value: 'meta-pixel', label: 'Meta Pixel' },
      { value: 'custom-api', label: 'Egyedi API' }
    ]
  },

  email: {
    properties: {
      id: 'properties',
      label: 'Tulajdonságok',
      fields: [
        { id: 'label', label: 'Címke', type: 'text', required: true },
        { id: 'customText', label: 'Egyedi leírás', type: 'textarea' },
        { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
        {
          id: 'revenueMode',
          label: 'Bevétel típusa',
          type: 'select',
          help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
          options: [
            { value: 'assisted', label: 'Közvetve hoz bevételt (assisted)' },
            { value: 'direct', label: 'Ez közvetlenül pénzt termel' },
            { value: 'none', label: 'Nincs bevétel' }
          ]
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Email adatok',
      fields: [
        { id: 'campaignName', label: 'Kampány neve', type: 'text', placeholder: 'pl. Üdvözlő sorozat' },
        {
          id: 'sequenceType',
          label: 'Automatizáció típusa',
          type: 'select',
          options: [
            { value: 'newsletter', label: 'Hírlevél' },
            { value: 'sequence', label: 'Email sorozat' },
            { value: 'followup', label: 'Follow-up' }
          ]
        },
        {
          id: 'dataSource',
          label: 'Adatforrás',
          type: 'select',
          options: [
            { value: 'mailchimp', label: 'Mailchimp' },
            { value: 'activecampaign', label: 'ActiveCampaign' },
            { value: 'custom-api', label: 'Egyedi API' }
          ]
        }
      ]
    },
    metrics: {
      id: 'metrics',
      label: 'Email mutatók',
      fields: [
        {
          id: 'emailsSent',
          label: 'Kiküldött emailek',
          type: 'number',
          role: 'interaction_output',
          help: 'Összes kiküldött email',
          placeholder: '0'
        },
        {
          id: 'opens',
          label: 'Megnyitások',
          type: 'number',
          role: 'visits_input',
          help: 'Hányan nyitották meg az emailt',
          placeholder: '0'
        },
        {
          id: 'clicks',
          label: 'Kattintások',
          type: 'number',
          role: 'conversion_output',
          help: 'Email-ben lévő linkre kattintások',
          placeholder: '0'
        },
        {
          id: 'valuePerConversion',
          label: 'Egy kattintás értéke',
          type: 'currency',
          suffix: 'Ft',
          role: 'value_per_conversion',
          help: 'Mennyit ér számodra 1 kattintás Ft-ban',
          placeholder: '0',
          step: 100
        },
        {
          id: 'clickRate',
          label: 'Click Rate',
          type: 'percentage',
          suffix: '%',
          role: 'rate_output',
          readOnly: true,
          help: '(Kattintások / Kiküldött emailek) × 100',
          calculate: (data) => {
            const emailsSent = Number(data.emailsSent) || 0;
            const clicks = Number(data.clicks) || 0;
            return emailsSent > 0 ? ((clicks / emailsSent) * 100).toFixed(2) : '0.00';
          }
        },
        {
          id: 'estimatedRevenue',
          label: 'Becsült bevétel',
          type: 'currency',
          suffix: 'Ft',
          role: 'revenue_output',
          readOnly: true,
          help: 'Kattintások × Egy kattintás értéke',
          calculate: (data) => {
            const clicks = Number(data.clicks) || 0;
            const valuePerConv = Number(data.valuePerConversion) || 0;
            return (clicks * valuePerConv).toFixed(0);
          }
        }
      ]
    },
    dataSources: [
      { value: 'mailchimp', label: 'Mailchimp' },
      { value: 'activecampaign', label: 'ActiveCampaign' },
      { value: 'custom-api', label: 'Egyedi API' }
    ]
  },

  offer: {
    properties: {
      id: 'properties',
      label: 'Tulajdonságok',
      fields: [
        { id: 'label', label: 'Címke', type: 'text', required: true },
        { id: 'customText', label: 'Egyedi leírás', type: 'textarea' },
        { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
        {
          id: 'revenueMode',
          label: 'Bevétel típusa',
          type: 'select',
          help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
          options: [
            { value: 'assisted', label: 'Közvetve hoz bevételt (assisted)' },
            { value: 'direct', label: 'Ez közvetlenül pénzt termel (aláírt szerződés)' },
            { value: 'none', label: 'Nincs bevétel' }
          ]
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Ajánlat adatok',
      fields: [
        { id: 'dealName', label: 'Ajánlat / Ügyfél neve', type: 'text', placeholder: 'pl. XYZ Company proposal' },
        {
          id: 'status',
          label: 'Státusz',
          type: 'select',
          options: [
            { value: 'sent', label: 'Kiküldve' },
            { value: 'in-progress', label: 'Folyamatban' },
            { value: 'accepted', label: 'Elfogadva' },
            { value: 'rejected', label: 'Elutasítva' }
          ]
        },
        {
          id: 'dataSource',
          label: 'CRM forrás',
          type: 'select',
          options: [
            { value: 'pipedrive', label: 'Pipedrive' },
            { value: 'hubspot', label: 'HubSpot' },
            { value: 'custom-api', label: 'Egyedi API' }
          ]
        }
      ]
    },
    metrics: {
      id: 'metrics',
      label: 'Ajánlat mutatók',
      fields: [
        {
          id: 'offersSent',
          label: 'Kiküldött ajánlatok',
          type: 'number',
          role: 'interaction_output',
          help: 'Összes kiküldött ajánlat / proposal',
          placeholder: '0'
        },
        {
          id: 'offersAccepted',
          label: 'Elfogadott ajánlatok',
          type: 'number',
          role: 'conversion_output',
          help: 'Sikeres, aláírt ajánlatok száma',
          placeholder: '0'
        },
        {
          id: 'valuePerConversion',
          label: 'Átlagos ajánlat értéke',
          type: 'currency',
          suffix: 'Ft',
          role: 'value_per_conversion',
          help: 'Egy elfogadott ajánlat átlagos értéke Ft-ban',
          placeholder: '0',
          step: 1000
        },
        {
          id: 'acceptRate',
          label: 'Elfogadási arány',
          type: 'percentage',
          suffix: '%',
          role: 'rate_output',
          readOnly: true,
          help: '(Elfogadott ajánlatok / Kiküldött ajánlatok) × 100',
          calculate: (data) => {
            const offersSent = Number(data.offersSent) || 0;
            const offersAccepted = Number(data.offersAccepted) || 0;
            return offersSent > 0 ? ((offersAccepted / offersSent) * 100).toFixed(2) : '0.00';
          }
        },
        {
          id: 'estimatedRevenue',
          label: 'Becsült bevétel',
          type: 'currency',
          suffix: 'Ft',
          role: 'revenue_output',
          readOnly: true,
          help: 'Elfogadott ajánlatok × Átlagos ajánlat értéke',
          calculate: (data) => {
            const offersAccepted = Number(data.offersAccepted) || 0;
            const valuePerConv = Number(data.valuePerConversion) || 0;
            return (offersAccepted * valuePerConv).toFixed(0);
          }
        }
      ]
    }
  },

  checkout: {
    properties: {
      id: 'properties',
      label: 'Tulajdonságok',
      fields: [
        { id: 'label', label: 'Címke', type: 'text', required: true },
        { id: 'customText', label: 'Egyedi leírás', type: 'textarea' },
        { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
        {
          id: 'revenueMode',
          label: 'Bevétel típusa',
          type: 'select',
          help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
          options: [
            { value: 'direct', label: 'Közvetlen bevétel (tranzakció)' },
            { value: 'assisted', label: 'Közvetve hoz bevételt' },
            { value: 'none', label: 'Nincs bevétel' }
          ]
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Pénztár adatok',
      fields: [
        { id: 'channelName', label: 'Csatorna / Bolt neve', type: 'text', placeholder: 'pl. Shopify webshop' },
        {
          id: 'dataSource',
          label: 'Adatforrás',
          type: 'select',
          options: [
            { value: 'stripe', label: 'Stripe' },
            { value: 'shopify', label: 'Shopify' },
            { value: 'woocommerce', label: 'WooCommerce' },
            { value: 'custom-api', label: 'Egyedi API' }
          ]
        }
      ]
    },
    metrics: {
      id: 'metrics',
      label: 'Pénztár mutatók',
      fields: [
        {
          id: 'visits',
          label: 'Látogatások',
          type: 'number',
          role: 'visits_input',
          help: 'Checkout oldal látogatások',
          placeholder: '0'
        },
        {
          id: 'orders',
          label: 'Rendelések',
          type: 'number',
          role: 'conversion_output',
          help: 'Sikeres vásárlások száma',
          placeholder: '0'
        },
        {
          id: 'valuePerConversion',
          label: 'Átlagos rendelési érték (AOV)',
          type: 'currency',
          suffix: 'Ft',
          role: 'value_per_conversion',
          help: 'Egy rendelés átlagos értéke Ft-ban',
          placeholder: '0',
          step: 100
        },
        {
          id: 'transactionCost',
          label: 'Tranzakciós költség',
          type: 'currency',
          suffix: 'Ft',
          role: 'cost_input',
          help: 'Összes fizetési díj (pl. Stripe fee)',
          placeholder: '0',
          step: 100
        },
        {
          id: 'cr',
          label: 'Konverziós ráta',
          type: 'percentage',
          suffix: '%',
          role: 'rate_output',
          readOnly: true,
          help: '(Rendelések / Látogatások) × 100',
          calculate: (data) => {
            const visits = Number(data.visits) || 0;
            const orders = Number(data.orders) || 0;
            return visits > 0 ? ((orders / visits) * 100).toFixed(2) : '0.00';
          }
        },
        {
          id: 'revenue',
          label: 'Összes bevétel',
          type: 'currency',
          suffix: 'Ft',
          role: 'revenue_output',
          readOnly: true,
          help: 'Rendelések × AOV',
          calculate: (data) => {
            const orders = Number(data.orders) || 0;
            const aov = Number(data.valuePerConversion) || 0;
            return (orders * aov).toFixed(0);
          }
        },
        {
          id: 'roas',
          label: 'ROAS',
          type: 'number',
          role: 'efficiency_output',
          readOnly: true,
          help: 'Return on Ad Spend (később számolva)',
          calculate: () => '0.00'
        }
      ]
    },
    dataSources: [
      { value: 'stripe', label: 'Stripe' },
      { value: 'shopify', label: 'Shopify' },
      { value: 'woocommerce', label: 'WooCommerce' },
      { value: 'custom-api', label: 'Egyedi API' }
    ]
  },

  thank_you: {
    properties: {
      id: 'properties',
      label: 'Tulajdonságok',
      fields: [
        { id: 'label', label: 'Címke', type: 'text', required: true },
        { id: 'customText', label: 'Egyedi leírás', type: 'textarea' },
        { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
        {
          id: 'revenueMode',
          label: 'Bevétel típusa',
          type: 'select',
          help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
          options: [
            { value: 'none', label: 'Nincs bevétel (csak megerősítés)' },
            { value: 'assisted', label: 'Közvetve hoz bevételt (upsell lehetőség)' }
          ]
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Köszönő oldal adatok',
      fields: [
        { id: 'pageName', label: 'Oldal neve', type: 'text', placeholder: 'pl. Sikeres vásárlás köszönő oldal' },
        { id: 'url', label: 'URL', type: 'text', placeholder: 'https://...' },
        { id: 'nextAction', label: 'Következő CTA / ajánlott lépés', type: 'text', placeholder: 'pl. Foglalj konzultációt' }
      ]
    },
    metrics: {
      id: 'metrics',
      label: 'Köszönő oldal mutatók',
      fields: [
        {
          id: 'visits',
          label: 'Megtekintések',
          type: 'number',
          role: 'visits_input',
          help: 'Köszönő oldal megtekintések',
          placeholder: '0'
        },
        {
          id: 'conversions',
          label: 'Teljesített konverziók',
          type: 'number',
          role: 'conversion_output',
          help: 'Opcionális: következő lépésre kattintások',
          placeholder: '0'
        },
        {
          id: 'cr',
          label: 'Konverziós ráta',
          type: 'percentage',
          suffix: '%',
          role: 'rate_output',
          readOnly: true,
          help: '(Konverziók / Megtekintések) × 100',
          calculate: (data) => {
            const visits = Number(data.visits) || 0;
            const conversions = Number(data.conversions) || 0;
            return visits > 0 ? ((conversions / visits) * 100).toFixed(2) : '0.00';
          }
        }
      ]
    }
  },

  custom: {
    properties: {
      id: 'properties',
      label: 'Tulajdonságok',
      fields: [
        { id: 'label', label: 'Címke', type: 'text', required: true },
        { id: 'customText', label: 'Egyedi leírás', type: 'textarea' },
        { id: 'notes', label: 'Jegyzetek', type: 'textarea' },
        {
          id: 'revenueMode',
          label: 'Bevétel típusa',
          type: 'select',
          help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
          options: [
            { value: 'none', label: 'Nincs bevétel' },
            { value: 'assisted', label: 'Közvetve hoz bevételt (assisted)' },
            { value: 'direct', label: 'Ez közvetlenül pénzt termel' }
          ]
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Egyedi lépés adatok',
      fields: [
        { id: 'customName', label: 'Node neve', type: 'text', placeholder: 'pl. Webinar esemény' }
      ]
    },
    metrics: {
      id: 'metrics',
      label: 'Egyedi metrikák',
      fields: [
        {
          id: 'customMetrics',
          label: 'Egyéni metrikák',
          type: 'text',
          role: 'custom',
          help: 'Használd a + Metrika hozzáadása gombot dinamikus mezők létrehozásához',
          placeholder: 'Nincs egyéni metrika'
        }
      ]
    }
  }
};

// Get node schema by type
export function getNodeSchema(nodeType: NodeType): NodeSchema | undefined {
  return nodeSchemas[nodeType];
}

// Find field by role in schema
export function findFieldByRole(schema: NodeSchema, role: MetricRole): FieldSchema | undefined {
  // Check in metrics first
  if (schema.metrics) {
    const field = schema.metrics.fields.find(f => f.role === role);
    if (field) return field;
  }
  // Then check in meta
  if (schema.meta) {
    const field = schema.meta.fields.find(f => f.role === role);
    if (field) return field;
  }
  // Finally check in properties
  const field = schema.properties.fields.find(f => f.role === role);
  return field;
}
