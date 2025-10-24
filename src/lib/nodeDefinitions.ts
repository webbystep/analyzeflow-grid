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
    color: '199 89% 48%',
    metricsVisible: true
  },
  {
    type: 'landing',
    label: 'Landoló oldal',
    icon: FileText,
    description: 'Értékesítési oldal, űrlap, regisztráció',
    category: 'core',
    color: '145 50% 58%',
    metricsVisible: true
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email kampány, automatizáció, hírlevél',
    category: 'core',
    color: '267 48% 63%',
    metricsVisible: true
  },
  {
    type: 'offer',
    label: 'Ajánlat',
    icon: MessageSquare,
    description: 'Ajánlatküldés, proposal, deal',
    category: 'core',
    color: '44 87% 61%',
    metricsVisible: true
  },
  {
    type: 'checkout',
    label: 'Pénztár',
    icon: ShoppingCart,
    description: 'Fizetés, vásárlás, rendelés',
    category: 'core',
    color: '0 79% 63%',
    metricsVisible: true
  },
  {
    type: 'thank_you',
    label: 'Köszönő oldal',
    icon: PartyPopper,
    description: 'Megerősítés, sikeres vásárlás',
    category: 'core',
    color: '195 91% 66%',
    metricsVisible: true
  },
  {
    type: 'custom',
    label: 'Egyedi',
    icon: Box,
    description: 'Saját lépés, bármilyen más folyamat',
    category: 'core',
    color: '0 0% 51%',
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
