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
}

export function DynamicFieldRenderer({ field, value, onChange }: DynamicFieldRendererProps) {
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
        return (
          <Input
            id={field.id}
            type="number"
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
