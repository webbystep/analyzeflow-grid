import { Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Target, ShoppingCart } from 'lucide-react';
import { calculateFunnelMetrics, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/analytics';

interface AnalyticsDashboardProps {
  nodes: Node[];
}

export function AnalyticsDashboard({ nodes }: AnalyticsDashboardProps) {
  const metrics = calculateFunnelMetrics(nodes);

  const stats = [
    {
      title: 'Összes látogató',
      value: formatNumber(metrics.totalVisits),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Összes konverzió',
      value: formatNumber(metrics.totalConversions),
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Összes bevétel',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Átlagos konverzió',
      value: formatPercentage(metrics.averageConversionRate),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Átlagos kosárérték',
      value: formatCurrency(metrics.averageOrderValue),
      icon: ShoppingCart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
