import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X, Save, TrendingUp, Palette, ChevronDown, Settings, Facebook, Globe } from 'lucide-react';
import { Node } from '@xyflow/react';
import { toast } from 'sonner';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { IconPicker } from './IconPicker';
import { getDefaultIcon } from '@/lib/nodeMetricTemplates';
import type { NodeType } from '@/lib/types/canvas';
import { getNodeSchema } from '@/lib/nodeSchemas';
import { getNodeDefinition } from '@/lib/nodeDefinitions';
import { cn } from '@/lib/utils';

interface InspectorPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
  onClose: () => void;
}

export function InspectorPanel({ selectedNode, onUpdateNode, onClose }: InspectorPanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    metrics: true,
    calculated: true
  });
  const schema = getNodeSchema(selectedNode?.type as NodeType);

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
      setHasChanges(false);
    }
  }, [selectedNode]);

  // Realtime calculated values for traffic node
  const calculatedMetrics = useMemo(() => {
    if (selectedNode?.type !== 'traffic') return {};
    
    const impressions = Number(formData.impressions) || 0;
    const clicks = Number(formData.clicks) || 0;
    const cpc = Number(formData.cpc) || 0;
    
    const totalCost = clicks * cpc;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    return { totalCost, ctr };
  }, [formData.impressions, formData.clicks, formData.cpc, selectedNode?.type]);

  // Auto-suggest icon based on source name
  useEffect(() => {
    if (selectedNode?.type === 'traffic' && formData.sourceName && !formData.icon) {
      const sourceName = formData.sourceName.toLowerCase();
      let suggestedIcon = '';
      
      if (sourceName.includes('facebook') || sourceName.includes('meta')) {
        suggestedIcon = 'Facebook';
      } else if (sourceName.includes('google')) {
        suggestedIcon = 'Globe';
      } else if (sourceName.includes('tiktok')) {
        suggestedIcon = 'Video';
      }
      
      if (suggestedIcon) {
        handleFieldChange('icon', suggestedIcon);
      }
    }
  }, [formData.sourceName]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setHasChanges(true);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
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

    // Collect and calculate metrics (including realtime calculated values for traffic)
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

    // Add realtime calculated metrics for traffic node
    if (selectedNode.type === 'traffic') {
      updates.metrics.totalCost = { value: calculatedMetrics.totalCost, role: 'cost_total' };
      updates.metrics.ctr = { value: calculatedMetrics.ctr, role: 'rate_output' };
      updates.totalCost = calculatedMetrics.totalCost;
      updates.ctr = calculatedMetrics.ctr;
    }

    onUpdateNode(selectedNode.id, updates);
    toast.success('Node frissítve');
    setHasChanges(false);
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

      <CardContent className="flex-1 overflow-y-auto p-4 pb-20">
        {selectedNode?.type === 'traffic' ? (
          <TooltipProvider>
            <div className="space-y-4">
              {/* A. Alapadatok Section */}
              <Collapsible open={openSections.basic} onOpenChange={() => toggleSection('basic')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <h3 className="font-semibold text-sm">Alapadatok</h3>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.basic && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4 px-1">
                  {schema?.properties?.fields.map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      allData={formData}
                    />
                  ))}
                  {schema?.meta?.fields.map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      allData={formData}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* B. Metrikák Section */}
              <Collapsible open={openSections.metrics} onOpenChange={() => toggleSection('metrics')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <h3 className="font-semibold text-sm">Metrikák (bemeneti adatok)</h3>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.metrics && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4 px-1">
                  {schema?.metrics?.fields.filter(f => !f.readOnly).map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      allData={formData}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* C. Számított értékek Section */}
              <Collapsible open={openSections.calculated} onOpenChange={() => toggleSection('calculated')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <h3 className="font-semibold text-sm">Számított értékek</h3>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.calculated && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-4 px-1">
                  {/* Total Cost */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Összes költség</span>
                        </div>
                        <div className="text-lg font-semibold animate-in fade-in-50 duration-200">
                          {calculatedMetrics.totalCost?.toLocaleString('hu-HU') || 0} <span className="text-sm text-muted-foreground">Ft</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Automatikusan számított érték – kézi szerkesztés nem szükséges</p>
                      <p className="text-xs text-muted-foreground mt-1">Kattintások × CPC</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* CTR */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">CTR (Click-Through Rate)</span>
                        </div>
                        <div className="text-lg font-semibold animate-in fade-in-50 duration-200">
                          {calculatedMetrics.ctr?.toFixed(2) || '0.00'} <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Automatikusan számított érték – kézi szerkesztés nem szükséges</p>
                      <p className="text-xs text-muted-foreground mt-1">(Kattintások / Megjelenések) × 100</p>
                    </TooltipContent>
                  </Tooltip>
                </CollapsibleContent>
              </Collapsible>

              {/* Icon Tab */}
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">Ikon testreszabás</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <IconPicker
                    currentIcon={formData.icon || getDefaultIcon(selectedNode.type as NodeType)}
                    currentColor={formData.iconColor || '#ffffff'}
                    customSvg={formData.customIconSvg}
                    onIconSelect={(iconName) => handleFieldChange('icon', iconName)}
                    onColorChange={(color) => handleFieldChange('iconColor', color)}
                    onCustomSvgChange={(svg) => handleFieldChange('customIconSvg', svg)}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TooltipProvider>
        ) : (
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
        )}
      </CardContent>

      {/* Sticky Save Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button 
          onClick={handleSave} 
          className={cn(
            "w-full transition-colors",
            hasChanges ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          <Save className="mr-2 h-4 w-4" />
          Változások mentése
        </Button>
      </div>
    </Card>
  );
}
