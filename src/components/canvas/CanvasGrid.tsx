import { memo } from 'react';

interface CanvasGridProps {
  snapToGrid?: boolean;
  gridSize?: number;
}

export const CanvasGrid = memo(({ snapToGrid = true, gridSize = 15 }: CanvasGridProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg width="100%" height="100%" className="opacity-20">
        <defs>
          <pattern
            id="grid-pattern"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={gridSize / 2}
              cy={gridSize / 2}
              r="0.5"
              fill="hsl(var(--muted-foreground))"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
    </div>
  );
});

CanvasGrid.displayName = 'CanvasGrid';
