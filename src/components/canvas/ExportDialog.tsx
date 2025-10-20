import { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  projectName?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  nodes,
  edges,
  projectName = 'funnel',
}: ExportDialogProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const { toast } = useToast();

  const exportAsJSON = () => {
    const data = {
      project: projectName,
      exportDate: new Date().toISOString(),
      nodes: nodes.map((node) => {
        const data = node.data as any;
        return {
          id: node.id,
          type: node.type,
          label: data.label,
          metrics: {
            visits: data.visits,
            conversionRate: data.conversionRate,
            conversions: data.conversions,
            averageOrderValue: data.averageOrderValue,
            revenue: data.revenue,
          },
        };
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        dropOffRate: edge.data?.dropOffRate,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const headers = ['ID', 'Type', 'Label', 'Visits', 'Conversion Rate', 'Conversions', 'AOV', 'Revenue'];
    const rows = nodes.map((node) => {
      const data = node.data as any;
      return [
        node.id,
        node.type || '',
        data.label || '',
        data.visits || 0,
        data.conversionRate || 0,
        data.conversions || 0,
        data.averageOrderValue || 0,
        data.revenue || 0,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (format === 'json') {
      exportAsJSON();
    } else {
      exportAsCSV();
    }

    toast({
      title: 'Export sikeres',
      description: `Az adatok ${format.toUpperCase()} formátumban exportálva.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adatok exportálása</DialogTitle>
          <DialogDescription>
            Válaszd ki az export formátumot és töltsd le a funnel adatokat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'json' | 'csv')}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileJson className="h-4 w-4" />
                <div>
                  <div className="font-medium">JSON</div>
                  <div className="text-xs text-muted-foreground">
                    Teljes adatstruktúra node-okkal és edge-ekkel
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileSpreadsheet className="h-4 w-4" />
                <div>
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-muted-foreground">
                    Táblázatos formátum Excel-hez
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportálás
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
