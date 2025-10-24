import { NodeType, NodeCategory } from './types/canvas';
import type { LucideIcon } from 'lucide-react';
import {
  Rocket, Mail, FileText, ShoppingCart, PartyPopper, MessageSquare, Box
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
  metricsVisible: boolean;
}

export const nodeDefinitions: NodeDefinition[] = [
  {
    type: 'traffic',
    label: 'Forgalom',
    icon: Rocket,
    description: 'Hirdetések, organikus forgalom, marketing kampányok',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'landing',
    label: 'Landoló oldal',
    icon: FileText,
    description: 'Értékesítési oldal, űrlap, regisztráció',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email kampány, automatizáció, hírlevél',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'offer',
    label: 'Ajánlat',
    icon: MessageSquare,
    description: 'Ajánlatküldés, proposal, deal',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'checkout',
    label: 'Pénztár',
    icon: ShoppingCart,
    description: 'Fizetés, vásárlás, rendelés',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'thank_you',
    label: 'Köszönő oldal',
    icon: PartyPopper,
    description: 'Megerősítés, sikeres vásárlás',
    category: 'core',
    metricsVisible: true
  },
  {
    type: 'custom',
    label: 'Egyedi',
    icon: Box,
    description: 'Saját lépés, bármilyen más folyamat',
    category: 'core',
    metricsVisible: true
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
