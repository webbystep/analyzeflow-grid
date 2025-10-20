import { Node } from '@xyflow/react';

export interface FunnelMetrics {
  totalVisits: number;
  totalConversions: number;
  totalRevenue: number;
  averageConversionRate: number;
  averageOrderValue: number;
}

export function calculateFunnelMetrics(nodes: Node[]): FunnelMetrics {
  let totalVisits = 0;
  let totalConversions = 0;
  let totalRevenue = 0;
  let nodesWithConversion = 0;
  let sumConversionRate = 0;
  let nodesWithAOV = 0;
  let sumAOV = 0;

  nodes.forEach((node) => {
    const data = node.data as any;
    
    if (data.visits) {
      totalVisits += data.visits;
    }
    
    if (data.conversions) {
      totalConversions += data.conversions;
    }
    
    if (data.revenue) {
      totalRevenue += data.revenue;
    }
    
    if (data.conversionRate !== undefined && data.conversionRate !== null) {
      sumConversionRate += data.conversionRate;
      nodesWithConversion++;
    }
    
    if (data.averageOrderValue) {
      sumAOV += data.averageOrderValue;
      nodesWithAOV++;
    }
  });

  return {
    totalVisits,
    totalConversions,
    totalRevenue,
    averageConversionRate: nodesWithConversion > 0 ? sumConversionRate / nodesWithConversion : 0,
    averageOrderValue: nodesWithAOV > 0 ? sumAOV / nodesWithAOV : 0,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('hu-HU').format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
