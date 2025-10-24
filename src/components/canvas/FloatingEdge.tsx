import { EdgeLabelRenderer, EdgeProps, getBezierPath, useStore, Node, Position } from '@xyflow/react';
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { EdgeContextMenu } from './EdgeContextMenu';

interface CustomEdgeProps extends EdgeProps {
  onInsertNode?: (edgeId: string, position: { x: number; y: number }) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

// Get the intersection point between two nodes
function getNodeIntersection(
  intersectionNode: Node,
  targetNode: Node
): { x: number; y: number } {
  const { width = 280, height = 120 } = intersectionNode.measured || {};
  const { position: intersectionPosition } = intersectionNode;
  const { position: targetPosition } = targetNode;

  const w = width / 2;
  const h = height / 2;

  const x2 = intersectionPosition.x + w;
  const y2 = intersectionPosition.y + h;
  const x1 = targetPosition.x + w;
  const y1 = targetPosition.y + h;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// Determine which side of the node the edge should connect to
function getEdgePosition(node: Node, intersectionPoint: { x: number; y: number }): Position {
  const { width = 280, height = 120 } = node.measured || {};
  const { x, y } = node.position;

  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= x + 1) return Position.Left;
  if (px >= x + width - 1) return Position.Right;
  if (py <= y + 1) return Position.Top;
  if (py >= y + height - 1) return Position.Bottom;

  return Position.Top;
}

// Calculate edge parameters based on node positions
function getEdgeParams(source: Node, target: Node) {
  const sourceIntersection = getNodeIntersection(source, target);
  const targetIntersection = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersection);
  const targetPos = getEdgePosition(target, targetIntersection);

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos,
    targetPos,
  };
}

export function FloatingEdge({
  id,
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

  // Use React Flow store to get node positions
  const sourceNode = useStore(
    useCallback((store) => store.nodeLookup.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeLookup.get(target), [target])
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
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
      {/* Base line - subtle */}
      <path
        id={id}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: 'hsla(var(--color-accent-green-rgb), 0.2)',
          fill: 'none',
        }}
      />
      
      {/* Particle flow line - Liam ERD style */}
      <path
        d={edgePath}
        style={{
          strokeWidth: 2,
          stroke: 'hsl(var(--color-accent-green))',
          fill: 'none',
          strokeDasharray: '4 20',
          animation: `flow ${isHighlighted ? '3s' : '5s'} linear infinite`,
          opacity: isHighlighted ? 1 : 0.6,
        }}
      />

      {/* Animated particles on hover/highlight */}
      {(isHovering || isHighlighted) && (
        <>
          {[0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87].map((offset) => (
            <g key={offset}>
              {/* Glow effect */}
              <circle
                r={isHighlighted ? 6 : 5}
                fill="hsl(var(--color-accent-green))"
                opacity={0.3}
                style={{ filter: 'blur(4px)' }}
              >
                <animateMotion
                  dur={isHighlighted ? "1.5s" : "2s"}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="linear"
                  begin={`${offset * (isHighlighted ? 1.5 : 2)}s`}
                >
                  <mpath href={`#${id}`} />
                </animateMotion>
              </circle>
              {/* Core particle */}
              <circle
                r={isHighlighted ? 3 : 2.5}
                fill="hsl(var(--color-accent-green))"
                opacity={1}
                style={{ willChange: 'transform' }}
              >
                <animateMotion
                  dur={isHighlighted ? "1.5s" : "2s"}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="linear"
                  begin={`${offset * (isHighlighted ? 1.5 : 2)}s`}
                >
                  <mpath href={`#${id}`} />
                </animateMotion>
              </circle>
            </g>
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
