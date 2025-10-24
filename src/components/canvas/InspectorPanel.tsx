import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Save, TrendingUp } from 'lucide-react';
import { Node } from '@xyflow/react';
import { getNodeSchema, getDefaultRevenueMode } from '@/lib/nodeSchemas';
import { getNodeDefinition } from '@/lib/nodeDefinitions';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { NodeType } from '@/lib/types/canvas';

interface InspectorPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
  onClose: () => void;
}

export function InspectorPanel({ selectedNode, onUpdateNode, onClose }: InspectorPanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
    }
  }, [selectedNode]);

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

  const schema = getNodeSchema(selectedNode.type as NodeType);
  const nodeDefinition = getNodeDefinition(selectedNode.type as NodeType);

  if (!schema) {
    return (
      <Card className="w-80 h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <p className="text-sm">Schema nem található: {selectedNode.type}</p>
        </CardContent>
      </Card>
    );
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    const updatedData = { ...formData };
    
    // Recalculate all calculated fields
    Object.values(schema.sections).forEach(section => {
      section.fields.forEach(field => {
        if (field.calculate) {
          updatedData[field.id] = field.calculate(updatedData);
        }
      });
    });
    
    // Set default revenueMode if not set
    if (!updatedData.revenueMode) {
      updatedData.revenueMode = getDefaultRevenueMode(selectedNode.type as NodeType);
    }
    
    // Convert valuePerConversion to object structure if it's a number
    if (updatedData.valuePerConversion && typeof updatedData.valuePerConversion === 'number') {
      updatedData.valuePerConversion = {
        value: updatedData.valuePerConversion,
        currency: 'HUF'
      };
    }
    
    onUpdateNode(selectedNode.id, updatedData);
  };

  const Icon = nodeDefinition?.icon;
  const hasMetrics = schema.sections.metrics && schema.sections.metrics.fields.length > 0;
  const hasCosts = schema.sections.costs && schema.sections.costs.fields.length > 0;

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
          <TabsList className={`grid w-full ${hasMetrics && hasCosts ? 'grid-cols-3' : hasMetrics || hasCosts ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="properties">Tulajdonságok</TabsTrigger>
            {hasMetrics && <TabsTrigger value="metrics">Mutatók</TabsTrigger>}
            {hasCosts && <TabsTrigger value="costs">Költségek</TabsTrigger>}
          </TabsList>

          <TabsContent value="properties" className="space-y-4 mt-4">
            {schema.sections.properties.fields.map(field => (
              <DynamicFieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={(val) => handleFieldChange(field.id, val)}
                allData={formData}
              />
            ))}
          </TabsContent>

          {hasMetrics && (
            <TabsContent value="metrics" className="space-y-4 mt-4">
              {schema.sections.metrics!.fields.map(field => {
                // Special rendering for estimatedRevenue field
                if (field.id === 'estimatedRevenue') {
                  const convs = Number(formData.conversions) || Number(formData.submissions) || Number(formData.orders) || 0;
                  const valuePerConv = typeof formData.valuePerConversion === 'object'
                    ? Number(formData.valuePerConversion?.value) || 0
                    : Number(formData.valuePerConversion) || 0;
                  
                  return (
                    <div key={field.id} className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <label className="text-sm font-semibold">{field.label}</label>
                      </div>
                      <DynamicFieldRenderer
                        field={field}
                        value={formData[field.id]}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        allData={formData}
                      />
                      {/* Edge case messages */}
                      {convs === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Jelenleg nincs konverzió. A becsült bevétel 0 Ft.
                        </p>
                      )}
                      {valuePerConv === 0 && convs > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Adj meg konverzió értéket, hogy lásd a becsült bevételt.
                        </p>
                      )}
                    </div>
                  );
                }
                
                return (
                  <DynamicFieldRenderer
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(val) => handleFieldChange(field.id, val)}
                    allData={formData}
                  />
                );
              })}
            </TabsContent>
          )}

          {hasCosts && (
            <TabsContent value="costs" className="space-y-4 mt-4">
              {schema.sections.costs!.fields.map(field => (
                <DynamicFieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(val) => handleFieldChange(field.id, val)}
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

        {schema.dataSourceOptions && schema.dataSourceOptions.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs font-medium mb-2">Elérhető adatforrások:</p>
            <div className="flex flex-wrap gap-1">
              {schema.dataSourceOptions.map(source => (
                <Badge key={source} variant="secondary" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
