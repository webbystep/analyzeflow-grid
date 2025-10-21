import { EdgeLabelRenderer, EdgeProps, BaseEdge } from '@xyflow/react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { EdgeContextMenu } from './EdgeContextMenu';
import { calculatePath } from '@/lib/pathfinding/astar';
import { generateSVGPath, getPathMidpoint } from '@/lib/pathfinding/pathSmoothing';

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
  source,
  target,
}: EdgeProps) {
  const allNodes = (data as any)?.allNodes || [];
  
  const edgePath = useMemo(() => {
    if (!allNodes || allNodes.length === 0) {
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    }

    const obstacles = allNodes
      .filter((node: any) => node.id !== source && node.id !== target)
      .map((node: any) => ({
        x: node.position.x - 20,
        y: node.position.y - 20,
        width: node.width + 40,
        height: node.height + 40,
      }));

    const pathPoints = calculatePath(
      { x: sourceX, y: sourceY },
      { x: targetX, y: targetY },
      obstacles,
      20
    );

    return generateSVGPath(pathPoints);
  }, [sourceX, sourceY, targetX, targetY, source, target, allNodes]);

  const [labelX, labelY] = useMemo(() => {
    const midpoint = getPathMidpoint(edgePath);
    return [midpoint.x, midpoint.y];
  }, [edgePath]);

  const [isEditing, setIsEditing] = useState(false);
  const [dropOffRate, setDropOffRate] = useState<number>((data?.dropOffRate as number) || 0);
  const [isHovering, setIsHovering] = useState(false);
  
  // Extract handlers and state from data
  const onInsertNode = (data as any)?.onInsertNode;
  const onDeleteEdge = (data as any)?.onDeleteEdge;
  const isHighlighted = (data as any)?.isHighlighted || false;
  const cardinality = (data as any)?.cardinality || { source: '1', target: 'N' };

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
          strokeWidth: isHighlighted ? 4 : 3,
          stroke: 'hsl(var(--muted-foreground))',
          filter: isHighlighted 
            ? 'drop-shadow(0 0 8px hsl(var(--muted-foreground) / 0.6))' 
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          transition: 'all 0.2s ease-out',
        }}
      />
      {/* Animated particles */}
      {[0, 0.5].map((offset) => (
        <circle
          key={offset}
          r={isHighlighted ? 4 : 3}
          fill="hsl(var(--muted-foreground))"
          opacity={0.6}
          style={{ willChange: 'transform' }}
        >
          <animateMotion
            dur={isHighlighted ? "2s" : "3s"}
            repeatCount="indefinite"
            path={edgePath}
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="linear"
            begin={`${offset * (isHighlighted ? 2 : 3)}s`}
          />
        </circle>
      ))}
      
      {/* Connection points */}
      <circle 
        cx={sourceX} 
        cy={sourceY} 
        r={3} 
        fill="hsl(var(--muted-foreground))"
        opacity={0.3}
      />
      <circle 
        cx={targetX} 
        cy={targetY} 
        r={3} 
        fill="hsl(var(--muted-foreground))"
        opacity={0.3}
      />
      
      {/* Cardinality labels */}
      <text
        x={sourceX + (sourcePosition === 'right' ? 15 : -15)}
        y={sourceY - 10}
        className="text-xs fill-muted-foreground font-mono"
        textAnchor={sourcePosition === 'right' ? 'start' : 'end'}
      >
        {cardinality.source}
      </text>
      <text
        x={targetX + (targetPosition === 'left' ? -15 : 15)}
        y={targetY - 10}
        className="text-xs fill-muted-foreground font-mono"
        textAnchor={targetPosition === 'left' ? 'end' : 'start'}
      >
        {cardinality.target}
      </text>
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
                {isHovering && (
                  <>
                    {onInsertNode && (
                      <button
                        onClick={handleInsertClick}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-200 border-2 border-background z-10"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteEdge && (
                      <button
                        onClick={handleDeleteClick}
                        className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-200 border-2 border-background z-10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </EdgeContextMenu>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
