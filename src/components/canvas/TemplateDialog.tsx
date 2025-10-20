import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { funnelTemplates, FunnelTemplate } from '@/lib/templates/funnelTemplates';
import { Sparkles, ShoppingCart, Rocket, Users, FileText } from 'lucide-react';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: FunnelTemplate) => void;
}

const categoryIcons = {
  ecommerce: ShoppingCart,
  saas: Rocket,
  leadgen: Users,
  webinar: FileText,
};

const categoryColors = {
  ecommerce: 'bg-warning/10 text-warning',
  saas: 'bg-primary/10 text-primary',
  leadgen: 'bg-success/10 text-success',
  webinar: 'bg-accent/10 text-accent',
};

export function TemplateDialog({ open, onOpenChange, onSelectTemplate }: TemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose a Funnel Template
          </DialogTitle>
          <DialogDescription>
            Start with a pre-built funnel template and customize it to your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {funnelTemplates.map((template) => {
            const Icon = categoryIcons[template.category];
            return (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                onClick={() => {
                  onSelectTemplate(template);
                  onOpenChange(false);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                      <CardDescription className="text-xs">{template.description}</CardDescription>
                    </div>
                    <div className={`p-2 rounded-lg ${categoryColors[template.category]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                    <span className="text-muted-foreground">
                      {template.nodes.length} steps
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Start from Blank Canvas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
