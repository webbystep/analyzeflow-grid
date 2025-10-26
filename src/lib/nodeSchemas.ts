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
  traffic: {
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
          id: 'customText', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Rövid leírás erről a forgalomforrásról...',
          help: 'Részletes információk a node-ról'
        },
        { 
          id: 'notes', 
          label: 'Jegyzetek', 
          type: 'textarea',
          placeholder: 'Belső jegyzetek, megjegyzések...',
          help: 'Privát jegyzetek a saját használatodra'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Forgalom információk',
      fields: [
        { 
          id: 'sourceName', 
          label: 'Forrás neve', 
          type: 'text',
          placeholder: 'pl. Facebook Ads, Google Ads, Organikus',
          help: 'A forgalom forrásának neve'
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
  
  landing: {
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
          id: 'customText', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'A landing oldal célja és tartalma...',
          help: 'Részletes leírás'
        },
        { 
          id: 'notes', 
          label: 'Jegyzetek', 
          type: 'textarea',
          placeholder: 'Jegyzetek...',
          help: 'Belső megjegyzések'
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
          id: 'headline', 
          label: 'Főcím', 
          type: 'text',
          placeholder: 'Az oldal fő címe',
          help: 'A landing page headline szövege'
        },
        { 
          id: 'cta', 
          label: 'CTA gomb', 
          type: 'text',
          placeholder: 'pl. Regisztrálok most',
          help: 'Call-to-action gomb szövege'
        }
      ]
    }
  },
  
  email: {
    properties: {
      id: 'properties',
      label: 'Alapadatok',
      fields: [
        { 
          id: 'label', 
          label: 'Címke', 
          type: 'text', 
          required: true,
          placeholder: 'pl. Üdvözlő Email',
          help: 'Az email kampány neve'
        },
        { 
          id: 'customText', 
          label: 'Leírás', 
          type: 'textarea',
          placeholder: 'Az email célja és tartalma...',
          help: 'Email leírása'
        },
        { 
          id: 'notes', 
          label: 'Jegyzetek', 
          type: 'textarea',
          placeholder: 'Jegyzetek...',
          help: 'Belső jegyzetek'
        }
      ]
    },
    meta: {
      id: 'meta',
      label: 'Email adatok',
      fields: [
        { 
          id: 'subject', 
          label: 'Tárgy', 
          type: 'text',
          placeholder: 'Email tárgya',
          help: 'Az email subject line-ja'
        },
        { 
          id: 'sender', 
          label: 'Feladó', 
          type: 'text',
          placeholder: 'pl. info@example.com',
          help: 'Feladó email címe vagy neve'
        },
        { 
          id: 'timing', 
          label: 'Időzítés', 
          type: 'text',
          placeholder: 'pl. Azonnal, 2 nap múlva',
          help: 'Mikor kerül kiküldésre'
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
          placeholder: 'Az ajánlat részletei...',
          help: 'Ajánlat leírása'
        },
        { 
          id: 'notes', 
          label: 'Jegyzetek', 
          type: 'textarea',
          placeholder: 'Jegyzetek...',
          help: 'Belső jegyzetek'
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
          placeholder: 'A checkout folyamat leírása...',
          help: 'Checkout részletei'
        },
        { 
          id: 'notes', 
          label: 'Jegyzetek', 
          type: 'textarea',
          placeholder: 'Jegyzetek...',
          help: 'Belső jegyzetek'
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
          placeholder: 'Az oldal tartalma...',
          help: 'Thank you page részletei'
        },
        { 
          id: 'notes', 
          label: 'Jegyzetek', 
          type: 'textarea',
          placeholder: 'Jegyzetek...',
          help: 'Belső jegyzetek'
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
          placeholder: 'Ennek a lépésnek a leírása...',
          help: 'Részletes leírás'
        },
        { 
          id: 'notes', 
          label: 'Jegyzetek', 
          type: 'textarea',
          placeholder: 'Jegyzetek...',
          help: 'Belső jegyzetek'
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
