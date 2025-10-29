import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeType } from '@/lib/types/canvas';
import { nodeDefinitions } from '@/lib/nodeDefinitions';
import * as SimpleIcons from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NodeToolbarProps {
  projectId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function NodeToolbar({ projectId, isOpen, onToggle }: NodeToolbarProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      className={`h-full flex flex-col rounded-none border-l-0 border-t-0 border-b-0 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-72' : 'w-12'
      }`}
    >
      <CardHeader className={`pb-3 relative ${isOpen ? 'pr-12' : 'pr-3'}`}>
        {isOpen && (
          <>
            <CardTitle className="text-lg">Node könyvtár</CardTitle>
            <CardDescription className="text-xs">Húzd a node-okat a canvasra</CardDescription>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={`absolute top-3 transition-all duration-300 ${
            isOpen ? 'right-2' : 'right-0 left-0 mx-auto'
          }`}
          title={isOpen ? 'Könyvtár bezárása' : 'Könyvtár megnyitása'}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CardHeader>
      
      <CardContent className={`flex-1 overflow-y-auto space-y-2 pt-6 ${isOpen ? '' : 'px-1'}`}>
        {nodeDefinitions.map((node) => {
          const Icon = node.icon;
          
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => handleDragStart(e, node.type, node.label)}
              className={`flex items-center rounded-lg border cursor-move transition-all group hover:bg-[#383a3b] ${
                isOpen ? 'gap-3 p-3' : 'p-2 justify-center'
              }`}
              title={isOpen ? node.description : `${node.label} - ${node.description}`}
              style={{
                borderColor: '#383a3b'
              }}
            >
              <div className={`rounded-md flex-shrink-0 bg-muted ${isOpen ? 'p-2' : 'p-1.5'}`}>
                <Icon size={isOpen ? 20 : 16} className="text-muted-foreground" />
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0 transition-opacity duration-300">
                  <div className="font-semibold text-sm">
                    {node.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {node.description}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
