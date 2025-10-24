import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Mail,
  FileText,
  ShoppingCart,
  PartyPopper,
  GitBranch,
  Box,
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
    label: 'Forgalom',
    icon: TrendingUp,
    description: 'Hirdetések, organikus forgalom',
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email sorozatok, hírlevelek',
  },
  {
    type: 'landing',
    label: 'Landoló oldal',
    icon: FileText,
    description: 'Értékesítési, feliratkozási oldalak',
  },
  {
    type: 'checkout',
    label: 'Pénztár',
    icon: ShoppingCart,
    description: 'Fizetés, rendelési űrlapok',
  },
  {
    type: 'thankyou',
    label: 'Köszönöm',
    icon: PartyPopper,
    description: 'Megerősítés, sikeres oldalak',
  },
  {
    type: 'condition',
    label: 'Feltétel/Elágazás',
    icon: GitBranch,
    description: 'A/B tesztek, feltételes logika',
  },
  {
    type: 'custom',
    label: 'Egyedi',
    icon: Box,
    description: 'Saját lépés egyedi leírással',
  },
];

export function NodeToolbar({ projectId }: NodeToolbarProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag preview with fixed positioning
    const dragPreview = document.createElement('div');
    dragPreview.style.position = 'fixed';
    dragPreview.style.top = '-1000px';
    dragPreview.style.left = '-1000px';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.className = 'px-4 py-3 rounded-lg border-2 bg-card shadow-xl min-w-[180px] max-w-[200px]';
    dragPreview.style.borderColor = `hsl(var(--node-${nodeType}))`;
    
    const template = nodeTemplates.find(t => t.type === nodeType);
    const Icon = template?.icon;
    
    dragPreview.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="p-1.5 rounded" style="background-color: hsl(var(--node-${nodeType}) / 0.2)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--node-${nodeType}))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${getIconPath(nodeType)}
          </svg>
        </div>
        <div class="font-semibold text-sm">${label}</div>
      </div>
    `;
    
    document.body.appendChild(dragPreview);
    
    // Center the drag image on cursor
    const rect = dragPreview.getBoundingClientRect();
    event.dataTransfer.setDragImage(dragPreview, rect.width / 2, rect.height / 2);
    
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  const getIconPath = (nodeType: NodeType): string => {
    const paths: Record<NodeType, string> = {
      traffic: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
      email: '<rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
      landing: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline>',
      checkout: '<circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>',
      thankyou: '<path d="M5.8 11.3 2 22l10.7-3.79"></path><path d="M4 3h.01"></path><path d="M22 8h.01"></path><path d="M15 2h.01"></path><path d="M22 20h.01"></path><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"></path><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"></path><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"></path><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"></path>',
      condition: '<line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path>',
      custom: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>',
    };
    return paths[nodeType] || paths.landing;
  };

  return (
    <Card className="w-64 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Node könyvtár</CardTitle>
        <CardDescription className="text-xs">Húzd a node-okat a canvasra</CardDescription>
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
