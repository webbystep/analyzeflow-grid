import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Mail,
  FileText,
  ShoppingCart,
  PartyPopper,
  GitBranch,
} from 'lucide-react';
import { NodeType } from '@/lib/types/canvas';

interface NodeToolbarProps {
  projectId: string;
}

const nodeTemplates: Array<{
  type: NodeType;
  label: string;
  icon: typeof TrendingUp;
  description: string;
}> = [
  {
    type: 'traffic',
    label: 'Traffic Source',
    icon: TrendingUp,
    description: 'Ad campaigns, organic traffic',
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email sequences, broadcasts',
  },
  {
    type: 'landing',
    label: 'Landing Page',
    icon: FileText,
    description: 'Sales pages, opt-in pages',
  },
  {
    type: 'checkout',
    label: 'Checkout',
    icon: ShoppingCart,
    description: 'Payment, order forms',
  },
  {
    type: 'thankyou',
    label: 'Thank You',
    icon: PartyPopper,
    description: 'Confirmation, success pages',
  },
  {
    type: 'condition',
    label: 'Condition/Split',
    icon: GitBranch,
    description: 'A/B tests, conditional logic',
  },
];

export function NodeToolbar({ projectId }: NodeToolbarProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag preview
    const dragPreview = document.createElement('div');
    dragPreview.className = 'px-4 py-3 rounded-lg border-2 bg-card shadow-lg min-w-[180px]';
    dragPreview.style.borderColor = `hsl(var(--node-${nodeType}))`;
    dragPreview.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="p-1.5 rounded" style="background-color: hsl(var(--node-${nodeType}) / 0.2)">
          <div class="w-4 h-4"></div>
        </div>
        <div class="font-semibold text-sm">${label}</div>
      </div>
    `;
    
    document.body.appendChild(dragPreview);
    event.dataTransfer.setDragImage(dragPreview, 90, 40);
    
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  return (
    <Card className="w-64 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Node Library</CardTitle>
        <CardDescription className="text-xs">Drag nodes onto the canvas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {nodeTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <div
              key={template.type}
              draggable
              onDragStart={(e) => handleDragStart(e, template.type, template.label)}
              className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 cursor-move transition-colors"
            >
              <div
                className="p-2 rounded"
                style={{ backgroundColor: `hsl(var(--node-${template.type}) / 0.2)` }}
              >
                <Icon className="w-4 h-4" style={{ color: `hsl(var(--node-${template.type}))` }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{template.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {template.description}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
