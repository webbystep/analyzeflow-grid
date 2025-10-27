import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X, Save, TrendingUp, Palette, ChevronDown } from 'lucide-react';
import { Node } from '@xyflow/react';
import { toast } from 'sonner';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { IconPicker } from './IconPicker';
import type { NodeType } from '@/lib/types/canvas';
import { getNodeSchema } from '@/lib/nodeSchemas';
import { getNodeDefinition } from '@/lib/nodeDefinitions';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
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
  const [iconSectionOpen, setIconSectionOpen] = useState(false);
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
      icon: formData.icon,
      iconColor: formData.iconColor,
      customIconSvg: formData.customIconSvg
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
            <TrendingUp className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p className="text-sm">Válassz egy node-ot a szerkesztéshez</p>
          </div>
        </div>
      </Card>;
  }
  const nodeDefinition = getNodeDefinition(selectedNode.type as NodeType);
  const nodeDefinitionColor = nodeDefinition?.color || '215 16% 65%';

  // Pontosan ugyanaz a logika, mint a FunnelNode-ban
  const getDisplayIcon = () => {
    // Ha van custom SVG, azt használjuk
    if (formData.customIconSvg) {
      return <div className="h-5 w-5" style={{
        color: `hsl(${nodeDefinitionColor})`
      }} dangerouslySetInnerHTML={{
        __html: formData.customIconSvg
      }} />;
    }

    // Ha van egyéni ikon kiválasztva
    if (formData.icon && formData.icon in LucideIcons) {
      const IconComponent = (LucideIcons as any)[formData.icon];
      return <IconComponent className="h-5 w-5" style={{
        color: `hsl(${nodeDefinitionColor})`
      }} />;
    }

    // Alapértelmezett node típus ikon
    const Icon = nodeDefinition?.icon;
    return Icon ? <Icon className="h-5 w-5" style={{
      color: `hsl(${nodeDefinitionColor})`
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
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-4">
          {/* Alapadatok */}
          <div className="space-y-4">
            
            {schema?.properties?.fields.map(field => <DynamicFieldRenderer key={field.id} field={field} value={formData[field.id]} onChange={value => handleFieldChange(field.id, value)} />)}
          </div>

          {/* Ikon testreszabása */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Ikon testreszabása</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIconSectionOpen(!iconSectionOpen)}
                className="h-8 px-2"
              >
                <Palette className="h-4 w-4 mr-2" />
                {iconSectionOpen ? 'Bezár' : 'Megnyit'}
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 ml-2 transition-transform",
                    iconSectionOpen && "rotate-180"
                  )} 
                />
              </Button>
            </div>

            {iconSectionOpen && (
              <IconPicker
                currentIcon={formData.icon || 'Rocket'}
                currentColor={formData.iconColor || '#000000'}
                customSvg={formData.customIconSvg}
                onIconSelect={(iconName) => handleFieldChange('icon', iconName)}
                onColorChange={(color) => handleFieldChange('iconColor', color)}
                onCustomSvgChange={(svg) => handleFieldChange('customIconSvg', svg)}
              />
            )}
          </div>
        </div>
      </CardContent>

      {/* Sticky Save Button */}
      <div className="shrink-0 p-4 border-t" style={{
      backgroundColor: '#222526'
    }}>
        <Button onClick={handleSave} className={cn("w-full transition-colors header-btn-primary", !hasChanges && "opacity-50 cursor-not-allowed")} disabled={!hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          Változások mentése
        </Button>
      </div>
    </Card>;
}