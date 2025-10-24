import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { MetricField } from '@/lib/nodeMetricTemplates';

interface TemplateMetricsRendererProps {
  metrics: MetricField[];
  data: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
}

export function TemplateMetricsRenderer({ 
  metrics, 
  data, 
  onChange 
}: TemplateMetricsRendererProps) {
  const renderMetricField = (metric: MetricField) => {
    // Calculate value if it's a calculated field
    const value = metric.calculate 
      ? metric.calculate(data)
      : (data[metric.id] || '');

    // Calculated field display
    if (!metric.editable && metric.calculate) {
      return (
        <div key={metric.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground">{metric.label}</Label>
            {metric.help && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{metric.help}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="font-semibold text-lg flex items-center gap-2">
            {value}
            {metric.suffix && <span className="text-sm text-muted-foreground">{metric.suffix}</span>}
          </div>
        </div>
      );
    }

    // Editable field
    return (
      <div key={metric.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={metric.id}>
            {metric.label}
          </Label>
          {metric.help && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{metric.help}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="relative">
          <Input
            id={metric.id}
            type="number"
            value={value}
            onChange={(e) => onChange(metric.id, Number(e.target.value) || 0)}
            placeholder="0"
          />
          {metric.suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              {metric.suffix}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {metrics.map(renderMetricField)}
    </div>
  );
}
