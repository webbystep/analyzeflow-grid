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
  
  // Cost states
  const [advertising, setAdvertising] = useState('');
  const [content, setContent] = useState('');
  const [tools, setTools] = useState('');
  const [otherCosts, setOtherCosts] = useState('');
  const [emailsSent, setEmailsSent] = useState('');
  const [costPerEmail, setCostPerEmail] = useState('');
  const [smsSent, setSmsSent] = useState('');
  const [costPerSms, setCostPerSms] = useState('');

  useEffect(() => {
    if (selectedNode) {
      const data = selectedNode.data as any;
      setLabel(data.label || '');
      setVisits(data.visits?.toString() || '');
      setConversionRate(data.conversionRate?.toString() || '');
      setAverageOrderValue(data.averageOrderValue?.toString() || '');
      setNotes(data.notes || '');
      
      // Load costs
      setAdvertising(data.costs?.advertising?.toString() || '');
      setContent(data.costs?.content?.toString() || '');
      setTools(data.costs?.tools?.toString() || '');
      setOtherCosts(data.costs?.other?.toString() || '');
      setEmailsSent(data.costs?.emailsSent?.toString() || '');
      setCostPerEmail(data.costs?.costPerEmail?.toString() || '');
      setSmsSent(data.costs?.smsSent?.toString() || '');
      setCostPerSms(data.costs?.costPerSms?.toString() || '');
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

    // Handle costs
    const costs: any = {};
    if (advertising) costs.advertising = parseFloat(advertising);
    if (content) costs.content = parseFloat(content);
    if (tools) costs.tools = parseFloat(tools);
    if (otherCosts) costs.other = parseFloat(otherCosts);
    if (emailsSent) costs.emailsSent = parseInt(emailsSent);
    if (costPerEmail) costs.costPerEmail = parseFloat(costPerEmail);
    if (smsSent) costs.smsSent = parseInt(smsSent);
    if (costPerSms) costs.costPerSms = parseFloat(costPerSms);

    // Calculate total direct costs
    const directCosts = (costs.advertising || 0) + (costs.content || 0) + (costs.tools || 0) + (costs.other || 0);
    const variableCosts = 
      ((costs.emailsSent || 0) * (costs.costPerEmail || 0)) + 
      ((costs.smsSent || 0) * (costs.costPerSms || 0));
    
    costs.total = directCosts + variableCosts;
    
    if (Object.keys(costs).length > 0) {
      updates.costs = costs;
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Tulajdonságok</TabsTrigger>
            <TabsTrigger value="metrics">Mutatók</TabsTrigger>
            <TabsTrigger value="costs">Költségek</TabsTrigger>
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

          <TabsContent value="costs" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">Direkt költségek</h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="advertising">Hirdetési költség (Ft)</Label>
                    <Input
                      id="advertising"
                      type="number"
                      step="1"
                      value={advertising}
                      onChange={(e) => setAdvertising(e.target.value)}
                      placeholder="50000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Facebook, Google Ads erre a lépésre
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Tartalom készítés (Ft)</Label>
                    <Input
                      id="content"
                      type="number"
                      step="1"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="20000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Landing oldal, design, szövegírás
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tools">Eszközök (Ft)</Label>
                    <Input
                      id="tools"
                      type="number"
                      step="1"
                      value={tools}
                      onChange={(e) => setTools(e.target.value)}
                      placeholder="5000"
                    />
                    <p className="text-xs text-muted-foreground">
                      A/B teszt tool, analytics erre a lépésre
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other-costs">Egyéb költségek (Ft)</Label>
                    <Input
                      id="other-costs"
                      type="number"
                      step="1"
                      value={otherCosts}
                      onChange={(e) => setOtherCosts(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Változó költségek</h4>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="emails-sent">Küldött emailek</Label>
                      <Input
                        id="emails-sent"
                        type="number"
                        value={emailsSent}
                        onChange={(e) => setEmailsSent(e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost-per-email">Ft/email</Label>
                      <Input
                        id="cost-per-email"
                        type="number"
                        step="0.01"
                        value={costPerEmail}
                        onChange={(e) => setCostPerEmail(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="sms-sent">Küldött SMS-ek</Label>
                      <Input
                        id="sms-sent"
                        type="number"
                        value={smsSent}
                        onChange={(e) => setSmsSent(e.target.value)}
                        placeholder="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost-per-sms">Ft/SMS</Label>
                      <Input
                        id="cost-per-sms"
                        type="number"
                        step="0.01"
                        value={costPerSms}
                        onChange={(e) => setCostPerSms(e.target.value)}
                        placeholder="20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {(advertising || content || tools || otherCosts || (emailsSent && costPerEmail) || (smsSent && costPerSms)) && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Számított értékek</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Direkt költségek:</span>
                      <span className="font-medium">
                        {(
                          (parseFloat(advertising) || 0) +
                          (parseFloat(content) || 0) +
                          (parseFloat(tools) || 0) +
                          (parseFloat(otherCosts) || 0)
                        ).toLocaleString()} Ft
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Változó költségek:</span>
                      <span className="font-medium">
                        {(
                          ((parseInt(emailsSent) || 0) * (parseFloat(costPerEmail) || 0)) +
                          ((parseInt(smsSent) || 0) * (parseFloat(costPerSms) || 0))
                        ).toLocaleString()} Ft
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Összes költség:</span>
                      <span className="font-semibold text-destructive">
                        {(
                          (parseFloat(advertising) || 0) +
                          (parseFloat(content) || 0) +
                          (parseFloat(tools) || 0) +
                          (parseFloat(otherCosts) || 0) +
                          ((parseInt(emailsSent) || 0) * (parseFloat(costPerEmail) || 0)) +
                          ((parseInt(smsSent) || 0) * (parseFloat(costPerSms) || 0))
                        ).toLocaleString()} Ft
                      </span>
                    </div>
                    
                    {visits && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Költség/látogatás:</span>
                        <span className="font-medium">
                          {(
                            (
                              (parseFloat(advertising) || 0) +
                              (parseFloat(content) || 0) +
                              (parseFloat(tools) || 0) +
                              (parseFloat(otherCosts) || 0) +
                              ((parseInt(emailsSent) || 0) * (parseFloat(costPerEmail) || 0)) +
                              ((parseInt(smsSent) || 0) * (parseFloat(costPerSms) || 0))
                            ) / parseInt(visits)
                          ).toFixed(2)} Ft
                        </span>
                      </div>
                    )}

                    {visits && conversionRate && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CPA (Cost Per Acquisition):</span>
                          <span className="font-medium">
                            {(
                              (
                                (parseFloat(advertising) || 0) +
                                (parseFloat(content) || 0) +
                                (parseFloat(tools) || 0) +
                                (parseFloat(otherCosts) || 0) +
                                ((parseInt(emailsSent) || 0) * (parseFloat(costPerEmail) || 0)) +
                                ((parseInt(smsSent) || 0) * (parseFloat(costPerSms) || 0))
                              ) / Math.round((parseInt(visits) * parseFloat(conversionRate)) / 100)
                            ).toFixed(2)} Ft
                          </span>
                        </div>

                        {averageOrderValue && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ROAS:</span>
                              <span className="font-medium text-success">
                                {(
                                  (Math.round((parseInt(visits) * parseFloat(conversionRate)) / 100) * parseFloat(averageOrderValue)) /
                                  (
                                    (parseFloat(advertising) || 0) +
                                    (parseFloat(content) || 0) +
                                    (parseFloat(tools) || 0) +
                                    (parseFloat(otherCosts) || 0) +
                                    ((parseInt(emailsSent) || 0) * (parseFloat(costPerEmail) || 0)) +
                                    ((parseInt(smsSent) || 0) * (parseFloat(costPerSms) || 0))
                                  )
                                ).toFixed(2)}x
                              </span>
                            </div>

                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-semibold">Profit:</span>
                              <span className={`font-semibold ${
                                (Math.round((parseInt(visits) * parseFloat(conversionRate)) / 100) * parseFloat(averageOrderValue)) -
                                (
                                  (parseFloat(advertising) || 0) +
                                  (parseFloat(content) || 0) +
                                  (parseFloat(tools) || 0) +
                                  (parseFloat(otherCosts) || 0) +
                                  ((parseInt(emailsSent) || 0) * (parseFloat(costPerEmail) || 0)) +
                                  ((parseInt(smsSent) || 0) * (parseFloat(costPerSms) || 0))
                                ) > 0 ? 'text-success' : 'text-destructive'
                              }`}>
                                {(
                                  (Math.round((parseInt(visits) * parseFloat(conversionRate)) / 100) * parseFloat(averageOrderValue)) -
                                  (
                                    (parseFloat(advertising) || 0) +
                                    (parseFloat(content) || 0) +
                                    (parseFloat(tools) || 0) +
                                    (parseFloat(otherCosts) || 0) +
                                    ((parseInt(emailsSent) || 0) * (parseFloat(costPerEmail) || 0)) +
                                    ((parseInt(smsSent) || 0) * (parseFloat(costPerSms) || 0))
                                  )
                                ).toLocaleString()} Ft
                              </span>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
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
