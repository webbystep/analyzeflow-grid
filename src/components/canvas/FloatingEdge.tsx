import { EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { EdgeContextMenu } from './EdgeContextMenu';

interface CustomEdgeProps extends EdgeProps {
  onInsertNode?: (edgeId: string, position: { x: number; y: number }) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

function getSmartControlPoints(
  sourceX: number,
  sourceY: number,
  sourcePosition: string,
  targetX: number,
  targetY: number,
  targetPosition: string
) {
  const distance = Math.sqrt(
    Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
  );

  const offset = Math.min(distance * 0.3, 150);

  let cp1x = sourceX;
  let cp1y = sourceY;
  let cp2x = targetX;
  let cp2y = targetY;

  if (sourcePosition === 'right') cp1x += offset;
  if (sourcePosition === 'left') cp1x -= offset;
  if (targetPosition === 'right') cp2x += offset;
  if (targetPosition === 'left') cp2x -= offset;

  if (sourcePosition === 'bottom') cp1y += offset;
  if (sourcePosition === 'top') cp1y -= offset;
  if (targetPosition === 'bottom') cp2y += offset;
  if (targetPosition === 'top') cp2y -= offset;

  return { cp1x, cp1y, cp2x, cp2y };
}

function getOptimalHandles(
  sourceNode: { x: number; y: number; width: number; height: number },
  targetNode: { x: number; y: number; width: number; height: number }
) {
  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  
  // Horizontal vs Vertical priority
  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      source: dx > 0 ? 'right' : 'left',
      target: dx > 0 ? 'left' : 'right',
    };
  } else {
    return {
      source: dy > 0 ? 'bottom' : 'top',
      target: dy > 0 ? 'top' : 'bottom',
    };
  }
}

export function FloatingEdge({
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
  const [isEditing, setIsEditing] = useState(false);
  const [dropOffRate, setDropOffRate] = useState<number>((data?.dropOffRate as number) || 0);
  const [isHovering, setIsHovering] = useState(false);

  const onInsertNode = (data as any)?.onInsertNode;
  const onDeleteEdge = (data as any)?.onDeleteEdge;
  const isHighlighted = (data as any)?.isHighlighted || false;
  const allNodes = (data as any)?.allNodes || [];

  // Smart routing: calculate optimal handles based on node positions
  const sourceNode = allNodes.find((n: any) => n.id === source);
  const targetNode = allNodes.find((n: any) => n.id === target);

  let optimalSourcePosition = sourcePosition || 'right';
  let optimalTargetPosition = targetPosition || 'left';

  if (sourceNode && targetNode) {
    const sourceNodeData = {
      x: sourceNode.position.x,
      y: sourceNode.position.y,
      width: 280,
      height: 120,
    };
    const targetNodeData = {
      x: targetNode.position.x,
      y: targetNode.position.y,
      width: 280,
      height: 120,
    };
    
    const optimal = getOptimalHandles(sourceNodeData, targetNodeData);
    optimalSourcePosition = optimal.source;
    optimalTargetPosition = optimal.target;
  }

  const { cp1x, cp1y, cp2x, cp2y } = useMemo(
    () =>
      getSmartControlPoints(
        sourceX,
        sourceY,
        optimalSourcePosition,
        targetX,
        targetY,
        optimalTargetPosition
      ),
    [sourceX, sourceY, optimalSourcePosition, targetX, targetY, optimalTargetPosition]
  );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: optimalSourcePosition as any,
    targetX,
    targetY,
    targetPosition: optimalTargetPosition as any,
    curvature: 0.25,
  });

  const handleSave = () => {
    setIsEditing(false);
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
      <path
        id={id}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: isHighlighted ? 3 : 2,
          stroke: isHighlighted
            ? 'hsl(var(--primary))'
            : 'hsl(var(--muted-foreground) / 0.3)',
          transition: 'all 0.2s ease',
          fill: 'none',
          filter: isHighlighted
            ? 'drop-shadow(0 0 4px hsl(var(--primary) / 0.3))'
            : undefined,
        }}
      />

      {/* Animated flow indicators - show on hover OR when highlighted */}
      {(isHovering || isHighlighted) && (
        <>
          {[0, 0.16, 0.33, 0.5, 0.66, 0.83].map((offset) => (
            <circle
              key={offset}
              r={isHighlighted ? 4 : 3}
              fill="hsl(var(--primary))"
              opacity={0.7}
              style={{ willChange: 'transform' }}
            >
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="linear"
                begin={`${offset * 2}s`}
              >
                <mpath href={`#${id}`} />
              </animateMotion>
            </circle>
          ))}
        </>
      )}

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
