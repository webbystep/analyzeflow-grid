import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';

interface MetricsFlowIndicatorProps {
  visits?: number;
  conversions?: number;
  revenue?: number;
  conversionRate?: number;
  compact?: boolean;
}

export const MetricsFlowIndicator = memo(({
  visits,
  conversions,
  revenue,
  conversionRate,
  compact = false,
}: MetricsFlowIndicatorProps) => {
  if (!visits && !conversions && !revenue) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs">
        {visits && (
          <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
            <Users className="w-3 h-3 mr-1" />
            {visits.toLocaleString()}
          </Badge>
        )}
        {revenue && (
          <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
            <DollarSign className="w-3 h-3 mr-1" />
            ${revenue.toLocaleString()}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1 text-xs font-mono">
      {visits !== undefined && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            Visits
          </span>
          <span className="font-medium">{visits.toLocaleString()}</span>
        </div>
      )}
      
      {conversions !== undefined && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Conv.
          </span>
          <span className="font-medium">{conversions.toLocaleString()}</span>
        </div>
      )}

      {conversionRate !== undefined && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Rate
          </span>
          <span className="font-medium">{conversionRate.toFixed(1)}%</span>
        </div>
      )}

      {revenue !== undefined && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Revenue
          </span>
          <span className="font-medium text-success">${revenue.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
});

MetricsFlowIndicator.displayName = 'MetricsFlowIndicator';
