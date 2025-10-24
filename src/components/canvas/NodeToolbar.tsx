import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeType } from '@/lib/types/canvas';
import { nodeDefinitions } from '@/lib/nodeDefinitions';

interface NodeToolbarProps {
  projectId: string;
}

export function NodeToolbar({ projectId }: NodeToolbarProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="w-72 shadow-xl max-h-[calc(100vh-120px)] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Node könyvtár</CardTitle>
        <CardDescription className="text-xs">Húzd a node-okat a canvasra</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-2 pt-2">
        {nodeDefinitions.map((node) => {
          const Icon = node.icon;
          const color = node.color || '215 16% 65%';
          
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => handleDragStart(e, node.type, node.label)}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all group hover:bg-[#2e3031]"
              title={node.description}
              style={{
                borderColor: '#383a3b',
                backgroundColor: `hsl(${color} / 0.05)`
              }}
            >
              <div
                className="p-2 rounded-md flex-shrink-0"
                style={{ backgroundColor: `hsl(${color} / 0.15)` }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: `hsl(${color})` }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: `hsl(${color})` }}>
                  {node.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {node.description}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
