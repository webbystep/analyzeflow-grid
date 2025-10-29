import { NodeType, NodeCategory } from './types/canvas';
import * as Phosphor from '@phosphor-icons/react';

export const nodeCategories: NodeCategory[] = [
  {
    id: 'core',
    name: 'Alap Node-ok',
    description: '7 rugalmas node típus minden funnel lépéshez',
    color: '215 16% 65%',
    icon: 'Cube'
  }
];

export interface NodeDefinition {
  type: NodeType;
  label: string;
  icon: any; // Phosphor icon component
  description: string;
  category: string;
  color?: string;
}

export const nodeDefinitions: NodeDefinition[] = [
  {
    type: 'source',
    label: 'Forrás',
    icon: Phosphor.Rocket,
    description: 'Hirdetések, kampányok és források, amelyek a látogatókat a tölcsér elejére irányítják.',
    category: 'core',
    color: '210 100% 60%' // vibrant blue
  },
  {
    type: 'page',
    label: 'Oldal',
    icon: Phosphor.Browser,
    description: 'Oldal vagy felület a tölcsérben (pl. landoló oldal, ajánlat oldal, checkout, köszönő oldal).',
    category: 'core',
    color: '150 70% 50%' // vibrant green
  },
  {
    type: 'email',
    label: 'E-mail',
    icon: Phosphor.Envelope,
    description: 'Email kampányok, automatikus üzenetek és követő sorozatok.',
    category: 'core',
    color: '280 65% 60%' // vibrant purple
  },
  {
    type: 'offer',
    label: 'Ajánlat',
    icon: Phosphor.Gift,
    description: 'Konkrét ajánlatok, leadmágnesek és bónuszok, amelyeket felkínálsz.',
    category: 'core',
    color: '30 90% 55%' // vibrant orange
  },
  {
    type: 'checkout',
    label: 'Pénztár',
    icon: Phosphor.ShoppingCart,
    description: 'Fizetési pontok, kosár oldalak és rendelési folyamatok.',
    category: 'core',
    color: '340 75% 55%' // vibrant red
  },
  {
    type: 'thank_you',
    label: 'Köszönőoldal',
    icon: Phosphor.CheckCircle,
    description: 'Sikeresen teljesített lépések és megerősítő oldalak.',
    category: 'core',
    color: '170 60% 50%' // vibrant teal
  },
  {
    type: 'custom',
    label: 'Egyéni',
    icon: Phosphor.Lightning,
    description: 'Bármilyen egyedi lépés, folyamat vagy node, ami nem tartozik a fenti kategóriákba.',
    category: 'core',
    color: '215 16% 65%' // neutral gray
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
