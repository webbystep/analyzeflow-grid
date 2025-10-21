import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Save, TrendingUp } from 'lucide-react';
import { Node } from '@xyflow/react';

interface InspectorPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
  onClose: () => void;
}

export function InspectorPanel({ selectedNode, onUpdateNode, onClose }: InspectorPanelProps) {
  const [label, setLabel] = useState('');
  const [visits, setVisits] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [averageOrderValue, setAverageOrderValue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedNode) {
      const data = selectedNode.data as any;
      setLabel(data.label || '');
      setVisits(data.visits?.toString() || '');
      setConversionRate(data.conversionRate?.toString() || '');
      setAverageOrderValue(data.averageOrderValue?.toString() || '');
      setNotes(data.notes || '');
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <Card className="w-80 h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Válassz egy node-ot a részletek megtekintéséhez</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    const updates: any = {
      label,
      notes,
    };

    if (visits) updates.visits = parseInt(visits);
    if (conversionRate) updates.conversionRate = parseFloat(conversionRate);
    if (averageOrderValue) updates.averageOrderValue = parseFloat(averageOrderValue);

    // Calculate conversions and revenue for current node
    if (updates.visits && updates.conversionRate) {
      updates.conversions = Math.round((updates.visits * updates.conversionRate) / 100);
    }
    if (updates.conversions && updates.averageOrderValue) {
      updates.revenue = Math.round(updates.conversions * updates.averageOrderValue);
    }

    onUpdateNode(selectedNode.id, updates);
  };

  return (
    <Card className="w-80 h-full flex flex-col shadow-xl">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">Tulajdonságok</CardTitle>
            <CardDescription className="text-xs mt-1">
              <Badge variant="outline" className="text-xs">
                {selectedNode.type}
              </Badge>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Tulajdonságok</TabsTrigger>
            <TabsTrigger value="metrics">Mutatók</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="node-label">Címke</Label>
              <Input
                id="node-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Node címke"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-notes">Jegyzetek</Label>
              <Textarea
                id="node-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jegyzet erről a lépésről..."
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="node-visits">Látogatások / Forgalom</Label>
              <Input
                id="node-visits"
                type="number"
                value={visits}
                onChange={(e) => setVisits(e.target.value)}
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">
                Látogatók száma ezen a lépésen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-cr">Konverziós ráta (%)</Label>
              <Input
                id="node-cr"
                type="number"
                step="0.1"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                Konvertáló látogatók százaléka
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-aov">Átlagos rendelési érték (Ft)</Label>
              <Input
                id="node-aov"
                type="number"
                step="0.01"
                value={averageOrderValue}
                onChange={(e) => setAverageOrderValue(e.target.value)}
                placeholder="9900"
              />
              <p className="text-xs text-muted-foreground">
                Átlagos bevétel konverziónként
              </p>
            </div>

            {visits && conversionRate && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Számított mutatók</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Konverziók:</span>
                    <span className="font-medium">
                      {Math.round((parseInt(visits) * parseFloat(conversionRate)) / 100).toLocaleString()}
                    </span>
                  </div>
                  {averageOrderValue && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bevétel:</span>
                      <span className="font-medium text-success">
                        {Math.round(
                          (parseInt(visits) * parseFloat(conversionRate) * parseFloat(averageOrderValue)) / 100
                        ).toLocaleString()} Ft
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
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
