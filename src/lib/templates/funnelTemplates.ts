import { Node, Edge } from '@xyflow/react';

export interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'saas' | 'leadgen' | 'webinar' | 'custom';
  nodes: Array<{
    type: string;
    label: string;
    position: { x: number; y: number };
    data: {
      customText?: string;
      visits?: number;
      conversionRate?: number;
      averageOrderValue?: number;
    };
  }>;
  edges: Array<{
    source: string;
    target: string;
  }>;
}

export const funnelTemplates: FunnelTemplate[] = [
  {
    id: 'ecommerce-basic',
    name: 'E-commerce Checkout',
    description: 'Simple product purchase funnel',
    category: 'ecommerce',
    nodes: [
      {
        type: 'traffic',
        label: 'Facebook Ads',
        position: { x: 250, y: 50 },
        data: { visits: 10000, conversionRate: 5 },
      },
      {
        type: 'landing',
        label: 'Product Page',
        position: { x: 250, y: 150 },
        data: { visits: 500, conversionRate: 30 },
      },
      {
        type: 'checkout',
        label: 'Checkout',
        position: { x: 250, y: 250 },
        data: { visits: 150, conversionRate: 60, averageOrderValue: 79 },
      },
      {
        type: 'thankyou',
        label: 'Thank You',
        position: { x: 250, y: 350 },
        data: { visits: 90 },
      },
    ],
    edges: [
      { source: '0', target: '1' },
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'saas-trial',
    name: 'SaaS Free Trial',
    description: 'Free trial to paid conversion',
    category: 'saas',
    nodes: [
      {
        type: 'traffic',
        label: 'Google Ads',
        position: { x: 250, y: 50 },
        data: { visits: 5000, conversionRate: 8 },
      },
      {
        type: 'landing',
        label: 'Landing Page',
        position: { x: 250, y: 150 },
        data: { visits: 400, conversionRate: 45 },
      },
      {
        type: 'email',
        label: 'Trial Signup Email',
        position: { x: 250, y: 250 },
        data: { visits: 180, conversionRate: 70 },
      },
      {
        type: 'checkout',
        label: 'Upgrade Page',
        position: { x: 250, y: 350 },
        data: { visits: 126, conversionRate: 25, averageOrderValue: 49 },
      },
      {
        type: 'thankyou',
        label: 'Welcome Email',
        position: { x: 250, y: 450 },
        data: { visits: 32 },
      },
    ],
    edges: [
      { source: '0', target: '1' },
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
    ],
  },
  {
    id: 'leadgen-webinar',
    name: 'Webinar Lead Gen',
    description: 'Webinar registration to sale',
    category: 'webinar',
    nodes: [
      {
        type: 'traffic',
        label: 'Email Campaign',
        position: { x: 100, y: 50 },
        data: { visits: 8000, conversionRate: 12 },
      },
      {
        type: 'traffic',
        label: 'Social Media',
        position: { x: 400, y: 50 },
        data: { visits: 3000, conversionRate: 8 },
      },
      {
        type: 'landing',
        label: 'Webinar Registration',
        position: { x: 250, y: 200 },
        data: { visits: 1200, conversionRate: 40 },
      },
      {
        type: 'email',
        label: 'Reminder Sequence',
        position: { x: 250, y: 300 },
        data: { visits: 480, conversionRate: 65 },
      },
      {
        type: 'landing',
        label: 'Live Webinar',
        position: { x: 250, y: 400 },
        data: { visits: 312, conversionRate: 35 },
      },
      {
        type: 'checkout',
        label: 'Offer Page',
        position: { x: 250, y: 500 },
        data: { visits: 109, conversionRate: 45, averageOrderValue: 497 },
      },
      {
        type: 'thankyou',
        label: 'Purchase Confirmation',
        position: { x: 250, y: 600 },
        data: { visits: 49 },
      },
    ],
    edges: [
      { source: '0', target: '2' },
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
      { source: '4', target: '5' },
      { source: '5', target: '6' },
    ],
  },
  {
    id: 'leadgen-simple',
    name: 'Lead Magnet Funnel',
    description: 'Free download to email list',
    category: 'leadgen',
    nodes: [
      {
        type: 'traffic',
        label: 'Organic Traffic',
        position: { x: 250, y: 50 },
        data: { visits: 2000, conversionRate: 15 },
      },
      {
        type: 'landing',
        label: 'Lead Magnet Page',
        position: { x: 250, y: 150 },
        data: { visits: 300, conversionRate: 50 },
      },
      {
        type: 'email',
        label: 'Welcome Email',
        position: { x: 250, y: 250 },
        data: { visits: 150, conversionRate: 80 },
      },
      {
        type: 'thankyou',
        label: 'Thank You Page',
        position: { x: 250, y: 350 },
        data: { visits: 120 },
      },
    ],
    edges: [
      { source: '0', target: '1' },
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'custom-flow',
    name: 'Egyedi folyamat sablon',
    description: 'Kiindulási pont egyedi folyamatokhoz',
    category: 'custom',
    nodes: [
      {
        type: 'custom',
        label: 'Első lépés',
        position: { x: 250, y: 50 },
        data: {
          customText: 'Írd le a folyamat első lépését',
          visits: 1000,
        },
      },
      {
        type: 'custom',
        label: 'Második lépés',
        position: { x: 250, y: 200 },
        data: {
          customText: 'Kapcsolatfelvétel vagy szűrés',
          visits: 700,
          conversionRate: 70,
        },
      },
      {
        type: 'custom',
        label: 'Végső cél',
        position: { x: 250, y: 350 },
        data: {
          customText: 'Lezárt ügyletek vagy konverziók',
          visits: 490,
          conversionRate: 70,
          averageOrderValue: 10000,
        },
      },
    ],
    edges: [
      { source: '0', target: '1' },
      { source: '1', target: '2' },
    ],
  },
];

export function createNodesFromTemplate(template: FunnelTemplate): { nodes: Node[]; edges: Edge[] } {
  const nodes = template.nodes.map((node, index) => ({
    id: crypto.randomUUID(),
    type: node.type,
    position: node.position,
    data: {
      label: node.label,
      ...node.data,
      // Calculate derived metrics
      conversions: node.data.visits && node.data.conversionRate 
        ? Math.round((node.data.visits * node.data.conversionRate) / 100)
        : undefined,
      revenue: node.data.visits && node.data.conversionRate && node.data.averageOrderValue
        ? Math.round((node.data.visits * node.data.conversionRate * node.data.averageOrderValue) / 100)
        : undefined,
    },
  }));

  const edges = template.edges.map((edge, index) => ({
    id: crypto.randomUUID(),
    source: nodes[parseInt(edge.source)].id,
    target: nodes[parseInt(edge.target)].id,
    type: 'smoothstep',
    animated: true,
  }));

  return { nodes, edges };
}
