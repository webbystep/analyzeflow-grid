import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeType } from '@/lib/types/canvas';
import { nodeDefinitions, nodeCategories } from '@/lib/nodeDefinitions';

export type { NodeType };

interface InsertNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: NodeType) => void;
}

export function InsertNodeDialog({
  open,
  onClose,
  onSelectType,
}: InsertNodeDialogProps) {
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

  const handleSelect = (type: NodeType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Válassz node típust</DialogTitle>
          <DialogDescription>
            Válaszd ki milyen típusú node-ot szeretnél beszúrni a tölcsérbe
          </DialogDescription>
          
          {/* Keresőmező */}
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Keresés a node-ok között..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
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
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
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
                    <div className="grid grid-cols-2 gap-2 mt-2 ml-3">
                      {nodes.map((node) => {
                        const Icon = node.icon;
                        const color = node.color || category.color;
                        
                        return (
                          <button
                            key={node.type}
                            onClick={() => handleSelect(node.type)}
                            className={cn(
                              "p-3 rounded-lg border-2 text-left transition-all",
                              "hover:border-primary hover:bg-accent/50",
                              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                              "group"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className="p-1.5 rounded flex-shrink-0 group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: `hsl(${color} / 0.2)` }}
                              >
                                <Icon
                                  className="w-4 h-4"
                                  style={{ color: `hsl(${color})` }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm mb-0.5">
                                  {node.label}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {node.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
