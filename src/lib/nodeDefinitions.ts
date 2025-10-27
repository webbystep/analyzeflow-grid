import { NodeType, NodeCategory } from './types/canvas';
import type { LucideIcon } from 'lucide-react';
import {
  Rocket, Mail, FileText, ShoppingCart, PartyPopper, MessageSquare, Box,
  Target, Send, DollarSign
} from 'lucide-react';

export const nodeCategories: NodeCategory[] = [
  {
    id: 'core',
    name: 'Alap Node-ok',
    description: '7 rugalmas node típus minden funnel lépéshez',
    color: '215 16% 65%',
    icon: 'Box'
  }
];

export interface NodeDefinition {
  type: NodeType;
  label: string;
  icon: LucideIcon;
  description: string;
  category: string;
  color?: string;
}

export const nodeDefinitions: NodeDefinition[] = [
  {
    type: 'traffic',
    label: 'Forgalom',
    icon: Rocket,
    description: 'Hirdetések, organikus forgalom, marketing kampányok',
    category: 'core',
    color: 'var(--node-traffic)'
  },
  {
    type: 'landing',
    label: 'Landoló oldal',
    icon: Target,
    description: 'Értékesítési oldal, űrlap, regisztráció',
    category: 'core',
    color: 'var(--node-landing)'
  },
  {
    type: 'email',
    label: 'Email',
    icon: Send,
    description: 'Email kampány, automatizáció, hírlevél',
    category: 'core',
    color: 'var(--node-email)'
  },
  {
    type: 'offer',
    label: 'Ajánlat',
    icon: MessageSquare,
    description: 'Ajánlatküldés, proposal, deal',
    category: 'core',
    color: 'var(--node-offer)'
  },
  {
    type: 'checkout',
    label: 'Pénztár',
    icon: DollarSign,
    description: 'Fizetés, vásárlás, rendelés',
    category: 'core',
    color: 'var(--node-checkout)'
  },
  {
    type: 'thank_you',
    label: 'Köszönő oldal',
    icon: PartyPopper,
    description: 'Megerősítés, sikeres vásárlás',
    category: 'core',
    color: 'var(--node-thank_you)'
  },
  {
    type: 'custom',
    label: 'Egyedi',
    icon: Box,
    description: 'Saját lépés, bármilyen más folyamat',
    category: 'core',
    color: 'var(--node-custom)'
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
