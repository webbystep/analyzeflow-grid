import { NodeType } from './types/canvas';

export interface FieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'toggle';
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
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
          placeholder: 'Pl. Facebook Ads, Google Ads, Partner ajánlás',
          help: 'A forgalom forrásának platformja'
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
          placeholder: 'Oldal',
          help: 'A node megjelenített neve (pl. Landing Page, Checkout, Thank You)'
        },
        { 
          id: 'description', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Az oldal, ahol a látogatók érkeznek vagy továbblépnek a tölcsérben.',
          help: 'Részletes leírás az oldal céljáról és funkciójáról'
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
          placeholder: 'https://példa.hu/landing',
          help: 'Az oldal URL címe (opcionális, későbbi analitikához hasznos)',
          required: false
        },
        { 
          id: 'goalType', 
          label: 'Cél', 
          type: 'select',
          placeholder: 'Válassz célt...',
          help: 'Mi az oldal célja? (Nem kötelező, csak címkézéshez)',
          required: false,
          options: [
            { value: 'lead', label: 'Ügyfélszerzés / Lead' },
            { value: 'checkout', label: 'Vásárlás / Fizetés' },
            { value: 'thankyou', label: 'Köszönő oldal / megerősítés' },
            { value: 'upsell', label: 'Upsell / ráadás ajánlat' },
            { value: 'custom', label: 'Egyéb / custom' }
          ]
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
          placeholder: 'Művelet',
          help: 'A művelet megjelenített neve (pl. Email küldés, Webhook hívás)'
        },
        { 
          id: 'description', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Automatizált vagy manuális lépés a tölcsérben, például e-mail küldés vagy egyedi akció.',
          help: 'Részletes leírás a művelet céljáról'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Művelet információk',
      fields: [
        { 
          id: 'actionType', 
          label: 'Művelet típusa', 
          type: 'select',
          placeholder: 'Válassz művelet típust...',
          help: 'Milyen típusú művelet ez?',
          required: false,
          options: [
            { value: 'email', label: 'E-mail küldés' },
            { value: 'crm', label: 'CRM bejegyzés létrehozása / frissítés' },
            { value: 'webhook', label: 'Webhook hívás' },
            { value: 'custom', label: 'Egyedi művelet' }
          ]
        }
      ]
    }
  },
  
  offer: {
    properties: {
      id: 'properties',
      label: 'Alapadatok',
      fields: [
        { 
          id: 'label', 
          label: 'Címke', 
          type: 'text', 
          required: true,
          placeholder: 'pl. Ajánlat küldés',
          help: 'Az ajánlat neve'
        },
        { 
          id: 'customText', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Ajánlatküldés vagy promóciós lépés, amely a potenciális ügyfelet döntési helyzetbe hozza.',
          help: 'Ajánlat leírása'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Ajánlat adatok',
      fields: [
        { 
          id: 'offerType', 
          label: 'Ajánlat típusa', 
          type: 'text',
          placeholder: 'pl. Proposal, Quote, Deal',
          help: 'Milyen típusú ajánlat'
        },
        { 
          id: 'validUntil', 
          label: 'Érvényesség', 
          type: 'text',
          placeholder: 'pl. 30 nap',
          help: 'Meddig érvényes az ajánlat'
        },
        { 
          id: 'deliveryMethod', 
          label: 'Kézbesítés módja', 
          type: 'text',
          placeholder: 'pl. Email, Személyesen',
          help: 'Hogyan jut el az ajánlat'
        }
      ]
    }
  },
  
  checkout: {
    properties: {
      id: 'properties',
      label: 'Alapadatok',
      fields: [
        { 
          id: 'label', 
          label: 'Címke', 
          type: 'text', 
          required: true,
          placeholder: 'pl. Pénztár',
          help: 'A checkout lépés neve'
        },
        { 
          id: 'customText', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'A vásárlási folyamat utolsó lépése. Itt történik a konverzió – rendelés vagy fizetés leadása.',
          help: 'Checkout részletei'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Pénztár adatok',
      fields: [
        { 
          id: 'paymentMethods', 
          label: 'Fizetési módok', 
          type: 'text',
          placeholder: 'pl. Kártya, PayPal, Átutalás',
          help: 'Elérhető fizetési lehetőségek'
        },
        { 
          id: 'checkoutType', 
          label: 'Checkout típusa', 
          type: 'text',
          placeholder: 'pl. Egy lépéses, Többlépéses',
          help: 'A checkout folyamat típusa'
        },
        { 
          id: 'gateway', 
          label: 'Fizetési kapu', 
          type: 'text',
          placeholder: 'pl. Stripe, SimplePay',
          help: 'Használt fizetési szolgáltató'
        }
      ]
    }
  },
  
  thank_you: {
    properties: {
      id: 'properties',
      label: 'Alapadatok',
      fields: [
        { 
          id: 'label', 
          label: 'Címke', 
          type: 'text', 
          required: true,
          placeholder: 'pl. Köszönő oldal',
          help: 'A thank you page neve'
        },
        { 
          id: 'customText', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Visszajelző oldal sikeres művelet után. Megerősíti a bizalmat és lehetőséget ad upsell-re.',
          help: 'Thank you page részletei'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Oldal adatok',
      fields: [
        { 
          id: 'confirmationMessage', 
          label: 'Megerősítő üzenet', 
          type: 'textarea',
          placeholder: 'Köszönjük a vásárlást!',
          help: 'Az oldalon megjelenő üzenet'
        },
        { 
          id: 'nextSteps', 
          label: 'Következő lépések', 
          type: 'textarea',
          placeholder: 'Mit tegyen a felhasználó ezután',
          help: 'Útmutatás a következő lépésekhez'
        },
        { 
          id: 'upsellOffer', 
          label: 'Upsell ajánlat', 
          type: 'text',
          placeholder: 'További termék ajánlás',
          help: 'Opcionális további ajánlat'
        }
      ]
    }
  },
  
  custom: {
    properties: {
      id: 'properties',
      label: 'Alapadatok',
      fields: [
        { 
          id: 'label', 
          label: 'Címke', 
          type: 'text', 
          required: true,
          placeholder: 'Egyedi lépés neve',
          help: 'A node megjelenített neve'
        },
        { 
          id: 'customText', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Saját lépés, ami nem illik a standard funnel elemek közé. Használd egyedi célokra.',
          help: 'Részletes leírás'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'További információk',
      fields: [
        { 
          id: 'stepType', 
          label: 'Lépés típusa', 
          type: 'text',
          placeholder: 'pl. Webinárium, Konzultáció',
          help: 'Milyen típusú lépés ez'
        },
        { 
          id: 'details', 
          label: 'Részletek', 
          type: 'textarea',
          placeholder: 'További részletek...',
          help: 'Bármilyen egyéb információ'
        }
      ]
    }
  }
};

export function getNodeSchema(nodeType: NodeType): NodeSchema | undefined {
  return nodeSchemas[nodeType];
}

// Segédfüggvény alapértelmezett leírás lekéréséhez
export function getDefaultDescription(nodeType: NodeType): string {
  const schema = nodeSchemas[nodeType];
  const descriptionField = schema?.properties?.fields.find(f => f.id === 'customText');
  return descriptionField?.placeholder || '';
}
