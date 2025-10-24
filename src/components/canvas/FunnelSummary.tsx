import { useMemo } from 'react';
import { Node } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { getNodeSchema, getDefaultRevenueMode } from '@/lib/nodeSchemas';
import { NodeType, RevenueMode } from '@/lib/types/canvas';

interface FunnelSummaryProps {
  nodes: Node[];
}

export function FunnelSummary({ nodes }: FunnelSummaryProps) {
  const metrics = useMemo(() => {
    let totalVisits = 0;
    let totalConversions = 0;
    let directRevenue = 0;      // NEW: Only direct revenue
    let assistedRevenue = 0;    // NEW: Only assisted revenue
    let totalCosts = 0;
    let nodeCount = 0;

    // Role-based aggregation with revenue mode filtering
    nodes.forEach((node) => {
      const nodeType = node.type as NodeType;
      const schema = getNodeSchema(nodeType);
      const nodeData = node.data;

      if (!schema) return;

      nodeCount++;

      // Get revenueMode (use default if not set)
      const revenueMode = (nodeData.revenueMode as RevenueMode) || getDefaultRevenueMode(nodeType);

      // Iterate through all schema sections (properties, meta, metrics)
      const sections = [schema.properties, schema.meta, schema.metrics].filter(Boolean);
      
      sections.forEach(section => {
        if (!section?.fields) return;
        
        section.fields.forEach(field => {
          const value = Number(nodeData[field.id]) || 0;
          
          switch (field.role) {
            case 'visits_input':
              totalVisits += value;
              break;
            case 'conversion_output':
              totalConversions += value;
              break;
            case 'revenue_output':
              // Revenue mode-based splitting
              if (revenueMode === 'direct') {
                directRevenue += value;
              } else if (revenueMode === 'assisted') {
                assistedRevenue += value;
              }
              break;
            case 'cost_input':
            case 'cost_total':
              totalCosts += value;
              break;
          }
        });
      });
    });

    // Calculations
    const totalRevenue = directRevenue; // Bottom bar shows only direct revenue
    const avgConversionRate =
      totalVisits > 0 ? ((totalConversions / totalVisits) * 100).toFixed(2) : '0.00';
    const avgOrderValue =
      totalConversions > 0 ? (totalRevenue / totalConversions).toFixed(0) : '0';
    const netProfit = totalRevenue - totalCosts;
    const roas = totalCosts > 0 ? (totalRevenue / totalCosts).toFixed(2) : '0.00';

    return {
      totalVisits,
      totalConversions,
      totalRevenue,        // This is now only direct revenue
      assistedRevenue,     // Prepared for future use
      totalCosts,
      netProfit,
      roas,
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
                <div className="text-xs text-muted-foreground">Összes látogatás</div>
                <div className="text-lg font-semibold">{metrics.totalVisits.toLocaleString()}</div>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Target className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Konverziók</div>
                <div className="text-lg font-semibold">{metrics.totalConversions.toLocaleString()}</div>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Átlag CR</div>
                <div className="text-lg font-semibold">{metrics.avgConversionRate}%</div>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Összes bevétel</div>
                <div className="text-lg font-semibold text-success">
                  {metrics.totalRevenue.toLocaleString()} Ft
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
                    <div className="text-xs text-muted-foreground">Átlag AOV</div>
                    <div className="text-lg font-semibold">{metrics.avgOrderValue} Ft</div>
                  </div>
                </div>
              </>
            )}

            {metrics.totalCosts > 0 && (
              <>
                <div className="h-10 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <DollarSign className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Összes költség</div>
                    <div className="text-lg font-semibold text-destructive">
                      {metrics.totalCosts.toLocaleString()} Ft
                    </div>
                  </div>
                </div>

                <div className="h-10 w-px bg-border" />
                
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${metrics.netProfit > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <TrendingUp className={`h-4 w-4 ${metrics.netProfit > 0 ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Nettó profit</div>
                    <div className={`text-lg font-semibold ${metrics.netProfit > 0 ? 'text-success' : 'text-destructive'}`}>
                      {metrics.netProfit.toLocaleString()} Ft
                    </div>
                  </div>
                </div>

                <div className="h-10 w-px bg-border" />
                
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">ROAS</div>
                    <div className="text-lg font-semibold">{metrics.roas}x</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {metrics.nodeCount} {metrics.nodeCount === 1 ? 'node' : 'node'}
          </div>
        </div>
      </div>
    </Card>
  );
}
