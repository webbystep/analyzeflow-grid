import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Save, TrendingUp, Palette } from 'lucide-react';
import { Node } from '@xyflow/react';
import { toast } from 'sonner';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { IconPicker } from './IconPicker';
import { getDefaultIcon } from '@/lib/nodeMetricTemplates';
import type { NodeType } from '@/lib/types/canvas';
import { getNodeSchema } from '@/lib/nodeSchemas';
import { getNodeDefinition } from '@/lib/nodeDefinitions';

interface InspectorPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
  onClose: () => void;
}

export function InspectorPanel({ selectedNode, onUpdateNode, onClose }: InspectorPanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const schema = getNodeSchema(selectedNode?.type as NodeType);

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
    }
  }, [selectedNode]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    if (!selectedNode || !schema) return;
    
    const updates: any = {
      label: formData.label,
      customText: formData.customText,
      notes: formData.notes,
      revenueMode: formData.revenueMode,
      icon: formData.icon || getDefaultIcon(selectedNode.type as NodeType),
      iconColor: formData.iconColor,
      customIconSvg: formData.customIconSvg,
      meta: {} as Record<string, any>,
      metrics: {} as Record<string, any>
    };

    // Collect meta fields
    if (schema.meta) {
      schema.meta.fields.forEach(field => {
        if (formData[field.id] !== undefined) {
          updates.meta[field.id] = formData[field.id];
        }
      });
    }

    // Collect and calculate metrics
    if (schema.metrics) {
      schema.metrics.fields.forEach(field => {
        if (field.calculate) {
          const value = field.calculate(formData);
          updates.metrics[field.id] = { value, role: field.role };
          updates[field.id] = value;
        } else if (formData[field.id] !== undefined) {
          updates.metrics[field.id] = { value: formData[field.id], role: field.role };
          updates[field.id] = formData[field.id];
        }
      });
    }

    onUpdateNode(selectedNode.id, updates);
    toast.success('Node frissítve');
  };

  if (!selectedNode) {
    return (
      <Card className="w-80 h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Válassz egy node-ot a szerkesztéshez</p>
        </CardContent>
      </Card>
    );
  }

  const nodeDefinition = getNodeDefinition(selectedNode.type as NodeType);
  const Icon = nodeDefinition?.icon;

  return (
    <Card className="w-80 h-full flex flex-col shadow-xl border-l">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
              <CardTitle className="text-lg">{nodeDefinition?.label || selectedNode.type}</CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              <Badge variant="outline" className="text-xs">{selectedNode.type}</Badge>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Tulajdonságok</TabsTrigger>
            <TabsTrigger value="icon"><Palette className="h-4 w-4" /></TabsTrigger>
            {schema?.metrics && <TabsTrigger value="metrics">Mutatók</TabsTrigger>}
          </TabsList>

          <TabsContent value="properties" className="space-y-4 mt-4">
            {schema?.properties && (
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">{schema.properties.label}</h3>
                {schema.properties.fields.map((field) => (
                  <DynamicFieldRenderer
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    allData={formData}
                  />
                ))}
              </div>
            )}
            
            {schema?.meta && (
              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-sm text-muted-foreground">{schema.meta.label}</h3>
                {schema.meta.fields.map((field) => (
                  <DynamicFieldRenderer
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    allData={formData}
                  />
                ))}
              </div>
            )}
            
            {schema?.dataSources && schema.dataSources.length > 0 && (
              <div className="mt-6 p-3 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Támogatott adatforrások: {schema.dataSources.map(ds => ds.label).join(', ')}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="icon" className="space-y-4 mt-4">
            <IconPicker
              currentIcon={formData.icon || getDefaultIcon(selectedNode.type as NodeType)}
              currentColor={formData.iconColor || '#ffffff'}
              customSvg={formData.customIconSvg}
              onIconSelect={(iconName) => handleFieldChange('icon', iconName)}
              onColorChange={(color) => handleFieldChange('iconColor', color)}
              onCustomSvgChange={(svg) => handleFieldChange('customIconSvg', svg)}
            />
          </TabsContent>

          {schema?.metrics && (
            <TabsContent value="metrics" className="space-y-4 mt-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-4">{schema.metrics.label}</h3>
              {schema.metrics.fields.map((field) => (
                <DynamicFieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  allData={formData}
                />
              ))}
            </TabsContent>
          )}
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Változások mentése
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
