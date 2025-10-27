import { NodeType, ActionType } from './types/canvas';

export interface FieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'actionTypeSelect' | 'delayInput';
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  showWhen?: { field: string; value: any }; // conditional rendering
}

export interface SectionSchema {
  id: string;
  label: string;
  fields: FieldSchema[];
}

export interface NodeSchema {
  properties: SectionSchema;
  meta?: SectionSchema;
}

export const nodeSchemas: Record<NodeType, NodeSchema> = {
  source: {
    properties: {
      id: 'properties',
      label: 'Alapadatok',
      fields: [
        { 
          id: 'label', 
          label: 'Címke', 
          type: 'text', 
          required: true,
          placeholder: 'pl. Facebook Ads',
          help: 'A node megjelenített neve a canvason'
        },
        { 
          id: 'description', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Hirdetések, kampányok és források, amelyek a látogatókat a tölcsér elejére irányítják.',
          help: 'Részletes információk a node-ról'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Forrás információk',
      fields: [
        { 
          id: 'platform', 
          label: 'Platform', 
          type: 'text',
          placeholder: 'pl. Facebook Ads, Google Ads, Organikus',
          help: 'A forgalom forrásának platformja'
        },
        { 
          id: 'campaignName', 
          label: 'Kampány neve', 
          type: 'text',
          placeholder: 'pl. Q1 Promóció',
          help: 'Kampány vagy projekt neve'
        },
        { 
          id: 'targetAudience', 
          label: 'Célközönség', 
          type: 'text',
          placeholder: 'pl. 25-45 éves nők',
          help: 'A célzott közönség leírása'
        }
      ]
    }
  },
  
  page: {
    properties: {
      id: 'properties',
      label: 'Alapadatok',
      fields: [
        { 
          id: 'label', 
          label: 'Címke', 
          type: 'text', 
          required: true,
          placeholder: 'pl. Landing Page',
          help: 'A node megjelenített neve'
        },
        { 
          id: 'description', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Az oldal, ahol a látogatók érkeznek vagy továbblépnek a tölcsérben.',
          help: 'Részletes leírás'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Oldal információk',
      fields: [
        { 
          id: 'url', 
          label: 'URL', 
          type: 'text',
          placeholder: 'https://example.com/landing',
          help: 'Az oldal URL címe'
        },
        { 
          id: 'goalType', 
          label: 'Cél típusa', 
          type: 'select',
          placeholder: 'Válassz célt',
          help: 'Az oldal fő célja',
          options: [
            { value: 'lead', label: 'Lead generálás' },
            { value: 'sale', label: 'Értékesítés' },
            { value: 'registration', label: 'Regisztráció' },
            { value: 'engagement', label: 'Elköteleződés' },
            { value: 'other', label: 'Egyéb' }
          ]
        },
        { 
          id: 'headline', 
          label: 'Főcím', 
          type: 'text',
          placeholder: 'Az oldal fő címe',
          help: 'A landing page headline szövege'
        }
      ]
    }
  },
  
  action: {
    properties: {
      id: 'properties',
      label: 'Alapadatok',
      fields: [
        { 
          id: 'label', 
          label: 'Címke', 
          type: 'text', 
          required: true,
          placeholder: 'Művelet neve',
          help: 'A művelet megjelenített neve'
        },
        { 
          id: 'description', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Automatizált vagy logikai lépés a tölcsér folyamatában.',
          help: 'Művelet leírása'
        },
        {
          id: 'actionType',
          label: 'Művelet típusa',
          type: 'actionTypeSelect',
          required: true,
          help: 'Válaszd ki a művelet típusát'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Művelet beállítások',
      fields: [
        // Email specific fields
        { 
          id: 'parameters.subject', 
          label: 'Email tárgy', 
          type: 'text',
          placeholder: 'Email tárgya',
          help: 'Az email subject line-ja',
          showWhen: { field: 'actionType', value: 'email' }
        },
        { 
          id: 'parameters.from', 
          label: 'Feladó', 
          type: 'text',
          placeholder: 'pl. info@example.com',
          help: 'Feladó email címe vagy neve',
          showWhen: { field: 'actionType', value: 'email' }
        },
        { 
          id: 'parameters.timing', 
          label: 'Időzítés', 
          type: 'text',
          placeholder: 'pl. Azonnal, 2 nap múlva',
          help: 'Mikor kerül kiküldésre',
          showWhen: { field: 'actionType', value: 'email' }
        },
        
        // Delay specific fields
        { 
          id: 'parameters.delayTime', 
          label: 'Várakozási idő', 
          type: 'delayInput',
          placeholder: '2',
          help: 'Mennyi ideig várjon a rendszer',
          showWhen: { field: 'actionType', value: 'delay' }
        },
        
        // Condition specific fields
        { 
          id: 'parameters.rule', 
          label: 'Feltétel szabály', 
          type: 'textarea',
          placeholder: 'pl. Megnyitotta az e-mailt?',
          help: 'A feltétel leírása',
          showWhen: { field: 'actionType', value: 'condition' }
        },
        { 
          id: 'parameters.yesLabel', 
          label: 'IGEN ág címke', 
          type: 'text',
          placeholder: 'IGEN',
          help: 'Az igaz ág címkéje',
          showWhen: { field: 'actionType', value: 'condition' }
        },
        { 
          id: 'parameters.noLabel', 
          label: 'NEM ág címke', 
          type: 'text',
          placeholder: 'NEM',
          help: 'A hamis ág címkéje',
          showWhen: { field: 'actionType', value: 'condition' }
        }
      ]
    }
  }
};

export function getNodeSchema(nodeType: NodeType): NodeSchema | undefined {
  return nodeSchemas[nodeType];
}

// Segédfüggvény alapértelmezett leírás lekéréséhez
export function getDefaultDescription(nodeType: NodeType, actionType?: ActionType): string {
  const schema = nodeSchemas[nodeType];
  const descriptionField = schema?.properties?.fields.find(f => f.id === 'description');
  
  // Ha action type van, akkor specifikus leírást adjunk
  if (nodeType === 'action' && actionType) {
    switch (actionType) {
      case 'email':
        return 'Automatizált vagy kampány e-mail, amely a kapcsolatfelvétel után ápolja vagy ösztönzi a leadeket.';
      case 'delay':
        return 'Várakozási idő beiktatása a következő lépés előtt.';
      case 'condition':
        return 'Ágaztatás a tölcsérben – ha igaz, YES ág, ha nem, NO ág.';
      case 'custom':
        return 'Egyedi művelet vagy lépés a folyamatban.';
    }
  }
  
  return descriptionField?.placeholder || '';
}
