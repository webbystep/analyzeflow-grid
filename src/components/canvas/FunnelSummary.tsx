import { useMemo } from 'react';
import { Node } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface FunnelSummaryProps {
  nodes: Node[];
}

export function FunnelSummary({ nodes }: FunnelSummaryProps) {
  const metrics = useMemo(() => {
    let totalVisits = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let nodeCount = 0;

    nodes.forEach((node) => {
      const data = node.data as any;
      if (data.visits) {
        totalVisits += data.visits;
        nodeCount++;
      }
      if (data.conversions) {
        totalConversions += data.conversions;
      }
      if (data.revenue) {
        totalRevenue += data.revenue;
      }
    });

    const avgConversionRate =
      totalVisits > 0 ? ((totalConversions / totalVisits) * 100).toFixed(2) : '0.00';
    const avgOrderValue =
      totalConversions > 0 ? (totalRevenue / totalConversions).toFixed(2) : '0.00';

    return {
      totalVisits,
      totalConversions,
      totalRevenue,
      avgConversionRate,
      avgOrderValue,
      nodeCount,
    };
  }, [nodes]);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <Card className="border-t bg-card/95 backdrop-blur-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Visits</div>
                <div className="text-lg font-semibold">{metrics.totalVisits.toLocaleString()}</div>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Target className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Conversions</div>
                <div className="text-lg font-semibold">{metrics.totalConversions.toLocaleString()}</div>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg CR</div>
                <div className="text-lg font-semibold">{metrics.avgConversionRate}%</div>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
                <div className="text-lg font-semibold text-success">
                  ${metrics.totalRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {parseFloat(metrics.avgOrderValue) > 0 && (
              <>
                <div className="h-10 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <DollarSign className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Avg AOV</div>
                    <div className="text-lg font-semibold">${metrics.avgOrderValue}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {metrics.nodeCount} {metrics.nodeCount === 1 ? 'node' : 'nodes'}
          </div>
        </div>
      </div>
    </Card>
  );
}
