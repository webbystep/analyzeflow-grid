import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import * as Phosphor from '@phosphor-icons/react';
import * as SimpleIcons from 'react-icons/si';
import { Node } from '@xyflow/react';
import { toast } from 'sonner';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { IconPicker } from './IconPicker';
import type { NodeType } from '@/lib/types/canvas';
import { getNodeSchema } from '@/lib/nodeSchemas';
import { getNodeDefinition } from '@/lib/nodeDefinitions';
import { cn } from '@/lib/utils';
interface InspectorPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
  onClose: () => void;
}
export function InspectorPanel({
  selectedNode,
  onUpdateNode,
  onClose
}: InspectorPanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const schema = getNodeSchema(selectedNode?.type as NodeType);
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
      setHasChanges(false);
    }
  }, [selectedNode]);
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setHasChanges(true);
  };
  const handleSave = () => {
    if (!selectedNode || !schema) return;
    const updates: any = {
      label: formData.label,
      description: formData.description,
      customText: formData.customText,
      icon: formData.icon
    };

    // Collect meta fields
    if (schema.meta) {
      schema.meta.fields.forEach(field => {
        if (formData[field.id] !== undefined) {
          updates[field.id] = formData[field.id];
        }
      });
    }
    onUpdateNode(selectedNode.id, updates);
    toast.success('Node frissítve');
    setHasChanges(false);
  };
  if (!selectedNode) {
    return <Card className="flex h-full w-80 flex-col rounded-none border-l bg-card text-card-foreground">
        <div className="flex flex-1 items-center justify-center p-6 text-center text-muted-foreground">
          <div>
            <Phosphor.TrendUp size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Válassz egy node-ot a szerkesztéshez</p>
          </div>
        </div>
      </Card>;
  }
  const nodeDefinition = getNodeDefinition(selectedNode.type as NodeType);

  // Helper function to get icon name from node definition
  const getIconNameFromDefinition = (nodeDefinition: any): string => {
    if (!nodeDefinition?.icon) return 'Question';
    // Find the Phosphor component name
    for (const [name, component] of Object.entries(Phosphor)) {
      if (component === nodeDefinition.icon) {
        return name;
      }
    }
    return 'Question';
  };

  // Pontosan ugyanaz a logika, mint a FunnelNode-ban (Phosphor Icons + Simple Icons)
  const getDisplayIcon = () => {
    // Ha van custom SVG, azt használjuk
    if (formData.customIconSvg) {
      return <div className="h-5 w-5" style={{
        color: 'hsl(var(--color-text-primary))'
      }} dangerouslySetInnerHTML={{
        __html: formData.customIconSvg
      }} />;
    }

    // Ha van brand ikon kiválasztva (Simple Icons)
    if (formData.icon?.startsWith('simple:')) {
      const iconName = formData.icon.replace('simple:', '');
      const IconComponent = (SimpleIcons as any)[`Si${iconName}`];
      if (IconComponent) {
        return <IconComponent size={20} style={{
          color: 'hsl(var(--color-text-primary))'
        }} />;
      }
    }

    // Ha van egyéni ikon kiválasztva (Phosphor)
    if (formData.icon && (Phosphor as any)[formData.icon]) {
      const IconComponent = (Phosphor as any)[formData.icon];
      return <IconComponent size={20} style={{
        color: 'hsl(var(--color-text-primary))'
      }} />;
    }

    // Alapértelmezett node típus ikon
    const Icon = nodeDefinition?.icon;
    return Icon ? <Icon size={20} style={{
      color: 'hsl(var(--color-text-primary))'
    }} /> : null;
  };
  return <Card className="w-80 flex flex-col shadow-xl border-t-0 border-b-0 rounded-none h-full bg-card text-card-foreground" style={{
    borderLeftWidth: '1px'
  }}>
      <CardHeader className="pb-3 border-b shrink-0 flex-row items-start justify-between">
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            {getDisplayIcon()}
            <CardTitle className="text-lg">{nodeDefinition?.label || selectedNode.type}</CardTitle>
          </div>
          
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <Phosphor.X size={16} />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-6">
          {/* Alapadatok */}
          <div className="space-y-4">
            {schema?.properties?.fields.map(field => (
              <DynamicFieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={value => handleFieldChange(field.id, value)}
              />
            ))}
          </div>

          {/* Meta / További mezők */}
          {schema?.meta?.fields?.length ? (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-medium">{schema.meta.label || 'További adatok'}</Label>
              {schema.meta.fields.map(field => (
                <DynamicFieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={value => handleFieldChange(field.id, value)}
                />
              ))}
            </div>
          ) : null}

          {/* Ikon választása */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Kiválasztott ikon</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex">
                    <Phosphor.Question size={16} className="text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ez az ikon jelenik meg a node-on</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <IconPicker
              currentIcon={formData.icon || getIconNameFromDefinition(nodeDefinition)}
              onIconSelect={(iconName) => handleFieldChange('icon', iconName)}
            />
          </div>
        </div>
      </CardContent>

      {/* Sticky Save Button */}
      <div className="shrink-0 p-4 border-t" style={{
      backgroundColor: '#222526'
    }}>
        <Button onClick={handleSave} className={cn("w-full transition-colors header-btn-primary", !hasChanges && "opacity-50 cursor-not-allowed")} disabled={!hasChanges}>
          <Phosphor.FloppyDisk size={16} className="mr-2" />
          Változások mentése
        </Button>
      </div>
    </Card>;
}