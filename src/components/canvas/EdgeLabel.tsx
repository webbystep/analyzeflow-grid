import { EdgeLabelRenderer, EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { EdgeContextMenu } from './EdgeContextMenu';

interface CustomEdgeProps extends EdgeProps {
  onInsertNode?: (edgeId: string, position: { x: number; y: number }) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [dropOffRate, setDropOffRate] = useState<number>((data?.dropOffRate as number) || 0);
  const [isHovering, setIsHovering] = useState(false);
  
  // Extract handlers from data
  const onInsertNode = (data as any)?.onInsertNode;
  const onDeleteEdge = (data as any)?.onDeleteEdge;

  const handleSave = () => {
    setIsEditing(false);
    // This will be handled by parent component through edge data updates
  };

  const handleInsertClick = () => {
    if (onInsertNode) {
      onInsertNode(id, { x: labelX, y: labelY });
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteEdge) {
      onDeleteEdge(id);
    }
  };

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd}
        style={{
          strokeWidth: 3,
          stroke: 'hsl(var(--primary))',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      />
      {/* Animated flow overlay */}
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={3}
        strokeDasharray="5,10"
        style={{
          animation: 'edge-flow 1s linear infinite',
          opacity: 0.6,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {isEditing ? (
            <Card className="p-2 bg-background shadow-lg">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={dropOffRate.toString()}
                  onChange={(e) => setDropOffRate(Number(e.target.value))}
                  onBlur={handleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') {
                      setDropOffRate((data?.dropOffRate as number) || 0);
                      setIsEditing(false);
                    }
                  }}
                  className="w-20 h-8"
                  autoFocus
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </Card>
          ) : (
            <EdgeContextMenu
              edge={{ id, source: '', target: '', data }}
              onInsertNode={onInsertNode || (() => {})}
              onDeleteEdge={onDeleteEdge || (() => {})}
              labelPosition={{ x: labelX, y: labelY }}
            >
              <div className="relative">
                <div
                  onClick={() => setIsEditing(true)}
                  className="px-2 py-1 bg-background border border-border rounded-md text-xs font-medium cursor-pointer hover:bg-accent transition-colors"
                >
                  {(data?.label as string) || `Drop-off: ${dropOffRate}%`}
                </div>
                {isHovering && onInsertNode && (
                  <button
                    onClick={handleInsertClick}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-200 border-2 border-background"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </EdgeContextMenu>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
