import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search } from 'lucide-react';
import { NodeType } from '@/lib/types/canvas';
import { nodeDefinitions, nodeCategories } from '@/lib/nodeDefinitions';
import { cn } from '@/lib/utils';

interface NodeToolbarProps {
  projectId: string;
}

export function NodeToolbar({ projectId }: NodeToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core']) // Alap node-ok alapból nyitva
  );

  // Szűrt node-ok keresés alapján
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodeDefinitions;
    
    const query = searchQuery.toLowerCase();
    return nodeDefinitions.filter(
      node =>
        node.label.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Kategóriák szerinti csoportosítás
  const nodesByCategory = useMemo(() => {
    const grouped = new Map<string, typeof nodeDefinitions>();
    
    nodeCategories.forEach(cat => {
      const nodes = filteredNodes.filter(n => n.category === cat.id);
      if (nodes.length > 0) {
        grouped.set(cat.id, nodes);
      }
    });
    
    return grouped;
  }, [filteredNodes]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="w-72 shadow-xl max-h-[calc(100vh-120px)] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Node könyvtár</CardTitle>
        <CardDescription className="text-xs">Húzd a node-okat a canvasra</CardDescription>
        
        {/* Keresőmező */}
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Keresés a node-ok között..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-1">
        {nodesByCategory.size === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Nincs találat
          </div>
        ) : (
          Array.from(nodesByCategory.entries()).map(([categoryId, nodes]) => {
            const category = nodeCategories.find(c => c.id === categoryId);
            if (!category) return null;
            
            const isExpanded = expandedCategories.has(categoryId);
            
            return (
              <Collapsible
                key={categoryId}
                open={isExpanded}
                onOpenChange={() => toggleCategory(categoryId)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: `hsl(${category.color})` }}
                      />
                      <span className="font-semibold text-sm">{category.name}</span>
                      <span className="text-xs text-muted-foreground">({nodes.length})</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="space-y-1 mt-1 ml-2">
                    {nodes.map((node) => {
                      const Icon = node.icon;
                      const color = node.color || category.color;
                      
                      return (
                        <div
                          key={node.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, node.type, node.label)}
                          className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 cursor-move transition-colors group"
                          title={node.description}
                        >
                          <div
                            className="p-1.5 rounded flex-shrink-0"
                            style={{ backgroundColor: `hsl(${color} / 0.2)` }}
                          >
                            <Icon
                              className="w-3.5 h-3.5"
                              style={{ color: `hsl(${color})` }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs">{node.label}</div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {node.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
