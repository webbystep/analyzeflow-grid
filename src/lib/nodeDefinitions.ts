import { NodeType, NodeCategory } from './types/canvas';
import type { LucideIcon } from 'lucide-react';
import {
  // Core icons
  TrendingUp, Mail, FileText, ShoppingCart, PartyPopper, GitBranch, Box,
  // Traffic icons
  Facebook, Chrome, Linkedin, Youtube, Share2, BookOpen, Link2, Store,
  // Conversion icons
  ClipboardList, Phone, Headphones, FileOutput, CheckSquare, TrendingUpIcon, Handshake,
  // Retention icons
  RotateCcw, Gift, Zap, RefreshCw, MessageSquare, Users, XCircle,
  // Automation icons
  Webhook, Database, Settings, Sparkles, Upload,
  // Brand icons
  Globe, Video, HeadphonesIcon, Star, MessageCircle
} from 'lucide-react';

export const nodeCategories: NodeCategory[] = [
  {
    id: 'core',
    name: 'Alap Node-ok',
    description: 'Általános funnel elemek',
    color: '215 16% 65%',
    icon: 'Box'
  },
  {
    id: 'traffic',
    name: 'Traffic / Acquisition',
    description: 'Marketing platformok és forgalmi források',
    color: '220 70% 65%',
    icon: 'TrendingUp'
  },
  {
    id: 'conversion',
    name: 'Conversion / Sales',
    description: 'Értékesítési lépések és konverziós pontok',
    color: '160 55% 60%',
    icon: 'CheckSquare'
  },
  {
    id: 'retention',
    name: 'Retention / Remarketing',
    description: 'Ügyfélmegtartás és újraaktiválás',
    color: '280 60% 65%',
    icon: 'RotateCcw'
  },
  {
    id: 'automation',
    name: 'Automation / Integrations',
    description: 'Technológiai integráció és automatizálás',
    color: '200 60% 60%',
    icon: 'Settings'
  },
  {
    id: 'brand',
    name: 'Brand / Support',
    description: 'Márkaépítés és ügyfélszolgálat',
    color: '30 75% 60%',
    icon: 'Globe'
  }
];

export interface NodeDefinition {
  type: NodeType;
  label: string;
  icon: LucideIcon;
  description: string;
  category: string;
  color?: string;
  metricsVisible: boolean;
}

