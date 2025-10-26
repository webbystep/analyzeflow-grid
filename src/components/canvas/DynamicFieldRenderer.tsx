import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { FieldSchema } from '@/lib/nodeSchemas';

interface DynamicFieldRendererProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  allData?: Record<string, any>;
}

export function DynamicFieldRenderer({ field, value, onChange, allData }: DynamicFieldRendererProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            style={{ backgroundColor: '#2f3031' }}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            style={{ backgroundColor: '#2f3031' }}
          />
        );
      
      case 'number':
      case 'currency':
        return (
          <div className="relative">
            <Input
              id={field.id}
              type="number"
              step={field.step || 1}
              value={value || ''}
              onChange={(e) => onChange(Number(e.target.value) || 0)}
              placeholder={field.placeholder}
              disabled={field.readOnly}
              className={field.readOnly ? 'bg-muted cursor-not-allowed' : ''}
              style={!field.readOnly ? { backgroundColor: '#2f3031' } : undefined}
            />
            {field.suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {field.suffix}
              </span>
            )}
          </div>
        );
      
      case 'percentage':
        return (
          <Input
            id={field.id}
            type="number"
            step={0.01}
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            placeholder={field.placeholder}
            style={{ backgroundColor: '#2f3031' }}
          />
        );
      
      case 'toggle':
        return (
          <Switch
            id={field.id}
            checked={value || false}
            onCheckedChange={onChange}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id={field.id} style={{ backgroundColor: '#2f3031' }}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return null;
    }
  };

  // Calculated field display
  if (field.calculate && allData) {
    const calculatedValue = field.calculate(allData);
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{field.label}</Label>
          {field.help && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{field.help}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="font-semibold text-lg flex items-center gap-2">
          {calculatedValue}
          {field.suffix && <span className="text-sm text-muted-foreground">{field.suffix}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field.id}>
          {field.label} {field.required && <span className="text-destructive">*</span>}
        </Label>
        {field.help && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{field.help}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {renderField()}
    </div>
  );
}
