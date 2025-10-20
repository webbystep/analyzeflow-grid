import { EdgeLabelRenderer, EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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

  const handleSave = () => {
    setIsEditing(false);
    // This will be handled by parent component through edge data updates
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
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
            <div
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 bg-background border border-border rounded-md text-xs font-medium cursor-pointer hover:bg-accent transition-colors"
            >
              {(data?.label as string) || `Drop-off: ${dropOffRate}%`}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
