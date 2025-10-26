import { useState, RefObject } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
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
import { Download, FileJson, FileSpreadsheet, FileImage, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  projectName?: string;
  canvasRef: RefObject<HTMLDivElement>;
}

export function ExportDialog({
  open,
  onOpenChange,
  nodes,
  edges,
  projectName = 'funnel',
  canvasRef,
}: ExportDialogProps) {
  const [format, setFormat] = useState<'json' | 'csv' | 'png' | 'pdf'>('json');
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
          customText: data.customText,
          notes: data.notes,
          icon: data.icon,
          iconColor: data.iconColor,
        };
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
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
    const headers = ['ID', 'Type', 'Label', 'Description', 'Notes'];
    const rows = nodes.map((node) => {
      const data = node.data as any;
      return [
        node.id,
        node.type || '',
        data.label || '',
        data.customText || '',
        data.notes || '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = async () => {
    if (!canvasRef.current) return;
    
    try {
      const dataUrl = await toPng(canvasRef.current, {
        filter: (node) => {
          return !node?.classList?.contains('react-flow__minimap') &&
                 !node?.classList?.contains('react-flow__controls');
        },
      });
      
      const link = document.createElement('a');
      link.download = `${projectName}-canvas-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('PNG export error:', error);
    }
  };

  const exportAsPDF = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const dataUrl = await toPng(canvasRef.current, {
        filter: (node) => {
          return !node?.classList?.contains('react-flow__minimap') &&
                 !node?.classList?.contains('react-flow__controls');
        },
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (img.height * imgWidth) / img.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }
      
      pdf.save(`${projectName}-canvas-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  const handleExport = async () => {
    if (format === 'json') {
      exportAsJSON();
    } else if (format === 'csv') {
      exportAsCSV();
    } else if (format === 'png') {
      await exportAsPNG();
    } else if (format === 'pdf') {
      await exportAsPDF();
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
          <RadioGroup value={format} onValueChange={(value) => setFormat(value as any)}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileJson className="h-4 w-4" />
                <div>
                  <div className="font-medium">JSON</div>
                  <div className="text-xs text-muted-foreground">
                    Teljes adatstruktúra node-okkal és kapcsolatokkal
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
                    Táblázatos formátum Excel-hez (csak node adatok)
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="png" id="png" />
              <Label htmlFor="png" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileImage className="h-4 w-4" />
                <div>
                  <div className="font-medium">PNG kép</div>
                  <div className="text-xs text-muted-foreground">
                    Vizuális canvas prezentációhoz
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileText className="h-4 w-4" />
                <div>
                  <div className="font-medium">PDF dokumentum</div>
                  <div className="text-xs text-muted-foreground">
                    Nyomtatásra kész formátum
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