export const nodeDefinitions: NodeDefinition[] = [
  // Core nodes
  {
    type: 'traffic',
    label: 'Forgalom',
    icon: TrendingUp,
    description: 'Hirdetések, organikus forgalom',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email sorozatok, hírlevelek',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'landing',
    label: 'Landoló oldal',
    icon: FileText,
    description: 'Értékesítési, feliratkozási oldalak',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'checkout',
    label: 'Pénztár',
    icon: ShoppingCart,
    description: 'Fizetés, rendelési űrlapok',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'thankyou',
    label: 'Köszönöm',
    icon: PartyPopper,
    description: 'Megerősítés, sikeres oldalak',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'condition',
    label: 'Feltétel/Elágazás',
    icon: GitBranch,
    description: 'A/B tesztek, feltételes logika',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'custom',
    label: 'Egyedi',
    icon: Box,
    description: 'Saját lépés egyedi leírással',
    category: 'core',
    metricsVisible: true
  },

  // Traffic / Acquisition
  {
    type: 'meta-ads',
    label: 'Meta Ads',
    icon: Facebook,
    description: 'Facebook és Instagram hirdetések',
    category: 'traffic',
    metricsVisible: true
  },
  {
    type: 'google-ads',
    label: 'Google Ads',
    icon: Chrome,
    description: 'Keresési és display hirdetések',
    category: 'traffic',
    metricsVisible: true
  },
  {
    type: 'linkedin-ads',
    label: 'LinkedIn Ads',
    icon: Linkedin,
    description: 'B2B kampányok',
    category: 'traffic',
    metricsVisible: true
  },
  {
    type: 'youtube-ads',
    label: 'YouTube Ads',
    icon: Youtube,
    description: 'Videós funnel entry',
    category: 'traffic',
    metricsVisible: true
  },
  {
    type: 'organic-social',
    label: 'Organic Social',
    icon: Share2,
    description: 'Organikus közösségi forgalom',
    category: 'traffic',
    metricsVisible: true
  },
  {
    type: 'seo-blog',
    label: 'SEO / Blog',
    icon: BookOpen,
    description: 'Tartalom alapú organikus forrás',
    category: 'traffic',
    metricsVisible: true
  },
  {
    type: 'referral',
    label: 'Referral',
    icon: Link2,
    description: 'Partnerlink, affiliate forgalom',
    category: 'traffic',
    metricsVisible: true
  },
  {
    type: 'offline-campaign',
    label: 'Offline Campaign',
    icon: Store,
    description: 'Kiállítás, rendezvény, offline marketing',
    category: 'traffic',
    metricsVisible: true
  },

  // Conversion / Sales
  {
    type: 'lead-form',
    label: 'Lead Form',
    icon: ClipboardList,
    description: 'Online lead űrlap kitöltése',
    category: 'conversion',
    metricsVisible: true
  },
  {
    type: 'contact',
    label: 'Kapcsolatfelvétel',
    icon: Phone,
    description: 'Telefonos vagy email érdeklődés',
    category: 'conversion',
    metricsVisible: true
  },
  {
    type: 'sales-call',
    label: 'Sales Call',
    icon: Headphones,
    description: 'Értékesítői hívás vagy meeting',
    category: 'conversion',
    metricsVisible: true
  },
  {
    type: 'proposal',
    label: 'Ajánlatküldés',
    icon: FileOutput,
    description: 'Ajánlat, árajánlat készítése',
    category: 'conversion',
    metricsVisible: true
  },
  {
    type: 'contract',
    label: 'Szerződéskötés',
    icon: CheckSquare,
    description: 'Deal lezárása, fizetett ügyfél',
    category: 'conversion',
    metricsVisible: true
  },
  {
    type: 'upsell',
    label: 'Up-Sell / Cross-Sell',
    icon: TrendingUpIcon,
    description: 'Kiegészítő értékesítés',
    category: 'conversion',
    metricsVisible: true
  },
  {
    type: 'partner-contact',
    label: 'Partner Contact',
    icon: Handshake,
    description: 'B2B partner érdeklődő',
    category: 'conversion',
    metricsVisible: true
  },

  // Retention / Remarketing
  {
    type: 'remarketing-ads',
    label: 'Remarketing Ads',
    icon: RotateCcw,
    description: 'Újramegkeresés kosárelhagyóknak',
    category: 'retention',
    metricsVisible: true
  },
  {
    type: 'loyalty-program',
    label: 'Loyalty Program',
    icon: Gift,
    description: 'Hűségprogram, pontgyűjtés',
    category: 'retention',
    metricsVisible: true
  },
  {
    type: 'reactivation',
    label: 'Reactivation Campaign',
    icon: Zap,
    description: 'Alvó ügyfelek újraaktiválása',
    category: 'retention',
    metricsVisible: true
  },
  {
    type: 'subscription-renewal',
    label: 'Subscription Renewal',
    icon: RefreshCw,
    description: 'Előfizetés megújítása',
    category: 'retention',
    metricsVisible: true
  },
  {
    type: 'feedback-nps',
    label: 'Feedback / NPS',
    icon: MessageSquare,
    description: 'Elégedettségmérés',
    category: 'retention',
    metricsVisible: false
  },
  {
    type: 'referral-campaign',
    label: 'Referral Campaign',
    icon: Users,
    description: 'Ügyfél hoz ügyfelet',
    category: 'retention',
    metricsVisible: true
  },
  {
    type: 'unsubscribe',
    label: 'Unsubscribe',
    icon: XCircle,
    description: 'Lemorzsolódási pont',
    category: 'retention',
    metricsVisible: true
  },

  // Automation / Integrations
  {
    type: 'webhook-api',
    label: 'Webhook / API',
    icon: Webhook,
    description: 'Automatizált adatkapcsolat',
    category: 'automation',
    metricsVisible: false
  },
  {
    type: 'crm-sync',
    label: 'CRM Sync',
    icon: Database,
    description: 'Lead szinkron CRM-be',
    category: 'automation',
    metricsVisible: false
  },
  {
    type: 'automation-step',
    label: 'Automation Step',
    icon: Settings,
    description: 'Automata workflow lépés',
    category: 'automation',
    metricsVisible: false
  },
  {
    type: 'ai-recommendation',
    label: 'AI Recommendation',
    icon: Sparkles,
    description: 'AI javaslat optimalizálásra',
    category: 'automation',
    metricsVisible: false
  },
  {
    type: 'data-import',
    label: 'Data Import',
    icon: Upload,
    description: 'Valós adatok feltöltése CSV-ből',
    category: 'automation',
    metricsVisible: false
  },

  // Brand / Support
  {
    type: 'brand-awareness',
    label: 'Brand Awareness',
    icon: Globe,
    description: 'PR, márkaismertségi kampány',
    category: 'brand',
    metricsVisible: true
  },
  {
    type: 'webinar-event',
    label: 'Webinar / Event',
    icon: Video,
    description: 'Lead generáló esemény',
    category: 'brand',
    metricsVisible: true
  },
  {
    type: 'customer-support',
    label: 'Customer Support',
    icon: HeadphonesIcon,
    description: 'Ügyfélszolgálati interakció',
    category: 'brand',
    metricsVisible: false
  },
  {
    type: 'review-testimonial',
    label: 'Review / Testimonial',
    icon: Star,
    description: 'Vásárlói vélemény, esettanulmány',
    category: 'brand',
    metricsVisible: false
  },
  {
    type: 'community',
    label: 'Community',
    icon: MessageCircle,
    description: 'Discord / Facebook Group aktivitás',
    category: 'brand',
    metricsVisible: false
  }
];

// Segédfüggvény node definíció lekérdezésére
export function getNodeDefinition(type: NodeType): NodeDefinition | undefined {
  return nodeDefinitions.find(n => n.type === type);
}

// Segédfüggvény kategória lekérdezésére
export function getNodeCategory(categoryId: string): NodeCategory | undefined {
  return nodeCategories.find(c => c.id === categoryId);
}
