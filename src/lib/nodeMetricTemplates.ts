// Template-based metric definitions for each node type
import { NodeType } from './types/canvas';

export interface MetricField {
  id: string;
  label: string;
  role: 'visits_input' | 'interaction_output' | 'conversion_output' | 'value_per_conversion' | 'revenue_output' | 'cost_input' | 'cost_total' | 'custom';
  editable: boolean;
  type?: 'number' | 'currency' | 'percentage';
  suffix?: string;
  help?: string;
  calculate?: (data: Record<string, any>) => string | number;
}

export const NODE_METRIC_TEMPLATES: Record<NodeType, MetricField[]> = {
  traffic: [
    { id: 'impressions', label: 'Megjelenések', role: 'visits_input', editable: true, type: 'number', help: 'Hirdetés megjelenések száma' },
    { id: 'clicks', label: 'Kattintások', role: 'interaction_output', editable: true, type: 'number', help: 'Kattintások száma' },
    { id: 'cpc', label: 'Költség/kattintás', role: 'cost_input', editable: true, type: 'currency', suffix: 'Ft', help: 'Egy kattintás ára' },
    { 
      id: 'totalCost', 
      label: 'Összes költség', 
      role: 'cost_total', 
      editable: false, 
      type: 'currency', 
      suffix: 'Ft',
      calculate: (data) => {
        const clicks = Number(data.clicks) || 0;
        const cpc = Number(data.cpc) || 0;
        return (clicks * cpc).toFixed(0);
      }
    }
  ],
  
  landing: [
    { id: 'visits', label: 'Látogatások', role: 'visits_input', editable: true, type: 'number', help: 'Oldalmegnyitások száma' },
    { id: 'conversions', label: 'Kitöltések', role: 'conversion_output', editable: true, type: 'number', help: 'Űrlap leadek száma' },
    { id: 'valuePerConversion', label: 'Lead érték', role: 'value_per_conversion', editable: true, type: 'currency', suffix: 'Ft', help: 'Egy lead értéke Ft-ban' },
    { 
      id: 'estimatedRevenue', 
      label: 'Becsült bevétel', 
      role: 'revenue_output', 
      editable: false, 
      type: 'currency', 
      suffix: 'Ft',
      help: 'Konverziók × lead érték',
      calculate: (data) => {
        const convs = Number(data.conversions) || 0;
        const valuePerConv = typeof data.valuePerConversion === 'object' 
          ? Number(data.valuePerConversion?.value) || 0
          : Number(data.valuePerConversion) || 0;
        return (convs * valuePerConv).toFixed(0);
      }
    }
  ],
  
  email: [
    { id: 'emailsSent', label: 'Elküldött emailek', role: 'interaction_output', editable: true, type: 'number', help: 'Kiküldött emailek száma' },
    { id: 'opens', label: 'Megnyitások', role: 'visits_input', editable: true, type: 'number', help: 'Email megnyitások' },
    { id: 'clicks', label: 'Kattintások', role: 'conversion_output', editable: true, type: 'number', help: 'Link kattintások' },
    { id: 'valuePerConversion', label: 'Kattintás értéke', role: 'value_per_conversion', editable: true, type: 'currency', suffix: 'Ft', help: 'Egy kattintás értéke' },
    { 
      id: 'estimatedRevenue', 
      label: 'Becsült bevétel', 
      role: 'revenue_output', 
      editable: false, 
      type: 'currency', 
      suffix: 'Ft',
      calculate: (data) => {
        const clicks = Number(data.clicks) || 0;
        const valuePerConv = typeof data.valuePerConversion === 'object' 
          ? Number(data.valuePerConversion?.value) || 0
          : Number(data.valuePerConversion) || 0;
        return (clicks * valuePerConv).toFixed(0);
      }
    }
  ],
  
  offer: [
    { id: 'offersSent', label: 'Kiküldött ajánlatok', role: 'interaction_output', editable: true, type: 'number', help: 'Elküldött ajánlatok száma' },
    { id: 'offersAccepted', label: 'Elfogadott ajánlatok', role: 'conversion_output', editable: true, type: 'number', help: 'Elfogadott ajánlatok' },
    { id: 'valuePerConversion', label: 'Ajánlat értéke', role: 'value_per_conversion', editable: true, type: 'currency', suffix: 'Ft', help: 'Egy elfogadott ajánlat értéke' },
    { 
      id: 'estimatedRevenue', 
      label: 'Becsült bevétel', 
      role: 'revenue_output', 
      editable: false, 
      type: 'currency', 
      suffix: 'Ft',
      calculate: (data) => {
        const accepted = Number(data.offersAccepted) || 0;
        const valuePerConv = typeof data.valuePerConversion === 'object' 
          ? Number(data.valuePerConversion?.value) || 0
          : Number(data.valuePerConversion) || 0;
        return (accepted * valuePerConv).toFixed(0);
      }
    }
  ],
  
  checkout: [
    { id: 'visits', label: 'Látogatók', role: 'visits_input', editable: true, type: 'number', help: 'Pénztárba lépők száma' },
    { id: 'orders', label: 'Rendelések', role: 'conversion_output', editable: true, type: 'number', help: 'Leadott rendelések' },
    { id: 'valuePerConversion', label: 'AOV', role: 'value_per_conversion', editable: true, type: 'currency', suffix: 'Ft', help: 'Átlagos rendelési érték' },
    { 
      id: 'estimatedRevenue', 
      label: 'Bevétel', 
      role: 'revenue_output', 
      editable: false, 
      type: 'currency', 
      suffix: 'Ft',
      calculate: (data) => {
        const orders = Number(data.orders) || 0;
        const aov = typeof data.valuePerConversion === 'object' 
          ? Number(data.valuePerConversion?.value) || 0
          : Number(data.valuePerConversion) || 0;
        return (orders * aov).toFixed(0);
      }
    }
  ],
  
  thank_you: [
    { id: 'visits', label: 'Megtekintések', role: 'visits_input', editable: true, type: 'number', help: 'Köszönő oldal megtekintések' },
    { id: 'conversions', label: 'Teljesített konverziók', role: 'conversion_output', editable: true, type: 'number', help: 'Sikeres folyamatok' }
  ],
  
  custom: [
    { id: 'customMetrics', label: 'Egyéni metrikák', role: 'custom', editable: true, type: 'number', help: 'Saját metrika meghatározás' }
  ]
};

// Default icons for each node type
export const NODE_DEFAULT_ICONS: Record<NodeType, string> = {
  traffic: 'Rocket',
  landing: 'FileText',
  email: 'Mail',
  offer: 'MessageSquare',
  checkout: 'ShoppingCart',
  thank_you: 'PartyPopper',
  custom: 'Cog'
};

// Get metrics template for a node type
export function getMetricsTemplate(nodeType: NodeType): MetricField[] {
  return NODE_METRIC_TEMPLATES[nodeType] || NODE_METRIC_TEMPLATES.custom;
}

// Get default icon for node type
export function getDefaultIcon(nodeType: NodeType): string {
  return NODE_DEFAULT_ICONS[nodeType] || 'Box';
}
