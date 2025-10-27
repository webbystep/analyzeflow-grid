import { NodeType } from './types/canvas';
import type { LucideIcon } from 'lucide-react';
import {
  Rocket, FileText, Zap, Clock, GitBranch
} from 'lucide-react';

export const nodeCategories = [
  {
    id: 'core',
    name: 'Alap Node-ok',
    description: '5 rugalmas node típus minden funnel lépéshez',
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
  actionType?: string; // for action nodes
}

// 5 funkcionális node definíció
export const nodeDefinitions: NodeDefinition[] = [
  {
    type: 'source',
    label: 'Forrás',
    icon: Rocket,
    description: 'Hirdetések, kampányok és források, amelyek a látogatókat a tölcsér elejére irányítják.',
    category: 'core',
    color: 'var(--node-source)'
  },
  {
    type: 'page',
    label: 'Oldal',
    icon: FileText,
    description: 'Az oldal, ahol a látogatók érkeznek vagy továbblépnek a tölcsérben.',
    category: 'core',
    color: 'var(--node-page)'
  },
  {
    type: 'action',
    label: 'Művelet',
    icon: Zap,
    description: 'Automatizált vagy logikai lépés a tölcsér folyamatában.',
    category: 'core',
    color: 'var(--node-action)',
    actionType: 'custom'
  },
  {
    type: 'action',
    label: 'Késleltetés',
    icon: Clock,
    description: 'Várakozási idő beiktatása a következő lépés előtt.',
    category: 'core',
    color: 'var(--node-action)',
    actionType: 'delay'
  },
  {
    type: 'action',
    label: 'Feltétel',
    icon: GitBranch,
    description: 'Ágaztatás a tölcsérben – ha igaz, YES ág, ha nem, NO ág.',
    category: 'core',
    color: 'var(--node-action)',
    actionType: 'condition'
  }
];

// Segédfüggvény node definíció lekérdezésére
export function getNodeDefinition(type: NodeType, actionType?: string): NodeDefinition | undefined {
  if (type === 'action' && actionType) {
    return nodeDefinitions.find(n => n.type === 'action' && n.actionType === actionType);
  }
  return nodeDefinitions.find(n => n.type === type && !n.actionType);
}

// Segédfüggvény kategória lekérdezésére
export function getNodeCategory(categoryId: string) {
  return nodeCategories.find(c => c.id === categoryId);
}
